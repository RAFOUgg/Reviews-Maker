/*
 * Jeux de données d'audit — les 3 densités du plan C5 §4, pour les 4 types de review.
 *
 * Chaque densité cible une classe de défaut précise :
 *   minimal — le strict RÉELLEMENT atteignable : photo (obligatoire à l'enregistrement côté
 *             produit) + nom, sans note, sans arôme, sans pipeline → débusque les blocs vides et
 *             les mises en page qui supposent plus de données qu'il n'en existe.
 *   nominal — une review réaliste complète → le cas courant.
 *   dense   — pipelines longs, tous champs remplis → débusque débordements et pertes de contenu.
 *
 * Les fixtures sont créées via l'API réelle (donc soumises aux mêmes validations que la saisie
 * utilisateur) et supprimées en fin d'audit. Aucune écriture directe en base.
 */

const ENDPOINT = {
    flower: 'flower-reviews',
    hash: 'hash-reviews',
    concentrate: 'concentrate-reviews',
    edible: 'edible-reviews',
};

// Le champ de nom n'a PAS le même nom selon le type (vérifié dans les routes serveur) : les 3
// premiers attendent `nomCommercial`, le comestible attend `nomProduit`. C'est exactement le genre
// d'écart qu'il ne faut pas deviner.
const NAME_FIELD = {
    flower: 'nomCommercial',
    hash: 'nomCommercial',
    concentrate: 'nomCommercial',
    edible: 'nomProduit',
};

const TYPE_LABEL = { flower: 'Fleurs', hash: 'Hash', concentrate: 'Concentré', edible: 'Comestible' };

/** Chronologie de N étapes à conditions quasi stables, avec quelques divergences volontaires. */
// PNG 2×2 valide, encodé en base64. Les fixtures n'avaient jusqu'ici JAMAIS de photo — or la photo
// est le visuel principal d'une carte (Moderne Compact, Story). Auditer la composition d'une carte
// sans image, c'est juger une mise en page amputée de son élément dominant.
import { deflateSync } from 'zlib';

const TINY_PNG_B64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGP8z8Dwn4GBgYGJAQkAAB'
    + 'EeAQchsheAAAAAAElFTkSuQmCC';

function timeline(n, base, deltas = {}) {
    return Array.from({ length: n }, (_, i) => {
        const day = i + 1;
        const cell = { timestamp: `day-${day}`, cellLabel: `J${day}`, ...base };
        if (deltas[day]) Object.assign(cell, deltas[day]);
        return cell;
    });
}

const SENSORY = {
    couleurScore: 8, densiteVisuelle: 7, trichomesScore: 9, pistilsScore: 7, manucureScore: 8,
    intensiteAromeScore: 9, complexiteAromeScore: 8, fideliteAromeScore: 7,
    dureteScore: 6, densiteTactileScore: 7, collantScore: 8, elasticiteScore: 6,
    monteeScore: 8, intensiteEffetScore: 9, intensiteGoutScore: 7, agressiviteScore: 4,
};

const CANNABINOIDS = { thcPercent: 24.5, cbdPercent: 0.8, cbgPercent: 1.2, cbnPercent: 0.3 };

const AROMAS = {
    notesOdeursDominantes: JSON.stringify(['Diesel', 'Agrumes', 'Terreux']),
    notesOdeursSecondaires: JSON.stringify(['Pin', 'Poivre']),
};

const DESCRIPTION = "Review de contrôle générée pour l'audit de rendu : elle sert à mesurer la lisibilité, "
    + "la densité et la hiérarchie visuelle sur chaque combinaison de template et de format.";

