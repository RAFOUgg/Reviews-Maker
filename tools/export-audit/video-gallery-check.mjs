/**
 * Une VIDÉO du produit se voit-elle dans la vignette d'une carte de review ?
 *
 * Distinct de `video-media-check.mjs`, qui couvre la vidéo attachée à une ÉTAPE de pipeline dans le
 * RENDU. Ici il s'agit des médias du produit fini (« Photos / vidéos du produit », 1 à 4) tels que
 * les affichent les CARTES : bibliothèque, galerie, compte.
 *
 * Mesuré le 2026-08-16 sur la review « Lamponi Frozen » en production, dont la 4ᵉ photo est un
 * `/images/hash-…mp4` : la mosaïque de la bibliothèque rendait CHAQUE média dans une balise `<img>`
 * sans jamais tester son type. La vidéo y apparaissait donc en carreau cassé portant son texte de
 * remplacement. Seule la galerie publique (`ReviewCoverMedia.jsx`) savait déjà les distinguer.
 *
 * Deux volets, délibérément différents :
 *
 *   1. STATIQUE — la liste d'extensions vidéo du client est un MIROIR de celle du serveur, qui fait
 *      autorité sur ce qui est accepté à l'envoi. Les deux paquets npm étant séparés, la copie ne
 *      peut pas être garantie par un import : elle est donc comparée ici. Ce volet aurait attrapé
 *      l'écart réel qui existait avant ce correctif (`ogg` au lieu de `ogv`, `mkv`/`3gp`/`wmv`
 *      absents), lequel faisait classer « photo » une vidéo parfaitement acceptée.
 *
 *   2. MESURÉ — sur une review qui porte RÉELLEMENT une photo ET une vidéo, la carte ne doit
 *      contenir AUCUNE balise `<img>` pointant vers un fichier vidéo (le défaut d'origine), et doit
 *      contenir un vrai élément `<video>`. La photo est vérifiée au passage : ce correctif ne doit
 *      pas l'avoir emportée.
 */
import { readFileSync } from 'fs';
import { chromium } from 'playwright';
import { createFixture, deleteFixture } from './fixtures.mjs';

const BASE = 'http://localhost:5173';
const API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIDEO_EXT = /\.(mp4|m4v|webm|ogv|mov|qt|mkv|avi|3gp|3g2|mts|m2ts|wmv|flv|mpeg|mpg|hevc)(\?|#|$)/i;

let ko = 0;

// ── Volet 1 : la copie client ne diverge pas du serveur ─────────────────────────────────────────
const listeDe = (fichier, nom) => {
    const src = readFileSync(new URL(fichier, import.meta.url), 'utf8');
    const bloc = new RegExp(`${nom}\\s*=\\s*\\[([\\s\\S]*?)\\]`).exec(src);
    if (!bloc) return null;
    return [...bloc[1].matchAll(/'([a-z0-9]+)'/g)].map((m) => m[1]).sort();
};

for (const nom of ['VIDEO_EXTENSIONS', 'NATIVELY_PLAYABLE_VIDEO_EXTENSIONS']) {
    const serveur = listeDe('../../server-new/utils/uploadFormats.js', nom);
    const client = listeDe('../../client/src/utils/mediaFileHelpers.js', nom);
    if (!serveur || !client) {
        console.log(`KO — ${nom} introuvable (serveur:${!!serveur} client:${!!client})`);
        ko++;
    } else if (serveur.join(',') !== client.join(',')) {
        console.log(`KO — ${nom} a divergé entre client et serveur`);
        console.log(`     serveur seul : ${serveur.filter((e) => !client.includes(e)).join(', ') || '—'}`);
        console.log(`     client seul  : ${client.filter((e) => !serveur.includes(e)).join(', ') || '—'}`);
        ko++;
    } else {
        console.log(`OK — ${nom} : ${client.length} extensions, identiques des deux côtés`);
    }
}

// ── Volet 2 : la vignette de carte pose la bonne balise ─────────────────────────────────────────
const id = await createFixture(API, 'hash', 'nominal', { isPublic: 'true', withVideo: true });
console.log(`\nreview ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));

try {
    // La bibliothèque est la surface de la capture d'origine. Elle demande une session, mais
    // `requireAuth` est court-circuité en NODE_ENV=development (cf. CLAUDE.md) : `/api/reviews/my`
    // répond 200 sans cookie, vérifié avant d'écrire cette sonde.
    //
    // `?tab=reviews` est indispensable : la Bibliothèque ouvre sur « Vue d'ensemble », dont les
    // vignettes ne sont PAS celles de `ReviewsTab`. Sans ce paramètre la sonde mesurait un autre
    // écran et concluait « aucune vidéo » alors que la carte visée n'était même pas montée.
    await p.goto(`${BASE}/library?tab=reviews`, { waitUntil: 'networkidle' });
    await sleep(3500);

    const etat = await p.evaluate((rxSource) => {
        const rx = new RegExp(rxSource, 'i');
        const srcsImg = [...document.querySelectorAll('img')].map((i) => i.getAttribute('src') || '');
        const srcsVideo = [...document.querySelectorAll('video')].map((v) => v.getAttribute('src') || '');
        return {
            vignettes: srcsImg.length + srcsVideo.length,
            imgsVideo: srcsImg.filter((s) => rx.test(s)),
            videos: srcsVideo.filter((s) => rx.test(s)),
            photos: srcsImg.filter((s) => /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i.test(s)),
        };
    }, VIDEO_EXT.source);

    console.log(`bibliothèque : ${etat.photos.length} photo(s) | ${etat.videos.length} balise(s) <video> | ${etat.imgsVideo.length} <img> pointant une vidéo`);

    if (etat.vignettes === 0) {
        console.log('KO — aucune vignette de review dans la bibliothèque : la mesure ne prouve rien');
        ko++;
    }
    if (etat.imgsVideo.length > 0) {
        console.log(`KO — ${etat.imgsVideo.length} balise(s) <img> pointent vers une vidéo (vignette cassée) : ${etat.imgsVideo[0]}`);
        ko++;
    }
    if (etat.videos.length === 0) {
        console.log('KO — aucune balise <video> : la vidéo du produit n’est rendue nulle part sur la carte');
        ko++;
    }
    if (etat.photos.length === 0) {
        console.log('KO — régression : plus aucune photo rendue dans les cartes');
        ko++;
    }

    console.log(ko === 0 ? '\n== OK — la vidéo du produit est visible dans la carte' : `\n== ${ko} ÉCART(S)`);
} finally {
    await b.close();
    await deleteFixture(API, id);
}
process.exit(ko === 0 ? 0 : 1);
