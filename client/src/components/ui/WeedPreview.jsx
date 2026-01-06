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
        // Densité: 0 = espacement max, 10 = compact
        const spacing = 1 + ((10 - densite) / 10) * 0.8; // 1.8x à 1x

        // Manucure: 0 = touffu/pointu, 10 = arrondi/compact
        const roundness = manucure / 10; // 0 à 1

        // Trichomes: nombre et épaisseur
        const trichomeCount = Math.round((trichomes / 10) * 35); // 0 à 35
        const trichomeSize = 0.35 + (trichomes / 10) * 0.5;

        // Moisissure: 0 = max taches, 10 = aucune
        const moldSpots = Math.round(((10 - moisissure) / 10) * 8); // 0 à 8

        // Graines: 0 = max graines, 10 = aucune
        const seedCount = Math.round(((10 - graines) / 10) * 5); // 0 à 5

        // Pistils: quantité et courbure
        const pistilCount = Math.max(4, Math.round((pistils / 10) * 18));
        const pistilCurl = 6 + pistils * 0.6;

        // Ligne externe: plus fine si manucure haute
        const strokeWidth = 0.7 + ((10 - manucure) / 10) * 0.5;

        // Étincelles supplémentaires pour un rendu plus "givré"
        const sparkleIntensity = Math.max(0, trichomes - 4);

        return {
            spacing,
            roundness,
            trichomeCount,
            trichomeSize,
            moldSpots,
            seedCount,
            pistilCount,
            pistilCurl,
            strokeWidth,
            sparkleIntensity
        };
    }, [densite, trichomes, manucure, moisissure, graines, pistils]);

    const pistilColor = useMemo(() => mixHexColors('#FBBF24', '#C2410C', pistils / 10), [pistils]);
    const pistilHighlight = useMemo(() => mixHexColors(pistilColor, '#FFE8C7', 0.35), [pistilColor]);

    const trichomePoints = useMemo(() => {
        const random = createRandomGenerator(randomSeed + 13);
        const points = [];
        for (let i = 0; i < visualEffects.trichomeCount; i++) {
            const angle = random() * Math.PI * 2;
            const radius = 18 + random() * 32 * (0.9 + visualEffects.roundness * 0.3);
            const wobble = (random() - 0.5) * 12;
            const x = 120 + Math.cos(angle) * radius;
            const y = 140 + Math.sin(angle) * radius * 1.12 - 28 + wobble * 0.2;
            const tilt = (random() - 0.5) * 35;
            const length = 3 + random() * (1.6 + trichomes * 0.18);
            points.push({ x, y, tilt, length, delay: 0.7 + i * 0.012 });
        }
        return points;
    }, [visualEffects.trichomeCount, visualEffects.roundness, trichomes, randomSeed]);

    const sparklePoints = useMemo(() => {
        const count = Math.min(24, Math.max(6, Math.floor(visualEffects.trichomeCount / 1.2)));
        const random = createRandomGenerator(randomSeed + 71);
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2 + random() * 0.6;
            const radius = 18 + Math.cos(i * 1.3) * 24 * (0.9 + visualEffects.roundness * 0.2);
            const x = 120 + Math.cos(angle) * radius;
            const y = 140 + Math.sin(angle) * radius * 1.05 - 24 + random() * 6;
            return { x, y, delay: i * 0.1 + 0.4, duration: 1.6 + random() * 0.9 };
        });
    }, [visualEffects.trichomeCount, visualEffects.roundness, randomSeed]);

    const pistilCurves = useMemo(() => {
        const rings = [60, 80, 105, 130, 155, 180];
        const random = createRandomGenerator(randomSeed + 211);
        const curves = [];
        for (let i = 0; i < visualEffects.pistilCount; i++) {
            const ring = rings[i % rings.length];
            const angle = (i / visualEffects.pistilCount) * Math.PI * 2 + random() * 0.8;
            const baseX = 120 + Math.cos(angle) * (ring / 4.2);
            const baseY = 95 + ring * 0.33 + random() * 10;
            const curl = visualEffects.pistilCurl * (0.6 + random() * 0.6);
            const tipX = baseX + curl * Math.cos(angle + 0.9 + random() * 0.5);
            const tipY = baseY - curl * 0.65;
            curves.push({ baseX, baseY, tipX, tipY, delay: 0.55 + i * 0.02 });
        }
        return curves;
    }, [visualEffects.pistilCount, visualEffects.pistilCurl, randomSeed]);

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
                    width="240"
                    height="300"
                    viewBox="0 0 240 300"
                    className="relative z-10 drop-shadow-2xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: 0.96 + (densite / 10) * 0.08,
                        opacity: 1,
                        rotate: (0.5 - visualEffects.roundness) * 2,
                        y: (1.2 - visualEffects.spacing) * 6
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

                    <g filter="url(#budShadow)" transform={`scale(${1 / visualEffects.spacing})`} transform-origin="120 150">
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
                                strokeWidth="1.4"
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
                                            strokeWidth="1.3"
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
                                            strokeWidth="0.9"
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
                                    // Distribution aléatoire mais cohérente
                                    const seed = i * 7.3;
                                    const angle = seed * 0.7;
                                    const distance = 15 + (Math.sin(seed) * 0.5 + 0.5) * 35;
                                    const x = 120 + Math.cos(angle) * distance;
                                    const y = 120 + Math.sin(angle) * distance * 1.3;
                                    const size = 2.5 + Math.abs(Math.cos(seed * 1.3)) * 3;
                                    // Couleurs de moisissure plus réalistes
                                    const colors = ['#2D1B0E', '#1C1410', '#E8E4D8', '#3A2417'];
                                    const color = colors[i % 4];
                                    const rotation = Math.sin(seed * 2) * 45;
                                    return (
                                        <motion.ellipse
                                            key={`mold-${i}`}
                                            cx={x}
                                            cy={y}
                                            rx={size}
                                            ry={size * (0.7 + Math.cos(seed) * 0.2)}
                                            fill={color}
                                            opacity="0.5"
                                            transform={`rotate(${rotation} ${x} ${y})`}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 0.5 }}
                                            transition={{ duration: 0.5, delay: 0.8 + i * 0.08 }}
                                        />
                                    );
                                })}
                            </g>
                        )}

                        {/* Graines - placement naturel entre les bractées */}
                        {visualEffects.seedCount > 0 && (
                            <g>
                                {[...Array(visualEffects.seedCount)].map((_, i) => {
                                    // Graines placées dans les zones creuses entre bractées
                                    const layerPositions = [
                                        { x: 105, y: 95 },
                                        { x: 135, y: 110 },
                                        { x: 115, y: 145 },
                                        { x: 125, y: 180 },
                                        { x: 110, y: 210 }
                                    ];
                                    const pos = layerPositions[i % layerPositions.length];
                                    const offsetX = (Math.sin(i * 3.1) * 8);
                                    const offsetY = (Math.cos(i * 2.7) * 6);
                                    const x = pos.x + offsetX;
                                    const y = pos.y + offsetY;
                                    const rotation = Math.sin(i * 1.9) * 25;

                                    return (
                                        <g key={`seed-${i}`} transform={`rotate(${rotation} ${x} ${y})`}>
                                            {/* Corps de la graine (forme d'amande allongée) */}
                                            <motion.ellipse
                                                cx={x}
                                                cy={y}
                                                rx="3.5"
                                                ry="5.5"
                                                fill="#7A6A52"
                                                stroke="#4A3A2A"
                                                strokeWidth="0.6"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                                            />
                                            {/* Stries naturelles sur la graine */}
                                            <motion.line
                                                x1={x - 2}
                                                y1={y - 2}
                                                x2={x - 1.5}
                                                y2={y + 2}
                                                stroke="#4A3A2A"
                                                strokeWidth="0.3"
                                                opacity="0.5"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                                            />
                                            {/* Petites taches noires irrégulières sur la graine */}
                                            <motion.circle
                                                cx={x - 0.8}
                                                cy={y - 1.2}
                                                r="0.4"
                                                fill="#1A1410"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                                            />
                                            <motion.circle
                                                cx={x + 1.2}
                                                cy={y + 0.5}
                                                r="0.3"
                                                fill="#1A1410"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1.05 + i * 0.1 }}
                                            />
                                            <motion.circle
                                                cx={x - 0.2}
                                                cy={y + 2}
                                                r="0.35"
                                                fill="#1A1410"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1.1 + i * 0.1 }}
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
