/* ============================================================================
   ১v১ লাইভ গেম মোড — core helpers
   ----------------------------------------------------------------------------
   Two players share one room code. Messages travel over two transports at
   once so the room works everywhere:

   1. Supabase Realtime broadcast (public channel, no database setup needed) —
      works across devices and networks.
   2. BroadcastChannel — works between tabs/windows of the same browser even
      when the Realtime socket is unavailable.

   Every message carries a `mid`; the receiving side drops duplicates, so the
   same packet arriving on both transports is applied exactly once.
   ========================================================================== */
import { supabase } from './lib/supabase.js'
import { dbSubjectsFor, dbTopicsFor, localPool, mixQuestions } from './data.js'

/* Room codes avoid 0/O and 1/I so they can be read out loud or typed easily. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const randomGameCode = (length = 4) =>
  Array.from({ length }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('')

export const normalizeGameCode = value =>
  String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/* ---------------------------------------------------------------------------
   Identity — the tab id keeps two tabs of the same browser as two players.
--------------------------------------------------------------------------- */
export function playerIdentity(user) {
  let id = ''
  try {
    id = sessionStorage.getItem('asp_game_tab_id') || ''
    if (!id) {
      id = 'p' + uid()
      sessionStorage.setItem('asp_game_tab_id', id)
    }
  } catch {
    id = 'p' + uid()
  }
  let stored = ''
  try { stored = localStorage.getItem('asp_game_name') || '' } catch {}
  const fromAccount = user?.user_metadata?.full_name || (user?.email ? String(user.email).split('@')[0] : '')
  return { id, name: stored || fromAccount || '' }
}

export function savePlayerName(name) {
  try { localStorage.setItem('asp_game_name', String(name || '').trim()) } catch {}
}

/* ---------------------------------------------------------------------------
   Room code carried in the share link (#game=CODE)
--------------------------------------------------------------------------- */
export function readGameCodeFromLocation() {
  if (typeof window === 'undefined') return ''
  const hash = String(window.location.hash || '').replace(/^#/, '')
  const hashMatch = hash.match(/^game[=/]([A-Za-z0-9]{3,8})$/)
  if (hashMatch) return normalizeGameCode(hashMatch[1])
  const queryCode = new URLSearchParams(window.location.search).get('game')
  return queryCode ? normalizeGameCode(queryCode) : ''
}

export function clearGameCodeFromLocation() {
  if (typeof window === 'undefined') return
  if (!window.location.hash) return
  try { window.history.replaceState(null, '', window.location.pathname + window.location.search) } catch {}
}

export const gameShareLink = code => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${window.location.pathname}#game=${normalizeGameCode(code)}`
}

/* ---------------------------------------------------------------------------
   Transport
--------------------------------------------------------------------------- */
export function createMatchTransport({ code, playerId, onMessage, onStatus }) {
  const seen = new Set()
  const pending = []
  let closed = false
  let joined = false
  let local = null
  try {
    if (typeof window !== 'undefined' && typeof window.BroadcastChannel === 'function') {
      local = new BroadcastChannel(`asp-match-${code}`)
    }
  } catch { local = null }

  const channel = supabase.channel(`asp-match-${code}`, {
    config: { broadcast: { self: false } }
  })

  const deliver = raw => {
    if (!raw || closed || raw.from === playerId) return
    if (raw.mid) {
      if (seen.has(raw.mid)) return
      seen.add(raw.mid)
      if (seen.size > 1500) seen.clear()
    }
    onMessage?.(raw)
  }

  if (local) local.onmessage = event => deliver(event.data)

  channel.on('broadcast', { event: 'msg' }, ({ payload }) => deliver(payload))
  channel.subscribe(status => {
    if (status === 'SUBSCRIBED') {
      joined = true
      while (pending.length) channel.send({ type: 'broadcast', event: 'msg', payload: pending.shift() })
      onStatus?.('online')
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      joined = false
      onStatus?.('offline')
    } else if (status === 'CLOSED') {
      joined = false
      onStatus?.('closed')
    }
  })

  const send = (kind, data = null) => {
    if (closed) return null
    const message = { mid: uid(), from: playerId, kind, data, ts: Date.now() }
    if (local) {
      try { local.postMessage(message) } catch {}
    }
    if (joined) channel.send({ type: 'broadcast', event: 'msg', payload: message })
    else pending.push(message)
    return message
  }

  return {
    send,
    get joined() { return joined },
    close() {
      if (closed) return
      closed = true
      try { local?.close() } catch {}
      supabase.removeChannel(channel)
    }
  }
}

/* ---------------------------------------------------------------------------
   Questions
--------------------------------------------------------------------------- */
const WIRE_FIELDS = [
  'id', 'question', 'options', 'answer', 'answer_index', 'explanation', 'explanation_bn',
  'subject', 'topic', 'sub_topic', 'post_name', 'created_at', 'passage', 'context',
  'image', 'image_url', 'difficulty'
]

export function toWireQuestion(question) {
  const out = {}
  WIRE_FIELDS.forEach(field => {
    const value = question?.[field]
    if (value === undefined || value === null || value === '') return
    out[field] = value
  })
  if (typeof out.explanation === 'string' && out.explanation.length > 1200) {
    out.explanation = `${out.explanation.slice(0, 1200)}…`
  }
  return out
}

