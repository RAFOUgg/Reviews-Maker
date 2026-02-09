import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getUserLimits, canAccessSection, canAccessFeature, getUserLimits as _getUserLimits } from '../middleware/permissions.js'
import { getUserAccountType } from '../services/account.js'

const router = express.Router()

// Debug endpoint: returns evaluated permissions for the authenticated user
router.get('/my-permissions', requireAuth, async (req, res) => {
    try {
        const accountType = getUserAccountType(req.user)
        const limits = getUserLimits(req.user)

        const sections = {
            genetic: canAccessSection(accountType, 'genetic'),
            pipeline_culture: canAccessSection(accountType, 'pipeline_culture'),
            pipeline_extraction: canAccessSection(accountType, 'pipeline_extraction'),
            pipeline_curing: canAccessSection(accountType, 'pipeline_curing'),
            phenohunt: canAccessSection(accountType, 'phenohunt')
        }

        const features = {
            template_custom: canAccessFeature(req.user, 'template_custom'),
            export_csv: canAccessFeature(req.user, 'export_format', { format: 'csv' }),
            genetics_canvas: canAccessFeature(req.user, 'genetics_canvas'),
            export_high_quality: canAccessFeature(req.user, 'export_high_quality')
        }

        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                roles: req.user.roles || null,
                accountType
            },
            limits,
            sections,
            features
        })
    } catch (err) {
        console.error('Debug permissions error:', err)
        res.status(500).json({ error: 'internal_error', message: err.message })
    }
})

export default router
