/**
 * ChainFormModal Component
 * Modale de renommage/édition d'une chaîne de production — équivalent minimal de
 * TreeFormModal.jsx (PhenoHunt), sans type de projet (ProductionChain n'a pas ce champ).
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidTextarea, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { Save, X } from 'lucide-react';

const ChainFormModal = ({ chain, onClose }) => {
    const store = useProductionChainStore();
    const [name, setName] = useState(chain?.name || '');
    const [description, setDescription] = useState(chain?.description || '');
    const [isPublic, setIsPublic] = useState(chain?.isPublic || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Le nom de la chaîne est requis');
            }

            const result = await store.updateChain(chain.id, { name, description, isPublic });
            if (result?.error) throw new Error(result.error);

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
                    <span>✏️</span>
                    <span>Éditer la chaîne</span>
                </div>
            }
            size="lg"
            glowColor="green"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={onClose} disabled={loading} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !name}
                        loading={loading}
                        icon={Save}
                        className="flex-1"
                    >
                        Mettre à jour
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

                <LiquidInput
                    label="Nom de la chaîne *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Extraction Rosin Batch 3"
                    required
                    maxLength={200}
                    hint={`${name.length}/200`}
                />

                <LiquidTextarea
                    label="Description (optionnel)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Objectifs, notes sur cette chaîne..."
                    maxLength={1000}
                    rows={3}
                    hint={`${description.length}/1000`}
                />

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-green-500/50 transition-colors">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 mt-0.5 accent-green-500"
                    />
                    <div>
                        <span className="text-sm font-semibold text-white">Rendre cette chaîne publique</span>
                        <p className="text-xs text-white/50 mt-1">
                            Les utilisateurs pourront la voir dans la galerie publique
                        </p>
                    </div>
                </label>
            </form>
        </LiquidModal>
    );
};

export default ChainFormModal;
