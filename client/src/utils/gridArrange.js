/**
 * gridArrange.js
 *
 * Réarrangement automatique d'un canevas (Chaîne de production, PhenoHunt) sur un quadrillage
 * carré INVISIBLE — aucune grille n'est dessinée, seules les positions sont calées dessus.
 *
 * CE N'EST PAS UN SIMPLE REMPLISSAGE DE CASES. Une première version rangeait les éléments case
 * après case dans l'ordre où on les rencontrait : le résultat était propre géométriquement mais
 * illisible, les liaisons traversant tout le canevas en diagonale, et deux produits voisins dans
 * la grille pouvaient n'avoir aucun rapport entre eux. La disposition suit donc le SENS RÉEL du
 * graphe :
 *
 *   1. chaque élément reçoit un NIVEAU = son plus long chemin depuis une source (aucun lien
 *      entrant). Une liaison va donc toujours d'un niveau vers un niveau strictement plus grand :
 *      Fleur → Hash → Concentré se lit dans l'ordre de fabrication, jamais à rebours ;
 *   2. à l'intérieur d'un niveau, l'ordre est celui du BARYCENTRE des parents (heuristique de
 *      Sugiyama, quelques passes) — c'est ce qui évite les croisements, un enfant se plaçant en
 *      face de ses parents ;
 *   3. deux graphes sans aucun lien entre eux ne sont jamais entremêlés dans un même niveau : les
 *      composantes connexes restent en bandes séparées ;
 *   4. les bulles épinglées (satellites) sont posées juste après l'élément qu'elles documentent,
 *      DANS L'ORDRE DE LA TRAME du pipeline dont elles viennent (`sortKey` = type de pipeline +
 *      horodatage de la cellule) — « Culture Phase 2 » avant « Phase 3 » avant « Phase 6 », jamais
 *      dans l'ordre d'épinglage ;
 *   5. ce qui n'est relié à rien est rangé à part, en bloc compact après le graphe, séparé par une
 *      voie vide — rangé, mais sans jamais laisser croire à une continuité avec la chaîne.
 *
 * Ce module DÉPLACE, il ne relie pas : aucune liaison n'est créée, supprimée ni déduite. Une
 * proximité dans la grille n'est jamais interprétée comme un lien, et l'absence de lien entre deux
 * éléments n'en fabrique aucun.
 *
 * Volontairement sans dépendance à un store : les deux canevas React Flow de l'app l'utilisent,
 * avec pour seule différence l'orientation (chaîne = flux horizontal, généalogie = descendance
 * verticale).
 */

// Écart entre deux cases voisines. Assez large pour qu'une liaison et son cartouche
// (technique/date) tiennent entre deux produits sans les chevaucher.
export const GRID_GAP = 80;

// Plancher de côté de case — les nœuds produits/individus font 140px (cf. graphCanvas.css) ; une
// carte épinglée peut être plus large, d'où le `Math.max` sur les tailles réellement mesurées.
export const GRID_MIN_CELL = 140;

/** Comparateur d'ordre de trame : numérique quand les deux clés le sont, alphabétique sinon. */
function compareSortKeys(a, b) {
    if (a === b) return 0;
    if (a === undefined || a === null) return 1;
    if (b === undefined || b === null) return -1;
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return String(a).localeCompare(String(b), 'fr', { numeric: true });
}

/**
 * @param {Array<{id, width?, height?, position?, sortKey?}>} items
 * @param {Array<{source, target, kind?: 'flow'|'peer'|'satellite'}>} links
 *        - `flow` (défaut) : liaison orientée source → cible, c'est elle qui donne les niveaux ;
 *        - `peer` : lien non orienté entre pairs (fratrie, couple) — aligne les deux sur le même
 *          niveau sans imposer de sens ;
 *        - `satellite` : la cible est une bulle rattachée à la source, posée juste à côté d'elle.
 * @param {{gap?, minCell?, orientation?: 'horizontal'|'vertical'}} [options]
 * @returns {{positions: Map<string, {x, y}>, lanes: number, cellSize: number}}
 */
