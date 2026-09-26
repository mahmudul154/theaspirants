// Render smoke test for the job-circular cards.
//
// `vite build` only proves the JSX parses and the imports resolve — it never
// executes the component. This bundles the real JobCircularCard out of App.jsx
// with esbuild and renders it through react-dom/server, so a runtime crash or a
// wrong countdown string is caught here rather than in a learner's browser.
//
// Expected countdown values below are worked out by hand from the ISO deadlines
// (which are pinned to +06:00), NOT recomputed with the same helpers the
// component uses — otherwise the test would only prove the code agrees with
// itself.
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outfile = path.join(repoRoot, 'node_modules', '.cache', 'render-smoke-job-circulars.mjs')
fs.mkdirSync(path.dirname(outfile), { recursive: true })

// App.jsx pulls in CSS and touches browser globals at module scope, neither of
// which exists under plain Node. CSS is dropped and the globals are stubbed in
// a banner so they exist before any bundled module body runs.
const BANNER = `
// Bundled CJS deps still call require(); ESM output has none, so synthesise one.
import { createRequire as __cr } from 'node:module'
const require = __cr(import.meta.url)
if (typeof globalThis.window === 'undefined') {
  const noop = () => {}
  const elementStub = () => ({ style: {}, classList: { add: noop, remove: noop, toggle: noop, contains: () => false }, appendChild: noop, setAttribute: noop, addEventListener: noop })
  globalThis.window = { addEventListener: noop, removeEventListener: noop, scrollTo: noop, matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }), localStorage: { getItem: () => null, setItem: noop, removeItem: noop }, location: { href: 'http://localhost/' } }
  globalThis.document = { documentElement: elementStub(), body: elementStub(), createElement: elementStub, querySelectorAll: () => [], querySelector: () => null, addEventListener: noop, removeEventListener: noop }
  globalThis.localStorage = globalThis.window.localStorage
  // Node 22 exposes navigator as a getter-only global, so assign defensively.
  try { globalThis.navigator = { userAgent: 'node', clipboard: { writeText: async () => {} } } } catch { /* already provided by Node */ }
  globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }
  globalThis.matchMedia = globalThis.window.matchMedia
}
`

