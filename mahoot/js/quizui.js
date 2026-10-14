/* ===== Shared question rendering, grading and feedback (solo practice + battle) ===== */
const SKILLS = {
  laws:  { name:"Core laws (add, subtract, multiply exponents)", short:"Core laws", lesson:2 },
  finish:{ name:"Finish the job (numbers, letters, power 0)", short:"Finish the job", lesson:1 },
  frac:  { name:"Fractional exponents: root first", short:"Fractional exponents", lesson:4 },
  neg:   { name:"Negative exponents and the lift rule", short:"Negative exponents", lesson:3 },
  roots: { name:"Roots into exponents", short:"Roots into exponents", lesson:4 },
  base:  { name:"Same base (powers of 2, 3, 5)", short:"Same base", lesson:5 },
  sci:   { name:"Scientific notation", short:"Scientific notation", lesson:6 }
};
const LESSON_NAMES = ["Powers","Dividing","Brackets","Negative exponents","Fractional exponents","Same base","Scientific notation","Cheat sheet"];

const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function typeset(el){
  const mj = window.MathJax;
  if (!mj || !mj.typesetPromise || !el) return;
  const ready = (mj.startup && mj.startup.promise) || Promise.resolve();
  ready.then(() => mj.typesetPromise([el])).catch(() => {});
}
function clearMath(el){ const mj = window.MathJax; try { if (mj && mj.typesetClear && el) mj.typesetClear([el]); } catch(e) {} }

function parseNum(str){
  const s = String(str || "").trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/,/g, ".");
  if (!s || !/^[-+]?(\d+\.?\d*|\.\d+)(\/[-+]?(\d+\.?\d*|\.\d+))?$/.test(s)) return NaN;
  const [a, b] = s.split("/"), v = b === undefined ? Number(a) : Number(a) / Number(b);
  return isFinite(v) ? v : NaN;
}
function near(a, b, tol){ tol = tol || 1e-6; if (b === 0) return Math.abs(a) < 1e-9; return Math.abs(a - b) <= tol * Math.abs(b); }
function fmtNum(v){ return Number.isInteger(v) ? String(v) : String(+v.toFixed(6)); }
function fieldsTex(q, vals){
  let out = "", lastLetterAt = -1, afterTen = false;
  q.parts.forEach((p, i) => {
    if (p.c) { const v = vals[p.c], nextIsVar = q.parts[i + 1] && q.parts[i + 1].v; out += (near(v, 1, 1e-9) && nextIsVar) ? "" : fmtNum(v); }
    else if (p.v) { lastLetterAt = out.length; out += p.v; afterTen = false; }
    else if (p.t) { out += "\\times 10"; afterTen = true; }
    else if (p.sup) {
      const v = vals[p.sup];
      if (afterTen) out += "^{" + fmtNum(v) + "}";
      else if (near(v, 0, 1e-9)) out = out.slice(0, lastLetterAt);
      else if (!near(v, 1, 1e-9)) out += "^{" + fmtNum(v) + "}";
    }
  });
  return out || "1";
}
function answerTex(q){
  if (q.type === "fields") return fieldsTex(q, q.answer);
  if (q.type === "num") return q.answerTex || fmtNum(q.answer);
  const o = q.options.find(o => o.correct); return o.tex || ("\\text{" + o.label + "}");
}

/* HTML for the question: prompt, expression, worked lines, answer inputs. ns keeps ids unique per screen. */
function questionHtml(q, ns){
  const id = k => ns + "-" + q.id + "-" + k;
  let ans;
  if (q.type === "fields") {
    ans = '<div class="ans">' + q.parts.map((p, i) => {
      if (p.c) return '<input id="' + id(p.c) + '" class="' + (p.wide ? "wide" : "") + '" inputmode="text" autocomplete="off" aria-label="Number in front">';
      if (p.v) return '<span class="lv">' + p.v + '</span>';
      if (p.t) return '<span class="times">×</span><span>10</span>';
      const prev = q.parts[i - 1];
      return '<input id="' + id(p.sup) + '" class="sup" inputmode="text" autocomplete="off" aria-label="Exponent of ' + (prev && prev.v ? prev.v : "10") + '">';
    }).join("") + "</div>";
  } else if (q.type === "num") {
    ans = '<div class="ans">' + (q.prefix ? '<span class="lv">' + q.prefix + '</span><span>&nbsp;=&nbsp;</span>' : "") +
      '<input id="' + id("v") + '" class="wide" inputmode="text" autocomplete="off" aria-label="Your answer" placeholder="answer"></div>';
  } else {
    ans = '<div class="choices" role="radiogroup" aria-label="Choices">' + q.options.map((o, i) =>
      '<label class="choice" id="' + id("opt" + i) + '"><input type="radio" name="' + id("mc") + '" value="' + i + '"><span>' +
      (o.tex ? "\\(" + o.tex + "\\)" : esc(o.label)) + "</span></label>").join("") + "</div>";
  }
  const work = q.work ? "<div>" + q.work.map((w, i) =>
    '<div class="workline"><span class="ln">Line ' + (i + 1) + '</span><span class="m">\\(\\displaystyle ' + w + "\\)</span></div>").join("") + "</div>" : "";
  return '<p class="qprompt">' + q.prompt + "</p>" +
    '<div class="qmath">\\[' + q.tex + "\\]</div>" + work + ans +
    (q.note ? '<p class="fieldnote">' + esc(q.note) + "</p>" : "");
}

