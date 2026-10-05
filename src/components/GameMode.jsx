/* ============================================================================
   ১v১ লাইভ গেম মোড
   ----------------------------------------------------------------------------
   • হোস্ট একটি রুম কোড তৈরি করে, বন্ধু কোড/লিংক দিয়ে জয়েন করে।
   • দুজন একই প্রশ্ন পায় — প্রশ্নও একসাথে, উত্তরও একসাথে।
   • লাইভ দেখা যায় প্রতিপক্ষ প্রস্তুত কিনা, কোন প্রশ্নে আছে, কতগুলো উত্তর দিয়েছে।
   দুটি মোড: 'প্রশ্নে প্রশ্নে' (একই প্রশ্ন, দুজনেই দিলে পরের প্রশ্ন) ও
   'পুরো পেপার' (একই সেট, একসাথে সময় শেষ)।
   ========================================================================== */
import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { BN, CAT_SUBJECTS, TOPICS, dbTopicsFor } from '../data.js'
import {
  chunkQuestions, correctIndexOf, createMatchTransport, fetchGameQuestions, gameScore,
  gameShareLink, normalizeGameCode, playerIdentity, randomGameCode, readGameCodeFromLocation,
  readGameRecord, recordGameResult, savePlayerName
} from '../game-mode.js'

const Md = ({ s }) => <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{String(s || '')}</Markdown>
const OPTION_KEYS = 'কখগঘঙচছজ'

const SYNC_MODES = [
  { id: 'step', label: 'প্রশ্নে প্রশ্নে', sub: 'একই প্রশ্ন—দুজনেই উত্তর দিলে পরের প্রশ্নে যাবে' },
  { id: 'paper', label: 'পুরো পেপার', sub: 'একই প্রশ্নের সেট—নিজের গতিতে, সময় একসাথে শেষ' }
]
const MODE_COUNTS = { step: [5, 10, 15, 25], paper: [10, 25, 50] }
const MODE_TIMES = { step: [15, 20, 30, 45], paper: [10, 20, 30, 45] }
const DEFAULT_CONFIG = {
  category: 'bcs',
  subjects: ['বাংলা', 'English'],
  topics: [],
  count: 10,
  stepSeconds: 20,
  minutes: 20,
  syncMode: 'step'
}
const REACTIONS = ['👋', '👍', '🔥', '😮']
const PEER_STALE_MS = 13000
const PEER_DROP_MS = 60000
const REVEAL_MS = 2300

