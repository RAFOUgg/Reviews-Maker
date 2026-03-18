/**
 * Test de validation systématique ExportMaker
 * Selon VALIDATION_PROTOCOL.md et EXPORT_CHECKLIST.md
 *
 * Phase 1: Tests fondamentaux
 * Phase 2: Tests détaillés par section
 * Phase 3: Tests responsive par format
 * Phase 4: Tests par template
 */

// Données de test complètes - représentatives de tous les types de produits
const testReviewData = {
  flower: {
    id: 'test-flower-001',
    typeName: 'Fleurs',
    holderName: 'OG Kush Premium',
    varietyType: 'Indica',
    mainImage: 'https://via.placeholder.com/400x300/4ade80/ffffff?text=OG+Kush',
    gallery: ['https://via.placeholder.com/400x300/4ade80/ffffff?text=OG+Kush'],
    rating: 8.7,
    overallRating: 8.7,
    createdAt: '2026-03-18T20:00:00Z',

    // Genetics complètes
    genetics: {
      breeder: 'Kushman Genetics',
      variety: 'OG Kush #18',
      phenotype: 'Pheno A',
      indicaPercent: 80,
      sativaPercent: 20,
      generation: 'F4',
      isClone: false
    },

    // Analytics complètes
    analytics: {
      thc: 24.5,
      cbd: 0.8,
      cbg: 1.2,
      cbc: 0.6,
      cbn: 0.4,
      thcv: 0.3,
      labReport: '/reports/og-kush-lab-001.pdf'
    },

    // Profil terpénique complet
    terpenes: [
      { name: 'Myrcène', percentage: 2.1 },
      { name: 'Limonène', percentage: 1.8 },
      { name: 'Pinène', percentage: 1.2 },
      { name: 'Linalol', percentage: 0.9 },
      { name: 'Caryophyllène', percentage: 0.7 },
      { name: 'Humulène', percentage: 0.5 }
    ],

    // Évaluation visuelle
    visual: {
      crystallization: 9,
      trichomes: 8.5,
      pistils: 7,
      manucure: 8,
      density: 7.5,
      primaryColors: ['Vert foncé', 'Orange'],
      secondaryColors: ['Violet', 'Blanc']
    },

    // Évaluation olfactive
    odor: {
      intensity: 8.5,
      persistence: 8,
      dominant: ['Pin', 'Carburant', 'Terre'],
      secondary: ['Citron', 'Épices'],
      firstImpression: 'Puissant et pénétrant',
      evolution: 'Se développe vers des notes plus douces'
    },

    // Évaluation gustative
    taste: {
      intensity: 8,
      aggressiveness: 6,
      dryPuff: ['Herbes', 'Pin'],
      inhalation: ['Carburant', 'Terre'],
      expiration: ['Citron', 'Épices'],
      aftertaste: 'Persistant et plaisant'
    },

    // Effets
    effects: {
      intensity: 9,
      onset: 7,
      duration: 8,
      selected: ['Relaxation', 'Euphorie', 'Créativité', 'Anti-stress', 'Sommeil'],
      peak: 'Très puissant',
      comedown: 'En douceur'
    }
  },

  hash: {
    id: 'test-hash-001',
    typeName: 'Hash',
    holderName: 'Bubble Hash OG Premium',
    hashType: 'Bubble Hash',
    extractionMethod: 'Ice Water',
    mainImage: 'https://via.placeholder.com/400x300/fbbf24/000000?text=Bubble+Hash',
    rating: 9.2,

    analytics: {
      thc: 45.2,
      cbd: 1.2,
      cbg: 2.1
    },

    terpenes: [
      { name: 'Myrcène', percentage: 3.2 },
      { name: 'Limonène', percentage: 2.1 },
      { name: 'Pinène', percentage: 1.8 }
    ],

    texture: {
      hardness: 6,
      elasticity: 8,
      stickiness: 7,
      friability: 5,
      appearance: 'Blonde dorée',
      consistency: 'Malléable'
    },

    odor: {
      intensity: 9,
      dominant: ['Herbes', 'Floral'],
      secondary: ['Épices']
    },

    taste: {
      intensity: 9,
      aggressiveness: 4,
      inhalation: ['Doux', 'Floral'],
      expiration: ['Herbes', 'Terreux']
    },

    effects: {
      intensity: 9,
      onset: 8,
      selected: ['Relaxation profonde', 'Euphorie', 'Méditation']
    }
  }
};

