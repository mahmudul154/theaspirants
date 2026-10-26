/* ==========================================================================
   elev.js — four elevations, two sections, six construction details.
   Levels are in inches above natural ground (GL = 0).
   ========================================================================== */
import { U, svg, L, P, R, C, T, TB, dimH, dimV, northArrow, scaleBar, defs } from './draw-core.js';

export const LV = {
  gl: 0, plinth: 24, ffl: 24, wallTop: 144, eaveTip: 134, ridge: 182,
  head: 108, sill: 57,
};

const F = (z) => 268 - z;   /* z (height) -> screen y */
const hex = { red: 'rgba(176,58,46,.80)', black: 'rgba(35,40,47,.86)' };

/* ---------- shared bits -------------------------------------------------- */
function groundBand(x0, x1, y) {
  return [
    L(x0, y, x1, y, { stroke: 'var(--ink)', sw: 1.4 }),
    R(x0, y, x1 - x0, 22, { fill: 'url(#hatchEarth)', stroke: 'none' }),
    T(x0 + 4, y + 16, 'NGL', { fs: 4.4, anchor: 'start', fill: 'var(--ink-40)' }),
  ].join('');
}

function levelMark(x, z, label, side = 'left') {
  const y = F(z);
  const dir = side === 'left' ? -1 : 1;
  return [
    L(x, y, x + dir * 16, y, { stroke: 'var(--blue)', sw: 0.5 }),
    P([[x, y - 3], [x + dir * 5, y], [x, y + 3]], { closed: true, fill: 'var(--blue)', stroke: 'none' }),
    T(x + dir * 19, y + 1.8, label, { fs: 4.6, anchor: side === 'left' ? 'end' : 'start', fill: 'var(--blue)' }),
  ].join('');
}

/* win/door opening in an elevation face */
function opening(x, w, sill, head, kind = 'window', o = {}) {
  const out = [];
  const yTop = F(head);
  const h = head - sill;
  /* reveal */
  out.push(R(x, yTop, w, h, { fill: 'rgba(18,20,26,.10)', stroke: 'none' }));
  /* frame */
  out.push(R(x, yTop, w, h, { fill: 'none', stroke: 'var(--ink)', sw: 1 }));
  if (kind === 'window') {
    /* glass */
    out.push(R(x + 1.6, yTop + 1.6, w - 3.2, h - 3.2, { fill: 'rgba(46,76,109,.13)', stroke: 'none' }));
    /* sliding panels */
    const mid = x + w / 2;
    out.push(L(mid, yTop + 1.6, mid, yTop + h - 1.6, { stroke: 'var(--ink)', sw: 0.55 }));
    out.push(L(mid - 3, yTop + 1.6, mid + 3, yTop + h - 1.6, { stroke: 'var(--ink-40)', sw: 0.3 }));
    /* safety grill (drawn thin, "interior") */
    if (o.grill !== false) {
      const step = (w - 3) / Math.max(3, Math.round(w / 8));
      for (let gx = x + 2; gx < x + w - 1; gx += Math.max(6, step)) {
        out.push(L(gx, yTop + 2, gx, yTop + h - 2, { stroke: 'var(--ink)', sw: 0.28, op: 0.45 }));
      }
      for (let gy = yTop + 2; gy < yTop + h - 1; gy += Math.max(7, h / 4)) {
        out.push(L(x + 2, gy, x + w - 2, gy, { stroke: 'var(--ink)', sw: 0.28, op: 0.45 }));
      }
    }
  } else if (kind === 'door') {
    out.push(R(x + 1.6, yTop + 1.6, w - 3.2, h - 1.6, { fill: 'rgba(35,40,47,.88)', stroke: 'none' }));
    /* panel lines */
    out.push(R(x + 5, yTop + 5, w - 10, h * 0.42, { fill: 'none', stroke: 'rgba(244,241,234,.35)', sw: 0.5 }));
    out.push(R(x + 5, yTop + h * 0.55, w - 10, h * 0.36, { fill: 'none', stroke: 'rgba(244,241,234,.28)', sw: 0.5 }));
    /* handle + lock */
    out.push(C(x + w - 5, yTop + h * 0.5, 1.4, { fill: 'rgba(244,241,234,.8)', stroke: 'none' }));
    if (o.lock) out.push(R(x + w - 12, yTop + h * 0.5 - 5, 4, 10, { fill: 'none', stroke: 'rgba(244,241,234,.5)', sw: 0.45 }));
  } else if (kind === 'louver') {
    for (let gy = yTop + 1.5; gy < yTop + h - 1; gy += 3) {
      out.push(L(x + 1.5, gy, x + w - 1.5, gy, { stroke: 'var(--ink)', sw: 0.45 }));
    }
    out.push(R(x + 1.5, yTop + 1.5, w - 3, h - 3, { fill: 'rgba(46,76,109,.10)', stroke: 'none' }));
  }
  if (sill > LV.ffl) {
    /* external sill projection */
    out.push(R(x - 2, F(sill), w + 4, 2.4, { fill: 'rgba(18,20,26,.10)', stroke: 'var(--ink)', sw: 0.4 }));
  }
  return out.join('');
}

