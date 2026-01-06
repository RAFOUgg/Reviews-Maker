import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// 12 couleurs cannabis (synchronisé avec ColorWheelPicker)
const CANNABIS_COLORS = [
    { id: 'green-bright', hex: '#9EF01A' },
    { id: 'green', hex: '#38A169' },
    { id: 'green-dark', hex: '#22543D' },
    { id: 'blue-green', hex: '#319795' },
    { id: 'purple', hex: '#9F7AEA' },
    { id: 'purple-dark', hex: '#553C9A' },
    { id: 'pink', hex: '#ED64A6' },
    { id: 'red', hex: '#F56565' },
    { id: 'orange', hex: '#ED8936' },
    { id: 'yellow', hex: '#ECC94B' },
    { id: 'brown', hex: '#8B4513' },
    { id: 'gray', hex: '#718096' }
];

const WeedPreview = ({ selectedColors = [] }) => {
    // Générer le gradient SVG basé sur les couleurs sélectionnées
    const gradientStops = useMemo(() => {
        if (!selectedColors || selectedColors.length === 0) {
            return [{ offset: '0%', color: '#38A169' }]; // Vert par défaut
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
                            : 'radial-gradient(circle, #38A16940, transparent 70%)'
                    }}
                    transition={{ duration: 0.8 }}
                />

                {/* SVG Feuille de cannabis */}
                <motion.svg
                    width="240"
                    height="240"
                    viewBox="0 0 240 240"
                    className="relative z-10 drop-shadow-2xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <defs>
                        {/* Gradient dynamique */}
                        <linearGradient id="weedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            {gradientStops.map((stop, index) => (
                                <motion.stop
                                    key={index}
                                    offset={stop.offset}
                                    stopColor={stop.color}
                                    initial={{ stopColor: '#38A169' }}
                                    animate={{ stopColor: stop.color }}
                                    transition={{ duration: 0.5 }}
                                />
                            ))}
                        </linearGradient>

                        {/* Filtre glow */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Ombres portées */}
                        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                            <feOffset dx="0" dy="4" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Feuille de cannabis (7 folioles caractéristiques) */}
                    <g filter="url(#shadow)">
                        {/* Foliole centrale (la plus grande) */}
                        <motion.path
                            d="M 120 30 Q 115 50 115 80 Q 115 110 118 140 L 122 140 Q 125 110 125 80 Q 125 50 120 30 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                        />

                        {/* Folioles latérales gauche (3) */}
                        <motion.path
                            d="M 118 60 Q 100 65 85 75 Q 70 85 65 95 Q 70 100 85 95 Q 100 90 115 85 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.1 }}
                        />
                        <motion.path
                            d="M 116 90 Q 95 100 75 115 Q 55 130 48 142 Q 55 148 75 138 Q 95 128 112 118 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 115 120 Q 90 135 70 152 Q 50 169 45 182 Q 52 188 72 175 Q 92 162 110 145 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />

                        {/* Folioles latérales droite (3) - symétriques */}
                        <motion.path
                            d="M 122 60 Q 140 65 155 75 Q 170 85 175 95 Q 170 100 155 95 Q 140 90 125 85 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.1 }}
                        />
                        <motion.path
                            d="M 124 90 Q 145 100 165 115 Q 185 130 192 142 Q 185 148 165 138 Q 145 128 128 118 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 125 120 Q 150 135 170 152 Q 190 169 195 182 Q 188 188 168 175 Q 148 162 130 145 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />

                        {/* Tige centrale */}
                        <motion.path
                            d="M 118 140 Q 117 170 115 200 L 125 200 Q 123 170 122 140 Z"
                            fill="url(#weedGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            opacity="0.8"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        />

                        {/* Nervures (détails) */}
                        <motion.g
                            stroke="#1F2937"
                            strokeWidth="0.5"
                            fill="none"
                            opacity="0.4"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, delay: 0.6 }}
                        >
                            <path d="M 120 40 L 120 135" />
                            <path d="M 118 70 L 90 88" />
                            <path d="M 116 100 L 80 125" />
                            <path d="M 115 130 L 75 165" />
                            <path d="M 122 70 L 150 88" />
                            <path d="M 124 100 L 160 125" />
                            <path d="M 125 130 L 165 165" />
                        </motion.g>
                    </g>

                    {/* Particules scintillantes (si couleurs sélectionnées) */}
                    {hasColors && (
                        <g>
                            {[...Array(8)].map((_, i) => (
                                <motion.circle
                                    key={i}
                                    cx={60 + Math.random() * 120}
                                    cy={40 + Math.random() * 140}
                                    r="2"
                                    fill="white"
                                    opacity="0"
                                    animate={{
                                        opacity: [0, 0.8, 0],
                                        scale: [0, 1.5, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
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
