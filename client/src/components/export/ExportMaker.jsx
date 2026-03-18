import { useState, useRef, useEffect } from 'react';
// Note: heavy export libs (html-to-image, jspdf) are dynamically imported only when the user triggers an export
import {
    Download, Palette,
    Grid, Layout, Maximize2, Save, X, ChevronsRight,
    Share2, Film, Plus
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import { useAccountType } from '../../hooks/useAccountType';
import { useAuth } from '../../hooks/useAuth';
import { FeatureGate } from '../account/FeatureGate';
import WatermarkEditor from './WatermarkEditor';
import { exportPipelineToGIF, downloadGIF } from '../../utils/GIFExporter';
import { DEFAULT_TEMPLATES } from '../../store/orchardConstants';
import { useOrchardStore } from '../../store/orchardStore';
import MiniBars from './MiniBars'
import TerpeneBar from './TerpeneBar'
import ScoreGauge from './ScoreGauge'
import OrchardContextMenu from '../shared/orchard/OrchardContextMenu';
import ContentModuleControls from '../shared/config/ContentModuleControls';
import TypographyControls from '../shared/config/TypographyControls';
import ColorPaletteControls from '../shared/config/ColorPaletteControls';
import ImageBrandingControls from '../shared/config/ImageBrandingControls';
import PresetManager from '../shared/config/PresetManager';

/**
 * ExportMaker - Gestionnaire final d'exports
 * Système de templates adaptatif avec sections modulaires
 */
const ExportMaker = ({ reviewData, productType = 'flower', onClose }) => {
    useEffect(() => {
        console.debug('[ExportMaker] mounted', { productType, hasPreview: !!reviewData, reviewId: reviewData?.id })
        return () => console.debug('[ExportMaker] unmounted')
    }, [productType, reviewData?.id])

    // Sync reviewData into orchardStore so ContentModuleControls can show data availability
    const setReviewData = useOrchardStore((s) => s.setReviewData);
    useEffect(() => {
        if (reviewData) setReviewData(reviewData);
        return () => setReviewData(null);
    }, [reviewData, setReviewData]);

    const { permissions } = useAccountType();
    const canExportSVG = permissions.export?.formats?.svg === true;
    const canExportAdvanced = permissions.export?.quality?.high === true;
    const canCreateCustomTemplate = permissions.export?.templates?.create === true; // Nouveau pour création templates
    const canExportGIF = permissions.export?.features?.dragDrop === true;
    const exportRef = useRef(null);
    const previewAreaRef = useRef(null);

    // 🔥 MEMORY LEAK FIX: Track blob URLs pour cleanup au démontage
    const blobUrlsRef = useRef([]);
    const [canvasScale, setCanvasScale] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState('modernCompact');
    const [format, setFormat] = useState('1:1');
    const [highQuality, setHighQuality] = useState(false);
    const [watermark, setWatermark] = useState({
        visible: false,
        type: 'text',
        content: reviewData?.author?.username ? `@${reviewData.author.username}` : '',
        position: { x: 50, y: 90 },
        size: 20,
        opacity: 50,
        rotation: 0,
        color: '#ffffff'
    });
    const [exporting, setExporting] = useState(false);
    const [exportingGIF, setExportingGIF] = useState(false);
    const [gifProgress, setGifProgress] = useState(0);
    const [sidebarTab, setSidebarTab] = useState('template'); // 'template' | 'contenu' | 'apparence' | 'prereglages'

    // Template creation system states
    const [creatingTemplate, setCreatingTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');

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

    // 🔥 MEMORY LEAK FIX: Cleanup blob URLs au démontage
    useEffect(() => {
        return () => {
            // Révoquer tous les blob URLs créés pour éviter les memory leaks
            blobUrlsRef.current.forEach(url => {
                try {
                    URL.revokeObjectURL(url);
                } catch (err) {
                    console.warn('[ExportMaker] Failed to revoke blob URL:', err);
                }
            });
            blobUrlsRef.current = [];
        };
    }, []);

    const { user } = useAuth()

    // Lire la config de présentation depuis le store OrchardPanel (couleurs, typo)
    const orchardConfig = useOrchardStore((s) => s.config);
    const previewBackground = orchardConfig?.colors?.background || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    const previewFont = orchardConfig?.typography?.fontFamily || 'Inter';
    const previewAccent = orchardConfig?.colors?.accent || '#ffd700';
    const previewTextColor = orchardConfig?.colors?.textPrimary || '#ffffff';

    // Design sizes — tailles de référence pour chaque format (le canvas est rendu à cette taille
    // puis mis à l'échelle via CSS transform pour le preview, et exporté en haute résolution via pixelRatio)
    const DESIGN_SIZES = {
        '1:1': { w: 540, h: 540 },
        '16:9': { w: 720, h: 405 },
        '9:16': { w: 405, h: 720 },
        'A4': { w: 530, h: 750 },
    };
    const designSize = DESIGN_SIZES[format] || DESIGN_SIZES['1:1'];

    // Calcul du scale pour faire tenir le canvas dans la zone preview
    useEffect(() => {
        const el = previewAreaRef.current;
        if (!el) return;
        const compute = () => {
            const rect = el.getBoundingClientRect();
            // Laisser un petit padding (16px de chaque côté)
            const availW = rect.width - 32;
            const availH = rect.height - 32;
            if (availW <= 0 || availH <= 0) return;
            const scaleW = availW / designSize.w;
            const scaleH = availH / designSize.h;
            setCanvasScale(Math.min(scaleW, scaleH, 1));
        };
        compute();
        const observer = new ResizeObserver(compute);
        observer.observe(el);
        return () => observer.disconnect();
    }, [format, designSize.w, designSize.h]);

    // Résolution du nom de la review (plusieurs champs possibles selon le type de produit)
    const reviewName = (reviewData?.holderName || reviewData?.nomCommercial || reviewData?.name || '').trim() || 'export';

    // Templates — basés sur DEFAULT_TEMPLATES d'orchardConstants
    const productKey = productType || 'flower';

    const templates = Object.entries(DEFAULT_TEMPLATES).map(([key, tpl]) => {
        const icon = key === 'detailedCard' ? Layout : key === 'modernCompact' ? Grid : key === 'socialStory' ? Film : Maximize2;
        return {
            id: key,
            name: tpl.name,
            icon,
            description: tpl.description,
            premium: false // tous les templates sont disponibles
        };
    });

    // ====== SMART TEMPLATE SYSTEM ======
    // Dynamic layout adaptation based on format ratio and content density

    const getFormatSpecs = (format) => {
        const formatSpecs = {
            '1:1': { ratio: 1, orientation: 'square', maxSections: 8, fontSize: 1.0, layout: 'compact' },
            '16:9': { ratio: 1.78, orientation: 'landscape', maxSections: 12, fontSize: 0.9, layout: 'row-heavy' },
            'A4': { ratio: 0.71, orientation: 'portrait', maxSections: 16, fontSize: 0.85, layout: 'vertical' },
            '9:16': { ratio: 0.56, orientation: 'story', maxSections: 6, fontSize: 1.1, layout: 'story-mode' }
        };
        return formatSpecs[format] || formatSpecs['1:1'];
    };

    const getTemplateConfig = (templateId, formatSpecs) => {
        const configs = {
            modernCompact: {
                density: 'low',
                sections: ['header', 'analytics', 'ratings', 'footer'],
                maxSectionsPerPage: formatSpecs.maxSections * 0.5,
                adaptiveLayout: true
            },
            detailedCard: {
                density: 'high',
                sections: ['header', 'analytics', 'visual', 'ratings', 'aromas', 'effects', 'footer'],
                maxSectionsPerPage: formatSpecs.maxSections,
                adaptiveLayout: true
            },
            blogArticle: {
                density: 'medium',
                sections: ['header', 'analytics', 'ratings', 'aromas', 'effects', 'conclusion', 'footer'],
                maxSectionsPerPage: formatSpecs.maxSections * 0.8,
                adaptiveLayout: true
            },
            socialStory: {
                density: 'minimal',
                sections: ['header', 'analytics', 'rating', 'footer'],
                maxSectionsPerPage: formatSpecs.maxSections * 0.3,
                adaptiveLayout: true
            }
        };
        return configs[templateId] || configs.modernCompact;
    };

    const calculateOptimalLayout = () => {
        const formatSpecs = getFormatSpecs(format);
        const templateConfig = getTemplateConfig(selectedTemplate, formatSpecs);

        // Calculate if pagination is needed
        const totalSections = templateConfig.sections.length;
        const needsPagination = totalSections > templateConfig.maxSectionsPerPage;
        const calculatedPages = needsPagination ? Math.ceil(totalSections / templateConfig.maxSectionsPerPage) : 1;

        // Adaptive font scaling
        const baseFontScale = formatSpecs.fontSize;
        const densityScale = templateConfig.density === 'high' ? 0.85 : templateConfig.density === 'low' ? 1.15 : 1.0;
        const finalFontScale = baseFontScale * densityScale;

        return {
            formatSpecs,
            templateConfig,
            pages: calculatedPages,
            fontScale: finalFontScale,
            needsPagination,
            layout: formatSpecs.layout
        };
    };

    // ====== MODULAR SECTION RENDERERS ======
    // Adaptive section rendering based on format and content availability

    const renderHeaderSection = (layout) => {
        const { fontScale, formatSpecs } = layout;
        const fontSize = formatSpecs.fontSize * fontScale;
        const isCompact = formatSpecs.orientation === 'story' || layout.templateConfig.density === 'minimal';

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: `${12 * fontSize}px`
            }}>
                <BrandMark size={isCompact ? "xs" : "sm"} />
                <div style={{ display: 'flex', alignItems: 'center', gap: `${8 * fontSize}px` }}>
                    <span style={{
                        fontSize: `${10 * fontSize}px`,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        {typeName}
                    </span>
                    <span style={{ fontSize: `${13 * fontSize}px` }}>
                        {TYPE_ICONS[typeName] || '🌿'}
                    </span>
                </div>
            </div>
        );
    };

    const renderAnalyticsSection = (layout) => {
        const { fontScale, formatSpecs } = layout;
        const fontSize = formatSpecs.fontSize * fontScale;
        const isCompact = layout.templateConfig.density === 'minimal';

        if (!isSectionVisible('analytics')) return null;

        const cannabinoids = [
            { key: 'thc', value: resolveReviewField('thc'), color: '#F87171', label: 'THC' },
            { key: 'cbd', value: resolveReviewField('cbd'), color: '#34D399', label: 'CBD' },
            { key: 'cbg', value: resolveReviewField('cbg'), color: '#FCD34D', label: 'CBG' },
            { key: 'cbc', value: resolveReviewField('cbc'), color: '#6EE7B7', label: 'CBC' },
            { key: 'cbn', value: resolveReviewField('cbn'), color: '#F9A8D4', label: 'CBN' },
            { key: 'thcv', value: resolveReviewField('thcv'), color: '#C4B5FD', label: 'THCV' }
        ].filter(c => c.value != null && c.value !== '-');

        if (!cannabinoids.length) return null;

        return (
            <div style={{ marginBottom: `${16 * fontSize}px` }}>
                <h3 style={{
                    fontSize: `${14 * fontSize}px`,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    margin: `0 0 ${8 * fontSize}px 0`,
                    display: formatSpecs.orientation === 'story' ? 'none' : 'block'
                }}>
                    Analyse
                </h3>
                <div style={{
                    display: 'flex',
                    gap: `${6 * fontSize}px`,
                    flexWrap: 'wrap',
                    maxHeight: isCompact ? `${40 * fontSize}px` : 'none',
                    overflow: 'hidden'
                }}>
                    {cannabinoids.slice(0, isCompact ? 2 : 6).map(c => (
                        <span key={c.key} style={{
                            padding: `${2 * fontSize}px ${8 * fontSize}px`,
                            borderRadius: '20px',
                            background: `${c.color}15`,
                            border: `1px solid ${c.color}30`,
                            fontSize: `${9 * fontSize}px`,
                            fontWeight: 600,
                            color: c.color
                        }}>
                            {c.label} {Number(c.value).toFixed(1)}%
                        </span>
                    ))}
                    {isCompact && cannabinoids.length > 2 && (
                        <span style={{
                            fontSize: `${8 * fontSize}px`,
                            color: 'rgba(255,255,255,0.3)',
                            alignSelf: 'center'
                        }}>
                            +{cannabinoids.length - 2}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderRatingsSection = (layout) => {
        const { fontScale, formatSpecs } = layout;
        const fontSize = formatSpecs.fontSize * fontScale;
        const isVertical = formatSpecs.orientation === 'portrait' || formatSpecs.orientation === 'story';

        if (!isSectionVisible('rating') && !categories.length) return null;

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${12 * fontSize}px`,
                marginBottom: `${16 * fontSize}px`,
                flexDirection: isVertical && layout.templateConfig.density === 'high' ? 'column' : 'row'
            }}>
                {rating > 0 && (
                    <ScoreGauge
                        score={rating}
                        size={Math.max(48, 56 * fontSize)}
                        label="Note"
                    />
                )}
                {categories.length > 0 && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {renderScoreGroup(
                            categories
                                .slice(0, formatSpecs.maxSections >= 12 ? 6 : 4)
                                .map(c => ({
                                    label: c.label,
                                    value: c.score,
                                    color: c.color
                                })),
                            fontSize
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderVisualSection = (layout) => {
        const { fontScale, formatSpecs } = layout;
        const fontSize = formatSpecs.fontSize * fontScale;

        if (!isSectionVisible('photo') && !isSectionVisible('visual')) return null;

        const visual = templateData.visual || {};
        const texture = templateData.texture || {};
        const isVertical = formatSpecs.orientation === 'portrait' || formatSpecs.orientation === 'story';

        return (
            <div style={{
                marginBottom: `${16 * fontSize}px`,
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                gap: `${14 * fontSize}px`
            }}>
                {/* Photo */}
                {isSectionVisible('photo') && (
                    <div style={{
                        flex: isVertical ? undefined : '0 0 42%',
                        height: isVertical ? `${180 * fontSize}px` : 'auto',
                        borderRadius: `${14 * fontSize}px`,
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(0,0,0,0.2)',
                        minHeight: `${150 * fontSize}px`
                    }}>
                        {imgUrl ? (
                            <img
                                src={imgUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                                alt=""
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgba(255,255,255,0.15)',
                                fontSize: `${40 * fontSize}px`
                            }}>
                                📷
                            </div>
                        )}
                    </div>
                )}

                {/* Visual & Texture Details */}
                {isSectionVisible('visual') && (Object.keys(visual).length > 0 || Object.keys(texture).length > 0) && (
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: `${14 * fontSize}px`,
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.8)',
                            margin: `0 0 ${8 * fontSize}px 0`
                        }}>
                            Visuel
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: formatSpecs.maxSections >= 12 ? 'repeat(2, 1fr)' : '1fr',
                            gap: `${8 * fontSize}px`
                        }}>
                            {Object.entries(visual).filter(([_, value]) => value != null).slice(0, 4).map(([key, value]) =>
                                renderScore(value, key, '#A78BFA', fontSize)
                            )}
                            {Object.entries(texture).filter(([_, value]) => value != null).slice(0, 4).map(([key, value]) =>
                                renderScore(value, key, '#FB7185', fontSize)
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderAromasSection = (layout) => {
        const { fontScale, formatSpecs } = layout;
        const fontSize = formatSpecs.fontSize * fontScale;

        if (!isSectionVisible('odor') && !isSectionVisible('taste')) return null;

        const odor = templateData.odor || {};
        const taste = templateData.taste || {};
        const isCompact = layout.templateConfig.density === 'minimal';

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: formatSpecs.orientation === 'portrait' ? '1fr' :
                                   formatSpecs.maxSections >= 12 ? 'repeat(2, 1fr)' : '1fr',
                gap: `${8 * fontSize}px`,
                marginBottom: `${16 * fontSize}px`
            }}>
                {isSectionVisible('odor') && (odor.dominant?.length || odor.secondary?.length || odor.intensity != null) && (
                    <SectionCard title="Odeur" icon="👃" sectionKey="odor" fontSize={fontSize}>
                        {odor.intensity != null && renderScore(odor.intensity, 'Intensité', '#22C55E', fontSize)}
                        <div style={{ marginTop: `${4 * fontSize}px` }}>
                            {renderList(
                                [...(odor.dominant || []), ...(odor.secondary || [])]
                                    .slice(0, isCompact ? 2 : 6),
                                'rgba(34,197,94,0.12)',
                                '#22C55E',
                                fontSize
                            )}
                        </div>
                    </SectionCard>
                )}

                {isSectionVisible('taste') && (taste.intensity != null || taste.aggressiveness != null ||
                 (taste.dryPuff?.length || taste.inhalation?.length || taste.expiration?.length)) && (
                    <SectionCard title="Goût" icon="😋" sectionKey="taste" fontSize={fontSize}>
                        {renderScoreGroup([
                            taste.intensity != null && { label: 'Intensité', value: taste.intensity, color: '#F59E0B' },
                            taste.aggressiveness != null && { label: 'Agressivité', value: taste.aggressiveness, color: '#FB923C' },
                        ].filter(Boolean), fontSize)}
                        <div style={{ marginTop: `${4 * fontSize}px` }}>
                            {renderList(
                                [...(taste.dryPuff || []), ...(taste.inhalation || []), ...(taste.expiration || [])]
                                    .slice(0, isCompact ? 2 : 6),
                                'rgba(245,158,11,0.12)',
                                '#F59E0B',
                                fontSize
                            )}
                        </div>
                    </SectionCard>
                )}
            </div>
        );
    };

    const renderEffectsSection = (layout) => {
        const { fontScale, formatSpecs } = layout;
        const fontSize = formatSpecs.fontSize * fontScale;

        if (!isSectionVisible('effects')) return null;

        const effects = templateData.effects || {};
        const isCompact = layout.templateConfig.density === 'minimal';

        if (!effects.intensity && !effects.onset && !effects.selected?.length) return null;

        return (
            <div style={{ marginBottom: `${16 * fontSize}px` }}>
                <SectionCard title="Effets" icon="💥" sectionKey="effects" fontSize={fontSize}>
                    {renderScoreGroup([
                        effects.intensity != null && { label: 'Intensité', value: effects.intensity, color: '#06B6D4' },
                        effects.onset != null && { label: 'Montée', value: effects.onset, color: '#34D399' },
                    ].filter(Boolean), fontSize)}
                    {effects.selected?.length > 0 && (
                        <div style={{ marginTop: `${4 * fontSize}px` }}>
                            {renderList(
                                effects.selected.slice(0, isCompact ? 3 : 8),
                                'rgba(6,182,212,0.12)',
                                '#06B6D4',
                                fontSize
                            )}
                        </div>
                    )}
                </SectionCard>
            </div>
        );
    };

    const renderFooterSection = (layout) => {
        const { fontScale, formatSpecs } = layout;
        const fontSize = formatSpecs.fontSize * fontScale;

        return (
            <div style={{
                marginTop: 'auto',
                paddingTop: `${12 * fontSize}px`,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{
                    fontSize: `${9 * fontSize}px`,
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 500
                }}>
                    terpologie.fr
                </div>
                {reviewData?.createdAt && (
                    <div style={{
                        fontSize: `${9 * fontSize}px`,
                        color: 'rgba(255,255,255,0.3)'
                    }}>
                        {new Date(reviewData.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                )}
            </div>
        );
    };

    // Pagination simplifiée — NOW DYNAMIC based on content and format
    const layoutData = calculateOptimalLayout();
    const totalPages = layoutData.pages;
    const safePage = Math.max(0, Math.min(totalPages - 1, 0)); // Start at page 0

    // Template creation functions
    const handleCreateTemplate = async () => {
        if (!templateName.trim()) {
            alert('Veuillez saisir un nom pour le template');
            return;
        }

        try {
            // Capturer la configuration actuelle
            const templateConfig = {
                name: templateName.trim(),
                description: templateDescription.trim(),
                baseTemplate: selectedTemplate,
                format: format,
                watermark: watermark,
                productType: productType,
                createdAt: new Date().toISOString()
            };

            // Sauvegarder via API
            const response = await fetch('/api/library/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(templateConfig)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde du template');
            }

            // Reset form
            setTemplateName('');
            setTemplateDescription('');
            setCreatingTemplate(false);

            alert('Template créé avec succès !');

        } catch (error) {
            console.error('Erreur création template:', error);
            alert('Erreur lors de la création du template');
        }
    };

    const resetTemplateForm = () => {
        setTemplateName('');
        setTemplateDescription('');
        setCreatingTemplate(false);
    };

    const handleExport = async (exportFormat = 'png') => {
        console.debug('[ExportMaker] handleExport called', { exportFormat, exportRefCurrent: !!exportRef.current })
        if (!exportRef.current) {
            console.warn('[ExportMaker] No preview available (exportRef.current is null)')
            alert('Aucune preview disponible pour l\'export. Assurez-vous que la fenêtre d\'aperçu est chargée.')
            return;
        }

        setExporting(true);

        try {
            const node = exportRef.current;
            const scale = highQuality ? 3 : 2;

            // 🔥 ERROR HANDLING FIX: Protect dynamic imports
            if (exportFormat === 'svg') {
                // SVG export requires specialized handling
                try {
                    const { toPng } = await import('html-to-image');
                    const dataUrl = await toPng(node, {
                        quality: 1,
                        pixelRatio: scale,
                        backgroundColor: 'transparent',
                        filter: (node) => {
                            // Filter out any problematic nodes
                            return !node?.classList?.contains?.('no-export');
                        }
                    });

                    // Convert to SVG wrapper for better quality
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();

                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);

                        // Create SVG wrapper
                        const svgContent = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
                                <image href="${dataUrl}" width="${img.width}" height="${img.height}"/>
                            </svg>
                        `;

                        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        blobUrlsRef.current.push(url);

                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${reviewName}.svg`;
                        link.click();
                    };

                    img.src = dataUrl;

                } catch (error) {
                    console.error('SVG export error:', error);
                    throw new Error('SVG export failed. Fallback to PNG.');
                }
            } else if (exportFormat === 'pdf') {
                try {
                    const { toPng } = await import('html-to-image');
                    const jsPDF = (await import('jspdf')).default;

                    const dataUrl = await toPng(node, {
                        quality: 1,
                        pixelRatio: scale,
                        backgroundColor: '#ffffff'
                    });

                    const orientations = {
                        '1:1': 'portrait',
                        '16:9': 'landscape',
                        '9:16': 'portrait',
                        'A4': 'portrait'
                    };

                    const pdf = new jsPDF({
                        orientation: orientations[format] || 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });

                    const imgWidth = pdf.internal.pageSize.getWidth();
                    const imgHeight = (designSize.h / designSize.w) * imgWidth;

                    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
                    pdf.save(`${reviewName}.pdf`);

                } catch (error) {
                    console.error('PDF export error:', error);
                    throw new Error('PDF export failed.');
                }
            } else {
                // PNG/JPEG export
                try {
                    const { toPng, toJpeg } = await import('html-to-image');
                    const exportFn = exportFormat === 'jpeg' ? toJpeg : toPng;

                    const dataUrl = await exportFn(node, {
                        quality: exportFormat === 'jpeg' ? 0.95 : 1,
                        pixelRatio: scale,
                        backgroundColor: exportFormat === 'jpeg' ? '#ffffff' : 'transparent'
                    });

                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = `${reviewName}.${exportFormat}`;
                    blobUrlsRef.current.push(dataUrl);
                    link.click();

                } catch (error) {
                    console.error(`${exportFormat.toUpperCase()} export error:`, error);
                    throw new Error(`${exportFormat.toUpperCase()} export failed.`);
                }
            }

            console.log(`[ExportMaker] ${exportFormat.toUpperCase()} export successful`);

        } catch (error) {
            console.error('[ExportMaker] Export failed:', error);
            alert(`Erreur lors de l'export ${exportFormat.toUpperCase()}: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    const handleExportGIF = async () => {
        console.debug('[ExportMaker] handleExportGIF called');
        if (!exportRef.current) {
            alert('Aucune preview disponible pour l\'export GIF');
            return;
        }

        setExportingGIF(true);
        setGifProgress(0);

        try {
            const frames = await exportPipelineToGIF(
                exportRef.current,
                { steps: 8, duration: 3000 },
                (progress) => setGifProgress(Math.floor(progress * 100))
            );

            await downloadGIF(frames, `${reviewName}.gif`);
            console.log('[ExportMaker] GIF export successful');

        } catch (error) {
            console.error('[ExportMaker] GIF export failed:', error);
            alert('Erreur lors de l\'export GIF: ' + error.message);
        } finally {
            setExportingGIF(false);
            setGifProgress(0);
        }
    };

    // Helper to resolve common field ids into actual review fields
    // 🔧 templateData cache — éviter les re-calculs sur chaque render
    const templateData = React.useMemo(() => {
        if (!reviewData) return {};

        return {
            genetics: resolveReviewField('genetics'),
            analytics: {
                thc: resolveReviewField('thc'),
                cbd: resolveReviewField('cbd'),
                cbg: resolveReviewField('cbg'),
                cbc: resolveReviewField('cbc'),
                cbn: resolveReviewField('cbn'),
                thcv: resolveReviewField('thcv'),
            },
            visual: resolveReviewField('visual'),
            texture: resolveReviewField('texture'),
            odor: resolveReviewField('odor'),
            taste: resolveReviewField('taste'),
            effects: resolveReviewField('effects'),
            terpenes: resolveReviewField('terpenes') || resolveReviewField('terpeneProfile'),
            rating: resolveReviewField('overallRating') || reviewData?.rating || reviewData?.overallRating,
        };
    }, [reviewData]);

    const resolveReviewField = (fieldKey) => {
        if (!reviewData || !fieldKey) return null;

        // 🔧 Cache to avoid repeated JSON parsing
        if (resolveReviewField._cache && resolveReviewField._cache.reviewId === reviewData.id) {
            const cached = resolveReviewField._cache.data[fieldKey];
            if (cached !== undefined) return cached;
        } else {
            resolveReviewField._cache = { reviewId: reviewData.id, data: {} };
        }

        let result = null;

        try {
            // Direct field access first
            if (reviewData[fieldKey] !== undefined) {
                result = reviewData[fieldKey];
            }
            // Backup with product-type-specific naming
            else if (fieldKey === 'genetics') {
                result = reviewData.genetics ||
                         reviewData.strain ||
                         (reviewData.infosProduit ?
                          (typeof reviewData.infosProduit === 'string' ?
                           JSON.parse(reviewData.infosProduit) : reviewData.infosProduit) : null);
            }
            // Sensory data (nested in JSON fields)
            else if (['visual', 'texture', 'odor', 'taste', 'effects', 'terpenes', 'terpeneProfile'].includes(fieldKey)) {
                const checkFields = [
                    'sensoryData', 'sensorielle', 'evaluation',
                    'infosProduit', 'productInfo', 'data'
                ];

                for (const field of checkFields) {
                    if (reviewData[field]) {
                        let parsed = typeof reviewData[field] === 'string' ?
                                    JSON.parse(reviewData[field]) : reviewData[field];

                        if (parsed && parsed[fieldKey]) {
                            result = parsed[fieldKey];
                            break;
                        }
                    }
                }
            }
            // Analytics fields (THC, CBD, etc.)
            else if (['thc', 'cbd', 'cbg', 'cbc', 'cbn', 'thcv', 'labReport', 'labReportUrl'].includes(fieldKey)) {
                const analyticsFields = ['analytics', 'analytiques', 'dosages', 'infosProduit'];

                for (const field of analyticsFields) {
                    if (reviewData[field]) {
                        let parsed = typeof reviewData[field] === 'string' ?
                                    JSON.parse(reviewData[field]) : reviewData[field];

                        if (parsed && parsed[fieldKey] !== undefined) {
                            result = parsed[fieldKey];
                            break;
                        }
                    }
                }
            }
            // Rating fields
            else if (fieldKey === 'overallRating') {
                result = reviewData.overallRating ?? reviewData.rating ?? reviewData.score;
            }

        } catch (error) {
            console.warn(`[resolveReviewField] Error parsing ${fieldKey}:`, error);
            result = null;
        }

        // Cache result
        resolveReviewField._cache.data[fieldKey] = result;
        return result;
    };

    const isSectionVisible = (sectionKey) => {
        const visibility = orchardConfig?.contentModules?.[sectionKey]?.visible;
        return visibility !== false; // true par défaut si pas défini
    };

    // Icons map for product types
    const TYPE_ICONS = {
        flower: '🌸', hash: '🟫', concentrate: '🍯', edible: '🍪',
        fleurs: '🌸', concentré: '🍯', comestible: '🍪'
    };

    // Render modes from orchard config
    const renderModes = orchardConfig?.renderModes || {};

    // Score renderer — supports: 'gauge', 'bar', 'pill', 'number' with adaptive fontSize
    const renderScore = (value, label, color = '#A78BFA', fontSize = 1, mode) => {
        const resolvedMode = mode || renderModes.scores || 'bar';
        if (value == null || value === undefined) return null;
        const num = Number(value);
        if (isNaN(num)) return null;

        switch (resolvedMode) {
            case 'gauge':
                return <ScoreGauge score={num} size={Math.max(32, 40 * fontSize)} label={label} showMax={false} />;
            case 'pill':
                return (
                    <span style={{
                        padding: `${2 * fontSize}px ${8 * fontSize}px`,
                        borderRadius: `${12 * fontSize}px`,
                        background: `${color}20`,
                        fontSize: `${10 * fontSize}px`,
                        fontWeight: 700,
                        color: color,
                        border: `1px solid ${color}30`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: `${4 * fontSize}px`,
                    }}>
                        {label && <span style={{ fontSize: `${8 * fontSize}px`, opacity: 0.7 }}>{label}</span>}
                        {num}/10
                    </span>
                );
            case 'number':
                return (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: `${4 * fontSize}px` }}>
                        <span style={{ fontSize: `${18 * fontSize}px`, fontWeight: 900, color }}>{num}</span>
                        <span style={{ fontSize: `${9 * fontSize}px`, color: 'rgba(255,255,255,0.3)' }}>/10</span>
                        {label && <span style={{ fontSize: `${8 * fontSize}px`, color: 'rgba(255,255,255,0.4)', marginLeft: `${4 * fontSize}px` }}>{label}</span>}
                    </div>
                );
            case 'bar':
            default:
                return <MiniBars
                    items={[{ label: label || '', value: num, color }]}
                    max={10}
                    compact
                    fontSize={fontSize}
                />;
        }
    };

    // Multi-score renderer — for section with multiple score bars with adaptive fontSize
    const renderScoreGroup = (items, fontSize = 1, mode) => {
        const resolvedMode = mode || renderModes.scores || 'bar';
        const validItems = items.filter(Boolean);
        if (!validItems.length) return null;

        if (resolvedMode === 'bar') {
            return <MiniBars
                items={validItems.map(i => ({ label: i.label, value: i.value, color: i.color }))}
                max={10}
                compact
                fontSize={fontSize}
            />;
        }

        return (
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: resolvedMode === 'gauge' ? `${8 * fontSize}px` : `${4 * fontSize}px`
            }}>
                {validItems.map((item, i) => (
                    <div key={i}>{renderScore(item.value, item.label, item.color, fontSize, resolvedMode)}</div>
                ))}
            </div>
        );
    };

    // List renderer — supports: 'pills', 'comma', 'grid' with adaptive fontSize
    const renderList = (items, color = 'rgba(139,92,246,0.15)', textColor = '#A78BFA', fontSize = 1, mode, max = 6) => {
        const resolvedMode = mode || renderModes.lists || 'pills';
        const normalized = (items || []).map(item =>
            typeof item === 'object' ? (item.label || item.name || item.id || String(item)) : String(item)
        ).filter(Boolean);
        if (!normalized.length) return null;

        switch (resolvedMode) {
            case 'comma':
                return (
                    <span style={{
                        fontSize: `${10 * fontSize}px`,
                        color: textColor,
                        lineHeight: 1.5
                    }}>
                        {normalized.slice(0, max).join(', ')}
                        {normalized.length > max && (
                            <span style={{
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: `${8 * fontSize}px`
                            }}>
                                {' '}+{normalized.length - max}
                            </span>
                        )}
                    </span>
                );
            case 'grid':
                return (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                        gap: `${3 * fontSize}px`
                    }}>
                        {normalized.slice(0, max).map((item, i) => (
                            <div key={i} style={{
                                padding: `${3 * fontSize}px ${6 * fontSize}px`,
                                borderRadius: `${6 * fontSize}px`,
                                background: color,
                                fontSize: `${8 * fontSize}px`,
                                fontWeight: 600,
                                color: textColor,
                                textAlign: 'center',
                                border: `1px solid ${textColor}15`,
                            }}>
                                {item}
                            </div>
                        ))}
                    </div>
                );
            case 'pills':
            default:
                return <ExportPills
                    items={normalized}
                    color={color}
                    textColor={textColor}
                    max={max}
                    fontSize={fontSize}
                />;
        }
    };

    // 🔧 FIX: avgScore devrait accepter les scores à 0 (légitimes)
    const avgScore = (obj) => {
        if (!obj || typeof obj !== 'object') return null
        const vals = Object.values(obj).filter(v => typeof v === 'number' && !isNaN(v) && v >= 0)
        if (!vals.length) return null
        return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1))
    }

    const getCategoryScores = () => {
        const visual = resolveReviewField('visual') || {}
        const odor = resolveReviewField('odor') || {}
        const taste = resolveReviewField('taste') || {}
        const effects = resolveReviewField('effects') || {}
        const texture = resolveReviewField('texture') || {}
        return [
            { key: 'visual', label: 'Visuel', score: avgScore(visual), color: '#A78BFA' },
            { key: 'odor', label: 'Odeur', score: avgScore(odor), color: '#22C55E' },
            { key: 'taste', label: 'Goût', score: avgScore(taste), color: '#F59E0B' },
            { key: 'effects', label: 'Effets', score: avgScore(effects), color: '#06B6D4' },
            { key: 'texture', label: 'Texture', score: avgScore(texture), color: '#FB7185' },
        ].filter(c => c.score != null)
    }

    const getMainImage = () => {
        if (!reviewData) return null
        // Multiple image sources possible
        return reviewData.mainImage ||
               reviewData.image ||
               reviewData.photo ||
               (reviewData.gallery && reviewData.gallery[0]) ||
               null
    }

    // Canvas background component
    const CanvasBackground = () => (
        <>
            <div style={{ position: 'absolute', inset: 0, background: previewBackground, zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 15%, rgba(139,92,246,0.10) 0%, transparent 55%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 85%, rgba(16,185,129,0.05) 0%, transparent 45%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)', zIndex: 1 }} />
        </>
    )

    const SectionCard = ({ children, title, icon, noPadding = false, sectionKey, fontSize = 1 }) => {
        const ss = sectionKey ? (orchardConfig?.sectionStyles?.[sectionKey] || {}) : {};
        const cardStyle = {
            background: ss.background || 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: ss.borderRadius != null ? `${ss.borderRadius * fontSize}px` : `${12 * fontSize}px`,
            overflow: 'hidden',
            opacity: ss.opacity != null ? ss.opacity / 100 : 1,
            padding: ss.padding != null ? `${ss.padding * fontSize}px` : undefined,
        };
        if (ss.visible === false) return null;
        return (
            <div
                style={cardStyle}
                {...(sectionKey ? { 'data-orchard-section': sectionKey, 'data-orchard-label': title || sectionKey } : {})}
            >
                {title && (
                    <div style={{
                        padding: `${8 * fontSize}px ${12 * fontSize}px`,
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex', alignItems: 'center', gap: `${6 * fontSize}px`,
                    }}>
                        {icon && <span style={{ fontSize: ss.fontSize ? `${ss.fontSize * fontSize}px` : `${12 * fontSize}px` }}>{icon}</span>}
                        <span style={{
                            fontSize: ss.fontSize ? `${Math.max(8, (ss.fontSize - 2)) * fontSize}px` : `${10 * fontSize}px`,
                            fontWeight: ss.fontWeight || 700,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            color: ss.accentColor || 'rgba(255,255,255,0.5)',
                        }}>{title}</span>
                    </div>
                )}
                <div style={{ padding: noPadding ? 0 : `${10 * fontSize}px ${12 * fontSize}px` }}>
                    {children}
                </div>
            </div>
        );
    }

    const ExportPills = ({ items = [], color = 'rgba(139,92,246,0.15)', textColor = '#A78BFA', max: pillMax = 6, fontSize = 1 }) => {
        const normalized = items.map(item =>
            typeof item === 'object' ? (item.label || item.name || item.id || String(item)) : String(item)
        ).filter(Boolean)
        if (!normalized.length) return null
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${4 * fontSize}px` }}>
                {normalized.slice(0, pillMax).map((item, i) => (
                    <span key={i} style={{
                        padding: `${2 * fontSize}px ${8 * fontSize}px`,
                        borderRadius: `${12 * fontSize}px`,
                        background: color,
                        fontSize: `${9 * fontSize}px`,
                        fontWeight: 600,
                        color: textColor,
                        letterSpacing: '0.02em',
                        border: `1px solid ${textColor}20`,
                    }}>
                        {item}
                    </span>
                ))}
                {normalized.length > pillMax && (
                    <span style={{
                        fontSize: `${9 * fontSize}px`,
                        color: 'rgba(255,255,255,0.3)',
                        alignSelf: 'center'
                    }}>
                        +{normalized.length - pillMax}
                    </span>
                )}
            </div>
        )
    }

    // Brand mark component
    const BrandMark = ({ size = "sm" }) => {
        const sizes = { xs: 12, sm: 16, md: 20 };
        const s = sizes[size] || sizes.sm;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                    width: s, height: s, borderRadius: '4px',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: `${s * 0.6}px`, fontWeight: 900, color: '#fff',
                }}>T</div>
                <span style={{
                    fontSize: `${s * 0.75}px`, fontWeight: 600,
                    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.08em'
                }}>TERPOLOGIE</span>
            </div>
        );
    };

    // Get needed data for rendering
    const typeName = reviewData?.typeName || productType || 'Fleurs';
    const imgUrl = getMainImage();
    const rating = templateData.rating;
    const categories = getCategoryScores();
    const genetics = templateData.genetics || {};

    const renderCanvasContent = () => {
        // Use new adaptive template system with modular sections
        const layout = calculateOptimalLayout();
        const { templateConfig, formatSpecs, fontScale } = layout;

        // Calculate responsive padding based on format
        const basePadding = formatSpecs.orientation === 'portrait' ? 20 :
                           formatSpecs.orientation === 'landscape' ? 28 :
                           formatSpecs.orientation === 'story' ? 16 : 24;
        const padding = `${basePadding * fontScale}px ${(basePadding * 1.2 * fontScale)}px`;

        // Helper to render cannabinoid badges
        const renderCannabinoidBadges = () => {
            const cannabinoids = [
                { key: 'thc', value: resolveReviewField('thc'), color: '#F87171', label: 'THC' },
                { key: 'cbd', value: resolveReviewField('cbd'), color: '#34D399', label: 'CBD' },
                { key: 'cbg', value: resolveReviewField('cbg'), color: '#FCD34D', label: 'CBG' },
                { key: 'cbc', value: resolveReviewField('cbc'), color: '#6EE7B7', label: 'CBC' },
                { key: 'cbn', value: resolveReviewField('cbn'), color: '#F9A8D4', label: 'CBN' },
                { key: 'thcv', value: resolveReviewField('thcv'), color: '#C4B5FD', label: 'THCV' }
            ].filter(c => c.value != null && c.value !== '-' && c.value !== '0');

            if (!cannabinoids.length) return null;

            return (
                <div style={{
                    display: 'flex',
                    gap: `${4 * fontScale}px`,
                    flexWrap: 'wrap',
                    marginTop: `${6 * fontScale}px`
                }}>
                    {cannabinoids.map(c => (
                        <span key={c.key} style={{
                            padding: `${2 * fontScale}px ${6 * fontScale}px`,
                            borderRadius: '16px',
                            background: `${c.color}15`,
                            border: `1px solid ${c.color}30`,
                            fontSize: `${8 * fontScale}px`,
                            fontWeight: 600,
                            color: c.color
                        }}>
                            {c.label} {Number(c.value).toFixed(1)}%
                        </span>
                    ))}
                </div>
            );
        };

        // Helper to render terpenes
        const renderTerpenes = () => {
            const terpenes = resolveReviewField('terpenes') || resolveReviewField('terpeneProfile') || [];
            const normTerpenes = Array.isArray(terpenes) ? terpenes : [];
            const topTerpenes = normTerpenes
                .filter(t => t && t.percentage != null && t.percentage > 0)
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, formatSpecs.orientation === 'story' ? 3 : 6);

            if (!topTerpenes.length) return null;

            return (
                <div style={{ marginBottom: `${12 * fontScale}px` }}>
                    <h3 style={{
                        fontSize: `${12 * fontScale}px`,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.7)',
                        margin: `0 0 ${6 * fontScale}px 0`
                    }}>
                        Terpènes
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${3 * fontScale}px`
                    }}>
                        {topTerpenes.map((terp, i) => (
                            <TerpeneBar
                                key={i}
                                name={terp.name}
                                percentage={terp.percentage}
                                compact
                                fontSize={fontScale}
                            />
                        ))}
                    </div>
                </div>
            );
        };

        // Comprehensive sections rendering based on template
        const isMinimal = templateConfig.density === 'minimal';
        const isCompact = templateConfig.density === 'low' || formatSpecs.orientation === 'story';
        const isDetailed = templateConfig.density === 'high';

        return (
            <>
                <CanvasBackground />
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    padding: padding,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${12 * fontScale}px`,
                    fontFamily: `"${previewFont}", Inter, system-ui, sans-serif`,
                    overflow: 'hidden'
                }}>
                    {/* Header with branding and product type */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: `${8 * fontScale}px`
                    }}>
                        <BrandMark size={isMinimal ? "xs" : "sm"} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: `${6 * fontScale}px` }}>
                            <span style={{
                                fontSize: `${9 * fontScale}px`,
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.4)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                {typeName}
                            </span>
                            <span style={{ fontSize: `${12 * fontScale}px` }}>
                                {TYPE_ICONS[typeName] || '🌿'}
                            </span>
                        </div>
                    </div>

                    {/* Main Content Layout */}
                    <div style={{
                        display: 'flex',
                        flexDirection: formatSpecs.orientation === 'portrait' || formatSpecs.orientation === 'story' ? 'column' : 'row',
                        gap: `${14 * fontScale}px`,
                        flex: 1,
                        minHeight: 0
                    }}>
                        {/* Photo and Basic Info Section */}
                        <div style={{
                            flex: formatSpecs.orientation === 'landscape' ? '0 0 42%' : undefined,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: `${10 * fontScale}px`
                        }}>
                            {/* Product Image */}
                            {imgUrl && (
                                <div style={{
                                    height: formatSpecs.orientation === 'portrait' ? `${160 * fontScale}px` :
                                           formatSpecs.orientation === 'story' ? `${120 * fontScale}px` : 'auto',
                                    aspectRatio: formatSpecs.orientation === 'landscape' ? '1' : undefined,
                                    borderRadius: `${12 * fontScale}px`,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)'
                                }}>
                                    <img
                                        src={imgUrl}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                        alt={reviewName}
                                    />
                                </div>
                            )}

                            {/* Title and Basic Info */}
                            <div>
                                <h1 style={{
                                    fontSize: `${isMinimal ? 18 : 22} * ${fontScale}px`,
                                    fontWeight: 900,
                                    color: '#fff',
                                    margin: 0,
                                    lineHeight: 1.1,
                                    marginBottom: `${4 * fontScale}px`
                                }}>
                                    {reviewName || 'Sans nom'}
                                </h1>

                                {/* Genetics info */}
                                {genetics && (genetics.breeder || genetics.variety || genetics.indicaPercent != null) && (
                                    <div style={{
                                        display: 'flex',
                                        gap: `${3 * fontScale}px`,
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        marginBottom: `${4 * fontScale}px`
                                    }}>
                                        {genetics.breeder && (
                                            <span style={{
                                                fontSize: `${8 * fontScale}px`,
                                                color: 'rgba(255,255,255,0.5)',
                                                fontWeight: 600
                                            }}>
                                                {genetics.breeder}
                                            </span>
                                        )}
                                        {genetics.variety && (
                                            <span style={{
                                                fontSize: `${8 * fontScale}px`,
                                                color: 'rgba(255,255,255,0.4)'
                                            }}>
                                                {genetics.breeder ? '·' : ''} {genetics.variety}
                                            </span>
                                        )}
                                        {genetics.indicaPercent != null && (
                                            <span style={{
                                                fontSize: `${7 * fontScale}px`,
                                                color: 'rgba(139,92,246,0.8)',
                                                background: 'rgba(139,92,246,0.1)',
                                                padding: `${1 * fontScale}px ${4 * fontScale}px`,
                                                borderRadius: `${6 * fontScale}px`
                                            }}>
                                                {genetics.indicaPercent}% I
                                            </span>
                                        )}
                                        {genetics.sativaPercent != null && (
                                            <span style={{
                                                fontSize: `${7 * fontScale}px`,
                                                color: 'rgba(34,197,94,0.8)',
                                                background: 'rgba(34,197,94,0.1)',
                                                padding: `${1 * fontScale}px ${4 * fontScale}px`,
                                                borderRadius: `${6 * fontScale}px`
                                            }}>
                                                {genetics.sativaPercent}% S
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Cannabinoids badges */}
                                {renderCannabinoidBadges()}
                            </div>
                        </div>

                        {/* Details and Scores Section */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: `${10 * fontScale}px`,
                            minHeight: 0,
                            overflow: 'hidden'
                        }}>
                            {/* Overall Rating and Category Scores */}
                            {(rating > 0 || categories.length > 0) && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: `${12 * fontScale}px`,
                                    marginBottom: `${8 * fontScale}px`
                                }}>
                                    {rating > 0 && (
                                        <ScoreGauge
                                            score={rating}
                                            size={Math.max(40, 48 * fontScale)}
                                            label="Note"
                                        />
                                    )}
                                    {categories.length > 0 && (
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <MiniBars
                                                items={categories.slice(0, isMinimal ? 3 : 5).map(c => ({
                                                    label: c.label,
                                                    value: c.score,
                                                    color: c.color
                                                }))}
                                                max={10}
                                                compact
                                                fontSize={fontScale}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Terpenes */}
                            {!isMinimal && renderTerpenes()}

                            {/* Sensorial Grid - Only for detailed templates */}
                            {isDetailed && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: formatSpecs.orientation === 'portrait' ? '1fr' :
                                                       formatSpecs.maxSections >= 12 ? 'repeat(2, 1fr)' : '1fr',
                                    gap: `${6 * fontScale}px`,
                                    flex: 1,
                                    minHeight: 0,
                                    overflow: 'hidden'
                                }}>
                                    {/* Odor */}
                                    {(() => {
                                        const odor = templateData.odor || {};
                                        if (!odor.intensity && !odor.dominant?.length && !odor.secondary?.length) return null;
                                        return (
                                            <SectionCard title="Odeur" icon="👃" sectionKey="odor" fontSize={fontScale}>
                                                {odor.intensity != null && renderScore(odor.intensity, 'Intensité', '#22C55E', fontScale)}
                                                {(odor.dominant?.length || odor.secondary?.length) && (
                                                    <div style={{ marginTop: `${4 * fontScale}px` }}>
                                                        {renderList(
                                                            [...(odor.dominant || []), ...(odor.secondary || [])].slice(0, 4),
                                                            'rgba(34,197,94,0.12)',
                                                            '#22C55E',
                                                            fontScale,
                                                            undefined,
                                                            4
                                                        )}
                                                    </div>
                                                )}
                                            </SectionCard>
                                        );
                                    })()}

                                    {/* Taste */}
                                    {(() => {
                                        const taste = templateData.taste || {};
                                        if (!taste.intensity && !taste.aggressiveness && !taste.dryPuff?.length && !taste.inhalation?.length && !taste.expiration?.length) return null;
                                        return (
                                            <SectionCard title="Goût" icon="😋" sectionKey="taste" fontSize={fontScale}>
                                                {(taste.intensity != null || taste.aggressiveness != null) && (
                                                    <div style={{ marginBottom: `${4 * fontScale}px` }}>
                                                        <MiniBars
                                                            items={[
                                                                taste.intensity != null && { label: 'Int.', value: taste.intensity, color: '#F59E0B' },
                                                                taste.aggressiveness != null && { label: 'Agr.', value: taste.aggressiveness, color: '#FB923C' }
                                                            ].filter(Boolean)}
                                                            max={10}
                                                            compact
                                                            fontSize={fontScale}
                                                        />
                                                    </div>
                                                )}
                                                {(taste.dryPuff?.length || taste.inhalation?.length || taste.expiration?.length) && (
                                                    renderList(
                                                        [...(taste.dryPuff || []), ...(taste.inhalation || []), ...(taste.expiration || [])].slice(0, 4),
                                                        'rgba(245,158,11,0.12)',
                                                        '#F59E0B',
                                                        fontScale,
                                                        undefined,
                                                        4
                                                    )
                                                )}
                                            </SectionCard>
                                        );
                                    })()}

                                    {/* Effects */}
                                    {(() => {
                                        const effects = templateData.effects || {};
                                        if (!effects.intensity && !effects.onset && !effects.selected?.length) return null;
                                        return (
                                            <SectionCard title="Effets" icon="💥" sectionKey="effects" fontSize={fontScale}>
                                                {(effects.intensity != null || effects.onset != null) && (
                                                    <div style={{ marginBottom: `${4 * fontScale}px` }}>
                                                        <MiniBars
                                                            items={[
                                                                effects.intensity != null && { label: 'Int.', value: effects.intensity, color: '#06B6D4' },
                                                                effects.onset != null && { label: 'Mont.', value: effects.onset, color: '#34D399' }
                                                            ].filter(Boolean)}
                                                            max={10}
                                                            compact
                                                            fontSize={fontScale}
                                                        />
                                                    </div>
                                                )}
                                                {effects.selected?.length > 0 && (
                                                    renderList(
                                                        effects.selected.slice(0, 5),
                                                        'rgba(6,182,212,0.12)',
                                                        '#06B6D4',
                                                        fontScale,
                                                        undefined,
                                                        5
                                                    )
                                                )}
                                            </SectionCard>
                                        );
                                    })()}

                                    {/* Visual & Texture for concentrates */}
                                    {(() => {
                                        const visual = templateData.visual || {};
                                        const texture = templateData.texture || {};
                                        const hasVisualData = Object.values(visual).some(v => v != null);
                                        const hasTextureData = Object.values(texture).some(v => v != null);

                                        if (!hasVisualData && !hasTextureData) return null;
                                        return (
                                            <SectionCard title="Aspect" icon="🔍" sectionKey="visual" fontSize={fontScale}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: `${3 * fontScale}px` }}>
                                                    {Object.entries(visual).filter(([_, value]) => value != null).slice(0, 2).map(([key, value]) =>
                                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: `${6 * fontScale}px` }}>
                                                            <span style={{ fontSize: `${7 * fontScale}px`, color: 'rgba(255,255,255,0.5)', minWidth: `${35 * fontScale}px` }}>{key}</span>
                                                            <div style={{ flex: 1, height: `${3 * fontScale}px`, background: 'rgba(167,139,250,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${(value / 10) * 100}%`, height: '100%', background: '#A78BFA' }} />
                                                            </div>
                                                            <span style={{ fontSize: `${7 * fontScale}px`, color: '#A78BFA', fontWeight: 600, minWidth: `${12 * fontScale}px` }}>{value}</span>
                                                        </div>
                                                    )}
                                                    {Object.entries(texture).filter(([_, value]) => value != null).slice(0, 2).map(([key, value]) =>
                                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: `${6 * fontScale}px` }}>
                                                            <span style={{ fontSize: `${7 * fontScale}px`, color: 'rgba(255,255,255,0.5)', minWidth: `${35 * fontScale}px` }}>{key}</span>
                                                            <div style={{ flex: 1, height: `${3 * fontScale}px`, background: 'rgba(251,113,133,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${(value / 10) * 100}%`, height: '100%', background: '#FB7185' }} />
                                                            </div>
                                                            <span style={{ fontSize: `${7 * fontScale}px`, color: '#FB7185', fontWeight: 600, minWidth: `${12 * fontScale}px` }}>{value}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </SectionCard>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: 'auto',
                        paddingTop: `${8 * fontScale}px`,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            fontSize: `${8 * fontScale}px`,
                            color: 'rgba(255,255,255,0.3)',
                            fontWeight: 500
                        }}>
                            terpologie.fr
                        </div>
                        {reviewData?.createdAt && (
                            <div style={{
                                fontSize: `${8 * fontScale}px`,
                                color: 'rgba(255,255,255,0.3)'
                            }}>
                                {new Date(reviewData.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-6">
            <LiquidGlass variant="modal" hover={false} className="w-full sm:max-w-6xl flex flex-col sm:flex-row overflow-hidden relative z-[10002] rounded-t-2xl sm:rounded-2xl h-[calc(100svh_-_1rem)] sm:h-[calc(100svh_-_5rem)] sm:max-h-[880px]">

                {/* Sidebar options */}
                <div className="order-2 sm:order-1 flex-1 sm:flex-none w-full sm:w-80 border-t sm:border-t-0 sm:border-r border-white/10 flex flex-col bg-white/5 min-h-0">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0 bg-white/5 z-10">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                            <Download className="w-5 h-5" />
                            Export
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-4 space-y-6">

                            {/* Template Selection */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                                    <Layout className="w-4 h-4" />
                                    Template
                                </h3>
                                <div className="space-y-2">
                                    {templates.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template.id)}
                                            className={`w-full p-3 rounded-lg border transition-all text-left ${selectedTemplate === template.id
                                                ? 'border-purple-500/50 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <template.icon className="w-4 h-4 text-purple-400 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-white">{template.name}</div>
                                                    <div className="text-xs text-white/50 truncate">{template.description}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 mb-3">Format</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: '1:1', name: 'Carré', ratio: '1:1', desc: 'Instagram Post' },
                                        { id: '16:9', name: 'Paysage', ratio: '16:9', desc: 'YouTube, desktop' },
                                        { id: '9:16', name: 'Portrait', ratio: '9:16', desc: 'Stories, mobile' },
                                        { id: 'A4', name: 'A4', ratio: 'A4', desc: 'Print, document' }
                                    ].map(fmt => (
                                        <button
                                            key={fmt.id}
                                            onClick={() => setFormat(fmt.id)}
                                            className={`p-3 rounded-lg border text-left transition-all ${format === fmt.id
                                                ? 'border-purple-500/50 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="text-sm font-medium text-white">{fmt.name}</div>
                                            <div className="text-xs text-white/50">{fmt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Export Options */}
                            <div>
                                <h3 className="text-sm font-semibold text-white/70 mb-3">Options</h3>
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={highQuality}
                                        onChange={(e) => setHighQuality(e.target.checked)}
                                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500/50"
                                        disabled={!canExportAdvanced}
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm text-white">Haute qualité</div>
                                        <div className="text-xs text-white/50">3x resolution</div>
                                    </div>
                                    {!canExportAdvanced && (
                                        <div className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">Pro</div>
                                    )}
                                </label>
                            </div>

                            {/* Template Creation */}
                            {canCreateCustomTemplate && (
                                <div>
                                    <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Créer un template
                                    </h3>
                                    {!creatingTemplate ? (
                                        <button
                                            onClick={() => setCreatingTemplate(true)}
                                            className="w-full p-3 rounded-lg border border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 hover:text-purple-200 transition-colors text-sm font-medium"
                                        >
                                            + Nouveau template
                                        </button>
                                    ) : (
                                        <div className="space-y-3 p-3 rounded-lg border border-white/10 bg-white/5">
                                            <input
                                                type="text"
                                                placeholder="Nom du template"
                                                value={templateName}
                                                onChange={(e) => setTemplateName(e.target.value)}
                                                className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50"
                                            />
                                            <textarea
                                                placeholder="Description (optionnelle)"
                                                value={templateDescription}
                                                onChange={(e) => setTemplateDescription(e.target.value)}
                                                className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/15 text-white placeholder-white/40 text-sm resize-none h-16 focus:outline-none focus:border-purple-500/50"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleCreateTemplate}
                                                    disabled={!templateName.trim()}
                                                    className="flex-1 px-3 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white text-sm font-medium transition-colors"
                                                >
                                                    Créer
                                                </button>
                                                <button
                                                    onClick={resetTemplateForm}
                                                    className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Export Actions - Compact Footer */}
                    <div className="p-4 border-t border-white/10 bg-white/5 space-y-3 flex-shrink-0">
                        {/* Primary export */}
                        <button
                            onClick={() => handleExport('png')}
                            disabled={exporting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium transition-colors"
                        >
                            {exporting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Export en cours...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Exporter PNG
                                </>
                            )}
                        </button>

                        {/* Secondary export grid */}
                        <div className="grid grid-cols-3 gap-2">
                            <FeatureGate
                                type="export"
                                feature="formats.jpeg"
                                fallback={
                                    <button disabled className="w-full px-3 py-2 rounded-md bg-white/10 text-white/50 text-xs font-medium opacity-50 cursor-not-allowed">
                                        JPEG
                                    </button>
                                }
                            >
                                <button
                                    onClick={() => handleExport('jpeg')}
                                    disabled={exporting}
                                    className="w-full px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:bg-white/10 text-white text-xs font-medium transition-colors"
                                >
                                    JPEG
                                </button>
                            </FeatureGate>

                            <FeatureGate
                                type="export"
                                feature="formats.svg"
                                fallback={
                                    <button disabled className="w-full px-3 py-2 rounded-md bg-white/10 text-white/50 text-xs font-medium opacity-50 cursor-not-allowed">
                                        SVG
                                    </button>
                                }
                            >
                                <button
                                    onClick={() => handleExport('svg')}
                                    disabled={exporting}
                                    className="w-full px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:bg-white/10 text-white text-xs font-medium transition-colors"
                                >
                                    SVG
                                </button>
                            </FeatureGate>

                            <FeatureGate
                                type="export"
                                feature="formats.pdf"
                                fallback={
                                    <button disabled className="w-full px-3 py-2 rounded-md bg-white/10 text-white/50 text-xs font-medium opacity-50 cursor-not-allowed">
                                        PDF
                                    </button>
                                }
                            >
                                <button
                                    onClick={() => handleExport('pdf')}
                                    disabled={exporting}
                                    className="w-full px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:bg-white/10 text-white text-xs font-medium transition-colors"
                                >
                                    PDF
                                </button>
                            </FeatureGate>
                        </div>

                        {/* GIF export row */}
                        <FeatureGate
                            type="export"
                            feature="features.dragDrop"
                            fallback={null}
                        >
                            <button
                                onClick={handleExportGIF}
                                disabled={exportingGIF}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 disabled:bg-white/10 text-white text-sm font-medium transition-colors"
                            >
                                {exportingGIF ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        GIF {gifProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Film className="w-4 h-4" />
                                        Export GIF animé
                                    </>
                                )}
                            </button>
                        </FeatureGate>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="order-1 sm:order-2 flex shrink-0 sm:shrink sm:flex-1 h-[40vh] sm:h-auto bg-gradient-to-br from-gray-900 to-black p-4 flex items-center justify-center relative">
                    <div ref={previewAreaRef} className="w-full h-full flex items-center justify-center">
                        <div
                            ref={exportRef}
                            style={{
                                width: `${designSize.w}px`,
                                height: `${designSize.h}px`,
                                transform: `scale(${canvasScale})`,
                                transformOrigin: 'center',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {renderCanvasContent()}
                        </div>
                    </div>

                    {/* Watermark overlay */}
                    {watermark.visible && (
                        <div
                            style={{
                                position: 'absolute',
                                left: `${watermark.position.x}%`,
                                top: `${watermark.position.y}%`,
                                transform: `translate(-50%, -50%) rotate(${watermark.rotation}deg)`,
                                fontSize: `${watermark.size}px`,
                                opacity: watermark.opacity / 100,
                                color: watermark.color,
                                fontWeight: 'bold',
                                pointerEvents: 'none',
                                zIndex: 100,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                whiteSpace: 'nowrap',
                                userSelect: 'none'
                            }}
                        >
                            {watermark.content || 'Terpologie'}
                        </div>
                    )}
                </div>

            </LiquidGlass>
        </div>
    );
};

export default ExportMaker;