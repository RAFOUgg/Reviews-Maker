import { useState, useEffect } from 'react';
import LiquidSlider from '../../LiquidSlider';
import { EFFECTS } from '../../../data/effects';

/**
 * Section unifiée : Effets Ressentis + Expérience d'Utilisation
 * Fusionne les anciennes sections "Effets" et "Expérience" pour conformité CDC
 */

const CONSUMPTION_METHODS = [
    { value: 'combustion', label: '🔥 Combustion (joint, pipe, bong)' },
    { value: 'vaporisation', label: '💨 Vaporisation' },
    { value: 'infusion', label: '☕ Infusion' },
    { value: 'edible', label: '🍰 Comestible' },
    { value: 'concentre', label: '💎 Concentré (dab)' }
];

const DURATION_OPTIONS = [
    { value: '5-15min', label: '5-15 min (très court)' },
    { value: '15-30min', label: '15-30 min (court)' },
    { value: '30-60min', label: '30-60 min (moyen)' },
    { value: '1-2h', label: '1-2h (long)' },
    { value: '2-4h', label: '2-4h (très long)' },
    { value: '4h+', label: '4h+ (persistant)' }
];

const ONSET_TIME = [
    { value: 'immediat', label: '⚡ Immédiat (< 30s)' },
    { value: 'rapide', label: '🚀 Rapide (30s - 2min)' },
    { value: 'moyen', label: '⏱️ Moyen (2-5min)' },
    { value: 'differe', label: '🕐 Différé (5-15min)' },
    { value: 'lent', label: '🐌 Lent (15min+)' }
];

const USAGE_CONTEXT = [
    { value: 'matin', label: '🌅 Matin' },
    { value: 'journee', label: '☀️ Journée' },
    { value: 'apres-midi', label: '🌤️ Après-midi' },
    { value: 'soiree', label: '🌆 Soirée' },
    { value: 'nuit', label: '🌙 Nuit' },
    { value: 'seul', label: '🧘 Seul' },
    { value: 'social', label: '👥 Social' },
    { value: 'medical', label: '⚕️ Médical' },
    { value: 'recreatif', label: '🎉 Récréatif' }
];

