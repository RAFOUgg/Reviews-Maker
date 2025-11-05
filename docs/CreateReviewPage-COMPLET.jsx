// FICHIER COMPLET CreateReviewPage.jsx - Version étape par étape
// Copiez ce contenu dans: client/src/pages/CreateReviewPage.jsx

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import WheelSelector from '../components/WheelSelector';
import EffectSelector from '../components/EffectSelector';
import { productStructures } from '../data/productStructures';

export default function CreateReviewPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useStore();

    const typeFromUrl = searchParams.get('type') || 'Fleur';
    const structure = productStructures[typeFromUrl] || productStructures.Fleur;
    const sections = structure.sections;

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const currentSection = sections[currentSectionIndex];

    const [formData, setFormData] = useState({ type: typeFromUrl, holderName: '', overallRating: 5 });
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isAuthenticated) { navigate('/'); return null; }

    const handleInputChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); setError(''); };
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 4 - images.length;
        if (files.length > remainingSlots) { setError(`Maximum 4 images. Il vous reste ${remainingSlots} emplacements.`); return; }
        setImages(prev => [...prev, ...files].slice(0, 4));
        setError('');
    };
    const removeImage = (idx) => { setImages(prev => prev.filter((_, i) => i !== idx)); };
    const nextSection = () => { if (currentSectionIndex < sections.length - 1) { setCurrentSectionIndex(currentSectionIndex + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const prevSection = () => { if (currentSectionIndex > 0) { setCurrentSectionIndex(currentSectionIndex - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    const goToSection = (index) => { setCurrentSectionIndex(index); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) { setError('Au moins une image est requise'); return; }
        if (!formData.holderName || !formData.holderName.trim()) { setError('Le nom commercial est requis'); return; }
        setIsSubmitting(true); setError('');
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== undefined && value !== null) {
                    submitData.append(key, Array.isArray(value) ? JSON.stringify(value) : value);
                }
            });
            submitData.append('isPublic', true);
            images.forEach((image) => { submitData.append('images', image); });
            const response = await fetch('/api/reviews', { method: 'POST', credentials: 'include', body: submitData });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Erreur lors de la création'); }
            navigate('/');
        } catch (err) { console.error('Erreur:', err); setError(err.message || 'Une erreur est survenue'); } finally { setIsSubmitting(false); }
    };

    const renderField = (field) => {
        const value = formData[field.key] || (field.type === 'slider' ? (field.default || 0) : '');
        switch (field.type) {
            case 'text': return <input type="text" placeholder={`Ex: ${field.label}`} value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500" required={field.required} />;
            case 'textarea': return <textarea value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} rows={field.rows || 3} placeholder={field.label} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none" />;
            case 'number': return <input type="number" min="0" max={field.max || 100} value={value} onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500" />;
            case 'slider': return <div><input type="range" min="0" max={field.max || 10} step="0.5" value={value} onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500" /><div className="flex justify-between items-center mt-2"><span className="text-xs text-gray-500">0</span><span className="text-2xl font-bold text-green-400">{value}/{field.max || 10}</span><span className="text-xs text-gray-500">{field.max || 10}</span></div></div>;
            case 'select': return <select value={value} onChange={(e) => handleInputChange(field.key, e.target.value)} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"><option value="">-- Sélectionner --</option>{field.choices?.map((choice, i) => <option key={i} value={choice}>{choice}</option>)}</select>;
            case 'multiselect': const selected = Array.isArray(value) ? value : []; return <div className="flex flex-wrap gap-2">{field.choices?.map((choice, i) => <button key={i} type="button" onClick={() => { const newVal = selected.includes(choice) ? selected.filter(v => v !== choice) : [...selected, choice]; handleInputChange(field.key, newVal); }} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selected.includes(choice) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{choice}</button>)}</div>;
            case 'checkbox': return <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={!!value} onChange={(e) => handleInputChange(field.key, e.target.checked)} className="w-5 h-5 rounded border-gray-700 bg-gray-900/50 text-green-600 focus:ring-green-500" /><span className="text-gray-300">{field.label}</span></label>;
            case 'wheel': return <WheelSelector value={value} onChange={(v) => handleInputChange(field.key, v)} type={field.key} maxSelections={5} />;
            case 'effects': return <EffectSelector value={value} onChange={(v) => handleInputChange(field.key, v)} maxSelections={8} />;
            case 'images': return <div><input type="file" accept="image/*,video/*" multiple onChange={handleImageChange} className="hidden" id="imageUpload" />{images.length === 0 ? <label htmlFor="imageUpload" className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition-all bg-gray-900/30"><div className="text-6xl mb-3">📸</div><span className="text-lg text-gray-300">Cliquez pour ajouter des photos</span><span className="text-sm text-gray-500 mt-1">1 à 4 fichiers</span></label> : <div className="space-y-4"><div className="grid grid-cols-2 gap-4">{images.map((img, idx) => <div key={idx} className="relative group aspect-square"><img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-700" /><button type="button" onClick={() => removeImage(idx)} className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg">×</button></div>)}</div>{images.length < 4 && <label htmlFor="imageUpload" className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition-colors text-gray-400 hover:text-gray-300"><span className="text-2xl">+</span><span>Ajouter ({images.length}/4)</span></label>}</div>}</div>;
            default: return null;
        }
    };

    const progressPercent = ((currentSectionIndex + 1) / sections.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">← Retour</button>
                        <div className="text-center"><h1 className="text-xl font-bold text-white">{formData.type}</h1><p className="text-xs text-gray-400">Section {currentSectionIndex + 1}/{sections.length}</p></div>
                        <div className="w-16"></div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2"><div className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} /></div>
                </div>
            </div>
            <div className="sticky top-[88px] z-40 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 overflow-x-auto">
                <div className="max-w-4xl mx-auto px-4"><div className="flex gap-2 py-3">{sections.map((section, idx) => <button key={idx} onClick={() => goToSection(idx)} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${idx === currentSectionIndex ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'}`}>{section.title}</button>)}</div></div>
            </div>
            {error && <div className="max-w-4xl mx-auto px-4 mt-4"><div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">{error}</div></div>}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold text-white mb-6">{currentSection.title}</h2>
                    <div className="space-y-6">{currentSection.fields.map((field, idx) => <div key={idx} className="space-y-2">{field.type !== 'checkbox' && field.type !== 'images' && <label className="block text-sm font-semibold text-gray-300">{field.label}{field.required && <span className="text-red-400 ml-1">*</span>}{field.max && field.type === 'slider' && <span className="text-gray-500 ml-1">/10</span>}</label>}{renderField(field)}</div>)}</div>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 py-4 z-50">
                <div className="max-w-4xl mx-auto px-4 flex gap-4">
                    <button type="button" onClick={prevSection} disabled={currentSectionIndex === 0} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed">← Précédent</button>
                    {currentSectionIndex === sections.length - 1 ? <button onClick={handleSubmit} disabled={isSubmitting || images.length === 0} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">{isSubmitting ? '⏳ Enregistrement...' : '💾 Enregistrer la Review'}</button> : <button type="button" onClick={nextSection} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold shadow-lg transition-all">Suivant →</button>}</div>
            </div>
            <div className="h-24"></div>
        </div>
    );
}
