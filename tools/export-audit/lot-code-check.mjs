// Parcours C (L16) : QR d'étiquette → /l/:code → fiche publique au téléphone. Usage :
//   node tools/export-audit/lot-code-check.mjs <reviewId> <code> [dossierCaptures]
import { chromium } from 'playwright';
const [, , ID, CODE, OUT = 'tools/export-audit/reports'] = process.argv;
const BASE = 'http://localhost:5173', API = 'http://localhost:3000/api';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ko = 0;
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
} finally { await b.close(); }
console.log(ko === 0 ? 'OK — parcours QR → fiche au téléphone' : `${ko} défaut(s)`);
