const { chromium } = require('playwright');
const path = require('path');
const OUT = path.resolve(__dirname);

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERR:', msg.text()); });

    await page.goto('http://localhost:5183/library/production-chains/49945d51-20d5-4d87-a656-c7bc304bed90', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    const acceptBtn = page.getByText("J'ai compris et j'accepte", { exact: false });
    if (await acceptBtn.count()) { await acceptBtn.click(); await page.waitForTimeout(500); }
    await page.waitForTimeout(1000);
    // Fit view to make sure the edge (Gorilla Glue -> Test Resume) is in the visible viewport
    const fitBtn = page.locator('.react-flow__controls-fitview');
    if (await fitBtn.count()) { await fitBtn.click(); await page.waitForTimeout(500); }
    await page.screenshot({ path: path.join(OUT, '40-chain-with-edge.png') });

    const edgeCount = await page.locator('.react-flow__edge').count();
    console.log('edge count:', edgeCount);

    // Right-click the edge path to open its context menu, then click "Éditer"
    const edgePath = page.locator('.react-flow__edge-path').first();
    const box = await edgePath.boundingBox();
    console.log('edge path box:', box);
    // Dispatch the contextmenu event directly on the edge path element — bypasses the need to
    // pixel-hunt a thin diagonal SVG line with page.mouse.click.
    await edgePath.dispatchEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 1100, clientY: 503 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, '41a-edge-contextmenu.png') });
    const editItem = page.getByText('Éditer la transformation', { exact: false }).first();
    if (await editItem.count()) {
        await editItem.evaluate(el => el.click());
        await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(OUT, '41-edge-modal.png') });

    await browser.close();
})();
