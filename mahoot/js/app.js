/* ===== App shell: topic picker, tabs, lessons, solo practice ===== */
(function(){
const KEY = "mahoot-v1";
const PANELS = ["start","learn","practice","battle"];
const TIMER_OPTS = [[0,"Off"],[30,"30 s"],[60,"60 s"],[90,"90 s"],[120,"120 s"]];
let state = { tab:"start", topic:"exponents", lessons:{}, settings:{}, quiz:null, idx:0, answers:{}, view:"setup" };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === "object") state = Object.assign(state, s); } catch(e) {}
if (!TOPICS[state.topic]) state.topic = TOPIC_LIST[0].id;
function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {} }
const topic = () => TOPICS[state.topic];
function settings(t){
  t = t || topic();
  const s = state.settings[t.id] || {};
  return { lvl: t.levels.some(l => l.id === s.lvl) ? s.lvl : t.defaultLevel, len: t.lengths.includes(s.len) ? s.len : t.defaultLen, secs: s.secs != null ? s.secs : 0 };
}
function setSetting(k, v){ const t = topic(); state.settings[t.id] = Object.assign(settings(t), { [k]:v }); save(); }
let Q = [];
function loadQuiz(){ Q = state.quiz ? buildTopicQuiz(state.quiz.topic, state.quiz.seed, state.quiz.len, state.quiz.lvl) : []; }
function scrollToTabs(){ const t = $(".tabs"); window.scrollTo({ top: Math.max(0, t.offsetTop - 4) }); }
function seg(el, name, opts, cur, onChange){
  el.innerHTML = opts.map(([v, l]) => '<label><input type="radio" name="' + name + '" value="' + v + '"' + (String(v) === String(cur) ? " checked" : "") + ">" + esc(l) + "</label>").join("");
  $$("input", el).forEach(r => r.addEventListener("change", () => onChange(r.value)));
}

/* ---------- tabs ---------- */
function showTab(name, opts){
  if (!PANELS.includes(name)) name = "start";
  state.tab = name; save();
  PANELS.forEach(p => {
    $("#panel-" + p).hidden = p !== name;
    $("#tab-" + p).setAttribute("aria-selected", p === name ? "true" : "false");
  });
  if (name === "practice") renderPractice();
  if (name === "battle" && window.Battle) window.Battle.onShow();
  if (!(opts && opts.noScroll)) scrollToTabs();
}
$$(".tab").forEach(b => b.addEventListener("click", () => showTab(b.dataset.panel)));
document.addEventListener("click", e => {
  const go = e.target.closest("[data-go]"); if (go) { showTab(go.dataset.go); return; }
  const les = e.target.closest("[data-lesson]"); if (les) openLesson(Number(les.dataset.lesson));
});

/* ---------- topic content from topic files (lessons, intro) ---------- */
function mountTopicContent(){
  const foot = $("#panel-learn .lfoot"), start = $("#panel-start");
  TOPIC_LIST.forEach(t => {
    if (t.lessons && !$(".lessons[data-topic='" + t.id + "']")) {
      const d = document.createElement("div");
      d.className = "lessons"; d.dataset.topic = t.id; d.hidden = true;
      d.innerHTML = t.lessons.map((l, i) => '<article class="sheet lesson" data-title="' + esc(l.title) + '"><div class="lhead"><span class="eyebrow">Lesson ' + (i + 1) + " of " + t.lessons.length + "</span><h2>" + (l.heading || l.title) + "</h2></div>" + l.html + "</article>").join("");
      foot.parentNode.insertBefore(d, foot);
    }
    if (t.introHtml && !$(".topic-intro[data-topic='" + t.id + "']")) {
      const d = document.createElement("div");
      d.className = "topic-intro stack"; d.dataset.topic = t.id; d.hidden = true; d.innerHTML = t.introHtml;
      start.appendChild(d);
    }
  });
}
mountTopicContent();

