/**
 * Vérification de « Créer une bulle depuis le presse-papiers » (menu contextuel du fond, canevas
 * Chaîne de production) et de l'aller-retour avec « Copier les données » (menu d'une bulle).
 *
 * Ce qui est mesuré, et pourquoi :
 *  - le TEXTE réellement écrit dans le presse-papiers du navigateur, pas ce que le code prétend y
 *    mettre : un intertitre (`group: true`) n'a pas de valeur, et la mise en forme le concaténait
 *    en « Culture — J4 : undefined » — un défaut invisible tant que personne ne recollait la copie ;
 *  - la bulle recréée est comparée LIGNE À LIGNE à l'originale (titre, intertitre resté intertitre,
 *    libellé + unité intacts) : un collage qui perdrait la structure passerait un simple test
 *    « une bulle de plus est apparue » ;
 *  - la bulle est relue par l'API puis après rechargement — une carte seulement optimiste
 *    disparaîtrait au retour de l'utilisateur.
 *
 * Usage : node tools/export-audit/bubble-paste-check.mjs [--url=…] [--api=…]
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const expect = (label, ok, detail) => {
    console.log(`  ${ok ? '✔' : '✖'} ${label}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures++;
};

const { id: reviewId, chainId, upstreamId } = await createFixtureWithCanvases(API, 'flower', 'nominal');
console.log('fixture', reviewId, '· chaîne', chainId || 'AUCUNE');
if (!chainId) {
    console.error('✖ fixture sans chaîne : la sonde ne mesurerait rien.');
    process.exit(1);
}

// Bulle d'origine : un intertitre PUIS des données — c'est exactement la forme que produit
// « Épingler les données en bulle » sur un nœud portant des cellules de pipeline, donc le cas
// réel où la copie perdait sa structure.
const SOURCE_BUBBLE = {
    title: 'ZZ-AUDIT Extraction — ext-2',
    body: [
        { label: 'Culture — J4', group: true },
        { label: 'Température', value: '24 °C' },
        { label: 'Humidité', value: '68 %' },
        { label: 'Méthode d\'extraction', value: 'live-rosin' }
    ],
    position: { x: 80, y: 420 }
};
await fetch(`${API}/api/production-chains/chains/${chainId}/annotations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SOURCE_BUBBLE)
});

const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    permissions: ['clipboard-read', 'clipboard-write']
});
const page = await context.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));

const readBubbles = () => page.evaluate(() => Array.from(document.querySelectorAll('.chain-annotation-card')).map(c => ({
    title: c.querySelector('.chain-annotation-title')?.innerText.trim() || '',
    source: c.querySelector('.chain-annotation-source')?.innerText.trim() || '',
    // innerText rend l'intertitre en capitales (CSS) : on garde la STRUCTURE (groupe vs ligne),
    // la comparaison de texte se fait insensible à la casse plus bas.
    lines: Array.from(c.querySelectorAll('.chain-annotation-group, .chain-annotation-line'))
        .map(el => el.classList.contains('chain-annotation-group')
            ? { group: true, text: el.innerText.replace(/\s+/g, ' ').trim() }
            : {
                group: false,
                label: el.querySelector('.chain-annotation-line-label')?.innerText.replace(/\s+/g, ' ').trim() || '',
                value: el.querySelector('.chain-annotation-line-value')?.innerText.replace(/\s+/g, ' ').trim() || ''
            })
})));

try {
    await page.goto(`${BASE}/library/production-chains/${chainId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(900);

    const before = await readBubbles();
    const original = before.find(b => b.title.includes('ZZ-AUDIT'));
    expect('bulle d\'origine affichée', !!original, original?.title);

    // ── 1. Copier les données ───────────────────────────────────────────────────────────────
    await page.locator('.chain-annotation-card', { hasText: 'ZZ-AUDIT' }).first().click({ button: 'right' });
    await page.waitForSelector('.context-menu', { timeout: 5000 });
    await page.locator('.context-menu-item', { hasText: 'Copier les données' }).first().click();
    await sleep(800);

    // Le presse-papiers de Windows normalise les fins de ligne en \r\n : comparer sans les ramener
    // à \n faisait échouer la sonde sur « Culture — J4\r », pas sur le contenu.
    const clipboard = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n?/g, '\n');
    expect('texte réellement écrit dans le presse-papiers', clipboard.length > 0, JSON.stringify(clipboard.slice(0, 80)));
    expect('aucun « undefined » sur l\'intertitre (valeur inexistante par nature)',
        !/undefined/.test(clipboard), clipboard.replace(/\n/g, ' ⏎ ').slice(0, 120));
    expect('intertitre copié seul, données copiées en « libellé : valeur »',
        clipboard.split('\n')[1] === 'Culture — J4' && /Température : 24 °C/.test(clipboard),
        clipboard.split('\n').slice(0, 3).join(' ⏎ '));

    // ── 2. Créer une bulle depuis le presse-papiers ─────────────────────────────────────────
    // Point de fond CHERCHÉ (les coins portent contrôles de zoom, barre d'outils et panneaux).
    const spot = await page.evaluate(() => {
        const pane = document.querySelector('.react-flow__pane');
        const r = pane.getBoundingClientRect();
        for (const fy of [0.9, 0.1, 0.5, 0.75]) {
            for (const fx of [0.08, 0.92, 0.5, 0.3]) {
                const x = r.x + r.width * fx, y = r.y + r.height * fy;
                if (document.elementFromPoint(x, y) === pane) return { x, y };
            }
        }
        return null;
    });
    expect('un point de fond libre trouvé pour le clic droit', !!spot);
    if (!spot) throw new Error('aucun point de fond atteignable');

    await page.mouse.click(spot.x, spot.y, { button: 'right' });
    await page.waitForSelector('.context-menu', { timeout: 5000 });
    const pasteItem = page.locator('.context-menu-item', { hasText: 'presse-papiers' });
    expect('entrée « Créer une bulle depuis le presse-papiers » présente', await pasteItem.count() > 0);
    if (await pasteItem.count() === 0) throw new Error('entrée de menu absente');
    await pasteItem.first().click();
    await sleep(2000);

    // Le presse-papiers étant lisible ici (permission accordée), la bulle doit être créée
    // directement — la modale de collage manuel est le chemin de repli, pas le chemin nominal.
    const modalOpen = await page.locator('textarea').count() > 0;
    expect('création directe quand le presse-papiers est lisible (pas de modale)', !modalOpen);

    const after = await readBubbles();
    expect('une bulle de plus sur le canevas', after.length === before.length + 1, `${before.length} → ${after.length}`);

    const pasted = after.filter(b => b.title.includes('ZZ-AUDIT')).find(b => /coll/i.test(b.source));
    expect('bulle collée identifiée comme telle', !!pasted, pasted?.source);
    if (pasted && original) {
        expect('titre conservé', pasted.title === original.title, `${original.title} → ${pasted.title}`);
        expect('même nombre de lignes qu\'à l\'origine', pasted.lines.length === original.lines.length,
            `${original.lines.length} → ${pasted.lines.length}`);
        expect('intertitre resté un intertitre (pas transformé en donnée)',
            pasted.lines[0]?.group === true && /culture/i.test(pasted.lines[0]?.text || ''),
            JSON.stringify(pasted.lines[0]));
        expect('libellés et unités intacts',
            pasted.lines.some(l => !l.group && /Température/.test(l.label) && /24 °C/.test(l.value))
            && pasted.lines.some(l => !l.group && /Humidité/.test(l.label) && /68 %/.test(l.value)),
            pasted.lines.filter(l => !l.group).map(l => `${l.label}=${l.value}`).join(' | '));
    }

    // La bulle doit être posée LÀ où le clic droit a eu lieu, pas au centre du canevas.
    const distance = await page.evaluate((s) => {
        const cards = Array.from(document.querySelectorAll('.chain-annotation-card'));
        const card = cards.find(c => /coll/i.test(c.querySelector('.chain-annotation-source')?.innerText || ''));
        if (!card) return null;
        const r = card.getBoundingClientRect();
        return Math.hypot(r.x - s.x, r.y - s.y);
    }, spot);
    expect('bulle posée au point du clic droit', distance !== null && distance < 120, `${Math.round(distance)}px du clic`);

    // ── 3. Persistance ──────────────────────────────────────────────────────────────────────
    const chainAfter = await (await fetch(`${API}/api/production-chains/chains/${chainId}`)).json();
    const persisted = (chainAfter.annotations || []).filter(a => /coll/i.test(a.sourceLabel || ''));
    expect('bulle collée persistée côté serveur', persisted.length === 1,
        `${persisted.length} annotation(s) · corps ${JSON.stringify(persisted[0]?.body || []).length} car.`);
    // `body` revient en CHAÎNE JSON (colonne stockée telle quelle) — le client la parse au rendu ;
    // la sonde doit faire pareil, sinon elle conclut à tort à une structure perdue.
    const persistedBody = typeof persisted[0]?.body === 'string'
        ? (() => { try { return JSON.parse(persisted[0].body); } catch { return null; } })()
        : persisted[0]?.body;
    expect('structure du corps persistée (intertitre + données)',
        Array.isArray(persistedBody) && persistedBody[0]?.group === true && persistedBody.length === SOURCE_BUBBLE.body.length,
        JSON.stringify(persistedBody || []).slice(0, 120));

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.react-flow__node', { timeout: 15000 });
    await sleep(900);
    const reloaded = await readBubbles();
    expect('bulle toujours là après rechargement', reloaded.length === after.length, `${after.length} → ${reloaded.length}`);

    expect('aucune erreur JS', errs.length === 0, errs.join(' | '));

    // ── 4. Chemin de repli : presse-papiers ILLISIBLE ───────────────────────────────────────
    // Firefox refuse `readText()` aux pages web, et l'autorisation peut être refusée ailleurs.
    // Contexte SANS permission de lecture : l'action doit alors ouvrir la modale de collage
    // manuel, pas rester sans effet.
    console.log('\nRepli sans autorisation de lecture du presse-papiers');
    const blindContext = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const blind = await blindContext.newPage();
    try {
        await blind.goto(`${BASE}/library/production-chains/${chainId}`, { waitUntil: 'networkidle' });
        await blind.waitForSelector('.react-flow__node', { timeout: 15000 });
        await sleep(900);

        const blindSpot = await blind.evaluate(() => {
            const pane = document.querySelector('.react-flow__pane');
            const r = pane.getBoundingClientRect();
            for (const fy of [0.9, 0.1, 0.5]) for (const fx of [0.08, 0.92, 0.5]) {
                const x = r.x + r.width * fx, y = r.y + r.height * fy;
                if (document.elementFromPoint(x, y) === pane) return { x, y };
            }
            return null;
        });
        await blind.mouse.click(blindSpot.x, blindSpot.y, { button: 'right' });
        await blind.waitForSelector('.context-menu', { timeout: 5000 });
        await blind.locator('.context-menu-item', { hasText: 'presse-papiers' }).first().click();

        const area = blind.locator('textarea');
        await area.waitFor({ timeout: 5000 }).catch(() => {});
        expect('modale de collage manuel ouverte quand la lecture est refusée', await area.count() > 0);

        await area.fill('ZZ-AUDIT Collage manuel\nLot d\'origine\nPoids net : 3 g');
        await sleep(400);
        const previewText = await blind.locator('.fixed').last().innerText().catch(() => '');
        expect('aperçu de la bulle avant création', /Poids net/.test(previewText) && /Collage manuel/.test(previewText));

        await blind.locator('button', { hasText: 'Créer la bulle' }).first().click();
        await sleep(1800);

        const manual = await blind.evaluate(() => Array.from(document.querySelectorAll('.chain-annotation-card'))
            .map(c => c.innerText.replace(/\s+/g, ' '))
            .find(t => /Collage manuel/.test(t)) || null);
        expect('bulle créée depuis la saisie manuelle', !!manual, (manual || '').slice(0, 80));
        expect('modale refermée après création', await blind.locator('textarea').count() === 0);
    } finally {
        await blindContext.close();
    }
} finally {
    await browser.close();
    await deleteFixture(API, reviewId);
    if (upstreamId) await deleteFixture(API, upstreamId);
}

console.log(failures === 0 ? '\n✔ tout vert' : `\n✖ ${failures} échec(s)`);
process.exit(failures === 0 ? 0 : 1);
