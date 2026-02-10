import { getOptionsForPipeline, resolveIntervalKey, INTERVAL_TYPES_CONFIG } from '../../client/src/config/intervalTypes';

describe('Interval Types config', () => {
    test('culture pipeline options contain expected keys', () => {
        const opts = getOptionsForPipeline('culture');
        const keys = opts.map(o => o.key);
        expect(keys).toEqual(expect.arrayContaining(['phases', 'jour', 'semaine', 'mois', 'annee']));
    });

    test('resolveIntervalKey maps aliases correctly', () => {
        expect(resolveIntervalKey('months')).toBe('mois');
        expect(resolveIntervalKey('days')).toBe('jour');
        expect(resolveIntervalKey('phases')).toBe('phases');
        expect(resolveIntervalKey('seconds')).toBe('seconde');
    });

    test('INTERVAL_TYPES_CONFIG has sensible entries', () => {
        expect(INTERVAL_TYPES_CONFIG['mois']).toBeDefined();
        expect(INTERVAL_TYPES_CONFIG['mois'].max).toBeGreaterThanOrEqual(12);
        expect(INTERVAL_TYPES_CONFIG['phases'].isPredefined).toBeTruthy();
    });
});