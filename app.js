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
  FX.float('+' + pts + ' oz');
  if (after !== before) { SND.play('rank'); FX.rain(90); } else SND.play('coin');
  GEO.dayMark();
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
  if (GEO.bankList.length) GEO.bankPaint();
}

/* ---------- sound: synthesised with Web Audio, so there are no files to load ----------
   Effects are on by default, music is off until you switch it on. Browsers only
   allow sound after a tap or key press, so the audio context starts on the first one. */
var SND = {
  ctx: null, out: null, prefs: { sfx: 1, music: 0, vol: .7 },
  load: function () { try { var p = JSON.parse(localStorage.getItem('geos3141-sound') || 'null'); if (p) SND.prefs = p; } catch (e) {} },
  store: function () { try { localStorage.setItem('geos3141-sound', JSON.stringify(SND.prefs)); } catch (e) {} },
  wake: function () {
    if (!SND.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      SND.ctx = new AC(); SND.out = SND.ctx.createGain(); SND.out.gain.value = SND.prefs.vol; SND.out.connect(SND.ctx.destination);
    }
    if (SND.ctx.state === 'suspended') SND.ctx.resume();
    return SND.ctx;
  },
  /* one enveloped note */
  note: function (f, t, dur, type, g, dest) {
    var c = SND.ctx, o = c.createOscillator(), a = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g || .2, t + .008); a.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(a); a.connect(dest || SND.out); o.start(t); o.stop(t + dur + .05); return o;
  },
  play: function (kind, lvl) {
    if (!SND.prefs.sfx || !SND.wake()) return;
    var c = SND.ctx, t = c.currentTime + .01, n = SND.note;
    var up = Math.pow(2, Math.min(12, (lvl === undefined ? COMBO.n : lvl) * 2) / 12);
    if (kind === 'ok') { n(660 * up, t, .25, 'triangle', .18); n(990 * up, t + .07, .35, 'triangle', .14); }
    else if (kind === 'coin') { n(1568, t, .09, 'square', .05); n(2093, t + .06, .28, 'square', .05); }
    else if (kind === 'bad') { var o = n(150, t, .28, 'sine', .3); o.frequency.exponentialRampToValueAtTime(70, t + .25); }
    else if (kind === 'combo') { [0, 4, 7, 12].forEach(function (s, i) { n(523 * up * Math.pow(2, s / 12), t + i * .05, .3, 'triangle', .12); }); }
    else if (kind === 'rank') { [0, 4, 7, 12, 16, 19, 24].forEach(function (s, i) { n(392 * Math.pow(2, s / 12), t + i * .075, .6, 'triangle', .14); }); n(98, t, 1.2, 'sine', .25); }
    else if (kind === 'clear') { [0, 7, 12, 16].forEach(function (s) { n(330 * Math.pow(2, s / 12), t, 1.1, 'triangle', .09); }); [24, 28, 31].forEach(function (s, i) { n(330 * Math.pow(2, s / 12), t + .12 + i * .06, .5, 'sine', .06); }); }
    else if (kind === 'tick') n(1200, t, .04, 'square', .04);
    else if (kind === 'alarm') { n(880, t, .15, 'square', .07); n(660, t + .17, .25, 'square', .07); }
    else if (kind === 'flip') { var o2 = n(300, t, .12, 'sine', .07); o2.frequency.exponentialRampToValueAtTime(900, t + .1); }
  },
  /* a slow generative soundtrack: a soft drone plus pentatonic plucks through an echo.
     Each lecture gets its own key, so the pages sound different from each other. */
  mus: null,
  musicOn: function () {
    if (SND.mus || !SND.wake()) return;
    var c = SND.ctx, m = { bus: c.createGain(), nodes: [] };
    var n = (String(PAGE.key || '').match(/L(\d+)/) || [0, 0])[1] | 0;
    var root = 110 * Math.pow(2, [0, 0, 2, 3, 5, 7, -2, -4, 10, 9, 5, 2, 7, 4, 0, 3, 8][n % 17] / 12);
    m.bus.gain.setValueAtTime(0, c.currentTime); m.bus.gain.linearRampToValueAtTime(.55, c.currentTime + 3); m.bus.connect(SND.out);
    var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(m.bus);
    [[root, .05], [root * 1.5, .03], [root * 2.003, .02]].forEach(function (v) {
      var o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = v[0]; g.gain.value = v[1];
      var lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .05 + Math.random() * .08; lg.gain.value = v[1] * .6;
      lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(lp); o.start(); lfo.start(); m.nodes.push(o, lfo);
    });
    var dl = c.createDelay(1.5), fb = c.createGain(), wet = c.createGain(); dl.delayTime.value = .48; fb.gain.value = .38; wet.gain.value = .5;
    dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(m.bus);
    var scale = [0, 2, 4, 7, 9, 12, 14, 16, 19];
    function pluck() {
      if (!SND.mus || document.hidden) return;
      var t = c.currentTime + .02, f = root * 4 * Math.pow(2, scale[Math.floor(Math.random() * scale.length)] / 12);
      var g = c.createGain(); g.connect(m.bus); g.connect(dl);
      SND.note(f, t, 2.2, 'triangle', .035, g);
      if (Math.random() < .3) SND.note(f * 1.5, t + .24, 1.6, 'sine', .02, g);
    }
    m.timer = setInterval(function () { if (Math.random() < .7) pluck(); }, 1400);
    SND.mus = m;
  },
  musicOff: function () {
    var m = SND.mus; if (!m) return; SND.mus = null; clearInterval(m.timer);
    var c = SND.ctx, t = c.currentTime; m.bus.gain.cancelScheduledValues(t); m.bus.gain.setValueAtTime(m.bus.gain.value, t); m.bus.gain.linearRampToValueAtTime(0, t + 1.2);
    setTimeout(function () { m.nodes.forEach(function (o) { try { o.stop(); } catch (e) {} }); m.bus.disconnect(); }, 1400);
  },
  /* the two little buttons next to Theme */
  buttons: function () {
    SND.load(); var tb = $('#themeBtn'); if (!tb || $('#sfxBtn')) return;
    var ICON = {
      sfx: '<path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      mus: '<path d="M9 17V5l11-2v12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="6.5" cy="17" r="2.6" fill="currentColor"/><circle cx="17.5" cy="15" r="2.6" fill="currentColor"/>'
    };
    function mk(id, cls, label, key) {
      var b = document.createElement('button'); b.type = 'button'; b.id = id; b.className = 'themebtn ico ' + cls;
      b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' + ICON[cls] + '<path class="x" d="M4 20L20 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      var paint = function () { var on = !!SND.prefs[key]; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', label + (on ? ' on' : ' off')); b.title = label + (on ? ' on' : ' off'); };
      paint();
      b.addEventListener('click', function () {
        SND.prefs[key] = SND.prefs[key] ? 0 : 1; SND.store(); paint();
        if (key === 'music') { if (SND.prefs.music) SND.musicOn(); else SND.musicOff(); }
        else SND.play('ok', 0);
      });
      tb.parentNode.insertBefore(b, tb);
    }
    mk('sfxBtn', 'sfx', 'Sound', 'sfx'); mk('musBtn', 'mus', 'Music', 'music');
    var first = function () {
      SND.wake(); if (SND.prefs.music) SND.musicOn();
      document.removeEventListener('pointerdown', first, true); document.removeEventListener('keydown', first, true);
    };
    document.addEventListener('pointerdown', first, true); document.addEventListener('keydown', first, true);
  }
};

