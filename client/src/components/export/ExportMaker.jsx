import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, Settings, Image as ImageIcon, Type, Palette,
    Grid, Layout, Maximize2, FileImage, File, Save, X, ChevronsRight,
    Share2, Info, CheckCircle, Film
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import { useAccountType } from '../../hooks/useAccountType';
import { useAuth } from '../../hooks/useAuth';
import { FeatureGate } from '../account/FeatureGate';
import DragDropExport from './DragDropExport';
import WatermarkEditor from './WatermarkEditor';
import { exportPipelineToGIF, downloadGIF } from '../../utils/GIFExporter';
import { PREDEFINED_TEMPLATES, getPredefinedTemplate, isTemplateAvailable } from '../../data/exportTemplates';
import { getModulesByProductType } from '../../utils/orchard/moduleMappings';
import { getMaxElements } from '../../data/exportTemplates';
import { CANNABIS_COLORS } from '../../data/cannabisColors';
import MiniBars from './MiniBars'
import TerpeneBar from './TerpeneBar'
import { ELEMENT_MODULES_MAP, isElementAvailableForProduct } from '../../utils/exportElementMappings';

/**
 * ExportMaker - Gestionnaire final d'exports
 * Intègre Drag & Drop (Phase 5) et Filigranes
 */
const ExportMaker = ({ reviewData, productType = 'flower', onClose }) => {
    const { isPremium, isProducer, isConsumer, isInfluencer, permissions, canAccess } = useAccountType();
    const canExportSVG = permissions.export?.formats?.svg === true;
    const canExportAdvanced = permissions.export?.quality?.high === true;
    const canUseCustomLayout = permissions.export?.templates?.custom === true;
    const canExportGIF = permissions.export?.features?.dragDrop === true;
    const exportRef = useRef(null);
    const [mode, setMode] = useState('templates'); // 'templates', 'custom', 'watermark'
    const [selectedTemplate, setSelectedTemplate] = useState('minimal');
    const [format, setFormat] = useState('1:1');
    const [highQuality, setHighQuality] = useState(false);
    const [watermark, setWatermark] = useState({
        visible: false,
        type: 'text',
        content: reviewData?.author?.username ? `@${reviewData.author.username}` : '',
        position: { x: 50, y: 90 },
        size: 20,
        opacity: 50
    });
    const [customSections, setCustomSections] = useState([]);
    const [exporting, setExporting] = useState(false);
    const [exportingGIF, setExportingGIF] = useState(false);
    const [gifProgress, setGifProgress] = useState(0);

    // Save to library modal state
    const [savingToLibrary, setSavingToLibrary] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [saveDescription, setSaveDescription] = useState('');
    const [savePublic, setSavePublic] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Force Terpologie watermark when watermark customization is not available
    useEffect(() => {
        if (!permissions.export?.features?.watermark) {
            setWatermark(w => ({ ...w, visible: true }));
        }
    }, [permissions]);

    const { user } = useAuth()

    // Templates prédéfinis — utiliser les templates par type de produit si présents
    const productKey = productType || 'Fleurs';
    const predefined = PREDEFINED_TEMPLATES[productKey] || PREDEFINED_TEMPLATES['Fleurs'];

    // Modules relevant to this product type
    const relevantModules = getModulesByProductType(productType || productKey);
    const relevantModulesSet = new Set(relevantModules);

    const templates = Object.keys(predefined).map((key) => {
        const meta = predefined[key];
        // Map key -> display name and basic icon choice
        const name = key === 'minimal' ? 'Compact' : key === 'standard' ? 'Standard' : key === 'detailed' ? 'Détaillé' : key === 'custom' ? 'Personnalisé' : key;
        const icon = key === 'detailed' ? Layout : key === 'minimal' ? Grid : Maximize2;

        // Check template availability based on account type permissions
        const isAvailable = key === 'minimal' || // compact always available
            (key === 'standard' && isPremium) || // detailed for premium
            (key === 'detailed' && isPremium) || // detailed for premium  
            (key === 'custom' && isProducer); // custom for producer only

        return {
            id: key,
            name,
            icon,
            description: meta?.description || `${name} template`,
            premium: !isAvailable
        };
    });

    // Elements allowed for the currently selected template
    const selectedTemplateDef = getPredefinedTemplate(productKey, selectedTemplate) || predefined[selectedTemplate] || predefined['minimal'];
    const allowedElementIds = (selectedTemplateDef?.elements || []).map(e => e.id);

    // Final allowed ids = template elements that are available for this product type
    const finalAllowedIds = allowedElementIds.filter(id => {
        try { return isElementAvailableForProduct(productType || productKey, id) } catch (e) { return false }
    });

    // Pagination logic
    const maxElements = getMaxElements(format, selectedTemplate);
    const totalPages = Math.ceil(finalAllowedIds.length / maxElements);
    const [currentPage, setCurrentPage] = useState(0);
    const currentElements = finalAllowedIds.slice(currentPage * maxElements, (currentPage + 1) * maxElements);

    const hasElement = (ids) => {
        if (!ids) return false;
        const arr = Array.isArray(ids) ? ids : [ids];
        return arr.some(id => currentElements.includes(id));
    };

    const Star = ({ className }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );

    const handleExport = async (exportFormat = 'png') => {
        console.debug('[ExportMaker] handleExport called', { exportFormat, exportRefCurrent: !!exportRef.current })
        if (!exportRef.current) {
            console.warn('[ExportMaker] No preview available (exportRef.current is null)')
            alert('Aucune preview disponible pour l\'export. Assurez-vous que la fenêtre d\'aperçu est chargée.')
            return;
        }

        setExporting(true);

        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: highQuality ? 3 : 2,
                useCORS: true,
                backgroundColor: null,
            });

            if (!canvas) {
                console.error('[ExportMaker] html2canvas returned null/undefined canvas')
                alert('Erreur: Impossible de générer le canvas pour l\'export. Voir console pour détails.')
                return
            }

            // Log canvas size for debugging
            try {
                console.debug('[ExportMaker] Canvas generated', { width: canvas.width, height: canvas.height })
            } catch (e) {
                console.debug('[ExportMaker] Canvas debugging failed', e)
            }

            const mime = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png'
            const link = document.createElement('a');
            link.download = `review-${(reviewData.name || 'export').replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.${exportFormat}`;

            // Use toBlob when available for larger exports
            if (canvas.toBlob) {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('[ExportMaker] canvas.toBlob returned null')
                        alert('Erreur: impossible de préparer le fichier export. Voir la console.')
                        setExporting(false)
                        return
                    }
                    const url = URL.createObjectURL(blob)
                    link.href = url
                    link.click()
                    // Release after a delay
                    setTimeout(() => URL.revokeObjectURL(url), 20000)
                }, mime, highQuality ? 0.95 : 0.92)
            } else {
                // Fallback to dataURL
                try {
                    const dataUrl = canvas.toDataURL(mime)
                    link.href = dataUrl
                    link.click()
                } catch (err) {
                    console.error('[ExportMaker] toDataURL failed', err)
                    alert('Erreur lors de la génération du fichier export. Voir la console.')
                }
            }

        } catch (err) {
            console.error('[ExportMaker] Export failed:', err);
            alert('Erreur lors de l\'export. Voir la console pour plus de détails.')
        } finally {
            setExporting(false);
        }
    };

    const handleExportGIF = async () => {
        if (!exportRef.current) return;

        // Vérifier qu'il y a au moins un pipeline dans la review
        const hasPipeline = reviewData?.pipelineGlobal || reviewData?.pipelineSeparation ||
            reviewData?.pipelineExtraction || reviewData?.pipelineCuring;

        if (!hasPipeline) {
            alert('Cette review ne contient aucun pipeline à exporter en GIF.');
            return;
        }

        setExportingGIF(true);
        setGifProgress(0);

        try {
            // Récupérer le premier pipeline disponible
            const pipelineData = reviewData.pipelineGlobal ||
                reviewData.pipelineSeparation ||
                reviewData.pipelineExtraction ||
                reviewData.pipelineCuring;

            const blob = await exportPipelineToGIF(pipelineData, exportRef.current, {
                delay: 200,
                quality: 10,
                onProgress: (percent) => setGifProgress(percent)
            });

            const filename = `review-${reviewData.name || 'export'}-pipeline-${Date.now()}.gif`;
            downloadGIF(blob, filename);
        } catch (error) {
            console.error('❌ Export GIF failed:', error);
            alert('Erreur lors de l\'export GIF. Voir console pour détails.');
        } finally {
            setExportingGIF(false);
            setGifProgress(0);
        }
    };

    // Helper to resolve common field ids into actual review fields
    const resolveReviewField = (id) => {
        const f = reviewData || {}
        const flower = f.flowerData || {}

        switch (id) {
            case 'productName':
            case 'product_name':
                return flower.nomCommercial || f.holderName || f.name || '-'
            case 'photo':
            case 'mainImage':
                return f.images?.[0] || flower.mainImage || f.mainImageUrl || null
            case 'photos':
            case 'gallery':
                return f.images || flower.images || []
            case 'genetics':
            case 'breeder':
                return [flower.breeder, flower.variety].filter(Boolean).join(' • ') || '-'
            case 'thc':
                return flower.thcPercent ?? f.thc ?? '-'
            case 'cbd':
                return flower.cbdPercent ?? f.cbd ?? '-'
            case 'analytics':
            case 'terpeneProfile':
                return flower.terpeneProfile || f.terpeneProfile || []
            case 'visual':
                return {
                    densite: flower.densiteVisuelle ?? f.densiteVisuelle,
                    trichomes: flower.trichomesScore ?? f.trichomesScore,
                    pistils: flower.pistilsScore ?? f.pistilsScore,
                    manucure: flower.manucureScore ?? f.manucureScore
                }
            case 'odor':
            case 'odors':
                return {
                    dominant: flower.notesOdeursDominantes || [],
                    secondary: flower.notesOdeursSecondaires || [],
                    intensity: flower.intensiteAromatique ?? f.intensiteAromatique
                }
            case 'taste':
            case 'tastes':
                return {
                    intensity: flower.intensiteGoutScore ?? f.intensiteGoutScore,
                    aggressiveness: flower.agressiviteScore ?? f.agressiviteScore,
                    dryPuff: flower.dryPuffNotes || [],
                    inhalation: flower.inhalationNotes || [],
                    expiration: flower.expirationNotes || []
                }
            case 'effects':
                return {
                    selected: flower.effetsChoisis || [],
                    intensity: flower.intensiteEffetScore ?? f.intensiteEffetScore,
                    onset: flower.monteeScore ?? f.monteeScore
                }
            case 'culture':
                return {
                    config: flower.cultureTimelineConfig || f.cultureTimelineConfig,
                    data: flower.cultureTimelineData || f.cultureTimelineData
                }
            case 'curing':
                return {
                    config: flower.curingTimelineConfig || f.curingTimelineConfig,
                    data: flower.curingTimelineData || f.curingTimelineData
                }
            case 'recolte':
                return {
                    fenetre: flower.fenetreRecolte || f.fenetreRecolte || null,
                    trichomesTranslucides: flower.trichomesTranslucides || f.trichomesTranslucides || 0,
                    trichomesLaiteux: flower.trichomesLaiteux || f.trichomesLaiteux || 0,
                    trichomesAmbres: flower.trichomesAmbres || f.trichomesAmbres || 0,
                    modeRecolte: flower.modeRecolte || f.modeRecolte || null,
                    poidsBrut: flower.poidsBrut || f.poidsBrut || null,
                    poidsNet: flower.poidsNet || f.poidsNet || null
                }
            case 'notes':
            case 'description':
                return f.description || flower.notes || '-'
            default:
                // Fallback: try direct field at top-level or in flowerData
                return f[id] ?? flower[id] ?? undefined
        }
    }

    // Helper to render a review field value for export
    const renderFieldValue = (fieldId) => {
        const val = resolveReviewField(fieldId)
        if (val === null || typeof val === 'undefined') return '-';

        // If it's a primitive
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val)

        // If it's an array of images (filenames or urls) -> render first
        if (Array.isArray(val)) {
            // array of filenames/strings
            if (val.length === 0) return '-'
            // if array of objects with filename or url
            if (typeof val[0] === 'object') {
                const first = val[0]
                const url = first.url || first.filename || first.path || first
                return typeof url === 'string' ? <img src={url.startsWith('http') ? url : `/images/${String(url).replace(/^\//, '')}`} alt={fieldId} className="w-full h-auto rounded" /> : '-'
            }
            // array of strings
            return val.join(', ')
        }

        // If val is an object (e.g., visual/taste/effects) render a compact representation
        if (typeof val === 'object') {
            // Visual object
            if (val.densite !== undefined || val.trichomes !== undefined) {
                return (
                    <div className="flex flex-col text-sm text-white">
                        {Object.keys(val).map(k => (
                            <div key={k} className="flex justify-between">
                                <div className="text-xs text-gray-400">{k}</div>
                                <div className="font-medium">{String(val[k] ?? '-')}</div>
                            </div>
                        ))}
                    </div>
                )
            }

            // Odors, tastes, effects
            if (val.dominant || val.dryPuff || val.selected) {
                const lists = []
                if (val.dominant) lists.push((val.dominant || []).join(', '))
                if (val.secondary) lists.push((val.secondary || []).join(', '))
                if (val.dryPuff) lists.push('Dry: ' + (val.dryPuff || []).join(', '))
                if (val.inhalation) lists.push('In: ' + (val.inhalation || []).join(', '))
                if (val.expiration) lists.push('Out: ' + (val.expiration || []).join(', '))
                if (val.selected) lists.push((val.selected || []).join(', '))
                return lists.filter(Boolean).join(' • ') || '-'
            }

            // Récolte (trichomes + weights)
            if (val.trichomesTranslucides !== undefined || val.trichomesLaiteux !== undefined || val.trichomesAmbres !== undefined) {
                const total = (Number(val.trichomesTranslucides || 0) + Number(val.trichomesLaiteux || 0) + Number(val.trichomesAmbres || 0))
                return (
                    <div className="text-sm text-white">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="text-xs text-gray-400">Trichomes</div>
                            <div className="flex gap-2">
                                <div className="text-xs">Translucides: <span className="font-medium">{val.trichomesTranslucides ?? 0}%</span></div>
                                <div className="text-xs">Laiteux: <span className="font-medium">{val.trichomesLaiteux ?? 0}%</span></div>
                                <div className="text-xs">Ambrés: <span className="font-medium">{val.trichomesAmbres ?? 0}%</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-xs text-gray-400">Poids</div>
                            <div className="text-xs">Brut: <span className="font-medium">{val.poidsBrut ?? '-'} g</span></div>
                            <div className="text-xs">Net: <span className="font-medium">{val.poidsNet ?? '-'} g</span></div>
                            <div className="text-xs">Mode: <span className="font-medium">{val.modeRecolte ?? '-'}</span></div>
                        </div>
                        <div className={`mt-2 text-xs ${total === 100 ? 'text-green-400' : 'text-amber-400'}`}>Total trichomes: {total}%</div>
                    </div>
                )
            }

            // Timeline objects
            if (val.data || val.config) {
                return <div className="text-sm text-gray-300">Timeline ({val.data ? (val.data.length || 0) : 0} steps)</div>
            }

            return JSON.stringify(val)
        }

        return String(val)
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <LiquidGlass variant="modal" className="w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden relative z-[9999]">

                {/* Sidebar options */}
                <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-white/5">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Export
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Modes */}
                    <div className="flex p-2 gap-1 bg-black/20">
                        <button
                            onClick={() => setMode('templates')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'templates' ? ' text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Templates
                        </button>
                        <button
                            onClick={() => canUseCustomLayout && setMode('custom')}
                            disabled={!canUseCustomLayout}
                            title={!canUseCustomLayout ? 'Réservé aux comptes Producteur' : ''}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'custom' ? ' text-white' : 'text-gray-400 hover:text-white'} ${!canUseCustomLayout ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Personnalisé
                        </button>
                        <button
                            onClick={() => (permissions.export?.features?.watermark ? setMode('watermark') : null)}
                            disabled={!permissions.export?.features?.watermark}
                            title={!permissions.export?.features?.watermark ? 'La personnalisation du filigrane est réservée aux comptes payants' : ''}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'watermark' ? ' text-white' : 'text-gray-400 hover:text-white'} ${!permissions.export?.features?.watermark ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Filigrane
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {mode === 'templates' && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Choisir un style</h3>
                                {templates.map(t => {
                                    const locked = !!t.premium;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => !locked && setSelectedTemplate(t.id)}
                                            disabled={locked}
                                            title={locked ? 'Réservé aux comptes Producteur / Influenceur' : ''}
                                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedTemplate === t.id ? ' text-white' : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'} ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`p-2 rounded-lg ${selectedTemplate === t.id ? ' text-white' : 'bg-white/10 text-gray-400'}`}>
                                                <t.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium flex items-center gap-2">
                                                    {t.name}
                                                    {t.premium && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">PRO</span>}
                                                </div>
                                                <div className="text-xs text-gray-400">{t.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h3>
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                                disabled={currentPage === 0}
                                                className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                                            >
                                                <ChevronsRight className="w-4 h-4 rotate-180" />
                                            </button>
                                            <span className="text-sm text-gray-300">
                                                Page {currentPage + 1} sur {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                                disabled={currentPage === totalPages - 1}
                                                className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                                            >
                                                <ChevronsRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {mode === 'custom' && (
                            <FeatureGate hasAccess={canUseCustomLayout} upgradeType="producer">
                                <DragDropExport
                                    productType={productType}
                                    selectedSections={customSections}
                                    onSectionsChange={setCustomSections}
                                    allowedModules={relevantModules}
                                />
                            </FeatureGate>
                        )}

                        {mode === 'watermark' && (
                            permissions.export?.features?.watermark ? (
                                <WatermarkEditor
                                    watermark={watermark}
                                    onWatermarkChange={setWatermark}
                                />
                            ) : (
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="text-sm text-gray-300">La personnalisation avancée des filigranes est réservée aux comptes payants.</div>
                                    <div className="text-xs text-gray-500 mt-2">Votre export inclura automatiquement le filigrane Terpologie.</div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Actions footer */}
                    <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">
                        {/* Bouton Export GIF - Disponible pour tous si pipeline présent */}
                        {(reviewData?.pipelineGlobal || reviewData?.pipelineSeparation ||
                            reviewData?.pipelineExtraction || reviewData?.pipelineCuring) && (
                                <FeatureGate hasAccess={canExportGIF} upgradeType="producer">
                                    <button
                                        onClick={handleExportGIF}
                                        disabled={exportingGIF}
                                        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-white font-bold shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        {exportingGIF ? (
                                            <>
                                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                                <span>{gifProgress}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <Film className="w-5 h-5" />
                                                <span>Exporter Pipeline en GIF</span>
                                            </>
                                        )}
                                    </button>
                                </FeatureGate>
                            )}

                        <div className="flex gap-2 items-center">
                            <FeatureGate hasAccess={canExportSVG} upgradeType="producer" showOverlay={false}>
                                <button onClick={() => handleExport('svg')} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white">SVG</button>
                            </FeatureGate>

                            <button onClick={() => handleExport('pdf')} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white">PDF</button>

                            {/* Haute qualité (visible si la permission existe) */}
                            {permissions.export?.quality && (
                                <button
                                    onClick={() => setHighQuality(h => !h)}
                                    disabled={!canExportAdvanced}
                                    title={!canExportAdvanced ? 'Haute qualité réservé aux comptes payants' : 'Activer la haute qualité (300dpi)'}
                                    className={`ml-2 px-3 py-2 text-xs rounded-lg ${canExportAdvanced ? (highQuality ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-200 hover:bg-white/10') : 'opacity-50 cursor-not-allowed bg-white/5 text-gray-500'}`}
                                >
                                    Haute qualité
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <button
                                onClick={() => handleExport('png')}
                                disabled={exporting}
                                className="w-full py-3 bg-gradient-to-r rounded-xl text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                {exporting ? (
                                    <span className="animate-spin">⌛</span>
                                ) : (
                                    <Download className="w-5 h-5" />
                                )}
                                Exporter l'image
                            </button>

                            <button
                                onClick={() => setSavingToLibrary(true)}
                                disabled={saveLoading}
                                className="w-full py-3 bg-white/5 rounded-xl text-white font-medium border border-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Sauvegarder dans la bibliothèque
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-gray-900/50 p-8 flex items-center justify-center overflow-auto relative">
                    <div className="bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] absolute inset-0 opacity-20 pointer-events-none" />

                    <div
                        ref={exportRef}
                        className="bg-gradient-to-br from-gray-900 to-black rounded-none shadow-2xl relative overflow-hidden"
                        style={{
                            width: format === '9:16' ? '450px' : '800px',
                            minHeight: format === '16:9' ? '450px' : '800px',
                            aspectRatio: format.replace(':', '/')
                        }}
                    >
                        {/* Background Theme */}
                        <div className="absolute inset-0 bg-gradient-to-br /40 via-black /40" />
                        <div className="absolute top-0 right-0 p-32 blur-[100px] rounded-full" />
                        <div className="absolute bottom-0 left-0 p-32 bg-emerald-600/10 blur-[100px] rounded-full" />

                        {/* Content */}
                        <div className="relative z-10 p-8 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="text-sm font-bold tracking-widest uppercase mb-1">{reviewData.typeName || productType}</div>
                                    <h1 className="text-4xl font-black text-white mb-2">{reviewData.name || 'Produit sans nom'}</h1>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                                {reviewData.varietyType || 'Hybride'}
                                            </span>
                                            {(resolveReviewField('thc') || resolveReviewField('thcPercent')) && (
                                                <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">THC: {resolveReviewField('thc') ?? resolveReviewField('thcPercent')}%</span>
                                            )}
                                            {(resolveReviewField('cbd') || resolveReviewField('cbdPercent')) && (
                                                <span className="px-2 py-1 bg-emerald-600/10 text-emerald-300 rounded text-xs">CBD: {resolveReviewField('cbd') ?? resolveReviewField('cbdPercent')}%</span>
                                            )}
                                        </div>

                                        {/* Genetics quick line */}
                                        <div className="text-sm text-gray-300 mt-1">{resolveReviewField('genetics')}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r">
                                        {reviewData.rating || '0.0'}
                                    </div>
                                    <div className="text-gray-400 text-sm">Note globale</div>
                                </div>
                            </div>

                            {/* Main Image & Stats */}
                            <div className="grid grid-cols-2 gap-6 mb-8 flex-1">
                                <div className="rounded-2xl overflow-hidden border border-white/10 relative group">
                                    {hasElement(['photo', 'photos', 'gallery', 'image']) ? (
                                        (() => {
                                            const mainCandidate = resolveReviewField('photo') || resolveReviewField('mainImage') || resolveReviewField('images')
                                            let url = null
                                            if (Array.isArray(mainCandidate)) url = mainCandidate[0]
                                            else url = mainCandidate

                                            if (!url) {
                                                return (
                                                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500">
                                                        <ImageIcon className="w-12 h-12 opacity-50" />
                                                    </div>
                                                )
                                            }

                                            const src = (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) ? url : `/images/${String(url).replace(/^\//, '')}`

                                            return <img src={src} className="w-full h-full object-cover" alt="Product" />
                                        })()
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500">
                                            <div className="text-sm text-gray-400">Image non disponible pour ce template</div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {hasElement(['odor', 'odorNotes', 'odors']) && (() => {
                                            const od = resolveReviewField('odor') || {}
                                            const items = []
                                            if (Array.isArray(od.dominant) && od.dominant.length) items.push({ label: 'Dominant', value: (od.dominant.length || 0), color: '#84CC16' })
                                            if (Array.isArray(od.secondary) && od.secondary.length) items.push({ label: 'Secondaires', value: (od.secondary.length || 0), color: '#10B981' })
                                            if (od.intensity !== undefined) items.unshift({ label: 'Intensité', value: od.intensity, color: '#059669' })
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-2">Odeur</div>
                                                    <MiniBars items={items} max={10} />
                                                </div>
                                            )
                                        })()}

                                        {hasElement(['taste', 'tasteNotes', 'tastes']) && (() => {
                                            const t = resolveReviewField('taste') || {}
                                            const items = []
                                            if (t.intensity !== undefined) items.push({ label: 'Intensité', value: t.intensity, color: '#F59E0B' })
                                            if (t.aggressiveness !== undefined) items.push({ label: 'Agressivité', value: t.aggressiveness, color: '#FB923C' })
                                            if (Array.isArray(t.dryPuff) && t.dryPuff.length) items.push({ label: 'Dry', value: t.dryPuff.length, color: '#F97316' })
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-2">Goût</div>
                                                    <MiniBars items={items} max={10} />
                                                </div>
                                            )
                                        })()}

                                        {hasElement('effects') && (() => {
                                            const e = resolveReviewField('effects') || {}
                                            const items = []
                                            if (e.intensity !== undefined) items.push({ label: 'Intensité', value: e.intensity, color: '#06B6D4' })
                                            if (e.onset !== undefined) items.push({ label: 'Montée', value: e.onset, color: '#34D399' })
                                            if (Array.isArray(e.selected) && e.selected.length) items.push({ label: 'Choix', value: e.selected.length, color: '#60A5FA' })
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-2">Effets</div>
                                                    <MiniBars items={items} max={10} />
                                                </div>
                                            )
                                        })()}

                                        {hasElement('visual') && (() => {
                                            const v = resolveReviewField('visual') || {}
                                            const items = []
                                            if (v.densite !== undefined) items.push({ label: 'Densité', value: v.densite, color: '#8B5CF6' })
                                            if (v.trichomes !== undefined) items.push({ label: 'Trichomes', value: v.trichomes, color: '#A78BFA' })
                                            if (v.pistils !== undefined) items.push({ label: 'Pistils', value: v.pistils, color: '#C084FC' })
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-2">Visuel</div>
                                                    <MiniBars items={items} max={10} />
                                                </div>
                                            )
                                        })()}

                                        {/* Profil terpénique */}
                                        {hasElement(['terpeneProfile', 'terpenes']) && (() => {
                                            const terps = resolveReviewField('terpeneProfile') || resolveReviewField('terpenes') || []
                                            const normalized = Array.isArray(terps) ? terps.map(t => ({ name: t.name || t.terpene || t.key || t.label || 'Autre', percent: t.percent || t.value || t.amount || 0 })) : []
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-2">Profil terpénique</div>
                                                    <TerpeneBar profile={normalized} />
                                                </div>
                                            )
                                        })()}

                                        {/* Analytique rapide */}
                                        {(resolveReviewField('thc') || resolveReviewField('cbd') || resolveReviewField("cbg")) && (
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <div className="text-gray-400 text-xs mb-2">Analytiques</div>
                                                <div className="flex gap-2 items-center">
                                                    {resolveReviewField('thc') && <div className="px-2 py-1 bg-red-500/20 rounded text-xs text-red-300">THC: {resolveReviewField('thc')}</div>}
                                                    {resolveReviewField('cbd') && <div className="px-2 py-1 bg-emerald-600/20 rounded text-xs text-emerald-300">CBD: {resolveReviewField('cbd')}</div>}
                                                    {resolveReviewField('cbg') && <div className="px-2 py-1 bg-violet-600/20 rounded text-xs text-violet-300">CBG: {resolveReviewField('cbg')}</div>}
                                                    {reviewData?.flowerData?.analyticsPdfUrl && (
                                                        <a href={`/images/${reviewData.flowerData.analyticsPdfUrl}`} target="_blank" rel="noreferrer" className="ml-auto text-xs text-gray-300 underline">Certificat</a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Custom Sections (Drag & Drop) */}
                                    {mode === 'custom' && customSections.filter(s => (
                                        // show the section if the section id or any of its modules are available for this product
                                        isElementAvailable(s.id) || (s.modules || s.fields || []).some(m => relevantModulesSet.has(m))
                                    )).map(section => (
                                        <div key={section.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-xs font-bold uppercase mb-1">{section.name}</div>
                                            <div className="space-y-2">
                                                {(section.modules || section.fields || []).map((modId) => (
                                                    <div key={modId} className="text-white text-sm">
                                                        <div className="text-xs text-gray-400 uppercase">{modId}</div>
                                                        <div className="mt-1">{renderFieldValue(modId)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-end">
                                <div className="text-xs text-gray-500">
                                    Review réalisée sur<br />
                                    <span className="text-white font-bold text-lg">Reviews-Maker</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Date</div>
                                        <div className="text-white font-medium">{new Date().toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Reviewer</div>
                                        <div className="text-white font-medium">@{reviewData.author?.username || 'Anonyme'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filigrane Overlay */}
                        {watermark.visible && (
                            <div
                                className="absolute pointer-events-none z-50"
                                style={{
                                    left: `${watermark.position.x}%`,
                                    top: `${watermark.position.y}%`,
                                    transform: `translate(-50%, -50%) rotate(${watermark.rotation}deg)`,
                                    opacity: watermark.opacity / 100,
                                }}
                            >
                                {watermark.type === 'image' && watermark.imageUrl ? (
                                    <img
                                        src={watermark.imageUrl}
                                        alt="Watermark"
                                        style={{ width: `${watermark.size * 5}px` }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            fontSize: `${watermark.size}px`,
                                            color: watermark.color || '#ffffff',
                                            fontWeight: 'bold',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        {watermark.content}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Filigrane Terpologie forcé pour comptes Amateur */}
                        {(!permissions.export?.features?.watermark) && (
                            <div
                                className="absolute pointer-events-none z-[60]"
                                style={{
                                    bottom: '20px',
                                    right: '20px',
                                    opacity: 0.3,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#8B5CF6',
                                        textShadow: '0 0 10px rgba(139, 92, 246, 0.5), 0 2px 4px rgba(0,0,0,0.3)',
                                        letterSpacing: '1px',
                                        userSelect: 'none',
                                    }}
                                >
                                    Terpologie
                                </div>
                            </div>
                        )}

                        {/* Save to Library Modal */}
                        {savingToLibrary && (
                            <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/60">
                                <div className="bg-white/5 p-6 rounded-lg w-[420px]">
                                    <h3 className="text-lg font-semibold text-white mb-3">Sauvegarder l'export</h3>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400">Nom</label>
                                        <input value={saveName} onChange={(e) => setSaveName(e.target.value)} className="w-full p-2 rounded bg-black/30 text-white text-sm" placeholder={`Export ${new Date().toLocaleDateString()}`} />

                                        <label className="text-xs text-gray-400">Description (optionnel)</label>
                                        <textarea value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} className="w-full p-2 rounded bg-black/30 text-white text-sm" rows={3} />

                                        <div className="flex items-start gap-2">
                                            <input id="publish" type="checkbox" checked={savePublic} onChange={(e) => setSavePublic(e.target.checked)} disabled={!user || (reviewData && reviewData.author && reviewData.author.id !== user.id)} />
                                            <div className="flex flex-col">
                                                <label htmlFor="publish" className="text-sm text-gray-300">Publier dans la galerie publique</label>
                                                {(!user || (reviewData && reviewData.author && reviewData.author.id !== user.id)) && (
                                                    <div className="text-xs text-gray-500">Seul le propriétaire de la review peut la publier</div>
                                                )}
                                            </div>
                                        </div>

                                        {saveError && (<div className="text-sm text-rose-400">{saveError}</div>)}

                                        <div className="flex items-center justify-end gap-2 mt-4">
                                            <button onClick={() => setSavingToLibrary(false)} className="px-3 py-2 rounded bg-white/5 text-sm">Annuler</button>
                                            <button
                                                onClick={async () => {
                                                    setSaveError(null)
                                                    setSaveLoading(true)
                                                    try {
                                                        // Render canvas and upload
                                                        if (!exportRef.current) throw new Error('Aucune preview disponible')
                                                        const canvas = await html2canvas(exportRef.current, { scale: highQuality ? 3 : 2, useCORS: true, backgroundColor: null })
                                                        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
                                                        const filename = `export-${(reviewData.name || 'review').replace(/\s+/g, '-')}-${Date.now()}.png`
                                                        const form = new FormData()
                                                        form.append('file', blob, filename)
                                                        if (reviewData?.id) form.append('reviewId', reviewData.id)
                                                        form.append('name', saveName || '')
                                                        form.append('description', saveDescription || '')
                                                        form.append('format', 'png')
                                                        form.append('templateName', selectedTemplate || 'detailed')
                                                        form.append('isPublic', savePublic ? 'true' : 'false')

                                                        const resp = await fetch('/api/library/exports', {
                                                            method: 'POST',
                                                            body: form,
                                                            credentials: 'include'
                                                        })
                                                        if (!resp.ok) {
                                                            const json = await resp.json().catch(() => ({ message: 'Erreur' }))
                                                            throw new Error(json.message || 'Erreur lors de l\'upload')
                                                        }

                                                        const json = await resp.json()
                                                        setSavingToLibrary(false)
                                                        alert('Export enregistré dans votre bibliothèque')
                                                    } catch (err) {
                                                        console.error(err)
                                                        setSaveError(err.message)
                                                    } finally {
                                                        setSaveLoading(false)
                                                    }
                                                }}
                                                disabled={saveLoading}
                                                className="px-4 py-2 rounded bg-emerald-600 text-white font-medium"
                                            >
                                                {saveLoading ? 'Enregistrement...' : 'Enregistrer'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </LiquidGlass>
        </div>
    );
};

export default ExportMaker;





