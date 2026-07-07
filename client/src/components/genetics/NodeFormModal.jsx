/**
 * NodeFormModal Component
 * Modale pour créer/éditer un nœud (cultivar) — génétiques de base (nom, couleur, photo,
 * sexe/type/breeder/ratio) + sections de breeding avancées pilotées par phenoNodeFields.js
 * (identité/génération, type génétique, sélection, caractères techniques, traçabilité, statut).
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidSelect, LiquidTextarea, LiquidCard, LiquidToggle } from '@/components/ui/LiquidUI';
import useGeneticsStore from '../../store/useGeneticsStore';
import { PHENO_NODE_SECTIONS } from '../../config/phenoNodeFields';
import { computeInbreedingCoefficient } from '../../utils/inbreedingCoefficient';
import { Save, X, ChevronDown, Lock, Unlock } from 'lucide-react';

const NodeFormModal = ({ isEdit, onClose }) => {
    const store = useGeneticsStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openSections, setOpenSections] = useState(new Set());
    // Coefficient de consanguinité : calculé automatiquement depuis l'arbre par défaut (cf.
    // DOCUMENTATION/DATA_REFERENCE/05_GENETIQUE_GENEALOGIE.md §5) — l'utilisateur peut forcer une
    // saisie manuelle (ex: nœud pas encore relié à ses parents dans l'arbre, ou valeur connue par
    // ailleurs) via l'échappatoire "Remplacer manuellement".
    const [overrideInbreeding, setOverrideInbreeding] = useState(false);

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

    const toggleSection = (sectionId) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Persiste le coefficient de consanguinité calculé automatiquement (sauf si l'utilisateur
        // a explicitement choisi de le remplacer manuellement) — sans ceci, la valeur affichée
        // dans le formulaire ne serait jamais réellement sauvegardée en base.
        let submitData = formData;
        if (isEdit && formData.id && !overrideInbreeding) {
            const computed = computeInbreedingCoefficient(formData.id, store.nodes || [], store.edges || []);
            if (computed.value !== null) {
                submitData = {
                    ...formData,
                    genetics: { ...(formData.genetics || {}), inbreedingLevel: computed.value.toFixed(4) }
                };
            }
        }

        try {
            if (isEdit) {
                await store.updateNode(submitData.id, submitData);
            } else {
                const { _pendingParentId, _pendingParentIds, _pendingChildId, ...nodeData } = formData;
                const result = await store.addNode(nodeData);
                // Un seul parent (clic droit "Ajouter enfant" sur un nœud) ou les deux membres
                // d'un couple d'un coup (clic droit "Ajouter un enfant à ce couple" sur un
                // PairingEdge) — jamais les deux en même temps.
                const parentIds = _pendingParentIds || (_pendingParentId ? [_pendingParentId] : []);
                if (parentIds.length > 0 && result?.data?.id) {
                    for (const parentId of parentIds) {
                        await store.addEdge({
                            parentNodeId: parentId,
                            childNodeId: result.data.id,
                            relationshipType: 'parent'
                        });
                    }
                }
                // Symétrique : "Ajouter un parent" depuis le clic droit d'un nœud existant — le
                // nouveau nœud créé ici devient le PARENT, l'edge part donc de lui vers ce nœud.
                if (_pendingChildId && result?.data?.id) {
                    await store.addEdge({
                        parentNodeId: result.data.id,
                        childNodeId: _pendingChildId,
                        relationshipType: 'parent'
                    });
                }
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const renderField = (field) => {
        const value = formData.genetics?.[field.id];

        if (field.id === 'inbreedingLevel') {
            const computable = isEdit && formData.id;
            const computed = computable
                ? computeInbreedingCoefficient(formData.id, store.nodes || [], store.edges || [])
                : { value: null, reason: 'Disponible uniquement après création du nœud (une fois relié à ses parents dans l\'arbre).' };
            const showManual = overrideInbreeding || computed.value === null;

            return (
                <div key={field.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white/80">{field.label}</label>
                        {computed.value !== null && (
                            <button
                                type="button"
                                onClick={() => setOverrideInbreeding(v => !v)}
                                className="text-xs text-white/50 hover:text-white/80 flex items-center gap-1"
                            >
                                {overrideInbreeding ? <><Unlock className="w-3 h-3" /> Revenir au calcul auto</> : <><Lock className="w-3 h-3" /> Remplacer manuellement</>}
                            </button>
                        )}
                    </div>
                    {!showManual ? (
                        <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <span className="text-white font-semibold">F = {(computed.value * 100).toFixed(2)}%</span>
                            <span className="text-white/40 text-xs ml-2">(calculé automatiquement)</span>
                        </div>
                    ) : (
                        <LiquidInput
                            value={value ?? ''}
                            onChange={(e) => handleGeneticsChange(field.id, e.target.value)}
                            placeholder="ex: 0.25 (1/4) — coefficient de Wright, 0 à 1"
                        />
                    )}
                    <p className="text-white/40 text-xs ml-1">{computed.reason}</p>
                </div>
            );
        }

        if (field.type === 'select') {
            return (
                <div key={field.id} className="space-y-1">
                    <LiquidSelect
                        label={field.label}
                        value={value || ''}
                        onChange={(v) => handleGeneticsChange(field.id, v)}
                        options={field.options}
                    />
                    {field.hint && <p className="text-white/40 text-xs ml-1">{field.hint}</p>}
                </div>
            );
        }

        if (field.type === 'number-unit') {
            // Stocke { value, unit } — jamais de string brute mélangeant chiffre et unité.
            const compound = (value && typeof value === 'object') ? value : { value: '', unit: field.defaultUnit };
            return (
                <div key={field.id} className="space-y-1">
                    <div className="flex items-end gap-2">
                        <LiquidInput
                            type="number"
                            label={field.label}
                            value={compound.value ?? ''}
                            onChange={(e) => handleGeneticsChange(field.id, { ...compound, value: e.target.value })}
                            wrapperClassName="flex-1"
                        />
                        <LiquidSelect
                            value={compound.unit || field.defaultUnit}
                            onChange={(unit) => handleGeneticsChange(field.id, { ...compound, unit })}
                            options={field.units}
                            wrapperClassName="w-32"
                        />
                    </div>
                    {field.hint && <p className="text-white/40 text-xs ml-1">{field.hint}</p>}
                </div>
            );
        }

        if (field.type === 'textarea') {
            return (
                <LiquidTextarea
                    key={field.id}
                    label={field.label}
                    value={value || ''}
                    onChange={(e) => handleGeneticsChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={2}
                />
            );
        }

        if (field.type === 'checkbox') {
            return (
                <LiquidToggle
                    key={field.id}
                    label={field.label}
                    checked={!!value}
                    onChange={(checked) => handleGeneticsChange(field.id, checked)}
                    size="sm"
                />
            );
        }

        return (
            <LiquidInput
                key={field.id}
                type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                label={field.label}
                value={value ?? ''}
                onChange={(e) => handleGeneticsChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                hint={field.hint}
                {...(field.type === 'number' ? { min: field.min ?? 0, max: field.max, step: field.step ?? 0.1 } : {})}
            />
        );
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
            size="wide"
            glowColor="green"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={onClose} disabled={loading} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !formData.cultivarName}
                        loading={loading}
                        icon={Save}
                        className="flex-1"
                    >
                        {isEdit ? 'Mettre à jour' : 'Ajouter'}
                    </LiquidButton>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                {error && (
                    <LiquidCard className="p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p className="text-red-400 text-sm">{error}</p>
                    </LiquidCard>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Cultivar Name */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">Nom du cultivar *</label>
                        <LiquidInput
                            value={formData.cultivarName || ''}
                            onChange={(e) => handleChange('cultivarName', e.target.value)}
                            placeholder="ex: Gorilla Glue #4"
                            required
                            maxLength={200}
                        />
                        <p className="text-xs text-white/40">{(formData.cultivarName || '').length}/200</p>
                    </div>

                    {/* Photo */}
                    <LiquidInput
                        label="Photo (URL)"
                        value={formData.image || ''}
                        onChange={(e) => handleChange('image', e.target.value)}
                        placeholder="https://..."
                        hint="Affichée sur le nœud de l'arbre"
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
                </div>

                {/* Genetics Section — champs historiques, clés à ne pas renommer */}
                <LiquidCard className="p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-white">Informations génétiques de base</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <LiquidSelect
                            label="Sexe"
                            value={formData.genetics?.sex || 'unknown'}
                            onChange={(v) => handleGeneticsChange('sex', v)}
                            options={[
                                { value: 'unknown', label: '❓ Inconnu / non sexé' },
                                { value: 'female', label: '♀ Femelle' },
                                { value: 'male', label: '♂ Mâle' }
                            ]}
                        />

                        <LiquidSelect
                            label="Type"
                            value={formData.genetics?.type || ''}
                            onChange={(v) => handleGeneticsChange('type', v)}
                            options={[
                                { value: '', label: 'Sélectionner...' },
                                { value: 'Indica', label: 'Indica' },
                                { value: 'Sativa', label: 'Sativa' },
                                { value: 'Hybride', label: 'Hybride' },
                                { value: 'Ruderalis', label: 'Ruderalis' },
                                { value: 'Chanvre', label: 'Chanvre (Hemp)' }
                            ]}
                        />

                        <LiquidInput
                            label="Breeder"
                            value={formData.genetics?.breeder || ''}
                            onChange={(e) => handleGeneticsChange('breeder', e.target.value)}
                            placeholder="ex: Exotic Genetix"
                        />

                        <LiquidInput
                            type="number"
                            min="0"
                            max="100"
                            label="Ratio Indica/Sativa (%)"
                            value={formData.genetics?.ratio ?? ''}
                            onChange={(e) => handleGeneticsChange('ratio', e.target.value)}
                            placeholder="ex: 70 (0 = Sativa pur, 100 = Indica pur)"
                            hint="Classification empirique/commerciale, pas une taxonomie botanique validée — le chémotype (profil terpénique/cannabinoïde) est aujourd'hui considéré plus fiable scientifiquement."
                        />
                    </div>
                </LiquidCard>

                {/* Sections de breeding avancées — repliables, pilotées par phenoNodeFields.js.
                    Volontairement absentes ici : odeur/goût/terpènes/cannabinoïdes/résine/trichomes/
                    couleur (déjà sur la fiche technique liée) et sexe des parents/lien parent-enfant
                    (déjà représentés par le graphe lui-même). */}
                {PHENO_NODE_SECTIONS.map(section => {
                    const isOpen = openSections.has(section.id);
                    return (
                        <LiquidCard key={section.id} className="p-0 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <span className="text-sm font-semibold text-white flex items-center gap-2">
                                    <span>{section.icon}</span>
                                    {section.label}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <div className="p-4 pt-0 space-y-4">
                                    {section.sectionHint && (
                                        <p className="text-white/40 text-xs -mt-2">{section.sectionHint}</p>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {section.fields.map(field => (
                                            <div
                                                key={field.id}
                                                className={field.type === 'textarea' ? 'sm:col-span-2 lg:col-span-3' : ''}
                                            >
                                                {renderField(field)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </LiquidCard>
                    );
                })}

                {/* Notes */}
                <LiquidTextarea
                    label="Notes personnelles"
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Observations, caractéristiques, etc..."
                    maxLength={500}
                    rows={3}
                    hint={`${(formData.notes || '').length}/500`}
                />
            </form>
        </LiquidModal>
    );
};

export default NodeFormModal;
