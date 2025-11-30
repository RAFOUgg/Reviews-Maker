import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useOrchardStore } from '../../store/orchardStore';
import ConfigPane from './ConfigPane';
import PreviewPane from './PreviewPane';
import CustomLayoutPane from './CustomLayoutPane';
import ContentPanel from './ContentPanel';
import ExportModal from './ExportModal';

export default function OrchardPanel({ reviewData, onClose, onPresetApplied }) {
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isCustomMode, setIsCustomMode] = useState(false); // Nouveau: mode template vs custom
    const [customLayout, setCustomLayout] = useState([]); // Layout custom pour drag & drop
    const setReviewData = useOrchardStore((state) => state.setReviewData);
    const isPreviewFullscreen = useOrchardStore((state) => state.isPreviewFullscreen);
    const togglePreviewFullscreen = useOrchardStore((state) => state.togglePreviewFullscreen);
    const config = useOrchardStore((state) => state.config);
    const activePreset = useOrchardStore((state) => state.activePreset);

    useEffect(() => {
        if (reviewData) {
            // Flatten extraData (JSON string or object) into top-level for templates
            let normalized = { ...reviewData };
            try {
                const parsedExtra = reviewData?.extraData && typeof reviewData.extraData === 'string'
                    ? JSON.parse(reviewData.extraData)
                    : (reviewData?.extraData || {});
                if (parsedExtra && typeof parsedExtra === 'object') {
                    // Only copy keys that don't overwrite existing top-level fields unless necessary
                    Object.keys(parsedExtra).forEach(k => {
                        if (normalized[k] === undefined) normalized[k] = parsedExtra[k];
                    });
                    normalized.extraData = parsedExtra;
                }
            } catch (err) {
                console.warn('Failed to normalize extraData for OrchardPanel', err);
            }

            setReviewData(normalized);
            // Charger le layout personnalisé s'il existe depuis la review
            if (reviewData.orchardCustomLayout) {
                try {
                    const parsed = typeof reviewData.orchardCustomLayout === 'string' ? JSON.parse(reviewData.orchardCustomLayout) : reviewData.orchardCustomLayout
                    setCustomLayout(Array.isArray(parsed) ? parsed : [])
                } catch (err) {
                    console.warn('Failed to parse orchardCustomLayout', err)
                }
            }
        }
    }, [reviewData, setReviewData]);

    const handleExport = () => {
        setShowExportModal(true);
    };

    const handleApplyPreset = () => {
        // Sauvegarder la configuration Orchard dans le formData
        if (onPresetApplied) {
            onPresetApplied({
                orchardConfig: config,
                orchardPreset: activePreset,
                customLayout: isCustomMode ? customLayout : null, // Sauvegarder le layout custom
                layoutMode: isCustomMode ? 'custom' : 'template'
            });
        }
        onClose();
    };

    const handleLayoutChange = (newLayout) => {
        setCustomLayout(newLayout);
    };

    const handleAddZone = () => {
        const id = `zone-${Date.now()}`;
        const zone = {
            id,
            type: 'zone',
            label: 'Zone',
            position: { x: 10, y: 10 },
            width: 40,
            height: 25,
            rotation: 0,
            assignedFields: []
        };
        setCustomLayout(prev => [...prev, zone]);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                style={
                    showPreview
                        ? { left: '5%', right: '5%', top: '5%', bottom: '5%' }
                        : { left: '50%', top: '50%', width: '600px', maxHeight: '85vh', marginLeft: '-300px', marginTop: '-42.5vh' }
                }
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Orchard Studio
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Système de rendu et d'exportation
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Bouton Toggle Mode Template/Custom */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                console.log('🔄 Toggle mode:', !isCustomMode ? 'CUSTOM' : 'TEMPLATE');
                                setIsCustomMode(!isCustomMode);
                            }}
                            className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${isCustomMode
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            title={isCustomMode ? 'Mode Template' : 'Mode Personnalisé (Drag & Drop)'}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isCustomMode ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" />
                                )}
                            </svg>
                            <span>{isCustomMode ? '🎨 Custom' : '📋 Template'}</span>
                        </motion.button>

                        {/* Bouton Appliquer */}
                        {onPresetApplied && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleApplyPreset}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all flex items-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Appliquer
                            </motion.button>
                        )}

                        {/* Bouton Export */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExport}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exporter
                        </motion.button>

                        {/* Bouton Toggle Preview */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPreview(!showPreview)}
                            className={`p-2 rounded-lg transition-colors ${showPreview
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            title={showPreview ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {showPreview ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                )}
                            </svg>
                        </motion.button>

                        {/* Bouton Plein écran */}
                        {showPreview && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={togglePreviewFullscreen}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title={isPreviewFullscreen ? 'Mode divisé' : 'Plein écran'}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isPreviewFullscreen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                    )}
                                </svg>
                            </motion.button>
                        )}

                        {/* Bouton Fermer */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Fermer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {/* Debug Info */}
                    {console.log('🎯 OrchardPanel Render:', { showPreview, isCustomMode })}

                    <AnimatePresence mode="wait">
                        {!showPreview ? (
                            // CONFIG SEULEMENT (aperçu masqué)
                            <motion.div
                                key="config-only"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full overflow-y-auto"
                            >
                                <ConfigPane />
                            </motion.div>
                        ) : isCustomMode ? (
                            // MODE CUSTOM : ContentPanel + CustomLayoutPane
                            <motion.div
                                key="custom-mode"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex h-full"
                            >
                                {/* Content Panel - Left */}
                                <div className="w-96 border-r border-purple-500/30 overflow-y-auto bg-gray-900/50">
                                    <ContentPanel
                                        reviewData={reviewData}
                                        placedFields={customLayout}
                                        onFieldSelect={(item) => {
                                            if (item?.type === 'zone') {
                                                handleAddZone();
                                            }
                                        }}
                                    />
                                </div>

                                {/* Custom Layout Canvas - Right */}
                                <div className="flex-1 overflow-hidden">
                                    <CustomLayoutPane
                                        reviewData={reviewData}
                                        layout={customLayout}
                                        onLayoutChange={handleLayoutChange}
                                    />
                                </div>
                            </motion.div>
                        ) : isPreviewFullscreen ? (
                            // MODE TEMPLATE PLEIN ÉCRAN
                            <motion.div
                                key="fullscreen"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full"
                            >
                                <PreviewPane />
                            </motion.div>
                        ) : (
                            // MODE TEMPLATE SPLIT
                            <motion.div
                                key="split"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex h-full"
                            >
                                {/* Configuration Pane - Left */}
                                <div className="w-2/5 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                                    <ConfigPane />
                                </div>

                                {/* Preview Pane - Right */}
                                <div className="flex-1 overflow-hidden">
                                    <PreviewPane />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Export Modal */}
            <AnimatePresence>
                {showExportModal && (
                    <ExportModal onClose={() => setShowExportModal(false)} />
                )}
            </AnimatePresence>
        </DndProvider>
    );
}

OrchardPanel.propTypes = {
    reviewData: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onPresetApplied: PropTypes.func // Callback optionnel pour sauvegarder le preset dans le parent
};
