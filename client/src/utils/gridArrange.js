/**
 * gridArrange.js
 *
 * Disposition automatique de tous les éléments d'un canevas sur un quadrillage carré INVISIBLE
 * (aucune grille n'est dessinée : seules les positions sont alignées dessus).
 *
 * Règles, dans l'ordre :
 *  - les éléments LIÉS restent groupés — un groupe connexe est parcouru en largeur depuis une
 *    de ses sources (aucun lien entrant), donc une chaîne de production se lit dans son sens de
 *    fabrication le long des cases ;
 *  - les groupes les plus gros passent en premier, les éléments ISOLÉS (aucun lien) ferment la
 *    marche — ils sont donc rangés eux aussi, jamais laissés là où ils traînaient ;
 *  - la case du quadrillage est CARRÉE et unique pour tout le monde (le plus grand élément +
 *    l'écart), et chaque élément est centré dans la sienne : deux éléments de tailles
 *    différentes restent alignés sur les mêmes axes.
 *
 * Le calcul est volontairement séparé de tout store/canevas : il ne connaît que des ids, des
 * tailles et des liens, et peut donc servir aux deux canevas React Flow de l'app (Chaîne de
 * production, PhenoHunt) sans en dupliquer la logique.
 */

// Écart entre deux cases voisines. Assez large pour qu'une liaison et son cartouche
// (technique/date) tiennent entre deux produits sans les chevaucher.
export const GRID_GAP = 80;

// Plancher de côté de case — les nœuds produits font 140px (cf. graphCanvas.css) ; une carte
// épinglée peut être plus haute, d'où le `Math.max` sur les tailles réelles mesurées.
export const GRID_MIN_CELL = 140;

/**
 * @param {Array<{id: string, width?: number, height?: number, position?: {x: number, y: number}}>} items
 * @param {Array<{source: string, target: string, directed?: boolean}>} links
 * @param {{gap?: number, minCell?: number}} [options]
 * @returns {{positions: Map<string, {x: number, y: number}>, columns: number, cellSize: number}}
 */
export function computeGridArrangement(items, links = [], options = {}) {
    const gap = options.gap ?? GRID_GAP;
    const minCell = options.minCell ?? GRID_MIN_CELL;

    if (!Array.isArray(items) || items.length === 0) {
        return { positions: new Map(), columns: 0, cellSize: 0 };
    }

    const originalIndex = new Map(items.map((item, i) => [item.id, i]));
    const adjacency = new Map(items.map(item => [item.id, []]));
    const incoming = new Map(items.map(item => [item.id, 0]));

    for (const link of links) {
        if (!link || !adjacency.has(link.source) || !adjacency.has(link.target)) continue;
        adjacency.get(link.source).push(link.target);
        adjacency.get(link.target).push(link.source);
        // Un lien non orienté (rattachement d'une bulle à son élément) ne désigne pas une source.
        if (link.directed !== false) incoming.set(link.target, incoming.get(link.target) + 1);
    }

    // Ordre d'amorçage : d'abord ce qui n'a aucun lien entrant (les débuts de chaîne), puis
    // l'ordre d'origine — un même graphe redonne donc toujours la même disposition.
    const seeds = [...items].sort((a, b) => {
        const byIncoming = (incoming.get(a.id) || 0) - (incoming.get(b.id) || 0);
        return byIncoming !== 0 ? byIncoming : originalIndex.get(a.id) - originalIndex.get(b.id);
    });

    const visited = new Set();
    const groups = [];
    for (const seed of seeds) {
        if (visited.has(seed.id)) continue;
        const ordered = [];
        const queue = [seed.id];
        visited.add(seed.id);
        while (queue.length > 0) {
            const id = queue.shift();
            ordered.push(id);
            const neighbours = [...adjacency.get(id)].sort((a, b) => originalIndex.get(a) - originalIndex.get(b));
            for (const neighbour of neighbours) {
                if (visited.has(neighbour)) continue;
                visited.add(neighbour);
                queue.push(neighbour);
            }
        }
        groups.push(ordered);
    }

    // Tri stable : à taille égale l'ordre de découverte est conservé, et les éléments isolés
    // (groupes de 1) se retrouvent naturellement en fin de quadrillage.
    groups.sort((a, b) => b.length - a.length);
    const order = groups.flat();

    const cellSize = Math.max(
        minCell,
        ...items.map(item => Math.max(item.width || 0, item.height || 0))
    ) + gap;
    const columns = Math.max(1, Math.ceil(Math.sqrt(order.length)));

    // Le quadrillage est ancré sur le coin haut-gauche actuel de l'ensemble, calé sur la maille :
    // le graphe reste là où l'utilisateur l'avait amené au lieu de sauter à l'origine du canevas.
    const known = items.filter(item => Number.isFinite(item.position?.x) && Number.isFinite(item.position?.y));
    const anchorX = known.length > 0 ? Math.round(Math.min(...known.map(i => i.position.x)) / cellSize) * cellSize : 0;
    const anchorY = known.length > 0 ? Math.round(Math.min(...known.map(i => i.position.y)) / cellSize) * cellSize : 0;

    const byId = new Map(items.map(item => [item.id, item]));
    const positions = new Map();
    order.forEach((id, slot) => {
        const item = byId.get(id);
        const width = item.width || minCell;
        const height = item.height || minCell;
        const col = slot % columns;
        const row = Math.floor(slot / columns);
        positions.set(id, {
            x: Math.round(anchorX + col * cellSize + (cellSize - width) / 2),
            y: Math.round(anchorY + row * cellSize + (cellSize - height) / 2)
        });
    });

    return { positions, columns, cellSize };
}

export default computeGridArrangement;
