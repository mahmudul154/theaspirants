import { TODAY_MODEL_EXAM_QUESTIONS } from './todays-model-exam.js'
import { SEPTEMBER_8_MATH_SUPPLEMENT, SEPTEMBER_8_MATH_SUPPLEMENT_COUNT } from './september-8-math-supplement.js'
import { SEPTEMBER_9_LIVE_EXAM_COUNTS, SEPTEMBER_9_LIVE_EXAM_QUESTIONS } from './september-9-live-exam.js'
import { FORTY_DAY_LIVE_PLAN, MODEL_LIVE_START_DATE } from './forty-day-live-plan.js'

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const LIVE_START_UTC_HOUR = 17
const LIVE_START_UTC_MINUTE = 30 // 23:30 in Asia/Dhaka
const LIVE_WINDOW_MS = HOUR_MS

// The shared syllabus supports government-job preliminary preparation beyond
// one exam track, while keeping the existing schedule IDs stable.
export const FORTY_DAY_PRELI_PREPARATION = '৪০ দিনে প্রিলি প্রস্তুতি (পিএসসি, বিসিএস, ব্যাংক, এনটিআরসিএ, প্রাথমিক ও অন্যান্য)'

// Exact, well-populated Supabase topic values. The date serial chooses one
// deterministically, so every visitor sees the same national routine.
export const LIVE_TOPIC_ROTATION = [
  { subject: 'বাংলা', topic: 'ভাষা ও ব্যাকরণ' },
  { subject: 'English', topic: 'Grammar' },
  { subject: 'বাংলাদেশ বিষয়াবলি', topic: 'জাতীয় অর্থনীতি' },
  { subject: 'গাণিতিক যুক্তি', topic: 'Arithmetic' },
  { subject: 'বিজ্ঞান', topic: 'জীব বিজ্ঞান' },
  { subject: 'আন্তর্জাতিক বিষয়াবলি', topic: 'আন্তর্জাতিক সংস্থা ও জোট' },
  { subject: 'কম্পিউটার ও তথ্য প্রযুক্তি', topic: 'কম্পিউটার সিস্টেম ও হার্ডওয়্যার' },
  { subject: 'মানসিক দক্ষতা', topic: 'যৌক্তিক বিশ্লেষণ' },
  { subject: 'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা', topic: 'বাংলাদেশের ভূপ্রকৃতি' },
  { subject: 'নৈতিকতা, মূল্যবোধ ও সুশাসন', topic: 'সুশাসনের সম্যক ধারনা ও সংজ্ঞা' },
  { subject: 'বাংলা', topic: 'আধুনিক যুগ' },
  { subject: 'English', topic: 'Voice, Narration and One Word' },
  { subject: 'বাংলাদেশ বিষয়াবলি', topic: 'ব্রিটিশ শাসন ও আন্দোলন' },
  { subject: 'গাণিতিক যুক্তি', topic: 'Algebra' },
  { subject: 'বিজ্ঞান', topic: 'পদার্থবিজ্ঞান' },
  { subject: 'আন্তর্জাতিক বিষয়াবলি', topic: 'ভূ-রাজনীতি, যুদ্ধ ও ইতিহাস' },
  { subject: 'কম্পিউটার ও তথ্য প্রযুক্তি', topic: 'নেটওয়ার্কিং ও ইন্টারনেট' },
  { subject: 'মানসিক দক্ষতা', topic: 'বিচারবুদ্ধি' },
  { subject: 'ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা', topic: 'বায়ুমণ্ডল, আবহাওয়া ও জলবায়ু' },
  { subject: 'নৈতিকতা, মূল্যবোধ ও সুশাসন', topic: 'বাংলাদেশের সংবিধানে অধিকার' }
]

