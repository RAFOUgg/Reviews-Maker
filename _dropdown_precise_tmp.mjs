import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });

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

await page.goto('http://localhost:5180/create/hash', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await dismissConsent();

const linkBtn = page.locator('button:has-text("Lier une fiche")');
await linkBtn.scrollIntoViewIfNeeded();
await linkBtn.click();
await page.waitForTimeout(400);

// Le panneau est le parent du champ de recherche
const panel = page.locator('input[placeholder="Rechercher..."]').first().locator('xpath=ancestor::div[contains(@style,"position")]').first();
const box = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="Rechercher..."]');
    if (!input) return null;
    let el = input;
    while (el && el.style.position !== 'fixed') el = el.parentElement;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width };
});
console.log('Panneau (position:fixed) rect:', box);
console.log('Viewport:', { width: 900, height: 900 });
console.log('Déborde à droite ?', box ? box.right > 900 : 'panneau introuvable');
console.log('Déborde en bas ?', box ? box.bottom > 900 : 'panneau introuvable');

await browser.close();
console.log('DONE');
