/**
 * ProductAddSidebar Component
 *
 * Sidebar listant les fiches techniques (reviews) de l'utilisateur, glissables vers
 * ProductionChainCanvas pour les ajouter comme nœuds. Couvre les 4 types (flower/hash/
 * concentrate/edible), contrairement à SourceLineageSelector.jsx qui n'en couvre que 3.
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { TYPE_META, ALL_REVIEW_TYPES, apiTypeToInternal } from '../../utils/reviewTypeMeta';

const getFirstReviewImage = (review) => {
    const imgs = review?.images
    const first = Array.isArray(imgs)
        ? imgs[0]
        : (typeof imgs === 'string' ? (() => { try { return JSON.parse(imgs)?.[0] } catch { return null } })() : null)
    if (!first) return null
    return first.startsWith('http') || first.startsWith('/') ? first : `/images/${first}`
}

export default function ProductAddSidebar({ existingReviewIds = [] }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetch('/api/reviews/my', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (cancelled) return;
                const list = Array.isArray(data) ? data : (data.reviews || []);
                setReviews(list.filter(r => apiTypeToInternal(r.type)));
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true };
    }, []);

    const handleDragStart = (e, review) => {
        const reviewType = apiTypeToInternal(review.type);
        const payload = {
            reviewId: review.id,
            reviewType,
            label: review.holderName || review.name || 'Sans nom',
            image: getFirstReviewImage(review)
        };
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const existingSet = new Set(existingReviewIds);
    const grouped = ALL_REVIEW_TYPES.map(type => ({
        type,
        meta: TYPE_META[type],
        items: reviews.filter(r => apiTypeToInternal(r.type) === type && !existingSet.has(r.id))
    })).filter(g => g.items.length > 0);

    return (
        <div className="w-72 flex-shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <h3 className="text-sm font-semibold text-white">Mes fiches techniques</h3>
                <p className="text-xs text-white/40">Glissez un produit dans le graphe</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {loading ? (
                    <div className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-10 h-10 mx-auto text-white/20 mb-2" />
                        <p className="text-sm text-white/40">Aucune fiche disponible</p>
                    </div>
                ) : (
                    grouped.map(group => {
                        const Icon = group.meta.icon;
                        return (
                            <div key={group.type}>
                                <div className="text-xs font-semibold text-white/40 uppercase tracking-wider pb-2 flex items-center gap-1.5">
                                    <Icon className={`w-3.5 h-3.5 ${group.meta.color}`} />
                                    {group.meta.label}
                                </div>
                                <div className="space-y-2">
                                    {group.items.map(review => (
                                        <div
                                            key={review.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, review)}
                                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex items-center gap-2.5 cursor-move hover:border-emerald-500/50 transition-all"
                                        >
                                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {getFirstReviewImage(review) ? (
                                                    <img src={getFirstReviewImage(review)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Icon className={`w-5 h-5 ${group.meta.color}`} />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-white truncate">
                                                    {review.holderName || review.name || 'Sans nom'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
