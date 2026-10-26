/* ==========================================================================
   draw-core.js — CAD-style SVG primitives for the Dhonashi house dossier.
   All architectural geometry is expressed in INCHES with the origin at the
   south-west external corner; y is flipped for screen (north = top).
   ========================================================================== */

export const U = {
  /* feet -> inches */
  f: (n) => n * 12,
  /* inches -> feet string, e.g. 129 -> 10'-9" */
  ftin(inches) {
    const neg = inches < 0;
    let v = Math.round(Math.abs(inches));
    const ft = Math.floor(v / 12);
    const inch = v % 12;
    const s = inch === 0 ? `${ft}'-0"` : `${ft}'-${inch}"`;
    return (neg ? '-' : '') + s;
  },
  /* feet-inch for nominal dimensions spoken on drawings */
  ft(inches) {
    let v = Math.round(inches);
    const ft = Math.floor(v / 12);
    const inch = v % 12;
    return inch === 0 ? `${ft}'` : `${ft}'${inch}"`;
  },
};

/* ---------- string helpers ------------------------------------------------ */
const n = (v) => (Math.round(v * 1000) / 1000).toString();

/* content bounding box, so nothing is ever clipped by a hard-coded viewBox */
function contentBox(inner) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const acc = (x, y) => {
    if (!isFinite(x) || !isFinite(y)) return;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  };
  const nums = (s) => (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  const re = /<(line|rect|circle|text|polygon|polyline|path)\b([^>]*?)\/?>(?:([^<]*)<\/text>)?/g;
  let m;
  while ((m = re.exec(inner))) {
    const [tag, attr] = [m[1], m[2]];
    const textContent = m[3] || '';
    const get = (name) => {
      const a = attr.match(new RegExp(name + '="([^"]*)"'));
      return a ? a[1] : null;
    };
    if (tag === 'line') {
      acc(+get('x1'), +get('y1')); acc(+get('x2'), +get('y2'));
    } else if (tag === 'rect') {
      const x = +get('x'), y = +get('y'), w = +get('width'), h = +get('height');
      acc(x, y); acc(x + w, y + h);
    } else if (tag === 'circle') {
      const cx = +get('cx'), cy = +get('cy'), r = +get('r');
      acc(cx - r, cy - r); acc(cx + r, cy + r);
    } else if (tag === 'text') {
      const x = +get('x'), y = +get('y');
      const fs = +(get('font-size') || 6);
      const w = Math.max(2, textContent.length * fs * 0.56);
      const end = /text-anchor="end"/.test(attr);
      const mid = /text-anchor="middle"/.test(attr);
      const x0 = end ? x - w : mid ? x - w / 2 : x;
      acc(x0, y - fs * 0.8); acc(x0 + w, y + fs * 0.22);
    } else if (tag === 'polygon' || tag === 'polyline') {
      const p = nums(get('points') || '');
      for (let i = 0; i + 1 < p.length; i += 2) acc(p[i], p[i + 1]);
    }
  }
  if (x0 > x1) return null;
  return [x0, y0, x1, y1];
}

let SVG_SEQ = 0;

