/**
 * Section Pipeline Culture (Fleurs)
 * Phase 1 - Modernisé avec CulturePipelineDragDrop (84 fields, 12 phases)
 */

import React from 'react';
import CulturePipelineDragDrop from '../legacy/CulturePipelineDragDrop';

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
                // Remove field but KEEP metadata (timestamp, date, label, phase)
                const { [field]: removed, ...rest } = updatedData[existingIndex];
                // Restore essential structural fields
                updatedData[existingIndex] = {
                    timestamp: updatedData[existingIndex].timestamp,
                    ...(updatedData[existingIndex].date && { date: updatedData[existingIndex].date }),
                    ...(updatedData[existingIndex].label && { label: updatedData[existingIndex].label }),
                    ...(updatedData[existingIndex].phase && { phase: updatedData[existingIndex].phase }),
                    ...rest
                };
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
        <CulturePipelineDragDrop
            timelineConfig={data.cultureTimelineConfig || { type: 'phase' }}
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
    );
};

export default CulturePipelineSection;



