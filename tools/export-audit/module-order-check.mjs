/**
 * « Ordre des modules » : le réglage agit-il RÉELLEMENT sur le rendu ?
 *
 * Ce contrôle existe parce que `config.moduleOrder` a été, jusqu'au 2026-08-12, un réglage
 * entièrement mort — présent dans la config, lu par zéro template. Un audit par lecture de code
 * l'annonçait « 0/5 » ; on vérifie donc ici sur le RENDU, jamais sur le store : un réglage qui
 * change la config sans rien changer à l'ordre affiché serait le même défaut, simplement déplacé.
 *
 * MÉTHODE. On compare deux reviews de contenu identique, l'une sans `moduleOrder`, l'autre avec un
 * ordre explicite, et on lit l'ordre des `[data-module]` dans les pages RÉELLEMENT montées pour
 * l'export (`.export-maker-page`, même cible que la matrice d'audit) — pas dans l'aperçu.
 *
 * POURQUOI PAS PAR L'INTERFACE. Le panneau « Ordre des blocs » vit dans le Studio, donc sur
 * `/edit/:type/:id`, et `GET /api/flower-reviews/:id` répond 403 au harnais : le formulaire s'ouvre
 * vide, la review mesurée n'a que deux blocs, et aucun échange n'est possible. Limite d'outillage
 * connue et déjà consignée. On vérifie donc ici le chemin que le réglage emprunte une fois
 * enregistré — celui de tous les exports et de la page publique.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TEMPLATE = 'detailedCard', RATIO = '16:9';

let ko = 0;
const verdict = (nom, ok, detail) => { if (!ok) ko++; console.log(`${ok ? '✔' : '✖'} ${nom}${detail ? ' — ' + detail : ''}`); };

/** Ordre des blocs dans les pages montées pour l'export, tronçons de pipeline repliés. */
const ordreExporte = (page) => page.evaluate(() => {
    const pages = [...document.querySelectorAll('.export-maker-page')];
    const cibles = pages.length ? pages : [document.querySelector('#export-maker-canvas')].filter(Boolean);
    if (!cibles.length) return null;
    const vus = [];
    for (const c of cibles) {
        c.querySelectorAll('[data-module]').forEach((el) => {
            const raw = el.getAttribute('data-module');
            const base = raw.includes('#') ? raw.slice(0, raw.indexOf('#')) : raw;
            if (!vus.includes(base)) vus.push(base);
        });
    }
    return vus;
});

async function ordrePourConfig(page, moduleOrder) {
    const config = { template: TEMPLATE, ratio: RATIO, ...(moduleOrder ? { moduleOrder } : {}) };
    const id = await createFixture(API, 'flower', 'dense', { exportMakerConfig: JSON.stringify(config) });
    try {
        await page.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
        await sleep(2000);
        const trigger = page.getByRole('button', { name: /^Exporter$/ }).first();
        if (!(await trigger.count())) throw new Error('bouton Exporter absent');
        await trigger.click();
        // Même attente que la matrice : la mesure de pagination attend la résolution des blocs
        // asynchrones (canevas), et capturer avant donne un résultat faux, pas approximatif.
        await sleep(Number(process.env.AUDIT_EXPORT_WAIT_MS || 14000));
        return await ordreExporte(page);
    } finally {
        await deleteFixture(API, id);
    }
}

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

try {
    const naturel = await ordrePourConfig(p, null);
    verdict('ordre naturel du template lisible', Array.isArray(naturel) && naturel.length >= 4,
        `${(naturel || []).length} blocs : ${(naturel || []).join(' → ')}`);
    if (!naturel || naturel.length < 4) throw new Error('rendu trop pauvre pour conclure');

    // Ordre demandé : le DERNIER bloc passe juste après la couverture. Un déplacement franc, pas un
    // échange de voisins — visible même si la pagination redistribue les pages.
    const demande = [naturel[0], naturel[naturel.length - 1], ...naturel.slice(1, -1)];
    const obtenu = await ordrePourConfig(p, demande);

    verdict('le rendu suit l\'ordre demandé', JSON.stringify(obtenu) === JSON.stringify(demande),
        `demandé : ${demande.join(' → ')} | obtenu : ${(obtenu || []).join(' → ')}`);

    // Un réordonnancement ne doit RIEN faire disparaître : c'est le mode de défaillance dominant de
    // ce module (contenu perdu, pas contenu mal placé).
    const memeEnsemble = JSON.stringify([...naturel].sort()) === JSON.stringify([...(obtenu || [])].sort());
    verdict('aucun bloc perdu au passage', memeEnsemble, `${naturel.length} → ${(obtenu || []).length} blocs`);

    // Un ordre au vocabulaire HÉRITÉ (clés de champ, le format mort d'avant ce chantier) doit être
    // purgé, pas appliqué partiellement : `description` et `extraData` existent dans les deux
    // vocabulaires et déplaceraient réellement ces deux blocs au nom d'un ordre jamais choisi.
    const legacy = await ordrePourConfig(p, ['image', 'title', 'densite', 'tastes', 'description', 'extraData']);
    verdict('un ordre hérité (clés de champ) est ignoré', JSON.stringify(legacy) === JSON.stringify(naturel),
        `obtenu : ${(legacy || []).join(' → ')}`);
} catch (e) {
    ko++; console.log('✖ exécution interrompue —', String(e.message).slice(0, 200));
} finally {
    await b.close();
}

console.log(ko === 0 ? '\n✔ l\'ordre des blocs agit sur le rendu' : `\n✖ ${ko} contrôle(s) en échec`);
process.exit(ko ? 1 : 0);
