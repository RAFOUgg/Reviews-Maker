/**
 * Vérification de l'action « Réarranger » du menu contextuel (clic droit sur le fond) du canevas
 * Chaîne de production : tous les éléments — LIÉS comme ISOLÉS, produits comme bulles épinglées —
 * doivent se retrouver sur un quadrillage carré invisible.
 *
 * Ce qui est mesuré, et pourquoi :
 *  - la géométrie est relevée sur le DOM RÉEL (translate + taille rendue de chaque nœud React
 *    Flow), pas sur les positions renvoyées par l'API : un élément est CENTRÉ dans sa case, donc
 *    deux éléments de largeurs différentes n'ont pas le même x alors qu'ils sont bien sur la même
 *    colonne. Comparer les positions brutes conclurait à tort au désalignement ;
 *  - la persistance est vérifiée séparément, par relecture de la chaîne via l'API PUIS rechargement
 *    de la page : un déplacement seulement optimiste reviendrait à sa place au retour de
 *    l'utilisateur (le défaut classique de ce canevas) ;
 *  - la fixture est volontairement DÉSORDONNÉE avant l'action (positions dispersées à des
 *    coordonnées non alignées) : sans ça, un « réarrangement » qui ne ferait rien passerait.
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

const { id: reviewId, chainId, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'nominal');
console.log('fixture', reviewId, '· chaîne', chainId || 'AUCUNE');
if (!chainId) {
    console.error('✖ fixture sans chaîne : la sonde ne mesurerait rien.');
    process.exit(1);
}

// La fixture ne pose que 2 nœuds RELIÉS. L'action porte justement aussi sur ce qui n'est relié à
// rien — on ajoute donc 2 produits isolés (vraies reviews, le serveur refuse toute autre référence)
// et une bulle flottante, puis on disperse tout le monde à des coordonnées quelconques.
const isolatedReviewIds = [];
for (let i = 0; i < 2; i++) {
    const id = await createFixture(API, 'flower', 'minimal').catch(() => null);
    if (!id) continue;
    isolatedReviewIds.push(id);
    await post(`/api/production-chains/chains/${chainId}/nodes`,
        { reviewType: 'flower', reviewId: id, position: { x: 1200 + i * 37, y: 640 - i * 211 } });
}
await post(`/api/production-chains/chains/${chainId}/annotations`,
    { title: 'ZZ-AUDIT bulle libre', body: [{ label: 'Contrôle', value: 'isolée' }], position: { x: -430, y: 917 } });

const before = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
for (const [i, n] of (before.nodes || []).entries()) {
    await put(`/api/production-chains/nodes/${n.id}`, { position: { x: -317 + i * 463, y: 811 - i * 289 } });
}
const linkedEdge = (before.edges || [])[0];
expect('fixture : une liaison réelle entre deux produits', !!linkedEdge, linkedEdge ? `${linkedEdge.sourceNodeId} → ${linkedEdge.targetNodeId}` : 'aucune');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));

// Géométrie RENDUE de chaque nœud React Flow : centre + taille, en coordonnées du canevas.
const readGeometry = () => page.evaluate(() => Array.from(document.querySelectorAll('.react-flow__node')).map(el => {
    const m = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(el.style.transform || '');
    const x = m ? parseFloat(m[1]) : NaN;
    const y = m ? parseFloat(m[2]) : NaN;
    return {
        id: el.getAttribute('data-id'),
        x, y,
        w: el.offsetWidth, h: el.offsetHeight,
        cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2
    };
}));

try {
    await page.goto(`${BASE}/library/production-chains/${chainId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(900);

    const initial = await readGeometry();
    expect('canevas monté avec produits liés, produits isolés et bulle',
        initial.length >= 5, `${initial.length} éléments`);

    const initialAxes = axes(initial.map(g => g.cx));
    expect('état de départ réellement désordonné',
        initialAxes.length >= 4 && new Set(spacings(initialAxes).map(s => Math.round(s))).size > 1,
        `${initialAxes.length} axes x, écarts ${spacings(initialAxes).map(s => Math.round(s)).join('/')}`);

    // Clic droit sur le FOND. Le point est CHERCHÉ, pas supposé : viser un coin à l'aveugle tombe
    // sur les contrôles de zoom (bas-gauche), la barre d'outils (haut) ou le panneau latéral —
    // premier essai de cette sonde, qui n'ouvrait donc aucun menu. On ne retient qu'un point où
    // `elementFromPoint` renvoie réellement le fond du canevas.
    const spot = await page.evaluate(() => {
        const pane = document.querySelector('.react-flow__pane');
        const r = pane.getBoundingClientRect();
        for (const fy of [0.9, 0.1, 0.5, 0.75, 0.25]) {
            for (const fx of [0.08, 0.92, 0.5, 0.3, 0.7]) {
                const x = r.x + r.width * fx;
                const y = r.y + r.height * fy;
                if (document.elementFromPoint(x, y) === pane) return { x, y };
            }
        }
        return null;
    });
    expect('un point de fond libre trouvé pour le clic droit', !!spot, spot && `${Math.round(spot.x)},${Math.round(spot.y)}`);
    if (!spot) throw new Error('aucun point de fond atteignable');
    await page.mouse.click(spot.x, spot.y, { button: 'right' });
    await page.waitForSelector('.context-menu', { timeout: 5000 });

    const item = page.locator('.context-menu-item', { hasText: 'Réarranger' });
    expect('entrée « Réarranger » présente au clic droit sur le fond', await item.count() > 0);
    if (await item.count() === 0) throw new Error('entrée de menu absente');

    await item.first().click();
    await sleep(2500);

    const after = await readGeometry();
    expect('tous les éléments toujours présents après réarrangement',
        after.length === initial.length, `${initial.length} → ${after.length}`);

    const xs = axes(after.map(g => g.cx));
    const ys = axes(after.map(g => g.cy));
    const dx = spacings(xs);
    const dy = spacings(ys);
    const uniform = (list) => list.length === 0 || list.every(v => Math.abs(v - list[0]) <= 2);

    expect('colonnes régulièrement espacées', dx.length > 0 && uniform(dx),
        `x: ${xs.map(v => Math.round(v)).join(', ')} (écarts ${dx.map(v => Math.round(v)).join('/')})`);
    expect('lignes régulièrement espacées', dy.length > 0 && uniform(dy),
        `y: ${ys.map(v => Math.round(v)).join(', ')} (écarts ${dy.map(v => Math.round(v)).join('/')})`);
    expect('maille carrée (même pas horizontal et vertical)',
        dx.length > 0 && dy.length > 0 && Math.abs(dx[0] - dy[0]) <= 2,
        `${Math.round(dx[0])} × ${Math.round(dy[0])}`);

    const columns = Math.max(1, Math.ceil(Math.sqrt(after.length)));
    expect('disposition carrée (autant de colonnes que la racine du nombre d\'éléments)',
        xs.length <= columns && ys.length <= Math.ceil(after.length / columns),
        `${xs.length} colonnes / ${ys.length} lignes pour ${after.length} éléments (attendu ≤ ${columns})`);

    // Une case par élément : deux éléments empilés au même endroit seraient un réarrangement raté.
    const cells = new Set(after.map(g => `${Math.round(g.cx / 10)}|${Math.round(g.cy / 10)}`));
    expect('aucun élément superposé à un autre', cells.size === after.length, `${cells.size} cases pour ${after.length} éléments`);

    // Les LIÉS restent voisins : source et cible d'une même liaison sur des cases contiguës.
    const src = after.find(g => g.id === linkedEdge?.sourceNodeId);
    const tgt = after.find(g => g.id === linkedEdge?.targetNodeId);
    const contiguous = src && tgt
        && ((Math.abs(src.cy - tgt.cy) <= 2 && Math.abs(Math.abs(src.cx - tgt.cx) - dx[0]) <= 2)
            || (Math.abs(src.cx - tgt.cx) <= 2 && Math.abs(Math.abs(src.cy - tgt.cy) - dy[0]) <= 2));
    expect('les deux produits liés restent sur des cases voisines', !!contiguous,
        src && tgt ? `Δx=${Math.round(src.cx - tgt.cx)} Δy=${Math.round(src.cy - tgt.cy)}` : 'nœuds introuvables');

    // Persistance serveur, puis retour réel de l'utilisateur sur la page.
    const persisted = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
    // `position` peut revenir en CHAÎNE JSON (colonne stockée telle quelle, cf. schema.prisma) —
    // la comparer sans la parser donnait un écart NaN, donc un faux échec.
    const parsePosition = (p) => {
        if (typeof p === 'string') { try { return JSON.parse(p); } catch { return null; } }
        return p;
    };
    const positionsById = new Map([
        ...(persisted.nodes || []).map(n => [n.id, parsePosition(n.position)]),
        ...(persisted.annotations || []).map(a => [a.id, parsePosition(a.position)])
    ]);
    const drift = after
        .map(g => {
            const p = positionsById.get(g.id);
            return p ? Math.max(Math.abs(p.x - g.x), Math.abs(p.y - g.y)) : Infinity;
        })
        .reduce((max, d) => Math.max(max, d), 0);
    expect('positions enregistrées côté serveur, identiques à l\'affichage', drift <= 1, `écart max ${drift}px`);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(900);
    const reloaded = await readGeometry();
    const rx = spacings(axes(reloaded.map(g => g.cx)));
    expect('quadrillage toujours en place après rechargement de la page',
        reloaded.length === after.length && rx.length > 0 && uniform(rx),
        `${reloaded.length} éléments, écarts ${rx.map(v => Math.round(v)).join('/')}`);

    expect('aucune erreur JS', errs.length === 0, errs.join(' | '));
} finally {
    await browser.close();
    await deleteFixture(API, reviewId);
    if (upstreamId) await deleteFixture(API, upstreamId);
    for (const id of isolatedReviewIds) await deleteFixture(API, id);
}

console.log(failures === 0 ? '\n✔ tout vert' : `\n✖ ${failures} échec(s)`);
process.exit(failures === 0 ? 0 : 1);
