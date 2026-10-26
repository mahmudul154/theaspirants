/* ==========================================================================
   app.js — data, tables, wiring.
   ========================================================================== */
import { floorPlan, sitePlan, roofPlan, partiDiagram, WINDOWS, DOORS, AREA } from './plan.js';
import { southElevation, northElevation, eastElevation, westElevation, sectionAA, sectionBB, detailFooting, detailAnchor, detailEave, detailWindow, detailSeptic, detailTank, sunPath, rainChart } from './elev.js';
import { renderAxon } from './model3d.js';
import { hazardMatrix, waterSchematic, sld, gantt, gapChart } from './diagrams.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const bn = (n) => n.toLocaleString('bn-BD', { maximumFractionDigits: 0 });
const bdt = (n) => '৳' + n.toLocaleString('bn-BD', { maximumFractionDigits: 0 });

/* ==========================================================================
   1. COST DATA
   ========================================================================== */
const HEADS = [
  { short: 'ভিত্তি ও মাটি', name: 'মাটি কাটা, ভিত্তি ও প্লিন্থ', en: 'Earthwork & foundation', brief: 26000, lean: 62000, full: 128000, note: 'প্রাথমিকে রড নেই — কাঠামোগত ঝুঁকি' },
  { short: 'দেয়াল ও ট্রাস', name: 'দেয়াল গাঁথুনি, লিন্টেল ও MS ট্রাস', en: 'Walls, lintel & truss', brief: 91140, lean: 132000, full: 178000, note: '১,২২০ বর্গফুট নেট দেয়াল' },
  { short: 'ছাদের শিট', name: 'ছাদের শিট, রিজ ও ফিটিংস', en: 'Roof sheeting', brief: 25500, lean: 52000, full: 78000, note: '৭৭৭ বর্গফুট ছাদ · ৩৪ পিস' },
  { short: 'দরজা-জানালা', name: 'দরজা, জানালা ও নিরাপত্তা গ্রিল', en: 'Doors & windows', brief: 45200, lean: 96000, full: 148000, note: '৫ দরজা + ৮ জানালা + ২ ভেন্ট' },
  { short: 'ফিনিশিং', name: 'প্লাস্টার, ফ্লোর, টাইলস ও রং', en: 'Finishes', brief: 0, lean: 168000, full: 238000, note: 'প্রাথমিকে এই খাতে শূন্য টাকা' },
  { short: 'পানি ও পয়ঃ', name: 'পানি, স্যানিটেশন ও বৃষ্টির পানি', en: 'Water & sanitation', brief: 25800, lean: 68000, full: 84000, note: 'পাম্প, ট্যাংক, সেপটিক, গাটার' },
  { short: 'বিদ্যুৎ', name: 'বিদ্যুৎ সংযোগ, তার ও ফিটিংস', en: 'Electrical', brief: 21000, lean: 34000, full: 52000, note: 'BREB সংযোগ + SDB + পয়েন্ট' },
  { short: 'শ্রম', name: 'শ্রম ও সাইট ব্যবস্থাপনা', en: 'Labour & management', brief: 40000, lean: 130000, full: 138000, note: '২ রাজমিস্ত্রি + ২ হেল্পার × ৬০ দিন' },
  { short: 'কন্টিনজেন্সি', name: 'অন্যান্য ও কন্টিনজেন্সি', en: 'Sundries & contingency', brief: 0, lean: 30000, full: 31000, note: '৫% — অপরিহার্য' },
];
const SC = {
  brief: HEADS.reduce((s, h) => s + h.brief, 0),
  lean: HEADS.reduce((s, h) => s + h.lean, 0),
  full: HEADS.reduce((s, h) => s + h.full, 0),
};
const SQFT = 512;

/* ==========================================================================
   2. MATERIALS
   ========================================================================== */
