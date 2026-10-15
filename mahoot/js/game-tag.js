/* ===== Tag: seasonal park (trees, bushes, rocks, ponds), movement and collisions, bots, drawing ===== */
(function(){
const W = 64, H = 44, R = 0.4;           // park size in tiles, player radius
const RULES = {
  SPEED:4.2, BOOST:1.10, IT_BONUS:1.05,  // tiles per second; boost +10%, IT +5%
  BOOST_MS:10000, BOOST_CD:10000,        // boost lasts 10 s, then 10 s to recharge
  INVIS_MS:5000, INVIS_CD:30000,         // invisible for 5 s, once every 30 s
  ATTRACT_MS:3000, ATTRACT_CD:60000,     // IT only: pull every runner in for 3 s, once a minute
  TRACK_MS:10000, TRACK_CD:30000,        // IT only: runners leave glowing footprints for 10 s, then 30 s to recharge
  PRINT_LIFE:6000, TWO_ITS_FROM:8,       // footprints fade after 6 s; 8 or more players get 2 taggers
  Q_EVERY:15000, Q_WARN:4000,
  COUNTDOWN:3000, START_FREEZE:3000, IT_FREEZE:2000, NO_TAGBACK:3000, TAG_DIST:0.95, PEEK_DIST:1.6
};
const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6", "#eab308", "#6366f1", "#f97316", "#64748b"];
const DARK = ["#1e4fb0", "#15803d", "#b45309", "#7e22ce", "#be185d", "#0f766e", "#a16207", "#4338ca", "#c2410c", "#334155"];
const BOT_NAMES = ["Zippy", "Pixel", "Nova", "Bolt", "Sprocket", "Widget"];
const SEASONS = { spring:"Spring", summer:"Summer", autumn:"Autumn", winter:"Winter" };
const PALS = {
  spring:{ ground:"#a3df80", ground2:"#9ad776", patch:"#bdeb9b", tuft:"#78bf58", outside:"#4f8f39", hedge:"#5ea845", hedgeHi:"#7cc25f",
    canopy:["#f9a8d4", "#f472b6", "#fbcfe8", "#7dcb63"], canopyHi:"rgba(255,255,255,.45)", trunk:"#8a5a2b",
    bush:"#58b546", bushHi:"#7fcf69", berries:["#ffffff", "#f9a8d4", "#fde047"], rock:"#b9b4a9", rockHi:"#dcd7cd",
    water:"#69c3f0", waterHi:"#b0e3fb", waterEdge:"#8ccf6e", particle:["#fbcfe8", "#f9a8d4", "#ffffff"] },
  summer:{ ground:"#82cf5e", ground2:"#79c655", patch:"#97dc75", tuft:"#5aa83f", outside:"#2f6f2a", hedge:"#3e8e35", hedgeHi:"#5aab4c",
    canopy:["#2f9e44", "#37b24d", "#2b8a3e", "#40c057"], canopyHi:"rgba(190,255,170,.45)", trunk:"#7a4b22",
    bush:"#2f8f3f", bushHi:"#4cb85a", berries:["#e03131", "#ff6b6b"], rock:"#b5b0a5", rockHi:"#d9d4ca",
    water:"#4dabf7", waterHi:"#a5d8ff", waterEdge:"#e9d8a6", particle:["#fff3bf", "#ffe066"] },
  autumn:{ ground:"#b8c46c", ground2:"#afbb62", patch:"#d6b45c", tuft:"#93a14d", outside:"#6b5a26", hedge:"#8a6d2a", hedgeHi:"#b08a37",
    canopy:["#f97316", "#ea580c", "#facc15", "#dc2626", "#f59e0b"], canopyHi:"rgba(255,240,180,.45)", trunk:"#6b4423",
    bush:"#b45309", bushHi:"#d97706", berries:["#7f1d1d", "#facc15"], rock:"#a8a29e", rockHi:"#d6d3d1",
    water:"#5aa9d6", waterHi:"#a3d4ef", waterEdge:"#c9a24a", particle:["#f97316", "#dc2626", "#facc15", "#b45309"] },
  winter:{ ground:"#eef4fb", ground2:"#e5eef8", patch:"#ffffff", tuft:"#c9d8ea", outside:"#7d93ab", hedge:"#2f6b4a", hedgeHi:"#ffffff",
    canopy:["#1f6f43", "#22784a", "#1b5e3a"], canopyHi:"#ffffff", trunk:"#6b4423",
    bush:"#cfe0ee", bushHi:"#ffffff", berries:["#2f7d4f", "#e03131"], rock:"#9aa5b1", rockHi:"#ffffff",
    water:"#bfe3f5", waterHi:"#ecf8fe", waterEdge:"#ffffff", particle:["#ffffff"] }
};

/* ---------- seeded helpers ---------- */
function rng(seed){ let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hashStr(s){ let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function hash(x, y, s){ let h = (x * 374761393 + y * 668265263 + s * 974634821) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) % 1000; }
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function norm(x, y){ const d = Math.hypot(x, y); return d > 1e-6 ? [x / d, y / d] : [0, 0]; }
function seasonFor(date){ const m = date.getMonth(); return m === 11 || m < 2 ? "winter" : m < 5 ? "spring" : m < 8 ? "summer" : "autumn"; }

/* ---------- the park ---------- */
const B = 4, GC = Math.ceil(W / B), GR = Math.ceil(H / B);
function makeGrid(list, pad){
  const g = Array.from({ length:GC * GR }, () => []);
  list.forEach(o => {
    for (let gx = Math.max(0, Math.floor((o.x - o.r - pad) / B)); gx <= Math.min(GC - 1, Math.floor((o.x + o.r + pad) / B)); gx++)
      for (let gy = Math.max(0, Math.floor((o.y - o.r - pad) / B)); gy <= Math.min(GR - 1, Math.floor((o.y + o.r + pad) / B)); gy++) g[gy * GC + gx].push(o);
  });
  return g;
}
const cell = (g, x, y) => g[clamp(Math.floor(y / B), 0, GR - 1) * GC + clamp(Math.floor(x / B), 0, GC - 1)];

function makeWorld(seed, season){
  season = PALS[season] ? season : "autumn";
  const r = rng(hashStr(seed)), w = { W, H, season, pal:PALS[season], seed, solids:[], hides:[], trees:[], bushes:[], rocks:[], ponds:[], decor:[], patches:[], fx:null };
  const placed = [];
  const fits = (x, y, rad, gap) => x - rad > 1.2 && y - rad > 1.2 && x + rad < W - 1.2 && y + rad < H - 1.2 && placed.every(o => Math.hypot(o.x - x, o.y - y) >= o.r + rad + gap);
  const place = (n, tries, make) => { for (let i = 0, k = 0; i < tries && k < n; i++) if (make()) k++; };
  // ponds: blobs of overlapping circles
  place(4, 80, () => {
    const cx = 7 + r() * (W - 14), cy = 7 + r() * (H - 14), n = 3 + Math.floor(r() * 3), ang = r() * Math.PI, parts = [];
    for (let i = 0; i < n; i++) { const t = (i - (n - 1) / 2) * 1.25; parts.push({ x:cx + Math.cos(ang) * t + (r() - 0.5) * 0.7, y:cy + Math.sin(ang) * t + (r() - 0.5) * 0.7, r:1.1 + r() * 0.8 }); }
    const ext = Math.max(...parts.map(p => Math.hypot(p.x - cx, p.y - cy) + p.r));
    if (!fits(cx, cy, ext, 2.5)) return false;
    parts.forEach(p => w.solids.push(p)); w.ponds.push({ x:cx, y:cy, r:ext, parts }); placed.push({ x:cx, y:cy, r:ext });
    return true;
  });
  // trees, mostly in groves: the trunk blocks, the canopy hides you
  place(44, 3000, () => {
    let x, y;
    if (w.trees.length && r() < 0.6) { const o = w.trees[Math.floor(r() * w.trees.length)], a = r() * Math.PI * 2, d = 3.3 + r() * 1.2; x = o.x + Math.cos(a) * d; y = o.y + Math.sin(a) * d; }
    else { x = 2 + r() * (W - 4); y = 2 + r() * (H - 4); }
    if (!fits(x, y, 0.5, 1.5)) return false;
    const t = { x, y, cr:1.4 + r() * 0.45, cy:y - 1.7, tint:Math.floor(r() * 5), v:r() };
    w.trees.push(t); w.solids.push({ x, y, r:0.35, trunk:true }); w.hides.push({ x, y:t.cy, r:t.cr * 0.75, tree:t });
    placed.push({ x, y, r:1.15 });
    return true;
  });
  // bushes: walk into them to hide
  place(22, 2500, () => {
    const x = 2 + r() * (W - 4), y = 2 + r() * (H - 4), br = 0.85 + r() * 0.35;
    if (!fits(x, y, br, 0.5)) return false;
    const b = { x, y, r:br, v:r() }; w.bushes.push(b); w.hides.push({ x, y, r:br * 0.95, bush:b }); placed.push({ x, y, r:br });
    return true;
  });
  // rocks block the way
  place(34, 1500, () => {
    const x = 2 + r() * (W - 4), y = 2 + r() * (H - 4), rr = 0.45 + r() * 0.4;
    if (!fits(x, y, rr, 1.4)) return false;
    const o = { x, y, r:rr, v:r() }; w.rocks.push(o); w.solids.push(o); placed.push({ x, y, r:rr });
    return true;
  });
  for (let i = 0; i < 46; i++) w.patches.push({ x:r() * W, y:r() * H, r:1.5 + r() * 3.2 });
  // small decorations you can walk over
  const kinds = { spring:["flowers", "flowers", "tulips", "mushroom"], summer:["flowers", "sunflower", "flowers", "mushroom"], autumn:["leaves", "pumpkin", "mushroom", "leaves"], winter:["snowman", "drift", "drift", "sprig"] }[season];
  for (let i = 0; i < 170; i++) {
    const x = 1.5 + r() * (W - 3), y = 1.5 + r() * (H - 3);
    if (placed.some(o => Math.hypot(o.x - x, o.y - y) < o.r + 0.3)) continue;
    w.decor.push({ x, y, k:kinds[Math.floor(r() * kinds.length)], v:r() });
  }
  w.decor.sort((a, b) => a.y - b.y);
  w.gS = makeGrid(w.solids, 1.0); w.gH = makeGrid(w.hides, 0.1);
  return w;
}

/* ---------- movement and collisions ---------- */
function solidHit(w, x, y, rad){
  if (x < rad + 0.5 || y < rad + 0.5 || x > W - rad - 0.5 || y > H - rad - 0.5) return true;
  for (const s of cell(w.gS, x, y)) if (Math.hypot(x - s.x, y - s.y) < s.r + rad) return true;
  return false;
}
function pushOut(w, p){
  for (let k = 0; k < 3; k++) {
    let moved = false;
    for (const s of cell(w.gS, p.x, p.y)) {
      const dx = p.x - s.x, dy = p.y - s.y, d = Math.hypot(dx, dy), m = s.r + R;
      if (d < m) { moved = true; if (d < 1e-4) p.x += m; else { p.x = s.x + dx / d * m; p.y = s.y + dy / d * m; } }
    }
    if (!moved) break;
  }
  p.x = clamp(p.x, R + 0.5, W - R - 0.5); p.y = clamp(p.y, R + 0.5, H - R - 0.5);
}
function move(w, p, dx, dy){ const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 0.25)); for (let i = 0; i < n; i++) { p.x += dx / n; p.y += dy / n; pushOut(w, p); } }
function hideAt(w, x, y){ for (const h of cell(w.gH, x, y)) if (Math.hypot(x - h.x, y - h.y) < h.r) return h; return null; }
function nearestHide(w, x, y, max){ let best = null, bd = max; for (const h of w.hides) { const d = Math.hypot(h.x - x, h.y - y); if (d < bd) { bd = d; best = h; } } return best; }
/* avoid: [[x, y, minDistance], ...] */
function freeSpot(w, rnd, avoid){
  for (let i = 0; i < 500; i++) {
    const x = 2 + rnd() * (W - 4), y = 2 + rnd() * (H - 4);
    if (solidHit(w, x, y, R + 0.3) || hideAt(w, x, y)) continue;
    if (avoid && i < 400 && avoid.some(a => Math.hypot(a[0] - x, a[1] - y) < a[2])) continue;
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  }
  return [W / 2, H / 2];
}

/* ---------- bots (run on the host) ---------- */
const BOT_LVL = {
  easy:  { name:"Easy", speed:0.84, sight:7, think:0.55, ans:[5000, 9000], right:0.7, invis:false, attract:false },
  normal:{ name:"Normal", speed:0.94, sight:9, think:0.35, ans:[4000, 7000], right:0.8, invis:true, attract:true },
  hard:  { name:"Hard", speed:1.0, sight:12, think:0.15, ans:[2500, 5000], right:0.92, invis:true, attract:true }
};
function makeBots(n, used){
  const free = COLORS.map((_, i) => i).filter(i => !used.includes(i)), out = [];
  for (let i = 0; i < n; i++) out.push({ id:"bot" + (i + 1), n:"Bot " + BOT_NAMES[i % BOT_NAMES.length], c:free.length ? free[i % free.length] : (i * 3) % COLORS.length,
    bot:true, x:W / 2, y:H / 2, dx:0, dy:1, mv:0, b:0, bReady:0, v:0, vReady:0, a:0, aUntil:0, d:0, nextQ:0, r:0, q:0, think:0, want:null, goal:null, stuckT:0, lx:0, ly:0, seen:null });
  return out;
}
const DIRS = Array.from({ length:16 }, (_, i) => [Math.cos(i * Math.PI / 8), Math.sin(i * Math.PI / 8)]);
function steer(w, b, want){
  let best = want, bs = -1e9;
  for (const [dx, dy] of DIRS) {
    let s = dx * want[0] + dy * want[1];
    if (solidHit(w, b.x + dx * 0.7, b.y + dy * 0.7, R)) s -= 3; else if (solidHit(w, b.x + dx * 1.5, b.y + dy * 1.5, R)) s -= 1.2;
    const fx = b.x + dx * 3, fy = b.y + dy * 3; if (fx < 2 || fy < 2 || fx > W - 2 || fy > H - 2) s -= 0.8;
    s += (dx * b.dx + dy * b.dy) * 0.25;
    if (s > bs) { bs = s; best = [dx, dy]; }
  }
  return best;
}
function wander(b){ if (!b.goal || Math.hypot(b.goal.x - b.x, b.goal.y - b.y) < 1.2) b.goal = { x:3 + Math.random() * (W - 6), y:3 + Math.random() * (H - 6) }; return norm(b.goal.x - b.x, b.goal.y - b.y); }
function decide(w, b, S, L, t, isIt){
  if (isIt) {
    const tracking = S.track && t < S.track.until, nb = S.ntb && S.ntb[b.id];
    let best = null, bd = 1e9;
    for (const p of S.people) {
      if (p.id === b.id || S.its[p.id] || (nb && nb.id === p.id && t < nb.until)) continue;
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      if (d > L.sight * 1.4 || (!tracking && (p.inv || (p.hid && d > 2.2)))) continue;   // footprints give hiders away
      if (d < bd) { bd = d; best = p; }
    }
    if (best) { b.seen = { x:best.x, y:best.y, t }; return norm(best.x - b.x, best.y - b.y); }
    if (b.seen && t - b.seen.t < 4000 && Math.hypot(b.seen.x - b.x, b.seen.y - b.y) > 0.8) return norm(b.seen.x - b.x, b.seen.y - b.y);
    if (!b.goal || Math.random() < 0.02) { const h = w.hides[Math.floor(Math.random() * w.hides.length)]; b.goal = h ? { x:h.x, y:h.y } : null; }   // go and search a hiding spot
    return wander(b);
  }
  let it = null, d = 1e9;
  for (const p of S.people) { if (!S.its[p.id]) continue; const pd = Math.hypot(p.x - b.x, p.y - b.y); if (pd < L.sight && !p.inv && !(p.hid && pd > 2.2) && pd < d) { d = pd; it = p; } }
  if (it) {   // the nearest IT we can see: run
    if (d < 4.5 && t >= b.bReady && t >= b.b) { b.b = t + RULES.BOOST_MS; b.bReady = t + RULES.BOOST_MS + RULES.BOOST_CD; }
    if (L.invis && d < 2.4 && t >= b.vReady) { b.v = t + RULES.INVIS_MS; b.vReady = t + RULES.INVIS_CD; }
    return norm(b.x - it.x, b.y - it.y);
  }
  if (b.nextQ && b.nextQ - t < RULES.Q_WARN + 3000) {      // question coming: head for cover
    if (hideAt(w, b.x, b.y)) return [0, 0];
    const h = nearestHide(w, b.x, b.y, 10); if (h) return norm(h.x - b.x, h.y - b.y);
  }
  return wander(b);
}
/* S: { its:{id:since}, frz:{id:until}, ntb:{it:{id,until}}, people:[{id,x,y,inv,hid}], lvl, startAt, charm:{by,until}, track:{by,until},
        cd:{ z:{id:readyAt}, x:{id:readyAt} }, use(kind, id) } */
function stepBots(w, bots, S, dt, t){
  const L = BOT_LVL[S.lvl] || BOT_LVL.normal;
  for (const b of bots) {
    const isIt = !!S.its[b.id];
    if (isIt) { b.b = 0; b.v = 0; b.a = 0; b.nextQ = 0; }
    else if (t >= S.startAt) {
      if (!b.nextQ) b.nextQ = Math.max(t, S.startAt) + RULES.Q_EVERY + Math.random() * 4000;
      if (b.a && t >= b.aUntil) { b.a = 0; b.q++; if (Math.random() < L.right) { b.r++; b.bReady = Math.max(t, b.b); } b.nextQ = t + RULES.Q_EVERY; }
      if (!b.a && t >= b.nextQ) { b.a = 1; b.aUntil = t + L.ans[0] + Math.random() * (L.ans[1] - L.ans[0]); }
    }
    const charmed = !isIt && S.charm && t < S.charm.until && S.its[S.charm.by];
    if (charmed) {
      const it = S.people.find(p => p.id === S.charm.by);
      if (it) { const [dx, dy] = norm(it.x - b.x, it.y - b.y); b.dx = dx; b.dy = dy; move(w, b, dx * RULES.SPEED * dt, dy * RULES.SPEED * dt); b.mv = 1; }
      continue;
    }
    if (b.a || t < S.startAt + (isIt ? RULES.START_FREEZE : 0) || (isIt && t < (S.frz[b.id] || 0))) { b.mv = 0; continue; }
    if (isIt && L.attract && t >= (S.cd.z[b.id] || 0)) {
      const close = S.people.filter(p => p.id !== b.id && !S.its[p.id] && !p.inv && Math.hypot(p.x - b.x, p.y - b.y) < 9).length;
      if (close >= 2 || (close >= 1 && Math.random() < dt * 0.15)) S.use("z", b.id);
    }
    if (isIt && t >= (S.cd.x[b.id] || 0) && !(S.track && t < S.track.until) && (!b.seen || t - b.seen.t > 3000) && Math.random() < dt * 0.4) S.use("x", b.id);   // nobody in sight: follow the footprints
    b.think -= dt;
    if (b.think <= 0) { b.think = L.think + Math.random() * 0.2; b.want = decide(w, b, S, L, t, isIt); }
    const want = b.want || [0, 0];
    if (!want[0] && !want[1]) { b.mv = 0; continue; }
    const dir = steer(w, b, want), k = Math.min(1, dt * 8);
    [b.dx, b.dy] = norm(b.dx + (dir[0] - b.dx) * k, b.dy + (dir[1] - b.dy) * k);
    const sp = RULES.SPEED * L.speed * (isIt ? RULES.IT_BONUS : 1) * (t < b.b ? RULES.BOOST : 1);
    move(w, b, b.dx * sp * dt, b.dy * sp * dt); b.mv = 1;
    b.stuckT += dt;
    if (b.stuckT > 1.5) { if (Math.hypot(b.x - b.lx, b.y - b.ly) < 0.6) { b.goal = null; b.want = DIRS[Math.floor(Math.random() * 16)]; b.think = 0.8; } b.stuckT = 0; b.lx = b.x; b.ly = b.y; }
  }
}

/* ---------- drawing ---------- */
const circle = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); };
function roundRect(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function heart(c, x, y, s){
  c.beginPath(); c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.6, y - s * 1.3, x, y - s * 0.35);
  c.bezierCurveTo(x + s * 0.6, y - s * 1.3, x + s * 1.6, y - s * 0.1, x, y + s * 0.9); c.fill();
}
function drawGround(c, w, x0, y0, x1, y1){
  const P = w.pal;
  c.fillStyle = P.ground; c.fillRect(0, 0, W, H);
  const i0 = Math.max(0, Math.floor(x0)), i1 = Math.min(W - 1, Math.ceil(x1)), j0 = Math.max(0, Math.floor(y0)), j1 = Math.min(H - 1, Math.ceil(y1));
  c.fillStyle = P.ground2;
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) if ((i + j) % 2) c.fillRect(i, j, 1, 1);
  c.fillStyle = P.patch; c.globalAlpha = 0.5;
  for (const p of w.patches) if (p.x + p.r > x0 && p.x - p.r < x1 && p.y + p.r > y0 && p.y - p.r < y1) { c.beginPath(); c.ellipse(p.x, p.y, p.r, p.r * 0.7, 0, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  c.strokeStyle = P.tuft; c.lineWidth = 0.05; c.lineCap = "round"; c.beginPath();
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const v = hash(i, j, 3); if (v < 380) { const tx = i + (v % 10) / 10, ty = j + ((v / 10 | 0) % 10) / 10; c.moveTo(tx - 0.08, ty); c.lineTo(tx - 0.12, ty - 0.14); c.moveTo(tx, ty); c.lineTo(tx, ty - 0.18); c.moveTo(tx + 0.08, ty); c.lineTo(tx + 0.12, ty - 0.14); } }
  c.stroke();
  // hedge around the park
  c.fillStyle = P.outside; c.fillRect(-30, -30, W + 60, 30); c.fillRect(-30, H, W + 60, 30); c.fillRect(-30, 0, 30, H); c.fillRect(W, 0, 30, H);
  c.fillStyle = P.hedge;
  for (let i = -1; i <= W; i += 0.8) { if (i < x0 - 1 || i > x1 + 1) continue; circle(c, i, 0.15, 0.55); c.fill(); circle(c, i, H - 0.15, 0.55); c.fill(); }
  for (let j = -1; j <= H; j += 0.8) { if (j < y0 - 1 || j > y1 + 1) continue; circle(c, 0.15, j, 0.55); c.fill(); circle(c, W - 0.15, j, 0.55); c.fill(); }
}
function drawFlatDecor(c, w, d){
  const P = w.pal, v = d.v;
  if (d.k === "flowers" || d.k === "tulips") {
    const cols = d.k === "tulips" ? ["#f43f5e", "#f59e0b", "#a855f7"] : ["#ff7eb6", "#ffd84d", "#ffffff", "#93c5fd"];
    for (let k = 0; k < 4; k++) { const fx = d.x + Math.cos(k * 1.7 + v * 6) * 0.25, fy = d.y + Math.sin(k * 2.3 + v * 6) * 0.18; c.fillStyle = cols[(k + Math.floor(v * 4)) % cols.length]; circle(c, fx, fy, 0.08); c.fill(); c.fillStyle = "#f59e0b"; circle(c, fx, fy, 0.03); c.fill(); }
  } else if (d.k === "leaves") {
    for (let k = 0; k < 6; k++) { c.fillStyle = P.particle[(k + Math.floor(v * 7)) % P.particle.length]; c.beginPath(); c.ellipse(d.x + Math.cos(k * 1.1 + v * 9) * 0.35, d.y + Math.sin(k * 1.9 + v * 9) * 0.2, 0.12, 0.06, k + v * 3, 0, Math.PI * 2); c.fill(); }
  } else if (d.k === "drift") {
    c.fillStyle = "#ffffff"; c.beginPath(); c.ellipse(d.x, d.y, 0.55, 0.22, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = "#dbe7f3"; c.beginPath(); c.ellipse(d.x + 0.1, d.y + 0.08, 0.35, 0.1, 0, 0, Math.PI * 2); c.fill();
  } else if (d.k === "sprig") {
    c.strokeStyle = "#2f7d4f"; c.lineWidth = 0.05; c.beginPath(); c.moveTo(d.x - 0.15, d.y + 0.1); c.lineTo(d.x + 0.15, d.y - 0.1); c.stroke(); c.fillStyle = "#e03131"; circle(c, d.x, d.y, 0.05); c.fill(); circle(c, d.x + 0.07, d.y + 0.03, 0.05); c.fill();
  }
}
function drawTallDecor(c, w, d){
  if (d.k === "pumpkin") {
    c.fillStyle = "rgba(0,0,0,.15)"; c.beginPath(); c.ellipse(d.x, d.y + 0.16, 0.3, 0.08, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#ea580c"; c.beginPath(); c.ellipse(d.x, d.y, 0.3, 0.22, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#c2410c"; c.lineWidth = 0.035; c.beginPath(); c.ellipse(d.x, d.y, 0.12, 0.22, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#4d7c0f"; c.fillRect(d.x - 0.03, d.y - 0.3, 0.06, 0.1);
  } else if (d.k === "mushroom") {
    c.fillStyle = "#f5f0e6"; c.fillRect(d.x - 0.05, d.y - 0.08, 0.1, 0.14);
    c.fillStyle = "#dc2626"; c.beginPath(); c.arc(d.x, d.y - 0.08, 0.16, Math.PI, 0); c.fill();
    c.fillStyle = "#ffffff"; circle(c, d.x - 0.06, d.y - 0.14, 0.03); c.fill(); circle(c, d.x + 0.06, d.y - 0.12, 0.025); c.fill();
  } else if (d.k === "sunflower") {
    c.strokeStyle = "#3f8f35"; c.lineWidth = 0.06; c.beginPath(); c.moveTo(d.x, d.y + 0.2); c.lineTo(d.x, d.y - 0.3); c.stroke();
    c.fillStyle = "#facc15"; for (let k = 0; k < 8; k++) { c.beginPath(); c.ellipse(d.x + Math.cos(k * Math.PI / 4) * 0.13, d.y - 0.4 + Math.sin(k * Math.PI / 4) * 0.13, 0.08, 0.04, k * Math.PI / 4, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#78350f"; circle(c, d.x, d.y - 0.4, 0.08); c.fill();
  } else if (d.k === "snowman") {
    c.fillStyle = "rgba(0,0,0,.12)"; c.beginPath(); c.ellipse(d.x, d.y + 0.25, 0.3, 0.08, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#ffffff"; c.strokeStyle = "#cbd5e1"; c.lineWidth = 0.03; circle(c, d.x, d.y, 0.26); c.fill(); c.stroke(); circle(c, d.x, d.y - 0.36, 0.18); c.fill(); c.stroke();
    c.fillStyle = "#111827"; circle(c, d.x - 0.06, d.y - 0.4, 0.025); c.fill(); circle(c, d.x + 0.06, d.y - 0.4, 0.025); c.fill();
    c.fillStyle = "#f97316"; c.beginPath(); c.moveTo(d.x, d.y - 0.36); c.lineTo(d.x + 0.16, d.y - 0.33); c.lineTo(d.x, d.y - 0.31); c.fill();
    c.fillStyle = "#dc2626"; c.fillRect(d.x - 0.16, d.y - 0.22, 0.32, 0.06);
  } else drawFlatDecor(c, w, d);
}
function drawPond(c, w, p, time){
  const P = w.pal, ice = w.season === "winter";
  c.fillStyle = P.waterEdge; p.parts.forEach(q => { circle(c, q.x, q.y, q.r + 0.14); c.fill(); });
  c.fillStyle = P.water; p.parts.forEach(q => { circle(c, q.x, q.y, q.r); c.fill(); });
  if (ice) {
    c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 0.05; c.beginPath();
    p.parts.forEach((q, i) => { c.moveTo(q.x - q.r * 0.5, q.y - q.r * 0.2); c.lineTo(q.x - q.r * 0.1, q.y + q.r * 0.1); c.lineTo(q.x + q.r * 0.35, q.y - q.r * (i % 2 ? 0.3 : -0.2)); });
    c.stroke();
  } else {
    c.strokeStyle = P.waterHi; c.lineWidth = 0.06; c.lineCap = "round";
    p.parts.forEach((q, i) => { const s = Math.sin(time * 1.5 + i) * 0.15; c.beginPath(); c.moveTo(q.x - q.r * 0.4 + s, q.y - q.r * 0.25); c.lineTo(q.x + s, q.y - q.r * 0.25); c.stroke(); });
    if (w.season === "summer" || w.season === "spring") { const q = p.parts[0]; c.fillStyle = "#5fb34a"; c.beginPath(); c.arc(q.x + q.r * 0.3, q.y + q.r * 0.25, 0.28, 0.4, Math.PI * 2 - 0.2); c.lineTo(q.x + q.r * 0.3, q.y + q.r * 0.25); c.fill(); }
  }
}
function drawTrunk(c, w, t){
  c.fillStyle = "rgba(0,0,0,.18)"; c.beginPath(); c.ellipse(t.x + 0.1, t.y + 0.25, t.cr * 0.75, 0.32, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = w.pal.trunk; roundRect(c, t.x - 0.17, t.y - 1.3, 0.34, 1.55, 0.08); c.fill();
  c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(t.x + 0.05, t.y - 1.3, 0.12, 1.5);
}
function drawCanopy(c, w, t, alpha){
  const P = w.pal, cx = t.x, cy = t.cy, cr = t.cr;
  c.globalAlpha = alpha;
  if (w.season === "winter") {
    for (let k = 0; k < 3; k++) {
      const yy = cy + 0.65 - k * 0.6, ww = cr * (1 - k * 0.25);
      c.fillStyle = P.canopy[(t.tint + k) % P.canopy.length]; c.beginPath(); c.moveTo(cx - ww, yy + 0.35); c.lineTo(cx, yy - 0.75); c.lineTo(cx + ww, yy + 0.35); c.closePath(); c.fill();
      c.fillStyle = "#ffffff"; c.beginPath(); c.moveTo(cx - ww * 0.55, yy - 0.1); c.lineTo(cx, yy - 0.75); c.lineTo(cx + ww * 0.55, yy - 0.1); c.quadraticCurveTo(cx, yy - 0.25, cx - ww * 0.55, yy - 0.1); c.fill();
    }
  } else {
    const base = P.canopy[t.tint % P.canopy.length], blobs = [[0, 0.1, 1], [-0.45, 0.2, 0.68], [0.45, 0.25, 0.66], [0, -0.38, 0.7], [-0.3, -0.25, 0.55], [0.32, -0.2, 0.55]];
    c.fillStyle = "rgba(0,0,0,.12)"; circle(c, cx + 0.08, cy + 0.2, cr); c.fill();
    c.fillStyle = base; blobs.forEach(([dx, dy, s]) => { circle(c, cx + dx * cr, cy + dy * cr, cr * s * 0.72); c.fill(); });
    c.fillStyle = P.canopyHi; circle(c, cx - cr * 0.28, cy - cr * 0.35, cr * 0.28); c.fill();
    if (w.season === "spring") { c.fillStyle = "#ffffff"; for (let k = 0; k < 6; k++) { circle(c, cx + Math.cos(k * 2.1 + t.v * 9) * cr * 0.6, cy + Math.sin(k * 2.7 + t.v * 9) * cr * 0.5, 0.07); c.fill(); } }
    if (w.season === "summer" && t.tint % 2) { c.fillStyle = "#e03131"; for (let k = 0; k < 5; k++) { circle(c, cx + Math.cos(k * 2.3 + t.v * 7) * cr * 0.55, cy + Math.sin(k * 1.9 + t.v * 7) * cr * 0.45, 0.09); c.fill(); } }
  }
  c.globalAlpha = 1;
}
function drawBush(c, w, b, alpha, shake){
  const P = w.pal, s = shake ? Math.sin(Date.now() / 40) * 0.05 : 0;
  c.globalAlpha = alpha;
  c.fillStyle = "rgba(0,0,0,.14)"; c.beginPath(); c.ellipse(b.x + 0.05, b.y + b.r * 0.45, b.r, b.r * 0.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = P.bush; [[0, 0.05, 1], [-0.45, 0.15, 0.7], [0.45, 0.15, 0.72], [-0.2, -0.3, 0.7], [0.25, -0.28, 0.65]].forEach(([dx, dy, k]) => { circle(c, b.x + dx * b.r + s, b.y + dy * b.r, b.r * k * 0.68); c.fill(); });
  c.fillStyle = P.bushHi; circle(c, b.x - b.r * 0.3 + s, b.y - b.r * 0.35, b.r * 0.25); c.fill();
  c.fillStyle = P.berries[Math.floor(b.v * 10) % P.berries.length];
  for (let k = 0; k < 4; k++) { circle(c, b.x + Math.cos(k * 1.9 + b.v * 9) * b.r * 0.55 + s, b.y + Math.sin(k * 2.4 + b.v * 9) * b.r * 0.4, 0.06); c.fill(); }
  c.globalAlpha = 1;
}
function drawRock(c, w, o){
  c.fillStyle = "rgba(0,0,0,.18)"; c.beginPath(); c.ellipse(o.x + 0.06, o.y + o.r * 0.5, o.r * 1.05, o.r * 0.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = w.pal.rock; c.beginPath(); c.ellipse(o.x, o.y, o.r, o.r * 0.82, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = w.pal.rockHi; c.beginPath(); c.ellipse(o.x - o.r * 0.25, o.y - o.r * 0.35, o.r * 0.45, o.r * 0.25, 0, 0, Math.PI * 2); c.fill();
}
function drawEyes(c, p, x, y, time){
  const lx = p.dx * 0.045, ly = p.dy * 0.045;
  [-1, 1].forEach(side => {
    const ex = x + side * 0.15, ey = y - 0.1;
    if (p.charmed) { const beat = 1 + Math.abs(Math.sin(time * 8)) * 0.35; c.fillStyle = "#ff3d7f"; heart(c, ex, ey, 0.085 * beat); return; }
    c.fillStyle = "#ffffff"; circle(c, ex, ey, 0.11); c.fill();
    if (p.dizzy) { c.strokeStyle = "#1d2433"; c.lineWidth = 0.03; c.beginPath(); for (let a = 0; a < 9; a += 0.4) { const rr = a / 9 * 0.08; c.lineTo(ex + Math.cos(a + time * 9) * rr, ey + Math.sin(a + time * 9) * rr); } c.stroke(); return; }
    c.fillStyle = "#1d2433"; circle(c, ex + lx, ey + ly, 0.055); c.fill();
  });
}
function drawChar(c, p, time){
  const col = COLORS[p.c % COLORS.length], dk = DARK[p.c % DARK.length], ph = (p.ph || 0);
  const bob = p.mv ? Math.abs(Math.sin(time * 12 + ph)) * 0.07 : 0, x = p.x, y = p.y - bob - 0.05;
  c.globalAlpha = p.alpha == null ? 1 : p.alpha;
  c.fillStyle = "rgba(0,0,0,.2)"; c.beginPath(); c.ellipse(p.x, p.y + 0.33, 0.34, 0.1, 0, 0, Math.PI * 2); c.fill();
  if (p.boost && p.mv) { for (let k = 1; k <= 3; k++) { c.fillStyle = "rgba(255,255,255," + (0.35 - k * 0.09) + ")"; circle(c, x - p.dx * k * 0.28, y - p.dy * k * 0.28, R * (1 - k * 0.15)); c.fill(); } }
  if (p.it) { const pulse = 0.06 + Math.abs(Math.sin(time * 5)) * 0.06; c.strokeStyle = "rgba(239,68,68,.95)"; c.lineWidth = 0.09; circle(c, x, y, R + 0.08 + pulse); c.stroke(); }
  if (p.attracting) { for (let k = 0; k < 3; k++) { const rr = ((time * 1.4 + k / 3) % 1) * 2.4; c.strokeStyle = "rgba(255,61,127," + (0.8 - rr / 3) + ")"; c.lineWidth = 0.07; circle(c, x, y, R + rr); c.stroke(); } }
  // feet
  const step = p.mv ? Math.sin(time * 12 + ph) * 0.09 : 0;
  c.fillStyle = dk; c.beginPath(); c.ellipse(p.x - 0.15, p.y + 0.3 + step * 0.4, 0.11, 0.07, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(p.x + 0.15, p.y + 0.3 - step * 0.4, 0.11, 0.07, 0, 0, Math.PI * 2); c.fill();
  // body
  c.fillStyle = dk; circle(c, x, y + 0.03, R); c.fill();
  c.fillStyle = col; circle(c, x, y, R - 0.02); c.fill();
  c.fillStyle = "rgba(255,255,255,.35)"; circle(c, x - 0.13, y - 0.17, 0.11); c.fill();
  if (p.it) { c.fillStyle = "#ef4444"; roundRect(c, x - R + 0.04, y - 0.3, (R - 0.04) * 2, 0.1, 0.04); c.fill(); }   // red headband
  drawEyes(c, p, x, y, time);
  if (p.dizzy) { c.fillStyle = "#facc15"; for (let k = 0; k < 3; k++) { const a = time * 4 + k * 2.1; circle(c, x + Math.cos(a) * 0.38, y - 0.5 + Math.sin(a) * 0.12, 0.06); c.fill(); } }
  if (p.charmed) { c.fillStyle = "#ff3d7f"; const f = (time * 1.2 + ph) % 1; c.globalAlpha = (p.alpha == null ? 1 : p.alpha) * (1 - f); heart(c, x + 0.25, y - 0.55 - f * 0.4, 0.08); }
  c.globalAlpha = 1;
}
function drawLabel(c, p, s){
  const fs = 12 / s, y = p.y - R - 0.42;
  c.font = "700 " + fs + "px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
  const label = p.label, tw = c.measureText(label).width + 8 / s;
  c.globalAlpha = p.alpha == null ? 1 : Math.max(0.5, p.alpha);
  c.fillStyle = p.it ? "#ef4444" : p.me ? "#1d2433" : "rgba(255,255,255,.88)"; roundRect(c, p.x - tw / 2, y - fs * 0.75, tw, fs * 1.5, fs * 0.5); c.fill();
  c.fillStyle = p.it || p.me ? "#ffffff" : "#1d2433"; c.fillText(label, p.x, y + fs * 0.05);
  if (p.ans) {   // speech bubble: answering a question
    const bx = p.x + 0.42, by = p.y - 0.75;
    c.fillStyle = "#ffffff"; c.strokeStyle = "#1d2433"; c.lineWidth = 1.5 / s; roundRect(c, bx - 0.2, by - 0.22, 0.4, 0.38, 0.1); c.fill(); c.stroke();
    c.fillStyle = "#2340c4"; c.font = "800 " + (0.3) + "px system-ui, sans-serif"; c.fillText("?", bx, by - 0.02);
  }
  c.globalAlpha = 1;
}
function particles(w, V, dt, x0, y0, x1, y1){
  const want = Math.round(Math.min(90, Math.max(24, (x1 - x0) * (y1 - y0) / 4)));
  if (!w.fx) w.fx = [];
  const P = w.pal, fall = w.season !== "summer";
  const spawn = (top) => ({ x:x0 + Math.random() * (x1 - x0), y:top ? y0 - 0.5 : y0 + Math.random() * (y1 - y0), vy:fall ? (w.season === "winter" ? 0.8 + Math.random() * 0.9 : 0.5 + Math.random() * 0.7) : (Math.random() - 0.5) * 0.3,
    vx:(Math.random() - 0.3) * 0.5, rot:Math.random() * 6, vr:(Math.random() - 0.5) * 4, s:0.05 + Math.random() * 0.07, col:P.particle[Math.floor(Math.random() * P.particle.length)], ph:Math.random() * 6 });
  while (w.fx.length < want) w.fx.push(spawn(false));
  if (w.fx.length > want) w.fx.length = want;
  for (let i = 0; i < w.fx.length; i++) {
    const f = w.fx[i];
    f.ph += dt; f.x += (f.vx + Math.sin(f.ph * 1.5) * 0.35) * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
    if (f.y > y1 + 0.5 || f.x < x0 - 1 || f.x > x1 + 1 || f.y < y0 - 1) w.fx[i] = spawn(fall);
  }
}
function drawParticles(c, w, time){
  for (const f of w.fx || []) {
    c.fillStyle = f.col;
    if (w.season === "winter") { circle(c, f.x, f.y, f.s * 0.9); c.fill(); }
    else if (w.season === "summer") { c.globalAlpha = 0.5 + Math.sin(time * 4 + f.ph * 3) * 0.4; circle(c, f.x, f.y, f.s * 0.6); c.fill(); c.globalAlpha = 1; }
    else { c.save(); c.translate(f.x, f.y); c.rotate(f.rot); c.beginPath(); c.ellipse(0, 0, f.s * (w.season === "autumn" ? 1.8 : 1.3), f.s * 0.8, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
  }
}
function miniMap(w){
  if (w.mini) return w.mini;
  const k = 2, m = document.createElement("canvas"); m.width = W * k; m.height = H * k;
  const c = m.getContext("2d"), P = w.pal; c.scale(k, k);
  c.fillStyle = P.ground; c.fillRect(0, 0, W, H);
  c.fillStyle = P.water; w.ponds.forEach(p => p.parts.forEach(q => { circle(c, q.x, q.y, q.r); c.fill(); }));
  c.fillStyle = P.bush; w.bushes.forEach(b => { circle(c, b.x, b.y, b.r); c.fill(); });
  c.fillStyle = w.season === "winter" ? P.canopy[0] : P.canopy[0]; w.trees.forEach(t => { circle(c, t.x, t.cy, t.cr * 0.8); c.fill(); });
  c.fillStyle = P.rock; w.rocks.forEach(o => { circle(c, o.x, o.y, o.r); c.fill(); });
  return (w.mini = m);
}
/* V: { w, camX, camY, scale, cw, ch, dpr, time, dt, list:[{id,label,c,x,y,dx,dy,mv,it,boost,ans,dizzy,charmed,attracting,alpha,me,draw:"full"|"peek"}],
        meHide, itMark:{x,y}|null, joy, mini:true, center, sub, banner:{text,col}, toast:{text,col}, tagRange } */
function draw(c, V){
  const { w, scale:s, cw, ch, dpr } = V, P = w.pal;
  const x0 = V.camX - cw / 2 / s, y0 = V.camY - ch / 2 / s, x1 = x0 + cw / s, y1 = y0 + ch / s, time = V.time;
  c.setTransform(dpr * s, 0, 0, dpr * s, -x0 * s * dpr, -y0 * s * dpr);
  drawGround(c, w, x0, y0, x1, y1);
  const inView = (x, y, m) => x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m;
  w.decor.forEach(d => { if ((d.k === "flowers" || d.k === "tulips" || d.k === "leaves" || d.k === "drift" || d.k === "sprig") && inView(d.x, d.y, 1)) drawFlatDecor(c, w, d); });
  w.ponds.forEach(p => { if (inView(p.x, p.y, p.r + 1)) drawPond(c, w, p, time); });
  if (V.prints) for (const f of V.prints) {   // glowing footprints (Footprints ability)
    const age = (V.ms - f.t) / RULES.PRINT_LIFE; if (age >= 1 || age < 0 || !inView(f.x, f.y, 1)) continue;
    const a = 1 - age, col = COLORS[f.c % COLORS.length];
    c.save(); c.translate(f.x - Math.sin(f.a) * 0.11 * f.side, f.y + Math.cos(f.a) * 0.11 * f.side); c.rotate(f.a);
    const glow = 0.8 + Math.sin(time * 6 + f.x) * 0.2;
    c.globalAlpha = a * 0.22 * glow; c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 0.42, 0.28, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = a * 0.45 * glow; c.beginPath(); c.ellipse(0, 0, 0.28, 0.18, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = a; c.beginPath(); c.ellipse(0.05, 0, 0.15, 0.09, 0, 0, Math.PI * 2); c.fill(); circle(c, -0.13, 0, 0.07); c.fill();
    c.fillStyle = "#ffffff"; c.globalAlpha = a * 0.85; c.beginPath(); c.ellipse(0.06, 0, 0.08, 0.04, 0, 0, Math.PI * 2); c.fill(); circle(c, -0.13, 0, 0.03); c.fill();
    c.restore();
  }
  c.globalAlpha = 1;
  // things that stand up, sorted by their feet
  const items = [];
  w.trees.forEach(t => { if (inView(t.x, t.y, 3)) items.push([t.y, 0, t]); });
  w.rocks.forEach(o => { if (inView(o.x, o.y, 2)) items.push([o.y, 1, o]); });
  w.decor.forEach(d => { if ((d.k === "pumpkin" || d.k === "mushroom" || d.k === "sunflower" || d.k === "snowman") && inView(d.x, d.y, 1)) items.push([d.y, 2, d]); });
  V.list.forEach(p => { if (p.draw === "full" && inView(p.x, p.y, 2)) items.push([p.y + 0.3, 3, p]); });
  items.sort((a, b) => a[0] - b[0]);
  if (V.tagRange) { c.strokeStyle = "rgba(239,68,68,.35)"; c.lineWidth = 0.05; c.setLineDash([0.15, 0.12]); circle(c, V.tagRange.x, V.tagRange.y, RULES.TAG_DIST); c.stroke(); c.setLineDash([]); }
  for (const [, k, o] of items) { if (k === 0) drawTrunk(c, w, o); else if (k === 1) drawRock(c, w, o); else if (k === 2) drawTallDecor(c, w, o); else drawChar(c, o, time); }
  // foliage over the players: bushes, then tree tops
  const peeks = V.list.filter(p => p.draw === "peek");
  w.bushes.forEach(b => { if (inView(b.x, b.y, 2)) drawBush(c, w, b, V.meHide && V.meHide.bush === b ? 0.5 : 1, peeks.some(p => Math.hypot(p.x - b.x, p.y - b.y) < b.r)); });
  w.trees.forEach(t => { if (inView(t.x, t.cy, 3)) drawCanopy(c, w, t, V.meHide && V.meHide.tree === t ? 0.42 : 1); });
  peeks.forEach(p => { if (inView(p.x, p.y, 1)) { c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(p.x, p.y - 0.15, 0.3, 0.16, 0, 0, Math.PI * 2); c.fill(); drawEyes(c, p, p.x, p.y - 0.05, time); } });   // eyes peeking out of the leaves
  V.list.forEach(p => { if (p.draw === "full" && inView(p.x, p.y, 2)) drawLabel(c, p, s); });
  particles(w, V, V.dt, x0, y0, x1, y1); drawParticles(c, w, time);
  // ---- screen space ----
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (V.charmTint) { c.fillStyle = "rgba(255,61,127," + V.charmTint + ")"; c.fillRect(0, 0, cw, ch); }
  if (V.itMark) {   // arrow to IT when IT is off screen
    const sx = (V.itMark.x - x0) * s, sy = (V.itMark.y - y0) * s;
    if (sx < 0 || sy < 0 || sx > cw || sy > ch) {
      const cx = cw / 2, cy = ch / 2, a = Math.atan2(sy - cy, sx - cx), m = 26;
      const k = Math.min((cw / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (ch / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
      const ax = cx + Math.cos(a) * k, ay = cy + Math.sin(a) * k;
      c.save(); c.translate(ax, ay); c.rotate(a); c.fillStyle = "#ef4444"; c.strokeStyle = "#ffffff"; c.lineWidth = 2;
      c.beginPath(); c.moveTo(16, 0); c.lineTo(-8, -12); c.lineTo(-8, 12); c.closePath(); c.fill(); c.stroke(); c.restore();
      c.fillStyle = "#ffffff"; c.font = "800 10px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("IT", ax, ay);
    }
  }
  if (V.mini) {
    const mw = cw < 520 ? 86 : 124, mh = mw * H / W, mx = cw - mw - 8, my = 8, k = mw / W;
    c.globalAlpha = 0.9; c.fillStyle = "rgba(15,23,42,.55)"; roundRect(c, mx - 3, my - 3, mw + 6, mh + 6, 6); c.fill();
    c.drawImage(miniMap(w), mx, my, mw, mh); c.globalAlpha = 1;
    c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 1; c.strokeRect(mx + x0 * k, my + y0 * k, (x1 - x0) * k, (y1 - y0) * k);
    V.list.forEach(p => { if (p.draw !== "full") return; c.fillStyle = p.it ? "#ef4444" : COLORS[p.c % COLORS.length]; circle(c, mx + p.x * k, my + p.y * k, p.it ? 3.5 : p.me ? 3 : 2.2); c.fill(); if (p.me) { c.strokeStyle = "#ffffff"; c.lineWidth = 1.5; c.stroke(); } });
  }
  if (V.joy) { c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 3; circle(c, V.joy.sx, V.joy.sy, 40); c.stroke(); c.fillStyle = "rgba(255,255,255,.55)"; const d = Math.hypot(V.joy.cx - V.joy.sx, V.joy.cy - V.joy.sy), k = d > 40 ? 40 / d : 1; circle(c, V.joy.sx + (V.joy.cx - V.joy.sx) * k, V.joy.sy + (V.joy.cy - V.joy.sy) * k, 16); c.fill(); }
  const pill = (text, y, bg, fg, size) => {
    c.font = "800 " + size + "px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    const tw = Math.min(cw - 20, c.measureText(text).width + 24), h = size + 14;
    c.fillStyle = bg; roundRect(c, cw / 2 - tw / 2, y - h / 2, tw, h, h / 2); c.fill(); c.fillStyle = fg; c.fillText(text, cw / 2, y + 1, cw - 36);
  };
  const fs = cw < 520 ? 13 : 15;
  if (V.toast) pill(V.toast.text, 24, V.toast.col || "rgba(15,23,42,.8)", "#ffffff", fs);
  if (V.banner) pill(V.banner.text, ch - 26, V.banner.col || "rgba(15,23,42,.8)", V.banner.fg || "#ffffff", fs);
  if (V.center) {
    c.fillStyle = "rgba(15,23,42,.35)"; c.fillRect(0, 0, cw, ch);
    c.font = "900 " + Math.round(Math.min(cw, ch) * 0.28) + "px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.lineWidth = 8; c.strokeStyle = "rgba(15,23,42,.6)"; c.strokeText(V.center, cw / 2, ch / 2 - 10); c.fillStyle = "#ffffff"; c.fillText(V.center, cw / 2, ch / 2 - 10);
    if (V.sub) pill(V.sub, ch / 2 + Math.min(cw, ch) * 0.2, "rgba(239,68,68,.92)", "#ffffff", fs + 1);
  }
}
/* a still picture of the park for the Games home card */
function drawThumb(canvas, season){
  const cw = canvas.clientWidth || 320, ch = Math.round(cw * 0.42), dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); canvas.style.height = ch + "px";
  const w = makeWorld("thumb-7", season), c = canvas.getContext("2d"), s = cw / 20;
  const camX = 20, camY = 14, spot = (dx, dy) => {   // nearest open spot (not under a tree or in a bush), spiralling out
    for (let k = 0; k < 200; k++) { const a = k * 0.7, d = k * 0.06, p = { x:camX + dx + Math.cos(a) * d, y:camY + dy + Math.sin(a) * d * 0.6 };
      if (!hideAt(w, p.x, p.y) && !solidHit(w, p.x, p.y, R + 0.2) && Math.abs(p.y - camY) < 3) return p; }
    return { x:camX + dx, y:camY + dy };
  };
  const mk = (o, i) => Object.assign({ id:"t" + i, label:o.label, c:o.c, dx:o.dx || 0, dy:o.dy || 1, mv:1, alpha:1, draw:"full", ph:i }, spot(o.x, o.y), o.extra || {});
  const list = [mk({ label:"IT", c:9, x:-1.5, y:1, dx:1, dy:0, extra:{ it:true } }, 0), mk({ label:"Ana", c:0, x:3, y:-0.5, dx:1, dy:0, extra:{ boost:true } }, 1), mk({ label:"Leo", c:3, x:-5, y:-2, dx:-1, dy:0 }, 2), mk({ label:"Mia", c:4, x:5.5, y:2.5, extra:{ ans:true, mv:0 } }, 3)];
  w.fx = null;
  draw(c, { w, camX, camY, scale:s, cw, ch, dpr, time:1.3, dt:0, list, meHide:null, mini:false });
}

window.TagGame = { W, H, R, RULES, COLORS, BOT_NAMES, BOT_LVL, SEASONS, PALS, seasonFor, makeWorld, move, pushOut, solidHit, hideAt, freeSpot, makeBots, stepBots, draw, drawThumb, norm };
// games.js may draw its home card before this file loads: draw the Tag picture now
try { const th = document.getElementById("tg-thumb"); if (th) drawThumb(th, seasonFor(new Date())); } catch(e) {}
})();
