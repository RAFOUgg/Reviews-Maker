import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('pageerror', err => console.log('pageerror:', err.message));

async function dismissConsent() {
    try {
        const btn = page.locator('button:has-text("J\'ai compris et j\'accepte")');
        await btn.waitFor({ state: 'visible', timeout: 4000 });
        await btn.click({ force: true });
        await page.waitForTimeout(300);
    } catch { }
}

await page.goto('http://localhost:5180/login', { waitUntil: 'networkidle' });
await dismissConsent();
await page.locator('button:has-text("Dev Quick Login")').click({ force: true });
await page.waitForTimeout(1000);

// 1. Bibliothèque Cultivars & Génétiques -> onglet Arbres Généalogiques
await page.goto('http://localhost:5180/library?tab=cultivars', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await dismissConsent();
const treesTab = page.locator('button:has-text("Arbres Généalogiques")');
if (await treesTab.count() > 0) {
    await treesTab.click();
    await page.waitForTimeout(500);
}
await page.screenshot({ path: 'c:\\Users\\Rafi\\Documents\\.0AMes-Logiciel\\Reviews-Maker\\_lib_trees_tmp.png' });

// 2. Positionnement intelligent : rétrécir la fenêtre pour forcer un débordement à droite
await page.goto('http://localhost:5180/create/hash', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await dismissConsent();
await page.setViewportSize({ width: 700, height: 700 });
await page.waitForTimeout(300);
const linkBtn = page.locator('button:has-text("Lier une fiche")');
await linkBtn.click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'c:\\Users\\Rafi\\Documents\\.0AMes-Logiciel\\Reviews-Maker\\_lib_dropdown_narrow_tmp.png' });
const panelBox = await page.locator('input[placeholder="Rechercher..."]').first().boundingBox();
console.log('Position du panneau de recherche (doit être dans le viewport 700px large):', panelBox);

await browser.close();
console.log('DONE');
