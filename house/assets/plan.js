/* ==========================================================================
   plan.js — site plan, floor plan (layered), roof plan, parti diagrams.
   Geometry: inches, origin SW external corner, y flipped (north = top).
   ========================================================================== */
import { U, svg, L, P, R, C, T, TB, dimH, dimV, northArrow, scaleBar, defs, wallRect, windowSym, doorSwing, roomLabel, bubble } from './draw-core.js';

/* ---------- master geometry ---------------------------------------------- */
export const G = {
  W: 384, D: 192,          // 32'-0" x 16'-0" external
  tE: 5, tI: 3,
  p1: [129, 132],          // west partition
  p2: [252, 255],          // east partition
  rear: [5, 67],           // bath + kitchen band (62" deep)
  rearWall: [67, 70],      // wall between service band and sitting
  bath: [132, 186],
  kit: [189, 252],
  bed1: [5, 129],
  bed2: [255, 379],
  sitting: [132, 252, 70, 187],
  /* openings */
  open: {
    wBed1S: [43, 91], wSit1: [136, 166], doorMain: [172, 212], wSit2: [218, 248], wBed2S: [293, 341],
    wBed1N: [49, 85], wBathN: [144, 168], wKitN: [190, 216], doorKitRear: [218, 248], wBed2N: [279, 315],
    doorBed1: [104, 140], doorBed2: [76, 112],
    doorBath: [138, 168], doorKit: [198, 228],
    future: [110, 146],
  },
};
export const AREA = {
  bed1: (124 * 182) / 144, bed2: (124 * 182) / 144,
  sit: (120 * 117) / 144, bath: (54 * 62) / 144, kit: (63 * 62) / 144,
};
AREA.total = AREA.bed1 + AREA.bed2 + AREA.sit + AREA.bath + AREA.kit;

const r1 = (v) => Math.round(v * 10) / 10;

/* ---------- furniture symbols ------------------------------------------- */
function furn(x, y, w, h, label, o = {}) {
  const out = [
    R(x, y, w, h, { fill: o.fill || 'rgba(18,20,26,.045)', stroke: o.stroke || 'var(--ink-40)', sw: 0.5 }),
  ];
  if (label) out.push(T(x + w / 2, y + h / 2 + 1.8, label, { fs: o.fs || 4.6, fill: 'var(--ink-40)' }));
  if (o.extra) out.push(o.extra);
  return out.join('');
}

function bed(x, y, w, h) {
  /* w = width across, h = length */
  return [
    R(x, y, w, h, { fill: 'rgba(18,20,26,.05)', stroke: 'var(--ink-40)', sw: 0.55 }),
    R(x, y, w, h * 0.22, { fill: 'rgba(18,20,26,.09)', stroke: 'var(--ink-40)', sw: 0.45 }),
    L(x + w * 0.06, y + h * 0.26, x + w * 0.94, y + h * 0.26, { stroke: 'var(--ink-40)', sw: 0.4, dash: '2 1.5' }),
    T(x + w / 2, y + h * 0.62, 'BED 5\'-0"×6\'-6"', { fs: 4.2, fill: 'var(--ink-40)' }),
  ].join('');
}

/* fixtures */
function wc(x, y, rot = 0) {
  const g = [
    R(x, y, 20, 12, { fill: 'var(--paper-2)', stroke: 'var(--ink-60)', sw: 0.5, rx: 2 }),
    `<ellipse cx="${x + 10}" cy="${y + 18}" rx="6.6" ry="8" fill="none" stroke="var(--ink-60)" stroke-width="0.5"/>`,
  ].join('');
  return rot ? `<g transform="rotate(${rot} ${x + 10} ${y + 12})">${g}</g>` : g;
}
function basin(x, y) {
  return [
    R(x, y, 18, 13, { fill: 'var(--paper-2)', stroke: 'var(--ink-60)', sw: 0.5, rx: 1.5 }),
    `<ellipse cx="${x + 9}" cy="${y + 6.5}" rx="5.4" ry="3.8" fill="none" stroke="var(--ink-40)" stroke-width="0.45"/>`,
    C(x + 9, y + 1.8, 1, { fill: 'var(--ink-40)', stroke: 'none' }),
  ].join('');
}
function sink(x, y, w = 18, h = 15) {
  return [
    R(x, y, w, h, { fill: 'var(--paper-2)', stroke: 'var(--ink-60)', sw: 0.5 }),
    R(x + 1.6, y + 1.6, w - 3.2, h - 3.2, { fill: 'none', stroke: 'var(--ink-40)', sw: 0.4, rx: 1 }),
    C(x + w / 2, y + 1.2, 1, { fill: 'var(--ink-40)', stroke: 'none' }),
  ].join('');
}
function hob(x, y, w = 24, h = 18) {
  return [
    R(x, y, w, h, { fill: 'var(--paper-2)', stroke: 'var(--ink-60)', sw: 0.5 }),
    C(x + w * 0.3, y + h * 0.32, 4.2, { stroke: 'var(--ink-40)', sw: 0.4 }),
    C(x + w * 0.3, y + h * 0.72, 4.2, { stroke: 'var(--ink-40)', sw: 0.4 }),
    C(x + w * 0.72, y + h * 0.5, 4.2, { stroke: 'var(--ink-40)', sw: 0.4 }),
  ].join('');
}

