import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const MultiContentAssignModal = ({ isOpen, onClose, contents = [], targetCells = [], preConfigured = {}, onApply }) => {
    const [values, setValues] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        // Initialize values with preconfigured or default values
        const initial = {};
        contents.forEach(c => {
            const key = c.key ?? c.name ?? c.value;
            if (preConfigured && preConfigured[key] !== undefined) initial[key] = preConfigured[key];
            else if (c.defaultValue !== undefined) initial[key] = c.defaultValue;
            else initial[key] = '';
        });
        setValues(initial);
    }, [isOpen, contents, preConfigured]);

    const handleChange = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

    const handleSubmit = () => {
        // Ensure at least one field has a value
        const hasValue = Object.values(values).some(v => v !== '' && v !== null && v !== undefined);
        if (!hasValue) {
            alert('Veuillez saisir au moins une valeur');
            return;
        }
        onApply(values, targetCells);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold">Attribuer plusieurs contenus</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Appliquer les valeurs renseignées à {targetCells.length} case(s)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4"/></button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-auto mb-4">
                    {contents.map((c) => {
                        const key = c.key ?? c.name ?? c.value;
                        return (
                            <div key={key} className="flex items-center gap-3 p-2 border rounded-lg">
                                <div className="w-8 text-center">{c.icon || '🧩'}</div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{c.label || c.name || key}</div>
                                    {c.unit && <div className="text-xs text-gray-500">Unité: {c.unit}</div>}
                                </div>
                                <input
                                    value={values[key] ?? ''}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    placeholder={c.placeholder || ''}
                                    className="px-3 py-2 border rounded-lg w-48 text-sm bg-white dark:bg-gray-800"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Annuler</button>
                    <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"><Check className="w-4 h-4"/>Appliquer</button>
                </div>
            </div>
        </div>
    );
};

export default MultiContentAssignModal;


