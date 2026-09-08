import assert from 'node:assert/strict'
import {
  SEPTEMBER_8_LIVE_EXAM_COUNTS,
  SEPTEMBER_8_LIVE_EXAM_QUESTIONS,
  SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER
} from '../src/september-8-live-exam.js'
import { buildDailyLiveExams } from '../src/live-exams.js'
import { LIVE_TEST_ALLOWED_EXAM_ID, canRunLiveTest } from '../src/live-test-access.js'

const questions = SEPTEMBER_8_LIVE_EXAM_QUESTIONS
const sourceOrder = Array.from({ length: 83 }, (_, index) => index + 1)

assert.equal(questions.length, 83, 'Day 2 must contain all 83 supplied PDF questions')
assert.deepEqual(SEPTEMBER_8_LIVE_EXAM_COUNTS, {
  total: 83,
  english: 30,
  generalKnowledge: 30,
  math: 23
}, 'The required 30 / 30 / 23 PDF distribution changed')
assert.equal(new Set(questions.map(question => question.id)).size, 83, 'Question IDs must be unique')
assert.deepEqual(questions.map(question => question.display_order), sourceOrder, 'Display order must be continuous')
assert.deepEqual([...questions].sort((a, b) => a.source_order - b.source_order).map(question => question.source_order), sourceOrder, 'Every supplied question must appear exactly once')
assert.equal(new Set(SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER).size, 83, 'The deterministic shuffle must be a complete permutation')
assert.notDeepEqual(SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER, Array.from({ length: 83 }, (_, index) => index), 'The paper must be shuffled')

questions.forEach((question, index) => {
  assert.equal(question.id, `live-2026-09-08-${String(index + 1).padStart(3, '0')}`)
  assert.equal(question.options.length, 4, `Question ${index + 1} needs four choices`)
  assert.ok(Number.isInteger(question.answer_index) && question.answer_index >= 0 && question.answer_index < 4, `Question ${index + 1} has an invalid answer index`)
  assert.equal(question.answer, question.options[question.answer_index], `Question ${index + 1} answer and answer index disagree`)
  assert.equal(typeof question.explanation, 'string', `Question ${index + 1} has no explanation`)
  assert.ok(question.explanation.trim().length >= 30 && !/[\r\n]/.test(question.explanation), `Question ${index + 1} explanation must be one natural paragraph`)
})

// All seven questions from last.pdf must be in Day 2—not merely present in an
// unused source file—and must retain their supplied answer key.
const expectedLastPdfAnswers = new Map([
  ['profit earned after selling an article for Tk. 3362', 'None of these'],
  ['Mr. Tanvir purchased stock', 'Tk. 3000'],
  ['A man sells two commodities for Tk. 4000 each', 'Tk. 4800'],
  ['loss of 10% if a chair is sold for Tk. 540', 'Tk. 720'],
  ['selling an article for BDT 350 instead of BDT 340', 'BDT 200'],
  ['Alam sold two vehicles for Tk. 4600 each', '1% loss'],
  ['selling a watch for Tk. 1200', 'Tk. 1800']
])
assert.equal(expectedLastPdfAnswers.size, 7)
for (const [phrase, answer] of expectedLastPdfAnswers) {
  const matches = questions.filter(question => question.question.includes(phrase))
  assert.equal(matches.length, 1, `Expected exactly one last.pdf question containing: ${phrase}`)
  assert.equal(matches[0].answer, answer, `Supplied answer changed: ${phrase}`)
  assert.equal(matches[0].subject, 'গাণিতিক যুক্তি', `last.pdf question must remain in Math: ${phrase}`)
}

// 8 September in Asia/Dhaka: use local noon so the daily date key is unambiguous.
const schedule = buildDailyLiveExams(Date.UTC(2026, 8, 8, 6, 0))
const exam = schedule.find(item => item.id === 'bcs-40-day-model-2026-09-08')
assert.ok(exam, 'Could not find the 8 September live exam')
assert.equal(exam.dateKey, '2026-09-08')
assert.equal(exam.startsAt, Date.UTC(2026, 8, 8, 17, 30), 'Exam must start at 23:30 Asia/Dhaka')
assert.equal(exam.endsAt, Date.UTC(2026, 8, 8, 18, 30), 'Exam must end at 00:30 Asia/Dhaka')
assert.equal(exam.minutes, 60, 'Exam duration changed')
assert.equal(exam.questions, 83, 'Scheduled count and source paper count must agree')
assert.strictEqual(exam.rows, questions, 'Day 2 must use the exact source-only PDF bundle')
assert.deepEqual(exam.distribution, [
  { label: 'English', questions: 30 },
  { label: 'বিশ্ব সভ্যতা', questions: 30 },
  { label: 'গাণিতিক যুক্তি', questions: 23 }
], 'The Day 2 visible distribution changed')
assert.deepEqual(exam.questionPlan.map(part => [part.label, part.questions]), [
  ['ইংরেজি: Tense, Right Form of Verbs ও Conditionals', 30],
  ['সাধারণ জ্ঞান: বিশ্ব সভ্যতা', 30],
  ['গণিত: শতকরা ও লাভ-ক্ষতি', 23]
], 'The announced Day 2 syllabus labels changed')

// Only the specified admin may open this one paper early through test mode.
assert.equal(LIVE_TEST_ALLOWED_EXAM_ID, exam.id, 'Early test access must target today’s 8 September paper only')
assert.ok(canRunLiveTest('aakashh060@gmail.com', exam.id), 'The designated admin must be allowed to test today’s paper')
assert.ok(canRunLiveTest(' AAKASHH060@GMAIL.COM ', exam.id), 'Admin email checks should tolerate casing and surrounding spaces')
assert.ok(!canRunLiveTest('other@example.com', exam.id), 'Other accounts must not get early access')
assert.ok(!canRunLiveTest('aakashh060@gmail.com', 'bcs-40-day-model-2026-09-09'), 'The admin must not get early access to another day')

console.log('✓ 8 September live exam validated: source-only 83-question PDF paper, 30 / 30 / 23 split, deterministic shuffle, one-paragraph explanations, 23:30–00:30 Asia/Dhaka schedule, and restricted admin test access.')
