/**
 * Routes pour éditer une cellule de pipeline (culture/curing/séparation/extraction) directement
 * depuis la chaîne de production — permet au producteur de compléter la trame d'une fiche
 * technique sans revenir sur le formulaire de review, tout en écrivant dans les mêmes colonnes
 * que celui-ci (cultureTimelineData/curingTimelineData/separationTimelineData/extractionTimelineData).
 *
 * Volontairement séparé des routes PUT /:id lourdes de {flower,hash,concentrate}-reviews.js
 * (multipart, validation complète du formulaire) : ici on ne touche jamais qu'un seul tableau
 * JSON, sans repasser par toute la validation de review.
 */

import express from 'express'
import { prisma } from '../server.js'
import { requireAuth } from '../middleware/auth.js'
import { REVIEW_TYPE_TO_DB } from '../utils/reviewTypeMap.js'

const router = express.Router()

// Whitelist stricte colonne <- (reviewType, pipelineKey) — jamais dérivée d'une chaîne fournie
// par le client, pour ne jamais construire un nom de colonne Prisma dynamiquement.
const PIPELINE_COLUMNS = {
    flower: { model: 'flowerReview', culture: 'cultureTimelineData', curing: 'curingTimelineData' },
    hash: { model: 'hashReview', separation: 'separationTimelineData', curing: 'curingTimelineData' },
    concentrate: { model: 'concentrateReview', extraction: 'extractionTimelineData', curing: 'curingTimelineData' }
}

router.put('/:reviewType/:reviewId/:pipelineKey', requireAuth, async (req, res) => {
    try {
        const { reviewType, reviewId, pipelineKey } = req.params
        const pipelineConfig = PIPELINE_COLUMNS[reviewType]
        const dataColumn = pipelineConfig?.[pipelineKey]

        if (!pipelineConfig || !dataColumn) {
            return res.status(400).json({ error: 'Invalid reviewType/pipelineKey combination' })
        }

        const { timestamp, data } = req.body
        if (timestamp === undefined || timestamp === null || timestamp === '') {
            return res.status(400).json({ error: 'timestamp is required' })
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return res.status(400).json({ error: 'data must be an object' })
        }
        // Relevé à 200KB (au lieu de 20KB) — un utilisateur qui attache beaucoup de photos/vidéos
        // à une seule cellule (chacune référencée par une petite métadonnée url/type/caption, le
        // fichier lui-même étant déjà uploadé via /api/media-upload) ne doit pas être bloqué par
        // un plafond pensé pour des champs de formulaire classiques.
        if (JSON.stringify(data).length > 200_000) {
            return res.status(400).json({ error: 'Cell data payload is too large' })
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            select: { id: true, authorId: true, type: true }
        })

        if (!review || review.type !== REVIEW_TYPE_TO_DB[reviewType]) {
            return res.status(404).json({ error: 'Review not found' })
        }
        if (review.authorId !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own reviews' })
        }

        const model = prisma[pipelineConfig.model]
        const sub = await model.findUnique({ where: { reviewId }, select: { [dataColumn]: true } })
        if (!sub) {
            return res.status(404).json({ error: 'Pipeline data not found for this review' })
        }

        let entries = []
        try {
            entries = sub[dataColumn] ? JSON.parse(sub[dataColumn]) : []
        } catch {
            entries = []
        }
        if (!Array.isArray(entries)) entries = []

        const newEntry = { ...data, timestamp }
        const idx = entries.findIndex(e => String(e?.timestamp) === String(timestamp))
        if (idx >= 0) entries[idx] = newEntry
        else entries.push(newEntry)

        await model.update({
            where: { reviewId },
            data: { [dataColumn]: JSON.stringify(entries) }
        })

        res.json({ timestamp, data: newEntry })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update pipeline cell' })
    }
})

export default router
