/**
 * Vérification AU CLIC de la grille de pipeline en ÉDITION (règle 4 du C11 : build vert et tests
 * verts ne prouvent pas qu'un graphe s'édite encore). `PipelineGridView.jsx` est partagé entre
 * l'éditeur et le rendu d'export — toute correction faite pour l'export doit laisser l'édition
 * intacte, et c'est la seule façon de le savoir.
 *
 * Usage : node tools/export-audit/edit-check.mjs [--url=http://localhost:5173]
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const id = await createFixture(API, 'flower', 'dense');
console.log('fixture', id);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
try {
    // Surface ÉDITABLE de `PipelineGridView`. Vérifié par lecture des imports : la vue pipeline du
    // formulaire de review (`PipelineDragDropView.jsx`) n'utilise PAS ce composant — elle a sa
    // propre grille et ne connaît même pas la classe `.pipeline-cell`. Les seuls consommateurs
    // vivants de `PipelineGridView` sont `PipelineMiniGrid` (export/galerie, lecture seule) et
    // `PipelineWithSidebar`, monté par la route `/example-pipeline`. C'est donc là — et nulle part
    // ailleurs — que l'édition de ce composant se vérifie au clic.
    await page.goto(`${BASE}${args.path || `/edit/flower/${id}`}`, { waitUntil: 'networkidle' });
    await sleep(3000);

    if (args.explore) {
        const labels = await page.locator('button, [role="tab"], a').evaluateAll((els) => els
            .map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim())
            .filter((t) => t && t.length < 40));
        console.log('contrôles visibles :', [...new Set(labels)].join(' | '));
    }

    // Les sections du formulaire sont des onglets ICÔNE (pas de libellé texte) : 🌱 = Culture,
    // 🔥 = Curing. C'est là que vit la grille de pipeline en édition.
    for (const emoji of ['🌱', '🔥']) {
        const t = page.getByRole('button', { name: emoji }).first();
        if (await t.count()) { await t.click().catch(() => {}); await sleep(2500); }
        if (await page.locator('.pipeline-cell').count()) break;
    }
    for (const label of [/^Culture$/i, /Culture/i, /Pipeline/i]) {
        const t = page.getByRole('button', { name: label }).first();
        if (await t.count()) { await t.click().catch(() => {}); await sleep(2000); break; }
    }
    await sleep(2000);
    // La grille peut vivre derrière une bascule de vue (grille / trame / liste).
    if (!(await page.locator('.pipeline-cell').count())) {
        for (const label of [/grille/i, /trame/i, /calendrier/i]) {
            const t = page.getByRole('button', { name: label }).first();
            if (await t.count()) { await t.click().catch(() => {}); await sleep(2000); }
            if (await page.locator('.pipeline-cell').count()) break;
        }
    }

    const cells = page.locator('.pipeline-cell');
    const n = await cells.count();
    console.log('cellules de grille visibles :', n);
    if (n) {
        const cls = await cells.first().evaluate((el) => el.className);
        console.log('mode :', cls.includes('opacity-75') ? 'LECTURE SEULE' : 'ÉDITABLE');
        const before = await page.locator('.pipeline-cell[class*="ring"]').count();
        await cells.nth(2).click();
        await sleep(1500);
        const after = await page.locator('.pipeline-cell[class*="ring"]').count();
        console.log('anneaux de sélection avant/après clic :', before, '/', after);
        console.log("panneau d'édition ouvert ?", await page.locator('text=/Enregistrer|Modifier la case|Éditer/i').count());
        console.log('libellés de cases lus :', await cells.evaluateAll((els) => els.slice(0, 8).map((e) => e.textContent.trim().split('\n')[0])));
        await page.screenshot({ path: 'tools/export-audit/reports/edit-grid.png' });
    }
    console.log('bloc « Astuce » visible en ÉDITION ?', await page.locator('text=Maintenez Ctrl/Cmd').count());
    console.log('erreurs JS :', errs.length ? errs : 'aucune');
} finally {
    await browser.close();
    await deleteFixture(API, id);
}
