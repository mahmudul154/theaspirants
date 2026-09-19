// Explicit, short-lived allowlist for pre-launch verification of the published
// live papers. Test mode never saves an official attempt, profile score, or
// leaderboard result.
export const LIVE_TEST_ALLOWED_EXAM_ID = 'bcs-40-day-model-2026-09-08'
export const LIVE_TEST_ADDITIONAL_EXAM_IDS = [
  'bcs-40-day-model-2026-09-10',
  'bcs-40-day-model-2026-09-11',
  'bcs-40-day-model-2026-09-12',
  'bcs-40-day-model-2026-09-14',
  'bcs-40-day-model-2026-09-15',
  'bcs-40-day-model-2026-09-18'
]
export const LIVE_TEST_ADMIN_EMAILS = ['aakashh060@gmail.com']
export const LIVE_TEST_TODAY_EMAIL = 'aakashh060@gmail.com'
export const LIVE_TEST_TODAY_EXAM_ID = 'bcs-40-day-model-2026-09-18'
// Official retake permission for a still-live paper (for example, after an
// accidental auto-submit). Unlike test mode, the attempt is recorded and
// enters the live leaderboard, where the best score is kept.
export const LIVE_RETAKE_ALLOWED = []
export function canRetakeLiveExam(email, examId) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  return LIVE_RETAKE_ALLOWED.some(entry =>
    entry.email === normalizedEmail
    && (!entry.examIds?.length || entry.examIds.includes(examId)))
}

const allowedExamIds = new Set([LIVE_TEST_ALLOWED_EXAM_ID, ...LIVE_TEST_ADDITIONAL_EXAM_IDS])

export function canRunLiveTest(email, requestedExamId) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!allowedExamIds.has(requestedExamId)) return false
  if (LIVE_TEST_ADMIN_EMAILS.includes(normalizedEmail)) return true
  return requestedExamId === LIVE_TEST_TODAY_EXAM_ID && normalizedEmail === LIVE_TEST_TODAY_EMAIL
}
