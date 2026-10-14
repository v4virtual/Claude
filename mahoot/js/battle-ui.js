/* ===== Battle mode UI: host a room, join with a code / link / QR, timed questions, live leaderboard ===== */
(function(){
const ROOM_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LVL_NAMES = { M:"Mixed levels", A:"Level 1–4", B:"Level 5–6", C:"Level 7–8" };
const setup = { len:10, lvl:"M", secs:60 };
let net = null, netPromise = null, netNote = "";
let role = null, code = null, room = null, unwatch = null, Qb = [], qbKey = "", sig = "", tick = 0, prefill = "";
const recs = {};

function getNet(){
  if (!netPromise) netPromise = (async () => {
    if (window.FIREBASE_CONFIG) {
      try { net = await makeFirebaseNet(window.FIREBASE_CONFIG); }
      catch(e) { net = makeLocalNet(); netNote = "Could not connect to Firebase (" + ((e && (e.code || e.message)) || e) + "). Battles fall back to demo mode on this device."; }
    } else net = makeLocalNet();
    return net;
  })();
  return netPromise;
}
const box = () => $("#battle-root");
const meta = () => room && room.meta;
const ansKey = () => (meta().round || 0) + "_" + meta().q;
const fmt = n => Math.round(n).toLocaleString("en-US");
const ordinal = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? "th" : (["th","st","nd","rd"][n % 10] || "th"));
function players(){
  const rd = meta().round || 0;
  return Object.entries((room && room.players) || {}).map(([uid, p]) => {
    const same = (p.round || 0) === rd;
    return { uid, name:p.name || "?", online:p.online !== false, score: same ? (p.score || 0) : 0, streak: same ? (p.streak || 0) : 0 };
  });
}
const ranked = () => players().sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
const answersNow = () => (room && room.answers && room.answers[ansKey()]) || {};
function remaining(){ const m = meta(); return m.secs - (net.serverNow() - (m.qStart || net.serverNow())) / 1000; }
const joinUrl = c => location.origin + location.pathname + "#join-" + c;

/* ---------- room wiring ---------- */
function watch(c){ if (unwatch) unwatch(); code = c; sig = ""; unwatch = net.watchRoom(c, onRoom); }
function resetLocal(){ if (net) net.cancelPresence(); if (unwatch) unwatch(); unwatch = null; role = null; code = null; room = null; sig = ""; BSS.del("host"); BSS.del("player"); stopTimer(); }
function onRoom(data){
  if (!role) return;
  room = data;
  if (!data || !data.meta) { const wasPlayer = role === "player"; resetLocal(); renderHome(wasPlayer ? "The host closed the room." : ""); return; }
  const m = data.meta;
  if (role === "host" && m.host !== net.uid) { resetLocal(); renderHome(); return; }
  const k = m.seed + "-" + m.len + m.lvl;
  if (k !== qbKey) { Qb = buildQuiz(m.seed, m.len, m.lvl); qbKey = k; }
  if (role === "player") {
    const me = data.players && data.players[net.uid];
    if (me && (me.round || 0) !== (m.round || 0)) net.setPlayer(code, { score:0, streak:0, round:m.round || 0 });
  }
  const s = role + "|" + m.state + "|" + (m.round || 0) + "|" + m.q;
  if (s !== sig) { sig = s; render(); } else update();
}
function peekRoom(c){
  return new Promise(res => { let u = null; u = net.watchRoom(c, d => { setTimeout(() => { if (u) u(); }, 0); res(d && d.meta ? d : null); }); });
}

/* ---------- home: join or host ---------- */
function seg(name, opts, cur){
  return '<div class="seg" role="radiogroup">' + opts.map(([v, l]) =>
    '<label><input type="radio" name="' + name + '" value="' + v + '"' + (String(v) === String(cur) ? " checked" : "") + ">" + l + "</label>").join("") + "</div>";
}
function renderHome(msg){
  stopTimer();
  const demo = !window.FIREBASE_CONFIG || (net && net.mode === "local");
  box().innerHTML =
    '<div class="stack"><h2>Battle mode</h2>' +
    '<p class="muted">Everyone gets the same question at the same time. A correct answer scores 500 to 1000 points: the faster you lock it in, the more you get. Highest score wins.</p>' +
    (demo ? '<p class="banner"><b>Demo mode.</b> ' + esc(netNote || "Online battles are not switched on for this site yet, so a battle only works between tabs in this browser. The site owner can switch them on with a free Firebase project (see README).") + "</p>" : "") +
    (msg ? '<p class="banner">' + esc(msg) + "</p>" : "") + "</div>" +
    '<div class="two">' +
      '<div class="sheet"><h3>Join a battle</h3>' +
        '<label class="field"><span>Room code</span><div class="codein"><input id="bj-code" maxlength="5" autocomplete="off" placeholder="ABCDE" value="' + esc(prefill) + '"></div></label>' +
        '<label class="field"><span>Nickname</span><div class="codein"><input id="bj-name" maxlength="16" autocomplete="off" placeholder="Your name" style="text-transform:none"></div></label>' +
        '<p class="small muted">Use a nickname your class will recognise. Keep it friendly.</p>' +
        '<p class="small redtxt" id="bj-err" role="alert" hidden></p>' +
        '<div class="btnrow"><button class="btn" type="button" id="bj-go">Join</button></div></div>' +
      '<div class="sheet"><h3>Host a battle</h3>' +
        '<div class="field"><span>Questions</span>' + seg("bh-len", [[5,"5"],[10,"10"],[15,"15"]], setup.len) + "</div>" +
        '<div class="field"><span>Level</span>' + seg("bh-lvl", [["M","Mixed"],["A","1–4"],["B","5–6"],["C","7–8"]], setup.lvl) + "</div>" +
        '<div class="field"><span>Seconds per question</span>' + seg("bh-secs", [[30,"30"],[60,"60"],[90,"90"],[120,"120"]], setup.secs) + "</div>" +
        '<p class="small muted">Put the host screen on the projector. Players join on their own devices with paper ready for working.</p>' +
        '<p class="small redtxt" id="bh-err" role="alert" hidden></p>' +
        '<div class="btnrow"><button class="btn" type="button" id="bh-go">Create room</button></div></div>' +
    "</div>";
  $$('input[name="bh-len"]').forEach(r => r.addEventListener("change", () => { setup.len = Number(r.value); }));
  $$('input[name="bh-lvl"]').forEach(r => r.addEventListener("change", () => { setup.lvl = r.value; }));
  $$('input[name="bh-secs"]').forEach(r => r.addEventListener("change", () => { setup.secs = Number(r.value); }));
  $("#bj-go").addEventListener("click", join);
  $("#bh-go").addEventListener("click", host);
  ["#bj-code", "#bj-name"].forEach(s => $(s).addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); join(); } }));
  if (prefill) $("#bj-name").focus({ preventScroll:true });
}
async function join(){
  const c = $("#bj-code").value.trim().toUpperCase(), name = $("#bj-name").value.trim().replace(/\s+/g, " "), err = $("#bj-err");
  const fail = t => { err.hidden = false; err.textContent = t; };
  if (!/^[A-Z0-9]{5}$/.test(c)) return fail("The room code has 5 letters or digits. Ask your host for it.");
  if (!name) return fail("Type a nickname so the others can see who you are.");
  $("#bj-go").disabled = true;
  await getNet();
  const d = await peekRoom(c);
  $("#bj-go").disabled = false;
  if (!d) return fail("There is no battle with the code " + c + ". Check the code with your host.");
  if (d.meta.state === "final") return fail("That battle has already finished.");
  await net.joinRoom(c, name.slice(0, 16), d.meta.round || 0);
  role = "player"; BSS.set("player", { code:c, name }); prefill = ""; watch(c);
}
async function host(){
  $("#bh-go").disabled = true;
  await getNet();
  let c = "", ok = false;
  for (let i = 0; i < 6 && !ok; i++) {
    c = Array.from({ length:5 }, () => ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)]).join("");
    try { ok = await net.createRoom(c, { host:net.uid, seed:newSeed(), len:setup.len, lvl:setup.lvl, secs:setup.secs, state:"lobby", q:-1, qStart:0, round:0, created:Date.now() }); }
    catch(e) { const err = $("#bh-err"); err.hidden = false; err.textContent = "Could not create the room: " + (e.code || e.message); $("#bh-go").disabled = false; return; }
  }
  if (!ok) { $("#bh-go").disabled = false; return; }
  role = "host"; BSS.set("host", { code:c }); watch(c);
}

