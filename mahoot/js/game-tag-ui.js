/* ===== Tag screens: host a room, join with a code / link / QR, lobby, play (controls, HUD, questions), results =====
   The host's browser is the referee: it picks IT, runs the bots and the clock, checks tags and Attraction.
   Every player moves their own character and sends its position about 10 times a second. */
(function(){
const T = window.TagGame, RU = T.RULES;
const ROOM_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTHS = [2, 3, 5, 8], FRESH = 10000;
const root = () => $("#games-root");
const G = () => window.Games || {};
let net = null;
let active = false, consumed = false, prefill = "", screen = "";
let role = null, code = null, unwatch = null, meta = null, players = {}, botsRec = {}, world = null, worldKey = "";
const me = { n:"", c:Math.floor(Math.random() * 6) };
let L = null, simBots = [], claimSeen = {}, attractSeen = {}, itGoneSince = 0, lastHost = 0, hb = 0, botSend = 0, rosterSig = "";
let raf = 0, tick = 0, lastFrame = 0, cvs = null, ctx = null, view = null, joy = null, lastSent = 0, lastSig = "", hudAt = 0, rankAt = 0, toast = null, endArmed = false;
const keys = {}, disp = {};
let qPool = [], qPtr = 0, qid = 0;
const now = () => net ? net.serverNow() : Date.now();
const fresh = (p, t) => p && t - (p.t || 0) < FRESH;
const fmtTime = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const secs = ms => (Math.round(ms / 100) / 10).toFixed(1) + " s";
const curTopic = () => TOPICS[window.ExpLab ? window.ExpLab.currentTopic() : "exponents"] || TOPICS.exponents;
const seasonNow = () => T.seasonFor(new Date());
const seasonLabel = s => s === "auto" ? "Auto (" + T.SEASONS[seasonNow()] + ")" : T.SEASONS[s];
async function getNet(){ net = await getSharedNet(); return net; }
function seg(name, opts, cur){
  return '<div class="seg" role="radiogroup">' + opts.map(([v, l]) => '<label><input type="radio" name="' + name + '" value="' + v + '"' + (String(v) === String(cur) ? " checked" : "") + ">" + l + "</label>").join("") + "</div>";
}

/* ---------- setup: your player, join or host ---------- */
function renderSetup(msg){
  stopLoop(); screen = "setup"; active = true; if (G().setPlaying) G().setPlaying(false);
  const demo = !window.FIREBASE_CONFIG || (net && net.mode === "local");
  try { const s = JSON.parse(localStorage.getItem("mahoot-tag-me") || "null"); if (s && !me.n) { me.n = s.n || ""; me.c = s.c || 0; } } catch(e) {}
  root().innerHTML =
    '<div class="tdbar"><h2>Tag</h2><button class="btn quiet small" type="button" id="tg-back">Back to games</button></div>' +
    '<ul class="tgrules">' +
      "<li>One random player starts as <b class=\"itword\">IT</b> and chases everyone else. Touch someone to make them IT.</li>" +
      "<li><kbd>Space</kbd> <b>Boost</b>: 10% faster for 10 s, then 10 s to recharge. <kbd>Q</kbd> <b>Invisible</b> for 5 s, once every 30 s.</li>" +
      "<li>IT is always 5% faster but can't boost or go invisible. Instead IT has <kbd>Z</kbd> <b>Attraction</b>: for 3 s every runner is pulled toward IT, with heart eyes. Once a minute.</li>" +
      "<li>Runners answer a question every 30 s and can't move while answering, so hide in a bush or under a tree first. Right answer: boost recharged. Wrong answer: dizzy for 3 s.</li>" +
      "<li>The player who spends the <b>least time as IT</b> wins. You need at least 2 players (bots count), and one of you hosts.</li></ul>" +
    (demo ? '<p class="banner"><b>Demo mode.</b> ' + esc(SHARED_NET.note || "Online games are not switched on for this site yet, so friends can only join from other tabs in this browser. You can still play against bots.") + "</p>" : "") +
    (msg ? '<p class="banner">' + esc(msg) + "</p>" : "") +
    '<div class="sheet"><h3>Your player</h3>' +
      '<label class="field"><span>Nickname</span><div class="codein"><input id="tg-name" maxlength="16" autocomplete="off" placeholder="Your name" style="text-transform:none" value="' + esc(me.n) + '"></div></label>' +
      '<div class="field"><span>Color</span><div class="swatches" role="radiogroup" aria-label="Color">' + T.COLORS.map((col, i) => '<label style="--sw:' + col + '"><input type="radio" name="tg-col" value="' + i + '"' + (i === me.c ? " checked" : "") + ' aria-label="Color ' + (i + 1) + '"><i></i></label>').join("") + "</div></div>" +
      '<p class="small redtxt" id="tg-err" role="alert" hidden></p></div>' +
    '<div class="two">' +
      '<div class="sheet"><h3>Join a game</h3><label class="field"><span>Room code</span><div class="codein"><input id="tg-code" maxlength="5" autocomplete="off" placeholder="ABCDE" value="' + esc(prefill) + '"></div></label>' +
        '<div class="btnrow"><button class="btn" type="button" id="tg-join">Join</button></div></div>' +
      '<div class="sheet"><h3>Host a game</h3><p class="small muted">You get a room code, a link and a QR code for your friends. You choose the game length, bots and season in the next step.</p>' +
        '<div class="btnrow"><button class="btn" type="button" id="tg-host">Create room</button></div></div></div>';
  $("#tg-back").addEventListener("click", () => { active = false; screen = ""; G().home(); });
  $$('input[name="tg-col"]').forEach(r => r.addEventListener("change", () => { me.c = Number(r.value); }));
  $("#tg-join").addEventListener("click", joinRoom);
  $("#tg-host").addEventListener("click", hostRoom);
  $("#tg-code").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); joinRoom(); } });
  if (prefill) $("#tg-name").focus({ preventScroll:true });
}
function readMe(){
  const n = $("#tg-name").value.trim().replace(/\s+/g, " ").slice(0, 16), err = $("#tg-err");
  if (!n) { err.hidden = false; err.textContent = "Type a nickname so the others can see who you are."; $("#tg-name").focus(); return false; }
  me.n = n; try { localStorage.setItem("mahoot-tag-me", JSON.stringify(me)); } catch(e) {}
  return true;
}
const setupErr = t => { const e = $("#tg-err"); if (e) { e.hidden = false; e.textContent = t; } };
async function hostRoom(){
  if (!readMe()) return;
  const btn = $("#tg-host"); btn.disabled = true;
  await getNet();
  let c = "", ok = false;
  try {
    for (let i = 0; i < 6 && !ok; i++) {
      c = Array.from({ length:5 }, () => ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)]).join("");
      ok = await net.tagCreate(c, { host:net.uid, state:"lobby", created:Date.now(), topic:curTopic().id, src:"quick", mins:3, bots:1, botLvl:"normal", season:"auto", seed:String(newSeed()), round:0 });
    }
  } catch(e) {
    btn.disabled = false;
    return setupErr("Could not create the room (" + (e.code || e.message) + "). If this says PERMISSION_DENIED, the site owner needs to paste the new database rules into Firebase (see README).");
  }
  if (!ok) { btn.disabled = false; return; }
  await enter(c, "host");
}
async function joinRoom(){
  if (!readMe()) return;
  const c = $("#tg-code").value.trim().toUpperCase();
  if (!/^[A-Z0-9]{5}$/.test(c)) return setupErr("The room code has 5 letters or digits. Ask your host for it.");
  $("#tg-join").disabled = true;
  await getNet();
  const m = await net.tagPeek(c);
  $("#tg-join").disabled = false;
  if (!m) return setupErr("There is no Tag game with the code " + c + ". Check the code with your host.");
  prefill = "";
  await enter(c, "player");
}
async function enter(c, r){
  role = r; code = c; players = {}; botsRec = {}; meta = null; L = null; simBots = []; claimSeen = {}; attractSeen = {}; screen = "";
  BSS.set("tag", { code:c, role:r });
  try { await net.tagJoin(c, { n:me.n, c:me.c, x:0, y:0, t:now(), g:-1 }); }
  catch(e) { role = null; code = null; BSS.del("tag"); return renderSetup("Could not join (" + (e.code || e.message) + ")."); }
  unwatch = net.watchTag(c, { meta:onMeta, player:onPlayer, bots:b => { botsRec = b || {}; } });
  if (!tick) tick = setInterval(onTick, 50);
}
function cleanup(){
  stopLoop(); if (tick) clearInterval(tick); tick = 0;
  if (unwatch) unwatch(); unwatch = null;
  BSS.del("tag"); role = null; code = null; meta = null; L = null; simBots = []; players = {}; botsRec = {}; screen = "";
  Object.keys(disp).forEach(k => delete disp[k]);
  if (G().setPlaying) G().setPlaying(false);
}
async function leave(){ const c = code; cleanup(); if (c) await net.tagLeave(c); renderSetup(); }
async function closeRoom(){ const c = code; cleanup(); if (c) await net.tagRemove(c); renderSetup(); }

