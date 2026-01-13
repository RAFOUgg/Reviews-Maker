/**
 * PurificationMethodForm.jsx
 * 
 * Formulaire dynamique pour paramètres de purification selon méthode
 * S'adapte automatiquement à la méthode sélectionnée
 * 
 * Conforme CDC - Phase 4
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, AlertCircle, Beaker, Droplet, Flame, Wind, Zap } from 'lucide-react'
import { PURIFICATION_SIDEBAR_CONTENT, shouldShowField } from '../config/purificationSidebarContent'
import FieldRenderer from './FieldRenderer'

/**
 * Modal pour éditer/créer une étape de purification
 */
export function PurificationMethodModal({ isOpen, onClose, onSave, initialData = {}, allData = {} }) {
    const [formData, setFormData] = useState({
        purificationMethod: 'winterization',
        processingDate: new Date().toISOString().split('T')[0],
        processingDuration: 60,
        numberOfPasses: 1,
        batchSize: 100,
        purity_before: 70,
        purity_after: 95,
        weight_input: 100,
        weight_output: 85,
        ...initialData
    })

    const [errors, setErrors] = useState({})

    const handleFieldChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }))

        // Clear error when field is modified
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldId]
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.purificationMethod) {
            newErrors.purificationMethod = 'Méthode requise'
        }

        if (!formData.processingDate) {
            newErrors.processingDate = 'Date requise'
        }

        if (formData.purity_after < formData.purity_before) {
            newErrors.purity_after = 'La pureté finale doit être ≥ pureté initiale'
        }

        if (formData.weight_output > formData.weight_input) {
            newErrors.weight_output = 'Le poids final ne peut pas être > poids initial'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            onSave(formData)
            onClose()
        }
    }

    const getMethodIcon = (method) => {
        const icons = {
            'winterization': <Droplet className="w-5 h-5" />,
            'decarboxylation': <Flame className="w-5 h-5" />,
            'chromatography': <Beaker className="w-5 h-5" />,
            'distillation': <Wind className="w-5 h-5" />,
            'filtration': <Zap className="w-5 h-5" />
        }

        for (const [key, icon] of Object.entries(icons)) {
            if (method.includes(key)) return icon
        }

        return <Beaker className="w-5 h-5" />
    }

    const getMethodColor = (method) => {
        if (method.includes('winterization')) return 'from-cyan-500 to-blue-600'
        if (method.includes('decarboxylation')) return 'from-red-500 to-orange-600'
        if (method.includes('chromatography') || method.includes('hplc')) return 'from-purple-500 to-pink-600'
        if (method.includes('distillation')) return 'from-amber-500 to-yellow-600'
        if (method.includes('filtration')) return 'from-green-500 to-emerald-600'
        return 'from-blue-500 to-indigo-600'
    }

    if (!isOpen) return null

    const currentMethod = formData.purificationMethod
    const methodLabel = PURIFICATION_SIDEBAR_CONTENT.CONFIGURATION.items[0].options.find(
        opt => opt.value === currentMethod
    )?.label || currentMethod

    // Déterminer quelles sections afficher selon la méthode
    const visibleSections = []

    visibleSections.push('CONFIGURATION')

    if (['winterization', 'chromatography', 'flash-chromatography', 'hplc', 'liquid-liquid-extraction', 'recrystallization'].includes(currentMethod)) {
        visibleSections.push('SOLVANTS')
    }

    if (currentMethod === 'winterization') {
        visibleSections.push('WINTERIZATION')
    } else if (['chromatography', 'flash-chromatography', 'hplc'].includes(currentMethod)) {
        visibleSections.push('CHROMATOGRAPHY')
    } else if (['fractional-distillation', 'short-path-distillation', 'molecular-distillation'].includes(currentMethod)) {
        visibleSections.push('DISTILLATION')
    } else if (currentMethod === 'decarboxylation') {
        visibleSections.push('DECARBOXYLATION')
    } else if (currentMethod === 'filtration') {
        visibleSections.push('FILTRATION')
    }

    visibleSections.push('QUALITE', 'RENDEMENT', 'NOTES')

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`bg-gradient-to-r ${getMethodColor(currentMethod)} p-6 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                {getMethodIcon(currentMethod)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {initialData.id ? 'Modifier' : 'Nouvelle'} Purification
                                </h2>
                                <p className="text-white/80 text-sm mt-1">{methodLabel}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {visibleSections.map(sectionKey => {
                            const section = PURIFICATION_SIDEBAR_CONTENT[sectionKey]
                            if (!section) return null

                            const visibleFields = section.items.filter(field =>
                                shouldShowField(field, { ...allData, ...formData })
                            )

                            if (visibleFields.length === 0) return null

                            return (
                                <motion.div
                                    key={sectionKey}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                        <span className="text-xl">{section.icon}</span>
                                        <h3 className="text-lg font-semibold text-white">{section.label}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {visibleFields.map(field => (
                                            <div
                                                key={field.id}
                                                className={field.type === 'textarea' || field.type === 'info' ? 'md:col-span-2' : ''}
                                            >
                                                <FieldRenderer
                                                    field={field}
                                                    value={formData[field.id]}
                                                    onChange={(value) => handleFieldChange(field.id, value)}
                                                    allData={{ ...allData, ...formData }}
                                                    error={errors[field.id]}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })}

                        {/* Calculated Summary */}
                        {formData.purity_before && formData.purity_after && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-panel p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30"
                            >
                                <h4 className="text-sm font-semibold text-purple-300 mb-3">Résumé calculé</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <div className="text-gray-400">Gain pureté</div>
                                        <div className="text-green-400 font-bold">
                                            +{(formData.purity_after - formData.purity_before).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Rendement</div>
                                        <div className="text-yellow-400 font-bold">
                                            {formData.weight_input > 0 ? ((formData.weight_output / formData.weight_input) * 100).toFixed(1) : 0}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Pertes</div>
                                        <div className="text-red-400 font-bold">
                                            {(formData.weight_input - formData.weight_output).toFixed(1)}g
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400">Efficacité</div>
                                        <div className="text-blue-400 font-bold">
                                            {formData.weight_input > 0 && formData.purity_before > 0
                                                ? (((formData.purity_after / formData.purity_before) * (formData.weight_output / formData.weight_input)) * 100).toFixed(0)
                                                : 0}%
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Les champs varient selon la méthode sélectionnée</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-green-500/30"
                            >
                                <Save className="w-4 h-4" />
                                {initialData.id ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default PurificationMethodModal




