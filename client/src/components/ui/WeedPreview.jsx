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

                {/* SVG Bud de cannabis */}
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
                        {/* Gradient dynamique */}
                        <linearGradient id="budGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                        <filter id="budGlow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Ombres portées */}
                        <filter id="budShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                            <feOffset dx="0" dy="5" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.4" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Forme de bud de cannabis (style pyramidale dentelée) */}
                    <g filter="url(#budShadow)">
                        {/* Corps principal de la bud */}
                        <motion.path
                            d="M 120 40 
                               C 110 45, 105 50, 100 60
                               C 95 70, 92 75, 88 85
                               L 85 95
                               C 82 105, 80 115, 78 125
                               C 76 140, 75 155, 75 170
                               L 75 190
                               C 75 200, 78 210, 85 218
                               C 90 223, 95 226, 100 228
                               L 110 235
                               C 115 238, 118 240, 120 242
                               C 122 240, 125 238, 130 235
                               L 140 228
                               C 145 226, 150 223, 155 218
                               C 162 210, 165 200, 165 190
                               L 165 170
                               C 165 155, 164 140, 162 125
                               C 160 115, 158 105, 155 95
                               L 152 85
                               C 148 75, 145 70, 140 60
                               C 135 50, 130 45, 120 40 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="2"
                            filter="url(#budGlow)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: 'easeInOut' }}
                        />

                        {/* Calices et dentelures (détails de la bud) */}
                        {/* Calices supérieurs */}
                        <motion.path
                            d="M 120 45 L 115 55 L 108 62 L 115 65 L 120 58 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 120 45 L 125 55 L 132 62 L 125 65 L 120 58 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.25 }}
                        />

                        {/* Calices milieu gauche */}
                        <motion.path
                            d="M 95 90 L 88 98 L 82 108 L 88 112 L 95 105 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        />
                        <motion.path
                            d="M 85 130 L 78 140 L 72 152 L 78 156 L 85 145 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.35 }}
                        />

                        {/* Calices milieu droit */}
                        <motion.path
                            d="M 145 90 L 152 98 L 158 108 L 152 112 L 145 105 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        />
                        <motion.path
                            d="M 155 130 L 162 140 L 168 152 L 162 156 L 155 145 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.35 }}
                        />

                        {/* Calices inférieurs */}
                        <motion.path
                            d="M 90 180 L 83 192 L 78 205 L 85 208 L 92 195 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        />
                        <motion.path
                            d="M 150 180 L 157 192 L 162 205 L 155 208 L 148 195 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="1.5"
                            filter="url(#budGlow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        />

                        {/* Tige à la base */}
                        <motion.path
                            d="M 118 240 Q 117 255 115 270 L 125 270 Q 123 255 122 240 Z"
                            fill="url(#budGradient)"
                            stroke="#1F2937"
                            strokeWidth="2"
                            opacity="0.9"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        />

                        {/* Pistils (petits traits orangés) */}
                        <motion.g
                            stroke="#D97706"
                            strokeWidth="1"
                            fill="none"
                            opacity="0.6"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 0.6 }}
                        >
                            <path d="M 110 80 L 100 85" />
                            <path d="M 130 80 L 140 85" />
                            <path d="M 95 120 L 85 128" />
                            <path d="M 145 120 L 155 128" />
                            <path d="M 105 160 L 95 168" />
                            <path d="M 135 160 L 145 168" />
                            <path d="M 110 200 L 100 208" />
                            <path d="M 130 200 L 140 208" />
                        </motion.g>
                    </g>

                    {/* Particules scintillantes (trichomes) */}
                    {hasColors && (
                        <g>
                            {[...Array(12)].map((_, i) => (
                                <motion.circle
                                    key={i}
                                    cx={80 + Math.random() * 80}
                                    cy={50 + Math.random() * 190}
                                    r="1.5"
                                    fill="white"
                                    opacity="0"
                                    animate={{
                                        opacity: [0, 0.9, 0],
                                        scale: [0, 1.5, 0]
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
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
