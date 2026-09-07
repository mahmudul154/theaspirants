import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TODAY_MODEL_EXAM_COUNTS, TODAY_MODEL_EXAM_QUESTIONS } from '../src/todays-model-exam.js'

const EXAM_ID = 'today-model-test-2026-09-07-2330'
const questions = TODAY_MODEL_EXAM_QUESTIONS

assert.equal(questions.length, 100, 'The live paper must have 100 questions')
assert.deepEqual(TODAY_MODEL_EXAM_COUNTS, {
  total: 100,
  bangla: 40,
  generalKnowledge: 30,
  mentalAbility: 30
}, 'The required 40/30/30 distribution changed')
assert.equal(new Set(questions.map(question => question.id)).size, 100, 'Question ids must be unique')
assert.deepEqual(questions.map(question => question.display_order), Array.from({ length: 100 }, (_, index) => index + 1), 'The supplied display order must be continuous')
assert.deepEqual([...questions].sort((a, b) => a.source_order - b.source_order).map(question => question.source_order), Array.from({ length: 100 }, (_, index) => index + 1), 'The source bank must be a complete 100-question permutation')

questions.forEach((question, index) => {
  assert.equal(question.id, `today-model-2026-09-07-${String(index + 1).padStart(3, '0')}`)
  assert.equal(question.options.length, 4, `Question ${index + 1} needs exactly four choices`)
  assert.equal(new Set(question.options).size, 4, `Question ${index + 1} has duplicate choices`)
  assert.ok(Number.isInteger(question.answer_index) && question.answer_index >= 0 && question.answer_index < 4, `Question ${index + 1} has an invalid answer index`)
  assert.equal(question.options[question.answer_index], question.answer, `Question ${index + 1} answer and answer index disagree`)
  assert.equal(typeof question.explanation, 'string', `Question ${index + 1} has no teacher explanation`)
  assert.ok(question.explanation.trim().length >= 30 && !/[\r\n]/.test(question.explanation), `Question ${index + 1} explanation must be one complete paragraph`)
})

// Independent calculation checks for every mathematical/clock answer in the supplied set.
const expectedCalculatedAnswers = new Map([
  ['একটি ত্রিভুজের দুটি কোণ ৪৮°', '৬৫°'],
  ['একটি সমদ্বিবাহু ত্রিভুজের সমান দুটি কোণ ৭২°', '৩৬°'],
  ['একটি সমকোণী ত্রিভুজের লম্ব দুটি বাহু ৬ সেমি ও ৮ সেমি', '১০ সেমি'],
  ['একটি ত্রিভুজের ভূমি ১৬ সেমি এবং উচ্চতা ৯ সেমি', '৭২ বর্গসেমি'],
  ['একটি বর্গক্ষেত্রের ক্ষেত্রফল ১৪৪ বর্গসেমি', '৪৮ সেমি'],
  ['ব্যাসার্ধ ৭ সেমি একটি বৃত্তের পরিধি', '৪৪ সেমি'],
  ['ব্যাসার্ধ ৭ সেমি একটি বৃত্তের ক্ষেত্রফল', '১৫৪ বর্গসেমি'],
  ['দৈর্ঘ্য ১৫ সেমি ও প্রস্থ ৮ সেমি', '১৭ সেমি'],
  ['একটি সুষম ষড়ভুজের প্রতিটি অন্তঃকোণের মান', '১২০°'],
  ['একটি সরলকোণের একটি অংশ ১১৮°', '৬২°'],
  ['দুই দূরবর্তী অন্তঃকোণ ৪৫° ও ৬০°', '১০৫°'],
  ['একটি রম্বসের কর্ণ দুটি ১২ সেমি ও ১০ সেমি', '৬০ বর্গসেমি'],
  ['একটি ট্রাপিজিয়ামের সমান্তরাল বাহু ১২ সেমি ও ১৮ সেমি', '৯০ বর্গসেমি'],
  ['একটি অর্ধবৃত্তের ক্ষেত্রফল', '৭৭ বর্গসেমি'],
  ['একটি বর্গক্ষেত্রের কর্ণ ১০√২ সেমি', '১০০ বর্গসেমি'],
  ['ঠিক ৩:০০টায়', '৯০°'],
  ['ঠিক ৬:০০টায়', '১৮০°'],
  ['২:৩০টায়', '১০৫°'],
  ['৪:২০টায়', '১০°'],
  ['৭:২০টায়', '১০০°'],
  ['১২টার পরে প্রথমবার', '১টা ৫ ৫/১১ মিনিটে'],
  ['ঠিক ৫:০০টায়', '১৫০°'],
  ['৯:১৫টায়', '১৭২° ৩০′'],
  ['প্রতি ঘণ্টায় ৫ মিনিট এগিয়ে যায়', '৯টা'],
  ['২৪ ঘণ্টায় ১০ মিনিট পিছিয়ে যায়', '১১টা ৫৫ মিনিট'],
  ['২৪ ঘণ্টায় ২ মিনিট এগিয়ে যায়', '৩০ মিনিট'],
  ['২৪ ঘণ্টায় মিনিটের কাঁটা ঘণ্টার কাঁটার চেয়ে', '২২ বার'],
  ['১২ ঘণ্টায় ঘণ্টা ও মিনিটের কাঁটা', '১১ বার'],
  ['ঠিক ১:০০টায়', '৩০°'],
  ['দুপুর ১২টায় ১৫ মিনিট এগিয়ে ছিল', 'দুপুর ৩টায়']
])
assert.equal(expectedCalculatedAnswers.size, 30)
for (const [phrase, expectedAnswer] of expectedCalculatedAnswers) {
  const matches = questions.filter(question => question.question.includes(phrase))
  assert.equal(matches.length, 1, `Expected one calculation question containing: ${phrase}`)
  assert.equal(matches[0].answer, expectedAnswer, `Calculation answer changed: ${phrase}`)
}

