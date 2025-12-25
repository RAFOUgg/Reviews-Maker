import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStore } from '../store/useStore';

/**
 * ProductSourceSelector - Sélecteur de produit source depuis la bibliothèque
 * Permet de lier un produit Fleur/Hash/Concentré existant
 */
const ProductSourceSelector = ({ sourceType, sourceId, sourceName, onSelect }) => {
    const { reviews, fetchReviews } = useStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (reviews.length === 0) {
            fetchReviews();
        }
    }, [reviews.length, fetchReviews]);

    // Filtrer les produits selon le type et la recherche
    useEffect(() => {
        if (!sourceType || !showDropdown) {
            setFilteredProducts([]);
            return;
        }

        const filtered = reviews
            .filter(review => review.type === sourceType)
            .filter(review => {
                if (!searchQuery) return true;
                const name = review.holderName?.toLowerCase() || '';
                const cultivar = review.cultivars?.toLowerCase() || '';
                const breeder = review.breeder?.toLowerCase() || '';
                const query = searchQuery.toLowerCase();
                return name.includes(query) || cultivar.includes(query) || breeder.includes(query);
            })
            .slice(0, 10); // Limiter à 10 résultats

        setFilteredProducts(filtered);
    }, [sourceType, searchQuery, reviews, showDropdown]);

    const handleSelect = (product) => {
        onSelect({
            sourceId: product.id,
            sourceName: product.holderName,
            sourceType: product.type,
            cultivars: product.cultivars || '',
            breeder: product.breeder || ''
        });
        setShowDropdown(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        onSelect({
            sourceId: '',
            sourceName: '',
            sourceType: sourceType,
            cultivars: '',
            breeder: ''
        });
        setSearchQuery('');
    };

    // Si un produit est déjà sélectionné, afficher la carte
    if (sourceId && sourceName) {
        return (
            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-green-600/20 text-green-400 border border-green-500/30">
                                {sourceType}
                            </span>
                            <h5 className="font-medium text-white">{sourceName}</h5>
                        </div>
                        {reviews.find(r => r.id === sourceId)?.cultivars && (
                            <p className="text-xs text-gray-400 mt-1">
                                🌱 {reviews.find(r => r.id === sourceId).cultivars}
                            </p>
                        )}
                        {reviews.find(r => r.id === sourceId)?.breeder && (
                            <p className="text-xs text-gray-400">
                                👤 {reviews.find(r => r.id === sourceId).breeder}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                        title="Changer de produit"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    // Formulaire de recherche
    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={sourceType ? `Rechercher un ${sourceType}...` : "Sélectionnez d'abord un type"}
                    disabled={!sourceType}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                    🔍
                </span>
            </div>

            {/* Dropdown de résultats */}
            {showDropdown && sourceType && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                            {searchQuery ? 'Aucun produit trouvé' : `Aucun ${sourceType} dans la bibliothèque`}
                        </div>
                    ) : (
                        <div className="py-1">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => handleSelect(product)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 last:border-b-0"
                                >
                                    <div className="flex items-start gap-2">
                                        {product.mainImage && (
                                            <img
                                                src={`/images/${product.mainImage}`}
                                                alt={product.holderName}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h6 className="text-sm font-medium text-white truncate">
                                                {product.holderName}
                                            </h6>
                                            {product.cultivars && (
                                                <p className="text-xs text-gray-400 truncate">
                                                    🌱 {product.cultivars}
                                                </p>
                                            )}
                                            {product.breeder && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {product.breeder}
                                                </p>
                                            )}
                                            {product.overallRating && (
                                                <p className="text-xs text-yellow-400 mt-1">
                                                    ⭐ {product.overallRating}/10
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="p-2 border-t border-gray-700 bg-gray-900/50">
                        <button
                            type="button"
                            onClick={() => setShowDropdown(false)}
                            className="w-full text-xs text-gray-400 hover:text-gray-300"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay pour fermer le dropdown */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
};

ProductSourceSelector.propTypes = {
    sourceType: PropTypes.string,
    sourceId: PropTypes.string,
    sourceName: PropTypes.string,
    onSelect: PropTypes.func.isRequired
};

export default ProductSourceSelector;
