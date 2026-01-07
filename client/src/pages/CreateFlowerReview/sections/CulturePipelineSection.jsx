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
        console.log(`🔄 handleDataChange appelé: timestamp=${timestamp}, field=${field}, value=`, value);
        console.log(`📌 Type de onChange:`, typeof onChange);
        console.log(`📌 Data actuel avant onChange:`, data.cultureTimelineData);

        // ✅ FIX: Utiliser une fonction pour accéder à la valeur la plus récente
        onChange(prevData => {
            console.log(`🟢 INSIDE onChange callback - prevData:`, prevData);
            const currentData = prevData.cultureTimelineData || [];
            console.log(`  → currentData avant:`, currentData.map(c => c.timestamp));
            const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);
            console.log(`  → existingIndex pour ${timestamp}:`, existingIndex);

            let updatedData;
            if (existingIndex >= 0) {
                // Update existing cell
                updatedData = [...currentData];
                if (value === null || value === undefined) {
                    // ✅ BUG FIX: Remove field completely instead of setting to null
                    const { [field]: removed, ...rest } = updatedData[existingIndex];
                    updatedData[existingIndex] = rest;

                    // Si la cellule devient vide (plus aucune donnée utile), la retirer complètement
                    const cellKeys = Object.keys(updatedData[existingIndex]).filter(k =>
                        !['timestamp', 'label', 'date', 'phase', '_meta'].includes(k)
                    );
                    if (cellKeys.length === 0) {
                        updatedData = updatedData.filter((_, idx) => idx !== existingIndex);
                    }
                } else {
                    updatedData[existingIndex] = { ...updatedData[existingIndex], [field]: value };
                }
            } else {
                // Add new cell only if value is not null/undefined
                if (value !== null && value !== undefined) {
                    updatedData = [...currentData, { timestamp, [field]: value }];
                } else {
                    updatedData = currentData; // No change
                }
            }

            console.log(`  → updatedData après:`, updatedData.map(c => `${c.timestamp}(${Object.keys(c).filter(k => !['timestamp', 'label', 'date', 'phase', '_meta'].includes(k)).join(',')})`));
            const result = { ...prevData, cultureTimelineData: updatedData };
            console.log(`🔵 RETURN from onChange callback:`, result.cultureTimelineData);
            return result;
        });

        console.log(`✅ handleDataChange terminé pour ${timestamp}`);
    };

    return (
        <LiquidCard title="🌱 Pipeline Culture Phase 1" bordered>
            <CulturePipelineDragDrop
                timelineConfig={data.cultureTimelineConfig || { type: 'jour', totalDays: 90 }}
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
