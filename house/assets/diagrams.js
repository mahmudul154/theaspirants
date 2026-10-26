/* ==========================================================================
   diagrams.js — risk matrix, water schematic, SLD, Gantt, cost-gap chart.
   ========================================================================== */
import { svg, L, P, R, C, T, defs } from './draw-core.js';

/* ---------- hazard matrix ------------------------------------------------ */
export function hazardMatrix() {
  const out = [defs()];
  const x0 = 34, y0 = 20, w = 150, h = 120;
  out.push(R(x0, y0, w, h, { fill: 'none', stroke: 'var(--ink)', sw: 0.7 }));
  /* probability bands */
  out.push(R(x0, y0, w / 3, h, { fill: 'rgba(91,115,85,.06)', stroke: 'none' }));
  out.push(R(x0 + w / 3, y0, w / 3, h, { fill: 'rgba(184,134,43,.07)', stroke: 'none' }));
  out.push(R(x0 + (2 * w) / 3, y0, w / 3, h, { fill: 'rgba(176,58,46,.06)', stroke: 'none' }));
  for (let i = 1; i < 3; i++) {
    out.push(L(x0 + (w / 3) * i, y0, x0 + (w / 3) * i, y0 + h, { stroke: 'var(--rule)', sw: 0.5, dash: '2 2' }));
    out.push(L(x0, y0 + (h / 3) * i, x0 + w, y0 + (h / 3) * i, { stroke: 'var(--rule)', sw: 0.5, dash: '2 2' }));
  }
  out.push(T(x0 - 4, y0 + 4, 'উচ্চ', { fs: 4.2, anchor: 'end', fill: 'var(--ink-40)' }));
  out.push(T(x0 - 4, y0 + h / 2 + 2, 'মধ্যম', { fs: 4.2, anchor: 'end', fill: 'var(--ink-40)' }));
  out.push(T(x0 - 4, y0 + h - 1, 'নিম্ন', { fs: 4.2, anchor: 'end', fill: 'var(--ink-40)' }));
  out.push(T(x0 + w / 6, y0 + h + 10, 'কম', { fs: 4.2, fill: 'var(--ink-40)' }));
  out.push(T(x0 + w / 2, y0 + h + 10, 'মাঝারি', { fs: 4.2, fill: 'var(--ink-40)' }));
  out.push(T(x0 + (5 * w) / 6, y0 + h + 10, 'বেশি', { fs: 4.2, fill: 'var(--ink-40)' }));
  out.push(T(14, y0 + h / 2, 'প্রভাব →', { fs: 4.4, fill: 'var(--ink-40)', rot: -90 }));

  /* plots: [probIndex 0..2, impactIndex 0..2, label, r] impact 0 = high */
  const pts = [
    [3, 1, 'বন্যা', 9, 'var(--blue)'],
    [2, 1, 'ভূমিকম্প', 9.5, 'var(--red)'],
    [1, 2, 'বাতাস', 8, 'var(--amber)'],
    [3, 2, 'ভেজা দেয়াল', 6, 'var(--green)'],
    [2, 3, 'মাটি ধসা', 6.4, 'var(--amber)'],
    [1, 3, 'বিদ্যুৎ', 5.6, 'var(--red)'],
  ];
  pts.forEach(([px, py, label, r, col]) => {
    const cx = x0 + (w / 3) * (px - 0.5);
    const cy = y0 + (h / 3) * (py - 0.5);
    out.push(C(cx, cy, r, { fill: col, op: 0.55, stroke: col, sw: 0.7 }));
    out.push(T(cx, cy + 1.6, label, { fs: 3.5, fill: 'var(--ink)' }));
  });
  out.push(T(x0 + w / 2, 10, 'সম্ভাবনা →', { fs: 4.4, fill: 'var(--ink-40)' }));
  out.push(T(x0 + w / 2, y0 + h + 24, 'উপরের-ডান কোণে থাকা ঝুঁকিগুলোই নকশায় সরাসরি সমাধান করা হয়েছে', { fs: 3.7, fill: 'var(--ink-60)' }));
  return svg(220, 190, '-6 -2 220 190', out.join(''));
}

