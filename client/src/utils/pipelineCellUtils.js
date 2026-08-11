/**
 * Génération des "cases" d'une timeline de pipeline (culture/curing/extraction/séparation/recipe)
 * à partir de sa config (timelineConfig: {type, start, end, duration, totalDays, ...}).
 *
 * Extrait de PipelineDragDropView.jsx (moteur d'édition drag-drop) pour être réutilisé
 * en lecture seule par PipelineMiniGrid.jsx (Export Maker) sans dupliquer la logique
 * des phases et du calcul d'intervalles.
 */
import { CURING_PHASES, SEPARATION_PHASES, EXTRACTION_PHASES, RECIPE_PHASES } from '../config/pipelinePhases';
import { resolveIntervalKey } from '../config/intervalTypes';

const DEFAULT_CULTURE_PHASES = [
    { id: 'phase-0', name: 'Graine (J0)', duration: 0, emoji: '🌰' },
    { id: 'phase-1', name: 'Germination', duration: 3, emoji: '🌱' },
    { id: 'phase-2', name: 'Plantule', duration: 7, emoji: '🌿' },
    { id: 'phase-3', name: 'Début Croissance', duration: 14, emoji: '🌳' },
    { id: 'phase-4', name: 'Milieu Croissance', duration: 14, emoji: '🌳' },
    { id: 'phase-5', name: 'Fin Croissance', duration: 7, emoji: '🌳' },
    { id: 'phase-6', name: 'Début Stretch', duration: 7, emoji: '🌲' },
    { id: 'phase-7', name: 'Milieu Stretch', duration: 7, emoji: '🌲' },
    { id: 'phase-8', name: 'Fin Stretch', duration: 7, emoji: '🌲' },
    { id: 'phase-9', name: 'Début Floraison', duration: 21, emoji: '🌸' },
    { id: 'phase-10', name: 'Milieu Floraison', duration: 21, emoji: '🌺' },
    { id: 'phase-11', name: 'Fin Floraison', duration: 14, emoji: '🏵️' },
    { id: 'phase-12', name: 'Récolte', duration: 1, emoji: '🌾' },
];

/**
 * @param {Object} timelineConfig - {type, start, end, totalSeconds, totalHours, totalDays, totalWeeks, totalMonths, totalYears, phases}
 * @param {string} type - 'culture' | 'curing' | 'separation' | 'extraction' | 'recipe'
 * @returns {Array<{id, timestamp, label, ...}>} Liste des cases générées
 */
export function generatePipelineCells(timelineConfig, type) {
    if (!timelineConfig) return [];
    const intervalType = resolveIntervalKey(timelineConfig.type) || timelineConfig.type;
    const { start, end, totalSeconds, totalHours, totalDays, totalWeeks } = timelineConfig;

    if (intervalType === 'seconde' && totalSeconds) {
        const count = Math.min(totalSeconds, 900);
        return Array.from({ length: count }, (_, i) => ({ id: `sec-${i}`, timestamp: `sec-${i}`, label: `${i}s`, seconds: i }));
    }

    if (intervalType === 'heure' && totalHours) {
        const count = Math.min(totalHours, 336);
        return Array.from({ length: count }, (_, i) => ({ id: `hour-${i}`, timestamp: `hour-${i}`, label: `${i}h`, hours: i }));
    }

    if (intervalType === 'jour' && totalDays) {
        const count = Math.min(totalDays, 365);
        return Array.from({ length: count }, (_, i) => ({ id: `day-${i + 1}`, timestamp: `day-${i + 1}`, label: `J${i + 1}`, day: i + 1 }));
    }

    if (intervalType === 'date' && start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate) || isNaN(endDate)) return [];
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const count = Math.min(days, 365);
        return Array.from({ length: count }, (_, i) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            return {
                id: `date-${dateStr}`, timestamp: `date-${dateStr}`,
                label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                date: dateStr, day: i + 1,
            };
        });
    }

    if (intervalType === 'semaine' && totalWeeks) {
        return Array.from({ length: totalWeeks }, (_, i) => ({ id: `week-${i + 1}`, timestamp: `week-${i + 1}`, label: `S${i + 1}`, week: i + 1 }));
    }

    if ((intervalType === 'mois' || intervalType === 'months') && timelineConfig.totalMonths) {
        const count = Math.min(timelineConfig.totalMonths || 0, 120);
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const startIdx = (Number(timelineConfig.startMonth) && timelineConfig.startMonth >= 1 && timelineConfig.startMonth <= 12) ? (Number(timelineConfig.startMonth) - 1) : 0;
        return Array.from({ length: count }, (_, i) => ({
            id: `month-${i + 1}`, timestamp: `month-${i + 1}`,
            label: months[(startIdx + i) % 12] || `M${i + 1}`, month: ((startIdx + i) % 12) + 1,
        }));
    }

    if ((intervalType === 'annee' || intervalType === 'years') && timelineConfig.totalYears) {
        const count = Math.min(timelineConfig.totalYears || 0, 100);
        return Array.from({ length: count }, (_, i) => ({ id: `year-${i + 1}`, timestamp: `year-${i + 1}`, label: `Y${i + 1}`, year: i + 1 }));
    }

    if (intervalType === 'phases') {
        let defaultPhases;
        switch (type) {
            case 'curing':
                defaultPhases = (timelineConfig.phases?.length) ? timelineConfig.phases : (CURING_PHASES?.phases || []);
                break;
            case 'separation':
                defaultPhases = (timelineConfig.phases?.length) ? timelineConfig.phases : (SEPARATION_PHASES?.phases || []);
                break;
            case 'extraction':
                defaultPhases = (timelineConfig.phases?.length) ? timelineConfig.phases : (EXTRACTION_PHASES?.phases || []);
                break;
            case 'recipe':
                defaultPhases = (timelineConfig.phases?.length) ? timelineConfig.phases : (RECIPE_PHASES?.phases || []);
                break;
            default:
                defaultPhases = (timelineConfig.phases?.length) ? timelineConfig.phases : DEFAULT_CULTURE_PHASES;
        }

        return defaultPhases.map((phase, i) => {
            const phaseId = phase.id || `phase-${i}`;
            return {
                id: phaseId, timestamp: phaseId,
                label: phase.label || phase.name || `Phase ${i + 1}`,
                phase, phaseId, duration: phase.duration || 7, emoji: phase.emoji || '🌿',
            };
        });
    }

    return [];
}

