/* GEOS3141 explainers: shared behaviour for every lecture page.
   Each page loads this file, then calls GEO.start({...}) with its own data,
   runs its own widgets, and finishes with GEO.finish(resizeFn). */

/* ---------- helpers (global, used by page widgets) ---------- */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var NS = 'http://www.w3.org/2000/svg';
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function hex(c) { c = (c || '#888888').replace('#', ''); if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join(''); return [0, 2, 4].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); }
function mix(a, b, t) { var A = hex(a), B = hex(b); t = Math.max(0, Math.min(1, t)); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')'; }
function rgba(c, a) { var A = hex(c); return 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + a + ')'; }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function txt(parent, x, y, s, attrs) { var a = { x: x, y: y, fill: 'var(--ink)', 'font-size': 12 }; for (var k in attrs) a[k] = attrs[k]; var t = el('text', a, parent); t.textContent = s; return t; }
function cl(v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.max(a, Math.min(b, v)); }
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function fmt(n, d) { return n.toLocaleString('en-AU', { maximumFractionDigits: d === undefined ? 1 : d, minimumFractionDigits: 0 }); }
function money(n) { if (Math.abs(n) >= 1e9) return 'US$' + fmt(n / 1e9) + 'b'; if (Math.abs(n) >= 1e6) return 'US$' + fmt(n / 1e6) + 'm'; return 'US$' + fmt(n, 0); }
var themeHooks = [];
function onTheme(f) { themeHooks.push(f); }
function fireTheme() { themeHooks.forEach(function (f) { f(); }); }
try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fireTheme); } catch (e) {}
function sizeCanvas(c, w, h) { var dpr = Math.min(2, window.devicePixelRatio || 1); c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.height = h + 'px'; return dpr; }
function fitCanvas(c, ctx, VW, VH) { var w = c.clientWidth || VW, h = Math.round(w * VH / VW); var dpr = sizeCanvas(c, w, h); ctx.setTransform(dpr * w / VW, 0, 0, dpr * w / VW, 0, 0); return VW / w; }
function fontPx(k) { return Math.round(12 * Math.max(1, k * .75)) + 'px system-ui,sans-serif'; }
function onVisible(elm, fn) { if (!('IntersectionObserver' in window)) { fn(true); return; } new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting); }); }, { threshold: .05 }).observe(elm); }

/* saved theme goes on before the page paints (app.js loads in <head>) */
try { var th0 = localStorage.getItem('geos3141-theme'); if (th0) document.documentElement.setAttribute('data-theme', th0); } catch (e) {}

/* ---------- progress state (global) ---------- */
var S = { xp: 0, done: {}, cards: {} };
var PAGE = {};

function save() { try { localStorage.setItem(PAGE.key, JSON.stringify(S)); } catch (e) {} }
function rankOf(x) { var r = PAGE.ranks[0]; PAGE.ranks.forEach(function (k) { if (x >= k[0]) r = k; }); return r; }
var toastT;
function toast(h) { var t = $('#toast'); if (!t) return; t.innerHTML = h; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2600); }
function award(id, pts, why) {
  if (S.done[id]) return false;
  var before = rankOf(S.xp)[1]; S.done[id] = 1; S.xp += pts; save(); renderXP();
  var after = rankOf(S.xp)[1];
  toast('<b>+' + pts + ' oz</b> &nbsp;' + why + (after !== before ? ' · promoted to <b>' + after + '</b>' : ''));
  return true;
}
function renderXP() {
  var r = rankOf(S.xp);
  $('#barXp').textContent = S.xp + ' oz Au'; $('#barRank').textContent = r[1]; $('#eohOz').textContent = S.xp + ' oz';
  var nx = PAGE.ranks.filter(function (k) { return k[0] > S.xp; })[0];
  $('#eohRank').textContent = r[1] + '. ' + r[2] + (nx ? ' ' + (nx[0] - S.xp) + ' oz to ' + nx[1] + '.' : ' Top rank reached.');
  var L = $('#ladder'); L.innerHTML = '';
  PAGE.ranks.forEach(function (k) { var li = document.createElement('li'); if (S.xp >= k[0]) li.className = 'got'; li.innerHTML = '<span>' + k[1] + '</span><span>' + k[0] + ' oz</span>'; L.appendChild(li); });
  var g = PAGE.goals || {}; for (var id in g) { var e = $('#' + id); if (e) e.classList.toggle('ok', !!S.done[g[id]]); }
  if (PAGE.onXP) PAGE.onXP();
}

