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
 * POST   /api/production-chains/chains/:id/annotations          - Épingler une carte sur le canvas
 * PUT    /api/production-chains/annotations/:annotationId       - Modifier une carte épinglée
 * DELETE /api/production-chains/annotations/:annotationId       - Supprimer une carte épinglée
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
    validateChainEdgeUpdate,
    validateChainAnnotationCreation,
    validateChainAnnotationUpdate
} from '../middleware/validateProductionChain.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { requireFeature } from '../middleware/permissions.js'
import { wouldCreateCycle } from '../utils/graphCycle.js'
import { REVIEW_TYPE_TO_DB } from '../utils/reviewTypeMap.js'
import { resolveChainEdgeEndpoint } from '../utils/chainEdgeEndpoints.js'

const router = express.Router()
const requireChainAccess = requireFeature('production_chain')

// Ajoute sourceId/targetId normalisés (= le FK non-null du côté concerné, nœud ou bulle) sur une
// edge — évite au frontend de devoir choisir entre sourceNodeId/sourceAnnotationId à chaque
// résolution d'extrémité (cf. client/src/utils/chainEndpoint.js).
const normalizeEdge = (edge) => ({
    ...edge,
    sourceId: edge.sourceNodeId ?? edge.sourceAnnotationId,
    targetId: edge.targetNodeId ?? edge.targetAnnotationId
})

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
                        image: true,
                        position: true,
                        color: true,
                        cellData: true,
                        media: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                edges: {
                    select: {
                        id: true,
                        sourceNodeId: true,
                        sourceAnnotationId: true,
                        targetNodeId: true,
                        targetAnnotationId: true,
                        technique: true,
                        date: true,
                        notes: true,
                        waypointX: true,
                        waypointY: true,
                        sourceHandle: true,
                        targetHandle: true,
                        cellData: true,
                        media: true
                    }
                },
                annotations: {
                    select: {
                        id: true,
                        nodeId: true,
                        edgeId: true,
                        position: true,
                        title: true,
                        body: true,
                        sourceLabel: true,
                        sourceReviewId: true,
                        sourceReviewType: true,
                        pipelineType: true,
                        cellTimestamp: true,
                        mediaUrl: true,
                        mediaType: true
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

        // Détection des liens cassés : reviewId n'a pas de FK Prisma (4 tables de review
        // différentes possibles), donc rien n'empêche une review d'être supprimée en laissant
        // le ChainNode qui la référençait intact. Même pattern que genetics.js (GET /trees/:id,
        // sourceReviewOrphaned) — on vérifie tous les nœuds ayant un reviewId non-null et on
        // marque reviewOrphaned sur ceux dont l'id ne résout plus.
        const linkedReviewIds = [...new Set(chain.nodes.filter(n => n.reviewId).map(n => n.reviewId))]
        if (linkedReviewIds.length > 0) {
            const foundReviews = await prisma.review.findMany({
                where: { id: { in: linkedReviewIds } },
                select: { id: true }
            })
            const foundReviewIds = new Set(foundReviews.map(r => r.id))
            chain.nodes = chain.nodes.map(n => {
                if (!n.reviewId) return n
                return { ...n, reviewOrphaned: !foundReviewIds.has(n.reviewId) }
            })
        }

        chain.edges = chain.edges.map(normalizeEdge)

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
            select: {
                id: true, authorId: true, type: true, holderName: true, images: true,
                hashData: { select: { photos: true } },
                concentrateData: { select: { photos: true } },
                edibleData: { select: { photos: true } }
            }
        })

        if (!review || review.type !== REVIEW_TYPE_TO_DB[reviewType]) {
            return res.status(400).json({ error: "Invalid review reference" })
        }

        if (review.authorId !== req.user.id) {
            return res.status(403).json({ error: "You can only add your own reviews to a chain" })
        }

        // Fleur stocke ses photos sur Review.images, Hash/Concentré/Comestible sur leur
        // propre sous-table (même fallback que reviewFormatter.js côté galerie)
        let image = null
        try {
            const rawPhotos = review.images || review.hashData?.photos || review.concentrateData?.photos || review.edibleData?.photos
            const parsed = rawPhotos ? JSON.parse(rawPhotos) : []
            image = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
        } catch { /* pas de photo exploitable */ }

        try {
            const node = await prisma.chainNode.create({
                data: {
                    chainId: req.params.id,
                    reviewType,
                    reviewId,
                    label: review.holderName || 'Sans nom',
                    image,
                    position: JSON.stringify(position),
                    color: color || "#10b981"
                }
            })

            res.status(201).json({ ...node, position: JSON.parse(node.position), cellData: JSON.parse(node.cellData || "[]"), media: JSON.parse(node.media || "[]") })
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

        const { position, color, reviewType, reviewId, cellData, media } = req.body
        const data = {
            ...(position && { position: JSON.stringify(position) }),
            ...(color && { color }),
            ...(cellData !== undefined && { cellData: JSON.stringify(cellData) }),
            ...(media !== undefined && { media: JSON.stringify(media) })
        }

        // reviewId === null : détache un lien cassé (garde label/image en cache, "Tout détacher").
        // reviewId (string) : change la review liée — même validation d'existence/type/propriété
        // que POST /chains/:id/nodes, et on recalcule label/image comme à la création.
        if (reviewId === null) {
            data.reviewId = null
        } else if (reviewId !== undefined) {
            const review = await prisma.review.findUnique({
                where: { id: reviewId },
                select: {
                    id: true, authorId: true, type: true, holderName: true, images: true,
                    hashData: { select: { photos: true } },
                    concentrateData: { select: { photos: true } },
                    edibleData: { select: { photos: true } }
                }
            })

            if (!review || review.type !== REVIEW_TYPE_TO_DB[reviewType]) {
                return res.status(400).json({ error: "Invalid review reference" })
            }
            if (review.authorId !== req.user.id) {
                return res.status(403).json({ error: "You can only link your own reviews" })
            }

            let image = null
            try {
                const rawPhotos = review.images || review.hashData?.photos || review.concentrateData?.photos || review.edibleData?.photos
                const parsed = rawPhotos ? JSON.parse(rawPhotos) : []
                image = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null
            } catch { /* pas de photo exploitable */ }

            data.reviewType = reviewType
            data.reviewId = reviewId
            data.label = review.holderName || 'Sans nom'
            data.image = image
        }

        try {
            const updated = await prisma.chainNode.update({
                where: { id: req.params.nodeId },
                data
            })
            res.json({ ...updated, position: JSON.parse(updated.position), cellData: JSON.parse(updated.cellData || "[]"), media: JSON.parse(updated.media || "[]") })
        } catch (error) {
            if (error.code === "P2002") {
                return res.status(409).json({ error: "This review is already in the chain" })
            }
            throw error
        }
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

        const {
            sourceNodeId = null, sourceAnnotationId = null,
            targetNodeId = null, targetAnnotationId = null,
            technique = null, date = null, notes = null, cellData, media
        } = req.body

        const [source, target] = await Promise.all([
            resolveChainEdgeEndpoint(prisma, { nodeId: sourceNodeId, annotationId: sourceAnnotationId }, req.params.id),
            resolveChainEdgeEndpoint(prisma, { nodeId: targetNodeId, annotationId: targetAnnotationId }, req.params.id)
        ])

        if (source.error) return res.status(400).json({ error: source.error })
        if (target.error) return res.status(400).json({ error: target.error })

        if (source.id === target.id) {
            return res.status(400).json({ error: "An element cannot be related to itself" })
        }

        const existingEdges = await prisma.chainEdge.findMany({
            where: { chainId: req.params.id },
            select: { sourceNodeId: true, sourceAnnotationId: true, targetNodeId: true, targetAnnotationId: true }
        })
        const normalizedEdges = existingEdges.map(e => ({
            source: e.sourceNodeId ?? e.sourceAnnotationId,
            target: e.targetNodeId ?? e.targetAnnotationId
        }))

        const duplicate = normalizedEdges.some(e => e.source === source.id && e.target === target.id)
        if (duplicate) {
            return res.status(409).json({ error: "This relationship already exists" })
        }

        if (wouldCreateCycle(normalizedEdges, source.id, target.id)) {
            return res.status(400).json({ error: "This relationship would create a cycle" })
        }

        try {
            const edge = await prisma.chainEdge.create({
                data: {
                    chainId: req.params.id,
                    sourceNodeId: source.kind === 'node' ? source.id : null,
                    sourceAnnotationId: source.kind === 'annotation' ? source.id : null,
                    targetNodeId: target.kind === 'node' ? target.id : null,
                    targetAnnotationId: target.kind === 'annotation' ? target.id : null,
                    technique: technique?.trim() || null,
                    date: date ? new Date(date) : null,
                    notes: notes?.trim() || null,
                    ...(cellData !== undefined && { cellData: JSON.stringify(cellData) }),
                    ...(media !== undefined && { media: JSON.stringify(media) })
                }
            })

            res.status(201).json(normalizeEdge({ ...edge, cellData: JSON.parse(edge.cellData || "[]"), media: JSON.parse(edge.media || "[]") }))
        } catch (error) {
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

        const { technique, date, notes, sourceNodeId, targetNodeId, waypointX, waypointY, sourceHandle, targetHandle, cellData, media } = req.body

        // Inverser la direction (ou reconnecter vers un autre nœud) : les deux nœuds doivent
        // appartenir à la même chaîne, l'échange ne doit pas créer de cycle ni dupliquer une
        // liaison déjà existante (contrainte @@unique([sourceNodeId, targetNodeId])).
        if (sourceNodeId !== undefined || targetNodeId !== undefined) {
            const newSource = sourceNodeId !== undefined ? sourceNodeId : edge.sourceNodeId
            const newTarget = targetNodeId !== undefined ? targetNodeId : edge.targetNodeId

            const [sourceExists, targetExists] = await Promise.all([
                prisma.chainNode.findFirst({ where: { id: newSource, chainId: edge.chainId } }),
                prisma.chainNode.findFirst({ where: { id: newTarget, chainId: edge.chainId } })
            ])
            if (!sourceExists || !targetExists) {
                return res.status(400).json({ error: "Source/target node not found in this chain" })
            }

            const otherEdges = await prisma.chainEdge.findMany({
                where: { chainId: edge.chainId, id: { not: edge.id } },
                select: { sourceNodeId: true, targetNodeId: true }
            })

            const duplicate = otherEdges.some(e => e.sourceNodeId === newSource && e.targetNodeId === newTarget)
            if (duplicate) {
                return res.status(400).json({ error: "A transformation already exists between these two products" })
            }

            const normalizedEdges = otherEdges.map(e => ({ source: e.sourceNodeId, target: e.targetNodeId }))
            if (wouldCreateCycle(normalizedEdges, newSource, newTarget)) {
                return res.status(400).json({ error: "This would create a cycle in the chain" })
            }
        }

        const updated = await prisma.chainEdge.update({
            where: { id: req.params.edgeId },
            data: {
                ...(technique !== undefined && { technique: technique?.trim() || null }),
                ...(date !== undefined && { date: date ? new Date(date) : null }),
                ...(notes !== undefined && { notes: notes?.trim() || null }),
                ...(sourceNodeId !== undefined && { sourceNodeId }),
                ...(targetNodeId !== undefined && { targetNodeId }),
                ...(waypointX !== undefined && { waypointX }),
                ...(waypointY !== undefined && { waypointY }),
                ...(sourceHandle !== undefined && { sourceHandle }),
                ...(targetHandle !== undefined && { targetHandle }),
                ...(cellData !== undefined && { cellData: JSON.stringify(cellData) }),
                ...(media !== undefined && { media: JSON.stringify(media) })
            }
        })

        res.json({ ...updated, cellData: JSON.parse(updated.cellData || "[]"), media: JSON.parse(updated.media || "[]") })
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
// ANNOTATIONS ROUTES (cartes épinglées librement sur le fond du canvas)
// =============================================================================

router.post("/chains/:id/annotations", requireAuth, requireChainAccess, validateChainAnnotationCreation, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({ where: { id: req.params.id } })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const {
            position, title, body = [], sourceLabel = null, nodeId = null, edgeId = null,
            sourceReviewId = null, sourceReviewType = null, pipelineType = null, cellTimestamp = null,
            mediaUrl = null, mediaType = null
        } = req.body

        // La cible (si fournie) doit appartenir à cette même chaîne — sinon une carte pourrait
        // s'ancrer sur un nœud/liaison d'une autre chaîne (et jamais y être visible ni supprimée
        // par la cascade attendue).
        if (nodeId) {
            const node = await prisma.chainNode.findUnique({ where: { id: nodeId } })
            if (!node || node.chainId !== req.params.id) {
                return res.status(400).json({ error: "Target node not found in this chain" })
            }
        }
        if (edgeId) {
            const edge = await prisma.chainEdge.findUnique({ where: { id: edgeId } })
            if (!edge || edge.chainId !== req.params.id) {
                return res.status(400).json({ error: "Target edge not found in this chain" })
            }
        }

        const annotation = await prisma.chainAnnotation.create({
            data: {
                chainId: req.params.id,
                nodeId,
                edgeId,
                position: JSON.stringify(position || { x: 0, y: 0 }),
                title: title.trim(),
                body: JSON.stringify(body),
                sourceLabel: sourceLabel?.trim() || null,
                sourceReviewId,
                sourceReviewType,
                pipelineType,
                cellTimestamp,
                mediaUrl,
                mediaType
            }
        })

        res.status(201).json({ ...annotation, position: JSON.parse(annotation.position), body: JSON.parse(annotation.body || "[]") })
    } catch (error) {
        res.status(500).json({ error: "Failed to create annotation" })
    }
})

