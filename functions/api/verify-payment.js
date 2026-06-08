/**
 * NexEV — Cloudflare Pages Function
 * POST /api/verify-payment
 *
 * Handles TWO distinct flows:
 *
 *  A) STANDARD CHECKOUT (browser → server)
 *     Called by shop.html after Razorpay modal succeeds.
 *     Body:  { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *     Algo:  HMAC-SHA256( order_id + "|" + payment_id , RAZORPAY_KEY_SECRET )
 *     Returns: { verified: true } or 400
 *
 *  B) RAZORPAY WEBHOOK (Razorpay → server)
 *     Sent automatically by Razorpay after payment.captured / order.paid.
 *     Identified by presence of x-razorpay-signature header.
 *     Algo:  HMAC-SHA256( raw-body , RAZORPAY_WEBHOOK_SECRET )
 *     Returns: { status: "ok" } or 403
 *
 * Environment variables (set in Cloudflare Dashboard + .dev.vars):
 *   RAZORPAY_KEY_ID         — rzp_test_...
 *   RAZORPAY_KEY_SECRET     — used for Standard Checkout verification
 *   RAZORPAY_WEBHOOK_SECRET — set in Razorpay Dashboard → Webhooks
 *   OWNER_WHATSAPP          — E.164 number without + (e.g. 919905603640)
 */

/* ─────────────────────────────────────────
   CORS (only needed for browser → server calls)
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   HMAC-SHA256 helpers
───────────────────────────────────────── */
async function hmacSHA256sign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSHA256verify(data, hexSignature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['verify']
  );
  const sigBytes = hexToBytes(hexSignature);
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/* Constant-time string comparison (avoids timing attacks) */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ─────────────────────────────────────────
   FLOW A — Standard Checkout Verification
   Called from browser after Razorpay modal
───────────────────────────────────────── */
async function handleStandardCheckout({ request, env }) {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(origin);

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

  /* ── Validate required fields ── */
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature' }),
      { status: 400, headers }
    );
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    console.error('RAZORPAY_KEY_SECRET env var not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers });
  }

  /* ── Verify signature ── */
  /* Razorpay Standard Checkout: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET) */
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = await hmacSHA256sign(payload, env.RAZORPAY_KEY_SECRET);

  if (!safeEqual(expectedSignature, razorpay_signature)) {
    console.error('Standard checkout signature mismatch', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
    return new Response(
      JSON.stringify({ error: 'Payment verification failed. Do not fulfil this order.' }),
      { status: 400, headers }
    );
  }

  console.log('✅ Standard checkout verified:', razorpay_payment_id, 'for order:', razorpay_order_id);

  return new Response(
    JSON.stringify({
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    }),
    { status: 200, headers }
  );
}

/* ─────────────────────────────────────────
   FLOW B — Razorpay Webhook
   Called server-to-server by Razorpay
───────────────────────────────────────── */
async function sendOwnerWhatsApp(env, orderData) {
  /* Placeholder — integrate Twilio/Wati/Interakt for automated sends */
  const msg = [
    '🛍️ *New NexEV Order!*',
    '',
    `Order ID: ${orderData.order_id}`,
    `Payment ID: ${orderData.payment_id}`,
    `Amount: ₹${(orderData.amount / 100).toLocaleString('en-IN')}`,
    '',
    `Customer: ${orderData.customer_name}`,
    `Phone: ${orderData.customer_phone}`,
    `Email: ${orderData.customer_email}`,
    '',
    `Items: ${orderData.items_summary}`,
    '',
    'Please confirm and arrange dispatch.',
  ].join('\n');
  console.log('OWNER ALERT:', msg);
  /* TODO: POST to WhatsApp Business API */
}

async function sendCustomerWhatsApp(env, orderData) {
  const msg = [
    `Hi ${orderData.customer_name}! 👋`,
    '',
    '✅ Your NexEV order has been confirmed!',
    '',
    `Order ID: ${orderData.order_id}`,
    `Amount paid: ₹${(orderData.amount / 100).toLocaleString('en-IN')}`,
    '',
    "We'll pack and dispatch within 2 business days from Bengaluru, Karnataka.",
    "You'll receive a tracking number here once shipped.",
    '',
    'Questions? Reply to this message anytime.',
    '',
    '— NexEV Team',
  ].join('\n');
  console.log('CUSTOMER ALERT to', orderData.customer_phone, ':', msg);
  /* TODO: POST to WhatsApp Business API */
}

async function handleWebhook({ request, env }) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature) {
    return new Response('Missing x-razorpay-signature header', { status: 400 });
  }
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET env var not set');
    return new Response('Server configuration error', { status: 500 });
  }

  /* Verify webhook signature */
  const valid = await hmacSHA256verify(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
  if (!valid) {
    console.error('Invalid Razorpay webhook signature — possible spoofing attempt');
    return new Response('Invalid signature', { status: 403 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON payload', { status: 400 });
  }
  console.log('Webhook event:', event.event);

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const payment = event.payload?.payment?.entity || {};
    const order   = event.payload?.order?.entity   || {};
    const notes   = order.notes || payment.notes   || {};

    const orderData = {
      order_id:       order.id   || payment.order_id,
      payment_id:     payment.id,
      amount:         payment.amount || order.amount,
      customer_name:  notes.customer_name  || payment.email?.split('@')[0] || 'Customer',
      customer_email: notes.customer_email || payment.email || '',
      customer_phone: notes.customer_phone || payment.contact || '',
      items_summary:  notes.items_summary  || 'See order details',
    };

    await Promise.allSettled([
      sendOwnerWhatsApp(env, orderData),
      sendCustomerWhatsApp(env, orderData),
    ]);

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ status: 'ignored', event: event.event }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/* ─────────────────────────────────────────
   ROUTER
───────────────────────────────────────── */
export async function onRequestPost(context) {
  const { request } = context;

  /* If x-razorpay-signature header is present → Razorpay webhook */
  /* Otherwise → Standard Checkout browser verification             */
  const isWebhook = !!request.headers.get('x-razorpay-signature');

  try {
    return isWebhook
      ? await handleWebhook(context)
      : await handleStandardCheckout(context);
  } catch (err) {
    console.error('verify-payment error:', err);
    const headers = { 'Content-Type': 'application/json' };
    if (!isWebhook) headers['Access-Control-Allow-Origin'] = '*';
    return new Response(JSON.stringify({ error: 'Server error. Please contact us on WhatsApp.' }), {
      status: 500,
      headers,
    });
  }
}

/* Reject non-POST methods */
export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405 });
}
