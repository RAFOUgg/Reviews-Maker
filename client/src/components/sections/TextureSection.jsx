import React, { useState, useEffect } from 'react';
import { Hand, Sparkles } from 'lucide-react';
import { LiquidCard, LiquidDivider } from '@/components/ui/LiquidUI';
import LiquidSlider from '@/components/ui/LiquidSlider';

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
 * Props: productType, data (ou formData), onChange (ou handleChange)
 * Support des deux patterns d'appel pour compatibilité
 */
export default function TextureSection({ productType, data: directData, onChange, formData, handleChange }) {
    // Support des deux patterns : data/onChange OU formData/handleChange
    const textureData = directData || formData?.texture || {};

    // Créer un handler sûr qui vérifie l'existence des fonctions
    const updateHandler = (newData) => {
        if (typeof onChange === 'function') {
            onChange(newData);
        } else if (typeof handleChange === 'function') {
            handleChange('texture', newData);
        }
    };

    const [hardness, setHardness] = useState(textureData?.hardness || 5);
    const [density, setDensity] = useState(textureData?.density || 5);
    const [malleability, setMalleability] = useState(textureData?.malleability || 5);
    const [elasticity, setElasticity] = useState(textureData?.elasticity || 5);
    const [stickiness, setStickiness] = useState(textureData?.stickiness || 5);
    const [melting, setMelting] = useState(textureData?.melting || 5);
    const [residue, setResidue] = useState(textureData?.residue || 10);
    const [friability, setFriability] = useState(textureData?.friability || 5);
    const [viscosity, setViscosity] = useState(textureData?.viscosity || 5);

    // Score de pureté calculé pour Hash / Concentrés (moyenne simple melting/residue)
    const purityScore = (productType === 'Hash' || productType === 'Concentré')
        ? Math.round((Number(melting || 0) + Number(residue || 0)) / 2)
        : null;

    // Synchroniser avec parent
    useEffect(() => {
        const newTextureData = {
            hardness,
            density,
            stickiness
        };

        // Champs spécifiques selon productType - Note: "flower" (pas "Fleurs")
        if (productType === 'Fleurs' || productType === 'flower') {
            newTextureData.elasticity = elasticity;
        }

        if (productType === 'hash' || productType === 'concentrate') {
            newTextureData.melting = melting;
            newTextureData.residue = residue;
        }

        if (productType === 'Hash') {
            newTextureData.malleability = malleability;
            newTextureData.friability = friability;
        }

        if (productType === 'Concentré') {
            newTextureData.viscosity = viscosity;
        }

        updateHandler(newTextureData);
    }, [hardness, density, malleability, elasticity, stickiness, melting, residue, friability, viscosity, productType]);

    return (
        <LiquidCard glow="purple" padding="lg" className="space-y-8">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <Hand className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">🤚 Texture</h3>
                    <p className="text-sm text-white/50">Propriétés tactiles et physiques</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Champs communs (tous types) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Dureté"
                        value={hardness}
                        min={1}
                        max={10}
                        step={1}
                        color="pink"
                        onChange={(val) => setHardness(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.hardness[hardness]}</p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Densité tactile"
                        value={density}
                        min={1}
                        max={10}
                        step={1}
                        color="pink"
                        onChange={(val) => setDensity(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.density[density]}</p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Collant"
                        value={stickiness}
                        min={1}
                        max={10}
                        step={1}
                        color="pink"
                        onChange={(val) => setStickiness(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.stickiness[stickiness]}</p>
                </div>

                {/* Élasticité (Fleurs uniquement) */}
                {(productType === 'Fleurs' || productType === 'flower') && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <LiquidSlider
                            label="Élasticité"
                            value={elasticity}
                            min={1}
                            max={10}
                            step={1}
                            color="pink"
                            onChange={(val) => setElasticity(val)}
                        />
                        <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.elasticity[elasticity]}</p>
                    </div>
                )}

                {/* Malléabilité (Hash uniquement) */}
                {productType === 'Hash' && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <LiquidSlider
                            label="Malléabilité"
                            value={malleability}
                            min={1}
                            max={10}
                            step={1}
                            color="pink"
                            onChange={(val) => setMalleability(val)}
                        />
                        <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.malleability[malleability]}</p>
                    </div>
                )}

                {/* Friabilité (Hash uniquement) */}
                {productType === 'Hash' && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <LiquidSlider
                            label="Friabilité"
                            value={friability}
                            min={1}
                            max={10}
                            step={1}
                            color="pink"
                            onChange={(val) => setFriability(val)}
                        />
                        <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.friability[friability]}</p>
                    </div>
                )}

                {/* Viscosité (Concentrés uniquement) */}
                {productType === 'Concentré' && (
                    <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                        <LiquidSlider
                            label="Viscosité"
                            value={viscosity}
                            min={1}
                            max={10}
                            step={1}
                            color="pink"
                            onChange={(val) => setViscosity(val)}
                        />
                        <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.viscosity[viscosity]}</p>
                    </div>
                )}
            </div>

            {/* Melting & Résidus (Hash/Concentrés uniquement) */}
            {(productType === 'Hash' || productType === 'Concentré') && (
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        Propriétés de fonte
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <LiquidSlider
                                label="Melting (10 = Full Melt)"
                                value={melting}
                                min={1}
                                max={10}
                                step={1}
                                color="amber"
                                onChange={(val) => setMelting(val)}
                            />
                            <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.melting[melting]}</p>
                        </div>

                        <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <LiquidSlider
                                label="Résidus (10 = aucun)"
                                value={residue}
                                min={1}
                                max={10}
                                step={1}
                                color="green"
                                onChange={(val) => setResidue(val)}
                            />
                            <p className="text-xs text-white/40 mt-2">{TEXTURE_LABELS.residue[residue]}</p>
                        </div>
                    </div>
                </div>
            )}



        </LiquidCard>
    );
}



