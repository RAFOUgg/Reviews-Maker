/**
 * Une VIDÉO attachée à une étape de pipeline se voit-elle dans le rendu ?
 *
 * Mesuré le 2026-08-14, avant correctif : non, sur les trois surfaces à la fois — la modale de
 * détail d'étape la passait à une balise `<img>` (image cassée), le fond de case l'excluait
 * explicitement (`m.type !== 'video'`), et aucun des cinq templates ne contient de balise `<video>`.
 * La donnée existait en base et n'était visible que dans le formulaire.
 *
 * Trois mesures, sur une review qui porte RÉELLEMENT une photo d'étape (J22) ET une vidéo (J25) :
 *   1. la case de l'étape vidéo porte un repère visible — c'est la seule chose qu'un PNG puisse
 *      montrer, une balise `<video>` n'étant pas peinte par la rasterisation ;
 *   2. aucune balise `<img>` de la page ne pointe vers un fichier vidéo (le bug d'origine) ;
 *   3. le clic sur cette case ouvre la modale, et la modale contient un vrai lecteur `<video>`.
 *
 * La photo d'étape est vérifiée au passage : ce correctif ne doit pas l'avoir emportée.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIDEO_EXT = /\.(mp4|m4v|mov|webm|mkv|avi|3gp)(\?|$)/i;

const id = await createFixture(API, 'flower', 'dense');
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

try {
    // Même chemin que les autres sondes : `/edit/:type/:id` répond 403 sur une review créée par
    // l'API sans session, la page de review est la surface réellement mesurable.
    await p.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
    await sleep(6000);

    const etat = await p.evaluate((VID) => {
        const rx = new RegExp(VID);
        const cases = [...document.querySelectorAll('[data-testid^="pipeline-cell-"]')];
        const aUnFond = (c) => [c, ...c.querySelectorAll('*')]
            .some((n) => /url\(/.test(getComputedStyle(n).backgroundImage || ''));
        // Le repère vidéo est un glyphe textuel posé dans la case (cf. PipelineGridView).
        const aUnRepereVideo = (c) => [...c.querySelectorAll('span')]
            .some((s) => (s.textContent || '').trim() === '▶');
        const imgsVideo = [...document.querySelectorAll('img')]
            .map((i) => i.getAttribute('src') || '')
            .filter((src) => rx.test(src));
        return {
            cases: cases.length,
            avecPhoto: cases.filter(aUnFond).length,
            avecRepereVideo: cases.filter(aUnRepereVideo).length,
            indexRepere: cases.findIndex(aUnRepereVideo),
            imgsVideo,
        };
    }, VIDEO_EXT.source);

    console.log(`rendu : ${etat.cases} cases | ${etat.avecPhoto} avec photo | ${etat.avecRepereVideo} avec repère vidéo`);

    if (etat.cases === 0) { console.log('KO — aucune case de pipeline dans le rendu'); ko++; }
    if (etat.avecPhoto === 0) { console.log('KO — régression : les photos d’étape ont disparu'); ko++; }
    if (etat.avecRepereVideo === 0) { console.log('KO — l’étape qui porte une vidéo n’a aucun repère : rien ne la distingue d’une étape sans média'); ko++; }
    if (etat.imgsVideo.length > 0) {
        console.log(`KO — ${etat.imgsVideo.length} balise(s) <img> pointent vers une vidéo (image cassée) : ${etat.imgsVideo[0]}`);
        ko++;
    }

    // ── Clic sur l'étape vidéo → lecteur dans la modale ─────────────────────────────────────────
    if (etat.indexRepere >= 0) {
        await p.locator(`[data-testid^="pipeline-cell-"]`).nth(etat.indexRepere).click();
        await sleep(1200);
        const modale = await p.evaluate(() => {
            const d = document.querySelector('[role="dialog"]');
            if (!d) return null;
            const v = d.querySelector('video');
            return {
                titre: (d.textContent || '').slice(0, 80),
                video: v ? (v.getAttribute('src') || '') : null,
                controls: v ? v.hasAttribute('controls') : false,
                imgsVideo: [...d.querySelectorAll('img')].map((i) => i.getAttribute('src') || ''),
            };
        });
        if (!modale) { console.log('KO — le clic sur l’étape vidéo n’ouvre aucune modale'); ko++; }
        else if (!modale.video) { console.log('KO — la modale d’étape ne contient aucun lecteur <video>'); ko++; }
        else if (!modale.controls) { console.log('KO — lecteur vidéo sans contrôles : rien ne permet de le lire'); ko++; }
        else console.log(`OK — modale : lecteur <video src="${modale.video}"> avec contrôles`);
    }

    console.log(ko === 0 ? '\n== OK — la vidéo d’étape est visible et lisible' : `\n== ${ko} ÉCART(S)`);
} finally {
    await b.close();
    await deleteFixture(API, id);
}
process.exit(ko === 0 ? 0 : 1);
