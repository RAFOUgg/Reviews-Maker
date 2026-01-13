import { useEffect } from 'react';

export default function CategoryRatings({ value, onChange, categories, formData }) {
    // Mapping des catégories vers les champs du formulaire
    const categoryFieldMap = {
        visual: ['densite', 'trichomes', 'malleabilite', 'transparence'],
        smell: [], // Les arômes sont gérés par wheel, pas de notes numériques
        taste: [], // Les goûts sont gérés par wheel, pas de notes numériques
        effects: [] // Les effets sont gérés par selector, pas de notes numériques
    };

    // Calculer automatiquement les notes de catégorie à partir des champs du formulaire
    useEffect(() => {
        if (!formData) return;

        const calculatedRatings = {};

        // Pour chaque catégorie, calculer la moyenne de ses champs
        categories.forEach(category => {
            const fields = categoryFieldMap[category.key] || [];
            const validValues = fields
                .map(fieldKey => formData[fieldKey])
                .filter(v => v !== undefined && v !== null && v !== '' && !isNaN(v))
                .map(v => parseFloat(v));

            if (validValues.length > 0) {
                const average = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
                calculatedRatings[category.key] = Math.round(average * 2) / 2; // Arrondir à 0.5 près
            } else {
                calculatedRatings[category.key] = 0;
            }
        });

        // Calculer la note globale (moyenne de toutes les catégories)
        const categoryValues = Object.values(calculatedRatings).filter(v => v > 0);
        const overallRating = categoryValues.length > 0
            ? Math.round((categoryValues.reduce((sum, v) => sum + v, 0) / categoryValues.length) * 2) / 2
            : 0;

        calculatedRatings.overall = overallRating;

        // Mettre à jour seulement si les valeurs ont changé
        const currentRatings = value || {};
        const hasChanged = JSON.stringify(calculatedRatings) !== JSON.stringify(currentRatings);

        if (hasChanged) {
            onChange(calculatedRatings);
        }
    }, [formData, categories, onChange, value]);

    const ratings = value || {};
    const overallRating = ratings.overall || 0;

    return (
        <div className="space-y-6">
            {/* Notes par catégorie - Calculées automatiquement */}
            <div className="border /30 rounded-xl p-4 mb-6">
                <p className="text-sm flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>Les notes par catégorie sont calculées automatiquement à partir des notes détaillées des sections suivantes.</span>
                </p>
            </div>

            {categories.map((category) => {
                const rating = ratings[category.key] || 0;
                const percentage = ((rating / (category.max || 10)) * 100).toFixed(0);

                return (
                    <div key={category.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">
                                {category.icon} {category.label}
                            </label>
                            <span className="text-2xl font-bold text-green-400">
                                {rating.toFixed(1)}/{category.max || 10}
                            </span>
                        </div>
                        {/* Barre de progression en lecture seule */}
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Calculé automatiquement</span>
                            <span>{percentage}%</span>
                        </div>
                    </div>
                );
            })}

            {/* Note globale calculée */}
            <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="bg-gradient-to-br from-green-600/20 to-green-500/10 border-2 border-green-500/50 rounded-2xl p-6 text-center">
                    <div className="text-sm text-gray-400 mb-2">Note globale (moyenne)</div>
                    <div className="text-6xl font-bold text-green-400 mb-2">
                        {overallRating.toFixed(1)}
                    </div>
                    <div className="text-gray-500 text-sm">
                        sur {categories[0]?.max || 10}
                    </div>
                    <div className="mt-4 flex justify-center gap-1">
                        {Array.from({ length: Math.floor(overallRating) }).map((_, i) => (
                            <span key={i} className="text-2xl">⭐</span>
                        ))}
                        {overallRating % 1 >= 0.5 && <span className="text-2xl">✨</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}


