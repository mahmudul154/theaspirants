import { SEPTEMBER_8_MATH_SUPPLEMENT } from './september-8-math-supplement.js'
import { SEPTEMBER_9_LIVE_EXAM_QUESTIONS } from './september-9-live-exam.js'

// Day 2 is a source-only paper. The first 76 reviewed rows came from the six
// supplied syllabus PDFs; the remaining seven percentage/profit-loss rows are
// the complete `last.pdf` source. No database questions are mixed into it.
const sourceRows = [
  ...SEPTEMBER_9_LIVE_EXAM_QUESTIONS.map(question => ({
    subject: question.subject,
    topic: question.topic,
    question: question.question,
    options: question.options,
    answerIndex: question.answer_index,
    explanation: question.explanation,
    sourceOrder: question.source_order
  })),
  ...SEPTEMBER_8_MATH_SUPPLEMENT.map(question => ({
    subject: question.subject,
    topic: question.topic,
    question: question.question,
    options: question.options,
    answerIndex: question.answer_index,
    explanation: question.explanation,
    sourceOrder: 76 + question.source_order
  }))
]

// A stable seeded shuffle makes every candidate receive the same mixed paper,
// rather than putting questions in PDF order or giving a different paper per run.
function seededOrder(length, seed) {
  const indexes = Array.from({ length }, (_, index) => index)
  let state = seed >>> 0
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
  for (let index = indexes.length - 1; index > 0; index--) {
    const pick = Math.floor(next() * (index + 1))
    ;[indexes[index], indexes[pick]] = [indexes[pick], indexes[index]]
  }
  return indexes
}

export const SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER = seededOrder(sourceRows.length, 20260908)

if (sourceRows.length !== 83 || new Set(SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER).size !== 83 || Math.min(...SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER) !== 0 || Math.max(...SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER) !== 82) {
  throw new Error('The 8 September live paper must contain all 83 supplied questions exactly once')
}

export const SEPTEMBER_8_LIVE_EXAM_QUESTIONS = SEPTEMBER_8_LIVE_EXAM_SHUFFLED_ORDER.map((sourceIndex, displayIndex) => {
  const row = sourceRows[sourceIndex]
  return {
    id: `live-2026-09-08-${String(displayIndex + 1).padStart(3, '0')}`,
    display_order: displayIndex + 1,
    source_order: row.sourceOrder,
    subject: row.subject,
    topic: row.topic,
    question: row.question,
    options: row.options,
    answer: row.options[row.answerIndex],
    answer_index: row.answerIndex,
    explanation: row.explanation,
    post_name: '৮ সেপ্টেম্বর লাইভ পরীক্ষা',
    exam_tag: 'live-2026-09-08'
  }
})

export const SEPTEMBER_8_LIVE_EXAM_COUNTS = {
  total: SEPTEMBER_8_LIVE_EXAM_QUESTIONS.length,
  english: SEPTEMBER_8_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'English').length,
  generalKnowledge: SEPTEMBER_8_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'আন্তর্জাতিক বিষয়াবলি').length,
  math: SEPTEMBER_8_LIVE_EXAM_QUESTIONS.filter(question => question.subject === 'গাণিতিক যুক্তি').length
}

if (SEPTEMBER_8_LIVE_EXAM_COUNTS.total !== 83 || SEPTEMBER_8_LIVE_EXAM_COUNTS.english !== 30 || SEPTEMBER_8_LIVE_EXAM_COUNTS.generalKnowledge !== 30 || SEPTEMBER_8_LIVE_EXAM_COUNTS.math !== 23 || SEPTEMBER_8_LIVE_EXAM_QUESTIONS.some(question => !question.explanation || question.options[question.answer_index] !== question.answer)) {
  throw new Error('The 8 September live paper is incomplete or has an invalid answer key')
}