/* ---------- water schematic --------------------------------------------- */
export function waterSchematic() {
  const out = [defs()];
  const box = (x, y, w, h, label, sub, col = 'var(--blue)') => [
    R(x, y, w, h, { fill: 'rgba(46,76,109,.06)', stroke: col, sw: 0.8 }),
    T(x + w / 2, y + 9, label, { fs: 4.6, ff: 'var(--f-bn)', fill: 'var(--ink)' }),
    sub ? T(x + w / 2, y + 16, sub, { fs: 3.3, fill: 'var(--ink-60)' }) : '',
  ].join('');
  const arrow = (x1, y1, x2, y2, col = 'var(--blue)') => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ah = 3.4;
    return L(x1, y1, x2, y2, { stroke: col, sw: 0.9 }) +
      P([[x2, y2], [x2 - ah * Math.cos(ang - 0.45), y2 - ah * Math.sin(ang - 0.45)], [x2 - ah * Math.cos(ang + 0.45), y2 - ah * Math.sin(ang + 0.45)]], { closed: true, fill: col, stroke: 'none' });
  };

  out.push(box(8, 132, 54, 22, 'টিউবওয়েল', 'EXISTING', 'var(--ink)'));
  out.push(box(82, 126, 54, 28, '১HP পাম্প', 'SUCTION', 'var(--red)'));
  out.push(box(156, 10, 56, 26, '৫০০L ট্যাংক', '+৯\'-০"', 'var(--blue)'));
  out.push(box(156, 84, 56, 26, 'বাথরুম', 'WC · শাওয়ার', 'var(--green)'));
  out.push(box(156, 132, 56, 24, 'রান্নাঘর', 'সিঙ্ক', 'var(--green)'));
  out.push(box(60, 66, 52, 22, 'ফ্লোট ভালভ', 'AUTO LEVEL', 'var(--blue)'));

  out.push(arrow(62, 143, 82, 143));
  out.push(P([[109, 126], [109, 60], [156, 60]], { stroke: 'var(--blue)', sw: 0.9 }));
  out.push(arrow(150, 60, 156, 60));
  out.push(L(156, 60, 160, 60, { stroke: 'var(--blue)', sw: 0.9 }));
  out.push(arrow(184, 36, 184, 84));
  out.push(P([[184, 110], [184, 120], [200, 120], [200, 132]], { stroke: 'var(--blue)', sw: 0.9 }));
  out.push(arrow(200, 126, 200, 132));
  out.push(L(212, 97, 222, 97, { stroke: 'var(--green)', sw: 1.1, dash: '3 2' }));
  out.push(T(224, 98, '→ সেপটিক', { fs: 3.6, anchor: 'start', fill: 'var(--green)' }));
  out.push(T(224, 104, 'Ø4" · ২৫\'+ দূরে', { fs: 3.2, anchor: 'start', fill: 'var(--green)' }));

  /* annotation */
  out.push(T(10, 168, 'সাকশন লাইন ১" · রাইজার ২৫মিমি · ব্রাঞ্চ ২০মিমি', { fs: 3.6, anchor: 'start', fill: 'var(--ink-60)' }));
  out.push(T(10, 176, 'ট্যাংক থেকে শাওয়ার হেড পর্যন্ত হেড ~১.৫ মিটার', { fs: 3.6, anchor: 'start', fill: 'var(--ink-60)' }));
  out.push(T(10, 184, 'শীতকালে ট্যাংক ও পাইপে ইনসুলেশন বা মোটা কাপড়', { fs: 3.6, anchor: 'start', fill: 'var(--red)' }));
  return svg(240, 196, '0 0 240 196', out.join(''));
}

