import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Activity, Plus, Edit2, Trash2,
    ChevronDown, Info, Thermometer, Droplets, Package,
    Sun, Moon, Sprout, Download, Film
} from 'lucide-react';
import { LiquidCard, LiquidButton } from '../liquid';
import { exportPipelineToGIF, downloadGIF } from '../../utils/GIFExporter';

/**
 * PipelineGitHubGrid - Système de Pipeline GitHub-style CDC-compliant
 * 
 * Fonctionnalités CDC:
 * ✅ Trame configurable: jours, semaines, phases
 * ✅ Intervalles: secondes, minutes, heures, jour, semaine, mois
 * ✅ Cases éditables style GitHub commits (365 cases pour jours)
 * ✅ Système 3D: plan + temps
 * ✅ Support 12 phases prédéfinies culture
 * ✅ Tooltip au survol avec données
 * ✅ Modal d'édition par case
 * ✅ Intensité visuelle (vide → complet)
 */

// Phases prédéfinies pour culture fleurs (12 phases CDC)
export const CULTURE_PHASES = [
    { id: 'seed', name: 'Graine', icon: '🌰', duration: 1, color: '#8B4513' },
    { id: 'germination', name: 'Germination', icon: '🌱', duration: 3, color: '#228B22' },
    { id: 'seedling', name: 'Plantule', icon: '🌿', duration: 7, color: '#32CD32' },
    { id: 'early-veg', name: 'Début Croissance', icon: '🌳', duration: 14, color: '#00A86B' },
    { id: 'mid-veg', name: 'Milieu Croissance', icon: '🌲', duration: 14, color: '#008B45' },
    { id: 'late-veg', name: 'Fin Croissance', icon: '🎋', duration: 7, color: '#20B2AA' },
    { id: 'stretch', name: 'Stretch', icon: '⬆️', duration: 14, color: '#00CED1' },
    { id: 'early-flower', name: 'Début Floraison', icon: '🌸', duration: 14, color: '#FF69B4' },
    { id: 'mid-flower', name: 'Milieu Floraison', icon: '🌺', duration: 21, color: '#FF1493' },
    { id: 'late-flower', name: 'Fin Floraison', icon: '🌻', duration: 14, color: '#FFA500' },
    { id: 'drying', name: 'Séchage', icon: '💨', duration: 14, color: '#FBBF24' },
    { id: 'curing', name: 'Curing', icon: '📦', duration: 30, color: '#EAB308' }
];

// Types d'intervalles disponibles (CDC complet)
export const INTERVAL_TYPES = [
    { id: 'seconds', label: 'Secondes', unit: 's', max: 3600, gridCols: 60, defaultDuration: 60 },
    { id: 'minutes', label: 'Minutes', unit: 'min', max: 1440, gridCols: 60, defaultDuration: 60 },
    { id: 'hours', label: 'Heures', unit: 'h', max: 168, gridCols: 24, defaultDuration: 168 },
    { id: 'days', label: 'Jours', unit: 'j', max: 365, gridCols: 53, defaultDuration: 90 },
    { id: 'weeks', label: 'Semaines', unit: 'S', max: 52, gridCols: 52, defaultDuration: 12 },
    { id: 'months', label: 'Mois', unit: 'M', max: 12, gridCols: 12, defaultDuration: 6 },
    { id: 'phases', label: 'Phases', unit: 'P', max: 12, gridCols: 12, defaultDuration: 12 }
];

/**
 * Composant Case/Cellule individuelle style GitHub
 */
