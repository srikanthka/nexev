/**
 * Cloudflare Pages Function: POST /api/send-status-email
 *
 * Sends order status notification emails via Resend.
 * Called from admin.html whenever status changes to:
 *   shipped | delivered | cancelled | refunded
 *
 * Body:
 * {
 *   type:    'shipped' | 'delivered' | 'cancelled' | 'refunded',
 *   orderId: 'ORD-XXXXXXXX',   // display-formatted ID
 *   order: {
 *     name, email, items[], total, subtotal, shipping,
 *     paymentMethod, address, pincode, state,
 *     trackingNumber?, trackingUrl?, notes?
 *   }
 * }
 *
 * Env vars: RESEND_API_KEY, EMAIL_FROM
 */
export async function onRequestPost(context) {
  try {
    const env = context.env;
    if (!env.RESEND_API_KEY) return json({ error: 'RESEND_API_KEY not configured' }, 500);

    const { type, orderId, order } = await context.request.json();
    if (!type || !order?.email) return json({ error: 'type and order.email required' }, 400);

    const from = env.EMAIL_FROM || 'NexEV <orders@nexev.in>';
    const cfg  = emailConfig(type, orderId, order);
    if (!cfg) return json({ error: `Unknown email type: ${type}` }, 400);

    const resp = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from,
        to:      [order.email],
        subject: cfg.subject,
        html:    cfg.html,
      }),
    });

    const result = await resp.json();
    return json(result, resp.status);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