/* ---------- visual rewards: gold bursts, floating ounces, shakes ---------- */
var FX = {
  cv: null, cx: null, parts: [], run: false, pt: null,
  layer: function () {
    if (FX.cv) return true; if (!document.body) return false;
    FX.cv = document.createElement('canvas'); FX.cv.className = 'fxlayer'; FX.cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(FX.cv); FX.cx = FX.cv.getContext('2d'); FX.size(); window.addEventListener('resize', FX.size);
    return true;
  },
  size: function () { var d = Math.min(2, window.devicePixelRatio || 1); FX.cv.width = innerWidth * d; FX.cv.height = innerHeight * d; FX.cx.setTransform(d, 0, 0, d, 0, 0); },
  spawn: function (x, y, n, spread, up) {
    if (reduce || !FX.layer()) return;
    var cols = [css('--gold-hi') || '#E2B341', css('--gold') || '#9A650C', '#FFF3C4'];
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = (.4 + Math.random()) * spread;
      FX.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, r: 2 + Math.random() * 3.5, c: cols[i % 3], life: 1, rot: Math.random() * 6, k: Math.random() < .5 });
    }
    if (!FX.run) { FX.run = true; requestAnimationFrame(FX.tick); }
  },
  tick: function () {
    var c = FX.cx; c.clearRect(0, 0, innerWidth, innerHeight);
    FX.parts = FX.parts.filter(function (p) { return p.life > 0 && p.y < innerHeight + 20; });
    FX.parts.forEach(function (p) {
      p.vy += .22; p.x += p.vx; p.y += p.vy; p.vx *= .985; p.life -= .012; p.rot += .15;
      c.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); c.fillStyle = p.c;
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.beginPath();
      if (p.k) { c.moveTo(-p.r, 0); c.lineTo(0, -p.r * .8); c.lineTo(p.r, -p.r * .2); c.lineTo(p.r * .5, p.r * .7); c.lineTo(-p.r * .6, p.r * .6); }
      else c.arc(0, 0, p.r * .8, 0, 6.3);
      c.fill(); c.restore();
    });
    c.globalAlpha = 1;
    if (FX.parts.length) requestAnimationFrame(FX.tick); else { FX.run = false; c.clearRect(0, 0, innerWidth, innerHeight); }
  },
  at: function (elm) { var r = elm.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; },
  burst: function (elm) { var p = elm ? FX.at(elm) : FX.pt || [innerWidth / 2, innerHeight / 2]; FX.spawn(p[0], p[1], 18 + COMBO.n * 4, 3 + COMBO.n * .4, 2.5); },
  rain: function (n) { for (var i = 0; i < 6; i++) FX.spawn(innerWidth * (i + .5) / 6, -10, Math.round(n / 6), 2.5, -1); },
  float: function (text) {
    if (!document.body) return; var p = FX.pt || [innerWidth / 2, innerHeight * .6];
    var d = document.createElement('div'); d.className = 'fxfloat'; d.textContent = text;
    d.style.left = Math.max(40, Math.min(innerWidth - 40, p[0])) + 'px'; d.style.top = p[1] + 'px';
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1100);
  },
  shake: function (elm) { SND.play('bad'); if (reduce) return; elm.classList.remove('shake'); void elm.offsetWidth; elm.classList.add('shake'); }
};
document.addEventListener('pointerdown', function (e) { FX.pt = [e.clientX, e.clientY]; }, true);

