/* NCDPC pages. Each block only runs on the page that has its markup.
   Home: curtain intro and slideshow, event panels, counters. Photos: filter chips, grid and viewer. Panel: people. */
(function () {
  var N = window.NCD, $ = N.$, el = N.el, reduce = N.reduce, plural = N.plural;
  var page = document.body.dataset.page;
  var T0 = performance.now();

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    next: ARROW
  };
  var hash = function () {
    var m = /(?:^#|&)e=([^&]*)/.exec(location.hash);
    try { return m ? decodeURIComponent(m[1]) : null; } catch (e) { return null; }
  };
  var pick = function (ev, i) { return ev.photos[i] || ev.photos[0]; }; // photo 0 is often a title card, so skip it where we can

  /* ================= HOME ================= */
  if (page === 'home') Promise.all([N.getEvents(), N.getSlides().catch(function () { return []; })]).then(function (res) {
    var list = res[0], slideFiles = res[1];
    var total = list.reduce(function (n, e) { return n + e.photos.length; }, 0);

    /* archive counters (the markup already holds the build-time numbers, used when scripts are off) */
    [['events', list.length, ['event', 'events']], ['photos', total, ['photo', 'photos']]].forEach(function (c) {
      var b = $('[data-n="' + c[0] + '"]'), w = $('[data-w="' + c[0] + '"]');
      if (b) N.count(b, c[1]);
      if (w) w.textContent = c[1] === 1 ? c[2][0] : c[2][1];
    });

    /* hero pictures: round robin across events, starting at each event's second photo */
    var items = [], round = 1;
    /* the slideshow folder (assets/slideshow) takes priority */
    slideFiles.forEach(function (s) { items.push({ ev: { title: s.caption || 'Latest photos', slug: '', href: 'photos.html' }, src: s.src }); });
    /* if that folder is empty: round robin across events */
    while (!items.length && items.length < 6 && round < 8) {
      list.forEach(function (ev) { if (items.length < 6 && ev.photos[round]) items.push({ ev: ev, src: ev.photos[round] }); });
      round++;
    }
    if (!items.length && list.length) items.push({ ev: list[0], src: list[0].photos[0] });

    /* event panels */
    var stack = $('#stack');
    if (stack) {
      var cards = list.slice(0, 6).map(function (ev, i) {
        var a = el('a', 'sc'); a.href = 'photos.html#e=' + encodeURIComponent(ev.slug); a.style.setProperty('--i', i);
        var img = new Image(); img.src = pick(ev, 1); img.alt = ''; img.decoding = 'async'; if (i > 1) img.loading = 'lazy';
        var inner = el('span', 'sc-in'), txt = el('span');
        txt.appendChild(el('span', 'sc-t', ev.title)); txt.appendChild(el('span', 'sc-n', plural(ev.photos.length, 'photo', 'photos')));
        var go = el('span', 'sc-go'); go.innerHTML = ARROW; go.setAttribute('aria-hidden', 'true');
        inner.appendChild(txt); inner.appendChild(go);
        a.appendChild(img); a.appendChild(inner); stack.appendChild(a);
        N.parallax(img, 0.06);
        return a;
      });
      N.stack(cards);
      var more = $('#seeAll'); if (more) more.hidden = false;
    }

    /* closing panel photo */
    var cta = $('#ctaImg');
    if (cta && items.length) { cta.src = items[items.length - 1].src; cta.hidden = false; N.parallax(cta, 0.08); }

    if (items.length) hero(items); else { clearIntro(); var c = $('.hctl'); if (c) c.hidden = true; }
  });

  /* ---- hero: aperture intro + slideshow ---- */
  var root = document.documentElement;
  function clearIntro() { root.classList.remove('intro'); }
  if (page === 'home') setTimeout(clearIntro, 6000); // a script failure must never leave the page hidden

  function hero(items) {
    var box = $('.slides'), hero = box.parentNode, mark = $('.mark'), cw = $('.curtain'), top = $('.top');
    var SLIDE = 6500, TRANS = 2000, N_ = items.length, cur = 0, trans = null, segAnim = null, userPaused = false, autoPaused = false, playing = false;
    var intro = root.classList.contains('intro') && !reduce;
    var origins = ['50% 50%', '30% 60%', '70% 40%', '40% 30%', '60% 70%', '50% 40%'];

    var slides = items.map(function (it, i) {
      var s = el('div', 'slide'), im = new Image(); im.src = it.src; im.alt = ''; im.decoding = 'async'; im.style.transformOrigin = origins[i % origins.length];
      s.appendChild(im); s.style.visibility = 'hidden'; box.appendChild(s); return s;
    });
    var cap = $('.hcap'), capLink = $('a', cap), capNum = $('span', cap), segsBox = $('.segs'), pauseBtn = $('#hPause'), prevBtn = $('#hPrev'), nextBtn = $('#hNext');
    var segs = items.map(function (it, i) {
      var b = el('button', 'seg'); b.type = 'button'; b.setAttribute('aria-label', 'Show photo ' + (i + 1) + ' of ' + N_ + ': ' + it.ev.title);
      b.appendChild(el('i')); b.addEventListener('click', function () { go(i); }); segsBox.appendChild(b); return b;
    });
    var kens = [];

    function label() {
      capLink.textContent = items[cur].ev.title; capLink.href = items[cur].ev.href || 'photos.html#e=' + encodeURIComponent(items[cur].ev.slug);
      capNum.textContent = (cur + 1) + ' / ' + N_;
    }
    function ken(i) {
      if (reduce) return;
      if (kens[i]) kens[i].cancel();
      kens[i] = slides[i].firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }], { duration: SLIDE + TRANS + 800, easing: 'linear', fill: 'forwards' });
      if (isPaused()) kens[i].pause();
    }
    function isPaused() { return userPaused || autoPaused || !playing; }
    function sync() {
      var p = isPaused();
      [segAnim, kens[cur]].forEach(function (a) { if (a) { if (p) a.pause(); else a.play(); } });
      cap.setAttribute('aria-live', userPaused ? 'polite' : 'off');
    }
    function startSeg() {
      segs.forEach(function (s, k) { s.classList.toggle('done', k < cur); s.firstChild.getAnimations().forEach(function (a) { a.cancel(); }); });
      segAnim = null;
      if (reduce) { segs[cur].classList.add('done'); return; }
      segAnim = segs[cur].firstChild.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: SLIDE, easing: 'linear', fill: 'forwards' });
      segAnim.onfinish = function () { go((cur + 1) % N_); };
      sync();
    }
    function finish() {
      if (!trans) return; var t = trans; trans = null;
      t.a.cancel();
      t.inc.style.zIndex = 1; if (t.out) { t.out.style.visibility = 'hidden'; t.out.style.zIndex = 0; if (kens[t.oi]) kens[t.oi].cancel(); }
    }
    function blend(inc, out, oi, dur) { // soft cross-dissolve: the next photo fades in over the current one
      inc.style.visibility = 'visible'; inc.style.zIndex = 2; out.style.zIndex = 1;
      var a = inc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'both' });
      trans = { inc: inc, out: out, oi: oi, a: a };
      a.onfinish = finish;
    }
    function go(to) {
      if (to === cur && playing) return;
      finish();
      var from = cur; cur = to; label(); playing = true;
      if (reduce) { slides[from].style.visibility = 'hidden'; slides[to].style.visibility = 'visible'; slides[to].style.zIndex = 1; startSeg(); return; }
      if (from === to) { slides[to].style.visibility = 'visible'; slides[to].style.zIndex = 1; } else blend(slides[to], slides[from], from, TRANS);
      ken(to); startSeg();
      var nx = new Image(); nx.src = items[(to + 1) % N_].src;
    }
    window.NCD_heroGo = go;

    /* controls */
    prevBtn.addEventListener('click', function () { go((cur - 1 + N_) % N_); });
    nextBtn.addEventListener('click', function () { go((cur + 1) % N_); });
    if (reduce || N_ < 2) pauseBtn.hidden = true; // nothing autoplays under reduced motion
    pauseBtn.addEventListener('click', function () { userPaused = !userPaused; pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false'); sync(); });
    if (N_ < 2) { prevBtn.hidden = nextBtn.hidden = true; }
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? [e.touches[0].clientX, e.touches[0].clientY] : null; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (!x0 || N_ < 2) return; var dx = e.changedTouches[0].clientX - x0[0], dy = e.changedTouches[0].clientY - x0[1]; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? (cur + 1) % N_ : (cur - 1 + N_) % N_);
    });
    if (!reduce && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { autoPaused = !es[0].isIntersecting; if (playing) sync(); }, { threshold: 0.2 }).observe(hero);
    document.addEventListener('visibilitychange', function () { autoPaused = document.hidden; if (playing) sync(); });

    /* start: plain, or with the curtain intro */
    var lines = N.$$('.ln > span', hero), rest = N.$$('.hero-copy > :not(h1), .hctl', hero);
    if (!intro) { clearIntro(); go(0); return; }
    try { sessionStorage.setItem('ncdIntro', '1'); } catch (e) {}
    var wait = Math.max(0, 900 - (performance.now() - T0));
    var m = [mark.querySelector('img'), mark.querySelector('span')];
    m[0].animate([{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: N.ease, fill: 'both' });
    m[1].animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 150, easing: N.ease, fill: 'both' });
    var halves = N.$$('.cw-t, .cw-b', cw), line = $('.cw-l', cw), sh = 'cubic-bezier(.76,0,.24,1)';
    function open() { // the curtains part and the first photo settles in
      cur = 0; playing = true; label();
      slides[0].style.visibility = 'visible'; slides[0].style.zIndex = 1;
      halves.forEach(function (h, i) { h.animate([{ transform: 'none' }, { transform: 'translateY(' + (i ? 101 : -101) + '%)' }], { duration: 1300, easing: sh, fill: 'both' }); });
      line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'both' });
      mark.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'both' });
      slides[0].animate([{ transform: 'scale(1.3)' }, { transform: 'none' }], { duration: 2200, easing: N.ease, fill: 'both' });
      ken(0); startSeg();
      setTimeout(function () {
        clearIntro();
        lines.forEach(function (s, i) { s.animate([{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 1000, delay: i * 140, easing: N.ease, fill: 'both' }); });
        rest.forEach(function (n, i) { n.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 350 + i * 90, easing: N.ease, fill: 'both' }); });
        if (top) top.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 500, fill: 'both' });
      }, 900);
    }
    setTimeout(function () { // the brass line draws across the logo, then the curtains part
      line.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 800, easing: sh, fill: 'both' });
      setTimeout(open, 950);
    }, wait + 600);
  }

  /* ================= PHOTOS ================= */
  if (page === 'photos') N.getEvents().then(function (list) {
    var chips = $('#chips'), grid = $('#grid'), count = $('#count'), title = document.title;
    var thumbs = [], flat = [], active = null;
    var total = list.reduce(function (n, e) { return n + e.photos.length; }, 0);

    function chip(slug, text, n) {
      var b = el('button', 'chip'); b.type = 'button'; b.dataset.slug = slug; b.appendChild(document.createTextNode(text + ' ')); b.appendChild(el('small', null, String(n)));
      b.addEventListener('click', function () { select(slug); try { history.replaceState(null, '', slug ? '#e=' + encodeURIComponent(slug) : location.pathname); } catch (e) {} });
      chips.appendChild(b); return b;
    }
    if (!list.length) { grid.appendChild(el('p', 'empty', 'No photos yet. Check back soon.')); return; }
    var chipEls = [chip('', 'All events', total)].concat(list.map(function (ev) { return chip(ev.slug, ev.title, ev.photos.length); }));

    function select(slug) {
      var ev = list.filter(function (x) { return x.slug === slug; })[0] || null; active = ev;
      chipEls.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.slug === (ev ? ev.slug : '') ? 'true' : 'false'); });
      document.title = ev ? ev.title + ' | NCD Photography Club' : title;
      count.textContent = ev ? ev.title + ': ' + plural(ev.photos.length, 'photo', 'photos') + (ev.date ? ', ' + new Date(ev.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '') : plural(list.length, 'event', 'events') + ', ' + plural(total, 'photo', 'photos');
      grid.textContent = ''; thumbs = []; flat = [];
      (ev ? [ev] : list).forEach(function (e) { e.photos.forEach(function (src, i) { flat.push({ src: src, title: e.title, i: i, n: e.photos.length }); }); });
      flat.forEach(function (p, k) {
        var b = el('button', 'shot'); b.type = 'button'; b.setAttribute('aria-label', 'Open photo from ' + p.title + ', ' + (p.i + 1) + ' of ' + p.n);
        var img = new Image(); img.alt = ''; img.decoding = 'async'; if (k > 11) img.loading = 'lazy'; img.src = p.src;
        b.appendChild(img); grid.appendChild(b); thumbs.push(img);
        b.addEventListener('click', function () { viewer(k, img); });
        N.develop(img, (k % 8) * 70);
      });
    }
    select(hash());
    window.addEventListener('hashchange', function () { select(hash()); });

    /* ---- viewer: the photo grows out of its thumbnail and goes back to it ---- */
    var d = null, vimg, cap, num, idx = 0, busy = false;
    function ensure() {
      if (d) return;
      d = el('dialog', 'lb'); d.setAttribute('aria-label', 'Photo viewer');
      d.innerHTML = '<button class="pill lb-close" type="button" data-x>Close</button><div class="lb-stage"><img alt=""></div>' +
        '<div class="lb-bar"><p class="lb-cap" aria-live="polite"><b></b><span></span></p><div class="lb-btns">' +
        '<button class="cbtn" type="button" data-d="-1" aria-label="Previous photo">' + ICON.prev + '</button><button class="cbtn" type="button" data-d="1" aria-label="Next photo">' + ICON.next + '</button></div></div>';
      document.body.appendChild(d);
      vimg = $('img', d); cap = $('b', d); num = $('.lb-cap span', d);
      d.addEventListener('click', function (e) {
        if (e.target.closest('[data-x]') || e.target === d || e.target.classList.contains('lb-stage')) close();
        else { var b = e.target.closest('[data-d]'); if (b) step(+b.dataset.d); }
      });
      d.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
      d.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1); });
      var x0 = null;
      d.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
      d.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
      d.addEventListener('close', function () { vimg.removeAttribute('src'); root.style.overflow = ''; busy = false; });
    }
    function fill() {
      var p = flat[idx]; vimg.src = p.src; vimg.alt = p.title + ', photo ' + (p.i + 1) + ' of ' + p.n;
      cap.textContent = p.title; num.textContent = (idx + 1) + ' / ' + flat.length;
      $('[data-d="-1"]', d).hidden = $('[data-d="1"]', d).hidden = flat.length < 2;
    }
    function from(a, b) { // transform that puts rect b's box where rect a is
      return 'translate(' + (a.left - b.left).toFixed(1) + 'px,' + (a.top - b.top).toFixed(1) + 'px) scale(' + (a.width / b.width).toFixed(4) + ',' + (a.height / b.height).toFixed(4) + ')';
    }
    function viewer(k, thumb) {
      ensure(); idx = k; fill(); root.style.overflow = 'hidden'; d.showModal();
      if (reduce) return;
      var a = thumb.getBoundingClientRect(), go = function () {
        var b = vimg.getBoundingClientRect(); if (!b.width) return;
        vimg.style.transformOrigin = '0 0';
        vimg.animate([{ transform: from(a, b) }, { transform: 'none' }], { duration: 520, easing: N.ease }).onfinish = function () { vimg.style.transformOrigin = ''; };
        $('.lb-bar', d).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 220, fill: 'backwards' });
      };
      (vimg.decode ? vimg.decode().then(go, go) : go());
    }
    function step(s) {
      if (flat.length < 2) return;
      idx = (idx + s + flat.length) % flat.length; fill();
      if (!reduce) vimg.animate([{ opacity: 0, transform: 'translateX(' + (s * 24) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: N.ease });
    }
    function close() {
      if (busy) return;
      var t = thumbs[idx];
      if (reduce || !t) { d.close(); return; }
      busy = true; t.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      var a = t.getBoundingClientRect(), b = vimg.getBoundingClientRect(), vis = a.bottom > 0 && a.top < innerHeight;
      vimg.style.transformOrigin = '0 0';
      var anim = vis ? vimg.animate([{ transform: 'none' }, { transform: from(a, b) }], { duration: 380, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' })
                     : vimg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
      $('.lb-bar', d).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' });
      anim.onfinish = function () { d.close(); vimg.style.transformOrigin = ''; anim.cancel(); };
    }
  });

  /* ================= PANEL ================= */
  var PD = window.PANEL_DATA, host = $('#people');
  if (page === 'panel' && PD && host) {
    [['panelTitle', PD.title], ['panelIntro', PD.intro]].forEach(function (p) { var n = $('#' + p[0]); if (n) { if (p[1]) n.textContent = p[1]; else n.hidden = true; } });
    var people = PD.people || [], order = [];
    if (!people.length) host.appendChild(el('p', 'empty', 'No one has been added yet.'));
    people.forEach(function (p) { if (order.indexOf(p.group || '') < 0) order.push(p.group || ''); });
    order.forEach(function (g) {
      var sec = el('section', 'group'); if (g && PD.groups && PD.groups[g]) sec.appendChild(el('h2', null, PD.groups[g]));
      var wrap = el('div', 'people');
      people.filter(function (p) { return (p.group || '') === g; }).forEach(function (p) {
        var c = el('article', 'person'), ph = el('div', 'person-ph');
        var initials = String(p.name || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '?';
        var none = function () { ph.textContent = initials; ph.classList.add('none'); ph.textContent = initials; };
        if (p.photo) { var im = new Image(); im.alt = 'Photo of ' + (p.name || 'member'); im.loading = 'lazy'; im.onerror = function () { im.remove(); none(); }; im.src = 'assets/panel/' + encodeURI(p.photo); ph.appendChild(im); N.develop(im, 0); } else none();
        c.appendChild(ph);
        if (p.name) c.appendChild(el('h3', 'person-name', p.name));
        if (p.position) c.appendChild(el('p', 'person-role', p.position));
        if (p.speech) c.appendChild(el('blockquote', 'person-quote', p.speech));
        wrap.appendChild(c);
      });
      sec.appendChild(wrap); host.appendChild(sec);
    });
  }
})();
