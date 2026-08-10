/*
 * Pilote de l'auditeur de rendu Export Maker (plan C5 §5.1).
 *
 * Parcourt la matrice template × format × PAGES, injecte `auditRules.js` dans la page réelle et
 * collecte les violations mesurables. Produit un rapport JSON + un résumé lisible.
 *
 * Deux modes :
 *   --review=<id> [--type=flower]   audite une review existante
 *   --matrix                        crée les fixtures (4 types × 3 densités), audite, nettoie
 *
 * Options : --url, --api, --templates, --ratios, --types, --densities, --keep
 * Prérequis : le client (5173) et l'API (3000) tournent.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createFixture, createFixtureWithCanvases, deleteFixture, DENSITIES, TYPES } from './fixtures.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIT_SCRIPT = resolve(__dirname, 'auditRules.js');

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);

const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';

const TEMPLATE_LABELS = {
    modernCompact: 'Moderne Compact',
    detailedCard: 'Fiche Technique Détaillée',
    blogArticle: 'Article de Blog',
    socialStory: 'Story Social Media',
    traceabilityReport: 'Rapport de Traçabilité',
};
const RATIO_LABELS = {
    '1:1': 'Carré (1:1)', '16:9': 'Paysage (16:9)', '9:16': 'Portrait (9:16)',
    '4:3': 'Standard (4:3)', 'A4': 'A4 (Document)',
};

const templates = args.templates ? String(args.templates).split(',') : Object.keys(TEMPLATE_LABELS);
const ratios = args.ratios ? String(args.ratios).split(',') : Object.keys(RATIO_LABELS);
const types = args.types ? String(args.types).split(',') : TYPES;
const densities = args.densities ? String(args.densities).split(',') : DENSITIES;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Agrège par règle — la vue utile pour décider quoi corriger en premier. */
function summarize(violations) {
    const byRule = {};
    for (const v of violations) {
        if (!byRule[v.rule]) byRule[v.rule] = { rule: v.rule, error: 0, warn: 0, sample: null };
        byRule[v.rule][v.severity] += 1;
        if (!byRule[v.rule].sample) byRule[v.rule].sample = v.message;
    }
    return Object.values(byRule).sort((a, b) => (b.error - a.error) || (b.warn - a.warn));
}

/** Ouvre le panneau Export Maker sur la page courante. */
async function openPanel(page) {
    if (await page.locator('text=Choix du Template').count()) return true;
    for (const name of [/^Aperçu$/, /^Exporter$/]) {
        const t = page.getByRole('button', { name }).first();
        if (await t.count()) {
            await t.click();
            await sleep(3500);
            if (await page.locator('text=Choix du Template').count()) return true;
        }
    }
    return false;
}

/**
 * Audite via la MODALE D'EXPORT plutôt que l'aperçu Studio.
 *
 * Raison : `ExportMakerPanel.jsx` note explicitement que « la pagination ne s'active plus
 * automatiquement — l'utilisateur choisit via le toggle ». L'aperçu Studio reste donc sur une page
 * unique, et le mode Document — le seul où E4/E6 ont un sens — n'y est jamais représenté.
 *
 * La modale, elle, monte TOUTES les pages hors-écran (`.export-maker-page`) : c'est exactement ce
 * qui part au fichier. On audite donc le livrable, pas son aperçu. Le bouton « Exporter » du
 * Studio l'ouvre avec la config de session — aucune sauvegarde ni navigation nécessaire.
 */
async function auditViaExportModal(page, subjectId) {
    // Étape 1 — figer la config de session sur la review. Vérifié à l'exécution : ouvrir la modale
    // DEPUIS le Studio n'y monte pas les pages (seul `#export-maker-canvas` existe). Le montage
    // hors-écran des `.export-maker-page` n'a lieu que depuis la page de détail, qui lit la config
    // SAUVEGARDÉE — d'où ce passage par « Appliquer ».
    const apply = page.getByRole('button', { name: /^Appliquer$/ }).first();
    if (!(await apply.count())) return null;
    await apply.click();
    await sleep(2500);

    // Étape 2 — page de détail, puis ouverture de la modale : les pages s'y montent réellement.
    await page.goto(`${BASE}/review/${subjectId}`, { waitUntil: 'networkidle' });
    await sleep(2000);
    const trigger = page.getByRole('button', { name: /^Exporter$/ }).first();
    if (!(await trigger.count())) return null;
    await trigger.click();
    await sleep(Number(process.env.AUDIT_EXPORT_WAIT_MS || 7000));

    const res = await auditCurrent(page);
    return res;
}

