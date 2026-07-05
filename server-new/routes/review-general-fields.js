/**
 * Édition des champs "généraux" (scores analytique/visuel/arômes/texture/effets) d'une fiche
 * technique directement depuis la Chaîne de production — même esprit que review-pipeline-cells.js
 * (upsert ciblé, pas la route PUT lourde de {flower,hash,concentrate}-reviews.js) mais pour des
 * colonnes scalaires plutôt qu'un tableau de cellules de timeline.
 *
 * Whitelist stricte par type — reflet exact de GENERAL_SECTIONS_BY_TYPE
 * (client/src/utils/chainCellPipelines.js) : jamais de nom de colonne dicté par le client.
 */

import express from 'express'
import { prisma } from '../server.js'
import { requireAuth } from '../middleware/auth.js'
import { REVIEW_TYPE_TO_DB } from '../utils/reviewTypeMap.js'

const FIELD_TYPES = {
    flower: {
        thcPercent: 'float', cbdPercent: 'float', cbgPercent: 'float', cbcPercent: 'float', cbnPercent: 'float', thcvPercent: 'float',
        couleurScore: 'float', densiteVisuelle: 'float', trichomesScore: 'float', pistilsScore: 'float', manucureScore: 'float', moisissureScore: 'float', grainesScore: 'float',
        notesOdeursDominantes: 'tags', notesOdeursSecondaires: 'tags', intensiteAromeScore: 'float', complexiteAromeScore: 'float', fideliteAromeScore: 'float',
        dureteScore: 'float', densiteTactileScore: 'float', elasticiteScore: 'float', collantScore: 'float', malleabiliteScore: 'float', friabiliteScore: 'float', viscositeScore: 'float', meltingScore: 'float', residuScore: 'float',
        effetsChoisis: 'tags', monteeScore: 'float', intensiteEffetScore: 'float', intensiteGoutScore: 'float', agressiviteScore: 'float'
    },
    hash: {
        thcPercent: 'float', cbdPercent: 'float', cbgPercent: 'float', cbcPercent: 'float', cbnPercent: 'float', thcvPercent: 'float',
        couleurTransparence: 'float', pureteVisuelle: 'float', densiteVisuelle: 'float', pistils: 'float', moisissure: 'float', graines: 'float',
        notesDominantes: 'tags', notesSecondaires: 'tags', intensiteAromatique: 'float', complexiteAromeScore: 'float', fideliteCultivars: 'float',
        durete: 'float', densiteTactile: 'float', collantScore: 'float', malleabiliteScore: 'float', textureMeltingScore: 'float', textureResiduScore: 'float',
        effetsChoisis: 'tags', monteeRapidite: 'float', intensiteEffets: 'float', intensite: 'float', agressivitePiquant: 'float'
    },
    concentrate: {
        thcPercent: 'float', cbdPercent: 'float', cbgPercent: 'float', cbcPercent: 'float', cbnPercent: 'float', thcvPercent: 'float',
        couleurTransparence: 'float', viscosite: 'float', pureteVisuelle: 'float', melting: 'float', residus: 'float', pistils: 'float', moisissure: 'float',
        notesDominantes: 'tags', notesSecondaires: 'tags', intensiteAromatique: 'float', complexiteAromeScore: 'float', fideliteCultivars: 'float',
        durete: 'float', densiteTactile: 'float', collantScore: 'float', textureMeltingScore: 'float', textureResiduScore: 'float',
        effetsChoisis: 'tags', monteeRapidite: 'float', intensiteEffets: 'float', intensite: 'float', agressivitePiquant: 'float'
    }
}

const MODEL_BY_TYPE = { flower: 'flowerReview', hash: 'hashReview', concentrate: 'concentrateReview' }

const router = express.Router()

router.put('/:reviewType/:reviewId', requireAuth, async (req, res) => {
    try {
        const { reviewType, reviewId } = req.params
        const fieldTypes = FIELD_TYPES[reviewType]
        const modelName = MODEL_BY_TYPE[reviewType]
        if (!fieldTypes || !modelName) {
            return res.status(400).json({ error: 'Invalid reviewType (must be flower, hash or concentrate)' })
        }

        const { fields } = req.body
        if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
            return res.status(400).json({ error: 'fields must be an object' })
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

        const data = {}
        for (const [key, value] of Object.entries(fields)) {
            const type = fieldTypes[key]
            if (!type) continue // clé hors whitelist — ignorée silencieusement, jamais d'écriture arbitraire

            if (type === 'float') {
                if (value === '' || value === null || value === undefined) { data[key] = null; continue }
                const n = Number(value)
                if (!Number.isFinite(n)) continue
                data[key] = n
            } else if (type === 'tags') {
                const arr = Array.isArray(value)
                    ? value
                    : (typeof value === 'string' ? value.split(',').map(v => v.trim()).filter(Boolean) : [])
                data[key] = arr.length > 0 ? JSON.stringify(arr) : null
            }
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' })
        }

        await prisma[modelName].update({ where: { reviewId }, data })

        res.json({ fields: data })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update fields' })
    }
})

export default router
