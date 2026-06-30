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
    // NB: lit/écrit via timelineDataRef (pas la prop `data`) car onDataChange peut être
    // appelé plusieurs fois de façon synchrone (ex: drop d'un groupe de préréglages multi-champs)
    // avant que React ne re-render et ne rafraîchisse `data` — sinon chaque appel repart de la
    // même valeur obsolète et seul le dernier champ appliqué est conservé.
    const handleDataChange = (timestamp, field, value) => {
        const currentData = timelineDataRef.current;
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

        timelineDataRef.current = updatedData;
        onChange({ ...data, extractionTimelineData: updatedData });
    };

    // Réinitialiser complètement la trame (config + données)
    const handleClearTimeline = () => {
        timelineDataRef.current = [];
        onChange({ ...data, extractionTimelineConfig: {}, extractionTimelineData: [] });
    };

    return (
        <ExtractionPipelineDragDrop
            timelineConfig={data.extractionTimelineConfig || {}}
            timelineData={data.extractionTimelineData || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
            onClearTimeline={handleClearTimeline}
            initialData={{
                extractionMethod: data.extractionMethod,
                solvent: data.solvent,
                purificationMethods: data.purificationMethods
            }}
        />
    );
};

export default ExtractionPipelineSection;


