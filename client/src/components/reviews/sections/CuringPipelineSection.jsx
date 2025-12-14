import React, { useState } from 'react';
import { 
  Thermometer, Droplets, Clock, Wind, Archive 
} from 'lucide-react';
import PipelineTimeline from '../../pipeline/PipelineTimeline';
import PipelineEditor from '../../pipeline/PipelineEditor';
import { LiquidGlass } from '../../ui';

const CuringPipelineSection = ({ data = {}, onChange }) => {
    const [editingCell, setEditingCell] = useState(null);

    // Initialisation
    const pipelineData = data.pipeline || Array(8).fill(null); // 8 semaines par défaut
    const processData = data.process || {
        method: 'jars', // 'jars', 'groove', 'auto'
        containerType: 'glass',
        burpingFrequency: 'daily',
        duration: 4 // semaines
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
        { id: 'jars', name: 'Jars Classiques', icon: Archive },
        { id: 'groove', name: 'Grove Bags', icon: ShoppingBag },
        { id: 'auto', name: 'Auto-Cure', icon: RefreshCw },
    ];

    const ShoppingBag = ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 10a4 4 0 0 1-8 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
    
    const RefreshCw = ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
          <path d="M23 4v6h-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 20v-6h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    return (
        <div className="space-y-6">
            <LiquidGlass variant="card" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Wind className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold dark:text-white">Curing & Maturation</h3>
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
                                    className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                                        processData.method === m.id
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
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
                                <Thermometer className="w-3 h-3" /> Cible Temp.
                            </label>
                            <input 
                                type="number" 
                                value={processData.targetTemp || 18}
                                onChange={(e) => handleProcessChange('targetTemp', parseFloat(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                <Droplets className="w-3 h-3" /> Cible RH%
                            </label>
                            <input 
                                type="number" 
                                value={processData.targetRh || 62}
                                onChange={(e) => handleProcessChange('targetRh', parseInt(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Suivi Hebdomadaire
                    </label>
                    <PipelineTimeline 
                        data={pipelineData}
                        onCellClick={handleCellClick}
                        label="Semaines de Curing"
                        mode="weeks"
                    />
                </div>
            </LiquidGlass>

            {editingCell && (
                <PipelineEditor 
                    cell={editingCell}
                    onSave={handleSaveCell}
                    onClose={() => setEditingCell(null)}
                    type="curing"
                />
            )}
        </div>
    );
};

export default CuringPipelineSection;
