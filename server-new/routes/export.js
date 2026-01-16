/**
 * Export Routes with Permission Enforcement
 * SPRINT 1: Feature export format access control
 * 
 * Routes:
 * - POST /api/export/preview - Generate preview (all users)
 * - POST /api/export/png - PNG export
 * - POST /api/export/jpg - JPEG export
 * - POST /api/export/pdf - PDF export
 * - POST /api/export/csv - CSV export (Producer only)
 * - POST /api/export/json - JSON export (Producer only)
 * - POST /api/export/svg - SVG export
 * - POST /api/export/html - HTML export (Producer only)
 * - GET /api/export/templates - Available templates for user
 * - POST /api/export/batch - Batch export multiple reviews
 */

import express from 'express'
import { asyncHandler, Errors } from '../utils/errorHandler.js'
import { prisma } from '../server.js'
import { requireAuth } from '../middleware/auth.js'
import {
    requireActiveSubscription,
    ACCOUNT_TYPES
} from '../middleware/permissions.js'

const router = express.Router()

/**
 * POST /api/export/preview
 * Generate export preview (no actual file)
 * Available to all authenticated users
 */
router.post('/preview',
    requireAuth,
    asyncHandler(async (req, res) => {
        const { reviewId, templateName, format } = req.body

        // Validate request
        if (!reviewId || !templateName || !format) {
            throw Errors.VALIDATION_ERROR(['reviewId', 'templateName', 'format are required'])
        }

        // Get review
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { flowerData: true, author: true }
        })

        if (!review) {
            throw Errors.REVIEW_NOT_FOUND()
        }

        // Can only preview own reviews or public reviews
        if (review.authorId !== req.user.id && !review.isPublic) {
            throw Errors.FORBIDDEN('Cannot preview private review of another user')
        }

        // Return preview data
        res.json({
            success: true,
            preview: {
                template: templateName,
                format,
                dimensions: getDimensionsForFormat(format),
                elementCount: estimateElements(templateName),
                estimatedFileSize: estimateFileSize(format, templateName),
                warning: review.isPublic ? null : 'This review is private'
            }
        })
    })
)

/**
 * POST /api/export/:format
 * Generic export endpoint with permission check
 */
router.post('/:format',
    requireAuth,
    // TODO: Add format validation middleware
    requireActiveSubscription, // Producer/Influencer must have active subscription
    asyncHandler(async (req, res) => {
        const { format } = req.params
        const { reviewId, templateName = 'detailed', customization = {} } = req.body

        // Validate format
        const allowedFormats = ['png', 'jpg', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html']
        if (!allowedFormats.includes(format.toLowerCase())) {
            throw Errors.INVALID_FIELD('format', `Unsupported format: ${format}`)
        }

        // Validate review access
        if (!reviewId) {
            throw Errors.VALIDATION_ERROR(['reviewId is required'])
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { flowerData: true, author: true }
        })

        if (!review) {
            throw Errors.REVIEW_NOT_FOUND()
        }

        // Permission check: can only export own reviews or public reviews
        if (review.authorId !== req.user.id && !review.isPublic) {
            throw Errors.FORBIDDEN('Cannot export private review of another user')
        }

        // Log export for analytics
        await logExport(req.user.id, reviewId, format)

        // Generate export (placeholder - actual implementation in export service)
        const exportData = await generateExport(review, format, templateName, customization)

        res.json({
            success: true,
            format,
            template: templateName,
            fileUrl: exportData.url,
            fileSize: exportData.size,
            generatedAt: new Date().toISOString(),
            expiresIn: '24 hours'
        })
    })
)

/**
 * GET /api/export/templates
 * Get available export templates for user's account type
 */
router.get('/templates',
    requireAuth,
    asyncHandler(async (req, res) => {
        const accountType = req.user.accountType || 'consumer'
        const templates = getAvailableTemplates(accountType)

        res.json({
            success: true,
            accountType,
            templates,
            totalAvailable: templates.length,
            upgradeOptions: accountType === 'consumer' ? {
                influencer: 'Add SVG export + advanced customization',
                producer: 'Unlock all templates + all formats'
            } : null
        })
    })
)

/**
 * GET /api/export/formats
 * Get available export formats for user's account type
 */
router.get('/formats',
    requireAuth,
    asyncHandler(async (req, res) => {
        const accountType = req.user.accountType || 'consumer'
        const accountInfo = ACCOUNT_TYPES[accountType] || ACCOUNT_TYPES.consumer
        const formats = accountInfo.features.exportFormats || ['png', 'jpg', 'pdf']

        res.json({
            success: true,
            accountType,
            availableFormats: formats,
            totalAvailable: formats.length,
            quality: accountInfo.features.exportQuality || 'medium',
            restrictions: getFormatRestrictions(accountType)
        })
    })
)

