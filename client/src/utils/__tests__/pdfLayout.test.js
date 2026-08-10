import { describe, it, expect } from 'vitest';
import { fitImageToPdfPage, PDF_MARGIN_MM } from '../pdfLayout';

// A4 en mm, tel que jsPDF le rend pour `format: 'a4'`.
const A4 = { w: 210, h: 297 };
// Le canevas A4 de l'app (RATIO_DIMENSIONS), capturé en pixelRatio 2.
const CANVAS_A4 = { w: 1754 * 2, h: 2480 * 2 };

describe('fitImageToPdfPage', () => {
    it('remplit la page entière quand le rendu a déjà son format', () => {
        const fit = fitImageToPdfPage(CANVAS_A4.w, CANVAS_A4.h, A4.w, A4.h);
        expect(fit.fullBleed).toBe(true);
        expect(fit.width).toBe(A4.w);
        expect(fit.height).toBe(A4.h);
        expect(fit.x).toBe(0);
        expect(fit.y).toBe(0);
    });

    it('récupère la surface que la marge parasite faisait perdre', () => {
        // Comportement d'avant : hauteur de page moins 20mm, largeur déduite du ratio.
        const avant = A4.h - PDF_MARGIN_MM;
        const fit = fitImageToPdfPage(CANVAS_A4.w, CANVAS_A4.h, A4.w, A4.h);
        expect(fit.height).toBeGreaterThan(avant);
        // ~6,7 % de hauteur regagnée sur A4 — la fiche cesse de flotter dans une double marge.
        expect((fit.height - avant) / avant).toBeGreaterThan(0.06);
    });

    it('garde la marge et centre quand les formats diffèrent — carte 16:9 sur une feuille A4', () => {
        const fit = fitImageToPdfPage(1920, 1080, A4.w, A4.h);
        expect(fit.fullBleed).toBe(false);
        expect(fit.width).toBe(A4.w - PDF_MARGIN_MM);
        expect(fit.height).toBeCloseTo((A4.w - PDF_MARGIN_MM) / (1920 / 1080), 6);
        // Centré verticalement, donc du blanc en haut ET en bas.
        expect(fit.y).toBeGreaterThan(0);
        expect(fit.x).toBeCloseTo(PDF_MARGIN_MM / 2, 6);
    });

    it('gère un rendu plus haut que la page (9:16 sur A4) sans déborder', () => {
        const fit = fitImageToPdfPage(1080, 1920, A4.w, A4.h);
        expect(fit.fullBleed).toBe(false);
        expect(fit.height).toBe(A4.h - PDF_MARGIN_MM);
        expect(fit.width).toBeLessThanOrEqual(A4.w);
        expect(fit.x).toBeGreaterThan(0);
    });

    it('tolère l’arrondi au pixel de la capture sans perdre le plein format', () => {
        // Une capture peut rendre 3507 au lieu de 3508 : le format reste « le même » et doit
        // continuer à remplir la page, sinon la marge réapparaîtrait au hasard des arrondis.
        const fit = fitImageToPdfPage(3507, 4960, A4.w, A4.h);
        expect(fit.fullBleed).toBe(true);
    });

    it('ne remplit PAS la page pour un carré, dont le format est franchement différent', () => {
        const fit = fitImageToPdfPage(800, 800, A4.w, A4.h);
        expect(fit.fullBleed).toBe(false);
    });
});
