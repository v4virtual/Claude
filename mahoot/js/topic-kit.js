/* ===== Topic kit: helpers for writing a topic file (js/topics/<id>.js) =====
   All randomness must come from the seeded helpers (ri, pick, shuffle, seededRandom) so a quiz code
   or a battle room rebuilds exactly the same questions on every device. Never use Math.random here. */
const Kit = (() => {
  const LEVEL_CLS = ["l1", "l5", "l7"];

  /* Multiple choice. options: [{ html, correct:true } | { html, fb:"why this is wrong" }]. Shuffled unless keepOrder. */
  function mc(o){
    const options = o.keepOrder ? o.options.slice() : shuffle(o.options.slice());
    return Object.assign({}, o, { type:"mc", options });
  }
  /* Typed word or phrase. answers: accepted spellings (first one is shown as the correct answer).
     wrong: [{ answers:[...], msg }] for likely mistakes. accentKeys adds á é í ó ú ñ buttons. */
  function text(o){ return Object.assign({ accentLenient:true }, o, { type:"text" }); }
  /* Put in order. inOrder: the items in the correct order (plain text, or HTML with html:true). axis: [first label, last label]. */
  function order(o){
    const n = o.inOrder.length;
    let idx; do { idx = shuffle([...Array(n).keys()]); } while (n > 1 && idx.every((v, i) => v === i));
    const items = idx.map(i => o.inOrder[i]);
    const correct = o.inOrder.map((_, k) => idx.indexOf(k));
    return Object.assign({}, o, { type:"order", items, correct, dir:"asc",
      itemHtml: o.html ? (s => s) : (s => esc(s)),
      answerHtml: o.answerHtml || o.inOrder.map(s => o.html ? s : esc(s)).join(" → "),
      missingMsg: o.missingMsg || "Place every item first." });
  }
  /* Boxes mixed with text, e.g. balancing:  [{c:"a"}, {txt:" H<sub>2</sub> + "}, {c:"b"}, {txt:" O<sub>2</sub>"}].
     answer: { a:2, b:1 }. Adds a formatter so "your answer" shows the filled-in line. */
  function fields(o){
    const fmt = vals => o.parts.map(p => p.txt != null ? p.txt : p.c ? '<b class="fv">' + esc(vals[p.c]) + "</b>" : "").join("");
    return Object.assign({}, o, { type:"fields", formatAnswer: rec => fmt(rec.raw), answerHtml: o.answerHtml || fmt(o.answer) });
  }
  /* Pick an item from a bank without repeating within one quiz (falls back to repeats when the bank runs out). */
  function unique(ctx, bank, key){
    key = key || (x => JSON.stringify(x));
    const fresh = bank.filter(x => !ctx.used.has(key(x)));
    const x = pick(fresh.length ? fresh : bank);
    ctx.used.add(key(x));
    return x;
  }
  /* Build a quiz. pool: [{ id, skill, level:1|2|3, make(ctx) -> question }].
     Level ids: "1", "2", "3" pick that level; "M" mixes all levels, easiest first.
     Questions are spread across the generators as evenly as possible. */
  function build(topic, pool, len, lvl){
    const want = lvl === "M" ? null : Number(lvl);
    let gens = pool.filter(g => want == null || g.level === want);
    if (!gens.length) gens = pool;
    const ctx = { used:new Set(), lvl };
    const out = [];
    let bag = [];
    for (let i = 0; i < len; i++) {
      if (!bag.length) bag = shuffle(gens.slice());
      const g = bag.pop(), q = g.make(ctx);
      const sk = topic.skills[g.skill] || { short:g.skill, lesson:0 };
      const lv = topic.levels.find(l => l.id === String(g.level)) || { name:"Level " + g.level };
      out.push(Object.assign({ hint:"Read the question carefully, then check each option against the key idea.", key:"" }, q, {
        family:topic.id + ":" + g.id, skill:g.skill, lesson:q.lesson != null ? q.lesson : sk.lesson, lvlNum:g.level,
        chipText:lv.name, chipCls:LEVEL_CLS[Math.min(2, g.level - 1)], tagText:sk.short }));
    }
    if (want == null) out.sort((a, b) => a.lvlNum - b.lvlNum);
    return out;
  }
  /* Standard level sets */
  const LEVELS3 = [
    { id:"M", name:"Mixed", desc:"A mix of everything, easier questions first." },
    { id:"1", name:"Core", desc:"The key facts and skills." },
    { id:"2", name:"Stretch", desc:"Apply the ideas to new examples." },
    { id:"3", name:"Challenge", desc:"Multi-step problems and harder judgements." }];
  /* Chemistry-style formula to HTML: "Al2(SO4)3" -> Al<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub> */
  const chem = f => esc(f).replace(/(\d+)/g, "<sub>$1</sub>");
  /* Round to n significant figures (as a number) and format it as a string with exactly n s.f. */
  const sig = (x, n) => Number(x.toPrecision(n));
  const sigStr = (x, n) => { const s = Number(x).toPrecision(n); return s.includes("e") ? String(Number(s)) : s; };
  return { mc, text, order, fields, unique, build, LEVELS3, chem, sig, sigStr };
})();
