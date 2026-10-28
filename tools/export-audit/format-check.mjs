/**
 * Le format sélectionné correspond-il au fichier produit ?
 *
 * Affirmation de l'utilisateur (2026-08-11) à vérifier plutôt qu'à supposer :
 *   « les formats ne sont pas du tout réellement représentatif des rendu »
 *
 * RÉÉCRITE LE 2026-10-28 (L21). L'ancienne version cherchait les boutons « Écran / Fichier » et les
 * formats dans l'éditeur. Depuis le 2026-08-13, l'éditeur (Studio) n'affiche plus qu'UN rendu
 * d'écran (`#export-maker-screen-canvas`) et le format du FICHIER se choisit dans la modale
 * d'export (`RatioSelector`, `ExportModal.jsx`) — la sonde échouait donc sur des boutons disparus.
 *
 * Mesures, pour chaque format proposé par le template (les formats inertes sont ignorés) :
 *   1. le Studio monte bien son canevas d'écran avant l'export ;
 *   2. la modale annonce le format choisi (« Format : X ») ;
 *   3. l'aperçu miniature de la modale a le ratio demandé (±3 %) ;
 *   4. le canevas RÉELLEMENT photographié (hors écran : `#export-maker-canvas` ou les
 *      `.export-maker-page` quand la mesure pagine) a les dimensions exactes du format (±2 px).
 * Deux templates sont parcourus pour couvrir les 5 formats : la Fiche Technique Détaillée
 * (16:9, 4:3, A4) et Moderne Compact (1:1, 16:9, 9:16).
 *
 * Usage : node tools/export-audit/format-check.mjs   (ou via `run-all.mjs`)
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const BASE = (process.env.AUDIT_BASE || 'http://localhost:5173'), API = (process.env.AUDIT_API || 'http://localhost:3000');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Dimensions de `RATIO_DIMENSIONS` (`client/src/utils/exportMakerHelpers.js`), reprises, pas devinées.
const FORMATS = [
    { id: '1:1', libelle: 'Carré (1:1)', w: 800, h: 800 },
    { id: '16:9', libelle: 'Paysage (16:9)', w: 1920, h: 1080 },
    { id: '9:16', libelle: 'Portrait (9:16)', w: 1080, h: 1920 },
    { id: '4:3', libelle: 'Standard (4:3)', w: 1600, h: 1200 },
    { id: 'A4', libelle: 'A4 (Document)', w: 1754, h: 2480 },
];
const TEMPLATES = ['Fiche Technique Détaillée', 'Moderne Compact'];

const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense', { isPublic: 'true' });
console.log(`review ${id}`);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 140)));

const mesurer = () => p.evaluate(() => {
    const mini = document.querySelector('#export-maker-canvas-mini');
    const r = mini?.getBoundingClientRect();
    // Canevas de capture : ceux que `handleExport` photographie réellement.
    const pages = [...document.querySelectorAll('.export-maker-page')];
    const capture = pages.length ? pages : [document.querySelector('#export-maker-canvas')].filter(Boolean);
    return {
        annonce: (document.body.textContent.match(/Format : ?(\d+:\d+|A4)/) || [])[1] || null,
        mini: r && r.height ? { w: Math.round(r.width), h: Math.round(r.height), ratio: r.width / r.height } : null,
        capture: capture.map((el) => ({ w: el.offsetWidth, h: el.offsetHeight })),
        pagination: (document.body.textContent.match(/(\d+) pages — réparties|Une seule page suffit|Désactivée — tout sur une seule page|Mesure du contenu en cours/) || [])[0] || null,
    };
});

async function attendreMesure() {
    // La mesure de pagination repart à chaque changement de format et ne démarre pas dans le même
    // tick que le clic : on lui laisse 3 s pour s'annoncer, puis on attend qu'elle ait conclu. Un
    // template mono-page (Moderne Compact) n'annonce aucune pagination : seul compte alors le canevas.
    const debut = Date.now();
    let m = await mesurer();
    while (Date.now() - debut < 45000) {
        const enCours = m.pagination && /Mesure du contenu/.test(m.pagination);
        if (!enCours && m.capture.length && Date.now() - debut > 3000) break;
        await sleep(1000);
        m = await mesurer();
    }
    return m;
}

let echecs = 0, testes = 0;
const ko = (msg) => { console.log(`  ✖ ${msg}`); echecs++; };
try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(2500);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(4000);

    for (const tpl of TEMPLATES) {
        console.log(`\n══ ${tpl} ══`);
        await p.locator('button', { hasText: tpl }).first().click(); await sleep(2500);
        const ecran = await p.locator('#export-maker-screen-canvas').count();
        if (!ecran) ko('le Studio ne monte pas son canevas d’écran (#export-maker-screen-canvas)');

        await p.getByRole('button', { name: /^Exporter$/ }).first().click();
        await p.getByText('Format du fichier').first().waitFor({ timeout: 30000 });
        await sleep(1500);

        for (const f of FORMATS) {
            const bouton = p.locator('button', { hasText: f.libelle }).first();
            if (!(await bouton.count()) || await bouton.isDisabled()) {
                console.log(`  ${f.libelle.padEnd(16)} — indisponible pour ce template`);
                continue;
            }
            await bouton.click(); await sleep(1500);
            const m = await attendreMesure();
            testes++;
            const attendu = f.w / f.h;
            const ligne = [`  ${f.libelle.padEnd(16)}`];
            let ok = true;
            if (m.annonce !== f.id) { ok = false; ligne.push(`annonce « ${m.annonce} »`); }
            if (!m.mini) { ok = false; ligne.push('aperçu miniature absent'); }
            else {
                const ecart = Math.abs(m.mini.ratio - attendu) / attendu;
                ligne.push(`aperçu ${m.mini.w}×${m.mini.h} (écart ${(ecart * 100).toFixed(1)} %)`);
                if (ecart >= 0.03) ok = false;
            }
            if (!m.capture.length) { ok = false; ligne.push('aucun canevas de capture'); }
            else {
                const faux = m.capture.filter((c) => Math.abs(c.w - f.w) > 2 || Math.abs(c.h - f.h) > 2);
                ligne.push(`capture ${m.capture.length} page(s) ${m.capture[0].w}×${m.capture[0].h} (attendu ${f.w}×${f.h})`);
                if (faux.length) ok = false;
            }
            ligne.push(m.pagination || '');
            console.log(`${ligne[0]} ${ok ? '✔' : '✖'} ${ligne.slice(1).join(' · ')}`);
            if (!ok) echecs++;
        }

        // Fermer la modale avant de changer de template (Échap, puis repli sur « Annuler »).
        await p.keyboard.press('Escape'); await sleep(1000);
        if (await p.getByText('Format du fichier').count()) {
            const annuler = p.getByRole('button', { name: /^Annuler$/ }).last();
            if (await annuler.count()) { await annuler.click(); await sleep(1000); }
        }
    }
    if (testes < 5) ko(`seulement ${testes} combinaison(s) mesurée(s) — au moins 5 attendues (formats inertes partout ?)`);
} catch (e) {
    ko(e.message);
} finally {
    await b.close();
    await deleteFixture(API, id); if (upstreamId) await deleteFixture(API, upstreamId);
}
console.log(`\n${echecs === 0 ? `✔ ${testes} combinaison(s) : le format choisi est celui du fichier` : `✖ ${echecs} échec(s)`}`);
process.exit(echecs ? 1 : 0);