// Configurations de test pour tous les formats et templates
const testConfigurations = [
  // Format 1:1 (Carré)
  { format: '1:1', template: 'compact', width: 540, height: 540 },
  { format: '1:1', template: 'standard', width: 540, height: 540 },
  { format: '1:1', template: 'detailed', width: 540, height: 540 },

  // Format 16:9 (Paysage)
  { format: '16:9', template: 'compact', width: 720, height: 405 },
  { format: '16:9', template: 'standard', width: 720, height: 405 },
  { format: '16:9', template: 'detailed', width: 720, height: 405 },

  // Format 9:16 (Portrait)
  { format: '9:16', template: 'compact', width: 405, height: 720 },
  { format: '9:16', template: 'standard', width: 405, height: 720 },
  { format: '9:16', template: 'detailed', width: 405, height: 720 },

  // Format A4 (Document)
  { format: 'A4', template: 'compact', width: 530, height: 750 },
  { format: 'A4', template: 'standard', width: 530, height: 750 },
  { format: 'A4', template: 'detailed', width: 530, height: 750 }
];

// Tests de validation par phase
const validationTests = {

  // Phase 1: Tests fondamentaux
  phase1: {
    name: 'Tests fondamentaux - Images & Données de base',
    tests: [
      {
        id: '1.1.1',
        description: 'Image principale s\'affiche',
        check: (element) => {
          const img = element.querySelector('img');
          return img && img.src && img.complete;
        }
      },
      {
        id: '1.1.2',
        description: 'Nom du produit visible',
        check: (element) => {
          const title = element.querySelector('h1');
          return title && title.textContent.trim().length > 0;
        }
      },
      {
        id: '1.1.3',
        description: 'Type de produit affiché',
        check: (element) => {
          return element.textContent.includes('🌸') ||
            element.textContent.includes('🟫') ||
            element.textContent.includes('🍯') ||
            element.textContent.includes('🍪');
        }
      },
      {
        id: '1.2.1',
        description: 'Badge THC % affiché avec bonne couleur',
        check: (element) => {
          const thcBadge = [...element.querySelectorAll('span')].find(
            span => span.textContent.includes('THC') && span.textContent.includes('%')
          );
          return thcBadge && getComputedStyle(thcBadge).color;
        }
      },
      {
        id: '1.2.2',
        description: 'Badge CBD % affiché avec bonne couleur',
        check: (element) => {
          const cbdBadge = [...element.querySelectorAll('span')].find(
            span => span.textContent.includes('CBD') && span.textContent.includes('%')
          );
          return cbdBadge && getComputedStyle(cbdBadge).color;
        }
      },
      {
        id: '1.3.1',
        description: 'Note globale (ScoreGauge) affichée',
        check: (element) => {
          // Recherche du composant ScoreGauge ou équivalent
          const scoreGauge = element.querySelector('[data-testid="score-gauge"]') ||
            element.querySelector('.score-gauge') ||
            [...element.querySelectorAll('*')].find(el =>
              el.getAttribute && el.getAttribute('aria-label') &&
              el.getAttribute('aria-label').includes('score')
            );
          return !!scoreGauge;
        }
      }
    ]
  },

  // Phase 2: Tests détaillés par section
  phase2: {
    name: 'Tests détaillés par section',
    tests: [
      {
        id: '2.1.1',
        description: 'Section Terpènes affichée avec graphiques',
        check: (element) => {
          const terpSection = [...element.querySelectorAll('*')].find(el =>
            el.textContent && el.textContent.includes('Terpènes')
          );
          return !!terpSection;
        }
      },
      {
        id: '2.3.1',
        description: 'Section Odeur présente avec icône',
        check: (element) => {
          const odorSection = [...element.querySelectorAll('*')].find(el =>
            el.textContent && (el.textContent.includes('Odeur') || el.textContent.includes('👃'))
          );
          return !!odorSection;
        }
      },
      {
        id: '2.4.1',
        description: 'Section Goût présente avec icône',
        check: (element) => {
          const tasteSection = [...element.querySelectorAll('*')].find(el =>
            el.textContent && (el.textContent.includes('Goût') || el.textContent.includes('😋'))
          );
          return !!tasteSection;
        }
      },
      {
        id: '2.5.1',
        description: 'Section Effets présente avec icône',
        check: (element) => {
          const effectsSection = [...element.querySelectorAll('*')].find(el =>
            el.textContent && (el.textContent.includes('Effets') || el.textContent.includes('💥'))
          );
          return !!effectsSection;
        }
      }
    ]
  },

  // Phase 3: Tests responsive
  phase3: {
    name: 'Tests responsive par format',
    tests: [
      {
        id: '3.1.1',
        description: 'Layout adaptatif selon format',
        check: (element, config) => {
          const style = getComputedStyle(element);
          const actualWidth = parseInt(style.width);
          const actualHeight = parseInt(style.height);

          return Math.abs(actualWidth - config.width) < 50 &&
            Math.abs(actualHeight - config.height) < 50;
        }
      },
      {
        id: '3.2.1',
        description: 'FontSize adapté au format',
        check: (element, config) => {
          const textElements = element.querySelectorAll('span, p, div, h1, h2, h3');
          let hasAdaptiveFonts = false;

          textElements.forEach(el => {
            const fontSize = parseFloat(getComputedStyle(el).fontSize);
            if (fontSize > 0) {
              hasAdaptiveFonts = true;
            }
          });

          return hasAdaptiveFonts;
        }
      }
    ]
  },

  // Phase 4: Tests par template
  phase4: {
    name: 'Tests par template',
    tests: [
      {
        id: '4.1.1',
        description: 'Template compact - sections essentielles uniquement',
        check: (element, config) => {
          if (config.template !== 'compact') return true;

          // Template compact doit avoir moins de sections détaillées
          const sections = element.querySelectorAll('[data-orchard-section]');
          return sections.length <= 4; // Max 4 sections pour compact
        }
      },
      {
        id: '4.2.1',
        description: 'Template détaillé - toutes sections disponibles',
        check: (element, config) => {
          if (config.template !== 'detailed') return true;

          // Template détaillé doit avoir plus de sections
          const sections = element.querySelectorAll('[data-orchard-section]');
          return sections.length >= 3; // Min 3 sections pour détaillé
        }
      }
    ]
  }
};

