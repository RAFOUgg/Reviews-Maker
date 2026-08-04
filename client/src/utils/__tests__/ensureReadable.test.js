import { describe, it, expect } from 'vitest';
import { ensureReadable, contrastRatio, relativeLuminance } from '../exportMakerHelpers';

const PAPER = '#F8FAFC';
const DARK = '#0b1220';

describe('ensureReadable — garantie de contraste sans perte de teinte', () => {
    it('laisse intacte une couleur déjà conforme', () => {
        // violet-400 sur le fond sombre de l'app : 6.88:1, rien à corriger.
        expect(ensureReadable('#A78BFA', DARK)).toBe('#A78BFA');
    });

    it('corrige l\'accent illisible sur le papier', () => {
        // Le cas mesuré : accent de palette posé en texte sur crème → 2.48:1.
        const before = contrastRatio('#A78BFA', PAPER);
        expect(before).toBeLessThan(4.5);
        const after = ensureReadable('#A78BFA', PAPER);
        expect(contrastRatio(after, PAPER)).toBeGreaterThanOrEqual(4.5);
    });

    it('conserve la teinte : un accent violet reste violet', () => {
        const out = ensureReadable('#A78BFA', PAPER);
        const [r, g, b] = out.replace('#', '').match(/../g).map((h) => parseInt(h, 16));
        expect(b).toBeGreaterThan(r); // dominante bleue conservée
        expect(r).toBeGreaterThan(g); // rouge > vert, signature du violet
    });

    it('fonctionne dans les deux sens (fond clair et fond sombre)', () => {
        // Une couleur sombre sur fond sombre doit être ÉCLAIRCIE.
        const out = ensureReadable('#3A2A6B', DARK);
        expect(relativeLuminance(out)).toBeGreaterThan(relativeLuminance('#3A2A6B'));
        expect(contrastRatio(out, DARK)).toBeGreaterThanOrEqual(4.5);
    });

    it('respecte une cible de contraste personnalisée', () => {
        const out = ensureReadable('#A78BFA', PAPER, 7);
        expect(contrastRatio(out, PAPER)).toBeGreaterThanOrEqual(7);
    });

    it('ne lève pas sur une entrée invalide', () => {
        expect(ensureReadable('rgba(1,2,3,0.5)', PAPER)).toBe('rgba(1,2,3,0.5)');
        expect(ensureReadable(null, PAPER)).toBe(null);
    });
});
