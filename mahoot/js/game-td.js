/* ===== Games: Tower Defense =====
   Blocks follow a fixed path. The player buys turrets with money; turrets shoot blocks.
   A block that reaches the end costs health equal to its strength. After every round the player
   answers 3 questions from the selected topic (correct answers earn bonus money) before the next round. */
(function(){
const COLS = 16, ROWS = 10, START_HEALTH = 20, START_MONEY = 150, QUESTIONS_PER_BREAK = 3, QUESTION_BONUS = 25;
const MAPS = {
  zigzag: { name:"Zigzag", pts:[[-1,2],[4,2],[4,7],[9,7],[9,2],[13,2],[13,7],[16,7]] },
  snake:  { name:"Snake",  pts:[[-1,1],[13,1],[13,4],[2,4],[2,8],[16,8]] },
  spiral: { name:"Spiral", pts:[[-1,5],[3,5],[3,1],[8,1],[8,8],[12,8],[12,3],[16,3]] }
};
const TURRETS = {
  blaster:{ name:"Blaster", cost:50,  range:2.6, dmg:2, rate:1.3, splash:0,   bullet:9,  desc:"All-rounder" },
  rapid:  { name:"Rapid",   cost:80,  range:2.1, dmg:1, rate:4.2, splash:0,   bullet:12, desc:"Very fast, weak shots" },
  cannon: { name:"Cannon",  cost:120, range:3.1, dmg:5, rate:0.6, splash:1.1, bullet:7,  desc:"Slow, hits a whole group" }
};
const TIERS = [null,
  { hp:4,  speed:1.9, reward:3,  name:"green"  },
  { hp:9,  speed:1.8, reward:5,  name:"blue"   },
  { hp:16, speed:1.6, reward:8,  name:"purple" },
  { hp:28, speed:1.4, reward:12, name:"orange" },
  { hp:50, speed:1.1, reward:20, name:"red"    }];
const hpFor = (tier, round) => Math.round(TIERS[tier].hp * Math.pow(1.10, round - 1));
const upgradeCost = t => Math.round(TURRETS[t.type].cost * 0.75 * t.level);
const sellValue = t => Math.round(t.spent * 0.6);
const stat = (t, k) => TURRETS[t.type][k] * (k === "dmg" ? 1 + 0.6 * (t.level - 1) : k === "range" ? 1 + 0.12 * (t.level - 1) : k === "rate" ? 1 + 0.15 * (t.level - 1) : 1);

/* ---------- path geometry ---------- */
function buildPath(map){
  const pts = map.pts.map(([x, y]) => [x + 0.5, y + 0.5]);
  const segs = []; let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], len = Math.hypot(bx - ax, by - ay);
    segs.push({ ax, ay, bx, by, len, start:total }); total += len;
  }
  const tiles = new Set();
  for (let i = 0; i < map.pts.length - 1; i++) {
    let [x, y] = map.pts[i]; const [x2, y2] = map.pts[i + 1];
    const dx = Math.sign(x2 - x), dy = Math.sign(y2 - y);
    while (true) { if (x >= 0 && x < COLS && y >= 0 && y < ROWS) tiles.add(x + "," + y); if (x === x2 && y === y2) break; x += dx; y += dy; }
  }
  return { pts, segs, total, tiles };
}
function posAt(path, d){
  for (const s of path.segs) if (d <= s.start + s.len) { const f = (d - s.start) / s.len; return [s.ax + (s.bx - s.ax) * f, s.ay + (s.by - s.ay) * f]; }
  const s = path.segs[path.segs.length - 1]; return [s.bx, s.by];
}

/* ---------- rounds ---------- */
function waveFor(round){
  const count = 4 + 2 * round + Math.floor(round * round / 6);
  const maxTier = Math.min(5, 1 + Math.floor((round - 1) / 2));
  const list = [];
  for (let i = 0; i < count; i++) {
    let t = 1 + Math.floor(Math.random() * maxTier);
    if (i >= count - Math.floor(round / 3)) t = maxTier;      // the strongest blocks come last
    list.push(t);
  }
  return { list, gap: Math.max(0.32, 1.05 - 0.05 * round) };
}

