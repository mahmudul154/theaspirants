/* ==========================================================================
   model3d.js — axonometric massing model of the Dhonashi house.
   Camera convention (this is the bit that matters):
     x = east, y = SOUTH (so larger y is nearer the viewer), z = up.
     yaw 0   ->  camera due south        yaw 90  ->  camera due east
     visible vertical faces are those whose normal points at the camera.
   Draw order is a set of stage flats: ground, far walls, interior, near
   walls, roof. Painter sorting inside each layer uses depth = x·sin + y·cos.
   ========================================================================== */

const W = 384, D = 192, PL = 24, WT = 144, RIDGE = 182, EAVE = 134, OV = 24;

const COL = {
  ground: '#e7e2d5',
  plinth: '#dbd4c3',
  wallOut: '#fbf8f2',
  wallIn: '#efeade',
  part: '#e7e1d3',
  partTop: '#f0ebdf',
  roofS: '#b03a2e',
  roofN: '#39404a',
  ridge: '#262b32',
  glass: '#8fa8c3',
  door: '#2a2f36',
  tank: '#9db5cd',
  floor: '#f1ecdf',
  furn: '#ded5c2',
  gable: '#f5f1e7',
};

const shade = (hex, amt) => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + amt, g = ((num >> 8) & 255) + amt, b = (num & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

export function renderAxon(opts = {}) {
  const yaw = ((opts.yaw ?? 32) * Math.PI) / 180;
  const pitch = ((opts.pitch ?? 26) * Math.PI) / 180;
  const scale = opts.scale ?? 1;
  const sY = Math.sin(yaw), cY = Math.cos(yaw);
  const sp = Math.sin(pitch), cp = Math.cos(pitch);
  const seeEast = sY > 0.02;      /* +x face (east) is visible */
  const seeSouth = cY < -0.02;    /* +y face (south) is visible */
  const showRoof = opts.roof !== false;
  const showInt = opts.interior !== false;

  let body = '';
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  const track = (px, py) => {
    if (px < minX) minX = px; if (px > maxX) maxX = px;
    if (py < minY) minY = py; if (py > maxY) maxY = py;
  };
  const proj = (x, y, z) => {
    const px = (x * cY - y * sY) * scale;
    const py = ((x * sY + y * cY) * sp - z * cp) * scale;
    return [px, py];
  };
  const depth = (x, y) => x * sY + y * cY;

  const quad = (pts, fill, o = {}) => {
    const p = pts.map((q) => proj(q[0], q[1], q[2]));
    p.forEach((q) => track(q[0], q[1]));
    body += `<polygon points="${p.map((q) => q[0].toFixed(2) + ',' + q[1].toFixed(2)).join(' ')}" fill="${fill}" stroke="${o.stroke || 'rgba(18,20,26,.45)'}" stroke-width="${o.sw ?? 0.6}" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
  };
  const seg = (a3, b3, o = {}) => {
    const a = proj(...a3), b = proj(...b3);
    track(a[0], a[1]); track(b[0], b[1]);
    body += `<line x1="${a[0].toFixed(2)}" y1="${a[1].toFixed(2)}" x2="${b[0].toFixed(2)}" y2="${b[1].toFixed(2)}" stroke="${o.stroke}" stroke-width="${o.sw ?? 0.6}"/>`;
  };

  /* ---------- a volume, faces in correct occlusion order ---------- */
  const box = (x0, x1, y0, y1, z0, z1, o = {}) => {
    const fill = o.fill || COL.wallOut;
    const st = { stroke: o.stroke || 'rgba(18,20,26,.45)', sw: o.sw ?? 0.6, dash: o.dash };
    const nearY = seeSouth ? y1 : y0, farY = seeSouth ? y0 : y1;
    const nearX = seeEast ? x1 : x0, farX = seeEast ? x0 : x1;
    /* far vertical faces */
    quad([[x0, farY, z0], [x1, farY, z0], [x1, farY, z1], [x0, farY, z1]], shade(o.face || fill, -14), st);
    quad([[farX, y0, z0], [farX, y1, z0], [farX, y1, z1], [farX, y0, z1]], shade(o.face || fill, -20), st);
    /* top */
    quad([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], o.top || shade(fill, 9), st);
    /* near faces */
    quad([[x0, nearY, z0], [x1, nearY, z0], [x1, nearY, z1], [x0, nearY, z1]], o.face || fill, st);
    quad([[nearX, y0, z0], [nearX, y1, z0], [nearX, y1, z1], [nearX, y0, z1]], shade(o.face || fill, -8), st);
  };

  /* =============== 1 · ground =============== */
  quad([[-140, -150, 0], [W + 220, -150, 0], [W + 220, D + 180, 0], [-140, D + 180, 0]], COL.ground, { stroke: 'none', sw: 0 });

  /* =============== 2 · plinth + floor =============== */
  box(-6, W + 6, -6, D + 6, 0, PL, { fill: COL.plinth, sw: 0.8 });
  quad([[0, 0, PL + 0.6], [W, 0, PL + 0.6], [W, D, PL + 0.6], [0, D, PL + 0.6]], COL.floor, { sw: 1, stroke: 'rgba(18,20,26,.35)' });

  /* =============== 3 · far walls =============== */
  box(0, W, seeSouth ? 0 : D - 5, seeSouth ? 5 : D, PL, WT, { fill: COL.wallIn });
  box(seeEast ? 0 : W - 5, seeEast ? 5 : W, 0, D, PL, WT, { fill: COL.wallIn });
  /* far gable triangle sits on the far x-face */
  const farGx = seeEast ? 0.5 : W - 0.5;
  quad([[farGx, 0, WT], [farGx, D, WT], [farGx, D / 2, RIDGE]], shade(COL.gable, -20), { sw: 0.7 });

  /* =============== 4 · interior =============== */
  const walls = [
    [129, 132, 5, 104], [129, 132, 140, 187],          /* bedroom 1 partition (door gap) */
    [252, 255, 5, 76], [252, 255, 112, 187],           /* bedroom 2 partition */
    [132, 138, 67, 70], [168, 198, 67, 70], [228, 252, 67, 70],  /* service band wall */
    [186, 189, 5, 67],                                 /* bath / kitchen */
  ];
  walls
    .sort((a, b) => depth(a[0], a[2]) - depth(b[0], b[2]))
    .forEach(([x0, x1, y0, y1]) => box(x0, x1, y0, y1, PL, WT - 4, { fill: COL.part, top: COL.partTop, sw: 0.45, stroke: 'rgba(18,20,26,.25)' }));

  /* interior door leaves (as soon as the roof is off you can read them) */
  if (!showRoof) {
    box(129.6, 131.4, 104, 140, PL, 104, { fill: COL.door, top: '#3a4048', sw: 0.3 });
    box(252.6, 254.4, 76, 112, PL, 104, { fill: COL.door, top: '#3a4048', sw: 0.3 });
  }

  /* furniture */
  if (showInt) {
    const items = [
      [9, 69, 62, 140, PL + 20], [315, 375, 62, 140, PL + 20],
      [6, 128, 7, 29, PL + 66], [256, 378, 7, 29, PL + 66],
      [134, 162, 92, 154, PL + 28], [170, 206, 106, 126, PL + 15], [189, 252, 6, 28, PL + 32],
    ];
    items.sort((a, b) => depth(a[0], a[2]) - depth(b[0], b[2]))
      .forEach(([x0, x1, y0, y1, z1]) => box(x0, x1, y0, y1, PL, z1, { fill: COL.furn, top: shade(COL.furn, 12), sw: 0.3, stroke: 'rgba(18,20,26,.2)' }));
  }

  /* overhead tank */
  box(138, 180, 14, 56, 150, 178, { fill: COL.tank, top: shade(COL.tank, 14), sw: 0.7, stroke: 'rgba(30,60,95,.6)' });

  /* =============== 5 · near walls =============== */
  box(0, W, seeSouth ? D - 5 : 0, seeSouth ? D : 5, PL, WT, { fill: COL.wallOut });
  box(seeEast ? W - 5 : 0, seeEast ? W : 5, 0, D, PL, WT, { fill: COL.wallOut });
  const nearGx = seeEast ? W - 0.5 : 0.5;
  quad([[nearGx, 0, WT], [nearGx, D, WT], [nearGx, D / 2, RIDGE]], shade(COL.gable, -6), { sw: 0.7 });

  /* openings painted on the outer face of the near walls */
  const south = [
    [43, 48, 57, 105, 'win'], [136, 30, 45, 105, 'win'], [172, 40, PL, 108, 'door'], [218, 30, 45, 105, 'win'], [293, 48, 57, 105, 'win'],
  ];
  const north = [
    [49, 36, 63, 99, 'win'], [144, 24, 84, 102, 'win'], [190, 26, 66, 90, 'win'], [218, 30, PL, 104, 'door'], [279, 36, 63, 99, 'win'],
  ];
  const oy = seeSouth ? D + 0.8 : -0.8;
  (seeSouth ? south : north).forEach(([x, w, sill, head, k]) => {
    quad([[x, oy, sill], [x + w, oy, sill], [x + w, oy, head], [x, oy, head]], k === 'door' ? COL.door : COL.glass, { sw: 0.55 });
    if (k === 'win') seg([x + w / 2, oy, sill], [x + w / 2, oy, head], { stroke: 'rgba(18,20,26,.5)', sw: 0.4 });
  });
  if (seeEast) {
    /* east gable: vent + future knock-out */
    quad([[W + 0.8, 66, 108], [W + 0.8, 90, 108], [W + 0.8, 90, 120], [W + 0.8, 66, 120]], COL.glass, { sw: 0.4 });
    quad([[W + 0.8, 110, PL], [W + 0.8, 146, PL], [W + 0.8, 146, 104], [W + 0.8, 110, 104]], 'rgba(201,86,74,.28)', { sw: 0.9, dash: '5 3', stroke: 'rgba(201,86,74,.95)' });
    if (opts.future !== false) {
      const fx = W + 10, fs = 144, fy0 = 24, fy1 = 168;
      const g = 'rgba(201,86,74,.11)';
      box(fx, fx + fs, fy0, fy1, 0, PL, { fill: g, top: 'rgba(201,86,74,.18)', face: g, stroke: 'rgba(201,86,74,.55)', dash: '6 4', sw: 0.7 });
      box(fx, fx + fs, fy0, fy1, PL, WT, { fill: 'rgba(201,86,74,.05)', top: 'rgba(201,86,74,.09)', face: 'rgba(201,86,74,.05)', stroke: 'rgba(201,86,74,.45)', dash: '6 4', sw: 0.7 });
    }
  }

  /* =============== 6 · roof =============== */
  if (showRoof) {
    const xs = -OV, xe = W + OV, yN = -OV - 6, yS = D + OV + 6, ry = D / 2;
    /* only the slope that faces the camera is visible on a two-shed roof */
    const nY = seeSouth ? yN : yS, sYy = seeSouth ? yS : yN;
    const nearCol = seeSouth ? COL.roofS : COL.roofN;
    quad([[xs, sYy, EAVE], [xe, sYy, EAVE], [xe, ry, RIDGE], [xs, ry, RIDGE]], nearCol, { sw: 1 });
    for (let x = xs + 13; x < xe; x += 26) {
      seg([x, sYy, EAVE], [x, ry, RIDGE], { stroke: 'rgba(0,0,0,.16)', sw: 0.45 });
    }
    /* fascia on the visible eaves */
    quad([[xs, sYy, EAVE], [xe, sYy, EAVE], [xe, sYy, EAVE - 8], [xs, sYy, EAVE - 8]], 'rgba(35,40,47,.9)', { sw: 0.6 });
    /* ridge cap */
    quad([[xs - 3, ry - 5, RIDGE + 2], [xe + 3, ry - 5, RIDGE + 2], [xe + 3, ry + 5, RIDGE + 2], [xs - 3, ry + 5, RIDGE + 2]], COL.ridge, { sw: 0.8 });
    /* barge on the visible gable end */
    const bargeX = seeEast ? xe : xs;
    quad([[bargeX, yN, EAVE], [bargeX, yS, EAVE], [bargeX, ry, RIDGE]], 'rgba(40,46,53,.55)', { sw: 0.6 });
  }

  const pad = 16;
  const vb = `${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${(maxX - minX + pad * 2).toFixed(1)} ${(maxY - minY + pad * 2).toFixed(1)}`;
  return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img">${body}</svg>`;
}
