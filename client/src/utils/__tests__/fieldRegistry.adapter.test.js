import { describe, it, expect } from 'vitest';
import { buildExportReviewData } from '../exportDataAdapter';
import { getAllFields, getFieldRegistry, PRODUCT_TYPES } from '../fieldRegistry';

// Chemin PUBLIC : review aplatie côté serveur (noms de colonnes DB)
const publicFlower = {
    id: 'r1', type: 'Fleurs', holderName: 'Purple Haze', computedOverall: 8.4,
    farm: 'La Ferme', breeder: 'Dutch Passion', variety: 'Purple Haze',
    thcPercent: 22.5, cbdPercent: 0.8, thcaPercent: 1.1, cbgPercent: 0.5,
    varietyType: 'sativa', indicaPercent: 30,
    couleurScore: 8, densiteVisuelle: 7, trichomesScore: 9,
    intensiteAromeScore: 8, complexiteAromeScore: 7,
    dureteScore: 6, elasticiteScore: 5,
    intensiteGoutScore: 8, agressiviteScore: 4,
    monteeScore: 9, intensiteEffetScore: 8,
    notesOdeursDominantes: '["Citron","Pin"]',
    effetsChoisis: '["Relaxant","Créatif"]',
    terpeneProfile: '[{"name":"Limonène","value":1.2}]',
    consumptionMethod: 'Vapeur', dosage: 0.3, dosageUnit: 'g',
    effectProfiles: '["anxiolytique"]', preferredUse: '["soir"]',
    couleurNuancier: '["vert","violet"]',
    author: { username: 'bob', producerProfile: { isVerified: true, businessType: 'producer' } },
};

// Chemin ORCHARD : formData normalisé (noms formData)
const orchardFlower = {
    type: 'flower', holderName: 'OG Kush', rating: 7.9,
    densite: 8, trichome: 7, durete: 6, montee: 9, intensiteEffet: 8,
    aromasIntensity: 7, agressivite: 3, intensiteFumee: 8,
    effects: ['Relaxant'], aromas: ['Terreux'],
};

describe('exportDataAdapter — chemin public (colonnes DB aplaties)', () => {
    const a = buildExportReviewData(publicFlower);

    it('projette la note globale depuis computedOverall', () => expect(a.rating).toBe(8.4));
    it('mappe thcLevel <- thcPercent', () => expect(a.thcLevel).toBe(22.5));
    it('mappe les cannabinoïdes acides jamais rendus avant (thcaLevel)', () => expect(a.thcaLevel).toBe(1.1));
    it('mappe cbgLevel <- cbgPercent', () => expect(a.cbgLevel).toBe(0.5));
    it('mappe strainType <- varietyType', () => expect(a.strainType).toBe('sativa'));
    it('mappe indicaRatio <- indicaPercent', () => expect(a.indicaRatio).toBe(30));
    it('parse les notes d\'odeur', () => expect(a.aromas).toEqual(['Citron', 'Pin']));
    it('mappe effects <- effetsChoisis', () => expect(a.effects).toEqual(['Relaxant', 'Créatif']));
    it('parse les terpènes en objets', () => expect(a.terpenes[0].name).toBe('Limonène'));
    it('expose consumptionMethod (gisement jamais rendu)', () => expect(a.consumptionMethod).toBe('Vapeur'));
    it('parse effectProfiles (gisement)', () => expect(a.effectProfiles).toEqual(['anxiolytique']));
    it('parse couleurNuancier (gisement)', () => expect(a.couleurNuancier).toEqual(['vert', 'violet']));
    it('remonte producerVerified depuis author.producerProfile', () => expect(a.producerVerified).toBe(true));
    it('reconstruit categoryRatings.visual', () => expect(a.categoryRatings.visual.couleurScore).toBe(8));
    it('reconstruit categoryRatings.smell', () => expect(a.categoryRatings.smell.intensiteAromeScore).toBe(8));
    it('reconstruit categoryRatings.effects', () => expect(a.categoryRatings.effects.monteeScore).toBe(9));
    it('déduit cultivar <- variety', () => expect(a.cultivar).toBe('Purple Haze'));
});

describe('exportDataAdapter — chemin Orchard (noms formData)', () => {
    const b = buildExportReviewData(orchardFlower);

    it('conserve la note existante', () => expect(b.rating).toBe(7.9));
    it('reconstruit categoryRatings.visual depuis noms formData', () => expect(b.categoryRatings.visual.densiteVisuelle).toBe(8));
    it('reconstruit categoryRatings.effects depuis montee/intensiteEffet', () => {
        expect(b.categoryRatings.effects.monteeScore).toBe(9);
        expect(b.categoryRatings.effects.intensiteEffetScore).toBe(8);
    });
    it('reconstruit categoryRatings.taste depuis intensiteFumee', () => expect(b.categoryRatings.taste.intensiteGoutScore).toBe(8));
});

describe('exportDataAdapter — robustesse', () => {
    it('mémoïse par référence', () => {
        expect(buildExportReviewData(publicFlower)).toBe(buildExportReviewData(publicFlower));
    });
    it('tolère une entrée non-objet', () => {
        expect(buildExportReviewData(null)).toBe(null);
        expect(buildExportReviewData('x')).toBe('x');
    });
});

describe('fieldRegistry — intégrité', () => {
    it('a des clés uniques par type de produit', () => {
        for (const t of PRODUCT_TYPES) {
            const keys = getFieldRegistry(t).map((f) => f.key);
            expect(new Set(keys).size).toBe(keys.length);
        }
    });
    it('déclare des sources non vides pour chaque champ', () => {
        for (const f of getAllFields()) {
            expect(Array.isArray(f.sources) && f.sources.length > 0).toBe(true);
        }
    });
    it('chaque score porte une catégorie valide', () => {
        const cats = ['visual', 'smell', 'texture', 'taste', 'effects'];
        for (const f of getAllFields()) {
            if (f.type === 'score') expect(cats).toContain(f.cat);
        }
    });
});