/* ---------- multiple-choice cards ---------- */
function mcCards(box, items, prefix, pts, onScore) {
  box.innerHTML = ''; var right = 0;
  items.forEach(function (it, i) {
    var c = document.createElement('div'); c.className = 'qc'; var tries = 0;
    var src = it.img ? ((PAGE.img && PAGE.img[it.img]) || it.img) : null;
    var pic = src ? (PAGE.micCards ? '<div class="mic"><img src="' + src + '" alt="' + (it.alt || '') + '"></div>' : '<img src="' + src + '" alt="' + (it.alt || '') + '">') : '';
    c.innerHTML = pic + (it.lbl ? '<div class="lbl">' + it.lbl + '</div>' : '') + (it.q ? '<div>' + it.q + '</div>' : '') + '<div class="opts"></div><div class="why"></div>';
    var o = $('.opts', c);
    it.o.forEach(function (op, j) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = op;
      b.addEventListener('click', function () {
        if (c.dataset.done) return; tries++;
        if (j === it.a) { b.classList.add('right'); c.dataset.done = 1; $('.why', c).innerHTML = it.e; right++; if (tries === 1) award(prefix + i, pts, it.win || 'Correct'); if (onScore) onScore(right, items.length); }
        else { b.classList.add('wrong'); $('.why', c).innerHTML = it.hint || 'Not that one. Look again.'; }
      });
      o.appendChild(b);
    });
    box.appendChild(c);
  });
}

