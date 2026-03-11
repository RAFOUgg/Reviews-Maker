import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { useOrchardStore } from '../../../store/orchardStore';
import { normalizeReviewDataByType } from '../../../utils/orchard/normalizeByType';
import ConfigPane from '../config/ConfigPane';
const InteractiveReviewCard = React.lazy(() => import('./InteractiveReviewCard'));
import CustomLayoutPane from '../config/CustomLayoutPane';
import ContentPanel from '../config/ContentPanel';
import ExportModal from '../../export/ExportModal';
import OrchardContextMenu from './OrchardContextMenu';
import { reviewsService } from '../../../services/apiService';

// Must match InteractiveReviewCard RATIO_DIMENSIONS
const RATIO_DIMS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 },
};

/** Renders InteractiveReviewCard at export dimensions, scaled to fit inside the preview area */
function RatioPreviewWrapper({ ratio, children }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(0.5);
    const dims = RATIO_DIMS[ratio] || RATIO_DIMS['1:1'];

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width && height) {
                const s = Math.min(width / dims.width, height / dims.height, 1);
                setScale(s * 0.95); // 95% to leave some margin
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [dims.width, dims.height]);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden relative">
            <div
                style={{
                    width: dims.width,
                    height: dims.height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                }}
            >
                {children}
            </div>
        </div>
    );
}

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

    // Merge nested 'visual' sub-object into dataSource for field lookups
    // VisualSection stores scores under formData.visual.* in-session (before API save)
    if (reviewData?.visual && typeof reviewData.visual === 'object') {
        const vd = reviewData.visual;
        if (vd.density !== undefined && dataSource.densite === undefined) dataSource.densite = vd.density;
        if (vd.trichomes !== undefined && dataSource.trichome === undefined) dataSource.trichome = vd.trichomes;
        if (vd.mold !== undefined && dataSource.moisissure === undefined) dataSource.moisissure = vd.mold;
        if (vd.seeds !== undefined && dataSource.graines === undefined) dataSource.graines = vd.seeds;
        if (vd.colorRating !== undefined && dataSource.couleur === undefined) dataSource.couleur = vd.colorRating;
        if (vd.transparency !== undefined && dataSource.pureteVisuelle === undefined) dataSource.pureteVisuelle = vd.transparency;
    }

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

    // Helper to resolve raw filenames to proper URLs
    const resolveImgUrl = (img) => {
        if (!img) return null;
        if (typeof img === 'object') return img.preview || img.url || img.src || null;
        const s = String(img);
        if (s.startsWith('http') || s.startsWith('/') || s.startsWith('blob:') || s.startsWith('data:')) return s;
        return `/images/${s}`;
    };

    // Resolve all images array entries
    if (Array.isArray(normalized.images)) {
        normalized.images = normalized.images.map(resolveImgUrl).filter(Boolean);
    }

    // Normaliser l'image principale — résoudre les noms de fichiers bruts
    if (!normalized.mainImageUrl) {
        if (normalized.imageUrl) {
            normalized.mainImageUrl = resolveImgUrl(normalized.imageUrl) || normalized.imageUrl;
        } else if (Array.isArray(normalized.images) && normalized.images.length > 0) {
            normalized.mainImageUrl = resolveImgUrl(normalized.images[0]);
        }
    } else {
        normalized.mainImageUrl = resolveImgUrl(normalized.mainImageUrl) || normalized.mainImageUrl;
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

    return normalized;
}

