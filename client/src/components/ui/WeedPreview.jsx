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

const WeedPreview = ({
    selectedColors = [],
    densite = 5,
    trichomes = 5,
    manucure = 5,
    moisissure = 10,
    graines = 10
}) => {
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
        if (!hasColors || selectedColors.length === 0) {
            return Array(24).fill('#22C55E');
        }

        // Créer un tableau de 24 bractées
        const colors = [];
        selectedColors.forEach(selected => {
            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
            const count = Math.round((selected.percentage / 100) * 24);
            for (let i = 0; i < count; i++) {
                colors.push(colorData?.hex || '#22C55E');
            }
        });

        // S'assurer qu'on a exactement 24 couleurs
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

        // Fisher-Yates shuffle avec seed
        const shuffled = [...colors];
        for (let i = shuffled.length - 1; i > 0; i--) {
            seedNum = (seedNum * 9301 + 49297) % 233280;
            const j = Math.floor((seedNum / 233280) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }, [selectedColors, hasColors, baseColor]);

    // Calculs des effets visuels basés sur les jauges
    const visualEffects = useMemo(() => {
        // Densité: 0 = espacement max, 10 = compact
        const spacing = 1 + ((10 - densite) / 10) * 0.8; // 1.8x à 1x

        // Manucure: 0 = touffu/pointu, 10 = arrondi/compact
        const roundness = manucure / 10; // 0 à 1

        // Trichomes: nombre de trichomes à afficher
        const trichomeCount = Math.round((trichomes / 10) * 25); // 0 à 25

        // Moisissure: 0 = max taches, 10 = aucune
        const moldSpots = Math.round(((10 - moisissure) / 10) * 8); // 0 à 8

        // Graines: 0 = max graines, 10 = aucune
        const seedCount = Math.round(((10 - graines) / 10) * 5); // 0 à 5

        return { spacing, roundness, trichomeCount, moldSpots, seedCount };
    }, [densite, trichomes, manucure, moisissure, graines]);

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
                    animate={{ scale: 1, opacity: 1 }}
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
                            stroke="#0F1419"
                            strokeWidth="0.8"
                            filter="url(#bracteeGlow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        />

                        {/* Tige à la base */}
                        <motion.path
                            d="M 116 238 Q 115 250 113 265 L 127 265 Q 125 250 124 238 Z"
                            fill={baseColor}
                            stroke="#0F1419"
                            strokeWidth="1.5"
                            opacity="0.9"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        />

                        {/* Pistils orangés (petits fils qui dépassent) */}
                        <motion.g
                            stroke="#D97706"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            fill="none"
                            opacity="0.7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <path d="M 113 65 Q 108 68 102 72" />
                            <path d="M 127 65 Q 132 68 138 72" />
                            <path d="M 100 95 Q 94 99 88 105" />
                            <path d="M 140 95 Q 146 99 152 105" />
                            <path d="M 85 130 Q 78 135 72 142" />
                            <path d="M 155 130 Q 162 135 168 142" />
                            <path d="M 95 165 Q 88 170 82 178" />
                            <path d="M 145 165 Q 152 170 158 178" />
                            <path d="M 102 200 Q 95 206 88 214" />
                            <path d="M 138 200 Q 145 206 152 214" />
                        </motion.g>

                        {/* Trichomes (poils blancs/transparents) - distribution naturelle sur les bractées */}
                        {visualEffects.trichomeCount > 0 && (
                            <g opacity="0.7">
                                {[...Array(visualEffects.trichomeCount)].map((_, i) => {
                                    // Distribution sur toute la surface de la bud, plus dense sur les côtés
                                    const angle = (i / visualEffects.trichomeCount) * Math.PI * 2;
                                    const radius = 20 + Math.random() * 30;
                                    const x = 120 + Math.cos(angle) * radius;
                                    const y = 140 + Math.sin(angle) * radius * 1.2 - 30;
                                    const hairAngle = angle + (Math.random() - 0.5) * 30;
                                    const hairLength = 3 + Math.random() * 2;
                                    return (
                                        <motion.line
                                            key={`trichome-${i}`}
                                            x1={x}
                                            y1={y}
                                            x2={x + Math.cos(hairAngle) * hairLength}
                                            y2={y - hairLength}
                                            stroke="rgba(255,255,255,0.6)"
                                            strokeWidth="0.4"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: 0.7 + i * 0.01 }}
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
                    </g>

                    {/* Particules scintillantes (effet trichomes brillants) - distribution naturelle */}
                    {visualEffects.trichomeCount > 5 && (
                        <g>
                            {[...Array(Math.min(20, Math.floor(visualEffects.trichomeCount / 1.5)))].map((_, i) => {
                                // Distribution sur les bractées de manière naturelle
                                const angle = (i / 20) * Math.PI * 2 + Math.sin(i * 0.7) * 0.5;
                                const radius = 18 + Math.cos(i * 1.3) * 25;
                                const x = 120 + Math.cos(angle) * radius;
                                const y = 140 + Math.sin(angle) * radius * 1.1 - 25;

                                return (
                                    <motion.circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r="0.8"
                                        fill="white"
                                        opacity="0"
                                        animate={{
                                            opacity: [0, 0.9, 0],
                                            scale: [0, 1.4, 0]
                                        }}
                                        transition={{
                                            duration: 1.8 + Math.random() * 0.8,
                                            repeat: Infinity,
                                            delay: i * 0.12,
                                            ease: 'easeInOut'
                                        }}
                                    />
                                );
                            })}
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
