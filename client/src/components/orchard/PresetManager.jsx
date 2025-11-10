import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchardStore, useOrchardActions } from '../../store/orchardStore';

export default function PresetManager() {
    const { presets, activePreset, config } = useOrchardStore();
    const { savePreset, loadPreset, deletePreset, updatePreset } = useOrchardActions();

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [presetDescription, setPresetDescription] = useState('');
    const [editingPreset, setEditingPreset] = useState(null);

    const handleSave = () => {
        if (!presetName.trim()) return;

        if (editingPreset) {
            updatePreset(editingPreset, {
                name: presetName,
                description: presetDescription,
                config: { ...config }
            });
        } else {
            savePreset(presetName, presetDescription);
        }

        setShowSaveModal(false);
        setPresetName('');
        setPresetDescription('');
        setEditingPreset(null);
    };

    const handleEdit = (preset) => {
        setEditingPreset(preset.id);
        setPresetName(preset.name);
        setPresetDescription(preset.description || '');
        setShowSaveModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Préréglages
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sauvegardez et réutilisez vos configurations préférées
                </p>
            </div>

            {/* Bouton pour sauvegarder */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSaveModal(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Enregistrer la configuration actuelle
            </motion.button>

            {/* Liste des préréglages */}
            {presets.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucun préréglage sauvegardé
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {presets.map((preset) => (
                        <motion.div
                            key={preset.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className={`
                                p-4 rounded-xl border-2 transition-all
                                ${activePreset === preset.id
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        {preset.name}
                                        {activePreset === preset.id && (
                                            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                                                Actif
                                            </span>
                                        )}
                                    </h4>
                                    {preset.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {preset.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        {new Date(preset.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Aperçu mini des couleurs */}
                            <div className="flex gap-2 h-6 rounded-lg overflow-hidden mb-3">
                                <div
                                    className="flex-1"
                                    style={{
                                        background: preset.config.colors.background
                                    }}
                                />
                                <div className="w-6" style={{ backgroundColor: preset.config.colors.accent }} />
                                <div className="w-6" style={{ backgroundColor: preset.config.colors.textPrimary }} />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => loadPreset(preset.id)}
                                    className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                                >
                                    Charger
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleEdit(preset)}
                                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (window.confirm(`Supprimer le préréglage "${preset.name}" ?`)) {
                                            deletePreset(preset.id);
                                        }
                                    }}
                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal de sauvegarde */}
            <AnimatePresence>
                {showSaveModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowSaveModal(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                {editingPreset ? 'Modifier le préréglage' : 'Nouveau préréglage'}
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nom du préréglage *
                                    </label>
                                    <input
                                        type="text"
                                        value={presetName}
                                        onChange={(e) => setPresetName(e.target.value)}
                                        placeholder="Mon super style"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (optionnel)
                                    </label>
                                    <textarea
                                        value={presetDescription}
                                        onChange={(e) => setPresetDescription(e.target.value)}
                                        placeholder="Pour mes reviews de concentrés..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setShowSaveModal(false);
                                        setPresetName('');
                                        setPresetDescription('');
                                        setEditingPreset(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={!presetName.trim()}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editingPreset ? 'Mettre à jour' : 'Enregistrer'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
