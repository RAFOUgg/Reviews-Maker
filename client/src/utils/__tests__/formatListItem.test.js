import { describe, it, expect } from 'vitest';
import { formatListItem } from '../formatListItem';

describe('formatListItem — plus jamais de JSON dans une fiche', () => {
    it('rend le nuancier de couleur en clair', () => {
        // Forme réelle relevée sur une review de production (ColorWheelPicker).
        const item = { colorId: 'purple', percentage: 47, parts: [{ partId: 'stems', percent: 100 }] };
        expect(formatListItem(item)).toBe('Violet 47 % · Tiges');
    });

    it('accepte aussi la forme `id` du sélecteur non-fleur', () => {
        expect(formatListItem({ id: 'yellow', percentage: 53 })).toBe('Jaune 53 %');
    });

    it('préfère un nom explicite quand il existe', () => {
        expect(formatListItem({ name: 'Diesel', percentage: 10 })).toBe('Diesel');
    });

    it('résume un objet inconnu sans jamais sérialiser', () => {
        const out = formatListItem({ intensite: 4, duree: '2h' });
        expect(out).not.toMatch(/[{}[\]"]/);
        expect(out).toContain('4');
        expect(out).toContain('2h');
    });

    it('ne renvoie jamais de JSON, même sur un objet entièrement imbriqué', () => {
        const out = formatListItem({ meta: { a: 1 }, autre: { b: 2 } });
        expect(out).not.toContain('{');
        expect(out).toMatch(/propriété/);
    });

    it('laisse les valeurs simples intactes', () => {
        expect(formatListItem('floral-hibiscus')).toBe('floral-hibiscus');
        expect(formatListItem(42)).toBe('42');
    });
});