/* ---------- room events ---------- */
function onMeta(m){
  if (!code) return;
  if (!m) { const wasHost = role === "host"; cleanup(); renderSetup(wasHost ? "" : "The host closed the game."); return; }
  if (role === "host" && m.host !== net.uid) { cleanup(); renderSetup(); return; }
  const prev = meta; meta = m;
  if (m.state === "play") {
    ensureWorld();
    if (!L || L.round !== m.round) initRound();
    else if (prev && prev.state === "play") {
      if ((m.tagN || 0) !== (prev.tagN || 0)) onTagged(prev, m);
      const ca = m.charm, pa = prev.charm;
      if (ca && (!pa || pa.until !== ca.until)) onAttract(ca);
    }
  }
  const sc = m.state === "play" ? "play" : m.state === "over" ? "over" : "lobby";
  if (sc !== screen || (sc === "over" && prev && prev.round !== m.round)) show(sc);
  else if (sc === "lobby") fillLobby();
}
function onPlayer(id, p){
  if (!p) { delete players[id]; delete disp[id]; }
  else players[id] = p;
  if (role === "host" && p && meta && meta.state === "play") {
    const t = now();
    if (p.kn && p.kn !== claimSeen[id]) { claimSeen[id] = p.kn; if (id === meta.it && t - (p.kt || 0) < 2000) hostClaim(id, p.k); }
    if (p.zn && p.zn !== attractSeen[id]) { attractSeen[id] = p.zn; if (id === meta.it && t - (p.zt || 0) < 2000) hostAttract(id); }
  }
  if (screen === "lobby") fillLobby();
}
function ensureWorld(){
  const key = meta.seed + "|" + meta.ssn;
  if (key !== worldKey) { world = T.makeWorld(meta.seed, meta.ssn); worldKey = key; }
}
function initRound(){
  const m = meta, t = now();
  const sp = (m.spawn && m.spawn[net.uid]) || T.freeSpot(world, Math.random, null);
  L = { round:m.round, x:sp[0], y:sp[1], dx:0, dy:1, mv:0, b:0, bReady:0, v:0, vReady:0, a:0, d:0, right:0, asked:0, kn:0, zn:0, lastClaim:0, q:null,
        nextQ:Math.max(t, m.startAt) + RU.Q_EVERY + Math.random() * 4000 };
  Object.keys(disp).forEach(k => delete disp[k]);
  qPool = []; qPtr = 0; lastSig = ""; lastSent = 0;
}
function nameOf(id){
  if (id === net.uid) return me.n;
  const r = meta && meta.roster && meta.roster[id];
  return (r && r.n) || (players[id] && players[id].n) || (botsRec[id] && botsRec[id].n) || "Someone";
}
function say(text, col, ms){ toast = { text, col, until:Date.now() + (ms || 2600) }; }
function onTagged(prev, m){
  const mine = m.it === net.uid;
  if (mine) {
    L.b = 0; L.v = 0; closeQuestion(true);
    say(m.last && m.last.by ? nameOf(m.last.by) + " tagged you! You're IT: catch someone." : "You're IT now: catch someone.", "rgba(239,68,68,.92)", 3200);
  } else if (prev.it === net.uid) {
    L.nextQ = now() + RU.Q_EVERY;
    say("You tagged " + nameOf(m.it) + "! Run!", "rgba(22,163,74,.92)");
  } else say(m.last && m.last.by ? nameOf(m.last.by) + " tagged " + nameOf(m.it) + ". " + nameOf(m.it) + " is IT!" : nameOf(m.it) + " is IT now.");
}
function onAttract(ca){
  if (ca.by === net.uid) say("Attraction! Everyone is pulled toward you for 3 s.", "rgba(219,39,119,.92)");
  else if (meta.it !== net.uid) say(nameOf(ca.by) + " used Attraction! You can't resist...", "rgba(219,39,119,.92)");
}

