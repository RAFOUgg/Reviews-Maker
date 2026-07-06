import { chromium } from 'playwright';

const TREE_ID = 'ab822a9b-a6c2-4323-911a-a4cfcbdedb0a';
const shot = (n) => `C:/Users/Rafi/AppData/Local/Temp/claude/c--Users-Rafi-Documents--0AMes-Logiciel-Reviews-Maker/daf684e3-ae1d-4e35-b2ee-2dc9c90e9fde/scratchpad/handle-${n}.png`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('console', msg => { if (msg.type() === 'error') console.log('[console error]', msg.text()); });
page.on('pageerror', err => console.log('PAGEERROR:', err.message));

await page.goto(`http://localhost:5173/phenohunt?tree=${TREE_ID}`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1500);

const acceptBtn = page.getByText("J'ai compris et j'accepte", { exact: false });
if (await acceptBtn.count() > 0) { await acceptBtn.click(); await page.waitForTimeout(500); }

await page.waitForTimeout(1000);
await page.screenshot({ path: shot('01-loaded') });

// Find the bottom handle of NodeA — react-flow renders handles as elements with class containing "bottom"
const bottomHandles = await page.locator('.react-flow__handle.node-handle.bottom, .node-handle.bottom').all();
console.log('Bottom handles found:', bottomHandles.length);

if (bottomHandles.length > 0) {
    const box = await bottomHandles[0].boundingBox();
    console.log('Bottom handle bounding box:', JSON.stringify(box));

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Start a connection drag: mousedown on the handle, move away, inspect the connection line, then release on empty canvas.
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 150, startY + 150, { steps: 10 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot('02-during-drag') });

    // Inspect the connection line SVG path's actual start point
    const pathInfo = await page.evaluate(() => {
        const path = document.querySelector('.react-flow__connection-path, .react-flow__connectionline path');
        if (!path) return { found: false };
        const d = path.getAttribute('d');
        return { found: true, d };
    });
    console.log('Connection line path info:', JSON.stringify(pathInfo));

    await page.mouse.up();
    await page.waitForTimeout(300);
}

await browser.close();
