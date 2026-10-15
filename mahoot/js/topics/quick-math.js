/* ===== Topic: Quick math (used by games; hidden from the topic picker) =====
   Short questions a player can do in their head: ordering, comparing, + −, times tables, halving, rounding.
   Level 1 = easy whole numbers, 2 = decimals and bigger numbers, 3 = negatives, percentages, squares. */
(() => {
  const fmt = v => (Math.round(v * 1000) / 1000).toString();
  const shuffleDistinct = (make, n) => { const set = new Set(); let guard = 0; while (set.size < n && guard++ < 200) set.add(make()); return [...set]; };
  const sortAsc = a => a.slice().sort((x, y) => x - y);
  const signFor = (a, b) => a < b ? "<" : a > b ? ">" : "=";
  const SIGNS = [["<", "is less than"], ["=", "is equal to"], [">", "is greater than"]];
  function compareQ(a, b, aTxt, bTxt, why){
    const ans = signFor(a, b);
    return Kit.mc({ keepOrder:true, choiceRow:true,
      promptHtml:"Which sign goes in the box?",
      exprHtml:'<div class="expr"><span class="side">' + aTxt + '</span> <span class="box">?</span> <span class="side">' + bTxt + "</span></div>",
      options:SIGNS.map(([s, l]) => ({ html:'<span class="sign">' + esc(s) + '</span><span class="lbl">' + l + "</span>", correct:s === ans, fb:"Look again: " + why })),
      answerHtml:aTxt + " " + esc(ans) + " " + bTxt, workHtml:"<p>" + why + "</p>", key:"Compare the biggest place value first.", hint:"Which number is bigger?" });
  }
  const numQ = (prompt, expr, answer, work, key, hint, mistakes) => ({ type:"num", promptHtml:prompt, exprHtml:'<div class="expr">' + expr + "</div>", answer, workHtml:"<p>" + work + "</p>", key, hint, mistakes:mistakes || [] });

  const POOL = [
    /* ---------- level 1: whole numbers ---------- */
    { id:"order-int", skill:"order", level:1, make(){
      const xs = shuffleDistinct(() => ri(1, 99), 4), asc = seededRandom() < 0.7, sorted = asc ? sortAsc(xs) : sortAsc(xs).reverse();
      return Kit.order({ promptHtml:"Put these numbers in order from <b>" + (asc ? "smallest to largest" : "largest to smallest") + "</b>.", inOrder:sorted.map(String),
        axis: asc ? ["smallest", "largest"] : ["largest", "smallest"], missingMsg:"Place all the numbers first.",
        workHtml:"<p>Compare the tens first, then the ones: " + sorted.join(asc ? " &lt; " : " &gt; ") + ".</p>", key:"Compare tens first, then ones.", hint:"Find the " + (asc ? "smallest" : "largest") + " number first." }); } },
    { id:"cmp-int", skill:"compare", level:1, make(){
      let a = ri(10, 999), b = seededRandom() < 0.15 ? a : ri(10, 999);
      if (seededRandom() < 0.5 && a !== b) b = Number(String(a).split("").reverse().join("")) || b;
      return compareQ(a, b, String(a), String(b), a === b ? "they are the same number." : a + (a > b ? " is bigger than " : " is smaller than ") + b + ": compare the hundreds, then the tens, then the ones."); } },
    { id:"add", skill:"addsub", level:1, make(){
      const a = ri(12, 89), b = ri(3, 49);
      return numQ("Work it out in your head.", a + " + " + b + " =", a + b, a + " + " + b + " = " + (a + b) + ". Add the tens, then the ones: " + (Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10) + " + " + (a % 10 + b % 10) + ".", "Add tens first, then ones.", "Split into tens and ones."); } },
    { id:"sub", skill:"addsub", level:1, make(){
      const a = ri(30, 99), b = ri(5, a - 5);
      return numQ("Work it out in your head.", a + " − " + b + " =", a - b, a + " − " + b + " = " + (a - b) + ". Check: " + (a - b) + " + " + b + " = " + a + ".", "Check subtraction by adding back.", "Count up from " + b + " to " + a + "."); } },
    { id:"times", skill:"times", level:1, make(){
      const a = ri(2, 10), b = ri(2, 10);
      return numQ("Times tables.", a + " × " + b + " =", a * b, a + " × " + b + " = " + (a * b) + ".", "Know your tables up to 10 × 10.", "Count in " + a + "s.", [{ when:{ v:a + b }, msg:"You added. × means multiply." }]); } },
    { id:"double", skill:"times", level:1, make(){
      const half = seededRandom() < 0.5, n = half ? ri(5, 50) * 2 : ri(6, 49);
      return half ? numQ("Halve this number.", "half of " + n + " =", n / 2, "Half of " + n + " is " + n / 2 + ", because " + n / 2 + " + " + n / 2 + " = " + n + ".", "Halving is the same as dividing by 2.", "Split it into two equal parts.")
                  : numQ("Double this number.", "double " + n + " =", n * 2, "Double " + n + " is " + n + " + " + n + " = " + n * 2 + ".", "Doubling is the same as multiplying by 2.", "Add the number to itself."); } },
    { id:"missing", skill:"addsub", level:1, make(){
      const a = ri(3, 30), c = a + ri(4, 40);
      return numQ("Find the missing number.", a + " + ? = " + c, c - a, "? = " + c + " − " + a + " = " + (c - a) + ".", "To find a missing part, subtract.", "What do you add to " + a + " to get " + c + "?"); } },

    /* ---------- level 2: decimals, bigger numbers ---------- */
    { id:"order-dec", skill:"order", level:2, make(){
      const w = ri(0, 5), base = [ri(1, 9) / 10, ri(10, 99) / 100, ri(100, 999) / 1000, ri(1, 9) / 10];
      const xs = [...new Set(base.map(v => Number((w + v).toFixed(3))))];
      while (xs.length < 4) { const v = Number((w + ri(1, 99) / 100).toFixed(2)); if (!xs.includes(v)) xs.push(v); }
      const asc = seededRandom() < 0.6, sorted = asc ? sortAsc(xs) : sortAsc(xs).reverse();
      return Kit.order({ promptHtml:"Put these numbers in order from <b>" + (asc ? "smallest to largest" : "largest to smallest") + "</b>.", inOrder:sorted.map(fmt),
        axis: asc ? ["smallest", "largest"] : ["largest", "smallest"], missingMsg:"Place all the numbers first.",
        workHtml:"<p>Give every number the same number of decimal places, then compare: " + sorted.map(v => v.toFixed(3)).join(asc ? " &lt; " : " &gt; ") + ".</p>", key:"More digits does not mean bigger: pad with zeros, then compare.", hint:"Write them all with 3 decimal places in your head." }); } },
    { id:"cmp-dec", skill:"compare", level:2, make(){
      const a = ri(1, 9) / 10, b = Number((ri(10, 99) / 100).toFixed(2));
      return compareQ(a, b, fmt(a), fmt(b), fmt(a) + " = " + a.toFixed(2) + ", so compare " + a.toFixed(2) + " with " + b.toFixed(2) + "."); } },
    { id:"times12", skill:"times", level:2, make(){
      const a = ri(6, 12), b = ri(6, 12);
      return numQ("Times tables.", a + " × " + b + " =", a * b, a + " × " + b + " = " + (a * b) + ".", "Tables up to 12 × 12 make bigger sums quick.", "Use a fact you know, like " + a + " × 10, then adjust."); } },
    { id:"divide", skill:"times", level:2, make(){
      const b = ri(2, 12), q = ri(2, 12);
      return numQ("Divide.", (b * q) + " ÷ " + b + " =", q, (b * q) + " ÷ " + b + " = " + q + ", because " + b + " × " + q + " = " + (b * q) + ".", "Division is times tables backwards.", "Which number times " + b + " makes " + (b * q) + "?"); } },
    { id:"round", skill:"round", level:2, make(){
      const to = pick([10, 100]), n = to === 10 ? ri(11, 999) : ri(101, 9999), r = Math.round(n / to) * to;
      return numQ("Round to the nearest " + to + ".", String(n), r, "Look at the " + (to === 10 ? "ones" : "tens") + " digit: 5 or more rounds up, 4 or less rounds down. " + n + " → " + r + ".", "5 or more rounds up.", "Which multiple of " + to + " is closer?"); } },
    { id:"add-dec", skill:"addsub", level:2, make(){
      const a = ri(11, 89) / 10, b = ri(11, 49) / 10, s = Number((a + b).toFixed(1));
      return numQ("Work it out in your head.", fmt(a) + " + " + fmt(b) + " =", s, fmt(a) + " + " + fmt(b) + " = " + fmt(s) + ". Add the whole numbers, then the tenths.", "Line up the decimal points.", "Add the whole parts first."); } },

    /* ---------- level 3: negatives, percentages, squares ---------- */
    { id:"order-neg", skill:"order", level:3, make(){
      const xs = shuffleDistinct(() => ri(-20, 20) / (seededRandom() < 0.4 ? 2 : 1), 4).map(v => Number(v.toFixed(1)));
      const sorted = sortAsc(xs);
      return Kit.order({ promptHtml:"Put these numbers in order from <b>smallest to largest</b>.", inOrder:sorted.map(fmt), axis:["smallest", "largest"], missingMsg:"Place all the numbers first.",
        workHtml:"<p>Negative numbers are smaller than positive ones, and the further below zero, the smaller: " + sorted.map(fmt).join(" &lt; ") + ".</p>", key:"On a number line, smaller is further left.", hint:"Picture a number line." }); } },
    { id:"cmp-expr", skill:"compare", level:3, make(){
      const a = ri(3, 9), b = ri(3, 9), c = ri(3, 9), d = ri(3, 9);
      return compareQ(a * b, c * d, a + " × " + b, c + " × " + d, a + " × " + b + " = " + (a * b) + " and " + c + " × " + d + " = " + (c * d) + "."); } },
    { id:"percent", skill:"round", level:3, make(){
      const p = pick([10, 25, 50]), n = p === 25 ? ri(2, 30) * 4 : ri(2, 40) * 10, v = n * p / 100;
      return numQ("Work out the percentage.", p + "% of " + n + " =", v, p + "% of " + n + " = " + n + (p === 10 ? " ÷ 10" : p === 25 ? " ÷ 4" : " ÷ 2") + " = " + v + ".", "10% = ÷10, 25% = ÷4, 50% = ÷2.", p === 50 ? "Half of it." : p === 25 ? "A quarter of it." : "Divide by 10."); } },
    { id:"square", skill:"times", level:3, make(){
      const n = ri(2, 15);
      return numQ("Square the number.", n + "² =", n * n, n + "² = " + n + " × " + n + " = " + (n * n) + ".", "Squaring means multiplying a number by itself.", n + " × " + n, [{ when:{ v:n * 2 }, msg:n + "² means " + n + " × " + n + ", not " + n + " × 2." }]); } },
    { id:"neg-add", skill:"addsub", level:3, make(){
      const a = ri(-15, 10), b = ri(-12, 12), s = a + b, bt = b < 0 ? "(" + b + ")" : String(b);
      return numQ("Work it out in your head.", a + " + " + bt + " =", s, a + " + " + bt + " = " + s + ". Adding a negative number moves left on the number line.", "Adding a negative is the same as subtracting.", "Picture a number line."); } }
  ];

  const T = {
    id:"quick-math", code:"Q", year:0, subject:"Games", name:"Quick math", hidden:true,
    blurb:"Short questions you can do in your head: ordering, comparing, adding, times tables, rounding.",
    levels:[{ id:"1", name:"Easy", desc:"Whole numbers." }, { id:"2", name:"Medium", desc:"Decimals and bigger numbers." }, { id:"3", name:"Hard", desc:"Negatives, percentages and squares." }, { id:"M", name:"Mixed", desc:"A mix, easiest first." }],
    defaultLevel:"1", lengths:[5,10], defaultLen:5, defaultSecs:20,
    skills:{ order:{ name:"Ordering numbers", short:"Ordering", lesson:0 }, compare:{ name:"Comparing", short:"Comparing", lesson:0 },
             addsub:{ name:"Adding and subtracting", short:"+ and −", lesson:0 }, times:{ name:"Times tables and dividing", short:"Times tables", lesson:0 },
             round:{ name:"Rounding and percentages", short:"Rounding", lesson:0 } },
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl); }
  };
  registerTopic(T);
})();
