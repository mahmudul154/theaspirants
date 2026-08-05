import React, { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './styles.css'
import { supabase } from './lib/supabase.js'
import { BN, CATS, SUBJ_META, SUBJECTS, QCOUNT, LIVE, BOARD, QB, TOPICS, CAT_SUBJECTS, EXAM_CARDS, localPool, mixQuestions } from './data.js'

const load = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f } }
const Md = ({ s }) => <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{String(s || '')}</Markdown>

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
  { t: '৪৭তম বিসিএস প্রিলিমিনারি রুটিন প্রকাশ', d: 'আজ' },
  { t: 'সোনালী ব্যাংক অফিসার নিয়োগ বিজ্ঞপ্তি', d: '২ দিন আগে' },
  { t: 'প্রাথমিক সহকারী শিক্ষক লিখিত ফলাফল', d: '৪ দিন আগে' },
  { t: 'এনটিআরসিএ স্কুল পর্যায় নিবন্ধন শুরু', d: '১ সপ্তাহ আগে' }
]
function calcStreak(days) {
  const set = new Set(days); const d = new Date()
  if (!set.has(d.toDateString())) d.setDate(d.getDate() - 1)
  let n = 0
  while (set.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1) }
  return n
}

export function App() {
  const [page, setPage] = useState('home')
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState(null)
  const [wrong, setWrong] = useState(() => load('asp_wrong', []))
  const [stats, setStats] = useState(() => load('asp_stats', { exams: 0, correct: 0, total: 0 }))
  const [toastMsg, setToastMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const [wiz, setWiz] = useState({ step: 1, cat: null, sub: null, topics: [], limit: 25, time: 20 })
  const [cCat, setCCat] = useState('bcs')
  const [cSubs, setCSubs] = useState(['বাংলা', 'গাণিতিক যুক্তি'])
  const [cCount, setCCount] = useState(25)
  const [cTime, setCTime] = useState(20)

  const [quiz, setQuiz] = useState(null)
  const [arm, setArm] = useState(false)
  const [result, setResult] = useState(null)
  const [showRev, setShowRev] = useState(false)
  const [lbData, setLbData] = useState(null)
  const [profData, setProfData] = useState(null)
  const [q, setQ] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [hist, setHist] = useState(() => load('asp_hist', []))
  const [todo, setTodo] = useState(() => load('asp_todo_' + new Date().toDateString(), [false, false, false]))
  const [avatar, setAvatar] = useState(() => localStorage.getItem('asp_avatar') || null)

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToastMsg(''), 2400); return () => clearTimeout(t) }, [toastMsg])

  useEffect(() => {
    if (!quiz || page !== 'quiz') return
    const t = setInterval(() => setQuiz(q => q ? { ...q, left: q.left - 1 } : q), 1000)
    return () => clearInterval(t)
  }, [quiz?.title, page])
  useEffect(() => { if (quiz && quiz.left <= 0) finish() }, [quiz?.left])

  function go(p) {
    if (p === 'profile' && !user) p = 'login'
    setPage(p); window.scrollTo({ top: 0 }); setArm(false)
    if (p === 'leaderboard') fetchLeaderboard()
    if (p === 'profile') fetchProfile()
  }

  async function beginQuiz({ title, tag, subjects, topics, limit, minutes, fallback }) {
    setLoading(true)
    let rows = null
    try {
      let q = supabase.from('mcq_questions_job').select('*')
      if (topics && topics.length) q = q.in('topic', topics)
      else if (subjects && subjects.length) q = q.in('subject', subjects)
      if (tag === 'bcs' || tag === 'bank') q = q.eq('exam_tag', tag)
      const { data, error } = await q
      if (!error && data && data.length) rows = data
    } catch (e) { console.error('Fetch Error:', e) }
    if (!rows) rows = (Array.isArray(fallback) ? fallback : SUBJECTS).flatMap(s => localPool(s))
    const qs = mixQuestions(rows, limit)
    setLoading(false)
    if (!qs.length) { setToastMsg('প্রশ্ন পাওয়া যায়নি'); return }
    setResult(null); setShowRev(false); setArm(false)
    setQuiz({ title, qs, ans: Array(qs.length).fill(null), mark: Array(qs.length).fill(false), left: minutes * 60, subj: (subjects && subjects[0]) || (Array.isArray(fallback) ? fallback[0] : null) || 'মিশ্র' })
    go('quiz')
  }

  function finish() {
    if (!quiz) return
    const { qs, ans } = quiz
    let ok = 0, bad = 0, skip = 0
    const rev = []
    const newWrong = [...wrong]
    qs.forEach((q, i) => {
      const isOk = ans[i] != null && q.options[ans[i]] === q.answer
      if (ans[i] == null) skip++
      else if (isOk) ok++
      else { bad++; newWrong.push(q) }
      rev.push({ ...q, ua: ans[i] })
    })
    const w = newWrong.slice(-100)
    setWrong(w); localStorage.setItem('asp_wrong', JSON.stringify(w))
    const st = { exams: stats.exams + 1, correct: stats.correct + ok, total: stats.total + qs.length }
    setStats(st); localStorage.setItem('asp_stats', JSON.stringify(st))
    const pct = Math.round((Math.max(0, ok - bad * .5)) / qs.length * 100)
    const h2 = [{ t: quiz.title, s: quiz.subj || 'মিশ্র', p: pct, d: new Date().toDateString() }, ...hist].slice(0, 60)
    setHist(h2); localStorage.setItem('asp_hist', JSON.stringify(h2))
    setResult({ ok, bad, skip, pct, rev, title: quiz.title })
    setQuiz(null)
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

  const jump = i => document.getElementById('qcard-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const mmss = quiz ? `${BN(String(Math.max(0, Math.floor(quiz.left / 60))).padStart(2, '0'))}:${BN(String(Math.max(0, quiz.left % 60)).padStart(2, '0'))}` : ''
  const searchRes = q.trim().length > 1 ? SUBJECTS.flatMap(sb => (TOPICS[sb] || []).filter(t => t.includes(q.trim())).map(t => ({ sb, t }))).slice(0, 6) : []
  const streak = calcStreak(hist.map(h => h.d))
  const subjAgg = {}
  hist.forEach(h => { (subjAgg[h.s] ||= { sum: 0, n: 0 }); subjAgg[h.s].sum += h.p; subjAgg[h.s].n++ })
  const subjBars = Object.entries(subjAgg).map(([k, v]) => ({ s: k, avg: Math.round(v.sum / v.n) })).sort((a, b) => b.avg - a.avg).slice(0, 5)
  const weak = {}
  wrong.forEach(w => { if (w.topic) { (weak[w.topic] ||= { n: 0, s: w.subject || 'বাংলা', tag: w.exam_tag }); weak[w.topic].n++ } })
  const weakList = Object.entries(weak).sort((a, b) => b[1].n - a[1].n).slice(0, 4)
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
      <header>
        <div className="hdr-in">
          <button className="logo" onClick={() => go('home')} title="অনুশীলন">
            <span className="wordmark">অনুশীলন</span>
          </button>
          <nav>
            <button className={page === 'home' ? 'active' : ''} onClick={() => go('home')}>হোম</button>
            <button className={page === 'exams' ? 'active' : ''} onClick={() => go('exams')}>পরীক্ষা</button>
            <button className={page === 'leaderboard' ? 'active' : ''} onClick={() => go('leaderboard')}>লিডারবোর্ড</button>
          </nav>
          <div className="hdr-right">
            <button className="ibtn wide" onClick={() => go('setup')}>🛠 কাস্টম কুইজ</button>
            <button className="ibtn" onClick={() => setDark(d => !d)}>{dark ? '☀' : '☾'}</button>
            {user
              ? <button className="ibtn" style={{ border: 'none', padding: 0, width: 38, height: 38 }} title="প্রোফাইল" onClick={() => go('profile')}>
                  <img className="av-sm" src={avSrc(user)} alt="profile" />
                </button>
              : <button className="ibtn wide" onClick={() => go('login')}>লগইন</button>}
            <button className="ibtn burger" onClick={() => go('exams')}>≡</button>
          </div>
        </div>
      <div className="topbar">
        <div className="search"><span>🔍</span><input placeholder="টপিক খুঁজুন… (সন্ধি, শতকরা…)" value={q} onChange={e => setQ(e.target.value)} /></div>
        <button className="ibtn notif" onClick={() => setNotifOpen(v => !v)}>🔔<span className="ndot" /></button>
        {q.trim().length > 1 && <div className="sres">
          {searchRes.length ? searchRes.map((r, i) => (
            <button key={i} onClick={() => { setWiz({ step: 2, cat: CAT_SUBJECTS.bcs.includes(r.sb) ? 'bcs' : 'bank', sub: r.sb, topics: [r.t], limit: 25, time: 20 }); setQ(''); go('exams') }}>
              <span>{r.t}</span><span style={{ color: 'var(--ink3)' }}>{r.sb}</span>
            </button>
          )) : <button>কিছু পাওয়া যায়নি</button>}
        </div>}
        {notifOpen && <div className="npanel">
          <div className="nh">🔔 নোটিফিকেশন</div>
          {NOTICES.map((n, i) => <div className="ni" key={i}><b>{n.t}</b><small>{n.d}</small></div>)}
        </div>}
      </div>
      </header>

      <main style={page === 'quiz' ? { paddingBottom: 140 } : undefined}>
        {/* ================= HOME (edtech app landing) ================= */}
        {page === 'home' && <>
          <section className="hero-panel">
            <div className="eyebrow">অনুশীলন — Govt Job Exam App</div>
            <h1>চাকরির পরীক্ষায় <i>নিশ্চিত সাফল্য</i>, এক অ্যাপে।</h1>
            <p className="lead muted" style={{ maxWidth: '58ch' }}>বিসিএস ও ব্যাংক জবের <b>১.৫ লাখ+</b> প্রশ্নের ব্যাংক থেকে তৈরি করুন কাস্টম কুইজ — প্রতিটি প্রশ্নের <b>ব্যাখ্যাসহ</b>। বিশ্লেষণ করুন দুর্বলতা, এগিয়ে থাকুন প্রতিযোগিতায়।</p>
            <div className="cta" style={{ marginTop: 6 }}>
              <button className="btn primary" onClick={() => go('exams')}>অনুশীলন শুরু করুন →</button>
              <button className="btn ghost" onClick={() => go('setup')}>🛠 কাস্টম কুইজ</button>
            </div>
            <div className="hero-chips" style={{ marginTop: 10 }}>
              <span className="hchip"><b>১.৫ লাখ+</b> প্রশ্ন</span>
              <span className="hchip"><b>১০,০০+</b> শিক্ষার্থী</span>
              <span className="hchip"><b>২২</b> ক্যাটাগরি</span>
              <span className="hchip"><b>১১</b> বিষয়</span>
              <span className="hchip"><b>✓</b> ব্যাখ্যাসহ সমাধান</span>
            </div>
          </section>

          <section className="sec">
            <div className="head"><div className="eyebrow">লাইভ এরিনা</div><h2 style={{ marginTop: 10 }}>চলমান <i>পরীক্ষা</i></h2></div>
            <div className="slider">
              {LIVE.map((x, i) => (
                <button className="live-card" key={i} onClick={() => beginQuiz({ title: `${x.tag} লাইভ • ${x.sub}`, tag: x.tag === 'BANK' ? 'bank' : 'bcs', subjects: [x.subj], topics: [x.top], limit: 10, minutes: 10, fallback: [x.subj] })}>
                  <span className={`tag ${x.tag === 'BANK' ? 'bank' : x.tag === 'GEN' ? 'gen' : 'bcs'}`}>{x.tag} লাইভ</span>
                  <h3>{x.sub}</h3>
                  <div className="top">{x.top}</div>
                  <div className="meta"><span>{BN(x.q)} টি প্রশ্ন</span><span>{BN(x.min)} মিনিট</span></div>
                  <span className="go">যোগ দিন →</span>
                </button>
              ))}
            </div>
          </section>

          <section className="sec">
            <div className="head" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap' }}>
              <div><div className="eyebrow">টার্গেট বাছো</div><h2 style={{ marginTop: 10 }}>কোন <i>পরীক্ষা</i> দিবে?</h2></div>
            </div>
            <div className="cat-scroll">
              {APP_CATS.map(c => (
                <button className="cat-card" key={c.id} onClick={() => {
                  if (c.id === 'bcs' || c.id === 'bank') { setWiz({ step: 2, cat: c.id, sub: null, topics: [], limit: 25, time: 20 }); go('exams') }
                  else { setToastMsg('শীঘ্রই আসছে: ' + c.name) }
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
                <button className="tile" key={s} onClick={() => { setWiz({ step: 2, cat: CAT_SUBJECTS.bcs.includes(s) ? 'bcs' : 'bank', sub: s, topics: [], limit: 25, time: 20 }); go('exams') }}>
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

        {/* ================= EXAMS ================= */}
        {page === 'exams' && <>
          <section className="sec">
            <div className="head">
              <div className="eyebrow">পরীক্ষা বাছাই করো</div>
              <h2>ক্যাটাগরি → বিষয় → টপিক, <i>তারপর শুরু।</i></h2>
            </div>

            {wiz.step === 1 && <div className="cat-scroll">
              {EXAM_CARDS.map(c => (
                <button className="cat-card" key={c.id} onClick={() => setWiz(w => ({ ...w, step: 2, cat: c.id, sub: null, topics: [] }))}>
                  <div className="im"><img src={c.img} alt={c.name} /></div>
                  <div className="bd"><b>{c.name}</b><span>{c.id === 'bcs' ? '১০টি বিষয়, সব টপিক' : '৬টি বিষয়, শর্টকাটসহ'}</span></div>
                </button>
              ))}
            </div>}

            {wiz.step >= 2 && wiz.cat && <div className="panel">
              <h3>{wiz.cat === 'bcs' ? 'বিসিএস' : 'ব্যাংক'} — <i>বিষয় ও টপিক</i></h3>
              <div><span className="lbl">বিষয়</span>
                <div className="chips">
                  {(CAT_SUBJECTS[wiz.cat] || []).map(s => (
                    <button className={`chip ${wiz.sub === s ? 'on' : ''}`} key={s} onClick={() => setWiz(w => ({ ...w, sub: s, topics: [] }))}>
                      <Ico id={s} size={14} /> {s}
                    </button>
                  ))}
                </div>
              </div>
              {wiz.sub && <div><span className="lbl">টপিক ({BN(TOPICS[wiz.sub]?.length || 0)}টি — একাধিক বাছা যাবে)</span>
                <div className="chips">
                  {(TOPICS[wiz.sub] || []).map(t => (
                    <button className={`chip ${wiz.topics.includes(t) ? 'on' : ''}`} key={t}
                      onClick={() => setWiz(w => ({ ...w, topics: w.topics.includes(t) ? w.topics.filter(x => x !== t) : [...w.topics, t] }))}>
                      {t}{QCOUNT[t] ? <span className="cnt">{BN(QCOUNT[t])}+</span> : null}
                    </button>
                  ))}
                </div>
              </div>}
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <div><span className="lbl">প্রশ্নসংখ্যা</span>
                  <div className="chips">{[10, 25, 50].map(n => <button className={`chip ${wiz.limit === n ? 'on' : ''}`} key={n} onClick={() => setWiz(w => ({ ...w, limit: n }))}>{BN(n)}</button>)}</div>
                </div>
                <div><span className="lbl">সময় (মিনিট)</span>
                  <div className="chips">{[10, 20, 30].map(n => <button className={`chip ${wiz.time === n ? 'on' : ''}`} key={n} onClick={() => setWiz(w => ({ ...w, time: n }))}>{BN(n)}</button>)}</div>
                </div>
              </div>
              <div className="cta">
                <button className="btn ghost" onClick={() => setWiz(w => ({ ...w, step: 1 }))}>← পেছনে</button>
                <button className="btn primary" onClick={() => {
                  if (!wiz.sub) { setToastMsg('আগে একটি বিষয় বাছো'); return }
                  beginQuiz({
                    title: `${wiz.cat === 'bcs' ? 'বিসিএস' : 'ব্যাংক'} • ${wiz.sub}${wiz.topics.length ? ' • ' + wiz.topics[0] : ''}`,
                    tag: wiz.cat, subjects: [wiz.sub], topics: wiz.topics, limit: wiz.limit, minutes: wiz.time, fallback: [wiz.sub]
                  })
                }}>পরীক্ষা শুরু করো →</button>
              </div>
            </div>}
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
            <div className="head"><div className="eyebrow">স্মার্ট লার্নিং</div><h2>কাস্টম <i>কুইজ</i> বানাও</h2></div>
            <div className="panel">
              <div><span className="lbl">ক্যাটাগরি</span>
                <div className="chips">
                  <button className={`chip ${cCat === 'bcs' ? 'on' : ''}`} onClick={() => { setCCat('bcs'); setCSubs(['বাংলা']) }}>🎓 বিসিএস</button>
                  <button className={`chip ${cCat === 'bank' ? 'on' : ''}`} onClick={() => { setCCat('bank'); setCSubs(['গাণিতিক যুক্তি']) }}>🏦 ব্যাংক</button>
                </div>
              </div>
              <div><span className="lbl">বিষয় বাছো (এক বা একাধিক)</span>
                <div className="chips">
                  {CAT_SUBJECTS[cCat].map(s => (
                    <button className={`chip ${cSubs.includes(s) ? 'on' : ''}`} key={s} onClick={() => setCSubs(c => c.includes(s) ? (c.length > 1 ? c.filter(x => x !== s) : c) : [...c, s])}>
                      <Ico id={s} size={14} /> {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <div><span className="lbl">প্রশ্নসংখ্যা</span>
                  <div className="chips">{[10, 25, 50].map(n => <button className={`chip ${cCount === n ? 'on' : ''}`} key={n} onClick={() => setCCount(n)}>{BN(n)}</button>)}</div>
                </div>
                <div><span className="lbl">সময় (মিনিট)</span>
                  <div className="chips">{[10, 20, 30].map(n => <button className={`chip ${cTime === n ? 'on' : ''}`} key={n} onClick={() => setCTime(n)}>{BN(n)}</button>)}</div>
                </div>
              </div>
              <div className="cta"><button className="btn primary" onClick={() => beginQuiz({ title: 'কাস্টম কুইজ', tag: cCat, subjects: cSubs, limit: cCount, minutes: cTime, fallback: cSubs })}>পরীক্ষা শুরু করো →</button></div>
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
                : <><h3>আজকের <i>মিশ্র চ্যালেঞ্জ</i></h3><p className="muted">সব বিষয় মিলিয়ে ১০টি প্রশ্ন — ১০ মিনিট। দিনে একবার।</p><div className="cta"><button className="btn primary" onClick={() => { localStorage.setItem('asp_daily', new Date().toDateString()); beginQuiz({ title: 'ডেইলি চ্যালেঞ্জ', tag: 'bcs', subjects: CAT_SUBJECTS.bcs, limit: 10, minutes: 10, fallback: SUBJECTS }) }}>অংশ নিন →</button></div></>}
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

        {/* ================= QUIZ (সব প্রশ্ন এক পেজে) ================= */}
        {page === 'quiz' && quiz && <>
          <div className="pal">
            <div className="pal-in">
              {quiz.qs.map((_, i) => (
                <button key={i} className={`${quiz.ans[i] != null ? 'done' : ''} ${quiz.mark[i] ? 'mk' : ''}`} onClick={() => jump(i)}>{BN(i + 1)}</button>
              ))}
            </div>
          </div>

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
            <div className="cta">
              <button className="btn primary" onClick={() => setShowRev(v => !v)}>{showRev ? 'ব্যাখ্যা লুকান' : 'উত্তর ও ব্যাখ্যা দেখুন'}</button>
              <button className="btn ghost" onClick={() => go('home')}>হোমে ফিরুন</button>
            </div>
            {showRev && <div style={{ marginTop: 26 }}>
              {result.rev.map((r, i) => (
                <div className="rev-item" key={i}>
                  <div className="q">{BN(i + 1)}. <Md s={r.question} /></div>
                  <div className={`a ${r.ua != null && r.options[r.ua] === r.answer ? 'ok' : 'bad'}`}>আপনার উত্তর: {r.ua == null ? '—' : r.options[r.ua]}</div>
                  <div className="a ok">সঠিক উত্তর: {r.answer}</div>
                  <Expl q={r} />
                </div>
              ))}
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
              <div className="side"><h3>অনুশীলন-এ <i>যোগ দিন</i></h3><p className="muted">আজই আপনার সরকারি চাকরির প্রস্তুতি শুরু করুন — সম্পূর্ণ ফ্রিতে।</p></div>
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
                  <button className="btn primary" type="submit">ফ্রি অ্যাকাউন্ট তৈরি করুন 🎓</button>
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

      <footer><div className="ft-in">
        <button className="logo" title="অনুশীলন"><span className="wordmark sm">অনুশীলন</span></button>
        <small>© ২০২৬ অনুশীলন — বিসিএস, ব্যাংক ও সরকারি চাকরির প্রস্তুতির বিশ্বস্ত প্ল্যাটফর্ম।</small>
      </div></footer>

      {page !== 'quiz' && <nav className="bnav">
        <button className={page === 'home' ? 'on' : ''} onClick={() => go('home')}><i>⌂</i>হোম</button>
        <button className={page === 'exams' ? 'on' : ''} onClick={() => go('exams')}><i>✎</i>পরীক্ষা</button>
        <button className={page === 'setup' ? 'on' : ''} onClick={() => go('setup')}><i>🛠</i>কুইজ</button>
        <button className={page === 'leaderboard' ? 'on' : ''} onClick={() => go('leaderboard')}><i>≡</i>বোর্ড</button>
        <button className={page === 'profile' ? 'on' : ''} onClick={() => go(user ? 'profile' : 'login')}>
          {user ? <img className="av-xs" src={avSrc(user)} alt="" /> : <i>◉</i>}প্রোফাইল
        </button>
      </nav>}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  )
}

export default App
