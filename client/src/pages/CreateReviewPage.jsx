import { useState } from 'react';
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
    const { isAuthenticated, createReview, user } = useStore();
    const toast = useToast();

    const typeFromUrl = searchParams.get('type') || 'Fleur';
    const structure = productStructures[typeFromUrl] || productStructures.Fleur;
    const sections = structure.sections;

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const currentSection = sections[currentSectionIndex];

    const [formData, setFormData] = useState({ type: typeFromUrl, holderName: '', overallRating: 5 });
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [hasSolvents, setHasSolvents] = useState(false);
    const [showOrchardStudio, setShowOrchardStudio] = useState(false);

    if (!isAuthenticated) { navigate('/'); return null; }

    const handleInputChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); setError(''); };
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 4 - images.length;
        if (files.length > remainingSlots) {
            toast.warning(`Maximum 4 images. Il vous reste ${remainingSlots} emplacements.`);
            return;
        }
        setImages(prev => [...prev, ...files].slice(0, 4));
        toast.success(`${files.length} image(s) ajoutée(s)`);
        setError('');
    };
    const removeImage = (idx) => { setImages(prev => prev.filter((_, i) => i !== idx)); };
    const nextSection = () => { if (currentSectionIndex < sections.length - 1) { setCurrentSectionIndex(currentSectionIndex + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const prevSection = () => { if (currentSectionIndex > 0) { setCurrentSectionIndex(currentSectionIndex - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const goToSection = (index) => { setCurrentSectionIndex(index); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) {
            toast.error('Au moins une image est requise');
            return;
        }
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
        setError('');
        const loadingToast = toast.loading('Création de la review...');

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
            submitData.append('isPublic', true);

            console.log('📤 Sending overallRating:', categoryRatingsData.overall);

            images.forEach((image) => { submitData.append('images', image); });

            await createReview(submitData);

            toast.remove(loadingToast);
            toast.success('Review créée avec succès ! ✅');
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
                return Array.isArray(rawValue) ? rawValue : [];
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
            case 'text': return <input type="text" placeholder={`Ex: ${field.label}`} value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 glow-container-subtle" required={field.required} />;
            case 'textarea': return <textarea value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} rows={field.rows || 3} placeholder={field.label} className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none glow-container-subtle" />;
            case 'number': return <input type="number" min="0" max={field.max || 100} value={value} onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))} className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 glow-container-subtle" />;
            case 'slider': return <div><input type="range" min="0" max={field.max || 10} step="0.5" value={value} onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer" style={{ accentColor: 'var(--primary)' }} /><div className="flex justify-between items-center mt-2"><span className="text-xs text-white/50">0</span><span className="text-2xl font-bold text-white glow-text-subtle">{value}/{field.max || 10}</span><span className="text-xs text-white/50">{field.max || 10}</span></div></div>;
            case 'select': return <select value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 glow-container-subtle"><option value="">-- Sélectionner --</option>{field.choices?.map((choice, i) => <option key={i} value={choice}>{choice}</option>)}</select>;
            case 'multiselect': const selected = Array.isArray(value) ? value : []; return <div className="flex flex-wrap gap-2">{field.choices?.map((choice, i) => <button key={i} type="button" onClick={() => { const newVal = selected.includes(choice) ? selected.filter(v => v !== choice) : [...selected, choice]; handleInputChange(field.key, newVal); }} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selected.includes(choice) ? 'bg-transparent text-white border border-white/40 glow-text-subtle' : 'bg-transparent text-white/70 border border-white/20 hover:border-white/30'}`}>{choice}</button>)}</div>;
            case 'checkbox':
                // Ne pas afficher "Purge à vide" si pas de solvants
                if (field.key === 'purgevide' && !hasSolvents) return null;
                return <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={!!value} onChange={(e) => handleInputChange(field.key, e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-transparent focus:ring-offset-0" style={{ accentColor: 'var(--primary)' }} /><span className="text-white">{field.label}</span></label>;
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
            case 'images': return <div><input type="file" accept="image/*,video/*" multiple onChange={handleImageChange} className="hidden" id="imageUpload" />{images.length === 0 ? <label htmlFor="imageUpload" className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-all bg-transparent glow-container-subtle"><div className="text-6xl mb-3">📸</div><span className="text-lg text-white">Cliquez pour ajouter des photos</span><span className="text-sm text-white/50 mt-1">1 à 4 fichiers</span></label> : <div className="space-y-4"><div className="grid grid-cols-2 gap-4">{images.map((img, idx) => <div key={idx} className="relative group aspect-square"><img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-white/20 glow-container" /><button type="button" onClick={() => removeImage(idx)} className="absolute top-3 right-3 bg-red-600/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">×</button></div>)}</div>{images.length < 4 && <label htmlFor="imageUpload" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 transition-colors text-white/70 hover:text-white"><span className="text-2xl">+</span><span>Ajouter ({images.length}/4)</span></label>}</div>}</div>;
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
            <div className="sticky top-[73px] z-40 bg-[rgba(var(--color-primary),0.95)] backdrop-blur-xl border-b border-[rgba(var(--color-primary),0.3)]">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">← Retour</button>
                        <div className="text-center"><h1 className="text-xl font-bold text-white">{formData.type}</h1><p className="text-xs text-gray-400">Section {currentSectionIndex + 1}/{sections.length}</p></div>
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
                    <div className="space-y-6">{currentSection.fields.map((field, idx) => <div key={idx} className="space-y-2">{field.type !== 'checkbox' && field.type !== 'images' && <label className="block text-sm font-semibold text-white">{field.label}{field.required && <span className="ml-1" style={{ color: '#ef4444' }}>*</span>}{field.max && field.type === 'slider' && <span className="ml-1 opacity-50" style={{ color: '#ffffff' }}>/{field.max}</span>}</label>}{renderField(field)}</div>)}</div>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-transparent backdrop-blur-xl border-t border-white/10 glow-border py-4 z-50">
                <div className="max-w-4xl mx-auto px-4 flex gap-4">
                    <button type="button" onClick={prevSection} disabled={currentSectionIndex === 0} className="px-6 py-3 bg-transparent border border-white/20 hover:border-white/40 text-white rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed glow-container-subtle">← Précédent</button>
                    {currentSectionIndex === sections.length - 1 ? <button onClick={handleSubmit} disabled={isSubmitting || images.length === 0} className="flex-1 py-3 bg-transparent border border-white/40 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-container hover:glow-text">{isSubmitting ? '⏳ Enregistrement...' : '💾 Enregistrer la Review'}</button> : <button type="button" onClick={nextSection} className="flex-1 py-3 bg-transparent border border-white/40 text-white rounded-xl font-bold transition-all glow-container hover:glow-text">Suivant →</button>}</div>
            </div>
            <div className="h-24"></div>

            {/* Orchard Studio Modal */}
            <AnimatePresence>
                {showOrchardStudio && (() => {
                    // ✅ Normaliser les données pour éviter les erreurs de type
                    const normalizeArray = (value) => {
                        if (Array.isArray(value)) return value;
                        if (!value) return [];
                        if (typeof value === 'object') return []; // Objet non-tableau
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
                                imageUrl: images.length > 0 ? URL.createObjectURL(images[0]) : undefined,
                                images: images.length > 0 ? images.map(img => URL.createObjectURL(img)) : [],

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
                                    orchardPreset: orchardData.orchardPreset || 'custom'
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