/* ---------- single line diagram ----------------------------------------- */
export function sld() {
  const out = [defs()];
  const red = 'var(--red)';
  /* service */
  out.push(L(18, 22, 18, 190, { stroke: red, sw: 1.1 }));
  out.push(T(24, 18, 'BREB · ১ ফেজ ২৩০V', { fs: 3.8, anchor: 'start', fill: 'var(--ink-60)' }));
  /* meter */
  out.push(C(18, 34, 7, { fill: 'var(--paper-2)', stroke: red, sw: 0.9 }));
  out.push(T(18, 36, 'kWh', { fs: 3.4, fill: red }));
  out.push(T(30, 36, 'মিটার', { fs: 3.6, anchor: 'start', fill: 'var(--ink-60)' }));
  /* main breaker */
  out.push(R(10, 54, 16, 12, { fill: 'var(--ink)', stroke: 'none' }));
  out.push(T(30, 63, '৩২A মেইন', { fs: 3.6, anchor: 'start', fill: 'var(--ink-60)' }));
  /* RCCB */
  out.push(R(10, 76, 16, 12, { fill: 'var(--red)', stroke: 'none' }));
  out.push(T(30, 85, 'RCCB ৩০mA', { fs: 3.6, anchor: 'start', fill: red }));
  /* SDB bus */
  out.push(L(18, 88, 18, 100, { stroke: red, sw: 1.1 }));
  out.push(R(80, 96, 140, 4, { fill: red, stroke: 'none' }));
  out.push(L(18, 100, 80, 100, { stroke: red, sw: 1.1 }));
  out.push(T(84, 92, 'SDB ৬ ওয়ে', { fs: 3.8, anchor: 'start', fill: 'var(--ink-60)' }));

  const circuits = [
    ['C1 · 10A', 'লাইট ১.৫RM', 8],
    ['C2 · 10A', 'ফ্যান ১.৫RM', 3],
    ['C3 · 16A', 'সকেট ২.৫RM', 10],
    ['C4 · 16A', 'সকেট ২.৫RM', 4],
    ['C5 · 20A', 'পাম্প ৪RM', 1],
    ['C6 · 16A', 'স্পেয়ার', 0],
  ];
  circuits.forEach(([t, sub, n], i) => {
    const x = 88 + i * 22;
    out.push(L(x, 100, x, 116, { stroke: red, sw: 0.9 }));
    out.push(R(x - 7, 116, 14, 11, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 0.7 }));
    out.push(T(x, 123, t.split('·')[0].trim(), { fs: 3.2, fill: 'var(--ink)' }));
    out.push(T(x, 134, sub.split(' ')[0], { fs: 3, fill: 'var(--ink-40)' }));
    out.push(T(x, 142, `${n} pts`, { fs: 3, fill: 'var(--ink-40)' }));
    out.push(L(x, 146, x, 154, { stroke: red, sw: 0.7, dash: '2 2' }));
    out.push(C(x, 158, 2.6, { stroke: red, sw: 0.5 }));
  });
  /* earth */
  out.push(L(18, 100, 18, 168, { stroke: 'var(--green)', sw: 1 }));
  out.push(L(8, 168, 28, 168, { stroke: 'var(--green)', sw: 1.4 }));
  out.push(L(12, 172, 24, 172, { stroke: 'var(--green)', sw: 1 }));
  out.push(T(32, 170, 'আর্থ ২ রড · ৮\' দূরে', { fs: 3.5, anchor: 'start', fill: 'var(--green)' }));
  return svg(230, 196, '0 0 230 200', out.join(''));
}

