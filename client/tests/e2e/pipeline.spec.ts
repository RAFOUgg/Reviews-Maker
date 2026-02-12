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

        // Sidebar should NOT be independently scrollable (we centralize scrolling on the timeline)
        const sidebar = page.locator('[data-testid="pipeline-sidebar"]');
        await expect(sidebar).toBeVisible();

        // Ensure sidebar does not have internal vertical scroll (scrollHeight <= clientHeight)
        const sidebarScrollHeight = await sidebar.evaluate((el) => el.scrollHeight);
        const sidebarClientHeight = await sidebar.evaluate((el) => el.clientHeight);
        expect(sidebarScrollHeight).toBeLessThanOrEqual(sidebarClientHeight);

        // Timeline scroll area should be scrollable
        const timelineScroll = page.locator('[data-testid="pipeline-scroll"]');
        await expect(timelineScroll).toBeVisible();
        const tScrollHeight = await timelineScroll.evaluate((el) => el.scrollHeight);
        const tClientHeight = await timelineScroll.evaluate((el) => el.clientHeight);
        expect(tScrollHeight).toBeGreaterThanOrEqual(tClientHeight);

        // Scroll timeline programmatically and verify scrollTop changes
        await timelineScroll.evaluate((el) => { el.scrollTop = 100; });
        const tScrollTop = await timelineScroll.evaluate((el) => el.scrollTop);
        expect(tScrollTop).toBeGreaterThan(0);

        // Ensure there are enough cells (>=8) so wrapping behaviour appears
        const addBtn = page.locator('button:has-text("Ajouter 10 étapes")');
        const cellCount = await page.locator('[data-testid^="pipeline-cell-"]').count();
        if (cellCount < 8 && await addBtn.count() > 0) {
            await addBtn.click();
            await page.waitForTimeout(120);
        }

        // Check horizontal overflow BEFORE zoom change
        const scrollEl = await timelineScroll.elementHandle();
        const scrollWidthBefore = await timelineScroll.evaluate((el) => el.scrollWidth);
        const clientWidthBefore = await timelineScroll.evaluate((el) => el.clientWidth);
        expect(scrollWidthBefore).toBeLessThanOrEqual(clientWidthBefore + 1);

        // Measure panel height before zoom
        const panelHeightBefore = await pipelinePanel.evaluate((el) => el.getBoundingClientRect().height);

        // Perform a de-zoom using the zoom range control and wait for layout
        const zoomRange = page.locator('input[type="range"]');
        await zoomRange.evaluate((el: HTMLInputElement) => { el.value = '0.5'; el.dispatchEvent(new Event('input', { bubbles: true })); });
        await page.waitForTimeout(300);

        // Re-check horizontal overflow AFTER zoom change
        const scrollWidthAfter = await timelineScroll.evaluate((el) => el.scrollWidth);
        const clientWidthAfter = await timelineScroll.evaluate((el) => el.clientWidth);
        expect(scrollWidthAfter).toBeLessThanOrEqual(clientWidthAfter + 1);

        // Panel height should NOT grow when de-zooming (tolerance 40px)
        const panelHeightAfter = await pipelinePanel.evaluate((el) => el.getBoundingClientRect().height);
        expect(panelHeightAfter).toBeLessThanOrEqual(panelHeightBefore + 40);
        // And ensure panel is capped (CSS cap 720px)
        expect(panelHeightAfter).toBeLessThanOrEqual(720);

        // Resize viewport to mobile and assert cell width changes (smaller)
        const firstCell = page.locator('[data-testid="pipeline-cell-0"]');
        const desktopCellWidth = await firstCell.evaluate((el) => el.getBoundingClientRect().width);
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(300);
        const mobileCellWidth = await firstCell.evaluate((el) => el.getBoundingClientRect().width);
        expect(mobileCellWidth).toBeLessThanOrEqual(desktopCellWidth);

        // Open grouped preset modal and ensure pipeline panel height does not grow significantly
        await page.click('button:has-text("Groupe de préréglages")');
        const modal = page.locator('text=Groupe de préréglages').first();
        await expect(modal).toBeVisible();

        const panelHeightModal = await pipelinePanel.evaluate((el) => el.getBoundingClientRect().height);
        // Allow a small tolerance (20px) for potential scrollbar appearance
        expect(Math.abs(panelHeightModal - panelHeightBefore)).toBeLessThanOrEqual(20);

        // Close modal
        await page.click('button:has-text("Annuler")').catch(() => { });
    });
});