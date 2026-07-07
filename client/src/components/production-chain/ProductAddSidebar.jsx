/**
 * ProductAddSidebar Component
 *
 * Sidebar listant les fiches techniques (reviews) de l'utilisateur, glissables vers
 * ProductionChainCanvas pour les ajouter comme nœuds. Couvre les 4 types (flower/hash/
 * concentrate/edible), contrairement à SourceLineageSelector.jsx qui n'en couvre que 3.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, FileText, ChevronLeft, ChevronRight, Image as ImageIcon, Film, FileBadge } from 'lucide-react';
import { TYPE_META, ALL_REVIEW_TYPES, apiTypeToInternal } from '../../utils/reviewTypeMeta';
import { extractFilesFromReviews } from '../../utils/reviewFilesAggregator';

// Préférence de repli mémorisée entre sessions — un utilisateur qui réduit ce panneau pour
// gagner de la place sur le canvas s'attend à le retrouver réduit à sa prochaine visite.
const COLLAPSE_STORAGE_KEY = 'chainProductSidebarCollapsed';

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
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1');
    // Onglet "Fichiers" : parcourt photos/vidéos/PDF de TOUTES les reviews de l'utilisateur (pas
    // seulement celles déjà présentes sur ce canvas) — simple navigation, contrairement à
    // ChainMediaPickerModal qui attache réellement un fichier à un nœud/liaison.
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'files'
    const [fileTypeFilter, setFileTypeFilter] = useState('all'); // 'all' | 'photo' | 'video' | 'pdf'

    useEffect(() => {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0');
    }, [collapsed]);

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

    const allFiles = useMemo(() => extractFilesFromReviews(reviews), [reviews]);
    const filteredFiles = fileTypeFilter === 'all' ? allFiles : allFiles.filter(f => f.type === fileTypeFilter);

    return (
        <div className={`${collapsed ? 'w-12' : 'w-72'} flex-shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col transition-[width] duration-200`}>
            <div className={`px-3 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                            {activeTab === 'reviews' ? 'Mes fiches techniques' : 'Fichiers'}
                        </h3>
                        <p className="text-xs text-white/40 truncate">
                            {activeTab === 'reviews' ? 'Glissez un produit dans le graphe' : 'Photos, vidéos et certificats de vos fiches'}
                        </p>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setCollapsed(v => !v)}
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                    title={collapsed ? 'Afficher mes fiches techniques' : 'Réduire le panneau'}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {!collapsed && (
                <div className="flex border-b border-white/10 bg-white/[0.02]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            activeTab === 'reviews' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/40 hover:text-white/70'
                        }`}
                    >
                        Fiches
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('files')}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            activeTab === 'files' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/40 hover:text-white/70'
                        }`}
                    >
                        Fichiers
                    </button>
                </div>
            )}

            {!collapsed && activeTab === 'reviews' && (
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
            )}

            {!collapsed && activeTab === 'files' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    <div className="flex gap-1.5 flex-wrap">
                        {[
                            { value: 'all', label: 'Tous' },
                            { value: 'photo', label: 'Photos' },
                            { value: 'video', label: 'Vidéos' },
                            { value: 'pdf', label: 'Certificats' }
                        ].map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFileTypeFilter(opt.value)}
                                className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${
                                    fileTypeFilter === opt.value ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-8">
                            <ImageIcon className="w-10 h-10 mx-auto text-white/20 mb-2" />
                            <p className="text-sm text-white/40">Aucun fichier trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {filteredFiles.map(file => (
                                <button
                                    key={file.key}
                                    type="button"
                                    onClick={() => window.open(file.url, '_blank', 'noopener')}
                                    title={file.label ? `${file.label} — ${file.reviewLabel}` : file.reviewLabel}
                                    className="relative aspect-square rounded-lg border border-white/10 bg-white/5 overflow-hidden hover:border-emerald-500/50 transition-colors"
                                >
                                    {file.type === 'pdf' ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                                            <FileBadge className="w-6 h-6 text-amber-400" />
                                            <span className="text-[9px] text-white/50 text-center line-clamp-2">{file.label}</span>
                                        </div>
                                    ) : file.type === 'video' ? (
                                        <video src={file.url} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                                    )}
                                    <span className="absolute top-1 left-1 p-0.5 rounded bg-black/60 text-white/80">
                                        {file.type === 'video' ? <Film size={10} /> : file.type === 'pdf' ? <FileBadge size={10} /> : <ImageIcon size={10} />}
                                    </span>
                                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white/80 text-[9px] px-1 py-0.5 truncate text-left">
                                        {file.reviewLabel}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
