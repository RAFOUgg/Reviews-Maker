/**
 * CuringMaturationSection - Section wrapper pour Pipeline Curing/Maturation
 * Architecture unifiée CDC - Rend directement PipelineDragDropView (NO legacy wrapper!)
 * Compatible tous types de produits (Fleurs, Hash, Concentrés, Comestibles)
 */

import { useMemo } from 'react';
import PipelineDragDropView from '../pipelines/views/PipelineDragDropView';
import { CURING_SIDEBAR_CONTENT } from '../../config/curingSidebarContent';

const CuringMaturationSection = ({ data = {}, onChange, productType = 'flower' }) => {
    // Construire la config timeline
    const timelineConfig = useMemo(() => ({
        type: data.curingTimelineConfig?.type || 'phase',
        mode: data.curingTimelineConfig?.mode || 'phases',
        startDate: data.curingTimelineConfig?.startDate || '',
        endDate: data.curingTimelineConfig?.endDate || '',
        duration: data.curingTimelineConfig?.duration || null,
        totalSeconds: data.curingTimelineConfig?.totalSeconds || null,
        curingType: data.curingType || 'cold',
        temperature: data.temperature || 5,
        humidity: data.humidity || 60
    }), [data]);

    // Convertir CURING_SIDEBAR_CONTENT vers format array pour le sidebar
    // Les clés sont: CONFIGURATION, CONTAINER, ENVIRONMENT, VISUAL, ORGANOLEPTIC, NOTES
    const sidebarArray = useMemo(() => {
        // Mapper les sections du fichier config vers des catégories utilisables
        return Object.entries(CURING_SIDEBAR_CONTENT).map(([key, section]) => ({
            name: section.label || key,
            icon: section.icon || '📦',
            color: section.color || 'gray',
            collapsed: section.collapsed ?? true,
            fields: (section.items || []).map(item => ({
                id: item.id,
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
        })).filter(section => section.fields.length > 0);
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

    // Handler pour changements de données de cellules
    const handleDataChange = (cellData) => {
        onChange({
            ...data,
            curingTimeline: cellData
        });
    };

    return (
        <PipelineDragDropView
            type="curing"
            sidebarContent={sidebarArray}
            timelineConfig={timelineConfig}
            timelineData={data.curingTimeline || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
        />
    );
};

export default CuringMaturationSection;




