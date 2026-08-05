/**
 * ChainDataImportModal Component
 *
 * Picker unifié "Importer une donnée" — remplace ChainCellPickerModal.jsx (cellules de pipeline)
 * et ChainMediaPickerModal.jsx (photos/vidéos), fusionnés en un seul point d'entrée (2026-07-30,
 * suite au constat que le clic droit accumulait 5 actions d'import séparées, chacune restreinte
 * aux reviews déjà présentes sur CE canevas — la maquette validée avec l'utilisateur est
 * documentée dans la conversation, pas dans ce fichier).
 *
 * Flux en 2 axes indépendants :
 * - Type (onglets) : Pipeline (inclut "Autres données" = champs de fiche scalaires, déjà un
 *   pipelineDef au même titre que culture/curing/etc., cf. chainCellPipelines.js) / Photo-Vidéo /
 *   Document.
 * - Source (panneau gauche) : soit RÉUTILISER une donnée déjà attachée ailleurs sur CE canevas
 *   (remplace le besoin de connaître Copier/Coller pour ce cas précis), soit parcourir une fiche
 *   fraîche — celles déjà posées sur ce canevas en premier, puis le reste de la bibliothèque
 *   complète de l'utilisateur (GET /api/reviews/my, jusqu'ici seulement utilisé par
 *   ProductAddSidebar pour le glisser-déposer de nœuds).
 *
 * Les deux peuvent se combiner dans un seul import (une cellule réutilisée + des cellules fraîches
 * d'une autre fiche, vers les mêmes cibles).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidTabs, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { resolveChainEndpoint } from '../../utils/chainEndpoint';
import { apiTypeToInternal } from '../../utils/reviewTypeMeta';
import { getPipelineDefsForReviewType, getCellsForPipelineDef, getFieldSchemaForPipeline, getGeneralFieldSchema, READONLY_CELL_CATEGORIES } from '../../utils/chainCellPipelines';
import { fetchReviewFilesFor } from '../../utils/reviewFilesAggregator';
import PipelineCellEditor from '../pipelines/core/PipelineCellEditor';
import { Download, CheckSquare, Square, Plus, Pencil, X, Loader2, Search, Film, Image as ImageIcon, FileText, Undo2 } from 'lucide-react';

const TYPE_TABS = [
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'media', label: 'Photo / Vidéo' },
    { id: 'doc', label: 'Document' }
];

const ChainDataImportModal = () => {
    const store = useProductionChainStore();
    const picker = store.dataImportModal;

    const [type, setType] = useState('pipeline');
    const [search, setSearch] = useState('');

    const [library, setLibrary] = useState([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);

    const [sourceReviewId, setSourceReviewId] = useState('');
    const [pipelineKey, setPipelineKey] = useState('');
    const [reviewFlat, setReviewFlat] = useState(null);
    const [loadingReview, setLoadingReview] = useState(false);
    const [sourceFiles, setSourceFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    const [selectedTimestamps, setSelectedTimestamps] = useState(new Set());
    const [selectedFileKeys, setSelectedFileKeys] = useState(new Set());
    const [selectedReuseKeys, setSelectedReuseKeys] = useState(new Set());
    const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());
    const [selectedEdgeIds, setSelectedEdgeIds] = useState(new Set());

    const [editingCell, setEditingCell] = useState(null);
    const [savingCell, setSavingCell] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState(null);

    // Réinitialisation complète à chaque (ré)ouverture — pré-sélectionne la/les cible(s) d'origine
    // (menu contextuel d'un nœud ou d'une liaison), mais laisse tout le reste du choix ouvert.
    useEffect(() => {
        if (!picker) return;
        setType('pipeline');
        setSearch('');
        setSourceReviewId('');
        setPipelineKey('');
        setReviewFlat(null);
        setSourceFiles([]);
        setSelectedTimestamps(new Set());
        setSelectedFileKeys(new Set());
        setSelectedReuseKeys(new Set());
        setSelectedNodeIds(new Set(picker.targetType === 'node' ? picker.targetIds : []));
        setSelectedEdgeIds(new Set(picker.targetType === 'edge' ? picker.targetIds : []));
        setError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [picker?.targetType, picker?.targetIds?.join(',')]);

    // Bibliothèque complète de l'utilisateur — chargée une fois par ouverture (pas seulement les
    // reviews déjà présentes sur ce canevas, cf. en-tête du fichier).
    useEffect(() => {
        if (!picker) return;
        setLoadingLibrary(true);
        fetch('/api/reviews/my', { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject(new Error('Chargement impossible')))
            .then(data => {
                const list = Array.isArray(data) ? data : (data.reviews || []);
                setLibrary(list.filter(r => apiTypeToInternal(r.type)));
            })
            .catch(() => setLibrary([]))
            .finally(() => setLoadingLibrary(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [picker?.targetType, picker?.targetIds?.join(',')]);

    // Réinitialise le sous-état de navigation à chaque changement de source ou de type — éviter
    // qu'un pipelineKey d'un type de review précédent ne survive à un changement de fiche source.
    useEffect(() => {
        setPipelineKey('');
        setReviewFlat(null);
        setSourceFiles([]);
        setSelectedTimestamps(new Set());
        setSelectedFileKeys(new Set());
    }, [sourceReviewId, type]);

    const sourceInternalType = useMemo(() => {
        if (!sourceReviewId) return null;
        const chainNode = store.nodes.find(n => n.reviewId === sourceReviewId);
        if (chainNode) return chainNode.reviewType;
        const libReview = library.find(r => r.id === sourceReviewId);
        return libReview ? apiTypeToInternal(libReview.type) : null;
    }, [sourceReviewId, store.nodes, library]);

    const pipelineDefs = useMemo(() => getPipelineDefsForReviewType(sourceInternalType), [sourceInternalType]);
    const activePipelineDef = pipelineDefs.find(p => p.key === pipelineKey);
    const isReadonlyCategory = activePipelineDef && READONLY_CELL_CATEGORIES.has(activePipelineDef.key);

    // Charge la fiche complète dès qu'une source + (pour Pipeline) un pipeline sont choisis — pour
    // Photo/Vidéo et Document, dès que la source seule est choisie.
    useEffect(() => {
        if (!sourceReviewId) return;
        if (type === 'pipeline' && !pipelineKey) return;
        let cancelled = false;

        if (type === 'pipeline') {
            setLoadingReview(true);
            setError(null);
            fetch(`/api/reviews/${sourceReviewId}`, { credentials: 'include' })
                .then(r => r.ok ? r.json() : Promise.reject(new Error('Fiche technique introuvable')))
                .then(data => {
                    if (cancelled) return;
                    setReviewFlat({
                        ...data,
                        ...(data.flowerData || {}),
                        ...(data.hashData || {}),
                        ...(data.concentrateData || {}),
                        ...(data.edibleData || {})
                    });
                })
                .catch(err => !cancelled && setError(err.message || 'Erreur de chargement'))
                .finally(() => !cancelled && setLoadingReview(false));
        } else {
            setLoadingFiles(true);
            setError(null);
            fetchReviewFilesFor([sourceReviewId])
                .then(files => {
                    if (cancelled) return;
                    const wantDoc = type === 'doc';
                    setSourceFiles(files.filter(f => (f.type === 'pdf') === wantDoc));
                })
                .catch(err => !cancelled && setError(err.message || 'Erreur de chargement'))
                .finally(() => !cancelled && setLoadingFiles(false));
        }

        return () => { cancelled = true; };
    }, [sourceReviewId, pipelineKey, type]);

    if (!picker) return null;

    const searchLower = search.trim().toLowerCase();
    const matches = (label) => !searchLower || (label || '').toLowerCase().includes(searchLower);

    const canvasReviewIds = new Set(store.nodes.filter(n => n.reviewId && !n.reviewOrphaned).map(n => n.reviewId));
    const canvasReviews = library.filter(r => canvasReviewIds.has(r.id) && matches(r.holderName || r.name));
    const restReviews = library.filter(r => !canvasReviewIds.has(r.id) && matches(r.holderName || r.name));

    // ---- "Réutiliser depuis ce canevas" : cellules/médias déjà attachés à un AUTRE nœud/liaison
    // de cette même chaîne (jamais la/les cible(s) en cours d'édition — se réutiliser soi-même
    // n'a pas de sens), ou une annotation déjà épinglée (pour Photo/Vidéo uniquement, les documents
    // ne sont jamais épinglés en bulle). ----
    const reuseItems = useMemo(() => {
        const isCurrentTarget = (kind, id) => picker.targetType === kind && picker.targetIds.includes(id);
        const items = [];

        if (type === 'pipeline') {
            store.nodes.forEach(n => {
                if (isCurrentTarget('node', n.id)) return;
                (n.cellData || []).forEach(cell => items.push({ reuseKey: `node:${n.id}:${cell.id}`, originLabel: n.label, cell }));
            });
            store.edges.forEach(e => {
                if (isCurrentTarget('edge', e.id)) return;
                const src = resolveChainEndpoint(store, e.sourceId ?? e.sourceNodeId);
                const tgt = resolveChainEndpoint(store, e.targetId ?? e.targetNodeId);
                (e.cellData || []).forEach(cell => items.push({ reuseKey: `edge:${e.id}:${cell.id}`, originLabel: `${src?.label || '?'} → ${tgt?.label || '?'}`, cell }));
            });
        } else {
            const wantDoc = type === 'doc';
            store.nodes.forEach(n => {
                if (isCurrentTarget('node', n.id)) return;
                (n.media || []).forEach(m => {
                    if ((m.type === 'pdf') !== wantDoc) return;
                    items.push({ reuseKey: `node:${n.id}:${m.id}`, originLabel: n.label, file: m });
                });
            });
            store.edges.forEach(e => {
                if (isCurrentTarget('edge', e.id)) return;
                const src = resolveChainEndpoint(store, e.sourceId ?? e.sourceNodeId);
                const tgt = resolveChainEndpoint(store, e.targetId ?? e.targetNodeId);
                (e.media || []).forEach(m => {
                    if ((m.type === 'pdf') !== wantDoc) return;
                    items.push({ reuseKey: `edge:${e.id}:${m.id}`, originLabel: `${src?.label || '?'} → ${tgt?.label || '?'}`, file: m });
                });
            });
            if (!wantDoc) {
                store.annotations.forEach(a => {
                    if (!a.mediaUrl) return;
                    items.push({ reuseKey: `annotation:${a.id}`, originLabel: a.title || 'Note épinglée', file: { url: a.mediaUrl, type: a.mediaType, caption: a.title } });
                });
            }
        }
        return items.filter(it => matches(it.originLabel));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, store.nodes, store.edges, store.annotations, picker.targetType, picker.targetIds, searchLower]);

    const toggleReuse = (key) => setSelectedReuseKeys(prev => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
    });

    const toggleTimestamp = (ts) => setSelectedTimestamps(prev => {
        const next = new Set(prev);
        next.has(ts) ? next.delete(ts) : next.add(ts);
        return next;
    });

    const toggleFileKey = (key) => setSelectedFileKeys(prev => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
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

    const cells = useMemo(
        () => (reviewFlat && activePipelineDef ? getCellsForPipelineDef(reviewFlat, activePipelineDef, sourceInternalType) : []),
        [reviewFlat, activePipelineDef, sourceInternalType]
    );
    const filledCount = cells.filter(c => c.hasData).length;

    const handleSaveSourceCell = async (editedData) => {
        if (!sourceReviewId || !activePipelineDef) return;
        const { index, ...cleaned } = editedData;
        setSavingCell(true);
        setError(null);
        try {
            const endpoint = activePipelineDef.key === 'general'
                ? `/api/review-general-fields/${sourceInternalType}/${sourceReviewId}`
                : `/api/review-pipeline-cells/${sourceInternalType}/${sourceReviewId}/${activePipelineDef.key}`;
            const body = activePipelineDef.key === 'general' ? { fields: cleaned } : { timestamp: index, data: cleaned };
            const res = await fetch(endpoint, {
                method: 'PUT', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || 'Échec de la sauvegarde');
            }
            if (activePipelineDef.key === 'general') {
                const { fields: savedFields } = await res.json();
                setReviewFlat(prev => ({ ...prev, ...savedFields }));
            } else {
                const { data: savedEntry } = await res.json();
                setReviewFlat(prev => {
                    const dataKey = activePipelineDef.dataKey;
                    const existing = Array.isArray(prev[dataKey]) ? prev[dataKey]
                        : (typeof prev[dataKey] === 'string' ? (JSON.parse(prev[dataKey] || '[]')) : []);
                    const idx = existing.findIndex(e => String(e?.timestamp) === String(index));
                    const nextEntries = idx >= 0 ? existing.map((e, i) => i === idx ? savedEntry : e) : [...existing, savedEntry];
                    return { ...prev, [dataKey]: nextEntries };
                });
                setSelectedTimestamps(prev => new Set(prev).add(index));
            }
            setEditingCell(null);
        } catch (err) {
            setError(err.message || 'Échec de la sauvegarde');
        } finally {
            setSavingCell(false);
        }
    };

    const totalTargets = selectedNodeIds.size + selectedEdgeIds.size;
    const totalItems = selectedTimestamps.size + selectedFileKeys.size + selectedReuseKeys.size;

    const handleImport = async () => {
        if (totalItems === 0 || totalTargets === 0) {
            setError('Sélectionnez au moins une donnée et une cible');
            return;
        }
        setImporting(true);
        setError(null);
        try {
            const reuseCells = reuseItems.filter(it => it.cell && selectedReuseKeys.has(it.reuseKey))
                .map(it => { const { id, attachedAt, ...rest } = it.cell; return rest; });
            const reuseFiles = reuseItems.filter(it => it.file && selectedReuseKeys.has(it.reuseKey))
                .map(it => ({ url: it.file.url, type: it.file.type, label: it.file.caption || null, reviewLabel: it.originLabel }));

            const freshCells = cells.filter(c => selectedTimestamps.has(c.timestamp)).map(c => ({
                sourceReviewId,
                sourceReviewType: sourceInternalType,
                sourceLabel: (library.find(r => r.id === sourceReviewId)?.holderName)
                    || (store.nodes.find(n => n.reviewId === sourceReviewId)?.label) || null,
                pipelineType: activePipelineDef.key,
                pipelineLabel: activePipelineDef.label,
                timestamp: c.timestamp,
                cellLabel: c.cellLabel,
                data: c.data
            }));
            const freshFiles = sourceFiles.filter(f => selectedFileKeys.has(f.key));

            const cellsToImport = [...reuseCells, ...freshCells];
            const filesToImport = [...reuseFiles, ...freshFiles];

            if (selectedNodeIds.size > 0) {
                if (cellsToImport.length) await store.attachCellsToTargets('node', [...selectedNodeIds], cellsToImport);
                if (filesToImport.length) await store.attachFilesToTargets('node', [...selectedNodeIds], filesToImport);
            }
            if (selectedEdgeIds.size > 0) {
                if (cellsToImport.length) await store.attachCellsToTargets('edge', [...selectedEdgeIds], cellsToImport);
                if (filesToImport.length) await store.attachFilesToTargets('edge', [...selectedEdgeIds], filesToImport);
            }
            store.closeDataImport();
        } catch (err) {
            setError(err.message || 'Import échoué');
        } finally {
            setImporting(false);
        }
    };

    const renderReviewRow = (review) => {
        const isSelected = sourceReviewId === review.id;
        return (
            <button
                type="button"
                key={review.id}
                onClick={() => setSourceReviewId(review.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors border ${
                    isSelected ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-200' : 'border-transparent text-white/70 hover:bg-white/5'
                }`}
            >
                <span className="truncate">{review.holderName || review.name || 'Sans nom'}</span>
            </button>
        );
    };

    return (
        <>
        <LiquidModal
            isOpen={true}
            onClose={store.closeDataImport}
            title={
                <div className="flex items-center gap-2">
                    <Download size={18} />
                    <span>Importer une donnée</span>
                </div>
            }
            size="full"
            glowColor="emerald"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={store.closeDataImport} disabled={importing} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleImport}
                        disabled={importing || totalItems === 0 || totalTargets === 0}
                        loading={importing}
                        icon={Download}
                        className="flex-1"
                    >
                        Importer {totalItems > 0 ? `${totalItems} donnée${totalItems > 1 ? 's' : ''}` : ''}
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

                <LiquidTabs tabs={TYPE_TABS} activeTab={type} onChange={setType} />

                <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
                    {/* ---- Panneau Source ---- */}
                    <div className="space-y-3">
                        <LiquidInput
                            icon={Search}
                            placeholder="Rechercher une fiche..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {reuseItems.length > 0 && (
                            <div>
                                <p className="text-[10.5px] font-bold uppercase tracking-wider text-purple-300/80 mb-1.5 flex items-center gap-1.5">
                                    <Undo2 size={11} /> Réutiliser depuis ce canevas
                                </p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {reuseItems.map(it => {
                                        const key = it.reuseKey;
                                        const isSelected = selectedReuseKeys.has(key);
                                        const label = it.cell ? `${it.cell.pipelineLabel} — ${it.cell.cellLabel}` : (it.file.caption || (it.file.type === 'video' ? 'Vidéo' : 'Photo'));
                                        return (
                                            <button
                                                type="button"
                                                key={key}
                                                onClick={() => toggleReuse(key)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors border border-dashed ${
                                                    isSelected ? 'bg-purple-500/15 border-purple-400/60 text-purple-200' : 'border-white/15 text-white/70 hover:bg-white/5'
                                                }`}
                                            >
                                                {isSelected ? <CheckSquare size={12} /> : <Square size={12} className="text-white/30" />}
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate font-medium">{label}</span>
                                                    <span className="block truncate text-white/40">déjà sur {it.originLabel}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Sur ce canevas</p>
                            {loadingLibrary ? (
                                <p className="text-xs text-white/40 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Chargement...</p>
                            ) : canvasReviews.length === 0 ? (
                                <p className="text-xs text-white/30">Aucune</p>
                            ) : (
                                <div className="space-y-1 max-h-40 overflow-y-auto">{canvasReviews.map(renderReviewRow)}</div>
                            )}
                        </div>

                        <div>
                            <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Reste de ma bibliothèque</p>
                            {!loadingLibrary && restReviews.length === 0 ? (
                                <p className="text-xs text-white/30">Aucune</p>
                            ) : (
                                <div className="space-y-1 max-h-56 overflow-y-auto">{restReviews.map(renderReviewRow)}</div>
                            )}
                        </div>
                    </div>

                    {/* ---- Panneau Sélection + Cibles ---- */}
                    <div className="space-y-4">
                        {type === 'pipeline' && (
                            <>
                                {sourceReviewId && pipelineDefs.length > 0 && (
                                    <LiquidTabs
                                        tabs={pipelineDefs.map(p => ({ id: p.key, label: p.label }))}
                                        activeTab={pipelineKey}
                                        onChange={setPipelineKey}
                                    />
                                )}
                                {sourceReviewId && pipelineDefs.length === 0 && (
                                    <p className="text-sm text-white/40">Ce type de produit n'a pas de pipeline à cellules.</p>
                                )}

                                {loadingReview && (
                                    <p className="text-sm text-white/40 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Chargement de la trame...</p>
                                )}

                                {!loadingReview && activePipelineDef && (
                                    <LiquidCard className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-semibold text-white">
                                                {activePipelineDef.label} ({filledCount}/{cells.length} remplie{filledCount > 1 ? 's' : ''})
                                            </p>
                                            {filledCount > 0 && (
                                                <div className="flex gap-2">
                                                    <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300" onClick={() => setSelectedTimestamps(new Set(cells.filter(c => c.hasData).map(c => c.timestamp)))}>
                                                        Tout sélectionner
                                                    </button>
                                                    <button type="button" className="text-xs text-white/40 hover:text-white/60" onClick={() => setSelectedTimestamps(new Set())}>
                                                        Aucune
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {cells.length === 0 ? (
                                            <p className="text-sm text-white/40">Aucune donnée sur cette trame (configuration manquante sur la fiche source).</p>
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
                                                                {cell.hasData ? (isSelected ? <CheckSquare size={13} className="text-emerald-400 flex-shrink-0" /> : <Square size={13} className="text-white/30 flex-shrink-0" />) : <Plus size={13} className="text-white/20 flex-shrink-0" />}
                                                                <span className="text-xs font-semibold text-white">{cell.cellLabel}</span>
                                                            </div>
                                                            <div className="text-[10px] text-white/50 leading-tight line-clamp-2">
                                                                {cell.hasData ? `${cell.fields.slice(0, 2).map(f => f.label).join(', ')}${cell.fields.length > 2 ? `, +${cell.fields.length - 2}` : ''}` : 'Vide'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </LiquidCard>
                                )}
                            </>
                        )}

                        {(type === 'media' || type === 'doc') && sourceReviewId && (
                            <LiquidCard className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-white">
                                        {sourceFiles.length} fichier{sourceFiles.length > 1 ? 's' : ''} trouvé{sourceFiles.length > 1 ? 's' : ''}
                                    </p>
                                    {sourceFiles.length > 0 && (
                                        <div className="flex gap-2">
                                            <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300" onClick={() => setSelectedFileKeys(new Set(sourceFiles.map(f => f.key)))}>Tout sélectionner</button>
                                            <button type="button" className="text-xs text-white/40 hover:text-white/60" onClick={() => setSelectedFileKeys(new Set())}>Aucune</button>
                                        </div>
                                    )}
                                </div>

                                {loadingFiles && <p className="text-sm text-white/40 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Chargement...</p>}
                                {!loadingFiles && sourceFiles.length === 0 && <p className="text-sm text-white/40">Aucun fichier trouvé sur cette fiche.</p>}

                                {!loadingFiles && type === 'media' && sourceFiles.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
                                        {sourceFiles.map(file => {
                                            const isSelected = selectedFileKeys.has(file.key);
                                            return (
                                                <button key={file.key} type="button" onClick={() => toggleFileKey(file.key)} title={file.reviewLabel}
                                                    className={`relative aspect-square rounded-xl border overflow-hidden transition-colors ${isSelected ? 'border-amber-400/70 ring-2 ring-amber-400/40' : 'border-white/10 hover:border-white/30'}`}>
                                                    {file.type === 'video' ? <video src={file.url} className="w-full h-full object-cover" muted /> : <img src={file.url} alt={file.reviewLabel} className="w-full h-full object-cover" />}
                                                    <span className="absolute top-1 left-1 p-1 rounded bg-black/60 text-white/80">{file.type === 'video' ? <Film size={11} /> : <ImageIcon size={11} />}</span>
                                                    {isSelected && <span className="absolute top-1 right-1 p-0.5 rounded bg-amber-500 text-black"><CheckSquare size={11} /></span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {!loadingFiles && type === 'doc' && sourceFiles.length > 0 && (
                                    <div className="space-y-2 max-h-72 overflow-y-auto">
                                        {sourceFiles.map(file => {
                                            const isSelected = selectedFileKeys.has(file.key);
                                            return (
                                                <button key={file.key} type="button" onClick={() => toggleFileKey(file.key)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${isSelected ? 'border-amber-400/60 bg-amber-500/10 text-amber-200' : 'border-white/10 text-white/70 hover:bg-white/5'}`}>
                                                    {isSelected ? <CheckSquare size={13} /> : <Square size={13} className="text-white/30" />}
                                                    <FileText size={14} className="text-red-400 flex-shrink-0" />
                                                    <span className="truncate flex-1">{file.label || file.reviewLabel}</span>
                                                </button>
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
                                                    <button type="button" key={node.id} onClick={() => toggleNodeTarget(node.id)}
                                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${isSelected ? 'bg-emerald-500/15 text-emerald-300' : 'text-white/70 hover:bg-white/5'}`}>
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
                                                const src = resolveChainEndpoint(store, edge.sourceId ?? edge.sourceNodeId);
                                                const tgt = resolveChainEndpoint(store, edge.targetId ?? edge.targetNodeId);
                                                return (
                                                    <button type="button" key={edge.id} onClick={() => toggleEdgeTarget(edge.id)}
                                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${isSelected ? 'bg-amber-500/15 text-amber-300' : 'text-white/70 hover:bg-white/5'}`}>
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
                </div>
            </div>
        </LiquidModal>

        {editingCell && activePipelineDef && (
            <PipelineCellEditor
                isOpen={true}
                onClose={() => setEditingCell(null)}
                cellData={editingCell.data}
                cellIndex={editingCell.timestamp}
                fieldSchema={
                    activePipelineDef.key === 'general'
                        ? getGeneralFieldSchema(sourceInternalType, editingCell.timestamp)
                        : getFieldSchemaForPipeline(activePipelineDef.key)
                }
                onSave={handleSaveSourceCell}
                title={`${activePipelineDef.label} — ${editingCell.cellLabel}`}
            />
        )}
        </>
    );
};

export default ChainDataImportModal;
