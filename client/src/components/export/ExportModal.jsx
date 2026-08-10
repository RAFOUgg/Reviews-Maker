import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Link2, Check } from 'lucide-react';
import { getLotCodeUrl } from '../../utils/lotCode';
import { getAvailableTimelapsePipelines, exportTimelapseToGIF, downloadTimelapseGIF, getTimelapseFrames, exportCanvasesToGIF } from '../../utils/TimelapseExporter';
import { exportCanvasesToVideo, downloadVideo } from '../../utils/videoExporter';
import { Film } from 'lucide-react';
// Heavy libs (html-to-image, jspdf) are loaded dynamically inside handlers
import { useExportMakerStore, resolveExportMakerConfig } from '../../store/exportMakerStore';
import { useExportMakerPagesStore } from '../../store/exportMakerPagesStore';
import { shouldAutoLockPagination } from '../../utils/exportMakerHelpers';
import { useAdaptivePages } from '../../hooks/useAdaptivePages';
import { useStore } from '../../store/useStore';
import { preloadFonts, preloadSpecificFont } from '../../utils/fontPreloader.js';
import {
    getExportFormatsForUI,
    getMaxExportQuality,
    canExportFormat,
    getAccountFeatures,
    resolveAccountTypeKey,
    ACCOUNT_PERMISSIONS,
    ACCOUNT_TYPES
} from '../../config/exportConfig';
import TemplateRenderer from './TemplateRenderer';
import WatermarkEditor from './WatermarkEditor';
import { DEFAULT_TEMPLATES } from '../../store/exportMakerConstants';
import { buildExportReviewData } from '../../utils/exportDataAdapter';
import { getFieldRegistry, GROUP_LABELS } from '../../utils/fieldRegistry';
import { serializeRenderToHtml, serializeMultiPageHtml, downloadHtml } from '../../utils/htmlExport';
import { computeContentHash } from '../../utils/exportSnapshot';
import { fitImageToPdfPage } from '../../utils/pdfLayout';
import { incrementExportCount } from '../../hooks/useUsageStats';

// Ratio dimensions must match TemplateRenderer
const RATIO_DIMS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 },
};

/**
 * Mini scaled preview that fits export-sized card into a small container.
 * Utilise TemplateRenderer (le même moteur que l'aperçu principal d'Export Maker /
 * Export Maker) pour que ce qui s'exporte corresponde exactement à ce qui est prévisualisé —
 * avant ce composant rendait InteractiveReviewCard, un renderer différent qui pouvait
 * afficher un template/des couleurs différents de ce que l'utilisateur venait de configurer.
 * canvasId distinct du canvas principal pour éviter un id dupliqué dans le DOM.
 */
