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

/**
 * ExportMaker - Gestionnaire final d'exports
 * Intègre Drag & Drop (Phase 5) et Filigranes
 */
const ExportMaker = ({ reviewData, productType = 'flower', onClose }) => {
    const { isPremium, isProducer, isConsumer, accountType } = useAccountType();
    const exportRef = useRef(null);
    const [mode, setMode] = useState('templates'); // 'templates', 'custom', 'watermark'
    const [selectedTemplate, setSelectedTemplate] = useState('compact');
    const [format, setFormat] = useState('1:1');
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

    // Templates prédéfinis
    const templates = [
        { id: 'compact', name: 'Compact', icon: Grid, description: 'Idéal réseaux sociaux' },
        { id: 'detailed', name: 'Détaillé', icon: Layout, description: 'Vue d\'ensemble complète' },
        { id: 'story', name: 'Story', icon: Maximize2, description: 'Format vertical 9:16' },
        { id: 'influencer', name: 'Influenceur', icon: Star, description: 'Style premium', premium: true },
    ];

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
                scale: 2,
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <LiquidGlass variant="modal" className="w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden relative">

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
                            onClick={() => setMode('custom')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'custom' ? ' text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Custom
                        </button>
                        <button
                            onClick={() => setMode('watermark')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'watermark' ? ' text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Filigrane
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {mode === 'templates' && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Choisir un style</h3>
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedTemplate === t.id ? ' text-white' : 'bg-white/5 border-transparent text-gray-300 hover:bg-white/10'}`}
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
                                ))}
                            </div>
                        )}

                        {mode === 'custom' && (
                            <DragDropExport
                                productType={productType}
                                selectedSections={customSections}
                                onSectionsChange={setCustomSections}
                            />
                        )}

                        {mode === 'watermark' && (
                            <WatermarkEditor
                                watermark={watermark}
                                onWatermarkChange={setWatermark}
                            />
                        )}
                    </div>

                    {/* Actions footer */}
                    <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">
                        {/* Bouton Export GIF - Disponible pour tous si pipeline présent */}
                        {(reviewData?.pipelineGlobal || reviewData?.pipelineSeparation ||
                            reviewData?.pipelineExtraction || reviewData?.pipelineCuring) && (
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
                            )}

                        <FeatureGate hasAccess={isProducer} upgradeType="producer" showOverlay={false}>
                            <div className="flex gap-2">
                                <button onClick={() => handleExport('svg')} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white">SVG</button>
                                <button onClick={() => handleExport('pdf')} className="flex-1 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-white">PDF</button>
                            </div>
                        </FeatureGate>

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
                                        {reviewData.thc && <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">THC: {reviewData.thc}%</span>}
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
                                    {reviewData.images?.[0] ? (
                                        <img src={URL.createObjectURL(reviewData.images[0])} className="w-full h-full object-cover" alt="Product" />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500">
                                            <ImageIcon className="w-12 h-12 opacity-50" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Odeur', value: reviewData.odeurNote },
                                            { label: 'Goût', value: reviewData.goutNote },
                                            { label: 'Effets', value: reviewData.effetsIntensite },
                                            { label: 'Visuel', value: reviewData.visuelNote },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                                                <div className="text-xl font-bold text-white">{stat.value || '-'}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Custom Sections (Drag & Drop) */}
                                    {mode === 'custom' && customSections.map(section => (
                                        <div key={section.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-xs font-bold uppercase mb-1">{section.name}</div>
                                            <div className="text-white text-sm">Contenu de la section...</div>
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
                        {(accountType === 'consumer' || accountType === 'amateur' || !isPremium) && (
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