const MATS = [
  ['দেয়ালের ব্লক', 'একো-সিমেন্ট ব্লক ১০"×৫"×৩", ৫" দেয়াল, ১:৬ মসলা', 'লোকাল / ফ্লাই-অ্যাশ', '৳৯–১২ /পিস', 'ক্লে ব্রিক ৳১০–১২'],
  ['সিমেন্ট', 'PCC ১:৩:৬ · RCC ১:২:৪ · মসলা ১:৬', 'Seven Ring / Scan / Bashundhara', '৳৪৮০–৫৪০ /ব্যাগ', '—'],
  ['বালি', 'স্থানীয় নদীর বালি, ধুয়ে ব্যবহার', 'নবীনগর / ভৈরব ঘাট', '৳৪৫–৫৫ /cft', '—'],
  ['ব্রিক চিপস', '৩/৪" সাইজ, পরিষ্কার', 'লোকাল', '৳১১০–১৩০ /cft', '—'],
  ['রড', '৬০ গ্রেড TMT, Ø১০ ও Ø১২', 'BSRM / AKS / Abul Khair', '৳৯৫–১০৫ /কেজি', '—'],
  ['MS অ্যাংগেল', '৫০×৫০×৫ ট্রাস · ৪০×৪০×৪ পার্লিন', 'BSRM / SSR / লোকাল', '৳১০০–১১৫ /কেজি', 'কাট+ওয়েল্ড প্যাকেজ'],
  ['ছাদের শিট', 'করগেটেড ০.৪৭মিমি কালার-কোটেড, ১১\' কাট', 'PHP / KAI / লোকাল', '৳১,২০০–১,৪০০ /পিস', '০.৩৬মিমি ৳১,০৫০'],
  ['রিজ ও বার্জ', '২\' লম্বা, কালো পাউডার-কোট', 'লোকাল', '৳৩৮০–৪৫০ /পিস', '—'],
  ['ইনসুলেশন', 'অ্যালু ফয়েল + ২৫মিমি এয়ার গ্যাপ', 'লোকাল / BMS', '৳৩৫–৪২ /sqft', 'বাদ দেওয়া যায়'],
  ['থাই জানালা', '৪" অ্যালু সেকশন + ৫মিমি গ্লাস, স্লাইডিং', 'KAI / PHP / Chung Hua', '৳৫৫০–৬৫০ /sqft', 'লোকাল ৳৪২০'],
  ['সেফটি গ্রিল', '১২মিমি বার @৪" + ৮মিমি ক্রস, পাউডার-কোট', 'লোকাল ফেব্রিকেশন', '৳১৯০–২৩০ /sqft', '—'],
  ['স্টিল দরজা', '১.২মিমি শিট + ২"×১.৫" ফ্রেম + ৮-লিভার লক', 'লোকাল / RFL / Protector', '৳১২,০০০–২২,০০০ /পিস', 'লোকাল ৳৯,৫০০'],
  ['ফ্লোর', 'নেট সিমেন্ট ১:৩ + কালো পিগমেন্ট, পলিশড', '—', '৳৬২–৭৮ /sqft', '—'],
  ['বাথ টাইলস', 'ম্যাট ফিনিশ, ৪\' উচ্চতা পর্যন্ত', 'Rak / লোকাল', '৳১৪০–১৮০ /sqft', 'সিমেন্ট ওয়াশ'],
  ['রং', 'ওয়েদার-কোট এক্রিলিক ২ কোট + প্রাইমার', 'Berger / Nippon', '৳২২–৩৪ /sqft', 'সিমেন্ট পেইন্ট'],
  ['পাম্প', '১HP সেন্ট্রিফিউগাল সাকশন', 'Watermax / সোনালী', '৳১১,৫০০–১৩,৫০০', '—'],
  ['ট্যাংক', '৫০০L HDPE ৩-লেয়ার, ফ্লোট ভালভ সহ', 'RFL / Poly', '৳৬,৫০০–৭,৫০০', '—'],
  ['পাইপ', 'uPVC ২৫মিমি রাইজার + ২০মিমি ব্রাঞ্চ', 'National / RFL', '৳১১০–১৪০ /rft', '—'],
  ['SDB', '৬ ওয়ে SPN + ৩২A মেইন + RCCB ৩০mA', 'লোকাল / Schneider', '৳৬,৫০০–৭,২০০', '—'],
  ['তার', '১.৫ / ২.৫ / ৪ RM, BDS মেনে', 'BBS / Paradise', '৳৩,২০০–৩,৮০০ /কয়েল', '—'],
  ['গাটার', '৩" PVC + ৪টি ডাউনপাইপ', 'লোকাল', '৳২২০–২৬০ /rft', '—'],
];

/* ==========================================================================
   3. RISKS
   ========================================================================== */
