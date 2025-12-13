/**
 * REVIEWS-MAKER MVP - Configuration des fonctionnalités par type de compte
 */

export const ACCOUNT_TYPES = {
  AMATEUR: 'consumer',
  INFLUENCER: 'influencer',
  PRODUCER: 'producer',
};

export const ACCOUNT_FEATURES = {
  [ACCOUNT_TYPES.AMATEUR]: {
    label: 'Amateur',
    price: 'Gratuit',
    features: {
      sections: ['general', 'visual', 'odor', 'taste', 'effects'],
      templates: ['compact', 'detailed'],
      exportFormats: ['png', 'jpeg', 'pdf-low'],
      exportQuality: 'standard',
      maxExportsPerDay: 10,
      maxReviews: 50,
      customization: {
        themes: true,
        colors: true,
        fonts: false,
        watermark: false,
        layout: false,
      },
      pipelines: false,
      genetics: false,
      publicGallery: true,
      analytics: 'basic',
    },
  },
  [ACCOUNT_TYPES.INFLUENCER]: {
    label: 'Influenceur',
    price: '15.99€/mois',
    features: {
      sections: ['general', 'visual', 'odor', 'taste', 'effects', 'texture', 'experience'],
      templates: ['compact', 'detailed', 'complete', 'social'],
      exportFormats: ['png', 'jpeg', 'pdf-high', 'svg'],
      exportQuality: 'high',
      maxExportsPerDay: 100,
      maxReviews: 500,
      customization: {
        themes: true,
        colors: true,
        fonts: true,
        watermark: true,
        layout: true,
      },
      pipelines: true,
      genetics: false,
      publicGallery: true,
      analytics: 'advanced',
      social: {
        autoShare: true,
        customBranding: true,
      },
    },
  },
  [ACCOUNT_TYPES.PRODUCER]: {
    label: 'Producteur',
    price: '29.99€/mois',
    features: {
      sections: 'all',
      templates: 'all',
      exportFormats: ['png', 'jpeg', 'pdf-high', 'svg', 'csv', 'json', 'html'],
      exportQuality: 'professional',
      maxExportsPerDay: -1, // unlimited
      maxReviews: -1, // unlimited
      customization: {
        themes: true,
        colors: true,
        fonts: true,
        watermark: true,
        layout: true,
        dragDrop: true,
      },
      pipelines: true,
      genetics: true,
      publicGallery: true,
      analytics: 'professional',
      api: {
        access: true,
        webhooks: true,
      },
      traceability: true,
    },
  },
};

export const hasFeature = (accountType, feature) => {
  const account = ACCOUNT_FEATURES[accountType];
  if (!account) return false;

  const path = feature.split('.');
  let value = account.features;

  for (const key of path) {
    if (value[key] === undefined) return false;
    value = value[key];
  }

  return value === true || value === 'all' || (typeof value === 'number' && value !== 0);
};

export const canExport = (accountType, exportsToday) => {
  const account = ACCOUNT_FEATURES[accountType];
  if (!account) return false;

  const limit = account.features.maxExportsPerDay;
  if (limit === -1) return true; // unlimited
  return exportsToday < limit;
};

export const canCreateReview = (accountType, reviewCount) => {
  const account = ACCOUNT_FEATURES[accountType];
  if (!account) return false;

  const limit = account.features.maxReviews;
  if (limit === -1) return true; // unlimited
  return reviewCount < limit;
};
