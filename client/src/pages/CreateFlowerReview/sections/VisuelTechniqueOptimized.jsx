import React, { useState } from 'react';
import { CollapsibleMobileSection, MobileFormGroup } from '../../../components/layout/MobileReviewLayout';
import { ResponsiveSlider } from '../../../components/ui/ResponsiveSectionComponents';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { useMobileFormSection } from '../../../hooks/useMobileFormSection';
import ColorWheelPicker from '../../../components/ui/ColorWheelPicker';

/**
 * VisuelTechniqueSection - Optimisée pour mobile et desktop
 * 
 * Mobile:
 * - Color wheel en pleine largeur d'abord
 * - Sliders empilés verticalement
 * - Compact et scrollable
 * 
 * Desktop:
 * - Layout 2 colonnes
 */

const VISUAL_FIELDS = [
    { key: 'densite', label: 'Densité visuelle', max: 10 },
    { key: 'trichomes', label: 'Trichomes', max: 10 },
    { key: 'pistils', label: 'Pistils', max: 10 },
    { key: 'manucure', label: 'Manucure', max: 10 },
    { key: 'moisissure', label: 'Moisissure (10=aucune)', max: 10 },
    { key: 'graines', label: 'Graines (10=aucune)', max: 10 }
];

export default function VisuelTechniqueOptimized({ formData, handleChange }) {
    const { isMobile, isTablet } = useResponsiveLayout();
    const { spacing } = useMobileFormSection('visuel');
    const [showColorPicker, setShowColorPicker] = useState(!isMobile);

    const handleColorChange = (colors) => {
        handleChange('selectedColors', colors);
    };

    return (
        <CollapsibleMobileSection
            title="Visuel & Technique"
            icon="👁️"
            defaultOpen={!isMobile}
        >
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
                {/* Color Wheel - Toggleable sur mobile */}
                <div>
                    {isMobile ? (
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-full px-3 py-2 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition mb-2"
                        >
                            {showColorPicker ? '▼' : '▶'} Sélection colorimétrique
                        </button>
                    ) : (
                        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                            <span className="text-lg">🎨</span>
                            Sélection colorimétrique
                        </h4>
                    )}

                    {showColorPicker && (
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-3">
                            <ColorWheelPicker
                                value={formData.selectedColors || []}
                                onChange={handleColorChange}
                                maxSelections={5}
                            />
                        </div>
                    )}
                </div>

                {/* Sliders - Compact sur mobile */}
                <div className={`space-y-${isMobile ? '2' : '3'}`}>
                    {VISUAL_FIELDS.map(field => (
                        <MobileFormGroup
                            key={field.key}
                            label={field.label}
                        >
                            <ResponsiveSlider
                                value={formData[field.key] || 0}
                                onChange={(val) => handleChange(field.key, val)}
                                min={0}
                                max={field.max}
                                step={1}
                                showValue={true}
                                unit={`/${field.max}`}
                            />
                        </MobileFormGroup>
                    ))}
                </div>

                {/* Densité totale - Summary */}
                {!isMobile && (
                    <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 text-xs text-slate-300">
                        <p className="font-semibold mb-2">Score global Visuel & Technique:</p>
                        <p>
                            {(formData.densite || 0) > 7 && '✓ Très bien'}
                            {(formData.densite || 0) > 5 && (formData.densite || 0) <= 7 && '• Bien'}
                            {(formData.densite || 0) <= 5 && '△ À améliorer'}
                        </p>
                    </div>
                )}
            </div>
        </CollapsibleMobileSection>
    );
}
