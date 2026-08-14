/**
 * Traitement commun de TOUT envoi de fichier, à monter juste après multer.
 *
 * Point de montage unique pour deux choses qui doivent toujours aller ensemble :
 *  1. la conversion HEIC/HEIF → JPEG (`utils/heicToJpeg.js`) ;
 *  2. la remontée à l'appelant des fichiers ÉCARTÉS.
 *
 * Le point 2 est la contrepartie indispensable de `skipRejected` (cf. `utils/uploadFormats.js`) :
 * ignorer un fichier au mauvais format plutôt que de faire échouer tout l'enregistrement évite de
 * perdre la saisie, mais sans ce retour l'utilisateur croirait sa photo enregistrée alors qu'elle
 * a été écartée — on remplacerait une erreur visible par une disparition silencieuse, ce qui est
 * pire. La réponse porte donc `rejectedFiles: [{ filename, reason }]` à côté de son contenu normal.
 */

import { convertHeicUploads } from '../utils/heicToJpeg.js'

/**
 * Ajoute `rejectedFiles` à toute réponse JSON de succès de la requête courante.
 *
 * `res.json` est enveloppé plutôt que chaque handler modifié : les dix points de réponse concernés
 * (POST et PUT des cinq routes qui acceptent des fichiers) construisent des charges utiles très
 * différentes, et les toucher un par un garantissait d'en oublier au prochain ajout de route.
 */
function attachRejectedFiles(req, res, next) {
    const json = res.json.bind(res)
    res.json = (body) => {
        const refuses = req.rejectedFiles
        if (Array.isArray(refuses) && refuses.length > 0 && body && typeof body === 'object' && !Array.isArray(body)) {
            return json({ ...body, rejectedFiles: refuses })
        }
        return json(body)
    }
    next()
}

/** Middleware unique à monter après `upload.single/array/fields(...)`. */
export function finalizeUploads(req, res, next) {
    attachRejectedFiles(req, res, () => convertHeicUploads(req, res, next))
}

export default finalizeUploads
