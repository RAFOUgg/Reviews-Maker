import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// Heavy libs (html-to-image, jspdf) are loaded dynamically inside handlers
import { useOrchardStore } from '../../store/orchardStore';
import { useStore } from '../../store/useStore';
import { preloadFonts, preloadSpecificFont } from '../../utils/fontPreloader.js';
import {
    getExportFormatsForUI,
    getMaxExportQuality,
    canExportFormat,
    getAccountFeatures,
    ACCOUNT_TYPES
} from '../../config/exportConfig';
import InteractiveReviewCard from '../shared/orchard/InteractiveReviewCard';

// Ratio dimensions must match InteractiveReviewCard
const RATIO_DIMS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 },
};

/** Mini scaled preview that fits export-sized card into a small container */
function MiniPreview({ ratio }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(0.15);
    const dims = RATIO_DIMS[ratio] || RATIO_DIMS['1:1'];

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
                <InteractiveReviewCard mode="preview-export" />
            </div>
        </div>
    );
}

export default function ExportModal({ onClose }) {
    const reviewData = useOrchardStore((state) => state.reviewData);
    const config = useOrchardStore((state) => state.config);
    const user = useStore((state) => state.user);
    const authorName = reviewData?.ownerName || (reviewData?.author ? (typeof reviewData.author === 'string' ? reviewData.author : (reviewData.author.username || reviewData.author.id)) : null) || 'Orchard Studio'

    // Déterminer le type de compte utilisateur
    const accountType = user?.accountType?.type || ACCOUNT_TYPES.CONSUMER;
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
            const allPages = Array.from(document.querySelectorAll('.orchard-export-page'));

            // Fallback: single canvas element
            if (allPages.length === 0) {
                let container = document.getElementById('orchard-template-canvas')
                    || document.getElementById('orchard-preview-container');
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
                case 'markdown':
                    await exportMarkdown();
                    break;
                default:
                    throw new Error('Format non supporté');
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

    /** Clone a page element into an off-screen container and return [target, cleanup] */
    const prepareCapture = (container) => {
        const originalWidth = parseInt(container.dataset.width || container.style.width) || container.offsetWidth;
        const originalHeight = parseInt(container.dataset.height || container.style.height) || container.offsetHeight;

        const exportContainer = document.createElement('div');
        exportContainer.style.cssText = 'position:fixed;left:-99999px;top:0;z-index:-1;opacity:0;pointer-events:none;';
        document.body.appendChild(exportContainer);

        const target = container.cloneNode(true);
        if (!exportOptions.includeBranding) {
            target.querySelectorAll('.orchard-branding').forEach(b => b.remove());
        }

        const w = selectedScope === 'openGraph' ? 1200 : originalWidth;
        const h = selectedScope === 'openGraph' ? 630 : originalHeight;

        Object.assign(target.style, {
            width: `${w}px`, height: `${h}px`,
            maxWidth: 'none', maxHeight: 'none', minWidth: 'none', minHeight: 'none',
            transform: 'none', position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
        });

        exportContainer.appendChild(target);
        return { target, exportContainer, width: w, height: h };
    };

    /** Preload fonts and wait for render */
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

            const imgRatio = img.width / img.height;
            const pdfRatio = pageWidth / pageHeight;
            let imgW, imgH;
            if (imgRatio > pdfRatio) {
                imgW = pageWidth - 20;
                imgH = imgW / imgRatio;
            } else {
                imgH = pageHeight - 20;
                imgW = imgH * imgRatio;
            }
            const x = (pageWidth - imgW) / 2;
            const y = (pageHeight - imgH) / 2;

            if (i > 0) pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', x, y, imgW, imgH);
        }

        pdf.setProperties({
            title: reviewData.title || 'Review',
            author: reviewData.author || 'Orchard Studio',
            subject: 'Review Export',
            creator: 'Reviews-Maker Orchard Studio',
        });

        setExportProgress(95);
        setExportStatus('💾 Téléchargement...');
        pdf.save(`review-${reviewData.title || 'export'}-${Date.now()}.pdf`);
        setExportProgress(100);
        console.log(`✅ Export PDF success (${pages.length} page(s))`);
    };

    const exportMarkdown = async () => {
        let markdown = `# ${reviewData.title || 'Review'}\n\n`;

        if (reviewData.rating) {
            markdown += `**Note:** ${'★'.repeat(Math.floor(reviewData.rating))}${'☆'.repeat(5 - Math.floor(reviewData.rating))} (${reviewData.rating}/5)\n\n`;
        }

        if (reviewData.category) {
            markdown += `**Catégorie:** ${reviewData.category}\n\n`;
        }

        if (authorName) {
            markdown += `**Auteur:** ${authorName}\n`;
        }

        if (reviewData.date) {
            markdown += `**Date:** ${new Date(reviewData.date).toLocaleDateString('fr-FR')}\n\n`;
        }

        if (reviewData.thcLevel || reviewData.cbdLevel) {
            markdown += `## Composition\n\n`;
            if (reviewData.thcLevel) markdown += `- **THC:** ${reviewData.thcLevel}%\n`;
            if (reviewData.cbdLevel) markdown += `- **CBD:** ${reviewData.cbdLevel}%\n`;
            markdown += `\n`;
        }

        if (reviewData.description) {
            markdown += `## Description\n\n${reviewData.description}\n\n`;
        }

        if (reviewData.effects && reviewData.effects.length > 0) {
            markdown += `## Effets\n\n`;
            reviewData.effects.forEach(effect => {
                markdown += `- ${effect}\n`;
            });
            markdown += `\n`;
        }

        if (reviewData.aromas && reviewData.aromas.length > 0) {
            markdown += `## Arômes\n\n`;
            reviewData.aromas.forEach(aroma => {
                markdown += `- ${aroma}\n`;
            });
            markdown += `\n`;
        }

        if (reviewData.tags && reviewData.tags.length > 0) {
            markdown += `## Tags\n\n`;
            markdown += reviewData.tags.map(tag => `#${tag}`).join(' ') + '\n\n';
        }

        markdown += `---\n\n*Exporté depuis Orchard Studio - Reviews-Maker*\n`;

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `review-${reviewData.title || 'export'}-${Date.now()}.md`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10003] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
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

                    {/* Content: two-column layout with preview */}
                    <div className="p-6 flex gap-6 max-h-[65vh]">
                        {/* Left: live preview */}
                        <div className="hidden md:flex flex-col flex-shrink-0 w-[340px]">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Aperçu de l'export</h4>
                            <div className="flex-1 min-h-0 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <MiniPreview ratio={config?.ratio || '1:1'} />
                            </div>
                            <div className="mt-2 text-center">
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Format : <strong>{config?.ratio || '1:1'}</strong>
                                </span>
                            </div>
                        </div>
                        {/* Right: options */}
                        <div className="flex-1 space-y-6 overflow-y-auto">
                            {/* Scope selection (what to export) */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Étendue de l'export</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedScope('full')} className={`px-3 py-2 rounded-lg text-sm ${selectedScope === 'full' ? ' text-white' : 'bg-gray-50 text-gray-700'}`}>Entrée complète</button>
                                    <button onClick={() => setSelectedScope('canvas')} className={`px-3 py-2 rounded-lg text-sm ${selectedScope === 'canvas' ? ' text-white' : 'bg-gray-50 text-gray-700'}`}>Canvas uniquement</button>
                                    <button onClick={() => setSelectedScope('openGraph')} className={`px-3 py-2 rounded-lg text-sm ${selectedScope === 'openGraph' ? ' text-white' : 'bg-gray-50 text-gray-700'}`}>Social (Open Graph)</button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Choisissez si vous voulez exporter l'aperçu complet, le rendu (canvas) seulement, ou optimiser l'export pour les réseaux sociaux.</p>
                            </div>
                            {/* Format selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Format d'export</h4>
                                    <span className="text-xs px-2 py-1 rounded-full dark: dark:">
                                        {accountFeatures.name || 'Amateur'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {availableFormats.map((format) => (
                                        <motion.button
                                            key={format.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedFormat(format.id)}
                                            className={`p-4 rounded-xl text-left transition-all border-2 ${selectedFormat === format.id ? ' dark:' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:'}`}
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
                                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r dark:/20 dark:/20 border dark:">
                                        <p className="text-xs dark:">
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
                                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pngScale === scale ? ' text-white' : isDisabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
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
                                                className="w-4 h-4 rounded border-gray-300 focus:"
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
                                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r dark: dark: shadow-inner"
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
                                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pdfOrientation === 'portrait' ? ' text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                                >
                                                    Portrait
                                                </button>
                                                <button
                                                    onClick={() => setExportOptions({ ...exportOptions, pdfOrientation: 'landscape' })}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pdfOrientation === 'landscape' ? ' text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                                                >
                                                    Paysage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedFormat === 'markdown' && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Le fichier Markdown contiendra tous les détails textuels de la review dans un format portable et réutilisable.
                                    </p>
                                )}

                                {/* Option: include branding in export */}
                                <div className="mt-4 border-t pt-4">
                                    <label className={`flex items-center gap-2 ${accountFeatures.brandingRemoval ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={exportOptions.includeBranding}
                                            onChange={(e) => accountFeatures.brandingRemoval && setExportOptions({ ...exportOptions, includeBranding: e.target.checked })}
                                            disabled={!accountFeatures.brandingRemoval}
                                            className="w-4 h-4 rounded border-gray-300 focus: disabled:opacity-50"
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
                            </div>

                            {/* Status with Progress Bar */}
                            {exportStatus && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div
                                        className={`p-3 rounded-lg text-sm font-medium text-center ${exportStatus.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : exportStatus.startsWith('❌') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ' dark: dark:'}`}
                                    >
                                        {exportStatus}
                                    </div>

                                    {/* Progress Bar */}
                                    {isExporting && exportProgress < 100 && (
                                        <div className="relative h-3 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden border border-gray-400 dark:border-gray-500 shadow-inner">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r rounded-full shadow-lg"
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
                            disabled={isExporting}
                            className="flex-1 px-6 py-3 bg-gradient-to-r text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Export...
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