const RISKS = [
  ['বাজেট প্রায় ৩ গুণ কম', 'নিশ্চিত', 'উচ্চ', 'ফেজিং — কাঠামো আগে, ফিনিশিং পরে (১৩ ও ১৪ নম্বর)', 'মালিক'],
  ['ভিত্তিতে রড নেই', 'নিশ্চিত', 'উচ্চ', 'প্লিন্থ বিম + লিন্টেল ব্যান্ডে ন্যূনতম ৩৫০ কেজি রড', 'কাঠামো ইঞ্জি.'],
  ['বর্ষায় প্লাবন', 'উচ্চ', 'উচ্চ', 'প্লিন্থ +২\'-০", প্লিন্থ প্রোটেকশন, সোক পিট', 'স্থপতি'],
  ['ভূমিকম্প Z=০.২৮', 'মধ্যম', 'উচ্চ', 'কর্নার পোস্ট ৮টি + লিন্টেল ব্যান্ড নিরবচ্ছিন্ন', 'কাঠামো ইঞ্জি.'],
  ['বাতাসে ছাদ উড়ে যাওয়া', 'মধ্যম', 'মধ্যম', 'J-বোল্ট @৪\'-০" c/c, ২টি X-ব্রেসিং, টাই-ডাউন', 'ফেব্রিকেটর'],
  ['মাটির বসে যাওয়া / ফাটল', 'মধ্যম', 'মধ্যম', 'ভালো কম্প্যাকশন, স্ট্রিপ ফুটিং ১৬"×৯", কিউরিং', 'ঠিকাদার'],
  ['সেপটিক ও টিউবওয়েলের দূরত্ব', 'নিম্ন', 'উচ্চ', 'কমপক্ষে ২৫ ফুট, টিউবওয়েল সেপটিকের উজানে', 'স্থপতি'],
  ['বৈদ্যুতিক শক', 'মধ্যম', 'উচ্চ', 'RCCB ৩০mA, ২টি আর্থ রড, বন্ডিং', 'ইলেকট্রিশিয়ান'],
  ['বর্ষায় প্লাস্টার-রং নষ্ট', 'উচ্চ', 'মধ্যম', 'জুলাই–আগস্টে রং নয়; নভেম্বরে শুরু', 'ঠিকাদার'],
  ['শ্রমিক সংকট (ধান কাটার মরসুম)', 'মধ্যম', 'নিম্ন', 'কর্মসূচি ধান কাটার আগে-পরে সাজানো', 'মালিক'],
];

/* ==========================================================================
   4. RENDERERS
   ========================================================================== */
const DRAW = {
  axon: () => renderAxon({ yaw: 150, pitch: 14 }),
  axonRoofOff: () => renderAxon({ yaw: +($('#yaw2')?.value || 150), pitch: 40, roof: false }),
  plan: () => floorPlan(layerState),
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
  sld: sld,
  gantt: gantt,
  gapChart: () => gapChart(HEADS),
};

function renderAll() {
  $$('[data-draw]').forEach((host) => {
    const key = host.dataset.draw;
    if (!DRAW[key]) return;
    try {
      host.innerHTML = DRAW[key]();
    } catch (e) {
      host.innerHTML = `<div style="padding:20px;font-family:monospace;font-size:11px;color:#b03a2e">drawing error: ${key}</div>`;
      console.error(key, e);
    }
  });
}

/* ---------- plan layers -------------------------------------------------- */
const layerState = { furniture: true, dims: true, structure: false, plumbing: false, electrical: false, future: true };
function wirePlanCtrls() {
  const host = $('#planCtrls');
  if (!host) return;
  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-layer]');
    if (!btn) return;
    const k = btn.dataset.layer;
    layerState[k] = !layerState[k];
    btn.setAttribute('aria-pressed', String(layerState[k]));
    $('#planHost').innerHTML = floorPlan(layerState);
  });
}

/* ---------- tables ------------------------------------------------------- */
function fillTables() {
  /* materials */
  const mb = $('#matTable tbody');
  if (mb) {
    mb.innerHTML = MATS.map(([a, b, c, d, e]) => `
      <tr><td style="font-weight:500">${a}</td><td>${b}</td><td style="color:var(--ink-60)">${c}</td>
      <td class="num">${d}</td><td style="color:var(--ink-40)">${e}</td></tr>`).join('');
  }

  /* windows */
  const wb = $('#winTable tbody');
  if (wb) {
    wb.innerHTML = WINDOWS.map((w) => `<tr><td class="num" style="color:var(--red)">${w.id}</td><td>${w.loc}</td>
      <td class="num">${w.w}" × ${w.h}"</td><td class="num">${w.sill}"</td><td style="font-size:12px">${w.type}</td></tr>`).join('');
  }

  /* doors */
  const db = $('#doorTable tbody');
  if (db) {
    db.innerHTML = DOORS.map((d) => `<tr><td class="num" style="color:var(--red)">${d.id}</td><td>${d.loc}</td>
      <td class="num">${d.w}" × ${d.h}"</td><td style="font-size:12px">${d.type}</td></tr>`).join('');
  }

  /* boq */
  const bb = $('#boqTable tbody');
  if (bb) {
    bb.innerHTML = HEADS.map((h) => `
      <tr>
        <td><span style="font-weight:500">${h.name}</span><br><span style="font-size:11px;color:var(--ink-40);font-family:var(--f-mono);letter-spacing:.06em;text-transform:uppercase">${h.en}</span></td>
        <td class="num" style="color:${h.brief === 0 ? 'var(--ink-40)' : 'var(--ink)'}">${h.brief === 0 ? '—' : bn(h.brief)}</td>
        <td class="num">${bn(h.lean)}</td>
        <td class="num">${bn(h.full)}</td>
        <td style="font-size:11.5px;color:var(--ink-60)">${h.note}</td>
      </tr>`).join('') + `
      <tr class="tbl-tot">
        <td>মোট</td>
        <td class="num">${bn(SC.brief)}</td>
        <td class="num">${bn(SC.lean)}</td>
        <td class="num">${bn(SC.full)}</td>
        <td style="font-family:var(--f-bn);font-size:11.5px;opacity:.75">${bdt(Math.round(SC.brief / SQFT))} / ${bdt(Math.round(SC.lean / SQFT))} / ${bdt(Math.round(SC.full / SQFT))} প্রতি বর্গফুট</td>
      </tr>`;
  }

  /* risks */
  const rb = $('#riskTable tbody');
  if (rb) {
    const tagFor = (v) => v === 'উচ্চ' ? 'tag--red' : v === 'মধ্যম' ? 'tag--amber' : 'tag--green';
    rb.innerHTML = RISKS.map(([r, p, i, m, who]) => `
      <tr><td style="font-weight:500">${r}</td><td><span class="tag ${tagFor(p)}">${p}</span></td>
      <td><span class="tag ${tagFor(i)}">${i}</span></td><td style="font-size:12px">${m}</td>
      <td style="font-size:12px;color:var(--ink-40)">${who}</td></tr>`).join('');
  }

  /* key numbers */
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('#kLean', bn(SC.lean));
  set('#kFull', bn(SC.full));
  set('#kGap', '×' + (SC.full / SC.brief).toFixed(1).replace('.', '.') .replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]));
}

