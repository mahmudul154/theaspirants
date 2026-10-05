// Guard the duplicate-option detector used by scripts/find-duplicate-options.mjs.
// Runs offline: no database access, only classification behaviour.
import assert from 'node:assert/strict'
import { inspect, normalize } from './find-duplicate-options.mjs'

const cases = [
  {
    name: 'clean question',
    row: { id: 1, options: ['ক', 'খ', 'গ', 'ঘ'], answer: 'খ', is_active: true, subject: 'বাংলা' },
    expect: null
  },
  {
    name: 'ambiguous — the repeated value is the answer',
    row: { id: 2, options: ['১২.৫০%', '১২.৫০%', '১২%', '১৩%'], answer: '১২.৫০%', is_active: true, subject: 'গাণিতিক যুক্তি' },
    expect: { severity: 'ambiguous', positions: [[0, 1]] }
  },
  {
    name: 'cosmetic — repeat among the wrong options only',
    row: { id: 3, options: ['২:৫', '৫:৩', '৫:৩', '৭:৩'], answer: '৭:৩', is_active: true, subject: 'গাণিতিক যুক্তি' },
    expect: { severity: 'cosmetic', positions: [[1, 2]] }
  },
  {
    name: 'repeat only after normalization (spacing + case)',
    row: { id: 4, options: ['Digital  Read', 'digital read', 'Analog', 'PWM'], answer: 'Analog', is_active: true, subject: 'English' },
    expect: { severity: 'cosmetic', positions: [[0, 1]] }
  },
  {
    name: 'repeat only after NFC normalization (decomposed য়)',
    row: { id: 5, options: ['এশিয়া মহাদেশ পরিক্রমা', 'এশিয়া মহাদেশ পরিক্রমা', 'আফ্রিকা', 'ইউরোপ'], answer: 'আফ্রিকা', is_active: true, subject: 'আন্তর্জাতিক বিষয়াবলি' },
    expect: { severity: 'cosmetic', positions: [[0, 1]] }
  },
  {
    name: 'three identical options',
    row: { id: 6, options: ['একই', 'একই', 'একই', 'ভিন্ন'], answer: 'একই', is_active: false, subject: 'বাংলা' },
    expect: { severity: 'ambiguous', positions: [[0, 1], [0, 2]] }
  },
  {
    name: 'answer missing from options entirely',
    row: { id: 7, options: ['ক', 'ক', 'গ', 'ঘ'], answer: 'উত্তর নেই', is_active: true, subject: 'বাংলা' },
    expect: { severity: 'cosmetic', positions: [[0, 1]], answerMissing: true }
  },
  {
    name: 'non-array options are skipped, not crashed on',
    row: { id: 8, options: null, answer: 'ক', is_active: true, subject: 'বাংলা' },
    expect: null
  },
  {
    name: 'empty option strings do not count as duplicates',
    row: { id: 9, options: ['', '', 'ক', 'খ'], answer: 'ক', is_active: true, subject: 'বাংলা' },
    expect: null
  }
]

let failures = 0
for (const testCase of cases) {
  const actual = inspect(testCase.row)
  try {
    if (testCase.expect === null) {
      assert.equal(actual, null, 'expected no finding')
    } else {
      assert.ok(actual, 'expected a finding')
      assert.equal(actual.severity, testCase.expect.severity, 'severity')
      assert.deepEqual(actual.repeated_positions, testCase.expect.positions, 'positions')
      if ('answerMissing' in testCase.expect) {
        assert.equal(actual.answer_missing_from_options, testCase.expect.answerMissing, 'answer_missing flag')
      }
    }
    console.log(`✓ ${testCase.name}`)
  } catch (error) {
    failures++
    console.log(`✗ ${testCase.name}\n    ${error.message.split('\n')[0]}\n    actual=${JSON.stringify(actual)}`)
  }
}

// normalization sanity
assert.equal(normalize('  Digital   Read '), 'digital read')
assert.equal(normalize('এশিয়া মহাদেশ পরিক্রমা'.normalize('NFD')), normalize('এশিয়া মহাদেশ পরিক্রমা'))
assert.equal(normalize(null), '')
console.log('✓ normalize()')

console.log(failures ? `\n✗ ${failures} failure(s)` : '\n✓ all detector cases passed')
process.exit(failures ? 1 : 0)
