/* ===== Games: Tower Defense =====
   Blocks follow a fixed path. The player buys turrets with money; turrets attack blocks.
   A block that reaches the end costs health equal to its strength. After every round the player
   answers questions from the selected topic (1 after each of rounds 1-10, then 3). Each question has a timer; a correct answer
   earns $10-$40, more the faster it comes
   before the next round.
   Turret kinds: "shot" (bullet), "water" (lobbed splash that soaks and slows), "frost" (slowing pulse),
   "laser" (beam that ramps up on one target), "tesla" (lightning that chains between blocks). */
(function(){
const COLS = 16, ROWS = 10, START_HEALTH = 20, START_MONEY = 150, QUESTIONS_PER_BREAK = 3, BONUS_MIN = 10, BONUS_MAX = 40, EASY_ROUNDS = 10;
/* Rounds 1-10 are short and easy: 1 question after each. From round 11 on: 3 questions. */
const questionsAfter = round => round <= EASY_ROUNDS ? 1 : QUESTIONS_PER_BREAK;
const MAPS = {
  zigzag: { name:"Zigzag", pts:[[-1,2],[4,2],[4,7],[9,7],[9,2],[13,2],[13,7],[16,7]] },
  snake:  { name:"Snake",  pts:[[-1,1],[13,1],[13,4],[2,4],[2,8],[16,8]] },
  spiral: { name:"Spiral", pts:[[-1,5],[3,5],[3,1],[8,1],[8,8],[12,8],[12,3],[16,3]] }
};
const TURRETS = {
  blaster:{ name:"Blaster",      kind:"shot",  cost:50,  range:2.6, dmg:2,   rate:1.3, splash:0,   bullet:9,  color:"#2f6fec", desc:"All-rounder" },
  rapid:  { name:"Rapid",        kind:"shot",  cost:80,  range:2.1, dmg:1,   rate:4.2, splash:0,   bullet:12, color:"#12a594", desc:"Very fast, weak shots" },
  water:  { name:"Water Cannon", kind:"water", cost:100, range:2.8, dmg:2.5, rate:0.8, splash:1.3, bullet:6,  color:"#1e9bf0", desc:"Splashes an area and soaks blocks so they slow down", slow:0.35, slowTime:1.6 },
  frost:  { name:"Frost Tower",  kind:"frost", cost:90,  range:1.9, dmg:0.6, rate:0.9, splash:0,   bullet:0,  color:"#38bdf8", desc:"Icy pulse slows every block nearby", slow:0.5, slowTime:1.3 },
  cannon: { name:"Cannon",       kind:"shot",  cost:120, range:3.1, dmg:5,   rate:0.6, splash:1.1, bullet:7,  color:"#e5484d", desc:"Slow, hits a whole group" },
  tesla:  { name:"Tesla Coil",   kind:"tesla", cost:140, range:2.4, dmg:3,   rate:0.9, splash:0,   bullet:0,  color:"#f5a700", desc:"Lightning jumps between up to 4 blocks", chain:3, chainRange:1.6 },
  laser:  { name:"Laser",        kind:"laser", cost:150, range:3.4, dmg:2.2, rate:0,   splash:0,   bullet:0,  color:"#d63ee8", desc:"Beam gets stronger the longer it locks on" }
};
const TIERS = [null,
  { hp:4,  speed:1.9, reward:3  },
  { hp:9,  speed:1.8, reward:5  },
  { hp:16, speed:1.6, reward:8  },
  { hp:28, speed:1.4, reward:12 },
  { hp:50, speed:1.1, reward:20 }];
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
  G = { mapId, topicId, map, path:buildPath(map), health:START_HEALTH, money:START_MONEY, round:0, time:0,
        phase:"build", turrets:[], blocks:[], bullets:[], fx:[], spawn:null, speed:1, paused:false,
        selected:"blaster", picked:null, hover:null, kills:0, leaked:0, roundLeak:0, roundEarned:0,
        qAsked:0, qRight:0, qSet:[], qStep:0 };
  return G;
}
function startRound(){
  if (!G || G.phase !== "build") return;
  G.round++; G.phase = "wave"; G.roundLeak = 0; G.roundEarned = 0;
  const w = waveFor(G.round); G.spawn = { list:w.list, gap:w.gap, timer:0.3 };
}
const blockPos = b => posAt(G.path, b.d);
const inRange = (t, range) => G.blocks.filter(b => { if (!b.alive) return false; const [x, y] = blockPos(b); return Math.hypot(x - (t.x + 0.5), y - (t.y + 0.5)) <= range; });
const furthest = list => list.reduce((best, b) => !best || b.d > best.d ? b : best, null);
function damage(b, amount){ if (!b.alive) return; b.hp -= amount; b.hitT = 0.12; if (b.hp <= 0) kill(b); }
function soak(b, slow, time){ if (!b.alive) return; b.slow = Math.max(b.slow, slow); b.slowUntil = Math.max(b.slowUntil, G.time + time); }

function step(dt){
  if (!G || G.phase !== "wave" || G.paused) return;
  dt *= G.speed; G.time += dt;
  const sp = G.spawn;
  if (sp && sp.list.length) {
    sp.timer -= dt;
    if (sp.timer <= 0) { const tier = sp.list.shift(), hp = hpFor(tier, G.round); G.blocks.push({ d:0, hp, max:hp, tier, speed:TIERS[tier].speed, alive:true, slow:0, slowUntil:0, hitT:0, wob:Math.random() * 6 }); sp.timer = sp.gap; }
  }
  for (const b of G.blocks) {
    if (!b.alive) continue;
    if (G.time > b.slowUntil) b.slow = 0;
    b.hitT = Math.max(0, b.hitT - dt);
    b.d += b.speed * (1 - b.slow) * dt;
    if (b.d >= G.path.total) { b.alive = false; G.health = Math.max(0, G.health - b.tier); G.leaked++; G.roundLeak += b.tier; flash(); }
  }
  for (const t of G.turrets) {
    const T = TURRETS[t.type], range = stat(t, "range");
    if (T.kind === "laser") {
      const target = furthest(inRange(t, range));
      if (!target) { t.beam = null; t.heat = 0; continue; }
      if (t.beam !== target) { t.beam = target; t.heat = 0; }
      t.heat = Math.min(2, t.heat + dt);
      const [bx, by] = blockPos(target); t.angle = Math.atan2(by - (t.y + 0.5), bx - (t.x + 0.5));
      damage(target, stat(t, "dmg") * (1 + t.heat) * dt);
      if (!target.alive) { t.beam = null; t.heat = 0; }
      continue;
    }
    t.cd -= dt;
    if (t.cd > 0) continue;
    if (T.kind === "frost") {
      const hit = inRange(t, range);
      if (!hit.length) continue;
      hit.forEach(b => { soak(b, T.slow + 0.05 * (t.level - 1), T.slowTime); damage(b, stat(t, "dmg")); });
      G.fx.push({ kind:"frost", x:t.x + 0.5, y:t.y + 0.5, r:range, t:0.45, life:0.45 });
      t.cd = 1 / stat(t, "rate"); continue;
    }
    const best = furthest(inRange(t, range));
    if (!best) continue;
    const [bx, by] = blockPos(best);
    t.angle = Math.atan2(by - (t.y + 0.5), bx - (t.x + 0.5));
    t.cd = 1 / stat(t, "rate"); t.recoil = 0.12;
    if (T.kind === "tesla") {
      const chain = [best]; let cur = best;
      for (let i = 0; i < T.chain + (t.level - 1); i++) {
        const [cx, cy] = blockPos(cur);
        const next = G.blocks.filter(b => b.alive && !chain.includes(b)).map(b => { const [x, y] = blockPos(b); return { b, dist:Math.hypot(x - cx, y - cy) }; })
          .filter(o => o.dist <= T.chainRange).sort((a, c) => a.dist - c.dist)[0];
        if (!next) break; chain.push(next.b); cur = next.b;
      }
      const pts = [[t.x + 0.5, t.y + 0.3]].concat(chain.map(blockPos));
      chain.forEach((b, i) => damage(b, stat(t, "dmg") * Math.pow(0.75, i)));
      G.fx.push({ kind:"zap", pts, t:0.18, life:0.18 });
      continue;
    }
    G.bullets.push({ x:t.x + 0.5, y:t.y + 0.5, sx:t.x + 0.5, sy:t.y + 0.5, target:best, tx:bx, ty:by, dmg:stat(t, "dmg"), splash:T.splash, speed:T.bullet, type:t.type, kind:T.kind, level:t.level });
  }
  for (const u of G.bullets) {
    if (u.target.alive) { const p = blockPos(u.target); u.tx = p[0]; u.ty = p[1]; }
    const dx = u.tx - u.x, dy = u.ty - u.y, dist = Math.hypot(dx, dy), mv = u.speed * dt;
    if (dist <= mv || dist < 0.15) {
      u.done = true;
      if (u.splash) {
        G.blocks.forEach(b => { if (!b.alive) return; const p = blockPos(b); if (Math.hypot(p[0] - u.tx, p[1] - u.ty) <= u.splash) { damage(b, u.dmg); if (u.kind === "water") soak(b, TURRETS.water.slow + 0.05 * (u.level - 1), TURRETS.water.slowTime); } });
        if (u.kind === "water") {
          G.fx.push({ kind:"splash", x:u.tx, y:u.ty, r:u.splash, t:0.5, life:0.5 });
          for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 1.8; G.fx.push({ kind:"drop", x:u.tx, y:u.ty, vx:Math.cos(a) * s, vy:Math.sin(a) * s - 1, t:0.45, life:0.45 }); }
        } else G.fx.push({ kind:"boom", x:u.tx, y:u.ty, r:u.splash, t:0.35, life:0.35 });
      } else damage(u.target, u.dmg);
    } else { u.x += dx / dist * mv; u.y += dy / dist * mv; }
  }
  G.turrets.forEach(t => { t.recoil = Math.max(0, (t.recoil || 0) - dt); });
  G.bullets = G.bullets.filter(u => !u.done);
  G.blocks = G.blocks.filter(b => b.alive);
  G.fx.forEach(f => { f.t -= dt; if (f.kind === "spark" || f.kind === "drop") { f.x += f.vx * dt; f.y += f.vy * dt; if (f.kind === "drop") f.vy += 6 * dt; } if (f.kind === "coin") f.y -= 0.8 * dt; });
  G.fx = G.fx.filter(f => f.t > 0);
  if (G.health <= 0) { G.phase = "over"; TD.onOver(); return; }
  if (sp && !sp.list.length && !G.blocks.length) { G.phase = "quiz"; G.money += 20 + 5 * G.round; G.roundEarned += 20 + 5 * G.round; G.turrets.forEach(t => { t.beam = null; t.heat = 0; }); TD.onRoundEnd(); }
}
function kill(b){
  b.alive = false; G.kills++;
  const r = TIERS[b.tier].reward; G.money += r; G.roundEarned += r;
  const [x, y] = posAt(G.path, b.d);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; G.fx.push({ kind:"spark", x, y, vx:Math.cos(a) * 2.4, vy:Math.sin(a) * 2.4, t:0.4, life:0.4, tier:b.tier }); }
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
  if (canPlace(x, y) && G.money >= T.cost) { G.money -= T.cost; G.turrets.push({ x, y, type:G.selected, level:1, cd:0, angle:0, spent:T.cost, heat:0, beam:null, recoil:0 }); G.fx.push({ kind:"build", x:x + 0.5, y:y + 0.5, t:0.4, life:0.4 }); }
  else if (canPlace(x, y)) TD.say("Not enough money for a " + T.name + " ($" + T.cost + ").");
  TD.refresh();
}
function upgrade(){ const t = G && G.picked; if (!t || t.level >= 3 || G.money < upgradeCost(t)) return; G.money -= upgradeCost(t); t.spent += upgradeCost(t); t.level++; G.fx.push({ kind:"build", x:t.x + 0.5, y:t.y + 0.5, t:0.4, life:0.4 }); TD.refresh(); }
function sell(){ const t = G && G.picked; if (!t) return; G.money += sellValue(t); G.turrets = G.turrets.filter(x => x !== t); G.picked = null; TD.refresh(); }

window.TD = { COLS, ROWS, MAPS, TURRETS, TIERS, START_HEALTH, QUESTIONS_PER_BREAK, BONUS_MIN, BONUS_MAX, EASY_ROUNDS, questionsAfter,
  newGame, buildPath, startRound, step, tap, upgrade, sell, canPlace, posAt, stat, upgradeCost, sellValue, hpFor,
  game: () => G, flashT: () => flashT, decayFlash: dt => { flashT = Math.max(0, flashT - dt); },
  onOver(){}, onRoundEnd(){}, refresh(){}, say(){} };
})();
