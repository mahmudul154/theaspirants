// Guard the hand-maintained job-circular dataset.
//
// Structural problems fail the run: they are authoring bugs that would ship a
// broken card. Staleness only warns — a validator that starts failing weeks
// later on an unrelated PR is more confusing than useful, and the UI already
// shows "সর্বশেষ হালনাগাদ" to the learner.
import assert from 'node:assert/strict'
import {
  JOB_CIRCULARS, CIRCULAR_DATA_UPDATED, CIRCULAR_STATUS_LABEL,
  circularStatus, circularUrgency, circularDaysLeft,
  formatCircularCountdown, formatCircularDateTime,
  filterJobCirculars, jobCircularCounts, sortJobCirculars
} from '../src/job-circulars.js'

// Icons that actually have a `.circular-icon-*` colour tint in styles.css.
// An icon outside this set renders unstyled.
const TINTED_ICONS = new Set(['building', 'bank', 'book', 'school', 'layers', 'news', 'exam', 'lock'])
const STATUSES = new Set(['open', 'upcoming', 'closed'])
const STALE_WARN_DAYS = 14

const errors = []
const warnings = []
const fail = (id, message) => errors.push(`${id}: ${message}`)
const warn = message => warnings.push(message)

const now = Date.now()
const seenIds = new Set()

for (const c of JOB_CIRCULARS) {
  const id = c.id || '(missing id)'

  if (!c.id) fail(id, 'missing id')
  else if (seenIds.has(c.id)) fail(id, 'duplicate id')
  seenIds.add(c.id)

  for (const field of ['org', 'orgShort', 'category', 'summary', 'applyStart', 'applyDeadline', 'applyUrl', 'circularUrl']) {
    if (!c[field]) fail(id, `missing required field "${field}"`)
  }

  if (c.icon && !TINTED_ICONS.has(c.icon)) {
    fail(id, `icon "${c.icon}" has no .circular-icon-* tint in styles.css`)
  }

  const start = Date.parse(c.applyStart)
  const deadline = Date.parse(c.applyDeadline)
  if (Number.isNaN(start)) fail(id, `applyStart is not a parseable date: ${c.applyStart}`)
  if (Number.isNaN(deadline)) fail(id, `applyDeadline is not a parseable date: ${c.applyDeadline}`)

  if (!Number.isNaN(start) && !Number.isNaN(deadline)) {
    if (start >= deadline) fail(id, 'applyStart must be before applyDeadline')
    // Deadlines are Bangladesh-time wall clocks. Without an explicit offset a
    // date-only or naive string would shift the countdown for every user whose
    // device is not in Asia/Dhaka.
    for (const [field, value] of [['applyStart', c.applyStart], ['applyDeadline', c.applyDeadline]]) {
      if (!/[+-]\d{2}:\d{2}$|Z$/.test(value)) {
        fail(id, `${field} "${value}" has no UTC offset — countdown would be timezone-dependent`)
      }
    }
    // A window shorter than a day is almost certainly a typo in the source notice.
    if (deadline - start < 24 * 60 * 60 * 1000) {
      warn(`${id}: application window is under 24 hours — double-check the notice`)
    }
  }

  for (const [field, value] of [['applyUrl', c.applyUrl], ['circularUrl', c.circularUrl]]) {
    if (value && !/^https:\/\//.test(value)) {
      fail(id, `${field} must be an absolute https URL, got "${value}"`)
    }
  }

  if (!Array.isArray(c.highlights) || c.highlights.length === 0) {
    warn(`${id}: no highlights — the detail modal will look empty`)
  } else {
    for (const h of c.highlights) {
      if (!h?.label || !h?.value) fail(id, 'every highlight needs both label and value')
    }
  }

  // The helpers must never throw or emit a negative countdown on real data.
  const status = circularStatus(c, now)
  if (!STATUSES.has(status)) fail(id, `circularStatus returned "${status}"`)
  if (circularStatus(c, deadline) !== 'closed') fail(id, 'status must be "closed" at the deadline instant')
  if (circularStatus(c, deadline - 1) !== 'open') fail(id, 'status must be "open" just before the deadline')
  if (circularStatus(c, start - 1) !== 'upcoming') fail(id, 'status must be "upcoming" before the window opens')
  if (circularDaysLeft(c, now) < 0) fail(id, 'circularDaysLeft went negative')
  if (circularUrgency(c, now) && status !== 'open') fail(id, 'urgency must only be set while open')
  if (/-/.test(formatCircularCountdown(c.applyDeadline, deadline + 1000))) {
    fail(id, 'countdown must clamp at zero, not go negative')
  }
  if (!formatCircularDateTime(c.applyDeadline)) fail(id, 'formatCircularDateTime returned empty')
}

