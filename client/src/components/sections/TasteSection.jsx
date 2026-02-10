import React, { useState, useEffect } from 'react';
import { TASTE_INTENSITY_LEVELS, AGGRESSIVENESS_LEVELS } from '../../data/tasteNotes';
import { Coffee, Sparkles } from 'lucide-react';
import { LiquidCard, LiquidDivider } from '@/components/ui/LiquidUI';
import LiquidSlider from '@/components/ui/LiquidSlider';
import TasteWheelPicker from '@/components/shared/charts/TasteWheelPicker';

/**
 * Section Goûts pour Hash/Concentrés/Fleurs
 * Props: productType, formData, handleChange
 */
export default function TasteSection({ productType, data: directData, onChange, formData, handleChange }) {
    const data = directData || formData?.gouts || {};
    const safeUpdate = (payload) => {
        if (typeof onChange === 'function') return onChange(payload)
        if (typeof handleChange === 'function') return handleChange('gouts', payload)
    }

    // Default to 0 so sliders start at 0 when no data is present
    const [intensity, setIntensity] = useState(data?.intensity ?? 0);
    const [aggressiveness, setAggressiveness] = useState(data?.aggressiveness ?? 0);
    const [dryPuffNotes, setDryPuffNotes] = useState(data?.dryPuffNotes || []);
    const [inhalationNotes, setInhalationNotes] = useState(data?.inhalationNotes || []);
    const [exhalationNotes, setExhalationNotes] = useState(data?.exhalationNotes || []);

    // Synchroniser avec parent
    useEffect(() => {
        safeUpdate({
            intensity,
            aggressiveness,
            dryPuffNotes,
            inhalationNotes,
            exhalationNotes
        })
    }, [intensity, aggressiveness, dryPuffNotes, inhalationNotes, exhalationNotes]);

    return (
        <LiquidCard glow="amber" padding="lg" className="space-y-8">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Coffee className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">😋 Goûts</h3>
                    <p className="text-sm text-white/50">Profil gustatif détaillé</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Intensité et Agressivité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Intensité gustative"
                        value={intensity}
                        min={0}
                        max={10}
                        step={1}
                        color="orange"
                        onChange={(val) => setIntensity(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{intensity > 0 ? TASTE_INTENSITY_LEVELS[intensity - 1]?.label : 'Non évalué'}</p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Agressivité / Piquant"
                        value={aggressiveness}
                        min={0}
                        max={10}
                        step={1}
                        color="orange"
                        onChange={(val) => setAggressiveness(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{aggressiveness > 0 ? AGGRESSIVENESS_LEVELS[aggressiveness - 1]?.label : 'Non évalué'}</p>
                </div>
            </div>

            {/* Filtre par famille - Supprimé : intégré dans les pickers */}

            {/* Dry Puff / Tirage à sec (max 7) */}
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <TasteWheelPicker
                    selectedTastes={dryPuffNotes}
                    onChange={setDryPuffNotes}
                    max={7}
                    title="🌬️ Dry puff / Tirage à sec"
                    helper="Notes perçues avant la combustion"
                />
            </div>

            {/* Inhalation (max 7) */}
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <TasteWheelPicker
                    selectedTastes={inhalationNotes}
                    onChange={setInhalationNotes}
                    max={7}
                    title="⬇️ Inhalation"
                    helper="Notes perçues à l'inhalation"
                />
            </div>

            {/* Expiration / Arrière-goût (max 7) */}
            <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <TasteWheelPicker
                    selectedTastes={exhalationNotes}
                    onChange={setExhalationNotes}
                    max={7}
                    title="⬆️ Expiration / Arrière-goût"
                    helper="Notes perçues à l'expiration et en rétro-olfaction"
                />
            </div>



        </LiquidCard>
    );
}




