// Sélecteur de couleur « à peindre » (L6) : une couleur existante se relit sur la silhouette,
// et deux gestes (une teinte + un glissé) suffisent à la changer, enregistrée au même format.
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';
const BASE = (process.env.AUDIT_BASE || 'http://localhost:5173'), API = (process.env.AUDIT_API || 'http://localhost:3000');
const OUT = process.argv[2] || 'tools/export-audit/reports';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ko = 0;
const initial = [{ colorId: 'green', percentage: 60, parts: [] }, { colorId: 'purple', percentage: 40, parts: [] }];
const id = await createFixture(API, 'flower', 'minimal', { couleurNuancier: JSON.stringify(initial) });
console.log('review', id);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(5000);
    const nav = p.locator('button', { hasText: '👁️' }).first(); // nav de sections = emojis
    if (await nav.count()) { await nav.click(); await sleep(2500); }
    const sil = p.locator('[data-paintable-silhouette="bud"]').first();
    if (!(await sil.count())) throw new Error('silhouette introuvable — la sonde ne mesure rien');
    const avant = await sil.locator('[data-paint-legend]').innerText().catch(() => '');
    console.log('relu :', avant.replace(/\s+/g, ' '));
    if (!/60 %/.test(avant) || !/40 %/.test(avant)) { console.log('KO — la couleur existante (60/40) n’est pas relue'); ko++; }

    // Geste 1 : la teinte. Geste 2 : un glissé de haut en bas.
    await sil.getByRole('button', { name: 'Orange' }).click();
    const box = await sil.locator('svg').boundingBox();
    await p.mouse.move(box.x + box.width / 2, box.y + 4);
    await p.mouse.down();
    for (let y = 4; y <= box.height - 4; y += 6) await p.mouse.move(box.x + box.width / 2, box.y + y);
    await p.mouse.up(); await sleep(600);
    const apres = await sil.locator('[data-paint-legend]').innerText().catch(() => '');
    console.log('après glissé :', apres.replace(/\s+/g, ' '));
    if (!/Orange · 100 %/.test(apres)) { console.log('KO — le glissé n’a pas peint toute la silhouette'); ko++; }
    await p.screenshot({ path: `${OUT}/color-paint-bud.png` });

    await sleep(5000); // autosave
    const r = await (await fetch(`${API}/api/flower-reviews/${id}`)).json();
    const stored = r.flowerData?.couleurNuancier ?? r.couleurNuancier;
    console.log('en base :', JSON.stringify(stored));
    const arr = typeof stored === 'string' ? JSON.parse(stored) : stored;
    if (!Array.isArray(arr) || arr[0]?.colorId !== 'orange' || arr[0]?.percentage !== 100) { console.log('KO — pas enregistré au format { colorId, percentage }'); ko++; }
} finally {
    await b.close();
    await deleteFixture(API, id).catch(() => {});
}
// Hash (L7) et rosin jar (L8) : silhouette propre + les teintes qui manquaient.
for (const [type, shape, teintes] of [['hash', 'hash', ['Violacée', 'Blanche']], ['concentrate', 'jar', ['Violacé', 'Rougeâtre']]]) {
    const fid = await createFixture(API, type, 'minimal', {});
    const b2 = await chromium.launch();
    const q = await b2.newPage({ viewport: { width: 1400, height: 900 } });
    try {
        await q.goto(`${BASE}/edit/${type}/${fid}`, { waitUntil: 'networkidle' }); await sleep(5000);
        const nav = q.locator('button', { hasText: '👁️' }).first();
        if (await nav.count()) { await nav.click(); await sleep(2500); }
        const s = q.locator(`[data-paintable-silhouette="${shape}"]`).first();
        const present = await s.count();
        const manquantes = [];
        for (const t of teintes) if (!(await s.getByRole('button', { name: t }).count())) manquantes.push(t);
        console.log(`${type} : silhouette ${shape} ${present ? 'présente' : 'ABSENTE'}${manquantes.length ? ', teintes manquantes : ' + manquantes.join(', ') : ''}`);
        if (!present || manquantes.length) ko++;
        if (present) {
            await s.getByRole('button', { name: teintes[0] }).click();
            const box = await s.locator('svg').boundingBox();
            await q.mouse.move(box.x + box.width / 2, box.y + box.height * 0.45); await q.mouse.down();
            for (let y = 0.45; y <= 0.95; y += 0.03) await q.mouse.move(box.x + box.width / 2, box.y + box.height * y);
            await q.mouse.up(); await sleep(500);
            await q.screenshot({ path: `${OUT}/color-paint-${shape}.png` });
        }
    } finally { await b2.close(); await deleteFixture(API, fid).catch(() => {}); }
}
console.log(ko === 0 ? 'OK — couleur relue, peinte en 2 gestes, enregistrée au même format' : `${ko} défaut(s)`);
// Code de sortie : sans lui la sonde affichait ses défauts mais sortait à 0 — invisible pour
// `run-all.mjs`, donc pour la barrière de déploiement (L21).
process.exit(ko ? 1 : 0);