function readAnswer(q, root, ns){
  const id = k => "#" + ns + "-" + q.id + "-" + k;
  if (q.type === "mc") { const c = $('input[name="' + ns + "-" + q.id + '-mc"]:checked', root); return c ? { choice:Number(c.value) } : null; }
  const keys = q.type === "num" ? ["v"] : q.parts.filter(p => p.c || p.sup).map(p => p.c || p.sup);
  const vals = {}, raw = {};
  for (const k of keys) {
    const el = $(id(k), root); raw[k] = el.value; vals[k] = parseNum(el.value);
    if (isNaN(vals[k])) return null;
  }
  return { vals, raw };
}
function grade(q, rec){
  if (!rec) return false;
  if (q.type === "mc") return !!(q.options[rec.choice] && q.options[rec.choice].correct);
  if (q.type === "num") return near(rec.vals.v, q.answer);
  return Object.keys(q.answer).every(k => near(rec.vals[k], q.answer[k]));
}
const MISSING_MSG = q => q.type === "mc" ? "Pick one of the choices first." : "Fill in every box with a number. Fractions like 3/4 and negative numbers like -2 are fine.";

/* Show what was entered, lock the inputs, colour right and wrong parts. rec may be null (no answer in time). */
function lockAnswer(q, root, ns, rec, noMarks){
  const id = k => "#" + ns + "-" + q.id + "-" + k;
  $$("input", root).forEach(i => { i.disabled = true; });
  if (q.type === "mc") {
    q.options.forEach((o, i) => {
      const lab = $(id("opt" + i), root); if (!lab) return;
      const inp = $("input", lab); inp.checked = !!rec && rec.choice === i;
      if (noMarks) return;
      if (o.correct) lab.classList.add("right"); else if (rec && rec.choice === i) lab.classList.add("wrong");
    });
  } else if (rec) {
    Object.keys(rec.raw).forEach(k => {
      const el = $(id(k), root); if (!el) return;
      el.value = rec.raw[k];
      if (noMarks) return;
      const target = q.type === "num" ? q.answer : q.answer[k];
      el.classList.add(near(rec.vals[k], target) ? "ok" : "no");
    });
  }
}
function mistakeNotes(q, rec){
  if (!rec || rec.correct) return [];
  if (q.type === "mc") { const o = q.options[rec.choice]; return o && o.fb ? [o.fb] : []; }
  return (q.mistakes || []).filter(m => Object.keys(m.when).every(k => rec.vals[k] !== undefined && near(rec.vals[k], m.when[k], 5e-3))).map(m => m.msg);
}
function yourAnswerHtml(q, rec){
  if (!rec) return "no answer";
  if (q.type === "mc") { const o = q.options[rec.choice]; return o.tex ? "\\(" + o.tex + "\\)" : esc(o.label); }
  if (q.type === "num") return (q.prefix ? q.prefix + " = " : "") + esc(rec.raw.v);
  return "\\(" + fieldsTex(q, rec.vals) + "\\)";
}
/* Verdict + full worked solution. opts: { headline, extra, lessonButton:true } */
function feedbackHtml(q, rec, opts){
  opts = opts || {};
  const correct = !!(rec && rec.correct), notes = mistakeNotes(q, rec);
  const okMsgs = ["That's it.", "Spot on.", "Clean work.", "Exactly right."];
  const verdict = correct
    ? '<div class="verdict ok"><h3>' + (opts.headline || "Correct") + "</h3><p>" + (opts.extra || okMsgs[q.id % okMsgs.length] + " Check that your method matches the solution, step by step.") + "</p></div>"
    : '<div class="verdict no"><h3>' + (opts.headline || (rec ? "Not quite" : "Time's up")) + "</h3>" + (opts.extra ? "<p>" + opts.extra + "</p>" : "") +
      "<p>Your answer: " + yourAnswerHtml(q, rec) + " &nbsp;·&nbsp; Correct answer: <b>\\(" + answerTex(q) + "\\)</b></p>" +
      (notes.length ? notes.map(n => "<p><b>What probably happened:</b> " + n + "</p>").join("")
        : (rec ? "<p>Compare your working with the solution below and find the first line where yours is different.</p>" : "")) + "</div>";
  const steps = '<ol class="steps">' + q.steps.map(s =>
    '<li><div><div class="m">\\(\\displaystyle ' + s.m + '\\)</div><p class="why">' + s.why + "</p></div></li>").join("") + "</ol>";
  return verdict + '<div class="explain"><h4>Full solution</h4>' + steps + '<p class="keyidea">' + q.key + "</p>" +
    (opts.lessonButton === false ? "" : '<p class="lessonlink"><button class="btn ghost" type="button" data-lesson="' + q.lesson + '">Review Lesson ' + (q.lesson + 1) + ": " + LESSON_NAMES[q.lesson] + "</button></p>") + "</div>";
}
