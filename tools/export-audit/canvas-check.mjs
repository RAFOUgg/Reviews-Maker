/**
 * Les canevas (chaîne de production / généalogie) se rendent-ils VRAIMENT dans une fiche ?
 *
 * Les fixtures leur attachent bien une chaîne et un arbre depuis le 2026-08-06, mais les modules
 * correspondants mesurent 16-20px dans les exports — c'est-à-dire à peu près rien. Tant que ce
 * point n'est pas tranché, toute règle d'audit portant sur les canevas est aveugle (règle 2 du
 * C11 : une mesure inchangée ne prouve rien si le jeu de test ne contient pas la donnée).
 *
 * Usage : node tools/export-audit/canvas-check.mjs --url=… [--type=flower]
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
const type = args.type || 'flower';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const attached = await createFixtureWithCanvases(API, type, 'dense');
const id = attached.id;
console.log('fixture', id, '· chaîne', attached.chainId ? 'oui' : 'NON', '· arbre', attached.treeId ? 'oui' : 'NON');

// L'API répond-elle pour cette review ?
const chains = await fetch(`${API}/api/production-chains/for-review/${type}/${id}`).then((r) => r.json()).catch(() => null);
console.log('API for-review →', Array.isArray(chains) ? `${chains.length} chaîne(s)` : JSON.stringify(chains).slice(0, 120));
if (Array.isArray(chains) && chains[0]) {
    const full = await fetch(`${API}/api/production-chains/chains/${chains[0].id}`).then((r) => r.json()).catch(() => null);
    console.log('   nœuds:', full?.nodes?.length, '· arêtes:', full?.edges?.length);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 140)));
try {
    await page.goto(`${BASE}/r/${id}`, { waitUntil: 'networkidle' });
    await sleep(6000);
    const probe = await page.evaluate(() => ({
        modules: [...document.querySelectorAll('[data-module]')]
            .filter((m) => /Canvas|canvas/.test(m.getAttribute('data-module')))
            .map((m) => ({ id: m.getAttribute('data-module'), h: Math.round(m.getBoundingClientRect().height) })),
        reactFlowPanes: document.querySelectorAll('.react-flow').length,
        rfNodes: document.querySelectorAll('.react-flow__node').length,
        minimaps: document.querySelectorAll('.react-flow__minimap').length,
        controls: document.querySelectorAll('.react-flow__controls').length,
        attribution: document.querySelectorAll('.react-flow__attribution').length,
    }));
    console.log('SUR /r/:id →', JSON.stringify(probe, null, 1));
    console.log('erreurs JS :', errs.length ? errs : 'aucune');
    await page.screenshot({ path: 'tools/export-audit/reports/canvas-check.png', fullPage: true });
} finally {
    await browser.close();
    await deleteFixture(API, id);
}
