/**
 * Export Maker - Gestionnaire d'exports de reviews
 * Refonte complète selon cahier des charges CLAUDE.md
 * Design Apple-like avec Liquid Glass effects
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Eye, Settings, Image as ImageIcon, Type, Palette,
  Grid, Layout, Maximize2, FileImage, File, Save, X, Check,
  ChevronLeft, ChevronRight, Plus, Trash2, Copy, Sparkles,
  Share2, Zap, Star, Droplets, Flame, Leaf, Wind, Moon,
  Sun, Heart, Clock, Award, Lock, Unlock, Move, 
  Instagram, Twitter, Facebook, Mail, Link2
} from 'lucide-react';
import {
  EXPORT_FORMATS,
  TEMPLATE_TYPES,
  EXPORT_OPTIONS,
  getPredefinedTemplate,
  isTemplateAvailable,
  getMaxElements
} from '../../data/exportTemplates';

// ═══════════════════════════════════════════════════════════════════
// COMPOSANTS UI LIQUID GLASS
// ═══════════════════════════════════════════════════════════════════

// Bouton avec effet glass
const GlassButton = ({ children, onClick, variant = 'default', disabled, className = '', icon: Icon }) => {
  const variants = {
    default: 'bg-white/20 hover:bg-white/30 text-white border-white/30',
    primary: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-purple-400/50',
    secondary: 'bg-white/10 hover:bg-white/20 text-white/90 border-white/20',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-emerald-400/50',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-red-400/50',
    ghost: 'bg-transparent hover:bg-white/10 text-white/80 border-transparent'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
        backdrop-blur-md border shadow-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );
};

// Card avec effet liquid glass
const GlassCard = ({ children, className = '', padding = true }) => (
  <div className={`
    backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20
    shadow-[0_8px_32px_rgba(0,0,0,0.1)]
    ${padding ? 'p-4' : ''} ${className}
  `}>
    {children}
  </div>
);

// Badge avec effet glow
const GlowBadge = ({ children, color = 'purple', icon: Icon, size = 'md' }) => {
  const colors = {
    purple: 'from-purple-500 to-indigo-500 shadow-purple-500/30',
    emerald: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    pink: 'from-pink-500 to-rose-500 shadow-pink-500/30',
    blue: 'from-blue-500 to-cyan-500 shadow-blue-500/30',
    gray: 'from-gray-500 to-slate-500 shadow-gray-500/30'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r 
      ${colors[color]} text-white font-semibold shadow-lg ${sizes[size]}
    `}>
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      {children}
    </span>
  );
};

// Barre de score circulaire
const CircularScore = ({ value, max = 10, size = 60, strokeWidth = 6, color = 'purple' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * circumference;
  
  const colors = {
    purple: { stroke: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.2)' },
    emerald: { stroke: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' },
    amber: { stroke: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
    pink: { stroke: '#EC4899', bg: 'rgba(236, 72, 153, 0.2)' },
    blue: { stroke: '#3B82F6', bg: 'rgba(59, 130, 246, 0.2)' }
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[color].bg}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[color].stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL EXPORT MAKER
// ═══════════════════════════════════════════════════════════════════

const ExportMaker = ({ reviewData, productType = 'Fleurs', accountType = 'Amateur', onClose, onSave }) => {
  // ─────────────────────────────────────────────────────────────────
  // ÉTATS
  // ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedFormat, setSelectedFormat] = useState('square');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exportQuality, setExportQuality] = useState('web');
  const [exportFileFormat, setExportFileFormat] = useState('png');
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Personnalisation (selon type de compte)
  const [customization, setCustomization] = useState({
    colorScheme: 'violet',
    darkMode: false,
    showWatermark: accountType === 'Amateur',
    showBranding: true,
    fontFamily: 'Inter',
    borderRadius: 'rounded',
    imageEffect: 'none',
    imagePosition: 'center',
    customWatermark: null
  });

  // Mode drag & drop pour templates personnalisés
  const [dragDropMode, setDragDropMode] = useState(false);
  const [customElements, setCustomElements] = useState([]);

  const canvasRef = useRef(null);
  const exportContainerRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────
  // PERMISSIONS SELON TYPE DE COMPTE
  // ─────────────────────────────────────────────────────────────────
  const permissions = useMemo(() => {
    const isProducer = accountType === 'Producteur' || accountType === 'producer' || accountType === 'beta_tester';
    const isInfluencer = accountType === 'Influenceur' || accountType === 'influencer_pro';
    const isPremium = isProducer || isInfluencer;

    return {
      canExportHighQuality: isPremium,
      canExportSVG: isPremium,
      canExportPDF: true,
      canExportCSV: isProducer,
      canExportJSON: isProducer,
      canExportHTML: isProducer,
      canDragDrop: isPremium,
      canCustomTemplates: isPremium,
      canCustomFonts: isProducer,
      canRemoveWatermark: isPremium,
      canAddCustomWatermark: isPremium,
      maxPages: isProducer ? 9 : (isInfluencer ? 5 : 1),
      maxDPI: isProducer ? 300 : (isInfluencer ? 300 : 150),
      formats: isProducer 
        ? ['png', 'jpeg', 'svg', 'pdf', 'csv', 'json', 'html']
        : isPremium 
          ? ['png', 'jpeg', 'svg', 'pdf']
          : ['png', 'jpeg', 'pdf']
    };
  }, [accountType]);

  // ─────────────────────────────────────────────────────────────────
  // DONNÉES NORMALISÉES
  // ─────────────────────────────────────────────────────────────────
  const normalizedData = useMemo(() => {
    if (!reviewData) return {};

    return {
      // Infos générales
      name: reviewData.holderName || reviewData.nomCommercial || reviewData.productName || 'Sans nom',
      cultivar: reviewData.cultivar || reviewData.variety || reviewData.strain || '',
      cultivars: reviewData.cultivars || [],
      breeder: reviewData.breeder || '',
      farm: reviewData.farm || '',
      hashmaker: reviewData.hashmaker || '',
      
      // Type et classification
      type: reviewData.strainType || reviewData.type || productType,
      indicaRatio: reviewData.indicaRatio,
      sativaRatio: reviewData.sativaRatio,
      
      // Données analytiques
      thc: reviewData.thcPercent || reviewData.thc,
      cbd: reviewData.cbdPercent || reviewData.cbd,
      cbg: reviewData.cbgPercent || reviewData.cbg,
      terpenes: reviewData.terpenes || reviewData.terpeneProfile || [],
      
      // Images
      images: reviewData.images || [],
      mainImage: reviewData.mainImage || reviewData.images?.[0],
      
      // Scores par catégorie
      visual: {
        density: reviewData.visualDensity || reviewData.visual?.density,
        color: reviewData.visualColor || reviewData.visual?.color,
        trichomes: reviewData.visualTrichomes || reviewData.visual?.trichomes,
        pistils: reviewData.visualPistils || reviewData.visual?.pistils,
        manucure: reviewData.visualManucure || reviewData.visual?.manucure,
        average: reviewData.visualAverage || reviewData.visual?.average
      },
      odor: {
        intensity: reviewData.odorIntensity || reviewData.odor?.intensity,
        piquant: reviewData.odorPiquant || reviewData.odor?.piquant,
        dominant: reviewData.dominantAromas || reviewData.odor?.dominant || [],
        secondary: reviewData.secondaryAromas || reviewData.odor?.secondary || [],
        average: reviewData.odorAverage || reviewData.odor?.average
      },
      texture: {
        density: reviewData.textureDensity || reviewData.texture?.density,
        elasticity: reviewData.textureElasticity || reviewData.texture?.elasticity,
        humidity: reviewData.textureHumidity || reviewData.texture?.humidity,
        sticky: reviewData.textureSticky || reviewData.texture?.sticky,
        average: reviewData.textureAverage || reviewData.texture?.average
      },
      taste: {
        intensity: reviewData.tasteIntensity || reviewData.taste?.intensity,
        piquant: reviewData.tastePiquant || reviewData.taste?.piquant,
        dryPuff: reviewData.dryPuffNotes || reviewData.taste?.dryPuff || [],
        inhalation: reviewData.inhalationNotes || reviewData.taste?.inhalation || [],
        expiration: reviewData.expirationNotes || reviewData.taste?.expiration || [],
        average: reviewData.tasteAverage || reviewData.taste?.average
      },
      effects: {
        intensity: reviewData.effectsIntensity || reviewData.effects?.intensity,
        onset: reviewData.effectsOnset || reviewData.effects?.onset,
        selected: reviewData.selectedEffects || reviewData.effects?.selected || [],
        duration: reviewData.effectsDuration || reviewData.effects?.duration,
        average: reviewData.effectsAverage || reviewData.effects?.average
      },
      
      // Pipelines
      culturePipeline: reviewData.culturePipeline,
      curingPipeline: reviewData.curingPipeline,
      separationPipeline: reviewData.separationPipeline,
      extractionPipeline: reviewData.extractionPipeline,
      
      // Note globale
      overallRating: reviewData.overallRating || reviewData.rating,
      
      // Métadonnées
      createdAt: reviewData.createdAt,
      author: reviewData.author || reviewData.holderName
    };
  }, [reviewData, productType]);

  // ─────────────────────────────────────────────────────────────────
  // SCHÉMAS DE COULEURS (THÈMES)
  // ─────────────────────────────────────────────────────────────────
  const colorSchemes = {
    violet: { 
      name: 'Violet Lean',
      gradient: 'from-violet-600 via-purple-600 to-indigo-700',
      primary: '#8B5CF6', 
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.7)'
    },
    emerald: { 
      name: 'Vert Émeraude',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
      primary: '#10B981', 
      secondary: '#34D399',
      accent: '#6EE7B7',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.7)'
    },
    tahiti: { 
      name: 'Bleu Tahiti',
      gradient: 'from-cyan-600 via-sky-600 to-blue-700',
      primary: '#06B6D4', 
      secondary: '#22D3EE',
      accent: '#67E8F9',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.7)'
    },
    sakura: { 
      name: 'Sakura',
      gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
      primary: '#EC4899', 
      secondary: '#F472B6',
      accent: '#FBCFE8',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.7)'
    },
    midnight: { 
      name: 'Minuit',
      gradient: 'from-slate-800 via-gray-900 to-zinc-900',
      primary: '#334155', 
      secondary: '#475569',
      accent: '#94A3B8',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.6)'
    }
  };

  const currentScheme = colorSchemes[customization.colorScheme] || colorSchemes.violet;
  const currentFormat = EXPORT_FORMATS[selectedFormat];
  const currentTemplateType = TEMPLATE_TYPES[selectedTemplate];

  // ─────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const quality = EXPORT_OPTIONS.quality[exportQuality];
      const scale = Math.min(quality?.dpi || 72, permissions.maxDPI) / 72;

      const canvas = await html2canvas(canvasRef.current, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const safeName = normalizedData.name?.replace(/[^a-zA-Z0-9]/g, '-') || 'review';
      const filename = `${safeName}-${selectedTemplate}-${timestamp}`;

      if (exportFileFormat === 'png' || exportFileFormat === 'jpeg') {
        const mimeType = `image/${exportFileFormat}`;
        const dataUrl = canvas.toDataURL(mimeType, exportFileFormat === 'jpeg' ? 0.92 : 1);
        downloadFile(dataUrl, `${filename}.${exportFileFormat}`);
      } else if (exportFileFormat === 'pdf') {
        try {
          const { jsPDF } = await import('jspdf');
          const format = EXPORT_FORMATS[selectedFormat];
          const pdf = new jsPDF({
            orientation: format.width > format.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [format.width, format.height]
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          pdf.addImage(imgData, 'JPEG', 0, 0, format.width, format.height);
          pdf.save(`${filename}.pdf`);
        } catch {
          // Fallback PNG
          const dataUrl = canvas.toDataURL('image/png');
          downloadFile(dataUrl, `${filename}.png`);
        }
      } else if (exportFileFormat === 'json' && permissions.canExportJSON) {
        const jsonData = JSON.stringify(reviewData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        downloadFile(URL.createObjectURL(blob), `${filename}.json`);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveTemplate = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({
        format: selectedFormat,
        template: selectedTemplate,
        customization,
        customElements: dragDropMode ? customElements : []
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDU DU TEMPLATE (APERÇU)
  // ─────────────────────────────────────────────────────────────────
  const renderPreviewContent = () => {
    const isMinimal = selectedTemplate === 'minimal';
    const isDetailed = selectedTemplate === 'detailed';
    const isCustom = selectedTemplate === 'custom';

    return (
      <div 
        className={`w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-br ${currentScheme.gradient}`}
      >
        {/* Effet Liquid Glass Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/3 -right-1/3 w-2/3 h-2/3 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-white/5 blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full bg-white/5 blur-[60px]" />
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 flex flex-col h-full p-6">
          {/* HEADER */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-1">
              {normalizedData.name}
            </h1>
            {normalizedData.cultivar && (
              <p className="text-white/80 text-sm font-medium">{normalizedData.cultivar}</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <GlowBadge color="purple" icon={Leaf}>{normalizedData.type || productType}</GlowBadge>
              {normalizedData.farm && <GlowBadge color="emerald">{normalizedData.farm}</GlowBadge>}
              {normalizedData.hashmaker && <GlowBadge color="amber">{normalizedData.hashmaker}</GlowBadge>}
            </div>
          </motion.div>

          {/* IMAGE PRINCIPALE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex items-center justify-center py-4"
          >
            <GlassCard className="relative max-w-[85%] overflow-hidden" padding={false}>
              {normalizedData.mainImage ? (
                <img
                  src={normalizedData.mainImage.startsWith('http') || normalizedData.mainImage.startsWith('data:') || normalizedData.mainImage.startsWith('blob:')
                    ? normalizedData.mainImage 
                    : `/uploads/review_images/${normalizedData.mainImage}`}
                  alt={normalizedData.name}
                  className="w-full h-auto rounded-xl object-cover"
                  style={{ 
                    maxHeight: selectedFormat === 'story' ? '280px' : '220px',
                    filter: customization.imageEffect === 'vintage' ? 'sepia(0.3) contrast(1.1)' :
                            customization.imageEffect === 'vivid' ? 'saturate(1.3) contrast(1.05)' :
                            customization.imageEffect === 'bw' ? 'grayscale(1)' : 'none'
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-48 h-48 bg-white/10 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-white/30" />
                </div>
              )}

              {/* Badge note globale sur l'image */}
              {normalizedData.overallRating && (
                <div className="absolute -bottom-3 -right-3 backdrop-blur-xl bg-white/90 rounded-2xl px-4 py-2 shadow-xl border border-white/50">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                    <span className="text-xl font-bold text-gray-800">{normalizedData.overallRating}</span>
                    <span className="text-sm text-gray-500">/10</span>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* DONNÉES ANALYTIQUES (THC/CBD) */}
          {!isMinimal && (normalizedData.thc || normalizedData.cbd) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 mb-4"
            >
              {normalizedData.thc && (
                <GlassCard className="text-center min-w-[80px]">
                  <div className="text-xs text-white/60 font-medium mb-1">THC</div>
                  <div className="text-2xl font-bold text-white">{normalizedData.thc}%</div>
                </GlassCard>
              )}
              {normalizedData.cbd && (
                <GlassCard className="text-center min-w-[80px]">
                  <div className="text-xs text-white/60 font-medium mb-1">CBD</div>
                  <div className="text-2xl font-bold text-white">{normalizedData.cbd}%</div>
                </GlassCard>
              )}
              {normalizedData.cbg && (
                <GlassCard className="text-center min-w-[80px]">
                  <div className="text-xs text-white/60 font-medium mb-1">CBG</div>
                  <div className="text-2xl font-bold text-white">{normalizedData.cbg}%</div>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* SCORES PAR CATÉGORIE */}
          {!isMinimal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-5 gap-2 mb-4"
            >
              {[
                { key: 'visual', icon: Eye, label: 'Visuel', value: normalizedData.visual?.average || normalizedData.visual?.density },
                { key: 'odor', icon: Wind, label: 'Odeur', value: normalizedData.odor?.average || normalizedData.odor?.intensity },
                { key: 'texture', icon: Droplets, label: 'Texture', value: normalizedData.texture?.average || normalizedData.texture?.density },
                { key: 'taste', icon: Flame, label: 'Goût', value: normalizedData.taste?.average || normalizedData.taste?.intensity },
                { key: 'effects', icon: Zap, label: 'Effets', value: normalizedData.effects?.average || normalizedData.effects?.intensity }
              ].map(({ key, icon: Icon, label, value }) => value && (
                <GlassCard key={key} className="text-center py-3 px-2">
                  <Icon className="w-4 h-4 text-white/70 mx-auto mb-1" />
                  <div className="text-[10px] text-white/60 mb-1">{label}</div>
                  <div className="text-lg font-bold text-white">{value}</div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {/* NOTES AROMATIQUES (Template détaillé) */}
          {isDetailed && normalizedData.odor?.dominant?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-1.5 justify-center mb-4"
            >
              {normalizedData.odor.dominant.slice(0, 5).map((aroma, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 backdrop-blur-md bg-white/15 rounded-full text-xs text-white border border-white/20"
                >
                  {typeof aroma === 'string' ? aroma : aroma.name || aroma.label}
                </span>
              ))}
            </motion.div>
          )}

          {/* EFFETS (Template détaillé) */}
          {isDetailed && normalizedData.effects?.selected?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-1.5 justify-center mb-4"
            >
              {normalizedData.effects.selected.slice(0, 4).map((effect, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 backdrop-blur-md bg-white/15 rounded-full text-xs text-white border border-white/20"
                >
                  {typeof effect === 'string' ? effect : effect.name || effect.label}
                </span>
              ))}
            </motion.div>
          )}

          {/* FOOTER */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <div className="flex items-center gap-2">
                {customization.showBranding && (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-medium">Reviews-Maker</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span>{currentTemplateType?.label}</span>
                <span>•</span>
                <span>{currentFormat?.ratio}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────
  // ONGLETS SIDEBAR
  // ─────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'templates', label: 'Templates', icon: Grid },
    { id: 'format', label: 'Format', icon: Layout },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'export', label: 'Export', icon: Download }
  ];

  // ─────────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-7xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.5)'
          }}
        >
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SIDEBAR GAUCHE - Configuration */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="w-80 bg-gray-50/80 border-r border-gray-200/50 flex flex-col">
            {/* Header Sidebar */}
            <div className={`p-5 bg-gradient-to-r ${currentScheme.gradient}`}>
              <div className="flex items-center gap-3 text-white">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileImage className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Export Maker</h2>
                  <p className="text-sm text-white/70 truncate max-w-[180px]">{normalizedData.name}</p>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-gray-200/50">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-xs font-medium transition-all ${
                    activeTab === tab.id 
                      ? 'text-purple-600 border-b-2 border-purple-500 bg-white/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mx-auto mb-1" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ONGLET TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-purple-500" />
                    Templates prédéfinis
                  </h3>
                  {Object.values(TEMPLATE_TYPES).map(template => {
                    const available = isTemplateAvailable(template.id, accountType);
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => available && setSelectedTemplate(template.id)}
                        disabled={!available}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25'
                            : available
                              ? 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-purple-300'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{template.icon}</span>
                            <span className="font-semibold">{template.label}</span>
                          </div>
                          {!available && (
                            <span className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              Pro
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {template.description}
                        </p>
                      </button>
                    );
                  })}

                  {/* Mode Drag & Drop (Pro) */}
                  {permissions.canDragDrop && (
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setDragDropMode(!dragDropMode)}
                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                          dragDropMode 
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Move className="w-5 h-5" />
                          <span className="font-medium">Mode personnalisé</span>
                        </div>
                        {dragDropMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <p className="text-xs text-gray-500 mt-2 px-1">
                        Drag & drop pour réorganiser les éléments
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET FORMAT */}
              {activeTab === 'format' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-500" />
                    Format d'export
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(EXPORT_FORMATS).map(format => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedFormat === format.id
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{format.icon}</div>
                        <div className="text-xs font-semibold">{format.label}</div>
                        <div className="text-[10px] opacity-70">{format.ratio}</div>
                      </button>
                    ))}
                  </div>
                  {currentFormat && (
                    <p className="text-xs text-gray-500 text-center">
                      {currentFormat.description} • {currentFormat.width}×{currentFormat.height}px
                    </p>
                  )}

                  {/* Pagination */}
                  {currentFormat?.maxPages > 1 && permissions.maxPages > 1 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Pages</span>
                        <span className="text-xs text-gray-500">Max {Math.min(currentFormat.maxPages, permissions.maxPages)}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-gray-700">
                          {currentPage} / {Math.min(totalPages, permissions.maxPages)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage >= totalPages || currentPage >= permissions.maxPages}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET STYLE */}
              {activeTab === 'style' && (
                <div className="space-y-4">
                  {/* Thème de couleurs */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-pink-500" />
                      Thème
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(colorSchemes).map(([key, scheme]) => (
                        <button
                          key={key}
                          onClick={() => setCustomization(c => ({ ...c, colorScheme: key }))}
                          className={`p-2 rounded-xl transition-all ${
                            customization.colorScheme === key
                              ? 'ring-2 ring-purple-500 ring-offset-2'
                              : ''
                          }`}
                        >
                          <div className={`h-8 rounded-lg bg-gradient-to-r ${scheme.gradient} mb-1`} />
                          <span className="text-[10px] font-medium text-gray-600">{scheme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Effet image */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Effet image</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'Normal' },
                        { id: 'vivid', label: 'Vif' },
                        { id: 'vintage', label: 'Vintage' },
                        { id: 'bw', label: 'N&B' }
                      ].map(effect => (
                        <button
                          key={effect.id}
                          onClick={() => setCustomization(c => ({ ...c, imageEffect: effect.id }))}
                          className={`p-2 rounded-lg text-xs font-medium transition-all ${
                            customization.imageEffect === effect.id
                              ? 'bg-purple-500 text-white'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {effect.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Options</h3>
                    
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-sm text-gray-700">Afficher branding</span>
                      <input
                        type="checkbox"
                        checked={customization.showBranding}
                        onChange={e => setCustomization(c => ({ ...c, showBranding: e.target.checked }))}
                        className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
                      />
                    </label>

                    {permissions.canRemoveWatermark ? (
                      <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                        <span className="text-sm text-gray-700">Filigrane</span>
                        <input
                          type="checkbox"
                          checked={customization.showWatermark}
                          onChange={e => setCustomization(c => ({ ...c, showWatermark: e.target.checked }))}
                          className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl text-gray-400">
                        <span className="text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Sans filigrane
                        </span>
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Pro</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ONGLET EXPORT */}
              {activeTab === 'export' && (
                <div className="space-y-4">
                  {/* Format fichier */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <File className="w-4 h-4 text-green-500" />
                      Format de fichier
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(EXPORT_OPTIONS.fileFormat).map(format => {
                        const allowed = permissions.formats.includes(format.id);
                        return (
                          <button
                            key={format.id}
                            onClick={() => allowed && setExportFileFormat(format.id)}
                            disabled={!allowed}
                            className={`p-3 rounded-xl text-center transition-all ${
                              exportFileFormat === format.id
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                                : allowed
                                  ? 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="text-lg mb-1">{format.icon}</div>
                            <div className="text-xs font-semibold">{format.label}</div>
                            {!allowed && <Lock className="w-3 h-3 mx-auto mt-1 text-gray-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Qualité */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Qualité</h3>
                    <div className="space-y-2">
                      {Object.values(EXPORT_OPTIONS.quality).map(quality => {
                        const allowed = quality.dpi <= permissions.maxDPI;
                        return (
                          <button
                            key={quality.id}
                            onClick={() => allowed && setExportQuality(quality.id)}
                            disabled={!allowed}
                            className={`w-full p-3 rounded-xl text-left transition-all ${
                              exportQuality === quality.id
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                : allowed
                                  ? 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{quality.label}</span>
                              <span className="text-xs opacity-70">{quality.dpi} DPI</span>
                            </div>
                            <p className={`text-xs mt-1 ${exportQuality === quality.id ? 'text-white/70' : 'text-gray-500'}`}>
                              {quality.description}
                            </p>
                            {!allowed && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                                <Lock className="w-3 h-3" />
                                Compte Pro requis
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Partage social */}
                  <div className="pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Partage direct</h3>
                    <div className="flex gap-2">
                      {[
                        { icon: Instagram, label: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
                        { icon: Twitter, label: 'Twitter', color: 'bg-sky-500' },
                        { icon: Facebook, label: 'Facebook', color: 'bg-blue-600' },
                        { icon: Mail, label: 'Email', color: 'bg-gray-600' }
                      ].map(social => (
                        <button
                          key={social.label}
                          onClick={() => alert(`Partage ${social.label} (à implémenter)`)}
                          className={`p-3 rounded-xl ${social.color} text-white hover:opacity-90 transition-opacity`}
                          title={social.label}
                        >
                          <social.icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ZONE CENTRALE - Aperçu */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8 overflow-auto">
            <div 
              ref={canvasRef}
              className="rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
              style={{
                width: `${Math.min(500, (currentFormat?.width || 500) / 2.5)}px`,
                aspectRatio: `${currentFormat?.width || 1} / ${currentFormat?.height || 1}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {renderPreviewContent()}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SIDEBAR DROITE - Actions */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="w-72 bg-white/80 border-l border-gray-200/50 flex flex-col">
            {/* Header actions */}
            <div className="p-5 border-b border-gray-200/50">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-gray-800 text-lg">Actions</h3>
              <p className="text-sm text-gray-500">Exportez ou sauvegardez</p>
            </div>

            {/* Boutons principaux */}
            <div className="p-5 space-y-3">
              <button
                onClick={handleSaveTemplate}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Sauvegarder aperçu
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r ${currentScheme.gradient} text-white rounded-xl transition-all font-semibold shadow-lg disabled:opacity-50`}
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Exporter {exportFileFormat.toUpperCase()}
                  </>
                )}
              </button>

              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                <Link2 className="w-5 h-5" />
                Copier le lien
              </button>
            </div>

            {/* Raccourcis clavier */}
            <div className="p-5 border-t border-gray-200/50">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Raccourcis</h4>
              <div className="space-y-2 text-xs">
                {[
                  { action: 'Exporter', keys: 'Ctrl+E' },
                  { action: 'Sauvegarder', keys: 'Ctrl+S' },
                  { action: 'Fermer', keys: 'Échap' }
                ].map(shortcut => (
                  <div key={shortcut.action} className="flex justify-between text-gray-500">
                    <span>{shortcut.action}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono">{shortcut.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Infos */}
            <div className="mt-auto p-5 bg-gray-50/80 border-t border-gray-200/50">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Informations</h4>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Compte</span>
                  <span className="font-medium text-gray-700">{accountType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Produit</span>
                  <span className="font-medium text-gray-700">{productType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="font-medium text-gray-700">{currentFormat?.width}×{currentFormat?.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Qualité</span>
                  <span className="font-medium text-gray-700">{EXPORT_OPTIONS.quality[exportQuality]?.dpi || 72} DPI</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportMaker;
