/* ===== Games tab: mode picker + Tower Defense screen (drawing, shop, question breaks) ===== */
(function(){
const BEST_KEY = "mahoot-td-best";
const TIER_COLORS = [null, "#2fb55a", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];
const root = () => $("#games-root");
let mapId = "zigzag", cvs = null, ctx = null, raf = 0, last = 0, colors = {}, colorAge = 99, qPool = [], qPtr = 0, lvlUsed = null;

function best(){ try { return JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch(e) { return {}; } }
function saveBest(topicId, round){ const b = best(); if (!b[topicId] || round > b[topicId]) { b[topicId] = round; try { localStorage.setItem(BEST_KEY, JSON.stringify(b)); } catch(e) {} return true; } return false; }
const curTopic = () => TOPICS[window.ExpLab ? window.ExpLab.currentTopic() : "exponents"];

/* ---------- home: pick a game ---------- */
function renderHome(){
  stopLoop();
  const t = curTopic(), b = best()[t.id];
  root().innerHTML =
    '<div class="stack"><h2>Games</h2><p class="muted">Play a game with questions from <b>' + esc(topicLabel(t)) + '</b>. Change the topic on the Start tab.</p></div>' +
    '<div class="sheet gamecard"><div class="gamehead"><div><span class="eyebrow">Game mode</span><h3>Tower Defense</h3></div>' + (b ? '<span class="tag">Your best: round ' + b + "</span>" : "") + "</div>" +
      '<p>Colored blocks march along a path. Spend your money on turrets to stop them. Every block that gets through costs you health. After each round, answer ' + TD.QUESTIONS_PER_BREAK + " questions: each correct answer earns $" + TD.QUESTION_BONUS + " for more turrets.</p>" +
      '<div class="field"><span>Map</span><div class="seg" id="td-maps">' + Object.entries(TD.MAPS).map(([id, m]) => '<label><input type="radio" name="td-map" value="' + id + '"' + (id === mapId ? " checked" : "") + ">" + m.name + "</label>").join("") + "</div></div>" +
      '<div class="tdthumb"><canvas id="td-thumb" aria-hidden="true"></canvas></div>' +
      '<div class="btnrow"><button class="btn" type="button" id="td-play">Play Tower Defense</button></div></div>' +
    '<p class="small muted">More game modes are on the way.</p>';
  $$('input[name="td-map"]').forEach(r => r.addEventListener("change", () => { mapId = r.value; drawThumb(); }));
  $("#td-play").addEventListener("click", () => startGame());
  drawThumb();
}
function drawThumb(){
  const c = $("#td-thumb"); if (!c) return;
  const w = c.clientWidth || 320, tile = w / TD.COLS, dpr = window.devicePixelRatio || 1;
  c.width = w * dpr; c.height = tile * TD.ROWS * dpr; c.style.height = tile * TD.ROWS + "px";
  const x = c.getContext("2d"); readColors();
  x.setTransform(dpr * tile, 0, 0, dpr * tile, 0, 0);
  drawBoard(x, { path:TD.buildPath(TD.MAPS[mapId]) }, true);
}

/* ---------- start / quiz pool ---------- */
function startGame(){
  const t = curTopic();
  const s = window.ExpLab && window.ExpLab.settingsFor ? window.ExpLab.settingsFor(t.id) : { lvl:t.defaultLevel };
  lvlUsed = s.lvl;
  qPool = buildTopicQuiz(t.id, newSeed(), 60, lvlUsed); qPtr = 0;
  TD.newGame(mapId, t.id);
  root().innerHTML =
    '<div class="tdbar"><span class="eyebrow">' + esc(topicLabel(t)) + " · Tower Defense · " + esc(TD.MAPS[mapId].name) + '</span><button class="btn quiet small" type="button" id="td-quit">Quit game</button></div>' +
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
  TD.say("Pick a turret, tap an empty square to build it, then press Start round 1.");
}
function nextQuestions(){
  const out = [];
  for (let i = 0; i < TD.QUESTIONS_PER_BREAK; i++) {
    if (qPtr >= qPool.length) { qPool = buildTopicQuiz(curTopicId(), newSeed(), 60, lvlUsed); qPtr = 0; }
    out.push(qPool[qPtr++]);
  }
  return out;
}
const curTopicId = () => TD.game().topicId;

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
function roundRect(x, X0, Y0, w, h, r){ x.beginPath(); x.moveTo(X0 + r, Y0); x.arcTo(X0 + w, Y0, X0 + w, Y0 + h, r); x.arcTo(X0 + w, Y0 + h, X0, Y0 + h, r); x.arcTo(X0, Y0 + h, X0, Y0, r); x.arcTo(X0, Y0, X0 + w, Y0, r); x.closePath(); }
function drawBoard(x, g, thumb){
  x.fillStyle = colors.card; x.fillRect(0, 0, TD.COLS, TD.ROWS);
  x.strokeStyle = colors.grid; x.lineWidth = 0.03;
  for (let i = 1; i < TD.COLS; i++) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, TD.ROWS); x.stroke(); }
  for (let j = 1; j < TD.ROWS; j++) { x.beginPath(); x.moveTo(0, j); x.lineTo(TD.COLS, j); x.stroke(); }
  // path
  x.lineCap = "round"; x.lineJoin = "round";
  x.strokeStyle = colors.line; x.lineWidth = 0.92; x.beginPath(); g.path.pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke();
  x.strokeStyle = colors.paper; x.lineWidth = 0.76; x.stroke();
  x.setLineDash([0.18, 0.22]); x.strokeStyle = colors.muted; x.lineWidth = 0.05; x.stroke(); x.setLineDash([]);
  // exit marker
  const end = g.path.pts[g.path.pts.length - 1];
  x.fillStyle = colors.red; x.fillRect(TD.COLS - 0.18, end[1] - 0.5, 0.18, 1);
  if (thumb) return;
  // hover preview
  if (g.hover && g.phase !== "quiz" && g.phase !== "over") {
    const [hx, hy] = g.hover, ok = TD.canPlace(hx, hy), T = TD.TURRETS[g.selected];
    if (ok) {
      x.fillStyle = g.money >= T.cost ? "rgba(46,160,90,.18)" : "rgba(220,60,50,.18)"; x.fillRect(hx, hy, 1, 1);
      x.strokeStyle = colors.muted; x.lineWidth = 0.04; x.setLineDash([0.15, 0.12]);
      x.beginPath(); x.arc(hx + 0.5, hy + 0.5, T.range, 0, Math.PI * 2); x.stroke(); x.setLineDash([]);
    }
  }
  // turrets
  for (const t of g.turrets) {
    const cx = t.x + 0.5, cy = t.y + 0.5, col = t.type === "blaster" ? colors.blue : t.type === "rapid" ? colors.teal : colors.red;
    if (g.picked === t) { x.strokeStyle = col; x.lineWidth = 0.05; x.beginPath(); x.arc(cx, cy, TD.stat(t, "range"), 0, Math.PI * 2); x.stroke(); }
    x.fillStyle = colors.paper; x.strokeStyle = col; x.lineWidth = 0.08;
    if (t.type === "cannon") { roundRect(x, t.x + 0.12, t.y + 0.12, 0.76, 0.76, 0.14); x.fill(); x.stroke(); }
    else { x.beginPath(); x.arc(cx, cy, 0.36, 0, Math.PI * 2); x.fill(); x.stroke(); }
    x.save(); x.translate(cx, cy); x.rotate(t.angle || 0); x.fillStyle = col;
    if (t.type === "rapid") { x.fillRect(0, -0.13, 0.42, 0.09); x.fillRect(0, 0.04, 0.42, 0.09); }
    else x.fillRect(0, -0.09, t.type === "cannon" ? 0.5 : 0.44, t.type === "cannon" ? 0.18 : 0.13);
    x.restore();
    x.fillStyle = col; for (let i = 0; i < t.level; i++) { x.beginPath(); x.arc(t.x + 0.3 + i * 0.2, t.y + 0.86, 0.06, 0, Math.PI * 2); x.fill(); }
  }
  // blocks
  for (const b of g.blocks) {
    const [bx, by] = TD.posAt(g.path, b.d), s = 0.34 + b.tier * 0.04;
    x.fillStyle = TIER_COLORS[b.tier]; roundRect(x, bx - s, by - s, s * 2, s * 2, 0.1); x.fill();
    x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(bx - s, by - s - 0.16, s * 2, 0.08);
    x.fillStyle = colors.good; x.fillRect(bx - s, by - s - 0.16, s * 2 * Math.max(0, b.hp / b.max), 0.08);
    x.fillStyle = "#ffffff"; x.font = "bold 0.36px system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(b.tier), bx, by + 0.02);
  }
  // bullets
  for (const u of g.bullets) { x.fillStyle = u.type === "cannon" ? colors.red : u.type === "rapid" ? colors.teal : colors.blue; x.beginPath(); x.arc(u.x, u.y, u.type === "cannon" ? 0.12 : 0.07, 0, Math.PI * 2); x.fill(); }
  // effects
  for (const f of g.fx) {
    const a = Math.max(0, f.t / f.life);
    x.globalAlpha = a;
    if (f.kind === "spark") { x.fillStyle = TIER_COLORS[f.tier]; x.fillRect(f.x - 0.06, f.y - 0.06, 0.12, 0.12); }
    if (f.kind === "boom") { x.strokeStyle = colors.red; x.lineWidth = 0.06; x.beginPath(); x.arc(f.x, f.y, f.r * (1.2 - a * 0.5), 0, Math.PI * 2); x.stroke(); }
    if (f.kind === "coin") { x.fillStyle = colors.good; x.font = "bold 0.34px system-ui, sans-serif"; x.textAlign = "center"; x.fillText(f.text, f.x, f.y); }
    x.globalAlpha = 1;
  }
  if (TD.flashT() > 0) { x.fillStyle = "rgba(220,40,40," + (TD.flashT() * 0.6) + ")"; x.fillRect(0, 0, TD.COLS, TD.ROWS); }
  if (g.phase === "over") { x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0, 0, TD.COLS, TD.ROWS); x.fillStyle = "#ffffff"; x.font = "bold 1px system-ui, sans-serif"; x.textAlign = "center"; x.fillText("Game over", TD.COLS / 2, TD.ROWS / 2); }
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
    '<button type="button" class="tbuy t-' + id + '" data-buy="' + id + '" aria-pressed="' + (g.selected === id) + '"><i class="ticon"></i><b>' + T.name + '</b><span class="cost">$' + T.cost + "</span><span class=\"small muted\">" + T.desc + "</span></button>").join("") + "</div>";
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
  const g = TD.game(); g.picked = null; g.qSet = nextQuestions(); g.qStep = 0;
  TD.say("");
  showQuestion();
};
function showQuestion(){
  const g = TD.game(), q = g.qSet[g.qStep], panel = $("#td-panel");
  const head = '<div class="verdict ok roundend"><h3>Round ' + g.round + " complete</h3><p>" +
    (g.roundLeak ? "Blocks that got through cost you " + g.roundLeak + " health. " : "No block got through. ") +
    "You earned $" + g.roundEarned + ". Answer " + TD.QUESTIONS_PER_BREAK + " questions to unlock round " + (g.round + 1) + ": each correct answer adds $" + TD.QUESTION_BONUS + ".</p></div>";
  clearMath(panel);
  panel.innerHTML = (g.qStep === 0 ? head : "") +
    '<article class="sheet" id="td-q">' + qHeadHtml(q, "Question " + (g.qStep + 1) + " of " + TD.QUESTIONS_PER_BREAK) + questionHtml(q, "g") +
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
  const last = g.qStep >= TD.QUESTIONS_PER_BREAK - 1;
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

window.Games = {
  onShow(){ if (TD.game() && cvs && document.body.contains(cvs) && TD.game().phase !== "over") { sizeCanvas(); startLoop(); } else if (!cvs || !document.body.contains(cvs)) renderHome(); },
  topicChanged(){ if (!$("#panel-games").hidden && (!cvs || !document.body.contains(cvs))) renderHome(); }
};
if (!$("#panel-games").hidden) window.Games.onShow();
})();
