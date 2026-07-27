import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Layers, Pencil, Trash2 } from 'lucide-react';
import { useOrchardStore } from '../../../store/orchardStore';
import { LiquidButton, LiquidInput, LiquidTextarea, LiquidModal, LiquidBadge } from '../../ui/LiquidUI';

export default function PresetManager() {
    const presets = useOrchardStore((state) => state.presets);
    const activePreset = useOrchardStore((state) => state.activePreset);
    const config = useOrchardStore((state) => state.config);
    const savePreset = useOrchardStore((state) => state.savePreset);
    const loadPreset = useOrchardStore((state) => state.loadPreset);
    const deletePreset = useOrchardStore((state) => state.deletePreset);
    const updatePreset = useOrchardStore((state) => state.updatePreset);
    const fetchRemotePresets = useOrchardStore((state) => state.fetchRemotePresets);

    // Récupère les préréglages sauvegardés côté serveur (autres navigateurs/appareils)
    // au montage du panneau, fusionnés avec les préréglages locaux par le store.
    useEffect(() => { fetchRemotePresets(); }, [fetchRemotePresets]);

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [presetDescription, setPresetDescription] = useState('');
    const [editingPreset, setEditingPreset] = useState(null);

    const closeModal = () => {
        setShowSaveModal(false);
        setPresetName('');
        setPresetDescription('');
        setEditingPreset(null);
    };

    const handleSave = () => {
        if (!presetName.trim()) return;

        if (editingPreset) {
            updatePreset(editingPreset, {
                name: presetName,
                description: presetDescription,
                config: { ...config }
            });
        } else {
            savePreset(presetName, presetDescription);
        }

        closeModal();
    };

    const handleEdit = (preset) => {
        setEditingPreset(preset.id);
        setPresetName(preset.name);
        setPresetDescription(preset.description || '');
        setShowSaveModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">
                    Préréglages
                </h3>
                <p className="text-sm text-white/50">
                    Sauvegardez et réutilisez vos configurations préférées
                </p>
            </div>

            {/* Bouton pour sauvegarder */}
            <LiquidButton variant="primary" icon={Bookmark} className="w-full" onClick={() => setShowSaveModal(true)}>
                Enregistrer la configuration actuelle
            </LiquidButton>

            {/* Liste des préréglages */}
            {presets.length === 0 ? (
                <div className="liquid-card text-center py-12 px-4 border-dashed">
                    <Layers className="w-12 h-12 mx-auto text-white/25 mb-3" />
                    <p className="text-sm text-white/50">
                        Aucun préréglage sauvegardé
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {presets.map((preset) => (
                        <motion.div
                            key={preset.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className={`liquid-card p-4 ${activePreset === preset.id ? 'ring-2 ring-purple-500' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white/90 flex items-center gap-2">
                                        {preset.name}
                                        {activePreset === preset.id && (
                                            <LiquidBadge variant="info" size="sm">Actif</LiquidBadge>
                                        )}
                                    </h4>
                                    {preset.description && (
                                        <p className="text-sm text-white/50 mt-1">
                                            {preset.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-white/30 mt-2">
                                        {new Date(preset.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Aperçu mini des couleurs */}
                            <div className="flex gap-2 h-6 rounded-lg overflow-hidden mb-3">
                                <div className="flex-1" style={{ background: preset.config.colors.background }} />
                                <div className="w-6" style={{ backgroundColor: preset.config.colors.accent }} />
                                <div className="w-6" style={{ backgroundColor: preset.config.colors.textPrimary }} />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <LiquidButton size="sm" variant="primary" className="flex-1" onClick={() => loadPreset(preset.id)}>
                                    Charger
                                </LiquidButton>
                                <LiquidButton size="sm" variant="ghost" icon={Pencil} onClick={() => handleEdit(preset)} />
                                <LiquidButton
                                    size="sm"
                                    variant="danger"
                                    icon={Trash2}
                                    onClick={() => {
                                        if (window.confirm(`Supprimer le préréglage "${preset.name}" ?`)) {
                                            deletePreset(preset.id);
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal de sauvegarde */}
            <LiquidModal
                isOpen={showSaveModal}
                onClose={closeModal}
                title={editingPreset ? 'Modifier le préréglage' : 'Nouveau préréglage'}
                size="sm"
                footer={(
                    <div className="flex gap-3 w-full">
                        <LiquidButton variant="ghost" className="flex-1" onClick={closeModal}>
                            Annuler
                        </LiquidButton>
                        <LiquidButton variant="primary" className="flex-1" onClick={handleSave} disabled={!presetName.trim()}>
                            {editingPreset ? 'Mettre à jour' : 'Enregistrer'}
                        </LiquidButton>
                    </div>
                )}
            >
                <div className="space-y-4 px-6 pb-6">
                    <LiquidInput
                        label="Nom du préréglage *"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Mon super style"
                        autoFocus
                    />
                    <LiquidTextarea
                        label="Description (optionnel)"
                        value={presetDescription}
                        onChange={(e) => setPresetDescription(e.target.value)}
                        placeholder="Pour mes reviews de concentrés..."
                        rows={3}
                    />
                </div>
            </LiquidModal>
        </div>
    );
}
