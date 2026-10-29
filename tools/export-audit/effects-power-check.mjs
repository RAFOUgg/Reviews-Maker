/**
 * L23 — Vérification visuelle de L1 : la PUISSANCE DES EFFETS et les LÉGENDES DE BORNES.
 *
 * L1 (2026-10-28) a livré trois choses que rien ne mesurait jusqu'ici :
 *   • un curseur 1-10 par effet coché (« Puissance de chaque effet », section Effets, 4 types) ;
 *   • les légendes de bornes « 1 · … ··· 10 · … » sous les jauges notées (Texture, Goûts) ;
 *   • le champ de registre `effectsPower` (liste « Effet · n/10 »), censé apparaître dans les 5
 *     templates d'export.
 *
 * VOLET A — formulaire, sur un VRAI viewport de téléphone (390×844, tactile), en mode normal (le
 * mode auto, ouvert par défaut sur téléphone, est quitté : sa parité relève de L5). Pour chaque
 * type : le bloc de puissance existe, porte un curseur par effet coché, RELIT la valeur enregistrée
 * (8/10), et chaque légende de bornes est LISIBLE — mesuré, pas supposé :
 *   - taille de police calculée ≥ 11px ;
 *   - les deux bornes restent dans l'écran (aucune sortie latérale) et ne se chevauchent pas ;
 *   - aucune n'est tronquée (scrollWidth ≤ clientWidth) ;
 *   - le curseur ne descend pas sur la ligne des bornes (pastille de 20px sur une piste de 8px :
 *     elle débordait de 8px sous la piste et masquait « 10 · Dominant » à 8/10 — vu sur capture) ;
 *   - contraste ≥ 4.5:1 (WCAG AA, texte < 18px). Le fond n'est PAS déduit des styles : les cartes
 *     sont translucides et floutées (LiquidUI), une composition des `background-color` mentirait.
 *     On capture la zone avec le texte rendu transparent, on lit la couleur réelle des pixels, et
 *     on y compose la couleur du texte (alpha compris). C'est le fond que voit l'œil.
 *
 * VOLET B — rendu, sur `/r/:id` (la page publique, qui monte les mêmes templates que l'export) :
 * une review dont la puissance est renseignée doit afficher « Relaxant · 8/10 » dans CHACUN des 5
 * templates ; la même review SANS puissance ne doit afficher ni pastille « n/10 » d'effet ni le
 * titre « Puissance des effets » (un titre ne survit pas à son contenu, cf. correctif #17).
 *
 * Captures : `reports/effects-power-*.png` — à RELIRE (critère d'acceptation du lot).
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = (process.env.AUDIT_BASE || 'http://localhost:5173'), API = (process.env.AUDIT_API || 'http://localhost:3000');
const OUT = process.argv[2] || 'tools/export-audit/reports';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ko = 0;
const verdict = (nom, ok, detail) => { if (!ok) ko++; console.log(`${ok ? '✔' : '✖'} ${nom}${detail ? ' — ' + detail : ''}`); };

// Identifiants réels de `data/effectsCategories.js` (pas devinés) et noms attendus en rendu.
const EFFETS = ['relaxant', 'euphorique', 'creatif'];
const PUISSANCE = { relaxant: 8, euphorique: 5, creatif: 3 };
const ATTENDUS = ['Relaxant · 8/10', 'Euphorique · 5/10', 'Créatif · 3/10'];
const AVEC_PUISSANCE = { effetsChoisis: JSON.stringify(EFFETS), effetsPuissance: JSON.stringify(PUISSANCE) };

const b = await chromium.launch();

// ── Outils de mesure ─────────────────────────────────────────────────────────────────────────────

/** Couleur moyenne d'une capture PNG, décodée dans le navigateur (seul décodeur disponible). */
async function couleurMoyenne(page, png) {
    return page.evaluate((data) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const g = c.getContext('2d');
            g.drawImage(img, 0, 0);
            const d = g.getImageData(0, 0, c.width, c.height).data;
            let r = 0, v = 0, bl = 0, n = 0;
            for (let i = 0; i < d.length; i += 4) { r += d[i]; v += d[i + 1]; bl += d[i + 2]; n++; }
            resolve({ r: r / n, g: v / n, b: bl / n });
        };
        img.onerror = () => resolve(null);
        img.src = `data:image/png;base64,${data}`;
    }), png.toString('base64'));
}

