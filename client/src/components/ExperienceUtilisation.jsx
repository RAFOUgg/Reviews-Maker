import { useState } from 'react'
import { EXPERIENCE_VALUES } from '../../data/formValues'

/**
 * ExperienceUtilisation - Section pour documenter les tests de consommation
 * Correspond à la section "Expérience d'utilisation durant les tests" du cahier des charges
 */
export default function ExperienceUtilisation({ formData = {}, handleChange = () => {} }) {
    const data = formData.experience || {};
    const [filter, setFilter] = useState('tous')

    const selectedProfils = (data && data.profilsEffets) || []
    const selectedSecondaires = (data && data.effetsSecondaires) || []
    const selectedUsages = (data && data.usagesPreferes) || []

    const toggleMultiSelect = (key, value) => {
        const current = data[key] || []
        const newValue = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]

        // Limites selon le champ
        const maxLimits = {
            profilsEffets: 8,
            effetsSecondaires: 10,
            usagesPreferes: 10
        }

        if (newValue.length <= (maxLimits[key] || 10)) {
            const updatedData = { ...data, [key]: newValue };
            handleChange('experience', updatedData);
        }
    }

    // Wrapper pour les changements de form elements
    const onChange = (key, newValue) => {
        const updatedData = { ...data, [key]: newValue };
        handleChange('experience', updatedData);
    }

    // Filtrer les profils d'effets selon le filtre actif
    const profilsFiltres = EXPERIENCE_VALUES.profilsEffets.filter(p => {
        if (filter === 'tous') return true
        return p.type === filter
    })

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div className="bg-gradient-to-r p-6 rounded-2xl border-2 border-indigo-200">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>🧪</span> Expérience d'utilisation durant les tests
                </h3>
                <p className="text-sm">
                    Documentez vos tests de consommation pour aider la communauté
                </p>
            </div>

            {/* Méthode de consommation */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                    <span className="text-2xl">💨</span>
                    Méthode de consommation <span className="text-red-600">*</span>
                </label>
                <select
                    value={data.methodeConsommation || ''}
                    onChange={(e) => onChange('methodeConsommation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg"
                >
                    <option value="">à sélectionner une méthode...</option>
                    {EXPERIENCE_VALUES.methodeConsommation.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            {/* Dosage & Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                        <span className="text-2xl">⚖️</span>
                        Dosage utilisé
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.dosageUtilise || ''}
                            onChange={(e) => onChange('dosageUtilise', e.target.value)}
                            placeholder="0.5"
                            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                        />
                        <select
                            value={data.dosageUnite || 'g'}
                            onChange={(e) => onChange('dosageUnite', e.target.value)}
                            className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        >
                            <option value="g">grammes (g)</option>
                            <option value="mg">milligrammes (mg)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                        <span className="text-2xl">⏱️</span>
                        Durée des effets
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="number"
                            min="0"
                            max="23"
                            value={data.dureeEffetsHeures || ''}
                            onChange={(e) => onChange('dureeEffetsHeures', e.target.value)}
                            placeholder="2"
                            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-lg text-center"
                        />
                        <span className="flex items-center text-2xl font-bold text-gray-600 dark:text-gray-400">:</span>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={data.dureeEffetsMinutes || ''}
                            onChange={(e) => onChange('dureeEffetsMinutes', e.target.value)}
                            placeholder="30"
                            className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-lg text-center"
                        />
                        <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-medium">HH:MM</span>
                    </div>
                </div>
            </div>

            {/* Début & Durée des effets (catégorie) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        Début des effets
                    </label>
                    <select
                        value={data.debutEffets || ''}
                        onChange={(e) => onChange('debutEffets', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                    >
                        <option value="">Sélectionner...</option>
                        {EXPERIENCE_VALUES.debutEffets.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                        <span className="text-2xl">⏳</span>
                        Durée globale
                    </label>
                    <select
                        value={data.dureeEffetsCategorie || ''}
                        onChange={(e) => onChange('dureeEffetsCategorie', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-lg"
                    >
                        <option value="">Sélectionner...</option>
                        {EXPERIENCE_VALUES.dureeEffets.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Profils d'effets ressentis */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-4 block flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Profils d'effets ressentis (max 8) <span className="font-bold">{selectedProfils.length}/8</span>
                </label>

                {/* Filtres par type */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {['tous', 'positif', 'neutre', 'negatif'].map(f => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === f ? ' text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {f === 'tous' ? '🌐 Tous' :
                                f === 'positif' ? '✅ Positifs' :
                                    f === 'neutre' ? '➖ Neutres' : '❌ Négatifs'}
                        </button>
                    ))}
                </div>

                {/* Grille de sélection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-4 bg-gray-800/30 dark:bg-gray-800/50 rounded-xl border-2 border-gray-600/50 dark:border-gray-700">
                    {profilsFiltres.map(profil => {
                        const isSelected = selectedProfils.includes(profil.value)
                        const bgColor = isSelected ? (
                            profil.type === 'positif' ? 'bg-green-600 text-white' :
                                profil.type === 'neutre' ? 'bg-gray-600 text-white' :
                                    'bg-red-600 text-white'
                        ) : 'bg-gray-700/50 dark:bg-gray-800 border-2 border-gray-600 dark:border-gray-600 text-gray-200 dark:text-gray-300 hover:border-indigo-400'

                        return (
                            <button
                                key={profil.value}
                                type="button"
                                onClick={() => toggleMultiSelect('profilsEffets', profil.value)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md ${bgColor} ${isSelected ? 'scale-105' : ''}`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span>{profil.label}</span>
                                    {isSelected && <span>✓</span>}
                                </div>
                                <span className="text-xs opacity-75 block mt-1">{profil.categorie}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Effets secondaires */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-4 block flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Effets secondaires ressentis (max 10) <span className="text-orange-600 font-bold">{selectedSecondaires.length}/10</span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {EXPERIENCE_VALUES.effetsSecondaires.map(effet => (
                        <button
                            key={effet.value}
                            type="button"
                            onClick={() => toggleMultiSelect('effetsSecondaires', effet.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedSecondaires.includes(effet.value) ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400'}`}
                        >
                            {effet.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Usages préférés */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-4 block flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Usage préféré / Contexte idéal (max 10) <span className="font-bold">{selectedUsages.length}/10</span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {EXPERIENCE_VALUES.usagesPreferes.map(usage => (
                        <button
                            key={usage.value}
                            type="button"
                            onClick={() => toggleMultiSelect('usagesPreferes', usage.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedUsages.includes(usage.value) ? ' text-white shadow-lg scale-105' : 'bg-white border-2 border-gray-200 text-gray-700 hover:'}`}
                        >
                            {usage.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Note informative */}
            <div className="border-l-4 p-4 rounded-r-xl">
                <p className="text-sm">
                    <span className="font-semibold">💡 Conseil:</span> Ces informations aident la communauté à mieux comprendre les effets et usages recommandés pour ce cultivar.
                </p>
            </div>
        </div>
    )
}