export function computeGridArrangement(items, links = [], options = {}) {
    const gap = options.gap ?? GRID_GAP;
    const minCell = options.minCell ?? GRID_MIN_CELL;
    const vertical = options.orientation === 'vertical';

    if (!Array.isArray(items) || items.length === 0) {
        return { positions: new Map(), lanes: 0, cellSize: 0 };
    }

    const byId = new Map(items.map(item => [item.id, item]));
    const originalIndex = new Map(items.map((item, i) => [item.id, i]));
    const valid = (l) => l && byId.has(l.source) && byId.has(l.target) && l.source !== l.target;
    const kindOf = (l) => l.kind || 'flow';

    const flowLinks = links.filter(l => valid(l) && kindOf(l) === 'flow');
    const peerLinks = links.filter(l => valid(l) && kindOf(l) === 'peer');
    const satelliteLinks = links.filter(l => valid(l) && kindOf(l) === 'satellite');

    // ── Satellites ──────────────────────────────────────────────────────────────────────────
    // Une bulle suit son ancre ; une bulle ancrée à une bulle remonte jusqu'à l'ancre réelle
    // (garde de profondeur : une chaîne circulaire de rattachements ne doit pas boucler ici).
    const directAnchor = new Map();
    for (const l of satelliteLinks) {
        if (!directAnchor.has(l.target)) directAnchor.set(l.target, l.source);
    }
    const rootAnchor = new Map();
    for (const [satellite] of directAnchor) {
        let current = satellite;
        const seen = new Set([satellite]);
        while (directAnchor.has(current)) {
            const next = directAnchor.get(current);
            if (seen.has(next)) break;
            seen.add(next);
            current = next;
        }
        if (current !== satellite) rootAnchor.set(satellite, current);
    }
    const isSatellite = (id) => rootAnchor.has(id);

    // ── Graphe principal (tout ce qui n'est pas une bulle rattachée) ────────────────────────
    const mains = items.filter(item => !isSatellite(item.id));
    const mainIds = new Set(mains.map(m => m.id));
    const parents = new Map(mains.map(m => [m.id, []]));
    const children = new Map(mains.map(m => [m.id, []]));
    for (const l of flowLinks) {
        if (!mainIds.has(l.source) || !mainIds.has(l.target)) continue;
        parents.get(l.target).push(l.source);
        children.get(l.source).push(l.target);
    }

    // Niveau = plus long chemin depuis une source. Le garde de pile coupe court sur un cycle
    // (le serveur les refuse, mais une donnée héritée ne doit pas figer le canevas).
    const level = new Map();
    const computeLevel = (id, stack) => {
        if (level.has(id)) return level.get(id);
        if (stack.has(id)) return 0;
        stack.add(id);
        let value = 0;
        for (const parent of parents.get(id) || []) {
            value = Math.max(value, computeLevel(parent, stack) + 1);
        }
        stack.delete(id);
        level.set(id, value);
        return value;
    };
    for (const m of mains) computeLevel(m.id, new Set());

    // Les liens de pairs (fratrie, couple) n'ont pas de sens de lecture : on aligne les deux
    // extrémités sur le niveau le plus avancé. On ne fait que MONTER un niveau, jamais descendre —
    // la propagation est donc monotone et s'arrête d'elle-même.
    for (let pass = 0; pass < 3; pass++) {
        let moved = false;
        for (const l of peerLinks) {
            if (!mainIds.has(l.source) || !mainIds.has(l.target)) continue;
            const target = Math.max(level.get(l.source) || 0, level.get(l.target) || 0);
            if ((level.get(l.source) || 0) !== target) { level.set(l.source, target); moved = true; }
            if ((level.get(l.target) || 0) !== target) { level.set(l.target, target); moved = true; }
        }
        if (!moved) break;
    }

    // ── Composantes connexes (tous liens confondus) ─────────────────────────────────────────
    // Deux sous-graphes sans aucun lien entre eux ne doivent jamais s'entremêler dans un même
    // niveau : la composante devient le critère de tri PRIMAIRE à l'intérieur d'un niveau.
    const parentOf = new Map(items.map(item => [item.id, item.id]));
    const find = (id) => {
        let root = id;
        while (parentOf.get(root) !== root) root = parentOf.get(root);
        let cursor = id;
        while (parentOf.get(cursor) !== cursor) {
            const next = parentOf.get(cursor);
            parentOf.set(cursor, root);
            cursor = next;
        }
        return root;
    };
    const union = (a, b) => {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parentOf.set(ra, rb);
    };
    for (const l of [...flowLinks, ...peerLinks, ...satelliteLinks]) union(l.source, l.target);

    const componentRank = new Map();
    for (const item of items) {
        const root = find(item.id);
        if (!componentRank.has(root)) componentRank.set(root, componentRank.size);
    }
    const componentSize = new Map();
    for (const item of items) {
        const root = find(item.id);
        componentSize.set(root, (componentSize.get(root) || 0) + 1);
    }

    // ── Isolés : aucun lien d'aucune sorte ──────────────────────────────────────────────────
    const isolated = mains.filter(m => componentSize.get(find(m.id)) === 1);
    const isolatedIds = new Set(isolated.map(m => m.id));
    const connected = mains.filter(m => !isolatedIds.has(m.id));

    // ── Ordre à l'intérieur de chaque niveau ────────────────────────────────────────────────
    const maxLevel = connected.reduce((max, m) => Math.max(max, level.get(m.id) || 0), -1);
    const lanes = [];
    for (let i = 0; i <= maxLevel; i++) lanes.push([]);
    for (const m of connected) lanes[level.get(m.id) || 0].push(m.id);

    const rowOf = new Map();
    const reindex = () => lanes.forEach(lane => lane.forEach((id, row) => rowOf.set(id, row)));
    lanes.forEach(lane => lane.sort((a, b) => {
        const byComponent = componentRank.get(find(a)) - componentRank.get(find(b));
        if (byComponent !== 0) return byComponent;
        return originalIndex.get(a) - originalIndex.get(b);
    }));
    reindex();

    // Barycentre : un élément se place en face de la moyenne de ses voisins du niveau précédent
    // (puis du suivant, en passe retour) — c'est ce qui redresse les liaisons en diagonale.
    const barycenter = (id, neighbourMap) => {
        const rows = (neighbourMap.get(id) || []).map(n => rowOf.get(n)).filter(r => r !== undefined);
        return rows.length > 0 ? rows.reduce((s, r) => s + r, 0) / rows.length : null;
    };
    for (let pass = 0; pass < 4; pass++) {
        const neighbourMap = pass % 2 === 0 ? parents : children;
        const order = pass % 2 === 0 ? lanes : [...lanes].reverse();
        for (const lane of order) {
            lane.sort((a, b) => {
                const byComponent = componentRank.get(find(a)) - componentRank.get(find(b));
                if (byComponent !== 0) return byComponent;
                const ba = barycenter(a, neighbourMap);
                const bb = barycenter(b, neighbourMap);
                const va = ba === null ? rowOf.get(a) : ba;
                const vb = bb === null ? rowOf.get(b) : bb;
                if (va !== vb) return va - vb;
                return originalIndex.get(a) - originalIndex.get(b);
            });
            lane.forEach((id, row) => rowOf.set(id, row));
        }
        reindex();
    }

    // ── Bulles rattachées : juste après leur ancre, dans l'ordre de la trame ─────────────────
    const satellitesByAnchor = new Map();
    for (const [satellite, anchor] of rootAnchor) {
        if (!satellitesByAnchor.has(anchor)) satellitesByAnchor.set(anchor, []);
        satellitesByAnchor.get(anchor).push(satellite);
    }
    for (const list of satellitesByAnchor.values()) {
        list.sort((a, b) => {
            const bySortKey = compareSortKeys(byId.get(a)?.sortKey, byId.get(b)?.sortKey);
            return bySortKey !== 0 ? bySortKey : originalIndex.get(a) - originalIndex.get(b);
        });
    }
    for (const lane of lanes) {
        for (let i = lane.length - 1; i >= 0; i--) {
            const attached = satellitesByAnchor.get(lane[i]);
            if (attached?.length) lane.splice(i + 1, 0, ...attached);
        }
    }

    // ── Isolés : bloc compact après une voie vide, jamais dans la continuité du graphe ───────
    const orphanSatellites = [...rootAnchor.keys()].filter(id => !mainIds.has(rootAnchor.get(id)));
    const loose = [...isolated.map(m => m.id), ...orphanSatellites].sort((a, b) => {
        const bySortKey = compareSortKeys(byId.get(a)?.sortKey, byId.get(b)?.sortKey);
        return bySortKey !== 0 ? bySortKey : originalIndex.get(a) - originalIndex.get(b);
    });
    if (loose.length > 0) {
        if (lanes.length > 0) lanes.push([]); // voie vide = séparation visible
        const perLane = Math.max(1, Math.ceil(Math.sqrt(loose.length)));
        for (let i = 0; i < loose.length; i += perLane) lanes.push(loose.slice(i, i + perLane));
    }

    // ── Coordonnées ─────────────────────────────────────────────────────────────────────────
    const cellSize = Math.max(
        minCell,
        ...items.map(item => Math.max(item.width || 0, item.height || 0))
    ) + gap;

    // Le quadrillage s'ancre sur le coin haut-gauche actuel de l'ensemble, calé sur la maille : le
    // graphe reste là où l'utilisateur l'avait amené au lieu de sauter à l'origine du canevas.
    const placed = items.filter(item => Number.isFinite(item.position?.x) && Number.isFinite(item.position?.y));
    const anchorX = placed.length > 0 ? Math.round(Math.min(...placed.map(i => i.position.x)) / cellSize) * cellSize : 0;
    const anchorY = placed.length > 0 ? Math.round(Math.min(...placed.map(i => i.position.y)) / cellSize) * cellSize : 0;

    const positions = new Map();
    lanes.forEach((lane, laneIndex) => {
        lane.forEach((id, rowIndex) => {
            const item = byId.get(id);
            if (!item) return;
            const width = item.width || minCell;
            const height = item.height || minCell;
            const col = vertical ? rowIndex : laneIndex;
            const row = vertical ? laneIndex : rowIndex;
            positions.set(id, {
                x: Math.round(anchorX + col * cellSize + (cellSize - width) / 2),
                y: Math.round(anchorY + row * cellSize + (cellSize - height) / 2)
            });
        });
    });

    return { positions, lanes: lanes.length, cellSize };
}

export default computeGridArrangement;
