import React, { useState, useEffect } from 'react';
import { ODOR_FAMILIES, getAllOdorNotes, AROMA_INTENSITY_LEVELS } from '../../../data/odorNotes';
import { Flower2, Sparkles, Star, Plus, X } from 'lucide-react';

/**
 * Section Odeurs pour Hash/Concentrés/Fleurs
 * Props: productType, data, onChange
 */
export default function OdorSection({ productType, data = {}, onChange }) {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [dominantNotes, setDominantNotes] = useState(data?.dominantNotes || []);
  const [secondaryNotes, setSecondaryNotes] = useState(data?.secondaryNotes || []);
  const [intensity, setIntensity] = useState(data?.intensity || 5);
  const [fidelity, setFidelity] = useState(data?.fidelity || 5);

  // Synchroniser avec parent
  useEffect(() => {
    onChange({
      dominantNotes,
      secondaryNotes,
      intensity,
      fidelity
    });
  }, [dominantNotes, secondaryNotes, intensity, fidelity]);

  const toggleDominantNote = (noteId) => {
    setDominantNotes(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(id => id !== noteId);
      }
      if (prev.length >= 7) return prev;
      return [...prev, noteId];
    });
  };

  const toggleSecondaryNote = (noteId) => {
    setSecondaryNotes(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(id => id !== noteId);
      }
      if (prev.length >= 7) return prev;
      return [...prev, noteId];
    });
  };

  const CustomSlider = ({ value, onChange, label, max = 10 }) => {
    const displayLabel = AROMA_INTENSITY_LEVELS[value - 1]?.label || label;
    const colorClass = AROMA_INTENSITY_LEVELS[value - 1]?.color || 'text-gray-600';

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className={`text-sm font-semibold ${colorClass}`}>{value}/{max}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer 
                     slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 
                     slider-thumb:rounded-full slider-thumb:bg-gradient-to-br 
                     slider-thumb:from-purple-500 slider-thumb:to-pink-500 
                     slider-thumb:cursor-pointer slider-thumb:shadow-lg"
          />
        </div>
        <p className={`text-xs text-center ${colorClass} font-medium`}>{displayLabel}</p>
      </div>
    );
  };

  const allNotes = getAllOdorNotes();
  const filteredNotes = selectedFamily 
    ? allNotes.filter(note => note.familyId === selectedFamily)
    : allNotes;

  return (
    <div className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
      
      {/* En-tête */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
          <Flower2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">👃 Odeurs</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Profil aromatique complet</p>
        </div>
      </div>

      {/* Fidélité cultivars (Hash/Concentrés uniquement) */}
      {(productType === 'Hash' || productType === 'Concentré') && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
          <CustomSlider
            value={fidelity}
            onChange={setFidelity}
            label="Fidélité aux cultivars"
          />
        </div>
      )}

      {/* Intensité aromatique */}
      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
        <CustomSlider
          value={intensity}
          onChange={setIntensity}
          label="Intensité aromatique"
        />
      </div>

      {/* Filtre par famille */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Filtrer par famille
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFamily(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFamily === null
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Toutes
          </button>
          {Object.values(ODOR_FAMILIES).map(family => (
            <button
              key={family.id}
              onClick={() => setSelectedFamily(family.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedFamily === family.id
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={selectedFamily === family.id ? { background: family.color } : {}}
            >
              <span>{family.icon}</span>
              <span>{family.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes dominantes (max 7) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Notes dominantes
          </label>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            dominantNotes.length >= 7 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            {dominantNotes.length}/7
          </span>
        </div>

        {/* Notes sélectionnées */}
        {dominantNotes.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            {dominantNotes.map(noteId => {
              const note = allNotes.find(n => n.id === noteId);
              if (!note) return null;
              return (
                <button
                  key={noteId}
                  onClick={() => toggleDominantNote(noteId)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                           bg-gradient-to-br from-yellow-400 to-orange-400 text-white hover:shadow-lg"
                >
                  <span>{note.familyIcon}</span>
                  <span>{note.name}</span>
                  <X className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        )}

        {/* Grille de sélection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {filteredNotes.map(note => {
            const isSelected = dominantNotes.includes(note.id);
            const isDisabled = !isSelected && dominantNotes.length >= 7;
            
            return (
              <button
                key={note.id}
                onClick={() => !isDisabled && toggleDominantNote(note.id)}
                disabled={isDisabled}
                className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'text-white shadow-lg transform scale-105'
                    : isDisabled
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700'
                }`}
                style={isSelected ? { background: note.familyColor } : {}}
              >
                <span>{note.familyIcon}</span>
                <span className="truncate">{note.name}</span>
                {isSelected && <Star className="w-3 h-3 fill-current" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes secondaires (max 7) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-500" />
            Notes secondaires
          </label>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            secondaryNotes.length >= 7 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            {secondaryNotes.length}/7
          </span>
        </div>

        {/* Notes sélectionnées */}
        {secondaryNotes.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            {secondaryNotes.map(noteId => {
              const note = allNotes.find(n => n.id === noteId);
              if (!note) return null;
              return (
                <button
                  key={noteId}
                  onClick={() => toggleSecondaryNote(noteId)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                           bg-gradient-to-br from-blue-400 to-cyan-400 text-white hover:shadow-lg"
                >
                  <span>{note.familyIcon}</span>
                  <span>{note.name}</span>
                  <X className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        )}

        {/* Grille de sélection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {filteredNotes.map(note => {
            const isSelected = secondaryNotes.includes(note.id);
            const isDisabled = !isSelected && secondaryNotes.length >= 7;
            
            return (
              <button
                key={note.id}
                onClick={() => !isDisabled && toggleSecondaryNote(note.id)}
                disabled={isDisabled}
                className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'text-white shadow-lg transform scale-105'
                    : isDisabled
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700'
                }`}
                style={isSelected ? { background: note.familyColor } : {}}
              >
                <span>{note.familyIcon}</span>
                <span className="truncate">{note.name}</span>
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
          Résumé aromatique
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><span className="font-semibold">Intensité :</span> {AROMA_INTENSITY_LEVELS[intensity - 1]?.label || `${intensity}/10`}</p>
          {(productType === 'Hash' || productType === 'Concentré') && (
            <p><span className="font-semibold">Fidélité cultivars :</span> {fidelity}/10</p>
          )}
          <p><span className="font-semibold">Notes dominantes :</span> {dominantNotes.length} sélectionnée(s)</p>
          <p><span className="font-semibold">Notes secondaires :</span> {secondaryNotes.length} sélectionnée(s)</p>
        </div>
      </div>

    </div>
  );
}
