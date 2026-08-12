/**
 * CALIBRATION — jusqu'où les tailles de police tiennent-elles réellement dans le canevas ?
 *
 * Point de départ : une capture utilisateur montrant un titre à 61px et un texte à 32px qui sortent
 * du cadre. Les curseurs autorisent 20-72px (titre) et 12-32px (texte) sans que rien ne borne le
 * résultat par rapport à la taille du canevas — or 72px sur un carré de 800px et 72px sur un A4 de
 * 2480px ne posent pas le même problème.
 *
 * Ce script ne corrige rien : il BALAIE le domaine et relève où le rendu casse, pour que le plafond
 * posé ensuite soit une valeur mesurée et non un chiffre de confort. Sortie : tableau
 * template × ratio × taille → erreurs de l'auditeur.
 *
 *   node tools/export-audit/typography-domain-check.mjs
 */
import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFixture, deleteFixture } from './fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_SCRIPT = resolve(__dirname, 'auditRules.js');
const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Combinaisons les plus contraintes (carré) et les plus courantes (16:9), plus un A4 témoin.
const CAS = [
    { template: 'detailedCard', ratio: '1:1', nom: 'Fiche 1:1' },
    { template: 'detailedCard', ratio: '16:9', nom: 'Fiche 16:9' },
    { template: 'modernCompact', ratio: '1:1', nom: 'Compact 1:1' },
    { template: 'detailedCard', ratio: 'A4', nom: 'Fiche A4' },
];

// Défaut, puis trois crans jusqu'au maximum des curseurs.
const TAILLES = [
    { titleSize: 32, textSize: 16, nom: 'défaut 32/16' },
    { titleSize: 48, textSize: 22, nom: '48/22' },
    { titleSize: 61, textSize: 32, nom: '61/32 (capture)' },
    { titleSize: 72, textSize: 32, nom: 'max 72/32' },
];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 140)));

async function auditer(config) {
    const id = await createFixture(API, 'flower', 'dense', { exportMakerConfig: JSON.stringify(config) });
    try {
        await p.goto(`${BASE}/review/${id}`, { waitUntil: 'networkidle' });
        await sleep(2000);
        const trigger = p.getByRole('button', { name: /^Exporter$/ }).first();
        if (!(await trigger.count())) return null;
        await trigger.click();
        await sleep(Number(process.env.AUDIT_EXPORT_WAIT_MS || 14000));
        await p.addScriptTag({ path: AUDIT_SCRIPT });
        return await p.evaluate(() => {
            const pages = [...document.querySelectorAll('.export-maker-page')];
            const cibles = pages.length ? pages : [document.querySelector('#export-maker-canvas')].filter(Boolean);
            if (!cibles.length) return null;
            const res = cibles.map((el) => window.__exportAudit.auditRender(el, { paged: true }));
            return {
                pages: res.length,
                remplissage: res.map((r) => r.stats?.fillPercent ?? null),
                erreurs: res.flatMap((r) => (r.violations || []).filter((v) => v.severity === 'error').map((v) => v.rule)),
                // Le détail des messages d'erreur : un « E6 » ne dit pas s'il s'agit d'un
                // débordement (>100 %) ou d'une page creuse (<65 %) — or c'est toute la question ici.
                messages: res.flatMap((r) => (r.violations || []).filter((v) => v.severity === 'error').map((v) => v.message)),
            };
        });
    } finally {
        await deleteFixture(API, id);
    }
}

try {
    for (const cas of CAS) {
        console.log(`\n▶ ${cas.nom}`);
        for (const t of TAILLES) {
            const r = await auditer({
                template: cas.template, ratio: cas.ratio,
                typography: { fontFamily: 'Inter', titleSize: t.titleSize, textSize: t.textSize, titleWeight: '700', textWeight: '400' },
            });
            if (!r) { console.log(`   ${t.nom.padEnd(16)} — aucune page montée`); continue; }
            const err = r.erreurs.length ? [...new Set(r.erreurs)].join(',') : '—';
            console.log(`   ${t.nom.padEnd(16)} ${String(r.pages).padStart(2)}p · ${r.erreurs.length} err (${err}) · ${r.remplissage.join('/')}%`);
            // Seuls les débordements comptent pour calibrer un plafond : une page creuse relève du
            // chantier D, pas de la typographie.
            for (const m of [...new Set(r.messages)].filter((m) => /coupé|dépass|débord|100/.test(m))) {
                console.log(`        ↳ ${m.slice(0, 150)}`);
            }
        }
    }
} finally {
    await b.close();
}
