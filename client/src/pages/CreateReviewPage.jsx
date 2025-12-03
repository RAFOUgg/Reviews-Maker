import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import SectionNavigator from '../components/SectionNavigator';
import CategoryRatingSummary from '../components/CategoryRatingSummary';
import OrchardPanel from '../components/orchard/OrchardPanel';
import { AnimatePresence } from 'framer-motion';
import { productStructures } from '../utils/productStructures';
import { calculateCategoryRatings as calcCategoryRatings, CATEGORY_DISPLAY_ORDER } from '../utils/categoryMappings';

export default function CreateReviewPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, createReview, updateReview, getReviewById, user } = useStore();
    const toast = useToast();

    const typeFromUrl = searchParams.get('type') || 'Fleur';
    const editId = searchParams.get('id');
    const isEditing = !!editId;
    const [structure, setStructure] = useState(productStructures[typeFromUrl] || productStructures.Fleur);
    // Keep structure in sync if the type param in URL changes
    useEffect(() => {
        setStructure(productStructures[typeFromUrl] || productStructures.Fleur);
    }, [typeFromUrl]);
    const sections = structure.sections;

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const currentSection = sections[currentSectionIndex];

    // Fonction pour initialiser formData avec les valeurs par défaut des sliders
    const initializeFormData = (baseData = {}) => {
        const initialized = { ...baseData };
        // Parcourir toutes les sections pour trouver les sliders et les initialiser à 0 si non définis/nulles
        sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.type === 'slider' && (initialized[field.key] === undefined || initialized[field.key] === null || initialized[field.key] === '')) {
                    initialized[field.key] = field.default || 0;
                }
            });
        });
        return initialized;
    };

    const [formData, setFormData] = useState(() => initializeFormData({ type: typeFromUrl, holderName: '', overallRating: 5 }));
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [hasSolvents, setHasSolvents] = useState(false);
    const [showOrchardStudio, setShowOrchardStudio] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveModalData, setSaveModalData] = useState({ title: '', isPublic: false });

    // Fonction pour obtenir l'URL d'une image (pour preview)
    // Pour éviter d'appeler createObjectURL à chaque rendu, on met en cache
    const getImageUrl = (img) => {
        if (!img) return undefined;
        if (img.existing) return img.url;
        if (img.preview) return img.preview;
        if (img.file instanceof Blob) {
            img.preview = URL.createObjectURL(img.file);
            return img.preview;
        }
        return undefined;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Chargement de la review...</p>
                </div>
            </div>
        );
    }

    // Charger la review pour l'édition
    useEffect(() => {
        if (isEditing) {
            const loadReview = async () => {
                try {
                    const review = await getReviewById(editId);
                    if (review) {
                        // Initialiser formData avec les données de la review
                        // Merge review top-level, extraData and categoryRatings into a single object
                        const base = {
                            type: review.type || typeFromUrl,
                            holderName: review.holderName || '',
                            overallRating: review.overallRating || 5,
                            ...(review.extraData || {}),
                            ...review
                        };

                        // Start with base values from the review (top-level + extraData merge)
                        const loadedFormData = { ...base };

                        // Helper to lookup a key in multiple places (top-level, extraData, categoryRatings, ratings)
                        const tryGet = (obj, k) => (obj && Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : undefined);
                        const lookupAny = (k) => {
                            if (!review) return undefined;
                            let v = tryGet(review, k);
                            if (v !== undefined) return v;
                            v = tryGet(review.extraData, k);
                            if (v !== undefined) return v;
                            v = tryGet(review.categoryRatings, k);
                            if (v !== undefined) return v;
                            v = tryGet(review.ratings, k);
                            if (v !== undefined) return v;
                            // plural/singular fallback
                            const plural = k.endsWith('s') ? k : `${k}s`;
                            const singular = k.endsWith('s') ? k.replace(/s$/, '') : k;
                            v = tryGet(review, plural) ?? tryGet(review.extraData, plural) ?? tryGet(review.categoryRatings, plural);
                            if (v !== undefined) return v;
                            v = tryGet(review, singular) ?? tryGet(review.extraData, singular) ?? tryGet(review.categoryRatings, singular);
                            if (v !== undefined) return v;
                            return undefined;
                        };

                        // Fill missing fields from review sources (this ensures saved values overwrite defaults)
                        try {
                            sections.forEach(section => {
                                section.fields.forEach(field => {
                                    const k = field.key;

                                    // First, try to pull any saved value from the review (categoryRatings, extraData, ratings)
                                    const found = lookupAny(k);
                                    if (found !== undefined) {
                                        if (field.type === 'slider') {
                                            const n = parseFloat(found);
                                            loadedFormData[k] = isNaN(n) ? (field.default || 0) : n;
                                        } else {
                                            loadedFormData[k] = found;
                                        }
                                        return;
                                    }

                                    // If still missing, and it's a slider, apply default
                                    if (field.type === 'slider' && (loadedFormData[k] === undefined || loadedFormData[k] === null || loadedFormData[k] === '')) {
                                        loadedFormData[k] = field.default || 0;
                                    }

                                    // For other field types, ensure a sensible default
                                    if ((loadedFormData[k] === undefined || loadedFormData[k] === null) && field.type === 'recipe') {
                                        loadedFormData[k] = {};
                                    }
                                    if ((loadedFormData[k] === undefined || loadedFormData[k] === null) && ['wheel', 'effects', 'multiselect', 'cultivar-list'].includes(field.type)) {
                                        loadedFormData[k] = [];
                                    }
                                });
                            });
                        } catch (err) {
                            console.warn('⚠️ Failed to auto-fill form keys from review:', err);
                        }

                        setFormData(loadedFormData);

                        // If the review's type differs from the current page `typeFromUrl`, update the structure
                        // so field keys and sections match those in the saved review (fixes missing scores/tastes/effects on edit).
                        try {
                            if (review.type && review.type !== typeFromUrl) {
                                const newStructure = productStructures[review.type] || productStructures.Fleur;
                                setStructure(newStructure);
                            }
                        } catch (err) {
                            // Do not break edit flow on unexpected errors
                            console.warn('⚠️ Failed to set structure from review.type:', err);
                        }

                        // Charger les images existantes
                        if (review.images && review.images.length > 0) {
                            // Pour l'édition, on garde les URLs des images existantes
                            setImages(review.images.map(img => ({ url: img, existing: true })));
                        }

                        toast.success('Review chargée pour édition');
                    } else {
                        toast.error('Review non trouvée');
                        navigate('/');
                    }
                } catch (err) {
                    toast.error('Erreur lors du chargement de la review');
                    navigate('/');
                } finally {
                    setIsLoading(false);
                }
            };
            loadReview();
        }
    }, [isEditing, editId, getReviewById, navigate, toast, typeFromUrl]);

    const handleInputChange = (field, value) => {
        // Instrumentation: don't allow accidental nulls from keyboard shortcuts
        if (value === null) {
            console.warn(`handleInputChange: ignoring null value for field ${field}`);
            console.trace();
            // convert explicit 'null' to empty string to avoid breaking default behavior
            value = '';
        }

        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    // Instrumentation: monitor for nulls in formData
    useEffect(() => {
        const nullKeys = Object.keys(formData).filter(k => formData[k] === null);
        if (nullKeys.length > 0) {
            console.warn('CreateReviewPage: formData contains null keys:', nullKeys);
            console.trace();
        }
    }, [formData]);
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 4 - images.length;
        if (files.length > remainingSlots) {
            toast.warning(`Maximum 4 images. Il vous reste ${remainingSlots} emplacements.`);
            return;
        }
        const wrapped = files.map(file => ({ file, existing: false, preview: URL.createObjectURL(file) }));
        setImages(prev => [...prev, ...wrapped]);
        toast.success(`${files.length} image(s) ajoutée(s)`);
        setError('');
    };
    const removeImage = (idx) => {
        const image = images[idx];
        // Révoquer l'URL de prévisualisation si nécessaire
        try {
            if (image && !image.existing && image.preview) {
                URL.revokeObjectURL(image.preview);
            }
        } catch (e) {
            // ignore
        }
        // Si c'est une image existante, on pourrait vouloir la marquer pour suppression
        // mais pour simplifier, on la retire juste de la liste
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    // Nettoyage: révoquer les object URLs créés lors du démontage
    useEffect(() => {
        return () => {
            images.forEach(img => {
                try {
                    if (img && !img.existing && img.preview) URL.revokeObjectURL(img.preview);
                } catch (e) { }
            });
        };
    }, [images]);
    const nextSection = () => { if (currentSectionIndex < sections.length - 1) { setCurrentSectionIndex(currentSectionIndex + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const prevSection = () => { if (currentSectionIndex > 0) { setCurrentSectionIndex(currentSectionIndex - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const goToSection = (index) => { setCurrentSectionIndex(index); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (images.length === 0 && !isEditing) {
            toast.error('Au moins une image est requise');
            return;
        }
        if (!formData.holderName || !formData.holderName.trim()) {
            toast.error('Le nom commercial est requis');
            return;
        }
        // ℹ️ Note: orchardPreset n'est plus obligatoire pour permettre la sauvegarde
        // L'utilisateur peut définir l'aperçu plus tard s'il le souhaite via l'édition

        // Ouvrir la modale de sauvegarde
        const defaultTitle = `${formData.holderName || 'Review'} - ${formData.type || 'Produit'}`;
        setSaveModalData({ title: defaultTitle, isPublic: false });
        setShowSaveModal(true);
    };

    const handleConfirmSave = async () => {
        setShowSaveModal(false);
        setIsSubmitting(true);
        setError('');
        const loadingToast = toast.loading(isEditing ? 'Mise à jour de la review...' : 'Création de la review...');

        try {
            const submitData = new FormData();

            // ✅ Calculer categoryRatings AVANT d'envoyer les données
            const categoryRatingsData = calculateCategoryRatings();

            console.log('📊 Category Ratings Calculated:', categoryRatingsData);

            // ⚠️ IMPORTANT: Ne pas envoyer 'note' ou 'overallRating' depuis formData
            // On utilisera uniquement les valeurs calculées
            const excludedKeys = ['note', 'overallRating', 'categoryRatings'];

            Object.keys(formData).forEach(key => {
                // Skip les champs de notes (on utilisera les valeurs calculées)
                if (excludedKeys.includes(key)) {
                    return;
                }

                const value = formData[key];
                if (value !== undefined && value !== null) {
                    submitData.append(key, Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value);
                }
            });

            // ✅ Ajouter categoryRatings et note globale calculées (priorité absolue)
            submitData.append('categoryRatings', JSON.stringify(categoryRatingsData));
            submitData.append('overallRating', categoryRatingsData.overall);
            submitData.append('note', categoryRatingsData.overall); // Fallback pour compatibilité
            submitData.append('isPublic', saveModalData.isPublic);
            submitData.append('title', saveModalData.title);

            console.log('📤 Sending overallRating:', categoryRatingsData.overall);

            // Pour l'édition, gérer les images existantes
            if (isEditing) {
                const existingImages = images.filter(img => img.existing).map(img => img.url);
                submitData.append('existingImages', JSON.stringify(existingImages));
            }

            // Append raw File/Blob objects to FormData (not the wrapper objects)
            images.filter(img => !img.existing).forEach((image) => {
                if (image && image.file) {
                    submitData.append('images', image.file);
                }
            });

            if (isEditing) {
                await updateReview(editId, submitData);
                toast.remove(loadingToast);
                toast.success('Review mise à jour avec succès ! ✅');
            } else {
                await createReview(submitData);
                toast.remove(loadingToast);
                toast.success('Review créée avec succès ! ✅');
            }
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            toast.remove(loadingToast);
            toast.error(err.message || 'Une erreur est survenue');
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field) => {
        // Valeur par défaut en fonction du type
        const getDefaultValue = () => {
            const rawValue = formData[field.key];

            // Pour les sliders, convertir en nombre et gérer les valeurs nulles/undefined
            if (field.type === 'slider') {
                if (rawValue === null || rawValue === undefined || rawValue === '') {
                    return field.default || 0;
                }
                const numValue = parseFloat(rawValue);
                return isNaN(numValue) ? (field.default || 0) : numValue;
            }

            // Pour les types tableau
            if (['wheel', 'effects', 'cultivar-list', 'pipeline-with-cultivars', 'purification-pipeline', 'fertilization-pipeline', 'substrat-mixer', 'multiselect'].includes(field.type)) {
                // Supporter plusieurs formats: array, JSON string or csv
                if (Array.isArray(rawValue)) return rawValue;
                if (typeof rawValue === 'string') {
                    // Try JSON parse first (substratMix or others might be saved as JSON strings)
                    try {
                        const parsed = JSON.parse(rawValue);
                        if (Array.isArray(parsed)) return parsed;
                    } catch (e) {
                        // not JSON, fallback to comma-separated values
                        const csv = rawValue.split(',').map(s => s.trim()).filter(Boolean);
                        return csv;
                    }
                    return [];
                }
                return [];
            }

            // Pour les objets (recipe)
            if (field.type === 'recipe') {
                return typeof rawValue === 'object' && rawValue !== null ? rawValue : {};
            }

            // Pour les autres types (text, textarea, etc.)
            return rawValue !== undefined && rawValue !== null ? rawValue : '';
        };
        const value = getDefaultValue();
        switch (field.type) {
            case 'text': return <input type="text" placeholder={`Ex: ${field.label}`} value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none glow-container-subtle" style={{ border: '1px solid', borderColor: 'var(--border)', color: 'var(--text-primary)' }} required={field.required} />;
            case 'textarea': return <textarea value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} rows={field.rows || 3} placeholder={field.label} className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none resize-none glow-container-subtle" style={{ border: '1px solid', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />;
            case 'number': return <input type="number" min="0" max={field.max || 100} value={value} onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))} className="w-full px-4 py-3 bg-transparent rounded-xl focus:outline-none glow-container-subtle" style={{ border: '1px solid', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />;
            case 'slider': return <div><input type="range" min="0" max={field.max || 10} step="0.5" value={value} onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))} className="w-full h-3 rounded-lg appearance-none cursor-pointer shadow-lg" style={{ background: 'var(--gradient-primary)', border: '2px solid', borderColor: 'var(--primary)' }} /><div className="flex justify-between items-center mt-2"><span className="text-xs opacity-70 font-bold" style={{ color: 'var(--text-primary)' }}>0</span><span className="text-2xl font-bold glow-text-subtle" style={{ color: 'var(--text-primary)' }}>{value}/{field.max || 10}</span><span className="text-xs opacity-70 font-bold" style={{ color: 'var(--text-primary)' }}>{field.max || 10}</span></div></div>;
            case 'select': return <select value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full px-4 py-3 rounded-xl font-medium focus:outline-none shadow-lg glow-container-subtle" style={{ backgroundColor: 'var(--bg-input)', border: '2px solid', borderColor: 'var(--primary)', color: 'var(--text-primary)', backgroundImage: 'none' }}><option value="" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>-- Sélectionner --</option>{field.choices?.map((choice, i) => <option key={i} value={choice} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '0.5rem' }}>{choice}</option>)}</select>;
            case 'multiselect': const selected = Array.isArray(value) ? value : []; return <div className="flex flex-wrap gap-2">{field.choices?.map((choice, i) => <button key={i} type="button" onClick={() => { const newVal = selected.includes(choice) ? selected.filter(v => v !== choice) : [...selected, choice]; handleInputChange(field.key, newVal); }} className="px-3 py-1.5 rounded-lg text-sm transition-all" style={{ backgroundColor: selected.includes(choice) ? 'var(--primary-light)' : 'transparent', border: '1px solid', borderColor: selected.includes(choice) ? 'var(--primary)' : 'var(--border)', color: 'var(--text-primary)', opacity: selected.includes(choice) ? 1 : 0.7 }}>{choice}</button>)}</div>;
            case 'checkbox':
                // Ne pas afficher "Purge à vide" si pas de solvants
                if (field.key === 'purgevide' && !hasSolvents) return null;
                return <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={!!value} onChange={(e) => handleInputChange(field.key, e.target.checked)} className="w-5 h-5 rounded bg-transparent focus:ring-offset-0" style={{ border: '1px solid', borderColor: 'var(--border)', accentColor: 'var(--primary)' }} /><span style={{ color: 'var(--text-primary)' }}>{field.label}</span></label>;
            case 'wheel': return <WheelSelector value={value} onChange={(v) => handleInputChange(field.key, v)} type={field.key} maxSelections={field.maxSelections || 5} />;
            case 'effects': return <EffectSelector value={value} onChange={(v) => handleInputChange(field.key, v)} maxSelections={8} />;
            case 'cultivar-list': return <CultivarList value={value} onChange={(v) => handleInputChange(field.key, v)} matiereChoices={field.matiereChoices || []} showBreeder={field.showBreeder} />;
            case 'pipeline-with-cultivars': const cultivarsListData = formData[field.cultivarsSource] || []; return <PipelineWithCultivars value={value} onChange={(v) => handleInputChange(field.key, v)} choices={field.choices || []} cultivarsList={cultivarsListData} onSolventDetected={setHasSolvents} />;
            case 'purification-pipeline':
                const extractionPipelineData = formData[field.extractionSource] || formData['pipelineSeparation'] || formData['pipelineExtraction'] || [];
                return <PurificationPipeline value={value} onChange={(v) => handleInputChange(field.key, v)} availableMethods={field.availableMethods || []} extractionPipeline={extractionPipelineData} />;
            case 'fertilization-pipeline': return <FertilizationPipeline value={value} onChange={(v) => handleInputChange(field.key, v)} availableFertilizers={field.availableFertilizers || []} />;
            case 'substrat-mixer': return <SubstratMixer value={value} onChange={(v) => handleInputChange(field.key, v)} availableSubstrats={field.availableSubstrats || []} />;
            case 'recipe': return <RecipeSection value={value} onChange={(v) => handleInputChange(field.key, v)} />;
            case 'images': return <div><input type="file" accept="image/*,video/*" multiple onChange={handleImageChange} className="hidden" id="imageUpload" />{images.length === 0 ? <label htmlFor="imageUpload" className="flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all bg-transparent glow-container-subtle" style={{ borderColor: 'var(--border)' }}><div className="text-6xl mb-3">📸</div><span className="text-lg" style={{ color: 'var(--text-primary)' }}>Cliquez pour ajouter des photos</span><span className="text-sm mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>1 à 4 fichiers</span></label> : <div className="space-y-4"><div className="grid grid-cols-2 gap-4">{images.map((img, idx) => <div key={idx} className="relative group aspect-square"><img src={getImageUrl(img)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl glow-container" style={{ border: '2px solid', borderColor: 'var(--border)' }} /><button type="button" onClick={() => removeImage(idx)} className="absolute top-3 right-3 bg-red-600/80 hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg" style={{ color: '#FFFFFF' }}>×</button></div>)}</div>{images.length < 4 && <label htmlFor="imageUpload" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}><span className="text-2xl">+</span><span>Ajouter ({images.length}/4)</span></label>}</div>}</div>;
            default: return null;
        }
    };

    // ✅ Utiliser le mapping centralisé
    const calculateCategoryRatings = () => {
        return calcCategoryRatings(formData, formData.type || 'Fleur');
    };

    const categoryRatings = calculateCategoryRatings();

    return (
        <div className="min-h-screen">
            <div className="sticky top-[73px] z-40 bg-theme-primary backdrop-blur-xl border-b border-theme">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => navigate('/')} className="transition-colors" style={{ color: 'var(--text-secondary)' }}>← Retour</button>
                        <div className="text-center"><h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{isEditing ? `Modifier ${formData.type}` : formData.type}</h1><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Section {currentSectionIndex + 1}/{sections.length}</p></div>
                        <button
                            onClick={() => setShowOrchardStudio(true)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
                        >
                            🎨 Aperçu
                        </button>
                    </div>
                    {/* Résumé des notes par catégorie */}
                    <CategoryRatingSummary ratings={categoryRatings} productType={formData.type || typeFromUrl} />
                </div>
                {/* Barre de navigation des sections */}
                <SectionNavigator
                    sections={sections}
                    currentIndex={currentSectionIndex}
                    onSectionClick={goToSection}
                />
            </div>
            {error && <div className="max-w-4xl mx-auto px-4 mt-4"><div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">{error}</div></div>}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-transparent backdrop-blur-xl rounded-2xl p-8 border border-white/10 glow-container">
                    <h2 className="text-2xl font-bold text-white mb-6 glow-text-subtle">{currentSection.title}</h2>
                    <div className="space-y-6">{currentSection.fields.map((field, idx) => <div key={idx} className="space-y-2">{field.type !== 'checkbox' && field.type !== 'images' && <label className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{field.label}{field.required && <span className="ml-1" style={{ color: '#ef4444' }}>*</span>}{field.max && field.type === 'slider' && <span className="ml-1 opacity-50" style={{ color: 'var(--text-primary)' }}>/{field.max}</span>}</label>}{renderField(field)}</div>)}</div>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-transparent backdrop-blur-xl border-t border-white/10 glow-border py-4 z-50">
                <div className="max-w-4xl mx-auto px-4 flex gap-4">
                    <button type="button" onClick={prevSection} disabled={currentSectionIndex === 0} className="px-6 py-3 bg-transparent rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed glow-container-subtle" style={{ border: '1px solid', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>← Précédent</button>
                    {currentSectionIndex === sections.length - 1 ? <button onClick={handleSubmit} disabled={isSubmitting || (images.length === 0 && !isEditing)} className="flex-1 py-3 bg-transparent rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-container hover:glow-text" style={{ border: '1px solid', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{isSubmitting ? '⏳ Enregistrement...' : isEditing ? '💾 Mettre à jour' : '💾 Enregistrer la Review'}</button> : <button type="button" onClick={nextSection} className="flex-1 py-3 bg-transparent rounded-xl font-bold transition-all glow-container hover:glow-text" style={{ border: '1px solid', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Suivant →</button>}</div>
            </div>
            <div className="h-24"></div>

            {/* Orchard Studio Modal */}
            <AnimatePresence>
                {showOrchardStudio && (() => {
                    // ✅ Normaliser les données pour éviter les erreurs de type
                    const normalizeArray = (value) => {
                        if (Array.isArray(value)) return value;
                        if (!value) return [];
                        if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
                        if (typeof value === 'object') return [];
                        return [];
                    };

                    return (
                        <OrchardPanel
                            reviewData={{
                                // ✅ Infos de base complètes
                                title: formData.holderName || 'Aperçu de la review',
                                rating: categoryRatings.overall,
                                author: user?.displayName || 'Auteur',
                                date: new Date().toISOString(),
                                category: formData.type,

                                // ✅ Tous les champs disponibles pour l'aperçu
                                ...formData,

                                // Notes par catégorie calculées
                                categoryRatings,

                                // Images
                                imageUrl: images.length > 0 ? getImageUrl(images[0]) : undefined,
                                images: images.length > 0 ? images.map(img => getImageUrl(img)) : [],

                                // ✅ Normalisation des tableaux pour compatibilité templates
                                effects: normalizeArray(formData.effects || formData.selectedEffects),
                                aromas: normalizeArray(formData.aromas || formData.selectedAromas || formData.notesDominantesOdeur),
                                tastes: normalizeArray(formData.tastes || formData.selectedTastes || formData.inhalation),
                                terpenes: normalizeArray(formData.terpenes),
                                cultivar: formData.cultivars || formData.cultivar || '',
                                breeder: formData.breeder || formData.hashmaker || '',
                                farm: formData.farm || ''
                            }}
                            onClose={() => setShowOrchardStudio(false)}
                            onPresetApplied={(orchardData) => {
                                // ✅ Sauvegarder la configuration Orchard dans formData
                                setFormData(prev => ({
                                    ...prev,
                                    orchardConfig: JSON.stringify(orchardData.orchardConfig),
                                    orchardPreset: orchardData.orchardPreset || 'custom',
                                    orchardCustomLayout: orchardData.customLayout || null,
                                    orchardLayoutMode: orchardData.layoutMode || (orchardData.customLayout ? 'custom' : 'template')
                                }));
                                toast.success('✅ Aperçu défini avec succès !');
                            }}
                        />
                    );
                })()}
            </AnimatePresence>

            {/* Save Modal */}
            <AnimatePresence>
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-md w-full">
                            <h3 className="text-xl font-bold text-white mb-4">Finaliser la review</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">Titre de la review</label>
                                    <input
                                        type="text"
                                        value={saveModalData.title}
                                        onChange={(e) => setSaveModalData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 glow-container-subtle"
                                        placeholder="Titre de la review"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">Visibilité</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                checked={!saveModalData.isPublic}
                                                onChange={() => setSaveModalData(prev => ({ ...prev, isPublic: false }))}
                                                className="w-4 h-4 border-white/20 bg-transparent focus:ring-offset-0"
                                                style={{ accentColor: 'var(--primary)' }}
                                            />
                                            <span className="text-white">Privée (visible seulement par moi)</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                checked={saveModalData.isPublic}
                                                onChange={() => setSaveModalData(prev => ({ ...prev, isPublic: true }))}
                                                disabled={!formData.orchardPreset}
                                                className="w-4 h-4 border-white/20 bg-transparent focus:ring-offset-0 disabled:opacity-50"
                                                style={{ accentColor: 'var(--primary)' }}
                                            />
                                            <span className="text-white">Publique (visible par tous)</span>
                                        </label>
                                        {!formData.orchardPreset && (
                                            <p className="text-red-400 text-sm ml-7">
                                                Vous devez définir un aperçu pour publier en public
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="flex-1 px-4 py-3 bg-transparent border border-white/20 hover:border-white/40 text-white rounded-xl font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmSave}
                                    disabled={isSubmitting || !saveModalData.title.trim()}
                                    className="flex-1 px-4 py-3 bg-transparent border border-white/40 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-container hover:glow-text"
                                >
                                    {isSubmitting ? '⏳ Enregistrement...' : '💾 Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
} 
