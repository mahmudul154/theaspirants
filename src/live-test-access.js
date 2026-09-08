// Explicit, short-lived allowlist for the pre-launch verification of the
// 8 September 2026 live paper. This path always runs in test mode and never
// saves an official attempt, profile score, or leaderboard result.
export const LIVE_TEST_ALLOWED_EXAM_ID = 'bcs-40-day-model-2026-09-08'
export const LIVE_TEST_ADMIN_EMAILS = ['aakashh060@gmail.com']

export function canRunLiveTest(email, requestedExamId) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  return requestedExamId === LIVE_TEST_ALLOWED_EXAM_ID
    && LIVE_TEST_ADMIN_EMAILS.includes(normalizedEmail)
}
