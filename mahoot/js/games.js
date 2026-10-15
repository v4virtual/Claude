/* ===== Games tab: mode picker + Tower Defense screen (drawing, shop, question breaks) ===== */
(function(){
const BEST_KEY = "mahoot-td-best";
const root = () => $("#games-root");
let qSource = "quick", mapId = "zigzag", cvs = null, ctx = null, raf = 0, last = 0, colors = {}, colorAge = 99, qPool = [], qPtr = 0;

function best(){ try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch(e) { return {}; } }
function saveBest(topicId, round){ const b = best(); if (!b[topicId] || round > b[topicId]) { b[topicId] = round; try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch(e) {} return true; } return false; }
const curTopic = () => TOPICS[window.ExpLab ? window.ExpLab.currentTopic() : "exponents"];

/* ---------- home: pick a game ---------- */
function renderHome(){
  stopLoop(); setPlaying(false);
  const t = curTopic(), b = best()[t.id];
  root().innerHTML =
    '<div class="stack"><h2>Games</h2><p class="muted">Play, and answer quick questions between rounds to earn more money. Pick Quick math, or easy questions from <b>' + esc(topicLabel(t)) + '</b> (change the topic on the Start tab).</p></div>' +
    '<div class="sheet gamecard"><div class="gamehead"><div><span class="eyebrow">Game mode</span><h3>Tower Defense</h3></div>' + (b ? '<span class="tag">Your best: round ' + b + "</span>" : "") + "</div>" +
      '<p>Colored blocks march along a path. Spend your money on turrets to stop them. Every block that gets through costs you health. After each round, answer a question (from round ' + (TD.EASY_ROUNDS + 1) + " on, " + TD.QUESTIONS_PER_BREAK + " questions): each correct answer earns $" + TD.QUESTION_BONUS + " for more turrets.</p>" +
      '<div class="field"><span>Questions</span><div class="seg" id="td-src">' +
        '<label><input type="radio" name="td-src" value="quick"' + (qSource === "quick" ? " checked" : "") + '>Quick math</label>' +
        '<label><input type="radio" name="td-src" value="topic"' + (qSource === "topic" ? " checked" : "") + ">Easy " + esc(t.name) + "</label></div>" +
        '<p class="small muted" id="td-src-desc"></p></div>' +
      '<div class="field"><span>Map</span><div class="seg" id="td-maps">' + Object.entries(TD.MAPS).map(([id, m]) => '<label><input type="radio" name="td-map" value="' + id + '"' + (id === mapId ? " checked" : "") + ">" + m.name + "</label>").join("") + "</div></div>" +
      '<div class="tdthumb"><canvas id="td-thumb" aria-hidden="true"></canvas></div>' +
      '<div class="btnrow"><button class="btn" type="button" id="td-play">Play Tower Defense</button></div></div>' +
    '<div class="sheet gamecard"><div class="gamehead"><div><span class="eyebrow">Game mode · 2 or more players</span><h3>Tag</h3></div><span class="tag">Play with friends or bots</span></div>' +
      '<p>Run around a big park that changes with the seasons. One player is <b>IT</b> and chases everyone else. Boost with <kbd>Space</kbd>, turn invisible with <kbd>Q</kbd>, and hide in bushes and under trees, because every 30 seconds you have to stop and answer a question. IT can pull everyone in with <kbd>Z</kbd> Attraction. Least time as IT wins.</p>' +
      '<div class="tdthumb tgthumb"><canvas id="tg-thumb" aria-hidden="true"></canvas></div>' +
      '<div class="btnrow"><button class="btn" type="button" id="tg-open">Play Tag</button></div></div>';
  const srcDesc = () => { $("#td-src-desc").textContent = qSource === "quick"
      ? "Short questions you can do in your head: put numbers in order, compare, add, times tables. They get a little harder after round 10 and round 20."
      : "The easiest questions from " + topicLabel(t) + " that you can answer on the spot."; };
  $$('input[name="td-src"]').forEach(r => r.addEventListener("change", () => { qSource = r.value; srcDesc(); }));
  srcDesc();
  $$('input[name="td-map"]').forEach(r => r.addEventListener("change", () => { mapId = r.value; drawThumb(); }));
  $("#td-play").addEventListener("click", () => startGame());
  $("#tg-open").addEventListener("click", () => { if (window.TagUI) window.TagUI.open(); });
  drawThumb();
  try { if (window.TagGame) TagGame.drawThumb($("#tg-thumb"), TagGame.seasonFor(new Date())); } catch(e) {}
}
function drawThumb(){
  const c = $("#td-thumb"); if (!c) return;
  const w = c.clientWidth || 320, tile = w / TD.COLS, dpr = window.devicePixelRatio || 1;
  c.width = w * dpr; c.height = tile * TD.ROWS * dpr; c.style.height = tile * TD.ROWS + "px";
  const x = c.getContext("2d"); readColors();
  x.setTransform(dpr * tile, 0, 0, dpr * tile, 0, 0);
  drawBoard(x, { path:TD.buildPath(TD.MAPS[mapId]), mapId }, true);
}

/* ---------- start / quiz pool ---------- */
const setPlaying = on => document.body.classList.toggle("playing", on);
function startGame(){
  setPlaying(true);
  const t = curTopic();
  qPool = qSource === "topic" ? quickPool(t.id) : []; qPtr = 0;
  TD.newGame(mapId, t.id).qSource = qSource;
  root().innerHTML =
    '<div class="tdbar"><span class="eyebrow">' + esc(topicLabel(t)) + " · Tower Defense · " + esc(TD.MAPS[mapId].name) + " · " + (qSource === "quick" ? "Quick math" : "Easy " + esc(t.name)) + '</span><button class="btn quiet small" type="button" id="td-quit">Quit game</button></div>' +
    '<div class="hud" id="td-hud" aria-live="polite"></div>' +
    '<div class="tdwrap"><canvas id="td-canvas" aria-label="Tower defense battlefield. Pick a turret below, then tap an empty square to place it."></canvas></div>' +
    '<p class="small" id="td-say" role="status"></p>' +
    '<div id="td-panel" class="stack"></div>';
  cvs = $("#td-canvas"); ctx = cvs.getContext("2d");
  cvs.addEventListener("pointerdown", e => { const p = tileAt(e); if (p) TD.tap(p[0], p[1]); });
  cvs.addEventListener("pointermove", e => { const g = TD.game(); if (g) g.hover = tileAt(e); });
  cvs.addEventListener("pointerleave", () => { const g = TD.game(); if (g) g.hover = null; });
  $("#td-quit").addEventListener("click", () => { const g = TD.game(); if (g && g.round > 1) saveBest(g.topicId, g.round - 1); renderHome(); });
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas(); TD.refresh(); startLoop();
  $(".tdbar").scrollIntoView({ block:"start" });
  TD.say("Pick a turret, tap an empty square to build it, then press Start round 1.");
}
/* Easy, on-the-spot questions from a topic: its easiest level, and only question types that need no paper
   (multiple choice, ordering, short typed answers). Math topics whose easy questions are mental math keep all types. */
const QUICK_ALL_TYPES = ["exponents", "decimals", "polynomials"];
function quickPool(topicId){
  const t = TOPICS[topicId], lowest = (t.levels.find(l => l.id !== "M") || t.levels[0]).id;
  const all = buildTopicQuiz(topicId, newSeed(), 120, lowest);
  const ok = QUICK_ALL_TYPES.includes(topicId) ? all : all.filter(q => ["mc", "order", "text"].includes(q.type));
  const seen = new Set(), out = ok.filter(q => { const k = (q.promptHtml || q.prompt) + (q.exprHtml || q.tex || ""); if (seen.has(k)) return false; seen.add(k); return true; });
  return out.length >= 6 ? out : all;
}
let qid = 0;
function nextQuestions(n){
  const g = TD.game();
  if (g.qSource === "quick") {
    const lvl = g.round <= 10 ? "1" : g.round <= 20 ? "2" : "3";
    return buildTopicQuiz("quick-math", newSeed(), n, lvl).map(q => Object.assign(q, { id:++qid }));
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    if (qPtr >= qPool.length) { qPool = quickPool(g.topicId); qPtr = 0; }
    out.push(Object.assign(qPool[qPtr++], { id:++qid }));
  }
  return out;
}

/* ---------- canvas ---------- */
function sizeCanvas(){
  if (!cvs) return;
  const w = cvs.parentElement.clientWidth, tile = w / TD.COLS, dpr = window.devicePixelRatio || 1;
  cvs.width = Math.round(w * dpr); cvs.height = Math.round(tile * TD.ROWS * dpr); cvs.style.height = tile * TD.ROWS + "px";
  cvs._tile = tile; cvs._dpr = dpr;
}
function tileAt(e){
  const r = cvs.getBoundingClientRect(), tile = r.width / TD.COLS;
  const x = Math.floor((e.clientX - r.left) / tile), y = Math.floor((e.clientY - r.top) / tile);
  return x >= 0 && y >= 0 && x < TD.COLS && y < TD.ROWS ? [x, y] : null;
}
function readColors(){
  const cs = getComputedStyle(document.documentElement), v = n => cs.getPropertyValue(n).trim();
  colors = { paper:v("--paper"), grid:v("--grid"), card:v("--card"), line:v("--line"), ink:v("--ink"), muted:v("--muted"), blue:v("--blue"), teal:v("--teal"), red:v("--red"), good:v("--good"), hi:v("--hi"), blueSoft:v("--blue-soft") };
}
const PAL = { grass1:"#8fd46b", grass2:"#86cb62", sand:"#f4d9a0", sandEdge:"#d9b273", pebble:"#e3c084", tree:"#3c9a3f", treeHi:"#59b85a", trunk:"#8a5a2b",
  rock:"#bdb7aa", rockHi:"#d8d3c8", pond:"#6cc7f2", pondHi:"#a6e1fb", flowerA:"#ff7eb6", flowerB:"#ffd84d", flowerC:"#ffffff", base:"#eef2f8", baseEdge:"#8a97ab", ink:"#1d2433" };
const TIER_COLORS = [null, "#35c46a", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];
const TIER_DARK = [null, "#1f8a47", "#2559b8", "#7a35b8", "#b9740a", "#b42323"];
function hash(x, y, s){ let h = (x * 374761393 + y * 668265263 + s * 974634821) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) % 1000; }
function decorFor(path, mapKey){
  const s = mapKey.length * 7 + mapKey.charCodeAt(0), out = [];
  for (let x = 0; x < TD.COLS; x++) for (let y = 0; y < TD.ROWS; y++) {
    if (path.tiles.has(x + "," + y)) continue;
    const v = hash(x, y, s);
    if (v < 75) out.push({ x, y, k:"tree" }); else if (v < 135) out.push({ x, y, k:"flowers", v }); else if (v < 160) out.push({ x, y, k:"rock" }); else if (v < 172) out.push({ x, y, k:"pond" });
  }
  return out;
}
function roundRect(x, X0, Y0, w, h, r){ x.beginPath(); x.moveTo(X0 + r, Y0); x.arcTo(X0 + w, Y0, X0 + w, Y0 + h, r); x.arcTo(X0 + w, Y0 + h, X0, Y0 + h, r); x.arcTo(X0, Y0 + h, X0, Y0, r); x.arcTo(X0, Y0, X0 + w, Y0, r); x.closePath(); }
const circle = (x, cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); };
function drawDecor(x, d){
  const cx = d.x + 0.5, cy = d.y + 0.5;
  if (d.k === "tree") { x.fillStyle = "rgba(0,0,0,.12)"; circle(x, cx + 0.06, cy + 0.12, 0.34); x.fill(); x.fillStyle = PAL.trunk; x.fillRect(cx - 0.05, cy + 0.05, 0.1, 0.3); x.fillStyle = PAL.tree; circle(x, cx, cy - 0.04, 0.32); x.fill(); x.fillStyle = PAL.treeHi; circle(x, cx - 0.1, cy - 0.14, 0.13); x.fill(); }
  if (d.k === "flowers") { [[-0.22, -0.15, PAL.flowerA], [0.18, 0.05, PAL.flowerB], [-0.05, 0.22, PAL.flowerC], [0.24, -0.24, d.v % 2 ? PAL.flowerA : PAL.flowerB]].forEach(([dx, dy, c]) => { x.fillStyle = c; circle(x, cx + dx, cy + dy, 0.07); x.fill(); x.fillStyle = "#f59e0b"; circle(x, cx + dx, cy + dy, 0.025); x.fill(); }); }
  if (d.k === "rock") { x.fillStyle = PAL.rock; x.beginPath(); x.ellipse(cx, cy + 0.08, 0.3, 0.2, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = PAL.rockHi; x.beginPath(); x.ellipse(cx - 0.08, cy + 0.02, 0.12, 0.07, 0, 0, Math.PI * 2); x.fill(); }
  if (d.k === "pond") { x.fillStyle = PAL.pond; x.beginPath(); x.ellipse(cx, cy, 0.42, 0.3, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = PAL.pondHi; x.beginPath(); x.ellipse(cx - 0.12, cy - 0.08, 0.14, 0.05, 0, 0, Math.PI * 2); x.fill(); }
}
function drawTurret(x, t, g){
  const T = TD.TURRETS[t.type], cx = t.x + 0.5, cy = t.y + 0.5, col = T.color, time = g.time || 0;
  x.fillStyle = "rgba(0,0,0,.15)"; roundRect(x, t.x + 0.12, t.y + 0.16, 0.8, 0.8, 0.16); x.fill();
  x.fillStyle = PAL.base; x.strokeStyle = PAL.baseEdge; x.lineWidth = 0.04; roundRect(x, t.x + 0.08, t.y + 0.08, 0.84, 0.84, 0.16); x.fill(); x.stroke();
  const rec = (t.recoil || 0) * 0.6;
  x.save(); x.translate(cx, cy);
  if (T.kind !== "frost" && T.kind !== "tesla") x.rotate(t.angle || 0);
  x.fillStyle = PAL.ink;
  if (t.type === "blaster") x.fillRect(0.05 - rec, -0.08, 0.42, 0.16);
  if (t.type === "rapid") { x.fillRect(0.05 - rec, -0.15, 0.42, 0.1); x.fillRect(0.05 - rec, 0.05, 0.42, 0.1); }
  if (t.type === "cannon") x.fillRect(0.05 - rec, -0.12, 0.46, 0.24);
  if (t.type === "water") { x.fillStyle = "#0c6fb3"; x.fillRect(0.05 - rec, -0.07, 0.44, 0.14); x.fillStyle = "#7dd3fc"; x.fillRect(0.42 - rec, -0.1, 0.08, 0.2); }
  if (t.type === "laser") { x.fillStyle = "#6b1a78"; x.fillRect(0.05, -0.05, 0.48, 0.1); x.fillStyle = "#ffd6ff"; circle(x, 0.52, 0, 0.05); x.fill(); }
  // head
  x.fillStyle = col;
  if (t.type === "cannon") { roundRect(x, -0.27, -0.27, 0.54, 0.54, 0.1); x.fill(); }
  else { circle(x, 0, 0, t.type === "frost" || t.type === "tesla" ? 0.3 : 0.26); x.fill(); }
  x.fillStyle = "rgba(255,255,255,.45)"; circle(x, -0.08, -0.08, 0.08); x.fill();
  if (t.type === "frost") {
    x.rotate(time * 0.8); x.strokeStyle = "#ffffff"; x.lineWidth = 0.045; x.lineCap = "round";
    for (let i = 0; i < 3; i++) { x.rotate(Math.PI / 3); x.beginPath(); x.moveTo(-0.2, 0); x.lineTo(0.2, 0); x.stroke(); }
  }
  if (t.type === "tesla") {
    x.strokeStyle = "#7a4a00"; x.lineWidth = 0.04; for (let i = -1; i <= 1; i++) { x.beginPath(); x.ellipse(0, i * 0.09, 0.2, 0.05, 0, 0, Math.PI * 2); x.stroke(); }
    x.fillStyle = (Math.sin(time * 10) > 0) ? "#fff7c2" : "#ffe066"; circle(x, 0, -0.26, 0.08); x.fill();
  }
  if (t.type === "water") { x.fillStyle = "#ffffff"; x.beginPath(); x.moveTo(0, -0.13); x.quadraticCurveTo(0.1, 0.02, 0, 0.1); x.quadraticCurveTo(-0.1, 0.02, 0, -0.13); x.fill(); }
  x.restore();
  for (let i = 0; i < t.level; i++) { x.fillStyle = "#ffcc1f"; x.strokeStyle = "#b8860b"; x.lineWidth = 0.02; circle(x, t.x + 0.28 + i * 0.22, t.y + 0.86, 0.065); x.fill(); x.stroke(); }
}
function drawBlock(x, g, b){
  const [bx, by] = TD.posAt(g.path, b.d), s = 0.3 + b.tier * 0.035, bob = Math.sin((g.time || 0) * 8 + b.wob) * 0.03;
  const y0 = by + bob;
  x.fillStyle = "rgba(0,0,0,.18)"; x.beginPath(); x.ellipse(bx, by + s + 0.04, s * 0.9, 0.08, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = TIER_DARK[b.tier]; roundRect(x, bx - s, y0 - s + 0.06, s * 2, s * 2, 0.12); x.fill();
  x.fillStyle = TIER_COLORS[b.tier]; roundRect(x, bx - s, y0 - s, s * 2, s * 2 - 0.04, 0.12); x.fill();
  x.fillStyle = "rgba(255,255,255,.35)"; roundRect(x, bx - s + 0.06, y0 - s + 0.05, s * 0.9, 0.1, 0.05); x.fill();
  // eyes look along the path
  const ahead = TD.posAt(g.path, Math.min(g.path.total, b.d + 0.3)), lx = Math.sign(ahead[0] - bx) * 0.035, ly = Math.sign(ahead[1] - by) * 0.035;
  [-1, 1].forEach(side => { x.fillStyle = "#ffffff"; circle(x, bx + side * s * 0.38, y0 - s * 0.12, s * 0.24); x.fill(); x.fillStyle = PAL.ink; circle(x, bx + side * s * 0.38 + lx, y0 - s * 0.12 + ly, s * 0.11); x.fill(); });
  x.fillStyle = "rgba(255,255,255,.9)"; x.font = "bold " + (s * 0.75).toFixed(2) + "px system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(b.tier), bx, y0 + s * 0.45);
  if (b.slow > 0) { x.fillStyle = "rgba(125,211,252,.42)"; roundRect(x, bx - s, y0 - s, s * 2, s * 2, 0.12); x.fill(); x.fillStyle = "#e0f7ff"; circle(x, bx + s * 0.7, y0 - s * 0.8, 0.06); x.fill(); }
  if (b.hitT > 0) { x.fillStyle = "rgba(255,255,255," + (b.hitT * 4) + ")"; roundRect(x, bx - s, y0 - s, s * 2, s * 2, 0.12); x.fill(); }
  x.fillStyle = "rgba(0,0,0,.3)"; roundRect(x, bx - s, y0 - s - 0.2, s * 2, 0.09, 0.04); x.fill();
  x.fillStyle = b.hp / b.max > 0.5 ? "#22c55e" : b.hp / b.max > 0.25 ? "#facc15" : "#ef4444"; roundRect(x, bx - s, y0 - s - 0.2, Math.max(0.02, s * 2 * Math.max(0, b.hp / b.max)), 0.09, 0.04); x.fill();
}
function drawBoard(x, g, thumb){
  for (let i = 0; i < TD.COLS; i++) for (let j = 0; j < TD.ROWS; j++) { x.fillStyle = (i + j) % 2 ? PAL.grass1 : PAL.grass2; x.fillRect(i, j, 1, 1); }
  if (!g.decor || g.decorKey !== (g.mapId || mapId)) { g.decorKey = g.mapId || mapId; g.decor = decorFor(g.path, g.decorKey); }
  g.decor.forEach(d => { if (!g.turrets || !g.turrets.some(t => t.x === d.x && t.y === d.y)) drawDecor(x, d); });
  // path: sand with an edge and pebbles
  x.lineCap = "round"; x.lineJoin = "round";
  const trace = () => { x.beginPath(); g.path.pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); };
  trace(); x.strokeStyle = PAL.sandEdge; x.lineWidth = 0.96; x.stroke();
  trace(); x.strokeStyle = PAL.sand; x.lineWidth = 0.8; x.stroke();
  for (let d = 0.4; d < g.path.total; d += 0.7) { const [px, py] = TD.posAt(g.path, d), v = hash(Math.round(d * 10), 3, 9); x.fillStyle = PAL.pebble; circle(x, px + (v % 7 - 3) * 0.06, py + (v % 5 - 2) * 0.07, 0.04 + (v % 3) * 0.012); x.fill(); }
  // start portal and goal gate
  const st = g.path.pts[1], en = g.path.pts[g.path.pts.length - 1], spin = (g.time || 0) * 3;
  x.fillStyle = "#4f46e5"; circle(x, 0.25, st[1], 0.38); x.fill(); x.strokeStyle = "#a5b4fc"; x.lineWidth = 0.07; x.beginPath(); x.arc(0.25, st[1], 0.24, spin, spin + 4); x.stroke();
  for (let k = 0; k < 4; k++) { x.fillStyle = k % 2 ? "#ffffff" : "#ef4444"; x.fillRect(TD.COLS - 0.3, en[1] - 0.5 + k * 0.25, 0.3, 0.25); }
  if (thumb) return;
  // hover preview
  if (g.hover && g.phase !== "quiz" && g.phase !== "over") {
    const [hx, hy] = g.hover, ok = TD.canPlace(hx, hy), T = TD.TURRETS[g.selected];
    if (ok) {
      x.fillStyle = g.money >= T.cost ? "rgba(255,255,255,.35)" : "rgba(239,68,68,.3)"; roundRect(x, hx + 0.05, hy + 0.05, 0.9, 0.9, 0.14); x.fill();
      x.fillStyle = "rgba(255,255,255,.18)"; x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 0.04; x.setLineDash([0.15, 0.12]);
      circle(x, hx + 0.5, hy + 0.5, T.range); x.fill(); x.stroke(); x.setLineDash([]);
    }
  }
  // ground effects
  for (const f of g.fx) {
    const a = Math.max(0, f.t / f.life);
    if (f.kind === "splash") { x.fillStyle = "rgba(56,189,248," + (0.35 * a) + ")"; circle(x, f.x, f.y, f.r * (1.1 - a * 0.4)); x.fill(); x.strokeStyle = "rgba(255,255,255," + a + ")"; x.lineWidth = 0.05; x.stroke(); }
    if (f.kind === "frost") { x.fillStyle = "rgba(186,230,253," + (0.45 * a) + ")"; circle(x, f.x, f.y, f.r * (1.05 - a * 0.5)); x.fill(); x.strokeStyle = "rgba(255,255,255," + a + ")"; x.lineWidth = 0.05; x.stroke(); }
    if (f.kind === "boom") { x.fillStyle = "rgba(251,146,60," + (0.4 * a) + ")"; circle(x, f.x, f.y, f.r * (1.2 - a * 0.5)); x.fill(); }
  }
  // turrets
  for (const t of g.turrets) {
    if (g.picked === t) { x.fillStyle = "rgba(255,255,255,.2)"; x.strokeStyle = "#ffffff"; x.lineWidth = 0.05; circle(x, t.x + 0.5, t.y + 0.5, TD.stat(t, "range")); x.fill(); x.stroke(); }
    drawTurret(x, t, g);
  }
  // blocks
  for (const b of g.blocks) drawBlock(x, g, b);
  // laser beams
  for (const t of g.turrets) if (t.beam && t.beam.alive) {
    const [bx, by] = TD.posAt(g.path, t.beam.d), w = 0.12 + 0.08 * (t.heat || 0);
    x.lineCap = "round";
    x.strokeStyle = "rgba(217,70,239,.35)"; x.lineWidth = w * 2.2; x.beginPath(); x.moveTo(t.x + 0.5, t.y + 0.5); x.lineTo(bx, by); x.stroke();
    x.strokeStyle = "#f5b8ff"; x.lineWidth = w * 0.6; x.stroke();
  }
  // bullets
  for (const u of g.bullets) {
    if (u.kind === "water") {
      const done = Math.hypot(u.x - u.sx, u.y - u.sy), left = Math.hypot(u.tx - u.x, u.ty - u.y), p = done / Math.max(0.01, done + left), h = Math.sin(p * Math.PI) * 0.7;
      x.fillStyle = "rgba(0,0,0,.15)"; circle(x, u.x, u.y, 0.08); x.fill();
      x.fillStyle = "#38bdf8"; circle(x, u.x, u.y - h, 0.14); x.fill(); x.fillStyle = "#e0f7ff"; circle(x, u.x - 0.04, u.y - h - 0.04, 0.05); x.fill();
    } else { x.fillStyle = TD.TURRETS[u.type].color; circle(x, u.x, u.y, u.type === "cannon" ? 0.13 : 0.08); x.fill(); x.fillStyle = "#ffffff"; circle(x, u.x - 0.02, u.y - 0.02, 0.03); x.fill(); }
  }
  // air effects
  for (const f of g.fx) {
    const a = Math.max(0, f.t / f.life);
    x.globalAlpha = a;
    if (f.kind === "zap") {
      x.strokeStyle = "#ffe066"; x.lineWidth = 0.09; x.lineJoin = "miter"; x.beginPath();
      f.pts.forEach(([px, py], i) => { if (!i) { x.moveTo(px, py); return; } const [qx, qy] = f.pts[i - 1]; for (let k = 1; k <= 4; k++) { const m = k / 4, jit = k < 4 ? (hash(i * 7 + k, Math.round(f.t * 60), 5) / 1000 - 0.5) * 0.35 : 0; x.lineTo(qx + (px - qx) * m + jit, qy + (py - qy) * m - jit); } });
      x.stroke(); x.strokeStyle = "#ffffff"; x.lineWidth = 0.03; x.stroke();
    }
    if (f.kind === "drop") { x.fillStyle = "#7dd3fc"; circle(x, f.x, f.y, 0.06); x.fill(); }
    if (f.kind === "spark") { x.fillStyle = TIER_COLORS[f.tier]; x.fillRect(f.x - 0.07, f.y - 0.07, 0.14, 0.14); }
    if (f.kind === "build") { x.strokeStyle = "#ffcc1f"; x.lineWidth = 0.07; circle(x, f.x, f.y, 0.55 * (1.3 - a)); x.stroke(); }
    if (f.kind === "coin") { x.fillStyle = "#ffffff"; x.strokeStyle = "#166534"; x.lineWidth = 0.06; x.font = "bold 0.36px system-ui, sans-serif"; x.textAlign = "center"; x.strokeText(f.text, f.x, f.y); x.fillText(f.text, f.x, f.y); }
    x.globalAlpha = 1;
  }
  if (TD.flashT() > 0) { x.fillStyle = "rgba(239,68,68," + (TD.flashT() * 0.6) + ")"; x.fillRect(0, 0, TD.COLS, TD.ROWS); }
  if (g.phase === "over") { x.fillStyle = "rgba(15,23,42,.55)"; x.fillRect(0, 0, TD.COLS, TD.ROWS); x.fillStyle = "#ffffff"; x.font = "bold 1px system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("Game over", TD.COLS / 2, TD.ROWS / 2); }
}
function frame(ts){
  raf = 0;
  if (!cvs || !document.body.contains(cvs) || $("#panel-games").hidden) return;
  const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0); last = ts;
  TD.step(dt); TD.decayFlash(dt);
  colorAge += dt; if (colorAge > 1) { readColors(); colorAge = 0; }
  const g = TD.game();
  ctx.setTransform(cvs._dpr * cvs._tile, 0, 0, cvs._dpr * cvs._tile, 0, 0);
  drawBoard(ctx, g, false);
  hud();
  raf = requestAnimationFrame(frame);
}
function startLoop(){ if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
function stopLoop(){ if (raf) cancelAnimationFrame(raf); raf = 0; }

/* ---------- HUD, shop, controls ---------- */
let hudSig = "";
function hud(){
  const g = TD.game(); if (!g) return;
  const sig = [g.health, g.money, g.round, g.phase, g.blocks.length, g.spawn ? g.spawn.list.length : 0].join("|");
  if (sig === hudSig) return; hudSig = sig;
  const left = g.phase === "wave" ? g.blocks.length + (g.spawn ? g.spawn.list.length : 0) : 0;
  $("#td-hud").innerHTML =
    '<div class="hchip"><span>Health</span><b>' + g.health + " / " + TD.START_HEALTH + '</b><i class="hbar"><i style="width:' + (g.health / TD.START_HEALTH * 100) + '%"></i></i></div>' +
    '<div class="hchip"><span>Money</span><b>$' + g.money + "</b></div>" +
    '<div class="hchip"><span>Round</span><b>' + Math.max(1, g.round + (g.phase === "build" ? 1 : 0)) + "</b></div>" +
    (g.phase === "wave" ? '<div class="hchip"><span>Blocks left</span><b>' + left + "</b></div>" : "");
  if (g.phase === "build" || g.phase === "wave") updateShop();
}
function shopHtml(){
  const g = TD.game();
  return '<div class="shop" role="radiogroup" aria-label="Turrets">' + Object.entries(TD.TURRETS).map(([id, T]) =>
    '<button type="button" class="tbuy t-' + id + '" data-buy="' + id + '" aria-pressed="' + (g.selected === id) + '"><i class="ticon" style="--tc:' + T.color + '"></i><span class="tinfo"><span class="trow"><b>' + T.name + '</b><span class="cost">$' + T.cost + '</span></span><span class="small muted">' + T.desc + "</span></span></button>").join("") + "</div>";
}
function updateShop(){
  const g = TD.game();
  $$("[data-buy]").forEach(b => { b.disabled = g.money < TD.TURRETS[b.dataset.buy].cost; b.setAttribute("aria-pressed", String(g.selected === b.dataset.buy)); });
  const up = $("#td-up"); if (up && g.picked) up.disabled = g.picked.level >= 3 || g.money < TD.upgradeCost(g.picked);
}
TD.say = msg => { const el = $("#td-say"); if (el) el.textContent = msg; };
TD.refresh = () => {
  const g = TD.game(); if (!g) return;
  hudSig = "";
  if (g.phase === "quiz" || g.phase === "over") return;
  const p = g.picked;
  $("#td-panel").innerHTML = shopHtml() +
    (p ? '<div class="picked"><b>' + TD.TURRETS[p.type].name + " · level " + p.level + "</b>" +
      '<button class="btn small" type="button" id="td-up"' + (p.level >= 3 ? " disabled" : "") + ">" + (p.level >= 3 ? "Max level" : "Upgrade $" + TD.upgradeCost(p)) + "</button>" +
      '<button class="btn quiet small" type="button" id="td-sell">Sell for $' + TD.sellValue(p) + "</button></div>" : "") +
    '<div class="btnrow">' + (g.phase === "build" ? '<button class="btn" type="button" id="td-start">Start round ' + (g.round + 1) + "</button>"
      : '<button class="btn quiet" type="button" id="td-pause">' + (g.paused ? "Resume" : "Pause") + '</button><button class="btn quiet" type="button" id="td-speed">Speed ' + (g.speed === 1 ? "2×" : "1×") + "</button>") + "</div>";
  $$("[data-buy]").forEach(b => b.addEventListener("click", () => { g.selected = b.dataset.buy; g.picked = null; TD.refresh(); }));
  const on = (id, fn) => { const el = $(id); if (el) el.addEventListener("click", fn); };
  on("#td-up", TD.upgrade); on("#td-sell", TD.sell);
  on("#td-start", () => { TD.startRound(); TD.say("Round " + g.round + ": stop the blocks! Tap a turret to upgrade or sell it."); TD.refresh(); });
  on("#td-pause", () => { g.paused = !g.paused; TD.refresh(); });
  on("#td-speed", () => { g.speed = g.speed === 1 ? 2 : 1; TD.refresh(); });
  updateShop();
};

/* ---------- question break ---------- */
TD.onRoundEnd = () => {
  const g = TD.game(); g.picked = null; g.qSet = nextQuestions(TD.questionsAfter(g.round)); g.qStep = 0;
  TD.say("");
  showQuestion();
};
function showQuestion(){
  const g = TD.game(), q = g.qSet[g.qStep], panel = $("#td-panel");
  const head = '<div class="verdict ok roundend"><h3>Round ' + g.round + " complete</h3><p>" +
    (g.roundLeak ? "Blocks that got through cost you " + g.roundLeak + " health. " : "No block got through. ") +
    "You earned $" + g.roundEarned + ". " + (g.qSet.length === 1 ? "Answer 1 question" : "Answer " + g.qSet.length + " questions") + " to unlock round " + (g.round + 1) + (g.qSet.length === 1 ? ": a correct answer adds $" : ": each correct answer adds $") + TD.QUESTION_BONUS + "." +
    (g.round === TD.EASY_ROUNDS ? " From now on the rounds get tougher, and you answer " + TD.QUESTIONS_PER_BREAK + " questions after each one." : "") + "</p></div>";
  clearMath(panel);
  panel.innerHTML = (g.qStep === 0 ? head : "") +
    '<article class="sheet" id="td-q">' + qHeadHtml(q, g.qSet.length === 1 ? "Question" : "Question " + (g.qStep + 1) + " of " + g.qSet.length) + questionHtml(q, "g") +
    '<p class="small redtxt" id="td-qerr" role="alert" hidden></p>' +
    '<div class="btnrow" id="td-qact"><button class="btn" type="button" id="td-check">Check answer</button></div>' +
    '<div id="td-qfb" class="stack"></div></article>';
  const card = $("#td-q");
  bindQuestion(q, card, "g");
  $("#td-check").addEventListener("click", () => checkQ(q));
  $$("input", card).forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (!$("#td-qact").hidden) checkQ(q); } }));
  typeset(panel);
  const f = $("input", card); if (f && q.type !== "mc") f.focus({ preventScroll:true });
  card.scrollIntoView({ block:"nearest", behavior:"smooth" });
}
function checkQ(q){
  const g = TD.game(), card = $("#td-q"), rec = readAnswer(q, card, "g");
  if (!rec) { const e = $("#td-qerr"); e.hidden = false; e.textContent = MISSING_MSG(q); return; }
  rec.correct = grade(q, rec);
  g.qAsked++; if (rec.correct) { g.qRight++; g.money += TD.QUESTION_BONUS; }
  lockAnswer(q, card, "g", rec);
  $("#td-qact").hidden = true; $("#td-qerr").hidden = true;
  const last = g.qStep >= g.qSet.length - 1;
  const fb = $("#td-qfb");
  fb.innerHTML = feedbackHtml(q, rec, { headline: rec.correct ? "Correct! +$" + TD.QUESTION_BONUS : "Not quite · no bonus this time", lessonButton:false }) +
    '<div class="btnrow"><button class="btn" type="button" id="td-next">' + (last ? "Back to the battlefield" : "Next question") + "</button></div>";
  typeset(fb);
  $("#td-next").addEventListener("click", () => {
    if (!last) { g.qStep++; showQuestion(); return; }
    g.phase = "build"; TD.refresh();
    TD.say("Round " + (g.round + 1) + " will bring more blocks. Build or upgrade turrets, then press Start.");
    $("#td-canvas").scrollIntoView({ block:"nearest", behavior:"smooth" });
  });
}