/* ---------- generic elevation ------------------------------------------- */
function elevation({ width, overhang, roof, openings, title, subtitle, tags, northSide = 'north', isGable = false }) {
  const out = [defs()];
  const x0 = -overhang, x1 = width + overhang;
  const gx0 = x0 - 30, gx1 = x1 + 34;

  /* ground */
  out.push(groundBand(gx0, gx1, F(0)));

  /* plinth block */
  out.push(R(x0 + overhang, F(LV.plinth), width, LV.plinth, { fill: 'rgba(18,20,26,.07)', stroke: 'none' }));
  out.push(L(0, F(0), 0, F(LV.plinth), { stroke: 'var(--ink)', sw: 0.8 }));
  out.push(L(width, F(0), width, F(LV.plinth), { stroke: 'var(--ink)', sw: 0.8 }));

  /* wall field */
  if (!isGable) {
    out.push(R(0, F(LV.wallTop), width, LV.wallTop - LV.plinth, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 1 }));
  } else {
    /* gable wall + triangle */
    out.push(R(0, F(LV.wallTop), width, LV.wallTop - LV.plinth, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 1 }));
    out.push(P([[0, F(LV.wallTop)], [width / 2, F(LV.ridge)], [width, F(LV.wallTop)]], { closed: true, fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 1 }));
    /* roof rake bands */
    const rake = (sx, ex) => {
      const ya = F(LV.eaveTip), yb = F(LV.ridge);
      return P([[sx, ya], [ex, yb], [ex, yb - 0], [sx, ya]], { closed: false, stroke: 'none' });
    };
    /* draw roof as thick band along both rakes */
    const band = (p1, p2, col) => {
      const dx = p2[0] - p1[0], dz = p2[1] - p1[1];
      const len = Math.hypot(dx, dz);
      let nx = (-dz / len) * 5.5, nz = (dx / len) * 5.5;
      if (nz < 0) { nx = -nx; nz = -nz; }
      return P([[p1[0], F(p1[1])], [p2[0], F(p2[1])], [p2[0] + nx, F(p2[1]) + nz], [p1[0] + nx, F(p1[1]) + nz]], { closed: true, fill: col, stroke: 'var(--ink)', sw: 0.5, op: 0.95 }).replace(/F/g, 'F');
    };
    out.push(band([-overhang, LV.eaveTip], [width / 2, LV.ridge], hex.red));
    out.push(band([width + overhang, LV.eaveTip], [width / 2, LV.ridge], hex.black));
    /* barge board line */
    out.push(L(-overhang, F(LV.eaveTip) + 5.5, width / 2, F(LV.ridge) + 5.5, { stroke: 'var(--ink)', sw: 0.9 }));
    out.push(L(width + overhang, F(LV.eaveTip) + 5.5, width / 2, F(LV.ridge) + 5.5, { stroke: 'var(--ink)', sw: 0.9 }));
  }

  /* roof band for eaves elevations */
  if (!isGable) {
    const col = roof === 'south' ? hex.red : hex.black;
    out.push(R(x0, F(LV.ridge), x1 - x0, LV.ridge - LV.eaveTip, { fill: col, stroke: 'var(--ink)', sw: 0.6, op: 0.95 }));
    /* corrugation rhythm */
    for (let x = x0 + 6; x < x1; x += 13) {
      out.push(L(x, F(LV.ridge), x, F(LV.eaveTip), { stroke: 'rgba(0,0,0,.18)', sw: 0.35 }));
    }
    /* ridge cap */
    out.push(R(x0, F(LV.ridge) - 6, x1 - x0, 7, { fill: 'rgba(35,40,47,.92)', stroke: 'var(--ink)', sw: 0.5 }));
    /* fascia */
    out.push(R(x0, F(LV.eaveTip), x1 - x0, 6, { fill: 'rgba(35,40,47,.70)', stroke: 'var(--ink)', sw: 0.5 }));
    /* eave shadow */
    out.push(R(0, F(LV.eaveTip) + 6, width, 7, { fill: 'var(--ink)', op: 0.08, stroke: 'none' }));
  }

  /* openings */
  openings.forEach((op) => out.push(opening(op.x, op.w, op.sill, op.head, op.kind || 'window', op)));

  /* vertical corner line + slight shading on right */
  out.push(L(width, F(LV.wallTop), width, F(LV.plinth), { stroke: 'var(--ink)', sw: 0.6, op: 0.5 }));

  /* levels */
  out.push(levelMark(-4, 0, '±0 GL', 'left'));
  out.push(levelMark(-4, LV.ffl, '+2\'-0" FFL', 'left'));
  out.push(levelMark(-4, LV.wallTop, '+12\'-0" WALL TOP', 'left'));
  out.push(levelMark(-4, LV.ridge, '+15\'-2" RIDGE', 'left'));

  /* dims */
  out.push(dimH(0, width, F(0) + 34, isGable ? '16\'-0"' : '32\'-0"', { fs: 6.4 }));
  if (!isGable) {
    out.push(dimH(43, 91, F(0) + 22, "4'-0\"", { fs: 4.6, ext: 3 }));
    out.push(dimH(172, 212, F(0) + 22, "3'-4\"", { fs: 4.6, ext: 3 }));
    out.push(dimH(293, 341, F(0) + 22, "4'-0\"", { fs: 4.6, ext: 3 }));
  }

  /* titles */
  out.push(T(width / 2, -46, title, { fs: 9, ff: 'var(--f-bn)', fill: 'var(--ink-60)', ls: '.6' }));
  out.push(T(width / 2, -35, subtitle, { fs: 4.8, fill: 'var(--ink-40)', ls: '1.5' }));

  /* material tags */
  (tags || []).forEach((t) => {
    const tx = t.x, ty = F(t.z);
    out.push(L(tx, ty, tx + t.dx, ty + t.dy, { stroke: 'var(--red)', sw: 0.4 }));
    out.push(C(tx, ty, 1.4, { fill: 'var(--red)', stroke: 'none' }));
    out.push(T(tx + t.dx, ty + t.dy - 2, t.label, { fs: 4.4, anchor: t.anchor || 'start', fill: 'var(--red)' }));
  });

  /* north marker on gables */
  if (isGable) {
    out.push(T(northSide === 'north' ? -12 : width + 12, F(LV.eaveTip) + 12, northSide === 'north' ? '← N' : 'N →', { fs: 4.6, fill: 'var(--ink-40)' }));
  }

  return svg(480, 350, `${gx0} -60 ${gx1 - gx0} 350`, out.join(''));
}

/* ---------- the four elevations ----------------------------------------- */
export function southElevation() {
  return elevation({
    width: 384, overhang: 24, roof: 'south',
    title: 'দক্ষিণ সম্মুখভাগ — প্রধান প্রবেশ',
    subtitle: 'SOUTH ELEVATION · FRONT · 1:50 · RED SLOPE',
    openings: [
      { x: 43, w: 48, sill: 57, head: 105, kind: 'window' },
      { x: 136, w: 30, sill: 45, head: 105, kind: 'window' },
      { x: 172, w: 40, sill: 24, head: 108, kind: 'door', lock: true },
      { x: 218, w: 30, sill: 45, head: 105, kind: 'window' },
      { x: 293, w: 48, sill: 57, head: 105, kind: 'window' },
    ],
    tags: [
      { x: 306, z: 168, dx: 26, dy: -16, label: 'রেড কার্টেন-কোটেড করগেটেড শিট ০.৪৭মিমি' },
      { x: 348, z: 138, dx: 26, dy: 10, label: 'চারকোল ফ্যাসিয়া + গাটার' },
      { x: 20, z: 120, dx: -34, dy: -12, label: 'সাদা ওয়েদার-প্রুফ ফিনিশ (২ কোট)', anchor: 'end' },
      { x: 316, z: 78, dx: 30, dy: -4, label: 'থাই স্লাইডিং গ্লাস + ইন্টেরিয়র গ্রিল' },
      { x: 176, z: 66, dx: -40, dy: 18, label: 'MS স্টিল দরজা + ৮-লিভার লক' },
    ],
  });
}

