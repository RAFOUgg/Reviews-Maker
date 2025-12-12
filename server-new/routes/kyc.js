/**
 * Routes eKYC - Upload et vérification de documents d'identité
 * Réservé aux comptes Producer et Influencer
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { authenticateUser } from '../middleware/auth.js'
import { prisma } from '../server.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration stockage uploads
const uploadDir = join(__dirname, '../../db/kyc_documents')

// Créer le répertoire si inexistant
await fs.mkdir(uploadDir, { recursive: true })

// Configuration Multer
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const userId = req.userId
        const userDir = join(uploadDir, userId.toString())

        try {
            await fs.mkdir(userDir, { recursive: true })
            cb(null, userDir)
        } catch (err) {
            cb(err)
        }
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now()
        const ext = path.extname(file.originalname)
        const name = path.basename(file.originalname, ext)
        const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_')
        cb(null, `${sanitized}_${timestamp}${ext}`)
    }
})

// Filtres de fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb(new Error('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, PDF'))
    }
}

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter
})

/**
 * POST /api/kyc/upload
 * Upload un document d'identité (Producer ou Influencer uniquement)
 */
router.post('/upload', authenticateUser, upload.single('document'), async (req, res) => {
    try {
        const userId = req.userId
        const { documentType } = req.body // 'id_card', 'passport', 'driving_license', 'business_license'

        if (!req.file) {
            return res.status(400).json({
                error: 'no_file',
                message: 'Aucun fichier fourni'
            })
        }

        // Vérifier le type de compte
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                accountType: true,
                kycStatus: true,
                kycDocuments: true
            }
        })

        if (!user) {
            // Supprimer le fichier uploadé
            await fs.unlink(req.file.path)
            return res.status(404).json({
                error: 'user_not_found',
                message: 'Utilisateur non trouvé'
            })
        }

        // Restreindre aux Producer et Influencer
        if (user.accountType !== 'producer' && user.accountType !== 'influencer') {
            await fs.unlink(req.file.path)
            return res.status(403).json({
                error: 'forbidden',
                message: 'eKYC réservé aux comptes Producteur et Influenceur'
            })
        }

        // Enregistrer les infos du document dans la DB
        const existingDocs = user.kycDocuments ? JSON.parse(user.kycDocuments) : []

        const newDoc = {
            id: Date.now().toString(),
            type: documentType || 'unknown',
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            uploadedAt: new Date().toISOString(),
            status: 'pending' // pending | approved | rejected
        }

        existingDocs.push(newDoc)

        await prisma.user.update({
            where: { id: userId },
            data: {
                kycDocuments: JSON.stringify(existingDocs),
                kycStatus: 'pending' // pending | verified | rejected
            }
        })

        res.json({
            success: true,
            document: {
                id: newDoc.id,
                type: newDoc.type,
                filename: newDoc.filename,
                originalName: newDoc.originalName,
                size: newDoc.size,
                uploadedAt: newDoc.uploadedAt,
                status: newDoc.status
            }
        })

    } catch (error) {
        console.error('❌ Erreur upload KYC:', error)

        // Nettoyer le fichier en cas d'erreur
        if (req.file) {
            try {
                await fs.unlink(req.file.path)
            } catch (unlinkErr) {
                console.error('Erreur suppression fichier:', unlinkErr)
            }
        }

        res.status(500).json({
            error: 'upload_failed',
            message: 'Erreur lors de l\'upload du document'
        })
    }
})

/**
 * GET /api/kyc/documents
 * Récupérer la liste des documents uploadés
 */
router.get('/documents', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                kycDocuments: true,
                kycStatus: true,
                accountType: true
            }
        })

        if (!user) {
            return res.status(404).json({
                error: 'user_not_found',
                message: 'Utilisateur non trouvé'
            })
        }

        if (user.accountType !== 'producer' && user.accountType !== 'influencer') {
            return res.status(403).json({
                error: 'forbidden',
                message: 'eKYC réservé aux comptes Producteur et Influenceur'
            })
        }

        const documents = user.kycDocuments ? JSON.parse(user.kycDocuments) : []

        res.json({
            status: user.kycStatus || 'none',
            documents: documents.map(doc => ({
                id: doc.id,
                type: doc.type,
                filename: doc.filename,
                originalName: doc.originalName,
                size: doc.size,
                uploadedAt: doc.uploadedAt,
                status: doc.status
            }))
        })

    } catch (error) {
        console.error('❌ Erreur récupération documents KYC:', error)
        res.status(500).json({
            error: 'fetch_failed',
            message: 'Erreur lors de la récupération des documents'
        })
    }
})

/**
 * DELETE /api/kyc/document/:documentId
 * Supprimer un document
 */
router.delete('/document/:documentId', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId
        const { documentId } = req.params

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                kycDocuments: true,
                accountType: true
            }
        })

        if (!user) {
            return res.status(404).json({
                error: 'user_not_found',
                message: 'Utilisateur non trouvé'
            })
        }

        if (user.accountType !== 'producer' && user.accountType !== 'influencer') {
            return res.status(403).json({
                error: 'forbidden',
                message: 'eKYC réservé aux comptes Producteur et Influenceur'
            })
        }

        const documents = user.kycDocuments ? JSON.parse(user.kycDocuments) : []
        const docIndex = documents.findIndex(d => d.id === documentId)

        if (docIndex === -1) {
            return res.status(404).json({
                error: 'document_not_found',
                message: 'Document non trouvé'
            })
        }

        const docToDelete = documents[docIndex]

        // Supprimer le fichier physique
        try {
            await fs.unlink(docToDelete.path)
        } catch (unlinkErr) {
            console.error('Erreur suppression fichier:', unlinkErr)
        }

        // Retirer de la liste
        documents.splice(docIndex, 1)

        // Mettre à jour le statut si plus de documents
        const newStatus = documents.length === 0 ? 'none' : user.kycStatus

        await prisma.user.update({
            where: { id: userId },
            data: {
                kycDocuments: JSON.stringify(documents),
                kycStatus: newStatus
            }
        })

        res.json({
            success: true,
            message: 'Document supprimé'
        })

    } catch (error) {
        console.error('❌ Erreur suppression document KYC:', error)
        res.status(500).json({
            error: 'delete_failed',
            message: 'Erreur lors de la suppression du document'
        })
    }
})

/**
 * GET /api/kyc/document/:documentId/view
 * Voir un document (retourne le fichier)
 */
router.get('/document/:documentId/view', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId
        const { documentId } = req.params

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                kycDocuments: true
            }
        })

        if (!user) {
            return res.status(404).json({
                error: 'user_not_found',
                message: 'Utilisateur non trouvé'
            })
        }

        const documents = user.kycDocuments ? JSON.parse(user.kycDocuments) : []
        const document = documents.find(d => d.id === documentId)

        if (!document) {
            return res.status(404).json({
                error: 'document_not_found',
                message: 'Document non trouvé'
            })
        }

        // Vérifier que le fichier existe
        try {
            await fs.access(document.path)
        } catch {
            return res.status(404).json({
                error: 'file_not_found',
                message: 'Fichier physique introuvable'
            })
        }

        // Servir le fichier
        res.sendFile(document.path)

    } catch (error) {
        console.error('❌ Erreur visualisation document KYC:', error)
        res.status(500).json({
            error: 'view_failed',
            message: 'Erreur lors de la visualisation du document'
        })
    }
})

export default router
