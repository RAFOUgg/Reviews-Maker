/**
 * QualityGauges - Jauges visuelles pour les notes qualité
 * Affichage professionnel des scores avec dégradés et animations
 */

import { motion } from 'framer-motion';

// Configuration des catégories de notes
const RATING_CATEGORIES = {
    visual: { label: 'Visuel', icon: '👁️', desc: 'Apparence, couleur, texture' },
    smell: { label: 'Odeur', icon: '👃', desc: 'Intensité et qualité aromatique' },
    taste: { label: 'Goût', icon: '👅', desc: 'Saveurs et persistance' },
    effects: { label: 'Effets', icon: '⚡', desc: 'Puissance et qualité' },
    overall: { label: 'Global', icon: '⭐', desc: 'Note générale' },
    quality: { label: 'Qualité', icon: '🏆', desc: 'Qualité globale' },
    value: { label: 'Rapport Q/P', icon: '💰', desc: 'Qualité/Prix' },
    potency: { label: 'Puissance', icon: '💪', desc: 'Force des effets' },
    freshness: { label: 'Fraîcheur', icon: '🌿', desc: 'État du produit' },
    cure: { label: 'Cure', icon: '🫙', desc: 'Qualité de l\'affinage' },
};

// Couleurs selon le score (0-10)
function getScoreColor(score, maxScore = 10) {
    const normalized = score / maxScore;
    if (normalized >= 0.9) return { bg: 'from-emerald-400 to-green-500', text: 'text-green-600' };
    if (normalized >= 0.75) return { bg: 'from-lime-400 to-green-500', text: 'text-lime-600' };
    if (normalized >= 0.6) return { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-600' };
    if (normalized >= 0.4) return { bg: 'from-orange-400 to-orange-500', text: 'text-orange-600' };
    return { bg: 'from-red-400 to-red-500', text: 'text-red-600' };
}

// Parser les ratings
function parseRatings(data) {
    if (!data) return [];

    // String JSON
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return [];
        }
    }

    // Objet { visual: 8, smell: 7.5, ... }
    if (typeof data === 'object' && !Array.isArray(data)) {
        return Object.entries(data).map(([key, value]) => {
            const category = RATING_CATEGORIES[key.toLowerCase()] || { label: key, icon: '📊' };
            return {
                key,
                label: category.label,
                icon: category.icon,
                desc: category.desc,
                value: typeof value === 'number' ? value : parseFloat(value) || 0,
            };
        }).filter(r => r.value > 0);
    }

    // Array
    if (Array.isArray(data)) {
        return data.map(item => {
            if (typeof item === 'object') {
                const key = item.key || item.name || item.category || 'unknown';
                const category = RATING_CATEGORIES[key.toLowerCase()] || { label: key, icon: '📊' };
                return {
                    key,
                    label: item.label || category.label,
                    icon: item.icon || category.icon,
                    desc: category.desc,
                    value: item.value || item.rating || item.score || 0,
                };
            }
            return null;
        }).filter(Boolean);
    }

    return [];
}