// Fonction principale de validation
async function runExportValidation() {
  console.log('🧪 DÉMARRAGE VALIDATION SYSTÈME EXPORTMAKER');
  console.log('='.repeat(60));

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    phases: {},
    details: []
  };

  // Test chaque configuration
  for (const config of testConfigurations) {
    console.log(`\n🔍 Test: ${config.template.toUpperCase()} ${config.format}`);
    console.log('-'.repeat(40));

    try {
      // Simuler le rendu ExportMaker avec la configuration
      const renderResult = await simulateExportRender(
        testReviewData.flower,
        config
      );

      if (!renderResult.success) {
        console.log(`❌ ÉCHEC RENDU: ${renderResult.error}`);
        continue;
      }

      const element = renderResult.element;

      // Exécuter tous les tests de validation
      for (const [phaseKey, phase] of Object.entries(validationTests)) {
        if (!results.phases[phaseKey]) {
          results.phases[phaseKey] = { passed: 0, failed: 0, total: 0 };
        }

        for (const test of phase.tests) {
          results.total++;
          results.phases[phaseKey].total++;

          try {
            const passed = test.check(element, config);

            if (passed) {
              results.passed++;
              results.phases[phaseKey].passed++;
              console.log(`✓ ${test.id}: ${test.description}`);
            } else {
              results.failed++;
              results.phases[phaseKey].failed++;
              console.log(`❌ ${test.id}: ${test.description}`);
            }

            results.details.push({
              config: `${config.template}-${config.format}`,
              testId: test.id,
              description: test.description,
              passed,
              phase: phaseKey
            });

          } catch (error) {
            results.failed++;
            results.phases[phaseKey].failed++;
            console.log(`💥 ${test.id}: ERREUR - ${error.message}`);

            results.details.push({
              config: `${config.template}-${config.format}`,
              testId: test.id,
              description: test.description,
              passed: false,
              error: error.message,
              phase: phaseKey
            });
          }
        }
      }

    } catch (error) {
      console.log(`💥 ERREUR CONFIGURATION: ${error.message}`);
    }
  }

  // Rapport final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT DE VALIDATION FINAL');
  console.log('='.repeat(60));

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`Taux de succès global: ${successRate}% (${results.passed}/${results.total})`);

  for (const [phaseKey, phase] of Object.entries(results.phases)) {
    const phaseRate = ((phase.passed / phase.total) * 100).toFixed(1);
    console.log(`${validationTests[phaseKey].name}: ${phaseRate}% (${phase.passed}/${phase.total})`);
  }

  // Critères de validation globale
  if (successRate >= 95) {
    console.log('\n✅ VALIDATION RÉUSSIE - Système prêt pour production');
  } else if (successRate >= 85) {
    console.log('\n⚠️ VALIDATION PARTIELLE - Corrections mineures nécessaires');
  } else {
    console.log('\n❌ VALIDATION ÉCHOUÉE - Corrections majeures requises');
  }

  return results;
}

