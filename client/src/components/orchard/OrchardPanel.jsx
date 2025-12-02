import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { useOrchardStore } from '../../store/orchardStore';
import ConfigPane from './ConfigPane';
import PreviewPane from './PreviewPane';
import PagedPreviewPane from './PagedPreviewPane';
import CustomLayoutPane from './CustomLayoutPane';
import ContentPanel from './ContentPanel';
import PageManager from './PageManager';
import ExportModal from './ExportModal';
import { useOrchardPagesStore } from '../../store/orchardPagesStore';

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

    console.log('🔧 OrchardPanel normalizeReviewData - DataSource sample:', {
        densite: dataSource.densite,
        trichome: dataSource.trichome,
        aromasIntensity: dataSource.aromasIntensity,
        durete: dataSource.durete,
        montee: dataSource.montee,
        categoryRatingsType: typeof normalized.categoryRatings,
        categoryRatingsValue: normalized.categoryRatings
    });

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
        console.log('🔧 OrchardPanel: Reconstructed categoryRatings from flat fields:', reconstructed);
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

    // Normaliser l'image principale
    if (!normalized.mainImageUrl) {
        if (normalized.imageUrl) {
            normalized.mainImageUrl = normalized.imageUrl;
        } else if (Array.isArray(normalized.images) && normalized.images.length > 0) {
            const firstImg = normalized.images[0];
            normalized.mainImageUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url || firstImg?.src;
        }
    }
    // Aussi dans l'autre sens
    if (!normalized.imageUrl && normalized.mainImageUrl) {
        normalized.imageUrl = normalized.mainImageUrl;
    }

    // Fallback categoryRatings depuis ratings
    if (!normalized.categoryRatings || Object.keys(normalized.categoryRatings).length === 0) {
        if (normalized.ratings && typeof normalized.ratings === 'object') {
            normalized.categoryRatings = normalized.ratings;
        }
    }

    // Parser les champs qui peuvent être en JSON string
    const jsonFields = ['aromas', 'tastes', 'effects', 'terpenes', 'cultivarsList', 'pipelineExtraction',
        'pipelineSeparation', 'pipelinePurification', 'fertilizationPipeline', 'substratMix',
        'categoryRatings', 'tags'];

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
        normalized.author = normalized.author.username || normalized.author.name || 'Anonyme';
    }

    console.log('🎯 OrchardPanel: Normalized reviewData', {
        original: reviewData,
        normalized,
        hasRating: normalized.rating !== undefined,
        hasCategoryRatings: !!normalized.categoryRatings,
        categoryRatingsKeys: normalized.categoryRatings ? Object.keys(normalized.categoryRatings) : [],
        categoryRatingsPreview: normalized.categoryRatings ?
            Object.entries(normalized.categoryRatings).map(([k, v]) =>
                `${k}: ${typeof v === 'object' ? Object.keys(v).length + ' fields' : v}`
            ) : [],
        hasAromas: Array.isArray(normalized.aromas) && normalized.aromas.length > 0,
        aromasCount: Array.isArray(normalized.aromas) ? normalized.aromas.length : 0,
        hasEffects: Array.isArray(normalized.effects) && normalized.effects.length > 0,
        effectsCount: Array.isArray(normalized.effects) ? normalized.effects.length : 0,
        title: normalized.title,
        holderName: normalized.holderName,
        rating: normalized.rating,
        type: normalized.type,
        imageUrl: normalized.imageUrl,
        mainImageUrl: normalized.mainImageUrl,
        imagesCount: Array.isArray(normalized.images) ? normalized.images.length : 0,
    });

    return normalized;
}

export default function OrchardPanel({ reviewData, onClose, onPresetApplied }) {
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
    const togglePagesMode = useOrchardPagesStore((state) => state.togglePagesMode);

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

    // Effet séparé pour auto-activer le mode pages après chargement
    useEffect(() => {
        if (reviewData && config.ratio) {
            // Auto-activer le mode pages pour les formats carrés (1:1) et portrait (9:16) qui ont beaucoup de contenu
            if ((config.ratio === '1:1' || config.ratio === '9:16') && !pagesEnabled) {
                console.log('🔄 Auto-activation du mode pages pour format', config.ratio);
                // Petit délai pour s'assurer que les pages sont chargées
                const timer = setTimeout(() => {
                    togglePagesMode();
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [config.ratio, togglePagesMode, reviewData?.type]); // Dépendance sur type au lieu de reviewData complet

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

    // ============================================================================
    // GESTION DU DRAG & DROP AVEC @dnd-kit
    // ============================================================================

    const handleDragStart = useCallback((event) => {
        const { active } = event;
        console.log('🚀 DragStart:', active.id, active.data?.current?.field);
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

                console.log('📍 Drop position:', { x, y, field: field.id });

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
                {/* Header - STICKY POUR TOUJOURS VISIBLE */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 sticky top-0 z-10 flex-shrink-0">
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
                        {/* Bouton Toggle Mode Pages - TOUJOURS VISIBLE */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                console.log('📄 Toggle pages mode:', !pagesEnabled, 'Current ratio:', config.ratio);
                                togglePagesMode();
                            }}
                            className={`px-3 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all ${pagesEnabled
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-300 dark:ring-indigo-700'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            title={pagesEnabled ? 'Désactiver le mode pages' : 'Activer le mode pages'}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {pagesEnabled ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                )}
                            </svg>
                            <span>{pagesEnabled ? '📄 ON' : '📄 OFF'}</span>
                        </motion.button>

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
                    {console.log('🎯 OrchardPanel Render:', {
                        showPreview,
                        isCustomMode,
                        pagesEnabled,
                        ratio: config?.ratio,
                        reviewType: reviewData?.type
                    })}

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
                                className="flex h-full"
                            >
                                {/* Configuration Pane - Left - Responsive width */}
                                <div className={`border-r border-gray-200 dark:border-gray-800 overflow-y-auto flex-shrink-0 ${pagesEnabled ? 'w-72 xl:w-80' : 'w-96 xl:w-[28rem]'
                                    }`}>
                                    <ConfigPane />
                                </div>

                                {/* Page Manager - Middle (shown when pages enabled) */}
                                {pagesEnabled && (
                                    <div className="w-72 xl:w-80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex-shrink-0">
                                        <PageManager />
                                    </div>
                                )}

                                {/* Preview Pane - Right */}
                                <div className="flex-1 overflow-hidden min-w-0">
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
                    <div className="bg-purple-600 text-white px-3 py-2 rounded-lg shadow-2xl text-sm font-medium opacity-90">
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
    onPresetApplied: PropTypes.func // Callback optionnel pour sauvegarder le preset dans le parent
};