const padAnswers = (list, length) => {
  const next = Array.isArray(list) ? [...list] : []
  while (next.length < length) next.push(null)
  return next.slice(0, Math.max(length, next.length))
}
const mmss = seconds => {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

export function GameMode({ user, questionCounts, setToastMsg, go }) {
  const [identity] = useState(() => playerIdentity(user))
  const [name, setName] = useState(() => identity.name || '')
  const [joinInput, setJoinInput] = useState(() => readGameCodeFromLocation() || '')
  const [code, setCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [phase, setPhase] = useState('home')
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [qs, setQs] = useState([])
  const [peers, setPeers] = useState({})
  const [primaryPeerId, setPrimaryPeerId] = useState(null)
  const [startsAt, setStartsAt] = useState(0)
  const [endsAt, setEndsAt] = useState(0)
  const [qi, setQi] = useState(0)
  const [stepDeadline, setStepDeadline] = useState(0)
  const [reveal, setReveal] = useState(null)
  const [revealUntil, setRevealUntil] = useState(0)
  const [myAns, setMyAns] = useState([])
  const [locked, setLocked] = useState({})
  const [mySubmit, setMySubmit] = useState(null)
  const [peerSubmit, setPeerSubmit] = useState(null)
  const [myReady, setMyReady] = useState(false)
  const [transport, setTransport] = useState('idle')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [reactions, setReactions] = useState([])
  const [tick, setTick] = useState(() => Date.now())
  const [record, setRecord] = useState(() => readGameRecord())
  const [topicSearch, setTopicSearch] = useState('')

  const transportRef = useRef(null)
  const revealTimerRef = useRef(null)
  const revealedRef = useRef(null)
  const stepSentRef = useRef(null)
  const recordedRef = useRef(false)
  const syncSentRef = useRef(false)
  const liveRef = useRef({})
  liveRef.current = {
    phase, isHost, code, config, qs, qi, stepDeadline, reveal, revealUntil, myAns, locked, peers,
    primaryPeerId, startsAt, endsAt, mySubmit, peerSubmit, myReady, name
  }

  const availableTopics = useMemo(
    () => [...new Set((config.subjects || []).flatMap(subject => TOPICS[subject] || []))],
    [config.subjects]
  )
  const visibleTopics = useMemo(() => {
    const needle = topicSearch.trim().toLocaleLowerCase()
    if (!needle) return availableTopics
    return availableTopics.filter(topic => topic.toLocaleLowerCase().includes(needle))
  }, [availableTopics, topicSearch])

  const peer = primaryPeerId ? peers[primaryPeerId] : null
  const peerOnline = !!peer && Date.now() - Number(peer.lastSeen || 0) < PEER_STALE_MS
  const total = qs.length
  const correctIndex = total ? correctIndexOf(qs[qi]) : -1
  const showReveal = !!reveal && reveal.qi === qi
  const peerAnswers = useMemo(() => {
    if (!peer || !total) return []
    return qs.map((_, index) => peer.picks?.[index] ?? null)
  }, [peer, qs, total])

  const mySummary = useMemo(() => (total ? gameScore(qs, padAnswers(myAns, total)) : { ok: 0, bad: 0, skip: 0, score: 0 }), [qs, myAns, total])
  const peerSummary = useMemo(() => {
    if (peerSubmit) return peerSubmit
    if (!peer || !total) return null
    const answered = Object.keys(peer.picks || {}).length
    if (!answered) return null
    return gameScore(qs, padAnswers(peerAnswers, total))
  }, [peerSubmit, peer, qs, peerAnswers, total])
  const winner = mySummary && peerSummary
    ? mySummary.score > peerSummary.score ? 'win' : mySummary.score < peerSummary.score ? 'loss' : 'draw'
    : null

  const stepLeft = stepDeadline ? Math.max(0, Math.ceil((stepDeadline - tick) / 1000)) : 0
  const paperLeft = endsAt ? Math.max(0, Math.ceil((endsAt - tick) / 1000)) : 0
  const countdownLeft = startsAt ? Math.max(0, Math.ceil((startsAt - tick) / 1000)) : 0

  /* ---------------------------------------------------------------- helpers */
  const send = (kind, data = null) => transportRef.current?.send(kind, data)

  const teammateLabel = peer?.name ? peer.name : 'প্রতিপক্ষ'

  const visibleName = () => (String(name || '').trim() || (user?.user_metadata?.full_name || 'আপনি'))

  const myPayload = () => ({
    name: visibleName(),
    ready: liveRef.current.myReady,
    qi: liveRef.current.qi,
    answered: padAnswers(liveRef.current.myAns, liveRef.current.qs.length).filter(value => value !== null && value !== '').length,
    submitted: !!liveRef.current.mySubmit,
    score: liveRef.current.mySubmit?.score ?? null
  })

  /* --------------------------------------------------------- message handling */
  const handleMessage = message => {
    const { kind, data, from } = message
    if (!kind || !from) return
    const state = liveRef.current
    const touchPeer = patch => setPeers(previous => {
      const known = previous[from] || { id: from, picks: {}, joinedAt: Date.now() }
      return { ...previous, [from]: { ...known, id: from, lastSeen: Date.now(), ...patch } }
    })
    if (!state.primaryPeerId) setPrimaryPeerId(from)

    switch (kind) {
      case 'hello': {
        // Host announces the room. Guests adopt the configuration.
        if (state.isHost || !data) return
        if (data.config) setConfig(current => ({ ...current, ...data.config }))
        touchPeer({ name: data.name || '', ready: !!data.ready, isHost: true })
        send('beat', myPayload())
        if (!syncSentRef.current && !state.qs.length) {
          syncSentRef.current = true
          send('sync', {})
        }
        break
      }
      case 'sync': {
        if (!state.isHost) return
        send('hello', { config: state.config, name: visibleName(), ready: state.myReady })
        const live = state.qs
        if (live.length) {
          const chunks = chunkQuestions(live)
          chunks.forEach((chunk, index) => send('q', { index, total: chunks.length, chunk }))
          if (state.phase === 'play' || state.phase === 'countdown' || state.phase === 'result') {
            send('go', {
              startsAt: state.startsAt,
              endsAt: state.endsAt,
              syncMode: state.config.syncMode,
              count: live.length,
              config: state.config,
              resume: true,
              qi: state.qi,
              deadline: state.stepDeadline
            })
          }
        }
        break
      }
      case 'q': {
        if (!data?.chunk?.length) return
        setQs(previous => {
          const merged = [...previous]
          const known = new Set(merged.map(row => `${row.id ?? ''}::${row.created_at || row.question || ''}`))
          data.chunk.forEach(row => {
            const key = `${row.id ?? ''}::${row.created_at || row.question || ''}`
            if (known.has(key)) return
            known.add(key)
            merged.push(row)
          })
          return merged
        })
        break
      }
      case 'go': {
        if (state.isHost || !data) return
        if (data.config) setConfig(current => ({ ...current, ...data.config }))
        setStartsAt(Number(data.startsAt) || Date.now() + 3000)
        setEndsAt(Number(data.endsAt) || 0)
        setQi(Number(data.qi) || 0)
        setStepDeadline(Number(data.deadline) || 0)
        stepSentRef.current = null
        setPhase(previous => (previous === 'result' ? previous : 'countdown'))
        break
      }
      case 'step': {
        if (state.isHost || !data) return
        const next = Number(data.qi)
        if (!Number.isInteger(next)) return
        if (next < state.qi) return
        setReveal(null)
        setQi(next)
        setStepDeadline(Number(data.deadline) || 0)
        break
      }
      case 'reveal': {
        if (state.isHost || !data) return
        if (Number(data.qi) !== state.qi) return
        setReveal({ qi: Number(data.qi), picks: data.picks || {} })
        setRevealUntil(Date.now() + REVEAL_MS + 1400)
        break
      }
      case 'pick': {
        if (!data) return
        const index = Number(data.qi)
        if (!Number.isInteger(index) || index < 0) return
        setPeers(previous => {
          const known = previous[from] || { id: from, picks: {}, joinedAt: Date.now() }
          return {
            ...previous,
            [from]: { ...known, id: from, lastSeen: Date.now(), picks: { ...(known.picks || {}), [index]: data.choice ?? null } }
          }
        })
        if (!state.primaryPeerId) setPrimaryPeerId(from)
        break
      }
      case 'ready': {
        touchPeer({ ready: !!data?.ready })
        break
      }
      case 'beat': {
        if (!data) return
        touchPeer({
          name: data.name || '',
          ready: !!data.ready,
          qi: Number(data.qi) || 0,
          answered: Number(data.answered) || 0,
          submitted: !!data.submitted,
          score: data.score ?? null
        })
        break
      }
      case 'finish': {
        if (!data) return
        touchPeer({ submitted: true, name: data.name || '', score: data.score })
        setPeerSubmit({ ...data, answers: padAnswers(data.answers, state.qs.length) })
        break
      }
      case 'react': {
        const id = `${from}-${Date.now()}`
        const label = state.peers[from]?.name || teammateLabel
        setReactions(current => [...current.slice(-4), { id, emoji: data?.emoji || '👋', label }])
        window.setTimeout(() => setReactions(current => current.filter(item => item.id !== id)), 2600)
        break
      }
      case 'again': {
        resetForNewRound()
        setPhase('lobby')
        setNote('হোস্ট নতুন ম্যাচ শুরু করছে—আবার প্রস্তুত হন')
        break
      }
      case 'bye': {
        touchPeer({ left: true, ready: false })
        setNote('প্রতিপক্ষ রুম ছেড়ে গেছে')
        break
      }
      default:
        break
    }
  }

  const handleMessageRef = useRef(handleMessage)
  handleMessageRef.current = handleMessage

  /* ------------------------------------------------------------- room lifecycle */
  useEffect(() => {
    if (!code) return
    const active = createMatchTransport({
      code,
      playerId: identity.id,
      onMessage: message => handleMessageRef.current(message),
      onStatus: status => {
        setTransport(status)
        if (status === 'online') {
          // Re-announce after a reconnect so a late join or a dropped packet
          // never leaves the room silently out of sync.
          if (liveRef.current.isHost) {
            send('hello', { config: liveRef.current.config, name: visibleName(), ready: liveRef.current.myReady })
          } else {
            send('beat', myPayload())
            if (!liveRef.current.qs.length) { syncSentRef.current = true; send('sync', {}) }
          }
        }
      }
    })
    transportRef.current = active
    if (isHost) {
      send('hello', { config: liveRef.current.config, name: visibleName(), ready: false })
    } else {
      send('beat', myPayload())
      send('sync', {})
    }
    return () => {
      // Leaving the page (or the room) tells the opponent immediately instead
      // of letting them wait for the heartbeat to go stale.
      active.send('bye', {})
      transportRef.current = null
      active.close()
      setTransport('idle')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, identity.id, isHost])

  // Heartbeat: keeps the opponent's readiness/progress live on both screens.
  useEffect(() => {
    if (!code) return
    const beat = () => transportRef.current?.send('beat', myPayload())
    beat()
    const timer = window.setInterval(beat, 2600)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, name, myReady, qi, myAns.length, mySubmit])

  // Clock used for countdowns and the "opponent online" check.
  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 400)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPeers(previous => {
        let changed = false
        const next = { ...previous }
        Object.values(previous).forEach(item => {
          const age = Date.now() - Number(item.lastSeen || 0)
          const offline = age > PEER_STALE_MS
          if (item.offline !== offline) { next[item.id] = { ...item, offline }; changed = true }
          if (age > PEER_DROP_MS) { delete next[item.id]; changed = true }
        })
        return changed ? next : previous
      })
    }, 3000)
    return () => window.clearInterval(timer)
  }, [])

  // Countdown → play
  useEffect(() => {
    if (phase !== 'countdown' || !startsAt) return
    if (tick >= startsAt) setPhase('play')
  }, [phase, startsAt, tick])

  // Keep the answer sheet the same length as the paper.
  useEffect(() => {
    if (!qs.length) return
    setMyAns(previous => (previous.length === qs.length ? previous : padAnswers(previous, qs.length)))
  }, [qs.length])

  /* ------------------------------------------------------- step-mode host clock */
  useEffect(() => {
    if (!isHost || phase !== 'play' || config.syncMode !== 'step' || !qs.length) return
    if (stepSentRef.current === qi) return
    stepSentRef.current = qi
    const deadline = Date.now() + Math.max(5, Number(config.stepSeconds) || 20) * 1000
    setStepDeadline(deadline)
    send('step', { qi, deadline })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, phase, config.syncMode, config.stepSeconds, qi, qs.length])

  // Host decides when a question is revealed and when both move on.
  useEffect(() => {
    if (!isHost || phase !== 'play' || config.syncMode !== 'step' || !qs.length) return
    const timer = window.setInterval(() => {
      const state = liveRef.current
      if (state.phase !== 'play' || state.reveal) return
      const current = state.qi
      if (revealedRef.current === current) return
      const other = state.primaryPeerId ? state.peers[state.primaryPeerId] : null
      const mine = state.locked[current] === true
      const theirs = other?.picks && other.picks[current] !== undefined
      const expired = state.stepDeadline > 0 && Date.now() >= state.stepDeadline
      if (!expired && !(mine && theirs)) return
      revealedRef.current = current
      const picks = { [identity.id]: state.myAns[current] ?? null }
      if (state.primaryPeerId) picks[state.primaryPeerId] = other?.picks?.[current] ?? null
      setLocked(previous => ({ ...previous, [current]: true }))
      setReveal({ qi: current, picks })
      setRevealUntil(Date.now() + REVEAL_MS)
      send('reveal', { qi: current, picks })
      const next = current + 1
      revealTimerRef.current = window.setTimeout(() => {
        setReveal(null)
        if (next < liveRef.current.qs.length) {
          setQi(next)
        } else {
          finishStep()
        }
      }, REVEAL_MS)
    }, 320)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, phase, config.syncMode, config.stepSeconds, qs.length, identity.id])

  // Guest mirror: lock my answer when the shared question timer runs out, and
  // recover on my own if the host's "next question" packet never arrives.
  useEffect(() => {
    if (isHost || phase !== 'play' || config.syncMode !== 'step' || !qs.length) return
    const timer = window.setInterval(() => {
      const state = liveRef.current
      if (state.phase !== 'play') return
      if (state.reveal) {
        if (state.revealUntil && Date.now() > state.revealUntil) {
          const next = state.reveal.qi + 1
          setReveal(null)
          if (next < state.qs.length) {
            setQi(next)
            setStepDeadline(Date.now() + Math.max(5, Number(state.config.stepSeconds) || 20) * 1000)
          } else finishStep()
        }
        return
      }
      if (state.locked[state.qi]) return
      if (!state.stepDeadline || Date.now() < state.stepDeadline) return
      setLocked(previous => ({ ...previous, [state.qi]: true }))
      send('pick', { qi: state.qi, choice: state.myAns[state.qi] ?? null })
    }, 320)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, phase, config.syncMode, qs.length])

  // Paper mode: the shared clock ends the paper for both players.
  useEffect(() => {
    if (phase !== 'play' || config.syncMode !== 'paper' || !endsAt || !qs.length) return
    if (tick < endsAt + 1200) return
    if (mySubmit) return
    submitPaper(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, config.syncMode, endsAt, tick, mySubmit, qs.length])

  // Winner is recorded once per match.
  useEffect(() => {
    if (phase !== 'result' || !winner || recordedRef.current) return
    recordedRef.current = true
    setRecord(recordGameResult(winner))
    if (winner === 'win') setToastMsg?.('🏆 আপনি ম্যাচ জিতেছেন!')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, winner])

  useEffect(() => () => { if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current) }, [])

  /* ------------------------------------------------------------------ actions */
  function resetForNewRound() {
    revealedRef.current = null
    stepSentRef.current = null
    recordedRef.current = false
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current)
    setQs([])
    setMyAns([])
    setLocked({})
    setQi(0)
    setReveal(null)
    setRevealUntil(0)
    setStepDeadline(0)
    setStartsAt(0)
    setEndsAt(0)
    setMySubmit(null)
    setPeerSubmit(null)
    setMyReady(false)
    setPeers(previous => {
      const next = {}
      Object.values(previous).forEach(item => { next[item.id] = { ...item, picks: {}, ready: false, submitted: false, score: null } })
      return next
    })
  }

  function createRoom() {
    const trimmed = String(name).trim()
    if (!trimmed) { setNote('আপনার নাম লিখুন বা লগইন করুন'); return }
    savePlayerName(trimmed)
    const roomCode = randomGameCode(4)
    resetForNewRound()
    setIsHost(true)
    setCode(roomCode)
    setPhase('lobby')
    setTransport('connecting')
    setNote('রুম তৈরি হয়েছে—কোড বা লিংক বন্ধুকে পাঠান')
    if (typeof window !== 'undefined') {
      try { window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#game=${roomCode}`) } catch {}
    }
  }

  function joinRoom(explicitCode) {
    const trimmed = String(name).trim()
    if (!trimmed) { setNote('আপনার নাম লিখুন বা লগইন করুন'); return }
    const roomCode = normalizeGameCode(explicitCode ?? joinInput)
    if (roomCode.length < 3) { setNote('রুম কোড লিখুন'); return }
    savePlayerName(trimmed)
    resetForNewRound()
    setIsHost(false)
    setJoinInput(roomCode)
    setCode(roomCode)
    setPhase('lobby')
    setTransport('connecting')
    setNote('রুমে ঢোকার চেষ্টা চলছে…')
    if (typeof window !== 'undefined') {
      try { window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#game=${roomCode}`) } catch {}
    }
  }

  function leaveRoom() {
    send('bye', {})
    if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current)
    setCode('')
    setIsHost(false)
    setPhase('home')
    setTransport('idle')
    setNote('')
    resetForNewRound()
    if (typeof window !== 'undefined' && window.location.hash) {
      try { window.history.replaceState(null, '', window.location.pathname + window.location.search) } catch {}
    }
  }

  function toggleReady() {
    const next = !myReady
    setMyReady(next)
    send('ready', { ready: next })
    send('beat', { ...myPayload(), ready: next })
    if (next) setNote('আপনি প্রস্তুত—প্রতিপক্ষের জন্য অপেক্ষা করুন')
    else setNote('')
  }

  function updateConfig(patch) {
    setConfig(current => {
      const next = { ...current, ...patch }
      send('hello', { config: next, name: visibleName(), ready: myReady })
      return next
    })
  }

  function switchMode(mode) {
    const counts = MODE_COUNTS[mode] || MODE_COUNTS.step
    const times = MODE_TIMES[mode] || MODE_TIMES.step
    updateConfig({
      syncMode: mode,
      count: counts.includes(config.count) ? config.count : counts[1] || counts[0],
      ...(mode === 'step'
        ? { stepSeconds: times.includes(config.stepSeconds) ? config.stepSeconds : times[1] }
        : { minutes: times.includes(config.minutes) ? config.minutes : times[1] })
    })
  }

  function toggleSubject(subject) {
    const current = config.subjects || []
    const next = current.includes(subject) ? current.filter(item => item !== subject) : [...current, subject]
    if (!next.length) return
    const allowed = new Set(next.flatMap(item => TOPICS[item] || []))
    updateConfig({ subjects: next, topics: (config.topics || []).filter(topic => allowed.has(topic)) })
  }

  function toggleTopic(topic) {
    const current = config.topics || []
    updateConfig({ topics: current.includes(topic) ? current.filter(item => item !== topic) : [...current, topic] })
  }

  function topicCount(topic) {
    const dbTopic = dbTopicsFor([topic])[0]
    if (!dbTopic) return 0
    return (config.subjects || []).reduce((sum, subject) => sum + (questionCounts?.subjects?.[subject]?.topics?.[dbTopic] || 0), 0)
  }

  async function startMatch() {
    if (busy) return
    if (!peer) { setNote('বন্ধু জয়েন করলে ম্যাচ শুরু করা যাবে'); return }
    if (!peerOnline) { setNote('প্রতিপক্ষের সংযোগ নেই—একটু অপেক্ষা করুন'); return }
    if (!peer.ready) { setNote('প্রতিপক্ষ এখনো প্রস্তুত হয়নি'); return }
    setBusy(true)
    setNote('প্রশ্ন সাজানো হচ্ছে…')
    const questions = await fetchGameQuestions({
      subjects: config.subjects,
      topics: config.topics,
      count: config.count
    })
    setBusy(false)
    if (questions.length < 2) {
      setNote('প্রশ্ন পাওয়া যায়নি—বিষয় বা টপিক বদলে আবার চেষ্টা করুন')
      return
    }
    const chunks = chunkQuestions(questions)
    chunks.forEach((chunk, index) => send('q', { index, total: chunks.length, chunk }))
    const start = Date.now() + 4200
    const lengthSeconds = config.syncMode === 'paper'
      ? Math.max(2, Number(config.minutes) || 20) * 60
      : Math.max(5, Number(config.stepSeconds) || 20) * questions.length + 10
    const end = start + lengthSeconds * 1000
    revealedRef.current = null
    stepSentRef.current = null
    recordedRef.current = false
    setQs(questions)
    setMyAns(Array(questions.length).fill(null))
    setLocked({})
    setQi(0)
    setReveal(null)
    setRevealUntil(0)
    setStepDeadline(0)
    setMySubmit(null)
    setPeerSubmit(null)
    setStartsAt(start)
    setEndsAt(end)
    setPhase('countdown')
    setNote('')
    send('go', {
      startsAt: start,
      endsAt: end,
      syncMode: config.syncMode,
      count: questions.length,
      config,
      qi: 0,
      deadline: 0
    })
  }

  function chooseOption(index, questionIndex = null) {
    if (phase !== 'play') return
    const at = config.syncMode === 'step' || questionIndex === null ? qi : questionIndex
    if (config.syncMode === 'step') {
      if (locked[at]) return
      if (showReveal) return
      setMyAns(previous => {
        const next = padAnswers(previous, qs.length)
        next[at] = index
        return next
      })
      return
    }
    setMyAns(previous => {
      const next = padAnswers(previous, qs.length)
      next[at] = next[at] === index ? null : index
      return next
    })
  }

  function confirmStepAnswer() {
    if (phase !== 'play' || config.syncMode !== 'step' || locked[qi]) return
    const choice = myAns[qi] ?? null
    setLocked(previous => ({ ...previous, [qi]: true }))
    send('pick', { qi, choice })
  }

  function finishStep() {
    const state = liveRef.current
    const answers = padAnswers(state.myAns, state.qs.length)
    const summary = gameScore(state.qs, answers)
    setMySubmit({ ...summary, answers, at: Date.now() })
    send('finish', { ...summary, answers, name: visibleName() })
    setReveal(null)
    setPhase('result')
  }

  function submitPaper(auto = false) {
    const state = liveRef.current
    if (state.mySubmit) return
    const answers = padAnswers(state.myAns, state.qs.length)
    const summary = gameScore(state.qs, answers)
    setMySubmit({ ...summary, answers, auto, at: Date.now() })
    send('finish', { ...summary, answers, name: visibleName() })
    setPhase('result')
    if (auto) setNote('সময় শেষ—উত্তরপত্র স্বয়ংক্রিয়ভাবে জমা হয়েছে')
  }

  function requestRematch() {
    if (!isHost) { setNote('হোস্ট নতুন ম্যাচ শুরু করলে আপনি আবার খেলতে পারবেন'); return }
    resetForNewRound()
    setPhase('lobby')
    setNote('আবার খেলার জন্য তৈরি—দুজনেই আবার প্রস্তুত হন')
    send('again', {})
  }

  function react(emoji) {
    send('react', { emoji })
    const id = `me-${Date.now()}`
    setReactions(current => [...current.slice(-4), { id, emoji, label: 'আপনি' }])
    window.setTimeout(() => setReactions(current => current.filter(item => item.id !== id)), 2600)
  }

  /* -------------------------------------------------------------------- views */
  const transportBadge = transport === 'online'
    ? { cls: 'ok', text: 'লাইভ সংযোগ চালু' }
    : transport === 'connecting'
      ? { cls: 'wait', text: 'সংযোগ হচ্ছে…' }
      : transport === 'offline'
        ? { cls: 'warn', text: 'রিমোট সংযোগ বন্ধ — একই ব্রাউজারের অন্য ট্যাবে খেলা যাবে' }
        : { cls: 'idle', text: 'রুম নেই' }

  const renderHome = () => (
    <div className="gm-home">
      <div className="panel gm-card">
        <div className="gm-field">
          <span className="lbl">আপনার নাম (স্কোরবোর্ডে দেখা যাবে)</span>
          <input
            className="gm-input"
            value={name}
            maxLength={24}
            placeholder={user ? 'নাম লিখুন' : 'নাম লিখুন বা লগইন করুন'}
            onChange={event => setName(event.target.value)}
          />
        </div>
        <div className="gm-home-grid">
          <div className="gm-home-box">
            <b>রুম তৈরি করুন</b>
            <small>আপনি প্রশ্ন, বিষয় ও সময় ঠিক করবেন—কোড পেয়ে বন্ধু ঢুকবে।</small>
            <button className="btn primary" onClick={createRoom}>🎮 রুম তৈরি করুন</button>
          </div>
          <div className="gm-home-box">
            <b>কোড দিয়ে জয়েন করুন</b>
            <small>বন্ধুর পাঠানো ৪ অক্ষরের কোড লিখুন।</small>
            <div className="gm-join-row">
              <input
                className="gm-input gm-code-input"
                value={joinInput}
                maxLength={6}
                placeholder="ABCD"
                onChange={event => setJoinInput(normalizeGameCode(event.target.value))}
                onKeyDown={event => { if (event.key === 'Enter') joinRoom() }}
              />
              <button className="btn" onClick={() => joinRoom()}>জয়েন</button>
            </div>
          </div>
        </div>
        <div className="gm-record">
          <span>🏆 আপনার ১v১ রেকর্ড</span>
          <b>{BN(record.wins)} জয় • {BN(record.losses)} হার • {BN(record.draws)} ড্র</b>
          <small>{BN(record.played)}টি ম্যাচ খেলা হয়েছে</small>
        </div>
      </div>
      <div className="panel gm-card gm-how">
        <h3>কীভাবে খেলা হয়</h3>
        <ol>
          <li>দুজনেই নিজের ডিভাইস থেকে এই পেজ খুলুন (লগইন ছাড়াও চলবে)।</li>
          <li>একজন <b>রুম তৈরি</b> করবে, কোড বা লিংক অন্যজনকে পাঠাবে।</li>
          <li>হোস্ট বিষয়/টপিক, প্রশ্নসংখ্যা আর সময় ঠিক করবে, দুজনেই <b>প্রস্তুত</b> চাপবে।</li>
          <li>ম্যাচ শুরু হলে দুজন একই প্রশ্ন পাবে—প্রতিপক্ষ প্রস্তুত কিনা, কত দূর এগিয়েছে সব লাইভ দেখা যাবে।</li>
          <li>শেষে কে কত পেল, কোন প্রশ্নে কে কী দিল—পাশাপাশি তুলনা।</li>
        </ol>
        <p className="muted">একই ব্রাউজারে দুটি ট্যাব খুলেও খেলা যায়—একটি ট্যাবে রুম তৈরি করে অন্যটিতে কোড দিয়ে জয়েন করুন।</p>
      </div>
    </div>
  )

  const renderLobby = () => (
    <div className="gm-lobby">
      <div className="gm-room-bar">
        <div className="gm-room-code">
          <small>রুম কোড</small>
          <b>{code || '····'}</b>
        </div>
        <div className="gm-room-copy">
          <button className="btn sm" onClick={() => {
            const link = gameShareLink(code)
            try {
              if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link)
              setNote('লিংক কপি হয়েছে—বন্ধুকে পাঠান')
            } catch { setNote(link) }
          }}>🔗 লিংক কপি</button>
          <button className="btn sm ghost" onClick={() => {
            try {
              if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code)
              setNote('রুম কোড কপি হয়েছে')
            } catch { setNote(code) }
          }}>কোড কপি</button>
        </div>
        <div className={`gm-link ${transportBadge.cls}`}><i aria-hidden="true" />{transportBadge.text}</div>
      </div>

      <div className="gm-seat-grid">
        <div className="gm-seat you">
          <span className="gm-avatar">{visibleName().slice(0, 1)}</span>
          <div><b>{visibleName()} <i>• আপনি</i></b><small>{isHost ? 'হোস্ট' : 'জয়েন করেছেন'}</small></div>
          <span className={`gm-ready ${myReady ? 'on' : ''}`}>{myReady ? 'প্রস্তুত ✓' : 'প্রস্তুত নয়'}</span>
        </div>
        <div className={`gm-seat ${peer ? (peerOnline ? 'peer' : 'peer offline') : 'empty'}`}>
          <span className="gm-avatar">{peer?.name ? peer.name.slice(0, 1) : '?'}</span>
          <div>
            <b>{peer?.name || 'প্রতিপক্ষ এখনো আসেনি'}</b>
            <small>{!peer ? 'কোড শেয়ার করুন' : peerOnline ? (peer.submitted ? 'উত্তরপত্র জমা দিয়েছে' : `প্রশ্ন ${BN((Number(peer.qi) || 0) + 1)} • ${BN(Number(peer.answered) || 0)} উত্তর`) : 'সংযোগ নেই—অপেক্ষা করুন'}</small>
          </div>
          <span className={`gm-ready ${peer?.ready ? 'on' : ''}`}>{peer ? (peer.ready ? 'প্রস্তুত ✓' : 'প্রস্তুত নয়') : '—'}</span>
        </div>
      </div>

      <div className="gm-lobby-actions">
        <button className={`btn ${myReady ? 'ghost' : 'primary'}`} onClick={toggleReady}>
          {myReady ? 'প্রস্তুতি বাতিল' : 'আমি প্রস্তুত ✓'}
        </button>
        {isHost && <button className="btn primary" disabled={busy || !peer || !peerOnline || !peer.ready || !myReady} onClick={startMatch}>
          {busy ? 'প্রশ্ন সাজানো হচ্ছে…' : 'ম্যাচ শুরু করুন →'}
        </button>}
        {!isHost && <span className="gm-wait-note">
          {!peer ? 'হোস্টের জন্য অপেক্ষা…' : !peerOnline ? 'হোস্টের সংযোগ ফিরে আসছে…' : peer.ready ? 'হোস্ট ম্যাচ শুরু করলে আপনি প্রস্তুত থাকুন' : 'হোস্ট প্রস্তুতি নিচ্ছে…'}
        </span>}
      </div>

      <div className="panel gm-card">
        <div className="gm-card-head">
          <h3>ম্যাচ সেটআপ</h3>
          <span className="gm-mode-tag">{SYNC_MODES.find(mode => mode.id === config.syncMode)?.label}</span>
        </div>
        {isHost ? <>
          <div className="gm-field">
            <span className="lbl">কীভাবে খেলবেন?</span>
            <div className="chips">
              {SYNC_MODES.map(mode => <button key={mode.id} className={`chip ${config.syncMode === mode.id ? 'on' : ''}`} onClick={() => switchMode(mode.id)}>{mode.label}</button>)}
            </div>
            <small className="gm-hint">{SYNC_MODES.find(mode => mode.id === config.syncMode)?.sub}</small>
          </div>

          <div className="gm-field">
            <span className="lbl">ক্যাটাগরি</span>
            <div className="chips">
              <button className={`chip ${config.category === 'bcs' ? 'on' : ''}`} onClick={() => updateConfig({ category: 'bcs', subjects: ['বাংলা'], topics: [] })}>🎓 বিসিএস</button>
              <button className={`chip ${config.category === 'bank' ? 'on' : ''}`} onClick={() => updateConfig({ category: 'bank', subjects: ['গাণিতিক যুক্তি'], topics: [] })}>🏦 ব্যাংক</button>
            </div>
          </div>

          <div className="gm-field">
            <span className="lbl">বিষয়</span>
            <div className="chips">
              {(CAT_SUBJECTS[config.category] || []).map(subject => (
                <button key={subject} className={`chip ${config.subjects.includes(subject) ? 'on' : ''}`} onClick={() => toggleSubject(subject)}>{subject}</button>
              ))}
            </div>
          </div>

          <div className="gm-field">
            <span className="lbl">টপিক (ঐচ্ছিক)</span>
            <details className="gm-topics">
              <summary>
                <span>{(config.topics || []).length ? `${BN(config.topics.length)}টি টপিক নির্বাচিত` : 'সকল টপিক থেকে প্রশ্ন'}</span>
                <i aria-hidden="true">⌄</i>
              </summary>
              <div className="gm-topics-body">
                <input className="gm-input sm" value={topicSearch} placeholder="টপিক খুঁজুন…" onChange={event => setTopicSearch(event.target.value)} />
                <div className="gm-topic-chips">
                  {(config.topics || []).length > 0 && <button className="chip on" onClick={() => updateConfig({ topics: [] })}>সব মুছুন ×</button>}
                  {visibleTopics.map(topic => (
                    <button key={topic} className={`chip ${(config.topics || []).includes(topic) ? 'on' : ''}`} onClick={() => toggleTopic(topic)}>
                      {topic}<span className="cnt">{BN(topicCount(topic))}</span>
                    </button>
                  ))}
                  {!visibleTopics.length && <small className="gm-hint">কোনো টপিক পাওয়া যায়নি</small>}
                </div>
              </div>
            </details>
          </div>

          <div className="gm-field">
            <span className="lbl">প্রশ্নসংখ্যা</span>
            <div className="chips">
              {(MODE_COUNTS[config.syncMode] || MODE_COUNTS.step).map(number => (
                <button key={number} className={`chip ${config.count === number ? 'on' : ''}`} onClick={() => updateConfig({ count: number })}>{BN(number)}</button>
              ))}
            </div>
          </div>

          <div className="gm-field">
            <span className="lbl">{config.syncMode === 'step' ? 'প্রতি প্রশ্নে সময় (সেকেন্ড)' : 'মোট সময় (মিনিট)'}</span>
            <div className="chips">
              {(config.syncMode === 'step' ? MODE_TIMES.step : MODE_TIMES.paper).map(value => (
                <button
                  key={value}
                  className={`chip ${(config.syncMode === 'step' ? config.stepSeconds : config.minutes) === value ? 'on' : ''}`}
                  onClick={() => updateConfig(config.syncMode === 'step' ? { stepSeconds: value } : { minutes: value })}
                >{BN(value)}</button>
              ))}
            </div>
          </div>
        </> : <p className="muted">হোস্ট বিষয়, টপিক, প্রশ্নসংখ্যা ও সময় ঠিক করবে—আপনি শুধু <b>প্রস্তুত</b> চাপুন।</p>}

        <div className="gm-summary">
          <span>{(config.subjects || []).join(' • ') || 'বিষয় নেই'}</span>
          <span>{(config.topics || []).length ? `${BN(config.topics.length)} টপিক` : 'সব টপিক'}</span>
          <span>{BN(config.count)} প্রশ্ন</span>
          <span>{config.syncMode === 'step' ? `প্রতি প্রশ্নে ${BN(config.stepSeconds)} সেকেন্ড` : `${BN(config.minutes)} মিনিট`}</span>
        </div>
      </div>
    </div>
  )

  const renderCountdown = () => (
    <div className="gm-countdown">
      <span className="gm-countdown-label">দুজনেই প্রস্তুত হন</span>
      <b>{BN(Math.max(1, countdownLeft))}</b>
      <small>{config.syncMode === 'step' ? 'প্রতি প্রশ্নে একসাথে উত্তর—একই প্রশ্ন, একই সময়' : 'একই প্রশ্নের সেট—সময় শেষে উত্তরপত্র জমা'}</small>
      <div className="gm-vs">
        <span>{visibleName()}</span><i>বনাম</i><span>{teammateLabel}</span>
      </div>
    </div>
  )

  const renderStepPlay = () => {
    const question = qs[qi]
    if (!question) return <div className="panel gm-card"><p className="muted">প্রশ্ন লোড হচ্ছে…</p></div>
    const mine = myAns[qi]
    const isLocked = !!locked[qi]
    const peerChoice = peer?.picks?.[qi]
    const peerAnsweredNow = peerChoice !== undefined
    const percentage = config.stepSeconds ? Math.max(0, Math.min(100, (stepLeft / config.stepSeconds) * 100)) : 0
    return (
      <div className="gm-play" onContextMenu={event => event.preventDefault()} onCopy={event => event.preventDefault()} onCut={event => event.preventDefault()} onDragStart={event => event.preventDefault()}>
        <div className="gm-playtop">
          <span className="gm-qcount">প্রশ্ন <b>{BN(qi + 1)}</b>/{BN(total)}</span>
          <span className={`gm-clock ${stepLeft <= 5 ? 'warn' : ''}`}>⏱ {BN(stepLeft)} সে.</span>
          <span className="gm-score-mini">আপনি <b>{BN(mySummary.ok)}</b> • {teammateLabel} <b>{BN(peerSummary?.ok ?? 0)}</b></span>
        </div>
        <div className="gm-timerbar"><i style={{ width: `${percentage}%` }} /></div>
        <div className={`gm-turn ${isLocked ? 'done' : ''}`}>
          {isLocked
            ? peerAnsweredNow
              ? 'দুজনেই উত্তর দিয়েছেন—উত্তর দেখা হচ্ছে…'
              : 'আপনার উত্তর জমা হয়েছে ✓ — প্রতিপক্ষের অপেক্ষা'
            : peerAnsweredNow
              ? 'প্রতিপক্ষ উত্তর দিয়েছে ✓ — এখন আপনার পালা'
              : `${teammateLabel} উত্তর দিচ্ছে… আপনি ভালো করে পড়ে নিন`}
        </div>

        <div className="q-card gm-qcard">
          <div className="gm-qmeta">
            <span className="gm-qno">প্রশ্ন {BN(qi + 1)}</span>
            {question.topic && <span className="gm-topic">{question.topic}</span>}
          </div>
          <div className="qn"><Md s={question.question} /></div>
          {(question.options || []).map((option, index) => {
            const correct = showReveal && index === correctIndex
            const chosen = mine === index
            const peerChosen = showReveal && reveal?.picks?.[primaryPeerId] === index
            return (
              <button
                key={index}
                className={`qopt ${chosen ? 'sel' : ''} ${correct ? 'gm-correct' : ''} ${showReveal && chosen && !correct ? 'gm-wrong' : ''} ${peerChosen ? 'gm-peer-pick' : ''}`}
                onClick={() => chooseOption(index)}
              >
                <span className="k">{OPTION_KEYS[index] || index + 1}</span>
                <span>{option}</span>
                {showReveal && chosen && <b className={`gm-tag ${correct ? 'ok' : 'bad'}`}>{correct ? '✓ আপনি' : '✗ আপনি'}</b>}
                {showReveal && !chosen && peerChosen && <b className="gm-tag peer">{teammateLabel}</b>}
                {!showReveal && chosen && <b className="gm-tag me">আপনার পছন্দ</b>}
              </button>
            )
          })}
          {showReveal && <div className={`gm-reveal ${mine !== null && mine === correctIndex ? 'good' : 'bad'}`}>
            <b>{correctIndex >= 0 ? `সঠিক উত্তর: ${OPTION_KEYS[correctIndex] || correctIndex + 1}` : 'সঠিক উত্তর পাওয়া যায়নি'}</b>
            <span>{mine === null || mine === undefined ? 'আপনি সময়ে উত্তর দেননি' : mine === correctIndex ? 'আপনি ঠিক পেয়েছেন ✓' : 'আপনার উত্তরটি ভুল হয়েছে'} • {reveal?.picks?.[primaryPeerId] === null || reveal?.picks?.[primaryPeerId] === undefined ? `${teammateLabel} উত্তর দেয়নি` : reveal?.picks?.[primaryPeerId] === correctIndex ? `${teammateLabel} ঠিক পেয়েছে` : `${teammateLabel} ভুল করেছে`}</span>
          </div>}
          {showReveal && question.explanation && <details className="gm-expl"><summary>ব্যাখ্যা দেখুন</summary><div className="expl"><Md s={question.explanation} /></div></details>}
        </div>

        <div className="gm-playbar">
          <button className="btn ghost sm" onClick={() => react('👋')}>👋 সাড়া দিন</button>
          <button className={`btn ${isLocked ? 'ghost' : 'primary'}`} disabled={isLocked || mine === null || mine === undefined} onClick={confirmStepAnswer}>
            {isLocked ? 'উত্তর জমা হয়েছে ✓' : 'উত্তর নিশ্চিত করুন'}
          </button>
        </div>
      </div>
    )
  }

  const renderPaperPlay = () => {
    const myAnswered = padAnswers(myAns, total).filter(value => value !== null && value !== '').length
    const peerAnswered = peer ? (Object.values(peer.picks || {}).filter(value => value !== null && value !== '').length || (peer.answered || 0)) : 0
    return (
      <div className="gm-play" onContextMenu={event => event.preventDefault()} onCopy={event => event.preventDefault()} onCut={event => event.preventDefault()} onDragStart={event => event.preventDefault()}>
        <div className="gm-paper-bar">
          <span className={`gm-clock ${paperLeft <= 30 ? 'warn' : ''}`}>⏱ {mmss(paperLeft)}</span>
          <div className="gm-paper-progress">
            <span>আপনি <b>{BN(myAnswered)}/{BN(total)}</b></span>
            <div className="gm-bar"><i style={{ width: `${total ? Math.round((myAnswered / total) * 100) : 0}%` }} /></div>
          </div>
          <div className="gm-paper-progress peer">
            <span>{teammateLabel} <b>{BN(peerAnswered)}/{BN(total)}</b>{peerOnline ? '' : ' • অফলাইন'}</span>
            <div className="gm-bar peer"><i style={{ width: `${total ? Math.round((peerAnswered / total) * 100) : 0}%` }} /></div>
          </div>
          <button className="btn primary sm" onClick={() => submitPaper(false)}>সাবমিট</button>
        </div>
        {peer?.submitted
          ? <div className="gm-turn done">{teammateLabel} উত্তরপত্র জমা দিয়েছে ✓ — আপনারও সাবমিট করুন</div>
          : <p className="gm-hint center">দুজন একই প্রশ্ন পেয়েছেন — কে আগে শেষ করবেন, তা নিয়ে বাজি ধরে এগিয়ে যান। সময় শেষে উত্তরপত্র স্বয়ংক্রিয়ভাবে জমা হবে।</p>}
        {qs.map((question, index) => (
          <div className="q-card gm-qcard" key={index} style={{ scrollMarginTop: 120 }}>
            <div className="gm-qmeta">
              <span className="gm-qno">প্রশ্ন {BN(index + 1)}</span>
              {question.topic && <span className="gm-topic">{question.topic}</span>}
            </div>
            <div className="qn"><Md s={question.question} /></div>
            {(question.options || []).map((option, optionIndex) => (
              <button
                key={optionIndex}
                className={`qopt ${myAns[index] === optionIndex ? 'sel' : ''}`}
                onClick={() => chooseOption(optionIndex, index)}
              >
                <span className="k">{OPTION_KEYS[optionIndex] || optionIndex + 1}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const renderResult = () => {
    const peerName = peer?.name || 'প্রতিপক্ষ'
    const banner = !peerSummary
      ? { cls: 'wait', text: `${peerName} এখনো উত্তরপত্র জমা দেয়নি…` }
      : winner === 'win' ? { cls: 'win', text: '🏆 আপনি জিতেছেন!' }
        : winner === 'loss' ? { cls: 'loss', text: `${peerName} জিতেছে—পরেরবার ঘুরে দাঁড়ান` }
          : { cls: 'draw', text: '🤝 ম্যাচ ড্র হয়েছে' }
    return (
      <div className="gm-result">
        <div className={`gm-winner ${banner.cls}`}>{banner.text}</div>
        <div className="gm-result-grid">
          <div className="gm-result-card you">
            <small>আপনি</small>
            <b>{BN(mySummary.score)}%</b>
            <span>{BN(mySummary.ok)} সঠিক • {BN(mySummary.bad)} ভুল • {BN(mySummary.skip)} বাদ</span>
            <em>{visibleName()}</em>
          </div>
          <div className="gm-result-card peer">
            <small>{peerName}</small>
            <b>{peerSummary ? `${BN(peerSummary.score)}%` : '—'}</b>
            <span>{peerSummary ? `${BN(peerSummary.ok)} সঠিক • ${BN(peerSummary.bad)} ভুল • ${BN(peerSummary.skip)} বাদ` : 'অপেক্ষমাণ…'}</span>
            <em>সবচেয়ে দ্রুত শেষ করা ও সঠিক উত্তর—দুটোই স্কোরের حساب</em>
          </div>
        </div>

        <div className="panel gm-card">
          <div className="gm-card-head"><h3>প্রশ্নে প্রশ্নে তুলনা</h3><span className="gm-mode-tag">{BN(total)} প্রশ্ন</span></div>
          <div className="gm-compare">
            {qs.map((question, index) => {
              const correct = correctIndexOf(question)
              const mineChoice = mySummary ? padAnswers(myAns, total)[index] : null
              const peerChoice = peerSummary ? padAnswers(peerAnswers, total)[index] : null
              const mineOk = mineChoice !== null && mineChoice === correct
              const peerOk = peerChoice !== null && peerChoice === correct
              return <div className={`gm-compare-row ${mineOk ? 'ok' : mineChoice === null ? 'skip' : 'bad'}`} key={index}>
                <div className="gm-compare-q">
                  <b>প্রশ্ন {BN(index + 1)}</b>
                  <span><Md s={question.question} /></span>
                </div>
                <div className="gm-compare-picks">
                  <span className={mineOk ? 'ok' : mineChoice === null ? 'skip' : 'bad'}>আপনি: <b>{mineChoice === null || mineChoice === undefined ? 'উত্তর দেননি' : (question.options?.[mineChoice] ?? '—')}</b></span>
                  <span className={peerOk ? 'ok' : peerChoice === null ? 'skip' : 'bad'}>{peerName}: <b>{peerChoice === null || peerChoice === undefined ? 'উত্তর দেননি' : (question.options?.[peerChoice] ?? '—')}</b></span>
                  <span className="correct">সঠিক: <b>{correct >= 0 ? question.options?.[correct] : question.answer}</b></span>
                </div>
                <details className="gm-expl"><summary>ব্যাখ্যা</summary><div className="expl"><Md s={question.explanation || `সঠিক উত্তর — ${question.answer}`} /></div></details>
              </div>
            })}
          </div>
        </div>

        <div className="gm-playbar">
          <button className="btn primary" onClick={requestRematch}>🔁 আবার খেলুন</button>
          <span className="gm-hint">রেকর্ড: {BN(record.wins)} জয় • {BN(record.losses)} হার • {BN(record.draws)} ড্র</span>
        </div>
      </div>
    )
  }

  return (
    <section className="sec gm-page">
      <div className="head gm-head">
        <div>
          <div className="eyebrow">১v১ লাইভ গেম মোড</div>
          <h2>বন্ধুর সাথে <i>একসাথে পরীক্ষা</i></h2>
          <p className="muted">একই প্রশ্ন, একই সময়—দুজনের প্রস্তুতি ও অগ্রগতি লাইভ দেখা যাবে।</p>
        </div>
        <div className="gm-head-actions">
          {phase !== 'home' && <span className={`gm-link ${transportBadge.cls}`}><i aria-hidden="true" />{transportBadge.text}</span>}
          {phase !== 'home' && <button className="btn sm ghost" onClick={leaveRoom}>রুম ছেড়ে দিন</button>}
          <button className="btn sm" onClick={() => go?.('home')}>← হোম</button>
        </div>
      </div>

      {!!note && <div className="gm-note" role="status">{note}</div>}

      {phase === 'home' && renderHome()}
      {phase === 'lobby' && renderLobby()}
      {phase === 'countdown' && renderCountdown()}
      {phase === 'play' && (config.syncMode === 'step' ? renderStepPlay() : renderPaperPlay())}
      {phase === 'result' && renderResult()}

      {phase !== 'home' && (
        <div className="gm-reactions">
          {REACTIONS.map(emoji => <button key={emoji} onClick={() => react(emoji)} aria-label={`${emoji} পাঠান`}>{emoji}</button>)}
        </div>
      )}

      <div className="gm-floats" aria-live="polite">
        {reactions.map(item => <span key={item.id} className="gm-float"><b>{item.emoji}</b><small>{item.label}</small></span>)}
      </div>
    </section>
  )
}

export default GameMode
