/* ===== Topic registry: Year -> Subject -> Topic =====
   To add a topic: write its question builder (seeded through seededRandom / ri / pick), then registerTopic({...}).
   Each topic gives: id, code (one capital letter, used in quiz codes), year, subject, name, blurb,
   levels [{id, name, desc}], defaultLevel, lengths, defaultLen, defaultSecs, skills, lessonNames, build(seed, len, lvl). */
const TOPICS = {}, TOPIC_LIST = [];
function registerTopic(t){ TOPICS[t.id] = t; TOPIC_LIST.push(t); }

registerTopic({
  id:"exponents", code:"E", year:10, subject:"Math", name:"Exponent laws",
  blurb:"Product, quotient and power laws, zero and negative exponents, fractional exponents, same base and scientific notation.",
  levels:[
    { id:"M", name:"Mixed", desc:"Easy to hard like a real test: Levels 1–4, then 5–6, then 7–8." },
    { id:"A", name:"Level 1–4", desc:"The core laws, numbers in front, power 0, simple negative and fractional exponents." },
    { id:"B", name:"Level 5–6", desc:"Negative and fractional exponents, roots, scientific notation, find the mistake." },
    { id:"C", name:"Level 7–8", desc:"Same base, letters in the exponent, exponential equations." }],
  defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:90,
  skills:SKILLS, lessonNames:LESSON_NAMES,
  build(seed, len, lvl){
    return buildQuiz(seed, len, lvl).map(q => Object.assign(q, { chipText:LEVEL_LABELS[q.level], chipCls:q.level, tagText:SKILLS[q.skill].short }));
  }
});

registerTopic({
  id:"decimals", code:"D", year:8, subject:"Math", name:"Decimals",
  blurb:"Comparing, ordering, adding, subtracting, multiplying and dividing decimals, with word problems.",
  levels: DEC.LEVELS.map((l, i) => ({ id:String(i + 1), name:l.name, desc:l.desc })),
  defaultLevel:"3", lengths:[6,12,18], defaultLen:12, defaultSecs:60,
  skills: Object.fromEntries(DEC.ORDER.map(t => [t, { name:DEC.T[t].name + ": " + DEC.T[t].rule, short:DEC.T[t].name, lesson:0 }])),
  lessonNames:["Key rules"],
  build(seed, len, lvl){
    seedRng(seed);
    const L = DEC.clampL(Number(lvl));
    return DEC.buildN(len, L).map(d => adaptDecimal(d, L));
  }
});

/* Turn a decimal-quiz question into the shared question shape used by quizui.js */
function adaptDecimal(d, L){
  const base = { family:"dec-" + d.topic + "-" + d.sub, skill:d.topic, lesson:0, level:"l5",
    chipText:DEC.LEVELS[L - 1].name, chipCls:"l5", tagText:DEC.T[d.topic].name,
    promptHtml:d.text, workHtml:d.work, hint:d.hint, key:DEC.T[d.topic].rule };
  if (d.kind === "cmp") return Object.assign(base, {
    type:"mc", choiceRow:true,
    exprHtml:'<div class="expr"><span class="side">' + DEC.NS(d.a) + '</span> <span class="box">?</span> <span class="side">' + DEC.NS(d.b) + "</span></div>",
    options:[["<","is less than"],["=","is equal to"],[">","is greater than"]].map(([s, l]) =>
      ({ label:s + " " + l, html:'<span class="sign">' + DEC.esc(s) + '</span><span class="lbl">' + l + "</span>", correct:s === d.ans, fb:d.cmpMsg })),
    answerHtml:DEC.NS(d.answerText) });
  if (d.kind === "order") return Object.assign(base, {
    type:"order", items:d.items, correct:d.correct, dir:d.dir,
    itemHtml:s => DEC.N(s), answerHtml:DEC.NS(d.answerText),
    diagnose:rec => DEC.diagnoseOrder(d, rec.ord) });
  const pre = d.unit.pre || "", suf = d.unit.suf || "";
  return Object.assign(base, {
    type:"num", exprHtml:d.expr ? '<div class="expr">' + d.expr + "</div>" : "",
    answer:d.val, pre, suf, parse:DEC.parseAns,
    missingMsg:"Type a number, like 3.75.",
    answerHtml:(pre ? DEC.esc(pre) : "") + DEC.N(d.answer) + (suf ? " " + DEC.esc(suf) : ""),
    diagnose:rec => DEC.diagnoseNum(d, rec.vals.v) });
}

/* Quiz codes: TOPIC-SEED-LENGTH-LEVEL, e.g. D-7GK2QX-12-3. Old exponent codes (7GK2QX-15M) still work. */
function makeQuizCode(topicId, seed, len, lvl){ return TOPICS[topicId].code + "-" + seed.toString(36).toUpperCase() + "-" + len + "-" + lvl; }
function parseQuizCode(code){
  const s = String(code || "").trim().toUpperCase().replace(/\s+/g, "");
  const m = s.match(/^([A-Z])-([0-9A-Z]{1,7})-(\d{1,2})-([0-9A-Z])$/);
  if (m) {
    const t = TOPIC_LIST.find(x => x.code === m[1]), len = Number(m[3]);
    if (!t || !t.levels.some(l => l.id === m[4]) || len < 1 || len > 30) return null;
    return { topic:t.id, seed:parseInt(m[2], 36), len, lvl:m[4] };
  }
  const old = parseCode(s);
  return old ? Object.assign({ topic:"exponents" }, old) : null;
}
function buildTopicQuiz(topicId, seed, len, lvl){
  const t = TOPICS[topicId] || TOPICS.exponents, qs = t.build(seed, len, lvl);
  qs.forEach((q, i) => { q.id = i + 1; q.topicId = t.id; });
  return qs;
}
const topicLabel = t => "Year " + t.year + " · " + t.subject + " · " + t.name;
const levelName = (t, id) => (t.levels.find(l => l.id === String(id)) || t.levels[0]).name;
if (typeof module !== "undefined") module.exports = { TOPICS, TOPIC_LIST, buildTopicQuiz, makeQuizCode, parseQuizCode };
