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
 * RÉÉCRITE LE 2026-10-28 (L21). Depuis le 2026-08-13 le format du fichier ne se choisit plus dans
 * l'éditeur mais dans la modale d'export (`RatioSelector` dans `ExportModal.jsx`). L'ancienne
 * version cliquait « A4 (Document) » dans le Studio, où ce bouton n'existe plus, puis exportait
 * depuis la page de détail : elle échouait sur son propre enchaînement, pas sur le produit.
 * Parcours actuel : Studio → template → « Exporter » → A4 → PDF → « Exporter ».
 *
 * Usage : node tools/export-audit/pdf-check.mjs   (les deux serveurs doivent tourner — cf.
 *         AUDIT_BASE / AUDIT_API —, ou passer par `run-all.mjs` qui les démarre)
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'reports', 'pdf');
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5173');
const API = (process.env.AUDIT_API || 'http://localhost:3000');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });
// `isPublic` à la CRÉATION : `/edit/:type/:id` répond 403 sur une review créée sans session.
const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense', { isPublic: 'true' });
console.log(`review ${id}`);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 }, acceptDownloads: true });
const telecharges = [];
page.on('download', async (d) => {
    const name = d.suggestedFilename();
    console.log('  téléchargement :', name);
    if (!name.endsWith('.pdf')) return;
    const chemin = resolve(OUT, name);
    await d.saveAs(chemin);
    telecharges.push(chemin);
});
page.on('pageerror', (e) => console.log('  JS ERR :', String(e.message).slice(0, 160)));

const etatPagination = () => page.evaluate(() => {
    const m = document.body.textContent.match(
        /(\d+) pages — réparties|Une seule page suffit|Désactivée — tout sur une seule page|Mesure du contenu en cours/
    );
    return m ? m[0] : null;
});

let failed = false;
try {
    await page.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.getByRole('button', { name: /^Aperçu$/ }).first().click();
    await sleep(3500);
    await page.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click();
    await sleep(2500);
    // Bouton « Exporter » de l'en-tête du Studio → ouvre la modale d'export.
    await page.getByRole('button', { name: /^Exporter$/ }).first().click();
    await page.getByText('Format du fichier').first().waitFor({ timeout: 30000 });
    await sleep(1500);

    // Format du FICHIER : il vit dans la modale depuis le 2026-08-13.
    const a4 = page.locator('button', { hasText: 'A4 (Document)' }).first();
    if (!(await a4.count())) throw new Error('bouton « A4 (Document) » absent de la modale d’export');
    if (await a4.isDisabled()) throw new Error('A4 indisponible pour la Fiche Technique Détaillée');
    await a4.click();
    // La mesure de pagination repart au changement de format : attendre son verdict, pas une durée.
    const debut = Date.now();
    let etat = null;
    while (Date.now() - debut < 60000) {
        await sleep(1000);
        etat = await etatPagination();
        if (etat && !/Mesure du contenu/.test(etat)) break;
    }
    console.log(`  pagination : ${etat || '(aucune annonce)'}`);
    const libelleFormat = await page.evaluate(() => (document.body.textContent.match(/Format : ?(\d+:\d+|A4)/) || [])[1] || null);
    if (libelleFormat !== 'A4') {
        console.log(`✖ la modale annonce le format « ${libelleFormat} » au lieu de A4`);
        failed = true;
    }

    // Type de fichier PDF. Le libellé réel commence par un emoji (« 📄PDF Document imprimable et
    // archivable ») : ancrer sur `^PDF` ne matche jamais.
    const pdfBtn = page.locator('button', { hasText: 'Document imprimable' }).first();
    if (!(await pdfBtn.count())) throw new Error('type de fichier PDF absent de la modale');
    await pdfBtn.click();
    await sleep(1500);
    await page.screenshot({ path: resolve(OUT, 'modale-avant-export.png'), fullPage: false });

    // Le bouton d'action de la modale est le DERNIER « Exporter » du DOM (la modale est montée après
    // l'en-tête du Studio, qui porte lui aussi un « Exporter »). On attend qu'il soit actif.
    await page.waitForFunction(() => {
        const b = [...document.querySelectorAll('button')].filter((n) => /Exporter/.test(n.textContent || ''));
        return b.length > 0 && !b[b.length - 1].disabled;
    }, null, { timeout: 90000 });
    // On ATTEND l'événement de téléchargement plutôt que de dormir : deux pages A4 en pixelRatio 2
    // dépassent largement 30 s sur une machine lente.
    const downloadPromise = page.waitForEvent('download', { timeout: 240000 }).catch(() => null);
    await page.getByRole('button', { name: /Exporter/ }).last().click();
    await downloadPromise;
    await sleep(3000);

    const saved = telecharges[0];
    if (!saved) {
        console.log('✖ aucun PDF téléchargé — état de la modale :');
        console.log('   ', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 400));
        failed = true;
    } else {
        const text = readFileSync(saved).toString('latin1');
        const boxes = [...text.matchAll(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
        if (!boxes.length) throw new Error('/MediaBox introuvable dans le PDF');
        const pw = parseFloat(boxes[0][3]), ph = parseFloat(boxes[0][4]);

        // Toutes les matrices de placement, la plus grande étant celle de l'image de page.
        const cms = [...text.matchAll(/([\d.]+)\s+0\s+0\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+cm/g)]
            .map((m) => ({ w: parseFloat(m[1]), h: parseFloat(m[2]) }))
            .sort((a, b) => (b.w * b.h) - (a.w * a.h));
        if (!cms.length) throw new Error('aucune matrice de placement trouvée dans le PDF');
        const img = cms[0];

        const covW = (img.w / pw) * 100, covH = (img.h / ph) * 100;
        console.log(`pages     : ${boxes.length}`);
        console.log(`page      : ${pw.toFixed(0)} × ${ph.toFixed(0)} pt  (A4 = 595 × 842)`);
        console.log(`image     : ${img.w.toFixed(0)} × ${img.h.toFixed(0)} pt`);
        console.log(`couverture: ${covW.toFixed(1)} % × ${covH.toFixed(1)} %`);

        if (Math.abs(pw - 595) > 2 || Math.abs(ph - 842) > 2) {
            console.log('\n✖ la page du PDF n’est pas au format A4 alors que A4 a été choisi');
            failed = true;
        }
        if (covW < 99 || covH < 99) {
            console.log('\n✖ le document ne couvre pas la page — marge parasite sur un format identique');
            failed = true;
        } else {
            console.log('\n✔ le document couvre la page entière');
        }
    }
} catch (e) {
    console.log(`✖ ${e.message}`);
    failed = true;
} finally {
    await browser.close();
    await deleteFixture(API, id);
    if (upstreamId) await deleteFixture(API, upstreamId);
}
process.exit(failed ? 1 : 0);
