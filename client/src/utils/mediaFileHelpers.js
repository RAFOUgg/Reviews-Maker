/**
 * Détermine si une entrée photo/média (upload en cours ou déjà enregistrée) est une vidéo.
 * Les nouveaux uploads portent `type: 'video'|'photo'` (cf. usePhotoUpload.js).
 * Les entrées existantes rechargées depuis la base n'ont pas ce champ (photos historiques,
 * uniquement des images) — on retombe sur l'extension de l'URL pour les vidéos ajoutées depuis.
 */
export function isVideoMedia(item) {
    if (!item) return false
    if (item.type === 'video') return true
    if (item.type === 'photo') return false
    return /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(item.url || item.preview || '')
}