/* ---------- host: referee, bots, clock ---------- */
function participants(t){
  const out = [];
  for (const [id, p] of Object.entries(players)) {
    if (id === net.uid || !fresh(p, t) || p.g !== meta.round) continue;
    out.push({ id, x:p.x, y:p.y, inv:t < (p.v || 0), hid:!!T.hideAt(world, p.x, p.y) });
  }
  if (L) out.push({ id:net.uid, x:L.x, y:L.y, inv:t < L.v, hid:!!T.hideAt(world, L.x, L.y) });
  const bl = role === "host" ? simBots : Object.entries(botsRec).map(([id, b]) => Object.assign({ id }, b));
  bl.forEach(b => out.push({ id:b.id, x:b.x, y:b.y, inv:t < (b.v || 0), hid:!!T.hideAt(world, b.x, b.y), bot:true }));
  return out;
}
function hostPatch(patch){
  const next = Object.assign({}, meta);
  Object.keys(patch).forEach(k => { if (patch[k] === null) delete next[k]; else next[k] = patch[k]; });
  onMeta(next);
  net.tagMeta(code, patch);
}
function applyTag(by, who){
  const m = meta, t = now();
  if (!m || m.state !== "play" || m.it !== by || who === by || t < m.freezeUntil || t < m.startAt) return false;
  if (m.ntb && m.ntb.id === who && t < m.ntb.until) return false;
  const itTime = Object.assign({}, m.itTime || {}), tags = Object.assign({}, m.tags || {});
  itTime[by] = (itTime[by] || 0) + Math.max(0, t - Math.max(m.itSince, m.startAt));
  tags[by] = (tags[by] || 0) + 1;
  const nb = simBots.find(b => b.id === who); if (nb) { nb.b = 0; nb.v = 0; nb.a = 0; }
  const ob = simBots.find(b => b.id === by); if (ob) ob.nextQ = t + RU.Q_EVERY;
  hostPatch({ it:who, itSince:t, freezeUntil:t + RU.IT_FREEZE, ntb:{ id:by, until:t + RU.NO_TAGBACK }, itTime, tags, tagN:(m.tagN || 0) + 1, last:{ by, who }, charm:null });
  return true;
}
function hostClaim(by, target){
  const t = now(), ps = participants(t), a = ps.find(p => p.id === by), b = ps.find(p => p.id === target);
  if (a && b && Math.hypot(a.x - b.x, a.y - b.y) <= RU.TAG_DIST + 1.8) applyTag(by, target);   // generous: positions on the host are a little behind
}
function hostAttract(by){
  const m = meta, t = now();
  if (!m || m.state !== "play" || m.it !== by || t < m.startAt || t < m.freezeUntil) return false;
  if (m.charm && t < m.charm.until) return false;
  if (((m.zcd || {})[by] || 0) > t) return false;
  hostPatch({ charm:{ by, until:t + RU.ATTRACT_MS }, zcd:Object.assign({}, m.zcd || {}, { [by]:t + RU.ATTRACT_CD }) });
  return true;
}
function hostTick(t){
  const m = meta;
  if (t - hb >= 2500) { hb = t; net.tagMeta(code, { hb:t }); }
  if (m.state !== "play" || !world) { lastHost = 0; return; }
  if (t >= m.endsAt) return finish(m.endsAt);
  const people = participants(t);
  // IT left the game: pick someone else
  if (!people.some(p => p.id === m.it)) {
    if (!itGoneSince) itGoneSince = t;
    else if (t - itGoneSince > 3000 && people.length) {
      itGoneSince = 0;
      const nw = people[Math.floor(Math.random() * people.length)].id, itTime = Object.assign({}, m.itTime || {});
      itTime[m.it] = (itTime[m.it] || 0) + Math.max(0, t - Math.max(m.itSince, m.startAt));
      hostPatch({ it:nw, itSince:t, freezeUntil:t + RU.IT_FREEZE, ntb:null, itTime, tagN:(m.tagN || 0) + 1, last:{ by:null, who:nw }, charm:null });
      return;
    }
  } else itGoneSince = 0;
  // names of everyone who has played (for the results)
  const missing = people.filter(p => !(m.roster || {})[p.id]);
  if (missing.length) {
    const sig = missing.map(p => p.id).join(",");
    if (sig !== rosterSig) { rosterSig = sig; const roster = Object.assign({}, m.roster || {}); missing.forEach(p => { const src = players[p.id] || {}; roster[p.id] = { n:src.n || nameOf(p.id), c:src.c || 0 }; }); hostPatch({ roster }); }
  }
  const dt = lastHost ? Math.min(0.2, (t - lastHost) / 1000) : 0.05; lastHost = t;
  if (simBots.length) {
    T.stepBots(world, simBots, { it:m.it, freezeUntil:m.freezeUntil, ntb:m.ntb, people, lvl:m.botLvl, startAt:m.startAt, charm:m.charm,
      attractReady:((m.zcd || {})[m.it] || 0), canAttract:id => hostAttract(id) }, dt, t);
    const itBot = simBots.find(b => b.id === m.it);
    if (itBot && t >= m.freezeUntil && t >= m.startAt) {
      for (const p of people) if (p.id !== itBot.id && Math.hypot(p.x - itBot.x, p.y - itBot.y) < RU.TAG_DIST && applyTag(itBot.id, p.id)) break;
    }
    if (t - botSend >= 100) {
      botSend = t; const out = {};
      simBots.forEach(b => { out[b.id] = { n:b.n, c:b.c, x:Math.round(b.x * 100) / 100, y:Math.round(b.y * 100) / 100, h:Math.round(Math.atan2(b.dy, b.dx) * 10), m:b.mv, a:b.a, b:Math.round(b.b), v:Math.round(b.v), d:Math.round(b.d), r:b.r, q:b.q }; });
      net.tagBots(code, out);
    }
  }
}
function startGame(){
  const t = now(), m = meta;
  const humans = Object.entries(players).filter(([, p]) => fresh(p, t)).map(([id, p]) => ({ id, n:p.n, c:p.c }));
  if (!humans.some(h => h.id === net.uid)) humans.push({ id:net.uid, n:me.n, c:me.c });
  simBots = T.makeBots(m.bots || 0, humans.map(h => h.c));
  const all = humans.map(h => h.id).concat(simBots.map(b => b.id));
  if (all.length < 2) return;
  const seed = String(newSeed()), ssn = m.season === "auto" ? seasonNow() : m.season;
  world = T.makeWorld(seed, ssn); worldKey = seed + "|" + ssn;
  const it = all[Math.floor(Math.random() * all.length)], spawn = {};
  spawn[it] = T.freeSpot(world, Math.random, null);
  all.forEach(id => { if (id !== it) spawn[id] = T.freeSpot(world, Math.random, [[spawn[it][0], spawn[it][1], 12]].concat(Object.values(spawn).map(s => [s[0], s[1], 2.5]))); });
  simBots.forEach(b => { [b.x, b.y] = spawn[b.id]; b.lx = b.x; b.ly = b.y; });
  const roster = {}; humans.forEach(h => { roster[h.id] = { n:h.n, c:h.c }; }); simBots.forEach(b => { roster[b.id] = { n:b.n, c:b.c }; });
  const startAt = t + RU.COUNTDOWN;
  rosterSig = ""; itGoneSince = 0; lastHost = 0;
  hostPatch({ state:"play", round:(m.round || 0) + 1, seed, ssn, startAt, endsAt:startAt + m.mins * 60000, it, itSince:startAt, freezeUntil:startAt + RU.START_FREEZE,
    ntb:null, itTime:null, tags:null, tagN:0, last:null, spawn, roster, stats:null, charm:null, zcd:null });
}
function finish(at){
  const m = meta, t = at || now(), itTime = Object.assign({}, m.itTime || {});
  itTime[m.it] = (itTime[m.it] || 0) + Math.max(0, Math.min(t, m.endsAt) - Math.max(m.itSince, m.startAt));
  const stats = {};
  Object.entries(players).forEach(([id, p]) => { if (p.g === m.round) stats[id] = { r:p.r || 0, q:p.q || 0 }; });
  if (L) stats[net.uid] = { r:L.right, q:L.asked };
  simBots.forEach(b => { stats[b.id] = { r:b.r, q:b.q }; });
  hostPatch({ state:"over", itTime, stats, endedAt:t, charm:null });
}

