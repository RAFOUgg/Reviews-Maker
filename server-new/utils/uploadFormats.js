/**
 * SOURCE UNIQUE des formats de fichiers acceptés à l'envoi.
 *
 * Cette liste vivait jusqu'ici en CINQ copies littérales — `routes/media-upload.js` et les quatre
 * routes de review (`flower`/`hash`/`concentrate`/`edible`) — chacune écrite à la main sous la forme
 * d'une regex `/jpeg|jpg|png|gif|webp|pdf|mp4|webm|mov|m4v/`. Mesuré le 2026-08-14 sur les routes
 * réelles : une photo iPhone (`.heic`) et une vidéo `.mkv`/`.avi`/`.3gp` étaient refusées en 400
 * QUELLE QUE SOIT leur taille, alors qu'un mp4 de 60 Mo passait — c'était le format qui bloquait,
 * jamais le poids (la limite réelle est de 200 Mo).
 *
 * Deux règles de fond, tirées de ce qui échouait vraiment :
 *
 *  1. L'EXTENSION fait autorité, le type MIME est un contrôle secondaire TOLÉRANT. Les navigateurs
 *     n'annoncent pas un type fiable : selon la plateforme, un `.mov` arrive en `video/quicktime`,
 *     un `.mkv` en `video/x-matroska` OU `video/matroska`, et un fichier venant d'un gestionnaire de
 *     fichiers arrive fréquemment en `application/octet-stream` — voire avec un type vide. L'ancien
 *     filtre exigeait que l'extension ET le type correspondent tous deux à sa regex : un type
 *     générique suffisait donc à faire refuser un fichier parfaitement valide.
 *  2. Un type MIME qui contredit FRANCHEMENT l'extension reste refusé (ex. `.jpg` annoncé
 *     `application/zip`) — la tolérance porte sur l'inconnu, pas sur l'incohérence.
 */

import path from 'path'

/** Limite réelle par fichier. Tout message d'erreur doit en dériver, jamais la réécrire à la main. */
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024
export const MAX_UPLOAD_LABEL = '200 Mo'

/**
 * Types MIME que les navigateurs envoient quand ils ne savent pas — ou ne veulent pas — qualifier
 * le fichier. Ils ne prouvent rien, ni dans un sens ni dans l'autre : on s'en remet à l'extension.
 */
const GENERIC_MIMES = new Set(['', 'application/octet-stream', 'binary/octet-stream', 'application/binary'])

/** Photos. `heic`/`heif` sont acceptées PUIS converties en JPEG (cf. `utils/heicToJpeg.js`) — aucun
 *  navigateur ne sait afficher un HEIC, l'accepter sans convertir ne ferait que déplacer le problème. */
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif']

/** Formats à convertir en JPEG dès réception (illisibles par les navigateurs en l'état). */
export const CONVERTIBLE_IMAGE_EXTENSIONS = ['heic', 'heif']

/**
 * Vidéos. La liste va volontairement au-delà de ce que lit un `<video>` (mp4/webm/ogv, et mov selon
 * le navigateur) : refuser un `.mkv` ou un `.3gp` fait perdre la donnée, alors que l'accepter la
 * conserve — l'affichage se dégrade proprement en lien de téléchargement côté client.
 */
export const VIDEO_EXTENSIONS = [
    'mp4', 'm4v', 'webm', 'ogv', 'mov', 'qt',
    'mkv', 'avi', '3gp', '3g2', 'mts', 'm2ts', 'wmv', 'flv', 'mpeg', 'mpg', 'hevc',
]

/** Documents (certificats d'analyse). */
export const DOC_EXTENSIONS = ['pdf']

/** Extensions lisibles nativement par un `<video>` — sert au client à savoir quand se rabattre sur
 *  un lien de téléchargement plutôt que d'afficher un lecteur qui restera noir. */
export const NATIVELY_PLAYABLE_VIDEO_EXTENSIONS = ['mp4', 'm4v', 'webm', 'ogv', 'mov']

