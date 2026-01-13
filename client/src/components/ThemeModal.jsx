/**
 * Modale de sélection de thème (colorimétrie)
 */

import React from 'react'
import { createPortal } from 'react-dom'

const THEMES = [
    {
        id: 'violet-lean',
        name: 'Violet Intense',
        colors: ['#9333EA', '#DB2777'],
        gradient: ' to-rose-500',
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
        gradient: ' ',
        description: 'Thème océanique avec accent cyan'
    },
    {
        id: 'sakura',
        name: 'Sakura',
        colors: ['#EC4899', '#F97316'],
        gradient: ' to-orange-500',
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

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r to-rose-500 px-8 py-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Choisir un Thème</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <p className="text-gray-600 mb-6">
                        Sélectionnez un thème pour personnaliser votre expérience sur Orchard Studio
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {THEMES.map((theme) => {
                            const isSelected = currentTheme === theme.id
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => handleSelect(theme.id)}
                                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${isSelected ? 'border-violet-600 bg-gradient-to-br to-rose-50 shadow-lg' : 'border-gray-200 hover:border-violet-400' }`}
                                >
                                    {/* Color Preview */}
                                    <div className={`w-full h-24 rounded-xl bg-gradient-to-br ${theme.gradient} mb-4 shadow-md group-hover:shadow-lg transition-shadow`} />

                                    {/* Theme Name */}
                                    <h3 className="font-bold text-gray-900 text-center mb-1">{theme.name}</h3>

                                    {/* Description */}
                                    <p className="text-xs text-gray-600 text-center mb-3 line-clamp-2">
                                        {theme.description}
                                    </p>

                                    {/* Color Dots */}
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        {theme.colors.map((color, idx) => (
                                            <div
                                                key={idx}
                                                className="w-4 h-4 rounded-full border-2 border-gray-300"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <div className="absolute -top-3 -right-3 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg">
                                            ✓
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Preview Note */}
                    <div className="mt-8 p-4 border rounded-xl">
                        <p className="text-sm">
                            💡 <strong>Conseil:</strong> Vous pouvez changer de thème à tout moment dans vos paramètres.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg hover: text-white font-semibold transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