/* ---------- topic picker ---------- */
function renderPicker(){
  const t = topic();
  const years = [...new Set(TOPIC_LIST.map(x => x.year))].sort((a, b) => a - b);
  seg($("#pk-year"), "pk-year", years.map(y => [y, "Year " + y]), t.year, v => {
    const first = TOPIC_LIST.find(x => x.year === Number(v)); if (first) setTopic(first.id);
  });
  const subjects = [...new Set(TOPIC_LIST.filter(x => x.year === t.year).map(x => x.subject))];
  seg($("#pk-subject"), "pk-subject", subjects.map(s => [s, s]), t.subject, v => {
    const first = TOPIC_LIST.find(x => x.year === t.year && x.subject === v); if (first) setTopic(first.id);
  });
  const list = TOPIC_LIST.filter(x => x.year === t.year && x.subject === t.subject);
  $("#pk-topic").innerHTML = list.map(x => '<button type="button" class="tcard" role="radio" aria-checked="' + (x.id === t.id) + '" data-topic-id="' + x.id + '"><b>' + esc(x.name) + "</b><span>" + esc(x.blurb) + "</span></button>").join("");
  $$("#pk-topic .tcard").forEach(b => b.addEventListener("click", () => setTopic(b.dataset.topicId)));
  const s = settings(t);
  const battle = window.Battle && window.Battle.describe ? window.Battle.describe(t.id) : "";
  $("#pk-defaults").textContent = "Quick practice: " + s.len + " questions · " + levelName(t, s.lvl) + " · " + (s.secs ? s.secs + " s per question" : "no timer") + "." +
    (battle ? " Battle: " + battle + "." : "") + " Change these on the Practice and Battle tabs.";
}
function setTopic(id){
  if (!TOPICS[id]) return;
  state.topic = id; save();
  applyTopic();
}
function applyTopic(){
  const t = topic();
  $$("[data-topic]").forEach(el => { el.hidden = el.dataset.topic !== t.id; });
  $("#topicpill").textContent = topicLabel(t);
  buildLessonNav();
  renderPicker();
  if (state.tab === "practice") renderPractice();
  if (window.Battle && window.Battle.topicChanged) window.Battle.topicChanged(t.id);
  const mjBox = $(".lessons[data-topic='" + t.id + "']"); if (mjBox) typeset(mjBox);
}
$("#pk-practice").addEventListener("click", () => { const s = settings(); startQuiz(state.topic, newSeed(), s.len, s.lvl, s.secs); showTab("practice", { noScroll:true }); });
$("#pk-host").addEventListener("click", () => { showTab("battle"); if (window.Battle && window.Battle.quickHost) window.Battle.quickHost(state.topic); });

/* ---------- lessons ---------- */
let lessons = [];
const lnav = $("#lnav");
function buildLessonNav(){
  lessons = $$(".lessons[data-topic='" + state.topic + "'] .lesson");
  lnav.innerHTML = "";
  lessons.forEach((l, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = (lessons.length > 1 ? (i + 1) + " " : "") + l.dataset.title;
    b.addEventListener("click", () => showLesson(i, true));
    lnav.appendChild(b);
  });
  showLesson(state.lessons[state.topic] || 0, false);
}
function showLesson(i, scroll){
  i = Math.max(0, Math.min(lessons.length - 1, i | 0));
  state.lessons[state.topic] = i; save();
  lessons.forEach((l, j) => { l.hidden = j !== i; });
  $$("button", lnav).forEach((b, j) => b.setAttribute("aria-current", j === i ? "true" : "false"));
  $("#lprev").disabled = i === 0;
  $("#lprev").hidden = lessons.length < 2;
  $("#lnext").textContent = i === lessons.length - 1 ? "Start a practice quiz" : "Next lesson";
  if (scroll) scrollToTabs();
}
$("#lprev").addEventListener("click", () => showLesson((state.lessons[state.topic] || 0) - 1, true));
$("#lnext").addEventListener("click", () => {
  const i = state.lessons[state.topic] || 0;
  if (i >= lessons.length - 1) showTab("practice"); else showLesson(i + 1, true);
});
function openLesson(i){ showTab("learn", { noScroll:true }); showLesson(i, true); }

let pn = 5;
function drawPow(){
  $("#pw-label").innerHTML = "2<sup>" + pn + "</sup>";
  $("#pw-tiles").innerHTML = pn === 0 ? '<span class="muted small">no copies at all</span>'
    : Array.from({ length:pn }, (_, i) => (i ? '<span class="op">×</span>' : "") + '<span class="t" style="font-style:normal">2</span>').join("");
  $("#pw-val").textContent = pn === 0 ? "= 1  (Lesson 2 shows why)" : "= " + Math.pow(2, pn).toLocaleString("en-US");
  $("#pw-minus").disabled = pn === 0; $("#pw-plus").disabled = pn === 8;
}
$("#pw-minus").addEventListener("click", () => { pn = Math.max(0, pn - 1); drawPow(); });
$("#pw-plus").addEventListener("click", () => { pn = Math.min(8, pn + 1); drawPow(); });
drawPow();
function drawSci(){
  const raw = $("#sci-in").value.trim().replace(/\s/g, "").replace(",", ".").replace("−", "-");
  const out = $("#sci-out"), why = $("#sci-why"), x = Number(raw);
  if (!raw || !isFinite(x) || x === 0) { out.textContent = "Type a number that is not 0"; why.textContent = ""; return; }
  const [m, e] = x.toExponential().split("e"), n = parseInt(e, 10), k = Math.abs(n), pl = k === 1 ? " place" : " places";
  out.innerHTML = esc(m) + " × 10<sup>" + (n < 0 ? "−" + k : n) + "</sup>";
  why.textContent = n === 0 ? "Already between 1 and 10, so the power is 0."
    : n > 0 ? "The decimal point moved " + k + pl + " to the left, so the power of 10 is " + n + "."
    : "The decimal point moved " + k + pl + " to the right, so the power of 10 is −" + k + ".";
}
$("#sci-in").addEventListener("input", drawSci);
drawSci();

