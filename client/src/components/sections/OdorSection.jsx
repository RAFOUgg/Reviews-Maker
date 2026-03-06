import React, { useState, useEffect, useRef } from 'react';
import { Flower2 } from 'lucide-react';
import { LiquidCard, LiquidDivider } from '@/components/ui/LiquidUI';
import LiquidSlider from '@/components/ui/LiquidSlider';
import AromaWheelPicker from '../shared/charts/AromaWheelPicker';

/**
 * Section Odeurs pour Hash/Concentrés/Fleurs
 * NOUVEAU: Utilise AromaWheelPicker avec roue CATA
 * Props: productType, formData, handleChange
 */
export default function OdorSection({ productType, data: directData, onChange, formData, handleChange }) {
    const data = directData || formData?.odeurs || {};
    const safeUpdate = (payload) => {
        if (typeof onChange === 'function') return onChange(payload)
        if (typeof handleChange === 'function') return handleChange('odeurs', payload)
    }

    const [dominantNotes, setDominantNotes] = useState(data?.dominantNotes || []);
    const [secondaryNotes, setSecondaryNotes] = useState(data?.secondaryNotes || []);
    // Default to 0 when no data exists (allow explicit 0)
    const [intensity, setIntensity] = useState(data?.intensity ?? 0);
    const [complexity, setComplexity] = useState(data?.complexity ?? 0);
    const [fidelity, setFidelity] = useState(data?.fidelity ?? 0);

    // Refs anti-boucle : comparaison par valeur (JSON) pour éviter les faux positifs sur les refs de tableaux
    const lastSentStrRef = useRef(null);
    const lastLoadedStrRef = useRef(null);

    // Remonter les changements locaux vers le parent
    useEffect(() => {
        const payload = { dominantNotes, secondaryNotes, intensity, complexity, fidelity };
        const str = JSON.stringify(payload);
        lastSentStrRef.current = str;
        safeUpdate(payload);
    }, [dominantNotes, secondaryNotes, intensity, complexity, fidelity]);

    // Synchroniser depuis les props (edit mode) — uniquement si le contenu a vraiment changé
    // et ne correspond pas à ce qu'on vient d'émettre nous-mêmes
    const dataStr = JSON.stringify({ dominantNotes: data?.dominantNotes, secondaryNotes: data?.secondaryNotes, intensity: data?.intensity, complexity: data?.complexity, fidelity: data?.fidelity });
    useEffect(() => {
        if (lastLoadedStrRef.current === dataStr) return; // même contenu, rien à faire
        if (lastSentStrRef.current === dataStr) return;   // c'est notre propre mise à jour qui revient
        lastLoadedStrRef.current = dataStr;
        const d = data || {};
        setDominantNotes(d.dominantNotes || []);
        setSecondaryNotes(d.secondaryNotes || []);
        setIntensity(d.intensity ?? 0);
        setComplexity(d.complexity ?? 0);
        setFidelity(d.fidelity ?? 0);
    }, [dataStr]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <LiquidCard glow="green" padding="lg" className="space-y-8">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Flower2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">👃 Odeurs</h3>
                    <p className="text-sm text-white/50">Profil aromatique complet (Méthode CATA)</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Fidélité cultivars (Hash/Concentrés uniquement) */}
            {(productType === 'Hash' || productType === 'Concentré') && (
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                    <LiquidSlider
                        label="Fidélité aux cultivars"
                        value={fidelity}
                        min={0}
                        max={10}
                        step={1}
                        color="green"
                        onChange={(val) => setFidelity(val)}
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
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
                    <LiquidSlider
                        label="💪 Intensité globale"
                        value={intensity}
                        min={0}
                        max={10}
                        step={1}
                        color="green"
                        onChange={(val) => setIntensity(val)}
                    />
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <LiquidSlider
                        label="🌈 Complexité aromatique"
                        value={complexity}
                        min={0}
                        max={10}
                        step={1}
                        color="green"
                        onChange={(val) => setComplexity(val)}
                    />
                </div>
            </div>

        </LiquidCard>
    );
}


