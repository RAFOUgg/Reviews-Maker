import { describe, it, expect } from 'vitest';
import { buildExportReviewData } from '../exportDataAdapter';
import { getAllFields, getFieldRegistry, getOverflowFields, PRODUCT_TYPES } from '../fieldRegistry';

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

// chemin Export Maker : formData normalisé (noms formData)
const exportMakerFlower = {
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

describe('exportDataAdapter — chemin Export Maker (noms formData)', () => {
    const b = buildExportReviewData(exportMakerFlower);

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

describe('fieldRegistry — getOverflowFields (évolutivité automatique)', () => {
    it('détecte un champ non réclamé par aucune entrée du registre', () => {
        const overflow = getOverflowFields({ type: 'flower', effetsFiltre: 'Oui' });
        expect(overflow.map((f) => f.key)).toContain('effetsFiltre');
    });
    it('n\'inclut jamais un champ déjà réclamé par une entrée curée', () => {
        const overflow = getOverflowFields({ type: 'flower', thcPercent: 22.5 });
        expect(overflow.map((f) => f.key)).not.toContain('thcPercent');
    });
    it('exclut les clés protégées et la plomberie pipeline/lien de compte', () => {
        const overflow = getOverflowFields({
            type: 'flower', id: 'r1', reviewId: 'r1', createdAt: '2026-01-01',
            cultureTimelineConfig: '{}', culturePipelineId: 'p1',
            farmLinkedUserId: 'u1', effetsFiltre: 'Oui',
        });
        const keys = overflow.map((f) => f.key);
        expect(keys).not.toContain('id');
        expect(keys).not.toContain('cultureTimelineConfig');
        expect(keys).not.toContain('culturePipelineId');
        expect(keys).not.toContain('farmLinkedUserId');
        expect(keys).toContain('effetsFiltre');
    });
    it('ignore les valeurs vides/objets imbriqués, dérive un libellé lisible', () => {
        const overflow = getOverflowFields({ type: 'flower', champTest: '', autreChamp: 'valeur', relationObj: { a: 1 } });
        const keys = overflow.map((f) => f.key);
        expect(keys).not.toContain('champTest');
        expect(keys).not.toContain('relationObj');
        const entry = overflow.find((f) => f.key === 'autreChamp');
        expect(entry.label).toBe('Autre champ');
    });
    it('retourne un tableau vide pour une entrée non-objet', () => {
        expect(getOverflowFields(null)).toEqual([]);
        expect(getOverflowFields('x')).toEqual([]);
    });
    it('exclut le bookkeeping Export Maker (isPrivate/isOurReview/exportMakerPreset/exportMakerLayoutMode)', () => {
        const overflow = getOverflowFields({
            type: 'flower', isPrivate: false, isOurReview: false,
            exportMakerPreset: 'detailedCard', exportMakerLayoutMode: 'template',
        });
        const keys = overflow.map((f) => f.key);
        expect(keys).not.toContain('isPrivate');
        expect(keys).not.toContain('isOurReview');
        expect(keys).not.toContain('exportMakerPreset');
        expect(keys).not.toContain('exportMakerLayoutMode');
    });
    it('exclut images/photos (galerie déjà gérée par mainImage)', () => {
        const overflow = getOverflowFields({
            type: 'flower',
            images: ['flower-1753612345-847362951.jpg', 'flower-1753612399-112233445.jpg'],
            photos: ['/images/hash-xyz.jpg'],
        });
        const keys = overflow.map((f) => f.key);
        expect(keys).not.toContain('images');
        expect(keys).not.toContain('photos');
    });
    it('rejette les noms de fichiers/jetons techniques même sous une clé inconnue', () => {
        const overflow = getOverflowFields({
            type: 'flower',
            uploadedFileName: 'flower-1753612345-847362951.jpg',
            internalToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
            realNote: 'Séché 14 jours en bocal, très aromatique',
        });
        const keys = overflow.map((f) => f.key);
        expect(keys).not.toContain('uploadedFileName');
        expect(keys).not.toContain('internalToken');
        expect(keys).toContain('realNote');
    });
});
