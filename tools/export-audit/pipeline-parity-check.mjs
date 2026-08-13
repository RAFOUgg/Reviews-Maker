/**
 * La grille de pipeline du RENDU se comporte-t-elle comme celle du FORMULAIRE ?
 *
 * Deux écarts signalés : « les images n'apparaissent pas » et « si je clique sur une cellule cela
 * ne m'affiche pas les infos contenues dedans ». On mesure les deux sur le rendu à l'écran, avec
 * une review qui porte réellement une photo d'étape et des mesures — et on compare au formulaire
 * sur la même review, puisque c'est la référence explicitement citée.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const API = 'http://localhost:3000';
const id = await createFixture(API, 'flower', 'dense');
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

const compteImages = () => p.evaluate(() => {
    const canvas = document.querySelector('#export-maker-screen-canvas') || document.querySelector('#export-maker-canvas') || document.body;
    if (!canvas) return null;
    const cases = [...canvas.querySelectorAll('[data-testid^="pipeline-cell-"]')];
    // Une photo d'étape est posée en fond de case (`background-image`), pas en <img>.
    const avecFond = cases.filter((c) => {
        const dedans = [c, ...c.querySelectorAll('*')];
        return dedans.some((n) => /url\(/.test(getComputedStyle(n).backgroundImage || ''));
    });
    return { cases: cases.length, avecPhoto: avecFond.length };
});

try {
    // `/edit/:type/:id` répond 403 sur une review créée par l'API sans session : le formulaire
    // retombe alors sur un brouillon vide et la sonde mesurerait le néant. On passe donc par la
    // page de review, le même chemin que la matrice de référence.
    await p.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);

    const rendu = await compteImages();
    if (!rendu) throw new Error('aucun canevas de rendu — la sonde ne mesure rien');
    console.log(`rendu : ${rendu.cases} cases, ${rendu.avecPhoto} avec photo`);
    // La fixture attache une photo à l'étape J22 (`fixtures.mjs`) : une case au moins doit la porter.
    if (rendu.cases === 0) { console.log('KO — aucune case de pipeline dans le rendu'); ko++; }
    else if (rendu.avecPhoto === 0) { console.log('KO — les photos d’étape n’apparaissent pas dans le rendu'); ko++; }

    // ── Clic sur une case documentée ────────────────────────────────────────────────────────────
    // On ne compte pas des caractères (la page en gagne et en perd pour d'autres raisons) : on
    // cherche la RÉVÉLATION elle-même — la modale de détail d'étape, ou le panneau sous la grille.
    const revele = () => p.evaluate(() => {
        const modale = document.querySelector('[role="dialog"]');
        // Détail court : il s'affiche sous la grille, dans le bloc du pipeline lui-même.
        const cases = [...document.querySelectorAll('[data-testid^="pipeline-cell-"]')];
        let bloc = cases[0];
        while (bloc && !/documentées/.test(bloc.innerText || '')) bloc = bloc.parentElement;
        const t = (bloc?.innerText || '').replace(/\s+/g, ' ');
        return { modale: Boolean(modale), longueurBloc: t.length, queue: t.slice(-110) };
    });

    const cible = await p.evaluate(() => {
        const cases = [...document.querySelectorAll('[data-testid^="pipeline-cell-"]')].filter((n) => /\d/.test(n.innerText || ''));
        if (!cases.length) return null;
        const n = cases[Math.min(3, cases.length - 1)];
        n.scrollIntoView({ block: 'center' });
        const r = n.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, texte: n.innerText.replace(/\s+/g, ' ').slice(0, 40) };
    });
    if (!cible) { console.log('KO — aucune case documentée dans le rendu'); ko++; }
    else {
        const avantClic = await revele();
        console.log(`avant clic : ${JSON.stringify(avantClic)}`);
        await p.mouse.click(cible.x, cible.y); await sleep(1500);
        const apres = await revele();
        console.log(`après clic sur « ${cible.texte} » : ${JSON.stringify(apres)}`);
        // Le détail doit s'ouvrir en MODALE : le panneau en ligne déplaçait le contenu sous lui et
        // sa hauteur n'entrait dans aucune mesure de pagination. « les contenus doivent s'afficher
        // en modale pop-up » (2026-08-13).
        if (!apres.modale) { console.log('KO — le détail d’étape ne s’ouvre pas en modale'); ko++; }
        // Le détail doit être écrit comme le formulaire l'écrit : pas de clé brute anglicisée, pas
        // de bookkeeping (`cellLabel`). C'est l'écart de vocabulaire signalé, pas un détail cosmétique.
        const texteModale = await p.evaluate(() => (document.querySelector('[role="dialog"]')?.innerText || '').replace(/\s+/g, ' '));
        console.log(`modale : ${texteModale.slice(0, 140)}`);
        const brut = (texteModale.match(/Co2 ppm|Cell label|Temperature|Humidity|Ph/g) || []);
        if (brut.length) { console.log(`KO — clés brutes dans le détail : ${brut.join(', ')}`); ko++; }
    }

    await p.screenshot({ path: 'tools/export-audit/reports/pipeline-parity.png' });
} finally {
    await b.close();
    await deleteFixture(API, id).catch(() => {});
}
console.log(ko === 0 ? '\nOK — parité formulaire/rendu' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
