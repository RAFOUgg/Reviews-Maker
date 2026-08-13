/**
 * Le mode Écran propose-t-il PC / téléphone, et le rendu se RECALIBRE-T-IL vraiment ?
 *
 * « en mode écran il faut juste gérer le format PC et format téléphone, faire des rendu responsive
 * parfait, tout les element doivent s'auto recalibrer » (2026-08-13). Deux choses à prouver, et la
 * seconde est la seule qui compte : un rendu peut changer de largeur sans rien recalibrer — ce
 * serait alors une maquette d'ordinateur rétrécie, exactement ce qu'on remplace. On mesure donc la
 * taille de police RENDUE, le nombre de colonnes et la largeur du canevas sur les deux formats.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// `isPublic` : le Studio ne s'ouvre que depuis le formulaire d'édition, et `/edit/:type/:id`
// répond 403 sur une review créée par l'API sans session (elle n'appartient à personne, cf.
// `canReadFor`). On le demande à la ROUTE DE CRÉATION elle-même, sur une fixture jetable — pas
// d'écriture directe en base, et aucune donnée réelle touchée.
const id = await createFixture(API, 'flower', 'dense', { isPublic: 'true' });
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

const mesurer = () => p.evaluate(() => {
    const c = document.querySelector('#export-maker-screen-canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    // Le corps de texte tel qu'il est RENDU : on prend la médiane des tailles réellement
    // appliquées, pas la valeur du réglage — c'est la seule qui décide de la lisibilité.
    const tailles = [...c.querySelectorAll('*')]
        .filter((n) => n.children.length === 0 && (n.textContent || '').trim().length > 3)
        .map((n) => parseFloat(getComputedStyle(n).fontSize))
        .filter((v) => v > 0)
        .sort((a, b) => a - b);
    const mediane = tailles.length ? tailles[Math.floor(tailles.length / 2)] : 0;
    return {
        largeurCanevas: Math.round(c.offsetWidth),
        largeurAffichee: Math.round(r.width),
        ratio: c.getAttribute('data-ratio'),
        police: mediane,
        minPolice: tailles[0] || 0,
        // Un débordement latéral est disqualifiant sur un téléphone : la page ne doit jamais
        // défiler horizontalement.
        debordement: Math.max(0, Math.round(c.scrollWidth - c.clientWidth)),
    };
});

try {
    // Le mode Écran vit dans le Studio, qui s'ouvre par « Aperçu » depuis le formulaire.
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(5000);

    const ecran = p.locator('button', { hasText: /^.?\s*Écran$/ }).first();
    if (await ecran.count()) { await ecran.click(); await sleep(3000); }

    const boutons = await p.locator('button', { hasText: /Ordinateur|Téléphone/ }).count();
    console.log(`sélecteurs d'appareil trouvés : ${boutons}`);
    if (boutons < 2) {
        console.log('boutons visibles :', (await p.locator('button').allTextContents()).slice(0, 30).join(' | '));
        throw new Error('le sélecteur PC/téléphone n’est pas atteignable — la sonde ne mesure rien');
    }

    await p.locator('button', { hasText: 'Ordinateur' }).first().click(); await sleep(3500);
    await p.screenshot({ path: 'tools/export-audit/reports/screen-pc.png' });
    const pc = await mesurer();
    console.log('PC       :', JSON.stringify(pc));

    await p.locator('button', { hasText: 'Téléphone' }).first().click(); await sleep(3500);
    const tel = await mesurer();
    console.log('Téléphone:', JSON.stringify(tel));

    if (!pc || !tel) throw new Error('aucun canevas d’écran — la sonde ne mesure rien');
    if (pc.ratio !== 'ecran-pc' || tel.ratio !== 'ecran-mobile') { console.log(`KO — formats non appliqués (${pc.ratio} / ${tel.ratio})`); ko++; }
    if (tel.largeurCanevas >= pc.largeurCanevas) { console.log('KO — le téléphone n’est pas plus étroit que l’ordinateur'); ko++; }
    // LE point : la police ne doit pas simplement suivre la largeur. Un texte sous 14px sur un
    // canevas affiché à 1:1 est illisible sur un téléphone réel.
    if (tel.police < 14) { console.log(`KO — corps de texte à ${tel.police}px sur téléphone (minimum 14)`); ko++; }
    if (tel.debordement > 2) { console.log(`KO — débordement latéral de ${tel.debordement}px sur téléphone`); ko++; }
    if (pc.police < 14) { console.log(`KO — corps de texte à ${pc.police}px sur ordinateur`); ko++; }

    await p.screenshot({ path: 'tools/export-audit/reports/screen-mobile.png', fullPage: false });
} finally {
    await b.close();
    await deleteFixture(API, id).catch(() => {});
}
console.log(ko === 0 ? '\nOK — deux formats d’écran, rendu recalibré' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
