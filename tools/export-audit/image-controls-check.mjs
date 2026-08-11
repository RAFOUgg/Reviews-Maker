/**
 * Les réglages photo agissent-ils réellement sur le rendu ?
 *
 * Trois affirmations de l'utilisateur (2026-08-11) : « duplication des photo affichées et sys.
 * dupliqué pas lié non fonctionnel, filtre et effet non fonctionnel non plus ». On vérifie sur le
 * rendu, pas sur le panneau : un contrôle qui change le store sans rien changer à l'image est
 * exactement le défaut signalé.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const id = await createFixture(API, 'flower', 'dense', { photoCount: 3 });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 140)));

const imagesDuRendu = () => p.evaluate(() => {
    const c = document.querySelector('#export-maker-screen-canvas') || document.querySelector('#export-maker-canvas');
    if (!c) return null;
    // Sans cette distinction, « 0 image » ne dit pas si le rendu n'en porte aucune ou si le canevas
    // n'a pas été trouvé — les deux ont la même trace, et c'est ce qui a rendu la première
    // exécution ininterprétable.
    return [...c.querySelectorAll('img')].map((i) => ({
        src: (i.getAttribute('src') || '').slice(-28),
        filtre: getComputedStyle(i).filter,
        opacite: getComputedStyle(i).opacity,
    }));
});

let ko = 0;
const verdict = (nom, ok, detail) => { if (!ok) ko++; console.log(`${ok ? '✔' : '✖'} ${nom}${detail ? ' — ' + detail : ''}`); };

try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(5000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(4000);
    await p.locator('button', { hasText: 'Image & Logo' }).first().click(); await sleep(1200);

    // 1. Le panneau n'affiche plus de fragment de code, et un seul sélecteur de photos.
    const texte = await p.locator('text=Photos du rendu').first().count();
    const parasite = await p.getByText(')}', { exact: true }).count();
    const ancien = await p.locator('text=Photos affichées').count();
    verdict('un seul sélecteur de photos', texte === 1 && ancien === 0, `« Photos du rendu » ×${texte}, ancien libellé ×${ancien}`);
    verdict('aucun fragment de code affiché', parasite === 0, `«)}» ×${parasite}`);

    // 2. Le filtre agit sur le rendu.
    const avant = await imagesDuRendu();
    await p.locator('button', { hasText: 'Noir & Blanc' }).first().click(); await sleep(2500);
    const apres = await imagesDuRendu();
    const gris = (apres || []).filter((i) => i.filtre.includes('grayscale')).length;
    verdict('filtre appliqué au rendu', gris > 0, `${gris}/${(apres || []).length} images en grayscale (avant : ${(avant || []).filter((i) => i.filtre.includes('grayscale')).length})`);

    await p.locator('button', { hasText: 'Aucun' }).first().click(); await sleep(1500);
    const remis = await imagesDuRendu();
    verdict('filtre retirable', (remis || []).every((i) => !i.filtre.includes('grayscale')), '');

    // 3. Retirer une photo la retire du rendu.
    await p.locator('button[title="Retirer du rendu"]').first().click(); await sleep(2500);
    const restant = await imagesDuRendu();
    verdict('photo retirée absente du rendu',
        (restant || []).length < (remis || []).length || JSON.stringify(restant) !== JSON.stringify(remis),
        `${(remis || []).length} → ${(restant || []).length} images`);
} finally {
    await b.close(); await deleteFixture(API, id);
}
console.log(ko === 0 ? '\n✔ les réglages photo agissent sur le rendu' : `\n✖ ${ko} contrôle(s) sans effet`);
process.exit(ko ? 1 : 0);
