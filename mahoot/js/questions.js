/* ===== Question generators: helpers + Level 1–4 =====
   Each family makes a fresh question with random numbers. All randomness goes through rnd(),
   which is seeded per quiz so a quiz code always rebuilds the same questions. */
const R = String.raw;
let rnd = Math.random;
function seedRng(seed){
  let a = seed >>> 0;
  rnd = function(){ a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function seededRandom(){ return rnd(); }
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = arr => arr[Math.floor(rnd() * arr.length)];
function shuffle(arr){ for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
const LETTERS = ["a","b","g","h","k","m","n","p","q","r","s","t","u","w","x","y"];
const letters = k => shuffle(LETTERS.slice()).slice(0, k).sort();
const P = (v, e) => e === 1 ? v : v + "^{" + e + "}";
const par = n => n < 0 ? "(" + n + ")" : String(n);
const times = (b, n) => Array(n).fill(b).join(R`\times`);
function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }
function fracT(n, d, small){
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  if (d === 1) return String(n);
  return (n < 0 ? "-" : "") + (small ? R`\tfrac{` : R`\frac{`) + Math.abs(n) + "}{" + d + "}";
}
const expF = (m, n) => R`\frac{${m}}{${n}}`;
const rootT = (n, x) => n === 2 ? R`\sqrt{${x}}` : R`\sqrt[${n}]{${x}}`;
const rootWord = n => n === 2 ? "square root" : n === 3 ? "cube root" : n + "th root";

const FAMILIES = [];
const fam = f => FAMILIES.push(f);

/* L1: mixed laws on one letter */
fam({ id:"laws", level:"l1", skill:"laws", lesson:2, make(){
  const v = pick(["a","x","y","m","p","k","t","b"]);
  let p, q, r, s, e;
  do { p = ri(2,6); q = ri(2,5); r = ri(2,4); s = ri(1,9); e = p + q*r - s; } while (e < 2);
  const asFrac = rnd() < 0.5;
  return { type:"fields",
    prompt:R`Simplify. Write your answer as a single power of \(${v}\).`,
    tex: asFrac ? R`\dfrac{${P(v,p)}\times\left(${P(v,q)}\right)^{${r}}}{${P(v,s)}}` : R`${P(v,p)}\times\left(${P(v,q)}\right)^{${r}}\div ${P(v,s)}`,
    parts:[{v},{sup:"e"}], answer:{e},
    hint:"Do the bracket first. A power of a power means multiply the exponents.",
    mistakes:[
      {when:{e:p+q+r-s}, msg:R`You added the exponents in the bracket. \(\left(${P(v,q)}\right)^{${r}}\) is ${r} groups of ${q} copies, so \(${v}^{${q*r}}\), not \(${v}^{${q+r}}\).`},
      {when:{e:p+q*r+s}, msg:R`You added the ${s}. Dividing means you <b>subtract</b> the exponent.`},
      {when:{e:p+Math.pow(q,r)-s}, msg:R`You worked out \(${q}^{${r}}=${Math.pow(q,r)}\). For a power of a power, multiply the exponents: \(${q}\times${r}=${q*r}\).`}],
    steps:[
      {m:R`\left(${P(v,q)}\right)^{${r}}=${v}^{${q}\times${r}}=${v}^{${q*r}}`, why:"Brackets first. Power of a power: multiply the exponents."},
      {m:R`${P(v,p)}\times ${v}^{${q*r}}=${v}^{${p}+${q*r}}=${v}^{${p+q*r}}`, why:"Product law: same base, multiplying, so add."},
      {m:R`${v}^{${p+q*r}}\div ${v}^{${s}}=${v}^{${p+q*r}-${s}}=${P(v,e)}`, why:"Quotient law: dividing, so subtract."}],
    key:"Bracket: multiply. Times: add. Divide: subtract." };
}});

/* L1: multiply with coefficients, one letter cancels or nearly cancels */
fam({ id:"finish-mult", level:"l1", skill:"finish", lesson:1, make(){
  const [m, n] = letters(2);
  const c1 = ri(2,7), c2 = ri(2,6), a = ri(2,7), c = pick([1,1,2,3,4]), b = ri(1,5), d = pick([0,0,1,2,3]);
  const nb = b + d, me = a + c, k = c1 * c2;
  const steps = [
    {m:R`(${c1}\times${c2})\times(${P(m,a)}\times ${m}^{${c}})\times(${n}^{-${b}}\times ${n}^{${nb}})`, why:"Sort into piles: numbers, then each letter. You can multiply in any order."},
    {m:R`=${k}\times ${m}^{${a}+${c}}\times ${n}^{-${b}+${nb}}=${k}\,${m}^{${me}}\,${n}^{${d}}`, why:"Numbers multiply. Exponents of the same letter add."}];
  if (d === 0) steps.push({m:R`=${k}${P(m,me)}`, why:R`\(${n}^0=1\), and multiplying by 1 changes nothing, so \(${n}\) disappears.`});
  if (d === 1) steps.push({m:R`=${k}${P(m,me)}${n}`, why:R`\(${n}^1\) is written as \(${n}\).`});
  return { type:"fields",
    prompt:"Simplify fully. If a letter disappears, type 0 as its exponent.",
    tex:R`${c1}${P(m,a)}${n}^{-${b}}\times ${c2}${P(m,c)}${P(n,nb)}`,
    parts:[{c:"co"},{v:m},{sup:m},{v:n},{sup:n}], answer:{co:k, [m]:me, [n]:d},
    hint:R`Sort into piles: numbers, the \(${m}\)'s, the \(${n}\)'s.` + (c === 1 ? R` A lonely \(${m}\) is \(${m}^1\).` : ""),
    mistakes:[
      {when:{co:c1+c2}, msg:R`You added ${c1} and ${c2}. The numbers in front are <b>multiplied</b>: \(${c1}\times${c2}=${k}\).`},
      ...(c === 1 ? [{when:{[m]:a}, msg:R`The second \(${m}\) has an invisible exponent 1, so \(${P(m,a)}\times ${m}^{1}=${m}^{${me}}\).`}] : []),
      {when:{[m]:a*c}, msg:R`When you multiply powers you <b>add</b> the exponents: \(${a}+${c}=${me}\).`},
      {when:{[n]:-b*nb}, msg:R`Exponents are added, not multiplied: \(-${b}+${nb}=${d}\).`},
      {when:{[n]:b+nb}, msg:R`Watch the minus sign: \(-${b}+${nb}=${d}\).`}],
    steps, key:"Always finish the job: one number in front, each letter once." };
}});

/* L1: divide with coefficients */
fam({ id:"finish-div", level:"l1", skill:"finish", lesson:1, make(){
  const [x, y, z] = letters(3);
  const k = ri(2,6), dd = ri(2,6), C = k * dd, a = ri(4,9), e = ri(1,a-1), b = ri(2,6), c = ri(2,5);
  return { type:"fields",
    prompt:"Simplify fully. If a letter disappears, type 0 as its exponent.",
    tex:R`\dfrac{${C}${P(x,a)}${P(y,b)}${P(z,c)}}{${dd}${P(x,e)}${P(y,b)}${z}}`,
    parts:[{c:"co"},{v:x},{sup:x},{v:y},{sup:y},{v:z},{sup:z}], answer:{co:k, [x]:a-e, [y]:0, [z]:c-1},
    hint:"Divide the numbers, then go letter by letter: top exponent minus bottom exponent.",
    mistakes:[
      {when:{co:C-dd}, msg:R`You subtracted \(${C}-${dd}\). The numbers in front are <b>divided</b>: \(${C}\div${dd}=${k}\).`},
      ...(a % e === 0 ? [{when:{[x]:a/e}, msg:R`You divided ${a} by ${e}. When you divide powers you <b>subtract</b> exponents: \(${a}-${e}=${a-e}\).`}] : []),
      {when:{[y]:1}, msg:R`\(\frac{${P(y,b)}}{${P(y,b)}}=1\), so \(${y}\) disappears completely: exponent 0.`},
      {when:{[z]:c}, msg:R`The \(${z}\) at the bottom is \(${z}^1\), so you get \(${z}^{${c}-1}=${P(z,c-1)}\).`}],
    steps:[
      {m:R`\dfrac{${C}}{${dd}}\cdot\dfrac{${P(x,a)}}{${P(x,e)}}\cdot\dfrac{${P(y,b)}}{${P(y,b)}}\cdot\dfrac{${P(z,c)}}{${z}^{1}}`, why:"Split into piles, one for the numbers and one for each letter."},
      {m:R`=${k}\cdot ${x}^{${a}-${e}}\cdot ${y}^{${b}-${b}}\cdot ${z}^{${c}-1}`, why:"Divide the numbers. Subtract the exponents: top minus bottom."},
      {m:R`=${k}${P(x,a-e)}\,${y}^{0}\,${P(z,c-1)}=${k}${P(x,a-e)}${P(z,c-1)}`, why:R`\(${y}^0=1\), so \(${y}\) disappears. An exponent of 1 is not written.`}],
    key:"Divide the numbers, subtract the exponents." };
}});

/* L1: power of a product */
fam({ id:"bracket-power", level:"l1", skill:"laws", lesson:2, make(){
  const [x, y] = letters(2);
  const n = pick([2,2,3]), c = n === 2 ? ri(2,6) : ri(2,4), a = ri(1,5), b = ri(2,5), cn = Math.pow(c, n);
  return { type:"fields", prompt:"Expand the bracket and simplify.",
    tex:R`\left(${c}${P(x,a)}${P(y,b)}\right)^{${n}}`,
    parts:[{c:"co"},{v:x},{sup:x},{v:y},{sup:y}], answer:{co:cn, [x]:a*n, [y]:b*n},
    hint:R`Everything inside the bracket gets the power ${n}, including the number ${c}.`,
    mistakes:[
      {when:{co:c}, msg:R`The ${c} is inside the bracket, so it gets the power too: \(${c}^{${n}}=${cn}\).`},
      {when:{co:c*n}, msg:R`\(${c}^{${n}}=${times(c,n)}=${cn}\), not \(${c}\times${n}\).`},
      {when:{[x]:a+n}, msg:R`Power of a power: <b>multiply</b> the exponents. \(\left(${P(x,a)}\right)^{${n}}=${x}^{${a*n}}\).`},
      {when:{[y]:b+n}, msg:R`Power of a power: <b>multiply</b> the exponents. \(\left(${P(y,b)}\right)^{${n}}=${y}^{${b*n}}\).`}],
    steps:[
      {m:R`=${c}^{${n}}\times\left(${P(x,a)}\right)^{${n}}\times\left(${P(y,b)}\right)^{${n}}`, why:"Every factor inside the bracket gets the power."},
      {m:R`=${cn}\times ${x}^{${a}\times${n}}\times ${y}^{${b}\times${n}}`, why:"Power the number. Multiply the exponents."},
      {m:R`=${cn}${P(x,a*n)}${P(y,b*n)}`, why:"Tidy up."}],
    key:"Everything inside the bracket gets the power." };
}});

/* L1: value of a negative power (multiple choice) */
fam({ id:"neg-eval", level:"l1", skill:"neg", lesson:3, make(){
  let b, n; do { b = ri(2,6); n = ri(2,3); } while (Math.pow(b, n) > 216);
  const v = Math.pow(b, n);
  const all = [
    {tex:R`\tfrac{1}{${v}}`, correct:true},
    {tex:R`-${v}`, fb:R`A negative exponent does not make the answer negative. It means reciprocal: \(\frac{1}{${b}^{${n}}}\).`},
    {tex:R`-${b*n}`, fb:R`Two slips: \(${b}^{${n}}=${v}\) (not \(${b}\times${n}\)), and the minus sign means reciprocal, not negative.`},
    {tex:R`\tfrac{1}{${b*n}}`, fb:R`Right idea (reciprocal), but \(${b}^{${n}}=${v}\), not \(${b}\times${n}=${b*n}\).`},
    {tex:R`${v}`, fb:R`You ignored the minus sign. \(${b}^{-${n}}\) is smaller than 1.`}];
  const seen = new Set();
  const options = shuffle(all.filter(o => !seen.has(o.tex) && seen.add(o.tex)));
  return { type:"mc", prompt:"Which is the value of this number?", tex:R`${b}^{-${n}}`, options,
    hint:"Think of the halving staircase in Lesson 4. What happens below the power 0?",
    steps:[
      {m:R`${b}^{-${n}}=\dfrac{1}{${b}^{${n}}}`, why:"The minus in the exponent means: put it under 1 (take the reciprocal)."},
      {m:R`=\dfrac{1}{${v}}`, why:R`\(${b}^{${n}}=${times(b,n)}=${v}\).`},
      {m:R`${b}^{1}=${b},\quad ${b}^{0}=1,\quad ${b}^{-1}=\tfrac1{${b}},\quad ${b}^{-2}=\tfrac1{${b*b}}`, why:R`Check with the staircase: each step down the exponent divides by ${b}.`}],
    key:"Negative exponent = small number, never a negative number." };
}});

/* L1: fractional exponent of a perfect power */
const FRAC_TABLE = (() => {
  const t = [];
  for (let r = 2; r <= 12; r++) { t.push([r,2,1]); if (r <= 10) t.push([r,2,3]); }
  for (let r = 2; r <= 5; r++) { t.push([r,3,1], [r,3,2]); if (r <= 3) t.push([r,3,4]); }
  for (let r = 2; r <= 3; r++) t.push([r,4,1], [r,4,3]);
  t.push([2,5,1], [2,5,2], [2,5,3]);
  return t;
})();
fam({ id:"frac-eval", level:"l1", skill:"frac", lesson:4, make(){
  const [r, n, m] = pick(FRAC_TABLE), base = Math.pow(r, n), val = Math.pow(r, m);
  const mistakes = [{when:{v:base*m/n}, msg:R`You multiplied ${base} by \(${expF(m,n)}\). A fractional exponent means a root and a power, not a multiplication.`}];
  if (m > 1) mistakes.push(
    {when:{v:Math.pow(base, m)}, msg:R`That is \(${base}^{${m}}\). You forgot the ${rootWord(n)} (the ${n} at the bottom).`},
    {when:{v:r}, msg:R`Good root: \(${rootT(n,base)}=${r}\). Now raise it to the power ${m}: \(${r}^{${m}}=${val}\).`},
    {when:{v:r*m}, msg:R`\(${r}^{${m}}\) means ${m} copies of ${r} multiplied together, not \(${r}\times${m}\).`});
  return { type:"num", prompt:"Evaluate without a calculator.", tex:R`${base}^{${expF(m,n)}}`, answer:val,
    hint:"Bottom number = root, top number = power. Do the root first.", mistakes,
    steps: m === 1 ? [
      {m:R`${base}^{${expF(1,n)}}=${rootT(n,base)}`, why:R`A power of \(\frac{1}{${n}}\) means the ${rootWord(n)}.`},
      {m:R`=${r}`, why:R`Because \(${times(r,n)}=${base}\).`}] : [
      {m:R`${base}^{${expF(m,n)}}=\left(${rootT(n,base)}\right)^{${m}}`, why:R`The ${n} at the bottom is the ${rootWord(n)}. The ${m} on top is the power.`},
      {m:R`=${r}^{${m}}`, why:R`Root first: \(${rootT(n,base)}=${r}\) because \(${times(r,n)}=${base}\).`},
      {m:R`=${val}`, why:"Now the power. The numbers stayed small."}],
    key:"Root first, then the power." };
}});

/* L1: the power-0 trap */
fam({ id:"zero", level:"l1", skill:"finish", lesson:1, make(){
  const v = pick(["x","y","a","m","t"]), c = ri(2,9);
  if (rnd() < 0.6) return { type:"num", prompt:R`Evaluate. Assume \(${v}\ne0\).`,
    tex:R`\left(${c}${v}\right)^{0}+${c}${v}^{0}`, answer:1 + c,
    hint:"Look carefully at what the power 0 belongs to in each part.",
    mistakes:[
      {when:{v:0}, msg:R`Anything (except 0) to the power 0 is <b>1</b>, not 0.`},
      {when:{v:2}, msg:R`In \(${c}${v}^{0}\) only the \(${v}\) has the power 0. The ${c} stays: \(${c}\times1=${c}\).`},
      {when:{v:c}, msg:R`\(\left(${c}${v}\right)^{0}=1\), not 0. Everything in the bracket gets the power 0.`},
      {when:{v:1}, msg:R`\(${c}${v}^{0}=${c}\times1=${c}\), not 0.`}],
    steps:[
      {m:R`\left(${c}${v}\right)^{0}=1`, why:"The bracket means the whole thing is to the power 0."},
      {m:R`${c}${v}^{0}=${c}\times ${v}^{0}=${c}\times1=${c}`, why:R`Here the power 0 belongs only to \(${v}\).`},
      {m:R`1+${c}=${1+c}`, why:"Add the two parts."}],
    key:"A power belongs only to what it touches, unless there is a bracket." };
  return { type:"num", prompt:"Evaluate.",
    tex:R`\left(-${c}\right)^{0}-\left(-${c}^{0}\right)`, answer:2,
    hint:R`In \(-${c}^{0}\), does the power 0 belong to the minus sign?`,
    mistakes:[
      {when:{v:0}, msg:R`The two parts are different. \(-${c}^{0}\) means \(-\left(${c}^{0}\right)=-1\); only \(\left(-${c}\right)^{0}\) is \(+1\).`},
      {when:{v:-2}, msg:R`\(\left(-${c}\right)^{0}=+1\): with the bracket, the minus sign is included in the power 0.`},
      {when:{v:1}, msg:R`Anything (except 0) to the power 0 is 1, so \(-${c}^{0}=-1\), not 0.`}],
    steps:[
      {m:R`\left(-${c}\right)^{0}=1`, why:"The bracket includes the minus sign, so the whole of −" + c + " is to the power 0."},
      {m:R`-${c}^{0}=-\left(${c}^{0}\right)=-1`, why:R`Without a bracket the power only belongs to the ${c}. The minus sign stays outside.`},
      {m:R`1-\left(-1\right)=1+1=2`, why:"Subtracting a negative is adding."}],
    key:"A power belongs only to what it touches, unless there is a bracket." };
}});

/* ===== Question generators: Level 5–6 ===== */
function placeDecimal(D, k){
  if (k <= 0) return "0." + "0".repeat(-k) + D;
  if (k >= D.length) return D + "0".repeat(k - D.length);
  return D.slice(0, k) + "." + D.slice(k);
}

/* L5: rewrite a number in scientific notation */
fam({ id:"sci-convert", level:"l5", skill:"sci", lesson:6, make(){
  const len = ri(2,5);
  let D = String(ri(1,9)); for (let i = 1; i < len; i++) D += String(i === len - 1 ? ri(1,9) : ri(0,9));
  const e = ri(-6,8); let s; do { s = ri(-3,3); } while (s === 0);
  const mant = placeDecimal(D, 1), shown = placeDecimal(D, 1 + s), sp = e - s, plain = sp === 0;
  const k = Math.abs(s), pl = k === 1 ? "place" : "places", f = Math.pow(10, k).toLocaleString("en-US");
  return { type:"fields",
    prompt: plain ? "Write this number in scientific notation." : "Rewrite in scientific notation.",
    tex: plain ? shown : R`${shown}\times10^{${sp}}`,
    parts:[{c:"co", wide:true},{t:"× 10"},{sup:"n"}], answer:{co:Number(mant), n:e},
    note:"Decimals: a point or a comma both work (2.4 or 2,4).",
    hint:"Move the decimal point until exactly one non-zero digit is in front of it. Then balance the power of 10.",
    mistakes:[
      {when:{co:Number(mant), n:sp - s}, msg:R`The power moved the wrong way. The front number got ${s > 0 ? "smaller" : "bigger"}, so the power must go ${s > 0 ? "up" : "down"}.`},
      ...(plain ? [] : [{when:{co:Number(mant), n:sp}, msg:R`You moved the decimal point but kept the power the same. The value changed by a factor of ${f}, so the power must change by ${k}.`}])],
    steps:[
      {m:R`${shown}\;\to\;${mant}`, why:`Move the decimal point ${k} ${pl} to the ${s > 0 ? "left" : "right"} so exactly one non-zero digit is in front.`},
      {m:R`${shown}=${mant}\times10^{${s}}`, why:`The front number became ${f} times ${s > 0 ? "smaller" : "bigger"}, so multiply by \\(10^{${s}}\\) to keep the value the same.`},
      {m: plain ? R`=${mant}\times10^{${e}}` : R`${mant}\times10^{${s}}\times10^{${sp}}=${mant}\times10^{${s}+${par(sp)}}=${mant}\times10^{${e}}`, why: plain ? "Done: the front number is between 1 and 10." : "Product law for the powers of 10: add the exponents."}],
    key:"Front number down, power up (and the other way round)." };
}});

/* L5: multiply in scientific notation */
fam({ id:"sci-mult", level:"l5", skill:"sci", lesson:6, make(){
  const a = ri(2,9), b = ri(2,9), p = ri(-5,9), q = rnd() < 0.6 ? -ri(1,8) : ri(1,6);
  const prod = a * b, big = prod >= 10, m = big ? prod / 10 : prod, n = p + q + (big ? 1 : 0);
  const steps = [
    {m:R`(${a}\times${b})\times(10^{${p}}\times10^{${q}})`, why:"Group the numbers together and the powers of 10 together."},
    {m:R`=${prod}\times10^{${p}+${par(q)}}=${prod}\times10^{${p+q}}`, why:"Multiply the numbers. Product law for the powers of 10: add the exponents."}];
  if (big) steps.push({m:R`=${m}\times10^{1}\times10^{${p+q}}=${m}\times10^{${n}}`, why:`${prod} is not between 1 and 10. Make it 10 times smaller (${m}) and the power one bigger to balance.`});
  return { type:"fields", prompt:"Work it out and write the answer in scientific notation.",
    tex:R`(${a}\times10^{${p}})\times(${b}\times10^{${q}})`,
    parts:[{c:"co", wide:true},{t:"× 10"},{sup:"n"}], answer:{co:m, n},
    note:"Decimals: a point or a comma both work (2.4 or 2,4).",
    hint:"Multiply the front numbers, add the exponents of 10, then check the front number is between 1 and 10.",
    mistakes:[
      ...(big ? [
        {when:{co:prod, n:p + q}, msg:R`Right value, but not scientific notation: ${prod} is bigger than 10. Write \(${prod}=${m}\times10^{1}\) and add 1 to the exponent.`},
        {when:{co:m, n:p + q}, msg:R`You moved the decimal point but forgot the power. ${prod} to ${m} is 10 times smaller, so the power must go <b>up</b> by 1.`}] : []),
      {when:{n:p * q + (big ? 1 : 0)}, msg:R`For powers of 10 you <b>add</b> exponents when multiplying: \(${p}+${par(q)}=${p+q}\).`},
      {when:{co:a + b}, msg:R`The front numbers are multiplied: \(${a}\times${b}=${prod}\).`}],
    steps, key:"Numbers multiply, powers of 10 add, then tidy the front number." };
}});

/* L5: divide in scientific notation */
fam({ id:"sci-div", level:"l5", skill:"sci", lesson:6, make(){
  const b = pick([2,4,5,8]); let a; do { a = ri(1,9); } while (a === b);
  const p = ri(-4,9), q = rnd() < 0.5 ? -ri(1,6) : ri(1,6);
  const small = a < b, quot = a / b, m = small ? (a * 10) / b : quot, n = p - q - (small ? 1 : 0);
  const steps = [
    {m:R`\dfrac{${a}}{${b}}\times10^{${p}-${par(q)}}`, why:"Divide the numbers. Quotient law for the powers of 10: subtract the exponents."},
    {m:R`=${quot}\times10^{${p-q}}`, why: q < 0 ? "Subtracting a negative is adding." : "Top exponent minus bottom exponent."}];
  if (small) steps.push({m:R`=${m}\times10^{-1}\times10^{${p-q}}=${m}\times10^{${n}}`, why:`${quot} is less than 1. Make it 10 times bigger (${m}) and the power one smaller to balance.`});
  return { type:"fields", prompt:"Work it out and write the answer in scientific notation.",
    tex:R`\dfrac{${a}\times10^{${p}}}{${b}\times10^{${q}}}`,
    parts:[{c:"co", wide:true},{t:"× 10"},{sup:"n"}], answer:{co:m, n},
    note:"Decimals: a point or a comma both work (2.5 or 2,5).",
    hint:"Divide the front numbers, subtract the exponents of 10, then check the front number is between 1 and 10.",
    mistakes:[
      {when:{n:p + q - (small ? 1 : 0)}, msg:R`When you divide, <b>subtract</b> the exponents: \(${p}-${par(q)}=${p-q}\).`},
      ...(small ? [
        {when:{co:quot, n:p - q}, msg:R`Right value, but ${quot} is less than 1, so it is not scientific notation. Write it as \(${m}\times10^{-1}\).`},
        {when:{co:m, n:p - q}, msg:R`${quot} to ${m} is 10 times bigger, so the power must go <b>down</b> by 1.`}] : [])],
    steps, key:"Numbers divide, powers of 10 subtract, then tidy the front number." };
}});

/* L5: negative power of a fraction */
fam({ id:"neg-frac", level:"l5", skill:"neg", lesson:3, make(){
  let a, b, n; do { a = ri(2,6); b = ri(2,7); n = ri(1,3); } while (a === b || gcd(a,b) !== 1 || Math.pow(Math.max(a,b), n) > 343 || (n === 1 && rnd() < 0.7));
  const A = Math.pow(a, n), B = Math.pow(b, n);
  return { type:"num", prompt:"Evaluate. Give your answer as a fraction.",
    tex:R`\left(\dfrac{${a}}{${b}}\right)^{-${n}}`, answer:B / A, answerTex:fracT(B, A), note:"Type a fraction like 5/7.",
    hint:"A negative power of a fraction: flip the fraction and make the power positive.",
    mistakes:[
      {when:{v:A / B}, msg:R`You ignored the minus sign. Flip the fraction first: \(\left(\frac{${b}}{${a}}\right)^{${n}}\).`},
      {when:{v:-A / B}, msg:R`A negative exponent never makes the answer negative. It flips the fraction.`},
      {when:{v:-B / A}, msg:R`The numbers are right, but the answer is positive. The minus only means "flip".`},
      ...(n > 1 ? [{when:{v:b / a}, msg:R`Good flip. Now apply the power: \(\left(\frac{${b}}{${a}}\right)^{${n}}=\frac{${B}}{${A}}\).`}] : [])],
    steps:[
      {m:R`\left(\dfrac{${a}}{${b}}\right)^{-${n}}=\left(\dfrac{${b}}{${a}}\right)^{${n}}`, why:"Negative exponent on a fraction: flip it and make the exponent positive."},
      {m:R`=\dfrac{${b}^{${n}}}{${a}^{${n}}}=\dfrac{${B}}{${A}}`, why:"Apply the power to the top and the bottom."},
      {m:R`\left(\dfrac{${a}}{${b}}\right)^{-${n}}=\dfrac{1}{\left(\frac{${a}}{${b}}\right)^{${n}}}=\dfrac{1}{\frac{${A}}{${B}}}=\dfrac{${B}}{${A}}`, why:"Why flipping works: the reciprocal of a fraction is the fraction upside down."}],
    key:"Negative exponent on a fraction: flip it." };
}});

/* L5: negative fractional exponent */
fam({ id:"frac-neg-eval", level:"l5", skill:"frac", lesson:4, make(){
  const [r, n, m] = pick(FRAC_TABLE), base = Math.pow(r, n), val = Math.pow(r, m);
  return { type:"num", prompt:"Evaluate without a calculator. Type a fraction if needed.",
    tex:R`${base}^{-${expF(m,n)}}`, answer:1 / val, answerTex:fracT(1, val),
    hint:"Three jobs: the minus means reciprocal, the bottom number is the root, the top number is the power.",
    mistakes:[
      {when:{v:val}, msg:R`You lost the minus sign. It means reciprocal: \(\frac{1}{${val}}\).`},
      {when:{v:-val}, msg:R`A negative exponent gives a reciprocal, not a negative number.`},
      {when:{v:-1 / val}, msg:R`The answer is positive. The minus in the exponent only means "take the reciprocal".`},
      ...(m > 1 ? [{when:{v:1 / r}, msg:R`Good root and reciprocal. Now the power: \(${r}^{${m}}=${val}\), so \(\frac{1}{${val}}\).`}] : []),
      {when:{v:1 / Math.pow(base, m)}, msg:R`You forgot the ${rootWord(n)} (the ${n} at the bottom).`}],
    steps:[
      {m:R`${base}^{-${expF(m,n)}}=\dfrac{1}{${base}^{${expF(m,n)}}}`, why:"The minus means reciprocal. Deal with it first."},
      {m: m === 1 ? R`${base}^{${expF(1,n)}}=${rootT(n,base)}=${r}` : R`${base}^{${expF(m,n)}}=\left(${rootT(n,base)}\right)^{${m}}=${r}^{${m}}=${val}`, why: m === 1 ? R`A power of \(\frac{1}{${n}}\) is the ${rootWord(n)}.` : R`Root first: \(${rootT(n,base)}=${r}\), then the power.`},
      {m:R`=\dfrac{1}{${val}}`, why:"Put it back under the 1."}],
    key:"Minus: flip. Bottom: root. Top: power." };
}});

/* L5: root inside a bracket with negative powers */
fam({ id:"roots-bracket", level:"l5", skill:"roots", lesson:4, make(){
  const v = pick(["x","y","a","p","t"]), k = pick([2,2,3]), a = ri(1,4), b = k === 2 ? pick([2,4]) : 3;
  const num = k * a - 1, e = num * b / k, rt = k === 2 ? R`\sqrt{${v}}` : R`\sqrt[3]{${v}}`;
  return { type:"fields", prompt:R`Simplify. Write your answer as a single power of \(${v}\).`,
    tex:R`\left(${v}^{-${a}}\times ${rt}\right)^{-${b}}`,
    parts:[{v},{sup:"e"}], answer:{e},
    hint:R`First write \(${rt}\) as \(${v}^{\frac{1}{${k}}}\). Then add the exponents inside the bracket.`,
    mistakes:[
      {when:{e:a * b}, msg:R`You lost the \(${rt}\). It is \(${v}^{\frac{1}{${k}}}\), so inside the bracket you get \(${v}^{-${a}+\frac{1}{${k}}}\).`},
      {when:{e:-e}, msg:R`You lost a minus sign: \(\left(-\frac{${num}}{${k}}\right)\times(-${b})=+${e}\).`},
      {when:{e:(k * a + 1) * b / k}, msg:R`\(${rt}\) is \(${v}^{+\frac{1}{${k}}}\), not \(${v}^{-\frac{1}{${k}}}\).`},
      {when:{e:(a - k) * b}, msg:R`\(${rt}\) is \(${v}^{\frac{1}{${k}}}\), not \(${v}^{${k}}\). A root undoes a power.`}],
    steps:[
      {m:R`\left(${v}^{-${a}}\times ${v}^{\frac{1}{${k}}}\right)^{-${b}}`, why:"Root into exponent first. Then everything is just exponent arithmetic."},
      {m:R`=\left(${v}^{-${a}+\frac{1}{${k}}}\right)^{-${b}}=\left(${v}^{-\frac{${num}}{${k}}}\right)^{-${b}}`, why:R`Product law inside the bracket: \(-${a}+\frac{1}{${k}}=-\frac{${num}}{${k}}\).`},
      {m:R`=${v}^{\left(-\frac{${num}}{${k}}\right)\times(-${b})}=${P(v,e)}`, why:"Power of a power: multiply. Negative times negative is positive."}],
    key:"Roots into exponents first. Then it is just adding and multiplying." };
}});

/* L5: square roots of powers */
fam({ id:"roots-sum", level:"l5", skill:"roots", lesson:4, make(){
  const v = pick(["x","y","m","k"]); const a = 2 * ri(0,4) + 1, b = 2 * ri(0,4) + 1, c = ri(1,5);
  const h = (a + b) / 2, e = h + c;
  return { type:"fields", prompt:R`Simplify. Write your answer as a single power of \(${v}\).`,
    tex:R`\dfrac{\sqrt{${P(v,a)}}\times\sqrt{${P(v,b)}}}{${v}^{-${c}}}`,
    parts:[{v},{sup:"e"}], answer:{e},
    hint:R`Write each square root as a power with a half: \(\sqrt{${v}^{n}}=${v}^{\frac{n}{2}}\).`,
    mistakes:[
      {when:{e:a + b + c}, msg:R`A square root halves the exponent: \(\sqrt{${P(v,a)}}=${v}^{\frac{${a}}{2}}\).`},
      {when:{e:h - c}, msg:R`Dividing by \(${v}^{-${c}}\) means subtracting \(-${c}\), which is adding ${c}.`},
      {when:{e:a + b - c}, msg:R`Two slips: the roots halve the exponents, and subtracting \(-${c}\) is adding ${c}.`}],
    steps:[
      {m:R`\sqrt{${P(v,a)}}=${v}^{\frac{${a}}{2}},\qquad \sqrt{${P(v,b)}}=${v}^{\frac{${b}}{2}}`, why:"A square root is the power one half, so it halves the exponent."},
      {m:R`${v}^{\frac{${a}}{2}}\times ${v}^{\frac{${b}}{2}}=${v}^{\frac{${a}+${b}}{2}}=${P(v,h)}`, why:"Product law: add the exponents."},
      {m:R`\dfrac{${P(v,h)}}{${v}^{-${c}}}=${v}^{${h}-(-${c})}=${P(v,e)}`, why:"Quotient law. Subtracting a negative is adding."}],
    key:"Square root = power one half." };
}});

/* L5: quotient with negative exponents */
fam({ id:"neg-quot", level:"l5", skill:"neg", lesson:3, make(){
  const [x, y] = letters(2), c2 = ri(2,5), k = ri(2,5), c1 = c2 * k, p = ri(1,5), r = ri(p + 1, p + 5), q = ri(1,5), s = ri(1,4);
  return { type:"fields", prompt:"Simplify fully. Use positive exponents only.",
    tex:R`\dfrac{${c1}${x}^{-${p}}${P(y,q)}}{${c2}${x}^{-${r}}${y}^{-${s}}}`,
    parts:[{c:"co"},{v:x},{sup:x},{v:y},{sup:y}], answer:{co:k, [x]:r - p, [y]:q + s},
    hint:"Keep the negative exponents and use top minus bottom for each letter. Watch the double minus.",
    mistakes:[
      {when:{[x]:-p - r}, msg:R`For \(${x}\): top minus bottom is \(-${p}-(-${r})=-${p}+${r}=${r-p}\).`},
      {when:{[x]:p - r}, msg:R`It looks like you made the negative exponents positive without moving them. No move, no flip.`},
      {when:{[y]:q - s}, msg:R`For \(${y}\): \(${q}-(-${s})=${q}+${s}=${q+s}\). Subtracting a negative is adding.`},
      {when:{co:c1 - c2}, msg:R`The numbers are divided: \(${c1}\div${c2}=${k}\).`}],
    steps:[
      {m:R`\dfrac{${c1}}{${c2}}\cdot\dfrac{${x}^{-${p}}}{${x}^{-${r}}}\cdot\dfrac{${P(y,q)}}{${y}^{-${s}}}`, why:"Split into piles."},
      {m:R`=${k}\cdot ${x}^{-${p}-(-${r})}\cdot ${y}^{${q}-(-${s})}`, why:"Quotient law: top minus bottom, keeping the signs."},
      {m:R`=${k}${P(x,r-p)}${P(y,q+s)}`, why:"Subtracting a negative is adding."}],
    key:"Keep the exponents, subtract carefully. No move, no flip." };
}});

/* L5: negative power of a fraction with letters */
fam({ id:"neg-bracket", level:"l5", skill:"neg", lesson:3, make(){
  const [x, y] = letters(2), n = pick([2,2,3]), c = n === 2 ? ri(2,5) : ri(2,3), a = ri(1,4), b = ri(1,4), cn = Math.pow(c, n);
  return { type:"fields", prompt:"Simplify fully. Use positive exponents only.",
    tex:R`\left(\dfrac{${x}^{-${a}}}{${c}${P(y,b)}}\right)^{-${n}}`,
    parts:[{c:"co"},{v:x},{sup:x},{v:y},{sup:y}], answer:{co:cn, [x]:a * n, [y]:b * n},
    hint:"A negative power of a fraction: flip the fraction first, then give every factor the power.",
    mistakes:[
      {when:{co:c}, msg:R`The ${c} gets the power too: \(${c}^{${n}}=${cn}\).`},
      {when:{co:c * n}, msg:R`\(${c}^{${n}}=${times(c,n)}=${cn}\), not \(${c}\times${n}\).`},
      {when:{[x]:-a * n}, msg:R`\(\left(${x}^{-${a}}\right)^{-${n}}=${x}^{${a*n}}\): negative times negative is positive.`},
      {when:{[y]:b + n}, msg:R`Power of a power: multiply. \(\left(${P(y,b)}\right)^{${n}}=${y}^{${b*n}}\).`}],
    steps:[
      {m:R`=\left(\dfrac{${c}${P(y,b)}}{${x}^{-${a}}}\right)^{${n}}`, why:"Negative power of a fraction: flip it and make the power positive."},
      {m:R`=\dfrac{${c}^{${n}}${y}^{${b}\times${n}}}{${x}^{-${a}\times${n}}}=\dfrac{${cn}${P(y,b*n)}}{${x}^{-${a*n}}}`, why:"Every factor gets the power. Multiply the exponents."},
      {m:R`=${cn}${P(x,a*n)}${P(y,b*n)}`, why:R`\(${x}^{-${a*n}}\) crosses the fraction line, so its sign flips.`}],
    key:"Flip first, then power everything." };
}});

/* L5: find the first mistake in a worked solution */
fam({ id:"find-mistake", level:"l5", skill:"neg", lesson:3, make(){
  const [x, y] = letters(2), variant = pick([1,1,2,3]);
  const LABELS = ["Line 1","Line 2","Line 3","No mistake"];
  const opts = (ci, fbs) => LABELS.map((label, i) => i === ci ? {label, correct:true} : {label, fb:fbs[i]});
  const base = { type:"mc", prompt:R`A student simplified this expression. In which line is the <b>first</b> mistake?`,
    hint:"Check each line against the line before it. Watch the minus signs." };
  if (variant === 1) {
    const c2 = ri(2,5), k = ri(2,5), c1 = c2 * k, p = ri(1,4), r = ri(p + 1, p + 4), q = ri(2,6); let s; do { s = ri(1,4); } while (s === q);
    return Object.assign(base, {
      tex:R`\dfrac{${c1}${x}^{-${p}}${P(y,q)}}{${c2}${x}^{-${r}}${y}^{-${s}}}`,
      work:[R`=\dfrac{${c1}${P(x,p)}${P(y,q)}}{${c2}${P(x,r)}${P(y,s)}}`, R`=${k}${x}^{${p}-${r}}${y}^{${q}-${s}}`, R`=${k}${x}^{${p-r}}${P(y,q-s)}`],
      options:opts(0, [null, "Line 2 follows correctly from line 1. The problem starts earlier.", "Line 3 follows correctly from line 2. Look further up.", "Check the signs in line 1. Every factor stayed where it was, but its sign changed."]),
      steps:[
        {m:R`${x}^{-${p}}\to ${P(x,p)}\qquad ${x}^{-${r}}\to ${P(x,r)}\qquad ${y}^{-${s}}\to ${P(y,s)}`, why:"In line 1 the negative exponents became positive, but nothing moved across the fraction line. No move, no flip."},
        {m:R`\dfrac{${c1}}{${c2}}\cdot ${x}^{-${p}-(-${r})}\cdot ${y}^{${q}-(-${s})}`, why:"The safe method: keep the exponents and use the quotient law. Careful with the double minus."},
        {m:R`=${k}${P(x,r-p)}${P(y,q+s)}`, why:"This is the correct answer."}],
      key:"No move, no flip." });
  }
  const n = ri(2,3), p = ri(2,4), r = ri(1, p * n - 1), q = ri(1,5), s = ri(1,4), pn = p * n;
  const tex = R`\dfrac{\left(${P(x,p)}\right)^{${n}}${P(y,q)}}{${P(x,r)}${y}^{-${s}}}`;
  const line1 = R`=\dfrac{${x}^{${pn}}${P(y,q)}}{${P(x,r)}${y}^{-${s}}}`;
  if (variant === 2) return Object.assign(base, { tex,
    work:[line1, R`=${x}^{${pn}-${r}}${y}^{${q}-${s}}`, R`=${P(x,pn-r)}${y}^{${q-s}}`],
    options:opts(1, [R`Line 1 is correct: \(\left(${P(x,p)}\right)^{${n}}=${x}^{${pn}}\), multiply the exponents.`, null, "Line 3 follows correctly from line 2. Look further up.", R`Look at the \(${y}\) exponent in line 2. The bottom exponent is negative.`]),
    steps:[
      {m:R`${y}^{${q}-(-${s})}=${y}^{${q}+${s}}=${P(y,q+s)}`, why:R`In line 2 the student wrote \(${q}-${s}\), but the bottom exponent is \(-${s}\). Subtracting a negative is adding.`},
      {m:R`=${P(x,pn-r)}${P(y,q+s)}`, why:"This is the correct answer."}],
    key:"Subtracting a negative is adding." });
  return Object.assign(base, { tex,
    work:[line1, R`=${x}^{${pn}-${r}}${y}^{${q}-(-${s})}`, R`=${P(x,pn-r)}${P(y,q+s)}`],
    options:opts(3, [R`Line 1 is correct: \(\left(${P(x,p)}\right)^{${n}}=${x}^{${pn}}\).`, R`Line 2 is correct: top minus bottom, and the bottom exponent of \(${y}\) is \(-${s}\).`, R`Line 3 is correct: \(${q}-(-${s})=${q+s}\).`, null]),
    steps:[
      {m:R`\left(${P(x,p)}\right)^{${n}}=${x}^{${pn}}`, why:"Line 1: power of a power, multiply. Correct."},
      {m:R`${x}^{${pn}-${r}}\,${y}^{${q}-(-${s})}`, why:"Line 2: quotient law for each letter, keeping the minus signs. Correct."},
      {m:R`=${P(x,pn-r)}${P(y,q+s)}`, why:"Line 3: the arithmetic is right too. Sometimes there is no mistake, and spotting that is a skill too."}],
    key:"Check every line. Sometimes the work is right." });
}});

/* L5: big mixed question (roots, brackets, negatives, coefficients) */
fam({ id:"big-mixed", level:"l5", skill:"roots", lesson:7, make(){
  const [x, y] = letters(2), s = pick([2,3]), t = ri(1,3), c = s * s * t;
  const f = ri(2,4), g = pick([2,3]), a = ri(1, Math.min(6, f * g - 1));
  const b = ri(1,3), k = pick([1,2]), yTop = (2 * b - 1) * k, e = ri(1,5), xe = f * g - a, ye = yTop + e;
  return { type:"fields", prompt:"Simplify fully. Type 1 if there is no number in front.",
    tex:R`\dfrac{${c}\,${x}^{-${a}}\left(${y}^{-${b}}\times\sqrt{${y}}\right)^{-${2*k}}}{${s}^{2}\,${y}^{-${e}}\left(${x}^{-${f}}\right)^{${g}}}`,
    parts:[{c:"co"},{v:x},{sup:x},{v:y},{sup:y}], answer:{co:t, [x]:xe, [y]:ye},
    hint:"Order of attack: roots into exponents, remove brackets, then each pile (numbers, each letter) with top minus bottom.",
    mistakes:[
      {when:{[x]:-a - f * g}, msg:R`For \(${x}\): top minus bottom is \(-${a}-(-${f*g})=${xe}\). You subtracted ${f*g} instead of subtracting \(-${f*g}\).`},
      {when:{[y]:yTop - e}, msg:R`For \(${y}\): \(${yTop}-(-${e})=${yTop}+${e}=${ye}\). Watch the double minus.`},
      {when:{[y]:2 * b * k + e}, msg:R`You dropped the \(\sqrt{${y}}\). Inside the bracket \(${y}^{-${b}}\times ${y}^{\frac12}=${y}^{-\frac{${2*b-1}}{2}}\).`},
      {when:{[y]:-yTop + e}, msg:R`Check the bracket: a negative power of a negative power is positive, so it gives \(${y}^{${yTop}}\).`},
      ...(c % s === 0 ? [{when:{co:c / s}, msg:R`The bottom has \(${s}^2=${s*s}\), so the numbers give \(${c}\div${s*s}=${t}\).`}] : [])],
    steps:[
      {m:R`\dfrac{${c}\,${x}^{-${a}}\left(${y}^{-${b}}\times ${y}^{\frac12}\right)^{-${2*k}}}{${s*s}\,${y}^{-${e}}\,${x}^{-${f*g}}}`, why:R`Root into exponent: \(\sqrt{${y}}=${y}^{\frac12}\). On the bottom: \(${s}^2=${s*s}\) and \(\left(${x}^{-${f}}\right)^{${g}}=${x}^{-${f*g}}\).`},
      {m:R`\left(${y}^{-${b}}\times ${y}^{\frac12}\right)^{-${2*k}}=\left(${y}^{-\frac{${2*b-1}}{2}}\right)^{-${2*k}}=${P(y,yTop)}`, why:R`Inside the bracket add: \(-${b}+\frac12=-\frac{${2*b-1}}{2}\). Then multiply by \(-${2*k}\).`},
      {m:R`=\dfrac{${c}\,${x}^{-${a}}${P(y,yTop)}}{${s*s}\,${x}^{-${f*g}}${y}^{-${e}}}`, why:"Now each letter appears once on top and once on the bottom."},
      {m:R`=\dfrac{${c}}{${s*s}}\cdot ${x}^{-${a}-(-${f*g})}\cdot ${y}^{${yTop}-(-${e})}`, why:"Quotient law for each pile. No little fractions needed; just subtract."},
      {m:R`=${t === 1 ? "" : t}${P(x,xe)}${P(y,ye)}`, why: t === 1 ? "A 1 in front and an exponent of 1 are not written." : "Tidy up."}],
    key:"Keep the exponents until the very end." };
}});

/* ===== Question generators: Level 7–8 ===== */
const BASES = [[2,2],[2,3],[2,4],[3,2],[3,3],[5,2],[5,3]];

/* L7: same base, then a fractional (often negative) power */
fam({ id:"same-base-eval", level:"l7", skill:"base", lesson:5, make(){
  const [p, k] = pick(BASES), q = Math.pow(p, k), n = pick([2,2,3]), neg = rnd() < 0.75;
  let j, B, d, A; do { j = ri(1,2); B = ri(2,3); d = n * j; A = k * B + d; } while (A > 16 || Math.pow(p, j) > 25);
  const val = Math.pow(p, j), sg = neg ? "-" : "";
  const mistakes = neg ? [
      {when:{v:val}, msg:R`You lost the minus sign: \(${p}^{-${j}}=\frac{1}{${val}}\), not ${val}.`},
      {when:{v:-val}, msg:R`A negative exponent gives a reciprocal, not a negative number: \(${p}^{-${j}}=\frac{1}{${val}}\).`},
      {when:{v:1 / Math.pow(p, d)}, msg:R`The \(\frac{1}{${n}}\) means a ${rootWord(n)} too: \(\left(${p}^{${d}}\right)^{-\frac{1}{${n}}}=${p}^{-${j}}\).`},
      {when:{v:-1 / val}, msg:R`The answer is positive. The minus in the exponent only means "take the reciprocal".`}]
    : [{when:{v:Math.pow(p, d)}, msg:R`The \(\frac{1}{${n}}\) means a ${rootWord(n)}: \(\left(${p}^{${d}}\right)^{\frac{1}{${n}}}=${p}^{${j}}\).`},
       {when:{v:1 / val}, msg:R`There is no minus in the exponent this time, so there is no reciprocal.`}];
  const steps = [
    {m:R`${q}^{${B}}=\left(${p}^{${k}}\right)^{${B}}=${p}^{${k*B}}`, why:R`Same base: ${q} is \(${p}^{${k}}\). Power of a power: multiply.`},
    {m:R`\left(\dfrac{${p}^{${A}}}{${p}^{${k*B}}}\right)^{${sg}\frac{1}{${n}}}=\left(${P(p,d)}\right)^{${sg}\frac{1}{${n}}}`, why:R`Quotient law: \(${A}-${k*B}=${d}\).`},
    {m:R`=${p}^{${d}\times\left(${sg}\frac{1}{${n}}\right)}=${p}^{${neg ? -j : j}}`, why:"Power of a power: multiply the exponents."}];
  if (neg) steps.push({m:R`=\dfrac{1}{${P(p,j)}}=${fracT(1,val)}`, why:"Negative exponent: reciprocal."});
  else if (j > 1) steps.push({m:R`=${val}`, why:"Work out the small power."});
  return { type:"num", prompt:"Evaluate without a calculator. Type a fraction if needed.",
    tex:R`\left(\dfrac{${p}^{${A}}}{${q}^{${B}}}\right)^{${sg}\frac{1}{${n}}}`,
    answer: neg ? 1 / val : val, answerTex: neg ? fracT(1, val) : String(val),
    hint:R`Write ${q} as a power of ${p} first. Do not work out \(${p}^{${A}}\).`,
    mistakes, steps, key:"Same base first. Never work out the big powers." };
}});

/* L7: letters in the exponent that cancel */
const ALG = [{p:2,i:2,j:3},{p:2,i:1,j:2},{p:3,i:1,j:2},{p:3,i:2,j:3},{p:5,i:1,j:2}];
fam({ id:"alg-exp", level:"l7", skill:"base", lesson:5, make(){
  const {p, i, j} = pick(ALG), q = Math.pow(p, i), r = Math.pow(p, j), v = pick(["n","k","m"]);
  let c; do { c = ri(1,3); } while (Math.pow(p, i * c) > 729);
  const val = Math.pow(p, i * c), top = i === 1 ? `${v}+${c}` : `${i}${v}+${i*c}`;
  const check = Math.pow(q, 1 + c) * p / r;
  return { type:"num", prompt:R`Simplify to a single number. It works for every value of \(${v}\).`,
    tex:R`\dfrac{${q}^{${v}+${c}}\times ${p}^{${v}}}{${r}^{${v}}}`, answer:val,
    hint:R`Write everything as a power of ${p}` + (i > 1 ? R`: \(${q}=${p}^{${i}}\) and \(${r}=${p}^{${j}}\).` : R`: \(${r}=${p}^{${j}}\).`),
    mistakes:[
      ...(i > 1 ? [{when:{v:Math.pow(p, c)}, msg:R`Careful: \(\left(${p}^{${i}}\right)^{${v}+${c}}=${p}^{${top}}\). The ${i} multiplies the whole bracket, including the +${c}.`}] : []),
      {when:{v:1}, msg:R`The \(${v}\)'s cancel, but the number part of the exponent stays: \(${p}^{${i*c}}\).`},
      {when:{v:i * c}, msg:R`The exponent is ${i*c}, so the answer is \(${p}^{${i*c}}=${val}\).`}],
    steps:[
      {m: i > 1 ? R`\dfrac{\left(${p}^{${i}}\right)^{${v}+${c}}\times ${p}^{${v}}}{\left(${p}^{${j}}\right)^{${v}}}` : R`\dfrac{${p}^{${v}+${c}}\times ${p}^{${v}}}{\left(${p}^{${j}}\right)^{${v}}}`, why:R`Same base: write everything as a power of ${p}.`},
      {m:R`=\dfrac{${p}^{${top}}\times ${p}^{${v}}}{${p}^{${j}${v}}}`, why:"Power of a power: multiply the whole exponent."},
      {m:R`=${p}^{(${top})+${v}-${j}${v}}`, why:"Add for the multiplication, subtract for the division."},
      {m:R`=${p}^{${i*c}}=${val}`, why:R`The \(${v}\)'s cancel: \(${i === 1 ? "" : i}${v}+${v}-${j}${v}=0\). Check with \(${v}=1\): \(\frac{${q}^{${1+c}}\times${p}}{${r}}=${check}\).`}],
    key:"Letters in the exponent follow the same laws." };
}});

/* L7: exponential equation, same base */
const EQ = [{p:2,i:1,j:2},{p:2,i:2,j:3},{p:2,i:1,j:3},{p:2,i:3,j:4},{p:3,i:1,j:2},{p:3,i:2,j:3},{p:3,i:1,j:3},{p:5,i:1,j:2}];
fam({ id:"exp-eq", level:"l7", skill:"base", lesson:5, make(){
  const {p, i, j} = pick(EQ), q = Math.pow(p, i), r = Math.pow(p, j), c = ri(1,3), A = rnd() < 0.5;
  const I = i === 1 ? "" : String(i);
  const num = A ? j * c : i * c, den = j - i, ans = num / den;
  const tex = A ? R`${q}^{x}=${r}^{x-${c}}` : R`${q}^{x+${c}}=${r}^{x}`;
  const lhs = A ? `${I}x` : `${I}x+${i*c}`, rhs = A ? `${j}x-${j*c}` : `${j}x`;
  const rw = A ? (i === 1 ? R`${p}^{x}=\left(${p}^{${j}}\right)^{x-${c}}` : R`\left(${p}^{${i}}\right)^{x}=\left(${p}^{${j}}\right)^{x-${c}}`)
               : (i === 1 ? R`${p}^{x+${c}}=\left(${p}^{${j}}\right)^{x}` : R`\left(${p}^{${i}}\right)^{x+${c}}=\left(${p}^{${j}}\right)^{x}`);
  return { type:"num", prompt:R`Solve for \(x\).`, tex, answer:ans, answerTex:"x=" + fracT(num, den), prefix:"x",
    hint:R`Write both sides as powers of ${p}, then set the exponents equal.`,
    mistakes:[
      {when:{v:c / den}, msg: A ? R`\(\left(${p}^{${j}}\right)^{x-${c}}=${p}^{${j}x-${j*c}}\). Multiply the whole bracket by ${j}, not only the \(x\).`
                                : R`\(\left(${p}^{${i}}\right)^{x+${c}}=${p}^{${lhs}}\). Multiply the whole bracket by ${i}, not only the \(x\).`},
      {when:{v:-ans}, msg:R`Check the last step: from \(${lhs}=${rhs}\), collect the \(x\) terms carefully.`}],
    steps:[
      {m:rw, why:R`Same base: write both sides as powers of ${p}.`},
      {m:R`${p}^{${lhs}}=${p}^{${rhs}}`, why:"Power of a power: multiply out the brackets in the exponents."},
      {m:R`${lhs}=${rhs}`, why:"Same base on both sides, so the exponents must be equal."},
      {m:R`x=${fracT(num, den)}`, why:"Collect the x terms on one side and solve."}],
    key:"Same base on both sides: the exponents are equal." };
}});

/* L7: exponential equation with a reciprocal or a fractional answer */
fam({ id:"exp-eq-recip", level:"l7", skill:"base", lesson:5, make(){
  const p = pick([2,2,3]), i = p === 2 ? ri(1,3) : ri(1,2), t = ri(1, p === 2 ? 6 : 4), sg = rnd() < 0.6 ? -1 : 1;
  const q = Math.pow(p, i), w = Math.pow(p, t), I = i === 1 ? "" : String(i), ans = sg * t / i;
  const rhs = sg < 0 ? R`\dfrac{1}{${w}}` : String(w);
  return { type:"num", prompt:R`Solve for \(x\). Type a fraction if needed.`, tex:R`${q}^{x}=${rhs}`,
    answer:ans, answerTex:"x=" + fracT(sg * t, i), prefix:"x",
    hint:R`Write both sides as powers of ${p}.` + (sg < 0 ? R` Remember \(\frac{1}{${p}^{n}}=${p}^{-n}\).` : ""),
    mistakes:[
      {when:{v:-ans}, msg: sg < 0 ? R`\(\frac{1}{${w}}=${p}^{-${t}}\), so the answer is negative.` : R`The right side is ${w}, not \(\frac{1}{${w}}\), so the answer is positive.`},
      ...(i > 1 ? [{when:{v:sg * t}, msg:R`The left side is \(${p}^{${i}x}\), so \(${i}x=${sg * t}\). Divide by ${i}.`}] : []),
      ...(t !== i ? [{when:{v:sg * i / t}, msg:R`You divided the wrong way round: \(${i}x=${sg * t}\) gives \(x=${fracT(sg * t, i)}\).`}] : [])],
    steps:[
      {m: i === 1 ? R`${rhs}=${p}^{${sg * t}}` : R`${q}=${p}^{${i}},\qquad ${rhs}=${p}^{${sg * t}}`, why: sg < 0 ? R`Same base. A reciprocal is a negative power: \(\frac{1}{${p}^{${t}}}=${p}^{-${t}}\).` : R`Same base: both sides as powers of ${p}.`},
      {m:R`${p}^{${I}x}=${p}^{${sg * t}}`, why:"Rewrite the equation."},
      {m:R`${I}x=${sg * t}`, why:"Same base, so the exponents are equal."},
      {m:R`x=${fracT(sg * t, i)}`, why: i === 1 ? "Done." : R`Divide by ${i}.`}],
    key:"Reciprocal = negative power. Same base: exponents equal." };
}});

/* L7: fraction to a negative fractional power */
fam({ id:"frac-flip", level:"l7", skill:"frac", lesson:4, make(){
  const n = pick([2,2,3,4]);
  let u, v, m;
  do {
    if (n === 2) { u = ri(2,7); v = ri(2,7); m = pick([1,3]); }
    else if (n === 3) { u = ri(2,4); v = ri(2,4); m = pick([1,2]); }
    else { u = ri(2,3); v = ri(2,3); m = pick([1,3]); }
  } while (u === v || gcd(u, v) !== 1 || Math.pow(Math.max(u, v), m) > 343);
  const U = Math.pow(u, n), V = Math.pow(v, n), um = Math.pow(u, m), vm = Math.pow(v, m);
  return { type:"num", prompt:"Evaluate without a calculator. Give your answer as a fraction.",
    tex:R`\left(\dfrac{${U}}{${V}}\right)^{-${expF(m,n)}}`, answer:vm / um, answerTex:fracT(vm, um), note:"Type a fraction like 5/7.",
    hint:R`Three jobs: the minus flips, the ${n} is a ${rootWord(n)}, the ${m} is a power. Flip, then root, then power.`,
    mistakes:[
      {when:{v:um / vm}, msg:R`You forgot to flip. The minus sign turns it into \(\left(\frac{${V}}{${U}}\right)^{${expF(m,n)}}\).`},
      {when:{v:-vm / um}, msg:R`The minus in the exponent flips the fraction. It does not make the answer negative.`},
      {when:{v:-um / vm}, msg:R`The minus in the exponent flips the fraction. It does not make the answer negative.`},
      ...(m > 1 ? [{when:{v:v / u}, msg:R`Good flip and root. Now the power: \(\left(\frac{${v}}{${u}}\right)^{${m}}=\frac{${vm}}{${um}}\).`},
                   {when:{v:u / v}, msg:R`Root done. You still need to flip and apply the power ${m}.`}] : [])],
    steps:[
      {m:R`\left(\dfrac{${U}}{${V}}\right)^{-${expF(m,n)}}=\left(\dfrac{${V}}{${U}}\right)^{${expF(m,n)}}`, why:"Negative: flip the fraction."},
      {m: m === 1 ? R`=${rootT(n, R`\dfrac{${V}}{${U}}`)}` : R`=\left(${rootT(n, R`\dfrac{${V}}{${U}}`)}\right)^{${m}}`, why: m === 1 ? R`A power of \(\frac{1}{${n}}\) is the ${rootWord(n)}.` : R`Bottom ${n}: ${rootWord(n)}. Top ${m}: power.`},
      {m: m === 1 ? R`=\dfrac{${v}}{${u}}` : R`=\left(\dfrac{${v}}{${u}}\right)^{${m}}`, why:R`\(${v}^{${n}}=${V}\) and \(${u}^{${n}}=${U}\), so the ${rootWord(n)}s are ${v} and ${u}.`},
      ...(m === 1 ? [] : [{m:R`=${fracT(vm, um)}`, why:"Apply the power to the top and the bottom."}])],
    key:"Flip, root, power. In that order." };
}});

/* L7: fractional power of an algebraic fraction */
fam({ id:"frac-alg", level:"l7", skill:"frac", lesson:4, make(){
  const [x, y] = letters(2), n = pick([2,3]), k = n === 2 ? ri(2,5) : ri(2,3), m = n === 2 ? pick([1,3]) : pick([1,2]);
  const K = Math.pow(k, n), a = n * ri(1,4), b = n * ri(1,3), km = Math.pow(k, m), f = expF(m, n);
  return { type:"fields", prompt:"Simplify fully. Use positive exponents only.",
    tex:R`\left(\dfrac{${K}${P(x,a)}}{${y}^{-${b}}}\right)^{${f}}`,
    parts:[{c:"co"},{v:x},{sup:x},{v:y},{sup:y}], answer:{co:km, [x]:a * m / n, [y]:b * m / n},
    hint:R`First move \(${y}^{-${b}}\) up (its sign flips). Then every factor gets the power \(${f}\). Root first for the number.`,
    mistakes:[
      {when:{co:K * m / n}, msg:R`You multiplied ${K} by \(${f}\). For the number, take the ${rootWord(n)} and then the power: \(\left(${rootT(n,K)}\right)^{${m}}=${km}\).`},
      {when:{co:K}, msg:R`The ${K} is inside the bracket, so it gets the power \(${f}\) too.`},
      {when:{[y]:-b * m / n}, msg:R`\(${y}^{-${b}}\) is on the bottom with a negative exponent. Moving it up flips the sign, so it becomes \(${y}^{${b}}\).`},
      {when:{[x]:a * m}, msg:R`Multiply the exponent by the whole fraction \(${f}\), not just by ${m}.`}],
    steps:[
      {m:R`\dfrac{${K}${P(x,a)}}{${y}^{-${b}}}=${K}${P(x,a)}${P(y,b)}`, why:"The lift rule: the factor crosses the fraction line, so its sign flips."},
      {m:R`\left(${K}${P(x,a)}${P(y,b)}\right)^{${f}}=${K}^{${f}}\,${x}^{${a}\times${f}}\,${y}^{${b}\times${f}}`, why:"Every factor inside the bracket gets the power."},
      {m: m === 1 ? R`${K}^{${f}}=${rootT(n,K)}=${k}` : R`${K}^{${f}}=\left(${rootT(n,K)}\right)^{${m}}=${k}^{${m}}=${km}`, why: m === 1 ? R`A power of \(\frac{1}{${n}}\) is the ${rootWord(n)}.` : "Root first, then the power."},
      {m:R`=${km}${P(x,a*m/n)}${P(y,b*m/n)}`, why:"Multiply out the exponents."}],
    key:"Move first, then power everything. Root first for the number." };
}});

/* ===== Build a quiz from a seed ===== */
const LEVEL_MIX = { M:{l1:.4, l5:.35, l7:.25}, A:{l1:1}, B:{l5:1}, C:{l7:1} };
const LEVEL_LABELS = { l1:"Level 1–4", l5:"Level 5–6", l7:"Level 7–8" };
function sameVals(a, b){ return Object.keys(a).every(k => b[k] !== undefined && Math.abs(a[k] - b[k]) < 1e-9); }
function cleanMistakes(q){
  if (!q.mistakes) return q.mistakes;
  const ans = q.type === "num" ? {v:q.answer} : q.answer, kept = [];
  for (const m of q.mistakes) {
    if (Object.values(m.when).some(v => !isFinite(v))) continue;
    if (sameVals(m.when, ans) && Object.keys(m.when).every(k => k in ans) && Object.keys(ans).every(k => k in m.when)) continue;
    if (Object.keys(m.when).length < Object.keys(ans).length && Object.keys(m.when).every(k => Math.abs(m.when[k] - ans[k]) < 1e-9)) continue;
    if (kept.some(o => sameVals(o.when, m.when) && sameVals(m.when, o.when))) continue;
    kept.push(m);
  }
  return kept;
}
function buildQuiz(seed, len, lvl){
  seedRng(seed);
  const mix = LEVEL_MIX[lvl] || LEVEL_MIX.M, levels = Object.keys(mix), counts = {};
  let total = 0;
  levels.forEach(l => { counts[l] = Math.round(len * mix[l]); total += counts[l]; });
  counts[levels[levels.length - 1]] += len - total;
  const out = [];
  for (const l of ["l1","l5","l7"]) {
    if (!counts[l]) continue;
    const fams = FAMILIES.filter(f => f.level === l);
    let bag = [];
    for (let i = 0; i < counts[l]; i++) {
      if (!bag.length) bag = shuffle(fams.slice());
      const f = bag.pop(), q = f.make();
      Object.assign(q, { family:f.id, level:f.level, skill:f.skill, lesson:f.lesson });
      out.push(q);
    }
  }
  out.forEach((q, i) => { q.id = i + 1; q.mistakes = cleanMistakes(q); });
  return out;
}
/* Quiz codes: seed in base 36, then length and level letter, e.g. 7GK2QX-15M */
function makeCode(seed, len, lvl){ return seed.toString(36).toUpperCase() + "-" + len + lvl; }
function parseCode(code){
  const m = String(code || "").trim().toUpperCase().match(/^([0-9A-Z]{1,7})-(\d{1,2})([MABC])$/);
  if (!m) return null;
  const len = Number(m[2]);
  if (len < 1 || len > 30) return null;
  return { seed: parseInt(m[1], 36), len, lvl: m[3] };
}
const newSeed = () => Math.floor(Math.random() * 2176782336);
if (typeof module !== "undefined") module.exports = { FAMILIES, buildQuiz, makeCode, parseCode, seedRng };
