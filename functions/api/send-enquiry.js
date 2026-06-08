/**
 * Cloudflare Pages Function: POST /api/send-enquiry
 *
 * 1. Sends a notification email → contact@nexev.in  (your inbox)
 * 2. Sends an auto-reply      → sender's email      (confirmation)
 *
 * Body: { name, email, company?, phone?, type, message }
 *
 * Env vars (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY   — from resend.com
 *   EMAIL_FROM       — e.g. "NexEV <noreply@nexev.in>"
 *   ENQUIRY_TO       — defaults to "contact@nexev.in"
 */
export async function onRequestPost(context) {
  try {
    const env = context.env;
    if (!env.RESEND_API_KEY) return json({ error: 'RESEND_API_KEY not configured' }, 500);

    const body = await context.request.json();
    const { name, email, company = '', phone = '', type = 'General', message } = body;

    if (!name || !email || !message) return json({ error: 'name, email and message are required' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Invalid email' }, 400);

    const from    = env.EMAIL_FROM  || 'NexEV <noreply@nexev.in>';
    const inboxTo = env.ENQUIRY_TO  || 'contact@nexev.in';

    /* ── Send both emails in parallel ── */
    const [notify, reply] = await Promise.all([
      resend(env.RESEND_API_KEY, {
        from,
        to:       [inboxTo],
        reply_to: email,
        subject:  `[NexEV Enquiry] ${type} — ${name}`,
        html:     notificationHtml({ name, email, company, phone, type, message }),
      }),
      resend(env.RESEND_API_KEY, {
        from,
        to:      [email],
        subject: `We received your enquiry — NexEV will respond within 24 hrs`,
        html:    autoReplyHtml({ name, type }),
      }),
    ]);

    return json({ ok: true, notify, reply });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function resend(key, payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  return r.json();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

/* ── SHARED WRAP ── */
function emailWrap(headerSub, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;color:#1e293b">
<div style="max-width:580px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0f2540,#1a3a5c);padding:2rem;text-align:center">
    <div style="font-size:1.5rem;font-weight:800;color:#fff;font-family:Georgia,serif">
      nex<span style="color:#22c55e">EV</span>
    </div>
    <div style="color:rgba(255,255,255,.55);font-size:.78rem;margin-top:.35rem;letter-spacing:.05em">${headerSub}</div>
  </div>
  <div style="padding:2rem">${bodyHtml}</div>
  <div style="background:#f8fafc;padding:1rem 2rem;text-align:center;border-top:1px solid #e2e8f0;font-size:.72rem;color:#94a3b8">
    NexEV Private Limited &middot; GSTIN: 29AALCN2942C1ZF &middot; Bengaluru, Karnataka, India
  </div>
</div>
</body></html>`;
}

/* ── 1. NOTIFICATION to contact@nexev.in ── */
function notificationHtml({ name, email, company, phone, type, message }) {
  const field = (label, val) => val
    ? `<tr>
        <td style="padding:.4rem .75rem .4rem 0;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;white-space:nowrap;vertical-align:top">${label}</td>
        <td style="padding:.4rem 0;font-size:.875rem;color:#1e293b">${val}</td>
       </tr>`
    : '';

  return emailWrap('New Enquiry Received', `
    <p style="font-size:.9rem;margin:0 0 1.25rem;color:#475569">
      A new enquiry has been submitted on <strong>nexev.in</strong>. Reply directly to this email to respond.
    </p>
    <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:1.25rem;margin-bottom:1.25rem">
      <table style="width:100%;border-collapse:collapse">
        ${field('Name',    name)}
        ${field('Email',   `<a href="mailto:${email}" style="color:#1a3a5c;font-weight:600">${email}</a>`)}
        ${field('Company', company)}
        ${field('Phone',   phone)}
        ${field('Type',    `<span style="background:rgba(34,197,94,.1);color:#166534;border:1px solid rgba(34,197,94,.3);border-radius:20px;padding:.15rem .6rem;font-size:.75rem;font-weight:700">${type}</span>`)}
      </table>
    </div>
    <div style="margin-bottom:.5rem;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Message</div>
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:1rem 1.25rem;font-size:.88rem;color:#1e293b;line-height:1.65;white-space:pre-wrap">${message}</div>
    <div style="margin-top:1.25rem;text-align:center">
      <a href="mailto:${email}?subject=Re: NexEV Enquiry — ${encodeURIComponent(type)}"
         style="display:inline-block;background:#1a3a5c;color:#fff;font-weight:700;font-size:.875rem;padding:.7rem 1.75rem;border-radius:10px;text-decoration:none">
        Reply to ${name} →
      </a>
    </div>
  `);
}

/* ── 2. AUTO-REPLY to the sender ── */
function autoReplyHtml({ name, type }) {
  return emailWrap('Enquiry Received', `
    <p style="font-size:.95rem;font-weight:700;color:#1a3a5c;margin:0 0 .5rem">Hi ${name},</p>
    <p style="font-size:.875rem;color:#475569;margin:0 0 1.25rem;line-height:1.65">
      Thank you for reaching out to NexEV. We've received your <strong>${type}</strong> enquiry
      and our team will review it and get back to you within <strong>24 business hours</strong>.
    </p>
    <div style="background:#f0fdf4;border:1px solid rgba(34,197,94,.3);border-radius:10px;padding:1rem 1.25rem;margin-bottom:1.25rem">
      <p style="font-size:.82rem;color:#166534;margin:0;line-height:1.6">
        ✅ Your enquiry has been received and logged.<br/>
        📧 We respond to every enquiry personally — not with templates.<br/>
        ⏱ Typical response time: within 24 business hours.
      </p>
    </div>
    <p style="font-size:.85rem;color:#475569;margin:0 0 .6rem;line-height:1.6">
      For urgent queries, you can reach us directly on WhatsApp:
    </p>
    <div style="text-align:center;margin-bottom:1.5rem">
      <a href="https://wa.me/919019901711"
         style="display:inline-block;background:#25d366;color:#fff;font-weight:700;font-size:.875rem;padding:.7rem 1.75rem;border-radius:10px;text-decoration:none">
        💬 WhatsApp +91 90199 01711
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 1.25rem"/>
    <p style="font-size:.8rem;color:#94a3b8;margin:0">
      <a href="https://nexev.in/shop.html" style="color:#1a3a5c;font-weight:600">Browse our Shop</a>
      &nbsp;·&nbsp;
      <a href="mailto:contact@nexev.in" style="color:#1a3a5c;font-weight:600">contact@nexev.in</a>
    </p>
  `);
}