/* ---------- combo: first-try answers in a row multiply the gold ---------- */
var COMBO = {
  n: 0, best: 0,
  mult: function () { return COMBO.n >= 8 ? 3 : COMBO.n >= 5 ? 2 : COMBO.n >= 3 ? 1.5 : 1; },
  pts: function (p) { return Math.round(p * COMBO.mult()); },
  tag: function () { return COMBO.mult() > 1 ? ' · combo ×' + COMBO.mult() : ''; },
  hit: function () {
    var m0 = COMBO.mult(); COMBO.n++; COMBO.best = Math.max(COMBO.best, COMBO.n);
    if (COMBO.mult() > m0) { SND.play('combo'); var b = $('#barCombo'); if (b && !reduce) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } }
    COMBO.paint();
  },
  miss: function () { if (COMBO.n >= 3) toast('Combo broken at ' + COMBO.n + '. Build it back up.'); COMBO.n = 0; COMBO.paint(); },
  paint: function () {
    var b = $('#barCombo'); if (!b) return;
    b.hidden = COMBO.n < 2; b.textContent = COMBO.n + ' in a row' + (COMBO.mult() > 1 ? ' ×' + COMBO.mult() : '');
    b.classList.toggle('hot', COMBO.mult() >= 2);
  }
};

/* ---------- multiple-choice cards ---------- */
function mcCards(box, items, prefix, pts, onScore) {
  box.innerHTML = ''; var right = 0;
  (window.MC_LOG = window.MC_LOG || []).push({ box: box, items: items, prefix: prefix });
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
        if (j === it.a) {
          b.classList.add('right'); c.dataset.done = 1; $('.why', c).innerHTML = it.e; right++;
          if (tries === 1 && !S.done[prefix + i]) { COMBO.hit(); award(prefix + i, COMBO.pts(pts), (it.win || 'Correct') + COMBO.tag()); FX.burst(b); } else SND.play('ok');
          if (onScore) onScore(right, items.length);
        }
        else { b.classList.add('wrong'); FX.shake(b); COMBO.miss(); $('.why', c).innerHTML = it.hint || 'Not that one. Look again.'; }
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
        if (i === c.a) {
          b.classList.add('right'); box.dataset.done = 1; $('.fb', box).textContent = c.e;
          if (tries === 1) { COMBO.hit(); award(id, COMBO.pts(6), 'Checkpoint, first try' + COMBO.tag()); } else award(id, 3, 'Checkpoint cleared');
          FX.burst(b);
        }
        else { b.classList.add('wrong'); FX.shake(b); COMBO.miss(); $('.fb', box).textContent = 'Not that one. Have another go.'; }
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

/* ---------- spaced repetition (review.html, plus the due count on index.html) ----------
   A small SM-2 style scheduler. Every card you've graded gets a state:
   n (good answers in a row), i (interval in days), e (ease), due (day number),
   lapses, paid (last day it paid an ounce) and m (set once it first reaches a
   three-week interval). Day numbers are local calendar days, so a card due
   tomorrow turns up after midnight, not 24 hours later. Everything sits under
   one key, geos3141-srs, so the index backup code carries it between devices.
   Review ounces live in that key too, separate from each lecture's score. */
var SRS = {
  KEY: 'geos3141-srs',
  MATURE: 21,
  today: function () { var d = new Date(); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); },
  load: function () {
    var s = null; try { s = JSON.parse(localStorage.getItem(SRS.KEY) || 'null'); } catch (e) {}
    if (!s || typeof s !== 'object') s = {};
    s.c = s.c || {}; s.xp = s.xp || 0; s.newMax = s.newMax || 20;
    if (!s.newDay || s.newDay.d !== SRS.today()) s.newDay = { d: SRS.today(), n: 0, extra: 0 };
    return s;
  },
  save: function (s) { try { localStorage.setItem(SRS.KEY, JSON.stringify(s)); } catch (e) {} },
  /* g: 0 again, 1 hard, 2 good, 3 easy. Returns a fresh state and leaves st alone. */
  grade: function (st, g, day) {
    st = st || { n: 0, i: 0, e: 2.5, lapses: 0 };
    var n = st.n, i = st.i, e = st.e;
    if (g === 0) { n = 0; i = 0; e = Math.max(1.3, e - .2); }
    else {
      var good = n === 0 ? 1 : n === 1 ? 3 : Math.max(i + 1, Math.round(i * e));
      if (g === 1) { i = n ? Math.min(good - 1, Math.max(i + 1, Math.round(i * 1.2))) : 1; e = Math.max(1.3, e - .15); }
      if (g === 2) i = good;
      if (g === 3) { i = n === 0 ? 4 : Math.max(good + 1, Math.round(i * e * 1.3)); e += .15; }
      n++;
    }
    i = Math.min(i, 365);
    return { n: n, i: i, e: Math.round(e * 100) / 100, due: day + i, lapses: (st.lapses || 0) + (g === 0 && st.n ? 1 : 0), paid: st.paid || 0, m: st.m || 0 };
  },
  newLeft: function (s) { return Math.max(0, s.newMax + s.newDay.extra - s.newDay.n); },
  /* due: graded cards due today or earlier; unseen: never graded; fresh: unseen you can still start today */
  counts: function (s, cards, day) {
    var due = 0, unseen = 0;
    cards.forEach(function (c) { var st = s.c[c.id]; if (!st) unseen++; else if (st.due <= day) due++; });
    return { due: due, unseen: unseen, fresh: Math.min(unseen, SRS.newLeft(s)) };
  },
  span: function (d) { return d < 1 ? 'today' : d === 1 ? '1 day' : d < 30 ? d + ' days' : d < 365 ? Math.round(d / 30) + ' mo' : '1 yr'; }
};

