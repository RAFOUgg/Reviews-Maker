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
 * PUT    /api/genetics/edges/:edgeId   - Modifier une arête
 * DELETE /api/genetics/edges/:edgeId   - Supprimer une arête
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import {
    validateTreeCreation,
    validateTreeUpdate,
    validateNodeCreation,
    validateNodeUpdate,
    validateEdgeCreation,
    validateEdgeUpdate
} from '../middleware/validateGenetics.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { requireFeature } from '../middleware/permissions.js'
import { wouldCreateCycle } from '../utils/graphCycle.js'

const router = express.Router()
const prisma = new PrismaClient()
const requireGeneticsAccess = requireFeature('genetics_canvas')

// =============================================================================
// TREES ROUTES
// =============================================================================

/**
 * GET /api/genetics/next-pheno-code/:prefix
 * Prochain code phénotype auto-incrémenté pour ce préfixe (ex: PH-04 après PH-01, PH-03).
 * phenotypeCode vit dans GenNode.genetics (JSON), pas une colonne dédiée — filtre SQL grossier
 * par contains() puis parsing exact côté JS pour éviter les faux positifs de sous-chaîne.
 */
router.get("/next-pheno-code/:prefix", requireAuth, async (req, res) => {
    try {
        const prefix = req.params.prefix
        const nodes = await prisma.genNode.findMany({
            where: {
                tree: { userId: req.user.id },
                genetics: { contains: `"phenotypeCode":"${prefix}-` }
            },
            select: { genetics: true }
        })

        const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)$`)
        let maxNum = 0
        for (const n of nodes) {
            try {
                const g = JSON.parse(n.genetics)
                const match = g?.phenotypeCode?.match(pattern)
                if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10))
            } catch { /* genetics non-JSON, ignoré */ }
        }

        const nextNum = String(maxNum + 1).padStart(2, '0')
        res.json({ code: `${prefix}-${nextNum}` })
    } catch (error) {
        res.status(500).json({ error: "Failed to generate pheno code" })
    }
})

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
                    select: { nodes: true, edges: true, flowerReviews: true }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        res.json(trees);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch genetic trees" });
    }
});

/**
 * GET /api/genetics/find-node-for-review/:reviewId?name=X
 * Rattrapage pour les nœuds créés avant l'introduction de GenNode.sourceReviewId (2026-07) :
 * cette review peut déjà exister comme nœud dans un arbre de l'utilisateur sans que le lien
 * retour (FlowerReview.geneticTreeId) n'ait jamais été posé. Cherche d'abord une correspondance
 * fiable (sourceReviewId exact), puis à défaut une correspondance par nom (moins fiable — un nom
 * de cultivar n'est pas unique — d'où `matchType` pour laisser le front décider comment le
 * présenter, jamais d'auto-association silencieuse basée sur le nom).
 */
router.get("/find-node-for-review/:reviewId", requireAuth, async (req, res) => {
    try {
        const { reviewId } = req.params
        const name = (req.query.name || '').trim()

        const exact = await prisma.genNode.findFirst({
            where: { sourceReviewId: reviewId, tree: { userId: req.user.id } },
            select: { id: true, treeId: true, tree: { select: { name: true } } }
        })
        if (exact) {
            return res.json({ found: true, matchType: 'exact', nodeId: exact.id, treeId: exact.treeId, treeName: exact.tree.name })
        }

        if (name) {
            const byName = await prisma.genNode.findFirst({
                where: { cultivarName: name, tree: { userId: req.user.id } },
                select: { id: true, treeId: true, tree: { select: { name: true } } }
            })
            if (byName) {
                return res.json({ found: true, matchType: 'name', nodeId: byName.id, treeId: byName.treeId, treeName: byName.tree.name })
            }
        }

        res.json({ found: false })
    } catch (error) {
        res.status(500).json({ error: "Failed to search for existing node" })
    }
})

/**
 * POST /api/genetics/trees
 * Créer un nouvel arbre généalogique
 */
router.post("/trees", requireAuth, requireGeneticsAccess, validateTreeCreation, async (req, res) => {
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
        res.status(500).json({ error: "Failed to create genetic tree" });
    }
});

/**
 * GET /api/genetics/trees/:id
 * Récupérer un arbre avec tous ses nœuds et arêtes
 */
router.get("/trees/:id", optionalAuth, async (req, res) => {
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
                        sourceReviewId: true,
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
                        pollinationMethod: true,
                        notes: true,
                        waypointX: true,
                        waypointY: true,
                        sourceHandle: true,
                        targetHandle: true
                    }
                },
                _count: {
                    select: { flowerReviews: true }
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

        // Résolution dynamique de la photo pour les nœuds liés à une review (sourceReviewId) :
        // `node.image` n'est qu'une copie figée au moment de la liaison — si la review n'avait
        // pas encore de photo à ce moment-là (ou en a reçu une depuis), le nœud reste sans image
        // pour toujours sans ce rattrapage. PhenoHunt ne lie que des FlowerReview, donc pas besoin
        // du fallback vers les sous-tables hash/concentrate/edible utilisé ailleurs.
        //
        // Cette même requête sert aussi à détecter les liens cassés : sourceReviewId n'a pas de FK
        // Prisma (best-effort, cf. schema.prisma), donc rien n'empêche une review d'être supprimée
        // en laissant les nœuds qui la référençaient intacts. On vérifie ici TOUS les nœuds ayant un
        // sourceReviewId (pas seulement ceux sans image, un nœud orphelin peut déjà avoir une image
        // en cache) et on marque sourceReviewOrphaned sur ceux dont l'id ne résout plus.
        const allSourceReviewIds = [...new Set(tree.nodes.filter(n => n.sourceReviewId).map(n => n.sourceReviewId))];
        if (allSourceReviewIds.length > 0) {
            const linkedReviews = await prisma.review.findMany({
                where: { id: { in: allSourceReviewIds } },
                select: { id: true, images: true }
            });
            const foundReviewIds = new Set();
            const imageByReviewId = new Map();
            for (const r of linkedReviews) {
                foundReviewIds.add(r.id);
                try {
                    const parsed = r.images ? JSON.parse(r.images) : [];
                    if (Array.isArray(parsed) && parsed.length > 0) imageByReviewId.set(r.id, parsed[0]);
                } catch { /* pas de photo exploitable */ }
            }
            tree.nodes = tree.nodes.map(n => {
                if (!n.sourceReviewId) return n;
                const patch = { sourceReviewOrphaned: !foundReviewIds.has(n.sourceReviewId) };
                if (!n.image && imageByReviewId.has(n.sourceReviewId)) patch.image = imageByReviewId.get(n.sourceReviewId);
                return { ...n, ...patch };
            });
        }

        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch genetic tree" });
    }
});

/**
 * PUT /api/genetics/trees/:id
 * Modifier un arbre généalogique
 */
router.put("/trees/:id", requireAuth, requireGeneticsAccess, validateTreeUpdate, async (req, res) => {
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
        res.status(500).json({ error: "Failed to update genetic tree" });
    }
});

/**
 * DELETE /api/genetics/trees/:id
 * Supprimer un arbre généalogique (et tous ses nœuds/arêtes en cascade)
 */
router.delete("/trees/:id", requireAuth, requireGeneticsAccess, async (req, res) => {
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
router.get("/trees/:id/nodes", optionalAuth, async (req, res) => {
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
                sourceReviewId: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "asc" }
        });

        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch nodes" });
    }
});

/**
 * POST /api/genetics/trees/:id/nodes
 * Ajouter un nœud à un arbre
 */
router.post("/trees/:id/nodes", requireAuth, requireGeneticsAccess, validateNodeCreation, async (req, res) => {
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
            notes = null,
            // Présent quand le nœud est créé par glisser-déposer d'une fiche technique Fleur
            // (pas un cultivar de bibliothèque) — permet de relier cette review à l'arbre en
            // retour, sinon FlowerReviewData.geneticTreeId reste null malgré la présence du
            // nœud, et la modale "créer un arbre" réapparaît à chaque réédition de cette review.
            sourceReviewId = null
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
                notes: notes?.trim() || null,
                sourceReviewId: sourceReviewId || null
            }
        });

        if (sourceReviewId) {
            await prisma.flowerReview.updateMany({
                where: { reviewId: sourceReviewId },
                data: { geneticTreeId: req.params.id }
            }).catch(() => {}); // best-effort : ne bloque pas la création du nœud si la review n'existe pas/plus
        }

        res.status(201).json({
            ...node,
            position: JSON.parse(node.position),
            genetics: node.genetics ? JSON.parse(node.genetics) : null
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to create node" });
    }
});

/**
 * PUT /api/genetics/nodes/:nodeId
 * Modifier un nœud
 */
router.put("/nodes/:nodeId", requireAuth, requireGeneticsAccess, validateNodeUpdate, async (req, res) => {
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
            notes,
            sourceReviewId
        } = req.body;

        const updated = await prisma.genNode.update({
            where: { id: req.params.nodeId },
            data: {
                ...(cultivarName && { cultivarName: cultivarName.trim() }),
                ...(position && { position: JSON.stringify(position) }),
                ...(color && { color }),
                ...(image !== undefined && { image: image || null }),
                ...(genetics !== undefined && { genetics: genetics ? JSON.stringify(genetics) : null }),
                ...(notes !== undefined && { notes: notes?.trim() || null }),
                ...(sourceReviewId !== undefined && { sourceReviewId: sourceReviewId || null })
            }
        });

        // Même rattrapage de lien retour que POST /trees/:id/nodes (sinon relier un nœud déjà
        // existant à une review — ré-attacher après détachement, ou changer de review liée —
        // laisse FlowerReview.geneticTreeId à null pour toujours, et le modal "créer un arbre"
        // réapparaît à chaque réédition de cette review).
        if (sourceReviewId !== undefined && sourceReviewId !== node.sourceReviewId) {
            if (sourceReviewId) {
                await prisma.flowerReview.updateMany({
                    where: { reviewId: sourceReviewId },
                    data: { geneticTreeId: node.treeId }
                }).catch(() => {});
            }
            if (node.sourceReviewId) {
                await prisma.flowerReview.updateMany({
                    where: { reviewId: node.sourceReviewId, geneticTreeId: node.treeId },
                    data: { geneticTreeId: null }
                }).catch(() => {});
            }
        }

        res.json({
            ...updated,
            position: JSON.parse(updated.position),
            genetics: updated.genetics ? JSON.parse(updated.genetics) : null
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update node" });
    }
});

/**
 * DELETE /api/genetics/nodes/:nodeId
 * Supprimer un nœud (et ses arêtes associées)
 */
router.delete("/nodes/:nodeId", requireAuth, requireGeneticsAccess, async (req, res) => {
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
router.get("/trees/:id/edges", optionalAuth, async (req, res) => {
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
                pollinationMethod: true,
                notes: true,
                waypointX: true,
                waypointY: true,
                sourceHandle: true,
                targetHandle: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "asc" }
        });

        res.json(edges);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch edges" });
    }
});

/**
 * POST /api/genetics/trees/:id/edges
 * Ajouter une arête (relation parent-enfant)
 */
router.post("/trees/:id/edges", requireAuth, requireGeneticsAccess, validateEdgeCreation, async (req, res) => {
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

        const VALID_HANDLES = ["top", "bottom", "left", "right"];
        const {
            parentNodeId,
            childNodeId,
            relationshipType = "parent",
            pollinationMethod = null,
            notes = null,
            sourceHandle = null,
            targetHandle = null
        } = req.body;

        if (!parentNodeId || !childNodeId) {
            return res.status(400).json({ error: "Parent and child node IDs are required" });
        }

        if (sourceHandle !== null && !VALID_HANDLES.includes(sourceHandle)) {
            return res.status(400).json({ error: `Invalid sourceHandle. Must be one of: ${VALID_HANDLES.join(", ")}` });
        }
        if (targetHandle !== null && !VALID_HANDLES.includes(targetHandle)) {
            return res.status(400).json({ error: `Invalid targetHandle. Must be one of: ${VALID_HANDLES.join(", ")}` });
        }

        // Vérifier que les nœuds existent et appartiennent à cet arbre
        const [parentNode, childNode] = await Promise.all([
            prisma.genNode.findUnique({ where: { id: parentNodeId } }),
            prisma.genNode.findUnique({ where: { id: childNodeId } })
        ]);

        if (!parentNode || !childNode || parentNode.treeId !== req.params.id || childNode.treeId !== req.params.id) {
            return res.status(400).json({ error: "Invalid parent or child node" });
        }

        // "pairing" relie deux parents entre eux (pas une filiation) : l'exclure de la détection
        // de cycle, qui ne raisonne que sur des liens d'ascendance réelle.
        if (relationshipType !== "pairing") {
            const existingEdges = await prisma.genEdge.findMany({
                where: { treeId: req.params.id, relationshipType: { not: "pairing" } },
                select: { parentNodeId: true, childNodeId: true }
            });
            const normalizedEdges = existingEdges.map(e => ({ source: e.parentNodeId, target: e.childNodeId }));

            if (wouldCreateCycle(normalizedEdges, parentNodeId, childNodeId)) {
                return res.status(400).json({ error: "This relationship would create a cycle" });
            }
        }

        try {
            const edge = await prisma.genEdge.create({
                data: {
                    treeId: req.params.id,
                    parentNodeId,
                    childNodeId,
                    relationshipType: relationshipType || "parent",
                    pollinationMethod: pollinationMethod || null,
                    notes: notes?.trim() || null,
                    sourceHandle: sourceHandle || null,
                    targetHandle: targetHandle || null
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
        res.status(500).json({ error: "Failed to create edge" });
    }
});

/**
 * PUT /api/genetics/edges/:edgeId
 * Modifier une arête — relationshipType/notes/courbure/accroche, ET les extrémités
 * (parentNodeId/childNodeId, ex: inverser une relation ou reconnecter une liaison glissée
 * sur un nœud différent). Revalide l'absence de cycle quand une extrémité change.
 */
router.put("/edges/:edgeId", requireAuth, requireGeneticsAccess, validateEdgeUpdate, async (req, res) => {
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

        const VALID_HANDLES = ["top", "bottom", "left", "right"];
        const { relationshipType, pollinationMethod, notes, waypointX, waypointY, sourceHandle, targetHandle, parentNodeId, childNodeId } = req.body;

        if (sourceHandle !== undefined && sourceHandle !== null && !VALID_HANDLES.includes(sourceHandle)) {
            return res.status(400).json({ error: `Invalid sourceHandle. Must be one of: ${VALID_HANDLES.join(", ")}` });
        }
        if (targetHandle !== undefined && targetHandle !== null && !VALID_HANDLES.includes(targetHandle)) {
            return res.status(400).json({ error: `Invalid targetHandle. Must be one of: ${VALID_HANDLES.join(", ")}` });
        }

        const finalParentId = parentNodeId ?? edge.parentNodeId;
        const finalChildId = childNodeId ?? edge.childNodeId;
        const endpointsChanged = parentNodeId !== undefined || childNodeId !== undefined;

        if (endpointsChanged) {
            if (finalParentId === finalChildId) {
                return res.status(400).json({ error: "Invalid parent or child node" });
            }

            const [parentNode, childNode] = await Promise.all([
                prisma.genNode.findUnique({ where: { id: finalParentId } }),
                prisma.genNode.findUnique({ where: { id: finalChildId } })
            ]);

            if (!parentNode || !childNode || parentNode.treeId !== edge.treeId || childNode.treeId !== edge.treeId) {
                return res.status(400).json({ error: "Invalid parent or child node" });
            }

            const finalRelationshipType = relationshipType || edge.relationshipType;
            if (finalRelationshipType !== "pairing") {
                const existingEdges = await prisma.genEdge.findMany({
                    where: { treeId: edge.treeId, id: { not: edge.id }, relationshipType: { not: "pairing" } },
                    select: { parentNodeId: true, childNodeId: true }
                });
                const normalizedEdges = existingEdges.map(e => ({ source: e.parentNodeId, target: e.childNodeId }));

                if (wouldCreateCycle(normalizedEdges, finalParentId, finalChildId)) {
                    return res.status(400).json({ error: "This relationship would create a cycle" });
                }
            }
        }

        try {
            const updated = await prisma.genEdge.update({
                where: { id: req.params.edgeId },
                data: {
                    ...(relationshipType && { relationshipType }),
                    ...(pollinationMethod !== undefined && { pollinationMethod: pollinationMethod || null }),
                    ...(notes !== undefined && { notes: notes?.trim() || null }),
                    // null explicite = retour à la ligne droite (réinitialisation du point de courbure)
                    ...(waypointX !== undefined && { waypointX: waypointX === null ? null : Number(waypointX) }),
                    ...(waypointY !== undefined && { waypointY: waypointY === null ? null : Number(waypointY) }),
                    // null explicite = retour à l'accroche automatique flottante
                    ...(sourceHandle !== undefined && { sourceHandle: sourceHandle || null }),
                    ...(targetHandle !== undefined && { targetHandle: targetHandle || null }),
                    ...(parentNodeId !== undefined && { parentNodeId }),
                    ...(childNodeId !== undefined && { childNodeId })
                }
            });

            res.json(updated);
        } catch (error) {
            if (error.code === "P2002") {
                return res.status(409).json({ error: "This relationship already exists" });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update edge" });
    }
});

/**
 * DELETE /api/genetics/edges/:edgeId
 * Supprimer une arête
 */
router.delete("/edges/:edgeId", requireAuth, requireGeneticsAccess, async (req, res) => {
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
        res.status(500).json({ error: "Failed to delete edge" });
    }
});

export default router
