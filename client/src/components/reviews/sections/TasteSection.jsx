import React, { useState, useEffect } from 'react';
import { TASTE_FAMILIES, getAllTasteNotes, TASTE_INTENSITY_LEVELS, AGGRESSIVENESS_LEVELS } from '../../../data/tasteNotes';
import { Coffee, Sparkles, ArrowDown, ArrowUp, Wind, Plus, X } from 'lucide-react';
import WhiteSlider from '../../ui/WhiteSlider';

/**
 * Section Goûts pour Hash/Concentrés/Fleurs
 * Props: productType, data, onChange
 */
export default function TasteSection({ productType, data = {}, onChange }) {
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [intensity, setIntensity] = useState(data?.intensity || 5);
    const [aggressiveness, setAggressiveness] = useState(data?.aggressiveness || 5);
    const [dryPuffNotes, setDryPuffNotes] = useState(data?.dryPuffNotes || []);
    const [inhalationNotes, setInhalationNotes] = useState(data?.inhalationNotes || []);
    const [exhalationNotes, setExhalationNotes] = useState(data?.exhalationNotes || []);

    // Synchroniser avec parent
    useEffect(() => {
        onChange({
            intensity,
            aggressiveness,
            dryPuffNotes,
            inhalationNotes,
            exhalationNotes
        });
    }, [intensity, aggressiveness, dryPuffNotes, inhalationNotes, exhalationNotes]);

    const toggleDryPuffNote = (noteId) => {
        setDryPuffNotes(prev => {
            if (prev.includes(noteId)) {
                return prev.filter(id => id !== noteId);
            }
            if (prev.length >= 7) return prev;
            return [...prev, noteId];
        });
    };

    const toggleInhalationNote = (noteId) => {
        setInhalationNotes(prev => {
            if (prev.includes(noteId)) {
                return prev.filter(id => id !== noteId);
            }
            if (prev.length >= 7) return prev;
            return [...prev, noteId];
        });
    };

    const toggleExhalationNote = (noteId) => {
        setExhalationNotes(prev => {
            if (prev.includes(noteId)) {
                return prev.filter(id => id !== noteId);
            }
            if (prev.length >= 7) return prev;
            return [...prev, noteId];
        });
    };

    const allNotes = getAllTasteNotes();
    const filteredNotes = selectedFamily
        ? allNotes.filter(note => note.familyId === selectedFamily)
        : allNotes;

    const NoteSelector = ({ title, icon, notes, toggleNote, maxCount = 7, color }) => {
        return (
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        {icon}
                        {title}
                    </label>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${notes.length >= maxCount ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : `}bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`
                        }`}>
                        {notes.length}/{maxCount}
                    </span>
                </div>

                {/* Notes sélectionnées */}
                {notes.length > 0 && (
                    <div className={`flex flex-wrap gap-2 p-3 bg-${color}-50 dark:bg-${color}-900/10 rounded-lg`}>
                        {notes.map(noteId => {
                            const note = allNotes.find(n => n.id === noteId);
                            if (!note) return null;
                            return (
                                <button
                                    key={noteId}
                                    onClick={() => toggleNote(noteId)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all bg-gradient-to-br text-white hover:shadow-lg`}
                                    style={{
                                        backgroundImage: `linear-gradient(to bottom right, ${note.familyColor}, ${note.familyColor}dd)`
                                    }}
                                >
                                    <span>{note.icon || note.familyIcon}</span>
                                    <span>{note.name}</span>
                                    <X className="w-3 h-3" />
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Grille de sélection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {filteredNotes.map(note => {
                        const isSelected = notes.includes(note.id);
                        const isDisabled = !isSelected && notes.length >= maxCount;

                        return (
                            <button
                                key={note.id}
                                onClick={() => !isDisabled && toggleNote(note.id)}
                                disabled={isDisabled}
                                className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isSelected ? 'text-white shadow-lg transform scale-105' : isDisabled ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700'}`}
                                style={isSelected ? { background: note.familyColor } : {}}
                            >
                                <span>{note.icon || note.familyIcon}</span>
                                <span className="truncate">{note.name}</span>
                                {isSelected && <Plus className="w-3 h-3 fill-current" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br rounded-xl">
                    <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">😋 Goûts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profil gustatif détaillé</p>
                </div>
            </div>

            {/* Intensité et Agressivité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Intensité gustative"
                        min={1}
                        max={10}
                        value={intensity}
                        onChange={setIntensity}
                        unit="/10"
                        helperText={TASTE_INTENSITY_LEVELS[intensity - 1]?.label}
                    />
                </div>

                <div className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl">
                    <WhiteSlider
                        label="Agressivité / Piquant"
                        min={1}
                        max={10}
                        value={aggressiveness}
                        onChange={setAggressiveness}
                        unit="/10"
                        helperText={AGGRESSIVENESS_LEVELS[aggressiveness - 1]?.label}
                    />
                </div>
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFamily === null ? 'bg-gradient-to-br text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Toutes
                    </button>
                    {Object.values(TASTE_FAMILIES).map(family => (
                        <button
                            key={family.id}
                            onClick={() => setSelectedFamily(family.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedFamily === family.id ? 'text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            style={selectedFamily === family.id ? { background: family.color } : {}}
                        >
                            <span>{family.icon}</span>
                            <span>{family.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dry Puff / Tirage à sec (max 7) */}
            <div className="p-4 bg-gradient-to-br dark:/20 dark:/20 rounded-xl">
                <NoteSelector
                    title="Dry puff / Tirage à sec"
                    icon={<Wind className="w-4 h-4" />}
                    notes={dryPuffNotes}
                    toggleNote={toggleDryPuffNote}
                    color="purple"
                />
            </div>

            {/* Inhalation (max 7) */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <NoteSelector
                    title="Inhalation"
                    icon={<ArrowDown className="w-4 h-4 text-green-500" />}
                    notes={inhalationNotes}
                    toggleNote={toggleInhalationNote}
                    color="green"
                />
            </div>

            {/* Expiration / Arrière-goût (max 7) */}
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
                <NoteSelector
                    title="Expiration / Arrière-goût"
                    icon={<ArrowUp className="w-4 h-4 text-orange-500" />}
                    notes={exhalationNotes}
                    toggleNote={toggleExhalationNote}
                    color="orange"
                />
            </div>

            {/* Résumé */}
            <div className="p-4 bg-gradient-to-br dark:/20 dark:/20 rounded-xl space-y-2">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Résumé gustatif
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><span className="font-semibold">Intensité :</span> {TASTE_INTENSITY_LEVELS[intensity - 1]?.label || `${intensity}/10`}</p>
                    <p><span className="font-semibold">Agressivité :</span> {AGGRESSIVENESS_LEVELS[aggressiveness - 1]?.label || `${aggressiveness}/10`}</p>
                    <p><span className="font-semibold">Dry puff :</span> {dryPuffNotes.length} note(s)</p>
                    <p><span className="font-semibold">Inhalation :</span> {inhalationNotes.length} note(s)</p>
                    <p><span className="font-semibold">Expiration :</span> {exhalationNotes.length} note(s)</p>
                </div>
            </div>

        </div>
    );
}
