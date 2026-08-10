/**
 * FALSIFICATION des règles d'audit — E4b et E2 savent-elles encore voir un défaut RÉEL ?
 *
 * Les deux ont été assouplies le 2026-08-10 parce qu'elles rapportaient des défauts qui n'existaient
 * pas sur le canevas de chaîne de production d'un export A4 :
 *
 *   • E4b lisait `scrollHeight` (343px pour 258px) alors que ces 343px sont la boîte TRANSFORMÉE du
 *     conteneur VIDE de React Flow : -88,79 + 258 × 1,675 = 343,4, au pixel près. Les nœuds, eux,
 *     occupaient 13→244 dans 258 — ils tenaient entièrement. Un viewport zoom/pan a par
 *     construction une boîte de défilement plus grande que lui : c'est son mécanisme.
 *   • E2 lisait la taille DÉCLARÉE (9px) en ignorant le zoom `fitView` du canevas (×1,675), soit
 *     15,1px réellement rendus — au-dessus du plancher de 12px.
 *
 * Or une règle qu'on adoucit sans la falsifier est une règle potentiellement MORTE : elle rendrait
 * « 0 erreur » par aveuglement plutôt que par propreté, et c'est indiscernable dans un rapport.
 * Ce script fabrique donc, dans la page réelle, les deux défauts que ces règles doivent voir, et
 * exige qu'elles les voient. À relancer après toute retouche de `auditRules.js`.
 *
 * Sortie attendue :
 *   RÉFÉRENCE       → E4b: 0 · E2: 0
 *   NŒUD HORS CADRE → E4b: 1 | Canevas qui coupe son contenu : « … » déborde de …px
 *   TEXTE À 6px     → E2 : 1 | Police à 6.0px — plancher 12px
 *
 * Usage : node tools/export-audit/rule-falsification-check.mjs   (les deux serveurs doivent tourner)
 */
import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
page.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

let dead = false;
const countRule = (res, rule) =>
    res.flat().reduce((n, p) => n + p.violations.filter((v) => v.rule === rule).length, 0);

try {
    await page.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(2200);
    for (const name of [/^Aperçu$/, /^Exporter$/]) {
        const t = page.getByRole('button', { name }).first();
        if (await t.count()) { await t.click(); await sleep(3500); }
        if (await page.locator('text=Choix du Template').count()) break;
    }
    await page.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click();
    await sleep(1200);
    await page.locator('button', { hasText: 'A4 (Document)' }).first().click();
    await sleep(2500);
    await page.getByRole('button', { name: /^Appliquer$/ }).first().click();
    await sleep(2500);

    await page.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.getByRole('button', { name: /^Exporter$/ }).first().click();
    await sleep(9000);

    await page.addScriptTag({ path: resolve(__dirname, 'auditRules.js') });

    const audit = () => page.evaluate(() =>
        [...document.querySelectorAll('.export-maker-page')]
            .map((el) => window.__exportAudit.auditRender(el, { paged: true })));

    const before = await audit();
    console.log('RÉFÉRENCE       → E4b:', countRule(before, 'E4b'), '· E2:', countRule(before, 'E2'));

    // Défaut 1 — un nœud du canevas poussé hors de son cadre (la coupure que E4b doit voir).
    await page.evaluate(() => {
        const n = document.querySelector('[data-module="productionChainCanvas"] .react-flow__node');
        n.style.transform = (n.style.transform || '') + ' translateY(-400px)';
    });
    const cut = await audit();
    console.log('NŒUD HORS CADRE → E4b:', countRule(cut, 'E4b'),
        '|', cut.flat().flatMap((p) => p.violations).find((v) => v.rule === 'E4b')?.message || '—');

    // Défaut 2 — un texte réellement minuscule, hors de toute zone zoomée.
    const target = await page.evaluate(() => {
        // Une FEUILLE porteuse de texte, hors de toute zone zoomée : poser la taille sur un
        // conteneur ne prouve rien, ses enfants redéclarent la leur.
        for (const el of document.querySelectorAll('.export-maker-page *')) {
            if (el.closest('.react-flow')) continue;
            if (el.children.length) continue;
            const t = (el.textContent || '').trim();
            if (t.length < 4) continue;
            el.style.setProperty('font-size', '6px', 'important');
            return t.slice(0, 30);
        }
        return null;
    });
    console.log('  (cible du test E2 :', JSON.stringify(target), ')');
    const tiny = await audit();
    console.log('TEXTE À 6px     → E2 :', countRule(tiny, 'E2'),
        '|', tiny.flat().flatMap((p) => p.violations).find((v) => v.rule === 'E2')?.message || '—');

    // Sortie non nulle si une règle est restée muette : c'est ce qui rend ce script utilisable
    // comme garde-fou et non comme simple affichage.
    if (countRule(before, 'E4b') || countRule(before, 'E2')) {
        console.log('\n✖ la référence n’est pas propre — les défauts fabriqués ne prouvent plus rien');
        dead = true;
    }
    if (countRule(cut, 'E4b') === 0) { console.log('\n✖ E4b est MUETTE sur un nœud hors cadre'); dead = true; }
    if (countRule(tiny, 'E2') === 0) { console.log('\n✖ E2 est MUETTE sur un texte à 6px'); dead = true; }
    if (!dead) console.log('\n✔ les deux règles voient encore les défauts qu’elles doivent voir');
} finally {
    await browser.close();
    await deleteFixture(API, id);
    if (upstreamId) await deleteFixture(API, upstreamId);
}
process.exit(dead ? 1 : 0);
