/**
 * Options de la modale d'export : agissent-elles sur le FICHIER produit ?
 *
 * La modale n'avait jamais été revue depuis la refonte. Le relevé de code montre que ses six
 * options sont toutes lues au moment de l'export (résolution, qualité JPEG, orientation et format
 * PDF, filigrane, fond transparent) — mais « lue » ne veut pas dire « effective » : c'est
 * exactement la nuance qui a rendu six réglages inertes ailleurs dans ce module.
 *
 * Le cas à vérifier en priorité est le FOND TRANSPARENT : il passe `backgroundColor: 'transparent'`
 * à la capture, alors que le template peint lui-même son fond sur son nœud racine. Une option qui
 * ne peut pas gagner contre le rendu est inerte, quoi qu'en dise le code qui la lit.
 *
 * On télécharge donc le PNG et on lit l'alpha d'un pixel de coin. Pas d'aperçu, pas de DOM : le
 * fichier.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ko = 0;
const verdict = (nom, ok, detail) => { if (!ok) ko++; console.log(`${ok ? '✔' : '✖'} ${nom}${detail ? ' — ' + detail : ''}`); };

const id = await createFixture(API, 'flower', 'dense', {
    exportMakerConfig: JSON.stringify({ template: 'detailedCard', ratio: '1:1' }),
});
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

/** Alpha du pixel (2,2) du PNG téléchargé — lu dans le navigateur, seul décodeur disponible ici. */
async function alphaDuCoin(chemin) {
    const b64 = readFileSync(chemin).toString('base64');
    return p.evaluate((data) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const g = c.getContext('2d');
            g.clearRect(0, 0, c.width, c.height);
            g.drawImage(img, 0, 0);
            resolve(g.getImageData(2, 2, 1, 1).data[3]);
        };
        img.onerror = () => resolve(-1);
        img.src = `data:image/png;base64,${data}`;
    }), b64);
}

async function exporterPng({ transparent }) {
    await p.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await p.getByRole('button', { name: /^Exporter$/ }).first().click();
    await sleep(Number(process.env.AUDIT_EXPORT_WAIT_MS || 14000));

    const png = p.locator('button', { hasText: /^PNG/ }).first();
    if (await png.count()) { await png.click(); await sleep(500); }

    // La case est le frère direct du libellé « Fond transparent », dans le même <label>.
    const caseTransparente = p.locator('label', { hasText: 'Fond transparent' }).locator('input[type="checkbox"]').first();
    if (transparent) {
        if (!(await caseTransparente.count())) throw new Error('case « Fond transparent » introuvable');
        await caseTransparente.check({ force: true });
        await sleep(600);
        if (!(await caseTransparente.isChecked())) throw new Error('case « Fond transparent » non cochée');
    }

    const attente = p.waitForEvent('download', { timeout: 90000 });
    await p.getByRole('button', { name: /Exporter|Télécharger/ }).last().click();
    const dl = await attente;
    return dl.path();
}

try {
    const opaque = await exporterPng({ transparent: false });
    const a1 = await alphaDuCoin(opaque);
    verdict('un PNG standard a un fond opaque', a1 === 255, `alpha du coin = ${a1}`);

    const transp = await exporterPng({ transparent: true });
    const a2 = await alphaDuCoin(transp);
    // Le constat compte plus que le verdict : s'il reste opaque, l'option est INERTE et doit être
    // retirée ou rendue effective — un réglage qui ne change rien est pire que pas de réglage.
    verdict('« fond transparent » produit réellement de la transparence', a2 < 250,
        `alpha du coin = ${a2} (opaque = 255)`);
} catch (e) {
    ko++; console.log('✖ exécution interrompue —', String(e.message).slice(0, 200));
} finally {
    await b.close(); await deleteFixture(API, id);
}

console.log(ko === 0 ? '\n✔ options d\'export effectives' : `\n✖ ${ko} contrôle(s) en échec`);
process.exit(ko ? 1 : 0);