/** Construit le corps de requête d'une fixture. */
export function buildFixture(type, density) {
    const name = `ZZ-AUDIT ${TYPE_LABEL[type]} ${density}`;
    const body = { [NAME_FIELD[type]]: name, status: 'draft', type: TYPE_LABEL[type] };
    if (density === 'minimal') return body;

    Object.assign(body, { description: DESCRIPTION, ...CANNABINOIDS, ...AROMAS });
    if (type !== 'edible') Object.assign(body, SENSORY);

    const long = density === 'dense';

    if (type === 'flower') {
        const culture = timeline(long ? 25 : 6,
            { temperature: 24, humidity: 68, co2Ppm: 888, ph: 6.2 },
            {
                12: { temperature: 27 },
                19: { humidity: 55, ph: 6.0 },
                // PHOTO D'ÉTAPE — angle mort du jeu de test jusqu'au 2026-08-13 (C14 §7 quater #5).
                //
                // Aucune fixture n'attachait de média à une cellule de pipeline, alors que le
                // formulaire le permet et que la case le rend. Le rendu de ce cas n'était donc
                // JAMAIS exercé : une mesure verte ne prouvait rien à son sujet. C'est exactement
                // l'angle mort qui, une fois fermé sur les canevas (C14 §3), avait révélé une
                // disparition de contenu en production.
                //
                // Forme reprise de `PipelineCellMediaPreview` (`{ url, type?, caption? }`), pas
                // devinée. URL en `data:` : le rendu ne dépend d'aucun fichier servi, donc la
                // mesure ne peut pas dépendre d'une course réseau.
                22: {
                    note: 'Défoliation légère',
                    media: [{ url: `data:image/png;base64,${TINY_PNG_B64}`, caption: 'Défoliation' }],
                },
            });
        culture.forEach((c, i) => { c.phase = i < 7 ? 'Germination' : i < 17 ? 'Croissance' : 'Floraison'; });
        body.cultureTimelineData = JSON.stringify(culture);
        body.cultureTimelineConfig = JSON.stringify({ type: 'jour', totalDays: culture.length });
    }
    if (type === 'hash') {
        const sep = timeline(long ? 18 : 5, { temperatureEau: 4, tailleMailles: 90 }, { 9: { tailleMailles: 120 } });
        body.separationTimelineData = JSON.stringify(sep);
        body.separationTimelineConfig = JSON.stringify({ type: 'jour', totalDays: sep.length });
        body.methodeSeparation = 'ice-water';
        body.nombrePasses = 4;
    }
    if (type === 'concentrate') {
        const ext = timeline(long ? 16 : 5, { temperature: 38, pression: 120 }, { 7: { temperature: 42 } });
        body.extractionTimelineData = JSON.stringify(ext);
        body.extractionTimelineConfig = JSON.stringify({ type: 'heure', totalHours: ext.length });
        body.methodeExtraction = 'rosin';
    }
    if (type === 'edible') {
        body.ingredients = JSON.stringify([
            { nom: 'GMRozin', quantite: 1, unite: 'g' },
            { nom: 'Oeuf', quantite: 1, unite: 'pcs' },
            { nom: 'Farine', quantite: 250, unite: 'g' },
        ]);
        body.servings = 12;
        body.finalWeight = 480;
    }

    if (type !== 'edible') {
        const curing = timeline(long ? 14 : 4, { temperature: 18, ambientHumidity: 62 }, { 10: { ambientHumidity: 58 } });
        body.curingTimelineData = JSON.stringify(curing);
        body.curingTimelineConfig = JSON.stringify({ type: 'jour', totalDays: curing.length });
    }

    return body;
}