/* ---------- shared bits ---------- */
function qHead(m, q){
  return '<div class="qhead"><span class="count">Question ' + (m.q + 1) + " of " + m.len + "</span>" +
    '<span class="lvl ' + q.level + '">' + LEVEL_LABELS[q.level] + '</span><span class="tag">' + esc(SKILLS[q.skill].short) + "</span></div>";
}
const timerHtml = () => '<div class="timer"><div class="tbar"><i id="b-tbar"></i></div><span class="tnum" id="b-tnum"></span></div>';
function startTimer(){ stopTimer(); tick = setInterval(onTick, 200); onTick(); }
function stopTimer(){ if (tick) clearInterval(tick); tick = 0; }
function onTick(){
  const m = meta(); if (!m || m.state !== "question") return stopTimer();
  const rem = remaining(), bar = $("#b-tbar"), num = $("#b-tnum");
  if (bar) { bar.style.width = Math.max(0, Math.min(100, rem / m.secs * 100)) + "%"; bar.parentElement.classList.toggle("low", rem <= 10); }
  if (num) num.textContent = Math.max(0, Math.ceil(rem));
  if (role === "player" && rem <= 0 && !recs[ansKey()]) timeUp();
  if (role === "host") {
    const online = players().filter(p => p.online).length, n = Object.keys(answersNow()).length;
    if (rem <= -0.6 || (online > 0 && n >= online)) { stopTimer(); net.setMeta(code, { state:"reveal" }); }
  }
}
function chipsHtml(){
  const list = players().filter(p => p.online);
  return list.length ? list.map(p => '<span class="pchip2' + (p.uid === net.uid ? " me" : "") + '">' + esc(p.name) + "</span>").join("")
    : '<span class="muted small">Nobody yet. Players appear here as they join.</span>';
}
function fillPlayers(){
  const el = $("#b-players"); if (el) el.innerHTML = chipsHtml();
  const n = $("#b-count"); if (n) n.textContent = players().filter(p => p.online).length;
  const st = $("#b-start"); if (st) st.disabled = !players().some(p => p.online);
}
function podiumHtml(r){
  const cols = [[r[1], "p2", 2], [r[0], "p1", 1], [r[2], "p3", 3]];
  return '<div class="podium">' + cols.map(([p, cls, n]) => p
    ? '<div class="pcol ' + cls + '"><span class="pname">' + esc(p.name) + '</span><span class="pscore">' + fmt(p.score) + '</span><div class="block">' + n + "</div></div>"
    : '<div class="pcol ' + cls + '"></div>').join("") + "</div>";
}
function render(){
  stopTimer();
  const m = meta();
  if (!role || !m) return renderHome();
  const views = { host:{ lobby:hostLobby, question:hostQuestion, reveal:hostReveal, final:hostFinal },
                  player:{ lobby:playerLobby, question:playerQuestion, reveal:playerReveal, final:playerFinal } };
  (views[role][m.state] || renderHome)();
  if (m.state === "question") startTimer();
}
function update(){
  const m = meta();
  if (m.state === "lobby") fillPlayers();
  if (m.state === "question" && role === "host") updateAnswered();
  if (m.state === "reveal" && role === "host") fillLeaderboard();
  if (m.state === "reveal" && role === "player") updateMyRank();
}

