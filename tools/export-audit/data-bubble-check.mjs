/**
 * Vérification AU CLIC de trois ajouts aux canevas d'ÉDITION (Chaîne de production + PhenoHunt) :
 *
 *   1. Sélection multiple Ctrl/⌘ + clic — plusieurs éléments réellement marqués simultanément.
 *   2. « Épingler les données en bulle » (menu contextuel) — une bulle ANCRÉE à l'élément, dont le
 *      corps contient de vraies lignes de données, pas une carte vide.
 *   3. La barre d'outils n'est plus un bandeau opaque posé sur le graphe : le conteneur est
 *      transparent et ce sont les BOUTONS qui portent le verre.
 *
 * Pourquoi mesurer plutôt que regarder le DOM statique : une bulle « créée » côté client mais
 * refusée par le serveur (corps trop volumineux, ancrage invalide) disparaît au rechargement
 * suivant. La sonde relit donc la chaîne/l'arbre par l'API après coup, comme un utilisateur qui
 * revient sur sa page.
 *
 * Usage : node tools/export-audit/data-bubble-check.mjs [--url=…] [--api=…]
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const expect = (label, ok, detail) => {
    console.log(`  ${ok ? '✔' : '✖'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
};

/** Un fond « transparent » se lit rgba(...,0) ou `transparent` selon le navigateur. */
const isTransparent = (color) => !color || color === 'transparent' || /rgba\([^)]*,\s*0\s*\)$/.test(color);

const { id: reviewId, chainId, treeId, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'nominal');
console.log('fixture', reviewId, '· chaîne', chainId || 'AUCUNE', '· arbre', treeId || 'AUCUN');
if (!chainId || !treeId) {
    console.error('✖ fixture sans chaîne ou sans arbre : la sonde ne mesurerait rien.');
    process.exit(1);
}

// Un individu PhenoHunt de fixture n'a que son nom. Sans données de breeding, la bulle serait
// vide et ne prouverait rien — on en renseigne un par l'API réelle, dans la forme exacte que
// NodeFormModal enregistre (genetics = objet JSON, clés de phenoNodeFields.js).
const tree = await (await fetch(`${API}/api/genetics/trees/${treeId}`)).json();
const genNodeId = tree?.nodes?.[0]?.id;
await fetch(`${API}/api/genetics/nodes/${genNodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        genetics: { sex: 'female', type: 'Hybride', breeder: 'ZZ-AUDIT Seeds', ratio: 60, generation: 'F2', seedType: 'feminized' },
        notes: 'Individu de contrôle pour la sonde bulle de données.'
    })
});

// Le cas qui compte vraiment pour la Chaîne : un nœud AVEC des cellules de pipeline attachées
// (c'est ce que porte un vrai nœud — jusqu'à 16 sur une chaîne réelle). Sans elles, la bulle ne
// prouverait rien de la résolution libellé + unité. Même forme que ce qu'écrit le canevas
// (`cellData` sur le nœud), donc mêmes validations serveur.
const chainDoc = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
const chainNodeId = (chainDoc.nodes || []).find(n => n.reviewId === reviewId)?.id;
await fetch(`${API}/api/production-chains/nodes/${chainNodeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        cellData: [{
            id: 'zz-audit-cell-1', attachedAt: new Date().toISOString(),
            pipelineType: 'culture', pipelineLabel: 'Culture', cellLabel: 'J4',
            // Clés RÉELLES d'une cellule de culture (LEGACY_CULTURE_FIELD_ALIASES,
            // chainCellPipelines.js). Première version de cette sonde : `ambientHumidity`, une clé
            // qui n'existe nulle part dans le repo — la bulle affichait donc « ambientHumidity 68 »
            // et la sonde a crié au bug alors que le code faisait exactement ce qu'il devait
            // (afficher la clé brute plutôt que perdre une donnée inconnue). Le piège du
            // vocabulaire deviné, cette fois dans l'outillage.
            sourceLabel: 'ZZ-AUDIT', data: { temperature: 24, humidity: 68, co2Ppm: 888, ph: 6.2 }
        }]
    })
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));

