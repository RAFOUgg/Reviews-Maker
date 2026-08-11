/**
 * L'aperçu ÉCRAN du Studio obéit-il au template sélectionné ?
 *
 * Il rendait `ReviewFullDisplay`, composant unique qui ignore `config.template`/`config.ratio` :
 * choisir « Story Social Media » n'y changeait rien. Signalé par l'utilisateur, capture à l'appui.
 * Ce script sélectionne deux templates de suite et compare ce qui est réellement rendu.
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';
const BASE='http://localhost:5173', API='http://localhost:3000';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const { id, upstreamId } = await createFixtureWithCanvases(API,'flower','dense');
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1800,height:1100}});
p.on('pageerror',e=>console.log('JS ERR:',String(e.message).slice(0,140)));
let failed=false;
const snapshot = async () => p.evaluate(() => {
    const el = document.querySelector('#export-maker-screen-canvas');
    if (!el) return { monte:false };
    const r = el.getBoundingClientRect();
    return { monte:true, largeur: Math.round(r.width), texte: (el.innerText||'').replace(/\s+/g,' ').slice(0,90) };
});
try{
  await p.goto(`${BASE}/edit/flower/${id}`,{waitUntil:'networkidle'}); await sleep(6000);
  await p.getByRole('button',{name:/^Aperçu$/}).first().click(); await sleep(4000);

  await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click(); await sleep(3000);
  const a = await snapshot(); console.log('Fiche Technique :', JSON.stringify(a));

  await p.locator('button', { hasText: 'Story Social Media' }).first().click(); await sleep(3000);
  const c = await snapshot(); console.log('Story           :', JSON.stringify(c));

  if(!a.monte || !c.monte){ console.log('\n✖ le canevas d’aperçu écran n’est pas monté'); failed=true; }
  else if(a.texte === c.texte && a.largeur === c.largeur){ console.log('\n✖ le rendu est IDENTIQUE — l’écran ignore toujours le template'); failed=true; }
  else console.log('\n✔ l’écran suit le template sélectionné');
} finally { await b.close(); await deleteFixture(API,id); if(upstreamId) await deleteFixture(API,upstreamId); }
process.exit(failed?1:0);
