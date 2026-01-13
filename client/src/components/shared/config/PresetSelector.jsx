import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookTemplate, GitCompare, X, Check, Info } from 'lucide-react';
import { VISUAL_PRESETS, PRESET_CATEGORIES, getPreset } from '../../../data/visualPresets';

/**
 * PresetSelector - Composant pour sélectionner des presets visuels
 * Permet aussi d'activer le mode comparaison
 */
const PresetSelector = ({ onApplyPreset, onCompare, currentValues }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('quality');
    const [hoveredPreset, setHoveredPreset] = useState(null);
    const [compareMode, setCompareMode] = useState(false);

    const handleApplyPreset = (presetName) => {
        const preset = getPreset(presetName);
        if (preset && onApplyPreset) {
            onApplyPreset(preset.params, preset.colors);
            setIsOpen(false);
        }
    };

    const handleCompareToggle = () => {
        const newMode = !compareMode;
        setCompareMode(newMode);
        if (onCompare) {
            onCompare(newMode);
        }
    };

    return (
        <div className="relative">
            {/* Boutons d'action */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-lg"
                >
                    <BookTemplate className="w-4 h-4" />
                    <span className="text-sm font-medium">Presets</span>
                </button>

                <button
                    onClick={handleCompareToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-lg ${compareMode
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                >
                    <GitCompare className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {compareMode ? 'Mode actif' : 'Comparer'}
                    </span>
                </button>
            </div>

            {/* Panel des presets */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-[600px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
                            <div className="flex items-center gap-2">
                                <BookTemplate className="w-5 h-5 text-violet-400" />
                                <h3 className="text-lg font-semibold text-white">Presets visuels</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Catégories */}
                        <div className="flex border-b border-gray-700 bg-gray-900/50">
                            {Object.entries(PRESET_CATEGORIES).map(([key, category]) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${selectedCategory === key
                                            ? 'text-violet-400'
                                            : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    <span className="mr-2">{category.icon}</span>
                                    {category.name}
                                    {selectedCategory === key && (
                                        <motion.div
                                            layoutId="activeCategory"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Liste des presets */}
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                {PRESET_CATEGORIES[selectedCategory].presets.map((presetName) => {
                                    const preset = VISUAL_PRESETS[presetName];
                                    const isHovered = hoveredPreset === presetName;

                                    return (
                                        <motion.button
                                            key={presetName}
                                            onClick={() => handleApplyPreset(presetName)}
                                            onMouseEnter={() => setHoveredPreset(presetName)}
                                            onMouseLeave={() => setHoveredPreset(null)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative p-4 bg-gray-900/50 border border-gray-700 hover:border-violet-500 rounded-xl text-left transition-all group"
                                        >
                                            {/* Icône et nom */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{preset.icon}</span>
                                                    <h4 className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">
                                                        {presetName}
                                                    </h4>
                                                </div>
                                                <Check className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-gray-400 mb-3">
                                                {preset.description}
                                            </p>

                                            {/* Stats preview */}
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                    <span className="text-gray-400">D: {preset.params.densite}/10</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    <span className="text-gray-400">T: {preset.params.trichomes}/10</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                    <span className="text-gray-400">P: {preset.params.pistils}/10</span>
                                                </div>
                                            </div>

                                            {/* Couleurs preview */}
                                            {isHovered && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-3 pt-3 border-t border-gray-700"
                                                >
                                                    <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden">
                                                        {preset.colors.map((color, i) => (
                                                            <div
                                                                key={i}
                                                                style={{
                                                                    width: `${color.percentage}%`,
                                                                    backgroundColor: getColorHex(color.colorId)
                                                                }}
                                                                className="h-full"
                                                            />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer info */}
                        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                            <div className="flex items-start gap-2 text-xs text-gray-400">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>
                                    Les presets appliquent automatiquement tous les paramètres visuels (densité, trichomes, pistils, couleurs, etc.)
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper pour obtenir le hex d'une couleur
const getColorHex = (colorId) => {
    const CANNABIS_COLORS = {
        'green-lime': '#84CC16',
        'green': '#22C55E',
        'green-forest': '#166534',
        'green-dark': '#14532D',
        'blue-green': '#0D9488',
        'purple': '#7C3AED',
        'purple-dark': '#4C1D95',
        'orange': '#EA580C',
        'yellow': '#CA8A04',
        'brown': '#78350F'
    };
    return CANNABIS_COLORS[colorId] || '#22C55E';
};

export default PresetSelector;



