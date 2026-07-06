import { chromium } from 'playwright';

const errors = [];
const failedRequests = [];
const shot = (n) => `C:/Users/Rafi/AppData/Local/Temp/claude/c--Users-Rafi-Documents--0AMes-Logiciel-Reviews-Maker/daf684e3-ae1d-4e35-b2ee-2dc9c90e9fde/scratchpad/smoke-${n}.png`;

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('producer-profile')) failedRequests.push(`${res.status()} ${res.url()}`);
});

await page.goto('http://localhost:5173/create/hash', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1000);

const acceptBtn = page.getByText("J'ai compris et j'accepte", { exact: false });
if (await acceptBtn.count() > 0) { await acceptBtn.click(); await page.waitForTimeout(500); }

await page.mouse.click(450, 196); // Séparation tab
await page.waitForTimeout(800);

await page.getByText('Groupes', { exact: false }).click();
await page.waitForTimeout(500);

await page.getByText('Nouveau groupe', { exact: false }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: shot('06-create-group-form') });

// Fill the group name
const nameInput = page.locator('input[type="text"]').first();
await nameInput.fill('Test Groupe Smoke E2E');
await page.waitForTimeout(300);

// Expand a section and check a field checkbox
const sectionHeader = page.getByText('Matière première', { exact: false }).first();
if (await sectionHeader.count() > 0) {
    await sectionHeader.click();
    await page.waitForTimeout(400);
}
await page.screenshot({ path: shot('07-section-expanded') });

// Click the first checkbox found (a field to include in the group)
const checkbox = page.locator('input[type="checkbox"]').first();
if (await checkbox.count() > 0) {
    await checkbox.click();
    console.log('Checked a field checkbox');
} else {
    console.log('No checkbox found to select a field');
}
await page.waitForTimeout(300);
await page.screenshot({ path: shot('08-field-selected') });

// Save the group
const saveBtn = page.getByRole('button', { name: /enregistrer|sauvegarder|créer/i }).first();
if (await saveBtn.count() > 0) {
    await saveBtn.click();
    console.log('Clicked save button:', await saveBtn.textContent());
} else {
    console.log('No save button found');
}
await page.waitForTimeout(1000);
await page.screenshot({ path: shot('09-after-save') });

console.log('\n=== Failed requests ===');
failedRequests.forEach(f => console.log(f));
console.log('\n=== Console errors ===');
errors.forEach(e => console.log(e));

await browser.close();
