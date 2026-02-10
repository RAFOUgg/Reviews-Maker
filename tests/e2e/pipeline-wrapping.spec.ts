import { test, expect } from '@playwright/test';

test.describe('Pipeline grid wrapping', () => {
    test('no horizontal scroll and cells wrap on resize', async ({ page }) => {
        // Navigate to example page
        await page.goto('/example-pipeline');

        // Activate mode DAYS (90j) to ensure many cells
        await page.click('text=Activer mode Jours (90j)');

        const grid = page.locator('[data-testid="pipeline-grid"]');
        const scroll = page.locator('[data-testid="pipeline-scroll"]');

        await expect(grid).toBeVisible();

        // Assert no horizontal scroll at default viewport
        const noHScroll = await scroll.evaluate((el) => el.scrollWidth <= el.clientWidth);
        expect(noHScroll).toBe(true);

        // Helper: compute number of distinct row tops among first N cells
        const getRowCount = async () => {
            const tops = await page.$$eval('[data-testid="pipeline-grid"] > *', (els: Element[]) => {
                return els.slice(0, 40).map(e => Math.round(e.getBoundingClientRect().top));
            });
            return Array.from(new Set(tops)).length;
        };

        const rowsLarge = await getRowCount();

        // Shrink viewport to force wrapping
        await page.setViewportSize({ width: 420, height: 800 });

        // Wait for layout stabilization
        await page.waitForTimeout(300);

        const rowsSmall = await getRowCount();

        expect(rowsSmall).toBeGreaterThan(rowsLarge);

        // Ensure still no horizontal scroll on narrow viewport
        const noHScrollSmall = await scroll.evaluate((el) => el.scrollWidth <= el.clientWidth);
        expect(noHScrollSmall).toBe(true);
    });
});
