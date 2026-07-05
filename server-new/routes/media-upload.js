/**
 * Upload générique de médias (photo/vidéo) pour illustrer une étape — cellule de pipeline,
 * nœud ou liaison d'un canvas (Chaîne de production / PhenoHunt). Volontairement séparé des
 * routes d'upload de review (flower/hash-reviews.js, limites 10-20 Mo, jpeg/png/gif/webp/pdf
 * uniquement) : ici jusqu'à 200 Mo, photo ET vidéo.
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

const ALLOWED_EXT = /\.(jpe?g|png|gif|webp|mp4|webm|mov|m4v)$/i
const ALLOWED_MIME = /^(image\/(jpeg|png|gif|webp)|video\/(mp4|webm|quicktime|x-m4v))$/i

function fileFilter(req, file, cb) {
    if (ALLOWED_EXT.test(file.originalname) && ALLOWED_MIME.test(file.mimetype)) {
        return cb(null, true)
    }
    cb(new Error('Seuls les fichiers photo (jpg/png/gif/webp) et vidéo (mp4/webm/mov) sont autorisés'))
}

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 Mo
    fileFilter
})

function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'Fichier trop volumineux (200 Mo maximum)' })
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
}, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier reçu' })
    }
    const isVideo = req.file.mimetype.startsWith('video/')
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
