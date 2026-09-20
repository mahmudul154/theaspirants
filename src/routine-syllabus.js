// Date-serial view of the published routine, built for the custom-exam topic
// picker.
//
// The routine (`forty-day-live-plan.js`) stores exact database topic values,
// while the picker lists the learner-friendly names from `topics.json`. Those
// two spellings do not always match byte-for-byte: some records use decomposed
// Bengali characters (য + ় instead of য়), some differ in spacing around a
// slash, and a few keep a historical label that `DB_TOPIC_ALIASES` already maps
// to its modern picker name. Resolving here means every date group selects
// topics the picker (and therefore the question query) actually understands.
//
// This module is intentionally dependency-free and pure so `scripts/` can
// validate the mapping under plain Node.

const toNfc = value => String(value || '').normalize('NFC')
const collapseSpaces = value => toNfc(value).replace(/\s+/g, ' ').trim()
const tightSlashes = value => collapseSpaces(value).replace(/\s*\/\s*/g, '/')

// Per-subject lookup tables: picker topic name keyed by each spelling variant
// we may encounter in a routine plan.
export function buildSubjectIndex(displayTopics, topicAliases) {
  const display = [...(displayTopics || [])]
  const variants = new Map()

  const register = (key, pickerTopic) => {
    if (!key) return
    if (!variants.has(key)) variants.set(key, pickerTopic)
  }

  for (const topic of display) {
    register(topic, topic)
    register(toNfc(topic), topic)
    register(collapseSpaces(topic), topic)
    register(tightSlashes(topic), topic)
  }

  // `DB_TOPIC_ALIASES` maps a picker name to the database spellings behind it.
  // Invert it so a routine/database spelling finds its picker name.
  for (const [pickerTopic, databaseTopics] of Object.entries(topicAliases || {})) {
    if (!display.includes(pickerTopic)) continue
    for (const databaseTopic of databaseTopics || []) {
      register(databaseTopic, pickerTopic)
      register(toNfc(databaseTopic), pickerTopic)
      register(collapseSpaces(databaseTopic), pickerTopic)
      register(tightSlashes(databaseTopic), pickerTopic)
    }
  }

  return { display, variants }
}

/**
 * Resolve one routine/database topic spelling to the picker topic name.
 * Returns `null` when the subject has no matching picker topic.
 */
export function pickerTopicFor(index, topic) {
  if (!index || !topic) return null
  return index.variants.get(topic)
    || index.variants.get(toNfc(topic))
    || index.variants.get(collapseSpaces(topic))
    || index.variants.get(tightSlashes(topic))
    || null
}

/**
 * Build the date-serial syllabus.
 *
 * @param {object} options
 * @param {Record<string, any>} options.routine        published routine keyed by date
 * @param {Record<string, string[]>} options.topics    picker topic lists per subject
 * @param {Record<string, string[]>} options.topicAliases database spellings per picker topic
 * @returns {Array<{dateKey: string, day: number, revision: boolean, title: string,
 *                  subjects: Array<{subject: string, topics: string[]}>, topics: string[],
 *                  unresolved: Array<{subject: string, topic: string}>}>}
 */
export function buildRoutineSyllabus({ routine, topics, topicAliases } = {}) {
  const indexes = new Map()
  const indexFor = subject => {
    if (!indexes.has(subject)) indexes.set(subject, buildSubjectIndex(topics?.[subject], topicAliases))
    return indexes.get(subject)
  }

  return Object.keys(routine || {}).sort().flatMap(dateKey => {
    const entry = routine[dateKey]
    if (!entry || entry.rest || !entry.questionPlan?.length) return []

    const subjects = []
    const unresolved = []

    for (const bucket of entry.questionPlan) {
      const index = indexFor(bucket.subject)
      const existing = subjects.find(item => item.subject === bucket.subject)
      const target = existing || { subject: bucket.subject, topics: [] }

      for (const topic of bucket.topics || []) {
        const pickerTopic = pickerTopicFor(index, topic)
        if (!pickerTopic) { unresolved.push({ subject: bucket.subject, topic }); continue }
        if (!target.topics.includes(pickerTopic)) target.topics.push(pickerTopic)
      }

      if (!existing && target.topics.length) subjects.push(target)
    }

    if (!subjects.length) return []

    return [{
      dateKey,
      day: entry.day,
      revision: Boolean(entry.revision),
      title: entry.title || '',
      subjects,
      topics: [...new Set(subjects.flatMap(item => item.topics))],
      unresolved
    }]
  })
}
