import { describe, it, expect } from 'vitest';
import { ensureReadable, contrastRatio, relativeLuminance, blendOver, getFormatLayout } from '../exportMakerHelpers';

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

describe('blendOver — surface teintée', () => {
    it('aplatit une couche partiellement opaque sur un fond', () => {
        // Un chip d'arôme : accent violet à 12 % au-dessus du papier crème.
        const out = blendOver('#A78BFA', '#F8FAFC', 12);
        // Résultat entre les deux, beaucoup plus proche du fond.
        expect(relativeLuminance(out)).toBeLessThan(relativeLuminance('#F8FAFC'));
        expect(relativeLuminance(out)).toBeGreaterThan(relativeLuminance('#A78BFA'));
    });

    it('à 0 % rend le fond, à 100 % rend la couleur', () => {
        expect(blendOver('#A78BFA', '#F8FAFC', 0).toLowerCase()).toBe('#f8fafc');
        expect(blendOver('#A78BFA', '#F8FAFC', 100).toLowerCase()).toBe('#a78bfa');
    });

    it('change réellement le verdict de contraste', () => {
        // C'est tout l'intérêt : juger sur le fond de page donnait un faux "conforme".
        const chip = blendOver('#A78BFA', '#F8FAFC', 12);
        const onPage = ensureReadable('#A78BFA', '#F8FAFC', 4.6);
        expect(contrastRatio(onPage, chip)).toBeLessThan(contrastRatio(onPage, '#F8FAFC'));
    });

    it('tolère une entrée non hex', () => {
        expect(blendOver('rgba(1,2,3,1)', '#F8FAFC', 12)).toBe('#F8FAFC');
    });
});

describe('FORMAT_LAYOUT — source unique de mise en page par format', () => {
    it('couvre les 5 formats réels', () => {
        ['1:1', '16:9', '9:16', '4:3', 'A4'].forEach((r) => {
            expect(getFormatLayout(r)).toBeDefined();
            expect(getFormatLayout(r).imageShare).toBeGreaterThan(0);
        });
    });

    it('exprime l\'image en PART du canevas, pas en pixels', () => {
        // C'est le point : 500px valaient 62 % d'un carré et 20 % d'un A4. Une part garde la
        // même allure d'un format à l'autre.
        ['1:1', '16:9', '9:16', '4:3', 'A4'].forEach((r) => {
            expect(getFormatLayout(r).imageShare).toBeLessThan(1);
        });
    });

    it('réserve la moins grande part à l\'A4 — un document reste du texte', () => {
        const a4 = getFormatLayout('A4').imageShare;
        ['1:1', '16:9', '9:16', '4:3'].forEach((r) => {
            expect(a4).toBeLessThan(getFormatLayout(r).imageShare);
        });
    });

    it('prévoit deux colonnes partout sauf en portrait', () => {
        expect(getFormatLayout('16:9').columns).toBe(2);
        expect(getFormatLayout('4:3').columns).toBe(2);
        expect(getFormatLayout('9:16').columns).toBe(1);
        // A4 est passé de 1 à 2 colonnes le 2026-08-05. Ce test figeait la décision inverse :
        // 1754px de large en une colonne produisaient des lignes de ~175 caractères (mesuré,
        // règle E5 ; la cible typographique est 45-90) et laissaient les dernières pages à
        // moitié vides. Le portrait reste la seule exception — il n'a pas la largeur pour deux.
        expect(getFormatLayout('A4').columns).toBe(2);
    });

    it('retombe sur le carré pour un ratio inconnu', () => {
        expect(getFormatLayout('7:3')).toEqual(getFormatLayout('1:1'));
    });
});
