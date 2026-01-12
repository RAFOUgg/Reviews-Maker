import { extractCategoryRatings, extractExtraData, extractPipelines, extractSubstrat, formatDate } from '../utils/orchardHelpers'

export default function ReviewFullDisplay({ review }) {
    if (!review) return null

    // Parse des données JSON avec protection contre les erreurs
    let categoryRatings = []
    let extraData = []
    let pipelines = []
    let substrat = null

    try {
        categoryRatings = extractCategoryRatings(review.categoryRatings, review) || []
    } catch (e) {
}
