import express from 'express'
import { EXPORT_FORMATS, EXPORT_DPI, EXPORT_LIMITS, canAccessSection, ACCOUNT_TYPES } from '../middleware/permissions.js'

const router = express.Router()

// GET /api/permissions/account-types
router.get('/account-types', (req, res) => {
  // Build a simple description object for each account type consistent with frontend expectations
  const types = {
    consumer: {
      label: 'Amateur',
      sections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing'],
      exportFormats: EXPORT_FORMATS[ACCOUNT_TYPES.CONSUMER] || ['png','jpeg','pdf'],
      templates: ['compact','detailed','complete']
    },
    influencer: {
      label: 'Influenceur',
      sections: ['info', 'visual', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing'],
      exportFormats: EXPORT_FORMATS[ACCOUNT_TYPES.INFLUENCER] || ['png','jpeg','pdf','svg'],
      templates: ['compact','detailed','complete','influencer']
    },
    producer: {
      label: 'Producteur',
      sections: ['info', 'visual', 'genetic', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing', 'pipeline_culture'],
      exportFormats: EXPORT_FORMATS[ACCOUNT_TYPES.PRODUCER] || ['png','jpeg','pdf','svg','csv','json','html'],
      templates: ['compact','detailed','complete','influencer','custom']
    }
  }

  res.json({ types })
})

// GET /api/permissions/feature/:feature
router.get('/feature/:feature', (req, res) => {
  const { feature } = req.params

  // If feature is a section name, return whether each account type can access it
  const sectionChecks = ['genetic','pipeline_culture','pipeline_extraction','pipeline_curing','phenohunt','branding']
  if (sectionChecks.includes(feature)){
    const allowed = {}
    Object.values(ACCOUNT_TYPES).forEach(t => {
      allowed[t] = canAccessSection(t, feature)
    })

    return res.json({ feature, allowed })
  }

  // For export formats
  if (feature.startsWith('export_')){
    const fmt = feature.replace('export_','')
    const allowed = {}
    Object.values(ACCOUNT_TYPES).forEach(t => {
      allowed[t] = (EXPORT_FORMATS[t] || []).includes(fmt)
    })
    return res.json({ feature, allowed })
  }

  // Unknown feature
  return res.status(404).json({ error: 'unknown_feature' })
})

export default router
