import React, { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Capacitor, registerPlugin } from '@capacitor/core'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './styles.css'
import INITIAL_QUESTION_COUNTS from './question-counts.json'
import QUESTION_BANK from './question-bank-data.json'
import { supabase } from './lib/supabase.js'
import { BN, CATS, SUBJ_META, SUBJECTS, QB, TOPICS, CAT_SUBJECTS, dbSubjectsFor, dbTopicsFor, localPool, mixQuestions, CIRCULARS, POTRIKA, WRITTEN_TOPICS, VISUALS } from './data.js'
import { buildDailyLiveExams, FORTY_DAY_PRELI_PREPARATION, formatExamCountdown, formatLiveExamDate, formatLiveExamTime } from './live-exams.js'
import { LIVE_TEST_ALLOWED_EXAM_ID, LIVE_TEST_ADDITIONAL_EXAM_IDS, canRunLiveTest } from './live-test-access.js'

const questionCountCache = new Map()
const appearedQuestionCountCache = new Map()
// The Android bridge explicitly targets Chrome instead of allowing the Gemini
// app to claim its own web link. On the web this plugin proxy is never called.
const ChromeBrowser = registerPlugin('ChromeBrowser')
// The restricted testing link can only activate the explicitly allowlisted
// pre-launch test configured in `live-test-access.js`.
const LIVE_TEST_EXAM_ID = typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('live-test') || '')
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000
const dhakaDateKey = (now = Date.now(), dayOffset = 0) => {
  const dhakaNow = new Date(now + DHAKA_OFFSET_MS)
  const day = new Date(Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), dhakaNow.getUTCDate() + dayOffset))
  return `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`
}
const dhakaDateLabel = dateKey => new Intl.DateTimeFormat('bn-BD', {
  timeZone: 'Asia/Dhaka', day: 'numeric', month: 'long', year: 'numeric'
}).format(new Date(`${dateKey}T12:00:00+06:00`))
const load = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f } }
const Md = ({ s }) => <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{String(s || '')}</Markdown>

const ICOS = {
  notebook: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 8h6M9 12h6M9 16h3" /><path d="M8 3v3M12 3v3M16 3v3" /></>,
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
const SUBJ_ICON = { 'English': 'notebook', 'বাংলা': 'pen', 'বিজ্ঞান': 'flask', 'গাণিতিক যুক্তি': 'calc', 'মানসিক দক্ষতা': 'bulb', 'বাংলাদেশ বিষয়াবলি': 'map', 'আন্তর্জাতিক বিষয়াবলি': 'globe', 'কম্পিউটার ও তথ্য প্রযুক্তি': 'monitor', 'নৈতিকতা, মূল্যবোধ ও সুশাসন': 'scale', 'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা': 'mountain', 'Microcontroller': 'cpu' }
const ROUTINE_SUBJECT_LABELS = {
  English: 'ইংরেজি',
  'গাণিতিক যুক্তি': 'গণিত'
}
const liveExamSubjectHeading = exam => [...new Set((exam?.questionPlan || []).map(part => ROUTINE_SUBJECT_LABELS[part.subject] || part.subject))].join(' • ') || exam?.subject || ''

// Keep mathematics topics readable in the custom-quiz picker instead of
// presenting one long, unstructured list. The database topic names remain
// unchanged; this only controls their visual grouping.
const MATH_TOPIC_GROUPS = [
  { label: 'সংখ্যা ও প্রাথমিক গণিত', topics: ['Number System', 'Number Theory', 'বাস্তব সংখ্যা', 'সংখ্যা ভিত্তিক', 'ক্রমিক সংখ্যা', 'Decimals', 'Fractions', 'Arithmetic', 'গড়', 'সাধারণ নিয়ম', 'গ.সা.গু. ও ল.সা.গু.', 'একক রূপান্তর', 'ওজন ও আয়তন'] },
  { label: 'অনুপাত, শতকরা ও বাণিজ্যিক গণিত', topics: ['অনুপাত ও সমানুপাত', 'Ratio and Proportion', 'Ratio & Proportion', 'জ্যামিতিক অনুপাত', 'বয়স ভিত্তিক', 'অনুপাতের প্রকারভেদ', 'সমানুপাত', 'ধারাবাহিক অনুপাত', 'মৌলিক অনুপাত', 'অনুপাত ভিত্তিক', 'ব্যবসায়িক অনুপাত', 'অনুপাত সরলীকরণ', 'অনুপাত তুলনা', 'শতকরা', 'Percentage', 'লাভ ও ক্ষতি', 'শতকরা লাভ-ক্ষতি', 'সরল ও যৌগিক মুনাফা', 'Financial Mathematics', 'ক্রয়মূল্য নির্ণয়', 'মুদ্রা ভিত্তিক'] },
  { label: 'কাজ, সময়, গতি ও মিশ্রণ', topics: ['মিশ্রণ', 'কাজ ও সময়', 'নল ও চৌবাচ্চা', 'Speed, Distance & Time', 'Boat & Stream', 'ক্রিকেট ও রান', 'গতিবেগ', 'খাদ্য ও সৈন্য'] },
  { label: 'বীজগণিত ও সমীকরণ', topics: ['Algebra', 'Indices', 'উৎপাদক বিশ্লেষণ', 'মিডল টার্ম', 'Factorization', 'সরল সমীকরণ', 'দ্বিপদী সমীকরণ', 'লগারিদম', 'Logarithm', 'Inequality', 'মান নির্ণয়', 'অন্বয় ও ফাংশন', 'সেট', 'Set Theory', 'ঘনফলের সূত্র', 'বর্গের অন্তর', 'ভাগশেষ উপপাদ্য', 'বর্গের পূর্ণরূপ', 'সূত্র', 'বিশেষ উৎপাদক'] },
  { label: 'ধারা, বিন্যাস, সম্ভাবনা ও পরিসংখ্যান', topics: ['Series', 'Sequence and Series', 'বিন্যাস', 'সমাবেশ', 'Permutation and Combination', 'সম্ভাব্যতা', 'Probability', 'পরিসংখ্যান', 'Statistics'] },
  { label: 'জ্যামিতি, পরিমিতি ও ক্যালকুলাস', topics: ['Geometry', 'রেখা ও কোন', 'ত্রিভুজ ও ত্রিভুজ সংক্রান্ত উপপাদ্য', 'পিথাগরাসের উপপাদ্য', 'চতুর্ভুজ ও চতুর্ভুজ সঙ্ক্রান্ত উপপাদ্য', 'সুষম বহুভুজ', 'বৃত্ত ও বৃত্ত সংক্রান্ত উপপাদ্য', 'স্থানাংক ও জ্যামিতি', 'Coordinate Geometry', 'ক্ষেত্রফল ও পরিসীমা', 'পরিমিতি', 'Mensuration', 'ত্রিকোণমিতি', 'Trigonometry', 'কোণ পরিমাপ', 'মানচিত্র স্কেল', 'Calculus'] },
  { label: 'অন্যান্য', topics: ['বিসিএস', 'বিবিধ ও মিসলেনিয়াস'] }
]

const SUBJECT_TEACHERS = {
  'বাংলা': 'বাংলা বিষয়ের শিক্ষক',
  'English': 'ইংরেজি বিষয়ের শিক্ষক',
  'ইংরেজি': 'ইংরেজি বিষয়ের শিক্ষক',
  'গাণিতিক যুক্তি': 'গাণিতিক যুক্তি বিষয়ের শিক্ষক',
  'মানসিক দক্ষতা': 'মানসিক দক্ষতা বিষয়ের শিক্ষক',
  'বাংলাদেশ বিষয়াবলি': 'বাংলাদেশ বিষয়াবলি বিষয়ের শিক্ষক',
  'বাংলাদেশ বিষয়াবলি': 'বাংলাদেশ বিষয়াবলি বিষয়ের শিক্ষক',
  'বাংলাদেশ বিষয়াবলী': 'বাংলাদেশ বিষয়াবলি বিষয়ের শিক্ষক',
  'আন্তর্জাতিক বিষয়াবলি': 'আন্তর্জাতিক বিষয়াবলি বিষয়ের শিক্ষক',
  'আন্তর্জাতিক বিষয়াবলি': 'আন্তর্জাতিক বিষয়াবলি বিষয়ের শিক্ষক',
  'আন্তর্জাতিক বিষয়াবলী': 'আন্তর্জাতিক বিষয়াবলি বিষয়ের শিক্ষক',
  'বিজ্ঞান': 'বিজ্ঞান বিষয়ের শিক্ষক',
  'কম্পিউটার ও তথ্য প্রযুক্তি': 'কম্পিউটার ও তথ্যপ্রযুক্তি বিষয়ের শিক্ষক',
  'কম্পিউটার ও তথ্যপ্রযুক্তি': 'কম্পিউটার ও তথ্যপ্রযুক্তি বিষয়ের শিক্ষক',
  'নৈতিকতা, মূল্যবোধ ও সুশাসন': 'নৈতিকতা, মূল্যবোধ ও সুশাসন বিষয়ের শিক্ষক',
  'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা': 'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা বিষয়ের শিক্ষক',
  'Microcontroller': 'মাইক্রোকন্ট্রোলার বিষয়ের শিক্ষক',
  'ভিজ্যুয়াল জিকে': 'সাধারণ জ্ঞান বিষয়ের শিক্ষক'
}
const Ico = ({ id, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICOS[SUBJ_ICON[id] || 'notebook']}</svg>
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
const QUESTION_BANK_SOURCES = QUESTION_BANK.groups.flatMap(group => group.sources.map(source => ({
  ...source,
  groupId: group.id,
  groupName: group.name,
  groupLogo: group.logo,
  topicCount: new Set(source.subjects.flatMap(subject => subject.topics.map(topic => topic.name))).size,
  searchText: [group.name, source.name, ...source.subjects.flatMap(subject => [subject.name, ...subject.topics.map(topic => topic.name)])].join(' ').toLocaleLowerCase()
})))

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
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  timer: <><path d="M9 2h6" /><path d="m5.2 5.2-2.7-2.7" /><path d="m18.8 5.2 2.7-2.7" /><circle cx="12" cy="13" r="8" /><path d="M12 9v4.5l3 1.8" /><path d="M8.4 21.3 7 22.7M15.6 21.3l1.4 1.4" /></>,
  exam: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v3h6V3" /><path d="m8.5 13 2.2 2.2 4.8-5" /></>,
  news: <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  login: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></>,
  userPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>,
  bank: <><path d="m3 10 9-6 9 6" /><path d="M5 10v8M9 10v8M15 10v8M19 10v8" /><path d="M3 18h18M2 22h20" /></>,
  sparkles: <><path d="m12 3-1.1 3.2a2 2 0 0 1-1.2 1.2L6.5 8.5l3.2 1.1a2 2 0 0 1 1.2 1.2L12 14l1.1-3.2a2 2 0 0 1 1.2-1.2l3.2-1.1-3.2-1.1a2 2 0 0 1-1.2-1.2z" /><path d="m19 15-.6 1.7a1 1 0 0 1-.6.6l-1.8.7 1.8.6a1 1 0 0 1 .6.6L19 22l.6-1.8a1 1 0 0 1 .6-.6L22 19l-1.8-.7a1 1 0 0 1-.6-.6z" /><path d="m5 2-.4 1.2a1 1 0 0 1-.6.6l-1.2.4 1.2.4a1 1 0 0 1 .6.6L5 6.5l.4-1.1a1 1 0 0 1 .6-.6l1.2-.4L6 4a1 1 0 0 1-.6-.6z" /></>,
  external: <><path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  building: <><path d="M4 21V5l8-3 8 3v16" /><path d="M8 8h1M12 8h1M16 8h1M8 12h1M12 12h1M16 12h1M10 21v-5h4v5" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></>,
  school: <><path d="m3 10 9-6 9 6-9 6z" /><path d="M6 12v5c3 2 9 2 12 0v-5M21 10v7" /></>
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

function questionKey(q) {
  const id = q?.id == null ? '' : String(q.id)
  const identity = String(q?.created_at || q?.question || '')
  return `${id}::${identity}`
}

// Compact, stable 64-bit-style fingerprint for per-user question progress.
// The database `id` is not unique, so questionKey also includes created_at.
function questionFingerprint(q) {
  const value = questionKey(q)
  let first = 2166136261
  let second = 2654435769
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index)
    first = Math.imul(first ^ code, 16777619)
    second = Math.imul(second ^ code, 2246822519)
  }
  return `${(first >>> 0).toString(36)}${(second >>> 0).toString(36)}`
}

function uniqueQuestions(items) {
  const unique = new Map()
  const questions = Array.isArray(items) ? items : []
  questions.forEach(question => {
    const key = questionKey(question)
    if (!unique.has(key)) unique.set(key, question)
  })
  return [...unique.values()]
}

const REVIEW_OPTION_KEYS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ']
function ReviewOptions({ question, selectedIndex }) {
  const options = question?.options || []
  if (!options.length) return null
  return <div className="review-options" aria-label="উত্তরের সব অপশন">
    {options.map((option, index) => {
      const selected = selectedIndex === index
      const correct = option === question.answer
      const status = selected && correct ? 'আপনার উত্তর • সঠিক' : selected ? 'আপনার উত্তর' : correct ? 'সঠিক উত্তর' : ''
      return <div className={`review-option ${selected ? 'selected' : ''} ${correct ? 'correct' : ''}`} key={`${index}-${option}`}>
        <span className="review-option-key">{REVIEW_OPTION_KEYS[index] || BN(index + 1)}</span>
        <div className="review-option-text"><Md s={option} /></div>
        {status && <b className="review-option-status">{status}</b>}
      </div>
    })}
  </div>
}

function wrongAnswerOf(q) {
  return q?.revision?.selectedAnswer || q?.wrongAnswer || ''
}

function uniqueWrongQuestions(items) {
  const unique = new Map()
  const rows = Array.isArray(items) ? items : []
  rows.forEach(item => unique.set(questionKey(item), item))
  return [...unique.values()].slice(-100)
}

