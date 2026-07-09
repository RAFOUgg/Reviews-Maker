import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { useOrchardStore } from '../../../store/orchardStore';
import { useExportConfigSave } from '../../../hooks/useExportConfigSave';
import { useToast } from '../../shared/ToastContainer';
import ConfigPane from '../config/ConfigPane';
import PreviewPane from '../preview/PreviewPane';
import PagedPreviewPane from './PagedPreviewPane';
import CustomLayoutPane from '../config/CustomLayoutPane';
import ContentPanel from '../config/ContentPanel';
import ExportModal from '../../export/ExportModal';
import { useOrchardPagesStore } from '../../../store/orchardPagesStore';

/**
 * Normalise les données d'une review pour s'assurer que tous les champs
 * sont accessibles de manière cohérente dans les templates
 */
function normalizeReviewData(reviewData) {
    if (!reviewData) return null;

    let normalized = { ...reviewData };

    // Parse extraData si c'est une chaîne JSON
    let parsedExtra = {};
    try {
        if (reviewData?.extraData && typeof reviewData.extraData === 'string') {
            parsedExtra = JSON.parse(reviewData.extraData);
        } else if (reviewData?.extraData && typeof reviewData.extraData === 'object') {
            parsedExtra = reviewData.extraData;
        }

        if (parsedExtra && typeof parsedExtra === 'object') {
            // Copier les clés d'extraData vers le niveau supérieur
            Object.keys(parsedExtra).forEach(k => {
                if (normalized[k] === undefined) normalized[k] = parsedExtra[k];
            });
            normalized.extraData = parsedExtra;
        }
    } catch (err) {
        console.warn('Failed to normalize extraData for OrchardPanel', err);
    }

    // ============================================================================
    // CONSTRUIRE categoryRatings depuis les champs plats (extraData ou reviewData)
    // ============================================================================
    const dataSource = { ...parsedExtra, ...normalized };

    // Définition des champs par catégorie
    const categoryFieldsMap = {
        visual: ['densite', 'trichome', 'pistil', 'manucure', 'moisissure', 'graines', 'couleur', 'pureteVisuelle', 'viscosite', 'melting', 'residus'],
        smell: ['aromasIntensity', 'fideliteCultivars', 'complexiteAromas', 'intensiteAromatique'],
        texture: ['durete', 'densiteTexture', 'elasticite', 'collant', 'friabilite', 'granularite', 'homogeneite'],
        taste: ['intensiteFumee', 'agressivite', 'cendre', 'douceur', 'persistanceGout', 'tastesIntensity', 'goutIntensity'],
        effects: ['montee', 'intensiteEffet', 'dureeEffet', 'effectsIntensity', 'intensiteEffets']
    };

    // Parser categoryRatings si c'est une string JSON
    let existingCategoryRatings = normalized.categoryRatings;
    if (typeof existingCategoryRatings === 'string') {
        try {
            existingCategoryRatings = JSON.parse(existingCategoryRatings);
        } catch (e) {
            existingCategoryRatings = {};
        }
    }

    // TOUJOURS reconstruire categoryRatings avec les sous-champs depuis les champs plats
    // même si categoryRatings existe déjà (car il peut contenir seulement des moyennes)
    const reconstructed = {};
    let foundAnyField = false;

    for (const [category, fields] of Object.entries(categoryFieldsMap)) {
        const catValues = {};
        for (const field of fields) {
            const value = dataSource[field];
            if (value !== undefined && value !== null && value !== '') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue > 0) {
                    catValues[field] = numValue;
                    foundAnyField = true;
                }
            }
        }
        if (Object.keys(catValues).length > 0) {
            reconstructed[category] = catValues;
        }
    }

    if (foundAnyField) {
        normalized.categoryRatings = reconstructed;
    } else if (existingCategoryRatings && typeof existingCategoryRatings === 'object') {
        // Garder les categoryRatings existantes si on n'a pas trouvé de champs plats
        normalized.categoryRatings = existingCategoryRatings;
    }

    // Normaliser les notes - s'assurer que 'rating' existe toujours
    if (normalized.rating === undefined) {
        if (normalized.overallRating !== undefined) {
            normalized.rating = normalized.overallRating;
        } else if (normalized.note !== undefined) {
            normalized.rating = normalized.note;
        } else if (normalized.score !== undefined) {
            normalized.rating = normalized.score;
        } else if (normalized.categoryRatings?.overall !== undefined) {
            normalized.rating = normalized.categoryRatings.overall;
        }
    }

    // Normaliser le titre - s'assurer que 'title' et 'holderName' existent
    if (!normalized.title) {
        normalized.title = normalized.holderName || normalized.productName || normalized.name || 'Sans titre';
    }
    if (!normalized.holderName) {
        normalized.holderName = normalized.title || normalized.productName || normalized.name || 'Sans nom';
    }

    // Fallback categoryRatings depuis ratings
    if (!normalized.categoryRatings || Object.keys(normalized.categoryRatings).length === 0) {
        if (normalized.ratings && typeof normalized.ratings === 'object') {
            normalized.categoryRatings = normalized.ratings;
        }
    }

    // Parser les champs qui peuvent être en JSON string — 'images' DOIT être ici (et non dans
    // le simple split(',') ci-dessous) car c'est un vrai JSON.stringify côté backend ; sinon la
    // dérivation de mainImageUrl juste après lit un tableau qui n'a pas encore été parsé
    const jsonFields = ['aromas', 'tastes', 'effects', 'terpenes', 'cultivarsList', 'pipelineExtraction',
        'pipelineSeparation', 'pipelinePurification', 'fertilizationPipeline', 'substratMix',
        'categoryRatings', 'tags', 'images'];

    jsonFields.forEach(field => {
        if (typeof normalized[field] === 'string') {
            try {
                const parsed = JSON.parse(normalized[field]);
                normalized[field] = parsed;
            } catch {
                // Si c'est une liste séparée par des virgules
                if (normalized[field].includes(',')) {
                    normalized[field] = normalized[field].split(',').map(s => s.trim()).filter(Boolean);
                } else if (normalized[field].length > 0) {
                    // C'est une string simple, la convertir en array d'un élément
                    normalized[field] = [normalized[field].trim()];
                }
            }
        }
    });

    // S'assurer que les tableaux sont bien des tableaux
    ['aromas', 'tastes', 'effects', 'terpenes', 'cultivarsList', 'tags', 'images'].forEach(field => {
        if (normalized[field] && !Array.isArray(normalized[field])) {
            if (typeof normalized[field] === 'string') {
                normalized[field] = normalized[field].split(',').map(s => s.trim()).filter(Boolean);
            } else if (typeof normalized[field] === 'object') {
                normalized[field] = Object.values(normalized[field]);
            }
        }
        // Si toujours pas un array, initialiser vide
        if (!normalized[field]) {
            normalized[field] = [];
        }
    });

    // Normaliser l'image principale — après le parsing JSON ci-dessus, sinon 'images' est
    // encore une string JSON et Array.isArray() est toujours faux
    const resolveImagePath = (url) => {
        if (!url || typeof url !== 'string') return null;
        return url.startsWith('http') || url.startsWith('blob:') || url.startsWith('/') ? url : `/images/${url}`;
    };
    if (!normalized.mainImageUrl) {
        if (normalized.imageUrl) {
            normalized.mainImageUrl = resolveImagePath(normalized.imageUrl);
        } else if (Array.isArray(normalized.images) && normalized.images.length > 0) {
            const firstImg = normalized.images[0];
            const raw = typeof firstImg === 'string' ? firstImg : firstImg?.url || firstImg?.src;
            normalized.mainImageUrl = resolveImagePath(raw);
        }
    } else {
        normalized.mainImageUrl = resolveImagePath(normalized.mainImageUrl);
    }
    // Aussi dans l'autre sens
    if (!normalized.imageUrl && normalized.mainImageUrl) {
        normalized.imageUrl = normalized.mainImageUrl;
    }

    // ============================================================================
    // NORMALISER LES CHAMPS SPÉCIAUX
    // ============================================================================

    // Si effects est vide mais extraData.effects existe (string), parser
    if ((!normalized.effects || normalized.effects.length === 0) && parsedExtra.effects) {
        if (typeof parsedExtra.effects === 'string') {
            normalized.effects = parsedExtra.effects.split(',').map(s => s.trim()).filter(Boolean);
        }
    }

    // Normaliser l'auteur
    if (!normalized.author && normalized.ownerName) {
        normalized.author = normalized.ownerName;
    } else if (typeof normalized.author === 'object') {
        // Préserver la confiance producteur (Chantier 5) avant d'aplatir l'auteur en simple
        // chaîne — sinon `author.producerProfile` est perdu avant d'atteindre exportDataAdapter.js
        if (normalized.author.producerProfile) {
            normalized.producerVerified = normalized.author.producerProfile.isVerified;
            normalized.producerBusinessType = normalized.author.producerProfile.businessType;
        }
        normalized.author = normalized.author.username || normalized.author.name || 'Anonyme';
    }

    return normalized;
}

