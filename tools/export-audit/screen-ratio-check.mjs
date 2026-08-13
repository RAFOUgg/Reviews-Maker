/**
 * Le mode ÉCRAN respecte-t-il le format demandé ?
 *
 * Signalé par l'utilisateur : « formats carré du template social media = problème rendu horizontal
 * pas carré ». Le FICHIER était pourtant bien carré (canevas 800×800, PNG 1600×1600) — le défaut
 * était propre à l'aperçu écran, qui rendait tous les templates en hauteur libre, y compris les
 * CARTES bâties sur un canevas fixe (`h-full` + `FitToFill`). Sans référence de hauteur, leur mise
 * en page retombe sur la hauteur du contenu.
 *
 * On mesure donc le canevas ÉCRAN, pas le fichier : une carte doit sortir au ratio exact.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';
const BASE='http://localhost:5173', API='http://localhost:3000';
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
let ko=0;
const verdict=(n,ok,d)=>{ if(!ok) ko++; console.log(`${ok?'✔':'✖'} ${n}${d?' — '+d:''}`); };

// Cartes (canevas fixe) et documents (hauteur libre), avec le ratio attendu pour les cartes.
const CAS = [
    { template:'socialStory',  ratio:'1:1',  nom:'Story · carré',        carte:true,  attendu:[800,800] },
    { template:'socialStory',  ratio:'9:16', nom:'Story · portrait',     carte:true,  attendu:[1080,1920] },
    { template:'modernCompact',ratio:'1:1',  nom:'Compact · carré',      carte:true,  attendu:[800,800] },
    { template:'modernCompact',ratio:'16:9', nom:'Compact · paysage',    carte:true,  attendu:[1920,1080] },
    { template:'detailedCard', ratio:'1:1',  nom:'Fiche · document',     carte:false, attendu:null },
];

const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1600,height:1000}});
p.on('pageerror',e=>console.log('JS ERR:',String(e.message).slice(0,140)));
try{
  for (const c of CAS) {
    const id=await createFixture(API,'flower','dense',{exportMakerConfig:JSON.stringify({template:c.template,ratio:c.ratio})});
    try{
      // `/r/:id/lineage` monte `SingleReviewCard`, le composant du mode Écran.
      await p.goto(`${BASE}/r/${id}/lineage`,{waitUntil:'networkidle'}); await sleep(6000);
      const m=await p.evaluate(()=>{
        // Sélection par `data-ratio`, l'attribut que `TemplateRenderer` pose lui-même : l'`id` du
        // canevas varie d'une surface à l'autre (la page de lignée en fabrique un par review).
        const c=document.querySelector('[data-ratio]');
        return c ? { w:c.offsetWidth, h:c.offsetHeight, id:c.id || '(sans id)' } : null;
      });
      if(!m){ verdict(c.nom, false, 'canevas introuvable'); continue; }
      if(c.carte){
        verdict(c.nom, m.w===c.attendu[0] && m.h===c.attendu[1], `${m.w}×${m.h} (attendu ${c.attendu.join('×')})`);
      } else {
        // Un document peut dépasser la hauteur nominale : c'est sa nature.
        verdict(c.nom, m.h >= 800, `${m.w}×${m.h} — grandit librement`);
      }
    } finally { await deleteFixture(API,id); }
  }
} catch(e){ ko++; console.log('✖ interrompu —', String(e.message).slice(0,160)); }
finally { await b.close(); }
console.log(ko===0 ? '\n✔ le mode écran respecte le format' : `\n✖ ${ko} cas en échec`);
process.exit(ko?1:0);
