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

import React from 'react';
import PipelineDragDropView from '../PipelineDragDropView';
import { EXTRACTION_SIDEBAR_CONTENT } from '../../../config/extractionSidebarContent';
import { EXTRACTION_PHASES } from '../../../config/pipelinePhases';

const ExtractionPipelineDragDrop = ({
    timelineData,
    onConfigChange,
    onDataChange
}) => {
    return (
        <PipelineDragDropView
            type="extraction"
            pipelineType="extraction"
            title="Pipeline Extraction Concentrés"
            description="Traçabilité complète du processus d'extraction et purification"
            sidebarContent={EXTRACTION_SIDEBAR_CONTENT}
            phases={EXTRACTION_PHASES}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
            defaultIntervalType="minutes"
            supportedIntervalTypes={['seconds', 'minutes', 'hours']}
            icon="⚗️"
            color="purple"
        />
    );
};

export default ExtractionPipelineDragDrop;
