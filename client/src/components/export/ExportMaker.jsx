import React, { useState, useRef, useEffect } from 'react';
// Note: heavy export libs (html-to-image, jspdf) are dynamically imported only when the user triggers an export
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, Palette,
    Grid, Layout, Maximize2, Save, X, ChevronsRight,
    Share2, Film
} from 'lucide-react';
import LiquidGlass from '../ui/LiquidGlass';
import { useAccountType } from '../../hooks/useAccountType';
import { useAuth } from '../../hooks/useAuth';
import { FeatureGate } from '../account/FeatureGate';
import DragDropExport from './DragDropExport';
import WatermarkEditor from './WatermarkEditor';
import { exportPipelineToGIF, downloadGIF } from '../../utils/GIFExporter';
import { DEFAULT_TEMPLATES } from '../../store/orchardConstants';
import { getModulesByProductType } from '../../utils/orchard/moduleMappings';
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
 * Intègre Drag & Drop (Phase 5) et Filigranes
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

    const { isPremium, isProducer, isConsumer, isInfluencer, permissions, canAccess } = useAccountType();
    const canExportSVG = permissions.export?.formats?.svg === true;
    const canExportAdvanced = permissions.export?.quality?.high === true;
    const canUseCustomLayout = permissions.export?.templates?.custom === true;
    const canExportGIF = permissions.export?.features?.dragDrop === true;
    const exportRef = useRef(null);
    const previewAreaRef = useRef(null);
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
    const [customSections, setCustomSections] = useState([]);
    const [exporting, setExporting] = useState(false);
    const [exportingGIF, setExportingGIF] = useState(false);
    const [gifProgress, setGifProgress] = useState(0);
    const [sidebarTab, setSidebarTab] = useState('template'); // 'template' | 'contenu' | 'apparence' | 'prereglages'

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

    // Modules relevant to this product type
    const relevantModules = getModulesByProductType(productType || productKey);

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

    // Pagination simplifiée — pas de système d'éléments, le contenu est contrôlé par les renderers
    const totalPages = 1;
    const [currentPage, setCurrentPage] = useState(0);
    const safePage = 0;

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
            const node = exportRef.current;
            const scale = highQuality ? 3 : 2;

            // lazy-load heavy export libraries only when needed
            const { toPng, toJpeg, toSvg } = await import('html-to-image');
            let jsPDF;
            if (exportFormat === 'pdf') {
                ({ jsPDF } = await import('jspdf'));
            }

            // PNG
            if (exportFormat === 'png') {
                const dataUrl = await toPng(node, {
                    cacheBust: true,
                    pixelRatio: scale,
                    backgroundColor: null,
                    style: { transform: 'none' }
                });
                const link = document.createElement('a');
                link.download = `review-${reviewName.replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
                return;
            }

            // JPEG
            if (exportFormat === 'jpg' || exportFormat === 'jpeg') {
                const dataUrl = await toJpeg(node, {
                    cacheBust: true,
                    quality: highQuality ? 0.95 : 0.92,
                    pixelRatio: scale,
                    backgroundColor: '#ffffff',
                    style: { transform: 'none' }
                });
                const link = document.createElement('a');
                link.download = `review-${reviewName.replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.jpg`;
                link.href = dataUrl;
                link.click();
                return;
            }

            // SVG
            if (exportFormat === 'svg') {
                const svgString = await toSvg(node, {
                    cacheBust: true,
                    width: node.offsetWidth,
                    height: node.offsetHeight,
                    style: { transform: 'none' }
                });
                const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `review-${reviewName.replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.svg`;
                link.href = url;
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 20000);
                return;
            }

            // PDF
            if (exportFormat === 'pdf') {
                const dataUrl = await toPng(node, {
                    cacheBust: true,
                    pixelRatio: scale,
                    backgroundColor: '#ffffff',
                    style: { transform: 'none' }
                });

                const isLandscapeFormat = format === '16:9' || format === '4:3';
                const pdf = new jsPDF({
                    orientation: isLandscapeFormat ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                const img = new Image();
                img.src = dataUrl;
                await img.decode();

                const imgRatio = img.width / img.height;
                const pageRatio = pageWidth / pageHeight;

                let imgWidth, imgHeight;
                if (imgRatio > pageRatio) {
                    imgWidth = pageWidth - 20;
                    imgHeight = imgWidth / imgRatio;
                } else {
                    imgHeight = pageHeight - 20;
                    imgWidth = imgHeight * imgRatio;
                }

                const x = (pageWidth - imgWidth) / 2;
                const y = (pageHeight - imgHeight) / 2;

                pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
                pdf.setProperties({
                    title: reviewName || 'Review',
                    author: reviewData.author?.username || reviewData.author || 'Reviews-Maker'
                });
                pdf.save(`review-${reviewName.replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.pdf`);
                return;
            }

            // default fallback to png
            const fallbackDataUrl = await toPng(node, { cacheBust: true, pixelRatio: scale, backgroundColor: null, style: { transform: 'none' } });
            const link = document.createElement('a');
            link.download = `review-${reviewName.replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.png`;
            link.href = fallbackDataUrl;
            link.click();

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
            reviewData?.pipelineExtraction || reviewData?.pipelinePurification || reviewData?.fertilizationPipeline || reviewData?.pipelineCuring;

        if (!hasPipeline) {
            alert('Cette review ne contient aucun pipeline à exporter en GIF.');
            return;
        }

        setExportingGIF(true);
        setGifProgress(0);

        try {
            // Récupérer le premier pipeline disponible (supporter plus de types)
            const pipelineData = reviewData.pipelineGlobal ||
                reviewData.pipelineSeparation ||
                reviewData.pipelineExtraction ||
                reviewData.pipelinePurification ||
                reviewData.fertilizationPipeline ||
                reviewData.pipelineCuring;

            const blob = await exportPipelineToGIF(pipelineData, exportRef.current, {
                delay: 200,
                quality: 10,
                onProgress: (percent) => setGifProgress(percent)
            });

            const filename = `review-${reviewName}-pipeline-${Date.now()}.gif`;
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
    // Searches: top-level reviewData → type-specific sub-object (flowerData/hashData/etc.) → extraData
    const resolveReviewField = (id) => {
        const f = reviewData || {};
        // Type-specific sub-object
        const sub = f.flowerData || f.hashData || f.concentrateData || f.edibleData || {};

        // Lookup helper: checks top-level, sub-object, then extraData
        const lookup = (...keys) => {
            for (const k of keys) {
                if (!k) continue;
                if (f[k] !== undefined && f[k] !== null && f[k] !== '') return f[k];
                if (sub[k] !== undefined && sub[k] !== null && sub[k] !== '') return sub[k];
                if (f.extraData && typeof f.extraData === 'object' && f.extraData[k] !== undefined && f.extraData[k] !== null && f.extraData[k] !== '') return f.extraData[k];
            }
            return undefined;
        };
        // Parse JSON strings from DB into arrays/objects
        const parseJSON = (v, def = []) => {
            if (!v) return def
            if (Array.isArray(v)) return v
            if (typeof v === 'object' && v !== null) return v
            try { return JSON.parse(v) } catch { return def }
        }

        switch (id) {
            case 'productName':
            case 'product_name':
                return lookup('holderName', 'nomCommercial', 'productName', 'name', 'title') || '-';

            case 'photo':
            case 'mainImage':
            case 'mainImageUrl':
                // Prefer pre-resolved mainImageUrl from API, then build from images array
                return lookup('mainImageUrl') || null;

            case 'photos':
            case 'gallery':
            case 'images':
                return parseJSON(lookup('images', 'gallery', 'photos'), []);

            case 'genetics':
                // Retourne un objet complet pour un rendu riche
                return {
                    breeder: lookup('breeder') || null,
                    variety: lookup('variety', 'cultivar', 'cultivars') || null,
                    geneticType: lookup('geneticType', 'varietyType', 'strainType') || null,
                    indicaPercent: lookup('indicaPercent') ?? null,
                    sativaPercent: lookup('sativaPercent') ?? null,
                    phenotype: lookup('phenotypeCode', 'phenotype') || null,
                    parentage: parseJSON(lookup('parentage'), null),
                };

            case 'genetics_str':
                // Version string pour compatibilité descendante
                return lookup('breeder', 'variety', 'cultivar', 'geneticType') || null;

            case 'breeder':
                return lookup('breeder') || '-';

            case 'farm':
                return lookup('farm') || '-';

            case 'cultivar':
                return lookup('cultivar', 'cultivars', 'variety') || '-';

            case 'varietyType':
                return lookup('varietyType', 'strainType') || null;

            case 'thc':
            case 'thcPercent':
                return lookup('thcPercent', 'thcLevel', 'thc') ?? '-';

            case 'cbd':
            case 'cbdPercent':
                return lookup('cbdPercent', 'cbdLevel', 'cbd') ?? '-';

            case 'cbg':
                return lookup('cbgPercent', 'cbg') ?? null;

            case 'cbc':
                return lookup('cbcPercent', 'cbc') ?? null;

            case 'cbn':
                return lookup('cbnPercent', 'cbn') ?? null;

            case 'thcv':
                return lookup('thcvPercent', 'thcv') ?? null;

            case 'labReport':
            case 'labReportUrl':
                return lookup('labReportUrl', 'labReport') || null;

            case 'laboratoire':
                return lookup('laboratoire') || null;

            case 'terpeneProfile':
            case 'terpenes':
                return parseJSON(lookup('terpeneProfile', 'terpenes'), []);

            case 'visual':
                return {
                    couleur: lookup('couleurScore', 'couleur', 'couleurTransparence') ?? null,
                    densite: lookup('densiteVisuelle', 'densite', 'pureteVisuelle') ?? null,
                    trichomes: lookup('trichomesScore', 'trichome') ?? null,
                    pistils: lookup('pistilsScore', 'pistil') ?? null,
                    manucure: lookup('manucureScore', 'manucure') ?? null,
                    moisissure: lookup('moisissureScore', 'moisissure') ?? null,
                    graines: lookup('grainesScore', 'graines') ?? null,
                    // Hash/Concentrate specific
                    transparence: lookup('couleurTransparence') ?? null,
                    viscosite: lookup('viscosite') ?? null,
                    melting: lookup('melting') ?? null,
                    residus: lookup('residus') ?? null,
                };

            case 'odor':
            case 'odors':
                return {
                    dominant: parseJSON(lookup('notesOdeursDominantes', 'notesDominantesOdeur', 'notesDominantes', 'aromas'), []),
                    secondary: parseJSON(lookup('notesOdeursSecondaires', 'notesSecondairesOdeur', 'notesSecondaires'), []),
                    intensity: lookup('intensiteAromeScore', 'intensiteAromatique', 'aromasIntensity') ?? null,
                    complexity: lookup('complexiteAromeScore') ?? null,
                    fidelity: lookup('fideliteAromeScore', 'fideliteCultivars') ?? null,
                };

            case 'taste':
            case 'tastes':
                return {
                    intensity: lookup('intensiteGoutScore', 'intensite', 'intensiteFumee', 'tastesIntensity', 'goutIntensity', 'intensiteGout') ?? null,
                    aggressiveness: lookup('agressiviteScore', 'agressivitePiquant', 'agressivite') ?? null,
                    dryPuff: parseJSON(lookup('dryPuffNotes', 'dryPuff'), []),
                    inhalation: parseJSON(lookup('inhalationNotes', 'inhalation'), []),
                    expiration: parseJSON(lookup('expirationNotes', 'expiration'), []),
                };

            case 'effects': {
                const arr = parseJSON(lookup('effetsChoisis', 'effects', 'selectedEffects'), []);
                return {
                    selected: arr,
                    intensity: lookup('intensiteEffetScore', 'intensiteEffets', 'intensiteEffet', 'effectsIntensity') ?? null,
                    onset: lookup('monteeScore', 'monteeRapidite', 'montee') ?? null,
                    duration: lookup('effectDuration', 'dureeEffet', 'dureeEffets') || null,
                    method: lookup('consumptionMethod', 'methodeConsommation') || null,
                    dosage: lookup('dosage', 'dosageUtilise') || null,
                    dosageUnit: lookup('dosageUnit') || null,
                    onset_text: lookup('effectOnset', 'debutEffets') || null,
                    length: lookup('effectLength', 'dureeEffetsCategorie') || null,
                    profiles: parseJSON(lookup('effectProfiles', 'profilsEffets'), []),
                    sideEffects: parseJSON(lookup('sideEffects', 'effetsSecondaires'), []),
                    preferredUse: parseJSON(lookup('preferredUse', 'usagesPreferes'), []),
                };
            }

            case 'cultivarsList':
            case 'cultivars':
                return parseJSON(lookup('cultivarsList', 'cultivars'), []);

            case 'substratMix':
                return parseJSON(lookup('substratMix', 'substrat', 'cultureSubstrat'), []);

            case 'categoryRatings':
                return lookup('categoryRatings', 'sectionScores', 'ratings') || undefined;

            case 'overallRating':
            case 'rating':
                return lookup('computedOverall', 'overallRating', 'note', 'rating') || null;

            case 'culture':
                return {
                    config: parseJSON(lookup('cultureTimelineConfig'), {}),
                    data: parseJSON(lookup('cultureTimelineData'), []),
                    mode: lookup('cultureMode') || null,
                };

            case 'curing':
                return {
                    config: parseJSON(lookup('curingTimelineConfig'), {}),
                    data: parseJSON(lookup('curingTimelineData', 'cureTimelineData'), []),
                };

            case 'texture':
                return {
                    hardness: lookup('dureteScore', 'durete') ?? null,
                    density: lookup('densiteTactileScore', 'densiteTexture') ?? null,
                    elasticity: lookup('elasticiteScore', 'elasticite') ?? null,
                    stickiness: lookup('collantScore', 'collant') ?? null,
                    melting: lookup('meltingScore', 'meltingResidus') ?? null,
                    friability: lookup('friabiliteScore', 'friabiliteViscosite') ?? null,
                    viscosity: lookup('viscositeScore', 'viscositeTexture') ?? null,
                    residue: lookup('residuScore', 'residus') ?? null,
                };

            case 'recolte':
                return {
                    trichomesTranslucides: lookup('trichomesTranslucides') || 0,
                    trichomesLaiteux: lookup('trichomesLaiteux') || 0,
                    trichomesAmbres: lookup('trichomesAmbres') || 0,
                    modeRecolte: lookup('modeRecolte') || null,
                    poidsBrut: lookup('poidsBrut') || null,
                    poidsNet: lookup('poidsNet') || null,
                };

            case 'experience':
                return {
                    method: lookup('consumptionMethod') || null,
                    dosage: lookup('dosage') || null,
                    dosageUnit: lookup('dosageUnit') || null,
                    effectDuration: lookup('effectDuration') || null,
                    effectProfiles: parseJSON(lookup('effectProfiles'), []),
                    sideEffects: parseJSON(lookup('sideEffects'), []),
                    effectOnset: lookup('effectOnset') || null,
                    preferredUse: parseJSON(lookup('preferredUse'), []),
                };

            case 'notes':
            case 'description':
                return lookup('description', 'notes') || '-';

            case 'hashmaker':
                return lookup('hashmaker') || '-';

            default:
                return lookup(id) ?? sub[id] ?? undefined;
        }
    };

    // ========== BRAND & TEMPLATE RENDERING SYSTEM ==========
    const TYPE_ICONS = { Fleurs: '🌿', Hash: '🟤', Concentrés: '💎', Comestibles: '🍪' }
    const isLandscape = format === '16:9'
    const isPortrait = format === '9:16'
    const isA4 = format === 'A4' || format === '210:297'

    const BrandMark = ({ size = 'sm' }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: size === 'sm' ? '6px' : '8px' }}>
            <div style={{
                width: size === 'sm' ? '22px' : '28px',
                height: size === 'sm' ? '22px' : '28px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size === 'sm' ? '12px' : '15px',
                fontWeight: 900, color: '#fff',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.35)',
            }}>T</div>
            <span style={{
                fontSize: size === 'sm' ? '10px' : '13px',
                fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
            }}>terpologie</span>
        </div>
    )

    const getMainImage = () => {
        // 1. Pre-resolved URL from API (most reliable)
        if (reviewData?.mainImageUrl) return reviewData.mainImageUrl
        // 2. Try images array
        const imgs = resolveReviewField('images')
        const raw = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null
        if (!raw) return null
        let url = typeof raw === 'object' ? (raw.url || raw.filename || raw.path) : raw
        if (!url || typeof url !== 'string') return null
        if (url.startsWith('http') || url.startsWith('/images/')) return url
        return `/images/${url.replace(/^\//, '')}`
    }

    // Get all images as resolved URLs
    const getAllImages = () => {
        const imgs = resolveReviewField('images')
        if (!Array.isArray(imgs) || imgs.length === 0) return []
        return imgs.map(raw => {
            let url = typeof raw === 'object' ? (raw.url || raw.filename || raw.path) : raw
            if (!url || typeof url !== 'string') return null
            if (url.startsWith('http') || url.startsWith('/images/')) return url
            return `/images/${url.replace(/^\//, '')}`
        }).filter(Boolean)
    }

    // Content module visibility — read from orchardStore
    const contentModules = orchardConfig?.contentModules || {};

    // Check if a section/category has any visible field in the export
    // Maps section IDs to the data resolver IDs and orchardStore keys
    const SECTION_VISIBILITY = {
        photo: ['image', 'images', 'mainImage', 'imageUrl'],
        infos: ['holderName', 'title', 'type', 'cultivar', 'breeder', 'farm', 'hashmaker'],
        analytics: ['thcLevel', 'cbdLevel', 'terpenes'],
        visual: ['densite', 'trichome', 'pistil', 'manucure', 'moisissure', 'graines', 'couleur', 'couleurTransparence', 'pureteVisuelle', 'viscosite', 'melting', 'residus'],
        odor: ['aromasIntensity', 'intensiteAromatique', 'fideliteCultivars', 'aromas'],
        taste: ['intensiteFumee', 'agressivite', 'intensiteGout', 'goutIntensity', 'tastes'],
        effects: ['montee', 'intensiteEffet', 'dureeEffet', 'effects'],
        texture: ['durete', 'elasticite', 'collant', 'densiteTexture', 'friabiliteViscosite', 'meltingResidus'],
        culture: ['fertilizationPipeline', 'substratMix', 'curing'],
        recolte: ['poidsBrut', 'poidsNet', 'trichomesTranslucides'],
        terpenes: ['terpenes'],
        pipeline: ['pipelineExtraction', 'pipelineSeparation', 'pipelinePurification', 'curing'],
    };

    const isSectionVisible = (sectionKey) => {
        const keys = SECTION_VISIBILITY[sectionKey];
        if (!keys) return true;
        const moduleVisible = keys.some(k => contentModules[k] !== false);
        return moduleVisible;
    };

    // Check if a specific field is visible (false only if explicitly disabled)
    const isFieldVisible = (fieldKey) => {
        return contentModules[fieldKey] !== false;
    };

    // ========== FLEXIBLE DATA RENDERERS ==========
    // Each renderer can display scores, lists, and text in multiple visual styles.
    // The orchardConfig.renderMode controls which style is used per section.
    const renderModes = orchardConfig?.renderModes || {};

    // Score renderer — supports: 'gauge', 'bar', 'pill', 'number'
    const renderScore = (value, label, color = '#A78BFA', mode) => {
        const resolvedMode = mode || renderModes.scores || 'bar';
        if (value == null || value === undefined) return null;
        const num = Number(value);
        if (isNaN(num)) return null;

        switch (resolvedMode) {
            case 'gauge':
                return <ScoreGauge score={num} size={40} label={label} showMax={false} />;
            case 'pill':
                return (
                    <span style={{
                        padding: '2px 8px', borderRadius: '12px',
                        background: `${color}20`, fontSize: '10px', fontWeight: 700,
                        color: color, border: `1px solid ${color}30`,
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                        {label && <span style={{ fontSize: '8px', opacity: 0.7 }}>{label}</span>}
                        {num}/10
                    </span>
                );
            case 'number':
                return (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color }}>{num}</span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>/10</span>
                        {label && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>{label}</span>}
                    </div>
                );
            case 'bar':
            default:
                return <MiniBars items={[{ label: label || '', value: num, color }]} max={10} compact />;
        }
    };

    // Multi-score renderer — for section with multiple score bars
    const renderScoreGroup = (items, mode) => {
        const resolvedMode = mode || renderModes.scores || 'bar';
        const validItems = items.filter(Boolean);
        if (!validItems.length) return null;

        if (resolvedMode === 'bar') {
            return <MiniBars items={validItems.map(i => ({ label: i.label, value: i.value, color: i.color }))} max={10} compact />;
        }

        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: resolvedMode === 'gauge' ? '8px' : '4px' }}>
                {validItems.map((item, i) => (
                    <div key={i}>{renderScore(item.value, item.label, item.color, resolvedMode)}</div>
                ))}
            </div>
        );
    };

    // List renderer — supports: 'pills', 'comma', 'grid'
    const renderList = (items, color = 'rgba(139,92,246,0.15)', textColor = '#A78BFA', mode, max = 6) => {
        const resolvedMode = mode || renderModes.lists || 'pills';
        const normalized = (items || []).map(item =>
            typeof item === 'object' ? (item.label || item.name || item.id || String(item)) : String(item)
        ).filter(Boolean);
        if (!normalized.length) return null;

        switch (resolvedMode) {
            case 'comma':
                return (
                    <span style={{ fontSize: '10px', color: textColor, lineHeight: 1.5 }}>
                        {normalized.slice(0, max).join(', ')}
                        {normalized.length > max && <span style={{ color: 'rgba(255,255,255,0.3)' }}> +{normalized.length - max}</span>}
                    </span>
                );
            case 'grid':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '3px' }}>
                        {normalized.slice(0, max).map((item, i) => (
                            <div key={i} style={{
                                padding: '3px 6px', borderRadius: '6px',
                                background: color, fontSize: '8px', fontWeight: 600,
                                color: textColor, textAlign: 'center',
                                border: `1px solid ${textColor}15`,
                            }}>{item}</div>
                        ))}
                    </div>
                );
            case 'pills':
            default:
                return <ExportPills items={normalized} color={color} textColor={textColor} max={max} />;
        }
    };

    const avgScore = (obj) => {
        if (!obj || typeof obj !== 'object') return null
        const vals = Object.values(obj).filter(v => typeof v === 'number' && !isNaN(v) && v > 0)
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
            { key: 'visual', label: 'Visuel', icon: '👁', score: avgScore(visual), color: '#A78BFA' },
            { key: 'odor', label: 'Odeur', icon: '👃', score: odor.intensity ?? avgScore(odor), color: '#22C55E' },
            { key: 'taste', label: 'Goût', icon: '😋', score: taste.intensity ?? avgScore(taste), color: '#F59E0B' },
            { key: 'effects', label: 'Effets', icon: '💥', score: effects.intensity ?? avgScore(effects), color: '#06B6D4' },
            { key: 'texture', label: 'Texture', icon: '🤚', score: avgScore(texture), color: '#F472B6' },
        ].filter(c => c.score != null)
    }

    const CanvasBackground = () => (
        <>
            <div style={{ position: 'absolute', inset: 0, background: previewBackground, zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 15%, rgba(139,92,246,0.10) 0%, transparent 55%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 85%, rgba(16,185,129,0.05) 0%, transparent 45%)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)', zIndex: 1 }} />
        </>
    )

    const CanvasFooter = ({ compact: isCompact = false }) => (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: isCompact ? '8px' : '12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginTop: 'auto',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                    width: '16px', height: '16px', borderRadius: '4px',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 900, color: '#fff',
                }}>T</div>
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(139,92,246,0.5)', letterSpacing: '0.08em' }}>terpologie.eu</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.30)' }}>
                <span>{new Date().toLocaleDateString('fr-FR')}</span>
                <span>@{reviewData.author?.username || 'Anonyme'}</span>
            </div>
        </div>
    )

    const SectionCard = ({ children, title, icon, noPadding = false, sectionKey }) => {
        const ss = sectionKey ? (orchardConfig?.sectionStyles?.[sectionKey] || {}) : {};
        const cardStyle = {
            background: ss.background || 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: ss.borderRadius != null ? `${ss.borderRadius}px` : '12px',
            overflow: 'hidden',
            opacity: ss.opacity != null ? ss.opacity / 100 : 1,
            padding: ss.padding != null ? `${ss.padding}px` : undefined,
        };
        if (ss.visible === false) return null;
        return (
            <div
                style={cardStyle}
                {...(sectionKey ? { 'data-orchard-section': sectionKey, 'data-orchard-label': title || sectionKey } : {})}
            >
                {title && (
                    <div style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        {icon && <span style={{ fontSize: ss.fontSize ? `${ss.fontSize}px` : '12px' }}>{icon}</span>}
                        <span style={{
                            fontSize: ss.fontSize ? `${Math.max(8, ss.fontSize - 2)}px` : '10px',
                            fontWeight: ss.fontWeight || 700,
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                            color: ss.accentColor || 'rgba(255,255,255,0.5)',
                        }}>{title}</span>
                    </div>
                )}
                <div style={{ padding: noPadding ? 0 : '10px 12px' }}>
                    {children}
                </div>
            </div>
        );
    }

    const ExportPills = ({ items = [], color = 'rgba(139,92,246,0.15)', textColor = '#A78BFA', max: pillMax = 6 }) => {
        const normalized = items.map(item =>
            typeof item === 'object' ? (item.label || item.name || item.id || String(item)) : String(item)
        ).filter(Boolean)
        if (!normalized.length) return null
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {normalized.slice(0, pillMax).map((item, i) => (
                    <span key={i} style={{
                        padding: '2px 8px', borderRadius: '12px',
                        background: color, fontSize: '9px', fontWeight: 600,
                        color: textColor, letterSpacing: '0.02em',
                        border: `1px solid ${textColor}20`,
                    }}>{item}</span>
                ))}
                {normalized.length > pillMax && (
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>+{normalized.length - pillMax}</span>
                )}
            </div>
        )
    }

    // ====== COMPACT TEMPLATE (minimal) ======
    const renderCompactCanvas = () => {
        const rating = resolveReviewField('overallRating') ?? reviewData.rating ?? reviewData.overallRating ?? null
        const typeName = reviewData.typeName || productType || 'Fleurs'
        const imgUrl = getMainImage()
        const categories = getCategoryScores().filter(c => isSectionVisible(c.key)).slice(0, 4)
        const pad = isPortrait ? '20px 18px' : '24px 28px'

        return (
            <>
                <CanvasBackground />
                <div style={{ position: 'relative', zIndex: 10, padding: pad, height: '100%', display: 'flex', flexDirection: 'column', fontFamily: `"${previewFont}", Inter, system-ui, sans-serif` }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <BrandMark size="sm" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{typeName}</span>
                            <span style={{ fontSize: '13px' }}>{TYPE_ICONS[typeName] || '🌿'}</span>
                        </div>
                    </div>

                    {/* Hero */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: '16px', minHeight: 0 }}>
                        {/* Image */}
                        {isSectionVisible('photo') && (
                            <div style={{
                                flex: isLandscape ? '0 0 50%' : '1 1 55%',
                                borderRadius: '14px', overflow: 'hidden', position: 'relative',
                                border: '1px solid rgba(255,255,255,0.08)',
                                background: 'rgba(0,0,0,0.2)', minHeight: 0,
                            }}>
                                {imgUrl ? (
                                    <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '40px' }}>📷</div>
                                )}
                                {rating > 0 && (
                                    <div style={{
                                        position: 'absolute', bottom: '10px', right: '10px',
                                        background: 'rgba(0,0,0,0.65)',
                                        borderRadius: '12px', padding: '6px 10px',
                                        border: '1px solid rgba(139,92,246,0.25)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    }}>
                                        <span style={{ fontSize: '24px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{rating}</span>
                                        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>/10</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: isLandscape ? '0 0 48%' : undefined, justifyContent: 'center' }}>
                            {isSectionVisible('infos') && (
                                <div>
                                    <h1 style={{ fontSize: isPortrait ? '22px' : '26px', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1 }}>{reviewName || 'Sans nom'}</h1>
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {reviewData.varietyType && (
                                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', fontSize: '9px', fontWeight: 600, color: '#A78BFA' }}>{reviewData.varietyType}</span>
                                        )}
                                        {isSectionVisible('analytics') && resolveReviewField('thc') && resolveReviewField('thc') !== '-' && (
                                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', fontSize: '9px', fontWeight: 600, color: '#F87171' }}>THC {resolveReviewField('thc')}%</span>
                                        )}
                                        {isSectionVisible('analytics') && resolveReviewField('cbd') && resolveReviewField('cbd') !== '-' && (
                                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)', fontSize: '9px', fontWeight: 600, color: '#34D399' }}>CBD {resolveReviewField('cbd')}%</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            {categories.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(categories.length, isLandscape ? 2 : 4)}, 1fr)`, gap: '6px' }}>
                                    {categories.map((cat, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '10px', padding: '8px 4px',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                                        }}>
                                            <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                                            <ScoreGauge score={cat.score} size={40} showMax={false} />
                                            <span style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <CanvasFooter compact />
                </div>
            </>
        )
    }

    // ====== STANDARD TEMPLATE ======
    const renderStandardCanvas = () => {
        const rating = resolveReviewField('overallRating') ?? reviewData.rating ?? reviewData.overallRating ?? null
        const typeName = reviewData.typeName || productType || 'Fleurs'
        const imgUrl = getMainImage()
        const categories = getCategoryScores().filter(c => isSectionVisible(c.key))
        const odor = resolveReviewField('odor') || {}
        const taste = resolveReviewField('taste') || {}
        const effects = resolveReviewField('effects') || {}
        const terps = (() => {
            const raw = resolveReviewField('terpeneProfile') || []
            return Array.isArray(raw) ? raw.map(t => ({ name: t.name || t.terpene || t.key || t.label || 'Autre', percent: t.percent || t.value || t.amount || 0 })) : []
        })()
        const genetics = resolveReviewField('genetics')
        const curingData = resolveReviewField('curing') || {}
        const cultureData = resolveReviewField('culture') || {}
        const visual = resolveReviewField('visual') || {}
        const texture = resolveReviewField('texture') || {}
        const recolte = resolveReviewField('recolte') || {}

        const visualBars = [
            visual.couleur != null && { label: 'Couleur', value: visual.couleur, color: '#F472B6' },
            visual.densite != null && { label: 'Densité', value: visual.densite, color: '#8B5CF6' },
            visual.trichomes != null && { label: 'Trichomes', value: visual.trichomes, color: '#A78BFA' },
            visual.pistils != null && { label: 'Pistils', value: visual.pistils, color: '#C084FC' },
            visual.manucure != null && { label: 'Manucure', value: visual.manucure, color: '#E879F9' },
        ].filter(Boolean)

        const textureBars = [
            texture.hardness != null && { label: 'Dureté', value: texture.hardness, color: '#FB7185' },
            texture.elasticity != null && { label: 'Élasticité', value: texture.elasticity, color: '#FDA4AF' },
            texture.stickiness != null && { label: 'Collant', value: texture.stickiness, color: '#FB923C' },
            texture.friability != null && { label: 'Friabilité', value: texture.friability, color: '#FBBF24' },
        ].filter(Boolean)

        const pad = isPortrait ? '20px 16px' : isA4 ? '32px 36px' : '24px 28px'
        const fs = isA4 ? 1.15 : 1

        return (
            <>
                <CanvasBackground />
                <div style={{ position: 'relative', zIndex: 10, padding: pad, height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: `"${previewFont}", Inter, system-ui, sans-serif`, overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <BrandMark size="sm" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: `${10 * fs}px`, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{typeName}</span>
                            <span style={{ fontSize: `${13 * fs}px` }}>{TYPE_ICONS[typeName] || '🌿'}</span>
                        </div>
                    </div>

                    {/* Hero */}
                    <div style={{ display: 'flex', flexDirection: isPortrait ? 'column' : 'row', gap: '14px' }}>
                        {isSectionVisible('photo') && (
                            <div style={{
                                flex: isPortrait ? undefined : '0 0 42%',
                                height: isPortrait ? '180px' : undefined,
                                borderRadius: '14px', overflow: 'hidden', position: 'relative',
                                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)',
                            }}>
                                {imgUrl ? (
                                    <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '40px' }}>📷</div>
                                )}
                            </div>
                        )}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {isSectionVisible('infos') && (
                                <div>
                                    <h1 style={{ fontSize: `${24 * fs}px`, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1 }}>{reviewName || 'Sans nom'}</h1>
                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        {reviewData.varietyType && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#A78BFA' }}>{reviewData.varietyType}</span>}
                                        {isSectionVisible('analytics') && resolveReviewField('thc') && resolveReviewField('thc') !== '-' && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#F87171' }}>THC {resolveReviewField('thc')}%</span>}
                                        {isSectionVisible('analytics') && resolveReviewField('cbd') && resolveReviewField('cbd') !== '-' && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#34D399' }}>CBD {resolveReviewField('cbd')}%</span>}
                                        {isSectionVisible('analytics') && resolveReviewField('cbg') != null && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#FCD34D' }}>CBG {resolveReviewField('cbg')}%</span>}
                                        {isSectionVisible('analytics') && resolveReviewField('thcv') != null && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#C4B5FD' }}>THCV {resolveReviewField('thcv')}%</span>}
                                    </div>
                                    {genetics && (genetics.breeder || genetics.variety || genetics.indicaPercent != null) && (
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px', alignItems: 'center' }}>
                                            {genetics.breeder && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{genetics.breeder}</span>}
                                            {genetics.variety && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.4)' }}>· {genetics.variety}</span>}
                                            {genetics.indicaPercent != null && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(139,92,246,0.8)', background: 'rgba(139,92,246,0.1)', padding: '1px 5px', borderRadius: '10px' }}>{genetics.indicaPercent}% I</span>}
                                            {genetics.phenotype && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.3)' }}>#{genetics.phenotype}</span>}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {rating > 0 && <ScoreGauge score={rating} size={56} label="Note" />}
                                {categories.length > 0 && (
                                    <div style={{ flex: 1 }}>
                                        {renderScoreGroup(categories.slice(0, 4).map(c => ({ label: c.label, value: c.score, color: c.color })))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sensorial */}
                    <div style={{ display: 'grid', gridTemplateColumns: isPortrait ? '1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                        {isSectionVisible('odor') && (odor.dominant?.length || odor.secondary?.length || odor.intensity) ? (
                            <SectionCard title="Odeur" icon="👃" sectionKey="odor">
                                {odor.intensity != null && renderScore(odor.intensity, 'Intensité', '#22C55E')}
                                <div style={{ marginTop: '4px' }}>{renderList([...(odor.dominant || []), ...(odor.secondary || [])], 'rgba(34,197,94,0.12)', '#22C55E')}</div>
                            </SectionCard>
                        ) : null}
                        {isSectionVisible('taste') && (taste.intensity || taste.aggressiveness || taste.dryPuff?.length || taste.inhalation?.length || taste.expiration?.length) ? (
                            <SectionCard title="Goût" icon="😋" sectionKey="taste">
                                {renderScoreGroup([
                                    taste.intensity != null && { label: 'Intensité', value: taste.intensity, color: '#F59E0B' },
                                    taste.aggressiveness != null && { label: 'Agressivité', value: taste.aggressiveness, color: '#FB923C' },
                                ].filter(Boolean))}
                                <div style={{ marginTop: '4px' }}>{renderList([...(taste.dryPuff || []), ...(taste.inhalation || []), ...(taste.expiration || [])], 'rgba(245,158,11,0.12)', '#F59E0B')}</div>
                            </SectionCard>
                        ) : null}
                        {isSectionVisible('effects') && (effects.intensity || effects.onset || effects.selected?.length) ? (
                            <SectionCard title="Effets" icon="💥" sectionKey="effects">
                                {renderScoreGroup([
                                    effects.intensity != null && { label: 'Intensité', value: effects.intensity, color: '#06B6D4' },
                                    effects.onset != null && { label: 'Montée', value: effects.onset, color: '#34D399' },
                                ].filter(Boolean))}
                                <div style={{ marginTop: '4px' }}>{renderList(effects.selected || [], 'rgba(6,182,212,0.12)', '#06B6D4')}</div>
                            </SectionCard>
                        ) : null}
                    </div>

                    {/* Visual & Texture */}
                    {(isSectionVisible('visual') && visualBars.length > 0) || (isSectionVisible('texture') && textureBars.length > 0) || (isSectionVisible('recolte') && (recolte.poidsBrut || recolte.poidsNet)) ? (
                        <div style={{ display: 'grid', gridTemplateColumns: isPortrait ? '1fr' : `repeat(${[isSectionVisible('visual') && visualBars.length > 0, isSectionVisible('texture') && textureBars.length > 0, isSectionVisible('recolte') && (recolte.poidsBrut || recolte.poidsNet)].filter(Boolean).length}, 1fr)`, gap: '8px' }}>
                            {isSectionVisible('visual') && visualBars.length > 0 && (
                                <SectionCard title="Visuel" icon="👁" sectionKey="visual">
                                    {renderScoreGroup(visualBars)}
                                </SectionCard>
                            )}
                            {isSectionVisible('texture') && textureBars.length > 0 && (
                                <SectionCard title="Texture" icon="🤚" sectionKey="texture">
                                    {renderScoreGroup(textureBars)}
                                </SectionCard>
                            )}
                            {isSectionVisible('recolte') && (recolte.poidsBrut || recolte.poidsNet) && (
                                <SectionCard title="Récolte" icon="🌾" sectionKey="recolte">
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.7)' }}>
                                        {recolte.poidsBrut && <span>Brut: <b>{recolte.poidsBrut}g</b></span>}
                                        {recolte.poidsNet && <span>Net: <b>{recolte.poidsNet}g</b></span>}
                                    </div>
                                    {(recolte.trichomesLaiteux > 0 || recolte.trichomesAmbres > 0) && (
                                        <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                                            <div style={{ flex: Number(recolte.trichomesTranslucides || 0), height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
                                            <div style={{ flex: Number(recolte.trichomesLaiteux || 0), height: '4px', borderRadius: '2px', background: '#E0E7FF' }} />
                                            <div style={{ flex: Number(recolte.trichomesAmbres || 0), height: '4px', borderRadius: '2px', background: '#FBBF24' }} />
                                        </div>
                                    )}
                                </SectionCard>
                            )}
                        </div>
                    ) : null}

                    {/* Terpenes & Pipelines */}
                    {((isSectionVisible('terpenes') && terps.length > 0) || (isSectionVisible('pipeline') && (curingData.data?.length > 0 || cultureData.data?.length > 0))) && (
                        <div style={{ display: 'grid', gridTemplateColumns: isPortrait ? '1fr' : ((isSectionVisible('terpenes') && terps.length > 0) ? '1fr 1fr' : '1fr'), gap: '8px' }}>
                            {isSectionVisible('terpenes') && terps.length > 0 && (
                                <SectionCard title="Profil Terpénique" icon="🧬" sectionKey="terpenes">
                                    <TerpeneBar profile={terps} compact />
                                </SectionCard>
                            )}
                            {isSectionVisible('pipeline') && (curingData.data?.length > 0 || cultureData.data?.length > 0) && (
                                <SectionCard title="Pipeline" icon="⚗️" sectionKey="pipeline">
                                    {cultureData.data?.length > 0 && (
                                        <div style={{ marginBottom: '6px' }}>
                                            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Culture ({cultureData.data.length} étapes)</div>
                                            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                                                {cultureData.data.slice(0, 16).map((step, i) => (
                                                    <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: `rgba(34,197,94,${0.15 + (i / cultureData.data.length) * 0.35})`, border: '1px solid rgba(34,197,94,0.3)' }} title={step.label || `Étape ${i + 1}`} />
                                                ))}
                                                {cultureData.data.length > 16 && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>+{cultureData.data.length - 16}</span>}
                                            </div>
                                        </div>
                                    )}
                                    {curingData.data?.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Curing ({curingData.data.length} étapes)</div>
                                            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                                                {curingData.data.slice(0, 16).map((step, i) => (
                                                    <div key={i} style={{ width: '14px', height: '14px', borderRadius: '3px', background: `rgba(245,158,11,${0.15 + (i / curingData.data.length) * 0.35})`, border: '1px solid rgba(245,158,11,0.3)' }} title={step.label || `J+${i + 1}`} />
                                                ))}
                                                {curingData.data.length > 16 && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>+{curingData.data.length - 16}</span>}
                                            </div>
                                        </div>
                                    )}
                                </SectionCard>
                            )}
                        </div>
                    )}

                    <CanvasFooter />
                </div>
            </>
        )
    }

    // ====== DETAILED TEMPLATE ======
    const renderDetailedCanvas = () => {
        const rating = resolveReviewField('overallRating') ?? reviewData.rating ?? reviewData.overallRating ?? null
        const typeName = reviewData.typeName || productType || 'Fleurs'
        const imgUrl = getMainImage()
        const categories = getCategoryScores().filter(c => isSectionVisible(c.key))
        const odor = resolveReviewField('odor') || {}
        const taste = resolveReviewField('taste') || {}
        const effects = resolveReviewField('effects') || {}
        const visual = resolveReviewField('visual') || {}
        const texture = resolveReviewField('texture') || {}
        const terps = (() => {
            const raw = resolveReviewField('terpeneProfile') || []
            return Array.isArray(raw) ? raw.map(t => ({ name: t.name || t.terpene || t.key || t.label || 'Autre', percent: t.percent || t.value || t.amount || 0 })) : []
        })()
        const genetics = resolveReviewField('genetics')
        const curingData = resolveReviewField('curing') || {}
        const cultureData = resolveReviewField('culture') || {}
        const recolte = resolveReviewField('recolte') || {}
        const notes = resolveReviewField('notes')
        const pad = isPortrait ? '18px 14px' : isA4 ? '32px 36px' : '24px 28px'
        const fs = isA4 ? 1.15 : 1

        const visualBars = [
            visual.couleur != null && { label: 'Couleur', value: visual.couleur, color: '#F472B6' },
            visual.densite != null && { label: 'Densité', value: visual.densite, color: '#8B5CF6' },
            visual.trichomes != null && { label: 'Trichomes', value: visual.trichomes, color: '#A78BFA' },
            visual.pistils != null && { label: 'Pistils', value: visual.pistils, color: '#C084FC' },
            visual.manucure != null && { label: 'Manucure', value: visual.manucure, color: '#E879F9' },
        ].filter(Boolean)

        const textureBars = [
            texture.hardness != null && { label: 'Dureté', value: texture.hardness, color: '#FB7185' },
            texture.density != null && { label: 'Densité', value: texture.density, color: '#F43F5E' },
            texture.elasticity != null && { label: 'Élasticité', value: texture.elasticity, color: '#FDA4AF' },
            texture.stickiness != null && { label: 'Collant', value: texture.stickiness, color: '#FB923C' },
            texture.melting != null && { label: 'Melting', value: texture.melting, color: '#FBBF24' },
        ].filter(Boolean)

        return (
            <>
                <CanvasBackground />
                <div style={{ position: 'relative', zIndex: 10, padding: pad, height: '100%', display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: `"${previewFont}", Inter, system-ui, sans-serif`, overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <BrandMark size="sm" />
                            <h1 style={{ fontSize: `${22 * fs}px`, fontWeight: 900, color: '#fff', margin: '8px 0 0', lineHeight: 1.1 }}>{reviewName || 'Sans nom'}</h1>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', fontSize: `${9 * fs}px`, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{typeName} {TYPE_ICONS[typeName] || ''}</span>
                                {reviewData.varietyType && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#A78BFA' }}>{reviewData.varietyType}</span>}
                                {resolveReviewField('thc') && resolveReviewField('thc') !== '-' && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#F87171' }}>THC {resolveReviewField('thc')}%</span>}
                                {resolveReviewField('cbd') && resolveReviewField('cbd') !== '-' && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#34D399' }}>CBD {resolveReviewField('cbd')}%</span>}
                                {resolveReviewField('cbg') != null && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#FCD34D' }}>CBG {resolveReviewField('cbg')}%</span>}
                                {resolveReviewField('cbc') != null && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#6EE7B7' }}>CBC {resolveReviewField('cbc')}%</span>}
                                {resolveReviewField('thcv') != null && <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.20)', fontSize: `${9 * fs}px`, fontWeight: 600, color: '#C4B5FD' }}>THCV {resolveReviewField('thcv')}%</span>}
                            </div>
                            {genetics && (genetics.breeder || genetics.variety || genetics.indicaPercent != null) && (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px', alignItems: 'center' }}>
                                    {genetics.breeder && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{genetics.breeder}</span>}
                                    {genetics.variety && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.4)' }}>· {genetics.variety}</span>}
                                    {genetics.indicaPercent != null && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(139,92,246,0.8)', background: 'rgba(139,92,246,0.1)', padding: '1px 5px', borderRadius: '10px' }}>{genetics.indicaPercent}% I</span>}
                                    {genetics.phenotype && <span style={{ fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.3)' }}>#{genetics.phenotype}</span>}
                                </div>
                            )}
                        </div>
                        {rating > 0 && (
                            <div style={{ marginLeft: '12px' }}>
                                <ScoreGauge score={rating} size={60} label="Note" />
                            </div>
                        )}
                    </div>

                    {/* Main Grid */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isPortrait ? '1fr' : '1fr 1fr', gap: '8px', minHeight: 0, overflow: 'hidden' }}>
                        {/* Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
                            {isSectionVisible('photo') && imgUrl && (
                                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', maxHeight: isPortrait ? '140px' : '180px' }}>
                                    <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                                </div>
                            )}
                            {isSectionVisible('visual') && visualBars.length > 0 && (
                                <SectionCard title="Visuel" icon="👁" sectionKey="visual">
                                    {renderScoreGroup(visualBars)}
                                </SectionCard>
                            )}
                            {isSectionVisible('texture') && textureBars.length > 0 && (
                                <SectionCard title="Texture" icon="🤚" sectionKey="texture">
                                    {renderScoreGroup(textureBars)}
                                </SectionCard>
                            )}
                            {isSectionVisible('terpenes') && terps.length > 0 && (
                                <SectionCard title="Terpènes" icon="🧬" sectionKey="terpenes">
                                    <TerpeneBar profile={terps} compact />
                                </SectionCard>
                            )}
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
                            {isSectionVisible('odor') && (odor.dominant?.length || odor.secondary?.length || odor.intensity) ? (
                                <SectionCard title="Odeur" icon="👃" sectionKey="odor">
                                    {renderScoreGroup([
                                        odor.intensity != null && { label: 'Intensité', value: odor.intensity, color: '#22C55E' },
                                        odor.complexity != null && { label: 'Complexité', value: odor.complexity, color: '#4ADE80' },
                                        odor.fidelity != null && { label: 'Fidélité', value: odor.fidelity, color: '#86EFAC' },
                                    ].filter(Boolean))}
                                    {(odor.dominant?.length > 0 || odor.secondary?.length > 0) && (
                                        <div style={{ marginTop: '4px' }}>
                                            {renderList([...(odor.dominant || []), ...(odor.secondary || [])], 'rgba(34,197,94,0.12)', '#22C55E')}
                                        </div>
                                    )}
                                </SectionCard>
                            ) : null}
                            {isSectionVisible('taste') && (taste.intensity || taste.aggressiveness || taste.dryPuff?.length || taste.inhalation?.length || taste.expiration?.length) ? (
                                <SectionCard title="Goût" icon="😋" sectionKey="taste">
                                    {renderScoreGroup([
                                        taste.intensity && { label: 'Intensité', value: taste.intensity, color: '#F59E0B' },
                                        taste.aggressiveness && { label: 'Agressivité', value: taste.aggressiveness, color: '#FB923C' },
                                    ].filter(Boolean))}
                                    {(taste.dryPuff?.length > 0 || taste.inhalation?.length > 0 || taste.expiration?.length > 0) && (
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>Dry Puff</div>
                                            {renderList(taste.dryPuff || [], 'rgba(245,158,11,0.10)', '#F59E0B', undefined, 4)}
                                            {taste.inhalation?.length > 0 && <>
                                                <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: '3px 0' }}>Inhalation</div>
                                                {renderList(taste.inhalation, 'rgba(251,146,60,0.10)', '#FB923C', undefined, 4)}
                                            </>}
                                            {taste.expiration?.length > 0 && <>
                                                <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: '3px 0' }}>Expiration</div>
                                                {renderList(taste.expiration, 'rgba(249,115,22,0.10)', '#F97316', undefined, 4)}
                                            </>}
                                        </div>
                                    )}
                                </SectionCard>
                            ) : null}
                            {isSectionVisible('effects') && (effects.intensity || effects.onset || effects.selected?.length) ? (
                                <SectionCard title="Effets" icon="💥" sectionKey="effects">
                                    {renderScoreGroup([
                                        effects.intensity && { label: 'Intensité', value: effects.intensity, color: '#06B6D4' },
                                        effects.onset && { label: 'Montée', value: effects.onset, color: '#34D399' },
                                    ].filter(Boolean))}
                                    {effects.selected?.length > 0 && (
                                        <div style={{ marginTop: '4px' }}>
                                            {renderList(effects.selected, 'rgba(6,182,212,0.12)', '#06B6D4')}
                                        </div>
                                    )}
                                    {effects.profiles?.length > 0 && (
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>Profils</div>
                                            {renderList(effects.profiles, 'rgba(52,211,153,0.10)', '#34D399', undefined, 4)}
                                        </div>
                                    )}
                                    {(effects.duration || effects.method) && (
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                            {effects.duration && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>⏱ {effects.duration}</span>}
                                            {effects.method && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>💨 {effects.method}</span>}
                                        </div>
                                    )}
                                    {effects.sideEffects?.length > 0 && (
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,165,0,0.6)', marginBottom: '3px' }}>Effets secondaires</div>
                                            {renderList(effects.sideEffects, 'rgba(251,146,60,0.08)', '#FB923C', undefined, 3)}
                                        </div>
                                    )}
                                </SectionCard>
                            ) : null}
                            {isSectionVisible('pipeline') && (curingData.data?.length > 0 || cultureData.data?.length > 0) && (
                                <SectionCard title="Pipeline" icon="⚗️" sectionKey="pipeline">
                                    {cultureData.data?.length > 0 && (
                                        <div style={{ marginBottom: '6px' }}>
                                            <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Culture ({cultureData.data.length} étapes)</div>
                                            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                                                {cultureData.data.slice(0, 14).map((step, i) => (
                                                    <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: `rgba(34,197,94,${0.2 + (i / cultureData.data.length) * 0.4})`, border: '1px solid rgba(34,197,94,0.3)' }} />
                                                ))}
                                                {cultureData.data.length > 14 && <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>+{cultureData.data.length - 14}</span>}
                                            </div>
                                        </div>
                                    )}
                                    {curingData.data?.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: '3px' }}>Curing ({curingData.data.length} étapes)</div>
                                            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                                                {curingData.data.slice(0, 14).map((step, i) => (
                                                    <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: `rgba(245,158,11,${0.2 + (i / curingData.data.length) * 0.4})`, border: '1px solid rgba(245,158,11,0.3)' }} />
                                                ))}
                                                {curingData.data.length > 14 && <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>+{curingData.data.length - 14}</span>}
                                            </div>
                                        </div>
                                    )}
                                </SectionCard>
                            )}
                            {isSectionVisible('recolte') && (recolte.poidsBrut || recolte.poidsNet || recolte.trichomesLaiteux > 0) && (
                                <SectionCard title="Récolte" icon="🌾" sectionKey="recolte">
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>
                                        {recolte.poidsBrut && <span>Brut: <b>{recolte.poidsBrut}g</b></span>}
                                        {recolte.poidsNet && <span>Net: <b>{recolte.poidsNet}g</b></span>}
                                    </div>
                                    {(recolte.trichomesLaiteux > 0 || recolte.trichomesAmbres > 0) && (
                                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                            <div style={{ flex: Number(recolte.trichomesTranslucides || 0), height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} title={`Translucides: ${recolte.trichomesTranslucides || 0}%`} />
                                            <div style={{ flex: Number(recolte.trichomesLaiteux || 0), height: '4px', borderRadius: '2px', background: '#E0E7FF' }} title={`Laiteux: ${recolte.trichomesLaiteux || 0}%`} />
                                            <div style={{ flex: Number(recolte.trichomesAmbres || 0), height: '4px', borderRadius: '2px', background: '#FBBF24' }} title={`Ambrés: ${recolte.trichomesAmbres || 0}%`} />
                                        </div>
                                    )}
                                </SectionCard>
                            )}
                        </div>
                    </div>

                    {notes && notes !== '-' && (
                        <div style={{ fontSize: `${9 * fs}px`, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            {String(notes).slice(0, 200)}
                        </div>
                    )}

                    <CanvasFooter />
                </div>
            </>
        )
    }

    // Canvas dispatch — mapping orchardStore template IDs → canvas renderers
    const renderCanvasContent = () => {
        const tpl = orchardConfig?.template || selectedTemplate;
        if (tpl === 'modernCompact' || tpl === 'minimal' || tpl === 'socialStory')
            return renderCompactCanvas();
        if (tpl === 'detailedCard' || tpl === 'detailed')
            return renderDetailedCanvas();
        // blogArticle, standard, ou défaut
        return renderStandardCanvas();
    }

    return (
        <div className="fixed inset-0 z-[8888] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md pt-10 sm:pt-28 sm:px-4 sm:pb-4">
            <LiquidGlass variant="modal" className="w-full sm:max-w-5xl flex flex-col-reverse sm:flex-row overflow-hidden relative z-[8889] rounded-t-2xl sm:rounded-2xl h-[calc(100dvh_-_2.5rem)] sm:h-[calc(100dvh_-_8rem)] sm:max-h-[740px]">

                {/* Sidebar options */}
                <div className="w-full sm:w-72 border-r border-white/10 flex flex-col bg-white/5">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0 bg-white/5 z-10">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-purple-500/20">T</div>
                            Export Maker
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sidebar tabs */}
                    <div className="flex border-b border-white/10">
                        {[
                            { id: 'template', label: 'Template', icon: <Layout className="w-3.5 h-3.5" /> },
                            { id: 'contenu', label: 'Contenu', icon: <Grid className="w-3.5 h-3.5" /> },
                            { id: 'apparence', label: 'Apparence', icon: <Palette className="w-3.5 h-3.5" /> },
                            { id: 'prereglages', label: 'Préréglages', icon: <Save className="w-3.5 h-3.5" /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSidebarTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all border-b-2 ${sidebarTab === tab.id ? 'border-purple-500 text-purple-300 bg-purple-500/5' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">

                        {/* ===== TEMPLATE TAB ===== */}
                        {sidebarTab === 'template' && (
                            <>
                                {/* Template Selection */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Template</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {templates.map(t => {
                                            const locked = !!t.premium;
                                            const active = selectedTemplate === t.id;
                                            const previewColors = {
                                                modernCompact: ['#8B5CF6', '#22C55E', '#F59E0B'],
                                                blogArticle: ['#8B5CF6', '#22C55E', '#F59E0B', '#06B6D4'],
                                                detailedCard: ['#8B5CF6', '#22C55E', '#F59E0B', '#06B6D4', '#F472B6'],
                                                socialStory: ['#F472B6', '#8B5CF6', '#22C55E'],
                                            };
                                            const colors = previewColors[t.id] || previewColors.blogArticle;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => !locked && setSelectedTemplate(t.id)}
                                                    disabled={locked}
                                                    title={locked ? 'Réservé aux comptes Producteur / Influenceur' : ''}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all ${active ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'} ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                                                            <div className="flex gap-[2px]">
                                                                {colors.slice(0, 3).map((c, ci) => (
                                                                    <div key={ci} style={{ width: '3px', height: `${10 + ci * 4}px`, borderRadius: '1px', background: active ? c : 'rgba(255,255,255,0.2)' }} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-sm text-white flex items-center gap-2">
                                                                {t.name}
                                                                {t.premium && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 mt-0.5">{t.description}</div>
                                                        </div>
                                                        {active && <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Format Selection */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Format</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: '1:1', label: 'Carré', w: 20, h: 20 },
                                            { id: '16:9', label: 'Paysage', w: 24, h: 14 },
                                            { id: '9:16', label: 'Portrait', w: 14, h: 24 },
                                            { id: 'A4', label: 'A4', w: 16, h: 22 },
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => setFormat(f.id)}
                                                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${format === f.id ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'}`}
                                            >
                                                <div
                                                    className={`rounded-sm border ${format === f.id ? 'border-purple-400/60' : 'border-white/10'}`}
                                                    style={{ width: `${f.w}px`, height: `${f.h}px`, background: format === f.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)' }}
                                                />
                                                <span className={`text-[10px] font-medium ${format === f.id ? 'text-purple-300' : 'text-gray-500'}`}>{f.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pages ({safePage + 1}/{totalPages})</h3>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(0, safePage - 1))}
                                                disabled={safePage === 0}
                                                className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                                            >
                                                <ChevronsRight className="w-3.5 h-3.5 rotate-180" />
                                            </button>
                                            <div className="flex gap-1.5">
                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i)}
                                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${safePage === i ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-transparent'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalPages - 1, safePage + 1))}
                                                disabled={safePage === totalPages - 1}
                                                className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                                            >
                                                <ChevronsRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Render Style */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Style de rendu</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-[10px] text-gray-500 mb-1.5">Notes / Scores</div>
                                            <div className="grid grid-cols-4 gap-1">
                                                {[
                                                    { id: 'bar', label: 'Barres' },
                                                    { id: 'gauge', label: 'Jauges' },
                                                    { id: 'pill', label: 'Pilules' },
                                                    { id: 'number', label: 'Nombres' },
                                                ].map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => useOrchardStore.getState().setConfig({ ...orchardConfig, renderModes: { ...renderModes, scores: s.id } })}
                                                        className={`py-1.5 text-[9px] font-medium rounded-md border transition-all ${(renderModes.scores || 'bar') === s.id ? 'border-purple-500/50 bg-purple-500/10 text-purple-300' : 'border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/5'}`}
                                                    >{s.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 mb-1.5">Arômes / Effets</div>
                                            <div className="grid grid-cols-3 gap-1">
                                                {[
                                                    { id: 'pills', label: 'Pilules' },
                                                    { id: 'comma', label: 'Texte' },
                                                    { id: 'grid', label: 'Grille' },
                                                ].map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => useOrchardStore.getState().setConfig({ ...orchardConfig, renderModes: { ...renderModes, lists: s.id } })}
                                                        className={`py-1.5 text-[9px] font-medium rounded-md border transition-all ${(renderModes.lists || 'pills') === s.id ? 'border-purple-500/50 bg-purple-500/10 text-purple-300' : 'border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/5'}`}
                                                    >{s.label}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ===== CONTENU TAB ===== */}
                        {sidebarTab === 'contenu' && (
                            <>
                                <ContentModuleControls />

                                {/* Custom Layout (premium, with DragDrop) */}
                                {canUseCustomLayout && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            Agencement personnalisé
                                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                                        </h3>
                                        <DragDropExport
                                            productType={productType}
                                            selectedSections={customSections}
                                            onSectionsChange={setCustomSections}
                                            allowedModules={relevantModules}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {/* ===== APPARENCE TAB ===== */}
                        {sidebarTab === 'apparence' && (
                            <>
                                <TypographyControls />
                                <ColorPaletteControls />
                                <ImageBrandingControls />

                                {/* Watermark section */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        Filigrane
                                        {!permissions.export?.features?.watermark && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                                    </h3>
                                    {permissions.export?.features?.watermark ? (
                                        <WatermarkEditor
                                            watermark={watermark}
                                            onWatermarkChange={setWatermark}
                                        />
                                    ) : (
                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <div className="text-xs text-gray-400">Le filigrane Terpologie est appliqué automatiquement.</div>
                                            <div className="text-[10px] text-gray-600 mt-1">Personnalisez-le avec un compte Producteur ou Influenceur.</div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ===== PREREGLAGES TAB ===== */}
                        {sidebarTab === 'prereglages' && (
                            <PresetManager />
                        )}
                    </div>

                    {/* Actions footer */}
                    <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">

                        {/* Bouton principal — Exporter l'image en PNG */}
                        <div className="space-y-2">
                            <button
                                onClick={() => handleExport('png')}
                                disabled={exporting}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                {exporting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

                            {/* Partage — Web Share API (mobile) ou copie du lien */}
                            <button
                                onClick={async () => {
                                    try {
                                        // Générer le PNG depuis la preview
                                        const { toPng } = await import('html-to-image');
                                        const dataUrl = await toPng(exportRef.current, {
                                            cacheBust: true,
                                            pixelRatio: highQuality ? 3 : 2,
                                            backgroundColor: null,
                                        });

                                        // Web Share API (mobile / Chrome Android / Safari iOS 15+)
                                        if (navigator.share) {
                                            const imgResp = await fetch(dataUrl);
                                            const blob = await imgResp.blob();
                                            const file = new File([blob], `review-${reviewName}.png`, { type: 'image/png' });
                                            const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });
                                            if (canShareFiles) {
                                                await navigator.share({
                                                    title: `Review ${reviewName}`,
                                                    text: `Découvrez cette review sur Terpologie`,
                                                    files: [file],
                                                });
                                            } else {
                                                await navigator.share({
                                                    title: `Review ${reviewName}`,
                                                    text: `Découvrez cette review sur Terpologie`,
                                                    url: window.location.href,
                                                });
                                            }
                                        } else {
                                            // Fallback: copier l'image en base64 dans le presse-papier ou télécharger
                                            if (navigator.clipboard && window.ClipboardItem) {
                                                const imgResp = await fetch(dataUrl);
                                                const blob = await imgResp.blob();
                                                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                                                alert('Image copiée dans le presse-papier !');
                                            } else {
                                                // Dernier recours : copier l'URL
                                                await navigator.clipboard.writeText(window.location.href);
                                                alert('Lien de la review copié dans le presse-papier !');
                                            }
                                        }
                                    } catch (err) {
                                        if (err.name !== 'AbortError') {
                                            console.error('[ExportMaker] Share failed:', err);
                                            alert('Partage non disponible. Utilisez le bouton "Exporter" pour télécharger l\'image.');
                                        }
                                    }
                                }}
                                className="w-full py-3 bg-white/5 rounded-xl text-white font-medium border border-white/5 hover:bg-white/10 flex items-center justify-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                Partager
                            </button>
                        </div>

                        {/* Formats secondaires + qualité */}
                        <div className="flex gap-2 items-center">
                            <button onClick={() => handleExport('jpg')} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white">JPEG</button>
                            <FeatureGate hasAccess={canExportSVG} upgradeType="producer" showOverlay={false}>
                                <button onClick={() => handleExport('svg')} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white">SVG</button>
                            </FeatureGate>
                            <button onClick={() => handleExport('pdf')} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white">PDF</button>
                            {permissions.export?.quality && (
                                <button
                                    onClick={() => setHighQuality(h => !h)}
                                    disabled={!canExportAdvanced}
                                    title={!canExportAdvanced ? 'Haute qualité réservé aux comptes payants' : 'Activer la haute qualité (300dpi)'}
                                    className={`px-3 py-2 text-xs rounded-lg ${canExportAdvanced ? (highQuality ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-200 hover:bg-white/10') : 'opacity-50 cursor-not-allowed bg-white/5 text-gray-500'}`}
                                >
                                    HQ
                                </button>
                            )}
                        </div>

                        {/* Bouton Export GIF - si pipeline présent */}
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
                    </div>
                </div>

                {/* Preview Area */}
                <div ref={previewAreaRef} className="flex h-52 sm:h-auto sm:flex-1 min-h-0 bg-gray-950/80 p-2 sm:p-4 items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                    {/* Contextual right-click menu for per-section styling */}
                    <OrchardContextMenu />

                    {/* Size placeholder: flex centering uses SCALED dimensions, not raw design dimensions */}
                    <div style={{ width: designSize.w * canvasScale, height: designSize.h * canvasScale, position: 'relative', flexShrink: 0, lineHeight: 0 }}>
                    <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, lineHeight: 0 }}>
                        <div
                            ref={exportRef}
                            className="shadow-2xl relative overflow-hidden"
                            style={{
                                width: designSize.w,
                                height: designSize.h,
                                background: previewBackground,
                                fontFamily: `"${previewFont}", Inter, sans-serif`,
                                color: previewTextColor,
                                '--accent': previewAccent,
                                borderRadius: '12px',
                            }}
                        >
                            {/* Template Canvas Content */}
                            {renderCanvasContent()}
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
                                        bottom: '16px',
                                        right: '16px',
                                        opacity: 0.35,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '5px',
                                            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            color: '#fff',
                                            boxShadow: '0 2px 6px rgba(139, 92, 246, 0.4)',
                                        }}
                                    >T</div>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            color: '#A78BFA',
                                            textShadow: '0 0 8px rgba(139, 92, 246, 0.4), 0 1px 3px rgba(0,0,0,0.3)',
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase',
                                            userSelect: 'none',
                                        }}
                                    >
                                        terpologie
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Close scale wrapper */}
                    </div>
                    {/* Close size placeholder */}
                    </div>

                    {/* Save to Library Modal — outside exportRef to avoid being captured in exports */}
                    {savingToLibrary && (
                        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                            <div className="bg-[#0f0f1a]/95 border border-white/10 p-6 rounded-xl w-[380px] max-w-[90%] shadow-2xl">
                                <h3 className="text-lg font-semibold text-white mb-3">Sauvegarder l'export</h3>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400">Nom</label>
                                    <input value={saveName} onChange={(e) => setSaveName(e.target.value)} className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 outline-none" placeholder={`Export ${new Date().toLocaleDateString()}`} />

                                    <label className="text-xs text-gray-400">Description (optionnel)</label>
                                    <textarea value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 outline-none" rows={3} />

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
                                        <button onClick={() => setSavingToLibrary(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">Annuler</button>
                                        <button
                                            onClick={async () => {
                                                setSaveError(null)
                                                setSaveLoading(true)
                                                try {
                                                    if (!exportRef.current) throw new Error('Aucune preview disponible')
                                                    const { toPng: _toPng } = await import('html-to-image')
                                                    const dataUrl = await _toPng(exportRef.current, { cacheBust: true, pixelRatio: highQuality ? 3 : 2, backgroundColor: null, style: { transform: 'none' } })
                                                    const imgResp = await fetch(dataUrl)
                                                    const blob = await imgResp.blob()
                                                    const filename = `export-${reviewName.replace(/\s+/g, '-')}-${Date.now()}.png`
                                                    const form = new FormData()
                                                    form.append('file', blob, filename)
                                                    if (reviewData?.id) form.append('reviewId', reviewData.id)
                                                    form.append('name', saveName || '')
                                                    form.append('description', saveDescription || '')
                                                    form.append('format', 'png')
                                                    form.append('templateName', selectedTemplate || 'modernCompact')
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

                                                    if (savePublic && reviewData?.id) {
                                                        try {
                                                            await fetch(`/api/reviews/${reviewData.id}/visibility`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ isPublic: true }),
                                                                credentials: 'include'
                                                            })
                                                        } catch (visErr) {
                                                            console.warn('[ExportMaker] Failed to update review visibility:', visErr)
                                                        }
                                                    }

                                                    setSavingToLibrary(false)
                                                    alert(savePublic
                                                        ? 'Export enregistré et review publiée dans la galerie !'
                                                        : 'Export enregistré dans votre bibliothèque'
                                                    )
                                                } catch (err) {
                                                    console.error(err)
                                                    setSaveError(err.message)
                                                } finally {
                                                    setSaveLoading(false)
                                                }
                                            }}
                                            disabled={saveLoading}
                                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                                        >
                                            {saveLoading ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Preview */}
                <div className="sm:hidden flex flex-col w-full min-h-[35vh] bg-gray-950/80 border-t border-white/10 overflow-hidden">
                    <div className="flex-1 flex items-center justify-center p-3 relative">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                        <div style={{ transform: `scale(${Math.min(0.35, (window.innerWidth - 32) / designSize.w)})`, transformOrigin: 'center center', flexShrink: 0, lineHeight: 0 }}>
                            <div
                                className="shadow-lg relative overflow-hidden"
                                style={{
                                    width: designSize.w,
                                    height: designSize.h,
                                    background: previewBackground,
                                    fontFamily: `"${previewFont}", Inter, sans-serif`,
                                    color: previewTextColor,
                                    '--accent': previewAccent,
                                    borderRadius: '8px',
                                }}
                            >
                                {renderCanvasContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </LiquidGlass>
        </div>
    );
};

export default ExportMaker;





