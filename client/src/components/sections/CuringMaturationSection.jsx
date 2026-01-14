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

    // Convertir les données du timeline
    const sidebarArray = useMemo(() => {
        const categories = {
            'Température': CURING_SIDEBAR_CONTENT.Temperature || [],
            'Humidité': CURING_SIDEBAR_CONTENT.Humidity || [],
            'Visuel': CURING_SIDEBAR_CONTENT.Visual || [],
            'Odeurs': CURING_SIDEBAR_CONTENT.Odors || [],
            'Goûts': CURING_SIDEBAR_CONTENT.Tastes || [],
            'Effets': CURING_SIDEBAR_CONTENT.Effects || []
        };
        return Object.entries(categories).map(([name, fields]) => ({
            name,
            fields: fields.map(field => ({
                id: field.id,
                label: field.label,
                type: field.type,
                icon: field.icon,
                unit: field.unit
            }))
        }));
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




