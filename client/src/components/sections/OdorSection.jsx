import React, { useState, useEffect } from 'react';
import { Flower2 } from 'lucide-react';
import LiquidSlider from './LiquidSlider';
import AromaWheelPicker from './AromaWheelPicker';

/**
 * Section Odeurs pour Hash/Concentrés/Fleurs
 * NOUVEAU: Utilise AromaWheelPicker avec roue CATA
 * Props: productType, formData, handleChange
 */
export default function OdorSection({ productType, formData = {}, handleChange }) {
    const data = formData.odeurs || {};
    const [dominantNotes, setDominantNotes] = useState(data?.dominantNotes || []);
    const [secondaryNotes, setSecondaryNotes] = useState(data?.secondaryNotes || []);
    const [intensity, setIntensity] = useState(data?.intensity || 5);
    const [complexity, setComplexity] = useState(data?.complexity || 5);
    const [fidelity, setFidelity] = useState(data?.fidelity || 5);
    // Synchroniser avec parent
    useEffect(() => {
        if (!handleChange) return;
        handleChange('odeurs', {
            dominantNotes,
            secondaryNotes,
            intensity,
            complexity,
            fidelity
        });
    }, [dominantNotes, secondaryNotes, intensity, complexity, fidelity, handleChange]);

    return (
        <div className="space-y-8 p-6 bg-gray-900/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br rounded-xl">
                    <Flower2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">👃 Odeurs</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profil aromatique complet (Méthode CATA)</p>
                </div>
            </div>

            {/* Fidélité cultivars (Hash/Concentrés uniquement) */}
            {(productType === 'Hash' || productType === 'Concentré') && (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <LiquidSlider
                        label="Fidélité aux cultivars"
                        min={1}
                        max={10}
                        value={fidelity}
                        onChange={setFidelity}
                        color="purple"
                        showValue
                        unit="/10"
                    />
                </div>
            )}

            {/* NOUVEAU: Roue aromatique CATA pour notes dominantes */}
            <div>
                <AromaWheelPicker
                    selectedAromas={dominantNotes}
                    onChange={setDominantNotes}
                    max={7}
                    title="🎯 Notes dominantes"
                    helper="Sélectionner jusqu'à 7 arômes dominants depuis la roue CATA"
                />
            </div>

            {/* NOUVEAU: Roue aromatique CATA pour notes secondaires */}
            <div>
                <AromaWheelPicker
                    selectedAromas={secondaryNotes}
                    onChange={setSecondaryNotes}
                    max={7}
                    title="🎨 Notes secondaires"
                    helper="Sélectionner jusqu'à 7 arômes secondaires (optionnel)"
                />
            </div>

            {/* Sliders Intensité et Complexité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                    <LiquidSlider
                        label="💪 Intensité globale"
                        min={0}
                        max={10}
                        value={intensity}
                        onChange={setIntensity}
                        color="orange"
                        showValue
                        unit="/10"
                    />
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <LiquidSlider
                        label="🌈 Complexité aromatique"
                        min={0}
                        max={10}
                        value={complexity}
                        onChange={setComplexity}
                        color="indigo"
                        showValue
                        unit="/10"
                    />
                </div>
            </div>

        </div>
    );
}