/* ---------- game over ---------- */
TD.onOver = () => {
  const g = TD.game(), reached = g.round, isBest = saveBest(g.topicId, reached);
  TD.say("");
  $("#td-panel").innerHTML = '<div class="sheet center"><span class="eyebrow">Game over</span><h2>You reached round ' + reached + "</h2>" +
    (isBest ? '<p class="pen">New best score for this topic!</p>' : '<p class="muted">Your best for this topic: round ' + best()[g.topicId] + ".</p>") +
    '<div class="hud"><div class="hchip"><span>Blocks destroyed</span><b>' + g.kills + '</b></div><div class="hchip"><span>Questions right</span><b>' + g.qRight + " / " + g.qAsked + "</b></div></div>" +
    '<div class="btnrow"><button class="btn" type="button" id="td-again">Play again</button><button class="btn quiet" type="button" id="td-home">Choose another map</button></div></div>';
  $("#td-again").addEventListener("click", () => startGame());
  $("#td-home").addEventListener("click", renderHome);
};

const tagBusy = () => window.TagUI && (window.TagUI.active() || window.TagUI.wants());
window.Games = {
  home: renderHome, setPlaying, quickPool,
  onHide(){ setPlaying(false); if (window.TagUI) window.TagUI.onHide(); },
  onShow(){
    if (tagBusy()) { window.TagUI.onShow(); return; }
    if (cvs && document.body.contains(cvs)) setPlaying(true);
    if (TD.game() && cvs && document.body.contains(cvs) && TD.game().phase !== "over") { sizeCanvas(); startLoop(); } else if (!cvs || !document.body.contains(cvs)) renderHome();
  },
  topicChanged(){ if (!$("#panel-games").hidden && !(window.TagUI && window.TagUI.active()) && (!cvs || !document.body.contains(cvs))) renderHome(); }
};
if (!$("#panel-games").hidden) window.Games.onShow();
})();
