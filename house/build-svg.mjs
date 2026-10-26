/* ==========================================================================
   build-svg.mjs — render every drawing of the dossier to a standalone SVG.
   The drawing modules are pure string builders (no DOM), so they can be
   imported straight into node. Output: house/_svg/<name>.svg
   Used by make-pdf.py; the web dossier does not need this step.
   Run: node house/build-svg.mjs
   ========================================================================== */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  floorPlan, sitePlan, roofPlan, partiDiagram,
} from './assets/plan.js';
import {
  southElevation, northElevation, eastElevation, westElevation,
  sectionAA, sectionBB, detailFooting, detailAnchor, detailEave,
  detailWindow, detailSeptic, detailTank, sunPath, rainChart,
} from './assets/elev.js';
import { renderAxon } from './assets/model3d.js';
import { hazardMatrix, waterSchematic, sld, gantt, gapChart } from './assets/diagrams.js';

/* --------------------------------------------------------------------------
   Print conversion: the web drawings inherit their palette from CSS custom
   properties and use rgba() fills. Neither survives an SVG->PDF renderer
   (var() silently becomes black), so bake them into plain hex + *-opacity.
   -------------------------------------------------------------------------- */
const css = fs.readFileSync(new URL('./assets/site.css', import.meta.url), 'utf8');
const rootBlock = css.slice(css.indexOf(':root'), css.indexOf('}', css.indexOf(':root')));
const TOKENS = Object.fromEntries([...rootBlock.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

/* font stacks contain quotes, which would break the XML attribute they sit in —
   map them to the simple family names declared in make-pdf.py's @font-face */
const FAMILIES = { 'f-bn': 'bn', 'f-sans': 'sans', 'f-mono': 'mono' };

/* hatch patterns do not tile reliably in the PDF renderer (they came out solid
   black); swap them for flat tints, which is also what reads best in print */
const HATCH_TINT = {
  hatchCon: '#ded7c8', hatchEarth: '#e8e1d2', hatchD: '#efe9dc',
  hatchX: '#e9e2d3', hatchTile: '#eee8db', hatchRoof: '#e4d3cb',
  hatchGreen: '#e3e9de',
};

function printReady(svg) {
  let s = svg.replace(/var\(--(f-[a-z]+)\)/g, (_, k) => FAMILIES[k] || 'bn');
  s = s.replace(/var\(--([a-z0-9-]+)\)/g, (_, k) => TOKENS[k] || '#12141a');
  s = s.replace(/(fill|stroke)="rgba\(([^)]+)\)"/g, (whole, attr, body) => {
    const [r, g, b, a] = body.split(/[,\s/]+/).filter(Boolean);
    const hex = toHex(+r, +g, +b);
    return Number(a) >= 1 ? `${attr}="${hex}"` : `${attr}="${hex}" ${attr}-opacity="${Number(a)}"`;
  });
  s = s.replace(/fill="url\(#(hatch[A-Za-z]+)_p\d+\)"/g, (_, name) => `fill="${HATCH_TINT[name] || '#e9e2d3'}"`);
  /* <defs> is now unused in print output */
  s = s.replace(/<defs>[\s\S]*?<\/defs>/, '');

  /* a few leader labels sit outside the accumulated content box (they are
     placed relative to the geometry, not the text), so add a 5% safety margin
     around the print viewBox — nothing gets clipped on an A3 sheet */
  s = s.replace(/viewBox="([-\d. ]+)"/, (whole, box) => {
    const v = box.trim().split(/[\s,]+/).map(Number);
    if (v.length !== 4) return whole;
    const mx = v[2] * 0.08, my = v[3] * 0.08;
    return `viewBox="${(v[0] - mx).toFixed(1)} ${(v[1] - my).toFixed(1)} ` +
           `${(v[2] + mx * 2).toFixed(1)} ${(v[3] + my * 2).toFixed(1)}"`;
  });
  return s;
}

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '_svg');
fs.mkdirSync(OUT, { recursive: true });

/* the full-detail plan: every layer on, exactly like the web default */
const ALL = { furniture: true, dims: true, structure: true, plumbing: true, electrical: true, future: true };

/* the nine cost heads of the BoQ, in taka (keep in sync with assets/app.js) */
const HEADS = [
  { id: 'foundation', bn: 'ভিত্তি ও প্লিন্থ', brief: 67040, lean: 132000, full: 168000 },
  { id: 'walls', bn: 'দেয়াল ও পার্টিশন', brief: 0, lean: 168000, full: 232000 },
  { id: 'truss', bn: 'ট্রাস ও ছাদের কাঠামো', brief: 50100, lean: 96000, full: 124000 },
  { id: 'sheet', bn: 'টিন ও গাটার', brief: 25500, lean: 62000, full: 78000 },
  { id: 'openings', bn: 'দরজা ও জানালা', brief: 45200, lean: 84000, full: 138000 },
  { id: 'finishes', bn: 'ফিনিশিং', brief: 0, lean: 148000, full: 224000 },
  { id: 'water', bn: 'পানি ও স্যানিটেশন', brief: 25800, lean: 46000, full: 66000 },
  { id: 'power', bn: 'বিদ্যুৎ', brief: 21000, lean: 38000, full: 58000 },
  { id: 'labour', bn: 'শ্রম', brief: 40000, lean: 0, full: 0 },
];

const DRAW = {
  axon: () => renderAxon({ yaw: 150, pitch: 14 }),
  axonRoofOff: () => renderAxon({ yaw: 150, pitch: 40, roof: false }),
  plan: () => floorPlan(ALL),
  planFurn: () => floorPlan({ furniture: true, dims: false, structure: false, plumbing: false, electrical: false, future: false }),
  site: sitePlan,
  roof: () => roofPlan({ structure: true }),
  parti: partiDiagram,
  elevS: southElevation,
  elevN: northElevation,
  elevE: eastElevation,
  elevW: westElevation,
  secAA: sectionAA,
  secBB: sectionBB,
  detFoot: detailFooting,
  detAnchor: detailAnchor,
  detEave: detailEave,
  detWin: detailWindow,
  detSeptic: detailSeptic,
  detTank: detailTank,
  sun: sunPath,
  rain: rainChart,
  hazard: hazardMatrix,
  water: waterSchematic,
  sld,
  gantt,
  gapChart: () => gapChart(HEADS),
};

for (const [name, fn] of Object.entries(DRAW)) {
  const svg = fn();
  if (!svg || !svg.startsWith('<svg')) throw new Error(`bad svg for ${name}`);
  /* guard: an attribute value must never contain a quote (breaks XML) */
  const bad = svg.match(/="[^"]*"[^\s/>][^"]*"/);
  if (bad) throw new Error(`unbalanced quote in ${name}: ${bad[0].slice(0, 80)}`);
  fs.writeFileSync(path.join(OUT, `${name}.svg`), printReady(svg));
}
console.log(`wrote ${Object.keys(DRAW).length} svgs to ${OUT}`);
