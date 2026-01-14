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

import React from 'react';
import PipelineDragDropView from '../views/PipelineDragDropView';
import { SEPARATION_SIDEBAR_CONTENT } from '../../../config/separationSidebarContent';
import { SEPARATION_PHASES } from '../../../config/pipelinePhases';

const SeparationPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange
}) => {
    return (
        <PipelineDragDropView
            type="separation"
            pipelineType="separation"
            title="Pipeline Séparation Hash"
            description="Traçabilité complète du processus de séparation des trichomes"
            sidebarContent={SEPARATION_SIDEBAR_CONTENT}
            phases={SEPARATION_PHASES}
            timelineConfig={timelineConfig}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
            defaultIntervalType="minutes"
            supportedIntervalTypes={['seconds', 'minutes', 'hours']}
            icon="🌊"
            color="cyan"
        />
    );
};

export default SeparationPipelineDragDrop;




