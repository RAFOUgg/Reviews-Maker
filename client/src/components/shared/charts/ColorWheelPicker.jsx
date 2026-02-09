import React, { useState, useRef, useEffect } from 'react';
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
    const [expandedParts, setExpandedParts] = useState({});

    // value format: [{ colorId: 'green', percentage: 60, parts: [{ partId, percent }, ...] }, ...]
    const selectedColors = Array.isArray(value) ? value : [];

    // Calcul du max autorisé : parties * 5
    const computedMax = PLANT_PARTS.length * 5;

    // Gradient / cursor states
    const gradientRef = useRef(null);
    const [cursorPos, setCursorPos] = useState(0.5); // 0..1
    const [cursorColor, setCursorColor] = useState(DEFAULT_COLOR.hex);
    const [dragging, setDragging] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [modalPercentage, setModalPercentage] = useState(20);
    const [modalPart, setModalPart] = useState('');

    // Helpers: create CSS gradient string from colors
    const makeGradient = (colors) => {
        if (!colors || colors.length === 0) return DEFAULT_COLOR.hex;
        const step = 100 / colors.length;
        const stops = colors.map((c, i) => `${c.hex} ${Math.round(i * step)}%`).join(', ');
        return `linear-gradient(90deg, ${stops})`;
    };

    // Color interpolation helpers
    const hexToRgb = (hex) => {
        const h = hex.replace('#', '');
        return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
    };
    const rgbToHex = (r, g, b) => `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    const interpolateHex = (h1, h2, t) => {
        const c1 = hexToRgb(h1); const c2 = hexToRgb(h2);
        return rgbToHex(lerp(c1.r, c2.r, t), lerp(c1.g, c2.g, t), lerp(c1.b, c2.b, t));
    };

    const getColorAtPos = (pos) => {
        const n = CANNABIS_COLORS.length;
        const scaled = pos * n;
        const idx = Math.floor(Math.max(0, Math.min(n - 1, scaled)));
        const t = scaled - idx;
        const c1 = CANNABIS_COLORS[idx % n].hex;
        const c2 = CANNABIS_COLORS[(idx + 1) % n].hex;
        return interpolateHex(c1, c2, t);
    };

    // Drag handlers
    const updateCursorFromEvent = (clientX) => {
        const el = gradientRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const pos = x / rect.width;
        setCursorPos(pos);
        setCursorColor(getColorAtPos(pos));
    };

    const onPointerMove = (e) => { updateCursorFromEvent(e.clientX); };
    const stopPointerDrag = () => {
        setDragging(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopPointerDrag);
    };

    const startDrag = (e) => {
        e.preventDefault();
        setDragging(true);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stopPointerDrag);
        if (e.clientX) updateCursorFromEvent(e.clientX);
    };

    const handleBarPointer = (e) => {
        // pointer down on the bar -> place cursor and open modal? just position
        updateCursorFromEvent(e.clientX);
    };

    // Modal handlers
    const openAddModal = () => { setModalPercentage(20); setModalPart(''); setShowAddModal(true); };
    const closeAddModal = () => { setShowAddModal(false); };

    const confirmAddFromCursor = () => {
        const n = CANNABIS_COLORS.length;
        const scaled = cursorPos * n;
        const nearestIndex = Math.round(Math.max(0, Math.min(n - 1, scaled)));
        const colorData = CANNABIS_COLORS[nearestIndex];

        if (selectedColors.length >= computedMax) {
            setWarningMessage(`⚠️ Limite atteinte (${computedMax} couleurs max)`);
            setTimeout(() => setWarningMessage(''), 2000);
            return;
        }

        // distribute remaining percentage
        const newPerc = Math.max(0, Math.min(100, modalPercentage));
        const remaining = 100 - newPerc;
        const totalExisting = selectedColors.reduce((s, c) => s + c.percentage, 0) || 0;

        let updatedExisting = [];
        if (totalExisting > 0 && remaining > 0) {
            updatedExisting = selectedColors.map(s => ({ ...s, percentage: Math.round(s.percentage / totalExisting * remaining) }));
            // adjust small rounding error
            const sumUpd = updatedExisting.reduce((s, c) => s + c.percentage, 0);
            if (sumUpd !== remaining && updatedExisting.length > 0) {
                updatedExisting[updatedExisting.length - 1].percentage += (remaining - sumUpd);
            }
        } else if (remaining === 0) {
            updatedExisting = selectedColors.map(s => ({ ...s, percentage: 0 }));
        } else if (totalExisting === 0) {
            updatedExisting = [];
        }

        const newColorObj = { colorId: colorData.id, percentage: newPerc, parts: modalPart ? [{ partId: modalPart, percent: 100 }] : [] };
        onChange([...updatedExisting, newColorObj]);
        setShowAddModal(false);
    };

    const handleColorClick = (color) => {
        const exists = selectedColors.find(s => s.colorId === color.id);

        if (exists) {
            // Retirer la couleur (plus possible de n'avoir aucune couleur imposée)
            setWarningMessage('');
            onChange(selectedColors.filter(s => s.colorId !== color.id));
        } else {
            // Ajouter la couleur si sous limite
            if (selectedColors.length < computedMax) {
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
                setWarningMessage(`⚠️ Limite atteinte (${computedMax} couleurs max)`);
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

    // cleanup pointer listeners on unmount
    useEffect(() => {
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', stopPointerDrag);
        };
    }, []);


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
                    {/* Square gradient bar with draggable cursor */}
                    <div
                        ref={gradientRef}
                        onPointerDown={(e) => { e.preventDefault(); updateCursorFromEvent(e.clientX); }}
                        className="w-full h-20 rounded-lg overflow-hidden relative drop-shadow-xl"
                        style={{
                            background: makeGradient(CANNABIS_COLORS),
                            touchAction: 'none'
                        }}
                    >
                        {/* draggable cursor */}
                        <div
                            className="absolute w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-grab"
                            style={{
                                left: `${cursorPos * 100}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: cursorColor,
                                touchAction: 'none'
                            }}
                            onPointerDown={(e) => startDrag(e)}
                            title="Déplacez pour choisir une couleur"
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-400">Sélection par glissement</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => openAddModal()} className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 transition">Ajouter une couleur</button>
                            <div className="text-xs text-gray-400">Max: {PLANT_PARTS.length * 5}</div>
                        </div>
                    </div>

                    {/* Modal for adding color */}
                    <AnimatePresence>
                        {showAddModal && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="absolute inset-0 bg-black/50 z-40" onClick={() => closeAddModal()} />
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 rounded-lg p-6 z-50 w-[320px] border border-gray-700" onClick={(e) => e.stopPropagation()}>
                                    <h4 className="text-sm font-semibold mb-3">Ajouter la couleur choisie</h4>
                                    <div className="mb-3 text-xs text-gray-400">Couleur: <span className="font-medium" style={{ color: cursorColor }}>{cursorColor}</span></div>

                                    <div className="mb-3">
                                        <label className="text-xs text-gray-300">Pourcentage du nuancier</label>
                                        <input type="range" min="0" max="100" value={modalPercentage} onChange={(e) => setModalPercentage(parseInt(e.target.value, 10))} className="w-full mt-2" />
                                        <div className="text-xs text-gray-400 mt-1">{modalPercentage}%</div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="text-xs text-gray-300">Partie de la plante</label>
                                        <select value={modalPart} onChange={(e) => setModalPart(e.target.value)} className="w-full mt-2 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white">
                                            <option value="">-- Choisir --</option>
                                            {PLANT_PARTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button className="px-3 py-1 text-xs" onClick={() => closeAddModal()}>Annuler</button>
                                        <button className="px-3 py-1 rounded bg-green-600 text-xs" onClick={() => confirmAddFromCursor()}>Ajouter</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Instructions */}
                <p className="text-sm text-gray-400 mt-6 text-center">
                    <Pipette className="w-4 h-4 inline mr-2" />
                    Glissez sur le carré pour positionner le curseur puis cliquez sur "Ajouter une couleur" (Max: {computedMax}) — centre du curseur affiche la couleur choisie
                </p>
            </div>

            {/* Liste des couleurs sélectionnées avec sliders */}
            {selectedColors.length > 0 && (
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Couleurs sélectionnées ({selectedColors.length}/{computedMax})
                        </h4>

                        <div className="flex items-center gap-3">
                            <div className={`text-xs font-medium ${totalPercentage === 100 ? 'text-green-400' : 'text-orange-400'}`}>
                                Total: {totalPercentage}%
                            </div>

                            <div className="text-xs text-gray-400">Max autorisé: {computedMax} couleurs</div>

                            {/* Rapid add */}
                            <button
                                onClick={() => {
                                    const n = CANNABIS_COLORS.length;
                                    const idx = Math.round(cursorPos * n) % n;
                                    const candidate = CANNABIS_COLORS[idx] || CANNABIS_COLORS[0];
                                    if (candidate) handleColorClick(candidate);
                                }}
                                className="px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 transition"
                                title="Ajouter la couleur sous le curseur"
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