export function svg(w, h, vb, inner, cls = '') {
  /* every drawing carries its own <defs>; give the pattern ids a unique suffix
     so the document never has duplicate ids (and each url(#…) resolves locally) */
  const uid = `p${++SVG_SEQ}`;
  inner = inner
    .replace(/id="(hatch[A-Za-z]*)"/g, `id="$1_${uid}"`)
    .replace(/url\(#(hatch[A-Za-z]*)\)/g, `url(#$1_${uid})`);
  const base = vb.trim().split(/[\s,]+/).map(Number);
  let [vx, vy, vw, vh] = base;
  const box = contentBox(inner);
  if (box) {
    const [bx0, by0, bx1, by1] = box;
    if (bx0 < vx) { vw += vx - bx0; vx = bx0; }
    if (by0 < vy) { vh += vy - by0; vy = by0; }
    if (bx1 > vx + vw) vw = bx1 - vx;
    if (by1 > vy + vh) vh = by1 - vy;
  }
  const fmt = (n) => (Math.round(n * 10) / 10).toString();
  const out = `${fmt(vx)} ${fmt(vy)} ${fmt(vw)} ${fmt(vh)}`;
  return `<svg viewBox="${out}" preserveAspectRatio="xMidYMid meet" class="${cls}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
}

/* line */
export function L(x1, y1, x2, y2, o = {}) {
  const s = o.stroke || 'var(--ink)';
  const sw = o.sw ?? 1;
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
  const cap = o.cap ? ` stroke-linecap="${o.cap}"` : '';
  const op = o.op != null ? ` opacity="${o.op}"` : '';
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${s}" stroke-width="${sw}"${dash}${cap}${op}/>`;
}

/* polyline / polygon */
export function P(pts, o = {}) {
  const d = pts.map((p) => `${n(p[0])},${n(p[1])}`).join(' ');
  if (o.closed) {
    const fill = o.fill || 'none';
    const s = o.stroke === 'none' ? 'none' : (o.stroke || 'var(--ink)');
    const sw = o.sw ?? 1;
    const op = o.op != null ? ` opacity="${o.op}"` : '';
    const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
    return `<polygon points="${d}" fill="${fill}" stroke="${s}" stroke-width="${sw}"${dash}${op}/>`;
  }
  return `<polyline points="${d}" fill="none" stroke="${o.stroke || 'var(--ink)'}" stroke-width="${o.sw ?? 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
}

/* rect */
export function R(x, y, w, h, o = {}) {
  const fill = o.fill || 'none';
  const s = o.stroke === 'none' ? 'none' : (o.stroke || 'var(--ink)');
  const sw = o.sw ?? 1;
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
  const op = o.op != null ? ` opacity="${o.op}"` : '';
  const rx = o.rx ? ` rx="${o.rx}"` : '';
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${s}" stroke-width="${sw}"${dash}${op}${rx}/>`;
}

export function C(cx, cy, r, o = {}) {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${o.fill || 'none'}" stroke="${o.stroke === 'none' ? 'none' : (o.stroke || 'var(--ink)')}" stroke-width="${o.sw ?? 1}"${o.op != null ? ` opacity="${o.op}"` : ''}${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
}

export function T(x, y, str, o = {}) {
  const anchor = o.anchor || 'middle';
  const fill = o.fill || 'var(--ink)';
  const fs = o.fs ?? 6;
  const ff = o.ff || 'var(--f-mono)';
  const rot = o.rot ? ` transform="rotate(${o.rot} ${n(x)} ${n(y)})"` : '';
  const ls = o.ls ? ` letter-spacing="${o.ls}"` : '';
  const upper = o.upper ? ' style="text-transform:uppercase"' : '';
  const op = o.op != null ? ` opacity="${o.op}"` : '';
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" font-family="${ff}" font-size="${fs}" fill="${fill}"${ls}${rot}${op}${upper}>${str}</text>`;
}

/* multi-line label block */
export function TB(x, y, lines, o = {}) {
  const lh = o.lh || 7;
  return lines.map((l, i) => {
    if (typeof l === 'string') return T(x, y + i * lh, l, o);
    return T(x, y + i * lh, l.t, { ...o, ...l });
  }).join('');
}

/* ---------- dimensions ---------------------------------------------------- */
/* Horizontal dimension: chain dimension with ticks + text above the line. */
export function dimH(x1, x2, y, label, o = {}) {
  const ext = o.ext ?? 5;
  const col = o.stroke || 'var(--blue)';
  const sw = o.sw ?? 0.7;
  const fs = o.fs ?? 6;
  const out = [];
  out.push(L(x1, y - ext, x1, y + ext + 1.5, { stroke: col, sw: 0.45 }));
  out.push(L(x2, y - ext, x2, y + ext + 1.5, { stroke: col, sw: 0.45 }));
  out.push(L(x1, y, x2, y, { stroke: col, sw }));
  /* 45° ticks */
  out.push(L(x1 - 2, y + 2, x1 + 2, y - 2, { stroke: col, sw: 0.8 }));
  out.push(L(x2 - 2, y + 2, x2 + 2, y - 2, { stroke: col, sw: 0.8 }));
  if (label !== null) out.push(T((x1 + x2) / 2, y - (o.up ?? 3), label, { fs, fill: o.text || 'var(--blue)', ff: 'var(--f-mono)' }));
  return out.join('');
}

/* Vertical dimension (rotated text) */
export function dimV(y1, y2, x, label, o = {}) {
  const ext = o.ext ?? 5;
  const col = o.stroke || 'var(--blue)';
  const sw = o.sw ?? 0.7;
  const fs = o.fs ?? 6;
  const out = [];
  out.push(L(x - ext, y1, x + ext + 1.5, y1, { stroke: col, sw: 0.45 }));
  out.push(L(x - ext, y2, x + ext + 1.5, y2, { stroke: col, sw: 0.45 }));
  out.push(L(x, y1, x, y2, { stroke: col, sw }));
  out.push(L(x - 2, y1 - 2, x + 2, y1 + 2, { stroke: col, sw: 0.8 }));
  out.push(L(x - 2, y2 - 2, x + 2, y2 + 2, { stroke: col, sw: 0.8 }));
  if (label !== null) {
    out.push(T(x - (o.up ?? 3), (y1 + y2) / 2, label, {
      fs, fill: o.text || 'var(--blue)', anchor: 'middle', rot: -90,
    }));
  }
  return out.join('');
}

/* ---------- symbols ------------------------------------------------------- */
export function northArrow(x, y, r = 13, o = {}) {
  const col = o.stroke || 'var(--ink)';
  return [
    C(x, y, r, { stroke: col, sw: 0.6 }),
    P([[x, y - r * 0.82], [x + r * 0.30, y + r * 0.5], [x, y + r * 0.22], [x - r * 0.30, y + r * 0.5]], { closed: true, fill: col, stroke: col, sw: 0.6 }),
    T(x, y + r + 8, 'N', { fs: 7, fill: col, ff: 'var(--f-mono)' }),
  ].join('');
}

export function scaleBar(x, y, w, o = {}) {
  /* w = total width for 10 ft; draws alternating 2ft segments */
  const seg = w / 5;
  const out = [];
  for (let i = 0; i < 5; i++) {
    out.push(R(x + i * seg, y, seg, 2.4, { fill: i % 2 ? 'var(--ink)' : 'none', stroke: 'var(--ink)', sw: 0.5 }));
  }
  for (let i = 0; i <= 5; i += 1) {
    out.push(T(x + i * seg, y + 9, `${i * 2}`, { fs: 4.6, fill: 'var(--ink-40)' }));
  }
  out.push(T(x + w + 6, y + 9, 'FT', { fs: 4.6, anchor: 'start', fill: 'var(--ink-40)' }));
  return out.join('');
}

/* wall as filled double rectangle (plan) */
export function wallRect(x, y, w, h, o = {}) {
  return R(x, y, w, h, { fill: o.fill || 'var(--ink)', stroke: 'none', op: o.op ?? 1 });
}

/* window symbol inside a wall band.
   horizontal=true => wall runs east-west, band is y..y+h */
export function windowSym(a, b, c, d, horizontal = true, o = {}) {
  const out = [];
  const col = o.stroke || 'var(--paper-2)';
  if (horizontal) {
    /* a..b along x, c..d across wall */
    out.push(R(a, c, b - a, d - c, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 0.55 }));
    out.push(L(a, c, b, c, { stroke: 'var(--ink)', sw: 0.55 }));
    out.push(L(a, d, b, d, { stroke: 'var(--ink)', sw: 0.55 }));
    /* glazing line */
    out.push(L(a, (c + d) / 2, b, (c + d) / 2, { stroke: 'var(--blue)', sw: 0.5 }));
    /* sliding panels */
    const mid = (a + b) / 2;
    out.push(L(mid - 0.8, c, mid + 0.8, d, { stroke: 'var(--blue)', sw: 0.45 }));
    out.push(L(a, (c + d) / 2, mid, c + 0.9, { stroke: 'var(--blue)', sw: 0.4 }));
    out.push(L(b, (c + d) / 2, mid, d - 0.9, { stroke: 'var(--blue)', sw: 0.4 }));
  } else {
    out.push(R(c, a, d - c, b - a, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 0.55 }));
    out.push(L(c, a, c, b, { stroke: 'var(--ink)', sw: 0.55 }));
    out.push(L(d, a, d, b, { stroke: 'var(--ink)', sw: 0.55 }));
    out.push(L((c + d) / 2, a, (c + d) / 2, b, { stroke: 'var(--blue)', sw: 0.5 }));
  }
  return out.join('');
}