export function northElevation() {
  return elevation({
    width: 384, overhang: 24, roof: 'north',
    title: 'উত্তর সম্মুখভাগ — পিছনের আঙিনা',
    subtitle: 'NORTH ELEVATION · REAR · 1:50 · CHARCOAL SLOPE',
    openings: [
      { x: 49, w: 36, sill: 63, head: 99, kind: 'window' },
      { x: 144, w: 24, sill: 84, head: 102, kind: 'louver' },
      { x: 190, w: 26, sill: 66, head: 90, kind: 'window' },
      { x: 218, w: 30, sill: 24, head: 104, kind: 'door' },
      { x: 279, w: 36, sill: 63, head: 99, kind: 'window' },
    ],
    tags: [
      { x: 300, z: 168, dx: 24, dy: -14, label: 'ব্ল্যাক শিট — উত্তরের আর্দ্রতা ও শ্যাওলা প্রতিরোধী' },
      { x: 156, z: 92, dx: 30, dy: -20, label: 'বাথরুম হাই-লেভেল লুভার (৬\'-০" সিল)' },
      { x: 230, z: 60, dx: 26, dy: 16, label: 'রান্নাঘরের ব্যাক ডোর → শুকানোর আঙিনা' },
    ],
  });
}

export function westElevation() {
  return elevation({
    width: 192, overhang: 24, roof: 'gable', isGable: true, northSide: 'north',
    title: 'পশ্চিম প্রান্ত — গ্যাবল',
    subtitle: 'WEST ELEVATION · GABLE END · 1:50 · NO WEST OPENING',
    openings: [
      { x: 66, w: 24, sill: 108, head: 120, kind: 'louver' },
    ],
    tags: [
      { x: 90, z: 158, dx: 30, dy: -12, label: 'রিজ ক্যাপ + বার্জ বোর্ড' },
      { x: 78, z: 114, dx: 34, dy: 6, label: 'হাই-লেভেল ভেন্টিলেটর (গরম বাতাস বের)' },
      { x: 96, z: 40, dx: 34, dy: 14, label: 'পশ্চিমে কোনো জানালা নেই — বিকেলের রোদ ব্লক' },
    ],
  });
}

export function eastElevation() {
  return elevation({
    width: 192, overhang: 24, roof: 'gable', isGable: true, northSide: 'south',
    title: 'পূর্ব প্রান্ত — ভবিষ্যৎ রুমের দিক',
    subtitle: 'EAST ELEVATION · GABLE END · 1:50 · FUTURE OPENING',
    openings: [
      { x: 66, w: 24, sill: 108, head: 120, kind: 'louver' },
    ],
    tags: [
      { x: 96, z: 96, dx: 34, dy: -6, label: 'ভবিষ্যৎ রুমের জন্য নক-আউট প্যানেল (লিন্টেল সহ)' },
      { x: 60, z: 150, dx: 32, dy: -10, label: 'ট্রাসের বেয়ারিং ও অ্যাংকর' },
    ],
  });
}

/* ---------- SECTIONS ----------------------------------------------------- */
/* z-axis helper for sections: x is plan-depth (inches), y is height */
function secBase(out, x0, x1) {
  out.push(groundBand(x0, x1, F(0)));
  /* earth below */
  out.push(R(x0, F(-30), x1 - x0, 30, { fill: 'url(#hatchEarth)', stroke: 'none', op: 0.5 }));
  out.push(L(x0, F(-30), x1, F(-30), { stroke: 'var(--ink-40)', sw: 0.4, dash: '4 3' }));
}