/* ---------- every 50 ms: referee (host) and sending my position ---------- */
function onTick(){
  if (!meta || !code) return;
  const t = now();
  if (role === "host") hostTick(t);
  if (!meta) return;
  if (meta.state === "play" && L) {
    // a background tab has no animation frames: keep the pull and the question clock going
    if (document.hidden || $("#panel-games").hidden) stepMe(0.05, t, true);
    const sig = [L.x.toFixed(2), L.y.toFixed(2), L.mv, L.a, L.b, L.v, L.d, L.right, L.asked, Math.round(Math.atan2(L.dy, L.dx) * 10)].join("|");
    if ((sig !== lastSig && t - lastSent >= 100) || t - lastSent >= 1000) {
      lastSent = t; lastSig = sig;
      net.tagMe(code, { x:Math.round(L.x * 100) / 100, y:Math.round(L.y * 100) / 100, h:Math.round(Math.atan2(L.dy, L.dx) * 10), m:L.mv, a:L.a, b:Math.round(L.b), v:Math.round(L.v), d:Math.round(L.d), r:L.right, q:L.asked, g:L.round, t });
    }
  } else if (t - lastSent >= 2000) { lastSent = t; net.tagMe(code, { t }); }
  if (screen === "lobby" && t - rankAt > 2000) { rankAt = t; fillLobby(); }
}

