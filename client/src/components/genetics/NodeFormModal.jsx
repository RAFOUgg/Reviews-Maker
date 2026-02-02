/**
 * NodeFormModal Component
 * Modale pour créer/éditer un nœud (cultivar)
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidSelect, LiquidTextarea, LiquidCard } from '@/components/ui/LiquidUI';
import useGeneticsStore from '../../store/useGeneticsStore';
import { Save, X } from 'lucide-react';

const NodeFormModal = ({ isEdit, onClose }) => {
    const store = useGeneticsStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formData = store.nodeFormData || {};

    const handleChange = (field, value) => {
        store.updateNodeFormData({ [field]: value });
    };

    const handleGeneticsChange = (field, value) => {
        const genetics = formData.genetics || {};
        store.updateNodeFormData({
            genetics: { ...genetics, [field]: value }
        });
    };

    const handleColorChange = (color) => {
        store.updateNodeFormData({ color });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit) {
                await store.updateNode(formData.id, formData);
            } else {
                await store.addNode(formData);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <span>{isEdit ? '✏️' : '➕'}</span>
                    <span>{isEdit ? 'Éditer cultivar' : 'Ajouter cultivar'}</span>
                </div>
            }
            size="md"
            glowColor="green"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={onClose} disabled={loading} icon={X}>
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !formData.cultivarName}
                        loading={loading}
                        icon={Save}
                    >
                        {isEdit ? 'Mettre à jour' : 'Ajouter'}
                    </LiquidButton>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <LiquidCard className="p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p className="text-red-400 text-sm">{error}</p>
                    </LiquidCard>
                )}

                {/* Cultivar Name */}
                <LiquidInput
                    label="Nom du cultivar *"
                    value={formData.cultivarName || ''}
                    onChange={(e) => handleChange('cultivarName', e.target.value)}
                    placeholder="ex: Gorilla Glue #4"
                    required
                    maxLength={200}
                    helperText={`${(formData.cultivarName || '').length}/200`}
                />

                {/* Color Picker */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Couleur du nœud</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={formData.color || '#FF6B9D'}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-12 h-12 rounded-xl border border-white/20 cursor-pointer bg-transparent"
                        />
                        <div
                            className="w-8 h-8 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: formData.color || '#FF6B9D' }}
                        />
                    </div>
                </div>

                {/* Genetics Section */}
                <LiquidCard className="p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-white">Informations génétiques (optionnel)</h4>

                    <LiquidSelect
                        label="Type"
                        value={formData.genetics?.type || ''}
                        onChange={(e) => handleGeneticsChange('type', e.target.value)}
                        options={[
                            { value: '', label: 'Sélectionner...' },
                            { value: 'Indica', label: 'Indica' },
                            { value: 'Sativa', label: 'Sativa' },
                            { value: 'Hybride', label: 'Hybride' },
                            { value: 'CBD', label: 'CBD' }
                        ]}
                    />

                    <LiquidInput
                        label="Breeder"
                        value={formData.genetics?.breeder || ''}
                        onChange={(e) => handleGeneticsChange('breeder', e.target.value)}
                        placeholder="ex: Exotic Genetix"
                    />

                    <LiquidInput
                        label="Ratio Indica/Sativa"
                        value={formData.genetics?.ratio || ''}
                        onChange={(e) => handleGeneticsChange('ratio', e.target.value)}
                        placeholder="ex: 70/30"
                    />

                    <LiquidTextarea
                        label="Autres notes génétiques"
                        value={formData.genetics?.notes || ''}
                        onChange={(e) => handleGeneticsChange('notes', e.target.value)}
                        placeholder="Autres informations..."
                        maxLength={200}
                        rows={2}
                    />
                </LiquidCard>

                {/* Notes */}
                <LiquidTextarea
                    label="Notes personnelles"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Observations, caractéristiques, etc..."
                    maxLength={500}
                    rows={3}
                    helperText={`${(formData.notes || '').length}/500`}
                />
            </form>
        </LiquidModal>
    );
};

export default NodeFormModal;