function fmtInr(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function emailConfig(type, orderId, order) {
  switch (type) {
    case 'shipped':   return { subject: `Your NexEV order ${orderId} is on its way! 🚚`,    html: shippedHtml(orderId, order) };
    case 'delivered': return { subject: `Your NexEV order ${orderId} has been delivered ✅`, html: deliveredHtml(orderId, order) };
    case 'cancelled': return { subject: `NexEV order ${orderId} has been cancelled`,         html: cancelledHtml(orderId, order) };
    case 'refunded':  return { subject: `NexEV refund initiated for ${orderId} 💰`,          html: refundedHtml(orderId, order) };
    default: return null;
  }
}

/* ────────────────────────────────────────────────
   SHARED LAYOUT HELPERS
──────────────────────────────────────────────── */
function wrap(headerAccent, headerIcon, headerLabel, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NexEV Order Update</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;color:#1e293b">
<div style="max-width:580px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f2540,#1a3a5c);padding:2rem;text-align:center">
    <div style="font-size:1.5rem;font-weight:800;color:#fff;font-family:Georgia,serif">
      nex<span style="color:#22c55e">EV</span>
    </div>
    <div style="margin-top:.75rem">
      <span style="display:inline-block;background:${headerAccent.bg};color:${headerAccent.color};border:1px solid ${headerAccent.border};border-radius:20px;padding:.3rem .9rem;font-size:.8rem;font-weight:700">
        ${headerIcon} ${headerLabel}
      </span>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:2rem">
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0"/>
    <p style="font-size:.8rem;color:#94a3b8;margin:0">
      Questions?&nbsp;
      <a href="mailto:service@nexev.in" style="color:#1a3a5c;font-weight:600">service@nexev.in</a>
      &nbsp;·&nbsp;
      <a href="https://wa.me/919019901711" style="color:#1a3a5c;font-weight:600">WhatsApp +91 90199 01711</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:1rem 2rem;text-align:center;border-top:1px solid #e2e8f0;font-size:.72rem;color:#94a3b8">
    NexEV Private Limited &middot; GSTIN: 29AALCN2942C1ZF &middot; Bengaluru, Karnataka, India
  </div>
</div>
</body></html>`;
}

function infoBlock(rows) {
  return rows.filter(r => r[1]).map(([k, v]) =>
    `<div style="margin-bottom:.55rem">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b">${k}</div>
      <div style="font-size:.85rem;color:#1e293b">${v}</div>
    </div>`
  ).join('');
}

function itemsTable(items = []) {
  if (!items.length) return '';
  const rows = items.map(i =>
    `<tr>
      <td style="padding:.35rem .4rem .35rem 0;border-bottom:1px solid #e2e8f0;font-size:.82rem">${i.name}</td>
      <td style="padding:.35rem .4rem;border-bottom:1px solid #e2e8f0;font-size:.82rem;text-align:center">×${i.qty}</td>
      <td style="padding:.35rem 0 .35rem .4rem;border-bottom:1px solid #e2e8f0;font-size:.82rem;text-align:right;font-weight:600">${fmtInr(i.price * i.qty)}</td>
    </tr>`
  ).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:1rem 0 .5rem">
    <thead><tr>
      <th style="text-align:left;padding:.25rem 0;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0">Item</th>
      <th style="padding:.25rem .4rem;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0;text-align:center">Qty</th>
      <th style="text-align:right;padding:.25rem 0;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/* ────────────────────────────────────────────────
   1. SHIPPED
──────────────────────────────────────────────── */
function shippedHtml(orderId, o) {
  const trackBtn = (o.trackingNumber && o.trackingUrl)
    ? `<div style="text-align:center;margin:1.25rem 0">
        <a href="${o.trackingUrl}" style="display:inline-block;background:#1a3a5c;color:#fff;font-weight:700;font-size:.875rem;padding:.75rem 1.75rem;border-radius:10px;text-decoration:none">
          Track My Order →
        </a>
       </div>`
    : (o.trackingNumber
        ? `<p style="font-size:.85rem;margin:.6rem 0">Tracking number: <strong style="font-family:monospace">${o.trackingNumber}</strong></p>`
        : '');

  const body = `
    <p style="font-size:.95rem;margin:0 0 .5rem">Hi <strong>${o.name}</strong>,</p>
    <p style="font-size:.875rem;color:#475569;margin:0 0 1.25rem;line-height:1.65">
      Great news! Your order <strong>${orderId}</strong> has been dispatched and is on its way to you.
    </p>
    ${trackBtn}
    ${infoBlock([
      ['Order ID',     orderId],
      ['Delivery to',  o.address + (o.pincode ? ', ' + o.pincode : '') + (o.state ? ', ' + o.state : '')],
    ])}
    <div style="background:#f0fdf4;border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:.75rem 1rem;margin-top:1rem;font-size:.82rem;color:#166534">
      📱 You will receive a WhatsApp message from us with live tracking updates.
    </div>`;

  return wrap(
    { bg: 'rgba(3,105,161,.12)', color: '#0369a1', border: 'rgba(3,105,161,.3)' },
    '🚚', 'Order Shipped', body
  );
}

/* ────────────────────────────────────────────────
   2. DELIVERED
──────────────────────────────────────────────── */
function deliveredHtml(orderId, o) {
  const body = `
    <p style="font-size:.95rem;margin:0 0 .5rem">Hi <strong>${o.name}</strong>,</p>
    <p style="font-size:.875rem;color:#475569;margin:0 0 1.25rem;line-height:1.65">
      Your order <strong>${orderId}</strong> has been successfully delivered. We hope you love it!
    </p>
    ${itemsTable(o.items)}
    <div style="background:#f0fdf4;border:1px solid rgba(34,197,94,.3);border-radius:8px;padding:.75rem 1rem;margin:1rem 0;font-size:.82rem;color:#166534;line-height:1.55">
      ↩️ <strong>Return window:</strong> If you have any issues with your order, you can initiate a return within <strong>3 days</strong> of delivery from your
      <a href="https://nexev.in/account.html" style="color:#15803d;font-weight:600">account page</a> or by contacting us on WhatsApp.
    </div>
    <div style="background:#f8fafc;border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:#475569;line-height:1.55">
      🔧 Building something cool with your components? Tag us or send us a photo on WhatsApp — we'd love to see it!
    </div>`;

  return wrap(
    { bg: 'rgba(34,197,94,.12)', color: '#15803d', border: 'rgba(34,197,94,.35)' },
    '✅', 'Order Delivered', body
  );
}

/* ────────────────────────────────────────────────
   3. CANCELLED
──────────────────────────────────────────────── */
function cancelledHtml(orderId, o) {
  const isCod      = !o.paymentId || o.paymentMethod === 'cod';
  const refundNote = isCod
    ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:#475569;line-height:1.55">
        Since this was a Cash on Delivery order, no payment was collected — no refund is required.
       </div>`
    : `<div style="background:rgba(245,197,24,.08);border:1px solid rgba(245,197,24,.4);border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:#92400e;line-height:1.55">
        💳 <strong>Refund of ${fmtInr(o.total)}</strong> will be credited to your original payment method within <strong>5–7 business days</strong>.
       </div>`;

  const body = `
    <p style="font-size:.95rem;margin:0 0 .5rem">Hi <strong>${o.name}</strong>,</p>
    <p style="font-size:.875rem;color:#475569;margin:0 0 1.25rem;line-height:1.65">
      Your order <strong>${orderId}</strong> has been cancelled as requested. We're sorry to see it go.
    </p>
    ${infoBlock([
      ['Order ID',   orderId],
      ['Amount',     fmtInr(o.total)],
      ['Payment',    isCod ? 'Cash on Delivery' : 'Online (' + (o.paymentMethod || 'Razorpay') + ')'],
    ])}
    <div style="margin:1rem 0">${refundNote}</div>
    <p style="font-size:.85rem;color:#475569;margin:.75rem 0 0">
      Changed your mind? You can place a new order anytime at
      <a href="https://nexev.in/shop.html" style="color:#1a3a5c;font-weight:600">nexev.in/shop.html</a>.
    </p>`;

  return wrap(
    { bg: 'rgba(239,68,68,.1)', color: '#dc2626', border: 'rgba(239,68,68,.3)' },
    '✕', 'Order Cancelled', body
  );
}

/* ────────────────────────────────────────────────
   4. REFUNDED
──────────────────────────────────────────────── */
function refundedHtml(orderId, o) {
  const isCod = !o.paymentId || o.paymentMethod === 'cod';

  const refundDetail = isCod
    ? `<div style="background:#f0f9ff;border:1px solid rgba(8,145,178,.25);border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:#0369a1;line-height:1.55">
        🏦 Your refund will be processed as a <strong>bank transfer</strong> to the account details you provided.
        Please allow <strong>5–7 business days</strong> for the amount to reflect.
       </div>`
    : `<div style="background:#f0f9ff;border:1px solid rgba(8,145,178,.25);border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:#0369a1;line-height:1.55">
        💳 <strong>${fmtInr(o.total)}</strong> will be refunded to your original payment method
        (card / UPI / wallet) within <strong>5–7 business days</strong>.
       </div>`;

  const body = `
    <p style="font-size:.95rem;margin:0 0 .5rem">Hi <strong>${o.name}</strong>,</p>
    <p style="font-size:.875rem;color:#475569;margin:0 0 1.25rem;line-height:1.65">
      Good news — your refund for order <strong>${orderId}</strong> has been initiated after we received and verified your returned item.
    </p>
    ${infoBlock([
      ['Order ID',      orderId],
      ['Refund Amount', fmtInr(o.total)],
      ['Payment Mode',  isCod ? 'Cash on Delivery → Bank Transfer' : 'Original payment method'],
    ])}
    <div style="margin:1rem 0">${refundDetail}</div>
    <div style="background:#f8fafc;border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:#64748b;margin-top:.75rem">
      ℹ️ If you don't see the refund after 7 business days, please contact us with your order ID and we'll resolve it immediately.
    </div>`;

  return wrap(
    { bg: 'rgba(8,145,178,.12)', color: '#0369a1', border: 'rgba(8,145,178,.3)' },
    '💰', 'Refund Initiated', body
  );
}
