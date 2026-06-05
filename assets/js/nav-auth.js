/**
 * nav-auth.js — NexEV shared navbar auth state
 * Include AFTER firebase-init.js on every page (except index.html).
 * Expects #navAuthArea and #mobMenuAuthArea placeholders in the page markup.
 */
(function () {
  'use strict';

  /* ── Inject shared CSS ─────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.nav-user-wrap{position:relative;display:flex;align-items:center}',
    '.nuw-btn{display:flex;align-items:center;gap:.4rem;padding:.42rem .75rem;border-radius:7px;',
    '  border:1.5px solid var(--border);background:#fff;font-size:.82rem;font-weight:600;',
    '  color:var(--blue);cursor:pointer;font-family:inherit;transition:all .2s;white-space:nowrap}',
    '.nuw-btn:hover{border-color:var(--blue);background:var(--bg-alt)}',
    '.nuw-av{width:26px;height:26px;border-radius:50%;background:var(--blue);color:#fff;',
    '  font-size:.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.nuw-menu{display:none;position:absolute;top:calc(100% + .5rem);right:0;background:#fff;',
    '  border:1.5px solid var(--border);border-radius:10px;min-width:175px;padding:.4rem;',
    '  box-shadow:0 8px 28px rgba(0,0,0,.1);z-index:250}',
    '.nuw-menu.open{display:block}',
    '.nuw-item{display:flex;align-items:center;gap:.55rem;padding:.5rem .7rem;border-radius:7px;',
    '  font-size:.84rem;font-weight:500;color:var(--text);cursor:pointer;',
    '  text-decoration:none;border:none;background:none;font-family:inherit;',
    '  width:100%;text-align:left;transition:background .12s}',
    '.nuw-item:hover{background:var(--bg-alt)}',
    '.nuw-item-danger{color:#dc2626!important}',
    '.nuw-item-danger:hover{background:rgba(239,68,68,.06)!important}',
    '.nuw-divider{height:1px;background:var(--border);margin:.3rem .5rem}',
    '.nav-signin-link{display:inline-flex;align-items:center;gap:.35rem;padding:.42rem .85rem;',
    '  border-radius:7px;border:1.5px solid var(--border);color:var(--blue);',
    '  font-size:.825rem;font-weight:700;text-decoration:none;background:#fff;transition:all .2s}',
    '.nav-signin-link:hover{border-color:var(--blue);background:var(--bg-alt)}',
    '.mob-auth-row{display:flex;align-items:center;gap:.7rem;padding:.5rem .75rem;',
    '  font-size:.9rem;font-weight:700;color:var(--blue)}',
    '.mob-auth-av{width:32px;height:32px;border-radius:50%;background:var(--blue);color:#fff;',
    '  font-size:.82rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
  ].join('');
  document.head.appendChild(style);

  /* ── SVG icons ─────────────────────────────────────────────────────────── */
  var I_USER   = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  var I_OUT    = '<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
  var I_CHEV   = '<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>';

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function doSignOut() {
    firebase.auth().signOut().then(function () {
      if (/account\.html|admin\.html/.test(location.pathname)) {
        location.href = 'auth.html';
      }
    });
  }

  /* ── Desktop navbar auth area ──────────────────────────────────────────── */
  function updateDesktop(user) {
    var area = document.getElementById('navAuthArea');
    if (!area) return;

    if (user) {
      var name = (user.displayName || user.email || 'Account').split(' ')[0];
      var init = name.charAt(0).toUpperCase();
      area.innerHTML =
        '<div class="nav-user-wrap">' +
          '<button class="nuw-btn" id="nuwBtn" aria-haspopup="true" aria-expanded="false">' +
            '<div class="nuw-av">' + esc(init) + '</div>' +
            esc(name) + I_CHEV +
          '</button>' +
          '<div class="nuw-menu" id="nuwMenu" role="menu">' +
            '<a href="account.html" class="nuw-item">' + I_USER + 'My Account</a>' +
            '<div class="nuw-divider"></div>' +
            '<button id="nuwSignOut" class="nuw-item nuw-item-danger">' + I_OUT + 'Sign Out</button>' +
          '</div>' +
        '</div>';

      var btn  = document.getElementById('nuwBtn');
      var menu = document.getElementById('nuwMenu');

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', function () {
        menu.classList.remove('open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      document.getElementById('nuwSignOut').addEventListener('click', doSignOut);
    } else {
      area.innerHTML = '<a href="auth.html" class="nav-signin-link">' + I_USER + 'Sign In</a>';
    }
  }

  /* ── Mobile menu auth area ─────────────────────────────────────────────── */
  function updateMobile(user) {
    var area = document.getElementById('mobMenuAuthArea');
    if (!area) return;

    if (user) {
      var name = (user.displayName || user.email || 'Account').split(' ')[0];
      var init = name.charAt(0).toUpperCase();
      area.innerHTML =
        '<div class="mob-auth-row"><div class="mob-auth-av">' + esc(init) + '</div>' + esc(name) + '</div>' +
        '<a href="account.html" style="display:flex;align-items:center;gap:.4rem;padding:.6rem .75rem;border-radius:8px;font-weight:600;color:var(--blue);text-decoration:none;transition:background .12s" onmouseover="this.style.background=\'var(--bg-alt)\'" onmouseout="this.style.background=\'\'">' + I_USER + 'My Account</a>' +
        '<button id="mobSignOutBtn" style="display:flex;align-items:center;gap:.4rem;padding:.6rem .75rem;border-radius:8px;font-weight:600;color:#dc2626;background:none;border:none;cursor:pointer;font-family:inherit;width:100%;text-align:left">' + I_OUT + 'Sign Out</button>';
      document.getElementById('mobSignOutBtn').addEventListener('click', doSignOut);
    } else {
      area.innerHTML =
        '<a href="auth.html" style="display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.7rem .75rem;border-radius:10px;font-weight:700;background:var(--blue);color:#fff;text-decoration:none">' + I_USER + 'Sign In</a>';
    }
  }

  /* ── Init ──────────────────────────────────────────────────────────────── */
  (window._fbReady || Promise.resolve(false)).then(function (ok) {
    if (!ok) return;
    firebase.auth().onAuthStateChanged(function (user) {
      updateDesktop(user);
      updateMobile(user);
    });
  });
})();