/** Audite la page actuellement affichée. */
async function auditCurrent(page) {
    await page.addScriptTag({ path: AUDIT_SCRIPT });
    return page.evaluate(() => {
        const canvases = [...document.querySelectorAll('.export-maker-page')];
        const targets = canvases.length
            ? canvases
            : [document.querySelector('#export-maker-canvas')].filter(Boolean);
        if (!targets.length) return null;
        const out = targets.map((el) => window.__exportAudit.auditRender(el, { paged: true }));
        // Sonde `FitToFill` — l'inférence depuis le remplissage n'a jamais permis de diagnostiquer
        // un débordement (3 tentatives infructueuses sur Story 1:1). On lit l'état RÉEL du
        // composant : si `scale` vaut exactement la borne, c'est le bridage qui bloque, pas la
        // mesure. Cf. C7 §0.2.
        const fit = document.querySelector('[data-fit-scale]');
        if (fit && out[0]) {
            out[0].fitProbe = {
                scale: fit.getAttribute('data-fit-scale'),
                avail: fit.clientHeight,
                contentBottom: (() => {
                    const inner = fit.firstElementChild;
                    if (!inner) return null;
                    const top = inner.getBoundingClientRect().top;
                    const scope = inner.firstElementChild || inner;
                    let b = 0;
                    [...scope.children, ...inner.querySelectorAll('[data-module]')].forEach((el) => {
                        b = Math.max(b, el.getBoundingClientRect().bottom - top);
                    });
                    return Math.round(b);
                })(),
            };
        }
        // Sonde de pagination — même principe que `fitProbe` : le remplissage seul ne dit jamais
        // POURQUOI une page déborde. On lit le budget réellement appliqué et le coût de chaque
        // module, publiés par `computeAdaptivePages`. Sans elle, le débordement A4 de la Fiche
        // Technique se diagnostiquait par déduction — trois tentatives infructueuses.
        const probe = window.__adaptivePaginationProbe;
        if (Array.isArray(probe) && probe.length && out[0]) out[0].paginationProbe = probe[probe.length - 1];
        return out;
    });
}

/**
 * Ouvre le Studio et sélectionne template + ratio.
 * Appelé avant CHAQUE combinaison : l'audit passe par la page de détail, on quitte donc le Studio
 * à chaque fois et il faut y revenir. Retourne 'ok' | 'locked' | 'absent'.
 */
async function setupCombo(page, { id, type }, tpl, ratio) {
    await page.goto(`${BASE}/edit/${type}/${id}`, { waitUntil: 'networkidle' });
    await sleep(2200);
    if (!(await openPanel(page))) return 'absent';

    const card = page.locator('button', { hasText: TEMPLATE_LABELS[tpl] }).first();
    if (!(await card.count())) return 'absent';
    if (await card.isDisabled().catch(() => false)) return 'locked';
    await card.click();
    await sleep(1200);

    const rBtn = page.locator('button', { hasText: RATIO_LABELS[ratio] }).first();
    if (!(await rBtn.count()) || await rBtn.isDisabled().catch(() => false)) return 'absent';
    await rBtn.click();
    await sleep(2500);
    return 'ok';
}

