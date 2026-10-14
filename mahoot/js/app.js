/* ===== App shell: tabs, lessons, solo practice ===== */
(function(){
const KEY = "exponent-lab-v2";
const PANELS = ["start","learn","practice","battle"];
let state = { tab:"start", lesson:0, quiz:null, idx:0, answers:{}, view:"setup", setup:{ len:15, lvl:"M" } };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === "object") state = Object.assign(state, s); } catch(e) {}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {} }
let Q = [];
function loadQuiz(){ Q = state.quiz ? buildQuiz(state.quiz.seed, state.quiz.len, state.quiz.lvl) : []; }
function scrollToTabs(){ const t = $(".tabs"); window.scrollTo({ top: Math.max(0, t.offsetTop - 4) }); }

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

/* ---------- lessons ---------- */
const lessons = $$(".lesson"), lnav = $("#lnav");
lessons.forEach((l, i) => {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = (i + 1) + " " + l.dataset.title;
  b.addEventListener("click", () => showLesson(i, true));
  lnav.appendChild(b);
});
function showLesson(i, scroll){
  i = Math.max(0, Math.min(lessons.length - 1, i | 0));
  state.lesson = i; save();
  lessons.forEach((l, j) => { l.hidden = j !== i; });
  $$("button", lnav).forEach((b, j) => b.setAttribute("aria-current", j === i ? "true" : "false"));
  $("#lprev").disabled = i === 0;
  $("#lnext").textContent = i === lessons.length - 1 ? "Start a practice quiz" : "Next lesson";
  if (scroll) scrollToTabs();
}
$("#lprev").addEventListener("click", () => showLesson(state.lesson - 1, true));
$("#lnext").addEventListener("click", () => { if (state.lesson >= lessons.length - 1) showTab("practice"); else showLesson(state.lesson + 1, true); });
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
  if (state.view === "setup") renderSetup();
  else if (state.view === "quiz") renderQuestion();
  else renderResults();
}
function renderSetup(){
  $$('input[name="p-len"]').forEach(r => { r.checked = Number(r.value) === state.setup.len; });
  $$('input[name="p-lvl"]').forEach(r => { r.checked = r.value === state.setup.lvl; });
  const cont = $("#p-continue"), done = Object.keys(state.answers).length;
  cont.hidden = !(state.quiz && done < state.quiz.len);
  if (state.quiz) cont.textContent = "Continue your quiz (" + done + " of " + state.quiz.len + " answered)";
  $("#p-code-err").hidden = true;
}
function startQuiz(seed, len, lvl){
  state.quiz = { seed, len, lvl }; state.answers = {}; state.idx = 0; state.view = "quiz";
  loadQuiz(); save(); renderPractice(); scrollToTabs();
}
$$('input[name="p-len"]').forEach(r => r.addEventListener("change", () => { state.setup.len = Number(r.value); save(); }));
$$('input[name="p-lvl"]').forEach(r => r.addEventListener("change", () => { state.setup.lvl = r.value; save(); }));
$("#p-start").addEventListener("click", () => startQuiz(newSeed(), state.setup.len, state.setup.lvl));
$("#p-continue").addEventListener("click", () => { state.view = "quiz"; save(); renderPractice(); });
function loadCode(){
  const c = parseCode($("#p-code-in").value), err = $("#p-code-err");
  if (!c) { err.hidden = false; err.textContent = "That code doesn't look right. It should look like 7GK2QX-15M."; return; }
  startQuiz(c.seed, c.len, c.lvl);
}
$("#p-code-load").addEventListener("click", loadCode);
$("#p-code-in").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); loadCode(); } });
$("#p-new").addEventListener("click", () => { state.view = "setup"; save(); renderPractice(); });
$("#p-copy").addEventListener("click", () => copyText(makeCode(state.quiz.seed, state.quiz.len, state.quiz.lvl), $("#p-copy"), $("#p-code")));