export default function QualityGauges({
    ratings,
    overallRating,
    variant = 'bars', // 'bars' | 'circles' | 'cards' | 'compact' | 'semicircle'
    maxScore = 10,
    showLabels = true,
    showValues = true,
    animated = true,
    size = 'md' // 'sm' | 'md' | 'lg'
}) {
    const parsedRatings = parseRatings(ratings);

    // Si pas de ratings mais une note globale
    if (!parsedRatings.length && overallRating !== undefined) {
        parsedRatings.push({
            key: 'overall',
            label: 'Note globale',
            icon: '⭐',
            value: parseFloat(overallRating) || 0
        });
    }

    if (!parsedRatings.length) {
        return null;
    }

    const sizes = {
        sm: { text: 'text-xs', icon: 'text-sm', bar: 'h-2', circle: 60 },
        md: { text: 'text-sm', icon: 'text-base', bar: 'h-3', circle: 80 },
        lg: { text: 'text-base', icon: 'text-lg', bar: 'h-4', circle: 100 }
    };
    const s = sizes[size] || sizes.md;

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: BARS - Barres horizontales
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'bars') {
        return (
            <div className="space-y-3">
                {parsedRatings.map((rating, index) => {
                    const percentage = (rating.value / maxScore) * 100;
                    const colors = getScoreColor(rating.value, maxScore);

                    return (
                        <div key={rating.key || index} className="space-y-1">
                            {showLabels && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={s.icon}>{rating.icon}</span>
                                        <span className={`font-medium text-gray-800 dark:text-gray-200 ${s.text}`}>
                                            {rating.label}
                                        </span>
                                    </div>
                                    {showValues && (
                                        <span className={`font-bold ${colors.text} ${s.text}`}>
                                            {rating.value.toFixed(1)}/{maxScore}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className={`w-full ${s.bar} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
                                <motion.div
                                    initial={animated ? { width: 0 } : false}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`h-full bg-gradient-to-r ${colors.bg} rounded-full`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: CIRCLES - Cercles de progression
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'circles') {
        const circleSize = s.circle;
        const strokeWidth = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
        const radius = (circleSize - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;

        return (
            <div className="flex flex-wrap justify-center gap-4">
                {parsedRatings.map((rating, index) => {
                    const percentage = (rating.value / maxScore) * 100;
                    const colors = getScoreColor(rating.value, maxScore);
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;

                    return (
                        <div key={rating.key || index} className="flex flex-col items-center gap-2">
                            <div className="relative" style={{ width: circleSize, height: circleSize }}>
                                <svg className="w-full h-full transform -rotate-90">
                                    {/* Cercle de fond */}
                                    <circle
                                        cx={circleSize / 2}
                                        cy={circleSize / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={strokeWidth}
                                        className="text-gray-200 dark:text-gray-700"
                                    />
                                    {/* Cercle de progression */}
                                    <motion.circle
                                        cx={circleSize / 2}
                                        cy={circleSize / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="url(#circleGradient)"
                                        strokeWidth={strokeWidth}
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        initial={animated ? { strokeDashoffset: circumference } : false}
                                        animate={{ strokeDashoffset }}
                                        transition={{ duration: 1, delay: index * 0.15 }}
                                    />
                                    <defs>
                                        <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#a855f7" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                {/* Valeur au centre */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`font-bold ${colors.text} ${s.text}`}>
                                        {rating.value.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            {showLabels && (
                                <div className="text-center">
                                    <span className="text-lg">{rating.icon}</span>
                                    <p className={`text-gray-600 dark:text-gray-400 ${s.text} font-medium`}>
                                        {rating.label}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: CARDS - Cartes avec score
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'cards') {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {parsedRatings.map((rating, index) => {
                    const colors = getScoreColor(rating.value, maxScore);

                    return (
                        <motion.div
                            key={rating.key || index}
                            initial={animated ? { opacity: 0, y: 20 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{rating.icon}</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {rating.label}
                                </span>
                            </div>
                            <div className={`text-2xl font-bold ${colors.text}`}>
                                {rating.value.toFixed(1)}
                                <span className="text-sm text-gray-400 font-normal">/{maxScore}</span>
                            </div>
                            {/* Mini barre */}
                            <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={animated ? { width: 0 } : false}
                                    animate={{ width: `${(rating.value / maxScore) * 100}%` }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`h-full bg-gradient-to-r ${colors.bg} rounded-full`}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: COMPACT - Version très compacte
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'compact') {
        return (
            <div className="flex flex-wrap gap-2">
                {parsedRatings.map((rating, index) => {
                    const colors = getScoreColor(rating.value, maxScore);

                    return (
                        <motion.div
                            key={rating.key || index}
                            initial={animated ? { scale: 0 } : false}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                inline-flex items-center gap-1 px-2 py-1 rounded-lg
                                bg-gradient-to-r ${colors.bg} text-white text-sm font-medium
                            `}
                            title={`${rating.label}: ${rating.value}/${maxScore}`}
                        >
                            <span>{rating.icon}</span>
                            <span>{rating.value.toFixed(1)}</span>
                        </motion.div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: SEMICIRCLE - Jauge demi-cercle (pour note globale)
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'semicircle') {
        const mainRating = parsedRatings[0];
        if (!mainRating) return null;

        const percentage = (mainRating.value / maxScore) * 100;
        const colors = getScoreColor(mainRating.value, maxScore);
        const width = s.circle * 2;
        const height = s.circle + 20;
        const radius = s.circle - 10;
        const circumference = Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="relative" style={{ width, height }}>
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                        {/* Arc de fond */}
                        <path
                            d={`M 10 ${height - 10} A ${radius} ${radius} 0 0 1 ${width - 10} ${height - 10}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Arc de valeur */}
                        <motion.path
                            d={`M 10 ${height - 10} A ${radius} ${radius} 0 0 1 ${width - 10} ${height - 10}`}
                            fill="none"
                            stroke="url(#semiGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={animated ? { strokeDashoffset: circumference } : false}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1 }}
                        />
                        <defs>
                            <linearGradient id="semiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Valeur au centre */}
                    <div
                        className="absolute flex flex-col items-center"
                        style={{ left: '50%', bottom: '10px', transform: 'translateX(-50%)' }}
                    >
                        <span className="text-3xl mb-1">{mainRating.icon}</span>
                        <span className={`text-2xl font-bold ${colors.text}`}>
                            {mainRating.value.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">/ {maxScore}</span>
                    </div>
                </div>
                {showLabels && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                        {mainRating.label}
                    </p>
                )}
            </div>
        );
    }

    return null;
}
