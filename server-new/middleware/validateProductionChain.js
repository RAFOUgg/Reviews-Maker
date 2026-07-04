/**
 * Middleware de validation pour les routes production-chains
 */

import { isValidReviewType } from '../utils/reviewTypeMap.js'

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
    const { position, color, reviewType, reviewId } = req.body

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
    const { sourceNodeId, targetNodeId, technique, notes } = req.body

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

    next()
}

const validateChainEdgeUpdate = (req, res, next) => {
    const { technique, notes } = req.body

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

    next()
}

export {
    validateChainCreation,
    validateChainUpdate,
    validateChainNodeCreation,
    validateChainNodeUpdate,
    validateChainEdgeCreation,
    validateChainEdgeUpdate
}
