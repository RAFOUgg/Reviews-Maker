/**
 * Routes pour la gestion des chaînes de production (Production Chain)
 *
 * Graphe liant plusieurs fiches techniques (reviews Fleur/Hash/Concentré/Comestible)
 * entre elles, avec les données de transformation (technique/date/notes) sur les liaisons.
 * Réservé aux comptes Producteur/Merchant (voir requireFeature('production_chain')).
 *
 * Endpoints:
 * GET    /api/production-chains/chains                          - Lister les chaînes de l'utilisateur
 * POST   /api/production-chains/chains                          - Créer une nouvelle chaîne
 * GET    /api/production-chains/chains/:id                      - Récupérer une chaîne
 * PUT    /api/production-chains/chains/:id                      - Modifier une chaîne
 * DELETE /api/production-chains/chains/:id                      - Supprimer une chaîne
 *
 * POST   /api/production-chains/chains/:id/nodes                - Ajouter un nœud (référence une review)
 * PUT    /api/production-chains/nodes/:nodeId                   - Modifier un nœud
 * DELETE /api/production-chains/nodes/:nodeId                   - Supprimer un nœud
 *
 * POST   /api/production-chains/chains/:id/edges                - Ajouter une arête (transformation)
 * PUT    /api/production-chains/edges/:edgeId                   - Modifier une arête
 * DELETE /api/production-chains/edges/:edgeId                   - Supprimer une arête
 *
 * GET    /api/production-chains/for-review/:reviewType/:reviewId - Chaîne(s) publiques/possédées contenant cette review
 */

import express from 'express'
import { prisma } from '../server.js'
import {
    validateChainCreation,
    validateChainUpdate,
    validateChainNodeCreation,
    validateChainNodeUpdate,
    validateChainEdgeCreation,
    validateChainEdgeUpdate
} from '../middleware/validateProductionChain.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { requireFeature } from '../middleware/permissions.js'
import { wouldCreateCycle } from '../utils/graphCycle.js'
import { REVIEW_TYPE_TO_DB } from '../utils/reviewTypeMap.js'

const router = express.Router()
const requireChainAccess = requireFeature('production_chain')

// =============================================================================
// CHAINS ROUTES
// =============================================================================

router.get("/chains", requireAuth, requireChainAccess, async (req, res) => {
    try {
        const chains = await prisma.productionChain.findMany({
            where: { userId: req.user.id },
            select: {
                id: true,
                name: true,
                description: true,
                isPublic: true,
                shareCode: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { nodes: true, edges: true } }
            },
            orderBy: { updatedAt: "desc" }
        })

        res.json(chains)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch production chains" })
    }
})

router.post("/chains", requireAuth, requireChainAccess, validateChainCreation, async (req, res) => {
    try {
        const { name, description, isPublic = false } = req.body

        const chain = await prisma.productionChain.create({
            data: {
                userId: req.user.id,
                name: name.trim(),
                description: description?.trim() || null,
                isPublic: isPublic || false
            }
        })

        res.status(201).json(chain)
    } catch (error) {
        res.status(500).json({ error: "Failed to create production chain" })
    }
})

router.get("/chains/:id", optionalAuth, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({
            where: { id: req.params.id },
            include: {
                nodes: {
                    select: {
                        id: true,
                        reviewType: true,
                        reviewId: true,
                        label: true,
                        position: true,
                        color: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                edges: {
                    select: {
                        id: true,
                        sourceNodeId: true,
                        targetNodeId: true,
                        technique: true,
                        date: true,
                        notes: true
                    }
                }
            }
        })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (!chain.isPublic && chain.userId !== req.user?.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        res.json(chain)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch production chain" })
    }
})

router.put("/chains/:id", requireAuth, requireChainAccess, validateChainUpdate, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({ where: { id: req.params.id } })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const { name, description, isPublic } = req.body

        const updated = await prisma.productionChain.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() || null }),
                ...(isPublic !== undefined && { isPublic })
            }
        })

        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: "Failed to update production chain" })
    }
})

router.delete("/chains/:id", requireAuth, requireChainAccess, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({ where: { id: req.params.id } })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        await prisma.productionChain.delete({ where: { id: req.params.id } })

        res.json({ message: "Chain deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Failed to delete production chain" })
    }
})

// =============================================================================
// NODES ROUTES
// =============================================================================

router.post("/chains/:id/nodes", requireAuth, requireChainAccess, validateChainNodeCreation, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({ where: { id: req.params.id } })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const {
            reviewType,
            reviewId,
            position = { x: 0, y: 0 },
            color = "#10b981"
        } = req.body

        // Pas de FK Prisma possible (4 tables de review différentes) — vérification applicative
        // de l'existence et de la propriété de la review, même logique que la résolution de
        // geneticTreeId dans flower-reviews.js
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            select: { id: true, authorId: true, type: true, holderName: true }
        })

        if (!review || review.type !== REVIEW_TYPE_TO_DB[reviewType]) {
            return res.status(400).json({ error: "Invalid review reference" })
        }

        if (review.authorId !== req.user.id) {
            return res.status(403).json({ error: "You can only add your own reviews to a chain" })
        }

        try {
            const node = await prisma.chainNode.create({
                data: {
                    chainId: req.params.id,
                    reviewType,
                    reviewId,
                    label: review.holderName || 'Sans nom',
                    position: JSON.stringify(position),
                    color: color || "#10b981"
                }
            })

            res.status(201).json({ ...node, position: JSON.parse(node.position) })
        } catch (error) {
            if (error.code === "P2002") {
                return res.status(409).json({ error: "This review is already in the chain" })
            }
            throw error
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create chain node" })
    }
})

