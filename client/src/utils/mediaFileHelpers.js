/**
 * SOURCE UNIQUE côté client de « ce fichier est-il une vidéo, et un navigateur sait-il la lire ».
 *
 * `server-new/utils/uploadFormats.js` fait autorité sur ce qui est ACCEPTÉ à l'envoi. Le client et
 * le serveur sont deux paquets npm distincts (aucun import de `client/` vers `server-new/`, vérifié
 * le 2026-08-16) : la liste est donc recopiée ici, et `tools/export-audit/video-gallery-check.mjs`
 * compare les deux fichiers pour que la copie ne puisse pas diverger en silence.
 *
 * Elle vivait jusqu'ici en TROIS copies côté client, dont deux fausses — mesuré le 2026-08-16 :
 *   • ce fichier    : `mp4|webm|mov|ogg|m4v`  → `ogg` n'est pas un format vidéo accepté par le
 *                     serveur (c'est `ogv`), et `mkv`/`avi`/`3gp`/`wmv`… manquaient ;
 *   • `reviewFilesAggregator.js` : `mp4|webm|mov|avi|m4v` → `mkv`/`ogv`/`3gp`… manquaient ;
 *   • `MediaFrame.jsx` : la seule complète.
 * Conséquence concrète : une vidéo `.mkv` ou `.3gp`, PARFAITEMENT acceptée à l'envoi, était classée
 * « photo » par les deux copies fausses, donc rendue dans une balise `<img>` — vignette cassée dans
 * les formulaires, dans le wizard et dans la couverture de galerie. Les deux copies importent
 * désormais d'ici.
 */

/** Miroir de `VIDEO_EXTENSIONS` (server-new/utils/uploadFormats.js). */
export const VIDEO_EXTENSIONS = [
    'mp4', 'm4v', 'webm', 'ogv', 'mov', 'qt',
    'mkv', 'avi', '3gp', '3g2', 'mts', 'm2ts', 'wmv', 'flv', 'mpeg', 'mpg', 'hevc',
]

/**
 * Miroir de `NATIVELY_PLAYABLE_VIDEO_EXTENSIONS`. Les autres extensions sont acceptées à l'envoi
 * — refuser un fichier fait perdre la donnée — mais aucun navigateur ne les décode : leur donner
 * un `<video>` afficherait un cadre noir sans explication, d'où le repli en lien de téléchargement.
 */
export const NATIVELY_PLAYABLE_VIDEO_EXTENSIONS = ['mp4', 'm4v', 'webm', 'ogv', 'mov']

/** Extension en minuscules, sans le point, insensible à une chaîne de requête ou à un fragment. */
export function extensionOf(url) {
    return String(url || '')
        .split(/[?#]/)[0]
        .split('.')
        .pop()
        .toLowerCase()
}

/** L'URL désigne-t-elle une vidéo, quelle qu'elle soit ? */
export function isVideoUrl(url) {
    return VIDEO_EXTENSIONS.includes(extensionOf(url))
}

/** L'URL désigne-t-elle une vidéo qu'une balise `<video>` sait réellement décoder ? */
export function isPlayableVideo(url) {
    return NATIVELY_PLAYABLE_VIDEO_EXTENSIONS.includes(extensionOf(url))
}

/**
 * Détermine si une entrée média est une vidéo. Accepte les trois formes qui circulent dans l'app :
 * une simple URL, un upload encore en mémoire (`{ type:'video'|'photo', preview }`, cf.
 * `usePhotoUpload.js`) ou une entrée rechargée depuis la base (`{ url }`, sans champ `type` —
 * on retombe alors sur l'extension).
 */
export function isVideoMedia(item) {
    if (!item) return false
    if (typeof item === 'string') return isVideoUrl(item)
    if (item.type === 'video') return true
    if (item.type === 'photo') return false
    return isVideoUrl(item.url || item.preview || '')
}
