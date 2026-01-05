import React, { useState } from 'react';
import {
    FlaskConical, Scale, Filter, Thermometer, Clock,
    Droplets, Grid3x3, RefreshCw, Zap
} from 'lucide-react';
// NEW SYSTEM Phase 3 - Separation Pipeline
import SeparationPipelineDragDrop from '../../pipeline/SeparationPipelineDragDrop';
import { LiquidGlass } from '../../ui';

const SeparationPipelineSection = ({ data = {}, onChange }) => {
    // Adapter les handlers pour PipelineDragDropView
    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.separationTimelineConfig || {}), [key]: value };
        onChange({ ...data, separationTimelineConfig: updatedConfig });
    };

    const handleDataChange = (timestamp, field, value) => {
        const currentData = data.separationTimelineData || [];
        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);

        let updatedData;
        if (existingIndex >= 0) {
            updatedData = [...currentData];
            if (value === null || value === undefined) {
                const { [field]: removed, ...rest } = updatedData[existingIndex];
                updatedData[existingIndex] = rest;
            } else {
                updatedData[existingIndex] = { ...updatedData[existingIndex], [field]: value };
            }
        } else {
            updatedData = [...currentData, { timestamp, [field]: value }];
        }

        onChange({ ...data, separationTimelineData: updatedData });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="w-6 h-6 text-purple-400" />
                <div>
                    <h3 className="text-xl font-bold">Pipeline Séparation Hash</h3>
                    <p className="text-sm text-gray-400">Ice-Water, Dry-Sift, multi-passes</p>
                </div>
            </div>

            <SeparationPipelineDragDrop
                timelineConfig={data.separationTimelineConfig || { type: 'heure', totalHours: 24 }}
                timelineData={data.separationTimelineData || []}
                onConfigChange={handleConfigChange}
                onDataChange={handleDataChange}
            />
        </div>
    );
};

export default SeparationPipelineSection;