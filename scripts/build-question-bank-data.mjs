#!/usr/bin/env node
/**
 * Build the Question Bank catalogue from a raw Supabase metadata export.
 * Usage: node scripts/build-question-bank-data.mjs .post-name-metadata.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { DB_SUBJECT_ALIASES } from '../src/subjectAliases.js'

const input = process.argv[2] || '.post-name-metadata.json'
const output = process.argv[3] || 'src/question-bank-data.json'
const rows = JSON.parse(fs.readFileSync(input, 'utf8'))

const subjectByAlias = new Map()
for (const [canonical, aliases] of Object.entries(DB_SUBJECT_ALIASES)) {
  subjectByAlias.set(canonical, canonical)
  for (const alias of aliases) subjectByAlias.set(alias, canonical)
}

const groups = [
  { id: 'bb', name: 'বাংলাদেশ ব্যাংক', logo: '/assets/institutions/bb.svg', match: /(^|\W)BB(\W|$)|Bangladesh Bank|বাংলাদেশ ব্যাংক/i },
  { id: 'combined-banks', name: 'সমন্বিত ব্যাংক ও আর্থিক প্রতিষ্ঠান', logo: '/assets/institutions/combined-banks.svg', match: /Combined|সমন্বিত|\b\d+\s+Banks?\b|Banks?\s*&\s*(?:FI|\d)/i },
  { id: 'sonali', name: 'সোনালী ব্যাংক', logo: '/assets/institutions/sonali.png', match: /Sonali|সোনালী/i },
  { id: 'janata', name: 'জনতা ব্যাংক', logo: '/assets/institutions/janata.svg', match: /Janata|জনতা ব্যাংক/i },
  { id: 'agrani', name: 'অগ্রণী ব্যাংক', logo: '/assets/institutions/agrani.png', match: /Agrani|অগ্রণী/i },
  { id: 'rupali', name: 'রূপালী ব্যাংক', logo: '/assets/institutions/rupali.png', match: /Rupali|রূপালী/i },
  { id: 'krishi-bank', name: 'বাংলাদেশ কৃষি ব্যাংক', logo: '/assets/institutions/krishi-bank.png', match: /(^|\W)BKB(\W|$)|Krishi Bank|কৃষি ব্যাংক/i },
  { id: 'rakub', name: 'রাজশাহী কৃষি উন্নয়ন ব্যাংক', logo: '/assets/institutions/rakub.png', match: /RAKUB|রাজশাহী কৃষি উন্নয়ন ব্যাংক|রাজশাহী কৃষি উন্নয়ন ব্যাংক/i },
  { id: 'pkb', name: 'প্রবাসী কল্যাণ ব্যাংক', logo: '/assets/institutions/pkb.png', match: /(^|\W)PKB(\W|$)|প্রবাসী কল্যাণ ব্যাংক/i },
  { id: 'pubali', name: 'পূবালী ব্যাংক', logo: '/assets/institutions/pubali.png', match: /Pubali|পূবালী/i },
  { id: 'grameen', name: 'গ্রামীণ ব্যাংক', logo: '/assets/institutions/grameen.svg', match: /Grameen|গ্রামীণ ব্যাংক/i },
  { id: 'banks', name: 'অন্যান্য ব্যাংক ও আর্থিক প্রতিষ্ঠান', logo: '/assets/institutions/banks.svg', match: /Bank|ব্যাংক|FI\b|BIBM|SPCBL|ICB\b|BDBL|BHBFC|SBC\b|GIB\b|UCB\b|SBAC\b|BASIC\b|NCCBL|BAPEX/i },
  { id: 'bpsc', name: 'সরকারি কর্ম কমিশন ও বিসিএস', logo: '/assets/institutions/bpsc.png', match: /BPSC|PSC\b|সরকারি কর্ম কমিশন|পাবলিক সার্ভিস কমিশন|বিসিএস|BCS\b/i },
  { id: 'primary', name: 'প্রাথমিক শিক্ষা', logo: '/assets/institutions/primary.png', match: /প্রাথমিক|DPE\b|ATEO|উপজেলা সহকারী শিক্ষা/i },
  { id: 'railway', name: 'বাংলাদেশ রেলওয়ে', logo: '/assets/institutions/railway.svg', match: /Railway|রেলওয়ে|রেলওয়ের|রেলওয়ের|রেলপথ|বাংলাদেশ রেল/i },
  { id: 'acc', name: 'দুর্নীতি দমন কমিশন', logo: '/assets/institutions/acc.png', match: /দুর্নীতি দমন|দুদক|ACC\b/i },
  { id: 'nsi', name: 'জাতীয় নিরাপত্তা গোয়েন্দা', logo: '/assets/institutions/govt.png', match: /NSI\b|জাতীয় নিরাপত্তা গোয়েন্দা|জাতীয় নিরাপত্তা গোয়েন্দা/i },
  { id: 'food', name: 'খাদ্য অধিদপ্তর', logo: '/assets/institutions/food.png', match: /খাদ্য অধিদপ্তর|Khadya|DGFood/i },
  { id: 'health', name: 'স্বাস্থ্য ও পরিবার কল্যাণ', logo: '/assets/institutions/health.png', match: /স্বাস্থ্য|Health|নার্সিং|Nursing|মিডওয়াইফ|Medical/i },
  { id: 'power', name: 'বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ', logo: '/assets/institutions/power.png', match: /বিদ্যুৎ|Power|PGCB|Petrobangla|পেট্রোবাংলা|RPCL|NESCO|DESCO|BPDB|GTCL|গ্যাস|Gas|জ্বালানি/i },
  { id: 'caab', name: 'বেসামরিক বিমান চলাচল', logo: '/assets/institutions/caab.png', match: /CAAB|বেসামরিক বিমান|বিমান বাংলাদেশ|Civil Aviation|Airport/i },
  { id: 'bcic', name: 'বিসিআইসি ও শিল্প প্রতিষ্ঠান', logo: '/assets/institutions/bcic.png', match: /BCIC|কেমিক্যাল ইন্ডাস্ট্রিজ|জুট মিল|শিল্প মন্ত্রণালয়|শিল্প মন্ত্রণালয়/i },
  { id: 'nbr', name: 'জাতীয় রাজস্ব বোর্ড', logo: '/assets/institutions/govt.png', match: /NBR\b|জাতীয় রাজস্ব|জাতীয় রাজস্ব|রাজস্ব কর্মকর্তা|কর কমিশন|Customs/i },
  { id: 'security', name: 'স্বরাষ্ট্র ও আইন-শৃঙ্খলা', logo: '/assets/institutions/govt.png', match: /পুলিশ|Police|স্বরাষ্ট্র|কারা অধিদপ্তর|Fire Service|ফায়ার সার্ভিস|পাসপোর্ট|Passport|আনসার|Ansar|মাদকদ্রব্য/i },
  { id: 'education', name: 'শিক্ষা ও প্রশিক্ষণ প্রতিষ্ঠান', logo: '/assets/institutions/govt.png', match: /শিক্ষা মন্ত্রণাল|শিক্ষক|ইন্সট্রাক্টর|ইনস্ট্রাক্টর|Education|বিশ্ববিদ্যালয়|University|কলেজ|Academy/i },
  { id: 'agriculture', name: 'কৃষি, মৎস্য ও প্রাণিসম্পদ', logo: '/assets/institutions/govt.png', match: /কৃষি|Agriculture|মৎস্য|Fisher|প্রাণিসম্পদ|Livestock|বন |Forest/i },
  { id: 'infrastructure', name: 'প্রকৌশল, যোগাযোগ ও স্থানীয় সরকার', logo: '/assets/institutions/govt.png', match: /গণপূর্ত|জনস্বাস্থ্য প্রকৌশল|DPHE|BRTA|সড়ক|সড়ক|সেতু|RAJUK|স্থানীয় সরকার|স্থানীয় সরকার|বন্দর|Port|প্রকৌশলী|Engineer/i },
  { id: 'ministries', name: 'মন্ত্রণালয় ও সরকারি অধিদপ্তর', logo: '/assets/institutions/govt.png', match: /মন্ত্রণাল|অধিদপ্তর|পরিদপ্তর|বিভাগ|Department|Ministry|Directorate|সরকারি|কর্তৃপক্ষ|Commission|Corporation/i },
  { id: 'other', name: 'অন্যান্য নিয়োগ পরীক্ষা', logo: '/assets/institutions/other.png', match: /.*/ },
]

