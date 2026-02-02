import React, { useState, useEffect } from 'react';
import { TASTE_FAMILIES, getAllTasteNotes, TASTE_INTENSITY_LEVELS, AGGRESSIVENESS_LEVELS } from '../../data/tasteNotes';
import { Coffee, Sparkles, ArrowDown, ArrowUp, Wind, Plus, X } from 'lucide-react';
import { LiquidCard, LiquidRating, LiquidChip, LiquidDivider } from '@/components/ui/LiquidUI';

/**
 * Section Goûts pour Hash/Concentrés/Fleurs
 * Props: productType, formData, handleChange
 */
export default function TasteSection({ productType, formData = {}, handleChange }) {
    const data = formData.gouts || {};
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [intensity, setIntensity] = useState(data?.intensity || 5);
    const [aggressiveness, setAggressiveness] = useState(data?.aggressiveness || 5);
    const [dryPuffNotes, setDryPuffNotes] = useState(data?.dryPuffNotes || []);
    const [inhalationNotes, setInhalationNotes] = useState(data?.inhalationNotes || []);
    const [exhalationNotes, setExhalationNotes] = useState(data?.exhalationNotes || []);

    // Synchroniser avec parent
    useEffect(() => {
        if (!handleChange) return;
        handleChange('gouts', {
            intensity,
            aggressiveness,
            dryPuffNotes,
            inhalationNotes,
            exhalationNotes
        });
    }, [intensity, aggressiveness, dryPuffNotes, inhalationNotes, exhalationNotes, handleChange]);

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
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        {icon}
                        {title}
                    </label>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${notes.length >= maxCount ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {notes.length}/{maxCount}
                    </span>
                </div>

                {/* Notes sélectionnées */}
                {notes.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        {notes.map(noteId => {
                            const note = allNotes.find(n => n.id === noteId);
                            if (!note) return null;
                            return (
                                <LiquidChip
                                    key={noteId}
                                    active
                                    color="amber"
                                    onClick={() => toggleNote(noteId)}
                                    onRemove={() => toggleNote(noteId)}
                                >
                                    {note.icon || note.familyIcon} {note.name}
                                </LiquidChip>
                            );
                        })}
                    </div>
                )}

                {/* Grille de sélection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10">
                    {filteredNotes.map(note => {
                        const isSelected = notes.includes(note.id);
                        const isDisabled = !isSelected && notes.length >= maxCount;

                        return (
                            <LiquidChip
                                key={note.id}
                                active={isSelected}
                                color="amber"
                                onClick={() => !isDisabled && toggleNote(note.id)}
                                size="sm"
                            >
                                {note.icon || note.familyIcon} {note.name}
                            </LiquidChip>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <LiquidCard glow="amber" padding="lg" className="space-y-8">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Coffee className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">😋 Goûts</h3>
                    <p className="text-sm text-white/50">Profil gustatif détaillé</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Intensité et Agressivité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidRating
                        label="Intensité gustative"
                        value={intensity}
                        max={10}
                        color="amber"
                    />
                    <input
                        type="range"
                        min={1}
                        max={10}
                        value={intensity}
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full mt-3 accent-amber-500"
                    />
                    <p className="text-xs text-white/40 mt-2">{TASTE_INTENSITY_LEVELS[intensity - 1]?.label}</p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <LiquidRating
                        label="Agressivité / Piquant"
                        value={aggressiveness}
                        max={10}
                        color="amber"
                    />
                    <input
                        type="range"
                        min={1}
                        max={10}
                        value={aggressiveness}
                        onChange={(e) => setAggressiveness(parseInt(e.target.value))}
                        className="w-full mt-3 accent-orange-500"
                    />
                    <p className="text-xs text-white/40 mt-2">{AGGRESSIVENESS_LEVELS[aggressiveness - 1]?.label}</p>
                </div>
            </div>

            {/* Filtre par famille */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Filtrer par famille
                </label>
                <div className="flex flex-wrap gap-2">
                    <LiquidChip
                        active={selectedFamily === null}
                        color="amber"
                        onClick={() => setSelectedFamily(null)}
                    >
                        Toutes
                    </LiquidChip>
                    {Object.values(TASTE_FAMILIES).map(family => (
                        <LiquidChip
                            key={family.id}
                            active={selectedFamily === family.id}
                            color="amber"
                            onClick={() => setSelectedFamily(family.id)}
                        >
                            {family.icon} {family.label}
                        </LiquidChip>
                    ))}
                </div>
            </div>

            {/* Dry Puff / Tirage à sec (max 7) */}
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <NoteSelector
                    title="Dry puff / Tirage à sec"
                    icon={<Wind className="w-4 h-4 text-purple-400" />}
                    notes={dryPuffNotes}
                    toggleNote={toggleDryPuffNote}
                    color="purple"
                />
            </div>

            {/* Inhalation (max 7) */}
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <NoteSelector
                    title="Inhalation"
                    icon={<ArrowDown className="w-4 h-4 text-green-400" />}
                    notes={inhalationNotes}
                    toggleNote={toggleInhalationNote}
                    color="green"
                />
            </div>

            {/* Expiration / Arrière-goût (max 7) */}
            <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <NoteSelector
                    title="Expiration / Arrière-goût"
                    icon={<ArrowUp className="w-4 h-4 text-orange-400" />}
                    notes={exhalationNotes}
                    toggleNote={toggleExhalationNote}
                    color="orange"
                />
            </div>

            {/* Résumé */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Résumé gustatif
                </h4>
                <div className="text-sm text-white/60 space-y-1">
                    <p><span className="font-semibold text-white/80">Intensité :</span> {TASTE_INTENSITY_LEVELS[intensity - 1]?.label || `${intensity}/10`}</p>
                    <p><span className="font-semibold text-white/80">Agressivité :</span> {AGGRESSIVENESS_LEVELS[aggressiveness - 1]?.label || `${aggressiveness}/10`}</p>
                    <p><span className="font-semibold text-white/80">Dry puff :</span> {dryPuffNotes.length} note(s)</p>
                    <p><span className="font-semibold text-white/80">Inhalation :</span> {inhalationNotes.length} note(s)</p>
                    <p><span className="font-semibold text-white/80">Expiration :</span> {exhalationNotes.length} note(s)</p>
                </div>
            </div>

        </LiquidCard>
    );
}




