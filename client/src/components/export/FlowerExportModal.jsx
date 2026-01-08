import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Share2, X } from 'lucide-react'
import FlowerCompactTemplate from './templates/FlowerCompactTemplate'
import FlowerDetailedTemplate from './templates/FlowerDetailedTemplate'
import FlowerCompleteTemplate from './templates/FlowerCompleteTemplate'
import ModuleBuilder from './ModuleBuilder'

/**
 * Flower Export Modal
 * - Template selection (Compact, Detailed, Complete)
 * - Module builder (drag-drop customization)
 * - Preview + Download/Share
 */
export default function FlowerExportModal({ review, onClose, isDark = false }) {
    const { t } = useTranslation()
    const [selectedTemplate, setSelectedTemplate] = useState('compact')
    const [customModules, setCustomModules] = useState(null)

    const templates = [
        { id: 'compact', label: t('export.compact'), width: 'w-80', ratio: '1:1' },
        { id: 'detailed', label: t('export.detailed'), width: 'w-full', ratio: '16:9' },
        { id: 'complete', label: t('export.complete'), width: 'w-full', ratio: 'A4' }
    ]

    const TemplateComponent = {
        compact: FlowerCompactTemplate,
        detailed: FlowerDetailedTemplate,
        complete: FlowerCompleteTemplate
    }[selectedTemplate]

    const handleDownload = async () => {
        const canvas = await html2canvas(document.querySelector('.export-preview'), {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            scale: 2
        })
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `${review.title || review.nomCommercial}-export-${selectedTemplate}.png`
        link.click()
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: review.title || review.nomCommercial,
                    text: 'Check out this review on Reviews-Maker!',
                    url: window.location.href
                })
            } catch (error) {
                console.error('Error sharing:', error)
            }
        }
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-black/80' : 'bg-black/50'}`}>
            <div className={`max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'} p-6 shadow-2xl`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('export.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                        <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>

                {/* Template Selection */}
                <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('export.selectTemplate')}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {templates.map(tpl => (
                            <button
                                key={tpl.id}
                                onClick={() => {
                                    setSelectedTemplate(tpl.id)
                                    setCustomModules(null)
                                }}
                                className={`p-4 rounded-lg border-2 transition text-center ${selectedTemplate === tpl.id ? isDark ? ' ' : ' ' : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {tpl.label}
                                </div>
                                <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {tpl.ratio}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Module Builder Toggle */}
                {selectedTemplate === 'detailed' && (
                    <div className="mb-6 p-4 border-2 border-dashed rounded-lg">
                        <button
                            onClick={() => setCustomModules(customModules ? null : {})}
                            className="text-sm font-semibold hover:"
                        >
                            {customModules ? '✕ Utiliser template standard' : '+ Personnaliser avec éditeur de modules'}
                        </button>
                    </div>
                )}

                {/* Module Builder */}
                {customModules !== null && (
                    <ModuleBuilder
                        review={review}
                        templateId={selectedTemplate}
                        onModulesChange={setCustomModules}
                        isDark={isDark}
                    />
                )}

                {/* Preview */}
                <div className="mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <div className="export-preview">
                        <TemplateComponent
                            review={review}
                            customModules={customModules}
                            isDark={isDark}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                    >
                        {t('common.cancel')}
                    </button>
                    {navigator.share && (
                        <button
                            onClick={handleShare}
                            className="px-6 py-2 rounded-lg font-semibold hover: text-white transition flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            {t('export.share')}
                        </button>
                    )}
                    <button
                        onClick={handleDownload}
                        className="px-6 py-2 rounded-lg font-semibold hover: text-white transition flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {t('export.download')}
                    </button>
                </div>
            </div>
        </div>
    )
}