/* ---------- screens ---------- */
function show(sc){
  screen = sc;
  if (sc === "lobby") renderLobby();
  if (sc === "play") renderPlay();
  if (sc === "over") renderOver();
}
const joinUrl = c => location.origin + location.pathname + "#tag-" + c;
function lobbyPeople(){
  const t = now(), out = Object.entries(players).filter(([, p]) => fresh(p, t)).map(([id, p]) => ({ id, n:p.n, c:p.c, bot:false }));
  if (!out.some(p => p.id === net.uid)) out.push({ id:net.uid, n:me.n, c:me.c });
  const used = out.map(p => p.c);
  T.makeBots(meta.bots || 0, used).forEach(b => out.push({ id:b.id, n:b.n, c:b.c, bot:true }));
  return out;
}
function renderLobby(){
  stopLoop(); if (G().setPlaying) G().setPlaying(false);
  const m = meta, url = joinUrl(code), host = role === "host", t = curTopic();
  root().innerHTML =
    '<div class="tdbar"><h2>Tag · lobby</h2><button class="btn quiet small" type="button" id="tg-leave">' + (host ? "Close room" : "Leave") + "</button></div>" +
    '<div class="sheet"><div class="joinbox"><div class="stack"><span class="eyebrow">Room code</span><div class="roomcode">' + code + "</div>" +
      "<p>Friends open this site, go to <b>Games → Tag</b> and type the code. Or they scan the QR code, or use the link:</p>" +
      '<div class="codebar"><code id="tg-link">' + esc(url) + '</code><button class="btn quiet" type="button" id="tg-copy">Copy link</button></div></div>' +
      '<div class="qr" id="tg-qr" aria-label="QR code for the join link"></div></div>' +
      '<h3>Players (<span id="tg-count">0</span>)</h3><div class="chips" id="tg-players"></div><p class="small" id="tg-need"></p></div>' +
    (host
      ? '<div class="sheet"><h3>Game settings</h3>' +
          '<div class="field"><span>How long?</span>' + seg("tg-mins", LENGTHS.map(n => [n, n + " min"]), m.mins) + "</div>" +
          '<div class="field"><span>Bots</span>' + seg("tg-bots", [0, 1, 2, 3, 4, 5, 6].map(n => [n, String(n)]), m.bots || 0) + "</div>" +
          '<div class="field"><span>Bot level</span>' + seg("tg-lvl", Object.entries(T.BOT_LVL).map(([k, v]) => [k, v.name]), m.botLvl) + "</div>" +
          '<div class="field"><span>Questions</span>' + seg("tg-src", [["quick", "Quick math"], ["topic", "Easy " + esc(t.name)]], m.src) + "</div>" +
          '<div class="field"><span>Season</span>' + seg("tg-season", [["auto", seasonLabel("auto")]].concat(Object.entries(T.SEASONS)), m.season) + "</div>" +
          '<div class="btnrow"><button class="btn" type="button" id="tg-start">Start game</button></div></div>'
      : '<div class="sheet"><h3>Waiting for the host to start</h3><p class="muted" id="tg-sum"></p></div>');
  try { if (window.QRCode) new QRCode($("#tg-qr"), { text:url, width:160, height:160, colorDark:"#000000", colorLight:"#ffffff", correctLevel:QRCode.CorrectLevel.M }); else $("#tg-qr").hidden = true; } catch(e) { $("#tg-qr").hidden = true; }
  $("#tg-copy").addEventListener("click", () => copyText(url, $("#tg-copy"), $("#tg-link")));
  $("#tg-leave").addEventListener("click", host ? closeRoom : leave);
  if (host) {
    const on = (name, key, cast) => $$('input[name="' + name + '"]').forEach(r => r.addEventListener("change", () => hostPatch({ [key]:cast(r.value), topic:curTopic().id })));
    on("tg-mins", "mins", Number); on("tg-bots", "bots", Number); on("tg-lvl", "botLvl", String); on("tg-src", "src", String); on("tg-season", "season", String);
    $("#tg-start").addEventListener("click", startGame);
  }
  fillLobby();
}
function fillLobby(){
  if (screen !== "lobby" || !meta) return;
  const ps = lobbyPeople(), el = $("#tg-players"); if (!el) return;
  el.innerHTML = ps.map(p => '<span class="pchip2' + (p.id === net.uid ? " me" : "") + '"><i class="pdot" style="background:' + T.COLORS[p.c % T.COLORS.length] + '"></i>' + esc(p.n) + (p.id === meta.host ? " (host)" : "") + "</span>").join("");
  $("#tg-count").textContent = ps.length;
  const need = $("#tg-need"), ok = ps.length >= 2;
  need.textContent = ok ? "" : role === "host" ? "You need at least 2 players. Wait for a friend to join, or add a bot." : "Waiting for more players.";
  need.className = ok ? "small" : "small redtxt";
  const st = $("#tg-start"); if (st) st.disabled = !ok;
  const sum = $("#tg-sum");
  if (sum) sum.textContent = meta.mins + " minutes · " + (meta.bots ? meta.bots + " bot" + (meta.bots > 1 ? "s" : "") + " (" + T.BOT_LVL[meta.botLvl].name + ")" : "no bots") + " · " +
    (meta.src === "topic" ? "Easy " + ((TOPICS[meta.topic] || curTopic()).name) + " questions" : "Quick math questions") + " · " + seasonLabel(meta.season);
}
function renderPlay(){
  if (G().setPlaying) G().setPlaying(true);
  endArmed = false;
  const m = meta, srcName = m.src === "topic" ? "Easy " + ((TOPICS[m.topic] || curTopic()).name) : "Quick math";
  root().innerHTML =
    '<div class="tdbar"><span class="eyebrow">Tag · room ' + code + " · " + T.SEASONS[m.ssn] + " · " + esc(srcName) + '</span><button class="btn quiet small" type="button" id="tg-quit">' + (role === "host" ? "End game" : "Leave game") + "</button></div>" +
    '<div class="hud" id="tg-hud" aria-live="off"></div>' +
    '<div class="tgwrap" id="tg-wrap"><canvas id="tg-canvas" aria-label="The park. Move with WASD or the arrow keys, or drag on the map."></canvas><div class="tgq" id="tg-q" hidden></div></div>' +
    '<div class="tgbtns">' +
      '<button class="abtn" type="button" id="tg-boost"><b>Boost</b><span class="k">Space</span><span class="st"></span><i></i></button>' +
      '<button class="abtn" type="button" id="tg-invis"><b>Invisible</b><span class="k">Q</span><span class="st"></span><i></i></button>' +
      '<button class="abtn attract" type="button" id="tg-attract"><b>Attraction</b><span class="k">Z · IT only</span><span class="st"></span><i></i></button></div>' +
    '<p class="small muted">Move with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or the arrow keys, or drag on the map with your finger. Hide in bushes and under trees: only players right next to you can spot you there.</p>' +
    '<div class="sheet"><h3>Least time as IT wins</h3><ol class="tgrank" id="tg-rank"></ol></div>';
  cvs = $("#tg-canvas"); ctx = cvs.getContext("2d");
  const pos = e => { const r = cvs.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cvs.addEventListener("pointerdown", e => { const [x, y] = pos(e); joy = { id:e.pointerId, sx:x, sy:y, cx:x, cy:y }; try { cvs.setPointerCapture(e.pointerId); } catch(x2) {} e.preventDefault(); });
  cvs.addEventListener("pointermove", e => { if (joy && joy.id === e.pointerId) { [joy.cx, joy.cy] = pos(e); } });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => cvs.addEventListener(ev, () => { joy = null; }));
  $("#tg-boost").addEventListener("click", boost);
  $("#tg-invis").addEventListener("click", invis);
  $("#tg-attract").addEventListener("click", attract);
  $("#tg-quit").addEventListener("click", () => {
    if (role !== "host") return leave();
    if (!endArmed) { endArmed = true; $("#tg-quit").textContent = "Click again to end the game"; return; }
    finish(now());
  });
  sizeCanvas(); hudAt = 0; rankAt = 0; startLoop();
  $(".tdbar").scrollIntoView({ block:"start" });
}
function ranking(m, final){
  const t = now(), ids = new Set(Object.keys(m.roster || {}));
  return Array.from(ids).map(id => {
    let it = (m.itTime || {})[id] || 0;
    if (!final && id === m.it && t > m.startAt) it += t - Math.max(m.itSince, m.startAt);
    const st = (m.stats || {})[id] || {};
    return { id, n:(m.roster[id] || {}).n || "?", c:(m.roster[id] || {}).c || 0, it, tags:(m.tags || {})[id] || 0, r:st.r || 0, q:st.q || 0, bot:/^bot\d/.test(id) };
  }).sort((a, b) => a.it - b.it || b.r - a.r || a.n.localeCompare(b.n));
}
function renderOver(){
  stopLoop(); closeQuestion(true); if (G().setPlaying) G().setPlaying(false);
  const m = meta, rows = ranking(m, true), win = rows[0], host = role === "host";
  const mine = rows.findIndex(r => r.id === net.uid);
  root().innerHTML = '<div class="sheet center"><span class="eyebrow">Game over</span>' +
    "<h2>" + (win ? (win.id === net.uid ? "You win!" : esc(win.n) + " wins!") : "Game over") + "</h2>" +
    '<p class="muted">Least time as IT wins.' + (mine >= 0 ? " You came " + ordinal(mine + 1) + " of " + rows.length + "." : "") + "</p>" +
    '<div class="tablewrap"><table class="tgtable"><thead><tr><th>#</th><th>Player</th><th>Time as IT</th><th>Tags</th><th>Questions right</th></tr></thead><tbody>' +
    rows.map((r, i) => '<tr class="' + (r.id === net.uid ? "me" : "") + '"><td>' + (i + 1) + '</td><td><i class="pdot" style="background:' + T.COLORS[r.c % T.COLORS.length] + '"></i>' + esc(r.n) + "</td><td>" + secs(r.it) + "</td><td>" + r.tags + "</td><td>" + r.r + " / " + r.q + "</td></tr>").join("") +
    "</tbody></table></div>" +
    '<div class="btnrow">' + (host ? '<button class="btn" type="button" id="tg-again">Play again</button><button class="btn quiet" type="button" id="tg-close">Close room</button>'
      : '<span class="muted small">Waiting for the host to start another game.</span><button class="btn quiet" type="button" id="tg-leave">Leave</button>') + "</div></div>";
  if (host) { $("#tg-again").addEventListener("click", () => hostPatch({ state:"lobby" })); $("#tg-close").addEventListener("click", closeRoom); }
  else $("#tg-leave").addEventListener("click", leave);
}
const ordinal = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? "th" : (["th", "st", "nd", "rd"][n % 10] || "th"));

