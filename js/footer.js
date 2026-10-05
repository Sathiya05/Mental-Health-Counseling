/* =============================================================
   Serenity — js/footer.js
   Renders the site footer into #footer on every page.
   ============================================================= */
(function () {
  'use strict';

  var BASE = /\/dashboard\//i.test(window.location.pathname) ? '../' : './';
  var YEAR = new Date().getFullYear();

  var SOCIAL = [
    {
      label: 'Instagram',
      href: '#',
      icon: '<path d="M7.5 3.5h9A4 4 0 0 1 20.5 7.5v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/>'
    },
    {
      label: 'LinkedIn',
      href: '#',
      icon: '<path d="M6.5 9.5v8M6.5 6.4v.1M10.5 17.5v-4.4a2.4 2.4 0 0 1 4.8 0v4.4M10.5 9.5v8"/><rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.4"/>'
    },
    {
      label: 'YouTube',
      href: '#',
      icon: '<rect x="3.4" y="6" width="17.2" height="12" rx="3.4"/><path d="m10.8 9.6 4.4 2.4-4.4 2.4V9.6Z"/>'
    }
  ];

  function link(href, label, external) {
    return (
      '<a href="' + href + '" class="inline-flex items-center gap-1.5 rounded text-[0.88rem] text-white/72 transition-colors duration-300 hover:text-white' +
      (external ? ' underline decoration-white/25 underline-offset-4 hover:decoration-white' : '') +
      '">' + label + '</a>'
    );
  }

  function socialIcon(s) {
    return (
      '<a href="' + s.href + '" aria-label="Serenity on ' + s.label + '" class="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/80 transition-all duration-300 hover:border-white hover:bg-surface hover:text-serenity-700">' +
      '<svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + s.icon + '</svg>' +
      '</a>'
    );
  }

  function render() {
    var host = document.getElementById('footer');
    if (!host) return;

    host.innerHTML =
      '<footer class="mt-auto bg-serenity-600 text-white">' +

      /* crisis / safety strip */
      '<div class="border-b border-white/12 bg-serenity-700">' +
      '<div class="shell flex flex-col gap-2 py-3.5 text-[0.78rem] leading-relaxed text-white/85 sm:flex-row sm:items-center sm:gap-3">' +
      '<span class="inline-flex items-center gap-2 font-semibold text-white">' +
      '<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 8.5v4.5"/><circle cx="12" cy="16.2" r="0.9" fill="currentColor"/><circle cx="12" cy="12" r="9"/></svg>' +
      'Need urgent support?</span>' +
      '<span>Serenity is not an emergency service. If you are in immediate danger or crisis, contact your local emergency number or a 24/7 crisis helpline in your country.</span>' +
      '</div></div>' +

      /* main footer */
      '<div class="shell py-14 lg:py-16">' +
      '<div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">' +

      /* brand */
      '<div class="lg:col-span-4 lg:pr-8">' +
      '<a href="' + BASE + 'index.html" class="inline-flex items-center gap-3">' +
      '<span class="grid h-11 w-11 place-items-center rounded-xl bg-white/12" aria-hidden="true">' +
      '<svg viewBox="0 0 32 32" class="h-6 w-6" fill="none">' +
      '<path d="M16 4.5c4.6 2.4 7.6 6 7.6 10.2 0 4-3.2 7.3-7.6 7.3S8.4 18.7 8.4 14.7C8.4 10.5 11.4 6.9 16 4.5Z" fill="#E4D9C8"/>' +
      '<path d="M11.4 18.2c1.6-1.9 3.1-3 4.6-3.6M16 21.6c1.9-1.4 3.3-3.3 4.2-5.7" stroke="#3F7C85" stroke-width="1.7" stroke-linecap="round"/>' +
      '</svg></span>' +
      '<span class="flex flex-col leading-none">' +
      '<span class="font-display text-xl font-semibold tracking-[-0.02em]">Serenity</span>' +
      '<span class="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/60">Mental Health Counseling</span>' +
      '</span></a>' +
      '<p class="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-white/78">Compassionate support for your mental well-being. A calm, confidential space to understand yourself better and move forward at your own pace.</p>' +
      '<div class="mt-6 flex gap-2.5">' + SOCIAL.map(socialIcon).join('') + '</div>' +
      '</div>' +

      /* quick links */
      '<nav aria-label="Footer quick links" class="lg:col-span-2">' +
      '<h2 class="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/55">Quick Links</h2>' +
      '<ul class="mt-5 space-y-3">' +
      ['index.html|Home', 'about.html|About Serenity', 'services.html|Counseling Services', 'therapists.html|Our Therapists']
        .map(function (i) {
          var p = i.split('|');
          return '<li>' + link(BASE + p[0], p[1]) + '</li>';
        })
        .join('') +
      '</ul></nav>' +

      /* resources */
      '<nav aria-label="Footer resources" class="lg:col-span-2">' +
      '<h2 class="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/55">Resources</h2>' +
      '<ul class="mt-5 space-y-3">' +
      [
        'resources.html|Wellness Library',
        'index.html#faq|Frequently Asked Questions',
        'contact.html|Contact Us',
        'book-session.html|Book a Session',
        'login.html|Client Portal'
      ]
        .map(function (i) {
          var p = i.split('|');
          return '<li>' + link(BASE + p[0], p[1]) + '</li>';
        })
        .join('') +
      '</ul></nav>' +

      /* contact */
      '<div class="lg:col-span-4">' +
      '<h2 class="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/55">Get in Touch</h2>' +
      '<ul class="mt-5 space-y-4 text-[0.9rem] text-white/78">' +
      '<li class="flex gap-3">' +
      '<svg viewBox="0 0 24 24" class="mt-0.5 h-[18px] w-[18px] shrink-0 text-sand-200" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.2 3.8h3l1.6 4-2 1.4a11.6 11.6 0 0 0 6 6l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.2 6a2 2 0 0 1 2-2.2Z"/></svg>' +
      '<span><a href="tel:+15550148200" class="transition-colors duration-300 hover:text-white">+1 (555) 014-8200</a><span class="mt-0.5 block text-[0.78rem] text-white/55">Mon–Sat, 9:00 AM – 7:00 PM</span></span></li>' +

      '<li class="flex gap-3">' +
      '<svg viewBox="0 0 24 24" class="mt-0.5 h-[18px] w-[18px] shrink-0 text-sand-200" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.4" y="5.4" width="17.2" height="13.2" rx="2.6"/><path d="m4.4 7.4 7.6 5.2 7.6-5.2"/></svg>' +
      '<span><a href="mailto:care@serenitycounseling.demo" class="transition-colors duration-300 hover:text-white">care@serenitycounseling.demo</a><span class="mt-0.5 block text-[0.78rem] text-white/55">Replies within one business day</span></span></li>' +

      '<li class="flex gap-3">' +
      '<svg viewBox="0 0 24 24" class="mt-0.5 h-[18px] w-[18px] shrink-0 text-sand-200" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s7-5.2 7-10.4A7 7 0 0 0 5 10.6C5 15.8 12 21 12 21Z"/><circle cx="12" cy="10.6" r="2.6"/></svg>' +
      '<span>14 Willow Grove Terrace<span class="mt-0.5 block text-[0.78rem] text-white/55">Suite 3, Bengaluru 560038</span></span></li>' +
      '</ul></div>' +

      '</div></div>' +

      /* bottom bar */
      '<div class="border-t border-white/12 bg-serenity-700">' +
      '<div class="shell flex flex-col items-center justify-between gap-4 py-6 text-center sm:flex-row sm:text-left">' +
      '<p class="text-[0.8rem] text-white/65">&copy; ' + YEAR + ' Serenity Mental Health Counseling Center. All rights reserved.</p>' +
      '<ul class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">' +
      '<li><a href="' + BASE + 'resources.html" class="text-[0.8rem] text-white/72 transition-colors duration-300 hover:text-white">Privacy Policy</a></li>' +
      '<li><a href="' + BASE + 'resources.html" class="text-[0.8rem] text-white/72 transition-colors duration-300 hover:text-white">Terms of Service</a></li>' +
      '<li><a href="' + BASE + 'contact.html" class="text-[0.8rem] text-white/72 transition-colors duration-300 hover:text-white">Accessibility</a></li>' +
      '</ul></div></div>' +

      '</footer>';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();