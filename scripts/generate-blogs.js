/**
 * NexEV — Static blog generator (SEO-friendly, mirrors generate-products.js)
 * Usage:  node scripts/generate-blogs.js
 *
 * Reads  : data/blogs.json
 * Writes : blog.html                 — static listing (cards link to real URLs)
 *          blog/{slug}.html          — one fully-rendered page per post
 *
 * Each post page ships server-rendered HTML with its own <title>, meta
 * description, canonical, OG/Twitter tags and BlogPosting JSON-LD — so
 * search engines and social scrapers see real content, not an empty shell.
 *
 * Re-run this script any time data/blogs.json changes.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/* ── 1. Load blog data ────────────────────────────────────────────── */
const rootDir  = path.join(__dirname, '..');
const dataPath = path.join(rootDir, 'data', 'blogs.json');

let data;
try {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.error('ERROR: could not read/parse data/blogs.json —', err.message);
  process.exit(1);
}
const blogs = (data && data.blogs) || [];
if (!blogs.length) {
  console.error('ERROR: no blogs found in data/blogs.json');
  process.exit(1);
}

/* Newest first */
blogs.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

const SITE    = 'https://nexev.in';
const blogDir = path.join(rootDir, 'blog');
fs.mkdirSync(blogDir, { recursive: true });

/* ── 2. Helpers ───────────────────────────────────────────────────── */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return esc(iso);
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}
function absUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  return SITE + (u.charAt(0) === '/' ? '' : '/') + u;
}
function postUrl(slug) { return '/blog/' + slug + '.html'; }
function ldSafe(obj)   { return JSON.stringify(obj).replace(/</g, '\\u003c'); }
function readTime(b) {
  if (b.readTime) return b.readTime;
  let words = 0;
  (b.content || []).forEach(function (blk) {
    if (typeof blk === 'string') words += blk.split(/\s+/).length;
    else if (blk.text)  words += String(blk.text).split(/\s+/).length;
    else if (blk.items) blk.items.forEach(function (i) { words += String(i).split(/\s+/).length; });
  });
  return Math.max(1, Math.round(words / 200)) + ' min read';
}

