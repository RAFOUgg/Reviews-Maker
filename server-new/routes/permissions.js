import express from 'express'
import { ACCOUNT_TYPES } from '../services/account.js'
import { canAccessFeature, canAccessSection } from '../middleware/permissions.js'

const router = express.Router()

// Return account types configuration used by the frontend
router.get('/account-types', (req, res) => {
  // Mirror DEFAULT_ACCOUNT_TYPES used in the frontend
  const accountTypes = {
    consumer: {
      label: 'Amateur',
      sections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing'],
      exportFormats: ['png', 'jpg', 'pdf'],
      templates: ['compact', 'detailed', 'complete']
    },
    influencer: {
      label: 'Influenceur',
      sections: ['info', 'visual', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing'],
      exportFormats: ['png', 'jpg', 'pdf', 'svg'],
      templates: ['compact', 'detailed', 'complete', 'influencer']
    },
    producer: {
      label: 'Producteur',
      sections: ['info', 'visual', 'genetic', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing', 'pipeline_culture'],
      exportFormats: ['png', 'jpg', 'pdf', 'svg', 'csv', 'json', 'html'],
      templates: ['compact', 'detailed', 'complete', 'influencer', 'custom']
    }
  }

  res.json(accountTypes)
})

// Feature check - optional auth. If no auth, accepts query param accountType
router.get('/feature/:feature', (req, res) => {
  const feature = req.params.feature
  let accountType = req.query.accountType

  // If user is authenticated, the frontend may include cookies; middleware would attach req.user.
  // Here, we prioritize req.user if present.
  if (req.user && req.user.accountType) {
    accountType = req.user.accountType
  }

  // Fallback to consumer
  if (!accountType) accountType = 'consumer'

  // Build a fake user object compatible with canAccessFeature (it expects a user with roles JSON)
  const fakeUser = { roles: JSON.stringify({ roles: [accountType] }) }

  try {
    const check = canAccessFeature(fakeUser, feature)
    res.json({ allowed: !!check.allowed, reason: check.reason || null, upgradeRequired: check.upgradeRequired || null })
  } catch (err) {
    res.status(500).json({ error: 'internal_error', message: err.message })
  }
})

export default router
