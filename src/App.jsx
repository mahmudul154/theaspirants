import React, { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './styles.css'
import INITIAL_QUESTION_COUNTS from './question-counts.json'
import { supabase } from './lib/supabase.js'
import { SSLCZ, isLive, initPayment, genTranId, PAY_METHODS } from './lib/sslcommerz.js'
import { BN, CATS, SUBJ_META, SUBJECTS, BOARD, QB, TOPICS, CAT_SUBJECTS, dbSubjectsFor, localPool, mixQuestions, POTRIKA, WRITTEN_TOPICS, VISUALS, PLANS } from './data.js'
import { buildDailyLiveExams, formatExamCountdown, formatLiveExamDate, formatLiveExamTime } from './live-exams.js'

const questionCountCache = new Map()
const appearedQuestionCountCache = new Map()
const load = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f } }
const Md = ({ s }) => <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{String(s || '')}</Markdown>

const ICOS = {
  book: <><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></>,
  pen: <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />,
  flask: <><path d="M9 3h6" /><path d="M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" /></>,
  calc: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6" /><path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" /></>,
  bulb: <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 1 3.6 10.8c-.6.5-.6 1.2-.6 2.2h-6c0-1 0-1.7-.6-2.2A6 6 0 0 1 12 3z" /></>,
  map: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14" /><path d="M15 6v14" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.6 4 5.6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.6-4-9s1.5-6.4 4-9z" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8" /><path d="M12 16v4" /></>,
  scale: <><path d="M12 3v18" /><path d="M8 21h8" /><path d="M12 6H5l-2.5 6a3 3 0 0 0 5 0L5 6" /><path d="M12 6h7l2.5 6a3 3 0 0 1-5 0L19 6" /></>,
  mountain: <path d="M8 3l4 8 5-5 5 15H2z" />,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="1" /><rect x="10" y="10" width="4" height="4" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></>
}
const SUBJ_ICON = { 'English': 'book', 'বাংলা': 'pen', 'বিজ্ঞান': 'flask', 'গাণিতিক যুক্তি': 'calc', 'মানসিক দক্ষতা': 'bulb', 'বাংলাদেশ বিষয়াবলি': 'map', 'আন্তর্জাতিক বিষয়াবলি': 'globe', 'কম্পিউটার ও তথ্য প্রযুক্তি': 'monitor', 'নৈতিকতা, মূল্যবোধ ও সুশাসন': 'scale', 'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা': 'mountain', 'Microcontroller': 'cpu' }
const Ico = ({ id, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICOS[SUBJ_ICON[id] || 'book']}</svg>
)

const APP_CATS = [
  { id: 'bcs', name: 'বিসিএস', img: '/assets/bcs1.png', d: '১০ বিষয় • প্রিলি-লিখিত-ভাইভা' },
  { id: 'bank', name: 'ব্যাংক জব', img: '/assets/bank1.png', d: '৬ বিষয় • শর্টকাটসহ' },
  { id: 'ntrca', name: 'শিক্ষক নিবন্ধন', img: '/assets/ntrca1.png', d: 'স্কুল ও কলেজ স্তর' },
  { id: 'primary', name: 'প্রাথমিক', img: '/assets/primary1.png', d: 'সহকারী শিক্ষক নিয়োগ' }
]

const NOTICES = [
  { t: 'এসএসসি ফল: পাসের হার ৬২.২৫% — বিশ্লেষণ দেখো পত্রিকায়', d: 'আজ' },
  { t: 'বাংলা কিউআর লেনদেনে ফি শূন্য + প্রণোদনা — অর্থনীতি অংশে গুরুত্বপূর্ণ', d: 'আজ' },
  { t: 'হরমুজ সংকট ও জ্বালানি বাজার — লিখিতের জন্য পয়েন্ট সাজিয়ে রাখো', d: '২ দিন আগে' },
  { t: '৪৭তম বিসিএস প্রিলিমিনারি রুটিন প্রকাশ', d: '৪ দিন আগে' },
  { t: 'এনটিআরসিএ স্কুল পর্যায় নিবন্ধন শুরু', d: '১ সপ্তাহ আগে' }
]
const POP_SEARCH = ['সন্ধি', 'শতকরা', 'মুক্তিযুদ্ধ', 'পদ্মা সেতু', 'জাতীয় প্রতীক', 'সৌরজগৎ']

const SOCIALS = [
  { id: 'fb', name: 'ফেসবুক', url: 'https://www.facebook.com/' },
  { id: 'yt', name: 'ইউটিউব', url: 'https://www.youtube.com/' },
  { id: 'tg', name: 'টেলিগ্রাম', url: 'https://t.me/' },
  { id: 'ig', name: 'ইনস্টাগ্রাম', url: 'https://www.instagram.com/' }
]
const SOC_ICONS = {
  fb: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  yt: <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><path d="M9.75 15.02l5.75-3.27-5.75-3.27z" /></>,
  tg: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>,
  ig: <><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><path d="M17.5 6.5h.01" /></>
}
const SocIcon = ({ id }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{SOC_ICONS[id]}</svg>
)

/* আরও শিটের ব্ল্যাক-অ্যান্ড-হোয়াইট আইকন */
const SHEET_ICONS = {
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  close: <><path d="m18 6-12 12" /><path d="m6 6 12 12" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
  arrowUp: <><path d="m18 15-6-6-6 6" /><path d="M12 9v12" /></>,
  gem: <><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /><path d="m12 22-4-13 3-6" /><path d="m12 22 4-13-3-6" /></>,
  sliders: <><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" /></>,
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>,
  book: <><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></>,
  news: <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></>,
  userPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>
}
const SheetIco = ({ id }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{SHEET_ICONS[id]}</svg>
)
function calcStreak(days) {
  const set = new Set(days); const d = new Date()
  if (!set.has(d.toDateString())) d.setDate(d.getDate() - 1)
  let n = 0
  while (set.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1) }
  return n
}

function examSource(q) {
  const raw = String(q?.post_name || '').trim()
  const full = /^bcs$/i.test(raw) || !raw ? 'BCS' : raw
  const label = full.length > 30 ? `${full.slice(0, 29).trim()}…` : full
  return { full, label }
}

