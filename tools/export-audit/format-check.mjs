/**
 * Le format sélectionné correspond-il au rendu affiché ? Et l'aperçu défile-t-il ?
 *
 * Trois affirmations de l'utilisateur (2026-08-11) à vérifier plutôt qu'à supposer :
 *   « les formats ne sont pas du tout réellement représentatif des rendu »
 *   « pour tout rendu, empeche le scroll »
 *   « je n'ai pas accès aux différente page en mode ecran ? »
 *
 * On mesure, pour chaque mode et chaque format proposé : le ratio réel du canevas rendu, l'écart
 * avec le ratio demandé, et si la zone d'aperçu déborde (scroll).
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FORMATS = [
    { libelle: 'Carré (1:1)', attendu: 1 },
    { libelle: 'Paysage (16:9)', attendu: 16 / 9 },
    { libelle: 'Portrait (9:16)', attendu: 9 / 16 },
    { libelle: 'Standard (4:3)', attendu: 4 / 3 },
    { libelle: 'A4 (Document)', attendu: 1754 / 2480 },
];

const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 140)));

const mesurer = () => p.evaluate(() => {
    const el = document.querySelector('#export-maker-canvas') || document.querySelector('#export-maker-screen-canvas');
    if (!el) return { monte: false };
    const r = el.getBoundingClientRect();
    // Zone d'aperçu = premier ancêtre qui peut défiler.
    let sc = el.parentElement, deborde = null;
    while (sc && sc !== document.body) {
        const ov = getComputedStyle(sc).overflowY;
        if (ov === 'auto' || ov === 'scroll') { deborde = sc.scrollHeight - sc.clientHeight; break; }
        sc = sc.parentElement;
    }
    return {
        monte: true, quoi: el.id,
        largeur: Math.round(r.width), hauteur: Math.round(r.height),
        ratio: +(r.width / r.height).toFixed(3),
        deborde,
    };
});

let echecs = 0;
try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(5000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(4000);

    for (const mode of ['Écran', 'Fichier']) {
        console.log(`\n══ mode ${mode} ══`);
        await p.getByRole('button', { name: mode, exact: true }).first().click(); await sleep(2500);
        for (const f of FORMATS) {
            const bouton = p.locator('button', { hasText: f.libelle }).first();
            if (!(await bouton.count()) || await bouton.isDisabled()) { console.log(`  ${f.libelle.padEnd(16)} — indisponible pour ce template`); continue; }
            await bouton.click(); await sleep(3000);
            const m = await mesurer();
            if (!m.monte) { console.log(`  ${f.libelle.padEnd(16)} ✖ aperçu non monté`); echecs++; continue; }
            const ecart = Math.abs(m.ratio - f.attendu) / f.attendu;
            const verdict = ecart < 0.03 ? '✔' : '✖';
            if (verdict === '✖') echecs++;
            console.log(`  ${f.libelle.padEnd(16)} ${verdict} rendu ${m.largeur}×${m.hauteur} = ${m.ratio}`
                + ` (attendu ${f.attendu.toFixed(3)}, écart ${(ecart * 100).toFixed(0)}%)`
                + ` · ${m.quoi} · débordement ${m.deborde === null ? 'aucun conteneur défilant' : m.deborde + 'px'}`);
        }
    }
} finally {
    await b.close();
    await deleteFixture(API, id); if (upstreamId) await deleteFixture(API, upstreamId);
}
console.log(`\n${echecs === 0 ? '✔ tous les formats sont représentatifs' : `✖ ${echecs} format(s) non conformes`}`);
process.exit(echecs ? 1 : 0);
