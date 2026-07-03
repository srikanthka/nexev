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
/* Each product mirrors the LIVE catalogue in assets/products/products.js.
   basePrice is GST-INCLUSIVE, in paise. gstRate is the GST % embedded in the
   price (used only to compute the tax breakup for the invoice — GST is NOT
   added on top). Keep this table in exact sync with products.js. */
const PRODUCTS = {
  /* ── Kits ── */
  'kit-1s-micro':                 { name: 'Kit A — 1S 3.7V Micro',                           basePrice: 34900, weightGrams: 150, gstRate: 18 },
  'kit-2s-boost':                 { name: 'Kit B — 2S Boost',                                basePrice: 44900, weightGrams: 150, gstRate: 18 },
  'kit-3s-12v-backup':            { name: 'Kit C — 3S 12V Backup',                           basePrice: 74900, weightGrams: 220, gstRate: 18 },
  /* ── BMS / PCM boards ── */
  'bms-pcm-1s-3a':                { name: 'BMS / PCM Board (1S)',                            basePrice: 14900, weightGrams: 15,  gstRate: 18 },
  'bms-pcm-2s-8a':                { name: 'BMS / PCM Board (2S)',                            basePrice: 16900, weightGrams: 15,  gstRate: 18 },
  'bms-pcm-3s-10a':               { name: 'BMS / PCM Board (3S)',                            basePrice: 19900, weightGrams: 15,  gstRate: 18 },
  /* ── Charger modules ── */
  'charger-tp4057-1s-typec':      { name: 'TP4057 Li-Ion Charging Board — Type-C',           basePrice: 9900,  weightGrams: 8,   gstRate: 18 },
  'charger-2s-typec-8.4v':        { name: 'Multi-Core 2S Type-C Booster Charger — 8.4V',     basePrice: 14900, weightGrams: 25,  gstRate: 18 },
  'charger-3s-typec-126v':        { name: 'Multi-Core 3S Type-C Booster Charger — 12.6V',    basePrice: 15900, weightGrams: 30,  gstRate: 18 },
  /* ── Conductors ── */
  'nickel-strip-1m':              { name: 'Pure Nickel Strip — 1m Roll',                     basePrice: 12500, weightGrams: 60,  gstRate: 18 },
  'wire-14awg-1m-pair':           { name: '14 AWG Silicone Wire — 1m Pair',                  basePrice: 19900, weightGrams: 90,  gstRate: 18 },
  /* ── Insulation ── */
  'kapton-tape-20mm':             { name: 'Kapton / Polyimide Tape — 20mm',                  basePrice: 23000, weightGrams: 120, gstRate: 18 },
  'pvc-heat-shrink-170mm':        { name: 'PVC Heat Shrink Tube — 170mm',                    basePrice: 8000,  weightGrams: 80,  gstRate: 18 },
  'insulation-paper-barley-rings':{ name: '2P Insulation Paper & Barley Rings',              basePrice: 9900,  weightGrams: 100, gstRate: 18 },
  'insulation-barley-paper-50mm': { name: 'Insulation Barley Paper 50 MM',                   basePrice: 8000,  weightGrams: 50,  gstRate: 18 },
  /* ── Connectors & holders ── */
  'xt60h-connector':              { name: 'XT60H Connectors',                                basePrice: 14900, weightGrams: 25,  gstRate: 18 },
  'xt90-connector':               { name: 'XT90 Connectors',                                 basePrice: 13000, weightGrams: 15,  gstRate: 18 },
  'cell-holder-18650-abs':        { name: '18650 Cell Holders (ABS)',                        basePrice: 9900,  weightGrams: 80,  gstRate: 18 },
};

/* Bulk pricing tiers — qty threshold → GST-inclusive price in paise.
   Must exactly mirror the bulk_tiers in products.js. */