const PipelineCell = ({
    index,
    data,
    intensity = 0,
    onClick,
    intervalType,
    isPhaseMode = false,
    phaseName = '',
    phaseColor = '#4B5563'
}) => {
    const getIntensityColor = (level) => {
        if (isPhaseMode && level > 0) {
            return `border-2`;
        }

        if (level === 0) return 'bg-gray-800/30 border-gray-700/30';
        if (level === 1) return 'bg-green-900/40 border-green-700/50';
        if (level === 2) return 'bg-green-700/60 border-green-500/70';
        if (level === 3) return 'bg-green-500/80 border-green-400/90';
        return 'bg-green-400 border-green-300';
    };

    const getLabel = () => {
        if (isPhaseMode) return phaseName;
        const type = INTERVAL_TYPES.find(t => t.id === intervalType);
        return `${type?.unit}${index + 1}`;
    };

    return (
        <motion.div
            whileHover={{ scale: 1.15, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onClick(index, data)}
            className={`
        relative group cursor-pointer
        ${isPhaseMode ? 'w-8 h-8 md:w-10 md:h-10' : 'w-3 h-3 md:w-3.5 md:h-3.5'}
        rounded-sm
        ${getIntensityColor(intensity)}
        border transition-all duration-200
        hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/50
        hover:ring-2 hover:ring-blue-400/50
      `}
            style={isPhaseMode && intensity > 0 ? {
                backgroundColor: phaseColor + '80',
                borderColor: phaseColor
            } : {}}
            title={`${getLabel()} - ${data?.temperature ? data.temperature + '°C' : 'Non renseigné'}`}
        >
            {/* Indicateur phase (emoji) */}
            {isPhaseMode && (
                <div className="absolute inset-0 flex items-center justify-center text-lg">
                    {CULTURE_PHASES[index]?.icon}
                </div>
            )}

            {/* Tooltip au survol */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap border border-gray-700">
                    <div className="font-bold mb-1 text-blue-400">{getLabel()}</div>
                    {data ? (
                        <>
                            {data.temperature && <div>🌡️ {data.temperature}°C</div>}
                            {data.humidity && <div>💧 {data.humidity}%</div>}
                            {data.containerType && <div>📦 {data.containerType}</div>}
                            {data.notes && <div className="text-gray-400 mt-1 max-w-[200px] truncate">{data.notes}</div>}
                        </>
                    ) : (
                        <div className="text-gray-500">Cliquez pour éditer</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Modal d'édition d'une cellule
 */
const CellEditModal = ({
    isOpen,
    onClose,
    cellIndex,
    cellData,
    onSave,
    intervalType,
    isPhaseMode = false,
    phaseName = ''
}) => {
    const [formData, setFormData] = useState(cellData || {
        temperature: '',
        humidity: '',
        containerType: 'glass',
        packaging: 'none',
        notes: '',
        // Champs supplémentaires selon type
        lightHours: '',
        co2: '',
        ph: ''
    });

    const handleSave = () => {
        onSave(cellIndex, formData);
        onClose();
    };

    const getTitle = () => {
        if (isPhaseMode) return `Phase: ${phaseName}`;
        const type = INTERVAL_TYPES.find(t => t.id === intervalType);
        return `${type?.label} ${cellIndex + 1}`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-blue-400" />
                            {getTitle()}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Température */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-orange-400" />
                                Température (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.temperature}
                                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="18.5"
                            />
                        </div>

                        {/* Humidité */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-blue-400" />
                                Humidité relative (%)
                            </label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={formData.humidity}
                                onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                placeholder="62"
                            />
                        </div>

                        {/* Champs supplémentaires (optionnel) */}
                        <details className="bg-gray-800/50 rounded-lg p-3">
                            <summary className="cursor-pointer text-sm text-gray-300 font-medium flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Paramètres avancés
                            </summary>
                            <div className="space-y-3 mt-3">
                                {/* Lumière */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        Durée éclairage (h/jour)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="24"
                                        value={formData.lightHours}
                                        onChange={(e) => setFormData({ ...formData, lightHours: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                                        placeholder="18"
                                    />
                                </div>

                                {/* CO2 */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        CO₂ (ppm)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.co2}
                                        onChange={(e) => setFormData({ ...formData, co2: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                                        placeholder="400"
                                    />
                                </div>

                                {/* pH */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        pH
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="14"
                                        value={formData.ph}
                                        onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                                        placeholder="6.5"
                                    />
                                </div>
                            </div>
                        </details>

                        {/* Type de contenant */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4 text-purple-400" />
                                Type de contenant
                            </label>
                            <select
                                value={formData.containerType}
                                onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="glass">Verre</option>
                                <option value="plastic">Plastique</option>
                                <option value="metal">Métal</option>
                                <option value="open-air">Air libre</option>
                                <option value="grove-bag">Grove Bag</option>
                                <option value="other">Autre</option>
                            </select>
                        </div>

                        {/* Emballage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Emballage primaire
                            </label>
                            <select
                                value={formData.packaging}
                                onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="none">Aucun</option>
                                <option value="cellophane">Cellophane</option>
                                <option value="parchment">Papier cuisson</option>
                                <option value="aluminum">Aluminium</option>
                                <option value="hash-paper">Paper hash</option>
                                <option value="vacuum-bag">Sac sous vide</option>
                                <option value="vacuum-manual">Sous vide manuel</option>
                                <option value="freezer">Congélation</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Notes et observations
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                maxLength={500}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                placeholder="Observations, actions effectuées, événements..."
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {formData.notes?.length || 0}/500 caractères
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <LiquidButton
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Annuler
                        </LiquidButton>
                        <LiquidButton
                            variant="primary"
                            onClick={handleSave}
                            className="flex-1"
                        >
                            💾 Enregistrer
                        </LiquidButton>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Composant Principal PipelineGitHubGrid
 */
export default function PipelineGitHubGrid({
    value = {},
    onChange,
    type = 'curing', // 'curing', 'culture', 'extraction', 'recipe'
    productType = 'hash'
}) {
    // Configuration initiale
    const defaultConfig = {
        intervalType: type === 'culture' ? 'phases' : 'days',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        duration: type === 'culture' ? 12 : 30,
        curingType: 'cold'
    };

    // États
    const [config, setConfig] = useState(value.config || defaultConfig);
    const [cellsData, setCellsData] = useState(value.cells || {});
    const [editingCell, setEditingCell] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isExportingGIF, setIsExportingGIF] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const containerRef = useRef(null);

    // Handler pour export GIF
    const handleExportGIF = async () => {
        if (!containerRef.current) return;

        setIsExportingGIF(true);
        setExportProgress(0);

        try {
            const pipelineData = { config, cells: cellsData };
            const blob = await exportPipelineToGIF(pipelineData, containerRef.current, {
                delay: 200,
                quality: 10,
                onProgress: (percent) => setExportProgress(percent)
            });

            const filename = `pipeline-${type}-${productType}-${Date.now()}.gif`;
            downloadGIF(blob, filename);
        } catch (error) {
            console.error('❌ Export GIF failed:', error);
            alert('Erreur lors de l\'export GIF. Voir console pour détails.');
        } finally {
            setIsExportingGIF(false);
            setExportProgress(0);
        }
    };

    // Calcul nombre de cases
    const totalCells = useMemo(() => {
        if (config.intervalType === 'phases') {
            return CULTURE_PHASES.length;
        }

        if (config.endDate && config.startDate && (config.intervalType === 'days' || config.intervalType === 'weeks')) {
            const start = new Date(config.startDate);
            const end = new Date(config.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            switch (config.intervalType) {
                case 'days': return diffDays || 1;
                case 'weeks': return Math.ceil(diffDays / 7) || 1;
                default: return config.duration;
            }
        }

        return config.duration || 30;
    }, [config]);

    // Grid layout
    const gridCols = useMemo(() => {
        const type = INTERVAL_TYPES.find(t => t.id === config.intervalType);
        if (config.intervalType === 'phases') return 4; // 4 colonnes pour phases
        if (config.intervalType === 'days') return Math.min(totalCells, 53); // GitHub = 53 semaines
        return type?.gridCols || 30;
    }, [config.intervalType, totalCells]);

    // Handlers
    const handleCellClick = (index, data) => {
        setEditingCell({ index, data });
        setShowModal(true);
    };

    const handleCellSave = (index, data) => {
        const newCellsData = { ...cellsData, [index]: data };
        setCellsData(newCellsData);
        onChange?.({ config, cells: newCellsData });
    };

    const handleConfigChange = (key, val) => {
        const newConfig = { ...config, [key]: val };
        setConfig(newConfig);
        onChange?.({ config: newConfig, cells: cellsData });
    };

    const getCellIntensity = (index) => {
        const data = cellsData[index];
        if (!data) return 0;
        let level = 0;
        if (data.temperature) level++;
        if (data.humidity) level++;
        if (data.notes) level++;
        if (data.containerType && data.containerType !== 'glass') level++;
        return level;
    };

    const filledCellsCount = Object.keys(cellsData).length;
    const completionPercent = Math.round((filledCellsCount / totalCells) * 100);

    return (
        <LiquidCard padding="lg" className="space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-400" />
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            Pipeline {type === 'curing' ? 'Curing/Maturation' : type === 'culture' ? 'Culture' : 'Process'}
                        </h3>
                        <p className="text-sm text-gray-400">Style GitHub Commits - Tracabilité évolutive 3D</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Statistiques */}
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400">{completionPercent}%</div>
                        <div className="text-xs text-gray-400">{filledCellsCount}/{totalCells} cases</div>
                    </div>

                    {/* Export GIF (à implémenter) */}
                    <LiquidButton
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                        title="Export GIF disponible prochainement"
                        disabled
                    >
                        <Download className="w-4 h-4" />
                        GIF
                    </LiquidButton>
                </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700">
                {/* Type d'intervalle (Trame) */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Trame temporelle
                    </label>
                    <select
                        value={config.intervalType}
                        onChange={(e) => handleConfigChange('intervalType', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    >
                        {INTERVAL_TYPES.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.label} ({type.unit})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date début (si pas phases) */}
                {config.intervalType !== 'phases' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date début
                        </label>
                        <input
                            type="date"
                            value={config.startDate}
                            onChange={(e) => handleConfigChange('startDate', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>
                )}

                {/* Date fin OU durée */}
                {config.intervalType !== 'phases' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {(config.intervalType === 'days' || config.intervalType === 'weeks') ? 'Date fin (optionnel)' : 'Durée'}
                        </label>
                        {(config.intervalType === 'days' || config.intervalType === 'weeks') ? (
                            <input
                                type="date"
                                value={config.endDate}
                                onChange={(e) => handleConfigChange('endDate', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        ) : (
                            <input
                                type="number"
                                value={config.duration}
                                onChange={(e) => handleConfigChange('duration', parseInt(e.target.value) || 1)}
                                min={1}
                                max={INTERVAL_TYPES.find(t => t.id === config.intervalType)?.max || 100}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                        )}
                    </div>
                )}

                {/* Type curing (si curing) */}
                {type === 'curing' && config.intervalType !== 'phases' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            Type de curing
                        </label>
                        <select
                            value={config.curingType}
                            onChange={(e) => handleConfigChange('curingType', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="cold">❄️ Froid (&lt; 5°C)</option>
                            <option value="warm">🔥 Chaud (&gt; 5°C)</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Grille GitHub-style */}
            <div ref={containerRef} className="p-6 bg-black/20 rounded-xl border border-gray-700">
                {/* Header avec info + export */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Info className="w-4 h-4" />
                        <span>Cliquez sur une case pour éditer les données de cette période</span>
                    </div>

                    {/* Bouton export GIF */}
                    <LiquidButton
                        onClick={handleExportGIF}
                        disabled={isExportingGIF || Object.keys(cellsData).length === 0}
                        size="sm"
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        {isExportingGIF ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                <span>{exportProgress}%</span>
                            </>
                        ) : (
                            <>
                                <Film className="w-4 h-4" />
                                <span>Export GIF</span>
                            </>
                        )}
                    </LiquidButton>
                </div>

                {config.intervalType === 'phases' ? (
                    // Mode phases: Grille 4 colonnes
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CULTURE_PHASES.map((phase, idx) => (
                            <motion.div
                                key={phase.id}
                                whileHover={{ scale: 1.02 }}
                                className="relative p-4 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all cursor-pointer group border-2 border-gray-700 hover:border-blue-500"
                                onClick={() => handleCellClick(idx, cellsData[idx])}
                                style={cellsData[idx] ? {
                                    borderColor: phase.color,
                                    backgroundColor: phase.color + '15'
                                } : {}}
                            >
                                <div className="text-3xl mb-2 text-center">{phase.icon}</div>
                                <div className="text-center">
                                    <div className="font-semibold text-white text-sm">{phase.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">{phase.duration}j</div>
                                    {cellsData[idx] && (
                                        <div className="mt-2 text-xs text-blue-400 font-medium">
                                            ✓ Renseigné
                                        </div>
                                    )}
                                </div>

                                {/* Badge intensité */}
                                <div className={`
                  absolute top-2 right-2 w-3 h-3 rounded-full
                  ${getCellIntensity(idx) > 0 ? 'bg-green-400' : 'bg-gray-600'}
                `} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // Mode grille: Cases GitHub
                    <>
                        <div
                            className="grid gap-1"
                            style={{
                                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                                maxWidth: '100%'
                            }}
                        >
                            {Array.from({ length: totalCells }, (_, i) => (
                                <PipelineCell
                                    key={i}
                                    index={i}
                                    data={cellsData[i]}
                                    intensity={getCellIntensity(i)}
                                    onClick={handleCellClick}
                                    intervalType={config.intervalType}
                                />
                            ))}
                        </div>

                        {/* Légende intensité */}
                        <div className="flex items-center gap-4 mt-6 text-xs text-gray-400 flex-wrap">
                            <span className="font-medium">Intensité:</span>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-800/30 border border-gray-700/30 rounded-sm" />
                                <span>Vide</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-900/40 border border-green-700/50 rounded-sm" />
                                <span>Partiel</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500/80 border border-green-500/90 rounded-sm" />
                                <span>Rempli</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-400 border border-green-300 rounded-sm" />
                                <span>Complet</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal d'édition */}
            <CellEditModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                cellIndex={editingCell?.index}
                cellData={editingCell?.data}
                onSave={handleCellSave}
                intervalType={config.intervalType}
                isPhaseMode={config.intervalType === 'phases'}
                phaseName={config.intervalType === 'phases' ? CULTURE_PHASES[editingCell?.index]?.name : ''}
            />

            {/* Info footer */}
            <div className="text-xs text-gray-500 border-t border-gray-700 pt-4 space-y-1">
                <div>💡 <strong>Système 3D:</strong> Plan (données par case) + Temps (évolution sur la timeline)</div>
                <div>📊 <strong>Tracabilité:</strong> Chaque case peut contenir température, humidité, actions et observations</div>
                <div>🎨 <strong>Intensité:</strong> Plus une case est remplie, plus elle est verte (0-4 niveaux)</div>
            </div>
        </LiquidCard>
    );
}
