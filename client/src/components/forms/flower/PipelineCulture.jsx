import React from 'react'
import { useTranslation } from 'react-i18next'
import PipelineManager from './PipelineManager'

/**
 * Section 3: Pipeline Culture
 * Utilise PipelineManager avec champs spécifiques culture
 */
export default function PipelineCulture({ data, onChange }) {
    const { t } = useTranslation()

    // Culture-specific data fields selon COMPTE_FONCTIONNALITES
    const cultureDataFields = [
        {
            name: 'mode',
            label: t('flower.culture.mode'),
            type: 'select',
            options: ['Indoor', 'Outdoor', 'Greenhouse', 'No-till', 'Autre']
        },
        {
            name: 'substrate',
            label: t('flower.culture.substrate'),
            type: 'text',
            placeholder: 'Terre, Coco, Hydro...'
        },
        {
            name: 'irrigation',
            label: t('flower.culture.irrigation'),
            type: 'select',
            options: ['Manuelle', 'Goutte à goutte', 'Inondation', 'Aspersion', 'Autre']
        },
        {
            name: 'fertilizers',
            label: t('flower.culture.fertilizers'),
            type: 'text',
            placeholder: 'Marque, gamme, dosage'
        },
        {
            name: 'lightType',
            label: t('flower.culture.lightType'),
            type: 'select',
            options: ['LED', 'HPS', 'CFL', 'MH', 'Naturel', 'Mixte', 'Autre']
        },
        {
            name: 'lightPower',
            label: t('flower.culture.lightPower') + ' (W)',
            type: 'number',
            placeholder: '600'
        },
        {
            name: 'temperature',
            label: t('flower.culture.temperature') + ' (°C)',
            type: 'number',
            placeholder: '24'
        },
        {
            name: 'humidity',
            label: t('flower.culture.humidity') + ' (%)',
            type: 'number',
            placeholder: '60'
        },
        {
            name: 'training',
            label: t('flower.culture.training'),
            type: 'select',
            options: ['LST', 'HST', 'SCROG', 'SOG', 'Main-Lining', 'Aucun', 'Autre']
        }
    ]

    return (
        <div className="space-y-6">
            {/* Dates de culture (optionnelles) */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-900 dark:text-purple-200">
                    💡 Les dates sont <strong>optionnelles</strong>. Vous pouvez définir la pipeline uniquement en nombre de jours/phases.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('flower.culture.startDate')}
                    </label>
                    <input
                        type="date"
                        value={data.cultureStartDate || ''}
                        onChange={(e) => onChange({ ...data, cultureStartDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('flower.culture.endDate')}
                    </label>
                    <input
                        type="date"
                        value={data.cultureEndDate || ''}
                        onChange={(e) => onChange({ ...data, cultureEndDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>

            {/* Pipeline Manager */}
            <PipelineManager
                pipelineId={data.culturePipelineId}
                pipelineType="culture"
                steps={data.cultureSteps || []}
                onChange={(steps) => onChange({ ...data, cultureSteps: steps })}
                stepDataFields={cultureDataFields}
                intervalTypes={['jours', 'semaines', 'mois', 'phases']}
                title={t('flower.culture.pipelineTitle')}
                description={t('flower.culture.pipelineDescription')}
            />
        </div>
    )
}
