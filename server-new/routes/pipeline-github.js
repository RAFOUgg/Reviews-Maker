import express from 'express'
import { prisma } from '../server.js'
import { asyncHandler, Errors, requireAuthOrThrow } from '../utils/errorHandler.js'

const router = express.Router()

// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
    const _isAuthFunc = typeof req.isAuthenticated === 'function'
    if (!_isAuthFunc || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }
    next()
}

/**
 * POST /api/pipeline-github
 * Créer ou mettre à jour un pipeline GitHub pour une review
 * Body: {
 *   reviewId: string,
 *   reviewType: 'flower' | 'hash' | 'concentrate' | 'edible',
 *   pipelineType: 'culture' | 'curing' | 'extraction' | 'separation' | 'recipe' | 'purification',
 *   intervalType: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'phase',
 *   startDate?: Date,
 *   endDate?: Date,
 *   curingType?: 'froid' | 'chaud',
 *   curingDuration?: number,
 *   cells: { [cellIndex: string]: { intensity, temperature, humidity, container, packaging, notes } }
 * }
 */
router.post('/', requireAuth, asyncHandler(async (req, res) => {
    const {
        reviewId,
        reviewType,
        pipelineType,
        intervalType,
        startDate,
        endDate,
        curingType,
        curingDuration,
        cells
    } = req.body

    // Validation
    if (!reviewId || !reviewType || !pipelineType || !intervalType || !cells) {
        throw Errors.VALIDATION_ERROR({
            reviewId: !reviewId ? 'reviewId is required' : null,
            reviewType: !reviewType ? 'reviewType is required' : null,
            pipelineType: !pipelineType ? 'pipelineType is required' : null,
            intervalType: !intervalType ? 'intervalType is required' : null,
            cells: !cells ? 'cells is required' : null
        })
    }

    // Vérifier que la review appartient à l'utilisateur
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { authorId: true }
    })

    if (!review) {
        throw Errors.NOT_FOUND('Review not found')
    }

    if (review.authorId !== req.user.id) {
        throw Errors.FORBIDDEN('You do not own this review')
    }

    // Calculer les statistiques
    const cellsData = typeof cells === 'string' ? JSON.parse(cells) : cells
    const cellsArray = Object.values(cellsData)
    const totalCells = cellsArray.length
    const filledCells = cellsArray.filter(cell => cell && cell.intensity > 0).length
    const completionRate = totalCells > 0 ? (filledCells / totalCells) * 100 : 0

    // Chercher un pipeline existant pour cette review/type
    const existingPipeline = await prisma.pipelineGithub.findFirst({
        where: {
            reviewId,
            pipelineType
        }
    })

    const pipelineData = {
        reviewId,
        reviewType,
        pipelineType,
        intervalType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        curingType: curingType || null,
        curingDuration: curingDuration || null,
        cells: typeof cells === 'string' ? cells : JSON.stringify(cells),
        totalCells,
        filledCells,
        completionRate,
        updatedAt: new Date()
    }

    let pipeline

    if (existingPipeline) {
        // Mettre à jour
        pipeline = await prisma.pipelineGithub.update({
            where: { id: existingPipeline.id },
            data: pipelineData
        })
    } else {
        // Créer
        pipeline = await prisma.pipelineGithub.create({
            data: {
                ...pipelineData,
                createdAt: new Date()
            }
        })

        // Mettre à jour le champ correspondant dans la review spécifique
        await updateReviewPipelineReference(reviewType, pipelineType, reviewId, pipeline.id)
    }

    res.json({
        success: true,
        pipeline: {
            ...pipeline,
            cells: JSON.parse(pipeline.cells)
        }
    })
}))

/**
 * GET /api/pipeline-github/:reviewId/:pipelineType
 * Récupérer un pipeline GitHub pour une review
 */
router.get('/:reviewId/:pipelineType', asyncHandler(async (req, res) => {
    const { reviewId, pipelineType } = req.params

    const pipeline = await prisma.pipelineGithub.findFirst({
        where: {
            reviewId,
            pipelineType
        }
    })

    if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found' })
    }

    res.json({
        ...pipeline,
        cells: JSON.parse(pipeline.cells)
    })
}))

/**
 * DELETE /api/pipeline-github/:id
 * Supprimer un pipeline GitHub
 */
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params

    // Vérifier que le pipeline appartient à l'utilisateur
    const pipeline = await prisma.pipelineGithub.findUnique({
        where: { id },
        include: {
            review: {
                select: { authorId: true }
            }
        }
    })

    if (!pipeline) {
        throw Errors.NOT_FOUND('Pipeline not found')
    }

    const review = await prisma.review.findUnique({
        where: { id: pipeline.reviewId },
        select: { authorId: true }
    })

    if (review?.authorId !== req.user.id) {
        throw Errors.FORBIDDEN('You do not own this pipeline')
    }

    await prisma.pipelineGithub.delete({
        where: { id }
    })

    res.json({ success: true })
}))

/**
 * Fonction helper pour mettre à jour la référence du pipeline dans la review spécifique
 */
async function updateReviewPipelineReference(reviewType, pipelineType, reviewId, pipelineGithubId) {
    const fieldMap = {
        flower: {
            culture: 'culturePipelineGithubId',
            curing: 'curingPipelineGithubId'
        },
        hash: {
            separation: 'separationPipelineGithubId',
            purification: 'purificationPipelineGithubId',
            curing: 'curingPipelineGithubId'
        },
        concentrate: {
            extraction: 'extractionPipelineGithubId',
            purification: 'purificationPipelineGithubIdConcentrate',
            curing: 'curingPipelineGithubIdConcentrate'
        },
        edible: {
            recipe: 'recipePipelineGithubId'
        }
    }

    const fieldName = fieldMap[reviewType]?.[pipelineType]

    if (!fieldName) {
        console.warn(`No field mapping for reviewType=${reviewType}, pipelineType=${pipelineType}`)
        return
    }

    // Déterminer la table
    const tableMap = {
        flower: 'flowerReview',
        hash: 'hashReview',
        concentrate: 'concentrateReview',
        edible: 'edibleReview'
    }

    const tableName = tableMap[reviewType]
    if (!tableName) return

    try {
        await prisma[tableName].updateMany({
            where: { reviewId },
            data: { [fieldName]: pipelineGithubId }
        })
    } catch (error) {
        console.error('Error updating pipeline reference:', error)
    }
}

export default router