// High-risk historical anchors are checked separately from the generated answer field.
const expectedHistoricalAnswers = new Map([
  ['‘কবর’ কার লেখা', 'মুনীর চৌধুরী'],
  ['প্রথম সর্বাত্মক হরতাল', '১১ মার্চ ১৯৪৮'],
  ['২০ ফেব্রুয়ারি রাতে ঢাকা শহরে কী জারি', '১৪৪ ধারা'],
  ['বাংলা সনের কত ফাল্গুন', '৮ ফাল্গুন ১৩৫৮'],
  ['আবুল বরকত কী ছিলেন', 'ঢাকা বিশ্ববিদ্যালয়ের এমএ শ্রেণির ছাত্র'],
  ['শফিউর রহমান পেশায়', 'ঢাকা হাইকোর্টের কর্মচারী'],
  ['প্রথম শহীদ মিনার নির্মাণ', 'ঢাকা মেডিকেল কলেজের ছাত্ররা'],
  ['সংবিধানে বাংলাকে উর্দুর পাশাপাশি', '১৯৫৬'],
  ['ইউনেস্কো ২১ ফেব্রুয়ারিকে', '১৭ নভেম্বর ১৯৯৯'],
  ['বাংলাকে পরিষদের ভাষা', 'ধীরেন্দ্রনাথ দত্ত'],
  ['কয়টি সেক্টরে ভাগ', '১১টি'],
  ['চট্টগ্রাম ও পার্বত্য চট্টগ্রাম', 'সেক্টর ১'],
  ['সেক্টর ২-এর কমান্ডার', 'মেজর খালেদ মোশাররফ'],
  ['সেক্টর ৩-এর কমান্ডার', 'মেজর কে. এম. শফিউল্লাহ'],
  ['সেক্টর ৪ ও সেক্টর ৫-এর কমান্ডার', 'মেজর সি. আর. দত্ত ও মেজর মীর শওকত আলী'],
  ['সেক্টর ৬-এর কমান্ডার', 'উইং কমান্ডার এম. খাদের বাশার'],
  ['সেক্টর ৭-এর প্রাথমিক', 'মেজর নাজমুল হক'],
  ['সেক্টর ৮-এর প্রাথমিক', 'মেজর আবু ওসমান চৌধুরী'],
  ['সেক্টর ৯-এর কমান্ডার', 'মেজর এম. এ. জলিল'],
  ['সেক্টর ১০ মূলত', 'নৌ-কমান্ডো অভিযান'],
  ['মেজর আবু তাহের', 'সেক্টর ১১'],
  ['১ মার্চ জাতীয় পরিষদের', 'জেনারেল ইয়াহিয়া খান'],
  ['৩ মার্চ জাতীয় পরিষদের অধিবেশন কোথায়', 'ঢাকায়'],
  ['প্রথম স্বাধীন বাংলাদেশের পতাকা', 'আ স ম আবদুর রব'],
  ['স্বাধীনতার ইশতেহার পাঠ', 'শাজাহান সিরাজ'],
  ['৭ মার্চের ঐতিহাসিক ভাষণ কোথায়', 'রেসকোর্স ময়দানে'],
  ['অসহযোগ আন্দোলন আনুষ্ঠানিকভাবে', '২৫ মার্চ'],
  ['২৩ মার্চ পূর্ব বাংলায়', 'প্রতিরোধ দিবস'],
  ['অপারেশন সার্চলাইট', '২৫ মার্চ ১৯৭১'],
  ['২৬ মার্চ বাংলাদেশে', 'স্বাধীনতা দিবস']
])
assert.equal(expectedHistoricalAnswers.size, 30)
for (const [phrase, expectedAnswer] of expectedHistoricalAnswers) {
  const matches = questions.filter(question => question.question.includes(phrase))
  assert.equal(matches.length, 1, `Expected one historical question containing: ${phrase}`)
  assert.equal(matches[0].answer, expectedAnswer, `Historical answer changed: ${phrase}`)
}

// The SQL migration is a full, lossless seed of the same canonical live set.
const sql = readFileSync(new URL('../supabase/seed-live-model-exam-2026-09-07.sql', import.meta.url), 'utf8')
const match = sql.match(/jsonb_to_recordset\(\$seed\$\n([\s\S]*?)\n\$seed\$::jsonb\)/)
assert.ok(match, 'Could not locate the embedded SQL seed JSON')
const seedRows = JSON.parse(match[1])
assert.equal(seedRows.length, 100, 'SQL seed must contain 100 rows')
assert.deepEqual(seedRows, questions.map(({ id, display_order, source_order, subject, topic, question, options, answer, answer_index, explanation, post_name, exam_tag }) => ({
  id, exam_id: EXAM_ID, display_order, source_order, subject, topic, question, options, answer, answer_index, explanation, post_name, exam_tag, is_active: true
})), 'SQL seed differs from the live-paper source')

console.log('✓ Today’s live model test validated: 100 unique, ordered, explained questions; 40/30/30 split; all calculations, historical anchors, and SQL seed match.')
