// Galerie publique (/gallery) : chaque carte porte nom + faits clés + pseudo cliquable + like.
// Le pseudo ouvre la modale de profil ; le like met à jour le compteur affiché.
import { chromium } from 'playwright';
const BASE = 'http://localhost:5173';
const OUT = process.argv[2] || 'tools/export-audit/reports';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ko = 0;
const b = await chromium.launch();
try {
    for (const [nom, w, h] of [['pc', 1400, 900], ['tel', 390, 844]]) {
        const p = await b.newPage({ viewport: { width: w, height: h } });
        await p.goto(`${BASE}/gallery`, { waitUntil: 'networkidle' }); await sleep(2500);
        const cartes = await p.locator('[data-gallery-card-info]').count();
        const faits = await p.locator('[data-gallery-card-info] span.rounded-md').count();
        console.log(`${nom}: ${cartes} carte(s), ${faits} fait(s) clé(s)`);
        if (cartes === 0) { console.log(`KO — aucun bandeau d'infos (${nom})`); ko++; }
        await p.screenshot({ path: `${OUT}/gallery-${nom}.png` });
        if (nom === 'pc' && cartes > 0) {
            const url = p.url();
            await p.locator('[data-gallery-author]').first().click(); await sleep(1500);
            const modale = await p.locator('[role="dialog"]').count();
            console.log(`clic pseudo → modale profil : ${modale}, url inchangée : ${p.url() === url}`);
            if (!modale) { console.log('KO — le pseudo n’ouvre pas le profil'); ko++; }
            await p.keyboard.press('Escape'); await sleep(500);
            const like = p.locator('[data-gallery-like]').first();
            const avant = Number((await like.innerText()).replace(/\D/g, '')) || 0;
            await like.click(); await sleep(1500);
            const apres = Number((await like.innerText()).replace(/\D/g, '')) || 0;
            console.log(`like : ${avant} → ${apres}`);
            if (apres === avant) { console.log('KO — le like ne change rien'); ko++; }
            await like.click(); await sleep(1500); // annule, pour ne rien laisser derrière
        }
        await p.close();
    }
} finally { await b.close(); }
console.log(ko === 0 ? 'OK — cartes de galerie informatives et interactives' : `${ko} défaut(s)`);
