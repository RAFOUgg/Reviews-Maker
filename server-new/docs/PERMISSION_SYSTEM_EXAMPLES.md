/**
 * SPRINT 1 - Permission System Implementation Guide
 * 
 * Real examples of how permissions work in the app
 * Shows the permission flow from auth → middleware → handler → response
 */

/**
 * EXAMPLE 1: Creating a Flower Review
 * 
 * Consumer: ✅ Can create (basic sections only)
 * Influencer: ✅ Can create (more sections)
 * Producer: ✅ Can create (all sections)
 */

// Route Definition
export const createFlowerReviewExample = {
  route: 'POST /api/flower-reviews',
  
  middleware: [
    'requireAuth',                    // Must be logged in
    'requireSectionAccess("info")',   // Must have access to basic sections
    'requireActiveSubscription'       // If paid tier, check subscription
  ],
  
  permissionMatrix: {
    consumer: {
      allowed: true,
      reason: 'Basic sections accessible',
      accessibleSections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing'],
      blockedSections: ['genetic', 'texture', 'pipeline_culture']
    },
    influencer: {
      allowed: true,
      reason: 'Enhanced sections accessible',
      accessibleSections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing'],
      blockedSections: ['genetic', 'texture', 'pipeline_culture']
    },
    producer: {
      allowed: true,
      reason: 'All sections accessible',
      accessibleSections: ['info', 'visual', 'genetic', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing', 'pipeline_culture'],
      blockedSections: []
    }
  },

  exampleFlow: {
    step1: 'User authenticates (via OAuth or email)',
    step2: 'Frontend sends POST /api/flower-reviews with review data',
    step3: 'Server: requireAuth middleware checks req.user exists',
    step4: 'Server: requireSectionAccess("info") checks user can access',
    step5: 'Server: If consumer trying to add genetics, section check fails → 403',
    step6: 'Server: If allowed, create review in database',
    step7: 'Server: Return 200 with created review'
  },

  exampleRequest: {
    method: 'POST',
    url: '/api/flower-reviews',
    headers: {
      'Authorization': 'Bearer token-xyz',
      'Content-Type': 'application/json'
    },
    body: {
      nomCommercial: 'Biscotti OG',
      farm: 'Colorado Farms',
      varietyType: 'souche',
      breeder: 'Exotic Genetics',  // Consumer: ❌ Will be ignored/blocked
      // ... more fields
    }
  },

  exampleResponses: {
    consumer_success: {
      status: 200,
      body: {
        id: 'review-123',
        nomCommercial: 'Biscotti OG',
        farm: 'Colorado Farms',
        // Genetics fields not included
        createdAt: '2026-01-16T15:00:00Z'
      }
    },
    consumer_fails_genetics: {
      status: 403,
      body: {
        error: 'Genetics section not available for your account type. Upgrade to Producer to access.',
        accountType: 'consumer',
        requiredType: 'producer',
        upgradeUrl: '/pricing'
      }
    },
    producer_success: {
      status: 200,
      body: {
        id: 'review-123',
        nomCommercial: 'Biscotti OG',
        farm: 'Colorado Farms',
        breeder: 'Exotic Genetics',  // ✅ Producer can save this
        variety: 'OG Kush',
        indicaRatio: 70,
        // ... all fields included
        createdAt: '2026-01-16T15:00:00Z'
      }
    }
  }
}

/**
 * EXAMPLE 2: Exporting a Review
 * 
 * Consumer: PNG, JPEG, PDF (72 DPI)
 * Influencer: PNG, JPEG, PDF, SVG (300 DPI)
 * Producer: All formats (300 DPI)
 */

export const exportReviewExample = {
  route: 'POST /api/export/:format',
  
  middleware: [
    'requireAuth',
    'requireExportFormat(req.params.format)',  // Validates format against account type
    'requireActiveSubscription'                 // For influencer/producer
  ],

  supportedFormats: {
    consumer: ['png', 'jpg', 'pdf'],
    influencer: ['png', 'jpg', 'pdf', 'svg'],
    producer: ['png', 'jpg', 'pdf', 'svg', 'csv', 'json', 'html']
  },

  exampleFlow: {
    consumer_png: {
      request: 'POST /api/export/png',
      auth: 'consumer account',
      middleware: ['requireAuth ✅', 'requireExportFormat("png") ✅', 'requireActiveSubscription ✅ (free)'],
      result: '200 OK - Returns PNG file'
    },
    consumer_csv: {
      request: 'POST /api/export/csv',
      auth: 'consumer account',
      middleware: ['requireAuth ✅', 'requireExportFormat("csv") ❌ BLOCKED'],
      result: '403 Forbidden - CSV export not available for consumer'
    },
    influencer_svg: {
      request: 'POST /api/export/svg',
      auth: 'influencer account with active subscription',
      middleware: ['requireAuth ✅', 'requireExportFormat("svg") ✅', 'requireActiveSubscription ✅'],
      result: '200 OK - Returns SVG file at 300 DPI'
    },
    producer_all: {
      request: 'POST /api/export/{format}',
      auth: 'producer account with active subscription',
      middleware: ['requireAuth ✅', 'requireExportFormat(any) ✅', 'requireActiveSubscription ✅'],
      result: '200 OK - Returns any format at 300 DPI'
    }
  },

  subscriptionCheck: {
    consumer: {
      required: false,
      message: 'Free tier - no subscription needed'
    },
    influencer: {
      required: true,
      price: '€15.99/month',
      message: 'Must have active subscription to export'
    },
    producer: {
      required: true,
      price: '€29.99/month',
      message: 'Must have active subscription to export'
    }
  }
}

/**
 * EXAMPLE 3: PhenoHunt Access (Genetics)
 * 
 * Only Producer can access genealogy trees
 */

export const phenohuntExample = {
  route: 'GET /api/genetics/phenohunt',
  
  middleware: [
    'requireAuth',      // Must be logged in
    'requirePhenoHunt'  // Producer only (checks accountType === 'producer')
  ],

  matrix: {
    consumer: {
      allowed: false,
      reason: 'PhenoHunt reserved for producers',
      upgradeRequired: 'producer'
    },
    influencer: {
      allowed: false,
      reason: 'PhenoHunt reserved for producers',
      upgradeRequired: 'producer'
    },
    producer: {
      allowed: true,
      reason: 'Full access to genetics management'
    }
  },

  exampleRequest: {
    method: 'GET',
    url: '/api/genetics/phenohunt',
    headers: {
      'Authorization': 'Bearer producer-token'
    }
  },

  exampleResponses: {
    consumer: {
      status: 403,
      body: {
        error: 'PhenoHunt not available for your account type',
        accountType: 'consumer',
        requiredType: 'producer',
        message: 'Genetic genealogy management is a Producer-only feature'
      }
    },
    producer: {
      status: 200,
      body: {
        phenoTrees: [
          {
            id: 'tree-001',
            name: 'OG Kush x GDP',
            parents: ['OG Kush', 'Grandaddy Purple'],
            children: ['Biscotti', 'Sherbert OG'],
            phenotypes: [
              { name: 'Pheno A', traits: '70% Indica', yield: 'High' },
              { name: 'Pheno B', traits: '50% Hybrid', yield: 'Medium' }
            ]
          }
        ]
      }
    }
  }
}

/**
 * EXAMPLE 4: Permission Hierarchy
 * 
 * Shows how more features unlock with each tier
 */

export const permissionHierarchy = {
  consumer: {
    level: 'Amateur (Free)',
    price: '€0',
    features: {
      sections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing'],
      exportFormats: ['png', 'jpg', 'pdf'],
      templates: ['compact', 'detailed', 'complete'],
      exportQuality: '72 DPI (screen)',
      phenohunt: false,
      customPresets: false,
      batchExport: false,
      galleryPublish: true
    },
    limitations: [
      'No genetics section',
      'No culture pipeline',
      'No CSV/JSON/HTML export',
      'No custom templates',
      'No custom presets',
      'Limited export quality'
    ]
  },

  influencer: {
    level: 'Influenceur (Paid)',
    price: '€15.99/month',
    features: {
      sections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing', 'texture'],
      exportFormats: ['png', 'jpg', 'pdf', 'svg'],
      templates: ['compact', 'detailed', 'complete', 'influencer'],
      exportQuality: '300 DPI (print)',
      phenohunt: false,
      customPresets: true,
      batchExport: false,
      galleryPublish: true,
      watermarkCustom: true,
      advancedCustomization: true
    },
    limitations: [
      'No genetics section',
      'No culture pipeline',
      'No CSV/JSON/HTML export',
      'No custom templates',
      'No PhenoHunt access'
    ]
  },

  producer: {
    level: 'Producteur (Paid)',
    price: '€29.99/month',
    features: {
      sections: ['info', 'visual', 'genetic', 'aromas', 'taste', 'texture', 'effects', 'pipeline_curing', 'pipeline_culture'],
      exportFormats: ['png', 'jpg', 'pdf', 'svg', 'csv', 'json', 'html'],
      templates: ['compact', 'detailed', 'complete', 'influencer', 'custom'],
      exportQuality: '300 DPI (print)',
      phenohunt: true,
      customPresets: true,
      batchExport: true,
      galleryPublish: true,
      watermarkCustom: true,
      advancedCustomization: true,
      pipelineCustomization: true,
      pipelineVisualization: 'GitHub-style heatmap'
    },
    limitations: []
  }
}

/**
 * EXAMPLE 5: Error Response Standardization
 * 
 * All permission denials follow this format
 */

export const errorResponseStandard = {
  unauthorized: {
    status: 401,
    body: {
      error: 'Authentication required',
      message: 'Please log in to access this feature'
    }
  },

  forbidden_wrong_tier: {
    status: 403,
    body: {
      error: 'Feature not available for your account type',
      accountType: 'consumer',
      requiredType: 'producer',
      currentTier: 'Amateur (Free)',
      requiredTier: 'Producteur (€29.99/month)',
      upgradeUrl: '/pricing',
      message: 'This feature is only available to Producteur members'
    }
  },

  forbidden_inactive_subscription: {
    status: 403,
    body: {
      error: 'Active subscription required',
      accountType: 'influencer',
      subscriptionStatus: 'expired',
      message: 'Your subscription has expired. Please renew to continue exporting.',
      renewUrl: '/account/billing'
    }
  },

  forbidden_specific_section: {
    status: 403,
    body: {
      error: 'Genetics section not available for your account type',
      accountType: 'consumer',
      requiredType: 'producer',
      availableSections: ['info', 'visual', 'aromas', 'taste', 'effects', 'pipeline_curing'],
      blockedSections: ['genetic', 'texture', 'pipeline_culture'],
      upgradeUrl: '/pricing'
    }
  },

  forbidden_specific_format: {
    status: 403,
    body: {
      error: 'Export format "csv" not available for consumer account',
      accountType: 'consumer',
      requestedFormat: 'csv',
      availableFormats: ['png', 'jpg', 'pdf'],
      requiredType: 'producer',
      message: 'CSV export is only available to Producteur members'
    }
  }
}

/**
 * EXAMPLE 6: Real API Request Sequence
 * 
 * Shows complete flow from client to server
 */

export const completeRequestSequence = {
  scenario: 'Consumer tries to export as CSV',

  step1: {
    action: 'Client sends request',
    request: {
      method: 'POST',
      url: 'http://localhost:3000/api/export/csv',
      headers: { 'Authorization': 'Bearer consumer-token-abc123' },
      body: { reviewId: 'review-456' }
    }
  },

  step2: {
    action: 'Server receives request, extract user from token',
    serverState: {
      user: {
        id: 'user-789',
        username: 'consumer_user',
        accountType: 'consumer',
        subscriptionStatus: 'inactive'
      },
      requestedFormat: 'csv',
      reviewId: 'review-456'
    }
  },

  step3: {
    action: 'requireAuth middleware',
    check: 'req.user exists?',
    result: '✅ PASS - User authenticated'
  },

  step4: {
    action: 'requireExportFormat("csv") middleware',
    check: 'Can consumer export CSV?',
    lookup: 'ACCOUNT_TYPES["consumer"].features.exportFormats',
    value: "['png', 'jpg', 'pdf']",
    result: "❌ FAIL - 'csv' not in allowed formats"
  },

  step5: {
    action: 'Middleware returns 403 error',
    response: {
      status: 403,
      body: {
        error: 'Export format "csv" not available for consumer account',
        accountType: 'consumer',
        availableFormats: ['png', 'jpg', 'pdf'],
        requiredType: 'producer',
        upgradeUrl: '/pricing'
      }
    }
  },

  step6: {
    action: 'Client receives error',
    handling: 'Show upgrade modal or redirect to /pricing'
  }
}

export default {
  createFlowerReviewExample,
  exportReviewExample,
  phenohuntExample,
  permissionHierarchy,
  errorResponseStandard,
  completeRequestSequence
}
