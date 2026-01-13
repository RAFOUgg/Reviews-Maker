/**
 * TerpeneBar - Barre horizontale pour afficher les terpènes
 * Affichage professionnel avec dégradés et animations
 */

import { motion } from 'framer-motion';

// Couleurs et infos des terpènes courants
const TERPENE_DATA = {
    myrcene: { color: '#22c55e', gradient: 'from-green-400 to-green-600', icon: '🥭', desc: 'Terreux, musqué' },
    limonene: { color: '#fbbf24', gradient: 'from-yellow-400 to-orange-500', icon: '🍋', desc: 'Agrumes' },
    caryophyllene: { color: '#a855f7', gradient: ' ', icon: '🌶️', desc: 'Épicé, poivré' },
    pinene: { color: '#10b981', gradient: 'from-emerald-400 to-teal-600', icon: '🌲', desc: 'Pin, forêt' },
    linalool: { color: '#ec4899', gradient: ' ', icon: '💐', desc: 'Floral, lavande' },
    humulene: { color: '#f97316', gradient: 'from-orange-400 to-amber-600', icon: '🍺', desc: 'Houblon, boisé' },
    terpinolene: { color: '#06b6d4', gradient: ' ', icon: '🌿', desc: 'Frais, herbacé' },
    ocimene: { color: '#84cc16', gradient: 'from-lime-400 to-green-500', icon: '🌸', desc: 'Sucré, floral' },
    bisabolol: { color: '#f472b6', gradient: 'from-rose-300 ', icon: '🌼', desc: 'Camomille' },
    eucalyptol: { color: '#14b8a6', gradient: 'from-teal-400 to-emerald-500', icon: '🌿', desc: 'Mentholé' },
    geraniol: { color: '#fb7185', gradient: 'from-rose-400 to-red-500', icon: '🌹', desc: 'Rose, géranium' },
    valencene: { color: '#fb923c', gradient: 'from-orange-300 to-orange-500', icon: '🍊', desc: 'Orange douce' },
};

// Normaliser le nom du terpène
function normalizeTerpene(name) {
    if (!name) return 'other';
    const lower = name.toLowerCase().trim();
    // Chercher correspondance
    for (const key of Object.keys(TERPENE_DATA)) {
        if (lower.includes(key) || key.includes(lower)) {
            return key;
        }
    }
    return 'other';
}

// Obtenir les données d'un terpène
function getTerpeneInfo(name) {
    const normalized = normalizeTerpene(name);
    return TERPENE_DATA[normalized] || {
        color: '#6b7280',
        gradient: 'from-gray-400 to-gray-600',
        icon: '🧪',
        desc: 'Terpène'
    };
}

// Parser les données de terpènes (peut être array, object ou string)
function parseTerpenes(data) {
    if (!data) return [];

    // Si c'est un string JSON
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            // C'est une liste séparée par virgules
            return data.split(',').map(t => t.trim()).filter(Boolean).map(name => ({
                name,
                value: null
            }));
        }
    }

    // Si c'est un tableau
    if (Array.isArray(data)) {
        return data.map(item => {
            if (typeof item === 'string') return { name: item, value: null };
            return {
                name: item.name || item.terpene || item.label || 'Unknown',
                value: item.value || item.percentage || item.amount || null
            };
        });
    }

    // Si c'est un objet { myrcene: 0.5, limonene: 0.3, ... }
    if (typeof data === 'object') {
        return Object.entries(data).map(([name, value]) => ({
            name,
            value: typeof value === 'number' ? value : null
        }));
    }

    return [];
}

