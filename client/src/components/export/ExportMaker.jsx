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
import { FeatureGate } from '../account/FeatureGate';
import DragDropExport from './DragDropExport';
import WatermarkEditor from './WatermarkEditor';
import { exportPipelineToGIF, downloadGIF } from '../../utils/GIFExporter';
import { PREDEFINED_TEMPLATES, getPredefinedTemplate, isTemplateAvailable } from '../../data/exportTemplates';
import { getModulesByProductType } from '../../utils/orchard/moduleMappings';
import { getMaxElements } from '../../data/exportTemplates';
import { CANNABIS_COLORS } from '../../data/cannabisColors';
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

    // Force Terpologie watermark when watermark customization is not available
    useEffect(() => {
        if (!permissions.export?.features?.watermark) {
            setWatermark(w => ({ ...w, visible: true }));
        }
    }, [permissions]);

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
        if (!exportRef.current) return;
        setExporting(true);

        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: highQuality ? 3 : 2,
                useCORS: true,
                backgroundColor: null,
            });

            const link = document.createElement('a');
            link.download = `review-${reviewData.name || 'export'}-${Date.now()}.${exportFormat}`;
            link.href = canvas.toDataURL(`image/${exportFormat}`);
            link.click();
        } catch (err) {
            console.error(err);
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
                            <div className="text-xs">Brut: <span className="font-medium">{val.poidsBrut ?? '-' } g</span></div>
                            <div className="text-xs">Net: <span className="font-medium">{val.poidsNet ?? '-' } g</span></div>
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
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                            {reviewData.varietyType || 'Hybride'}
                                        </span>
                                        { (resolveReviewField('thc') || resolveReviewField('thcPercent')) && (
                                            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">THC: {resolveReviewField('thc') ?? resolveReviewField('thcPercent')}%</span>
                                        )}
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
                                            const val = od.intensity ?? (Array.isArray(od.dominant) ? (od.dominant[0] || '-') : '-')
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-1">Odeur</div>
                                                    <div className="text-xl font-bold text-white">{val ?? '-'}</div>
                                                </div>
                                            )
                                        })()}

                                        {hasElement(['taste', 'tasteNotes', 'tastes']) && (() => {
                                            const t = resolveReviewField('taste') || {}
                                            const val = t.intensity ?? (Array.isArray(t.dryPuff) ? (t.dryPuff[0] || '-') : '-')
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-1">Goût</div>
                                                    <div className="text-xl font-bold text-white">{val ?? '-'}</div>
                                                </div>
                                            )
                                        })()}

                                        {hasElement('effects') && (() => {
                                            const e = resolveReviewField('effects') || {}
                                            const val = e.intensity ?? (Array.isArray(e.selected) ? (e.selected.length || '-') : '-')
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-1">Effets</div>
                                                    <div className="text-xl font-bold text-white">{val ?? '-'}</div>
                                                </div>
                                            )
                                        })()}

                                        {hasElement('visual') && (() => {
                                            const v = resolveReviewField('visual') || {}
                                            const val = v.densite ?? v.densiteVisuelle ?? v.trichomes ?? '-'
                                            return (
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-gray-400 text-xs mb-1">Visuel</div>
                                                    <div className="text-xl font-bold text-white">{val ?? '-'}</div>
                                                </div>
                                            )
                                        })()}
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
                    </div>
                </div>
            </LiquidGlass>
        </div>
    );
};

export default ExportMaker;