/* ---------- practice ---------- */
function renderPractice(){
  if (state.view !== "setup" && !state.quiz) state.view = "setup";
  $("#p-setup").hidden = state.view !== "setup";
  $("#p-quiz").hidden = state.view !== "quiz";
  $("#p-results").hidden = state.view !== "results";
  if (state.view !== "quiz") stopTimer();
  if (state.view === "setup") renderSetup();
  else if (state.view === "quiz") renderQuestion();
  else renderResults();
}
function renderSetup(){
  const t = topic(), s = settings(t);
  $("#p-topic").textContent = topicLabel(t);
  seg($("#p-lvl"), "p-lvl", t.levels.map(l => [l.id, l.name]), s.lvl, v => { setSetting("lvl", v); $("#p-lvl-desc").textContent = t.levels.find(l => l.id === v).desc; renderPicker(); });
  $("#p-lvl-desc").textContent = t.levels.find(l => l.id === s.lvl).desc;
  seg($("#p-len"), "p-len", t.lengths.map(n => [n, String(n)]), s.len, v => { setSetting("len", Number(v)); renderPicker(); });
  seg($("#p-secs"), "p-secs", TIMER_OPTS, s.secs, v => { setSetting("secs", Number(v)); renderPicker(); });
  const cont = $("#p-continue"), done = Object.keys(state.answers).length;
  cont.hidden = !(state.quiz && state.quiz.topic === t.id && done < state.quiz.len);
  if (!cont.hidden) cont.textContent = "Continue your quiz (" + done + " of " + state.quiz.len + " answered)";
  $("#p-code-err").hidden = true;
}
function startQuiz(topicId, seed, len, lvl, secs){
  if (topicId !== state.topic) { state.topic = topicId; applyTopic(); }
  state.quiz = { topic:topicId, seed, len, lvl, secs:secs || 0 }; state.answers = {}; state.idx = 0; state.view = "quiz";
  loadQuiz(); save(); renderPractice(); scrollToTabs();
}
$("#p-start").addEventListener("click", () => { const s = settings(); startQuiz(state.topic, newSeed(), s.len, s.lvl, s.secs); });
$("#p-continue").addEventListener("click", () => { state.view = "quiz"; save(); renderPractice(); });
function loadCode(){
  const c = parseQuizCode($("#p-code-in").value), err = $("#p-code-err");
  if (!c) { err.hidden = false; err.textContent = "That code doesn't look right. It should look like D-7GK2QX-12-3."; return; }
  startQuiz(c.topic, c.seed, c.len, c.lvl, 0);
}
$("#p-code-load").addEventListener("click", loadCode);
$("#p-code-in").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); loadCode(); } });
$("#p-new").addEventListener("click", () => { state.view = "setup"; save(); renderPractice(); });
const quizCode = () => makeQuizCode(state.quiz.topic, state.quiz.seed, state.quiz.len, state.quiz.lvl);
$("#p-copy").addEventListener("click", () => copyText(quizCode(), $("#p-copy"), $("#p-code")));

