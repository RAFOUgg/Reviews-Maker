import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, Layout, Type, Palette } from 'lucide-react';

/**
 * CreateTemplateModal — Multi-step glassmorphism wizard for creating custom templates
 * Step 1: Choose name + description
 * Step 2: Choose supported formats (ratios)
 * Step 3: Confirm & create
 */

const RATIO_OPTIONS = [
    { id: '1:1', label: 'Carré', icon: '⬜', desc: '800×800 — Réseaux sociaux' },
    { id: '16:9', label: 'Paysage', icon: '▭', desc: '1920×1080 — Présentation' },
    { id: '9:16', label: 'Portrait', icon: '▯', desc: '1080×1920 — Story / Reel' },
    { id: '4:3', label: 'Standard', icon: '▭', desc: '1600×1200 — Photo classique' },
    { id: 'A4', label: 'A4', icon: '📄', desc: '1754×2480 — Document imprimable' },
];

const STEPS = [
    { id: 'info', label: 'Informations', icon: Type },
    { id: 'formats', label: 'Formats', icon: Layout },
    { id: 'confirm', label: 'Confirmer', icon: Check },
];

export default function CreateTemplateModal({ isOpen, onClose, onCreateTemplate }) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedRatios, setSelectedRatios] = useState(['1:1']);
    const [defaultRatio, setDefaultRatio] = useState('1:1');

    const reset = useCallback(() => {
        setStep(0);
        setName('');
        setDescription('');
        setSelectedRatios(['1:1']);
        setDefaultRatio('1:1');
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [onClose, reset]);

    const handleCreate = useCallback(() => {
        if (!name.trim()) return;
        const id = 'custom-' + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        onCreateTemplate(id, {
            name: name.trim(),
            description: description.trim() || 'Template personnalisé',
            layout: 'custom',
            defaultRatio,
            supportedRatios: selectedRatios,
        });
        handleClose();
    }, [name, description, defaultRatio, selectedRatios, onCreateTemplate, handleClose]);

    const toggleRatio = useCallback((ratioId) => {
        setSelectedRatios(prev => {
            const next = prev.includes(ratioId)
                ? prev.filter(r => r !== ratioId)
                : [...prev, ratioId];
            if (next.length === 0) return prev; // at least one
            // If default was removed, pick first
            if (!next.includes(defaultRatio)) setDefaultRatio(next[0]);
            return next;
        });
    }, [defaultRatio]);

    const canNext = step === 0 ? name.trim().length > 0
        : step === 1 ? selectedRatios.length > 0
            : true;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
                            className="pointer-events-auto w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(30,30,60,0.85) 0%, rgba(20,20,45,0.92) 100%)',
                                backdropFilter: 'blur(40px) saturate(1.4)',
                                WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                            }}
                        >
                            {/* Header with step indicator */}
                            <div className="px-6 pt-6 pb-4 border-b border-white/8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white">Créer un Template</h2>
                                    <button
                                        onClick={handleClose}
                                        className="p-1.5 rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        <X size={20} className="text-white/60" />
                                    </button>
                                </div>

                                {/* Step indicators */}
                                <div className="flex items-center gap-2">
                                    {STEPS.map((s, i) => {
                                        const Icon = s.icon;
                                        const isActive = i === step;
                                        const isDone = i < step;
                                        return (
                                            <React.Fragment key={s.id}>
                                                {i > 0 && (
                                                    <div className={`flex-1 h-px transition-all duration-300 ${isDone ? 'bg-purple-500' : 'bg-white/10'}`} />
                                                )}
                                                <div
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${isActive ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30'
                                                            : isDone ? 'bg-purple-500/10 text-purple-400'
                                                                : 'text-white/30'
                                                        }`}
                                                >
                                                    <Icon size={14} />
                                                    <span className="hidden sm:inline">{s.label}</span>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Content — animated step transitions */}
                            <div className="p-6 min-h-[260px]">
                                <AnimatePresence mode="wait">
                                    {step === 0 && (
                                        <motion.div
                                            key="step-info"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1.5">
                                                    Nom du template *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Ex : Ma mise en page Social"
                                                    maxLength={50}
                                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-2 focus:ring-purple-500/40"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                    }}
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-white/70 mb-1.5">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Décrivez l'usage de ce template..."
                                                    maxLength={200}
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all resize-none focus:ring-2 focus:ring-purple-500/40"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 1 && (
                                        <motion.div
                                            key="step-formats"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-3"
                                        >
                                            <p className="text-xs text-white/50 mb-2">
                                                Sélectionnez les formats supportés par ce template. Cliquez une seconde fois pour définir le format par défaut.
                                            </p>
                                            {RATIO_OPTIONS.map((r) => {
                                                const isSelected = selectedRatios.includes(r.id);
                                                const isDefault = defaultRatio === r.id;
                                                return (
                                                    <motion.button
                                                        key={r.id}
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => {
                                                            if (isSelected && selectedRatios.length > 1 && !isDefault) {
                                                                // Second click on selected → make default
                                                                setDefaultRatio(r.id);
                                                            } else {
                                                                toggleRatio(r.id);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${isSelected
                                                                ? isDefault
                                                                    ? 'ring-2 ring-purple-500/50 bg-purple-500/15'
                                                                    : 'bg-purple-500/10 ring-1 ring-purple-500/20'
                                                                : 'bg-white/5 hover:bg-white/8'
                                                            }`}
                                                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                                                    >
                                                        <span className="text-lg">{r.icon}</span>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-white">{r.label}</div>
                                                            <div className="text-[11px] text-white/40">{r.desc}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {isDefault && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                                                                    Défaut
                                                                </span>
                                                            )}
                                                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/10'
                                                                }`}>
                                                                {isSelected && <Check size={13} />}
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step-confirm"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-4"
                                        >
                                            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <h4 className="text-sm font-semibold text-white mb-3">Récapitulatif</h4>
                                                <div className="space-y-2.5">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-xs text-white/40 w-20 flex-shrink-0">Nom</span>
                                                        <span className="text-sm text-white font-medium">{name}</span>
                                                    </div>
                                                    {description && (
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-xs text-white/40 w-20 flex-shrink-0">Description</span>
                                                            <span className="text-xs text-white/70">{description}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-xs text-white/40 w-20 flex-shrink-0">Formats</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {selectedRatios.map(r => (
                                                                <span key={r} className={`text-[11px] px-2 py-0.5 rounded-full ${r === defaultRatio ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-white/60'
                                                                    }`}>
                                                                    {r}{r === defaultRatio ? ' ★' : ''}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/40 text-center">
                                                Vous pourrez ensuite personnaliser les contenus depuis l'onglet Contenu.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer with navigation */}
                            <div className="px-6 pb-6 flex items-center justify-between">
                                {step > 0 ? (
                                    <button
                                        onClick={() => setStep(s => s - 1)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <ArrowLeft size={16} /> Retour
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/60 transition-all"
                                    >
                                        Annuler
                                    </button>
                                )}

                                {step < STEPS.length - 1 ? (
                                    <button
                                        onClick={() => canNext && setStep(s => s + 1)}
                                        disabled={!canNext}
                                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${canNext
                                                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                                            }`}
                                    >
                                        Suivant <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCreate}
                                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                                    >
                                        <Check size={16} /> Créer le Template
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
