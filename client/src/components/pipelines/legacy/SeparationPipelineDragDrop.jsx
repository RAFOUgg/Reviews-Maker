/**
 * SeparationPipelineDragDrop.jsx
 * 
 * LEGACY WRAPPER UNIFIÉ pour Pipeline Séparation (Hash)
 * Adaptateur simplifié entre SeparationPipelineSection et PipelineDragDropView
 * 
 * Architecture:
 * SeparationPipelineSection (data) 
 *   → SeparationPipelineDragDrop (config + sidebar) 
 *     → PipelineDragDropView (render unifié)
 */

import { useMemo } from 'react';
import PipelineDragDropView from '../views/PipelineDragDropView';
import { SEPARATION_SIDEBAR_CONTENT } from '../../../config/separationSidebarContent';
import { SEPARATION_PHASES } from '../../../config/pipelinePhases';

const SeparationPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    // Convertir SEPARATION_SIDEBAR_CONTENT (objet) vers format array pour PipelineDragDropView
    const sidebarArray = useMemo(() => {
        return Object.entries(SEPARATION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'cyan',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Configurer les phases si nécessaire
    const configWithDefaults = useMemo(() => {
        const finalType = timelineConfig.type || initialData.type || 'custom';
        return {
            type: finalType,
            ...timelineConfig,
            ...(finalType === 'phase' && SEPARATION_PHASES ? { phases: SEPARATION_PHASES } : {})
        };
    }, [timelineConfig, initialData])

    return (
        <PipelineDragDropView
            type="separation"
            sidebarContent={sidebarArray}
            timelineConfig={configWithDefaults}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
        />
    );
};

export default SeparationPipelineDragDrop;




