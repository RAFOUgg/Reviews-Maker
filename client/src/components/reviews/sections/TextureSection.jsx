import React, { useState, useEffect } from 'react';
import { Hand, Sparkles } from 'lucide-react';
import { LiquidSlider } from '../../../components/liquid';

/**
 * Niveaux de qualité pour les sliders de texture
 */
const TEXTURE_QUALITY_LEVELS = [
    { value: 1, label: 'Très faible', color: 'text-red-600' },
    { value: 2, label: 'Faible', color: 'text-red-500' },
    { value: 3, label: 'Médiocre', color: 'text-orange-500' },
    { value: 4, label: 'Passable', color: 'text-orange-400' },
    { value: 5, label: 'Moyen', color: 'text-yellow-500' },
    { value: 6, label: 'Correct', color: 'text-yellow-600' },
    { value: 7, label: 'Bon', color: 'text-green-500' },
    { value: 8, label: 'Très bon', color: 'text-green-600' },
    { value: 9, label: 'Excellent', color: 'text-blue-500' },
    { value: 10, label: 'Exceptionnel', color: 'text-purple-600' }
];

/**
 * Labels spécifiques par champ de texture
 */
const TEXTURE_LABELS = {
    hardness: {
        1: 'Très mou', 2: 'Mou', 3: 'Souple', 4: 'Semi-souple', 5: 'Moyen',
        6: 'Ferme', 7: 'Dur', 8: 'Très dur', 9: 'Compact', 10: 'Béton'
    },
    density: {
        1: 'Très aéré', 2: 'Aéré', 3: 'Léger', 4: 'Peu dense', 5: 'Moyen',
        6: 'Dense', 7: 'Très dense', 8: 'Compact', 9: 'Très compact', 10: 'Massif'
    },
    malleability: {
        1: 'Cassant', 2: 'Fragile', 3: 'Rigide', 4: 'Peu souple', 5: 'Moyen',
        6: 'Souple', 7: 'Malléable', 8: 'Très malléable', 9: 'Plastique', 10: 'Très plastique'
    },
    elasticity: {
        1: 'Aucune', 2: 'Très faible', 3: 'Faible', 4: 'Peu élastique', 5: 'Moyen',
        6: 'Élastique', 7: 'Très élastique', 8: 'Rebond', 9: 'Très rebondissant', 10: 'Caoutchouteux'
    },
    stickiness: {
        1: 'Sec', 2: 'Très peu', 3: 'Peu collant', 4: 'Légèrement', 5: 'Moyen',
        6: 'Collant', 7: 'Très collant', 8: 'Gluant', 9: 'Très gluant', 10: 'Adhésif'
    },
    melting: {
        1: 'Aucun', 2: 'Très faible', 3: 'Faible', 4: 'Peu de fonte', 5: 'Moyen',
        6: 'Bonne fonte', 7: 'Très bonne fonte', 8: 'Excellent', 9: 'Full melt', 10: 'Parfait'
    },
    residue: {
        10: 'Aucun', 9: 'Minime', 8: 'Très peu', 7: 'Peu', 6: 'Acceptable',
        5: 'Moyen', 4: 'Présent', 3: 'Visible', 2: 'Important', 1: 'Très important'
    },
    friability: {
        1: 'Très dur', 2: 'Dur', 3: 'Compact', 4: 'Peu friable', 5: 'Moyen',
        6: 'Friable', 7: 'Très friable', 8: 'S\'émiette', 9: 'Poudre', 10: 'Poussière'
    },
    viscosity: {
        1: 'Très liquide', 2: 'Liquide', 3: 'Coulant', 4: 'Fluide', 5: 'Moyen',
        6: 'Épais', 7: 'Très épais', 8: 'Visqueux', 9: 'Très visqueux', 10: 'Pâteux'
    }
};

/**
 * Section Texture pour Hash/Concentrés/Fleurs
 * Props: productType, data, onChange
 */
