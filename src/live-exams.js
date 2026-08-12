const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const LIVE_START_UTC_HOUR = 14 // 20:00 in Asia/Dhaka
const LIVE_WINDOW_MS = 60 * 60 * 1000

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

const bnDigits = value => String(value).replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[digit])
const padBn = value => bnDigits(String(value).padStart(2, '0'))

export function buildDailyLiveExams(now = Date.now()) {
  const dhakaNow = new Date(now + DHAKA_OFFSET_MS)
  const dhakaDay = Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), dhakaNow.getUTCDate())
  const exams = []

  for (let offset = -14; offset <= 21; offset++) {
    const day = dhakaDay + offset * DAY_MS
    const date = new Date(day)
    const serial = Math.floor(day / DAY_MS)
    const index = ((serial % LIVE_TOPIC_ROTATION.length) + LIVE_TOPIC_ROTATION.length) % LIVE_TOPIC_ROTATION.length
    const slot = LIVE_TOPIC_ROTATION[index]
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const dayOfMonth = date.getUTCDate()
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`
    const startsAt = Date.UTC(year, month, dayOfMonth, LIVE_START_UTC_HOUR)
    const endsAt = startsAt + LIVE_WINDOW_MS
    const status = now < startsAt ? 'upcoming' : now < endsAt ? 'live' : 'past'

    exams.push({
      id: `daily-${dateKey}`,
      dateKey,
      startsAt,
      endsAt,
      status,
      subject: slot.subject,
      topic: slot.topic,
      questions: 25,
      minutes: 20,
      title: `ডেইলি লাইভ • ${slot.topic}`
    })
  }

  return exams
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
  const hours = Math.floor((remaining % DAY_MS) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return `${days ? `${bnDigits(days)} দিন ` : ''}${padBn(hours)}:${padBn(minutes)}:${padBn(seconds)}`
}