export const correctIndexOf = question => {
  if (!question) return -1
  const options = Array.isArray(question.options) ? question.options : []
  const byValue = options.indexOf(question.answer)
  if (byValue >= 0) return byValue
  const index = Number(question.answer_index)
  return Number.isInteger(index) && index >= 0 && index < options.length ? index : -1
}

export const isPlayableQuestion = question =>
  typeof question?.question === 'string' && question.question.trim().length > 0
  && Array.isArray(question.options) && question.options.length >= 2
  && correctIndexOf(question) >= 0

const uniqueQuestions = rows => {
  const map = new Map()
  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const key = `${row?.id ?? ''}::${row?.created_at || row?.question || ''}`
    if (!map.has(key)) map.set(key, row)
  })
  return [...map.values()]
}

/* The host builds the paper once and shares the exact same rows with the guest. */
export async function fetchGameQuestions({ subjects = [], topics = [], count = 10, postNames = [] }) {
  const limit = Math.min(100, Math.max(2, Number(count) || 10))
  const dbSubjects = postNames.length ? [] : dbSubjectsFor(subjects)
  const selectedTopics = topics?.length ? dbTopicsFor(topics) : []

  const applyFilters = query => {
    let filtered = query.eq('is_active', true)
    if (postNames.length) filtered = filtered.in('post_name', postNames)
    else if (dbSubjects.length) filtered = filtered.in('subject', dbSubjects)
    if (selectedTopics.length) filtered = filtered.in('topic', selectedTopics)
    return filtered
  }

  try {
    const { count, error: countError } = await applyFilters(
      supabase.from('mcq_questions_job').select('id', { count: 'exact', head: true })
    )
    if (countError) throw countError
    const total = Number(count) || 0
    if (total > 0) {
      const windowSize = Math.min(total, Math.max(limit * 8, 150))
      const maxOffset = Math.max(0, total - windowSize)
      const offset = maxOffset ? Math.floor(Math.random() * (maxOffset + 1)) : 0
      const { data, error } = await applyFilters(
        supabase.from('mcq_questions_job').select('*')
      )
        // `id` repeats inside this table, so the composite order keeps range
        // pagination stable while we pull one bounded random window.
        .order('id', { ascending: true })
        .order('created_at', { ascending: true })
        .range(offset, offset + windowSize - 1)
      if (error) throw error
      const playable = uniqueQuestions(data || []).filter(isPlayableQuestion)
      const picked = mixQuestions(playable, limit)
      if (picked.length >= Math.min(limit, 2)) return picked
    }
  } catch (error) {
    console.warn('Game mode question fetch failed, using bundled pool:', error?.message || error)
  }

  const fallbackRows = uniqueQuestions([
    ...(subjects || []).flatMap(subject => localPool(subject)),
    ...localPool('বাংলা')
  ]).filter(isPlayableQuestion)
  return mixQuestions(fallbackRows, limit)
}

/* Keeps a broadcast packet comfortably small (question texts can be long). */
export function chunkQuestions(questions, maxChars = 18000) {
  const chunks = []
  let current = []
  let size = 0
  ;(questions || []).forEach(question => {
    const row = toWireQuestion(question)
    const rowSize = JSON.stringify(row).length + 1
    if (current.length && size + rowSize > maxChars) {
      chunks.push(current)
      current = []
      size = 0
    }
    current.push(row)
    size += rowSize
  })
  if (current.length) chunks.push(current)
  return chunks
}

/* ---------------------------------------------------------------------------
   Scoring
--------------------------------------------------------------------------- */
export function gameScore(questions, answers) {
  let ok = 0, bad = 0, skip = 0
  ;(questions || []).forEach((question, index) => {
    const choice = answers?.[index]
    if (choice === null || choice === undefined || choice === '') { skip++; return }
    if (Number(choice) === correctIndexOf(question)) ok++
    else bad++
  })
  const total = (questions || []).length || 1
  return { ok, bad, skip, score: Math.round((ok / total) * 100) }
}

/* ---------------------------------------------------------------------------
   Local match record (wins / losses shown in the lobby)
--------------------------------------------------------------------------- */
const GAME_RECORD_KEY = 'asp_game_record_v1'

export function readGameRecord() {
  try {
    const value = JSON.parse(localStorage.getItem(GAME_RECORD_KEY) || '{}')
    return { wins: Number(value.wins) || 0, losses: Number(value.losses) || 0, draws: Number(value.draws) || 0, played: Number(value.played) || 0 }
  } catch {
    return { wins: 0, losses: 0, draws: 0, played: 0 }
  }
}

export function recordGameResult(outcome) {
  const current = readGameRecord()
  const next = {
    wins: current.wins + (outcome === 'win' ? 1 : 0),
    losses: current.losses + (outcome === 'loss' ? 1 : 0),
    draws: current.draws + (outcome === 'draw' ? 1 : 0),
    played: current.played + 1
  }
  try { localStorage.setItem(GAME_RECORD_KEY, JSON.stringify(next)) } catch {}
  return next
}