try {
    // ── 1. Chaîne de production ─────────────────────────────────────────────────────────────
    console.log('\nChaîne de production');
    await page.goto(`${BASE}/library/production-chains/${chainId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(800);

    const productNodes = page.locator('.react-flow__node:has(.cultivar-node)');
    const nodeCount = await productNodes.count();
    expect('canevas monté avec ses produits', nodeCount >= 2, `${nodeCount} nœuds`);

    // Design de la barre d'outils : conteneur effacé, boutons en verre.
    const toolbarStyle = await page.evaluate(() => {
        const panel = document.querySelector('.canvas-toolbar');
        const btn = document.querySelector('.toolbar-btn');
        if (!panel || !btn) return null;
        const p = getComputedStyle(panel), b = getComputedStyle(btn);
        return {
            panelBg: p.backgroundColor, panelBorder: p.borderTopWidth,
            btnBg: b.backgroundColor, btnRadius: b.borderRadius, btnBlur: b.backdropFilter
        };
    });
    expect('barre d\'outils présente', !!toolbarStyle);
    if (toolbarStyle) {
        expect('conteneur de barre d\'outils transparent (plus de bandeau opaque)',
            isTransparent(toolbarStyle.panelBg) && toolbarStyle.panelBorder === '0px', JSON.stringify(toolbarStyle.panelBg));
        expect('boutons en verre (fond + flou propres)',
            !isTransparent(toolbarStyle.btnBg) && toolbarStyle.btnBlur !== 'none',
            `${toolbarStyle.btnBg} · ${toolbarStyle.btnBlur} · r=${toolbarStyle.btnRadius}`);
    }

    // Sélection multiple Ctrl+clic
    await productNodes.nth(0).click();
    await sleep(200);
    await productNodes.nth(1).click({ modifiers: ['Control'] });
    await sleep(300);
    const multiCount = await page.locator('.react-flow__node.graph-multi-selected').count();
    expect('Ctrl+clic sélectionne 2 éléments à la fois', multiCount === 2, `${multiCount} marqués`);
    const chip = await page.locator('.graph-selection-chip').innerText().catch(() => '');
    expect('compteur de sélection affiché', /2 éléments/.test(chip), chip.slice(0, 60));

    // Menu contextuel → épingler pour toute la sélection
    await productNodes.nth(1).click({ button: 'right' });
    await page.waitForSelector('.context-menu', { timeout: 5000 });
    const pinItem = page.locator('.context-menu-item', { hasText: 'Épingler les données en bulle' });
    const pinLabel = await pinItem.first().innerText().catch(() => '');
    expect('entrée de menu portée à la sélection entière', /2 éléments/.test(pinLabel), pinLabel);

    const bubblesBefore = await page.locator('.chain-annotation-card').count();
    await pinItem.first().click();
    await sleep(1500);
    const bubblesAfter = await page.locator('.chain-annotation-card').count();
    expect('2 bulles épinglées d\'un coup', bubblesAfter - bubblesBefore === 2, `${bubblesBefore} → ${bubblesAfter}`);

    const bodyLines = await page.evaluate(() => Array.from(document.querySelectorAll('.chain-annotation-card'))
        .map(c => ({
            lines: c.querySelectorAll('.chain-annotation-line').length,
            first: c.querySelector('.chain-annotation-line')?.innerText.replace(/\s+/g, ' ').trim() || ''
        })));
    expect('les bulles portent de vraies données', bodyLines.every(b => b.lines > 0),
        bodyLines.map(b => `${b.lines} ligne(s) « ${b.first} »`).join(' | '));

    // La cellule attachée doit ressortir sous son intertitre, avec les libellés ET les unités du
    // formulaire — « Température : 24 °C », jamais « temperature : 24 » (le défaut de vocabulaire
    // deviné corrigé le 2026-08-13 sur la modale d'étape).
    const cellBubble = await page.evaluate(() => Array.from(document.querySelectorAll('.chain-annotation-card'))
        .map(c => ({
            groups: Array.from(c.querySelectorAll('.chain-annotation-group')).map(g => g.innerText),
            lines: Array.from(c.querySelectorAll('.chain-annotation-line')).map(l => l.innerText.replace(/\s+/g, ' ').trim())
        }))
        .find(c => c.groups.length > 0));
    // `innerText` renvoie le texte TEL QU'AFFICHÉ : l'intertitre est en capitales par CSS, la
    // comparaison doit donc être insensible à la casse (sinon faux échec sur « CULTURE — J4 »).
    expect('cellule attachée reprise sous son intertitre', !!cellBubble && /culture/i.test(cellBubble.groups[0]),
        cellBubble?.groups.join(', '));
    expect('libellés + unités résolus par le vocabulaire du formulaire',
        !!cellBubble
        && cellBubble.lines.some(l => /Température/.test(l) && /°C/.test(l))
        && cellBubble.lines.some(l => /Humidité/.test(l) && /%/.test(l))
        && !cellBubble.lines.some(l => /co2Ppm|humidity|temperature/.test(l)),
        cellBubble?.lines.join(' | '));

    const linkEdges = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.react-flow__edge'))
            .filter(e => (e.getAttribute('data-testid') || '').includes('annotation-link-')).length);
    expect('bulles reliées à leur nœud (trait de rattachement)', linkEdges >= 2, `${linkEdges} traits`);

    // Persistance réelle : c'est le serveur qui décide, pas le rendu optimiste.
    const chainAfter = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
    const persisted = (chainAfter.annotations || []).filter(a => a.nodeId);
    expect('bulles persistées côté serveur, ancrées à un nœud', persisted.length >= 2,
        `${persisted.length} annotation(s) · corps=${JSON.stringify(persisted[0]?.body || []).length} car.`);

    // ── 2. PhenoHunt ────────────────────────────────────────────────────────────────────────
    console.log('\nPhenoHunt');
    await page.goto(`${BASE}/phenohunt?tree=${treeId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(800);

    const genNode = page.locator(`.react-flow__node[data-id="${genNodeId}"]`);
    await genNode.click({ button: 'right' });
    await page.waitForSelector('.context-menu', { timeout: 5000 });
    const genPin = page.locator('.context-menu-item', { hasText: 'Épingler les données en bulle' });
    expect('entrée de menu présente sur un individu', await genPin.count() > 0);
    await genPin.first().click();
    await sleep(1500);

    const genBubble = await page.evaluate(() => {
        const card = document.querySelector('.chain-annotation-card');
        if (!card) return null;
        return {
            title: card.querySelector('.chain-annotation-title')?.innerText || '',
            groups: Array.from(card.querySelectorAll('.chain-annotation-group')).map(g => g.innerText),
            lines: Array.from(card.querySelectorAll('.chain-annotation-line')).map(l => l.innerText.replace(/\s+/g, ' ').trim())
        };
    });
    expect('bulle épinglée sur l\'arbre', !!genBubble, genBubble?.title);
    if (genBubble) {
        expect('champs de base résolus (sexe/type/breeder)',
            genBubble.lines.some(l => /Sexe/.test(l)) && genBubble.lines.some(l => /Breeder/.test(l)),
            genBubble.lines.slice(0, 4).join(' | '));
        // Les libellés viennent de phenoNodeFields.js, jamais de la clé brute : « F2 » doit
        // s'afficher via l'option du select, pas « generation: F2 ».
        expect('champs de breeding groupés et libellés par la config du formulaire',
            genBubble.groups.length > 0 && genBubble.lines.some(l => /Génération/.test(l)),
            `groupes: ${genBubble.groups.join(', ')}`);
    }

    const treeAfter = await (await fetch(`${API}/api/genetics/trees/${treeId}`)).json();
    const genPersisted = (treeAfter.annotations || []).filter(a => a.nodeId);
    expect('bulle persistée côté serveur, ancrée à l\'individu', genPersisted.length >= 1,
        `${genPersisted.length} annotation(s)`);

    expect('aucune erreur JS', errs.length === 0, errs.join(' | '));
} finally {
    await browser.close();
    await deleteFixture(API, reviewId);
    if (upstreamId) await deleteFixture(API, upstreamId);
}

console.log(failures === 0 ? '\n✔ tout vert' : `\n✖ ${failures} échec(s)`);
process.exit(failures === 0 ? 0 : 1);
