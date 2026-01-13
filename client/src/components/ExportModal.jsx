import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
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
            // Always use the template canvas for exact dimensions
            let container = document.getElementById('orchard-template-canvas');

            if (!container) {
                // Fallback to preview container if canvas not found
                container = document.getElementById('orchard-preview-container');
            }

            if (!container) {
                throw new Error('Conteneur d\'aperçu introuvable');
            }

            switch (selectedFormat) {
                case 'png':
                    await exportPNG(container);
                    break;
                case 'jpeg':
                    await exportJPEG(container);
                    break;
                case 'pdf':
                    await exportPDF(container);
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

    const exportPNG = async (container) => {
        // Get original dimensions from the template canvas
        const originalWidth = parseInt(container.dataset.width || container.style.width) || container.offsetWidth;
        const originalHeight = parseInt(container.dataset.height || container.style.height) || container.offsetHeight;

        console.log('📸 Export PNG - Original dimensions:', { originalWidth, originalHeight });
        setExportProgress(20);
        setExportStatus('📦 Préparation du contenu...');

        // Create a dedicated export container that won't be scaled
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'fixed';
        exportContainer.style.left = '-99999px';
        exportContainer.style.top = '0';
        exportContainer.style.zIndex = '-1';
        exportContainer.style.opacity = '0';
        exportContainer.style.pointerEvents = 'none';
        document.body.appendChild(exportContainer);

        // Clone the template with all styles
        const target = container.cloneNode(true);

        // Remove branding if needed
        if (!exportOptions.includeBranding) {
            const brands = target.querySelectorAll('.orchard-branding');
            brands.forEach(b => b.remove());
        }

        // Force EXACT dimensions without any scaling or constraints
        target.style.width = selectedScope === 'openGraph' ? '1200px' : `${originalWidth}px`;
        target.style.height = selectedScope === 'openGraph' ? '630px' : `${originalHeight}px`;
        target.style.maxWidth = 'none';
        target.style.maxHeight = 'none';
        target.style.minWidth = 'none';
        target.style.minHeight = 'none';
        target.style.transform = 'none';
        target.style.position = 'relative';
        target.style.overflow = 'hidden'; // Prevent any overflow
        target.style.boxSizing = 'border-box';

        exportContainer.appendChild(target);

        setExportProgress(40);
        setExportStatus('🔤 Chargement des polices...');

        // Preload fonts - CRITICAL for professional export
        await preloadFonts();
        if (config?.typography?.fontFamily) {
            await preloadSpecificFont(config.typography.fontFamily);
        }

        setExportProgress(60);
        setExportStatus('🖼️ Chargement des images...');

        // Wait for all fonts, images and resources
        await document.fonts.ready;        // Force multiple reflows to ensure everything is rendered
        target.offsetHeight;
        target.scrollHeight;

        // Extra time for images and heavy content to render
        await new Promise(resolve => setTimeout(resolve, 800)); const finalWidth = selectedScope === 'openGraph' ? 1200 : originalWidth;
        const finalHeight = selectedScope === 'openGraph' ? 630 : originalHeight;
        const pixelRatio = selectedScope === 'openGraph' ? 3 : exportOptions.pngScale;

        console.log('📸 Capturing with:', { finalWidth, finalHeight, pixelRatio, transparent: exportOptions.pngTransparent });

        setExportProgress(80);
        setExportStatus('📸 Capture en cours...');

        try {
            const dataUrl = await toPng(target, {
                cacheBust: true,
                pixelRatio: pixelRatio,
                backgroundColor: exportOptions.pngTransparent ? 'transparent' : '#ffffff',
                width: finalWidth,
                height: finalHeight,
                style: {
                    width: `${finalWidth}px`,
                    height: `${finalHeight}px`,
                    transform: 'none'
                },
                // Include all fonts and styles
                fontEmbedCSS: true,
                skipAutoScale: true
            });

            setExportProgress(95);
            setExportStatus('💾 Téléchargement...');

            const link = document.createElement('a');
            link.download = `review-${reviewData.title || 'export'}-${selectedScope === 'openGraph' ? 'og-' : ''}${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            setExportProgress(100);
            console.log('✅ Export PNG success');
        } catch (error) {
            console.error('❌ Export PNG failed:', error);
            throw error;
        } finally {
            // Cleanup
            setTimeout(() => exportContainer.remove(), 1000);
        }
    };

    const exportJPEG = async (container) => {
        const originalWidth = parseInt(container.dataset.width || container.style.width) || container.offsetWidth;
        const originalHeight = parseInt(container.dataset.height || container.style.height) || container.offsetHeight;

        console.log('📸 Export JPEG - Original dimensions:', { originalWidth, originalHeight });

        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'fixed';
        exportContainer.style.left = '-99999px';
        exportContainer.style.top = '0';
        exportContainer.style.zIndex = '-1';
        exportContainer.style.opacity = '0';
        exportContainer.style.pointerEvents = 'none';
        document.body.appendChild(exportContainer);

        const target = container.cloneNode(true);

        if (!exportOptions.includeBranding) {
            const brands = target.querySelectorAll('.orchard-branding');
            brands.forEach(b => b.remove());
        }

        target.style.width = selectedScope === 'openGraph' ? '1200px' : `${originalWidth}px`;
        target.style.height = selectedScope === 'openGraph' ? '630px' : `${originalHeight}px`;
        target.style.maxWidth = 'none';
        target.style.maxHeight = 'none';
        target.style.minWidth = 'none';
        target.style.minHeight = 'none';
        target.style.transform = 'none';
        target.style.position = 'relative';
        target.style.overflow = 'hidden';
        target.style.boxSizing = 'border-box';

        exportContainer.appendChild(target);

        // Preload fonts for JPEG too
        await preloadFonts();
        if (config?.typography?.fontFamily) {
            await preloadSpecificFont(config.typography.fontFamily);
        }

        await document.fonts.ready;
        target.offsetHeight;
        target.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, 800));

        const finalWidth = selectedScope === 'openGraph' ? 1200 : originalWidth;
        const finalHeight = selectedScope === 'openGraph' ? 630 : originalHeight;

        console.log('📸 Capturing JPEG with:', { finalWidth, finalHeight, quality: exportOptions.jpegQuality });

        try {
            const dataUrl = await toJpeg(target, {
                cacheBust: true,
                quality: exportOptions.jpegQuality,
                backgroundColor: '#ffffff',
                width: finalWidth,
                height: finalHeight,
                style: {
                    width: `${finalWidth}px`,
                    height: `${finalHeight}px`,
                    transform: 'none'
                },
                fontEmbedCSS: true,
                skipAutoScale: true
            });

            const link = document.createElement('a');
            link.download = `review-${reviewData.title || 'export'}-${selectedScope === 'openGraph' ? 'og-' : ''}${Date.now()}.jpg`;
            link.href = dataUrl;
            link.click();

            console.log('✅ Export JPEG success');
        } catch (error) {
            console.error('❌ Export JPEG failed:', error);
            throw error;
        } finally {
            setTimeout(() => exportContainer.remove(), 1000);
        }
    };

    const exportPDF = async (container) => {
        const dataUrl = await toPng(container, {
            cacheBust: true,
            pixelRatio: 2
        });

        const pdf = new jsPDF({
            orientation: exportOptions.pdfOrientation,
            unit: 'mm',
            format: exportOptions.pdfFormat
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculer les dimensions de l'image pour qu'elle rentre dans la page
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

        // Ajouter les métadonnées
        pdf.setProperties({
            title: reviewData.title || 'Review',
            author: reviewData.author || 'Orchard Studio',
            subject: 'Review Export',
            creator: 'Reviews-Maker Orchard Studio'
        });

        pdf.save(`review-${reviewData.title || 'export'}-${Date.now()}.pdf`);
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
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
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

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
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
                                        className={`p-4 rounded-xl text-left transition-all border-2 ${selectedFormat === format.id ? ' dark:' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:' }`}
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
                                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pngScale === scale ? ' text-white' : isDisabled ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200' }`}
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
                                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pdfOrientation === 'portrait' ? ' text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' }`}
                                            >
                                                Portrait
                                            </button>
                                            <button
                                                onClick={() => setExportOptions({ ...exportOptions, pdfOrientation: 'landscape' })}
                                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${exportOptions.pdfOrientation === 'landscape' ? ' text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' }`}
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
                                    className={`p-3 rounded-lg text-sm font-medium text-center ${exportStatus.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : exportStatus.startsWith('❌') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ' dark: dark:' }`}
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
                    </div>

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

