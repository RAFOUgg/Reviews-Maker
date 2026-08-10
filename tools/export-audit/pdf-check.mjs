/**
 * Le PDF exporté occupe-t-il réellement la page ?
 *
 * Le PDF est la forme IMPRIMABLE du document — celle qu'un producteur classe, glisse dans un
 * emballage ou envoie à un partenaire. Une fiche A4 exportée en PDF A4 doit couvrir la page : elle
 * porte déjà ses propres marges. L'export ajoutait systématiquement 20 mm de blanc tournant, ce qui
 * réduisait le document d'environ 10 % et le faisait flotter dans une double marge.
 *
 * Ce script télécharge un vrai PDF et lit deux choses dans le fichier lui-même :
 *   • le `/MediaBox`, c'est-à-dire la taille de page réelle en points (A4 = 595 × 842) ;
 *   • la matrice `cm` qui place l'image, dont les deux premiers coefficients sont sa largeur et sa
 *     hauteur en points.
 * On compare les deux : c'est la seule façon de vérifier le fichier livré plutôt que le code.
 *
 * Usage : node tools/export-audit/pdf-check.mjs   (les deux serveurs doivent tourner)
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'reports', 'pdf');
const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });
const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 }, acceptDownloads: true });
let saved = null;
page.on('download', async (d) => {
    const name = d.suggestedFilename();
    console.log('  téléchargement :', name);
    if (!name.endsWith('.pdf')) return;
    saved = resolve(OUT, name);
    await d.saveAs(saved);
});
page.on('pageerror', (e) => console.log('  JS ERR :', String(e.message).slice(0, 160)));
page.on('console', (m) => {
    const t = m.text();
    if (/export|pdf|erreur|error|❌|✅/i.test(t)) console.log('  console :', t.slice(0, 160));
});

let failed = false;
try {
    await page.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(2200);
    await page.getByRole('button', { name: /^Aperçu$/ }).first().click();
    await sleep(3500);
    await page.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click();
    await sleep(1200);
    await page.locator('button', { hasText: 'A4 (Document)' }).first().click();
    await sleep(2500);
    await page.getByRole('button', { name: /^Appliquer$/ }).first().click();
    await sleep(2500);

    await page.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.getByRole('button', { name: /^Exporter$/ }).first().click();
    await sleep(14000);

    // Choisir le format PDF avant d'exporter.
    // Le libellé réel commence par un emoji (« 📄PDF Document imprimable et archivable ») : ancrer
    // sur `^PDF` ne matche jamais. Vérifié en listant les boutons de la modale plutôt qu'en devinant.
    const pdfBtn = page.locator('button', { hasText: 'Document imprimable' }).first();
    console.log('  bouton PDF trouvé :', await pdfBtn.count());
    if (await pdfBtn.count()) { await pdfBtn.click(); await sleep(1500); }
    await page.screenshot({ path: resolve(OUT, 'modale-avant-export.png'), fullPage: false });
    // Le bouton du PIED DE MODALE, voisin d'« Annuler » — pas `.last()` sur toute la page : la page
    // de détail porte elle aussi un bouton « Exporter », situé DERRIÈRE la superposition. Le clic y
    // atterrissait sur l'arrière-plan, ce qui ferme la modale — l'export ne démarrait donc jamais,
    // et l'absence de fichier ressemblait à un échec d'export alors que rien n'avait été lancé.
    // Ciblé par la classe du bouton d'action de la modale (`ExportModal.jsx` : dégradé
    // purple→pink) — pas `.last()` sur toute la page : la page de détail porte elle aussi un bouton
    // « Exporter », situé DERRIÈRE la superposition. Le clic y atterrissait sur l'arrière-plan, ce
    // qui ferme la modale : l'export ne démarrait jamais, et l'absence de fichier ressemblait à un
    // échec d'export alors que rien n'avait été lancé.
    const exporters = page.locator('button.from-purple-600').filter({ hasText: 'Exporter' });
    // On ATTEND l'événement de téléchargement plutôt que de dormir un temps arbitraire : deux pages
    // A4 capturées en pixelRatio 2 (3508 × 4960 chacune) dépassent largement les 30 s que j'avais
    // d'abord fixées, et l'absence de fichier ressemblait alors à un échec d'export.
    const downloadPromise = page.waitForEvent('download', { timeout: 180000 }).catch(() => null);
    await exporters.first().click();
    await downloadPromise;
    await sleep(2000);

    if (!saved) {
        console.log('✖ aucun PDF téléchargé — état de la modale :');
        console.log('   ', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 400));
        process.exit(1);
    }
    const buf = readFileSync(saved);
    const text = buf.toString('latin1');

    const media = text.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
    if (!media) { console.log('✖ /MediaBox introuvable'); process.exit(1); }
    const pw = parseFloat(media[3]), ph = parseFloat(media[4]);

    // Toutes les matrices de placement, la plus grande étant celle de l'image de page.
    const cms = [...text.matchAll(/([\d.]+)\s+0\s+0\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+cm/g)]
        .map((m) => ({ w: parseFloat(m[1]), h: parseFloat(m[2]) }))
        .sort((a, b) => (b.w * b.h) - (a.w * a.h));
    if (!cms.length) { console.log('✖ aucune matrice de placement trouvée'); process.exit(1); }
    const img = cms[0];

    const covW = (img.w / pw) * 100, covH = (img.h / ph) * 100;
    console.log(`page      : ${pw.toFixed(0)} × ${ph.toFixed(0)} pt  (A4 = 595 × 842)`);
    console.log(`image     : ${img.w.toFixed(0)} × ${img.h.toFixed(0)} pt`);
    console.log(`couverture: ${covW.toFixed(1)} % × ${covH.toFixed(1)} %`);

    if (covW < 99 || covH < 99) {
        console.log('\n✖ le document ne couvre pas la page — marge parasite sur un format identique');
        failed = true;
    } else {
        console.log('\n✔ le document couvre la page entière');
    }
} finally {
    await browser.close();
    await deleteFixture(API, id);
    if (upstreamId) await deleteFixture(API, upstreamId);
}
process.exit(failed ? 1 : 0);
