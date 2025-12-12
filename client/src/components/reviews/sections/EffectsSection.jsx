import React, { useState, useEffect } from 'react';
import { EFFECTS_CATEGORIES, getAllEffects, getEffectsByFilter, ONSET_LEVELS, INTENSITY_LEVELS, DURATION_OPTIONS } from '../../../data/effectsCategories';
import { Zap, Sparkles, Clock, Filter, Plus, X } from 'lucide-react';

/**
 * Section Effets Ressentis pour Hash/Concentrés/Fleurs
 * Props: productType, data, onChange
 */
export default function EffectsSection({ productType, data = {}, onChange }) {
  const [onset, setOnset] = useState(data?.onset || 5);
  const [intensity, setIntensity] = useState(data?.intensity || 5);
  const [duration, setDuration] = useState(data?.duration || '1-2h');
  const [selectedEffects, setSelectedEffects] = useState(data?.effects || []);
  
  // Filtres
  const [categoryFilter, setCategoryFilter] = useState(null); // null, 'mental', 'physical', 'therapeutic'
  const [sentimentFilter, setSentimentFilter] = useState(null); // null, 'positive', 'negative', 'neutral'

  // Synchroniser avec parent
  useEffect(() => {
    onChange({
      onset,
      intensity,
      duration,
      effects: selectedEffects
    });
  }, [onset, intensity, duration, selectedEffects]);

  const toggleEffect = (effectId) => {
    setSelectedEffects(prev => {
      if (prev.includes(effectId)) {
        return prev.filter(id => id !== effectId);
      }
      if (prev.length >= 8) return prev; // Max 8 effets
      return [...prev, effectId];
    });
  };

  const CustomSlider = ({ value, onChange, label, levels }) => {
    const displayLabel = levels[value - 1]?.label || label;
    const colorClass = levels[value - 1]?.color || 'text-gray-600';
    const extraInfo = levels[value - 1]?.time || '';

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className={`text-sm font-semibold ${colorClass}`}>{value}/10</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer 
                     slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 
                     slider-thumb:rounded-full slider-thumb:bg-gradient-to-br 
                     slider-thumb:from-purple-500 slider-thumb:to-pink-500 
                     slider-thumb:cursor-pointer slider-thumb:shadow-lg"
          />
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-xs ${colorClass} font-medium`}>{displayLabel}</p>
          {extraInfo && <p className="text-xs text-gray-500 dark:text-gray-400">{extraInfo}</p>}
        </div>
      </div>
    );
  };

  const filteredEffects = getEffectsByFilter(categoryFilter, sentimentFilter);

  const getEffectBadgeColor = (effect) => {
    if (effect.category === 'mental') {
      return effect.sentiment === 'positive' 
        ? 'from-purple-400 to-indigo-400' 
        : 'from-red-400 to-pink-400';
    }
    if (effect.category === 'physical') {
      return effect.sentiment === 'positive' 
        ? 'from-green-400 to-emerald-400' 
        : 'from-orange-400 to-red-400';
    }
    return 'from-blue-400 to-cyan-400'; // therapeutic
  };

  const getCategoryIcon = (categoryId) => {
    return EFFECTS_CATEGORIES[categoryId]?.icon || '•';
  };

  return (
    <div className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
      
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">💥 Effets Ressentis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Profil d'effets complet</p>
        </div>
      </div>

      {/* Montée, Intensité, Durée */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
          <CustomSlider
            value={onset}
            onChange={setOnset}
            label="Montée (rapidité)"
            levels={ONSET_LEVELS}
          />
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
          <CustomSlider
            value={intensity}
            onChange={setIntensity}
            label="Intensité"
            levels={INTENSITY_LEVELS}
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
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                duration === option.id
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === null
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Toutes catégories
          </button>
          {Object.values(EFFECTS_CATEGORIES).map(category => (
            <button
              key={category.id}
              onClick={() => setCategoryFilter(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                categoryFilter === category.id
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sentimentFilter === null
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSentimentFilter('positive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sentimentFilter === 'positive'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ✅ Positifs
          </button>
          <button
            onClick={() => setSentimentFilter('negative')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sentimentFilter === 'negative'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ⚠️ Négatifs
          </button>
          <button
            onClick={() => setSentimentFilter('neutral')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sentimentFilter === 'neutral'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            ⚕️ Thérapeutiques
          </button>
        </div>
      </div>

      {/* Effets sélectionnés (max 8) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Effets sélectionnés
          </label>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            selectedEffects.length >= 8 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            {selectedEffects.length}/8
          </span>
        </div>

        {/* Badges sélectionnés */}
        {selectedEffects.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg">
            {selectedEffects.map(effectId => {
              const effect = getAllEffects().find(e => e.id === effectId);
              if (!effect) return null;
              return (
                <button
                  key={effectId}
                  onClick={() => toggleEffect(effectId)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                           bg-gradient-to-br text-white hover:shadow-lg`}
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
                className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? `bg-gradient-to-br ${badgeColor} text-white shadow-lg transform scale-105`
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
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl space-y-2">
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Résumé des effets
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><span className="font-semibold">Montée :</span> {ONSET_LEVELS[onset - 1]?.label || `${onset}/10`} ({ONSET_LEVELS[onset - 1]?.time || ''})</p>
          <p><span className="font-semibold">Intensité :</span> {INTENSITY_LEVELS[intensity - 1]?.label || `${intensity}/10`}</p>
          <p><span className="font-semibold">Durée :</span> {DURATION_OPTIONS.find(d => d.id === duration)?.label || duration}</p>
          <p><span className="font-semibold">Effets :</span> {selectedEffects.length} sélectionné(s)</p>
        </div>
      </div>

    </div>
  );
}
