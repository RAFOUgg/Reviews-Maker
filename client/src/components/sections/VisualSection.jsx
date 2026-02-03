import { useState, useEffect } from 'react';
import {
    CANNABIS_COLORS,
    getAllColorShades,
    VISUAL_QUALITY_LEVELS,
    INVERTED_LABELS,
    TRANSPARENCY_LEVELS
} from '../../data/visualOptions';
import { LiquidCard, LiquidChip, LiquidDivider } from '@/components/ui/LiquidUI';
import LiquidSlider from '@/components/ui/LiquidSlider';
import { Eye, X, Check } from 'lucide-react';

/**
 * Section Visuel & Technique
 * Utilisée pour Hash, Concentrés et Fleurs
 * Champs adaptés selon le type de produit
 */
export default function VisualSection({ productType, formData = {}, handleChange }) {
    const data = formData.visual || {};
    // Couleurs multiples avec pourcentages
    const [selectedColors, setSelectedColors] = useState(data?.colors || []);
    const [colorRating, setColorRating] = useState(data?.colorRating || 5);
    const [density, setDensity] = useState(data?.density || 5);
    const [trichomes, setTrichomes] = useState(data?.trichomes || 5);
    const [mold, setMold] = useState(data?.mold || 10);
    const [seeds, setSeeds] = useState(data?.seeds || 10);
    const [transparency, setTransparency] = useState(data?.transparency || 5);

    // Synchroniser avec parent
    useEffect(() => {
        const visualData = {
            colors: selectedColors,
            colorRating,
            density,
            ...(productType === 'Fleur' && { trichomes }),
            ...(productType !== 'Fleur' && { transparency }),
            mold,
            seeds
        };
        handleChange('visual', visualData);
    }, [selectedColors, colorRating, density, trichomes, transparency, mold, seeds, productType]);

    const allColors = getAllColorShades();
    const isHashOrConcentrate = productType === 'Hash' || productType === 'Concentré';

    // Ajouter une couleur à la sélection multiple
    const handleAddColor = (colorId) => {
        const colorExists = selectedColors.find(c => c.id === colorId);
        if (colorExists) return; // Déjà sélectionnée

        const newColor = { id: colorId, percentage: 0 };
        setSelectedColors([...selectedColors, newColor]);
    };

    // Retirer une couleur
    const handleRemoveColor = (colorId) => {
        setSelectedColors(selectedColors.filter(c => c.id !== colorId));
    };

    // Mettre à jour le pourcentage d'une couleur
    const handleUpdatePercentage = (colorId, percentage) => {
        setSelectedColors(selectedColors.map(c =>
            c.id === colorId ? { ...c, percentage: Math.min(100, Math.max(0, percentage)) } : c
        ));
    };

    // Calculer le total des pourcentages
    const totalPercentage = selectedColors.reduce((sum, c) => sum + (c.percentage || 0), 0);

    return (
        <LiquidCard glow="purple" padding="lg" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">👁️ Visuel & Technique</h3>
                    <p className="text-sm text-white/50">Caractéristiques visuelles et qualité</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Nuancier Couleurs */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-200">
                        {isHashOrConcentrate ? 'Couleur / Transparence' : 'Couleurs de la fleur'}
                    </label>
                    {selectedColors.length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-lg ${totalPercentage === 100 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            Total: {totalPercentage}%
                        </span>
                    )}
                </div>

                {/* Couleurs sélectionnées avec pourcentages */}
                {selectedColors.length > 0 && (
                    <div className="space-y-2 p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs font-medium text-gray-400 mb-3">Couleurs sélectionnées :</p>
                        {selectedColors.map((color) => {
                            const colorData = allColors.find(c => c.id === color.id);
                            return (
                                <div key={color.id} className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg border-2 border-white/20 shadow-md"
                                        style={{ backgroundColor: colorData?.hex }}
                                    />
                                    <span className="text-sm text-gray-300 flex-1">{colorData?.name}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={color.percentage}
                                        onChange={(e) => handleUpdatePercentage(color.id, parseInt(e.target.value) || 0)}
                                        className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                    <span className="text-xs text-gray-400">%</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveColor(color.id)}
                                        className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                                        title="Retirer"
                                    >
                                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                        {totalPercentage !== 100 && (
                            <p className="text-xs text-orange-400 mt-2">
                                ⚠️ Le total doit être égal à 100% (actuellement {totalPercentage}%)
                            </p>
                        )}
                    </div>
                )}

                {/* Palette de couleurs */}
                <div className="space-y-3">
                    {Object.entries(CANNABIS_COLORS).map(([key, colorFamily]) => (
                        <div key={key} className="space-y-2">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                {colorFamily.label}
                            </p>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {colorFamily.shades.map((shade) => {
                                    const isSelected = selectedColors.some(c => c.id === shade.id);
                                    return (
                                        <button
                                            key={shade.id}
                                            type="button"
                                            onClick={() => isSelected ? handleRemoveColor(shade.id) : handleAddColor(shade.id)}
                                            className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-xl ${isSelected ? 'border-violet-400 ring-2 ring-violet-500/50 shadow-xl' : 'border-gray-600/50 hover:border-gray-500'}`}
                                            style={{ backgroundColor: shade.hex }}
                                            title={shade.name}
                                        >
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white drop-shadow-2xl" fill="currentColor" viewBox="0 0 20 20">
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

            {/* Transparence (Hash/Concentrés uniquement) */}
            {isHashOrConcentrate && (
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Transparence"
                        value={transparency}
                        min={1}
                        max={10}
                        step={1}
                        color="purple"
                        onChange={(val) => setTransparency(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{TRANSPARENCY_LEVELS[transparency - 1]?.example}</p>
                </div>
            )}

            {/* Sliders de qualité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Densité */}
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Densité"
                        value={density}
                        min={1}
                        max={10}
                        step={1}
                        color="purple"
                        onChange={(val) => setDensity(val)}
                    />
                </div>

                {/* Trichomes (Fleurs uniquement) */}
                {productType === 'Fleur' && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <LiquidSlider
                            label="Trichomes"
                            value={trichomes}
                            min={1}
                            max={10}
                            step={1}
                            color="purple"
                            onChange={(val) => setTrichomes(val)}
                        />
                        <p className="text-xs text-white/40 mt-2">Quantité et qualité des cristaux</p>
                    </div>
                )}

                {/* Moisissures (inversé) */}
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Moisissures (10 = aucune)"
                        value={mold}
                        min={1}
                        max={10}
                        step={1}
                        color="green"
                        onChange={(val) => setMold(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">10 = aucune moisissure</p>
                </div>

                {/* Graines (inversé) */}
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Graines (10 = aucune)"
                        value={seeds}
                        min={1}
                        max={10}
                        step={1}
                        color="green"
                        onChange={(val) => setSeeds(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">10 = aucune graine</p>
                </div>
            </div>


        </LiquidCard>
    );
}