router.put("/nodes/:nodeId", requireAuth, requireChainAccess, validateChainNodeUpdate, async (req, res) => {
    try {
        const node = await prisma.chainNode.findUnique({
            where: { id: req.params.nodeId },
            include: { chain: true }
        })

        if (!node) {
            return res.status(404).json({ error: "Node not found" })
        }

        if (node.chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const { position, color } = req.body

        const updated = await prisma.chainNode.update({
            where: { id: req.params.nodeId },
            data: {
                ...(position && { position: JSON.stringify(position) }),
                ...(color && { color })
            }
        })

        res.json({ ...updated, position: JSON.parse(updated.position) })
    } catch (error) {
        res.status(500).json({ error: "Failed to update chain node" })
    }
})

router.delete("/nodes/:nodeId", requireAuth, requireChainAccess, async (req, res) => {
    try {
        const node = await prisma.chainNode.findUnique({
            where: { id: req.params.nodeId },
            include: { chain: true }
        })

        if (!node) {
            return res.status(404).json({ error: "Node not found" })
        }

        if (node.chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        // Les arêtes seront supprimées en cascade via Prisma
        await prisma.chainNode.delete({ where: { id: req.params.nodeId } })

        res.json({ message: "Node deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Failed to delete chain node" })
    }
})

// =============================================================================
// EDGES ROUTES
// =============================================================================

router.post("/chains/:id/edges", requireAuth, requireChainAccess, validateChainEdgeCreation, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({ where: { id: req.params.id } })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const { sourceNodeId, targetNodeId, technique = null, date = null, notes = null } = req.body

        const [sourceNode, targetNode] = await Promise.all([
            prisma.chainNode.findUnique({ where: { id: sourceNodeId } }),
            prisma.chainNode.findUnique({ where: { id: targetNodeId } })
        ])

        if (!sourceNode || !targetNode || sourceNode.chainId !== req.params.id || targetNode.chainId !== req.params.id) {
            return res.status(400).json({ error: "Invalid source or target node" })
        }

        const existingEdges = await prisma.chainEdge.findMany({
            where: { chainId: req.params.id },
            select: { sourceNodeId: true, targetNodeId: true }
        })
        const normalizedEdges = existingEdges.map(e => ({ source: e.sourceNodeId, target: e.targetNodeId }))

        if (wouldCreateCycle(normalizedEdges, sourceNodeId, targetNodeId)) {
            return res.status(400).json({ error: "This relationship would create a cycle" })
        }

        try {
            const edge = await prisma.chainEdge.create({
                data: {
                    chainId: req.params.id,
                    sourceNodeId,
                    targetNodeId,
                    technique: technique?.trim() || null,
                    date: date ? new Date(date) : null,
                    notes: notes?.trim() || null
                }
            })

            res.status(201).json(edge)
        } catch (error) {
            if (error.code === "P2002") {
                return res.status(409).json({ error: "This relationship already exists" })
            }
            throw error
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create chain edge" })
    }
})

router.put("/edges/:edgeId", requireAuth, requireChainAccess, validateChainEdgeUpdate, async (req, res) => {
    try {
        const edge = await prisma.chainEdge.findUnique({
            where: { id: req.params.edgeId },
            include: { chain: true }
        })

        if (!edge) {
            return res.status(404).json({ error: "Edge not found" })
        }

        if (edge.chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const { technique, date, notes } = req.body

        const updated = await prisma.chainEdge.update({
            where: { id: req.params.edgeId },
            data: {
                ...(technique !== undefined && { technique: technique?.trim() || null }),
                ...(date !== undefined && { date: date ? new Date(date) : null }),
                ...(notes !== undefined && { notes: notes?.trim() || null })
            }
        })

        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: "Failed to update chain edge" })
    }
})

router.delete("/edges/:edgeId", requireAuth, requireChainAccess, async (req, res) => {
    try {
        const edge = await prisma.chainEdge.findUnique({
            where: { id: req.params.edgeId },
            include: { chain: true }
        })

        if (!edge) {
            return res.status(404).json({ error: "Edge not found" })
        }

        if (edge.chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        await prisma.chainEdge.delete({ where: { id: req.params.edgeId } })

        res.json({ message: "Edge deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Failed to delete chain edge" })
    }
})

// =============================================================================
// LOOKUP - Chaîne(s) contenant une review donnée (pour l'affichage public en lecture seule)
// =============================================================================

router.get("/for-review/:reviewType/:reviewId", optionalAuth, async (req, res) => {
    try {
        const { reviewType, reviewId } = req.params

        const nodes = await prisma.chainNode.findMany({
            where: { reviewType, reviewId },
            select: { chainId: true }
        })

        if (nodes.length === 0) {
            return res.json([])
        }

        const chainIds = [...new Set(nodes.map(n => n.chainId))]

        const chains = await prisma.productionChain.findMany({
            where: { id: { in: chainIds } },
            select: {
                id: true,
                name: true,
                isPublic: true,
                userId: true,
                _count: { select: { nodes: true, edges: true } }
            }
        })

        const visible = chains
            .filter(c => c.isPublic || c.userId === req.user?.id)
            .map(({ userId, ...rest }) => rest)

        res.json(visible)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chains for review" })
    }
})

export default router
