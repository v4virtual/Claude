# Writing a Mahoot topic

Mahoot is a static study site (IB MYP Year 8 and Year 10) with a topic picker (Year → Subject → Topic), lessons, random practice quizzes and live class battles. You are adding ONE OR MORE topics. Each topic is ONE self-contained file:

    mahoot/js/topics/<id>.js

A new topic only needs its own file plus one `<script>` line in `index.html`. Read these for reference:
`js/topic-kit.js` (helpers you must use), `js/quizui.js` (how questions render and are graded), `js/topics.js` (registry), the existing files in `js/topics/`, and the `<style>` block in `index.html` (CSS classes you can use).

Validate with `node tools/validate-topics.js <id>` (run from the `mahoot` folder; needs Node.js). It builds every level and length 30 times and checks determinism, answer keys, HTML and explanations.
It must print no FAIL lines. A few "wrong option without fb" warnings are acceptable but aim for none.

## File skeleton

```js
/* ===== Topic: Year 10 Science, Stoichiometry ===== */
(() => {
  const R = String.raw;            // use R`...` for strings that contain TeX backslashes
  const T = {
    id:"stoichiometry", code:"S", year:10, subject:"Science", name:"Stoichiometry",
    blurb:"One sentence shown on the topic card.",
    levels: Kit.LEVELS3,            // ids "M" (Mixed), "1" Core, "2" Stretch, "3" Challenge
    defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:90,
    skills:{                         // every question's skill must be a key here
      sigfigs:{ name:"Significant figures and measurement", short:"Significant figures", lesson:0 },
      ...
    },
    lessons:[ { title:"Significant figures", heading:"Counting significant figures", html:`...` }, ... ],
    introHtml:`<h2>...</h2><p class="muted">...</p><div class="habits">...</div>`,
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl); }
  };
  const POOL = [
    { id:"sf-count", skill:"sigfigs", level:1, make(ctx){ ...return a question... } },
    ...
  ];
  registerTopic(T);
})();
```

- Wrap everything in the IIFE so no globals leak. `registerTopic`, `seedRng`, `Kit`, `ri(a,b)`, `pick(arr)`, `shuffle(arr)`, `seededRandom()`, `esc(s)`, `gcd` are globals you may use.
- **Never use Math.random or Date** in question generation (quiz codes and battles rebuild questions from the seed on every device).
- `lesson` in skills is the 0-based index into `lessons`. Each question inherits it.
- Levels: give each generator `level:1|2|3`. Mixed draws from all levels, easiest first. Provide generators for all three levels so every level has variety (at least 4 generators per level is good; more is better).
- `make(ctx)` returns one question. For banks of hand-written items, use `Kit.unique(ctx, BANK)` so a quiz does not repeat an item.

## Question shapes (return from make)

Common fields for every question:
- `promptHtml` (HTML string, the question), optional `exprHtml` (a big display line, e.g. a formula or a sentence to analyse: wrap it like `<div class="display">…</div>`)
- `workHtml` (HTML explanation shown after answering: why the answer is right, the working, and the common trap; 2–6 short sentences or steps)
- `key` (one-sentence takeaway, shown in red handwriting), `hint` (a nudge that does not give the answer away)
- optional `answerHtml` (how the correct answer is displayed)

