/**
 * L'empreinte imprimée sur le document correspond-elle à celle affichée sur `/r/:id` ?
 *
 * C'est la seule question qui donne un sens au sceau. Une empreinte qu'on ne peut pas comparer n'est
 * qu'une décoration ; une empreinte qui ne correspond JAMAIS est pire — elle ferait croire à une
 * divergence à chaque vérification, et discréditerait le document qu'elle prétend garantir.
 *
 * Le piège est réel : la page écran reçoit la review BRUTE, les templates hachent la donnée ADAPTÉE
 * (`buildExportReviewData`). Sans passer par le même adaptateur des deux côtés, les deux empreintes
 * diffèrent systématiquement. Ce script le vérifie sur un rendu réel plutôt que par relecture.
 *
 * Usage : node tools/export-audit/seal-check.mjs   (les deux serveurs doivent tourner)
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HASH = /empreinte(?:\s+actuelle)?\s+([0-9A-F]{12})/i;

const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
let failed = false;

try {
    // ORDRE IMPORTANT : le document D'ABORD, l'écran ENSUITE.
    //
    // Première version de ce script : écran puis document — et les empreintes différaient
    // systématiquement. Ce n'était pas le code, c'était le TEST : cliquer « Appliquer » sauvegarde la
    // review, donc modifie `updatedAt` entre les deux lectures. Les deux empreintes décrivaient deux
    // versions réellement différentes, et avaient raison de diverger. Un montage de test qui modifie
    // ce qu'il observe ne prouve rien.

    // 1) L'empreinte imprimée dans le document exporté.
    await page.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(2200);
    for (const name of [/^Aperçu$/, /^Exporter$/]) {
        const t = page.getByRole('button', { name }).first();
        if (await t.count()) { await t.click(); await sleep(3500); }
        if (await page.locator('text=Choix du Template').count()) break;
    }
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
    const docText = await page.evaluate(() => {
        const pages = [...document.querySelectorAll('.export-maker-page')];
        const root = pages.length ? pages[pages.length - 1] : document.querySelector('#export-maker-canvas');
        return root ? root.innerText : '';
    });
    const docHash = (docText.match(HASH) || [])[1] || null;
    console.log('document→', docHash || 'ABSENTE');

    // 2) L'empreinte affichée sur la page écran (celle que vise le QR du document), lue APRÈS
    //    l'export pour porter sur exactement la même version de la review.
    await page.goto(`${BASE}/r/${id}`, { waitUntil: 'networkidle' });
    await sleep(7000);
    const screenText = await page.evaluate(() => document.body.innerText);
    const screenHash = (screenText.match(/empreinte actuelle\s+([0-9A-F]{12})/i) || [])[1] || null;
    console.log('écran   →', screenHash || 'ABSENTE');

    if (!screenHash || !docHash) { console.log('\n✖ une des deux empreintes est absente'); failed = true; }
    else if (screenHash !== docHash) { console.log('\n✖ les empreintes DIFFÈRENT — la comparaison serait toujours fausse'); failed = true; }
    else console.log('\n✔ empreintes identiques — le document est réellement vérifiable');
} finally {
    await browser.close();
    await deleteFixture(API, id);
    if (upstreamId) await deleteFixture(API, upstreamId);
}
process.exit(failed ? 1 : 0);
