import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const SHOT_DIR = 'C:/Users/Rafi/AppData/Local/Temp/claude/c--Users-Rafi-Documents--0AMes-Logiciel-Reviews-Maker/697a5a7b-713a-4ca8-a60b-af8da4cdab7f/scratchpad';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

await page.goto(`${BASE}/phenohunt`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const acceptBtn = page.locator("text=J'ai compris et j'accepte").first();
if (await acceptBtn.count() > 0) { await acceptBtn.click(); await page.waitForTimeout(600); }

// Scroll sidebar down to see reviews + cultivars sections
await page.mouse.wheel(0, 0);
const sidebar = page.locator('aside').first();
await sidebar.evaluate(el => el.scrollTop = el.scrollHeight);
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOT_DIR}/redesign-04-sidebar-scrolled.png` });

console.log('Mes reviews Fleurs section:', await page.locator('text=Mes reviews Fleurs').count());
console.log('Bibliothèque cultivars section:', await page.locator('text=Bibliothèque cultivars').count());

// Select a tree, click "Nœud racine"
await sidebar.evaluate(el => el.scrollTop = 0);
const treeItem = page.locator('aside').getByText(/nœuds/).first();
if (await treeItem.count() > 0) {
    await treeItem.click({ force: true });
    await page.waitForTimeout(1200);
}
const rootNodeBtn = page.locator('button:has-text("Nœud racine")').first();
if (await rootNodeBtn.count() > 0) {
    await rootNodeBtn.click();
    await page.waitForTimeout(600);
    console.log('NodeFormModal opened after "Nœud racine" click:', await page.locator('text=Créer un cultivar, text=Nouveau cultivar, text=Ajouter un cultivar').count());
    await page.screenshot({ path: `${SHOT_DIR}/redesign-05-add-root-node-modal.png` });
}

console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
console.log('DONE');
