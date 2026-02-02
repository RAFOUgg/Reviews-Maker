import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { LiquidModal, LiquidButton, LiquidInput } from '@/components/ui/LiquidUI';

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

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            title="Attribuer plusieurs contenus"
            size="lg"
            glowColor="blue"
            footer={
                <div className="flex gap-3 w-full">
                    <LiquidButton variant="ghost" onClick={onClose} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton variant="primary" onClick={handleSubmit} className="flex-1" icon={Check}>
                        Appliquer
                    </LiquidButton>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-white/60">
                    Appliquer les valeurs renseignées à {targetCells.length} case(s)
                </p>

                <div className="space-y-3 max-h-[60vh] overflow-auto">
                    {contents.map((c) => {
                        const key = c.key ?? c.name ?? c.value;
                        return (
                            <div
                                key={key}
                                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
                            >
                                <div className="w-8 text-center text-xl">{c.icon || '🧩'}</div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm text-white">{c.label || c.name || key}</div>
                                    {c.unit && <div className="text-xs text-white/40">Unité: {c.unit}</div>}
                                </div>
                                <LiquidInput
                                    value={values[key] ?? ''}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    placeholder={c.placeholder || ''}
                                    className="w-48"
                                    size="sm"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </LiquidModal>
    );
};

export default MultiContentAssignModal;


