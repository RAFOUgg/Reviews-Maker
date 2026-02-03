import React, { useState, useEffect } from 'react';
import { EFFECTS_CATEGORIES, ONSET_LEVELS, INTENSITY_LEVELS, DURATION_OPTIONS } from '../../data/effectsCategories';
import { EXPERIENCE_VALUES } from '../../data/formValues';
import { Zap, Sparkles, Clock, Beaker, ChevronDown } from 'lucide-react';
import { LiquidCard, LiquidChip, LiquidDivider } from '@/components/ui/LiquidUI';
import LiquidSlider from '@/components/ui/LiquidSlider';
import EffectsWheelPicker from '@/components/shared/charts/EffectsWheelPicker';

/**
 * Section Effets Ressentis + Expérience d'Utilisation (FUSIONNÉE)
 * Inclut: Montée, Intensité, Durée, Effets + Expérience consommation
 * Props: productType, data (ou formData), onChange (ou handleChange)
 * Support des deux patterns d'appel pour compatibilité
 */
export default function EffectsSection({ productType, data: directData, onChange, formData, handleChange }) {
    // Support des deux patterns : data/onChange OU formData/handleChange
    const effectsData = directData || formData?.effets || {};

    // Créer un handler sûr qui vérifie l'existence des fonctions
    const updateHandler = (newData) => {
        if (typeof onChange === 'function') {
            onChange(newData);
        } else if (typeof handleChange === 'function') {
            handleChange('effets', newData);
        }
    };

    // EFFETS RESSENTIS
    const [onset, setOnset] = useState(effectsData?.onset || 5);
    const [intensity, setIntensity] = useState(effectsData?.intensity || 5);
    const [duration, setDuration] = useState(effectsData?.duration || '1-2h');
    const [selectedEffects, setSelectedEffects] = useState(effectsData?.effects || []);

    // EXPÉRIENCE D'UTILISATION
    const [methodeConsommation, setMethodeConsommation] = useState(effectsData?.methodeConsommation || '');
    const [dosageUtilise, setDosageUtilise] = useState(effectsData?.dosageUtilise || '');
    const [dosageUnite, setDosageUnite] = useState(effectsData?.dosageUnite || 'g');
    const [dureeEffetsHeures, setDureeEffetsHeures] = useState(effectsData?.dureeEffetsHeures || '');
    const [dureeEffetsMinutes, setDureeEffetsMinutes] = useState(effectsData?.dureeEffetsMinutes || '');
    const [debutEffets, setDebutEffets] = useState(effectsData?.debutEffets || '');
    const [dureeEffetsCategorie, setDureeEffetsCategorie] = useState(effectsData?.dureeEffetsCategorie || 'moyenne');
    const [profilsEffets, setProfilsEffets] = useState(effectsData?.profilsEffets || []);
    const [effetsSecondaires, setEffetsSecondaires] = useState(effectsData?.effetsSecondaires || []);
    const [usagesPreferes, setUsagesPreferes] = useState(effectsData?.usagesPreferes || []);
    const [filterProfils, setFilterProfils] = useState('tous');
    const [expandExperience, setExpandExperience] = useState(false);

    // Synchroniser avec parent
    useEffect(() => {
        updateHandler({
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
    }, [onset, intensity, duration, selectedEffects, methodeConsommation, dosageUtilise, dosageUnite, dureeEffetsHeures, dureeEffetsMinutes, debutEffets, dureeEffetsCategorie, profilsEffets, effetsSecondaires, usagesPreferes]);

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

    const profilsFiltres = EXPERIENCE_VALUES.profilsEffets.filter(p => {
        if (filterProfils === 'tous') return true;
        return p.type === filterProfils;
    });

    return (
        <LiquidCard glow="cyan" padding="lg" className="space-y-8">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">💥 Effets Ressentis</h3>
                    <p className="text-sm text-white/50">Profil d'effets complet</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Montée, Intensité, Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Montée (rapidité)"
                        value={onset}
                        min={1}
                        max={10}
                        step={1}
                        color="cyan"
                        onChange={(val) => setOnset(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{ONSET_LEVELS[onset - 1]?.label}</p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidSlider
                        label="Intensité"
                        value={intensity}
                        min={1}
                        max={10}
                        step={1}
                        color="cyan"
                        onChange={(val) => setIntensity(val)}
                    />
                    <p className="text-xs text-white/40 mt-2">{INTENSITY_LEVELS[intensity - 1]?.label}</p>
                </div>
            </div>

            {/* Durée des effets */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Durée des effets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map(option => (
                        <LiquidChip
                            key={option.id}
                            active={duration === option.id}
                            color="cyan"
                            onClick={() => setDuration(option.id)}
                        >
                            {option.label}
                        </LiquidChip>
                    ))}
                </div>
            </div>

            {/* Sélecteur d'effets avec le nouveau picker */}
            <EffectsWheelPicker
                selectedEffects={selectedEffects}
                onChange={setSelectedEffects}
                max={8}
                title="💥 Sélectionner des effets"
                helper="Choisissez jusqu'à 8 effets ressentis"
            />

            {/* Résumé */}
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Résumé des effets
                </h4>
                <div className="text-sm text-white/60 space-y-1">
                    <p><span className="font-semibold text-white/80">Montée :</span> {ONSET_LEVELS[onset - 1]?.label || `${onset}/10`} ({ONSET_LEVELS[onset - 1]?.time || ''})</p>
                    <p><span className="font-semibold text-white/80">Intensité :</span> {INTENSITY_LEVELS[intensity - 1]?.label || `${intensity}/10`}</p>
                    <p><span className="font-semibold text-white/80">Durée :</span> {DURATION_OPTIONS.find(d => d.id === duration)?.label || duration}</p>
                    <p><span className="font-semibold text-white/80">Effets :</span> {selectedEffects.length} sélectionné(s)</p>
                </div>
            </div>

            <LiquidDivider />

            {/* EXPÉRIENCE D'UTILISATION */}
            <div className="pt-4">
                <button
                    type="button"
                    onClick={() => setExpandExperience(!expandExperience)}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <Beaker className="w-5 h-5 text-cyan-400" />
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-white">🧪 Expérience d'utilisation</h3>
                            <p className="text-sm text-white/50">Documentez vos tests de consommation</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform ${expandExperience ? 'rotate-180' : ''}`} />
                </button>

                {expandExperience && (
                    <div className="mt-4 space-y-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        {/* Méthode de consommation */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 flex items-center gap-2">💨 Méthode de consommation *</label>
                            <select
                                value={methodeConsommation}
                                onChange={(e) => setMethodeConsommation(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                            >
                                <option value="" className="bg-gray-900">Sélectionner une méthode...</option>
                                {EXPERIENCE_VALUES.methodeConsommation.map(m => (
                                    <option key={m.value} value={m.value} className="bg-gray-900">{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dosage & Durée */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">⚖️ Dosage</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={dosageUtilise}
                                        onChange={(e) => setDosageUtilise(e.target.value)}
                                        placeholder="0.0"
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 outline-none"
                                    />
                                    <select
                                        value={dosageUnite}
                                        onChange={(e) => setDosageUnite(e.target.value)}
                                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 outline-none"
                                    >
                                        <option value="g" className="bg-gray-900">g</option>
                                        <option value="mg" className="bg-gray-900">mg</option>
                                        <option value="ml" className="bg-gray-900">ml</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">⏱️ Durée des effets</label>
                                <div className="flex gap-2 items-center">
                                    <input type="number" min="0" max="23" value={dureeEffetsHeures} onChange={(e) => setDureeEffetsHeures(e.target.value)} placeholder="HH" className="w-16 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-center" />
                                    <span className="text-white/40 py-2">:</span>
                                    <input type="number" min="0" max="59" value={dureeEffetsMinutes} onChange={(e) => setDureeEffetsMinutes(e.target.value)} placeholder="MM" className="w-16 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-center" />
                                </div>
                            </div>
                        </div>

                        {/* Début & Durée catégorie */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">🚀 Début des effets</label>
                                <select value={debutEffets} onChange={(e) => setDebutEffets(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none">
                                    <option value="" className="bg-gray-900">Sélectionner...</option>
                                    {EXPERIENCE_VALUES.debutEffets.map(d => (
                                        <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/80">⏰ Catégorie durée</label>
                                <select value={dureeEffetsCategorie} onChange={(e) => setDureeEffetsCategorie(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none">
                                    {EXPERIENCE_VALUES.dureeEffets.map(d => (
                                        <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Profils d'effets */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/80">Profils d'effets ressentis (max 8)</label>
                            <div className="flex gap-2 flex-wrap">
                                {['tous', 'positif', 'negatif', 'neutre'].map(t => (
                                    <LiquidChip
                                        key={t}
                                        active={filterProfils === t}
                                        color={t === 'positif' ? 'green' : t === 'negatif' ? 'pink' : 'cyan'}
                                        onClick={() => setFilterProfils(t)}
                                    >
                                        {t === 'tous' ? 'Tous' : t === 'positif' ? '✅ Positif' : t === 'negatif' ? '⚠️ Négatif' : '⚕️ Neutre'}
                                    </LiquidChip>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                                {profilsFiltres.map(p => (
                                    <LiquidChip
                                        key={p.value}
                                        active={profilsEffets.includes(p.value)}
                                        color={p.type === 'positif' ? 'green' : p.type === 'negatif' ? 'pink' : 'purple'}
                                        onClick={() => toggleMultiSelect('profilsEffets', p.value)}
                                        size="sm"
                                    >
                                        {p.label}
                                    </LiquidChip>
                                ))}
                            </div>
                        </div>

                        {/* Effets secondaires */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/80">Effets secondaires (max 10)</label>
                            <div className="flex flex-wrap gap-2">
                                {EXPERIENCE_VALUES.effetsSecondaires.map(e => (
                                    <LiquidChip
                                        key={e.value}
                                        active={effetsSecondaires.includes(e.value)}
                                        color="amber"
                                        onClick={() => toggleMultiSelect('effetsSecondaires', e.value)}
                                        size="sm"
                                    >
                                        {e.label}
                                    </LiquidChip>
                                ))}
                            </div>
                        </div>

                        {/* Usages préférés */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/80">Usages préférés (max 10)</label>
                            <div className="flex flex-wrap gap-2">
                                {EXPERIENCE_VALUES.usagesPreferes.map(u => (
                                    <LiquidChip
                                        key={u.value}
                                        active={usagesPreferes.includes(u.value)}
                                        color="purple"
                                        onClick={() => toggleMultiSelect('usagesPreferes', u.value)}
                                        size="sm"
                                    >
                                        {u.label}
                                    </LiquidChip>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </LiquidCard>
    );
}





