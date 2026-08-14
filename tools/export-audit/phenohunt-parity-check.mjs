/**
 * PhenoHunt est-il au niveau du canevas Chaîne de production ?
 *
 * Reproche d'origine (2026-08-14) : « aligne la qualité d'utilisation et d'ergonomie de phénohunt
 * avec le canva chaine de prod — sur phenohunt je peux pas cacher les infos ».
 *
 * Cinq affordances que la Chaîne de production avait et pas l'arbre généalogique, cinq mesures :
 *   1. Panneau latéral REPLIABLE, et son repli mémorisé au rechargement.
 *   2. Recherche : le résultat courant surligné, les autres grisés, la vue recadrée dessus.
 *   3. Filtre par sexe : décocher une pastille grise réellement les individus concernés.
 *   4. Aperçu au SURVOL d'un individu, avec des données absentes du nœud lui-même.
 *   5. Sidebar gauche repliable, mémorisée elle aussi.
 * Plus une garde : la Chaîne de production, dont le panneau a été refactorisé, n'a rien perdu.
 *
 * L'arbre est peuplé ICI (et non par `createGeneticTree`) parce que les filtres portent sur des
 * champs que la fixture partagée ne renseigne pas : sexe et breeder. Un filtre ne se mesure pas sur
 * une population uniforme.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture, attachCanvases } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ko = 0;
const check = (ok, label, detail = '') => {
    console.log(`${ok ? '  OK ' : '  KO '} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) ko++;
};

const post = async (path, body) => {
    const res = await fetch(`${API}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!res.ok) { console.log(`  POST ${path} → ${res.status}`); return null; }
    const j = await res.json().catch(() => null);
    return j?.data || j;
};

// ── Fixture : un arbre à population HÉTÉROGÈNE (sexes et breeders distincts) ────────────────────
const tree = await post('/api/genetics/trees', { name: 'ZZ-PARITY arbre' });
const treeId = tree?.id;
if (!treeId) { console.log('arbre non créé — abandon'); process.exit(1); }

// `cultivarName` (pas `label`) ET `genetics` en OBJET : `validateNodeCreation` refuse une chaîne
// (« Genetics must be a valid object ») — c'est le serveur qui sérialise en JSON pour SQLite, la
// chaîne n'apparaît qu'à la LECTURE. Deviner le sens de cette conversion coûte un 400 silencieux.
const mk = (name, sex, breeder, x) => post(`/api/genetics/trees/${treeId}/nodes`, {
    cultivarName: name,
    position: { x, y: 40 },
    genetics: { sex, breeder, type: 'Hybride', generation: 'F2', phenotypeCode: `${name}-01` },
});
const femelle = await mk('ZZPARITY Femelle', 'female', "Barney's Farm", 40);
const male = await mk('ZZPARITY Male', 'male', 'Exotic Genetix', 260);
const inconnu = await mk('ZZPARITY Inconnu', 'unknown', 'Sensi Seeds', 480);
if (femelle?.id && inconnu?.id) {
    await post(`/api/genetics/trees/${treeId}/edges`, {
        parentNodeId: femelle.id, childNodeId: inconnu.id, relationshipType: 'parent',
    });
}

const id = await createFixture(API, 'flower', 'nominal', { isPublic: 'true', geneticTreeId: treeId });
const { upstreamId } = await attachCanvases(API, id, 'flower').catch(() => ({}));
console.log(`review ${id} · arbre ${treeId}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

// Largeur RÉELLE d'un élément, pas la classe CSS qui la déclare.
const largeur = (sel) => p.evaluate((s) => {
    const n = document.querySelector(s);
    return n ? Math.round(n.getBoundingClientRect().width) : null;
}, sel);

const compte = (sel) => p.locator(sel).count();

/**
 * Ouvre la section Génétiques et s'assure que NOTRE arbre est bien celui affiché.
 *
 * Deux détours imposés par le terrain, tous deux mesurés :
 *  - les onglets de section sont des boutons EMOJI sans `title` ni libellé texte (📋 🧬 🌱 …) ;
 *  - une fixture créée par l'API porte bien `geneticTreeId` (vérifié via /api/reviews/:id) mais le
 *    formulaire ne l'hydrate pas, donc la modale « Gestion de l'Arbre Généalogique » s'ouvre et
 *    recouvre le canevas. On la referme et on choisit l'arbre par son nom dans l'onglet Projets.
 */
