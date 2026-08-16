/**
 * Vérification de l'action « Réarranger » du menu contextuel (clic droit sur le fond) des DEUX
 * canevas — Chaîne de production (flux horizontal) et PhenoHunt (descendance verticale).
 *
 * Ce qui est mesuré, et pourquoi :
 *  - un quadrillage régulier ne suffit PAS. La première version de cette sonde se contentait de
 *    vérifier des colonnes équidistantes : elle passait au vert sur une disposition pourtant
 *    illisible, où les liaisons traversaient le canevas en diagonale et où deux produits sans
 *    aucun rapport se retrouvaient côte à côte. On mesure donc le SENS : toute liaison réelle doit
 *    aller d'une colonne (resp. ligne) vers une strictement plus grande — l'amont avant l'aval, le
 *    parent avant l'enfant ;
 *  - les bulles épinglées doivent rester dans la voie de l'élément qu'elles documentent, et dans
 *    l'ordre de la TRAME du pipeline (horodatage de cellule), pas dans l'ordre d'épinglage ;
 *  - le nombre de liaisons doit être INCHANGÉ : réarranger déplace, ça ne relie jamais ;
 *  - ce qui n'est relié à rien doit être rangé APRÈS le graphe, pas intercalé dedans ;
 *  - la géométrie est relevée sur le DOM rendu (chaque élément est centré dans sa case, donc deux
 *    éléments de largeurs différentes n'ont pas le même x tout en étant sur la même colonne), et
 *    la persistance est revérifiée par rechargement de page.
 *
 * Usage : node tools/export-audit/rearrange-check.mjs [--url=…] [--api=…]
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, createFixture, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const expect = (label, ok, detail) => {
    console.log(`  ${ok ? '✔' : '✖'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
};

const post = (path, body) => fetch(`${API}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
}).then(r => r.json()).catch(() => null);
const put = (path, body) => fetch(`${API}${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
}).then(r => r.json()).catch(() => null);
const idOf = (r) => r?.id || r?.data?.id || null;

const { id: reviewId, chainId, treeId, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'nominal');
console.log('fixture', reviewId, '· chaîne', chainId || 'AUCUNE', '· arbre', treeId || 'AUCUN');
if (!chainId || !treeId) {
    console.error('✖ fixture sans chaîne ou sans arbre : la sonde ne mesurerait rien.');
    process.exit(1);
}

// ── Matière à réarranger, côté Chaîne ───────────────────────────────────────────────────────
// La fixture ne pose que 2 nœuds reliés (b → a). On prolonge en 3 niveaux (b → a → c) pour que le
// SENS soit vraiment mesurable, on ajoute 2 produits isolés, une bulle ancrée et une bulle libre,
// puis on disperse tout le monde à des coordonnées quelconques.
const extraReviewIds = [];
const chainBefore = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
const downstreamNodeId = (chainBefore.nodes || []).find(n => n.reviewId === reviewId)?.id;

const thirdReviewId = await createFixture(API, 'hash', 'minimal').catch(() => null);
if (thirdReviewId) {
    extraReviewIds.push(thirdReviewId);
    const third = await post(`/api/production-chains/chains/${chainId}/nodes`,
        { reviewType: 'hash', reviewId: thirdReviewId, position: { x: 900, y: 120 } });
    if (idOf(third) && downstreamNodeId) {
        await post(`/api/production-chains/chains/${chainId}/edges`,
            { sourceNodeId: downstreamNodeId, targetNodeId: idOf(third), technique: 'Pressage' });
    }
}
for (let i = 0; i < 2; i++) {
    const id = await createFixture(API, 'flower', 'minimal').catch(() => null);
    if (!id) continue;
    extraReviewIds.push(id);
    await post(`/api/production-chains/chains/${chainId}/nodes`,
        { reviewType: 'flower', reviewId: id, position: { x: 1200 + i * 37, y: 640 - i * 211 } });
}

// Deux bulles sur le MÊME produit, épinglées dans l'ordre INVERSE de leur trame : la plus tardive
// (phase-10) créée en premier. Après réarrangement, phase-2 doit passer devant.
//
// `cellTimestamp` est une CHAÎNE côté modèle (« id de la cellule sur la trame », ex. 'phase-1') —
// la première version de cette sonde envoyait des nombres, refusés en 400, et les deux bulles
// n'étaient donc jamais créées. Le couple phase-2 / phase-10 vérifie en prime que l'ordre est
// NUMÉRIQUE : un tri alphabétique brut mettrait phase-10 avant phase-2.
await post(`/api/production-chains/chains/${chainId}/annotations`, {
    title: 'ZZ-AUDIT trame phase-10', body: [{ label: 'Étape', value: 'phase-10' }],
    nodeId: downstreamNodeId, pipelineType: 'culture', cellTimestamp: 'phase-10', position: { x: -200, y: 700 }
});
await post(`/api/production-chains/chains/${chainId}/annotations`, {
    title: 'ZZ-AUDIT trame phase-2', body: [{ label: 'Étape', value: 'phase-2' }],
    nodeId: downstreamNodeId, pipelineType: 'culture', cellTimestamp: 'phase-2', position: { x: 500, y: -300 }
});
await post(`/api/production-chains/chains/${chainId}/annotations`,
    { title: 'ZZ-AUDIT bulle libre', body: [{ label: 'Contrôle', value: 'isolée' }], position: { x: -430, y: 917 } });

const scattered = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
for (const [i, n] of (scattered.nodes || []).entries()) {
    await put(`/api/production-chains/nodes/${n.id}`, { position: { x: -317 + i * 463, y: 811 - i * 289 } });
}

// ── Matière à réarranger, côté PhenoHunt ────────────────────────────────────────────────────
// L'arbre de fixture a 2 individus reliés (parent → enfant). On ajoute un individu isolé, puis on
// disperse — sans quoi un « réarrangement » qui ne ferait rien passerait.
const treeBefore = await (await fetch(`${API}/api/genetics/trees/${treeId}`)).json();
await post(`/api/genetics/trees/${treeId}/nodes`, { cultivarName: 'ZZ-AUDIT Isolé', position: { x: 30, y: 30 } });
for (const [i, n] of (treeBefore.nodes || []).entries()) {
    await put(`/api/genetics/nodes/${n.id}`, { position: { x: 640 - i * 397, y: -140 + i * 511 } });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));

/** Géométrie rendue de chaque nœud React Flow : coin, taille, centre — coordonnées du canevas. */
const readGeometry = () => page.evaluate(() => Array.from(document.querySelectorAll('.react-flow__node')).map(el => {
    const m = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(el.style.transform || '');
    const x = m ? parseFloat(m[1]) : NaN;
    const y = m ? parseFloat(m[2]) : NaN;
    return {
        id: el.getAttribute('data-id'),
        x, y, w: el.offsetWidth, h: el.offsetHeight,
        cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2
    };
}));