// Manually published events sit beside the daily 23:30 routine. Each plan
// contains only exact topic values from `mcq_questions_job`; keyword buckets
// cover the requested sector and March-focused questions inside those topics.
export const SPECIAL_LIVE_EXAMS = [
  {
    id: 'today-model-test-2026-09-07-2330',
    dateKey: '2026-09-07',
    startsAt: Date.UTC(2026, 8, 7, 17, 30), // 23:30 Asia/Dhaka
    endsAt: Date.UTC(2026, 8, 7, 18, 30),
    subject: 'আজকের মডেল পরীক্ষা',
    topic: 'বাংলা • সাধারণ জ্ঞান • মানসিক দক্ষতা',
    title: 'আজকের মডেল পরীক্ষা • বাংলা, সাধারণ জ্ঞান ও মানসিক দক্ষতা',
    questions: TODAY_MODEL_EXAM_QUESTIONS.length,
    minutes: 60,
    special: true,
    collectCandidate: true,
    // The app verifies this separately seeded Supabase record set at launch and
    // falls back to the same audited bundle only if the database is unavailable.
    publishedExamId: 'today-model-test-2026-09-07-2330',
    rows: TODAY_MODEL_EXAM_QUESTIONS,
    distribution: [
      { label: 'বাংলা', questions: 40 },
      { label: 'সাধারণ জ্ঞান', questions: 30 },
      { label: 'মানসিক দক্ষতা', questions: 30 }
    ]
  }
]

const MODEL_LIVE_START_MS = Date.UTC(MODEL_LIVE_START_DATE.year, MODEL_LIVE_START_DATE.month, MODEL_LIVE_START_DATE.day)
const MODEL_LIVE_END_MS = MODEL_LIVE_START_MS + FORTY_DAY_LIVE_PLAN.length * DAY_MS

function modelLiveExamFor(day) {
  if (day < MODEL_LIVE_START_MS || day >= MODEL_LIVE_END_MS) return null
  const index = Math.floor((day - MODEL_LIVE_START_MS) / DAY_MS)
  const questionPlan = FORTY_DAY_LIVE_PLAN[index]
  const date = new Date(day)
  const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
  const firstPhase = index < 20
  const isSeptember8MathSupplementedPaper = dateKey === '2026-09-08'
  const isSeptember9FixedPaper = dateKey === '2026-09-09'
  // The announced Day 2 and Day 3 scope is surfaced directly in every compact
  // schedule card, rather than being hidden behind the generic phase heading.
  const phaseTitle = index === 1
    ? 'Article, Determiner ও Adjective • দেশ, আয়তন ও জনসংখ্যা • সাধারণ নিয়ম ও শতকরা-লাভক্ষতি'
    : index === 2
      ? 'Tense, Right Form of Verbs ও Conditionals • বিশ্ব সভ্যতা • শতকরা ও লাভ-ক্ষতি'
      : firstPhase
        ? 'ইংরেজি গ্রামার • আন্তর্জাতিক বিষয়াবলি • গণিত'
        : 'বাংলা ব্যাকরণ • বাংলাদেশ বিষয়াবলি • মানসিক দক্ষতা'
  return {
    id: `bcs-40-day-model-${dateKey}`,
    dateKey,
    startsAt: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), LIVE_START_UTC_HOUR, LIVE_START_UTC_MINUTE),
    endsAt: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), LIVE_START_UTC_HOUR, LIVE_START_UTC_MINUTE) + LIVE_WINDOW_MS,
    subject: `${FORTY_DAY_PRELI_PREPARATION} • দিন ${index + 1}`,
    topic: phaseTitle,
    title: `${FORTY_DAY_PRELI_PREPARATION} • দিন ${index + 1}`,
    // Day 3 is a reviewed source-only paper. Its static order is intentionally
    // shared by every candidate, so it must never enter the database shuffle.
    // Day 2 retains its scheduled 100-question paper and appends the seven
    // supplied percentage/profit-loss questions as a visible Math supplement.
    questions: isSeptember9FixedPaper
      ? SEPTEMBER_9_LIVE_EXAM_COUNTS.total
      : isSeptember8MathSupplementedPaper
        ? 100 + SEPTEMBER_8_MATH_SUPPLEMENT_COUNT
        : 100,
    minutes: 60,
    planned: true,
    phase: firstPhase ? 'প্রথম ২০ দিন' : 'পরের ২০ দিন',
    questionPlan,
    supplementalRows: isSeptember8MathSupplementedPaper ? SEPTEMBER_8_MATH_SUPPLEMENT : null,
    rows: isSeptember9FixedPaper ? SEPTEMBER_9_LIVE_EXAM_QUESTIONS : null,
    distribution: isSeptember9FixedPaper
      ? [
          { label: 'English', questions: SEPTEMBER_9_LIVE_EXAM_COUNTS.english },
          { label: 'আন্তর্জাতিক বিষয়াবলি', questions: SEPTEMBER_9_LIVE_EXAM_COUNTS.generalKnowledge },
          { label: 'গাণিতিক যুক্তি', questions: SEPTEMBER_9_LIVE_EXAM_COUNTS.math }
        ]
      : isSeptember8MathSupplementedPaper
        ? [
            { label: 'ইংরেজি গ্রামার', questions: 40 },
            { label: 'আন্তর্জাতিক বিষয়াবলি', questions: 30 },
            { label: 'গাণিতিক যুক্তি', questions: 30 + SEPTEMBER_8_MATH_SUPPLEMENT_COUNT }
          ]
        : questionPlan.map(({ subject, questions }) => ({
            label: subject === 'English' ? 'ইংরেজি গ্রামার' : subject,
            questions
          }))
  }
}

