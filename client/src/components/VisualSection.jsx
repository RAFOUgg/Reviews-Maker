import { useState, useEffect } from 'react';
import {
    CANNABIS_COLORS,
    getAllColorShades,
    VISUAL_QUALITY_LEVELS,
    INVERTED_LABELS,
    TRANSPARENCY_LEVELS
} from '../../data/visualOptions';
import WhiteSlider from './WhiteSlider';

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
    }, [selectedColors, colorRating, density, trichomes, mold, seeds, transparency, productType, handleChange]);

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
        <div className="space-y-6 bg-gray-900/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">👁️ Visuel & Technique</h3>
                    <p className="text-sm text-gray-400">Caractéristiques visuelles et qualité</p>
                </div>
            </div>

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
                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Transparence"
                        min={1}
                        max={10}
                        value={transparency}
                        onChange={(val) => setTransparency(val)}
                        unit="/10"
                        helperText={TRANSPARENCY_LEVELS[transparency - 1]?.example}
                    />
                </div>
            )}

            {/* Sliders de qualité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Densité */}
                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Densité"
                        min={1}
                        max={10}
                        value={density}
                        onChange={(val) => setDensity(val)}
                        unit="/10"
                    />
                </div>

                {/* Trichomes (Fleurs uniquement) */}
                {productType === 'Fleur' && (
                    <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                        <WhiteSlider
                            label="Trichomes"
                            min={1}
                            max={10}
                            value={trichomes}
                            onChange={(val) => setTrichomes(val)}
                            unit="/10"
                            helperText="Quantité et qualité des cristaux"
                        />
                    </div>
                )}

                {/* Moisissures (inversé) */}
                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Moisissures (10 = aucune)"
                        min={1}
                        max={10}
                        value={mold}
                        onChange={(val) => setMold(val)}
                        unit="/10"
                        helperText="10 = aucune moisissure"
                    />
                </div>

                {/* Graines (inversé) */}
                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Graines (10 = aucune)"
                        min={1}
                        max={10}
                        value={seeds}
                        onChange={(val) => setSeeds(val)}
                        unit="/10"
                        helperText="10 = aucune graine"
                    />
                </div>
            </div>

            {/* Résumé visuel */}
            <div className="mt-6 p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/30">
                <h4 className="text-sm font-semibold mb-3 text-white">📊 Résumé Visuel</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedColors.length > 0 && (
                        <div>
                            <span className="text-gray-400">Couleurs :</span>
                            <span className="ml-2 font-bold text-white">{selectedColors.length}</span>
                        </div>
                    )}
                    <div>
                        <span className="text-gray-400">Densité :</span>
                        <span className="ml-2 font-bold text-white">{density}/10</span>
                    </div>
                    {productType === 'Fleur' && (
                        <div>
                            <span className="text-gray-400">Trichomes :</span>
                            <span className="ml-2 font-bold text-white">{trichomes}/10</span>
                        </div>
                    )}
                    {isHashOrConcentrate && (
                        <div>
                            <span className="text-gray-400">Transparence :</span>
                            <span className="ml-2 font-bold text-white">{transparency}/10</span>
                        </div>
                    )}
                    <div>
                        <span className="text-gray-400">Pureté :</span>
                        <span className="ml-2 font-bold text-green-400">{Math.round((mold + seeds) / 2)}/10</span>
                    </div>
                </div>
            </div>
        </div>
    );
}