const BULK_TIERS = {
  /* Kits */
  'kit-1s-micro':            [{ qty:5,  price:23900 }, { qty:10, price:22900 }],
  'kit-2s-boost':            [{ qty:5,  price:33900 }, { qty:10, price:32900 }],
  'kit-3s-12v-backup':       [{ qty:5,  price:71900 }, { qty:10, price:69900 }],
  /* BMS / PCM boards */
  'bms-pcm-1s-3a':           [{ qty:5,  price:14500 }, { qty:10, price:14000 }, { qty:25, price:13000 }],
  'bms-pcm-2s-8a':           [{ qty:5,  price:16500 }, { qty:10, price:16000 }, { qty:25, price:15000 }],
  'bms-pcm-3s-10a':          [{ qty:5,  price:19000 }, { qty:10, price:18500 }, { qty:25, price:18000 }],
  /* Chargers */
  'charger-tp4057-1s-typec': [{ qty:5,  price:9000  }, { qty:10, price:8500  }, { qty:25, price:8000  }],
  'charger-2s-typec-8.4v':   [{ qty:3,  price:13900 }, { qty:5,  price:12900 }, { qty:10, price:11900 }],
  'charger-3s-typec-126v':   [{ qty:3,  price:14900 }, { qty:5,  price:13900 }, { qty:10, price:12900 }],
  /* Conductors */
  'nickel-strip-1m':         [{ qty:5,  price:11500 }, { qty:10, price:9900  }, { qty:50, price:9000  }],
  'wire-14awg-1m-pair':      [{ qty:10, price:18900 }, { qty:100, price:17900 }],
  /* Insulation */
  'kapton-tape-20mm':        [{ qty:10, price:22000 }, { qty:50, price:19000 }],
  'pvc-heat-shrink-170mm':   [{ qty:10, price:6000  }, { qty:100, price:4500 }],
  'insulation-paper-barley-rings': [{ qty:10, price:8900 }, { qty:50, price:7900 }, { qty:100, price:6900 }],
  'insulation-barley-paper-50mm':  [{ qty:10, price:7000 }, { qty:50, price:6000 }, { qty:100, price:5000 }],
  /* Connectors & holders */
  'xt60h-connector':         [{ qty:10, price:13900 }, { qty:50, price:11900 }, { qty:100, price:8900 }],
  'xt90-connector':          [{ qty:10, price:12500 }, { qty:50, price:12000 }, { qty:100, price:12000 }],
  'cell-holder-18650-abs':   [{ qty:10, price:9000  }, { qty:50, price:8500  }, { qty:100, price:7500 }],
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
   DELHIVERY — pickup pincode mirrors data/shipping.json
   Set DELHIVERY_TOKEN + DELHIVERY_PICKUP_PINCODE in Cloudflare Dashboard.
═══════════════════════════════════════════════════ */
const DELHIVERY_PICKUP_PINCODE = '560048'; /* matches data/shipping.json pickup_pincode */

async function delhiveryIsServiceable(pincode, token) {
  const url = `https://staging-express.delhivery.com/c/api/pin-codes/json/?filter_codes=${pincode}`;
  const res = await fetch(url, { headers: { 'Authorization': `Token ${token}` } });
  if (!res.ok) throw new Error(`Delhivery serviceability HTTP ${res.status}`);
  const data = await res.json();
  const codes = data.delivery_codes || [];
  return codes.length > 0 && codes[0]?.postal_code?.inc === 'Y';
}

async function delhiveryChargesPaise(dPin, oPin, weightGrams, token) {
  const cgm = Math.max(10, weightGrams);
  const url  = `https://staging-express.delhivery.com/api/kinko/v1/invoice/charges/.json?md=E&ss=Delivered&d_pin=${dPin}&o_pin=${oPin}&cgm=${cgm}&pt=Pre-paid`;
  const res  = await fetch(url, {
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Token ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Delhivery charges HTTP ${res.status}`);
  const data = await res.json();
  return Math.round((data.total_amount || 0) * 100); /* ₹ → paise */
}

/* ═══════════════════════════════════════════════════
   SHIPPING (static fallback — used when DELHIVERY_TOKEN is not set)
   Mirrors assets/data/shipping-rates.json.
═══════════════════════════════════════════════════ */
/* ── Rates in paise — must exactly mirror shop.html inline shippingRates ── */
const SHIPPING_ZONES = {
  local: {
    label: 'Karnataka',
    delivery: '2–3 business days',
    freeAbove: 150000, /* ₹1500 */
    tiers: [
      { maxGrams: 500,   price: 11000 }, /* ₹110 */
      { maxGrams: 1000,  price: 17000 }, /* ₹170 */
      { maxGrams: 2000,  price: 21000 }, /* ₹210 */
      { maxGrams: 5000,  price: 26000 }, /* ₹260 */
      { maxGrams: 99999, price: 32000 }, /* ₹320 */
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
      { maxGrams: 1000,  price: 16000 }, /* ₹160 */
      { maxGrams: 2000,  price: 20000 }, /* ₹200 */
      { maxGrams: 5000,  price: 26000 }, /* ₹260 */
      { maxGrams: 99999, price: 34000 }, /* ₹340 */
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
    let gstPaise = 0;            /* GST already embedded in the inclusive prices */
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
      const linePaise = unitPaise * qty;
      /* Extract the GST component from the GST-inclusive line price. */
      const rate = product.gstRate || 0;
      const lineGstPaise = rate > 0 ? Math.round(linePaise - linePaise / (1 + rate / 100)) : 0;
      subtotalPaise    += linePaise;
      gstPaise         += lineGstPaise;
      totalWeightGrams += product.weightGrams * qty;
      validatedItems.push({ id: item.id, name: product.name, qty, unitPaise, gstRate: rate });
    }

    /* ── Guard: env vars must be set in Cloudflare Dashboard ── */
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      console.error('Missing env vars: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in Cloudflare Pages');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured. Please contact us on WhatsApp.' }),
        { status: 500, headers }
      );
    }

    /* ── Calculate shipping via Delhivery (fallback to static rates if token absent) ── */
    let shippingPaise   = 0;
    let shippingZone    = null;
    let shippingIsFree  = false;

    if (env.DELHIVERY_TOKEN) {
      const pickupPin = env.DELHIVERY_PICKUP_PINCODE || DELHIVERY_PICKUP_PINCODE;
      const serviceable = await delhiveryIsServiceable(customer.pincode, env.DELHIVERY_TOKEN);
      if (!serviceable) {
        return new Response(
          JSON.stringify({ error: 'Sorry, delivery is not available to your pincode. Please contact us on WhatsApp.' }),
          { status: 400, headers }
        );
      }
      shippingPaise  = await delhiveryChargesPaise(customer.pincode, pickupPin, totalWeightGrams, env.DELHIVERY_TOKEN);
      shippingZone   = { label: 'Delhivery Express', delivery: '3–7 business days' };
      shippingIsFree = shippingPaise === 0;
    } else {
      /* Static fallback — remove once DELHIVERY_TOKEN is configured */
      console.warn('DELHIVERY_TOKEN not set — using static shipping rates');
      const fallback = calcShippingPaise(customer.pincode, totalWeightGrams, subtotalPaise);
      if (fallback.error) {
        return new Response(JSON.stringify({ error: fallback.error }), { status: 400, headers });
      }
      shippingPaise  = fallback.shippingPaise;
      shippingZone   = fallback.zone;
      shippingIsFree = fallback.isFree;
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
        shipping_zone:    shippingZone?.label || 'Unknown',
        shipping_amount:  String(shippingPaise / 100),
        shipping_free:    String(shippingIsFree || false),
        subtotal_amount:  String(subtotalPaise / 100),
        gst_amount:       String(gstPaise / 100),
        gst_note:         'GST included in item prices',
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
      gst:             gstPaise,              /* GST already included in subtotal */
      shipping:        shippingPaise,
      shipping_free:     shippingIsFree,
      shipping_zone:     shippingZone?.label,
      shipping_delivery: shippingZone?.delivery,
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