function MiniPreview({ config, reviewData }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(0.15);
    const dims = RATIO_DIMS[config?.ratio] || RATIO_DIMS['1:1'];

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            if (width && height) {
                setScale(Math.min(width / dims.width, height / dims.height, 1) * 0.92);
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [dims.width, dims.height]);

    if (!config || !reviewData) return null;

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden bg-black/20 rounded-xl">
            <div
                style={{
                    width: dims.width,
                    height: dims.height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0,
                    borderRadius: 8,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
            >
                {/* Aperçu miniature de la modale d'export : c'est une prévisualisation de ce que
                    le FICHIER va contenir, donc rendue avec les mêmes réglages que la capture. */}
                <TemplateRenderer config={config} reviewData={reviewData} canvasId="export-maker-canvas-mini" interactive={false} />
            </div>
        </div>
    );
}

export default function ExportModal({ onClose, reviewData: reviewDataProp, config: configProp }) {
    // Deux façons d'alimenter ce modal : depuis Export Maker (aucune prop, tout vient du store
    // pendant l'édition live) ou en autonome — ex. le bouton "Exporter" de ReviewDetailPage, qui n'a
    // pas de session Export Maker ouverte derrière lui. `isStandalone` distingue les deux cas pour
    // savoir si CE modal doit lui-même monter un canvas de capture (cf. plus bas), ou s'appuyer sur
    // celui déjà rendu par le panneau d'édition.
    const isStandalone = Boolean(reviewDataProp);
    const storeReviewData = useExportMakerStore((state) => state.reviewData);
    const storeConfig = useExportMakerStore((state) => state.config);
    const reviewData = reviewDataProp || storeReviewData;
    // Review jamais éditée dans Export Maker (pas de config sauvegardée) : repli sur une config
    // par défaut sensée plutôt que de planter — la Fiche Technique Détaillée, pas le format compact
    // social, puisqu'on exporte ici un document de référence, pas un post réseau social.
    // `resolveExportMakerConfig` répare aussi le cas d'un `exportMakerConfig` PRÉSENT mais périmé (moins de
    // modules que le schéma courant) — sans ça, une review déjà configurée avant l'ajout de
    // nouvelles clés à DEFAULT_CONFIG.contentModules affichait un export presque vide.
    const config = resolveExportMakerConfig(configProp || storeConfig || {
        template: 'detailedCard',
        ratio: DEFAULT_TEMPLATES.detailedCard.defaultRatio,
    });

    // Pagination (Chantier Phase 2, corrigé 2026-07-27) : `useExportMakerPagesStore` est la session
    // d'édition Export Maker en cours — jamais persistée sur la review elle-même. Le chemin
    // standalone (bouton "Exporter" sur une review déjà sauvegardée, sans session Export Maker
    // ouverte) n'avait donc JAMAIS de pagination, quel que soit le volume réel de données : un
    // canevas à hauteur fixe (ex. 1080px en 16:9) avec `overflow:hidden` coupait silencieusement
    // tout ce qui dépassait — jusqu'à ~65% d'une fiche dense (pipelines complets, cf. Phase
    // précédente) pouvait disparaître sans aucun signal. Repli : si aucune session de pages n'est
    // active MAIS que le contenu est dense (même heuristique que `TemplateSelector`), générer des
    // pages par défaut via `getDefaultPages` (déjà utilisées par le mode édition) plutôt que de
    // rendre un unique canevas qui débordera silencieusement.
    const sessionPagesEnabled = useExportMakerPagesStore((state) => state.pagesEnabled);
    const sessionPages = useExportMakerPagesStore((state) => state.pages);
    const noSessionPages = !(sessionPagesEnabled && sessionPages.length > 1);
    // Pagination adaptative (Chantier D, 2026-07-31) : pour `detailedCard`, remplace le lookup
    // statique `getDefaultPages` par une vraie mesure de hauteur (voir `useAdaptivePages.js`) — le
    // hook retombe lui-même sur `getDefaultPages` pendant/à défaut de mesure, donc aucun risque
    // d'export vide. `enabled` désactive tout calcul (mesure incluse) quand une session de pages est
    // déjà active OU que le contenu est trop léger pour justifier une pagination.
    // `isMeasuring` était ignoré ici — seul l'aperçu Studio le consommait. Le commentaire ci-dessus
    // dit vrai (le repli statique évite un export VIDE), mais il évite le mauvais danger : pendant
    // la mesure, `getDefaultPages` rend des pages dont les identifiants ne correspondent à aucun
    // module réel du template, si bien que le filtre par page laisse TOUT passer sur CHAQUE page.
    // Mesuré le 2026-08-10 sur le Rapport de Traçabilité : 5 pages identiques remplies à 98,6 %,
    // là où la mesure terminée en produit 2 à 80,2/76,7 %. Un export complet mais faux est plus
    // trompeur qu'un export vide — il part chez le client sans que rien ne signale l'erreur.
    const { pages: adaptivePages, isMeasuring: isMeasuringPages } = useAdaptivePages(reviewData, config, {
        enabled: noSessionPages && shouldAutoLockPagination(reviewData, config?.template),
    });
    const autoPages = noSessionPages && shouldAutoLockPagination(reviewData, config?.template) ? adaptivePages : null;
    const pages = (sessionPagesEnabled && sessionPages.length > 1) ? sessionPages : (autoPages || []);
    const hasMultiplePages = pages.length > 1;
    const pageDims = RATIO_DIMS[config?.ratio] || RATIO_DIMS['1:1'];
    const user = useStore((state) => state.user);

    // Résout la vraie clé de tier ('influencer_basic'/'influencer_pro', pas juste 'influencer')
    // depuis accountType + roles — sans ça tout compte Influenceur payant retombait
    // silencieusement sur les permissions Consumer (perte de SVG/CSV/JSON/HTML et haute résolution).
    const accountType = resolveAccountTypeKey(user);
    const accountFeatures = getAccountFeatures(accountType);
    const availableFormats = getExportFormatsForUI(accountType);
    const maxQuality = getMaxExportQuality(accountType);

    const [selectedFormat, setSelectedFormat] = useState(availableFormats[0]?.id || 'png');
    const [selectedScope, setSelectedScope] = useState('full'); // full | canvas | openGraph
    const [exportOptions, setExportOptions] = useState({
        // PNG
        pngScale: Math.min(2, maxQuality / 72), // Limité par le type de compte
        pngTransparent: false,

        // JPEG
        jpegQuality: 0.9,

        // PDF
        pdfOrientation: 'portrait',
        pdfFormat: 'a4',

        includeBranding: !accountFeatures.brandingRemoval // Obligatoire pour comptes gratuits
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState(null);
    const [exportProgress, setExportProgress] = useState(0);
    const [linkCopied, setLinkCopied] = useState(false);
    // Export "évolutif" (Chantier C) — cf. utils/TimelapseExporter.js, généralisé depuis
    // CuringGIFExporter.js pour fonctionner sur n'importe quel pipeline (pas seulement curing).
    const availableTimelapses = useMemo(() => getAvailableTimelapsePipelines(reviewData), [reviewData]);
    const [selectedTimelapse, setSelectedTimelapse] = useState(availableTimelapses[0]?.key || null);
    const [timelapseGenerating, setTimelapseGenerating] = useState(false);
    const [timelapseProgress, setTimelapseProgress] = useState(0);
    // GIF/vidéo pleine carte (Phase 4) : cycle entre les pages configurées — distinct du timelapse
    // de pipeline ci-dessus, qui anime l'évolution d'UNE timeline plutôt que la fiche entière.
    const [fullCardGifGenerating, setFullCardGifGenerating] = useState(false);
    const [fullCardGifProgress, setFullCardGifProgress] = useState(0);
    const [fullCardVideoGenerating, setFullCardVideoGenerating] = useState(false);
    const [fullCardVideoProgress, setFullCardVideoProgress] = useState(0);
    // Filigrane personnalisé (Influenceur Pro/Producteur) — porté depuis l'ancien moteur
    // ExportMaker.jsx pour qu'il reste disponible une fois ce dernier retiré. Appliqué directement
    // sur le clone capturé dans prepareCapture(), pas sur l'aperçu live — fonctionne donc de façon
    // identique qu'on exporte depuis Export Maker ou en autonome (ReviewDetailPage).
    const [watermark, setWatermark] = useState({
        type: 'text',
        content: '',
        imageUrl: null,
        position: { x: 50, y: 90 },
        size: 20,
        opacity: 30,
        rotation: 0,
        color: '#ffffff',
        visible: false,
    });

    // Vérifier les permissions au changement de format
    useEffect(() => {
        if (!canExportFormat(accountType, selectedFormat)) {
            setSelectedFormat(availableFormats[0]?.id || 'png')
        }
    }, [selectedFormat, accountType, availableFormats])

    const handleExport = async () => {
        setIsExporting(true);
        setExportProgress(0);
        setExportStatus('🎨 Préparation de l\'export...');

        try {
            setExportProgress(10);

            // Gather all export pages (pagination support)
            const allPages = Array.from(document.querySelectorAll('.export-maker-page'));

            // Fallback: single canvas element
            if (allPages.length === 0) {
                let container = document.getElementById('export-maker-canvas')
                    || document.getElementById('export-maker-preview-container');
                if (!container) throw new Error('Conteneur d\'aperçu introuvable');
                allPages.push(container);
            }

            switch (selectedFormat) {
                case 'png':
                    await exportPNG(allPages);
                    break;
                case 'jpeg':
                    await exportJPEG(allPages);
                    break;
                case 'pdf':
                    await exportPDF(allPages);
                    break;
                case 'html':
                    await exportHTML(allPages);
                    break;
                case 'svg':
                    await exportSVG(allPages);
                    break;
                case 'csv':
                    await exportCSV();
                    break;
                case 'json':
                    await exportJSON();
                    break;
                default:
                    throw new Error('Format non supporté');
            }

            // Comptage d'usage réel (alimente l'onglet Statistiques de la Bibliothèque, qui
            // affichait jusqu'ici des totaux fictifs faute d'un seul export jamais tracké pour
            // les formats courants) — best-effort : un échec ici ne doit jamais invalider l'export
            // déjà téléchargé. Le figement (snapshot+hash) reste réservé au rapport de traçabilité :
            // un export image classique n'a pas vocation à être attesté plus tard.
            try {
                if (config?.template === 'traceabilityReport' && reviewData?.id) {
                    const snapshotData = buildExportReviewData(reviewData);
                    const contentHash = await computeContentHash(snapshotData);
                    await incrementExportCount(selectedFormat, 'standard', { reviewId: reviewData.id, snapshotData, contentHash });
                } else {
                    await incrementExportCount(selectedFormat, 'standard', reviewData?.id ? { reviewId: reviewData.id } : null);
                }
            } catch {
                // best-effort, cf. commentaire ci-dessus
            }

            setExportStatus('✅ Export réussi !');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setExportStatus(`❌ Erreur: ${error.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    /** Export "évolutif" (Chantier C) — anime la timeline de pipeline sélectionnée en GIF. */
    const handleGenerateTimelapse = async () => {
        if (!selectedTimelapse) return;
        setTimelapseGenerating(true);
        setTimelapseProgress(0);
        try {
            const frames = getTimelapseFrames(reviewData, selectedTimelapse);
            const pipelineLabel = availableTimelapses.find((p) => p.key === selectedTimelapse)?.label || 'Évolution';
            const blob = await exportTimelapseToGIF(frames, {
                title: pipelineLabel,
                onProgress: setTimelapseProgress,
            });
            downloadTimelapseGIF(blob, `${reviewData.title || 'review'}-${selectedTimelapse}-evolution-${Date.now()}.gif`);
        } catch (error) {
            setExportStatus(`❌ Erreur timelapse: ${error.message}`);
        } finally {
            setTimelapseGenerating(false);
            setTimelapseProgress(0);
        }
    };

    /** Rasterise chaque page `.export-maker-page` en canvas (même pipeline que les exports image :
     * prepareCapture + html-to-image) — étape commune au GIF et à la vidéo pleine carte ci-dessous. */
    const capturePageCanvases = async (onProgress) => {
        const pageNodes = Array.from(document.querySelectorAll('.export-maker-page'));
        if (pageNodes.length < 2) throw new Error('Au moins 2 pages configurées sont nécessaires');

        const { toCanvas } = await import('html-to-image');
        const canvases = [];
        for (let i = 0; i < pageNodes.length; i++) {
            onProgress?.(Math.round((i / pageNodes.length) * 100));
            await waitForReportReady(pageNodes[i]);
            const { target, exportContainer, width, height } = prepareCapture(pageNodes[i]);
            await waitForRender(target);
            try {
                const canvas = await toCanvas(target, {
                    cacheBust: true, width, height,
                    style: { width: `${width}px`, height: `${height}px`, transform: 'none' },
                    fontEmbedCSS: true,
                });
                canvases.push(canvas);
            } finally {
                exportContainer.remove();
            }
        }
        return canvases;
    };

    /** GIF pleine carte (Phase 4) — anime un cycle des pages configurées de la fiche (≥2 pages
     * requises ; distinct du timelapse de pipeline ci-dessus, qui anime UNE timeline plutôt que
     * la fiche entière). */
    const handleGenerateFullCardGif = async () => {
        setFullCardGifGenerating(true);
        setFullCardGifProgress(0);
        try {
            const canvases = await capturePageCanvases((p) => setFullCardGifProgress(Math.round(p * 0.7)));
            const blob = await exportCanvasesToGIF(canvases, {
                width: pageDims.width, height: pageDims.height,
                onProgress: (p) => setFullCardGifProgress(70 + Math.round(p * 0.3)),
            });
            downloadTimelapseGIF(blob, `${reviewData.title || reviewData.holderName || 'review'}-fiche-${Date.now()}.gif`);
        } catch (error) {
            setExportStatus(`❌ Erreur GIF: ${error.message}`);
        } finally {
            setFullCardGifGenerating(false);
            setFullCardGifProgress(0);
        }
    };

    /** Vidéo pleine carte (Phase 4) — même principe que le GIF ci-dessus, encodée en `.webm` via
     * `MediaRecorder` natif (approche retenue avec l'utilisateur : pas de dépendance ffmpeg.wasm). */
    const handleGenerateFullCardVideo = async () => {
        setFullCardVideoGenerating(true);
        setFullCardVideoProgress(0);
        try {
            const canvases = await capturePageCanvases((p) => setFullCardVideoProgress(Math.round(p * 0.5)));
            const blob = await exportCanvasesToVideo(canvases, {
                width: pageDims.width, height: pageDims.height,
                onProgress: (p) => setFullCardVideoProgress(50 + Math.round(p * 0.5)),
            });
            downloadVideo(blob, `${reviewData.title || reviewData.holderName || 'review'}-fiche-${Date.now()}.webm`);
        } catch (error) {
            setExportStatus(`❌ Erreur vidéo: ${error.message}`);
        } finally {
            setFullCardVideoGenerating(false);
            setFullCardVideoProgress(0);
        }
    };

    /** Clone a page element into an off-screen container and return [target, cleanup] */
    const prepareCapture = (container) => {
        const originalWidth = parseInt(container.dataset.width || container.style.width) || container.offsetWidth;
        const originalHeight = parseInt(container.dataset.height || container.style.height) || container.offsetHeight;

        const exportContainer = document.createElement('div');
        exportContainer.style.cssText = 'position:fixed;left:-99999px;top:0;z-index:-1;opacity:0;pointer-events:none;';
        document.body.appendChild(exportContainer);

        const target = container.cloneNode(true);
        if (!exportOptions.includeBranding) {
            target.querySelectorAll('.export-maker-branding').forEach(b => b.remove());
        }

        const w = selectedScope === 'openGraph' ? 1200 : originalWidth;
        const h = selectedScope === 'openGraph' ? 630 : originalHeight;

        Object.assign(target.style, {
            width: `${w}px`, height: `${h}px`,
            maxWidth: 'none', maxHeight: 'none', minWidth: 'none', minHeight: 'none',
            transform: 'none', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
        });

        // Filigrane personnalisé : injecté directement dans le clone capturé plutôt que dans
        // l'aperçu live — fonctionne donc identiquement que la capture vienne du canvas live
        // d'Export Maker ou du canvas caché monté en mode autonome (cf. isStandalone plus haut).
        if (watermark.visible && (watermark.content || watermark.imageUrl)) {
            const wm = document.createElement('div');
            Object.assign(wm.style, {
                position: 'absolute',
                left: `${watermark.position.x}%`,
                top: `${watermark.position.y}%`,
                transform: `translate(-50%, -50%) rotate(${watermark.rotation}deg)`,
                opacity: String(watermark.opacity / 100),
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 9999,
            });
            if (watermark.type === 'image' && watermark.imageUrl) {
                const img = document.createElement('img');
                img.src = watermark.imageUrl;
                img.style.maxWidth = `${watermark.size * 4}px`;
                wm.appendChild(img);
            } else {
                wm.textContent = watermark.content;
                wm.style.fontSize = `${watermark.size}px`;
                wm.style.color = watermark.color;
                wm.style.fontWeight = '600';
            }
            target.appendChild(wm);
        }

        exportContainer.appendChild(target);
        return { target, exportContainer, width: w, height: h };
    };

    /** Preload fonts and wait for render */
    // Rapport de traçabilité : son journal d'événements se charge en async après le premier rendu
    // (cf. useReviewEvents dans TraceabilityReportTemplate.jsx), qui pose data-report-ready="true"
    // sur son nœud racine une fois réglé. DOIT être attendu sur la source LIVE avant clonage —
    // prepareCapture fait un cloneNode(true) figé dans le temps : attendre après coup sur le clone
    // ne verrait jamais l'attribut changer, puisque le clone ne reçoit plus les mises à jour React
    // du nœud original. Borné à 5s pour ne jamais bloquer l'export si le fetch traîne anormalement.
    const waitForReportReady = async (sourceContainer) => {
        const reportMarker = sourceContainer.querySelector('[data-report-ready]');
        if (!reportMarker) return;
        const start = Date.now();
        while (reportMarker.getAttribute('data-report-ready') !== 'true' && Date.now() - start < 5000) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    };

    const waitForRender = async (target) => {
        await preloadFonts();
        if (config?.typography?.fontFamily) await preloadSpecificFont(config.typography.fontFamily);
        await document.fonts.ready;
        target.offsetHeight; // force reflow
        await new Promise(resolve => setTimeout(resolve, 600));
    };

    const exportPNG = async (pages) => {
        setExportProgress(20);
        setExportStatus('📦 Préparation du contenu...');

        const { toPng } = await import('html-to-image');
        const pixelRatio = selectedScope === 'openGraph' ? 3 : exportOptions.pngScale;
        const results = [];

        for (let i = 0; i < pages.length; i++) {
            setExportStatus(`📸 Capture page ${i + 1}/${pages.length}...`);
            setExportProgress(20 + Math.round((i / pages.length) * 60));

            await waitForReportReady(pages[i]);
            const { target, exportContainer, width, height } = prepareCapture(pages[i]);
            await waitForRender(target);

            try {
                const dataUrl = await toPng(target, {
                    cacheBust: true,
                    pixelRatio,
                    backgroundColor: exportOptions.pngTransparent ? 'transparent' : undefined,
                    width, height,
                    style: { width: `${width}px`, height: `${height}px`, transform: 'none' },
                    fontEmbedCSS: true,
                    skipAutoScale: true,
                });
                results.push(dataUrl);
            } finally {
                setTimeout(() => exportContainer.remove(), 500);
            }
        }

        setExportProgress(90);
        setExportStatus('💾 Téléchargement...');

        if (results.length === 1) {
            // Single page — direct download
            const link = document.createElement('a');
            link.download = `review-${reviewData.title || 'export'}-${selectedScope === 'openGraph' ? 'og-' : ''}${Date.now()}.png`;
            link.href = results[0];
            link.click();
        } else {
            // Multiple pages — download each individually
            for (let i = 0; i < results.length; i++) {
                const link = document.createElement('a');
                link.download = `review-${reviewData.title || 'export'}-p${i + 1}-${Date.now()}.png`;
                link.href = results[i];
                link.click();
                await new Promise(r => setTimeout(r, 300));
            }
        }

        setExportProgress(100);
        console.log(`✅ Export PNG success (${results.length} page(s))`);
    };

    const exportJPEG = async (pages) => {
        const { toJpeg } = await import('html-to-image');
        const results = [];

        for (let i = 0; i < pages.length; i++) {
            setExportStatus(`📸 Capture page ${i + 1}/${pages.length}...`);
            setExportProgress(20 + Math.round((i / pages.length) * 60));

            await waitForReportReady(pages[i]);
            const { target, exportContainer, width, height } = prepareCapture(pages[i]);
            await waitForRender(target);

            try {
                const dataUrl = await toJpeg(target, {
                    cacheBust: true,
                    quality: exportOptions.jpegQuality,
                    backgroundColor: '#ffffff',
                    width, height,
                    style: { width: `${width}px`, height: `${height}px`, transform: 'none' },
                    fontEmbedCSS: true,
                    skipAutoScale: true,
                });
                results.push(dataUrl);
            } finally {
                setTimeout(() => exportContainer.remove(), 500);
            }
        }

        setExportProgress(90);
        setExportStatus('💾 Téléchargement...');

        for (let i = 0; i < results.length; i++) {
            const link = document.createElement('a');
            const suffix = results.length > 1 ? `-p${i + 1}` : '';
            link.download = `review-${reviewData.title || 'export'}${suffix}-${Date.now()}.jpg`;
            link.href = results[i];
            link.click();
            if (results.length > 1) await new Promise(r => setTimeout(r, 300));
        }

        setExportProgress(100);
        console.log(`✅ Export JPEG success (${results.length} page(s))`);
    };

    const exportSVG = async (pages) => {
        // html-to-image#toSvg produit un SVG contenant un <foreignObject> HTML (pas un vrai
        // vectoriel éditable point par point) — c'est la seule voie SVG praticable pour un DOM
        // riche (flex/grid/texte/images) sans réécrire chaque template en primitives SVG.
        const { toSvg } = await import('html-to-image');
        const results = [];

        for (let i = 0; i < pages.length; i++) {
            setExportStatus(`🎨 Génération SVG page ${i + 1}/${pages.length}...`);
            setExportProgress(20 + Math.round((i / pages.length) * 60));

            await waitForReportReady(pages[i]);
            const { target, exportContainer, width, height } = prepareCapture(pages[i]);
            await waitForRender(target);

            try {
                const dataUrl = await toSvg(target, {
                    cacheBust: true,
                    width, height,
                    style: { width: `${width}px`, height: `${height}px`, transform: 'none' },
                    fontEmbedCSS: true,
                });
                results.push(dataUrl);
            } finally {
                setTimeout(() => exportContainer.remove(), 500);
            }
        }

        setExportProgress(90);
        setExportStatus('💾 Téléchargement...');

        for (let i = 0; i < results.length; i++) {
            const link = document.createElement('a');
            const suffix = results.length > 1 ? `-p${i + 1}` : '';
            link.download = `review-${reviewData.title || 'export'}${suffix}-${Date.now()}.svg`;
            link.href = results[i];
            link.click();
            if (results.length > 1) await new Promise(r => setTimeout(r, 300));
        }

        setExportProgress(100);
        console.log(`✅ Export SVG success (${results.length} page(s))`);
    };

    const exportPDF = async (pages) => {
        const { toPng } = await import('html-to-image');
        const { jsPDF } = await import('jspdf');

        const pdf = new jsPDF({
            orientation: exportOptions.pdfOrientation,
            unit: 'mm',
            format: exportOptions.pdfFormat,
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
            setExportStatus(`📸 Capture page ${i + 1}/${pages.length}...`);
            setExportProgress(20 + Math.round((i / pages.length) * 60));

            await waitForReportReady(pages[i]);
            const { target, exportContainer } = prepareCapture(pages[i]);
            await waitForRender(target);

            let dataUrl;
            try {
                dataUrl = await toPng(target, { cacheBust: true, pixelRatio: 2 });
            } finally {
                setTimeout(() => exportContainer.remove(), 500);
            }

            const img = new Image();
            img.src = dataUrl;
            await img.decode();

            // Calcul extrait dans `pdfLayout.js` et couvert par des tests : le pipeline PDF complet
            // n'est exercé par aucun outil, et je n'ai pas réussi à le piloter de bout en bout —
            // rendre la logique pure et testable vaut mieux qu'une conviction sur du code non couvert.
            const fit = fitImageToPdfPage(img.width, img.height, pageWidth, pageHeight);
            const { x, y, width: imgW, height: imgH } = fit;

            if (i > 0) pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', x, y, imgW, imgH);
        }

        pdf.setProperties({
            title: reviewData.title || 'Review',
            author: reviewData.author || 'Export Maker',
            subject: 'Review Export',
            creator: 'Reviews-Maker Export Maker',
        });

        setExportProgress(95);
        setExportStatus('💾 Téléchargement...');
        pdf.save(`review-${reviewData.title || 'export'}-${Date.now()}.pdf`);
        setExportProgress(100);
        console.log(`✅ Export PDF success (${pages.length} page(s))`);
    };

    const exportHTML = async (pages) => {
        // Rendu HTML autonome (fidèle à la galerie). Le canvas natif porte déjà toute la fiche ;
        // ses styles calculés sont à taille réelle (le scale d'aperçu vit sur le parent, pas capturé).
        setExportStatus('🌐 Génération du HTML…');
        const title = reviewData.title || reviewData.holderName || 'Fiche Reviews-Maker';
        const html = pages.length > 1
            ? await serializeMultiPageHtml(pages, { title })
            : await serializeRenderToHtml(pages[0], { title });
        const safe = String(title).replace(/[^\p{L}\p{N}\-_ ]/gu, '').trim().replace(/\s+/g, '-').toLowerCase() || 'fiche';
        downloadHtml(html, `${safe}.html`);
    };

    /** Télécharge un Blob texte sous un nom donné (fabrique commune CSV/JSON). */
    const downloadTextBlob = (content, mime, extension) => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `review-${reviewData.title || reviewData.holderName || 'export'}-${Date.now()}.${extension}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Types de champs non exportables tels quels en CSV/JSON à plat : 'view' ne porte aucune
    // donnée (juste un interrupteur d'affichage), 'rich'/'json' sont des objets imbriqués.
    const FLAT_EXPORTABLE_TYPES = new Set(['text', 'number', 'percent', 'score', 'date', 'bool', 'url', 'list']);

    const exportJSON = async () => {
        setExportStatus('🔧 Génération JSON…');
        const adapted = buildExportReviewData(reviewData);
        const fields = getFieldRegistry(reviewData.type);
        const payload = { exportedAt: new Date().toISOString(), source: 'Reviews-Maker Export Maker' };
        for (const f of fields) {
            if (f.type === 'view') continue;
            const value = adapted[f.key];
            if (value === undefined) continue;
            payload[f.key] = value;
        }
        downloadTextBlob(JSON.stringify(payload, null, 2), 'application/json', 'json');
        console.log('✅ Export JSON success');
    };

    const csvEscape = (value) => {
        const s = Array.isArray(value) ? value.join(' | ') : (typeof value === 'object' ? JSON.stringify(value) : String(value));
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const exportCSV = async () => {
        setExportStatus('📊 Génération CSV…');
        const adapted = buildExportReviewData(reviewData);
        const fields = getFieldRegistry(reviewData.type);
        const rows = [['Groupe', 'Champ', 'Valeur']];
        for (const f of fields) {
            if (!FLAT_EXPORTABLE_TYPES.has(f.type)) continue;
            const value = adapted[f.key];
            if (value === undefined || value === null || value === '') continue;
            rows.push([GROUP_LABELS[f.group] || f.group, f.label, value]);
        }
        // BOM UTF-8 pour qu'Excel n'affiche pas les accents comme des caractères mojibake.
        const csv = '﻿' + rows.map(r => r.map(csvEscape).join(';')).join('\n');
        downloadTextBlob(csv, 'text/csv;charset=utf-8', 'csv');
        console.log('✅ Export CSV success');
    };

    return (
        <>
            {/* En mode autonome (pas de session Export Maker ouverte derrière ce modal), il n'existe
                nulle part ailleurs de canvas #export-maker-canvas déjà monté à capturer — on en
                rend un ici, hors-écran, en plus du MiniPreview visible (qui, lui, utilise un canvasId
                distinct pour ne jamais entrer en collision avec celui-ci). */}
            {!hasMultiplePages && isStandalone && (
                <div style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none' }} aria-hidden="true">
                    {/* `interactive={false}` : cet arbre n'existe que pour être photographié. */}
                    <TemplateRenderer config={config} reviewData={reviewData} interactive={false} />
                </div>
            )}
            {/* Pagination : `handleExport` cherche `.export-maker-page` — sans ça il ne capture
                jamais que la page unique actuellement visible (le canvas simple ou l'aperçu paginé
                de PagedPreviewPane), qu'il y ait 1 ou 9 pages configurées. On monte donc ici TOUTES
                les pages hors-écran, chacune filtrée sur ses propres `modules` (même prop
                `activeModules`/`pageMode` que PagedPreviewPane pour la preview live), qu'on soit en
                mode autonome ou dans une session Export Maker ouverte. */}
            {hasMultiplePages && (
                <div style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none' }} aria-hidden="true">
                    {pages.map((page, i) => (
                        <div key={page.id} style={{ width: pageDims.width, height: pageDims.height }}>
                            <TemplateRenderer
                                config={config}
                                reviewData={reviewData}
                                canvasId={`export-maker-page-${i}`}
                                className="export-maker-page"
                                activeModules={page.modules}
                                pageModuleIds={page.adaptive ? page.modules : undefined}
                                pageMode
                                interactive={false}
                            />
                        </div>
                    ))}
                </div>
            )}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10003] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-[10003] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{ width: 'min(1180px, 96vw)', maxHeight: '92vh' }}
                    className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    Exporter la Review
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Choisissez votre format d'exportation
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content: preview stacked above options on mobile, side-by-side on desktop
                        (même pattern que ExportMakerPanel.jsx) — l'aperçu n'est plus jamais masqué. */}
                    <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
                        {/* Left: live preview */}
                        <div className="flex flex-col flex-shrink-0 w-full md:w-[380px] lg:w-[420px]">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Aperçu de l'export</h4>
                            {/* `h-[280px]` fixe (pas juste `min-h`) sur mobile : `MiniPreview` mesure sa
                                propre taille via `h-full` + ResizeObserver, qui a besoin d'une hauteur
                                RÉSOLUE sur ce parent pour ne pas s'effondrer sur la hauteur native
                                non-réduite du canevas (1080px) — sans quoi la vignette se retrouvait
                                centrée hors-écran (bug corrigé 2026-07-27). */}
                            <div className="h-[280px] md:h-auto md:flex-1 md:min-h-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <MiniPreview config={config} reviewData={reviewData} />
                            </div>
                            <div className="mt-2 text-center">
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Format : <strong>{config?.ratio || '1:1'}</strong>
                                </span>
                            </div>
                        </div>
                        {/* Right: options */}
                        <div className="flex-1 space-y-6 md:overflow-y-auto min-w-0">
                            {/* Lien vivant partageable (Export Maker, Chantier B) — contrairement aux
                                formats ci-dessous, ne fige rien : la page /r/:id re-rend toujours les
                                données actuelles de la review. Nécessite que la review soit publique,
                                même règle que le reste de la Galerie — pas de nouveau modèle de permission. */}
                            {reviewData?.id && (
                                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Lien vivant partageable</h4>
                                    </div>
                                    {reviewData.isPublic ? (
                                        <>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                Cette page se met à jour automatiquement si vous modifiez la review plus tard.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg flex-shrink-0">
                                                    <QRCodeSVG value={getLotCodeUrl(reviewData.id)} size={56} level="M" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        readOnly
                                                        value={getLotCodeUrl(reviewData.id)}
                                                        onFocus={(e) => e.target.select()}
                                                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(getLotCodeUrl(reviewData.id));
                                                                setLinkCopied(true);
                                                                setTimeout(() => setLinkCopied(false), 2000);
                                                            } catch { /* clipboard indisponible, l'utilisateur peut copier le champ à la main */ }
                                                        }}
                                                        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700"
                                                    >
                                                        {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                                                        {linkCopied ? 'Copié !' : 'Copier le lien'}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Rendez cette review publique pour obtenir un lien partageable.
                                        </p>
                                    )}
                                </div>
                            )}
                            {/* Export "évolutif" (Chantier C) — anime la timeline de pipeline choisie en
                                GIF. N'apparaît que si au moins un pipeline a ≥2 points de données réels. */}
                            {availableTimelapses.length > 0 && (
                                <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Film className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Évolution dans le temps</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        Génère un GIF animé de l'évolution des notes au fil de la timeline.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedTimelapse || ''}
                                            onChange={(e) => setSelectedTimelapse(e.target.value)}
                                            disabled={timelapseGenerating}
                                            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        >
                                            {availableTimelapses.map((p) => (
                                                <option key={p.key} value={p.key}>{p.label} ({p.frameCount} points)</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleGenerateTimelapse}
                                            disabled={timelapseGenerating}
                                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {timelapseGenerating ? `${timelapseProgress}%` : 'Générer le GIF'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* GIF/vidéo pleine carte (Phase 4) — cycle entre les pages configurées de la
                                fiche. N'apparaît que si la pagination est active avec au moins 2 pages :
                                une seule frame n'a aucune valeur, autant garder l'export image classique. */}
                            {hasMultiplePages && (
                                <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Film className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Fiche animée</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        Génère un GIF ou une vidéo qui feuillette les {pages.length} pages configurées de la fiche.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleGenerateFullCardGif}
                                            disabled={fullCardGifGenerating}
                                            className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
                                        >
                                            {fullCardGifGenerating ? `${fullCardGifProgress}%` : '🖼️ GIF'}
                                        </button>
                                        <button
                                            onClick={handleGenerateFullCardVideo}
                                            disabled={fullCardVideoGenerating}
                                            className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
                                        >
                                            {fullCardVideoGenerating ? `${fullCardVideoProgress}%` : '🎬 Vidéo'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Scope selection (what to export) */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Étendue de l'export</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setSelectedScope('full')} className={`px-3 py-2 rounded-lg text-sm ${selectedScope === 'full' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-700'}`}>Entrée complète</button>
                                    <button onClick={() => setSelectedScope('canvas')} className={`px-3 py-2 rounded-lg text-sm ${selectedScope === 'canvas' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-700'}`}>Canvas uniquement</button>
                                    <button onClick={() => setSelectedScope('openGraph')} className={`px-3 py-2 rounded-lg text-sm ${selectedScope === 'openGraph' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-700'}`}>Social (Open Graph)</button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Choisissez si vous voulez exporter l'aperçu complet, le rendu (canvas) seulement, ou optimiser l'export pour les réseaux sociaux.</p>
                            </div>
                            {/* Format selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Format d'export</h4>
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                        {ACCOUNT_PERMISSIONS[accountType]?.name || 'Amateur'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {availableFormats.map((format) => (
                                        <motion.button
                                            key={format.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedFormat(format.id)}
                                            className={`p-4 rounded-xl text-left transition-all border-2 ${selectedFormat === format.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300'}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-3xl">{format.icon}</span>
                                                <div className="flex items-center gap-1">
                                                    {format.premium && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold">
                                                            PRO
                                                        </span>
                                                    )}
                                                    {selectedFormat === format.id && (
                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {format.name}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {format.description}
                                            </p>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Message d'upgrade si format premium */}
                                {accountType === ACCOUNT_TYPES.CONSUMER && (
                                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
                                        <p className="text-xs text-purple-700 dark:text-purple-300">
                                            💎 <strong>Passez Premium</strong> pour débloquer SVG, CSV, JSON et HTML avec exports haute qualité (300 DPI)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Options spécifiques au format */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                    Options d'export
                                </h4>

                                {selectedFormat === 'png' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                Résolution: {exportOptions.pngScale}x (max {maxQuality} DPI)
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3].map((scale) => {
                                                    const dpi = scale * 72;
                                                    const isDisabled = dpi > maxQuality;
                                                    return (
                                                        <button
                                                            key={scale}
                                                            onClick={() => !isDisabled && setExportOptions({ ...exportOptions, pngScale: scale })}
                                                            disabled={isDisabled}
                                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pngScale === scale ? 'bg-purple-600 text-white' : isDisabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                                                        >
                                                            {scale}x {isDisabled && '🔒'}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            {maxQuality < 216 && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    💡 Passez Premium pour débloquer les exports haute résolution (300 DPI)
                                                </p>
                                            )}
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.pngTransparent}
                                                onChange={(e) => setExportOptions({ ...exportOptions, pngTransparent: e.target.checked })}
                                                className="w-4 h-4 rounded border-gray-300 focus:ring-purple-500"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Fond transparent
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {selectedFormat === 'jpeg' && (
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                            Qualité: {Math.round(exportOptions.jpegQuality * 100)}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="1"
                                            step="0.1"
                                            value={exportOptions.jpegQuality}
                                            onChange={(e) => setExportOptions({ ...exportOptions, jpegQuality: parseFloat(e.target.value) })}
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-300 to-purple-600 dark:from-purple-700 dark:to-purple-400 shadow-inner"
                                        />
                                    </div>
                                )}

                                {selectedFormat === 'pdf' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                Format de page
                                            </label>
                                            <select
                                                value={exportOptions.pdfFormat}
                                                onChange={(e) => setExportOptions({ ...exportOptions, pdfFormat: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            >
                                                <option value="a4">A4</option>
                                                <option value="letter">Lettre (US)</option>
                                                <option value="a3">A3</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                Orientation
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setExportOptions({ ...exportOptions, pdfOrientation: 'portrait' })}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pdfOrientation === 'portrait' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                                >
                                                    Portrait
                                                </button>
                                                <button
                                                    onClick={() => setExportOptions({ ...exportOptions, pdfOrientation: 'landscape' })}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pdfOrientation === 'landscape' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                                >
                                                    Paysage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Option: include branding in export */}
                                <div className="mt-4 border-t pt-4">
                                    <label className={`flex items-center gap-2 ${accountFeatures.brandingRemoval ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeBranding}
                                            onChange={(e) => accountFeatures.brandingRemoval && setExportOptions({ ...exportOptions, includeBranding: e.target.checked })}
                                            disabled={!accountFeatures.brandingRemoval}
                                            className="w-4 h-4 rounded border-gray-300 focus:ring-purple-500 disabled:opacity-50"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Inclure le logo/filigrane
                                        </span>
                                        {!accountFeatures.brandingRemoval && (
                                            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                                Obligatoire
                                            </span>
                                        )}
                                    </label>
                                    {!accountFeatures.brandingRemoval && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-6">
                                            💎 Le retrait du branding Reviews-Maker nécessite un compte Influenceur ou Producteur
                                        </p>
                                    )}
                                </div>

                                {/* Filigrane personnalisé (Influenceur Pro / Producteur) — porté depuis
                                    l'ancien moteur ExportMaker.jsx, appliqué sur le clone capturé
                                    (cf. prepareCapture) donc disponible pour tous les formats image. */}
                                <div className="mt-4 border-t pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                                        <input
                                            type="checkbox"
                                            checked={watermark.visible}
                                            onChange={(e) => setWatermark({ ...watermark, visible: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 focus:ring-purple-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            Filigrane personnalisé
                                        </span>
                                    </label>
                                    {watermark.visible && (
                                        <WatermarkEditor watermark={watermark} onWatermarkChange={setWatermark} />
                                    )}
                                </div>
                            </div>

                            {/* Status with Progress Bar */}
                            {exportStatus && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div
                                        className={`p-3 rounded-lg text-sm font-medium text-center ${exportStatus.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : exportStatus.startsWith('❌') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}
                                    >
                                        {exportStatus}
                                    </div>

                                    {/* Progress Bar */}
                                    {isExporting && exportProgress < 100 && (
                                        <div className="relative h-3 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden border border-gray-400 dark:border-gray-500 shadow-inner">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${exportProgress}%` }}
                                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                            />
                                            {/* Shimmer effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                                                style={{
                                                    backgroundSize: '200% 100%',
                                                    animation: 'shimmer 2s infinite'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Percentage */}
                                    {isExporting && (
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {exportProgress}%
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                        </div>{/* end right column */}
                    </div>{/* end flex container */}

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Annuler
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExport}
                            disabled={isExporting || isMeasuringPages}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isExporting || isMeasuringPages ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {isExporting ? 'Export...' : 'Calcul de la mise en page...'}
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Exporter
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </>
    );
}





