/**
 * Conversion automatique HEIC/HEIF → JPEG à la réception.
 *
 * Le HEIC est le format PAR DÉFAUT des photos iPhone, et AUCUN navigateur ne sait l'afficher dans
 * une balise `<img>`. L'accepter sans le convertir reviendrait à remplacer un refus visible (400) par
 * une image cassée silencieuse — exactement le genre de « donnée qui n'existe qu'à moitié » que ce
 * projet corrige ailleurs. La conversion a donc lieu ICI, une seule fois, juste après multer : tout
 * ce qui vit en aval (base, rendu, exports) ne voit jamais que du JPEG.
 *
 * `heic-convert` est du JavaScript pur (libheif en WebAssembly) : pas de binaire natif à compiler,
 * donc un comportement identique en dev Windows et sur le VPS Ubuntu, et aucune étape de build
 * supplémentaire au déploiement. Mesuré sur une photo réelle de 2,9 Mo (3992×2992) : ~1,8 s pour un
 * JPEG valide de 3,3 Mo.
 */

import fs from 'fs'
import path from 'path'
import convert from 'heic-convert'
import { isConvertibleImage } from './uploadFormats.js'

/** Qualité JPEG. 0.85 : au-delà le fichier grossit sans gain visible sur une photo d'appareil. */
const JPEG_QUALITY = 0.85

/**
 * Convertit un fichier déjà écrit sur disque par multer, EN PLACE.
 *
 * L'objet `file` est muté (filename/path/mimetype/size/originalname) pour que la suite de la route —
 * qui lit `file.filename` pour construire l'URL stockée en base — n'ait rien à savoir de tout ceci.
 *
 * @returns {Promise<boolean>} vrai si une conversion a réellement eu lieu
 */
export async function convertHeicFile(file) {
    if (!file || !file.path || !isConvertibleImage(file.originalname)) return false

    const source = file.path
    const cible = source.replace(/\.[^.]+$/, '') + '.jpg'

    const jpeg = await convert({
        buffer: await fs.promises.readFile(source),
        format: 'JPEG',
        quality: JPEG_QUALITY,
    })
    await fs.promises.writeFile(cible, jpeg)
    // L'original n'a plus d'usage : le garder doublerait l'espace disque pour un fichier que rien
    // ne sait lire. Un échec de suppression ne doit pas faire échouer l'envoi, qui a réussi.
    await fs.promises.unlink(source).catch(() => { })

    file.path = cible
    file.filename = path.basename(cible)
    file.originalname = file.originalname.replace(/\.[^.]+$/, '') + '.jpg'
    file.mimetype = 'image/jpeg'
    file.size = jpeg.length
    return true
}

/** Tous les fichiers d'une requête multer, quelle que soit sa forme (`single`/`array`/`fields`). */
function collectFiles(req) {
    if (req.file) return [req.file]
    if (Array.isArray(req.files)) return req.files
    if (req.files && typeof req.files === 'object') return Object.values(req.files).flat()
    return []
}

/**
 * Middleware Express à placer JUSTE APRÈS multer sur toute route qui accepte des photos.
 *
 * Une conversion qui échoue (fichier tronqué, HEIC exotique) ne fait pas échouer la requête : le
 * fichier est retiré de la liste et consigné dans `req.rejectedFiles`, au même titre qu'un format
 * refusé — perdre une photo est préférable à perdre la saisie complète d'une review.
 */
export function convertHeicUploads(req, res, next) {
    const fichiers = collectFiles(req).filter((f) => f && isConvertibleImage(f.originalname))
    if (fichiers.length === 0) return next()

    Promise.allSettled(fichiers.map((f) => convertHeicFile(f)))
        .then((resultats) => {
            resultats.forEach((r, i) => {
                if (r.status === 'fulfilled') return
                const rate = fichiers[i]
                console.error('Conversion HEIC échouée pour', rate.originalname, r.reason)
                if (!Array.isArray(req.rejectedFiles)) req.rejectedFiles = []
                req.rejectedFiles.push({
                    filename: rate.originalname,
                    reason: 'Photo HEIC illisible — conversion impossible',
                })
                dropFile(req, rate)
            })
            next()
        })
        .catch(next)
}

/** Retire un fichier de `req.file`/`req.files` quelle que soit la forme utilisée par la route. */
function dropFile(req, file) {
    if (req.file === file) req.file = undefined
    if (Array.isArray(req.files)) {
        req.files = req.files.filter((f) => f !== file)
    } else if (req.files && typeof req.files === 'object') {
        Object.keys(req.files).forEach((champ) => {
            req.files[champ] = req.files[champ].filter((f) => f !== file)
        })
    }
    fs.promises.unlink(file.path).catch(() => { })
}

export default convertHeicUploads
