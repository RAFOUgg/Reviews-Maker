import { describe, it, expect } from 'vitest';
import { detectPipelineConstants } from '../chainCellPipelines';

// Étapes de culture réalistes : `temperature`/`humidity`/`co2Ppm` sont les clés réellement
// produites par le formulaire (résolues via LEGACY_CULTURE_FIELD_ALIASES dans summarizeCellFields).
const step = (over = {}) => ({ temperature: 24, humidity: 68, co2Ppm: 888, ...over });

describe('detectPipelineConstants', () => {
    it('remonte en constante un champ identique sur toutes les étapes', () => {
        const steps = Array.from({ length: 20 }, () => step());
        const { constants, constantKeysByStep } = detectPipelineConstants('culture', steps);

        const keys = constants.map((c) => c.key).sort();
        expect(keys).toEqual(['co2Ppm', 'humidity', 'temperature']);

        // Le libellé et l'unité viennent de la config du formulaire, pas d'une invention locale.
        const temp = constants.find((c) => c.key === 'temperature');
        expect(temp.label).toBe('Température');
        expect(temp.value).toBe('24 °C');

        // Chaque étape masque les 3 champs : plus aucune répétition dans le détail.
        expect(constantKeysByStep).toHaveLength(20);
        constantKeysByStep.forEach((hidden) => expect(hidden.size).toBe(3));
    });

    it("garde le champ visible sur l'étape qui diverge, sans casser la bannière", () => {
        // 19 étapes à 24 °C, 1 à 26 °C → 95% ≥ seuil 80%, la constante tient.
        const steps = Array.from({ length: 20 }, (_, i) => step(i === 7 ? { temperature: 26 } : {}));
        const { constants, constantKeysByStep } = detectPipelineConstants('culture', steps);

        expect(constants.find((c) => c.key === 'temperature').value).toBe('24 °C');
        // L'étape divergente conserve `temperature` — c'est son delta, l'information utile.
        expect(constantKeysByStep[7].has('temperature')).toBe(false);
        expect(constantKeysByStep[7].has('humidity')).toBe(true);
        expect(constantKeysByStep[0].has('temperature')).toBe(true);
    });

    it('ne remonte pas un champ qui varie trop souvent', () => {
        // temperature change à chaque étape → aucune valeur ne domine à 80%.
        const steps = Array.from({ length: 10 }, (_, i) => step({ temperature: 20 + i }));
        const { constants } = detectPipelineConstants('culture', steps);

        expect(constants.map((c) => c.key)).not.toContain('temperature');
        // Les autres champs restent bien détectés.
        expect(constants.map((c) => c.key).sort()).toEqual(['co2Ppm', 'humidity']);
    });

    it('ne détecte rien sous 3 étapes — "constant" n\'y a pas de sens', () => {
        const { constants, constantKeysByStep } = detectPipelineConstants('culture', [step(), step()]);
        expect(constants).toEqual([]);
        expect(constantKeysByStep).toHaveLength(2);
        constantKeysByStep.forEach((hidden) => expect(hidden.size).toBe(0));
    });

    it('ne remonte jamais une note, même identique partout', () => {
        const steps = Array.from({ length: 10 }, () => step({ note: 'RAS' }));
        const { constants, constantKeysByStep } = detectPipelineConstants('culture', steps);

        expect(constants.map((c) => c.key)).not.toContain('note');
        constantKeysByStep.forEach((hidden) => expect(hidden.has('note')).toBe(false));
    });

    it('ignore les étapes qui ne renseignent pas le champ plutôt que de le disqualifier', () => {
        // co2Ppm n'est renseigné que sur 4 étapes sur 12, mais y est toujours identique.
        const steps = Array.from({ length: 12 }, (_, i) => {
            const s = step();
            if (i % 3 !== 0) delete s.co2Ppm;
            return s;
        });
        const { constants } = detectPipelineConstants('culture', steps);
        expect(constants.map((c) => c.key)).toContain('co2Ppm');
    });

    it('tolère une entrée vide ou non-tableau sans lever', () => {
        expect(detectPipelineConstants('culture', []).constants).toEqual([]);
        expect(detectPipelineConstants('culture', null).constants).toEqual([]);
        expect(detectPipelineConstants('culture', undefined).constantKeysByStep).toEqual([]);
    });
});