/** Regroupe des coordonnées voisines (arrondis de centrage) en axes distincts. */
function axes(values, tolerance = 3) {
    const sorted = [...values].sort((a, b) => a - b);
    const groups = [];
    for (const v of sorted) {
        const last = groups[groups.length - 1];
        if (last && Math.abs(v - last[last.length - 1]) <= tolerance) last.push(v);
        else groups.push([v]);
    }
    return groups.map(g => g.reduce((s, v) => s + v, 0) / g.length);
}
const spacings = (values) => values.slice(1).map((v, i) => v - values[i]);
const uniform = (list) => list.length === 0 || list.every(v => Math.abs(v - list[0]) <= 2);

/** Indice de case (colonne ou ligne) d'un centre, sur la maille déduite du pas minimal observé. */
const cellIndex = (center, origin, cell) => Math.round((center - origin) / cell);

/** Clique droit sur un point de FOND réellement libre (les coins portent contrôles et panneaux). */
async function rightClickPane() {
    const spot = await page.evaluate(() => {
        const pane = document.querySelector('.react-flow__pane');
        const r = pane.getBoundingClientRect();
        for (const fy of [0.9, 0.1, 0.5, 0.75, 0.25]) {
            for (const fx of [0.08, 0.92, 0.5, 0.3, 0.7]) {
                const x = r.x + r.width * fx, y = r.y + r.height * fy;
                if (document.elementFromPoint(x, y) === pane) return { x, y };
            }
        }
        return null;
    });
    if (!spot) throw new Error('aucun point de fond atteignable');
    await page.mouse.click(spot.x, spot.y, { button: 'right' });
    await page.waitForSelector('.context-menu', { timeout: 5000 });

    // Le menu doit tenir ENTIÈREMENT dans la fenêtre. Les menus du fond n'avaient aucun recalage
    // anti-débordement : ouverts près du bas, leurs dernières entrées tombaient hors écran et
    // n'étaient plus cliquables du tout — passé inaperçu tant qu'ils ne comptaient que 2 lignes.
    // Le recalage a lieu APRÈS le premier rendu (il faut mesurer le menu pour savoir s'il déborde) :
    // mesurer dès `waitForSelector` relève la position d'avant correction, et accuse à tort.
    await sleep(300);
    const box = await page.locator('.context-menu').first().boundingBox();
    const viewport = page.viewportSize();
    expect('menu contextuel entièrement dans la fenêtre',
        box && box.x >= 0 && box.y >= 0
        && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1,
        box ? `menu ${Math.round(box.x)},${Math.round(box.y)} ${Math.round(box.width)}×${Math.round(box.height)} dans ${viewport.width}×${viewport.height}` : 'menu introuvable');
    return spot;
}

