/**
 * Peut-on RÉELLEMENT réordonner un bloc en le glissant sur le rendu ?
 *
 * « pour rendre export maker plus simple il faut faire en sorte que le rendu soit maléable, on
 * pourrait alors changer l'ordre des elements en glissant déposant les containers » (2026-08-12).
 *
 * Une poignée qui apparaît ne prouve rien : on relève l'ordre des `data-module` AVANT, on glisse un
 * bloc au-dessus d'un autre, et on relève l'ordre APRÈS. Si la séquence est identique, le geste
 * n'aura été qu'une animation.
 */
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const id = await createFixture(API, 'flower', 'dense', { isPublic: 'true' });
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;

const ordre = () => p.evaluate(() => {
    const c = document.querySelector('#export-maker-screen-canvas');
    if (!c) return null;
    const vus = [];
    for (const el of c.querySelectorAll('[data-module]')) {
        const base = (el.getAttribute('data-module') || '').split('#')[0];
        if (base && !vus.includes(base)) vus.push(base);
    }
    return vus;
});

try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(6000);
    await p.getByRole('button', { name: /^Aperçu$/ }).first().click(); await sleep(5000);
    // Fiche Technique : c'est le template qui porte le plus de blocs distincts.
    await p.locator('button', { hasText: 'Fiche Technique Détaillée' }).first().click(); await sleep(5000);

    const avant = await ordre();
    if (!avant || avant.length < 3) throw new Error(`pas assez de blocs pour ordonner (${JSON.stringify(avant)})`);
    console.log('ordre avant :', avant.join(' → '));

    // On saisit le DERNIER bloc déplaçable et on le remonte au-dessus du premier.
    //
    // Filtré sur la hauteur : les enveloppes `genealogyCanvas`/`productionChainCanvas` restent dans
    // le DOM même quand la review n'a ni arbre ni chaîne liés (le canevas se masque, pas son
    // conteneur), soit un bloc de 0px qu'aucun curseur ne peut survoler. Le glissement s'y mesurait
    // donc sur un rectangle inexistant, et échouait pour une raison sans rapport avec le geste.
    const hauteurs = await p.evaluate(() => Object.fromEntries(
        [...document.querySelectorAll('#export-maker-screen-canvas [data-module]')].map((el) => [
            (el.getAttribute('data-module') || '').split('#')[0],
            el.getBoundingClientRect().height,
        ]),
    ));
    const deplacables = avant.filter((m) => !['masthead', 'mainImage', 'heroImage'].includes(m) && hauteurs[m] > 8);
    if (deplacables.length < 2) throw new Error(`pas assez de blocs visibles (${JSON.stringify(hauteurs)})`);
    const source = deplacables[deplacables.length - 1];
    const destination = deplacables[0];
    console.log(`glissement : « ${source} » au-dessus de « ${destination} »`);

    const boite = async (moduleId) => p.evaluate((m) => {
        const el = document.querySelector(`#export-maker-screen-canvas [data-module^="${m}"]`);
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, top: r.top };
    }, moduleId);

    const src = await boite(source);
    if (!src) throw new Error(`bloc source « ${source} » introuvable`);

    // Survol → la poignée apparaît en surcouche, coin haut gauche du bloc.
    await p.mouse.move(src.x, src.y); await sleep(800);
    const poignee = await p.evaluate(() => {
        const n = [...document.body.children].flatMap((c) => [...c.querySelectorAll?.('div[title="Glisser pour déplacer ce bloc"]') || []])[0]
            || document.querySelector('div[title="Glisser pour déplacer ce bloc"]');
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (!poignee) { console.log('KO — aucune poignée de glissement au survol d’un bloc'); ko++; }
    else {
        // TRAJET CONTINU, PAS DE TÉLÉPORT. Un `mouse.move` unique saute du bloc à la poignée sans
        // émettre les positions intermédiaires — aucune main ne fait ça. C'est ce raccourci qui a
        // laissé passer une poignée posée HORS du bloc : sortir du bloc effaçait le survol, donc la
        // poignée, ~18px avant qu'on l'atteigne (mesuré le 2026-08-14). On refait le trajet en pas
        // de 3px et on exige que la poignée soit encore là à l'arrivée.
        for (let i = 1; i <= 24; i++) {
            await p.mouse.move(src.x + ((poignee.x - src.x) * i) / 24, src.y + ((poignee.y - src.y) * i) / 24);
            await sleep(15);
        }
        const encoreLa = await p.evaluate(() => !!document.querySelector('div[title="Glisser pour déplacer ce bloc"]'));
        if (!encoreLa) { console.log('KO — la poignée disparaît avant que le curseur ne l’atteigne (inattrapable)'); ko++; }
        await p.mouse.down();

        // AMENER LA DESTINATION SOUS LE CURSEUR PAR LE GESTE, PAS PAR UN `scrollIntoView`.
        //
        // La version précédente faisait défiler jusqu'à la destination APRÈS avoir relevé la
        // position de la poignée : elle pressait donc des coordonnées périmées et saisissait le
        // bloc qui se trouvait là après défilement (mesuré : `gisement:overflow` déplacé à la place
        // de `pipeline:cultureTimeline`). Source et destination ne tiennent pas ensemble à l'écran ;
        // c'est au défilement automatique de bord de les rapprocher — donc on le sollicite.
        const cadre = await p.evaluate(() => {
            let n = document.querySelector('#export-maker-screen-canvas')?.parentElement;
            while (n && n !== document.body) {
                const ov = getComputedStyle(n).overflowY;
                if ((ov === 'auto' || ov === 'scroll') && n.scrollHeight > n.clientHeight + 1) {
                    const r = n.getBoundingClientRect();
                    return { x: r.x + r.width / 2, top: r.top, bottom: r.bottom };
                }
                n = n.parentElement;
            }
            return null;
        });
        if (!cadre) throw new Error('aucun conteneur défilant autour de l’aperçu');

        // Position visée : le CENTRE HORIZONTAL du bloc, pas l'axe du cadre. En mode Écran PC le
        // rendu coule en COLONNES — viser le milieu du cadre tombe dans la colonne de droite, où le
        // bloc cherché n'est pas (mesuré : `elementFromPoint` ne renvoyait aucun `[data-module]`
        // alors que la destination était bien à la bonne hauteur).
        const topDe = async (m) => {
            const r = await p.evaluate((mm) => {
                const el = document.querySelector(`#export-maker-screen-canvas [data-module^="${mm}"]`);
                if (!el) return null;
                const b = el.getBoundingClientRect();
                return { top: b.top, x: b.x + b.width / 2 };
            }, m);
            return r;
        };

        // On se colle au bord haut du cadre : la surcouche doit faire défiler d'elle-même.
        await p.mouse.move(cadre.x, cadre.top + 20);
        let visible = false;
        for (let i = 0; i < 60 && !visible; i++) {
            await p.mouse.move(cadre.x, cadre.top + 20 + (i % 2)); // un vrai mouvement à chaque tour
            await sleep(100);
            const t = await topDe(destination);
            visible = t !== null && t.top > cadre.top + 40 && t.top < cadre.bottom - 40;
        }
        if (!visible) { console.log('KO — le défilement automatique n’amène pas la destination à l’écran'); ko++; }

        // SORTIR DE LA BANDE DE DÉFILEMENT AVANT DE VISER. Tant que le curseur y reste, la
        // surcouche continue de faire défiler — et la destination, qui est le PREMIER bloc donc
        // proche du bord haut, glissait encore de quelques pixels pendant la pause précédant le
        // relâchement. Mesuré : curseur à 259, destination remontée à 261, donc dépôt dans le vide
        // et ordre inchangé — une fois sur deux. On immobilise d'abord le contenu.
        let x = cadre.x;
        let y = (cadre.top + cadre.bottom) / 2;
        await p.mouse.move(x, y);
        await sleep(500);

        // DESCENTE vers la moitié HAUTE de la destination (= insertion avant elle). Le contenu est
        // désormais immobile, on relit quand même sa position à chaque pas par sécurité.
        for (let i = 0; i < 40; i++) {
            const t = await topDe(destination);
            if (!t) break;
            // Aussi bas que possible DANS la moitié haute : plus on s'éloigne du bord du cadre,
            // moins on risque de rentrer dans la bande de défilement.
            const vise = t.top + 10;
            x = t.x;
            if (Math.abs(y - vise) < 6) { await p.mouse.move(x, y); break; }
            y += Math.sign(vise - y) * Math.min(40, Math.abs(vise - y));
            await p.mouse.move(x, y);
            await sleep(60);
        }
        // CONFIRMER LA VISÉE AVANT DE RELÂCHER. La destination est le premier bloc, donc proche du
        // bord haut — c'est-à-dire dans la bande de défilement automatique, qui continue de la
        // faire glisser de quelques pixels pendant la pause finale. Viser une coordonnée calculée
        // ne suffit donc pas : on vérifie ce qu'il y a RÉELLEMENT sous le curseur, et on corrige.
        for (let i = 0; i < 12; i++) {
            const vu = await p.evaluate(({ cx, cy }) => {
                const el = document.elementFromPoint(cx, cy)?.closest?.('[data-module]');
                return (el?.getAttribute('data-module') || '').split('#')[0] || null;
            }, { cx: x, cy: y });
            if (vu === destination) break;
            const t = await topDe(destination);
            if (!t) break;
            x = t.x; y = t.top + 10;
            await p.mouse.move(x, y);
            await sleep(120);
        }
        await sleep(300);
        const etat = await p.evaluate(({ mm, cx, cy }) => {
            const root = document.querySelector('#export-maker-screen-canvas');
            const sous = document.elementFromPoint(cx, cy);
            const bloc = sous?.closest?.('[data-module]');
            const barre = [...document.body.querySelectorAll('div')].find((d) => d.style.position === 'fixed'
                && d.style.height === '4px' && d.style.background === 'rgb(139, 92, 246)');
            const dest = document.querySelector(`#export-maker-screen-canvas [data-module^="${mm}"]`);
            return {
                curseur: `${Math.round(cx)},${Math.round(cy)}`,
                sous: sous ? sous.tagName.toLowerCase() : 'null',
                blocSousCurseur: bloc?.getAttribute('data-module') || 'aucun',
                dansRoot: bloc ? root.contains(bloc) : false,
                // Le témoin « ⠿ Nom du bloc » n'existe que tant qu'un bloc est saisi.
                glissementEnCours: !!document.body.querySelector('div[style*="position: fixed"][style*="white-space: nowrap"]'),
                barre: barre ? Math.round(barre.getBoundingClientRect().top) : null,
                destTop: dest ? Math.round(dest.getBoundingClientRect().top) : null,
            };
        }, { mm: destination, cx: x, cy: y });
        console.log('avant relâchement :', JSON.stringify(etat));
        await p.mouse.up(); await sleep(2500);

        const apres = await ordre();
        console.log('ordre après :', apres.join(' → '));
        if (JSON.stringify(apres) === JSON.stringify(avant)) { console.log('KO — l’ordre des blocs n’a pas changé'); ko++; }
        else if (apres.indexOf(source) >= apres.indexOf(destination)) {
            console.log(`KO — « ${source} » n’est pas remonté avant « ${destination} »`); ko++;
        }
    }
} finally {
    await b.close();
    await deleteFixture(API, id).catch(() => {});
}
console.log(ko === 0 ? '\nOK — les blocs se réordonnent au glisser-déposer' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
