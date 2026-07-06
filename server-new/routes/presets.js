/**
 * Routes API pour la gestion des préréglages utilisateur (UserPreset)
 *
 * Couvre 3 usages sous un même modèle :
 * - type "field"   : un champ individuel (fieldKey, value)
 * - type "grouped" : un groupe de champs réutilisable (emoji, fields: [{key, value}])
 * - type "setup"   : une configuration complète de pipeline (config + groupedPresetIds
 *                    référencés + éventuelles pré-assignations groupe↔cellule)
 *
 * Utilisable aussi bien depuis un pipeline (Culture/Curing/Séparation/Extraction) que
 * depuis la Chaîne de production, qui partage les mêmes schémas de champs.
 */

import express from 'express';
import { prisma } from '../server.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const VALID_TYPES = new Set(['field', 'grouped', 'pipeline', 'setup']);

function parseTags(raw) {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function serializePreset(preset) {
    return {
        ...preset,
        data: safeParseJson(preset.data),
        tags: parseTags(preset.tags)
    };
}

function safeParseJson(raw) {
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

/**
 * GET /api/presets
 * Liste des préréglages de l'utilisateur, avec filtres/tri.
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, pipelineType, projectId, tag, q, sort, includeArchived } = req.query;

        const where = { userId };
        if (type) where.type = type;
        if (pipelineType) where.pipelineType = pipelineType;
        if (projectId) where.projectId = parseInt(projectId);
        if (!includeArchived || includeArchived === 'false') where.isArchived = false;

        // Tri géré par Prisma sauf pour "name" (insensible à la casse — jamais via
        // `mode: 'insensitive'`, ça plante sur SQLite ; on trie en JS à la place).
        const orderBy = (sort === 'useCount' || sort === 'createdAt')
            ? { [sort]: 'desc' }
            : { createdAt: 'desc' };

        let presets = await prisma.userPreset.findMany({ where, orderBy });

        // Filtres qui nécessitent de lire le contenu (tags, recherche texte) — faits en JS
        // après la requête, sur un jeu de données par utilisateur qui reste petit.
        if (tag) {
            presets = presets.filter(p => parseTags(p.tags).includes(tag));
        }
        if (q && q.trim()) {
            const needle = q.trim().toLowerCase();
            presets = presets.filter(p =>
                p.name?.toLowerCase().includes(needle) || p.description?.toLowerCase().includes(needle)
            );
        }
        if (sort === 'name') {
            presets = [...presets].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        }

        res.json(presets.map(serializePreset));
    } catch (error) {
        console.error('GET /api/presets error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/presets
 * Créer un nouveau préréglage.
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, type, pipelineType, data, tags, emoji, projectId } = req.body;

        if (!name || !type || data === undefined) {
            return res.status(400).json({ error: 'Champs requis : name, type, data' });
        }
        if (!VALID_TYPES.has(type)) {
            return res.status(400).json({ error: `type invalide (attendu : ${[...VALID_TYPES].join('|')})` });
        }

        const preset = await prisma.userPreset.create({
            data: {
                userId,
                name,
                description: description || '',
                type,
                pipelineType: pipelineType || null,
                emoji: emoji || null,
                tags: Array.isArray(tags) ? JSON.stringify(tags) : null,
                projectId: projectId ? parseInt(projectId) : null,
                data: JSON.stringify(data)
            }
        });

        res.json(serializePreset(preset));
    } catch (error) {
        console.error('POST /api/presets error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PUT /api/presets/:id
 * Mettre à jour un préréglage.
 */
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const presetId = parseInt(req.params.id);
        const { name, description, data, tags, emoji, projectId, pipelineType } = req.body;

        const existing = await prisma.userPreset.findFirst({ where: { id: presetId, userId } });
        if (!existing) {
            return res.status(404).json({ error: 'Préréglage non trouvé' });
        }

        const updated = await prisma.userPreset.update({
            where: { id: presetId },
            data: {
                name: name ?? existing.name,
                description: description !== undefined ? description : existing.description,
                data: data !== undefined ? JSON.stringify(data) : existing.data,
                tags: tags !== undefined ? (Array.isArray(tags) ? JSON.stringify(tags) : null) : existing.tags,
                emoji: emoji !== undefined ? emoji : existing.emoji,
                pipelineType: pipelineType !== undefined ? pipelineType : existing.pipelineType,
                projectId: projectId !== undefined ? (projectId ? parseInt(projectId) : null) : existing.projectId
            }
        });

        res.json(serializePreset(updated));
    } catch (error) {
        console.error('PUT /api/presets/:id error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/presets/:id/use
 * Incrémente le compteur d'usage — appelé à chaque application réelle d'un groupe
 * (drag&drop sur une cellule, chargement en masse, chargement côté Chaîne de production).
 */
router.post('/:id/use', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const presetId = parseInt(req.params.id);

        const existing = await prisma.userPreset.findFirst({ where: { id: presetId, userId } });
        if (!existing) {
            return res.status(404).json({ error: 'Préréglage non trouvé' });
        }

        const updated = await prisma.userPreset.update({
            where: { id: presetId },
            data: { useCount: { increment: 1 }, lastUsedAt: new Date() }
        });

        res.json(serializePreset(updated));
    } catch (error) {
        console.error('POST /api/presets/:id/use error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * DELETE /api/presets/:id
 * Suppression douce (isArchived) — ne casse jamais un Setup qui référence ce groupe par id.
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const presetId = parseInt(req.params.id);

        const existing = await prisma.userPreset.findFirst({ where: { id: presetId, userId } });
        if (!existing) {
            return res.status(404).json({ error: 'Préréglage non trouvé' });
        }

        await prisma.userPreset.update({ where: { id: presetId }, data: { isArchived: true } });

        res.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/presets/:id error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/presets/import-local
 * Migration one-shot des groupes/setups historiquement stockés en localStorage vers le
 * serveur. Dé-duplique par (name, pipelineType, type) pour rester idempotent si le client
 * relance l'import après une synchro partielle.
 *
 * Payload attendu : { groups: [{ pipelineType, name, emoji, description, fields }], setups: [...] }
 */
router.post('/import-local', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { groups, setups } = req.body || {};

        const existing = await prisma.userPreset.findMany({
            where: { userId, type: { in: ['grouped', 'setup'] } },
            select: { name: true, pipelineType: true, type: true }
        });
        const existingKey = (name, pipelineType, type) => `${type}::${pipelineType || ''}::${name}`;
        const existingSet = new Set(existing.map(e => existingKey(e.name, e.pipelineType, e.type)));

        const created = [];

        for (const group of (Array.isArray(groups) ? groups : [])) {
            if (!group?.name || !group?.pipelineType) continue;
            const key = existingKey(group.name, group.pipelineType, 'grouped');
            if (existingSet.has(key)) continue;
            existingSet.add(key);
            const row = await prisma.userPreset.create({
                data: {
                    userId,
                    name: group.name,
                    description: group.description || '',
                    type: 'grouped',
                    pipelineType: group.pipelineType,
                    emoji: group.emoji || null,
                    data: JSON.stringify({ fields: group.fields || [] })
                }
            });
            created.push(row);
        }

        for (const setup of (Array.isArray(setups) ? setups : [])) {
            if (!setup?.name || !setup?.pipelineType) continue;
            const key = existingKey(setup.name, setup.pipelineType, 'setup');
            if (existingSet.has(key)) continue;
            existingSet.add(key);
            const row = await prisma.userPreset.create({
                data: {
                    userId,
                    name: setup.name,
                    description: setup.description || '',
                    type: 'setup',
                    pipelineType: setup.pipelineType,
                    emoji: setup.emoji || null,
                    data: JSON.stringify({
                        config: setup.config || {},
                        groupAssignments: setup.groupAssignments || {},
                        data: setup.data || null
                    })
                }
            });
            created.push(row);
        }

        res.json({ imported: created.length, presets: created.map(serializePreset) });
    } catch (error) {
        console.error('POST /api/presets/import-local error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