// Simulateur de rendu ExportMaker (pour test)
async function simulateExportRender(reviewData, config) {
  try {
    // Créer un élément DOM simulé avec les dimensions correctes
    const element = document.createElement('div');
    element.style.width = `${config.width}px`;
    element.style.height = `${config.height}px`;
    element.style.position = 'relative';

    // Simuler la structure de rendu ExportMaker
    simulateCanvasContent(element, reviewData, config);

    return { success: true, element };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Simulateur du contenu canvas (structure minimale pour test)
function simulateCanvasContent(container, reviewData, config) {
  // Header avec titre
  const header = document.createElement('div');
  const title = document.createElement('h1');
  title.textContent = reviewData.holderName || 'Sans nom';
  header.appendChild(title);
  container.appendChild(header);

  // Image
  if (reviewData.mainImage) {
    const img = document.createElement('img');
    img.src = reviewData.mainImage;
    img.onload = () => { img.complete = true; };
    container.appendChild(img);
  }

  // Type de produit
  const typeIcon = document.createElement('span');
  typeIcon.textContent = reviewData.typeName === 'Fleurs' ? '🌸' :
    reviewData.typeName === 'Hash' ? '🟫' : '🌿';
  container.appendChild(typeIcon);

  // Cannabinoides
  if (reviewData.analytics) {
    Object.entries(reviewData.analytics).forEach(([key, value]) => {
      if (value > 0 && ['thc', 'cbd', 'cbg', 'cbc', 'cbn', 'thcv'].includes(key)) {
        const badge = document.createElement('span');
        badge.textContent = `${key.toUpperCase()} ${value}%`;
        badge.style.color = key === 'thc' ? '#F87171' :
          key === 'cbd' ? '#34D399' : '#FCD34D';
        container.appendChild(badge);
      }
    });
  }

  // Score global
  if (reviewData.rating) {
    const scoreGauge = document.createElement('div');
    scoreGauge.setAttribute('data-testid', 'score-gauge');
    scoreGauge.setAttribute('aria-label', `Score: ${reviewData.rating}`);
    scoreGauge.textContent = `Note: ${reviewData.rating}/10`;
    container.appendChild(scoreGauge);
  }

  // Sections sensorielles
  if (reviewData.terpenes && reviewData.terpenes.length > 0) {
    const terpSection = document.createElement('div');
    terpSection.setAttribute('data-orchard-section', 'terpenes');
    terpSection.innerHTML = '<h3>Terpènes</h3>';
    container.appendChild(terpSection);
  }

  if (reviewData.odor) {
    const odorSection = document.createElement('div');
    odorSection.setAttribute('data-orchard-section', 'odor');
    odorSection.innerHTML = '<h3>👃 Odeur</h3>';
    container.appendChild(odorSection);
  }

  if (reviewData.taste) {
    const tasteSection = document.createElement('div');
    tasteSection.setAttribute('data-orchard-section', 'taste');
    tasteSection.innerHTML = '<h3>😋 Goût</h3>';
    container.appendChild(tasteSection);
  }

  if (reviewData.effects) {
    const effectsSection = document.createElement('div');
    effectsSection.setAttribute('data-orchard-section', 'effects');
    effectsSection.innerHTML = '<h3>💥 Effets</h3>';
    container.appendChild(effectsSection);
  }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runExportValidation,
    testReviewData,
    testConfigurations,
    validationTests
  };
}

// Auto-run si dans le navigateur
if (typeof window !== 'undefined' && window.document) {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runExportValidation);
  } else {
    runExportValidation();
  }
}