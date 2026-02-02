import { useState } from 'react'
import { EXPERIENCE_VALUES } from '../../data/formValues'
import { LiquidCard, LiquidChip, LiquidSelect, LiquidInput, LiquidDivider } from '@/components/ui/LiquidUI'
import { Beaker, Zap, Clock, Target, AlertTriangle, Lightbulb } from 'lucide-react'

/**
 * ExperienceUtilisation - Section pour documenter les tests de consommation
 * Correspond à la section "Expérience d'utilisation durant les tests" du cahier des charges
 * Liquid Glass UI Design System
 */
export default function ExperienceUtilisation({ formData = {}, handleChange = () => { } }) {
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
        <LiquidCard glow="cyan" padding="lg" className="space-y-8">
            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Beaker className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">🧪 Expérience d'utilisation</h3>
                    <p className="text-sm text-white/50">Documentez vos tests de consommation</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Méthode de consommation */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <span className="text-lg">💨</span>
                    Méthode de consommation <span className="text-red-400">*</span>
                </label>
                <select
                    value={data.methodeConsommation || ''}
                    onChange={(e) => onChange('methodeConsommation', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
                >
                    <option value="" className="bg-gray-900">Sélectionner une méthode...</option>
                    {EXPERIENCE_VALUES.methodeConsommation.map(m => (
                        <option key={m.value} value={m.value} className="bg-gray-900">{m.label}</option>
                    ))}
                </select>
            </div>

            {/* Dosage & Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <span className="text-lg">⚖️</span>
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
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
                        />
                        <select
                            value={data.dosageUnite || 'g'}
                            onChange={(e) => onChange('dosageUnite', e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                        >
                            <option value="g" className="bg-gray-900">grammes (g)</option>
                            <option value="mg" className="bg-gray-900">milligrammes (mg)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        Durée des effets
                    </label>
                    <div className="flex gap-3 items-center">
                        <input
                            type="number"
                            min="0"
                            max="23"
                            value={data.dureeEffetsHeures || ''}
                            onChange={(e) => onChange('dureeEffetsHeures', e.target.value)}
                            placeholder="2"
                            className="w-20 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-green-500/50 outline-none transition-all text-center"
                        />
                        <span className="text-2xl font-bold text-white/40">:</span>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={data.dureeEffetsMinutes || ''}
                            onChange={(e) => onChange('dureeEffetsMinutes', e.target.value)}
                            placeholder="30"
                            className="w-20 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-green-500/50 outline-none transition-all text-center"
                        />
                        <span className="text-sm text-white/40 font-medium">HH:MM</span>
                    </div>
                </div>
            </div>

            {/* Début & Durée des effets (catégorie) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Début des effets
                    </label>
                    <select
                        value={data.debutEffets || ''}
                        onChange={(e) => onChange('debutEffets', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                    >
                        <option value="" className="bg-gray-900">Sélectionner...</option>
                        {EXPERIENCE_VALUES.debutEffets.map(d => (
                            <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Durée globale
                    </label>
                    <select
                        value={data.dureeEffetsCategorie || ''}
                        onChange={(e) => onChange('dureeEffetsCategorie', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                    >
                        <option value="" className="bg-gray-900">Sélectionner...</option>
                        {EXPERIENCE_VALUES.dureeEffets.map(d => (
                            <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <LiquidDivider />

            {/* Profils d'effets ressentis */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        Profils d'effets ressentis
                    </label>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${selectedProfils.length >= 8 ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {selectedProfils.length}/8
                    </span>
                </div>

                {/* Filtres par type */}
                <div className="flex gap-2 flex-wrap">
                    {['tous', 'positif', 'neutre', 'negatif'].map(f => (
                        <LiquidChip
                            key={f}
                            active={filter === f}
                            color={f === 'positif' ? 'green' : f === 'negatif' ? 'pink' : 'cyan'}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'tous' ? '🌐 Tous' :
                                f === 'positif' ? '✅ Positifs' :
                                    f === 'neutre' ? '➖ Neutres' : '❌ Négatifs'}
                        </LiquidChip>
                    ))}
                </div>

                {/* Grille de sélection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-3 bg-white/5 rounded-xl border border-white/10">
                    {profilsFiltres.map(profil => {
                        const isSelected = selectedProfils.includes(profil.value)
                        const chipColor = profil.type === 'positif' ? 'green' : profil.type === 'negatif' ? 'pink' : 'purple'

                        return (
                            <LiquidChip
                                key={profil.value}
                                active={isSelected}
                                color={chipColor}
                                onClick={() => toggleMultiSelect('profilsEffets', profil.value)}
                                size="sm"
                            >
                                <div className="flex flex-col items-start">
                                    <span>{profil.label}</span>
                                    <span className="text-[10px] opacity-60">{profil.categorie}</span>
                                </div>
                            </LiquidChip>
                        )
                    })}
                </div>
            </div>

            <LiquidDivider />

            {/* Effets secondaires */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        Effets secondaires ressentis
                    </label>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${selectedSecondaires.length >= 10 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {selectedSecondaires.length}/10
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {EXPERIENCE_VALUES.effetsSecondaires.map(effet => (
                        <LiquidChip
                            key={effet.value}
                            active={selectedSecondaires.includes(effet.value)}
                            color="amber"
                            onClick={() => toggleMultiSelect('effetsSecondaires', effet.value)}
                            size="sm"
                        >
                            {effet.label}
                        </LiquidChip>
                    ))}
                </div>
            </div>

            {/* Usages préférés */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-purple-400" />
                        Usage préféré / Contexte idéal
                    </label>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${selectedUsages.length >= 10 ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {selectedUsages.length}/10
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {EXPERIENCE_VALUES.usagesPreferes.map(usage => (
                        <LiquidChip
                            key={usage.value}
                            active={selectedUsages.includes(usage.value)}
                            color="purple"
                            onClick={() => toggleMultiSelect('usagesPreferes', usage.value)}
                            size="sm"
                        >
                            {usage.label}
                        </LiquidChip>
                    ))}
                </div>
            </div>

            {/* Note informative */}
            <div className="p-4 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-xl">
                <p className="text-sm text-white/60">
                    <span className="font-semibold text-cyan-400">💡 Conseil:</span> Ces informations aident la communauté à mieux comprendre les effets et usages recommandés pour ce cultivar.
                </p>
            </div>
        </LiquidCard>
    )
}