/* door swing. hinge at (hx,hy); leaf width w; dir = angle in degrees of closed leaf;
   swing = +90 / -90 for the arc direction */
export function doorSwing(hx, hy, w, deg, sweep = 1, o = {}) {
  const r = w;
  const rad = (deg * Math.PI) / 180;
  const ex = hx + Math.cos(rad) * w;
  const ey = hy + Math.sin(rad) * w;
  /* leaf shown open at 90° from closed */
  const ox = hx + Math.cos(rad + (sweep * Math.PI) / 2) * w;
  const oy = hy + Math.sin(rad + (sweep * Math.PI) / 2) * w;
  const large = sweep > 0 ? 0 : 1;
  const arc = `M ${n(ex)} ${n(ey)} A ${n(r)} ${n(r)} 0 0 ${sweep > 0 ? 1 : 0} ${n(ox)} ${n(oy)}`;
  return [
    `<path d="${arc}" fill="none" stroke="var(--ink-40)" stroke-width="0.45" stroke-dasharray="1.6 1.6"/>`,
    L(hx, hy, ox, oy, { stroke: 'var(--ink)', sw: 1.1 }),
    C(hx, hy, 0.9, { fill: 'var(--ink)' }),
  ].join('');
}

/* hatch pattern defs */
export function defs() {
  return `<defs>
    <pattern id="hatchD" width="3" height="3" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="3" stroke="var(--ink-40)" stroke-width="0.35"/>
    </pattern>
    <pattern id="hatchX" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="3.2" stroke="var(--ink-40)" stroke-width="0.32"/>
      <line x1="0" y1="0" x2="3.2" y2="0" stroke="var(--ink-40)" stroke-width="0.32"/>
    </pattern>
    <pattern id="hatchCon" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
      <circle cx="0.7" cy="0.7" r="0.32" fill="var(--ink-40)"/>
      <circle cx="1.9" cy="1.9" r="0.25" fill="var(--ink-40)"/>
    </pattern>
    <pattern id="hatchEarth" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="2" stroke="var(--ink-40)" stroke-width="0.4"/>
      <line x1="2" y1="0" x2="2" y2="2" stroke="var(--ink-40)" stroke-width="0.25" opacity=".6"/>
    </pattern>
    <pattern id="hatchTile" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="0" stroke="var(--ink-40)" stroke-width="0.3"/>
      <line x1="0" y1="0" x2="0" y2="4" stroke="var(--ink-40)" stroke-width="0.3"/>
    </pattern>
    <pattern id="hatchRoof" width="5" height="5" patternUnits="userSpaceOnUse">
      <line x1="0" y1="5" x2="5" y2="0" stroke="var(--rule)" stroke-width="0.5"/>
    </pattern>
    <pattern id="hatchGreen" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="4" stroke="var(--green)" stroke-width="0.35" opacity=".55"/>
      <line x1="4" y1="0" x2="0" y2="4" stroke="var(--green)" stroke-width="0.35" opacity=".55"/>
    </pattern>
  </defs>`;
}

