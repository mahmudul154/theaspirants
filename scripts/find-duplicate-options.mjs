// Audit `mcq_questions_job` for questions whose four options contain a repeat.
//
// A repeated option is a data defect in two different degrees:
//   • ambiguous  — the repeated value IS the row's `answer`, so two options are
//                  both correct and grading depends on which one is picked.
//   • cosmetic   — the repeat is only among the wrong options; the question is
//                  still gradeable but reads as a typo.
//
// Supabase rejects unindexed server-side scans for the anon role (statement
// timeout), and PostgREST cannot compare two jsonb array positions, so the
// duplicate test has to run client-side over paged reads — the same paging
// strategy `api/question-counts.js` already uses.
//
// Usage:
//   npm run audit:duplicate-options                 # report only
//   npm run audit:duplicate-options -- --sql        # also write a fix script
//   npm run audit:duplicate-options -- --only-ambiguous
import fs from 'node:fs'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dgorizwfkyyjrufcqjjo.supabase.co'
// The anon key is already public in this repo (it ships to the browser).
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnb3Jpendma3l5anJ1ZmNxampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTMzODMsImV4cCI6MjA3NDM2OTM4M30.fuN6dnuCkDLEGknhYPJzh6-7O8ucUwBnrBelWc_NNB8'

const PAGE_SIZE = 1000
const BATCH_SIZE = 4
const MAX_ROWS = 200000
const REPORT_PATH = new URL('../duplicate-options-report.json', import.meta.url)

const args = process.argv.slice(2)
const wantsSql = args.includes('--sql')
const onlyAmbiguous = args.includes('--only-ambiguous')

// Normalization mirrors src/routine-syllabus.js: the bank mixes decomposed
// Bengali characters and inconsistent spacing, and those variants are the same
// option to a reader even though the bytes differ.
export const normalize = value => String(value ?? '')
  .normalize('NFC')
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase()

