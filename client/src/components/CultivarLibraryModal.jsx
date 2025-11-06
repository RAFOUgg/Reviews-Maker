import { useState, useEffect } from 'react';

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
            // Filtrer uniquement les reviews de type "Fleur"
            const flowers = data.filter(review => review.type === 'Fleur');
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
            reviewType: 'Fleur'
        };
        onSelect(cultivarData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-3xl">🌿</span>
                            Bibliothèque de Cultivars
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Rechercher un cultivar, breeder, farm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-green-500"></div>
                            <p className="text-gray-400 mt-4">Chargement de vos cultivars...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400">
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredReviews.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-400 text-lg">
                                {searchTerm ? 'Aucun cultivar trouvé' : 'Aucune review de fleur trouvée'}
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                {searchTerm ? 'Essayez un autre terme de recherche' : 'Créez d\'abord des reviews de fleurs pour les utiliser comme ingrédients'}
                            </p>
                        </div>
                    )}

                    {!loading && !error && filteredReviews.length > 0 && (
                        <div className="space-y-3">
                            {filteredReviews.map((review) => (
                                <button
                                    key={review.id}
                                    onClick={() => handleSelect(review)}
                                    className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-green-500 rounded-xl p-4 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                                                {review.cultivars || review.holderName}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2 text-sm">
                                                {review.breeder && (
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg">
                                                        🧬 {review.breeder}
                                                    </span>
                                                )}
                                                {review.farm && (
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">
                                                        🏡 {review.farm}
                                                    </span>
                                                )}
                                                {review.overallRating && (
                                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg">
                                                        ⭐ {review.overallRating}/10
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700 bg-gray-900/50">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>💡 Sélectionnez un cultivar pour l'ajouter comme ingrédient</span>
                        <span>{filteredReviews.length} cultivar(s) disponible(s)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
