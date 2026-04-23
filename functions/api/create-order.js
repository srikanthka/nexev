/**
 * NexEV — Cloudflare Pages Function
 * POST /api/create-order
 *
 * Creates a Razorpay order server-side.
 * The Razorpay KEY_SECRET never touches the browser.
 *
 * Environment variables required (set in Cloudflare Dashboard):
 *   RAZORPAY_KEY_ID     — rzp_live_xxxxxxxxxxxx
 *   RAZORPAY_KEY_SECRET — xxxxxxxxxxxxxxxxxxxx
 *
 * STATUS: Scaffold ready — activate once Razorpay account is live.
 */

/* ── Products source of truth ── */
/* Prices are validated server-side — NEVER trust the frontend price */
const PRODUCTS = {
  'kit-18650-complete':   { name: '18650 Battery Assembly Kit', basePrice: 89900  }, /* paise */
  'nickel-strip-1m':      { name: 'Nickel Strip 1M',            basePrice: 12900  },
  'wire-14awg-1m-pair':   { name: '14 AWG Wire 1m Pair',        basePrice: 14900  },
  'pvc-heat-shrink-170mm':{ name: 'PVC Heat Shrink 170mm',      basePrice: 8900   },
  'kapton-tape-25mm':     { name: 'Kapton Tape 25mm',           basePrice: 19900  },
  'insulation-rings-100pk':{ name:'18650 Insulation Rings 100pk',basePrice: 7900  },
  'insulation-paper-roll':{ name: 'Insulation Paper Roll',      basePrice: 9900   },
  'xt60h-connector-pair': { name: 'Amass XT60H Connectors',     basePrice: 11900  },
  'battery-holder-80650': { name: '80650 Battery Holders 10pk', basePrice: 14900  },
};

const BULK_TIERS = {
  'kit-18650-complete':   [{qty:5,price:84900},{qty:10,price:79900},{qty:25,price:74900}],
  'xt60h-connector-pair': [{qty:5,price:9900},{qty:10,price:8500},{qty:25,price:7500}],
  'nickel-strip-1m':      [{qty:5,price:11500},{qty:10,price:9900}],
};

function getUnitPrice(productId, qty) {
  const tiers = BULK_TIERS[productId];
  if (!tiers) return PRODUCTS[productId]?.basePrice;
  const sorted = [...tiers].sort((a, b) => b.qty - a.qty);
  for (const tier of sorted) {
    if (qty >= tier.qty) return tier.price;
  }
  return PRODUCTS[productId]?.basePrice;
}

function corsHeaders(origin) {
  const allowed = [
    'https://nexev.in',
    'https://www.nexev.in',
    'http://localhost:8788',  /* wrangler pages dev default */
    'http://localhost:3000',
    'http://localhost:5500',  /* Live Server / VS Code */
    'http://127.0.0.1:5500',
  ];
  const originOk = allowed.includes(origin) ? origin : 'https://nexev.in';
  return {
    'Access-Control-Allow-Origin': originOk,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(origin);

  try {
    /* ── Parse body ── */
    const body = await request.json();
    const { items, customer } = body;

    /* ── Validate customer ── */
    if (!customer?.name || !customer?.phone || !customer?.email) {
      return new Response(JSON.stringify({ error: 'Missing customer details' }), { status: 400, headers });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers });
    }
    if (!/^\+?[\d\s\-]{10,15}$/.test(customer.phone)) {
      return new Response(JSON.stringify({ error: 'Invalid phone' }), { status: 400, headers });
    }

    /* ── Validate items and calculate total server-side ── */
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items in order' }), { status: 400, headers });
    }
    let totalPaise = 0;
    const validatedItems = [];
    for (const item of items) {
      const product = PRODUCTS[item.id];
      if (!product) {
        return new Response(JSON.stringify({ error: 'Unknown product: ' + item.id }), { status: 400, headers });
      }
      const qty = parseInt(item.qty, 10);
      if (!qty || qty < 1 || qty > 500) {
        return new Response(JSON.stringify({ error: 'Invalid quantity for: ' + item.id }), { status: 400, headers });
      }
      const unitPaise = getUnitPrice(item.id, qty);
      totalPaise += unitPaise * qty;
      validatedItems.push({ id: item.id, name: product.name, qty, unitPaise });
    }

    /* ── Create Razorpay order ── */
    const rzpCredentials = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const orderPayload = {
      amount: totalPaise,
      currency: 'INR',
      receipt: 'nexev_' + Date.now(),
      notes: {
        customer_name:  customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items_summary:  validatedItems.map(i => `${i.name} x${i.qty}`).join(', '),
      },
    };

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${rzpCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!rzpResponse.ok) {
      const err = await rzpResponse.text();
      console.error('Razorpay error:', err);
      return new Response(JSON.stringify({ error: 'Payment gateway error. Please try again.' }), { status: 502, headers });
    }

    const rzpOrder = await rzpResponse.json();

    return new Response(JSON.stringify({
      order_id:   rzpOrder.id,
      amount:     rzpOrder.amount,
      currency:   rzpOrder.currency,
      key_id:     env.RAZORPAY_KEY_ID,
      prefill: {
        name:    customer.name,
        email:   customer.email,
        contact: customer.phone,
      },
    }), { status: 200, headers });

  } catch (err) {
    console.error('create-order error:', err);
    return new Response(JSON.stringify({ error: 'Server error. Please contact us on WhatsApp.' }), { status: 500, headers });
  }
}
