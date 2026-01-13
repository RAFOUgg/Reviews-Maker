import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOrchardStore } from '../store/orchardStore';
import { COLOR_PALETTES } from '../store/orchardConstants';

export default function ColorPaletteControls() {
    const config = useOrchardStore((state) => state.config);
    const updateColors = useOrchardStore((state) => state.updateColors);
    const applyColorPalette = useOrchardStore((state) => state.applyColorPalette);
    const palettes = COLOR_PALETTES;
    const [customMode, setCustomMode] = useState(false);

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Palette de Couleurs
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choisissez une palette harmonieuse ou personnalisez-la
                </p>
            </div>

            {/* Basculer entre palettes et personnalisation */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                    onClick={() => setCustomMode(false)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${!customMode ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400' }`}
                >
                    Palettes
                </button>
                <button
                    onClick={() => setCustomMode(true)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${customMode ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400' }`}
                >
                    Personnalisé
                </button>
            </div>

            {!customMode ? (
                /* Galerie de palettes prédéfinies */
                <div className="space-y-3">
                    {Object.entries(palettes).map(([key, palette]) => (
                        <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => applyColorPalette(key)}
                            className={`w-full p-4 rounded-xl transition-all border-2 text-left ${config.colors.palette === key ? ' shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:' }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {palette.name}
                                </span>
                                {config.colors.palette === key && (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>

                            {/* Aperçu des couleurs */}
                            <div className="flex gap-2 h-10 rounded-lg overflow-hidden">
                                <div
                                    className="flex-1"
                                    style={{
                                        background: palette.background.includes('gradient')
                                            ? palette.background
                                            : palette.background
                                    }}
                                />
                                <div className="w-10" style={{ backgroundColor: palette.accent }} />
                                <div className="w-10" style={{ backgroundColor: palette.textPrimary }} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            ) : (
                /* Personnalisation manuelle */
                <div className="space-y-4">
                    {/* Arrière-plan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Arrière-plan
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.colors.background.startsWith('#') ? config.colors.background : '#667eea'}
                                onChange={(e) => updateColors({ background: e.target.value })}
                                className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                value={config.colors.background}
                                onChange={(e) => updateColors({ background: e.target.value })}
                                placeholder="Couleur ou gradient CSS"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Texte principal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Texte principal
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.colors.textPrimary}
                                onChange={(e) => updateColors({ textPrimary: e.target.value })}
                                className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                value={config.colors.textPrimary}
                                onChange={(e) => updateColors({ textPrimary: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>

                    {/* Texte secondaire */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Texte secondaire
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.colors.textSecondary}
                                onChange={(e) => updateColors({ textSecondary: e.target.value })}
                                className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                value={config.colors.textSecondary}
                                onChange={(e) => updateColors({ textSecondary: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>

                    {/* Couleur d'accent */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Couleur d'accentuation
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.colors.accent}
                                onChange={(e) => updateColors({ accent: e.target.value })}
                                className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                value={config.colors.accent}
                                onChange={(e) => updateColors({ accent: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>

                    {/* Titre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Couleur du titre
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={config.colors.title}
                                onChange={(e) => updateColors({ title: e.target.value })}
                                className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                value={config.colors.title}
                                onChange={(e) => updateColors({ title: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}




