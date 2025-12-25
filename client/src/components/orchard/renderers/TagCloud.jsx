/**
 * TagCloud - Nuage de tags stylisé
 * Affichage professionnel des tags avec plusieurs variantes
 */

import { motion } from 'framer-motion';

// Couleurs pour les tags (cycle)
const TAG_COLORS = [
    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
];

// Gradients pour variante gradient
const GRADIENT_COLORS = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-yellow-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-green-500',
    'from-amber-500 to-orange-500',
];

// Parser les tags
function parseTags(data) {
    if (!data) return [];

    // String
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            // Liste séparée par virgules
            return data.split(',').map(t => t.trim()).filter(Boolean);
        }
    }

    // Array
    if (Array.isArray(data)) {
        return data.map(item => {
            if (typeof item === 'string') return item;
            return item.name || item.label || item.tag || String(item);
        }).filter(Boolean);
    }

    return [];
}

export default function TagCloud({
    tags,
    variant = 'pills', // 'pills' | 'gradient' | 'outline' | 'minimal' | 'hashtags'
    size = 'md', // 'sm' | 'md' | 'lg'
    maxTags = 20,
    animated = true,
    wrap = true,
    colorful = true,
    icon = null // emoji à mettre devant chaque tag
}) {
    const parsedTags = parseTags(tags).slice(0, maxTags);

    if (!parsedTags.length) {
        return null;
    }

    const sizes = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-3 py-1 gap-1.5',
        lg: 'text-base px-4 py-1.5 gap-2'
    };
    const s = sizes[size] || sizes.md;

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: PILLS - Pilules colorées
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'pills') {
        return (
            <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
                {parsedTags.map((tag, index) => {
                    const color = colorful ? TAG_COLORS[index % TAG_COLORS.length] : TAG_COLORS[0];

                    return (
                        <motion.span
                            key={index}
                            initial={animated ? { opacity: 0, scale: 0.8 } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className={`
                                inline-flex items-center rounded-full font-medium
                                ${s} ${color.bg} ${color.text}
                            `}
                        >
                            {icon && <span className="mr-1">{icon}</span>}
                            {tag}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: GRADIENT - Dégradés colorés
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'gradient') {
        return (
            <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
                {parsedTags.map((tag, index) => {
                    const gradient = colorful ? GRADIENT_COLORS[index % GRADIENT_COLORS.length] : GRADIENT_COLORS[0];

                    return (
                        <motion.span
                            key={index}
                            initial={animated ? { opacity: 0, y: 10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                inline-flex items-center rounded-full font-medium text-white shadow-sm
                                bg-gradient-to-r ${gradient} ${s}
                            `}
                        >
                            {icon && <span className="mr-1">{icon}</span>}
                            {tag}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: OUTLINE - Bordures uniquement
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'outline') {
        return (
            <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
                {parsedTags.map((tag, index) => {
                    const color = colorful ? TAG_COLORS[index % TAG_COLORS.length] : TAG_COLORS[0];

                    return (
                        <motion.span
                            key={index}
                            initial={animated ? { opacity: 0, scale: 0.9 } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className={`
                                inline-flex items-center rounded-full font-medium border-2
                                ${s} ${color.text} ${color.border} bg-transparent
                            `}
                        >
                            {icon && <span className="mr-1">{icon}</span>}
                            {tag}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: MINIMAL - Version très simple
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'minimal') {
        return (
            <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
                {parsedTags.map((tag, index) => (
                    <motion.span
                        key={index}
                        initial={animated ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`
                            inline-flex items-center rounded font-medium
                            ${s} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                        `}
                    >
                        {icon && <span className="mr-1">{icon}</span>}
                        {tag}
                    </motion.span>
                ))}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: HASHTAGS - Style hashtag social media
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'hashtags') {
        return (
            <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-x-3 gap-y-1`}>
                {parsedTags.map((tag, index) => {
                    const color = colorful ? TAG_COLORS[index % TAG_COLORS.length] : TAG_COLORS[0];

                    return (
                        <motion.span
                            key={index}
                            initial={animated ? { opacity: 0, x: -5 } : false}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={`
                                inline-flex items-center font-semibold ${color.text}
                                ${sizes[size]?.split(' ')[0] || 'text-sm'}
                            `}
                        >
                            <span className="opacity-70">#</span>
                            {tag.replace(/\s+/g, '')}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    return null;
}

// Export des couleurs pour réutilisation
export { TAG_COLORS, GRADIENT_COLORS };