/* ---------- openings tables (for schedules) ----------------------------- */
export const WINDOWS = [
  { id: 'W1', loc: 'বেডরুম-১ / দক্ষিণ', w: 48, h: 48, sill: 33, type: '2-প্যানেল স্লাইডিং থাই গ্লাস', qty: 1 },
  { id: 'W2', loc: 'বসার ঘর / দক্ষিণ (পশ্চিম)', w: 30, h: 60, sill: 21, type: 'ফিক্সড + স্লাইডিং', qty: 1 },
  { id: 'W3', loc: 'বসার ঘর / দক্ষিণ (পূর্ব)', w: 30, h: 60, sill: 21, type: 'ফিক্সড + স্লাইডিং', qty: 1 },
  { id: 'W4', loc: 'বেডরুম-২ / দক্ষিণ', w: 48, h: 48, sill: 33, type: '2-প্যানেল স্লাইডিং থাই গ্লাস', qty: 1 },
  { id: 'W5', loc: 'বেডরুম-১ / উত্তর', w: 36, h: 36, sill: 39, type: '2-প্যানেল স্লাইডিং', qty: 1 },
  { id: 'W6', loc: 'বেডরুম-২ / উত্তর', w: 36, h: 36, sill: 39, type: '2-প্যানেল স্লাইডিং', qty: 1 },
  { id: 'W7', loc: 'বাথরুম / উত্তর (হাই লেভেল)', w: 24, h: 18, sill: 60, type: 'লুভার / ফ্রস্টেড', qty: 1 },
  { id: 'W8', loc: 'রান্নাঘর / উত্তর', w: 26, h: 24, sill: 42, type: 'স্লাইডিং, সিঙ্কের উপরে', qty: 1 },
];

export const DOORS = [
  { id: 'D1', loc: 'প্রধান প্রবেশ / দক্ষিণ', w: 40, h: 84, type: 'MS স্টিল দরজা + ৮-লিভার লক', qty: 1 },
  { id: 'D2', loc: 'রান্নাঘর / উত্তর (ব্যাক)', w: 30, h: 80, type: 'MS স্টিল দরজা', qty: 1 },
  { id: 'D3', loc: 'বেডরুম-১', w: 36, h: 80, type: 'MS ফ্রেম + স্টিল লিফ', qty: 1 },
  { id: 'D4', loc: 'বেডরুম-২', w: 36, h: 80, type: 'MS ফ্রেম + স্টিল লিফ', qty: 1 },
  { id: 'D5', loc: 'বাথরুম', w: 30, h: 80, type: 'PVC/FRP লিফ + MS ফ্রেম', qty: 1 },
  { id: 'D6', loc: 'রান্নাঘর (ভিতর)', w: 30, h: 80, type: 'MS ফ্রেম + স্টিল লিফ', qty: 1 },
];

/* ---------- room tints --------------------------------------------------- */
const TINT = {
  bed: 'rgba(176,58,46,.045)',
  live: 'rgba(46,76,109,.05)',
  wet: 'rgba(91,115,85,.075)',
  circ: 'rgba(18,20,26,.02)',
};

