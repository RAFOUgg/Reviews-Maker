import { describe, it, expect } from 'vitest';
import { getSelectedImages } from '../exportMakerHelpers';

const review = { images: ['a.jpg', 'b.jpg', 'c.jpg'] };

describe('getSelectedImages — choisir les photos affichées', () => {
    it('affiche tout quand rien n’a été trié', () => {
        expect(getSelectedImages(review, {})).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
        expect(getSelectedImages(review, { image: {} })).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
        expect(getSelectedImages(review, { image: { selected: [] } })).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
    });

    it('ne garde que les photos retenues, dans l’ordre demandé', () => {
        expect(getSelectedImages(review, { image: { selected: [2, 0] } })).toEqual(['c.jpg', 'a.jpg']);
    });

    it('ignore un indice périmé sans perdre les autres', () => {
        // Une photo supprimée depuis le tri ne doit pas laisser un trou dans le rendu.
        expect(getSelectedImages(review, { image: { selected: [0, 9] } })).toEqual(['a.jpg']);
    });

    it('retombe sur toutes les photos si la sélection ne retient plus rien de valide', () => {
        // Sinon la fiche partirait SANS AUCUNE image, ce qui est pire que d’ignorer le tri.
        expect(getSelectedImages(review, { image: { selected: [7, 8] } })).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
    });

    it('gère une review sans photo', () => {
        expect(getSelectedImages({}, { image: { selected: [0] } })).toEqual([]);
        expect(getSelectedImages(null, {})).toEqual([]);
    });
});
