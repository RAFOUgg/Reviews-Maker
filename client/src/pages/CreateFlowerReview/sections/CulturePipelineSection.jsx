/**
 * CulturePipelineSection - Pipeline Culture CDC Phase 1
 * Utilise CulturePipelineDragDrop (Phase 1 - 84 fields, 12 phases)
 */

import React from 'react';
import { LiquidCard } from '../../../components/liquid';
import CulturePipelineDragDrop from '../../../components/pipeline/CulturePipelineDragDrop';

const CulturePipelineSection = ({ data = {}, onChange }) => {
    const handleConfigChange = (config) => {
        onChange({ ...data, cultureTimelineConfig: config });
    };

    const handleDataChange = (timelineData) => {
        onChange({ ...data, cultureTimelineData: timelineData });
    };

    return (
        <LiquidCard title="🌱 Pipeline Culture Phase 1" bordered>
            <CulturePipelineDragDrop
                timelineConfig={data.cultureTimelineConfig || {}}
                timelineData={data.cultureTimelineData || []}
                onConfigChange={handleConfigChange}
                onDataChange={handleDataChange}
                initialData={{
                    mode: data.mode,
                    spaceType: data.spaceType,
                    substrat: data.substrat,
                    lightType: data.lightType
                }}
            />
        </LiquidCard>
    );
};

export default CulturePipelineSection;
