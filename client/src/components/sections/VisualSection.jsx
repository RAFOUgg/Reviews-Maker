import { useState, useEffect } from 'react';
import {
    CANNABIS_COLORS,
    getAllColorShades,
    TRANSPARENCY_LEVELS
} from '../../data/visualOptions';
import { LiquidCard, LiquidDivider } from '@/components/ui/LiquidUI';
import LiquidSlider from '@/components/ui/LiquidSlider';
import { Eye } from 'lucide-react';

const HASH_PALETTE = [
    { id: 'blonde', name: 'Blonde', hex: '#F5DEB3' },
    { id: 'blond-ambre', name: 'Blond ambré', hex: '#D4A853' },
    { id: 'or', name: 'Dorée', hex: '#C89020' },
    { id: 'brun-clair', name: 'Brun clair', hex: '#A0522D' },
    { id: 'brun', name: 'Brun', hex: '#7B3B20' },
    { id: 'brun-fonce', name: 'Brun foncé', hex: '#4A2010' },
    { id: 'noir', name: 'Noire', hex: '#1A1A1A' },
    { id: 'vert-olive', name: 'Verte', hex: '#6B7A2A' },
    { id: 'gris', name: 'Grisâtre', hex: '#8A8A8A' },
];

const CONCENTRATE_PALETTE = [
    { id: 'transparent', name: 'Transparent', hex: '#D8E8FF', border: true },
    { id: 'jaune-pale', name: 'Jaune pâle', hex: '#FFFACD' },
    { id: 'or-pale', name: 'Or pâle', hex: '#FFE066' },
    { id: 'or', name: 'Or', hex: '#FFD700' },
    { id: 'ambre', name: 'Ambre', hex: '#FFBF00' },
    { id: 'ambre-fonce', name: 'Ambre foncé', hex: '#C07000' },
    { id: 'brun', name: 'Brun', hex: '#8B4513' },
    { id: 'creme', name: 'Crème/Wax', hex: '#FFF0B0' },
    { id: 'vert', name: 'Verte (live)', hex: '#7AAF50' },
];

/**
 * Section Visuel & Technique
 * Adaptée selon productType :
 *   - 'flower' : palette couleurs complète + sliders fleur
 *   - 'Hash' / 'hash' : sliders compacts Hash (couleurTransparence, pureteVisuelle, densiteVisuelle)
 *   - 'Concentrate' / 'concentrate' : sliders compacts Concentré (couleurTransparence, viscosite, pureteVisuelle, melting, residus)
 */
