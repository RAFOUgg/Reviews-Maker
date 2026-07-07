/**
 * ChainMediaPickerModal Component
 *
 * Import en masse de photos/vidéos déjà présentes sur les fiches techniques des produits de
 * CETTE chaîne (pas besoin de re-uploader un fichier déjà hébergé) vers un ou plusieurs
 * nœuds/liaisons. Même moule que ChainCellPickerModal.jsx (sélection de fichiers à cocher, puis
 * des cibles), mais pas de notion de pipeline : tous les fichiers de toutes les reviews du canvas
 * sont chargés d'un coup dans une seule grille.
 *
 * Ouvert via store.openMediaPicker(targetType, targetIds).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LiquidModal, LiquidButton, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { fetchReviewFilesFor } from '../../utils/reviewFilesAggregator';
import { Download, CheckSquare, Square, X, Loader2, Film, Image as ImageIcon } from 'lucide-react';

const ChainMediaPickerModal = () => {
    const store = useProductionChainStore();
    const picker = store.mediaPicker;

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedKeys, setSelectedKeys] = useState(new Set());
    const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());
    const [selectedEdgeIds, setSelectedEdgeIds] = useState(new Set());
    const [importing, setImporting] = useState(false);

    // Toutes les reviews référencées par les nœuds de la chaîne — la source des fichiers, pas
    // seulement celle d'où le menu a été ouvert (import "vers plusieurs bulles" doit pouvoir
    // piocher dans n'importe quelle review déjà présente sur le canvas).
    const chainReviewIds = useMemo(
        () => store.nodes.filter(n => n.reviewId && !n.reviewOrphaned).map(n => n.reviewId),
        [store.nodes]
    );

    useEffect(() => {
        if (!picker) return;
        setSelectedNodeIds(new Set(picker.targetType === 'node' ? picker.targetIds : []));
        setSelectedEdgeIds(new Set(picker.targetType === 'edge' ? picker.targetIds : []));
        setSelectedKeys(new Set());
        setError(null);

        if (chainReviewIds.length === 0) {
            setFiles([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        fetchReviewFilesFor(chainReviewIds)
            .then(all => { if (!cancelled) setFiles(all.filter(f => f.type !== 'pdf')); })
            .catch(err => !cancelled && setError(err.message || 'Erreur de chargement'))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [picker?.targetType, picker?.targetIds?.join(','), chainReviewIds.join(',')]);

    if (!picker) return null;

    const toggleFile = (key) => setSelectedKeys(prev => {
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

    const totalTargets = selectedNodeIds.size + selectedEdgeIds.size;

    const handleImport = async () => {
        const filesToImport = files.filter(f => selectedKeys.has(f.key));
        if (filesToImport.length === 0 || totalTargets === 0) return;

        setImporting(true);
        setError(null);
        try {
            if (selectedNodeIds.size > 0) {
                await store.attachFilesToTargets('node', [...selectedNodeIds], filesToImport);
            }
            if (selectedEdgeIds.size > 0) {
                await store.attachFilesToTargets('edge', [...selectedEdgeIds], filesToImport);
            }
            store.closeMediaPicker();
        } catch (err) {
            setError(err.message || 'Import échoué');
        } finally {
            setImporting(false);
        }
    };

    return (
        <LiquidModal
            isOpen={true}
            onClose={store.closeMediaPicker}
            title={
                <div className="flex items-center gap-2">
                    <ImageIcon size={18} />
                    <span>Importer des photos/vidéos de la chaîne</span>
                </div>
            }
            size="full"
            glowColor="amber"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={store.closeMediaPicker} disabled={importing} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleImport}
                        disabled={importing || selectedKeys.size === 0 || totalTargets === 0}
                        loading={importing}
                        icon={Download}
                        className="flex-1"
                    >
                        Importer {selectedKeys.size > 0 ? `${selectedKeys.size} fichier${selectedKeys.size > 1 ? 's' : ''}` : ''}
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

                <LiquidCard className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-white">
                            Fichiers des reviews de cette chaîne ({files.length})
                        </p>
                        {files.length > 0 && (
                            <div className="flex gap-2">
                                <button type="button" className="text-xs text-amber-400 hover:text-amber-300" onClick={() => setSelectedKeys(new Set(files.map(f => f.key)))}>
                                    Tout sélectionner
                                </button>
                                <button type="button" className="text-xs text-white/40 hover:text-white/60" onClick={() => setSelectedKeys(new Set())}>
                                    Aucune
                                </button>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <p className="text-sm text-white/40 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" /> Chargement des fichiers...
                        </p>
                    )}

                    {!loading && files.length === 0 && (
                        <p className="text-sm text-white/40">Aucune photo/vidéo trouvée sur les reviews de cette chaîne.</p>
                    )}

                    {!loading && files.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
                            {files.map(file => {
                                const isSelected = selectedKeys.has(file.key);
                                return (
                                    <button
                                        key={file.key}
                                        type="button"
                                        onClick={() => toggleFile(file.key)}
                                        title={file.reviewLabel}
                                        className={`relative aspect-square rounded-xl border overflow-hidden transition-colors ${
                                            isSelected ? 'border-amber-400/70 ring-2 ring-amber-400/40' : 'border-white/10 hover:border-white/30'
                                        }`}
                                    >
                                        {file.type === 'video' ? (
                                            <video src={file.url} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <img src={file.url} alt={file.reviewLabel} className="w-full h-full object-cover" />
                                        )}
                                        <span className="absolute top-1 left-1 p-1 rounded bg-black/60 text-white/80">
                                            {file.type === 'video' ? <Film size={11} /> : <ImageIcon size={11} />}
                                        </span>
                                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white/80 text-[10px] px-1 py-0.5 truncate text-left">
                                            {file.reviewLabel}
                                        </span>
                                        {isSelected && (
                                            <span className="absolute top-1 right-1 p-0.5 rounded bg-amber-500 text-black">
                                                <CheckSquare size={11} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </LiquidCard>

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
                                                    isSelected ? 'bg-amber-500/15 text-amber-300' : 'text-white/70 hover:bg-white/5'
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
    );
};

export default ChainMediaPickerModal;
