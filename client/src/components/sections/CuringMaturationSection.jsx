/**
 * CuringMaturationSection - Section wrapper pour Pipeline Curing/Maturation
 * Architecture unifiée CDC - Rend directement PipelineDragDropView (NO legacy wrapper!)
 * Compatible tous types de produits (Fleurs, Hash, Concentrés, Comestibles)
 */

import { useMemo, useState, useEffect } from 'react';
import PipelineDragDropView from '../pipelines/views/PipelineDragDropView';
import { CURING_SIDEBAR_CONTENT } from '../../config/curingSidebarContent';
import { CURING_PHASES } from '../../config/pipelinePhases';

const CuringMaturationSection = ({ data = {}, onChange, productType = 'flower' }) => {
    // État local pour les données de timeline (tableau)
    const [timelineData, setTimelineData] = useState(() => {
        const initial = data.curingTimeline;
        return Array.isArray(initial) ? initial : [];
    });

    // Sync avec parent quand timelineData change
    useEffect(() => {
        if (!onChange) return;
        onChange({
            ...data,
            curingTimeline: timelineData
        });
    }, [timelineData, data]);
    // Construire la config timeline
    // DEFAULT: use 'phase' mode by default for all pipelines (system-wide default)
    const timelineConfig = useMemo(() => ({
        type: data.curingTimelineConfig?.type || 'phases',
        mode: data.curingTimelineConfig?.mode || 'phases',
        startDate: data.curingTimelineConfig?.startDate || '',
        endDate: data.curingTimelineConfig?.endDate || '',
        duration: data.curingTimelineConfig?.duration || null,
        // numeric timeline values
        totalSeconds: data.curingTimelineConfig?.totalSeconds || null,
        totalHours: data.curingTimelineConfig?.totalHours || null,
        totalDays: data.curingTimelineConfig?.totalDays || null,
        totalWeeks: data.curingTimelineConfig?.totalWeeks || null,
        totalMonths: data.curingTimelineConfig?.totalMonths || null,
        totalYears: data.curingTimelineConfig?.totalYears || null,
        startMonth: data.curingTimelineConfig?.startMonth || null,
        phases: (data.curingTimelineConfig?.phases && data.curingTimelineConfig.phases.length) ? data.curingTimelineConfig.phases : CURING_PHASES.phases,
        curingType: data.curingType || 'cold',
        temperature: data.temperature || 5,
        humidity: data.humidity || 60
    }), [data]);

    // Convertir CURING_SIDEBAR_CONTENT vers format array pour le sidebar
    // Les clés sont: CONFIGURATION, CONTAINER, ENVIRONMENT, VISUAL, ORGANOLEPTIC, NOTES
    // IMPORTANT: PipelineDragDropView attend: section.id, section.label, section.icon, section.items (PAS fields!)
    const sidebarArray = useMemo(() => {
        // Mapper les sections du fichier config vers des catégories utilisables
        return Object.entries(CURING_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key, // ID unique pour la section (ex: CONFIGURATION, CONTAINER...)
            label: section.label || key, // Libellé affiché
            icon: section.icon || '📦',
            color: section.color || 'gray',
            collapsed: section.collapsed ?? true,
            // ITEMS - pas fields! C'est ce que PipelineDragDropView attend
            items: (section.items || []).map(item => ({
                id: item.id,
                key: item.id, // key aussi pour compatibilité
                label: item.label,
                type: item.type,
                icon: item.icon,
                unit: item.unit,
                options: item.options,
                min: item.min,
                max: item.max,
                step: item.step,
                defaultValue: item.defaultValue,
                tooltip: item.tooltip,
                zones: item.zones
            }))
        })).filter(section => section.items.length > 0);
    }, []);

    // Handler pour changements de configuration
    const handleConfigChange = (key, value) => {
        const updatedConfig = {
            ...timelineConfig,
            [key]: value
        };
        onChange({
            ...data,
            curingTimelineConfig: updatedConfig,
            [key]: value // Aussi update les props directs (temperature, humidity, etc)
        });
    };

    // Handler pour réinitialiser la trame (supprime aussi les données de timeline)
    const handleClearTimeline = () => {
        setTimelineData([]);
        if (onChange) {
            onChange({
                ...data,
                curingTimelineConfig: {},
                curingTimeline: []
            });
        }
    };

    // Handler pour changements de données de cellules
    // onDataChange est appelé avec (timestamp, field, value)
    const handleDataChange = (timestamp, field, value) => {
        setTimelineData(prev => {
            const arr = Array.isArray(prev) ? [...prev] : [];
            const existingIdx = arr.findIndex(d => d.timestamp === timestamp);

            if (existingIdx >= 0) {
                // Mise à jour d'une cellule existante
                const existing = { ...arr[existingIdx] };
                if (value === null || value === undefined) {
                    delete existing[field];
                } else {
                    existing[field] = value;
                }
                arr[existingIdx] = existing;
            } else {
                // Nouvelle cellule
                arr.push({ timestamp, [field]: value });
            }

            return arr;
        });
    };

    return (
        <PipelineDragDropView
            type="curing"
            sidebarContent={sidebarArray}
            timelineConfig={timelineConfig}
            timelineData={timelineData}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
            onClearTimeline={handleClearTimeline}
        />
    );
};

export default CuringMaturationSection;