export default function TextureSection({ productType, data = {}, onChange }) {
    const [hardness, setHardness] = useState(data?.hardness || 5);
    const [density, setDensity] = useState(data?.density || 5);
    const [malleability, setMalleability] = useState(data?.malleability || 5);
    const [elasticity, setElasticity] = useState(data?.elasticity || 5);
    const [stickiness, setStickiness] = useState(data?.stickiness || 5);
    const [melting, setMelting] = useState(data?.melting || 5);
    const [residue, setResidue] = useState(data?.residue || 10);
    const [friability, setFriability] = useState(data?.friability || 5);
    const [viscosity, setViscosity] = useState(data?.viscosity || 5);

    // Synchroniser avec parent
    useEffect(() => {
        const textureData = {
            hardness,
            density,
            stickiness
        };

        // Champs spécifiques selon productType
        if (productType === 'Fleurs') {
            textureData.elasticity = elasticity;
        }

        if (productType === 'Hash' || productType === 'Concentré') {
            textureData.melting = melting;
            textureData.residue = residue;
        }

        if (productType === 'Hash') {
            textureData.malleability = malleability;
            textureData.friability = friability;
        }

        if (productType === 'Concentré') {
            textureData.viscosity = viscosity;
        }

        onChange(textureData);
    }, [hardness, density, malleability, elasticity, stickiness, melting, residue, friability, viscosity, productType]);

    return (
        <div className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Hand className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">🤚 Texture</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Propriétés tactiles et physiques</p>
                </div>
            </div>

            {/* Champs communs (tous types) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <LiquidSlider
                        label="Dureté"
                        min={1}
                        max={10}
                        value={hardness}
                        onChange={setHardness}
                        color="cyan"
                        showValue
                        unit="/10"
                    />
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <LiquidSlider
                        label="Densité tactile"
                        min={1}
                        max={10}
                        value={density}
                        onChange={setDensity}
                        color="green"
                        showValue
                        unit="/10"
                    />
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                    <LiquidSlider
                        label="Collant"
                        min={1}
                        max={10}
                        value={stickiness}
                        onChange={setStickiness}
                        color="orange"
                        showValue
                        unit="/10"
                    />
                </div>

                {/* Élasticité (Fleurs uniquement) */}
                {productType === 'Fleurs' && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <LiquidSlider
                            label="Élasticité"
                            min={1}
                            max={10}
                            value={elasticity}
                            onChange={setElasticity}
                            color="purple"
                            showValue
                            unit="/10"
                        />
                    </div>
                )}

                {/* Malléabilité (Hash uniquement) */}
                {productType === 'Hash' && (
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl">
                        <LiquidSlider
                            label="Malléabilité"
                            min={1}
                            max={10}
                            value={malleability}
                            onChange={setMalleability}
                            color="purple"
                            showValue
                            unit="/10"
                        />
                    </div>
                )}

                {/* Friabilité (Hash uniquement) */}
                {productType === 'Hash' && (
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                        <LiquidSlider
                            label="Friabilité"
                            min={1}
                            max={10}
                            value={friability}
                            onChange={setFriability}
                            color="orange"
                            showValue
                            unit="/10"
                        />
                    </div>
                )}

                {/* Viscosité (Concentrés uniquement) */}
                {productType === 'Concentré' && (
                    <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                        <LiquidSlider
                            label="Viscosité"
                            min={1}
                            max={10}
                            value={viscosity}
                            onChange={setViscosity}
                            color="cyan"
                            showValue
                            unit="/10"
                        />
                    </div>
                )}
            </div>

            {/* Melting & Résidus (Hash/Concentrés uniquement) */}
            {(productType === 'Hash' || productType === 'Concentré') && (
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        Propriétés de fonte
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                            <LiquidSlider
                                label="Melting (10 = Full Melt)"
                                min={1}
                                max={10}
                                value={melting}
                                onChange={setMelting}
                                color="purple"
                                showValue
                                unit="/10"
                            />
                        </div>

                        <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl">
                            <LiquidSlider
                                label="Résidus (10 = aucun)"
                                min={1}
                                max={10}
                                value={residue}
                                onChange={setResidue}
                                color="orange"
                                showValue
                                unit="/10"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Résumé */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Résumé texture
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><span className="font-semibold">Dureté :</span> {TEXTURE_LABELS.hardness[hardness]} ({hardness}/10)</p>
                    <p><span className="font-semibold">Densité :</span> {TEXTURE_LABELS.density[density]} ({density}/10)</p>
                    <p><span className="font-semibold">Collant :</span> {TEXTURE_LABELS.stickiness[stickiness]} ({stickiness}/10)</p>

                    {productType === 'Fleurs' && (
                        <p><span className="font-semibold">Élasticité :</span> {TEXTURE_LABELS.elasticity[elasticity]} ({elasticity}/10)</p>
                    )}

                    {productType === 'Hash' && (
                        <>
                            <p><span className="font-semibold">Malléabilité :</span> {TEXTURE_LABELS.malleability[malleability]} ({malleability}/10)</p>
                            <p><span className="font-semibold">Friabilité :</span> {TEXTURE_LABELS.friability[friability]} ({friability}/10)</p>
                        </>
                    )}

                    {productType === 'Concentré' && (
                        <p><span className="font-semibold">Viscosité :</span> {TEXTURE_LABELS.viscosity[viscosity]} ({viscosity}/10)</p>
                    )}

                    {(productType === 'Hash' || productType === 'Concentré') && purityScore && (
                        <>
                            <p><span className="font-semibold">Melting :</span> {TEXTURE_LABELS.melting[melting]} ({melting}/10)</p>
                            <p><span className="font-semibold">Résidus :</span> {TEXTURE_LABELS.residue[residue]} ({residue}/10)</p>
                            <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                                <span className="font-semibold text-purple-600 dark:text-purple-400">Score de pureté :</span> {purityScore}/10
                            </p>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}
