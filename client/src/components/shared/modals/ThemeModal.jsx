/**
 * Modale de sélection de thème (colorimétrie)
 * Liquid Glass UI Design System
 */

import React from 'react'
import { LiquidModal, LiquidButton, LiquidCard } from '@/components/ui/LiquidUI'

const THEMES = [
    {
        id: 'violet-lean',
        name: 'Violet Intense',
        colors: ['#9333EA', '#DB2777'],
        gradient: 'from-violet-500 to-rose-500',
        description: 'Thème par défaut avec gradient violet et rose'
    },
    {
        id: 'emerald',
        name: 'Émeraude',
        colors: ['#10B981', '#14B8A6'],
        gradient: 'from-emerald-500 to-teal-500',
        description: 'Thème nature avec accent vert'
    },
    {
        id: 'tahiti',
        name: 'Tahiti',
        colors: ['#3B82F6', '#06B6D4'],
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Thème océanique avec accent cyan'
    },
    {
        id: 'sakura',
        name: 'Sakura',
        colors: ['#EC4899', '#F97316'],
        gradient: 'from-pink-500 to-orange-500',
        description: 'Thème chaud avec dégradé rose-orange'
    },
    {
        id: 'dark',
        name: 'Sombre',
        colors: ['#1F2937', '#374151'],
        gradient: 'from-gray-800 to-gray-900',
        description: 'Thème sombre pour les yeux sensibles'
    }
]

export default function ThemeModal({ isOpen, onClose, currentTheme, onThemeChange }) {
    const handleSelect = (themeId) => {
        onThemeChange(themeId)
        // Optionnel: fermer après sélection
        setTimeout(onClose, 300)
    }

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            title="Choisir un Thème"
            size="xl"
            glowColor="violet"
            footer={
                <LiquidButton variant="ghost" onClick={onClose}>
                    Fermer
                </LiquidButton>
            }
        >
            <div className="space-y-6">
                <p className="text-white/60">
                    Sélectionnez un thème pour personnaliser votre expérience sur Orchard Studio
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {THEMES.map((theme) => {
                        const isSelected = currentTheme === theme.id
                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleSelect(theme.id)}
                                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${isSelected
                                        ? 'border-violet-500 bg-violet-500/10'
                                        : 'border-white/10 hover:border-violet-400/50 bg-white/5'
                                    }`}
                                style={{
                                    boxShadow: isSelected ? '0 0 30px rgba(139, 92, 246, 0.3)' : 'none'
                                }}
                            >
                                {/* Color Preview */}
                                <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${theme.gradient} mb-4 shadow-md group-hover:shadow-lg transition-shadow`} />

                                {/* Theme Name */}
                                <h3 className="font-bold text-white text-center mb-1">{theme.name}</h3>

                                {/* Description */}
                                <p className="text-xs text-white/50 text-center mb-3 line-clamp-2">
                                    {theme.description}
                                </p>

                                {/* Color Dots */}
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    {theme.colors.map((color, idx) => (
                                        <div
                                            key={idx}
                                            className="w-4 h-4 rounded-full border-2 border-white/30"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-[#07070f] shadow-lg">
                                        ✓
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Preview Note */}
                <LiquidCard className="p-4">
                    <p className="text-sm text-white/70">
                        💡 <strong className="text-white">Conseil:</strong> Vous pouvez changer de thème à tout moment dans vos paramètres.
                    </p>
                </LiquidCard>
            </div>
        </LiquidModal>
    )
}


