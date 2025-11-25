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
import OrchardPanel from '../components/orchard/OrchardPanel';
import { AnimatePresence } from 'framer-motion';
import { productStructures } from '../utils/productStructures';
import { parseImages } from '../utils/imageUtils';
import { calculateCategoryRatings as calcCategoryRatings, CATEGORY_DISPLAY_ORDER } from '../utils/categoryMappings';

export default function EditReviewPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { isAuthenticated, user } = useStore();
    const toast = useToast();

    // 🔍 Debug: Log l'ID immédiatement
    console.log('🆔 EditReviewPage - ID from useParams:', id, typeof id);

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
    const [showOrchardStudio, setShowOrchardStudio] = useState(false);

    const fetchReview = async () => {
        try {
            console.log('🔍 Fetching review:', id);
            console.log('👤 Current user:', user);

            const response = await fetch(`/api/reviews/${id}`, {
                credentials: 'include' // ✅ Important pour envoyer les cookies de session
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Fetch error:', errorData);
                throw new Error(errorData.message || 'Review non trouvée');
            }

            const data = await response.json();
            console.log('✅ Review data:', data);

            // Vérifier ownership
            if (data.authorId !== user?.id) {
                console.warn('⚠️ Ownership check failed:', {
                    reviewAuthorId: data.authorId,
                    currentUserId: user?.id
                });
                toast.error('Vous ne pouvez pas éditer cette review');
                navigate('/');
                return;
            }

            setReview(data);

            // Parse JSON fields (seulement si ce sont des strings, sinon l'API les a déjà parsés)
            const safeParseJSON = (value, defaultValue) => {
                if (!value) return defaultValue;
                if (typeof value === 'string') {
                    try {
                        return JSON.parse(value);
                    } catch (e) {
                        console.warn('⚠️ Failed to parse JSON:', { value, error: e.message });
                        return defaultValue;
                    }
                }
                return value; // Déjà un objet
            };

            // Convertir les champs numériques (sliders) en nombres
            const toNumber = (value) => {
                if (value === null || value === undefined || value === '') return null;
                const num = parseFloat(value);
                return isNaN(num) ? null : num;
            };

            const parsedExtra = safeParseJSON(data.extraData, {});

            const parsedData = {
                ...data,
                // JSON fields
                categoryRatings: safeParseJSON(data.categoryRatings, null),
                aromas: safeParseJSON(data.aromas, []),
                tastes: safeParseJSON(data.tastes, []),
                effects: safeParseJSON(data.effects, []),
                cultivarsList: safeParseJSON(data.cultivarsList, []),
                pipelineExtraction: safeParseJSON(data.pipelineExtraction, []),
                pipelineSeparation: safeParseJSON(data.pipelineSeparation, []),
                pipelinePurification: safeParseJSON(data.pipelinePurification, []),
                fertilizationPipeline: safeParseJSON(data.fertilizationPipeline, []),
                substratMix: safeParseJSON(data.substratMix, []),
                extraData: parsedExtra,
                // Numeric fields (sliders) - Convert to numbers when present at top-level
                densite: toNumber(data.densite),
                parfum: toNumber(data.parfum),
                gout: toNumber(data.gout),
                collant: toNumber(data.collant),
                elasticite: toNumber(data.elasticite),
                durete: toNumber(data.durete),
                poudreux: toNumber(data.poudreux),
                huileux: toNumber(data.huileux),
                overallRating: toNumber(data.overallRating),
                note: toNumber(data.note),
            };

            // Merge extraData fields into the top-level parsedData so that
            // form fields that were saved into extraData are accessible via formData[fieldKey]
            const mergedFormData = { ...parsedData, ...parsedData.extraData };

            // Helper: lookup a value in multiple locations (top-level, extraData, categoryRatings, ratings)
            const lookupAny = (obj, key) => {
                if (!obj) return undefined;
                const tryGet = (o, k) => (o && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined);
                let v = tryGet(obj, key);
                if (v !== undefined) return v;
                v = tryGet(obj.extraData, key);
                if (v !== undefined) return v;
                v = tryGet(obj.categoryRatings, key);
                if (v !== undefined) return v;
                v = tryGet(obj.ratings, key);
                if (v !== undefined) return v;
                // plural / singular
                const plural = key.endsWith('s') ? key : `${key}s`;
                const singular = key.endsWith('s') ? key.replace(/s$/, '') : key;
                v = tryGet(obj, plural) ?? tryGet(obj.extraData, plural) ?? tryGet(obj.categoryRatings, plural);
                if (v !== undefined) return v;
                v = tryGet(obj, singular) ?? tryGet(obj.extraData, singular) ?? tryGet(obj.categoryRatings, singular);
                if (v !== undefined) return v;
                // fuzzy match
                const allKeys = Array.from(new Set([].concat(Object.keys(obj || {}), Object.keys(obj.extraData || {}), Object.keys(obj.categoryRatings || {}), Object.keys(obj.ratings || {}))));
                const lower = key.toLowerCase();
                const match = allKeys.find(k => k.toLowerCase() === lower || k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase()));
                if (match) return tryGet(obj, match) ?? tryGet(obj.extraData, match) ?? tryGet(obj.categoryRatings, match) ?? tryGet(obj.ratings, match);
                return undefined;
            };

            // Ensure top-level form keys match what the UI expects by scanning the current structure
            // and populating any missing keys from parsedData / extraData / categoryRatings
            const filledFormData = { ...mergedFormData };
            try {
                const structureSections = productStructures[parsedData.type || 'Fleur']?.sections || [];
                structureSections.forEach(section => {
                    (section.fields || []).forEach(f => {
                        const k = f.key;
                        if (filledFormData[k] === undefined || filledFormData[k] === null || filledFormData[k] === '') {
                            const found = lookupAny(parsedData, k);
                            if (found !== undefined) {
                                // convert numeric-like strings for sliders
                                if (f.type === 'slider' && (typeof found === 'string' || typeof found === 'number')) {
                                    const n = parseFloat(found);
                                    filledFormData[k] = isNaN(n) ? (f.default || 0) : n;
                                } else {
                                    filledFormData[k] = found;
                                }
                            }
                        }
                    });
                });
            } catch (err) {
                console.warn('⚠️ Failed to auto-fill form keys from parsedData:', err);
            }

            console.log('📊 Parsed form data (before merge):', parsedData);
            console.log('🔍 Merged formData keys:', Object.keys(mergedFormData));
            console.log('🔍 Sample merged values:', {
                holderName: mergedFormData.holderName,
                overallRating: mergedFormData.overallRating,
                note: mergedFormData.note,
                categoryRatings: mergedFormData.categoryRatings,
                densite: mergedFormData.densite || mergedFormData['densiteTexture'] || mergedFormData['densite'],
                parfum: mergedFormData.parfum,
                gout: mergedFormData.gout
            });

            // DEBUG: dump filled form keys and relevant smell/taste/effects fields to help mapping
            try {
                console.log('🔎 filledFormData keys:', Object.keys(filledFormData || {}).sort());
                console.log('🔎 tastes/aromas/effects and ratings sample:', {
                    tastes: filledFormData.tastes,
                    aromas: filledFormData.aromas,
                    effects: filledFormData.effects,
                    categoryRatings: filledFormData.categoryRatings,
                    ratings: filledFormData.ratings,
                    aromasIntensity: filledFormData.aromasIntensity,
                    tastesIntensity: filledFormData.tastesIntensity,
                    effectsIntensity: filledFormData.effectsIntensity
                });
            } catch (e) {
                console.warn('⚠️ Failed to dump filledFormData debug info', e);
            }

            // Use the filled version (keys auto-populated from parsedData / extraData)
            setFormData(filledFormData);
            setExistingImages(parseImages(data.images));

            const prodStructure = productStructures[data.type] || productStructures.Fleur;
            setStructure(prodStructure);

            setLoading(false);
        } catch (error) {
            console.error('💥 Error loading review:', error);
            toast.error(`Erreur lors du chargement de la review: ${error.message}`);
            navigate('/');
        }
    };

    useEffect(() => {
        console.log('🔄 EditReviewPage useEffect triggered', {
            id,
            isAuthenticated,
            user: user ? { id: user.id, username: user.username } : null
        });

        // ✅ Vérifier que l'ID est valide
        if (!id || id === 'undefined' || id === 'null') {
            console.error('❌ Invalid review ID:', id);
            toast.error('ID de review invalide');
            navigate('/');
            return;
        }

        if (!isAuthenticated) {
            console.log('⚠️ User not authenticated, redirecting...');
            toast.warning('Vous devez être connecté pour éditer une review');
            navigate('/');
            return;
        }

        // ✅ Attendre que l'utilisateur soit chargé avant de fetcher la review
        if (!user) {
            console.log('⏳ Waiting for user data...');
            return;
        }

        fetchReview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isAuthenticated, user]);

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            images.forEach(img => {
                try { if (img && img.preview) URL.revokeObjectURL(img.preview); } catch (e) { }
            });
        };
    }, [images]);

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

        const wrapped = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
        setImages(prev => [...prev, ...wrapped]);
        toast.success(`${files.length} image(s) ajoutée(s)`);
    };

    const removeImage = (idx) => {
        // Revoke the preview URL if present
        setImages(prev => {
            const img = prev[idx];
            try { if (img && img.preview) URL.revokeObjectURL(img.preview); } catch (e) { }
            return prev.filter((_, i) => i !== idx);
        });
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

        // ✅ Vérification du preset Orchard défini
        if (!formData.orchardPreset) {
            toast.error('Vous devez définir un aperçu/rendu pour votre review avant de la publier. Cliquez sur le bouton "🎨 Aperçu"');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Mise à jour en cours...');

        try {
            const submitData = new FormData();

            // ✅ Calculer categoryRatings AVANT d'envoyer les données
            const categoryRatingsData = calculateCategoryRatings();

            console.log('📊 Category Ratings Calculated (Edit):', categoryRatingsData);

            // ⚠️ IMPORTANT: Ne pas envoyer 'note' ou 'overallRating' depuis formData
            const excludedKeys = ['note', 'overallRating', 'categoryRatings'];

            // Add all form fields SAUF les notes (on utilisera les valeurs calculées)
            Object.keys(formData).forEach(key => {
                // Skip les champs de notes
                if (excludedKeys.includes(key)) {
                    return;
                }

                const value = formData[key];
                if (value !== null && value !== undefined) {
                    if (typeof value === 'object') {
                        submitData.append(key, JSON.stringify(value));
                    } else {
                        submitData.append(key, value);
                    }
                }
            });

            // ✅ Ajouter categoryRatings et note globale calculées (priorité absolue)
            submitData.append('categoryRatings', JSON.stringify(categoryRatingsData));
            submitData.append('overallRating', categoryRatingsData.overall);
            submitData.append('note', categoryRatingsData.overall); // Fallback

            console.log('📤 Sending overallRating (Edit):', categoryRatingsData.overall);

            // Add new images (append raw File objects)
            images.forEach(img => {
                if (img && img.file) {
                    submitData.append('images', img.file);
                }
            });

            // Add existing images to keep
            submitData.append('existingImages', JSON.stringify(existingImages));

            const response = await fetch(`/api/reviews/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: submitData
            });

            if (!response.ok) {
                const text = await response.text();
                let parsed = null;
                try {
                    parsed = JSON.parse(text);
                } catch (e) {
                    // Not JSON — server returned HTML or plain text
                }
                const errorMessage = parsed?.message || text || 'Erreur lors de la mise à jour';
                console.error('PUT /api/reviews/:id error response:', { status: response.status, body: text });
                throw new Error(errorMessage);
            }

            toast.remove(loadingToast);
            toast.success('Review mise à jour avec succès ! ✅');

            setTimeout(() => navigate(`/review/${id}`), 1000);
        } catch (err) {
            toast.remove(loadingToast);
            toast.error(err.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field) => {
        // Helper: cherche une clé dans formData, extraData, categoryRatings, ratings
        const lookupValue = (key) => {
            if (!formData) return undefined;

            const tryGet = (obj, k) => (obj && Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : undefined);

            // Direct hits
            let v = tryGet(formData, key);
            if (v !== undefined) return v;

            v = tryGet(formData.extraData, key);
            if (v !== undefined) return v;

            v = tryGet(formData.categoryRatings, key);
            if (v !== undefined) return v;

            v = tryGet(formData.ratings, key);
            if (v !== undefined) return v;

            // Variantes simples: plural / singular
            const plural = key.endsWith('s') ? key : `${key}s`;
            const singular = key.endsWith('s') ? key.replace(/s$/, '') : key;
            if (plural !== key) {
                v = tryGet(formData, plural) ?? tryGet(formData.extraData, plural);
                if (v !== undefined) return v;
            }
            if (singular !== key) {
                v = tryGet(formData, singular) ?? tryGet(formData.extraData, singular);
                if (v !== undefined) return v;
            }

            // Case-insensitive match among keys (fuzzy)
            const allKeys = Object.keys(formData || {}).concat(Object.keys(formData.extraData || {})).concat(Object.keys(formData.categoryRatings || {})).concat(Object.keys(formData.ratings || {}));
            const lower = key.toLowerCase();
            const match = allKeys.find(k => k.toLowerCase() === lower || k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase()));
            if (match) {
                return tryGet(formData, match) ?? tryGet(formData.extraData, match) ?? tryGet(formData.categoryRatings, match) ?? tryGet(formData.ratings, match);
            }

            return undefined;
        };

        // Valeur par défaut en fonction du type
        const getDefaultValue = () => {
            const rawValue = lookupValue(field.key);

            // Pour les sliders, convertir en nombre et gérer les valeurs nulles/undefined
            if (field.type === 'slider') {
                if (rawValue === null || rawValue === undefined || rawValue === '') {
                    return field.default || 0;
                }
                const numValue = parseFloat(rawValue);
                return isNaN(numValue) ? (field.default || 0) : numValue;
            }

            // Pour les types tableau
            if ([
                'wheel', 'effects', 'cultivar-list', 'pipeline-with-cultivars',
                'purification-pipeline', 'fertilization-pipeline', 'substrat-mixer', 'multiselect'
            ].includes(field.type)) {
                // Normalize array-like fields: allow arrays, JSON strings or comma-separated strings
                if (Array.isArray(rawValue)) return rawValue;
                if (typeof rawValue === 'string') {
                    try {
                        const parsed = JSON.parse(rawValue);
                        if (Array.isArray(parsed)) return parsed;
                    } catch (e) {
                        // fallback to csv
                        const csv = rawValue.split(',').map(s => s.trim()).filter(Boolean);
                        if (csv.length > 0) return csv;
                    }
                }
                if (Array.isArray(formData?.[field.key])) return formData[field.key];
                return [];
            }

            // Pour les objets (recipe)
            if (field.type === 'recipe') {
                return typeof rawValue === 'object' && rawValue !== null ? rawValue : (typeof formData?.[field.key] === 'object' ? formData[field.key] : {});
            }

            // Pour les autres types (text, textarea, etc.)
            return rawValue !== undefined && rawValue !== null ? rawValue : (formData?.[field.key] ?? '');
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
                                                src={img.preview || (img.file instanceof Blob ? URL.createObjectURL(img.file) : undefined)}
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

    // ✅ Utiliser le mapping centralisé
    const calculateCategoryRatings = () => {
        return calcCategoryRatings(formData, formData.type || 'Fleur');
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
                        <button
                            onClick={() => setShowOrchardStudio(true)}
                            className={`px-4 py-2 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2 ${formData.orchardPreset
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                                } text-white`}
                        >
                            {formData.orchardPreset ? '✅ Aperçu défini' : '🎨 Définir aperçu'}
                        </button>
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
                                author: review?.authorName || user?.displayName || 'Auteur',
                                date: review?.createdAt || new Date().toISOString(),
                                category: formData.type,

                                // ✅ Tous les champs disponibles pour l'aperçu
                                ...formData,

                                // Notes par catégorie calculées
                                categoryRatings,

                                // Images
                                imageUrl: existingImages.length > 0 ? existingImages[0] : (images.length > 0 ? (images[0].preview || (images[0].file instanceof Blob ? URL.createObjectURL(images[0].file) : undefined)) : undefined),
                                images: existingImages.length > 0 ? existingImages : (images.length > 0 ? images.map(img => img.preview || (img.file instanceof Blob ? URL.createObjectURL(img.file) : undefined)) : []),

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
                                // Sauvegarder la configuration Orchard dans formData
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
        </div>
    );
}