// IMAGE DE TEST STRUCTURÉE — 96×96 : dégradé vertical, damier, diagonale.
//
// Le PNG de 2×2 ci-dessus suffit à prouver qu'une image EST LÀ et qu'elle occupe sa place, mais pas
// à JUGER une mise en page : étalé en `object-cover` sur une carte, il donne un aplat uni.
// Constaté le 2026-08-13 en inspectant un export Moderne Compact 1:1 — la moitié de la carte était
// un rectangle rouge que rien ne distinguait d'une image cassée. Une inspection visuelle incapable
// de séparer « photo bien cadrée » de « aplat » ne prouve rien.
//
// Ce motif a un haut et un bas distincts (dégradé), une trame régulière (damier) et une diagonale :
// un recadrage, une déformation ou une inversion se voient immédiatement.
function encodePng(cote, lignes) {
    const table = [];
    for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    const crc32 = (buf) => {
        let c = 0xffffffff;
        for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
        return (c ^ 0xffffffff) >>> 0;
    };
    const chunk = (type, data) => {
        const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
        const corps = Buffer.concat([Buffer.from(type, 'ascii'), data]);
        const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(corps));
        return Buffer.concat([len, corps, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(cote, 0); ihdr.writeUInt32BE(cote, 4);
    ihdr[8] = 8; ihdr[9] = 2; // 8 bits par canal, RVB
    const brut = Buffer.concat(lignes.map((l) => Buffer.concat([Buffer.from([0]), l])));
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(brut)),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

function motifTest(cote = 96) {
    const lignes = [];
    for (let y = 0; y < cote; y += 1) {
        const ligne = Buffer.alloc(cote * 3);
        for (let x = 0; x < cote; x += 1) {
            const damier = ((x >> 4) + (y >> 4)) % 2 === 0 ? 24 : 0;
            const diagonale = Math.abs(x - y) < 3 ? 90 : 0;
            ligne[x * 3] = Math.min(255, 40 + Math.round((y / cote) * 120) + damier + diagonale);
            ligne[x * 3 + 1] = Math.min(255, 90 + Math.round((x / cote) * 110) + damier + diagonale);
            ligne[x * 3 + 2] = Math.min(255, 60 + Math.round(((cote - y) / cote) * 80) + damier);
        }
        lignes.push(ligne);
    }
    return encodePng(cote, lignes);
}

const IMAGE_TEST = motifTest();

function tinyPngBlob() {
    return new Blob([IMAGE_TEST], { type: 'image/png' });
}

/**
 * Crée une fixture via l'API. Retourne son id.
 *
 * `extra` pose des champs supplémentaires à LA CRÉATION — en particulier `geneticTreeId`. C'est le
 * seul moment où on peut le faire : `PUT /api/flower-reviews/:id` est un remplacement complet (il
 * exige `nomCommercial` et écraserait le contenu dense de la fixture), et `GET` sur cette même
 * route répond 403 sans session, ce qui interdit de relire la review pour la reposer entière.
 */
export async function createFixture(baseApi, type, density, extra = {}) {
    const body = { ...buildFixture(type, density), ...extra };
    const fd = new FormData();
    for (const [k, v] of Object.entries(body)) fd.append(k, String(v));
    // TOUTES les densités portent une photo, y compris `minimal` (corrigé le 2026-08-05).
    //
    // Elle en était exclue pour débusquer les mises en page supposant une image — ce qui a bien
    // servi (placeholder occupant une page entière, corrigé). Mais le produit rend la photo du
    // produit fini OBLIGATOIRE à l'enregistrement : une review sans photo ne peut pas exister.
    // Mesurer contre ce cas revenait à optimiser un scénario impossible, et faisait remonter des
    // remplissages de 13 % qui ne se produiront jamais.
    //
    // `minimal` garde son rôle : le strict minimum RÉELLEMENT atteignable — photo + nom, sans
    // note, sans arôme, sans pipeline.
    // Une seule photo par défaut : c'est le cas courant, et c'est la baseline de la matrice.
    // `photoCount` permet à un contrôle ciblé (sélecteur de photos, galerie) d'en demander
    // plusieurs sans déplacer cette baseline.
    const photoCount = Math.max(1, extra.photoCount || 1);
    for (let n = 0; n < photoCount; n += 1) fd.append('images', tinyPngBlob(), `audit-fixture-${n}.png`);
    const res = await fetch(`${baseApi}/api/${ENDPOINT[type]}`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`Création ${type}/${density} : HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    // Les 4 routes de création n'ont PAS la même enveloppe de réponse : `{data:{id}}` pour
    // certaines, `{success,review:{id}}` pour edible. Constaté à l'exécution, pas supposé.
    const id = json?.data?.id || json?.review?.id || json?.id;
    if (!id) {
        throw new Error(`Création ${type}/${density} : aucun id dans ${JSON.stringify(json).slice(0, 120)}`);
    }
    return id;
}


// Un échec de fixture doit se VOIR. Ce helper renvoyait `null` en silence, et c'est exactement ce
// qui a laissé passer TROIS jeux de test aveugles d'affilée :
//   • la chaîne dont le 2e nœud était rejeté (400, trouvé le 2026-08-07) ;
//   • l'arbre dont TOUS les nœuds étaient rejetés (400 « Valid cultivar name is required » — le
//     corps envoyait `label`, le contrat attend `cultivarName` ; trouvé le 2026-08-10) ;
//   • l'arête de chaîne, rejetée elle aussi (400 — `sourceId`/`targetId` au lieu de
//     `sourceNodeId`/`targetNodeId`), donc pas un seul LIEN rendu entre deux produits.
// À chaque fois le canevas ne se montait pas, ou se montait vide, ses modules mesuraient 16-32px, et
// aucun rapport d'audit ne pouvait le révéler. D'où le bruit assumé de ces avertissements.
function makePost(baseApi) {
    return async (url, body) => {
        try {
            const res = await fetch(`${baseApi}${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                console.warn(`  ⚠ fixture : POST ${url} → ${res.status} ${(await res.text()).slice(0, 120)}`);
                return null;
            }
            return await res.json();
        } catch (e) {
            console.warn(`  ⚠ fixture : POST ${url} → ${e.message}`);
            return null;
        }
    };
}

/**
 * Crée un ARBRE GÉNÉALOGIQUE peuplé (2 cultivars + 1 filiation) et retourne son id.
 *
 * Séparé de `attachCanvases` parce qu'il doit exister AVANT la review : `geneticTreeId` ne peut se
 * poser qu'à la création (cf. `createFixture`). Tant qu'il ne l'était pas, `ReadOnlyGenealogyCanvas`
 * se masquait faute de lien, et le canevas de généalogie n'a JAMAIS été rendu dans un audit.
 */
export async function createGeneticTree(baseApi, label = 'audit') {
    const post = makePost(baseApi);
    const tree = await post('/api/genetics/trees', { name: `ZZ-AUDIT arbre ${label}` });
    const treeId = tree?.id || tree?.data?.id;
    if (!treeId) return null;
    // `cultivarName`, PAS `label` — contrat de `validateNodeCreation` (`validateGenetics.js`).
    // `label` est le vocabulaire des nœuds de CHAÎNE, un tout autre modèle : 9e occurrence du bug
    // de vocabulaire deviné de ce repo, la première à ne toucher que l'outillage.
    const p = await post(`/api/genetics/trees/${treeId}/nodes`,
        { cultivarName: 'ZZ-AUDIT Parent A', position: { x: 40, y: 40 } });
    const c = await post(`/api/genetics/trees/${treeId}/nodes`,
        { cultivarName: 'ZZ-AUDIT Parent B', position: { x: 240, y: 40 } });
    // Une filiation, pas deux nœuds posés côte à côte : sans arête, la géométrie des liaisons
    // (handles, tracé) n'est pas exercée — c'est la moitié de ce qu'un arbre doit rendre.
    const pId = p?.id || p?.data?.id, cId = c?.id || c?.data?.id;
    if (pId && cId) await post(`/api/genetics/trees/${treeId}/edges`, { parentNodeId: pId, childNodeId: cId });
    return treeId;
}

/**
 * Porte d'entrée à utiliser PARTOUT : une fixture dont les deux canevas sont réellement exercés
 * (arbre généalogique lié + chaîne de production reliée à une review amont distincte).
 *
 * Retourne `{ id, treeId, chainId, upstreamId }`. `upstreamId` est une VRAIE review : l'appelant
 * doit la supprimer au nettoyage comme la principale.
 */
export async function createFixtureWithCanvases(baseApi, type, density) {
    // L'arbre d'abord : son id doit voyager dans le corps de création de la review.
    const treeId = type === 'flower' ? await createGeneticTree(baseApi, `${type}/${density}`) : null;
    const id = await createFixture(baseApi, type, density, treeId ? { geneticTreeId: treeId } : {});
    const { chainId, upstreamId } = await attachCanvases(baseApi, id, type);
    return { id, treeId, chainId, upstreamId };
}

/**
 * Attache une CHAÎNE DE PRODUCTION à une fixture existante.
 *
 * POURQUOI C'EST INDISPENSABLE. Sans elle, les fixtures n'exercent jamais le canevas — et une
 * mesure « inchangée » ne prouve alors rien à son sujet. C'est précisément cet angle mort qui a
 * laissé partir en production, le 2026-08-06, une régression faisant disparaître la chaîne ET la
 * généalogie de tous les rendus : les métriques d'export étaient identiques, puisque rien de ce
 * qui avait disparu n'était mesuré.
 *
 * Ne lève jamais : l'absence de droits (accès Pro requis sur cette route) ne doit pas faire échouer
 * tout l'audit, elle doit juste laisser la fixture sans canevas.
 */
export async function attachCanvases(baseApi, id, type) {
    const post = makePost(baseApi);

    const chain = await post('/api/production-chains/chains', { name: `ZZ-AUDIT chaîne ${type}` });
    const chainId = chain?.id || chain?.data?.id;
    // Review AMONT distincte. Les deux nœuds pointaient auparavant sur la MÊME review : le serveur
    // rejette le second (400 « Invalid review reference »), `post()` avale l'erreur, et la chaîne
    // se retrouvait avec un seul nœud. Or `ReadOnlyProductionChainCanvas` exige `nodes.length >= 2`
    // — le canevas ne s'est donc JAMAIS rendu dans un audit, et ses modules mesuraient 16-20px.
    // Le commit qui prétendait attacher une chaîne aux fixtures (2026-08-06) n'a en réalité rien
    // exercé, faute d'avoir vérifié le résultat. Une chaîne réelle relie de toute façon deux
    // produits différents (Fleur → Hash), pas une review à elle-même.
    let upstreamId = null;
    if (chainId) {
        upstreamId = await createFixture(baseApi, 'flower', 'minimal').catch(() => null);
        const a = await post(`/api/production-chains/chains/${chainId}/nodes`,
            { reviewType: type, reviewId: id, position: { x: 320, y: 60 } });
        const b = upstreamId && await post(`/api/production-chains/chains/${chainId}/nodes`,
            { reviewType: 'flower', reviewId: upstreamId, position: { x: 40, y: 60 } });
        const aId = a?.id || a?.data?.id, bId = b?.id || b?.data?.id;
        if (aId && bId) {
            // `sourceNodeId`/`targetNodeId`, PAS `sourceId`/`targetId` — contrat de
            // `validateChainEdgeCreation` (`validateProductionChain.js`), qui exige exactement UN
            // point d'ancrage par côté (nœud XOR annotation). Le corps précédent était rejeté en 400
            // et l'erreur avalée : la chaîne n'a jamais porté d'ARÊTE dans un audit, donc le lien
            // entre deux produits — l'objet même de la traçabilité — n'a jamais été rendu ni mesuré,
            // alors même que ses deux nœuds l'étaient depuis le 2026-08-07.
            await post(`/api/production-chains/chains/${chainId}/edges`,
                { sourceNodeId: bId, targetNodeId: aId, technique: 'Extraction à froid' });
        }
    }

    // `upstreamId` remonte pour que l'appelant la supprime au nettoyage : c'est une vraie review.
    return { chainId, upstreamId };
}

/** Supprime une fixture. Ne lève jamais — le nettoyage ne doit pas masquer le résultat d'audit. */
export async function deleteFixture(baseApi, id) {
    try {
        const res = await fetch(`${baseApi}/api/reviews/${id}`, { method: 'DELETE' });
        return res.ok;
    } catch {
        return false;
    }
}

export const DENSITIES = ['minimal', 'nominal', 'dense'];
export const TYPES = Object.keys(ENDPOINT);
export { TYPE_LABEL };
