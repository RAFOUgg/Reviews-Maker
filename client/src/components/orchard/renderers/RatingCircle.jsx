/**
 * RatingCircle - Cercle animé pour afficher une note
 * Composant visuel professionnel avec animation et dégradés
 */

import { motion } from 'framer-motion';

// Couleurs selon le score
function getScoreGradient(score, maxScore = 10) {
    const normalized = score / maxScore;
    if (normalized >= 0.9) return { start: '#22c55e', end: '#16a34a', text: '#15803d' };
    if (normalized >= 0.75) return { start: '#84cc16', end: '#22c55e', text: '#4d7c0f' };
    if (normalized >= 0.6) return { start: '#fbbf24', end: '#f59e0b', text: '#b45309' };
    if (normalized >= 0.4) return { start: '#fb923c', end: '#f97316', text: '#c2410c' };
    return { start: '#ef4444', end: '#dc2626', text: '#b91c1c' };
}

export default function RatingCircle({
    rating,
    maxRating = 10,
    size = 100,
    strokeWidth = 8,
    showLabel = true,
    label = 'Note',
    animated = true,
    variant = 'default' // 'default' | 'gradient' | 'glow' | 'minimal'
}) {
    const score = parseFloat(rating) || 0;
    const percentage = (score / maxRating) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const colors = getScoreGradient(score, maxRating);

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: MINIMAL - Très simple, juste le cercle et le score
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'minimal') {
        return (
            <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-200 dark:text-gray-700"
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.start}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={animated ? { strokeDashoffset: circumference } : false}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className="font-bold"
                        style={{
                            fontSize: size * 0.3,
                            color: colors.text
                        }}
                    >
                        {score.toFixed(1)}
                    </span>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: GRADIENT - Avec dégradé coloré
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'gradient') {
        const gradientId = `rating-gradient-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
                <div className="relative" style={{ width: size, height: size }}>
                    <svg className="w-full h-full transform -rotate-90">
                        <defs>
                            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.start} />
                                <stop offset="100%" stopColor={colors.end} />
                            </linearGradient>
                        </defs>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={animated ? { strokeDashoffset: circumference } : false}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            className="font-bold"
                            style={{ fontSize: size * 0.28, color: colors.text }}
                            initial={animated ? { scale: 0 } : false}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                        >
                            {score.toFixed(1)}
                        </motion.span>
                        <span
                            className="text-gray-400"
                            style={{ fontSize: size * 0.12 }}
                        >
                            /{maxRating}
                        </span>
                    </div>
                </div>
                {showLabel && (
                    <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                    </span>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: GLOW - Avec effet lumineux
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'glow') {
        const glowId = `rating-glow-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
                <div
                    className="relative"
                    style={{
                        width: size,
                        height: size,
                        filter: `drop-shadow(0 0 ${size * 0.1}px ${colors.start}40)`
                    }}
                >
                    <svg className="w-full h-full transform -rotate-90">
                        <defs>
                            <linearGradient id={glowId} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.start} />
                                <stop offset="100%" stopColor={colors.end} />
                            </linearGradient>
                        </defs>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-gray-200 dark:text-gray-800"
                        />
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={`url(#${glowId})`}
                            strokeWidth={strokeWidth + 2}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={animated ? { strokeDashoffset: circumference } : false}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl mb-1">⭐</span>
                        <motion.span
                            className="font-bold text-gray-900 dark:text-white"
                            style={{ fontSize: size * 0.22 }}
                            initial={animated ? { opacity: 0, y: 10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            {score.toFixed(1)}
                        </motion.span>
                    </div>
                </div>
                {showLabel && (
                    <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                    </span>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: DEFAULT - Version standard
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full transform -rotate-90">
                    {/* Cercle de fond */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Cercle de progression */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.start}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={animated ? { strokeDashoffset: circumference } : false}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </svg>
                {/* Contenu central */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="font-bold"
                        style={{ fontSize: size * 0.28, color: colors.text }}
                        initial={animated ? { scale: 0.5, opacity: 0 } : false}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    >
                        {score.toFixed(1)}
                    </motion.span>
                    <span
                        className="text-gray-400 dark:text-gray-500"
                        style={{ fontSize: size * 0.11 }}
                    >
                        sur {maxRating}
                    </span>
                </div>
            </div>
            {showLabel && (
                <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {label}
                </span>
            )}
        </div>
    );
}
