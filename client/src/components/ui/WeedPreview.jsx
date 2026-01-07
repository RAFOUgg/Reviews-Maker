import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// 10 couleurs cannabis naturelles (synchronisé avec ColorWheelPicker)
const CANNABIS_COLORS = [
    { id: 'green-lime', hex: '#84CC16' },
    { id: 'green', hex: '#22C55E' },
    { id: 'green-forest', hex: '#166534' },
    { id: 'green-dark', hex: '#14532D' },
    { id: 'blue-green', hex: '#0D9488' },
    { id: 'purple', hex: '#7C3AED' },
    { id: 'purple-dark', hex: '#4C1D95' },
    { id: 'orange', hex: '#EA580C' },
    { id: 'yellow', hex: '#CA8A04' },
    { id: 'brown', hex: '#78350F' }
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const mixHexColors = (from, to, amount = 0.5) => {
    const ratio = clamp01(amount);
    const cleanFrom = from.replace('#', '');
    const cleanTo = to.replace('#', '');
    if (cleanFrom.length !== 6 || cleanTo.length !== 6) return from;

    const fromRGB = [
        parseInt(cleanFrom.slice(0, 2), 16),
        parseInt(cleanFrom.slice(2, 4), 16),
        parseInt(cleanFrom.slice(4, 6), 16)
    ];

    const toRGB = [
        parseInt(cleanTo.slice(0, 2), 16),
        parseInt(cleanTo.slice(2, 4), 16),
        parseInt(cleanTo.slice(4, 6), 16)
    ];

    const mixed = fromRGB.map((channel, index) => {
        const target = toRGB[index];
        return Math.round(channel + (target - channel) * ratio)
            .toString(16)
            .padStart(2, '0');
    });

    return `#${mixed.join('')}`;
};

const createRandomGenerator = (seed) => {
    let value = seed || 1;
    return () => {
        value = (value * 1664525 + 1013904223) % 4294967296;
        return value / 4294967296;
    };
};

const WeedPreview = ({
    selectedColors = [],
    densite = 5,
    trichomes = 5,
    pistils = 5,
    manucure = 5,
    moisissure = 10,
    graines = 10
}) => {
    const randomSeed = useMemo(() => {
        const seedString = `${densite}-${trichomes}-${pistils}-${manucure}-${moisissure}-${graines}-${selectedColors
            .map(s => `${s.colorId}-${s.percentage}`)
            .join('-')}`;
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
        }
        return hash || 1;
    }, [densite, trichomes, pistils, manucure, moisissure, graines, selectedColors]);
    // Générer le gradient SVG basé sur les couleurs sélectionnées
    const gradientStops = useMemo(() => {
        if (!selectedColors || selectedColors.length === 0) {
            return [{ offset: '0%', color: '#22C55E' }]; // Vert par défaut
        }

        let offset = 0;
        return selectedColors.map((selected, index) => {
            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
            const stops = [];

            stops.push({
                offset: `${offset}%`,
                color: colorData?.hex || '#38A169'
            });

            offset += selected.percentage;

            // Dernier stop
            if (index === selectedColors.length - 1) {
                stops.push({
                    offset: `${offset}%`,
                    color: colorData?.hex || '#38A169'
                });
            }

            return stops;
        }).flat();
    }, [selectedColors]);

    const hasColors = selectedColors && selectedColors.length > 0;

    // Générer la couleur de base (toujours verte/jaune)
    const baseColor = useMemo(() => {
        const baseColorData = selectedColors.find(s => {
            return s.colorId.includes('green') || s.colorId === 'yellow';
        });
        return baseColorData
            ? CANNABIS_COLORS.find(c => c.id === baseColorData.colorId)?.hex || '#22C55E'
            : '#22C55E';
    }, [selectedColors]);

    // Distribuer les couleurs aux bractées de manière déterministe
    const bracteeColors = useMemo(() => {
        const baseArray = () => Array(24).fill(mixHexColors('#22C55E', '#E6FFCC', 0.08 + manucure * 0.01));

        if (!hasColors || selectedColors.length === 0) {
            return baseArray();
        }

        // Créer un tableau de 24 bractées réparties selon les pourcentages
        const colors = [];
        selectedColors.forEach(selected => {
            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
            const count = Math.round((selected.percentage / 100) * 24);
            for (let i = 0; i < count; i++) {
                colors.push(colorData?.hex || baseColor);
            }
        });

        while (colors.length < 24) {
            colors.push(baseColor);
        }
        if (colors.length > 24) {
            colors.length = 24;
        }

        // Mélanger de manière déterministe basé sur les IDs des couleurs
        const seed = selectedColors.map(s => s.colorId).join('');
        let seedNum = 0;
        for (let i = 0; i < seed.length; i++) {
            seedNum += seed.charCodeAt(i);
        }

        const shuffled = [...colors];
        for (let i = shuffled.length - 1; i > 0; i--) {
            seedNum = (seedNum * 9301 + 49297) % 233280;
            const j = Math.floor((seedNum / 233280) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Lissage visuel : petite touche de lumière et d'ombre pour texturer les bractées
        return shuffled.map(color => {
            const withLight = mixHexColors(color, '#FFFFFF', 0.09 + manucure * 0.02);
            return mixHexColors(withLight, '#0B1015', 0.05 + (10 - densite) * 0.015);
        });
    }, [selectedColors, hasColors, baseColor, manucure, densite]);

    // Calculs des effets visuels basés sur les jauges
    const visualEffects = useMemo(() => {
        // Densité: contrôle espacement et volume (0=aéré, 10=compact)
        const spacing = 1.0 + ((10 - densite) / 10) * 0.4;
        const budDensity = densite / 10; // 0 à 1

        // Manucure: 0=feuilles présentes, 10=bractées seules
        const trimLevel = manucure / 10; // 0 à 1

        // Trichomes: quantité réaliste avec tige+bulbe
        const trichomeCount = Math.round((trichomes / 10) * 45); // 0 à 45
        const trichomeDensity = trichomes / 10;

        // Pistils: quantité et longueur organique
        const pistilCount = Math.round((pistils / 10) * 22); // 0 à 22
        const pistilLength = 12 + pistils * 1.2; // plus longs avec note haute

        // Moisissure et graines
        const moldSpots = Math.round(((10 - moisissure) / 10) * 10);
        const seedCount = Math.round(((10 - graines) / 10) * 6);

        // Échelle globale cohérente
        const budScaleX = 1.02 + budDensity * 0.12;
        const budScaleY = 1.0 + budDensity * 0.15;

        // Feuilles: disparaissent progressivement avec manucure
        const leafVisibility = Math.max(0, 1 - trimLevel * 1.2);
        const leafCount = Math.round((1 - trimLevel) * 7);

        return {
            spacing,
            budDensity,
            trimLevel,
            trichomeCount,
            trichomeDensity,
            pistilCount,
            pistilLength,
            moldSpots,
            seedCount,
            budScaleX,
            budScaleY,
            leafVisibility,
            leafCount
        };
    }, [densite, trichomes, manucure, moisissure, graines, pistils]);

    const pistilColor = useMemo(() => mixHexColors('#FBBF24', '#C2410C', pistils / 10), [pistils]);
    const pistilHighlight = useMemo(() => mixHexColors(pistilColor, '#FFE8C7', 0.35), [pistilColor]);

    const trichomePoints = useMemo(() => {
        const random = createRandomGenerator(randomSeed + 13);
        const points = [];
        for (let i = 0; i < visualEffects.trichomeCount; i++) {
            const angle = random() * Math.PI * 2;
            const radius = 22 + random() * 38;
            const x = 120 + Math.cos(angle) * radius;
            const y = 135 + Math.sin(angle) * radius * 0.92 - 15;
            const stemLength = 3.5 + random() * 2.5; // tige fine
            const bulbSize = 0.8 + random() * 0.6 + visualEffects.trichomeDensity * 0.4; // bulbe
            const tilt = (random() - 0.5) * 25;
            points.push({ x, y, stemLength, bulbSize, tilt, delay: 0.65 + i * 0.008 });
        }
        return points;
    }, [visualEffects.trichomeCount, visualEffects.trichomeDensity, randomSeed]);

    const sparklePoints = useMemo(() => {
        const count = Math.min(24, Math.max(6, Math.floor(visualEffects.trichomeCount / 1.2)));
        const random = createRandomGenerator(randomSeed + 71);
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2 + random() * 0.6;
            const radius = 20 + Math.cos(i * 1.3) * 22 * (0.9 + visualEffects.roundness * 0.2);
            const x = 120 + Math.cos(angle) * radius;
            const y = 140 + Math.sin(angle) * radius * 1.05 - 24 + random() * 6;
            return { x, y, delay: i * 0.1 + 0.4, duration: 1.6 + random() * 0.9 };
        });
    }, [visualEffects.trichomeCount, visualEffects.roundness, randomSeed]);

    const pistilCurves = useMemo(() => {
        const random = createRandomGenerator(randomSeed + 211);
        const curves = [];
        for (let i = 0; i < visualEffects.pistilCount; i++) {
            const angle = (i / Math.max(1, visualEffects.pistilCount)) * Math.PI * 2 + random() * 1.2;
            const distance = 18 + random() * 35;
            const baseX = 120 + Math.cos(angle) * distance * 0.65;
            const baseY = 120 + Math.sin(angle) * distance * 0.85 + 10;
            const length = visualEffects.pistilLength * (0.7 + random() * 0.5);
            const curl = (random() - 0.5) * 8;
            const tipX = baseX + Math.cos(angle + 0.4) * length + curl;
            const tipY = baseY - length * 0.6 + Math.abs(curl) * 0.5;
            curves.push({ baseX, baseY, tipX, tipY, delay: 0.5 + i * 0.025 });
        }
        return curves;
    }, [visualEffects.pistilCount, visualEffects.pistilLength, randomSeed]);

    const sugarLeaves = useMemo(() => {
        if (visualEffects.leafCount === 0) return [];
        const random = createRandomGenerator(randomSeed + 411);
        const leaves = [];
        for (let i = 0; i < visualEffects.leafCount; i++) {
            const spread = 32 + random() * 18;
            const length = 50 + random() * 26;
            const width = 16 + random() * 8;
            const angle = -40 + i * (80 / Math.max(1, visualEffects.leafCount - 1)) + (random() - 0.5) * 12;
            const baseX = 120 + (Math.cos((angle * Math.PI) / 180) * spread) * 0.6;
            const baseY = 190 + random() * 18;
            const angleRad = (angle * Math.PI) / 180;
            const tipX = baseX + Math.cos(angleRad) * length;
            const tipY = baseY + Math.sin(angleRad) * length * 0.88;
            const c1x = baseX + Math.cos(angleRad - 0.65) * width;
            const c1y = baseY + Math.sin(angleRad - 0.65) * width;
            const c2x = baseX + Math.cos(angleRad - 0.15) * width * 1.3;
            const c2y = baseY + Math.sin(angleRad - 0.15) * width * 1.3;
            const c3x = tipX + Math.cos(angleRad + 0.45) * width * 0.85;
            const c3y = tipY + Math.sin(angleRad + 0.45) * width * 0.85;
            const c4x = baseX + Math.cos(angleRad + 0.35) * width * 1.2;
            const c4y = baseY + Math.sin(angleRad + 0.35) * width * 1.2;
            const color = mixHexColors(baseColor, '#0B1015', 0.32 + random() * 0.08);
            leaves.push({
                d: `M ${baseX} ${baseY} C ${c1x} ${c1y} ${c2x} ${c2y} ${tipX} ${tipY} C ${c3x} ${c3y} ${c4x} ${c4y} ${baseX} ${baseY} Z`,
                color,
                stroke: mixHexColors(color, '#0B1015', 0.28),
                delay: 0.22 + i * 0.045
            });
        }
        return leaves;
    }, [randomSeed, baseColor, visualEffects.leafCount]);

    const calyxClusters = useMemo(() => {
        const random = createRandomGenerator(randomSeed + 521);
        const count = 12 + Math.round(densite * 1.4) + Math.round(trichomes * 0.3);
        const clusters = [];
        for (let i = 0; i < count; i++) {
            const ring = 42 + random() * 115 * visualEffects.calyxStretch;
            const angle = random() * Math.PI * 2;
            const x = 120 + Math.cos(angle) * (ring * 0.25 + random() * 5);
            const y = 110 + Math.sin(angle) * (ring * 0.3 + random() * 9);
            const size = 4.2 + random() * 2.4;
            const squish = 0.6 + random() * 0.24;
            const hueMix = mixHexColors(baseColor, '#2F1E16', 0.25 + random() * 0.1);
            clusters.push({ x, y, rx: size, ry: size * squish, color: hueMix, delay: 0.42 + i * 0.02 });
        }
        return clusters;
    }, [randomSeed, densite, baseColor, trichomes, visualEffects.calyxStretch]);

    const bractVeins = useMemo(() => {
        const random = createRandomGenerator(randomSeed + 331);
        const count = 18 + Math.round(densite * 0.8);
        const veins = [];
        for (let i = 0; i < count; i++) {
            const angle = random() * Math.PI * 2;
            const radius = 26 + random() * 58;
            const baseX = 120 + Math.cos(angle) * radius * 0.55;
            const baseY = 120 + Math.sin(angle) * radius * 0.75;
            const bend = (random() - 0.5) * 18;
            const length = 8 + random() * 14;
            const ctrlX = baseX + bend;
            const ctrlY = baseY - length * (0.8 + random() * 0.4);
            const tipX = baseX + bend * 0.35;
            const tipY = baseY - length;
            veins.push({ baseX, baseY, ctrlX, ctrlY, tipX, tipY, delay: 0.4 + i * 0.01 });
        }
        return veins;
    }, [densite, randomSeed]);

    // Bractéoles supplémentaires pour densifier visuellement la tête
    const microBracts = useMemo(() => {
        const random = createRandomGenerator(randomSeed + 911);
        const count = 12 + Math.round(densite * 0.6) + Math.round((1 - manucure / 10) * 4);
        const items = [];
        for (let i = 0; i < count; i++) {
            const angle = random() * Math.PI * 2;
            const radius = 20 + random() * 45;
            const x = 120 + Math.cos(angle) * radius * 0.75;
            const y = 125 + Math.sin(angle) * radius * 1.05;
            const size = 6 + random() * 4;
            const squash = 0.55 + random() * 0.25;
            const color = bracteeColors[i % bracteeColors.length];
            items.push({ x, y, rx: size, ry: size * squash, color, delay: 0.25 + i * 0.015 });
        }
        return items;
    }, [randomSeed, densite, manucure, bracteeColors]);

    return (
        <div className="relative">
            {/* Titre */}
            <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h4 className="text-lg font-semibold text-white">Aperçu colorimétrique</h4>
            </div>

            {/* Conteneur SVG avec glow effect */}
            <div className="relative flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-8 overflow-hidden">
                {/* Glow background */}
                <motion.div
                    className="absolute inset-0 opacity-20 blur-3xl"
                    animate={{
                        background: hasColors
                            ? `radial-gradient(circle, ${gradientStops[0]?.color}40, transparent 70%)`
                            : 'radial-gradient(circle, #22C55E40, transparent 70%)'
                    }}
                    transition={{ duration: 0.8 }}
                />

                {/* SVG Bud de cannabis avec bractées individuelles */}
                <motion.svg
                    width="260"
                    height="340"
                    viewBox="0 0 240 300"
                    className="relative z-10 drop-shadow-2xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: 1.02 + (densite / 10) * 0.1,
                        opacity: 1,
                        rotate: (0.5 - visualEffects.roundness) * 1.6,
                        y: (1.1 - visualEffects.spacing) * 6
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <defs>
                        {/* Filtre glow pour bractées */}
                        <filter id="bracteeGlow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Dégradé iridescent basé sur la sélection de couleurs */}
                        <radialGradient id="budIridescent" cx="50%" cy="42%" r="65%">
                            {(hasColors ? gradientStops : [{ offset: '0%', color: baseColor }, { offset: '100%', color: mixHexColors(baseColor, '#0B1015', 0.3) }]).map((stop, index) => (
                                <stop key={`stop-${index}`} offset={stop.offset} stopColor={stop.color} stopOpacity={0.85 - index * 0.08} />
                            ))}
                        </radialGradient>

                        <linearGradient id="veinStroke" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={mixHexColors(baseColor, '#F8FAFC', 0.45)} stopOpacity="0.85" />
                            <stop offset="100%" stopColor={mixHexColors(baseColor, '#0B1015', 0.35)} stopOpacity="0.6" />
                        </linearGradient>

                        <radialGradient id="leafDepth" cx="50%" cy="50%" r="60%">
                            <stop offset="0%" stopColor={mixHexColors(baseColor, '#D1FAE5', 0.1)} stopOpacity="0.85" />
                            <stop offset="100%" stopColor={mixHexColors(baseColor, '#0B1015', 0.45)} stopOpacity="0.35" />
                        </radialGradient>

                        {/* Ombres portées */}
                        <filter id="budShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                            <feOffset dx="0" dy="3" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <g
                        filter="url(#budShadow)"
                        transform={`scale(${visualEffects.budScaleX} ${visualEffects.budScaleY}) translate(${120 * (1 / visualEffects.budScaleX - 1)} ${150 * (1 / visualEffects.budScaleY - 1)}) scale(${1 / visualEffects.spacing})`}
                        transform-origin="120 150"
                    >
                        {/* Feuilles résineuses autour du cola */}
                        {sugarLeaves.length > 0 && (
                            <g opacity={0.78 * (1 - manucure / 10 * 0.85)}>
                                {sugarLeaves.map((leaf, i) => (
                                    <motion.path
                                        key={`sugar-leaf-${i}`}
                                        d={leaf.d}
                                        fill="url(#leafDepth)"
                                        stroke={leaf.stroke}
                                        strokeWidth="1"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 0.9 * (1 - manucure / 10 * 0.7) }}
                                        transition={{ duration: 0.5, delay: leaf.delay }}
                                        style={{ fillOpacity: 0.9 }}
                                    />
                                ))}
                            </g>
                        )}

                        {/* Fond de base (corps principal vert) */}
                        <motion.path
                            d={`M 120 45 
                               C ${108 * visualEffects.spacing} 50, ${100 * visualEffects.spacing} 60, ${95 * visualEffects.spacing} 75
                               C ${90 * visualEffects.spacing} 90, ${87 * visualEffects.spacing} 105, ${85 * visualEffects.spacing} 120
                               C ${83 * visualEffects.spacing} 140, ${82 * visualEffects.spacing} 160, ${82 * visualEffects.spacing} 180
                               C ${82 * visualEffects.spacing} 195, ${85 * visualEffects.spacing} 210, ${92 * visualEffects.spacing} 220
                               C ${98 * visualEffects.spacing} 228, ${108 * visualEffects.spacing} 235, 120 238
                               C ${132 / visualEffects.spacing} 235, ${142 / visualEffects.spacing} 228, ${148 / visualEffects.spacing} 220
                               C ${155 / visualEffects.spacing} 210, ${158 / visualEffects.spacing} 195, ${158 / visualEffects.spacing} 180
                               C ${158 / visualEffects.spacing} 160, ${157 / visualEffects.spacing} 140, ${155 / visualEffects.spacing} 120
                               C ${153 / visualEffects.spacing} 105, ${150 / visualEffects.spacing} 90, ${145 / visualEffects.spacing} 75
                               C ${140 / visualEffects.spacing} 60, ${132 / visualEffects.spacing} 50, 120 45 Z`}
                            fill={baseColor}
                            fillOpacity="0.6"
                            stroke="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                        />

                        {/* Micro-bractées supplémentaires pour densifier la tête */}
                        {microBracts.length > 0 && (
                            <g opacity="0.9">
                                {microBracts.map((b, i) => (
                                    <motion.ellipse
                                        key={`micro-bract-${i}`}
                                        cx={b.x}
                                        cy={b.y}
                                        rx={b.rx}
                                        ry={b.ry}
                                        fill={b.color}
                                        stroke={mixHexColors(b.color, '#0B1015', 0.5)}
                                        strokeWidth="0.7"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.35, delay: b.delay }}
                                    />
                                ))}
                            </g>
                        )}

                        {/* Bractées individuelles - Section supérieure (sommet) */}
                        {/* Bractée centrale sommet */}
                        <motion.path
                            d="M 120 40 Q 115 48 113 55 Q 116 60 120 58 Q 124 60 127 55 Q 125 48 120 40 Z"
                            fill={bracteeColors[0]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        />

                        {/* Bractées niveau 2 */}
                        <motion.path
                            d="M 108 58 Q 102 64 100 72 Q 104 78 110 76 Q 115 78 117 72 Q 115 64 108 58 Z"
                            fill={bracteeColors[1]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                        />
                        <motion.path
                            d="M 132 58 Q 138 64 140 72 Q 136 78 130 76 Q 125 78 123 72 Q 125 64 132 58 Z"
                            fill={bracteeColors[2]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                        />

                        {/* Bractées niveau 3 */}
                        <motion.path
                            d="M 95 78 Q 88 86 85 95 Q 90 102 98 100 Q 104 103 107 96 Q 103 86 95 78 Z"
                            fill={bracteeColors[3]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 120 75 Q 115 82 114 90 Q 118 96 123 95 Q 127 96 130 90 Q 128 82 120 75 Z"
                            fill={bracteeColors[4]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 145 78 Q 152 86 155 95 Q 150 102 142 100 Q 136 103 133 96 Q 137 86 145 78 Z"
                            fill={bracteeColors[5]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />

                        {/* Bractées niveau 4 (milieu-haut) */}
                        <motion.path
                            d="M 88 105 Q 80 114 76 125 Q 82 133 92 131 Q 99 134 103 127 Q 98 115 88 105 Z"
                            fill={bracteeColors[6]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        />
                        <motion.path
                            d="M 110 108 Q 105 116 103 126 Q 108 133 116 132 Q 122 134 126 127 Q 122 116 110 108 Z"
                            fill={bracteeColors[7]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        />
                        <motion.path
                            d="M 130 108 Q 135 116 137 126 Q 132 133 124 132 Q 118 134 114 127 Q 118 116 130 108 Z"
                            fill={bracteeColors[8]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        />
                        <motion.path
                            d="M 152 105 Q 160 114 164 125 Q 158 133 148 131 Q 141 134 137 127 Q 142 115 152 105 Z"
                            fill={bracteeColors[9]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        />

                        {/* Bractées niveau 5 (milieu) */}
                        <motion.path
                            d="M 83 140 Q 75 150 71 162 Q 78 171 89 169 Q 97 172 102 164 Q 96 150 83 140 Z"
                            fill={bracteeColors[10]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        />
                        <motion.path
                            d="M 105 143 Q 99 152 97 163 Q 103 171 113 170 Q 120 173 125 165 Q 120 152 105 143 Z"
                            fill={bracteeColors[11]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        />
                        <motion.path
                            d="M 127 143 Q 133 152 135 163 Q 129 171 119 170 Q 112 173 107 165 Q 112 152 127 143 Z"
                            fill={bracteeColors[12]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        />
                        <motion.path
                            d="M 157 140 Q 165 150 169 162 Q 162 171 151 169 Q 143 172 138 164 Q 144 150 157 140 Z"
                            fill={bracteeColors[13]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        />

                        {/* Bractées niveau 6 (milieu-bas) */}
                        <motion.path
                            d="M 80 178 Q 72 189 68 202 Q 76 212 88 210 Q 97 213 103 204 Q 96 189 80 178 Z"
                            fill={bracteeColors[14]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                        />
                        <motion.path
                            d="M 103 182 Q 97 192 95 204 Q 102 214 113 212 Q 122 215 128 206 Q 122 192 103 182 Z"
                            fill={bracteeColors[15]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                        />
                        <motion.path
                            d="M 130 182 Q 136 192 138 204 Q 131 214 120 212 Q 111 215 105 206 Q 111 192 130 182 Z"
                            fill={bracteeColors[16]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                        />
                        <motion.path
                            d="M 160 178 Q 168 189 172 202 Q 164 212 152 210 Q 143 213 137 204 Q 144 189 160 178 Z"
                            fill={bracteeColors[17]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                        />

                        {/* Bractées niveau 7 (base) */}
                        <motion.path
                            d="M 88 218 Q 82 227 80 236 Q 88 243 98 241 Q 106 243 111 235 Q 105 226 88 218 Z"
                            fill={bracteeColors[18]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        />
                        <motion.path
                            d="M 108 220 Q 103 229 102 238 Q 109 245 118 243 Q 125 245 130 237 Q 125 228 108 220 Z"
                            fill={bracteeColors[19]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        />
                        <motion.path
                            d="M 132 220 Q 137 229 138 238 Q 131 245 122 243 Q 115 245 110 237 Q 115 228 132 220 Z"
                            fill={bracteeColors[20]}
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        />
                        <motion.path
                            d="M 152 218 Q 158 227 160 236 Q 152 243 142 241 Q 134 243 129 235 Q 135 226 152 218 Z"
                            fill={bracteeColors[21]}
                            stroke={mixHexColors(baseColor, '#0B1015', 0.68)}
                            strokeWidth={visualEffects.strokeWidth}
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        />

                        {/* Tige à la base */}
                        <motion.path
                            d="M 116 238 Q 115 250 113 265 L 127 265 Q 125 250 124 238 Z"
                            fill={baseColor}
                            stroke={mixHexColors(baseColor, '#0B1015', 0.65)}
                            strokeWidth={1.2 + (10 - manucure) * 0.08}
                            opacity="0.9"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        />

                        {/* Calyxes groupés sur le cola */}
                        {calyxClusters.length > 0 && (
                            <g opacity="0.9">
                                {calyxClusters.map((calyx, i) => (
                                    <motion.ellipse
                                        key={`calyx-${i}`}
                                        cx={calyx.x}
                                        cy={calyx.y}
                                        rx={calyx.rx}
                                        ry={calyx.ry}
                                        fill={calyx.color}
                                        stroke={mixHexColors(calyx.color, '#0B1015', 0.4)}
                                        strokeWidth="0.6"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.45, delay: calyx.delay }}
                                    />
                                ))}
                            </g>
                        )}

                        {/* Veines fines pour plus de naturel */}
                        {bractVeins.length > 0 && (
                            <g opacity="0.4">
                                {bractVeins.map((vein, i) => (
                                    <motion.path
                                        key={`vein-${i}`}
                                        d={`M ${vein.baseX} ${vein.baseY} Q ${vein.ctrlX} ${vein.ctrlY} ${vein.tipX} ${vein.tipY}`}
                                        stroke="url(#veinStroke)"
                                        strokeWidth={0.8 + visualEffects.roundness * 0.4}
                                        strokeLinecap="round"
                                        fill="none"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: vein.delay }}
                                    />
                                ))}
                            </g>
                        )}

                        {/* Pistils orangés, plus dynamiques et liés au slider */}
                        {visualEffects.pistilCount > 0 && (
                            <motion.g
                                stroke={pistilColor}
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                fill="none"
                                opacity="0.9"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                {pistilCurves.map((curve, i) => {
                                    const controlX = curve.baseX + (curve.tipX - curve.baseX) * 0.35;
                                    const controlY = curve.baseY - visualEffects.pistilCurl * 0.5;
                                    return (
                                        <motion.path
                                            key={`pistil-${i}`}
                                            d={`M ${curve.baseX} ${curve.baseY} Q ${controlX} ${controlY} ${curve.tipX} ${curve.tipY}`}
                                            stroke={pistilColor}
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 0.7, delay: curve.delay }}
                                        />
                                    );
                                })}

                                {pistilCurves.map((curve, i) => {
                                    const controlX = curve.baseX + (curve.tipX - curve.baseX) * 0.32;
                                    const controlY = curve.baseY - visualEffects.pistilCurl * 0.65;
                                    return (
                                        <motion.path
                                            key={`pistil-highlight-${i}`}
                                            d={`M ${curve.baseX} ${curve.baseY} Q ${controlX} ${controlY} ${curve.tipX} ${curve.tipY}`}
                                            stroke={pistilHighlight}
                                            strokeWidth="1.1"
                                            strokeLinecap="round"
                                            opacity="0.75"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.75 }}
                                            transition={{ duration: 0.6, delay: curve.delay + 0.08 }}
                                        />
                                    );
                                })}
                            </motion.g>
                        )}

                        {/* Trichomes (poils blancs/transparents) - distribution naturelle sur les bractées */}
                        {trichomePoints.length > 0 && (
                            <g opacity="0.8">
                                {trichomePoints.map((point, i) => {
                                    const tiltRad = (point.tilt * Math.PI) / 180;
                                    return (
                                        <motion.line
                                            key={`trichome-${i}`}
                                            x1={point.x}
                                            y1={point.y}
                                            x2={point.x + Math.cos(tiltRad) * point.length}
                                            y2={point.y - point.length}
                                            stroke="rgba(255,255,255,0.72)"
                                            strokeWidth={visualEffects.trichomeSize}
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 0.45, delay: point.delay }}
                                        />
                                    );
                                })}
                            </g>
                        )}

                        {/* Taches de moisissure - placement naturel et irrégulier */}
                        {visualEffects.moldSpots > 0 && (
                            <g>
                                {[...Array(visualEffects.moldSpots)].map((_, i) => {
                                    const seed = i * 7.3;
                                    const angle = seed * 0.7;
                                    const distance = 15 + (Math.sin(seed) * 0.5 + 0.5) * 35;
                                    const x = 120 + Math.cos(angle) * distance;
                                    const y = 120 + Math.sin(angle) * distance * 1.3;
                                    const size = 2.8 + Math.abs(Math.cos(seed * 1.3)) * 3.2;
                                    const rotation = Math.sin(seed * 2) * 45;
                                    const dark = ['#1A120D', '#2D1B0E', '#0D0B0A'][i % 3];
                                    return (
                                        <g key={`mold-${i}`}>
                                            <motion.ellipse
                                                cx={x}
                                                cy={y}
                                                rx={size}
                                                ry={size * (0.75 + Math.cos(seed) * 0.2)}
                                                fill={dark}
                                                opacity="0.55"
                                                transform={`rotate(${rotation} ${x} ${y})`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 0.55 }}
                                                transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
                                            />
                                            <motion.ellipse
                                                cx={x + Math.cos(seed) * 0.8}
                                                cy={y + Math.sin(seed) * 0.8}
                                                rx={size * 0.42}
                                                ry={size * 0.32}
                                                fill="#E8E4D8"
                                                opacity="0.7"
                                                transform={`rotate(${rotation * 0.6} ${x} ${y})`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 0.7 }}
                                                transition={{ duration: 0.45, delay: 0.85 + i * 0.08 }}
                                            />
                                        </g>
                                    );
                                })}
                            </g>
                        )}

                        {/* Graines - uniquement dans les bractées */}
                        {visualEffects.seedCount > 0 && (
                            <g>
                                {[...Array(visualEffects.seedCount)].map((_, i) => {
                                    const calyxPos = calyxClusters[i % Math.max(1, calyxClusters.length)] || { x: 120, y: 150 };
                                    const jitterX = Math.sin(i * 2.3) * 4;
                                    const jitterY = Math.cos(i * 1.7) * 3;
                                    const x = calyxPos.x + jitterX;
                                    const y = calyxPos.y + jitterY;
                                    const rotation = Math.sin(i * 1.9) * 25;

                                    return (
                                        <g key={`seed-${i}`} transform={`rotate(${rotation} ${x} ${y})`}>
                                            <motion.ellipse
                                                cx={x}
                                                cy={y}
                                                rx="3.8"
                                                ry="5.8"
                                                fill="#B7A07D"
                                                stroke="#5C4933"
                                                strokeWidth="0.65"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                                            />
                                            <motion.path
                                                d={`M ${x - 2} ${y - 1.6} Q ${x - 0.5} ${y - 0.8} ${x - 1} ${y + 2}`}
                                                stroke="#6B5842"
                                                strokeWidth="0.35"
                                                fill="none"
                                                opacity="0.7"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                                            />
                                            <motion.circle
                                                cx={x - 0.6}
                                                cy={y - 0.8}
                                                r="0.45"
                                                fill="#3B2F25"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                                            />
                                            <motion.circle
                                                cx={x + 1.1}
                                                cy={y + 0.9}
                                                r="0.35"
                                                fill="#2A211C"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1.05 + i * 0.1 }}
                                            />
                                        </g>
                                    );
                                })}
                            </g>
                        )}

                        {/* Lavis colorimétrique pour lisser les bractées (lié au sélecteur de couleurs) */}
                        <motion.ellipse
                            cx="120"
                            cy="150"
                            rx="72"
                            ry="118"
                            fill="url(#budIridescent)"
                            fillOpacity="0.2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.2 + (hasColors ? 0.08 : 0), scale: 1 + visualEffects.roundness * 0.02 }}
                            transition={{ duration: 0.65, delay: 0.32 }}
                        />
                    </g>

                    {/* Particules scintillantes (effet trichomes brillants) - distribution naturelle */}
                    {sparklePoints.length > 0 && (
                        <g>
                            {sparklePoints.map((sparkle, i) => (
                                <motion.circle
                                    key={`sparkle-${i}`}
                                    cx={sparkle.x}
                                    cy={sparkle.y}
                                    r={0.9 + visualEffects.trichomeSize * 0.3}
                                    fill="white"
                                    opacity="0"
                                    animate={{
                                        opacity: [0, 0.95, 0],
                                        scale: [0, 1.4 + visualEffects.sparkleIntensity * 0.05, 0]
                                    }}
                                    transition={{
                                        duration: sparkle.duration,
                                        repeat: Infinity,
                                        delay: sparkle.delay,
                                        ease: 'easeInOut'
                                    }}
                                />
                            ))}
                        </g>
                    )}
                </motion.svg>
            </div>

            {/* Légende gradient */}
            {hasColors && selectedColors.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-4"
                >
                    <div className="text-xs text-gray-400 mb-3 font-medium">Dégradé appliqué :</div>
                    <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden border border-gray-600 shadow-inner">
                        {selectedColors.map((selected, index) => {
                            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
                            return (
                                <motion.div
                                    key={selected.colorId}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${selected.percentage}%` }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    style={{ backgroundColor: colorData?.hex }}
                                    className="h-full"
                                    title={`${colorData?.id} - ${selected.percentage}%`}
                                />
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default WeedPreview;
