/**
 * ChainCellEditorModal Component
 *
 * Édition d'une cellule de pipeline attachée à un nœud/liaison de la chaîne de production.
 * Rendu générique piloté par les champs réellement présents dans le snapshot (data) — les
 * mêmes libellés/unités/options que le formulaire de création (config *SidebarContent.js via
 * getFieldMeta), pas de schéma dupliqué.
 */

import React, { useState, useEffect } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidSelect, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { getFieldMeta } from '../../utils/chainCellPipelines';
import { Save, X, Trash2 } from 'lucide-react';

const META_KEYS = new Set(['timestamp', 'label', 'date', 'phase', '_meta']);

const ChainCellEditorModal = () => {
    const store = useProductionChainStore();
    const context = store.editingCell;
    const [values, setValues] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (context?.cell) setValues({ ...context.cell.data });
    }, [context]);

    if (!context) return null;
    const { targetType, targetId, cell } = context;

    const fieldKeys = Object.keys(cell.data || {}).filter(k => !META_KEYS.has(k));

    const handleChange = (key, value) => setValues(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await store.updateAttachedCell(targetType, targetId, cell.id, values);
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
        const meta = getFieldMeta(cell.pipelineType, key);
        const value = values[key] ?? '';
        const label = meta?.label || key;

        if (meta?.type === 'select' && meta.options?.length > 0) {
            return (
                <LiquidSelect
                    key={key}
                    label={label}
                    value={value}
                    onChange={(v) => handleChange(key, v)}
                    options={meta.options.map(o => ({
                        value: typeof o === 'string' ? o : o.value,
                        label: typeof o === 'string' ? o : o.label
                    }))}
                />
            );
        }

        if (meta?.type === 'number' || meta?.type === 'slider') {
            return (
                <LiquidInput
                    key={key}
                    type="number"
                    label={`${label}${meta.unit ? ` (${meta.unit})` : ''}`}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
            );
        }

        if (Array.isArray(value)) {
            return (
                <LiquidInput
                    key={key}
                    label={label}
                    value={value.join(', ')}
                    onChange={(e) => handleChange(key, e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                />
            );
        }

        return (
            <LiquidInput
                key={key}
                label={label}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
            />
        );
    };

    return (
        <LiquidModal
            isOpen={true}
            onClose={store.closeCellEditor}
            title={
                <div className="flex items-center gap-2">
                    <span>✏️</span>
                    <span>{cell.pipelineLabel} — {cell.cellLabel}</span>
                </div>
            }
            size="lg"
            glowColor="emerald"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="danger" onClick={handleDelete} disabled={saving} icon={Trash2}>
                        Retirer
                    </LiquidButton>
                    <div className="flex-1" />
                    <LiquidButton variant="ghost" onClick={store.closeCellEditor} disabled={saving} icon={X}>
                        Annuler
                    </LiquidButton>
                    <LiquidButton variant="primary" onClick={handleSave} disabled={saving} loading={saving} icon={Save}>
                        Sauvegarder
                    </LiquidButton>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-xs text-white/40">
                    Depuis <span className="text-white/60">{cell.sourceLabel}</span> — cette cellule est un snapshot indépendant, l'éditer ne modifie pas la fiche technique d'origine.
                </p>
                {fieldKeys.length === 0 ? (
                    <p className="text-sm text-white/40">Cellule vide.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fieldKeys.map(renderField)}
                    </div>
                )}
            </div>
        </LiquidModal>
    );
};

export default ChainCellEditorModal;
