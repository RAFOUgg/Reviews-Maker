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
 * GET    /api/production-chains/chains/:id/events                - Journal d'événements (AuditLog) de la chaîne
 * POST   /api/production-chains/chains/:id/events                - Journaliser un événement manuel (incident, équipement...)
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
import { logChainEvent } from '../utils/chainAuditLog.js'

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

// Journal d'événements de la chaîne (cf. utils/chainAuditLog.js) — AuditLog n'a pas de colonne
// chainId, donc on récupère d'abord les ids de nœuds/liaisons/annotations de CETTE chaîne, puis on
// filtre AuditLog sur ces entityId. Même règle d'accès que GET /chains/:id (lecture publique ou
// propriétaire uniquement).
router.get("/chains/:id/events", optionalAuth, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({ where: { id: req.params.id } })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (!chain.isPublic && chain.userId !== req.user?.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const [nodes, edges, annotations] = await Promise.all([
            prisma.chainNode.findMany({ where: { chainId: req.params.id }, select: { id: true } }),
            prisma.chainEdge.findMany({ where: { chainId: req.params.id }, select: { id: true } }),
            prisma.chainAnnotation.findMany({ where: { chainId: req.params.id }, select: { id: true } })
        ])

        const entityIds = [
            ...nodes.map(n => n.id),
            ...edges.map(e => e.id),
            ...annotations.map(a => a.id)
        ]

        if (entityIds.length === 0) {
            return res.json([])
        }

        const events = await prisma.auditLog.findMany({
            where: {
                entityType: { in: ['chainNode', 'chainEdge', 'chainAnnotation'] },
                entityId: { in: entityIds }
            },
            orderBy: { createdAt: 'desc' },
            take: 500
        })

        res.json(events.map(e => ({ ...e, metadata: JSON.parse(e.metadata || "{}") })))
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chain events" })
    }
})

