/* =============================================================
   Serenity — js/auth.js
   DEMO-ONLY client-side session handling.

   Important: this file performs no real authentication. There is no
   backend, no password hashing and no token issuing. It only keeps a
   small, non-sensitive demo profile (display name, role) so the
   dashboards can render. Passwords are never read back, stored,
   logged or compared against anything real.
   ============================================================= */
(function () {
  'use strict';

  var SESSION_KEY = 'serenity.demo.session';
  var REMEMBER_KEY = 'serenity.demo.remember';

  function storage(kind) {
    try {
      return kind === 'local' ? window.localStorage : window.sessionStorage;
    } catch (err) {
      return null;
    }
  }

  function parse(raw) {
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : null;
    } catch (err) {
      return null;
    }
  }

  function roleFromEmail(email) {
    return /^(admin|admin@)/i.test(email) ? 'admin' : 'client';
  }

  function nameFromEmail(email) {
    if (roleFromEmail(email) === 'admin') return 'Priya Nair';
    var local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    if (!local) return 'Alex Morgan';
    var bits = local.split(' ');
    if (bits.length === 1) return bits[0].charAt(0).toUpperCase() + bits[0].slice(1);
    return bits.map(function (b) { return b.charAt(0).toUpperCase() + b.slice(1); }).join(' ');
  }

  var Auth = {
    isDemo: true,

    getSession: function () {
      var local = storage('local');
      var session = storage('session');
      return parse((session && session.getItem(SESSION_KEY)) || (local && local.getItem(REMEMBER_KEY)));
    },

    isSignedIn: function () {
      return !!this.getSession();
    },

    role: function () {
      var s = this.getSession();
      return s ? s.role : null;
    },

    displayName: function () {
      var s = this.getSession();
      return s ? s.name : 'Alex Morgan';
    },

    /* Signs in for demo purposes only. The password value is accepted,
       validated for shape, then discarded immediately. */
    signIn: function (email, password, remember) {
      var clean = (email || '').trim();
      var errors = [];
      if (!clean) errors.push('Email is required.');
      else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(clean)) errors.push('Enter a valid email address.');
      if (!password) errors.push('Password is required.');
      else if (password.length < 8) errors.push('Password must be at least 8 characters.');
      if (errors.length) return { ok: false, errors: errors };

      var profile = {
        name: nameFromEmail(clean),
        email: clean,
        role: roleFromEmail(clean),
        demo: true,
        at: new Date().toISOString()
      };

      var session = storage('session');
      var local = storage('local');
      if (session) session.setItem(SESSION_KEY, JSON.stringify(profile));
      if (local) {
        if (remember) local.setItem(REMEMBER_KEY, JSON.stringify(profile));
        else local.removeItem(REMEMBER_KEY);
      }
      return { ok: true, profile: profile };
    },

    signOut: function () {
      var session = storage('session');
      var local = storage('local');
      if (session) session.removeItem(SESSION_KEY);
      if (local) local.removeItem(REMEMBER_KEY);
    },

    /* Renders the signed-in chip used by dashboards + login pages. */
    renderChip: function (root) {
      var s = this.getSession();
      if (!root) return;
      root.innerHTML =
        '<div class="flex items-center gap-2.5 rounded-full border border-ink/10 bg-surface py-1 pl-1 pr-4">' +
        '<span class="grid h-8 w-8 place-items-center rounded-full bg-serenity-600 text-xs font-semibold text-white" aria-hidden="true">' +
        this.displayName().slice(0, 2).toUpperCase() +
        '</span>' +
        '<span class="leading-tight">' +
        '<span class="block text-[0.78rem] font-semibold text-ink">' + this.displayName() + '</span>' +
        '<span class="block text-[0.66rem] uppercase tracking-[0.12em] text-ink/50">' +
        (s && s.role === 'admin' ? 'Practice admin' : 'Client') + ' · demo</span>' +
        '</span></div>';
    },

    /* Adds the "demo portal" disclosure + sign-in shortcut to dashboards. */
    guardDashboard: function (options) {
      var opts = options || {};
      var slot = document.querySelector(opts.slot || '[data-demo-banner]');
      if (!slot) return;
      var s = this.getSession();
      var rightRole = !s || (opts.role ? s.role === opts.role : true);

      if (s && rightRole) {
        slot.hidden = false;
        slot.className =
          'mb-6 flex flex-col gap-3 rounded-2xl border border-dashed border-clay-500/45 bg-clay-500/6 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between';
        slot.innerHTML =
          '<p class="flex items-start gap-2 text-[0.82rem] leading-relaxed text-clay-600">' +
          '<svg viewBox="0 0 24 24" class="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><circle cx="12" cy="16.2" r="0.9" fill="currentColor"/></svg>' +
          '<span><strong class="font-semibold">Demo portal.</strong> Sample data only — no real client records, no secure messaging and no real authentication are implemented in this front-end build.</span></p>' +
          '<button type="button" data-demo-signout class="shrink-0 rounded-full border border-clay-500/40 px-4 py-2 text-xs font-semibold text-clay-600 transition-colors duration-300 hover:bg-clay-500 hover:text-white">Sign out</button>';
        var btn = slot.querySelector('[data-demo-signout]');
        if (btn) {
          btn.addEventListener('click', function () {
            Auth.signOut();
            window.location.href = (/\/dashboard\//i.test(location.pathname) ? '../' : './') + 'login.html';
          });
        }
        return;
      }

      slot.hidden = false;
      slot.className =
        'mb-6 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-serenity-600/35 bg-serenity-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between';
      slot.innerHTML =
        '<div>' +
        '<h2 class="text-base font-semibold text-serenity-900">Sign in to view this demo portal</h2>' +
        '<p class="mt-1 max-w-xl text-[0.85rem] leading-relaxed text-ink/70">' +
        'This preview works without an account. Sign in with any valid email and an 8-character password. Use an email starting with <strong>admin</strong> to open the practice dashboard.' +
        '</p></div>' +
        '<a href="' + (/\/dashboard\//i.test(location.pathname) ? '../' : './') + 'login.html" class="btn-primary shrink-0">Go to Login</a>';
    },

    /* Wires a login form. Uses the same field errors as main.js when present. */
    bindLoginForm: function (form) {
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = form.querySelector('[name="email"]');
        var password = form.querySelector('[name="password"]');
        var remember = form.querySelector('[name="remember"]');
        var status = form.querySelector('[data-auth-status]');
        var result = Auth.signIn(email ? email.value : '', password ? password.value : '', remember ? remember.checked : false);

        if (!result.ok) {
          if (status) {
            status.hidden = false;
            status.textContent = result.errors.join(' ');
            status.className = 'mt-3 rounded-xl bg-clay-500/10 px-4 py-3 text-[0.82rem] font-medium text-clay-600';
          }
          if (password) password.value = '';
          return;
        }

        if (status) {
          status.hidden = false;
          status.className = 'mt-3 rounded-xl bg-serenity-50 px-4 py-3 text-[0.82rem] font-medium text-serenity-800';
          status.textContent = 'Signed in as ' + result.profile.name + ' (demo). Redirecting…';
        }
        if (password) password.value = '';
        window.setTimeout(function () {
          window.location.href =
            (result.profile.role === 'admin' ? BASE_HREF('dashboard/admin-dashboard.html') : BASE_HREF('dashboard/user-dashboard.html'));
        }, 650);
      });
    }
  };

  function BASE_HREF(page) {
    return (/\/dashboard\//i.test(location.pathname) ? '../' : './') + page;
  }

  window.SerenityAuth = Auth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      var form = document.querySelector('[data-login-form]');
      if (form) Auth.bindLoginForm(form);
      var chip = document.querySelector('[data-auth-chip]');
      if (chip) Auth.renderChip(chip);
      var banner = document.querySelector('[data-demo-banner]');
      if (banner && banner.hasAttribute('data-guard-role')) Auth.guardDashboard({ role: banner.getAttribute('data-guard-role') });

      /* show / hide password */
      var toggle = document.querySelector('[data-toggle-password]');
      if (toggle) {
        var target = document.getElementById(toggle.getAttribute('for'));
        toggle.addEventListener('click', function () {
          var showing = target.type === 'text';
          target.type = showing ? 'password' : 'text';
          toggle.textContent = showing ? 'Show' : 'Hide';
          toggle.setAttribute('aria-pressed', String(!showing));
        });
      }

      /* demo credential shortcuts */
      Array.prototype.forEach.call(document.querySelectorAll('[data-demo-fill]'), function (btn) {
        btn.addEventListener('click', function () {
          var email = document.getElementById('login-email');
          var password = document.getElementById('login-password');
          if (email) email.value = btn.getAttribute('data-demo-fill');
          if (password) password.value = 'serenitydemo';
          if (email) email.focus();
        });
      });
    });
  }
})();