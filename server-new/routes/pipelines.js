/**
 * Routes API pour la gestion des pipelines (culture, curing, extraction, etc.)
 * GET    /api/pipelines/:pipelineId           - Récupérer toutes les étapes d'un pipeline
 * POST   /api/pipelines                       - Créer un nouveau pipeline (retourne pipelineId)
 * POST   /api/pipelines/:pipelineId/steps     - Ajouter une étape à un pipeline
 * PUT    /api/pipelines/steps/:stepId         - Modifier une étape
 * DELETE /api/pipelines/steps/:stepId         - Supprimer une étape
 * PUT    /api/pipelines/:pipelineId/reorder   - Réordonner les étapes
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../server.js'
import { asyncHandler } from '../utils/errorHandler.js'

const router = express.Router()

// Middleware auth
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' })
    }
    next()
}

/**
 * GET /api/pipelines/:pipelineId
 * Récupérer toutes les étapes d'un pipeline
 */
router.get('/:pipelineId', requireAuth, asyncHandler(async (req, res) => {
    const steps = await prisma.pipelineStep.findMany({
        where: { pipelineId: req.params.pipelineId },
        orderBy: { stepIndex: 'asc' }
    })

    // Parser les données JSON
    const formattedSteps = steps.map(step => ({
        ...step,
        data: step.data ? JSON.parse(step.data) : {}
    }))

    res.json(formattedSteps)
}))

/**
 * POST /api/pipelines
 * Créer un nouveau pipeline (génère un ID unique)
 */
router.post('/', requireAuth, asyncHandler(async (req, res) => {
    const { pipelineType } = req.body

    if (!pipelineType) {
        return res.status(400).json({ error: 'pipelineType is required' })
    }

    // Générer un ID unique pour le pipeline
    const pipelineId = uuidv4()

    res.status(201).json({
        pipelineId,
        pipelineType,
        message: 'Pipeline created. Add steps using POST /api/pipelines/:pipelineId/steps'
    })
}))

/**
 * POST /api/pipelines/:pipelineId/steps
 * Ajouter une étape à un pipeline
 */
router.post('/:pipelineId/steps', requireAuth, asyncHandler(async (req, res) => {
    const { pipelineId } = req.params
    const {
        pipelineType,
        stepName,
        intervalType,
        intervalValue,
        data,
        notes
    } = req.body

    if (!pipelineType || !stepName || !intervalType) {
        return res.status(400).json({
            error: 'pipelineType, stepName, and intervalType are required'
        })
    }

    // Récupérer le dernier index pour ce pipeline
    const lastStep = await prisma.pipelineStep.findFirst({
        where: { pipelineId },
        orderBy: { stepIndex: 'desc' }
    })

    const nextIndex = lastStep ? lastStep.stepIndex + 1 : 0

    const step = await prisma.pipelineStep.create({
        data: {
            pipelineId,
            pipelineType,
            stepIndex: nextIndex,
            stepName,
            intervalType,
            intervalValue: intervalValue ? parseFloat(intervalValue) : null,
            data: data ? JSON.stringify(data) : '{}',
            notes: notes || null
        }
    })

    res.status(201).json({
        ...step,
        data: step.data ? JSON.parse(step.data) : {}
    })
}))

/**
 * PUT /api/pipelines/steps/:stepId
 * Modifier une étape
 */
router.put('/steps/:stepId', requireAuth, asyncHandler(async (req, res) => {
    const { stepId } = req.params
    const {
        stepName,
        intervalType,
        intervalValue,
        data,
        notes
    } = req.body

    const step = await prisma.pipelineStep.findUnique({
        where: { id: stepId }
    })

    if (!step) {
        return res.status(404).json({ error: 'Step not found' })
    }

    const updated = await prisma.pipelineStep.update({
        where: { id: stepId },
        data: {
            ...(stepName && { stepName }),
            ...(intervalType && { intervalType }),
            ...(intervalValue !== undefined && {
                intervalValue: intervalValue ? parseFloat(intervalValue) : null
            }),
            ...(data && { data: JSON.stringify(data) }),
            ...(notes !== undefined && { notes: notes || null }),
            updatedAt: new Date()
        }
    })

    res.json({
        ...updated,
        data: updated.data ? JSON.parse(updated.data) : {}
    })
}))

/**
 * DELETE /api/pipelines/steps/:stepId
 * Supprimer une étape
 */
router.delete('/steps/:stepId', requireAuth, asyncHandler(async (req, res) => {
    const { stepId } = req.params

    const step = await prisma.pipelineStep.findUnique({
        where: { id: stepId }
    })

    if (!step) {
        return res.status(404).json({ error: 'Step not found' })
    }

    // Supprimer l'étape
    await prisma.pipelineStep.delete({
        where: { id: stepId }
    })

    // Réindexer les étapes restantes du même pipeline
    const remainingSteps = await prisma.pipelineStep.findMany({
        where: { pipelineId: step.pipelineId },
        orderBy: { stepIndex: 'asc' }
    })

    // Mettre à jour les index
    for (let i = 0; i < remainingSteps.length; i++) {
        if (remainingSteps[i].stepIndex !== i) {
            await prisma.pipelineStep.update({
                where: { id: remainingSteps[i].id },
                data: { stepIndex: i }
            })
        }
    }

    res.json({ success: true, message: 'Step deleted and pipeline reindexed' })
}))

/**
 * PUT /api/pipelines/:pipelineId/reorder
 * Réordonner les étapes d'un pipeline
 * Body: { stepIds: ["id1", "id2", "id3"] } dans le nouvel ordre
 */
router.put('/:pipelineId/reorder', requireAuth, asyncHandler(async (req, res) => {
    const { pipelineId } = req.params
    const { stepIds } = req.body

    if (!Array.isArray(stepIds)) {
        return res.status(400).json({ error: 'stepIds must be an array' })
    }

    // Vérifier que toutes les étapes appartiennent à ce pipeline
    const steps = await prisma.pipelineStep.findMany({
        where: {
            pipelineId,
            id: { in: stepIds }
        }
    })

    if (steps.length !== stepIds.length) {
        return res.status(400).json({ error: 'Some step IDs are invalid or do not belong to this pipeline' })
    }

    // Mettre à jour les index
    for (let i = 0; i < stepIds.length; i++) {
        await prisma.pipelineStep.update({
            where: { id: stepIds[i] },
            data: { stepIndex: i }
        })
    }

    // Récupérer les étapes réordonnées
    const reordered = await prisma.pipelineStep.findMany({
        where: { pipelineId },
        orderBy: { stepIndex: 'asc' }
    })

    res.json({
        success: true,
        steps: reordered.map(step => ({
            ...step,
            data: step.data ? JSON.parse(step.data) : {}
        }))
    })
}))

export default router
