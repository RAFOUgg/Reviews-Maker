/**
 * Quelle part du contenu d'une page échappe à `[data-module]` ?
 *
 * Hypothèse à vérifier (2026-08-11) : `FitToFill` mesurait 943px de contenu sur une page qui en
 * portait 2052. Les deux grandeurs ne mesurent pas la même chose — l'une ne voit que les blocs
 * marqués `[data-module]`, l'autre voit tout. Or c'est aussi sur `[data-module]` que repose le
 * budget de la pagination adaptative : tout bloc non marqué est du contenu que le paginateur ne
 * compte PAS, donc à la fois une page sous-remplie (le budget croit qu'il reste de la place) et un
 * débordement (elle n'y était pas).
 *
 * On rend chaque page réelle et on compare : hauteur totale du contenu, hauteur couverte par les
 * modules, et la liste de ce qui dépasse.
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const COMBOS = [
    ['Fiche Technique Détaillée', 'Paysage (16:9)'],
    ['Fiche Technique Détaillée', 'A4 (Document)'],
    ['Article de Blog', 'Paysage (16:9)'],
    ['Article de Blog', 'A4 (Document)'],
    ['Moderne Compact', 'Carré (1:1)'],
];

const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 140)));

/**
 * Pour la page affichée : le contenu non couvert par un `[data-module]`.
 *
 * « Couvert » = l'élément est un module, ou en descend, ou en contient un. Ce qui reste est du
 * contenu que ni le paginateur ni `FitToFill` ne voient.
 */
const analyser = () => p.evaluate(() => {
    const page = document.querySelector('.export-maker-page') || document.querySelector('#export-maker-canvas');
    if (!page) return { trouve: false };
    const modules = [...page.querySelectorAll('[data-module]')];
    const couvre = (el) => modules.some((m) => m === el || m.contains(el) || el.contains(m));

    const orphelins = [];
    const visiter = (el) => {
        for (const enfant of el.children) {
            if (couvre(enfant)) { if (!modules.includes(enfant)) visiter(enfant); continue; }
            const r = enfant.getBoundingClientRect();
            const t = (enfant.innerText || '').replace(/\s+/g, ' ').trim();
            if (r.height > 6) {
                orphelins.push({
                    hauteur: Math.round(r.height),
                    balise: enfant.tagName.toLowerCase(),
                    texte: t.slice(0, 44) || '(sans texte)',
                });
            }
        }
    };
    visiter(page);

    const pr = page.getBoundingClientRect();
    let basModules = 0;
    modules.forEach((m) => { basModules = Math.max(basModules, m.getBoundingClientRect().bottom - pr.top); });
    return {
        trouve: true,
        hauteurPage: Math.round(pr.height),
        contenuReel: Math.round(page.scrollHeight),
        basModules: Math.round(basModules),
        nbModules: modules.length,
        orphelins: orphelins.sort((a, b) => b.hauteur - a.hauteur).slice(0, 6),
        totalOrphelins: Math.round(orphelins.reduce((s, o) => s + o.hauteur, 0)),
    };
});

try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(5000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(4000);
    await p.getByRole('button', { name: 'Fichier', exact: true }).first().click(); await sleep(2500);

    for (const [tpl, fmt] of COMBOS) {
        await p.locator('button', { hasText: tpl }).first().click(); await sleep(2500);
        const bf = p.locator('button', { hasText: fmt }).first();
        if (!(await bf.count()) || await bf.isDisabled()) { console.log(`\n── ${tpl} · ${fmt} — indisponible`); continue; }
        await bf.click(); await sleep(4000);
        const a = await analyser();
        console.log(`\n── ${tpl} · ${fmt}`);
        if (!a.trouve) { console.log('   page non trouvée'); continue; }
        const part = a.totalOrphelins / Math.max(1, a.contenuReel) * 100;
        console.log(`   page ${a.hauteurPage}px · contenu ${a.contenuReel}px · bas du dernier module ${a.basModules}px · ${a.nbModules} modules`);
        console.log(`   contenu HORS module : ${a.totalOrphelins}px (${part.toFixed(0)}% du contenu)`);
        a.orphelins.forEach((o) => console.log(`      ${String(o.hauteur).padStart(5)}px  <${o.balise}>  ${o.texte}`));
    }
} finally {
    await b.close();
    await deleteFixture(API, id); if (upstreamId) await deleteFixture(API, upstreamId);
}
