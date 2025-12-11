import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

/**
 * Module Builder - Drag & Drop for export customization
 */
export default function ModuleBuilder({ review, templateId, onModulesChange, isDark = false }) {
    const { t } = useTranslation()
    const [modules, setModules] = useState([
        { id: 'title', label: 'Titre', enabled: true },
        { id: 'mainImage', label: 'Image principale', enabled: true },
        { id: 'rating', label: 'Note', enabled: true },
        { id: 'categoryRatings', label: 'Notes par catégorie', enabled: true },
        { id: 'infos', label: 'Infos générales', enabled: true },
        { id: 'genetics', label: 'Génétiques', enabled: true },
        { id: 'aromas', label: 'Odeurs', enabled: true },
        { id: 'tastes', label: 'Goûts', enabled: true },
        { id: 'effects', label: 'Effets', enabled: true },
        { id: 'visual', label: 'Visuel & Technique', enabled: true },
        { id: 'texture', label: 'Texture', enabled: true },
        { id: 'analytics', label: 'Analytiques', enabled: false },
        { id: 'culture', label: 'Culture', enabled: false },
        { id: 'curing', label: 'Curing', enabled: false }
    ])

    const [draggedItem, setDraggedItem] = useState(null)

    const handleDragStart = (e, index) => {
        setDraggedItem(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, targetIndex) => {
        e.preventDefault()
        if (draggedItem === null || draggedItem === targetIndex) return

        const newModules = [...modules]
        const [draggedModule] = newModules.splice(draggedItem, 1)
        newModules.splice(targetIndex, 0, draggedModule)
        setModules(newModules)
        onModulesChange(newModules.filter(m => m.enabled))
        setDraggedItem(null)
    }

    const toggleModule = (index) => {
        const newModules = [...modules]
        newModules[index].enabled = !newModules[index].enabled
        setModules(newModules)
        onModulesChange(newModules.filter(m => m.enabled))
    }

    const moveModule = (index, direction) => {
        const newModules = [...modules]
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= newModules.length) return

        [newModules[index], newModules[newIndex]] = [newModules[newIndex], newModules[index]]
        setModules(newModules)
        onModulesChange(newModules.filter(m => m.enabled))
    }

    return (
        <div className={`mb-6 p-4 border rounded-lg ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('export.moduleBuilder')}
            </h3>

            <div className={`rounded border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}>
                {modules.map((module, index) => (
                    <div
                        key={module.id}
                        draggable={module.enabled}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`flex items-center gap-3 p-3 border-b transition ${index === modules.length - 1 ? 'border-b-0' : ''
                            } ${module.enabled
                                ? isDark
                                    ? 'bg-gray-700 border-gray-600'
                                    : 'bg-white border-gray-200'
                                : isDark
                                    ? 'bg-gray-800 border-gray-700 opacity-50'
                                    : 'bg-gray-50 border-gray-200 opacity-50'
                            } ${draggedItem === index ? 'opacity-50' : ''
                            }`}
                    >
                        {module.enabled && (
                            <GripVertical className={`w-4 h-4 cursor-grab active:cursor-grabbing ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        )}

                        <input
                            type="checkbox"
                            checked={module.enabled}
                            onChange={() => toggleModule(index)}
                            className="w-4 h-4 cursor-pointer"
                        />

                        <label className={`flex-1 cursor-pointer ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {module.label}
                        </label>

                        {module.enabled && (
                            <button
                                onClick={() => moveModule(index, 'up')}
                                disabled={index === 0 || modules.every((m, i) => !m.enabled || i >= index)}
                                className={`px-2 py-1 text-xs rounded transition ${isDark ? 'hover:bg-gray-600 disabled:opacity-30' : 'hover:bg-gray-200 disabled:opacity-30'}`}
                            >
                                ↑
                            </button>
                        )}

                        {module.enabled && (
                            <button
                                onClick={() => moveModule(index, 'down')}
                                disabled={index === modules.length - 1 || modules.every((m, i) => !m.enabled || i <= index)}
                                className={`px-2 py-1 text-xs rounded transition ${isDark ? 'hover:bg-gray-600 disabled:opacity-30' : 'hover:bg-gray-200 disabled:opacity-30'}`}
                            >
                                ↓
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <p className={`text-xs mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('export.dragDrop')}
            </p>
        </div>
    )
}
