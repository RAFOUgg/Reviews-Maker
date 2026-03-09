import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiquidCard } from '../ui/LiquidUI';
import { ChevronLeft, ChevronRight, X, Thermometer, Droplets, Wind, Sun, Package, FlaskConical, Calendar, Clock, Beaker } from 'lucide-react';

/**
 * InteractivePipelineViewer – Interactive calendar-grid viewer for pipeline data
 * Used in the public gallery to let users drill into individual pipeline cells (days, weeks, phases)
 * Replaces the static step-list rendering with a rich, explorable interface.
 */

// Parse raw pipeline data from review (handles various shapes)
function parsePipelineSteps(pipeline) {
    if (!pipeline) return [];
    // rawSteps already parsed
    if (pipeline.rawSteps && Array.isArray(pipeline.rawSteps)) return pipeline.rawSteps;
    // cells object format (calendar-style): { 'phase-0': {...}, 'week-3': {...} }
    if (pipeline.cells && typeof pipeline.cells === 'object' && !Array.isArray(pipeline.cells)) {
        return Object.entries(pipeline.cells)
            .filter(([, v]) => v && typeof v === 'object' && Object.keys(v).length > 0)
            .map(([key, cell]) => ({ _cellKey: key, ...cell }));
    }
    // steps array (string labels)
    if (pipeline.steps && Array.isArray(pipeline.steps)) {
        return pipeline.steps.map(s => (typeof s === 'string' ? { label: s } : s));
    }
    // Generic array
    if (Array.isArray(pipeline)) return pipeline.map(s => typeof s === 'string' ? { label: s } : s);
    return [];
}

function getStepLabel(step, index) {
    return step.label || step.phase || step.semaine || step.date || step.jour || step._cellKey || `Étape ${index + 1}`;
}

function getMetricIcon(key) {
    const map = {
        temperature: Thermometer, temp: Thermometer,
        humidity: Droplets, humidite: Droplets, hr: Droplets,
        co2: Wind, ventilation: Wind,
        ppfd: Sun, dli: Sun, lumiere: Sun, light: Sun,
        container: Package, recipient: Package,
        packaging: Package, emballage: Package,
        method: FlaskConical, methode: FlaskConical,
        volume: Beaker, volumeRecipient: Beaker,
    };
    for (const [k, Icon] of Object.entries(map)) {
        if (key.toLowerCase().includes(k)) return Icon;
    }
    return null;
}

function getMetricUnit(key) {
    if (/temp/i.test(key)) return '°C';
    if (/humid|hr/i.test(key)) return '%';
    if (/co2/i.test(key)) return 'ppm';
    if (/ppfd/i.test(key)) return 'µmol/m²/s';
    if (/dli/i.test(key)) return 'mol/m²/j';
    if (/volume/i.test(key)) return 'L';
    return '';
}

// Keys to exclude from metric display
const EXCLUDED_KEYS = new Set([
    'label', 'phase', 'semaine', 'date', 'jour', '_cellKey', 'timestamp',
    'id', 'key', 'index', 'order', 'isEmpty', 'isActive',
]);

function extractMetrics(step) {
    if (!step || typeof step !== 'object') return [];
    return Object.entries(step)
        .filter(([k, v]) => !EXCLUDED_KEYS.has(k) && v !== null && v !== undefined && v !== '' && v !== false)
        .map(([key, value]) => {
            const Icon = getMetricIcon(key);
            const unit = getMetricUnit(key);
            const displayValue = typeof value === 'number' ? value : String(value);
            const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/_/g, ' ')
                .replace(/^\w/, c => c.toUpperCase())
                .trim();
            return { key, label, value: displayValue, unit, Icon };
        });
}

// Compute stats for a range of steps
function computeStats(steps) {
    const temps = steps.map(s => parseFloat(s.temperature ?? s.temp)).filter(v => !isNaN(v));
    const hums = steps.map(s => parseFloat(s.humidity ?? s.humidite ?? s.hr)).filter(v => !isNaN(v));
    const withData = steps.filter(s => extractMetrics(s).length > 0).length;

    return {
        avgTemp: temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : null,
        minTemp: temps.length ? Math.min(...temps) : null,
        maxTemp: temps.length ? Math.max(...temps) : null,
        avgHum: hums.length ? (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1) : null,
        minHum: hums.length ? Math.min(...hums) : null,
        maxHum: hums.length ? Math.max(...hums) : null,
        documented: withData,
        total: steps.length,
    };
}

// Single step detail panel
function StepDetailPanel({ step, index, onClose, colors }) {
    const label = getStepLabel(step, index);
    const metrics = extractMetrics(step);
    const note = step.note || step.comment || step.commentaire || '';
    const action = step.action || step.event || step.evenement || '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-[#12121e] border border-white/15 rounded-2xl p-5 shadow-2xl relative"
        >
            <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white">{label}</h4>
                    <span className="text-xs text-white/40">Étape {index + 1}</span>
                </div>
            </div>

            {action && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">Action</span>
                    <p className="text-sm text-white mt-0.5">{action}</p>
                </div>
            )}

            {metrics.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                    {metrics.map(m => (
                        <div key={m.key} className="bg-white/5 rounded-xl p-3 border border-white/8">
                            <div className="flex items-center gap-2 mb-1">
                                {m.Icon && <m.Icon className="w-3.5 h-3.5 text-purple-400" />}
                                <span className="text-xs text-white/50">{m.label}</span>
                            </div>
                            <div className="text-base font-bold text-white">
                                {m.value}
                                {m.unit && <span className="text-xs text-white/40 ml-1">{m.unit}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-white/30 italic mb-4">Aucune donnée enregistrée pour cette étape</p>
            )}

            {note && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                    <span className="text-xs text-white/40 block mb-1">💬 Note</span>
                    <p className="text-sm text-white/80 leading-relaxed">{note}</p>
                </div>
            )}
        </motion.div>
    );
}