export default function OrchardPanel({ reviewData, onClose, onPresetApplied, onPublish, reviewId = null, productType = 'flower' }) {
    const [showExportModal, setShowExportModal] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isCustomMode, setIsCustomMode] = useState(false); // Nouveau: mode template vs custom
    const [customLayout, setCustomLayout] = useState([]); // Layout custom pour drag & drop
    const [activeDragId, setActiveDragId] = useState(null); // ID du champ en cours de drag
    const [isCanvasOver, setIsCanvasOver] = useState(false); // Canvas est survolé
    const [isApplying, setIsApplying] = useState(false); // En cours de capture/upload thumbnail
    const canvasRef = useRef(null);
    const thumbnailRef = useRef(null); // Ref sur la zone de préview template (pour capture thumbnail)
    const setReviewData = useOrchardStore((state) => state.setReviewData);
    const isPreviewFullscreen = useOrchardStore((state) => state.isPreviewFullscreen);
    const togglePreviewFullscreen = useOrchardStore((state) => state.togglePreviewFullscreen);
    const config = useOrchardStore((state) => state.config);
    const activePreset = useOrchardStore((state) => state.activePreset);

    const toggleContentModule = useOrchardStore((state) => state.toggleContentModule);
    const handleContextMenuStyle = useCallback((sectionKey, styleKey, value) => {
        if (styleKey === 'visible' && value === false) {
            // Hide the module via the store
            toggleContentModule(sectionKey);
        }
        // Other style keys (displayStyle, fontSize, accentColor) can be stored in a per-element config
        // For now, log and store in orchardStore elementStyles (future extension)
        console.log('[ContextMenu] Apply:', sectionKey, styleKey, value);
    }, [toggleContentModule]);

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
            // Use generic normalization function for any product type
            const normalized = normalizeReviewDataByType(reviewData, productType);

            if (normalized) {
                setReviewData(normalized);
            }

            // Load custom layout if it exists
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

            // Custom mode is disabled — old reviews in custom mode will use template mode
        }
    }, [reviewData, setReviewData, config.ratio]);

    // Pages are no longer used for preview (HTML scrolls naturally).
    // The pages store is kept available for potential future export-specific pagination.

    const handleExport = () => {
        setShowExportModal(true);
    };

    // Capture un thumbnail de la préview et l'uploade si reviewId dispo, puis applique le preset
    const handleApplyPreset = async (publishAfter = false) => {
        setIsApplying(true);
        let previewUrl = null;

        // Tenter de capturer le thumbnail de la zone de préview visible
        if (reviewId) {
            try {
                const captureEl = isCustomMode ? canvasRef.current : thumbnailRef.current;
                if (captureEl) {
                    const { toPng } = await import('html-to-image');
                    const dataUrl = await toPng(captureEl, {
                        cacheBust: true,
                        pixelRatio: 1,
                        backgroundColor: '#0e0e1a',
                        style: { transform: 'none' }
                    });
                    const result = await reviewsService.setPreview(reviewId, dataUrl);
                    previewUrl = result?.previewUrl || null;
                }
            } catch (err) {
                console.warn('[OrchardPanel] Thumbnail capture/upload failed (non-bloquant):', err);
            }
        }

        // Sauvegarder la configuration Orchard dans le formData
        const orchardPayload = {
            orchardConfig: config,
            orchardPreset: activePreset,
            customLayout: isCustomMode ? customLayout : null,
            layoutMode: isCustomMode ? 'custom' : 'template',
            previewUrl
        };
        if (onPresetApplied) {
            onPresetApplied(orchardPayload);
        }

        setIsApplying(false);

        // Si mode "Appliquer & Publier", déclencher la publication en passant les données orchardPayload
        // directement pour éviter la race-condition React setState
        if (publishAfter && onPublish) {
            onPublish(orchardPayload);
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

    // Utiliser createPortal pour rendre directement dans le body (évite les problèmes de stacking context)
    return createPortal(
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
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`fixed z-[9999] bg-[#0a0a12]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col border border-white/10 ${isPreviewFullscreen ? 'rounded-none' : 'rounded-2xl'}`}
                style={
                    isPreviewFullscreen
                        ? { left: 0, right: 0, top: 0, bottom: 0 }
                        : showPreview
                            ? { left: '3%', right: '3%', top: '3%', bottom: '3%' }
                            : { left: '50%', top: '50%', width: '600px', maxHeight: '80vh', marginLeft: '-300px', marginTop: '-40vh' }
                }
            >
                {/* Header - STICKY POUR TOUJOURS VISIBLE */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#12121a] sticky top-0 z-10 flex-shrink-0 shadow-md gap-2 overflow-x-auto">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white drop-shadow-sm">
                                🌸 Export Maker
                            </h2>
                            <p className="text-xs font-medium text-white/60">
                                Système de rendu et d'exportation
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap justify-end flex-shrink-0">
                        {/* Bouton Appliquer */}
                        {onPresetApplied && (
                            <motion.button
                                whileHover={{ scale: isApplying ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleApplyPreset(false)}
                                disabled={isApplying}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isApplying ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {isApplying ? 'Sauvegarde...' : 'Appliquer'}
                            </motion.button>
                        )}

                        {/* Bouton Export */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExport}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exporter
                        </motion.button>

                        {/* Bouton Plein écran */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={togglePreviewFullscreen}
                            className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
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

                        {/* Bouton Fermer */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
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
                                <div className="w-80 flex-shrink-0 h-full overflow-hidden min-h-0">
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
                                <div ref={canvasRef} className="flex-1 overflow-hidden min-w-0 h-full">
                                    <CustomLayoutPane
                                        reviewData={normalizedData}
                                        layout={customLayout}
                                        onLayoutChange={handleLayoutChange}
                                        isCanvasOver={isCanvasOver}
                                    />
                                </div>
                            </motion.div>
                        ) : isPreviewFullscreen ? (
                            // MODE PLEIN ÉCRAN — aperçu format réel
                            <motion.div
                                ref={thumbnailRef}
                                key="fullscreen"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full h-full"
                            >
                                <RatioPreviewWrapper ratio={config.ratio || '1:1'}>
                                    <Suspense fallback={<div className="flex items-center justify-center h-full text-white/30">Chargement...</div>}>
                                        <InteractiveReviewCard mode="preview-export" />
                                    </Suspense>
                                </RatioPreviewWrapper>
                            </motion.div>
                        ) : (
                            // MODE TEMPLATE SPLIT — Config à gauche, HTML interactif à droite
                            <motion.div
                                key="split"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex h-full"
                            >
                                {/* Configuration Pane - Left */}
                                <div className="w-96 xl:w-[28rem] border-r border-white/10 overflow-y-auto flex-shrink-0 min-h-0">
                                    <ConfigPane />
                                </div>

                                {/* Preview Pane - Right — aperçu format réel */}
                                <div ref={thumbnailRef} className="flex-1 overflow-hidden min-w-0 relative">
                                    {/* Format indicator badge */}
                                    <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/60">
                                        {config.ratio || '1:1'}
                                    </div>
                                    <RatioPreviewWrapper ratio={config.ratio || '1:1'}>
                                        <Suspense fallback={<div className="flex items-center justify-center h-full text-white/30">Chargement...</div>}>
                                            <InteractiveReviewCard mode="preview-export" />
                                        </Suspense>
                                    </RatioPreviewWrapper>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Hidden offscreen InteractiveReviewCard in export mode for image capture */}
            {showExportModal && (
                <div style={{ position: 'fixed', left: '-99999px', top: 0, zIndex: -1, opacity: 0, pointerEvents: 'none' }}>
                    <Suspense fallback={null}>
                        <InteractiveReviewCard mode="export" />
                    </Suspense>
                </div>
            )}

            {/* Export Modal */}
            <AnimatePresence>
                {showExportModal && (
                    <ExportModal onClose={() => setShowExportModal(false)} />
                )}
            </AnimatePresence>

            {/* Context Menu for right-click on preview elements */}
            <OrchardContextMenu onApplyStyle={handleContextMenuStyle} />

            {/* Drag Overlay - Affiche l'élément en cours de drag */}
            <DragOverlay>
                {activeDragId ? (
                    <div className="text-white px-3 py-2 rounded-lg shadow-2xl text-sm font-medium opacity-90">
                        📦 {activeDragId}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>,
        document.body
    );
}

OrchardPanel.propTypes = {
    reviewData: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onPresetApplied: PropTypes.func // Callback optionnel pour sauvegarder le preset dans le parent
};