export function sectionAA() {
  const out = [defs()];
  const x0 = -56, x1 = 248;
  secBase(out, x0, x1);

  /* ---- foundation ---- */
  /* footing 16" wide x 8" deep at -34 */
  const fY = F(-34), fH = 9;
  out.push(R(-16, fY, 208, fH, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.9 }));
  out.push(R(-19, fY + fH, 214, 4, { fill: 'rgba(18,20,26,.15)', stroke: 'var(--ink)', sw: 0.6 }));
  /* plinth wall */
  out.push(R(0, F(24), 5, 24 + 34, { fill: 'rgba(18,20,26,.10)', stroke: 'var(--ink)', sw: 0.8 }));
  out.push(R(187, F(24), 5, 24 + 34, { fill: 'rgba(18,20,26,.10)', stroke: 'var(--ink)', sw: 0.8 }));
  /* plinth beam */
  out.push(R(0, F(24) - 9, 192, 9, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.7 }));
  out.push(T(96, F(19) + 2.6, 'RCC PLINTH BEAM 6"×9" · 4-Ø12', { fs: 4.2, fill: 'var(--ink-60)' }));

  /* ---- floor build-up ---- */
  out.push(R(5, F(24), 182, 12, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.5 }));
  out.push(R(5, F(24) - 3, 182, 3, { fill: 'rgba(18,20,26,.35)', stroke: 'var(--ink)', sw: 0.5 }));
  out.push(T(96, F(24) + 16, '৩" কংক্রিট + ১½" নেট সিমেন্ট পলিশ ফ্লোর', { fs: 4.2, fill: 'var(--ink-60)' }));

  /* ---- walls ---- */
  out.push(R(0, F(LV.wallTop), 5, LV.wallTop - 24, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.8 }));
  out.push(R(187, F(LV.wallTop), 5, LV.wallTop - 24, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.8 }));
  /* kitchen / sitting partition (y=67..70) */
  out.push(R(67, F(LV.wallTop), 3, LV.wallTop - 24, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.7 }));

  /* south door (in section: opening) */
  out.push(R(187, F(108), 5, 84, { fill: 'none', stroke: 'var(--ink)', sw: 0.4, dash: '2 2' }));
  out.push(T(196, F(60), 'D1', { fs: 4.4, anchor: 'start', fill: 'var(--ink-60)' }));
  /* north kitchen window */
  out.push(R(0, F(90), 5, 24, { fill: 'rgba(46,76,109,.18)', stroke: 'var(--ink)', sw: 0.6 }));
  out.push(T(9, F(78), 'W8', { fs: 4.4, anchor: 'start', fill: 'var(--ink-60)' }));
  /* lintel band */
  out.push(R(0, F(LV.wallTop) - 0, 192, 7, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.5, op: 0.9 }));

  /* ---- roof ---- */
  const eaveS = [208, LV.eaveTip], ridge = [96, LV.ridge], eaveN = [-16, LV.eaveTip];
  const roofBand = (a, b, col) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz);
    let nx = (dz / len) * 5, nz = (-dx / len) * 5;
    if (nz < 0) { nx = -nx; nz = -nz; }
    return P([[a[0], F(a[1])], [b[0], F(b[1])], [b[0] + nx, F(b[1]) + nz], [a[0] + nx, F(a[1]) + nz]], { closed: true, fill: col, stroke: 'var(--ink)', sw: 0.6, op: 0.95 });
  };
  out.push(roofBand(eaveS, ridge, hex.red));
  out.push(roofBand(eaveN, ridge, hex.black));

  /* rafters / truss in section (thin) */
  out.push(L(-16, F(LV.eaveTip) + 5, 96, F(LV.ridge) + 5, { stroke: 'var(--ink)', sw: 0.4, dash: '3 2' }));
  out.push(L(208, F(LV.eaveTip) + 5, 96, F(LV.ridge) + 5, { stroke: 'var(--ink)', sw: 0.4, dash: '3 2' }));
  /* bottom chord */
  out.push(L(0, F(LV.wallTop), 192, F(LV.wallTop), { stroke: 'var(--ink)', sw: 0.9 }));
  /* king post + struts */
  out.push(L(96, F(LV.wallTop), 96, F(LV.ridge) - 4, { stroke: 'var(--ink)', sw: 0.8 }));
  out.push(L(48, F(LV.wallTop), 48, F(LV.wallTop + 20), { stroke: 'var(--ink)', sw: 0.6, dash: '3 2' }));
  out.push(T(96, F(150), 'KING POST TRUSS 50×50×5 MS ANGLE', { fs: 4.2, fill: 'var(--ink-60)' }));

  /* tank platform above bath */
  out.push(R(8, F(146), 54, 3, { fill: 'var(--ink)', stroke: 'none', op: 0.8 }));
  out.push(L(8, F(146), 8, F(144), { stroke: 'var(--ink)', sw: 0.6 }));
  out.push(R(14, F(146) - 26, 42, 26, { fill: 'var(--blue)', op: 0.13, stroke: 'var(--blue)', sw: 0.7 }));
  out.push(T(35, F(133), '৫০০L', { fs: 5, fill: 'var(--blue)' }));
  out.push(T(35, F(126), 'TANK', { fs: 3.6, fill: 'var(--blue)' }));

  /* ceiling (optional) */
  out.push(L(5, F(120), 187, F(120), { stroke: 'var(--ink-40)', sw: 0.5, dash: '5 3' }));
  out.push(T(150, F(117), 'সিলিং (ঐচ্ছিক)', { fs: 4, fill: 'var(--ink-40)' }));

  /* levels */
  out.push(levelMark(-8, 0, '±0', 'left'));
  out.push(levelMark(-8, 24, "+2'-0\"", 'left'));
  out.push(levelMark(-8, 144, "+12'-0\"", 'left'));
  out.push(levelMark(-8, 182, "+15'-2\" RIDGE", 'left'));

  /* horizontal dims */
  out.push(dimH(0, 192, F(-52), '16\'-0"', { fs: 6 }));
  out.push(dimH(0, 67, F(-44), '5\'-7"', { fs: 4.4, ext: 3 }));
  out.push(dimH(70, 187, F(-44), '9\'-9"', { fs: 4.4, ext: 3 }));
  out.push(dimH(5, 67, F(-62), 'রান্নাঘর', { fs: 4.4, ext: 0, text: 'var(--ink-40)' }));

  /* vertical dim for wall height */
  out.push(dimV(F(24), F(144), 224, '10\'-0"'));

  out.push(T(96, -46, 'সেকশন A–A', { fs: 9, ff: 'var(--f-bn)', fill: 'var(--ink-60)' }));
  out.push(T(96, -35, 'SECTION A–A THROUGH SERVICE CORE · 1:50', { fs: 4.8, fill: 'var(--ink-40)', ls: '1.4' }));

  /* tags */
  const tag = (x, z, dx, dy, label) => [
    L(x, F(z), x + dx, F(z) + dy, { stroke: 'var(--red)', sw: 0.4 }),
    C(x, F(z), 1.3, { fill: 'var(--red)', stroke: 'none' }),
    T(x + dx, F(z) + dy - 2, label, { fs: 4.2, anchor: dx < 0 ? 'end' : 'start', fill: 'var(--red)' }),
  ].join('');
  out.push(tag(120, 176, 30, -14, 'রিজ ক্যাপ'));
  out.push(tag(150, 160, 24, 16, '০.৪৭ মিমি শিট + অ্যালু ফয়েল ইনসুলেশন'));
  out.push(tag(30, 30, -30, 16, 'স্ট্রিপ ফুটিং ১৬"×৯"'));
  out.push(tag(160, 138, 22, 20, 'ট্রাস বটম কর্ড = ওয়াল টপ'));
  out.push(tag(35, 150, 20, -18, 'MS প্ল্যাটফর্মে ট্যাংক'));

  return svg(480, 360, '-70 -60 360 380', out.join(''));
}

