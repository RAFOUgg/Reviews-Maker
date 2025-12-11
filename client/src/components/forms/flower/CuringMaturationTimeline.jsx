import { useState } from 'react'
import TimelineGrid from '../../TimelineGrid'
import { CURING_VALUES } from '../../../data/formValues'

/**
 * CuringMaturationTimeline - Version enrichie avec Timeline et tous les champs du cahier des charges
 * Ajout: type maturation, emballage primaire, opacité récipient, volume occupé
 */
export default function CuringMaturationTimeline({ data, onChange }) {
    // Configuration Timeline pour curing (intervalles : secondes, minutes, heures)
    const curingTimelineConfig = data.curingTimelineConfig || {
        type: 'jour', // seconde | minute | heure | jour
        start: '',
        end: ''
    }

    // Données de la timeline curing
    const curingTimelineData = data.curingTimelineData || []

    // Champs éditables dans la timeline curing
    const curingEditableFields = [
        { key: 'temperature', label: 'Température (°C)', icon: '🌡️', type: 'number', min: 0, max: 30, step: 0.1 },
        { key: 'humidite', label: 'Humidité (%)', icon: '💧', type: 'number', min: 0, max: 100 },
        { key: 'conteneur', label: 'Type de récipient', icon: '🏺', type: 'select', options: CURING_VALUES.typeRecipient },
        { key: 'ballotage', label: 'Ballotage effectué', icon: '🔄', type: 'select', options: [
            { value: 'oui', label: 'Oui (quotidien)' },
            { value: 'occasionnel', label: 'Occasionnel' },
            { value: 'non', label: 'Non' }
        ]},
        { key: 'observations', label: 'Observations odeur/texture', icon: '👃', type: 'textarea', rows: 2, maxLength: 300 }
    ]

    // Handler pour modification de configuration timeline
    const handleCuringConfigChange = (field, value) => {
        onChange('curingTimelineConfig', {
            ...curingTimelineConfig,
            [field]: value
        })
    }

    // Handler pour modification de données timeline curing
    const handleCuringTimelineDataChange = (timestamp, field, value) => {
        const existingIndex = curingTimelineData.findIndex(d => d.timestamp === timestamp)

        if (existingIndex >= 0) {
            const newData = [...curingTimelineData]
            newData[existingIndex] = {
                ...newData[existingIndex],
                [field]: value
            }
            onChange('curingTimelineData', newData)
        } else {
            const cellDate = new Date(timestamp)
            const newEntry = {
                timestamp,
                date: cellDate.toISOString().split('T')[0],
                [field]: value
            }
            onChange('curingTimelineData', [...curingTimelineData, newEntry])
        }
    }

    return (
        <div className="space-y-8">
            {/* Informations générales curing */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
                <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <span>🔥</span> Configuration générale du curing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type de maturation (NOUVEAU) */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            ❄️ Type de maturation
                        </label>
                        <select
                            value={data.typeMaturation || ''}
                            onChange={(e) => onChange('typeMaturation', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Sélectionner...</option>
                            {CURING_VALUES.typeMaturation.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Méthode de séchage */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            🔪 Méthode de séchage
                        </label>
                        <select
                            value={data.methodeSechage || ''}
                            onChange={(e) => onChange('methodeSechage', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Sélectionner...</option>
                            {CURING_VALUES.methodeSechage.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type de récipient global */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            🏺 Type de récipient principal
                        </label>
                        <select
                            value={data.typeRecipient || ''}
                            onChange={(e) => onChange('typeRecipient', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Sélectionner...</option>
                            {CURING_VALUES.typeRecipient.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Emballage/Ballotage primaire (NOUVEAU) */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            📦 Emballage/Ballotage primaire
                        </label>
                        <select
                            value={data.emballagePrimaire || ''}
                            onChange={(e) => onChange('emballagePrimaire', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Sélectionner...</option>
                            {CURING_VALUES.emballagePrimaire.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Opacité du récipient (NOUVEAU) */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            🌑 Opacité du récipient
                        </label>
                        <select
                            value={data.opaciteRecipient || ''}
                            onChange={(e) => onChange('opaciteRecipient', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Sélectionner...</option>
                            {CURING_VALUES.opaciteRecipient.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Volume occupé par le produit (NOUVEAU) */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            📏 Volume occupé dans le récipient
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.volumeOccupe || ''}
                                onChange={(e) => onChange('volumeOccupe', e.target.value)}
                                placeholder="500"
                                className="flex-1 px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <select
                                value={data.volumeOccupeUnite || 'mL'}
                                onChange={(e) => onChange('volumeOccupeUnite', e.target.value)}
                                className="px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="L">L (litres)</option>
                                <option value="mL">mL (millilitres)</option>
                            </select>
                        </div>
                    </div>

                    {/* Durée totale de curing */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            ⏱️ Durée totale de curing
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="0"
                                value={data.dureeCuring || ''}
                                onChange={(e) => onChange('dureeCuring', e.target.value)}
                                placeholder="14"
                                className="flex-1 px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <select
                                value={data.dureeCuringUnite || 'jours'}
                                onChange={(e) => onChange('dureeCuringUnite', e.target.value)}
                                className="px-3 py-2 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="jours">Jours</option>
                                <option value="semaines">Semaines</option>
                                <option value="mois">Mois</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline du curing (NOUVEAU SYSTÈME) */}
            <div className="border-t-4 border-amber-300 pt-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span> Pipeline de curing - Timeline interactive
                </h3>
                <p className="text-sm text-gray-600 mb-6 italic">
                    📝 Visualisez l'évolution du curing dans le temps.
                    Chaque case représente un moment (jour, heure, etc.).
                    Cliquez pour documenter température, humidité, observations à chaque étape.
                </p>

                <TimelineGrid
                    data={curingTimelineData}
                    onChange={handleCuringTimelineDataChange}
                    config={curingTimelineConfig}
                    editableFields={curingEditableFields}
                />
            </div>

            {/* Note informative */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-sm text-amber-800">
                    <span className="font-semibold">ℹ️ Conseil:</span> Le curing est une étape cruciale qui développe les arômes et la qualité du produit final. Documentez précisément les paramètres pour reproduire vos meilleurs résultats.
                </p>
            </div>
        </div>
    )
}
