/**
 * NexEV — Cloudflare Pages Function
 * GET /api/delhivery-charges?d_pin=110053&cgm=500
 *
 * Proxies Delhivery shipping charge calculation.
 * Pickup pincode is fixed (configured in data/shipping.json).
 * Keeps DELHIVERY_TOKEN server-side — never exposed to the browser.
 *
 * Environment variables required (Cloudflare Dashboard):
 *   DELHIVERY_TOKEN          — API token from Delhivery dashboard
 *   DELHIVERY_PICKUP_PINCODE — Origin/pickup pincode (must match data/shipping.json → pickup_pincode)
 */

/* Default mirrors data/shipping.json → pickup_pincode */
const DEFAULT_PICKUP_PINCODE = '560048';

function corsHeaders(origin) {
  const allowed = [
    'https://nexev.in',
    'https://www.nexev.in',
    'http://localhost:8788',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ];
  const originOk = allowed.includes(origin) ? origin : 'https://nexev.in';
  return {
    'Access-Control-Allow-Origin': originOk,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
}

export async function onRequestGet({ request, env }) {
  const origin  = request.headers.get('Origin');
  const headers = corsHeaders(origin);

  const url   = new URL(request.url);
  const d_pin = url.searchParams.get('d_pin');
  const cgm   = url.searchParams.get('cgm');

  if (!d_pin || !/^\d{6}$/.test(d_pin)) {
    return new Response(JSON.stringify({ error: 'Invalid destination pincode' }), { status: 400, headers });
  }

  if (!env.DELHIVERY_TOKEN) {
    console.error('DELHIVERY_TOKEN env var not set in Cloudflare Dashboard');
    return new Response(JSON.stringify({ error: 'Shipping API not configured' }), { status: 500, headers });
  }

  const pickupPin   = env.DELHIVERY_PICKUP_PINCODE || DEFAULT_PICKUP_PINCODE;
  const weightGrams = Math.max(10, parseInt(cgm, 10) || 100);

  try {
    const apiUrl = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=E&ss=Delivered&d_pin=${d_pin}&o_pin=${pickupPin}&cgm=${weightGrams}&pt=Pre-paid`;
    const res    = await fetch(apiUrl, {
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Token ${env.DELHIVERY_TOKEN}`,
      },
    });

    if (!res.ok) {
      console.error(`Delhivery charges API HTTP ${res.status}`);
      return new Response(JSON.stringify({ error: `Delhivery API error (${res.status})` }), { status: 200, headers });
    }

    const data = await res.json();
    const entry = Array.isArray(data) ? data[0] : data;
    return new Response(JSON.stringify({
      total_amount:   entry.total_amount || 0,
      freight_charge: entry.charge_DL    || 0,
    }), { status: 200, headers });

  } catch (err) {
    console.error('delhivery-charges error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers });
  }
}
