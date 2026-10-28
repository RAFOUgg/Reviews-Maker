/**
 * graphElementClipboard.js
 *
 * Presse-papiers d'ÉLÉMENTS de canevas — individu PhenoHunt, produit de Chaîne de production,
 * bulle épinglée — partagé par les deux canevas React Flow de l'app.
 *
 * Ce qui existait avant, et ce qui manquait :
 *   - « Dupliquer » (menu contextuel des nœuds) crée une copie immédiate à +100/+100 : aucun choix
 *     de l'endroit, rien ne survit à la fermeture du menu, et rien ne traverse ni les onglets ni
 *     les deux canevas.
 *   - « Copier les données » (bulles) écrit un TEXTE lisible dans le presse-papiers système, que
 *     `parsePastedBubble` (graphDataBubble.js) sait relire — mais ce texte perd tout ce qui n'est
 *     pas affiché : médias, cellules attachées, couleur, review liée.
 * Ce module ajoute le chaînon manquant : copier un élément, le GARDER dans le presse-papiers
 * système, et le recoller à l'endroit visé, autant de fois que voulu.
 *
 * Comment les deux cohabitent dans un seul presse-papiers : le texte écrit reste EXACTEMENT le
 * texte lisible d'avant (donc toujours collable en bulle, ici comme ailleurs), suivi d'une
 * dernière ligne technique `[terpologie:element] {json}` qui porte l'élément complet. Un
 * destinataire qui ne connaît pas ce marqueur (une note, un message) reçoit du texte lisible ;
 * `parsePastedBubble` (graphDataBubble.js, qui définit le format et donc le marqueur) retire cette
 * ligne avant toute relecture en bulle, pour qu'elle ne devienne jamais une donnée affichée.
 *
 * Aucun nom de champ n'est deviné ici : les fabriques ci-dessous listent exactement ce que les
 * routes de création acceptent (POST /trees/:id/nodes, POST /chains/:id/nodes, POST .../annotations)
 * et mettent dans `after` ce que SEULE la route de mise à jour persiste — `media` côté PhenoHunt,
 * `media`/`cellData` côté Chaîne (les routes de création les ignorent, cf. le second appel déjà
 * présent dans le « Dupliquer » de NodeContextMenu.jsx).
 */

import {
    bubbleToText,
    buildGeneticsNodeBubble,
    buildChainNodeBubble,
    ELEMENT_CLIPBOARD_MARKER
} from './graphDataBubble'

export { ELEMENT_CLIPBOARD_MARKER }

/**
 * Dernier élément copié DANS CET ONGLET. Le presse-papiers système reste la source principale ;
 * cette mémoire est le repli quand `readText()` est refusé (Firefox ne l'expose pas aux pages web)
 * et la seule lecture SYNCHRONE possible — c'est elle qui permet au menu de savoir, à l'ouverture,
 * s'il y a quelque chose à proposer de coller sans demander d'autorisation au navigateur.
 */
let memoryClipboard = null

/** Les champs JSON arrivent tantôt parsés (chargement d'arbre/chaîne) tantôt bruts (réponse d'une
 *  création, recopiée telle quelle dans le store) — normaliser ici évite de réencoder une chaîne
 *  déjà encodée au collage (`JSON.stringify` d'une string donne `"\"{...}\""`, illisible ensuite). */
function parseMaybeJson(value, fallback) {
    if (value === null || value === undefined) return fallback
    if (typeof value !== 'string') return value
    try { return JSON.parse(value) } catch { return fallback }
}

function normalizePosition(position) {
    const parsed = parseMaybeJson(position, null)
    return { x: Number(parsed?.x) || 0, y: Number(parsed?.y) || 0 }
}

function normalizeArray(value) {
    const parsed = parseMaybeJson(value, [])
    return Array.isArray(parsed) ? parsed : []
}

/** Décalage d'un élément par rapport au premier de la sélection — recoller plusieurs éléments doit
 *  reproduire leur disposition, pas les empiler au même point. */
function offsetFrom(origin, position) {
    const from = normalizePosition(origin)
    const to = normalizePosition(position)
    return { x: to.x - from.x, y: to.y - from.y }
}

// ── Fabriques d'éléments ────────────────────────────────────────────────────────────────────────
// Chacune renvoie { kind, create, after, bubble, offset } :
//   create : ce que la route de CRÉATION accepte, passé tel quel à store.addNode/addAnnotation ;
//   after  : ce qui exige un second appel de mise à jour (null s'il n'y a rien à reporter) ;
//   bubble : le contenu lisible de l'élément — sert au texte du presse-papiers ET de repli quand
//            l'élément ne peut pas exister sur le canevas de destination (cf. plus bas).

