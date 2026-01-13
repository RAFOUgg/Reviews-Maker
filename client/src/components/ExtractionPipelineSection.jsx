import React, { useState } from 'react';
import {
    FlaskConical, Thermometer, Timer, Gauge,
    Settings, CheckCircle2, AlertTriangle
} from 'lucide-react';
// OLD SYSTEM (keep for backward compat)
import PipelineTimeline from './PipelineTimeline';
import PipelineEditor from './PipelineEditor';
// NEW SYSTEM (Phase 4.1 - CDC compliant)
import PipelineGitHubGrid from './PipelineGitHubGrid';
import LiquidGlass from './LiquidGlass';

const ExtractionPipelineSection = ({ data = {}, onChange }) => {
    // NEW SYSTEM: Use PipelineGitHubGrid (Phase 4.1)
    const handlePipelineChange = (pipelineData) => {
        onChange?.({ ...data, pipelineGithub: pipelineData });
    };

    // Support old data format (migration)
    const processData = data.process || {
        method: 'bho', // 'bho', 'rosin', 'co2', 'alcohol'
        solvent: 'butane',
        pressure: 0,
        temperature: 45,
        duration: 24
    };

    const handleCellClick = (cell, index) => {
        setEditingCell({ ...cell, index });
    };

    const handleSaveCell = (cellData) => {
        const newData = [...pipelineData];
        newData[editingCell.index] = cellData;
        onChange?.({ ...data, pipeline: newData });
        setEditingCell(null);
    };

    const handleProcessChange = (key, value) => {
        onChange?.({ ...data, process: { ...processData, [key]: value } });
    };

    const methods = [
        { id: 'bho', name: 'BHO/PHO', icon: FlaskConical },
        { id: 'rosin', name: 'Rosin Press', icon: Gauge },
        { id: 'alcohol', name: 'Solvant (RSO)', icon: FlaskConical }, // Reusing icon for example
    ];

    return (
        <div className="space-y-6">
            <LiquidGlass variant="card" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="w-6 h-6 text-amber-500" />
                    <h3 className="text-xl font-bold dark:text-white">Pipeline d'Extraction</h3>
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
                                            ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <m.icon className="w-5 h-5" />
                                    <span className="text-xs font-medium text-center">{m.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paramètres */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                <Thermometer className="w-3 h-3" /> Temp. (°C)
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
                                <Gauge className="w-3 h-3" /> Pression/Vide
                            </label>
                            <input
                                type="number"
                                value={processData.pressure}
                                onChange={(e) => handleProcessChange('pressure', parseFloat(e.target.value))}
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
                productType="concentrate"
            />
        </div>
    );
};

export default ExtractionPipelineSection;