const FAMILY_BY_KIND = {
    images: { extensions: IMAGE_EXTENSIONS, mimePrefix: 'image/' },
    videos: { extensions: VIDEO_EXTENSIONS, mimePrefix: 'video/' },
    docs: { extensions: DOC_EXTENSIONS, mimePrefix: 'application/pdf' },
}

/** Extension en minuscules, sans le point. `''` si le nom n'en porte pas. */
export function extensionOf(filename) {
    return path.extname(String(filename || '')).toLowerCase().replace(/^\./, '')
}

export function isConvertibleImage(filename) {
    return CONVERTIBLE_IMAGE_EXTENSIONS.includes(extensionOf(filename))
}

export function isVideoExtension(filename) {
    return VIDEO_EXTENSIONS.includes(extensionOf(filename))
}

function humanList(kinds) {
    const morceaux = []
    if (kinds.includes('images')) morceaux.push('photo (jpg, png, gif, webp, avif, heic)')
    if (kinds.includes('videos')) morceaux.push('vidéo (mp4, mov, webm, mkv, avi, 3gp…)')
    if (kinds.includes('docs')) morceaux.push('PDF')
    return morceaux.join(', ')
}

/**
 * Un fichier est-il acceptable pour les familles demandées ?
 * @returns {{ok: boolean, reason?: string}}
 */
export function inspectFile(file, kinds) {
    const ext = extensionOf(file?.originalname)
    if (!ext) {
        return { ok: false, reason: 'Fichier sans extension — impossible d\'en déterminer le format' }
    }

    const famille = kinds.find((kind) => FAMILY_BY_KIND[kind]?.extensions.includes(ext))
    if (!famille) {
        return { ok: false, reason: `Format .${ext} non pris en charge — formats acceptés : ${humanList(kinds)}` }
    }

    // Contrôle MIME tolérant : on ne refuse que s'il désigne CLAIREMENT une autre famille.
    const mime = String(file?.mimetype || '').toLowerCase()
    if (!GENERIC_MIMES.has(mime)) {
        const prefixeAttendu = FAMILY_BY_KIND[famille].mimePrefix
        const coherent = mime.startsWith(prefixeAttendu)
            // `.heic` est fréquemment annoncé `image/heif` et inversement ; `.qt` arrive en
            // `video/quicktime`. Le préfixe de famille couvre déjà ces cas, mais pas les types
            // hérités hors famille que certains systèmes posent encore sur des vidéos.
            || (famille === 'videos' && (mime === 'application/mp4' || mime === 'application/x-matroska'))
        if (!coherent) {
            return { ok: false, reason: `Le type annoncé (${mime}) ne correspond pas à un fichier .${ext}` }
        }
    }

    return { ok: true }
}

/**
 * Construit un `fileFilter` multer.
 *
 * @param {string[]} kinds - familles autorisées parmi 'images' | 'videos' | 'docs'
 * @param {object} [options]
 * @param {boolean} [options.skipRejected=false] - si vrai, un fichier refusé est IGNORÉ (le reste de
 *   la requête aboutit) et consigné dans `req.rejectedFiles`, au lieu de faire échouer tout l'envoi.
 *   Indispensable sur les routes de review, où les fichiers accompagnent l'enregistrement complet
 *   d'une fiche : y refuser la requête entière pour une seule photo au mauvais format fait perdre
 *   la saisie, pas seulement la photo.
 */
export function buildFileFilter(kinds, { skipRejected = false } = {}) {
    return (req, file, cb) => {
        const verdict = inspectFile(file, kinds)
        if (verdict.ok) return cb(null, true)

        if (skipRejected) {
            if (!Array.isArray(req.rejectedFiles)) req.rejectedFiles = []
            req.rejectedFiles.push({ filename: file.originalname, reason: verdict.reason })
            return cb(null, false)
        }
        return cb(new Error(verdict.reason))
    }
}

export default buildFileFilter
