import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, GripVertical, Calendar, Clock } from 'lucide-react'

/**
 * Generic Pipeline Manager
 * Gère les pipelines avec intervalles configurables (seconds/minutes/hours/days/weeks/months/phases)
 * et données customisables par step
 */
export default function PipelineManager({
    pipelineId,
    pipelineType,
    steps = [],
    onChange,
    stepDataFields = [],
    intervalTypes = ['jours', 'semaines', 'mois', 'phases'],
    title,
    description
}) {
    const { t } = useTranslation()
    const [localSteps, setLocalSteps] = useState(steps)
    const [selectedInterval, setSelectedInterval] = useState('jours')
    const [expandedStep, setExpandedStep] = useState(null)

    useEffect(() => {
        setLocalSteps(steps)
    }, [steps])

    const handleAddStep = async () => {
        const newStep = {
            stepIndex: localSteps.length,
            stepName: `${t('flower.pipeline.step')} ${localSteps.length + 1}`,
            intervalType: selectedInterval,
            intervalValue: 1,
            data: {},
            notes: ''
        }

        const updatedSteps = [...localSteps, newStep]
        setLocalSteps(updatedSteps)
        onChange(updatedSteps)
        setExpandedStep(localSteps.length)
    }

    const handleUpdateStep = (index, field, value) => {
        const updatedSteps = [...localSteps]
        if (field.startsWith('data.')) {
            const dataField = field.replace('data.', '')
            updatedSteps[index].data = {
                ...updatedSteps[index].data,
                [dataField]: value
            }
        } else {
            updatedSteps[index] = {
                ...updatedSteps[index],
                [field]: value
            }
        }
        setLocalSteps(updatedSteps)
        onChange(updatedSteps)
    }

    const handleDeleteStep = (index) => {
        const updatedSteps = localSteps.filter((_, i) => i !== index)
        // Re-index steps
        updatedSteps.forEach((step, i) => {
            step.stepIndex = i
        })
        setLocalSteps(updatedSteps)
        onChange(updatedSteps)
        if (expandedStep === index) {
            setExpandedStep(null)
        }
    }

    const handleReorder = (fromIndex, toIndex) => {
        const updatedSteps = [...localSteps]
        const [moved] = updatedSteps.splice(fromIndex, 1)
        updatedSteps.splice(toIndex, 0, moved)
        // Re-index
        updatedSteps.forEach((step, i) => {
            step.stepIndex = i
        })
        setLocalSteps(updatedSteps)
        onChange(updatedSteps)
    }

    const getTotalDuration = () => {
        let total = 0
        const conversions = {
            secondes: 1,
            minutes: 60,
            heures: 3600,
            jours: 86400,
            semaines: 604800,
            mois: 2592000
        }

        localSteps.forEach(step => {
            if (step.intervalType !== 'phases') {
                const seconds = (step.intervalValue || 0) * (conversions[step.intervalType] || 86400)
                total += seconds
            }
        })

        // Convert to best unit
        if (total < 3600) return `${Math.round(total / 60)} min`
        if (total < 86400) return `${Math.round(total / 3600)} h`
        if (total < 604800) return `${Math.round(total / 86400)} j`
        if (total < 2592000) return `${Math.round(total / 604800)} sem`
        return `${Math.round(total / 2592000)} mois`
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{localSteps.length} étapes • {getTotalDuration()}</span>
                </div>
            </div>

            {/* Interval Type Selector */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('flower.pipeline.intervalType')}:
                </label>
                <select
                    value={selectedInterval}
                    onChange={(e) => setSelectedInterval(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                    {intervalTypes.map(type => (
                        <option key={type} value={type}>{t(`flower.pipeline.interval.${type}`)}</option>
                    ))}
                </select>
            </div>

            {/* Steps List */}
            <div className="space-y-2">
                {localSteps.map((step, index) => (
                    <div
                        key={index}
                        className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('stepIndex', index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault()
                            const fromIndex = parseInt(e.dataTransfer.getData('stepIndex'))
                            if (fromIndex !== index) {
                                handleReorder(fromIndex, index)
                            }
                        }}
                    >
                        {/* Step Header */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750"
                            onClick={() => setExpandedStep(expandedStep === index ? null : index)}>
                            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                                {index + 1}
                            </span>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{step.stepName}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {step.intervalValue} {t(`flower.pipeline.interval.${step.intervalType}`)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteStep(index)
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Step Details (Expanded) */}
                        {expandedStep === index && (
                            <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                                {/* Step Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('flower.pipeline.stepName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={step.stepName}
                                        onChange={(e) => handleUpdateStep(index, 'stepName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                {/* Interval */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('flower.pipeline.intervalValue')}
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={step.intervalValue}
                                            onChange={(e) => handleUpdateStep(index, 'intervalValue', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('flower.pipeline.unit')}
                                        </label>
                                        <select
                                            value={step.intervalType}
                                            onChange={(e) => handleUpdateStep(index, 'intervalType', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                                        >
                                            {intervalTypes.map(type => (
                                                <option key={type} value={type}>{t(`flower.pipeline.interval.${type}`)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Custom Data Fields */}
                                {stepDataFields.map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {field.label}
                                        </label>
                                        {field.type === 'select' ? (
                                            <select
                                                value={step.data[field.name] || ''}
                                                onChange={(e) => handleUpdateStep(index, `data.${field.name}`, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                                            >
                                                <option value="">{t('common.select')}</option>
                                                {field.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : field.type === 'number' ? (
                                            <input
                                                type="number"
                                                value={step.data[field.name] || ''}
                                                onChange={(e) => handleUpdateStep(index, `data.${field.name}`, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={step.data[field.name] || ''}
                                                onChange={(e) => handleUpdateStep(index, `data.${field.name}`, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                                            />
                                        )}
                                    </div>
                                ))}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('flower.pipeline.notes')}
                                    </label>
                                    <textarea
                                        value={step.notes || ''}
                                        onChange={(e) => handleUpdateStep(index, 'notes', e.target.value)}
                                        rows="3"
                                        maxLength="500"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                                        placeholder={t('flower.pipeline.notesPlaceholder')}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {(step.notes || '').length}/500
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Step Button */}
            <button
                type="button"
                onClick={handleAddStep}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                {t('flower.pipeline.addStep')}
            </button>
        </div>
    )
}


