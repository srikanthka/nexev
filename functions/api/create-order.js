/**
 * NexEV — Cloudflare Pages Function
 * POST /api/create-order
 *
 * Creates a Razorpay order server-side.
 * The Razorpay KEY_SECRET never touches the browser.
 * Shipping is calculated server-side from pincode + cart weight.
 *
 * Environment variables required (set in Cloudflare Dashboard):
 *   RAZORPAY_KEY_ID     — rzp_test_... / rzp_live_...
 *   RAZORPAY_KEY_SECRET — xxxxxxxxxxxxxxxxxxxx
 */

/* ═══════════════════════════════════════════════════
   PRODUCTS — prices in paise (₹1 = 100 paise)
   IDs MUST match products.json exactly.
   Prices MUST match products.json (server validates — never trust frontend price).
═══════════════════════════════════════════════════ */
const PRODUCTS = {
  /* ── Kits ── */
  'kit-1s-micro':                 { name: 'Kit A — 1S 3.7V Micro',                          basePrice: 24900,  weightGrams: 80  },
  'kit-1s-fast-charge':           { name: 'Kit B — 1S Fast Charge',                          basePrice: 34900,  weightGrams: 110 },
  'kit-2s-boost':                 { name: 'Kit C — 2S Boost',                                basePrice: 44900,  weightGrams: 150 },
  'kit-3s-12v-backup':            { name: 'Kit D — 3S 12V Backup',                           basePrice: 59900,  weightGrams: 220 },
  'kit-7s-24v-solar-ev':          { name: 'Kit E — 7S 24V Solar & EV',                       basePrice: 129900, weightGrams: 450 },
  'kit-10s-36v-ev-robotics':      { name: 'Kit F — 10S 36V EV Robotics',                     basePrice: 179900, weightGrams: 600 },
  /* ── BMS / PCM boards ── */
  'bms-pcm-1s-3a':                { name: 'BMS / PCM Board (1S — 3A)',                       basePrice: 12900,  weightGrams: 15  },
  'bms-pcm-2s-8a':                { name: 'BMS / PCM Board (2S — 8A)',                       basePrice: 14900,  weightGrams: 15  },
  'bms-pcm-3s-10a':               { name: 'BMS / PCM Board (3S — 10A)',                      basePrice: 19900,  weightGrams: 15  },
  'bms-6s':                       { name: 'BMS Board (6S — 24V)',                             basePrice: 39900,  weightGrams: 80  },
  /* ── Charger modules ── */
  'charger-tp4057-1s-typec':      { name: 'TP4057 1A Li-Ion Charging Board — Type-C',        basePrice: 7900,   weightGrams: 8   },
  'charger-2s-typec-8.4v':        { name: 'Multi-Core 2S Type-C Booster Charger — 8.4V',    basePrice: 14900,  weightGrams: 25  },
  'charger-3s-typec-126v':        { name: 'Multi-Core 3S Type-C Booster Charger — 12.6V',   basePrice: 15900,  weightGrams: 30  },
  /* ── Conductors ── */
  'nickel-strip-1m':              { name: 'Pure Nickel Strip — 1m Roll',                     basePrice: 12900,  weightGrams: 60  },
  'wire-14awg-1m-pair':           { name: '14 AWG Silicone Wire — 1m Pair',                  basePrice: 14900,  weightGrams: 90  },
  /* ── Insulation ── */
  'kapton-tape-20mm':             { name: 'Kapton / Polyimide Tape — 20mm',                  basePrice: 19900,  weightGrams: 120 },
  'pvc-heat-shrink-170mm':        { name: 'PVC Heat Shrink Tube — 170mm',                    basePrice: 8900,   weightGrams: 80  },
  'insulation-paper-barley-rings':{ name: 'Insulation Paper & Barley Rings',                 basePrice: 14900,  weightGrams: 100 },
  /* ── Connectors & holders ── */
  'xt60h-connector':              { name: 'XT60H Connectors',                                 basePrice: 11900,  weightGrams: 25  },
  'cell-holder-18650-abs':        { name: '18650 Cell Holders (ABS)',                         basePrice: 10000,  weightGrams: 80  },
};

