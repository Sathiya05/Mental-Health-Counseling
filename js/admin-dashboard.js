/* =============================================================
   Serenity — js/admin-dashboard.js
   Practice dashboard behaviour: view routing, mobile drawer,
   demo appointment management, client/therapist directories and
   dependency-free bar charts.

   DEMO ONLY. All figures are hard-coded sample data held in this
   file. Nothing is fetched, transmitted or persisted.
   ============================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var on = function (el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); };
  var toast = window.SerenityToast || function () {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var VIEW_META = {
    overview: { title: 'Overview', sub: 'Practice snapshot for this week' },
    appointments: { title: 'Appointments', sub: 'Manage and review every booking' },
    clients: { title: 'Clients', sub: 'Active client records' },
    therapists: { title: 'Therapists', sub: 'Your team and current load' },
    reports: { title: 'Reports', sub: 'Simple demo practice figures' }
  };

  /* ------------------------------------------------------- sample data ---- */
  var STATS = [
    { label: 'Sessions this week', value: '28', note: '+4 vs. last week', tone: 'sage' },
    { label: 'Active clients', value: '41', note: '6 new this month', tone: 'teal' },
    { label: 'Therapists on rota', value: '6', note: '2 with open slots', tone: 'sand' },
    { label: 'Pending requests', value: '7', note: 'Oldest: 2 days', tone: 'clay' }
  ];

  var WEEK = [
    { day: 'Mon', value: 6 },
    { day: 'Tue', value: 5 },
    { day: 'Wed', value: 7 },
    { day: 'Thu', value: 4 },
    { day: 'Fri', value: 3 },
    { day: 'Sat', value: 2 },
    { day: 'Sun', value: 1 }
  ];

  var MONTHS = [
    { m: 'Jan', value: 16 }, { m: 'Feb', value: 19 }, { m: 'Mar', value: 22 },
    { m: 'Apr', value: 20 }, { m: 'May', value: 24 }, { m: 'Jun', value: 26 },
    { m: 'Jul', value: 21 }, { m: 'Aug', value: 18 }, { m: 'Sep', value: 18 }
  ];

  var SERVICE_MIX = [
    { label: 'Individual therapy', pct: 46, tone: 'bg-serenity-600' },
    { label: 'Anxiety & stress', pct: 22, tone: 'bg-sage-500' },
    { label: 'Couples & family', pct: 18, tone: 'bg-clay-500' },
    { label: 'Growth & workplace', pct: 14, tone: 'bg-sand-500' }
  ];

  var APPOINTMENTS = [
    { id: 'S-1042', client: 'Alex Morgan', initials: 'AM', therapist: 'Dr. Ananya Rao', when: '12 Oct 2026 · 10:30 AM', service: 'Individual therapy', status: 'confirmed' },
    { id: 'S-1043', client: 'Nisha Pillai', initials: 'NP', therapist: 'Dr. Meera Iyer', when: '12 Oct 2026 · 11:30 AM', service: 'Anxiety & stress', status: 'confirmed' },
    { id: 'S-1044', client: 'Rahul Verma', initials: 'RV', therapist: 'Dr. Arjun Menon', when: '12 Oct 2026 · 1:00 PM', service: 'Couples & family', status: 'pending' },
    { id: 'S-1045', client: 'Divya Menon', initials: 'DM', therapist: 'Dr. Kavya Nair', when: '12 Oct 2026 · 3:00 PM', service: 'Individual therapy', status: 'confirmed' },
    { id: 'S-1046', client: 'Imran Sheikh', initials: 'IS', therapist: 'Dr. Rahul Bose', when: '12 Oct 2026 · 5:00 PM', service: 'Growth & workplace', status: 'pending' },
    { id: 'S-1047', client: 'Leela Krishnan', initials: 'LK', therapist: 'Dr. Ananya Rao', when: '12 Oct 2026 · 6:30 PM', service: 'Individual therapy', status: 'cancelled' },
    { id: 'S-1039', client: 'Arjun Sharma', initials: 'AS', therapist: 'Dr. Meera Iyer', when: '11 Oct 2026 · 4:00 PM', service: 'Anxiety & stress', status: 'completed' },
    { id: 'S-1040', client: 'Fatima Ali', initials: 'FA', therapist: 'Dr. Kavya Nair', when: '11 Oct 2026 · 6:00 PM', service: 'Individual therapy', status: 'completed' },
    { id: 'S-1041', client: 'Ravi Shankar', initials: 'RS', therapist: 'Dr. Rahul Bose', when: '13 Oct 2026 · 9:00 AM', service: 'Growth & workplace', status: 'confirmed' }
  ];

  var STATUS_TONE = {
    confirmed: 'bg-sage-500/10 text-sage-600',
    pending: 'bg-clay-500/10 text-clay-600',
    completed: 'bg-sand-200 text-ink/60',
    cancelled: 'bg-ink/8 text-ink/55'
  };

  var THERAPISTS = [
    { name: 'Dr. Ananya Rao', role: 'Clinical Psychologist', img: 'therapist-ananya.svg', focus: 'Anxiety, panic, life transitions', sessions: 14, slots: '1 open slot', available: true },
    { name: 'Dr. Meera Iyer', role: 'Counselling Psychologist', img: 'therapist-meera.svg', focus: 'Workplace stress, burnout', sessions: 11, slots: 'Fully booked', available: false },
    { name: 'Dr. Arjun Menon', role: 'Clinical Psychologist', img: 'therapist-arjun.svg', focus: 'Couples and family therapy', sessions: 13, slots: '2 open slots', available: true },
    { name: 'Dr. Kavya Nair', role: 'Psychotherapist', img: 'therapist-kavya.svg', focus: 'Grief, identity, relationships', sessions: 9, slots: '3 open slots', available: true },
    { name: 'Dr. Rahul Bose', role: 'Counselling Psychologist', img: 'therapist-rahul.svg', focus: 'Behaviour change, motivation', sessions: 8, slots: '2 open slots', available: true },
    { name: 'Dr. Leela Thomas', role: 'Family Therapist', img: 'therapist-leela.svg', focus: 'Family systems, adolescents', sessions: 7, slots: 'Fully booked', available: false }
  ];

  var CLIENTS = [
    { name: 'Alex Morgan', initials: 'AM', therapist: 'Dr. Ananya Rao', plan: 'Individual therapy', sessions: 6, last: '28 Sep 2026', next: '12 Oct 2026' },
    { name: 'Nisha Pillai', initials: 'NP', therapist: 'Dr. Meera Iyer', plan: 'Anxiety & stress', sessions: 4, last: '4 Oct 2026', next: '12 Oct 2026' },
    { name: 'Rahul Verma', initials: 'RV', therapist: 'Dr. Arjun Menon', plan: 'Couples & family', sessions: 9, last: '30 Sep 2026', next: '12 Oct 2026' },
    { name: 'Divya Menon', initials: 'DM', therapist: 'Dr. Kavya Nair', plan: 'Individual therapy', sessions: 3, last: '8 Oct 2026', next: '12 Oct 2026' },
    { name: 'Imran Sheikh', initials: 'IS', therapist: 'Dr. Rahul Bose', plan: 'Growth & workplace', sessions: 12, last: '1 Oct 2026', next: '12 Oct 2026' },
    { name: 'Fatima Ali', initials: 'FA', therapist: 'Dr. Kavya Nair', plan: 'Individual therapy', sessions: 7, last: '11 Oct 2026', next: '18 Oct 2026' },
    { name: 'Ravi Shankar', initials: 'RS', therapist: 'Dr. Rahul Bose', plan: 'Growth & workplace', sessions: 2, last: '6 Oct 2026', next: '13 Oct 2026' }
  ];

  var adminFilter = 'all';

  /* ------------------------------------------------------ view routing --- */
  function showView(name) {
    var key = VIEW_META[name] ? name : 'overview';
    $$('[data-view]').forEach(function (section) {
      section.hidden = section.getAttribute('data-view') !== key;
    });
    $$('[data-view-link]').forEach(function (btn) {
      var active = btn.getAttribute('data-view-link') === key;
      var isChip = btn.classList.contains('bg-serenity-50');
      btn.setAttribute('aria-current', active ? 'page' : 'false');
      if (active) {
        btn.classList.add('bg-serenity-50', 'font-semibold', 'text-serenity-800');
        btn.classList.remove('text-ink/75', 'font-medium');
      } else if (isChip) {
        btn.classList.remove('bg-serenity-50', 'font-semibold', 'text-serenity-800');
        btn.classList.add('text-ink/75', 'font-medium');
      }
    });

    var meta = VIEW_META[key];
    var title = $('[data-view-title]');
    var sub = $('[data-view-subtitle]');
    if (title) title.textContent = meta.title;
    if (sub) sub.textContent = meta.sub;
    document.title = meta.title + ' — Serenity Practice Demo';

    if (history.replaceState) history.replaceState(null, '', '#' + key);
    closeDrawer();
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }

  function initRouting() {
    $$('[data-view-link]').forEach(function (btn) {
      on(btn, 'click', function () { showView(btn.getAttribute('data-view-link')); });
    });
    var initial = (location.hash || '').replace('#', '');
    showView(VIEW_META[initial] ? initial : 'overview');
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
      if (e.key === 'Escape' && drawerOpen) closeDrawer(true);
    });
    var wide = window.matchMedia('(min-width: 1024px)');
    var sync = function () { if (wide.matches && drawerOpen) closeDrawer(); };
    if (wide.addEventListener) wide.addEventListener('change', sync);
    else if (wide.addListener) wide.addListener(sync);
  }

  /* ---------------------------------------------------------- stats ------- */
  var STAT_TONES = {
    sage: 'bg-sage-500/10 text-sage-600',
    teal: 'bg-serenity-50 text-serenity-700',
    sand: 'bg-sand-200 text-ink/70',
    clay: 'bg-clay-500/10 text-clay-600'
  };

  function renderStats() {
    var host = $('[data-admin-stats]');
    if (!host) return;
    host.innerHTML = STATS.map(function (stat) {
      return (
        '<article class="rounded-2xl border border-ink/6 bg-surface p-6 shadow-card">' +
        '<div class="flex items-start justify-between gap-4">' +
        '<p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/50">' + stat.label + '</p>' +
        '<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-current ' + (STAT_TONES[stat.tone] || '') + '" aria-hidden="true"></span>' +
        '</div>' +
        '<p class="mt-4 font-display text-4xl font-semibold tracking-[-0.03em]">' + stat.value + '</p>' +
        '<p class="mt-2 text-[0.8rem] text-ink/55">' + stat.note + '</p>' +
        '</article>'
      );
    }).join('');
  }

  /* ---------------------------------------------------------- charts ------ */
  function renderWeekChart() {
    var host = $('[data-week-chart]');
    if (!host) return;
    var max = Math.max.apply(null, WEEK.map(function (d) { return d.value; }));
    host.innerHTML = WEEK.map(function (d) {
      var pct = Math.round((d.value / max) * 100);
      return (
        '<div class="flex h-full flex-1 flex-col items-center justify-end gap-2">' +
        '<span class="text-[0.72rem] font-semibold text-ink/55">' + d.value + '</span>' +
        '<div class="flex h-[78%] w-full items-end overflow-hidden rounded-t-lg bg-raised">' +
        '<div class="w-full rounded-t-lg bg-serenity-600 ' + (reduced ? '' : 'transition-[height] duration-700 ease-soft') + '" style="height:' + pct + '%"></div>' +
        '</div>' +
        '<span class="text-[0.72rem] text-ink/50">' + d.day + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function renderMonthChart() {
    var host = $('[data-month-chart]');
    if (!host) return;
    var max = Math.max.apply(null, MONTHS.map(function (d) { return d.value; }));
    host.innerHTML = MONTHS.map(function (d) {
      var pct = Math.round((d.value / max) * 100);
      return (
        '<div class="flex h-full flex-1 flex-col items-center justify-end gap-2">' +
        '<span class="text-[0.68rem] font-semibold text-ink/50">' + d.value + '</span>' +
        '<div class="flex h-[80%] w-full items-end overflow-hidden rounded-t-lg bg-raised">' +
        '<div class="w-full rounded-t-lg bg-serenity-600/75" style="height:' + pct + '%"></div>' +
        '</div>' +
        '<span class="text-[0.68rem] text-ink/50">' + d.m + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function renderServiceMix() {
    var host = $('[data-service-chart]');
    if (!host) return;
    host.innerHTML = SERVICE_MIX.map(function (row) {
      return (
        '<div>' +
        '<div class="flex items-center justify-between gap-3 text-[0.82rem]">' +
        '<span class="font-medium text-ink/75">' + row.label + '</span>' +
        '<span class="font-semibold">' + row.pct + '%</span>' +
        '</div>' +
        '<div class="mt-2 h-2 overflow-hidden rounded-full bg-raised">' +
        '<div class="h-full rounded-full ' + row.tone + '" style="width:' + row.pct + '%"></div>' +
        '</div></div>'
      );
    }).join('');
  }

  function renderTherapistLoad() {
    var host = $('[data-therapist-load]');
    if (!host) return;
    var max = Math.max.apply(null, THERAPISTS.map(function (t) { return t.sessions; }));
    host.innerHTML = THERAPISTS.slice(0, 5).map(function (t) {
      var pct = Math.round((t.sessions / max) * 100);
      return (
        '<div>' +
        '<div class="flex items-center justify-between gap-3 text-[0.82rem]">' +
        '<span class="font-medium text-ink/75">' + t.name + '</span>' +
        '<span class="text-ink/55">' + t.sessions + '</span>' +
        '</div>' +
        '<div class="mt-2 h-2 overflow-hidden rounded-full bg-raised">' +
        '<div class="h-full rounded-full bg-serenity-600" style="width:' + pct + '%"></div>' +
        '</div></div>'
      );
    }).join('');
  }

  /* ----------------------------------------------------- appointments ----- */
  function filterAppointments() {
    if (adminFilter === 'all') return APPOINTMENTS;
    return APPOINTMENTS.filter(function (a) { return a.status === adminFilter; });
  }

  function renderAppointments() {
    var table = $('[data-appointments-table]');
    var cards = $('[data-appointments-cards]');
    var rows = filterAppointments();

    if (table) {
      table.innerHTML = rows.length
        ? rows.map(function (a) {
            return (
              '<tr>' +
              '<th scope="row" class="px-6 py-4 text-left font-normal">' +
              '<span class="flex items-center gap-3">' +
              '<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand-200 text-[0.7rem] font-semibold text-ink/70" aria-hidden="true">' + a.initials + '</span>' +
              '<span><span class="block font-semibold">' + a.client + '</span><span class="block text-[0.72rem] text-ink/45">' + a.id + '</span></span>' +
              '</span></th>' +
              '<td class="px-6 py-4 text-ink/70">' + a.therapist + '</td>' +
              '<td class="px-6 py-4 text-ink/70">' + a.when + '</td>' +
              '<td class="px-6 py-4 text-ink/70">' + a.service + '</td>' +
              '<td class="px-6 py-4"><span class="rounded-full px-2.5 py-1 text-[0.7rem] font-semibold capitalize ' + STATUS_TONE[a.status] + '">' + a.status + '</span></td>' +
              '<td class="px-6 py-4 text-right">' +
              '<button type="button" data-demo-action="Editing appointments is disabled in this demo build." class="btn-ghost btn-sm">Manage</button>' +
              '</td></tr>'
            );
          }).join('')
        : '<tr><td colspan="6" class="px-6 py-10 text-center text-[0.85rem] text-ink/55">No appointments in this view.</td></tr>';
    }

    if (cards) {
      cards.innerHTML = rows.length
        ? rows.map(function (a) {
            return (
              '<article class="p-6">' +
              '<div class="flex items-center justify-between gap-3">' +
              '<span class="flex items-center gap-3">' +
              '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-[0.72rem] font-semibold text-ink/70" aria-hidden="true">' + a.initials + '</span>' +
              '<span><span class="block text-[0.9rem] font-semibold">' + a.client + '</span>' +
              '<span class="block text-[0.72rem] text-ink/45">' + a.id + '</span></span></span>' +
              '<span class="rounded-full px-2.5 py-1 text-[0.7rem] font-semibold capitalize ' + STATUS_TONE[a.status] + '">' + a.status + '</span>' +
              '</div>' +
              '<dl class="mt-4 space-y-2 text-[0.82rem]">' +
              '<div class="flex justify-between gap-4"><dt class="text-ink/50">Therapist</dt><dd class="text-right font-medium">' + a.therapist + '</dd></div>' +
              '<div class="flex justify-between gap-4"><dt class="text-ink/50">When</dt><dd class="text-right font-medium">' + a.when + '</dd></div>' +
              '<div class="flex justify-between gap-4"><dt class="text-ink/50">Service</dt><dd class="text-right font-medium">' + a.service + '</dd></div>' +
              '</dl>' +
              '<button type="button" data-demo-action="Editing appointments is disabled in this demo build." class="btn-outline btn-sm mt-5 w-full">Manage</button>' +
              '</article>'
            );
          }).join('')
        : '<p class="p-8 text-center text-[0.85rem] text-ink/55">No appointments in this view.</p>';
    }
  }

  function initAppointments() {
    $$('[data-admin-filter]').forEach(function (btn) {
      on(btn, 'click', function () {
        adminFilter = btn.getAttribute('data-admin-filter');
        $$('[data-admin-filter]').forEach(function (other) {
          var active = other === btn;
          other.setAttribute('aria-pressed', String(active));
          other.className = active
            ? 'rounded-full border border-serenity-600 bg-serenity-600 px-3.5 py-2 text-[0.78rem] font-semibold text-white transition-colors duration-300'
            : 'rounded-full border border-ink/12 bg-surface px-3.5 py-2 text-[0.78rem] font-medium text-ink/75 transition-colors duration-300';
        });
        renderAppointments();
      });
    });
    renderAppointments();
  }

  function renderToday() {
    var host = $('[data-today-list]');
    if (!host) return;
    host.innerHTML = APPOINTMENTS.slice(0, 5).map(function (a) {
      return (
        '<div class="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">' +
        '<div class="flex items-center gap-3">' +
        '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-[0.72rem] font-semibold text-ink/70" aria-hidden="true">' + a.initials + '</span>' +
        '<div>' +
        '<p class="text-[0.9rem] font-semibold">' + a.client + '</p>' +
        '<p class="mt-0.5 text-[0.78rem] text-ink/55">' + a.when + ' · ' + a.service + '</p>' +
        '</div></div>' +
        '<div class="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">' +
        '<span class="rounded-full px-2.5 py-1 text-[0.7rem] font-semibold capitalize ' + STATUS_TONE[a.status] + '">' + a.status + '</span>' +
        '<span class="text-[0.75rem] text-ink/50">' + a.therapist + '</span>' +
        '</div></div>'
      );
    }).join('');
  }

  /* -------------------------------------------------------- clients ------- */
  function renderClients(query) {
    var host = $('[data-clients-list]');
    if (!host) return;
    var term = (query || '').trim().toLowerCase();
    var rows = !term
      ? CLIENTS
      : CLIENTS.filter(function (c) {
          return (c.name + ' ' + c.therapist + ' ' + c.plan).toLowerCase().indexOf(term) > -1;
        });

    host.innerHTML = rows.length
      ? rows.map(function (c) {
          return (
            '<article class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">' +
            '<div class="flex items-center gap-3">' +
            '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-[0.72rem] font-semibold text-ink/70" aria-hidden="true">' + c.initials + '</span>' +
            '<div>' +
            '<p class="text-[0.9rem] font-semibold">' + c.name + '</p>' +
            '<p class="mt-0.5 text-[0.78rem] text-ink/55">' + c.plan + ' · ' + c.therapist + '</p>' +
            '</div></div>' +
            '<dl class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.78rem]">' +
            '<div class="flex gap-1.5"><dt class="text-ink/50">Sessions</dt><dd class="font-semibold">' + c.sessions + '</dd></div>' +
            '<div class="flex gap-1.5"><dt class="text-ink/50">Last</dt><dd class="font-semibold">' + c.last + '</dd></div>' +
            '<div class="flex gap-1.5"><dt class="text-ink/50">Next</dt><dd class="font-semibold text-serenity-700">' + c.next + '</dd></div>' +
            '</dl></article>'
          );
        }).join('')
      : '<p class="p-8 text-center text-[0.85rem] text-ink/55">No clients match that search.</p>';
  }

  function initClients() {
    var search = $('#client-search');
    on(search, 'input', function () { renderClients(search.value); });
    renderClients('');
  }

  /* ----------------------------------------------------- therapists ------ */
  function renderTherapists() {
    var host = $('[data-therapists-grid]');
    if (!host) return;
    host.innerHTML = THERAPISTS.map(function (t) {
      return (
        '<article class="overflow-hidden rounded-2xl border border-ink/6 bg-surface shadow-card">' +
        '<div class="flex items-start gap-4 p-6">' +
        '<img src="../assets/images/' + t.img + '" alt="" class="h-16 w-16 shrink-0 rounded-full object-cover" width="64" height="64" loading="lazy" />' +
        '<div class="min-w-0">' +
        '<h3 class="text-[0.95rem] font-semibold">' + t.name + '</h3>' +
        '<p class="mt-0.5 text-[0.78rem] text-ink/55">' + t.role + '</p>' +
        '<span class="mt-2 inline-block rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ' +
        (t.available ? 'bg-sage-500/10 text-sage-600' : 'bg-sand-200 text-ink/60') + '">' + t.slots + '</span>' +
        '</div></div>' +
        '<div class="border-t border-ink/6 px-6 py-4">' +
        '<p class="text-[0.8rem] leading-relaxed text-ink/65">' + t.focus + '</p>' +
        '<div class="mt-4 flex items-center justify-between gap-3">' +
        '<span class="text-[0.78rem] text-ink/55"><strong class="font-semibold text-ink">' + t.sessions + '</strong> sessions this week</span>' +
        '<button type="button" data-demo-action="Therapist editing is disabled in this demo build." class="btn-ghost btn-sm">Edit</button>' +
        '</div></div></article>'
      );
    }).join('');
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

  function init() {
    if (!document.querySelector('[data-view]')) return;
    initDisplayToggles();
    initRouting();
    initDrawer();
    renderStats();
    renderWeekChart();
    renderMonthChart();
    renderServiceMix();
    renderTherapistLoad();
    renderTherapists();
    renderToday();
    initAppointments();
    initClients();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
