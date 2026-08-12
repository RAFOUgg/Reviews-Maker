/**
 * Zoom au clic : cliquer un bloc du rendu l'agrandit — et une cellule de pipeline, elle, garde
 * son propre comportement.
 *
 * L'arbitrage à vérifier est celui qui avait fait reporter la fonctionnalité : **la cible la plus
 * spécifique l'emporte**. Un zoom qui se déclencherait AUSSI sur une cellule masquerait le détail
 * de l'étape ; un zoom qui ne se déclencherait nulle part serait un réglage mort de plus.
 *
 * Troisième point vérifié, le plus important : l'export ne doit RIEN en voir. Toute affordance
 * ajoutée à ce module doit être strictement additive — c'est la règle qui a déjà évité une
 * régression de capture sur ce chantier.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ko = 0;
const verdict = (nom, ok, detail) => { if (!ok) ko++; console.log(`${ok ? '✔' : '✖'} ${nom}${detail ? ' — ' + detail : ''}`); };

const id = await createFixture(API, 'flower', 'dense', {
    exportMakerConfig: JSON.stringify({ template: 'detailedCard', ratio: '16:9' }),
});
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

const overlay = () => p.locator('[role="dialog"][aria-label^="Vue agrandie"]');

try {
    // `/r/:id` (page publique) est la surface INTERACTIVE du rendu — la page de détail, elle,
    // affiche un aperçu volontairement inerte (`ExportMakerCardRenderer`, `interactive={false}`).
    await p.goto(`${BASE}/r/${id}`, { waitUntil: 'networkidle' });
    await sleep(5000);

    const blocs = p.locator('[data-module], [data-zoom-block]');
    const n = await blocs.count();
    verdict('la page publique rend des blocs identifiés', n > 0, `${n} bloc(s)`);
    if (n === 0) throw new Error('aucun bloc à cliquer');

    // 1. Un bloc ORDINAIRE zoome. On vise un bloc de contenu, pas un pipeline.
    const cible = p.locator('[data-zoom-block]').first();
    if (await cible.count()) {
        // Clic à la SOURIS, pas `locator.click()` : les cartes LiquidUI animent en continu
        // (shimmer suivant le curseur), Playwright n'y obtient jamais la stabilité de boîte qu'il
        // exige, et `force` seul n'a pas produit d'événement remontant jusqu'à la racine.
        const boite = await cible.boundingBox();
        await p.mouse.click(boite.x + 20, boite.y + boite.height - 20);
        await sleep(700);
        verdict('cliquer un bloc ouvre la vue agrandie', await overlay().count() > 0);

        // Le contenu agrandi est bien celui du bloc, pas un cadre vide.
        const texteBloc = (await cible.innerText().catch(() => '')).slice(0, 40).trim();
        const texteZoom = (await overlay().innerText().catch(() => '')).slice(0, 400);
        verdict('la vue agrandie montre le contenu du bloc',
            Boolean(texteBloc) && texteZoom.includes(texteBloc.split('\n')[0]),
            `attendu « ${texteBloc.split('\n')[0]} »`);

        // Échap referme.
        await p.keyboard.press('Escape');
        await sleep(400);
        verdict('Échap referme la vue agrandie', await overlay().count() === 0);
    } else {
        verdict('bloc de contenu trouvé', false, 'aucun [data-zoom-block]');
    }

    // 2. Une CELLULE de pipeline ne déclenche pas le zoom : elle a sa propre action.
    const cellule = p.locator('[data-zoom-skip]').first();
    if (await cellule.count()) {
        const bc = await cellule.boundingBox();
        if (bc) await p.mouse.click(bc.x + bc.width / 2, bc.y + bc.height / 2);
        await sleep(700);
        verdict('une cellule de pipeline ne déclenche pas le zoom', await overlay().count() === 0);
        await p.keyboard.press('Escape');
    } else {
        verdict('cellule de pipeline présente dans le rendu', false, 'aucun [data-zoom-skip]');
    }

    // 3. L'export n'en voit rien : le canevas monté pour la capture ne porte aucune superposition.
    await sleep(500);
    await p.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
    await sleep(2000);
    const exporter = p.getByRole('button', { name: /^Exporter$/ }).first();
    if (await exporter.count()) {
        await exporter.click();
        await sleep(Number(process.env.AUDIT_EXPORT_WAIT_MS || 14000));
        const dansLaCapture = await p.evaluate(() => {
            const pages = [...document.querySelectorAll('.export-maker-page')];
            return pages.reduce((n, el) => n + el.querySelectorAll('[role="dialog"]').length, 0);
        });
        verdict('aucune superposition dans les pages capturées', dansLaCapture === 0, `${dansLaCapture} trouvée(s)`);
    } else {
        verdict('bouton Exporter présent', false, '');
    }
} catch (e) {
    ko++; console.log('✖ exécution interrompue —', String(e.message).slice(0, 200));
} finally {
    await b.close(); await deleteFixture(API, id);
}

console.log(ko === 0 ? '\n✔ zoom au clic conforme à l\'arbitrage' : `\n✖ ${ko} contrôle(s) en échec`);
process.exit(ko ? 1 : 0);
