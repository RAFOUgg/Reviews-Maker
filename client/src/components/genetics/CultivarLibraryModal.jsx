/**
 * CultivarLibraryModal - Modal pour sélectionner un cultivar depuis sa bibliothèque
 * Liquid Glass UI Design System
 */

import { useState, useEffect } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidCard } from '@/components/ui/LiquidUI';
import { Search, ChevronRight } from 'lucide-react';

export default function CultivarLibraryModal({ isOpen, onClose, onSelect }) {
    const [flowerReviews, setFlowerReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchFlowerReviews();
        }
    }, [isOpen]);

    const fetchFlowerReviews = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/reviews/my', {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Erreur lors du chargement des reviews');
            const data = await response.json();
            // Filtrer uniquement les reviews de type "flower"
            const flowers = data.filter(review => review.type === 'flower');
            setFlowerReviews(flowers);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = flowerReviews.filter(review => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (review.holderName || '').toLowerCase().includes(searchLower) ||
            (review.cultivars || '').toLowerCase().includes(searchLower) ||
            (review.breeder || '').toLowerCase().includes(searchLower) ||
            (review.farm || '').toLowerCase().includes(searchLower)
        );
    });

    const handleSelect = (review) => {
        const cultivarData = {
            name: review.cultivars || review.holderName || '',
            farm: review.farm || '',
            breeder: review.breeder || '',
            reviewId: review.id, // Lien vers la review d'origine
            reviewType: 'flower'
        };
        onSelect(cultivarData);
        onClose();
    };

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🌿</span>
                    <span>Bibliothèque de Cultivars</span>
                </div>
            }
            size="xl"
            glowColor="green"
            footer={
                <div className="flex items-center justify-between w-full text-sm text-white/60">
                    <span>💡 Sélectionnez un cultivar pour l'ajouter comme ingrédient</span>
                    <span className="font-bold text-white">{filteredReviews.length} cultivar(s) disponible(s)</span>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Search */}
                <LiquidInput
                    placeholder="Rechercher un cultivar, breeder, farm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                />

                {/* Content */}
                <div className="max-h-[50vh] overflow-y-auto space-y-2">
                    {loading && (
                        <div className="text-center py-12">
                            <div
                                className="inline-block w-12 h-12 border-4 border-white/20 border-t-violet-500 rounded-full animate-spin"
                                style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
                            />
                            <p className="text-white/60 mt-4">Chargement de vos cultivars...</p>
                        </div>
                    )}

                    {error && (
                        <LiquidCard
                            className="p-4"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        >
                            <p className="text-red-400">{error}</p>
                        </LiquidCard>
                    )}

                    {!loading && !error && filteredReviews.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4 opacity-50">🔍</div>
                            <p className="text-white/60 text-lg">
                                {searchTerm ? 'Aucun cultivar trouvé' : 'Aucune review de fleur trouvée'}
                            </p>
                            <p className="text-white/40 text-sm mt-2">
                                {searchTerm ? 'Essayez un autre terme de recherche' : 'Créez d\'abord des reviews de fleurs pour les utiliser comme ingrédients'}
                            </p>
                        </div>
                    )}

                    {!loading && !error && filteredReviews.length > 0 && (
                        <div className="space-y-2">
                            {filteredReviews.map((review) => (
                                <button
                                    key={review.id}
                                    onClick={() => handleSelect(review)}
                                    className="w-full text-left rounded-xl p-4 transition-all group border border-white/10 hover:border-green-500/50 bg-white/5 hover:bg-white/10"
                                    style={{
                                        boxShadow: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                                                {review.cultivars || review.holderName}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2 text-sm">
                                                {review.breeder && (
                                                    <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg border border-violet-500/30">
                                                        🧬 {review.breeder}
                                                    </span>
                                                )}
                                                {review.farm && (
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30">
                                                        🏡 {review.farm}
                                                    </span>
                                                )}
                                                {review.overallRating && (
                                                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
                                                        ⭐ {review.overallRating}/10
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LiquidModal>
    );
}