export default function OrchardPanel({ reviewData, onClose, onPresetApplied, onPublish }) {
    const toast = useToast();
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isCustomMode, setIsCustomMode] = useState(false); // Nouveau: mode template vs custom
    const [customLayout, setCustomLayout] = useState([]); // Layout custom pour drag & drop
    const [activeDragId, setActiveDragId] = useState(null); // ID du champ en cours de drag
    const [isCanvasOver, setIsCanvasOver] = useState(false); // Canvas est survolé
    const canvasRef = useRef(null);
    const setReviewData = useOrchardStore((state) => state.setReviewData);
    const isPreviewFullscreen = useOrchardStore((state) => state.isPreviewFullscreen);
    const togglePreviewFullscreen = useOrchardStore((state) => state.togglePreviewFullscreen);
    const config = useOrchardStore((state) => state.config);
    const activePreset = useOrchardStore((state) => state.activePreset);

    // Pages store
    const pagesEnabled = useOrchardPagesStore((state) => state.pagesEnabled);
    const loadDefaultPages = useOrchardPagesStore((state) => state.loadDefaultPages);

    // Configurer les sensors pour @dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px de mouvement avant activation du drag
            },
        })
    );

    useEffect(() => {
        if (reviewData) {
            // Utiliser la fonction de normalisation centralisée
            const normalized = normalizeReviewData(reviewData);

            if (normalized) {
                setReviewData(normalized);
            }

            // Charger le layout personnalisé s'il existe depuis la review
            if (reviewData.orchardCustomLayout) {
                try {
                    const parsed = typeof reviewData.orchardCustomLayout === 'string'
                        ? JSON.parse(reviewData.orchardCustomLayout)
                        : reviewData.orchardCustomLayout;
                    setCustomLayout(Array.isArray(parsed) ? parsed : []);
                } catch (err) {
                    console.warn('Failed to parse orchardCustomLayout', err);
                }
            }

            // Si la review a été sauvegardée en mode custom, activer le mode custom
            if (reviewData.orchardLayoutMode === 'custom') {
                setIsCustomMode(true);
            }

            // Charger les pages par défaut
            if (reviewData.type && config.ratio) {
                loadDefaultPages(reviewData.type, config.ratio);
            }
        }
    }, [reviewData, setReviewData, loadDefaultPages, config.ratio]);

    // Note: la pagination ne s'active plus automatiquement - l'utilisateur choisit via le toggle

    const handleExport = () => {
        setShowExportModal(true);
    };

    const handleApplyPreset = () => {
        // Sauvegarder la configuration Orchard dans le formData
        if (onPresetApplied) {
            onPresetApplied({
                orchardConfig: config,
                // activePreset ne reste renseigné que pour les presets sauvegardés (rare) —
                // config.template est ce qui change réellement quand on choisit un template
                // (Moderne Compact, Fiche Détaillée, etc.), donc c'est lui qui doit être
                // persisté comme "orchardPreset" sinon le badge "Aperçu requis" de la
                // bibliothèque ne disparaît jamais après un Appliquer
                orchardPreset: activePreset || config.template,
                customLayout: isCustomMode ? customLayout : null, // Sauvegarder le layout custom
                layoutMode: isCustomMode ? 'custom' : 'template'
            });
        }
        toast.success('✅ Aperçu appliqué — pense à sauvegarder la review pour le conserver');
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

    // ============================================================================
    // GESTION DU DRAG & DROP AVEC @dnd-kit
    // ============================================================================

    const handleDragStart = useCallback((event) => {
        const { active } = event;
        setActiveDragId(active.id);
    }, []);

    const handleDragOver = useCallback((event) => {
        const { over } = event;
        // Vérifier si on survole le canvas
        setIsCanvasOver(over?.id === 'canvas-drop-zone');
    }, []);

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        console.log('🏁 DragEnd:', { activeId: active.id, overId: over?.id });
        setActiveDragId(null);
        setIsCanvasOver(false);

        // Si on a droppé sur le canvas
        if (over?.id === 'canvas-drop-zone' && active.data?.current?.field) {
            const field = active.data.current.field;

            // Calculer la position relative au canvas
            const canvasElement = document.querySelector('.orchard-canvas-resize-parent');
            if (canvasElement && event.activatorEvent) {
                const rect = canvasElement.getBoundingClientRect();
                const clientX = event.activatorEvent.clientX || 0;
                const clientY = event.activatorEvent.clientY || 0;

                // Position en pourcentage
                const x = Math.max(5, Math.min(75, ((clientX - rect.left) / rect.width) * 100));
                const y = Math.max(5, Math.min(75, ((clientY - rect.top) / rect.height) * 100));

                // Ajouter le champ au layout
                const alreadyPlaced = customLayout.find(pf => pf.id === field.id);
                if (alreadyPlaced) {
                    // Mettre à jour la position
                    setCustomLayout(prev => prev.map(pf =>
                        pf.id === field.id ? { ...pf, position: { x, y } } : pf
                    ));
                } else {
                    // Ajouter le nouveau champ
                    setCustomLayout(prev => [...prev, {
                        ...field,
                        position: { x, y },
                        width: 25,
                        height: 20,
                        rotation: 0
                    }]);
                }
            }
        }

        // Si on a droppé sur une zone
        if (over?.data?.current?.type === 'zone' && active.data?.current?.field) {
            const zoneId = over.data.current.zoneId;
            const fieldToAssign = active.data.current.field;

            setCustomLayout(prev => prev.map(pf => {
                if (pf.id === zoneId) {
                    const assignedFields = Array.from(new Set([...(pf.assignedFields || []), fieldToAssign.id]));
                    return { ...pf, assignedFields };
                }
                // Si le champ était placé directement, le retirer
                if (pf.id === fieldToAssign.id) {
                    return null;
                }
                return pf;
            }).filter(Boolean));
        }
    }, [customLayout]);

    // Données normalisées pour les composants enfants
    const normalizedData = normalizeReviewData(reviewData);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10001] bg-black/50 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed z-[10002] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-gray-200 dark:border-gray-700"
                style={
                    showPreview
                        ? { inset: 0, margin: 'auto', width: 'min(1180px, 96vw)', height: 'min(860px, calc(100svh - 3rem))' }
                        : { inset: 0, margin: 'auto', width: 'min(600px, 95vw)', height: 'fit-content', maxHeight: 'calc(100svh - 3rem)' }
                }
            >
                {/* Header - STICKY POUR TOUJOURS VISIBLE */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 flex-shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white drop-shadow-sm">
                                Export Maker
                            </h2>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                Système de rendu et d'exportation
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Bouton Publier */}
                        {onPublish && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onPublish({ orchardPreset: activePreset || config.template, orchardConfig: config })}
                                className="px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                                title="Publier la review"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                                </svg>
                                <span>Publier</span>
                            </motion.button>
                        )}

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
                                <div className="w-80 flex-shrink-0 overflow-hidden">
                                    <ContentPanel
                                        reviewData={normalizedData}
                                        placedFields={customLayout}
                                        onFieldSelect={(item) => {
                                            if (item?.type === 'zone') {
                                                handleAddZone();
                                            }
                                        }}
                                    />
                                </div>

                                {/* Custom Layout Canvas - Right */}
                                <div ref={canvasRef} className="flex-1 overflow-hidden">
                                    <CustomLayoutPane
                                        reviewData={normalizedData}
                                        layout={customLayout}
                                        onLayoutChange={handleLayoutChange}
                                        isCanvasOver={isCanvasOver}
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
                                {pagesEnabled ? <PagedPreviewPane /> : <PreviewPane />}
                            </motion.div>
                        ) : (
                            // MODE TEMPLATE SPLIT
                            <motion.div
                                key="split"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col md:flex-row h-full"
                            >
                                {/* Configuration Pane - Left */}
                                <div className="w-full md:w-96 xl:w-[28rem] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 overflow-y-auto flex-shrink-0 max-h-[40vh] md:max-h-none">
                                    <ConfigPane />
                                </div>

                                {/* Preview Pane - Right */}
                                <div className="flex-1 overflow-hidden min-w-0 min-h-[300px]">
                                    {pagesEnabled ? <PagedPreviewPane /> : <PreviewPane />}
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

            {/* Drag Overlay - Affiche l'élément en cours de drag */}
            <DragOverlay>
                {activeDragId ? (
                    <div className="text-white px-3 py-2 rounded-lg shadow-2xl text-sm font-medium opacity-90">
                        📦 {activeDragId}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

OrchardPanel.propTypes = {
    reviewData: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onPresetApplied: PropTypes.func, // Callback optionnel pour sauvegarder le preset dans le parent
    onPublish: PropTypes.func // Callback optionnel pour publier la review depuis l'aperçu
};