/* Bulk pricing tiers — qty threshold → price in paise */
const BULK_TIERS = {
  /* Kits */
  'kit-1s-micro':            [{ qty:5,  price:21900 }, { qty:10, price:18900 }],
  'kit-1s-fast-charge':      [{ qty:5,  price:30900 }, { qty:10, price:27900 }],
  'kit-2s-boost':            [{ qty:5,  price:39900 }, { qty:10, price:36900 }],
  'kit-3s-12v-backup':       [{ qty:5,  price:54900 }, { qty:10, price:49900 }],
  'kit-7s-24v-solar-ev':     [{ qty:3,  price:119900 }, { qty:5, price:109900 }, { qty:10, price:99900  }],
  'kit-10s-36v-ev-robotics': [{ qty:3,  price:164900 }, { qty:5, price:149900 }, { qty:10, price:134900 }],
  /* BMS / PCM boards */
  'bms-pcm-1s-3a':           [{ qty:5,  price:12500 }, { qty:10, price:12000 }, { qty:25, price:10000 }],
  'bms-pcm-2s-8a':           [{ qty:5,  price:14500 }, { qty:10, price:14000 }, { qty:25, price:13000 }],
  'bms-pcm-3s-10a':          [{ qty:5,  price:19000 }, { qty:10, price:18500 }, { qty:25, price:18000 }],
  'bms-6s':                  [{ qty:5,  price:38900 }, { qty:10, price:37900 }, { qty:50, price:34900 }],
  /* Chargers */
  'charger-tp4057-1s-typec': [{ qty:5,  price:7000  }, { qty:10, price:6500  }, { qty:25, price:5900  }],
  'charger-2s-typec-8.4v':   [{ qty:3,  price:13900 }, { qty:5,  price:12900 }, { qty:10, price:11900 }],
  'charger-3s-typec-126v':   [{ qty:3,  price:14900 }, { qty:5,  price:13900 }, { qty:10, price:12900 }],
  /* Conductors */
  'nickel-strip-1m':         [{ qty:5,  price:11500 }, { qty:10, price:9900  }],
  'wire-14awg-1m-pair':      [{ qty:5,  price:12900 }, { qty:10, price:10900 }],
  /* Insulation */
  'kapton-tape-20mm':        [{ qty:10, price:19500 }, { qty:50, price:18500 }],
  'pvc-heat-shrink-170mm':   [{ qty:5,  price:7500  }, { qty:10, price:6500  }],
  'insulation-paper-barley-rings': [{ qty:5, price:12900 }, { qty:10, price:10900 }],
  /* Connectors & holders */
  'xt60h-connector':         [{ qty:5,  price:9900  }, { qty:10, price:8500  }, { qty:25, price:7500  }],
  'cell-holder-18650-abs':   [{ qty:3,  price:9000  }, { qty:10, price:8000  }, { qty:20, price:7500  }],
};

function getUnitPrice(productId, qty) {
  const product = PRODUCTS[productId];
  if (!product) return null;
  const tiers = BULK_TIERS[productId] || [];
  const sorted = [...tiers].sort((a, b) => b.qty - a.qty);
  for (const tier of sorted) {
    if (qty >= tier.qty) return tier.price;
  }
  return product.basePrice;
}

