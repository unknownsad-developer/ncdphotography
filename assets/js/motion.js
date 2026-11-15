/* NCDPC motion. One scroll loop drives the header, the parallax and the stacking event panels.
   Counters and the "developing" image effect use IntersectionObserver. Nothing here runs the
   animations for visitors who prefer reduced motion: they see the final state straight away. */
(function () {
  var N = window.NCD, reduce = N.reduce, $ = N.$, vh = innerHeight;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* one scroll loop, many listeners */
  var fns = [], queued = false;
  function run() { queued = false; vh = innerHeight; var y = window.pageYOffset; fns.forEach(function (f) { f(y); }); }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(run); } }
  N.onScroll = function (f) { fns.push(f); queue(); };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);

  /* header: transparent over the home hero, solid once you scroll */
  var top = $('.top');
  if (top && top.classList.contains('over')) {
    N.onScroll(function (y) { top.classList.toggle('over', y < 60 && !top.classList.contains('menu-open')); });
  }

  /* parallax: the image inside a clipped frame drifts a little slower than the frame */
  N.parallax = function (img, amount) {
    if (reduce) return;
    var frame = img.parentElement;
    N.onScroll(function () {
      var r = frame.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      img.style.setProperty('--py', (-p * r.height * amount).toFixed(1) + 'px');
    });
  };

  /* stacking panels: each panel shrinks and darkens a little as the next one slides over it */
  N.stack = function (cards) {
    if (reduce || cards.length < 2) return;
    N.onScroll(function () {
      cards.forEach(function (c, i) {
        if (i === cards.length - 1) return;
        var h = c.offsetHeight, top0 = parseFloat(getComputedStyle(c).top) || 0;
        var d = cards[i + 1].getBoundingClientRect().top - top0;
        var p = clamp((h - d) / (h - 16), 0, 1);
        c.style.setProperty('--sc', (1 - 0.05 * p).toFixed(4));
        c.style.setProperty('--dim', (0.55 * p).toFixed(3));
      });
    });
  };

  /* counters */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target._go && e.target._go(); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }) : null;
  N.count = function (el, to) {
    if (reduce || !io) { el.textContent = to; return; }
    el.textContent = '0';
    el._go = function () {
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(to * e);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    };
    io.observe(el);
  };

  /* "developing" images: they start dark and desaturated and come up as they enter the view */
  N.develop = function (img, delay) {
    if (reduce || !io) return;
    img.classList.add('dev');
    if (delay) img.style.setProperty('--d', delay + 'ms');
    var seen = false, loaded = img.complete && img.naturalWidth > 0, fired = false;
    function fire() { if (seen && loaded && !fired) { fired = true; img.classList.add('in'); } }
    img.addEventListener('load', function () { loaded = true; fire(); });
    img.addEventListener('error', function () { loaded = true; fire(); });
    img._go = function () { seen = true; fire(); setTimeout(function () { loaded = true; fire(); }, 2500); };
    io.observe(img);
  };
})();
