/**
 * Graisses typographiques et réglages photo : agissent-ils sur les CINQ templates ?
 *
 * Le relevé du 2026-08-12 donnait « graisse du texte 1/5, graisse du titre 2/5, galerie 2/5 » —
 * établi par lecture de code. On vérifie ici sur le rendu réel, template par template : c'est la
 * seule preuve qui vaille pour un réglage, et la lecture de code s'est déjà trompée sur ce même
 * tableau (l'optional chaining faussait le comptage).
 *
 * Chaque cas monte une review neuve portant la config visée dans `exportMakerConfig`, puis lit les
 * styles CALCULÉS dans les pages réellement montées pour l'export.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Valeurs volontairement éloignées des défauts (titre 700, texte 400) : une coïncidence de graisse
// ne doit pas pouvoir se faire passer pour un réglage appliqué.
const TITRE = '300', TEXTE = '800';

const TEMPLATES = [
    { id: 'detailedCard', ratio: '16:9', nom: 'Fiche Technique', galerie: true },
    { id: 'modernCompact', ratio: '1:1', nom: 'Moderne Compact', galerie: true },
    { id: 'blogArticle', ratio: '16:9', nom: 'Article de Blog', galerie: true },
    // Exception assumée : le hero est bord-à-bord, une grille de vignettes y casserait l'identité.
    { id: 'socialStory', ratio: '9:16', nom: 'Story', galerie: false },
    { id: 'traceabilityReport', ratio: 'A4', nom: 'Rapport de Traçabilité', galerie: true },
];

let ko = 0;
const verdict = (nom, ok, detail) => { if (!ok) ko++; console.log(`  ${ok ? '✔' : '✖'} ${nom}${detail ? ' — ' + detail : ''}`); };

/** Relève, dans les pages exportées, les graisses en usage et le nombre de photos produit. */
const sonde = (page) => page.evaluate(() => {
    const pages = [...document.querySelectorAll('.export-maker-page')];
    const cibles = pages.length ? pages : [document.querySelector('#export-maker-canvas')].filter(Boolean);
    if (!cibles.length) return null;
    const graisses = new Set();
    let grosTexte = [];
    let images = 0;
    for (const c of cibles) {
        c.querySelectorAll('*').forEach((el) => {
            const s = getComputedStyle(el);
            graisses.add(s.fontWeight);
            if (parseFloat(s.fontSize) >= 20 && (el.textContent || '').trim()) grosTexte.push(s.fontWeight);
        });
        // Le logo de branding n'est pas une photo produit ; il vit dans `.export-maker-branding`.
        images += [...c.querySelectorAll('img')].filter((i) => !i.closest('.export-maker-branding')).length;
    }
    return { graisses: [...graisses], grosTexte: [...new Set(grosTexte)], images };
});

async function rendu(page, config, extra = {}) {
    const id = await createFixture(API, 'flower', 'dense', { ...extra, exportMakerConfig: JSON.stringify(config) });
    try {
        await page.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
        await sleep(2000);
        const trigger = page.getByRole('button', { name: /^Exporter$/ }).first();
        if (!(await trigger.count())) throw new Error('bouton Exporter absent');
        await trigger.click();
        await sleep(Number(process.env.AUDIT_EXPORT_WAIT_MS || 14000));
        return await sonde(page);
    } finally {
        await deleteFixture(API, id);
    }
}

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

try {
    for (const t of TEMPLATES) {
        console.log(`\n▶ ${t.nom}`);

        const typo = await rendu(p, {
            template: t.id, ratio: t.ratio,
            typography: { fontFamily: 'Inter', titleSize: 32, textSize: 16, titleWeight: TITRE, textWeight: TEXTE },
        });
        if (!typo) { verdict('rendu obtenu', false, 'aucune page montée'); continue; }

        verdict('graisse du texte appliquée', typo.graisses.includes(TEXTE),
            `graisses présentes : ${typo.graisses.sort().join(', ')}`);
        verdict('graisse du titre appliquée', typo.grosTexte.includes(TITRE),
            `graisses des gros textes : ${typo.grosTexte.sort().join(', ') || 'aucun'}`);

        // Galerie : même review à 3 photos, une fois sans, une fois avec.
        const sans = await rendu(p, { template: t.id, ratio: t.ratio, image: { showGallery: false } }, { photoCount: 3 });
        const avec = await rendu(p, { template: t.id, ratio: t.ratio, image: { showGallery: true } }, { photoCount: 3 });
        const n0 = sans?.images ?? 0, n1 = avec?.images ?? 0;
        if (t.galerie) {
            verdict('la galerie ajoute des photos au rendu', n1 > n0, `${n0} → ${n1} photo(s)`);
        } else {
            verdict('pas de galerie (exception assumée : hero bord-à-bord)', n1 === n0, `${n0} → ${n1} photo(s)`);
        }
    }
} catch (e) {
    ko++; console.log('✖ exécution interrompue —', String(e.message).slice(0, 200));
} finally {
    await b.close();
}

console.log(ko === 0 ? '\n✔ graisses et réglages photo actifs sur les 5 templates' : `\n✖ ${ko} contrôle(s) en échec`);
process.exit(ko ? 1 : 0);