/* ═══════════════════════════════════════════════════
   SHIPPING — mirrors assets/data/shipping-rates.json
   Must stay in sync with the frontend JSON.
═══════════════════════════════════════════════════ */
/* ── Rates in paise — must exactly mirror shop.html inline shippingRates ── */
const SHIPPING_ZONES = {
  local: {
    label: 'Karnataka',
    delivery: '2–3 business days',
    freeAbove: 150000, /* ₹1500 */
    tiers: [
      { maxGrams: 500,   price: 11100 }, /* ₹111 */
      { maxGrams: 1000,  price: 17000 }, /* ₹170 */
      { maxGrams: 2000,  price: 21000 }, /* ₹210 */
      { maxGrams: 5000,  price: 26000 }, /* ₹260 */
      { maxGrams: 99999, price: 22000 }, /* ₹220 */
    ],
    prefixes: [
      '560','561','562','563','564','565','566','567','568','569',
      '570','571','572','573','574','575','576','577','578','579',
      '580','581','582','583','584','585','586','587','588','589',
      '590','591','592','593','594','595','596','597','598','599',
    ],
  },
  metro: {
    label: 'Metro Cities',
    delivery: '3–5 business days',
    freeAbove: 200000, /* ₹2000 */
    tiers: [
      { maxGrams: 500,   price: 13000 }, /* ₹130 */
      { maxGrams: 1000,  price: 11500 }, /* ₹115 */
      { maxGrams: 2000,  price: 16000 }, /* ₹160 */
      { maxGrams: 5000,  price: 24000 }, /* ₹240 */
      { maxGrams: 99999, price: 32000 }, /* ₹320 */
    ],
    prefixes: [
      '110','111','112','113','114','115','116','117','118','119',
      '120','121','122','123','124','125','126','127','128','129',
      '201','202','203',
      '380','381','382',
      '400','401','402','403','404','405','406','407','408','409',
      '410','411','412','413','414','415',
      '500','501','502','503','504','505','506','507','508','509',
      '600','601','602','603','604','605','606','607',
      '700','701','702','703','704','705','706','707','708',
    ],
  },
  remote: {
    label: 'Northeast & Islands',
    delivery: '8–12 business days',
    freeAbove: 999999900, /* never free */
    tiers: [
      { maxGrams: 500,   price: 16000 }, /* ₹160 */
      { maxGrams: 1000,  price: 22000 }, /* ₹220 */
      { maxGrams: 2000,  price: 31000 }, /* ₹310 */
      { maxGrams: 5000,  price: 45000 }, /* ₹450 */
      { maxGrams: 99999, price: 60000 }, /* ₹600 */
    ],
    prefixes: [
      '682','737','744',
      '781','782','783','784','785','786','787','788',
      '791','792','793','794','795','796','797','798','799',
    ],
  },
};

/* regional = fallback (Rest of India) */
const SHIPPING_REGIONAL = {
  label: 'Rest of India',
  delivery: '5–7 business days',
  freeAbove: 250000, /* ₹2500 */
  tiers: [
    { maxGrams: 500,   price: 10000 }, /* ₹100 */
    { maxGrams: 1000,  price: 14500 }, /* ₹145 */
    { maxGrams: 2000,  price: 20000 }, /* ₹200 */
    { maxGrams: 5000,  price: 29000 }, /* ₹290 */
    { maxGrams: 99999, price: 40000 }, /* ₹400 */
  ],
};

function detectZone(pincode) {
  if (!pincode || !/^\d{6}$/.test(pincode)) return null;
  const p = pincode.substring(0, 3);
  for (const [zoneKey, zone] of Object.entries(SHIPPING_ZONES)) {
    if (zone.prefixes.includes(p)) return { key: zoneKey, ...zone };
  }
  return { key: 'regional', ...SHIPPING_REGIONAL };
}

function calcShippingPaise(pincode, totalWeightGrams, subtotalPaise) {
  const zone = detectZone(pincode);
  if (!zone) return { shippingPaise: 0, zone: null, error: 'Invalid pincode' };

  if (subtotalPaise >= zone.freeAbove) {
    return { shippingPaise: 0, zone, isFree: true };
  }

  for (const tier of zone.tiers) {
    if (totalWeightGrams <= tier.maxGrams) {
      return { shippingPaise: tier.price, zone, isFree: false };
    }
  }
  /* fallback — shouldn't reach here, last tier is 99999g */
  return { shippingPaise: zone.tiers[zone.tiers.length - 1].price, zone, isFree: false };
}

/* ═══════════════════════════════════════════════════
   CORS
═══════════════════════════════════════════════════ */
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
}

