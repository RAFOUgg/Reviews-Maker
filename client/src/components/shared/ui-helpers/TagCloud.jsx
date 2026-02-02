/**
 * TagCloud - Nuage de tags stylisé
 * Affichage professionnel des tags avec plusieurs variantes
 * Liquid Glass UI Design System
 */

import { motion } from 'framer-motion';

// Couleurs Liquid Glass pour les tags
const TAG_COLORS = [
    { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/30' },
    { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
    { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
    { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' },
    { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
    { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
    { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
    { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
];

// Gradients Liquid Glass
const GRADIENT_COLORS = [
    'from-violet-500/40 to-purple-500/40',
    'from-blue-500/40 to-cyan-500/40',
    'from-green-500/40 to-emerald-500/40',
    'from-orange-500/40 to-amber-500/40',
    'from-rose-500/40 to-pink-500/40',
    'from-indigo-500/40 to-blue-500/40',
    'from-teal-500/40 to-green-500/40',
    'from-amber-500/40 to-orange-500/40',
];

// Parser les tags
function parseTags(data) {
    if (!data) return [];

    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return data.split(',').map(t => t.trim()).filter(Boolean);
        }
    }

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
    size = 'md',
    maxTags = 20,
    animated = true,
    wrap = true,
    colorful = true,
    icon = null
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

    // VARIANT: PILLS - Pilules colorées Liquid Glass
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
                            className={`inline-flex items-center rounded-full font-medium backdrop-blur-sm border ${s} ${color.bg} ${color.text} ${color.border}`}
                        >
                            {icon && <span className="mr-1">{icon}</span>}
                            {tag}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    // VARIANT: GRADIENT - Gradient Liquid Glass
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
                            transition={{ delay: index * 0.03 }}
                            className={`inline-flex items-center rounded-full font-semibold text-white bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/20 ${s}`}
                        >
                            {icon && <span className="mr-1">{icon}</span>}
                            {tag}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    // VARIANT: OUTLINE - Bordure Liquid Glass
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
                            className={`inline-flex items-center rounded-full font-medium bg-transparent border-2 ${s} ${color.text} ${color.border}`}
                        >
                            {icon && <span className="mr-1">{icon}</span>}
                            {tag}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    // VARIANT: MINIMAL - Style minimaliste
    if (variant === 'minimal') {
        return (
            <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
                {parsedTags.map((tag, index) => (
                    <motion.span
                        key={index}
                        initial={animated ? { opacity: 0 } : false}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`inline-flex items-center text-white/60 hover:text-white transition-colors ${sizes[size]}`}
                    >
                        {icon && <span className="mr-1">{icon}</span>}
                        {tag}
                    </motion.span>
                ))}
            </div>
        );
    }

    // VARIANT: HASHTAGS - Style hashtag
    if (variant === 'hashtags') {
        return (
            <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
                {parsedTags.map((tag, index) => {
                    const color = colorful ? TAG_COLORS[index % TAG_COLORS.length] : TAG_COLORS[0];

                    return (
                        <motion.span
                            key={index}
                            initial={animated ? { opacity: 0, x: -5 } : false}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`inline-flex items-center font-medium ${sizes[size]} ${color.text}`}
                        >
                            <span className="opacity-60">#</span>
                            {tag.toLowerCase().replace(/\s+/g, '')}
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    // Default fallback to pills
    return (
        <div className={`flex ${wrap ? 'flex-wrap' : 'overflow-x-auto'} gap-2`}>
            {parsedTags.map((tag, index) => (
                <span
                    key={index}
                    className={`inline-flex items-center rounded-full font-medium bg-white/10 text-white/80 border border-white/20 ${s}`}
                >
                    {icon && <span className="mr-1">{icon}</span>}
                    {tag}
                </span>
            ))}
        </div>
    );
}


