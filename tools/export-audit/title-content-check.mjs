/**
 * UN TITRE PEUT-IL EXISTER SANS SON CONTENU ?
 *
 * « les templates utilisent parfois des titres par defaut, hors les titres devraient suivre les
 * element pas les templates (si je retire le contenus associé au titre il disparait) » (2026-08-14).
 *
 * Capture à l'appui : « PROCESSUS DE PRODUCTION » imprimé au-dessus du vide sur une review hash.
 *
 * MÉTHODE. Deux mesures complémentaires, parce qu'aucune ne suffit seule :
 *   1. sur une review NORMALE, chaque titre doit avoir du contenu sous lui — sinon on aurait pu
 *      « corriger » le défaut en supprimant les titres, ce qui n'est pas la demande ;
 *   2. sur une review dont un pipeline est DÉCLARÉ mais ne peut rien afficher (étapes sans repère
 *      temporel, trame vide), son titre doit être ABSENT. C'est le cas exact de la capture, et il
 *      est fabriqué ici plutôt que supposé.
 *
 * Le seuil d'orphelin n'est pas « zéro caractère » : avant correctif, le bloc vide portait encore
 * 2 caractères d'affordance (« -+ »). Un titre suivi de moins de 3 caractères et d'aucun média est
 * un titre seul.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEUIL_VIDE = 3;
let ko = 0;

const b = await chromium.launch();

/** Titres du rendu, avec le poids de ce qui se trouve sous chacun. */
async function titres(p) {
    return p.evaluate(() => {
        const root = document.querySelector('#export-maker-screen-canvas');
        if (!root) return [];
        const out = [];
        for (const h of root.querySelectorAll('h2, h3')) {
            const bloc = h.closest('[data-module], [data-order-id]') || h.parentElement?.parentElement;
            if (!bloc) continue;
            const clone = bloc.cloneNode(true);
            clone.querySelectorAll('h2, h3').forEach((n) => n.remove());
            out.push({
                titre: (h.innerText || '').replace(/\s+/g, ' ').trim(),
                module: bloc.getAttribute('data-module') || bloc.getAttribute('data-order-id') || '(sans id)',
                contenu: (clone.innerText || '').replace(/\s+/g, ' ').trim().length,
                media: clone.querySelectorAll('svg, img, canvas').length,
            });
        }
        return out;
    });
}

async function ouvrir(type, id) {
    const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
    p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
    await p.goto(`${BASE}/edit/${type}/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(5000);
    await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click(); await sleep(6000);
    return p;
}

try {
    // ── 1. Review normale : aucun titre ne doit être seul ───────────────────────────────────────
    const idNormal = await createFixture(API, 'hash', 'nominal', { isPublic: 'true' });
    try {
        const p = await ouvrir('hash', idNormal);
        const liste = await titres(p);
        console.log(`\n[review normale] ${liste.length} titre(s)`);
        if (liste.length < 4) { console.log(`KO — trop peu de titres rendus (${liste.length}), la mesure ne prouverait rien`); ko++; }
        for (const s of liste) {
            const seul = s.contenu < SEUIL_VIDE && s.media === 0;
            if (seul) { console.log(`  KO — « ${s.titre} » [${s.module}] est seul (texte=${s.contenu})`); ko++; }
            else console.log(`  ✔ « ${s.titre} » — ${s.contenu} car., ${s.media} média(s)`);
        }
    } finally { await deleteFixture(API, idNormal).catch(() => {}); }

    // ── 2. Pipeline déclaré mais inaffichable : son titre doit partir avec lui ───────────────────
    // Une étape existe (donc `extractPipelines` retient le pipeline, et le template lui attribue le
    // titre « Processus de production »), mais sans repère temporel et avec une trame vide :
    // `generatePipelineCells` ne produit aucune case, `inferTimelineConfig` n'a rien à déduire, et
    // `PipelineMiniGrid` se masque. Avant le 2026-08-14 le titre lui survivait.
    const idVide = await createFixture(API, 'hash', 'minimal', {
        isPublic: 'true',
        separationTimelineConfig: '{}',
        separationTimelineData: JSON.stringify([{ note: 'passe 1' }]),
    });
    try {
        const p = await ouvrir('hash', idVide);
        const liste = await titres(p);
        console.log('\n[pipeline déclaré mais vide]');
        const production = liste.find((s) => s.titre.toUpperCase().includes('PROCESSUS'));
        if (production) {
            console.log(`  KO — « ${production.titre} » s'affiche alors que son pipeline ne rend rien (texte=${production.contenu})`); ko++;
        } else {
            console.log('  ✔ « Processus de production » absent — le titre est parti avec son contenu');
        }
        for (const s of liste) {
            if (s.contenu < SEUIL_VIDE && s.media === 0) { console.log(`  KO — « ${s.titre} » [${s.module}] est seul`); ko++; }
        }
    } finally { await deleteFixture(API, idVide).catch(() => {}); }
} finally {
    await b.close();
}

console.log(ko === 0 ? '\nOK — aucun titre ne survit à son contenu' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
