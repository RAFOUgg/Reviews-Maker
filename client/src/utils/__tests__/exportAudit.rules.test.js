import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// L'auditeur est un script auto-suffisant (pas un module ESM) : il doit tourner tel quel injecté
// dans un navigateur. On l'évalue ici de la même façon que Playwright l'injectera — c'est donc la
// MÊME implémentation qui est testée et exécutée, pas une copie.
let A;
beforeAll(() => {
    const src = readFileSync(resolve(__dirname, '../../../../tools/export-audit/auditRules.js'), 'utf8');
    // eslint-disable-next-line no-new-func
    new Function(src)();
    A = globalThis.__exportAudit;
});

describe('auditRules — helpers purs', () => {
    it('expose l\'API attendue', () => {
        expect(typeof A.auditRender).toBe('function');
        expect(typeof A.summarize).toBe('function');
    });

    describe('parseColor', () => {
        it('parse rgb et rgba', () => {
            expect(A.parseColor('rgb(139, 92, 246)')).toEqual({ r: 139, g: 92, b: 246, a: 1 });
            expect(A.parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
        });
        it('traite transparent et les valeurs illisibles', () => {
            expect(A.parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
            expect(A.parseColor('')).toBeNull();
            expect(A.parseColor('url(x)')).toBeNull();
        });
    });

    describe('contrastRatio', () => {
        const white = { r: 255, g: 255, b: 255 };
        const black = { r: 0, g: 0, b: 0 };

        it('donne 21:1 entre noir et blanc', () => {
            expect(A.contrastRatio(white, black)).toBeCloseTo(21, 1);
        });
        it('est symétrique', () => {
            expect(A.contrastRatio(white, black)).toBeCloseTo(A.contrastRatio(black, white), 6);
        });
        it('retrouve les valeurs mesurées sur la DA du site', () => {
            const bg = { r: 11, g: 18, b: 32 };        // #0b1220
            const violet500 = { r: 139, g: 92, b: 246 }; // #8B5CF6 — échoue AA en texte
            const violet400 = { r: 167, g: 139, b: 250 }; // #A78BFA — conforme
            expect(A.contrastRatio(violet500, bg)).toBeCloseTo(4.42, 1);
            expect(A.contrastRatio(violet400, bg)).toBeCloseTo(6.88, 1);
        });
    });

    describe('requiredContrast', () => {
        it('exige 4.5:1 sur du texte courant', () => {
            expect(A.requiredContrast(14, 400)).toBe(4.5);
            expect(A.requiredContrast(18, 400)).toBe(4.5);
        });
        it('tolère 3:1 sur du grand texte (règle WCAG, pas une tolérance maison)', () => {
            expect(A.requiredContrast(24, 400)).toBe(3);
            expect(A.requiredContrast(19, 700)).toBe(3);
        });
        it('ne relâche pas le seuil pour du gras trop petit', () => {
            expect(A.requiredContrast(16, 700)).toBe(4.5);
        });
    });

    describe('composite', () => {
        it('résout une couche semi-transparente sur un fond opaque', () => {
            const r = A.composite({ r: 255, g: 255, b: 255, a: 0.5 }, { r: 0, g: 0, b: 0, a: 1 });
            expect(r.r).toBeCloseTo(127.5, 1);
            expect(r.a).toBe(1);
        });
        it('laisse le fond inchangé si la couche est totalement transparente', () => {
            const under = { r: 10, g: 20, b: 30, a: 1 };
            const r = A.composite({ r: 255, g: 0, b: 0, a: 0 }, under);
            expect(r.r).toBeCloseTo(10, 6);
        });
    });

    describe('compositeStack — régression du faux contraste 1.48:1', () => {
        const dark = { r: 11, g: 18, b: 32, a: 1 }; // #0b1220, fond réel de l'app

        it('empile deux couches translucides SUR le fond, sans le masquer', () => {
            // Cas réel relevé sur la Fiche Technique : rgba(255,255,255,0.05) puis 0.07 au-dessus
            // de #0b1220. Compositer au fil de la remontée rendait un blanc opaque et faisait
            // remonter 1.48:1 sur du texte réellement lisible.
            const out = A.compositeStack(
                [{ r: 255, g: 255, b: 255, a: 0.05 }, { r: 255, g: 255, b: 255, a: 0.07 }],
                dark
            );
            expect(out.r).toBeLessThan(50);
            expect(out.g).toBeLessThan(60);
            const ratio = A.contrastRatio({ r: 203, g: 213, b: 225 }, out); // #CBD5E1
            expect(ratio).toBeGreaterThan(9);
        });

        it('sans couche, rend le fond inchangé', () => {
            expect(A.compositeStack([], dark)).toEqual(dark);
        });

        it('une couche opaque masque bien le fond', () => {
            const out = A.compositeStack([{ r: 255, g: 255, b: 255, a: 1 }], dark);
            expect(out.r).toBeCloseTo(255, 0);
        });
    });

    describe('isOnSpacingScale', () => {
        it('accepte les multiples de 4 et zéro', () => {
            [0, 4, 8, 12, 16, 24, 48].forEach((v) => expect(A.isOnSpacingScale(v)).toBe(true));
        });
        it('rejette les valeurs hors échelle', () => {
            [3, 5, 7, 13, 22].forEach((v) => expect(A.isOnSpacingScale(v)).toBe(false));
        });
        it('tolère l\'arrondi sous-pixel du navigateur', () => {
            expect(A.isOnSpacingScale(11.996)).toBe(true);
            expect(A.isOnSpacingScale(12.004)).toBe(true);
        });
    });

    describe('charsPerLine', () => {
        it('estime la longueur de ligne', () => {
            // 300 caractères sur 5 lignes de 20px
            expect(A.charsPerLine(300, 100, 20)).toBeCloseTo(60, 1);
        });
        it('ne divise jamais par zéro', () => {
            expect(A.charsPerLine(300, 100, 0)).toBeNull();
            expect(A.charsPerLine(0, 100, 20)).toBeNull();
        });
    });

    describe('summarize', () => {
        it('agrège par règle et trie les erreurs en premier', () => {
            const out = A.summarize([
                { rule: 'S1', severity: 'warn', message: 'a' },
                { rule: 'E1', severity: 'error', message: 'b' },
                { rule: 'E1', severity: 'error', message: 'c' },
            ]);
            expect(out[0].rule).toBe('E1');
            expect(out[0].error).toBe(2);
            expect(out[1].rule).toBe('S1');
        });
    });
});
