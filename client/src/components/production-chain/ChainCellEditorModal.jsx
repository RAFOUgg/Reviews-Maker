/**
 * ChainCellEditorModal Component
 *
 * Édition d'une cellule de pipeline attachée à un nœud/liaison de la chaîne de production.
 * Rendu générique piloté par les champs réellement présents dans le snapshot (data) — les
 * mêmes libellés/unités/options que le formulaire de création (config *SidebarContent.js via
 * getFieldMeta), pas de schéma dupliqué.
 *
 * Deux modes :
 * - Édition d'une cellule déjà attachée (importée depuis une fiche technique) : champs déjà
 *   présents + possibilité d'en ajouter d'autres du même pipeline.
 * - Création directe (cell.isNew) : pas de fiche source, on choisit juste un type de pipeline
 *   et on ajoute les champs à la main — pour noter une donnée sur la liaison/le nœud sans avoir
 *   à passer par l'import d'une review existante.
 */

import React, { useState, useEffect } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidSelect, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { getFieldMeta, getFieldSchemaForPipeline, getGeneralFieldSchema } from '../../utils/chainCellPipelines';
import { Save, X, Trash2, Plus } from 'lucide-react';

const META_KEYS = new Set(['timestamp', 'label', 'date', 'phase', '_meta']);

const DIRECT_PIPELINE_OPTIONS = [
    { value: 'culture', label: 'Culture' },
    { value: 'curing', label: 'Curing / Maturation' },
    { value: 'separation', label: 'Séparation' },
    { value: 'extraction', label: 'Extraction' }
];

// Schéma des champs disponibles à ajouter pour le type de pipeline de la cellule en cours —
// couvre à la fois les cellules importées ('general' a besoin du reviewType de la fiche source)
// et les cellules créées directement (toujours culture/curing/separation/extraction).
function getSchemaForCell(cell) {
    if (!cell?.pipelineType) return { sections: [] };
    if (cell.pipelineType === 'general') {
        return getGeneralFieldSchema(cell.sourceReviewType, cell.timestamp);
    }
    if (cell.pipelineType === 'recipe') return { sections: [] };
    return getFieldSchemaForPipeline(cell.pipelineType);
}

