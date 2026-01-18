/**
 * Routes Pipeline Culture - Phase 1 FLEURS
 * Gestion des pipelines culture, presets, et étapes
 * 
 * Endpoints:
 * - Pipeline CRUD
 * - CultureSetup (presets) CRUD
 * - PipelineStage management
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// ============================================================
// MIDDLEWARE
// ============================================================

// Vérifier que l'utilisateur est authentifié
router.use(verifyToken);

// ============================================================
// CULTURE SETUPS (PRESETS) - 8 Endpoints
// ============================================================

/**
 * POST /api/culture-setups
 * Créer un nouveau preset de configuration
 */
router.post('/api/culture-setups', async (req, res) => {
  try {
    const { name, description, group, data } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !group || !data) {
      return res.status(400).json({ error: 'name, group, data sont obligatoires' });
    }

    const validGroups = ['espace', 'substrat', 'irrigation', 'engrais', 'lumiere', 'climat', 'palissage', 'morphologie', 'recolte'];
    if (!validGroups.includes(group)) {
      return res.status(400).json({ error: `group doit être l'un de: ${validGroups.join(', ')}` });
    }

    const setup = await prisma.cultureSetup.create({
      data: {
        userId,
        name,
        description,
        group,
        data: JSON.stringify(data),
      },
    });

    res.status(201).json(setup);
  } catch (error) {
    console.error('Error creating culture setup:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/culture-setups
 * Lister tous les presets de l'utilisateur (optionally filter by group)
 */
router.get('/api/culture-setups', async (req, res) => {
  try {
    const userId = req.user.id;
    const { group } = req.query;

    const where = { userId, isActive: true };
    if (group) where.group = group;

    const setups = await prisma.cultureSetup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON data
    const parsed = setups.map(s => ({
      ...s,
      data: JSON.parse(s.data),
      usedInReviews: JSON.parse(s.usedInReviews),
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching culture setups:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/culture-setups/:setupId
 * Récupérer un preset spécifique
 */
router.get('/api/culture-setups/:setupId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { setupId } = req.params;

    const setup = await prisma.cultureSetup.findFirst({
      where: { id: setupId, userId },
    });

    if (!setup) {
      return res.status(404).json({ error: 'Setup non trouvé' });
    }

    setup.data = JSON.parse(setup.data);
    setup.usedInReviews = JSON.parse(setup.usedInReviews);

    res.json(setup);
  } catch (error) {
    console.error('Error fetching culture setup:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/culture-setups/:setupId
 * Modifier un preset
 */
router.put('/api/culture-setups/:setupId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { setupId } = req.params;
    const { name, description, data, isActive } = req.body;

    // Vérifier propriété
    const existing = await prisma.cultureSetup.findFirst({
      where: { id: setupId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Setup non trouvé' });
    }

    const updated = await prisma.cultureSetup.update({
      where: { id: setupId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(data && { data: JSON.stringify(data) }),
        ...(isActive !== undefined && { isActive }),
        version: existing.version + 1,
      },
    });

    updated.data = JSON.parse(updated.data);
    updated.usedInReviews = JSON.parse(updated.usedInReviews);

    res.json(updated);
  } catch (error) {
    console.error('Error updating culture setup:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/culture-setups/:setupId
 * Supprimer un preset (soft delete)
 */
router.delete('/api/culture-setups/:setupId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { setupId } = req.params;

    // Vérifier propriété
    const existing = await prisma.cultureSetup.findFirst({
      where: { id: setupId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Setup non trouvé' });
    }

    await prisma.cultureSetup.update({
      where: { id: setupId },
      data: { isActive: false },
    });

    res.json({ message: 'Setup supprimé' });
  } catch (error) {
    console.error('Error deleting culture setup:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/culture-setups/:setupId/duplicate
 * Dupliquer un preset
 */
router.post('/api/culture-setups/:setupId/duplicate', async (req, res) => {
  try {
    const userId = req.user.id;
    const { setupId } = req.params;
    const { newName } = req.body;

    const existing = await prisma.cultureSetup.findFirst({
      where: { id: setupId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Setup non trouvé' });
    }

    const duplicated = await prisma.cultureSetup.create({
      data: {
        userId,
        name: newName || `${existing.name} (copie)`,
        description: existing.description,
        group: existing.group,
        data: existing.data,
      },
    });

    duplicated.data = JSON.parse(duplicated.data);
    duplicated.usedInReviews = JSON.parse(duplicated.usedInReviews);

    res.status(201).json(duplicated);
  } catch (error) {
    console.error('Error duplicating culture setup:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PIPELINE - 4 Endpoints
// ============================================================

/**
 * POST /api/reviews/:reviewId/pipeline
 * Créer un pipeline pour une review
 */
router.post('/api/reviews/:reviewId/pipeline', async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { mode, startDate, endDate, activeSetups, notesGenerales } = req.body;

    // Vérifier que la review existe et appartient à l'utilisateur
    const review = await prisma.review.findFirst({
      where: { id: reviewId, authorId: userId },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review non trouvée' });
    }

    if (!mode || !startDate || !endDate) {
      return res.status(400).json({ error: 'mode, startDate, endDate sont obligatoires' });
    }

    // Calculer la durée
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const pipeline = await prisma.pipeline.create({
      data: {
        reviewId,
        mode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        activeSetups: JSON.stringify(activeSetups || []),
        notesGenerales,
        durationDays,
      },
    });

    // Auto-générer les étapes si mode = jours
    if (mode === 'jours') {
      const stages = [];
      for (let i = 0; i < durationDays; i++) {
        const stageDate = new Date(start);
        stageDate.setDate(stageDate.getDate() + i);
        
        stages.push({
          pipelineId: pipeline.id,
          intervalLabel: `J${i + 1}`,
          scheduledDate: stageDate,
          dayNumber: i,
          isCompleted: false,
        });
      }

      await prisma.pipelineStage.createMany({ data: stages });
    }

    // Marquer le pipeline comme créé
    const updated = await prisma.pipeline.findUnique({
      where: { id: pipeline.id },
      include: { stages: true },
    });

    res.status(201).json(updated);
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reviews/:reviewId/pipeline
 * Récupérer le pipeline d'une review
 */
router.get('/api/reviews/:reviewId/pipeline', async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    // Vérifier que la review existe et appartient à l'utilisateur
    const review = await prisma.review.findFirst({
      where: { id: reviewId, authorId: userId },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review non trouvée' });
    }

    const pipeline = await prisma.pipeline.findUnique({
      where: { reviewId },
      include: {
        stages: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline non trouvé' });
    }

    // Parse JSON fields
    pipeline.activeSetups = JSON.parse(pipeline.activeSetups);
    pipeline.phases = JSON.parse(pipeline.phases);

    res.json(pipeline);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/reviews/:reviewId/pipeline
 * Mettre à jour la configuration du pipeline
 */
router.put('/api/reviews/:reviewId/pipeline', async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { mode, startDate, endDate, activeSetups, notesGenerales } = req.body;

    // Vérifier que la review existe et appartient à l'utilisateur
    const review = await prisma.review.findFirst({
      where: { id: reviewId, authorId: userId },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review non trouvée' });
    }

    const pipeline = await prisma.pipeline.findUnique({
      where: { reviewId },
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline non trouvé' });
    }

    // Recalculer la durée si dates changent
    let durationDays = pipeline.durationDays;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    const updated = await prisma.pipeline.update({
      where: { id: pipeline.id },
      data: {
        ...(mode && { mode }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(activeSetups && { activeSetups: JSON.stringify(activeSetups) }),
        ...(notesGenerales !== undefined && { notesGenerales }),
        ...(durationDays && { durationDays }),
      },
      include: {
        stages: {
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    updated.activeSetups = JSON.parse(updated.activeSetups);
    updated.phases = JSON.parse(updated.phases);

    res.json(updated);
  } catch (error) {
    console.error('Error updating pipeline:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PIPELINE STAGES - 3 Endpoints
// ============================================================

/**
 * POST /api/pipelines/:pipelineId/stages
 * Ajouter une étape au pipeline
 */
router.post('/api/pipelines/:pipelineId/stages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { pipelineId } = req.params;
    const { intervalLabel, scheduledDate, eventType, eventData, observations, photoUrl } = req.body;

    // Vérifier que le pipeline appartient à l'utilisateur
    const pipeline = await prisma.pipeline.findFirst({
      where: {
        id: pipelineId,
        review: { authorId: userId },
      },
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline non trouvé' });
    }

    const stage = await prisma.pipelineStage.create({
      data: {
        pipelineId,
        intervalLabel,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        eventType,
        eventData: eventData ? JSON.stringify(eventData) : null,
        observations,
        photoUrl,
        isCompleted: false,
      },
    });

    if (stage.eventData) {
      stage.eventData = JSON.parse(stage.eventData);
    }

    res.status(201).json(stage);
  } catch (error) {
    console.error('Error creating pipeline stage:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/pipelines/:pipelineId/stages/:stageId
 * Modifier une étape
 */
router.put('/api/pipelines/:pipelineId/stages/:stageId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { pipelineId, stageId } = req.params;
    const { eventType, eventData, observations, photoUrl, isCompleted } = req.body;

    // Vérifier que le pipeline appartient à l'utilisateur
    const pipeline = await prisma.pipeline.findFirst({
      where: {
        id: pipelineId,
        review: { authorId: userId },
      },
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline non trouvé' });
    }

    const updated = await prisma.pipelineStage.update({
      where: { id: stageId },
      data: {
        ...(eventType && { eventType }),
        ...(eventData && { eventData: JSON.stringify(eventData) }),
        ...(observations !== undefined && { observations }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(isCompleted !== undefined && {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          completedBy: isCompleted ? userId : null,
        }),
      },
    });

    if (updated.eventData) {
      updated.eventData = JSON.parse(updated.eventData);
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating pipeline stage:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pipelines/:pipelineId/stages
 * Lister les étapes d'un pipeline avec filters
 */
router.get('/api/pipelines/:pipelineId/stages', async (req, res) => {
  try {
    const userId = req.user.id;
    const { pipelineId } = req.params;
    const { completed, interval } = req.query;

    // Vérifier que le pipeline appartient à l'utilisateur
    const pipeline = await prisma.pipeline.findFirst({
      where: {
        id: pipelineId,
        review: { authorId: userId },
      },
    });

    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline non trouvé' });
    }

    const where = { pipelineId };
    if (completed !== undefined) {
      where.isCompleted = completed === 'true';
    }
    if (interval) {
      where.intervalLabel = { contains: interval };
    }

    const stages = await prisma.pipelineStage.findMany({
      where,
      orderBy: { dayNumber: 'asc' },
    });

    // Parse JSON fields
    const parsed = stages.map(s => ({
      ...s,
      eventData: s.eventData ? JSON.parse(s.eventData) : null,
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
