/**
 * Peut-on RÉELLEMENT réordonner un bloc en le glissant sur le rendu ?
 *
 * « pour rendre export maker plus simple il faut faire en sorte que le rendu soit maléable, on
 * pourrait alors changer l'ordre des elements en glissant déposant les containers » (2026-08-12).
 *
 * Une poignée qui apparaît ne prouve rien : on relève l'ordre des `data-module` AVANT, on glisse un
 * bloc au-dessus d'un autre, et on relève l'ordre APRÈS. Si la séquence est identique, le geste
 * n'aura été qu'une animation.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const id = await createFixture(API, 'flower', 'dense', { isPublic: 'true' });
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

const ordre = () => p.evaluate(() => {
    const c = document.querySelector('#export-maker-screen-canvas');
    if (!c) return null;
    const vus = [];
    for (const el of c.querySelectorAll('[data-module]')) {
        const base = (el.getAttribute('data-module') || '').split('#')[0];
        if (base && !vus.includes(base)) vus.push(base);
    }
    return vus;
});

try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(5000);
    // Fiche Technique : c'est le template qui porte le plus de blocs distincts.
    await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click(); await sleep(5000);

    const avant = await ordre();
    if (!avant || avant.length < 3) throw new Error(`pas assez de blocs pour ordonner (${JSON.stringify(avant)})`);
    console.log('ordre avant :', avant.join(' → '));

    // On saisit l'AVANT-DERNIER bloc déplaçable et on le remonte au-dessus du deuxième.
    const deplacables = avant.filter((m) => !['masthead', 'mainImage', 'heroImage'].includes(m));
    const source = deplacables[deplacables.length - 1];
    const destination = deplacables[0];
    console.log(`glissement : « ${source} » au-dessus de « ${destination} »`);

    const boite = async (moduleId) => p.evaluate((m) => {
        const el = document.querySelector(`#export-maker-screen-canvas [data-module^="${m}"]`);
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, top: r.top };
    }, moduleId);

    const src = await boite(source);
    if (!src) throw new Error(`bloc source « ${source} » introuvable`);

    // Survol → la poignée apparaît en surcouche, coin haut gauche du bloc.
    await p.mouse.move(src.x, src.y); await sleep(800);
    const poignee = await p.evaluate(() => {
        const n = [...document.body.children].flatMap((c) => [...c.querySelectorAll?.('div[title="Glisser pour déplacer ce bloc"]') || []])[0]
            || document.querySelector('div[title="Glisser pour déplacer ce bloc"]');
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (!poignee) { console.log('KO — aucune poignée de glissement au survol d’un bloc'); ko++; }
    else {
        const dst = await boite(destination);
        await p.mouse.move(poignee.x, poignee.y);
        await p.mouse.down();
        // Plusieurs pas : le point d'insertion se calcule au `pointermove`, un saut unique peut
        // n'en produire aucun.
        for (let i = 1; i <= 12; i++) {
            await p.mouse.move(
                poignee.x + ((dst.x - poignee.x) * i) / 12,
                poignee.y + ((dst.top + 8 - poignee.y) * i) / 12,
            );
            await sleep(40);
        }
        await sleep(400);
        await p.mouse.up(); await sleep(2500);

        const apres = await ordre();
        console.log('ordre après :', apres.join(' → '));
        if (JSON.stringify(apres) === JSON.stringify(avant)) { console.log('KO — l’ordre des blocs n’a pas changé'); ko++; }
        else if (apres.indexOf(source) >= apres.indexOf(destination)) {
            console.log(`KO — « ${source} » n’est pas remonté avant « ${destination} »`); ko++;
        }
    }
} finally {
    await b.close();
    await deleteFixture(API, id).catch(() => {});
}
console.log(ko === 0 ? '\nOK — les blocs se réordonnent au glisser-déposer' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
