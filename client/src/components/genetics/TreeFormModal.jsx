/**
 * TreeFormModal Component
 * Modale pour créer/éditer un arbre généalogique
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidTextarea, LiquidCard, LiquidChip } from '@/components/ui/LiquidUI';
import useGeneticsStore from '../../store/useGeneticsStore';
import { Save, X } from 'lucide-react';

const TreeFormModal = ({ isEdit, onClose }) => {
    const store = useGeneticsStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formData = store.treeFormData || {};

    const handleChange = (field, value) => {
        store.updateTreeFormData({ [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.name || formData.name.trim().length === 0) {
                throw new Error('Le nom de l\'arbre est requis');
            }

            if (isEdit && formData.id) {
                await store.updateTree(formData.id, {
                    name: formData.name,
                    description: formData.description,
                    projectType: formData.projectType,
                    isPublic: formData.isPublic
                });
            } else {
                await store.createTree({
                    name: formData.name,
                    description: formData.description,
                    projectType: formData.projectType,
                    isPublic: formData.isPublic
                });
            }

            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const projectTypes = [
        { value: 'phenohunt', label: '🔍 PhenoHunt', description: 'Recherche de phénotypes intéressants' },
        { value: 'selection', label: '🌿 Sélection', description: 'Sélection génétique contrôlée' },
        { value: 'crossing', label: '🔄 Croisement', description: 'Croisements spécifiques' },
        { value: 'hunt', label: '🎯 Hunt', description: 'Chasse aux génétiques' }
    ];

    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <span>{isEdit ? '✏️' : '🌳'}</span>
                    <span>{isEdit ? 'Éditer arbre' : 'Nouvel arbre généalogique'}</span>
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
                        disabled={loading || !formData.name}
                        loading={loading}
                        icon={Save}
                    >
                        {isEdit ? 'Mettre à jour' : 'Créer l\'arbre'}
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

                {/* Tree Name */}
                <LiquidInput
                    label="Nom de l'arbre *"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="ex: Gorilla Glue Hunt 2025"
                    required
                    maxLength={200}
                    helperText={`${(formData.name || '').length}/200`}
                />

                {/* Project Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Type de projet *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {projectTypes.map(type => (
                            <LiquidChip
                                key={type.value}
                                selected={formData.projectType === type.value}
                                onClick={() => handleChange('projectType', type.value)}
                                className="flex flex-col items-start p-3 text-left"
                            >
                                <span className="font-semibold">{type.label}</span>
                                <span className="text-xs text-white/50">{type.description}</span>
                            </LiquidChip>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <LiquidTextarea
                    label="Description (optionnel)"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Objectifs, notes sur ce projet..."
                    maxLength={1000}
                    rows={3}
                    helperText={`${(formData.description || '').length}/1000`}
                />

                {/* Visibility */}
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-green-500/50 transition-colors">
                    <input
                        type="checkbox"
                        checked={formData.isPublic || false}
                        onChange={(e) => handleChange('isPublic', e.target.checked)}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 mt-0.5 accent-green-500"
                    />
                    <div>
                        <span className="text-sm font-semibold text-white">Rendre cet arbre public</span>
                        <p className="text-xs text-white/50 mt-1">
                            Les utilisateurs pourront le voir dans la galerie publique et le commenter
                        </p>
                    </div>
                </label>
            </form>
        </LiquidModal>
    );
};

export default TreeFormModal;
