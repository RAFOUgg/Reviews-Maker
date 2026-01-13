import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileText, X } from 'lucide-react'

/**
 * Section 4: Analytics PDF
 * - Upload PDF analytics (optional)
 * - THC%, CBD%, CBG%, CBC%, CBN%, THCV% (0-100)
 * - Terpene profile (JSON or manual input)
 */
export default function AnalyticsPDF({ data, onChange, errors = {} }) {
    const { t } = useTranslation()
    const [pdfPreview, setPdfPreview] = useState(data.analyticsPdfUrl || null)

    const handleInputChange = (field, value) => {
        // Validate percentage (0-100)
        if (field.includes('Percent') && value !== '') {
            const num = parseFloat(value)
            if (isNaN(num) || num < 0 || num > 100) {
                return // Invalid value, don't update
            }
        }
        onChange({ ...data, [field]: value })
    }

    const handlePdfUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (file.type !== 'application/pdf') {
            alert(t('flower.invalidPdfFormat'))
            return
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert(t('flower.pdfTooLarge'))
            return
        }

        onChange({
            ...data,
            analyticsPdfFile: file
        })

        setPdfPreview(URL.createObjectURL(file))
    }

    const removePdf = () => {
        onChange({
            ...data,
            analyticsPdfFile: null,
            analyticsPdfUrl: null
        })
        setPdfPreview(null)
    }

    const cannabinoids = [
        { key: 'thcPercent', label: 'THC', color: '' },
        { key: 'cbdPercent', label: 'CBD', color: 'text-green-600' },
        { key: 'cbgPercent', label: 'CBG', color: '' },
        { key: 'cbcPercent', label: 'CBC', color: 'text-yellow-600' },
        { key: 'cbnPercent', label: 'CBN', color: 'text-orange-600' },
        { key: 'thcvPercent', label: 'THCV', color: 'text-red-600' }
    ]

    return (
        <div className="space-y-6">
            {/* PDF Analytics Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.analyticsPdf')}
                </label>

                {pdfPreview || data.analyticsPdfUrl ? (
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {data.analyticsPdfFile?.name || t('flower.analyticsPdfUploaded')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {data.analyticsPdfFile?.size
                                            ? `${(data.analyticsPdfFile.size / 1024).toFixed(1)} KB`
                                            : 'PDF'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={removePdf}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-2">
                            <div className="flex justify-center">
                                <Upload className="w-12 h-12 text-gray-400" />
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p className="font-medium">{t('flower.uploadAnalyticsPdf')}</p>
                                <p className="text-xs mt-1">{t('flower.pdfMaxSize')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cannabinoids Grid */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    {t('flower.cannabinoids')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cannabinoids.map(({ key, label, color }) => (
                        <div key={key}>
                            <label htmlFor={key} className={`block text-sm font-medium mb-2 ${color}`}>
                                {label} (%)
                            </label>
                            <input
                                type="number"
                                id={key}
                                min="0"
                                max="100"
                                step="0.1"
                                value={data[key] || ''}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="0.0"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Terpene Profile */}
            <div>
                <label htmlFor="terpeneProfile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.terpeneProfile')}
                </label>
                <textarea
                    id="terpeneProfile"
                    value={typeof data.terpeneProfile === 'object'
                        ? JSON.stringify(data.terpeneProfile, null, 2)
                        : (data.terpeneProfile || '')
                    }
                    onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value)
                            handleInputChange('terpeneProfile', parsed)
                        } catch {
                            handleInputChange('terpeneProfile', e.target.value)
                        }
                    }}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
                    placeholder={t('flower.terpeneProfilePlaceholder')}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('flower.terpeneProfileHelper')}
                </p>
            </div>

            {/* Consumption Method */}
            <div>
                <label htmlFor="consumptionMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.consumptionMethod')}
                </label>
                <select
                    id="consumptionMethod"
                    value={data.consumptionMethod || ''}
                    onChange={(e) => handleInputChange('consumptionMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                    <option value="">{t('flower.selectConsumptionMethod')}</option>
                    <option value="combustion">{t('flower.consumptionMethod.combustion')}</option>
                    <option value="vaporisation">{t('flower.consumptionMethod.vaporisation')}</option>
                    <option value="infusion">{t('flower.consumptionMethod.infusion')}</option>
                    <option value="comestible">{t('flower.consumptionMethod.comestible')}</option>
                </select>
            </div>
        </div>
    )
}

