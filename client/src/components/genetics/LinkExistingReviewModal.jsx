/**
 * LinkExistingReviewModal Component
 *
 * Relie un nœud PhenoHunt déjà existant (typiquement détaché via "Détacher la review liée")
 * à une fiche technique Fleur EXISTANTE — jusqu'ici NodeContextMenu ne proposait que "Créer la
 * review liée" (nouvelle review), sans retour possible vers une review déjà créée.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidCard } from '@/components/ui/LiquidUI';
import { Link2, X, AlertTriangle } from 'lucide-react';
import useGeneticsStore from '../../store/useGeneticsStore';
import { getImageUrl, parseImages } from '../../utils/imageUtils';

const LinkExistingReviewModal = () => {
    const store = useGeneticsStore();
    const nodeId = store.linkReviewPickerNodeId;
    const node = store.nodes.find(n => n.id === nodeId);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [linkingId, setLinkingId] = useState(null);
    const [conflicts, setConflicts] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!nodeId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetch('/api/reviews/my', { credentials: 'include' })
            .then(r => r.ok ? r.json() : Promise.reject(new Error('Erreur de chargement')))
            .then(data => {
                if (cancelled) return;
                const all = Array.isArray(data) ? data : (data.reviews || []);
                setReviews(all.filter(r => r.type === 'Fleurs' || r.productType === 'flower'));
            })
            .catch(err => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true };
    }, [nodeId]);

    const filtered = useMemo(() => {
        if (!search.trim()) return reviews;
        const q = search.toLowerCase();
        return reviews.filter(r =>
            (r.holderName || r.name || '').toLowerCase().includes(q) ||
            (r.cultivars || '').toLowerCase().includes(q) ||
            (r.breeder || '').toLowerCase().includes(q)
        );
    }, [reviews, search]);

    if (!nodeId) return null;

    const handleSelect = async (review) => {
        setLinkingId(review.id);
        setError(null);
        try {
            // Vérifie si cette review est déjà liée à un autre nœud (n'empêche pas de continuer,
            // juste un avertissement — voir GET /api/genetics/find-node-for-review).
            const checkRes = await fetch(`/api/genetics/find-node-for-review/${review.id}`, { credentials: 'include' });
            if (checkRes.ok) {
                const check = await checkRes.json();
                if (check.found && check.nodeId !== nodeId) {
                    setConflicts(prev => ({ ...prev, [review.id]: check }));
                    const proceed = window.confirm(
                        `Cette review est déjà liée à un nœud dans l'arbre "${check.treeName}". Continuer quand même ?`
                    );
                    if (!proceed) { setLinkingId(null); return; }
                }
            }

            const images = parseImages(review.images);
            const result = await store.updateNode(nodeId, {
                sourceReviewId: review.id,
                cultivarName: review.holderName || review.name || node?.cultivarName,
                image: images[0] || null
            });
            if (result?.error) throw new Error(result.error);
            store.closeLinkReviewPicker();
        } catch (err) {
            setError(err.message || 'Erreur lors de la liaison');
        } finally {
            setLinkingId(null);
        }
    };

    return (
        <LiquidModal
            isOpen={true}
            onClose={store.closeLinkReviewPicker}
            title={
                <div className="flex items-center gap-2">
                    <Link2 size={18} />
                    <span>Lier à une review existante</span>
                </div>
            }
            size="lg"
            glowColor="green"
            footer={
                <LiquidButton variant="ghost" onClick={store.closeLinkReviewPicker} icon={X} className="w-full">
                    Annuler
                </LiquidButton>
            }
        >
            <div className="space-y-4">
                {error && (
                    <LiquidCard className="p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p className="text-red-400 text-sm">{error}</p>
                    </LiquidCard>
                )}

                <LiquidInput
                    placeholder="Rechercher par nom, cultivar, breeder..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {loading ? (
                    <p className="text-sm text-white/40">Chargement de vos fiches techniques Fleurs...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-sm text-white/40">Aucune fiche technique Fleur trouvée.</p>
                ) : (
                    <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                        {filtered.map(review => {
                            const images = parseImages(review.images);
                            const conflict = conflicts[review.id];
                            return (
                                <button
                                    key={review.id}
                                    type="button"
                                    disabled={linkingId === review.id}
                                    onClick={() => handleSelect(review)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-emerald-500/50 text-left transition-colors disabled:opacity-50"
                                >
                                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-emerald-500/10 flex-shrink-0">
                                        {images[0] && (
                                            <img src={getImageUrl(images[0])} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white truncate">{review.holderName || review.name || 'Sans nom'}</div>
                                        <div className="text-xs text-white/40 truncate">
                                            {[review.breeder, review.cultivars].filter(Boolean).join(' · ')}
                                        </div>
                                    </div>
                                    {conflict?.found && (
                                        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" title={`Déjà liée à "${conflict.treeName}"`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </LiquidModal>
    );
};

export default LinkExistingReviewModal;