function contraste(a, c) {
    const lum = ({ r, g, b: bl }) => {
        const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
    };
    const [h, l] = [lum(a), lum(c)].sort((x, y) => y - x);
    return (h + 0.05) / (l + 0.05);
}

/**
 * Lisibilité de chaque légende de bornes `[data-slider-bounds]` dans `scope`.
 * Retourne une liste de { texte, police, dansEcran, chevauche, tronque, contraste }.
 */
async function lisibilite(page, scope) {
    const n = await scope.locator('[data-slider-bounds]').count();
    const out = [];
    for (let i = 0; i < n; i++) {
        const loc = scope.locator('[data-slider-bounds]').nth(i);
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        const geo = await loc.evaluate((el) => {
            const spans = [...el.children];
            const rs = spans.map((s) => s.getBoundingClientRect());
            const cs = getComputedStyle(el);
            let opacite = 1;
            for (let x = el; x; x = x.parentElement) opacite *= Number(getComputedStyle(x).opacity || 1);
            const m = cs.color.match(/rgba?\(([^)]+)\)/);
            const [r, g, bl, a = 1] = m ? m[1].split(/[\s,/]+/).filter(Boolean).map(Number) : [255, 255, 255, 1];
            // Le curseur (pastille blanche de 20px) déborde SOUS la piste de 8px : s'il descend
            // jusqu'à la ligne des bornes, il en masque une partie selon la valeur. Critère vertical,
            // donc indépendant de la valeur saisie : il suffit que le bas du curseur reste au-dessus.
            const pastille = el.parentElement?.querySelector('.liquid-slider-thumb-core');
            const bas = pastille ? pastille.getBoundingClientRect().bottom : null;
            return {
                texte: spans.map((s) => s.innerText.trim()),
                police: parseFloat(cs.fontSize),
                dansEcran: rs.every((q) => q.left >= 0 && q.right <= window.innerWidth + 0.5),
                chevauche: rs.length === 2 && rs[0].right > rs[1].left + 0.5 && rs[0].bottom > rs[1].top && rs[1].bottom > rs[0].top,
                tronque: spans.some((s) => s.scrollWidth > s.clientWidth + 1),
                masque: bas !== null && bas > Math.min(...rs.map((q) => q.top)) + 0.5,
                couleur: { r, g, b: bl, a: a * opacite },
            };
        });
        // Fond RÉEL sous le texte : on rend le texte transparent le temps d'une capture.
        await loc.evaluate((el) => { el.dataset.l23Color = el.style.color; el.style.color = 'transparent'; });
        const fondPng = await loc.screenshot().catch(() => null);
        await loc.evaluate((el) => { el.style.color = el.dataset.l23Color || ''; delete el.dataset.l23Color; });
        const fond = fondPng ? await couleurMoyenne(page, fondPng) : null;
        let ratio = null;
        if (fond) {
            const t = geo.couleur;
            const vu = { r: t.r * t.a + fond.r * (1 - t.a), g: t.g * t.a + fond.g * (1 - t.a), b: t.b * t.a + fond.b * (1 - t.a) };
            ratio = Math.round(contraste(vu, fond) * 100) / 100;
        }
        out.push({ ...geo, contraste: ratio });
    }
    return out;
}

