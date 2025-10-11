/**
 * EXPORT STUDIO - Exemples d'utilisation
 * 
 * Ce fichier contient des exemples de configuration et d'utilisation
 * du module Export Studio pour différents cas d'usage.
 */

// ============================================
// EXEMPLE 1: Export basique avec configuration par défaut
// ============================================

function exportBasic() {
  // Données minimales requises
  const data = {
    formData: {
      cultivars: 'Gelato 41',
      productType: 'Hash',
      notes: 'Excellente qualité, très aromatique'
    },
    currentType: 'Hash',
    totals: {
      'section-0': { sum: 8.5, max: 10 },
      'section-1': { sum: 9.0, max: 10 }
    },
    cultivarInfo: {
      title: 'Gelato 41',
      details: [{ name: 'Gelato 41', percentage: 100 }]
    },
    productIcon: '🧊',
    structure: productStructures['Hash'],
    globalScore: 17.5,
    maxGlobalScore: 20,
    scoreOutOf10: 8.75,
    percentage: 87.5
  };

  // Config par défaut (template Studio)
  const config = {};

  // Créer le renderer et exporter
  const renderer = new ExportRenderer(config, data);
  renderer.downloadImage('review_gelato41.png');
}

// ============================================
// EXEMPLE 2: Export Instagram Story optimisé
// ============================================

function exportInstagramStory() {
  const config = {
    template: 'social',
    dimensions: {
      width: 1080,
      height: 1920,
      scale: 2,
      format: 'jpg' // Plus léger pour les réseaux sociaux
    },
    sections: {
      header: true,
      scores: true,
      details: true,
      notes: false, // Masquer les notes pour un rendu compact
      branding: true
    },
    style: {
      colorScheme: 'dark',
      accentColor: '#f472b6', // Rose vif pour Instagram
      backgroundColor: '#0a0a0a'
    },
    branding: {
      signature: '@mon_compte_insta'
    }
  };

  const data = getCurrentReviewData(); // Fonction helper
  const renderer = new ExportRenderer(config, data);
  renderer.downloadImage('story_' + Date.now() + '.jpg');
}

// ============================================
// EXEMPLE 3: Export haute qualité pour impression
// ============================================

function exportPrintQuality() {
  const config = {
    template: 'magazine',
    dimensions: {
      width: 1400,
      height: 2000,
      scale: 4, // Qualité maximale
      format: 'png'
    },
    sections: {
      header: true,
      scores: true,
      details: true,
      notes: true,
      branding: true
    },
    style: {
      colorScheme: 'light', // Meilleur pour l'impression
      accentColor: '#059669',
      backgroundColor: '#ffffff',
      fontFamily: 'Manrope'
    },
    branding: {
      watermark: 'Premium Cannabis Review',
      signature: 'Expert Reviewer © 2025'
    }
  };

  const data = getCurrentReviewData();
  const renderer = new ExportRenderer(config, data);
  renderer.downloadImage('review_print_quality.png');
}

// ============================================
// EXEMPLE 4: Export minimaliste pour partage rapide
// ============================================

function exportQuickShare() {
  const config = {
    template: 'minimal',
    dimensions: {
      width: 800,
      height: 1000,
      scale: 1.5, // Qualité moyenne, fichier léger
      format: 'webp' // Format moderne optimal
    },
    sections: {
      header: true,
      scores: true,
      details: false,
      notes: false,
      branding: false
    },
    style: {
      colorScheme: 'dark',
      accentColor: '#38bdf8'
    }
  };

  const data = getCurrentReviewData();
  const renderer = new ExportRenderer(config, data);
  renderer.downloadImage('quick_review.webp');
}

// ============================================
// EXEMPLE 5: Batch export avec plusieurs configurations
// ============================================

