import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useOrchardStore } from '../../../store/orchardStore';
import { COLOR_PALETTES } from '../../../store/orchardConstants';
import { LiquidButton, LiquidInput } from '../../ui/LiquidUI';

function ColorRow({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
            <div className="flex gap-2 items-center">
                <input
                    type="color"
                    value={value.startsWith('#') ? value : '#667eea'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-11 h-11 rounded-lg cursor-pointer border border-white/15 bg-transparent flex-shrink-0"
                />
                <LiquidInput
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="font-mono text-sm"
                    wrapperClassName="flex-1"
                />
            </div>
        </div>
    );
}

export default function ColorPaletteControls() {
    const config = useOrchardStore((state) => state.config);
    const updateColors = useOrchardStore((state) => state.updateColors);
    const applyColorPalette = useOrchardStore((state) => state.applyColorPalette);
    const palettes = COLOR_PALETTES;
    const [customMode, setCustomMode] = useState(false);

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">
                    Palette de Couleurs
                </h3>
                <p className="text-sm text-white/50">
                    Choisissez une palette harmonieuse ou personnalisez-la
                </p>
            </div>

            {/* Basculer entre palettes et personnalisation */}
            <div className="flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
                <LiquidButton size="sm" variant={!customMode ? 'primary' : 'ghost'} className="flex-1" onClick={() => setCustomMode(false)}>
                    Palettes
                </LiquidButton>
                <LiquidButton size="sm" variant={customMode ? 'primary' : 'ghost'} className="flex-1" onClick={() => setCustomMode(true)}>
                    Personnalisé
                </LiquidButton>
            </div>

            {!customMode ? (
                /* Galerie de palettes prédéfinies */
                <div className="space-y-3">
                    {Object.entries(palettes).map(([key, palette]) => (
                        <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => applyColorPalette(key)}
                            className={`liquid-card w-full p-4 text-left ${config.colors.palette === key ? 'ring-2 ring-purple-500' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-white/90">
                                    {palette.name}
                                </span>
                                {config.colors.palette === key && (
                                    <Check className="w-5 h-5 text-purple-400" />
                                )}
                            </div>

                            {/* Aperçu des couleurs */}
                            <div className="flex gap-2 h-10 rounded-lg overflow-hidden">
                                <div className="flex-1" style={{ background: palette.background }} />
                                <div className="w-10" style={{ backgroundColor: palette.accent }} />
                                <div className="w-10" style={{ backgroundColor: palette.textPrimary }} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            ) : (
                /* Personnalisation manuelle */
                <div className="space-y-4">
                    <ColorRow label="Arrière-plan" value={config.colors.background} onChange={(v) => updateColors({ background: v })} />
                    <ColorRow label="Texte principal" value={config.colors.textPrimary} onChange={(v) => updateColors({ textPrimary: v })} />
                    <ColorRow label="Texte secondaire" value={config.colors.textSecondary} onChange={(v) => updateColors({ textSecondary: v })} />
                    <ColorRow label="Couleur d'accentuation" value={config.colors.accent} onChange={(v) => updateColors({ accent: v })} />
                    <ColorRow label="Couleur du titre" value={config.colors.title} onChange={(v) => updateColors({ title: v })} />
                </div>
            )}
        </div>
    );
}