const ChainCellEditorModal = () => {
    const store = useProductionChainStore();
    const context = store.editingCell;
    const [values, setValues] = useState({});
    const [pipelineType, setPipelineType] = useState('');
    const [cellLabel, setCellLabel] = useState('');
    const [fieldToAdd, setFieldToAdd] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!context?.cell) return;
        setValues({ ...context.cell.data });
        setPipelineType(context.cell.pipelineType || '');
        setCellLabel(context.cell.cellLabel || '');
        setFieldToAdd('');
    }, [context]);

    if (!context) return null;
    const { targetType, targetId, cell } = context;
    const isNew = !!cell.isNew;

    const fieldKeys = Object.keys(values || {}).filter(k => !META_KEYS.has(k));

    const activeCell = { ...cell, pipelineType };
    const schema = getSchemaForCell(activeCell);
    const availableFields = schema.sections.flatMap(section =>
        section.fields
            .filter(f => !fieldKeys.includes(f.key))
            .map(f => ({ ...f, sectionLabel: section.label }))
    );

    const handleChange = (key, value) => setValues(prev => ({ ...prev, [key]: value }));

    const handleAddField = () => {
        if (!fieldToAdd) return;
        const field = schema.sections.flatMap(s => s.fields).find(f => f.key === fieldToAdd);
        const defaultValue = field?.defaultValue !== undefined ? field.defaultValue : (field?.type === 'multiselect' ? [] : '');
        handleChange(fieldToAdd, defaultValue);
        setFieldToAdd('');
    };

    const handleRemoveField = (key) => {
        setValues(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isNew) {
                const label = DIRECT_PIPELINE_OPTIONS.find(o => o.value === pipelineType)?.label || pipelineType;
                await store.addDirectCell(targetType, targetId, {
                    pipelineType,
                    pipelineLabel: label,
                    cellLabel: cellLabel || label,
                    sourceLabel: 'Saisie manuelle',
                    sourceReviewId: null,
                    sourceReviewType: null,
                    timestamp: `manual-${Date.now()}`,
                    data: values
                });
            } else {
                await store.updateAttachedCell(targetType, targetId, cell.id, values);
            }
            store.closeCellEditor();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await store.removeAttachedCell(targetType, targetId, cell.id);
            store.closeCellEditor();
        } finally {
            setSaving(false);
        }
    };

    const renderField = (key) => {
        const meta = getFieldMeta(pipelineType, key);
        const value = values[key] ?? '';
        const label = meta?.label || key;

        let input;
        if (meta?.type === 'select' && meta.options?.length > 0) {
            input = (
                <LiquidSelect
                    label={label}
                    value={value}
                    onChange={(v) => handleChange(key, v)}
                    options={meta.options.map(o => ({
                        value: typeof o === 'string' ? o : o.value,
                        label: typeof o === 'string' ? o : o.label
                    }))}
                />
            );
        } else if (meta?.type === 'number' || meta?.type === 'slider') {
            input = (
                <LiquidInput
                    type="number"
                    label={`${label}${meta.unit ? ` (${meta.unit})` : ''}`}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
            );
        } else if (Array.isArray(value)) {
            input = (
                <LiquidInput
                    label={label}
                    value={value.join(', ')}
                    onChange={(e) => handleChange(key, e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                />
            );
        } else {
            input = (
                <LiquidInput
                    label={label}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                />
            );
        }

        return (
            <div key={key} className="relative group">
                {input}
                <button
                    type="button"
                    title="Retirer ce champ"
                    onClick={() => handleRemoveField(key)}
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                    <X size={12} />
                </button>
            </div>
        );
    };

    const canSave = isNew ? !!pipelineType : true;

    return (
        <LiquidModal
            isOpen={true}
            onClose={store.closeCellEditor}
            title={
                <div className="flex items-center gap-2">
                    <span>{isNew ? '➕' : '✏️'}</span>
                    <span>{isNew ? 'Ajouter des données directement' : `${cell.pipelineLabel} — ${cell.cellLabel}`}</span>
                </div>
            }
            size="lg"
            glowColor="emerald"
            footer={
                <div className="flex gap-3">
                    {!isNew && (
                        <LiquidButton variant="danger" onClick={handleDelete} disabled={saving} icon={Trash2}>
                            Retirer
                        </LiquidButton>
                    )}
                    <div className="flex-1" />
                    <LiquidButton variant="ghost" onClick={store.closeCellEditor} disabled={saving} icon={X}>
                        Annuler
                    </LiquidButton>
                    <LiquidButton variant="primary" onClick={handleSave} disabled={saving || !canSave} loading={saving} icon={Save}>
                        Sauvegarder
                    </LiquidButton>
                </div>
            }
        >
            <div className="space-y-4">
                {isNew ? (
                    <>
                        <p className="text-xs text-white/40">
                            Note une donnée de pipeline directement sur cette cible, sans passer par l'import d'une fiche technique.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <LiquidSelect
                                label="Type de pipeline *"
                                value={pipelineType}
                                onChange={setPipelineType}
                                options={[{ value: '', label: 'Sélectionner...' }, ...DIRECT_PIPELINE_OPTIONS]}
                            />
                            <LiquidInput
                                label="Nom de cette donnée (optionnel)"
                                value={cellLabel}
                                onChange={(e) => setCellLabel(e.target.value)}
                                placeholder="ex: Pressage, Jour 3..."
                                maxLength={100}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-xs text-white/40">
                        Depuis <span className="text-white/60">{cell.sourceLabel}</span> — cette cellule est un snapshot indépendant, l'éditer ne modifie pas la fiche technique d'origine.
                    </p>
                )}

                {(!isNew || pipelineType) && (
                    fieldKeys.length === 0 ? (
                        <p className="text-sm text-white/40">Aucune donnée pour le moment.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {fieldKeys.map(renderField)}
                        </div>
                    )
                )}

                {(!isNew || pipelineType) && availableFields.length > 0 && (
                    <LiquidCard className="p-3">
                        <p className="text-sm font-medium text-white mb-2">➕ Ajouter un champ</p>
                        <div className="flex items-center gap-2">
                            <LiquidSelect
                                value={fieldToAdd}
                                onChange={setFieldToAdd}
                                options={[
                                    { value: '', label: 'Choisir un champ...' },
                                    ...availableFields.map(f => ({ value: f.key, label: `${f.sectionLabel ? `${f.sectionLabel} — ` : ''}${f.label}` }))
                                ]}
                            />
                            <LiquidButton variant="primary" onClick={handleAddField} disabled={!fieldToAdd} icon={Plus}>
                                Ajouter
                            </LiquidButton>
                        </div>
                    </LiquidCard>
                )}
            </div>
        </LiquidModal>
    );
};

export default ChainCellEditorModal;
