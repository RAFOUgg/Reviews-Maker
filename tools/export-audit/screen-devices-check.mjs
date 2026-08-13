/**
 * Le mode Écran propose-t-il PC / téléphone, et le rendu se RECALIBRE-T-IL vraiment ?
 *
 * « en mode écran il faut juste gérer le format PC et format téléphone, faire des rendu responsive
 * parfait, tout les element doivent s'auto recalibrer » (2026-08-13). Deux choses à prouver, et la
 * seconde est la seule qui compte : un rendu peut changer de largeur sans rien recalibrer — ce
 * serait alors une maquette d'ordinateur rétrécie, exactement ce qu'on remplace. On mesure donc la
 * taille de police RENDUE, le nombre de colonnes et la largeur du canevas sur les deux formats.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// `isPublic` : le Studio ne s'ouvre que depuis le formulaire d'édition, et `/edit/:type/:id`
// répond 403 sur une review créée par l'API sans session (elle n'appartient à personne, cf.
// `canReadFor`). On le demande à la ROUTE DE CRÉATION elle-même, sur une fixture jetable — pas
// d'écriture directe en base, et aucune donnée réelle touchée.
const id = await createFixture(API, 'flower', 'dense', { isPublic: 'true' });
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

// « rend toutes les templates horizontale sur pc et vertical sur téléphone » : on ne le déduit pas
// du format, on le MESURE sur les blocs rendus. Deux blocs côte à côte = disposition horizontale ;
// tous empilés pleine largeur = disposition verticale.
const disposition = () => p.evaluate(() => {
    const c = document.querySelector('#export-maker-screen-canvas');
    if (!c) return null;
    // Seuls les blocs de PREMIER NIVEAU : un `[data-module]` imbriqué (tronçon de pipeline, cellule
    // de données) vit dans une grille interne à sa section et n'a aucune raison d'être pleine
    // largeur. Les compter faisait passer pour un défaut d'empilement une grille parfaitement
    // normale.
    const blocs = [...c.querySelectorAll('[data-module]')]
        .filter((n) => !n.parentElement?.closest('[data-module]'))
        .map((n) => n.getBoundingClientRect())
        .filter((r) => r.width > 20 && r.height > 20);
    if (blocs.length < 2) return { blocs: blocs.length, cotesACote: 0, pleineLargeur: 0 };
    const largeurCanevas = c.getBoundingClientRect().width;
    let cotesACote = 0;
    for (let i = 0; i < blocs.length; i++) {
        for (let j = i + 1; j < blocs.length; j++) {
            const a = blocs[i], b = blocs[j];
            const chevaucheV = a.top < b.bottom - 4 && b.top < a.bottom - 4;
            const disjointH = a.right <= b.left + 4 || b.right <= a.left + 4;
            if (chevaucheV && disjointH) { cotesACote++; }
        }
    }
    // « Pleine largeur » se mesure contre le CONTENEUR du bloc, pas contre le canevas : une section
    // a des marges intérieures, donc un bloc qui remplit parfaitement sa section fait
    // mécaniquement moins que le canevas. Comparé au canevas, un empilement correct passait pour
    // une grille (mesuré : tronçons de pipeline à 342px dans un canevas de 420px, soit 81 %).
    // Largeur de CONTENU du parent (bordures et marges intérieures déduites) : sans ça, un bloc qui
    // remplit exactement la zone de contenu de son parent paraît toujours trop étroit — mesuré,
    // 380px dans un conteneur de 420px avec 20px de marge de chaque côté.
    const estPleine = (n) => {
        const p = n.parentElement;
        if (!p) return false;
        const cs = getComputedStyle(p);
        const dispo = p.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
        return dispo > 0 && n.getBoundingClientRect().width >= dispo * 0.95;
    };
    const noeuds = [...c.querySelectorAll('[data-module]')]
        .filter((n) => !n.parentElement?.closest('[data-module]'))
        .filter((n) => { const r = n.getBoundingClientRect(); return r.width > 20 && r.height > 20; });
    const pleineLargeur = noeuds.filter(estPleine).length;
    const etroits = noeuds.filter((n) => !estPleine(n))
        .map((n) => `${n.getAttribute('data-module')}@${Math.round(n.getBoundingClientRect().width)}px`);
    return { blocs: blocs.length, cotesACote, pleineLargeur, etroits: etroits.slice(0, 8) };
});

const mesurer = () => p.evaluate(() => {
    const c = document.querySelector('#export-maker-screen-canvas');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    // Le corps de texte tel qu'il est RENDU : on prend la médiane des tailles réellement
    // appliquées, pas la valeur du réglage — c'est la seule qui décide de la lisibilité.
    const tailles = [...c.querySelectorAll('*')]
        .filter((n) => n.children.length === 0 && (n.textContent || '').trim().length > 3)
        .map((n) => parseFloat(getComputedStyle(n).fontSize))
        .filter((v) => v > 0)
        .sort((a, b) => a - b);
    const mediane = tailles.length ? tailles[Math.floor(tailles.length / 2)] : 0;
    return {
        largeurCanevas: Math.round(c.offsetWidth),
        largeurAffichee: Math.round(r.width),
        ratio: c.getAttribute('data-ratio'),
        police: mediane,
        minPolice: tailles[0] || 0,
        // Un débordement latéral est disqualifiant sur un téléphone : la page ne doit jamais
        // défiler horizontalement.
        debordement: Math.max(0, Math.round(c.scrollWidth - c.clientWidth)),
    };
});

try {
    // Le mode Écran vit dans le Studio, qui s'ouvre par « Aperçu » depuis le formulaire.
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(5000);

    const ecran = p.locator('button', { hasText: /^.?\s*Écran$/ }).first();
    if (await ecran.count()) { await ecran.click(); await sleep(3000); }

    const boutons = await p.locator('button', { hasText: /Ordinateur|Téléphone/ }).count();
    console.log(`sélecteurs d'appareil trouvés : ${boutons}`);
    if (boutons < 2) {
        console.log('boutons visibles :', (await p.locator('button').allTextContents()).slice(0, 30).join(' | '));
        throw new Error('le sélecteur PC/téléphone n’est pas atteignable — la sonde ne mesure rien');
    }

    await p.locator('button', { hasText: 'Ordinateur' }).first().click(); await sleep(3500);
    await p.screenshot({ path: 'tools/export-audit/reports/screen-pc.png' });
    const pc = await mesurer();
    console.log('PC       :', JSON.stringify(pc));

    const dispoPc = await disposition();
    console.log('  disposition PC       :', JSON.stringify(dispoPc));

    await p.locator('button', { hasText: 'Téléphone' }).first().click(); await sleep(3500);
    const tel = await mesurer();
    console.log('Téléphone:', JSON.stringify(tel));
    const dispoTel = await disposition();
    console.log('  disposition Téléphone:', JSON.stringify(dispoTel));

    if (dispoPc.cotesACote === 0) { console.log('KO — aucun bloc côte à côte sur ordinateur : la fiche reste verticale'); ko++; }
    if (dispoTel.cotesACote > 0) { console.log(`KO — ${dispoTel.cotesACote} paire(s) de blocs côte à côte sur téléphone : la fiche n’est pas empilée`); ko++; }
    if (dispoTel.pleineLargeur < dispoTel.blocs * 0.8) { console.log(`KO — seulement ${dispoTel.pleineLargeur}/${dispoTel.blocs} blocs pleine largeur sur téléphone`); ko++; }

    if (!pc || !tel) throw new Error('aucun canevas d’écran — la sonde ne mesure rien');
    if (pc.ratio !== 'ecran-pc' || tel.ratio !== 'ecran-mobile') { console.log(`KO — formats non appliqués (${pc.ratio} / ${tel.ratio})`); ko++; }
    // Le canevas doit prendre la largeur RÉELLEMENT disponible, pas la largeur nominale du format :
    // sinon on regarde une maquette rétrécie et rien ne s'est repositionné.
    if (Math.abs(pc.largeurCanevas - pc.largeurAffichee) > 6) { console.log(`KO — canevas PC ${pc.largeurCanevas}px affiché ${pc.largeurAffichee}px : mise à l’échelle, pas recomposition`); ko++; }
    if (Math.abs(tel.largeurCanevas - tel.largeurAffichee) > 6) { console.log(`KO — canevas téléphone ${tel.largeurCanevas}px affiché ${tel.largeurAffichee}px`); ko++; }
    if (tel.largeurCanevas >= pc.largeurCanevas) { console.log('KO — le téléphone n’est pas plus étroit que l’ordinateur'); ko++; }
    // LE point : la police ne doit pas simplement suivre la largeur. Un texte sous 14px sur un
    // canevas affiché à 1:1 est illisible sur un téléphone réel.
    if (tel.police < 14) { console.log(`KO — corps de texte à ${tel.police}px sur téléphone (minimum 14)`); ko++; }
    if (tel.debordement > 2) { console.log(`KO — débordement latéral de ${tel.debordement}px sur téléphone`); ko++; }
    if (pc.police < 14) { console.log(`KO — corps de texte à ${pc.police}px sur ordinateur`); ko++; }

    // ── Les CINQ templates, sur les deux appareils ──────────────────────────────────────────────
    // « rend toutes les templates horizontale sur pc et vertical sur téléphone » : un seul template
    // vérifié ne dit rien des quatre autres, qui ont chacun leur composition propre.
    for (const nom of ['Fiche Technique Détaillée', 'Rapport de Traçabilité', 'Article de Blog', 'Story Social Media', 'Moderne Compact']) {
        const bouton = p.locator('button', { hasText: nom }).first();
        if (!(await bouton.count())) { console.log(`— ${nom} : absent du sélecteur`); continue; }
        await bouton.click(); await sleep(4000);

        await p.locator('button', { hasText: 'Ordinateur' }).first().click(); await sleep(3000);
        const dPc = await disposition();
        await p.locator('button', { hasText: 'Téléphone' }).first().click(); await sleep(3000);
        const dTel = await disposition();
        console.log(`${nom.padEnd(26)} PC ${dPc.cotesACote} paire(s) côte à côte · Téléphone ${dTel.cotesACote} paire(s), ${dTel.pleineLargeur}/${dTel.blocs} pleine largeur`);
        if (dTel.etroits?.length) console.log(`     étroits sur téléphone : ${dTel.etroits.join(', ')}`);
        const fichier = nom.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        await p.screenshot({ path: `tools/export-audit/reports/ecran-${fichier}-tel.png` });
        await p.locator('button', { hasText: 'Ordinateur' }).first().click(); await sleep(2500);
        await p.screenshot({ path: `tools/export-audit/reports/ecran-${fichier}-pc.png` });

        if (dTel.cotesACote > 0) { console.log(`  KO — ${nom} n’est pas empilé sur téléphone`); ko++; }
        if (dTel.blocs >= 2 && dTel.pleineLargeur < dTel.blocs * 0.8) { console.log(`  KO — ${nom} : blocs étroits sur téléphone`); ko++; }
        // « Story Social Media » est LE template vertical — c'est ce qu'on exporte en 9:16 pour
        // Instagram et TikTok. Le mettre en colonnes le priverait de ce qui le définit : il occupe
        // la largeur autrement, centré à sa largeur naturelle. Exception assumée, pas un oubli.
        if (nom !== 'Story Social Media' && dPc.blocs >= 3 && dPc.cotesACote === 0) { console.log(`  KO — ${nom} reste vertical sur ordinateur`); ko++; }
    }

    await p.screenshot({ path: 'tools/export-audit/reports/screen-mobile.png', fullPage: false });
} finally {
    await b.close();
    await deleteFixture(API, id).catch(() => {});
}
console.log(ko === 0 ? '\nOK — deux formats d’écran, rendu recalibré' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
