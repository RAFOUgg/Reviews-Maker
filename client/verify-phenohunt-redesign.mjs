import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const SHOT_DIR = 'C:/Users/Rafi/AppData/Local/Temp/claude/c--Users-Rafi-Documents--0AMes-Logiciel-Reviews-Maker/697a5a7b-713a-4ca8-a60b-af8da4cdab7f/scratchpad';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

await page.goto(`${BASE}/phenohunt`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const acceptBtn = page.locator("text=J'ai compris et j'accepte").first();
if (await acceptBtn.count() > 0) { await acceptBtn.click(); await page.waitForTimeout(600); }

await page.screenshot({ path: `${SHOT_DIR}/redesign-01-no-tree.png` });
console.log('trees in sidebar:', await page.locator('text=Mes arbres').count());

// Select first tree card if present
const firstTreeCard = page.locator('aside .liquid-card, aside [class*="LiquidCard"]').first();
// Fallback: click on any element containing "nœuds" text inside sidebar
const treeItem = page.locator('aside').getByText(/nœuds/).first();
const treeItemCount = await treeItem.count();
console.log('tree items found:', treeItemCount);

if (treeItemCount > 0) {
    await treeItem.click({ force: true });
    await page.waitForTimeout(1500);
}

await page.screenshot({ path: `${SHOT_DIR}/redesign-02-tree-selected.png` });

// Check toolbar buttons
console.log('Nœud racine btn:', await page.locator('text=Nœud racine').count());
console.log('Relation btn:', await page.locator('button:has-text("Relation")').count());
console.log('JSON export btn:', await page.locator('text=JSON').count());
console.log('SVG export btn:', await page.locator('text=SVG').count());

// Test Paramètres button
const settingsBtn = page.locator('button[title*="Paramètres"]').first();
console.log('Settings button found:', await settingsBtn.count());
if (await settingsBtn.count() > 0) {
    const isDisabled = await settingsBtn.isDisabled().catch(() => null);
    console.log('Settings button disabled:', isDisabled);
    if (!isDisabled) {
        await settingsBtn.click();
        await page.waitForTimeout(700);
        console.log('TreeFormModal opened:', await page.locator('text=Éditer arbre').count());
        await page.screenshot({ path: `${SHOT_DIR}/redesign-03-settings-modal.png` });
        const cancelBtn = page.locator('button:has-text("Annuler")').first();
        if (await cancelBtn.count() > 0) await cancelBtn.click();
        await page.waitForTimeout(400);
    }
}

// Test search
const searchInputs = page.locator('input[placeholder*="Rechercher"]');
console.log('search inputs found:', await searchInputs.count());

console.log('CONSOLE/PAGE ERRORS:', JSON.stringify(errors, null, 2));

await browser.close();
console.log('DONE');