/**
 * POST /api/export/batch
 * Batch export multiple reviews (Producer only)
 */
router.post('/batch',
    requireAuth,
    // TODO: Add batch export permission check
    asyncHandler(async (req, res) => {
        const { reviewIds, format, templateName } = req.body

        if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
            throw Errors.VALIDATION_ERROR(['reviewIds must be non-empty array'])
        }

        if (reviewIds.length > 10) {
            throw Errors.VALIDATION_ERROR(['Maximum 10 reviews per batch'])
        }

        // Check access to all reviews
        const reviews = await prisma.review.findMany({
            where: {
                id: { in: reviewIds }
            }
        })

        for (const review of reviews) {
            if (review.authorId !== req.user.id) {
                throw Errors.FORBIDDEN('Can only batch export own reviews')
            }
        }

        // Generate batch export
        const batchUrl = await generateBatchExport(reviewIds, format, templateName)

        res.json({
            success: true,
            format,
            count: reviews.length,
            fileUrl: batchUrl,
            expiresIn: '24 hours'
        })
    })
)

// ============ HELPER FUNCTIONS ============

/**
 * Get export dimensions for format
 */
function getDimensionsForFormat(format) {
    const dimensions = {
        png: { width: 1080, height: 1080, ratio: '1:1' },
        jpg: { width: 1080, height: 1080, ratio: '1:1' },
        pdf: { width: 210, height: 297, ratio: 'A4' },
        svg: { width: 1080, height: 1080, ratio: 'scalable' },
        csv: { columns: 20, rows: 'unlimited' },
        json: { structure: 'hierarchical' },
        html: { width: 1080, height: 'dynamic' }
    }
    return dimensions[format] || {}
}

/**
 * Estimate element count for template
 */
function estimateElements(templateName) {
    const counts = {
        compact: 8,
        detailed: 15,
        complete: 25,
        custom: 20
    }
    return counts[templateName] || 15
}

/**
 * Estimate file size
 */
function estimateFileSize(format, template) {
    const baseSize = {
        png: 500, // KB
        jpg: 300,
        pdf: 400,
        svg: 100,
        csv: 50,
        json: 100,
        html: 150
    }

    const multiplier = template === 'complete' ? 2 : template === 'detailed' ? 1.5 : 1

    return `${Math.round((baseSize[format] || 100) * multiplier)}KB`
}

/**
 * Get available templates for account type
 */
function getAvailableTemplates(accountType) {
    const templates = {
        consumer: [
            { name: 'compact', label: 'Compact', pages: 1 },
            { name: 'detailed', label: 'Detailed', pages: 2 },
            { name: 'complete', label: 'Complete', pages: 3 }
        ],
        influencer: [
            { name: 'compact', label: 'Compact', pages: 1 },
            { name: 'detailed', label: 'Detailed', pages: 2 },
            { name: 'complete', label: 'Complete', pages: 3 },
            { name: 'influencer', label: 'Influencer Mode', pages: 1 }
        ],
        producer: [
            { name: 'compact', label: 'Compact', pages: 1 },
            { name: 'detailed', label: 'Detailed', pages: 2 },
            { name: 'complete', label: 'Complete', pages: 3 },
            { name: 'influencer', label: 'Influencer Mode', pages: 1 },
            { name: 'custom', label: 'Custom', pages: 'unlimited' }
        ]
    }

    return templates[accountType] || templates.consumer
}

/**
 * Get format restrictions for account type
 */
function getFormatRestrictions(accountType) {
    const restrictions = {
        consumer: {
            maxFileSize: '10MB',
            maxDPI: 72,
            watermarkRequired: false
        },
        influencer: {
            maxFileSize: '50MB',
            maxDPI: 300,
            watermarkRequired: false
        },
        producer: {
            maxFileSize: 'unlimited',
            maxDPI: 300,
            watermarkRequired: false
        }
    }

    return restrictions[accountType] || restrictions.consumer
}

/**
 * Log export for analytics
 */
async function logExport(userId, reviewId, format) {
    try {
        await prisma.exportLog.create({
            data: {
                userId,
                reviewId,
                format,
                timestamp: new Date()
            }
        })
    } catch (e) {
        console.error('Failed to log export:', e)
        // Don't fail the export if logging fails
    }
}

/**
 * Generate export (placeholder)
 * In real implementation, calls export service
 */
async function generateExport(review, format, templateName, customization) {
    // TODO: Implement actual export generation
    // For now, return mock data
    return {
        url: `/exports/${review.id}-${format}-${Date.now()}`,
        size: '250KB'
    }
}

/**
 * Generate batch export (placeholder)
 */
async function generateBatchExport(reviewIds, format, templateName) {
    // TODO: Implement batch export
    return `/exports/batch-${Date.now()}`
}

export default router
