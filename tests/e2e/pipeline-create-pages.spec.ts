import { test, expect } from '@playwright/test';

const PAGES = ['/create/flower', '/create/concentrate', '/create/separation'];

for (const pagePath of PAGES) {
    test(`no horizontal scroll on ${pagePath}`, async ({ page }) => {
        await page.goto(pagePath);
        // wait for pipeline area to render
        await page.waitForSelector('[data-testid="pipeline-grid"]', { timeout: 5000 });

        const scroll = page.locator('[data-testid="pipeline-scroll"]');
        await expect(scroll).toBeVisible();

        // Assert no horizontal scroll at default viewport (desktop)
        const noHScroll = await scroll.evaluate((el) => el.scrollWidth <= el.clientWidth);
        expect(noHScroll).toBe(true);

        // Additionally assert the document doesn't overflow horizontally
        const docScroll = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
        expect(docScroll.doc).toBeLessThanOrEqual(docScroll.win);

        // Resize narrow to ensure wrapping without horizontal scroll
        await page.setViewportSize({ width: 420, height: 900 });
        await page.waitForTimeout(300);
        const noHScrollSmall = await scroll.evaluate((el) => el.scrollWidth <= el.clientWidth);
        expect(noHScrollSmall).toBe(true);

        const docScrollSmall = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
        expect(docScrollSmall.doc).toBeLessThanOrEqual(docScrollSmall.win);
    });
}
