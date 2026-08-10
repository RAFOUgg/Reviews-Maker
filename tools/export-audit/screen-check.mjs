/**
 * Audite la VUE DÉTAILLÉE — `/r/:id`, c'est-à-dire l'onglet « Écran » d'Export Maker.
 *
 * POURQUOI CE FICHIER EXISTE. Toute la matrice d'audit (`run.mjs`) ne mesure que le chemin FICHIER :
 * les 5 templates à canevas fixe, montés hors-écran par la modale d'export. Or l'onglet « Écran »
 * est le rendu PAR DÉFAUT du Studio (`ExportMakerPanel.jsx`) et celui de la page publique — donc la
 * surface que l'utilisateur voit en premier, et la seule que beaucoup verront jamais. Elle est
 * rendue par `ReviewFullDisplay.jsx`, un composant que la matrice n'a jamais chargé.
 *
 * Conséquence constatée le 2026-08-10 : une session entière de corrections a fait passer la matrice
 * de 18 à 8 erreurs sans rien changer à ce que l'utilisateur regardait, pendant que la Vue Détaillée
 * affichait une valeur normalisée « 0.78/1 » et une pastille de curseur — invisibles pour toutes les
 * règles, faute d'être exécutées là.
 *
 * Usage : node tools/export-audit/screen-check.mjs [--url=…] [--review=<id>] [--type=flower]
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_SCRIPT = resolve(__dirname, 'auditRules.js');

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let id = args.review;
let upstreamId = null;
if (!id) ({ id, upstreamId } = await createFixtureWithCanvases(API, args.type || 'flower', 'dense'));
console.log('sujet', id);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));

try {
    await page.goto(`${BASE}/r/${id}`, { waitUntil: 'networkidle' });
    await sleep(7000);
    await page.addScriptTag({ path: AUDIT_SCRIPT });

    const res = await page.evaluate(() => {
        // La Vue Détaillée n'a ni `.export-maker-page` ni `#export-maker-canvas` : c'est un document
        // qui défile. On audite donc le conteneur de contenu le plus englobant.
        const root = document.querySelector('main') || document.body;
        return window.__exportAudit.auditRender(root, { paged: false, documentRender: true });
    });
    if (!res) { console.log('✖ rien à auditer'); process.exit(1); }

    const byRule = {};
    for (const v of res.violations) {
        byRule[v.rule] ||= { rule: v.rule, error: 0, warn: 0, samples: [] };
        byRule[v.rule][v.severity] += 1;
        if (byRule[v.rule].samples.length < 3) byRule[v.rule].samples.push(`${v.message} — ${v.selector}`);
    }
    const rules = Object.values(byRule).sort((a, b) => (b.error - a.error) || (b.warn - a.warn));
    console.log('\n▶ Vue Détaillée (/r/:id)');
    for (const r of rules) {
        console.log(`   ${r.rule.padEnd(4)} ${String(r.error).padStart(3)} err ${String(r.warn).padStart(4)} warn`);
        if (r.error) r.samples.forEach((s) => console.log(`        ${s}`));
    }
    console.log('\nerreurs JS :', errs.length ? errs : 'aucune');

    mkdirSync(resolve(__dirname, 'reports'), { recursive: true });
    const out = resolve(__dirname, 'reports', `screen-${Date.now()}.json`);
    writeFileSync(out, JSON.stringify({ id, violations: res.violations, stats: res.stats, pageErrors: errs }, null, 2));
    console.log('▶ Rapport :', out);
} finally {
    await browser.close();
    if (!args.review) {
        await deleteFixture(API, id);
        if (upstreamId) await deleteFixture(API, upstreamId);
    }
}
