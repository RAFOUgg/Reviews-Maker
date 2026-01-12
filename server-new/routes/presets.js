/**
 * Routes API pour la gestion des préréglages utilisateur
 * Préréglages individuels et groupés pour pipelines
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Middleware d'authentification
 */
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    next();
};

/**
 * GET /api/presets
 * Récupérer tous les préréglages de l'utilisateur
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query; // 'field' | 'grouped' | 'pipeline'

        const where = { userId };
        if (type) {
            where.type = type;
        }

        const presets = await prisma.userPreset.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(presets);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/presets
 * Créer un nouveau préréglage
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, type, pipelineType, data } = req.body;

        if (!name || !type || !pipelineType || !data) {
            return res.status(400).json({
                error: 'Champs requis : name, type, pipelineType, data'
            });
        }

        const preset = await prisma.userPreset.create({
            data: {
                userId,
                name,
                description: description || '',
                type, // 'field' | 'grouped' | 'pipeline'
                pipelineType, // 'culture' | 'curing' | 'separation' | 'extraction'
                data: JSON.stringify(data)
            }
        });

        res.json(preset);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PUT /api/presets/:id
 * Mettre à jour un préréglage
 */
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const presetId = parseInt(req.params.id);
        const { name, description, data } = req.body;

        // Vérifier que le préréglage appartient à l'utilisateur
        const existing = await prisma.userPreset.findFirst({
            where: { id: presetId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Préréglage non trouvé' });
        }

        const updated = await prisma.userPreset.update({
            where: { id: presetId },
            data: {
                name: name || existing.name,
                description: description !== undefined ? description : existing.description,
                data: data ? JSON.stringify(data) : existing.data,
                updatedAt: new Date()
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * DELETE /api/presets/:id
 * Supprimer un préréglage
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const presetId = parseInt(req.params.id);

        // Vérifier que le préréglage appartient à l'utilisateur
        const existing = await prisma.userPreset.findFirst({
            where: { id: presetId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Préréglage non trouvé' });
        }

        await prisma.userPreset.delete({
            where: { id: presetId }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