function copyText(text, btn, fallbackEl){
  const done = () => { const t = btn.textContent; btn.textContent = "Copied"; setTimeout(() => { btn.textContent = t; }, 1500); };
  const select = () => { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  try { navigator.clipboard.writeText(text).then(done, select); } catch(e) { select(); }
}
window.copyText = copyText;

/* per-question timer (practice) */
let tick = 0, qStarted = {};
function stopTimer(){ if (tick) clearInterval(tick); tick = 0; const el = $("#p-timer"); if (el) el.hidden = true; }
function startTimer(q){
  stopTimer();
  const secs = state.quiz.secs; if (!secs) return;
  if (!qStarted[q.id]) qStarted[q.id] = Date.now();
  $("#p-timer").hidden = false;
  const step = () => {
    const rem = secs - (Date.now() - qStarted[q.id]) / 1000;
    $("#p-tbar").style.width = Math.max(0, rem / secs * 100) + "%";
    $("#p-tbar").parentElement.classList.toggle("low", rem <= 10);
    $("#p-tnum").textContent = Math.max(0, Math.ceil(rem));
    if (rem <= 0) { stopTimer(); check(true); }
  };
  tick = setInterval(step, 200); step();
}

function renderQuestion(){
  const card = $("#qcard");
  if (!Q.length) loadQuiz();
  state.idx = Math.max(0, Math.min(Q.length - 1, state.idx | 0));
  const q = Q[state.idx], rec = state.answers[q.id];
  $("#p-code").textContent = quizCode();
  $("#qbar").style.width = (Object.keys(state.answers).length / Q.length * 100) + "%";
  clearMath(card);
  card.innerHTML = qHeadHtml(q, "Question " + (state.idx + 1) + " of " + Q.length) + questionHtml(q, "s") +
    '<p class="small redtxt" id="qerr" role="alert" hidden></p>' +
    '<div class="hintbox" id="qhint" hidden><b>Hint.</b> ' + q.hint + "</div>" +
    '<div class="btnrow" id="qactions"><button class="btn" type="button" id="qcheck">Check answer</button>' +
      '<button class="btn ghost" type="button" id="qhintbtn">Show a hint</button></div>' +
    '<div id="qfeedback" class="stack"></div>' +
    '<div class="lfoot"><button class="btn quiet" type="button" id="qprev"' + (state.idx === 0 ? " disabled" : "") + ">Previous</button>" +
      '<button class="btn quiet" type="button" id="qnext">' + (state.idx === Q.length - 1 ? "See results" : "Next question") + "</button></div>";
  bindQuestion(q, card, "s");
  $("#qcheck").addEventListener("click", () => check(false));
  $("#qhintbtn").addEventListener("click", () => { $("#qhint").hidden = false; $("#qhintbtn").hidden = true; });
  $("#qprev").addEventListener("click", () => { state.idx--; save(); renderQuestion(); scrollToTabs(); });
  $("#qnext").addEventListener("click", nextQ);
  $$("input", card).forEach(inp => inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); state.answers[q.id] ? nextQ() : check(false); }
  }));
  if (rec) { stopTimer(); showFeedback(q, rec); }
  else {
    startTimer(q);
    const first = $("input", card); if (first && q.type !== "mc" && state.tab === "practice") first.focus({ preventScroll:true });
  }
  typeset(card);
}
function nextQ(){
  stopTimer();
  if (state.idx >= Q.length - 1) { state.view = "results"; save(); renderPractice(); scrollToTabs(); return; }
  state.idx++; save(); renderQuestion(); scrollToTabs();
}
function check(timedOut){
  const q = Q[state.idx], card = $("#qcard"), err = $("#qerr");
  if (!q || state.answers[q.id]) return;
  let rec = readAnswer(q, card, "s");
  if (!rec) {
    if (!timedOut) { err.hidden = false; err.textContent = MISSING_MSG(q); return; }
    rec = { timeout:true };
  }
  err.hidden = true; stopTimer();
  rec.correct = rec.timeout ? false : grade(q, rec);
  state.answers[q.id] = rec; save();
  showFeedback(q, rec);
  $("#qbar").style.width = (Object.keys(state.answers).length / Q.length * 100) + "%";
}
function showFeedback(q, rec){
  const card = $("#qcard"), r = rec.timeout ? null : rec;
  lockAnswer(q, card, "s", r);
  $("#qactions").hidden = true; $("#qhint").hidden = true;
  $("#qnext").classList.remove("quiet");
  const fb = $("#qfeedback");
  fb.innerHTML = feedbackHtml(q, r);
  typeset(fb);
}

