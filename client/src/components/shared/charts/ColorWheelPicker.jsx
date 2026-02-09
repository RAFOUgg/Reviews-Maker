import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Plus, X, Pipette } from 'lucide-react';

// 10 couleurs cannabis naturelles
const DEFAULT_COLOR = { id: 'default', name: 'Vert pâle (par défaut)', hex: '#B6C7A6' };
const CANNABIS_COLORS = [
    { id: 'green-lime', name: 'Vert lime', hex: '#84CC16', angle: 0 },
    { id: 'green', name: 'Vert', hex: '#22C55E', angle: 36 },
    { id: 'green-forest', name: 'Vert forêt', hex: '#166534', angle: 72 },
    { id: 'green-dark', name: 'Vert foncé', hex: '#14532D', angle: 108 },
    { id: 'blue-green', name: 'Bleu-vert', hex: '#0D9488', angle: 144 },
    { id: 'purple', name: 'Violet', hex: '#7C3AED', angle: 180 },
    { id: 'purple-dark', name: 'Violet foncé', hex: '#4C1D95', angle: 216 },
    { id: 'orange', name: 'Orange', hex: '#EA580C', angle: 252 },
    { id: 'yellow', name: 'Jaune', hex: '#CA8A04', angle: 288 },
    { id: 'brown', name: 'Brun', hex: '#78350F', angle: 324 }
];

// Parties possibles de la plante associables à une couleur
const PLANT_PARTS = [
    { id: 'bracts', label: 'Bractées' },
    { id: 'pistils', label: 'Pistils' },
    { id: 'sugarLeaves', label: 'Sugar leaves' },
    { id: 'stems', label: 'Tiges' },
    { id: 'trichomes', label: 'Trichomes' }
];