try {
    // ══ Chaîne de production ════════════════════════════════════════════════════════════════
    console.log('\nChaîne de production (flux horizontal)');
    await page.goto(`${BASE}/library/production-chains/${chainId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(900);

    const initial = await readGeometry();
    expect('canevas monté : produits liés, produits isolés, bulles',
        initial.length >= 8, `${initial.length} éléments`);
    const initialAxes = axes(initial.map(g => g.cx));
    expect('état de départ réellement désordonné',
        initialAxes.length >= 4 && new Set(spacings(initialAxes).map(s => Math.round(s))).size > 1,
        `${initialAxes.length} axes x`);

    await rightClickPane();
    const item = page.locator('.context-menu-item', { hasText: 'Réarranger' });
    expect('entrée « Réarranger » présente', await item.count() > 0);
    if (await item.count() === 0) throw new Error('entrée de menu absente');
    await item.first().click();
    await sleep(2800);

    const after = await readGeometry();
    expect('aucun élément perdu', after.length === initial.length, `${initial.length} → ${after.length}`);

    const xs = axes(after.map(g => g.cx));
    const ys = axes(after.map(g => g.cy));
    const cell = Math.min(...spacings(xs).concat(spacings(ys)).filter(v => v > 1));
    const originX = Math.min(...xs);
    const originY = Math.min(...ys);
    expect('tout est calé sur une maille carrée unique',
        spacings(xs).every(d => Math.abs(d / cell - Math.round(d / cell)) < 0.05)
        && spacings(ys).every(d => Math.abs(d / cell - Math.round(d / cell)) < 0.05),
        `maille ${Math.round(cell)}px · ${xs.length} colonnes × ${ys.length} lignes`);

    const geo = new Map(after.map(g => [g.id, g]));
    const col = (id) => cellIndex(geo.get(id).cx, originX, cell);
    const row = (id) => cellIndex(geo.get(id).cy, originY, cell);

    const chainAfterApi = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
    const realEdges = (chainAfterApi.edges || []).filter(e => e.sourceNodeId && e.targetNodeId);
    const backwards = realEdges.filter(e => geo.has(e.sourceNodeId) && geo.has(e.targetNodeId)
        && col(e.sourceNodeId) >= col(e.targetNodeId));
    expect('toute liaison va de l\'amont vers l\'aval (colonne source < colonne cible)',
        realEdges.length >= 2 && backwards.length === 0,
        `${realEdges.length} liaison(s), ${backwards.length} à rebours`);

    // Aucune liaison créée par le réarrangement — il déplace, il ne relie pas.
    expect('nombre de liaisons inchangé',
        (chainAfterApi.edges || []).length === (scattered.edges || []).length,
        `${(scattered.edges || []).length} → ${(chainAfterApi.edges || []).length}`);

    // Bulles ancrées : même colonne que leur produit, et dans l'ordre de la trame.
    const annotations = chainAfterApi.annotations || [];
    const early = annotations.find(a => /phase-2/.test(a.title || ''));
    const late = annotations.find(a => /phase-10/.test(a.title || ''));
    expect('les bulles épinglées restent dans la voie de leur produit',
        early && late && col(early.id) === col(downstreamNodeId) && col(late.id) === col(downstreamNodeId),
        early && late
            ? `produit col ${col(downstreamNodeId)} · phase-2 col ${col(early.id)} · phase-10 col ${col(late.id)}`
            : 'bulles introuvables');
    expect('bulles rangées dans l\'ordre de la trame du pipeline (phase-2 avant phase-10)',
        early && late && row(early.id) < row(late.id),
        early && late ? `phase-2 ligne ${row(early.id)} · phase-10 ligne ${row(late.id)}` : '');

    // Isolés : rangés après le graphe, jamais intercalés dedans.
    const connectedIds = new Set(realEdges.flatMap(e => [e.sourceNodeId, e.targetNodeId]));
    const looseIds = (chainAfterApi.nodes || []).map(n => n.id).filter(id => !connectedIds.has(id));
    const maxConnectedCol = Math.max(...[...connectedIds].filter(id => geo.has(id)).map(col));
    expect('les produits isolés sont rangés après le graphe',
        looseIds.length >= 2 && looseIds.every(id => col(id) > maxConnectedCol),
        `graphe jusqu'à la colonne ${maxConnectedCol} · isolés en ${looseIds.map(col).join(',')}`);

    const cells = new Set(after.map(g => `${col(g.id)}|${row(g.id)}`));
    expect('une case par élément (aucun empilement)', cells.size === after.length,
        `${cells.size} cases pour ${after.length} éléments`);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(900);
    const reloaded = await readGeometry();
    const rmap = new Map(reloaded.map(g => [g.id, g]));
    const drift = after.reduce((max, g) => {
        const r = rmap.get(g.id);
        return Math.max(max, r ? Math.max(Math.abs(r.x - g.x), Math.abs(r.y - g.y)) : Infinity);
    }, 0);
    expect('disposition persistée (identique après rechargement)', drift <= 1, `écart max ${drift}px`);

    // ══ PhenoHunt ═══════════════════════════════════════════════════════════════════════════
    console.log('\nPhenoHunt (descendance verticale)');
    await page.goto(`${BASE}/phenohunt?tree=${treeId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(900);

    const treeInitial = await readGeometry();
    expect('arbre monté', treeInitial.length >= 3, `${treeInitial.length} éléments`);

    await rightClickPane();
    const treeItem = page.locator('.context-menu-item', { hasText: 'Réarranger' });
    expect('entrée « Réarranger » présente sur PhenoHunt', await treeItem.count() > 0);
    const pasteItem = page.locator('.context-menu-item', { hasText: 'presse-papiers' });
    expect('entrée « Créer une bulle depuis le presse-papiers » présente sur PhenoHunt',
        await pasteItem.count() > 0);
    if (await treeItem.count() === 0) throw new Error('entrée de menu absente sur PhenoHunt');
    await treeItem.first().click();
    await sleep(2500);

    const treeAfter = await readGeometry();
    expect('aucun individu perdu', treeAfter.length === treeInitial.length,
        `${treeInitial.length} → ${treeAfter.length}`);

    const tys = axes(treeAfter.map(g => g.cy));
    const txs = axes(treeAfter.map(g => g.cx));
    const tcell = Math.min(...spacings(txs).concat(spacings(tys)).filter(v => v > 1));
    const tOriginY = Math.min(...tys);
    const tgeo = new Map(treeAfter.map(g => [g.id, g]));
    const trow = (id) => cellIndex(tgeo.get(id).cy, tOriginY, tcell);

    const treeApi = await (await fetch(`${API}/api/genetics/trees/${treeId}`)).json();
    const filiations = (treeApi.edges || []).filter(e => e.parentNodeId && e.childNodeId
        && ['parent', 'pollen_donor', 'clone', 'mutation'].includes(e.relationshipType));
    const upwards = filiations.filter(e => tgeo.has(e.parentNodeId) && tgeo.has(e.childNodeId)
        && trow(e.parentNodeId) >= trow(e.childNodeId));
    expect('toute filiation descend (ligne du parent < ligne de l\'enfant)',
        filiations.length >= 1 && upwards.length === 0,
        `${filiations.length} filiation(s), ${upwards.length} à rebours`);
    expect('nombre de liaisons de l\'arbre inchangé',
        (treeApi.edges || []).length === (treeBefore.edges || []).length,
        `${(treeBefore.edges || []).length} → ${(treeApi.edges || []).length}`);

    const isolatedTreeNode = (treeApi.nodes || []).find(n => /Isolé/.test(n.cultivarName || ''));
    const linkedRows = filiations.flatMap(e => [trow(e.parentNodeId), trow(e.childNodeId)]);
    expect('l\'individu isolé est rangé après l\'arbre',
        isolatedTreeNode && tgeo.has(isolatedTreeNode.id) && trow(isolatedTreeNode.id) > Math.max(...linkedRows),
        isolatedTreeNode && tgeo.has(isolatedTreeNode.id)
            ? `arbre jusqu'à la ligne ${Math.max(...linkedRows)} · isolé ligne ${trow(isolatedTreeNode.id)}`
            : 'individu isolé introuvable');

    expect('aucune erreur JS', errs.length === 0, errs.join(' | '));
} finally {
    await browser.close();
    await deleteFixture(API, reviewId);
    if (upstreamId) await deleteFixture(API, upstreamId);
    for (const id of extraReviewIds) await deleteFixture(API, id);
}

console.log(failures === 0 ? '\n✔ tout vert' : `\n✖ ${failures} échec(s)`);
process.exit(failures === 0 ? 0 : 1);
