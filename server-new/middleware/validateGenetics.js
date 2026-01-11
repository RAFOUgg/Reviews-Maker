/**
 * Middleware de validation pour les routes genetics
 */

const validateTreeCreation = (req, res, next) => {
    const { name, description, projectType, isPublic } = req.body;

    // Validation du nom
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Valid tree name is required" });
    }

    if (name.length > 200) {
        return res.status(400).json({ error: "Tree name must be less than 200 characters" });
    }

    // Validation description (optionnel)
    if (description && (typeof description !== "string" || description.length > 1000)) {
        return res.status(400).json({ error: "Description must be less than 1000 characters" });
    }

    // Validation projectType
    const validTypes = ["phenohunt", "selection", "crossing", "hunt"];
    if (projectType && !validTypes.includes(projectType)) {
        return res.status(400).json({ error: `Invalid project type. Must be one of: ${validTypes.join(", ")}` });
    }

    // Validation isPublic
    if (isPublic !== undefined && typeof isPublic !== "boolean") {
        return res.status(400).json({ error: "isPublic must be a boolean" });
    }

    next();
};

const validateNodeCreation = (req, res, next) => {
    const { cultivarName, position, color, genetics, notes } = req.body;

    // Validation du nom
    if (!cultivarName || typeof cultivarName !== "string" || cultivarName.trim().length === 0) {
        return res.status(400).json({ error: "Valid cultivar name is required" });
    }

    if (cultivarName.length > 200) {
        return res.status(400).json({ error: "Cultivar name must be less than 200 characters" });
    }

    // Validation position (optionnel)
    if (position) {
        if (typeof position !== "object" || typeof position.x !== "number" || typeof position.y !== "number") {
            return res.status(400).json({ error: "Position must be {x: number, y: number}" });
        }
    }

    // Validation color (optionnel)
    if (color && (typeof color !== "string" || !/#[0-9A-F]{6}/.test(color.toUpperCase()))) {
        return res.status(400).json({ error: "Color must be a valid hex color code (e.g., #FF6B9D)" });
    }

    // Validation genetics JSON (optionnel)
    if (genetics && typeof genetics !== "object") {
        return res.status(400).json({ error: "Genetics must be a valid object" });
    }

    // Validation notes (optionnel)
    if (notes && (typeof notes !== "string" || notes.length > 500)) {
        return res.status(400).json({ error: "Notes must be less than 500 characters" });
    }

    next();
};

const validateEdgeCreation = (req, res, next) => {
    const { parentNodeId, childNodeId, relationshipType, notes } = req.body;

    // Validation des IDs
    if (!parentNodeId || typeof parentNodeId !== "string" || parentNodeId.trim().length === 0) {
        return res.status(400).json({ error: "Parent node ID is required" });
    }

    if (!childNodeId || typeof childNodeId !== "string" || childNodeId.trim().length === 0) {
        return res.status(400).json({ error: "Child node ID is required" });
    }

    // Validation relationshipType (optionnel)
    const validTypes = ["parent", "pollen_donor", "sibling", "clone", "mutation"];
    if (relationshipType && !validTypes.includes(relationshipType)) {
        return res.status(400).json({ error: `Invalid relationship type. Must be one of: ${validTypes.join(", ")}` });
    }

    // Validation notes (optionnel)
    if (notes && (typeof notes !== "string" || notes.length > 500)) {
        return res.status(400).json({ error: "Notes must be less than 500 characters" });
    }

    next();
};

const validateTreeUpdate = (req, res, next) => {
    const { name, description, projectType, isPublic, sharedWith } = req.body;

    // Validation du nom (optionnel lors update)
    if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "Tree name must be a non-empty string" });
        }
        if (name.length > 200) {
            return res.status(400).json({ error: "Tree name must be less than 200 characters" });
        }
    }

    // Validation description
    if (description !== undefined) {
        if (description && (typeof description !== "string" || description.length > 1000)) {
            return res.status(400).json({ error: "Description must be less than 1000 characters" });
        }
    }

    // Validation projectType
    if (projectType !== undefined) {
        const validTypes = ["phenohunt", "selection", "crossing", "hunt"];
        if (!validTypes.includes(projectType)) {
            return res.status(400).json({ error: `Invalid project type. Must be one of: ${validTypes.join(", ")}` });
        }
    }

    // Validation isPublic
    if (isPublic !== undefined && typeof isPublic !== "boolean") {
        return res.status(400).json({ error: "isPublic must be a boolean" });
    }

    // Validation sharedWith
    if (sharedWith !== undefined) {
        if (sharedWith && (!Array.isArray(sharedWith) || sharedWith.some(id => typeof id !== "string"))) {
            return res.status(400).json({ error: "sharedWith must be an array of user IDs" });
        }
    }

    next();
};

const validateNodeUpdate = (req, res, next) => {
    const { cultivarName, position, color, genetics, notes } = req.body;

    // Validation cultivarName (optionnel)
    if (cultivarName !== undefined) {
        if (typeof cultivarName !== "string" || cultivarName.trim().length === 0) {
            return res.status(400).json({ error: "Cultivar name must be a non-empty string" });
        }
        if (cultivarName.length > 200) {
            return res.status(400).json({ error: "Cultivar name must be less than 200 characters" });
        }
    }

    // Validation position
    if (position !== undefined) {
        if (position && (typeof position !== "object" || typeof position.x !== "number" || typeof position.y !== "number")) {
            return res.status(400).json({ error: "Position must be {x: number, y: number}" });
        }
    }

    // Validation color
    if (color !== undefined) {
        if (color && (typeof color !== "string" || !/#[0-9A-F]{6}/.test(color.toUpperCase()))) {
            return res.status(400).json({ error: "Color must be a valid hex color code (e.g., #FF6B9D)" });
        }
    }

    // Validation genetics
    if (genetics !== undefined) {
        if (genetics && typeof genetics !== "object") {
            return res.status(400).json({ error: "Genetics must be a valid object or null" });
        }
    }

    // Validation notes
    if (notes !== undefined) {
        if (notes && (typeof notes !== "string" || notes.length > 500)) {
            return res.status(400).json({ error: "Notes must be less than 500 characters" });
        }
    }

    next();
};

module.exports = {
    validateTreeCreation,
    validateTreeUpdate,
    validateNodeCreation,
    validateNodeUpdate,
    validateEdgeCreation
};
