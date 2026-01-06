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

const WeedPreview = ({ selectedColors = [] }) => {
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

    // Distribuer les couleurs aux bractées
    const bracteeColors = useMemo(() => {
        if (!hasColors || selectedColors.length === 0) {
            return Array(24).fill('#22C55E');
        }

        const colors = [];
        selectedColors.forEach(selected => {
            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
            const count = Math.round((selected.percentage / 100) * 24);
            for (let i = 0; i < count; i++) {
                colors.push(colorData?.hex || '#22C55E');
            }
        });

        // Mélanger aléatoirement pour distribution naturelle
        return colors.sort(() => Math.random() - 0.5).slice(0, 24);
    }, [selectedColors, hasColors]);

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

                    <g filter="url(#budShadow)">
                        {/* Fond de base (corps principal vert) */}
                        <motion.path
                            d="M 120 45 
                               C 108 50, 100 60, 95 75
                               C 90 90, 87 105, 85 120
                               C 83 140, 82 160, 82 180
                               C 82 195, 85 210, 92 220
                               C 98 228, 108 235, 120 238
                               C 132 235, 142 228, 148 220
                               C 155 210, 158 195, 158 180
                               C 158 160, 157 140, 155 120
                               C 153 105, 150 90, 145 75
                               C 140 60, 132 50, 120 45 Z"
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
                    </g>

                    {/* Particules scintillantes (trichomes) */}
                    {hasColors && (
                        <g>
                            {[...Array(15)].map((_, i) => (
                                <motion.circle
                                    key={i}
                                    cx={85 + Math.random() * 70}
                                    cy={50 + Math.random() * 190}
                                    r="1.2"
                                    fill="white"
                                    opacity="0"
                                    animate={{
                                        opacity: [0, 0.95, 0],
                                        scale: [0, 1.3, 0]
                                    }}
                                    transition={{
                                        duration: 2.2,
                                        repeat: Infinity,
                                        delay: i * 0.15,
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
