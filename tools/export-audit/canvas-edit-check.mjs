/**
 * Vérification AU CLIC du canevas de graphe en ÉDITION (règle 4 du C11 : build vert et tests verts
 * ne prouvent pas qu'un graphe s'édite encore).
 *
 * `GraphCanvasShell.jsx` est partagé par l'éditeur (PhenoHunt, Chaîne de production) et par les
 * rendus figés (`ReadOnly*Canvas` dans les fiches). Toute correction faite pour le RENDU doit
 * laisser l'ÉDITION intacte — et c'est la seule façon de le savoir. `edit-check.mjs` couvre la
 * grille de pipeline ; rien ne couvrait les canevas eux-mêmes.
 *
 * Ce que la sonde exige :
 *   1. le canevas d'édition monte des nœuds ;
 *   2. il conserve ses outils d'édition (contrôles de zoom, minimap) — c'est la preuve que le
 *      chemin `readOnly === false` est bien celui emprunté ;
 *   3. il ne porte PAS la classe `graph-canvas-readonly`, qui relâche la mise en page des nœuds
 *      pour le rendu figé (libellés sur plusieurs lignes, hauteur de carte libre) ;
 *   4. un nœud se déplace toujours à la souris.
 *
 * Les deux routes ont besoin d'un graphe RÉEL pour monter quoi que ce soit : `/phenohunt` charge
 * l'arbre passé en `?tree=`, et l'éditeur de chaîne vit sous `/library/production-chains/:id`.
 * Sans ces identifiants, la page s'affiche mais aucun canevas n'existe — et une vérification qui
 * ne trouve pas de canevas ne prouve RIEN. C'est pourquoi l'absence de canevas est ici un ÉCHEC et
 * non un cas ignoré : une sonde qui rend « tout va bien » sans avoir rien mesuré est le piège que
 * la règle 2 du C11 décrit (première version de ce script : « ✔ édition intacte » sur zéro canevas).
 *
 * Usage : node tools/export-audit/canvas-edit-check.mjs [--url=…]
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { id: reviewId, chainId, treeId, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense');
console.log('fixture', reviewId, '· chaîne', chainId || 'AUCUNE', '· arbre', treeId || 'AUCUN');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));

let failures = 0;
const expect = (label, ok, detail) => {
    console.log(`  ${ok ? '✔' : '✖'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
};

try {
    const routes = [
        ['PhenoHunt', treeId && `/phenohunt?tree=${treeId}`],
        ['Chaîne de production', chainId && `/library/production-chains/${chainId}`],
    ].filter(([, p]) => p);

    for (const [name, path] of routes) {
        console.log(`\n▶ ${name} — ${path}`);
        await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' }).catch(() => {});
        await sleep(5000);

        const shells = await page.locator('.graph-canvas-shell').count();
        // Échec, jamais « ignoré » : cf. l'en-tête de ce fichier.
        expect('canevas d’édition monté', shells > 0, `${shells} shell(s)`);
        if (!shells) continue;

        const state = await page.evaluate(() => {
            const shell = document.querySelector('.graph-canvas-shell');
            return {
                readonlyClass: shell.classList.contains('graph-canvas-readonly'),
                nodes: document.querySelectorAll('.react-flow__node').length,
                controls: document.querySelectorAll('.react-flow__controls').length,
                minimap: document.querySelectorAll('.react-flow__minimap').length,
                labelEllipsis: (() => {
                    const l = document.querySelector('.node-label');
                    return l ? getComputedStyle(l).textOverflow : null;
                })(),
            };
        });

        expect('nœuds montés', state.nodes > 0, `${state.nodes} nœud(s)`);
        expect('outils d’édition conservés (chemin readOnly=false)',
            state.controls > 0 && state.minimap > 0,
            `contrôles ${state.controls} · minimap ${state.minimap}`);
        expect('pas de relâchement « lecture seule » en édition',
            state.readonlyClass === false, `classe graph-canvas-readonly : ${state.readonlyClass}`);
        expect('libellé de nœud toujours ellipsé en édition',
            state.labelEllipsis === null || state.labelEllipsis === 'ellipsis',
            `text-overflow : ${state.labelEllipsis}`);

        if (state.nodes > 0) {
            const node = page.locator('.react-flow__node').first();
            const before = await node.boundingBox();
            await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
            await page.mouse.down();
            await page.mouse.move(before.x + before.width / 2 + 90, before.y + before.height / 2 + 60, { steps: 12 });
            await page.mouse.up();
            await sleep(1200);
            const after = await node.boundingBox();
            const moved = Math.hypot(after.x - before.x, after.y - before.y);
            expect('nœud déplaçable à la souris', moved > 20, `déplacement ${Math.round(moved)}px`);
        }
    }
    if (routes.length < 2) {
        console.log('\n✖ une des deux surfaces d’édition n’a pas pu être exercée (fixture incomplète)');
        failures++;
    }
    console.log('\nerreurs JS :', errs.length ? errs : 'aucune');
} finally {
    await browser.close();
    await deleteFixture(API, reviewId);
    if (upstreamId) await deleteFixture(API, upstreamId);
}
console.log(failures ? `\n✖ ${failures} vérification(s) en échec` : '\n✔ édition intacte');
process.exit(failures ? 1 : 0);