export default generatePipelineCells;

/**
 * Reconstitue une config de trame à partir des DONNÉES quand la config enregistrée est inutilisable.
 *
 * Constaté le 2026-08-11 sur une review réelle : `cultureTimelineConfig` valait `{}` (2 caractères)
 * alors que `cultureTimelineData` en portait 3137 et 25 relevés. `generatePipelineCells({})` ne
 * reconnaît aucun type d'intervalle, renvoie zéro case, et le pipeline Culture disparaissait
 * ENTIÈREMENT de tous les rendus — « je vois pas les bonnes pipelines ». Perdre des données réelles
 * parce qu'une métadonnée manque est le défaut que `getOverflowFields` avait déjà écarté ailleurs :
 * même principe ici.
 *
 * On n'invente rien : chaque relevé porte déjà le vocabulaire de sa trame dans son `timestamp`
 * (`phase-2`, `day-7`, `week-3`, `date-2026-04-01`…), écrit par l'éditeur de pipeline lui-même.
 * On le lit, on en déduit le type et l'étendue.
 *
 * @returns {Object|null} une config utilisable par `generatePipelineCells`, ou null si indéterminable
 */
export function inferTimelineConfig(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return null;
    const marqueurs = entries
        .flatMap((e) => [e?.phase, e?.timestamp])
        .filter((v) => typeof v === 'string' && v.length > 0);
    if (marqueurs.length === 0) return null;

    // Les phases d'abord : `phase-N` et `legacy-phase-N` sont les deux formes écrites par l'éditeur.
    if (marqueurs.some((m) => /^(legacy-)?phase-\d+$/.test(m))) return { type: 'phases' };

    // Comparaison de chaînes plutôt qu'une regex construite dans un gabarit : `\d` y est un
    // échappement inconnu que JS réduit à `d`, la regex devenait `^day-(d+)$` et ne matchait
    // jamais (défaut attrapé par le test unitaire, pas par la relecture).
    const maxDe = (prefixe) => marqueurs.reduce((max, m) => {
        if (!m.startsWith(`${prefixe}-`)) return max;
        const reste = m.slice(prefixe.length + 1);
        return /^[0-9]+$/.test(reste) ? Math.max(max, Number(reste)) : max;
    }, 0);

    const jours = maxDe('day'); if (jours) return { type: 'jour', totalDays: jours };
    const semaines = maxDe('week'); if (semaines) return { type: 'semaine', totalWeeks: semaines };
    const heures = maxDe('hour'); if (heures) return { type: 'heure', totalHours: heures + 1 };
    const secondes = maxDe('sec'); if (secondes) return { type: 'seconde', totalSeconds: secondes + 1 };
    const mois = maxDe('month'); if (mois) return { type: 'mois', totalMonths: mois };
    const annees = maxDe('year'); if (annees) return { type: 'annee', totalYears: annees };

    const dates = marqueurs
        .map((m) => /^date-(\d{4}-\d{2}-\d{2})$/.exec(m)?.[1])
        .filter(Boolean)
        .sort();
    if (dates.length > 0) return { type: 'date', start: dates[0], end: dates[dates.length - 1] };

    return null;
}
