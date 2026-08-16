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
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

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
// `isPublic` : le Studio ne s'ouvre que depuis `/edit/:type/:id`, et cette route répond 403 sur une
// review créée par l'API sans session — elle n'appartient à personne. Sans ce drapeau, la page
// mourait sur un 403, aucun template n'était sélectionné, et la sonde mesurait le template par
// défaut en croyant mesurer celui qu'on lui demandait. (Jamais par écriture directe en base : le
// drapeau se demande à la ROUTE DE CRÉATION, sur une fixture jetable.)
const { id, upstreamId } = await createFixtureWithCanvases(API, args.type || 'flower', args.density || 'dense', { isPublic: 'true' });
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
    await sleep(2500);

    // ON EXPORTE DEPUIS LE STUDIO, plus depuis `/review/:id`.
    //
    // Deux vestiges corrigés d'un coup le 2026-08-16, tous deux constatés en relançant cette sonde
    // sur `HEAD` (même échec avant/après le chantier en cours — sonde périmée, pas régression) :
    //
    //  1. Le FORMAT se cliquait dans le Studio. Il en est parti le 2026-08-13, pour vivre dans la
    //     modale d'export où il décide réellement de quelque chose. La sonde partait donc en
    //     timeout sur tous les formats depuis cette date : elle n'attrapait plus rien.
    //  2. Elle passait par `/review/:id` après « Appliquer ». Or « Appliquer » n'ENREGISTRE pas la
    //     review (son propre toast le dit : « pense à sauvegarder »), et la modale ouverte depuis
    //     cette page lit la config SAUVEGARDÉE. Le template demandé était donc silencieusement
    //     ignoré, et l'on mesurait le template par défaut — Moderne Compact, une carte, dont le
    //     4:3 et l'A4 sont désactivés. C'est ce qui rendait le bouton de format inatteignable.
    //     Ouverte depuis le Studio, la modale lit la session vivante : le template demandé est bien
    //     celui qu'on mesure.
    await page.getByRole('button', { name: /^Exporter$/ }).first().click();
    await sleep(3000);
    await page.locator('button', { hasText: RATIO_LABELS[ratio] }).first().click();
    // La mesure de pagination REPART à chaque changement de format, et elle ne démarre pas dans le
    // même tick que le clic. Attendre l'activation du bouton sans cette pause revient à la lire
    // AVANT que la mesure ait commencé : la condition est vraie immédiatement, on clique sur un
    // bouton que le rendu suivant remplace, et le clic tombe sur un nœud détaché — aucun export,
    // aucune erreur. Mesuré le 2026-08-16 : sonde muette (« AUCUN ») sur un export qui produisait
    // bel et bien ses trois pages quand on laissait le temps de s'installer.
    await sleep(4000);
    await page.waitForFunction(() => {
        const b = [...document.querySelectorAll('button')].filter((n) => /Exporter/.test(n.textContent || ''));
        return b.length > 0 && !b[b.length - 1].disabled;
    }, null, { timeout: 90000 });
    await sleep(1500);
    await page.getByRole('button', { name: /Exporter/ }).last().click();
    // ATTENDRE LES FICHIERS, pas une durée. Le délai fixe de 20 s tenait quand l'export produisait
    // une image ; il ne tient plus dès que la pagination en produit trois — mesuré le 2026-08-16,
    // les trois PNG d'une Fiche Technique dense en 4:3 arrivent entre 30 et 40 s (mesure du contenu
    // puis une rasterisation par page). La sonde annonçait donc « AUCUN » sur un export qui
    // fonctionnait : un faux négatif, c'est-à-dire une sonde qu'on apprend à ignorer.
    const LIMITE = 120000;
    const debut = Date.now();
    let dernierCompte = 0;
    let stableDepuis = Date.now();
    while (Date.now() - debut < LIMITE) {
        await sleep(1000);
        if (saved.length !== dernierCompte) { dernierCompte = saved.length; stableDepuis = Date.now(); }
        // Un export multi-pages arrive par salves : on s'arrête quand plus rien ne tombe.
        else if (saved.length > 0 && Date.now() - stableDepuis > 8000) break;
    }
    console.log('fichiers téléchargés :', saved.length ? saved : 'AUCUN');
    console.log('erreurs JS :', errs.length ? errs : 'aucune');
} finally {
    await browser.close();
    if (!args.keep) {
        await deleteFixture(API, id);
        if (upstreamId) await deleteFixture(API, upstreamId);
    }
}
