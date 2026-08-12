import { DB_SUBJECT_ALIASES } from '../src/subjectAliases.js'

export const config = { maxDuration: 60 }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dgorizwfkyyjrufcqjjo.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnb3Jpendma3l5anJ1ZmNxampvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTMzODMsImV4cCI6MjA3NDM2OTM4M30.fuN6dnuCkDLEGknhYPJzh6-7O8ucUwBnrBelWc_NNB8'
const PAGE_SIZE = 3000
const BATCH_SIZE = 4
const MAX_ROWS = 150000

async function fetchPage(offset) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/mcq_questions_job`)
  url.searchParams.set('select', 'subject,topic')
  url.searchParams.set('is_active', 'eq.true')
  url.searchParams.set('order', 'id.asc')
  url.searchParams.set('offset', String(offset))
  url.searchParams.set('limit', String(PAGE_SIZE))
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    if (response.ok) return response.json()
    if (attempt === 2) throw new Error(`Supabase count page failed: ${response.status}`)
    await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)))
  }
  return []
}

async function readActiveQuestionMetadata() {
  const rows = []
  let done = false
  for (let base = 0; base < MAX_ROWS && !done; base += PAGE_SIZE * BATCH_SIZE) {
    const pages = await Promise.all(Array.from({ length: BATCH_SIZE }, (_, index) => fetchPage(base + index * PAGE_SIZE)))
    for (const page of pages) {
      rows.push(...page)
      if (page.length < PAGE_SIZE) { done = true; break }
    }
  }
  return rows
}

function aggregateCounts(rows) {
  const aliasToCanonical = new Map()
  for (const [canonical, aliases] of Object.entries(DB_SUBJECT_ALIASES)) {
    for (const alias of aliases) aliasToCanonical.set(alias, canonical)
  }

  const subjects = {}
  for (const row of rows) {
    const canonical = aliasToCanonical.get(row.subject)
    if (!canonical) continue
    const subject = subjects[canonical] || (subjects[canonical] = { total: 0, topics: {} })
    const topic = String(row.topic || '') || 'বিবিধ'
    subject.total++
    subject.topics[topic] = (subject.topics[topic] || 0) + 1
  }
  return subjects
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const rows = await readActiveQuestionMetadata()
    const subjects = aggregateCounts(rows)
    response.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400')
    return response.status(200).json({
      source: 'supabase',
      updatedAt: new Date().toISOString(),
      refreshAfterSeconds: 21600,
      total: Object.values(subjects).reduce((sum, subject) => sum + subject.total, 0),
      subjects
    })
  } catch (error) {
    console.error(error)
    response.setHeader('Cache-Control', 'no-store')
    return response.status(502).json({ error: 'Question counts are temporarily unavailable' })
  }
}
