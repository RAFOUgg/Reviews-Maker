import { describe, it, expect } from 'vitest';
import { getImageRenderStyle, IMAGE_FILTER_CSS, getSelectedImages } from '../exportMakerHelpers';

/**
 * Les réglages photo de l'onglet « Image & Logo » n'étaient lus par AUCUN template : quatre filtres
 * et un curseur d'opacité qui ne changeaient rien au rendu (signalé le 2026-08-11). Ces tests
 * fixent le contrat de la traduction CSS, désormais partagée par les cinq templates.
 */
describe('getImageRenderStyle', () => {
    it('ne produit aucun style quand rien n’est réglé', () => {
        expect(getImageRenderStyle({ filter: 'none', opacity: 1 })).toEqual({});
        expect(getImageRenderStyle(undefined)).toEqual({});
    });

    it('traduit chaque filtre proposé par le panneau', () => {
        // Si un filtre est offert dans l'UI sans traduction ici, il est silencieusement inerte —
        // exactement le défaut corrigé. Le test échoue donc si la table se désynchronise.
        for (const id of ['sepia', 'grayscale', 'blur']) {
            expect(getImageRenderStyle({ filter: id }).filter).toBe(IMAGE_FILTER_CSS[id]);
        }
    });

    it('n’applique l’opacité que lorsqu’elle réduit vraiment l’image', () => {
        expect(getImageRenderStyle({ opacity: 0.4 })).toEqual({ opacity: 0.4 });
        expect(getImageRenderStyle({ opacity: 1 }).opacity).toBeUndefined();
    });

    it('ignore un filtre inconnu plutôt que de produire un CSS invalide', () => {
        expect(getImageRenderStyle({ filter: 'kaleidoscope' })).toEqual({});
    });
});

describe('getSelectedImages', () => {
    const review = { images: ['a.png', 'b.png', 'c.png'] };

    it('retient toutes les photos tant que rien n’est coché', () => {
        expect(getSelectedImages(review, { image: {} })).toHaveLength(3);
        expect(getSelectedImages(review, { image: { selected: [] } })).toHaveLength(3);
    });

    it('retient exactement la sélection', () => {
        expect(getSelectedImages(review, { image: { selected: [0, 2] } })).toEqual(['a.png', 'c.png']);
    });

    it('ne vide jamais la fiche sur une sélection périmée', () => {
        // Indices pointant sur des photos supprimées depuis : retomber sur l'ensemble plutôt que
        // sur une fiche sans image.
        expect(getSelectedImages(review, { image: { selected: [7, 8] } })).toHaveLength(3);
    });
});
