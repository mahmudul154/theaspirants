// Explicit, short-lived allowlist for pre-launch verification of the published
// live papers. Test mode never saves an official attempt, profile score, or
// leaderboard result.
export const LIVE_TEST_ALLOWED_EXAM_ID = 'bcs-40-day-model-2026-09-08'
export const LIVE_TEST_ADDITIONAL_EXAM_IDS = [
  'bcs-40-day-model-2026-09-10',
  'bcs-40-day-model-2026-09-11',
  'bcs-40-day-model-2026-09-12'
]
export const LIVE_TEST_ADMIN_EMAILS = ['aakashh060@gmail.com']
export const LIVE_TEST_TODAY_EMAIL = 'rayhan393393@gmail.com'
export const LIVE_TEST_TODAY_EXAM_ID = 'bcs-40-day-model-2026-09-11'

const allowedExamIds = new Set([LIVE_TEST_ALLOWED_EXAM_ID, ...LIVE_TEST_ADDITIONAL_EXAM_IDS])

export function canRunLiveTest(email, requestedExamId) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!allowedExamIds.has(requestedExamId)) return false
  if (LIVE_TEST_ADMIN_EMAILS.includes(normalizedEmail)) return true
  return requestedExamId === LIVE_TEST_TODAY_EXAM_ID && normalizedEmail === LIVE_TEST_TODAY_EMAIL
}
