/**
 * Routes API pour les Projets — regroupement libre des groupes/préréglages de pipeline
 * (ex: "Récolte Été 2026"), pour trier/filtrer dans la Bibliothèque > Groupes & Préréglages.
 */

import express from 'express';
import { prisma } from '../server.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/projects
 * Liste des projets de l'utilisateur, avec le nombre de préréglages rattachés.
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { presets: true } } }
        });
        res.json(projects);
    } catch (error) {
        console.error('GET /api/projects error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/projects
 * Créer un nouveau projet.
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Champ requis : name' });
        }

        const project = await prisma.project.create({
            data: { userId, name: name.trim(), description: description || null, color: color || null }
        });

        res.json(project);
    } catch (error) {
        console.error('POST /api/projects error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PUT /api/projects/:id
 * Mettre à jour un projet.
 */
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = parseInt(req.params.id);
        const { name, description, color } = req.body;

        const existing = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!existing) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: {
                name: name?.trim() || existing.name,
                description: description !== undefined ? description : existing.description,
                color: color !== undefined ? color : existing.color
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('PUT /api/projects/:id error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * DELETE /api/projects/:id
 * Supprime le projet — les préréglages rattachés ne sont PAS supprimés, juste détachés
 * (UserPreset.projectId passe à null, cf. onDelete: SetNull sur le schéma).
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = parseInt(req.params.id);

        const existing = await prisma.project.findFirst({ where: { id: projectId, userId } });
        if (!existing) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        await prisma.project.delete({ where: { id: projectId } });

        res.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/projects/:id error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
