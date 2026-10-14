/* Validates every registered topic. From the mahoot folder run:  node tools/validate-topics.js [topicId ...]
   Loads the site's own js/ files in the same order as index.html. Needs Node.js only. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const SRC = path.join(__dirname, "..", "js");
const ctx = { console, Math, Number, String, Object, Array, JSON, Set, Map, isFinite, isNaN, parseInt, parseFloat, Date, RegExp, Error, Boolean, Symbol };
ctx.window = ctx; ctx.document = { querySelector(){ return null; }, querySelectorAll(){ return []; } };
vm.createContext(ctx);
const topicFiles = fs.readdirSync(path.join(SRC, "topics")).filter(f => f.endsWith(".js")).sort().map(f => "topics/" + f);
for (const f of ["questions.js", "topic-decimals.js", "quizui.js", "topics.js", "topic-kit.js", ...topicFiles]) {
  const code = fs.readFileSync(path.join(SRC, f), "utf8");
  if (/Math\.random/.test(code) && f.startsWith("topics/")) { console.log(`FAIL ${f}: uses Math.random (use ri/pick/shuffle/seededRandom)`); process.exitCode = 1; }
  try { vm.runInContext(code.replace(/^const /gm, "var ").replace(/^let /gm, "var "), ctx, { filename:f }); }
  catch (e) { console.log(`FAIL loading ${f}: ${e.message}`); process.exit(1); }
}
const { TOPIC_LIST, buildTopicQuiz, grade } = ctx;
const only = process.argv.slice(2);
const TAGS = ["div","p","b","i","strong","em","span","ul","ol","li","table","tr","td","th","sub","sup","h3","h4","small","thead","tbody"];
function tagIssues(html){
  if (typeof html !== "string") return "";
  const bad = [];
  for (const t of TAGS) {
    const open = (html.match(new RegExp("<" + t + "(\\s[^>]*)?>", "g")) || []).length, close = (html.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (open !== close) bad.push(`<${t}> ${open} open / ${close} closed`);
  }
  return bad.join(", ");
}
const strip = q => JSON.stringify(q, (k, v) => typeof v === "function" ? undefined : v);
let failures = 0, warnings = 0;
for (const t of TOPIC_LIST) {
  if (only.length && !only.includes(t.id)) continue;
  const fails = new Map(), warns = new Map(), stats = { n:0, types:{}, skills:{}, prompts:new Set() };
  const F = (m) => fails.set(m, (fails.get(m) || 0) + 1), W = (m) => warns.set(m, (warns.get(m) || 0) + 1);
  for (const k of ["id","code","year","subject","name","blurb","levels","defaultLevel","lengths","defaultLen","defaultSecs","skills","build"]) if (t[k] == null) F("topic missing " + k);
  if (t.lessons) t.lessons.forEach((l, i) => { const ti = tagIssues(l.html); if (ti) F(`lesson ${i + 1} HTML: ${ti}`); });
  if (t.introHtml) { const ti = tagIssues(t.introHtml); if (ti) F("introHtml: " + ti); }
  for (const l of t.levels) for (const len of t.lengths) for (let s = 0; s < 30; s++) {
    const seed = 1000003 * s + len * 31 + l.id.charCodeAt(0);
    let a, b;
    try { a = buildTopicQuiz(t.id, seed, len, l.id); b = buildTopicQuiz(t.id, seed, len, l.id); } catch (e) { F("build threw: " + e.message); continue; }
    if (a.length !== len) F(`level ${l.id} len ${len}: got ${a.length} questions`);
    if (strip(a) !== strip(b)) F("not deterministic: same seed gave different questions (check for Math.random or Date)");
    const seen = new Map();
    for (const q of a) {
      stats.n++; stats.types[q.type] = (stats.types[q.type] || 0) + 1; stats.skills[q.skill] = (stats.skills[q.skill] || 0) + 1;
      const sig = (q.promptHtml || q.prompt || "") + "|" + (q.exprHtml || q.tex || "");
      stats.prompts.add(sig);
      seen.set(sig, (seen.get(sig) || 0) + 1);
      const js = strip(q);
      if (/undefined|NaN|\[object |Infinity/.test(js)) F(`${q.family}: text contains undefined/NaN/[object]`);
      if (!["mc","num","fields","order","text"].includes(q.type)) F(`${q.family}: unknown type ${q.type}`);
      if (!(q.promptHtml || q.prompt)) F(`${q.family}: no prompt`);
      if (q.workHtml == null && !(q.steps && q.steps.length)) F(`${q.family}: no explanation (workHtml or steps)`);
      if (!q.key) F(`${q.family}: no key idea`);
      if (!t.skills[q.skill]) F(`${q.family}: skill ${q.skill} not in topic.skills`);
      if (t.lessonNames && t.lessonNames.length && (q.lesson == null || q.lesson >= t.lessonNames.length)) F(`${q.family}: lesson index ${q.lesson} out of range`);
      for (const f of ["promptHtml","exprHtml","workHtml","hint","key","answerHtml"]) { const ti = tagIssues(q[f]); if (ti) F(`${q.family}: ${f} HTML ${ti}`); }
      try {
        if (q.type === "mc") {
          const c = q.options.filter(o => o.correct).length;
          if (c !== 1) F(`${q.family}: ${c} correct options`);
          if (q.options.length < 2) F(`${q.family}: fewer than 2 options`);
          const htmls = q.options.map(o => o.html || o.tex || o.label);
          if (new Set(htmls).size !== htmls.length) F(`${q.family}: duplicate options`);
          if (q.options.some(o => !o.correct && !o.fb)) W(`${q.family}: wrong option without fb`);
          for (const o of q.options) { const ti = tagIssues(o.html); if (ti) F(`${q.family}: option HTML ${ti}`); }
        } else if (q.type === "text") {
          if (!Array.isArray(q.answers) || !q.answers.length || q.answers.some(x => typeof x !== "string" || !x.trim())) F(`${q.family}: bad answers list`);
          else if (!grade(q, { raw:{ t:q.answers[0] } })) F(`${q.family}: own answer not accepted`);
          else if (grade(q, { raw:{ t:"zzzz" } })) F(`${q.family}: nonsense accepted`);
        } else if (q.type === "num") {
          if (!isFinite(q.answer)) F(`${q.family}: answer not finite`);
          else if (!grade(q, { vals:{ v:q.answer }, raw:{ v:String(q.answer) } })) F(`${q.family}: own answer not accepted`);
          if (q.parse) { const shown = String(q.answer); if (!(Math.abs(q.parse(shown) - q.answer) < 1e-9 * Math.max(1, Math.abs(q.answer)))) F(`${q.family}: parse(${shown}) mismatch`); }
        } else if (q.type === "fields") {
          const keys = q.parts.filter(p => p.c || p.sup).map(p => p.c || p.sup).sort().join();
          if (keys !== Object.keys(q.answer).sort().join()) F(`${q.family}: parts keys ${keys} vs answer keys ${Object.keys(q.answer).sort().join()}`);
          else if (!grade(q, { vals:q.answer, raw:Object.fromEntries(Object.entries(q.answer).map(([k, v]) => [k, String(v)])) })) F(`${q.family}: own answer not accepted`);
        } else if (q.type === "order") {
          if (q.correct.slice().sort((x, y) => x - y).join() !== q.items.map((_, i) => i).join()) F(`${q.family}: correct is not a permutation`);
          if (!grade(q, { ord:q.correct.slice() })) F(`${q.family}: own order not accepted`);
          if (q.items.length > 1 && grade(q, { ord:q.correct.slice().reverse() })) F(`${q.family}: reversed order accepted`);
        }
      } catch (e) { F(`${q.family}: check threw ${e.message}`); }
    }
    for (const [sig, c] of seen) if (c > 1 && len <= 12) W(`repeated question within one ${len}-question quiz`);
  }
  console.log(`\n${t.id} (${t.code}) Year ${t.year} ${t.subject} · ${t.name}: ${stats.n} questions, ${stats.prompts.size} distinct prompts`);
  console.log("  types " + JSON.stringify(stats.types) + "  skills " + JSON.stringify(stats.skills));
  for (const [m, c] of fails) console.log(`  FAIL ${m}${c > 1 ? ` (x${c})` : ""}`);
  for (const [m, c] of [...warns].slice(0, 8)) console.log(`  warn ${m}${c > 1 ? ` (x${c})` : ""}`);
  failures += fails.size; warnings += warns.size;
}
console.log(failures ? `\n${failures} kinds of failure` : "\nall topics valid", warnings ? `(${warnings} kinds of warning)` : "");
process.exitCode = failures ? 1 : 0;