const ColorWheelPicker = ({ value = [], onChange, maxSelections = 7 }) => {
    const [hoveredColor, setHoveredColor] = useState(null);
    const [warningMessage, setWarningMessage] = useState('');
    const [allowedMax, setAllowedMax] = useState(maxSelections);
    const [expandedParts, setExpandedParts] = useState({});

    // value format: [{ colorId: 'green', percentage: 60, parts: [{ partId, percent }, ...] }, ...]
    const selectedColors = Array.isArray(value) ? value : [];

    // Toggle details per color
    const toggleParts = (colorId) => {
        setExpandedParts(prev => ({ ...prev, [colorId]: !prev[colorId] }));
    };

    const handleColorClick = (color) => {
        const exists = selectedColors.find(s => s.colorId === color.id);

        if (exists) {
            // Retirer la couleur (plus possible de n'avoir aucune couleur imposée)
            setWarningMessage('');
            onChange(selectedColors.filter(s => s.colorId !== color.id));
        } else {
            // Ajouter la couleur si sous limite
            if (selectedColors.length < allowedMax) {
                setWarningMessage('');
                const newCount = selectedColors.length + 1;
                const basePercentage = Math.floor(100 / newCount);

                // Redistribuer les pourcentages existants puis ajouter la nouvelle
                const redistributed = selectedColors.map(s => ({
                    ...s,
                    percentage: basePercentage
                }));

                // ajout d'une structure parts vide
                onChange([...redistributed, { colorId: color.id, percentage: basePercentage, parts: [] }]);
            } else {
                setWarningMessage(`⚠️ Limite atteinte (${allowedMax} couleurs max)`);
                setTimeout(() => setWarningMessage(''), 2000);
            }
        }
    };

    const handlePercentageChange = (colorId, newValue) => {
        const updated = selectedColors.map(s =>
            s.colorId === colorId
                ? { ...s, percentage: Math.max(0, Math.min(100, parseInt(newValue) || 0)) }
                : s
        );

        // Forcer le total à 100% exactement (normalisation)
        const total = updated.reduce((sum, s) => sum + s.percentage, 0);
        if (total !== 100 && total > 0) {
            const factor = 100 / total;
            const normalized = updated.map((s, index) => ({
                ...s,
                percentage: index === updated.length - 1
                    ? 100 - updated.slice(0, -1).reduce((sum, item) => sum + Math.round(item.percentage * factor), 0)
                    : Math.round(s.percentage * factor)
            }));
            onChange(normalized);
        } else {
            onChange(updated);
        }
    };

    const handlePartToggle = (colorId, partId) => {
        const updated = selectedColors.map(s => {
            if (s.colorId !== colorId) return s;
            const exists = (s.parts || []).some(p => p.partId === partId);
            if (exists) {
                return { ...s, parts: s.parts.filter(p => p.partId !== partId) };
            }
            return { ...s, parts: [...(s.parts || []), { partId, percent: 0 }] };
        });
        onChange(updated);
    };

    const handlePartPercentChange = (colorId, partId, value) => {
        const updated = selectedColors.map(s => {
            if (s.colorId !== colorId) return s;
            return { ...s, parts: (s.parts || []).map(p => p.partId === partId ? { ...p, percent: Math.max(0, Math.min(100, parseInt(value) || 0)) } : p) };
        });
        onChange(updated);
    };

    const totalPercentage = selectedColors.reduce((sum, s) => sum + s.percentage, 0);

    return (
        <div className="space-y-6">
            {/* Message d'avertissement */}
            <AnimatePresence>
                {warningMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg text-sm font-medium"
                    >
                        {warningMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Roue de couleurs */}
            <div className="flex flex-col items-center">
                <div className="relative">
                    <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-xl">
                        <defs>
                            {/* Dégradés entre chaque couleur pour un fondu global */}
                            {CANNABIS_COLORS.map((c, i) => {
                                const next = CANNABIS_COLORS[(i + 1) % CANNABIS_COLORS.length];
                                return (
                                    <linearGradient id={`seg-grad-${i}`} key={`seg-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={c.hex} />
                                        <stop offset="100%" stopColor={next.hex} />
                                    </linearGradient>
                                );
                            })}
                        </defs>

                        {/* Cercle central: couleur par défaut si aucune sélection */}
                        <circle cx="140" cy="140" r="58" fill={selectedColors.length === 0 ? DEFAULT_COLOR.hex : '#1F2937'} className="drop-shadow-lg" />

                        {/* 12 segments de couleur (légèrement chevauchés pour éviter les gaps) */}
                        {CANNABIS_COLORS.map((color, index) => {
                            const angle = (index * 30) - 90; // -90 pour commencer en haut
                            const nextAngle = angle + 30.5; // 0.5 deg overlap to avoid hairline gaps
                            const isSelected = selectedColors.some(s => s.colorId === color.id);
                            const isHovered = hoveredColor?.id === color.id;

                            // Calcul des points du segment (arc)
                            const radius = 140;
                            const innerRadius = 58;

                            const startOuter = {
                                x: 140 + radius * Math.cos((angle * Math.PI) / 180),
                                y: 140 + radius * Math.sin((angle * Math.PI) / 180)
                            };
                            const endOuter = {
                                x: 140 + radius * Math.cos((nextAngle * Math.PI) / 180),
                                y: 140 + radius * Math.sin((nextAngle * Math.PI) / 180)
                            };
                            const startInner = {
                                x: 140 + innerRadius * Math.cos((nextAngle * Math.PI) / 180),
                                y: 140 + innerRadius * Math.sin((nextAngle * Math.PI) / 180)
                            };
                            const endInner = {
                                x: 140 + innerRadius * Math.cos((angle * Math.PI) / 180),
                                y: 140 + innerRadius * Math.sin((angle * Math.PI) / 180)
                            };

                            const pathData = `
                M ${startOuter.x} ${startOuter.y}
                A ${radius} ${radius} 0 0 1 ${endOuter.x} ${endOuter.y}
                L ${startInner.x} ${startInner.y}
                A ${innerRadius} ${innerRadius} 0 0 0 ${endInner.x} ${endInner.y}
                Z
              `;

                            return (
                                <g key={color.id}>
                                    <motion.path
                                        d={pathData}
                                        fill={`url(#seg-grad-${index})`}
                                        stroke="none"
                                        className="cursor-pointer transition-all outline-none"
                                        onMouseEnter={() => setHoveredColor(color)}
                                        onMouseLeave={() => setHoveredColor(null)}
                                        onClick={() => handleColorClick(color)}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        style={{
                                            opacity: isSelected ? 1 : isHovered ? 0.95 : 0.9,
                                            filter: isSelected
                                                ? 'drop-shadow(0 0 10px rgba(255,255,255,0.9)) brightness(1.05)'
                                                : 'none',
                                            outline: 'none'
                                        }}
                                    />

                                    {/* zone invisible pour capter le click exact si besoin */}
                                    <path
                                        d={pathData}
                                        fill="transparent"
                                        stroke="transparent"
                                        onClick={() => handleColorClick(color)}
                                    />
                                </g>
                            );
                        })}

                        {/* Icône centrale */}
                        <foreignObject x="115" y="115" width="50" height="50">
                            <div className="flex items-center justify-center w-full h-full">
                                <Palette className="w-8 h-8 text-gray-400" />
                            </div>
                        </foreignObject>
                    </svg>

                    {/* Tooltip hover */}
                    <AnimatePresence>
                        {hoveredColor && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white whitespace-nowrap shadow-xl z-10"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full border-2 border-white"
                                        style={{ backgroundColor: hoveredColor.hex }}
                                    />
                                    {hoveredColor.name}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions */}
                <p className="text-sm text-gray-400 mt-6 text-center">
                    <Pipette className="w-4 h-4 inline mr-2" />
                    Cliquez sur la roue pour sélectionner jusqu'à {allowedMax} couleurs (par défaut couleur : Vert pâle grisâtre)
                </p>
            </div>

            {/* Liste des couleurs sélectionnées avec sliders */}
            {selectedColors.length > 0 && (
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Couleurs sélectionnées ({selectedColors.length}/{allowedMax})
                        </h4>

                        <div className="flex items-center gap-3">
                            <div className={`text-xs font-medium ${totalPercentage === 100 ? 'text-green-400' : 'text-orange-400'}`}>
                                Total: {totalPercentage}%
                            </div>

                            {/* Contrôle du nombre max (curseur 1..7) */}
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="text-xs text-gray-400">Max</span>
                                <input type="range" min="1" max="7" value={allowedMax} onChange={(e) => setAllowedMax(parseInt(e.target.value, 10))} className="w-24" />
                                <span className="w-6 text-right">{allowedMax}</span>
                            </div>

                            {/* Rapid add */}
                            <button
                                onClick={() => {
                                    const candidate = hoveredColor || CANNABIS_COLORS.find(c => !selectedColors.some(s => s.colorId === c.id));
                                    if (candidate) handleColorClick(candidate);
                                }}
                                className="px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 transition"
                                title="Ajouter la couleur survolée ou la prochaine disponible"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {selectedColors.map((selected) => {
                            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId) || DEFAULT_COLOR;
                            if (!colorData) return null;

                            const parts = selected.parts || [];
                            const partsTotal = parts.reduce((s, p) => s + (p.percent || 0), 0);

                            return (
                                <motion.div
                                    key={selected.colorId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Pastille couleur */}
                                        <div
                                            className="w-8 h-8 rounded-lg border-2 border-gray-600 flex-shrink-0 shadow-lg"
                                            style={{ backgroundColor: colorData.hex }}
                                        />

                                        {/* Nom */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">
                                                {colorData.name}
                                            </div>
                                        </div>

                                        {/* Slider pourcentage */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selected.percentage}
                                                onChange={(e) => handlePercentageChange(selected.colorId, e.target.value)}
                                                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                style={{ background: `linear-gradient(to right, ${colorData.hex} 0%, ${colorData.hex} ${selected.percentage}%, #374151 ${selected.percentage}%, #374151 100%)` }}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={selected.percentage}
                                                onChange={(e) => handlePercentageChange(selected.colorId, e.target.value)}
                                                className="w-14 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white text-center"
                                            />
                                            <span className="text-xs text-gray-400">%</span>
                                        </div>

                                        {/* Détails / Parts toggle */}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleParts(selected.colorId)} className="px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 transition">Détails</button>
                                            <button
                                                onClick={() => handleColorClick(colorData)}
                                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group flex-shrink-0"
                                            >
                                                <X className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Parts editor */}
                                    {expandedParts[selected.colorId] && (
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {PLANT_PARTS.map(part => {
                                                const has = parts.some(p => p.partId === part.id);
                                                const pVal = parts.find(p => p.partId === part.id)?.percent || 0;
                                                return (
                                                    <div key={part.id} className="flex items-center gap-2 bg-gray-800/30 p-2 rounded">
                                                        <input type="checkbox" checked={has} onChange={() => handlePartToggle(selected.colorId, part.id)} />
                                                        <div className="flex-1 text-sm text-gray-200">{part.label}</div>
                                                        <input type="number" min="0" max="100" value={pVal} onChange={(e) => handlePartPercentChange(selected.colorId, part.id, e.target.value)} className="w-20 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white text-center" />
                                                        <div className="text-xs text-gray-400">%</div>
                                                    </div>
                                                );
                                            })}

                                            {/* Warning if parts total != 100 */}
                                            {parts.length > 0 && partsTotal !== 100 && (
                                                <div className="col-span-full text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                                                    ⚠️ La somme des pourcentages des parties pour cette couleur doit idéalement être 100% (actuel: {partsTotal}%)
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Alerte si total != 100% */}
                    {totalPercentage !== 100 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2"
                        >
                            <span className="font-medium">⚠️</span>
                            {totalPercentage > 100
                                ? 'Total dépasse 100% - auto-normalisation appliquée'
                                : `Ajustez les pourcentages pour atteindre 100% (manque ${100 - totalPercentage}%)`
                            }
                        </motion.div>
                    )}

                    {/* Short links to API / DB / Export docs */}
                    <div className="text-xs text-gray-400 mt-2">
                        🔧 Liens utiles: <a className="text-gray-200 underline" href="/server-new/routes/flower-reviews.js" target="_blank" rel="noreferrer">API Flower Reviews</a> • <a className="text-gray-200 underline" href="/server-new/prisma/schema.prisma" target="_blank" rel="noreferrer">DB Schema</a> • <a className="text-gray-200 underline" href="/client/src/components/export/ExportMaker.jsx" target="_blank" rel="noreferrer">ExportMaker</a>
                    </div>
                </div>
            )}

            {/* Message si aucune sélection */}
            {selectedColors.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-8 bg-gray-800/20 rounded-xl border border-gray-700/50">
                    <Palette className="w-8 h-8 mx-auto mb-3 text-gray-600" />
                    Aucune couleur sélectionnée
                </div>
            )}
        </div>
    );
};

export default ColorWheelPicker;