export default function EffectsAndExperienceSection({ data, onChange }) {
    // États Effets
    const [intensityRating, setIntensityRating] = useState(data?.intensity || 5);
    const [onsetRating, setOnsetRating] = useState(data?.onset || 5);
    const [selectedEffects, setSelectedEffects] = useState(data?.effects || []);
    const [effectsFilter, setEffectsFilter] = useState('all'); // all, mental, physical, therapeutic, positive, negative

    // États Expérience
    const [consumptionMethod, setConsumptionMethod] = useState(data?.consumptionMethod || '');
    const [dosage, setDosage] = useState(data?.dosage || '');
    const [duration, setDuration] = useState(data?.duration || '');
    const [onsetTime, setOnsetTime] = useState(data?.onsetTime || '');
    const [usageContext, setUsageContext] = useState(data?.usageContext || []);

    // Synchroniser avec parent
    useEffect(() => {
        const effectsData = {
            // Effets
            intensity: intensityRating,
            onset: onsetRating,
            effects: selectedEffects,

            // Expérience
            consumptionMethod,
            dosage,
            duration,
            onsetTime,
            usageContext
        };
        onChange?.(effectsData);
    }, [intensityRating, onsetRating, selectedEffects, consumptionMethod, dosage, duration, onsetTime, usageContext, onChange]);

    // Filtrer les effets selon le filtre actif
    const filteredEffects = EFFECTS.filter(effect => {
        if (effectsFilter === 'all') return true;
        if (effectsFilter === 'positive') return effect.tag === 'positif';
        if (effectsFilter === 'negative') return effect.tag === 'négatif';
        if (effectsFilter === 'neutral') return effect.tag === 'neutre';
        return effect.category === effectsFilter;
    });

    // Toggle selection d'un effet
    const toggleEffect = (effectKey) => {
        setSelectedEffects(prev => {
            if (prev.includes(effectKey)) {
                return prev.filter(e => e !== effectKey);
            }
            if (prev.length >= 8) {
                return prev; // Maximum 8 effets
            }
            return [...prev, effectKey];
        });
    };

    // Toggle context d'usage
    const toggleContext = (contextValue) => {
        setUsageContext(prev => {
            if (prev.includes(contextValue)) {
                return prev.filter(c => c !== contextValue);
            }
            return [...prev, contextValue];
        });
    };

    return (
        <div className="space-y-6 bg-gray-900/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">💥 Effets & Expérience</h3>
                    <p className="text-sm text-gray-400">Effets ressentis et conditions d'utilisation</p>
                </div>
            </div>

            {/* SECTION 1 : PARAMÈTRES DE CONSOMMATION */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-violet-400 uppercase tracking-wide flex items-center gap-2">
                    ⚙️ Paramètres de Consommation
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Méthode de consommation */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                            Méthode de consommation
                        </label>
                        <select
                            value={consumptionMethod}
                            onChange={(e) => setConsumptionMethod(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="" className="bg-gray-800">-- Sélectionner --</option>
                            {CONSUMPTION_METHODS.map(method => (
                                <option key={method.value} value={method.value} className="bg-gray-800">
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dosage */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                            Dosage estimé (mg ou g)
                        </label>
                        <input
                            type="text"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            placeholder="Ex: 0.5g ou 100mg"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    {/* Début des effets */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                            Début des effets
                        </label>
                        <select
                            value={onsetTime}
                            onChange={(e) => setOnsetTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="" className="bg-gray-800">-- Sélectionner --</option>
                            {ONSET_TIME.map(time => (
                                <option key={time.value} value={time.value} className="bg-gray-800">
                                    {time.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Durée totale */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                            Durée totale des effets
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="" className="bg-gray-800">-- Sélectionner --</option>
                            {DURATION_OPTIONS.map(dur => (
                                <option key={dur.value} value={dur.value} className="bg-gray-800">
                                    {dur.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Contextes d'usage (multi-select) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-3">
                        Usage préféré (plusieurs choix possibles)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {USAGE_CONTEXT.map(context => {
                            const isSelected = usageContext.includes(context.value);
                            return (
                                <button
                                    key={context.value}
                                    type="button"
                                    onClick={() => toggleContext(context.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                            ? 'bg-violet-500 text-white shadow-lg'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    {context.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* SECTION 2 : INTENSITÉ & MONTÉE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Montée (rapidité) */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-200">⚡ Montée (rapidité)</label>
                        <span className="text-lg font-bold text-orange-400">{onsetRating}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={onsetRating}
                        onChange={(e) => setOnsetRating(parseInt(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-2">Rapidité d'apparition des effets</p>
                </div>

                {/* Intensité */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-200">💥 Intensité</label>
                        <span className="text-lg font-bold text-orange-400">{intensityRating}/10</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={intensityRating}
                        onChange={(e) => setIntensityRating(parseInt(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-2">Puissance globale des effets</p>
                </div>
            </div>

            {/* SECTION 3 : EFFETS RESSENTIS */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-violet-400 uppercase tracking-wide">
                        🎯 Effets Ressentis (max 8)
                    </h4>
                    <span className="text-xs text-gray-400">
                        {selectedEffects.length}/8 sélectionnés
                    </span>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setEffectsFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${effectsFilter === 'all'
                                ? 'bg-violet-500 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setEffectsFilter('mental')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${effectsFilter === 'mental'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        🧠 Mentaux
                    </button>
                    <button
                        onClick={() => setEffectsFilter('physical')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${effectsFilter === 'physical'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        💪 Physiques
                    </button>
                    <button
                        onClick={() => setEffectsFilter('therapeutic')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${effectsFilter === 'therapeutic'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        ⚕️ Thérapeutiques
                    </button>
                    <div className="ml-auto flex gap-2">
                        <button
                            onClick={() => setEffectsFilter('positive')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${effectsFilter === 'positive'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                        >
                            ✅ Positifs
                        </button>
                        <button
                            onClick={() => setEffectsFilter('negative')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${effectsFilter === 'negative'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                }`}
                        >
                            ⚠️ Négatifs
                        </button>
                    </div>
                </div>

                {/* Liste des effets */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
                    {filteredEffects.map(effect => {
                        const isSelected = selectedEffects.includes(effect.key);
                        const isDisabled = !isSelected && selectedEffects.length >= 8;

                        return (
                            <button
                                key={effect.key}
                                type="button"
                                onClick={() => toggleEffect(effect.key)}
                                disabled={isDisabled}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${isSelected
                                        ? 'bg-violet-500 text-white shadow-lg'
                                        : isDisabled
                                            ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}
                            >
                                <span className="mr-1">{effect.emoji}</span>
                                {effect.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Résumé */}
            <div className="mt-6 p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30">
                <h4 className="text-sm font-semibold mb-3 text-white">📊 Résumé Expérience</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                        <span className="text-gray-400">Montée :</span>
                        <span className="ml-2 font-bold text-white">{onsetRating}/10</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Intensité :</span>
                        <span className="ml-2 font-bold text-white">{intensityRating}/10</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Effets :</span>
                        <span className="ml-2 font-bold text-white">{selectedEffects.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-400">Méthode :</span>
                        <span className="ml-2 font-bold text-white">
                            {consumptionMethod ? CONSUMPTION_METHODS.find(m => m.value === consumptionMethod)?.label.split(' ')[1] : '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
