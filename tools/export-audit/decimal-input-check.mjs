/**
 * Séparateur décimal des pourcentages de cannabinoïdes (section « Données Analytiques »).
 *
 * Signalé le 2026-08-14 : « . et virgule impossible à mettre dans les forms ». Cause trouvée dans
 * `AnalyticsSection.handleNumberInput`, dont le filtre `/^\d*\.?\d*$/` n'admettait que le POINT.
 * Sur un clavier français, où la virgule EST le séparateur décimal, taper « 24,5 » ne produisait
 * RIEN : le champ est contrôlé, donc une frappe refusée disparaît sans message.
 *
 * Ce que la sonde exige :
 *   1. les champs % restent verrouillés tant qu'aucun certificat n'est déposé (garde-fou voulu,
 *      pas un bug — un chiffre de labo sans COA n'a pas de valeur) ;
 *   2. une fois le certificat déposé, « 24,5 » est accepté ;
 *   3. et vaut bien 24.5 EN BASE — `parseFloat('24,5')` donne 24, donc accepter la virgule sans
 *      normaliser aurait enregistré 24 % au lieu de 24,5 %, un défaut pire que celui corrigé ;
 *   4. le point continue de fonctionner et les lettres restent refusées.
 *
 * Usage : node tools/export-audit/decimal-input-check.mjs [--url=…] [--api=…]
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')).map(a=>{
    const [k,...v]=a.slice(2).split('='); return [k, v.join('=')||true];
}));
const BASE = args.url || 'http://localhost:5173';
const API = args.api || 'http://localhost:3000';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

let failures = 0;
const expect = (label, ok, detail) => {
    console.log(`  ${ok?'✔':'✖'} ${label}${detail?` — ${detail}`:''}`);
    if (!ok) failures++;
};

const id = await createFixture(API,'flower','dense');
console.log('fixture', id);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport:{width:1600,height:1000} });
const errs=[]; page.on('pageerror', e=>errs.push(String(e.message).slice(0,140)));

try {
    await page.goto(`${BASE}/edit/flower/${id}`, { waitUntil:'networkidle' });
    await sleep(4000);
    const tabs = await page.locator('button').evaluateAll(els =>
        els.map((e,i)=>({i,t:(e.innerText||'').trim()})).filter(o=>o.t.length>0&&o.t.length<=3));
    const lab = tabs.find(t=>t.t.includes('🔬'));
    expect('section Données Analytiques atteignable', !!lab);
    await page.locator('button').nth(lab.i).click();
    await sleep(1500);

    const field = page.locator('input[placeholder="0.0"]').first();
    expect('% verrouillés sans certificat', !(await field.isEnabled()));

    await page.locator('input[type="file"]').first().setInputFiles({
        name: 'zz-audit-coa.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 zz-audit')
    });
    await sleep(2500);
    expect('% déverrouillés une fois le certificat déposé', await field.isEnabled());

    await field.click(); await field.fill('');
    await page.keyboard.type('24,5');
    await sleep(400);
    const typed = await field.inputValue();
    // La valeur remonte au parent puis redescend normalisée : « 24.5 » affiché est le comportement
    // attendu. Le seul échec possible ici serait un champ VIDE — la frappe avalée.
    expect('la virgule n\'est plus avalée', typed === '24,5' || typed === '24.5', JSON.stringify(typed));

    await sleep(3500);
    const saved = await (await fetch(`${API}/api/reviews/${id}`)).json();
    const flat = { ...saved, ...(saved.flowerData||{}) };
    expect('24,5 vaut bien 24.5 en base (et non 24)', flat.thcPercent === 24.5, `thcPercent = ${JSON.stringify(flat.thcPercent)}`);

    await field.fill(''); await page.keyboard.type('18.25'); await sleep(300);
    expect('le point fonctionne toujours', (await field.inputValue()) === '18.25', JSON.stringify(await field.inputValue()));

    await field.fill(''); await page.keyboard.type('12a,b'); await sleep(300);
    const junk = await field.inputValue();
    expect('les lettres restent refusées', junk === '12' || junk === '12,', JSON.stringify(junk));

    expect('aucune erreur JS', errs.length === 0, errs.join(' | '));
} finally {
    await browser.close();
    await deleteFixture(API, id);
}

console.log(failures === 0 ? '\n✔ tout vert' : `\n✖ ${failures} échec(s)`);
process.exit(failures === 0 ? 0 : 1);
