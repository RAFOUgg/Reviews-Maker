import React from 'react'
import { useTranslation } from 'react-i18next'
import PipelineManager from './PipelineManager'

/**
 * Section 10: Pipeline Curing
 * Utilise PipelineManager avec champs spécifiques curing
 */
export default function PipelineCuring({ data, onChange }) {
    const { t } = useTranslation()

    // Curing-specific data fields selon COMPTE_FONCTIONNALITES
    const curingDataFields = [
        {
            name: 'temperature',
            label: t('flower.curing.temperature') + ' (°C)',
            type: 'number',
            placeholder: '18'
        },
        {
            name: 'humidity',
            label: t('flower.curing.humidity') + ' (%)',
            type: 'number',
            placeholder: '62'
        },
        {
            name: 'container',
            label: t('flower.curing.container'),
            type: 'select',
            options: ['Aire libre', 'Verre', 'Plastique', 'Métal', 'Céramique', 'Bois', 'Autre']
        },
        {
            name: 'packaging',
            label: t('flower.curing.packaging'),
            type: 'select',
            options: [
                'Aucun',
                'Cellophane',
                'Papier cuisson',
                'Aluminium',
                'Paper hash',
                'Sac à vide',
                'Sous vide complet',
                'Sous vide partiel',
                'Autre'
            ]
        },
        {
            name: 'opacity',
            label: t('flower.curing.opacity'),
            type: 'select',
            options: ['Opaque', 'Semi-opaque', 'Transparent', 'Ambré', 'Autre']
        },
        {
            name: 'volume',
            label: t('flower.curing.volume') + ' (L)',
            type: 'number',
            placeholder: '1.0'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Type de curing */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('flower.curing.type')}
                </label>
                <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="curingType"
                            value="froid"
                            checked={data.curingType === 'froid'}
                            onChange={(e) => onChange({ ...data, curingType: e.target.value })}
                            className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            ❄️ {t('flower.curing.typeFroid')} (&lt;5°C)
                        </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="curingType"
                            value="chaud"
                            checked={data.curingType === 'chaud'}
                            onChange={(e) => onChange({ ...data, curingType: e.target.value })}
                            className="mr-2"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            🌡️ {t('flower.curing.typeChaud')} (&gt;5°C)
                        </span>
                    </label>
                </div>
            </div>

            {/* Pipeline Manager */}
            <PipelineManager
                pipelineId={data.curingPipelineId}
                pipelineType="curing"
                steps={data.curingSteps || []}
                onChange={(steps) => onChange({ ...data, curingSteps: steps })}
                stepDataFields={curingDataFields}
                intervalTypes={['secondes', 'minutes', 'heures', 'jours', 'semaines', 'mois']}
                title={t('flower.curing.pipelineTitle')}
                description={t('flower.curing.pipelineDescription')}
            />
        </div>
    )
}


