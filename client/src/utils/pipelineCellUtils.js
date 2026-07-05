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