/* ── 3. Shared CSS (matches the rest of the site) ─────────────────── */
const CSS_BASE = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#1a3a5c;--blue-d:#0f2540;
  --green:#22c55e;--yellow:#f5c518;
  --bg:#fff;--bg-alt:#f8fafc;
  --text:#1e293b;--muted:#64748b;--border:#e2e8f0;
  --radius:12px;--nav-h:64px;
}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;color:var(--text);background:var(--bg);line-height:1.6;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
.container{max-width:1200px;margin:0 auto;padding:0 1.5rem}`;

const CSS_NAVBAR = `
.navbar{position:fixed;top:0;left:0;right:0;z-index:100;height:var(--nav-h);background:rgba(255,255,255,.97);backdrop-filter:blur(12px);border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s}
.navbar.scrolled{border-color:var(--border);box-shadow:0 2px 20px rgba(0,0,0,.07)}
.nav-c{max-width:1200px;margin:0 auto;padding:0 1.5rem;height:100%;display:flex;align-items:center;justify-content:space-between;gap:2rem}
.nav-brand{display:flex;flex-direction:column;gap:.18rem;flex-shrink:0}
.nav-logo-wrap{display:flex;align-items:center;gap:.5rem;flex-shrink:0;text-decoration:none}
.nav-logo-img{height:32px;width:auto;display:block}
.nav-logo-text{display:flex;align-items:center;font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;line-height:1}
.logo-nex{color:var(--blue)}.logo-ev{color:var(--green)}
.nav-slogan{font-size:.6rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:.15rem;line-height:1}
.nav-links{display:flex;align-items:center;gap:.2rem;list-style:none}
.nav-links a{padding:.4rem .7rem;border-radius:7px;font-size:.875rem;font-weight:500;color:var(--muted);transition:color .2s,background .2s}
.nav-links a:hover,.nav-links a.active{color:var(--blue);background:#f1f5f9}
.nav-cta{background:var(--blue)!important;color:#fff!important;padding:.45rem 1rem!important;border-radius:7px}
.nav-cta:hover{background:var(--blue-d)!important}
.nav-shop{display:inline-flex!important;align-items:center;gap:.35rem;background:var(--green)!important;color:#fff!important;padding:.42rem 1rem!important;border-radius:20px!important;font-weight:700!important;font-size:.825rem!important;box-shadow:0 2px 10px rgba(34,197,94,.3);transition:background .2s,transform .2s,box-shadow .2s!important}
.nav-shop:hover{background:#16a34a!important;transform:translateY(-1px);box-shadow:0 4px 16px rgba(34,197,94,.4)!important}
.nav-signin-link{display:inline-flex;align-items:center;gap:.35rem}
.hamburger{display:none;flex-direction:column;gap:5px;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:10px;flex-shrink:0;min-width:44px;min-height:44px;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.hamburger span{display:block;width:24px;height:2.5px;background:var(--blue);border-radius:3px;transition:all .3s;flex-shrink:0}
.mob-menu{display:none;flex-direction:column;gap:.5rem;position:fixed;top:var(--nav-h);left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:1rem 1.5rem 1.5rem;z-index:101;box-shadow:0 8px 24px rgba(0,0,0,.08)}
.mob-menu.open{display:flex}
.mob-menu a{padding:.6rem .75rem;border-radius:8px;font-weight:500;color:var(--text);transition:background .15s}
.mob-menu a:hover{background:var(--bg-alt)}
.mob-cta{background:var(--blue)!important;color:#fff!important;text-align:center;margin-top:.5rem;border-radius:8px}
.mob-shop{background:var(--green)!important;color:#fff!important;font-weight:700!important;border-radius:10px!important;text-align:center}
@media(max-width:960px){.nav-links{display:none}.hamburger{display:flex}.nav-c{gap:.75rem}}`;

const CSS_FOOTER = `
.footer{background:var(--blue);color:rgba(255,255,255,.75);padding:4rem 0 2rem}
.footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
@media(max-width:860px){.footer-top{grid-template-columns:1fr 1fr;gap:2rem}}
@media(max-width:520px){.footer-top{grid-template-columns:1fr}}
.footer-brand .nav-logo-text{color:#fff}
.footer-tagline{font-size:.83rem;line-height:1.65;margin:.75rem 0 1.25rem}
.footer-legal-block p{font-size:.76rem;color:rgba(255,255,255,.45);line-height:1.6}
.footer-legal-block .cin{font-family:monospace;font-size:.72rem;color:rgba(255,255,255,.35)}
.footer-loc{display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:rgba(255,255,255,.5);margin-top:.4rem}
.footer-loc svg{width:13px;height:13px;flex-shrink:0}
.footer-col h4{font-family:'Syne',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:1rem}
.footer-col a{display:block;font-size:.82rem;color:rgba(255,255,255,.65);margin-bottom:.5rem;transition:color .2s}
.footer-col a:hover{color:#fff}
.footer-col span{display:block;font-size:.78rem;color:rgba(255,255,255,.35);margin-top:.35rem}
hr.footer-hr{border:none;border-top:1px solid rgba(255,255,255,.1);margin-bottom:1.5rem}
.footer-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;font-size:.78rem}
.footer-bottom p{color:rgba(255,255,255,.35)}`;

const CSS_SCROLL_TOP = `
#scrollTop{position:fixed;bottom:1.5rem;right:1.5rem;z-index:50;width:40px;height:40px;border-radius:50%;background:var(--blue);color:#fff;border:none;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.2);transition:all .2s}
#scrollTop.show{display:flex}
#scrollTop:hover{background:var(--blue-d);transform:translateY(-2px)}`;

const CSS_BREADCRUMB = `
.breadcrumb{padding:.8rem 0;background:var(--bg-alt);border-bottom:1px solid var(--border);margin-top:var(--nav-h)}
.bc-inner{display:flex;align-items:center;gap:.45rem;list-style:none;font-size:.8rem;color:var(--muted);flex-wrap:wrap}
.bc-inner li+li::before{content:'›';margin-right:.45rem}
.bc-inner a:hover{color:var(--blue)}
.bc-inner .bc-cur{color:var(--text);font-weight:600}`;

const CSS_BLOG_LIST = `
.blog-hero{background:var(--blue);color:#fff;padding:3.5rem 0;text-align:center}
.blog-hero .eyebrow{color:rgba(255,255,255,.65);background:rgba(255,255,255,.1);padding:.35rem .9rem;border-radius:20px;border:1px solid rgba(255,255,255,.15);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;display:inline-block;margin-bottom:.85rem}
.blog-hero h1{font-family:'Syne',sans-serif;font-size:clamp(1.9rem,5vw,3rem);font-weight:800;line-height:1.1;margin-bottom:1rem;color:#fff}
.blog-hero p{font-size:clamp(.95rem,2vw,1.1rem);color:rgba(255,255,255,.8);max-width:600px;margin:0 auto;line-height:1.65}
.blog-section{padding:3.5rem 0 4.5rem}
.blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.75rem}
@media(max-width:900px){.blog-grid{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.blog-grid{grid-template-columns:1fr}}
.blog-card{background:#fff;border:1px solid var(--border);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s,border-color .2s}
.blog-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(15,37,64,.12);border-color:var(--green)}
.blog-card:focus-visible{outline:2px solid var(--green);outline-offset:2px}
.bc-thumb{aspect-ratio:16/9;overflow:hidden;background:linear-gradient(135deg,#0f1e2e,#1a3a5c);position:relative}
.bc-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.blog-card:hover .bc-thumb img{transform:scale(1.05)}
.bc-cat{position:absolute;top:.8rem;left:.8rem;background:rgba(34,197,94,.95);color:#fff;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:.32rem .7rem;border-radius:20px}
.bc-body{padding:1.25rem 1.25rem 1.4rem;display:flex;flex-direction:column;flex:1}
.bc-meta{display:flex;gap:.5rem;align-items:center;font-size:.72rem;color:var(--muted);margin-bottom:.55rem}
.bc-dot{width:3px;height:3px;border-radius:50%;background:var(--muted)}
.bc-title{font-family:'Syne',sans-serif;font-size:1.08rem;font-weight:800;color:var(--blue);line-height:1.3;margin-bottom:.5rem}
.bc-desc{font-size:.86rem;color:var(--muted);line-height:1.6;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.bc-readmore{margin-top:1.1rem;font-size:.82rem;font-weight:700;color:var(--green);display:inline-flex;align-items:center;gap:.35rem;transition:gap .2s}
.blog-card:hover .bc-readmore{gap:.6rem}`;

const CSS_ARTICLE = `
.article{max-width:760px;margin:0 auto;padding:2.5rem 1.5rem 4rem}
.article-back{display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:600;color:var(--muted);margin-bottom:1.75rem;transition:color .2s}
.article-back:hover{color:var(--blue)}
.article-cat{display:inline-block;background:#f0fdf4;color:#16a34a;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:.3rem .8rem;border-radius:20px;margin-bottom:1rem}
.article h1{font-family:'Syne',sans-serif;font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;color:var(--blue);line-height:1.18;margin-bottom:1rem}
.article-meta{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;font-size:.8rem;color:var(--muted);margin-bottom:1.75rem}
.article-hero{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:16px;margin-bottom:2rem;background:linear-gradient(135deg,#0f1e2e,#1a3a5c)}
.article-content p{font-size:1.02rem;line-height:1.8;color:var(--text);margin-bottom:1.3rem}
.article-content h2{font-family:'Syne',sans-serif;font-size:1.35rem;font-weight:800;color:var(--blue);margin:2.1rem 0 .9rem;line-height:1.25}
.article-content ul{margin:0 0 1.4rem 1.25rem;display:flex;flex-direction:column;gap:.5rem}
.article-content li{font-size:1rem;line-height:1.7;color:var(--text)}
.article-content li::marker{color:var(--green)}
.article-content blockquote{border-left:3px solid var(--green);padding:.4rem 0 .4rem 1.25rem;margin:1.6rem 0;color:var(--blue);font-style:italic;font-size:1.05rem;line-height:1.7}
.article-content img{border-radius:12px;margin:1.6rem 0;width:100%}
.article-cta{margin-top:2.5rem;padding:1.75rem;background:var(--bg-alt);border:1px solid var(--border);border-radius:16px;text-align:center}
.article-cta h3{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:var(--blue);margin-bottom:.5rem}
.article-cta p{font-size:.9rem;color:var(--muted);margin-bottom:1.1rem}
.btn-green{display:inline-flex;align-items:center;gap:.4rem;padding:.7rem 1.5rem;border-radius:10px;background:var(--green);color:#fff;font-weight:700;font-size:.875rem;transition:all .2s}
.btn-green:hover{background:#16a34a;transform:translateY(-1px)}
.article-more{max-width:1200px;margin:0 auto;padding:0 1.5rem 4rem}
.article-more h3{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;color:var(--blue);margin-bottom:1.5rem}`;

/* ── 4. Shared HTML (navbar / footer / scripts) ───────────────────── */
function navbar(active) {
  function link(href, label) {
    const cls = active === label ? ' class="active"' : '';
    return `      <li><a href="${href}"${cls}>${label}</a></li>`;
  }
  return `
<nav class="navbar" id="navbar" aria-label="Main navigation">
  <div class="nav-c">
    <div class="nav-brand">
      <a href="/index.html" class="nav-logo-wrap" aria-label="NexEV">
        <img id="navLogoImg" src="/assets/logo/nexev-logo.png" alt="NexEV" class="nav-logo-img"
             onerror="this.style.display='none';document.getElementById('navLogoText').style.display='flex';"/>
        <span class="nav-logo-text" id="navLogoText" style="display:none;">
          <span class="logo-nex">nex</span><span class="logo-ev">EV</span>
        </span>
      </a>
      <span class="nav-slogan">Driven by Electric Future</span>
    </div>
    <ul class="nav-links">
${link('/index.html#products', 'Products')}
${link('/index.html#bms-design', 'BMS')}
${link('/index.html#market', 'India Market')}
${link('/index.html#bis-services', 'BIS Services')}
${link('/about.html', 'About')}
${link('/blog.html', 'Blog')}
${link('/faq.html', 'FAQ')}
      <li>
        <a href="/shop.html" class="nav-shop">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>
          Shop
        </a>
      </li>
      <li><a href="/index.html#enquiry" class="nav-cta">Contact Us</a></li>
      <li id="navAuthArea"><a href="/auth.html" class="nav-signin-link"><svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Sign In</a></li>
    </ul>
    <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mob-menu" id="mobMenu" aria-hidden="true">
  <a href="/index.html#products">Products</a>
  <a href="/index.html#market">India Market</a>
  <a href="/index.html#bms-design">BMS</a>
  <a href="/index.html#bis-services">BIS Services</a>
  <a href="/about.html">About</a>
  <a href="/blog.html">Blog</a>
  <a href="/faq.html">FAQ</a>
  <a href="/shop.html" class="mob-shop">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:.3rem"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>
    Shop — NexEV Store
  </a>
  <a href="/index.html#enquiry" class="mob-cta">Contact Us</a>
  <div id="mobMenuAuthArea"></div>
</div>`;
}

const HTML_FOOTER = `
<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/index.html" class="nav-logo-wrap" aria-label="NexEV" style="margin-bottom:.75rem;display:flex;">
          <img src="/assets/logo/nexev-logo.png" alt="NexEV" class="nav-logo-img"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
          <span class="nav-logo-text" style="display:none;color:#fff;">
            <span style="color:#fff;">nex</span><span class="logo-ev">EV</span>
          </span>
        </a>
        <p class="footer-tagline">NexEV India | EV Battery Packs,<br/> BMS &amp; Components for E-Bikes, E-Scooters &amp; Small EVs.</p>
        <div class="footer-legal-block">
          <p>NexEV Private Limited</p>
          <p class="cin">GSTIN: 29AALCN2942C1ZF</p>
          <p class="footer-loc">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
            Registered in Karnataka, India
          </p>
        </div>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/about.html">About NexEV</a>
        <a href="/index.html#products">Products</a>
        <a href="/blog.html">Blog</a>
        <a href="/index.html#opportunities">Opportunities</a>
        <a href="/index.html#bis-services">BIS Services</a>
      </div>
      <div class="footer-col">
        <h4>Engage</h4>
        <a href="/shop.html">Shop</a>
        <a href="/faq.html">FAQ</a>
        <a href="/index.html#aftermarket">Parts Distributor</a>
        <a href="/index.html#enquiry">Enquire Now</a>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <a href="mailto:service@nexev.in">service@nexev.in</a>
        <span>Response within 48 hrs</span>
        <span>Made in India 🇮🇳</span>
      </div>
    </div>
    <hr class="footer-hr" />
    <div class="footer-bottom">
      <p>&copy; 2026 NexEV. All rights reserved.</p>
    </div>
  </div>
</footer>

<button id="scrollTop" aria-label="Scroll to top">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
</button>`;

const HTML_SCRIPTS = `
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js"></script>
<script src="/assets/js/firebase-init.js"></script>
<script src="/assets/js/nav-auth.js"></script>
<script>
(function(){
'use strict';
var nav = document.getElementById('navbar');
window.addEventListener('scroll', function(){
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  var st = document.getElementById('scrollTop');
  if (st) st.classList.toggle('show', window.scrollY > 400);
}, { passive: true });
var hb = document.getElementById('hamburger'), mm = document.getElementById('mobMenu');
if (hb && mm) {
  hb.addEventListener('click', function(){
    var o = mm.classList.toggle('open');
    hb.setAttribute('aria-expanded', String(o));
    mm.setAttribute('aria-hidden', String(!o));
    document.body.style.overflow = o ? 'hidden' : '';
  });
  mm.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mm.classList.remove('open'); hb.setAttribute('aria-expanded','false');
      mm.setAttribute('aria-hidden','true'); document.body.style.overflow='';
    });
  });
}
var stBtn = document.getElementById('scrollTop');
if (stBtn) stBtn.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
</script>`;

/* ── 5. Content-block renderer (server-side) ──────────────────────── */
function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(function (blk) {
    if (typeof blk === 'string') return `<p>${esc(blk)}</p>`;
    switch (blk.type) {
      case 'h2':    return `<h2>${esc(blk.text)}</h2>`;
      case 'quote': return `<blockquote>${esc(blk.text)}</blockquote>`;
      case 'img':   return `<img src="${esc(blk.src)}" alt="${esc(blk.alt || '')}" loading="lazy"/>`;
      case 'ul':    return `<ul>${(blk.items || []).map(function (i) { return `<li>${esc(i)}</li>`; }).join('')}</ul>`;
      default:      return `<p>${esc(blk.text)}</p>`;
    }
  }).join('\n');
}

/* A single card (used by listing + related strip) */
function card(b) {
  return `        <a class="blog-card" href="${postUrl(b.slug)}" aria-label="Read: ${esc(b.title)}">
          <div class="bc-thumb"><img src="${esc(b.image)}" alt="${esc(b.title)}" loading="lazy" onerror="this.style.visibility='hidden'"/>${b.category ? `<span class="bc-cat">${esc(b.category)}</span>` : ''}</div>
          <div class="bc-body">
            <div class="bc-meta"><span>${fmtDate(b.date)}</span><span class="bc-dot"></span><span>${esc(readTime(b))}</span></div>
            <h2 class="bc-title">${esc(b.title)}</h2>
            <p class="bc-desc">${esc(b.description)}</p>
            <span class="bc-readmore">Read article <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </div>
        </a>`;
}

/* ── 6. Listing page (blog.html) ──────────────────────────────────── */
function buildListing(list) {
  const schema = ldSafe({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'NexEV Blog',
    url: SITE + '/blog.html',
    description: 'Guides, tutorials and build tips on lithium battery packs, BMS, spot welding and EV builds.',
    blogPost: list.map(function (b) {
      return {
        '@type': 'BlogPosting',
        headline: b.title,
        url: SITE + postUrl(b.slug),
        datePublished: b.date,
        image: absUrl(b.image)
      };
    })
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Blog — NexEV | EV Battery Guides, Tutorials &amp; Build Tips</title>
<meta name="description" content="Guides, tutorials and build tips from NexEV on lithium battery packs, BMS selection, spot welding, EV conversions and battery safety."/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<meta property="og:title" content="NexEV Blog — EV Battery Guides & Tutorials"/>
<meta property="og:description" content="Guides and tutorials on lithium battery packs, BMS, spot welding and EV builds."/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${SITE}/blog.html"/>
<meta property="og:image" content="${SITE}/assets/hero/bms.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="canonical" href="${SITE}/blog.html"/>
<script type="application/ld+json">${schema}</script>
<link rel="icon" href="/assets/logo/favicon.ico"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet"/>
<style>${CSS_BASE}${CSS_NAVBAR}${CSS_BREADCRUMB}${CSS_BLOG_LIST}${CSS_FOOTER}${CSS_SCROLL_TOP}</style>
</head>
<body>
${navbar('Blog')}

<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <ol class="bc-inner">
      <li><a href="/index.html">Home</a></li>
      <li class="bc-cur">Blog</li>
    </ol>
  </div>
</nav>

<section class="blog-hero">
  <div class="container">
    <span class="eyebrow">NexEV Journal</span>
    <h1>Battery Guides &amp; Build Tips</h1>
    <p>Practical guides, tutorials and how-tos on lithium packs, BMS selection, spot welding and EV builds — from the NexEV workshop.</p>
  </div>
</section>

<section class="blog-section">
  <div class="container">
    <div class="blog-grid">
${list.map(card).join('\n')}
    </div>
  </div>
</section>

${HTML_FOOTER}
${HTML_SCRIPTS}
</body>
</html>`;
}

/* ── 7. Post page (blog/{slug}.html) ──────────────────────────────── */
function buildPost(b, all) {
  const canonical = SITE + postUrl(b.slug);
  const img       = absUrl(b.image);
  const title     = b.title + ' — NexEV Blog';
  const related   = all.filter(function (x) { return x.slug !== b.slug; }).slice(0, 3);

  const schema = ldSafe({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: b.title,
    description: b.description || '',
    image: img ? [img] : [],
    datePublished: b.date,
    dateModified: b.date,
    articleSection: b.category || '',
    author:    { '@type': 'Organization', name: b.author || 'NexEV', url: SITE },
    publisher: {
      '@type': 'Organization',
      name: 'NexEV Private Limited',
      logo: { '@type': 'ImageObject', url: SITE + '/assets/logo/nexev-logo.png' }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }
  });

  const relatedHtml = related.length
    ? `<div class="article-more"><h3>More from the journal</h3><div class="blog-grid">
${related.map(card).join('\n')}
    </div></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(b.description || '')}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<meta property="og:title" content="${esc(b.title)}"/>
<meta property="og:description" content="${esc(b.description || '')}"/>
<meta property="og:type" content="article"/>
<meta property="og:url" content="${canonical}"/>
${img ? `<meta property="og:image" content="${esc(img)}"/>` : ''}
<meta property="og:site_name" content="NexEV"/>
<meta property="article:published_time" content="${esc(b.date)}"/>
${b.category ? `<meta property="article:section" content="${esc(b.category)}"/>` : ''}
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(b.title)}"/>
<meta name="twitter:description" content="${esc(b.description || '')}"/>
${img ? `<meta name="twitter:image" content="${esc(img)}"/>` : ''}
<link rel="canonical" href="${canonical}"/>
<script type="application/ld+json">${schema}</script>
<link rel="icon" href="/assets/logo/favicon.ico"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet"/>
<style>${CSS_BASE}${CSS_NAVBAR}${CSS_BREADCRUMB}${CSS_BLOG_LIST}${CSS_ARTICLE}${CSS_FOOTER}${CSS_SCROLL_TOP}</style>
</head>
<body>
${navbar('Blog')}

<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <ol class="bc-inner" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a href="/index.html" itemprop="item"><span itemprop="name">Home</span></a><meta itemprop="position" content="1"/></li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a href="/blog.html" itemprop="item"><span itemprop="name">Blog</span></a><meta itemprop="position" content="2"/></li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><span class="bc-cur" itemprop="name">${esc(b.title)}</span><meta itemprop="position" content="3"/></li>
    </ol>
  </div>
</nav>

<article class="article">
  <a class="article-back" href="/blog.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>All articles</a>
  ${b.category ? `<span class="article-cat">${esc(b.category)}</span>` : ''}
  <h1>${esc(b.title)}</h1>
  <div class="article-meta">${b.author ? `<span>By ${esc(b.author)}</span><span class="bc-dot"></span>` : ''}<span>${fmtDate(b.date)}</span><span class="bc-dot"></span><span>${esc(readTime(b))}</span></div>
  <img class="article-hero" src="${esc(b.image)}" alt="${esc(b.title)}" onerror="this.style.display='none'"/>
  <div class="article-content">
${renderBlocks(b.content)}
  </div>
  <div class="article-cta">
    <h3>Building a battery pack?</h3>
    <p>NexEV stocks cells, holders, BMS boards, nickel strip, chargers and connectors — everything in these guides.</p>
    <a class="btn-green" href="/shop.html">Browse the Shop</a>
  </div>
</article>
${relatedHtml}

${HTML_FOOTER}
${HTML_SCRIPTS}
</body>
</html>`;
}

/* ── 8. Generate ──────────────────────────────────────────────────── */
let count = 0;
blogs.forEach(function (b) {
  if (!b.slug) { console.error('  ✗  skipped a post with no slug'); return; }
  try {
    fs.writeFileSync(path.join(blogDir, b.slug + '.html'), buildPost(b, blogs), 'utf8');
    console.log('  ✓  blog/' + b.slug + '.html');
    count++;
  } catch (err) {
    console.error('  ✗  ' + b.slug + ': ' + err.message);
  }
});

fs.writeFileSync(path.join(rootDir, 'blog.html'), buildListing(blogs), 'utf8');
console.log('  ✓  blog.html (listing)');

/* ── 9. Patch sitemap.xml between the BLOG:START / BLOG:END markers ── */
const sitemapPath = path.join(rootDir, 'sitemap.xml');
const entries = blogs.map(function (b) {
  return '  <url><loc>' + SITE + postUrl(b.slug) + '</loc>' +
         '<lastmod>' + b.date + '</lastmod>' +
         '<changefreq>monthly</changefreq><priority>0.6</priority></url>';
}).join('\n');
const block = '  <!-- BLOG:START — generated by scripts/generate-blogs.js; do not edit by hand -->\n'
            + entries + '\n'
            + '  <!-- BLOG:END -->';

try {
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const re = /[ \t]*<!-- BLOG:START[\s\S]*?<!-- BLOG:END -->/;
  if (re.test(xml)) {
    xml = xml.replace(re, block);
  } else {
    /* No markers yet — insert the block just before </urlset> */
    xml = xml.replace(/<\/urlset>/, block + '\n</urlset>');
  }
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log('  ✓  sitemap.xml (blog URLs synced)');
} catch (err) {
  console.error('  ✗  could not update sitemap.xml: ' + err.message);
}

console.log('\nDone — ' + count + ' post page(s) + listing + sitemap updated.');
console.log('Tip: run this script any time data/blogs.json changes.');
