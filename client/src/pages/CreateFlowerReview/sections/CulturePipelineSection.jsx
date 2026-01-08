/**
 * CulturePipelineSection - Pipeline Culture CDC Phase 1
 * Utilise CulturePipelineDragDrop (Phase 1 - 84 fields, 12 phases)
 */

import React, { useRef, useEffect } from 'react';
import { LiquidCard } from '../../../components/liquid';
import CulturePipelineDragDrop from '../../../components/pipeline/CulturePipelineDragDrop';

const CulturePipelineSection = ({ data = {}, onChange }) => {
    // ✅ Ref pour maintenir la dernière version des données (évite le batching)
    const timelineDataRef = useRef(data.cultureTimelineData || []);

    // Synchroniser la ref quand data change de l'extérieur
    useEffect(() => {
        timelineDataRef.current = data.cultureTimelineData || [];
    }, [data.cultureTimelineData]);

    // Adapter les handlers pour PipelineDragDropView
    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.cultureTimelineConfig || {}), [key]: value };
        onChange({ ...data, cultureTimelineConfig: updatedConfig });
    };

    const handleDataChange = (timestamp, field, value) => {
        console.log(`🔄 handleDataChange appelé: timestamp=${timestamp}, field=${field}, value=`, value);

        // ✅ Utiliser la ref pour obtenir les données les plus récentes
        const currentData = timelineDataRef.current;
        console.log(`  → currentData avant (depuis ref):`, currentData.map(c => c.timestamp));
        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);
        console.log(`  → existingIndex pour ${timestamp}:`, existingIndex);

        let updatedData;
        if (existingIndex >= 0) {
            // Update existing cell
            updatedData = [...currentData];
            if (value === null || value === undefined) {
                // ✅ BUG FIX: Remove field completely but KEEP timestamp
                const { [field]: removed, ...rest } = updatedData[existingIndex];
                // Restore timestamp and other structural fields
                updatedData[existingIndex] = {
                    timestamp: updatedData[existingIndex].timestamp,
                    ...(updatedData[existingIndex].date && { date: updatedData[existingIndex].date }),
                    ...(updatedData[existingIndex].label && { label: updatedData[existingIndex].label }),
                    ...(updatedData[existingIndex].phase && { phase: updatedData[existingIndex].phase }),
                    ...rest
                };

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

        // ✅ Mettre à jour la ref AVANT d'appeler onChange
        timelineDataRef.current = updatedData;

        // Appeler onChange avec l'objet mis à jour
        onChange({ ...data, cultureTimelineData: updatedData });
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
