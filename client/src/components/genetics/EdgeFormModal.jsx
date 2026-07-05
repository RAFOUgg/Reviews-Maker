/**
 * EdgeFormModal Component
 * Modale pour créer/éditer une arête (relation parent-enfant)
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidSelect, LiquidTextarea, LiquidCard } from '@/components/ui/LiquidUI';
import useGeneticsStore from '../../store/useGeneticsStore';
import { POLLINATION_METHODS } from '../../config/phenoNodeFields';
import { Save, X, ArrowDown, Users, Flower2, VenusAndMars, Repeat, Zap, Heart } from 'lucide-react';

const EdgeFormModal = ({ onClose }) => {
    const store = useGeneticsStore();
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
            if (!formData.parentNodeId || !formData.childNodeId) {
                throw new Error('Veuillez sélectionner un parent et un enfant');
            }

            if (formData.parentNodeId === formData.childNodeId) {
                throw new Error('Le parent et l\'enfant ne peuvent pas être le même nœud');
            }

            if (isEdit) {
                await store.updateEdge(formData.id, {
                    relationshipType: formData.relationshipType || 'parent',
                    pollinationMethod: formData.pollinationMethod || null,
                    notes: formData.notes || null
                });
            } else {
                await store.addEdge({
                    parentNodeId: formData.parentNodeId,
                    childNodeId: formData.childNodeId,
                    relationshipType: formData.relationshipType || 'parent',
                    pollinationMethod: formData.pollinationMethod || null,
                    notes: formData.notes || null,
                    // Renseigné par UnifiedGeneticsCanvas.handleConnect quand la relation vient
                    // d'un glisser-déposer de connexion natif React Flow (mémorise le côté du
                    // handle réellement utilisé, cohérent avec l'accroche manuelle).
                    sourceHandle: formData.sourceHandle || null,
                    targetHandle: formData.targetHandle || null
                });
            }

            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const relationshipTypes = [
        { value: 'parent', label: 'Parent', icon: <Users size={15} /> },
        { value: 'pollen_donor', label: 'Donateur de pollen', icon: <Flower2 size={15} /> },
        { value: 'sibling', label: 'Frère/Sœur', icon: <VenusAndMars size={15} /> },
        { value: 'clone', label: 'Clone', icon: <Repeat size={15} /> },
        { value: 'mutation', label: 'Mutation', icon: <Zap size={15} /> },
        { value: 'pairing', label: 'Couple parental (liaison)', icon: <Heart size={15} /> }
    ];

    const isPairing = formData.relationshipType === 'pairing';

    const parentNode = store.nodes.find(n => n.id === formData.parentNodeId);
    const childNode = store.nodes.find(n => n.id === formData.childNodeId);

    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <span>{isEdit ? '✏️' : '➕'}</span>
                    <span>{isEdit ? 'Éditer la relation' : 'Créer une relation'}</span>
                </div>
            }
            size="lg"
            glowColor="blue"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={onClose} disabled={loading} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !formData.parentNodeId || !formData.childNodeId}
                        loading={loading}
                        icon={Save}
                        className="flex-1"
                    >
                        {isEdit ? 'Mettre à jour' : 'Créer la relation'}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        {/* Parent Selection */}
                        <LiquidSelect
                            label={isPairing ? 'Premier partenaire *' : 'Cultivar parent *'}
                            value={formData.parentNodeId || ''}
                            onChange={(v) => handleChange('parentNodeId', v)}
                            disabled={isEdit}
                            options={[
                                { value: '', label: 'Sélectionner un parent...' },
                                ...store.nodes.map(node => ({
                                    value: node.id,
                                    label: node.cultivarName
                                }))
                            ]}
                        />
                        {parentNode && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: parentNode.color }} />
                                <span className="text-sm text-white">{parentNode.cultivarName}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {/* Child Selection */}
                        <LiquidSelect
                            label={isPairing ? 'Second partenaire *' : 'Cultivar enfant *'}
                            value={formData.childNodeId || ''}
                            onChange={(v) => handleChange('childNodeId', v)}
                            disabled={isEdit}
                            options={[
                                { value: '', label: 'Sélectionner un enfant...' },
                                ...store.nodes
                                    .filter(n => n.id !== formData.parentNodeId)
                                    .map(node => ({
                                        value: node.id,
                                        label: node.cultivarName
                                    }))
                            ]}
                        />
                        {childNode && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: childNode.color }} />
                                <span className="text-sm text-white">{childNode.cultivarName}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Relationship Type */}
                <LiquidSelect
                    label="Type de relation *"
                    value={formData.relationshipType || 'parent'}
                    onChange={(v) => handleChange('relationshipType', v)}
                    options={relationshipTypes}
                />
                {isPairing && (
                    <p className="text-white/40 text-xs -mt-2">
                        Lie visuellement ces deux nœuds comme un couple parental : leurs enfants communs se
                        connecteront depuis le milieu de cette liaison plutôt que par deux lignes séparées.
                    </p>
                )}

                {/* Méthode d'insémination/pollinisation — sans objet pour un lien de couple */}
                {!isPairing && (
                    <>
                        <LiquidSelect
                            label="Méthode d'insémination"
                            value={formData.pollinationMethod || ''}
                            onChange={(v) => handleChange('pollinationMethod', v)}
                            options={POLLINATION_METHODS}
                        />
                        <p className="text-white/40 text-xs -mt-2">
                            Technique physique de pollinisation — pour un rétrocroisement (BX), voir le champ Génération sur le nœud enfant.
                        </p>
                    </>
                )}

                {/* Relationship Preview */}
                {parentNode && childNode && (
                    <LiquidCard className="p-4">
                        <p className="text-xs text-white/40 mb-2">Aperçu de la relation</p>
                        {isPairing ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: parentNode.color }} />
                                    <span className="text-sm text-white">{parentNode.cultivarName}</span>
                                </div>
                                <span className="text-pink-400 text-sm">💑 ─────</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: childNode.color }} />
                                    <span className="text-sm text-white">{childNode.cultivarName}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: parentNode.color }} />
                                    <span className="text-sm text-white">{parentNode.cultivarName}</span>
                                </div>
                                <ArrowDown className="w-4 h-4 text-blue-400" />
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: childNode.color }} />
                                    <span className="text-sm text-white">{childNode.cultivarName}</span>
                                </div>
                            </div>
                        )}
                    </LiquidCard>
                )}

                {/* Notes */}
                <LiquidTextarea
                    label="Notes sur cette relation (optionnel)"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="ex: Croisement effectué en mai 2024..."
                    maxLength={500}
                    rows={2}
                />
            </form>
        </LiquidModal>
    );
};

export default EdgeFormModal;
