/* Advitya Healthcares — Colorectal Surgery page interactions */
(function () {
  'use strict';

  var WA_NUMBER = '919211221551';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- language switcher (custom UI over Google Translate) ---------- */
  var langBtn = $('#lang-btn');
  var langMenu = $('#lang-menu');
  var langCur = $('#lang-cur');
  var langOpts = $$('.langsel__opt');

  var LANG_NAMES = {
    en: 'English', bn: 'Bengali', gu: 'Gujarati', hi: 'Hindi', kn: 'Kannada',
    ml: 'Malayalam', mr: 'Marathi', or: 'Odia', ta: 'Tamil'
  };

  /* Google stores the choice in a googtrans cookie; read it so the label and
     the tick survive a reload and follow the visitor across pages. */
  function currentLang() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if (!m) return 'en';
    var parts = decodeURIComponent(m[1]).split('/');
    return parts[2] || 'en';
  }

  function writeCookie(code) {
    var value = code === 'en' ? '/en/en' : '/en/' + code;
    var host = location.hostname;
    var opts = ';path=/';
    document.cookie = 'googtrans=' + value + opts;
    if (host && host.indexOf('.') > -1) {
      document.cookie = 'googtrans=' + value + opts + ';domain=.' + host;
    }
  }

  function paintLang(code) {
    /* the pill is compact, so it carries the ISO code; the full name stays
       in the dropdown and in the button's accessible name */
    if (langCur) langCur.textContent = (code || 'en').toUpperCase();
    if (langBtn) langBtn.setAttribute('aria-label', 'Language: ' + (LANG_NAMES[code] || 'English'));
    langOpts.forEach(function (o) {
      o.setAttribute('aria-selected', String(o.getAttribute('data-lang') === code));
    });
  }

  function openLang() {
    if (!langMenu) return;
    langMenu.hidden = false;
    requestAnimationFrame(function () { langMenu.classList.add('is-open'); });
    langBtn.setAttribute('aria-expanded', 'true');
  }

  function closeLang() {
    if (!langMenu || !langMenu.classList.contains('is-open')) return;
    langMenu.classList.remove('is-open');
    langBtn.setAttribute('aria-expanded', 'false');
    setTimeout(function () { langMenu.hidden = true; }, 240);
  }

  /* drive Google's own hidden <select>: that is what actually swaps the text */
  function applyLang(code) {
    writeCookie(code);
    var combo = $('.goog-te-combo');
    if (combo) {
      combo.value = code === 'en' ? '' : code;
      combo.dispatchEvent(new Event('change'));
      /* switching back to English needs a reload to restore the source text */
      if (code === 'en') setTimeout(function () { location.reload(); }, 60);
    } else {
      location.reload();
    }
  }

  if (langBtn && langMenu) {
    paintLang(currentLang());

    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (langMenu.classList.contains('is-open')) closeLang(); else openLang();
    });

    langOpts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var code = opt.getAttribute('data-lang');
        paintLang(code);
        closeLang();
        applyLang(code);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#langsel')) closeLang();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLang();
    });

    /* Google rewrites the page a moment after load; re-sync the label then */
    window.addEventListener('load', function () {
      setTimeout(function () { paintLang(currentLang()); }, 1200);
    });
  }

  /* ---------- section menu ---------- */
  var menu = $('#mmenu');
  var scrim = $('#scrim');
  var burger = $('#burger');
  var menuClose = $('#menu-close');
  var menuLast = null;

  function openMenu() {
    if (!menu) return;
    menuLast = document.activeElement;
    menu.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(function () {
      menu.classList.add('is-open');
      scrim.classList.add('is-open');
    });
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    setTimeout(function () { if (menuClose) menuClose.focus(); }, 80);
  }

  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    scrim.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setTimeout(function () { menu.hidden = true; scrim.hidden = true; }, 240);
    if (menuLast && menuLast.focus) menuLast.focus();
  }

  if (burger) burger.addEventListener('click', function () { closeLang(); openMenu(); });
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (scrim) scrim.addEventListener('click', closeMenu);
  $$('.mmenu a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* a group row only opens its submenu; it never navigates */
  $$('.mmenu__parent').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (sub) sub.hidden = open;
    });
  });

  document.addEventListener('keydown', function (e) {
    if (!menu || !menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;
    var focusable = $$('a[href], button', menu).filter(function (n) { return n.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1023) closeMenu();
  });

  /* ---------- active section, tracked on scroll ---------- */
  var menuLinks = $$('.mmenu a');
  function markActive(el) {
    menuLinks.forEach(function (a) { a.classList.remove('is-active'); });
    $$('.mmenu__group').forEach(function (g) { g.classList.remove('has-active'); });
    if (!el) return;
    el.classList.add('is-active');
    var grp = el.closest('.mmenu__group');
    if (grp) grp.classList.add('has-active');
  }
  var sectionIds = menuLinks
    .map(function (a) { var h = a.getAttribute('href') || ''; return h.charAt(0) === '#' ? h.slice(1) : null; })
    .filter(function (id) { return id && document.getElementById(id); });
  function linkFor(id) {
    for (var i = 0; i < menuLinks.length; i++) {
      if (menuLinks[i].getAttribute('href') === '#' + id) return menuLinks[i];
    }
    return null;
  }
  if (sectionIds.length && 'IntersectionObserver' in window) {
    var seen = {};
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      for (var i = 0; i < sectionIds.length; i++) {
        if (seen[sectionIds[i]]) { markActive(linkFor(sectionIds[i])); return; }
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionIds.forEach(function (id) { sio.observe(document.getElementById(id)); });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = $$('.reveal');

  /* Stagger by position inside the parent grid, not by the order the observer
     happens to batch entries in — that made cards in the same row fire with
     unrelated delays depending on scroll speed. */
  revealables.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var sibs = Array.prototype.filter.call(parent.children, function (n) {
      return n.classList && n.classList.contains('reveal');
    });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 80, 400) + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- counters ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target <= 0) { el.textContent = String(target); return; }
    var start = null;
    var dur = 900;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        runCounter(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- FAQ accordion ---------- */
  $$('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var panel = $('.faq__a', item);
      var open = btn.getAttribute('aria-expanded') === 'true';

      // close siblings
      $$('.faq__item.is-open').forEach(function (other) {
        if (other === item) return;
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
        $('.faq__a', other).style.maxHeight = null;
      });

      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
      panel.style.maxHeight = open ? null : panel.scrollHeight + 'px';
    });
  });
  window.addEventListener('resize', function () {
    $$('.faq__item.is-open .faq__a').forEach(function (p) {
      p.style.maxHeight = p.scrollHeight + 'px';
    });
  });

  /* open the first FAQ so the section does not read as a wall of closed rows */
  var firstFaq = $('.faq__item');
  if (firstFaq) {
    var fq = $('.faq__q', firstFaq), fa = $('.faq__a', firstFaq);
    firstFaq.classList.add('is-open');
    fq.setAttribute('aria-expanded', 'true');
    window.addEventListener('load', function () { fa.style.maxHeight = fa.scrollHeight + 'px'; });
    fa.style.maxHeight = fa.scrollHeight + 'px';
  }

  /* ---------- location map (loaded only when the section is approached) ---------- */
  var mapFrame = $('#loc-map-frame');
  var mapLoaded = false;

  var mapPh = $('#map-placeholder');

  function loadMap(src) {
    if (!mapFrame) return;
    mapFrame.src = src || mapFrame.getAttribute('data-src');
    mapLoaded = true;
  }

  /* the placeholder only clears once the embed has actually painted */
  if (mapFrame && mapPh) {
    mapFrame.addEventListener('load', function () {
      if (mapFrame.src) mapPh.classList.add('is-done');
    });
  }

  if (mapFrame) {
    if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          if (!mapLoaded) loadMap();
          mio.unobserve(e.target);
        });
      }, { rootMargin: '400px 0px' });
      mio.observe(mapFrame);
    } else {
      loadMap();
    }
  }

  $$('.venue').forEach(function (venue) {
    venue.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;   // let phone / directions / booking links work

      $$('.venue').forEach(function (v) {
        v.classList.remove('is-active');
        v.setAttribute('aria-pressed', 'false');
      });
      venue.classList.add('is-active');
      venue.setAttribute('aria-pressed', 'true');

      var cardName = $('#map-card-name'), cardAddr = $('#map-card-addr'), cardGo = $('#map-card-go');
      if (cardName) cardName.innerHTML = venue.getAttribute('data-name');
      if (cardAddr) cardAddr.innerHTML = venue.getAttribute('data-addr');
      if (cardGo) cardGo.href = venue.getAttribute('data-dir');

      if (mapFrame) {
        loadMap(venue.getAttribute('data-map'));
        mapFrame.title = 'Map of ' + venue.getAttribute('data-venue');
      }
    });
  });

  /* ---------- booking widget: location, date and time pickers ---------- */
  var DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
               '12:00', '12:30', '16:00', '16:30', '17:00', '17:30'];

  var picked = { location: 'Kolkata', date: '', time: '' };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function label12(hhmm) {
    var parts = hhmm.split(':');
    var h = parseInt(parts[0], 10);
    var suffix = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + parts[1] + ' ' + suffix;
  }

  function makeSlot(top, main, value, extraClass) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (extraClass ? ' ' + extraClass : '');
    b.setAttribute('aria-pressed', 'false');
    b.dataset.value = value;
    b.innerHTML = extraClass === 'slot--time'
      ? '<b>' + main + '</b><small>' + top + '</small>'
      : '<small>' + top + '</small><b>' + main + '</b>';
    return b;
  }

  function selectIn(track, btn, key) {
    $$('.slot', track).forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
    btn.setAttribute('aria-pressed', 'true');
    picked[key] = btn.dataset.value;
  }

  var dateTrack = $('#date-track');
  var timeTrack = $('#time-track');

  if (dateTrack) {
    var today = new Date();
    for (var i = 0; i < 12; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      var btn = makeSlot(i === 0 ? 'Today' : DAYS[d.getDay()], String(d.getDate()), isoOf(d));
      btn.setAttribute('aria-label', 'Preferred date ' + d.toDateString());
      dateTrack.appendChild(btn);
    }
    dateTrack.addEventListener('click', function (e) {
      var btn = e.target.closest('.slot');
      if (btn) selectIn(dateTrack, btn, 'date');
    });
    selectIn(dateTrack, $('.slot', dateTrack), 'date');
  }

  if (timeTrack) {
    TIMES.forEach(function (t) {
      var parts = label12(t).split(' ');
      var btn = makeSlot(parts[1], parts[0], t, 'slot--time');
      btn.setAttribute('aria-label', 'Preferred time ' + label12(t));
      timeTrack.appendChild(btn);
    });
    timeTrack.addEventListener('click', function (e) {
      var btn = e.target.closest('.slot');
      if (btn) selectIn(timeTrack, btn, 'time');
    });
    selectIn(timeTrack, $('.slot', timeTrack), 'time');
  }

  $$('.picker').forEach(function (picker) {
    var track = $('.picker__track', picker);
    var prev = $('.picker__btn--prev', picker);
    var next = $('.picker__btn--next', picker);
    if (!track) return;

    function sync() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
    }
    function nudge(dir) {
      track.scrollBy({ left: dir * Math.max(track.clientWidth * 0.8, 120), behavior: 'smooth' });
      setTimeout(sync, 380);
    }
    prev.addEventListener('click', function () { nudge(-1); });
    next.addEventListener('click', function () { nudge(1); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  $$('input[name="w-location"]').forEach(function (r) {
    r.addEventListener('change', function () { picked.location = r.value; });
  });

  var widgetBook = $('#widget-book');
  if (widgetBook) {
    widgetBook.addEventListener('click', function () {
      openModal(widgetBook);
    });
  }

  /* ---------- care-journey timeline arrows ---------- */
  var tlTrack = $('#journey-track');
  if (tlTrack) {
    var tlPrev = $('.tl-prev'), tlNext = $('.tl-next');
    var tlNav = $('.tl-nav');
    var tlSync = function () {
      var max = tlTrack.scrollWidth - tlTrack.clientWidth - 2;
      if (tlPrev) tlPrev.disabled = tlTrack.scrollLeft <= 2 || max <= 0;
      if (tlNext) tlNext.disabled = tlTrack.scrollLeft >= max || max <= 0;
      /* nothing to scroll: hide the arrows rather than show two dead buttons */
      if (tlNav) tlNav.style.visibility = max <= 0 ? 'hidden' : '';
    };
    var tlNudge = function (dir) {
      tlTrack.scrollBy({ left: dir * Math.max(tlTrack.clientWidth * 0.6, 240), behavior: 'smooth' });
      setTimeout(tlSync, 400);
    };
    if (tlPrev) tlPrev.addEventListener('click', function () { tlNudge(-1); });
    if (tlNext) tlNext.addEventListener('click', function () { tlNudge(1); });
    tlTrack.addEventListener('scroll', tlSync, { passive: true });
    window.addEventListener('resize', tlSync);
    tlSync();
  }

  /* ---------- quick-start modal ---------- */
  var modal = $('#quick-modal');
  var quickForm = $('#quick-form');
  var quickPhone = $('#quick-phone');
  var quickError = $('#quick-error');
  var lastFocus = null;

  function normalisePhone(value) {
    return String(value || '').replace(/[^0-9]/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  }

  function openModal(trigger) {
    if (!modal) return;
    lastFocus = trigger || document.activeElement;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    if (quickError) { quickError.textContent = ''; quickError.classList.remove('is-visible'); }
    setTimeout(function () { if (quickPhone) quickPhone.focus(); }, 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function sendRequest(phone) {
    var lines = [
      'Colorectal surgery consultation request \u2014 Advitya Healthcares',
      'Mobile: +91 ' + phone,
      'Preferred location: ' + picked.location
    ];
    if (picked.date) lines.push('Preferred date: ' + picked.date);
    if (picked.time) lines.push('Preferred time: ' + label12(picked.time));
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')),
      '_blank', 'noopener');
  }

  $$('[data-book]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.hasAttribute('data-loc')) {
        var value = el.getAttribute('data-loc');
        picked.location = value;
        var radio = $('input[name="w-location"][value="' + value + '"]');
        if (radio) radio.checked = true;
      }
      e.preventDefault();
      closeMenu();
      openModal(el);
    });
  });

  if (modal) {
    $$('[data-modal-close]', modal).forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });
    modal.addEventListener('mousedown', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var focusable = $$('button, input, a[href]', modal).filter(function (n) { return !n.disabled; });
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  if (quickForm) {
    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var digits = normalisePhone(quickPhone.value);
      if (!/^[6-9][0-9]{9}$/.test(digits)) {
        quickError.textContent = 'Please enter a valid 10-digit Indian mobile number.';
        quickError.classList.add('is-visible');
        quickPhone.focus();
        return;
      }
      quickError.textContent = 'Opening WhatsApp with your request \u2026';
      quickError.classList.add('is-visible', 'is-ok');
      sendRequest(digits);
      setTimeout(function () {
        quickError.classList.remove('is-ok');
        quickForm.reset();
        closeModal();
      }, 1400);
    });
  }

  /* ---------- share + read more ---------- */
  var shareBtn = $('#share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var data = { title: document.title, url: location.href };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href).then(function () {
          shareBtn.setAttribute('aria-label', 'Page link copied');
        }).catch(function () {});
      }
    });
  }

  var aboutToggle = $('#about-toggle');
  var aboutMore = $('#about-more');
  if (aboutToggle && aboutMore) {
    aboutToggle.addEventListener('click', function () {
      var open = aboutToggle.getAttribute('aria-expanded') === 'true';
      aboutToggle.setAttribute('aria-expanded', String(!open));
      aboutMore.classList.toggle('is-open', !open);
      aboutToggle.childNodes[0].nodeValue = open ? 'Read More ' : 'Read Less ';
    });
  }

  /* ---------- footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