function jugerBornes(nom, mesures, attendu = null) {
    if (!mesures.length) { verdict(nom, false, 'aucune légende de bornes'); return; }
    const defauts = [];
    for (const m of mesures) {
        const txt = m.texte.join(' ··· ');
        if (m.texte.length !== 2 || !/^1 · \S/.test(m.texte[0]) || !/^10 · \S/.test(m.texte[1])) defauts.push(`forme « ${txt} »`);
        if (attendu && txt !== attendu) defauts.push(`texte « ${txt} » ≠ « ${attendu} »`);
        if (m.police < 11) defauts.push(`police ${m.police}px`);
        if (!m.dansEcran) defauts.push(`sort de l'écran (« ${txt} »)`);
        if (m.chevauche) defauts.push(`bornes qui se chevauchent (« ${txt} »)`);
        if (m.tronque) defauts.push(`tronqué (« ${txt} »)`);
        if (m.masque) defauts.push(`curseur posé sur la légende (« ${txt} »)`);
        if (m.contraste === null) defauts.push('contraste non mesurable');
        else if (m.contraste < 4.5) defauts.push(`contraste ${m.contraste}:1 (« ${txt} »)`);
    }
    const pire = Math.min(...mesures.map((m) => m.contraste ?? 99));
    verdict(nom, defauts.length === 0,
        `${mesures.length} légende(s), police ${mesures[0].police}px, contraste mini ${pire}:1${defauts.length ? ' · ' + [...new Set(defauts)].slice(0, 4).join(' · ') : ''}`);
}

// ── VOLET A : formulaires, téléphone ─────────────────────────────────────────────────────────────

// Sections réelles par type (`Create*Review/index.jsx`) : le comestible n'a pas de Texture.
const TYPES = [
    { type: 'flower', texture: true },
    { type: 'hash', texture: true },
    { type: 'concentrate', texture: true },
    { type: 'edible', texture: false },
];

/** Ouvre une section du formulaire mobile par son onglet-émoji (bouton dont le texte EST l'émoji). */
async function ouvrirSection(p, emoji) {
    const idx = await p.evaluate((e) => [...document.querySelectorAll('button')].findIndex((x) => (x.innerText || '').trim() === e), emoji);
    if (idx < 0) return false;
    await p.locator('button').nth(idx).click().catch(() => {});
    await sleep(2200);
    return true;
}

console.log('── Volet A : formulaires à 390×844 ──');
for (const { type, texture } of TYPES) {
    const id = await createFixture(API, type, 'minimal', AVEC_PUISSANCE);
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const erreurs = [];
    p.on('pageerror', (e) => erreurs.push(String(e.message).slice(0, 140)));
    try {
        await p.goto(`${BASE}/edit/${type}/${id}`, { waitUntil: 'networkidle' }); await sleep(5000);
        // Mode auto ouvert par défaut sur téléphone : on le quitte (les sections n'existent qu'en mode normal).
        const auto = p.locator('button', { hasText: /^Mode auto$/ }).first();
        if (await auto.count()) { await auto.click().catch(() => {}); await sleep(3500); }

        // Effets : bloc de puissance, un curseur par effet coché, valeur enregistrée relue.
        if (!(await ouvrirSection(p, '💥'))) { verdict(`${type} · section Effets`, false, 'onglet 💥 introuvable'); continue; }
        const bloc = p.locator('[data-effects-power]').first();
        if (!(await bloc.count())) {
            verdict(`${type} · puissance des effets`, false, 'bloc [data-effects-power] absent malgré 3 effets cochés');
        } else {
            await bloc.scrollIntoViewIfNeeded().catch(() => {});
            await sleep(400);
            const texte = (await bloc.innerText()).replace(/\s+/g, ' ');
            const curseurs = await bloc.locator('[data-slider-bounds]').count();
            const titre = /Puissance de chaque effet/.test(texte);
            const relu = /Relaxant.*8\/10/.test(texte) && /Euphorique.*5\/10/.test(texte) && /Créatif.*3\/10/.test(texte);
            verdict(`${type} · puissance des effets`, titre && curseurs === EFFETS.length && relu,
                `titre ${titre ? 'présent' : 'ABSENT'}, ${curseurs}/${EFFETS.length} curseurs, valeurs ${relu ? 'relues (8/5/3)' : 'NON relues'}`);
            jugerBornes(`${type} · bornes de puissance`, await lisibilite(p, bloc), '1 · À peine perceptible ··· 10 · Dominant');
            await bloc.screenshot({ path: `${OUT}/effects-power-form-${type}.png` }).catch(() => {});
        }

        if (texture) {
            await ouvrirSection(p, '🤚');
            const sec = p.locator('main');
            jugerBornes(`${type} · bornes Texture`, await lisibilite(p, sec));
            const premier = sec.locator('[data-slider-bounds]').first();
            if (await premier.count()) await premier.locator('xpath=../..').screenshot({ path: `${OUT}/effects-power-texture-${type}.png` }).catch(() => {});
        }

        await ouvrirSection(p, '😋');
        const gouts = p.locator('main');
        jugerBornes(`${type} · bornes Goûts`, await lisibilite(p, gouts));
        const premierG = gouts.locator('[data-slider-bounds]').first();
        if (await premierG.count()) await premierG.locator('xpath=../..').screenshot({ path: `${OUT}/effects-power-taste-${type}.png` }).catch(() => {});

        if (erreurs.length) verdict(`${type} · erreurs JS`, false, erreurs.slice(0, 2).join(' | '));
    } finally {
        await ctx.close();
        await deleteFixture(API, id);
    }
}