const bnDigits = value => String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[digit])
const padBn = value => bnDigits(String(value).padStart(2, '0'))
const withStatus = (exam, now) => ({
  ...exam,
  status: now < exam.startsAt ? 'upcoming' : now < exam.endsAt ? 'live' : 'past'
})

export function buildDailyLiveExams(now = Date.now()) {
  const dhakaNow = new Date(now + DHAKA_OFFSET_MS)
  const dhakaDay = Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), dhakaNow.getUTCDate())
  const exams = []

  for (let offset = -14; offset <= 45; offset++) {
    const day = dhakaDay + offset * DAY_MS
    const plannedModel = modelLiveExamFor(day)
    if (plannedModel) {
      exams.push(withStatus(plannedModel, now))
      continue
    }
    const date = new Date(day)
    const serial = Math.floor(day / DAY_MS)
    const index = ((serial % LIVE_TOPIC_ROTATION.length) + LIVE_TOPIC_ROTATION.length) % LIVE_TOPIC_ROTATION.length
    const slot = LIVE_TOPIC_ROTATION[index]
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const dayOfMonth = date.getUTCDate()
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`
    const startsAt = Date.UTC(year, month, dayOfMonth, LIVE_START_UTC_HOUR, LIVE_START_UTC_MINUTE)
    const endsAt = startsAt + LIVE_WINDOW_MS

    exams.push(withStatus({
      id: `daily-${dateKey}`,
      dateKey,
      startsAt,
      endsAt,
      subject: slot.subject,
      topic: slot.topic,
      questions: 25,
      minutes: 20,
      title: `ডেইলি লাইভ • ${slot.topic}`
    }, now))
  }

  return [...exams, ...SPECIAL_LIVE_EXAMS.map(exam => withStatus(exam, now))]
    .sort((first, second) => first.startsAt - second.startsAt)
}

export function formatLiveExamDate(timestamp) {
  return new Intl.DateTimeFormat('bn-BD', {
    timeZone: 'Asia/Dhaka', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  }).format(new Date(timestamp))
}

export function formatLiveExamTime(timestamp) {
  return new Intl.DateTimeFormat('bn-BD', {
    timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit', hour12: true
  }).format(new Date(timestamp))
}

export function formatExamCountdown(target, now = Date.now()) {
  const remaining = Math.max(0, target - now)
  const days = Math.floor(remaining / DAY_MS)
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS)
  const minutes = Math.floor((remaining % HOUR_MS) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${days ? `${bnDigits(days)} দিন ` : ''}${padBn(hours)}:${padBn(minutes)}:${padBn(seconds)}`
}
