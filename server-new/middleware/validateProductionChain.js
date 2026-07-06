/**
 * Middleware de validation pour les routes production-chains
 */

import { isValidReviewType } from '../utils/reviewTypeMap.js'

// Cellules de pipeline attachées à un nœud/liaison (cf. schema.prisma ChainNode/ChainEdge.cellData) —
// validation légère : structure attendue côté client, on ne fait que borner la taille pour éviter
// les abus (payload énorme) et vérifier que c'est bien un tableau d'objets sérialisables.
const MAX_ATTACHED_CELLS = 200
const MAX_CELL_DATA_BYTES = 300_000

const validateCellData = (cellData) => {
    if (cellData === undefined) return null
    if (!Array.isArray(cellData)) return "cellData must be an array"
    if (cellData.length > MAX_ATTACHED_CELLS) return `cellData cannot contain more than ${MAX_ATTACHED_CELLS} cells`
    if (cellData.some(c => typeof c !== "object" || c === null || Array.isArray(c))) {
        return "Each attached cell must be an object"
    }
    let serialized
    try {
        serialized = JSON.stringify(cellData)
    } catch {
        return "cellData is not serializable"
    }
    if (serialized.length > MAX_CELL_DATA_BYTES) {
        return "cellData payload is too large"
    }
    return null
}

// Photos/vidéos attachées (cf. schema.prisma ChainNode/ChainEdge.media) — le fichier lui-même est
// déjà uploadé via /api/media-upload avant cet appel, on ne reçoit ici que les métadonnées
// (url/type/caption), donc un payload nécessairement petit même avec plusieurs pièces jointes.
const MAX_MEDIA_ITEMS = 20
const MAX_MEDIA_BYTES = 50_000

const validateMedia = (media) => {
    if (media === undefined) return null
    if (!Array.isArray(media)) return "media must be an array"
    if (media.length > MAX_MEDIA_ITEMS) return `media cannot contain more than ${MAX_MEDIA_ITEMS} items`
    if (media.some(m => typeof m !== "object" || m === null || Array.isArray(m) || typeof m.url !== "string")) {
        return "Each media item must be an object with a url"
    }
    let serialized
    try {
        serialized = JSON.stringify(media)
    } catch {
        return "media is not serializable"
    }
    if (serialized.length > MAX_MEDIA_BYTES) {
        return "media payload is too large"
    }
    return null
}

const validateChainCreation = (req, res, next) => {
    const { name, description, isPublic } = req.body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Valid chain name is required" })
    }

    if (name.length > 200) {
        return res.status(400).json({ error: "Chain name must be less than 200 characters" })
    }

    if (description && (typeof description !== "string" || description.length > 1000)) {
        return res.status(400).json({ error: "Description must be less than 1000 characters" })
    }

    if (isPublic !== undefined && typeof isPublic !== "boolean") {
        return res.status(400).json({ error: "isPublic must be a boolean" })
    }

    next()
}

const validateChainUpdate = (req, res, next) => {
    const { name, description, isPublic } = req.body

    if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "Chain name must be a non-empty string" })
        }
        if (name.length > 200) {
            return res.status(400).json({ error: "Chain name must be less than 200 characters" })
        }
    }

    if (description !== undefined) {
        if (description && (typeof description !== "string" || description.length > 1000)) {
            return res.status(400).json({ error: "Description must be less than 1000 characters" })
        }
    }

    if (isPublic !== undefined && typeof isPublic !== "boolean") {
        return res.status(400).json({ error: "isPublic must be a boolean" })
    }

    next()
}

const validateChainNodeCreation = (req, res, next) => {
    const { reviewType, reviewId, position } = req.body

    if (!reviewType || !isValidReviewType(reviewType)) {
        return res.status(400).json({ error: "Valid reviewType is required (flower|hash|concentrate|edible)" })
    }

    if (!reviewId || typeof reviewId !== "string" || reviewId.trim().length === 0) {
        return res.status(400).json({ error: "Valid reviewId is required" })
    }

    if (position) {
        if (typeof position !== "object" || typeof position.x !== "number" || typeof position.y !== "number") {
            return res.status(400).json({ error: "Position must be {x: number, y: number}" })
        }
    }

    next()
}

const validateChainNodeUpdate = (req, res, next) => {
    const { position, color, reviewType, reviewId, cellData, media } = req.body

    if (position !== undefined) {
        if (position && (typeof position !== "object" || typeof position.x !== "number" || typeof position.y !== "number")) {
            return res.status(400).json({ error: "Position must be {x: number, y: number}" })
        }
    }

    if (color !== undefined) {
        if (color && (typeof color !== "string" || !/#[0-9A-F]{6}/i.test(color))) {
            return res.status(400).json({ error: "Color must be a valid hex color code" })
        }
    }

    const cellDataError = validateCellData(cellData)
    if (cellDataError) {
        return res.status(400).json({ error: cellDataError })
    }

    const mediaError = validateMedia(media)
    if (mediaError) {
        return res.status(400).json({ error: mediaError })
    }

    // reviewId peut être explicitement `null` (détacher un lien cassé) ou une nouvelle
    // référence (changer la review liée) — dans ce dernier cas reviewType doit accompagner
    // reviewId pour que la route puisse revalider le type contre REVIEW_TYPE_TO_DB.
    if (reviewId !== undefined && reviewId !== null) {
        if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
            return res.status(400).json({ error: "reviewId must be a non-empty string or null" })
        }
        if (!reviewType || !isValidReviewType(reviewType)) {
            return res.status(400).json({ error: "Valid reviewType is required when changing reviewId" })
        }
    }

    next()
}