// ── VOLET B : les 5 templates, sur /r/:id ────────────────────────────────────────────────────────

const TEMPLATES = ['detailedCard', 'modernCompact', 'blogArticle', 'socialStory', 'traceabilityReport'];

/** Texte du canevas de rendu (scopé : le reste de la page ne compte pas). */
async function rendu(p, id) {
    await p.goto(`${BASE}/r/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);
    return p.evaluate(() => {
        const root = document.querySelector('#export-maker-screen-canvas') || document.querySelector('[data-ratio]');
        return root ? root.innerText.replace(/\s+/g, ' ') : null;
    });
}

console.log('\n── Volet B : 5 templates sur /r/:id ──');
const ctxB = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const pB = await ctxB.newPage();
pB.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 140)));
try {
    for (const template of TEMPLATES) {
        const config = JSON.stringify({ template });
        const avec = await createFixture(API, 'flower', 'nominal', { ...AVEC_PUISSANCE, exportMakerConfig: config });
        const sans = await createFixture(API, 'flower', 'nominal', { effetsChoisis: JSON.stringify(EFFETS), exportMakerConfig: config });
        try {
            const t = await rendu(pB, avec);
            if (t === null) { verdict(`${template} · rendu`, false, 'canevas introuvable'); continue; }
            const manquants = ATTENDUS.filter((a) => !t.includes(a));
            verdict(`${template} · puissance renseignée`, manquants.length === 0,
                manquants.length ? `absent : ${manquants.join(', ')}` : `${ATTENDUS.length}/3 pastilles « Effet · n/10 »`);
            const cible = pB.getByText(ATTENDUS[0], { exact: true }).first();
            if (await cible.count()) {
                // La capture englobe le bloc qui porte la pastille, pas seulement le mot.
                const bloc = cible.locator('xpath=ancestor::*[@data-module][1]');
                const zone = (await bloc.count()) ? bloc : cible.locator('xpath=../..');
                await zone.scrollIntoViewIfNeeded().catch(() => {});
                await zone.screenshot({ path: `${OUT}/effects-power-${template}.png` }).catch(() => {});
            }

            const t2 = await rendu(pB, sans);
            const fuite = /(Relaxant|Euphorique|Créatif) · \d+\/10/.test(t2 || '') || /Puissance des effets/i.test(t2 || '');
            verdict(`${template} · puissance non renseignée`, t2 !== null && !fuite, fuite ? 'pastille ou titre de puissance affiché sans donnée' : 'rien d’affiché, comme attendu');
        } finally {
            await deleteFixture(API, avec);
            await deleteFixture(API, sans);
        }
    }
} finally {
    await ctxB.close();
    await b.close();
}

console.log(ko === 0
    ? '\nOK — curseurs de puissance et légendes de bornes lisibles à 390×844 ; puissance rendue dans les 5 templates'
    : `\n${ko} défaut(s)`);
process.exit(ko ? 1 : 0);
