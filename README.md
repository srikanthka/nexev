# NexEV — nexev.in

Static e-commerce site for **NexEV Private Limited**, selling DIY lithium battery-building supplies in India: BMS/PCM boards, Type-C chargers, assembly kits, nickel strip, silicone wire, XT60H/XT90 connectors, cell holders, and insulation. Ships from Bengaluru, Karnataka. GSTIN: 29AALCN2942C1ZF.

Hosted on **Cloudflare Pages** (deployed from this GitHub repo). Payments via **Razorpay**; auth + order storage via **Firebase**; transactional email via **Resend**.

## Structure

```
/                         index.html          — homepage
shop.html                                     — storefront (renders from assets/products/products.js)
<product>.html                                — one static page per SKU (e.g. bms-pcm-2s-8a.html)
about.html, faq.html, blog.html, blog/*       — content
return-policy.html, privacy-policy.html,
  terms-of-service.html                       — legal (linked from every footer)
account.html, auth.html, admin.html           — customer + admin (noindex)
assets/
  products/products.js  — LIVE product catalogue (source of truth: price, gst_rate, bulk_tiers, weight)
  data/shipping-rates.json — static shipping fallback
  js/                   — firebase-init.js, nav-auth.js, main.js
functions/api/          — Cloudflare Pages Functions (create-order, verify-payment, nxmail, delhivery-*, …)
```

## Order flow

1. Cart is held in `localStorage`; checkout requires a signed-in Firebase account.
2. `POST /api/create-order` re-prices the cart **server-side** from its own `PRODUCTS` table (never trusts client prices), computes shipping (Delhivery API, or the static fallback), and creates a Razorpay order.
3. Razorpay Standard Checkout collects payment.
4. `POST /api/verify-payment` verifies the signature **and** fetches the payment from Razorpay to confirm it was captured and matches the order amount.
5. The browser writes the order to Firebase; a confirmation email is sent.
6. Fulfilment is manual via `admin.html`.

> **Keep prices in sync.** `assets/products/products.js` and the `PRODUCTS`/`BULK_TIERS`
> tables in `functions/api/create-order.js` must match exactly. The server price is
> authoritative — a mismatch means the customer is charged a different amount than shown.

## Required configuration

**Firebase Realtime Database rules** — paste the block documented at the top of
`assets/js/firebase-init.js` into Firebase Console → Realtime Database → Rules and
**publish**. These rules are the only thing restricting each customer to their own
orders; the client cannot enforce them.

**Cloudflare Pages environment variables:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
`RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, the `FIREBASE_*` keys, and
(optional) `DELHIVERY_TOKEN` / `DELHIVERY_PICKUP_PINCODE`.

## Local development

```bash
npx wrangler pages dev .      # runs the site + Functions with .dev.vars
# or, static only:
python -m http.server 8000
```
For direct `file://` / Live Server use, copy `firebase-local.example.js` → `firebase-local.js`.

## Contact

- Support: service@nexev.in · +91 90199 01711
- Bengaluru, Karnataka, India

© 2026 NexEV Private Limited. All rights reserved.
