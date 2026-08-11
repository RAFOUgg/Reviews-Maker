import { describe, it, expect } from 'vitest';
import { inferTimelineConfig, generatePipelineCells } from '../pipelineCellUtils';

/**
 * Cas réel (review « GMO », lue en base le 2026-08-11) : `cultureTimelineConfig` vaut `{}` alors que
 * `cultureTimelineData` porte 13 relevés `phase-0`…`phase-12`. Sans repli, `generatePipelineCells`
 * ne reconnaît aucun type d'intervalle et le pipeline Culture disparaît de TOUS les rendus.
 */
describe('inferTimelineConfig', () => {
    it('reconnaît une trame par phases depuis les relevés', () => {
        const data = Array.from({ length: 13 }, (_, i) => ({ timestamp: `phase-${i}`, temperature: 22 }));
        expect(inferTimelineConfig(data)).toEqual({ type: 'phases' });
        // Et surtout : la trame redevient génératrice de cases, ce qui est tout l'enjeu.
        expect(generatePipelineCells(inferTimelineConfig(data), 'culture').length).toBe(13);
    });

    it('reconnaît la forme héritée `legacy-phase-N` et le champ `phase`', () => {
        expect(inferTimelineConfig([{ timestamp: 'legacy-phase-2' }])).toEqual({ type: 'phases' });
        expect(inferTimelineConfig([{ timestamp: '3', phase: 'phase-1' }])).toEqual({ type: 'phases' });
    });

    it('déduit l’étendue des trames numérotées', () => {
        expect(inferTimelineConfig([{ timestamp: 'day-1' }, { timestamp: 'day-9' }])).toEqual({ type: 'jour', totalDays: 9 });
        expect(inferTimelineConfig([{ timestamp: 'week-3' }])).toEqual({ type: 'semaine', totalWeeks: 3 });
        expect(inferTimelineConfig([{ timestamp: 'month-4' }])).toEqual({ type: 'mois', totalMonths: 4 });
        expect(inferTimelineConfig([{ timestamp: 'year-2' }])).toEqual({ type: 'annee', totalYears: 2 });
    });

    it('borne une trame par dates sur les relevés extrêmes', () => {
        expect(inferTimelineConfig([{ timestamp: 'date-2026-04-03' }, { timestamp: 'date-2026-04-01' }]))
            .toEqual({ type: 'date', start: '2026-04-01', end: '2026-04-03' });
    });

    it('ne devine rien quand les relevés ne portent aucun repère', () => {
        expect(inferTimelineConfig([])).toBeNull();
        expect(inferTimelineConfig([{ temperature: 22 }])).toBeNull();
        expect(inferTimelineConfig(null)).toBeNull();
    });
});
