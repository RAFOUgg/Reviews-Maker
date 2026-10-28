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
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5173');
const API = (process.env.AUDIT_API || 'http://localhost:3000');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { id, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'dense', { isPublic: 'true' });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
page.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

let dead = false;
const countRule = (res, rule) =>
    res.flat().reduce((n, p) => n + p.violations.filter((v) => v.rule === rule).length, 0);

try {
    // Parcours actuel (réécrit le 2026-10-28, L21) : le format du fichier se choisit dans la modale
    // d'export depuis le 2026-08-13 — l'ancienne version cliquait « A4 (Document) » dans le Studio,
    // où ce bouton n'existe plus, et mourait sur un timeout sans rien falsifier.
    await page.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await page.getByRole('button', { name: /^Aperçu$/ }).first().click();
    await sleep(3500);
    await page.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click();
    await sleep(2500);
    await page.getByRole('button', { name: /^Exporter$/ }).first().click();
    await page.getByText('Format du fichier').first().waitFor({ timeout: 30000 });
    await sleep(1500);
    await page.locator('button', { hasText: 'A4 (Document)' }).first().click();
    // Les pages hors écran de la modale sont celles que l'export photographie : attendre que la
    // mesure les ait réparties ET que le canevas de chaîne y soit monté (chargement asynchrone).
    await page.waitForFunction(() => {
        const t = document.body.textContent;
        return !/Mesure du contenu en cours/.test(t)
            && document.querySelector('.export-maker-page [data-module="productionChainCanvas"] .react-flow__node');
    }, null, { timeout: 60000 }).catch(() => {});
    await sleep(2000);

    await page.addScriptTag({ path: resolve(__dirname, 'auditRules.js') });

    // Pages photographiées : `.export-maker-page` quand la mesure pagine, sinon le canevas unique.
    const audit = () => page.evaluate(() => {
        const pages = [...document.querySelectorAll('.export-maker-page')];
        const cibles = pages.length ? pages : [document.getElementById('export-maker-canvas')].filter(Boolean);
        return cibles.map((el) => window.__exportAudit.auditRender(el, { paged: true }));
    });

    const before = await audit();
    if (!before.length) throw new Error('aucune page d’export montée — rien à auditer');
    console.log(`(${before.length} page(s) auditée(s))`);
    console.log('RÉFÉRENCE       → E4b:', countRule(before, 'E4b'), '· E2:', countRule(before, 'E2'));

    // Défaut 1 — un nœud du canevas poussé hors de son cadre (la coupure que E4b doit voir).
    const noeud = await page.evaluate(() => {
        const n = document.querySelector('.export-maker-page [data-module="productionChainCanvas"] .react-flow__node')
            || document.querySelector('[data-module="productionChainCanvas"] .react-flow__node');
        if (!n) return false;
        n.style.transform = (n.style.transform || '') + ' translateY(-400px)';
        return true;
    });
    if (!noeud) throw new Error('aucun nœud de chaîne de production rendu — E4b ne peut pas être falsifiée');
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
