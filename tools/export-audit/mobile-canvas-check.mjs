/**
 * Parcours TÉLÉPHONE des deux canevas d'édition (Chaîne de production et PhenoHunt).
 *
 * Reprend comme assertions les mesures qui ont motivé le plan `mobile-canvas-vertical-plan.md`
 * (relevées le 2026-08-14 en 390×844) :
 *   - Chaîne de production : canevas de 64px de large, 0 nœud monté — la colonne « Mes fiches
 *     techniques » était posée à côté du canevas sans point de rupture.
 *   - PhenoHunt : canevas plein écran, mais ~150px du bas mangés par la minimap et des contrôles
 *     de zoom occupant 87% de la largeur.
 *   - Volet latéral droit à 80vw : il recouvrait le graphe dès qu'un élément était sélectionné.
 *
 * Une mesure « ça tient » n'est pas un avis : chaque critère est chiffré et comparé au viewport.
 *
 * Usage : node tools/export-audit/mobile-canvas-check.mjs [--url=…] [--api=…]
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = ms => new Promise(r => setTimeout(r, ms));

let failures = 0;
const expect = (label, ok, detail) => {
    console.log(`  ${ok ? '✔' : '✖'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
};

const { id, chainId, treeId, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'nominal');
console.log('fixture', id, '· chaîne', chainId, '· arbre', treeId);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errs = [];
page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));

/** Géométrie réelle du canevas et de tout ce qui le recouvre. */
const geometry = () => page.evaluate(() => {
    const vw = window.innerWidth;
    const box = sel => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return null;
        return { w: Math.round(r.width), h: Math.round(r.height), pct: Math.round(r.width / vw * 100) };
    };
    const shell = document.querySelector('.graph-canvas-shell')?.getBoundingClientRect();
    // Le plus large des panneaux posés SUR le canevas — c'est lui qui dit si quelque chose déborde.
    const widest = Array.from(document.querySelectorAll('.react-flow__panel'))
        .map(el => ({ cls: (el.className || '').toString().slice(0, 40), w: Math.round(el.getBoundingClientRect().width) }))
        .sort((a, b) => b.w - a.w)[0] || null;
    return {
        vw,
        shellW: shell ? Math.round(shell.width) : 0,
        shellPct: shell ? Math.round(shell.width / vw * 100) : 0,
        nodes: document.querySelectorAll('.react-flow__node').length,
        infoPanel: box('.node-info-panel'),
        minimap: box('.react-flow__minimap'),
        controls: box('.react-flow__controls'),
        sheet: box('.canvas-sheet'),
        widest
    };
});