async function auditReview(page, subject) {
    const { id, label } = subject;
    const runs = [];
    const lockedSeen = new Set();

    for (const tpl of templates) {
        for (const ratio of ratios) {
            const status = await setupCombo(page, subject, tpl, ratio);
            if (status === 'locked') {
                if (!lockedSeen.has(tpl)) {
                    console.log(`  🔒 ${label} · ${TEMPLATE_LABELS[tpl]} — verrouillé pour ce compte`);
                    runs.push({ template: tpl, locked: true });
                    lockedSeen.add(tpl);
                }
                break; // inutile d'essayer les autres ratios
            }
            if (status !== 'ok') continue;

            const res = await auditViaExportModal(page, id);
            const pages = (res || []).map((r, i) => ({ page: i + 1, ...r }));
            if (!pages.length) {
                console.log(`  ⚠ ${label} · ${TEMPLATE_LABELS[tpl]} ${ratio} : aucune page montée`);
                continue;
            }
            const total = pages.length;

            const all = pages.flatMap((p) => p.violations);
            const errors = all.filter((v) => v.severity === 'error').length;
            const fills = pages.map((p) => p.stats.fillPercent).filter((f) => f != null);
            console.log(
                `  ${errors ? '✖' : '✔'} ${label} · ${TEMPLATE_LABELS[tpl].padEnd(26)} ${ratio.padEnd(5)} ` +
                `${pages.length}p · ${errors} err · ${all.length - errors} warn` +
                (fills.length ? ` · remplissage ${fills.join('/')}%` : '')
            );
            if (pages[0]?.paginationProbe) {
                const pp = pages[0].paginationProbe;
                console.log(`        ↳ budget ${pp.budgetPerColumn}px par colonne × ${pp.columns} col. (page ${pp.availableHeight}px × ${pp.safetyFactor})`);
                for (const m of pp.modules) {
                    console.log(`           ${m.id.padEnd(28)} h=${String(m.height).padStart(5)}  coût=${String(m.cost).padStart(5)}${m.fullWidth ? '  pleine largeur' : ''}`);
                }
            }
            if (pages[0]?.fitProbe) {
                const f = pages[0].fitProbe;
                console.log(`        ↳ fit: scale=${f.scale} avail=${f.avail} contenu=${f.contentBottom}`);
            }
            for (const s of summarize(all)) {
                if (!s.error) continue; // seules les erreurs au fil de l'eau ; les avert. sont dans le JSON
                console.log(`        ${s.rule} ×${s.error} — ${s.sample}`);
            }
            runs.push({ template: tpl, ratio, pageCount: total, pages });
        }
    }
    return runs;
}

async function main() {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e.message).slice(0, 200)));

    const report = { generatedAt: new Date().toISOString(), fixtures: [], runs: [] };
    const created = [];

    try {
        let subjects;
        if (args.matrix) {
            console.log('▶ Création des fixtures\n');
            subjects = [];
            for (const type of types) {
                for (const density of densities) {
                    try {
                        // Chaîne + arbre dès que la review n'est pas minimale : sans eux, les deux
                        // canevas ne sont JAMAIS exercés et une régression les faisant disparaître
                        // passe inaperçue (arrivé en production le 2026-08-06). `…WithCanvases`
                        // crée l'arbre AVANT la review, seul moment où `geneticTreeId` peut se
                        // poser — sans quoi l'arbre existe mais n'est rattaché à rien et le canevas
                        // de généalogie se masque (constaté le 2026-08-10 : mesuré à 16-32px).
                        let id, upstreamId;
                        if (density === 'minimal') {
                            id = await createFixture(API, type, density);
                        } else {
                            ({ id, upstreamId } = await createFixtureWithCanvases(API, type, density));
                        }
                        created.push(id);
                        // Review amont de la chaîne : à nettoyer comme les autres.
                        if (upstreamId) created.push(upstreamId);
                        subjects.push({ id, type, label: `${type}/${density}` });
                        console.log(`  ✔ ${type}/${density} → ${id.slice(0, 8)}`);
                    } catch (e) {
                        console.log(`  ✖ ${type}/${density} : ${e.message}`);
                    }
                }
            }
            console.log('');
        } else if (args.review) {
            subjects = [{ id: args.review, type: args.type || 'flower', label: 'review' }];
        } else {
            console.error('Usage : --matrix  |  --review=<id> [--type=flower]');
            process.exit(1);
        }

        report.fixtures = subjects;
        for (const s of subjects) {
            const runs = await auditReview(page, s);
            report.runs.push({ subject: s, runs });
        }
    } finally {
        if (created.length && !args.keep) {
            let ok = 0;
            for (const id of created) if (await deleteFixture(API, id)) ok++;
            console.log(`\n▶ Fixtures supprimées : ${ok}/${created.length}`);
        }
        await browser.close();
    }

    report.pageErrors = pageErrors;
    mkdirSync(resolve(__dirname, 'reports'), { recursive: true });
    const out = resolve(__dirname, 'reports', `audit-${Date.now()}.json`);
    writeFileSync(out, JSON.stringify(report, null, 2));

    // Synthèse globale — c'est elle qui pilote les priorités de correction.
    const all = report.runs.flatMap((r) => r.runs.flatMap((x) => (x.pages || []).flatMap((p) => p.violations)));
    console.log('\n▶ Synthèse toutes combinaisons');
    for (const s of summarize(all)) {
        console.log(`   ${s.rule.padEnd(4)} ${String(s.error).padStart(4)} err  ${String(s.warn).padStart(4)} warn   ${s.sample}`);
    }
    console.log(`\n▶ Rapport : ${out}`);
    if (pageErrors.length) console.log(`⚠ ${pageErrors.length} erreur(s) JS en page`);
}

main().catch((e) => { console.error(e); process.exit(1); });
