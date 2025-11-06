import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ToastContainer';
import WheelSelector from '../components/WheelSelector';
import EffectSelector from '../components/EffectSelector';
import CultivarList from '../components/CultivarList';
import PipelineWithCultivars from '../components/PipelineWithCultivars';
import GlobalRating from '../components/GlobalRating';
import { productStructures } from '../utils/productStructures';
import { parseImages } from '../utils/imageUtils';

export default function EditReviewPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isAuthenticated, user } = useStore();
    const toast = useToast();

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [structure, setStructure] = useState(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [formData, setFormData] = useState({});
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [hasSolvents, setHasSolvents] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        fetchReview();
    }, [id, isAuthenticated]);

    const fetchReview = async () => {
        try {
            const response = await fetch(`/api/reviews/${id}`);
            if (!response.ok) throw new Error('Review non trouvée');

            const data = await response.json();

            // Vérifier ownership
            if (data.authorId !== user?.id) {
                toast.error('Vous ne pouvez pas éditer cette review');
                navigate('/');
                return;
            }

            setReview(data);

            // Parse JSON fields
            const parsedData = {
                ...data,
                categoryRatings: data.categoryRatings ? JSON.parse(data.categoryRatings) : null,
                aromas: data.aromas ? JSON.parse(data.aromas) : [],
                tastes: data.tastes ? JSON.parse(data.tastes) : [],
                effects: data.effects ? JSON.parse(data.effects) : [],
                cultivarsList: data.cultivarsList ? JSON.parse(data.cultivarsList) : [],
                pipelineExtraction: data.pipelineExtraction ? JSON.parse(data.pipelineExtraction) : null,
                pipelineSeparation: data.pipelineSeparation ? JSON.parse(data.pipelineSeparation) : null,
            };

            setFormData(parsedData);
            setExistingImages(parseImages(data.images));

            const prodStructure = productStructures[data.type] || productStructures.Fleur;
            setStructure(prodStructure);

            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement review:', error);
            toast.error('Erreur lors du chargement de la review');
            navigate('/');
        }
    };

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    const sections = structure?.sections || [];
    const currentSection = sections[currentSectionIndex];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + images.length + files.length;

        if (totalImages > 10) {
            toast.warning('Maximum 10 images au total');
            return;
        }

        setImages(prev => [...prev, ...files]);
        toast.success(`${files.length} image(s) ajoutée(s)`);
    };

    const removeImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const removeExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
        toast.info('Image supprimée (changement enregistré lors de la sauvegarde)');
    };

    const nextSection = () => {
        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToSection = (index) => {
        setCurrentSectionIndex(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.holderName || !formData.holderName.trim()) {
            toast.error('Le nom commercial est requis');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Mise à jour en cours...');

        try {
            const submitData = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== null && value !== undefined) {
                    if (typeof value === 'object') {
                        submitData.append(key, JSON.stringify(value));
                    } else {
                        submitData.append(key, value);
                    }
                }
            });

            // Add new images
            images.forEach(img => submitData.append('images', img));

            // Add existing images to keep
            submitData.append('existingImages', JSON.stringify(existingImages));

            const response = await fetch(`/api/reviews/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: submitData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour');
            }

            toast.remove(loadingToast);
            toast.success('Review mise à jour avec succès ! ✅');

            setTimeout(() => navigate(`/review/${id}`), 1000);
        } catch (err) {
            console.error('Erreur:', err);
            toast.remove(loadingToast);
            toast.error(err.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field) => {
        const value = formData[field.key] || (field.type === 'slider' ? (field.default || 0) : '');

        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        placeholder={`Ex: ${field.label}`}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                        required={field.required}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        rows={field.rows || 3}
                        placeholder={field.label}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        min="0"
                        max={field.max || 100}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                    />
                );

            case 'slider':
                return (
                    <div>
                        <input
                            type="range"
                            min="0"
                            max={field.max || 10}
                            step="0.5"
                            value={value}
                            onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">0</span>
                            <span className="text-2xl font-bold text-green-400">{value}/{field.max || 10}</span>
                            <span className="text-xs text-gray-500">{field.max || 10}</span>
                        </div>
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                    >
                        <option value="">-- Sélectionner --</option>
                        {field.choices?.map((choice, i) => (
                            <option key={i} value={choice}>{choice}</option>
                        ))}
                    </select>
                );

            case 'multiselect':
                const selected = Array.isArray(value) ? value : [];
                return (
                    <div className="flex flex-wrap gap-2">
                        {field.choices?.map((choice, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => {
                                    const newVal = selected.includes(choice)
                                        ? selected.filter(v => v !== choice)
                                        : [...selected, choice];
                                    handleInputChange(field.key, newVal);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selected.includes(choice)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {choice}
                            </button>
                        ))}
                    </div>
                );

            case 'checkbox':
                if (field.key === 'purgevide' && !hasSolvents) return null;
                return (
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleInputChange(field.key, e.target.checked)}
                            className="w-5 h-5 rounded border-gray-700 bg-gray-900/50 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-300">{field.label}</span>
                    </label>
                );

            case 'wheel':
                return (
                    <WheelSelector
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        type={field.key}
                        maxSelections={5}
                    />
                );

            case 'effects':
                return (
                    <EffectSelector
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        maxSelections={8}
                    />
                );

            case 'cultivar-list':
                return (
                    <CultivarList
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        matiereChoices={field.matiereChoices || []}
                        showBreeder={field.showBreeder}
                    />
                );

            case 'pipeline-with-cultivars':
                const cultivarsListData = formData[field.cultivarsSource] || [];
                return (
                    <PipelineWithCultivars
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        choices={field.choices || []}
                        cultivarsList={cultivarsListData}
                        onSolventDetected={setHasSolvents}
                    />
                );

            case 'images':
                return (
                    <div className="space-y-4">
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-400 mb-2">Images existantes ({existingImages.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {existingImages.map((imgUrl, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img
                                                src={imgUrl}
                                                alt={`Image ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-green-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(idx)}
                                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images */}
                        {images.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-400 mb-2">Nouvelles images ({images.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`Nouvelle ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-amber-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                            >
                                                ×
                                            </button>
                                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-amber-600 text-white text-xs rounded-full">
                                                Nouveau
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Images Button */}
                        {(existingImages.length + images.length) < 10 && (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="imageUpload"
                                />
                                <label
                                    htmlFor="imageUpload"
                                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition-colors text-gray-400 hover:text-gray-300"
                                >
                                    <span className="text-2xl">+</span>
                                    <span>Ajouter des images ({existingImages.length + images.length}/10)</span>
                                </label>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    // Calculer les notes par catégorie
    const calculateCategoryRatings = () => {
        const categoryFieldMap = {
            visual: ['densite', 'trichomes', 'malleabilite', 'transparence'],
            smell: [],
            taste: [],
            effects: []
        };

        const ratings = {};
        Object.keys(categoryFieldMap).forEach(category => {
            const fields = categoryFieldMap[category];
            const validValues = fields
                .map(fieldKey => formData[fieldKey])
                .filter(v => v !== undefined && v !== null && v !== '' && !isNaN(v))
                .map(v => parseFloat(v));

            if (validValues.length > 0) {
                const average = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
                ratings[category] = Math.round(average * 2) / 2;
            } else {
                ratings[category] = 0;
            }
        });

        const categoryValues = Object.values(ratings).filter(v => v > 0);
        const overallRating = categoryValues.length > 0
            ? Math.round((categoryValues.reduce((sum, v) => sum + v, 0) / categoryValues.length) * 2) / 2
            : 0;

        return { ...ratings, overall: overallRating };
    };

    const categoryRatings = calculateCategoryRatings();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => navigate(`/review/${id}`)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Annuler
                        </button>
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-white">
                                ✏️ Éditer: {formData.holderName}
                            </h1>
                            <p className="text-xs text-gray-400">
                                Section {currentSectionIndex + 1}/{sections.length}
                            </p>
                        </div>
                        <div className="w-16"></div>
                    </div>
                    {/* Résumé des notes par catégorie */}
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="text-gray-400">👁️</span>
                            <span className="font-bold text-green-400">{categoryRatings.visual.toFixed(1)}</span>
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-gray-400">👃</span>
                            <span className="font-bold text-green-400">{categoryRatings.smell.toFixed(1)}</span>
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-gray-400">👅</span>
                            <span className="font-bold text-green-400">{categoryRatings.taste.toFixed(1)}</span>
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-gray-400">⚡</span>
                            <span className="font-bold text-green-400">{categoryRatings.effects.toFixed(1)}</span>
                        </span>
                        <span className="text-gray-600">│</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-semibold">Global</span>
                            <span className="font-bold text-2xl text-green-400">{categoryRatings.overall.toFixed(1)}</span>
                            <span className="text-gray-500 text-xs">/10</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Section Navigation */}
            <div className="sticky top-[88px] z-40 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 overflow-x-auto">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex gap-2 py-3">
                        {sections.map((section, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSection(idx)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${idx === currentSectionIndex
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                                    }`}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="max-w-4xl mx-auto px-4 mt-4">
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                        {error}
                    </div>
                </div>
            )}

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {currentSection?.title}
                    </h2>
                    <div className="space-y-6">
                        {currentSection?.fields.map((field, idx) => (
                            <div key={idx} className="space-y-2">
                                {field.type !== 'checkbox' && field.type !== 'images' && (
                                    <label className="block text-sm font-semibold text-gray-300">
                                        {field.label}
                                        {field.required && <span className="text-red-400 ml-1">*</span>}
                                        {field.max && field.type === 'slider' && (
                                            <span className="text-gray-500 ml-1">/10</span>
                                        )}
                                    </label>
                                )}
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 py-4 z-50">
                <div className="max-w-4xl mx-auto px-4 flex gap-4">
                    <button
                        type="button"
                        onClick={prevSection}
                        disabled={currentSectionIndex === 0}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ← Précédent
                    </button>
                    {currentSectionIndex === sections.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? '⏳ Mise à jour...' : '💾 Sauvegarder les modifications'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={nextSection}
                            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold shadow-lg transition-all"
                        >
                            Suivant →
                        </button>
                    )}
                </div>
            </div>

            <div className="h-24"></div>
        </div>
    );
}
