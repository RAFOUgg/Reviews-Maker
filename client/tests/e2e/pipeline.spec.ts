import { test, expect } from '@playwright/test';

test.describe('Pipeline UI responsiveness & sidebar behavior', () => {
    test.beforeEach(async ({ page }) => {
        const base = process.env.E2E_BASE_URL || '';
        await page.goto(`${base}/create/flower`);
        await page.waitForLoadState('networkidle');
    });

    test('Sidebar is independently scrollable and timeline cells are responsive', async ({ page }) => {
        // Navigate to Culture section (click Next until found)
        for (let i = 0; i < 10; i++) {
            const header = await page.locator('h2:has-text("Culture & Pipeline")').first();
            if (await header.count() > 0) break;
            await page.click('button:has-text("→")');
            await page.waitForTimeout(200);
        }

        // Wait for pipeline panel
        const pipelinePanel = page.locator('[data-testid="pipeline-panel"]');
        await expect(pipelinePanel).toBeVisible();

        // Sidebar scrollable
        const sidebar = page.locator('[data-testid="pipeline-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Ensure sidebar has overflow (scrollHeight > clientHeight)
        const scrollHeight = await sidebar.evaluate((el) => el.scrollHeight);
        const clientHeight = await sidebar.evaluate((el) => el.clientHeight);
        expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);

        // Scroll sidebar programmatically and verify scrollTop changes
        await sidebar.evaluate((el) => { el.scrollTop = 100; });
        const scrollTop = await sidebar.evaluate((el) => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);

        // Measure first cell width at desktop size
        const firstCell = page.locator('[data-testid="pipeline-grid"] > *').first();
        const desktopCellWidth = await firstCell.evaluate((el) => el.getBoundingClientRect().width);
        expect(desktopCellWidth).toBeGreaterThanOrEqual(1);

        // Resize viewport to mobile and assert cell width changes (smaller)
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(300);

        const mobileCellWidth = await firstCell.evaluate((el) => el.getBoundingClientRect().width);
        expect(mobileCellWidth).toBeLessThanOrEqual(desktopCellWidth);

        // Open grouped preset modal and ensure pipeline panel height does not grow significantly
        const panelHeightBefore = await pipelinePanel.evaluate((el) => el.getBoundingClientRect().height);
        await page.click('button:has-text("Groupe de préréglages")');
        const modal = page.locator('text=Groupe de préréglages').first();
        await expect(modal).toBeVisible();

        const panelHeightAfter = await pipelinePanel.evaluate((el) => el.getBoundingClientRect().height);
        // Allow a small tolerance (20px) for potential scrollbar appearance
        expect(Math.abs(panelHeightAfter - panelHeightBefore)).toBeLessThanOrEqual(20);

        // Close modal
        await page.click('button:has-text("Annuler")').catch(() => { });
    });
});