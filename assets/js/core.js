/* NCDPC core: shared helpers, theme, menu, copy button and the list of events.
   PHOTOS: each folder in assets/photos is one event. On GitHub Pages the site reads the folder list
   from your repository, so dragging a new folder into assets/photos is enough. Anywhere else
   (including a local preview) it uses the list in assets/js/events.js.
   Name a folder "2026-02-21 Mother language day" to give the event a date. */
(function () {
  var BASE = 'assets/photos/', IMG = /\.(jpe?g|png|webp|gif|avif)$/i, root = document.documentElement;
  var N = window.NCD = {
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
    $: function (s, r) { return (r || document).querySelector(s); },
    $$: function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); },
    el: function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; },
    plural: function (n, one, many) { return n + ' ' + (n === 1 ? one : many); },
    ease: 'cubic-bezier(.16,1,.3,1)'
  };
  var natural = function (a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }); };

  /* theme (dark is the default) */
  var themeBtn = N.$('#theme');
  if (themeBtn) {
    var label = function () { themeBtn.setAttribute('aria-label', root.getAttribute('data-theme') === 'light' ? 'Switch to dark appearance' : 'Switch to light appearance'); };
    label();
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next); label();
      try { localStorage.setItem('ncd-theme', next); } catch (e) {}
    });
  }

  /* mobile menu */
  var top = N.$('.top'), menuBtn = N.$('#menuBtn'), nav = N.$('#nav');
  if (menuBtn && nav) menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    top.classList.toggle('menu-open', open);
  });

  /* copy button */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var src = N.$(b.dataset.copy), note = N.$('.said', b.parentNode); if (!src || !note) return;
    var done = function (m) { note.textContent = m; setTimeout(function () { note.textContent = ''; }, 2600); };
    try { navigator.clipboard.writeText(src.textContent).then(function () { done('Copied'); }, function () { done('Select the address and copy it'); }); }
    catch (err) { done('Select the address and copy it'); }
  });

  /* events */
  function parseName(dir) {
    var m = /^(\d{4}-\d{2}-\d{2})[-_ ]+(.+)$/.exec(dir), date = m ? m[1] : '', t = (m ? m[2] : dir).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    return { date: date, title: t.charAt(0).toUpperCase() + t.slice(1) };
  }
  function build(byDir) {
    return Object.keys(byDir).filter(function (d) { return byDir[d].length; }).map(function (dir) {
      var info = parseName(dir);
      var photos = byDir[dir].slice().sort(natural).map(function (f) { return BASE + encodeURIComponent(dir) + '/' + encodeURIComponent(f); });
      return { slug: dir, title: info.title, date: info.date, photos: photos };
    }).sort(function (a, b) { return a.date === b.date ? natural(b.slug, a.slug) : (a.date < b.date ? 1 : -1); });
  }
  function githubTarget() {
    var c = window.NCD_GITHUB, m = /^([a-z0-9-]+)\.github\.io$/i.exec(location.hostname);
    if (m) { var first = location.pathname.split('/')[1]; return { owner: m[1], repo: first && !/\.html?$/i.test(first) ? first : m[1] + '.github.io' }; }
    // custom domain: set NCD_GITHUB in assets/js/events.js
    return c && c.owner && c.repo && !/^(localhost|127\.|\[::1\])/.test(location.hostname) && location.protocol !== 'file:' ? c : null;
  }
  function fromGithub(g) {
    var key = 'ncd-tree-' + g.owner + '/' + g.repo, cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key)); } catch (e) {}
    var paths = cached && Date.now() - cached.t < 120000 ? Promise.resolve(cached.p)
      : fetch('https://api.github.com/repos/' + g.owner + '/' + g.repo + '/git/trees/HEAD?recursive=1')
        .then(function (r) { if (!r.ok) throw new Error('github ' + r.status); return r.json(); })
        .then(function (j) {
          var p = (j.tree || []).filter(function (x) { return x.type === 'blob'; }).map(function (x) { return x.path; });
          try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), p: p })); } catch (e) {}
          return p;
        });
    return paths.then(function (all) {
      var byDir = {};
      all.forEach(function (p) {
        if (p.indexOf(BASE) !== 0) return;
        var parts = p.slice(BASE.length).split('/');
        if (parts.length === 2 && IMG.test(parts[1]) && parts[1].charAt(0) !== '.') (byDir[parts[0]] = byDir[parts[0]] || []).push(parts[1]);
      });
      var list = build(byDir);
      if (!list.length) throw new Error('no photos');
      return list;
    });
  }
  var events = null;
  N.getEvents = function () {
    if (!events) {
      var g = githubTarget();
      events = (g ? fromGithub(g) : Promise.reject()).catch(function () { return build(window.NCD_MANIFEST || {}); });
    }
    return events;
  };
})();
