/**
 * L'aperçu ÉCRAN du Studio change-t-il quand on change de template ?
 *
 * Cas exact signalé par l'utilisateur : « Article de Blog » et « Fiche Technique Détaillée »
 * donnaient un écran STRICTEMENT identique. La Vue Détaillée étant UNE mise en page, le template
 * n'y changeait que des contenus — et entre ces deux-là, les contenus sont voisins.
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';
const BASE='http://localhost:5173', API='http://localhost:3000';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const { id, upstreamId } = await createFixtureWithCanvases(API,'flower','dense');
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1800,height:1100}});
p.on('pageerror',e=>console.log('JS ERR:',String(e.message).slice(0,140)));
let failed=false;
const lire = () => p.evaluate(() => {
    const el = document.querySelector('#export-maker-screen-canvas');
    if (!el) return { monte:false };
    const r = el.getBoundingClientRect();
    return { monte:true, largeur: Math.round(r.width), hauteur: Math.round(r.height),
             debut: (el.innerText||'').replace(/\s+/g,' ').slice(0,60) };
});
try{
  await p.goto(`${BASE}/edit/flower/${id}`,{waitUntil:'networkidle'}); await sleep(5000);
  await p.getByRole('button',{name:/^Aperçu$/}).first().click(); await sleep(4000);
  await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click(); await sleep(3000);
  const a = await lire(); console.log('Fiche Technique :', JSON.stringify(a));
  await p.locator('button', { hasText: 'Article de Blog' }).first().click(); await sleep(3000);
  const c = await lire(); console.log('Article de Blog :', JSON.stringify(c));
  if(!a.monte || !c.monte){ console.log('\n✖ aperçu non monté'); failed=true; }
  else if(a.debut === c.debut && a.largeur === c.largeur){ console.log('\n✖ IDENTIQUE — le template ne change rien'); failed=true; }
  else console.log('\n✔ l’aperçu change bien de template');
} finally { await b.close(); await deleteFixture(API,id); if(upstreamId) await deleteFixture(API,upstreamId); }
process.exit(failed?1:0);