/* ---------- gantt ------------------------------------------------------- */
export function gantt() {
  const out = [defs()];
  const rows = [
    ['সাইট প্রস্তুতি ও লেআউট', 0, 1, 'var(--ink-40)'],
    ['খনন ও ফুটিং', 1, 2, 'var(--blue)'],
    ['প্লিন্থ বিম ও প্লিন্থ দেয়াল', 3, 1, 'var(--blue)'],
    ['স্যান্ড ফিল ও DPC', 4, 1, 'var(--blue)'],
    ['দেয়াল গাঁথুনি (৫" ব্লক)', 5, 3, 'var(--red)'],
    ['লিন্টেল ব্যান্ড + কিউরিং', 8, 1, 'var(--red)'],
    ['ট্রাস ফেব্রিকেশন', 8, 2, 'var(--amber)'],
    ['ট্রাস ইরেকশন ও পার্লিন', 10, 1, 'var(--amber)'],
    ['ছাদের শিট ও গাটার', 11, 1, 'var(--amber)'],
    ['প্লাস্টার (ভিতর + বাইর)', 11, 2, 'var(--green)'],
    ['ফ্লোর ও নেট সিমেন্ট', 13, 1, 'var(--green)'],
    ['দরজা-জানালা ও গ্রিল', 13, 2, 'var(--ink-60)'],
    ['পানি ও বিদ্যুৎ ফিটিং', 14, 1, 'var(--ink-60)'],
    ['রং ও ফিনিশিং', 15, 1, 'var(--red)'],
    ['পরিচ্ছন্নতা ও হস্তান্তর', 15, 1, 'var(--ink)'],
  ];
  const x0 = 116, y0 = 16, w = 190, rh = 9.4;
  const wk = w / 16;
  /* week grid */
  for (let i = 0; i <= 16; i++) {
    out.push(L(x0 + i * wk, y0 - 6, x0 + i * wk, y0 + rows.length * rh + 4, { stroke: i % 4 === 0 ? 'var(--ink-40)' : 'var(--rule)', sw: i % 4 === 0 ? 0.5 : 0.35 }));
  }
  [1, 5, 9, 13, 17].forEach((wkNo, i) => {
    out.push(T(x0 + i * wk * 4, y0 - 10, `সপ্তাহ ${wkNo}`, { fs: 3.4, fill: 'var(--ink-40)' }));
  });
  rows.forEach(([label, start, dur, col], i) => {
    const y = y0 + i * rh;
    out.push(T(x0 - 4, y + 5.4, label, { fs: 3.8, anchor: 'end', fill: 'var(--ink-80)', ff: 'var(--f-bn)' }));
    out.push(R(x0 + start * wk + 0.4, y + 1.2, dur * wk - 0.8, rh - 3, { fill: col, op: 0.82, stroke: 'none' }));
  });
  /* milestone markers */
  out.push(C(x0 + 16 * wk, y0 + rows.length * rh + 8, 3, { fill: 'var(--red)', stroke: 'none' }));
  out.push(T(x0 + 16 * wk - 6, y0 + rows.length * rh + 10, 'হস্তান্তর', { fs: 3.4, anchor: 'end', fill: 'var(--red)' }));
  out.push(T(x0 + 2 * wk, y0 + rows.length * rh + 10, '← বর্ষা এড়িয়ে নভেম্বরে শুরু', { fs: 3.4, anchor: 'start', fill: 'var(--ink-40)' }));
  return svg(320, 172, '0 0 322 172', out.join(''));
}

/* ---------- cost gap chart ---------------------------------------------- */
export function gapChart(data) {
  const out = [defs()];
  const max = Math.max(...data.map((d) => Math.max(d.brief, d.lean, d.full)));
  const x0 = 96, y0 = 16, w = 150, rh = 11;
  data.forEach((d, i) => {
    const y = y0 + i * rh;
    out.push(T(x0 - 4, y + 5, d.short, { fs: 3.8, anchor: 'end', fill: 'var(--ink-80)', ff: 'var(--f-bn)' }));
    /* background track */
    out.push(R(x0, y + 0.5, w, 7.6, { fill: 'var(--paper-3)', stroke: 'none' }));
    out.push(R(x0, y + 0.5, (d.full / max) * w, 7.6, { fill: 'var(--ink)', op: 0.16, stroke: 'none' }));
    out.push(R(x0, y + 0.5, (d.lean / max) * w, 7.6, { fill: 'var(--blue)', op: 0.55, stroke: 'none' }));
    out.push(R(x0, y + 0.5, Math.max(1.2, (d.brief / max) * w), 7.6, { fill: 'var(--red)', stroke: 'none' }));
    out.push(T(x0 + w + 4, y + 6, `${(d.full / 1000).toFixed(0)}k`, { fs: 3.4, anchor: 'start', fill: 'var(--ink-40)' }));
  });
  /* legend */
  const ly = y0 + data.length * rh + 8;
  const leg = [['প্রাথমিক', 'var(--red)'], ['স্বনির্ভর', 'var(--blue)'], ['পূর্ণ', 'rgba(18,20,26,.16)']];
  leg.forEach(([l, c], i) => {
    out.push(R(x0 + i * 54, ly, 8, 4, { fill: c, stroke: 'none' }));
    out.push(T(x0 + i * 54 + 11, ly + 4, l, { fs: 3.6, anchor: 'start', fill: 'var(--ink-60)', ff: 'var(--f-bn)' }));
  });
  out.push(T(x0 - 4, ly + 4, '', { fs: 3.4 }));
  return svg(320, 160, '0 0 322 160', out.join(''));
}
