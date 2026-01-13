import { useEffect, useState } from 'react';

export default function GlobalRating({ formData }) {
    const [rating, setRating] = useState(0);
    const [categoryRatings, setCategoryRatings] = useState({});

    // Mapping des catégories vers les champs du formulaire
    const categoryFieldMap = {
        visual: ['densite', 'trichomes', 'malleabilite', 'transparence'],
        smell: [], // Les arômes sont gérés par wheel
        taste: [], // Les goûts sont gérés par wheel
        effects: [] // Les effets sont gérés par selector
    };

    useEffect(() => {
        if (!formData) return;

        const calculatedRatings = {};
        const categories = ['visual', 'smell', 'taste', 'effects'];

        // Pour chaque catégorie, calculer la moyenne de ses champs
        categories.forEach(category => {
            const fields = categoryFieldMap[category] || [];
            const validValues = fields
                .map(fieldKey => formData[fieldKey])
                .filter(v => v !== undefined && v !== null && v !== '' && !isNaN(v))
                .map(v => parseFloat(v));

            if (validValues.length > 0) {
                const average = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
                calculatedRatings[category] = Math.round(average * 2) / 2;
            } else {
                calculatedRatings[category] = 0;
            }
        });

        setCategoryRatings(calculatedRatings);

        // Calculer la note globale (moyenne de toutes les catégories non nulles)
        const categoryValues = Object.values(calculatedRatings).filter(v => v > 0);
        const overallRating = categoryValues.length > 0
            ? Math.round((categoryValues.reduce((sum, v) => sum + v, 0) / categoryValues.length) * 2) / 2
            : 0;

        setRating(overallRating);
    }, [formData]);

    const getCategoryIcon = (category) => {
        const icons = {
            visual: '👁️',
            smell: '👃',
            taste: '👅',
            effects: '⚡'
        };
        return icons[category] || '📊';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            visual: 'Visuel',
            smell: 'Odeurs',
            taste: 'Goûts',
            effects: 'Effets'
        };
        return labels[category] || category;
    };

    const getStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex gap-1">
                {Array.from({ length: fullStars }).map((_, i) => (
                    <span key={`full-${i}`} className="text-2xl">⭐</span>
                ))}
                {hasHalfStar && <span className="text-2xl">✨</span>}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <span key={`empty-${i}`} className="text-2xl opacity-20">⭐</span>
                ))}
            </div>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'from-green-600 to-green-400';
        if (rating >= 6) return 'from-yellow-600 to-yellow-400';
        if (rating >= 4) return 'from-orange-600 to-orange-400';
        return 'from-red-600 to-red-400';
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            {/* Note globale principale */}
            <div className={`bg-gradient-to-br ${getRatingColor(rating)} rounded-2xl p-8 text-center mb-6 shadow-2xl`}>
                <div className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">
                    Note Globale
                </div>
                <div className="text-8xl font-black text-white mb-4 drop-shadow-2xl">
                    {rating.toFixed(1)}
                </div>
                <div className="text-2xl text-white/90 font-medium mb-4">
                    sur 10
                </div>
                <div className="flex justify-center">
                    {getStars(rating)}
                </div>
            </div>

            {/* Détail par catégorie */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>Détail par catégorie</span>
                </h3>
                {Object.entries(categoryRatings).map(([key, value]) => (
                    <div key={key} className="bg-gray-900/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 font-medium">
                                {getCategoryIcon(key)} {getCategoryLabel(key)}
                            </span>
                            <span className="text-2xl font-bold text-green-400">
                                {value.toFixed(1)}/10
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                                style={{ width: `${(value / 10) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {rating === 0 && (
                <div className="mt-6 text-center text-gray-400 text-sm">
                    <p>Remplissez les sections pour voir la note globale calculée automatiquement</p>
                </div>
            )}
        </div>
    );
}