/* ---------- game state ---------- */
let G = null;
function newGame(mapId, topicId){
  const map = MAPS[mapId] || MAPS.zigzag;
  G = { mapId, topicId, map, path:buildPath(map), health:START_HEALTH, money:START_MONEY, round:0,
        phase:"build", turrets:[], blocks:[], bullets:[], fx:[], spawn:null, speed:1, paused:false,
        selected:"blaster", picked:null, hover:null, kills:0, leaked:0, roundLeak:0, roundEarned:0,
        qAsked:0, qRight:0, quiz:[], qi:0, qSet:[], qStep:0 };
  return G;
}
function startRound(){
  if (!G || G.phase !== "build") return;
  G.round++; G.phase = "wave"; G.roundLeak = 0; G.roundEarned = 0;
  const w = waveFor(G.round); G.spawn = { list:w.list, gap:w.gap, timer:0.3 };
}
function step(dt){
  if (!G || G.phase !== "wave" || G.paused) return;
  dt *= G.speed;
  const sp = G.spawn;
  if (sp && sp.list.length) {
    sp.timer -= dt;
    if (sp.timer <= 0) { const tier = sp.list.shift(), T = TIERS[tier]; G.blocks.push({ d:0, hp:hpFor(tier, G.round), max:hpFor(tier, G.round), tier, speed:T.speed, alive:true }); sp.timer = sp.gap; }
  }
  for (const b of G.blocks) {
    if (!b.alive) continue;
    b.d += b.speed * dt;
    if (b.d >= G.path.total) { b.alive = false; G.health = Math.max(0, G.health - b.tier); G.leaked++; G.roundLeak += b.tier; flash(); }
  }
  for (const t of G.turrets) {
    t.cd -= dt;
    if (t.cd > 0) continue;
    const range = stat(t, "range"); let best = null;
    for (const b of G.blocks) {
      if (!b.alive) continue;
      const [bx, by] = posAt(G.path, b.d);
      if (Math.hypot(bx - (t.x + 0.5), by - (t.y + 0.5)) <= range && (!best || b.d > best.d)) best = b;
    }
    if (best) {
      const [bx, by] = posAt(G.path, best.d);
      t.angle = Math.atan2(by - (t.y + 0.5), bx - (t.x + 0.5));
      G.bullets.push({ x:t.x + 0.5, y:t.y + 0.5, target:best, tx:bx, ty:by, dmg:stat(t, "dmg"), splash:TURRETS[t.type].splash, speed:TURRETS[t.type].bullet, type:t.type });
      t.cd = 1 / stat(t, "rate");
    }
  }
  for (const u of G.bullets) {
    if (u.target.alive) { const p = posAt(G.path, u.target.d); u.tx = p[0]; u.ty = p[1]; }
    const dx = u.tx - u.x, dy = u.ty - u.y, dist = Math.hypot(dx, dy), mv = u.speed * dt;
    if (dist <= mv || dist < 0.15) {
      u.done = true;
      const hit = b => { if (!b.alive) return; b.hp -= u.dmg; if (b.hp <= 0) kill(b); };
      if (u.splash) { G.blocks.forEach(b => { if (!b.alive) return; const p = posAt(G.path, b.d); if (Math.hypot(p[0] - u.tx, p[1] - u.ty) <= u.splash) hit(b); }); G.fx.push({ kind:"boom", x:u.tx, y:u.ty, r:u.splash, t:0.3, life:0.3 }); }
      else hit(u.target);
    } else { u.x += dx / dist * mv; u.y += dy / dist * mv; }
  }
  G.bullets = G.bullets.filter(u => !u.done);
  G.blocks = G.blocks.filter(b => b.alive);
  G.fx.forEach(f => { f.t -= dt; if (f.kind === "spark") { f.x += f.vx * dt; f.y += f.vy * dt; } if (f.kind === "coin") f.y -= 0.8 * dt; });
  G.fx = G.fx.filter(f => f.t > 0);
  if (G.health <= 0) { G.phase = "over"; TD.onOver(); return; }
  if (sp && !sp.list.length && !G.blocks.length) { G.phase = "quiz"; G.money += 20 + 5 * G.round; G.roundEarned += 20 + 5 * G.round; TD.onRoundEnd(); }
}
function kill(b){
  b.alive = false; G.kills++;
  const r = TIERS[b.tier].reward; G.money += r; G.roundEarned += r;
  const [x, y] = posAt(G.path, b.d);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; G.fx.push({ kind:"spark", x, y, vx:Math.cos(a) * 2.2, vy:Math.sin(a) * 2.2, t:0.35, life:0.35, tier:b.tier }); }
  G.fx.push({ kind:"coin", x, y:y - 0.2, text:"+$" + r, t:0.8, life:0.8 });
}
let flashT = 0;
function flash(){ flashT = 0.35; }

/* ---------- player actions ---------- */
function canPlace(x, y){ return x >= 0 && y >= 0 && x < COLS && y < ROWS && !G.path.tiles.has(x + "," + y) && !G.turrets.some(t => t.x === x && t.y === y); }
function tap(x, y){
  if (!G || G.phase === "over" || G.phase === "quiz") return;
  const t = G.turrets.find(t => t.x === x && t.y === y);
  if (t) { G.picked = G.picked === t ? null : t; TD.refresh(); return; }
  G.picked = null;
  const T = TURRETS[G.selected];
  if (canPlace(x, y) && G.money >= T.cost) { G.money -= T.cost; G.turrets.push({ x, y, type:G.selected, level:1, cd:0, angle:0, spent:T.cost }); }
  else if (canPlace(x, y)) TD.say("Not enough money for a " + T.name + " ($" + T.cost + ").");
  TD.refresh();
}
function upgrade(){ const t = G && G.picked; if (!t || t.level >= 3 || G.money < upgradeCost(t)) return; G.money -= upgradeCost(t); t.spent += upgradeCost(t); t.level++; TD.refresh(); }
function sell(){ const t = G && G.picked; if (!t) return; G.money += sellValue(t); G.turrets = G.turrets.filter(x => x !== t); G.picked = null; TD.refresh(); }

window.TD = { COLS, ROWS, MAPS, TURRETS, TIERS, START_HEALTH, QUESTIONS_PER_BREAK, QUESTION_BONUS,
  newGame, buildPath, startRound, step, tap, upgrade, sell, canPlace, posAt, stat, upgradeCost, sellValue,
  game: () => G, flashT: () => flashT, decayFlash: dt => { flashT = Math.max(0, flashT - dt); },
  onOver(){}, onRoundEnd(){}, refresh(){}, say(){} };
})();
