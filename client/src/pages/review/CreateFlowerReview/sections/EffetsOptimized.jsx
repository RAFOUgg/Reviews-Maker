import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CollapsibleMobileSection, MobileFormGroup } from '../../../../components/forms/helpers/MobileReviewLayout';
import { ResponsiveSlider } from '../../../../components/forms/helpers/ResponsiveSectionComponents';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { useMobileFormSection } from '../../../hooks/useMobileFormSection';

/**
 * EffetsSection - Optimisée pour mobile
 * 
 * Mobile:
 * - Catégories collapsibles (Mental, Physique, Thérapeutique)
 * - Moins de colonnes
 * - Compact
 */

const EFFECT_CATEGORIES = {
    mental: {
        label: 'Mentaux',
        icon: '🧠',
        color: 'blue',
        effects: [
            'Créatif', 'Énergisant', 'Euphorique', 'Euphorie', 'Focus',
            'Relaxant', 'Social', 'Talkative', 'Uplifting', 'Calme',
            'Anxiolytique', 'Apathie', 'Confused', 'Dépression'
        ]
    },
    physique: {
        label: 'Physiques',
        icon: '💪',
        color: 'red',
        effects: [
            'Asthénie', 'Couch lock', 'Dry mouth', 'Dry eyes', 'Appétit',
            'Fatigue', 'Insomnie', 'Mal de tête', 'Nausée', 'Paresthésie',
            'Tachycardie', 'Tremblements', 'Toux', 'Vertiges'
        ]
    },
    therapeutique: {
        label: 'Thérapeutiques',
        icon: '⚕️',
        color: 'green',
        effects: [
            'Antalgique', 'Anti-inflammatoire', 'Antiépileptique',
            'Antiémétique', 'Anticonvulsivant', 'Antispasmodique',
            'Antimicrobien', 'Antioxydant', 'Neuroprotecteur',
            'Réduction anxiété'
        ]
    }
};

export default function EffetsOptimized({ formData, handleChange }) {
    const { isMobile } = useResponsiveLayout();
    const { gridClasses } = useMobileFormSection('effets');
    const [selectedEffects, setSelectedEffects] = useState(formData.effets || []);
    const [expandedCategories, setExpandedCategories] = useState({
        mental: !isMobile,
        physique: !isMobile,
        therapeutique: !isMobile
    });
    const [filterMode, setFilterMode] = useState('tous'); // tous, positif, negatif

    // Catégories positif/négatif
    const positiveEffects = ['Créatif', 'Énergisant', 'Euphorique', 'Focus', 'Social', 'Calme', 'Antialgique'];
    const negativeEffects = ['Apathie', 'Confusion', 'Dry mouth', 'Dry eyes', 'Fatigue', 'Vertiges', 'Nausée'];

    const toggleEffect = (effect) => {
        const updated = selectedEffects.includes(effect)
            ? selectedEffects.filter(e => e !== effect)
            : selectedEffects.length < 8
                ? [...selectedEffects, effect]
                : selectedEffects;

        setSelectedEffects(updated);
        handleChange('effets', updated);
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const shouldShowEffect = (effect) => {
        if (filterMode === 'positif') return positiveEffects.includes(effect);
        if (filterMode === 'negatif') return negativeEffects.includes(effect);
        return true;
    };

    return (
        <CollapsibleMobileSection
            title="Effets ressentis"
            icon="💥"
            defaultOpen={!isMobile}
        >
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
                {/* Montée et Intensité */}
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                    <MobileFormGroup label="Montée (rapidité)">
                        <ResponsiveSlider
                            value={formData.monteeMontee || 0}
                            onChange={(val) => handleChange('monteeMontee', val)}
                            min={0}
                            max={10}
                            step={1}
                            showValue={true}
                            unit="/10"
                        />
                    </MobileFormGroup>

                    <MobileFormGroup label="Intensité">
                        <ResponsiveSlider
                            value={formData.intensiteEffets || 0}
                            onChange={(val) => handleChange('intensiteEffets', val)}
                            min={0}
                            max={10}
                            step={1}
                            showValue={true}
                            unit="/10"
                        />
                    </MobileFormGroup>
                </div>

                {/* Filtre */}
                {!isMobile && (
                    <div className="flex gap-2 mb-2">
                        {['tous', 'positif', 'negatif'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setFilterMode(mode)}
                                className={`px-2 py-1 text-xs rounded-lg transition ${filterMode === mode
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                {mode === 'tous' ? 'Tous' : mode === 'positif' ? 'Positifs' : 'Négatifs'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Compteur */}
                <div className="text-xs font-semibold text-slate-300">
                    Sélectionnés: <span className="text-purple-400">{selectedEffects.length}/8</span>
                </div>

                {/* Catégories */}
                {Object.entries(EFFECT_CATEGORIES).map(([catKey, category]) => (
                    <div key={catKey}>
                        <button
                            onClick={() => toggleCategory(catKey)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition ${expandedCategories[catKey]
                                ? 'bg-slate-700/70 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <span className={`text-sm font-semibold flex items-center gap-2`}>
                                <span>{category.icon}</span>
                                {category.label}
                            </span>
                            <motion.div
                                animate={{ rotate: expandedCategories[catKey] ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={16} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {expandedCategories[catKey] && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`
                                        grid ${isMobile ? 'grid-cols-2 gap-1.5' : gridClasses.triple} gap-2
                                        mt-2 p-2 bg-slate-800/30 rounded-lg
                                    `}
                                >
                                    {category.effects
                                        .filter(shouldShowEffect)
                                        .map(effect => (
                                            <motion.button
                                                key={effect}
                                                onClick={() => toggleEffect(effect)}
                                                disabled={!selectedEffects.includes(effect) && selectedEffects.length >= 8}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`
                                                px-2 py-1.5 rounded-lg text-xs font-medium transition-all
                                                ${selectedEffects.includes(effect)
                                                        ? `bg-${category.color}-600 text-white ring-2 ring-${category.color}-400`
                                                        : `bg-slate-700 text-slate-300 hover:bg-slate-600`
                                                    }
                                                ${!selectedEffects.includes(effect) && selectedEffects.length >= 8
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : ''
                                                    }
                                            `}
                                            >
                                                {selectedEffects.includes(effect) && '✓ '}
                                                {effect}
                                            </motion.button>
                                        ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </CollapsibleMobileSection>
    );
}