// Do not let a partial or altered remote result change a published live paper.
// A successful database response must be a complete answer-key set in exactly
// the teacher's fixed display order before it is allowed into the candidate UI.
function validPublishedModelRows(rows, expectedCount) {
  if (!Array.isArray(rows) || rows.length !== expectedCount) return false
  const expectedSubjects = { 'বাংলা': 40, 'বাংলাদেশ বিষয়াবলি': 30, 'মানসিক দক্ষতা': 30 }
  const actualSubjects = rows.reduce((counts, row) => {
    counts[row?.subject] = (counts[row?.subject] || 0) + 1
    return counts
  }, {})
  if (Object.entries(expectedSubjects).some(([subject, count]) => actualSubjects[subject] !== count)) return false
  return rows.every((row, index) => (
    Number(row?.display_order) === index + 1
    && typeof row?.question === 'string' && row.question.trim()
    && Array.isArray(row?.options) && row.options.length === 4
    && Number.isInteger(Number(row?.answer_index))
    && row.answer_index >= 0 && row.answer_index < row.options.length
    && row.options[row.answer_index] === row.answer
    && typeof row?.explanation === 'string' && row.explanation.trim()
  ))
}

async function loadPublishedModelRows(examId, expectedCount) {
  const { data, error } = await supabase
    .from('live_model_exam_questions')
    .select('id, display_order, source_order, subject, topic, question, options, answer, answer_index, explanation, post_name, exam_tag')
    .eq('exam_id', examId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  if (!validPublishedModelRows(data, expectedCount)) {
    throw new Error('Published live-model rows failed integrity validation')
  }
  return data
}

export function App() {
  // The supplied testing link should open straight at the relevant test card.
  const [page, setPage] = useState(() => LIVE_TEST_EXAM_ID ? 'exams' : 'home')
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState(null)
  const [wrong, setWrong] = useState(() => uniqueWrongQuestions(load('asp_wrong', [])))
  const [stats, setStats] = useState(() => load('asp_stats', { exams: 0, correct: 0, total: 0 }))
  const [toastMsg, setToastMsg] = useState('')
  // Gemini cannot natively accept a prompt from a URL, so reveal a compact
  // paste cue below the exact question after its prompt has been copied.
  const [geminiHintKey, setGeminiHintKey] = useState(null)
  const [loading, setLoading] = useState(false)

  const [questionCounts, setQuestionCounts] = useState(() => load('asp_question_counts', INITIAL_QUESTION_COUNTS))
  const subjectQuestionCount = subject => questionCounts?.subjects?.[subject]?.total || 0
  const [qbQuery, setQbQuery] = useState('')
  const [qbGroupId, setQbGroupId] = useState(null)
  const [qbVisible, setQbVisible] = useState(40)
  const [cCat, setCCat] = useState('bcs')
  const [cSubs, setCSubs] = useState(['বাংলা', 'গাণিতিক যুক্তি'])
  const [cTopics, setCTopics] = useState([])
  const [cTopicSearch, setCTopicSearch] = useState('')
  const [cCount, setCCount] = useState(25)
  const [cTime, setCTime] = useState(20)
  const [seenQuestions, setSeenQuestions] = useState([])
  const cAvailableTopics = [...new Set(cSubs.flatMap(subject => TOPICS[subject] || []))]
  const cTopicNeedle = cTopicSearch.trim().toLocaleLowerCase()
  const cVisibleTopics = cAvailableTopics.filter(topic => topic.toLocaleLowerCase().includes(cTopicNeedle))
  const cMathTopicGroups = MATH_TOPIC_GROUPS
    .map(group => ({ ...group, topics: group.topics.filter(topic => cVisibleTopics.includes(topic)) }))
    .filter(group => group.topics.length)
  const toggleMathTopicGroup = groupTopics => setCTopics(current => {
    const isSelected = groupTopics.every(topic => current.includes(topic))
    return isSelected
      ? current.filter(topic => !groupTopics.includes(topic))
      : [...new Set([...current, ...groupTopics])]
  })
  const customTopicCount = topic => cSubs.reduce((sum, subject) => sum + dbTopicsFor([topic]).reduce((topicTotal, dbTopic) => topicTotal + (questionCounts?.subjects?.[subject]?.topics?.[dbTopic] || 0), 0), 0)
  const [clock, setClock] = useState(Date.now())
  const [liveAttempts, setLiveAttempts] = useState({})
  const [liveAttemptsReady, setLiveAttemptsReady] = useState(false)
  // A published model test can collect the answer-sheet identity before launch.
  const [liveEntry, setLiveEntry] = useState(null)

  const [quiz, setQuiz] = useState(null)
  const [arm, setArm] = useState(false)
  const [result, setResult] = useState(null)
  const [showRev, setShowRev] = useState(false)
  const [lbData, setLbData] = useState(null)
  const [lbDateKey, setLbDateKey] = useState(null)
  const [lbIncludesArchive, setLbIncludesArchive] = useState(false)
  const [homeLbData, setHomeLbData] = useState(null)
  const [profData, setProfData] = useState(null)
  const [q, setQ] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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

  // A running live paper switches the home card to today's, live-updating
  // ranking. Once the paper ends, it returns to the complete previous-day list.
  const scheduledExams = buildDailyLiveExams(clock)
  const activeLiveExam = scheduledExams.find(exam => exam.status === 'live') || null
  const liveLeaderboardActive = !!activeLiveExam
  const activeLiveLeaderboardDateKey = activeLiveExam?.dateKey || null
  const todayLeaderboardDateKey = dhakaDateKey(clock)
  // The 23:30 paper continues after midnight. Keep showing that paper's board
  // until it finishes; only then switch to the next relevant exam date.
  const homeLeaderboardDateKey = activeLiveLeaderboardDateKey || dhakaDateKey(clock, -1)
  const homeLeaderboardRefreshMs = liveLeaderboardActive ? 60 * 1000 : 5 * 60 * 1000

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
    const recoveryParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const recoveryLink = recoveryParams.get('type') === 'recovery' || new URLSearchParams(window.location.search).get('recovery') === '1'
    const openPasswordRecovery = () => {
      setPage('updatePassword')
      window.scrollTo({ top: 0 })
      // Do not let a refresh reuse the one-time recovery fragment.
      if (window.location.hash || window.location.search.includes('recovery=1')) {
        window.history.replaceState({}, document.title, `${window.location.pathname}`)
      }
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (recoveryLink && data.session) openPasswordRecovery()
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      // Supabase emits PASSWORD_RECOVERY after a valid email link. Some
      // browsers emit SIGNED_IN first, so the URL-fragment fallback above is
      // also checked to keep the reset form from being skipped.
      if (event === 'PASSWORD_RECOVERY' || (recoveryLink && session)) openPasswordRecovery()
    })
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    setSeenQuestions(user?.id ? load(`asp_seen_questions_v1_${user.id}`, []) : [])
  }, [user?.id])
  useEffect(() => {
    if (!['home', 'exams', 'leaderboard'].includes(page)) return
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
      // Include both real-time and archive records so a past paper remains
      // one-attempt-only, while only real-time records enter the leaderboard.
      .like('category', 'live%')
      .then(({ data, error }) => {
        if (!active) return
        const synced = { ...localAttempts }
        if (!error) (data || []).forEach(row => {
          const scheduleId = String(row.category || '').replace(/^live(?:-archive)?:/, '')
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
    const closeOnEscape = e => {
      if (e.key !== 'Escape') return
      setSheetOpen(false)
      setSearchOpen(false)
      setNotifOpen(false)
    }
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
    if (page !== 'home') return
    let active = true
    const refresh = async () => {
      const rows = await loadLiveLeaderboard(homeLeaderboardDateKey)
      if (active) setHomeLbData(rows)
    }
    setHomeLbData(null)
    refresh()
    const timer = window.setInterval(refresh, homeLeaderboardRefreshMs)
    return () => { active = false; window.clearInterval(timer) }
  }, [page, homeLeaderboardDateKey, homeLeaderboardRefreshMs])

  // The dedicated board stays up to date while today's live exam is running.
  useEffect(() => {
    if (page !== 'leaderboard' || !homeLeaderboardDateKey) return
    // When the next paper starts, move the board to that paper automatically.
    if (lbDateKey !== homeLeaderboardDateKey && !lbIncludesArchive) {
      fetchLeaderboard(homeLeaderboardDateKey)
      return
    }
    let active = true
    const refresh = async () => {
      const rows = await loadLiveLeaderboard(lbDateKey, lbIncludesArchive)
      if (active) setLbData(rows)
    }
    refresh()
    const isActiveLiveBoard = !lbIncludesArchive && activeLiveLeaderboardDateKey === lbDateKey && liveLeaderboardActive
    const timer = window.setInterval(refresh, isActiveLiveBoard ? 60 * 1000 : 5 * 60 * 1000)
    return () => { active = false; window.clearInterval(timer) }
  }, [page, lbDateKey, lbIncludesArchive, homeLeaderboardDateKey, activeLiveLeaderboardDateKey, liveLeaderboardActive])

  useEffect(() => {
    if (!quiz || page !== 'quiz') return
    const t = setInterval(() => setQuiz(q => q ? { ...q, left: q.left - 1 } : q), 1000)
    return () => clearInterval(t)
  }, [quiz?.title, page])
  useEffect(() => {
    if (!quiz?.liveExamSecurity || page !== 'quiz') return
    let submitted = false
    const autoSubmit = reason => {
      if (submitted) return
      submitted = true
      setToastMsg(`${reason} — লাইভ পরীক্ষা স্বয়ংক্রিয়ভাবে জমা দেওয়া হয়েছে`)
      finish()
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') autoSubmit('অন্য অ্যাপ বা ট্যাব খোলা হয়েছে')
    }
    const onWindowBlur = () => {
      // Android Home/Overview and browser/app switching can emit blur before
      // visibilitychange. The short delay avoids racing the browser event.
      window.setTimeout(() => {
        if (document.visibilityState === 'hidden' || !document.hasFocus()) autoSubmit('পরীক্ষার উইন্ডো থেকে বের হওয়া হয়েছে')
      }, 0)
    }
    const onPageHide = () => autoSubmit('পরীক্ষার পেজ বন্ধ বা পরিবর্তন করা হয়েছে')
    const blockClipboard = event => event.preventDefault()
    const blockContextMenu = event => event.preventDefault()
    const blockShortcuts = event => {
      const key = String(event.key || '').toLowerCase()
      if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'x', 'u', 's', 'p'].includes(key)) event.preventDefault()
      if (key === 'f12' || key === 'printscreen') event.preventDefault()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('copy', blockClipboard)
    document.addEventListener('cut', blockClipboard)
    document.addEventListener('paste', blockClipboard)
    document.addEventListener('contextmenu', blockContextMenu)
    document.addEventListener('keydown', blockShortcuts, true)
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('pagehide', onPageHide)
    // Some Android WebViews do not dispatch blur/visibility events reliably
    // when the Home/Overview control opens another app. Poll focus as a final
    // guard so Gemini or any external app still causes an immediate submit.
    const focusWatcher = window.setInterval(() => {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) autoSubmit('পরীক্ষার উইন্ডো থেকে বের হওয়া হয়েছে')
    }, 250)
    return () => {
      window.clearInterval(focusWatcher)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('copy', blockClipboard)
      document.removeEventListener('cut', blockClipboard)
      document.removeEventListener('paste', blockClipboard)
      document.removeEventListener('contextmenu', blockContextMenu)
      document.removeEventListener('keydown', blockShortcuts, true)
      window.removeEventListener('blur', onWindowBlur)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [quiz, page])
  useEffect(() => { if (quiz && quiz.left <= 0) finish() }, [quiz?.left])

  function go(p, options = {}) {
    if (p === 'profile' && !user) p = 'login'
    setPage(p); window.scrollTo({ top: 0 }); setArm(false); setSheetOpen(false); setSearchOpen(false); setNotifOpen(false)
    if (p !== 'visual') setVSel(null)
    if (p === 'leaderboard') fetchLeaderboard(options.leaderboardDateKey || homeLeaderboardDateKey, !!options.includeArchived)
    if (p === 'profile') fetchProfile()
  }

  const seenQuestionStorageKey = () => user?.id ? `asp_seen_questions_v1_${user.id}` : null
  const readSeenQuestionSet = () => new Set(seenQuestionStorageKey() ? load(seenQuestionStorageKey(), []) : [])

  function rememberSeenQuestions(questions) {
    const storageKey = seenQuestionStorageKey()
    if (!storageKey) return true
    const next = readSeenQuestionSet()
    questions.forEach(question => next.add(questionFingerprint(question)))
    const values = [...next]
    try {
      localStorage.setItem(storageKey, JSON.stringify(values))
      setSeenQuestions(values)
      return true
    } catch (error) {
      setToastMsg('প্রশ্নের অগ্রগতি সেভ করার জায়গা পূর্ণ—ব্রাউজার স্টোরেজ খালি করুন')
      return false
    }
  }

  function resetSeenQuestionProgress(restartSetup = null) {
    if (!user?.id) { setToastMsg('আগে লগইন করুন'); return }
    if (!window.confirm('আগে দেখা সব প্রশ্নের হিসাব মুছে শুরু থেকে শুরু করবেন?')) return
    localStorage.removeItem(seenQuestionStorageKey())
    setSeenQuestions([])
    setToastMsg('প্রশ্নের অগ্রগতি রিসেট হয়েছে—এখন শুরু থেকে প্রশ্ন আসবে')
    if (restartSetup) beginQuiz(restartSetup)
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

  function startQuestionBankQuiz(source, topic, subject) {
    const questionTotal = topic ? topic.total : source.total
    const limit = Math.max(1, Math.min(200, questionTotal))
    const label = topic ? `${source.name} • ${topic.name}` : source.name
    beginQuiz({
      title: `প্রশ্নব্যাংক • ${label}`,
      subjects: topic && subject ? [subject] : source.subjects.map(item => item.name),
      topics: topic ? [topic.name] : [],
      postNames: [source.name],
      bankBuckets: topic
        ? [{ name: topic.name, total: topic.total }]
        : [...source.subjects.flatMap(item => item.topics).reduce((topics, item) => {
            topics.set(item.name, (topics.get(item.name) || 0) + item.total)
            return topics
          }, new Map())].map(([name, total]) => ({ name, total })),
      limit,
      minutes: Math.max(5, Math.ceil(limit * .8)),
      fallback: [],
      returnPage: 'questionBank'
    })
  }

  function geminiPromptFor(question) {
    const subject = String(question?.subject || question?.subj || 'সাধারণ জ্ঞান').trim()
    const teacher = SUBJECT_TEACHERS[subject] || 'সাধারণ জ্ঞান ও চাকরির প্রস্তুতি বিষয়ের শিক্ষক'
    const options = (question?.options || []).map((option, index) => `${index + 1}. ${option}`).join('\n')
    return `তুমি বাংলাদেশের চাকরির পরীক্ষার ${teacher}। নিচের MCQ-টি একজন শিক্ষার্থীকে সহজ, নির্ভুল বাংলায় বুঝিয়ে দাও। শুরুতে সঠিক উত্তরটি স্পষ্ট করে বলো। এরপর বিষয়ের নিয়ম, প্রয়োজন হলে ধাপে ধাপে সমাধান, এবং অন্য অপশনগুলো কেন ঠিক নয় তার সংক্ষিপ্ত ব্যাখ্যা দাও। দেওয়া উত্তর ও ব্যাখ্যার তথ্য কাজে লাগাবে, তবে কোনো অসামঞ্জস্য থাকলে নির্ভরযোগ্য বিষয়ভিত্তিক জ্ঞান অনুযায়ী তা সংশোধন করে জানাবে।\n\nবিষয়: ${subject}\nটপিক: ${question?.topic || 'বিবিধ'}\nপ্রশ্ন: ${question?.question || ''}\nঅপশন:\n${options}\n\nসঠিক উত্তর: ${question?.answer || 'উল্লেখ নেই'}\nদেওয়া ব্যাখ্যা: ${question?.explanation || 'নেই'}`
  }

  function copyGeminiPrompt(prompt) {
    // Start copying while the tap is still a trusted browser gesture. This is
    // more reliable on Android than copying after the external browser opens.
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(prompt)
    return new Promise((resolve, reject) => {
      const field = document.createElement('textarea')
      field.value = prompt
      field.setAttribute('readonly', '')
      field.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(field)
      field.select()
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('Copy unavailable'))
      } catch (error) {
        reject(error)
      } finally {
        field.remove()
      }
    })
  }

  function openGeminiExplanation(question) {
    const prompt = geminiPromptFor(question)
    const promptKey = questionKey(question)
    // Gemini does not guarantee native URL prefill. Keep the prompt parameter
    // for users with a compatible browser helper, and reliably copy it first
    // for everyone else to paste into Gemini's message field.
    const geminiUrl = `https://gemini.google.com/app?hl=bn&prompt=${encodeURIComponent(prompt.slice(0, 6000))}`
    const runningInNativeAndroidApp = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
    const browserLabel = runningInNativeAndroidApp ? 'Chrome' : 'নতুন ট্যাব'
    const copyAttempt = copyGeminiPrompt(prompt)
    setGeminiHintKey(promptKey)

    // Android explicitly launches this URL through the installed Chrome package,
    // rather than letting Android route the Gemini link to the Gemini app.
    if (runningInNativeAndroidApp) {
      ChromeBrowser.open({ url: geminiUrl }).catch(() => setToastMsg('Chrome খোলা যায়নি। ডিভাইসে Chrome ইনস্টল আছে কি না দেখুন।'))
    } else {
      window.open(geminiUrl, '_blank', 'noopener,noreferrer')
    }
    copyAttempt
      .then(() => setToastMsg(`${browserLabel}-এ Gemini খোলা হয়েছে—প্রম্পট কপি করা আছে।`))
      .catch(() => setToastMsg(`${browserLabel}-এ Gemini খোলা হয়েছে। প্রম্পটটি কপি করা যায়নি।`))
  }

  function launchScheduledExam(exam, candidate = null, testing = false) {
    // Archived papers remain available once, but only attempts started in the
    // scheduled live window can appear on the live leaderboard.
    const rankingEligible = !testing && Date.now() >= exam.startsAt && Date.now() < exam.endsAt
    beginQuiz({
      title: testing ? `${exam.title} • টেস্ট মোড` : exam.title,
      tag: 'bcs',
      subjects: exam.questionPlan ? [...new Set(exam.questionPlan.map(bucket => bucket.subject))] : [exam.subject],
      topics: exam.questionPlan ? [] : [exam.topic],
      rows: exam.rows || null,
      // For the audited 7 September paper, prefer the dedicated Supabase answer-key
      // table while retaining the identical bundled set as an offline-safe fallback.
      publishedExamId: exam.publishedExamId || null,
      // Source-only papers arrive in a reviewed deterministic shuffled order;
      // preserve that order instead of requesting unrelated database questions.
      preserveOrder: !!exam.rows,
      questionPlan: exam.questionPlan,
      requireDatabase: !exam.rows && !!exam.questionPlan,
      limit: exam.questions,
      minutes: exam.minutes,
      fallback: exam.questionPlan ? [] : [exam.subject],
      returnPage: 'exams',
      // A test run must not consume or sync the scheduled one-time attempt.
      scheduleId: testing ? null : exam.id,
      candidate,
      testing,
      rankingEligible,
      liveExamSecurity: !!rankingEligible || !!testing,
      once: true
    })
  }

  function startScheduledExam(exam, testing = false) {
    if (!user) {
      setToastMsg('🔒 লাইভ পরীক্ষা দিতে আগে লগইন করুন')
      go('login')
      return
    }
    if (!testing && !liveAttemptsReady) { setToastMsg('অ্যাটেম্পট যাচাই হচ্ছে—একটু অপেক্ষা করুন'); return }
    if (!testing && liveAttempts[exam.id]) { setToastMsg('✓ এই পরীক্ষাটি আপনি ইতিমধ্যে দিয়েছেন'); return }
    if (!testing && Date.now() < exam.startsAt) { setToastMsg('⏳ নির্ধারিত সময়ে পরীক্ষাটি শুরু হবে'); return }
    if (exam.collectCandidate) {
      const previous = load(`asp_live_candidate_${user.id}`, {})
      setLiveEntry({
        exam,
        testing,
        name: previous.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        institution: previous.institution || ''
      })
      return
    }
    launchScheduledExam(exam, null, testing)
  }

  function submitLiveEntry(event) {
    event.preventDefault()
    if (!liveEntry?.exam || !user?.id) return
    const form = new FormData(event.currentTarget)
    const candidate = {
      name: String(form.get('candidateName') || '').trim(),
      institution: String(form.get('candidateInstitution') || '').trim()
    }
    if (!candidate.name || !candidate.institution) {
      setToastMsg('নাম ও ইনস্টিটিউট লিখুন')
      return
    }
    localStorage.setItem(`asp_live_candidate_${user.id}`, JSON.stringify(candidate))
    const { exam, testing } = liveEntry
    setLiveEntry(null)
    launchScheduledExam(exam, candidate, testing)
  }

  async function beginQuiz(cfg) {
    if (!user) {
      setToastMsg('🔒 পরীক্ষা দিতে আগে লগইন করুন')
      go('login')
      return
    }

    const origin = cfg.returnPage || page
    const repeatSetup = cfg.once || cfg.noRepeatSetup ? null : { ...cfg, returnPage: origin }
    const { title, subjects, topics, limit, minutes, fallback } = cfg
    const requestedLimit = Math.min(200, Math.max(1, Number(limit || 10)))
    // Fresh-question mode applies to database practice. Fixed revision/visual sets
    // and one-attempt live exams intentionally retain their own exact questions.
    const avoidSeen = cfg.avoidSeen !== false && !cfg.rows && !cfg.once
    const seenQuestionSet = avoidSeen ? readSeenQuestionSet() : new Set()
    setLoading(true)
    let rows = null
    let databaseRowsArePrioritized = false
    let fetchError = null
    if (cfg.publishedExamId) {
      try {
        rows = await loadPublishedModelRows(cfg.publishedExamId, requestedLimit)
        databaseRowsArePrioritized = true
      } catch (error) {
        // The published bundle is generated from the same reviewed source and is
        // deliberately retained as a resilient fallback while the SQL seed has
        // not yet been run or a visitor is temporarily offline.
        console.warn('Published live-model table unavailable; using audited bundle:', error?.message || error)
        rows = cfg.rows || null
      }
    } else if (cfg.rows) rows = cfg.rows
    else try {
      if (cfg.questionPlan?.length) {
        // A scheduled special exam may prescribe a different number of questions
        // for each syllabus bucket. Fetch each bucket separately so the published
        // distribution remains exact, while still preferring named past-exam rows.
        const plannedQuestionKeys = new Set()
        const fetchPlanBucket = async bucket => {
          const sampleSize = Math.max(120, Number(bucket.questions || 0) * 12)
          const makeQuery = () => {
            let query = supabase.from('mcq_questions_job').select('*')
              .eq('is_active', true)
              .in('subject', dbSubjectsFor([bucket.subject]))
            if (bucket.topics?.length) query = query.in('topic', [...new Set(bucket.topics)])
            if (bucket.questionTerms?.length) {
              query = query.or(bucket.questionTerms.map(term => `question.ilike.%${term}%`).join(','))
            }
            return query.order('id', { ascending: true }).order('created_at', { ascending: true }).limit(sampleSize)
          }
          const namedResult = await makeQuery().not('post_name', 'ilike', 'bcs').neq('post_name', '')
          if (namedResult.error) throw namedResult.error
          const namedRows = uniqueQuestions(namedResult.data || [])
            .filter(question => !plannedQuestionKeys.has(questionKey(question)))
          // Keep every available named previous-exam row ahead of the generic
          // BCS fallback. Mixing the two pools together could otherwise replace
          // named rows even when they were available for this exact bucket.
          // Published fixed papers use a stable round-robin across every listed
          // topic and preserve stored option order, so no topic is silently
          // crowded out by the first database rows.
          const selectFixedRows = (sourceRows, limit) => {
            if (!bucket.topics?.length) return sourceRows.slice(0, limit)
            const byTopic = new Map(bucket.topics.map(topic => [topic, []]))
            sourceRows.forEach(question => {
              const list = byTopic.get(question.topic)
              if (list) list.push(question)
            })
            const selected = []
            while (selected.length < limit) {
              let added = false
              for (const topic of bucket.topics) {
                const list = byTopic.get(topic) || []
                if (list.length && selected.length < limit) {
                  selected.push(list.shift())
                  added = true
                }
              }
              if (!added) break
            }
            return selected
          }
          const copyFixedRows = rows => selectFixedRows(rows, Math.min(bucket.questions, rows.length))
            .map(question => ({ ...question, options: Array.isArray(question.options) ? [...question.options] : question.options }))
          const selectedNamed = bucket.fixed
            ? copyFixedRows(namedRows)
            : mixQuestions(namedRows, Math.min(bucket.questions, namedRows.length))
          const remaining = Math.max(0, bucket.questions - selectedNamed.length)
          let selectedGeneric = []
          if (remaining) {
            // A planned bucket can already contain an OR of syllabus keywords;
            // use the actual generic `bcs` value here instead of adding a second
            // PostgREST OR filter that could broaden or replace that condition.
            const genericResult = await makeQuery().ilike('post_name', 'bcs')
            if (genericResult.error) throw genericResult.error
            const genericRows = uniqueQuestions(genericResult.data || [])
              .filter(question => !plannedQuestionKeys.has(questionKey(question)))
            selectedGeneric = bucket.fixed
              ? copyFixedRows(genericRows).slice(0, remaining)
              : mixQuestions(genericRows, remaining)
          }
          const selected = [...selectedNamed, ...selectedGeneric]
          if (selected.length < bucket.questions) {
            throw new Error(`${bucket.label}: ${selected.length}/${bucket.questions}`)
          }
          return selected
        }

        const plannedBuckets = []
        for (const bucket of cfg.questionPlan) {
          const bucketRows = await fetchPlanBucket(bucket)
          plannedBuckets.push({ bucket, rows: bucketRows })
          bucketRows.forEach(question => plannedQuestionKeys.add(questionKey(question)))
        }
        // Keep supplied additions alongside the planned database selection; they
        // use the same canonical question shape and count toward the live limit.
        const fixedPaper = cfg.questionPlan.every(bucket => bucket.fixed === true)
        if (fixedPaper) {
          // Day 5 is deliberately interleaved: English → GK → Math, repeated.
          // Once a shorter bucket ends, the remaining buckets continue in the
          // same stable cycle without changing the paper for another learner.
          const cycleSubjects = ['English', 'আন্তর্জাতিক বিষয়াবলি', 'গাণিতিক যুক্তি']
          const rowsBySubject = new Map(plannedBuckets.map(({ bucket, rows: bucketRows }) => [bucket.subject, [...bucketRows]]))
          const interleavedRows = []
          let added = true
          while (added) {
            added = false
            cycleSubjects.forEach(subject => {
              const bucketRows = rowsBySubject.get(subject)
              if (bucketRows?.length) {
                interleavedRows.push(bucketRows.shift())
                added = true
              }
            })
          }
          const unusedRows = plannedBuckets
            .filter(({ bucket }) => !cycleSubjects.includes(bucket.subject))
            .flatMap(({ rows: bucketRows }) => bucketRows)
          rows = uniqueQuestions([...interleavedRows, ...unusedRows, ...(cfg.supplementalRows || [])])
        } else {
          rows = uniqueQuestions([...plannedBuckets.flatMap(({ rows: bucketRows }) => bucketRows), ...(cfg.supplementalRows || [])])
          rows.sort(() => Math.random() - .5)
        }
        databaseRowsArePrioritized = true
      } else {
      const selectedPostNames = cfg.postNames?.length ? [...new Set(cfg.postNames)] : []
      const dbSubjects = selectedPostNames.length ? [] : dbSubjectsFor(subjects)
      const selectedTopics = topics && topics.length ? dbTopicsFor(topics) : []
      const isAllBcs = !selectedPostNames.length && !selectedTopics.length && subjects?.length === CAT_SUBJECTS.bcs.length
        && CAT_SUBJECTS.bcs.every(subject => subjects.includes(subject))
      const applyQuestionFilters = query => {
        let filtered = query.eq('is_active', true)
        // Question Bank exams preserve the exact post_name value. Subject aliases
        // are intentionally skipped here so one source can combine all its topics.
        if (selectedPostNames.length === 1) filtered = filtered.eq('post_name', selectedPostNames[0])
        else if (selectedPostNames.length > 1) filtered = filtered.in('post_name', selectedPostNames)
        // The full BCS mix is the whole active job pool except Microcontroller.
        // This avoids an oversized 70+ value IN filter while retaining ~93K rows.
        else if (isAllBcs) filtered = filtered.neq('subject', 'মাইক্রোকন্ট্রোলার')
        else if (dbSubjects.length) filtered = filtered.in('subject', dbSubjects)
        if (selectedTopics.length) filtered = filtered.in('topic', selectedTopics)
        return filtered
      }

      // `post_name = bcs` (case-insensitive, exact value) is the generic/AI pool.
      // Exact Question Bank sources are already preferred by definition; elsewhere
      // any named previous exam is exhausted before the generic pool.
      const applyAppearedQuestionFilter = selectedPostNames.length
        ? query => query
        : query => query.not('post_name', 'ilike', 'bcs').neq('post_name', '')
      const applyGenericQuestionFilter = query => query
        .or('post_name.ilike.bcs,post_name.is.null,post_name.eq.')

      // Exact post_name counts can exceed Supabase's anonymous statement timeout
      // when post_name is not indexed. The catalogue already contains the exact
      // topic list and total, so a single indexed topic-IN query retrieves the
      // source without a costly count scan or one network request per topic.
      if (selectedPostNames.length === 1 && cfg.bankBuckets?.length) {
        const buckets = cfg.bankBuckets.filter(bucket => bucket?.name && bucket.total > 0)
        const bucketTopics = buckets.map(bucket => bucket.name)
        const bucketTotal = buckets.reduce((total, bucket) => total + bucket.total, 0)
        const { data, error } = await applyQuestionFilters(
          supabase.from('mcq_questions_job').select('*')
        )
          .in('topic', bucketTopics)
          .order('id', { ascending: true })
          .order('created_at', { ascending: true })
          .range(0, Math.max(0, bucketTotal - 1))
        if (error) throw error
        if (data?.length) rows = data
      } else {
        // exam_tag is intentionally not used. Regular custom quizzes use subject
        // aliases plus exact topics, with named previous-exam rows first.
        const countScope = isAllBcs ? ['all-bcs'] : dbSubjects.slice().sort()
      const countKey = JSON.stringify([countScope, selectedTopics.slice().sort()])
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
        const attempts = avoidSeen ? Math.min(6, Math.max(2, Math.ceil(poolCount / poolSize))) : 1
        let collected = []
        const usedOffsets = new Set()
        for (let attempt = 0; attempt < attempts; attempt++) {
          let offset = maxOffset ? Math.floor(Math.random() * (maxOffset + 1)) : 0
          if (usedOffsets.has(offset) && maxOffset) offset = Math.round(maxOffset * attempt / Math.max(1, attempts - 1))
          usedOffsets.add(offset)
          const { data, error } = await applyPoolFilter(applyQuestionFilters(
            supabase.from('mcq_questions_job').select('*')
          ))
            // id alone is not unique in this table; the composite order keeps range
            // pagination stable while choosing bounded windows until enough unseen
            // questions have been found.
            .order('id', { ascending: true })
            .order('created_at', { ascending: true })
            .range(offset, offset + poolSize - 1)
          if (error) throw error
          const freshData = avoidSeen
            ? (data || []).filter(question => !seenQuestionSet.has(questionFingerprint(question)))
            : (data || [])
          collected = uniqueQuestions([...collected, ...freshData])
          if (collected.length >= desiredCount || poolSize >= poolCount) break
        }
        return collected
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
      }
      }
    } catch (e) { fetchError = e; console.error('Fetch Error:', e) }
    if (cfg.requireDatabase && fetchError) {
      setLoading(false)
      setToastMsg('বিশেষ পরীক্ষার সিলেবাসভিত্তিক প্রশ্ন এখন লোড করা যায়নি—একটু পরে আবার চেষ্টা করুন')
      return
    }
    if (rows && avoidSeen) rows = rows.filter(question => !seenQuestionSet.has(questionFingerprint(question)))
    if (!rows) {
      rows = (Array.isArray(fallback) ? fallback : SUBJECTS).flatMap(subject => localPool(subject))
      if (avoidSeen) rows = rows.filter(question => !seenQuestionSet.has(questionFingerprint(question)))
    }
    rows = uniqueQuestions(rows)
    const qs = databaseRowsArePrioritized || cfg.preserveOrder ? rows.slice(0, requestedLimit) : mixQuestions(rows, requestedLimit)
    setLoading(false)
    if (!qs.length) {
      setToastMsg(avoidSeen
        ? 'এই নির্বাচনের সব প্রশ্ন দেখা হয়ে গেছে—অগ্রগতি রিসেট করে আবার শুরু করুন'
        : 'প্রশ্ন পাওয়া যায়নি')
      return
    }
    // A question counts as seen when it is placed on the answer sheet—not only
    // after submission—so abandoning an exam cannot make it appear as “new”.
    if (avoidSeen && !rememberSeenQuestions(qs)) return
    if (avoidSeen && qs.length < requestedLimit) {
      setToastMsg(`এখন ${BN(qs.length)}টি নতুন প্রশ্ন পাওয়া গেছে—তাই ${BN(requestedLimit)}টির বদলে সেগুলোই দেওয়া হয়েছে`)
    }
    setResult(null); setShowRev(false); setArm(false); setQuitArm(false)
    setQuiz({ title, qs, ans: Array(qs.length).fill(null), mark: Array(qs.length).fill(false), left: minutes * 60, subj: (subjects && subjects[0]) || (Array.isArray(fallback) ? fallback[0] : null) || 'মিশ্র', origin, setup: repeatSetup, scheduleId: cfg.scheduleId || null, candidate: cfg.candidate || null, testing: !!cfg.testing, rankingEligible: !!cfg.rankingEligible, liveExamSecurity: !!cfg.liveExamSecurity, daily: !!cfg.daily })
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
      const key = questionKey(q)
      const legacyKey = String(q.id || q.question || '')
      const previousMeta = rm[key] || rm[legacyKey]
      if (legacyKey !== key && rm[legacyKey]) delete rm[legacyKey]
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
        if (previousMeta) {
          const lv = (previousMeta.level || 1) + 1
          if (lv > 3) {
            delete rm[key]
            newWrong = newWrong.filter(item => questionKey(item) !== key)
          } else rm[key] = { level: lv, due: Date.now() + [1, 3, 7][lv - 1] * 864e5 }
        }
      } else {
        bad++
        const previousWrong = [...newWrong].reverse().find(item => questionKey(item) === key)
        const selectedAnswer = q.options[ans[i]]
        const mistakes = (previousWrong?.revision?.mistakes || 0) + 1
        newWrong = newWrong.filter(item => questionKey(item) !== key)
        newWrong.push({
          ...q,
          revision: { selectedAnswer, selectedIndex: ans[i], wrongAt: new Date().toISOString(), mistakes }
        })
        rm[key] = { level: 1, due: Date.now() + 864e5 }
      }
      rev.push({ ...q, ua: ans[i] })
    })
    const pct = Math.round((Math.max(0, ok - bad * .5)) / qs.length * 100)
    // A link-based test run remains fully functional, but it must not alter the
    // tester's revision list, profile totals, history, or official live attempt.
    if (!quiz.testing) {
      const w = uniqueWrongQuestions(newWrong)
      setWrong(w); localStorage.setItem('asp_wrong', JSON.stringify(w))
      setRevMeta(rm); localStorage.setItem('asp_rev', JSON.stringify(rm))
      const st = { exams: stats.exams + 1, correct: stats.correct + ok, total: stats.total + qs.length }
      setStats(st); localStorage.setItem('asp_stats', JSON.stringify(st))
      const h2 = [{ t: quiz.title, s: quiz.subj || 'মিশ্র', p: pct, d: new Date().toDateString() }, ...hist].slice(0, 60)
      setHist(h2); localStorage.setItem('asp_hist', JSON.stringify(h2))
      if (quiz.daily) localStorage.setItem('asp_daily', new Date().toDateString())
    }
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
        category: quiz.rankingEligible ? `live:${quiz.scheduleId}` : `live-archive:${quiz.scheduleId}`
      }).then(({ error }) => { if (error) console.warn('Live attempt sync failed:', error.message) })
    }
    const topicStats = [...topicMap.values()].map(t => ({ ...t, accuracy: Math.round(t.correct / t.total * 100) }))
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total || a.topic.localeCompare(b.topic))
    setResult({ ok, bad, skip, pct, rev, topicStats, title: quiz.title, origin: quiz.origin, setup: quiz.setup, scheduleId: quiz.scheduleId, candidate: quiz.candidate || null, testing: !!quiz.testing, rankedLive: !!quiz.rankingEligible })
    setQuiz(null)
    setRevOnlyWrong(false)
    go('result')
  }

  async function loadLiveLeaderboard(dateKey, includeArchived = false) {
    try {
      // Supabase returns at most a page of rows. Read every page so “সব ফল”
      // genuinely includes every participant from that live-exam date. A past
      // exam board includes both official live results and archived make-up runs.
      const pageSize = 1000
      const allRows = []
      const categoryPatterns = includeArchived
        ? [`live:%${dateKey}%`, `live-archive:%${dateKey}%`]
        : [`live:%${dateKey}%`]
      for (const categoryPattern of categoryPatterns) {
        for (let from = 0; ; from += pageSize) {
          const { data, error } = await supabase.from('exam_results')
            .select('user_name, user_avatar, score, user_id, created_at')
            // The schedule date in the official live ID is used instead of
            // completion time, so exams ending after midnight stay together.
            .like('category', categoryPattern)
            .order('created_at', { ascending: true })
            .range(from, from + pageSize - 1)
          if (error) throw error
          allRows.push(...(data || []))
          if (!data || data.length < pageSize) break
        }
      }
      const grouped = {}
      allRows.forEach(row => {
        const key = row.user_id || row.user_name
        grouped[key] ||= { user_name: row.user_name, user_avatar: row.user_avatar, totalScore: 0, total_exams: 0 }
        grouped[key].total_exams += 1
        grouped[key].totalScore += Number(row.score)
      })
      return Object.values(grouped)
        .map(row => ({ ...row, avgScore: (row.totalScore / row.total_exams).toFixed(1) }))
        .sort((first, second) => Number(second.avgScore) - Number(first.avgScore) || second.total_exams - first.total_exams)
    } catch (error) {
      console.error('Live leaderboard load failed:', error)
      return []
    }
  }

  async function fetchLeaderboard(dateKey = todayLeaderboardDateKey, includeArchived = false) {
    setLbDateKey(dateKey)
    setLbIncludesArchive(includeArchived)
    setLbData(null)
    setLbData(await loadLiveLeaderboard(dateKey, includeArchived))
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
  const dueList = wrong.filter(item => {
    const m = revMeta[questionKey(item)] || revMeta[String(item.id || item.question || '')]
    return m && m.due <= Date.now()
  })
  const revisionQuizRows = dueList.length ? dueList : wrong
  // Use Bangladesh time rather than the device timezone, so greetings stay correct
  // for everyone taking the exam from Bangladesh.
  const greet = () => {
    const h = new Date(clock + DHAKA_OFFSET_MS).getUTCHours()
    return h < 5 ? 'শুভ রাত্রি' : h < 12 ? 'সুপ্রভাত' : h < 15 ? 'শুভ দুপুর' : h < 18 ? 'শুভ বিকাল' : h < 20 ? 'শুভ সন্ধ্যা' : 'শুভ রাত্রি'
  }
  const goalDays = goal && goal.date ? Math.max(0, Math.ceil((new Date(goal.date) - new Date()) / 864e5)) : null
  const trend = (() => { if (hist.length < 2) return null; const a = hist.slice(0, 3), b = hist.slice(3, 6); if (!b.length) return null; const av = x => x.reduce((t, h) => t + h.p, 0) / x.length; return Math.round(av(a) - av(b)) })()
  const homeLeaderboardDate = dhakaDateLabel(homeLeaderboardDateKey)
  const leaderboardDate = dhakaDateLabel(lbDateKey || todayLeaderboardDateKey)
  const viewingTodayLeaderboard = (lbDateKey || todayLeaderboardDateKey) === todayLeaderboardDateKey
  const isTestExam = exam => !!exam
    && [LIVE_TEST_ALLOWED_EXAM_ID, ...LIVE_TEST_ADDITIONAL_EXAM_IDS].includes(exam.id)
    && canRunLiveTest(user?.email, exam.id)
    && (!LIVE_TEST_EXAM_ID || LIVE_TEST_EXAM_ID === exam.id)
  // A published special paper takes priority when it overlaps the regular 23:30
  // daily window, so its announced start time always opens the correct exam.
  const liveExam = scheduledExams.find(exam => exam.status === 'live' && exam.special)
    || scheduledExams.find(exam => exam.status === 'live')
    || null
  const upcomingExams = scheduledExams.filter(exam => exam.status === 'upcoming')
  const hasFortyDayPlan = upcomingExams.some(exam => exam.planned)
  const routineExams = hasFortyDayPlan
    ? upcomingExams.filter(exam => exam.planned)
    : upcomingExams.slice(0, 7)
  const pastExams = scheduledExams.filter(exam => exam.status === 'past').slice(-7).reverse()
  const featuredExam = liveExam || upcomingExams[0] || null
  const featuredExamIsToday = featuredExam?.dateKey === todayLeaderboardDateKey
  // Keep the home timer focused on today's paper when one is scheduled. If the
  // window is already live, it naturally changes to the time left to finish.
  const heroCountdownExam = liveExam || upcomingExams.find(exam => exam.dateKey === todayLeaderboardDateKey) || upcomingExams[0] || null
  const heroCountdownIsLive = heroCountdownExam?.status === 'live'
  const homeLiveExams = (liveExam ? [liveExam, ...upcomingExams] : upcomingExams).slice(0, 4)
  const selectedQbGroup = QUESTION_BANK.groups.find(group => group.id === qbGroupId) || null
  const qbNeedle = qbQuery.trim().toLocaleLowerCase()
  const matchingQbSources = qbNeedle
    ? QUESTION_BANK_SOURCES.filter(source => source.searchText.includes(qbNeedle))
    : selectedQbGroup
      ? QUESTION_BANK_SOURCES.filter(source => source.groupId === selectedQbGroup.id)
      : []
  const Expl = ({ q }) => {
    const explanation = q?.explanation || q?.explanation_bn || ''
    return <details className="explanation-details">
      <summary><span>ব্যাখ্যা</span></summary>
      <div className="expl explanation-content">
        {explanation ? <Md s={explanation} /> : <>সঠিক উত্তর — <b>{q?.answer}</b></>}
      </div>
    </details>
  }

  const GeminiHelp = ({ question }) => {
    const visible = geminiHintKey === questionKey(question)
    return <div className="gemini-help">
      <button className="ai-help-btn review-ai-help" title="AI দিয়ে বুঝুন" onClick={() => openGeminiExplanation(question)}><SheetIco id="sparkles" /> AI দিয়ে বুঝুন <span className="ai-help-arrow" aria-hidden="true">→</span></button>
      {visible && <small className="gemini-paste-hint" role="status">প্রম্পট কপি করা আছে—Gemini-তে Paste করলেই ব্যাখ্যা আসবে।</small>}
    </div>
  }

  const LBRow = (x, i) => (
    <div className="lb-row" key={i}>
      <span className="rk">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : BN(i + 1)}</span>
      <div className="nm">{x.n || x.user_name}<span>{BN(x.e || x.total_exams)} পরীক্ষা সম্পন্ন</span></div>
      <span className="sc">{BN(x.s || x.avgScore)}<small> % গড়</small></span>
    </div>
  )

  return (
    <div>
      {page !== 'quiz' && <header>
        <div className="hdr-in">
          <div className="hdr-left">
            <button className="ibtn menu-toggle" aria-label="সাইড নেভিগেশন খুলুন" aria-expanded={sheetOpen} onClick={() => { setSheetOpen(true); setSearchOpen(false); setNotifOpen(false) }}>
              <SheetIco id="menu" />
            </button>
            <button className="logo hdr-logo" onClick={() => go('home')} title="অভ্যাস">
              <span className="wordmark">অভ্যাস</span>
            </button>
          </div>
          <div className="hdr-right">
            <button className="ibtn notif header-notif-btn" aria-label="নোটিফিকেশন দেখুন" aria-expanded={notifOpen} title="নোটিফিকেশন" onClick={() => { setNotifOpen(value => !value); setSearchOpen(false) }}>
              <SheetIco id="bell" /><span className="ndot" />
            </button>
            <button className="ibtn wide" onClick={() => go('setup')}><SheetIco id="sliders" /> কাস্টম কুইজ</button>
            <button className="ibtn header-search-btn" aria-label="সার্চ খুলুন" aria-expanded={searchOpen} title="সার্চ" onClick={() => { setSearchOpen(value => !value); setNotifOpen(false) }}><SheetIco id="search" /></button>
            <button className="ibtn" aria-label={dark ? 'লাইট মোড' : 'ডার্ক মোড'} onClick={() => setDark(d => !d)}><SheetIco id={dark ? 'sun' : 'moon'} /></button>
            {user
              ? <button className="ibtn" style={{ border: 'none', padding: 0, width: 38, height: 38 }} title="প্রোফাইল" onClick={() => go('profile')}>
                  <img className="av-sm" src={avSrc(user)} alt="profile" />
                </button>
              : <button className="ibtn wide auth-login" onClick={() => go('login')}><SheetIco id="login" /> লগইন</button>}
          </div>

          {notifOpen && <div className="npanel header-npanel">
            <div className="nh"><span>🔔 নোটিফিকেশন</span><button aria-label="বন্ধ করুন" onClick={() => setNotifOpen(false)}>×</button></div>
            {dueList.length > 0 && <button className="ni revision-notice" onClick={() => go('review')}><b>↻ আজ {BN(dueList.length)}টি প্রশ্ন রিভিশন বাকি</b><small>এখন রিভিশন শুরু করতে ট্যাপ করুন</small></button>}
            {NOTICES.map((notice, index) => <button className="ni" key={index} onClick={() => setNotifOpen(false)}><b>{notice.t}</b><small>{notice.d}</small></button>)}
          </div>}

          {searchOpen && <div className="header-search-panel">
            <div className="search"><SheetIco id="search" /><input autoFocus aria-label="বিষয় বা টপিক সার্চ" placeholder="বিষয় বা টপিক খুঁজুন…" value={q} onChange={event => setQ(event.target.value)} /></div>
            <div className="sres">
              {q.trim().length <= 1 ? <>
                <div className="sres-h">🔥 জনপ্রিয় সার্চ</div>
                {POP_SEARCH.map(topic => <button key={topic} onClick={() => setQ(topic)}><span>{topic}</span><span>খুঁজুন →</span></button>)}
              </> : searchRes.length ? searchRes.map((result, index) => (
                <button key={index} onClick={() => { setQ(''); openCustomQuiz({ category: CAT_SUBJECTS.bcs.includes(result.sb) ? 'bcs' : 'bank', subjects: [result.sb], topics: [result.t] }) }}>
                  <span>{result.t}</span><span>{result.sb}</span>
                </button>
              )) : <div className="search-empty">কিছু পাওয়া যায়নি</div>}
            </div>
          </div>}
        </div>
      </header>}

      <main className={`page-shell page-${page} ${page === 'home' ? 'home-main' : ''} ${page === 'quiz' ? 'quiz-main' : ''}`.trim()} style={page === 'quiz' ? { paddingBottom: 140 } : undefined}>
        {/* ================= HOME (edtech app landing) ================= */}
        {page === 'home' && <>
          <section className="hero-panel">
            <h1>চাকরির পরীক্ষার <i>পূর্ণাঙ্গ প্রস্তুতি</i></h1>
            <p className="lead muted" style={{ maxWidth: '58ch' }}>নির্ধারিত লাইভ পরীক্ষায় অংশ নিন, অথবা বিষয় ও টপিক বেছে নিজের মতো কাস্টম কুইজ দিন। প্রতিটি প্রশ্নের উত্তর ও ব্যাখ্যাসহ অনুশীলন করুন।</p>
            <div className="hero-chips" style={{ marginTop: 10 }}>
              <span className="hchip"><b>১ লাখ+</b> প্রশ্ন আছে</span>
              <span className="hchip"><b>কাস্টম</b> কুইজ</span>
              <span className="hchip"><b>লাইভ</b> পরীক্ষা</span>
              <span className="hchip"><b>✓</b> ব্যাখ্যাসহ উত্তর</span>
            </div>
            <div className="cta" style={{ marginTop: 6 }}>
              <button className="btn primary" onClick={() => liveExam ? startScheduledExam(liveExam, isTestExam(liveExam)) : go('exams')}>আজকের পরীক্ষা দেখুন →</button>
              <button className="btn ghost hero-custom-quiz-btn" onClick={() => go('setup')}><span className="hero-custom-quiz-icon" aria-hidden="true"><SheetIco id="sliders" /></span>নিজের কুইজ তৈরি করুন</button>
            </div>
          </section>

          <section className="sec home-features-section">
            <div className="head"><div className="eyebrow">দ্রুত ফিচার</div><h2>সবকিছু <i>এক জায়গায়</i></h2></div>
            <div className="home-features-grid">
              <button className="home-feature-card feature-live" onClick={() => go('exams')}>
                <span className="home-feature-icon"><SheetIco id="exam" /></span>
                <span><b>লাইভ পরীক্ষা</b><small>আজকের পরীক্ষা ও রুটিন</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card feature-custom" onClick={() => go('setup')}>
                <span className="home-feature-icon"><SheetIco id="sliders" /></span>
                <span><b>কাস্টম কুইজ</b><small>বিষয় ও টপিক বেছে নিন</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card" onClick={() => go('daily')}>
                <span className="home-feature-icon"><SheetIco id="flame" /></span>
                <span><b>ডেইলি চ্যালেঞ্জ</b><small>প্রতিদিন ১০টি প্রশ্ন</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card" onClick={() => go('review')}>
                <span className="home-feature-icon"><SheetIco id="layers" /></span>
                <span><b>রিভিশন</b><small>ভুল প্রশ্ন আবার অনুশীলন</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card" onClick={() => go('questionBank')}>
                <span className="home-feature-icon"><SheetIco id="bank" /></span>
                <span><b>প্রশ্নব্যাংক</b><small>বিগত পরীক্ষার প্রশ্ন</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card" onClick={() => go('leaderboard')}>
                <span className="home-feature-icon"><SheetIco id="trophy" /></span>
                <span><b>লিডারবোর্ড</b><small>আজকের র‍্যাংকিং দেখুন</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card" onClick={() => go('potrika')}>
                <span className="home-feature-icon"><SheetIco id="news" /></span>
                <span><b>আজকের পত্রিকা</b><small>কারেন্ট অ্যাফেয়ার্স</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card" onClick={() => go('circular')}>
                <span className="home-feature-icon"><SheetIco id="file" /></span>
                <span><b>চাকরির সার্কুলার</b><small>নতুন নিয়োগ আপডেট</small></span><i aria-hidden="true">→</i>
              </button>
              <button className="home-feature-card" onClick={() => go('visual')}>
                <span className="home-feature-icon"><SheetIco id="image" /></span>
                <span><b>ছবি দিয়ে শেখো</b><small>ভিজ্যুয়াল লার্নিং</small></span><i aria-hidden="true">→</i>
              </button>
            </div>
          </section>

          <section className="sec home-smart-panel" style={{ paddingTop: 28 }}>
            <div className="panel" style={{ gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ margin: 0 }}>{greet()}, {(user?.user_metadata?.full_name || user?.name || 'শিক্ষার্থী').split(' ')[0]} 👋</h3>
                <div className="hero-chips">
                  {goalDays != null && <span className="hchip">⏳ {goal.name}: আর <b>{BN(goalDays)}</b> দিন</span>}
                  {trend != null && trend !== 0 && <span className="hchip">{trend > 0 ? '📈' : '📉'} <b>{BN(Math.abs(trend))}%</b> ট্রেন্ড</span>}
                  <span className="hchip">🔥 <b>{BN(streak)}</b> স্ট্রিক</span>
                </div>
              </div>
              <span className="lbl" style={{ margin: 0 }}>চাকরির পরীক্ষায় এগিয়ে থাকতে আজকের প্রস্তুতি গুছিয়ে নিন</span>
              <div className="chips">
                {dueList.length > 0 && <button className="chip on" onClick={() => beginQuiz({ title: 'স্মার্ট রিভিশন', rows: dueList, limit: Math.min(10, dueList.length), minutes: 10 })}>🔁 {BN(dueList.length)}টি রিভিশন due</button>}
                {subjBars.length > 0 && subjBars[subjBars.length - 1].avg < 80 && <button className="chip" onClick={() => beginQuiz({ title: 'দুর্বল বিষয় • ' + subjBars[subjBars.length - 1].s, tag: 'bcs', subjects: [subjBars[subjBars.length - 1].s], limit: 10, minutes: 10, fallback: [subjBars[subjBars.length - 1].s] })}>🎯 {subjBars[subjBars.length - 1].s} দুর্বল — ১০ প্রশ্ন</button>}
                {localStorage.getItem('asp_daily') !== new Date().toDateString() && <button className="chip" onClick={() => go('daily')}>🔥 ডেইলি চ্যালেঞ্জ</button>}
                <button className="chip" onClick={() => go('potrika')}>📰 আজকের পত্রিকা</button>
                <button className="chip" onClick={() => go('visual')}>🖼 ছবি দিয়ে শেখো</button>
                <button className="chip" onClick={() => go('exams')}>📘 নতুন টপিক ধরো</button>
                <button className="chip" onClick={() => go('questionBank')}>🏛 প্রশ্নব্যাংক</button>
              </div>
            </div>
          </section>

          <section className="sec home-live-attraction">
            <div className="head"><div className="eyebrow">লাইভ এরিনা</div><h2 style={{ marginTop: 10 }}>লাইভ পরীক্ষা ও <i>রুটিন</i></h2></div>
            <div className="slider" aria-label="লাইভ পরীক্ষার সংক্ষিপ্ত তালিকা">
              {homeLiveExams.map(exam => {
                const isToday = exam.dateKey === todayLeaderboardDateKey
                const isLive = exam.status === 'live'
                const countdown = formatExamCountdown(isLive ? exam.endsAt : exam.startsAt, clock)
                const planDay = exam.subject.match(/দিন\s+[^•]+$/)?.[0]
                const compactTitle = exam.planned ? `৪০ দিনে প্রিলি প্রস্তুতি${planDay ? ` • ${planDay}` : ''}` : exam.subject
                return <button className={`live-card ${exam.status} ${isToday ? 'today-card' : 'compact-card'}`} key={exam.id} onClick={() => isLive ? startScheduledExam(exam, isTestExam(exam)) : go('exams')}>
                  <span className={`tag ${isLive ? 'live-now' : isToday ? 'today-tag' : 'bcs'}`}>{isLive ? '● এখন লাইভ' : isToday ? 'আজকের পরীক্ষা' : 'আগামী পরীক্ষা'}</span>
                  <h3 title={exam.subject}>{isToday ? compactTitle : exam.subject}</h3>
                  <div className="top">{exam.topic}</div>
                  <div className="meta"><span>{formatLiveExamDate(exam.startsAt)}</span><span>{formatLiveExamTime(exam.startsAt)}</span></div>
                  {isToday
                    ? <span className="today-card-countdown"><small>{isLive ? 'লাইভ শেষ হতে বাকি' : 'শুরু হতে বাকি'}</small><b aria-live="polite">{countdown}</b></span>
                    : <span className="compact-countdown"><small>শুরু হতে</small><b>⏳ {countdown}</b></span>}
                </button>
              })}
            </div>
            <div className="cta"><button className="btn ghost sm" onClick={() => go('exams')}>{hasFortyDayPlan ? '৪০ দিনে প্রিলি প্রস্তুতি →' : '৭ দিনের সম্পূর্ণ রুটিন →'}</button></div>
          </section>

          <section className="sec home-circular-section">
            <div className="head circular-section-head">
              <div><div className="eyebrow">চাকরির আপডেট</div><h2>সাম্প্রতিক <i>সার্কুলার</i></h2></div>
              <button className="btn sm ghost" onClick={() => go('circular')}>সব সার্কুলার →</button>
            </div>
            <div className="circular-card-grid">
              {CIRCULARS.map(item => <button className="circular-card" key={item.title} onClick={() => go(item.page)}>
                <span className={`circular-icon circular-icon-${item.icon}`}><SheetIco id={item.icon} /></span>
                <span className="circular-card-copy"><span className="circular-tag">{item.tag}</span><b>{item.title}</b><small>{item.desc}</small></span>
                <i aria-hidden="true">→</i>
              </button>)}
            </div>
          </section>

          <section className="sec home-target-section">
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
            <div className="head"><div className="eyebrow">অনুশীলন</div><h2>বিষয়সমূহ</h2></div>
            <div className="subj-tiles">
              {SUBJECTS.map(s => (
                <button className="tile" key={s} onClick={() => openCustomQuiz({ category: CAT_SUBJECTS.bcs.includes(s) ? 'bcs' : 'bank', subjects: [s] })}>
                  <span className="e"><Ico id={s} size={26} /></span><b>{s}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="sec leaderboard-section">
            <div className="head leaderboard-head" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap' }}>
              <div>
                <div className="eyebrow">লাইভ ফলাফল</div>
                <h2 style={{ marginTop: 10 }}>{liveLeaderboardActive ? <>আজকের <i>লিডারবোর্ড</i></> : <>গতকালের <i>লিডারবোর্ড</i></>}</h2>
                <p className="muted leaderboard-copy">{liveLeaderboardActive ? 'ফল জমা হলে প্রতি মিনিটে আপডেট হবে।' : `${homeLeaderboardDate} • লাইভ ফলাফল`}</p>
              </div>
              <button className="btn sm ghost" onClick={() => go('leaderboard', { leaderboardDateKey: homeLeaderboardDateKey })}>সব ফল →</button>
            </div>
            {homeLbData === null
              ? <div className="note">লিডারবোর্ড লোড হচ্ছে…</div>
              : homeLbData.length
                ? <div className="lb">{homeLbData.slice(0, 4).map(LBRow)}</div>
                : <div className="note">{liveLeaderboardActive ? 'আজকের লাইভ পরীক্ষার ফল জমা হলে র‍্যাঙ্কিং এখানে দেখা যাবে।' : 'গতকালের লাইভ পরীক্ষার কোনো ফল পাওয়া যায়নি।'}</div>}
          </section>

        </>}

        {/* ================= LIVE EXAM CENTER ================= */}
        {page === 'exams' && <>
          <section className="sec live-exam-center">
            <div className="head live-center-head">
              <div className="eyebrow">লাইভ পরীক্ষা কেন্দ্র</div>
              <h2>দৈনিক রাত ১১:৩০ ও <i>বিশেষ লাইভ পরীক্ষা</i></h2>
              <p className="muted">বাংলাদেশ সময়ে প্রতিদিন একটি নতুন পরীক্ষা, সঙ্গে নির্ধারিত বিশেষ পরীক্ষা। অংশ নিতে লগইন করুন।</p>
            </div>

            <div className={`exam-access-note ${user ? 'signed-in' : ''}`}>
              <span className="access-icon"><SheetIco id={user ? 'user' : 'lock'} /></span>
              <span>{user ? <><b>আপনি লগইন করেছেন</b>—লাইভ ও বিগত পরীক্ষায় অংশ নিতে পারবেন।</> : <><b>লগইন আবশ্যক</b>—ফল ও একবারের অ্যাটেম্পট সংরক্ষণের জন্য লগইন করুন।</>}</span>
              {!user && <button className="btn sm primary" onClick={() => go('login')}><SheetIco id="login" /> লগইন</button>}
            </div>

            {featuredExam && <div className={`live-feature ${featuredExam.status} ${featuredExam.status === 'live' ? 'current-live' : featuredExamIsToday ? 'today-feature' : 'upcoming-feature'}`}>
              <div className="live-feature-copy">
                <div className="live-feature-tags">
                  <span className={`live-status ${featuredExam.status}`}>{isTestExam(featuredExam) ? 'টেস্ট মোড' : featuredExam.status === 'live' ? '● এখন লাইভ' : featuredExamIsToday ? 'আজকের পরীক্ষা' : 'পরবর্তী পরীক্ষা'}</span>
                  {featuredExam.planned && <span className="live-plan-status">৪০ দিনে প্রিলি প্রস্তুতি</span>}
                </div>
                <span className="live-feature-subject"><Ico id={featuredExam.subject} size={18} /> {featuredExam.subject}</span>
                <h3>{featuredExam.topic}</h3>
                <div className="live-feature-meta">
                  <span>📅 {formatLiveExamDate(featuredExam.startsAt)}</span>
                  <span>🕗 শুরু {formatLiveExamTime(featuredExam.startsAt)}</span>
                  <span className="live-window-note">🕑 উত্তর: পরদিন দুপুর ২টা পর্যন্ত</span>
                  <span>📝 {BN(featuredExam.questions)} প্রশ্ন</span>
                  <span>⏱ {BN(featuredExam.minutes)} মিনিট</span>
                </div>
                {featuredExam.distribution && <div className="live-feature-meta exam-distribution" aria-label="বিষয়ভিত্তিক মানবণ্টন">
                  {featuredExam.distribution.map(part => <span key={part.label}>{part.label} {BN(part.questions)}</span>)}
                </div>}
                {featuredExam.planned && <div className="live-feature-meta exam-distribution" aria-label="আজকের টপিকভিত্তিক সিলেবাস">
                  {featuredExam.questionPlan.map(part => <span key={part.label} title={part.label}>{part.label}</span>)}
                </div>}
              </div>
              <div className="live-feature-action">
                <span>{isTestExam(featuredExam) ? 'প্রকাশিত প্রশ্নপত্র যাচাই' : featuredExam.status === 'live' ? 'লাইভ উইন্ডো শেষ হতে' : 'শুরু হতে বাকি'}</span>
                <strong aria-live="polite">{isTestExam(featuredExam) ? 'টেস্ট রান' : formatExamCountdown(featuredExam.status === 'live' ? featuredExam.endsAt : featuredExam.startsAt, clock)}</strong>
                {featuredExam.status === 'live' || isTestExam(featuredExam)
                  ? <button className="btn primary" disabled={!isTestExam(featuredExam) && (!!liveAttempts[featuredExam.id] || (!!user && !liveAttemptsReady))} onClick={() => startScheduledExam(featuredExam, isTestExam(featuredExam))}>
                      {!user ? <><SheetIco id="lock" /> লগইন করে পরীক্ষা দিন</> : isTestExam(featuredExam) ? 'টেস্ট মোডে শুরু করুন →' : liveAttempts[featuredExam.id] ? '✓ পরীক্ষা দেওয়া হয়েছে' : !liveAttemptsReady ? 'অ্যাটেম্পট যাচাই হচ্ছে…' : 'এখনই শুরু করুন →'}
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
              <div><div className="eyebrow">{hasFortyDayPlan ? FORTY_DAY_PRELI_PREPARATION : 'পরবর্তী সাত দিন'}</div><h2>পরবর্তী <i>পরীক্ষাসমূহ</i></h2></div>
              <span className="dhaka-time-chip">Asia/Dhaka • দৈনিক রাত ১১:৩০</span>
            </div>
            <div className="live-routine-list">
              {routineExams.map((exam, index) => (
                <article className="live-routine-card" key={exam.id}>
                  <div className="routine-day"><b>{BN(exam.planDay || index + 1)}</b><span>দিন</span></div>
                  <div className="routine-main">
                    <div className="routine-card-top"><span>{exam.planned ? 'লাইভ পরীক্ষা' : exam.subject}</span><time dateTime={new Date(exam.startsAt).toISOString()}>{formatLiveExamDate(exam.startsAt)}</time></div>
                    <h3>{exam.planned ? liveExamSubjectHeading(exam) : exam.topic}</h3>
                    {exam.planned && <div className="routine-topic-detail"><b>সিলেবাস:</b> {exam.topic}</div>}
                    <div className="routine-meta"><span>{BN(exam.questions)} প্রশ্ন</span><span>{BN(exam.minutes)} মিনিট</span><span className="exam-window-label">পরদিন ২টা পর্যন্ত</span>{exam.special && <span>বিশেষ</span>}{exam.revision && <span>রিভিশন</span>}</div>
                    {exam.distribution && <div className="routine-meta exam-distribution">{exam.distribution.map(part => <span key={part.label}>{part.label} {BN(part.questions)}</span>)}</div>}
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
            <p className="muted archive-note">মিস করেছেন? লগইন করে প্রতিটি শেষ হওয়া পরীক্ষা একবার করে দিন।</p>
            <div className="past-exam-grid">
              {pastExams.map(exam => {
                const testing = isTestExam(exam)
                const attempted = !!liveAttempts[exam.id]
                return <article className={`past-exam-card ${attempted && !testing ? 'attempted' : ''}`} key={exam.id}>
                  <div className="past-card-head"><span className="past-badge">{testing ? 'টেস্ট মোড' : 'বিগত'}</span>{attempted && !testing && <span className="done-badge">✓ সম্পন্ন</span>}</div>
                  <span className="past-subject"><Ico id={exam.subject} size={16} /> {exam.subject}</span>
                  <h3>{exam.topic}</h3>
                  <time dateTime={new Date(exam.startsAt).toISOString()}>{formatLiveExamDate(exam.startsAt)} • {formatLiveExamTime(exam.startsAt)}</time>
                  <div className="routine-meta"><span>{BN(exam.questions)} প্রশ্ন</span><span>{BN(exam.minutes)} মিনিট</span></div>
                  <button className={`btn ${attempted && !testing ? 'ghost' : 'primary'} sm`} disabled={!testing && (attempted || (!!user && !liveAttemptsReady))} onClick={() => startScheduledExam(exam, testing)}>
                    {!user ? <><SheetIco id="lock" /> লগইন করে দিন</> : testing ? 'টেস্ট মোডে শুরু করুন →' : attempted ? '✓ ইতিমধ্যে দিয়েছেন' : !liveAttemptsReady ? 'যাচাই হচ্ছে…' : 'একবার পরীক্ষা দিন →'}
                  </button>
                  <button className="btn ghost sm past-leaderboard-btn" onClick={() => go('leaderboard', { leaderboardDateKey: exam.dateKey, includeArchived: true })}>লিডারবোর্ড দেখুন →</button>
                </article>
              })}
            </div>
          </section>
        </>}

        {/* ================= QUESTION BANK ================= */}
        {page === 'questionBank' && <>
          <section className="sec question-bank-page">
            <div className="head qb-head">
              <div className="eyebrow">বিগত পরীক্ষার সংগ্রহ</div>
              <h2>প্রতিষ্ঠানভিত্তিক <i>প্রশ্নব্যাংক</i></h2>
              <p className="muted">প্রতিটি নির্দিষ্ট পরীক্ষার সব বিষয় ও টপিক একসাথে দেখুন। একটি টপিক আলাদাভাবে, অথবা সেই পরীক্ষার সব টপিক মিলিয়ে পূর্ণ পরীক্ষা দিন।</p>
            </div>

            <div className="qb-stats" aria-label="প্রশ্নব্যাংক পরিসংখ্যান">
              <span><b>{BN(QUESTION_BANK.totalQuestions)}</b><small>বাছাই করা প্রশ্ন</small></span>
              <span><b>{BN(QUESTION_BANK.totalSources)}</b><small>নির্দিষ্ট পরীক্ষা</small></span>
              <span><b>{BN(QUESTION_BANK.groups.length)}</b><small>প্রতিষ্ঠান ও বিভাগ</small></span>
            </div>

            <label className="qb-search">
              <SheetIco id="search" />
              <input value={qbQuery} onChange={event => { setQbQuery(event.target.value); setQbVisible(40) }} placeholder="প্রতিষ্ঠান, পরীক্ষা, বিষয় বা টপিক খুঁজুন…" />
              {qbQuery && <button aria-label="সার্চ মুছুন" onClick={() => setQbQuery('')}>×</button>}
            </label>

            {selectedQbGroup && !qbNeedle && <div className="qb-breadcrumb">
              <button onClick={() => { setQbGroupId(null); setQbVisible(40) }}>সব প্রতিষ্ঠান</button><span>›</span><b>{selectedQbGroup.name}</b>
            </div>}
          </section>

          {!qbNeedle && !selectedQbGroup ? <section className="sec qb-groups-section">
            <div className="head"><div className="eyebrow">প্রতিষ্ঠান বাছুন</div><h2>আপনার কাঙ্ক্ষিত <i>প্রতিষ্ঠান</i></h2></div>
            <div className="qb-group-grid">
              {QUESTION_BANK.groups.map(group => <button className="qb-group-card" key={group.id} onClick={() => { setQbGroupId(group.id); setQbVisible(40); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <span className="qb-logo"><img src={group.logo} alt={`${group.name} লোগো`} loading="lazy" onError={event => { event.currentTarget.src = '/assets/institutions/govt.png' }} /></span>
                <span className="qb-group-copy"><b>{group.name}</b><small>{BN(group.sourceCount)} পরীক্ষা • {BN(group.total)} প্রশ্ন</small></span>
                <i aria-hidden="true">→</i>
              </button>)}
            </div>
          </section> : <section className="sec qb-exams-section">
            <div className="qb-result-head">
              <div><span className="eyebrow">{qbNeedle ? 'সার্চ ফলাফল' : selectedQbGroup?.name}</span><h3>{BN(matchingQbSources.length)}টি পরীক্ষা পাওয়া গেছে</h3></div>
              {(qbNeedle || selectedQbGroup) && <button className="btn sm ghost" onClick={() => { setQbQuery(''); setQbGroupId(null); setQbVisible(40) }}>সব প্রতিষ্ঠান দেখুন</button>}
            </div>

            {matchingQbSources.length ? <div className="qb-source-list">
              {matchingQbSources.slice(0, qbVisible).map(source => <article className="qb-source-card" key={`${source.groupId}-${source.name}`}>
                <div className="qb-source-head">
                  <span className="qb-logo small"><img src={source.groupLogo} alt="" loading="lazy" onError={event => { event.currentTarget.src = '/assets/institutions/govt.png' }} /></span>
                  <div className="qb-source-title"><span>{source.groupName}</span><h3>{source.name}</h3><div><small>{BN(source.total)} প্রশ্ন</small><small>{BN(source.topicCount)} টপিক</small><small>{BN(source.subjects.length)} বিষয়</small></div></div>
                  <button className="btn primary qb-all-exam" onClick={() => startQuestionBankQuiz(source)}>
                    {user ? <>সব টপিকের পরীক্ষা <span aria-hidden="true">→</span></> : <><SheetIco id="lock" /> লগইন করে পূর্ণ পরীক্ষা দিন</>}
                  </button>
                </div>
                <details className="qb-topic-details">
                  <summary><span>বিষয় ও টপিক দেখুন</span><small>টপিকে ট্যাপ করে আলাদা পরীক্ষা দিন</small><i aria-hidden="true">⌄</i></summary>
                  <div className="qb-subjects">
                    {source.subjects.map(subject => <div className="qb-subject-block" key={subject.name}>
                      <div className="qb-subject-head"><h4>{subject.name}</h4><span>{BN(subject.total)} প্রশ্ন</span></div>
                      <div className="qb-topic-list">
                        {subject.topics.map(topic => <button key={topic.name} onClick={() => startQuestionBankQuiz(source, topic, subject.name)} title={`${topic.name} থেকে ${BN(topic.total)}টি প্রশ্নের পরীক্ষা`}>
                          <span>{topic.name}</span><b>{BN(topic.total)}</b><i aria-hidden="true">{user ? '→' : <SheetIco id="lock" />}</i>
                        </button>)}
                      </div>
                    </div>)}
                  </div>
                </details>
              </article>)}
            </div> : <div className="qb-empty"><SheetIco id="search" /><h3>কোনো পরীক্ষা পাওয়া যায়নি</h3><p>অন্য বানান, প্রতিষ্ঠান বা টপিক দিয়ে খুঁজে দেখুন।</p></div>}

            {matchingQbSources.length > qbVisible && <div className="qb-load-more"><button className="btn ghost" onClick={() => setQbVisible(value => value + 40)}>আরও {BN(Math.min(40, matchingQbSources.length - qbVisible))}টি দেখুন ↓</button></div>}
          </section>}
        </>}

        {/* ================= LEADERBOARD ================= */}
        {page === 'leaderboard' && <>
          <section className="sec leaderboard-section">
            <div className="head leaderboard-head" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', flexWrap: 'wrap' }}>
              <div>
                <div className="eyebrow">লাইভ ফলাফল</div>
                <h2>{viewingTodayLeaderboard ? <>আজকের <i>পরীক্ষার ফল</i></> : <><i>লাইভ পরীক্ষার ফল</i></>}</h2>
                <p className="muted leaderboard-copy">{viewingTodayLeaderboard
                  ? (liveLeaderboardActive ? 'ফল আপডেট হচ্ছে।' : 'আজকের পরীক্ষার্থীদের ফলাফল।')
                  : `${leaderboardDate} • লাইভ ফলাফল`}</p>
              </div>
              {!viewingTodayLeaderboard && <button className="btn sm ghost" onClick={() => go('leaderboard')}>আজকের ফল →</button>}
            </div>
            {lbData === null ? <div className="note">লোড হচ্ছে…</div>
              : lbData.length ? <div className="lb leaderboard-list">{lbData.map(LBRow)}</div>
                : <div className="note"><b>{viewingTodayLeaderboard ? 'আজকে এখনো কেউ পরীক্ষা দেয়নি।' : 'এই দিনের কোনো ফল পাওয়া যায়নি।'}</b> {viewingTodayLeaderboard ? 'ফল এখানে দেখা যাবে।' : ''}</div>}
          </section>
        </>}

        {/* ================= CUSTOM QUIZ ================= */}
        {page === 'setup' && <>
          <section className="sec custom-quiz-section">
            <div className="head"><div className="eyebrow">স্মার্ট লার্নিং</div><h2>বিষয় ও টপিক বেছে <i>কাস্টম কুইজ</i></h2><p className="muted">এক বা একাধিক বিষয় বাছুন, তারপর সেই বিষয়গুলোর নির্দিষ্ট টপিক নির্বাচন করুন।</p></div>
            <div className="seen-progress-card">
              <div><b>নতুন প্রশ্নের অগ্রগতি</b><span>{user ? <>এ পর্যন্ত <strong>{BN(seenQuestions.length)}</strong>টি প্রশ্ন দেখেছেন। সাধারণ কুইজে এগুলো আর আসবে না।</> : 'লগইন করলে দেখা প্রশ্নগুলো আলাদাভাবে সংরক্ষিত হবে।'}</span></div>
              {user
                ? <button className="btn sm ghost danger-outline" onClick={() => resetSeenQuestionProgress()}>অগ্রগতি রিসেট</button>
                : <button className="btn sm ghost" onClick={() => go('login')}><SheetIco id="login" /> লগইন</button>}
            </div>
            <div className="panel custom-quiz-panel">
              <div className="question-count-status">
                <span className="live-dot" aria-hidden="true" />
                <b>প্রশ্নভান্ডার</b>
                <span>বিষয় ও টপিক বেছে অনুশীলন শুরু করুন</span>
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
                      <SheetIco id="layers" />
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
                        {cSubs.length === 1 && cSubs[0] === 'গাণিতিক যুক্তি'
                          ? cMathTopicGroups.map(group => (
                              <div className="topic-check-group" key={group.label}>
                                <label className={`topic-check-group-title ${!cTopics.length || group.topics.every(topic => cTopics.includes(topic)) ? 'selected' : ''}`}>
                                  <input type="checkbox" checked={!cTopics.length || group.topics.every(topic => cTopics.includes(topic))} onChange={() => toggleMathTopicGroup(group.topics)} />
                                  <span><b>{group.label}</b><small>{BN(group.topics.length)}টি উপবিষয় • সব বাছুন</small></span>
                                </label>
                                {group.topics.map(topic => (
                                  <label className="topic-check-option" key={topic}>
                                    <input type="checkbox" checked={cTopics.includes(topic)} onChange={() => setCTopics(current => current.includes(topic) ? current.filter(item => item !== topic) : [...current, topic])} />
                                    <span>{topic}<small>{BN(customTopicCount(topic))} প্রশ্ন</small></span>
                                  </label>
                                ))}
                              </div>
                            ))
                          : cVisibleTopics.map(topic => (
                              <label className="topic-check-option" key={topic}>
                                <input type="checkbox" checked={cTopics.includes(topic)} onChange={() => setCTopics(current => current.includes(topic) ? current.filter(item => item !== topic) : [...current, topic])} />
                                <span>{topic}<small>{BN(customTopicCount(topic))} প্রশ্ন</small></span>
                              </label>
                            ))}
                        {!cVisibleTopics.length && <p className="topic-empty">কোনো টপিক পাওয়া যায়নি</p>}
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
                  <div className="chips custom-size-options">{[10, 25, 50, 100, 200].map(number => <button className={`chip ${cCount === number ? 'on' : ''}`} key={number} onClick={() => setCCount(number)}>{BN(number)}</button>)}</div>
                </div>
                <div><span className="lbl">সময় (মিনিট)</span>
                  <div className="chips custom-time-options">{[10, 20, 30, 60, 90, 120, 180].map(number => <button className={`chip ${cTime === number ? 'on' : ''}`} key={number} onClick={() => setCTime(number)}>{BN(number)}</button>)}</div>
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
                : <><h3>আজকের <i>মিশ্র চ্যালেঞ্জ</i></h3><p className="muted">সব বিষয় মিলিয়ে ১০টি প্রশ্ন — ১০ মিনিট। দিনে একবার।</p><div className="cta"><button className="btn primary" onClick={() => beginQuiz({ title: 'ডেইলি চ্যালেঞ্জ', tag: 'bcs', subjects: CAT_SUBJECTS.bcs, limit: 10, minutes: 10, fallback: SUBJECTS, daily: true, noRepeatSetup: true })}>{user ? 'অংশ নিন →' : <><SheetIco id="lock" /> লগইন করে অংশ নিন</>}</button></div></>}
            </div>
          </section>
        </>}

        {/* ================= REVISION / WRONG ANSWERS ================= */}
        {page === 'review' && <>
          <section className="sec revision-page">
            <div className="head review-head">
              <div><div className="eyebrow">স্মার্ট লার্নিং</div><h2 style={{ marginTop: 10 }}>রিভিশন ও <i>ভুল খাতা</i></h2><p className="muted">কুইজে দেওয়া প্রতিটি ভুল উত্তর এখানে সঠিক উত্তর ও ব্যাখ্যাসহ সংরক্ষিত থাকে।</p></div>
              {wrong.length > 0 && <div className="review-head-actions">
                <button className="btn sm primary" onClick={() => beginQuiz({ title: 'ভুল উত্তর রিভিশন', rows: revisionQuizRows, limit: Math.min(20, revisionQuizRows.length), minutes: Math.max(10, Math.min(20, revisionQuizRows.length)) })}>↻ {dueList.length ? `আজকের ${BN(dueList.length)}টি` : 'রিভিশন'} শুরু করুন</button>
                <button className="btn sm ghost" onClick={() => { setWrong([]); setRevMeta({}); localStorage.setItem('asp_wrong', '[]'); localStorage.setItem('asp_rev', '{}'); setToastMsg('রিভিশন ও ভুলের তালিকা মুছে ফেলা হয়েছে') }}>লিস্ট মুছুন</button>
              </div>}
            </div>
            {wrong.length === 0
              ? <div className="note"><b>এখনো কোনো ভুল নেই!</b> কুইজে ভুল উত্তর দিলে প্রশ্নটি এখানে নিজে থেকেই যোগ হবে।</div>
              : <>
                <div className="revision-summary">
                  <span><b>{BN(wrong.length)}</b> ভুল প্রশ্ন</span>
                  <span><b>{BN(dueList.length)}</b> আজ রিভিশন বাকি</span>
                  <span>ধাপ: <b>১ → ৩ → ৭ দিন</b></span>
                </div>
                {wrong.slice().reverse().map((item, index) => {
                  const source = examSource(item)
                  const selectedAnswer = wrongAnswerOf(item)
                  const selectedIndex = Number.isInteger(item?.revision?.selectedIndex)
                    ? item.revision.selectedIndex
                    : (item.options || []).indexOf(selectedAnswer)
                  return <article className="rev-item bad-item" key={questionKey(item) || index}>
                    <div className="rev-meta">
                      <span>{item.subject || 'মিশ্র'}</span>
                      <span>{item.topic || 'বিবিধ'}</span>
                      <span className="source-badge" title={source.full}>{source.label}</span>
                    </div>
                    <div className="q"><Md s={item.question} /></div>
                    {selectedIndex >= 0
                      ? <ReviewOptions question={item} selectedIndex={selectedIndex} />
                      : <><ReviewOptions question={item} selectedIndex={null} /><div className="legacy-answer-note">পুরোনো রেকর্ডে আপনার নির্বাচিত অপশনটি সংরক্ষিত নেই।</div></>}
                    <Expl q={item} />
                    <GeminiHelp question={item} />
                  </article>
                })}
              </>}
          </section>
        </>}

        {/* ================= চাকরির সার্কুলার ================= */}
        {page === 'circular' && <>
          <section className="sec circular-page">
            <div className="head">
              <div className="eyebrow">চাকরির আপডেট</div>
              <h2>চাকরির <i>সার্কুলার</i></h2>
              <p className="muted">বিভিন্ন চাকরির প্রস্তুতি, প্রশ্নব্যাংক ও মডেল পরীক্ষায় দ্রুত যেতে একটি জায়গা থেকে বেছে নিন।</p>
            </div>
            <div className="circular-page-grid">
              {CIRCULARS.map(item => <article className="circular-page-card" key={item.title}>
                <div className="circular-page-card-top">
                  <span className={`circular-icon circular-icon-${item.icon}`}><SheetIco id={item.icon} /></span>
                  <span className="circular-tag">{item.tag}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <button className="btn primary sm" onClick={() => go(item.page)}>{item.action} →</button>
              </article>)}
            </div>
            <div className="circular-tip"><span>💡</span><span><b>সার্কুলার দেখে প্রস্তুতি নিন</b><small>প্রতিটি ক্যাটাগরি থেকে সংশ্লিষ্ট প্রশ্ন ও মডেল পরীক্ষা দ্রুত খুলে নিতে পারবেন।</small></span></div>
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

        {/* ================= QUIZ (সব প্রশ্ন এক পেজে) ================= */}
        {page === 'quiz' && quiz && <>
          <section className="sec" style={{ paddingTop: 28, gap: 18 }}>
            <div className="eyebrow">{quiz.title} — {BN(quiz.qs.length)}টি প্রশ্ন • স্লাইড/স্ক্রল করে সব দেখো</div>
            {quiz.candidate && <div className="live-candidate-line" aria-label="পরীক্ষার্থীর তথ্য"><span>নাম: <b>{quiz.candidate.name}</b></span><span>ইনস্টিটিউট: <b>{quiz.candidate.institution}</b></span></div>}
            {quiz.testing && <div className="live-candidate-line" role="status"><b>টেস্ট মোড</b><span>এই রানটি আপনার অফিসিয়াল লাইভ অ্যাটেম্পট বা প্রোফাইলের ফলাফলে যোগ হবে না।</span></div>}
            {quiz.liveExamSecurity && <div className="live-security-notice" role="alert"><b>⚠ লাইভ পরীক্ষা নিরাপত্তা</b><span>অন্য অ্যাপ/ট্যাব, Home/Overview button বা পরীক্ষার উইন্ডো থেকে বের হলে পরীক্ষা সঙ্গে সঙ্গে জমা হয়ে যাবে। কপি, পেস্ট ও সাধারণ শর্টকাট বন্ধ আছে।</span></div>}
            {quiz.qs.map((q, qi) => (
              <div className="q-card qcard" id={'qcard-' + qi} key={qi} style={{ scrollMarginTop: 130 }}>
                <div className="qno"><span>প্রশ্ন {BN(qi + 1)}</span>
                  <div className="q-card-tools">
                    <button className={`flag ${quiz.mark[qi] ? 'on' : ''}`} title="রিভিউয়ের জন্য মার্ক করুন"
                      onClick={() => setQuiz(z => { const m = [...z.mark]; m[qi] = !m[qi]; return { ...z, mark: m } })}>🚩</button>
                  </div>
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

          <div className="qbar" role="region" aria-label="পরীক্ষা নিয়ন্ত্রণ">
            <button className={`qbar-quit ${quitArm ? 'confirming' : ''}`} aria-label={quitArm ? 'বের হওয়া নিশ্চিত করতে আবার চাপুন' : 'পরীক্ষা থেকে বের হন'} onClick={quitTap}>
              <SheetIco id="close" /><span>{quitArm ? 'নিশ্চিত?' : 'বের হন'}</span>
            </button>
            <div className="qbar-status" aria-live="polite">
              <span className={`q-timer ${quiz.left < 30 ? 'warn' : ''}`}>⏱ {mmss}</span>
              <span className="qbar-progress"><b>{BN(quiz.ans.filter(a => a != null).length)}/{BN(quiz.qs.length)}</b><small>উত্তর হয়েছে</small></span>
            </div>
            <p className={`qbar-guide ${arm ? 'confirming' : ''}`}><span aria-hidden="true">⚠</span>{arm ? 'সতর্কতা: নিশ্চিত করতে আবার সাবমিট করুন' : 'সতর্কতা: সাবমিটের আগে উত্তর মিলিয়ে নিন'}</p>
            <button className={`btn qbar-submit ${arm ? 'danger' : 'primary'}`} onClick={() => {
              if (!arm) { setArm(true); setTimeout(() => setArm(false), 2500); return }
              finish()
            }}><span>{arm ? 'নিশ্চিত করুন' : 'সাবমিট করুন'}</span><b aria-hidden="true">{arm ? '!' : '✓'}</b></button>
          </div>
        </>}

        {/* ================= RESULT ================= */}
        {page === 'result' && result && <>
          <section className="sec" style={{ paddingTop: 44 }}>
            <div className="eyebrow">ফলাফল — {result.title}</div>
            {result.candidate && <div className="live-candidate-line result-candidate-line"><span>নাম: <b>{result.candidate.name}</b></span><span>ইনস্টিটিউট: <b>{result.candidate.institution}</b></span></div>}
            {result.testing && <div className="live-candidate-line result-candidate-line" role="status"><b>টেস্ট মোড সম্পন্ন</b><span>এই ফলটি আপনার অফিসিয়াল লাইভ অ্যাটেম্পট বা প্রোফাইলে সংরক্ষিত হয়নি।</span></div>}
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
            <div className="cta result-main-actions">
              <button className="btn primary" aria-expanded={showRev} onClick={() => setShowRev(v => !v)}>উত্তরপত্র {showRev ? '↑' : '→'}</button>
              {result.scheduleId && <button className="btn" onClick={() => go('leaderboard')}>লিডারবোর্ড →</button>}
              <button className="btn ghost" onClick={() => go('home')}>হোম →</button>
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
                  <ReviewOptions question={r} selectedIndex={r.ua} />
                  {r.ua == null && <div className="legacy-answer-note skipped">এই প্রশ্নের উত্তর দেওয়া হয়নি।</div>}
                  <Expl q={r} />
                  <GeminiHelp question={r} />
                </div>
              })}
              {revOnlyWrong && result.rev.every(r => r.ua != null && r.options[r.ua] === r.answer) && <div className="note"><b>দারুণ! কোনো ভুল নেই।</b> সব প্রশ্নে সঠিক উত্তর দিয়েছো। 🏆</div>}
            </div>}
            {result.setup && <div className="result-return result-return-bottom saved-setup-card">
              <span className="result-return-icon saved-setup-icon"><SheetIco id="layers" /></span>
              <div className="saved-setup-copy">
                <span className="saved-setup-kicker">পরের চেষ্টার জন্য প্রস্তুত</span>
                <b>এই পরীক্ষার সেটআপ সংরক্ষিত আছে</b>
                <p>বিষয়, টপিক, প্রশ্নসংখ্যা ও সময় আবার নির্বাচন করতে হবে না।</p>
                <div className="saved-setup-meta" aria-label="সংরক্ষিত সেটআপের তথ্য">
                  <span>{BN(result.setup.limit || result.rev.length)} প্রশ্ন</span>
                  {result.setup.minutes && <span>{BN(result.setup.minutes)} মিনিট</span>}
                </div>
              </div>
              <div className="result-return-actions saved-setup-actions">
                <button className="btn primary" onClick={() => beginQuiz(result.setup)}>পুনরায় →</button>
                {!result.setup.rows && <button className="btn ghost danger-outline" onClick={() => resetSeenQuestionProgress(result.setup)}>রিসেট →</button>}
                {result.origin === 'setup' && <button className="btn ghost" onClick={() => {
                  const setup = result.setup
                  setCCat(setup.tag === 'bank' ? 'bank' : 'bcs')
                  setCSubs(setup.subjects || [])
                  setCTopics(setup.topics || [])
                  setCCount(setup.limit || 25)
                  setCTime(setup.minutes || 20)
                  go('setup')
                }}>সেটআপ →</button>}
                {result.origin === 'questionBank' && <button className="btn ghost" onClick={() => go('questionBank')}>প্রশ্নব্যাংক →</button>}
              </div>
            </div>}
            {result.scheduleId && <div className="result-return result-return-bottom live-result-return">
              <span className="result-return-icon">✓</span>
              <div>{result.rankedLive
                ? <><b>লাইভ পরীক্ষার ফল লিডারবোর্ডে যুক্ত হয়েছে</b><p>আপনার নম্বর স্বয়ংক্রিয়ভাবে আজকের লাইভ র‍্যাংকিংয়ে দেখা যাবে।</p></>
                : <><b>বিগত পরীক্ষার অ্যাটেম্পট সংরক্ষিত হয়েছে</b><p>নির্ধারিত লাইভ সময় শেষ হওয়ার পরে দেওয়ায় এটি লিডারবোর্ডে যুক্ত হবে না; তবে এই পরীক্ষা আর একবার দেওয়া যাবে না।</p></>}</div>
              <button className="btn primary" onClick={() => go('exams')}>পরীক্ষা →</button>
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
                  <small className="muted"><a href="#" style={{ color: 'var(--accent)' }} onClick={e => { e.preventDefault(); go('forgotPassword') }}>পাসওয়ার্ড ভুলে গেছেন?</a></small>
                  <small className="muted">অ্যাকাউন্ট নেই? <a href="#" style={{ color: 'var(--accent)' }} onClick={e => { e.preventDefault(); go('signup') }}>সাইন আপ করুন</a></small>
                </form>
              </div>
            </div>
          </section>
        </>}

        {/* ================= PASSWORD RECOVERY ================= */}
        {page === 'forgotPassword' && <>
          <section className="sec">
            <div className="auth-wrap">
              <div className="side"><h3>পাসওয়ার্ড <i>পুনরুদ্ধার করুন।</i></h3><p className="muted">অ্যাকাউন্টে ব্যবহৃত ইমেইল দিন। নতুন পাসওয়ার্ড দেওয়ার জন্য একটি নিরাপদ লিংক পাঠানো হবে।</p></div>
              <div className="body"><div className="eyebrow" style={{ marginBottom: 18 }}>পাসওয়ার্ড ভুলে গেছেন?</div>
                <form className="form" onSubmit={async event => {
                  event.preventDefault()
                  const email = String(event.currentTarget.email.value || '').trim()
                  const redirectTo = `${window.location.origin}${window.location.pathname}`
                  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
                  if (error) { setToastMsg(error.message); return }
                  setToastMsg('পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে')
                  go('login')
                }}>
                  <input type="email" name="email" placeholder="আপনার অ্যাকাউন্টের ইমেইল" autoComplete="email" required />
                  <button className="btn primary" type="submit"><SheetIco id="login" /> রিসেট লিংক পাঠান</button>
                  <small className="muted">পাসওয়ার্ড মনে পড়েছে? <a href="#" style={{ color: 'var(--accent)' }} onClick={event => { event.preventDefault(); go('login') }}>লগইনে ফিরে যান</a></small>
                </form>
              </div>
            </div>
          </section>
        </>}

        {page === 'updatePassword' && <>
          <section className="sec">
            <div className="auth-wrap">
              <div className="side"><h3>নতুন <i>পাসওয়ার্ড দিন।</i></h3><p className="muted">ইমেইলের রিসেট লিংকটি যাচাই হয়েছে। এখন একটি শক্তিশালী নতুন পাসওয়ার্ড দিন।</p></div>
              <div className="body"><div className="eyebrow" style={{ marginBottom: 18 }}>নতুন পাসওয়ার্ড</div>
                <form className="form" onSubmit={async event => {
                  event.preventDefault()
                  const password = String(event.currentTarget.password.value || '')
                  const confirmation = String(event.currentTarget.confirmPassword.value || '')
                  if (password.length < 6) { setToastMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন'); return }
                  if (password !== confirmation) { setToastMsg('দুটি পাসওয়ার্ড এক নয়'); return }
                  const { error } = await supabase.auth.updateUser({ password })
                  if (error) { setToastMsg(error.message); return }
                  setToastMsg('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে')
                  go('home')
                }}>
                  <input type="password" name="password" placeholder="নতুন পাসওয়ার্ড" autoComplete="new-password" minLength="6" required />
                  <input type="password" name="confirmPassword" placeholder="নতুন পাসওয়ার্ড আবার লিখুন" autoComplete="new-password" minLength="6" required />
                  <button className="btn primary" type="submit">পাসওয়ার্ড সংরক্ষণ করুন →</button>
                </form>
              </div>
            </div>
          </section>
        </>}

        {/* ================= SIGNUP ================= */}
        {page === 'signup' && <>
          <section className="sec">
            <div className="auth-wrap">
              <div className="side"><h3>অভ্যাস-এ <i>যোগ দিন</i></h3><p className="muted">পরীক্ষা ও অনুশীলনে অংশ নিতে একটি অ্যাকাউন্ট তৈরি করুন।</p></div>
              <div className="body"><div className="eyebrow" style={{ marginBottom: 18 }}>নতুন অ্যাকাউন্ট</div>
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
                  <button className="btn primary" type="submit"><SheetIco id="userPlus" /> অ্যাকাউন্ট তৈরি করুন</button>
                </form>
              </div>
            </div>
          </section>
        </>}

        {/* ================= PROFILE ================= */}
        {page === 'profile' && user && <>
          <section className="sec">
            <div className="head"><div className="eyebrow">প্রোফাইল</div><h2>আমার <i>প্রোফাইল</i></h2></div>
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

            <div className="seen-progress-card profile-seen-progress">
              <div><b>নতুন প্রশ্নের অগ্রগতি</b><span><strong>{BN(seenQuestions.length)}</strong>টি প্রশ্ন দেখা হয়েছে এবং সাধারণ কুইজে আর পুনরাবৃত্তি হবে না। চাইলে পুরো হিসাব মুছে শুরু থেকে শুরু করুন।</span></div>
              <button className="btn sm ghost danger-outline" onClick={() => resetSeenQuestionProgress()}>অগ্রগতি রিসেট</button>
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

              <div className="pcard profile-revision-card">
                <div className="pcard-title-row"><h4>ভুল উত্তর ও রিভিশন</h4>{dueList.length > 0 && <span>{BN(dueList.length)}টি বাকি</span>}</div>
                {wrong.length ? <>
                  <div className="profile-wrong-list">
                    {wrong.slice(-3).reverse().map((item, index) => <div className="profile-wrong-item" key={questionKey(item) || index}>
                      <div className="profile-wrong-question"><Md s={item.question} /></div>
                      <small>আপনার উত্তর: <b>{wrongAnswerOf(item) || 'পুরোনো রেকর্ড'}</b></small>
                      <small className="correct">সঠিক: <b>{item.answer}</b></small>
                    </div>)}
                  </div>
                  <button className="btn sm ghost profile-review-link" onClick={() => go('review')}>সব {BN(wrong.length)}টি দেখুন →</button>
                </> : <p className="muted" style={{ fontSize: '.85rem' }}>কোনো ভুল উত্তর জমা নেই।</p>}
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

      {page !== 'quiz' && <nav className="bnav" aria-label="দ্রুত নেভিগেশন">
        <button className={page === 'home' ? 'on' : ''} onClick={() => go('home')}><SheetIco id="home" />হোম</button>
        <button className={page === 'exams' ? 'on' : ''} onClick={() => go('exams')}><SheetIco id="exam" />পরীক্ষা</button>
        <button className={page === 'setup' ? 'on' : ''} onClick={() => go('setup')}><SheetIco id="sliders" />কাস্টম</button>
        <button className={page === 'questionBank' ? 'on' : ''} onClick={() => go('questionBank')}><SheetIco id="bank" />ব্যাংক</button>
        <button className={page === 'circular' ? 'on' : ''} onClick={() => go('circular')}><SheetIco id="file" />সার্কুলার</button>
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
                ['home', 'home', 'হোম'], ['exams', 'exam', 'পরীক্ষা'], ['questionBank', 'bank', 'প্রশ্নব্যাংক'], ['potrika', 'news', 'পত্রিকা'],
                ['visual', 'image', 'ভিজ্যুয়াল'], ['circular', 'file', 'সার্কুলার'], ['daily', 'flame', 'ডেইলি'], ['leaderboard', 'trophy', 'র‍্যাংকিং']
              ].map(([to, icon, label]) => <button className={page === to ? 'on' : ''} key={to} onClick={() => go(to)}><SheetIco id={icon} /><span>{label}</span></button>)}
            </div>

            <div className="side-nav-group">
              <span className="side-nav-label">শেখা ও টুলস</span>
              {[
                ['setup', 'sliders', 'কাস্টম কুইজ'], ['review', 'layers', 'রিভিশন'], ['profile', 'user', 'প্রোফাইল']
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

      {/* ================= LIVE MODEL-TEST ENTRY ================= */}
      {liveEntry && <div className="ai-modal-bg live-entry-bg" onClick={() => setLiveEntry(null)}>
        <div className="ai-modal live-entry-modal" role="dialog" aria-modal="true" aria-labelledby="live-entry-title" onClick={event => event.stopPropagation()}>
          <div className="ai-modal-head live-entry-head">
            <span className="ai-modal-icon"><SheetIco id="exam" /></span>
            <div><span>{liveEntry.testing ? 'প্রশ্নপত্রের টেস্ট রান' : 'লাইভ পরীক্ষা'}</span><h3 id="live-entry-title">পরিচয় নিশ্চিত করুন</h3></div>
            <button className="ibtn" aria-label="ফরম বন্ধ করুন" onClick={() => setLiveEntry(null)}><SheetIco id="close" /></button>
          </div>
          <div className="live-entry-summary">
            <div className="live-entry-summary-top"><span className="live-entry-status"><i aria-hidden="true" />{liveEntry.testing ? 'টেস্ট মোড' : 'লাইভ পরীক্ষা'}</span><span>ধাপ ১ / ১</span></div>
            <b>{liveEntry.exam.title}</b>
            <div className="live-entry-meta-grid">
              <span><small>তারিখ ও সময়</small><strong>{formatLiveExamDate(liveEntry.exam.startsAt)} • {formatLiveExamTime(liveEntry.exam.startsAt)}</strong></span>
              <span><small>প্রশ্ন ও সময়</small><strong>{BN(liveEntry.exam.questions)} প্রশ্ন • {BN(liveEntry.exam.minutes)} মিনিট</strong></span>
            </div>
          </div>
          <form className="form live-entry-form" onSubmit={submitLiveEntry}>
            <p className="live-entry-intro">উত্তরপত্রে আপনার পরিচয় দেখাতে নিচের তথ্য দিন।</p>
            <div className="live-entry-fields">
              <label><span>পূর্ণ নাম</span><input name="candidateName" type="text" defaultValue={liveEntry.name} placeholder="আপনার নাম লিখুন" autoComplete="name" required /></label>
              <label><span>ইনস্টিটিউট</span><input name="candidateInstitution" type="text" defaultValue={liveEntry.institution} placeholder="স্কুল, কলেজ বা বিশ্ববিদ্যালয়" required /></label>
            </div>
            <p className="live-entry-privacy">{liveEntry.testing ? 'টেস্ট মোডে ফল, ভুল প্রশ্ন, প্রোফাইল পরিসংখ্যান বা অফিসিয়াল লাইভ অ্যাটেম্পট সংরক্ষণ হবে না।' : 'তথ্যটি শুধু আপনার লাইভ পরীক্ষার উত্তরপত্রে ব্যবহৃত হবে।'}</p>
            <div className="live-entry-actions"><button type="button" className="btn ghost" onClick={() => setLiveEntry(null)}>এখন নয়</button><button className="btn live-entry-start-btn" type="submit">শুরু করুন <span aria-hidden="true">→</span></button></div>
          </form>
        </div>
      </div>}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      <Analytics />
    </div>
  )
}

export default App
