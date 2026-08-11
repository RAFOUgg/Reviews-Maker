/**
 * Le rendu ÉCRAN suit-il le template sélectionné ?
 *
 * Mesuré sur `/r/:id` — la page publique — et NON sur l'aperçu du Studio : celui-ci charge la review
 * via `/edit/:type/:id`, qui répond 403 sans session en développement, et affiche donc une fiche
 * vide. Une sonde qui n'exerce pas la donnée ne prouve rien (règle 2 du C11) : elle rendait
 * « aucun changement » quel que soit l'état du code.
 *
 * Protocole : appliquer un template (ce qui l'enregistre sur la review), ouvrir `/r/:id`, compter
 * les sections réellement rendues. Puis recommencer avec un autre template.
 */
import { chromium } from 'playwright';
import { createFixtureWithCanvases, deleteFixture } from './fixtures.mjs';
const BASE='http://localhost:5173', API='http://localhost:3000';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const { id, upstreamId } = await createFixtureWithCanvases(API,'flower','dense');
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1800,height:1100}});
p.on('pageerror',e=>console.log('JS ERR:',String(e.message).slice(0,140)));
let failed=false;

async function appliquer(nomTemplate){
    await p.goto(`${BASE}/edit/flower/${id}`,{waitUntil:'networkidle'}); await sleep(3000);
    await p.getByRole('button',{name:/^Aperçu$/}).first().click(); await sleep(3500);
    await p.locator('button', { hasText: nomTemplate }).first().click(); await sleep(1500);
    await p.getByRole('button',{name:/^Appliquer$/}).first().click(); await sleep(3000);
    await p.goto(`${BASE}/r/${id}`,{waitUntil:'networkidle'}); await sleep(7000);
    return p.evaluate(() => {
        const t = document.body.innerText.replace(/\s+/g,' ');
        return {
            sections: document.querySelectorAll('.liquid-card').length,
            longueur: t.length,
            pipelines: /Pipelines & Processus/.test(t),
            genealogie: /Généalogie|PhenoHunt/.test(t),
            chaine: /Chaîne de production/.test(t),
        };
    });
}

try{
  const doc = await appliquer('Fiche Technique Détaillée');
  console.log('Fiche Technique :', JSON.stringify(doc));
  const story = await appliquer('Story Social Media');
  console.log('Story           :', JSON.stringify(story));

  const allege = (story.pipelines === false && doc.pipelines === true)
      || (story.chaine === false && doc.chaine === true)
      || (story.genealogie === false && doc.genealogie === true);
  if (doc.sections === story.sections && doc.longueur === story.longueur) {
      console.log('\n✖ rendu IDENTIQUE — l’écran ignore le template'); failed = true;
  } else if (!allege) {
      console.log('\n✖ le rendu change, mais Story garde les sections de DOCUMENT'); failed = true;
  } else {
      console.log(`\n✔ Story est allégé des sections de document (${doc.longueur} → ${story.longueur} car.)`);
  }
} finally { await b.close(); await deleteFixture(API,id); if(upstreamId) await deleteFixture(API,upstreamId); }
process.exit(failed?1:0);
