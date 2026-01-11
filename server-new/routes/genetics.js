/**
 * Routes pour la gestion des arbres généalogiques (Genetics/PhenoHunt)
 * 
 * Endpoints:
 * GET    /api/genetics/trees           - Lister les arbres de l'utilisateur
 * POST   /api/genetics/trees           - Créer un nouvel arbre
 * GET    /api/genetics/trees/:id       - Récupérer un arbre
 * PUT    /api/genetics/trees/:id       - Modifier un arbre
 * DELETE /api/genetics/trees/:id       - Supprimer un arbre
 * 
 * GET    /api/genetics/trees/:id/nodes - Lister les nœuds d'un arbre
 * POST   /api/genetics/trees/:id/nodes - Ajouter un nœud
 * PUT    /api/genetics/nodes/:nodeId   - Modifier un nœud
 * DELETE /api/genetics/nodes/:nodeId   - Supprimer un nœud
 * 
 * GET    /api/genetics/trees/:id/edges - Lister les arêtes d'un arbre
 * POST   /api/genetics/trees/:id/edges - Ajouter une arête
 * DELETE /api/genetics/edges/:edgeId   - Supprimer une arête
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import {
    validateTreeCreation,
    validateTreeUpdate,
    validateNodeCreation,
    validateNodeUpdate,
    validateEdgeCreation
} from '../middleware/validateGenetics.js'

const router = express.Router()
const prisma = new PrismaClient()

// Middleware d'authentification requis
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

// =============================================================================
// TREES ROUTES
// =============================================================================

/**
 * GET /api/genetics/trees
 * Lister tous les arbres généalogiques de l'utilisateur connecté
 */
router.get("/trees", requireAuth, async (req, res) => {
    try {
        const trees = await prisma.geneticTree.findMany({
            where: { userId: req.user.id },
            select: {
                id: true,
                name: true,
                description: true,
                projectType: true,
                isPublic: true,
                shareCode: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { nodes: true, edges: true }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        res.json(trees);
    } catch (error) {
        console.error("Error fetching genetic trees:", error);
        res.status(500).json({ error: "Failed to fetch genetic trees" });
    }
});

/**
 * POST /api/genetics/trees
 * Créer un nouvel arbre généalogique
 */
router.post("/trees", requireAuth, validateTreeCreation, async (req, res) => {
    try {
        const { name, description, projectType = "phenohunt", isPublic = false } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: "Tree name is required" });
        }

        const tree = await prisma.geneticTree.create({
            data: {
                userId: req.user.id,
                name: name.trim(),
                description: description?.trim() || null,
                projectType: projectType || "phenohunt",
                isPublic: isPublic || false
            }
        });

        res.status(201).json(tree);
    } catch (error) {
        console.error("Error creating genetic tree:", error);
        res.status(500).json({ error: "Failed to create genetic tree" });
    }
});

/**
 * GET /api/genetics/trees/:id
 * Récupérer un arbre avec tous ses nœuds et arêtes
 */
router.get("/trees/:id", async (req, res) => {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: req.params.id },
            include: {
                nodes: {
                    select: {
                        id: true,
                        cultivarId: true,
                        cultivarName: true,
                        position: true,
                        color: true,
                        image: true,
                        genetics: true,
                        notes: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                edges: {
                    select: {
                        id: true,
                        parentNodeId: true,
                        childNodeId: true,
                        relationshipType: true,
                        notes: true
                    }
                }
            }
        });

        if (!tree) {
            return res.status(404).json({ error: "Tree not found" });
        }

        // Vérifier l'accès (public ou propriétaire)
        if (!tree.isPublic && tree.userId !== req.user?.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        res.json(tree);
    } catch (error) {
        console.error("Error fetching genetic tree:", error);
        res.status(500).json({ error: "Failed to fetch genetic tree" });
    }
});

/**
 * PUT /api/genetics/trees/:id
 * Modifier un arbre généalogique
 */
router.put("/trees/:id", requireAuth, validateTreeUpdate, async (req, res) => {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: req.params.id }
        });

        if (!tree) {
            return res.status(404).json({ error: "Tree not found" });
        }

        if (tree.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { name, description, projectType, isPublic, sharedWith } = req.body;

        const updated = await prisma.geneticTree.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(projectType && { projectType }),
                ...(isPublic !== undefined && { isPublic }),
                ...(sharedWith !== undefined && { sharedWith: sharedWith ? JSON.stringify(sharedWith) : null })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating genetic tree:", error);
        res.status(500).json({ error: "Failed to update genetic tree" });
    }
});