/* ---------- checkpoints, self-test, flashcards ---------- */
function buildCheckpoints() {
  var CP = PAGE.checkpoints || {};
  $$('.cp').forEach(function (box) {
    var id = box.getAttribute('data-cp'), c = CP[id]; if (!c) return; var tries = 0; delete box.dataset.done;
    box.innerHTML = '<span class="tag">' + (PAGE.cpTag || 'Checkpoint · core sample') + '</span><p class="q">' + c.q + '</p><div class="opts"></div><p class="fb"></p>';
    var o = $('.opts', box);
    c.o.forEach(function (t, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.addEventListener('click', function () {
        if (box.dataset.done) return; tries++;
        if (i === c.a) { b.classList.add('right'); box.dataset.done = 1; $('.fb', box).textContent = c.e; award(id, tries === 1 ? 6 : 3, tries === 1 ? 'Checkpoint, first try' : 'Checkpoint cleared'); }
        else { b.classList.add('wrong'); $('.fb', box).textContent = 'Not that one. Have another go.'; }
      });
      o.appendChild(b);
    });
    if (S.done[id]) { box.dataset.done = 1; $$('button', o)[c.a].classList.add('right'); $('.fb', box).textContent = c.e; }
  });
}
function subs(s) { return s.replace(/\b(Al2O3|FeS2|SiO2|Na2O|K2O)\b/g, function (m) { return m.replace(/(\d)/g, '<sub>$1</sub>'); }); }
function buildSelfTest() {
  var box = $('#selfTest'); if (!box) return; box.innerHTML = '';
  (PAGE.selftest || []).forEach(function (q, i) {
    var d = document.createElement('details'); d.className = 'q';
    d.innerHTML = '<summary>' + subs(q[0]) + '<span class="lvl">' + q[1] + '</span></summary><div class="ans"><p>' + subs(q[2]) + '</p><button type="button" class="gotit">I got this right · +4 oz</button></div>';
    var b = $('.gotit', d); if (S.done['st' + i]) { b.disabled = true; b.textContent = 'Claimed'; }
    b.addEventListener('click', function () { if (award('st' + i, 4, 'Self-test answer')) { b.disabled = true; b.textContent = 'Claimed'; } });
    box.appendChild(d);
  });
}
var deck = [], gkeys = [];
function showCard() {
  var card = $('#card'); if (!card) return;
  var was = card.classList.contains('flip'); card.classList.remove('flip');
  $('#flashCount').textContent = (gkeys.length - deck.length) + ' / ' + gkeys.length + ' learned';
  if (!deck.length) { $('#cardFront').textContent = 'Deck cleared'; $('#cardBack').textContent = 'Every term learned. Reset the deck to go again.'; $('#cardGot').disabled = true; $('#cardAgain').disabled = true; return; }
  $('#cardGot').disabled = false; $('#cardAgain').disabled = false; var k = deck[0];
  var paint = function () { $('#cardFront').textContent = k; $('#cardBack').textContent = PAGE.glossary[k]; };
  if (was && !reduce) setTimeout(paint, 250); else paint();
}
function deckBuild() {
  deck = gkeys.filter(function (k) { return !S.cards[k]; });
  for (var i = deck.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
  showCard();
}

/* ---------- page lifecycle ---------- */
var GEO = {
  themeButton: function () {
    var root = document.documentElement, tb = $('#themeBtn');
    if (tb) tb.addEventListener('click', function () {
      var cur = root.getAttribute('data-theme');
      var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = dark ? 'light' : 'dark'; root.setAttribute('data-theme', next);
      try { localStorage.setItem('geos3141-theme', next); } catch (e) {}
      fireTheme();
    });
  },
  start: function (P) {
    PAGE = P;
    /* images */
    if (P.img) $$('img[data-img]').forEach(function (i) { if (P.img[i.dataset.img]) i.src = P.img[i.dataset.img]; });
    GEO.themeButton();
    /* saved progress */
    try { var sv = JSON.parse(localStorage.getItem(P.key) || 'null'); if (sv && typeof sv.xp === 'number') { S = sv; S.done = S.done || {}; S.cards = S.cards || {}; } } catch (e) {}
    var armed = false, ra = $('#resetAll');
    if (ra) ra.addEventListener('click', function () {
      if (!armed) { armed = true; $('#resetMsg').textContent = 'Click again to wipe your ounces and progress.'; setTimeout(function () { armed = false; $('#resetMsg').textContent = ''; }, 4000); return; }
      S = { xp: 0, done: {}, cards: {} }; save(); renderXP(); buildCheckpoints(); buildSelfTest(); deckBuild(); $('#resetMsg').textContent = 'Progress cleared.'; armed = false;
    });
    /* depth bar and drill log */
    var secs = $$('main section[data-log]'), hole = $('#railHole');
    secs.forEach(function (s) { var a = document.createElement('a'); a.href = '#' + s.id; a.textContent = s.getAttribute('data-log'); hole.appendChild(a); });
    var railLinks = $$('#railHole a'), MAXD = P.maxDepth || 150;
    GEO.onScroll = function () {
      var h = document.documentElement.scrollHeight - innerHeight; var p = h > 0 ? cl(scrollY / h) : 0; var d = Math.round(p * MAXD);
      $('#barFill').style.width = (p * 100) + '%'; $('#barDepth').textContent = d + ' m'; $('#railDepth').textContent = d + ' m downhole';
      var cur = 0; secs.forEach(function (s, i) { if (s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
      railLinks.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
      var bit = $('#railBit'); if (bit && railLinks[cur]) bit.style.top = (railLinks[cur].offsetTop + 7) + 'px';
      if (p > .97) award('bottom', 10, 'Reached end of hole');
    };
    window.addEventListener('scroll', GEO.onScroll, { passive: true });
    /* observation reveals */
    $$('.obs details[data-obs]').forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) award('obs-' + d.dataset.obs, 3, 'Field observation logged'); }); });
    /* glossary list and pop-ups */
    var G = P.glossary || {};
    gkeys = Object.keys(G).sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    var dl = $('#glossList');
    if (dl) gkeys.forEach(function (k) { var dt = document.createElement('dt'); dt.textContent = k.charAt(0).toUpperCase() + k.slice(1); var dd = document.createElement('dd'); dd.textContent = G[k]; dl.appendChild(dt); dl.appendChild(dd); });
    var pop = $('#pop'), openEl = null;
    function show(e) {
      var k = e.getAttribute('data-t'); if (!G[k]) return;
      pop.innerHTML = ''; var b = document.createElement('b'); b.textContent = k; pop.appendChild(b); pop.appendChild(document.createTextNode(G[k]));
      var r = e.getBoundingClientRect(); pop.classList.add('on'); var w = pop.offsetWidth;
      var x = Math.min(Math.max(8, r.left + scrollX), scrollX + document.documentElement.clientWidth - w - 8);
      pop.style.left = x + 'px'; pop.style.top = (r.bottom + scrollY + 8) + 'px'; openEl = e;
    }
    function hide() { pop.classList.remove('on'); openEl = null; }
    $$('.term').forEach(function (e) {
      e.setAttribute('type', 'button');
      e.addEventListener('click', function (ev) { ev.stopPropagation(); openEl === e ? hide() : show(e); });
      e.addEventListener('mouseenter', function () { show(e); }); e.addEventListener('mouseleave', hide);
      e.addEventListener('focus', function () { show(e); }); e.addEventListener('blur', hide);
    });
    document.addEventListener('click', hide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  },
  finish: function (resizeAll) {
    buildCheckpoints(); buildSelfTest();
    var card = $('#card');
    if (card) {
      card.addEventListener('click', function () { card.classList.toggle('flip'); });
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('flip'); } });
      $('#cardAgain').addEventListener('click', function () { if (!deck.length) return; deck.push(deck.shift()); showCard(); });
      $('#cardGot').addEventListener('click', function () {
        if (!deck.length) return; S.cards[deck.shift()] = 1; save(); var n = gkeys.length - deck.length;
        if (n >= 10) award('cards10', 10, 'Ten terms in the bag'); if (!deck.length) award('cardsAll', 15, 'Whole glossary learned'); showCard();
      });
      $('#cardReset').addEventListener('click', function () { S.cards = {}; save(); deckBuild(); });
      deckBuild();
    }
    if (resizeAll) { window.addEventListener('resize', resizeAll); resizeAll(); }
    renderXP(); GEO.onScroll();
  },

  /* ---------- landing page: progress per lecture, plus a backup code ---------- */
  index: function (lectures) {
    GEO.themeButton();
    function load(n) { try { return JSON.parse(localStorage.getItem('geos3141-L' + n + '-progress') || 'null'); } catch (e) { return null; } }
    var total = 0;
    lectures.forEach(function (L) {
      var card = $('#lec' + L.n); if (!card || !L.top) return;
      var sv = load(L.n), xp = sv && typeof sv.xp === 'number' ? sv.xp : 0; total += xp;
      $('.oz', card).textContent = xp ? xp + ' oz' : 'not started';
      $('.fill', card).style.width = Math.min(100, xp / L.top * 100) + '%';
    });
    $('#totalOz').textContent = total + ' oz';
    var box = $('#backupText'), msg = $('#backupMsg');
    $('#backupMake').addEventListener('click', function () {
      var data = {};
      try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('geos3141-') === 0) data[k] = localStorage.getItem(k); } } catch (e) {}
      box.value = 'GEOS3141:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      box.select();
      var done = function () { msg.textContent = 'Backup code copied. Paste it into this box on your other device.'; };
      try { navigator.clipboard.writeText(box.value).then(done, function () { msg.textContent = 'Code is selected. Copy it yourself.'; }); } catch (e) { msg.textContent = 'Code is selected. Copy it yourself.'; }
    });
    $('#backupLoad').addEventListener('click', function () {
      var v = box.value.trim();
      try {
        if (v.indexOf('GEOS3141:') !== 0) throw 0;
        var data = JSON.parse(decodeURIComponent(escape(atob(v.slice(9)))));
        Object.keys(data).forEach(function (k) { if (k.indexOf('geos3141-') === 0) localStorage.setItem(k, data[k]); });
        msg.textContent = 'Progress restored. Reloading.'; setTimeout(function () { location.reload(); }, 700);
      } catch (e) { msg.textContent = 'That doesn\'t look like a GEOS3141 backup code.'; }
    });
  }
};
