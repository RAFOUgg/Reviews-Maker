// Parcours C (L16) : QR d'étiquette → /l/:code → fiche publique au téléphone. Usage :
//   node tools/export-audit/lot-code-check.mjs [<reviewId> <code>] [dossierCaptures]
//
// Sans argument (cas de `run-all.mjs`, L21) la sonde crée SA review publique, lui fait attribuer un
// code de lot par la vraie route (`POST /api/reviews/:id/share-code`), puis la supprime. Elle
// exigeait jusqu'ici un id et un code passés à la main — lancée sans, elle visitait `/l/undefined`,
// affichait 3 défauts… et sortait à 0. Elle rend désormais un code de sortie.
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';
const argv = process.argv.slice(2);
const manuel = argv.length >= 2;
let [ID, CODE] = manuel ? argv : [];
const OUT = (manuel ? argv[2] : argv[0]) || 'tools/export-audit/reports';
const ROOT_API = (process.env.AUDIT_API || 'http://localhost:3000');
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5173'), API = `${ROOT_API}/api`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ko = 0;
let fixture = null;
if (!manuel) {
    fixture = await createFixture(ROOT_API, 'flower', 'nominal', { isPublic: 'true' });
    const res = await fetch(`${API}/reviews/${fixture}/share-code`, { method: 'POST' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.shareCode) {
        console.log(`KO — attribution du code de lot : HTTP ${res.status} ${JSON.stringify(json).slice(0, 120)}`);
        await deleteFixture(ROOT_API, fixture);
        process.exit(1);
    }
    [ID, CODE] = [fixture, json.shareCode];
    console.log(`review ${ID} · code ${CODE}`);
}
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
try {
    await p.goto(`${BASE}/l/${CODE}`, { waitUntil: 'networkidle' }); await sleep(3500);
    const ok = p.url().endsWith(`/r/${ID}`);
    const blocs = await p.locator('[data-module]').count();
    console.log(`/l/${CODE} → ${p.url().replace(BASE, '')} · ${blocs} bloc(s) rendu(s)`);
    if (!ok) { console.log('KO — le lien court ne mène pas à la fiche'); ko++; }
    if (blocs === 0) { console.log('KO — fiche vide au téléphone'); ko++; }
    await p.screenshot({ path: `${OUT}/lot-fiche-tel.png` });

    await p.goto(`${BASE}/l/${CODE}/etiquette`, { waitUntil: 'networkidle' }); await sleep(2000);
    const code = await p.locator('[data-lot-code]').innerText().catch(() => '');
    const qr = await p.locator('[data-lot-label] svg').count();
    console.log(`étiquette : code « ${code} », QR ${qr}`);
    if (code !== CODE || !qr) { console.log('KO — étiquette incomplète'); ko++; }
    await p.screenshot({ path: `${OUT}/lot-etiquette.png` });

    await fetch(`${API}/reviews/${ID}/visibility`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{"isPublic":false}' });
    // Lecture anonyme via le serveur de test (sans contournement dev) : cf. curl côté shell.
    await p.goto(`${BASE}/l/ZZZZZZZZ`, { waitUntil: 'networkidle' }); await sleep(1500);
    const inconnu = await p.getByText('Code inconnu').count();
    console.log(`code inconnu → message : ${inconnu}`);
    if (!inconnu) { console.log('KO — pas de message pour un code inconnu'); ko++; }
} catch (e) {
    console.log(`KO — ${e.message}`); ko++;
} finally {
    await b.close();
    if (fixture) await deleteFixture(ROOT_API, fixture);
}
console.log(ko === 0 ? 'OK — parcours QR → fiche au téléphone' : `${ko} défaut(s)`);
process.exit(ko ? 1 : 0);
