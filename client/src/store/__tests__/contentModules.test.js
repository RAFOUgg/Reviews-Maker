import { describe, it, expect, beforeEach } from 'vitest';
import { useExportMakerStore } from '../exportMakerStore';
import { isModuleOn } from '../../components/templates/sections/RegistrySections';

/**
 * Le panneau « Contenu » et le RENDU doivent s'accorder sur ce que « activé » veut dire.
 *
 * Le rendu applique `isModuleOn` (opt-out : affiché tant que la valeur n'est pas `false`), alors
 * que la bascule faisait `!valeur` — un champ ABSENT de la config était donc traité comme éteint et
 * passait à `true`, sans rien changer à l'écran puisqu'il s'y affichait déjà. Il fallait cliquer
 * DEUX fois pour masquer un champ. C'est ce que l'utilisateur décrivait par « les configurations du
 * rendu ne fonctionnent pas ».
 */
describe('contentModules — un clic doit suffire à masquer', () => {
    beforeEach(() => {
        useExportMakerStore.setState((s) => ({ config: { ...s.config, contentModules: {} } }));
    });

    it('un champ absent de la config est considéré AFFICHÉ par le rendu', () => {
        expect(isModuleOn(useExportMakerStore.getState().config.contentModules, 'champInconnu')).toBe(true);
    });

    it('une seule bascule le masque réellement', () => {
        useExportMakerStore.getState().toggleContentModule('champInconnu');
        const { contentModules } = useExportMakerStore.getState().config;
        expect(contentModules.champInconnu).toBe(false);
        expect(isModuleOn(contentModules, 'champInconnu')).toBe(false);
    });

    it('une seconde bascule le réaffiche', () => {
        const { toggleContentModule } = useExportMakerStore.getState();
        toggleContentModule('champInconnu');
        toggleContentModule('champInconnu');
        expect(isModuleOn(useExportMakerStore.getState().config.contentModules, 'champInconnu')).toBe(true);
    });

    it('masque aussi un champ explicitement activé', () => {
        useExportMakerStore.setState((s) => ({ config: { ...s.config, contentModules: { thc: true } } }));
        useExportMakerStore.getState().toggleContentModule('thc');
        expect(isModuleOn(useExportMakerStore.getState().config.contentModules, 'thc')).toBe(false);
    });
});