/* room label: Bangla name + area + size */
export function roomLabel(x, y, bn, en, size, area, o = {}) {
  return [
    T(x, y, bn, { fs: o.fs ?? 7.4, ff: 'var(--f-bn)', fill: 'var(--ink)', ls: '0.2' }),
    T(x, y + 7.6, en.toUpperCase(), { fs: 4.9, fill: 'var(--ink-60)', ls: '1.2' }),
    T(x, y + 14.4, size, { fs: 5.2, fill: 'var(--ink-60)' }),
    T(x, y + 20.6, `${area} SQFT`, { fs: 4.8, fill: 'var(--ink-40)' }),
  ].join('');
}

/* section / detail callout bubble */
export function bubble(x, y, r, txt, o = {}) {
  return [
    C(x, y, r, { fill: 'var(--paper-2)', stroke: 'var(--ink)', sw: 0.6 }),
    T(x, y + 2, txt, { fs: r * 0.92, fill: 'var(--ink)' }),
    L(x - r, y, x - r - (o.len ?? 16), y, { stroke: 'var(--ink)', sw: 0.5 }),
  ].join('');
}

/* arc hatch: corridor shading etc. */
export function shadowFill(x, y, w, h, op = 0.05) {
  return R(x, y, w, h, { fill: 'var(--ink)', op, stroke: 'none' });
}