/* ---------- abilities ---------- */
const playing = t => meta && meta.state === "play" && L && t >= meta.startAt;
const charmedNow = t => !!(meta && meta.charm && t < meta.charm.until && meta.charm.by === meta.it && meta.it !== net.uid);
function boost(){
  const t = now(); if (!playing(t) || meta.it === net.uid || charmedNow(t) || t < L.bReady || t < L.b) return;
  L.b = t + RU.BOOST_MS; L.bReady = t + RU.BOOST_MS + RU.BOOST_CD; lastSig = "";
}
function invis(){
  const t = now(); if (!playing(t) || meta.it === net.uid || charmedNow(t) || t < L.vReady) return;
  L.v = t + RU.INVIS_MS; L.vReady = t + RU.INVIS_CD; lastSig = "";
}
function attract(){
  const t = now(); if (!playing(t) || meta.it !== net.uid || t < meta.freezeUntil || ((meta.zcd || {})[net.uid] || 0) > t || (meta.charm && t < meta.charm.until)) return;
  if (role === "host") hostAttract(net.uid); else net.tagMe(code, { zn:++L.zn, zt:t });
}
const MOVE_KEYS = { ArrowUp:"u", KeyW:"u", ArrowDown:"d", KeyS:"d", ArrowLeft:"l", KeyA:"l", ArrowRight:"r", KeyD:"r" };
const typing = e => { const tg = e.target; return tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA" || tg.tagName === "SELECT" || tg.isContentEditable); };
window.addEventListener("keydown", e => {
  if (screen !== "play" || $("#panel-games").hidden || typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (MOVE_KEYS[e.code]) { keys[MOVE_KEYS[e.code]] = true; e.preventDefault(); }
  else if (e.code === "Space") { e.preventDefault(); if (!e.repeat) boost(); }
  else if (e.code === "KeyQ") { if (!e.repeat) invis(); }
  else if (e.code === "KeyZ") { if (!e.repeat) attract(); }
});
window.addEventListener("keyup", e => { if (MOVE_KEYS[e.code]) keys[MOVE_KEYS[e.code]] = false; });
window.addEventListener("blur", () => Object.keys(keys).forEach(k => { keys[k] = false; }));

/* ---------- questions ---------- */
function nextQuestion(){
  let q;
  if (meta.src === "topic" && G().quickPool) {
    if (qPtr >= qPool.length) { qPool = G().quickPool(meta.topic || curTopic().id); qPtr = 0; }
    q = qPool[qPtr++];
  }
  if (!q) q = buildTopicQuiz("quick-math", newSeed(), 1, L.asked < 3 ? "1" : "2")[0];
  return Object.assign(q, { id:"tq" + (++qid) });
}
function openQuestion(){
  const q = nextQuestion(), box = $("#tg-q"); if (!box) return;
  L.a = 1; L.q = q; lastSig = ""; keys.u = keys.d = keys.l = keys.r = false;
  clearMath(box); box.hidden = false;
  box.innerHTML = '<div class="tgqcard"><div class="tgqhead"><b>Question time!</b><span class="small">You can\'t move until you answer. Watch out for IT!</span></div>' +
    qHeadHtml(q, "Question") + questionHtml(q, "tg") +
    '<p class="small redtxt" id="tg-qerr" role="alert" hidden></p>' +
    '<div class="btnrow" id="tg-qact"><button class="btn" type="button" id="tg-check">Check answer</button></div><div id="tg-qfb" class="stack"></div></div>';
  bindQuestion(q, box, "tg");
  $("#tg-check").addEventListener("click", () => checkQ(q));
  $$("input", box).forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (!$("#tg-qact").hidden) checkQ(q); } }));
  typeset(box);
  const f = $("input:not([type=radio]):not([type=checkbox])", box); if (f) f.focus({ preventScroll:true });
}
function checkQ(q){
  const box = $("#tg-q"), rec = readAnswer(q, box, "tg");
  if (!rec) { const e = $("#tg-qerr"); e.hidden = false; e.textContent = MISSING_MSG(q); return; }
  const t = now();
  rec.correct = grade(q, rec);
  L.asked++;
  if (rec.correct) { L.right++; L.bReady = Math.max(t, L.b); } else L.d = t + RU.DIZZY_MS;
  lastSig = "";
  lockAnswer(q, box, "tg", rec);
  $("#tg-qact").hidden = true; $("#tg-qerr").hidden = true;
  const fb = $("#tg-qfb");
  fb.innerHTML = feedbackHtml(q, rec, { headline:rec.correct ? "Correct! Your boost is recharged." : "Not quite. You're dizzy for 3 seconds.", lessonButton:false }) +
    '<div class="btnrow"><button class="btn" type="button" id="tg-qback">Back to the game</button></div>';
  typeset(fb);
  $("#tg-qback").addEventListener("click", () => closeQuestion(false));
  $("#tg-qback").focus({ preventScroll:true });
  if (rec.correct) setTimeout(() => { if (L && L.q === q) closeQuestion(false); }, 1800);
}
function closeQuestion(tagged){
  if (!L) return;
  const box = $("#tg-q");
  if (box) { clearMath(box); box.innerHTML = ""; box.hidden = true; }
  if (L.a && !tagged) L.nextQ = now() + RU.Q_EVERY;
  L.a = 0; L.q = null; lastSig = "";
  if (document.activeElement && box && (box.contains(document.activeElement) || document.activeElement === document.body)) document.activeElement.blur();
}

