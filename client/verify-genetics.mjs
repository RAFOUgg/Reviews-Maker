import { chromium } from '@playwright/test';

const SC = 'C:/Users/Rafi/AppData/Local/Temp/claude/c--Users-Rafi-Documents--0AMes-Logiciel-Reviews-Maker/697a5a7b-713a-4ca8-a60b-af8da4cdab7f/scratchpad/';

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));

async function dismissRdrBanner() {
    const acceptBtn = page.getByText("J'ai compris et j'accepte", { exact: false });
    if (await acceptBtn.count()) { await acceptBtn.click(); await page.waitForTimeout(300); }
}

await page.goto('http://localhost:5173/library', { waitUntil: 'networkidle' });
await dismissRdrBanner();
await page.waitForTimeout(500);

const cultivarsLink = page.locator('text=Cultivars & Génétiq').first();
console.log('cultivarsLink count:', await cultivarsLink.count());
await cultivarsLink.click();
await page.waitForTimeout(800);
await page.screenshot({ path: SC + '20-cultivars-page.png', fullPage: true });

const addBtn = page.locator('button', { hasText: 'Ajouter' }).first();
console.log('addBtn count:', await addBtn.count());
if (await addBtn.count()) {
    await addBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: SC + '21-cultivar-form.png', fullPage: true });

    const nameInput = page.locator('input[placeholder="ex: Zkittlez"]');
    if (await nameInput.count()) await nameInput.fill('Playwright Verify Strain');
    const thcMinInput = page.locator('input[placeholder="ex: 18"]');
    if (await thcMinInput.count()) await thcMinInput.fill('20');
    const thcMaxInput = page.locator('input[placeholder="ex: 24"]');
    if (await thcMaxInput.count()) await thcMaxInput.fill('26');
    const yieldInput = page.locator('input[placeholder="ex: 450"]');
    if (await yieldInput.count()) await yieldInput.fill('500');
    const tagsInput = page.locator('input[placeholder*="fruité"]');
    if (await tagsInput.count()) await tagsInput.fill('fruite, resistant');
    await page.screenshot({ path: SC + '22-cultivar-form-filled.png', fullPage: true });

    const saveBtn = page.locator('button', { hasText: 'Créer' }).first();
    console.log('saveBtn count:', await saveBtn.count());
    if (await saveBtn.count()) {
        await saveBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: SC + '23-cultivar-saved.png', fullPage: true });
    }
    console.log('ERRORS_AFTER_CREATE:', JSON.stringify(errors));

    // --- Rouvrir en édition pour vérifier qu'aucune donnée n'a été perdue ---
    errors.length = 0;
    const editBtn = page.locator('button:has(svg.lucide-edit)').first();
    console.log('editBtn count:', await editBtn.count());
    if (await editBtn.count()) {
        await editBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: SC + '24-cultivar-reopened-for-edit.png', fullPage: true });

        const thcMinVal = await page.locator('input[placeholder="ex: 18"]').inputValue().catch(() => 'N/A');
        const yieldVal = await page.locator('input[placeholder="ex: 450"]').inputValue().catch(() => 'N/A');
        const tagsVal = await page.locator('input[placeholder*="fruité"]').inputValue().catch(() => 'N/A');
        console.log('REOPENED_VALUES:', JSON.stringify({ thcMinVal, yieldVal, tagsVal }));

        // Sauvegarder à nouveau SANS toucher aux champs (simulate ré-édition rapide) pour re-tester le bug d'origine
        const saveBtn2 = page.locator('button', { hasText: 'Mettre à jour' }).first();
        if (await saveBtn2.count()) {
            await saveBtn2.click();
            await page.waitForTimeout(800);
        }
    }
    console.log('ERRORS_AFTER_REEDIT:', JSON.stringify(errors));
} else {
    console.log('NO ADD BUTTON — page content dump follows');
    console.log(await page.locator('body').innerText());
}

await browser.close();
