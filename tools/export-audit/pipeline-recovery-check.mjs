/**
 * Un pipeline dont la CONFIG est vide mais dont les DONNÉES existent s'affiche-t-il ?
 *
 * Cas réel (review « GMO », lue en base le 2026-08-11) : `cultureTimelineConfig` vaut `{}` — deux
 * caractères — alors que `cultureTimelineData` porte 25 relevés estampillés `phase-0`…`phase-12`,
 * et que le formulaire affiche bien « 13 phases · 13/13 · 100 % ». Résultat dans tous les rendus :
 * le pipeline Culture disparaissait entièrement, seul Curing restait — « je vois pas les bonnes
 * pipelines ». On reproduit exactement cette forme de données et on compte ce qui s'affiche.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 13 phases documentées, comme la review réelle.
const cultureData = Array.from({ length: 13 }, (_, i) => ({
    timestamp: `phase-${i}`, temperature: 22 + (i % 4), humidity: 55 + (i % 5), co2Ppm: 800 + i * 10, ph: 6.2, ec: 1.4,
}));
// Curing : config VALIDE (5 semaines) dont 3 seulement documentées — sert de témoin, il doit
// afficher 3/5 et non 3/3 : la trame vient de la config, le remplissage des données.
const curingData = [1, 2, 3].map((n) => ({ timestamp: `week-${n}`, temperature: 18, humidity: 60 }));

const fd = new FormData();
fd.append('nomCommercial', 'Audit config vide');
fd.append('title', 'Audit config vide');
fd.append('cultivar', 'Audit');
fd.append('cultureTimelineData', JSON.stringify(cultureData));
fd.append('cultureTimelineConfig', '{}');                       // ← le défaut à reproduire
fd.append('curingTimelineData', JSON.stringify(curingData));
fd.append('curingTimelineConfig', JSON.stringify({ type: 'semaine', mode: 'phases', totalWeeks: 5 }));
fd.append('images', new Blob([Uint8Array.from(atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
), (c) => c.charCodeAt(0))], { type: 'image/png' }), 'audit.png');

const res = await fetch(`${API}/api/flower-reviews`, { method: 'POST', body: fd });
if (!res.ok) throw new Error(`création : HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
const cree = await res.json();
// Les 4 routes de création n'ont pas la même enveloppe (cf. `fixtures.mjs`) — ne pas en supposer une.
const id = cree?.data?.id || cree?.review?.id || cree?.id;
if (!id) throw new Error(`aucun id dans ${JSON.stringify(cree).slice(0, 200)}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 140)));
let ko = 0;
try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(5000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(4000);
    // Sélectionner explicitement un template qui REND les pipelines : sans ça le contrôle dépend du
    // template mémorisé en session (Story n'en affiche aucun), et son résultat ne veut rien dire.
    await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click(); await sleep(5000);

    const vus = await p.evaluate(() => {
        const c = document.querySelector('#export-maker-screen-canvas') || document.querySelector('#export-maker-canvas');
        if (!c) return null;
        // Chaque grille affiche « <nom> … N/M documentées » dans son en-tête.
        const tout = (c.innerText || '').replace(/\s+/g, ' ');
        return { extrait: tout.slice(0, 400), aCulture: /Culture/.test(tout), aCuring: /Curing/.test(tout),
                 compteurs: (tout.match(/\d+\/\d+ documentées/g) || []) };
    });
    console.log('rendu :', JSON.stringify(vus, null, 1).slice(0, 700));
    const dit = (t) => JSON.stringify(vus || {}).includes(t);
    if (!dit('Culture')) { console.log('✖ Culture absente alors que 13 relevés existent'); ko++; }
    else if (!dit('13/13')) { console.log('✖ Culture présente mais mauvais décompte (attendu 13/13)'); ko++; }
    else console.log('✔ Culture affichée, 13/13');
    if (!dit('Curing')) { console.log('✖ Curing absent'); ko++; }
    else if (!dit('3/5')) { console.log('✖ Curing : décompte inattendu (attendu 3/5 — trame de 5 semaines, 3 documentées)'); ko++; }
    else console.log('✔ Curing affiché, 3/5');
} finally {
    await b.close();
    await fetch(`${API}/api/reviews/${id}`, { method: 'DELETE' }).catch(() => { });
}
process.exit(ko ? 1 : 0);
