import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CollapsibleMobileSection, MobileFormGroup } from '../../../components/layout/MobileReviewLayout';
import { ResponsiveSlider } from '../../../components/ResponsiveSectionComponents';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { useMobileFormSection } from '../../../hooks/useMobileFormSection';

/**
 * GoutsSection - Optimisée pour mobile
 */

export default function GoutsOptimized({ formData, handleChange }) {
    const { isMobile } = useResponsiveLayout();
    const { gridClasses } = useMobileFormSection('gouts');
    const [tastes, setTastes] = useState([]);
    const [selectedDry, setSelectedDry] = useState(formData.dryPuff || []);
    const [selectedInhale, setSelectedInhale] = useState(formData.inhalation || []);
    const [selectedExhale, setSelectedExhale] = useState(formData.expiration || []);
    const [showAllDry, setShowAllDry] = useState(false);
    const [showAllInhale, setShowAllInhale] = useState(false);
    const [showAllExhale, setShowAllExhale] = useState(false);

    useEffect(() => {
        fetch('/data/tastes.json')
            .then(res => res.json())
            .then(data => setTastes(data || []))
            .catch(err => console.error('Failed to load tastes:', err));
    }, []);

    const toggleTaste = (taste, type) => {
        const lists = {
            dry: { state: selectedDry, setState: setSelectedDry, field: 'dryPuff' },
            inhale: { state: selectedInhale, setState: setSelectedInhale, field: 'inhalation' },
            exhale: { state: selectedExhale, setState: setSelectedExhale, field: 'expiration' }
        };

        const { state, setState, field } = lists[type];

        if (state.includes(taste)) {
            const updated = state.filter(t => t !== taste);
            setState(updated);
            handleChange(field, updated);
        } else if (state.length < 7) {
            const updated = [...state, taste];
            setState(updated);
            handleChange(field, updated);
        }
    };

    const displayCount = isMobile ? 8 : 14;
    const displayedDry = tastes.slice(0, showAllDry ? tastes.length : displayCount);
    const displayedInhale = tastes.slice(0, showAllInhale ? tastes.length : displayCount);
    const displayedExhale = tastes.slice(0, showAllExhale ? tastes.length : displayCount);

    return (
        <CollapsibleMobileSection
            title="Goûts"
            icon="😋"
            defaultOpen={!isMobile}
        >
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
                {/* Intensité */}
                <MobileFormGroup label="Intensité du goût">
                    <ResponsiveSlider
                        value={formData.intensiteGout || 0}
                        onChange={(val) => handleChange('intensiteGout', val)}
                        min={0}
                        max={10}
                        step={1}
                        showValue={true}
                        unit="/10"
                    />
                </MobileFormGroup>

                {/* Agressivité */}
                <MobileFormGroup label="Agressivité / Piquant">
                    <ResponsiveSlider
                        value={formData.agressiviteGout || 0}
                        onChange={(val) => handleChange('agressiviteGout', val)}
                        min={0}
                        max={10}
                        step={1}
                        showValue={true}
                        unit="/10"
                    />
                </MobileFormGroup>

                {/* Dry Puff */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                            Dry Puff / Tirage à sec (max 7)
                        </label>
                        <span className="text-xs font-bold text-purple-400">{selectedDry.length}/7</span>
                    </div>
                    <div className={`grid ${isMobile ? 'grid-cols-2 gap-1.5' : gridClasses.auto2}`}>
                        {displayedDry.map(taste => (
                            <motion.button
                                key={taste}
                                onClick={() => toggleTaste(taste, 'dry')}
                                disabled={!selectedDry.includes(taste) && selectedDry.length >= 7}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedDry.includes(taste)
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    } ${!selectedDry.includes(taste) && selectedDry.length >= 7 ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                {taste}
                            </motion.button>
                        ))}
                    </div>
                    {tastes.length > displayCount && (
                        <button
                            onClick={() => setShowAllDry(!showAllDry)}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                            {showAllDry ? 'Voir moins' : `Voir tous (${tastes.length})`}
                        </button>
                    )}
                </div>

                {/* Inhalation */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                            Inhalation (max 7)
                        </label>
                        <span className="text-xs font-bold text-purple-400">{selectedInhale.length}/7</span>
                    </div>
                    <div className={`grid ${isMobile ? 'grid-cols-2 gap-1.5' : gridClasses.auto2}`}>
                        {displayedInhale.map(taste => (
                            <motion.button
                                key={taste}
                                onClick={() => toggleTaste(taste, 'inhale')}
                                disabled={!selectedInhale.includes(taste) && selectedInhale.length >= 7}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedInhale.includes(taste)
                                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    } ${!selectedInhale.includes(taste) && selectedInhale.length >= 7 ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                {taste}
                            </motion.button>
                        ))}
                    </div>
                    {tastes.length > displayCount && (
                        <button
                            onClick={() => setShowAllInhale(!showAllInhale)}
                            className="mt-2 text-xs text-green-400 hover:text-green-300 underline"
                        >
                            {showAllInhale ? 'Voir moins' : `Voir tous (${tastes.length})`}
                        </button>
                    )}
                </div>

                {/* Expiration */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                            Expiration / Arrière-goût (max 7)
                        </label>
                        <span className="text-xs font-bold text-purple-400">{selectedExhale.length}/7</span>
                    </div>
                    <div className={`grid ${isMobile ? 'grid-cols-2 gap-1.5' : gridClasses.auto2}`}>
                        {displayedExhale.map(taste => (
                            <motion.button
                                key={taste}
                                onClick={() => toggleTaste(taste, 'exhale')}
                                disabled={!selectedExhale.includes(taste) && selectedExhale.length >= 7}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedExhale.includes(taste)
                                        ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    } ${!selectedExhale.includes(taste) && selectedExhale.length >= 7 ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                {taste}
                            </motion.button>
                        ))}
                    </div>
                    {tastes.length > displayCount && (
                        <button
                            onClick={() => setShowAllExhale(!showAllExhale)}
                            className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline"
                        >
                            {showAllExhale ? 'Voir moins' : `Voir tous (${tastes.length})`}
                        </button>
                    )}
                </div>
            </div>
        </CollapsibleMobileSection>
    );
}
