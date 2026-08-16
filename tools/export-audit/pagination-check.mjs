/**
 * La pagination est-elle DÉCIDÉE PAR LA MESURE, et le refus de paginer produit-il quand même un
 * fichier ?
 *
 * Contexte (2026-08-16). Il existait deux sources de pagination : une trame composée à la main dans
 * l'éditeur (onglet Pagination, gabarits `PAGE_TEMPLATES`) et la mesure réelle des hauteurs de
 * blocs. La mauvaise gagnait — composer une trame DÉSACTIVAIT la mesure (`enabled: noSessionPages`)
 * — et ses pages nommaient leur contenu avec des clés `contentModules` que le rendu ne lit pas :
 * aucun id ne se résolvant, chaque page affichait TOUT (mesuré le 2026-08-10 : 5 pages identiques à
 * 98,6 %). La trame manuelle a été supprimée ; la mesure est la seule source, et le seul réglage
 * restant est un REFUS de paginer, déplacé dans la modale d'export avec le format.
 *
 * Trois mesures :
 *   1. pagination active → l'export produit PLUSIEURS fichiers, autant que de pages annoncées
 *      (le compte affiché et le nombre de fichiers doivent coïncider : c'est ce qui a déjà
 *      divergé par le passé, 4 pages en aperçu pour 3 PNG exportés) ;
 *   2. le refus est respecté → l'interface l'annonce ;
 *   3. et il produit quand même UN fichier. C'est le volet qui a trouvé un vrai bug : le canevas
 *      de secours n'était monté qu'en mode autonome, au motif qu'une session d'édition ouverte
 *      fournissait déjà un canevas au format fichier. Faux depuis que le Studio édite le rendu
 *      ÉCRAN — un export à page unique lancé depuis le Studio ne photographiait plus rien, sans
 *      la moindre erreur.
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense', { isPublic: 'true' });
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let dl = [];
p.on('download', (d) => dl.push(d.suggestedFilename()));
let ko = 0;

const etat = () => p.evaluate(() => {
    const m = document.body.textContent.match(
        /(\d+) pages — réparties|Une seule page suffit|Désactivée — tout sur une seule page|Mesure du contenu en cours/
    );
    return m ? m[0] : '(rien)';
});

// Attendre les FICHIERS, jamais une durée : trois rasterisations prennent 30 à 40 s, et un délai
// fixe transforme un export qui marche en « AUCUN fichier » — un faux négatif qu'on apprend à
// ignorer, c'est-à-dire une sonde morte.
async function exporter() {
    dl = [];
    await p.waitForFunction(() => {
        const b = [...document.querySelectorAll('button')].filter((n) => /Exporter/.test(n.textContent || ''));
        return b.length > 0 && !b[b.length - 1].disabled;
    }, null, { timeout: 90000 });
    await sleep(1500);
    await p.getByRole('button', { name: /Exporter/ }).last().click();
    const debut = Date.now();
    let compte = 0;
    let stable = Date.now();
    while (Date.now() - debut < 120000) {
        await sleep(1000);
        if (dl.length !== compte) { compte = dl.length; stable = Date.now(); }
        else if (dl.length > 0 && Date.now() - stable > 8000) break;
    }
    return dl.slice();
}

try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click();
    await sleep(3500);
    await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click();
    await sleep(2500);
    await p.getByRole('button', { name: /^Exporter$/ }).first().click();
    await sleep(4000);
    await p.locator('button', { hasText: 'Standard (4:3)' }).first().click();
    // La mesure repart au changement de format et ne démarre pas dans le même tick que le clic.
    await sleep(9000);

    const actif = await etat();
    const annonce = Number((actif.match(/^(\d+) pages/) || [])[1] || 0);
    console.log(`pagination : ${actif}`);
    if (annonce < 2) {
        console.log('KO — une fixture dense en 4:3 doit se répartir sur plusieurs pages');
        ko += 1;
    }

    const multi = await exporter();
    console.log(`export paginé : ${multi.length} fichier(s)`);
    if (multi.length < 2) { console.log('KO — un export paginé doit produire un fichier par page'); ko += 1; }
    if (annonce > 0 && multi.length !== annonce) {
        console.log(`KO — ${annonce} pages annoncées mais ${multi.length} fichiers : l'aperçu et le fichier divergent`);
        ko += 1;
    }

    // ── Refus de paginer ───────────────────────────────────────────────────────────────────────
    // La modale se referme après un export : sans la rouvrir, l'interrupteur reste introuvable et
    // la sonde échoue sur son propre enchaînement plutôt que sur le produit.
    const interrupteurVisible = await p.locator('button[role="switch"]').count();
    if (interrupteurVisible === 0) {
        await p.getByRole('button', { name: /^Exporter$/ }).first().click();
        await sleep(4000);
        await p.locator('button', { hasText: 'Standard (4:3)' }).first().click();
        await sleep(9000);
    }
    await p.locator('button[role="switch"]').first().click();
    await sleep(6000);
    const refus = await etat();
    console.log(`refus      : ${refus}`);
    if (!/Désactivée/.test(refus)) { console.log('KO — le refus de paginer n’est pas pris en compte'); ko += 1; }

    const solo = await exporter();
    console.log(`export non paginé : ${solo.length} fichier(s)`);
    if (solo.length !== 1) {
        console.log(`KO — sans pagination l'export doit produire exactement 1 fichier, pas ${solo.length}`);
        ko += 1;
    }
} finally {
    await b.close();
    await deleteFixture(API, id);
    if (upstreamId) await deleteFixture(API, upstreamId);
}

console.log(ko === 0 ? '\nOK — la mesure décide, le refus est respecté et produit un fichier' : `\n${ko} ÉCHEC(S)`);
process.exit(ko === 0 ? 0 : 1);