let resetArmed = false;
function renderResults(){
  const box = $("#p-results"), t = TOPICS[state.quiz.topic];
  if (!Q.length) loadQuiz();
  const answered = Q.filter(q => state.answers[q.id]), right = answered.filter(q => state.answers[q.id].correct).length;
  const left = Q.length - answered.length, code = quizCode();
  const used = Object.keys(t.skills).filter(k => Q.some(q => q.skill === k));
  const rows = used.map(k => {
    const qs = Q.filter(q => q.skill === k);
    const ok = qs.filter(q => state.answers[q.id] && state.answers[q.id].correct).length;
    const wrong = qs.filter(q => state.answers[q.id] && !state.answers[q.id].correct).length;
    return '<div class="skill' + (wrong ? " weak" : "") + '"><span>' + esc(t.skills[k].name) + '</span><span class="frac">' + ok + " / " + qs.length + "</span>" +
      '<span class="meter"><i style="width:' + (ok / qs.length * 100) + '%"></i></span>' +
      (wrong ? '<span><button class="btn ghost small" type="button" data-lesson="' + t.skills[k].lesson + '">Review ' + (t.lessonNames.length > 1 ? "Lesson " + (t.skills[k].lesson + 1) : "the rules") + "</button></span>" : "") + "</div>";
  }).join("");
  const list = Q.map((q, i) => { const r = state.answers[q.id];
    return '<button type="button" data-q="' + i + '" class="' + (r ? (r.correct ? "ok" : "no") : "") + '" aria-label="Question ' + (i + 1) + (r ? (r.correct ? ", correct" : ", not correct") : ", not answered") + '">' + (i + 1) + "</button>"; }).join("");
  let msg;
  if (!answered.length) msg = "No answers yet.";
  else if (left) msg = left + " question" + (left > 1 ? "s" : "") + " still to go.";
  else if (right === Q.length) msg = "Full marks. Try a harder level next.";
  else if (right >= Q.length * 0.8) msg = "Strong work. Review the red skills, then try a new quiz.";
  else msg = "Good effort. Go back to the lessons for the red skills, then try a new quiz.";
  box.innerHTML = '<span class="eyebrow">' + esc(topicLabel(t)) + " · " + esc(levelName(t, state.quiz.lvl)) + "</span><h2>Your results</h2>" +
    '<div class="score"><span class="big">' + right + " / " + Q.length + '</span><span class="muted">' + esc(msg) + "</span></div>" +
    '<div class="codebar">Challenge a friend: share the quiz code <code id="r-code">' + code + '</code><button class="btn quiet" type="button" id="r-copy">Copy</button></div>' +
    '<h3>By skill</h3><div class="stack">' + rows + "</div>" +
    '<h3>Questions</h3><p class="small muted">Tap a number to open that question and read its solution again.</p><div class="qlist">' + list + "</div>" +
    '<div class="btnrow">' + (left ? '<button class="btn" type="button" id="r-continue">Continue the quiz</button>' : '<button class="btn" type="button" id="r-new">New random quiz</button>') +
      '<button class="btn quiet" type="button" id="r-retry">' + (resetArmed ? "Click again to clear your answers" : "Redo this same quiz") + "</button></div>";
  $$("[data-q]", box).forEach(b => b.addEventListener("click", () => { state.idx = Number(b.dataset.q); state.view = "quiz"; save(); renderPractice(); scrollToTabs(); }));
  $("#r-copy").addEventListener("click", () => copyText(code, $("#r-copy"), $("#r-code")));
  const c = $("#r-continue");
  if (c) c.addEventListener("click", () => { state.idx = Math.max(0, Q.findIndex(q => !state.answers[q.id])); state.view = "quiz"; save(); renderPractice(); });
  const n = $("#r-new");
  if (n) n.addEventListener("click", () => { state.view = "setup"; save(); renderPractice(); });
  $("#r-retry").addEventListener("click", () => {
    if (!resetArmed) { resetArmed = true; renderResults(); return; }
    resetArmed = false; qStarted = {}; const z = state.quiz; startQuiz(z.topic, z.seed, z.len, z.lvl, z.secs);
  });
}

/* ---------- boot ---------- */
window.ExpLab = { showTab, openLesson, setTopic, currentTopic: () => state.topic, refreshPicker: renderPicker };
loadQuiz();
applyTopic();
let start = state.tab;
try {
  const h = (location.hash || "").replace("#", "");
  const qm = h.match(/^q-(.+)$/i), c = qm && parseQuizCode(qm[1]);
  if (c) { state.topic = c.topic; applyTopic(); state.quiz = { topic:c.topic, seed:c.seed, len:c.len, lvl:c.lvl, secs:0 }; state.answers = {}; state.idx = 0; state.view = "quiz"; loadQuiz(); start = "practice"; }
  else if (/^topic-/i.test(h) && TOPICS[h.slice(6).toLowerCase()]) { setTopic(h.slice(6).toLowerCase()); start = "start"; }
  else if (PANELS.includes(h)) start = h;
  if (/^join-/i.test(h) || new URLSearchParams(location.search).get("join")) start = "battle";
} catch(e) {}
showTab(start, { noScroll:true });
})();
