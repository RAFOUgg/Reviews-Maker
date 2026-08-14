/**
 * Les formulaires sont-ils réellement utilisables sur un téléphone ?
 *
 * Quatre reproches précis (2026-08-14), quatre mesures :
 *   1. « pipeline avec des scroll inutile »  → aucun conteneur défilant IMBRIQUÉ dans la page.
 *   2. « phenohunt inutilisable »            → hauteur réelle du canevas généalogique.
 *   3. « questions et jauge seul en haut avec pleins de vide » → position du contenu du mode auto.
 *   4. « le choix des goûts, odeur et effets » en carrousel → un rail horizontal, pas une grille.
 *
 * On mesure sur un vrai viewport de téléphone (390×844), pas sur une fenêtre rétrécie.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture, attachCanvases } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const id = await createFixture(API, 'flower', 'dense', { isPublic: 'true' });
// Sans arbre généalogique attaché, la section n'affiche aucun canevas — et « phenohunt
// inutilisable » ne se mesure pas sur une section vide.
await attachCanvases(API, id, 'flower').catch((e) => console.log('canevas non attachés :', String(e).slice(0, 80)));
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

// Un conteneur qui défile À L'INTÉRIEUR d'une page qui défile déjà : c'est le défaut signalé.
// Le formulaire mobile met chaque section dans un volet défilant : c'est LE scroll légitime, la
// page elle-même ne bouge pas. Ce qu'on traque, ce sont les cadres qui défilent À L'INTÉRIEUR de ce
// volet — c'est là qu'on doit viser la bonne zone pour atteindre un contenu, le défaut signalé.
const scrollsImbriques = () => p.evaluate(() => {
    const out = [];
    const volets = [...document.querySelectorAll('div, section, main')].filter((n) => {
        const cs = getComputedStyle(n);
        return /(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 8 && n.clientHeight >= 80;
    });
    // Le volet le plus englobant est le scroller de section ; les autres sont imbriqués.
    const racine = volets.find((n) => !volets.some((m) => m !== n && m.contains(n)));
    for (const n of document.querySelectorAll('div, section, main')) {
        if (n === document.scrollingElement || n === document.body || n === racine) continue;
        if (racine && !racine.contains(n)) continue;
        const cs = getComputedStyle(n);
        if (!/(auto|scroll)/.test(cs.overflowY)) continue;
        if (n.scrollHeight <= n.clientHeight + 8) continue;   // déclaré défilant mais ne défile pas
        if (n.clientHeight < 80) continue;                    // trop petit pour être un vrai cadre
        out.push(`${n.className?.toString?.().slice(0, 46) || n.tagName}@${n.clientHeight}px`);
    }
    return out;
});

try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);

    // ── 3. Mode auto — mesuré EN PREMIER, parce que c'est l'écran par défaut sur téléphone ───────
    const vide = await p.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return null;
        const enfants = [...main.querySelectorAll('*')].filter((n) => (n.textContent || '').trim().length > 2);
        if (!enfants.length) return null;
        const bas = Math.max(...enfants.map((n) => n.getBoundingClientRect().bottom));
        const haut = Math.min(...enfants.map((n) => n.getBoundingClientRect().top));
        const cadre = main.getBoundingClientRect();
        return { videHaut: Math.round(haut - cadre.top), videBas: Math.round(cadre.bottom - bas), hauteurCadre: Math.round(cadre.height) };
    });
    console.log(`mode auto : ${JSON.stringify(vide)}`);
    if (vide && vide.videBas > vide.hauteurCadre * 0.45) {
        console.log(`KO — ${vide.videBas}px de vide sous la question pour un cadre de ${vide.hauteurCadre}px`); ko++;
    }
    await p.screenshot({ path: 'tools/export-audit/reports/mobile-wizard.png' });

    // Repasser en formulaire classique : les sections (pipeline, génétique) n'existent que là.
    const bascule = p.locator('button, [role="switch"], label').filter({ hasText: /Mode auto/ }).first();
    if (await bascule.count()) { await bascule.click().catch(() => {}); await sleep(4000); }

    // ── 1. Pipeline Culture ─────────────────────────────────────────────────────────────────────
    // Les sections se choisissent par une barre d'onglets à émoji. On clique par POSITION : le
    // texte d'un bouton-émoji n'est pas un sélecteur fiable selon la police de secours.
    // Le tiroir de navigation mobile (`fixed inset-0 z-[150]`) capte les clics s'il s'ouvre :
    // on le referme avant de viser, sinon la sonde clique dans le vide.
    await p.keyboard.press('Escape').catch(() => {});
    // Les onglets de SECTION vivent dans le formulaire, pas dans la navigation du site.
    const onglets = p.locator('main button, form button').filter({ hasText: /^[\p{Emoji}️]+$/u });
    let nbOnglets = await onglets.count();
    if (nbOnglets === 0) {
        // Repli : tous les boutons courts de la page, hors navigation de site.
        const tous = await p.locator('button').all();
        const candidats = [];
        for (const t of tous) {
            const txt = ((await t.textContent()) || '').trim();
            if (txt.length > 0 && txt.length <= 3 && !/^[0-9]+$/.test(txt)) candidats.push(t);
        }
        console.log(`onglets (repli) : ${candidats.length} — ${(await Promise.all(candidats.slice(0, 12).map((c) => c.textContent()))).join(' ')}`);
        if (candidats.length >= 3) { await candidats[2].click().catch(() => {}); }
        nbOnglets = candidats.length;
        globalThis.__candidats = candidats;
    }
    console.log(`onglets de section : ${nbOnglets}`);
    // La section Culture porte le pipeline : on la cherche par son contenu, pas par un rang.
    for (let i = 0; i < await onglets.count(); i++) {
        await onglets.nth(i).click().catch(() => {});
        await sleep(1800);
        if (await p.locator('[data-cell-timestamp]').count()) break;
    }
    await sleep(2500);
    const cellules = await p.locator('[data-cell-timestamp]').count();
    const imbriques = await scrollsImbriques();
    console.log(`pipeline : ${cellules} cases · ${imbriques.length} scroll(s) imbriqué(s)`);
    if (imbriques.length) console.log(`   → ${imbriques.slice(0, 4).join(' | ')}`);
    if (cellules === 0) { console.log('KO — pipeline non atteint, la sonde ne mesure rien'); ko++; }
    else if (imbriques.length > 0) { console.log('KO — scroll imbriqué dans le pipeline'); ko++; }

    // ── 2. PhenoHunt ────────────────────────────────────────────────────────────────────────────
    // Section Génétiques : deuxième onglet. Le canevas n'apparaît qu'une fois un cultivar choisi
    // dans la liste au-dessus — on le sélectionne, sinon on mesurerait une section au repos.
    await onglets.nth(1).click().catch(() => {});
    await sleep(3500);
    const cultivar = p.locator('button, [role="button"]').filter({ hasText: /Variété|RAFOU|GMO|Soyuz/i }).first();
    if (await cultivar.count()) { await cultivar.click().catch(() => {}); await sleep(3500); }
    await sleep(2000);
    const canevas = await p.evaluate(() => {
        const el = document.querySelector('.react-flow');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { hauteur: Math.round(r.height), largeur: Math.round(r.width) };
    });
    console.log(`phenohunt : ${canevas ? `${canevas.largeur}×${canevas.hauteur}px` : 'canevas absent'}`);
    if (!canevas) console.log('   section affichée :', (await p.evaluate(() => (document.querySelector('main')?.innerText || '').replace(/\s+/g, ' ').slice(0, 180))));
    await p.screenshot({ path: 'tools/export-audit/reports/mobile-genetics.png' });
    if (!canevas) { console.log('KO — aucun canevas généalogique'); ko++; }
    // 380px : en deçà, un arbre de plus de trois nœuds ne se lit ni ne se compose au doigt.
    else if (canevas.hauteur < 380) { console.log(`KO — canevas de ${canevas.hauteur}px de haut, inutilisable`); ko++; }

    // ── 4. Carrousel des catégories (arômes / goûts / effets) ───────────────────────────────────
    for (let i = 0; i < await onglets.count(); i++) {
        await onglets.nth(i).click().catch(() => {});
        await sleep(1600);
        if (await p.locator('text=/arômes|goûts|effets/').count()) break;
    }
    await sleep(2500);
    const rail = await p.evaluate(() => {
        // Le rail est le conteneur horizontalement défilant qui porte les cartes de catégorie.
        const cands = [...document.querySelectorAll('div')].filter((n) => {
            const cs = getComputedStyle(n);
            return /(auto|scroll)/.test(cs.overflowX) && n.scrollWidth > n.clientWidth + 8 && n.clientHeight > 60;
        });
        if (!cands.length) return null;
        const n = cands[0];
        return { largeur: Math.round(n.clientWidth), contenu: Math.round(n.scrollWidth), cartes: n.children.length };
    });
    console.log(`carrousel : ${rail ? `${rail.cartes} cartes, rail ${rail.largeur}px pour ${rail.contenu}px de contenu` : 'absent'}`);
    if (!rail) { console.log('KO — aucun rail horizontal de catégories sur téléphone'); ko++; }
    else if (rail.cartes < 3) { console.log('KO — carrousel quasi vide'); ko++; }
    await p.screenshot({ path: 'tools/export-audit/reports/mobile-carrousel.png' });

    await p.screenshot({ path: 'tools/export-audit/reports/mobile-forms.png' });
} finally {
    await b.close();
    await deleteFixture(API, id).catch(() => {});
}
console.log(ko === 0 ? '\nOK — formulaires exploitables sur téléphone' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