router.put("/annotations/:annotationId", requireAuth, requireChainAccess, validateChainAnnotationUpdate, async (req, res) => {
    try {
        const annotation = await prisma.chainAnnotation.findUnique({
            where: { id: req.params.annotationId },
            include: { chain: true }
        })

        if (!annotation) {
            return res.status(404).json({ error: "Annotation not found" })
        }

        if (annotation.chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const { position, title, body, sourceLabel, nodeId, edgeId, sourceReviewId, sourceReviewType, pipelineType, cellTimestamp, mediaUrl, mediaType } = req.body

        if (nodeId) {
            const node = await prisma.chainNode.findUnique({ where: { id: nodeId } })
            if (!node || node.chainId !== annotation.chainId) {
                return res.status(400).json({ error: "Target node not found in this chain" })
            }
        }
        if (edgeId) {
            const edge = await prisma.chainEdge.findUnique({ where: { id: edgeId } })
            if (!edge || edge.chainId !== annotation.chainId) {
                return res.status(400).json({ error: "Target edge not found in this chain" })
            }
        }

        const data = {
            ...(position !== undefined && { position: JSON.stringify(position) }),
            ...(title !== undefined && { title: title.trim() }),
            ...(body !== undefined && { body: JSON.stringify(body) }),
            ...(sourceLabel !== undefined && { sourceLabel: sourceLabel?.trim() || null }),
            // nodeId/edgeId : reassigner explicitement vers une autre cible (ou null pour détacher/
            // rendre la carte libre) — permet le geste "déplacer une note épinglée vers une autre
            // bulle". Toujours réassigner ensemble (jamais l'un sans l'autre) pour ne pas laisser
            // une carte ancrée aux deux à la fois si un seul des deux champs était envoyé.
            ...(nodeId !== undefined && { nodeId, edgeId: null }),
            ...(edgeId !== undefined && { edgeId, nodeId: null }),
            ...(sourceReviewId !== undefined && { sourceReviewId }),
            ...(sourceReviewType !== undefined && { sourceReviewType }),
            ...(pipelineType !== undefined && { pipelineType }),
            ...(cellTimestamp !== undefined && { cellTimestamp }),
            ...(mediaUrl !== undefined && { mediaUrl }),
            ...(mediaType !== undefined && { mediaType })
        }

        const updated = await prisma.chainAnnotation.update({
            where: { id: req.params.annotationId },
            data
        })

        res.json({ ...updated, position: JSON.parse(updated.position), body: JSON.parse(updated.body || "[]") })
    } catch (error) {
        res.status(500).json({ error: "Failed to update annotation" })
    }
})

router.delete("/annotations/:annotationId", requireAuth, requireChainAccess, async (req, res) => {
    try {
        const annotation = await prisma.chainAnnotation.findUnique({
            where: { id: req.params.annotationId },
            include: { chain: true }
        })

        if (!annotation) {
            return res.status(404).json({ error: "Annotation not found" })
        }

        if (annotation.chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        await prisma.chainAnnotation.delete({ where: { id: req.params.annotationId } })

        res.json({ message: "Annotation deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: "Failed to delete annotation" })
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