export default function TerpeneBar({
    terpenes,
    variant = 'bars', // 'bars' | 'pills' | 'wheel' | 'compact'
    showLabels = true,
    showValues = true,
    maxDisplay = 8,
    animated = true,
    size = 'md' // 'sm' | 'md' | 'lg'
}) {
    const parsedTerpenes = parseTerpenes(terpenes);

    if (!parsedTerpenes.length) {
        return null;
    }

    // Limiter le nombre affiché
    const displayTerpenes = parsedTerpenes.slice(0, maxDisplay);

    // Calculer le max pour normaliser les barres
    const maxValue = Math.max(...displayTerpenes.map(t => t.value || 1), 1);

    // Tailles selon le prop size
    const sizes = {
        sm: { bar: 'h-2', text: 'text-xs', icon: 'text-sm', gap: 'gap-1' },
        md: { bar: 'h-3', text: 'text-sm', icon: 'text-base', gap: 'gap-2' },
        lg: { bar: 'h-4', text: 'text-base', icon: 'text-lg', gap: 'gap-3' }
    };
    const s = sizes[size] || sizes.md;

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: BARS - Barres horizontales empilées
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'bars') {
        return (
            <div className={`space-y-2 ${s.gap}`}>
                {displayTerpenes.map((terpene, index) => {
                    const info = getTerpeneInfo(terpene.name);
                    const percentage = terpene.value ? (terpene.value / maxValue) * 100 : 50;

                    return (
                        <div key={index} className="space-y-1">
                            {showLabels && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className={s.icon}>{info.icon}</span>
                                        <span className={`font-medium text-gray-800 dark:text-gray-200 ${s.text} capitalize`}>
                                            {terpene.name}
                                        </span>
                                    </div>
                                    {showValues && terpene.value !== null && (
                                        <span className={`text-gray-500 dark:text-gray-400 ${s.text}`}>
                                            {typeof terpene.value === 'number'
                                                ? `${terpene.value.toFixed(2)}%`
                                                : terpene.value
                                            }
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className={`w-full ${s.bar} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
                                <motion.div
                                    initial={animated ? { width: 0 } : false}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`h-full bg-gradient-to-r ${info.gradient} rounded-full`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: PILLS - Badges/pilules colorées
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'pills') {
        return (
            <div className="flex flex-wrap gap-2">
                {displayTerpenes.map((terpene, index) => {
                    const info = getTerpeneInfo(terpene.name);

                    return (
                        <motion.div
                            key={index}
                            initial={animated ? { opacity: 0, scale: 0.8 } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${info.gradient} text-white shadow-sm ${s.text}`}
                            title={info.desc}
                        >
                            <span>{info.icon}</span>
                            <span className="font-medium capitalize">{terpene.name}</span>
                            {showValues && terpene.value !== null && (
                                <span className="opacity-80 ml-1">
                                    {typeof terpene.value === 'number'
                                        ? `${terpene.value.toFixed(1)}%`
                                        : terpene.value
                                    }
                                </span>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: WHEEL - Roue/cercle de terpènes
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'wheel') {
        const total = displayTerpenes.reduce((sum, t) => sum + (t.value || 1), 0);
        let currentAngle = 0;

        return (
            <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {displayTerpenes.map((terpene, index) => {
                        const info = getTerpeneInfo(terpene.name);
                        const value = terpene.value || 1;
                        const percentage = value / total;
                        const angle = percentage * 360;

                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        currentAngle = endAngle;

                        const largeArc = angle > 180 ? 1 : 0;
                        const startRad = (startAngle - 90) * (Math.PI / 180);
                        const endRad = (endAngle - 90) * (Math.PI / 180);

                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);

                        const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

                        return (
                            <motion.path
                                key={index}
                                d={path}
                                fill={info.color}
                                initial={animated ? { opacity: 0 } : false}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="hover:opacity-80 cursor-pointer"
                            >
                                <title>{`${terpene.name}: ${terpene.value ? `${terpene.value}%` : 'N/A'}`}</title>
                            </motion.path>
                        );
                    })}
                    {/* Centre blanc */}
                    <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-gray-800" />
                    <text x="50" y="52" textAnchor="middle" className="text-xs fill-gray-600 dark:fill-gray-300 font-medium">
                        Terpènes
                    </text>
                </svg>

                {/* Légende */}
                {showLabels && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {displayTerpenes.slice(0, 6).map((terpene, index) => {
                            const info = getTerpeneInfo(terpene.name);
                            return (
                                <div key={index} className="flex items-center gap-1 text-xs">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: info.color }}
                                    />
                                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                                        {terpene.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: COMPACT - Version très compacte
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-1 flex-wrap">
                {displayTerpenes.slice(0, 5).map((terpene, index) => {
                    const info = getTerpeneInfo(terpene.name);
                    return (
                        <motion.span
                            key={index}
                            initial={animated ? { scale: 0 } : false}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm"
                            style={{ backgroundColor: info.color + '30' }}
                            title={`${terpene.name}${terpene.value ? `: ${terpene.value}%` : ''}`}
                        >
                            {info.icon}
                        </motion.span>
                    );
                })}
                {parsedTerpenes.length > 5 && (
                    <span className="text-xs text-gray-500">
                        +{parsedTerpenes.length - 5}
                    </span>
                )}
            </div>
        );
    }

    return null;
}