/* ═══════════════════════════════════════════════════
   MAIN HANDLER
═══════════════════════════════════════════════════ */
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(origin);

  try {
    const body = await request.json();
    const { items, customer } = body;

    /* ── Validate customer ── */
    if (!customer?.name || !customer?.phone || !customer?.email) {
      return new Response(JSON.stringify({ error: 'Missing customer details' }), { status: 400, headers });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers });
    }
    if (!/^\+?[\d\s\-]{10,15}$/.test(customer.phone)) {
      return new Response(JSON.stringify({ error: 'Invalid phone number' }), { status: 400, headers });
    }
    if (!customer.pincode || !/^\d{6}$/.test(customer.pincode)) {
      return new Response(JSON.stringify({ error: 'Invalid pincode — must be 6 digits' }), { status: 400, headers });
    }
    if (!customer.address || customer.address.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Please enter a complete delivery address' }), { status: 400, headers });
    }

    /* ── Validate items and calculate subtotal server-side ── */
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items in order' }), { status: 400, headers });
    }

    let subtotalPaise = 0;
    let totalWeightGrams = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = PRODUCTS[item.id];
      if (!product) {
        return new Response(JSON.stringify({ error: `Unknown product: ${item.id}` }), { status: 400, headers });
      }
      const qty = parseInt(item.qty, 10);
      if (!qty || qty < 1 || qty > 500) {
        return new Response(JSON.stringify({ error: `Invalid quantity for: ${item.id}` }), { status: 400, headers });
      }
      const unitPaise = getUnitPrice(item.id, qty);
      subtotalPaise    += unitPaise * qty;
      totalWeightGrams += product.weightGrams * qty;
      validatedItems.push({ id: item.id, name: product.name, qty, unitPaise });
    }

    /* ── Guard: env vars must be set in Cloudflare Dashboard ── */
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      console.error('Missing env vars: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in Cloudflare Pages');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured. Please contact us on WhatsApp.' }),
        { status: 500, headers }
      );
    }

    /* ── Calculate shipping ── */
    const { shippingPaise, zone, isFree, error: zoneError } = calcShippingPaise(
      customer.pincode,
      totalWeightGrams,
      subtotalPaise
    );
    if (zoneError) {
      return new Response(JSON.stringify({ error: zoneError }), { status: 400, headers });
    }

    const totalPaise = subtotalPaise + shippingPaise;

    /* ── Create Razorpay order ── */
    const rzpCredentials = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const orderPayload = {
      amount:   totalPaise,
      currency: 'INR',
      receipt:  'nexev_' + Date.now(),
      notes: {
        customer_name:    customer.name,
        customer_email:   customer.email,
        customer_phone:   customer.phone,
        customer_address: customer.address,
        customer_pincode: customer.pincode,
        shipping_zone:    zone?.label || 'Unknown',
        shipping_amount:  String(shippingPaise / 100),
        shipping_free:    String(isFree || false),
        items_summary:    validatedItems.map(i => `${i.name} ×${i.qty}`).join(', '),
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
      const errText = await rzpResponse.text();
      console.error(`Razorpay API error [HTTP ${rzpResponse.status}]:`, errText);
      /* 401 = wrong/missing API key  403 = key not authorised  4xx = bad payload */
      const msg = rzpResponse.status === 401 || rzpResponse.status === 403
        ? 'Payment gateway authentication failed — check API keys in Cloudflare Dashboard.'
        : 'Payment gateway error. Please try again.';
      return new Response(JSON.stringify({ error: msg }), { status: 502, headers });
    }

    const rzpOrder = await rzpResponse.json();

    return new Response(JSON.stringify({
      order_id:        rzpOrder.id,
      amount:          rzpOrder.amount,       /* subtotal + shipping, in paise */
      subtotal:        subtotalPaise,
      shipping:        shippingPaise,
      shipping_free:   isFree,
      shipping_zone:   zone?.label,
      shipping_delivery: zone?.delivery,
      currency:        rzpOrder.currency,
      key_id:          env.RAZORPAY_KEY_ID,
      prefill: {
        name:    customer.name,
        email:   customer.email,
        contact: customer.phone,
      },
    }), { status: 200, headers });

  } catch (err) {
    console.error('create-order error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error. Please contact us on WhatsApp.' }),
      { status: 500, headers }
    );
  }
}