1. Multiple choice: `Kit.mc({ promptHtml, options:[{ html:"...", correct:true }, { html:"...", fb:"why this is wrong / what misconception" }, ...], workHtml, key, hint })`. Options are shuffled. Use 3–4 options normally. Every wrong option should have `fb`.
2. Number: `{ type:"num", promptHtml, answer:2.5, tol:0.01, pre:"€", suf:"g", workHtml, key, hint, mistakes:[{ when:{ v:25 }, msg:"..." }] }`. `tol` is relative tolerance (0.01 = 1%; use it when rounding is involved, and say in the prompt how to round, e.g. "to 3 significant figures"). Students type decimals with point or comma, fractions like 3/4, negatives. `mistakes` match common wrong values (within 0.5%).
3. Boxes mixed with text: `Kit.fields({ promptHtml, parts:[{c:"a"},{txt:" H<sub>2</sub> + "},{c:"b"},{txt:" O<sub>2</sub> → "},{c:"c"},{txt:" H<sub>2</sub>O"}], answer:{a:2,b:1,c:2}, workHtml, key, hint, diagnose: rec => "message or empty" })`. Each `{c:key}` is an input box (numbers only, may be negative). `rec.vals` has the parsed numbers. Use for balancing equations (lowest whole-number coefficients, write 1 explicitly — say so in the prompt) and polynomial coefficients.
4. Typed text: `Kit.text({ promptHtml, answers:["hablamos"], accentKeys:true, wrong:[{ answers:["hablan"], msg:"That is the ellos form." }], workHtml, key, hint })`. Matching ignores case, extra spaces and final punctuation; missing accents are accepted with a note. Keep answers to one word or a very short phrase.
5. Order: `Kit.order({ promptHtml, inOrder:["first","second","third"], axis:["first","last"], html:false, workHtml, key, hint })`. Items are shuffled; the student taps them in order. 3–6 items.

TeX (MathJax) is available in any HTML: inline `\\( ... \\)` (in JS write `R` + backtick strings so backslashes survive, e.g. R`\(x^{2}\)`). Prefer plain HTML (`<sup>`, `<sub>`, `Kit.chem("H2SO4")`) for simple things.

## HTML/CSS classes available
`.rule` (blue dashed box; inner `.name` small caps label, `.law` big centered line), `.warn` (red box, `.name`), `.two` / `.three` (responsive grid), `.habits` with `.habit` cards (`.hn` big number, `h3`, `p.small`), `ol.steps` (numbered steps: `<li><div><div class="m">…</div><p class="why">…</p></div></li>`), `.display` (big centered line), `.small`, `.muted`, `mark` (highlighter), `.pen` (red handwriting note), `.tblwrap` + `table.tbl` (tables), `table.tbl.punnett` (Punnett squares), `.num` (monospace numbers), `.es` (italic, e.g. Spanish words), `.quotebox` (a short passage or notice to read), `.visual` (light panel for a diagram). Inline SVG is fine for simple diagrams; set colors with `style="fill:var(--blue)"` (tokens: --ink, --muted, --blue, --teal, --red, --good, --line, --card, --paper, --hi).

Lessons: 3–6 per topic, each a few short sections (h3 + p + a `.rule` or `.two` grid, a worked example, a `.warn` common-mistake box). Write `heading` as a short sentence-style headline. `introHtml`: an `<h2>` ("Six ideas that win marks" style), one muted sentence, then a `.habits` grid of 4–6 key ideas.

## Content rules
- **American English** spelling and usage everywhere (practice, color, labor, center, liter, meter, organize, analyze).
- Audience: 13–15 year olds in the IB MYP. Clear, friendly, precise. Short sentences. No emoji.
- Accuracy matters more than volume. Double-check every fact, calculation and answer key. If a fact is uncertain or contested, leave it out.
- **Original content only.** Do not quote or closely paraphrase copyrighted texts (e.g. *The Alchemist*, *The Veldt*): refer to plot events, characters, settings, symbols and themes in your own words. Short invented example sentences are fine.
- Do not use real students' or teachers' names. Invented names should be varied and neutral (e.g. Sam, Ana, Leo, Mia, Ravi, Zoe).
- Questions must have exactly one defensible correct answer. For interpretation questions ("which detail best supports…"), make the distractors clearly weaker, and explain why in fb.
- Variety: aim for a large number of distinct questions (generators with random numbers where possible; otherwise big banks: 60+ items per topic across levels, more is better), so repeated quizzes feel fresh.
- Every question's explanation should teach: say why the right answer is right and name the trap behind the wrong answers.
