import React, { useRef } from 'react';
import SeparationPipelineDragDrop from '../legacy/SeparationPipelineDragDrop';

const SeparationPipelineSection = ({ data = {}, onChange }) => {
    // Reference to timeline data for external access
    const timelineDataRef = useRef(data.separationTimelineData || []);

    // Update ref when data changes
    React.useEffect(() => {
        timelineDataRef.current = data.separationTimelineData || [];
    }, [data.separationTimelineData]);

    // Config change handler
    const handleConfigChange = (key, value) => {
        const updatedConfig = {
            ...(data.separationTimelineConfig || {}),
            [key]: value
        };
        onChange({ ...data, separationTimelineConfig: updatedConfig });
    };

    // Data change handler
    const handleDataChange = (timestamp, field, value) => {
        const currentData = data.separationTimelineData || [];
        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);

        let updatedData;
        if (existingIndex >= 0) {
            updatedData = [...currentData];
            if (value === null || value === undefined) {
                const { [field]: removed, ...rest } = updatedData[existingIndex];
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
            updatedData = [...currentData, { timestamp, [field]: value }];
        }

        onChange({ ...data, separationTimelineData: updatedData });
    };

    return (
        <SeparationPipelineDragDrop
            timelineConfig={data.separationTimelineConfig || {}}
            timelineData={data.separationTimelineData || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
            initialData={{
                separationType: data.separationType,
                batchSize: data.batchSize,
                numberOfPasses: data.numberOfPasses
            }}
        />
    );
};

export default SeparationPipelineSection;




