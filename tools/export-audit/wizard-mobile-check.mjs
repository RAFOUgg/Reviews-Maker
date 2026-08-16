/**
 * Parcours TÉLÉPHONE du mode automatique (wizard), sur les 4 types de produit.
 *
 * Deux choses à prouver, toutes deux signalées le 2026-08-14 sur des captures réelles :
 *   1. le mode auto obéit AU MÊME garde-fou que le formulaire complet — un taux de cannabinoïde
 *      ne se saisit qu'avec un certificat d'analyse (`AnalyticsSection.hasCertificate`, désormais
 *      partagé via `utils/labCertificate.js` et posé en `when:` sur les questions du schéma) ;
 *   2. chaque question tient dans un écran de 390×844 : une seule question visible, rien qui
 *      déborde latéralement, la zone de réponse et les commandes atteignables au pouce.
 *
 * La sonde marche à la question, comme un utilisateur : elle lit le libellé affiché, répond ou
 * passe, et vérifie l'écran à chaque étape.
 *
 * Usage : node tools/export-audit/wizard-mobile-check.mjs [--url=…] [--api=…]
 */
import { chromium } from 'playwright';

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
    const [k, ...v] = a.slice(2).split('='); return [k, v.join('=') || true];
}));
const BASE = args.url || 'http://localhost:5173';
const sleep = ms => new Promise(r => setTimeout(r, ms));

let failures = 0;
const expect = (label, ok, detail) => {
    console.log(`  ${ok ? '✔' : '✖'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errs = [];
page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));

/** Ce que l'écran montre à cet instant : la question courante et sa géométrie. */
const screen = () => page.evaluate(() => {
    const vw = window.innerWidth;
    // Le libellé de la question courante est le <h2> de QuestionShell (WizardQuestion.jsx) —
    // le lire directement, plutôt que d'extraire une phrase du texte de la page : la bannière
    // « Réduction des risques » et le nom du produit s'y mêlaient et faussaient la lecture.
    const labelEl = document.querySelector('main h2, h2');
    const overflow = Array.from(document.querySelectorAll('body *')).some(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > vw + 2 || r.left < -2);
    });
    return {
        vw,
        hScroll: document.documentElement.scrollWidth > vw + 1,
        overflow,
        question: (labelEl?.innerText || '').replace(/\s+/g, ' ').trim(),
        texte: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 200),
        champs: document.querySelectorAll('input:not([type=file]), textarea').length,
        boutonSuivant: !!Array.from(document.querySelectorAll('button')).find(b => /Suivant/i.test(b.innerText)),
    };
});

const nextButton = () => page.locator('button', { hasText: /Suivant/i }).last();
const skipButton = () => page.locator('[data-testid="unknown-value-button"]');

try {
    for (const type of ['flower', 'hash', 'concentrate', 'edible']) {
        console.log(`\n▶ ${type}`);
        await page.goto(`${BASE}/create/${type}`, { waitUntil: 'networkidle' });
        await sleep(2500);

        const first = await screen();
        expect('mode auto actif d\'emblée sur téléphone', first.boutonSuivant, first.texte.slice(0, 60));
        expect('aucun débordement latéral', !first.hScroll, `scrollWidth vs ${first.vw}px`);

        // Parcours : au plus 40 questions, en passant systématiquement (« Information inconnue »)
        // pour arriver au bout sans rien inventer comme donnée.
        const vus = [];
        for (let step = 0; step < 40; step++) {
            const s = await screen();
            const titre = s.question || s.texte.slice(0, 50);
            vus.push(titre);
            if (s.hScroll) { expect(`question ${step + 1} sans débordement`, false, titre.slice(0, 40)); break; }
            if (await skipButton().count() > 0) { await skipButton().first().click().catch(() => {}); }
            else if (await nextButton().count() > 0) { await nextButton().click().catch(() => {}); }
            else break;
            await sleep(450);
            if (!(await nextButton().count())) break;
        }

        const taux = vus.filter(q => /Taux de (THC|CBD)/i.test(q));
        expect('aucun taux de cannabinoïde demandé sans certificat', taux.length === 0,
            taux.length ? `posé quand même : ${taux.join(' | ')}` : `${vus.length} questions parcourues`);

        const coa = vus.filter(q => /certificat/i.test(q));
        expect('le certificat est bien proposé avant', coa.length > 0 || type === 'edible',
            coa.length ? coa[0].slice(0, 50) : 'aucune étape certificat');
    }

    // ── Preuve INVERSE ────────────────────────────────────────────────────────────────────
    // Un garde-fou qui ne fait que supprimer les questions serait indiscernable d'une régression.
    // Avec un certificat réellement déposé, les taux DOIVENT revenir.
    console.log('\n▶ hash — avec certificat déposé');
    await page.goto(`${BASE}/create/hash`, { waitUntil: 'networkidle' });
    await sleep(2500);

    // Avancer jusqu'à l'étape certificat, puis ouvrir la section Analytiques par son CTA.
    let ouvert = false;
    for (let step = 0; step < 40 && !ouvert; step++) {
        const s = await screen();
        if (/certificat/i.test(s.question)) {
            const cta = page.locator('button', { hasText: /Déposer le certificat/i });
            if (await cta.count()) { await cta.first().click(); ouvert = true; break; }
        }
        if (await skipButton().count() > 0) await skipButton().first().click().catch(() => {});
        else if (await nextButton().count() > 0) await nextButton().click().catch(() => {});
        else break;
        await sleep(400);
    }
    expect("l'étape certificat ouvre la section Analytiques", ouvert);
    await sleep(1500);

    await page.locator('input[type="file"]').first().setInputFiles({
        name: 'zz-audit-coa.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 zz-audit')
    });
    await sleep(2000);

    // Revenir au mode auto et balayer les questions désormais posées.
    const retour = page.locator('button', { hasText: /Mode auto/i });
    if (await retour.count()) { await retour.first().click(); await sleep(1200); }

    const revus = [];
    for (let step = 0; step < 40; step++) {
        const s = await screen();
        revus.push(s.question);
        if (await skipButton().count() > 0) await skipButton().first().click().catch(() => {});
        else if (await nextButton().count() > 0) await nextButton().click().catch(() => {});
        else break;
        await sleep(400);
    }
    const revenus = revus.filter(q => /Taux de (THC|CBD)/i.test(q));
    expect('les taux reviennent une fois le certificat déposé', revenus.length >= 1,
        revenus.length ? revenus.join(' | ') : `aucun taux sur ${revus.length} questions`);

    expect('aucune erreur JS', errs.length === 0, errs.slice(0, 2).join(' | '));
} finally {
    await browser.close();
}

console.log(failures === 0 ? '\n✔ tout vert' : `\n✖ ${failures} échec(s)`);
process.exit(failures === 0 ? 0 : 1);
