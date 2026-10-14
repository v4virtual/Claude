/* ===== Topic: Year 8 Math, Decimals =====
   Question engine moved from the standalone decimal quiz (decimal-quiz/index.html), unchanged except that it
   draws random numbers from seededRandom(), so a quiz code or battle room always rebuilds the same questions. */
/* Quiz engine: question generators with exact decimal arithmetic (scaled integers). No DOM. */
const DEC = (() => {
  const NAME = 'Sam';
  const rnd = (a, b) => a + Math.floor(seededRandom() * (b - a + 1));
  const pick = a => a[Math.floor(seededRandom() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(seededRandom() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const P10 = n => Math.pow(10, n);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // A decimal is {v, d}: the integer v divided by 10^d. 2.35 = {v: 235, d: 2}, -0.5 = {v: -5, d: 1}.
  const X = (v, d = 0) => ({ v, d });
  function fmt(v, d) {
    let s = String(Math.abs(v));
    if (d > 0) { s = s.padStart(d + 1, '0'); s = s.slice(0, -d) + '.' + s.slice(-d); }
    return (v < 0 ? '-' : '') + s;
  }
  const norm = x => { let { v, d } = x; while (d > 0 && v % 10 === 0) { v /= 10; d--; } return { v, d }; };
  const S = x => fmt(x.v, x.d);          // keeps every place, 2.70 stays 2.70
  const SN = x => S(norm(x));            // drops trailing zeros
  const V = x => x.v / P10(x.d);
  const padTo = (x, D) => ({ v: x.v * P10(D - x.d), d: D });
  const addX = (a, b) => { const d = Math.max(a.d, b.d); return { v: padTo(a, d).v + padTo(b, d).v, d }; };
  const subX = (a, b) => { const d = Math.max(a.d, b.d); return { v: padTo(a, d).v - padTo(b, d).v, d }; };
  const mulX = (a, b) => ({ v: a.v * b.v, d: a.d + b.d });
  const negX = x => ({ v: -x.v, d: x.d });
  const absX = x => ({ v: Math.abs(x.v), d: x.d });
  const same = (p, q) => Math.abs(p - q) < 1e-9 * Math.max(1, Math.abs(q));
  function rdec(min, max, d) {
    const lo = Math.round(min * P10(d)), hi = Math.round(max * P10(d));
    let v; do { v = rnd(lo, hi); } while (d > 0 && v % 10 === 0);
    return { v, d };
  }
  const priceX = (lo, hi) => X(rnd(lo * 10, hi * 10 - 1) * 10 + pick([5, 9]), 2);
  const money = x => S(padTo(norm(x), 2));
  const pl = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const minus = s => s.replace(/^-/, '−');
  const ptHTML = s => s.replace('.', '<span class="pt">.</span>');
  const N = s => `<span class="num">${ptHTML(minus(esc(s)))}</span>`;
  const NX = x => N(S(x));
  const NS = s => esc(s).replace(/-?\d*\.\d+|-?\d+/g, m => `<span class="num">${ptHTML(minus(m))}</span>`);
  const isNeg = n => typeof n === 'string' ? n[0] === '-' : n.v < 0;
  const exprHTML = (nums, op) => nums.map((n, i) => {
    const h = typeof n === 'string' ? N(n) : NX(n);
    return i && isNeg(n) ? `(${h})` : h;
  }).join(` <span class="op">${op}</span> `);
  const shortOf = (nums, op) => nums.map((n, i) => {
    const s = typeof n === 'string' ? n : S(n);
    return i && s[0] === '-' ? `(${s})` : s;
  }).join(` ${op} `);

  // Column working: decimal points in one highlighted column, filled-in zeros in pen blue.
  function column(rows, D, hl) {
    const sp = rows.map(r => { const [i, f = ''] = S(r.x).split('.'); return { i, f, pt: r.x.d > 0 }; });
    const W = Math.max(...sp.map(p => p.i.length));
    const hasSign = rows.some(r => r.sign);
    const widths = [];
    if (hasSign) widths.push('1.1em');
    for (let k = 0; k < W; k++) widths.push('0.95em');
    widths.push('0.55em');
    for (let k = 0; k < D; k++) widths.push('0.95em');
    let h = `<div class="col-wrap"><div class="col" style="--cols:${widths.join(' ')}" aria-hidden="true">`;
    rows.forEach((r, ri) => {
      const p = sp[ri], ip = p.i.padStart(W, ' ');
      let c = hasSign ? `<span class="c sg">${r.sign || ''}</span>` : '';
      for (let k = 0; k < W; k++) c += `<span class="c${hl === k ? ' hl' : ''}">${ip[k] === ' ' ? '' : ip[k] === '-' ? '−' : ip[k]}</span>`;
      c += `<span class="c pt${p.pt ? '' : ' add'}">.</span>`;
      for (let k = 0; k < D; k++) {
        const real = k < p.f.length;
        c += `<span class="c${real ? '' : ' add'}${hl === W + k ? ' hl' : ''}">${real ? p.f[k] : '0'}</span>`;
      }
      h += `<div class="row${r.cls ? ' ' + r.cls : ''}" style="--i:${ri}">${c}</div>`;
    });
    return h + '</div></div>';
  }
  const legend = (nums, D) => nums.some(n => n.d < D)
    ? '<p class="legend"><span class="sw">0</span> Blue zeros are the ones you write in. <span class="st"></span> The yellow stripe keeps the decimal points lined up.</p>'
    : '<p class="legend"><span class="st"></span> The yellow stripe keeps the decimal points lined up.</p>';
  const PLACE = ['tenths', 'hundredths', 'thousandths', 'ten-thousandths'];

  const LEVELS = [
    { name: 'Warm-up', desc: 'One or two decimal places and small numbers.' },
    { name: 'Core', desc: 'The Year 8 standard: up to three decimal places.' },
    { name: 'Stretch', desc: 'Three decimal places, bigger numbers, borrowing across zeros and dividing by decimals.' },
    { name: 'Challenge', desc: 'Four decimal places, longer sums, tiny decimals like 0.04 × 0.03 and two-step word problems.' },
    { name: 'Expert', desc: 'Negative decimals, comparing whole calculations and multi-step problems.' },
  ];
  const T = {
    compare: { name: 'Comparing', rule: 'Give both numbers the same number of decimal places, then compare from the left.' },
    order: { name: 'Ordering', rule: 'Pad every number to the same number of places, then compare place by place.' },
    add: { name: 'Adding', rule: 'Line up the decimal points, not the last digits.' },
    sub: { name: 'Subtracting', rule: 'Fill empty places with zeros, then borrow when the top digit is smaller.' },
    mul: { name: 'Multiplying', rule: 'Multiply without the points, then count the decimal places in the question.' },
    div: { name: 'Dividing', rule: 'Make the divisor a whole number by moving both decimal points the same way.' },
  };
  const SHIFT = {
    addsub: 'The digits are right, but the decimal point is in the wrong place. Line up the points in a column and bring the point straight down into the answer.',
    mul: 'The digits are right, but the decimal point is in the wrong place. Count the decimal places in the question again. The answer needs that many.',
    div: 'The digits are right, but the decimal point is in the wrong place. When you move the point in one number, move it the same way in the other.',
    pow: 'The digits are right, but they moved the wrong number of places. Count the zeros: 10 moves 1 place, 100 moves 2 places, 1000 moves 3 places.',
  };
  const NEG_RULE = 'With negative numbers, the one further from zero is the smaller one. Compare the sizes first, then flip.';

  /* ---------- Comparing ---------- */
  function qCompare(sub) {
    if (sub === 'expr') return qCompareExpr();
    let a, b, msg, neg = false;
    const LEN = 'More digits does not mean bigger. Give both numbers the same number of decimal places, then compare again.';
    const EQ = 'Zeros at the end of a decimal do not change its value. Is any digit actually different?';
    if (sub === 'len') {
      const x = rnd(0, 9), d = rnd(3, 9), e = rnd(1, d - 1), f = rnd(1, 9);
      a = X(x * 10 + d, 1); b = X(x * 100 + e * 10 + f, 2); msg = LEN;
    } else if (sub === 'len3') {
      const x = rnd(0, 20), d = rnd(3, 9), e = rnd(1, d - 1), f = rnd(0, 9), g = rnd(1, 9);
      a = X(x * 10 + d, 1); b = X(x * 1000 + e * 100 + f * 10 + g, 3); msg = LEN;
    } else if (sub === 'zero') {
      const x = rnd(0, 12), g = rnd(1, 9), f = rnd(1, 9);
      a = X(x * 100 + f, 2); b = X(x * 10 + g, 1);
      msg = 'Look at the tenths digit first. Write both numbers with two decimal places, then compare again.';
    } else if (sub === 'eq') {
      const x = rnd(0, 9), d = rnd(1, 9);
      if (seededRandom() < .5) { a = X(x * 10 + d, 1); b = X((x * 10 + d) * 10, 2); }
      else { const e = rnd(1, 9); a = X(x * 100 + d * 10 + e, 2); b = X((x * 100 + d * 10 + e) * 10, 3); }
      msg = EQ;
    } else if (sub === 'eq3') {
      a = rdec(1.01, 29.99, 2); const k = pick([1, 2]); b = X(a.v * P10(k), 2 + k); msg = EQ;
    } else if (sub === 'thou') {
      const x = rnd(0, 5), y = rnd(1, 8), z = rnd(1, 9), w = rnd(1, 9);
      a = X(x * 1000 + y * 100 + z, 3); b = X(x * 100 + y * 10 + w, 2);
      msg = 'Write both numbers with three decimal places, then compare one place at a time from the left.';
    } else if (sub === 'deep') {
      const x = rnd(0, 9), y = rnd(1, 9), z = rnd(1, 9), w = rnd(1, 9);
      a = X(x * 10000 + y * 100 + z, 4); b = X(x * 1000 + y * 10 + w, 3);
      msg = 'Write both numbers with four decimal places, then compare one place at a time from the left.';
    } else if (sub === 'mixed') {
      const W = rnd(10, 99), z = rnd(1, 9), y = rnd(0, 9), u = rnd(1, 9);
      a = X(W * 100 + z, 2); b = X((W - 1) * 1000 + 900 + y * 10 + u, 3);
      msg = 'Start with the whole-number part. When those are different, the digits after the point do not matter.';
    } else if (sub === 'neg') {
      const x = rnd(0, 5), d = rnd(3, 9), e = rnd(1, d - 1), f = rnd(1, 9);
      a = negX(X(x * 10 + d, 1)); b = negX(X(x * 100 + e * 10 + f, 2)); neg = true; msg = NEG_RULE;
    } else { // negmix
      const t = rnd(1, 9), x = rnd(0, 3);
      a = negX(X(x * 100 + t, 2)); b = negX(X(x * 10 + t, 1)); neg = true; msg = NEG_RULE;
    }
    if (seededRandom() < .5) [a, b] = [b, a];
    const ans = same(V(a), V(b)) ? '=' : V(a) < V(b) ? '<' : '>';
    const A = absX(a), B = absX(b);
    const D = Math.max(a.d, b.d);
    const [ai, af = ''] = S(A).split('.'), [bi, bf = ''] = S(B).split('.');
    const W = Math.max(ai.length, bi.length);
    const da = ai.padStart(W, '0') + af.padEnd(D, '0'), db = bi.padStart(W, '0') + bf.padEnd(D, '0');
    let idx = -1; for (let k = 0; k < da.length; k++) if (da[k] !== db[k]) { idx = k; break; }
    const place = idx < 0 ? '' : idx < W ? (W - 1 - idx === 0 ? 'ones' : 'tens') : PLACE[idx - W];
    let work;
    if (neg) {
      const far = V(A) > V(B) ? a : b;
      work = `<p>Both numbers are negative. First compare their sizes without the minus sign, written with ${pl(D, 'decimal place')}:</p>`
        + column([{ x: A }, { x: B }], D, idx) + legend([A, B], D)
        + `<p>The first digits that differ are in the <strong>${place}</strong> place, so ${NX(absX(far))} is the bigger size. For negatives that flips: ${NX(far)} is further from zero, so it is the <strong>smaller</strong> number.</p>`
        + `<p>${NX(a)} ${esc(ans)} ${NX(b)}</p>`;
    } else {
      const txt = idx < 0
        ? `Every digit matches, so ${NX(a)} = ${NX(b)}. Zeros at the end never change a number.`
        : `Compare from the left. The first digits that are different are in the <strong>${place}</strong> place: ${N(da[idx])} ${esc(da[idx] > db[idx] ? '>' : '<')} ${N(db[idx])}. So ${NX(a)} ${esc(ans)} ${NX(b)}.`;
      work = `<p>Write both numbers with ${pl(D, 'decimal place')}:</p>` + column([{ x: a }, { x: b }], D, idx < 0 ? -1 : idx) + legend([a, b], D) + `<p>${txt}</p>`;
    }
    return {
      topic: 'compare', kind: 'cmp', a: S(a), b: S(b), ans, cmpMsg: msg, work,
      text: 'Which sign goes in the box?',
      hint: neg ? 'Compare the sizes without the minus signs first. Then remember: for negatives, further from zero means smaller.'
        : 'Give both numbers the same number of decimal places first. For example, 0.5 becomes 0.50.',
      answerText: `${S(a)} ${ans} ${S(b)}`,
    };
  }
  function qCompareExpr() {
    const INV = { '0.2': X(5), '0.4': X(25, 1), '0.5': X(2), '0.8': X(125, 2), '0.25': X(4) };
    const variant = pick(['mulDiv', 'addMul', 'divTen']);
    let L, R, lv, rv, why;
    if (variant === 'mulDiv') {
      const p = rdec(0.2, 3.9, 1), q = pick([X(2, 1), X(4, 1), X(5, 1), X(8, 1), X(25, 2)]);
      L = `${S(p)} × ${S(q)}`; R = `${S(p)} ÷ ${S(q)}`; lv = mulX(p, q); rv = mulX(p, INV[S(q)]);
      why = `Multiplying by ${NX(q)}, which is less than 1, makes ${NX(p)} smaller. Dividing by it makes ${NX(p)} bigger.`;
    } else if (variant === 'addMul') {
      const p = X(rnd(2, 9), 1), q = X(rnd(2, 9), 1);
      L = `${S(p)} + ${S(q)}`; R = `${S(p)} × ${S(q)}`; lv = addX(p, q); rv = mulX(p, q);
      why = 'Multiplying two numbers that are less than 1 gives something even smaller, but adding them gives something bigger.';
    } else {
      const p = rdec(0.11, 9.99, 2), k = pick([1, 2]);
      L = `${S(p)} ÷ ${fmt(1, k)}`; R = `${S(p)} × ${P10(k)}`;
      lv = p.d >= k ? X(p.v, p.d - k) : X(p.v * P10(k - p.d), 0); rv = mulX(p, X(P10(k)));
      why = `Dividing by ${N(fmt(1, k))} is the same as multiplying by ${P10(k)}.`;
    }
    if (seededRandom() < .5) { [L, R] = [R, L]; [lv, rv] = [rv, lv]; }
    const ans = same(V(lv), V(rv)) ? '=' : V(lv) < V(rv) ? '<' : '>';
    const work = '<p>Work out each side before you compare.</p>'
      + `<p>${NS(L)} = ${N(SN(lv))}</p><p>${NS(R)} = ${N(SN(rv))}</p>`
      + `<p>So ${NS(L)} ${esc(ans)} ${NS(R)}. ${why}</p>`;
    return {
      topic: 'compare', kind: 'cmp', a: L, b: R, ans, work,
      cmpMsg: 'Work out each side before you compare. Multiplying by a number less than 1 makes it smaller; dividing by it makes it bigger.',
      text: 'Which sign goes in the box? Work out each side.',
      hint: 'Work out each side first. Multiplying by a number less than 1 makes it smaller; dividing by it makes it bigger.',
      answerText: `${L} ${ans} ${R}`,
    };
  }

  /* ---------- Ordering ---------- */
  function qOrder(sub) {
    let xs, dir = 'asc', neg = false;
    if (sub === 'mini') {
      const x = rnd(1, 9), t = rnd(2, 7);
      xs = [X(x * 10 + t, 1), X(x * 10 + t + 1, 1), X(x * 100 + t * 10 + 5, 2), X(x * 100 + t, 2)];
    } else if (sub === 'small') {
      const t = rnd(2, 9);
      xs = [X(t, 1), X(t, 2), X(t * 100 + t, 3), X(t * 11, 2)];
    } else if (sub === 'mixed') {
      const x = rnd(1, 9), t = rnd(2, 8), u = rnd(5, 9), v = rnd(1, 9);
      xs = [X(x * 100 + t, 2), X(x * 100 + (t - 1) * 10 + u, 2), X(x * 10 + t, 1), X(x * 1000 + t * 100 + v, 3), X(x * 100 + t * 10 + 5, 2)];
      if (seededRandom() < .5) dir = 'desc';
    } else if (sub === 'span') {
      const x = rnd(1, 8), t = rnd(2, 8), u = rnd(1, 9);
      xs = [X(x * 100 + 90 + u, 2), X((x + 1) * 100 + t, 2), X(x * 10 + t, 1), X(x + 1), X(x * 100 + 9, 2), X((x + 1) * 1000 + t * 100 + u, 3)];
      if (seededRandom() < .5) dir = 'desc';
    } else if (sub === 'deep') {
      const t = rnd(2, 9);
      xs = [X(t, 3), X(t, 2), X(t * 100 + t, 4), X(t * 11, 3), X(t, 1), X(t * 1000 + t, 4)];
      if (seededRandom() < .5) dir = 'desc';
    } else { // negs
      const t = rnd(2, 9);
      xs = [negX(X(t, 1)), negX(X(t, 2)), X(t, 2), negX(X(t * 11, 2)), X(t, 1), negX(X(t * 100 + t, 3))];
      neg = true; if (seededRandom() < .5) dir = 'desc';
    }
    const sorted = xs.slice().sort((p, q) => dir === 'asc' ? V(p) - V(q) : V(q) - V(p));
    let items; do { items = shuffle(xs); } while (items.every((x, i) => x === sorted[i]));
    const correct = sorted.map(x => items.indexOf(x));
    const sym = dir === 'asc' ? '<' : '>';
    const D = Math.max(...xs.map(x => x.d));
    const work = `<p>Write every number with ${pl(D, 'decimal place')}. Then compare from the left: whole numbers first, then tenths, then hundredths, and so on.</p>`
      + (neg ? '<p>Negative numbers are smaller than every positive number. Among the negatives, the one furthest from zero is the smallest.</p>' : '')
      + column(sorted.map(x => ({ x })), D) + legend(sorted, D)
      + `<p>${sorted.map(NX).join(` ${esc(sym)} `)}</p>`;
    const [w1, w2] = dir === 'asc' ? ['smallest', 'largest'] : ['largest', 'smallest'];
    return {
      topic: 'order', kind: 'order', dir, neg, items: items.map(S), correct, work,
      text: `Put these numbers in order from <strong>${w1}</strong> to <strong>${w2}</strong>. Tap them in order.`,
      hint: `Write every number with ${pl(D, 'decimal place')} in your head. For example, 0.6 becomes ${fmt(6 * P10(D - 1), D)}.`
        + (neg ? ' Negatives come before positives, and the negative furthest from zero is the smallest.' : ''),
      answerText: sorted.map(S).join(` ${sym} `),
    };
  }

  /* ---------- Adding ---------- */
  function qAdd(sub) {
    let nums, text = '', unit = {}, word = false, isMoney = false;
    switch (sub) {
      case 'easy': nums = [rdec(1.1, 9.9, 1), rdec(1.1, 9.9, 1)]; break;
      case 'mix': nums = [rdec(1.1, 9.9, 1), rdec(1.01, 9.99, 2)]; break;
      case 'whole': nums = [X(rnd(4, 30)), rdec(1.01, 9.99, 2)]; break;
      case 'three': nums = [rdec(0.1, 0.9, 1), rdec(1.01, 4.99, 2), rdec(0.101, 0.999, 3)]; break;
      case 'whole3': nums = [X(rnd(5, 60)), rdec(1.001, 9.999, 3)]; break;
      case 'three3': nums = [rdec(10.1, 99.9, 1), rdec(0.01, 0.99, 2), rdec(1.001, 9.999, 3)]; break;
      case 'mix23': nums = [rdec(10.01, 49.99, 2), rdec(1.001, 9.999, 3)]; break;
      case 'four': nums = [rdec(100.1, 199.9, 1), rdec(0.001, 0.099, 3), X(rnd(3, 9)), rdec(10.01, 29.99, 2)]; break;
      case 'deep4': nums = [rdec(0.0101, 0.0999, 4), rdec(0.101, 0.999, 3), rdec(1.01, 9.99, 2)]; break;
      case 'neg': {
        const p = rdec(1.1, 9.9, 1), m = rdec(1.01, 9.99, 2);
        nums = seededRandom() < .5 ? [negX(m), p] : [p, negX(m)]; break;
      }
      case 'run':
        nums = [rdec(1.5, 5.9, 1), rdec(1.05, 4.95, 2)]; word = true; unit = { suf: 'km' };
        text = `${NAME} runs ${NX(nums[0])} km on Monday and ${NX(nums[1])} km on Tuesday. How far does ${NAME} run altogether?`; break;
      case 'plant':
        nums = [rdec(10.1, 24.9, 1), rdec(0.15, 1.95, 2)]; word = true; unit = { suf: 'cm' };
        text = `A sunflower is ${NX(nums[0])} cm tall. In one week it grows ${NX(nums[1])} cm. How tall is it now?`; break;
      case 'run3':
        nums = [rdec(2.5, 6.9, 1), rdec(1.05, 4.95, 2), rdec(3.125, 8.875, 3)]; word = true; unit = { suf: 'km' };
        text = `${NAME} runs ${NX(nums[0])} km on Monday, ${NX(nums[1])} km on Wednesday and ${NX(nums[2])} km on Friday. How far is that altogether?`; break;
      default: // shop3
        nums = [priceX(5, 15), priceX(1, 4), priceX(0, 1)]; word = true; isMoney = true; unit = { pre: '€' };
        text = `${NAME} buys a book for ${N('€' + S(nums[0]))}, a pen for ${N('€' + S(nums[1]))} and an eraser for ${N('€' + S(nums[2]))}. How much is that altogether?`;
    }
    if (!word) nums = shuffle(nums);
    const res = nums.reduce(addX), D = Math.max(...nums.map(n => n.d));
    const calc = exprHTML(nums, '+');
    const ansStr = isMoney ? money(res) : SN(res);
    const hasNeg = nums.some(n => n.v < 0);
    const traps = [];
    let work = word ? `<p>The calculation is ${calc}.</p>` : '', hint;
    if (hasNeg) {
      const P = nums.find(n => n.v > 0), M = absX(nums.find(n => n.v < 0));
      const big = V(P) >= V(M) ? P : M, small = big === P ? M : P, diff = subX(big, small);
      work += `<p>One number is negative, so this works like a subtraction. Take the smaller size from the bigger one: ${NX(big)} − ${NX(small)}.</p>`
        + column([{ x: big }, { x: small, sign: '−' }, { x: diff, cls: 'res' }], diff.d) + legend([big, small], diff.d)
        + `<p>The answer takes the sign of the number further from zero, which is ${big === P ? `the positive ${NX(P)}` : `the negative ${NX(negX(M))}`}.</p>`
        + `<p>${calc} = ${N(ansStr)}</p>`;
      hint = 'One number is negative. Find the difference between the two sizes, then give it the sign of the number further from zero.';
    } else {
      const mis = X(nums.reduce((s, n) => s + n.v, 0), D);
      if (!same(V(mis), V(res))) {
        const whole = nums.find(n => n.d === 0);
        traps.push({ val: V(mis), msg: whole
          ? `A whole number has its decimal point at the end, so ${NX(whole)} = ${N(S(padTo(whole, D)))}. Line up the decimal points, then add again.`
          : 'It looks like the last digits were lined up instead of the decimal points. Line up the points, fill the gaps with zeros, then add again.' });
      }
      const est = nums.map(n => Math.round(V(n)));
      const estTxt = `about ${est.join(' + ')} = ${est.reduce((s, n) => s + n, 0)}`;
      const rows = nums.map((n, i) => ({ x: n, sign: i ? '+' : '' })).concat([{ x: res, cls: 'res' }]);
      work += '<p>Line up the decimal points and fill the gaps with zeros. Then add each column from the right.</p>'
        + column(rows, D) + legend(nums, D)
        + `<p>${calc} = ${N(S(res))}${S(res) !== ansStr ? ` = ${N(ansStr)}` : ''}</p>`
        + `<p>Estimate: ${estTxt}, so the answer makes sense ✓</p>`;
      hint = `Line up the decimal points. Estimate first: ${estTxt}.`;
    }
    return {
      topic: 'add', kind: 'num', word, text: word ? text : 'Work out', expr: word ? '' : calc,
      short: shortOf(nums, '+'), val: V(res), answer: ansStr, unit, traps, shiftMsg: SHIFT.addsub, hint, work,
    };
  }

  /* ---------- Subtracting ---------- */
  function noBorrow(a, b) {
    const d = Math.max(a.d, b.d); let A = padTo(a, d).v, B = padTo(b, d).v, r = 0, m = 1;
    while (A > 0 || B > 0) { r += Math.abs(A % 10 - B % 10) * m; A = Math.floor(A / 10); B = Math.floor(B / 10); m *= 10; }
    return X(r, d);
  }
  function qSub(sub) {
    let a, bs, text = '', unit = {}, word = false, isMoney = false;
    switch (sub) {
      case 'easy': a = rdec(5.1, 9.9, 1); bs = [rdec(1.1, V(a) - 1, 1)]; break;
      case 'whole1': { const w = rnd(3, 9); a = X(w); bs = [rdec(1.1, w - 0.5, 1)]; break; }
      case 'whole': { const w = rnd(3, 20); a = X(w); bs = [rdec(1.01, w - 0.51, 2)]; break; }
      case 'mix': a = rdec(5.1, 15.9, 1); bs = [rdec(1.01, V(a) - 1, 2)]; break;
      case 'thou': a = rdec(2.1, 9.9, 1); bs = [rdec(0.101, V(a) - 0.6, 3)]; break;
      case 'whole3': { const w = rnd(5, 30); a = X(w); bs = [rdec(1.001, w - 0.501, 3)]; break; }
      case 'zeros': { const h = rnd(1, 5); a = X(h * 10000 + rnd(1, 9), 2); bs = [rdec(10.1, h * 100 - 1, 1)]; break; }
      case 'deep4': { const w = rnd(20, 90); a = X(w * 1000 + rnd(1, 9), 3); bs = [rdec(10.0001, w - 1, 4)]; break; }
      case 'negres': a = rdec(1.1, 6.9, 1); bs = [rdec(V(a) + 0.51, V(a) + 6, 2)]; break;
      case 'change': {
        const w = pick([10, 20, 50]); a = X(w); bs = [priceX(Math.ceil(w * 0.3), w - 1)];
        word = true; isMoney = true; unit = { pre: '€' };
        text = `${NAME} has ${N('€' + w)} and buys a book for ${N('€' + S(bs[0]))}. How much change does ${NAME} get?`; break;
      }
      case 'change2': {
        const w = pick([20, 50]); a = X(w); bs = [priceX(Math.ceil(w * 0.2), Math.floor(w * 0.45)), priceX(1, Math.floor(w * 0.3))];
        word = true; isMoney = true; unit = { pre: '€' };
        text = `${NAME} has ${N('€' + w)}, buys a book for ${N('€' + S(bs[0]))} and a drink for ${N('€' + S(bs[1]))}. How much money is left?`; break;
      }
      case 'bottle':
        a = rdec(1.1, 2.9, 1); bs = [rdec(0.15, V(a) - 0.3, 2)]; word = true; unit = { suf: 'liters' };
        text = `A water bottle holds ${NX(a)} liters. ${NAME} drinks ${NX(bs[0])} liters. How much water is left?`; break;
      case 'bottle3':
        a = rdec(1.5, 3, 1); bs = [rdec(0.25, 0.75, 2), rdec(0.105, 0.495, 3)]; word = true; unit = { suf: 'liters' };
        text = `A jug holds ${NX(a)} liters of juice. ${NAME} pours out ${NX(bs[0])} liters, then another ${NX(bs[1])} liters. How much juice is left in the jug?`; break;
      default: // temp
        a = rdec(1.1, 6.9, 1); bs = [rdec(V(a) + 0.51, V(a) + 6, 2)]; word = true; unit = { suf: '°C' };
        text = `At 6 pm the temperature is ${NX(a)} °C. By midnight it has fallen by ${NX(bs[0])} °C. What is the temperature at midnight?`;
    }
    const b = bs.length === 1 ? bs[0] : bs.reduce(addX);
    const res = subX(a, b), D = Math.max(a.d, b.d);
    const calc = exprHTML([a, ...bs], '−');
    const ansStr = isMoney ? money(res) : SN(res);
    const traps = [];
    let work = word ? `<p>The calculation is ${calc}.</p>` : '', hint;
    if (bs.length > 1) {
      work += '<p>First add up everything that is taken away:</p>'
        + column(bs.map((x, i) => ({ x, sign: i ? '+' : '' })).concat([{ x: b, cls: 'res' }]), b.d) + legend(bs, b.d);
    }
    if (res.v < 0) {
      work += `<p>${NX(b)} is bigger than ${NX(a)}, so the answer is below zero. Take the smaller from the bigger:</p>`
        + column([{ x: b }, { x: a, sign: '−' }, { x: absX(res), cls: 'res' }], D) + legend([a, b], D)
        + `<p>Then make it negative: ${calc} = ${N(ansStr)}</p>`;
      hint = 'You are taking away more than you start with, so the answer is below zero. Subtract the smaller from the bigger, then make it negative.';
    } else {
      if (bs.length === 1) {
        if (a.d === 0) {
          const bw = Math.floor(b.v / P10(b.d)), bf = b.v % P10(b.d);
          const kf = X((a.v - bw) * P10(b.d) + bf, b.d);
          if (!same(V(kf), V(res))) traps.push({ val: V(kf), msg: `${NX(a)} has no digits after the point, but the places are still there. Write it as ${N(S(padTo(a, D)))}, then subtract every column.` });
        }
        const nb = noBorrow(a, b);
        if (!same(V(nb), V(res))) traps.push({ val: V(nb), msg: 'In at least one column the smaller digit was taken away from the bigger one. When the top digit is smaller, borrow 1 from the column to its left.' });
        if (a.v - b.v > 0) { const m = X(a.v - b.v, D); if (!same(V(m), V(res))) traps.push({ val: V(m), msg: 'Line up the decimal points, not the last digits. Then fill the gaps with zeros and subtract again.' }); }
      }
      work += (bs.length > 1 ? '<p>Then take that away from the start. Line up the points, fill the gaps with zeros, and borrow when the top digit is smaller.</p>'
        : '<p>Line up the decimal points and fill the gaps with zeros. Subtract from the right, and borrow when the top digit is smaller.</p>')
        + column([{ x: a }, { x: b, sign: '−' }, { x: res, cls: 'res' }], D) + legend([a, b], D)
        + `<p>${calc} = ${N(ansStr)}</p>`;
      const ea = Math.round(V(a)), eb = Math.round(V(b));
      hint = (a.d < D ? `Write ${NX(a)} as ${N(S(padTo(a, D)))} first. ` : '') + (bs.length > 1 ? 'Add up what is taken away first. ' : '') + `Estimate: about ${ea} − ${eb} = ${ea - eb}.`;
    }
    work += `<p>Check by adding back: ${N(ansStr)} + ${NX(b)} = ${N(isMoney ? money(a) : SN(a))} ✓</p>`;
    return {
      topic: 'sub', kind: 'num', word, text: word ? text : 'Work out', expr: word ? '' : calc,
      short: shortOf([a, ...bs], '−'), val: V(res), answer: ansStr, unit, traps, shiftMsg: SHIFT.addsub, hint, work,
    };
  }

  /* ---------- Multiplying ---------- */
  function qMul(sub) {
    let fs, text = '', unit = {}, word = false, isMoney = false, pow = 0, tenth = 0;
    switch (sub) {
      case 'byWhole1': fs = [rdec(1.1, 4.9, 1), X(rnd(2, 5))]; break;
      case 'pow1': pow = pick([1, 2]); fs = [rdec(0.1, 9.9, pick([1, 2])), X(P10(pow))]; break;
      case 'small': fs = [X(rnd(2, 9), 1), X(rnd(2, 9), 1)]; break;
      case 'byWhole': fs = [rdec(1.05, 9.95, 2), X(rnd(3, 9))]; break;
      case 'oneOne': fs = [rdec(1.1, 9.9, 1), X(rnd(2, 9), 1)]; break;
      case 'pow': pow = pick([1, 2, 3]); fs = [rdec(0.01, 9.99, pick([2, 3])), X(P10(pow))]; break;
      case 'twoOne': fs = [rdec(1.01, 9.99, 2), X(rnd(2, 9), 1)]; break;
      case 'tiny': fs = [X(rnd(2, 9), 2), X(rnd(2, 9), 2)]; break;
      case 'pointOne': tenth = pick([1, 2, 3]); fs = [rdec(1.1, 99.9, pick([1, 2])), X(1, tenth)]; break;
      case 'twoTwo': fs = [rdec(0.11, 0.99, 2), rdec(1.01, 4.99, 2)]; break;
      case 'bigSmall': fs = [rdec(10.5, 99.5, 1), X(rnd(2, 9), 2)]; break;
      case 'neg': {
        const p = rdec(0.2, 9.9, 1), q = X(rnd(2, 9), pick([1, 2])), mode = pick(['np', 'pn', 'nn']);
        fs = mode === 'np' ? [negX(p), q] : mode === 'pn' ? [p, negX(q)] : [negX(p), negX(q)]; break;
      }
      case 'three': fs = [X(rnd(2, 9), 1), X(rnd(2, 9), 1), rdec(1.1, 3.9, 1)]; break;
      case 'shop':
        fs = [priceX(1, 4), X(rnd(3, 6))]; word = true; isMoney = true; unit = { pre: '€' };
        text = `A notebook costs ${N('€' + S(fs[0]))}. ${NAME} buys ${fs[1].v} of them. How much does ${NAME} pay?`; break;
      case 'area':
        fs = [rdec(1.2, 4.8, 1), X(rnd(3, 9), 1)]; word = true; unit = { suf: 'm²' };
        text = `A vegetable bed is a rectangle ${NX(fs[0])} m long and ${NX(fs[1])} m wide. What is its area?`; break;
      case 'fabric':
        fs = [X(rnd(15, 99) * 10 + 5, 2), norm(X(rnd(3, 12) * 2, 1))]; word = true; isMoney = true; unit = { pre: '€' };
        text = `Fabric costs ${N('€' + S(fs[0]))} per meter. ${NAME} buys ${NX(fs[1])} m. How much does it cost?`; break;
      case 'fuel':
        fs = [X(rnd(4, 9), 2), rdec(12.5, 48.5, 1)]; word = true; unit = { suf: 'liters' };
        text = `A scooter uses ${NX(fs[0])} liters of fuel for every kilometer. How much fuel does it use on a ${NX(fs[1])} km trip?`; break;
      default: // area2
        fs = [rdec(2.05, 9.95, 2), rdec(1.1, 4.9, 1)]; word = true; unit = { suf: 'm²' };
        text = `A rectangular garden is ${NX(fs[0])} m long and ${NX(fs[1])} m wide. What is its area?`;
    }
    const res = fs.reduce(mulX);
    const ansStr = isMoney ? money(res) : SN(res);
    const calc = exprHTML(fs, '×');
    let work = word ? `<p>The calculation is ${calc}.</p>` : '';
    let hint, shiftMsg = SHIFT.mul;
    if (pow) {
      work += `<p>× ${P10(pow)} makes the number ${P10(pow)} times bigger, so every digit moves <strong>${pl(pow, 'place')} to the left</strong>.</p>`
        + `<p>${calc} = ${N(ansStr)}</p>`
        + (fs[0].d < pow ? `<p>There are not enough digits after the point, so write ${pl(pow - fs[0].d, 'zero')} at the end.</p>` : '');
      hint = `${P10(pow)} has ${pl(pow, 'zero')}, so the digits move ${pl(pow, 'place')}. Bigger or smaller?`;
      shiftMsg = SHIFT.pow;
    } else if (tenth) {
      work += `<p>× ${N(fmt(1, tenth))} is the same as ÷ ${P10(tenth)}, so the number gets smaller and every digit moves <strong>${pl(tenth, 'place')} to the right</strong>.</p>`
        + `<p>${calc} = ${N(ansStr)}</p>`
        + (String(Math.floor(fs[0].v / P10(fs[0].d))).length <= tenth ? '<p>When the digits run out, write zeros in front, after the decimal point.</p>' : '');
      hint = `Multiplying by ${N(fmt(1, tenth))} is the same as dividing by ${P10(tenth)}.`;
      shiftMsg = SHIFT.pow;
    } else {
      const A = fs.map(absX), prod = A.reduce((s, f) => s * f.v, 1), places = res.d;
      const negs = fs.filter(f => f.v < 0).length;
      const placeList = fs.filter(f => f.d > 0).map(f => `${NX(absX(f))} has ${pl(f.d, 'decimal place')}`).join(', ');
      work += `<p>Ignore the decimal points${negs ? ' and the signs' : ''} and multiply: ${A.map(f => N(String(f.v))).join(' <span class="op">×</span> ')} = ${N(String(prod))}</p>`
        + `<p>Count the decimal places in the question: ${placeList}. That makes <strong>${places}</strong>.</p>`
        + `<p>Give the answer ${pl(places, 'decimal place')}: ${N(String(prod))} becomes ${N(S(absX(res)))}.`
        + (String(prod).length <= places ? ' When you run out of digits, write zeros in front.' : '')
        + (S(absX(res)) !== SN(absX(res)) && !isMoney ? ` The zero at the end can go: ${N(SN(absX(res)))}.` : '') + '</p>';
      if (negs) work += `<p>Now the sign: ${negs === 1 ? 'one negative number makes the answer negative' : 'a negative times a negative is positive'}. ${calc} = ${N(ansStr)}</p>`;
      else if (fs.length === 2 && V(fs[1]) < 1) work += `<p>Sense check: multiplying by ${NX(fs[1])}, which is less than 1, makes the answer smaller than ${NX(fs[0])} ✓</p>`;
      else if (fs.length === 2 && V(fs[0]) < 1) work += `<p>Sense check: multiplying by ${NX(fs[0])}, which is less than 1, makes the answer smaller than ${NX(fs[1])} ✓</p>`;
      else if (fs.length === 2) {
        const e0 = Math.max(1, Math.round(V(fs[0]))), e1 = Math.max(1, Math.round(V(fs[1])));
        work += `<p>Estimate: about ${e0} × ${e1} = ${e0 * e1}, so ${N(ansStr)} makes sense ✓</p>`;
      }
      hint = `Work out ${A.map(f => N(String(f.v))).join(' × ')} without the points, then count the decimal places in the question.`
        + (negs ? ' Sort out the sign at the end.' : '');
    }
    return {
      topic: 'mul', kind: 'num', word, text: word ? text : 'Work out', expr: word ? '' : calc,
      short: shortOf(fs, '×'), val: V(res), answer: ansStr, unit, traps: [], shiftMsg, hint, work,
    };
  }

  /* ---------- Dividing ---------- */
  function divWork(a, b, q, aShown) {
    const A = absX(a), B = absX(b), Qa = absX(q);
    const hasNeg = a.v < 0 || b.v < 0;
    let h = hasNeg ? '<p>Divide the sizes first, then sort out the sign.</p>' : '';
    let A2 = A;
    if (B.d > 0) {
      const m = P10(B.d);
      A2 = A.d >= B.d ? X(A.v, A.d - B.d) : X(A.v * P10(B.d - A.d), 0);
      h += `<p>${NX(B)} is a decimal, so make it whole first: ${NX(B)} × ${m} = ${N(String(B.v))}</p>`
        + `<p>Multiply the other number by ${m} too, so the answer stays the same: ${aShown ? N(aShown) : NX(A)} × ${m} = ${N(SN(A2))}</p>`;
    } else {
      h += '<p>The divisor is a whole number, so divide as normal and keep the decimal point in the same place.</p>';
    }
    const D = Math.max(norm(A2).d, norm(Qa).d);
    const aP = padTo(norm(A2), D), qP = padTo(norm(Qa), D);
    h += `<p>${N(SN(A2))} ÷ ${N(String(B.v))} = ${N(SN(Qa))}`
      + (D > 0 ? ` (think ${N(String(aP.v))} ÷ ${N(String(B.v))} = ${N(String(qP.v))}, then put the point back)` : '') + '</p>';
    if (hasNeg) {
      const negAns = (a.v < 0) !== (b.v < 0);
      h += `<p>Now the sign: ${negAns ? 'a negative and a positive give a negative answer' : 'a negative divided by a negative is positive'}, so the answer is ${N(SN(q))}.</p>`;
    }
    h += `<p>Check: ${N(SN(q))} × ${b.v < 0 ? `(${NX(b)})` : NX(b)} = ${aShown ? N(aShown) : NX(a)} ✓`
      + (B.d > 0 && V(B) < 1 ? ' Dividing by a number less than 1 gives a bigger answer.' : '') + '</p>';
    return h;
  }
  function qDiv(sub) {
    let a, b, q, text = '', unit = {}, word = false, isMoney = false, pow = 0;
    const exactBy = (makeQ, w) => { let qq, aa; for (let i = 0; i < 80; i++) { qq = makeQ(); aa = mulX(qq, X(w)); if (norm(aa).d === qq.d) break; } return [qq, norm(aa)]; };
    switch (sub) {
      case 'byWhole1': b = X(rnd(2, 5)); [q, a] = exactBy(() => rdec(1.1, 4.9, 1), b.v); break;
      case 'byWhole': b = X(rnd(2, 9)); [q, a] = exactBy(() => seededRandom() < .6 ? rdec(1.1, 9.9, 1) : rdec(0.11, 2.99, 2), b.v); break;
      case 'byWhole2': b = X(rnd(6, 12)); [q, a] = exactBy(() => rdec(0.11, 1.99, 2), b.v); break;
      case 'pow1': pow = pick([1, 2]); break;
      case 'pow': pow = pick([1, 2, 3]); break;
      case 'byDec':
        b = X(rnd(2, 9), pick([1, 2])); q = X(rnd(2, 12) * (b.d === 2 && seededRandom() < .5 ? 10 : 1)); a = norm(mulX(q, b)); break;
      case 'decDec': b = rdec(0.11, 0.99, 2); q = rdec(1.1, 9.9, 1); a = norm(mulX(q, b)); break;
      case 'byPointOne': { const k = pick([1, 2]); b = X(1, k); a = rdec(0.1, 9.9, pick([1, 2])); q = norm(a.d >= k ? X(a.v, a.d - k) : X(a.v * P10(k - a.d), 0)); break; }
      case 'deepDec': b = X(rnd(2, 9), 2); q = rdec(0.11, 0.99, 2); a = norm(mulX(q, b)); break;
      case 'byHalf': b = pick([X(15, 1), X(25, 1), X(25, 2), X(75, 2), X(12, 1)]); q = rdec(1.1, 9.9, 1); a = norm(mulX(q, b)); break;
      case 'neg': {
        b = X(rnd(2, 9), pick([1, 2])); q = X(rnd(2, 12) * (b.d === 2 && seededRandom() < .5 ? 10 : 1)); a = norm(mulX(q, b));
        const mode = pick(['np', 'pn', 'nn']);
        if (mode !== 'pn') a = negX(a);
        if (mode !== 'np') b = negX(b);
        if (mode !== 'nn') q = negX(q);
        break;
      }
      case 'share': {
        const k = rnd(3, 5); q = priceX(2, 8); b = X(k); a = mulX(q, b);
        word = true; isMoney = true; unit = { pre: '€' };
        text = `${NAME} and ${k - 1} friends share a pizza bill of ${N('€' + money(a))} equally. How much does each person pay?`; break;
      }
      case 'ribbon':
        b = X(pick([15, 25, 35, 45, 55, 65, 75, 85]), 2); q = X(rnd(4, 12)); a = norm(mulX(q, b)); word = true; unit = { suf: 'pieces' };
        text = `A ribbon is ${NX(a)} m long. ${NAME} cuts it into pieces that are each ${NX(b)} m long. How many pieces does ${NAME} get?`; break;
      case 'unit':
        b = pick([X(5, 1), X(15, 1), X(25, 1)]); q = X(rnd(60, 450) * 2, 2); a = norm(mulX(q, b)); word = true; isMoney = true; unit = { pre: '€' };
        text = `A ${S(b)} kg bag of rice costs ${N('€' + money(a))}. What is the price for 1 kg?`; break;
      case 'glasses':
        b = X(pick([15, 25, 33, 35, 45]), 2); q = X(rnd(5, 14)); a = norm(mulX(q, b)); word = true; unit = { suf: 'glasses' };
        text = `A jug holds ${NX(a)} liters of water. How many glasses holding ${NX(b)} liters each can ${NAME} fill from it?`; break;
      default: // speed
        b = pick([X(15, 1), X(25, 1), X(75, 2), X(5, 1)]); q = rdec(8.5, 24.5, 1); a = norm(mulX(q, b)); word = true; unit = { suf: 'km/h' };
        text = `${NAME} cycles ${NX(a)} km in ${NX(b)} hours. What is ${NAME}'s average speed in km per hour?`;
    }
    let work, hint, shiftMsg = SHIFT.div, aStr, bStr;
    if (pow) {
      a = rdec(1, 999, pick([0, 1])); b = X(P10(pow)); q = norm(X(a.v, a.d + pow));
      aStr = S(a); bStr = S(b);
      work = `<p>÷ ${P10(pow)} makes the number ${P10(pow)} times smaller, so every digit moves <strong>${pl(pow, 'place')} to the right</strong>.</p>`
        + (a.d === 0 ? `<p>${NX(a)} is a whole number, so its decimal point is at the end: ${NX(a)} = ${N(S(a) + '.0')}</p>` : '')
        + `<p>${NX(a)} ÷ ${P10(pow)} = ${N(SN(q))}</p>`
        + (String(a.v).length <= a.d + pow ? '<p>When the digits run out, write a zero in front of the decimal point.</p>' : '');
      hint = `${P10(pow)} has ${pl(pow, 'zero')}, so the digits move ${pl(pow, 'place')}. Bigger or smaller?`;
      shiftMsg = SHIFT.pow;
    } else {
      aStr = isMoney ? money(a) : S(a); bStr = S(b);
      work = (word ? `<p>The calculation is ${exprHTML([aStr, bStr], '÷')}.</p>` : '') + divWork(a, b, q, isMoney ? aStr : '');
      const B = absX(b);
      hint = (B.d > 0 ? `Multiply both numbers by ${P10(B.d)} so that you divide by a whole number.` : 'Divide as normal and keep the decimal point in the same place.')
        + (a.v < 0 || b.v < 0 ? ' Work out the sign at the end.' : '');
    }
    const ansStr = isMoney ? money(q) : SN(q);
    return {
      topic: 'div', kind: 'num', word, text: word ? text : 'Work out', expr: word ? '' : exprHTML([aStr, bStr], '÷'),
      short: shortOf([aStr, bStr], '÷'), val: V(q), answer: ansStr, unit, traps: [], shiftMsg, hint, work,
    };
  }

  const SUBS = {
    compare: { 1: ['len', 'zero', 'eq'], 2: ['len', 'zero', 'eq', 'thou'], 3: ['len3', 'deep', 'eq3', 'thou'], 4: ['neg', 'deep', 'len3', 'mixed'], 5: ['neg', 'negmix', 'expr', 'deep'] },
    order: { 1: ['mini', 'small'], 2: ['small', 'mixed'], 3: ['mixed', 'span'], 4: ['span', 'deep'], 5: ['negs', 'deep'] },
    add: { 1: ['easy', 'mix'], 2: ['mix', 'whole', 'three'], 3: ['whole3', 'three3', 'mix23'], 4: ['four', 'deep4', 'three3'], 5: ['neg', 'four', 'deep4'] },
    sub: { 1: ['easy', 'whole1'], 2: ['whole', 'mix', 'thou'], 3: ['whole3', 'zeros', 'thou'], 4: ['deep4', 'zeros', 'whole3'], 5: ['negres', 'deep4', 'zeros'] },
    mul: { 1: ['byWhole1', 'pow1'], 2: ['small', 'byWhole', 'oneOne', 'pow'], 3: ['twoOne', 'tiny', 'pointOne'], 4: ['twoTwo', 'tiny', 'bigSmall'], 5: ['neg', 'three', 'twoTwo'] },
    div: { 1: ['byWhole1', 'pow1'], 2: ['byWhole', 'byDec', 'pow'], 3: ['decDec', 'byPointOne', 'byWhole2'], 4: ['deepDec', 'byHalf', 'decDec'], 5: ['neg', 'deepDec', 'byHalf'] },
  };
  const WORDS = {
    add: { 1: ['run', 'plant'], 2: ['run', 'plant'], 3: ['run3', 'shop3'], 4: ['shop3', 'run3'], 5: ['shop3', 'run3'] },
    sub: { 1: ['change', 'bottle'], 2: ['change', 'bottle'], 3: ['change2', 'bottle'], 4: ['change2', 'bottle3'], 5: ['temp', 'change2'] },
    mul: { 1: ['shop', 'area'], 2: ['shop', 'area'], 3: ['fabric', 'area'], 4: ['fabric', 'fuel'], 5: ['fuel', 'area2'] },
    div: { 1: ['ribbon', 'share'], 2: ['ribbon', 'share'], 3: ['unit', 'ribbon'], 4: ['unit', 'glasses'], 5: ['speed', 'glasses'] },
  };
  const F = { compare: qCompare, order: qOrder, add: qAdd, sub: qSub, mul: qMul, div: qDiv };
  const ORDER = ['compare', 'order', 'add', 'sub', 'mul', 'div'];
  const clampL = L => Math.min(5, Math.max(1, Math.round(Number(L) || 2)));
  const make = (t, sub, L) => Object.assign(F[t](sub), { level: L, sub });

  function buildFull(L) {
    L = clampL(L);
    const qs = [];
    const cs = shuffle(SUBS.compare[L]);
    qs.push(make('compare', cs[0], L), make('compare', cs[1], L));
    const os = SUBS.order[L];
    qs.push(make('order', os[0], L), make('order', os[1], L));
    const wordOps = shuffle(['add', 'sub', 'mul', 'div']).slice(0, 2);
    for (const t of ['add', 'sub', 'mul', 'div']) {
      const p = shuffle(SUBS[t][L]);
      qs.push(make(t, p[0], L));
      qs.push(make(t, wordOps.includes(t) ? pick(WORDS[t][L]) : p[1], L));
    }
    return qs;
  }
  function buildPractice(topics, L) {
    L = clampL(L);
    const per = topics.length <= 4 ? 3 : 2, qs = [];
    for (const t of ORDER) if (topics.includes(t)) {
      const pool = SUBS[t][L].concat(WORDS[t] ? WORDS[t][L] : []);
      let subs = shuffle(pool);
      while (subs.length < per) subs = subs.concat(shuffle(SUBS[t][L]));
      subs.slice(0, per).forEach(s => qs.push(make(t, s, L)));
    }
    return qs;
  }

  function parseAns(raw) {
    let s = String(raw).trim().replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/[€$£]/g, '')
      .replace(/(km\/h|km|cm|mm|m²|m2|m|°c|°|litres|litre|liters|liter|l|pieces|piece|glasses|glass)$/i, '');
    if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, ''); else s = s.replace(',', '.');
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    return Number(s);
  }
  function isRight(q, n) { return same(n, q.val); }
  function diagnoseNum(q, n) {
    if (q.val !== 0 && same(n, -q.val))
      return q.val < 0 ? 'The size is right, but the answer should be negative. Look at the signs again.' : 'The size is right, but the answer should be positive. Look at the signs again.';
    for (const t of q.traps) if (same(n, t.val)) return t.msg;
    if (n !== 0 && q.val !== 0) for (const k of [-3, -2, -1, 1, 2, 3]) if (same(n, q.val * P10(k))) return q.shiftMsg;
    return `Not quite. Hint: ${q.hint}`;
  }
  function diagnoseOrder(q, ord) {
    if (ord.slice().reverse().every((v, k) => v === q.correct[k]))
      return `You put them in the opposite order. Read the instruction again: <strong>${q.dir === 'asc' ? 'smallest' : 'largest'}</strong> first.`;
    const vals = ord.map(k => q.items[k]);
    const cmp = (p, r) => p[0] - r[0] || p[1] - r[1];
    const mono = key => vals.every((s, i) => i === 0 || (q.dir === 'asc' ? cmp(key(vals[i - 1]), key(s)) <= 0 : cmp(key(vals[i - 1]), key(s)) >= 0));
    if (q.neg && mono(s => [Math.abs(Number(s)), 0]))
      return 'With negative numbers, the one further from zero is the smaller one, so −0.7 is smaller than −0.07.';
    if (mono(s => { const [i, f = '0'] = s.replace('-', '').split('.'); return [Number(i), Number(f)]; }))
      return 'It looks like the digits after the point were compared as whole numbers, as if 606 beats 66. Pad every number to the same number of decimal places first, then compare.';
    if (mono(s => [s.length, 0])) return 'It looks like the numbers were ordered by how many digits they have. Length does not decide size. Pad every number to the same number of decimal places, then compare.';
    return 'Not quite. Pad every number to the same number of decimal places (0.6 becomes 0.600), then compare place by place from the left.';
  }

  /* Mahoot: any number of questions, spread evenly over the six topics, about one in four as word problems. */
  function buildN(len, L) {
    L = clampL(L);
    const per = {}; ORDER.forEach(t => { per[t] = Math.floor(len / ORDER.length); });
    shuffle(ORDER).slice(0, len % ORDER.length).forEach(t => { per[t]++; });
    const qs = [];
    for (const t of ORDER) {
      let subs = [];
      for (let i = 0; i < per[t]; i++) {
        const word = WORDS[t] && seededRandom() < 0.25;
        if (!subs.length) subs = shuffle(SUBS[t][L]);
        qs.push(make(t, word ? pick(WORDS[t][L]) : subs.pop(), L));
      }
    }
    return qs;
  }

  return { buildN, T, LEVELS, ORDER, clampL, buildFull, buildPractice, parseAns, isRight, diagnoseNum, diagnoseOrder, N, NS, esc, SUBS, WORDS, make };
})();