/* ---------- my movement, tagging ---------- */
function itPos(t){
  const id = meta.it;
  if (id === net.uid) return L;
  const sb = role === "host" && simBots.find(b => b.id === id); if (sb) return sb;
  const p = players[id] || botsRec[id];
  return p && fresh(players[id] ? p : Object.assign({ t }, p), t) ? p : null;
}
function stepMe(dt, t, background){
  const m = meta, isIt = m.it === net.uid;
  if (!isIt && !L.a && t >= m.startAt && t >= L.nextQ && !charmedNow(t) && !background) openQuestion();
  if (!isIt && t >= L.nextQ && background) L.nextQ = t + 2000;   // ask when the player is looking
  if (charmedNow(t)) {   // Attraction: walk toward IT, no choice
    const p = itPos(t);
    if (p) { const [dx, dy] = T.norm(p.x - L.x, p.y - L.y); L.dx = dx; L.dy = dy; T.move(world, L, dx * RU.SPEED * dt, dy * RU.SPEED * dt); L.mv = 1; }
    return;
  }
  if (background) { L.mv = 0; return; }
  let ix = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0);
  if (joy) { const jx = joy.cx - joy.sx, jy = joy.cy - joy.sy; if (Math.hypot(jx, jy) > 10) { ix += jx; iy += jy; } }
  const frozen = t < m.startAt || L.a || t < L.d || (isIt && t < m.freezeUntil);
  const [nx, ny] = T.norm(ix, iy);
  if ((nx || ny) && !frozen) {
    const sp = RU.SPEED * (isIt ? RU.IT_BONUS : 1) * (t < L.b ? RU.BOOST : 1);
    T.move(world, L, nx * sp * dt, ny * sp * dt); L.dx = nx; L.dy = ny; L.mv = 1;
  } else L.mv = 0;
  if (isIt && t >= m.freezeUntil && t >= m.startAt && t - L.lastClaim > 350) {
    for (const p of participants(t)) {
      if (p.id === net.uid || (m.ntb && m.ntb.id === p.id && t < m.ntb.until)) continue;
      if (Math.hypot(p.x - L.x, p.y - L.y) < RU.TAG_DIST) {
        L.lastClaim = t;
        if (role === "host") applyTag(net.uid, p.id); else net.tagMe(code, { k:p.id, kn:++L.kn, kt:t });
        break;
      }
    }
  }
}

