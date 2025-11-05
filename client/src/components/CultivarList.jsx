import { useState } from 'react';

export default function CultivarList({ value, onChange, matiereChoices = [] }) {
    const cultivars = Array.isArray(value) ? value : [];

    const addCultivar = () => {
        const newCultivar = {
            id: Date.now(),
            name: '',
            farm: '',
            matiere: matiereChoices[0] || '',
            percentage: ''
        };
        onChange([...cultivars, newCultivar]);
    };

    const updateCultivar = (id, field, val) => {
        onChange(cultivars.map(c => c.id === id ? { ...c, [field]: val } : c));
    };

    const removeCultivar = (id) => {
        onChange(cultivars.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-4">
            {cultivars.map((cultivar, idx) => (
                <div key={cultivar.id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-green-400">Cultivar #{idx + 1}</span>
                        <button
                            type="button"
                            onClick={() => removeCultivar(cultivar.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                        >
                            ✕ Supprimer
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Nom du cultivar</label>
                            <input
                                type="text"
                                placeholder="Ex: Blue Dream"
                                value={cultivar.name || ''}
                                onChange={(e) => updateCultivar(cultivar.id, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Farm</label>
                            <input
                                type="text"
                                placeholder="Ex: Green Valley"
                                value={cultivar.farm || ''}
                                onChange={(e) => updateCultivar(cultivar.id, 'farm', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Matière première</label>
                            <select
                                value={cultivar.matiere || ''}
                                onChange={(e) => updateCultivar(cultivar.id, 'matiere', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                            >
                                {matiereChoices.map((choice, i) => (
                                    <option key={i} value={choice}>{choice}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Pourcentage (optionnel)</label>
                            <input
                                type="text"
                                placeholder="Ex: 40%"
                                value={cultivar.percentage || ''}
                                onChange={(e) => updateCultivar(cultivar.id, 'percentage', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addCultivar}
                className="w-full py-3 border-2 border-dashed border-gray-600 hover:border-green-500 rounded-xl text-gray-400 hover:text-green-400 transition-colors flex items-center justify-center gap-2"
            >
                <span className="text-2xl">+</span>
                <span>Ajouter un cultivar</span>
            </button>
        </div>
    );
}
