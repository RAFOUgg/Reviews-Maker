import { chromium, devices } from 'playwright';
import path from 'path';

const OUT_DIR = path.resolve(process.argv[2] || '.');
const BASE = 'http://localhost:5173';

const iphone = devices['iPhone 13'];

const pages = [
    { name: '01-home', url: '/' },
    { name: '02-library', url: '/library' },
    { name: '03-library-cultivars', url: '/library?tab=cultivars' },
    { name: '04-library-chain', url: '/library?tab=production-chain' },
    { name: '05-create-flower', url: '/create/flower' },
    { name: '06-phenohunt', url: '/phenohunt' },
    { name: '07-account', url: '/account' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ ...iphone });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[console] ${msg.text()}`);
});
page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));

for (const p of pages) {
    try {
        await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(OUT_DIR, `${p.name}.png`), fullPage: true });
        console.log(`OK  ${p.name} -> ${p.url}`);
    } catch (err) {
        console.log(`ERR ${p.name} -> ${p.url}: ${err.message}`);
    }
}

// Check body horizontal overflow on each captured page (common mobile bug signal)
console.log('\n--- horizontal overflow check ---');
for (const p of pages) {
    try {
        await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);
        const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        }));
        const hasOverflow = overflow.scrollWidth > overflow.clientWidth + 2;
        console.log(`${p.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth} ${hasOverflow ? '<< HORIZONTAL OVERFLOW' : 'ok'}`);
    } catch (err) {
        console.log(`${p.name}: check failed (${err.message})`);
    }
}

console.log('\n--- console errors collected across all pages ---');
console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');

await browser.close();
