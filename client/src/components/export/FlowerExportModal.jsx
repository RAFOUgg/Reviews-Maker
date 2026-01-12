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
}
