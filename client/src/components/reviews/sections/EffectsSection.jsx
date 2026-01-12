import React, { useState, useEffect } from 'react';
import { EFFECTS_CATEGORIES, getAllEffects, getEffectsByFilter, ONSET_LEVELS, INTENSITY_LEVELS, DURATION_OPTIONS } from '../../../data/effectsCategories';
import { EXPERIENCE_VALUES } from '../../../data/formValues';
import { Zap, Sparkles, Clock, Filter, Plus, X, Beaker, ChevronDown } from 'lucide-react';
import WhiteSlider from '../../ui/WhiteSlider';

/**
 * Section Effets Ressentis + Expérience d'Utilisation (FUSIONNÉE)
 * Inclut: Montée, Intensité, Durée, Effets + Expérience consommation
 * Props: productType, formData, handleChange
 */
export default function EffectsSection({ productType, formData = {}, handleChange }) {
    const data = formData.effets || {};
    
    // EFFETS RESSENTIS
    const [onset, setOnset] = useState(data?.onset || 5);
    const [intensity, setIntensity] = useState(data?.intensity || 5);
    const [duration, setDuration] = useState(data?.duration || '1-2h');
    const [selectedEffects, setSelectedEffects] = useState(data?.effects || []);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [sentimentFilter, setSentimentFilter] = useState(null);

    // EXPÉRIENCE D'UTILISATION
    const [methodeConsommation, setMethodeConsommation] = useState(data?.methodeConsommation || '');
    const [dosageUtilise, setDosageUtilise] = useState(data?.dosageUtilise || '');
    const [dosageUnite, setDosageUnite] = useState(data?.dosageUnite || 'g');
    const [dureeEffetsHeures, setDureeEffetsHeures] = useState(data?.dureeEffetsHeures || '');
    const [dureeEffetsMinutes, setDureeEffetsMinutes] = useState(data?.dureeEffetsMinutes || '');
    const [debutEffets, setDebutEffets] = useState(data?.debutEffets || '');
    const [dureeEffetsCategorie, setDureeEffetsCategorie] = useState(data?.dureeEffetsCategorie || 'moyenne');
    const [profilsEffets, setProfilsEffets] = useState(data?.profilsEffets || []);
    const [effetsSecondaires, setEffetsSecondaires] = useState(data?.effetsSecondaires || []);
    const [usagesPreferes, setUsagesPreferes] = useState(data?.usagesPreferes || []);
    const [filterProfils, setFilterProfils] = useState('tous');
    const [expandExperience, setExpandExperience] = useState(false);

    // Synchroniser avec parent
    useEffect(() => {
        handleChange('effets', {
            onset,
            intensity,
            duration,
            effects: selectedEffects,
            methodeConsommation,
            dosageUtilise,
            dosageUnite,
            dureeEffetsHeures,
            dureeEffetsMinutes,
            debutEffets,
            dureeEffetsCategorie,
            profilsEffets,
            effetsSecondaires,
            usagesPreferes
        });
    }, [onset, intensity, duration, selectedEffects, methodeConsommation, dosageUtilise, dosageUnite, dureeEffetsHeures, dureeEffetsMinutes, debutEffets, dureeEffetsCategorie, profilsEffets, effetsSecondaires, usagesPreferes, handleChange]);

    const toggleEffect = (effectId) => {
        setSelectedEffects(prev => {
            if (prev.includes(effectId)) {
                return prev.filter(id => id !== effectId);
            }
            if (prev.length >= 8) return prev;
            return [...prev, effectId];
        });
    };

    const toggleMultiSelect = (key, value) => {
        if (key === 'profilsEffets') {
            setProfilsEffets(prev => {
                const newVal = prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value];
                return newVal.length <= 8 ? newVal : prev;
            });
        } else if (key === 'effetsSecondaires') {
            setEffetsSecondaires(prev => {
                const newVal = prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value];
                return newVal.length <= 10 ? newVal : prev;
            });
        } else if (key === 'usagesPreferes') {
            setUsagesPreferes(prev => {
                const newVal = prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value];
                return newVal.length <= 10 ? newVal : prev;
            });
        }
    };

    const filteredEffects = getEffectsByFilter(categoryFilter, sentimentFilter);
    const profilsFiltres = EXPERIENCE_VALUES.profilsEffets.filter(p => {
        if (filterProfils === 'tous') return true;
        return p.type === filterProfils;
    });

    const getCategoryIcon = (categoryId) => {
        return EFFECTS_CATEGORIES[categoryId]?.icon || '•';
    };

    const getEffectBadgeColor = (effect) => {
        const categoryColor = EFFECTS_CATEGORIES[effect.category]?.color || '#6B7280';
        // Retourne un gradient basé sur la catégorie et le sentiment
        if (effect.sentiment === 'negative') {
            return `from-red-500 to-red-600`;
        }
        if (effect.category === 'mental') return `from-purple-500 to-purple-600`;
        if (effect.category === 'physical') return `from-green-500 to-green-600`;
        if (effect.category === 'therapeutic') return `from-blue-500 to-blue-600`;
        return `from-gray-500 to-gray-600`;
    };

    return (
        <div className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">💥 Effets Ressentis</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profil d'effets complet</p>
                </div>
            </div>

            {/* Montée, Intensité, Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Montée (rapidité)"
                        min={1}
                        max={10}
                        value={onset}
                        onChange={setOnset}
                        unit="/10"
                        helperText={ONSET_LEVELS[onset - 1]?.label}
                    />
                </div>

                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Intensité"
                        min={1}
                        max={10}
                        value={intensity}
                        onChange={setIntensity}
                        unit="/10"
                        helperText={INTENSITY_LEVELS[intensity - 1]?.label}
                    />
                </div>
            </div>

            {/* Durée des effets */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Durée des effets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setDuration(option.id)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${duration === option.id ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtres */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                </label>

                {/* Filtre par catégorie */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setCategoryFilter(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === null ? 'bg-gradient-to-br text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Toutes catégories
                    </button>
                    {Object.values(EFFECTS_CATEGORIES).map(category => (
                        <button
                            key={category.id}
                            onClick={() => setCategoryFilter(category.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${categoryFilter === category.id ? 'text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            style={categoryFilter === category.id ? { background: category.color } : {}}
                        >
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                        </button>
                    ))}
                </div>

                {/* Filtre par sentiment */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSentimentFilter(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sentimentFilter === null ? 'bg-gradient-to-br text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setSentimentFilter('positive')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sentimentFilter === 'positive' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        ✅ Positifs
                    </button>
                    <button
                        onClick={() => setSentimentFilter('negative')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sentimentFilter === 'negative' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        ⚠️ Négatifs
                    </button>
                    <button
                        onClick={() => setSentimentFilter('neutral')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sentimentFilter === 'neutral' ? ' text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        ⚕️ Thérapeutiques
                    </button>
                </div>
            </div>

            {/* Effets sélectionnés (max 8) */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Effets sélectionnés
                    </label>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${selectedEffects.length >= 8 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ' dark: dark:'}`}>
                        {selectedEffects.length}/8
                    </span>
                </div>

                {/* Badges sélectionnés */}
                {selectedEffects.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 dark: rounded-lg">
                        {selectedEffects.map(effectId => {
                            const effect = getAllEffects().find(e => e.id === effectId);
                            if (!effect) return null;
                            return (
                                <button
                                    key={effectId}
                                    onClick={() => toggleEffect(effectId)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all bg-gradient-to-br text-white hover:shadow-lg`}
                                    style={{
                                        backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
                                    }}
                                >
                                    <span>{getCategoryIcon(effect.category)}</span>
                                    <span>{effect.name}</span>
                                    <X className="w-3 h-3" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Grille d'effets */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {filteredEffects.map(effect => {
                        const isSelected = selectedEffects.includes(effect.id);
                        const isDisabled = !isSelected && selectedEffects.length >= 8;
                        const badgeColor = getEffectBadgeColor(effect);

                        return (
                            <button
                                key={effect.id}
                                onClick={() => !isDisabled && toggleEffect(effect.id)}
                                disabled={isDisabled}
                                className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isSelected ? `}bg-gradient-to-br ${badgeColor} text-white shadow-lg transform scale-105`
                                    : isDisabled
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <span>{getCategoryIcon(effect.category)}</span>
                                <span className="truncate">{effect.name}</span>
                                {isSelected && <Plus className="w-3 h-3 fill-current" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Résumé */}
            <div className="p-4 bg-gradient-to-br dark:/20 dark:/20 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Résumé des effets
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><span className="font-semibold">Montée :</span> {ONSET_LEVELS[onset - 1]?.label || `${onset}/10`} ({ONSET_LEVELS[onset - 1]?.time || ''})</p>
                    <p><span className="font-semibold">Intensité :</span> {INTENSITY_LEVELS[intensity - 1]?.label || `${intensity}/10`}</p>
                    <p><span className="font-semibold">Durée :</span> {DURATION_OPTIONS.find(d => d.id === duration)?.label || duration}</p>
                    <p><span className="font-semibold">Effets :</span> {selectedEffects.length} sélectionné(s)</p>
                </div>
            </div>

            {/* EXPÉRIENCE D'UTILISATION */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <button
                    onClick={() => setExpandExperience(!expandExperience)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Beaker className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🧪 Expérience d'utilisation</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Documentez vos tests de consommation</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${expandExperience ? 'rotate-180' : ''}`} />
                </button>

                {expandExperience && (
                    <div className="mt-4 space-y-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                        {/* Méthode de consommation */}
                        <div>
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">💨 Méthode de consommation *</label>
                            <select
                                value={methodeConsommation}
                                onChange={(e) => setMethodeConsommation(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Sélectionner une méthode...</option>
                                {EXPERIENCE_VALUES.methodeConsommation.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dosage & Durée */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">⚖️ Dosage</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={dosageUtilise}
                                        onChange={(e) => setDosageUtilise(e.target.value)}
                                        placeholder="0.0"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <select
                                        value={dosageUnite}
                                        onChange={(e) => setDosageUnite(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="g">g</option>
                                        <option value="mg">mg</option>
                                        <option value="ml">ml</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">⏱️ Durée des effets</label>
                                <div className="flex gap-2">
                                    <input type="number" min="0" max="23" value={dureeEffetsHeures} onChange={(e) => setDureeEffetsHeures(e.target.value)} placeholder="HH" className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <span className="text-gray-600 dark:text-gray-400 py-2">:</span>
                                    <input type="number" min="0" max="59" value={dureeEffetsMinutes} onChange={(e) => setDureeEffetsMinutes(e.target.value)} placeholder="MM" className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Début & Durée catégorie */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">🚀 Début des effets</label>
                                <select value={debutEffets} onChange={(e) => setDebutEffets(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Sélectionner...</option>
                                    {EXPERIENCE_VALUES.debutEffets.map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">⏰ Catégorie durée</label>
                                <select value={dureeEffetsCategorie} onChange={(e) => setDureeEffetsCategorie(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none">
                                    {EXPERIENCE_VALUES.dureeEffets.map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Profils d'effets */}
                        <div>
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">Profils d'effets ressentis (max 8)</label>
                            <div className="flex gap-2 mb-3">
                                {['tous', 'positif', 'negatif', 'neutre'].map(t => (
                                    <button key={t} onClick={() => setFilterProfils(t)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${filterProfils === t ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                        {t === 'tous' ? 'Tous' : t === 'positif' ? '✅ Positif' : t === 'negatif' ? '⚠️ Négatif' : '⚕️ Neutre'}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profilsFiltres.map(p => (
                                    <button key={p.value} onClick={() => toggleMultiSelect('profilsEffets', p.value)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${profilsEffets.includes(p.value) ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                        {p.label} {profilsEffets.includes(p.value) && '✓'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Effets secondaires */}
                        <div>
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">Effets secondaires (max 10)</label>
                            <div className="flex flex-wrap gap-2">
                                {EXPERIENCE_VALUES.effetsSecondaires.map(e => (
                                    <button key={e.value} onClick={() => toggleMultiSelect('effetsSecondaires', e.value)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${effetsSecondaires.includes(e.value) ? 'bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                        {e.label} {effetsSecondaires.includes(e.value) && '✓'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Usages préférés */}
                        <div>
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2 block">Usages préférés (max 10)</label>
                            <div className="flex flex-wrap gap-2">
                                {EXPERIENCE_VALUES.usagesPreferes.map(u => (
                                    <button key={u.value} onClick={() => toggleMultiSelect('usagesPreferes', u.value)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${usagesPreferes.includes(u.value) ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                        {u.label} {usagesPreferes.includes(u.value) && '✓'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
