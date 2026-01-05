import React, { useState } from 'react';
import {
    FlaskConical, Scale, Filter, Thermometer, Clock,
    Droplets, Grid3x3, RefreshCw, Zap
} from 'lucide-react';
// NEW SYSTEM Phase 3 - Separation Pipeline
import SeparationPipelineDragDrop from '../../pipeline/SeparationPipelineDragDrop';
import { LiquidGlass } from '../../ui';

const SeparationPipelineSection = ({ data = {}, onChange }) => {
    const [separationData, setSeparationData] = useState(data.separationData || {
        separationType: 'ice-water',
        numberOfPasses: 3,
        batchSize: 100,
        ...data
    });

    const handleSeparationChange = (newData) => {
        setSeparationData(newData);
        onChange?.({ ...data, separationData: newData });
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
                data={separationData}
                onChange={handleSeparationChange}
                intervalType="hours"
            />
        </div>
    );
};

export default SeparationPipelineSection;