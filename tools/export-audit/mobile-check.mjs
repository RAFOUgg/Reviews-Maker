/**
 * Parcours MOBILE d'Export Maker (demande du 2026-08-11).
 *
 * Sur petit écran : soit les réglages, soit le rendu — jamais les deux écrasés l'un sur l'autre.
 * Et tant qu'aucun template n'a été choisi pour cette review, l'aperçu n'a rien d'utile à montrer :
 * le choix est un passage obligé.
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';
const BASE='http://localhost:5173', API='http://localhost:3000';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const { id, upstreamId } = await createFixtureWithCanvases(API,'flower','dense');
const b=await chromium.launch();
// 760px : juste SOUS le point de rupture `md` (768px) de Tailwind, donc la mise en page une-colonne
// d'Export Maker s'applique — tout en gardant le formulaire complet, l'assistant pas-à-pas des
// vrais téléphones ne donnant pas accès au Studio (vérifié en listant les boutons présents).
const p=await b.newPage({ viewport: { width: 760, height: 900 } });
p.on('pageerror',e=>console.log('JS ERR:',String(e.message).slice(0,140)));
let failures=0;
const check=(label,ok,detail)=>{ console.log(`  ${ok?'✔':'✖'} ${label}${detail?` — ${detail}`:''}`); if(!ok) failures++; };
try{
  // Sur mobile, la page d'édition affiche l'assistant pas-à-pas — Export Maker s'ouvre depuis la
  // page de la review (vérifié en listant les boutons réellement présents, pas supposé).
  await p.goto(`${BASE}/edit/flower/${id}`,{waitUntil:'networkidle'}); await sleep(5000);
  await p.getByRole('button',{name:/^Aperçu$/}).first().click(); await sleep(5000);

  const etat = async () => p.evaluate(() => ({
      config: !!document.querySelector('div:not(.hidden) > div h3')?.textContent?.includes('Choix du Template'),
      configVisible: [...document.querySelectorAll('*')].some(e=>e.textContent?.trim()==='Choix du Template' && e.getBoundingClientRect().height>0),
      // VISIBILITÉ réelle, pas simple présence : `querySelector` trouve un élément même quand son
      // conteneur est en `display:none`, et la sonde concluait alors « aperçu affiché » à tort.
      apercuVisible: (() => {
          const el = document.querySelector('#export-maker-screen-canvas, #export-maker-canvas');
          return !!el && el.getBoundingClientRect().height > 0;
      })(),
      bouton: [...document.querySelectorAll('button')].map(x=>x.textContent.trim()).find(t=>t==='Voir le rendu'||t==='Réglages') || null,
      boutonDesactive: [...document.querySelectorAll('button')].find(x=>['Voir le rendu','Réglages'].includes(x.textContent.trim()))?.disabled ?? null,
  }));

  const a = await etat();
  console.log('  état initial :', JSON.stringify(a));
  check('les réglages sont affichés en premier (aucun template choisi)', a.configVisible === true);
  check('l’aperçu n’est pas affiché', a.apercuVisible === false, `bouton: ${a.bouton}`);
  check('la bascule est bloquée tant que rien n’est choisi', a.boutonDesactive === true);

  await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click(); await sleep(2500);
  const b2 = await etat();
  check('après le choix, la bascule est active', b2.boutonDesactive === false, `bouton: ${b2.bouton}`);

  await p.locator('button', { hasText: 'Voir le rendu' }).first().click(); await sleep(3500);
  const c = await etat();
  console.log('  après bascule :', JSON.stringify(c));
  check('le rendu s’affiche', c.apercuVisible === true);
  check('les réglages sont masqués', c.configVisible === false);
} finally { await b.close(); await deleteFixture(API,id); if(upstreamId) await deleteFixture(API,upstreamId); }
console.log(failures? `\n✖ ${failures} vérification(s) en échec` : '\n✔ parcours mobile conforme');
process.exit(failures?1:0);
