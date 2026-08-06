/**
 * Télécharge un VRAI export PNG et le conserve, pour inspection visuelle.
 *
 * L'aperçu DOM ne suffit pas : le pipeline réel passe par `html-to-image` (SVG `<foreignObject>`
 * puis rasterisation), et ce projet a déjà vu des défauts qui n'existaient QUE dans le fichier
 * produit (titres coupés sur deux lignes malgré un DOM correct, 2026-07-30).
 *
 * Usage : node tools/export-audit/png-check.mjs --url=… --template=detailedCard --ratio=4:3
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFixture, deleteFixture, attachCanvases } from './fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const OUT = resolve(__dirname, 'reports', 'png');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TEMPLATE_LABELS = {
    modernCompact: 'Moderne Compact', detailedCard: 'Fiche Technique Détaillée',
    blogArticle: 'Article de Blog', socialStory: 'Story Social Media',
    traceabilityReport: 'Rapport de Traçabilité',
};
const RATIO_LABELS = {
    '1:1': 'Carré (1:1)', '16:9': 'Paysage (16:9)', '9:16': 'Portrait (9:16)',
    '4:3': 'Standard (4:3)', 'A4': 'A4 (Document)',
};

const tpl = args.template || 'detailedCard';
const ratio = args.ratio || '4:3';

mkdirSync(OUT, { recursive: true });
const id = await createFixture(API, args.type || 'flower', args.density || 'dense');
await attachCanvases(API, id, args.type || 'flower');
console.log('fixture', id);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
const saved = [];
page.on('download', async (d) => {
    const p = resolve(OUT, `${tpl}-${ratio.replace(':', 'x')}-${d.suggestedFilename()}`);
    await d.saveAs(p);
    saved.push(p);
});

try {
    await page.goto(`${BASE}/edit/${args.type || 'flower'}/${id}`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.getByRole('button', { name: /^Aperçu$/ }).first().click();
    await sleep(3500);
    await page.locator('button', { hasText: TEMPLATE_LABELS[tpl] }).first().click();
    await sleep(1200);
    await page.locator('button', { hasText: RATIO_LABELS[ratio] }).first().click();
    await sleep(2500);
    await page.getByRole('button', { name: /^Appliquer$/ }).first().click();
    await sleep(2500);

    await page.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.getByRole('button', { name: /^Exporter$/ }).first().click();
    await sleep(8000);
    await page.getByRole('button', { name: /Exporter/ }).last().click();
    await sleep(20000);
    console.log('fichiers téléchargés :', saved.length ? saved : 'AUCUN');
    console.log('erreurs JS :', errs.length ? errs : 'aucune');
} finally {
    await browser.close();
    if (!args.keep) await deleteFixture(API, id);
}
