/* ===== Topic: Year 10 Science, Stoichiometry ===== */
(() => {
  const C = Kit.chem;
  const NA = 6.02e23;
  const NAH = "6.02 × 10<sup>23</sup> mol<sup>−1</sup>";
  /* Fixed table of atomic masses (g/mol, 2 decimals). Every calculation in this topic uses these values. */
  const AM = { H:1.01, C:12.01, N:14.01, O:16.00, Na:22.99, Mg:24.31, Al:26.98, S:32.07, Cl:35.45, K:39.10, Ca:40.08, Fe:55.85, Cu:63.55, Zn:65.38 };
  const ELN = { H:"hydrogen", C:"carbon", N:"nitrogen", O:"oxygen", Na:"sodium", Mg:"magnesium", Al:"aluminum", S:"sulfur", Cl:"chlorine", K:"potassium",
    Ca:"calcium", Fe:"iron", Cu:"copper", Zn:"zinc", Br:"bromine", I:"iodine", Pb:"lead", P:"phosphorus", Mn:"manganese" };
  const NAMES = { H2O:"water", CO2:"carbon dioxide", NH3:"ammonia", CH4:"methane", NaCl:"sodium chloride", MgO:"magnesium oxide", CaCO3:"calcium carbonate",
    NaOH:"sodium hydroxide", KCl:"potassium chloride", HCl:"hydrogen chloride", H2SO4:"sulfuric acid", "Ca(OH)2":"calcium hydroxide", "Al2(SO4)3":"aluminum sulfate",
    "Mg(OH)2":"magnesium hydroxide", CuSO4:"copper(II) sulfate", Fe2O3:"iron(III) oxide", Al2O3:"aluminum oxide", C6H12O6:"glucose", C2H5OH:"ethanol",
    NaHCO3:"sodium hydrogen carbonate", Na2CO3:"sodium carbonate", KNO3:"potassium nitrate", ZnCl2:"zinc chloride", CaCl2:"calcium chloride", MgCl2:"magnesium chloride",
    "Cu(NO3)2":"copper(II) nitrate", "Fe(OH)3":"iron(III) hydroxide", "(NH4)2SO4":"ammonium sulfate", K2SO4:"potassium sulfate", ZnSO4:"zinc sulfate", C3H8:"propane",
    HNO3:"nitric acid", FeCl3:"iron(III) chloride", CuO:"copper(II) oxide", ZnO:"zinc oxide", SO2:"sulfur dioxide", N2:"nitrogen", O2:"oxygen", H2:"hydrogen",
    Cl2:"chlorine", Na2SO4:"sodium sulfate", KOH:"potassium hydroxide", CaO:"calcium oxide", AlCl3:"aluminum chloride", "Al(OH)3":"aluminum hydroxide",
    MgSO4:"magnesium sulfate", "Ca(NO3)2":"calcium nitrate", "Mg(NO3)2":"magnesium nitrate", "Fe2(SO4)3":"iron(III) sulfate", "Zn(NO3)2":"zinc nitrate",
    "Cu(OH)2":"copper(II) hydroxide", "(NH4)2CO3":"ammonium carbonate", MgCO3:"magnesium carbonate", ZnCO3:"zinc carbonate",
    C2H6:"ethane", C4H10:"butane", C5H12:"pentane", C8H18:"octane", C6H6:"benzene", C2H2:"ethyne", H3PO4:"phosphoric acid", KMnO4:"potassium permanganate",
    FeS2:"iron pyrite", Fe3O4:"magnetite (iron oxide)", CO:"carbon monoxide", H2O2:"hydrogen peroxide", KClO3:"potassium chlorate", KBr:"potassium bromide", KI:"potassium iodide",
    "Pb(NO3)2":"lead(II) nitrate", "Ca3(PO4)2":"calcium phosphate", "Mg3N2":"magnesium nitride", CaSO4:"calcium sulfate",
    Na:"sodium", Mg:"magnesium", Al:"aluminum", Fe:"iron", Cu:"copper", Zn:"zinc", C:"carbon", Ca:"calcium", K:"potassium", S:"sulfur" };
  const nm = f => NAMES[f] ? NAMES[f] + " (" + C(f) + ")" : C(f);

  /* ---------- small helpers ---------- */
  const g2 = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const minus = n => n < 0 ? "−" + (-n) : String(n);
  /* Round to n significant figures, half up, after removing binary noise (so 0.4125 → 0.413, as a student would round). */
  function roundSF(x, n){
    if (!x || !isFinite(x)) return x;
    const e = Math.floor(Math.log10(Math.abs(x))) - n + 1;
    const k = Math.round(Number((Math.abs(x) / Math.pow(10, e)).toPrecision(12)));
    const r = e < 0 ? k / Math.pow(10, -e) : k * Math.pow(10, e);
    return Math.sign(x) * Number(r.toPrecision(n));
  }
  const sf = (x, n) => Kit.sigStr(roundSF(x, n), n);
  const r2 = x => Math.round(x * 100) / 100;
  function sciOf(x, n){ const [c, e] = roundSF(x, n).toExponential(n - 1).split("e"); return { cs:c, co:Number(c), e:Number(e) }; }
  const sciS = (cs, e) => cs + " × 10<sup>" + minus(e) + "</sup>";
  const sciH = (x, n) => { const s = sciOf(x, n); return sciS(s.cs, s.e); };
  const tolSF = (A, n, k) => k * Math.pow(10, Math.floor(Math.log10(Math.abs(A)) + 1e-12) - (n - 1)) / Math.abs(A);
  /* 3 s.f. answer: one-step questions accept only the correctly rounded value (±0.6 of the last digit);
     multi-step questions also accept ±1 in the last digit, for students who rounded an intermediate value. */
  function ans3(x, multi){ const s = sf(x, 3), A = Number(s); return { s, A, tol:tolSF(A, 3, multi ? 1.1 : 0.6) }; }
  const plain = x => String(+x.toPrecision(10));
  const long = x => (Math.abs(x) >= 1e6 || Math.abs(x) < 1e-4) ? sciH(x, 5) : sf(x, 5);
  const steps = arr => '<ol class="steps">' + arr.map(a => '<li><div><div class="m">' + a[0] + "</div>" + (a[1] ? '<p class="why">' + a[1] + "</p>" : "") + "</div></li>").join("") + "</ol>";
  const trap = s => "<p><b>Trap:</b> " + s + "</p>";
  const disp = h => '<div class="display">' + h + "</div>";
  const tbl = (head, rows) => '<div class="tblwrap"><table class="tbl"><thead><tr>' + head.map(h => "<th>" + h + "</th>").join("") + "</tr></thead><tbody>" +
    rows.map(r => "<tr>" + r.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";
  const randIn = (lo, hi) => lo + seededRandom() * (hi - lo);
  function mk(ans, tol, list){
    const out = [];
    for (const [v, msg] of list) {
      if (!isFinite(v) || v === 0 || !msg) continue;
      if (Math.abs(v - ans) <= Math.max(tol, 0.006) * Math.abs(ans)) continue;
      if (out.some(m => Math.abs(m.when.v - v) <= 0.006 * Math.abs(v))) continue;
      out.push({ when:{ v }, msg });
    }
    return out;
  }
  /* digit strings: first digit nonzero; lastNonzero forces a nonzero final digit */
  function digits(len, lastNonzero){
    let s = String(ri(1, 9));
    for (let i = 1; i < len; i++) s += String(ri(0, 9));
    if (lastNonzero && len > 1 && s[len - 1] === "0") s = s.slice(0, -1) + ri(1, 9);
    return s;
  }
  /* D = digit string, value = D[0].D[1..] × 10^e, written as an ordinary decimal */
  function placePoint(D, e){
    if (e < 0) return "0." + "0".repeat(-e - 1) + D;
    if (D.length <= e + 1) return D + "0".repeat(e + 1 - D.length);
    return D.slice(0, e + 1) + "." + D.slice(e + 1);
  }
  const grp = s => { const [i, f] = s.split("."); const g = i.length > 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, "&#8239;") : i; return f != null ? g + "." + f : g; };

  /* ---------- formulas and molar mass ---------- */
  function parseFormula(f){
    let i = 0;
    const num = () => { const m = /^\d+/.exec(f.slice(i)); if (!m) return 1; i += m[0].length; return Number(m[0]); };
    function group(){
      const out = {};
      while (i < f.length) {
        const ch = f[i];
        if (ch === "(") {
          i++; const g = group();
          if (f[i] !== ")") throw new Error("Unclosed bracket in " + f);
          i++; const n = num();
          for (const k in g) out[k] = (out[k] || 0) + g[k] * n;
        } else if (ch === ")") return out;
        else {
          const m = /^[A-Z][a-z]?/.exec(f.slice(i));
          if (!m) throw new Error("Bad formula " + f);
          i += m[0].length; const n = num();
          out[m[0]] = (out[m[0]] || 0) + n;
        }
      }
      return out;
    }
    const r = group();
    if (i !== f.length) throw new Error("Bad formula " + f);
    return r;
  }
  const inTable = f => Object.keys(parseFormula(f)).every(el => AM[el] != null);
  function molarMass(f){ const p = parseFormula(f); let s = 0; for (const el in p) s += AM[el] * p[el]; return r2(s); }
  const mmLine = f => { const p = parseFormula(f), ks = Object.keys(p); if (ks.length === 1 && p[ks[0]] === 1) return "M(" + C(f) + ") = " + molarMass(f).toFixed(2) + " g/mol (from the table)"; return "M(" + C(f) + ") = " + ks.map(el => (p[el] > 1 ? p[el] + " × " : "") + AM[el].toFixed(2)).join(" + ") + " = " + molarMass(f).toFixed(2) + " g/mol"; };
  function amList(fs){
    const els = [];
    fs.forEach(f => Object.keys(parseFormula(f)).forEach(el => { if (!els.includes(el)) els.push(el); }));
    return '<p class="small muted">Atomic masses (g/mol): ' + els.map(el => el + " " + AM[el].toFixed(2)).join(", ") + ".</p>";
  }

  /* ---------- equations ---------- */
  const mkEq = (r, p, c, lv, d) => ({ r, p, c, lv, d, all:r.concat(p), key:"eq:" + r.join("+") + ">" + p.join("+") });
  function sideCount(fs, cs){ const t = {}; fs.forEach((f, i) => { const p = parseFormula(f); for (const el in p) t[el] = (t[el] || 0) + p[el] * cs[i]; }); return t; }
  const counts = (eq, cf) => ({ L:sideCount(eq.r, cf.slice(0, eq.r.length)), R:sideCount(eq.p, cf.slice(eq.r.length)) });
  function elementsOf(eq){ const out = []; eq.all.forEach(f => Object.keys(parseFormula(f)).forEach(el => { if (!out.includes(el)) out.push(el); })); return out; }
  const isBalanced = (eq, cf) => { const k = counts(eq, cf); return elementsOf(eq).every(el => (k.L[el] || 0) === (k.R[el] || 0)); };
  const eqOk = eq => eq.c.length === eq.all.length && eq.c.every(x => Number.isInteger(x) && x > 0) && eq.c.reduce(g2) === 1 && isBalanced(eq, eq.c);
  function eqHtml(eq, cf, showOne){
    const term = (f, i) => (cf && (cf[i] !== 1 || showOne) ? cf[i] + " " : "") + C(f);
    return eq.r.map((f, i) => term(f, i)).join(" + ") + " → " + eq.p.map((f, i) => term(f, eq.r.length + i)).join(" + ");
  }

  const RAW_EQ = [
    /* Level 1 */
    mkEq(["H2","Cl2"],["HCl"],[1,1,2],1,"synthesis"),
    mkEq(["H2","O2"],["H2O"],[2,1,2],1,"synthesis"),
    mkEq(["N2","H2"],["NH3"],[1,3,2],1,"synthesis"),
    mkEq(["Mg","O2"],["MgO"],[2,1,2],1,"synthesis"),
    mkEq(["Na","Cl2"],["NaCl"],[2,1,2],1,"synthesis"),
    mkEq(["Cu","O2"],["CuO"],[2,1,2],1,"synthesis"),
    mkEq(["Zn","O2"],["ZnO"],[2,1,2],1,"synthesis"),
    mkEq(["Ca","O2"],["CaO"],[2,1,2],1,"synthesis"),
    mkEq(["H2O2"],["H2O","O2"],[2,2,1],1,"decomposition"),
    mkEq(["NaCl"],["Na","Cl2"],[2,2,1],1,"decomposition"),
    mkEq(["CH4","O2"],["CO2","H2O"],[1,2,1,2],1,"combustion"),
    mkEq(["Zn","HCl"],["ZnCl2","H2"],[1,2,1,1],1,"single replacement"),
    mkEq(["Mg","HCl"],["MgCl2","H2"],[1,2,1,1],1,"single replacement"),
    mkEq(["Cl2","KBr"],["KCl","Br2"],[1,2,2,1],1,"single replacement"),
    mkEq(["K","H2O"],["KOH","H2"],[2,2,2,1],1,"single replacement"),
    mkEq(["Na","H2O"],["NaOH","H2"],[2,2,2,1],1,"single replacement"),
    mkEq(["HCl","NaOH"],["NaCl","H2O"],[1,1,1,1],1,"neutralization"),
    mkEq(["Zn","CuSO4"],["ZnSO4","Cu"],[1,1,1,1],1,"single replacement"),
    /* Level 2 */
    mkEq(["Fe","O2"],["Fe2O3"],[4,3,2],2,"synthesis"),
    mkEq(["Al","O2"],["Al2O3"],[4,3,2],2,"synthesis"),
    mkEq(["Al","HCl"],["AlCl3","H2"],[2,6,2,3],2,"single replacement"),
    mkEq(["KClO3"],["KCl","O2"],[2,2,3],2,"decomposition"),
    mkEq(["C3H8","O2"],["CO2","H2O"],[1,5,3,4],2,"combustion"),
    mkEq(["H2SO4","NaOH"],["Na2SO4","H2O"],[1,2,1,2],2,"neutralization"),
    mkEq(["H2SO4","KOH"],["K2SO4","H2O"],[1,2,1,2],2,"neutralization"),
    mkEq(["Ca(OH)2","HCl"],["CaCl2","H2O"],[1,2,1,2],2,"neutralization"),
    mkEq(["CaCl2","Na2CO3"],["CaCO3","NaCl"],[1,1,1,2],2,"double replacement"),
    mkEq(["NaOH","CuSO4"],["Cu(OH)2","Na2SO4"],[2,1,1,1],2,"double replacement"),
    mkEq(["Pb(NO3)2","KI"],["PbI2","KNO3"],[1,2,1,2],2,"double replacement"),
    mkEq(["NaHCO3"],["Na2CO3","H2O","CO2"],[2,1,1,1],2,"decomposition"),
    mkEq(["CaCO3","HCl"],["CaCl2","H2O","CO2"],[1,2,1,1,1],2,"acid and carbonate"),
    mkEq(["Na2CO3","HCl"],["NaCl","H2O","CO2"],[1,2,2,1,1],2,"acid and carbonate"),
    mkEq(["Fe","Cl2"],["FeCl3"],[2,3,2],2,"synthesis"),
    mkEq(["Mg","N2"],["Mg3N2"],[3,1,1],2,"synthesis"),
    mkEq(["Fe2O3","Al"],["Al2O3","Fe"],[1,2,1,2],2,"single replacement"),
    mkEq(["Mg(OH)2","HCl"],["MgCl2","H2O"],[1,2,1,2],2,"neutralization"),
    mkEq(["HNO3","Ca(OH)2"],["Ca(NO3)2","H2O"],[2,1,1,2],2,"neutralization"),
    mkEq(["C2H5OH","O2"],["CO2","H2O"],[1,3,2,3],2,"combustion"),
    mkEq(["Fe(OH)3"],["Fe2O3","H2O"],[2,1,3],2,"decomposition"),
    mkEq(["NaOH","FeCl3"],["Fe(OH)3","NaCl"],[3,1,1,3],2,"double replacement"),
    mkEq(["Al","Cl2"],["AlCl3"],[2,3,2],2,"synthesis"),
    mkEq(["C6H12O6","O2"],["CO2","H2O"],[1,6,6,6],2,"respiration"),
    mkEq(["Fe3O4","H2"],["Fe","H2O"],[1,4,3,4],2,""),
    /* Level 3 */
    mkEq(["C2H6","O2"],["CO2","H2O"],[2,7,4,6],3,"combustion"),
    mkEq(["C4H10","O2"],["CO2","H2O"],[2,13,8,10],3,"combustion"),
    mkEq(["C8H18","O2"],["CO2","H2O"],[2,25,16,18],3,"combustion"),
    mkEq(["C5H12","O2"],["CO2","H2O"],[1,8,5,6],3,"combustion"),
    mkEq(["C6H6","O2"],["CO2","H2O"],[2,15,12,6],3,"combustion"),
    mkEq(["C2H2","O2"],["CO2","H2O"],[2,5,4,2],3,"combustion"),
    mkEq(["Ca(OH)2","H3PO4"],["Ca3(PO4)2","H2O"],[3,2,1,6],3,"neutralization"),
    mkEq(["Al2(SO4)3","Ca(OH)2"],["Al(OH)3","CaSO4"],[1,3,2,3],3,"double replacement"),
    mkEq(["Al(OH)3","H2SO4"],["Al2(SO4)3","H2O"],[2,3,1,6],3,"neutralization"),
    mkEq(["Al2O3","HCl"],["AlCl3","H2O"],[1,6,2,3],3,"neutralization"),
    mkEq(["Fe2(SO4)3","KOH"],["K2SO4","Fe(OH)3"],[1,6,3,2],3,"double replacement"),
    mkEq(["Fe2O3","CO"],["Fe","CO2"],[1,3,2,3],3,""),
    mkEq(["Fe3O4","CO"],["Fe","CO2"],[1,4,3,4],3,""),
    mkEq(["NH3","O2"],["NO","H2O"],[4,5,4,6],3,""),
    mkEq(["Al","H2SO4"],["Al2(SO4)3","H2"],[2,3,1,3],3,"single replacement"),
    mkEq(["Al","CuSO4"],["Al2(SO4)3","Cu"],[2,3,1,3],3,"single replacement"),
    mkEq(["Ca3(PO4)2","H2SO4"],["CaSO4","H3PO4"],[1,3,3,2],3,"double replacement"),
    mkEq(["Cu","HNO3"],["Cu(NO3)2","NO","H2O"],[3,8,3,2,4],3,""),
    mkEq(["KMnO4"],["K2MnO4","MnO2","O2"],[2,1,1,1],3,"decomposition"),
    mkEq(["(NH4)2SO4","NaOH"],["Na2SO4","NH3","H2O"],[1,2,1,2,2],3,""),
    mkEq(["FeS2","O2"],["Fe2O3","SO2"],[4,11,2,8],3,"")
  ];
  /* Load-time check: keep only equations whose atoms balance with lowest whole-number coefficients. */
  const EQNS = RAW_EQ.filter(eq => {
    let ok = false;
    try { ok = eqOk(eq); } catch (e) { ok = false; }
    if (!ok && typeof console !== "undefined") console.warn("stoichiometry: dropped unbalanced equation " + eq.key);
    return ok;
  });
  const eqKey = e => e.key;
  const EQ_LV = lv => EQNS.filter(e => e.lv === lv);
  const RATIO_EQ = EQNS.filter(eq => eq.all.every(inTable));
  const LIM_EQ = RATIO_EQ.filter(eq => eq.r.length === 2 && eq.p.length <= 2);

  /* reactions used in conservation-of-mass data questions */
  const GAS_OUT = [
    { eq:mkEq(["CaCO3","HCl"],["CaCl2","H2O","CO2"],[1,2,1,1,1]), s:0, g:4, what:"marble chips (calcium carbonate)" },
    { eq:mkEq(["Zn","HCl"],["ZnCl2","H2"],[1,2,1,1]), s:0, g:3, what:"zinc granules" },
    { eq:mkEq(["Mg","HCl"],["MgCl2","H2"],[1,2,1,1]), s:0, g:3, what:"magnesium ribbon" },
    { eq:mkEq(["Na2CO3","HCl"],["NaCl","H2O","CO2"],[1,2,2,1,1]), s:0, g:4, what:"sodium carbonate powder" },
    { eq:mkEq(["NaHCO3","HCl"],["NaCl","H2O","CO2"],[1,1,1,1,1]), s:0, g:4, what:"sodium hydrogen carbonate (baking soda)" }
  ];
  const BURN = [
    { eq:mkEq(["Mg","O2"],["MgO"],[2,1,2]), what:"magnesium ribbon" },
    { eq:mkEq(["Cu","O2"],["CuO"],[2,1,2]), what:"copper powder" },
    { eq:mkEq(["Zn","O2"],["ZnO"],[2,1,2]), what:"zinc powder" }
  ];
  const CARB = [
    { eq:mkEq(["CaCO3"],["CaO","CO2"],[1,1,1]) },
    { eq:mkEq(["MgCO3"],["MgO","CO2"],[1,1,1]) },
    { eq:mkEq(["ZnCO3"],["ZnO","CO2"],[1,1,1]) }
  ];

  /* ---------- scientific-notation answer boxes ---------- */
  function sciDiag(rec, cs, e, tol, list, nsf){
    const co = rec.vals.co, n = rec.vals.n, tco = Number(cs);
    if (!Number.isInteger(n)) return "The power of 10 must be a whole number.";
    const v = co * Math.pow(10, n), t = tco * Math.pow(10, e);
    const close = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
    if (close(v, t, Math.max(tol, 1e-9)) && (Math.abs(co) < 1 || Math.abs(co) >= 10))
      return "Your value is right, but it is not in scientific notation: the number in front must be at least 1 and less than 10, so write " + sciS(cs, e) + ".";
    for (const m of list) if (close(v, m.val, 0.006)) return m.msg;
    if (Math.abs(co) < 1 || Math.abs(co) >= 10) return "In scientific notation the number in front must be at least 1 and less than 10.";
    if (close(co, tco, Math.max(tol, 1e-9))) return n === -e && e !== 0
      ? "The number in front is right, but the sign of the power is wrong. Numbers smaller than 1 have a negative power of 10; numbers of 10 or more have a positive power."
      : "The number in front is right, but the power of 10 is not. Count again how many places the decimal point moves.";
    if (n === e) return "The power of 10 is right. Check the number in front" + (nsf ? ", and round it to " + nsf + " significant figures only at the very end." : ".");
    return "";
  }
  function sciField(o){
    const unit = o.unit ? " " + o.unit : "", tol = o.tol != null ? o.tol : 1e-9;
    const q = Kit.fields({
      promptHtml:o.promptHtml, exprHtml:o.exprHtml,
      parts:[{ c:"co", wide:true, label:"Number in front" }, { txt:" × 10" }, { sup:"n" }].concat(unit ? [{ txt:unit }] : []),
      answer:{ co:Number(o.cs), n:o.e }, tol, answerHtml:sciS(o.cs, o.e) + unit,
      workHtml:o.workHtml, key:o.key, hint:o.hint, meta:o.meta,
      missingMsg:"Fill in both boxes: the number in front and the power of 10 (for example 3.01 and 23).",
      diagnose:rec => sciDiag(rec, o.cs, o.e, tol, o.mistakes || [], o.nsf)
    });
    q.formatAnswer = rec => esc(rec.raw.co) + " × 10<sup>" + esc(rec.raw.n) + "</sup>" + unit;
    return q;
  }

  const POOL = [];
  const add = (id, skill, level, make) => POOL.push({ id, skill, level, make });

  /* =====================================================================
     1. Significant figures and measurement
     ===================================================================== */
  function countSF(s){ const hasPt = s.includes("."); let d = s.replace(".", "").replace(/^0+/, ""); if (!hasPt) d = d.replace(/0+$/, ""); return d.length; }
  function sfSpan(s){
    let f = 0; while (f < s.length && (s[f] === "0" || s[f] === ".")) f++;
    let l = s.length - 1; if (!s.includes(".")) while (l > f && s[l] === "0") l--;
    return [f, l];
  }
  const markSF = s => { const [f, l] = sfSpan(s); return s.slice(0, f) + "<mark>" + s.slice(f, l + 1) + "</mark>" + s.slice(l + 1); };
  function markN(s, n){
    let f = 0; while (f < s.length && (s[f] === "0" || s[f] === ".")) f++;
    let l = f, k = 0;
    for (let i = f; i < s.length; i++) { if (s[i] !== ".") { k++; l = i; } if (k === n) break; }
    return s.slice(0, f) + "<mark>" + s.slice(f, l + 1) + "</mark>" + s.slice(l + 1);
  }
  function sfGen(kind){
    const t = kind || pick(["lead","lead","captive","captive","trail","trail","sci"]);
    if (t === "sci") {
      const m = ri(1, 4), D = digits(m, false), cs = D[0] + (m > 1 ? "." + D.slice(1) : "");
      let e = ri(2, 9) * (ri(0, 1) ? 1 : -1);
      return { kind:"sci", s:cs, e, n:m, html:sciS(cs, e) };
    }
    let s, n;
    if (t === "lead") {
      const z = ri(0, 3), m = ri(1, 4); let core = digits(m, false);
      if (m > 1 && ri(0, 2) === 0) core = core.slice(0, -1) + "0";
      s = "0." + "0".repeat(z) + core; n = m;
    } else if (t === "captive") {
      const D = String(ri(1, 9)) + "0".repeat(ri(1, 2)) + digits(ri(1, 2), true), p = ri(1, D.length);
      s = p === D.length ? D : D.slice(0, p) + "." + D.slice(p); n = D.length;
    } else {
      const D = digits(ri(1, 3), true) + "0".repeat(ri(1, 2)), p = ri(1, D.length - 1);
      s = D.slice(0, p) + "." + D.slice(p); n = D.length;
    }
    return { kind:t, s, n, html:s };
  }
  const sfMarked = g => g.kind === "sci" ? sciS("<mark>" + g.s + "</mark>", g.e) : markSF(g.s);
  function sfReasons(g){
    const out = [];
    if (g.kind === "sci") {
      out.push("In scientific notation only the number in front counts. The power of 10 just moves the decimal point.");
      if (g.s.includes(".") && /0$/.test(g.s)) out.push("The final zero after the decimal point counts: it shows how precise the measurement was.");
      if (/[1-9]0+[1-9]/.test(g.s.replace(".", ""))) out.push("Zeros between nonzero digits count.");
      return out.join(" ");
    }
    const s = g.s, [f, l] = sfSpan(s), inner = s.slice(f, l + 1).replace(".", "");
    if (f > 0) out.push("The leading zeros (" + s.slice(0, f) + ") do not count: they only show where the decimal point is.");
    if (/[1-9]0+[1-9]/.test(inner)) out.push("Zeros between nonzero digits always count.");
    if (s.includes(".") && /0$/.test(s)) out.push("The zero(s) at the end count, because the number has a decimal point: they show how precise the measurement was.");
    out.push("Nonzero digits always count.");
    return out.join(" ");
  }

  add("sf-count", "sigfigs", 1, () => {
    const g = sfGen(), n = g.n;
    const allDigits = g.kind === "sci" ? g.s.replace(".", "").length + String(Math.abs(g.e)).length : g.s.replace(".", "").length;
    const nonzero = (g.s.match(/[1-9]/g) || []).length;
    return { type:"num", promptHtml:"How many significant figures does this measurement have?", exprHtml:disp(g.html),
      answer:n, tol:1e-9, answerHtml:n + " (" + sfMarked(g) + ")", meta:{ kind:"sfcount", s:g.s, sci:g.kind === "sci", n },
      workHtml:"<p>Significant digits highlighted: " + sfMarked(g) + ".</p><p>" + sfReasons(g) + "</p><p>Total: <b>" + n + " significant figure" + (n > 1 ? "s" : "") + "</b>.</p>" +
        trap("Leading zeros never count, but zeros at the end of a number with a decimal point always do. 0.050 has 2 s.f., not 1 and not 4."),
      key:"Start counting at the first nonzero digit; a final zero counts only if there is a decimal point.",
      hint:"Find the first nonzero digit. Then decide about each zero: before it, between digits, or at the end?",
      mistakes:mk(n, 1e-9, [
        [allDigits, g.kind === "sci" ? "You counted the digits of the power of 10 too. Only the number in front counts." : "You counted the leading zeros. Zeros before the first nonzero digit only place the decimal point."],
        [nonzero, "You skipped zeros that do count: zeros between nonzero digits, and zeros at the end of a number with a decimal point, are significant."]]) };
  });

  function roundDigits(D, e, n){
    let R = String(Number(D.slice(0, n)) + (D[n] >= "5" ? 1 : 0)), e2 = e;
    if (R.length > n) { e2 = e + 1; R = R.slice(0, n); }
    return { R, e2, str:placePoint(R, e2) };
  }
  add("sf-round", "sigfigs", 1, () => {
    const D = digits(6, true), e = ri(-4, 4), n = pick([1, 2, 2, 3, 3, 3, 4]);
    const s = placePoint(D, e), r = roundDigits(D, e, n), ans = Number(r.str), next = D[n];
    const trunc = Number(placePoint(D.slice(0, n), e)), more = Number(roundDigits(D, e, n + 1).str), dp = Number(Number(s).toFixed(n));
    return { type:"num", promptHtml:"Round this number to <b>" + n + " significant figure" + (n > 1 ? "s" : "") + "</b>. Type an ordinary number (not scientific notation).",
      exprHtml:disp(s), answer:ans, tol:1e-9, answerHtml:r.str, meta:{ kind:"round", s, n, ans },
      workHtml:steps([
        ["Mark the first " + n + " significant figure" + (n > 1 ? "s" : "") + ": " + markN(s, n), "Start counting at the first nonzero digit. Leading zeros do not count."],
        ["The next digit is <b>" + next + "</b>.", Number(next) >= 5 ? "It is 5 or more, so the last kept digit goes up by 1." : "It is less than 5, so the kept digits stay as they are."],
        ["Answer: <b>" + r.str + "</b>", r.e2 >= n ? "The zeros after the kept digits are placeholders. They keep the number the right size, but they are not significant." :
          (/\.\d*0$/.test(r.str) ? "Keep the final zero: it is one of the " + n + " significant figures." : "Do not add extra digits after the last significant figure.")]]) +
        trap("Rounding to " + n + " decimal places is a different instruction. Significant figures start at the first nonzero digit, wherever the decimal point is."),
      key:"Count from the first nonzero digit, look at the next digit, round, then fill with placeholder zeros if needed.",
      hint:"Where is the first nonzero digit? Count " + n + " digits from there and look at the digit after them.",
      mistakes:mk(ans, 1e-9, [[trunc, "You cut the number off without rounding. Look at the next digit: 5 or more rounds up."],
        [dp, "You rounded to " + n + " decimal places, not " + n + " significant figures."], [more, "That has one significant figure too many."]]) };
  });

  const INSTR = [
    { name:"a digital balance that reads to 0.01 g", u:"g", dp:2, step:0.01, lo:5, hi:150, dig:true },
    { name:"a digital balance that reads to 0.001 g", u:"g", dp:3, step:0.001, lo:0.5, hi:20, dig:true },
    { name:"a digital balance that reads to 0.1 g", u:"g", dp:1, step:0.1, lo:20, hi:500, dig:true },
    { name:"a digital thermometer that reads to 0.1 °C", u:"°C", dp:1, step:0.1, lo:15, hi:80, dig:true },
    { name:"a digital stopwatch that reads to 0.01 s", u:"s", dp:2, step:0.01, lo:5, hi:90, dig:true },
    { name:"a burette marked every 0.1 mL (uncertainty ±0.05 mL)", u:"mL", dp:2, step:0.05, lo:1, hi:49, unc:"±0.05 mL" },
    { name:"a 100 mL measuring cylinder marked every 1 mL (uncertainty ±0.5 mL)", u:"mL", dp:1, step:0.5, lo:10, hi:99, unc:"±0.5 mL" },
    { name:"a 10 mL measuring cylinder marked every 0.2 mL (uncertainty ±0.1 mL)", u:"mL", dp:1, step:0.1, lo:1, hi:9.8, unc:"±0.1 mL" },
    { name:"a liquid thermometer marked every 1 °C (uncertainty ±0.5 °C)", u:"°C", dp:1, step:0.5, lo:15, hi:90, unc:"±0.5 °C" },
    { name:"a ruler marked every 1 mm (uncertainty ±0.5 mm)", u:"mm", dp:1, step:0.5, lo:10, hi:290, unc:"±0.5 mm" }
  ];
  add("sf-instrument", "sigfigs", 1, ctx => {
    const ins = Kit.unique(ctx, INSTR, x => "ins:" + x.name);
    let k = ri(Math.ceil(ins.lo / ins.step), Math.floor(ins.hi / ins.step));
    if (ins.dig && ri(0, 2) === 0) k = Math.max(10, k - (k % 10));
    const v = k * ins.step, str = v.toFixed(ins.dp);
    const rule = ins.dig ? "A digital instrument: record exactly the digits on the display, including a final zero. That is " + ins.dp + " decimal place" + (ins.dp > 1 ? "s" : "") + " here."
      : "An analog scale: the uncertainty is " + ins.unc + " (half the smallest division), so the reading is recorded to the same decimal place as the uncertainty: " + ins.dp + " decimal place" + (ins.dp > 1 ? "s" : "") + ".";
    const opts = [{ html:str + " " + ins.u, correct:true }], seen = new Set([str]);
    for (const d of shuffle([ins.dp - 1, ins.dp + 1, ins.dp - 2, ins.dp + 2])) {
      if (d < 0 || opts.length >= 4) continue;
      const s = Number(str).toFixed(d); if (seen.has(s)) continue; seen.add(s);
      opts.push({ html:s + " " + ins.u, fb:d < ins.dp ? "Too few decimal places: this throws away precision the instrument gives you. " + rule : "Too many decimal places: the instrument cannot show that digit, so it would be made up. " + rule });
    }
    return Kit.mc({ promptHtml:"Mia takes a reading with " + ins.name + ". Every option shows the same reading written to a different precision. Which one is recorded correctly?",
      options:opts, workHtml:"<p>" + rule + "</p><p>So the reading is <b>" + str + " " + ins.u + "</b>.</p>" +
        trap("Dropping a final zero (writing 12.3 g for a 12.30 g display) loses information. Adding digits the instrument cannot measure invents information."),
      key:"Record every digit the instrument can give you, and no more.",
      hint:ins.dig ? "How many decimal places does the display show?" : "The uncertainty tells you the last decimal place you can read." });
  });

  add("sf-which", "sigfigs", 2, () => {
    const g = sfGen(), N = g.n, opts = [{ html:g.html, correct:true }], seen = new Set([g.html]);
    for (let t = 0; t < 200 && opts.length < 4; t++) {
      const h = sfGen();
      if (h.n === N || seen.has(h.html)) continue;
      const digitsShown = h.s.replace(".", "").length;
      if (t < 120 && digitsShown !== N && h.kind !== "sci") continue; /* prefer numbers that look like N digits */
      seen.add(h.html);
      opts.push({ html:h.html, fb:"This has " + h.n + " significant figure" + (h.n > 1 ? "s" : "") + ": " + sfMarked(h) + ". " + sfReasons(h) });
    }
    return Kit.mc({ promptHtml:"Which measurement has exactly <b>" + N + "</b> significant figure" + (N > 1 ? "s" : "") + "?", options:opts,
      workHtml:"<p>" + sfMarked(g) + " has " + N + " significant figure" + (N > 1 ? "s" : "") + ". " + sfReasons(g) + "</p>" +
        trap("Counting all the digits you can see. Leading zeros never count; zeros at the end count only when there is a decimal point."),
      key:"Leading zeros never count; captive zeros always count; trailing zeros count after a decimal point.",
      hint:"Highlight the significant digits in each number, starting at the first nonzero digit." });
  });

  function meas(lo, hi, n){
    for (let t = 0; t < 500; t++) {
      const s = sf(randIn(lo, hi), n);
      if (!s.includes(".") && /0$/.test(s)) continue;
      if (countSF(s) !== n || s.includes("e")) continue;
      return s;
    }
    return sf(lo + 0.123, n);
  }
  const MULDIV = [
    { a:[5, 95], b:[2, 50], unit:"g/cm³", op:"div", text:(a, b) => "A block of plastic has a mass of " + a + " g and a volume of " + b + " cm³. What is its density?", law:"density = mass ÷ volume" },
    { a:[2, 30], b:[1, 20], unit:"cm²", op:"mul", text:(a, b) => "A rectangle of metal foil measures " + a + " cm by " + b + " cm. What is its area?", law:"area = length × width" },
    { a:[10, 99], b:[2, 60], unit:"m/s", op:"div", text:(a, b) => "A trolley travels " + a + " m in " + b + " s. What is its average speed?", law:"speed = distance ÷ time" },
    { a:[1, 9.9], b:[0.1, 0.99], unit:"mol/L", op:"div", text:(a, b) => "A solution contains " + a + " mol of salt in " + b + " L. What is its concentration?", law:"concentration = moles ÷ volume" }
  ];
  add("sf-muldiv", "sigfigs", 2, () => {
    for (;;) {
      const c = pick(MULDIV), na = ri(2, 4); let nb = ri(2, 4); if (nb === na) nb = na === 4 ? 2 : na + 1;
      const as = meas(c.a[0], c.a[1], na), bs = meas(c.b[0], c.b[1], nb);
      const val = c.op === "div" ? Number(as) / Number(bs) : Number(as) * Number(bs), n = Math.min(na, nb);
      const res = sf(val, n);
      if (res.includes("e") || (!res.includes(".") && /0$/.test(res)) || val >= 1000) continue;
      const ans = Number(res), dpA = (as.split(".")[1] || "").length, dpB = (bs.split(".")[1] || "").length;
      return { type:"num", promptHtml:c.text(as, bs) + " Give the answer to the correct number of significant figures.", answer:ans, tol:1e-9, suf:c.unit,
        answerHtml:res + " " + c.unit, meta:{ kind:"muldiv", a:as, b:bs, op:c.op, ans },
        workHtml:steps([
          [c.law + ": " + as + (c.op === "div" ? " ÷ " : " × ") + bs + " = " + plain(val) + " " + c.unit, "This is the raw calculator value. It is not the answer yet."],
          [markSF(as) + " has " + na + " s.f. and " + markSF(bs) + " has " + nb + " s.f.", "Multiplying or dividing: the answer gets the fewest significant figures in the data."],
          ["Round to " + n + " s.f.: <b>" + res + " " + c.unit + "</b>", ""]]) +
          trap("Copying every calculator digit, or using the decimal-places rule. Decimal places are only for adding and subtracting."),
        key:"Multiply or divide: round to the fewest significant figures in the data.",
        hint:"Count the significant figures in each measurement. Which is smaller?",
        mistakes:mk(ans, 1e-9, [[Number(sf(val, 6)), "That is the unrounded calculator value. Round to " + n + " significant figures."],
          [Number(sf(val, Math.max(na, nb))), "You used the larger number of significant figures. The least precise measurement limits the answer."],
          [Number(val.toFixed(Math.min(dpA, dpB))), "You used the decimal-places rule. For multiplying and dividing, count significant figures instead."]]) };
    }
  });

  const ADDSUB = [
    { op:"+", unit:"g", gen:() => [[30, 120], [0.5, 20]], text:(a, b) => "An empty beaker has a mass of " + a + " g. Ana adds " + b + " g of copper(II) sulfate, weighed on a different balance. What is the total mass?" },
    { op:"-", unit:"g", gen:() => [[60, 160], [20, 55]], text:(a, b) => "A flask containing water has a mass of " + a + " g. The empty flask has a mass of " + b + " g (measured on a different balance). What is the mass of the water?" },
    { op:"+", unit:"mL", gen:() => [[10, 80], [1, 40]], text:(a, b) => "Leo pours " + a + " mL of water from one measuring instrument and " + b + " mL from another into the same beaker. What is the total volume?" },
    { op:"-", unit:"°C", gen:() => [[40, 95], [12, 30]], text:(a, b) => "A solution warms from " + b + " °C to " + a + " °C. The two readings come from different thermometers. What is the temperature rise?" }
  ];
  add("sf-addsub", "sigfigs", 2, () => {
    for (;;) {
      const c = pick(ADDSUB), [ra, rb] = c.gen(), da = ri(0, 3); let db = ri(0, 3); if (db === da) continue;
      const A = ri(Math.ceil(ra[0] * Math.pow(10, da)), Math.floor(ra[1] * Math.pow(10, da))), B = ri(Math.ceil(rb[0] * Math.pow(10, db)), Math.floor(rb[1] * Math.pow(10, db)));
      const M = Math.max(da, db), m = Math.min(da, db), Ai = A * Math.pow(10, M - da), Bi = B * Math.pow(10, M - db);
      const S = c.op === "+" ? Ai + Bi : Ai - Bi; if (S <= 0) continue;
      const F = Math.pow(10, M - m); if ((S % F) * 2 === F) continue;
      const as = (A / Math.pow(10, da)).toFixed(da), bs = (B / Math.pow(10, db)).toFixed(db);
      if (countSF(as) < 2 || countSF(bs) < 2) continue;
      const res = (Math.round(S / F) / Math.pow(10, m)).toFixed(m), raw = (S / Math.pow(10, M)).toFixed(M), ans = Number(res);
      if (ans === 0) continue;
      const sfRule = Number(sf(Number(raw), Math.min(countSF(as), countSF(bs))));
      const place = m === 0 ? "the ones place (no decimal places)" : m + " decimal place" + (m > 1 ? "s" : "");
      return { type:"num", promptHtml:c.text(as, bs) + " Give the answer to the correct precision.", answer:ans, tol:1e-9, suf:c.unit, answerHtml:res + " " + c.unit,
        meta:{ kind:"addsub", a:as, b:bs, op:c.op, ans },
        workHtml:steps([
          [as + (c.op === "+" ? " + " : " − ") + bs + " = " + raw + " " + c.unit, "Line up the decimal points and calculate."],
          [as + " has " + da + " decimal place" + (da === 1 ? "" : "s") + "; " + bs + " has " + db + ".", "Adding or subtracting: the answer can only be as precise as the least precise measurement, so round to " + place + "."],
          ["Answer: <b>" + res + " " + c.unit + "</b>", ""]]) +
          trap("Using the significant-figures rule here. For adding and subtracting it is the fewest decimal places that matters."),
        key:"Add or subtract: round to the fewest decimal places in the data.",
        hint:"Which measurement has the fewest digits after the decimal point?",
        mistakes:mk(ans, 1e-9, [[Number(raw), "That is the unrounded result. The least precise value has " + m + " decimal place" + (m === 1 ? "" : "s") + "."],
          [sfRule, "You used the significant-figures rule. For adding and subtracting, round to the fewest decimal places."]]) };
    }
  });

  const LIQ = [{ n:"water", d:1.00 }, { n:"ethanol", d:0.79 }, { n:"vegetable oil", d:0.92 }, { n:"glycerol", d:1.26 }, { n:"seawater", d:1.03 }];
  add("sf-density", "sigfigs", 3, () => {
    for (;;) {
      const liq = pick(LIQ), B = ri(4000, 11000), L = ri(400, 3000), T = B + L;
      const V = Math.round(L / 100 / liq.d * 10) / 10; if (V < 1) continue;
      const Vs = V.toFixed(1), Ls = (L / 100).toFixed(2), Ts = (T / 100).toFixed(2), Bs = (B / 100).toFixed(2);
      const mS = countSF(Ls), vS = countSF(Vs), n = Math.min(mS, vS), d = (L / 100) / V, res = sf(d, n), ans = Number(res);
      return { type:"num", promptHtml:"Sam finds the density of " + liq.n + ". Empty beaker: <b>" + Bs + " g</b>. Beaker with " + liq.n + ": <b>" + Ts + " g</b>. Volume of " + liq.n +
        " (measuring cylinder): <b>" + Vs + " mL</b>. Calculate the density in g/mL to the correct number of significant figures.", answer:ans, tol:1e-9, suf:"g/mL", answerHtml:res + " g/mL",
        meta:{ kind:"density", T:Ts, B:Bs, V:Vs, ans },
        workHtml:steps([
          ["Mass of " + liq.n + " = " + Ts + " − " + Bs + " = " + Ls + " g", "Subtracting: keep 2 decimal places. " + markSF(Ls) + " has " + mS + " s.f."],
          ["Density = " + Ls + " g ÷ " + Vs + " mL = " + sf(d, 6) + " g/mL", "Dividing: use the fewest significant figures. " + markSF(Vs) + " has " + vS + " s.f."],
          ["Round to " + n + " s.f.: <b>" + res + " g/mL</b>", ""]]) +
          trap("The balance readings have 4 or 5 s.f., but after subtracting, the mass of liquid may have fewer. Count s.f. in the value you actually divide."),
        key:"Apply the rules step by step: decimal places when subtracting, significant figures when dividing.",
        hint:"First find the mass of liquid. How many s.f. does that mass have?",
        mistakes:mk(ans, 1e-9, [[Number(sf(d, 6)), "That is the unrounded calculator value."],
          [Number(sf(d, Math.min(countSF(Ts), vS))), "You counted significant figures in the balance reading, not in the mass of liquid (" + Ls + " g, " + mS + " s.f.)."],
          [Number(sf(d, n + 1)), "One significant figure too many."], [Number(sf(V / (L / 100), n)), "You divided volume by mass. Density is mass ÷ volume."]]) };
    }
  });

  const METALS_D = [{ n:"aluminum", d:2.70 }, { n:"zinc", d:7.14 }, { n:"iron", d:7.87 }, { n:"copper", d:8.96 }];
  add("sf-mixed", "sigfigs", 3, () => {
    for (;;) {
      const met = pick(METALS_D), A = ri(500, 4000), Bm = ri(50, 400); /* A in 0.01 g, B in 0.1 g */
      const rawSum = A / 100 + Bm / 10, V = Math.round(rawSum / met.d * 10) / 10; if (V < 1) continue;
      const as = (A / 100).toFixed(2), bs = (Bm / 10).toFixed(1), Vs = V.toFixed(1);
      const S = A + Bm * 10; if (S % 10 === 5) continue;
      const sumS = (Math.round(S / 10) / 10).toFixed(1), nSum = countSF(sumS), nV = countSF(Vs), n = Math.min(nSum, nV);
      const good = sf(rawSum / V, n); if (good !== sf(Number(sumS) / V, n) || good.includes("e")) continue;
      const opts = [{ html:good + " g/mL", correct:true }], seen = new Set([good]);
      const addO = (s, fb) => { if (!seen.has(s) && opts.length < 4) { seen.add(s); opts.push({ html:s + " g/mL", fb }); } };
      addO(sf(rawSum / V, 6), "That is the unrounded calculator value: it claims far more precision than the measurements have.");
      const n0 = Math.min(countSF(as), countSF(bs), nV);
      if (n0 !== n) addO(sf(rawSum / V, n0), "You applied the s.f. rule to the addition. Adding uses decimal places: " + as + " + " + bs + " = " + sumS + " g, which has " + nSum + " s.f.");
      addO(sf(rawSum / V, n + 1), "One significant figure too many: the least precise value in the division has " + n + " s.f.");
      if (n > 1) addO(sf(rawSum / V, n - 1), "One significant figure too few: you can keep " + n + " s.f.");
      if (opts.length < 3) continue;
      return Kit.mc({ promptHtml:"Two pieces of " + met.n + " have masses of " + as + " g and " + bs + " g. Together they raise the water level in a measuring cylinder by " + Vs +
        " mL. Which value for the density is reported correctly?", options:opts, meta:{ kind:"mixed", a:as, b:bs, V:Vs, good },
        workHtml:steps([
          ["Total mass = " + as + " + " + bs + " = " + rawSum.toFixed(2) + " → " + sumS + " g", "Adding: round to the fewest decimal places (1 d.p.). So the total mass has " + nSum + " s.f."],
          ["Density = " + sumS + " g ÷ " + Vs + " mL = " + sf(rawSum / V, 6) + " g/mL", "Dividing: fewest significant figures (" + nSum + " and " + nV + ")."],
          ["Answer: <b>" + good + " g/mL</b>", "This is close to the real density of " + met.n + ", " + met.d.toFixed(2) + " g/cm³."]]) +
          trap("Each rule belongs to its own step. Track the precision through the addition before you apply the division rule."),
        key:"Add or subtract → decimal places. Multiply or divide → significant figures. One step at a time.",
        hint:"First add the masses and decide how precise the total is. Then divide." });
    }
  });

  /* =====================================================================
     2. Scientific notation and unit conversions
     ===================================================================== */
  add("sci-write", "units", 1, () => {
    const m = ri(2, 4), D = digits(m, true), e = ri(0, 1) ? ri(-7, -2) : ri(3, 9);
    const s = placePoint(D, e), cs = D[0] + "." + D.slice(1);
    const dir = e < 0 ? "right" : "left";
    return sciField({ promptHtml:"Write this number in scientific notation. Keep all " + m + " significant figures.", exprHtml:disp(grp(s)), cs, e, meta:{ kind:"sciwrite", s, cs, e },
      workHtml:steps([
        ["Put the decimal point after the first nonzero digit: <b>" + cs + "</b>", "The number in front must be at least 1 and less than 10."],
        ["The point moves " + Math.abs(e) + " place" + (Math.abs(e) > 1 ? "s" : "") + " to the " + dir + ".", e < 0 ? "The number is smaller than 1, so the power of 10 is negative." : "The number is 10 or more, so the power of 10 is positive."],
        ["Answer: <b>" + sciS(cs, e) + "</b>", ""]]) + trap("Getting the sign backwards. Small numbers (less than 1) always have a negative power of 10."),
      key:"a × 10ⁿ with 1 ≤ a < 10; count how far the point moves, and small numbers get negative powers.",
      hint:"Where must the decimal point go so that the number in front is between 1 and 10?",
      mistakes:[] });
  });

  add("sci-to-dec", "units", 1, () => {
    const D = digits(ri(2, 3), true), e = ri(0, 1) ? ri(-5, -1) : ri(2, 6), cs = D[0] + "." + D.slice(1), s = placePoint(D, e), ans = Number(s);
    return { type:"num", promptHtml:"Write this as an ordinary number.", exprHtml:disp(sciS(cs, e)), answer:ans, tol:1e-9, answerHtml:grp(s), meta:{ kind:"scidec", cs, e, ans },
      workHtml:steps([["The power is " + minus(e) + ", so move the decimal point " + Math.abs(e) + " place" + (Math.abs(e) > 1 ? "s" : "") + " to the " + (e < 0 ? "left" : "right") + ".",
        e < 0 ? "A negative power makes the number smaller than 1." : "A positive power makes the number bigger."], ["Answer: <b>" + grp(s) + "</b>", "Fill empty places with zeros."]]) +
        trap("Moving the point the wrong way. Check: a negative power must give a number less than 1."),
      key:"Positive power: point moves right (bigger). Negative power: point moves left (smaller).",
      hint:"Which way does the decimal point move for a " + (e < 0 ? "negative" : "positive") + " power?",
      mistakes:mk(ans, 1e-9, [[Number(placePoint(D, -e)), "You moved the decimal point the wrong way. Check the sign of the power."],
        [Number(placePoint(D, e + 1)), "The point moved one place too far."], [Number(placePoint(D, e - 1)), "The point moved one place too few."]]) };
  });

  const UNITS1 = [
    ["mg","g",1e-3,"1 g = 1000 mg"], ["g","mg",1e3,"1 g = 1000 mg"], ["g","kg",1e-3,"1 kg = 1000 g"], ["kg","g",1e3,"1 kg = 1000 g"],
    ["mL","L",1e-3,"1 L = 1000 mL"], ["L","mL",1e3,"1 L = 1000 mL"], ["cm³","mL",1,"1 cm³ = 1 mL"], ["mL","cm³",1,"1 cm³ = 1 mL"],
    ["dm³","L",1,"1 dm³ = 1 L"], ["L","dm³",1,"1 dm³ = 1 L"], ["cm³","dm³",1e-3,"1 dm³ = 1000 cm³"], ["dm³","cm³",1e3,"1 dm³ = 1000 cm³"]
  ];
  const conv = (v, f) => Number((v * f).toPrecision(12));
  function unitQ(u, v, level){
    const [from, to, f, fact] = u, ans = conv(v, f);
    const how = f === 1 ? "The units are the same size, so the number does not change." : f > 1 ? "Big unit → small unit: you need more of the small units, so multiply by " + (f === 1e3 ? "1000" : grp(String(f))) + "."
      : "Small unit → big unit: you need fewer of the big units, so divide by " + (f === 1e-3 ? "1000" : grp(String(Math.round(1 / f)))) + ".";
    return { type:"num", promptHtml:"Convert <b>" + v + " " + from + "</b> to " + to + ".", answer:ans, tol:1e-9, suf:to, answerHtml:String(ans) + " " + to, meta:{ kind:"unit", v, f, ans },
      workHtml:steps([[fact, ""], [how, ""], [v + " " + from + " = <b>" + ans + " " + to + "</b>", ""]]) +
        trap("Multiplying when you should divide. Sense check: a smaller unit needs a bigger number."),
      key:"Small unit → big unit: divide. Big unit → small unit: multiply.",
      hint:"Is " + to + " a bigger or smaller unit than " + from + "?",
      mistakes:mk(ans, 1e-9, f === 1 ? [[v * 1000, "1 " + from + " is exactly 1 " + to + ", so the number stays the same."], [v / 1000, "1 " + from + " is exactly 1 " + to + ", so the number stays the same."]]
        : [[conv(v, 1 / f), "You went the wrong way: " + (f > 1 ? "multiply" : "divide") + " here."]]) };
  }
  add("unit-simple", "units", 1, () => {
    const u = pick(UNITS1), v = u[2] > 1 ? Number(sf(ri(12, 950) / 100, 3)) : u[2] < 1 ? pick([ri(15, 950), ri(1000, 9500), ri(20, 900) * 5]) : ri(5, 750);
    return unitQ(u, v);
  });

  const UNITS2 = [
    ["cm³","m³",1e-6,"1 m³ = 100 cm × 100 cm × 100 cm = 1 000 000 cm³"], ["m³","cm³",1e6,"1 m³ = 100 cm × 100 cm × 100 cm = 1 000 000 cm³"],
    ["dm³","m³",1e-3,"1 m³ = 10 dm × 10 dm × 10 dm = 1000 dm³"], ["m³","dm³",1e3,"1 m³ = 10 dm × 10 dm × 10 dm = 1000 dm³"],
    ["L","m³",1e-3,"1 m³ = 1000 dm³ = 1000 L"], ["m³","L",1e3,"1 m³ = 1000 dm³ = 1000 L"],
    ["mL","m³",1e-6,"1 mL = 1 cm³, and 1 m³ = 1 000 000 cm³"], ["mL","dm³",1e-3,"1 mL = 1 cm³, and 1 dm³ = 1000 cm³"]
  ];
  add("unit-volume", "units", 2, () => {
    const u = pick(UNITS2), [from, to, f, fact] = u;
    const v = f > 1 ? Number(sf(ri(2, 350) / 100, 3)) : f === 1e-6 ? ri(20, 5000) : ri(5, 950);
    const ans = conv(v, f), wrong = f === 1e6 || f === 1e-6 ? conv(v, f > 1 ? 1e3 : 1e-3) : conv(v, f > 1 ? 1e6 : 1e-6);
    return { type:"num", promptHtml:"Convert <b>" + v + " " + from + "</b> to " + to + ". Type an ordinary decimal number.", answer:ans, tol:1e-9, suf:to, answerHtml:grp(String(ans)) + " " + to,
      meta:{ kind:"unit", v, f, ans },
      workHtml:steps([[fact, "A volume unit is a length unit cubed, so the factor is cubed too."],
        [(f > 1 ? "Big unit → small unit: multiply by " : "Small unit → big unit: divide by ") + grp(String(f > 1 ? f : Math.round(1 / f))), ""],
        [v + " " + from + " = <b>" + grp(String(ans)) + " " + to + "</b>", ""]]) +
        trap("Using 100 or 1000 for cm³ → m³. Because 1 m = 100 cm, 1 m³ = 100³ cm³ = 1 000 000 cm³."),
      key:"Cube the length factor: 1 m³ = 1000 dm³ = 1 000 000 cm³.",
      hint:"How many cm are in 1 m? Now cube that number.",
      mistakes:mk(ans, 1e-9, [[conv(v, 1 / f), "You went the wrong way: " + (f > 1 ? "multiply" : "divide") + " here."],
        [wrong, "Wrong factor. 1 m³ = 1000 dm³ = 1000 L, and 1 m³ = 1 000 000 cm³ (or mL)."]]) };
  });

  const UFACTS = [
    { q:"Which volume is the same as 1 dm³?", a:"1 L", w:[["1 mL","1 mL = 1 cm³, which is 1000 times smaller."], ["1000 L","1 m³ is 1000 L. 1 dm³ is just 1 L."], ["100 cm³","1 dm³ = 10 cm × 10 cm × 10 cm = 1000 cm³."]] },
    { q:"Which volume is the same as 1 cm³?", a:"1 mL", w:[["1 L","1 L = 1000 cm³."], ["0.1 mL","1 cm³ and 1 mL are exactly equal."], ["10 mL","1 cm³ and 1 mL are exactly equal."]] },
    { q:"How many cm³ are in 1 m³?", a:"1 000 000 cm³", w:[["100 cm³","100 is the factor for length (1 m = 100 cm), not for volume."], ["1000 cm³","1000 cm³ = 1 dm³. A cubic meter is 1000 times bigger."], ["10 000 cm³","Cube the length factor: 100 × 100 × 100 = 1 000 000."]] },
    { q:"How many liters are in 1 m³?", a:"1000 L", w:[["1 L","1 L = 1 dm³, which is much smaller than 1 m³."], ["100 L","1 m³ = 10 × 10 × 10 dm³ = 1000 dm³ = 1000 L."], ["1 000 000 L","That is the number of mL (or cm³) in 1 m³."]] },
    { q:"How many milligrams are in 1 kg?", a:"1 000 000 mg", w:[["1000 mg","1000 mg is 1 g. A kilogram is 1000 g."], ["100 000 mg","1 kg = 1000 g and 1 g = 1000 mg, so 1000 × 1000."], ["0.001 mg","Going to a smaller unit makes the number bigger, not smaller."]] },
    { q:"Which mass is the same as 0.25 kg?", a:"250 g", w:[["25 g","1 kg = 1000 g, so multiply by 1000, not 100."], ["2500 g","That would be 2.5 kg."], ["0.00025 g","Going from kg to g, the number must get bigger."]] },
    { q:"Which volume is the same as 250 cm³?", a:"0.250 dm³", w:[["250 dm³","1 dm³ = 1000 cm³, so divide by 1000."], ["2.50 dm³","Divide by 1000, not 100."], ["0.0250 dm³","Divide by 1000, not 10 000."]] },
    { q:"A beaker holds 0.5 L. How many mL is that?", a:"500 mL", w:[["50 mL","1 L = 1000 mL, so multiply by 1000."], ["5000 mL","That would be 5 L."], ["0.0005 mL","Going from L to mL, the number must get bigger."]] },
    { q:"Which is the largest volume?", a:"2 dm³", w:[["1500 mL","1500 mL = 1.5 L = 1.5 dm³, less than 2 dm³."], ["1800 cm³","1800 cm³ = 1.8 dm³, less than 2 dm³."], ["0.0015 m³","0.0015 m³ = 1.5 dm³, less than 2 dm³."]] },
    { q:"Which is the smallest mass?", a:"450 mg", w:[["0.5 g","0.5 g = 500 mg, more than 450 mg."], ["0.0006 kg","0.0006 kg = 0.6 g = 600 mg."], ["0.048 kg","0.048 kg = 48 g, much more."]] },
    { q:"What does the prefix milli- (as in mL, mg) mean?", a:"one thousandth (÷ 1000)", w:[["one thousand times (× 1000)","That is kilo-."], ["one hundredth (÷ 100)","That is centi-."], ["one millionth","That is micro-."]] },
    { q:"How many dm³ are in 1 m³?", a:"1000 dm³", w:[["10 dm³","10 is the factor for length (1 m = 10 dm). Cube it for volume."], ["100 dm³","Cube the length factor: 10 × 10 × 10 = 1000."], ["1 000 000 dm³","That is the number of cm³ in 1 m³."]] }
  ];
  add("unit-facts", "units", 2, ctx => {
    const f = Kit.unique(ctx, UFACTS, x => "uf:" + x.q);
    return Kit.mc({ promptHtml:f.q, options:[{ html:f.a, correct:true }].concat(f.w.map(w => ({ html:w[0], fb:w[1] }))),
      workHtml:"<p>The answer is <b>" + f.a + "</b>.</p><p>Key facts: 1 kg = 1000 g; 1 g = 1000 mg; 1 L = 1 dm³ = 1000 mL; 1 mL = 1 cm³; 1 m³ = 1000 dm³ = 1 000 000 cm³.</p>" +
        trap("For volumes, the length factor is cubed: 1 dm = 10 cm, so 1 dm³ = 10³ cm³ = 1000 cm³."),
      key:"1 dm³ = 1 L = 1000 cm³ = 1000 mL, and 1 m³ = 1000 L.",
      hint:"Write each value in the same unit before you compare." });
  });

  add("sci-calc", "units", 2, () => {
    for (;;) {
      const a = ri(11, 99) / 10, b = ri(11, 99) / 10, p = ri(-8, 9), q = ri(-8, 9), op = pick(["×", "÷"]);
      const pe = op === "×" ? p + q : p - q; if (Math.abs(pe) > 12) continue;
      let c = op === "×" ? a * b : a / b, e = pe;
      if (c >= 10) { c /= 10; e += 1; } else if (c < 1) { c *= 10; e -= 1; }
      if (Math.abs(c * 10 - Math.floor(c * 10) - 0.5) < 1e-7) continue; /* avoid an exact rounding tie */
      const s = sciOf(c * Math.pow(10, e), 2); if (Math.abs(s.e) > 13 || s.e === 0) continue;
      const as = a.toFixed(1), bs = b.toFixed(1), raw = op === "×" ? a * b : a / b;
      const tol = tolSF(s.co, 2, 0.6);
      return sciField({ promptHtml:"Calculate, and give the answer in scientific notation to 2 significant figures.",
        exprHtml:disp("(" + sciS(as, p) + ") " + op + " (" + sciS(bs, q) + ")"), cs:s.cs, e:s.e, tol, nsf:2, meta:{ kind:"scicalc", a, b, p, q, op, cs:s.cs, e:s.e },
        workHtml:steps([
          ["Numbers in front: " + as + " " + op + " " + bs + " = " + sf(raw, 5), "Work with the front numbers and the powers separately."],
          ["Powers of 10: 10<sup>" + minus(p) + "</sup> " + op + " 10<sup>" + minus(q) + "</sup> = 10<sup>" + minus(pe) + "</sup>", op === "×" ? "Multiplying: add the powers." : "Dividing: subtract the powers."],
          [sf(raw, 5) + " × 10<sup>" + minus(pe) + "</sup> = <b>" + sciS(s.cs, s.e) + "</b>", raw >= 10 ? "The front number was 10 or more, so move the point one place left and add 1 to the power." :
            raw < 1 ? "The front number was less than 1, so move the point one place right and subtract 1 from the power." : "Round the front number to 2 s.f."]]) +
          trap("Leaving the answer as something like 14 × 10<sup>5</sup>. The number in front must be between 1 and 10."),
        key:"Multiply: add powers. Divide: subtract powers. Then fix the front number so it is between 1 and 10.",
        hint:"Deal with the front numbers first, then the powers of 10.",
        mistakes:[{ val:sciOf((op === "×" ? a / b : a * b) * Math.pow(10, op === "×" ? p - q : p + q), 2).co * Math.pow(10, sciOf((op === "×" ? a / b : a * b) * Math.pow(10, op === "×" ? p - q : p + q), 2).e),
          msg:op === "×" ? "Multiplying means adding the powers (and multiplying the front numbers)." : "Dividing means subtracting the powers (and dividing the front numbers)." }] });
    }
  });

  const DENS = [["ethanol", "0.789"], ["water", "1.00"], ["aluminum", "2.70"], ["iron", "7.87"], ["copper", "8.96"], ["ice", "0.917"], ["glycerol", "1.26"], ["lead", "11.3"], ["gold", "19.3"]];
  add("unit-multi", "units", 3, () => {
    const t = ri(0, 3);
    if (t === 0) {
      const mg = ri(5, 95) * 10, V = pick([50.0, 100, 125, 200, 250, 500]), x = mg / V, a = ans3(x, false);
      return { type:"num", promptHtml:"A solution contains <b>" + mg + " mg</b> of salt dissolved in <b>" + V + " mL</b> of solution. What is its concentration in g/L? Give 3 significant figures.",
        answer:a.A, tol:a.tol, suf:"g/L", answerHtml:a.s + " g/L", meta:{ kind:"mgml", mg, V, ans:a.A },
        workHtml:steps([[mg + " mg ÷ 1000 = " + (mg / 1000) + " g", "1 g = 1000 mg"], [V + " mL ÷ 1000 = " + (V / 1000) + " L", "1 L = 1000 mL"],
          ["Concentration = " + (mg / 1000) + " g ÷ " + (V / 1000) + " L = <b>" + a.s + " g/L</b>", "Notice: mg/mL and g/L are the same size, because both units were divided by 1000."]]) +
          trap("Converting only one of the two units. Then the answer is 1000 times too big or too small."),
        key:"Convert every quantity into the units the answer asks for before dividing.",
        hint:"Change mg into g and mL into L first.",
        mistakes:mk(a.A, a.tol, [[x * 1000, "You converted mL to L but left the mass in mg."], [x / 1000, "You converted mg to g but left the volume in mL."]]) };
    }
    if (t === 1) {
      const [name, ds] = pick(DENS), d = Number(ds), a = ans3(d * 1000, false);
      return { type:"num", promptHtml:"The density of " + name + " is <b>" + ds + " g/cm³</b>. What is its density in kg/m³? Give 3 significant figures.", answer:a.A, tol:a.tol, suf:"kg/m³",
        answerHtml:a.s + " kg/m³", meta:{ kind:"dens", d, ans:a.A },
        workHtml:steps([["1 cm³ of " + name + " has a mass of " + ds + " g.", ""], ["1 m³ = 1 000 000 cm³, so 1 m³ has a mass of " + ds + " × 1 000 000 = " + grp(String(conv(d, 1e6))) + " g", "Convert the volume first."],
          [grp(String(conv(d, 1e6))) + " g ÷ 1000 = <b>" + a.s + " kg</b>, so the density is " + a.s + " kg/m³", "Overall: × 1 000 000 ÷ 1000 = × 1000."]]) +
          trap("Forgetting that the volume factor is cubed. Water: 1.00 g/cm³ = 1000 kg/m³, a useful check."),
        key:"g/cm³ × 1000 = kg/m³ (water: 1.00 g/cm³ = 1000 kg/m³).",
        hint:"What is the mass of 1 m³ in grams? Then change grams to kilograms.",
        mistakes:mk(a.A, a.tol, [[d * 1e6, "You converted the volume but not grams to kilograms."], [d / 1000, "Wrong direction: kg/m³ values are bigger (water is 1000 kg/m³)."], [d * 10, "Wrong factor. Water: 1.00 g/cm³ = 1000 kg/m³."]]) };
    }
    if (t === 2) {
      const [name, ds] = pick(DENS.slice(0, 2).concat([DENS[5], DENS[6]])), d = Number(ds), V = ri(15, 250) * 10, x = V * d / 1000, a = ans3(x, false);
      return { type:"num", promptHtml:"What is the mass in kilograms of <b>" + V + " mL</b> of " + name + " (density " + ds + " g/cm³)? Give 3 significant figures.", answer:a.A, tol:a.tol, suf:"kg",
        answerHtml:a.s + " kg", meta:{ kind:"massv", V, d, ans:a.A },
        workHtml:steps([[V + " mL = " + V + " cm³", "1 mL = 1 cm³"], ["mass = density × volume = " + ds + " g/cm³ × " + V + " cm³ = " + plain(V * d) + " g", ""], [plain(V * d) + " g ÷ 1000 = <b>" + a.s + " kg</b>", "1 kg = 1000 g"]]) +
          trap("Stopping at grams, or dividing by the density instead of multiplying."),
        key:"mass = density × volume, with the volume in the same unit as the density (1 mL = 1 cm³).",
        hint:"Find the mass in grams first, then convert to kg.",
        mistakes:mk(a.A, a.tol, [[V * d, "That is the mass in grams. Divide by 1000 for kilograms."], [V / d / 1000, "Mass = density × volume, not volume ÷ density."]]) };
    }
    const n = Number(sf(randIn(0.0100, 0.500), 3)), V = pick([25.0, 50.0, 100, 125, 200, 250, 500]), x = n / (V / 1000), a = ans3(x, false);
    return { type:"num", promptHtml:"<b>" + sf(n, 3) + " mol</b> of sodium chloride is dissolved to make <b>" + V + " cm³</b> of solution. What is the concentration in mol/dm³? Give 3 significant figures.",
      answer:a.A, tol:a.tol, suf:"mol/dm³", answerHtml:a.s + " mol/dm³", meta:{ kind:"conc", n, V, ans:a.A },
      workHtml:steps([[V + " cm³ ÷ 1000 = " + (V / 1000) + " dm³", "1 dm³ = 1000 cm³"], ["concentration = moles ÷ volume = " + sf(n, 3) + " mol ÷ " + (V / 1000) + " dm³ = <b>" + a.s + " mol/dm³</b>", ""]]) +
        trap("Dividing by the volume in cm³. Concentration in mol/dm³ needs the volume in dm³."),
      key:"Change cm³ to dm³ (÷ 1000) before dividing moles by volume.",
      hint:"How many dm³ is " + V + " cm³?",
      mistakes:mk(a.A, a.tol, [[n / V, "You divided by the volume in cm³. Convert to dm³ first."], [n * V / 1000, "Concentration = moles ÷ volume, not moles × volume."]]) };
  });

  const USCI = [["mg","kg",-6], ["kg","mg",6], ["cm³","m³",-6], ["m³","cm³",6], ["mL","m³",-6], ["g","mg",3], ["mg","g",-3], ["L","m³",-3], ["m³","mL",6]];
  add("unit-sci", "units", 3, () => {
    for (;;) {
      const [from, to, k] = pick(USCI), D = digits(2, true), p = k > 0 ? ri(-3, 2) : ri(-1, 4), s = placePoint(D, p), cs = D[0] + "." + D[1], e = p + k;
      if (e === 0) continue;
      const vol = from.includes("³") || to.includes("³") || from === "mL" || from === "L" || to === "mL";
      return sciField({ promptHtml:"Convert <b>" + grp(s) + " " + from + "</b> to " + to + ". Give the answer in scientific notation.", cs, e, unit:to, meta:{ kind:"unitsci", s, k, cs, e },
        workHtml:steps([[grp(s) + " " + from + " = " + sciS(cs, p) + " " + from, "Write the value in scientific notation first."],
          ["1 " + (k > 0 ? from : to) + " = 10<sup>" + Math.abs(k) + "</sup> " + (k > 0 ? to : from), vol && Math.abs(k) === 6 ? "1 m = 100 cm, so 1 m³ = 100³ cm³ = 10<sup>6</sup> cm³." : ""],
          [(k > 0 ? "Big unit → small unit: multiply by 10<sup>" + k + "</sup>, so add " + k + " to the power." : "Small unit → big unit: divide by 10<sup>" + (-k) + "</sup>, so subtract " + (-k) + " from the power."), ""],
          ["Answer: <b>" + sciS(cs, e) + " " + to + "</b>", ""]]) + trap("Going the wrong way. Converting to a bigger unit always gives a smaller number."),
        key:"Converting units in scientific notation only changes the power of 10.",
        hint:"Write the number in scientific notation, then decide whether the power goes up or down.",
        mistakes:[{ val:Number(cs) * Math.pow(10, p - k), msg:"You went the wrong way: converting to a " + (k > 0 ? "smaller unit makes the number bigger" : "bigger unit makes the number smaller") + "." }].concat(
          Math.abs(k) === 6 ? [{ val:Number(cs) * Math.pow(10, p + k / 2), msg:"You used 1000 instead of 1 000 000. Volume factors are cubed: 1 m³ = 10<sup>6</sup> cm³; and 1 kg = 10<sup>6</sup> mg." }] : []) });
    }
  });

  /* =====================================================================
     3. Particles, moles and Avogadro's number
     ===================================================================== */
  const PART = [["H2O","molecules"],["CO2","molecules"],["NH3","molecules"],["CH4","molecules"],["O2","molecules"],["N2","molecules"],["H2","molecules"],["Cl2","molecules"],
    ["C6H12O6","molecules"],["C2H5OH","molecules"],["SO2","molecules"],["C3H8","molecules"],["Na","atoms"],["Mg","atoms"],["Al","atoms"],["Fe","atoms"],["Cu","atoms"],["Zn","atoms"],["C","atoms"],["Ca","atoms"]];
  const MM_SIMPLE = ["H2O","CO2","NH3","CH4","NaCl","MgO","CaCO3","NaOH","KCl","H2SO4","CuSO4","Fe2O3","Al2O3","C6H12O6","NaHCO3","Na2CO3","KNO3","ZnCl2","CaCl2",
    "MgCl2","C3H8","HNO3","FeCl3","SO2","Na2SO4","C2H5OH","AlCl3","K2SO4","ZnSO4","MgSO4","KOH","CuO","ZnO"];
  const MM_BR = ["Ca(OH)2","Al2(SO4)3","Mg(OH)2","Cu(NO3)2","Fe(OH)3","(NH4)2SO4","Al(OH)3","Ca(NO3)2","Mg(NO3)2","Fe2(SO4)3","Zn(NO3)2","Cu(OH)2","(NH4)2CO3"];
  const onceEach = f => { const p = parseFormula(f); return r2(Object.keys(p).reduce((s, el) => s + AM[el], 0)); };
  const noBracket = f => molarMass(f.replace(/\(([^)]*)\)\d+/g, "$1"));
  function mmQ(f, br){
    const M = molarMass(f), p = parseFormula(f);
    const rows = Object.keys(p).map(el => [el + " (" + ELN[el] + ")", p[el], AM[el].toFixed(2), r2(p[el] * AM[el]).toFixed(2)]);
    return { type:"num", promptHtml:"Calculate the molar mass of " + nm(f) + ". Give your answer to 2 decimal places." + amList([f]), answer:M, tol:0.0151 / M, suf:"g/mol",
      answerHtml:M.toFixed(2) + " g/mol", meta:{ kind:"mm", f, ans:M },
      workHtml:(br ? "<p>The small number after a bracket multiplies <b>everything inside</b> the bracket.</p>" : "") +
        tbl(["Element", "Atoms", "Atomic mass", "Subtotal (g/mol)"], rows) + "<p>" + mmLine(f) + "</p>" +
        trap("Forgetting a subscript, or applying a bracket's number to only the last atom inside it."),
      key:"Molar mass = sum of (number of atoms × atomic mass) for every element in the formula.",
      hint:"List each element, count its atoms (watch the brackets), multiply by its atomic mass, add.",
      mistakes:mk(M, 0.0151 / M, [[onceEach(f), "You counted each element only once. Multiply each atomic mass by its subscript."]].concat(br ? [[noBracket(f), "You ignored the number outside the brackets. It multiplies every atom inside."]] : [])) };
  }
  add("mol-mm", "moles", 1, ctx => mmQ(Kit.unique(ctx, MM_SIMPLE, x => "mm:" + x), false));
  add("mol-mm-br", "moles", 2, ctx => mmQ(Kit.unique(ctx, MM_BR, x => "mm:" + x), true));

  add("mol-m2n", "moles", 1, ctx => {
    const f = Kit.unique(ctx, MM_SIMPLE.concat(["Fe","Cu","Mg","Al","Zn"]), x => "mn:" + x), M = molarMass(f), m = Number(sf(randIn(1, 99.9), 3)), x = m / M, a = ans3(x, false);
    return { type:"num", promptHtml:"How many moles are in <b>" + sf(m, 3) + " g</b> of " + nm(f) + "? Its molar mass is " + M.toFixed(2) + " g/mol. Give 3 significant figures.",
      answer:a.A, tol:a.tol, suf:"mol", answerHtml:a.s + " mol", meta:{ kind:"m2n", f, m, ans:a.A },
      workHtml:steps([["n = m ÷ M", "moles = mass ÷ molar mass"], ["n = " + sf(m, 3) + " g ÷ " + M.toFixed(2) + " g/mol = " + long(x) + " mol", "The grams cancel, leaving mol."], ["Answer: <b>" + a.s + " mol</b> (3 s.f.)", ""]]) +
        trap("Multiplying mass by molar mass. Check the units: g × g/mol does not give mol."),
      key:"n = m ÷ M (grams ÷ grams per mole = moles).",
      hint:"Which operation turns grams into moles? Check with the units.",
      mistakes:mk(a.A, a.tol, [[m * M, "You multiplied. To get moles, divide the mass by the molar mass."], [M / m, "Upside down: n = mass ÷ molar mass."]]) };
  });

  add("mol-n2m", "moles", 1, ctx => {
    const f = Kit.unique(ctx, MM_SIMPLE.concat(["Fe","Cu","Mg","Al","Zn"]), x => "nm:" + x), M = molarMass(f), n = Number(sf(randIn(0.1, 5), 3)), x = n * M, a = ans3(x, false);
    return { type:"num", promptHtml:"What is the mass of <b>" + sf(n, 3) + " mol</b> of " + nm(f) + "? Its molar mass is " + M.toFixed(2) + " g/mol. Give 3 significant figures.",
      answer:a.A, tol:a.tol, suf:"g", answerHtml:a.s + " g", meta:{ kind:"n2m", f, n, ans:a.A },
      workHtml:steps([["m = n × M", "mass = moles × molar mass"], ["m = " + sf(n, 3) + " mol × " + M.toFixed(2) + " g/mol = " + long(x) + " g", "mol cancels, leaving g."], ["Answer: <b>" + a.s + " g</b> (3 s.f.)", ""]]) +
        trap("Dividing by the molar mass. That turns grams into moles, not moles into grams."),
      key:"m = n × M.",
      hint:"One mole has a mass of " + M.toFixed(2) + " g. What about " + sf(n, 3) + " mol?",
      mistakes:mk(a.A, a.tol, [[n / M, "You divided. Mass = moles × molar mass."], [M / n, "Mass = moles × molar mass."]]) };
  });

  add("mol-N2n", "moles", 1, ctx => {
    const [f, word] = Kit.unique(ctx, PART, x => "N:" + x[0]), D = digits(3, false), cs = D[0] + "." + D.slice(1), e = ri(21, 25), N = Number(cs) * Math.pow(10, e), x = N / NA, a = ans3(x, false);
    return { type:"num", promptHtml:"A sample contains <b>" + sciS(cs, e) + "</b> " + word + " of " + nm(f) + ". How many moles is that? Use N<sub>A</sub> = " + NAH + ". Give 3 significant figures.",
      answer:a.A, tol:a.tol, suf:"mol", answerHtml:a.s + " mol", meta:{ kind:"N2n", cs, e, ans:a.A },
      workHtml:steps([["n = N ÷ N<sub>A</sub>", "1 mol is 6.02 × 10<sup>23</sup> particles, so divide the number of particles by that."],
        ["n = " + sciS(cs, e) + " ÷ (6.02 × 10<sup>23</sup>) = (" + cs + " ÷ 6.02) × 10<sup>" + minus(e - 23) + "</sup> = " + long(x) + " mol", "Divide the front numbers, subtract the powers."],
        ["Answer: <b>" + a.s + " mol</b>", ""]]) + trap("Multiplying by Avogadro's number. A count of particles is huge; the number of moles is usually small."),
      key:"particles → moles: divide by 6.02 × 10²³.",
      hint:"Is the number of moles going to be bigger or smaller than the number of particles?",
      mistakes:mk(a.A, a.tol, [[NA / N, "Upside down: moles = particles ÷ 6.02 × 10²³."], [Number(cs) / 6.02, "You divided the front numbers but forgot to subtract the powers of 10."]]) };
  });

  add("mol-n2N", "moles", 2, ctx => {
    const [f, word] = Kit.unique(ctx, PART, x => "n2N:" + x[0]), n = Number(sf(randIn(0.0150, 25), 3)), x = n * NA, s = sciOf(x, 3);
    return sciField({ promptHtml:"How many " + word + " are in <b>" + sf(n, 3) + " mol</b> of " + nm(f) + "? Use N<sub>A</sub> = " + NAH + ". Give the answer in scientific notation to 3 significant figures.",
      cs:s.cs, e:s.e, tol:tolSF(s.co, 3, 0.6), nsf:3, meta:{ kind:"n2N", n, cs:s.cs, e:s.e },
      workHtml:steps([["N = n × N<sub>A</sub>", "Each mole contains 6.02 × 10<sup>23</sup> particles."], ["N = " + sf(n, 3) + " × 6.02 × 10<sup>23</sup> = " + sciH(x, 5), ""],
        ["Answer: <b>" + sciS(s.cs, s.e) + "</b> " + word, "Make sure the number in front is between 1 and 10."]]) + trap("Dividing by Avogadro's number: you would get a tiny number of particles, which makes no sense."),
      key:"moles → particles: multiply by 6.02 × 10²³.",
      hint:"One mole is 6.02 × 10²³ particles. How many in " + sf(n, 3) + " mol?",
      mistakes:[{ val:n / NA, msg:"You divided. To get the number of particles, multiply the moles by 6.02 × 10²³." }] });
  });

  const ATOMS_IN = ["H2O","CO2","NH3","CH4","C6H12O6","C2H5OH","C3H8","SO2","H2SO4","CaCO3","Na2CO3","Al2O3","Fe2O3","Ca(OH)2","Al2(SO4)3","HNO3","C4H10","(NH4)2SO4"];
  add("mol-atoms-in", "moles", 2, ctx => {
    const f = Kit.unique(ctx, ATOMS_IN, x => "ai:" + x), p = parseFormula(f), els = Object.keys(p).filter(el => p[el] > 1), el = pick(els.length ? els : Object.keys(p)), k = p[el];
    const n = Number(sf(randIn(0.100, 5), 3));
    if (ri(0, 1)) {
      const x = n * k, a = ans3(x, false);
      return { type:"num", promptHtml:"How many moles of " + ELN[el] + " (" + el + ") atoms are in <b>" + sf(n, 3) + " mol</b> of " + nm(f) + "? Give 3 significant figures.", answer:a.A, tol:a.tol, suf:"mol",
        answerHtml:a.s + " mol", meta:{ kind:"atomsmol", f, el, n, ans:a.A },
        workHtml:steps([["One " + C(f) + " contains " + k + " " + el + " atom" + (k > 1 ? "s" : "") + ".", f.includes("(") ? "Remember the number after a bracket multiplies everything inside it." : ""],
          ["So 1 mol of " + C(f) + " contains " + k + " mol of " + el + " atoms.", ""], [sf(n, 3) + " × " + k + " = <b>" + a.s + " mol</b>", ""]]) + trap("Giving the moles of the compound instead of the moles of atoms."),
        key:"Moles of atoms = moles of compound × number of those atoms in one formula.",
        hint:"Count the " + el + " atoms in one " + C(f) + " first.",
        mistakes:mk(a.A, a.tol, [[n, "That is the number of moles of " + C(f) + ". Multiply by the " + k + " " + el + " atoms in each formula."], [n / k, "Multiply by " + k + ", don't divide."]]) };
    }
    const x = n * k * NA, s = sciOf(x, 3);
    return sciField({ promptHtml:"How many " + ELN[el] + " (" + el + ") atoms are in <b>" + sf(n, 3) + " mol</b> of " + nm(f) + "? Use N<sub>A</sub> = " + NAH + ". Give the answer in scientific notation to 3 significant figures.",
      cs:s.cs, e:s.e, tol:tolSF(s.co, 3, 0.6), nsf:3, meta:{ kind:"atomsN", f, el, n, cs:s.cs, e:s.e },
      workHtml:steps([["One " + C(f) + " contains " + k + " " + el + " atom" + (k > 1 ? "s" : "") + ", so " + sf(n, 3) + " mol contains " + sf(n, 3) + " × " + k + " = " + sf(n * k, 5) + " mol of " + el + " atoms.", ""],
        ["N = " + sf(n * k, 5) + " × 6.02 × 10<sup>23</sup> = " + sciH(x, 5), ""], ["Answer: <b>" + sciS(s.cs, s.e) + "</b> atoms", ""]]) +
        trap("Forgetting the " + k + ": that gives the number of " + C(f) + " particles, not the number of " + el + " atoms."),
      key:"Atoms of an element = moles × atoms per formula × 6.02 × 10²³.",
      hint:"How many " + el + " atoms are in one " + C(f) + "?",
      mistakes:[{ val:n * NA, msg:"That is the number of " + C(f) + " particles. Each one contains " + k + " " + el + " atoms, so multiply by " + k + "." }, { val:n * k / NA, msg:"Multiply by Avogadro's number, don't divide." }] });
  });

  add("mol-table", "moles", 2, ctx => {
    const f = Kit.unique(ctx, MM_SIMPLE.concat(MM_BR.slice(0, 6)), x => "mt:" + x), M = molarMass(f);
    if (ri(0, 1)) {
      const m = Number(sf(randIn(2, 99), 3)), x = m / M, a = ans3(x, true);
      return { type:"num", promptHtml:"How many moles are in <b>" + sf(m, 3) + " g</b> of " + nm(f) + "? Give 3 significant figures." + amList([f]), answer:a.A, tol:a.tol, suf:"mol", answerHtml:a.s + " mol",
        meta:{ kind:"m2n", f, m, ans:a.A },
        workHtml:steps([[mmLine(f), "Work out the molar mass from the formula first."], ["n = m ÷ M = " + sf(m, 3) + " g ÷ " + M.toFixed(2) + " g/mol = " + long(x) + " mol", ""], ["Answer: <b>" + a.s + " mol</b>", ""]]) +
          trap("Dividing by a wrong molar mass because a subscript was missed. Check the formula atom by atom."),
        key:"Molar mass from the formula, then n = m ÷ M.", hint:"Find M first: add up the atomic masses, using every subscript.",
        mistakes:mk(a.A, a.tol, [[m * M, "You multiplied. Moles = mass ÷ molar mass."], [m / onceEach(f), "Your molar mass is wrong: you counted each element only once."]].concat(f.includes("(") ? [[m / noBracket(f), "Your molar mass is wrong: the number after the bracket multiplies everything inside."]] : [])) };
    }
    const n = Number(sf(randIn(0.05, 4), 3)), x = n * M, a = ans3(x, true);
    return { type:"num", promptHtml:"What is the mass of <b>" + sf(n, 3) + " mol</b> of " + nm(f) + "? Give 3 significant figures." + amList([f]), answer:a.A, tol:a.tol, suf:"g", answerHtml:a.s + " g",
      meta:{ kind:"n2m", f, n, ans:a.A },
      workHtml:steps([[mmLine(f), "Work out the molar mass from the formula first."], ["m = n × M = " + sf(n, 3) + " mol × " + M.toFixed(2) + " g/mol = " + long(x) + " g", ""], ["Answer: <b>" + a.s + " g</b>", ""]]) +
        trap("Dividing by the molar mass. Moles → grams means multiplying."),
      key:"Molar mass from the formula, then m = n × M.", hint:"Find M first, then multiply.",
      mistakes:mk(a.A, a.tol, [[n / M, "You divided. Mass = moles × molar mass."], [n * onceEach(f), "Your molar mass is wrong: you counted each element only once."]].concat(f.includes("(") ? [[n * noBracket(f), "Your molar mass is wrong: the number after the bracket multiplies everything inside."]] : [])) };
  });

  const MOST = ["H2O","CO2","CH4","NH3","O2","N2","NaCl","CaCO3","C6H12O6","Fe","Cu","Mg","Al","C2H5OH","H2","NaOH","SO2","Zn"];
  const MASSES = ["5.00","8.00","10.0","12.0","16.0","20.0","25.0","32.0","40.0","50.0","64.0","80.0"];
  add("mol-most", "moles", 2, () => {
    let fs, ms, ns, best;
    for (let t = 0; t < 400; t++) {
      fs = shuffle(MOST.slice()).slice(0, 4); ms = fs.map(() => pick(MASSES)); ns = fs.map((f, i) => Number(ms[i]) / molarMass(f));
      const order = ns.map((v, i) => i).sort((a, b) => ns[b] - ns[a]); best = order[0];
      if (ns[order[0]] < 1.15 * ns[order[1]]) continue;
      const heaviest = ms.map(Number).indexOf(Math.max(...ms.map(Number)));
      if (heaviest === best && t < 300 && ri(0, 1)) continue;
      if (new Set(ms.map((m, i) => m + fs[i])).size < 4) continue;
      break;
    }
    const opts = fs.map((f, i) => i === best ? { html:ms[i] + " g of " + C(f), correct:true }
      : { html:ms[i] + " g of " + C(f), fb:ms[i] + " g ÷ " + molarMass(f).toFixed(2) + " g/mol = " + sf(ns[i], 3) + " mol, which is less than " + sf(ns[best], 3) + " mol." });
    return Kit.mc({ promptHtml:"Which sample contains the greatest amount of substance (the most moles)?" + amList(fs), options:opts, meta:{ kind:"most", fs, ms, best },
      workHtml:tbl(["Sample", "M (g/mol)", "n = m ÷ M"], fs.map((f, i) => [ms[i] + " g of " + C(f), molarMass(f).toFixed(2), (i === best ? "<b>" : "") + sf(ns[i], 3) + " mol" + (i === best ? "</b>" : "")])) +
        "<p>The largest amount is <b>" + ms[best] + " g of " + C(fs[best]) + "</b>.</p>" + trap("Picking the biggest mass. Light particles (small molar mass) give many moles from a small mass."),
      key:"Compare amounts in moles, not grams: n = m ÷ M for each sample.",
      hint:"Work out n = m ÷ M for every sample." });
  });

  add("mol-N2m", "moles", 3, ctx => {
    const [f, word] = Kit.unique(ctx, PART, x => "N2m:" + x[0]), M = molarMass(f), D = digits(3, false), cs = D[0] + "." + D.slice(1), e = ri(22, 24), N = Number(cs) * Math.pow(10, e);
    const n = N / NA, x = n * M, a = ans3(x, true);
    return { type:"num", promptHtml:"What is the mass of <b>" + sciS(cs, e) + "</b> " + word + " of " + nm(f) + "? Use N<sub>A</sub> = " + NAH + ". Give 3 significant figures." + amList([f]),
      answer:a.A, tol:a.tol, suf:"g", answerHtml:a.s + " g", meta:{ kind:"N2m", f, cs, e, ans:a.A },
      workHtml:steps([["n = N ÷ N<sub>A</sub> = " + sciS(cs, e) + " ÷ 6.02 × 10<sup>23</sup> = " + long(n) + " mol", "Particles → moles: divide."], [mmLine(f), ""],
        ["m = n × M = " + long(n) + " mol × " + M.toFixed(2) + " g/mol = " + long(x) + " g", "Moles → grams: multiply."], ["Answer: <b>" + a.s + " g</b>", "Keep the unrounded moles on your calculator until the end."]]) +
        trap("Stopping at moles, or going straight from particles to grams. The route is particles → moles → grams."),
      key:"Particles → moles (÷ N<sub>A</sub>) → grams (× M).",
      hint:"Convert the particles to moles first.",
      mistakes:mk(a.A, a.tol, [[n, "That is the number of moles. Multiply by the molar mass to get grams."], [n / M, "Moles → grams means multiplying by M, not dividing."]]) };
  });

  add("mol-m2atoms", "moles", 3, ctx => {
    const f = Kit.unique(ctx, ATOMS_IN, x => "m2a:" + x), p = parseFormula(f), els = Object.keys(p).filter(el => p[el] > 1), el = pick(els.length ? els : Object.keys(p)), k = p[el];
    const M = molarMass(f), m = Number(sf(randIn(2, 90), 3)), n = m / M, x = n * k * NA, s = sciOf(x, 3);
    return sciField({ promptHtml:"How many " + ELN[el] + " (" + el + ") atoms are in <b>" + sf(m, 3) + " g</b> of " + nm(f) + "? Use N<sub>A</sub> = " + NAH + ". Give the answer in scientific notation to 3 significant figures." + amList([f]),
      cs:s.cs, e:s.e, tol:tolSF(s.co, 3, 1.1), nsf:3, meta:{ kind:"m2atoms", f, el, m, cs:s.cs, e:s.e },
      workHtml:steps([[mmLine(f), ""], ["n(" + C(f) + ") = " + sf(m, 3) + " g ÷ " + M.toFixed(2) + " g/mol = " + long(n) + " mol", "grams → moles"],
        ["n(" + el + " atoms) = " + long(n) + " × " + k + " = " + long(n * k) + " mol", "Each " + C(f) + " has " + k + " " + el + " atoms."],
        ["N = " + long(n * k) + " × 6.02 × 10<sup>23</sup> = " + sciH(x, 5), "moles → particles"], ["Answer: <b>" + sciS(s.cs, s.e) + "</b> " + el + " atoms", ""]]) +
        trap("Forgetting to multiply by the " + k + " " + el + " atoms in each formula."),
      key:"grams → moles → moles of atoms → number of atoms.",
      hint:"Find the moles of " + C(f) + " first. How many " + el + " atoms does each one carry?",
      mistakes:[{ val:n * NA, msg:"That is the number of " + C(f) + " particles. Multiply by " + k + " for the " + el + " atoms." },
        { val:m * M * k * NA, msg:"To get moles, divide the mass by the molar mass, don't multiply." }, { val:m * k * NA, msg:"You skipped the molar mass: grams must be changed to moles first." }] });
  });

  const METALS = ["Na","Mg","Al","K","Ca","Fe","Cu","Zn"];
  add("mol-identify", "moles", 3, () => {
    const el = pick(METALS), M = AM[el], n = pick([0.125, 0.150, 0.200, 0.250, 0.300, 0.400, 0.450, 0.500, 0.600, 0.750]), m = Number(sf(n * M, 3)), Mx = m / n;
    const others = shuffle(METALS.filter(x => x !== el && Math.abs(AM[x] - M) > 3)).slice(0, 3);
    const opts = [{ html:ELN[el] + " (" + el + ")", correct:true }].concat(others.map(x => ({ html:ELN[x] + " (" + x + ")",
      fb:ELN[x][0].toUpperCase() + ELN[x].slice(1) + " has a molar mass of " + AM[x].toFixed(2) + " g/mol, but the data give " + sf(Mx, 3) + " g/mol." })));
    return Kit.mc({ promptHtml:"<b>" + sf(n, 3) + " mol</b> of an unknown metal has a mass of <b>" + sf(m, 3) + " g</b>. Which metal is it?" +
      '<p class="small muted">Atomic masses (g/mol): ' + [el].concat(others).sort().map(x => x + " " + AM[x].toFixed(2)).join(", ") + ".</p>", options:opts, meta:{ kind:"identify", el, n, m },
      workHtml:steps([["M = m ÷ n", "Rearrange n = m ÷ M to find the molar mass."], ["M = " + sf(m, 3) + " g ÷ " + sf(n, 3) + " mol = " + sf(Mx, 4) + " g/mol", ""],
        ["The closest atomic mass is " + el + ", " + M.toFixed(2) + " g/mol, so the metal is <b>" + ELN[el] + "</b>.", "Small differences come from rounding the mass to 3 s.f."]]) +
        trap("Calculating n × m or n ÷ m. Check units: g ÷ mol gives g/mol."),
      key:"Molar mass = mass ÷ moles; match it to the periodic table.",
      hint:"Which formula links mass, moles and molar mass? Solve it for M." });
  });

  /* =====================================================================
     4. Balancing equations
     ===================================================================== */
  function ionUnits(f, ion){ const m = f.match(new RegExp("\\(" + ion + "\\)(\\d*)")); if (m) return Number(m[1] || 1); return f.includes(ion) ? 1 : 0; }
  function balTips(eq){
    const tips = [], isEl = f => Object.keys(parseFormula(f)).length === 1;
    const prods = eq.p.slice().sort().join();
    if (eq.r.includes("O2") && prods === "CO2,H2O") {
      tips.push("Combustion: balance C first (CO<sub>2</sub>), then H (H<sub>2</sub>O), and O last, because O<sub>2</sub> contains nothing else.");
      if (eq.c[eq.r.indexOf("O2")] % 2 === 1 && eq.c[0] % 2 === 0) tips.push("If you need an odd number of O atoms from O<sub>2</sub> (a half), double every coefficient.");
      return tips.join(" ");
    }
    for (const ion of ["SO4", "NO3", "PO4", "CO3", "OH"]) {
      const L = eq.r.reduce((s, f, i) => s + eq.c[i] * ionUnits(f, ion), 0), R = eq.p.reduce((s, f, i) => s + eq.c[eq.r.length + i] * ionUnits(f, ion), 0);
      if (L > 0 && L === R) tips.push("The " + C(ion) + " group stays together on both sides, so balance it as one unit.");
    }
    const els = eq.all.filter(isEl);
    if (els.length) tips.push("Leave the element" + (els.length > 1 ? "s " : " ") + els.map(C).join(" and ") + " until last: changing " + (els.length > 1 ? "their coefficients" : "its coefficient") + " affects nothing else.");
    if (!tips.length) tips.push("Start with the element that appears in the fewest substances, then balance the rest one at a time.");
    return tips.join(" ");
  }
  function countTable(eq, cf){
    const k = counts(eq, cf);
    return tbl(["Element", "Left", "Right"], elementsOf(eq).map(el => { const a = k.L[el] || 0, b = k.R[el] || 0; return [el, a === b ? String(a) : "<b>" + a + "</b>", a === b ? String(b) + " ✓" : "<b>" + b + "</b>"]; }));
  }
  function balDiag(eq, v){
    if (v.some(x => !Number.isInteger(x) || x < 1)) return "Every coefficient must be a positive whole number. Write 1 explicitly; never use 0 or a fraction.";
    const k = counts(eq, v), bad = elementsOf(eq).filter(el => (k.L[el] || 0) !== (k.R[el] || 0));
    if (!bad.length) {
      const g = v.reduce(g2);
      return g > 1 ? "Your equation is balanced, but every coefficient can be divided by " + g + ". Give the lowest whole-number ratio: " + v.map(x => x / g).join(", ") + "." : "";
    }
    return bad.slice(0, 2).map(el => el + " is not balanced: " + (k.L[el] || 0) + " on the left, " + (k.R[el] || 0) + " on the right").join("; ") + ". Change coefficients, never subscripts.";
  }
  function balWork(eq){
    return "<p>Count the atoms with every coefficient set to 1:</p>" + countTable(eq, eq.c.map(() => 1)) +
      "<p><b>Strategy:</b> " + balTips(eq) + "</p><p>Balanced: <b>" + eqHtml(eq, eq.c, false) + "</b></p><p>Check every element:</p>" + countTable(eq, eq.c) +
      trap("Changing a subscript (for example H<sub>2</sub>O to H<sub>2</sub>O<sub>2</sub>) makes a different substance. Only the coefficients in front may change, and they must be in the lowest whole-number ratio.");
  }
  function balMake(eq){
    const parts = [];
    eq.all.forEach((f, i) => {
      if (i === eq.r.length) parts.push({ txt:" → " }); else if (i) parts.push({ txt:" + " });
      parts.push({ c:"k" + i, label:"Coefficient of " + f }); parts.push({ txt:"&nbsp;" + C(f) });
    });
    const answer = {}; eq.c.forEach((c, i) => { answer["k" + i] = c; });
    const who = eq.r.map(f => NAMES[f] || C(f)).join(" and ");
    return Kit.fields({ promptHtml:"Balance the equation" + (eq.d ? " for this " + eq.d + " reaction" : "") + " of " + who + ". Use the lowest whole-number coefficients and type 1 where the coefficient is 1.",
      parts, answer, answerHtml:eqHtml(eq, eq.c, true), meta:{ kind:"bal", key:eq.key, c:eq.c },
      missingMsg:"Fill in every box with a whole number. Type 1 where no other number is needed.",
      workHtml:balWork(eq), key:"Count atoms of each element on both sides; change only coefficients; finish with the lowest whole-number ratio.",
      hint:balTips(eq).split(". ")[0].replace(/\.$/, "") + ".", diagnose:rec => balDiag(eq, eq.all.map((_, i) => rec.vals["k" + i])) });
  }
  add("bal-1", "balancing", 1, ctx => balMake(Kit.unique(ctx, EQ_LV(1), eqKey)));
  add("bal-2", "balancing", 2, ctx => balMake(Kit.unique(ctx, EQ_LV(2), eqKey)));
  add("bal-3", "balancing", 3, ctx => balMake(Kit.unique(ctx, EQ_LV(3), eqKey)));
  add("bal-one", "balancing", 1, ctx => {
    const eq = Kit.unique(ctx, EQNS.filter(e => e.lv <= 2 && e.c.some(c => c > 1)), eqKey), idx = eq.c.map((c, i) => c > 1 ? i : -1).filter(i => i >= 0), h = pick(idx);
    const parts = [];
    eq.all.forEach((f, i) => {
      if (i === eq.r.length) parts.push({ txt:" → " }); else if (i) parts.push({ txt:" + " });
      if (i === h) { parts.push({ c:"x", label:"Missing coefficient" }); parts.push({ txt:"&nbsp;" + C(f) }); }
      else parts.push({ txt:eq.c[i] + "&nbsp;" + C(f) });
    });
    const k = counts(eq, eq.c), els = Object.keys(parseFormula(eq.all[h]));
    return Kit.fields({ promptHtml:"All the coefficients but one are filled in. What number goes in the box so that the equation balances?", parts, answer:{ x:eq.c[h] },
      answerHtml:eqHtml(eq, eq.c, true), meta:{ kind:"bal", key:eq.key, c:eq.c },
      workHtml:"<p>" + C(eq.all[h]) + " contains " + els.join(", ") + ". Pick an element and count it on the other side.</p>" + countTable(eq, eq.c) +
        "<p>The missing coefficient is <b>" + eq.c[h] + "</b>: " + eqHtml(eq, eq.c, true) + ".</p>" + trap("Counting only the subscripts. Atoms in a substance = coefficient × subscript."),
      key:"Atoms of an element = coefficient × subscript; both sides must match.", hint:"Choose an element in the boxed substance. How many of its atoms are on the other side?",
      diagnose:rec => { const v = eq.c.slice(); v[h] = rec.vals.x; return balDiag(eq, v); } });
  });

  /* =====================================================================
     5. Mole ratios
     ===================================================================== */
  const isR = (eq, i) => i < eq.r.length;
  function pickPair(eq, wantDiff){
    let a, b;
    for (let t = 0; t < 40; t++) { a = ri(0, eq.all.length - 1); b = ri(0, eq.all.length - 1); if (a !== b && (!wantDiff || eq.c[a] !== eq.c[b] || t > 30)) break; }
    if (a === b) b = (a + 1) % eq.all.length;
    return [a, b];
  }
  const verbA = (eq, i) => isR(eq, i) ? "reacts completely" : "is produced";
  const verbB = (eq, i) => isR(eq, i) ? "reacts" : "is produced";
  const verbBp = (eq, i) => isR(eq, i) ? "react" : "are produced";

  add("ratio-mol", "ratios", 1, ctx => {
    const eq = Kit.unique(ctx, RATIO_EQ.filter(e => e.c.some(c => c > 1)), eqKey), [a, b] = pickPair(eq, true), A = eq.all[a], B = eq.all[b], ca = eq.c[a], cb = eq.c[b];
    const nA = Number(sf(ri(2, 60) / 10, 3)), x = nA * cb / ca, r = ans3(x, false);
    return { type:"num", promptHtml:"<b>" + sf(nA, 3) + " mol</b> of " + C(A) + " " + verbA(eq, a) + ". How many moles of " + C(B) + " " + verbBp(eq, b) + "? Give 3 significant figures.",
      exprHtml:disp(eqHtml(eq, eq.c)), answer:r.A, tol:r.tol, suf:"mol", answerHtml:r.s + " mol", meta:{ kind:"ratio", key:eq.key, a, b, nA, ans:r.A },
      workHtml:steps([["Mole ratio " + C(A) + " : " + C(B) + " = " + ca + " : " + cb, "Read it from the coefficients of the balanced equation (no number means 1)."],
        ["n(" + C(B) + ") = " + sf(nA, 3) + " mol × " + cb + "/" + ca + " = " + long(x) + " mol", "Multiply by (what you want) / (what you have)."], ["Answer: <b>" + r.s + " mol</b>", ""]]) +
        trap("Using the ratio upside down. Sense check: if " + C(B) + " has the bigger coefficient, you should get more moles of it."),
      key:"moles wanted = moles given × (coefficient wanted ÷ coefficient given).",
      hint:"Find the coefficients of " + C(A) + " and " + C(B) + ". Which one is bigger?",
      mistakes:mk(r.A, r.tol, [[nA, "You used a 1 : 1 ratio. The coefficients say " + ca + " : " + cb + "."], [nA * ca / cb, "Your ratio is upside down: multiply by " + cb + "/" + ca + "."]]) };
  });

  add("ratio-mc", "ratios", 1, ctx => {
    const eq = Kit.unique(ctx, RATIO_EQ.filter(e => new Set(e.c).size > 1), eqKey); let a, b;
    for (let t = 0; t < 50; t++) { [a, b] = pickPair(eq, true); if (eq.c[a] !== eq.c[b]) break; }
    const A = eq.all[a], B = eq.all[b], g = g2(eq.c[a], eq.c[b]), ca = eq.c[a] / g, cb = eq.c[b] / g;
    const red = (x, y) => { const d = g2(x, y); return (x / d) + ":" + (y / d); };
    const opts = [{ html:ca + " : " + cb, correct:true }], seen = new Set([red(ca, cb)]);
    const addO = (x, y, fb) => { const r = red(x, y); if (!seen.has(r)) { seen.add(r); opts.push({ html:x + " : " + y, fb }); } };
    addO(cb, ca, "That is the ratio of " + C(B) + " to " + C(A) + ": the order is reversed.");
    addO(1, 1, "The coefficients are not equal, so the ratio is not 1 : 1.");
    const sa = Object.values(parseFormula(A)).reduce((s, v) => s + v, 0), sb = Object.values(parseFormula(B)).reduce((s, v) => s + v, 0);
    addO(sa, sb, "That compares the numbers of atoms in one formula of each. The mole ratio comes from the coefficients.");
    if (opts.length < 4) addO(ca + cb, cb, "The ratio uses the two coefficients directly, not their sum.");
    return Kit.mc({ promptHtml:"What is the mole ratio of " + C(A) + " to " + C(B) + " in this reaction?", exprHtml:disp(eqHtml(eq, eq.c)), options:opts, meta:{ kind:"ratiomc", key:eq.key, a, b },
      workHtml:"<p>The coefficients are " + eq.c[a] + " for " + C(A) + " and " + eq.c[b] + " for " + C(B) + " (no number means 1).</p><p>So " + C(A) + " : " + C(B) + " = <b>" + ca + " : " + cb + "</b>" +
        (g > 1 ? " (simplified from " + eq.c[a] + " : " + eq.c[b] + ")" : "") + ".</p>" + trap("Reading subscripts instead of coefficients. Subscripts describe one formula; coefficients count moles."),
      key:"The coefficients of a balanced equation give the mole ratio.", hint:"Look at the big numbers in front of each formula." });
  });

  add("ratio-unbal", "ratios", 2, ctx => {
    const eq = Kit.unique(ctx, RATIO_EQ.filter(e => e.c.some(c => c > 1)), eqKey), [a, b] = pickPair(eq, true), A = eq.all[a], B = eq.all[b], ca = eq.c[a], cb = eq.c[b];
    const nA = Number(sf(randIn(0.2, 6), 3)), x = nA * cb / ca, r = ans3(x, false);
    return { type:"num", promptHtml:"This equation is <b>not balanced</b> yet. Balance it, then find how many moles of " + C(B) + " " + verbBp(eq, b) + " when <b>" + sf(nA, 3) + " mol</b> of " + C(A) + " " + verbA(eq, a) + ". Give 3 significant figures.",
      exprHtml:disp(eqHtml(eq, null)), answer:r.A, tol:r.tol, suf:"mol", answerHtml:r.s + " mol", meta:{ kind:"ratio", key:eq.key, a, b, nA, ans:r.A },
      workHtml:steps([["Balanced: " + eqHtml(eq, eq.c), "Count atoms on each side and adjust the coefficients."], ["Ratio " + C(A) + " : " + C(B) + " = " + ca + " : " + cb, ""],
        ["n(" + C(B) + ") = " + sf(nA, 3) + " × " + cb + "/" + ca + " = <b>" + r.s + " mol</b>", ""]]) +
        trap("Using an unbalanced equation. Without coefficients every ratio looks like 1 : 1, which is usually wrong."),
      key:"Always balance first: mole ratios only come from a balanced equation.", hint:"Balance the equation, then read the coefficients.",
      mistakes:mk(r.A, r.tol, [[nA, "You used the unbalanced equation (1 : 1). Balance it first: the ratio is " + ca + " : " + cb + "."], [nA * ca / cb, "Your ratio is upside down: multiply by " + cb + "/" + ca + "."]]) };
  });

  function ratioCalc(ctx, fromMass, toMass){
    const eq = Kit.unique(ctx, RATIO_EQ, eqKey), [a, b] = pickPair(eq, false), A = eq.all[a], B = eq.all[b], ca = eq.c[a], cb = eq.c[b], MA = molarMass(A), MB = molarMass(B);
    let nA, given, mA = 0;
    if (fromMass) { mA = Number(sf(randIn(1, 80), 3)); nA = mA / MA; given = sf(mA, 3) + " g"; } else { nA = Number(sf(randIn(0.1, 5), 3)); given = sf(nA, 3) + " mol"; }
    const nB = nA * cb / ca, val = toMass ? nB * MB : nB, r = ans3(val, true), unit = toMass ? "g" : "mol";
    const st = [];
    if (fromMass) st.push(["n(" + C(A) + ") = " + sf(mA, 3) + " g ÷ " + MA.toFixed(2) + " g/mol = " + long(nA) + " mol", mmLine(A)]);
    st.push(["n(" + C(B) + ") = " + long(nA) + " mol × " + cb + "/" + ca + " = " + long(nB) + " mol", "Mole ratio " + C(A) + " : " + C(B) + " = " + ca + " : " + cb + " from the coefficients."]);
    if (toMass) st.push(["m(" + C(B) + ") = " + long(nB) + " mol × " + MB.toFixed(2) + " g/mol = " + long(val) + " g", mmLine(B)]);
    st.push(["Answer: <b>" + r.s + " " + unit + "</b> (3 s.f.)", "Keep the unrounded values on your calculator until this last step."]);
    const ratio1 = toMass ? nA * MB : nA, inv = nA * ca / cb * (toMass ? MB : 1);
    const list = [[ratio1, "You skipped the mole ratio. The coefficients say " + C(A) + " : " + C(B) + " = " + ca + " : " + cb + "."], [inv, "Your mole ratio is upside down: multiply by " + cb + "/" + ca + "."]];
    if (fromMass) list.push([mA * MA * cb / ca * (toMass ? MB : 1), "To change grams into moles, divide by the molar mass; don't multiply."]);
    if (toMass) list.push([nB / MB, "To change moles into grams, multiply by the molar mass; don't divide."]);
    if (fromMass && toMass) list.push([mA * cb / ca, "You used the coefficients on grams. Coefficients compare moles, not masses: convert to moles first."]);
    return { type:"num", promptHtml:"<b>" + given + "</b> of " + C(A) + " " + verbA(eq, a) + ". What " + (toMass ? "mass" : "amount (in moles)") + " of " + C(B) + " " + verbB(eq, b) + "? Give 3 significant figures." +
      amList((fromMass ? [A] : []).concat(toMass ? [B] : [])), exprHtml:disp(eqHtml(eq, eq.c)), answer:r.A, tol:r.tol, suf:unit, answerHtml:r.s + " " + unit,
      meta:{ kind:"rcalc", key:eq.key, a, b, fromMass, toMass, given:fromMass ? mA : nA, ans:r.A },
      workHtml:steps(st) + trap(fromMass && toMass ? "Going straight from grams of one substance to grams of another. The coefficients compare moles, so the route is grams → moles → ratio → moles → grams."
        : fromMass ? "Using the coefficients on grams. Change grams to moles first, then use the mole ratio." : "Forgetting the mole ratio, or dividing by the molar mass at the end. Moles → grams means multiplying by M."),
      key:"Mass → moles (÷ M) → mole ratio → moles → mass (× M).",
      hint:fromMass ? "Turn the mass of " + C(A) + " into moles first." : "Use the coefficients to go from moles of " + C(A) + " to moles of " + C(B) + ".",
      mistakes:mk(r.A, r.tol, list) };
  }
  add("ratio-m2n", "ratios", 2, ctx => ratioCalc(ctx, true, false));
  add("ratio-n2m", "ratios", 2, ctx => ratioCalc(ctx, false, true));
  add("ratio-m2m", "ratios", 3, ctx => ratioCalc(ctx, true, true));

  function limSetup(ctx){
    const eq = Kit.unique(ctx, LIM_EQ, eqKey), [A, B] = eq.r, [ca, cb] = eq.c, MA = molarMass(A), MB = molarMass(B);
    for (;;) {
      const x = randIn(0.05, 0.4), lim = ri(0, 1), f = randIn(1.3, 2.5), xa = lim === 0 ? x : x * f, xb = lim === 0 ? x * f : x;
      const mA = Number(sf(xa * ca * MA, 3)), mB = Number(sf(xb * cb * MB, 3)), nA = mA / MA, nB = mB / MB, ea = nA / ca, eb = nB / cb;
      if (Math.max(ea, eb) / Math.min(ea, eb) < 1.2) continue;
      return { eq, A, B, ca, cb, MA, MB, mA, mB, nA, nB, ea, eb, limA:ea < eb };
    }
  }
  function limSteps(s){
    const L = s.limA ? s.A : s.B;
    return [["n(" + C(s.A) + ") = " + sf(s.mA, 3) + " g ÷ " + s.MA.toFixed(2) + " g/mol = " + long(s.nA) + " mol", mmLine(s.A)],
      ["n(" + C(s.B) + ") = " + sf(s.mB, 3) + " g ÷ " + s.MB.toFixed(2) + " g/mol = " + long(s.nB) + " mol", mmLine(s.B)],
      ["Divide by coefficients: " + C(s.A) + ": " + long(s.nA) + " ÷ " + s.ca + " = " + sf(s.ea, 4) + "; " + C(s.B) + ": " + long(s.nB) + " ÷ " + s.cb + " = " + sf(s.eb, 4),
        "The smaller result runs out first, so <b>" + C(L) + "</b> is the limiting reactant."]];
  }
  add("lim-mc", "ratios", 3, ctx => {
    const s = limSetup(ctx), L = s.limA ? s.A : s.B, X = s.limA ? s.B : s.A, smaller = s.mA < s.mB ? s.A : s.B;
    const opts = [{ html:C(L), correct:true },
      { html:C(X), fb:"Divide moles by coefficients: " + C(X) + " gives the larger result, so it is in excess." + (X === smaller ? " A smaller mass does not mean fewer moles." : "") },
      { html:"Neither: they react in exactly the right ratio", fb:"After dividing moles by coefficients the results (" + sf(s.ea, 3) + " and " + sf(s.eb, 3) + ") are not equal, so one reactant runs out first." }];
    return Kit.mc({ promptHtml:"<b>" + sf(s.mA, 3) + " g</b> of " + C(s.A) + " and <b>" + sf(s.mB, 3) + " g</b> of " + C(s.B) + " are mixed and react. Which is the limiting reactant?" + amList([s.A, s.B]),
      exprHtml:disp(eqHtml(s.eq, s.eq.c)), options:opts, meta:{ kind:"lim", key:s.eq.key, mA:s.mA, mB:s.mB, limA:s.limA },
      workHtml:steps(limSteps(s)) + trap("Choosing the reactant with the smaller mass, or comparing moles without dividing by the coefficients."),
      key:"Moles ÷ coefficient for each reactant: the smallest value is the limiting reactant.",
      hint:"Convert both masses to moles, then divide each by its coefficient." });
  });
  add("lim-yield", "ratios", 3, ctx => {
    const s = limSetup(ctx), pi = ri(0, s.eq.p.length - 1), P = s.eq.p[pi], cp = s.eq.c[s.eq.r.length + pi], MP = molarMass(P);
    const e = Math.min(s.ea, s.eb), x = e * cp * MP, r = ans3(x, true), L = s.limA ? s.A : s.B;
    return { type:"num", promptHtml:"<b>" + sf(s.mA, 3) + " g</b> of " + C(s.A) + " and <b>" + sf(s.mB, 3) + " g</b> of " + C(s.B) + " are mixed and react completely. What is the maximum mass of " + C(P) + " that can form? Give 3 significant figures." +
      amList([s.A, s.B, P]), exprHtml:disp(eqHtml(s.eq, s.eq.c)), answer:r.A, tol:r.tol, suf:"g", answerHtml:r.s + " g", meta:{ kind:"limy", key:s.eq.key, mA:s.mA, mB:s.mB, pi, ans:r.A },
      workHtml:steps(limSteps(s).concat([["n(" + C(P) + ") = " + sf(e, 4) + " × " + cp + " = " + long(e * cp) + " mol", "Use the limiting reactant: when it runs out, the reaction stops."],
        ["m(" + C(P) + ") = " + long(e * cp) + " mol × " + MP.toFixed(2) + " g/mol = <b>" + r.s + " g</b>", mmLine(P)]])) +
        trap("Calculating from the reactant in excess. Some of it is left over, so it cannot all turn into product."),
      key:"Find the limiting reactant first; the product amount comes only from it.", hint:"Which reactant runs out first? Base the calculation on that one.",
      mistakes:mk(r.A, r.tol, [[Math.max(s.ea, s.eb) * cp * MP, "You used the reactant in excess. " + C(L) + " runs out first, so it decides how much product forms."], [e * MP, "You forgot the coefficient of " + C(P) + " (" + cp + ")."],
        [s.mA + s.mB, "The product mass is not simply the total mass: one reactant is not used up."]]) };
  });

  /* =====================================================================
     6. Conservation of mass
     ===================================================================== */
  const CONS_EQ = RATIO_EQ.filter(e => e.all.length <= 4);
  add("cons-missing", "conservation", 1, ctx => {
    const eq = Kit.unique(ctx, CONS_EQ, eqKey), all = eq.all, h = ri(0, all.length - 1), m0 = ri(200, 6000) / 100, xi = m0 / (eq.c[0] * molarMass(all[0]));
    const ms = all.map((f, i) => i === 0 ? m0 : r2(eq.c[i] * molarMass(f) * xi));
    const hR = isR(eq, h), same = (hR ? eq.r : eq.p).map((f, i) => hR ? i : eq.r.length + i).filter(i => i !== h), other = (hR ? eq.p : eq.r).map((f, i) => hR ? eq.r.length + i : i);
    const sumO = r2(other.reduce((s, i) => s + ms[i], 0)), sumS = r2(same.reduce((s, i) => s + ms[i], 0)), ans = r2(sumO - sumS);
    const rows = all.map((f, i) => [nm(f), isR(eq, i) ? "reactant" : "product", i === h ? "<b>?</b>" : ms[i].toFixed(2) + " g"]);
    const known = r2(ms.reduce((s, v, i) => i === h ? s : s + v, 0));
    if (ans < 0.03) return null;
    return { type:"num", promptHtml:"This reaction takes place in a <b>sealed container</b>, and all the reactants are used up. Find the missing mass.", exprHtml:disp(eqHtml(eq, eq.c)) + tbl(["Substance", "Role", "Mass"], rows),
      answer:ans, tol:0.0051 / ans, suf:"g", answerHtml:ans.toFixed(2) + " g", meta:{ kind:"missing", key:eq.key, ms, h, ans },
      workHtml:steps([["Total mass of reactants = total mass of products", "Atoms are only rearranged, and nothing can leave a sealed container."],
        [(hR ? "Products" : "Reactants") + ": " + (other.length > 1 ? other.map(i => ms[i].toFixed(2)).join(" + ") + " = " : "") + sumO.toFixed(2) + " g", ""],
        [(hR ? "Reactants" : "Products") + ": " + same.map(i => ms[i].toFixed(2) + " + ").join("") + "? = " + sumO.toFixed(2) + " g", ""],
        ["? = " + sumO.toFixed(2) + (sumS ? " − " + sumS.toFixed(2) : "") + " = <b>" + ans.toFixed(2) + " g</b>", ""]]) +
        trap("Adding up all the known masses. Reactant masses and product masses must be put on opposite sides of the equals sign."),
      key:"In a closed system, total mass of reactants = total mass of products.", hint:"Add up the side with no missing value. The other side must have the same total.",
      mistakes:mk(ans, 0.0051 / ans, [[known, "You added all the known masses. The reactants' total must equal the products' total."]]) };
  });

  const SCEN = [
    { s:"A strip of magnesium is heated in an open crucible until it burns to form white magnesium oxide.", out:"up", why:"oxygen from the air combines with the magnesium, so extra atoms end up on the balance", metal:"magnesium" },
    { s:"Steel wool (iron) is heated strongly in air on a heatproof mat that sits on a balance.", out:"up", why:"oxygen from the air combines with the iron to form iron oxide", metal:"iron" },
    { s:"Copper powder is heated in an open dish in air until it turns black (copper(II) oxide).", out:"up", why:"oxygen from the air combines with the copper", metal:"copper" },
    { s:"Calcium metal is heated in an open crucible in air.", out:"up", why:"oxygen from the air combines with the calcium to form calcium oxide", metal:"calcium" },
    { s:"Marble chips (calcium carbonate) are added to hydrochloric acid in an open flask on a balance.", out:"down", why:"carbon dioxide gas forms and escapes into the air", gas:"carbon dioxide" },
    { s:"Zinc granules react with hydrochloric acid in an open beaker on a balance.", out:"down", why:"hydrogen gas forms and escapes into the air", gas:"hydrogen" },
    { s:"Baking soda (sodium hydrogen carbonate) is added to vinegar in an open cup on a balance.", out:"down", why:"carbon dioxide gas bubbles out and escapes", gas:"carbon dioxide" },
    { s:"Calcium carbonate powder is heated strongly in an open test tube on a balance.", out:"down", why:"it decomposes, and the carbon dioxide gas escapes", gas:"carbon dioxide" },
    { s:"A candle burns on a balance in an open room.", out:"down", why:"the products, carbon dioxide and water vapor, are gases that escape into the air", gas:"carbon dioxide and water vapor" },
    { s:"Hydrogen peroxide decomposes with a catalyst in an open flask on a balance.", out:"down", why:"oxygen gas forms and escapes", gas:"oxygen" },
    { s:"Marble chips and hydrochloric acid react in a flask sealed with a stopper (a closed system) on a balance.", out:"same", why:"the carbon dioxide cannot escape, so every atom stays on the balance", closed:true },
    { s:"Baking soda and vinegar are mixed inside a sealed plastic bottle on a balance.", out:"same", why:"the bottle is closed, so the carbon dioxide stays inside", closed:true },
    { s:"Silver nitrate solution is poured into sodium chloride solution in an open beaker, and a white solid forms. Both containers stay on the balance.", out:"same", why:"no gas is made or used, so nothing enters or leaves; the atoms only rearrange into a solid" },
    { s:"Sodium hydroxide solution is added to copper(II) sulfate solution in an open beaker, and a blue solid forms. Both containers stay on the balance.", out:"same", why:"no gas is made or used, so all the atoms stay on the balance" },
    { s:"Hydrochloric acid neutralizes sodium hydroxide solution in an open beaker on a balance.", out:"same", why:"the products, sodium chloride and water, stay in the beaker; no gas is involved" }
  ];
  const OUTW = { up:"The mass reading increases", down:"The mass reading decreases", same:"The mass reading stays the same" };
  add("cons-open", "conservation", 1, ctx => {
    const sc = Kit.unique(ctx, SCEN, x => "sc:" + x.s), opts = [{ html:OUTW[sc.out] + ", because " + sc.why + ".", correct:true }];
    if (sc.out === "up") opts.push(
      { html:OUTW.same + ", because mass is always conserved.", fb:"Mass is conserved overall, but this is an open system: oxygen atoms from the air join the " + sc.metal + " and are now weighed too." },
      { html:OUTW.down + ", because the " + sc.metal + " is used up as it reacts.", fb:"The " + sc.metal + " atoms are not lost: they are in the oxide, together with oxygen atoms from the air." },
      { html:OUTW.up + ", because new atoms are created in the reaction.", fb:"Atoms are never created in a chemical reaction. The extra mass is oxygen that came from the air." });
    else if (sc.out === "down") opts.push(
      { html:OUTW.same + ", because mass is always conserved.", fb:"Mass is conserved, but this is an open system: the " + sc.gas + " leaves, and the balance only weighs what is still on it." },
      { html:OUTW.down + ", because atoms are destroyed in the reaction.", fb:"Atoms are never destroyed. The missing mass is the gas that escaped into the air." },
      { html:OUTW.up + ", because the products are heavier substances.", fb:"Total mass cannot go up unless something enters. Here a gas leaves instead." });
    else opts.push(
      { html:OUTW.down + ", because a gas forms and escapes.", fb:sc.closed ? "The container is sealed, so any gas stays inside and is still weighed." : "No gas is formed in this reaction, so nothing escapes." },
      { html:OUTW.up + ", because a new substance forms.", fb:"New substances are made of the same atoms. With nothing entering or leaving, the total mass cannot change." },
      { html:OUTW.down + ", because some atoms are used up.", fb:"Atoms are never used up or destroyed; they only rearrange." });
    return Kit.mc({ promptHtml:sc.s + " What happens to the reading on the balance during the reaction?", options:opts, meta:{ kind:"scen", out:sc.out },
      workHtml:"<p>" + OUTW[sc.out] + ", because " + sc.why + ".</p><p>The law of conservation of mass is never broken: atoms are not created or destroyed. A balance reading only changes when matter (usually a gas) enters or leaves the system.</p>" +
        trap("Thinking that a change in the reading breaks the law. In an open system a gas can escape (mass goes down) or oxygen from the air can join in (mass goes up)."),
      key:"Mass is always conserved; a reading changes only when a gas escapes or joins from the air.", hint:"Is any gas made or used? Can it get in or out?" });
  });

  const ELNAME = el => ELN[el] || el;
  add("cons-count", "conservation", 1, ctx => {
    const eq = Kit.unique(ctx, EQNS.filter(e => e.c.some(c => c > 1)), eqKey), side = ri(0, 1), fs = side ? eq.p : eq.r, cs = side ? eq.c.slice(eq.r.length) : eq.c.slice(0, eq.r.length);
    const cnt = sideCount(fs, cs), cand = Object.keys(cnt).filter(el => fs.some((f, i) => parseFormula(f)[el] && (cs[i] > 1 || parseFormula(f)[el] > 1))), el = pick(cand.length ? cand : Object.keys(cnt)), ans = cnt[el];
    const noCoef = sideCount(fs, cs.map(() => 1))[el], coefOnly = fs.reduce((s, f, i) => s + (parseFormula(f)[el] ? cs[i] : 0), 0);
    const lines = fs.map((f, i) => { const k = parseFormula(f)[el]; return k ? cs[i] + " " + C(f) + ": " + cs[i] + " × " + k + " = " + cs[i] * k : ""; }).filter(Boolean);
    return { type:"num", promptHtml:"How many " + ELNAME(el) + " (" + el + ") atoms are on the <b>" + (side ? "product (right)" : "reactant (left)") + "</b> side of this equation?", exprHtml:disp(eqHtml(eq, eq.c)),
      answer:ans, tol:1e-9, answerHtml:String(ans), meta:{ kind:"count", key:eq.key, side, el, ans },
      workHtml:steps(lines.map(l => [l, ""]).concat([["Total " + el + " = <b>" + ans + "</b>", "Atoms = coefficient × subscript, added over every substance on that side."]])) +
        trap("Forgetting the coefficient, or forgetting that a number after a bracket multiplies everything inside it."),
      key:"Atoms of an element = coefficient × subscript, summed over the side.", hint:"For each substance containing " + el + ": coefficient × number of " + el + " in the formula.",
      mistakes:mk(ans, 1e-9, [[noCoef, "You forgot the coefficients. Multiply each formula's atoms by the number in front."], [coefOnly, "You forgot the subscripts. Multiply each coefficient by the number of " + el + " atoms in the formula."]]) };
  });

  add("cons-isbal", "conservation", 2, ctx => {
    const eq = Kit.unique(ctx, EQNS.filter(e => e.lv >= 2), eqKey), cf = eq.c.slice(), alter = ri(0, 1) === 1;
    if (alter) { const i = ri(0, cf.length - 1); cf[i] = cf[i] > 1 && ri(0, 1) ? cf[i] - 1 : cf[i] + 1; }
    const k = counts(eq, cf), els = elementsOf(eq), bad = els.filter(el => k.L[el] !== k.R[el]), good = els.filter(el => k.L[el] === k.R[el]), balanced = !bad.length;
    const opts = [], at = n => n + (n === 1 ? " atom" : " atoms");
    if (balanced) {
      opts.push({ html:"Yes: every element has the same number of atoms on both sides.", correct:true });
      shuffle(good.slice()).slice(0, 2).forEach(el => opts.push({ html:"No: " + el + " has " + at(k.L[el]) + " on the left but " + (k.L[el] + 1) + " on the right.", fb:"Count again: " + el + " has " + at(k.L[el]) + " on each side." }));
    } else {
      const el = bad[0];
      opts.push({ html:"No: " + el + " has " + at(k.L[el]) + " on the left but " + k.R[el] + " on the right.", correct:true });
      opts.push({ html:"Yes: every element has the same number of atoms on both sides.", fb:el + " has " + at(k.L[el]) + " on the left and " + k.R[el] + " on the right." });
      shuffle(good.slice()).slice(0, 1).forEach(g => opts.push({ html:"No: " + g + " has " + at(k.L[g]) + " on the left but " + (k.L[g] + 1) + " on the right.", fb:"Count again: " + g + " has " + at(k.L[g]) + " on each side." }));
    }
    const sumL = cf.slice(0, eq.r.length).reduce((s, v) => s + v, 0), sumR = cf.slice(eq.r.length).reduce((s, v) => s + v, 0);
    opts.push(balanced && sumL !== sumR
      ? { html:"No: there are " + sumL + " formula units on the left but " + sumR + " on the right.", fb:"The numbers of molecules (sum of coefficients) do not have to match. Only the atoms of each element must." }
      : balanced ? { html:"No: the substances on the left are different from the ones on the right.", fb:"Of course they are different: that is what a reaction does. Only the atoms of each element must match." }
      : { html:"Yes: the same elements appear on both sides.", fb:"Having the same elements is not enough: the number of atoms of each element must match too." });
    return Kit.mc({ promptHtml:"Count the atoms. Is this equation balanced?", exprHtml:disp(eqHtml(eq, cf, true)), options:opts, meta:{ kind:"isbal", key:eq.key, cf, balanced },
      workHtml:countTable(eq, cf) + (balanced ? "<p>Every element matches, so the equation is <b>balanced</b>.</p>" : "<p>" + bad.join(", ") + (bad.length > 1 ? " do" : " does") + " not match, so the equation is <b>not balanced</b>. The balanced version is " + eqHtml(eq, eq.c) + ".</p>") +
        trap("Comparing the number of molecules. A balanced equation can have different totals of coefficients on each side; only atoms are conserved."),
      key:"Balanced means every element has the same number of atoms on both sides.", hint:"Make a table: element, atoms on the left, atoms on the right." });
  });

  add("cons-data", "conservation", 2, () => {
    if (ri(0, 1)) {
      const g = pick(GAS_OUT), S = g.eq.all[g.s], G = g.eq.all[g.g], F = ri(9000, 22000), ms = ri(50, 500);
      const gm = Math.round(ms / 100 / molarMass(S) * g.eq.c[g.g] / g.eq.c[g.s] * molarMass(G) * 100);
      if (gm < 1) return null;
      const start = F + ms, end = start - gm, ans = gm / 100;
      return { type:"num", promptHtml:"Ravi adds " + (ms / 100).toFixed(2) + " g of " + g.what + " to excess hydrochloric acid in an <b>open</b> flask on a balance. The reading falls from <b>" + (start / 100).toFixed(2) + " g</b> to <b>" + (end / 100).toFixed(2) +
        " g</b> when the reaction stops. What mass of gas escaped?", exprHtml:disp(eqHtml(g.eq, g.eq.c)), answer:ans, tol:0.0051 / ans, suf:"g", answerHtml:ans.toFixed(2) + " g",
        meta:{ kind:"gasout", start, end, ans, ms, S, G, ratio:g.eq.c[g.g] / g.eq.c[g.s] },
        workHtml:steps([["Mass lost = " + (start / 100).toFixed(2) + " − " + (end / 100).toFixed(2) + " = <b>" + ans.toFixed(2) + " g</b>", "The only substance that can leave the open flask is the gas, " + C(G) + "."],
          ["Mass is still conserved: the " + C(G) + " molecules are now in the air.", "In a sealed flask the reading would not change."]]) +
          trap("Saying the law of conservation of mass does not apply. The 'missing' mass is the gas that escaped."),
        key:"In an open system, the mass lost equals the mass of gas that escaped.", hint:"What is the difference between the two readings?",
        mistakes:mk(ans, 0.0051 / ans, [[r2(start / 100 + end / 100), "Subtract the readings, don't add them."]]) };
    }
    const b = pick(BURN), Mt = b.eq.all[0], Ox = b.eq.all[2], Cc = ri(2000, 3500), mm = ri(20, 300);
    const ox = Math.round(mm / 100 / molarMass(Mt) * molarMass(Ox) * 100), before = Cc + mm, after = Cc + ox, ans = (after - before) / 100;
    return { type:"num", promptHtml:"Zoe heats " + b.what + " in a crucible with a lid, lifting the lid now and then. Crucible + lid: <b>" + (Cc / 100).toFixed(2) + " g</b>. With the metal: <b>" + (before / 100).toFixed(2) +
      " g</b>. After complete reaction: <b>" + (after / 100).toFixed(2) + " g</b>. What mass of oxygen combined with the metal?", exprHtml:disp(eqHtml(b.eq, b.eq.c)), answer:ans, tol:0.0051 / ans, suf:"g",
      answerHtml:ans.toFixed(2) + " g", meta:{ kind:"burn", before, after, ans, mm, Mt, Ox },
      workHtml:steps([["Mass gained = " + (after / 100).toFixed(2) + " − " + (before / 100).toFixed(2) + " = <b>" + ans.toFixed(2) + " g</b>", "The oxide weighs more than the metal because oxygen atoms from the air are now part of it."],
        ["Mass of oxide = " + (after / 100).toFixed(2) + " − " + (Cc / 100).toFixed(2) + " = " + (ox / 100).toFixed(2) + " g = " + (mm / 100).toFixed(2) + " g metal + " + ans.toFixed(2) + " g oxygen", "Mass is conserved once you count the oxygen."]]) +
        trap("Subtracting the empty crucible from the final reading: that gives the mass of the oxide, not of the oxygen."),
      key:"Metal + oxygen from the air → oxide, so the mass on the balance goes up by the mass of oxygen.", hint:"Compare the reading with the metal and the reading after heating.",
      mistakes:mk(ans, 0.0051 / ans, [[ox / 100, "That is the mass of the oxide. The oxygen is the increase: after − before."], [(after - Cc) / 100 + (before - Cc) / 100, "Find the difference between the readings before and after heating."]]) };
  });

  add("cons-gas", "conservation", 3, () => {
    const cb = pick(CARB), S = cb.eq.all[0], O = cb.eq.all[1], G = cb.eq.all[2], T = ri(1500, 2500), ms = ri(300, 900);
    const gm = Math.round(ms / 100 / molarMass(S) * molarMass(G) * 100), before = T + ms, after = before - gm;
    if (ri(0, 1)) {
      const dm = gm / 100, x = dm / molarMass(G), r = ans3(x, true);
      return { type:"num", promptHtml:"Leo heats " + nm(S) + " strongly in an open test tube until it has completely decomposed. Tube + solid before heating: <b>" + (before / 100).toFixed(2) + " g</b>. After heating: <b>" +
        (after / 100).toFixed(2) + " g</b>. How many moles of " + C(G) + " were given off? Give 3 significant figures." + amList([G]), exprHtml:disp(eqHtml(cb.eq, cb.eq.c)),
        answer:r.A, tol:r.tol, suf:"mol", answerHtml:r.s + " mol", meta:{ kind:"gasmol", before, after, G, S, ms, ans:r.A },
        workHtml:steps([["Mass of " + C(G) + " = " + (before / 100).toFixed(2) + " − " + (after / 100).toFixed(2) + " = " + dm.toFixed(2) + " g", "The only thing that leaves the tube is the gas, so the loss in mass is the mass of gas."],
          [mmLine(G), ""], ["n = " + dm.toFixed(2) + " g ÷ " + molarMass(G).toFixed(2) + " g/mol = " + long(x) + " mol", ""], ["Answer: <b>" + r.s + " mol</b>", ""]]) +
          trap("Dividing by the molar mass of the solid instead of the gas, or using a whole reading instead of the change in mass."),
        key:"Mass lost on heating = mass of gas released; then n = m ÷ M.", hint:"How much mass was lost? That is the gas.",
        mistakes:mk(r.A, r.tol, [[dm / molarMass(S), "You divided by the molar mass of " + C(S) + ". The gas is " + C(G) + "."], [(after / 100) / molarMass(G), "Use the change in mass, not the final reading."], [dm * molarMass(G), "Moles = mass ÷ molar mass, not mass × molar mass."]]) };
    }
    const ans = after / 100;
    return { type:"num", promptHtml:"A test tube containing " + (ms / 100).toFixed(2) + " g of " + nm(S) + " has a total mass of <b>" + (before / 100).toFixed(2) + " g</b>. It is heated in the open until the solid has completely decomposed. Predict the final reading on the balance, to 2 decimal places." +
      amList([S, G]), exprHtml:disp(eqHtml(cb.eq, cb.eq.c)), answer:ans, tol:0.0151 / ans, suf:"g", answerHtml:ans.toFixed(2) + " g", meta:{ kind:"gaspred", ms, before, S, G, ans },
      workHtml:steps([["n(" + C(S) + ") = " + (ms / 100).toFixed(2) + " g ÷ " + molarMass(S).toFixed(2) + " g/mol = " + long(ms / 100 / molarMass(S)) + " mol", mmLine(S)],
        ["n(" + C(G) + ") = n(" + C(S) + ") = " + long(ms / 100 / molarMass(S)) + " mol", "The ratio is 1 : 1."],
        ["m(" + C(G) + ") = " + long(ms / 100 / molarMass(S)) + " × " + molarMass(G).toFixed(2) + " = " + long(ms / 100 / molarMass(S) * molarMass(G)) + " g", mmLine(G)],
        ["Final reading = " + (before / 100).toFixed(2) + " − " + (gm / 100).toFixed(2) + " = <b>" + ans.toFixed(2) + " g</b>", "The gas escapes; the solid " + C(O) + " stays in the tube."]]) +
        trap("Subtracting the mass of the solid product. Only the gas leaves the open tube."),
      key:"Open system: final mass = starting mass − mass of gas that escapes.", hint:"Work out the mass of " + C(G) + " made, using moles and the 1 : 1 ratio.",
      mistakes:mk(ans, 0.0151 / ans, [[r2(before / 100 - ms / 100 / molarMass(S) * molarMass(O)), "You subtracted the mass of " + C(O) + ". That solid stays in the tube; only the gas escapes."],
        [before / 100, "The reading does change: the gas escapes from the open tube."]]) };
  });

  /* ---------- lessons ---------- */
  const LESSONS = [
    { title:"Significant figures", heading:"Significant figures show how precise a measurement is", html:`
<p>A measurement is only as good as the instrument that made it. <b>Significant figures</b> (s.f.) are the digits that carry real information: the certain digits plus the last, estimated one.</p>
<h3>Which digits count?</h3>
<div class="rule"><span class="name">Counting rules</span>
<p class="small">1. Nonzero digits always count: <b>4.56</b> has 3 s.f.<br>2. Zeros between nonzero digits count: <b>4.006</b> has 4 s.f.<br>3. Leading zeros never count. They only place the decimal point: <b>0.0072</b> has 2 s.f.<br>4. Zeros at the end count when there is a decimal point: <b>2.50</b> has 3 s.f. and <b>40.0</b> has 3 s.f.<br>5. In scientific notation, count only the number in front: <b>3.00 × 10<sup>5</sup></b> has 3 s.f.</p></div>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Number</th><th>s.f.</th><th>Why</th></tr></thead><tbody>
<tr><td class="num">0.00<mark>470</mark></td><td>3</td><td>Leading zeros do not count; the final zero after the point does.</td></tr>
<tr><td class="num"><mark>30.07</mark></td><td>4</td><td>Zeros between nonzero digits count.</td></tr>
<tr><td class="num"><mark>5.0</mark></td><td>2</td><td>The zero shows the reading was made to 0.1.</td></tr>
<tr><td class="num"><mark>6.02</mark> × 10<sup>23</sup></td><td>3</td><td>Only the number in front counts.</td></tr>
</tbody></table></div>
<p class="small muted">A whole number such as 1500 is unclear: the zeros may be placeholders. Write 1.5 × 10<sup>3</sup> (2 s.f.) or 1.500 × 10<sup>3</sup> (4 s.f.) to make it clear.</p>
<h3>Rounding answers to calculations</h3>
<div class="two">
<div class="rule"><span class="name">Multiply or divide</span><p class="small">Round to the <b>fewest significant figures</b> in the data.</p><p class="small">12.47 g ÷ 3.2 cm³ = 3.896… → <b>3.9 g/cm³</b> (3.2 has only 2 s.f.)</p></div>
<div class="rule"><span class="name">Add or subtract</span><p class="small">Round to the <b>fewest decimal places</b> in the data.</p><p class="small">52.3 g + 4.157 g = 56.457 g → <b>56.5 g</b> (52.3 has only 1 decimal place)</p></div>
</div>
<p>In a multi-step problem, keep every digit on your calculator and round only the final answer.</p>
<h3>Reading instruments</h3>
<p><b>Digital:</b> record every digit on the display, including a final zero. A 0.01 g balance showing 12.30 gives <b>12.30 g</b>, not 12.3 g.<br><b>Analog scale:</b> the uncertainty is usually half the smallest division. Record the reading to that same decimal place. A burette marked every 0.1 mL has an uncertainty of ±0.05 mL, so a reading looks like <b>23.45 mL</b>.</p>
<h3>Worked example: round 0.0045678 to 2 s.f.</h3>
<ol class="steps">
<li><div><div class="m">0.00<mark>45</mark>678</div><p class="why">Start at the first nonzero digit (4) and keep 2 digits.</p></div></li>
<li><div><div class="m">Next digit: 6</div><p class="why">6 is 5 or more, so round the 5 up to 6.</p></div></li>
<li><div><div class="m">0.0046</div><p class="why">The leading zeros stay to keep the size; they are not significant.</p></div></li>
</ol>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Copying every digit from the calculator. Using the s.f. rule when adding (that is the decimal-places rule). Dropping a significant final zero: 2.50 g and 2.5 g are different reports.</p></div>` },
    { title:"Scientific notation and units", heading:"Big and small numbers, and the units they come in", html:`
<p>Chemists deal with huge numbers (particles) and tiny ones (masses of single atoms). <b>Scientific notation</b> keeps them readable.</p>
<div class="rule"><span class="name">Scientific notation</span><div class="law">a × 10<sup>n</sup>, with 1 ≤ a &lt; 10</div>
<p class="small">The power n counts how many places the decimal point moves. Numbers of 10 or more get a positive power; numbers less than 1 get a negative power.</p></div>
<div class="two">
<div class="visual"><p class="small"><b>4 560 000</b> → point moves 6 places left → <b>4.56 × 10<sup>6</sup></b></p></div>
<div class="visual"><p class="small"><b>0.000 456</b> → point moves 4 places right → <b>4.56 × 10<sup>−4</sup></b></p></div>
</div>
<p>Multiplying: multiply the front numbers and <b>add</b> the powers. Dividing: divide the front numbers and <b>subtract</b> the powers. Then fix the front number so it is between 1 and 10: 14 × 10<sup>5</sup> = 1.4 × 10<sup>6</sup>.</p>
<h3>Metric units used in chemistry</h3>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Quantity</th><th>Key facts</th></tr></thead><tbody>
<tr><td>Mass</td><td>1 kg = 1000 g; 1 g = 1000 mg</td></tr>
<tr><td>Volume</td><td>1 L = 1000 mL; <b>1 cm³ = 1 mL</b>; <b>1 dm³ = 1 L</b> = 1000 cm³</td></tr>
<tr><td>Large volume</td><td>1 m³ = 1000 dm³ = 1000 L = 1 000 000 cm³</td></tr>
</tbody></table></div>
<div class="rule"><span class="name">Which way?</span><p class="small">Small unit → big unit: <b>divide</b> (fewer big units). Big unit → small unit: <b>multiply</b>. Volume units are lengths cubed, so the factor is cubed too: 1 m = 100 cm, so 1 m³ = 100<sup>3</sup> cm³ = 10<sup>6</sup> cm³.</p></div>
<h3>Worked example: 350 mg of salt in 250 mL. Concentration in g/L?</h3>
<ol class="steps">
<li><div><div class="m">350 mg ÷ 1000 = 0.350 g</div><p class="why">Small unit to big unit: divide.</p></div></li>
<li><div><div class="m">250 mL ÷ 1000 = 0.250 L</div><p class="why">Convert every quantity, not just one.</p></div></li>
<li><div><div class="m">0.350 g ÷ 0.250 L = 1.40 g/L</div><p class="why">Units check: g ÷ L = g/L.</p></div></li>
</ol>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Multiplying when you should divide (sense check: smaller unit means bigger number). Using 1000 for cm³ → m³ (it is 1 000 000). Leaving 23 × 10<sup>4</sup> as a final answer: the front number must be less than 10.</p></div>` },
    { title:"Moles", heading:"The mole counts particles by weighing them", html:`
<p>Atoms are far too small to count one by one, so chemists count them in huge batches called <b>moles</b>.</p>
<div class="rule"><span class="name">Avogadro's number</span><div class="law">1 mol = 6.02 × 10<sup>23</sup> particles</div>
<p class="small">In this topic we use N<sub>A</sub> = 6.02 × 10<sup>23</sup> mol<sup>−1</sup>. The particles can be atoms, molecules or formula units; the question tells you which.</p></div>
<div class="two">
<div class="rule"><span class="name">Particles and moles</span><div class="law">n = N ÷ N<sub>A</sub></div><p class="small">Moles → particles: × 6.02 × 10<sup>23</sup>. Particles → moles: ÷ 6.02 × 10<sup>23</sup>.</p></div>
<div class="rule"><span class="name">Mass and moles</span><div class="law">n = m ÷ M</div><p class="small">m in g, M (molar mass) in g/mol. Mass → moles: ÷ M. Moles → mass: × M.</p></div>
</div>
<h3>Molar mass from a formula</h3>
<p>Add the atomic masses of every atom in the formula. A subscript multiplies the atom just before it; a number after a bracket multiplies everything inside the bracket.</p>
<div class="visual"><p class="small">M(Ca(OH)<sub>2</sub>) = 40.08 + 2 × 16.00 + 2 × 1.01 = <b>74.10 g/mol</b><br>Atomic masses used: H 1.01, C 12.01, N 14.01, O 16.00, Na 22.99, Mg 24.31, Al 26.98, S 32.07, Cl 35.45, K 39.10, Ca 40.08, Fe 55.85, Cu 63.55, Zn 65.38.</p></div>
<h3>Worked example: 25.0 g of water</h3>
<ol class="steps">
<li><div><div class="m">M(H<sub>2</sub>O) = 2 × 1.01 + 16.00 = 18.02 g/mol</div><p class="why">Two hydrogen atoms and one oxygen atom.</p></div></li>
<li><div><div class="m">n = 25.0 g ÷ 18.02 g/mol = 1.387… mol ≈ 1.39 mol</div><p class="why">Grams ÷ grams per mole = moles.</p></div></li>
<li><div><div class="m">N = 1.387… × 6.02 × 10<sup>23</sup> = 8.35 × 10<sup>23</sup> molecules</div><p class="why">Use the unrounded moles, then round to 3 s.f.</p></div></li>
<li><div><div class="m">H atoms = 2 × 8.35 × 10<sup>23</sup> = 1.67 × 10<sup>24</sup></div><p class="why">Each molecule has 2 H atoms.</p></div></li>
</ol>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Multiplying mass by molar mass (check the units: you need g ÷ g/mol). Forgetting that one molecule can hold several atoms of an element. Ignoring the number after a bracket.</p></div>` },
    { title:"Balancing equations", heading:"Atoms are rearranged, never created or destroyed", html:`
<p>In a reaction, the atoms of the reactants are rearranged into the products. Every atom on the left must appear on the right, so a chemical equation must be <b>balanced</b>.</p>
<div class="rule"><span class="name">The one rule</span><div class="law">Change coefficients, never subscripts</div>
<p class="small">The coefficient (big number in front) counts how many units of a substance. A subscript is part of the formula: changing H<sub>2</sub>O to H<sub>2</sub>O<sub>2</sub> makes hydrogen peroxide, a different substance.</p></div>
<h3>A strategy that works</h3>
<p>1. Count the atoms of each element on both sides.<br>2. Balance an element that appears in only one substance on each side first.<br>3. Treat a group such as SO<sub>4</sub> or NO<sub>3</sub> as one unit if it appears unchanged on both sides.<br>4. Leave elements on their own (O<sub>2</sub>, H<sub>2</sub>, Fe) until last.<br>5. Check every element again, and make sure the coefficients cannot all be divided by the same number.</p>
<h3>Worked example: burning propane</h3>
<div class="display">C<sub>3</sub>H<sub>8</sub> + O<sub>2</sub> → CO<sub>2</sub> + H<sub>2</sub>O</div>
<ol class="steps">
<li><div><div class="m">C: 3 on the left → 3 CO<sub>2</sub></div><p class="why">Carbon first.</p></div></li>
<li><div><div class="m">H: 8 on the left → 4 H<sub>2</sub>O</div><p class="why">Each water has 2 H atoms.</p></div></li>
<li><div><div class="m">O on the right: 3 × 2 + 4 × 1 = 10 → 5 O<sub>2</sub></div><p class="why">Oxygen last, because O<sub>2</sub> contains nothing else.</p></div></li>
<li><div><div class="m">1 C<sub>3</sub>H<sub>8</sub> + 5 O<sub>2</sub> → 3 CO<sub>2</sub> + 4 H<sub>2</sub>O</div><p class="why">Check: C 3 = 3, H 8 = 8, O 10 = 10.</p></div></li>
</ol>
<p>If oxygen comes out as a half (ethane needs 3½ O<sub>2</sub>), double every coefficient: 2 C<sub>2</sub>H<sub>6</sub> + 7 O<sub>2</sub> → 4 CO<sub>2</sub> + 6 H<sub>2</sub>O.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Changing a subscript. Leaving a box empty instead of writing 1. Giving 4, 2, 4 when 2, 1, 2 works: always use the lowest whole-number ratio.</p></div>` },
    { title:"Mole ratios", heading:"Coefficients compare moles, not grams", html:`
<p>A balanced equation is a recipe in <b>moles</b>. In 2 H<sub>2</sub> + O<sub>2</sub> → 2 H<sub>2</sub>O, 2 mol of hydrogen react with 1 mol of oxygen to make 2 mol of water.</p>
<div class="rule"><span class="name">Mole ratio</span><div class="law">n(wanted) = n(given) × coefficient(wanted) ÷ coefficient(given)</div></div>
<div class="visual"><p class="small"><b>Road map:</b> grams of A → (÷ M<sub>A</sub>) → moles of A → (× ratio) → moles of B → (× M<sub>B</sub>) → grams of B</p></div>
<h3>Worked example: mass of water from 8.00 g of methane</h3>
<div class="display">CH<sub>4</sub> + 2 O<sub>2</sub> → CO<sub>2</sub> + 2 H<sub>2</sub>O</div>
<ol class="steps">
<li><div><div class="m">M(CH<sub>4</sub>) = 12.01 + 4 × 1.01 = 16.05 g/mol</div><p class="why">Molar mass from the formula.</p></div></li>
<li><div><div class="m">n(CH<sub>4</sub>) = 8.00 ÷ 16.05 = 0.4984 mol</div><p class="why">Grams → moles.</p></div></li>
<li><div><div class="m">n(H<sub>2</sub>O) = 0.4984 × 2/1 = 0.9969 mol</div><p class="why">Ratio CH<sub>4</sub> : H<sub>2</sub>O = 1 : 2.</p></div></li>
<li><div><div class="m">m(H<sub>2</sub>O) = 0.9969 × 18.02 = 17.96 g ≈ 18.0 g</div><p class="why">Moles → grams, then round to 3 s.f.</p></div></li>
</ol>
<h3>Limiting reactant</h3>
<p>If you know the amounts of two reactants, one usually runs out first. Divide each amount in moles by its coefficient: the <b>smallest</b> result is the limiting reactant, and all product calculations start from it.</p>
<div class="visual"><p class="small">4.00 g H<sub>2</sub> (1.980 mol) and 16.0 g O<sub>2</sub> (0.500 mol) in 2 H<sub>2</sub> + O<sub>2</sub> → 2 H<sub>2</sub>O.<br>H<sub>2</sub>: 1.980 ÷ 2 = 0.990; O<sub>2</sub>: 0.500 ÷ 1 = 0.500. Oxygen runs out first, so water = 2 × 0.500 = 1.00 mol = 18.0 g.</p></div>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Using the ratio on grams. Turning the ratio upside down (sense check: the substance with the bigger coefficient has more moles). Picking the reactant with the smaller mass as limiting without converting to moles.</p></div>` },
    { title:"Conservation of mass", heading:"Mass in equals mass out, if nothing escapes", html:`
<p>Atoms are not created or destroyed in a chemical reaction. So the total mass of the products always equals the total mass of the reactants.</p>
<div class="rule"><span class="name">Law of conservation of mass</span><div class="law">mass of reactants = mass of products</div>
<p class="small">This is why equations must be balanced: the same atoms appear on both sides.</p></div>
<h3>Closed and open systems</h3>
<div class="two">
<div class="rule"><span class="name">Closed system</span><p class="small">Nothing can enter or leave (a sealed flask). The balance reading stays the same, even if a gas forms.</p></div>
<div class="rule"><span class="name">Open system</span><p class="small">Gases can escape or come in from the air. If a gas is <b>produced</b> (CO<sub>2</sub>, H<sub>2</sub>), the reading goes <b>down</b>. If a gas from the air is <b>used</b> (O<sub>2</sub> when a metal burns), the reading goes <b>up</b>.</p></div>
</div>
<h3>Worked example: heating calcium carbonate</h3>
<div class="display">CaCO<sub>3</sub> → CaO + CO<sub>2</sub></div>
<ol class="steps">
<li><div><div class="m">10.00 g CaCO<sub>3</sub> → 5.60 g CaO + ? g CO<sub>2</sub></div><p class="why">All the calcium carbonate decomposes.</p></div></li>
<li><div><div class="m">? = 10.00 − 5.60 = 4.40 g</div><p class="why">Mass of reactants = mass of products.</p></div></li>
<li><div><div class="m">In an open tube the reading drops by 4.40 g</div><p class="why">The CO<sub>2</sub> escapes. Its mass has not vanished; it is in the air.</p></div></li>
</ol>
<h3>Checking an equation by counting atoms</h3>
<p>Atoms of an element = coefficient × subscript, added over every substance on that side. In 2 C<sub>2</sub>H<sub>6</sub> + 7 O<sub>2</sub>, the left side has 2 × 2 = 4 C, 2 × 6 = 12 H and 7 × 2 = 14 O.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Saying the law is broken when a reading changes (look for a gas entering or leaving). Thinking the oxide is lighter than the metal: burning adds oxygen atoms. Comparing numbers of molecules instead of atoms.</p></div>` }
  ];

  const T = {
    id:"stoichiometry", code:"S", year:10, subject:"Science", name:"Stoichiometry",
    blurb:"Significant figures, scientific notation and units, moles and Avogadro's number, balancing equations, mole ratios and conservation of mass.",
    levels:Kit.LEVELS3, defaultLevel:"M", lengths:[5, 10, 15, 20], defaultLen:10, defaultSecs:120,
    skills:{
      sigfigs:{ name:"Significant figures and measurement", short:"Significant figures", lesson:0 },
      units:{ name:"Scientific notation and unit conversions", short:"Notation and units", lesson:1 },
      moles:{ name:"Particles, moles and Avogadro's number", short:"Moles", lesson:2 },
      balancing:{ name:"Balancing chemical equations", short:"Balancing", lesson:3 },
      ratios:{ name:"Mole ratios and limiting reactants", short:"Mole ratios", lesson:4 },
      conservation:{ name:"Conservation of mass", short:"Conservation of mass", lesson:5 }
    },
    lessons:LESSONS,
    introHtml:`<h2>Six ideas that win marks</h2><p class="muted">Stoichiometry is counting atoms by weighing them. These habits pick up most of the marks on a test.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>Units on every line</h3><p class="small">Write g, mol and g/mol at each step. If the units cancel to what the question asks for, your method is right.</p></div>
<div class="habit"><span class="hn">2</span><h3>Moles in the middle</h3><p class="small">Grams never go straight to grams. Convert to moles, use the mole ratio, then convert back.</p></div>
<div class="habit"><span class="hn">3</span><h3>Divide by M for moles</h3><p class="small">n = m ÷ M and n = N ÷ 6.02 × 10<sup>23</sup>. If your number of moles is huge, you multiplied by mistake.</p></div>
<div class="habit"><span class="hn">4</span><h3>Coefficients, not subscripts</h3><p class="small">Balance with the numbers in front, in the lowest whole-number ratio. Changing a subscript changes the substance.</p></div>
<div class="habit"><span class="hn">5</span><h3>Round once, at the end</h3><p class="small">Keep calculator digits until the final answer, then round to the fewest significant figures in the data.</p></div>
<div class="habit"><span class="hn">6</span><h3>Open or closed?</h3><p class="small">Mass is always conserved. If a balance reading changes, a gas escaped or oxygen from the air joined in.</p></div>
</div>`,
    build(seed, len, lvl){
      seedRng(seed);
      return Kit.build(T, SAFE_POOL, len, lvl);
    }
  };
  /* A generator may return null to ask for a fresh attempt (rare edge cases). */
  const SAFE_POOL = POOL.map(g => Object.assign({}, g, { make(ctx){ for (let t = 0; t < 20; t++) { const q = g.make(ctx); if (q) return q; } return g.make(ctx); } }));
  /* Exposed for the self-check script only (tests/stoich-selfcheck.js). */
  T.check = { AM, RAW_EQ, EQNS, GAS_OUT, BURN, CARB, parseFormula, molarMass, eqOk, roundSF };
  registerTopic(T);
})();
