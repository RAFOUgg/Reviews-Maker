import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Plus, X, Pipette } from 'lucide-react';

// 10 couleurs cannabis naturelles (base verte/jaune obligatoire)
const CANNABIS_COLORS = [
    { id: 'green-lime', name: 'Vert lime', hex: '#84CC16', angle: 0, isBase: true },
    { id: 'green', name: 'Vert', hex: '#22C55E', angle: 36, isBase: true },
    { id: 'green-forest', name: 'Vert forêt', hex: '#166534', angle: 72, isBase: true },
    { id: 'green-dark', name: 'Vert foncé', hex: '#14532D', angle: 108 },
    { id: 'blue-green', name: 'Bleu-vert', hex: '#0D9488', angle: 144 },
    { id: 'purple', name: 'Violet', hex: '#7C3AED', angle: 180 },
    { id: 'purple-dark', name: 'Violet foncé', hex: '#4C1D95', angle: 216 },
    { id: 'orange', name: 'Orange', hex: '#EA580C', angle: 252 },
    { id: 'yellow', name: 'Jaune', hex: '#CA8A04', angle: 288, isBase: true },
    { id: 'brown', name: 'Brun', hex: '#78350F', angle: 324 }
];

const ColorWheelPicker = ({ value = [], onChange, maxSelections = 5 }) => {
    const [hoveredColor, setHoveredColor] = useState(null);
    const [warningMessage, setWarningMessage] = useState('');

    // value format: [{ colorId: 'green', percentage: 60 }, ...]
    const selectedColors = Array.isArray(value) ? value : [];

    const handleColorClick = (color) => {
        const exists = selectedColors.find(s => s.colorId === color.id);

        if (exists) {
            // Empêcher de retirer la couleur si c'est la seule couleur de base
            const isOnlyBase = color.isBase && selectedColors.filter(s => {
                const c = CANNABIS_COLORS.find(cc => cc.id === s.colorId);
                return c?.isBase;
            }).length === 1;

            if (isOnlyBase) {
                setWarningMessage('❌ Vous devez conserver au moins une couleur de base (verte ou jaune)');
                setTimeout(() => setWarningMessage(''), 3000);
                return; // Ne pas retirer la dernière couleur de base
            }

            // Retirer la couleur
            setWarningMessage('');
            onChange(selectedColors.filter(s => s.colorId !== color.id));
        } else {
            // Ajouter la couleur si sous limite
            if (selectedColors.length < maxSelections) {
                // Si c'est la première couleur, elle doit être une couleur de base
                if (selectedColors.length === 0 && !color.isBase) {
                    setWarningMessage('⚠️ La première couleur doit être une couleur de base (verte ou jaune)');
                    setTimeout(() => setWarningMessage(''), 3000);
                    return; // Première sélection doit être verte/jaune
                }

                setWarningMessage('');
                const newPercentage = selectedColors.length === 0
                    ? 100
                    : Math.floor(100 / (selectedColors.length + 1));

                // Redistribuer les pourcentages
                const redistributed = selectedColors.map(s => ({
                    ...s,
                    percentage: newPercentage
                }));

                onChange([...redistributed, { colorId: color.id, percentage: newPercentage }]);
            }
        }
    };

    const handlePercentageChange = (colorId, newValue) => {
        const updated = selectedColors.map(s =>
            s.colorId === colorId
                ? { ...s, percentage: Math.max(0, Math.min(100, parseInt(newValue) || 0)) }
                : s
        );

        // Forcer le total à 100% exactement
        const total = updated.reduce((sum, s) => sum + s.percentage, 0);
        if (total !== 100) {
            const factor = 100 / total;
            const normalized = updated.map((s, index) => ({
                ...s,
                percentage: index === updated.length - 1
                    ? 100 - updated.slice(0, -1).reduce((sum, item) => sum + Math.round(item.percentage * factor), 0)
                    : Math.round(s.percentage * factor)
            }));
            onChange(normalized);
        } else {
            onChange(updated);
        }
    };

    const totalPercentage = selectedColors.reduce((sum, s) => sum + s.percentage, 0);

    return (
        <div className="space-y-6">
            {/* Message d'avertissement */}
            <AnimatePresence>
                {warningMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg text-sm font-medium"
                    >
                        {warningMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Roue de couleurs */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-xl">
                        {/* Cercle central noir */}
                        <circle cx="140" cy="140" r="55" fill="#1F2937" className="drop-shadow-lg" />

                        {/* 12 segments de couleur */}
                        {CANNABIS_COLORS.map((color, index) => {
                            const angle = (index * 30) - 90; // -90 pour commencer en haut
                            const nextAngle = angle + 30;
                            const isSelected = selectedColors.some(s => s.colorId === color.id);
                            const isHovered = hoveredColor?.id === color.id;

                            // Calcul des points du segment (arc)
                            const radius = 140;
                            const innerRadius = 60;

                            const startOuter = {
                                x: 140 + radius * Math.cos((angle * Math.PI) / 180),
                                y: 140 + radius * Math.sin((angle * Math.PI) / 180)
                            };
                            const endOuter = {
                                x: 140 + radius * Math.cos((nextAngle * Math.PI) / 180),
                                y: 140 + radius * Math.sin((nextAngle * Math.PI) / 180)
                            };
                            const startInner = {
                                x: 140 + innerRadius * Math.cos((nextAngle * Math.PI) / 180),
                                y: 140 + innerRadius * Math.sin((nextAngle * Math.PI) / 180)
                            };
                            const endInner = {
                                x: 140 + innerRadius * Math.cos((angle * Math.PI) / 180),
                                y: 140 + innerRadius * Math.sin((angle * Math.PI) / 180)
                            };

                            const pathData = `
                M ${startOuter.x} ${startOuter.y}
                A ${radius} ${radius} 0 0 1 ${endOuter.x} ${endOuter.y}
                L ${startInner.x} ${startInner.y}
                A ${innerRadius} ${innerRadius} 0 0 0 ${endInner.x} ${endInner.y}
                Z
              `;

                            return (
                                <g key={color.id}>
                                    <motion.path
                                        d={pathData}
                                        fill={color.hex}
                                        stroke="none"
                                        className="cursor-pointer transition-all outline-none"
                                        onMouseEnter={() => setHoveredColor(color)}
                                        onMouseLeave={() => setHoveredColor(null)}
                                        onClick={() => handleColorClick(color)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            opacity: isSelected ? 1 : isHovered ? 0.9 : 0.7,
                                            filter: isSelected
                                                ? 'drop-shadow(0 0 10px rgba(255,255,255,0.8)) brightness(1.1)'
                                                : 'none',
                                            outline: 'none'
                                        }}
                                    />
                                </g>
                            );
                        })}

                        {/* Icône centrale */}
                        <foreignObject x="115" y="115" width="50" height="50">
                            <div className="flex items-center justify-center w-full h-full">
                                <Palette className="w-8 h-8 text-gray-400" />
                            </div>
                        </foreignObject>
                    </svg>

                    {/* Tooltip hover */}
                    <AnimatePresence>
                        {hoveredColor && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white whitespace-nowrap shadow-xl z-10"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-white"
                                        style={{ backgroundColor: hoveredColor.hex }}
                                    />
                                    {hoveredColor.name}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions */}
                <p className="text-sm text-gray-400 mt-6 text-center">
                    <Pipette className="w-4 h-4 inline mr-2" />
                    Cliquez sur la roue pour sélectionner jusqu'à {maxSelections} couleurs
                </p>
            </div>

            {/* Liste des couleurs sélectionnées avec sliders */}
            {selectedColors.length > 0 && (
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Couleurs sélectionnées ({selectedColors.length}/{maxSelections})
                        </h4>
                        <div className={`text-xs font-medium ${totalPercentage === 100 ? 'text-green-400' : 'text-orange-400'}`}>
                            Total: {totalPercentage}%
                        </div>
                    </div>

                    <div className="space-y-3">
                        {selectedColors.map((selected) => {
                            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
                            if (!colorData) return null;

                            return (
                                <motion.div
                                    key={selected.colorId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3 border border-gray-700/50"
                                >
                                    {/* Pastille couleur */}
                                    <div
                                        className="w-8 h-8 rounded-lg border-2 border-gray-600 flex-shrink-0 shadow-lg"
                                        style={{ backgroundColor: colorData.hex }}
                                    />

                                    {/* Nom */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {colorData.name}
                                        </div>
                                    </div>

                                    {/* Slider pourcentage */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={selected.percentage}
                                            onChange={(e) => handlePercentageChange(selected.colorId, e.target.value)}
                                            className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:shadow-lg
                        [&::-moz-range-thumb]:cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, ${colorData.hex} 0%, ${colorData.hex} ${selected.percentage}%, #374151 ${selected.percentage}%, #374151 100%)`
                                            }}
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={selected.percentage}
                                            onChange={(e) => handlePercentageChange(selected.colorId, e.target.value)}
                                            className="w-14 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white text-center focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 outline-none"
                                        />
                                        <span className="text-xs text-gray-400">%</span>
                                    </div>

                                    {/* Bouton supprimer */}
                                    <button
                                        onClick={() => handleColorClick(colorData)}
                                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group flex-shrink-0"
                                    >
                                        <X className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Alerte si total != 100% */}
                    {totalPercentage !== 100 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2"
                        >
                            <span className="font-medium">⚠️</span>
                            {totalPercentage > 100
                                ? 'Total dépasse 100% - auto-normalisation appliquée'
                                : `Ajustez les pourcentages pour atteindre 100% (manque ${100 - totalPercentage}%)`
                            }
                        </motion.div>
                    )}
                </div>
            )}

            {/* Message si aucune sélection */}
            {selectedColors.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-8 bg-gray-800/20 rounded-xl border border-gray-700/50">
                    <Palette className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                    Aucune couleur sélectionnée
                </div>
            )}
        </div>
    );
};

export default ColorWheelPicker;