/* ---------- FLOOR PLAN --------------------------------------------------- */
export function floorPlan(active = {}) {
  const on = (k) => active[k] !== false;
  const o = G.open;
  const out = [defs()];

  /* floor field */
  out.push(R(0, 0, G.W, G.D, { fill: 'var(--paper-2)', stroke: 'none' }));
  /* tints */
  out.push(R(5, 5, 124, 182, { fill: TINT.bed, stroke: 'none' }));
  out.push(R(255, 5, 124, 182, { fill: TINT.bed, stroke: 'none' }));
  out.push(R(132, 70, 120, 117, { fill: TINT.live, stroke: 'none' }));
  out.push(R(132, 5, 54, 62, { fill: TINT.wet, stroke: 'none' }));
  out.push(R(189, 5, 63, 62, { fill: TINT.wet, stroke: 'none' }));

  /* ---- external walls, segmented around openings ---- */
  const tE = G.tE;
  /* west + east solid (full depth closes corners) */
  out.push(wallRect(0, 0, tE, G.D));
  out.push(wallRect(G.W - tE, 0, tE, G.D));

  /* south wall y=187..192 */
  const southSeg = [[5, o.wBed1S[0]], [o.wBed1S[1], o.wSit1[0]], [o.wSit1[1], o.doorMain[0]], [o.doorMain[1], o.wSit2[0]], [o.wSit2[1], o.wBed2S[0]], [o.wBed2S[1], 379]];
  southSeg.forEach(([a, b]) => a < b && out.push(wallRect(a, 187, b - a, tE)));
  /* north wall y=0..5 */
  const northSeg = [[5, o.wBed1N[0]], [o.wBed1N[1], o.wBathN[0]], [o.wBathN[1], o.wKitN[0]], [o.wKitN[1], o.doorKitRear[0]], [o.doorKitRear[1], o.wBed2N[0]], [o.wBed2N[1], 379]];
  northSeg.forEach(([a, b]) => a < b && out.push(wallRect(a, 0, b - a, tE)));

  /* internal partitions */
  /* P1 with bedroom-1 door gap */
  out.push(wallRect(129, 5, 3, o.doorBed1[0] - 5));
  out.push(wallRect(129, o.doorBed1[1], 3, 187 - o.doorBed1[1]));
  /* P2 with bedroom-2 door gap */
  out.push(wallRect(252, 5, 3, o.doorBed2[0] - 5));
  out.push(wallRect(252, o.doorBed2[1], 3, 187 - o.doorBed2[1]));
  /* rear band south wall y67..70 with two doors */
  out.push(wallRect(132, 67, o.doorBath[0] - 132, 3));
  out.push(wallRect(o.doorBath[1], 67, o.doorKit[0] - o.doorBath[1], 3));
  out.push(wallRect(o.doorKit[1], 67, 252 - o.doorKit[1], 3));
  /* bath / kitchen partition */
  out.push(wallRect(186, 5, 3, 62));

  /* ---- windows ---- */
  out.push(windowSym(o.wBed1S[0], o.wBed1S[1], 187, 192, true));
  out.push(windowSym(o.wSit1[0], o.wSit1[1], 187, 192, true));
  out.push(windowSym(o.wSit2[0], o.wSit2[1], 187, 192, true));
  out.push(windowSym(o.wBed2S[0], o.wBed2S[1], 187, 192, true));
  out.push(windowSym(o.wBed1N[0], o.wBed1N[1], 0, 5, true));
  out.push(windowSym(o.wBed2N[0], o.wBed2N[1], 0, 5, true));
  out.push(windowSym(o.wBathN[0], o.wBathN[1], 0, 5, true));
  out.push(windowSym(o.wKitN[0], o.wKitN[1], 0, 5, true));

  /* ---- doors ---- */
  out.push(doorSwing(o.doorMain[0], 187, 40, 0, -1));           /* opens north into sitting */
  out.push(doorSwing(o.doorKitRear[1], 5, 30, 180, -1));        /* kitchen back door */
  out.push(doorSwing(129, o.doorBed1[0], 36, 90, 1));           /* bedroom-1, swings west */
  out.push(doorSwing(255, o.doorBed2[0], 36, 90, -1));          /* bedroom-2, swings east */
  out.push(doorSwing(o.doorBath[0], 70, 30, 0, -1));            /* bath door */
  out.push(doorSwing(o.doorKit[1], 70, 30, 180, 1));            /* kitchen door */

  /* ---- future opening (dashed knock-out panel in east wall) ---- */
  if (on('future')) {
    out.push(R(379, o.future[0], 5, o.future[1] - o.future[0], { fill: 'none', stroke: 'var(--red)', sw: 0.7, dash: '2.4 1.8' }));
    out.push(T(390, (o.future[0] + o.future[1]) / 2, 'FUTURE', { fs: 4.4, fill: 'var(--red)', anchor: 'start', rot: 90 }));
  }

  /* ---- furniture ---- */
  if (on('furniture')) {
    /* bedroom 1 */
    out.push(bed(9, 62, 60, 78));
    out.push(furn(9, 40, 20, 18, ''));
    out.push(furn(6, 7, 122, 22, 'WARDROBE  24" DEEP'));
    out.push(furn(40, 160, 48, 22, 'STUDY'));
    out.push(C(64, 148, 8, { stroke: 'var(--ink-40)', sw: 0.45 }));
    /* bedroom 2 */
    out.push(bed(315, 62, 60, 78));
    out.push(furn(355, 40, 20, 18, ''));
    out.push(furn(256, 7, 122, 22, 'WARDROBE  24" DEEP'));
    out.push(furn(296, 160, 48, 22, 'STUDY'));
    out.push(C(320, 148, 8, { stroke: 'var(--ink-40)', sw: 0.45 }));
    /* sitting */
    out.push(furn(134, 92, 28, 62, 'SOFA 3'));
    out.push(furn(170, 106, 36, 20, 'CT'));
    out.push(furn(234, 96, 15, 56, 'TV'));
    out.push(furn(182, 78, 46, 30, 'DINING 4'));
    out.push(furn(136, 168, 26, 14, 'SHOE'));
    /* bath */
    out.push(wc(156, 44));
    out.push(basin(166, 12));
    out.push(furn(133, 6, 30, 34, 'SHOWER', { fill: 'rgba(46,76,109,.06)' }));
    out.push(C(150, 60, 2.4, { stroke: 'var(--ink-40)', sw: 0.4, dash: '1 1' }));
    /* kitchen */
    out.push(furn(189, 6, 63, 22, 'COUNTER 24"'));
    out.push(furn(189, 28, 22, 20, ''));
    out.push(sink(196, 9));
    out.push(hob(191, 30, 20, 16));
    out.push(furn(230, 30, 20, 22, 'FRIDGE'));
  }

  /* ---- structure ---- */
  if (on('structure')) {
    const posts = [[0, 0], [129, 5], [252, 5], [379, 0], [0, 187], [129, 187], [252, 187], [379, 187]];
    posts.forEach(([x, y]) => {
      out.push(R(x - 2.5 + (x === 0 ? 2.5 : x === 379 ? -2.5 : 1.5), y - 2.5 + (y === 0 ? 2.5 : -2.5), 5, 5, { fill: 'var(--red)', op: 0.5, stroke: 'var(--red)', sw: 0.4 }));
    });
    out.push(R(-10, -10, G.W + 20, G.D + 20, { fill: 'none', stroke: 'var(--ink-40)', sw: 0.6, dash: '5 3' }));
    out.push(T(-12, -13, 'PLINTH BEAM 6"×9" (RCC) — CONTINUOUS', { fs: 4.2, anchor: 'start', fill: 'var(--ink-40)' }));
    /* truss bearing lines */
    for (let i = 1; i <= 7; i++) {
      const x = (G.W / 8) * i;
      out.push(L(x, -6, x, G.D + 6, { stroke: 'var(--red)', sw: 0.4, dash: '1.5 3', op: 0.55 }));
    }
    out.push(T(G.W / 2, G.D + 13, 'MS ট্রাস @ 4\'-0" c/c  (৯টি ট্রাস)', { fs: 4.4, fill: 'var(--red)' }));
  }

  /* ---- plumbing ---- */
  if (on('plumbing')) {
    const blue = 'var(--blue)';
    /* overhead tank position (above bath) */
    out.push(R(138, 14, 42, 42, { fill: 'none', stroke: 'var(--blue)', sw: 0.6, dash: '2 2', op: 0.75 }));
    out.push(T(159, 32, '↑ ৫০০L', { fs: 4.6, fill: blue }));
    out.push(T(159, 38, 'TANK ABOVE', { fs: 3.8, fill: blue }));
    /* cold water runs */
    const w = { stroke: blue, sw: 0.9, cap: 'round' };
    out.push(L(159, 56, 159, 44, w));
    out.push(L(159, 44, 148, 44, w));
    out.push(L(159, 44, 175, 44, w));
    out.push(L(175, 44, 175, 18, w));
    out.push(L(159, 56, 159, 62, w));
    out.push(P([[159, 56], [159, 74], [210, 74], [210, 46], [210, 20]], w));
    /* soil / waste */
    const d = { stroke: 'var(--green)', sw: 1.1, dash: '3 2' };
    out.push(P([[150, 58], [140, 58], [140, 8]], d));
    out.push(P([[140, 8], [136, 8]], d));
    out.push(T(124, 12, 'SOIL 4"', { fs: 3.8, fill: 'var(--green)', anchor: 'end' }));
    out.push(T(200, 84, 'CW 20mm', { fs: 3.8, fill: blue, anchor: 'start' }));
    /* stop valve symbol */
    out.push(C(159, 62, 2.6, { stroke: blue, sw: 0.6 }));
    out.push(L(156, 59, 162, 65, { stroke: blue, sw: 0.6 }));
  }

  /* ---- electrical ---- */
  if (on('electrical')) {
    const red = 'var(--red)';
    const light = (x, y) => [C(x, y, 2.4, { stroke: red, sw: 0.55 }), L(x - 3.4, y, x + 3.4, y, { stroke: red, sw: 0.4 }), L(x, y - 3.4, x, y + 3.4, { stroke: red, sw: 0.4 })].join('');
    const fan = (x, y) => [C(x, y, 3.4, { stroke: red, sw: 0.55 }), T(x, y + 1.3, 'F', { fs: 3.8, fill: red })].join('');
    const sock = (x, y) => `<path d="M ${x - 3} ${y} a 3 3 0 0 1 6 0" fill="none" stroke="${red}" stroke-width="0.55"/>${L(x, y, x, y + 3, { stroke: red, sw: 0.5 })}`;
    const sw = (x, y) => [R(x - 2, y - 2, 4, 4, { fill: 'var(--paper-2)', stroke: red, sw: 0.5 }), C(x, y, 0.8, { fill: red, stroke: 'none' })].join('');
    /* bedroom 1 */
    out.push(light(67, 44)); out.push(fan(67, 106));
    out.push(light(67, 150));
    out.push(sock(120, 40)); out.push(sock(120, 60)); out.push(sock(12, 150));
    out.push(sw(126, 118));
    /* bedroom 2 */
    out.push(light(317, 44)); out.push(fan(317, 106)); out.push(light(317, 150));
    out.push(sock(262, 40)); out.push(sock(262, 60)); out.push(sock(360, 150));
    out.push(sw(258, 86));
    /* sitting */
    out.push(light(192, 96)); out.push(fan(192, 140)); out.push(light(192, 172));
    out.push(sock(136, 130)); out.push(sock(230, 78)); out.push(sock(246, 168));
    out.push(sw(178, 178));
    /* kitchen + bath */
    out.push(light(220, 36)); out.push(sock(240, 40)); out.push(sock(196, 54));
    out.push(sw(196, 74));
    out.push(light(158, 26, 1)); out.push(sw(178, 74));
    out.push(sock(182, 58));
    /* SDB */
    out.push(R(126, 150, 6, 14, { fill: 'var(--ink)', stroke: 'none' }));
    out.push(T(118, 158, 'SDB', { fs: 4.2, fill: 'var(--ink)', anchor: 'end' }));
    out.push(T(118, 164, '6-WAY', { fs: 3.4, fill: 'var(--ink-40)', anchor: 'end' }));
    /* conduit (dashed) */
    out.push(P([[129, 158], [180, 158], [180, 120], [120, 120]], { stroke: red, sw: 0.35, dash: '3 2', op: 0.5 }));
    out.push(P([[192, 96], [192, 74], [220, 74], [220, 36]], { stroke: red, sw: 0.35, dash: '3 2', op: 0.5 }));
    /* outdoor / pump */
    out.push(sock(200, 210)); out.push(T(207, 213, 'পাম্প পয়েন্ট 16A', { fs: 3.8, fill: red, anchor: 'start' }));
  }

  /* ---- room labels ---- */
  out.push(roomLabel(67, 96, 'বেডরুম ১', 'Bedroom 01', '10\'-4" × 15\'-2"', r1(AREA.bed1)));
  out.push(roomLabel(317, 96, 'বেডরুম ২', 'Bedroom 02', '10\'-4" × 15\'-2"', r1(AREA.bed2)));
  out.push(roomLabel(192, 122, 'বসার ঘর', 'Living / Sit-out', '10\'-0" × 9\'-9"', r1(AREA.sit)));
  out.push(T(159, 62, 'বাথরুম', { fs: 6.6, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(159, 69, '4\'-6"×5\'-2" · ' + r1(AREA.bath) + ' SQFT', { fs: 4.4, fill: 'var(--ink-60)' }));
  out.push(T(220, 62, 'রান্নাঘর', { fs: 6.6, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(220, 69, '5\'-3"×5\'-2" · ' + r1(AREA.kit) + ' SQFT', { fs: 4.4, fill: 'var(--ink-60)' }));

  /* ---- dimensions ---- */
  if (on('dims')) {
    const dy = 208;
    out.push(dimH(0, 384, dy, '32\'-0"', { fs: 6.4 }));
    const chain = [0, 5, 129, 132, 252, 255, 379, 384].slice(0, 8);
    /* simplified chain */
    out.push(dimH(5, 129, dy - 12, '10\'-4"'));
    out.push(dimH(132, 252, dy - 12, '10\'-0"'));
    out.push(dimH(255, 379, dy - 12, '10\'-4"'));
    out.push(dimH(132, 186, dy - 24, '4\'-6"', { fs: 5.2 }));
    out.push(dimH(189, 252, dy - 24, '5\'-3"', { fs: 5.2 }));
    out.push(dimV(5, 67, -18, '5\'-2"'));
    out.push(dimV(70, 187, -18, '9\'-9"'));
    out.push(dimV(0, 192, -36, '16\'-0"', { fs: 6.4 }));
    /* opening dims on south wall */
    out.push(dimH(43, 91, 196, '4\'-0"', { fs: 4.6, ext: 3 }));
    out.push(dimH(172, 212, 196, '3\'-4"', { fs: 4.6, ext: 3 }));
    out.push(dimH(293, 341, 196, '4\'-0"', { fs: 4.6, ext: 3 }));
  }

  /* ---- annotation ---- */
  out.push(northArrow(430, 34, 13));
  out.push(scaleBar(-60, 236, 120));
  /* section markers */
  out.push(bubble(-52, 96, 7, 'A', { len: 20 }));
  out.push(L(-45, 96, -14, 96, { stroke: 'var(--ink)', sw: 0.5, dash: '6 3' }));
  out.push(T(-46, 116, 'A', { fs: 6, fill: 'var(--ink)' }));
  out.push(bubble(110, 232, 7, 'B', { len: 0 }));
  out.push(bubble(300, 232, 7, 'B', { len: 0 }));
  out.push(L(110, 225, 300, 225, { stroke: 'var(--ink)', sw: 0.5, dash: '6 3' }));

  /* room name watermark */
  out.push(T(192, -26, 'ফ্লোর প্ল্যান', { fs: 8.4, ff: 'var(--f-bn)', fill: 'var(--ink-60)', ls: '1' }));
  out.push(T(192, -16, 'GROUND FLOOR PLAN — 1:50', { fs: 4.8, fill: 'var(--ink-40)', ls: '1.6' }));

  return svg(560, 300, '-82 -50 552 300', out.join(''));
}

/* ---------- SITE PLAN ---------------------------------------------------- */
export function sitePlan() {
  const out = [defs()];
  const S = 1.0;
  /* plot 60' x 50' => 720 x 600 */
  out.push(R(0, 0, 720, 600, { fill: 'rgba(91,115,85,.05)', stroke: 'var(--ink)', sw: 1.2, dash: '8 4' }));
  out.push(T(360, -12, 'সীমানা / PLOT BOUNDARY', { fs: 6, fill: 'var(--ink-40)', ls: '1.2' }));

  /* house footprint, offset */
  const hx = 150, hy = 150;
  out.push(R(hx, hy, 384, 192, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 2 }));
  /* roof outline dashed */
  out.push(R(hx - 24, hy - 30, 432, 252, { fill: 'none', stroke: 'var(--ink-40)', sw: 0.7, dash: '6 3' }));
  out.push(T(hx + 192, hy + 102, 'মূল ভবন', { fs: 7, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(hx + 192, hy + 112, 'MAIN HOUSE · 32\'-0" × 16\'-0"', { fs: 4.6, fill: 'var(--ink-60)' }));

  /* front verandah / apron */
  out.push(R(hx, hy + 192, 384, 60, { fill: 'rgba(18,20,26,.03)', stroke: 'var(--ink-40)', sw: 0.6 }));
  out.push(T(hx + 192, hy + 226, 'প্রবেশ চত্বর ও শুকানোর আঙিনা · 5\'-0" APRON', { fs: 4.6, fill: 'var(--ink-60)' }));

  /* future room east */
  out.push(R(hx + 384, hy + 24, 144, 144, { fill: 'none', stroke: 'var(--red)', sw: 0.8, dash: '7 4' }));
  out.push(T(hx + 456, hy + 92, 'ভবিষ্যৎ রুম', { fs: 6, ff: 'var(--f-bn)', fill: 'var(--red)' }));
  out.push(T(hx + 456, hy + 101, 'FUTURE ROOM F1', { fs: 4.2, fill: 'var(--red)' }));
  out.push(T(hx + 456, hy + 110, '12\'-0" × 12\'-0"', { fs: 4.2, fill: 'var(--red)' }));

  /* tubewell */
  const tw = [96, 470];
  out.push(C(tw[0], tw[1], 9, { fill: 'var(--paper-2)', stroke: 'var(--blue)', sw: 1.1 }));
  out.push(C(tw[0], tw[1], 3, { fill: 'var(--blue)', stroke: 'none' }));
  out.push(T(tw[0], tw[1] + 22, 'টিউবওয়েল', { fs: 5.4, ff: 'var(--f-bn)', fill: 'var(--blue)' }));
  out.push(T(tw[0], tw[1] + 30, 'TUBEWELL (EXISTING)', { fs: 4, fill: 'var(--blue)' }));

  /* pump box */
  out.push(R(tw[0] - 16, tw[1] - 24, 32, 20, { fill: 'none', stroke: 'var(--blue)', sw: 0.6, dash: '3 2' }));
  out.push(T(tw[0], tw[1] - 29, '১HP পাম্প', { fs: 4.4, fill: 'var(--blue)' }));

  /* septic tank + soak pit, north-west of bath */
  out.push(R(hx + 60, hy - 96, 96, 62, { fill: 'url(#hatchX)', stroke: 'var(--green)', sw: 0.8 }));
  out.push(T(hx + 108, hy - 62, 'সেপটিক ট্যাংক', { fs: 4.8, ff: 'var(--f-bn)', fill: 'var(--green)' }));
  out.push(T(hx + 108, hy - 54, 'SEPTIC 8\'-0"×5\'-0"×5\'-0"', { fs: 4, fill: 'var(--green)' }));
  out.push(C(hx + 190, hy - 66, 20, { fill: 'url(#hatchGreen)', stroke: 'var(--green)', sw: 0.8 }));
  out.push(T(hx + 190, hy - 64, 'সোক পিট', { fs: 4.4, ff: 'var(--f-bn)', fill: 'var(--green)' }));
  out.push(T(hx + 190, hy - 57, 'Ø4\'×6\' DEEP', { fs: 3.6, fill: 'var(--green)' }));

  /* rainwater pits */
  out.push(C(hx - 40, hy + 220, 14, { fill: 'url(#hatchGreen)', stroke: 'var(--blue)', sw: 0.7 }));
  out.push(T(hx - 40, hy + 244, 'বৃষ্টির পানি', { fs: 4.4, ff: 'var(--f-bn)', fill: 'var(--blue)' }));
  out.push(T(hx - 40, hy + 251, 'SOAK PIT', { fs: 3.6, fill: 'var(--blue)' }));
  out.push(C(hx + 424, hy + 220, 14, { fill: 'url(#hatchGreen)', stroke: 'var(--blue)', sw: 0.7 }));

  /* approach path */
  out.push(R(hx + 150, hy + 252, 84, 300, { fill: 'rgba(18,20,26,.04)', stroke: 'var(--ink-40)', sw: 0.5, dash: '4 4' }));
  out.push(T(hx + 192, hy + 400, 'প্রবেশ পথ · 7\'-0" PATH', { fs: 4.6, fill: 'var(--ink-60)' }));
  out.push(P([[hx + 192, hy + 252], [hx + 192, hy + 192]], { stroke: 'var(--ink)', sw: 1.2, dash: '7 4' }));

  /* trees */
  [[60, 90], [660, 120], [700, 480], [40, 560]].forEach(([x, y]) => {
    out.push(C(x, y, 22, { fill: 'rgba(91,115,85,.10)', stroke: 'var(--green)', sw: 0.6, dash: '2 2' }));
    out.push(C(x, y, 5, { fill: 'var(--green)', stroke: 'none', op: 0.5 }));
  });

  /* north + scale */
  out.push(northArrow(680, 40, 15));
  out.push(scaleBar(30, 570, 120));

  /* road edge */
  out.push(L(0, 596, 720, 596, { stroke: 'var(--ink-40)', sw: 1.4 }));
  out.push(T(360, 614, 'গ্রামের রাস্তা · VILLAGE ROAD (SOUTH)', { fs: 5, fill: 'var(--ink-60)', ls: '1' }));

  return svg(760, 640, '-20 -30 760 660', out.join(''));
}

/* ---------- ROOF PLAN ---------------------------------------------------- */
export function roofPlan(active = {}) {
  const on = (k) => active[k] !== false;
  const out = [defs()];
  /* roof extent: 32+2' each side = 432 ; 16 + 2'6 both = 252 */
  const OX = 24, OY = 30, RW = 432, RH = 252;
  const ridgeY = OY + RH / 2;

  out.push(R(OX, OY, RW, RH, { fill: 'var(--paper-2)', stroke: 'none' }));
  /* two slopes */
  out.push(R(OX, OY, RW, RH / 2, { fill: 'rgba(176,58,46,.14)', stroke: 'none' }));
  out.push(R(OX, ridgeY, RW, RH / 2, { fill: 'rgba(35,40,47,.13)', stroke: 'none' }));
  out.push(R(OX, OY, RW, RH, { fill: 'none', stroke: 'var(--ink)', sw: 1.4 }));
  out.push(L(OX, ridgeY, OX + RW, ridgeY, { stroke: 'var(--ink)', sw: 1.8 }));

  /* sheet lines: 2'-2" cover => every 26" */
  for (let x = OX + 26; x < OX + RW; x += 26) {
    out.push(L(x, OY, x, OY + RH, { stroke: 'var(--ink)', sw: 0.3, op: 0.35 }));
  }
  /* purlin lines 2'-0" c/c drawn dashed */
  if (on('structure')) {
    for (let y = OY + 24; y < OY + RH; y += 24) {
      if (Math.abs(y - ridgeY) < 6) continue;
      out.push(L(OX, y, OX + RW, y, { stroke: 'var(--blue)', sw: 0.4, dash: '4 2', op: 0.6 }));
    }
    /* trusses every 4'-0" = 48 */
    for (let x = 0; x <= 432; x += 48) {
      if (x > 432) break;
      out.push(L(OX + x, OY, OX + x, OY + RH, { stroke: 'var(--red)', sw: 0.8, dash: '7 3', op: 0.85 }));
    }
  }

  /* ridge cap + barge */
  out.push(R(OX - 4, ridgeY - 5, RW + 8, 10, { fill: 'rgba(35,40,47,.22)', stroke: 'var(--ink)', sw: 0.6 }));
  out.push(T(OX + RW / 2, ridgeY + 1.8, 'RIDGE CAP 2\'-0" BLACK', { fs: 4.6, fill: 'var(--ink)' }));

  /* gutters */
  out.push(R(OX - 2, OY - 6, RW + 4, 6, { fill: 'var(--blue)', op: 0.25, stroke: 'var(--blue)', sw: 0.6 }));
  out.push(R(OX - 2, OY + RH, RW + 4, 6, { fill: 'var(--blue)', op: 0.25, stroke: 'var(--blue)', sw: 0.6 }));
  /* downpipes */
  [OX + 6, OX + RW - 6].forEach((x) => {
    out.push(C(x, OY - 9, 3, { fill: 'var(--blue)', stroke: 'none' }));
    out.push(C(x, OY + RH + 9, 3, { fill: 'var(--blue)', stroke: 'none' }));
  });
  out.push(T(OX + RW / 2, OY - 14, 'GUTTER 3" PVC + DOWNPIPE 3" → SOAK PIT', { fs: 4.2, fill: 'var(--blue)' }));
  out.push(T(OX + RW / 2, OY + RH + 18, 'GUTTER 3" PVC + DOWNPIPE 3" → SOAK PIT', { fs: 4.2, fill: 'var(--blue)' }));

  /* slope arrows */
  [[OX + 90, OY + 26], [OX + 250, OY + 26], [OX + 350, OY + 26]].forEach(([x, y]) => {
    out.push(L(x, y, x, y + 34, { stroke: 'var(--red)', sw: 0.9 }));
    out.push(P([[x - 4, y + 28], [x, y + 36], [x + 4, y + 28]], { closed: true, fill: 'var(--red)', stroke: 'none' }));
  });
  [[OX + 90, ridgeY + 70], [OX + 250, ridgeY + 70], [OX + 350, ridgeY + 70]].forEach(([x, y]) => {
    out.push(L(x, y, x, y + 34, { stroke: 'var(--ink)', sw: 0.9 }));
    out.push(P([[x - 4, y + 28], [x, y + 36], [x + 4, y + 28]], { closed: true, fill: 'var(--ink)', stroke: 'none' }));
  });

  /* labels per slope */
  out.push(T(OX + 250, OY + 96, 'দক্ষিণ ঢাল · লাল', { fs: 8, ff: 'var(--f-bn)', fill: 'var(--red)' }));
  out.push(T(OX + 250, OY + 107, 'SOUTH SLOPE · ROOF RED 22°', { fs: 4.8, fill: 'var(--red)', ls: '1' }));
  out.push(T(OX + 250, ridgeY + 116, 'উত্তর ঢাল · কালো', { fs: 8, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(OX + 250, ridgeY + 127, 'NORTH SLOPE · CHARCOAL BLACK 22°', { fs: 4.8, fill: 'var(--ink)', ls: '1' }));

  /* tank position */
  out.push(R(OX + 138, ridgeY - 46, 46, 40, { fill: 'var(--paper-2)', stroke: 'var(--blue)', sw: 0.8, dash: '3 2' }));
  out.push(T(OX + 161, ridgeY - 24, '৫০০L', { fs: 5, fill: 'var(--blue)' }));
  out.push(T(OX + 161, ridgeY - 16, 'TANK', { fs: 3.8, fill: 'var(--blue)' }));

  /* house outline below */
  out.push(R(OX + 24, OY + 30, 384, 192, { fill: 'none', stroke: 'var(--ink-40)', sw: 0.6, dash: '5 3' }));

  /* dims */
  out.push(dimH(OX, OX + RW, OY + RH + 40, '36\'-0" ROOF', { fs: 6 }));
  out.push(dimV(OY, OY + RH, OX - 18, '21\'-0"', { fs: 6 }));
  out.push(T(OX + RW / 2, OY - 26, 'ছাদের প্ল্যান', { fs: 8.2, ff: 'var(--f-bn)', fill: 'var(--ink-60)' }));
  out.push(T(OX + RW / 2, OY - 16, 'ROOF PLAN — 1:50 · DOUBLE-SHED 22°', { fs: 4.6, fill: 'var(--ink-40)', ls: '1.4' }));

  out.push(northArrow(OX + RW + 44, OY + 22, 12));
  return svg(540, 330, '-40 -36 540 336', out.join(''));
}

/* ---------- PARTI DIAGRAM ------------------------------------------------ */
export function partiDiagram() {
  const out = [defs()];
  const s = 5.6; /* px per ft for the mini */
  const W = 32 * s, D = 16 * s;
  /* outer */
  out.push(R(0, 0, W, D, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 1.2 }));
  /* private ends */
  const bw = (124 / 12) * s;
  out.push(R(0, 0, bw, D, { fill: 'rgba(176,58,46,.13)', stroke: 'var(--ink)', sw: 0.6 }));
  out.push(R(W - bw, 0, bw, D, { fill: 'rgba(176,58,46,.13)', stroke: 'var(--ink)', sw: 0.6 }));
  /* central void */
  const cw = (120 / 12) * s;
  const cx = bw + (3 / 12) * s;
  out.push(R(cx, 0, cw, D, { fill: 'rgba(46,76,109,.10)', stroke: 'var(--ink)', sw: 0.6 }));
  /* service band */
  const sw2 = (62 / 12) * s;
  out.push(R(cx, 0, cw, sw2, { fill: 'rgba(91,115,85,.20)', stroke: 'var(--ink)', sw: 0.6 }));
  /* labels */
  out.push(T(bw / 2, D / 2 + 3, 'PRIVATE', { fs: 5.2, fill: 'var(--red)', ls: '.6' }));
  out.push(T(W - bw / 2, D / 2 + 3, 'PRIVATE', { fs: 5.2, fill: 'var(--red)', ls: '.6' }));
  out.push(T(cx + cw / 2, D / 2 + 14, 'COMMON', { fs: 5.2, fill: 'var(--blue)', ls: '.6' }));
  out.push(T(cx + cw / 2, sw2 / 2 + 2, 'SERVICE', { fs: 4.4, fill: 'var(--green)', ls: '.5' }));
  /* arrows: entry + wind */
  out.push(P([[cx + cw / 2, D + 26], [cx + cw / 2, D + 6]], { stroke: 'var(--ink)', sw: 1 }));
  out.push(P([[cx + cw / 2 - 4, D + 12], [cx + cw / 2, D + 5], [cx + cw / 2 + 4, D + 12]], { closed: true, fill: 'var(--ink)', stroke: 'none' }));
  out.push(T(cx + cw / 2, D + 36, 'ENTRY · SOUTH', { fs: 4.2, fill: 'var(--ink-60)', ls: '.8' }));
  /* cross vent arrows */
  [0.28, 0.72].forEach((f) => {
    const x = W * f;
    out.push(L(x, 4, x, D - 4, { stroke: 'var(--blue)', sw: 0.5, dash: '3 3', op: 0.6 }));
  });
  out.push(T(W / 2, -8, 'SERVICE CORE CENTRED · BEDROOMS FLANK · CROSS VENTILATION', { fs: 4, fill: 'var(--ink-40)', ls: '.8' }));
  return svg(230, 130, '-6 -18 194 122', out.join(''));
}
