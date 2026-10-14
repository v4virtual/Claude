/* ===== Topic: Year 10 Math, Polynomials ===== */
(() => {
  const R = String.raw;

  /* ---------- small helpers ---------- */
  const rnd01 = () => seededRandom();
  const nz = (a, b) => { let r; do { r = ri(a, b); } while (r === 0); return r; };
  const sgn = n => (rnd01() < 0.5 ? -1 : 1) * n;
  const pickV = () => pick(["x","x","x","x","a","m","n","p","t"]);
  const it = s => "\\(" + s + "\\)";                       // inline TeX
  const z0 = n => n || 0;                                  // turns -0 into 0
  const numWord = n => ["zero","one","two","three","four","five","six"][n] || String(n);
  const pn = n => n < 0 ? "(" + n + ")" : String(n);       // number in brackets if negative
  const uniqBy = (arr, key) => { const s = new Set(); return arr.filter(x => { const k = key(x); if (s.has(k)) return false; s.add(k); return true; }); };

  /* Terms: { c: coefficient, p: [[letter, exponent], ...] } in display order */
  const T1 = (c, e, v) => ({ c, p: e ? [[v, e]] : [] });
  const lab = (v, e) => e === 0 ? "" : e === 1 ? v : v + "^{" + e + "}";
  const varTex = p => p.filter(([, e]) => e).map(([v, e]) => lab(v, e)).join("");
  function monoAbs(t){
    const a = Math.abs(t.c), vs = varTex(t.p);
    return (a === 1 && vs ? "" : String(a)) + vs;
  }
  function sumTex(terms){
    let s = "";
    for (const t of terms) {
      if (!t.c) continue;
      const m = monoAbs(t);
      s += s ? (t.c < 0 ? " - " : " + ") + m : (t.c < 0 ? "-" : "") + m;
    }
    return s || "0";
  }
  const termTex = t => sumTex([t]);
  const tdeg = t => t.p.reduce((s, [, e]) => s + e, 0);
  const termList = terms => terms.filter(t => t.c).map(termTex).join(R`,\quad `);

  /* One-variable polynomials as coefficient arrays: co[e] is the coefficient of v^e */
  const tl = (co, v) => co.map((c, e) => T1(c, e, v)).reverse().filter(t => t.c);
  const polyTex = (co, v) => sumTex(tl(co, v));
  const padd = (A, B) => { const n = Math.max(A.length, B.length), C = []; for (let i = 0; i < n; i++) C.push(z0((A[i] || 0) + (B[i] || 0))); return C; };
  const pscale = (A, k) => A.map(c => z0(c * k));
  const pmul = (A, B) => { const C = Array(A.length + B.length - 1).fill(0); A.forEach((a, i) => B.forEach((b, j) => { C[i + j] += a * b; })); return C.map(z0); };
  const pdeg = A => { for (let e = A.length - 1; e > 0; e--) if (A[e]) return e; return 0; };
  const termsToCo = (terms, v) => { const co = []; terms.forEach(t => { const e = tdeg(t); co[e] = (co[e] || 0) + t.c; }); for (let i = 0; i < co.length; i++) co[i] = z0(co[i] || 0); return co; };
  const negT = t => ({ c: z0(-t.c), p: t.p });
  const byDeg = terms => terms.slice().sort((a, b) => tdeg(b) - tdeg(a));

  /* Random coefficient: ±1 sometimes (only in front of a variable), otherwise ±2..m */
  const coef = (m, one, e) => (e > 0 && rnd01() < one) ? sgn(1) : sgn(ri(e > 0 ? 2 : 1, m));
  function randPoly(d, k, m, one){
    const pows = [d, ...shuffle([...Array(d).keys()]).slice(0, k - 1)];
    const co = Array(d + 1).fill(0);
    pows.forEach(e => { co[e] = coef(m, one, e); });
    return co;
  }
  /* Shuffle into a different order (and optionally a different first term) */
  function scramble(terms, newFirst){
    if (terms.length < 2) return terms.slice();
    let s;
    do { s = shuffle(terms.slice()); } while (s.every((t, i) => t === terms[i]) || (newFirst && s[0] === terms[0]));
    return s;
  }

  const DEG = ["constant","linear","quadratic","cubic","quartic","quintic"];
  const TERMN = ["","monomial","binomial","trinomial"];
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const art = w => (/^[aeiou]/i.test(w) ? "an " : "a ") + w;

  const NOTE = "Fill every box: a minus sign for negatives (like -3), 1 for a coefficient of 1, and 0 for a missing term.";
  const vH = (v, e) => e === 0 ? "" : "<i>" + v + "</i>" + (e > 1 ? "<sup>" + e + "</sup>" : "");
  const eqn = (a, b) => Math.abs(a - b) < 1e-9;

  /* Boxes question. items: [{k, p}] in display order (constant item has p:[]). answer: {k:value}.
     cands: [{ans:{k:v}, msg}] (whole answer) or [{when:{k:v}, msg}] (some boxes). */
  function fieldsQ(o){
    const items = o.items, parts = [];
    items.forEach((t, i) => {
      parts.push({ c:t.k, label: t.p.length ? "Coefficient of " + t.p.map(([v, e]) => v + (e > 1 ? "^" + e : "")).join("") : "Constant term" });
      const txt = t.p.map(([v, e]) => vH(v, e)).join("") + (i < items.length - 1 ? " + " : "");
      if (txt) parts.push({ txt });
    });
    const answer = o.answer;
    const same = a => items.every(t => eqn(a[t.k], answer[t.k]));
    const full = uniqBy((o.cands || []).filter(c => c.ans && !same(c.ans)), c => JSON.stringify(c.ans));
    const part = (o.cands || []).filter(c => c.when && !Object.keys(c.when).every(k => eqn(c.when[k], answer[k])));
    const labelOf = t => t.p.length ? "coefficient of " + it(varTex(t.p)) : "constant term";
    const diagnose = rec => {
      const v = rec.vals;
      for (const c of full) if (items.every(t => eqn(v[t.k], c.ans[t.k]))) return c.msg;
      for (const c of part) if (Object.keys(c.when).every(k => eqn(v[k], c.when[k]))) return c.msg;
      if (items.every(t => eqn(Math.abs(v[t.k]), Math.abs(answer[t.k])))) return "The sizes of your numbers are right, but at least one sign is wrong. Go through the terms with negative numbers again.";
      const bad = items.filter(t => !eqn(v[t.k], answer[t.k]));
      if (bad.length === 1) return "Only one box is off: the " + labelOf(bad[0]) + ". Find that term in the solution below and compare.";
      return "";
    };
    const show = vals => "\\(" + sumTex(items.map(t => ({ c:vals[t.k], p:t.p }))) + "\\)";
    const q = Kit.fields({ prompt:o.prompt, tex:o.tex, parts, answer, steps:o.steps, hint:o.hint, key:o.key, note:o.note || NOTE,
      diagnose, answerHtml:show(answer), chk:o.chk });
    q.formatAnswer = rec => show(rec.vals);
    return q;
  }
  /* Boxes for a one-variable polynomial from power hi down to lo. cands use arrays {co} or {when:{power:value}} */
  function polyQ(o){
    const lo = o.lo || 0, items = [];
    for (let e = o.hi; e >= lo; e--) items.push({ k:"k" + e, p: e ? [[o.v, e]] : [], e });
    const toAns = co => Object.fromEntries(items.map(t => [t.k, z0(co[t.e] || 0)]));
    const cands = (o.cands || []).map(c => c.co ? { ans:toAns(c.co), msg:c.msg }
      : { when:Object.fromEntries(Object.entries(c.when).map(([e, val]) => ["k" + e, val])), msg:c.msg });
    return fieldsQ(Object.assign({}, o, { items, answer:toAns(o.ans), cands }));
  }
  /* Number answer: keep only mistakes that differ from the answer and from each other */
  const mk = (list, ans) => uniqBy(list.filter(m => m && !eqn(m.when.v, ans)), m => m.when.v);

  /* FOIL steps for (a v + b)(c v + d) */
  function foilSteps(a, b, c, d, v){
    const t = (k, e) => termTex(T1(k, e, v));
    const out = [z0(b * d), z0(a * d + b * c), z0(a * c)];
    const mid = a * d + b * c;
    return [
      { m:R`\text{First: }\ (${t(a,1)})(${t(c,1)}) = ${t(a*c,2)}`, why:"Multiply the <b>first</b> term of each bracket." },
      { m:R`\text{Outer: }\ (${t(a,1)})(${d}) = ${t(a*d,1)}`, why:"Multiply the two <b>outer</b> terms: the first term of the first bracket and the last term of the second." },
      { m:R`\text{Inner: }\ (${b})(${t(c,1)}) = ${t(b*c,1)}`, why:"Multiply the two <b>inner</b> terms." },
      { m:R`\text{Last: }\ (${b})(${d}) = ${b*d}`, why:"Multiply the <b>last</b> term of each bracket. Watch the signs: " + (b * d > 0 ? "same signs give a positive." : "different signs give a negative.") },
      { m:R`${sumTex([T1(a*c,2,v), T1(a*d,1,v), T1(b*c,1,v), T1(b*d,0,v)])} = ${polyTex(out, v)}`,
        why: mid === 0 ? R`The outer and inner products are like terms, and here they cancel: \(${a*d}+${pn(b*c)}=0\).`
                       : R`The outer and inner products are like terms: \(${a*d}${b*c < 0 ? "" : "+"}${b*c}=${mid}\). Add them to get the middle term.` }];
  }
  const binTex = (a, b, v) => sumTex([T1(a, 1, v), T1(b, 0, v)]);
  const t2 = (k, v) => termTex(T1(k, 1, v));

  /* ===================== the topic ===================== */
  const T = {
    id:"polynomials", code:"P", year:10, subject:"Math", name:"Polynomials",
    blurb:"Terms, coefficients and degree, naming polynomials, like terms, adding and subtracting, the distributive property and FOIL.",
    levels: Kit.LEVELS3,
    defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:90,
    skills:{
      terms: { name:"Terms, coefficients, constants and degree", short:"Terms and degree", lesson:0 },
      naming:{ name:"Naming polynomials and standard form", short:"Naming polynomials", lesson:1 },
      like:  { name:"Like and unlike terms", short:"Like terms", lesson:2 },
      addsub:{ name:"Adding and subtracting polynomials", short:"Add and subtract", lesson:3 },
      distrib:{ name:"The distributive property", short:"Distributive property", lesson:4 },
      foil:  { name:"Multiplying binomials (FOIL)", short:"FOIL", lesson:5 }
    },
    lessons:[
      { title:"Terms and degree", heading:"Every polynomial is built from terms", html:R`
<p>A <b>polynomial</b> is a sum of <b>terms</b>. Each term is a number times variables with whole-number exponents, like \(5x^3\), \(-x\) or \(7\).</p>
<div class="rule"><span class="name">The vocabulary</span>
<div class="law">\(\underbrace{4x^3}_{\text{term}}\;\underbrace{-\,x^2}_{\text{term}}\;\underbrace{+\,6x}_{\text{term}}\;\underbrace{-\,9}_{\text{constant}}\)</div>
<p class="small">The <b>coefficient</b> is the number in front of the variables, <b>sign included</b>. The <b>constant term</b> has no variable. Split the polynomial at every + and − sign to find the terms.</p></div>
<h3>Worked example</h3>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Term</th><th>Coefficient</th><th>Degree of the term</th></tr></thead><tbody>
<tr><td>\(4x^3\)</td><td>4</td><td>3</td></tr>
<tr><td>\(-x^2\)</td><td>−1 (no number means 1)</td><td>2</td></tr>
<tr><td>\(6x\)</td><td>6</td><td>1 (\(x=x^1\))</td></tr>
<tr><td>\(-9\)</td><td>−9 (the constant)</td><td>0</td></tr>
</tbody></table></div>
<h3>Degree</h3>
<div class="two">
<div class="rule"><span class="name">Degree of a term</span><p class="small">Add the exponents of <b>all</b> its variables. \(3x^2y^3\) has degree \(2+3=5\). \(-4ab\) has degree \(1+1=2\).</p></div>
<div class="rule"><span class="name">Degree of a polynomial</span><p class="small">The <b>highest</b> degree of any of its terms. \(x^2+7x^5-1\) has degree 5. The <b>leading coefficient</b> is the coefficient of that term: 7.</p></div>
</div>
<div class="warn"><span class="name">Common mistakes</span>
<p class="small">The coefficient of \(-x^2\) is \(-1\), not 1 and not 2. The degree is not the number of terms. The first term written is not always the highest power: reorder first. For \(3x^2y^3\) the degree is \(5\), not 3 and not 6.</p></div>` },

      { title:"Naming", heading:"A polynomial's name tells you two things", html:R`
<p>Polynomials are named by <b>how many terms</b> they have and by their <b>degree</b>.</p>
<div class="two">
<div class="tblwrap"><table class="tbl"><thead><tr><th>Terms</th><th>Name</th><th>Example</th></tr></thead><tbody>
<tr><td>1</td><td>monomial</td><td>\(-6x^2\)</td></tr>
<tr><td>2</td><td>binomial</td><td>\(x^3+5\)</td></tr>
<tr><td>3</td><td>trinomial</td><td>\(2x^2-x+4\)</td></tr>
<tr><td>4 or more</td><td>polynomial</td><td>\(x^3-x^2+x-1\)</td></tr>
</tbody></table></div>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Degree</th><th>Name</th><th>Example</th></tr></thead><tbody>
<tr><td>0</td><td>constant</td><td>\(8\)</td></tr>
<tr><td>1</td><td>linear</td><td>\(3x-2\)</td></tr>
<tr><td>2</td><td>quadratic</td><td>\(x^2+4\)</td></tr>
<tr><td>3</td><td>cubic</td><td>\(2x^3-x\)</td></tr>
<tr><td>4</td><td>quartic</td><td>\(x^4+x^2\)</td></tr>
<tr><td>5</td><td>quintic</td><td>\(-x^5+3\)</td></tr>
</tbody></table></div>
</div>
<div class="rule"><span class="name">Standard form</span><div class="law">highest power first, then descending</div>
<p class="small">Each term moves <b>with its own sign</b>. \(5-3x+x^3\) in standard form is \(x^3-3x+5\).</p></div>
<h3>Worked example</h3>
<ol class="steps">
<li><div><div class="m">\(4x-x^3+7\)</div><p class="why">Three terms, so it is a trinomial.</p></div></li>
<li><div><div class="m">\(-x^3+4x+7\)</div><p class="why">Standard form: the \(x^3\) term goes first and keeps its minus sign.</p></div></li>
<li><div><div class="m">\(\text{degree }3\Rightarrow\text{cubic trinomial}\)</div><p class="why">Degree name first, then the term name.</p></div></li>
</ol>
<div class="warn"><span class="name">Common mistake</span><p class="small">Three terms does not make a polynomial cubic. "Tri-" counts terms; "cubic" means the highest power is 3. \(x^2+x+1\) is a quadratic trinomial.</p></div>` },

      { title:"Like terms", heading:"Only like terms can be combined", html:R`
<p><b>Like terms</b> have exactly the same variables raised to exactly the same powers. The coefficients can be anything.</p>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Pair</th><th>Like?</th><th>Why</th></tr></thead><tbody>
<tr><td>\(4x^2\) and \(-9x^2\)</td><td>Yes</td><td>same variable, same power</td></tr>
<tr><td>\(3x^2y\) and \(5yx^2\)</td><td>Yes</td><td>order of the letters does not matter</td></tr>
<tr><td>\(x^2y\) and \(xy^2\)</td><td>No</td><td>\(x\cdot x\cdot y\) is not \(x\cdot y\cdot y\)</td></tr>
<tr><td>\(5x^2\) and \(5x^3\)</td><td>No</td><td>different powers</td></tr>
<tr><td>\(2x\) and \(2y\)</td><td>No</td><td>different variables</td></tr>
</tbody></table></div>
<div class="rule"><span class="name">Combining like terms</span><div class="law">\(7x^2-3x^2=4x^2\)</div>
<p class="small">Add or subtract the coefficients. The variable part stays exactly the same.</p></div>
<h3>Worked example</h3>
<ol class="steps">
<li><div><div class="m">\(5x^2-2x+3-x^2+6x-8\)</div><p class="why">Each term keeps the sign in front of it.</p></div></li>
<li><div><div class="m">\((5x^2-x^2)+(-2x+6x)+(3-8)\)</div><p class="why">Group the like terms.</p></div></li>
<li><div><div class="m">\(4x^2+4x-5\)</div><p class="why">Combine each group.</p></div></li>
</ol>
<div class="warn"><span class="name">Common mistakes</span><p class="small">\(3x^2+2x\) cannot be combined: it is not \(5x^3\). Adding like terms never changes the exponent: \(2x+3x=5x\), not \(5x^2\).</p></div>` },

      { title:"Add and subtract", heading:"Subtracting means changing every sign", html:R`
<h3>Adding</h3>
<p>Remove the brackets (a + in front changes nothing), then combine like terms.</p>
<div class="display">\((2x^2+3x-4)+(x^2-5x+1)=3x^2-2x-3\)</div>
<h3>Subtracting</h3>
<div class="rule"><span class="name">The minus sign</span><div class="law">\(-(a+b-c)=-a-b+c\)</div>
<p class="small">A minus in front of a bracket multiplies <b>every</b> term inside by \(-1\). Change every sign, then add.</p></div>
<h3>Worked example</h3>
<ol class="steps">
<li><div><div class="m">\((4x^2-2x+7)-(x^2-6x+3)\)</div><p class="why">The second bracket is subtracted.</p></div></li>
<li><div><div class="m">\(=4x^2-2x+7-x^2+6x-3\)</div><p class="why">Every sign in the second bracket flips: \(x^2\to-x^2\), \(-6x\to+6x\), \(+3\to-3\).</p></div></li>
<li><div><div class="m">\(=3x^2+4x+4\)</div><p class="why">Combine like terms.</p></div></li>
</ol>
<p class="small">In the answer boxes, type 0 for a power that has disappeared: \(5x^3+0x^2-x+2\).</p>
<p class="small">"Subtract \(P\) from \(Q\)" means \(Q-P\): the thing you subtract goes second.</p>
<div class="warn"><span class="name">Classic mistake</span><p class="small">Flipping only the first sign: \((4x^2-2x+7)-(x^2-6x+3)\) is <b>not</b> \(4x^2-2x+7-x^2-6x+3\). The minus belongs to the whole bracket.</p></div>` },

      { title:"Distributive property", heading:"Multiply the outside by every term inside", html:R`
<div class="rule"><span class="name">Distributive property</span><div class="law">\(a(b+c)=ab+ac\)</div>
<p class="small">Each term inside the bracket gets multiplied. Then multiply variables with the exponent laws: \(x\cdot x=x^2\), \(x\cdot x^2=x^3\).</p></div>
<div class="two">
<div><h3>Numbers outside</h3>
<p>\(3(2x+5)=6x+15\)</p>
<p>\(-4(3x-2)=-12x+8\)</p>
<p class="small">Negative times negative is positive: \((-4)(-2)=+8\).</p></div>
<div><h3>Variables outside</h3>
<p>\(x(5x-3)=5x^2-3x\)</p>
<p>\(2x(3x^2-x+4)=6x^3-2x^2+8x\)</p>
<p class="small">Multiply the numbers, then add the exponents.</p></div>
</div>
<h3>Worked example</h3>
<ol class="steps">
<li><div><div class="m">\(-2x(3x^2-x+4)\)</div><p class="why">Three terms inside, so three products.</p></div></li>
<li><div><div class="m">\((-2x)(3x^2)+(-2x)(-x)+(-2x)(4)\)</div><p class="why">The outside term, with its sign, multiplies each term.</p></div></li>
<li><div><div class="m">\(=-6x^3+2x^2-8x\)</div><p class="why">\((-2)(-1)=+2\), and \(x\cdot x=x^2\).</p></div></li>
</ol>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Multiplying only the first term: \(3(2x+5)\neq6x+5\). Losing a sign: \(-4(3x-2)\neq-12x-8\).</p></div>` },

      { title:"FOIL", heading:"Two brackets: every term meets every term", html:R`
<p>To multiply two binomials, each term in the first bracket multiplies each term in the second. FOIL is a checklist so you get all four products.</p>
<div class="rule"><span class="name">FOIL</span><div class="law">\((a+b)(c+d)=\underbrace{ac}_{F}+\underbrace{ad}_{O}+\underbrace{bc}_{I}+\underbrace{bd}_{L}\)</div>
<p class="small"><b>F</b>irst, <b>O</b>uter, <b>I</b>nner, <b>L</b>ast. Then combine the like terms (usually O and I).</p></div>
<h3>The box picture</h3>
<div class="visual">
<table class="tbl punnett"><tr><th>×</th><th>\(2x\)</th><th>\(-5\)</th></tr>
<tr><th>\(x\)</th><td>\(2x^2\)</td><td>\(-5x\)</td></tr>
<tr><th>\(3\)</th><td>\(6x\)</td><td>\(-15\)</td></tr></table>
<p class="caption">\((x+3)(2x-5)\): the four boxes are the four FOIL products. Add them: \(2x^2-5x+6x-15=2x^2+x-15\).</p>
</div>
<h3>Worked example: \((x-4)(3x+2)\)</h3>
<ol class="steps">
<li><div><div class="m">\(F:\ x\cdot3x=3x^2\qquad O:\ x\cdot2=2x\)</div><p class="why">First and outer products.</p></div></li>
<li><div><div class="m">\(I:\ (-4)(3x)=-12x\qquad L:\ (-4)(2)=-8\)</div><p class="why">The \(-4\) keeps its sign in every product.</p></div></li>
<li><div><div class="m">\(3x^2+2x-12x-8=3x^2-10x-8\)</div><p class="why">Combine the middle terms.</p></div></li>
</ol>
<h3>Special products</h3>
<div class="two">
<div class="rule"><span class="name">Perfect square</span><div class="law">\((a+b)^2=a^2+2ab+b^2\)</div><p class="small">\((x+3)^2=x^2+6x+9\). Write it as \((x+3)(x+3)\) and FOIL.</p></div>
<div class="rule"><span class="name">Difference of squares</span><div class="law">\((a+b)(a-b)=a^2-b^2\)</div><p class="small">\((2x+5)(2x-5)=4x^2-25\). The middle terms cancel.</p></div>
</div>
<p class="small">Binomial × trinomial: 2 × 3 = 6 products. \((x+2)(x^2-x+3)=x^3-x^2+3x+2x^2-2x+6=x^3+x^2+x+6\). A number in front, like \(2(x+3)(x-1)\), multiplies the finished product once: \(2(x^2+2x-3)=2x^2+4x-6\).</p>
<div class="warn"><span class="name">Classic mistakes</span><p class="small">\((x+3)^2\neq x^2+9\): the middle term \(6x\) is missing. Do not forget the outer and inner products. Keep the sign with each number: \((x-4)(x-2)\) has last term \((-4)(-2)=+8\).</p></div>` }
    ],
    introHtml:`<h2>Six ideas that win marks</h2>
<p class="muted">Polynomials are mostly careful bookkeeping. These habits stop the usual slips.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>The sign belongs to the term</h3><p class="small">In 4<i>x</i><sup>2</sup> − 7<i>x</i>, the coefficient of <i>x</i> is −7. No number means 1: −<i>x</i> has coefficient −1.</p></div>
<div class="habit"><span class="hn">2</span><h3>Degree is the highest power</h3><p class="small">Not the number of terms and not the first term. For several variables, add the exponents: 3<i>x</i><sup>2</sup><i>y</i><sup>3</sup> has degree 5.</p></div>
<div class="habit"><span class="hn">3</span><h3>Like terms match exactly</h3><p class="small">Same letters, same powers. <i>x</i><sup>2</sup><i>y</i> and <i>xy</i><sup>2</sup> are unlike. Combining never changes the exponents.</p></div>
<div class="habit"><span class="hn">4</span><h3>Minus a bracket: flip every sign</h3><p class="small">−(<i>x</i><sup>2</sup> − 3<i>x</i> + 2) = −<i>x</i><sup>2</sup> + 3<i>x</i> − 2. Not just the first term.</p></div>
<div class="habit"><span class="hn">5</span><h3>Every term meets every term</h3><p class="small">Distribute to each term inside. Two binomials give four products: First, Outer, Inner, Last.</p></div>
<div class="habit"><span class="hn">6</span><h3>Squares have a middle</h3><p class="small">(<i>x</i> + 3)<sup>2</sup> = <i>x</i><sup>2</sup> + 6<i>x</i> + 9, never <i>x</i><sup>2</sup> + 9.</p></div>
</div>`,
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl); }
  };

  /* ===================== generators ===================== */
  const G = [];

  /* ---------- Skill 1: terms, coefficients, degree ---------- */

  /* L1: coefficient of a given power */
  G.push({ id:"terms-coef", skill:"terms", level:1, make(){
    const v = pickV(), d = ri(3, 4), co = randPoly(d, ri(3, d + 1), 9, 0.3);
    const pows = co.map((c, e) => e).filter(e => e > 0 && co[e]);
    const ones = pows.filter(e => Math.abs(co[e]) === 1);
    const e = ones.length && rnd01() < 0.45 ? pick(ones) : pick(pows);
    const c = co[e], terms = tl(co, v), tt = termTex(T1(c, e, v));
    const mistakes = mk([
      c < 0 ? { when:{v:-c}, msg:R`The coefficient keeps the sign in front of the term. The term is \(${tt}\), so its coefficient is ${c}.` } : null,
      { when:{v:e}, msg:R`${e} is the exponent of \(${v}\), not the coefficient. The coefficient is the number multiplying \(${lab(v,e)}\).` },
      Math.abs(c) === 1 ? { when:{v:0}, msg:R`No number written in front means the coefficient is 1: \(${tt}=${c < 0 ? "-1" : "1"}\cdot ${lab(v,e)}\).` } : null
    ], c);
    return { type:"num", prompt:R`What is the coefficient of \(${lab(v,e)}\) in this polynomial?`, tex:polyTex(co, v), answer:c, mistakes,
      hint:"Find the term with exactly that power. Take the number in front, together with its sign.",
      steps:[
        { m:termList(terms), why:"Split the polynomial into terms at every + and − sign. Each term keeps the sign in front of it." },
        { m:R`${tt} = ${pn(c)}\cdot ${lab(v,e)}`, why: c === 1 ? "No number is written, so the coefficient is 1." : c === -1 ? "A minus sign with no number means the coefficient is −1." : "The coefficient is the number multiplying the variable part, sign included." }],
      key:"The coefficient includes its sign, and a bare variable has coefficient 1.", chk:{ kind:"coef", mono:lab(v, e) } };
  }});

  /* L1: constant term, number of terms or degree */
  G.push({ id:"terms-basic", skill:"terms", level:1, make(){
    const kind = pick(["const","nterms","degree","degree"]);
    const v = pickV(), d = ri(2, 5), co = randPoly(d, ri(2, Math.min(5, d + 1)), 9, 0.25);
    if (kind === "const" && !co[0] && rnd01() < 0.75) co[0] = sgn(ri(1, 9));
    const std = tl(co, v), k = std.length;
    const shown = (kind === "degree" ? rnd01() < 0.8 : rnd01() < 0.5) ? scramble(std, kind === "degree") : std;
    const tex = sumTex(shown), first = tdeg(shown[0]);
    const maxC = Math.max(...std.map(t => Math.abs(t.c)));
    if (kind === "const") {
      const c0 = co[0];
      return { type:"num", prompt:"What is the constant term of this polynomial? Type 0 if there is none.", tex, answer:c0,
        mistakes:mk([c0 < 0 ? { when:{v:-c0}, msg:R`The constant term keeps its sign: it is ${c0}.` } : null,
          { when:{v:co[d]}, msg:"That is the leading coefficient (the number in front of the highest power). The constant term has no variable." },
          { when:{v:d}, msg:"That is the degree. The constant term is the term with no variable at all." }], c0),
        hint:"Look for the term with no variable in it.",
        steps:[{ m:termList(shown), why:"List the terms, each with its sign." },
          { m:R`\text{constant term} = ${c0}`, why: c0 ? "It is the only term with no variable. Its sign comes with it." : "Every term has a variable, so there is no constant term. It is 0." }],
        key:"The constant term is the term with no variable, sign included.", chk:{ kind:"const" } };
    }
    if (kind === "nterms") {
      return { type:"num", prompt:"How many terms does this polynomial have?", tex, answer:k,
        mistakes:mk([{ when:{v:d}, msg:"That is the degree (the highest power), not the number of terms." },
          { when:{v:d + 1}, msg:R`Missing powers do not count. Only count the terms that are actually written.` }], k),
        hint:"Count the pieces separated by + and − signs.",
        steps:[{ m:termList(shown), why:"Split at every + and − sign." },
          { m:R`${k}\text{ terms}`, why:"Count them. A power that is missing is not a term." }],
        key:"Terms are the pieces joined by + and − signs.", chk:{ kind:"nterms" } };
    }
    return { type:"num", prompt:"What is the degree of this polynomial?", tex, answer:d,
      mistakes:mk([{ when:{v:k}, msg:"That is the number of terms. The degree is the highest exponent." },
        shown !== std ? { when:{v:first}, msg:"That is the exponent of the first term written. The terms are not in order, so look at every exponent." } : null,
        { when:{v:maxC}, msg:"That is the largest coefficient. The degree is about exponents, not the numbers in front." },
        { when:{v:std.reduce((s, t) => s + tdeg(t), 0)}, msg:"Do not add the exponents of different terms. For one variable, the degree is the single highest exponent." }], d),
      hint:"Look at the exponent of every term, not just the first one.",
      steps:[{ m:shown.map(t => termTex(t) + R`\to ${tdeg(t)}`).join(R`,\quad `), why:R`Write the degree of each term. \(${v}\) means \(${v}^1\) and a constant has degree 0.` },
        { m:R`\text{degree} = ${d}`, why:"The degree of the polynomial is the highest of these." }],
      key:"Degree = highest exponent, wherever that term is written.", chk:{ kind:"degree" } };
  }});

  /* L2: degree of a term with several variables */
  G.push({ id:"terms-multi", skill:"terms", level:2, make(){
    const vars = pick([["x","y"],["a","b"],["m","n"],["x","y","z"],["p","q","r"],["x","y"]]);
    let ex; do { ex = vars.map(() => rnd01() < 0.3 ? 1 : ri(2, 6)); } while (ex.every(e => e === 1));
    const c = rnd01() < 0.15 ? sgn(1) : sgn(ri(2, 9));
    const t = { c, p:vars.map((v, i) => [v, ex[i]]) }, tt = termTex(t);
    const sum = ex.reduce((s, e) => s + e, 0), prod = ex.reduce((s, e) => s * e, 1), mx = Math.max(...ex);
    const no1 = ex.filter(e => e > 1).reduce((s, e) => s + e, 0);
    return { type:"num", prompt:"What is the degree of this term?", tex:tt, answer:sum,
      mistakes:mk([{ when:{v:prod}, msg:"You multiplied the exponents. For the degree of a term, add them." },
        { when:{v:mx}, msg:"That is only the highest single exponent. A term's degree adds the exponents of all its variables." },
        { when:{v:Math.abs(c)}, msg:"That is the coefficient. The number in front does not affect the degree." },
        ex.includes(1) ? { when:{v:no1}, msg:"A letter with no exponent written has exponent 1, and it counts." } : null], sum),
      hint:"Add the exponents of all the variables. A plain letter has exponent 1.",
      steps:[{ m:R`${tt} = ${pn(c)}\cdot ${vars.map((v, i) => v + "^{" + ex[i] + "}").join(R`\cdot `)}`, why:"Write every exponent, including the invisible 1s." },
        { m:R`${ex.join(" + ")} = ${sum}`, why:"Degree of a term: add the exponents of all its variables. The coefficient does not count." }],
      key:"Degree of a term = sum of the exponents of all its variables.", chk:{ kind:"termdeg" } };
  }});

  /* L2: coefficient in a polynomial with two variables (x²y vs xy² trap) */
  G.push({ id:"terms-mvcoef", skill:"terms", level:2, make(){
    const [x, y] = pick([["x","y"],["a","b"],["m","n"],["x","y"]]);
    let a, b; do { a = ri(1, 3); b = ri(1, 3); } while (a === b);
    const A = [[x, a], [y, b]], B = [[x, b], [y, a]];
    const ca = rnd01() < 0.35 ? sgn(1) : sgn(ri(2, 9));
    let cb; do { cb = sgn(ri(1, 9)); } while (cb === ca || cb === -ca);
    const extra = [{ c:sgn(ri(2, 9)), p:[[x, 1], [y, 1]] }];
    if (rnd01() < 0.6) extra.push({ c:sgn(ri(1, 9)), p:[] });
    else extra.push({ c:sgn(ri(2, 9)), p:[[x, pick([2, 3, 4])]] });
    const terms = shuffle([{ c:ca, p:A }, { c:cb, p:B }, ...extra]);
    const tt = termTex({ c:ca, p:A });
    return { type:"num", prompt:R`What is the coefficient of \(${varTex(A)}\) in this polynomial?`, tex:sumTex(terms), answer:ca,
      mistakes:mk([{ when:{v:cb}, msg:R`That is the coefficient of \(${varTex(B)}\). Check the powers: \(${varTex(A)}\) and \(${varTex(B)}\) are different terms.` },
        ca < 0 ? { when:{v:-ca}, msg:"The coefficient keeps the sign in front of the term." } : null,
        Math.abs(ca) === 1 ? { when:{v:0}, msg:"No number written means the coefficient is 1 (or −1 with a minus sign)." } : null], ca),
      hint:R`Match the powers of both letters exactly: \(${x}\) to the power ${a} and \(${y}\) to the power ${b}.`,
      steps:[{ m:termList(terms), why:"List the terms with their signs." },
        { m:R`${tt} = ${pn(ca)}\cdot ${varTex(A)}`, why:R`This is the only term with \(${lab(x,a)}\) and \(${lab(y,b)}\). The term \(${termTex({ c:cb, p:B })}\) has the powers swapped, so it is a different term.` }],
      key:"Match every letter and every power exactly, then take the number with its sign.", chk:{ kind:"coef", mono:varTex(A) } };
  }});

  /* L3: leading coefficient after reordering */
  G.push({ id:"terms-leading", skill:"terms", level:3, make(){
    const v = pickV(), d = ri(3, 5), co = randPoly(d, ri(3, Math.min(5, d + 1)), 9, 0.3);
    if (rnd01() < 0.6 && co[d] > 0) co[d] = -co[d];
    if (!co[0]) co[0] = sgn(ri(1, 9));
    const std = tl(co, v), shown = scramble(std, true), L = co[d];
    return { type:"num", prompt:"What is the leading coefficient of this polynomial?", tex:sumTex(shown), answer:L,
      mistakes:mk([{ when:{v:shown[0].c}, msg:"That is the coefficient of the first term written. Put the polynomial in standard form first: the leading term has the highest power." },
        L < 0 ? { when:{v:-L}, msg:"The leading coefficient keeps its sign." } : null,
        { when:{v:d}, msg:"That is the degree. The leading coefficient is the number in front of the highest power." },
        { when:{v:co[0]}, msg:"That is the constant term." }], L),
      hint:"Rewrite in standard form (highest power first). Each term moves with its sign.",
      steps:[{ m:R`${sumTex(std)}`, why:"Standard form: order the terms from the highest power down. Each term moves with its own sign." },
        { m:R`\text{leading term} = ${termTex(std[0])}`, why:R`The highest power is \(${lab(v,d)}\).` },
        { m:R`\text{leading coefficient} = ${L}`, why: Math.abs(L) === 1 ? "No number written means 1, with the sign." : "Its coefficient, with the sign." }],
      key:"Leading coefficient: reorder first, then read the number on the highest power.", chk:{ kind:"lead" } };
  }});

  /* L3: degree of a polynomial with several variables */
  G.push({ id:"terms-multipoly", skill:"terms", level:3, make(){
    const [x, y] = pick([["x","y"],["a","b"],["m","n"]]);
    let p, a, b; do { p = ri(4, 6); a = ri(1, 4); b = ri(2, 5); } while (a + b <= p || Math.max(a, b) >= p);
    const t1 = { c:sgn(ri(2, 9)), p:[[x, p]] }, t2 = { c:coef(9, 0.2, 1), p:[[x, a], [y, b]] };
    const t3 = pick([{ c:sgn(ri(2, 9)), p:[[x, 1], [y, 1]] }, { c:sgn(ri(1, 9)), p:[] }, { c:sgn(ri(2, 9)), p:[[y, 2]] }]);
    const terms = shuffle([t1, t2, t3]), dg = a + b;
    const all = terms.reduce((s, t) => s + tdeg(t), 0);
    return { type:"num", prompt:"What is the degree of this polynomial?", tex:sumTex(terms), answer:dg,
      mistakes:mk([{ when:{v:p}, msg:R`\(${lab(x,p)}\) has the biggest single exponent, but \(${varTex(t2.p)}\) has degree \(${a}+${b}=${dg}\).` },
        { when:{v:all}, msg:"Do not add the exponents of different terms. Find the degree of each term, then take the highest." },
        { when:{v:Math.max(a, b)}, msg:"For a term with several variables, add their exponents." },
        { when:{v:3}, msg:"That is the number of terms, not the degree." }], dg),
      hint:"Find the degree of each term (add the exponents inside it), then take the largest.",
      steps:[{ m:terms.map(t => termTex(t) + R`\to ${tdeg(t)}`).join(R`,\quad `), why:"Degree of each term: add the exponents of all its variables." },
        { m:R`\text{degree} = ${dg}`, why:"The degree of the polynomial is the highest term degree." }],
      key:"Polynomial degree = highest term degree; each term's degree adds its exponents.", chk:{ kind:"degree" } };
  }});

  /* ---------- Skill 2: naming ---------- */
  const TN4 = ["Monomial","Binomial","Trinomial","Polynomial with four or more terms"];

  /* L1: name by number of terms */
  G.push({ id:"naming-terms", skill:"naming", level:1, make(){
    const k = pick([1, 2, 2, 3, 3, 4]), d = ri(Math.max(k - 1, 1), 5), v = pickV();
    const co = randPoly(d, k, 9, 0.25), std = tl(co, v), shown = rnd01() < 0.5 ? scramble(std) : std;
    const n = Math.min(k, 4);
    const options = TN4.map((h, i) => {
      const m = i + 1;
      if (m === n) return { html:h, correct:true };
      return { html:h, fb:(m === 4 ? "That name is for four or more terms. " : cap(TN4[i].toLowerCase()) + " means " + numWord(m) + " term" + (m > 1 ? "s" : "") + ". ") +
        "Count the terms: there " + (k === 1 ? "is 1" : "are " + k) + "." + (m === Math.min(d, 4) && m !== n ? " The highest power is " + d + ", but these names count terms, not the degree." : "") };
    });
    return Kit.mc({ prompt:"Name this polynomial by its number of terms.", tex:sumTex(shown), options,
      hint:"Mono = 1, bi = 2, tri = 3. Count the pieces joined by + and − signs.",
      steps:[{ m:termList(shown), why:"Split at the + and − signs between terms." },
        { m:R`${k}\ \text{term${k > 1 ? "s" : ""}} \Rightarrow \text{${TN4[n - 1].toLowerCase()}}`, why:"Monomial: 1 term. Binomial: 2. Trinomial: 3. Four or more: just 'polynomial'." }],
      key:"Mono-, bi-, tri- count terms, not powers.", chk:{ kind:"tname" } });
  }});

  /* L1: name by degree */
  G.push({ id:"naming-degree", skill:"naming", level:1, make(){
    const d = pick([0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]), v = pickV();
    const k = d === 0 ? 1 : ri(1, Math.min(d + 1, 4));
    const co = d === 0 ? [sgn(ri(2, 12))] : randPoly(d, k, 9, 0.25);
    const std = tl(co, v), shown = rnd01() < 0.5 ? scramble(std) : std, first = tdeg(shown[0]);
    const wrongIdx = uniqBy([k <= 5 && k !== d ? k : -1, d + 1, d - 1, d + 2, d - 2, ...shuffle([0, 1, 2, 3, 4, 5])].filter(i => i >= 0 && i <= 5 && i !== d), i => i).slice(0, 3);
    const options = [{ html:cap(DEG[d]), correct:true }, ...wrongIdx.map(i => ({ html:cap(DEG[i]),
      fb:cap(DEG[i]) + " means degree " + i + (i === 0 ? " (no variable at all)" : "") + ", but the highest power here is " + d + "." +
        (i === k ? " Do not count the terms: the degree is the highest exponent." : "") +
        (i === first && shown !== std ? " The first term written is not always the highest power." : "") }))];
    return Kit.mc({ prompt:"Name this polynomial by its degree.", tex:sumTex(shown), options,
      hint:"Find the highest exponent. 1 linear, 2 quadratic, 3 cubic, 4 quartic, 5 quintic.",
      steps:[{ m:shown.map(t => termTex(t) + R`\to ${tdeg(t)}`).join(R`,\quad `), why:"Degree of each term (a constant has degree 0)." },
        { m:R`\text{degree } ${d} \Rightarrow \text{${DEG[d]}}`, why:"0 constant, 1 linear, 2 quadratic, 3 cubic, 4 quartic, 5 quintic." }],
      key:"The degree name comes from the highest power only.", chk:{ kind:"dname" } });
  }});

  /* L2: name by degree and number of terms */
  const bothName = (d, k) => cap(DEG[d]) + " " + TERMN[k];
  function bothFb(d, k, dd, kk){
    const out = [];
    if (dd !== d) out.push("The highest power is " + d + ", so it is " + DEG[d] + ", not " + DEG[dd] + ".");
    if (kk !== k) out.push("It has " + k + " term" + (k > 1 ? "s" : "") + ", so it is " + art(TERMN[k]) + ", not " + art(TERMN[kk]) + ".");
    if (dd === k && kk === Math.min(d, 3) && dd !== d) out.push("The two counts are mixed up: degree is the highest power, the term name counts terms.");
    return out.join(" ");
  }
  function bothOptions(d, k){
    const c = [[d + 1, k], [d - 1, k], [d, k + 1], [d, k - 1], [k, Math.min(d, 3)], [d + 1, k - 1], [d - 1, k + 1], [d + 2, k], [d + 1, k + 1], [d - 2, k], [d + 2, k + 1]]
      .filter(([dd, kk]) => dd >= 1 && dd <= 5 && kk >= 1 && kk <= 3 && !(dd === d && kk === k));
    const picked = uniqBy(c, x => x.join()).slice(0, 2);
    const rest = shuffle(uniqBy(c, x => x.join()).slice(2));
    while (picked.length < 3 && rest.length) picked.push(rest.pop());
    return [{ html:bothName(d, k), correct:true }, ...picked.map(([dd, kk]) => ({ html:bothName(dd, kk), fb:bothFb(d, k, dd, kk) }))];
  }
  G.push({ id:"naming-both", skill:"naming", level:2, make(){
    const d = ri(1, 5), k = ri(1, Math.min(3, d + 1)), v = pickV();
    const co = randPoly(d, k, 9, 0.25), std = tl(co, v), shown = rnd01() < 0.6 ? scramble(std) : std;
    return Kit.mc({ prompt:"Name this polynomial by its degree and its number of terms.", tex:sumTex(shown), options:bothOptions(d, k),
      hint:"Two separate counts: the highest power gives the first word, the number of terms gives the second.",
      steps:[{ m:shown.map(t => termTex(t) + R`\to ${tdeg(t)}`).join(R`,\quad `), why:"Degree of each term. The highest is " + d + ", so it is " + DEG[d] + "." },
        { m:R`${k}\ \text{term${k > 1 ? "s" : ""}} \Rightarrow \text{${bothName(d, k).toLowerCase()}}`, why:"Count the terms for the second word: monomial, binomial or trinomial." }],
      key:"Name = degree word + term word, e.g. quadratic trinomial.", chk:{ kind:"bname" } });
  }});

  /* L2: standard form */
  G.push({ id:"naming-standard", skill:"naming", level:2, make(){
    const v = pickV(), d = ri(3, 5);
    let co; do { co = randPoly(d, 4, 9, 0.25); } while (!co.some(c => c < 0) || !co[0]);
    const std = tl(co, v), shown = scramble(std, true);
    const negs = std.filter(t => t.c < 0 && t !== std[0]);
    const flipT = negs.length ? pick(negs) : std[0];
    const flipped = std.map(t => t === flipT ? negT(t) : t);
    const asc = std.slice().reverse();
    const byCo = uniqBy(std.slice().sort((p, q) => Math.abs(q.c) - Math.abs(p.c) || tdeg(q) - tdeg(p)), t => t);
    const opts = [{ tex:sumTex(std), correct:true },
      { tex:sumTex(asc), fb:"That is ascending order. Standard form starts with the highest power." },
      { tex:sumTex(flipped), fb:R`The order is right, but \(${termTex(flipT)}\) lost its sign when it moved. Each term moves with its own sign.` },
      { tex:sumTex(byCo), fb:"That orders the terms by the size of the coefficients. Standard form orders them by the exponents." },
      { tex:sumTex(shown.slice(1).concat([shown[0]])), fb:"Moving the first term to the end does not sort the powers. Standard form goes from the highest power down." }];
    const options = uniqBy(opts, o => o.tex).slice(0, 4);
    return Kit.mc({ prompt:"Which shows this polynomial in standard form?", tex:sumTex(shown), options,
      hint:"Highest power first, then the next highest. Carry each sign with its term.",
      steps:[{ m:shown.map(t => termTex(t) + R`\to ${tdeg(t)}`).join(R`,\quad `), why:"Find the power of each term." },
        { m:sumTex(std), why:"Write the terms from the highest power down. Each term keeps the sign it had." }],
      key:"Standard form: descending powers, each term with its own sign.", chk:{ kind:"standard" } });
  }});

  /* L3: expand, then name */
  G.push({ id:"naming-expand", skill:"naming", level:3, make(){
    const v = pick(["x","x","a","m"]), b = ri(1, 7);
    const B = (a, c) => binTex(a, c, v);
    const forms = [
      () => ({ tex:R`(${B(1,b)})(${B(1,-b)})`, co:pmul([b, 1], [-b, 1]), note:"The outer and inner products cancel." }),
      () => { const s = sgn(b); return { tex:R`(${B(1,s)})^{2}`, co:pmul([s, 1], [s, 1]), note:"Squaring gives a middle term." }; },
      () => ({ tex:R`(${B(1,b)})(${polyTex([b*b, -b, 1], v)})`, co:pmul([b, 1], [b*b, -b, 1]), note:"Everything cancels except the cubes." }),
      () => ({ tex:R`${v}(${B(1,b)})(${B(1,-b)})`, co:pmul([0, 1], pmul([b, 1], [-b, 1])), note:"The middle terms cancel, then each term is multiplied by " + it(v) + "." }),
      () => { const c = nz(-6, 6); let e; do { e = sgn(ri(1, 9)); } while (e === b); return { tex:R`(${polyTex([b, 0, 1], v)}) - (${polyTex([e, -c, 1], v)})`, co:padd([b, 0, 1], pscale([e, -c, 1], -1)), note:"The squared terms cancel." }; },
      () => { const a = ri(2, 4); let c; do { c = sgn(ri(1, 6)); } while (a * c === b); return { tex:R`(${B(a,b)})(${B(1,-c)})`, co:pmul([b, a], [-c, 1]), note:"Two brackets of degree 1 give degree 2." }; },
      () => ({ tex:R`(${polyTex([b, 0, 1], v)})(${polyTex([-b, 0, 1], v)})`, co:pmul([b, 0, 1], [-b, 0, 1]), note:"The middle terms cancel." })];
    const f = pick(forms)(), co = f.co, d = pdeg(co), k = co.filter(c => c).length;
    return Kit.mc({ prompt:"Expand and simplify. What type of polynomial is the result?", tex:f.tex, options:bothOptions(d, k),
      hint:"Expand fully and combine like terms before you name it. Terms can cancel.",
      steps:[{ m:R`${f.tex} = ${polyTex(co, v)}`, why:"Expand and combine like terms. " + f.note },
        { m:R`\text{degree } ${d},\ ${k}\ \text{term${k > 1 ? "s" : ""}} \Rightarrow \text{${bothName(d, k).toLowerCase()}}`, why:"Name the simplified result, not the brackets." }],
      key:"Simplify first, then name: terms can cancel.", chk:{ kind:"bname" } });
  }});

  /* ---------- Skill 3: like terms ---------- */

  /* L1: pick the like term */
  G.push({ id:"like-pick", skill:"like", level:1, make(){
    const [x, y] = pick([["x","y"],["a","b"],["m","n"],["p","q"]]);
    const c = sgn(ri(2, 9));
    let c2; do { c2 = rnd01() < 0.25 ? sgn(1) : sgn(ri(2, 9)); } while (c2 === c);
    let target, correct, wrong;
    if (rnd01() < 0.5) {
      const e = ri(1, 3);
      target = T1(c, e, x);
      correct = T1(c2, e, x);
      wrong = shuffle([
        { t:T1(c, e + 1, x), fb:R`Same letter, but the power is ${e + 1}, not ${e}. Like terms need the same power.` },
        e >= 2 ? { t:T1(c, e - 1, x), fb:R`Same letter, but the power is ${e - 1}, not ${e}.` } : { t:T1(c, 0, x), fb:"A number on its own has no variable, so it is not like a term with a variable." },
        { t:T1(c, e, y), fb:R`Same number and same power, but a different letter. \(${x}\) and \(${y}\) are different variables.` },
        { t:{ c, p:[[x, e], [y, 1]] }, fb:R`This term has an extra \(${y}\). Like terms must have exactly the same variables.` }]).slice(0, 3);
    } else {
      let a, b; do { a = ri(1, 3); b = ri(1, 3); } while (a === b);
      target = { c, p:[[x, a], [y, b]] };
      correct = rnd01() < 0.4 ? { c:c2, p:[[y, b], [x, a]] } : { c:c2, p:[[x, a], [y, b]] };
      wrong = shuffle([
        { t:{ c, p:[[x, b], [y, a]] }, fb:R`The powers are swapped: \(${varTex([[x,b],[y,a]])}\) is not \(${varTex([[x,a],[y,b]])}\).` },
        { t:{ c, p:[[x, a], [y, b + 1]] }, fb:R`The power of \(${y}\) is ${b + 1}, not ${b}.` },
        { t:{ c, p:[[x, a]] }, fb:R`The \(${y}\) is missing. Like terms need exactly the same variables.` },
        { t:{ c, p:[[x, a + b]] }, fb:R`Same total degree, but the variables are different: \(${lab(x, a + b)}\) has no \(${y}\).` }]).slice(0, 3);
    }
    const options = [{ tex:termTex(correct), correct:true }, ...wrong.map(w => ({ tex:termTex(w.t), fb:w.fb }))];
    return Kit.mc({ prompt:"Which term is a like term with this one?", tex:termTex(target), options,
      hint:"Ignore the numbers in front. Compare the letters and their powers.",
      steps:[{ m:R`${termTex(target)}:\ \text{variable part } ${varTex(target.p)}`, why:"The coefficient does not matter for like terms." },
        { m:R`${termTex(correct)}:\ \text{variable part } ${varTex(correct.p)}`, why:"Same letters with the same powers" + (correct.p.length > 1 && correct.p[0][0] !== target.p[0][0] ? " (the order of the letters does not matter)" : "") + ", so they are like terms." }],
      key:"Like terms: same letters, same powers. The coefficients can be anything.", chk:{ kind:"like", target:termTex(target) } });
  }});

  /* L2: are these two terms like? */
  G.push({ id:"like-same", skill:"like", level:2, make(){
    const [x, y] = pick([["x","y"],["a","b"],["m","n"]]);
    const c1 = sgn(ri(2, 9)); let c2; do { c2 = sgn(ri(1, 9)); } while (c2 === c1);
    const kind = pick(["swap","swap","swap","reorder","reorder","like","power","vars","vars"]);
    let A, B;
    let a, b; do { a = ri(1, 3); b = ri(1, 3); } while (a === b);
    if (kind === "swap") { A = { c:c1, p:[[x, a], [y, b]] }; B = { c:c2, p:[[x, b], [y, a]] }; }
    else if (kind === "reorder") { A = { c:c1, p:[[x, a], [y, b]] }; B = { c:c2, p:[[y, b], [x, a]] }; }
    else if (kind === "like") { const e = ri(1, 4); A = T1(c1, e, x); B = T1(c2, e, x); }
    else if (kind === "power") { const e = ri(1, 3); A = T1(c1, e, x); B = T1(c2, e + ri(1, 2), x); }
    else { const e = ri(1, 3); A = rnd01() < 0.5 ? T1(c1, e, x) : { c:c1, p:[[x, 1], [y, 1]] }; B = A.p.length === 1 ? T1(c2, e, y) : { c:c2, p:[[x, 1], [{ y:"z", b:"c", n:"p" }[y], 1]] }; }
    const like = kind === "reorder" || kind === "like", sameVars = kind === "swap" || kind === "power";
    const opt = [
      { html:"Like terms: the same variables, each with the same power", correct:like,
        fb: kind === "swap" ? R`Look closely: \(${varTex(A.p)}\) and \(${varTex(B.p)}\) have the powers on different letters.` : sameVars ? "The letters match, but the powers do not." : "The variables are not the same." },
      { html:"Unlike terms: the coefficients are different", correct:false, fb:"The coefficients never decide it. Like terms can have any numbers in front." },
      { html:"Unlike terms: same variables, but with different powers", correct:sameVars,
        fb: like ? (kind === "reorder" ? R`The letters are written in a different order, but \(${varTex(A.p)}\) and \(${varTex(B.p)}\) are the same product.` : "The powers are the same.") : "The variables themselves are different, not just the powers." },
      { html:"Unlike terms: they do not have the same variables", correct:kind === "vars",
        fb: kind === "reorder" ? "Both terms use the same letters, just written in a different order." : "Both terms use exactly the same letters." }];
    const options = opt.map(o => o.correct ? { html:o.html, correct:true } : { html:o.html, fb:o.fb });
    const why = kind === "swap" ? R`\(${varTex(A.p)}=${A.p.map(([v, e]) => Array(e).fill(v).join(R`\cdot `)).join(R`\cdot `)}\) but \(${varTex(B.p)}=${B.p.map(([v, e]) => Array(e).fill(v).join(R`\cdot `)).join(R`\cdot `)}\). Different products, so unlike.`
      : kind === "reorder" ? "Multiplication can be done in any order, so the variable parts are equal. These are like terms."
      : kind === "like" ? "Same letter, same power. The coefficients do not matter."
      : kind === "power" ? "Same letter, but different powers. Unlike."
      : "The letters are different. Unlike.";
    return Kit.mc({ prompt:"Are these like terms?", tex:R`${termTex(A)} \quad\text{and}\quad ${termTex(B)}`, options,
      hint:"Write out each variable part as a product, like x·x·y. Ignore the numbers in front.",
      steps:[{ m:R`${varTex(A.p)}\quad\text{vs}\quad ${varTex(B.p)}`, why:"Compare only the variable parts." },
        { m: like ? R`\text{like terms}` : R`\text{unlike terms}`, why }],
      key:"Same letters with the same powers; order and coefficients do not matter.", chk:{ kind:"likesame", a:termTex(A), b:termTex(B) } });
  }});

  /* L1: combine like terms (one variable) */
  function split2(total){ let p, q; do { p = nz(-9, 9); q = total - p; } while (!q || Math.abs(q) > 9); return [p, q]; }
  G.push({ id:"like-combine", skill:"like", level:1, make(){
    const v = pickV(), a2 = nz(-8, 8), a1 = nz(-8, 8), a0 = nz(-9, 9);
    const g2 = split2(a2).map(c => T1(c, 2, v)), g1 = split2(a1).map(c => T1(c, 1, v));
    const g0 = (rnd01() < 0.5 ? split2(a0) : [a0]).map(c => T1(c, 0, v));
    let terms; do { terms = shuffle([...g2, ...g1, ...g0]); } while (terms.slice(1).every((t, i) => tdeg(t) <= tdeg(terms[i])));
    const absC = [g0, g1, g2].map(g => g.reduce((s, t) => s + Math.abs(t.c), 0));
    const grp = g => "(" + g.map(t => pn(t.c)).join(" + ") + ")";
    return polyQ({ v, hi:2, ans:[a0, a1, a2], prompt:"Simplify by combining like terms.", tex:sumTex(terms),
      cands:[{ co:absC, msg:"You added the sizes and ignored the minus signs. Each term keeps the sign in front of it." },
        { when:{ 2:a2 + a1 }, msg:R`\(${lab(v,2)}\) and \(${v}\) terms are unlike, so they cannot be added together.` }],
      hint:R`Collect the \(${lab(v,2)}\) terms, the \(${v}\) terms and the numbers separately. Keep each sign.`,
      steps:[{ m:R`(${sumTex(g2)}) + (${sumTex(g1)}) + (${sumTex(g0)})`, why:"Group the like terms. Each term moves with the sign in front of it." },
        { m:R`= ${grp(g2)}${lab(v,2)} + ${grp(g1)}${v} + ${grp(g0)}`, why:"Add the coefficients in each group. The variable part stays the same." },
        { m:R`= ${polyTex([a0, a1, a2], v)}`, why:"Tidy up the signs." }],
      key:"Combine like terms by adding coefficients; exponents never change." });
  }});

  /* L2: combine like terms with two variables */
  G.push({ id:"like-combine2", skill:"like", level:2, make(){
    const [x, y] = pick([["x","y"],["a","b"],["m","n"]]);
    const P1 = [[x, 2], [y, 1]], P2 = [[x, 1], [y, 2]], P3 = [[x, 1], [y, 1]];
    const s1 = nz(-8, 8), s2 = nz(-8, 8), s3 = nz(-9, 9);
    const g1 = split2(s1).map(c => ({ c, p:P1 })), g2 = split2(s2).map(c => ({ c, p:P2 }));
    const g3 = (rnd01() < 0.5 ? split2(s3) : [s3]).map(c => ({ c, p:P3 }));
    const terms = shuffle([...g1, ...g2, ...g3]);
    const items = [{ k:"a", p:P1 }, { k:"b", p:P2 }, { k:"c", p:P3 }];
    const grp = g => "(" + g.map(t => pn(t.c)).join(" + ") + ")";
    return fieldsQ({ items, answer:{ a:s1, b:s2, c:s3 }, prompt:"Simplify by combining like terms.", tex:sumTex(terms),
      cands:[{ when:{ a:s1 + s2 }, msg:R`\(${varTex(P1)}\) and \(${varTex(P2)}\) are unlike: \(${x}\cdot ${x}\cdot ${y}\) is not \(${x}\cdot ${y}\cdot ${y}\). Keep them separate.` },
        { when:{ b:s1 + s2 }, msg:R`\(${varTex(P1)}\) and \(${varTex(P2)}\) are unlike: \(${x}\cdot ${x}\cdot ${y}\) is not \(${x}\cdot ${y}\cdot ${y}\). Keep them separate.` },
        { ans:{ a:g1.reduce((s, t) => s + Math.abs(t.c), 0), b:g2.reduce((s, t) => s + Math.abs(t.c), 0), c:g3.reduce((s, t) => s + Math.abs(t.c), 0) }, msg:"You ignored the minus signs. Each term keeps the sign in front of it." }],
      hint:R`Three different variable parts: \(${varTex(P1)}\), \(${varTex(P2)}\) and \(${varTex(P3)}\). Look at the power on each letter.`,
      steps:[{ m:R`(${sumTex(g1)}) + (${sumTex(g2)}) + (${sumTex(g3)})`, why:R`Group like terms. \(${varTex(P1)}\) and \(${varTex(P2)}\) go in different groups because the powers sit on different letters.` },
        { m:R`= ${grp(g1)}${varTex(P1)} + ${grp(g2)}${varTex(P2)} + ${grp(g3)}${varTex(P3)}`, why:"Add the coefficients in each group." },
        { m:R`= ${sumTex([{ c:s1, p:P1 }, { c:s2, p:P2 }, { c:s3, p:P3 }])}`, why:"The variable parts do not change." }],
      key:"x²y and xy² are unlike terms: check which letter carries each power." });
  }});

  /* L3: which simplification is correct */
  G.push({ id:"like-trap", skill:"like", level:3, make(){
    const [x, y] = pick([["x","y"],["a","b"],["m","n"]]);
    const P1 = [[x, 2], [y, 1]], P2 = [[x, 1], [y, 2]];
    let a, b, c, d;
    do { a = nz(-9, 9); b = nz(-9, 9); c = nz(-9, 9); d = nz(-9, 9); }
    while (!(a + c) || !(b + d) || !(a + b + c + d) || a + b + c + d === a + c || Math.abs(a + c) > 12 || Math.abs(b + d) > 12);
    const t = [{ c:a, p:P1 }, { c:b, p:P2 }, { c, p:P1 }, { c:d, p:P2 }];
    const order = pick([[0, 1, 2, 3], [0, 1, 3, 2], [1, 0, 2, 3], [0, 3, 1, 2]]).map(i => t[i]);
    const right = sumTex([{ c:a + c, p:P1 }, { c:b + d, p:P2 }]);
    const options = uniqBy([{ tex:right, correct:true },
      { tex:termTex({ c:a + b + c + d, p:P1 }), fb:R`\(${varTex(P1)}\) and \(${varTex(P2)}\) are unlike terms (\(${x}\cdot ${x}\cdot ${y}\) vs \(${x}\cdot ${y}\cdot ${y}\)), so they cannot be added together.` },
      { tex:sumTex([{ c:a + c, p:[[x, 4], [y, 2]] }, { c:b + d, p:[[x, 2], [y, 4]] }]), fb:"The grouping is right, but adding like terms does not change exponents. Exponents add only when you multiply." },
      { tex:sumTex([{ c:a + c, p:P1 }, { c:b - d, p:P2 }]), fb:R`Watch the sign of \(${termTex({ c:d, p:P2 })}\): it is ${d}, so the \(${varTex(P2)}\) coefficient is \(${b}+${pn(d)}=${b + d}\).` },
      { tex:sumTex([{ c:a - c, p:P1 }, { c:b + d, p:P2 }]), fb:R`Watch the sign of \(${termTex({ c, p:P1 })}\): the \(${varTex(P1)}\) coefficient is \(${a}+${pn(c)}=${a + c}\).` }], o => o.tex).slice(0, 4);
    return Kit.mc({ prompt:"Which is the fully simplified form?", tex:sumTex(order), options,
      hint:"Pair up terms with exactly the same letters and powers. Keep every sign.",
      steps:[{ m:R`(${sumTex([t[0], t[2]])}) + (${sumTex([t[1], t[3]])})`, why:R`Group the \(${varTex(P1)}\) terms and the \(${varTex(P2)}\) terms. They are different terms.` },
        { m:R`= (${a} + ${pn(c)})${varTex(P1)} + (${b} + ${pn(d)})${varTex(P2)} = ${right}`, why:"Add the coefficients. The exponents stay the same." }],
      key:"Group by exact variable part; add coefficients, never exponents.", chk:{ kind:"equal", expr:sumTex(order) } });
  }});

  /* ---------- Skill 4: adding and subtracting ---------- */
  function randQuad(m){ return [nz(-m, m), nz(-m, m), rnd01() < 0.25 ? sgn(1) : sgn(ri(2, m))]; }

  /* L1: add two quadratics */
  G.push({ id:"addsub-add", skill:"addsub", level:1, make(){
    const v = pickV(), A = randQuad(9);
    let B; do { B = randQuad(9); if (rnd01() < 0.3) B[pick([0, 1])] = 0; } while (!padd(A, B)[2]);
    const S = padd(A, B), At = tl(A, v), Bt = tl(B, v);
    return polyQ({ v, hi:2, ans:S, prompt:"Add the polynomials and simplify.", tex:R`(${polyTex(A, v)}) + (${polyTex(B, v)})`,
      cands:[{ co:padd(A, pscale(B, -1)), msg:"You subtracted. A plus sign in front of a bracket keeps every sign the same." }],
      hint:"Remove the brackets without changing any signs, then combine like terms.",
      steps:[{ m:R`= ${sumTex([...At, ...Bt])}`, why:"A + in front of the bracket changes nothing, so just remove the brackets." },
        { m:R`= ${sumTex(byDeg([...At, ...Bt]))}`, why:"Put like terms next to each other." },
        { m:R`= ${polyTex(S, v)}`, why:"Add the coefficients of each pair of like terms." }],
      key:"Adding: drop the brackets, then combine like terms." });
  }});

  /* L1: subtract two quadratics */
  function subCands(A, Bt, v){
    const negFirst = termsToCo([...tl(A, v), ...Bt.map((t, i) => i === 0 ? negT(t) : t)], v);
    return [{ co:negFirst, msg:R`You changed the sign of only the first term in the second bracket. The minus sign multiplies <b>every</b> term: \(-(${sumTex(Bt)}) = ${sumTex(Bt.map(negT))}\).` },
      { co:termsToCo([...tl(A, v), ...Bt], v), msg:"You added the second bracket. The minus sign in front means every term in it changes sign." }];
  }
  G.push({ id:"addsub-sub", skill:"addsub", level:1, make(){
    const v = pickV(), A = randQuad(9);
    let B; do { B = randQuad(9); } while (!padd(A, pscale(B, -1))[2]);
    const D = padd(A, pscale(B, -1)), At = tl(A, v), Bt = tl(B, v);
    return polyQ({ v, hi:2, ans:D, prompt:"Subtract and simplify.", tex:R`(${polyTex(A, v)}) - (${polyTex(B, v)})`,
      cands:[...subCands(A, Bt, v), { co:pscale(D, -1), msg:"You worked out the second bracket minus the first. Keep the order: first bracket minus second." }],
      hint:"The minus sign changes the sign of every term in the second bracket. Then combine like terms.",
      steps:[{ m:R`= ${sumTex([...At, ...Bt.map(negT)])}`, why:R`The minus in front of the bracket changes the sign of <b>every</b> term inside: \(-(${polyTex(B, v)}) = ${sumTex(Bt.map(negT))}\).` },
        { m:R`= ${sumTex(byDeg([...At, ...Bt.map(negT)]))}`, why:"Put like terms next to each other." },
        { m:R`= ${polyTex(D, v)}`, why:"Combine each pair of like terms." }],
      key:"Minus a bracket: flip the sign of every term inside, not just the first." });
  }});

  /* L2: cubics with missing terms */
  G.push({ id:"addsub-missing", skill:"addsub", level:2, make(){
    const v = pickV(), sub = rnd01() < 0.6;
    let A, B, R2;
    do {
      A = randPoly(3, ri(3, 4), 9, 0.25);
      B = randPoly(ri(2, 3), ri(2, 3), 9, 0.25);
      R2 = padd(A, pscale(B, sub ? -1 : 1));
    } while (!R2[3] || R2.every((c, i) => i === 3 || c));
    const At = tl(A, v), Bt = tl(B, v), Bs = sub ? Bt.map(negT) : Bt;
    return polyQ({ v, hi:3, ans:R2, prompt:(sub ? "Subtract" : "Add") + " and simplify. Some powers are missing: type 0 for any term that does not appear in the answer.",
      tex:R`(${polyTex(A, v)}) ${sub ? "-" : "+"} (${polyTex(B, v)})`,
      cands: sub ? subCands(A, Bt, v) : [{ co:padd(A, pscale(B, -1)), msg:"You subtracted. A plus sign in front of a bracket keeps every sign the same." }],
      hint:"Line up like terms by their power. A missing power has coefficient 0.",
      steps:[{ m:R`= ${sumTex([...At, ...Bs])}`, why: sub ? "The minus sign flips the sign of every term in the second bracket." : "A + in front of the bracket changes nothing." },
        { m:R`= ${sumTex(byDeg([...At, ...Bs]))}`, why:"Group like terms by power. Terms with no partner are copied down." },
        { m:R`= ${polyTex(R2, v)}`, why:"Combine. A power that does not appear has coefficient 0." }],
      key:"Match terms by power; a missing power has coefficient 0." });
  }});

  /* L3: subtract P from Q */
  G.push({ id:"addsub-from", skill:"addsub", level:3, make(){
    const v = pickV();
    let P, Q, D;
    do { P = randPoly(3, ri(3, 4), 9, 0.25); Q = randPoly(ri(2, 3), 3, 9, 0.25); D = padd(Q, pscale(P, -1)); } while (!D[3]);
    const Pt = tl(P, v), Qt = tl(Q, v), word = pick(["Subtract P from Q.", "Take P away from Q.", "Find the result when P is subtracted from Q."]);
    return polyQ({ v, hi:3, ans:D, prompt:word + " Simplify, and type 0 for any missing term.",
      tex:R`\begin{gathered} P = ${polyTex(P, v)} \\ Q = ${polyTex(Q, v)} \end{gathered}`,
      cands:[{ co:pscale(D, -1), msg:"You worked out P − Q. Subtracting P from Q means Q − P: start with Q." }, ...subCands(Q, Pt, v)],
      hint:"Subtract P from Q means Q − P. Then the minus flips every sign in P.",
      steps:[{ m:R`Q - P = (${polyTex(Q, v)}) - (${polyTex(P, v)})`, why:"\"Subtract P from Q\" means start with Q and take P away." },
        { m:R`= ${sumTex([...Qt, ...Pt.map(negT)])}`, why:"The minus sign flips the sign of every term of P." },
        { m:R`= ${sumTex(byDeg([...Qt, ...Pt.map(negT)]))}`, why:"Group like terms by power." },
        { m:R`= ${polyTex(D, v)}`, why:"Combine like terms." }],
      key:"\"Subtract P from Q\" is Q − P, and the minus reaches every term of P.",
      chk:{ expr:R`(${polyTex(Q, v)}) - (${polyTex(P, v)})` } });
  }});

  /* ---------- Skill 5: distributive property ---------- */

  /* L1: a(bx + c), -a(bx - c), m x(ax + b) */
  G.push({ id:"distrib-basic", skill:"distrib", level:1, make(){
    const v = pickV(), form = pick(["pos","pos","neg","neg","x","x"]);
    if (form === "x") {
      const m = pick([1, 1, 2, 3, -1, -2]), a = rnd01() < 0.2 ? 1 : ri(2, 9), b = sgn(ri(1, 9));
      const mx = termTex(T1(m, 1, v)), inner = binTex(a, b, v), ans = [0, m * b, m * a];
      return polyQ({ v, hi:2, lo:1, ans, prompt:"Expand.", tex:R`${mx}(${inner})`,
        cands:[{ when:{ 2:m * a, 1:b }, msg:R`You multiplied only the first term. \(${mx}\) also multiplies \(${pn(b)}\).` },
          { when:{ 2:0, 1:m * a + m * b }, msg:R`\(${v}\cdot ${v} = ${lab(v,2)}\), so the first product is an \(${lab(v,2)}\) term.` }],
        hint:R`Multiply \(${mx}\) by each term inside. Remember \(${v}\cdot ${v} = ${lab(v,2)}\).`,
        steps:[{ m:R`= (${mx})(${termTex(T1(a, 1, v))}) + (${mx})(${b})`, why:"The term outside multiplies every term inside." },
          { m:R`= ${polyTex(ans, v)}`, why:R`Multiply the numbers. \(${v}\cdot ${v} = ${lab(v,2)}\) (add the exponents 1 + 1).` }],
        key:"Multiply the outside term by every term inside; x·x = x²." });
    }
    const a = ri(2, 9), b = ri(1, 9), c = form === "pos" ? sgn(ri(1, 9)) : ri(1, 9);
    const k = form === "pos" ? a : -a, inner = form === "pos" ? binTex(b, c, v) : binTex(b, -c, v), cc = form === "pos" ? c : -c;
    const ans = [k * cc, k * b];
    return polyQ({ v, hi:1, ans, prompt:"Expand.", tex:R`${k}(${inner})`,
      cands:[{ co:[cc, k * b], msg:R`You multiplied only the first term. The ${k} multiplies \(${pn(cc)}\) too.` },
        form === "neg" ? { co:[-k * cc, k * b], msg:R`Sign slip on the second term: \((${k})\times(${cc}) = ${k * cc}\). Negative times negative is positive.` } : null,
        { co:[k + cc, k * b], msg:R`You added ${k} and ${pn(cc)}. Distributing means multiply: \(${pn(k)}\times${pn(cc)} = ${k * cc}\).` }].filter(Boolean),
      hint:"Multiply the number outside, with its sign, by each term inside.",
      steps:[{ m:R`= (${k})(${termTex(T1(b, 1, v))}) + (${k})(${cc})`, why: form === "neg" ? R`The ${k} multiplies every term, and its minus sign comes with it.` : "The number outside multiplies every term inside." },
        { m:R`= ${polyTex(ans, v)}`, why: form === "neg" ? R`\((${k})(${cc}) = ${k * cc}\): negative times negative is positive.` : "Multiply each pair." }],
      key:"The number outside, with its sign, multiplies every term inside." });
  }});

  /* L2: kx(ax² + bx + c) and kx²(ax + b) */
  G.push({ id:"distrib-x", skill:"distrib", level:2, make(){
    const v = pickV(), k = pick([2, 3, 4, 5, -2, -3, -4, -1, 2, -5]);
    if (rnd01() < 0.7) {
      const a = ri(1, 5), b = sgn(ri(1, 6)), c = sgn(ri(1, 9));
      const kx = termTex(T1(k, 1, v)), inner = polyTex([c, b, a], v), ans = [0, k * c, k * b, k * a];
      return polyQ({ v, hi:3, lo:1, ans, prompt:"Expand.", tex:R`${kx}(${inner})`,
        cands:[{ when:{ 3:k * a, 2:b, 1:c }, msg:R`You multiplied only the first term. \(${kx}\) multiplies all three terms inside.` },
          { when:{ 3:0, 2:k * a, 1:k * b }, msg:R`The powers go up by 1: \(${v}\cdot ${lab(v,2)} = ${lab(v,3)}\) and \(${v}\cdot ${v} = ${lab(v,2)}\).` }],
        hint:R`Three terms inside, so three products. Add exponents: \(${v}\cdot ${lab(v,2)} = ${lab(v,3)}\).`,
        steps:[{ m:R`= (${kx})(${termTex(T1(a, 2, v))}) + (${kx})(${termTex(T1(b, 1, v))}) + (${kx})(${c})`, why:"The term outside, with its sign, multiplies each term inside." },
          { m:R`= ${polyTex(ans, v)}`, why:"Multiply the numbers and add the exponents of " + it(v) + "." }],
        key:"Multiply every term: numbers multiply, exponents add." });
    }
    const a = ri(1, 6), b = sgn(ri(1, 9));
    const kx = termTex(T1(k, 2, v)), ans = [0, 0, k * b, k * a];
    return polyQ({ v, hi:3, lo:2, ans, prompt:"Expand.", tex:R`${kx}(${binTex(a, b, v)})`,
      cands:[{ when:{ 3:k * a, 2:b }, msg:R`You multiplied only the first term. \(${kx}\) also multiplies \(${pn(b)}\).` }],
      hint:R`\(${lab(v,2)}\cdot ${v} = ${lab(v,3)}\) (add the exponents).`,
      steps:[{ m:R`= (${kx})(${termTex(T1(a, 1, v))}) + (${kx})(${b})`, why:"Multiply the outside term by each term inside." },
        { m:R`= ${polyTex(ans, v)}`, why:R`Multiply the numbers; \(${lab(v,2)}\cdot ${v} = ${lab(v,3)}\).` }],
      key:"Multiply every term: numbers multiply, exponents add." });
  }});

  /* L2: a(bx + c) ± d(ex + f) */
  G.push({ id:"distrib-two", skill:"distrib", level:2, make(){
    const v = pickV();
    let a, b, c, d, e, f, ans;
    do { a = ri(2, 6); b = ri(1, 5); c = sgn(ri(1, 9)); d = sgn(ri(2, 6)); e = ri(1, 5); f = sgn(ri(1, 9)); ans = [a * c + d * f, a * b + d * e]; } while (!ans[1] || !ans[0]);
    const tex = R`${a}(${binTex(b, c, v)}) ${d < 0 ? "-" : "+"} ${Math.abs(d)}(${binTex(e, f, v)})`;
    return polyQ({ v, hi:1, ans, prompt:"Expand and simplify.", tex,
      cands:[d < 0 ? { co:[a * c - d * f, a * b + d * e], msg:R`The ${d} multiplies both terms of the second bracket: \((${d})(${f}) = ${d * f}\). You changed the sign of only the first term.` } : null,
        { co:[c + f, a * b + d * e], msg:"You multiplied only the first term in each bracket. The number outside multiplies every term inside." }].filter(Boolean),
      hint:"Expand each bracket separately (the sign in front goes with its number), then combine like terms.",
      steps:[{ m:R`= ${polyTex([a * c, a * b], v)}`, why:R`First bracket: \(${a}\times${b}${v}\) and \(${a}\times${pn(c)}\).` },
        { m:R`\phantom{=}\ ${sumTex([T1(d * e, 1, v), T1(d * f, 0, v)])}`, why:R`Second bracket: multiply by \(${d}\), sign included.` },
        { m:R`= ${sumTex([T1(a * b, 1, v), T1(d * e, 1, v), T1(a * c, 0, v), T1(d * f, 0, v)])} = ${polyTex(ans, v)}`, why:"Combine like terms." }],
      key:"Expand each bracket with its own sign, then collect like terms." });
  }});

  /* L3: px(qx + r) - s(tx² + ux + w) */
  G.push({ id:"distrib-sub", skill:"distrib", level:3, make(){
    const v = pickV();
    let p, q, r, s, t, u, w, ans;
    do { p = ri(1, 4); q = ri(1, 3); r = sgn(ri(1, 6)); s = ri(2, 5); t = ri(1, 3); u = sgn(ri(1, 6)); w = sgn(ri(1, 9)); ans = [-s * w, p * r - s * u, p * q - s * t]; } while (!ans[1] || !ans[2]);
    const px = termTex(T1(p, 1, v)), sec = polyTex([w, u, t], v);
    return polyQ({ v, hi:2, ans, prompt:"Expand and simplify.", tex:R`${px}(${binTex(q, r, v)}) - ${s}(${sec})`,
      cands:[{ co:[s * w, p * r + s * u, p * q - s * t], msg:R`The \(-${s}\) multiplies every term in the second bracket. You changed the sign of only the first term: \(-${s}(${sec}) = ${polyTex([-s * w, -s * u, -s * t], v)}\).` },
        { co:[-w, p * r - u, p * q - s * t], msg:R`The ${s} must multiply every term of the second bracket, not only the first.` },
        { co:[s * w, p * r + s * u, p * q + s * t], msg:"You added the second bracket. The minus sign in front of the " + s + " changes every sign." }],
      hint:R`Treat it as \(+(-${s})\): multiply \(-${s}\) by every term of the second bracket.`,
      steps:[{ m:R`${px}(${binTex(q, r, v)}) = ${polyTex([0, p * r, p * q], v)}`, why:"Expand the first bracket." },
        { m:R`-${s}(${sec}) = ${polyTex([-s * w, -s * u, -s * t], v)}`, why:R`Multiply each term by \(-${s}\). Every sign changes.` },
        { m:R`${sumTex([T1(p * q, 2, v), T1(-s * t, 2, v), T1(p * r, 1, v), T1(-s * u, 1, v), T1(-s * w, 0, v)])} = ${polyTex(ans, v)}`, why:"Combine like terms." }],
      key:"A negative number in front of a bracket changes the sign of every term it multiplies." });
  }});

  /* ---------- Skill 6: FOIL ---------- */
  function foilCands(a, b, c, d, v){
    return [
      { co:[b * d, 0, a * c], msg:"You only multiplied first by first and last by last. The outer and inner products give the middle term." },
      a === 1 && c === 1 ? { co:[b + d, b * d, a * c], msg:"The middle and last terms are swapped. The last term is the product of the numbers, and the middle term is their sum (outer + inner)." } : null,
      { when:{ 1:a * d }, msg:"Your middle term is only the outer product. Add the inner product too." },
      { when:{ 1:b * c }, msg:"Your middle term is only the inner product. Add the outer product too." },
      { when:{ 0:-b * d }, msg:R`Check the last product: \((${b})(${d}) = ${b * d}\). ${b * d > 0 ? "Same signs give a positive." : "Different signs give a negative."}` },
      { when:{ 1:a * d - b * c }, msg:"Sign slip in the middle term: add the outer and inner products, each with its own sign." },
      { when:{ 1:b * c - a * d }, msg:"Sign slip in the middle term: add the outer and inner products, each with its own sign." },
      { when:{ 2:a + c }, msg:R`\((${t2(a, v)})(${t2(c, v)})\): multiply the numbers (${a * c}), do not add them.` }].filter(Boolean);
  }

  /* L1: (x + b)(x + d) */
  G.push({ id:"foil-basic", skill:"foil", level:1, make(){
    const v = pickV();
    let b, d; do { b = nz(-9, 9); d = nz(-9, 9); } while (b + d === 0);
    const ans = [b * d, b + d, 1];
    return polyQ({ v, hi:2, ans, prompt:"Expand and simplify using FOIL.", tex:R`(${binTex(1, b, v)})(${binTex(1, d, v)})`,
      cands:foilCands(1, b, 1, d, v).filter(c => !(c.when && c.when[2] !== undefined)),
      hint:"First, Outer, Inner, Last: four products. Then combine the two middle terms.",
      steps:foilSteps(1, b, 1, d, v),
      key:"Four products (F, O, I, L), then combine the middle terms." });
  }});

  /* L2: (ax + b)(cx + d) */
  G.push({ id:"foil-general", skill:"foil", level:2, make(){
    const v = pickV();
    let a, b, c, d;
    do { a = pick([1, 2, 3, 4, -1, -2, 2, 3]); c = ri(1, 5); b = nz(-9, 9); d = nz(-9, 9); } while ((a === 1 && c === 1) || a * d + b * c === 0);
    const ans = [b * d, a * d + b * c, a * c];
    return polyQ({ v, hi:2, ans, prompt:"Expand and simplify.", tex:R`(${binTex(a, b, v)})(${binTex(c, d, v)})`,
      cands:foilCands(a, b, c, d, v), hint:"Use FOIL. Keep each sign attached to its number.",
      steps:foilSteps(a, b, c, d, v),
      key:"FOIL: multiply each pair, then add the outer and inner products." });
  }});

  /* L2: just the middle coefficient, with a box table */
  G.push({ id:"foil-middle", skill:"foil", level:2, make(){
    const v = pickV();
    let a, b, c, d;
    do { a = ri(1, 5); c = ri(1, 5); b = nz(-9, 9); d = nz(-9, 9); } while ((a === 1 && c === 1) || a * d + b * c === 0);
    const mid = a * d + b * c, t = (k, e) => termTex(T1(k, e, v));
    return { type:"num", prompt:R`This product is expanded and simplified. What is the coefficient of \(${v}\)?`,
      tex:R`(${binTex(a, b, v)})(${binTex(c, d, v)})`, answer:mid,
      mistakes:mk([{ when:{v:a * d}, msg:"That is only the outer product. The inner product is also an " + it(v) + " term." },
        { when:{v:b * c}, msg:"That is only the inner product. The outer product is also an " + it(v) + " term." },
        { when:{v:b + d}, msg:"Adding the numbers works only when both brackets start with " + it(v) + ". Here multiply: outer + inner." },
        { when:{v:b * d}, msg:"That is the last product, the constant term." },
        { when:{v:a * d - b * c}, msg:"Sign slip: add the outer and inner products, each with its own sign." },
        { when:{v:b * c - a * d}, msg:"Sign slip: add the outer and inner products, each with its own sign." }], mid),
      hint:"The " + it(v) + " terms come from the Outer and Inner products.",
      steps:[{ m:R`\begin{array}{c|cc} \times & ${t(a,1)} & ${b} \\ \hline ${t(c,1)} & ${t(a*c,2)} & ${t(b*c,1)} \\ ${d} & ${t(a*d,1)} & ${b*d} \end{array}`, why:"Box method: each cell is one product. The two " + it(v) + " cells are the outer and inner products." },
        { m:R`${t(a*d,1)} ${b * c < 0 ? "-" : "+"} ${t(Math.abs(b*c),1)} = ${t(mid,1)}`, why:R`Add the like terms: \(${a*d}+${pn(b*c)}=${mid}\).` },
        { m:R`(${binTex(a, b, v)})(${binTex(c, d, v)}) = ${polyTex([b*d, mid, a*c], v)}`, why:"The full expansion, for checking." }],
      key:"Middle coefficient = outer + inner, signs included.", chk:{ kind:"coef", mono:v } };
  }});

  /* L3: (ax + b)² */
  G.push({ id:"foil-square", skill:"foil", level:3, make(){
    const v = pickV(), a = pick([1, 1, 2, 3, 4]), b = nz(-9, 9), bin = binTex(a, b, v);
    const ans = [b * b, 2 * a * b, a * a];
    const steps = [{ m:R`(${bin})^{2} = (${bin})(${bin})`, why:"Squaring means multiplying the bracket by itself. It is not squaring each term." }, ...foilSteps(a, b, a, b, v)];
    return polyQ({ v, hi:2, ans, prompt:"Expand and simplify.", tex:R`(${bin})^{2}`,
      cands:[{ co:[b * b, 0, a * a], msg:R`The middle term is missing. \((${bin})^{2}\) is \((${bin})(${bin})\), and the outer and inner products give \(${t2(2 * a * b, v)}\).` },
        { co:[-b * b, 0, a * a], msg:R`Two slips: the middle term \(${t2(2 * a * b, v)}\) is missing, and \((${b})^2 = ${b * b}\) is positive.` },
        { when:{ 1:a * b }, msg:R`The middle term comes twice (outer and inner), so it is \(2\times${pn(a * b)} = ${2 * a * b}\).` },
        { when:{ 0:-b * b }, msg:R`\((${b})\times(${b}) = ${b * b}\). A square is never negative.` },
        { when:{ 2:2 * a }, msg:R`\(${termTex(T1(a, 1, v))}\cdot ${termTex(T1(a, 1, v))} = ${termTex(T1(a * a, 2, v))}\). Multiply, do not double.` }],
      hint:"Write the square as two brackets and use FOIL. Expect a middle term.",
      steps, key:"(a + b)² = a² + 2ab + b²: never forget the middle term." });
  }});

  /* L3: difference of squares */
  G.push({ id:"foil-dos", skill:"foil", level:3, make(){
    const v = pickV(), a = pick([1, 2, 3, 4, 5]), b = ri(1, 9);
    const first = rnd01() < 0.5 ? b : -b;
    const tex = R`(${binTex(a, first, v)})(${binTex(a, -first, v)})`, ans = [-b * b, 0, a * a];
    return polyQ({ v, hi:2, ans, prompt:"Expand and simplify. Type 0 for any term that cancels.", tex,
      cands:[{ co:[b * b, 0, a * a], msg:R`The last product is \((${first})(${-first}) = ${-b * b}\): different signs give a negative.` },
        { when:{ 1:2 * a * b }, msg:R`The outer and inner products are \(${t2(-a * first, v)}\) and \(${t2(a * first, v)}\). They cancel, so the middle coefficient is 0.` },
        { when:{ 1:-2 * a * b }, msg:R`The outer and inner products are \(${t2(-a * first, v)}\) and \(${t2(a * first, v)}\). They cancel, so the middle coefficient is 0.` },
        { when:{ 2:2 * a }, msg:"Multiply the first terms; do not add them." }],
      hint:"Use FOIL. Look at what happens to the outer and inner products.",
      steps:[...foilSteps(a, first, a, -first, v), { m:R`(A + B)(A - B) = A^2 - B^2`, why:R`This is the difference of squares: \(A = ${termTex(T1(a, 1, v))}\), \(B = ${b}\).` }],
      key:"(a + b)(a − b) = a² − b²: the middle terms cancel." });
  }});

  /* L3: binomial x trinomial */
  G.push({ id:"foil-tri", skill:"foil", level:3, make(){
    const v = pickV();
    let b, c, d, e, ans;
    do { b = nz(-5, 5); c = ri(1, 3); d = nz(-6, 6); e = nz(-9, 9); ans = pmul([b, 1], [e, d, c]); } while (ans.some(k => !k));
    const tri = polyTex([e, d, c], v);
    const p1 = [0, e, d, c], p2 = pscale([e, d, c], b);
    return polyQ({ v, hi:3, ans, prompt:"Expand and simplify.", tex:R`(${binTex(1, b, v)})(${tri})`,
      cands:[{ co:padd([0, e, d, c], [b * e]), msg:R`You multiplied the ${b} only by the last term. It multiplies all three terms of the trinomial.` },
        { when:{ 0:b + e }, msg:R`The constant term is a product: \((${b})(${e}) = ${b * e}\).` }],
      hint:R`Multiply \(${v}\) by each term of the trinomial, then \(${b}\) by each term. Six products in all.`,
      steps:[{ m:R`${v}(${tri}) = ${polyTex(p1, v)}`, why:R`First term \(${v}\) times every term. Exponents add.` },
        { m:R`${pn(b)}(${tri}) = ${polyTex(p2, v)}`, why:R`Second term \(${b}\) times every term, sign included.` },
        { m:R`${sumTex([T1(c, 3, v), T1(d, 2, v), T1(b * c, 2, v), T1(e, 1, v), T1(b * d, 1, v), T1(b * e, 0, v)])}`, why:"Write all six products in order of power." },
        { m:R`= ${polyTex(ans, v)}`, why:"Combine like terms." }],
      key:"Every term times every term: 2 × 3 = 6 products, then collect." });
  }});

  /* L3: k(x + b)(x + d) */
  G.push({ id:"foil-k", skill:"foil", level:3, make(){
    const v = pickV(), k = pick([2, 3, 4, -2, -3, 2, 3]);
    let b, d; do { b = nz(-7, 7); d = nz(-7, 7); } while (b + d === 0);
    const inner = [b * d, b + d, 1], ans = pscale(inner, k);
    return polyQ({ v, hi:2, ans, prompt:"Expand and simplify.", tex:R`${k}(${binTex(1, b, v)})(${binTex(1, d, v)})`,
      cands:[{ co:pscale(inner, k * k), msg:R`You multiplied ${k} into both brackets, which multiplies by \(${pn(k)}^2\). The ${k} multiplies the product once.` },
        { co:[b * d, b + d, k], msg:R`The ${k} multiplies every term of the expanded product, not just the first.` },
        { co:inner, msg:R`You forgot the ${k} in front.` }],
      hint:R`Expand the two brackets first, then multiply every term by ${k}.`,
      steps:[...foilSteps(1, b, 1, d, v).slice(0, 4),
        { m:R`(${binTex(1, b, v)})(${binTex(1, d, v)}) = ${polyTex(inner, v)}`, why:"Combine the outer and inner products." },
        { m:R`${k}(${polyTex(inner, v)}) = ${polyTex(ans, v)}`, why:R`Multiply every term by ${k}${k < 0 ? ", which flips every sign" : ""}.` }],
      key:"Expand the brackets first, then multiply every term by the number in front." });
  }});

  /* Avoid repeating the same question inside one quiz */
  const POOL = G.map(g => ({ id:g.id, skill:g.skill, level:g.level, make(ctx){
    let q;
    for (let i = 0; i < 30; i++) {
      q = g.make(ctx);
      const sig = "poly|" + (q.prompt || "") + "|" + (q.tex || "");
      if (!ctx.used.has(sig)) { ctx.used.add(sig); break; }
    }
    return q;
  }}));

  registerTopic(T);
})();
