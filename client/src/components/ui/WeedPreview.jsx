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

                {/* Image de buds avec effets de couleur */}
                <motion.div
                    className="relative w-60 h-60"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    {/* Image de base */}
                    <motion.img
                        src="/data/buds.png"
                        alt="Cannabis buds preview"
                        className="w-full h-full object-contain drop-shadow-2xl"
                        style={{
                            filter: hasColors
                                ? `drop-shadow(0 0 20px ${gradientStops[0]?.color}80)`
                                : 'drop-shadow(0 0 20px #38A16980)'
                        }}
                    />

                    {/* Overlay colorimétrique */}
                    {hasColors && (
                        <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                                background: `linear-gradient(135deg, ${gradientStops.map(s => `${s.color}40`).join(', ')})`,
                                mixBlendMode: 'overlay',
                                pointerEvents: 'none'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ duration: 0.8 }}
                        />
                    )}

                    {/* Particules scintillantes */}
                    {hasColors && (
                        <div className="absolute inset-0">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white rounded-full"
                                    style={{
                                        left: `${20 + Math.random() * 60}%`,
                                        top: `${20 + Math.random() * 60}%`
                                    }}
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
                        </div>
                    )}
                </motion.div>
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
