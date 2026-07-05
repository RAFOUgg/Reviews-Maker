/**
 * ChainEdgeFormModal Component
 * Modale pour créer/éditer une liaison de transformation entre deux fiches techniques
 * Modelé sur EdgeFormModal.jsx (genetics), avec technique/date/notes au lieu de relationshipType.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LiquidModal, LiquidButton, LiquidSelect, LiquidInput, LiquidTextarea, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { getPipelineSummaryForEdge, getTechniqueOptionsForReviewType } from '../../utils/chainPipelineSummary';
import { Save, X, ArrowDown, Sparkles } from 'lucide-react';

const ChainEdgeFormModal = ({ onClose }) => {
    const store = useProductionChainStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pipelineSummary, setPipelineSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [customTechnique, setCustomTechnique] = useState(false);

    const formData = store.edgeFormData || {};
    const isEdit = formData.id !== undefined;

    const handleChange = (field, value) => {
        store.updateEdgeFormData({ [field]: value });
    };

    // Résumé du pipeline déjà capturé sur la fiche destination (curing/séparation/extraction/
    // recette selon son type) — les liaisons "reçoivent" les données des fiches techniques
    // plutôt que de les dupliquer manuellement. Pré-remplit `technique` si vide, création uniquement.
    useEffect(() => {
        const targetNode = store.nodes.find(n => n.id === formData.targetNodeId);
        if (!targetNode) {
            setPipelineSummary(null);
            return;
        }

        let cancelled = false;
        setLoadingSummary(true);
        fetch(`/api/reviews/${targetNode.reviewId}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(review => {
                if (cancelled || !review) return;
                const flat = {
                    ...review,
                    ...(review.flowerData || {}),
                    ...(review.hashData || {}),
                    ...(review.concentrateData || {}),
                    ...(review.edibleData || {})
                };
                const summary = getPipelineSummaryForEdge(targetNode.reviewType, flat);
                setPipelineSummary(summary);
                if (!isEdit && summary?.technique && !store.edgeFormData?.technique) {
                    store.updateEdgeFormData({ technique: summary.technique });
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoadingSummary(false); });

        return () => { cancelled = true };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.targetNodeId]);

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

    // Vocabulaire canonique du champ "technique" de la fiche destination (mêmes value/label que
    // son propre pipeline : séparation pour hash, extraction pour concentré, curing pour fleur).
    // Vide pour edible/aucune destination sélectionnée -> repli sur la saisie libre historique.
    const techniqueOptions = useMemo(
        () => getTechniqueOptionsForReviewType(targetNode?.reviewType),
        [targetNode?.reviewType]
    );
    const matchedTechnique = techniqueOptions.find(o => o.label === formData.technique);
    const showCustomTechniqueInput = techniqueOptions.length === 0 || (!!formData.technique && !matchedTechnique) || customTechnique;

    // Edible sans vocabulaire de technique fixe (getTechniqueOptionsForReviewType renvoie []) —
    // propose un choix rapide entre la préparation générique et la préparation spécifique au
    // typeComestible détecté sur la fiche destination (ex: "Préparation culinaire" vs
    // "Préparation Cookies"), plutôt que de forcer un seul repli silencieux.
    const quickTechniqueSuggestions = useMemo(() => {
        if (pipelineSummary?.kind !== 'recipe') return [];
        const suggestions = [];
        if (pipelineSummary.typeComestible) suggestions.push(`Préparation ${pipelineSummary.typeComestible}`);
        suggestions.push('Préparation culinaire');
        return [...new Set(suggestions)];
    }, [pipelineSummary]);

    const handleTechniqueSelectChange = (v) => {
        if (v === '__custom__') {
            setCustomTechnique(true);
            return;
        }
        setCustomTechnique(false);
        handleChange('technique', v);
    };

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
            size="xl"
            glowColor="amber"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={onClose} disabled={loading} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !formData.sourceNodeId || !formData.targetNodeId}
                        loading={loading}
                        icon={Save}
                        className="flex-1"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <LiquidSelect
                            label="Produit source *"
                            value={formData.sourceNodeId || ''}
                            onChange={(v) => handleChange('sourceNodeId', v)}
                            disabled={isEdit}
                            options={[
                                { value: '', label: 'Sélectionner un produit source...' },
                                ...store.nodes.map(node => ({ value: node.id, label: node.label }))
                            ]}
                        />
                        {sourceNode && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                                <span className="text-sm text-white">{sourceNode.label}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <LiquidSelect
                            label="Produit destination *"
                            value={formData.targetNodeId || ''}
                            onChange={(v) => handleChange('targetNodeId', v)}
                            disabled={isEdit}
                            options={[
                                { value: '', label: 'Sélectionner un produit destination...' },
                                ...store.nodes
                                    .filter(n => n.id !== formData.sourceNodeId)
                                    .map(node => ({ value: node.id, label: node.label }))
                            ]}
                        />
                        {targetNode && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5">
                                <span className="text-sm text-white">{targetNode.label}</span>
                            </div>
                        )}
                    </div>
                </div>

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

                {loadingSummary && (
                    <p className="text-xs text-white/40">Recherche des données de pipeline sur la fiche destination...</p>
                )}

                {pipelineSummary && (
                    <LiquidCard className="p-4" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                        <p className="text-xs text-emerald-400 mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Données trouvées sur la fiche destination — {pipelineSummary.label}
                        </p>
                        <div className="text-sm text-white space-y-1">
                            {pipelineSummary.technique && <p>Méthode : <span className="text-white/70">{pipelineSummary.technique}</span></p>}
                            {pipelineSummary.materialType && <p>Matière première : <span className="text-white/70">{pipelineSummary.materialType}</span></p>}
                            {pipelineSummary.materialState && <p>État de la matière : <span className="text-white/70">{pipelineSummary.materialState}</span></p>}
                            {pipelineSummary.mesh && <p>Maillage utilisé : <span className="text-white/70">{pipelineSummary.mesh}</span></p>}
                            {(pipelineSummary.dosage || pipelineSummary.dosageUnit) && (
                                <p>Dosage : <span className="text-white/70">{pipelineSummary.dosage ?? '?'} {pipelineSummary.dosageUnit || ''}</span></p>
                            )}
                            {pipelineSummary.stepCount > 0 && <p>Étapes enregistrées : <span className="text-white/70">{pipelineSummary.stepCount}</span></p>}
                            {pipelineSummary.detail && <p className="text-white/70">{pipelineSummary.detail}</p>}
                        </div>
                    </LiquidCard>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        {techniqueOptions.length > 0 ? (
                            <>
                                <LiquidSelect
                                    label="Technique utilisée"
                                    value={showCustomTechniqueInput ? '__custom__' : (matchedTechnique?.label || '')}
                                    onChange={handleTechniqueSelectChange}
                                    options={[
                                        { value: '', label: 'Sélectionner...' },
                                        ...techniqueOptions.map(o => ({ value: o.label, label: o.label })),
                                        { value: '__custom__', label: '✏️ Autre / saisie libre...' }
                                    ]}
                                />
                                {showCustomTechniqueInput && (
                                    <LiquidInput
                                        value={formData.technique || ''}
                                        onChange={(e) => handleChange('technique', e.target.value)}
                                        placeholder="ex: Extraction rosin 90µ, Curing 30j..."
                                        maxLength={200}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <LiquidInput
                                    label="Technique utilisée"
                                    value={formData.technique || ''}
                                    onChange={(e) => handleChange('technique', e.target.value)}
                                    placeholder="ex: Extraction rosin 90µ, Curing 30j..."
                                    maxLength={200}
                                />
                                {quickTechniqueSuggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {quickTechniqueSuggestions.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => handleChange('technique', s)}
                                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                                    formData.technique === s
                                                        ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300'
                                                        : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <LiquidInput
                        type="date"
                        label="Date de la manipulation"
                        value={formData.date || ''}
                        onChange={(e) => handleChange('date', e.target.value)}
                    />
                </div>

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