export function geneticsNodeItem(node, origin = node?.position) {
    const media = normalizeArray(node.media)
    return {
        kind: 'node',
        canvas: 'genetics',
        create: {
            cultivarName: node.cultivarName || 'Sans nom',
            color: node.color || null,
            image: node.image || null,
            genetics: parseMaybeJson(node.genetics, null),
            notes: node.notes || null,
            sourceReviewId: node.sourceReviewId || null
        },
        after: media.length > 0 ? { media } : null,
        bubble: buildGeneticsNodeBubble(node),
        offset: offsetFrom(origin, node.position)
    }
}

export function chainNodeItem(node, { origin = node?.position, pipelineSummary = null } = {}) {
    const media = normalizeArray(node.media)
    // id/attachedAt retirés comme le fait déjà `copyCells` (useProductionChainStore.js) : ils sont
    // régénérés à chaque attachement par `attachCellsToTargets`, seul chemin d'écriture de
    // cellules du store — deux produits ne doivent pas porter la même id de cellule.
    const cellData = normalizeArray(node.cellData).map(({ id, attachedAt, ...rest }) => rest)
    return {
        kind: 'node',
        canvas: 'chain',
        create: {
            reviewType: node.reviewType,
            reviewId: node.reviewId,
            color: node.color || null
        },
        after: (media.length > 0 || cellData.length > 0) ? { media, cellData } : null,
        bubble: buildChainNodeBubble(node, { pipelineSummary }),
        offset: offsetFrom(origin, node.position)
    }
}

/** Une bulle est le seul élément identique sur les deux canevas — elle se recolle indifféremment
 *  de l'un à l'autre (mêmes champs côté GenAnnotation et ChainAnnotation). */
export function annotationItem(annotation, origin = annotation?.position) {
    const body = normalizeArray(annotation.body)
    return {
        kind: 'annotation',
        canvas: 'any',
        create: {
            title: annotation.title || '',
            body,
            sourceLabel: annotation.sourceLabel || null,
            mediaUrl: annotation.mediaUrl || null,
            mediaType: annotation.mediaType || null
        },
        after: null,
        bubble: { title: annotation.title, body },
        offset: offsetFrom(origin, annotation.position)
    }
}

// ── Écriture / lecture ──────────────────────────────────────────────────────────────────────────

function describe(items) {
    if (items.length === 1) return items[0].bubble?.title || 'élément'
    return `${items.length} éléments`
}

/**
 * Copie une sélection d'éléments. Renvoie `{ label, system }` — `system` dit si le presse-papiers
 * du SYSTÈME a bien reçu le contenu (sinon seul le collage dans cet onglet fonctionnera, ce qui
 * reste le cas d'usage courant : on ne prévient donc pas l'utilisateur d'un échec sans conséquence).
 */
export async function copyElements(items) {
    const list = (Array.isArray(items) ? items : [items]).filter(Boolean)
    if (list.length === 0) return { label: null, system: false }

    const payload = { v: 1, label: describe(list), items: list }
    const readable = list.map(item => bubbleToText(item.bubble)).filter(Boolean).join('\n\n')
    const text = `${readable}\n${ELEMENT_CLIPBOARD_MARKER} ${JSON.stringify(payload)}`

    memoryClipboard = payload

    let system = false
    try {
        await navigator.clipboard.writeText(text)
        system = true
    } catch { /* presse-papiers système refusé — la mémoire de l'onglet prend le relais */ }

    return { label: payload.label, system }
}

/** Élément trouvé dans un texte collé, ou null si ce texte n'en contient pas. */
export function parseElementText(text) {
    const line = String(text || '')
        .split(/\r?\n/)
        .find(l => l.trim().startsWith(ELEMENT_CLIPBOARD_MARKER))
    if (!line) return null
    try {
        const payload = JSON.parse(line.trim().slice(ELEMENT_CLIPBOARD_MARKER.length).trim())
        return Array.isArray(payload?.items) && payload.items.length > 0 ? payload : null
    } catch {
        return null
    }
}

/** Lecture SYNCHRONE, sans autorisation navigateur : ce qui a été copié dans cet onglet. Sert au
 *  menu contextuel, qui doit décider à l'ouverture s'il affiche l'entrée « Coller ». */
export function peekElementClipboard() {
    return memoryClipboard
}

/**
 * Lecture réelle au moment du collage : le presse-papiers système d'abord (il peut contenir un
 * élément copié dans un AUTRE onglet, plus récent que la mémoire locale), la mémoire de l'onglet
 * en repli — y compris quand le système contient autre chose, pour qu'un copier/coller entamé
 * dans l'app ne soit pas cassé par une copie de texte faite entre-temps ailleurs.
 */
export async function readElementClipboard() {
    let text = ''
    try {
        text = (await navigator.clipboard?.readText?.()) || ''
    } catch { /* lecture refusée ou indisponible */ }

    return parseElementText(text) || memoryClipboard
}