export function sectionBB() {
  const out = [defs()];
  const x0 = -56, x1 = 440;
  secBase(out, x0, x1);
  const zRoofAtY = (y) => {
    /* roof height at plan-depth y */
    if (y <= 96) return LV.eaveTip + (y + 24) * 0.404;
    return LV.ridge - (y - 96) * 0.404;
  };
  const zr = zRoofAtY(120); /* cut at y=120 */

  /* foundations at x=0 and x=384 */
  [0, 384].forEach((x) => {
    out.push(R(x - 16, F(-34), 21, 9, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.9 }));
    out.push(R(x - 2, F(24), 5, 58, { fill: 'rgba(18,20,26,.10)', stroke: 'var(--ink)', sw: 0.8 }));
  });
  /* partitions */
  out.push(R(129, F(24), 3, 120, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.7 }));
  out.push(R(252, F(24), 3, 120, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.7 }));
  out.push(R(0, F(24), 5, 120 - 24, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.8 }));
  out.push(R(379, F(24), 5, 120 - 24, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.8 }));
  /* floor */
  out.push(R(5, F(24), 374, 12, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.5 }));
  out.push(R(5, F(24) - 3, 374, 3, { fill: 'rgba(18,20,26,.35)', stroke: 'none' }));

  /* roof line + truss silhouette */
  out.push(R(-24, F(zr), 432, 6, { fill: hex.red, stroke: 'var(--ink)', sw: 0.6, op: 0.95 }));
  /* the visible truss beyond the cut */
  const ty = F(LV.wallTop), ry = F(LV.ridge);
  out.push(P([[0, ty], [192, ry], [384, ty]], { stroke: 'var(--ink-40)', sw: 0.5, dash: '4 2' }));
  out.push(L(0, ty, 384, ty, { stroke: 'var(--ink)', sw: 0.8 }));
  out.push(L(192, ty, 192, ry, { stroke: 'var(--ink-40)', sw: 0.5, dash: '4 2' }));
  /* purlins in section */
  for (let i = 1; i < 6; i++) {
    const x = (384 / 6) * i;
    out.push(C(x, F(zr) + 3, 1.6, { fill: 'var(--ink-60)', stroke: 'none' }));
  }
  /* wall top band */
  out.push(R(0, F(144), 384, 6, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.5 }));

  /* door openings visible in this cut */
  out.push(R(129, F(104), 3, 80, { fill: 'none', stroke: 'var(--ink-40)', sw: 0.4, dash: '2 2' }));
  out.push(R(252, F(104), 3, 80, { fill: 'none', stroke: 'var(--ink-40)', sw: 0.4, dash: '2 2' }));

  /* ceiling level */
  out.push(L(5, F(120), 379, F(120), { stroke: 'var(--ink-40)', sw: 0.5, dash: '5 3' }));

  out.push(levelMark(-8, 0, '±0', 'left'));
  out.push(levelMark(-8, 24, "+2'-0\"", 'left'));
  out.push(levelMark(-8, 144, "+12'-0\"", 'left'));
  out.push(levelMark(-8, Math.round(zr), 'ROOF', 'left'));

  out.push(dimH(5, 129, F(-44), "10'-4\"", { fs: 5 }));
  out.push(dimH(132, 252, F(-44), "10'-0\"", { fs: 5 }));
  out.push(dimH(255, 379, F(-44), "10'-4\"", { fs: 5 }));
  out.push(dimH(0, 384, F(-56), "32'-0\"", { fs: 6.4 }));

  out.push(T(192, -46, 'সেকশন B–B', { fs: 9, ff: 'var(--f-bn)', fill: 'var(--ink-60)' }));
  out.push(T(192, -35, 'SECTION B–B THROUGH BOTH BEDROOMS · 1:50', { fs: 4.8, fill: 'var(--ink-40)', ls: '1.4' }));

  const tag = (x, z, dx, dy, label) => [
    L(x, F(z), x + dx, F(z) + dy, { stroke: 'var(--red)', sw: 0.4 }),
    C(x, F(z), 1.3, { fill: 'var(--red)', stroke: 'none' }),
    T(x + dx, F(z) + dy - 2, label, { fs: 4.2, anchor: dx < 0 ? 'end' : 'start', fill: 'var(--red)' }),
  ].join('');
  out.push(tag(300, 150, 26, -16, 'লিন্টেল ব্যান্ড সব ওপেনিংয়ের উপরে'));
  out.push(tag(140, 120, -30, -14, '৪" পার্টিশন — ৭৫মিমি ব্লক'));
  out.push(tag(200, 40, 20, 20, 'প্লিন্থ বিম — ভূমিকম্প জোন ৩ (Z=0.28)'));
  out.push(tag(360, 166, 22, 10, 'রুফ লাইন (y=120-এ কাট)'));

  return svg(520, 360, '-70 -60 520 380', out.join(''));
}

/* ---------- DETAILS ------------------------------------------------------ */
const DVB = '0 -18 300 214';

