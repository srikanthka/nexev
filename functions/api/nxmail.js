/**
 * Cloudflare Pages Function: POST /api/nxmail
 *
 * Handles all contact/enquiry form submissions.
 * Named "nxmail" (not "send-enquiry" / "contact") to avoid ad-blocker filter lists.
 *
 * 1. Sends notification  → contact@nexev.in   (your inbox, reply-to = sender)
 * 2. Sends auto-reply    → sender's email      (confirmation)
 *
 * Body: { name, email, company?, phone?, type, message }
 *
 * Env vars (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY  — from resend.com (free tier: 3k emails/month)
 *   EMAIL_FROM      — e.g. "NexEV <noreply@nexev.in>"
 *   ENQUIRY_TO      — defaults to "contact@nexev.in"
 */
export async function onRequestPost(context) {
  const env = context.env;

  /* ── Preflight / CORS (allowlist only — never reflect arbitrary origins) ── */
  const origin = context.request.headers.get('Origin') || '';
  const allowedOrigins = [
    'https://nexev.in',
    'https://www.nexev.in',
    'http://localhost:8788',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://nexev.in';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    /* ── Guard: API key must be set ── */
    if (!env.RESEND_API_KEY) {
      console.error('[nxmail] RESEND_API_KEY is not set');
      return jsonRes({ error: 'Email service not configured. Please contact us directly at contact@nexev.in' }, 500, corsHeaders);
    }

    /* ── Parse body ── */
    let body;
    try { body = await context.request.json(); }
    catch { return jsonRes({ error: 'Invalid request body' }, 400, corsHeaders); }

    const { name, email, company = '', phone = '', type = 'General', message } = body;

    /* ── Basic validation ── */
    if (!name?.trim())    return jsonRes({ error: 'Name is required' }, 400, corsHeaders);
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                          return jsonRes({ error: 'Valid email is required' }, 400, corsHeaders);
    if (!message?.trim()) return jsonRes({ error: 'Message is required' }, 400, corsHeaders);

    const from    = env.EMAIL_FROM || 'NexEV <noreply@nexev.in>';
    const inboxTo = env.ENQUIRY_TO || 'contact@nexev.in';

    /* ── Send notification to NexEV inbox ── */
    const notifyResult = await callResend(env.RESEND_API_KEY, {
      from,
      to:       [inboxTo],
      reply_to: email,
      subject:  `[NexEV Enquiry] ${type} — ${name}`,
      html:     notificationHtml({ name, email, company, phone, type, message }),
    });

    /* ── Check Resend's response — surface real errors ── */
    if (isResendError(notifyResult)) {
      console.error('[nxmail] Resend notification failed:', JSON.stringify(notifyResult));
      return jsonRes({
        error: resendErrorMessage(notifyResult),
      }, 502, corsHeaders);
    }

    /* ── Auto-reply is best-effort — never block a success response ── */
    callResend(env.RESEND_API_KEY, {
      from,
      to:      [email],
      subject: 'We received your enquiry — NexEV will respond within 24 hrs',
      html:    autoReplyHtml({ name, type }),
    }).catch(err => console.warn('[nxmail] Auto-reply failed (non-critical):', err.message));

    return jsonRes({ ok: true, id: notifyResult.id }, 200, corsHeaders);

  } catch (err) {
    console.error('[nxmail] Unexpected error:', err.message);
    return jsonRes({ error: 'Server error — please email contact@nexev.in directly' }, 500, corsHeaders);
  }
}

