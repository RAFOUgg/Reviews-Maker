/**
 * Utilités pour intégrer le système Genetics aux Reviews
 * 
 * Ce module fournit des fonctions pour:
 * - Récupérer un arbre généalogique avec tous ses nœuds/arêtes
 * - Valider les références cultivars dans une review
 * - Exporter les données genetics au format JSON/SVG
 */

const prisma = require("../prisma");

/**
 * Récupère un arbre généalogique complet (tree + nodes + edges)
 * Vérifie les permissions de l'utilisateur
 */
async function getGeneticTreeWithAccess(treeId, userId) {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: treeId },
            include: {
                nodes: true,
                edges: true
            }
        });

        if (!tree) {
            return { error: "Tree not found", status: 404 };
        }

        // Vérifier l'accès (propriétaire ou public)
        if (!tree.isPublic && tree.userId !== userId) {
            return { error: "Forbidden", status: 403 };
        }

        return { data: tree };
    } catch (error) {
        console.error("Error fetching genetic tree:", error);
        return { error: "Failed to fetch tree", status: 500 };
    }
}

/**
 * Récupère les nœuds d'un arbre avec leurs cultivars associés
 */
async function getTreeNodesWithCultivars(treeId, userId) {
    try {
        const tree = await prisma.geneticTree.findUnique({
            where: { id: treeId },
            select: { userId: true, isPublic: true }
        });

        if (!tree) {
            return { error: "Tree not found", status: 404 };
        }

        // Vérifier l'accès
        if (!tree.isPublic && tree.userId !== userId) {
            return { error: "Forbidden", status: 403 };
        }

        const nodes = await prisma.genNode.findMany({
            where: { treeId },
            include: {
                cultivar: {
                    select: {
                        id: true,
                        name: true,
                        breeder: true,
                        type: true,
                        indicaRatio: true,
                        parentage: true,
                        phenotype: true
                    }
                }
            }
        });

        return { data: nodes };
    } catch (error) {
        console.error("Error fetching tree nodes:", error);
        return { error: "Failed to fetch nodes", status: 500 };
    }
}

/**
 * Valide qu'une référence cultivar existe
 */
async function validateCultivarReference(cultivarId, userId) {
    try {
        if (!cultivarId) return { valid: true }; // C'est optionnel

        const cultivar = await prisma.cultivar.findUnique({
            where: { id: cultivarId }
        });

        if (!cultivar) {
            return { valid: false, error: "Cultivar not found" };
        }

        if (cultivar.userId !== userId) {
            return { valid: false, error: "You don't have access to this cultivar" };
        }

        return { valid: true, data: cultivar };
    } catch (error) {
        console.error("Error validating cultivar:", error);
        return { valid: false, error: "Failed to validate cultivar" };
    }
}

/**
 * Récupère les données genetics formatées pour export
 * Retourne un objet compatible JSON/CSV
 */
async function formatGeneticsForExport(treeId, userId) {
    try {
        const result = await getGeneticTreeWithAccess(treeId, userId);

        if (result.error) {
            return result;
        }

        const tree = result.data;

        // Formatter les nœuds
        const formattedNodes = tree.nodes.map(node => ({
            id: node.id,
            cultivarName: node.cultivarName,
            cultivarId: node.cultivarId,
            position: JSON.parse(node.position),
            color: node.color,
            genetics: node.genetics ? JSON.parse(node.genetics) : null,
            notes: node.notes,
            createdAt: node.createdAt,
            updatedAt: node.updatedAt
        }));

        // Formatter les arêtes
        const formattedEdges = tree.edges.map(edge => ({
            id: edge.id,
            parentNodeId: edge.parentNodeId,
            childNodeId: edge.childNodeId,
            relationshipType: edge.relationshipType,
            notes: edge.notes
        }));

        return {
            data: {
                tree: {
                    id: tree.id,
                    name: tree.name,
                    description: tree.description,
                    projectType: tree.projectType,
                    isPublic: tree.isPublic,
                    createdAt: tree.createdAt,
                    updatedAt: tree.updatedAt
                },
                nodes: formattedNodes,
                edges: formattedEdges,
                stats: {
                    totalNodes: formattedNodes.length,
                    totalEdges: formattedEdges.length,
                    relationshipTypes: [...new Set(formattedEdges.map(e => e.relationshipType))]
                }
            }
        };
    } catch (error) {
        console.error("Error formatting genetics for export:", error);
        return { error: "Failed to format genetics data", status: 500 };
    }
}

/**
 * Crée un CSV à partir des données genetics
 */
function generateGeneticsCSV(treeData) {
    let csv = "Genetic Tree Export\n";
    csv += `Name: ${treeData.tree.name}\n`;
    csv += `Project Type: ${treeData.tree.projectType}\n`;
    csv += `Created: ${treeData.tree.createdAt}\n\n`;

    // Section Nodes
    csv += "=== CULTIVARS ===\n";
    csv += "ID,Name,Breeder,Type,Notes\n";
    treeData.nodes.forEach(node => {
        const genetics = node.genetics || {};
        csv += `"${node.id}","${node.cultivarName}","${genetics.breeder || ""}","${genetics.type || ""}","${node.notes || ""}"\n`;
    });

    // Section Edges
    csv += "\n=== RELATIONSHIPS ===\n";
    csv += "Parent,Child,Type,Notes\n";
    treeData.edges.forEach(edge => {
        const parent = treeData.nodes.find(n => n.id === edge.parentNodeId);
        const child = treeData.nodes.find(n => n.id === edge.childNodeId);
        csv += `"${parent?.cultivarName || ''}","${child?.cultivarName || ''}","${edge.relationshipType}","${edge.notes || ""}"\n`;
    });

    return csv;
}

/**
 * Récupère les statistiques genetics pour le dashboard utilisateur
 */
async function getUserGeneticsStats(userId) {
    try {
        const stats = await prisma.geneticTree.findMany({
            where: { userId },
            select: {
                id: true,
                projectType: true,
                isPublic: true,
                _count: {
                    select: { nodes: true, edges: true }
                }
            }
        });

        const totalTrees = stats.length;
        const totalNodes = stats.reduce((sum, tree) => sum + tree._count.nodes, 0);
        const totalEdges = stats.reduce((sum, tree) => sum + tree._count.edges, 0);
        const publicTrees = stats.filter(t => t.isPublic).length;
        const projectTypeBreakdown = {};

        stats.forEach(tree => {
            projectTypeBreakdown[tree.projectType] = (projectTypeBreakdown[tree.projectType] || 0) + 1;
        });

        return {
            data: {
                totalTrees,
                totalNodes,
                totalEdges,
                publicTrees,
                privateTrees: totalTrees - publicTrees,
                projectTypeBreakdown,
                averageNodesPerTree: totalTrees > 0 ? (totalNodes / totalTrees).toFixed(1) : 0
            }
        };
    } catch (error) {
        console.error("Error fetching genetics stats:", error);
        return { error: "Failed to fetch statistics", status: 500 };
    }
}

module.exports = {
    getGeneticTreeWithAccess,
    getTreeNodesWithCultivars,
    validateCultivarReference,
    formatGeneticsForExport,
    generateGeneticsCSV,
    getUserGeneticsStats
};
