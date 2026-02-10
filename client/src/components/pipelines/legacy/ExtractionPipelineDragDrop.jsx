/**
 * ExtractionPipelineDragDrop.jsx
 * 
 * LEGACY WRAPPER pour Pipeline Extraction (Concentrés)
 * Adaptateur entre ExtractionPipelineSection et PipelineDragDropView
 * 
 * Architecture:
 * ExtractionPipelineSection (data) 
 *   → ExtractionPipelineDragDrop (config + sidebar) 
 *     → PipelineDragDropView (render unifié)
 */

import { useMemo } from 'react';
import PipelineDragDropView from '../views/PipelineDragDropView';
import { EXTRACTION_SIDEBAR_CONTENT } from '../../../config/extractionSidebarContent';
import { EXTRACTION_PHASES } from '../../../config/pipelinePhases';

const ExtractionPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    // Convertir EXTRACTION_SIDEBAR_CONTENT (objet) vers format array pour PipelineDragDropView
    const sidebarArray = useMemo(() => {
        return Object.entries(EXTRACTION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'purple',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Configurer les phases si nécessaire
    const configWithDefaults = useMemo(() => {
        const finalType = timelineConfig.type || initialData.type || 'phase';
        return {
            type: finalType,
            ...timelineConfig,
            ...(finalType === 'phase' && EXTRACTION_PHASES ? { phases: EXTRACTION_PHASES.phases } : {})
        };
    }, [timelineConfig, initialData])

    return (
        <PipelineDragDropView
            type="extraction"
            sidebarContent={sidebarArray}
            timelineConfig={configWithDefaults}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
        />
    );
};

export default ExtractionPipelineDragDrop;
