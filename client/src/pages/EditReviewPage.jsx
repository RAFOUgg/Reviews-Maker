import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ToastContainer';
import WheelSelector from '../components/WheelSelector';
import EffectSelector from '../components/EffectSelector';
import CultivarList from '../components/CultivarList';
import PipelineWithCultivars from '../components/PipelineWithCultivars';
import PurificationPipeline from '../components/PurificationPipeline';
import FertilizationPipeline from '../components/FertilizationPipeline';
import SubstratMixer from '../components/SubstratMixer';
import RecipeSection from '../components/RecipeSection';
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

    const fetchReview = async () => {
        try {
            const response = await fetch(`/api/reviews/${id}`);
            if (!response.ok) throw new Error('Review non trouvée');

            const data = await response.json();

            // Debug logs
            console.log('🔍 DEBUG - Review data:', data);
            console.log('🔍 DEBUG - data.authorId:', data.authorId);
            console.log('🔍 DEBUG - user:', user);
            console.log('🔍 DEBUG - user.id:', user?.id);

            // Vérifier ownership
            if (data.authorId !== user?.id) {
                console.error('❌ Ownership check failed:', {
                    reviewAuthorId: data.authorId,
                    userId: user?.id,
                    match: data.authorId === user?.id
                });
                toast.error('Vous ne pouvez pas éditer cette review');
                navigate('/');
                return;
            }

            console.log('✅ Ownership check passed');

            setReview(data);

            // Parse JSON fields (seulement si ce sont des strings, sinon l'API les a déjà parsés)
            const safeParseJSON = (value, defaultValue) => {
                if (!value) return defaultValue;
                if (typeof value === 'string') {
                    try {
                        return JSON.parse(value);
                    } catch (e) {
                        console.error('JSON parse error:', e);
                        return defaultValue;
                    }
                }
                return value; // Déjà un objet
            };

            const parsedData = {
                ...data,
                categoryRatings: safeParseJSON(data.categoryRatings, null),
                aromas: safeParseJSON(data.aromas, []),
                tastes: safeParseJSON(data.tastes, []),
                effects: safeParseJSON(data.effects, []),
                cultivarsList: safeParseJSON(data.cultivarsList, []),
                pipelineExtraction: safeParseJSON(data.pipelineExtraction, null),
                pipelineSeparation: safeParseJSON(data.pipelineSeparation, null),
            };

            console.log('✅ Parsed data:', parsedData);

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

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        fetchReview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isAuthenticated]);

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-accent))] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-[rgb(var(--text-secondary))] opacity-80">Chargement...</p>
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
        // Valeur par défaut en fonction du type
        const getDefaultValue = () => {
            if (formData[field.key] !== undefined) return formData[field.key];
            if (field.type === 'slider') return field.default || 0;
            if (['wheel', 'effects', 'cultivar-list', 'pipeline-with-cultivars', 'purification-pipeline', 'fertilization-pipeline', 'substrat-mixer', 'multiselect'].includes(field.type)) return [];
            if (field.type === 'recipe') return {};
            return '';
        };
        const value = getDefaultValue();

        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        placeholder={`Ex: ${field.label}`}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-4 py-3 bg-[rgba(var(--color-primary),0.1)] border border-[rgba(var(--color-primary),0.3)] rounded-xl text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-secondary))] placeholder:opacity-60 focus:outline-none focus:border-[rgb(var(--color-accent))] focus:shadow-[0_0_15px_rgba(var(--color-accent),0.3)]"
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
                        className="w-full px-4 py-3 bg-[rgba(var(--color-primary),0.1)] border border-[rgba(var(--color-primary),0.3)] rounded-xl text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-secondary))] placeholder:opacity-60 focus:outline-none focus:border-[rgb(var(--color-accent))] focus:shadow-[0_0_15px_rgba(var(--color-accent),0.3)] resize-none"
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
                        className="w-full px-4 py-3 bg-[rgba(var(--color-primary),0.1)] border border-[rgba(var(--color-primary),0.3)] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:border-[rgb(var(--color-accent))] focus:shadow-[0_0_15px_rgba(var(--color-accent),0.3)]"
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
                            className="w-full h-2 bg-[rgba(var(--color-primary),0.2)] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--color-accent))]"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-[rgb(var(--text-secondary))] opacity-70">0</span>
                            <span className="text-2xl font-bold text-[rgb(var(--color-accent))]">{value}/{field.max || 10}</span>
                            <span className="text-xs text-[rgb(var(--text-secondary))] opacity-70">{field.max || 10}</span>
                        </div>
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full px-4 py-3 bg-[rgba(var(--color-primary),0.1)] border border-[rgba(var(--color-primary),0.3)] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:border-[rgb(var(--color-accent))] focus:shadow-[0_0_15px_rgba(var(--color-accent),0.3)]"
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
                                    ? 'bg-[rgb(var(--color-accent))] text-white shadow-[0_0_15px_rgba(var(--color-accent),0.4)]'
                                    : 'bg-[rgba(var(--color-primary),0.2)] text-[rgb(var(--text-primary))] hover:bg-[rgba(var(--color-primary),0.3)]'
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
                            className="w-5 h-5 rounded border-[rgba(var(--color-primary),0.3)] bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-accent))] focus:ring-[rgb(var(--color-accent))]"
                        />
                        <span className="text-[rgb(var(--text-primary))]">{field.label}</span>
                    </label>
                );

            case 'wheel':
                return (
                    <WheelSelector
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        type={field.key}
                        maxSelections={field.maxSelections || 5}
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

            case 'purification-pipeline':
                const extractionPipelineData = formData[field.extractionSource] || formData['pipelineSeparation'] || formData['pipelineExtraction'] || [];
                return (
                    <PurificationPipeline
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        availableMethods={field.availableMethods || []}
                        extractionPipeline={extractionPipelineData}
                    />
                );

            case 'fertilization-pipeline':
                return (
                    <FertilizationPipeline
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        availableFertilizers={field.availableFertilizers || []}
                    />
                );

            case 'substrat-mixer':
                return (
                    <SubstratMixer
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                        availableSubstrats={field.availableSubstrats || []}
                    />
                );

            case 'recipe':
                return (
                    <RecipeSection
                        value={value}
                        onChange={(v) => handleInputChange(field.key, v)}
                    />
                );

            case 'images':
                return (
                    <div className="space-y-4">
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div>
                                <p className="text-sm text-[rgb(var(--text-secondary))] opacity-80 mb-2">Images existantes ({existingImages.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {existingImages.map((imgUrl, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img
                                                src={imgUrl}
                                                alt={`Image ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-[rgba(var(--color-primary),0.5)]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(idx)}
                                                className="absolute top-2 right-2 bg-[rgba(var(--color-danger),0.9)] hover:bg-[rgb(var(--color-danger))] text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
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
                                <p className="text-sm text-[rgb(var(--text-secondary))] opacity-80 mb-2">Nouvelles images ({images.length})</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt={`Nouvelle ${idx + 1}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-[rgba(var(--color-accent),0.5)]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 bg-[rgba(var(--color-danger),0.9)] hover:bg-[rgb(var(--color-danger))] text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                            >
                                                ×
                                            </button>
                                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-[rgba(var(--color-accent),0.9)] text-white text-xs rounded-full">
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
                                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[rgba(var(--color-primary),0.3)] rounded-xl cursor-pointer hover:border-[rgb(var(--color-accent))] transition-colors text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
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
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[rgba(var(--color-primary),0.95)] backdrop-blur-xl border-b border-[rgba(var(--color-primary),0.3)]">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => navigate(`/review/${id}`)}
                            className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                        >
                            ← Annuler
                        </button>
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                ✏️ Éditer: {formData.holderName}
                            </h1>
                            <p className="text-xs text-[rgb(var(--text-secondary))] opacity-80">
                                Section {currentSectionIndex + 1}/{sections.length}
                            </p>
                        </div>
                        <div className="w-16"></div>
                    </div>
                    {/* Résumé des notes par catégorie */}
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5">
                            <span className="text-[rgb(var(--text-secondary))]">👁️</span>
                            <span className="font-bold text-[rgb(var(--color-accent))]">{categoryRatings.visual.toFixed(1)}</span>
                        </span>
                        <span className="text-[rgb(var(--text-secondary))] opacity-50">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-[rgb(var(--text-secondary))]">👃</span>
                            <span className="font-bold text-[rgb(var(--color-accent))]">{categoryRatings.smell.toFixed(1)}</span>
                        </span>
                        <span className="text-[rgb(var(--text-secondary))] opacity-50">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-[rgb(var(--text-secondary))]">👅</span>
                            <span className="font-bold text-[rgb(var(--color-accent))]">{categoryRatings.taste.toFixed(1)}</span>
                        </span>
                        <span className="text-[rgb(var(--text-secondary))] opacity-50">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-[rgb(var(--text-secondary))]">⚡</span>
                            <span className="font-bold text-[rgb(var(--color-accent))]">{categoryRatings.effects.toFixed(1)}</span>
                        </span>
                        <span className="text-[rgb(var(--text-secondary))] opacity-50">│</span>
                        <span className="flex items-center gap-1.5">
                            <span className="text-[rgb(var(--text-secondary))] font-semibold">Global</span>
                            <span className="font-bold text-2xl text-[rgb(var(--color-accent))]">{categoryRatings.overall.toFixed(1)}</span>
                            <span className="text-[rgb(var(--text-secondary))] opacity-70 text-xs">/10</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Section Navigation */}
            <div className="sticky top-[88px] z-40 bg-[rgba(var(--color-primary),0.9)] backdrop-blur-xl border-b border-[rgba(var(--color-primary),0.3)] overflow-x-auto">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex gap-2 py-3">
                        {sections.map((section, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToSection(idx)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${idx === currentSectionIndex
                                    ? 'bg-[rgb(var(--color-accent))] text-white shadow-[0_0_20px_rgba(var(--color-accent),0.5)]'
                                    : 'bg-[rgba(var(--color-primary),0.2)] text-[rgb(var(--text-secondary))] hover:bg-[rgba(var(--color-primary),0.3)] hover:text-[rgb(var(--text-primary))]'
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
                    <div className="p-4 bg-[rgba(var(--color-danger),0.1)] border border-[rgba(var(--color-danger),0.3)] rounded-xl text-[rgb(var(--color-danger))]">
                        {error}
                    </div>
                </div>
            )}

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div className="bg-[rgba(var(--color-primary),0.1)] backdrop-blur-xl rounded-2xl p-8 border border-[rgba(var(--color-primary),0.3)]">
                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-6">
                        {currentSection?.title}
                    </h2>
                    <div className="space-y-6">
                        {currentSection?.fields.map((field, idx) => (
                            <div key={idx} className="space-y-2">
                                {field.type !== 'checkbox' && field.type !== 'images' && (
                                    <label className="block text-sm font-semibold text-[rgb(var(--text-primary))]">
                                        {field.label}
                                        {field.required && <span className="text-[rgb(var(--color-danger))] ml-1">*</span>}
                                        {field.max && field.type === 'slider' && (
                                            <span className="text-[rgb(var(--text-secondary))] opacity-70 ml-1">/10</span>
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
            <div className="fixed bottom-0 left-0 right-0 bg-[rgba(var(--color-primary),0.95)] backdrop-blur-xl border-t border-[rgba(var(--color-primary),0.3)] py-4 z-50">
                <div className="max-w-4xl mx-auto px-4 flex gap-4">
                    <button
                        type="button"
                        onClick={prevSection}
                        disabled={currentSectionIndex === 0}
                        className="px-6 py-3 bg-[rgba(var(--color-primary),0.3)] hover:bg-[rgba(var(--color-primary),0.5)] text-[rgb(var(--text-primary))] rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ← Précédent
                    </button>
                    {currentSectionIndex === sections.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgba(var(--color-accent),0.8)] hover:shadow-[0_0_30px_rgba(var(--color-accent),0.6)] text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? '⏳ Mise à jour...' : '💾 Sauvegarder les modifications'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={nextSection}
                            className="flex-1 py-3 bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgba(var(--color-accent),0.8)] hover:shadow-[0_0_30px_rgba(var(--color-accent),0.6)] text-white rounded-xl font-bold shadow-lg transition-all"
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