export function App() {
  const [page, setPage] = useState('home')
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState(null)
  const [wrong, setWrong] = useState(() => load('asp_wrong', []))
  const [stats, setStats] = useState(() => load('asp_stats', { exams: 0, correct: 0, total: 0 }))
  const [toastMsg, setToastMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const [questionCounts, setQuestionCounts] = useState(() => load('asp_question_counts', INITIAL_QUESTION_COUNTS))
  const subjectQuestionCount = subject => questionCounts?.subjects?.[subject]?.total || 0
  const [cCat, setCCat] = useState('bcs')
  const [cSubs, setCSubs] = useState(['বাংলা', 'গাণিতিক যুক্তি'])
  const [cTopics, setCTopics] = useState([])
  const [cTopicSearch, setCTopicSearch] = useState('')
  const [cCount, setCCount] = useState(25)
  const [cTime, setCTime] = useState(20)
  const cAvailableTopics = [...new Set(cSubs.flatMap(subject => TOPICS[subject] || []))]
  const customTopicCount = topic => cSubs.reduce((sum, subject) => sum + (questionCounts?.subjects?.[subject]?.topics?.[topic] || 0), 0)
  const [clock, setClock] = useState(Date.now())
  const [liveAttempts, setLiveAttempts] = useState({})
  const [liveAttemptsReady, setLiveAttemptsReady] = useState(false)

  const [quiz, setQuiz] = useState(null)
  const [arm, setArm] = useState(false)
  const [result, setResult] = useState(null)
  const [showRev, setShowRev] = useState(false)
  const [lbData, setLbData] = useState(null)
  const [profData, setProfData] = useState(null)
  const [q, setQ] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchFocus, setSearchFocus] = useState(false)
  const [hist, setHist] = useState(() => load('asp_hist', []))
  const [todo, setTodo] = useState(() => load('asp_todo_' + new Date().toDateString(), [false, false, false]))
  const [avatar, setAvatar] = useState(() => localStorage.getItem('asp_avatar') || null)
  const [revMeta, setRevMeta] = useState(() => load('asp_rev', {}))
  const [goal, setGoal] = useState(() => load('asp_goal', null))
  const [quitArm, setQuitArm] = useState(false)
  const [revOnlyWrong, setRevOnlyWrong] = useState(false)
  const [potCat, setPotCat] = useState('সব')
  const [potImgs, setPotImgs] = useState(() => load('asp_potrika_imgs', {}))
  const [vSel, setVSel] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [plan, setPlan] = useState(() => load('asp_plan', null))
  const [buyPlan, setBuyPlan] = useState(null)
  const [payMethod, setPayMethod] = useState('bkash')
  const [payStage, setPayStage] = useState('select')
  const [trxId, setTrxId] = useState('')

  /* SSLCommerz রিডাইরেক্ট হ্যান্ডলার (success/fail/cancel) */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const st = p.get('sslcz')
    if (st) {
      if (st === 'success') setToastMsg('পেমেন্ট সফল! ভেরিফাই চলছে ✅')
      if (st === 'fail') setToastMsg('পেমেন্ট ব্যর্থ — আবার চেষ্টা করো')
      if (st === 'cancel') setToastMsg('পেমেন্ট বাতিল হয়েছে')
      p.delete('sslcz'); p.delete('tran')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function startCheckout() {
    const t = genTranId()
    setTrxId(t)
    setPayStage('gateway')
    if (isLive()) {
      initPayment({ plan: buyPlan, method: payMethod, tranId: t, user })
        .then(d => { if (d && d.url) window.location.href = d.url })
        .catch(() => { }) // ব্যর্থ হলে স্যান্ডবক্স গেটওয়েতেই থাকবে
    }
  }
  function confirmPay() {
    setPayStage('processing')
    setTimeout(() => {
      const pl = { id: buyPlan.id, name: buyPlan.name, price: buyPlan.price, per: buyPlan.per, since: new Date().toDateString(), trx: trxId, method: payMethod, via: isLive() ? 'sslcommerz' : 'sandbox' }
      setPlan(pl); localStorage.setItem('asp_plan', JSON.stringify(pl))
      try {
        supabase.from('orders').insert({ user_id: user?.id || null, plan: buyPlan.id, amount: buyPlan.price, trx_id: trxId, method: payMethod, status: 'paid' }).then(() => { }).catch(() => { })
      } catch (e) { }
      setPayStage('success')
      setTimeout(() => { setBuyPlan(null); setPayStage('select'); setToastMsg('পেমেন্ট সফল! প্রিমিয়াম চালু হলো 🎉') }, 1500)
    }, 1300)
  }

  function onPic(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      const img = new Image()
      img.onload = () => {
        const S = 160, c = document.createElement('canvas')
        c.width = S; c.height = S
        const x = c.getContext('2d'), m = Math.min(img.width, img.height)
        x.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S)
        const d = c.toDataURL('image/jpeg', .85)
        setAvatar(d); localStorage.setItem('asp_avatar', d)
        setToastMsg('প্রোফাইল ছবি আপডেট হয়েছে 📷')
      }
      img.src = r.result
    }
    r.readAsDataURL(f)
  }
  const avSrc = (u) => avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.user_metadata?.full_name || u?.email || 'U')}&background=0e7a5f&color=ffffff`

  /* পত্রিকায় নিজের ডিজাইনের ছবি যোগ করা */
  function onNewsPic(e, key) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      const img = new Image()
      img.onload = () => {
        const W = 640, sc = Math.min(1, W / img.width)
        const c = document.createElement('canvas')
        c.width = Math.max(1, Math.round(img.width * sc)); c.height = Math.max(1, Math.round(img.height * sc))
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        const d = c.toDataURL('image/jpeg', .82)
        const n = { ...potImgs, [key]: d }
        try {
          localStorage.setItem('asp_potrika_imgs', JSON.stringify(n))
          setPotImgs(n); setToastMsg('ছবি যোগ হয়েছে 🖼')
        } catch (err) { setToastMsg('স্টোরেজ পূর্ণ — আগে কিছু ছবি মুছুন') }
      }
      img.src = r.result
    }
    r.readAsDataURL(f)
    e.target.value = ''
  }
  function rmNewsPic(key) {
    const n = { ...potImgs }; delete n[key]
    try { localStorage.setItem('asp_potrika_imgs', JSON.stringify(n)) } catch (err) { }
    setPotImgs(n); setToastMsg('ছবি মুছে ফেলা হয়েছে')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (page !== 'home' && page !== 'exams') return
    setClock(Date.now())
    const timer = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [page])
  useEffect(() => {
    let active = true
    if (!user?.id) {
      setLiveAttempts({})
      setLiveAttemptsReady(true)
      return () => { active = false }
    }

    const storageKey = `asp_live_attempts_${user.id}`
    const localAttempts = load(storageKey, {})
    setLiveAttempts(localAttempts)
    setLiveAttemptsReady(false)
    supabase.from('exam_results')
      .select('category')
      .eq('user_id', user.id)
      .like('category', 'live:%')
      .then(({ data, error }) => {
        if (!active) return
        const synced = { ...localAttempts }
        if (!error) (data || []).forEach(row => {
          const scheduleId = String(row.category || '').replace(/^live:/, '')
          if (scheduleId) synced[scheduleId] = synced[scheduleId] || { synced: true }
        })
        setLiveAttempts(synced)
        localStorage.setItem(storageKey, JSON.stringify(synced))
        setLiveAttemptsReady(true)
      })
      .catch(() => { if (active) setLiveAttemptsReady(true) })
    return () => { active = false }
  }, [user?.id])
  useEffect(() => {
    let active = true
    const refreshCounts = async () => {
      try {
        const response = await fetch('/api/question-counts', { headers: { Accept: 'application/json' } })
        if (!response.ok) return
        const data = await response.json()
        if (!active || !data?.subjects || !data?.total) return
        setQuestionCounts(data)
        localStorage.setItem('asp_question_counts', JSON.stringify(data))
      } catch (error) { /* bundled counts remain available offline */ }
    }
    refreshCounts()
    const timer = setInterval(refreshCounts, 6 * 60 * 60 * 1000)
    return () => { active = false; clearInterval(timer) }
  }, [])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    const closeOnEscape = e => { if (e.key === 'Escape') setSheetOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', closeOnEscape) }
  }, [sheetOpen])
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .08 })
    document.querySelectorAll('.page.on .sec, .page.on .hero-panel').forEach(el => { el.classList.add('fade'); io.observe(el) })
    return () => io.disconnect()
  }, [page])
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToastMsg(''), 2400); return () => clearTimeout(t) }, [toastMsg])

  useEffect(() => {
    if (!quiz || page !== 'quiz') return
    const t = setInterval(() => setQuiz(q => q ? { ...q, left: q.left - 1 } : q), 1000)
    return () => clearInterval(t)
  }, [quiz?.title, page])
  useEffect(() => { if (quiz && quiz.left <= 0) finish() }, [quiz?.left])

  function go(p) {
    if (p === 'profile' && !user) p = 'login'
    setPage(p); window.scrollTo({ top: 0 }); setArm(false); setSheetOpen(false)
    if (p !== 'visual') setVSel(null)
    if (p === 'leaderboard') fetchLeaderboard()
    if (p === 'profile') fetchProfile()
  }

  function updateCustomSubjects(nextSubjects) {
    const next = [...new Set(nextSubjects)]
    const allowedTopics = new Set(next.flatMap(subject => TOPICS[subject] || []))
    setCSubs(next)
    setCTopics(current => current.filter(topic => allowedTopics.has(topic)))
    setCTopicSearch('')
  }

  function openCustomQuiz({ category = 'bcs', subjects, topics = [] } = {}) {
    const nextSubjects = subjects?.length ? subjects : (CAT_SUBJECTS[category] || CAT_SUBJECTS.bcs).slice(0, 2)
    setCCat(category)
    setCSubs(nextSubjects)
    setCTopics(topics)
    setCTopicSearch('')
    go('setup')
  }

  function startScheduledExam(exam) {
    if (!user) {
      setToastMsg('🔒 লাইভ পরীক্ষা দিতে আগে লগইন করুন')
      go('login')
      return
    }
    if (!liveAttemptsReady) { setToastMsg('অ্যাটেম্পট যাচাই হচ্ছে—একটু অপেক্ষা করুন'); return }
    if (liveAttempts[exam.id]) { setToastMsg('✓ এই পরীক্ষাটি আপনি ইতিমধ্যে দিয়েছেন'); return }
    if (Date.now() < exam.startsAt) { setToastMsg('⏳ নির্ধারিত সময়ে পরীক্ষাটি শুরু হবে'); return }
    beginQuiz({
      title: exam.title,
      tag: 'bcs',
      subjects: [exam.subject],
      topics: [exam.topic],
      limit: exam.questions,
      minutes: exam.minutes,
      fallback: [exam.subject],
      returnPage: 'exams',
      scheduleId: exam.id,
      once: true
    })
  }

  async function beginQuiz(cfg) {
    if (!user) {
      setToastMsg('🔒 পরীক্ষা দিতে আগে লগইন করুন')
      go('login')
      return
    }

    const origin = cfg.returnPage || page
    const repeatSetup = cfg.once ? null : { ...cfg, returnPage: origin }
    const { title, subjects, topics, limit, minutes, fallback } = cfg
    const requestedLimit = Math.max(1, Number(limit || 10))
    setLoading(true)
    let rows = null
    let databaseRowsArePrioritized = false
    if (cfg.rows) rows = cfg.rows
    else try {
      const dbSubjects = dbSubjectsFor(subjects)
      const selectedTopics = topics && topics.length ? [...new Set(topics)] : []
      const isAllBcs = !selectedTopics.length && subjects?.length === CAT_SUBJECTS.bcs.length
        && CAT_SUBJECTS.bcs.every(subject => subjects.includes(subject))
      const applyQuestionFilters = query => {
        let filtered = query.eq('is_active', true)
        // The full BCS mix is the whole active job pool except Microcontroller.
        // This avoids an oversized 70+ value IN filter while retaining ~93K rows.
        if (isAllBcs) filtered = filtered.neq('subject', 'মাইক্রোকন্ট্রোলার')
        else if (dbSubjects.length) filtered = filtered.in('subject', dbSubjects)
        if (selectedTopics.length) filtered = filtered.in('topic', selectedTopics)
        return filtered
      }

      // `post_name = bcs` (case-insensitive, exact value) is the generic/AI pool.
      // Any non-empty different post_name identifies a named previous exam/source
      // and must be exhausted first. Values such as "45th BCS" remain preferred;
      // only the bare generic value "bcs" is deprioritized.
      const applyAppearedQuestionFilter = query => query
        .not('post_name', 'ilike', 'bcs')
        .neq('post_name', '')
      const applyGenericQuestionFilter = query => query
        .or('post_name.ilike.bcs,post_name.is.null,post_name.eq.')

      // exam_tag is intentionally not used: almost every database row is tagged
      // "bcs" (and normal bank rows are not tagged "bank"). Subject + exact topic
      // aliases expose the full active pool while filtering only on exact topic values.
      const countKey = JSON.stringify([isAllBcs ? 'all-bcs' : dbSubjects.slice().sort(), selectedTopics.slice().sort()])
      let available = questionCountCache.get(countKey)
      let appearedAvailable = appearedQuestionCountCache.get(countKey)
      if (available == null || appearedAvailable == null) {
        const [countResult, appearedCountResult] = await Promise.all([
          applyQuestionFilters(
            supabase.from('mcq_questions_job').select('id', { count: 'exact', head: true })
          ),
          applyAppearedQuestionFilter(applyQuestionFilters(
            supabase.from('mcq_questions_job').select('id', { count: 'exact', head: true })
          ))
        ])
        if (countResult.error) throw countResult.error
        if (appearedCountResult.error) throw appearedCountResult.error
        available = countResult.count || 0
        appearedAvailable = appearedCountResult.count || 0
        questionCountCache.set(countKey, available)
        appearedQuestionCountCache.set(countKey, appearedAvailable)
      }

      const fetchRandomPool = async (applyPoolFilter, poolCount, desiredCount) => {
        if (!poolCount || desiredCount <= 0) return []
        const poolSize = Math.min(poolCount, Math.max(120, desiredCount * 8))
        const maxOffset = Math.max(0, poolCount - poolSize)
        const offset = maxOffset ? Math.floor(Math.random() * (maxOffset + 1)) : 0
        const { data, error } = await applyPoolFilter(applyQuestionFilters(
          supabase.from('mcq_questions_job').select('*')
        ))
          // id alone is not unique in this table; the composite order keeps range
          // pagination stable while choosing a random bounded window.
          .order('id', { ascending: true })
          .order('created_at', { ascending: true })
          .range(offset, offset + poolSize - 1)
        if (error) throw error
        return data || []
      }

      if (available > 0) {
        const appearedPool = await fetchRandomPool(
          applyAppearedQuestionFilter,
          appearedAvailable,
          requestedLimit
        )
        const appearedRows = mixQuestions(appearedPool, requestedLimit)
        const remaining = Math.max(0, requestedLimit - appearedRows.length)
        let genericRows = []

        // The generic/AI pool is touched only when the selected subject/topic does
        // not contain enough named previous-exam questions to fill the quiz.
        if (remaining > 0) {
          const genericAvailable = Math.max(0, available - appearedAvailable)
          const genericPool = await fetchRandomPool(
            applyGenericQuestionFilter,
            genericAvailable,
            remaining
          )
          genericRows = mixQuestions(genericPool, remaining)
        }

        if (appearedRows.length || genericRows.length) {
          // Keep previous-exam questions before any generic fallback questions.
          rows = [...appearedRows, ...genericRows]
          databaseRowsArePrioritized = true
        }
      }
    } catch (e) { console.error('Fetch Error:', e) }
    if (!rows) rows = (Array.isArray(fallback) ? fallback : SUBJECTS).flatMap(s => localPool(s))
    const qs = databaseRowsArePrioritized ? rows.slice(0, requestedLimit) : mixQuestions(rows, limit)
    setLoading(false)
    if (!qs.length) { setToastMsg('প্রশ্ন পাওয়া যায়নি'); return }
    setResult(null); setShowRev(false); setArm(false); setQuitArm(false)
    setQuiz({ title, qs, ans: Array(qs.length).fill(null), mark: Array(qs.length).fill(false), left: minutes * 60, subj: (subjects && subjects[0]) || (Array.isArray(fallback) ? fallback[0] : null) || 'মিশ্র', origin, setup: repeatSetup, scheduleId: cfg.scheduleId || null })
    go('quiz')
  }

  function finish() {
    if (!quiz) return
    const { qs, ans } = quiz
    let ok = 0, bad = 0, skip = 0
    const rev = []
    const topicMap = new Map()
    let newWrong = [...wrong]
    const rm = { ...revMeta }
    qs.forEach((q, i) => {
      const key = q.id || q.question
      const isOk = ans[i] != null && q.options[ans[i]] === q.answer
      const topicName = String(q.topic || 'বিবিধ').trim() || 'বিবিধ'
      const topicStat = topicMap.get(topicName) || { topic: topicName, total: 0, correct: 0, wrong: 0, skipped: 0 }
      topicStat.total++
      if (ans[i] == null) topicStat.skipped++
      else if (isOk) topicStat.correct++
      else topicStat.wrong++
      topicMap.set(topicName, topicStat)
      if (ans[i] == null) skip++
      else if (isOk) {
        ok++
        if (rm[key]) {
          const lv = (rm[key].level || 1) + 1
          if (lv > 3) { delete rm[key]; newWrong = newWrong.filter(x => (x.id || x.question) !== key) }
          else rm[key] = { level: lv, due: Date.now() + [1, 3, 7][lv - 1] * 864e5 }
        }
      }
      else { bad++; newWrong.push(q); rm[key] = { level: 1, due: Date.now() + 864e5 } }
      rev.push({ ...q, ua: ans[i] })
    })
    const w = newWrong.slice(-100)
    setWrong(w); localStorage.setItem('asp_wrong', JSON.stringify(w))
    setRevMeta(rm); localStorage.setItem('asp_rev', JSON.stringify(rm))
    const st = { exams: stats.exams + 1, correct: stats.correct + ok, total: stats.total + qs.length }
    setStats(st); localStorage.setItem('asp_stats', JSON.stringify(st))
    const pct = Math.round((Math.max(0, ok - bad * .5)) / qs.length * 100)
    const h2 = [{ t: quiz.title, s: quiz.subj || 'মিশ্র', p: pct, d: new Date().toDateString() }, ...hist].slice(0, 60)
    setHist(h2); localStorage.setItem('asp_hist', JSON.stringify(h2))
    if (quiz.scheduleId && user?.id) {
      const storageKey = `asp_live_attempts_${user.id}`
      const completion = { completedAt: new Date().toISOString(), score: pct }
      setLiveAttempts(current => {
        const next = { ...current, [quiz.scheduleId]: completion }
        localStorage.setItem(storageKey, JSON.stringify(next))
        return next
      })
      supabase.from('exam_results').insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'শিক্ষার্থী',
        user_avatar: user.user_metadata?.avatar_url || null,
        score: pct,
        total_questions: qs.length,
        category: `live:${quiz.scheduleId}`
      }).then(({ error }) => { if (error) console.warn('Live attempt sync failed:', error.message) })
    }
    const topicStats = [...topicMap.values()].map(t => ({ ...t, accuracy: Math.round(t.correct / t.total * 100) }))
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total || a.topic.localeCompare(b.topic))
    setResult({ ok, bad, skip, pct, rev, topicStats, title: quiz.title, origin: quiz.origin, setup: quiz.setup, scheduleId: quiz.scheduleId })
    setQuiz(null)
    setRevOnlyWrong(false)
    go('result')
  }

  async function fetchLeaderboard() {
    setLbData(null)
    try {
      const d0 = new Date(); d0.setHours(0, 0, 0, 0)
      const { data, error } = await supabase.from('exam_results')
        .select('user_name, user_avatar, score, user_id, created_at')
        .gte('created_at', d0.toISOString()).order('created_at', { ascending: true })
      if (error) throw error
      if (data && data.length) {
        const g = {}
        data.forEach(p => {
          const k = p.user_id || p.user_name
          g[k] ||= { user_name: p.user_name, user_avatar: p.user_avatar, totalScore: 0, total_exams: 0 }
          g[k].total_exams += 1; g[k].totalScore += Number(p.score)
        })
        setLbData(Object.values(g).map(d => ({ ...d, avgScore: (d.totalScore / d.total_exams).toFixed(1) }))
          .sort((a, b) => b.totalScore - a.totalScore).slice(0, 20))
        return
      }
    } catch (e) { console.error(e) }
    setLbData([])
  }

  async function fetchProfile() {
    setProfData(null)
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        const { data } = await supabase.from('exams_history').select('subject, score').eq('user_id', u.id)
        if (data && data.length) {
          setProfData({ total_exams: data.length, average_score: (data.reduce((a, b) => a + Number(b.score), 0) / data.length).toFixed(1) })
          return
        }
      }
    } catch (e) { console.error(e) }
    setProfData(false)
  }

  function quitTap() {
    if (!quitArm) { setQuitArm(true); setTimeout(() => setQuitArm(false), 2500); return }
    setQuiz(null); setQuitArm(false); go('home')
  }
  const mmss = quiz ? `${BN(String(Math.max(0, Math.floor(quiz.left / 60))).padStart(2, '0'))}:${BN(String(Math.max(0, quiz.left % 60)).padStart(2, '0'))}` : ''
  const searchRes = q.trim().length > 1 ? SUBJECTS.flatMap(sb => (TOPICS[sb] || []).filter(t => t.includes(q.trim())).map(t => ({ sb, t }))).slice(0, 6) : []
  const streak = calcStreak(hist.map(h => h.d))
  const subjAgg = {}
  hist.forEach(h => { (subjAgg[h.s] ||= { sum: 0, n: 0 }); subjAgg[h.s].sum += h.p; subjAgg[h.s].n++ })
  const subjBars = Object.entries(subjAgg).map(([k, v]) => ({ s: k, avg: Math.round(v.sum / v.n) })).sort((a, b) => b.avg - a.avg).slice(0, 5)
  const weak = {}
  wrong.forEach(w => { if (w.topic) { (weak[w.topic] ||= { n: 0, s: w.subject || 'বাংলা', tag: w.exam_tag }); weak[w.topic].n++ } })
  const weakList = Object.entries(weak).sort((a, b) => b[1].n - a[1].n).slice(0, 4)
  const dueList = wrong.filter(q => { const m = revMeta[q.id || q.question]; return m && m.due <= Date.now() })
  const greet = () => { const h = new Date().getHours(); return h < 5 ? 'শুভ রাত্রি' : h < 12 ? 'সুপ্রভাত' : h < 17 ? 'শুভ দুপুর' : h < 20 ? 'শুভ সন্ধ্যা' : 'শুভ রাত্রি' }
  const goalDays = goal && goal.date ? Math.max(0, Math.ceil((new Date(goal.date) - new Date()) / 864e5)) : null
  const trend = (() => { if (hist.length < 2) return null; const a = hist.slice(0, 3), b = hist.slice(3, 6); if (!b.length) return null; const av = x => x.reduce((t, h) => t + h.p, 0) / x.length; return Math.round(av(a) - av(b)) })()
  const scheduledExams = buildDailyLiveExams(clock)
  const liveExam = scheduledExams.find(exam => exam.status === 'live') || null
  const upcomingExams = scheduledExams.filter(exam => exam.status === 'upcoming').slice(0, 7)
  const pastExams = scheduledExams.filter(exam => exam.status === 'past').slice(-7).reverse()
  const featuredExam = liveExam || upcomingExams[0] || null
  const homeLiveExams = (liveExam ? [liveExam, ...upcomingExams] : upcomingExams).slice(0, 4)
  const Expl = ({ q }) => q?.explanation ? <div className="expl"><b>ব্যাখ্যা: </b><Md s={q.explanation} /></div> : null

  const LBRow = (x, i) => (
    <div className="lb-row" key={i}>
      <span className="rk">{['🥇', '🥈', ''][i] || <i>✦</i>}</span>
      <div className="nm">{x.n || x.user_name}<span>{BN(x.e || x.total_exams)} পরীক্ষা সম্পন্ন</span></div>
      <span className="sc">{BN(x.s || x.avgScore)}<small> % গড়</small></span>
    </div>
  )

  return (
    <div>
      {page !== 'quiz' && <header>
        <div className="hdr-in">
          <button className="ibtn menu-toggle" aria-label="সাইড নেভিগেশন খুলুন" aria-expanded={sheetOpen} onClick={() => setSheetOpen(true)}>
            <SheetIco id="menu" />
          </button>
          <button className="logo hdr-logo" onClick={() => go('home')} title="অভ্যাস">
            <span className="wordmark">অভ্যাস</span>
          </button>
          <div className="hdr-right">
            <button className="ibtn wide prem" onClick={() => go('pricing')}><SheetIco id="gem" /> প্ল্যান</button>
            <button className="ibtn wide" onClick={() => go('setup')}><SheetIco id="sliders" /> কাস্টম কুইজ</button>
            <button className="ibtn" aria-label={dark ? 'লাইট মোড' : 'ডার্ক মোড'} onClick={() => setDark(d => !d)}><SheetIco id={dark ? 'sun' : 'moon'} /></button>
            {user
              ? <button className="ibtn" style={{ border: 'none', padding: 0, width: 38, height: 38 }} title="প্রোফাইল" onClick={() => go('profile')}>
                  <img className="av-sm" src={avSrc(user)} alt="profile" />
                </button>
              : <button className="ibtn wide auth-login" onClick={() => go('login')}><SheetIco id="login" /> লগইন</button>}
          </div>
        </div>
      <div className="topbar">
        <div className="search"><svg className="s-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg><input placeholder="" value={q} onFocus={() => setSearchFocus(true)} onBlur={() => setTimeout(() => setSearchFocus(false), 180)} onChange={e => setQ(e.target.value)} /></div>
        <button className="ibtn notif" onClick={() => setNotifOpen(v => !v)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg><span className="ndot" /></button>
        {q.trim().length <= 1 && searchFocus && <div className="sres">
          <div className="sres-h">🔥 জনপ্রিয় সার্চ</div>
          {POP_SEARCH.map(t => (
            <button key={t} onClick={() => setQ(t)}>
              <span>{t}</span><span style={{ color: 'var(--ink3)' }}>খুঁজুন →</span>
            </button>
          ))}
        </div>}
        {q.trim().length > 1 && <div className="sres">
          {searchRes.length ? searchRes.map((r, i) => (
            <button key={i} onClick={() => { setQ(''); openCustomQuiz({ category: CAT_SUBJECTS.bcs.includes(r.sb) ? 'bcs' : 'bank', subjects: [r.sb], topics: [r.t] }) }}>
              <span>{r.t}</span><span style={{ color: 'var(--ink3)' }}>{r.sb}</span>
            </button>
          )) : <button>কিছু পাওয়া যায়নি</button>}
        </div>}
        {notifOpen && <div className="npanel">
          <div className="nh">🔔 নোটিফিকেশন</div>
          {NOTICES.map((n, i) => <div className="ni" key={i}><b>{n.t}</b><small>{n.d}</small></div>)}
        </div>}
      </div>
      </header>}

      <main style={page === 'quiz' ? { paddingBottom: 140 } : undefined}>
        {/* ================= HOME (edtech app landing) ================= */}
        {page === 'home' && <>
          <section className="hero-panel">
            <div className="eyebrow">অভ্যাস — Govt Job Exam App</div>
            <h1>চাকরির পরীক্ষায় <i>নিশ্চিত সাফল্য</i>, এক অ্যাপে।</h1>
            <p className="lead muted" style={{ maxWidth: '58ch' }}>বিসিএস ও ব্যাংক জবের <b>{BN(questionCounts?.total || 93855)}+</b> প্রশ্নের ব্যাংক থেকে তৈরি করুন কাস্টম কুইজ — প্রতিটি প্রশ্নের <b>ব্যাখ্যাসহ</b>। বিশ্লেষণ করুন দুর্বলতা, এগিয়ে থাকুন প্রতিযোগিতায়।</p>
            <div className="cta" style={{ marginTop: 6 }}>
              <button className="btn primary" onClick={() => go('exams')}>অনুশীলন শুরু করুন →</button>
              <button className="btn ghost" onClick={() => go('setup')}>🛠 কাস্টম কুইজ</button>
            </div>
            <div className="hero-chips" style={{ marginTop: 10 }}>
              <span className="hchip"><b>{BN(questionCounts?.total || 93855)}+</b> প্রশ্ন</span>
              <span className="hchip"><b>১০,০০+</b> শিক্ষার্থী</span>
              <span className="hchip"><b>২২</b> ক্যাটাগরি</span>
              <span className="hchip"><b>১১</b> বিষয়</span>
              <span className="hchip"><b>✓</b> ব্যাখ্যাসহ সমাধান</span>
            </div>
          </section>

          <section className="sec" style={{ paddingTop: 28 }}>
            <div className="panel" style={{ gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ margin: 0 }}>{greet()}, {(user?.user_metadata?.full_name || user?.name || 'শিক্ষার্থী').split(' ')[0]} 👋</h3>
                <div className="hero-chips">
                  {goalDays != null && <span className="hchip">⏳ {goal.name}: আর <b>{BN(goalDays)}</b> দিন</span>}
                  {trend != null && trend !== 0 && <span className="hchip">{trend > 0 ? '📈' : '📉'} <b>{BN(Math.abs(trend))}%</b> ট্রেন্ড</span>}
                  <span className="hchip">🔥 <b>{BN(streak)}</b> স্ট্রিক</span>
                </div>
              </div>
              <span className="lbl" style={{ margin: 0 }}>আজকের স্মার্ট প্ল্যান — তোমার ডেটা থেকে বানানো</span>
              <div className="chips">
                {dueList.length > 0 && <button className="chip on" onClick={() => beginQuiz({ title: 'স্মার্ট রিভিশন', rows: dueList, limit: Math.min(10, dueList.length), minutes: 10 })}>🔁 {BN(dueList.length)}টি রিভিশন due</button>}
                {subjBars.length > 0 && subjBars[subjBars.length - 1].avg < 80 && <button className="chip" onClick={() => beginQuiz({ title: 'দুর্বল বিষয় • ' + subjBars[subjBars.length - 1].s, tag: 'bcs', subjects: [subjBars[subjBars.length - 1].s], limit: 10, minutes: 10, fallback: [subjBars[subjBars.length - 1].s] })}>🎯 {subjBars[subjBars.length - 1].s} দুর্বল — ১০ প্রশ্ন</button>}
                {localStorage.getItem('asp_daily') !== new Date().toDateString() && <button className="chip" onClick={() => go('daily')}>🔥 ডেইলি চ্যালেঞ্জ</button>}
                <button className="chip" onClick={() => go('potrika')}>📰 আজকের পত্রিকা</button>
                <button className="chip" onClick={() => go('visual')}>🖼 ছবি দিয়ে শেখো</button>
                {(!plan || plan.id === 'free') && <button className="chip" onClick={() => go('pricing')}>💎 প্রিমিয়াম প্ল্যান</button>}
                <button className="chip" onClick={() => go('exams')}>📘 নতুন টপিক ধরো</button>
              </div>
            </div>
          </section>

          <section className="sec">
            <div className="head"><div className="eyebrow">লাইভ এরিনা</div><h2 style={{ marginTop: 10 }}>লাইভ পরীক্ষা ও <i>রুটিন</i></h2></div>
            <div className="slider">
              {homeLiveExams.map(exam => (
                <button className={`live-card ${exam.status}`} key={exam.id} onClick={() => exam.status === 'live' ? startScheduledExam(exam) : go('exams')}>
                  <span className={`tag ${exam.status === 'live' ? 'live-now' : 'bcs'}`}>{exam.status === 'live' ? '● এখন লাইভ' : 'আগামী পরীক্ষা'}</span>
                  <h3>{exam.subject}</h3>
                  <div className="top">{exam.topic}</div>
                  <div className="meta"><span>{formatLiveExamDate(exam.startsAt)}</span><span>{formatLiveExamTime(exam.startsAt)}</span></div>
                  <span className="go">{exam.status === 'live' ? (user ? 'এখনই দিন →' : <><SheetIco id="lock" /> লগইন করে দিন</>) : <>⏳ {formatExamCountdown(exam.startsAt, clock)}</>}</span>
                </button>
              ))}
            </div>
            <div className="cta"><button className="btn ghost sm" onClick={() => go('exams')}>৭ দিনের সম্পূর্ণ রুটিন →</button></div>
          </section>

          <section className="sec">
            <div className="head" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap' }}>
              <div><div className="eyebrow">টার্গেট বাছো</div><h2 style={{ marginTop: 10 }}>কোন <i>পরীক্ষা</i> দিবে?</h2></div>
            </div>
            <div className="cat-scroll">
              {APP_CATS.map(c => (
                <button className="cat-card" key={c.id} onClick={() => {
                  if (c.id === 'bcs' || c.id === 'bank') openCustomQuiz({ category: c.id })
                  else setToastMsg('শীঘ্রই আসছে: ' + c.name)
                }}>
                  <div className="im">{c.img ? <img src={c.img} alt="" /> : c.e}</div>
                  <div className="bd"><b>{c.name}</b><span>{c.d}</span></div>
                </button>
              ))}
            </div>
          </section>

          <section className="sec">
            <div className="head"><div className="eyebrow">স্মার্ট লার্নিং</div><h2>আজকের <i>টার্গেট</i></h2></div>
            <div className="qk-grid">
              <button className="qk" onClick={() => go('setup')}><span className="ic">🛠</span><b>কাস্টম কুইজ</b><span>নিজে পরীক্ষা বানাও</span></button>
              <button className="qk" onClick={() => go('daily')}><span className="ic">🔥</span><b>ডেইলি চ্যালেঞ্জ</b><span>প্রতিদিন ১০ প্রশ্ন</span></button>
              <button className="qk" onClick={() => go('review')}><span className="ic">⚙</span><b>ভুল পর্যালোচনা</b><span>{BN(wrong.length)}টি ভুল খাতায়</span></button>
              <button className="qk" onClick={() => go('leaderboard')}><span className="ic">🏆</span><b>লিডারবোর্ড</b><span>আজকের র‍্যাংকিং</span></button>
            </div>
          </section>

          <section className="sec">
            <div className="head"><div className="eyebrow">অনুশীলন</div><h2>বিষয়সমূহ</h2></div>
            <div className="subj-tiles">
              {SUBJECTS.map(s => (
                <button className="tile" key={s} onClick={() => openCustomQuiz({ category: CAT_SUBJECTS.bcs.includes(s) ? 'bcs' : 'bank', subjects: [s] })}>
                  <span className="e"><Ico id={s} size={26} /></span><b>{s}</b>
                </button>
              ))}
            </div>
          </section>

                    <section className="sec">
            <div className="head" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap' }}>
              <div><div className="eyebrow">লাইভ এরিনা</div><h2 style={{ marginTop: 10 }}>সেরা <i>চাকরিপ্রার্থী</i></h2></div>
              <button className="btn sm ghost" onClick={() => go('leaderboard')}>সম্পূর্ণ দেখুন →</button>
            </div>
            <div className="lb">{BOARD.slice(0, 4).map(LBRow)}</div>
          </section>

          <section className="sec">
            <div className="cta-band">
              <h2>নিজেকে যাচাই করার জন্য আপনি কি <i>প্রস্তুত?</i></h2>
              <p>২ লাখেরও বেশি পরীক্ষার্থীর বিশ্বস্ত এই প্ল্যাটফর্মে আজই যুক্ত হোন আপনার বিজয়ের যাত্রায়।</p>
              <button className="btn primary" onClick={() => go(user ? 'setup' : 'signup')}>🎓 বিনামূল্যে এখনই যুক্ত হোন ➝</button>
            </div>
          </section>
        </>}

        {/* ================= LIVE EXAM CENTER ================= */}
        {page === 'exams' && <>
          <section className="sec live-exam-center">
            <div className="head live-center-head">
              <div className="eyebrow">দৈনিক লাইভ পরীক্ষা</div>
              <h2>প্রতিদিন রাত ৮টায় <i>টপিকভিত্তিক পরীক্ষা</i></h2>
              <p className="muted">বাংলাদেশ সময়ে প্রতিদিন একটি নতুন পরীক্ষা। সব নির্ধারিত পরীক্ষা ফ্রি—অংশ নিতে শুধু লগইন করুন।</p>
            </div>

            <div className={`exam-access-note ${user ? 'signed-in' : ''}`}>
              <span className="access-icon"><SheetIco id={user ? 'user' : 'lock'} /></span>
              <span>{user ? <><b>আপনি লগইন করেছেন</b>—লাইভ ও বিগত পরীক্ষায় কোনো পেমেন্ট ছাড়াই অংশ নিতে পারবেন।</> : <><b>লগইন আবশ্যক</b>—পরীক্ষা সম্পূর্ণ ফ্রি, তবে ফল ও একবারের অ্যাটেম্পট সংরক্ষণে লগইন করতে হবে।</>}</span>
              {!user && <button className="btn sm primary" onClick={() => go('login')}><SheetIco id="login" /> লগইন</button>}
            </div>

            {featuredExam && <div className={`live-feature ${featuredExam.status}`}>
              <div className="live-feature-copy">
                <div className="live-feature-tags">
                  <span className={`live-status ${featuredExam.status}`}>{featuredExam.status === 'live' ? '● এখন লাইভ' : 'পরবর্তী পরীক্ষা'}</span>
                  <span className="free-badge">ফ্রি</span>
                </div>
                <span className="live-feature-subject"><Ico id={featuredExam.subject} size={18} /> {featuredExam.subject}</span>
                <h3>{featuredExam.topic}</h3>
                <div className="live-feature-meta">
                  <span>📅 {formatLiveExamDate(featuredExam.startsAt)}</span>
                  <span>🕗 {formatLiveExamTime(featuredExam.startsAt)}</span>
                  <span>📝 {BN(featuredExam.questions)} প্রশ্ন</span>
                  <span>⏱ {BN(featuredExam.minutes)} মিনিট</span>
                </div>
              </div>
              <div className="live-feature-action">
                <span>{featuredExam.status === 'live' ? 'লাইভ উইন্ডো শেষ হতে' : 'শুরু হতে বাকি'}</span>
                <strong aria-live="polite">{formatExamCountdown(featuredExam.status === 'live' ? featuredExam.endsAt : featuredExam.startsAt, clock)}</strong>
                {featuredExam.status === 'live'
                  ? <button className="btn primary" disabled={!!liveAttempts[featuredExam.id] || (!!user && !liveAttemptsReady)} onClick={() => startScheduledExam(featuredExam)}>
                      {liveAttempts[featuredExam.id] ? '✓ পরীক্ষা দেওয়া হয়েছে' : !user ? <><SheetIco id="lock" /> লগইন করে পরীক্ষা দিন</> : !liveAttemptsReady ? 'অ্যাটেম্পট যাচাই হচ্ছে…' : 'এখনই শুরু করুন →'}
                    </button>
                  : <button className="btn countdown-btn" disabled>নির্ধারিত সময়ে চালু হবে</button>}
              </div>
            </div>}

            <button className="hub-custom-card" onClick={() => go('setup')}>
              <span className="hub-custom-icon"><SheetIco id="sliders" /></span>
              <span><b>নিজের মতো অনুশীলন করতে চান?</b><small>কাস্টম কুইজে একাধিক বিষয় ও নির্দিষ্ট টপিক বেছে নিন</small></span>
              <i aria-hidden="true">→</i>
            </button>
          </section>

          <section className="sec routine-section">
            <div className="head routine-head">
              <div><div className="eyebrow">পরবর্তী সাত দিন</div><h2>লাইভ পরীক্ষার <i>রুটিন</i></h2></div>
              <span className="dhaka-time-chip">Asia/Dhaka • রাত ৮:০০</span>
            </div>
            <div className="live-routine-list">
              {upcomingExams.map((exam, index) => (
                <article className="live-routine-card" key={exam.id}>
                  <div className="routine-day"><b>{BN(index + 1)}</b><span>দিন</span></div>
                  <div className="routine-main">
                    <div className="routine-card-top"><span>{exam.subject}</span><time dateTime={new Date(exam.startsAt).toISOString()}>{formatLiveExamDate(exam.startsAt)}</time></div>
                    <h3>{exam.topic}</h3>
                    <div className="routine-meta"><span>{BN(exam.questions)} প্রশ্ন</span><span>{BN(exam.minutes)} মিনিট</span><span>ফ্রি</span></div>
                  </div>
                  <div className="routine-countdown"><small>শুরু হতে</small><b aria-live={index === 0 ? 'polite' : undefined}>{formatExamCountdown(exam.startsAt, clock)}</b></div>
                </article>
              ))}
            </div>
          </section>

          <section className="sec past-exam-section">
            <div className="head routine-head">
              <div><div className="eyebrow">আর্কাইভ</div><h2>বিগত <i>পরীক্ষা</i></h2></div>
              <span className="once-chip">প্রতি পরীক্ষায় ১ বার</span>
            </div>
            <p className="muted archive-note">মিস করেছেন? লগইন করে প্রতিটি শেষ হওয়া পরীক্ষা একবার করে ফ্রিতে দিন।</p>
            <div className="past-exam-grid">
              {pastExams.map(exam => {
                const attempted = !!liveAttempts[exam.id]
                return <article className={`past-exam-card ${attempted ? 'attempted' : ''}`} key={exam.id}>
                  <div className="past-card-head"><span className="past-badge">বিগত</span>{attempted && <span className="done-badge">✓ সম্পন্ন</span>}</div>
                  <span className="past-subject"><Ico id={exam.subject} size={16} /> {exam.subject}</span>
                  <h3>{exam.topic}</h3>
                  <time dateTime={new Date(exam.startsAt).toISOString()}>{formatLiveExamDate(exam.startsAt)} • {formatLiveExamTime(exam.startsAt)}</time>
                  <div className="routine-meta"><span>{BN(exam.questions)} প্রশ্ন</span><span>{BN(exam.minutes)} মিনিট</span><span>ফ্রি</span></div>
                  <button className={`btn ${attempted ? 'ghost' : 'primary'} sm`} disabled={attempted || (!!user && !liveAttemptsReady)} onClick={() => startScheduledExam(exam)}>
                    {attempted ? '✓ ইতিমধ্যে দিয়েছেন' : !user ? <><SheetIco id="lock" /> লগইন করে দিন</> : !liveAttemptsReady ? 'যাচাই হচ্ছে…' : 'একবার পরীক্ষা দিন →'}
                  </button>
                </article>
              })}
            </div>
          </section>
        </>}

        {/* ================= LEADERBOARD ================= */}
        {page === 'leaderboard' && <>
          <section className="sec">
            <div className="head"><div className="eyebrow">লাইভ এরিনা</div><h2>সেরা <i>চাকরিপ্রার্থী</i></h2><p className="muted">আজকের লাইভ র‍্যাংকিং।</p></div>
            {lbData === null ? <div className="note">লোড হচ্ছে…</div>
              : lbData.length ? <div className="lb">{lbData.map(LBRow)}</div>
                : <><div className="note"><b>আজকে এখনো কেউ পরীক্ষা দেয়নি।</b> প্রথম হতে এখনই একটা পরীক্ষা দিন!</div><div className="lb">{BOARD.map(LBRow)}</div></>}
          </section>
        </>}

        {/* ================= CUSTOM QUIZ ================= */}
        {page === 'setup' && <>
          <section className="sec">
            <div className="head"><div className="eyebrow">স্মার্ট লার্নিং</div><h2>বিষয় ও টপিক বেছে <i>কাস্টম কুইজ</i></h2><p className="muted">এক বা একাধিক বিষয় বাছুন, তারপর সেই বিষয়গুলোর নির্দিষ্ট টপিক নির্বাচন করুন।</p></div>
            <div className="panel custom-quiz-panel">
              <div className="question-count-status">
                <span className="live-dot" aria-hidden="true" />
                <b>Supabase লাইভ কাউন্ট</b>
                <span>মোট {BN(questionCounts?.total || 0)}টি প্রশ্ন</span>
                {questionCounts?.updatedAt && <time dateTime={questionCounts.updatedAt}>আপডেট: {new Date(questionCounts.updatedAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}</time>}
              </div>
              <div><span className="lbl">ক্যাটাগরি</span>
                <div className="chips">
                  <button className={`chip ${cCat === 'bcs' ? 'on' : ''}`} onClick={() => { setCCat('bcs'); updateCustomSubjects(['বাংলা']); setCTopics([]) }}>🎓 বিসিএস</button>
                  <button className={`chip ${cCat === 'bank' ? 'on' : ''}`} onClick={() => { setCCat('bank'); updateCustomSubjects(['গাণিতিক যুক্তি']); setCTopics([]) }}>🏦 ব্যাংক</button>
                </div>
              </div>

              <div className="setup-select-grid">
                <div className="setup-field">
                  <span className="lbl">বিষয় নির্বাচন করুন</span>
                  <details className="topic-check-dropdown subject-check-dropdown">
                    <summary>
                      <Ico id={cSubs[0] || 'বাংলা'} size={20} />
                      <span>{cSubs.length ? `${BN(cSubs.length)}টি বিষয় নির্বাচিত` : 'এক বা একাধিক বিষয় বাছুন'}</span>
                      <i aria-hidden="true">⌄</i>
                    </summary>
                    <div className="topic-check-menu subject-check-menu">
                      <div className="topic-check-list">
                        <label className="topic-check-option all-option">
                          <input type="checkbox" checked={cSubs.length === (CAT_SUBJECTS[cCat] || []).length} onChange={() => updateCustomSubjects(cSubs.length === (CAT_SUBJECTS[cCat] || []).length ? [] : (CAT_SUBJECTS[cCat] || []))} />
                          <span><b>সব বিষয় নির্বাচন</b><small>{BN((CAT_SUBJECTS[cCat] || []).length)}টি বিষয় থেকে মিশ্র প্রশ্ন</small></span>
                        </label>
                        {(CAT_SUBJECTS[cCat] || []).map(subject => (
                          <label className="topic-check-option" key={subject}>
                            <input type="checkbox" checked={cSubs.includes(subject)} onChange={() => updateCustomSubjects(cSubs.includes(subject) ? cSubs.filter(item => item !== subject) : [...cSubs, subject])} />
                            <span>{subject}<small>{BN(subjectQuestionCount(subject))} প্রশ্ন</small></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>

                <div className="setup-field">
                  <span className="lbl">টপিক নির্বাচন (ঐচ্ছিক)</span>
                  <details className={`topic-check-dropdown ${!cSubs.length ? 'disabled' : ''}`} onClick={event => { if (!cSubs.length) event.preventDefault() }}>
                    <summary aria-disabled={!cSubs.length}>
                      <SheetIco id="book" />
                      <span>{!cSubs.length ? 'আগে বিষয় বাছুন' : cTopics.length ? `${BN(cTopics.length)}টি টপিক নির্বাচিত` : 'সকল টপিক থেকে প্রশ্ন'}</span>
                      <i aria-hidden="true">⌄</i>
                    </summary>
                    {!!cSubs.length && <div className="topic-check-menu">
                      <div className="topic-check-search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input value={cTopicSearch} onChange={event => setCTopicSearch(event.target.value)} placeholder="টপিক খুঁজুন…" />
                      </div>
                      <div className="topic-check-list">
                        <label className="topic-check-option all-option">
                          <input type="checkbox" checked={!cTopics.length} onChange={() => setCTopics([])} />
                          <span><b>সকল টপিক</b><small>নির্বাচিত বিষয়গুলোর সব টপিক থেকে প্রশ্ন আসবে</small></span>
                        </label>
                        {cAvailableTopics.filter(topic => topic.toLocaleLowerCase().includes(cTopicSearch.trim().toLocaleLowerCase())).map(topic => (
                          <label className="topic-check-option" key={topic}>
                            <input type="checkbox" checked={cTopics.includes(topic)} onChange={() => setCTopics(current => current.includes(topic) ? current.filter(item => item !== topic) : [...current, topic])} />
                            <span>{topic}<small>{BN(customTopicCount(topic))} প্রশ্ন</small></span>
                          </label>
                        ))}
                        {!cAvailableTopics.some(topic => topic.toLocaleLowerCase().includes(cTopicSearch.trim().toLocaleLowerCase())) && <p className="topic-empty">কোনো টপিক পাওয়া যায়নি</p>}
                      </div>
                    </div>}
                  </details>
                </div>
              </div>

              {!!cSubs.length && <div className="topic-selection" aria-live="polite">
                {!cTopics.length
                  ? <span className="all-topics"><b>সকল টপিক</b> থেকে প্রশ্ন আসবে</span>
                  : <>
                      <div className="selected-topic-head"><span><b>{BN(cTopics.length)}</b>টি টপিক নির্বাচিত</span><button onClick={() => setCTopics([])}>সব মুছুন</button></div>
                      <div className="selected-topics">{cTopics.map(topic => <button key={topic} title="নির্বাচন বাতিল করুন" onClick={() => setCTopics(current => current.filter(item => item !== topic))}><span>{topic}</span><b aria-hidden="true">×</b></button>)}</div>
                    </>}
              </div>}

              <div className="custom-quiz-options">
                <div><span className="lbl">প্রশ্নসংখ্যা</span>
                  <div className="chips">{[10, 25, 50].map(number => <button className={`chip ${cCount === number ? 'on' : ''}`} key={number} onClick={() => setCCount(number)}>{BN(number)}</button>)}</div>
                </div>
                <div><span className="lbl">সময় (মিনিট)</span>
                  <div className="chips">{[10, 20, 30].map(number => <button className={`chip ${cTime === number ? 'on' : ''}`} key={number} onClick={() => setCTime(number)}>{BN(number)}</button>)}</div>
                </div>
              </div>
              <div className="cta"><button className="btn primary" onClick={() => {
                if (!cSubs.length) { setToastMsg('আগে অন্তত একটি বিষয় বাছুন'); return }
                const subjectLabel = cSubs.length === 1 ? cSubs[0] : `${BN(cSubs.length)}টি বিষয়`
                beginQuiz({ title: `কাস্টম কুইজ • ${subjectLabel}${cTopics.length ? ' • ' + cTopics[0] : ''}`, tag: cCat, subjects: cSubs, topics: cTopics, limit: cCount, minutes: cTime, fallback: cSubs, returnPage: 'setup' })
              }}>{user ? 'কাস্টম কুইজ শুরু করুন →' : <><SheetIco id="lock" /> লগইন করে পরীক্ষা দিন</>}</button></div>
            </div>
          </section>
        </>}

        {/* ================= DAILY ================= */}
        {page === 'daily' && <>
          <section className="sec">
            <div className="head"><div className="eyebrow">ডেইলি চ্যালেঞ্জ</div><h2>আজকের <i>চ্যালেঞ্জ</i></h2></div>
            <div className="panel">
              {localStorage.getItem('asp_daily') === new Date().toDateString()
                ? <><h3>আজকের চ্যালেঞ্জ <i>শেষ!</i></h3><p className="muted">দারুণ! আগামীকালের নতুন চ্যালেঞ্জে দেখা হবে।</p><div className="cta"><button className="btn ghost" onClick={() => go('home')}>হোমে ফিরুন</button></div></>
                : <><h3>আজকের <i>মিশ্র চ্যালেঞ্জ</i></h3><p className="muted">সব বিষয় মিলিয়ে ১০টি প্রশ্ন — ১০ মিনিট। দিনে একবার।</p><div className="cta"><button className="btn primary" onClick={() => { localStorage.setItem('asp_daily', new Date().toDateString()); beginQuiz({ title: 'ডেইলি চ্যালেঞ্জ', tag: 'bcs', subjects: CAT_SUBJECTS.bcs, limit: 10, minutes: 10, fallback: SUBJECTS }) }}>{user ? 'অংশ নিন →' : <><SheetIco id="lock" /> লগইন করে অংশ নিন</>}</button></div></>}
            </div>
          </section>
        </>}

        {/* ================= REVIEW ================= */}
        {page === 'review' && <>
          <section className="sec">
            <div className="head" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap' }}>
              <div><div className="eyebrow">স্মার্ট লার্নিং</div><h2 style={{ marginTop: 10 }}>ভুল <i>পর্যালোচনা</i></h2></div>
              <button className="btn sm ghost" onClick={() => { setWrong([]); localStorage.setItem('asp_wrong', '[]'); setToastMsg('ভুল তালিকা মুছে ফেলা হয়েছে') }}>লিস্ট মুছুন</button>
            </div>
            {wrong.length === 0
              ? <div className="note"><b>এখনো কোনো ভুল নেই!</b> কুইজ দিলে ভুল প্রশ্নগুলো এখানে ব্যাখ্যাসহ জমা হবে।</div>
              : wrong.map((q, i) => (
                <div className="rev-item" key={i}><div className="q"><Md s={q.question} /></div>
                  <div className="a ok">সঠিক উত্তর: {q.answer}</div>
                  <Expl q={q} />
                </div>
              ))}
          </section>
        </>}

        {/* ================= পত্রিকা (কারেন্ট অ্যাফেয়ার্স) ================= */}
        {page === 'potrika' && <>
          <section className="sec">
            <div className="head">
              <div className="eyebrow">কারেন্ট অ্যাফেয়ার্স</div>
              <h2>পত্রিকা — <i>আজকের বিশ্ব</i></h2>
              <p className="muted">প্রিলি ও লিখিত পরীক্ষার জন্য বাছাই করা সাম্প্রতিক ঘটনা। বিষয় বেছে নাও।</p>
            </div>
            <div className="chips">
              {['সব', ...new Set(POTRIKA.map(p => p.cat))].map(c => (
                <button key={c} className={`chip ${potCat === c ? 'on' : ''}`} onClick={() => setPotCat(c)}>{c}</button>
              ))}
            </div>
            <div className="news-grid">
              {POTRIKA.filter(p => potCat === 'সব' || p.cat === potCat).map((p, i) => (
                <div className="news-item" key={i}>
                  {(p.img || potImgs[p.t]) ? <div className="news-img">
                    <img src={p.img || potImgs[p.t]} alt={p.t} />
                    {potImgs[p.t] && <button className="rm-pic" title="ছবি মুছুন" onClick={() => rmNewsPic(p.t)}>✕</button>}
                  </div> : <label className="add-pic" title="নিজের ডিজাইনের ছবি যোগ করুন">🖼 নিজের ডিজাইনের ছবি যোগ করুন
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onNewsPic(e, p.t)} />
                  </label>}
                  <div className="nm">
                    <span className="ntag">{p.cat}</span>
                    <span className={`ntag2 ${p.tag.includes('লিখিত') ? 'wri' : 'pre'}`}>{p.tag}</span>
                    <span className="nd">{p.d}</span>
                  </div>
                  <h3>{p.t}</h3>
                  <p>{p.s}</p>
                </div>
              ))}
            </div>
            <div className="head" style={{ paddingTop: 18 }}>
              <div className="eyebrow">লিখিত প্রস্তুতি</div>
              <h2>বিশ্লেষণ — <i>লিখিতের জন্য</i></h2>
              <p className="muted">প্রতিটি টপিক কীভাবে লিখিত উত্তরে সাজাবে, তার মূল পয়েন্ট।</p>
            </div>
            <div className="wt-grid">
              {WRITTEN_TOPICS.map(w => (
                <div className="wt-item" key={w.t}>
                  <span className="ntag2 wri">{w.tag}</span>
                  <h3>{w.t}</h3>
                  <ul>{w.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
        </>}

        {/* ================= ভিজ্যুয়াল জিকে ================= */}
        {page === 'visual' && !vSel && <>
          <section className="sec">
            <div className="head">
              <div className="eyebrow">ছবি দিয়ে শেখো</div>
              <h2>ভিজ্যুয়াল <i>জিকে</i></h2>
              <p className="muted">মুখস্থ নয় — ছবি দেখে বুঝে মনে রাখো। প্রতিটি টপিকের শেষে আছে কুইজ।</p>
            </div>
            <div className="vgrid">
              {VISUALS.map(v => (
                <button className="vcard" key={v.id} onClick={() => { setVSel(v); window.scrollTo({ top: 0 }) }}>
                  <div className="vim"><img src={v.img} alt={v.title} loading="lazy" /></div>
                  <span className="vtag">{v.tag}</span>
                  <div className="vb"><b>{v.title}</b><span>{v.sub}</span><em>শিখো →</em></div>
                </button>
              ))}
            </div>
          </section>
        </>}

        {page === 'visual' && vSel && <>
          <section className="sec" style={{ paddingTop: 34 }}>
            <button className="btn sm ghost" onClick={() => setVSel(null)} style={{ alignSelf: 'flex-start' }}>← সব টপিক</button>
            <div className="vlesson">
              <div className="eyebrow">{vSel.tag}</div>
              <h2 className="vtitle">{vSel.title}</h2>
              <div className="vimgwrap"><img src={vSel.img} alt={vSel.title} /></div>
              <p className="muted">{vSel.desc}</p>
              <div className="panel">
                <h3>মনে রাখার <i>পয়েন্ট</i></h3>
                <ul className="facts">{vSel.facts.map(f => <li key={f}>{f}</li>)}</ul>
              </div>
              <div className="cta" style={{ marginTop: 8 }}>
                <button className="btn primary" onClick={() => beginQuiz({ title: 'ভিজ্যুয়াল জিকে • ' + vSel.title, rows: vSel.mcqs.map(m => ({ question: m.q, options: m.o, answer: m.o[m.a], topic: vSel.title, subject: 'ভিজ্যুয়াল জিকে' })), limit: vSel.mcqs.length, minutes: 5 })}>{user ? <>নিজে যাচাই করো → {BN(vSel.mcqs.length)}টি প্রশ্ন</> : <><SheetIco id="lock" /> লগইন করে কুইজ দিন</>}</button>
                <button className="btn ghost" onClick={() => setVSel(null)}>অন্য টপিক দেখো</button>
              </div>
            </div>
          </section>
        </>}

        {/* ================= প্ল্যান / প্রাইসিং ================= */}
        {page === 'pricing' && <>
          <section className="sec">
            <div className="head">
              <div className="eyebrow">প্রাইসিং</div>
              <h2>সেরা প্রস্তুতি, <i>সাশ্রয়ী</i> দামে।</h2>
              <p className="muted">দিনে মাত্র কয়েক টাকায় পুরো চাকরি প্রস্তুতি — আনলিমিটেড প্রশ্ন, ব্যাখ্যা, পত্রিকা আর ভিজ্যুয়াল জিকে। কোনো লুকানো খরচ নেই; যেকোনো সময় বাদ দেওয়া যাবে।</p>
            </div>
            <div className="note" style={{ borderLeftColor: 'var(--amber)' }}>🎉 <b>লঞ্চ অফার:</b> প্রথম ৫০০ জন সাবস্ক্রাইবারের জন্য এই দাম — তারপর দাম বাড়বে।</div>
            <div className="price-grid">
              {PLANS.map(p => (
                <div className={`price-card ${p.tag ? 'pop' : ''}`} key={p.id}>
                  {p.tag && <span className="ptag">{p.tag}</span>}
                  <h4 className="pname">{p.name}</h4>
                  <div className="price">৳{BN(p.price)}<span className="per">{p.per}</span></div>
                  <ul className="feat">{p.feats.map(f => <li key={f}>{f}</li>)}</ul>
                  <button className={`btn ${p.tag ? 'primary' : ''}`} onClick={() => p.price === 0 ? go('exams') : setBuyPlan(p)}>
                    {p.price === 0 ? (plan && plan.id !== 'free' ? 'আপনার বর্তমান প্ল্যান চলছে ✓' : 'ফ্রিতে শুরু করুন →') : (plan && plan.id === p.id ? '✓ চালু আছে' : p.cta + ' →')}
                  </button>
                </div>
              ))}
            </div>

            <div className="paystrip">🔒 <b>SSLCommerz সিকিউর পেমেন্ট</b> — বিকাশ • নগদ • রকেট • ভিসা/মাস্টারকার্ড</div>
            <div className="note">💡 <b>৭ দিনের মানি-ব্যাক গ্যারান্টি</b> — পছন্দ না হলে পুরো টাকা ফেরত। যেকোনো সমস্যায়: support@ovvash.app</div>
          </section>
        </>}

        {/* ================= QUIZ (সব প্রশ্ন এক পেজে) ================= */}
        {page === 'quiz' && quiz && <>
          <section className="sec" style={{ paddingTop: 28, gap: 18 }}>
            <div className="eyebrow">{quiz.title} — {BN(quiz.qs.length)}টি প্রশ্ন • স্লাইড/স্ক্রল করে সব দেখো</div>
            {quiz.qs.map((q, qi) => (
              <div className="q-card qcard" id={'qcard-' + qi} key={qi} style={{ scrollMarginTop: 130 }}>
                <div className="qno"><span>প্রশ্ন {BN(qi + 1)}</span>
                  <button className={`flag ${quiz.mark[qi] ? 'on' : ''}`} title="রিভিউয়ের জন্য মার্ক করুন"
                    onClick={() => setQuiz(z => { const m = [...z.mark]; m[qi] = !m[qi]; return { ...z, mark: m } })}>🚩</button>
                </div>
                <div className="qn"><Md s={q.question} /></div>
                {(q.options || []).map((o, i) => (
                  <button className={`qopt ${quiz.ans[qi] === i ? 'sel' : ''}`} key={i}
                    onClick={() => setQuiz(z => { const a = [...z.ans]; a[qi] = i; return { ...z, ans: a } })}>
                    <span className="k">{'কখগঘ'[i]}</span><span>{o}</span>
                  </button>
                ))}
              </div>
            ))}
          </section>

          <div className="qbar">
            <button className="btn ghost sm" onClick={quitTap}>{quitArm ? 'নিশ্চিত?' : '✕'}</button>
            <span className={`q-timer ${quiz.left < 30 ? 'warn' : ''}`}>⏱ {mmss}</span>
            <span className="muted" style={{ fontSize: '.8rem' }}>{BN(quiz.ans.filter(a => a != null).length)}/{BN(quiz.qs.length)} উত্তর হয়েছে</span>
            <button className={`btn ${arm ? 'danger' : 'primary'}`} onClick={() => {
              if (!arm) { setArm(true); setTimeout(() => setArm(false), 2500); return }
              finish()
            }}>{arm ? 'নিশ্চিত? আবার চাপো' : 'সাবমিট করুন ✓'}</button>
          </div>
        </>}

        {/* ================= RESULT ================= */}
        {page === 'result' && result && <>
          <section className="sec" style={{ paddingTop: 44 }}>
            <div className="eyebrow">ফলাফল — {result.title}</div>
            <div className="res-hero"><span className="big">{BN(result.ok)}<i>/</i>{BN(result.ok + result.bad + result.skip)}</span>
              <span className="muted">{result.pct >= 80 ? '🏆 দুর্দান্ত! আপনি প্রস্তুত।' : result.pct >= 60 ? '👍 ভালো! আর একটু ধার দিন।' : '📖 আরও অনুশীলন প্রয়োজন!'}</span>
            </div>
            <div className="res-stats">
              <div className="stat"><strong>{BN(result.pct)}<i>%</i></strong><span>আপনার মোট স্কোর</span></div>
              <div className="stat"><strong>{BN(result.ok)}</strong><span>সঠিক</span></div>
              <div className="stat"><strong>{BN(result.bad)}</strong><span>ভুল</span></div>
              <div className="stat"><strong>{BN(result.skip)}</strong><span>বাদ</span></div>
            </div>
            {!!result.topicStats?.length && <div className="topic-report">
              <div className="topic-report-head">
                <span className="topic-report-icon"><SheetIco id="sliders" /></span>
                <div><h3>টপিকভিত্তিক উত্তরপত্র</h3><p>কোন টপিকে কতটি সঠিক হয়েছে এবং কোথায় আরও অনুশীলন দরকার।</p></div>
              </div>
              {result.topicStats.some(t => t.accuracy < 60)
                ? <div className="weak-topic-box"><b>দুর্বল টপিক</b><div>{result.topicStats.filter(t => t.accuracy < 60).map(t => <span key={t.topic}>{t.topic} · {BN(t.accuracy)}%</span>)}</div></div>
                : <div className="weak-topic-box clear"><b>দারুণ!</b><span>এই পরীক্ষায় ৬০%-এর নিচে কোনো টপিক নেই।</span></div>}
              <div className="topic-report-list">
                {result.topicStats.map(t => {
                  const level = t.accuracy < 60 ? 'weak' : t.accuracy < 80 ? 'practice' : 'strong'
                  const label = level === 'weak' ? 'দুর্বল' : level === 'practice' ? 'আরও অনুশীলন' : 'ভালো'
                  return <div className={`topic-report-row ${level}`} key={t.topic}>
                    <div className="topic-report-title"><b>{t.topic}</b><span className={`topic-level ${level}`}>{label}</span></div>
                    <div className="topic-report-counts">
                      <strong>{BN(t.correct)}/{BN(t.total)} সঠিক</strong>
                      <span>ভুল {BN(t.wrong)}</span>
                      <span>বাদ {BN(t.skipped)}</span>
                      <em>{BN(t.accuracy)}%</em>
                    </div>
                    <div className="topic-progress" aria-label={`${t.topic}: ${t.accuracy}% সঠিক`}><i style={{ width: `${t.accuracy}%` }} /></div>
                  </div>
                })}
              </div>
            </div>}
            {result.setup && <div className="result-return">
              <span className="result-return-icon"><SheetIco id="book" /></span>
              <div><b>এই পরীক্ষার সেটআপ সংরক্ষিত আছে</b><p>বিষয়, টপিক, প্রশ্নসংখ্যা ও সময় আবার নির্বাচন করতে হবে না।</p></div>
              <div className="result-return-actions">
                <button className="btn primary" onClick={() => beginQuiz(result.setup)}>↻ একই সেটআপে আবার দিন</button>
                {result.origin === 'setup' && <button className="btn ghost" onClick={() => {
                  const setup = result.setup
                  setCCat(setup.tag === 'bank' ? 'bank' : 'bcs')
                  setCSubs(setup.subjects || [])
                  setCTopics(setup.topics || [])
                  setCCount(setup.limit || 25)
                  setCTime(setup.minutes || 20)
                  go('setup')
                }}>← আগের সেটআপে ফিরুন</button>}
              </div>
            </div>}
            {result.scheduleId && <div className="result-return live-result-return">
              <span className="result-return-icon">✓</span>
              <div><b>লাইভ পরীক্ষার অ্যাটেম্পট সংরক্ষিত হয়েছে</b><p>প্রতি নির্ধারিত পরীক্ষা একবার দেওয়া যায়। পরবর্তী রুটিন ও বিগত পরীক্ষা লাইভ পরীক্ষা কেন্দ্রে দেখুন।</p></div>
              <button className="btn primary" onClick={() => go('exams')}>লাইভ পরীক্ষা কেন্দ্রে ফিরুন →</button>
            </div>}
            <div className="cta result-main-actions">
              <button className="btn" onClick={() => setShowRev(v => !v)}>{showRev ? 'ব্যাখ্যা লুকান' : 'উত্তর ও ব্যাখ্যা দেখুন'}</button>
              <button className="btn ghost" onClick={() => go('home')}>হোমে ফিরুন</button>
            </div>
            {showRev && <div style={{ marginTop: 26 }}>
              <div className="chips" style={{ marginBottom: 18 }}>
                <button className={`chip ${!revOnlyWrong ? 'on' : ''}`} onClick={() => setRevOnlyWrong(false)}>সব প্রশ্ন ({BN(result.rev.length)})</button>
                <button className={`chip ${revOnlyWrong ? 'on' : ''}`} onClick={() => setRevOnlyWrong(true)}>❌ শুধু ভুলগুলো ({BN(result.rev.filter(r => !(r.ua != null && r.options[r.ua] === r.answer)).length)})</button>
              </div>
              {result.rev.map((r, i) => {
                const isOk = r.ua != null && r.options[r.ua] === r.answer
                const source = examSource(r)
                if (revOnlyWrong && isOk) return null
                return <div className={`rev-item ${isOk ? 'ok-item' : 'bad-item'}`} key={i}>
                  <div className="rev-meta"><span>{r.subject || 'সাধারণ'}</span><span>{r.topic || 'বিবিধ'}</span><span className="source-badge" title={source.full}>🏷 {source.label}</span></div>
                  <div className="q">{BN(i + 1)}. <Md s={r.question} /> <span className={`rev-badge ${isOk ? 'ok' : 'bad'}`}>{isOk ? '✓ সঠিক' : r.ua == null ? '◌ বাদ' : '✗ ভুল'}</span></div>
                  <div className={`a ${isOk ? 'ok' : 'bad'}`}>আপনার উত্তর: {r.ua == null ? '—' : r.options[r.ua]}</div>
                  <div className="a ok">সঠিক উত্তর: {r.answer}</div>
                  <Expl q={r} />
                </div>
              })}
              {revOnlyWrong && result.rev.every(r => r.ua != null && r.options[r.ua] === r.answer) && <div className="note"><b>দারুণ! কোনো ভুল নেই।</b> সব প্রশ্নে সঠিক উত্তর দিয়েছো। 🏆</div>}
            </div>}
          </section>
        </>}

        {/* ================= LOGIN ================= */}
        {page === 'login' && <>
          <section className="sec">
            <div className="auth-wrap">
              <div className="side"><h3>ফিরে এলে <i>স্বাগতম।</i></h3><p className="muted">আপনার প্রস্তুতির প্রগ্রেস, ভুল খাতা আর র‍্যাংক — সব অপেক্ষা করছে।</p></div>
              <div className="body"><div className="eyebrow" style={{ marginBottom: 18 }}>লগইন</div>
                <form className="form" onSubmit={async e => {
                  e.preventDefault()
                  const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.pass.value })
                  if (error) { setToastMsg(error.message); return }
                  setToastMsg('লগইন সফল'); go('home')
                }}>
                  <input type="email" name="email" placeholder="ইমেইল" required />
                  <input type="password" name="pass" placeholder="পাসওয়ার্ড" required />
                  <button className="btn primary" type="submit">লগইন →</button>
                  <small className="muted">অ্যাকাউন্ট নেই? <a href="#" style={{ color: 'var(--accent)' }} onClick={e => { e.preventDefault(); go('signup') }}>সাইন আপ করুন</a></small>
                </form>
              </div>
            </div>
          </section>
        </>}

        {/* ================= SIGNUP ================= */}
        {page === 'signup' && <>
          <section className="sec">
            <div className="auth-wrap">
              <div className="side"><h3>অভ্যাস-এ <i>যোগ দিন</i></h3><p className="muted">আজই আপনার সরকারি চাকরির প্রস্তুতি শুরু করুন — সম্পূর্ণ ফ্রিতে।</p></div>
              <div className="body"><div className="eyebrow" style={{ marginBottom: 18 }}>ফ্রি অ্যাকাউন্ট</div>
                <form className="form" onSubmit={async e => {
                  e.preventDefault()
                  const { error } = await supabase.auth.signUp({
                    email: e.target.email.value, password: e.target.pass.value,
                    options: { data: { full_name: e.target.name.value, phone: e.target.phone.value, target_exam: e.target.target.value } }
                  })
                  if (error) { setToastMsg(error.message); return }
                  setToastMsg('অ্যাকাউন্ট তৈরি হয়েছে 🎓'); go('home')
                }}>
                  <input type="text" name="name" placeholder="পূর্ণ নাম" required />
                  <input type="tel" name="phone" placeholder="ফোন নম্বর" />
                  <input type="email" name="email" placeholder="ইমেইল" required />
                  <input type="password" name="pass" placeholder="পাসওয়ার্ড" required />
                  <select name="target" style={{ borderRadius: 4, padding: '10px 14px', border: '1px solid var(--line2)', background: 'var(--card)', color: 'var(--ink)', fontFamily: 'inherit' }}>
                    <option value="bcs">টার্গেট: বিসিএস</option>
                    <option value="bank">টার্গেট: ব্যাংক</option>
                    <option value="ntrca">টার্গেট: শিক্ষক নিবন্ধন</option>
                    <option value="primary">টার্গেট: প্রাথমিক</option>
                  </select>
                  <button className="btn primary" type="submit"><SheetIco id="userPlus" /> ফ্রি অ্যাকাউন্ট তৈরি করুন</button>
                </form>
              </div>
            </div>
          </section>
        </>}

        {/* ================= PROFILE ================= */}
        {page === 'profile' && user && <>
          <section className="sec">
            <div className="head"><div className="eyebrow">প্রোফাইল</div><h2>{user.user_metadata?.full_name || 'শিক্ষার্থী'}</h2></div>
            <div className="panel">
              <div className="prof">
                <span className="avwrap">
                  <img className="avimg" src={avSrc(user)} alt="" />
                  <label className="cam" title="ছবি আপলোড করুন">📷
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onPic} />
                  </label>
                </span>
                <div><b>{user.user_metadata?.full_name || 'শিক্ষার্থী'}</b><p className="muted" style={{ fontSize: '.85rem' }}>{user.email}</p>
                  {avatar && <button className="btn sm ghost" style={{ marginTop: 6 }} onClick={() => { setAvatar(null); localStorage.removeItem('asp_avatar'); setToastMsg('ছবি মুছে ফেলা হয়েছে') }}>ছবি মুছুন</button>}
                </div>
                <div className="hero-chips" style={{ marginLeft: 'auto' }}>
                  {plan && plan.id !== 'free' && <span className="hchip">💎 <b>{plan.name}</b> প্ল্যান</span>}
                  <span className="hchip">🔥 <b>{BN(streak)}</b> দিন স্ট্রিক</span>
                  <span className="hchip">🎯 {user.user_metadata?.target_exam === 'bank' ? 'ব্যাংক' : 'বিসিএস'}</span>
                </div>
              </div>
              <div className="stats" style={{ marginTop: 8 }}>
                <div className="stat"><strong>{BN(stats.exams)}</strong><span>পরীক্ষা সম্পন্ন</span></div>
                <div className="stat"><strong>{BN(stats.total ? Math.round(stats.correct / stats.total * 100) : 0)}<i>%</i></strong><span>গড় নম্বর</span></div>
                <div className="stat"><strong>{BN(wrong.length)}</strong><span>ভুল খাতায়</span></div>
                <div className="stat"><strong>{BN(stats.total)}</strong><span>প্রশ্ন সমাধান</span></div>
              </div>
            </div>

            <div className="p-grid" style={{ marginTop: 14 }}>
              <div className="pcard">
                <h4>আজকের টার্গেট</h4>
                {['২৫টি MCQ সমাধান', '১টি মডেল টেস্ট', 'কারেন্ট অ্যাফেয়ার্স ১৫ মিনিট'].map((t, i) => (
                  <label key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', cursor: 'pointer', fontSize: '.88rem', color: todo[i] ? 'var(--ink3)' : 'var(--ink2)', textDecoration: todo[i] ? 'line-through' : 'none' }}>
                    <input type="checkbox" checked={!!todo[i]} onChange={() => setTodo(td => { const n = [...td]; n[i] = !n[i]; localStorage.setItem('asp_todo_' + new Date().toDateString(), JSON.stringify(n)); return n })} style={{ accentColor: 'var(--accent)' }} />
                    {t}
                  </label>
                ))}
                <div className="bar"><i style={{ width: `${(todo.filter(Boolean).length / 3) * 100}%` }}></i></div>
              </div>

              <div className="pcard">
                <h4>বিষয়ভিত্তিক দক্ষতা</h4>
                {subjBars.length ? subjBars.map(b => (
                  <div key={b.s} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem' }}><span>{b.s}</span><b>{BN(b.avg)}%</b></div>
                    <div className="bar"><i style={{ width: `${b.avg}%` }}></i></div>
                  </div>
                )) : <p className="muted" style={{ fontSize: '.85rem' }}>পরীক্ষা দিলে এখানে বিষয়ভিত্তিক বিশ্লেষণ দেখা যাবে।</p>}
              </div>

              <div className="pcard">
                <h4>দুর্বল টপিক — আবার অনুশীলন</h4>
                {weakList.length ? <div className="chips">
                  {weakList.map(([t, v]) => (
                    <button className="chip" key={t} onClick={() => beginQuiz({ title: 'দুর্বল টপিক • ' + t, tag: v.tag === 'bank' ? 'bank' : 'bcs', subjects: [v.s], topics: [t], limit: 10, minutes: 10, fallback: [v.s] })}>
                      {t} ({BN(v.n)} ভুল)
                    </button>
                  ))}
                </div> : <p className="muted" style={{ fontSize: '.85rem' }}>দারুণ! কোনো দুর্বল টপিক নেই।</p>}
              </div>

              <div className="pcard">
                <h4>সাম্প্রতিক পরীক্ষা</h4>
                {hist.length ? hist.slice(0, 6).map((h, i) => (
                  <div className="histrow" key={i}><span>{h.t}</span><span className="pc">{BN(h.p)}%</span></div>
                )) : <p className="muted" style={{ fontSize: '.85rem' }}>এখনো কোনো পরীক্ষা দাওনি।</p>}
              </div>
            </div>

            <div className="pcard" style={{ marginTop: 14 }}>
              <h4>🎯 টার্গেট পরীক্ষা ও কাউন্টডাউন</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="chip" style={{ borderRadius: 99 }} value={goal?.name || 'বিসিএস প্রিলি'} onChange={e => { const g = { name: e.target.value, date: goal?.date || '' }; setGoal(g); localStorage.setItem('asp_goal', JSON.stringify(g)) }}>
                  {['বিসিএস প্রিলি', 'ব্যাংক লিখিত', 'এনটিআরসিএ', 'প্রাথমিক'].map(n => <option key={n}>{n}</option>)}
                </select>
                <input type="date" className="chip" style={{ borderRadius: 99 }} value={goal?.date || ''} onChange={e => { const g = { name: goal?.name || 'বিসিএস প্রিলি', date: e.target.value }; setGoal(g); localStorage.setItem('asp_goal', JSON.stringify(g)) }} />
                {goalDays != null && <span className="hchip">⏳ আর <b>{BN(goalDays)}</b> দিন</span>}
              </div>
              <p className="muted" style={{ fontSize: '.8rem', marginTop: 10 }}>🔁 স্মার্ট রিভিশন: ভুল প্রশ্ন ১ → ৩ → ৭ দিন পর আবার আসবে — ৩ বার ঠিক হলে খাতা থেকে পাশ!</p>
            </div>
            <div className="pcard" style={{ marginTop: 14 }}>
              <h4>অর্জন</h4>
              <div className="badges">
                {[
                  { e: '🎯', n: 'প্রথম পরীক্ষা', on: stats.exams >= 1 },
                  { e: '🔟', n: '১০ পরীক্ষা ক্লাব', on: stats.exams >= 10 },
                  { e: '🏆', n: '৮০%+ ক্লাব', on: hist.some(h => h.p >= 80) },
                  { e: '💯', n: 'নিখুঁত পরীক্ষা', on: hist.some(h => h.p === 100) },
                  { e: '🔥', n: '৩ দিন স্ট্রিক', on: streak >= 3 },
                  { e: '✍', n: '৫০ প্রশ্ন সমাধান', on: stats.total >= 50 }
                ].map(b => (
                  <div className={`badge ${b.on ? '' : 'off'}`} key={b.n}><span className="be">{b.e}</span>{b.n}</div>
                ))}
              </div>
            </div>

            <div className="cta"><button className="btn danger sm" onClick={async () => { await supabase.auth.signOut(); setToastMsg('লগআউট হয়েছে'); go('home') }}>লগআউট</button></div>
          </section>
        </>}

        {loading && <div className="toast show">প্রশ্ন লোড হচ্ছে…</div>}
      </main>

      {page !== 'quiz' && <nav className="bnav">
        <button className={page === 'home' ? 'on' : ''} onClick={() => go('home')}><SheetIco id="home" />হোম</button>
        <button className={page === 'exams' ? 'on' : ''} onClick={() => go('exams')}><SheetIco id="book" />পরীক্ষা</button>
        <button className={page === 'potrika' ? 'on' : ''} onClick={() => go('potrika')}><SheetIco id="news" />পত্রিকা</button>
        <button className={page === 'visual' ? 'on' : ''} onClick={() => go('visual')}><SheetIco id="image" />ভিজ্যুয়াল</button>
        <button className={sheetOpen ? 'on' : ''} onClick={() => setSheetOpen(v => !v)}><SheetIco id="menu" />আরও</button>
      </nav>}

      {page !== 'quiz' && <>
        <div className={`side-nav-bg ${sheetOpen ? 'open' : ''}`} onClick={() => setSheetOpen(false)} />
        <aside className={`side-nav ${sheetOpen ? 'open' : ''}`} aria-label="প্রধান সাইড নেভিগেশন" aria-hidden={!sheetOpen} inert={!sheetOpen}>
          <div className="side-nav-head">
            <button className="logo" onClick={() => go('home')} title="অভ্যাস"><span className="wordmark">অভ্যাস</span></button>
            <button className="ibtn" aria-label="সাইড নেভিগেশন বন্ধ করুন" onClick={() => setSheetOpen(false)}><SheetIco id="close" /></button>
          </div>
          <div className="side-nav-scroll">
            <div className="side-intro">
              <span className="eyebrow">আপনার প্রস্তুতি সহায়ক</span>
              <p>বিসিএস, ব্যাংক ও সরকারি চাকরির প্রশ্নব্যাংক, ব্যাখ্যা ও স্মার্ট রিভিশন—এক জায়গায়।</p>
            </div>

            {user ? <button className="side-user" onClick={() => go('profile')}>
              <img className="av-sm" src={avSrc(user)} alt="" />
              <span><b>{user.user_metadata?.full_name || 'শিক্ষার্থী'}</b><small>প্রোফাইল ও অগ্রগতি দেখুন</small></span>
              <span aria-hidden="true">›</span>
            </button> : <div className="side-auth">
              <button className="btn primary" onClick={() => go('login')}><SheetIco id="login" /> লগইন</button>
              <button className="btn" onClick={() => go('signup')}><SheetIco id="userPlus" /> সাইন আপ</button>
            </div>}

            <div className="side-nav-group">
              <span className="side-nav-label">প্রধান মেনু</span>
              {[
                ['home', 'home', 'হোম'], ['exams', 'book', 'পরীক্ষা'], ['potrika', 'news', 'পত্রিকা'],
                ['visual', 'image', 'ভিজ্যুয়াল জিকে'], ['daily', 'flame', 'ডেইলি চ্যালেঞ্জ'], ['leaderboard', 'trophy', 'লিডারবোর্ড']
              ].map(([to, icon, label]) => <button className={page === to ? 'on' : ''} key={to} onClick={() => go(to)}><SheetIco id={icon} /><span>{label}</span></button>)}
            </div>

            <div className="side-nav-group">
              <span className="side-nav-label">শেখা ও টুলস</span>
              {[
                ['setup', 'sliders', 'কাস্টম কুইজ'], ['review', 'book', 'ভুল পর্যালোচনা'], ['pricing', 'gem', 'প্ল্যান ও প্রাইসিং'], ['profile', 'user', 'প্রোফাইল']
              ].map(([to, icon, label]) => <button className={page === to ? 'on' : ''} key={to} onClick={() => go(to)}><SheetIco id={icon} /><span>{label}</span></button>)}
              <button onClick={() => setDark(d => !d)}><SheetIco id={dark ? 'sun' : 'moon'} /><span>{dark ? 'লাইট মোড' : 'ডার্ক মোড'}</span></button>
              <button onClick={() => { setSheetOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><SheetIco id="arrowUp" /><span>উপরে যান</span></button>
              {user && <button className="side-logout" onClick={async () => { await supabase.auth.signOut(); setToastMsg('লগআউট হয়েছে'); go('home') }}><SheetIco id="logout" /><span>লগআউট</span></button>}
            </div>

            <div className="side-info">
              <span className="side-nav-label">যোগাযোগ</span>
              <a href="mailto:support@ovvash.app"><span>✉</span><span>support@ovvash.app</span></a>
              <a href="tel:+8809611234567"><span>☎</span><span>+৮৮০ ৯৬১১-২৩৪৫৬৭</span></a>
              <p><span>⌖</span><span>ঢাকা, বাংলাদেশ</span></p>
              <p><span>◷</span><span>সাপোর্ট: সকাল ৯টা – রাত ১০টা</span></p>
              <div className="socials">
                {SOCIALS.map(s => <a className="soc" key={s.id} href={s.url} target="_blank" rel="noreferrer" title={s.name}><SocIcon id={s.id} /></a>)}
              </div>
              <small>© ২০২৬ অভ্যাস — সর্বস্বত্ব সংরক্ষিত।</small>
              <small>বিসিএস • ব্যাংক • এনটিআরসিএ • প্রাথমিক</small>
            </div>
          </div>
        </aside>
      </>}

      {/* ================= SSLCommerz চেকআউট ================= */}
      {buyPlan && payStage === 'select' && <div className="modal-bg" onClick={() => setBuyPlan(null)}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="eyebrow">সিকিউর চেকআউট</div>
          <h3 className="serif" style={{ fontSize: '1.7rem', fontWeight: 400 }}>{buyPlan.name} প্ল্যান — ৳{BN(buyPlan.price)} <span style={{ fontSize: '.85rem', color: 'var(--ink3)' }}>{buyPlan.per}</span></h3>
          <span className="lbl" style={{ marginBottom: 0 }}>পেমেন্ট মেথড বাছো</span>
          <div className="payopts">
            {PAY_METHODS.map(m => (
              <button key={m.id} className={`payopt ${payMethod === m.id ? 'on' : ''}`} onClick={() => setPayMethod(m.id)}>
                <b style={{ color: m.color }}>{m.en}</b><span>{m.name}</span>
              </button>
            ))}
          </div>
          <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={startCheckout}>🔒 SSLCommerz দিয়ে পেমেন্ট করুন →</button>
          <small className="muted" style={{ fontSize: '.74rem', lineHeight: 1.7 }}>
            {isLive() ? '✓ SSLCommerz লাইভ গেটওয়ে সংযুক্ত' : 'এখন Sandbox মোড — মার্চেন্ট অ্যাকাউন্ট (Store ID) যুক্ত করলেই রিয়েল পেমেন্ট চালু হবে'} · ৭ দিনের মানি-ব্যাক গ্যারান্টি
          </small>
          <button className="btn ghost sm" onClick={() => setBuyPlan(null)}>বাতিল</button>
        </div>
      </div>}

      {/* ---- SSLCommerz গেটওয়ে স্ক্রিন ---- */}
      {buyPlan && payStage !== 'select' && <div className="gw-bg">
        <div className="gw-card">
          <div className="gw-head"><b>SSL</b>Commerz <span className={`gw-sbx ${isLive() ? 'live' : ''}`}>{isLive() ? 'LIVE' : 'SANDBOX'}</span></div>
          {payStage === 'gateway' && <>
            <div className="gw-row"><span>মার্চেন্ট</span><b>{SSLCZ.merchantName}</b></div>
            <div className="gw-row"><span>ট্রানজেকশন আইডি</span><b className="num">{trxId}</b></div>
            <div className="gw-row"><span>পেমেন্ট মেথড</span><b>{(PAY_METHODS.find(m => m.id === payMethod) || {}).name}</b></div>
            <div className="gw-amt">৳{BN(buyPlan.price)}<span>{buyPlan.per}</span></div>
            <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={confirmPay}>✓ পেমেন্ট কনফার্ম করুন</button>
            <button className="btn ghost sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setPayStage('select'); setToastMsg('পেমেন্ট বাতিল হয়েছে') }}>বাতিল</button>
          </>}
          {payStage === 'processing' && <div className="gw-proc"><span className="spin" />গেটওয়ের সাথে যোগাযোগ চলছে…</div>}
          {payStage === 'success' && <div className="gw-ok"><span>✓</span><b>পেমেন্ট সফল!</b><small className="num">TrxID: {trxId}</small></div>}
        </div>
      </div>}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  )
}

export default App
