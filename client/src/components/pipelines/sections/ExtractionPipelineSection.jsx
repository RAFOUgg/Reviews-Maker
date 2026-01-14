import React, { useRef } from 'react';
import ExtractionPipelineDragDrop from '../legacy/ExtractionPipelineDragDrop';

const ExtractionPipelineSection = ({ data = {}, onChange }) => {
    // Reference to timeline data for external access
    const timelineDataRef = useRef(data.extractionTimelineData || []);

    // Update ref when data changes
    React.useEffect(() => {
        timelineDataRef.current = data.extractionTimelineData || [];
    }, [data.extractionTimelineData]);

    // Config change handler
    const handleConfigChange = (key, value) => {
        const updatedConfig = {
            ...(data.extractionTimelineConfig || {}),
            [key]: value
        };
        onChange({ ...data, extractionTimelineConfig: updatedConfig });
    };

    // Data change handler
    const handleDataChange = (timestamp, field, value) => {
        const currentData = data.extractionTimelineData || [];
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

        onChange({ ...data, extractionTimelineData: updatedData });
    };

    return (
        <ExtractionPipelineDragDrop
            timelineConfig={data.extractionTimelineConfig || {}}
            timelineData={data.extractionTimelineData || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
        />
    );
};

export default ExtractionPipelineSection;