function copyText(text, btn, fallbackEl){
  const done = () => { const t = btn.textContent; btn.textContent = "Copied"; setTimeout(() => { btn.textContent = t; }, 1500); };
  const select = () => { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  try { navigator.clipboard.writeText(text).then(done, select); } catch(e) { select(); }
}
window.copyText = copyText;

function renderQuestion(){
  const card = $("#qcard");
  if (!Q.length) loadQuiz();
  state.idx = Math.max(0, Math.min(Q.length - 1, state.idx | 0));
  const q = Q[state.idx], rec = state.answers[q.id];
  $("#p-code").textContent = makeCode(state.quiz.seed, state.quiz.len, state.quiz.lvl);
  $("#qbar").style.width = (Object.keys(state.answers).length / Q.length * 100) + "%";
  clearMath(card);
  card.innerHTML =
    '<div class="qhead"><span class="count">Question ' + (state.idx + 1) + " of " + Q.length + "</span>" +
      '<span class="lvl ' + q.level + '">' + LEVEL_LABELS[q.level] + '</span><span class="tag">' + esc(SKILLS[q.skill].short) + "</span></div>" +
    questionHtml(q, "s") +
    '<p class="small redtxt" id="qerr" role="alert" hidden></p>' +
    '<div class="hintbox" id="qhint" hidden><b>Hint.</b> ' + q.hint + "</div>" +
    '<div class="btnrow" id="qactions"><button class="btn" type="button" id="qcheck">Check answer</button>' +
      '<button class="btn ghost" type="button" id="qhintbtn">Show a hint</button></div>' +
    '<div id="qfeedback" class="stack"></div>' +
    '<div class="lfoot"><button class="btn quiet" type="button" id="qprev"' + (state.idx === 0 ? " disabled" : "") + ">Previous</button>" +
      '<button class="btn quiet" type="button" id="qnext">' + (state.idx === Q.length - 1 ? "See results" : "Next question") + "</button></div>";
  $("#qcheck").addEventListener("click", check);
  $("#qhintbtn").addEventListener("click", () => { $("#qhint").hidden = false; $("#qhintbtn").hidden = true; });
  $("#qprev").addEventListener("click", () => { state.idx--; save(); renderQuestion(); scrollToTabs(); });
  $("#qnext").addEventListener("click", nextQ);
  $$("input", card).forEach(inp => inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); state.answers[q.id] ? nextQ() : check(); }
  }));
  if (rec) showFeedback(q, rec);
  else { const first = $("input", card); if (first && q.type !== "mc" && state.tab === "practice") first.focus({ preventScroll:true }); }
  typeset(card);
}
function nextQ(){
  if (state.idx >= Q.length - 1) { state.view = "results"; save(); renderPractice(); scrollToTabs(); return; }
  state.idx++; save(); renderQuestion(); scrollToTabs();
}
function check(){
  const q = Q[state.idx], card = $("#qcard"), rec = readAnswer(q, card, "s"), err = $("#qerr");
  if (!rec) { err.hidden = false; err.textContent = MISSING_MSG(q); return; }
  err.hidden = true;
  rec.correct = grade(q, rec);
  state.answers[q.id] = rec; save();
  showFeedback(q, rec);
  $("#qbar").style.width = (Object.keys(state.answers).length / Q.length * 100) + "%";
}
function showFeedback(q, rec){
  const card = $("#qcard");
  lockAnswer(q, card, "s", rec);
  $("#qactions").hidden = true; $("#qhint").hidden = true;
  $("#qnext").classList.remove("quiet");
  const fb = $("#qfeedback");
  fb.innerHTML = feedbackHtml(q, rec);
  typeset(fb);
}

let resetArmed = false;
function renderResults(){
  const box = $("#p-results");
  if (!Q.length) loadQuiz();
  const answered = Q.filter(q => state.answers[q.id]), right = answered.filter(q => state.answers[q.id].correct).length;
  const left = Q.length - answered.length, code = makeCode(state.quiz.seed, state.quiz.len, state.quiz.lvl);
  const used = Object.keys(SKILLS).filter(k => Q.some(q => q.skill === k));
  const rows = used.map(k => {
    const qs = Q.filter(q => q.skill === k);
    const ok = qs.filter(q => state.answers[q.id] && state.answers[q.id].correct).length;
    const wrong = qs.filter(q => state.answers[q.id] && !state.answers[q.id].correct).length;
    return '<div class="skill' + (wrong ? " weak" : "") + '"><span>' + esc(SKILLS[k].name) + '</span><span class="frac">' + ok + " / " + qs.length + "</span>" +
      '<span class="meter"><i style="width:' + (ok / qs.length * 100) + '%"></i></span>' +
      (wrong ? '<span><button class="btn ghost" type="button" data-lesson="' + SKILLS[k].lesson + '" style="padding:4px 10px;font-size:.85rem">Review Lesson ' + (SKILLS[k].lesson + 1) + "</button></span>" : "") + "</div>";
  }).join("");
  const list = Q.map((q, i) => { const r = state.answers[q.id];
    return '<button type="button" data-q="' + i + '" class="' + (r ? (r.correct ? "ok" : "no") : "") + '" aria-label="Question ' + (i + 1) + (r ? (r.correct ? ", correct" : ", not correct") : ", not answered") + '">' + (i + 1) + "</button>"; }).join("");
  let msg;
  if (!answered.length) msg = "No answers yet.";
  else if (left) msg = left + " question" + (left > 1 ? "s" : "") + " still to go.";
  else if (right === Q.length) msg = "Full marks. Try a harder level next.";
  else if (right >= Q.length * 0.8) msg = "Strong work. Review the red skills, then try a new quiz.";
  else msg = "Good effort. Go back to the lessons for the red skills, then try a new quiz.";
  box.innerHTML = "<h2>Your results</h2>" +
    '<div class="score"><span class="big">' + right + " / " + Q.length + '</span><span class="muted">' + esc(msg) + "</span></div>" +
    '<div class="codebar">Challenge a friend: share the quiz code <code id="r-code">' + code + '</code><button class="btn quiet" type="button" id="r-copy">Copy</button></div>' +
    "<h3>By skill</h3><div class=\"stack\">" + rows + "</div>" +
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
    resetArmed = false; startQuiz(state.quiz.seed, state.quiz.len, state.quiz.lvl);
  });
}

/* ---------- boot ---------- */
window.ExpLab = { showTab, openLesson };
loadQuiz();
showLesson(state.lesson || 0, false);
let start = state.tab;
try {
  const h = (location.hash || "").replace("#", "");
  const qm = h.match(/^q-(.+)$/i);
  if (qm && parseCode(qm[1])) { const c = parseCode(qm[1]); state.quiz = { seed:c.seed, len:c.len, lvl:c.lvl }; state.answers = {}; state.idx = 0; state.view = "quiz"; loadQuiz(); start = "practice"; }
  else if (PANELS.includes(h)) start = h;
  if (/^join-/i.test(h) || new URLSearchParams(location.search).get("join")) start = "battle";
} catch(e) {}
showTab(start, { noScroll:true });
})();
