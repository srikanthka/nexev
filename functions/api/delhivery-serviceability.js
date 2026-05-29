/**
 * NexEV — Cloudflare Pages Function
 * GET /api/delhivery-serviceability?pincode=560001
 *
 * Proxies Delhivery pincode serviceability check.
 * Keeps DELHIVERY_TOKEN server-side — never exposed to the browser.
 *
 * Environment variables required (Cloudflare Dashboard):
 *   DELHIVERY_TOKEN — API token from Delhivery dashboard
 */

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

  const url     = new URL(request.url);
  const pincode = url.searchParams.get('pincode');

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return new Response(JSON.stringify({ error: 'Invalid pincode', serviceable: false }), { status: 400, headers });
  }

  if (!env.DELHIVERY_TOKEN) {
    console.error('DELHIVERY_TOKEN env var not set in Cloudflare Dashboard');
    return new Response(
      JSON.stringify({ error: 'Shipping API not configured', serviceable: false }),
      { status: 500, headers }
    );
  }

  try {
    const apiUrl  = `https://staging-express.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`;
    const res     = await fetch(apiUrl, {
      headers: { 'Authorization': `Token ${env.DELHIVERY_TOKEN}` },
    });

    if (!res.ok) {
      console.error(`Delhivery serviceability API HTTP ${res.status}`);
      return new Response(JSON.stringify({ serviceable: false, error: `Delhivery API error (${res.status})` }), { status: 200, headers });
    }

    const data         = await res.json();
    const deliveryCodes = data.delivery_codes || [];
    const postal        = deliveryCodes[0]?.postal_code || null;
    const serviceable   = deliveryCodes.length > 0 && postal?.inc === 'Y';

    return new Response(JSON.stringify({
      serviceable,
      is_oda:        postal?.is_oda === 'Y',
      cod_available: postal?.cod === 'Y',
      pre_paid:      postal?.pre_paid === 'Y',
    }), { status: 200, headers });

  } catch (err) {
    console.error('delhivery-serviceability error:', err);
    return new Response(JSON.stringify({ serviceable: false, error: 'Server error' }), { status: 500, headers });
  }
}
