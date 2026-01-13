import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CollapsibleMobileSection, MobileFormGroup } from '../../../components/layout/MobileReviewLayout';
import { ResponsiveSlider, ResponsiveGrid } from '../../../components/ResponsiveSectionComponents';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { useMobileFormSection } from '../../../hooks/useMobileFormSection';

/**
 * OdeursSection - Optimisée pour mobile et desktop
 * 
 * Mobile:
 * - Sliders compacts
 * - Grid 2 colonnes pour pills
 * - Collapsible par défaut
 * 
 * Desktop:
 * - Layout normal
 * - Grid 3-4 colonnes
 */

export default function OdeursSection({ formData, handleChange }) {
    const { isMobile } = useResponsiveLayout();
    const { gridClasses } = useMobileFormSection('odeurs');
    const [aromas, setAromas] = useState([]);
    const [selectedDominant, setSelectedDominant] = useState(formData.odeursDominantes || []);
    const [selectedSecondary, setSelectedSecondary] = useState(formData.odeursSecondaires || []);
    const [showAllDominant, setShowAllDominant] = useState(false);
    const [showAllSecondary, setShowAllSecondary] = useState(false);

    useEffect(() => {
        fetch('/data/aromas.json')
            .then(res => res.json())
            .then(data => setAromas(data || []))
            .catch(err => console.error('Failed to load aromas:', err));
    }, []);

    // Limiter affichage sur mobile
    const displayedDominantCount = showAllDominant ? aromas.length : Math.min(isMobile ? 8 : 14, aromas.length);
    const displayedSecondaryCount = showAllSecondary ? aromas.length : Math.min(isMobile ? 8 : 14, aromas.length);

    const displayedDominant = aromas.slice(0, displayedDominantCount);
    const displayedSecondary = aromas.slice(0, displayedSecondaryCount);

    const toggleAroma = (aroma, type) => {
        const list = type === 'dominant' ? selectedDominant : selectedSecondary;
        const setList = type === 'dominant' ? setSelectedDominant : setSelectedSecondary;
        const field = type === 'dominant' ? 'odeursDominantes' : 'odeursSecondaires';

        if (list.includes(aroma)) {
            const updated = list.filter(a => a !== aroma);
            setList(updated);
            handleChange(field, updated);
        } else if (list.length < 7) {
            const updated = [...list, aroma];
            setList(updated);
            handleChange(field, updated);
        }
    };

    return (
        <CollapsibleMobileSection
            title="Odeurs"
            icon="👃"
            defaultOpen={!isMobile}
        >
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
                {/* Intensité aromatique */}
                <MobileFormGroup label="Intensité aromatique">
                    <ResponsiveSlider
                        value={formData.intensiteOdeur || 0}
                        onChange={(val) => handleChange('intensiteOdeur', val)}
                        min={0}
                        max={10}
                        step={1}
                        showValue={true}
                        unit="/10"
                    />
                </MobileFormGroup>

                {/* Notes dominantes */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                            Notes dominantes (max 7)
                        </label>
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-purple-400`}>
                            {selectedDominant.length}/7
                        </span>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-2 gap-1.5' : gridClasses.auto2} gap-2`}>
                        {displayedDominant.map(aroma => (
                            <motion.button
                                key={aroma}
                                type="button"
                                onClick={() => toggleAroma(aroma, 'dominant')}
                                disabled={!selectedDominant.includes(aroma) && selectedDominant.length >= 7}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    px-3 py-2 rounded-lg text-xs font-medium transition-all
                                    ${selectedDominant.includes(aroma)
                                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }
                                    ${!selectedDominant.includes(aroma) && selectedDominant.length >= 7
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'cursor-pointer'
                                    }
                                `}
                            >
                                {aroma}
                            </motion.button>
                        ))}
                    </div>

                    {aromas.length > displayedDominantCount && (
                        <button
                            onClick={() => setShowAllDominant(!showAllDominant)}
                            className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
                        >
                            {showAllDominant ? 'Voir moins' : `Voir tous (${aromas.length})`}
                        </button>
                    )}
                </div>

                {/* Notes secondaires */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                            Notes secondaires (max 7)
                        </label>
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-purple-400`}>
                            {selectedSecondary.length}/7
                        </span>
                    </div>

                    <div className={`grid ${isMobile ? 'grid-cols-2 gap-1.5' : gridClasses.auto2} gap-2`}>
                        {displayedSecondary.map(aroma => (
                            <motion.button
                                key={aroma}
                                type="button"
                                onClick={() => toggleAroma(aroma, 'secondary')}
                                disabled={!selectedSecondary.includes(aroma) && selectedSecondary.length >= 7}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    px-3 py-2 rounded-lg text-xs font-medium transition-all
                                    ${selectedSecondary.includes(aroma)
                                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }
                                    ${!selectedSecondary.includes(aroma) && selectedSecondary.length >= 7
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'cursor-pointer'
                                    }
                                `}
                            >
                                {aroma}
                            </motion.button>
                        ))}
                    </div>

                    {aromas.length > displayedSecondaryCount && (
                        <button
                            onClick={() => setShowAllSecondary(!showAllSecondary)}
                            className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
                        >
                            {showAllSecondary ? 'Voir moins' : `Voir tous (${aromas.length})`}
                        </button>
                    )}
                </div>

                {/* Fidélité au cultivar */}
                <MobileFormGroup label="Fidélité au cultivar">
                    <ResponsiveSlider
                        value={formData.fideliteOdeur || 0}
                        onChange={(val) => handleChange('fideliteOdeur', val)}
                        min={0}
                        max={10}
                        step={1}
                        showValue={true}
                        unit="/10"
                    />
                </MobileFormGroup>
            </div>
        </CollapsibleMobileSection>
    );
}