/**
 * DELETE /api/genetics/trees/:id
 * Supprimer un arbre généalogique (et tous ses nœuds/arêtes en cascade)
 */
router.delete("/trees/:id", requireAuth, async (req, res) => {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: req.params.id }
        });

        if (!tree) {
            return res.status(404).json({ error: "Tree not found" });
        }

        if (tree.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.geneticTree.delete({
            where: { id: req.params.id }
        });

        res.json({ message: "Tree deleted successfully" });
    } catch (error) {
        console.error("Error deleting genetic tree:", error);
        res.status(500).json({ error: "Failed to delete genetic tree" });
    }
});

// =============================================================================
// NODES ROUTES
// =============================================================================

/**
 * GET /api/genetics/trees/:id/nodes
 * Lister tous les nœuds d'un arbre
 */
router.get("/trees/:id/nodes", async (req, res) => {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: req.params.id },
            select: { userId: true, isPublic: true }
        });

        if (!tree) {
            return res.status(404).json({ error: "Tree not found" });
        }

        // Vérifier l'accès
        if (!tree.isPublic && tree.userId !== req.user?.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const nodes = await prisma.genNode.findMany({
            where: { treeId: req.params.id },
            select: {
                id: true,
                cultivarId: true,
                cultivarName: true,
                position: true,
                color: true,
                image: true,
                genetics: true,
                notes: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "asc" }
        });

        res.json(nodes);
    } catch (error) {
        console.error("Error fetching nodes:", error);
        res.status(500).json({ error: "Failed to fetch nodes" });
    }
});

/**
 * POST /api/genetics/trees/:id/nodes
 * Ajouter un nœud à un arbre
 */
router.post("/trees/:id/nodes", requireAuth, validateNodeCreation, async (req, res) => {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: req.params.id }
        });

        if (!tree) {
            return res.status(404).json({ error: "Tree not found" });
        }

        if (tree.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const {
            cultivarId,
            cultivarName,
            position = { x: 0, y: 0 },
            color = "#FF6B9D",
            image = null,
            genetics = null,
            notes = null
        } = req.body;

        if (!cultivarName || cultivarName.trim().length === 0) {
            return res.status(400).json({ error: "Cultivar name is required" });
        }

        const node = await prisma.genNode.create({
            data: {
                treeId: req.params.id,
                cultivarId: cultivarId || null,
                cultivarName: cultivarName.trim(),
                position: JSON.stringify(position),
                color: color || "#FF6B9D",
                image: image || null,
                genetics: genetics ? JSON.stringify(genetics) : null,
                notes: notes?.trim() || null
            }
        });

        res.status(201).json({
            ...node,
            position: JSON.parse(node.position),
            genetics: node.genetics ? JSON.parse(node.genetics) : null
        });
    } catch (error) {
        console.error("Error creating node:", error);
        res.status(500).json({ error: "Failed to create node" });
    }
});

/**
 * PUT /api/genetics/nodes/:nodeId
 * Modifier un nœud
 */
