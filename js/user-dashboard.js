/* =============================================================
   Serenity — js/user-dashboard.js
   Client portal behaviour: view routing, mobile drawer, demo
   appointments list, demo messaging thread and shared notes.

   DEMO ONLY. Everything below runs on hard-coded sample data that
   lives in this file. Nothing is fetched, transmitted or saved.
   ============================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var on = function (el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); };
  var toast = window.SerenityToast || function () {};

  var VIEW_META = {
    dashboard: { title: 'Dashboard', sub: 'Your sessions, notes and messages' },
    appointments: { title: 'My Appointments', sub: 'Upcoming and past sessions' },
    messages: { title: 'Messages', sub: 'Secure-look demo thread with your therapist' },
    notes: { title: 'Therapist Notes', sub: 'Summaries your therapist has shared with you' },
    profile: { title: 'My Profile', sub: 'Your contact details' },
    settings: { title: 'Settings', sub: 'Notifications and session preferences' }
  };

  /* ------------------------------------------------------- sample data ---- */
  var APPOINTMENTS = [
    {
      id: 'apt-2041',
      when: '12 October 2026',
      time: '10:30 AM',
      kind: 'Individual Therapy',
      therapist: 'Dr. Ananya Rao',
      place: 'In person · Room 2',
      status: 'upcoming',
      badge: 'Confirmed'
    },
    {
      id: 'apt-2042',
      when: '26 October 2026',
      time: '4:00 PM',
      kind: 'Individual Therapy',
      therapist: 'Dr. Ananya Rao',
      place: 'Online video',
      status: 'upcoming',
      badge: 'Confirmed'
    },
    {
      id: 'apt-2033',
      when: '28 September 2026',
      time: '11:00 AM',
      kind: 'Individual Therapy',
      therapist: 'Dr. Ananya Rao',
      place: 'In person · Room 1',
      status: 'past',
      badge: 'Completed'
    },
    {
      id: 'apt-2028',
      when: '14 September 2026',
      time: '9:30 AM',
      kind: 'Individual Therapy',
      therapist: 'Dr. Ananya Rao',
      place: 'In person · Room 1',
      status: 'past',
      badge: 'Completed'
    },
    {
      id: 'apt-2019',
      when: '31 August 2026',
      time: '5:00 PM',
      kind: 'Individual Therapy',
      therapist: 'Dr. Ananya Rao',
      place: 'Online video',
      status: 'cancelled',
      badge: 'Cancelled'
    }
  ];

  var STATS = [
    { label: 'Sessions completed', value: '6', note: 'Since March 2026' },
    { label: 'Next session', value: '12 Oct', note: '10:30 AM · in person' },
    { label: 'Shared notes', value: '3', note: 'Latest 2 days ago' },
    { label: 'Unread messages', value: '2', note: 'From Dr. Ananya Rao' }
  ];

  var NOTES = [
    {
      id: 'note-1',
      date: '28 September 2026',
      therapist: 'Dr. Ananya Rao',
      title: 'Naming the worry loop',
      body:
        'You described noticing thoughts before they arrive — the feeling of something circling. We practised separating the noticing from the content, and you found the gap between them gave you real room. Worth repeating before the next session.',
      tag: 'Cognitive'
    },
    {
      id: 'note-2',
      date: '14 September 2026',
      therapist: 'Dr. Ananya Rao',
      title: 'Sleep and the evening scroll',
      body:
        'We looked at what happens in the hour before bed. The pattern is consistent enough to work with: screens last, sleep comes later. Try moving the phone charge point away from the bed and see what the week looks like.',
      tag: 'Sleep'
    },
    {
      id: 'note-3',
      date: '31 August 2026',
      therapist: 'Dr. Ananya Rao',
      title: 'What the first weeks held',
      body:
        'A useful recap of where things started and what has shifted. You came in wanting to stop the panic; the work since has been about building tolerance for it rather than removing it.',
      tag: 'Recap'
    }
  ];

  var CONVERSATIONS = [
    {
      id: 'c-ananya',
      name: 'Dr. Ananya Rao',
      role: 'Your therapist',
      avatar: '../assets/images/therapist-ananya.svg',
      unread: 2,
      preview: 'Looking forward to Tuesday — bring the notes you mentioned.',
      messages: [
        { from: 'them', at: '09:12', text: 'Hi Alex, good to hear from you. How has the week been since our last session?' },
        { from: 'me', at: '09:20', text: 'Better than the previous one. The breathing exercise helped twice, especially on Monday evening.' },
        { from: 'them', at: '09:41', text: 'That is encouraging. Let us use Tuesday to look at what made it easier to reach for.' },
        { from: 'them', at: '09:43', text: 'Looking forward to Tuesday — bring the notes you mentioned.' }
      ]
    },
    {
      id: 'c-care',
      name: 'Serenity Care Team',
      role: 'Scheduling support',
      avatar: '../assets/images/hero-counseling.svg',
      unread: 0,
      preview: 'Your receipt for session 5 is available in the portal.',
      messages: [
        { from: 'them', at: 'Tue', text: 'Hello Alex — your receipt for session 5 is available in the portal.' },
        { from: 'them', at: 'Tue', text: 'Please let us know at least 24 hours ahead if you need to reschedule.' }
      ]
    }
  ];

  var activeConversation = CONVERSATIONS[0].id;

  /* ------------------------------------------------------ view routing --- */
  function showView(name) {
    var key = VIEW_META[name] ? name : 'dashboard';
    $$('[data-view]').forEach(function (section) {
      section.hidden = section.getAttribute('data-view') !== key;
    });
    $$('[data-view-link]').forEach(function (btn) {
      var active = btn.getAttribute('data-view-link') === key;
      var isActiveChip = btn.classList.contains('bg-serenity-50');
      btn.setAttribute('aria-current', active ? 'page' : 'false');
      if (active) {
        btn.classList.add('bg-serenity-50', 'font-semibold', 'text-serenity-800');
        btn.classList.remove('text-ink/75', 'font-medium');
      } else if (isActiveChip) {
        btn.classList.remove('bg-serenity-50', 'font-semibold', 'text-serenity-800');
        btn.classList.add('text-ink/75', 'font-medium');
      }
    });

    var meta = VIEW_META[key];
    var title = $('[data-view-title]');
    var sub = $('[data-view-subtitle]');
    if (title) title.textContent = meta.title;
    if (sub) sub.textContent = meta.sub;
    document.title = meta.title + ' — Serenity Client Demo';

    if (history.replaceState) history.replaceState(null, '', '#' + key);
    closeDrawer();

    if (key === 'messages') scrollThread();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function initRouting() {
    $$('[data-view-link]').forEach(function (btn) {
      on(btn, 'click', function () { showView(btn.getAttribute('data-view-link')); });
    });
    var initial = (location.hash || '').replace('#', '');
    showView(VIEW_META[initial] ? initial : 'dashboard');
    on(window, 'hashchange', function () {
      var next = (location.hash || '').replace('#', '');
      if (VIEW_META[next]) showView(next);
    });
  }

  /* ---------------------------------------------------------- drawer ------ */
  var drawerOpen = false;

  function openDrawer() {
    var drawer = $('[data-sidebar]');
    var overlay = $('[data-sidebar-overlay]');
    var toggle = $('[data-sidebar-toggle]');
    if (!drawer) return;
    drawerOpen = true;
    drawer.classList.add('is-open');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.removeAttribute('aria-hidden');
    }
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden', 'lg:overflow-auto');
    var first = drawer.querySelector('button, a');
    if (first) first.focus();
  }

  function closeDrawer(returnFocus) {
    var drawer = $('[data-sidebar]');
    var overlay = $('[data-sidebar-overlay]');
    var toggle = $('[data-sidebar-toggle]');
    if (!drawer || !drawerOpen) return;
    drawerOpen = false;
    drawer.classList.remove('is-open');
    if (overlay) {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    }
    document.body.classList.remove('overflow-hidden', 'lg:overflow-auto');
  }

  function initDrawer() {
    on($('[data-sidebar-toggle]'), 'click', function () {
      if (drawerOpen) closeDrawer(true); else openDrawer();
    });
    on($('[data-sidebar-close]'), 'click', function () { closeDrawer(true); });
    on($('[data-sidebar-overlay]'), 'click', function () { closeDrawer(false); });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && drawerOpen) closeDrawer();
    });
    var wide = window.matchMedia('(min-width: 1024px)');
    var sync = function () { if (wide.matches && drawerOpen) closeDrawer(); };
    if (wide.addEventListener) wide.addEventListener('change', sync);
    else if (wide.addListener) wide.addListener(sync);
  }

  /* ---------------------------------------------------------- stats ------- */
  function renderStats() {
    var host = $('[data-dashboard-stats]');
    if (!host) return;
    host.innerHTML = STATS.map(function (stat) {
      return (
        '<div class="rounded-2xl border border-ink/6 bg-surface p-6 shadow-card">' +
        '<p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/50">' + stat.label + '</p>' +
        '<p class="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-serenity-800">' + stat.value + '</p>' +
        '<p class="mt-1.5 text-[0.8rem] text-ink/55">' + stat.note + '</p>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------------------------------------------------------- notes ------- */
  function noteCard(note, compact) {
    return (
      '<article class="rounded-2xl border border-ink/6 bg-surface p-6 shadow-card">' +
      '<div class="flex items-start justify-between gap-4">' +
      '<div class="min-w-0">' +
      '<h4 class="text-[0.98rem] font-semibold">' + note.title + '</h4>' +
      '<p class="mt-1 text-[0.78rem] text-ink/55">' + note.therapist + ' · ' + note.date + '</p>' +
      '</div>' +
      '<span class="shrink-0 rounded-full bg-serenity-50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-serenity-700">' + note.tag + '</span>' +
      '</div>' +
      '<p class="mt-4 text-[0.88rem] leading-relaxed text-ink/75">' + note.body + '</p>' +
      (compact ? '' :
        '<p class="mt-4 border-t border-ink/8 pt-3 text-[0.72rem] text-ink/45">Summary written by your therapist. Not a clinical record.</p>') +
      '</article>'
    );
  }

  function renderNotes() {
    var preview = $('[data-notes-preview]');
    if (preview) preview.innerHTML = NOTES.slice(0, 2).map(function (n) { return noteCard(n, true); }).join('');
    var list = $('[data-notes-list]');
    if (list) list.innerHTML = NOTES.map(function (n) { return noteCard(n, false); }).join('');
  }

  /* ----------------------------------------------------- appointments ----- */
  var apptFilter = 'all';

  function apptRow(appt) {
    var tone =
      appt.status === 'upcoming'
        ? 'bg-sage-500/10 text-sage-600'
        : appt.status === 'cancelled'
          ? 'bg-clay-500/10 text-clay-600'
          : 'bg-sand-200 text-ink/60';
    var actions =
      appt.status === 'upcoming'
        ? '<div class="flex flex-wrap gap-2">' +
          '<button type="button" data-demo-action="Appointment details are sample data in this demo." class="btn-outline btn-sm">View</button>' +
          '<button type="button" data-demo-action="Rescheduling is disabled in this demo build." class="btn-ghost btn-sm">Reschedule</button>' +
          '<button type="button" data-demo-action="Cancellation is disabled in this demo build." class="btn-ghost btn-sm">Cancel</button>' +
          '</div>'
        : '<button type="button" data-demo-action="Session summaries live in Therapist Notes." class="btn-ghost btn-sm">View notes</button>';

    return (
      '<article class="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">' +
      '<div class="min-w-0">' +
      '<div class="flex flex-wrap items-center gap-2.5">' +
      '<h4 class="text-[0.95rem] font-semibold">' + appt.kind + '</h4>' +
      '<span class="rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ' + tone + '">' + appt.badge + '</span>' +
      '</div>' +
      '<p class="mt-1.5 text-[0.85rem] text-ink/70">' + appt.when + ' · ' + appt.time + '</p>' +
      '<p class="mt-1 text-[0.8rem] text-ink/50">' + appt.therapist + ' · ' + appt.place + '</p>' +
      '</div>' +
      actions +
      '</article>'
    );
  }

  function renderAppointments() {
    var host = $('[data-appointments-list]');
    if (!host) return;
    var rows = APPOINTMENTS.filter(function (a) {
      if (apptFilter === 'all') return true;
      if (apptFilter === 'upcoming') return a.status === 'upcoming';
      return a.status === 'past' || a.status === 'cancelled';
    });
    host.innerHTML = rows.length
      ? rows.map(apptRow).join('')
      : '<p class="p-8 text-center text-[0.85rem] text-ink/55">No appointments in this view.</p>';
  }

  function initAppointments() {
    $$('[data-appt-filter]').forEach(function (btn) {
      on(btn, 'click', function () {
        apptFilter = btn.getAttribute('data-appt-filter');
        $$('[data-appt-filter]').forEach(function (other) {
          var active = other === btn;
          other.setAttribute('aria-pressed', String(active));
          if (active) {
            other.className = 'rounded-full border border-serenity-600 bg-serenity-600 px-3.5 py-2 text-[0.78rem] font-semibold text-white transition-colors duration-300';
          } else {
            other.className = 'rounded-full border border-ink/12 bg-surface px-3.5 py-2 text-[0.78rem] font-medium text-ink/75 transition-colors duration-300';
          }
        });
        renderAppointments();
      });
    });
    renderAppointments();
  }

  /* ------------------------------------------------------- messaging ------ */
  function currentConversation() {
    return CONVERSATIONS.filter(function (c) { return c.id === activeConversation; })[0] || CONVERSATIONS[0];
  }

  function renderConversations() {
    var host = $('[data-conversations]');
    if (!host) return;
    host.innerHTML = CONVERSATIONS.map(function (c) {
      var active = c.id === activeConversation;
      return (
        '<li><button type="button" data-conversation="' + c.id + '" aria-current="' + (active ? 'true' : 'false') + '" ' +
        'class="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors duration-300 ' +
        (active ? 'bg-serenity-50' : 'hover:bg-sand-50') + '">' +
        '<img src="' + c.avatar + '" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" width="40" height="40" />' +
        '<span class="min-w-0 flex-1">' +
        '<span class="flex items-center justify-between gap-2">' +
        '<span class="truncate text-[0.86rem] font-semibold">' + c.name + '</span>' +
        (c.unread
          ? '<span class="shrink-0 rounded-full bg-serenity-600 px-2 py-0.5 text-[0.62rem] font-bold text-white">' + c.unread + '</span>'
          : '') +
        '</span>' +
        '<span class="mt-0.5 block text-[0.72rem] text-ink/50">' + c.role + '</span>' +
        '<span class="mt-1 block truncate text-[0.76rem] text-ink/60">' + c.preview + '</span>' +
        '</span></button></li>'
      );
    }).join('');

    $$('[data-conversation]', host).forEach(function (btn) {
      on(btn, 'click', function () {
        activeConversation = btn.getAttribute('data-conversation');
        var convo = currentConversation();
        convo.unread = 0;
        convo.preview = convo.messages[convo.messages.length - 1].text.slice(0, 48);
        renderConversations();
        renderThread();
      });
    });
  }

  function renderThread() {
    var convo = currentConversation();
    var head = $('[data-thread-header]');
    var thread = $('[data-thread]');
    if (!head || !thread) return;

    head.innerHTML =
      '<img src="' + convo.avatar + '" alt="" class="h-11 w-11 shrink-0 rounded-full object-cover" width="44" height="44" />' +
      '<div class="min-w-0 flex-1">' +
      '<p class="truncate text-[0.92rem] font-semibold">' + convo.name + '</p>' +
      '<p class="text-[0.74rem] text-ink/50">' + convo.role + ' · demo thread</p>' +
      '</div>' +
      '<button type="button" data-demo-action="Calling and video are not available in this demo." class="btn-ghost btn-sm">Call</button>';

    thread.innerHTML = convo.messages.map(function (msg) {
      var mine = msg.from === 'me';
      return (
        '<div class="flex ' + (mine ? 'justify-end' : 'justify-start') + '">' +
        '<div class="max-w-[85%] sm:max-w-[70%]">' +
        '<div class="rounded-2xl px-4 py-3 text-[0.87rem] leading-relaxed ' +
        (mine ? 'rounded-br-md bg-serenity-700 text-white' : 'rounded-bl-md bg-raised text-ink') + '">' +
        msg.text +
        '</div>' +
        '<p class="mt-1 text-[0.68rem] text-ink/40 ' + (mine ? 'text-right' : '') + '">' + msg.at + '</p>' +
        '</div></div>'
      );
    }).join('');

    scrollThread();
  }

  function scrollThread() {
    var thread = $('[data-thread]');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  function initMessaging() {
    renderConversations();
    renderThread();

    var form = $('[data-message-form]');
    var input = form ? form.querySelector('[name="message"]') : null;
    on(input, 'input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    on(form, 'submit', function (e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text) {
        toast('Type a message first.', 'error');
        return;
      }
      var convo = currentConversation();
      convo.messages.push({ from: 'me', at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: text });
      convo.preview = text.slice(0, 48);
      input.value = '';
      input.style.height = 'auto';
      renderConversations();
      renderThread();
      toast('Demo message added locally — nothing was sent.', 'demo');
    });
  }

  /* --------------------------------- theme + RTL toggles (no navbar) ---- */
  function initDisplayToggles() {
    var themeBtns = $$('[data-theme-toggle]');
    var rtlBtns = $$('[data-rtl-toggle]');

    function paintTheme() {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeBtns.forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(dark));
        var moon = btn.querySelector('[data-icon-moon]');
        var sun = btn.querySelector('[data-icon-sun]');
        if (moon) moon.classList.toggle('hidden', dark);
        if (sun) sun.classList.toggle('hidden', !dark);
      });
    }

    function paintRtl() {
      var rtl = document.documentElement.getAttribute('dir') === 'rtl';
      rtlBtns.forEach(function (btn) { btn.setAttribute('aria-pressed', String(rtl)); });
    }

    var savedTheme = null;
    var savedDir = null;
    try {
      savedTheme = localStorage.getItem('serenity-theme');
      savedDir = localStorage.getItem('serenity-dir');
    } catch (e) {}
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    if (savedDir === 'rtl') document.documentElement.setAttribute('dir', 'rtl');
    paintTheme();
    paintRtl();
    window.requestAnimationFrame(function () {
      document.documentElement.setAttribute('data-theme-ready', '');
    });

    themeBtns.forEach(function (btn) {
      on(btn, 'click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('serenity-theme', isDark ? 'light' : 'dark'); } catch (e) {}
        paintTheme();
      });
    });
    rtlBtns.forEach(function (btn) {
      on(btn, 'click', function () {
        var isRtl = document.documentElement.getAttribute('dir') === 'rtl';
        if (isRtl) document.documentElement.removeAttribute('dir');
        else document.documentElement.setAttribute('dir', 'rtl');
        try { localStorage.setItem('serenity-dir', isRtl ? 'ltr' : 'rtl'); } catch (e) {}
        paintRtl();
      });
    });
  }

  /* [data-demo-action] is handled by a delegated listener in main.js. */

  function init() {
    if (!document.querySelector('[data-view]')) return;
    initDisplayToggles();
    initRouting();
    initDrawer();
    renderStats();
    renderNotes();
    initAppointments();
    initMessaging();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