/* ---------- drawing loop ---------- */
function sizeCanvas(){
  const wrap = $("#tg-wrap"); if (!wrap || !cvs) return;
  const w = wrap.clientWidth, h = Math.round(Math.max(280, Math.min(window.innerHeight * 0.64, Math.max(w * 0.66, Math.min(w * 1.1, window.innerHeight * 0.55))))), dpr = Math.min(2, window.devicePixelRatio || 1);
  cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr); cvs.style.height = h + "px";
  view = { cw:w, ch:h, dpr, scale:Math.max(28, Math.min(54, w / 19)) };
}
window.addEventListener("resize", () => { if (screen === "play") sizeCanvas(); });
function startLoop(){ if (!raf) { lastFrame = 0; raf = requestAnimationFrame(frame); } }
function stopLoop(){ if (raf) cancelAnimationFrame(raf); raf = 0; }
function frame(ts){
  raf = 0;
  if (screen !== "play" || !cvs || !document.body.contains(cvs) || $("#panel-games").hidden || !meta || !L || !world) return;
  const dt = Math.min(0.05, lastFrame ? (ts - lastFrame) / 1000 : 0); lastFrame = ts;
  const t = now();
  stepMe(dt, t, false);
  paint(dt, t);
  if (t - hudAt > 200) { hudAt = t; hud(t); }
  if (t - rankAt > 1000) { rankAt = t; fillRank(); }
  raf = requestAnimationFrame(frame);
}
function paint(dt, t){
  const m = meta, list = [], meHide = T.hideAt(world, L.x, L.y), charm = m.charm && t < m.charm.until && m.charm.by === m.it ? m.charm : null;
  const isIt = m.it === net.uid;
  list.push({ id:net.uid, label:isIt ? "You · IT" : "You", c:me.c, x:L.x, y:L.y, dx:L.dx, dy:L.dy, mv:L.mv, it:isIt, boost:t < L.b, ans:L.a, dizzy:t < L.d,
    charmed:!!charm && !isIt, attracting:!!charm && isIt, alpha:t < L.v ? 0.4 : meHide ? 0.85 : 1, me:true, draw:"full", ph:0 });
  const others = [];
  Object.entries(players).forEach(([id, p]) => { if (id !== net.uid && fresh(p, t) && p.g === m.round) others.push([id, p]); });
  if (role === "host") simBots.forEach(b => others.push([b.id, { n:b.n, c:b.c, x:b.x, y:b.y, h:Math.round(Math.atan2(b.dy, b.dx) * 10), m:b.mv, a:b.a, b:b.b, v:b.v, d:b.d }]));
  else Object.entries(botsRec).forEach(([id, b]) => others.push([id, b]));
  let itMark = null;
  const k = 1 - Math.exp(-dt * 14);
  others.forEach(([id, p], i) => {
    const s = disp[id] || (disp[id] = { x:p.x, y:p.y });
    if (Math.hypot(p.x - s.x, p.y - s.y) > 4) { s.x = p.x; s.y = p.y; } else { s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k; }
    const it = id === m.it, inv = t < (p.v || 0), hid = T.hideAt(world, s.x, s.y), d = Math.hypot(s.x - L.x, s.y - L.y);
    const look = inv ? null : hid ? (d < RU.PEEK_DIST ? "peek" : null) : "full";
    if (it && look === "full") itMark = { x:s.x, y:s.y };
    if (!look) return;
    const a = (p.h || 0) / 10;
    list.push({ id, label:(it ? "IT · " : "") + (p.n || "?"), c:p.c || 0, x:s.x, y:s.y, dx:Math.cos(a), dy:Math.sin(a), mv:p.m, it, boost:t < (p.b || 0), ans:p.a, dizzy:t < (p.d || 0),
      charmed:!!charm && !it, attracting:!!charm && it, alpha:1, draw:look, ph:i + 1 });
  });
  // keep the camera inside the park when the park is bigger than the screen
  const vw = view.cw / view.scale, vh = view.ch / view.scale;
  const camX = vw < T.W ? Math.max(vw / 2 - 0.6, Math.min(T.W - vw / 2 + 0.6, L.x)) : T.W / 2, camY = vh < T.H ? Math.max(vh / 2 - 0.6, Math.min(T.H - vh / 2 + 0.6, L.y)) : T.H / 2;
  let center = null, sub = null, banner = null;
  if (t < m.startAt) { center = String(Math.ceil((m.startAt - t) / 1000)); sub = isIt ? "You're IT! Let the others scatter first." : nameOf(m.it) + " is IT. Get ready to run!"; }
  else if (charm && !isIt) banner = { text:"You're attracted to " + nameOf(m.it) + "! " + Math.ceil((charm.until - t) / 1000) + " s", col:"rgba(219,39,119,.92)" };
  else if (isIt && t < m.freezeUntil) banner = { text:"You're IT · you can move in " + Math.ceil((m.freezeUntil - t) / 1000) + " s", col:"rgba(239,68,68,.92)" };
  else if (t < L.d) banner = { text:"Dizzy! " + Math.ceil((L.d - t) / 1000) + " s", col:"rgba(234,179,8,.95)", fg:"#1d2433" };
  else if (!isIt && !L.a && L.nextQ - t < RU.Q_WARN) banner = { text:"Question in " + Math.max(1, Math.ceil((L.nextQ - t) / 1000)) + " s · hide in a bush or under a tree!", col:"rgba(234,179,8,.95)", fg:"#1d2433" };
  else if (t < L.v) banner = { text:"Invisible · " + Math.ceil((L.v - t) / 1000) + " s", col:"rgba(99,102,241,.9)" };
  else if (meHide && !isIt) banner = { text:"Hidden · only players right next to you can see you", col:"rgba(22,101,52,.85)" };
  const tst = toast && Date.now() < toast.until ? toast : null;
  T.draw(ctx, { w:world, camX, camY, scale:view.scale, cw:view.cw, ch:view.ch, dpr:view.dpr, time:t / 1000, dt, list, meHide, itMark:isIt ? null : itMark, joy, mini:true,
    center, sub, banner, toast:tst, tagRange:isIt && t >= m.freezeUntil ? { x:L.x, y:L.y } : null, charmTint:charm && !isIt ? 0.1 + Math.abs(Math.sin(t / 150)) * 0.06 : 0 });
  const qb = $("#tg-q"); if (qb) qb.classList.toggle("charmed", !!charm && !isIt);
}
function abtn(id, state, label, frac){
  const b = $(id); if (!b) return;
  b.disabled = state === "off"; b.className = "abtn" + (id === "#tg-attract" ? " attract" : "") + " " + state;
  b.querySelector(".st").textContent = label; b.querySelector("i").style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + "%";
}
function hud(t){
  const m = meta, isIt = m.it === net.uid, el = $("#tg-hud"); if (!el) return;
  const myIt = ((m.itTime || {})[net.uid] || 0) + (isIt && t > m.startAt ? t - Math.max(m.itSince, m.startAt) : 0);
  const left = t < m.startAt ? m.endsAt - m.startAt : m.endsAt - t;
  el.innerHTML = '<div class="hchip"><span>Time left</span><b>' + fmtTime(left) + "</b></div>" +
    '<div class="hchip' + (isIt ? " itchip" : "") + '"><span>You are</span><b>' + (isIt ? "IT" : "Runner") + "</b></div>" +
    '<div class="hchip"><span>Your time as IT</span><b>' + secs(myIt) + "</b></div>" +
    '<div class="hchip"><span>Next question</span><b>' + (isIt ? "—" : L.a ? "Now" : fmtTime(L.nextQ - t)) + "</b></div>";
  const charmed = charmedNow(t), live = t >= m.startAt;
  if (isIt || charmed || !live) { const why = isIt ? "Not for IT" : charmed ? "Attracted!" : "Get ready"; abtn("#tg-boost", "off", why, 0); abtn("#tg-invis", "off", why, 0); }
  else {
    if (t < L.b) abtn("#tg-boost", "on", "Active " + Math.ceil((L.b - t) / 1000) + " s", (L.b - t) / RU.BOOST_MS);
    else if (t < L.bReady) abtn("#tg-boost", "wait", "Ready in " + Math.ceil((L.bReady - t) / 1000) + " s", 1 - (L.bReady - t) / RU.BOOST_CD);
    else abtn("#tg-boost", "ready", "Ready", 1);
    if (t < L.v) abtn("#tg-invis", "on", "Active " + Math.ceil((L.v - t) / 1000) + " s", (L.v - t) / RU.INVIS_MS);
    else if (t < L.vReady) abtn("#tg-invis", "wait", "Ready in " + Math.ceil((L.vReady - t) / 1000) + " s", 1 - (L.vReady - t) / RU.INVIS_CD);
    else abtn("#tg-invis", "ready", "Ready", 1);
  }
  const zr = (m.zcd || {})[net.uid] || 0, ch = m.charm && t < m.charm.until;
  if (!isIt) abtn("#tg-attract", "off", "Only IT", 0);
  else if (!live || t < m.freezeUntil) abtn("#tg-attract", "off", "Wait…", 0);
  else if (ch && m.charm.by === net.uid) abtn("#tg-attract", "on", "Pulling " + Math.ceil((m.charm.until - t) / 1000) + " s", (m.charm.until - t) / RU.ATTRACT_MS);
  else if (t < zr) abtn("#tg-attract", "wait", "Ready in " + Math.ceil((zr - t) / 1000) + " s", 1 - (zr - t) / RU.ATTRACT_CD);
  else abtn("#tg-attract", "ready", "Ready", 1);
}
function fillRank(){
  const el = $("#tg-rank"); if (!el || !meta) return;
  el.innerHTML = ranking(meta, false).map(r => '<li class="' + (r.id === net.uid ? "me" : "") + (r.id === meta.it ? " it" : "") + '"><i class="pdot" style="background:' + T.COLORS[r.c % T.COLORS.length] + '"></i><span>' + esc(r.n) + (r.id === meta.it ? ' <b class="itword">IT</b>' : "") + "</span><b>" + secs(r.it) + "</b></li>").join("");
}

/* ---------- entry points (called by the Games tab) ---------- */
function wants(){
  if (consumed) return false;
  try { const h = (location.hash || "").match(/^#tag-([A-Za-z0-9]{5})$/); if (h) prefill = h[1].toUpperCase(); } catch(e) {}
  return !!(prefill || BSS.get("tag"));
}
async function resume(){
  consumed = true;
  const s = BSS.get("tag");
  if (s) {
    try { const saved = JSON.parse(localStorage.getItem("mahoot-tag-me") || "null"); if (saved) { me.n = saved.n; me.c = saved.c; } } catch(e) {}
    await getNet();
    const m = await net.tagPeek(s.code);
    if (m && me.n && (s.role !== "host" || m.host === net.uid)) { active = true; await enter(s.code, s.role); return; }
    BSS.del("tag");
  }
  renderSetup();
}
window.TagUI = {
  active: () => active && !!screen,
  wants,
  open(){ consumed = true; renderSetup(); },
  onShow(){
    if (!active && wants()) { active = true; resume(); return; }
    if (screen === "play") { if (G().setPlaying) G().setPlaying(true); sizeCanvas(); startLoop(); }
    else if (screen === "setup" && !code) renderSetup();
  },
  onHide(){ Object.keys(keys).forEach(k => { keys[k] = false; }); joy = null; },
  _test:{ state:() => ({ meta, L, role, simBots }), patch:p => hostPatch(p), attract }
};
if (!$("#panel-games").hidden && wants()) window.TagUI.onShow();
})();