const genericExact = new Set([
  'bcs', 'power', 'job solution', 'সাধারণ জ্ঞান', 'ছবি থেকে সংগৃহীত',
  'ছবি থেকে সংগৃহীত, ছবি থেকে সংগৃহীত', 'unknown', 'government exam',
  'বিসিএস ও ব্যাংক পরীক্ষা প্রস্তুতি', "professor\\'s job solution", 'প্রফেসর’স জব সলিউশন'
])
const isUsableSource = (value) => {
  const name = String(value || '').trim()
  if (!name || genericExact.has(name.toLowerCase())) return false
  return name.length >= 4
}

const sourceMap = new Map()
for (const row of rows) {
  const name = String(row.post_name || '').trim()
  const topic = String(row.topic || '')
  if (!isUsableSource(name) || !topic) continue
  const subject = subjectByAlias.get(String(row.subject || '')) || String(row.subject || '').trim() || 'অন্যান্য'
  let source = sourceMap.get(name)
  if (!source) {
    const group = groups.find((item) => item.match.test(name)) || groups.at(-1)
    source = { name, groupId: group.id, total: 0, subjectTopics: new Map() }
    sourceMap.set(name, source)
  }
  source.total += 1
  let topics = source.subjectTopics.get(subject)
  if (!topics) source.subjectTopics.set(subject, topics = new Map())
  topics.set(topic, (topics.get(topic) || 0) + 1)
}

const resultGroups = groups.map(({ id, name, logo }) => ({ id, name, logo, total: 0, sourceCount: 0, sources: [] }))
const resultGroupById = new Map(resultGroups.map((group) => [group.id, group]))
for (const source of sourceMap.values()) {
  const out = {
    name: source.name,
    total: source.total,
    subjects: [...source.subjectTopics.entries()].map(([name, topics]) => ({
      name,
      total: [...topics.values()].reduce((sum, count) => sum + count, 0),
      topics: [...topics.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'bn')),
    })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'bn')),
  }
  const group = resultGroupById.get(source.groupId)
  group.sources.push(out)
  group.total += out.total
  group.sourceCount += 1
}
for (const group of resultGroups) {
  group.sources.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'bn'))
}
resultGroups.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'bn'))

const payload = {
  source: 'supabase-post-name-catalogue',
  generatedAt: new Date().toISOString(),
  totalQuestions: resultGroups.reduce((sum, group) => sum + group.total, 0),
  totalSources: resultGroups.reduce((sum, group) => sum + group.sourceCount, 0),
  groups: resultGroups.filter((group) => group.sourceCount),
}
fs.writeFileSync(output, `${JSON.stringify(payload)}\n`)
console.log(`Wrote ${output}: ${payload.totalSources} exams, ${payload.totalQuestions} questions, ${payload.groups.length} groups`)
for (const group of payload.groups) console.log(`${String(group.total).padStart(5)}  ${String(group.sourceCount).padStart(4)}  ${group.name}`)
