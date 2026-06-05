/*
 * NexEV Firebase Init — environment-aware
 *
 * LOCAL DEV (file://, localhost, 127.0.0.1, wsl.localhost, …):
 *   Dynamically loads firebase-local.js which sets window._localFirebaseConfig.
 *   Works when opened via any of:
 *     file://wsl.localhost/Ubuntu-22.04/opt/nexev/nexev/shop.html  ← direct file open
 *     http://localhost:5500  ← VS Code Live Server
 *     http://127.0.0.1:3000  ← any local HTTP server
 *   Setup:
 *     1. cp firebase-local.example.js firebase-local.js
 *     2. Fill in your credentials (from Firebase Console > Project Settings)
 *     3. Open the file directly in the browser OR use a local HTTP server
 *
 * PRODUCTION (Cloudflare Pages):
 *   Fetches /api/firebase-config which reads context.env.FIREBASE_* variables.
 *   Set in Pages > Settings > Environment variables:
 *     FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_DATABASE_URL,
 *     FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET,
 *     FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
 *
 * LOCAL WRANGLER (npx wrangler pages dev):
 *   Create .dev.vars with the same FIREBASE_* keys — same as production path.
 *
 * DATABASE SECURITY RULES (paste in Firebase Console > Realtime Database > Rules):
 * {
 *   "rules": {
 *     "users":  { "$uid": { ".read":"$uid===auth.uid", ".write":"$uid===auth.uid" } },
 *     "orders": {
 *       "$orderId": {
 *         ".read":  "auth!=null&&(data.child('userId').val()===auth.uid||root.child('admins').child(auth.uid).exists())",
 *         ".write": "!data.exists()||(auth!=null&&root.child('admins').child(auth.uid).exists())"
 *       }
 *     },
 *     "admins": { ".read":"auth!=null", ".write":false }
 *   }
 * }
 */

(function () {
  /* Treat as local whenever there is no real HTTP server:
     - file:// protocol (direct open, including file://wsl.localhost/...)
     - hostname is localhost, 127.0.0.1, or empty
     - hostname ends in .localhost or is wsl.localhost                    */
  var isLocal = location.protocol === 'file:'
    || ['localhost', '127.0.0.1', ''].indexOf(location.hostname) !== -1
    || /(?:^|\.)localhost$/i.test(location.hostname);

  function initApp(cfg) {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    return true;
  }

  function errBanner(msg) {
    var b = document.createElement('div');
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#dc2626;color:#fff;'
      + 'text-align:center;padding:.65rem 1.5rem;font-size:.82rem;font-family:sans-serif;line-height:1.5';
    b.textContent = '⚠️ ' + msg;
    var fn = function () { if (document.body) document.body.appendChild(b); };
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn) : fn();
  }

  if (isLocal) {
    window._fbReady = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = 'firebase-local.js';
      s.onload = function () {
        var cfg = window._localFirebaseConfig;
        if (!cfg || !cfg.apiKey) {
          errBanner('firebase-local.js loaded but window._localFirebaseConfig is empty — fill in your credentials.');
          resolve(false);
        } else {
          resolve(initApp(cfg));
        }
      };
      s.onerror = function () {
        errBanner('Local dev: copy firebase-local.example.js → firebase-local.js and fill in your Firebase credentials.');
        resolve(false);
      };
      document.head.appendChild(s);
    });
  } else {
    window._fbReady = fetch('/api/firebase-config')
      .then(function (r) {
        if (!r.ok) throw new Error('Config fetch ' + r.status);
        return r.json();
      })
      .then(function (cfg) {
        if (cfg.error) throw new Error(cfg.error);
        return initApp(cfg);
      })
      .catch(function (err) {
        console.error('[NexEV] Firebase config error:', err.message);
        errBanner('Firebase config error — set FIREBASE_* env vars in Cloudflare Pages. ' + err.message);
        return false;
      });
  }
})();
