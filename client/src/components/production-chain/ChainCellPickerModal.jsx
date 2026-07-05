/**
 * ChainCellPickerModal Component
 *
 * Import en masse de cellules de pipeline (culture/curing/séparation/extraction) vers un ou
 * plusieurs nœuds/liaisons de la chaîne de production. Affiche "juste la trame" : la liste des
 * cellules déjà remplies sur la fiche technique source, à cocher, puis la liste des cibles
 * (bulles/liaisons) sur lesquelles les dupliquer en une seule action.
 *
 * Ouvert via store.openCellPicker(targetType, targetIds) — pré-sélectionne la/les cible(s)
 * d'origine (menu contextuel d'un nœud ou d'une liaison), mais permet d'en cocher d'autres pour
 * un import groupé ("représentative à 100% de plusieurs pipelines à la fois").
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LiquidModal, LiquidButton, LiquidSelect, LiquidTabs, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { getPipelineDefsForReviewType, getCellsForPipelineDef, getFieldSchemaForPipeline, READONLY_CELL_CATEGORIES } from '../../utils/chainCellPipelines';
import PipelineCellEditor from '../pipelines/core/PipelineCellEditor';
import { Download, CheckSquare, Square, Plus, Pencil, X, Loader2 } from 'lucide-react';

const ChainCellPickerModal = () => {
    const store = useProductionChainStore();
    const picker = store.cellPicker;

    const [sourceReviewId, setSourceReviewId] = useState('');
    const [pipelineKey, setPipelineKey] = useState('');
    const [review, setReview] = useState(null);
    const [loadingReview, setLoadingReview] = useState(false);
    const [selectedTimestamps, setSelectedTimestamps] = useState(new Set());
    const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());
    const [selectedEdgeIds, setSelectedEdgeIds] = useState(new Set());
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState(null);
    const [editingCell, setEditingCell] = useState(null);
    const [savingCell, setSavingCell] = useState(false);

    // Sources possibles = produits déjà présents dans la chaîne (les seuls dont on a la review)
    const sourceOptions = useMemo(() => (
        store.nodes.filter(n => n.reviewId && !n.reviewOrphaned)
    ), [store.nodes]);

    const sourceNode = sourceOptions.find(n => n.reviewId === sourceReviewId);
    const pipelineDefs = useMemo(() => getPipelineDefsForReviewType(sourceNode?.reviewType), [sourceNode?.reviewType]);
    const activePipelineDef = pipelineDefs.find(p => p.key === pipelineKey);

    // Pré-sélectionne la/les cible(s) d'origine à l'ouverture du picker
    useEffect(() => {
        if (!picker) return;
        setSelectedNodeIds(new Set(picker.targetType === 'node' ? picker.targetIds : []));
        setSelectedEdgeIds(new Set(picker.targetType === 'edge' ? picker.targetIds : []));
        setSourceReviewId('');
        setPipelineKey('');
        setReview(null);
        setSelectedTimestamps(new Set());
        setError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [picker?.targetType, picker?.targetIds?.join(',')]);

    useEffect(() => {
        setPipelineKey('');
        setReview(null);
        setSelectedTimestamps(new Set());
    }, [sourceReviewId]);

    useEffect(() => {
        if (!sourceReviewId || !pipelineKey) return;
        let cancelled = false;
        setLoadingReview(true);
        setError(null);
        fetch(`/api/reviews/${sourceReviewId}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject(new Error('Fiche technique introuvable')))
            .then(data => {
                if (cancelled) return;
                const flat = {
                    ...data,
                    ...(data.flowerData || {}),
                    ...(data.hashData || {}),
                    ...(data.concentrateData || {})
                };
                setReview(flat);
            })
            .catch(err => !cancelled && setError(err.message || 'Erreur de chargement'))
            .finally(() => !cancelled && setLoadingReview(false));
        return () => { cancelled = true };
    }, [sourceReviewId, pipelineKey]);

    const cells = useMemo(
        () => (review && activePipelineDef ? getCellsForPipelineDef(review, activePipelineDef, sourceNode?.reviewType) : []),
        [review, activePipelineDef, sourceNode?.reviewType]
    );
    const filledCount = cells.filter(c => c.hasData).length;
    const isReadonlyCategory = activePipelineDef && READONLY_CELL_CATEGORIES.has(activePipelineDef.key);

    if (!picker) return null;

    const toggleTimestamp = (ts) => setSelectedTimestamps(prev => {
        const next = new Set(prev);
        next.has(ts) ? next.delete(ts) : next.add(ts);
        return next;
    });

    const toggleNodeTarget = (id) => setSelectedNodeIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const toggleEdgeTarget = (id) => setSelectedEdgeIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const handleSaveSourceCell = async (editedData) => {
        if (!sourceNode || !activePipelineDef) return;
        const { index, ...cleaned } = editedData;
        setSavingCell(true);
        setError(null);
        try {
            const res = await fetch(
                `/api/review-pipeline-cells/${sourceNode.reviewType}/${sourceNode.reviewId}/${activePipelineDef.key}`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ timestamp: index, data: cleaned })
                }
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Échec de la sauvegarde');
            }
            const { data: savedEntry } = await res.json();

            // Répercute immédiatement dans la trame locale — la fiche technique source est
            // remplie en simultané (écrit côté serveur), pas seulement un snapshot dans le picker.
            setReview(prev => {
                const dataKey = activePipelineDef.dataKey;
                const existing = Array.isArray(prev[dataKey]) ? prev[dataKey]
                    : (typeof prev[dataKey] === 'string' ? (JSON.parse(prev[dataKey] || '[]')) : []);
                const idx = existing.findIndex(e => String(e?.timestamp) === String(index));
                const nextEntries = idx >= 0
                    ? existing.map((e, i) => i === idx ? savedEntry : e)
                    : [...existing, savedEntry];
                return { ...prev, [dataKey]: nextEntries };
            });

            // La cellule qu'on vient de remplir devient immédiatement sélectionnable pour import
            setSelectedTimestamps(prev => new Set(prev).add(index));
            setEditingCell(null);
        } catch (err) {
            setError(err.message || 'Échec de la sauvegarde de la cellule');
        } finally {
            setSavingCell(false);
        }
    };

    const handleImport = async () => {
        if (!sourceNode || !activePipelineDef || selectedTimestamps.size === 0) return;
        if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) {
            setError('Sélectionnez au moins une bulle ou une liaison cible');
            return;
        }

        setImporting(true);
        setError(null);
        try {
            const cellsToImport = cells
                .filter(c => selectedTimestamps.has(c.timestamp))
                .map(c => ({
                    sourceReviewId: sourceNode.reviewId,
                    sourceReviewType: sourceNode.reviewType,
                    sourceLabel: sourceNode.label,
                    pipelineType: activePipelineDef.key,
                    pipelineLabel: activePipelineDef.label,
                    timestamp: c.timestamp,
                    cellLabel: c.cellLabel,
                    data: c.data
                }));

            if (selectedNodeIds.size > 0) {
                await store.attachCellsToTargets('node', [...selectedNodeIds], cellsToImport);
            }
            if (selectedEdgeIds.size > 0) {
                await store.attachCellsToTargets('edge', [...selectedEdgeIds], cellsToImport);
            }
            store.closeCellPicker();
        } catch (err) {
            setError(err.message || 'Import échoué');
        } finally {
            setImporting(false);
        }
    };

    const totalTargets = selectedNodeIds.size + selectedEdgeIds.size;

    return (
        <>
        <LiquidModal
            isOpen={true}
            onClose={store.closeCellPicker}
            title={
                <div className="flex items-center gap-2">
                    <Download size={18} />
                    <span>Importer des cellules de pipeline</span>
                </div>
            }
            size="full"
            glowColor="emerald"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={store.closeCellPicker} disabled={importing} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleImport}
                        disabled={importing || selectedTimestamps.size === 0 || totalTargets === 0}
                        loading={importing}
                        icon={Download}
                        className="flex-1"
                    >
                        Importer {selectedTimestamps.size > 0 ? `${selectedTimestamps.size} cellule${selectedTimestamps.size > 1 ? 's' : ''}` : ''}
                        {totalTargets > 0 ? ` → ${totalTargets} cible${totalTargets > 1 ? 's' : ''}` : ''}
                    </LiquidButton>
                </div>
            }
        >
            <div className="space-y-4">
                {error && (
                    <LiquidCard className="p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p className="text-red-400 text-sm">{error}</p>
                    </LiquidCard>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LiquidSelect
                        label="Fiche technique source"
                        value={sourceReviewId}
                        onChange={setSourceReviewId}
                        options={[
                            { value: '', label: 'Sélectionner un produit de la chaîne...' },
                            ...sourceOptions.map(n => ({ value: n.reviewId, label: n.label }))
                        ]}
                    />

                    {sourceNode && (
                        <div className="space-y-2">
                            <label className="text-xs text-white/50">Pipeline</label>
                            {pipelineDefs.length > 0 ? (
                                <LiquidTabs
                                    tabs={pipelineDefs.map(p => ({ id: p.key, label: p.label }))}
                                    activeTab={pipelineKey}
                                    onChange={setPipelineKey}
                                />
                            ) : (
                                <p className="text-sm text-white/40">Ce type de produit n'a pas de pipeline à cellules.</p>
                            )}
                        </div>
                    )}
                </div>

                {loadingReview && (
                    <p className="text-sm text-white/40 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Chargement de la trame...
                    </p>
                )}

                {!loadingReview && activePipelineDef && (
                    <LiquidCard className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-white">
                                Trame — {activePipelineDef.label} ({filledCount}/{cells.length} cellule{cells.length > 1 ? 's' : ''} remplie{filledCount > 1 ? 's' : ''})
                            </p>
                            {filledCount > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="text-xs text-emerald-400 hover:text-emerald-300"
                                        onClick={() => setSelectedTimestamps(new Set(cells.filter(c => c.hasData).map(c => c.timestamp)))}
                                    >
                                        Tout sélectionner
                                    </button>
                                    <button
                                        type="button"
                                        className="text-xs text-white/40 hover:text-white/60"
                                        onClick={() => setSelectedTimestamps(new Set())}
                                    >
                                        Aucune
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-white/40 mb-3 flex items-center gap-2">
                            {isReadonlyCategory
                                ? "Instantané en lecture des données déjà renseignées sur la fiche — cliquez pour sélectionner (import)."
                                : "Cliquez une cellule remplie pour la sélectionner (import), l'icône crayon pour l'éditer. Une cellule vide s'ouvre directement en édition — la sauvegarde remplit la fiche technique en simultané."}
                            {savingCell && <span className="text-emerald-400 flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Sauvegarde...</span>}
                        </p>

                        {cells.length === 0 ? (
                            <p className="text-sm text-white/40">Aucune cellule sur cette trame (configuration du pipeline manquante sur la fiche source).</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                                {cells.map(cell => {
                                    const isSelected = selectedTimestamps.has(cell.timestamp);
                                    return (
                                        <div
                                            key={cell.timestamp}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => cell.hasData ? toggleTimestamp(cell.timestamp) : setEditingCell(cell)}
                                            className={`relative text-left p-2 rounded-lg border transition-colors cursor-pointer ${
                                                cell.hasData
                                                    ? (isSelected ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10')
                                                    : 'border-dashed border-white/10 bg-white/[0.02] hover:bg-white/5'
                                            }`}
                                        >
                                            {!isReadonlyCategory && (
                                                <button
                                                    type="button"
                                                    title={cell.hasData ? 'Éditer cette cellule' : 'Ajouter des données à cette cellule'}
                                                    onClick={(e) => { e.stopPropagation(); setEditingCell(cell); }}
                                                    className="absolute top-1 right-1 p-0.5 rounded text-white/30 hover:text-white/70 hover:bg-white/10"
                                                >
                                                    <Pencil size={11} />
                                                </button>
                                            )}
                                            <div className="flex items-center gap-1.5 mb-1 pr-4">
                                                {cell.hasData ? (
                                                    isSelected ? <CheckSquare size={13} className="text-emerald-400 flex-shrink-0" /> : <Square size={13} className="text-white/30 flex-shrink-0" />
                                                ) : (
                                                    <Plus size={13} className="text-white/20 flex-shrink-0" />
                                                )}
                                                <span className="text-xs font-semibold text-white">{cell.cellLabel}</span>
                                            </div>
                                            <div className="text-[10px] text-white/50 leading-tight line-clamp-2">
                                                {cell.hasData
                                                    ? `${cell.fields.slice(0, 2).map(f => f.label).join(', ')}${cell.fields.length > 2 ? `, +${cell.fields.length - 2}` : ''}`
                                                    : 'Vide'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </LiquidCard>
                )}

                {(store.nodes.length > 0 || store.edges.length > 0) && (
                    <LiquidCard className="p-4">
                        <p className="text-sm font-semibold text-white mb-3">Cibles de l'import</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-white/40 mb-2">Bulles (produits)</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {store.nodes.map(node => {
                                        const isSelected = selectedNodeIds.has(node.id);
                                        return (
                                            <button
                                                type="button"
                                                key={node.id}
                                                onClick={() => toggleNodeTarget(node.id)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                                                    isSelected ? 'bg-emerald-500/15 text-emerald-300' : 'text-white/70 hover:bg-white/5'
                                                }`}
                                            >
                                                {isSelected ? <CheckSquare size={13} /> : <Square size={13} className="text-white/30" />}
                                                {node.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-white/40 mb-2">Liaisons (transformations)</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {store.edges.map(edge => {
                                        const isSelected = selectedEdgeIds.has(edge.id);
                                        const src = store.nodes.find(n => n.id === edge.sourceNodeId);
                                        const tgt = store.nodes.find(n => n.id === edge.targetNodeId);
                                        return (
                                            <button
                                                type="button"
                                                key={edge.id}
                                                onClick={() => toggleEdgeTarget(edge.id)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                                                    isSelected ? 'bg-amber-500/15 text-amber-300' : 'text-white/70 hover:bg-white/5'
                                                }`}
                                            >
                                                {isSelected ? <CheckSquare size={13} /> : <Square size={13} className="text-white/30" />}
                                                {src?.label || '?'} → {tgt?.label || '?'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </LiquidCard>
                )}
            </div>
        </LiquidModal>

        {editingCell && activePipelineDef && (
            <PipelineCellEditor
                isOpen={true}
                onClose={() => setEditingCell(null)}
                cellData={editingCell.data}
                cellIndex={editingCell.timestamp}
                fieldSchema={getFieldSchemaForPipeline(activePipelineDef.key)}
                onSave={handleSaveSourceCell}
                title={`${activePipelineDef.label} — ${editingCell.cellLabel}`}
            />
        )}
        </>
    );
};

export default ChainCellPickerModal;