export function detailFooting() {
  const out = [defs()];
  out.push(R(0, 0, 300, 214, { fill: 'var(--paper-2)', stroke: 'none' }));
  const gy = 118;
  out.push(L(0, gy, 300, gy, { stroke: 'var(--ink)', sw: 1.1 }));
  out.push(R(0, gy, 300, 96, { fill: 'url(#hatchEarth)', stroke: 'none', op: 0.6 }));
  /* footing */
  out.push(R(56, gy + 48, 150, 20, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.9 }));
  out.push(R(50, gy + 68, 162, 10, { fill: 'rgba(18,20,26,.14)', stroke: 'var(--ink)', sw: 0.7 }));
  /* brick footing courses */
  out.push(R(80, gy + 26, 102, 22, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.7 }));
  /* plinth beam */
  out.push(R(92, gy + 4, 78, 22, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.8 }));
  out.push(R(98, gy + 10, 66, 5, { fill: 'none', stroke: 'var(--red)', sw: 0.6 }));
  /* wall */
  out.push(R(106, gy - 66, 50, 70, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.8 }));
  /* floor */
  out.push(R(156, gy - 10, 110, 10, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.5 }));
  out.push(R(156, gy - 12, 110, 2, { fill: 'var(--ink)', stroke: 'none', op: 0.75 }));
  /* DPC */
  out.push(L(98, gy + 4, 170, gy + 4, { stroke: 'var(--blue)', sw: 1.4 }));

  out.push(T(150, 20, 'স্ট্রিপ ফুটিং ও প্লিন্থ বিম', { fs: 7.4, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(150, 30, 'STRIP FOOTING + PLINTH BEAM · 1:10', { fs: 4.4, fill: 'var(--ink-40)', ls: '1.2' }));
  const lbl = (x, y, t, anchor = 'start') => T(x, y, t, { fs: 4, anchor, fill: 'var(--ink-60)' });
  out.push(lbl(214, gy + 22, '6"×9" RCC plinth beam', 'start'));
  out.push(lbl(214, gy + 30, '4-Ø12 + Ø8 stirrup @ 6" c/c', 'start'));
  out.push(lbl(214, gy + 58, '16"×9" RCC footing', 'start'));
  out.push(lbl(214, gy + 66, '4-Ø10 main bar', 'start'));
  out.push(lbl(214, gy + 76, '3" PCC 1:3:6 bed', 'start'));
  out.push(lbl(240, gy + 16, 'DPC 1½" 1:2', 'start'));
  out.push(lbl(240, gy + -8, '৩" কংক্রিট + নেট সিমেন্ট', 'start'));
  out.push(lbl(64, gy - 74, '১০" একো-ব্লক', 'end'));
  out.push(lbl(45, gy + 40, '২ কোর্স ব্রিক ফুটিং', 'end'));
  out.push(T(150, 208, 'প্লিন্থ GL থেকে ২\'-০" — ২০২২ বন্যায় ব্রাহ্মণবাড়িয়ার সর্বোচ্চ পানির স্তরের উপরে', { fs: 3.8, fill: 'var(--red)' }));
  return svg(300, 214, DVB, out.join(''));
}

export function detailAnchor() {
  const out = [defs()];
  out.push(R(0, 0, 300, 214, { fill: 'var(--paper-2)', stroke: 'none' }));
  /* wall */
  out.push(R(60, 90, 80, 120, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.8 }));
  /* top plate / band */
  out.push(R(52, 78, 96, 14, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.8 }));
  /* J bolt */
  out.push(L(92, 92, 92, 58, { stroke: 'var(--red)', sw: 2 }));
  out.push(C(92, 92, 5, { stroke: 'var(--red)', sw: 2, fill: 'none' }));
  out.push(R(84, 52, 16, 6, { fill: 'var(--ink)', stroke: 'none' }));
  /* cleat angle */
  out.push(P([[80, 76], [104, 76], [104, 70], [80, 70]], { closed: true, fill: 'var(--ink)', stroke: 'none' }));
  /* bottom chord */
  out.push(R(30, 52, 240, 6, { fill: 'var(--ink)', stroke: 'none', op: 0.85 }));
  /* rafter */
  out.push(P([[30, 52], [150, -6], [156, -6], [36, 52]], { closed: true, fill: 'rgba(35,40,47,.8)', stroke: 'var(--ink)', sw: 0.5 }));
  /* purlin */
  out.push(P([[180, 12], [200, 12], [200, 2], [180, 2]], { closed: true, fill: 'var(--ink)', stroke: 'none' }));
  /* sheet */
  out.push(P([[130, 6], [270, 52], [270, 60], [130, 14]], { closed: true, fill: 'rgba(176,58,46,.85)', stroke: 'var(--ink)', sw: 0.6 }));
  /* foil */
  out.push(P([[136, 14], [270, 57], [270, 60], [136, 17]], { closed: true, fill: 'rgba(184,134,43,.55)', stroke: 'none' }));

  out.push(T(150, 16, 'ওয়াল-টপ অ্যাংকর ও ট্রাস বেয়ারিং', { fs: 7, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(150, 26, 'TRUSS BEARING + ANCHOR · 1:10', { fs: 4.2, fill: 'var(--ink-40)', ls: '1.2' }));
  const lbl = (x, y, t, anchor = 'start') => T(x, y, t, { fs: 3.9, anchor, fill: 'var(--ink-60)' });
  out.push(lbl(110, 50, 'M12 J-বোল্ট @ ৪\'-০" c/c', 'start'));
  out.push(lbl(110, 76, '৫০×৫০×৫ MS ক্লিট অ্যাংকর', 'start'));
  out.push(lbl(110, 100, 'বটম কর্ড ৫০×৫০×৫', 'start'));
  out.push(lbl(196, 44, '০.৪৭মিমি শিট', 'start'));
  out.push(lbl(196, 52, 'অ্যালু ফয়েল + ২৫মিমি এয়ার গ্যাপ', 'start'));
  out.push(lbl(214, 20, '৪০×৪০×৪ পার্লিন @ ২\'-০" c/c', 'start'));
  out.push(lbl(48, 130, '১০" দেয়াল', 'end'));
  out.push(T(150, 208, 'প্রতিটি ট্রাস ২টি J-বোল্টে অ্যাংকর্ড — ৫৬.৭ মি/সে বাতাসের লিফটের জন্য', { fs: 3.7, fill: 'var(--red)' }));
  return svg(300, 214, DVB, out.join(''));
}

export function detailEave() {
  const out = [defs()];
  out.push(R(0, 0, 300, 214, { fill: 'var(--paper-2)', stroke: 'none' }));
  /* wall */
  out.push(R(180, 96, 90, 110, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.8 }));
  /* roof slope down to the right */
  out.push(P([[20, 20], [250, 104], [250, 112], [20, 28]], { closed: true, fill: 'rgba(176,58,46,.85)', stroke: 'var(--ink)', sw: 0.6 }));
  out.push(P([[24, 28], [250, 109], [250, 112], [24, 31]], { closed: true, fill: 'rgba(184,134,43,.5)', stroke: 'none' }));
  /* purlin */
  out.push(P([[196, 92], [222, 92], [222, 82], [196, 82]], { closed: true, fill: 'var(--ink)', stroke: 'none' }));
  /* fascia */
  out.push(R(240, 106, 8, 26, { fill: 'rgba(35,40,47,.85)', stroke: 'var(--ink)', sw: 0.5 }));
  /* gutter */
  out.push(`<path d="M 248 132 q 16 0 16 10 l 0 6 q 0 8 -8 8 l -8 0" fill="rgba(46,76,109,.25)" stroke="var(--blue)" stroke-width="1.2"/>`);
  /* downpipe */
  out.push(R(262, 146, 8, 70, { fill: 'rgba(46,76,109,.3)', stroke: 'var(--blue)', sw: 1 }));
  /* splash block */
  out.push(P([[248, 196], [284, 204], [284, 212], [248, 204]], { closed: true, fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.6 }));
  /* drip edge */
  out.push(L(20, 20, 250, 104, { stroke: 'var(--ink)', sw: 0.5 }));

  out.push(T(150, 16, 'ইভস, গাটার ও ডাউনপাইপ', { fs: 7, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(150, 26, 'EAVE + GUTTER + DOWNPIPE · 1:10', { fs: 4.2, fill: 'var(--ink-40)', ls: '1.2' }));
  const lbl = (x, y, t, anchor = 'start') => T(x, y, t, { fs: 3.9, anchor, fill: 'var(--ink-60)' });
  out.push(lbl(24, 46, '০.৪৭মিমি শিট, ২\'-০" ওভারহ্যাং', 'start'));
  out.push(lbl(228, 78, 'পার্লিন', 'start'));
  out.push(lbl(228, 124, 'ফ্যাসিয়া বোর্ড', 'start'));
  out.push(lbl(276, 160, '৩" PVC ডাউনপাইপ', 'start'));
  out.push(lbl(276, 200, 'স্প্ল্যাশ ব্লক', 'start'));
  out.push(lbl(170, 150, '১০" দেয়াল', 'end'));
  out.push(T(150, 208, 'পানি দেয়াল থেকে ২\'-০" দূরে ফেলা হয় → নিচে সোক পিট', { fs: 3.7, fill: 'var(--red)' }));
  return svg(300, 214, DVB, out.join(''));
}

export function detailWindow() {
  const out = [defs()];
  out.push(R(0, 0, 300, 214, { fill: 'var(--paper-2)', stroke: 'none' }));
  /* wall in plan-section */
  out.push(R(30, 30, 240, 34, { fill: 'url(#hatchD)', stroke: 'var(--ink)', sw: 0.7 }));
  /* opening */
  out.push(R(96, 30, 110, 34, { fill: 'var(--paper-2)', stroke: 'none' }));
  out.push(R(96, 30, 110, 34, { fill: 'none', stroke: 'var(--ink)', sw: 0.7 }));
  /* aluminium section */
  out.push(R(96, 40, 110, 4, { fill: 'var(--ink)', stroke: 'none' }));
  out.push(R(96, 50, 110, 4, { fill: 'var(--ink)', stroke: 'none' }));
  /* glass */
  out.push(R(100, 44, 102, 6, { fill: 'rgba(46,76,109,.28)', stroke: 'var(--blue)', sw: 0.6 }));
  /* panels */
  out.push(R(100, 44, 49, 6, { fill: 'rgba(46,76,109,.16)', stroke: 'var(--blue)', sw: 0.5 }));
  /* grill bars in front (interior side) */
  for (let x = 104; x < 205; x += 14) out.push(C(x, 60, 2.4, { fill: 'var(--ink)', stroke: 'none' }));
  out.push(R(98, 58, 106, 3, { fill: 'none', stroke: 'var(--ink)', sw: 0.5 }));
  /* sill */
  out.push(P([[92, 64], [210, 64], [206, 72], [96, 72]], { closed: true, fill: 'rgba(18,20,26,.10)', stroke: 'var(--ink)', sw: 0.6 }));
  /* interior */
  out.push(T(44, 96, 'ভিতর', { fs: 4.4, fill: 'var(--ink-40)' }));
  out.push(T(240, 96, 'বাহির', { fs: 4.4, fill: 'var(--ink-40)' }));
  /* jamb detail below */
  out.push(R(96, 120, 110, 6, { fill: 'var(--ink)', stroke: 'none' }));
  out.push(R(96, 126, 6, 30, { fill: 'var(--ink)', stroke: 'none' }));
  out.push(R(200, 126, 6, 30, { fill: 'var(--ink)', stroke: 'none' }));
  out.push(T(150, 148, 'ড্রেনেজ ওয়েপ হোল', { fs: 3.9, fill: 'var(--ink-60)' }));

  out.push(T(150, 16, 'থাই গ্লাস জানালা ও গ্রিল', { fs: 7, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(150, 26, 'WINDOW SECTION + SAFETY GRILL · 1:10', { fs: 4.2, fill: 'var(--ink-40)', ls: '1.2' }));
  out.push(T(150, 208, 'গ্রিল ভিতরের দিকে — বাইরের সাদা ফ্যাসাড পরিষ্কার থাকে', { fs: 3.7, fill: 'var(--red)' }));
  return svg(300, 214, DVB, out.join(''));
}

export function detailSeptic() {
  const out = [defs()];
  out.push(R(0, 0, 300, 214, { fill: 'var(--paper-2)', stroke: 'none' }));
  const gy = 70;
  out.push(L(0, gy, 300, gy, { stroke: 'var(--ink)', sw: 1.1 }));
  out.push(R(0, gy, 300, 120, { fill: 'url(#hatchEarth)', stroke: 'none', op: 0.5 }));
  /* tank */
  out.push(R(24, gy + 20, 96, 70, { fill: 'rgba(46,76,109,.06)', stroke: 'var(--ink)', sw: 1 }));
  out.push(L(72, gy + 20, 72, gy + 90, { stroke: 'var(--ink)', sw: 0.8, dash: '4 2' }));
  out.push(R(24, gy + 16, 96, 5, { fill: 'url(#hatchCon)', stroke: 'var(--ink)', sw: 0.6 }));
  /* inlet */
  out.push(L(24, gy + 34, 10, gy + 34, { stroke: 'var(--green)', sw: 2 }));
  /* liquid level */
  out.push(R(24, gy + 44, 96, 46, { fill: 'rgba(91,115,85,.18)', stroke: 'none' }));
  /* soak pit */
  out.push(C(190, gy + 60, 42, { fill: 'url(#hatchX)', stroke: 'var(--ink)', sw: 1 }));
  out.push(L(120, gy + 34, 190, gy + 34, { stroke: 'var(--green)', sw: 2 }));
  /* vent pipe */
  out.push(L(100, gy + 20, 100, gy - 40, { stroke: 'var(--ink)', sw: 0.8 }));
  out.push(T(104, gy - 42, '২" ভেন্ট পাইপ', { fs: 3.9, anchor: 'start', fill: 'var(--ink-60)' }));

  out.push(T(150, 16, 'সেপটিক ট্যাংক ও সোক পিট', { fs: 7, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(150, 26, 'SEPTIC TANK + SOAK PIT · 1:20', { fs: 4.2, fill: 'var(--ink-40)', ls: '1.2' }));
  const lbl = (x, y, t, anchor = 'start') => T(x, y, t, { fs: 3.9, anchor, fill: 'var(--ink-60)' });
  out.push(lbl(28, gy + 12, '৮\'-০"×৫\'-০"×৫\'-০" দুই চেম্বার', 'start'));
  out.push(lbl(128, gy + 30, 'পাইপ Ø4"', 'start'));
  out.push(lbl(146, gy + 96, 'Ø৪\'-০" × ৬\'-০" গভীর', 'start'));
  out.push(lbl(12, gy + 96, 'টিউবওয়েল থেকে ২৫\'-০" এর বেশি দূরে', 'start'));
  out.push(T(150, 208, 'সেপটিক ট্যাংক বাথরুমের উত্তর-পশ্চিমে, টিউবওয়েলের উজানে নয়', { fs: 3.7, fill: 'var(--red)' }));
  return svg(300, 214, DVB, out.join(''));
}

export function detailTank() {
  const out = [defs()];
  out.push(R(0, 0, 300, 214, { fill: 'var(--paper-2)', stroke: 'none' }));
  /* truss */
  out.push(L(20, 40, 280, 40, { stroke: 'var(--ink)', sw: 2 }));
  out.push(L(150, 40, 150, 8, { stroke: 'var(--ink)', sw: 1.6 }));
  /* platform */
  out.push(R(70, 56, 120, 5, { fill: 'var(--ink)', stroke: 'none' }));
  out.push(L(70, 56, 90, 40, { stroke: 'var(--ink)', sw: 1.2 }));
  out.push(L(190, 56, 170, 40, { stroke: 'var(--ink)', sw: 1.2 }));
  /* tank */
  out.push(R(84, 12, 92, 44, { fill: 'rgba(46,76,109,.16)', stroke: 'var(--blue)', sw: 1.1, rx: 4 }));
  out.push(L(84, 26, 176, 26, { stroke: 'var(--blue)', sw: 0.5, dash: '2 2' }));
  out.push(T(130, 40, '৫০০ L', { fs: 5.4, fill: 'var(--blue)' }));
  /* float valve + outlet */
  out.push(C(176, 30, 3, { stroke: 'var(--blue)', sw: 0.8 }));
  out.push(L(176, 30, 196, 30, { stroke: 'var(--blue)', sw: 1.4 }));
  out.push(L(196, 30, 196, 150, { stroke: 'var(--blue)', sw: 1.4 }));
  out.push(L(196, 150, 240, 150, { stroke: 'var(--blue)', sw: 1.4 }));
  /* pump riser in */
  out.push(L(130, 12, 130, 0, { stroke: 'var(--blue)', sw: 1.4, dash: '4 2' }));
  out.push(T(136, 6, '১HP পাম্প থেকে ↑', { fs: 3.9, anchor: 'start', fill: 'var(--blue)' }));
  /* tap */
  out.push(L(240, 150, 240, 158, { stroke: 'var(--blue)', sw: 2 }));
  out.push(T(246, 158, 'ফিক্সচারে', { fs: 3.9, anchor: 'start', fill: 'var(--ink-60)' }));
  /* platform dims */
  out.push(T(130, 78, 'MS প্ল্যাটফর্ম ৫০×৫০×৫ অ্যাংগেল', { fs: 4, fill: 'var(--ink-60)' }));
  out.push(T(130, 86, 'ট্রাসের বটম কর্ডে বোল্টেড', { fs: 4, fill: 'var(--ink-60)' }));

  out.push(T(150, 118, 'ছাদের ট্যাংক প্ল্যাটফর্ম', { fs: 7, ff: 'var(--f-bn)', fill: 'var(--ink)' }));
  out.push(T(150, 128, 'OVERHEAD TANK PLATFORM · 1:20', { fs: 4.2, fill: 'var(--ink-40)', ls: '1.2' }));
  out.push(T(150, 160, 'বাথরুমের ঠিক উপরে — পাইপের দূরত্ব সবচেয়ে কম', { fs: 4.4, fill: 'var(--red)' }));
  out.push(T(150, 170, 'ট্যাংকের তলা +৯\'-০" → সব কল/শাওয়ারে মাধ্যাকর্ষণে পানি', { fs: 4.4, fill: 'var(--ink-60)' }));
  out.push(T(150, 180, 'বার্ষিক পরিষ্কারের জন্য ২\'-০"×২\'-০" ম্যানহোল', { fs: 4.4, fill: 'var(--ink-60)' }));
  return svg(300, 214, DVB, out.join(''));
}

/* ---------- small diagrams ---------------------------------------------- */
export function sunPath() {
  const out = [defs()];
  const cx = 100, cy = 100, r = 78;
  out.push(C(cx, cy, r, { stroke: 'var(--rule)', sw: 0.7, dash: '3 3' }));
  out.push(L(cx - r - 10, cy, cx + r + 10, cy, { stroke: 'var(--rule)', sw: 0.6 }));
  out.push(L(cx, cy - r - 10, cx, cy + r + 10, { stroke: 'var(--rule)', sw: 0.6 }));
  /* house block */
  out.push(R(cx - 34, cy - 16, 68, 32, { fill: 'var(--ink)', stroke: 'none', op: 0.82 }));
  out.push(T(cx, cy + 3, 'HOUSE', { fs: 4, fill: 'var(--paper-2)' }));
  /* arcs: summer solstice (high), equinox, winter */
  const arc = (rise, label, col, dash) => {
    const pts = [];
    for (let a = 0; a <= 180; a += 4) {
      const rad = (a * Math.PI) / 180;
      const x = cx + Math.cos(Math.PI - rad) * r * 0.98;
      const y = cy + Math.sin(Math.PI - rad) * -r * Math.sin((rise * Math.PI) / 180);
      pts.push([x, y]);
    }
    return `<path d="M ${pts.map((p) => p.join(' ')).join(' L ')}" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="${dash}"/>`;
  };
  out.push(arc(88, '', 'var(--red)', '0'));
  out.push(arc(70, '', 'var(--amber)', '4 2'));
  out.push(arc(46, '', 'var(--blue)', '2 2'));
  /* noon positions */
  out.push(C(cx, cy - r * 0.999, 3, { fill: 'var(--red)', stroke: 'none' }));
  out.push(T(cx + 8, cy - r * 0.99, '২১ জুন · ৮৯.৭°', { fs: 3.8, anchor: 'start', fill: 'var(--red)' }));
  out.push(C(cx, cy - r * Math.sin((70 * Math.PI) / 180), 2.6, { fill: 'var(--amber)', stroke: 'none' }));
  out.push(T(cx + 8, cy - r * Math.sin((70 * Math.PI) / 180) + 1, '২১ মার্চ/সেপ্ট · ৬৬°', { fs: 3.8, anchor: 'start', fill: 'var(--amber)' }));
  out.push(C(cx, cy - r * Math.sin((46 * Math.PI) / 180), 2.6, { fill: 'var(--blue)', stroke: 'none' }));
  out.push(T(cx + 8, cy - r * Math.sin((46 * Math.PI) / 180) + 1, '২১ ডিসে · ৪৩°', { fs: 3.8, anchor: 'start', fill: 'var(--blue)' }));
  /* compass */
  out.push(T(cx, cy + r + 16, 'S', { fs: 5, fill: 'var(--ink-40)' }));
  out.push(T(cx, cy - r - 12, 'N', { fs: 5, fill: 'var(--ink-40)' }));
  out.push(T(cx + r + 10, cy + 2, 'E', { fs: 5, fill: 'var(--ink-40)' }));
  out.push(T(cx - r - 10, cy + 2, 'W', { fs: 5, fill: 'var(--ink-40)' }));
  /* shading note */
  out.push(T(cx, cy + r + 30, 'ছাদের ২\'-০" ওভারহ্যাং গ্রীষ্মের দুপুরের রোদ काटে', { fs: 3.8, fill: 'var(--ink-60)' }));
  return svg(210, 202, '-10 -18 220 216', out.join(''));
}

export function rainChart() {
  const months = ['জা', 'ফে', 'মা', 'এপ', 'মে', 'জুন', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'];
  const rain = [14, 40, 73, 168, 315, 345, 368, 248, 198, 149, 30, 9];
  const out = [defs()];
  const x0 = 22, y0 = 118, w = 158, h = 86;
  const max = 400;
  out.push(L(x0, y0 - h, x0, y0, { stroke: 'var(--ink)', sw: 0.7 }));
  out.push(L(x0, y0, x0 + w, y0, { stroke: 'var(--ink)', sw: 0.7 }));
  [100, 200, 300, 400].forEach((v) => {
    const y = y0 - (v / max) * h;
    out.push(L(x0, y, x0 + w, y, { stroke: 'var(--rule)', sw: 0.4, dash: '2 2' }));
    out.push(T(x0 - 3, y + 1.4, `${v}`, { fs: 3.4, anchor: 'end', fill: 'var(--ink-40)' }));
  });
  const bw = w / 12;
  rain.forEach((v, i) => {
    const hh = (v / max) * h;
    out.push(R(x0 + i * bw + 1.2, y0 - hh, bw - 2.4, hh, { fill: i >= 4 && i <= 8 ? 'rgba(46,76,109,.55)' : 'rgba(46,76,109,.22)', stroke: 'none' }));
    out.push(T(x0 + i * bw + bw / 2, y0 + 6, months[i], { fs: 3.3, fill: 'var(--ink-40)', ff: 'var(--f-bn)' }));
  });
  out.push(T(x0 - 16, y0 - h - 6, 'মিমি', { fs: 3.4, anchor: 'start', fill: 'var(--ink-40)' }));
  out.push(T(60, 132, 'বার্ষিক বৃষ্টি ১,৯৫৬ মিমি · ৮৪% মে–অক্টোবর', { fs: 3.8, fill: 'var(--ink-60)' }));
  return svg(200, 142, '-6 -6 200 142', out.join(''));
}
