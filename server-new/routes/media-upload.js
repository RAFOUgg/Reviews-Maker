/**
 * Upload générique de médias (photo/vidéo) pour illustrer une étape — cellule de pipeline,
 * nœud ou liaison d'un canvas (Chaîne de production / PhenoHunt). Volontairement séparé des routes
 * d'upload de review : celles-ci reçoivent des fichiers EN MÊME TEMPS que l'enregistrement d'une
 * fiche entière (un refus ne doit donc pas faire échouer la sauvegarde), alors qu'ici l'envoi est
 * l'action elle-même — un refus doit se voir immédiatement. Formats et limite (200 Mo) sont, eux,
 * communs à toutes les routes : `utils/uploadFormats.js`.
 *
 * Fichiers stockés dans db/pipeline_media/ (pas db/review_images/, pour ne jamais mélanger avec
 * les sauvegardes/exports d'images de review) et servis statiquement sous /media (cf. server.js).
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { requireAuth } from '../middleware/auth.js'
import { buildFileFilter, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, isVideoExtension } from '../utils/uploadFormats.js'
import { finalizeUploads } from '../middleware/uploads.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mediaDir = path.resolve(__dirname, '../../db/pipeline_media')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir(mediaDir, { recursive: true }, (err) => cb(err, mediaDir))
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        cb(null, `media-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
    }
})

// Formats et limite : `utils/uploadFormats.js`, source unique partagée avec les 4 routes de review.
// La liste vivait ici en dur et refusait notamment les photos iPhone (.heic) et les vidéos
// .mkv/.avi/.3gp quelle que soit leur taille (cf. l'en-tête de ce module partagé).
const upload = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_BYTES },
    // Envoi d'UN fichier à la fois, déclenché par l'utilisateur : ici un refus doit se voir
    // immédiatement (400), pas être avalé silencieusement — contrairement aux routes de review où
    // les fichiers accompagnent l'enregistrement d'une fiche entière.
    fileFilter: buildFileFilter(['images', 'videos']),
})

function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: `Fichier trop volumineux (${MAX_UPLOAD_LABEL} maximum)` })
        }
        return res.status(400).json({ error: err.message })
    }
    if (err) {
        return res.status(400).json({ error: err.message || 'Fichier invalide' })
    }
    next()
}

const router = express.Router()

router.post('/', requireAuth, (req, res, next) => {
    upload.single('file')(req, res, (err) => handleUploadError(err, req, res, next))
}, finalizeUploads, (req, res) => {
    if (!req.file) {
        // Seul cas restant après `finalizeUploads` : une photo HEIC illisible, dont il porte le
        // motif exact — le renvoyer plutôt qu'un « aucun fichier reçu » trompeur.
        const refus = req.rejectedFiles?.[0]
        return res.status(400).json({ error: refus?.reason || 'Aucun fichier reçu' })
    }
    // `isVideoExtension` plutôt que le type MIME annoncé : c'est l'extension qui fait autorité
    // partout ailleurs (cf. `uploadFormats.js`), et un `.mkv` arrive régulièrement en
    // `application/octet-stream` — il aurait alors été enregistré comme une PHOTO, donc rendu dans
    // une balise `<img>` qui ne peut rien en faire.
    const isVideo = isVideoExtension(req.file.filename)
    res.status(201).json({
        url: `/media/${req.file.filename}`,
        filename: req.file.filename,
        type: isVideo ? 'video' : 'photo',
        mimetype: req.file.mimetype,
        size: req.file.size
    })
})

// Nom de fichier strictement celui généré ci-dessus — empêche toute tentative de path traversal
// (../../etc) via ce paramètre.
const SAFE_FILENAME = /^media-\d+-\d+\.\w+$/

router.delete('/:filename', requireAuth, async (req, res) => {
    if (!SAFE_FILENAME.test(req.params.filename)) {
        return res.status(400).json({ error: 'Nom de fichier invalide' })
    }
    try {
        await fs.promises.unlink(path.join(mediaDir, req.params.filename))
    } catch {
        // Fichier déjà absent — pas bloquant, l'attache côté client est retirée dans tous les cas.
    }
    res.json({ success: true })
})

export default router
