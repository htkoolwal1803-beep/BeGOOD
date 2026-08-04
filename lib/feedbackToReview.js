/**
 * Turn a feedback submission into a public review.
 *
 * Publishing is opt-in per submission (admin ticks "Show as review"), never
 * automatic. Two reasons that matters:
 *   - feedback forms invite adverse-effect reports, which need a human to read
 *     them before anything is shown to the public;
 *   - internal and test submissions live in the same collection as real ones.
 */

const ADVERSE_QUESTION_HINTS = ['unwanted effect', 'side effect', 'adverse', 'reaction']
const NEGATIVE_ANSWER_NOISE = ['no', 'none', 'nil', 'na', 'n/a', '-', 'nothing', 'no.']

/** Does this submission report an adverse effect that a human should read? */
export function hasAdverseReport(submission) {
  return (submission?.answers || []).some((a) => {
    const q = String(a.question || '').toLowerCase()
    if (!ADVERSE_QUESTION_HINTS.some((h) => q.includes(h))) return false
    const ans = String(a.answer ?? '').trim().toLowerCase()
    if (!ans) return false
    return !NEGATIVE_ANSWER_NOISE.includes(ans)
  })
}

/** The free-text answer most suitable as the review body. */
function pickComment(answers) {
  const longText = answers.filter((a) => a.type === 'long_text' && String(a.answer || '').trim())
  // The general "any feedback" box is usually the last long text and reads best.
  const general = longText.filter((a) => !ADVERSE_QUESTION_HINTS.some((h) => String(a.question || '').toLowerCase().includes(h)))
  const chosen = general[general.length - 1] || null
  return chosen ? String(chosen.answer).trim() : ''
}

/** A 1-5 star rating, from an explicit star question or a 0-10 scale. */
function pickRating(answers) {
  const star = answers.find((a) => a.type === 'star_rating' && typeof a.answer === 'number')
  if (star) return Math.max(1, Math.min(5, Math.round(star.answer)))

  const satisfaction = answers.find(
    (a) => a.type === 'linear_scale' &&
      typeof a.answer === 'number' &&
      String(a.question || '').toLowerCase().includes('satisf')
  )
  if (satisfaction) return Math.max(1, Math.min(5, Math.round(satisfaction.answer / 2)))
  return null
}

/**
 * Map a submission to the review shape used on product pages.
 * Returns null when there is nothing worth showing.
 */
export function feedbackToReview(submission) {
  const answers = submission?.answers || []
  const rating = pickRating(answers)
  const comment = pickComment(answers)
  if (!rating && !comment) return null

  return {
    name: (submission.userName || '').trim() || 'BeGood customer',
    role: 'Verified buyer',
    rating: rating || 5,
    comment,
    date: submission.createdAt,
    incentivised: false,
    source: 'feedback'
  }
}