/* ---------- host screens ---------- */
function hostLobby(){
  const m = meta(), url = joinUrl(code);
  box().innerHTML = '<div class="sheet">' +
    '<div class="joinbox"><div class="stack"><span class="eyebrow">Room code</span><div class="roomcode">' + code + "</div>" +
      '<p>Open this site, go to <b>Battle</b> and type the code. Or scan the QR code, or use the link:</p>' +
      '<div class="codebar"><code id="b-link">' + esc(url) + '</code><button class="btn quiet" type="button" id="b-copy">Copy link</button></div></div>' +
      '<div class="qr" id="b-qr" aria-label="QR code for the join link"></div></div>' +
    '<h3>Players (<span id="b-count">0</span>)</h3><div class="chips" id="b-players"></div>' +
    '<p class="small muted">' + m.len + " questions · " + LVL_NAMES[m.lvl] + " · " + m.secs + " s per question</p>" +
    '<div class="btnrow"><button class="btn" type="button" id="b-start" disabled>Start battle</button><button class="btn quiet" type="button" id="b-close">Close room</button></div></div>';
  try { if (window.QRCode) new QRCode($("#b-qr"), { text:url, width:180, height:180, colorDark:"#000000", colorLight:"#ffffff", correctLevel:QRCode.CorrectLevel.M }); else $("#b-qr").hidden = true; } catch(e) { $("#b-qr").hidden = true; }
  $("#b-copy").addEventListener("click", () => copyText(url, $("#b-copy"), $("#b-link")));
  $("#b-start").addEventListener("click", () => net.setMeta(code, { state:"question", q:0, qStart:net.stamp() }));
  $("#b-close").addEventListener("click", closeRoom);
  fillPlayers();
}
function staticChoices(q){
  return q.type === "mc" ? '<div class="choices">' + q.options.map(o => '<div class="choice">' + (o.tex ? "\\(" + o.tex + "\\)" : esc(o.label)) + "</div>").join("") + "</div>" : "";
}
function hostQuestion(){
  const m = meta(), q = Qb[m.q];
  const work = q.work ? "<div>" + q.work.map((w, i) => '<div class="workline"><span class="ln">Line ' + (i + 1) + '</span><span class="m">\\(\\displaystyle ' + w + "\\)</span></div>").join("") + "</div>" : "";
  box().innerHTML = '<div class="sheet" id="bh">' + qHead(m, q) + timerHtml() +
    '<p class="qprompt">' + q.prompt + '</p><div class="qmath bigq">\\[' + q.tex + "\\]</div>" + work + staticChoices(q) +
    '<p class="answered"><span id="b-answered">0</span> of <span id="b-total">0</span> answered</p>' +
    '<div class="btnrow"><button class="btn quiet" type="button" id="b-endq">End question now</button></div></div>';
  $("#b-endq").addEventListener("click", () => { stopTimer(); net.setMeta(code, { state:"reveal" }); });
  updateAnswered(); typeset(box());
}
function updateAnswered(){
  const a = $("#b-answered"), t = $("#b-total");
  if (a) a.textContent = Object.keys(answersNow()).length;
  if (t) t.textContent = players().filter(p => p.online).length;
}
function hostReveal(){
  const m = meta(), q = Qb[m.q];
  const steps = q.steps.map(s => '<li><div><div class="m">\\(\\displaystyle ' + s.m + '\\)</div><p class="why">' + s.why + "</p></div></li>").join("");
  box().innerHTML = '<div class="sheet">' + qHead(m, q) + '<div class="qmath">\\[' + q.tex + "\\]</div>" +
    '<div class="verdict ok"><h3>Answer: \\(' + answerTex(q) + '\\)</h3><p id="b-stats"></p><div class="meterbar"><i id="b-statbar"></i></div></div>' +
    '<div class="two"><div class="stack"><h3>Leaderboard</h3><ol class="lb" id="b-lb"></ol></div>' +
      '<div class="explain"><h4>Solution</h4><ol class="steps">' + steps + '</ol><p class="keyidea">' + q.key + "</p></div></div>" +
    '<div class="btnrow"><button class="btn" type="button" id="b-next">' + (m.q + 1 < m.len ? "Next question" : "Show final results") + "</button></div></div>";
  $("#b-next").addEventListener("click", () => {
    const mm = meta();
    if (mm.q + 1 < mm.len) net.setMeta(code, { state:"question", q:mm.q + 1, qStart:net.stamp() });
    else net.setMeta(code, { state:"final" });
  });
  fillLeaderboard(); typeset(box());
}
function fillLeaderboard(){
  const ans = answersNow(), r = ranked(), total = players().filter(p => p.online).length;
  const ok = Object.values(ans).filter(a => a.ok).length;
  const st = $("#b-stats"); if (st) st.textContent = ok + " of " + total + " got it right" + (total ? " (" + Math.round(ok / total * 100) + "%)" : "");
  const bar = $("#b-statbar"); if (bar) bar.style.width = (total ? ok / total * 100 : 0) + "%";
  const lb = $("#b-lb");
  if (lb) lb.innerHTML = r.slice(0, 5).map((p, i) => '<li><span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(p.name) + "</span>" +
    '<span class="dl">' + (ans[p.uid] && ans[p.uid].pts ? "+" + fmt(ans[p.uid].pts) : "") + '</span><span class="sc">' + fmt(p.score) + "</span></li>").join("") ||
    '<li><span class="nm muted">No players</span></li>';
}
function hostFinal(){
  const r = ranked();
  box().innerHTML = '<div class="sheet"><h2>Final results</h2>' + podiumHtml(r) +
    '<ol class="lb">' + r.map((p, i) => '<li><span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(p.name) + '</span><span class="dl"></span><span class="sc">' + fmt(p.score) + "</span></li>").join("") + "</ol>" +
    '<div class="btnrow"><button class="btn" type="button" id="b-again">Play again with new questions</button><button class="btn quiet" type="button" id="b-close">Close room</button></div></div>';
  $("#b-again").addEventListener("click", () => { const m = meta(); net.setMeta(code, { state:"lobby", q:-1, seed:newSeed(), round:(m.round || 0) + 1 }); });
  $("#b-close").addEventListener("click", closeRoom);
}
async function closeRoom(){ const c = code; resetLocal(); await net.removeRoom(c); renderHome(); }

/* ---------- player screens ---------- */
function leaveBtn(){ const b = $("#b-leave"); if (b) b.addEventListener("click", async () => { const c = code; resetLocal(); await net.leave(c); renderHome(); }); }
function playerLobby(){
  const m = meta(), me = (room.players || {})[net.uid];
  box().innerHTML = '<div class="sheet center"><span class="eyebrow">Room ' + code + "</span>" +
    "<h2>You're in, " + esc(me ? me.name : "player") + "!</h2>" +
    '<p class="muted">Waiting for the host to start. ' + m.len + " questions · " + LVL_NAMES[m.lvl] + " · " + m.secs + " s each. Have paper and a pen ready.</p>" +
    '<h3>Players (<span id="b-count">0</span>)</h3><div class="chips" id="b-players"></div>' +
    '<div class="btnrow"><button class="btn quiet" type="button" id="b-leave">Leave</button></div></div>';
  fillPlayers(); leaveBtn();
}
function playerQuestion(){
  const m = meta(), q = Qb[m.q], key = ansKey();
  box().innerHTML = '<div class="sheet" id="bq">' + qHead(m, q) + timerHtml() + questionHtml(q, "b") +
    '<p class="small redtxt" id="b-err" role="alert" hidden></p>' +
    '<div class="btnrow" id="b-act"><button class="btn" type="button" id="b-submit">Lock in answer</button></div>' +
    '<div class="verdict wait" id="b-locked" hidden><h3 id="b-locked-h">Answer locked in</h3><p>Waiting for the others…</p></div></div>';
  $("#b-submit").addEventListener("click", submit);
  $$("input", $("#bq")).forEach(inp => inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submit(); } }));
  const mine = recs[key] || (room.answers && room.answers[key] && room.answers[key][net.uid]);
  if (mine) showLocked(q, recs[key] || null, !!(mine.none));
  else { const f = $("input", $("#bq")); if (f && q.type !== "mc") f.focus({ preventScroll:true }); }
  typeset(box());
}
function submit(){
  const m = meta(); if (!m || m.state !== "question") return;
  const q = Qb[m.q], key = ansKey(); if (recs[key]) return;
  const rec = readAnswer(q, $("#bq"), "b"), err = $("#b-err");
  if (!rec) { err.hidden = false; err.textContent = MISSING_MSG(q); return; }
  const elapsed = Math.max(0, Math.min(m.secs, (net.serverNow() - m.qStart) / 1000));
  rec.correct = grade(q, rec);
  rec.pts = rec.correct ? Math.round(1000 * (1 - 0.5 * elapsed / m.secs)) : 0;
  rec.secs = Math.round(elapsed * 10) / 10;
  recs[key] = rec;
  const me = (room.players || {})[net.uid] || {}, same = (me.round || 0) === (m.round || 0);
  net.submitAnswer(code, key, { ok:rec.correct, pts:rec.pts, secs:rec.secs, raw:rec.raw || null, vals:rec.vals || null, choice:rec.choice === undefined ? null : rec.choice });
  net.setPlayer(code, { score:(same ? me.score || 0 : 0) + rec.pts, streak: rec.correct ? (same ? me.streak || 0 : 0) + 1 : 0, round:m.round || 0 });
  showLocked(q, rec, false);
}
function timeUp(){
  const m = meta(), q = Qb[m.q];
  recs[ansKey()] = { none:true, correct:false, pts:0 };
  showLocked(q, null, true);
}
function showLocked(q, rec, timedOut){
  const root = $("#bq"); if (!root) return;
  lockAnswer(q, root, "b", rec, true);
  $("#b-act").hidden = true; $("#b-err").hidden = true; $("#b-locked").hidden = false;
  if (timedOut) $("#b-locked-h").textContent = "Time's up";
}
function myRec(){
  const key = ansKey(), db = room.answers && room.answers[key] && room.answers[key][net.uid];
  const local = recs[key];
  if (local && !local.none) return local;
  if (db) return { correct:db.ok, pts:db.pts, secs:db.secs, raw:db.raw || {}, vals:db.vals || {}, choice:db.choice };
  return null;
}
function playerReveal(){
  const m = meta(), q = Qb[m.q], rec = myRec();
  const head = rec && rec.correct ? "Correct! +" + fmt(rec.pts) + " points" : (rec ? "Not quite · 0 points" : "Time's up · 0 points");
  box().innerHTML = '<div class="sheet" id="br">' + qHead(m, q) + '<div class="qmath">\\[' + q.tex + "\\]</div>" +
    '<p class="myrank" id="b-myrank"></p>' +
    feedbackHtml(q, rec, { headline:head, extra: rec && rec.correct ? "You answered in " + rec.secs + " seconds." : "", lessonButton:false }) +
    '<p class="small muted">Waiting for the host to continue…</p></div>';
  updateMyRank(); typeset(box());
}
function updateMyRank(){
  const el = $("#b-myrank"); if (!el) return;
  const r = ranked(), i = r.findIndex(p => p.uid === net.uid); if (i < 0) return;
  const me = r[i];
  el.textContent = "You are " + ordinal(i + 1) + " of " + r.length + " with " + fmt(me.score) + " points" + (me.streak >= 2 ? " · " + me.streak + " in a row" : "");
}
function playerFinal(){
  const r = ranked(), i = r.findIndex(p => p.uid === net.uid), me = r[i] || { score:0 };
  box().innerHTML = '<div class="sheet center"><span class="eyebrow">Battle over</span>' +
    "<h2>You finished " + (i >= 0 ? ordinal(i + 1) + " of " + r.length : "") + "</h2>" +
    '<p class="big">' + fmt(me.score) + " points</p>" + podiumHtml(r) +
    '<div class="btnrow"><button class="btn" type="button" data-go="practice">Practise solo</button><button class="btn quiet" type="button" id="b-leave">Leave the room</button></div></div>';
  leaveBtn();
}

/* ---------- entry points ---------- */
let booted = false;
async function boot(){
  booted = true;
  try {
    const h = (location.hash || "").match(/^#join-([A-Za-z0-9]{5})$/), qs = new URLSearchParams(location.search).get("join");
    prefill = ((h && h[1]) || qs || "").toUpperCase();
  } catch(e) {}
  const hs = BSS.get("host"), ps = BSS.get("player");
  if (hs || ps) {
    await getNet();
    const c = hs ? hs.code : ps.code, d = await peekRoom(c);
    if (d && hs && d.meta.host === net.uid) { role = "host"; watch(c); return; }
    if (d && ps && d.meta.state !== "final") { await net.joinRoom(c, ps.name, d.meta.round || 0); role = "player"; watch(c); return; }
    BSS.del("host"); BSS.del("player");
  }
  renderHome();
}
window.Battle = { onShow(){ if (!booted) boot(); else if (!role) renderHome(); } };
if (!$("#panel-battle").hidden) window.Battle.onShow();
})();
