/**
 * Section Pipeline Culture (Fleurs)
 * Phase 1 - Modernisé avec CulturePipelineDragDrop (84 fields, 13 phases dont Récolte)
 */

import React, { useRef } from 'react';
import CulturePipelineDragDrop from '../legacy/CulturePipelineDragDrop';
import ChainSectionEmbed from '../../production-chain/ChainSectionEmbed';

const CulturePipelineSection = ({ data = {}, onChange, reviewId, reviewLabel, reviewImage }) => {
    // Reference to timeline data for external access
    const timelineDataRef = useRef(data.cultureTimelineData || []);

    // Update ref when data changes
    React.useEffect(() => {
        timelineDataRef.current = data.cultureTimelineData || [];
    }, [data.cultureTimelineData]);

    // Adapter les handlers pour PipelineDragDropView
    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.cultureTimelineConfig || {}), [key]: value };
        onChange({ ...data, cultureTimelineConfig: updatedConfig });
    };

    // NB: lit/écrit via timelineDataRef (pas la prop `data`) car onDataChange peut être
    // appelé plusieurs fois de façon synchrone (ex: drop d'un groupe de préréglages multi-champs)
    // avant que React ne re-render et ne rafraîchisse `data` — sinon chaque appel repart de la
    // même valeur obsolète et seul le dernier champ appliqué est conservé.
    const handleDataChange = (timestamp, field, value) => {
        const currentData = timelineDataRef.current;
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

        timelineDataRef.current = updatedData;
        onChange({ ...data, cultureTimelineData: updatedData });
    };

    // Réinitialiser complètement la trame (config + données)
    const handleClearTimeline = () => {
        timelineDataRef.current = [];
        onChange({ ...data, cultureTimelineConfig: {}, cultureTimelineData: [] });
    };

    return (
        <div className="space-y-4">
            <ChainSectionEmbed
                reviewId={reviewId}
                reviewType="flower"
                reviewLabel={reviewLabel}
                reviewImage={reviewImage}
            />
            <CulturePipelineDragDrop
                timelineConfig={data.cultureTimelineConfig || { type: 'phase' }}
                timelineData={data.cultureTimelineData || []}
                onConfigChange={handleConfigChange}
                onDataChange={handleDataChange}
                onClearTimeline={handleClearTimeline}
                initialData={{
                    mode: data.mode,
                    spaceType: data.spaceType,
                    substrat: data.substrat,
                    lightType: data.lightType
                }}
            />
        </div>
    );
};

export default CulturePipelineSection;



