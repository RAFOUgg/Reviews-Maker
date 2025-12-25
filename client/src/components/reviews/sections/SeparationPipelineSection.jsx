import React, { useState } from 'react';
import {
    FlaskConical, Scale, Filter, Thermometer, Clock,
    Droplets, Grid3x3, RefreshCw, Zap
} from 'lucide-react';
// OLD SYSTEM (keep for backward compat)
import PipelineTimeline from '../../pipeline/PipelineTimeline';
import PipelineEditor from '../../pipeline/PipelineEditor';
// NEW SYSTEM (Phase 4.1 - CDC compliant)
import PipelineGitHubGrid from '../../pipeline/PipelineGitHubGrid';
import { LiquidGlass } from '../../ui';

const SeparationPipelineSection = ({ data = {}, onChange }) => {
    // NEW SYSTEM: Use PipelineGitHubGrid (Phase 4.1)
    const handlePipelineChange = (pipelineData) => {
        onChange?.({ ...data, pipelineGithub: pipelineData });
    };

    // Support old data format (migration)
    const processData = data.process || {
        method: 'iceWater', // 'iceWater', 'drySift', 'static'
        temperature: 2,
        micronSizes: [160, 120, 90, 73, 45, 25],
        washes: 3
    };

    const handleCellClick = (cell, index) => {
        setEditingCell({ ...cell, index });
    };

    const handleSaveCell = (cellData) => {
        const newData = [...pipelineData];
        newData[editingCell.index] = cellData;

        onChange?.({
            ...data,
            pipeline: newData
        });
        setEditingCell(null);
    };

    const handleProcessChange = (key, value) => {
        onChange?.({
            ...data,
            process: { ...processData, [key]: value }
        });
    };

    const methods = [
        { id: 'iceWater', name: 'Ice Water (Water Hash)', icon: Droplets },
        { id: 'drySift', name: 'Dry Sift (Tamis)', icon: Filter },
        { id: 'static', name: 'Static Tech', icon: Zap },
    ];

    return (
        <div className="space-y-6">
            <LiquidGlass variant="card" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-bold dark:text-white">Pipeline de Séparation</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Méthode */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Méthode</label>
                        <div className="flex gap-2">
                            {methods.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => handleProcessChange('method', m.id)}
                                    className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${processData.method === m.id
                                            ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <m.icon className="w-5 h-5" />
                                    <span className="text-xs font-medium text-center">{m.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paramètres Rapides */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                <Thermometer className="w-3 h-3" /> Temp. Eau
                            </label>
                            <input
                                type="number"
                                value={processData.temperature}
                                onChange={(e) => handleProcessChange('temperature', parseFloat(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Passes
                            </label>
                            <input
                                type="number"
                                value={processData.washes}
                                onChange={(e) => handleProcessChange('washes', parseInt(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                    </div>
                </div>
            </LiquidGlass>

            {/* NEW: GitHub-style Pipeline Grid (Phase 4.1) */}
            <PipelineGitHubGrid
                value={data.pipelineGithub}
                onChange={handlePipelineChange}
                type="extraction"
                productType="hash"
            />
        </div>
    );
};

export default SeparationPipelineSection;