try {
    for (const [name, path] of [
        ['Chaîne de production', `/library/production-chains/${chainId}`],
        ['PhenoHunt', `/phenohunt?tree=${treeId}`]
    ]) {
        console.log(`\n▶ ${name}`);
        await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
        // `networkidle` ne garantit pas que le canevas a fini de monter ses nœuds : l'arbre/la
        // chaîne se charge en deux requêtes enchaînées. Sans cette attente explicite, une première
        // version de cette sonde a mesuré « 0 nœud, canevas 0px » sur PhenoHunt alors que la page
        // était parfaitement fonctionnelle — un faux échec, pas un défaut.
        await page.waitForFunction(() => document.querySelectorAll('.react-flow__node').length >= 2,
            { timeout: 20000 }).catch(() => {});
        await sleep(1200);

        const g = await geometry();
        expect('canevas en pleine largeur', g.shellPct >= 92, `${g.shellW}px = ${g.shellPct}% de ${g.vw}px`);
        expect('nœuds réellement montés', g.nodes >= 2, `${g.nodes} nœud(s)`);
        expect('aucun panneau plus large que le viewport', !g.widest || g.widest.w <= g.vw,
            g.widest ? `le plus large : ${g.widest.w}px (${g.widest.cls})` : 'aucun panneau');
        expect('minimap masquée sur téléphone', g.minimap === null, g.minimap ? `${g.minimap.w}x${g.minimap.h}` : 'absente');
        expect('contrôles de zoom compacts', !g.controls || g.controls.pct <= 25,
            g.controls ? `${g.controls.w}px = ${g.controls.pct}%` : 'absents');

        // Sélectionner un élément ne doit PLUS ouvrir un volet qui rogne le canevas.
        if (g.nodes === 0) { expect('canevas exploitable pour la suite', false, 'aucun nœud : sélection non mesurable'); continue; }
        await page.locator('.react-flow__node').first().click();
        await sleep(900);
        const after = await geometry();
        expect('sélection : pas de volet latéral', after.infoPanel === null,
            after.infoPanel ? `${after.infoPanel.w}px = ${after.infoPanel.pct}%` : 'aucun');
        expect('sélection : détail en feuille modale', !!after.sheet,
            after.sheet ? `${after.sheet.w}x${after.sheet.h} (≤85vh : ${after.sheet.h <= Math.round(844 * 0.85)})` : 'aucune feuille');
        expect('feuille : le canevas reste entier derrière', after.shellPct >= 92, `${after.shellPct}%`);
    }

    // Ajout d'un produit au doigt : le glisser HTML5 n'existe pas au toucher.
    console.log('\n▶ Ajout d\'un produit au doigt (Chaîne)');
    await page.goto(`${BASE}/library/production-chains/${chainId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(1000);
    const before = await page.locator('.react-flow__node').count();
    const fab = page.locator('.mobile-add-node-fab');
    expect('bouton d\'ajout présent', await fab.count() > 0);
    await fab.first().click();
    await sleep(1200);
    const drawer = page.locator('.canvas-drawer');
    expect('tiroir « Mes fiches techniques » ouvert', await drawer.count() > 0);
    const card = drawer.locator('[draggable="true"]').first();
    if (await card.count() > 0) {
        await card.click();
        await sleep(2000);
        const afterAdd = await page.locator('.react-flow__node').count();
        expect('un appui ajoute réellement le produit', afterAdd === before + 1, `${before} → ${afterAdd}`);
        const chainDoc = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
        expect('produit persisté côté serveur', (chainDoc.nodes || []).length === before + 1,
            `${(chainDoc.nodes || []).length} nœud(s) en base`);
    } else {
        expect('une fiche à ajouter dans le tiroir', false, 'liste vide — rien à mesurer');
    }

    // ── Gestes tactiles : sélection multiple sans clavier, menu en feuille ──────────────────
    console.log('\n▶ Gestes au doigt (PhenoHunt)');
    await page.goto(`${BASE}/phenohunt?tree=${treeId}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__node').length >= 2, { timeout: 20000 }).catch(() => {});
    await sleep(1200);

    const toggle = page.locator('.canvas-selection-toggle button');
    expect('bascule « Sélection » présente', await toggle.count() > 0);
    await toggle.click();
    await sleep(300);

    // Deux appuis SIMPLES (aucune touche enfoncée) doivent cumuler la sélection.
    const nodes = page.locator('.react-flow__node');
    await nodes.nth(0).click();
    await sleep(250);
    await nodes.nth(1).click();
    await sleep(500);
    const marked = await page.locator('.react-flow__node.graph-multi-selected').count();
    expect('deux appuis simples sélectionnent 2 éléments', marked === 2, `${marked} marqués`);
    const chipText = await page.locator('.graph-selection-chip').innerText().catch(() => '');
    expect('compteur de sélection affiché', /2 éléments/.test(chipText), chipText.slice(0, 50));

    // Appui long → menu contextuel, qui doit tenir en bas de l'écran et non au point de contact.
    const box = await nodes.nth(1).boundingBox();
    // Surtout PAS de tap avant : en mode Sélection, un appui BASCULE l'état du nœud — la première
    // version de cette sonde tapait le nœud « pour simuler le toucher » juste avant d'ouvrir le
    // menu, le désélectionnait donc, et concluait à tort que l'action de groupe manquait.
    await page.locator('.react-flow__node').nth(1).dispatchEvent('contextmenu', { clientX: box.x + 10, clientY: box.y + 10 });
    await sleep(600);
    const menu = await page.evaluate(() => {
        const el = document.querySelector('.context-menu');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
            w: Math.round(r.width), left: Math.round(r.x),
            bottomGap: Math.round(window.innerHeight - r.bottom),
            pct: Math.round(r.width / window.innerWidth * 100),
            group: /éléments/.test(el.innerText)
        };
    });
    expect('menu contextuel en feuille pleine largeur', !!menu && menu.pct >= 99 && menu.bottomGap <= 2,
        menu ? `${menu.w}px (${menu.pct}%), collé au bas : ${menu.bottomGap}px` : 'aucun menu');
    expect('le menu agit sur la sélection entière', !!menu && menu.group,
        menu?.group ? 'action de groupe proposée' : 'aucune action de groupe');

    expect('aucune erreur JS', errs.length === 0, errs.join(' | '));
} finally {
    await browser.close();
    await deleteFixture(API, id);
    if (upstreamId) await deleteFixture(API, upstreamId);
}

console.log(failures === 0 ? '\n✔ tout vert' : `\n✖ ${failures} échec(s)`);
process.exit(failures === 0 ? 0 : 1);
