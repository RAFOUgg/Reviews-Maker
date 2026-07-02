/**
 * ChainEdgeFormModal Component
 * Modale pour créer/éditer une liaison de transformation entre deux fiches techniques
 * Modelé sur EdgeFormModal.jsx (genetics), avec technique/date/notes au lieu de relationshipType.
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidSelect, LiquidInput, LiquidTextarea, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { Save, X, ArrowDown } from 'lucide-react';

const ChainEdgeFormModal = ({ onClose }) => {
    const store = useProductionChainStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formData = store.edgeFormData || {};
    const isEdit = formData.id !== undefined;

    const handleChange = (field, value) => {
        store.updateEdgeFormData({ [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.sourceNodeId || !formData.targetNodeId) {
                throw new Error('Veuillez sélectionner un produit source et un produit destination');
            }

            if (formData.sourceNodeId === formData.targetNodeId) {
                throw new Error('La source et la destination ne peuvent pas être le même produit');
            }

            if (isEdit) {
                await store.updateEdge(formData.id, {
                    technique: formData.technique || null,
                    date: formData.date || null,
                    notes: formData.notes || null
                });
            } else {
                await store.addEdge({
                    sourceNodeId: formData.sourceNodeId,
                    targetNodeId: formData.targetNodeId,
                    technique: formData.technique || null,
                    date: formData.date || null,
                    notes: formData.notes || null
                });
            }

            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const sourceNode = store.nodes.find(n => n.id === formData.sourceNodeId);
    const targetNode = store.nodes.find(n => n.id === formData.targetNodeId);

    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <span>{isEdit ? '✏️' : '➕'}</span>
                    <span>{isEdit ? 'Éditer la transformation' : 'Créer une transformation'}</span>
                </div>
            }
            size="md"
            glowColor="amber"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={onClose} disabled={loading} icon={X}>
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !formData.sourceNodeId || !formData.targetNodeId}
                        loading={loading}
                        icon={Save}
                    >
                        {isEdit ? 'Mettre à jour' : 'Créer la liaison'}
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

                <LiquidSelect
                    label="Produit source *"
                    value={formData.sourceNodeId || ''}
                    onChange={(e) => handleChange('sourceNodeId', e.target.value)}
                    disabled={isEdit}
                    options={[
                        { value: '', label: 'Sélectionner un produit source...' },
                        ...store.nodes.map(node => ({ value: node.id, label: node.label }))
                    ]}
                />

                <LiquidSelect
                    label="Produit destination *"
                    value={formData.targetNodeId || ''}
                    onChange={(e) => handleChange('targetNodeId', e.target.value)}
                    disabled={isEdit}
                    options={[
                        { value: '', label: 'Sélectionner un produit destination...' },
                        ...store.nodes
                            .filter(n => n.id !== formData.sourceNodeId)
                            .map(node => ({ value: node.id, label: node.label }))
                    ]}
                />

                {sourceNode && targetNode && (
                    <LiquidCard className="p-4">
                        <p className="text-xs text-white/40 mb-2">Aperçu de la transformation</p>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm text-white">{sourceNode.label}</span>
                            <ArrowDown className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-white">{targetNode.label}</span>
                        </div>
                    </LiquidCard>
                )}

                <LiquidInput
                    label="Technique utilisée"
                    value={formData.technique || ''}
                    onChange={(e) => handleChange('technique', e.target.value)}
                    placeholder="ex: Extraction rosin 90µ, Curing 30j..."
                    maxLength={200}
                />

                <LiquidInput
                    type="date"
                    label="Date de la manipulation"
                    value={formData.date || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                />

                <LiquidTextarea
                    label="Notes sur cette transformation (optionnel)"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="ex: Rendement 18%, pression 8 tonnes..."
                    maxLength={500}
                    rows={2}
                />
            </form>
        </LiquidModal>
    );
};

export default ChainEdgeFormModal;
