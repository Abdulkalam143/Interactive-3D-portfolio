// ── LOADER ── dismiss immediately, no external deps
(function () {
  function dismiss() {
    var l = document.getElementById('loader');
    if (l) l.classList.add('gone');
  }
  setTimeout(dismiss, 800);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(dismiss, 600); });
  window.addEventListener('load', function () { setTimeout(dismiss, 200); });
})();

// ── CURSOR ──
// Fix: dot follows mouse INSTANTLY (no lerp, no transition on position)
// Ring follows with smooth lerp — this gives the lag-free + trail feel
var cur  = document.getElementById('cur');
var ring = document.getElementById('ring');
var mx = window.innerWidth / 2, my = window.innerHeight / 2;
var rx = mx, ry = my;

document.addEventListener('mousemove', function (e) {
  mx = e.clientX;
  my = e.clientY;
  // Dot: instant — set left/top directly (offset by half its size = 5px)
  cur.style.left = (mx - 5) + 'px';
  cur.style.top  = (my - 5) + 'px';
});

// Ring: smooth lerp loop — only the ring trails, not the dot
(function ringLoop() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  // Offset by half ring size = 18px
  ring.style.left = (rx - 18) + 'px';
  ring.style.top  = (ry - 18) + 'px';
  requestAnimationFrame(ringLoop);
})();

// ── CANVAS BACKGROUND ──
var cv  = document.getElementById('cv');
var ctx = cv.getContext('2d');

function resize() {
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Particles
var pts = [];
for (var i = 0; i < 60; i++) {
  pts.push({
    x:  Math.random() * window.innerWidth,
    y:  Math.random() * window.innerHeight,
    r:  Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22
  });
}

// Floating geometric shapes
var shps = [
  { x:0.15, y:0.2,  sz:70, rot:0,   rs:0.003,  t:0, op:0.04  },
  { x:0.8,  y:0.1,  sz:50, rot:1,   rs:-0.004, t:1, op:0.035 },
  { x:0.9,  y:0.55, sz:85, rot:0.5, rs:0.002,  t:2, op:0.03  },
  { x:0.05, y:0.7,  sz:60, rot:2,   rs:-0.003, t:0, op:0.04  },
  { x:0.5,  y:0.85, sz:45, rot:0.8, rs:0.005,  t:1, op:0.035 },
  { x:0.7,  y:0.4,  sz:55, rot:1.5, rs:-0.003, t:2, op:0.03  }
].map(function (s) {
  return {
    x:   s.x * window.innerWidth,
    y:   s.y * window.innerHeight,
    sz:  s.sz, rot: s.rot, rs: s.rs, t: s.t, op: s.op,
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.08
  };
});

var pmx = window.innerWidth / 2, pmy = window.innerHeight / 2;
document.addEventListener('mousemove', function (e) { pmx = e.clientX; pmy = e.clientY; });

function drawShape(s) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.rot);
  var g = ctx.createLinearGradient(-s.sz/2, -s.sz/2, s.sz/2, s.sz/2);
  g.addColorStop(0, 'rgba(0,212,255,' + s.op + ')');
  g.addColorStop(1, 'rgba(168,85,247,' + s.op + ')');
  ctx.strokeStyle = g;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  if (s.t === 0) {
    ctx.rect(-s.sz/2, -s.sz/2, s.sz, s.sz);
  } else if (s.t === 1) {
    for (var i = 0; i < 3; i++)
      ctx.lineTo(Math.cos(i * 2.094 - 1.57) * s.sz/2, Math.sin(i * 2.094 - 1.57) * s.sz/2);
    ctx.closePath();
  } else {
    ctx.arc(0, 0, s.sz/2, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, cv.width, cv.height);

  // Parallax grid
  var ox = (pmx / cv.width  - 0.5) * 16;
  var oy = (pmy / cv.height - 0.5) * 12;
  ctx.strokeStyle = 'rgba(0,212,255,0.022)';
  ctx.lineWidth   = 1;
  var gs = 78;
  for (var x = ((ox % gs) + gs) % gs; x < cv.width;  x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke(); }
  for (var y = ((oy % gs) + gs) % gs; y < cv.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y);  ctx.stroke(); }

  // Shapes
  shps.forEach(function (s) {
    s.rot += s.rs; s.x += s.vx; s.y += s.vy;
    if (s.x < -130)           s.x = cv.width  + 130;
    if (s.x > cv.width  + 130) s.x = -130;
    if (s.y < -130)           s.y = cv.height + 130;
    if (s.y > cv.height + 130) s.y = -130;
    drawShape(s);
  });

  // Particles
  pts.forEach(function (p) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0)        p.x = cv.width;
    if (p.x > cv.width) p.x = 0;
    if (p.y < 0)        p.y = cv.height;
    if (p.y > cv.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,212,255,0.3)';
    ctx.fill();
  });

  // Mouse aura
  var mg = ctx.createRadialGradient(pmx, pmy, 0, pmx, pmy, 200);
  mg.addColorStop(0, 'rgba(0,212,255,0.04)');
  mg.addColorStop(1, 'transparent');
  ctx.fillStyle = mg;
  ctx.fillRect(0, 0, cv.width, cv.height);

  requestAnimationFrame(animate);
}
animate();

// ── HERO PARALLAX ──
document.addEventListener('mousemove', function (e) {
  var rx2 = (e.clientX / window.innerWidth  - 0.5) * 10;
  var ry2 = (e.clientY / window.innerHeight - 0.5) * 7;
  var h = document.getElementById('hero');
  if (h) h.style.transform = 'perspective(900px) rotateY(' + (rx2 * 0.22) + 'deg) rotateX(' + (-ry2 * 0.16) + 'deg)';
});

// ── ABOUT CARD TILT ──
var tiltEl = document.getElementById('tilt');
if (tiltEl) {
  tiltEl.addEventListener('mousemove', function (e) {
    var r = tiltEl.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width  - 0.5;
    var y = (e.clientY - r.top)  / r.height - 0.5;
    tiltEl.style.transform = 'perspective(450px) rotateY(' + (x * 18) + 'deg) rotateX(' + (-y * 14) + 'deg) scale(1.03)';
  });
  tiltEl.addEventListener('mouseleave', function () { tiltEl.style.transform = ''; });
}

// ── SCROLL REVEAL ──
var obs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .ti').forEach(function (el) { obs.observe(el); });

// ── THEME TOGGLE ──
document.getElementById('tt').addEventListener('click', function () {
  document.body.classList.toggle('light');
  this.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
});