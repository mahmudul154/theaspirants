import assert from 'node:assert/strict'
import {
  SEPTEMBER_8_MATH_SUPPLEMENT,
  SEPTEMBER_8_MATH_SUPPLEMENT_COUNT
} from '../src/september-8-math-supplement.js'
import { buildDailyLiveExams } from '../src/live-exams.js'
import { LIVE_TEST_ALLOWED_EXAM_ID, canRunLiveTest } from '../src/live-test-access.js'

const questions = SEPTEMBER_8_MATH_SUPPLEMENT

assert.equal(SEPTEMBER_8_MATH_SUPPLEMENT_COUNT, 7, 'All seven supplied Math questions must be retained')
assert.equal(questions.length, 7, 'Supplement row count changed')
assert.equal(new Set(questions.map(question => question.id)).size, 7, 'Supplement question ids must be unique')
assert.deepEqual(questions.map(question => question.display_order), [1, 2, 3, 4, 5, 6, 7], 'Supplement display order must be continuous')
assert.deepEqual(questions.map(question => question.source_order), [1, 2, 3, 4, 5, 6, 7], 'Supplement source order must be continuous')

for (const [index, question] of questions.entries()) {
  assert.equal(question.subject, 'গাণিতিক যুক্তি', `Question ${index + 1} must remain in Math`)
  assert.equal(question.topic, 'শতকরা ও লাভ-ক্ষতি', `Question ${index + 1} topic changed`)
  assert.equal(question.options.length, 4, `Question ${index + 1} needs four supplied options`)
  assert.equal(new Set(question.options).size, 4, `Question ${index + 1} has duplicate options`)
  assert.ok(Number.isInteger(question.answer_index) && question.answer_index >= 0 && question.answer_index < 4, `Question ${index + 1} has an invalid answer index`)
  assert.equal(question.answer, question.options[question.answer_index], `Question ${index + 1} answer does not match its answer index`)
  assert.ok(question.explanation.trim().length >= 40 && !/[\r\n]/.test(question.explanation), `Question ${index + 1} explanation must be one natural paragraph`)
}

const expectedAnswers = new Map([
  ['profit earned after selling an article for Tk. 3362', 'None of these'],
  ['Mr. Tanvir purchased stock', 'Tk. 3000'],
  ['A man sells two commodities for Tk. 4000 each', 'Tk. 4800'],
  ['loss of 10% if a chair is sold for Tk. 540', 'Tk. 720'],
  ['selling an article for BDT 350 instead of BDT 340', 'BDT 200'],
  ['Alam sold two vehicles for Tk. 4600 each', '1% loss'],
  ['selling a watch for Tk. 1200', 'Tk. 1800']
])
assert.equal(expectedAnswers.size, 7)
for (const [phrase, answer] of expectedAnswers) {
  const matches = questions.filter(question => question.question.includes(phrase))
  assert.equal(matches.length, 1, `Expected exactly one supplied question containing: ${phrase}`)
  assert.equal(matches[0].answer, answer, `Supplied answer changed: ${phrase}`)
}

// 8 September in Asia/Dhaka: use local noon so the daily date key is unambiguous.
const schedule = buildDailyLiveExams(Date.UTC(2026, 8, 8, 6, 0))
const exam = schedule.find(item => item.id === 'bcs-40-day-model-2026-09-08')
assert.ok(exam, 'Could not find the 8 September live exam')
assert.equal(exam.dateKey, '2026-09-08')
assert.equal(exam.startsAt, Date.UTC(2026, 8, 8, 17, 30), 'Exam must start at 23:30 Asia/Dhaka')
assert.equal(exam.endsAt, Date.UTC(2026, 8, 8, 18, 30), 'Exam must end at 00:30 Asia/Dhaka')
assert.equal(exam.minutes, 60, 'Exam duration changed')
assert.equal(exam.questions, 107, 'The regular 100 questions plus all seven supplied Math questions must be shown')
assert.strictEqual(exam.supplementalRows, questions, 'The schedule must attach the exact supplied Math supplement')
assert.deepEqual(exam.distribution, [
  { label: 'ইংরেজি গ্রামার', questions: 40 },
  { label: 'আন্তর্জাতিক বিষয়াবলি', questions: 30 },
  { label: 'গাণিতিক যুক্তি', questions: 37 }
], 'The 8 September visible distribution changed')
assert.equal(exam.questionPlan.at(-1).questions, 30, 'The original planned 30 Math questions must remain')
assert.match(exam.questionPlan.at(-1).label, /অতিরিক্ত শতকরা ও লাভ-ক্ষতি/, 'The added Math topic must be visible in the syllabus')

// Only the specified admin may open this one paper early through test mode.
assert.equal(LIVE_TEST_ALLOWED_EXAM_ID, exam.id, 'Early test access must target today’s 8 September paper only')
assert.ok(canRunLiveTest('aakashh060@gmail.com', exam.id), 'The designated admin must be allowed to test today’s paper')
assert.ok(canRunLiveTest(' AAKASHH060@GMAIL.COM ', exam.id), 'Admin email checks should tolerate casing and surrounding spaces')
assert.ok(!canRunLiveTest('other@example.com', exam.id), 'Other accounts must not get early access')
assert.ok(!canRunLiveTest('aakashh060@gmail.com', 'bcs-40-day-model-2026-09-09'), 'The admin must not get early access to another day')

console.log('✓ 8 September live exam validated: 100 planned questions + 7 supplied Math questions, 40/30/37 distribution, one-paragraph explanations, 23:30–00:30 Asia/Dhaka schedule, and restricted admin test access.')
