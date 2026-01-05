/**
 * Section Pipeline Culture (Fleurs)
 * Phase 1 - Modernisé avec CulturePipelineDragDrop (84 fields, 12 phases)
 */

import React from 'react';
import { Sprout } from 'lucide-react';
import { LiquidCard } from '../../liquid';
import CulturePipelineDragDrop from '../../pipeline/CulturePipelineDragDrop';

const CulturePipelineSection = ({ data = {}, onChange }) => {
    const handleConfigChange = (config) => {
        onChange({ ...data, cultureTimelineConfig: config });
    };

    const handleDataChange = (timelineData) => {
        onChange({ ...data, cultureTimelineData: timelineData });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <Sprout className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-semibold text-white">Pipeline Culture - Phase 1</h2>
            </div>

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
        </div>
    );
};

export default CulturePipelineSection;
lightType: data.environment?.lightType || 'led',
    lightPower: data.environment?.lightPower || 200,
        lightDistance: data.environment?.lightDistance || 40,
            lightSchedule: data.environment?.lightSchedule || '18/6',
                spectrum: data.environment?.spectrum || 'full',
                    temperature: data.environment?.temperature || 24,

export default CulturePipelineSection;