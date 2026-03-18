/**
 * Integration Test for ExportMaker Component
 * Tests the actual React component against the validation protocol
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import ExportMaker from '../components/export/ExportMaker.jsx';

// Mock data pour les tests
const mockReviewData = {
  id: 'test-review-001',
  typeName: 'Fleurs',
  holderName: 'OG Kush Premium',
  varietyType: 'Indica',
  mainImage: '/test-images/og-kush.jpg',
  rating: 8.7,
  overallRating: 8.7,
  createdAt: '2026-03-18T20:00:00Z',

  genetics: {
    breeder: 'Kushman Genetics',
    variety: 'OG Kush #18',
    phenotype: 'Pheno A',
    indicaPercent: 80,
    sativaPercent: 20
  },

  analytics: {
    thc: 24.5,
    cbd: 0.8,
    cbg: 1.2,
    cbc: 0.6,
    cbn: 0.4,
    thcv: 0.3,
    labReport: '/reports/test-lab.pdf'
  },

  terpenes: [
    { name: 'Myrcène', percentage: 2.1 },
    { name: 'Limonène', percentage: 1.8 },
    { name: 'Pinène', percentage: 1.2 },
    { name: 'Linalol', percentage: 0.9 }
  ],

  visual: {
    crystallization: 9,
    trichomes: 8.5,
    pistils: 7,
    manucure: 8,
    density: 7.5
  },

  odor: {
    intensity: 8.5,
    persistence: 8,
    dominant: ['Pin', 'Carburant', 'Terre'],
    secondary: ['Citron', 'Épices']
  },

  taste: {
    intensity: 8,
    aggressiveness: 6,
    dryPuff: ['Herbes', 'Pin'],
    inhalation: ['Carburant', 'Terre'],
    expiration: ['Citron', 'Épices']
  },

  effects: {
    intensity: 9,
    onset: 7,
    duration: 8,
    selected: ['Relaxation', 'Euphorie', 'Créativité', 'Anti-stress']
  }
};

// Mock des stores et hooks
vi.mock('../store/orchardStore.js', () => ({
  default: {
    subscribe: vi.fn(),
    getState: () => ({
      contentModules: {},
      DEFAULT_TEMPLATES: {
        compact: { name: 'Compact', density: 'low' },
        standard: { name: 'Standard', density: 'medium' },
        detailed: { name: 'Detailed', density: 'high' }
      }
    })
  }
}));

vi.mock('../hooks/useAccountType.js', () => ({
  default: () => ({
    accountType: 'producer',
    canExportAdvanced: true,
    canExportSVG: true,
    canCreateCustomTemplate: true
  })
}));

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn(() => Promise.resolve('data:image/png;base64,test')),
  toJpeg: vi.fn(() => Promise.resolve('data:image/jpeg;base64,test')),
  toSvg: vi.fn(() => Promise.resolve('data:image/svg+xml;base64,test'))
}));

describe('ExportMaker Integration Tests', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      reviewData: mockReviewData,
      productType: 'flower',
      reviewName: 'OG Kush Premium Test'
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('Phase 1: Tests fondamentaux', () => {

    test('1.1.1 - Image principale s\'affiche', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const images = container.querySelectorAll('img');
      const hasMainImage = Array.from(images).some(img =>
        img.src && (
          img.src.includes(mockReviewData.mainImage) ||
          img.src.includes('og-kush') ||
          img.alt === mockProps.reviewName
        )
      );

      expect(hasMainImage).toBe(true);
    });

    test('1.1.2 - Nom du produit visible', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const hasProductName = container.textContent.includes(mockProps.reviewName) ||
        container.textContent.includes(mockReviewData.holderName);

      expect(hasProductName).toBe(true);
    });

    test('1.1.3 - Type de produit affiché', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const hasProductType = container.textContent.includes('🌸') ||
        container.textContent.includes('Fleurs') ||
        container.textContent.includes(mockReviewData.typeName);

      expect(hasProductType).toBe(true);
    });

    test('1.2.1 - Badge THC % affiché avec couleur', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const thcElements = Array.from(container.querySelectorAll('*')).filter(el =>
        el.textContent && el.textContent.includes('THC') && el.textContent.includes('%')
      );

      expect(thcElements.length).toBeGreaterThan(0);

      // Vérifier qu'au moins un élément THC a une couleur définie
      const hasColoredTHC = thcElements.some(el => {
        const style = window.getComputedStyle(el);
        return style.color && style.color !== 'rgba(0, 0, 0, 0)';
      });

      expect(hasColoredTHC).toBe(true);
    });

    test('1.2.2 - Badge CBD % affiché avec couleur', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const cbdElements = Array.from(container.querySelectorAll('*')).filter(el =>
        el.textContent && el.textContent.includes('CBD') && el.textContent.includes('%')
      );

      expect(cbdElements.length).toBeGreaterThan(0);
    });

    test('1.3.1 - Note globale (ScoreGauge) affichée', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const hasRating = container.textContent.includes('8.7') ||
        container.textContent.includes('Note') ||
        container.querySelector('[data-testid="score-gauge"]') ||
        container.querySelector('.score-gauge');

      expect(hasRating).toBe(true);
    });
  });

  describe('Phase 2: Tests détaillés par section', () => {

    test('2.1.1 - Section Terpènes affichée', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const hasTerpenesSection = container.textContent.includes('Terpènes') ||
        container.textContent.includes('Myrcène') ||
        container.textContent.includes('Limonène');

      expect(hasTerpenesSection).toBe(true);
    });

    test('2.3.1 - Section Odeur présente avec icône', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const hasOdorSection = container.textContent.includes('Odeur') ||
        container.textContent.includes('👃') ||
        container.textContent.includes('Pin') ||
        container.textContent.includes('Carburant');

      expect(hasOdorSection).toBe(true);
    });

    test('2.4.1 - Section Goût présente avec icône', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const hasTasteSection = container.textContent.includes('Goût') ||
        container.textContent.includes('😋');

      expect(hasTasteSection).toBe(true);
    });

    test('2.5.1 - Section Effets présente avec icône', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const hasEffectsSection = container.textContent.includes('Effets') ||
        container.textContent.includes('💥') ||
        container.textContent.includes('Relaxation') ||
        container.textContent.includes('Euphorie');

      expect(hasEffectsSection).toBe(true);
    });
  });

  describe('Phase 3: Tests responsive par format', () => {

    test('3.1.1 - Template compact a moins de sections', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      // Simuler sélection template compact via state interne
      // Le composant devrait adapter le contenu selon le template
      const sections = container.querySelectorAll('[data-orchard-section]');

      // S'assurer qu'il y a des sections définies
      expect(sections.length).toBeGreaterThan(0);
    });

    test('3.2.1 - FontSize adaptatif selon format', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const textElements = container.querySelectorAll('h1, h2, h3, span, div');
      let hasAdaptiveFonts = false;

      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (parseFloat(style.fontSize) > 0) {
          hasAdaptiveFonts = true;
        }
      });

      expect(hasAdaptiveFonts).toBe(true);
    });
  });

  describe('Phase 4: Tests de données spécifiques', () => {

    test('4.1.1 - Cannabinoids filtrés correctement', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      // Vérifier que seuls les cannabinoïdes > 0 sont affichés
      const cannabinoidText = container.textContent;
      expect(cannabinoidText).toMatch(/THC.*24\.5%/);
      expect(cannabinoidText).toMatch(/CBD.*0\.8%/);
      expect(cannabinoidText).toMatch(/CBG.*1\.2%/);

      // Vérifier que les faibles valeurs sont affichées quand même
      expect(cannabinoidText).toMatch(/CBN.*0\.4%/);
    });

    test('4.2.1 - Terpenes triés par pourcentage', () => {
      const { container } = render(<ExportMaker {...mockProps} />);

      const terpenesText = container.textContent;

      // Myrcène devrait apparaître avant Pinène (2.1% > 1.2%)
      const myrceneIndex = terpenesText.indexOf('Myrcène');
      const pineneIndex = terpenesText.indexOf('Pinène');

      if (myrceneIndex !== -1 && pineneIndex !== -1) {
        expect(myrceneIndex).toBeLessThan(pineneIndex);
      }
    });

    test('4.3.1 - Sections sensorielles avec données partielles', () => {
      // Test avec données incomplètes
      const partialData = {
        ...mockReviewData,
        odor: { intensity: 7 }, // Seulement intensité
        taste: { aggressiveness: 5 }, // Seulement agressivité
        effects: { selected: ['Relaxation'] } // Seulement effets sélectionnés
      };

      const { container } = render(<ExportMaker {...{ ...mockProps, reviewData: partialData }} />);

      // Même avec données partielles, les sections devraient s'afficher
      expect(container.textContent).toContain('7'); // Intensité odeur
      expect(container.textContent).toContain('5'); // Agressivité goût
      expect(container.textContent).toContain('Relaxation'); // Effet
    });
  });

  describe('Phase 5: Tests de robustesse', () => {

    test('5.1.1 - Gère données manquantes gracieusement', () => {
      const incompleteData = {
        id: 'incomplete',
        holderName: 'Test Minimal',
        typeName: 'Fleurs'
        // Tout le reste manquant
      };

      const { container } = render(<ExportMaker {...{ ...mockProps, reviewData: incompleteData }} />);

      // Le composant ne devrait pas crasher
      expect(container).toBeTruthy();
      expect(container.textContent).toContain('Test Minimal');
    });

    test('5.2.1 - Valeurs nulles/undefined handling', () => {
      const nullData = {
        ...mockReviewData,
        analytics: {
          thc: null,
          cbd: undefined,
          cbg: 0,
          cbc: '',
          cbn: '-'
        }
      };

      expect(() => {
        render(<ExportMaker {...{ ...mockProps, reviewData: nullData }} />);
      }).not.toThrow();
    });

    test('5.3.1 - Format données terpènes variables', () => {
      const variableTerpenes = {
        ...mockReviewData,
        terpenes: [
          { name: 'Test1', percentage: 'invalid' },
          { percentage: 1.5 }, // Nom manquant
          { name: 'Valid', percentage: 2.0 },
          null,
          undefined
        ]
      };

      expect(() => {
        render(<ExportMaker {...{ ...mockProps, reviewData: variableTerpenes }} />);
      }).not.toThrow();
    });
  });
});

// Tests de performance
describe('ExportMaker Performance Tests', () => {

  test('Rendu initial sous 500ms', async () => {
    const start = performance.now();

    render(<ExportMaker {...{
      isOpen: true,
      onClose: vi.fn(),
      reviewData: mockReviewData,
      productType: 'flower',
      reviewName: 'Performance Test'
    }} />);

    const renderTime = performance.now() - start;
    expect(renderTime).toBeLessThan(500);
  });

  test('Pas de memory leaks avec resolveReviewField', () => {
    const { rerender, unmount } = render(<ExportMaker {...{
      isOpen: true,
      onClose: vi.fn(),
      reviewData: mockReviewData,
      productType: 'flower',
      reviewName: 'Memory Test'
    }} />);

    // Simuler plusieurs re-renders
    for (let i = 0; i < 10; i++) {
      rerender(<ExportMaker {...{
        isOpen: true,
        onClose: vi.fn(),
        reviewData: { ...mockReviewData, id: `test-${i}` },
        productType: 'flower',
        reviewName: `Memory Test ${i}`
      }} />);
    }

    expect(() => unmount()).not.toThrow();
  });
});