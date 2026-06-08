/**
 * Cloudflare Pages Function: POST /api/send-order-email
 *
 * Sends an order confirmation email via Resend (resend.com).
 * Environment variables required in Cloudflare Pages:
 *   RESEND_API_KEY  — create a free key at resend.com
 *   EMAIL_FROM      — verified sender e.g. "NexEV Orders <orders@nexev.in>"
 *
 * In local dev this endpoint does not exist — the client silently ignores failures.
 */
export async function onRequestPost(context) {
  try {
    const env = context.env;
    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const { customerName, customerEmail, orderId, items = [], total, address } = await context.request.json();
    const from = env.EMAIL_FROM || 'NexEV Orders <orders@nexev.in>';

    const itemRows = items.map(i =>
      `<tr>
        <td style="padding:.4rem .5rem .4rem 0;border-bottom:1px solid #e2e8f0;font-size:.85rem">${i.name}</td>
        <td style="padding:.4rem .5rem;border-bottom:1px solid #e2e8f0;font-size:.85rem;text-align:center">&times;${i.qty}</td>
        <td style="padding:.4rem 0 .4rem .5rem;border-bottom:1px solid #e2e8f0;font-size:.85rem;text-align:right;font-weight:600">&#8377;${Number(i.price * i.qty).toLocaleString('en-IN')}</td>
      </tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head><body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;color:#1e293b">
<div style="max-width:580px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0f2540,#1a3a5c);padding:2rem;text-align:center">
    <div style="font-size:1.5rem;font-weight:800;color:#fff;font-family:Georgia,serif">
      nex<span style="color:#22c55e">EV</span>
    </div>
    <div style="color:rgba(255,255,255,.6);font-size:.8rem;margin-top:.3rem">Order Confirmation</div>
  </div>
  <div style="padding:2rem">
    <div style="display:inline-block;background:rgba(34,197,94,.1);color:#15803d;border:1px solid rgba(34,197,94,.3);border-radius:20px;padding:.3rem .9rem;font-size:.78rem;font-weight:700;margin-bottom:1.25rem">
      &#10003; Payment Confirmed
    </div>
    <p style="font-size:.95rem;margin:0 0 1.25rem">Hi <strong>${customerName}</strong>,<br/>
    Your order is confirmed and being prepared for dispatch.</p>
    <p style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:0 0 .3rem">Payment ID</p>
    <p style="font-family:monospace;font-size:.8rem;background:#f8fafc;border-radius:6px;padding:.4rem .7rem;display:inline-block;color:#1a3a5c;margin:0 0 1.5rem;word-break:break-all">${orderId}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:.75rem">
      <thead><tr>
        <th style="text-align:left;padding:.3rem 0;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0">Item</th>
        <th style="padding:.3rem .5rem;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0;text-align:center">Qty</th>
        <th style="text-align:right;padding:.3rem 0;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0">Amount</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
      <tfoot><tr>
        <td colspan="2" style="padding:.65rem 0 0;font-weight:700;font-size:.9rem">Total Paid</td>
        <td style="padding:.65rem 0 0;text-align:right;font-weight:800;font-size:.9rem;color:#1a3a5c">&#8377;${Number(total).toLocaleString('en-IN')}</td>
      </tr></tfoot>
    </table>
    <p style="font-size:.85rem;margin:1.25rem 0 0;color:#475569"><strong>Delivery to:</strong><br/>${address}</p>
    <p style="font-size:.85rem;margin:.6rem 0 0;color:#475569">A WhatsApp message with tracking details will be sent once shipped.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0"/>
    <p style="font-size:.8rem;color:#94a3b8">Questions? <a href="mailto:service@nexev.in" style="color:#1a3a5c;font-weight:600">service@nexev.in</a>
    &nbsp;&middot;&nbsp; <a href="https://wa.me/919019901711" style="color:#1a3a5c;font-weight:600">WhatsApp +91 90199 01711</a></p>
  </div>
  <div style="background:#f8fafc;padding:1rem 2rem;text-align:center;font-size:.72rem;color:#94a3b8">
    NexEV Private Limited &middot; GSTIN: 29AALCN2942C1ZF &middot; Bengaluru, Karnataka
  </div>
</div>
</body></html>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [customerEmail],
        subject: `Order Confirmed — NexEV (${orderId})`,
        html,
      }),
    });

    const result = await resp.json();
    return new Response(JSON.stringify(result), {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
