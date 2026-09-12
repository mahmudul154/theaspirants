import assert from 'node:assert/strict'
import {
  SEPTEMBER_9_LIVE_EXAM_COUNTS,
  SEPTEMBER_9_LIVE_EXAM_QUESTIONS,
  SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER
} from '../src/september-9-live-exam.js'
import { buildDailyLiveExams } from '../src/live-exams.js'

const questions = SEPTEMBER_9_LIVE_EXAM_QUESTIONS
const sourceOrder = Array.from({ length: 76 }, (_, index) => index + 1)

assert.equal(questions.length, 76, 'The Day 3 paper must have exactly 76 questions')
assert.deepEqual(SEPTEMBER_9_LIVE_EXAM_COUNTS, {
  total: 76,
  english: 30,
  generalKnowledge: 30,
  math: 16
}, 'The required 30 / 30 / 16 distribution changed')
assert.equal(new Set(questions.map(question => question.id)).size, 76, 'Question IDs must be unique')
assert.deepEqual(questions.map(question => question.display_order), sourceOrder, 'Display order must be continuous')
assert.deepEqual([...questions].sort((a, b) => a.source_order - b.source_order).map(question => question.source_order), sourceOrder, 'Every supplied question must appear exactly once')
assert.equal(new Set(SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER).size, 76, 'The deterministic shuffle must be a complete permutation')
assert.notDeepEqual(SEPTEMBER_9_LIVE_EXAM_SHUFFLED_ORDER, Array.from({ length: 76 }, (_, index) => index), 'The fixed paper must be shuffled')

questions.forEach((question, index) => {
  assert.equal(question.id, `live-2026-09-09-${String(index + 1).padStart(3, '0')}`)
  assert.equal(question.options.length, 4, `Question ${index + 1} needs four choices`)
  assert.ok(Number.isInteger(question.answer_index) && question.answer_index >= 0 && question.answer_index < 4, `Question ${index + 1} has an invalid answer index`)
  assert.equal(question.answer, question.options[question.answer_index], `Question ${index + 1} answer and answer index disagree`)
  assert.equal(typeof question.explanation, 'string', `Question ${index + 1} has no explanation`)
  assert.ok(question.explanation.trim().length >= 30 && !/[\r\n]/.test(question.explanation), `Question ${index + 1} explanation must be one natural paragraph`)
})

// All 16 Math answers are independently tied to the supplied source key.
const expectedMathAnswers = new Map([
  ['কোনো আসল ৩ বছরে', '১২.৫০%'],
  ['কোনো সংখ্যার ৪০%-এর সঙ্গে', '৭০'],
  ['কোন সংখ্যার ৬০% থেকে', '২০০'],
  ['কোন পরীক্ষায় ৬৮%', '২০০ জন'],
  ['রাজা তাঁর সম্পদের ১২%', '২৪,০০,০০০ টাকা'],
  ['একটি গাছের উচ্চতা', '৭৫০ সেমি'],
  ['ছোটনের বেতন', '৭০,৮৫০ টাকা'],
  ['তেল বা চিনির মূল্য ২৫%', '২০%'],
  ['১ থেকে ৭০ পর্যন্ত', '২০'],
  ['একটি সংখ্যার ৪০% অন্য', '৫:৩'],
  ['যদি m-এর ৮%', '১০%'],
  ['প্রথম সংখ্যার ৩০%', '২:৩'],
  ['একটি কারখানায় কর্মীর সংখ্যা', '২২০০'],
  ['একজন যাত্রী পণ্যের মূল্যের', 'কোনোটিই নয় (৪৩৭.৫০ টাকা)'],
  ['রিয়াজ তার আয়ের', '১৬%'],
  ['চিনির মূল্য ২০%', '৪% কমে']
])
assert.equal(expectedMathAnswers.size, 16)
for (const [phrase, answer] of expectedMathAnswers) {
  const matches = questions.filter(question => question.question.includes(phrase))
  assert.equal(matches.length, 1, `Expected one supplied Math question containing: ${phrase}`)
  assert.equal(matches[0].answer, answer, `Math answer changed: ${phrase}`)
}

const scheduledExam = buildDailyLiveExams(Date.UTC(2026, 8, 9, 17, 29)).find(exam => exam.dateKey === '2026-09-09')
assert.ok(scheduledExam, 'Day 3 scheduled live exam is missing')
assert.equal(scheduledExam.startsAt, Date.UTC(2026, 8, 9, 17, 30), 'Day 3 must start at 23:30 Asia/Dhaka')
assert.equal(scheduledExam.endsAt, Date.UTC(2026, 8, 10, 8, 0), 'Day 3 must remain open until 14:00 Asia/Dhaka the next day')
assert.equal(scheduledExam.questions, 76, 'Scheduled count and paper count must agree')
assert.equal(scheduledExam.topic, 'Tense, Right Form of Verbs ও Conditionals • বিশ্ব সভ্যতা • শতকরা ও লাভ-ক্ষতি', 'The announced Day 3 syllabus changed')
assert.deepEqual(scheduledExam.questionPlan.map(part => [part.label, part.questions]), [
  ['ইংরেজি: Tense, Right Form of Verbs ও Conditionals', 30],
  ['আন্তর্জাতিক: বিশ্ব সভ্যতা', 30],
  ['গণিত: শতকরা ও লাভ-ক্ষতি', 16]
], 'The source-paper syllabus labels changed')
assert.strictEqual(scheduledExam.rows, questions, 'The scheduled exam must use the fixed source bundle')
assert.deepEqual(scheduledExam.distribution, [
  { label: 'English', questions: 30 },
  { label: 'আন্তর্জাতিক বিষয়াবলি', questions: 30 },
  { label: 'গাণিতিক যুক্তি', questions: 16 }
])

console.log('✓ 9 September live exam validated: source-only 76-question paper, 30 / 30 / 16 split, one-paragraph explanations, fixed shared shuffle, and 23:30–14:00 next-day Asia/Dhaka availability.')
