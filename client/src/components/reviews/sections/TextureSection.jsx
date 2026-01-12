import React, { useState, useEffect } from 'react';
import { Hand, Sparkles } from 'lucide-react';
import WhiteSlider from '../../ui/WhiteSlider';

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
    { value: 9, label: 'Excellent', color: '' },
    { value: 10, label: 'Exceptionnel', color: '' }
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
 * Props: productType, formData, handleChange
 */
export default function TextureSection({ productType, formData = {}, handleChange }) {
    const data = formData.texture || {};
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

        handleChange('texture', textureData);
    }, [hardness, density, malleability, elasticity, stickiness, melting, residue, friability, viscosity, productType, handleChange]);

    return (
        <div className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br rounded-xl">
                    <Hand className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">🤚 Texture</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Propriétés tactiles et physiques</p>
                </div>
            </div>

            {/* Champs communs (tous types) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Dureté"
                        min={1}
                        max={10}
                        value={hardness}
                        onChange={setHardness}
                        unit="/10"
                        helperText={TEXTURE_LABELS.hardness[hardness]}
                    />
                </div>

                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Densité tactile"
                        min={1}
                        max={10}
                        value={density}
                        onChange={setDensity}
                        unit="/10"
                        helperText={TEXTURE_LABELS.density[density]}
                    />
                </div>

                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Collant"
                        min={1}
                        max={10}
                        value={stickiness}
                        onChange={setStickiness}
                        unit="/10"
                        helperText={TEXTURE_LABELS.stickiness[stickiness]}
                    />
                </div>

                {/* Élasticité (Fleurs uniquement) */}
                {productType === 'Fleurs' && (
                    <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                        <WhiteSlider
                            label="Élasticité"
                            min={1}
                            max={10}
                            value={elasticity}
                            onChange={setElasticity}
                            unit="/10"
                            helperText={TEXTURE_LABELS.elasticity[elasticity]}
                        />
                    </div>
                )}

                {/* Malléabilité (Hash uniquement) */}
                {productType === 'Hash' && (
                    <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                        <WhiteSlider
                            label="Malléabilité"
                            min={1}
                            max={10}
                            value={malleability}
                            onChange={setMalleability}
                            unit="/10"
                            helperText={TEXTURE_LABELS.malleability[malleability]}
                        />
                    </div>
                )}

                {/* Friabilité (Hash uniquement) */}
                {productType === 'Hash' && (
                    <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                        <WhiteSlider
                            label="Friabilité"
                            min={1}
                            max={10}
                            value={friability}
                            onChange={setFriability}
                            unit="/10"
                            helperText={TEXTURE_LABELS.friability[friability]}
                        />
                    </div>
                )}

                {/* Viscosité (Concentrés uniquement) */}
                {productType === 'Concentré' && (
                    <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                        <WhiteSlider
                            label="Viscosité"
                            min={1}
                            max={10}
                            value={viscosity}
                            onChange={setViscosity}
                            unit="/10"
                            helperText={TEXTURE_LABELS.viscosity[viscosity]}
                        />
                    </div>
                )}
            </div>

            {/* Melting & Résidus (Hash/Concentrés uniquement) */}
            {(productType === 'Hash' || productType === 'Concentré') && (
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Propriétés de fonte
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                            <WhiteSlider
                                label="Melting (10 = Full Melt)"
                                min={1}
                                max={10}
                                value={melting}
                                onChange={setMelting}
                                unit="/10"
                                helperText={TEXTURE_LABELS.melting[melting]}
                            />
                        </div>

                        <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                            <WhiteSlider
                                label="Résidus (10 = aucun)"
                                min={1}
                                max={10}
                                value={residue}
                                onChange={setResidue}
                                unit="/10"
                                helperText={TEXTURE_LABELS.residue[residue]}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Résumé */}
            <div className="p-4 bg-gradient-to-br dark:/20 dark:/20 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
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
                                <span className="font-semibold dark:">Score de pureté :</span> {purityScore}/10
                            </p>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}