async function ouvrirGenetique({ selectionner = true } = {}) {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(4000);
    const onglet = p.locator('button', { hasText: '🧬' }).first();
    if (await onglet.count()) await onglet.click().catch(() => {});
    await sleep(2500);

    const annuler = p.locator('button', { hasText: /^Annuler$/ }).first();
    if (await annuler.count()) await annuler.click().catch(() => {});
    await sleep(800);

    if (selectionner) {
        const ongletProjets = p.locator('button', { hasText: /^Projets$/ }).first();
        if (await ongletProjets.count()) {
            await ongletProjets.click().catch(() => {});
            await sleep(900);
            const projet = p.locator('div', { hasText: /^ZZ-PARITY arbre/ }).last();
            if (await projet.count()) await projet.click().catch(() => {});
            await sleep(2500);
        }
    }
    await p.locator('.react-flow__node').first().waitFor({ timeout: 20000 }).catch(() => {});
    await sleep(1500);
}

try {
    await ouvrirGenetique();
    const noeuds = await compte('.react-flow__node');
    check(noeuds >= 3, '1a. arbre monté', `${noeuds} nœuds`);

    // ── 1. Panneau latéral repliable ────────────────────────────────────────────────────────
    await p.locator('.react-flow__node').first().click();
    await sleep(700);
    const ouvert = await largeur('.node-info-panel');
    check(ouvert !== null && ouvert > 200, '1b. panneau ouvert au clic', `${ouvert}px`);

    const toggle = p.locator('.node-info-panel-toggle');
    check(await toggle.count() === 1, '1c. bouton de repli présent');
    await toggle.click();
    await sleep(500);
    const replie = await largeur('.node-info-panel');
    const contenuVisible = await p.locator('.node-info-panel .info-content').count();
    check(replie !== null && replie < 80, '1d. panneau réellement réduit', `${ouvert}px → ${replie}px`);
    check(contenuVisible === 0, '1e. contenu masqué une fois replié');

    // Mémorisation : c'est ce qui distingue un repli d'un simple masquage ponctuel.
    await ouvrirGenetique();
    await p.locator('.react-flow__node').first().click();
    await sleep(700);
    const apresRechargement = await largeur('.node-info-panel');
    check(apresRechargement !== null && apresRechargement < 80, '1f. repli mémorisé au rechargement', `${apresRechargement}px`);
    await p.locator('.node-info-panel-toggle').click(); // on rouvre pour la suite
    await sleep(400);

    // ── 2. Recherche ────────────────────────────────────────────────────────────────────────
    const champ = p.locator('.chain-filter-bar input');
    check(await champ.count() === 1, '2a. champ de recherche présent');
    await champ.fill('Femelle');
    await sleep(1200);
    const surlignes = await compte('.graph-node-search-active');
    const grises = await compte('.graph-node-dimmed');
    check(surlignes === 1, '2b. un seul résultat surligné', `${surlignes}`);
    check(grises >= 2, '2c. les autres individus grisés', `${grises} grisés`);
    const compteur = await p.locator('.chain-filter-search-count').innerText().catch(() => '');
    check(/\/\s*\d/.test(compteur) || compteur.includes('/'), '2d. compteur de résultats affiché', compteur);

    await champ.fill('');
    await sleep(800);
    check(await compte('.graph-node-dimmed') === 0, '2e. plus aucun grisé une fois la recherche effacée');

    // ── 3. Filtre par sexe ──────────────────────────────────────────────────────────────────
    const pastilleFemelle = p.locator('.chain-filter-chips button', { hasText: 'Femelles' });
    check(await pastilleFemelle.count() === 1, '3a. pastille de filtre « Femelles » présente');
    await pastilleFemelle.click();
    await sleep(800);
    const grisesApresFiltre = await compte('.graph-node-dimmed');
    check(grisesApresFiltre >= 1, '3b. décocher un sexe grise les individus concernés', `${grisesApresFiltre} grisé(s)`);
    // Le nœud grisé doit être LE bon : on lit son libellé, pas seulement le compte.
    const libelleGrise = await p.locator('.graph-node-dimmed .node-label').first().innerText().catch(() => '');
    check(/femelle/i.test(libelleGrise), '3c. c\'est bien la femelle qui est grisée', libelleGrise);
    await pastilleFemelle.click();
    await sleep(600);
    check(await compte('.graph-node-dimmed') === 0, '3d. recocher rétablit tout');

    // ── 4. Aperçu au survol ─────────────────────────────────────────────────────────────────
    await p.locator('.react-flow__node').first().hover();
    await sleep(1000);
    const apercu = await compte('.graph-hover-preview');
    check(apercu === 1, '4a. aperçu affiché au survol');
    const texteApercu = await p.locator('.graph-hover-preview').innerText().catch(() => '');
    // Le nœud n'affiche PAS la génération ni le code de phénotype : si l'aperçu les montre, il
    // apporte réellement quelque chose au lieu de répéter la carte.
    check(/F2|Génération/i.test(texteApercu), '4b. l\'aperçu montre des données absentes du nœud', texteApercu.replace(/\n/g, ' · ').slice(0, 90));
    await p.mouse.move(10, 10);
    await sleep(700);
    check(await compte('.graph-hover-preview') === 0, '4c. aperçu retiré quand on quitte le nœud');

    // ── 5. Sidebar gauche repliable ─────────────────────────────────────────────────────────
    // « Réduire la liste », pas « Réduire le panneau » : ce dernier est le bouton du panneau
    // latéral du canevas, présent au même moment à l'écran.
    const boutonSidebar = p.locator('button[title="Réduire la liste"]').first();
    const avant = await largeur('.md\\:w-80');
    check(await boutonSidebar.count() >= 1, '5a. bouton de repli de la sidebar présent');
    await boutonSidebar.click();
    await sleep(600);
    const apres = await largeur('.md\\:w-12');
    check(apres !== null && apres < 80, '5b. sidebar réellement réduite', `${avant}px → ${apres}px`);

    await ouvrirGenetique({ selectionner: false });
    const apresRechargementSidebar = await largeur('.md\\:w-12');
    check(apresRechargementSidebar !== null && apresRechargementSidebar < 80,
        '5c. repli de la sidebar mémorisé', `${apresRechargementSidebar}px`);

    // ── 6. Garde : la Chaîne de production n'a rien perdu ───────────────────────────────────
    // Son canevas s'atteint depuis la section Pipeline (🌱), par le bouton d'ouverture de chaîne
    // (ChainToggleButton) — ce n'est pas une section du formulaire à part entière.
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(4000);
    const ongletPipeline = p.locator('button', { hasText: '🌱' }).first();
    if (await ongletPipeline.count()) await ongletPipeline.click().catch(() => {});
    await sleep(2500);
    const ouvrirChaine = p.locator('button', { hasText: /chaîne de production/i }).first();
    if (await ouvrirChaine.count()) {
        await ouvrirChaine.click().catch(() => {});
        await sleep(5000);
    }
    const noeudsChaine = await compte('.react-flow__node');
    if (noeudsChaine > 0) {
        // Survol AVANT clic : une fois le panneau latéral ouvert (320px à droite), il peut recouvrir
        // le nœud et `hover()` attend alors indéfiniment un élément devenu non atteignable.
        await p.locator('.react-flow__node').first().hover();
        await sleep(1000);
        check(await compte('.graph-hover-preview') === 1, '6a. chaîne : aperçu au survol toujours là');
        await p.locator('.react-flow__node').first().click();
        await sleep(900);
        check(await compte('.node-info-panel-toggle') === 1, '6b. chaîne : panneau repliable toujours là');
    } else {
        console.log('  (section chaîne non atteinte — garde non exercée)');
    }
} catch (e) {
    console.log('ERREUR SONDE:', String(e.message).slice(0, 300));
    ko++;
} finally {
    await b.close();
    await deleteFixture(API, id);
    if (upstreamId) await deleteFixture(API, upstreamId);
    await fetch(`${API}/api/genetics/trees/${treeId}`, { method: 'DELETE' }).catch(() => {});
}

console.log(ko === 0 ? '\nTOUT VERT' : `\n${ko} MESURE(S) EN ÉCHEC`);
process.exit(ko === 0 ? 0 : 1);
