/**
 * Le menu mobile se ferme-t-il ? (croix, clic à côté, Échap)
 *
 * Et surtout : se ferme-t-il ENCORE quand une autre couche plein écran de l'app traîne au-dessus
 * (voile invisible du menu profil z-9998, modale z-9999, bannière RDR z-10000) ? C'est ce cas-là
 * que le menu ne survivait pas à z-150 : la couche avale la croix ET le clic à côté.
 *
 * usage: node _tmp-mobile-menu-check.mjs [base] [largeur] [auth]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:5173';
const W = Number(process.argv[3] || 531);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEL = '.z-\\[10050\\], .z-\\[150\\]'; // accepte l'ancien z pour comparer avant/après

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: W, height: 940 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 200)));
let ko = 0;

if (process.argv[4] === 'auth') {
    await p.route('**/api/auth/me', (route) => route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ id: 'probe-user', email: 'probe@example.com', username: 'Probe', accountType: 'consumer', roles: '{"roles":[]}', emailVerified: true, legalAge: true, consentRDR: true, limits: {} })
    }));
}

await p.goto(BASE + '/gallery', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => localStorage.setItem('rdr_disclaimer_last_seen', String(Date.now())));
await p.goto(BASE + '/gallery', { waitUntil: 'domcontentloaded' });
await sleep(2500);

const visible = () => p.evaluate((s) => !!document.querySelector(s), SEL);
// Le voile de test recouvre aussi le bouton hamburger : on ne le pose qu'une fois le menu ouvert,
// et on le retire avant chaque réouverture.
const poserVoile = () => p.evaluate(() => {
    if (document.getElementById('probe-veil')) return;
    const v = document.createElement('div');
    v.id = 'probe-veil';
    v.style.cssText = 'position:fixed;inset:0;z-index:9998';
    document.body.appendChild(v);
});
const oterVoile = () => p.evaluate(() => document.getElementById('probe-veil')?.remove());

// Qui reçoit vraiment le clic sur la croix / sur le fond ?
const qui = () => p.evaluate((s) => {
    const panel = document.querySelector(s);
    if (!panel) return { err: 'pas de menu' };
    const x = panel.querySelector('button');
    const r = x.getBoundingClientRect();
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
    const croix = document.elementFromPoint(cx, cy);
    const fond = document.elementFromPoint(40, 500);
    const desc = (n) => n ? `${n.tagName}.${String(n.className).slice(0, 45)}` : 'null';
    return {
        croixAtteinte: x.contains(croix) || x === croix, croixTouche: desc(croix), at: [cx, cy],
        fondEstLeBackdrop: !!(fond && panel.contains(fond)), fondTouche: desc(fond),
    };
}, SEL);

const scenario = async (nom, avecVoile) => {
    const open = async () => {
        if (avecVoile) await oterVoile();
        await p.locator('nav button.md\\:hidden').first().click();
        await sleep(700);
        if (avecVoile) await poserVoile();
    };
    await open();
    if (!(await visible())) { console.log(`✗ ${nom} : le menu ne s'ouvre pas`); ko++; return; }
    const q = await qui();
    console.log(`— ${nom} :`, JSON.stringify(q));
    if (!q.croixAtteinte) { console.log(`✗ ${nom} : la croix est recouverte`); ko++; }
    if (!q.fondEstLeBackdrop) { console.log(`✗ ${nom} : le fond est recouvert`); ko++; }

    await p.mouse.click(q.at[0], q.at[1]);
    await sleep(600);
    if (await visible()) { console.log(`✗ ${nom} : clic sur la croix ne ferme pas`); ko++; }
    else console.log(`✓ ${nom} : croix ferme`);

    if (!(await visible())) await open();
    await p.mouse.click(40, 500);
    await sleep(600);
    if (await visible()) { console.log(`✗ ${nom} : clic à côté ne ferme pas`); ko++; }
    else console.log(`✓ ${nom} : clic à côté ferme`);

    if (!(await visible())) await open();
    await p.keyboard.press('Escape');
    await sleep(600);
    if (await visible()) { console.log(`✗ ${nom} : Échap ne ferme pas`); ko++; }
    else console.log(`✓ ${nom} : Échap ferme`);
};

await scenario('nominal', false);

// Reproduit la panne : une couche plein écran INVISIBLE au z réel des autres calques de l'app.
await scenario('avec un voile z-9998 par-dessus (menu profil resté ouvert)', true);
await oterVoile();

// La bannière RDR doit rester lisible et cliquable pendant que le menu est ouvert.
await p.locator('nav button.md\\:hidden').first().click();
await sleep(700);
const banniere = await p.evaluate(() => {
    const el = document.elementFromPoint(window.innerWidth / 2, 20);
    return { touche: el ? `${el.tagName}.${String(el.className).slice(0, 40)}` : 'null', dansLaBanniere: !!el?.closest('#rdr-banner') };
});
console.log('— bannière RDR au-dessus du menu ?', JSON.stringify(banniere));
if (!banniere.dansLaBanniere) { console.log('✗ la bannière RDR est recouverte par le menu'); ko++; }

await p.screenshot({ path: 'tools/export-audit/reports/_tmp-mobile-menu.png' });
await b.close();
console.log(ko === 0 ? '\nOK — tout ferme' : `\n${ko} échec(s)`);
process.exit(ko === 0 ? 0 : 1);