async function fetchPage(offset) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/mcq_questions_job`)
  url.searchParams.set('select', 'id,created_at,subject,topic,post_name,question,options,answer,is_active')
  // `id` is not unique in this table, so keep offset paging deterministic with
  // the unique (id, created_at) composite order.
  url.searchParams.set('order', 'id.asc,created_at.asc')
  url.searchParams.set('offset', String(offset))
  url.searchParams.set('limit', String(PAGE_SIZE))
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    })
    if (response.ok) return response.json()
    const body = await response.text().catch(() => '')
    // Retry both transient failures and anon statement timeouts.
    if (attempt === 3) throw new Error(`Supabase read failed (${response.status}): ${body.slice(0, 200)}`)
    await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)))
  }
  return []
}

export function inspect(row) {
  const options = Array.isArray(row.options) ? row.options : []
  if (options.length < 2) return null

  const seen = new Map()
  const repeated = []
  options.forEach((option, index) => {
    const key = normalize(option)
    if (!key) return
    if (seen.has(key)) repeated.push({ first: seen.get(key), index, value: String(option) })
    else seen.set(key, index)
  })
  if (!repeated.length) return null

  const answerKey = normalize(row.answer)
  const answerIsDuplicated = repeated.some(duplicate => normalize(duplicate.value) === answerKey)
  const answerMissing = Boolean(row.answer) && !options.some(option => normalize(option) === answerKey)

  return {
    id: row.id,
    created_at: row.created_at,
    subject: row.subject,
    topic: row.topic,
    post_name: row.post_name,
    is_active: row.is_active,
    question: row.question,
    options,
    answer: row.answer,
    severity: answerIsDuplicated ? 'ambiguous' : 'cosmetic',
    repeated_positions: repeated.map(duplicate => [duplicate.first, duplicate.index]),
    repeated_values: [...new Set(repeated.map(duplicate => duplicate.value))],
    answer_missing_from_options: answerMissing
  }
}

async function main() {
  console.log(`Auditing ${SUPABASE_URL} → mcq_questions_job`)
  const duplicates = []
  let scanned = 0
  let answerMissing = 0
  let done = false

  for (let base = 0; base < MAX_ROWS && !done; base += PAGE_SIZE * BATCH_SIZE) {
    const pages = await Promise.all(
      Array.from({ length: BATCH_SIZE }, (_, index) => fetchPage(base + index * PAGE_SIZE))
    )
    for (const page of pages) {
      for (const row of page) {
        scanned++
        const finding = inspect(row)
        if (finding) {
          duplicates.push(finding)
          if (finding.answer_missing_from_options) answerMissing++
        }
      }
      if (page.length < PAGE_SIZE) { done = true; break }
    }
    process.stdout.write(`\r  scanned ${scanned.toLocaleString('en-US')} rows, ${duplicates.length} with duplicate options…`)
  }
  console.log('')

  const ambiguous = duplicates.filter(item => item.severity === 'ambiguous')
  const cosmetic = duplicates.filter(item => item.severity === 'cosmetic')
  const active = duplicates.filter(item => item.is_active)

  const bySubject = new Map()
  for (const item of duplicates) {
    const bucket = bySubject.get(item.subject) || { ambiguous: 0, cosmetic: 0 }
    bucket[item.severity]++
    bySubject.set(item.subject, bucket)
  }

  console.log('\n==== duplicate-option audit ====')
  console.log(`rows scanned              : ${scanned.toLocaleString('en-US')}`)
  console.log(`duplicate options         : ${duplicates.length}`)
  console.log(`  ambiguous (answer dup)  : ${ambiguous.length}   <-- two options are both correct`)
  console.log(`  cosmetic (wrong-option)  : ${cosmetic.length}`)
  console.log(`still active (is_active)  : ${active.length}`)
  console.log(`answer not among options  : ${answerMissing}`)

  if (bySubject.size) {
    console.log('\nby subject:')
    for (const [subject, bucket] of [...bySubject].sort((a, b) => (b[1].ambiguous + b[1].cosmetic) - (a[1].ambiguous + a[1].cosmetic))) {
      console.log(`  ${String(subject).slice(0, 34).padEnd(34)} ambiguous=${String(bucket.ambiguous).padStart(4)} cosmetic=${String(bucket.cosmetic).padStart(4)}`)
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    source: SUPABASE_URL,
    scanned,
    totals: {
      duplicates: duplicates.length,
      ambiguous: ambiguous.length,
      cosmetic: cosmetic.length,
      active: active.length,
      answerMissing
    },
    bySubject: Object.fromEntries(bySubject),
    findings: duplicates
  }
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8')
  console.log(`\nreport written → ${REPORT_PATH.pathname}`)

  const targets = onlyAmbiguous ? ambiguous : duplicates
  if (wantsSql && targets.length) {
    const ids = targets.map(item => item.id)
    const sqlPath = new URL('../supabase/deactivate-duplicate-options.generated.sql', import.meta.url)
    fs.writeFileSync(sqlPath, `-- Generated by scripts/find-duplicate-options.mjs on ${new Date().toISOString()}
-- ${targets.length} question(s) with duplicate options${onlyAmbiguous ? ' (ambiguous only)' : ''}.
-- Review duplicate-options-report.json first; this only hides them from exams.
begin;
update public.mcq_questions_job
   set is_active = false
 where id = any (array[${ids.join(', ')}]::bigint[])
   and is_active;
-- commit;   -- remove the leading "--" once the count below looks right
rollback;
`, 'utf8')
    console.log(`fix script written → ${sqlPath.pathname} (defaults to ROLLBACK; edit before committing)`)
  }

  console.log('\nNext: open supabase/find-and-fix-duplicate-options.sql in the Supabase SQL editor')
  console.log('to re-verify server-side and apply the fix with full privileges.')
}

// Only audit when run directly; importing this module (for tests) must not
// start paging the database.
const invokedDirectly = process.argv[1]
  ? import.meta.url === new URL(`file://${process.argv[1]}`).href
  : false

if (invokedDirectly) {
  main().catch(error => {
    console.error(`\n✗ ${error.message}`)
    process.exit(1)
  })
}