export default function VisualSection({ productType = 'flower', data: directData, onChange, formData = {}, handleChange }) {
    const data = directData || formData.visual || {};
    const safeUpdate = (payload) => {
        if (typeof onChange === 'function') return onChange(payload);
        if (typeof handleChange === 'function') return handleChange('visual', payload);
    };

    const type = (productType || 'flower').toLowerCase();
    const isHash = type === 'hash';
    const isConcentrate = type === 'concentrate';
    const isFlower = !isHash && !isConcentrate;

    // ── HASH / CONCENTRATE : sliders avec noms exacts du schéma ──────────────
    const HASH_FIELDS = [
        { key: 'couleurTransparence', label: 'Couleur / Transparence', color: 'amber', hint: 'Aspect colorimétrique et transparence' },
        { key: 'pureteVisuelle', label: 'Pureté visuelle', color: 'purple', hint: 'Absence de contaminants visibles' },
        { key: 'densiteVisuelle', label: 'Densité visuelle', color: 'blue', hint: 'Compacité apparente' },
    ];

    const CONCENTRATE_FIELDS = [
        { key: 'couleurTransparence', label: 'Couleur / Transparence', color: 'amber', hint: 'Clarté et teinte du concentré' },
        { key: 'pureteVisuelle', label: 'Pureté visuelle', color: 'purple', hint: 'Absence de résidus et contaminants' },
        { key: 'viscosite', label: 'Viscosité', color: 'cyan', hint: 'Fluidité / consistance' },
        { key: 'melting', label: 'Melting', color: 'orange', hint: 'Qualité de fusion (10 = melting parfait)' },
        { key: 'residus', label: 'Résidus (10=aucun)', color: 'green', hint: '10 = aucun résidu après consumption' },
    ];

    const activeFields = isHash ? HASH_FIELDS : isConcentrate ? CONCENTRATE_FIELDS : [];

    const palette = isHash ? HASH_PALETTE : isConcentrate ? CONCENTRATE_PALETTE : [];

    const parseCouleurNuancier = (raw) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try { return JSON.parse(raw); } catch { return []; }
    };

    const [sliders, setSliders] = useState(() => {
        const init = {};
        activeFields.forEach(f => { init[f.key] = data[f.key] ?? 0; });
        return init;
    });

    const [productColors, setProductColors] = useState(() => parseCouleurNuancier(data.couleurNuancier));

    // Sync depuis props quand data change (rechargement)
    useEffect(() => {
        if (!isFlower) {
            const next = {};
            activeFields.forEach(f => { next[f.key] = data[f.key] ?? 0; });
            setSliders(next);
            setProductColors(parseCouleurNuancier(data.couleurNuancier));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.couleurTransparence, data.pureteVisuelle, data.densiteVisuelle, data.viscosite, data.melting, data.residus, data.couleurNuancier]);

    const handleSliderChange = (key, val) => {
        const next = { ...sliders, [key]: val };
        setSliders(next);
        safeUpdate({ ...next, couleurNuancier: productColors });
    };

    const handleProductColorToggle = (colorId) => {
        const next = productColors.includes(colorId)
            ? productColors.filter(c => c !== colorId)
            : [...productColors, colorId];
        setProductColors(next);
        safeUpdate({ ...sliders, couleurNuancier: next });
    };

    // ── FLOWER : palette couleurs + sliders spécifiques ──────────────────────
    const allColors = getAllColorShades();
    const [selectedColors, setSelectedColors] = useState(data?.colors || []);
    const [colorRating, setColorRating] = useState(data?.colorRating || 5);
    const [density, setDensity] = useState(data?.density || 5);
    const [trichomes, setTrichomes] = useState(data?.trichomes || 5);
    const [mold, setMold] = useState(data?.mold || 10);
    const [seeds, setSeeds] = useState(data?.seeds || 10);

    useEffect(() => {
        if (!isFlower) return;
        safeUpdate({ colors: selectedColors, colorRating, density, trichomes, mold, seeds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedColors, colorRating, density, trichomes, mold, seeds]);

    const totalPercentage = selectedColors.reduce((sum, c) => sum + (c.percentage || 0), 0);

    const handleAddColor = (colorId) => {
        if (selectedColors.find(c => c.id === colorId)) return;
        setSelectedColors([...selectedColors, { id: colorId, percentage: 0 }]);
    };
    const handleRemoveColor = (colorId) => setSelectedColors(selectedColors.filter(c => c.id !== colorId));
    const handleUpdatePercentage = (colorId, percentage) => {
        setSelectedColors(selectedColors.map(c =>
            c.id === colorId ? { ...c, percentage: Math.min(100, Math.max(0, percentage)) } : c
        ));
    };

    return (
        <LiquidCard glow="purple" padding="sm" className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Eye className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-white">👁️ Visuel & Technique</h3>
                    <p className="text-xs text-white/50">Caractéristiques visuelles et qualité</p>
                </div>
            </div>

            <LiquidDivider />

            {/* ── Hash / Concentrate : palette + sliders compacts ── */}
            {!isFlower && (
                <div className="space-y-3">
                    {/* Palette colorimétrique */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs font-semibold text-white/70 mb-2">🎨 Couleur du produit</p>
                        <div className="grid grid-cols-9 gap-1.5">
                            {palette.map(color => {
                                const isSelected = productColors.includes(color.id);
                                return (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => handleProductColorToggle(color.id)}
                                        className={`relative h-8 rounded-lg border-2 transition-all hover:scale-110 ${isSelected ? 'border-violet-400 ring-2 ring-violet-500/50' : 'border-white/20'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    >
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {productColors.length > 0 && (
                            <p className="text-xs text-white/40 mt-1.5">
                                {productColors.map(id => palette.find(c => c.id === id)?.name).filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Sliders techniques */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeFields.map(field => (
                            <div key={field.key} className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                <LiquidSlider
                                    label={field.label}
                                    value={sliders[field.key] ?? 0}
                                    min={0}
                                    max={10}
                                    step={1}
                                    color={field.color}
                                    onChange={(val) => handleSliderChange(field.key, val)}
                                />
                                {field.hint && (
                                    <p className="text-xs text-white/35 mt-1">{field.hint}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Flower : palette couleurs + sliders ── */}
            {isFlower && (
                <>
                    {/* Couleurs sélectionnées */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-200">Couleurs de la fleur</label>
                            {selectedColors.length > 0 && (
                                <span className={`text-xs px-2 py-1 rounded-lg ${totalPercentage === 100 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                    Total: {totalPercentage}%
                                </span>
                            )}
                        </div>

                        {selectedColors.length > 0 && (
                            <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-xs font-medium text-gray-400 mb-2">Couleurs sélectionnées :</p>
                                {selectedColors.map((color) => {
                                    const colorData = allColors.find(c => c.id === color.id);
                                    return (
                                        <div key={color.id} className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg border-2 border-white/20 shadow-md flex-shrink-0" style={{ backgroundColor: colorData?.hex }} />
                                            <span className="text-sm text-gray-300 flex-1">{colorData?.name}</span>
                                            <input
                                                type="number" min="0" max="100" value={color.percentage}
                                                onChange={(e) => handleUpdatePercentage(color.id, parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <span className="text-xs text-gray-400">%</span>
                                            <button type="button" onClick={() => handleRemoveColor(color.id)} className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}
                                {totalPercentage !== 100 && selectedColors.length > 0 && (
                                    <p className="text-xs text-orange-400 mt-1">⚠️ Total: {totalPercentage}% (doit être 100%)</p>
                                )}
                            </div>
                        )}

                        {/* Palette compacte */}
                        <div className="space-y-2">
                            {Object.entries(CANNABIS_COLORS).map(([key, colorFamily]) => (
                                <div key={key} className="space-y-1">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{colorFamily.label}</p>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                                        {colorFamily.shades.map((shade) => {
                                            const isSelected = selectedColors.some(c => c.id === shade.id);
                                            return (
                                                <button
                                                    key={shade.id} type="button"
                                                    onClick={() => isSelected ? handleRemoveColor(shade.id) : handleAddColor(shade.id)}
                                                    className={`relative h-8 rounded-lg border-2 transition-all hover:scale-110 ${isSelected ? 'border-violet-400 ring-2 ring-violet-500/50' : 'border-gray-600/50'}`}
                                                    style={{ backgroundColor: shade.hex }}
                                                    title={shade.name}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sliders fleur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Couleur / Nuancier" value={colorRating} min={1} max={10} step={1} color="purple" onChange={setColorRating} />
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Densité" value={density} min={1} max={10} step={1} color="purple" onChange={setDensity} />
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Trichomes" value={trichomes} min={1} max={10} step={1} color="purple" onChange={setTrichomes} />
                            <p className="text-xs text-white/35 mt-1">Quantité et qualité des cristaux</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Moisissures (10=aucune)" value={mold} min={1} max={10} step={1} color="green" onChange={setMold} />
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Graines (10=aucune)" value={seeds} min={1} max={10} step={1} color="green" onChange={setSeeds} />
                        </div>
                    </div>
                </>
            )}
        </LiquidCard>
    );
}