router.put("/nodes/:nodeId", requireAuth, validateNodeUpdate, async (req, res) => {
    try {
        const node = await prisma.genNode.findUnique({
            where: { id: req.params.nodeId },
            include: { tree: true }
        });

        if (!node) {
            return res.status(404).json({ error: "Node not found" });
        }

        if (node.tree.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const {
            cultivarName,
            position,
            color,
            image,
            genetics,
            notes
        } = req.body;

        const updated = await prisma.genNode.update({
            where: { id: req.params.nodeId },
            data: {
                ...(cultivarName && { cultivarName: cultivarName.trim() }),
                ...(position && { position: JSON.stringify(position) }),
                ...(color && { color }),
                ...(image !== undefined && { image: image || null }),
                ...(genetics !== undefined && { genetics: genetics ? JSON.stringify(genetics) : null }),
                ...(notes !== undefined && { notes: notes?.trim() || null })
            }
        });

        res.json({
            ...updated,
            position: JSON.parse(updated.position),
            genetics: updated.genetics ? JSON.parse(updated.genetics) : null
        });
    } catch (error) {
        console.error("Error updating node:", error);
        res.status(500).json({ error: "Failed to update node" });
    }
});

/**
 * DELETE /api/genetics/nodes/:nodeId
 * Supprimer un nœud (et ses arêtes associées)
 */
router.delete("/nodes/:nodeId", requireAuth, async (req, res) => {
    try {
        const node = await prisma.genNode.findUnique({
            where: { id: req.params.nodeId },
            include: { tree: true }
        });

        if (!node) {
            return res.status(404).json({ error: "Node not found" });
        }

        if (node.tree.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // Les arêtes seront supprimées en cascade via Prisma
        await prisma.genNode.delete({
            where: { id: req.params.nodeId }
        });

        res.json({ message: "Node deleted successfully" });
    } catch (error) {
        console.error("Error deleting node:", error);
        res.status(500).json({ error: "Failed to delete node" });
    }
});

// =============================================================================
// EDGES ROUTES
// =============================================================================

/**
 * GET /api/genetics/trees/:id/edges
 * Lister toutes les arêtes d'un arbre
 */
router.get("/trees/:id/edges", async (req, res) => {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: req.params.id },
            select: { userId: true, isPublic: true }
        });

        if (!tree) {
            return res.status(404).json({ error: "Tree not found" });
        }

        // Vérifier l'accès
        if (!tree.isPublic && tree.userId !== req.user?.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const edges = await prisma.genEdge.findMany({
            where: { treeId: req.params.id },
            select: {
                id: true,
                parentNodeId: true,
                childNodeId: true,
                relationshipType: true,
                notes: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "asc" }
        });

        res.json(edges);
    } catch (error) {
        console.error("Error fetching edges:", error);
        res.status(500).json({ error: "Failed to fetch edges" });
    }
});

/**
 * POST /api/genetics/trees/:id/edges
 * Ajouter une arête (relation parent-enfant)
 */
router.post("/trees/:id/edges", requireAuth, validateEdgeCreation, async (req, res) => {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: req.params.id }
        });

        if (!tree) {
            return res.status(404).json({ error: "Tree not found" });
        }

        if (tree.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const {
            parentNodeId,
            childNodeId,
            relationshipType = "parent",
            notes = null
        } = req.body;

        if (!parentNodeId || !childNodeId) {
            return res.status(400).json({ error: "Parent and child node IDs are required" });
        }

        // Vérifier que les nœuds existent et appartiennent à cet arbre
        const [parentNode, childNode] = await Promise.all([
            prisma.genNode.findUnique({ where: { id: parentNodeId } }),
            prisma.genNode.findUnique({ where: { id: childNodeId } })
        ]);

        if (!parentNode || !childNode || parentNode.treeId !== req.params.id || childNode.treeId !== req.params.id) {
            return res.status(400).json({ error: "Invalid parent or child node" });
        }

        try {
            const edge = await prisma.genEdge.create({
                data: {
                    treeId: req.params.id,
                    parentNodeId,
                    childNodeId,
                    relationshipType: relationshipType || "parent",
                    notes: notes?.trim() || null
                }
            });

            res.status(201).json(edge);
        } catch (error) {
            if (error.code === "P2002") {
                // Unique constraint violation
                return res.status(409).json({ error: "This relationship already exists" });
            }
            throw error;
        }
    } catch (error) {
        console.error("Error creating edge:", error);
        res.status(500).json({ error: "Failed to create edge" });
    }
});

/**
 * DELETE /api/genetics/edges/:edgeId
 * Supprimer une arête
 */
router.delete("/edges/:edgeId", requireAuth, async (req, res) => {
    try {
        const edge = await prisma.genEdge.findUnique({
            where: { id: req.params.edgeId },
            include: { tree: true }
        });

        if (!edge) {
            return res.status(404).json({ error: "Edge not found" });
        }

        if (edge.tree.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await prisma.genEdge.delete({
            where: { id: req.params.edgeId }
        });

        res.json({ message: "Edge deleted successfully" });
    } catch (error) {
        console.error("Error deleting edge:", error);
        res.status(500).json({ error: "Failed to delete edge" });
    }
});

export default router
