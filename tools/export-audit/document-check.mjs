/**
 * Un DOCUMENT joint (certificat d'analyse, profil terpénique) se voit-il dans le rendu ?
 *
 * Mesuré le 2026-08-16, avant correctif : non. `AnalyticsSection.jsx` téléverse réellement ces
 * fichiers, les 4 routes de review les acceptent (`certificateFile`/`terpeneFile`) et les stockent
 * en `/images/<fichier>` — mais les templates se contentaient d'écrire « Disponible » dans une
 * cellule du tableau labo. La pièce la plus opposable d'une fiche de traçabilité était donc
 * MENTIONNÉE sans jamais être atteignable, sur les 5 templates à la fois.
 *
 * Trois mesures, sur une review qui porte RÉELLEMENT deux certificats :
 *   1. le bloc « Documents & certificats » existe et porte un lien vers chaque fichier ;
 *   2. plus aucune cellule ne dit « Disponible » (le doublon appauvri qu'on remplace — s'il
 *      revenait, on aurait les deux, donc l'ancien défaut à côté du nouveau bloc) ;
 *   3. sur une surface FIGÉE (`interactive=false`, ce que capture un export PNG), le lien mort est
 *      remplacé par un QR — un certificat imprimé qu'on ne peut pas vérifier ne vaut pas mieux
 *      qu'une affirmation. C'est la seule chose qu'une rasterisation puisse porter.
 *
 * Le volet 3 se mesure sur le rendu hors-écran monté par la MESURE de pagination, seule surface
 * non interactive atteignable sans déclencher un téléchargement.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve } from 'path';
import { createFixture, deleteFixture } from './fixtures.mjs';

const OUT = resolve('reports');
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const id = await createFixture(API, 'flower', 'dense', { withDocs: true });
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

try {
    // La colonne est-elle seulement peuplée ? Sans cette vérification, un rendu vide serait
    // indiscernable d'un téléversement qui n'a pas abouti — et on « corrigerait » un rendu correct.
    const api = await (await fetch(`${API}/api/reviews/${id}`)).json();
    const revue = api?.data || api?.review || api;
    const urlCoa = revue?.labReportUrl || revue?.flowerData?.labReportUrl;
    const urlTerp = revue?.terpeneFileUrl || revue?.flowerData?.terpeneFileUrl;
    console.log(`base   : labReportUrl=${urlCoa || '∅'} terpeneFileUrl=${urlTerp || '∅'}`);
    if (!urlCoa || !urlTerp) {
        console.log('KO — les certificats ne sont pas enregistrés : la sonde ne mesure rien');
        ko += 1;
    }

    await p.goto(`${BASE}/r/${id}`, { waitUntil: 'networkidle' });
    await sleep(6000);

    const etat = await p.evaluate(() => {
        const bloc = document.querySelector('[data-module="documents"]');
        const liens = bloc
            ? [...bloc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
            : [];
        // « Disponible » ne doit plus servir à annoncer un certificat. On ne cherche que dans le
        // voisinage d'un libellé de certificat : le mot peut légitimement exister ailleurs.
        const disponible = [...document.querySelectorAll('div, td, span')]
            .filter((n) => n.children.length === 0 && (n.textContent || '').trim() === 'Disponible')
            .map((n) => (n.parentElement?.textContent || '').trim().slice(0, 60));
        return {
            blocPresent: Boolean(bloc),
            liens,
            titre: bloc ? (bloc.textContent || '').slice(0, 40) : null,
            disponible,
        };
    });

    console.log(`écran  : bloc=${etat.blocPresent} liens=${etat.liens.length} → ${etat.liens.join(' , ') || '∅'}`);
    if (!etat.blocPresent) { console.log('KO — aucun bloc [data-module="documents"] dans le rendu'); ko += 1; }
    if (etat.liens.length < 2) { console.log(`KO — ${etat.liens.length} lien(s) de document, 2 attendus`); ko += 1; }
    if (!etat.liens.some((h) => /\.pdf(\?|$)/i.test(h || ''))) {
        console.log('KO — aucun lien ne pointe vers un .pdf réel');
        ko += 1;
    }
    if (etat.disponible.length > 0) {
        console.log(`KO — « Disponible » subsiste (${etat.disponible.length}) : ${etat.disponible.join(' | ')}`);
        ko += 1;
    }

    await p.screenshot({ path: resolve(OUT, 'document-check-ecran.png'), fullPage: false });

    // ── Volet 3 : surface FIGÉE ────────────────────────────────────────────────────────────────
    // La modale d'export monte ses rendus avec `interactive={false}` — le même arbre que celui que
    // photographie la capture. C'est là, et seulement là, que le lien doit céder la place à un QR :
    // dans un PNG un `<a>` ne mène nulle part.
    //
    // Il faut d'abord CHOISIR un template qui rende les documents. Le défaut est Moderne Compact,
    // une CARTE — elle les exclut délibérément, comme tout le détail technique (cf.
    // `TEMPLATE_SECTIONS`) : mesurer là reviendrait à constater une absence voulue et à la prendre
    // pour un défaut. Mesuré à l'écriture de cette sonde, qui a d'abord fait exactement ça.
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click();
    await sleep(3500);
    await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click();
    await sleep(1500);
    await p.getByRole('button', { name: /^Appliquer$/ }).first().click();
    await sleep(2500);

    await p.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
    await sleep(2500);
    await p.getByRole('button', { name: /^Exporter$/ }).first().click();
    await sleep(9000);

    const fige = await p.evaluate(() => {
        const blocs = [...document.querySelectorAll('[data-module="documents"]')];
        // Le bloc figé est celui qui ne porte AUCUN lien — c'est précisément la différence mesurée.
        const cible = blocs.find((b) => b.querySelectorAll('a[href]').length === 0) || blocs[0];
        if (!cible) return { atteint: false, blocs: blocs.length };
        return {
            atteint: true,
            blocs: blocs.length,
            svgQr: cible.querySelectorAll('svg').length,
            liens: cible.querySelectorAll('a[href]').length,
        };
    });

    if (!fige.atteint) {
        console.log(`KO — aucun bloc documents dans la modale d'export (${fige.blocs} trouvé(s))`);
        ko += 1;
    } else {
        console.log(`figé   : blocs=${fige.blocs} QR(svg)=${fige.svgQr} liens=${fige.liens}`);
        if (fige.svgQr === 0) { console.log('KO — aucun QR sur la surface figée : le document y est inatteignable'); ko += 1; }
        if (fige.liens > 0) { console.log('KO — un lien subsiste sur la surface figée : il sera mort dans le PNG'); ko += 1; }
    }

    await p.screenshot({ path: resolve(OUT, 'document-check-fige.png'), fullPage: false });
} finally {
    await b.close();
    await deleteFixture(API, id);
}

console.log(ko === 0 ? '\nOK — les documents joints sont rendus et atteignables' : `\n${ko} ÉCHEC(S)`);
process.exit(ko === 0 ? 0 : 1);