// Snapshot date must be real and not in the future.
const updated = Date.parse(`${CIRCULAR_DATA_UPDATED}T00:00:00Z`)
if (Number.isNaN(updated)) {
  errors.push(`CIRCULAR_DATA_UPDATED is not a valid YYYY-MM-DD date: ${CIRCULAR_DATA_UPDATED}`)
} else if (updated > now) {
  errors.push(`CIRCULAR_DATA_UPDATED is in the future: ${CIRCULAR_DATA_UPDATED}`)
} else {
  const ageDays = Math.floor((now - updated) / 86400000)
  if (ageDays > STALE_WARN_DAYS) {
    warn(`snapshot is ${ageDays} days old (CIRCULAR_DATA_UPDATED=${CIRCULAR_DATA_UPDATED}) — refresh src/job-circulars.js`)
  }
}

const counts = jobCircularCounts(JOB_CIRCULARS, now)
if (counts.open === 0) {
  warn('no circular is currently open — the hub will show the empty state; the list has probably gone stale')
}

// Ordering must put actionable circulars first and stay stable.
const sorted = sortJobCirculars(JOB_CIRCULARS, now)
const rank = { open: 0, upcoming: 1, closed: 2 }
for (let i = 1; i < sorted.length; i++) {
  const prev = sorted[i - 1]
  const curr = sorted[i]
  const prevRank = rank[circularStatus(prev, now)]
  const currRank = rank[circularStatus(curr, now)]
  if (prevRank > currRank) errors.push(`sort: "${prev.id}" (${prevRank}) sorted after "${curr.id}" (${currRank})`)
  if (prevRank === currRank && Date.parse(prev.applyDeadline) > Date.parse(curr.applyDeadline)) {
    errors.push(`sort: within "${currRank}", "${prev.id}" has a later deadline than "${curr.id}"`)
  }
}

// Filter must partition the set exactly.
const partition = ['open', 'upcoming', 'closed']
  .reduce((sum, key) => sum + filterJobCirculars(JOB_CIRCULARS, key, now).length, 0)
assert.equal(partition, JOB_CIRCULARS.length, 'open + upcoming + closed must equal the full list')
for (const [key, label] of Object.entries(CIRCULAR_STATUS_LABEL)) {
  if (!label) errors.push(`CIRCULAR_STATUS_LABEL["${key}"] is empty`)
}

console.log(`job circulars: ${JOB_CIRCULARS.length} total — ${counts.open} open, ${counts.upcoming} upcoming, ${counts.closed} closed`)
console.log(`snapshot: ${CIRCULAR_DATA_UPDATED}`)
for (const c of sorted) {
  const st = circularStatus(c, now)
  const target = st === 'upcoming' ? c.applyStart : c.applyDeadline
  const left = st === 'closed' ? '—' : formatCircularCountdown(target, now)
  console.log(`  ${st.padEnd(9)} ${String(circularUrgency(c, now) || '-').padEnd(7)} ${left.padEnd(20)} ${c.org}`)
}

for (const w of warnings) console.log(`⚠ ${w}`)
for (const e of errors) console.log(`✗ ${e}`)

if (errors.length) {
  console.log(`\n✗ ${errors.length} problem(s) in src/job-circulars.js`)
  process.exit(1)
}
console.log(warnings.length
  ? `\n✓ structure valid (${warnings.length} warning(s) — see above)`
  : '\n✓ job circulars valid: unique ids, ordered windows, timezone-pinned deadlines, https links, tinted icons')