/* ---------- axon sliders ------------------------------------------------- */
function wireSlider() {
  const s = $('#yaw2');
  if (!s) return;
  let raf = null;
  const go = () => {
    const host = $('[data-draw="axonRoofOff"]');
    if (host) host.innerHTML = renderAxon({ yaw: +s.value, pitch: 40, roof: false });
  };
  s.addEventListener('input', () => {
    if (typeof requestAnimationFrame === 'undefined') { go(); return; }
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(go);
  });
}

/* ---------- reveal + rail ------------------------------------------------ */
function wireScroll() {
  if (typeof IntersectionObserver === 'undefined') {
    /* old Android WebView / very old browsers: show everything, keep the nav simple */
    $$('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  const links = $$('#railNav a');
  const secs = links.map((a) => document.querySelector(a.getAttribute('href')));
  const nav = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => s && nav.observe(s));
}

/* ---------- drawing zoom ------------------------------------------------- */
function wireZoom() {
  const ov = document.createElement('div');
  ov.className = 'zoom';
  ov.innerHTML = `
    <div class="zoom__bar">
      <span>ড্রয়িং দেখুন · <b data-zoom-title>PLATE</b></span>
      <span>স্ক্রল / ড্র্যাগ করে সরান · ESC বন্ধ</span>
      <button class="zoom__close" type="button">✕ বন্ধ করুন</button>
    </div>
    <div class="zoom__stage"><div data-zoom-body></div></div>`;
  document.body.appendChild(ov);
  const body = ov.querySelector('[data-zoom-body]');
  const titleEl = ov.querySelector('[data-zoom-title]');
  let lastFocus = null;

  const open = (host, title) => {
    lastFocus = host;
    body.innerHTML = host.innerHTML;
    titleEl.textContent = title || host.dataset.draw;
    ov.classList.add('on');
    document.body.style.overflow = 'hidden';
    ov.querySelector('.zoom__close').focus();
  };
  const close = () => {
    ov.classList.remove('on');
    body.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  /* a small "zoom" affordance in every title block */
  $$('.plate').forEach((pl) => {
    const tb = pl.querySelector('.plate__tb');
    const bd = pl.querySelector('.plate__bd');
    if (!tb || !bd || tb.querySelector('.zoomhint')) return;
    const hint = document.createElement('div');
    hint.className = 'zoomhint';
    hint.style.cssText = 'padding:6px 12px;border-left:1px solid var(--rule);color:var(--red)';
    hint.textContent = '⤢ জুম';
    tb.appendChild(hint);
  });

  $$('.plate__bd').forEach((host) => {
    host.tabIndex = 0;
    host.setAttribute('role', 'button');
    host.setAttribute('aria-label', 'ড্রয়িং বড় করে দেখুন');
    const title = host.closest('.plate')?.querySelector('.plate__hd')?.innerText?.split('\n')[0] || host.dataset.draw;
    host.addEventListener('click', () => open(host, title));
    host.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(host, title); } });
  });
  ov.querySelector('.zoom__close').addEventListener('click', close);
  ov.addEventListener('click', (e) => { if (e.target === ov || e.target.classList.contains('zoom__stage')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('on')) close(); });
}

/* ---------- boot --------------------------------------------------------- */
renderAll();
fillTables();
wirePlanCtrls();
wireSlider();
wireScroll();
wireZoom();

/* expose for debug */
window.__dhs = { AREA, SC, HEADS };
