/* =============================================================
   Serenity — js/navbar.js
   Renders the site header into #navbar on every page.
   Shared across root pages and /dashboard/ pages.
   ============================================================= */
(function () {
  'use strict';

  var BASE = /\/dashboard\//i.test(window.location.pathname) ? '../' : './';
  var MOBILE_QUERY = window.matchMedia('(min-width: 1280px)');

  var NAV = [
    {
      label: 'Home',
      href: BASE + 'index.html',
      children: [
        { label: 'Home 1', href: BASE + 'index.html' },
        { label: 'Home 2', href: BASE + 'home2.html'}
      ]
    },
    { label: 'About', href: BASE + 'about.html' },
    { label: 'Services', href: BASE + 'services.html' },
    { label: 'Therapists', href: BASE + 'therapists.html' },
    { label: 'Resources', href: BASE + 'resources.html' },
    { label: 'Contact', href: BASE + 'contact.html' },
    {
      label: 'Dashboard',
      href: BASE + 'dashboard/user-dashboard.html',
      children: [
        { label: 'User Dashboard', href: BASE + 'dashboard/user-dashboard.html', hint: 'Client demo portal' },
        { label: 'Admin Dashboard', href: BASE + 'dashboard/admin-dashboard.html', hint: 'Practice demo portal' }
      ]
    },
  ];

  var ICON = {
    chevron: '<svg class="h-3.5 w-3.5 transition-transform duration-300 ease-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>',
    chevronNav: '<svg data-nav-chevron class="ml-1.5 h-4 w-4 shrink-0 opacity-70 transition-transform duration-300 ease-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>',
    home: '<svg class="h-4 w-4 text-serenity-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 10.5 9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/></svg>',
    grid: '<svg class="h-4 w-4 text-serenity-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
    menu: '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    moon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
    sun: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>',
    rtl: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4"/></svg>'
  };

  /* brand mark: calm wave inside a soft leaf shape */
  function logoMark() {
    return (
      '<span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-serenity-600 shadow-soft" aria-hidden="true">' +
      '<svg viewBox="0 0 32 32" class="h-6 w-6" fill="none">' +
      '<path d="M16 4.5c4.6 2.4 7.6 6 7.6 10.2 0 4-3.2 7.3-7.6 7.3S8.4 18.7 8.4 14.7C8.4 10.5 11.4 6.9 16 4.5Z" fill="#E4D9C8"/>' +
      '<path d="M11.4 18.2c1.6-1.9 3.1-3 4.6-3.6M16 21.6c1.9-1.4 3.3-3.3 4.2-5.7" stroke="#3F7C85" stroke-width="1.7" stroke-linecap="round"/>' +
      '</svg></span>'
    );
  }

  function currentFile() {
    var f = window.location.pathname.split('/').pop();
    return (f || 'index.html').toLowerCase();
  }

  function isActive(href) {
    var target = href.split('/').pop().split('#')[0].toLowerCase();
    var here = currentFile();
    if (target === here) return true;
    if (here === '' || here === 'index.html') return target === 'index.html' || target === 'home2.html';
    return false;
  }

  function menuItem(item) {
    var active = isActive(item.href);
    return (
      '<a href="' + item.href + '" data-nav-link class="menu-item' + (active ? ' !bg-serenity-50 !text-serenity-800' : '') + '">' +
      '<span class="flex-1">' + item.label + '</span>' +
      (active ? '<span class="sr-only">(current page)</span>' : '') +
      '</a>'
    );
  }

  function desktopItem(item) {
    if (!item.children) {
      var a = isActive(item.href);
      return '<a href="' + item.href + '" data-nav-link class="nav-link' + (a ? ' nav-link-active' : '') + '"' + (a ? ' aria-current="page"' : '') + '>' + item.label + '</a>';
    }
    var id = 'nav-menu-' + item.label.toLowerCase();
    var parentActive = item.children.some(function (c) {
      return isActive(c.href);
    });
    return (
      '<div class="relative" data-dropdown>' +
      '<button type="button" data-dropdown-trigger class="nav-link' + (parentActive ? ' nav-link-active' : '') + '"' +
      ' aria-expanded="false" aria-haspopup="true" aria-controls="' + id + '"' + (parentActive ? ' aria-current="page"' : '') + '>' +
      item.label + ICON.chevronNav +
      '</button>' +
      '<div id="' + id + '" data-dropdown-panel role="group" aria-label="' + item.label + '" ' +
      'class="absolute left-0 top-full z-50 hidden w-60 pt-2">' +
      '<div class="menu-panel">' +
      item.children.map(menuItem).join('') +
      '</div></div>' +
      '</div>'
    );
  }

  function mobileItem(item, depth) {
    if (!item.children) {
      var a = isActive(item.href);
      return (
        '<a href="' + item.href + '" data-mobile-link class="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-[0.95rem] font-medium ' +
        (a ? 'bg-serenity-50 text-serenity-800' : 'text-ink/75 hover:bg-sand-50') + '"' +
        (a ? ' aria-current="page"' : '') + '>' +
        '<span>' + item.label + '</span>' +
        '<svg class="h-4 w-4 text-serenity-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg>' +
        '</a>'
      );
    }
    var open = item.children.some(function (c) {
      return isActive(c.href);
    });
    return (
      '<div data-mobile-sub class="rounded-xl' + (open ? ' bg-sand-50' : '') + '">' +
      '<button type="button" data-mobile-sub-trigger class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[0.95rem] font-medium text-ink/75" ' +
      'aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="m-' + item.label.toLowerCase() + '">' +
      '<span>' + item.label + '</span>' +
      '<span data-caret class="grid h-6 w-6 place-items-center rounded-full bg-serenity-600/12 text-serenity-700 transition-transform duration-300 ease-soft">' +
      ICON.chevron +
      '</span></button>' +
      '<div id="m-' + item.label.toLowerCase() + '" data-mobile-sub-panel class="grid transition-[grid-template-rows] duration-300 ease-soft ' +
      (open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]') + '">' +
      '<div class="overflow-hidden"><div class="space-y-1 pb-2 pl-3 pr-3 pt-1">' +
      item.children
        .map(function (c) {
          var ca = isActive(c.href);
          return (
            '<a href="' + c.href + '" data-mobile-link class="flex items-center justify-between gap-3 rounded-lg border-l-2 ' +
            (ca ? 'border-serenity-600 bg-surface text-serenity-800' : 'border-ink/10 text-ink/75 hover:bg-surface') +
            ' px-3 py-2.5 text-[0.88rem] font-medium">' +
            '<span>' + c.label + '</span>' +
            '</a>'
          );
        })
        .join('') +
      '</div></div></div></div>'
    );
  }

  function render() {
    var host = document.getElementById('navbar');
    if (!host) return;

    /* sticky must live on the host: an inner <header> can never travel
       beyond its parent's box, so a sticky header inside a host that is
       exactly header-tall would scroll away with the page. */
    host.className = 'sticky top-0 z-50 w-full';

    host.innerHTML =
      '<a href="#main-content" data-skip class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-serenity-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white">Skip to content</a>' +
      '<header data-nav-root class="relative w-full border-b border-ink/5 bg-surface transition-shadow duration-300">' +
      '<div class="shell">' +
      '<div class="flex h-[4.25rem] items-center justify-between gap-3 sm:h-[4.5rem]">' +

      /* ---------- brand ---------- */
      '<a href="' + BASE + 'index.html" class="group flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 sm:gap-3">' +
      logoMark() +
      '<span class="flex min-w-0 flex-col justify-center text-left leading-tight">' +
      '<span class="font-display text-lg font-semibold leading-none tracking-[-0.02em] text-ink">Serenity</span>' +
      '<span class="mt-1 whitespace-nowrap font-semibold uppercase leading-none tracking-[0.1em] text-ink/55 sm:tracking-[0.14em]" style="font-size:0.55em">Mental Health Counseling</span>' +
      '</span></a>' +

      /* ---------- desktop nav ---------- */
      '<nav aria-label="Primary" class="hidden xl:flex xl:items-center xl:gap-0.5">' +
      NAV.map(desktopItem).join('') +
      '</nav>' +

      /* ---------- actions (desktop only — everything lives in the hamburger below lg) ---------- */
      '<div class="hidden items-center gap-2 sm:gap-3 xl:flex">' +
      '<button type="button" data-theme-toggle class="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink/75 transition-colors duration-300 hover:border-serenity-600/40 hover:text-serenity-700" aria-label="Toggle dark mode" aria-pressed="false">' +
      '<span data-icon-moon>' + ICON.moon + '</span>' +
      '<span data-icon-sun class="hidden">' + ICON.sun + '</span>' +
      '</button>' +
      '<button type="button" data-rtl-toggle class="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink/75 transition-colors duration-300 hover:border-serenity-600/40 hover:text-serenity-700" aria-label="Toggle RTL layout" aria-pressed="false">' +
      ICON.rtl +
      '</button>' +
      '<a href="' + BASE + 'book-session.html" class="nav-cta">Book a Session</a>' +
      '</div>' +
      '<div class="flex shrink-0 items-center gap-2 xl:hidden">' +
      '<button type="button" data-mobile-toggle class="grid h-11 w-11 place-items-center rounded-xl border border-ink/10 text-ink/75 transition-colors duration-300 hover:border-serenity-600/40 hover:text-serenity-700" ' +
      'aria-expanded="false" aria-controls="mobile-menu" aria-label="Open main menu">' +
      '<span data-menu-icon-open>' + ICON.menu + '</span>' +
      '<span data-menu-icon-close class="hidden">' + ICON.close + '</span>' +
      '</button>' +
      '</div>' +

      '</div></div>' +

      /* ---------- mobile panel ---------- */
      '<div id="mobile-menu" data-mobile-menu class="hidden border-t border-ink/5 bg-surface xl:hidden">' +
      '<nav aria-label="Mobile" class="shell max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain py-4">' +
      '<div class="space-y-1">' +
      NAV.map(function (i) {
        return mobileItem(i, 0);
      }).join('') +
      '</div>' +
      '<a href="' + BASE + 'book-session.html" data-mobile-link class="btn-primary mt-4 w-full">Book a Session</a>' +
      '<div class="mt-4 grid grid-cols-2 gap-2.5">' +
      '<button type="button" data-theme-toggle class="flex items-center justify-center gap-2 rounded-xl border border-ink/10 px-3 py-3 text-[0.85rem] font-medium text-ink/75 transition-colors duration-300 hover:border-serenity-600/40 hover:text-serenity-700" aria-label="Toggle dark mode" aria-pressed="false">' +
      '<span data-icon-moon>' + ICON.moon + '</span>' +
      '<span data-icon-sun class="hidden">' + ICON.sun + '</span>' +
      '<span>Theme</span>' +
      '</button>' +
      '<button type="button" data-rtl-toggle class="flex items-center justify-center gap-2 rounded-xl border border-ink/10 px-3 py-3 text-[0.85rem] font-medium text-ink/75 transition-colors duration-300 hover:border-serenity-600/40 hover:text-serenity-700" aria-label="Toggle RTL layout" aria-pressed="false">' +
      ICON.rtl +
      '<span>RTL</span>' +
      '</button>' +
      '</div>' +
      '<p class="mt-4 flex items-start gap-2 text-[0.72rem] leading-relaxed text-ink/55">' +
      '<svg class="mt-px h-4 w-4 shrink-0 text-serenity-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 8v5"/><circle cx="12" cy="16.5" r="0.8" fill="currentColor"/><circle cx="12" cy="12" r="9"/></svg>' +
      '<span>If you are in crisis, please contact your local emergency services or a crisis support line.</span>' +
      '</p>' +
      '</nav></div>' +

      '</header>';

    bind(host);
  }

  function bind(host) {
    var root = host.querySelector('[data-nav-root]');
    var menuBtn = host.querySelector('[data-mobile-toggle]');
    var mobileMenu = host.querySelector('[data-mobile-menu]');
    var iconOpen = host.querySelector('[data-menu-icon-open]');
    var iconClose = host.querySelector('[data-menu-icon-close]');

    /* ---- sticky shadow ---- */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        root.classList.toggle('shadow-nav', window.scrollY > 8);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- desktop dropdowns ---- */
    var dropdowns = Array.prototype.slice.call(host.querySelectorAll('[data-dropdown]'));
    var openDropdowns = [];

    function closeDropdown(dd, focusTrigger) {
      var trigger = dd.querySelector('[data-dropdown-trigger]');
      var panel = dd.querySelector('[data-dropdown-panel]');
      if (!trigger || !panel || trigger.getAttribute('aria-expanded') !== 'true') return;
      trigger.setAttribute('aria-expanded', 'false');
      panel.classList.add('hidden');
      panel.classList.remove('animate-fadeDown');
      var chev = trigger.querySelector('[data-nav-chevron]');
      if (chev) chev.classList.remove('rotate-180');
      if (focusTrigger) trigger.focus();
    }

    function openDropdown(dd) {
      dropdowns.forEach(function (o) {
        if (o !== dd) closeDropdown(o);
      });
      var trigger = dd.querySelector('[data-dropdown-trigger]');
      var panel = dd.querySelector('[data-dropdown-panel]');
      trigger.setAttribute('aria-expanded', 'true');
      panel.classList.remove('hidden');
      panel.classList.add('animate-fadeDown');
      var chev = trigger.querySelector('[data-nav-chevron]');
      if (chev) chev.classList.add('rotate-180');
    }

    dropdowns.forEach(function (dd) {
      var trigger = dd.querySelector('[data-dropdown-trigger]');
      var panel = dd.querySelector('[data-dropdown-panel]');
      var closeTimer = null;

      function cancelPendingClose() {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      }

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        cancelPendingClose();
        /* a click right after hover-open must keep the menu open instead of
           instantly toggling it shut again */
        if (trigger.getAttribute('aria-expanded') === 'true' && dd._openedBy === 'click') closeDropdown(dd);
        else {
          openDropdown(dd);
          dd._openedBy = 'click';
        }
      });

      /* keyboard: arrows + escape */
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown(dd);
          dd._openedBy = 'click';
          var first = panel.querySelector('a');
          if (first) first.focus();
        } else if (e.key === 'Escape') {
          closeDropdown(dd, true);
        }
      });

      panel.addEventListener('keydown', function (e) {
        var items = Array.prototype.slice.call(panel.querySelectorAll('a'));
        var i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[(i + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (i <= 0) trigger.focus();
          else items[i - 1].focus();
        } else if (e.key === 'Escape') {
          closeDropdown(dd, true);
        } else if (e.key === 'Tab' && !e.shiftKey && i === items.length - 1) {
          closeDropdown(dd);
        }
      });

      /* hover only on desktop, with a short grace period so moving the
         pointer from the trigger down into the panel never kills it */
      dd.addEventListener('mouseenter', function () {
        if (!MOBILE_QUERY.matches) return;
        cancelPendingClose();
        if (trigger.getAttribute('aria-expanded') !== 'true') {
          openDropdown(dd);
          dd._openedBy = 'hover';
        }
      });
      dd.addEventListener('mouseleave', function () {
        if (!MOBILE_QUERY.matches) return;
        cancelPendingClose();
        closeTimer = setTimeout(function () {
          closeDropdown(dd);
          dd._openedBy = null;
        }, 220);
      });
      dd.addEventListener('focusout', function (e) {
        if (!MOBILE_QUERY.matches) return;
        if (!dd.contains(e.relatedTarget)) closeDropdown(dd);
      });
    });

    document.addEventListener('click', function (e) {
      dropdowns.forEach(function (dd) {
        if (!dd.contains(e.target)) closeDropdown(dd);
      });
    });

    /* ---- mobile menu ---- */
    function setMenu(open) {
      if (!menuBtn || !mobileMenu) return;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close main menu' : 'Open main menu');
      iconOpen.classList.toggle('hidden', open);
      iconClose.classList.toggle('hidden', !open);
      if (open) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('animate-fadeDown');
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('animate-fadeDown');
      }
      document.documentElement.style.setProperty('--menu-open', open ? '1' : '0');
    }

    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    /* mobile sub-menus */
    host.querySelectorAll('[data-mobile-sub-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = host.querySelector('#' + btn.getAttribute('aria-controls'));
        var caret = btn.querySelector('[data-caret]');
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.classList.toggle('grid-rows-[0fr]', open);
        panel.classList.toggle('grid-rows-[1fr]', !open);
        if (caret) caret.classList.toggle('rotate-180', !open);
      });
    });

    host.querySelectorAll('[data-mobile-link]').forEach(function (a) {
      a.addEventListener('click', function () {
        setMenu(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var wasOpen = menuBtn && menuBtn.getAttribute('aria-expanded') === 'true';
        setMenu(false);
        dropdowns.forEach(function (dd) {
          closeDropdown(dd);
        });
        if (wasOpen) menuBtn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!root.contains(e.target) && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false);
    });

    /* close the mobile menu when we grow into desktop layout */
    var onBreak = function () {
      if (MOBILE_QUERY.matches) setMenu(false);
      else setMenu(menuBtn.getAttribute('aria-expanded') === 'true');
    };
    if (typeof MOBILE_QUERY.addEventListener === 'function') MOBILE_QUERY.addEventListener('change', onBreak);
    else MOBILE_QUERY.addListener(onBreak);

    /* ---- theme toggle (uses [data-theme='dark'] per serenity.css) ---- */
    var themeBtns = Array.prototype.slice.call(host.querySelectorAll('[data-theme-toggle]'));
    if (themeBtns.length) {
      var savedTheme = null;
      try { savedTheme = localStorage.getItem('serenity-theme'); } catch (e) {}
      function paintTheme(dark) {
        themeBtns.forEach(function (btn) {
          btn.setAttribute('aria-pressed', String(dark));
          var iconMoon = btn.querySelector('[data-icon-moon]');
          var iconSun = btn.querySelector('[data-icon-sun]');
          if (iconMoon) iconMoon.classList.toggle('hidden', dark);
          if (iconSun) iconSun.classList.toggle('hidden', !dark);
        });
        if (dark) document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
      }
      paintTheme(savedTheme === 'dark');
      /* opt in to the swap animation only after first paint */
      window.requestAnimationFrame(function () {
        document.documentElement.setAttribute('data-theme-ready', '');
      });
      themeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          paintTheme(!isDark);
          try { localStorage.setItem('serenity-theme', isDark ? 'light' : 'dark'); } catch (e) {}
        });
      });
    }

    /* ---- RTL toggle ---- */
    var rtlBtns = Array.prototype.slice.call(host.querySelectorAll('[data-rtl-toggle]'));
    if (rtlBtns.length) {
      var savedDir = null;
      try { savedDir = localStorage.getItem('serenity-dir'); } catch (e) {}
      if (savedDir === 'rtl') document.documentElement.setAttribute('dir', 'rtl');
      var paintRtl = function (rtl) {
        rtlBtns.forEach(function (btn) { btn.setAttribute('aria-pressed', String(rtl)); });
      };
      paintRtl(savedDir === 'rtl');
      rtlBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var isRtl = document.documentElement.getAttribute('dir') === 'rtl';
          if (isRtl) document.documentElement.removeAttribute('dir');
          else document.documentElement.setAttribute('dir', 'rtl');
          try { localStorage.setItem('serenity-dir', isRtl ? 'ltr' : 'rtl'); } catch (e) {}
          paintRtl(!isRtl);
        });
      });
    }

    /* safety net: never allow horizontal scroll from the header */
    host.style.maxWidth = '100%';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
