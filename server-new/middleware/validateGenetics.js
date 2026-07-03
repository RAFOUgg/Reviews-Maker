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

// "backcross" est volontairement absent : c'est une stratégie de génération (déjà capturée par
// GenNode.genetics.generation = BX1/BX2/BX3), pas une technique physique de pollinisation.
const VALID_POLLINATION_METHODS = [
    "open", "controlled-manual", "isolation-selected-male", "pollination-bag",
    "brush", "pollen-collection-storage", "male-flower-harvest",
    "selfing-inversion", "chemical-feminization"
];

const validateEdgeCreation = (req, res, next) => {
    const { parentNodeId, childNodeId, relationshipType, pollinationMethod, notes } = req.body;

    // Validation des IDs
    if (!parentNodeId || typeof parentNodeId !== "string" || parentNodeId.trim().length === 0) {
        return res.status(400).json({ error: "Parent node ID is required" });
    }

    if (!childNodeId || typeof childNodeId !== "string" || childNodeId.trim().length === 0) {
        return res.status(400).json({ error: "Child node ID is required" });
    }

    if (parentNodeId === childNodeId) {
        return res.status(400).json({ error: "A node cannot be related to itself" });
    }

    // Validation relationshipType (optionnel)
    const validTypes = ["parent", "pollen_donor", "sibling", "clone", "mutation", "pairing"];
    if (relationshipType && !validTypes.includes(relationshipType)) {
        return res.status(400).json({ error: `Invalid relationship type. Must be one of: ${validTypes.join(", ")}` });
    }

    // Validation pollinationMethod (optionnel)
    if (pollinationMethod && !VALID_POLLINATION_METHODS.includes(pollinationMethod)) {
        return res.status(400).json({ error: `Invalid pollination method. Must be one of: ${VALID_POLLINATION_METHODS.join(", ")}` });
    }

    // Validation notes (optionnel)
    if (notes && (typeof notes !== "string" || notes.length > 500)) {
        return res.status(400).json({ error: "Notes must be less than 500 characters" });
    }

    next();
};

const validateEdgeUpdate = (req, res, next) => {
    const { relationshipType, pollinationMethod, notes, parentNodeId, childNodeId } = req.body;

    // Validation relationshipType (optionnel)
    if (relationshipType !== undefined) {
        const validTypes = ["parent", "pollen_donor", "sibling", "clone", "mutation", "pairing"];
        if (!validTypes.includes(relationshipType)) {
            return res.status(400).json({ error: `Invalid relationship type. Must be one of: ${validTypes.join(", ")}` });
        }
    }

    // Validation parentNodeId/childNodeId (optionnel — reconnexion d'une extrémité vers un autre
    // nœud, ex: inverser une relation ou glisser une extrémité sur un nœud différent)
    if (parentNodeId !== undefined && (typeof parentNodeId !== "string" || parentNodeId.trim().length === 0)) {
        return res.status(400).json({ error: "parentNodeId must be a non-empty string" });
    }
    if (childNodeId !== undefined && (typeof childNodeId !== "string" || childNodeId.trim().length === 0)) {
        return res.status(400).json({ error: "childNodeId must be a non-empty string" });
    }
    if (parentNodeId !== undefined && childNodeId !== undefined && parentNodeId === childNodeId) {
        return res.status(400).json({ error: "parentNodeId and childNodeId must be different" });
    }

    // Validation pollinationMethod (optionnel)
    if (pollinationMethod && !VALID_POLLINATION_METHODS.includes(pollinationMethod)) {
        return res.status(400).json({ error: `Invalid pollination method. Must be one of: ${VALID_POLLINATION_METHODS.join(", ")}` });
    }

    // Validation notes (optionnel)
    if (notes !== undefined) {
        if (notes && (typeof notes !== "string" || notes.length > 500)) {
            return res.status(400).json({ error: "Notes must be less than 500 characters" });
        }
    }

    // Validation waypointX/waypointY (optionnel) — null autorisé (réinitialise la courbure)
    const { waypointX, waypointY } = req.body;
    if (waypointX !== undefined && waypointX !== null && typeof waypointX !== "number") {
        return res.status(400).json({ error: "waypointX must be a number or null" });
    }
    if (waypointY !== undefined && waypointY !== null && typeof waypointY !== "number") {
        return res.status(400).json({ error: "waypointY must be a number or null" });
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

export {
    validateTreeCreation,
    validateTreeUpdate,
    validateNodeCreation,
    validateNodeUpdate,
    validateEdgeCreation,
    validateEdgeUpdate
};
