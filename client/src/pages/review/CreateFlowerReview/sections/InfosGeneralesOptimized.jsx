import React, { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { CollapsibleMobileSection, MobileFormGroup } from '../../../../components/forms/helpers/MobileReviewLayout';
import { ResponsiveInput } from '../../../../components/forms/helpers/ResponsiveSectionComponents';
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout';
import { useMobileFormSection } from '../../../hooks/useMobileFormSection';
import MultiSelectPills from '../../../../components/shared/ui-helpers/MultiSelectPills';

/**
 * InfosGeneralesOptimized - Optimisée mobile
 */

const PHOTO_TAGS = ['Macro', 'Full plant', 'Bud sec', 'Trichomes', 'Drying', 'Curing'];

export default function InfosGeneralesOptimized({
    formData,
    handleChange,
    photos,
    handlePhotoUpload,
    removePhoto
}) {
    const { isMobile } = useResponsiveLayout();
    const { spacing } = useMobileFormSection('infos');
    const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(null);

    const togglePhotoTag = (photoIndex, tag) => {
        const updatedPhotos = photos.map((photo, idx) => {
            if (idx === photoIndex) {
                const currentTags = photo.tags || [];
                const newTags = currentTags.includes(tag)
                    ? currentTags.filter(t => t !== tag)
                    : [...currentTags, tag];
                return { ...photo, tags: newTags };
            }
            return photo;
        });
        handleChange('photos', updatedPhotos);
    };

    return (
        <CollapsibleMobileSection
            title="Informations générales"
            icon="📋"
            defaultOpen={true}
            forceOpen={true}
        >
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
                {/* Nom commercial */}
                <MobileFormGroup
                    label="Nom commercial"
                    required
                    hint="Seul champ texte libre obligatoire"
                >
                    <ResponsiveInput
                        type="text"
                        value={formData.nomCommercial || ''}
                        onChange={(e) => handleChange('nomCommercial', e.target.value)}
                        placeholder="Ex: Marque – Cultivar – Batch #"
                        maxLength={100}
                    />
                </MobileFormGroup>

                {/* Cultivar(s) */}
                <MobileFormGroup
                    label="Cultivar(s)"
                    hint="Multi-sélection depuis bibliothèque"
                >
                    <MultiSelectPills
                        value={formData.cultivars || []}
                        onChange={(cultivars) => handleChange('cultivars', cultivars)}
                        source="user-library"
                        placeholder="Sélectionner cultivars"
                    />
                </MobileFormGroup>

                {/* Farm */}
                <MobileFormGroup
                    label="Farm"
                    hint="Producteur ou lieu de culture"
                >
                    <ResponsiveInput
                        type="text"
                        value={formData.farm || ''}
                        onChange={(e) => handleChange('farm', e.target.value)}
                        placeholder="Farm name"
                        maxLength={50}
                    />
                </MobileFormGroup>

                {/* Photos - Galerie optimisée mobile */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                            Photos
                        </label>
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-purple-400`}>
                            {photos?.length || 0}/4
                        </span>
                    </div>

                    {/* Upload button */}
                    {(!photos || photos.length < 4) && (
                        <div className="mb-3">
                            <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-purple-500/50 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition">
                                <Camera size={16} className="text-purple-400" />
                                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-purple-400`}>
                                    Ajouter photo
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    multiple={false}
                                />
                            </label>
                        </div>
                    )}

                    {/* Photos grid */}
                    {photos && photos.length > 0 && (
                        <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
                            {photos.map((photo, idx) => (
                                <motion.div
                                    key={idx}
                                    layoutId={`photo-${idx}`}
                                    className="relative group"
                                >
                                    <img
                                        src={photo.src || photo.data || ''}
                                        alt={`Photo ${idx + 1}`}
                                        className="w-full aspect-square object-cover rounded-lg border border-slate-700/50"
                                    />

                                    {/* Delete button */}
                                    <button
                                        onClick={() => removePhoto(idx)}
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X size={14} />
                                    </button>

                                    {/* Tags selection */}
                                    <motion.button
                                        onClick={() => setSelectedPhotoIdx(selectedPhotoIdx === idx ? null : idx)}
                                        className={`w-full text-left px-2 py-1 mt-1 rounded-lg text-xs font-medium transition ${selectedPhotoIdx === idx
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        Tags ({(photo.tags || []).length})
                                    </motion.button>

                                    {/* Tags list */}
                                    {selectedPhotoIdx === idx && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`
                                                grid ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-2 gap-2'} mt-2
                                            `}
                                        >
                                            {PHOTO_TAGS.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => togglePhotoTag(idx, tag)}
                                                    className={`px-2 py-1 rounded text-[10px] font-medium transition ${(photo.tags || []).includes(tag)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    {(photo.tags || []).includes(tag) && '✓ '}
                                                    {tag}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {(!photos || photos.length === 0) && (
                        <p className="text-xs text-slate-400 italic">Aucune photo pour l'instant</p>
                    )}
                </div>
            </div>
        </CollapsibleMobileSection>
    );
}
