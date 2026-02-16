/**
 * CulturePipelineSection - Section wrapper pour Pipeline Culture
 * Architecture unifiée CDC - Rend directement PipelineDragDropView
 * Compatible avec le système de drag & drop unifié (même pattern que CuringMaturationSection)
 */

import { useMemo, useState, useEffect } from 'react';
import PipelineDragDropView from '../../../../components/pipelines/views/PipelineDragDropView';
import { CULTURE_SIDEBAR_CONTENT } from '../../../../config/cultureSidebarContent';

const CulturePipelineSection = ({ data = {}, onChange, formData, handleChange }) => {
    // Support des deux patterns d'appel
    const cultureData = data || formData?.culture || {};

    // État local pour les données de timeline (tableau)
    const [timelineData, setTimelineData] = useState(() => {
        const initial = cultureData.cultureTimeline;
        return Array.isArray(initial) ? initial : [];
    });

    // Sync avec parent quand timelineData change
    useEffect(() => {
        handleUpdate({
            ...cultureData,
            cultureTimeline: timelineData
        });
    }, [timelineData]);

    // Handler unifié
    const handleUpdate = (newData) => {
        if (typeof onChange === 'function') {
            onChange(newData);
        } else if (typeof handleChange === 'function') {
            handleChange('culture', newData);
        }
    };

    // Construire la config timeline
    // IMPORTANT: type='phase' par défaut pour générer les 12 phases de culture
    const timelineConfig = useMemo(() => ({
        type: cultureData.cultureTimelineConfig?.type || 'phases',
        mode: cultureData.cultureTimelineConfig?.mode || 'phases',
        startDate: cultureData.cultureTimelineConfig?.startDate || '',
        endDate: cultureData.cultureTimelineConfig?.endDate || '',
        duration: cultureData.cultureTimelineConfig?.duration || null,
        // numeric timeline values (enable days/weeks/months/years inputs)
        totalSeconds: cultureData.cultureTimelineConfig?.totalSeconds || null,
        totalHours: cultureData.cultureTimelineConfig?.totalHours || null,
        totalDays: cultureData.cultureTimelineConfig?.totalDays || null,
        totalWeeks: cultureData.cultureTimelineConfig?.totalWeeks || null,
        totalMonths: cultureData.cultureTimelineConfig?.totalMonths || null,
        totalYears: cultureData.cultureTimelineConfig?.totalYears || null,
        // startMonth for month-mode (1..12)
        startMonth: cultureData.cultureTimelineConfig?.startMonth || 1,
        // Valeurs par défaut pour culture
        cultureMode: cultureData.cultureMode || 'indoor',
        propagation: cultureData.propagation || 'seed'
    }), [cultureData]);

    // Convertir CULTURE_SIDEBAR_CONTENT vers format array pour le sidebar
    // IMPORTANT: PipelineDragDropView attend: section.id, section.label, section.icon, section.items
    const sidebarArray = useMemo(() => {
        return Object.entries(CULTURE_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            label: section.label || key,
            icon: section.icon || '📦',
            color: section.color || 'gray',
            collapsed: section.collapsed ?? true,
            items: (section.items || []).map(item => ({
                id: item.id,
                key: item.id,
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
                zones: item.zones,
                dependsOn: item.dependsOn,
                showIf: item.showIf,
                computeFrom: item.computeFrom,
                computeFn: item.computeFn
            }))
        })).filter(section => section.items && section.items.length > 0);
    }, []);

    // Handler pour changements de configuration
    const handleConfigChange = (key, value) => {
        const updatedConfig = {
            ...timelineConfig,
            [key]: value
        };
        handleUpdate({
            ...cultureData,
            cultureTimelineConfig: updatedConfig,
            [key]: value
        });
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
            type="culture"
            sidebarContent={sidebarArray}
            timelineConfig={timelineConfig}
            timelineData={timelineData}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
        />
    );
};

export default CulturePipelineSection;
