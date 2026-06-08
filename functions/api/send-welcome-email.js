/**
 * Cloudflare Pages Function: POST /api/send-welcome-email
 *
 * Sends a welcome email when a new user registers.
 * Called from auth.html after createUserWithEmailAndPassword or Google sign-up.
 *
 * Body: { name, email }
 *
 * Env vars required (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY
 *   EMAIL_FROM  e.g. "NexEV <orders@nexev.in>"
 */
export async function onRequestPost(context) {
  try {
    const env = context.env;
    if (!env.RESEND_API_KEY) {
      return json({ error: 'RESEND_API_KEY not configured' }, 500);
    }

    const { name, email } = await context.request.json();
    if (!email) return json({ error: 'email required' }, 400);

    const displayName = name || 'there';
    const from        = env.EMAIL_FROM || 'NexEV <orders@nexev.in>';

    const resp = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from,
        to:      [email],
        subject: `Welcome to NexEV, ${displayName}! 🎉`,
        html:    welcomeHtml(displayName),
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
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/* ── EMAIL TEMPLATE ── */
function welcomeHtml(name) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to NexEV</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;color:#1e293b">
<div style="max-width:580px;margin:2rem auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f2540,#1a3a5c);padding:2.25rem 2rem;text-align:center">
    <div style="font-size:1.6rem;font-weight:800;color:#fff;font-family:Georgia,serif;letter-spacing:-.01em">
      nex<span style="color:#22c55e">EV</span>
    </div>
    <div style="color:rgba(255,255,255,.55);font-size:.78rem;margin-top:.35rem;letter-spacing:.06em;text-transform:uppercase">
      Welcome to the EV Future
    </div>
  </div>

  <!-- Body -->
  <div style="padding:2rem">
    <p style="font-size:1.05rem;font-weight:700;color:#1a3a5c;margin:0 0 .5rem">Hi ${name}! 👋</p>
    <p style="font-size:.9rem;color:#475569;margin:0 0 1.5rem;line-height:1.65">
      Your NexEV account is ready. We're glad to have you on board —
      India's hub for EV battery packs, BMS boards, and workshop-grade components.
    </p>

    <!-- Feature pills -->
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem">
      ${pill('🛒', 'Shop EV Components')}
      ${pill('📦', 'Track Your Orders')}
      ${pill('🔄', 'Easy Returns')}
      ${pill('💬', 'WhatsApp Support')}
    </div>

    <!-- CTA button -->
    <div style="text-align:center;margin-bottom:1.75rem">
      <a href="https://nexev.in/shop.html"
         style="display:inline-block;background:#22c55e;color:#fff;font-weight:700;font-size:.9rem;padding:.8rem 2rem;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(34,197,94,.3)">
        Browse the Shop →
      </a>
    </div>

    <!-- Info strip -->
    <div style="background:#f8fafc;border-radius:10px;padding:1rem 1.25rem;margin-bottom:1.5rem;border:1px solid #e2e8f0">
      <p style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:0 0 .65rem">What you get</p>
      ${infoRow('✅', 'Workshop-grade 18650 battery kits, BMS, connectors &amp; more')}
      ${infoRow('🚚', 'Ships from Bengaluru — Karnataka in 2 business days')}
      ${infoRow('🔒', 'Secure checkout via Razorpay — UPI, Cards, Wallets')}
      ${infoRow('↩️', '3-day hassle-free returns on all products')}
    </div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 1.25rem"/>
    <p style="font-size:.8rem;color:#94a3b8;margin:0">
      Need help?
      <a href="mailto:service@nexev.in" style="color:#1a3a5c;font-weight:600">service@nexev.in</a>
      &nbsp;·&nbsp;
      <a href="https://wa.me/919019901711" style="color:#1a3a5c;font-weight:600">WhatsApp +91 90199 01711</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:1rem 2rem;text-align:center;border-top:1px solid #e2e8f0;font-size:.72rem;color:#94a3b8">
    NexEV Private Limited &middot; GSTIN: 29AALCN2942C1ZF &middot; Bengaluru, Karnataka, India<br/>
    <span style="font-size:.68rem">You're receiving this because you created a NexEV account.</span>
  </div>
</div>
</body></html>`;
}

function pill(icon, text) {
  return `<span style="display:inline-flex;align-items:center;gap:.35rem;background:rgba(26,58,92,.06);border:1px solid rgba(26,58,92,.12);border-radius:20px;padding:.3rem .75rem;font-size:.75rem;font-weight:600;color:#1a3a5c">${icon} ${text}</span>`;
}

function infoRow(icon, text) {
  return `<div style="display:flex;align-items:flex-start;gap:.6rem;margin-bottom:.45rem;font-size:.82rem;color:#475569">
    <span style="flex-shrink:0">${icon}</span><span>${text}</span>
  </div>`;
}
