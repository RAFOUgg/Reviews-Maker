/**
 * EffectsRadar - Graphique radar pour afficher les effets
 * Visualisation professionnelle du profil d'effets
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Catégories d'effets prédéfinies
const EFFECT_CATEGORIES = {
    relaxed: { label: 'Relaxant', icon: '😌', color: '#22c55e', angle: 0 },
    happy: { label: 'Joyeux', icon: '😊', color: '#fbbf24', angle: 45 },
    euphoric: { label: 'Euphorique', icon: '🤩', color: '#f97316', angle: 90 },
    creative: { label: 'Créatif', icon: '🎨', color: '#a855f7', angle: 135 },
    energetic: { label: 'Énergisant', icon: '⚡', color: '#ef4444', angle: 180 },
    focused: { label: 'Focus', icon: '🎯', color: '#3b82f6', angle: 225 },
    sleepy: { label: 'Somnolent', icon: '😴', color: '#6366f1', angle: 270 },
    hungry: { label: 'Appétit', icon: '🍽️', color: '#ec4899', angle: 315 },
};

// Effets alternatifs mappés vers les catégories principales
const EFFECT_ALIASES = {
    'détente': 'relaxed', 'relaxation': 'relaxed', 'calme': 'relaxed', 'apaisant': 'relaxed',
    'bonheur': 'happy', 'joie': 'happy', 'bonne humeur': 'happy', 'positif': 'happy',
    'euphorie': 'euphoric', 'high': 'euphoric', 'planant': 'euphoric', 'intense': 'euphoric',
    'créativité': 'creative', 'inspiration': 'creative', 'artistique': 'creative',
    'énergie': 'energetic', 'boost': 'energetic', 'stimulant': 'energetic', 'dynamique': 'energetic',
    'concentration': 'focused', 'clarté': 'focused', 'mental': 'focused', 'lucide': 'focused',
    'sommeil': 'sleepy', 'fatigue': 'sleepy', 'endormant': 'sleepy', 'lourd': 'sleepy',
    'faim': 'hungry', 'munchies': 'hungry', 'fringale': 'hungry',
};

// Normaliser un effet vers une catégorie
function normalizeEffect(effectName) {
    if (!effectName) return null;
    const lower = effectName.toLowerCase().trim();

    // Vérifier correspondance directe
    if (EFFECT_CATEGORIES[lower]) return lower;

    // Vérifier alias
    for (const [alias, category] of Object.entries(EFFECT_ALIASES)) {
        if (lower.includes(alias) || alias.includes(lower)) {
            return category;
        }
    }

    // Vérifier correspondance partielle avec catégories
    for (const key of Object.keys(EFFECT_CATEGORIES)) {
        if (lower.includes(key) || key.includes(lower)) {
            return key;
        }
    }

    return null;
}

// Parser les effets (array, object ou string)
function parseEffects(data) {
    if (!data) return [];

    // Si c'est un string JSON
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            // Liste séparée par virgules
            return data.split(',').map(e => e.trim()).filter(Boolean).map(name => ({
                name,
                value: 50,
                category: normalizeEffect(name)
            }));
        }
    }

    // Si c'est un tableau
    if (Array.isArray(data)) {
        return data.map(item => {
            if (typeof item === 'string') {
                return { name: item, value: 50, category: normalizeEffect(item) };
            }
            const name = item.name || item.effect || item.label || 'Unknown';
            return {
                name,
                value: item.value || item.intensity || item.percentage || 50,
                category: normalizeEffect(name)
            };
        });
    }

    // Si c'est un objet { relaxed: 80, happy: 60, ... }
    if (typeof data === 'object') {
        return Object.entries(data).map(([name, value]) => ({
            name,
            value: typeof value === 'number' ? value : 50,
            category: normalizeEffect(name)
        }));
    }

    return [];
}

export default function EffectsRadar({
    effects,
    variant = 'radar', // 'radar' | 'bars' | 'grid' | 'tags'
    size = 200,
    showLabels = true,
    animated = true,
    colorScheme = 'gradient' // 'gradient' | 'mono' | 'category'
}) {
    const parsedEffects = useMemo(() => parseEffects(effects), [effects]);

    if (!parsedEffects.length) {
        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: RADAR - Graphique radar/spider
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'radar') {
        const categories = Object.keys(EFFECT_CATEGORIES);
        const numAxes = categories.length;
        const angleStep = (2 * Math.PI) / numAxes;
        const center = size / 2;
        const maxRadius = (size / 2) - 30;

        // Construire les valeurs pour chaque axe
        const axisValues = categories.map(cat => {
            const matching = parsedEffects.filter(e => e.category === cat);
            if (matching.length === 0) return 0;
            return Math.max(...matching.map(e => e.value)) / 100;
        });

        // Générer les points du polygone
        const polygonPoints = axisValues.map((value, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const radius = value * maxRadius;
            return {
                x: center + radius * Math.cos(angle),
                y: center + radius * Math.sin(angle)
            };
        });

        const polygonPath = polygonPoints.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ') + ' Z';

        // Grille de fond
        const gridLevels = [0.25, 0.5, 0.75, 1];

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
                    {/* Grille de fond */}
                    {gridLevels.map((level, levelIndex) => {
                        const radius = level * maxRadius;
                        const points = categories.map((_, index) => {
                            const angle = index * angleStep - Math.PI / 2;
                            return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
                        }).join(' ');

                        return (
                            <polygon
                                key={levelIndex}
                                points={points}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-gray-200 dark:text-gray-700"
                            />
                        );
                    })}

                    {/* Axes */}
                    {categories.map((_, index) => {
                        const angle = index * angleStep - Math.PI / 2;
                        const x2 = center + maxRadius * Math.cos(angle);
                        const y2 = center + maxRadius * Math.sin(angle);

                        return (
                            <line
                                key={index}
                                x1={center}
                                y1={center}
                                x2={x2}
                                y2={y2}
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-gray-200 dark:text-gray-700"
                            />
                        );
                    })}

                    {/* Zone de valeurs */}
                    <motion.path
                        d={polygonPath}
                        fill="url(#radarGradient)"
                        fillOpacity="0.3"
                        stroke="url(#radarStroke)"
                        strokeWidth="2"
                        initial={animated ? { pathLength: 0, opacity: 0 } : false}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Points sur les axes */}
                    {polygonPoints.map((point, index) => (
                        <motion.circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill={EFFECT_CATEGORIES[categories[index]].color}
                            initial={animated ? { scale: 0 } : false}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                        />
                    ))}

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Labels autour du radar */}
                {showLabels && categories.map((cat, index) => {
                    const category = EFFECT_CATEGORIES[cat];
                    const angle = index * angleStep - Math.PI / 2;
                    const labelRadius = maxRadius + 20;
                    const x = center + labelRadius * Math.cos(angle);
                    const y = center + labelRadius * Math.sin(angle);

                    return (
                        <div
                            key={cat}
                            className="absolute flex flex-col items-center"
                            style={{
                                left: x,
                                top: y,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                                {category.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: BARS - Barres horizontales
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'bars') {
        return (
            <div className="space-y-3">
                {parsedEffects.slice(0, 8).map((effect, index) => {
                    const category = effect.category ? EFFECT_CATEGORIES[effect.category] : null;
                    const color = category?.color || '#6b7280';
                    const icon = category?.icon || '✨';

                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{icon}</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                                        {effect.name}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{effect.value}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={animated ? { width: 0 } : false}
                                    animate={{ width: `${effect.value}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: GRID - Grille d'icônes
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'grid') {
        return (
            <div className="grid grid-cols-4 gap-3">
                {Object.entries(EFFECT_CATEGORIES).map(([key, category]) => {
                    const matching = parsedEffects.find(e => e.category === key);
                    const isActive = !!matching;
                    const value = matching?.value || 0;

                    return (
                        <motion.div
                            key={key}
                            initial={animated ? { opacity: 0, y: 10 } : false}
                            animate={{ opacity: 1, y: 0 }}
                            className={`
                                flex flex-col items-center p-3 rounded-xl transition-all
                                ${isActive
                                    ? 'bg-white dark:bg-gray-800 shadow-md border-2'
                                    : 'bg-gray-100 dark:bg-gray-900/50 opacity-40'
                                }
                            `}
                            style={{ borderColor: isActive ? category.color : 'transparent' }}
                        >
                            <span className="text-2xl mb-1">{category.icon}</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {category.label}
                            </span>
                            {isActive && (
                                <span
                                    className="text-xs font-bold mt-1"
                                    style={{ color: category.color }}
                                >
                                    {value}%
                                </span>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // VARIANT: TAGS - Badges/tags colorés
    // ═══════════════════════════════════════════════════════════════
    if (variant === 'tags') {
        return (
            <div className="flex flex-wrap gap-2">
                {parsedEffects.map((effect, index) => {
                    const category = effect.category ? EFFECT_CATEGORIES[effect.category] : null;
                    const color = category?.color || '#6b7280';
                    const icon = category?.icon || '✨';

                    return (
                        <motion.span
                            key={index}
                            initial={animated ? { opacity: 0, scale: 0.8 } : false}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-sm"
                            style={{ backgroundColor: color }}
                        >
                            <span>{icon}</span>
                            <span className="capitalize">{effect.name}</span>
                        </motion.span>
                    );
                })}
            </div>
        );
    }

    return null;
}