// Journalisation manuelle d'un événement (ex: "le frigo est resté ouvert 4min31s") — jusqu'ici le
// journal (cf. GET .../events ci-dessus) n'était rempli qu'automatiquement par les mutations de
// nœuds/liaisons/annotations. Aucun champ n'est validé de façon bloquante côté serveur au-delà du
// titre (cf. principe "jamais de contrainte serveur bloquante",
// DOCUMENTATION/DATA_REFERENCE/11_TRACABILITE_ET_EXTENSIBILITE.md) — severity/équipement restent du
// texte libre, une valeur non prévue par l'UI reste acceptée.
router.post("/chains/:id/events", requireAuth, requireChainAccess, async (req, res) => {
    try {
        const chain = await prisma.productionChain.findUnique({ where: { id: req.params.id } })

        if (!chain) {
            return res.status(404).json({ error: "Chain not found" })
        }

        if (chain.userId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden" })
        }

        const {
            entityType, entityId, title, description = null,
            severity = null, startedAt = null, endedAt = null,
            equipmentId = null, equipmentLabel = null
        } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({ error: "title is required" })
        }
        if (entityType !== 'chainNode' && entityType !== 'chainEdge') {
            return res.status(400).json({ error: "entityType must be 'chainNode' or 'chainEdge'" })
        }

        // L'entité ciblée doit appartenir à CETTE chaîne — même garde-fou que les cartes épinglées
        // (éviter de journaliser un événement sur un nœud/liaison d'une autre chaîne).
        const entityExists = entityType === 'chainNode'
            ? await prisma.chainNode.findFirst({ where: { id: entityId, chainId: req.params.id } })
            : await prisma.chainEdge.findFirst({ where: { id: entityId, chainId: req.params.id } })

        if (!entityExists) {
            return res.status(400).json({ error: "Target entity not found in this chain" })
        }

        // equipmentId (optionnel) référence une entrée SavedData (bibliothèque "Matériel",
        // cf. client/src/pages/library/tabs/DataTab.jsx) — pas de FK Prisma (SavedData n'a pas de
        // vocation à être verrouillée par une relation), juste une vérification applicative
        // d'appartenance à l'utilisateur courant, même pattern que reviewId sur ChainNode.
        if (equipmentId) {
            const equipment = await prisma.savedData.findFirst({ where: { id: equipmentId, userId: req.user.id } })
            if (!equipment) {
                return res.status(400).json({ error: "Invalid equipment reference" })
            }
        }

        await logChainEvent(prisma, {
            userId: req.user.id,
            action: 'manual.event',
            entityType,
            entityId,
            metadata: {
                title: title.trim(),
                description: description?.trim() || null,
                severity,
                startedAt,
                endedAt,
                equipmentId,
                equipmentLabel: equipmentLabel?.trim() || null
            }
        })

        res.status(201).json({ message: "Event logged" })
    } catch (error) {
        res.status(500).json({ error: "Failed to log event" })
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

            await logChainEvent(prisma, {
                userId: req.user.id,
                action: 'chain_node.create',
                entityType: 'chainNode',
                entityId: node.id,
                metadata: { chainId: req.params.id, reviewType, reviewId, label: node.label }
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

            // On ne journalise jamais un simple déplacement/changement de couleur (bruit cosmétique,
            // pas un événement de production) — seulement les changements qui reflètent une vraie
            // action physique/documentaire : relier/détacher une review, attacher des cellules ou
            // des médias.
            if (reviewId !== undefined) {
                await logChainEvent(prisma, {
                    userId: req.user.id,
                    action: reviewId === null ? 'chain_node.unlink' : 'chain_node.relink',
                    entityType: 'chainNode',
                    entityId: node.id,
                    metadata: { chainId: node.chainId, label: updated.label }
                })
            } else if (cellData !== undefined) {
                await logChainEvent(prisma, {
                    userId: req.user.id,
                    action: 'chain_node.cells_update',
                    entityType: 'chainNode',
                    entityId: node.id,
                    metadata: { chainId: node.chainId, label: node.label, cellCount: Array.isArray(cellData) ? cellData.length : 0 }
                })
            } else if (media !== undefined) {
                await logChainEvent(prisma, {
                    userId: req.user.id,
                    action: 'chain_node.media_update',
                    entityType: 'chainNode',
                    entityId: node.id,
                    metadata: { chainId: node.chainId, label: node.label, mediaCount: Array.isArray(media) ? media.length : 0 }
                })
            }

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

        // Journalisé AVANT la suppression (pas de FK vers ChainNode sur AuditLog — le label est
        // donc capturé en clair dans metadata, seul moyen de rester lisible une fois le nœud parti).
        await logChainEvent(prisma, {
            userId: req.user.id,
            action: 'chain_node.delete',
            entityType: 'chainNode',
            entityId: node.id,
            metadata: { chainId: node.chainId, label: node.label }
        })

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

        await logChainEvent(prisma, {
            userId: req.user.id,
            action: 'chain_edge.create',
            entityType: 'chainEdge',
            entityId: edge.id,
            metadata: { chainId: req.params.id, technique: edge.technique, date: edge.date }
        })

        res.status(201).json(normalizeEdge({ ...edge, cellData: JSON.parse(edge.cellData || "[]"), media: JSON.parse(edge.media || "[]") }))
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

        const {
            technique, date, notes,
            sourceNodeId, sourceAnnotationId, targetNodeId, targetAnnotationId,
            waypointX, waypointY, sourceHandle, targetHandle, cellData, media
        } = req.body

        const sourceChanging = sourceNodeId !== undefined || sourceAnnotationId !== undefined
        const targetChanging = targetNodeId !== undefined || targetAnnotationId !== undefined

        let newSourceData = null
        let newTargetData = null

        // Reconnexion (glisser l'extrémité d'une liaison existante vers un autre nœud/bulle) :
        // les deux côtés doivent appartenir à la même chaîne, l'échange ne doit pas créer de
        // cycle ni dupliquer une liaison déjà existante (app-level, cf. schema.prisma ChainEdge
        // pour le retrait du @@unique désormais impossible avec 4 colonnes nullables).
        if (sourceChanging || targetChanging) {
            const source = sourceChanging
                ? await resolveChainEdgeEndpoint(prisma, { nodeId: sourceNodeId, annotationId: sourceAnnotationId }, edge.chainId)
                : { kind: edge.sourceNodeId ? 'node' : 'annotation', id: edge.sourceNodeId ?? edge.sourceAnnotationId }
            const target = targetChanging
                ? await resolveChainEdgeEndpoint(prisma, { nodeId: targetNodeId, annotationId: targetAnnotationId }, edge.chainId)
                : { kind: edge.targetNodeId ? 'node' : 'annotation', id: edge.targetNodeId ?? edge.targetAnnotationId }

            if (source.error) return res.status(400).json({ error: source.error })
            if (target.error) return res.status(400).json({ error: target.error })

            if (source.id === target.id) {
                return res.status(400).json({ error: "An element cannot be related to itself" })
            }

            const otherEdges = await prisma.chainEdge.findMany({
                where: { chainId: edge.chainId, id: { not: edge.id } },
                select: { sourceNodeId: true, sourceAnnotationId: true, targetNodeId: true, targetAnnotationId: true }
            })
            const normalizedEdges = otherEdges.map(e => ({
                source: e.sourceNodeId ?? e.sourceAnnotationId,
                target: e.targetNodeId ?? e.targetAnnotationId
            }))

            const duplicate = normalizedEdges.some(e => e.source === source.id && e.target === target.id)
            if (duplicate) {
                return res.status(400).json({ error: "A transformation already exists between these two elements" })
            }

            if (wouldCreateCycle(normalizedEdges, source.id, target.id)) {
                return res.status(400).json({ error: "This would create a cycle in the chain" })
            }

            newSourceData = source
            newTargetData = target
        }

        const updated = await prisma.chainEdge.update({
            where: { id: req.params.edgeId },
            data: {
                ...(technique !== undefined && { technique: technique?.trim() || null }),
                ...(date !== undefined && { date: date ? new Date(date) : null }),
                ...(notes !== undefined && { notes: notes?.trim() || null }),
                ...(newSourceData && {
                    sourceNodeId: newSourceData.kind === 'node' ? newSourceData.id : null,
                    sourceAnnotationId: newSourceData.kind === 'annotation' ? newSourceData.id : null
                }),
                ...(newTargetData && {
                    targetNodeId: newTargetData.kind === 'node' ? newTargetData.id : null,
                    targetAnnotationId: newTargetData.kind === 'annotation' ? newTargetData.id : null
                }),
                ...(waypointX !== undefined && { waypointX }),
                ...(waypointY !== undefined && { waypointY }),
                ...(sourceHandle !== undefined && { sourceHandle }),
                ...(targetHandle !== undefined && { targetHandle }),
                ...(cellData !== undefined && { cellData: JSON.stringify(cellData) }),
                ...(media !== undefined && { media: JSON.stringify(media) })
            }
        })

        // Même principe que la mise à jour d'un nœud : pas de bruit pour un simple déplacement de
        // poignée (waypoint/handle) — seuls les changements qui documentent la transformation elle-
        // même sont journalisés.
        if (technique !== undefined || date !== undefined || notes !== undefined) {
            await logChainEvent(prisma, {
                userId: req.user.id,
                action: 'chain_edge.update',
                entityType: 'chainEdge',
                entityId: edge.id,
                metadata: { chainId: edge.chainId, technique: updated.technique, date: updated.date }
            })
        }
        if (newSourceData || newTargetData) {
            await logChainEvent(prisma, {
                userId: req.user.id,
                action: 'chain_edge.reconnect',
                entityType: 'chainEdge',
                entityId: edge.id,
                metadata: { chainId: edge.chainId, technique: updated.technique }
            })
        }
        if (cellData !== undefined) {
            await logChainEvent(prisma, {
                userId: req.user.id,
                action: 'chain_edge.cells_update',
                entityType: 'chainEdge',
                entityId: edge.id,
                metadata: { chainId: edge.chainId, technique: edge.technique, cellCount: Array.isArray(cellData) ? cellData.length : 0 }
            })
        }
        if (media !== undefined) {
            await logChainEvent(prisma, {
                userId: req.user.id,
                action: 'chain_edge.media_update',
                entityType: 'chainEdge',
                entityId: edge.id,
                metadata: { chainId: edge.chainId, technique: edge.technique, mediaCount: Array.isArray(media) ? media.length : 0 }
            })
        }

        res.json(normalizeEdge({ ...updated, cellData: JSON.parse(updated.cellData || "[]"), media: JSON.parse(updated.media || "[]") }))
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

        await logChainEvent(prisma, {
            userId: req.user.id,
            action: 'chain_edge.delete',
            entityType: 'chainEdge',
            entityId: edge.id,
            metadata: { chainId: edge.chainId, technique: edge.technique }
        })

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

        // Une bulle épinglée est aujourd'hui l'échappatoire libre naturelle pour noter un événement
        // qui n'a pas encore de type structuré (cf. principe "toujours une échappatoire libre",
        // DOCUMENTATION/DATA_REFERENCE/11_TRACABILITE_ET_EXTENSIBILITE.md) — vaut la peine d'être
        // journalisée à la création, contrairement à ses modifications ultérieures (surtout des
        // déplacements sur le canvas, pas des événements en soi).
        await logChainEvent(prisma, {
            userId: req.user.id,
            action: 'chain_annotation.create',
            entityType: 'chainAnnotation',
            entityId: annotation.id,
            metadata: { chainId: req.params.id, title: annotation.title }
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

        await logChainEvent(prisma, {
            userId: req.user.id,
            action: 'chain_annotation.delete',
            entityType: 'chainAnnotation',
            entityId: annotation.id,
            metadata: { chainId: annotation.chainId, title: annotation.title }
        })

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

// Journal d'événements d'UNE review (Chantier 6 — rapport de traçabilité) : une review peut
// apparaître dans plusieurs ChainNode (plusieurs chaînes, ou plusieurs nœuds d'une même chaîne) —
// on agrège les événements de tous les nœuds correspondants, dans les chaînes visibles par
// l'appelant (même règle d'accès que GET /for-review/:reviewType/:reviewId ci-dessus).
router.get("/for-review/:reviewType/:reviewId/events", optionalAuth, async (req, res) => {
    try {
        const { reviewType, reviewId } = req.params

        const nodes = await prisma.chainNode.findMany({
            where: { reviewType, reviewId },
            select: { id: true, chainId: true }
        })

        if (nodes.length === 0) {
            return res.json([])
        }

        const chainIds = [...new Set(nodes.map(n => n.chainId))]
        const chains = await prisma.productionChain.findMany({
            where: { id: { in: chainIds } },
            select: { id: true, isPublic: true, userId: true }
        })
        const visibleChainIds = new Set(
            chains.filter(c => c.isPublic || c.userId === req.user?.id).map(c => c.id)
        )

        const entityIds = nodes.filter(n => visibleChainIds.has(n.chainId)).map(n => n.id)
        if (entityIds.length === 0) {
            return res.json([])
        }

        const events = await prisma.auditLog.findMany({
            where: { entityType: 'chainNode', entityId: { in: entityIds } },
            orderBy: { createdAt: 'desc' },
            take: 200
        })

        res.json(events.map(e => ({ ...e, metadata: JSON.parse(e.metadata || "{}") })))
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch events for review" })
    }
})

export default router
