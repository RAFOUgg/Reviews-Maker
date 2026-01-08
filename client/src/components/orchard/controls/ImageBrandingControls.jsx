import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';

const IMAGE_FILTERS = [
    { id: 'none', name: 'Aucun', preview: '🎨' },
    { id: 'sepia', name: 'Sépia', preview: '🟤' },
    { id: 'grayscale', name: 'Noir & Blanc', preview: '⚫' },
    { id: 'blur', name: 'Flou', preview: '🌫️' }
];

const LOGO_POSITIONS = [
    { id: 'top-left', name: 'Haut Gauche', icon: '↖️' },
    { id: 'top-right', name: 'Haut Droite', icon: '↗️' },
    { id: 'bottom-left', name: 'Bas Gauche', icon: '↙️' },
    { id: 'bottom-right', name: 'Bas Droite', icon: '↘️' },
    { id: 'center', name: 'Centre', icon: '🎯' }
];

const LOGO_SIZES = [
    { id: 'small', name: 'Petit' },
    { id: 'medium', name: 'Moyen' },
    { id: 'large', name: 'Grand' }
];

export default function ImageBrandingControls() {
    const config = useOrchardStore((state) => state.config);
    const updateImage = useOrchardStore((state) => state.updateImage);
    const updateBranding = useOrchardStore((state) => state.updateBranding);
    const [logoInput, setLogoInput] = useState(config.branding.logoUrl || '');

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const logoUrl = event.target?.result;
                setLogoInput(logoUrl);
                updateBranding({ logoUrl, enabled: true });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Image & Branding
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Personnalisez l'image et ajoutez votre logo
                </p>
            </div>

            {/* Section Image */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Image principale
                </h4>

                {/* Coins arrondis */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Coins arrondis: {config.image.borderRadius}px
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="40"
                        value={config.image.borderRadius}
                        onChange={(e) => updateImage({ borderRadius: parseInt(e.target.value) })}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r dark: dark: shadow-inner"
                    />
                </div>

                {/* Opacité */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Opacité: {Math.round(config.image.opacity * 100)}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.image.opacity}
                        onChange={(e) => updateImage({ opacity: parseFloat(e.target.value) })}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r dark: dark: shadow-inner"
                    />
                </div>

                {/* Filtres */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filtre
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {IMAGE_FILTERS.map((filter) => (
                            <motion.button
                                key={filter.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => updateImage({ filter: filter.id })}
                                className={`p-3 rounded-lg text-sm font-medium transition-all ${config.image.filter === filter.id ? ' text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}
                            >
                                <span className="mr-2">{filter.preview}</span>
                                {filter.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Section Branding */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Logo / Filigrane
                    </h4>
                    <button
                        onClick={() => updateBranding({ enabled: !config.branding.enabled })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${config.branding.enabled ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${config.branding.enabled ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>

                {config.branding.enabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        {/* Upload du logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fichier du logo
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer text-center"
                                >
                                    📁 Choisir un fichier
                                </label>
                            </div>
                            {logoInput && (
                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <img
                                        src={logoInput}
                                        alt="Logo preview"
                                        className="w-16 h-16 object-contain mx-auto"
                                    />
                                </div>
                            )}
                        </div>

                        {/* URL alternative */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ou URL du logo
                            </label>
                            <input
                                type="text"
                                value={logoInput}
                                onChange={(e) => {
                                    setLogoInput(e.target.value);
                                    updateBranding({ logoUrl: e.target.value });
                                }}
                                placeholder="https://exemple.com/logo.png"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                        </div>

                        {/* Position */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Position
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {LOGO_POSITIONS.map((position) => (
                                    <motion.button
                                        key={position.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => updateBranding({ position: position.id })}
                                        className={`p-2 rounded-lg text-xs font-medium transition-all ${config.branding.position === position.id ? ' text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}
                                    >
                                        <div>{position.icon}</div>
                                        <div className="mt-1">{position.name}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Taille */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Taille
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {LOGO_SIZES.map((size) => (
                                    <motion.button
                                        key={size.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => updateBranding({ size: size.id })}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${config.branding.size === size.id ? ' text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}
                                    >
                                        {size.name}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Opacité du logo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Opacité: {Math.round(config.branding.opacity * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.branding.opacity}
                                onChange={(e) => updateBranding({ opacity: parseFloat(e.target.value) })}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r dark: dark: shadow-inner"
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