/* OPTIONS preflight */
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/* ── Helpers ── */
function jsonRes(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

async function callResend(key, payload) {
  const resp = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  /* Parse JSON regardless of status so we can inspect error fields */
  const text = await resp.text();
  try { return { _status: resp.status, ...JSON.parse(text) }; }
  catch { return { _status: resp.status, error: text }; }
}

function isResendError(result) {
  /* Resend errors have statusCode >= 400 OR a name like "validation_error" */
  return (result._status && result._status >= 400)
    || result.statusCode >= 400
    || !!result.name?.includes('error')
    || !!result.error;
}

function resendErrorMessage(result) {
  if (result.message) return `Email delivery error: ${result.message}`;
  if (result.error)   return `Email delivery error: ${result.error}`;
  return `Email delivery failed (code ${result._status || result.statusCode || 'unknown'}). Please email contact@nexev.in directly.`;
}

/* ── EMAIL TEMPLATES ── */
function emailWrap(headerSub, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;color:#1e293b">
<div style="max-width:580px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0f2540,#1a3a5c);padding:2rem;text-align:center">
    <div style="font-size:1.5rem;font-weight:800;color:#fff;font-family:Georgia,serif">nex<span style="color:#22c55e">EV</span></div>
    <div style="color:rgba(255,255,255,.55);font-size:.78rem;margin-top:.3rem;letter-spacing:.05em">${headerSub}</div>
  </div>
  <div style="padding:2rem">${bodyHtml}</div>
  <div style="background:#f8fafc;padding:1rem 2rem;text-align:center;border-top:1px solid #e2e8f0;font-size:.72rem;color:#94a3b8">
    NexEV Private Limited &middot; GSTIN: 29AALCN2942C1ZF &middot; Bengaluru, Karnataka, India
  </div>
</div>
</body></html>`;
}

function notificationHtml({ name, email, company, phone, type, message }) {
  const row = (label, val) => !val ? '' :
    `<tr>
       <td style="padding:.4rem .75rem .4rem 0;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;white-space:nowrap;vertical-align:top">${label}</td>
       <td style="padding:.4rem 0;font-size:.875rem;color:#1e293b">${val}</td>
     </tr>`;

  return emailWrap('New Enquiry — nexev.in', `
    <p style="font-size:.875rem;color:#475569;margin:0 0 1.25rem;line-height:1.65">
      New enquiry submitted. <strong>Reply directly to this email</strong> to respond to the sender.
    </p>
    <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:1.25rem;margin-bottom:1.25rem">
      <table style="width:100%;border-collapse:collapse">
        ${row('Name',    name)}
        ${row('Email',   `<a href="mailto:${email}" style="color:#1a3a5c;font-weight:600">${email}</a>`)}
        ${row('Company', company)}
        ${row('Phone',   phone)}
        ${row('Type',    `<span style="background:rgba(34,197,94,.1);color:#166534;border:1px solid rgba(34,197,94,.3);border-radius:20px;padding:.15rem .6rem;font-size:.72rem;font-weight:700">${type}</span>`)}
      </table>
    </div>
    <div style="margin-bottom:.4rem;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Message</div>
    <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:1rem 1.25rem;font-size:.875rem;color:#1e293b;line-height:1.65;white-space:pre-wrap">${message}</div>
    <div style="margin-top:1.25rem;text-align:center">
      <a href="mailto:${email}?subject=Re:%20NexEV%20Enquiry%20%E2%80%94%20${encodeURIComponent(type)}"
         style="display:inline-block;background:#1a3a5c;color:#fff;font-weight:700;font-size:.875rem;padding:.7rem 1.75rem;border-radius:10px;text-decoration:none">
        Reply to ${name} →
      </a>
    </div>
  `);
}

function autoReplyHtml({ name, type }) {
  return emailWrap('Enquiry Received', `
    <p style="font-size:.95rem;font-weight:700;color:#1a3a5c;margin:0 0 .5rem">Hi ${name},</p>
    <p style="font-size:.875rem;color:#475569;margin:0 0 1.25rem;line-height:1.65">
      Thank you for reaching out. We've received your <strong>${type}</strong> enquiry and our team
      will respond within <strong>24 business hours</strong> — personally, not with a template.
    </p>
    <div style="background:#f0fdf4;border:1px solid rgba(34,197,94,.3);border-radius:10px;padding:1rem 1.25rem;margin-bottom:1.25rem">
      <p style="font-size:.82rem;color:#166534;margin:0;line-height:1.65">
        ✅ Your enquiry has been received and logged.<br/>
        ⏱ Typical response time: within 24 business hours.<br/>
        📧 We respond to every enquiry personally.
      </p>
    </div>
    <div style="text-align:center;margin-bottom:1.5rem">
      <a href="https://wa.me/919019901711"
         style="display:inline-block;background:#25d366;color:#fff;font-weight:700;font-size:.875rem;padding:.7rem 1.75rem;border-radius:10px;text-decoration:none">
        💬 Reach us on WhatsApp
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
