/**
 * CulturePipelineSection - Pipeline Culture CDC Phase 1
 * Utilise CulturePipelineDragDrop (Phase 1 - 84 fields, 12 phases)
 */

import React from 'react';
import { LiquidCard } from '../../../components/liquid';
import CulturePipelineDragDrop from '../../../components/pipeline/CulturePipelineDragDrop';

const CulturePipelineSection = ({ data = {}, onChange }) => {
    // Adapter les handlers pour PipelineDragDropView
    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.cultureTimelineConfig || {}), [key]: value };
        onChange({ ...data, cultureTimelineConfig: updatedConfig });
    };

    const handleDataChange = (timestamp, field, value) => {
        const currentData = data.cultureTimelineData || [];
        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);

        let updatedData;
        if (existingIndex >= 0) {
            // Update existing cell
            updatedData = [...currentData];
            if (value === null || value === undefined) {
                // Remove field
                const { [field]: removed, ...rest } = updatedData[existingIndex];
                updatedData[existingIndex] = rest;
            } else {
                updatedData[existingIndex] = { ...updatedData[existingIndex], [field]: value };
            }
        } else {
            // Add new cell
            updatedData = [...currentData, { timestamp, [field]: value }];
        }

        onChange({ ...data, cultureTimelineData: updatedData });
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