const ENTRY = `
import React from 'react'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { JobCircularCard } from './src/App.jsx'
import { JOB_CIRCULARS, circularStatus } from './src/job-circulars.js'

const noop = () => {}
const render = (circular, now, compact = false) =>
  renderToStaticMarkup(<JobCircularCard circular={circular} now={now} compact={compact} onDetails={noop} onApply={noop} />)

// Frozen instants, chosen so the arithmetic below is exact.
const NOON = Date.parse('2026-09-21T12:00:00+06:00')
const AFTER_DTE = Date.parse('2026-09-21T17:00:00+06:00')

const byId = id => {
  const found = JOB_CIRCULARS.find(c => c.id === id)
  assert.ok(found, 'circular missing from dataset: ' + id)
  return found
}

let checks = 0
const expect = (html, needle, why) => {
  assert.ok(html.includes(needle), why + ' — expected to find: ' + needle)
  checks++
}
const reject = (html, needle, why) => {
  assert.ok(!html.includes(needle), why + ' — expected NOT to find: ' + needle)
  checks++
}
// Scope the check to the countdown element itself. Scanning the whole markup
// false-positives on inline SVG path data (d="m3 10 9-6 9 6-9 6z").
// NB: this lives inside a template literal, so the regex backslash must be
// doubled — a single "\\/" would be eaten by the literal and emit "</b>",
// whose "/" terminates the regex early.
const COUNTDOWN_TEXT = /<b class="num"[^>]*>([^<]*)<\\/b>/
const countdownText = html => (html.match(COUNTDOWN_TEXT) || [])[1]
const assertNoNegativeCountdown = (html, why) => {
  const text = countdownText(html)
  if (text === undefined) { checks++; return } // closed cards render no countdown at all
  assert.ok(!/[-\u2212]/.test(text), why + ' — countdown rendered "' + text + '"')
  checks++
}

// --- every circular renders without throwing, at several instants ---
for (const now of [NOON, AFTER_DTE, Date.parse('2026-10-20T09:00:00+06:00')]) {
  for (const c of JOB_CIRCULARS) {
    const html = render(c, now)
    assert.ok(html.length > 200, c.id + ' rendered suspiciously little markup')
    expect(html, c.org, c.id + ' must show the organisation name')
    expect(html, c.summary, c.id + ' must show the short summary')
    expect(html, 'মূল বিজ্ঞপ্তি', c.id + ' must offer the full-notice button')
  }
}

// --- Teletalk Bangladesh Ltd: deadline 2026-10-01T17:00+06:00 ---
// From 21 Sep 12:00 to 1 Oct 17:00 is exactly 10 days 5 hours.
const tbl = render(byId('teletalk-bangladesh-ltd'), NOON)
expect(tbl, '১০ দিন ০৫:০০:০০', 'TBL countdown must be exactly 10d 05h')
expect(tbl, '১১ দিন বাকি', 'TBL days-left rounds up to 11')
expect(tbl, 'আবেদন চলছে', 'TBL must be open at noon on 21 Sep')
expect(tbl, 'আবেদন করুন', 'TBL must offer the apply button')
expect(tbl, '২০০ টাকা (সার্ভিস চার্জসহ ২০৬ টাকা)', 'TBL must show its fee')

// --- Khulna DC: window opens 2026-09-22T10:00+06:00 ---
// From 21 Sep 12:00 that is exactly 22 hours, so no day component is shown.
const khulna = render(byId('dc-khulna'), NOON)
expect(khulna, 'আবেদন শুরু হয়নি', 'Khulna must be upcoming at noon on 21 Sep')
expect(khulna, '২২:০০:০০', 'Khulna must count down 22h to its start')
expect(khulna, 'আবেদন শুরু হতে বাকি', 'Khulna label must track the start, not the deadline')

// --- DTE: deadline 2026-09-21T16:00+06:00, i.e. already past AFTER_DTE ---
const dteOpen = render(byId('dte-workshop-assistant'), NOON)
expect(dteOpen, '০৪:০০:০০', 'DTE must show 4h left at noon')
expect(dteOpen, 'আজই শেষ!', 'DTE must flag the same-day deadline')
const dteClosed = render(byId('dte-workshop-assistant'), AFTER_DTE)
expect(dteClosed, 'আবেদন শেষ', 'DTE must flip to closed an hour after its deadline')
expect(dteClosed, 'আবেদন বন্ধ', 'DTE apply button must relabel once closed')
expect(dteClosed, 'disabled', 'DTE apply button must be disabled once closed')
assert.equal(circularStatus(byId('dte-workshop-assistant'), AFTER_DTE), 'closed', 'status helper must agree')

// --- once closed, a card must not render any countdown at all ---
// Clamping at zero would still show "০০:০০:০০" forever, which reads as a
// live deadline; the closed branch replaces it with a fixed past date instead.
const farFuture = Date.parse('2027-06-01T00:00:00+06:00')
for (const c of JOB_CIRCULARS) {
  const html = render(c, farFuture)
  assert.equal(circularStatus(c, farFuture), 'closed', c.id + ' must be closed by 2027')
  assert.equal(countdownText(html), undefined, c.id + ' must render no countdown element once closed')
  assertNoNegativeCountdown(html, c.id)
  expect(html, 'আবেদন শেষ', c.id + ' must show the closed status label')
  expect(html, 'disabled', c.id + ' must disable the apply button once closed')
}

// --- and an open card must never go negative either, right at the boundary ---
for (const c of JOB_CIRCULARS) {
  const atDeadline = Date.parse(c.applyDeadline)
  assertNoNegativeCountdown(render(c, atDeadline - 1000), c.id + ' one second before deadline')
  assertNoNegativeCountdown(render(c, atDeadline), c.id + ' exactly at deadline')
  assertNoNegativeCountdown(render(c, atDeadline + 1000), c.id + ' one second after deadline')
}

// --- compact variant (home strip) drops the meta grid but keeps countdown ---
const compact = render(byId('dls'), NOON, true)
const full = render(byId('dls'), NOON, false)
expect(full, '৫৩৮টি', 'full card must show the vacancy count')
reject(compact, '৫৩৮টি', 'compact card must omit the meta grid')
expect(compact, 'job-countdown', 'compact card must still show the countdown')

// --- urgency tiers drive the left-rule class used for scanning the list ---
expect(render(byId('bangladesh-bank'), NOON), 'is-soon', 'BB at 6 days must be tiered "soon"')
expect(render(byId('police-masp-madaripur'), NOON), 'is-normal', 'Police at 23 days must be tiered "normal"')

console.log('rendered ' + JOB_CIRCULARS.length + ' circulars across 4 instants')
console.log('OK ' + checks + ' render assertions passed')
// Importing App.jsx drags in the Supabase client, whose token-refresh timer
// keeps the event loop alive long after the assertions finish. Exit explicitly
// so a passing run does not hang.
process.exit(0)
`

const buildStarted = Date.now()
await build({
  stdin: { contents: ENTRY, resolveDir: repoRoot, loader: 'jsx', sourcefile: 'render-smoke-entry.jsx' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  banner: { js: BANNER },
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
  jsx: 'transform',
  logLevel: 'warning'
})
console.error(`(bundled in ${((Date.now() - buildStarted) / 1000).toFixed(1)}s)`)

try {
  await import(outfile)
} catch (error) {
  console.error('\n✗ render smoke test failed')
  console.error(error?.message?.split('\n').slice(0, 12).join('\n'))
  process.exit(1)
} finally {
  fs.rmSync(outfile, { force: true })
}