const validateChainEdgeCreation = (req, res, next) => {
    const { sourceNodeId, targetNodeId, technique, notes, cellData, media } = req.body

    if (!sourceNodeId || typeof sourceNodeId !== "string" || sourceNodeId.trim().length === 0) {
        return res.status(400).json({ error: "Source node ID is required" })
    }

    if (!targetNodeId || typeof targetNodeId !== "string" || targetNodeId.trim().length === 0) {
        return res.status(400).json({ error: "Target node ID is required" })
    }

    if (sourceNodeId === targetNodeId) {
        return res.status(400).json({ error: "A node cannot be related to itself" })
    }

    if (technique && (typeof technique !== "string" || technique.length > 200)) {
        return res.status(400).json({ error: "Technique must be less than 200 characters" })
    }

    if (notes && (typeof notes !== "string" || notes.length > 500)) {
        return res.status(400).json({ error: "Notes must be less than 500 characters" })
    }

    const cellDataError = validateCellData(cellData)
    if (cellDataError) {
        return res.status(400).json({ error: cellDataError })
    }

    const mediaError = validateMedia(media)
    if (mediaError) {
        return res.status(400).json({ error: mediaError })
    }

    next()
}

// Contenu d'une carte épinglée (cf. schema.prisma ChainAnnotation.body) — même esprit que
// validateCellData : un tableau borné de {label, value}, pas de structure imposée au-delà.
const MAX_ANNOTATION_BODY_ITEMS = 50
const MAX_ANNOTATION_BODY_BYTES = 20_000

const validateAnnotationBody = (body) => {
    if (body === undefined) return null
    if (!Array.isArray(body)) return "body must be an array"
    if (body.length > MAX_ANNOTATION_BODY_ITEMS) return `body cannot contain more than ${MAX_ANNOTATION_BODY_ITEMS} lines`
    if (body.some(l => typeof l !== "object" || l === null || Array.isArray(l))) {
        return "Each body line must be an object"
    }
    let serialized
    try {
        serialized = JSON.stringify(body)
    } catch {
        return "body is not serializable"
    }
    if (serialized.length > MAX_ANNOTATION_BODY_BYTES) {
        return "body payload is too large"
    }
    return null
}

const validateChainAnnotationCreation = (req, res, next) => {
    const { position, title, body, sourceLabel } = req.body

    if (position) {
        if (typeof position !== "object" || typeof position.x !== "number" || typeof position.y !== "number") {
            return res.status(400).json({ error: "Position must be {x: number, y: number}" })
        }
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Valid title is required" })
    }
    if (title.length > 200) {
        return res.status(400).json({ error: "Title must be less than 200 characters" })
    }

    if (sourceLabel !== undefined && sourceLabel !== null) {
        if (typeof sourceLabel !== "string" || sourceLabel.length > 200) {
            return res.status(400).json({ error: "sourceLabel must be less than 200 characters" })
        }
    }

    const bodyError = validateAnnotationBody(body)
    if (bodyError) {
        return res.status(400).json({ error: bodyError })
    }

    next()
}

const validateChainAnnotationUpdate = (req, res, next) => {
    const { position, title, body, sourceLabel } = req.body

    if (position !== undefined) {
        if (typeof position !== "object" || typeof position.x !== "number" || typeof position.y !== "number") {
            return res.status(400).json({ error: "Position must be {x: number, y: number}" })
        }
    }

    if (title !== undefined) {
        if (typeof title !== "string" || title.trim().length === 0) {
            return res.status(400).json({ error: "Title must be a non-empty string" })
        }
        if (title.length > 200) {
            return res.status(400).json({ error: "Title must be less than 200 characters" })
        }
    }

    if (sourceLabel !== undefined && sourceLabel !== null) {
        if (typeof sourceLabel !== "string" || sourceLabel.length > 200) {
            return res.status(400).json({ error: "sourceLabel must be less than 200 characters" })
        }
    }

    const bodyError = validateAnnotationBody(body)
    if (bodyError) {
        return res.status(400).json({ error: bodyError })
    }

    next()
}

const validateChainEdgeUpdate = (req, res, next) => {
    const { technique, notes, cellData, media } = req.body

    if (technique !== undefined) {
        if (technique && (typeof technique !== "string" || technique.length > 200)) {
            return res.status(400).json({ error: "Technique must be less than 200 characters" })
        }
    }

    if (notes !== undefined) {
        if (notes && (typeof notes !== "string" || notes.length > 500)) {
            return res.status(400).json({ error: "Notes must be less than 500 characters" })
        }
    }

    const cellDataError = validateCellData(cellData)
    if (cellDataError) {
        return res.status(400).json({ error: cellDataError })
    }

    const mediaError = validateMedia(media)
    if (mediaError) {
        return res.status(400).json({ error: mediaError })
    }

    next()
}

export {
    validateChainCreation,
    validateChainUpdate,
    validateChainNodeCreation,
    validateChainNodeUpdate,
    validateChainEdgeCreation,
    validateChainEdgeUpdate,
    validateChainAnnotationCreation,
    validateChainAnnotationUpdate
}