/* ---------- page lifecycle ---------- */
var GEO = {
  /* a daily streak shared by every page: any gold earned today counts as a study day */
  streak: function () { try { return JSON.parse(localStorage.getItem('geos3141-streak') || 'null') || { last: 0, n: 0, best: 0 }; } catch (e) { return { last: 0, n: 0, best: 0 }; } },
  dayMark: function () {
    var st = GEO.streak(), d = SRS.today(); if (st.last === d) return;
    st.n = st.last === d - 1 ? st.n + 1 : 1; st.best = Math.max(st.best || 0, st.n); st.last = d;
    try { localStorage.setItem('geos3141-streak', JSON.stringify(st)); } catch (e) {}
    if (st.n > 1) setTimeout(function () { toast('<b>Day ' + st.n + '</b> &nbsp;study streak. Keep it going tomorrow.'); SND.play('combo', 6); FX.rain(40); }, 2700);
  },
  /* gated "bank this section" buttons: they unlock once every checkpoint in the section is answered */
  banks: function () {
    $$('main section[data-log]').forEach(function (sec) {
      var cps = $$('.cp', sec).map(function (b) { return b.getAttribute('data-cp'); }).filter(function (id) { return PAGE.checkpoints && PAGE.checkpoints[id]; });
      if (!cps.length || $('.bank', sec)) return;
      var w = $('.wrap', sec) || sec, d = document.createElement('div'); d.className = 'bank';
      d.innerHTML = '<button type="button" class="btn"></button><span class="why"></span>'; w.appendChild(d);
      var b = $('button', d), id = 'bank-' + sec.id;
      b.addEventListener('click', function () {
        if (!cps.every(function (k) { return S.done[k]; })) return;
        if (award(id, 5, 'Section banked: ' + sec.getAttribute('data-log'))) { SND.play('clear'); FX.burst(b); FX.rain(50); }
      });
      GEO.bankList.push({ sec: sec, d: d, b: b, cps: cps, id: id });
    });
    GEO.bankPaint();
  },
  bankList: [],
  bankPaint: function () {
    GEO.bankList.forEach(function (k) {
      var left = k.cps.filter(function (c) { return !S.done[c]; }).length, done = !!S.done[k.id];
      k.b.disabled = !!left || done; k.d.classList.toggle('open', !left && !done); k.d.classList.toggle('done', done);
      k.b.textContent = done ? 'Section banked' : 'Bank this section · +5 oz';
      $('.why', k.d).textContent = done ? 'Logged in the drill log.' : left ? 'Answer the checkpoint' + (left > 1 ? 's' : '') + ' in this section to unlock.' : 'Unlocked. Bank it.';
      var a = $('#railHole a[href="#' + k.sec.id + '"]'); if (a) a.classList.toggle('banked', done);
    });
  },
  themeButton: function () {
    SND.buttons();
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
    buildCheckpoints(); buildSelfTest(); GEO.banks();
    var xpEl = $('#barXp');
    if (xpEl && !$('#barCombo')) { var cb = document.createElement('span'); cb.id = 'barCombo'; cb.className = 'combo'; cb.hidden = true; xpEl.parentNode.insertBefore(cb, xpEl.nextSibling); }
    var card = $('#card');
    if (card) {
      card.addEventListener('click', function () { card.classList.toggle('flip'); SND.play('flip'); });
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
    var rv = $('#lecReview');
    if (rv && window.CARDS) {
      var s = SRS.load(), k = SRS.counts(s, CARDS, SRS.today()); total += s.xp;
      $('.oz', rv).textContent = (k.due + k.fresh) ? (k.due + k.fresh) + ' cards today' : 'all caught up';
      $('.fill', rv).style.width = Math.min(100, (CARDS.length - k.unseen) / CARDS.length * 100) + '%';
      $('.hook', rv).textContent = k.due + ' due for review and ' + k.fresh + ' new today, from ' + CARDS.length + ' cards across every finished lecture.' + (s.xp ? ' ' + s.xp + ' oz earned reviewing.' : '');
    }
    var lb = $('#lecLab');
    if (lb) { var Lr = GEO.labLoad(); total += Lr.xp; $('.oz', lb).textContent = Lr.runs ? 'best ' + Lr.best + '%' : 'not started'; $('.fill', lb).style.width = Lr.best + '%'; }
    $('#totalOz').textContent = total + ' oz';
    var st = GEO.streak(), live = st.last >= SRS.today() - 1 ? st.n : 0, dd = function (n) { return n + (n === 1 ? ' day' : ' days'); };
    if ($('#streakN')) { $('#streakN').textContent = dd(live); $('#streakBest').textContent = dd(st.best || 0); }
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
  },

  /* ---------- review page: a spaced-repetition session over CARDS ---------- */
  review: function () {
    GEO.themeButton();
    var s = SRS.load(), day = SRS.today(), queue = [], graded = 0, flipped = false, busy = false;
    var KIND = { term: 'Term', mc: 'Checkpoint', q: 'Short answer' };
    var lecs = []; CARDS.forEach(function (c) { if (lecs.indexOf(c.lecture) < 0) lecs.push(c.lecture); }); lecs.sort(function (a, b) { return a - b; });
    var sel = (s.lec || []).filter(function (n) { return lecs.indexOf(n) >= 0; }); if (!sel.length) sel = lecs.slice();
    var card = $('#rvCard'), front = $('#rvFront'), back = $('#rvBack');
    var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    var pool = function () { return CARDS.filter(function (c) { return sel.indexOf(c.lecture) >= 0; }); };
    var node = function (tag, cls, text, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    function oz(pts, why) { s.xp += pts; if (why) { toast('<b>+' + pts + ' oz</b> &nbsp;' + why); FX.float('+' + pts + ' oz'); SND.play('clear'); FX.rain(40); } GEO.dayMark(); }

    /* lecture filter chips */
    var chips = $('#rvChips');
    function chipsDraw() {
      chips.innerHTML = '';
      var all = node('button', 'chip', 'All', chips); all.type = 'button'; all.setAttribute('aria-pressed', sel.length === lecs.length);
      all.addEventListener('click', function () { sel = lecs.slice(); refilter(); });
      lecs.forEach(function (n) {
        var k = SRS.counts(s, CARDS.filter(function (c) { return c.lecture === n; }), day);
        var b = node('button', 'chip', 'L' + n, chips); b.type = 'button'; b.setAttribute('aria-pressed', sel.length < lecs.length && sel.indexOf(n) >= 0);
        if (k.due) node('span', 'rv-badge', String(k.due), b);
        b.title = 'Lecture ' + n + ': ' + k.due + ' due, ' + k.unseen + ' not seen yet';
        b.addEventListener('click', function () {
          if (sel.length === lecs.length) sel = [n];
          else if (sel.indexOf(n) >= 0) { if (sel.length > 1) sel.splice(sel.indexOf(n), 1); }
          else sel.push(n);
          refilter();
        });
      });
    }
    function refilter() { s.lec = sel.length === lecs.length ? null : sel.slice(); SRS.save(s); build(); }

    var nm = $('#rvNewMax'); nm.value = String(s.newMax);
    nm.addEventListener('change', function () { s.newMax = +nm.value; SRS.save(s); build(); });

    /* the queue: overdue reviews first, new cards mixed in (one after every two reviews) */
    function build() {
      day = SRS.today(); if (s.newDay.d !== day) s.newDay = { d: day, n: 0, extra: 0 };
      var P = pool();
      var due = shuffle(P.filter(function (c) { var st = s.c[c.id]; return st && st.due <= day; }));
      due.sort(function (a, b) { return s.c[a.id].due - s.c[b.id].due; });
      var fresh = shuffle(P.filter(function (c) { return !s.c[c.id]; })).sort(function (a, b) { return a.lecture - b.lecture; }).slice(0, SRS.newLeft(s));
      queue = [];
      while (due.length || fresh.length) { if (due.length) queue.push(due.shift()); if (due.length) queue.push(due.shift()); if (fresh.length) queue.push(fresh.shift()); }
      graded = 0; show();
    }
    function stats() {
      var k = SRS.counts(s, pool(), day);
      $('#rvDue').textContent = k.due; $('#rvNew').textContent = k.fresh; $('#rvOz').textContent = s.xp + ' oz';
      $('#rvLeft').textContent = queue.length ? queue.length + ' to go' : '';
      chipsDraw();
      return k;
    }

    function face(f, c, isBack) {
      f.innerHTML = '';
      f.classList.toggle('long', c.kind !== 'term');
      var meta = 'Lecture ' + c.lecture + ' · ' + (c.lvl ? 'Self-test · ' + c.lvl : KIND[c.kind]);
      node('div', 'rv-meta', meta, f);
      if (!isBack) {
        if (c.kind === 'term') node('b', '', c.front, f);
        else node('p', 'rv-q', c.front, f);
        if (c.opts) { var ol = node('ol', 'rv-opts', '', f); c.opts.forEach(function (o) { node('li', '', o, ol); }); }
        node('small', '', 'tap to see the answer', f);
      } else {
        node('p', 'rv-ctx', c.front, f);
        if (c.ans) node('p', 'rv-ans', c.ans, f);
        node('p', 'rv-a', c.back, f);
        node('small', '', 'how well did you know it?', f);
      }
    }
    function show() {
      var k = stats(), c = queue[0];
      $('#rvSession').hidden = !c; $('#rvDone').hidden = !!c;
      if (!c) { done(k); return; }
      var paint = function () {
        face(front, c, false); face(back, c, true);
        var st = s.c[c.id];
        $$('#rvGrades button').forEach(function (b) { var g = +b.dataset.g, t = SRS.grade(st, g, day); $('small', b).textContent = g === 0 ? 'soon' : SRS.span(t.i); });
        busy = false;
      };
      busy = true;
      if (flipped && !reduce) { setFlip(false); setTimeout(paint, 250); } else { setFlip(false); paint(); }
    }
    function setFlip(on) {
      if (on && !flipped) SND.play('flip');
      flipped = on; card.classList.toggle('flip', on);
      $('#rvShow').hidden = on; $('#rvGrades').hidden = !on;
      card.setAttribute('aria-label', on ? 'Answer side. Grade yourself with the buttons below.' : 'Question side. Press to show the answer.');
    }
    function grade(g) {
      var c = queue[0]; if (!c || !flipped || busy) return;
      var old = s.c[c.id], st = SRS.grade(old, g, day);
      if (g === 0) { COMBO.miss(); FX.shake($('#rvGrades button[data-g="0"]')); }
      else { COMBO.hit(); SND.play('ok'); if (g > 1) FX.burst($('#rvGrades button[data-g="' + g + '"]')); }
      if (!old) s.newDay.n++;
      if (g > 0 && st.paid !== day) { st.paid = day; oz(1); }
      if (st.i >= SRS.MATURE && !st.m) { st.m = 1; oz(2, 'Card locked into long-term memory'); }
      s.c[c.id] = st; queue.shift(); graded++;
      if (g === 0) queue.splice(Math.min(queue.length, 3), 0, c);
      if (!queue.length && graded >= 5 && s.bonus !== day) { s.bonus = day; oz(5, 'Review session cleared'); }
      SRS.save(s); show();
    }
    function done(k) {
      var P = pool(), soon = null, tomorrow = 0;
      P.forEach(function (c) { var st = s.c[c.id]; if (!st || st.due <= day) return; if (soon === null || st.due < soon) soon = st.due; if (st.due === day + 1) tomorrow++; });
      var msg = graded ? 'Session done: ' + graded + ' cards graded. ' : '';
      if (k.unseen && !k.fresh) msg += 'You\'ve started all the new cards your daily limit allows. ';
      else if (!k.unseen) msg += 'You\'ve seen every card in this selection. ';
      if (soon !== null) msg += tomorrow ? tomorrow + ' card' + (tomorrow > 1 ? 's come' : ' comes') + ' back tomorrow.' : 'Next review in ' + SRS.span(soon - day) + '.';
      $('#rvDoneMsg').textContent = msg;
      $('#rvMore').hidden = !k.unseen;
    }
    $('#rvMore').addEventListener('click', function () { s.newDay.extra += 10; SRS.save(s); build(); });

    card.addEventListener('click', function () { if (!flipped && queue.length) setFlip(true); });
    $('#rvShow').addEventListener('click', function () { setFlip(true); $('#rvGrades button[data-g="2"]').focus(); });
    $$('#rvGrades button').forEach(function (b) { b.addEventListener('click', function () { grade(+b.dataset.g); }); });
    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey || !queue.length) return;
      if (!flipped && (e.key === ' ' || e.key === 'Enter') && (e.target === card || e.target === document.body)) { e.preventDefault(); setFlip(true); }
      else if (flipped && '1234'.indexOf(e.key) >= 0 && e.key.length === 1) { e.preventDefault(); grade(+e.key - 1); }
    });

    var armed = false;
    $('#rvReset').addEventListener('click', function () {
      if (!armed) { armed = true; $('#rvResetMsg').textContent = 'Click again to wipe your review schedule and review ounces.'; setTimeout(function () { armed = false; $('#rvResetMsg').textContent = ''; }, 4000); return; }
      try { localStorage.removeItem(SRS.KEY); } catch (e) {}
      s = SRS.load(); sel = lecs.slice(); nm.value = String(s.newMax); armed = false; $('#rvResetMsg').textContent = 'Schedule cleared.'; build();
    });
    /* a tab left open past midnight picks up the new day's cards */
    document.addEventListener('visibilitychange', function () { if (!document.hidden && SRS.today() !== day) build(); });
    build();
  },

  /* ---------- lab test practice: timed stations over LAB (labdata.js) ---------- */
  labLoad: function () {
    var s = null; try { s = JSON.parse(localStorage.getItem('geos3141-lab') || 'null'); } catch (e) {}
    s = s && typeof s === 'object' ? s : {}; s.xp = s.xp || 0; s.runs = s.runs || 0; s.seen = s.seen || {}; s.best = s.best || 0; s.opt = s.opt || { n: 12, t: 60, k: ['suite', 'min', 'micro', 'hand', 'core'] };
    return s;
  },
  lab: function () {
    GEO.themeButton(); PAGE = { key: 'lab' };
    var L = GEO.labLoad(), run = null, clock = null;
    var keep = function () { try { localStorage.setItem('geos3141-lab', JSON.stringify(L)); } catch (e) {} };
    var node = function (tag, cls, text, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined && text !== null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    var shuffle = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    var KIND = { suite: 'Ore suite, polished block', min: 'Microscope unknown', micro: 'Microscope texture', hand: 'Hand specimen', core: 'Drill core' };
    var REF = { high: 'high', mod: 'moderate', low: 'low' }, HC = { hard: 'hard: the needle won’t scratch it', med: 'medium: scratches with some pressure', soft: 'soft: scratches easily, polish full of scratches' };
    var ANI = { iso: 'isotropic: stays dark as you rotate under crossed polars', weak: 'weakly anisotropic', strong: 'strongly anisotropic: colours change as you rotate' };

    /* every possible station, built from the data file */
    function all() {
      var out = LAB.items.map(function (it) { return { id: it.id, kind: it.kind, lec: it.lec, sec: it.sec, img: it.img, mic: !!it.mic, lbl: it.lbl, q: it.q, o: it.o, a: it.a, e: it.e }; });
      LAB.min.forEach(function (m) {
        var same = LAB.min.filter(function (x) { return x !== m && x.cg.some(function (c) { return m.cg.indexOf(c) >= 0; }); });
        var other = shuffle(LAB.min.filter(function (x) { return x !== m && same.indexOf(x) < 0; }));
        var pick = shuffle(same).slice(0, 2).concat(other).slice(0, 3);
        var opts = shuffle(pick.concat([m]));
        out.push({ id: 'min-' + m.n, kind: 'min', lec: 4, sec: 'virtual', img: m.ppl, xpl: m.xpl, mic: true, m: m, lbl: 'Unknown, plane-polarised reflected light',
          q: 'Name the mineral in the centre of the field.', o: opts.map(function (x) { return x.n; }), a: opts.indexOf(m),
          e: m.n + ' (' + m.f + '). ' + m.dist + ' Colour: ' + m.col + '; reflectance ' + REF[m.ref] + '.' });
      });
      (LAB.suites || []).forEach(function (x) {
        var type = LAB.suiteType[x.dep], others = shuffle(LAB.suiteTypes.filter(function (t) { return t !== type; })).slice(0, 3);
        var opts = shuffle(others.concat([type]));
        out.push({ id: 'suite-' + x.img, kind: 'suite', img: x.img, mic: false, lbl: 'Lab ore suite · polished block, reflected light',
          q: 'Which kind of deposit does this polished block come from?', o: opts, a: opts.indexOf(type),
          e: x.dep + ': ' + type + (type === 'Regolith' ? ' (oxide zone and gossan)' : '') + ' deposit in the lab ore suites, polished block ' + x.code + '. Look at which sulphides and oxides are there and how they sit together, then ask what kind of system makes that assemblage.',
          link: type === 'Regolith' ? 'L2.html#supergene' : null, credit: 'https://www.flickr.com/photos/188270557@N07/' + x.src + '/' });
      });
      return out;
    }
    function rate(id) { var r = L.seen[id]; return r ? r[0] / r[1] : .5; }

    /* setup chips */
    function chips(box, val, multi) {
      $$('button', box).forEach(function (b) {
        var v = b.dataset.v, on = multi ? val.indexOf(v) >= 0 : String(val) === v; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }
    function paintSetup() {
      chips($('#ltN'), L.opt.n); chips($('#ltT'), L.opt.t); chips($('#ltK'), L.opt.k, true);
      var n = all().filter(function (s) { return L.opt.k.indexOf(s.kind) >= 0; }).length;
      $('#ltPool').textContent = n + ' stations available in this mix' + (n < L.opt.n ? ', so this run will use all of them.' : '.');
      $('#ltStart').disabled = !n;
      $('#ltBest').textContent = L.runs ? 'Best ' + L.best + '% · ' + L.xp + ' oz' : '';
    }
    $('#ltN').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; L.opt.n = +b.dataset.v; keep(); paintSetup(); });
    $('#ltT').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; L.opt.t = +b.dataset.v; keep(); paintSetup(); });
    $('#ltK').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var v = b.dataset.v, i = L.opt.k.indexOf(v);
      if (i >= 0) { if (L.opt.k.length > 1) L.opt.k.splice(i, 1); } else L.opt.k.push(v); keep(); paintSetup();
    });

    function begin(list) {
      var pool = list || all().filter(function (s) { return L.opt.k.indexOf(s.kind) >= 0; });
      /* stations you've missed before come up more often */
      pool = pool.map(function (s) { return { s: s, w: Math.random() + (1 - rate(s.id)) * .9 }; }).sort(function (a, b) { return b.w - a.w; }).map(function (x) { return x.s; });
      var chosen = shuffle(pool.slice(0, list ? pool.length : L.opt.n));
      run = { list: chosen, i: 0, right: 0, oz: 0, miss: [], start: Date.now() };
      COMBO.n = 0; $('#ltSetup').hidden = true; $('#ltRes').hidden = true; $('#ltRun').hidden = false;
      station(); $('#ltRun').scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
    $('#ltStart').addEventListener('click', function () { begin(); });

    function station() {
      var st = run.list[run.i]; run.cur = { st: st, used: 0, done: false, t0: Date.now(), xpl: false };
      $('#ltStation').textContent = 'Station ' + (run.i + 1) + ' of ' + run.list.length + ' · ' + KIND[st.kind];
      var ph = $('#ltPhoto'); ph.innerHTML = '';
      var wrap = node('div', st.mic ? 'mic' : 'lt-img', null, ph), img = node('img', '', null, wrap); img.src = st.img; img.alt = 'Station photo';
      var tools = $('#ltTools'); tools.innerHTML = '';
      if (st.kind === 'min') {
        var tip = function (label, fn) { var b = node('button', 'chip', label, tools); b.type = 'button'; b.addEventListener('click', function () { if (run.cur.done || b.disabled) return; b.disabled = true; run.cur.used++; SND.play('flip'); fn(b); }); };
        tip('Cross the polars', function () {
          if (st.xpl) { img.src = st.xpl; say('Crossed polars: ' + ANI[st.m.ani] + '.'); } else say('Crossed polars: ' + ANI[st.m.ani] + '.');
        });
        tip('Needle (hardness)', function () { say('Hardness: ' + HC[st.m.hc] + '.'); });
        tip('Magnet', function () { say(st.m.mag === 'yes' ? 'The grain jumps to the magnet: strongly magnetic.' : st.m.mag === 'some' ? 'A weak pull on some grains: partly magnetic.' : 'Nothing happens: not magnetic.'); });
      }
      $('#ltLbl').textContent = st.lbl; $('#ltQ').textContent = st.q; $('#ltWhy').textContent = ''; $('#ltWhy').className = 'lt-why';
      var o = $('#ltOpts'); o.innerHTML = '';
      st.o.forEach(function (t, j) {
        var b = node('button', '', null, o); b.type = 'button'; node('span', 'k', String(j + 1), b); b.appendChild(document.createTextNode(t));
        b.addEventListener('click', function () { answer(j, b); });
      });
      $('#ltNext').hidden = true;
      tick(true);
    }
    function say(t) { var w = $('#ltWhy'); w.textContent = (w.textContent ? w.textContent + ' ' : '') + t; }
    function tick(reset) {
      clearInterval(clock); var T = L.opt.t;
      if (!T) { $('#ltClock').textContent = ''; $('#ltBar').style.width = '0'; return; }
      var last = -1;
      var draw = function () {
        if (!run || run.cur.done) { clearInterval(clock); return; }
        var left = Math.max(0, T - (Date.now() - run.cur.t0) / 1000), sec = Math.ceil(left);
        $('#ltClock').textContent = sec + ' s'; $('#ltBar').style.width = (left / T * 100) + '%';
        $('#ltBar').className = left < 6 ? 'low' : left < T / 3 ? 'mid' : '';
        if (sec !== last && sec <= 5 && sec > 0) SND.play('tick'); last = sec;
        if (left <= 0) { clearInterval(clock); answer(-1, null); }
      };
      draw(); clock = setInterval(draw, 200);
    }
    function answer(j, btn) {
      var c = run.cur, st = c.st; if (c.done) return; c.done = true; clearInterval(clock);
      var ok = j === st.a, bs = $$('#ltOpts button');
      bs.forEach(function (b, k) { b.disabled = true; if (k === st.a) b.classList.add('right'); });
      var r = L.seen[st.id] || [0, 0]; r[1]++;
      if (ok) {
        r[0]++; run.right++; COMBO.hit();
        var quick = L.opt.t && (Date.now() - c.t0) / 1000 < L.opt.t / 3;
        var pts = COMBO.pts(Math.max(1, 3 - c.used) + (quick ? 1 : 0)); run.oz += pts; L.xp += pts;
        FX.burst(btn); FX.float('+' + pts + ' oz'); SND.play('ok');
        $('#ltWhy').innerHTML = '<b>Right' + (quick ? ', and quick' : '') + '.</b> +' + pts + ' oz' + COMBO.tag() + '. ';
        $('#ltWhy').appendChild(document.createTextNode(st.e)); credit(st); $('#ltWhy').className = 'lt-why ok';
      } else {
        COMBO.miss(); run.miss.push(st);
        if (btn) { btn.classList.add('wrong'); FX.shake(btn); } else SND.play('alarm');
        $('#ltWhy').innerHTML = '<b>' + (btn ? 'Not that one.' : 'Time’s up.') + '</b> It’s ' + st.o[st.a] + '. ';
        $('#ltWhy').appendChild(document.createTextNode(st.e)); credit(st); $('#ltWhy').className = 'lt-why bad';
      }
      L.seen[st.id] = r; keep(); GEO.dayMark(); paintCombo();
      $('#ltNext').hidden = false; $('#ltNext').textContent = run.i + 1 < run.list.length ? 'Next station' : 'See results'; $('#ltNext').focus();
    }
    function credit(st) {
      if (!st.credit) return; var w = $('#ltWhy'); w.appendChild(document.createTextNode(' '));
      var a = node('a', 'lt-credit', 'Photo: Ian Graham, GEOS3141 lab collection', w); a.href = st.credit; a.target = '_blank'; a.rel = 'noopener';
    }
    function paintCombo() { var c = $('#ltCombo'); c.hidden = COMBO.n < 2; c.textContent = COMBO.n + ' in a row' + (COMBO.mult() > 1 ? ' ×' + COMBO.mult() : ''); c.classList.toggle('hot', COMBO.mult() >= 2); }
    $('#ltNext').addEventListener('click', function () { run.i++; if (run.i < run.list.length) station(); else results(); });
    $('#ltQuit').addEventListener('click', function () { clearInterval(clock); if (run.cur && !run.cur.done) run.list = run.list.slice(0, run.i); results(); });

    function results() {
      clearInterval(clock); $('#ltRun').hidden = true; $('#ltRes').hidden = false; $('#ltSetup').hidden = false;
      var n = run.list.length, pct = n ? Math.round(run.right / n * 100) : 0, pb = n >= 8 && pct >= 50 && pct > L.best;
      if (n) L.runs++;
      if (pb) { L.best = pct; L.xp += 10; run.oz += 10; }
      keep();
      $('#ltScore').textContent = run.right + ' / ' + n;
      $('#ltSum').textContent = (n ? pct + '% right, ' + run.oz + ' oz earned' + (COMBO.best > 2 ? ', best combo this visit ' + COMBO.best : '') + '. ' : 'No stations answered. ') + (pb ? 'New personal best, +10 oz bonus.' : n >= 8 ? 'Personal best is ' + L.best + '%.' : '');
      if (n) { if (pb) { SND.play('rank'); FX.rain(120); } else if (pct >= 70) { SND.play('clear'); FX.rain(50); } }
      var box = $('#ltList'); box.innerHTML = '';
      if (run.miss.length) {
        node('h4', '', 'Stations to revisit', box);
        run.miss.forEach(function (st) {
          var row = node('div', 'lt-miss', null, box), w = node('div', st.mic ? 'mic' : 'lt-img', null, row), im = node('img', '', null, w); im.src = st.img; im.alt = ''; im.loading = 'lazy';
          var t = node('div', '', null, row); node('b', '', st.o[st.a], t); node('p', '', st.e, t);
          if (st.lec) { var a = node('a', '', 'Review in Lecture ' + st.lec + ' →', t); a.href = 'L' + st.lec + '.html#' + st.sec; }
          else if (st.link) { var a2 = node('a', '', 'Review the supergene profile in Lecture 2 →', t); a2.href = st.link; }
          else if (st.credit) { var a3 = node('a', '', 'See the original photo →', t); a3.href = st.credit; a3.target = '_blank'; a3.rel = 'noopener'; }
        });
      }
      $('#ltMisses').hidden = !run.miss.length; paintSetup();
      $('#ltRes').scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
    $('#ltAgain').addEventListener('click', function () { begin(); });
    $('#ltMisses').addEventListener('click', function () { begin(run.miss.slice()); });
    document.addEventListener('keydown', function (e) {
      if (!run || $('#ltRun').hidden || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!run.cur.done && /^[1-9]$/.test(e.key)) { var b = $$('#ltOpts button')[+e.key - 1]; if (b) { e.preventDefault(); answer(+e.key - 1, b); } }
      else if (run.cur.done && e.key === 'Enter' && document.activeElement !== $('#ltNext')) { e.preventDefault(); $('#ltNext').click(); }
    });
    var armed = false;
    $('#ltReset').addEventListener('click', function () {
      if (!armed) { armed = true; $('#ltResetMsg').textContent = 'Click again to wipe your lab practice record and lab ounces.'; setTimeout(function () { armed = false; $('#ltResetMsg').textContent = ''; }, 4000); return; }
      try { localStorage.removeItem('geos3141-lab'); } catch (e) {} L = GEO.labLoad(); armed = false; $('#ltResetMsg').textContent = 'Record cleared.'; paintSetup();
    });
    paintSetup();
  }
};