async function exportMultipleFormats() {
  const data = getCurrentReviewData();
  const baseName = data.formData.cultivars.replace(/\s+/g, '-').toLowerCase();

  // Configuration pour chaque format
  const configs = [
    { template: 'minimal', format: 'webp', suffix: 'quick' },
    { template: 'card', format: 'jpg', suffix: 'social' },
    { template: 'studio', format: 'png', suffix: 'full' }
  ];

  for (const cfg of configs) {
    const config = {
      template: cfg.template,
      dimensions: {
        ...exportTemplates[cfg.template].dimensions,
        scale: 2,
        format: cfg.format
      },
      sections: {
        header: true,
        scores: true,
        details: true,
        notes: cfg.template === 'studio',
        branding: true
      }
    };

    const renderer = new ExportRenderer(config, data);
    await renderer.downloadImage(`${baseName}_${cfg.suffix}.${cfg.format}`);
    
    // Petite pause entre chaque export
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Tous les formats ont été exportés!');
}

// ============================================
// EXEMPLE 6: Export avec personnalisation avancée des couleurs
// ============================================

function exportCustomColors() {
  // Palette de couleurs personnalisée
  const brandColors = {
    primary: '#10b981',
    secondary: '#6366f1',
    background: '#1e293b',
    text: '#f1f5f9'
  };

  const config = {
    template: 'studio',
    style: {
      colorScheme: 'dark',
      accentColor: brandColors.primary,
      backgroundColor: brandColors.background,
      fontFamily: 'Inter'
    },
    branding: {
      watermark: 'Ma Marque Cannabis',
      signature: 'Certified Expert'
    }
  };

  const data = getCurrentReviewData();
  const renderer = new ExportRenderer(config, data);
  renderer.downloadImage('review_custom_brand.png');
}

// ============================================
// EXEMPLE 7: Export programmatique avec API
// ============================================

async function apiExport(reviewId) {
  try {
    // Récupérer la review depuis la base de données
    const review = await db.reviews.get(reviewId);
    
    if (!review) {
      throw new Error('Review introuvable');
    }

    // Préparer les données
    const data = {
      formData: review,
      currentType: review.productType,
      totals: review.totals || {},
      cultivarInfo: {
        title: review.cultivars || review.productType,
        details: JSON.parse(review.cultivarsList || '[]')
      },
      productIcon: getProductIcon(review.productType),
      structure: productStructures[review.productType],
      ...calculateScores(review.totals)
    };

    // Configuration optimale
    const config = {
      template: 'studio',
      dimensions: {
        scale: 2,
        format: 'png'
      }
    };

    // Générer et télécharger
    const renderer = new ExportRenderer(config, data);
    await renderer.downloadImage(`review_${reviewId}.png`);

    return { success: true, reviewId };

  } catch (error) {
    console.error('Erreur export API:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPERS - Fonctions utilitaires
// ============================================

/**
 * Récupère les données de la review en cours
 */
function getCurrentReviewData() {
  if (!window.formData || !window.currentType) {
    throw new Error('Aucune review active');
  }

  return {
    formData: window.formData,
    currentType: window.currentType,
    totals: window.totals || {},
    cultivarInfo: getCultivarInfo(),
    productIcon: getProductIcon(window.currentType),
    structure: window.productStructures[window.currentType],
    ...calculateScores(window.totals)
  };
}

/**
 * Calcule les scores globaux
 */
function calculateScores(totals) {
  let globalScore = 0;
  let maxGlobalScore = 0;
  let sectionsWithData = 0;

  Object.values(totals || {}).forEach(section => {
    if (section.sum && section.max) {
      globalScore += section.sum;
      maxGlobalScore += section.max;
      sectionsWithData++;
    }
  });

  const scoreOutOf10 = maxGlobalScore > 0 ? (globalScore / maxGlobalScore * 10) : 0;
  const percentage = maxGlobalScore > 0 ? (globalScore / maxGlobalScore * 100) : 0;

  return {
    globalScore,
    maxGlobalScore,
    sectionsWithData,
    scoreOutOf10,
    percentage
  };
}

/**
 * Récupère les infos de cultivar
 */
function getCultivarInfo() {
  try {
    const list = JSON.parse(window.formData['cultivarsList'] || '[]');
    if (Array.isArray(list) && list.length > 0) {
      return {
        title: list.map(c => c.name).filter(Boolean).join(' + ') || 
               window.formData.cultivars || 
               window.formData.productType,
        details: list
      };
    }
  } catch {}
  
  return {
    title: window.formData.cultivars || window.formData.productType || 'Review',
    details: null
  };
}

/**
 * Icône selon le type de produit
 */
function getProductIcon(type) {
  const icons = {
    'Hash': '🧊',
    'Fleur': '🌸',
    'Concentré': '💎',
    'Comestible': '🍬'
  };
  return icons[type] || '🌿';
}

// ============================================
// DÉMO INTERACTIVE
// ============================================

/**
 * Lance une démo interactive dans la console
 */
function demoExportStudio() {
  console.log('🎨 Démo Export Studio');
  console.log('=====================\n');
  
  console.log('Templates disponibles:');
  Object.keys(exportTemplates).forEach(key => {
    const tpl = exportTemplates[key];
    console.log(`  ${tpl.name}: ${tpl.dimensions.width}×${tpl.dimensions.height}px - ${tpl.description}`);
  });
  
  console.log('\nExemples à tester:');
  console.log('  exportBasic()              - Export standard');
  console.log('  exportInstagramStory()     - Optimisé Instagram');
  console.log('  exportPrintQuality()       - Haute qualité impression');
  console.log('  exportQuickShare()         - Partage rapide');
  console.log('  exportMultipleFormats()    - Batch export');
  console.log('  exportCustomColors()       - Couleurs personnalisées');
  
  console.log('\nOuvrir le studio:');
  console.log('  openExportStudio()         - Interface complète');
}

// Auto-exécuter la démo en mode développement
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Disponible dans la console
  window.demoExportStudio = demoExportStudio;
  window.exportExamples = {
    basic: exportBasic,
    instagram: exportInstagramStory,
    print: exportPrintQuality,
    quick: exportQuickShare,
    batch: exportMultipleFormats,
    custom: exportCustomColors,
    api: apiExport
  };
  
  console.log('💡 Tapez "demoExportStudio()" pour voir les exemples');
  console.log('💡 Ou utilisez "exportExamples.basic()" pour tester un export');
}
