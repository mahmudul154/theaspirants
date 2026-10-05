// Guard the custom-exam date serial: every topic in the published routine must
// resolve to a picker topic name, otherwise a learner would see a date group
// that silently selects nothing.
//
// Runs under plain Node (no bundler), so the JSON catalogue is read from disk
// and the resolver is imported as a pure module.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { buildRoutineSyllabus, buildSubjectIndex, pickerTopicFor } from '../src/routine-syllabus.js'
import { DB_TOPIC_ALIASES } from '../src/topicAliases.js'
import { SEPTEMBER_2026_ROUTINE } from '../src/forty-day-live-plan.js'

const TOPICS = JSON.parse(fs.readFileSync(new URL('../src/topics.json', import.meta.url), 'utf8'))

const syllabus = buildRoutineSyllabus({
  routine: SEPTEMBER_2026_ROUTINE,
  topics: TOPICS,
  topicAliases: DB_TOPIC_ALIASES
})

const examDays = Object.entries(SEPTEMBER_2026_ROUTINE).filter(([, entry]) => !entry.rest && entry.questionPlan?.length)

assert.ok(syllabus.length > 0, 'The routine syllabus must not be empty')
assert.equal(syllabus.length, examDays.length,
  `Every scheduled exam day must appear in the syllabus (expected ${examDays.length}, got ${syllabus.length})`)

// Dates must stay in chronological order and day numbers must ascend.
const dateKeys = syllabus.map(day => day.dateKey)
assert.deepEqual(dateKeys, [...dateKeys].sort(), 'Syllabus dates must be chronological')
for (let index = 1; index < syllabus.length; index++) {
  assert.ok(syllabus[index].day > syllabus[index - 1].day,
    `Day numbers must ascend: ${syllabus[index - 1].dateKey} (day ${syllabus[index - 1].day}) → ${syllabus[index].dateKey} (day ${syllabus[index].day})`)
}

// No routine topic may be dropped, and every resolved topic must be selectable.
let planTopics = 0
let resolvedTopics = 0
const unresolved = []
for (const day of syllabus) {
  for (const entry of day.unresolved) unresolved.push(`${day.dateKey} • ${entry.subject} • ${entry.topic}`)
  for (const subject of day.subjects) {
    assert.ok(subject.topics.length > 0, `${day.dateKey}: ${subject.subject} has no topics`)
    for (const topic of subject.topics) {
      resolvedTopics++
      assert.ok((TOPICS[subject.subject] || []).includes(topic),
        `${day.dateKey}: "${topic}" is not a picker topic of ${subject.subject}`)
      // Selecting it must expand to at least one database topic value.
      assert.ok((DB_TOPIC_ALIASES[topic] || [topic]).length > 0,
        `${day.dateKey}: "${topic}" resolves to no database topic`)
    }
    // No duplicates inside a subject for one day.
    assert.equal(new Set(subject.topics).size, subject.topics.length,
      `${day.dateKey}: duplicate topics for ${subject.subject}`)
  }
  assert.equal(new Set(day.topics).size, day.topics.length, `${day.dateKey}: duplicate day topics`)
}

for (const [, entry] of examDays) {
  for (const bucket of entry.questionPlan) planTopics += (bucket.topics || []).length
}

assert.deepEqual(unresolved, [], `Unresolved routine topics:\n  ${unresolved.join('\n  ')}`)

// Sanity check the resolver against the spelling variants that actually occur
// in the published routine. Each routine spelling must land on a real picker
// topic, and must differ byte-for-byte from it — that difference is exactly the
// normalization this module exists to absorb.
const variantChecks = [
  ['আন্তর্জাতিক বিষয়াবলি', 'এশিয়া মহাদেশ পরিক্রমা'],   // decomposed য়
  ['গাণিতিক যুক্তি', 'ক্রয়মূল্য নির্ণয়'],                // decomposed য়
  ['মানসিক দক্ষতা', 'ঘড়ি ও ক্যালেন্ডার'],                  // decomposed ড়
  ['বাংলাদেশ বিষয়াবলি', 'অস্থায়ী/প্রবাসী সরকার'],      // slash spacing
  ['বাংলাদেশ বিষয়াবলি', '৬৯ এর গণঅভ্যথ্যান']             // historical spelling via alias
]
for (const [subject, routineSpelling] of variantChecks) {
  const index = buildSubjectIndex(TOPICS[subject], DB_TOPIC_ALIASES)
  const resolved = pickerTopicFor(index, routineSpelling)
  assert.ok(resolved, `resolver must map "${routineSpelling}" for ${subject}`)
  assert.ok((TOPICS[subject] || []).includes(resolved),
    `resolver output "${resolved}" must be a picker topic of ${subject}`)
  assert.notEqual(resolved, routineSpelling,
    `"${routineSpelling}" is a spelling-variant fixture and must need normalization`)
}

const dayCount = syllabus.length
const subjectCount = new Set(syllabus.flatMap(day => day.subjects.map(item => item.subject))).size
console.log(`✓ Routine syllabus validated: ${dayCount} exam days (দিন ${syllabus[0].day} → ${syllabus[syllabus.length - 1].day}), ${subjectCount} subjects, ${planTopics} plan topics → ${resolvedTopics} selectable topics, 0 unresolved.`)
