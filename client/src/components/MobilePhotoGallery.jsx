import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * MobilePhotoGallery - Galerie de photos optimisée mobile
 * 
 * Caractéristiques:
 * - Carousel horizontal swipeable
 * - Indicateurs de pagination
 * - Upload fullscreen sur mobile
 * - Tagging photos
 * - Suppression facile
 */

export const MobilePhotoGallery = ({
    photos = [],
    onAddPhoto,
    onRemovePhoto,
    onTagPhoto,
    maxPhotos = 4,
    tags = []
}) => {
    const layout = useResponsiveLayout();
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

    const hasMoreSpace = photos.length < maxPhotos;
    const currentPhoto = photos[carouselIndex];

    const handleNextPhoto = () => {
        if (carouselIndex < photos.length - 1) {
            setCarouselIndex(carouselIndex + 1);
        }
    };

    const handlePrevPhoto = () => {
        if (carouselIndex > 0) {
            setCarouselIndex(carouselIndex - 1);
        }
    };

    const handlePhotoUpload = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                onAddPhoto(file);
            });
        }
        setShowUploadModal(false);
    };

    return (
        <div className="w-full">
            {/* Galerie principal - Mode Carousel Mobile */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                {photos.length > 0 ? (
                    <>
                        {/* Carousel */}
                        <div className="relative aspect-square md:aspect-video overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={carouselIndex}
                                    src={photos[carouselIndex].url || URL.createObjectURL(photos[carouselIndex].file)}
                                    alt={`Photo ${carouselIndex + 1}`}
                                    className="w-full h-full object-cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </AnimatePresence>

                            {/* Navigation buttons (desktop only) */}
                            {!layout.isMobile && photos.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevPhoto}
                                        disabled={carouselIndex === 0}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-white" />
                                    </button>
                                    <button
                                        onClick={handleNextPhoto}
                                        disabled={carouselIndex === photos.length - 1}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition disabled:opacity-50"
                                    >
                                        <ChevronRight className="w-5 h-5 text-white" />
                                    </button>
                                </>
                            )}

                            {/* Pagination dots */}
                            {photos.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {photos.map((_, idx) => (
                                        <motion.button
                                            key={idx}
                                            onClick={() => setCarouselIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === carouselIndex
                                                    ? 'bg-white w-6'
                                                    : 'bg-white/50 hover:bg-white/75'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info photo et tags */}
                        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
                            <div className="flex items-center justify-between">
                                <span className="text-white text-sm font-medium">
                                    Photo {carouselIndex + 1}/{photos.length}
                                </span>
                                <button
                                    onClick={() => onRemovePhoto(carouselIndex)}
                                    className="p-1.5 hover:bg-red-500/20 rounded transition"
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                            </div>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap mt-3">
                                    {tags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => onTagPhoto(carouselIndex, tag)}
                                            className={`px-2 py-1 text-xs rounded-lg transition ${photos[carouselIndex].tags?.includes(tag)
                                                    ? 'bg-purple-500/80 text-white'
                                                    : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // État vide
                    <div className="aspect-square md:aspect-video flex flex-col items-center justify-center gap-3">
                        <Camera className="w-12 h-12 text-gray-500" />
                        <p className="text-gray-400 text-center">Aucune photo</p>
                    </div>
                )}
            </div>

            {/* Thumbnail strip + Upload (mobile) */}
            <div className="mt-3 flex gap-2 items-center overflow-x-auto pb-2">
                {/* Thumbnails */}
                {photos.map((photo, idx) => (
                    <motion.button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition ${idx === carouselIndex
                                ? 'border-purple-500'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                        whileHover={{ scale: 1.05 }}
                    >
                        <img
                            src={photo.url || URL.createObjectURL(photo.file)}
                            alt={`Thumb ${idx}`}
                            className="w-full h-full object-cover"
                        />
                    </motion.button>
                ))}

                {/* Bouton upload */}
                {hasMoreSpace && (
                    <motion.button
                        onClick={() => setShowUploadModal(true)}
                        className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 border-dashed border-gray-600 hover:border-purple-500 flex items-center justify-center hover:bg-purple-500/10 transition"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Plus className="w-5 h-5 text-gray-400" />
                    </motion.button>
                )}
            </div>

            {/* Info texte */}
            <div className="mt-2 text-xs text-gray-400">
                {photos.length}/{maxPhotos} photos • {maxPhotos - photos.length} restante(s)
            </div>

            {/* Upload Modal - Mobile Fullscreen */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        className="fixed inset-0 z-50 md:z-auto flex flex-col items-center justify-center gap-4 p-4 md:rounded-lg md:bg-transparent bg-black/90"
                    >
                        <div className="text-white text-center">
                            <h3 className="text-lg font-bold mb-2">Ajouter des photos</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Jusquà {maxPhotos - photos.length} photo(s) supplémentaires
                            </p>
                        </div>

                        <label className="w-full cursor-pointer">
                            <div className="p-6 border-2 border-dashed border-purple-500 rounded-lg hover:bg-purple-500/10 transition">
                                <div className="flex flex-col items-center gap-2">
                                    <Camera className="w-8 h-8 text-purple-400" />
                                    <span className="text-white font-medium">Cliquez pour sélectionner</span>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    disabled={!hasMoreSpace}
                                />
                            </div>
                        </label>

                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                        >
                            Fermer
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Import lucide-react pour le + manquant
const Plus = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export default MobilePhotoGallery;


