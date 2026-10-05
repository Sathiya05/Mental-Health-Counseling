/* =============================================================
   Serenity — js/main.js
   Shared UI behaviour: reveals, accordions, validation, filters,
   tabs, counters, toasts and the multi-step booking wizard.
   Vanilla JS, no dependencies.
   ============================================================= */
(function () {
  'use strict';

  var BASE = /\/dashboard\//i.test(window.location.pathname) ? '../' : './';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); }

  /* ------------------------------------------------------------- toasts --- */
  var toastHost;
  function toast(message, kind) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4';
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastHost);
    }
    var tone = kind === 'error'
      ? 'bg-clay-600 text-white'
      : kind === 'demo'
        ? 'bg-sand-200 text-ink'
        : 'bg-serenity-700 text-white';
    var el = document.createElement('div');
    el.className =
      'pointer-events-auto flex max-w-md items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-card ' + tone +
      (reduced ? '' : ' animate-fadeUp');
    el.textContent = message;
    toastHost.appendChild(el);
    window.setTimeout(function () {
      el.style.transition = 'opacity .4s ease, transform .4s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      window.setTimeout(function () { el.remove(); }, 420);
    }, 3800);
  }
  window.SerenityToast = toast;

  /* -------------------------------------------------- scroll reveal ------ */
  function initReveals() {
    var items = $$('[data-reveal]');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          window.setTimeout(function () { el.classList.add('is-visible'); }, delay);
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------- accordion ---- */
  function initAccordions() {
    $$('[data-accordion]').forEach(function (root) {
      var single = root.getAttribute('data-accordion') === 'single';
      var triggers = $$('[data-accordion-trigger]', root);

      triggers.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;
        var item = btn.closest('.acc-item') || btn.parentElement;

        on(btn, 'click', function () {
          var isOpen = btn.getAttribute('aria-expanded') === 'true';
          if (single && !isOpen) {
            triggers.forEach(function (other) {
              if (other === btn) return;
              var op = document.getElementById(other.getAttribute('aria-controls'));
              other.setAttribute('aria-expanded', 'false');
              if (op) op.classList.remove('is-open');
              var oi = other.closest('.acc-item');
              if (oi) oi.classList.remove('is-open');
              var oc = other.querySelector('[data-accordion-icon]');
              if (oc) oc.style.transform = '';
            });
          }
          btn.setAttribute('aria-expanded', String(!isOpen));
          panel.classList.toggle('is-open', !isOpen);
          if (item) item.classList.toggle('is-open', !isOpen);
          var icon = btn.querySelector('[data-accordion-icon]');
          if (icon) icon.style.transform = isOpen ? '' : 'rotate(45deg)';
        });

        on(btn, 'keydown', function (e) {
          var i = triggers.indexOf(btn);
          if (e.key === 'ArrowDown') { e.preventDefault(); triggers[(i + 1) % triggers.length].focus(); }
          if (e.key === 'ArrowUp') { e.preventDefault(); triggers[(i - 1 + triggers.length) % triggers.length].focus(); }
          if (e.key === 'Home') { e.preventDefault(); triggers[0].focus(); }
          if (e.key === 'End') { e.preventDefault(); triggers[triggers.length - 1].focus(); }
        });
      });
    });
  }

  /* ------------------------------------------------------- validation ---- */
  function fieldError(input, msg) {
    var host = input.closest('[data-field]') || input.parentElement;
    var id = (input.id || input.name || 'field') + '-error';
    var boxes = $$('.help-error', host);
    var box = null;
    boxes.forEach(function (candidate) { if (!box && candidate.id === id) box = candidate; });
    if (!box) boxes.forEach(function (candidate) { if (!box && !candidate.classList.contains('hidden')) box = candidate; });
    if (!box && boxes.length) box = boxes[0];
    if (!box) {
      box = document.createElement('p');
      box.className = 'help-error hidden';
      host.appendChild(box);
    }
    box.id = id;
    box.textContent = msg;
    box.classList.remove('hidden');
    input.classList.add('field-error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', box.id);
    if (!input.id) input.id = box.id.replace(/-error$/, '');
  }

  function clearError(input) {
    var host = input.closest('[data-field]') || input.parentElement;
    var box = host ? host.querySelector('.help-error') : null;
    if (box) box.classList.add('hidden');
    input.classList.remove('field-error');
    input.removeAttribute('aria-invalid');
  }

  function validateField(input) {
    var v = (input.value || '').trim();
    var msg = '';

    if (input.hasAttribute('required') && !v && input.type !== 'checkbox') {
      msg = input.getAttribute('data-msg-required') || 'This field is required.';
    } else if (input.type === 'checkbox' && input.hasAttribute('required') && !input.checked) {
      msg = 'Please tick this box to continue.';
    } else if (v) {
      if (input.type === 'email' || input.getAttribute('data-rule') === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) msg = 'Enter a valid email address.';
      } else if (input.type === 'tel' || input.getAttribute('data-rule') === 'phone') {
        if ((v.match(/\d/g) || []).length < 7) msg = 'Enter a valid phone number.';
      } else if (input.type === 'date' && input.getAttribute('data-rule') === 'future') {
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (new Date(v) < today) msg = 'Please choose today or a future date.';
      } else if (input.minLength > 0 && input.value.length < input.minLength) {
        msg = 'Please use at least ' + input.minLength + ' characters.';
      } else if (input.getAttribute('data-rule') === 'name') {
        if (v.split(/\s+/).length < 2) msg = 'Please enter your first and last name.';
      }
    }

    if (msg) fieldError(input, msg); else clearError(input);
    return !msg;
  }

  function validateScope(scope) {
    var fields = $$('input, textarea, select', scope).filter(function (el) {
      return el.type !== 'hidden' && !el.disabled && el.offsetParent !== null;
    });
    var firstBad = null;
    fields.forEach(function (el) {
      var ok = validateField(el);
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      firstBad.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    }
    return firstBad === null;
  }

  function initValidation() {
    document.addEventListener(
      'blur',
      function (e) {
        var el = e.target;
        if (el && el.matches && el.matches('input, textarea, select') && (el.value || el.required)) validateField(el);
      },
      true
    );

    document.addEventListener('input', function (e) {
      var el = e.target;
      if (el && el.matches && el.matches('input, textarea, select') && el.getAttribute('aria-invalid') === 'true') validateField(el);
    });

    $$('form[data-validate]').forEach(function (form) {
      on(form, 'submit', function (e) {
        e.preventDefault();
        if (!validateScope(form)) {
          toast('Please check the highlighted fields.', 'error');
          return;
        }
        var msg = form.getAttribute('data-success') || 'Thank you. This is a front-end demo — nothing has been submitted to a server.';
        toast(msg, form.getAttribute('data-toast-kind') || 'demo');
        var reset = form.getAttribute('data-reset');
        if (reset !== 'false') {
          $$('input, textarea, select', form).forEach(function (el) {
            if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
            else el.value = '';
            clearError(el);
          });
        }
      });
    });
  }

  /* ---------------------------------------------------------- filters ---- */
  function initFilters() {
    $$('[data-filter-group]').forEach(function (group) {
      var buttons = $$('[data-filter]', group);
      var targetSel = group.getAttribute('data-filter-target') || '[data-filter-items]';
      var scope = document.querySelector(targetSel) || document;
      var items = $$('[data-tags]', scope);
      var empty = document.querySelector('[data-filter-empty]');

      buttons.forEach(function (btn) {
        on(btn, 'click', function () {
          var key = btn.getAttribute('data-filter');
          buttons.forEach(function (b) {
            var active = b === btn;
            b.setAttribute('aria-pressed', String(active));
            b.classList.toggle('bg-serenity-600', active);
            b.classList.toggle('text-white', active);
            b.classList.toggle('border-serenity-600', active);
            b.classList.toggle('bg-surface', !active);
            b.classList.toggle('text-ink/75', !active);
            b.classList.toggle('border-ink/12', !active);
          });

          var shown = 0;
          items.forEach(function (item) {
            var tags = (item.getAttribute('data-tags') || '').toLowerCase().split(/\s+/);
            var match = key === 'all' || tags.indexOf(key.toLowerCase()) > -1;
            item.hidden = !match;
            if (match) shown++;
          });
          if (empty) empty.hidden = shown > 0;

          var count = document.querySelector('[data-filter-count]');
          if (count) count.textContent = String(shown);
        });
      });
    });
  }

  /* ------------------------------------------------------------- tabs ---- */
  function initTabs() {
    $$('[data-tabs]').forEach(function (root) {
      var tabs = $$('[role="tab"]', root);
      var panels = $$('[role="tabpanel"]', root);
      function select(tab) {
        tabs.forEach(function (t) {
          var on_ = t === tab;
          t.setAttribute('aria-selected', String(on_));
          t.tabIndex = on_ ? 0 : -1;
          t.classList.toggle('bg-serenity-600', on_);
          t.classList.toggle('text-white', on_);
          t.classList.toggle('border-serenity-600', on_);
          t.classList.toggle('bg-surface', !on_);
          t.classList.toggle('text-ink/75', !on_);
          t.classList.toggle('border-ink/12', !on_);
        });
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-tab-panel') !== tab.getAttribute('data-tab');
        });
      }
      tabs.forEach(function (tab, i) {
        on(tab, 'click', function () { select(tab); });
        on(tab, 'keydown', function (e) {
          if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(i + 1) % tabs.length].focus(); select(tabs[(i + 1) % tabs.length]); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); tabs[(i - 1 + tabs.length) % tabs.length].focus(); select(tabs[(i - 1 + tabs.length) % tabs.length]); }
        });
      });
    });
  }

  /* --------------------------------------------------------- counters ---- */
  function initCounters() {
    var nodes = $$('[data-count-to]');
    if (!nodes.length || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.textContent = n.getAttribute('data-count-to'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count-to')) || 0;
        var suffix = el.getAttribute('data-count-suffix') || '';
        var prefix = el.getAttribute('data-count-prefix') || '';
        var dur = 1100;
        var start = performance.now();
        function frame(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* -------------------------------------------------- booking wizard ----- */
  function initBooking() {
    var root = $('[data-booking]');
    if (!root) return;

    var panels = $$('[data-step-panel]', root);
    var dots = $$('[data-step-dot]', root);
    var prevBtn = $('[data-booking-prev]', root);
    var nextBtn = $('[data-booking-next]', root);
    var submitBtn = $('[data-booking-submit]', root);
    var progress = $('[data-booking-progress]', root);
    var stepLive = $('[data-booking-live]', root);
    var index = 0;

    function labelFor(i) { return dots[i] ? dots[i].getAttribute('data-step-dot') : 'Step ' + (i + 1); }

    function render() {
      panels.forEach(function (p, i) { p.hidden = i !== index; });
      dots.forEach(function (d, i) {
        var state = i < index ? 'done' : i === index ? 'current' : 'todo';
        d.setAttribute('aria-current', state === 'current' ? 'step' : 'false');
        var circle = d.querySelector('[data-dot-circle]');
        var num = d.querySelector('[data-dot-number]');
        if (circle) {
          circle.classList.toggle('bg-serenity-600', state !== 'todo');
          circle.classList.toggle('text-white', state !== 'todo');
          circle.classList.toggle('bg-serenity-600/10', state === 'todo');
          circle.classList.toggle('text-serenity-700', state === 'todo');
        }
        if (num) {
          num.textContent = state === 'done' ? '\u2713' : String(i + 1).padStart(2, '0');
        }
        d.classList.toggle('text-ink', state === 'current');
        d.classList.toggle('text-ink/55', state !== 'current');
      });
      if (progress) progress.style.width = (((index + 1) / panels.length) * 100) + '%';
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.hidden = index === panels.length - 1;
      if (submitBtn) submitBtn.hidden = index !== panels.length - 1;
      if (stepLive) stepLive.textContent = 'Step ' + (index + 1) + ' of ' + panels.length + ' — ' + labelFor(index);
      var top = root.getBoundingClientRect().top + window.scrollY - 140;
      if (index > 0 && !reduced) window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      else if (index > 0) window.scrollTo(0, Math.max(top, 0));
    }

    /* radio-card selection (service / therapist) */
    $$('[data-choice]', root).forEach(function (choice) {
      var input = $('input', choice);
      on(choice, 'click', function () {
        if (!input || input.disabled) return;
        input.checked = true;
        $$('[data-choice]', root).forEach(function (c) {
          var active = c === choice;
          c.classList.toggle('border-serenity-600', active);
          c.classList.toggle('bg-serenity-50', active);
          c.classList.toggle('ring-2', active);
          c.classList.toggle('ring-serenity-600/25', active);
        });
        syncSummary();
      });
    });

    /* time slots */
    $$('[data-slot]', root).forEach(function (slot) {
      on(slot, 'click', function () {
        $$('[data-slot]', root).forEach(function (s) {
          s.setAttribute('aria-pressed', 'false');
          s.classList.remove('bg-serenity-600', 'text-white', 'border-serenity-600');
          s.classList.add('bg-surface', 'text-ink/75', 'border-ink/12');
        });
        slot.setAttribute('aria-pressed', 'true');
        slot.classList.add('bg-serenity-600', 'text-white', 'border-serenity-600');
        slot.classList.remove('bg-surface', 'text-ink/75', 'border-ink/12');
        var group = slot.closest('[data-slot-group]');
        var hidden = group ? group.querySelector('input[type="hidden"]') : null;
        if (hidden) hidden.value = slot.textContent.trim();
        syncSummary();
      });
    });

    /* date picker helper: disable past dates */
    $$('input[type="date"]', root).forEach(function (input) {
      var d = new Date();
      d.setDate(d.getDate() + 1);
      input.min = d.toISOString().slice(0, 10);
    });

    /* Every summary cell in the booking area (sidebar + review panel). */
    function syncSummary() {
      $$('[data-summary]', root).forEach(function (cell) {
        var key = cell.getAttribute('data-summary');
        var src = root.querySelector('[name="' + key + '"]');
        if (!src) return;
        var val;
        if (src.type === 'radio' || src.type === 'checkbox') {
          var picked = src.type === 'radio' && src.name
            ? root.querySelector('input[name="' + src.name + '"]:checked')
            : (src.checked ? src : null);
          val = picked ? picked.value : '';
        } else {
          val = src.value || '';
        }
        var out = cell.querySelector('[data-summary-value]') || cell;
        out.textContent = val && val !== '—' ? val : 'Not selected yet';
        out.classList.toggle('text-ink/55', !val || val === '—');
      });
    }

    function stepValid(i) {
      var panel = panels[i];
      var radios = $$('input[type="radio"]', panel);
      if (radios.length) {
        var group = radios[0].name;
        if (!panel.querySelector('input[name="' + group + '"]:checked')) {
          toast('Please choose an option to continue.', 'error');
          var c = panel.querySelector('[data-choice]');
          if (c) { c.focus(); c.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); }
          return false;
        }
      }
      if (panel.hasAttribute('data-requires-slot')) {
        var pickedSlot = panel.querySelector('[data-slot][aria-pressed="true"]');
        if (!pickedSlot) {
          toast('Please choose a time slot.', 'error');
          pickedSlot = panel.querySelector('[data-slot]');
          if (pickedSlot) pickedSlot.focus();
          return false;
        }
      }
      return validateScope(panel);
    }

    on(nextBtn, 'click', function () {
      if (index >= panels.length - 1) return;
      if (!stepValid(index)) return;
      index++;
      render();
    });
    on(prevBtn, 'click', function () {
      if (index === 0) return;
      index--;
      render();
    });
    dots.forEach(function (d, i) {
      on(d, 'click', function () {
        if (i <= index) { index = i; render(); }
        else toast('Complete the earlier steps first.', 'demo');
      });
    });
    on(submitBtn, 'click', function () {
      for (var i = 0; i < panels.length - 1; i++) {
        if (!stepValid(i)) { index = i; render(); return; }
      }
      var confirmation = $('[data-booking-done]');
      if (confirmation) {
        root.querySelectorAll('[data-step-panel]').forEach(function (p) { p.hidden = true; });
        var ref = 'SRN-' + String(Math.floor(Math.random() * 9000) + 1000);
        var refEl = $('[data-booking-ref]', confirmation);
        if (refEl) refEl.textContent = ref;
        var whenEl = $('[data-booking-when]', confirmation);
        if (whenEl) {
          var date = (root.querySelector('input[name="date"]') || {}).value;
          var slot = (root.querySelector('input[name="time"]') || {}).value;
          var svc = root.querySelector('input[name="service"]:checked');
          var th = root.querySelector('input[name="therapist"]:checked');
          whenEl.textContent = [svc ? svc.value : '', th ? th.value : '', date ? new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '', slot || '']
            .filter(Boolean).join(' · ');
        }
        confirmation.hidden = false;
        confirmation.classList.remove('hidden');
        confirmation.setAttribute('tabindex', '-1');
        confirmation.focus({ preventScroll: true });
        confirmation.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        if (progress) progress.style.width = '100%';
      }
      toast('Session confirmed. This is a demo booking — no real appointment was created.', 'demo');
    });

    render();
    syncSummary();
    window.addEventListener('resize', syncSummary);
    root.addEventListener('input', syncSummary);
    root.addEventListener('change', syncSummary);
  }

  /* ------------------------------------------------------- misc bits ----- */
  function initMisc() {
    /* live character counters */
    $$('[data-count-for]').forEach(function (out) {
      var input = document.getElementById(out.getAttribute('data-count-for'));
      if (!input) return;
      var update = function () { out.textContent = String(input.value.length); };
      on(input, 'input', update);
      update();
    });

    /* copy email */
    $$('[data-copy]').forEach(function (btn) {
      on(btn, 'click', function () {
        var value = btn.getAttribute('data-copy');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(value).then(function () { toast('Copied ' + value, 'demo'); });
        } else toast(value, 'demo');
      });
    });

    /* back to top */
    var top = $('[data-back-to-top]');
    if (top) {
      on(top, 'click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          top.classList.toggle('opacity-0', window.scrollY < 700);
          top.classList.toggle('pointer-events-none', window.scrollY < 700);
          ticking = false;
        });
      }, { passive: true });
      top.classList.add('opacity-0', 'pointer-events-none');
    }

    /* set current year placeholders */
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

    /* delegated so items rendered later (dashboards) still respond */
    on(document, 'click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-demo-action]') : null;
      if (btn) toast(btn.getAttribute('data-demo-action'), 'demo');
    });

    /* mark demo disclosures that need the plain-language notice */
    $$('[data-demo-note]').forEach(function (el) {
      el.classList.add('border-dashed', 'border-clay-500/45', 'bg-clay-500/6', 'text-clay-600');
    });
  }

  /* ------------------------------------------------ dev overflow guard ---- */
  function overflowCheck() {
    if (!window.console || !window.console.info) return;
    window.requestAnimationFrame(function () {
      var doc = document.documentElement;
      if (doc.scrollWidth > window.innerWidth + 1) {
        console.info('[Serenity] horizontal overflow detected:', doc.scrollWidth, '>', window.innerWidth);
      }
    });
  }

  function init() {
    initReveals();
    initAccordions();
    initValidation();
    initFilters();
    initTabs();
    initCounters();
    initBooking();
    initMisc();
    overflowCheck();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();