export default function InteractivePipelineViewer({ pipeline, pipelineName, pipelineIcon, config }) {
    const [selectedStep, setSelectedStep] = useState(null);
    const [hoveredStep, setHoveredStep] = useState(null);

    const steps = useMemo(() => parsePipelineSteps(pipeline), [pipeline]);
    const stats = useMemo(() => computeStats(steps), [steps]);

    if (!steps.length) return null;

    // Determine if compact (>15 steps → calendar grid) or detailed (card list)
    const isCompact = steps.length > 15;

    // Compute color intensity per cell based on data richness
    const getCellIntensity = (step) => {
        const metrics = extractMetrics(step);
        if (metrics.length === 0) return 0;
        return Math.min(metrics.length / 5, 1); // 0..1 scale
    };

    return (
        <div className="space-y-4">
            {/* Pipeline Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{pipelineIcon || '⚗️'}</span>
                    <div>
                        <h3 className="text-lg font-bold text-white">{pipelineName || 'Pipeline'}</h3>
                        <span className="text-xs text-white/40">{steps.length} étape{steps.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
                {/* Mini stats */}
                <div className="flex items-center gap-3 text-xs text-white/50">
                    {stats.avgTemp && (
                        <span className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-orange-400" />
                            {stats.avgTemp}°C moy.
                        </span>
                    )}
                    {stats.avgHum && (
                        <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            {stats.avgHum}% moy.
                        </span>
                    )}
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full font-medium">
                        {stats.documented}/{stats.total}
                    </span>
                </div>
            </div>

            {/* Calendar Grid or Card List */}
            {isCompact ? (
                /* Calendar-style grid */
                <div>
                    <div className="flex flex-wrap gap-1.5">
                        {steps.map((step, i) => {
                            const intensity = getCellIntensity(step);
                            const isSelected = selectedStep === i;
                            const isHovered = hoveredStep === i;
                            const label = getStepLabel(step, i);
                            const hasData = intensity > 0;

                            return (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedStep(isSelected ? null : i)}
                                    onMouseEnter={() => setHoveredStep(i)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                    className="relative group"
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 6,
                                        border: isSelected
                                            ? '2px solid rgba(168, 85, 247, 0.8)'
                                            : isHovered
                                                ? '2px solid rgba(168, 85, 247, 0.4)'
                                                : '1px solid rgba(255,255,255,0.1)',
                                        backgroundColor: hasData
                                            ? `rgba(168, 85, 247, ${0.15 + intensity * 0.45})`
                                            : 'rgba(255,255,255,0.04)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.15s',
                                    }}
                                    title={label}
                                >
                                    <span className="text-[9px] font-semibold text-white/60">
                                        {String(label).slice(0, 3)}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Stats summary */}
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/50">
                        {stats.avgTemp && (
                            <span>🌡️ {stats.minTemp}–{stats.maxTemp}°C (moy. {stats.avgTemp}°C)</span>
                        )}
                        {stats.avgHum && (
                            <span>💧 {stats.minHum}–{stats.maxHum}% (moy. {stats.avgHum}%)</span>
                        )}
                    </div>
                </div>
            ) : (
                /* Card-list for ≤15 steps */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {steps.map((step, i) => {
                        const label = getStepLabel(step, i);
                        const metrics = extractMetrics(step);
                        const isSelected = selectedStep === i;
                        const note = step.note || step.comment || step.commentaire || '';

                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedStep(isSelected ? null : i)}
                                className={`text-left p-3 rounded-xl border transition-all ${isSelected
                                    ? 'bg-purple-500/20 border-purple-500/40 shadow-lg shadow-purple-500/10'
                                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <span className="text-sm font-semibold text-white truncate">{label}</span>
                                </div>
                                {metrics.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {metrics.slice(0, 4).map(m => (
                                            <span key={m.key} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-white/8 text-white/60">
                                                {m.Icon && <m.Icon className="w-2.5 h-2.5" />}
                                                {m.value}{m.unit}
                                            </span>
                                        ))}
                                        {metrics.length > 4 && (
                                            <span className="text-[10px] text-white/30">+{metrics.length - 4}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-white/25 italic">Pas de données</span>
                                )}
                                {note && (
                                    <p className="text-[10px] text-white/30 mt-1 truncate">💬 {note}</p>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* Detail Panel */}
            <AnimatePresence>
                {selectedStep !== null && steps[selectedStep] && (
                    <StepDetailPanel
                        step={steps[selectedStep]}
                        index={selectedStep}
                        onClose={() => setSelectedStep(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
