import { useState } from 'react'
import TimelineGrid from '../../TimelineGrid'
import { CULTURE_VALUES } from '../../../data/formValues'

/**
 * CulturePipeline REFONTE COMPLÈTE avec système Timeline visuel
 * Remplace l'ancien système de phases par une grille interactive type GitHub
 */
export default function CulturePipelineTimeline({ data, onChange }) {
    // Configuration Timeline
    const timelineConfig = data.cultureTimelineConfig || {
        type: 'jour', // jour | semaine | phase
        start: '',
        end: '',
        phases: [] // Si type="phase"
    }

    // Données de la timeline (array d'objets {timestamp, date, ...fields})
    const timelineData = data.cultureTimelineData || []

    // Champs éditables dans chaque cellule de la timeline
    const editableFields = [
        // Environnement
        { key: 'temperature', label: 'Température (°C)', icon: '🌡️', type: 'number', min: 0, max: 50, step: 0.1 },
        { key: 'humidite', label: 'Humidité (%)', icon: '💧', type: 'number', min: 0, max: 100 },
        { key: 'co2', label: 'CO2 (ppm)', icon: '🫧', type: 'number', min: 0 },
        { key: 'typeVentilation', label: 'Ventilation', icon: '🌀', type: 'select', options: CULTURE_VALUES.typeVentilation },

        // Lumière
        { key: 'typeLampe', label: 'Type de lampe', icon: '💡', type: 'select', options: CULTURE_VALUES.typeLampe },
        { key: 'spectreLumiere', label: 'Spectre', icon: '🌈', type: 'select', options: CULTURE_VALUES.spectreLumiere },
        { key: 'distanceLampe', label: 'Distance lampe (cm)', icon: '📏', type: 'number', min: 0 },
        { key: 'puissanceLumiere', label: 'Puissance (W)', icon: '⚡', type: 'number', min: 0 },
        { key: 'dureeEclairage', label: 'Durée éclairage (h)', icon: '⏱️', type: 'number', min: 0, max: 24, step: 0.5 },
        { key: 'dli', label: 'DLI (mol/m²/j)', icon: '☀️', type: 'number', min: 0, step: 0.1 },
        { key: 'ppfd', label: 'PPFD (µmol/m²/s)', icon: '🔆', type: 'number', min: 0 },
        { key: 'kelvin', label: 'Kelvin (K)', icon: '🌡️', type: 'number', min: 0 },

        // Irrigation
        { key: 'typeIrrigation', label: 'Type irrigation', icon: '💧', type: 'select', options: CULTURE_VALUES.typeIrrigation },
        { key: 'frequenceIrrigation', label: 'Fréquence irrigation', icon: '🔁', type: 'text', placeholder: '2x/jour' },
        { key: 'volumeEau', label: 'Volume eau (L)', icon: '🪣', type: 'number', min: 0, step: 0.1 },

        // Engrais
        { key: 'typeEngrais', label: 'Type engrais', icon: '🧪', type: 'select', options: CULTURE_VALUES.typeEngrais },
        { key: 'marqueEngrais', label: 'Marque engrais', icon: '🏷️', type: 'text', placeholder: 'BioBizz, AN...' },
        { key: 'dosageEngrais', label: 'Dosage engrais', icon: '💊', type: 'text', placeholder: '2 ml/L' },
        { key: 'frequenceEngrais', label: 'Fréquence engrais', icon: '📅', type: 'text', placeholder: '2x/semaine' },

        // Palissage
        { key: 'methodePalissage', label: 'Méthode palissage', icon: '✂️', type: 'select', options: CULTURE_VALUES.methodePalissage },
        { key: 'descriptionPalissage', label: 'Description palissage', icon: '📝', type: 'textarea', rows: 2, maxLength: 200 }
    ]

    // Handler pour modification de configuration
    const handleConfigChange = (field, value) => {
        onChange('cultureTimelineConfig', {
            ...timelineConfig,
            [field]: value
        })
    }

    // Handler pour modification de données timeline
    const handleTimelineDataChange = (timestamp, field, value) => {
        // Trouver ou créer l'entrée pour ce timestamp
        const existingIndex = timelineData.findIndex(d => d.timestamp === timestamp)

        if (existingIndex >= 0) {
            // Modifier l'entrée existante
            const newData = [...timelineData]
            newData[existingIndex] = {
                ...newData[existingIndex],
                [field]: value
            }
            onChange('cultureTimelineData', newData)
        } else {
            // Créer nouvelle entrée
            const cellDate = new Date(timestamp)
            const newEntry = {
                timestamp,
                date: cellDate.toISOString().split('T')[0],
                [field]: value
            }
            onChange('cultureTimelineData', [...timelineData, newEntry])
        }
    }

    return (
        <div className="space-y-8">
            {/* ===== CONFIGURATION GÉNÉRALE (avec SELECTs) ===== */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                    <span>🌱</span> Configuration générale
                </h3>

                <div className="space-y-6">
                    {/* Mode & Type espace */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                🏕️ Mode de culture <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={data.modeCulture || ''}
                                onChange={(e) => onChange('modeCulture', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Sélectionner...</option>
                                {CULTURE_VALUES.mode.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">📦 Type d'espace</label>
                            <select
                                value={data.typeEspace || ''}
                                onChange={(e) => onChange('typeEspace', e.target.value)}
                                className="w-full px-3 py-2 border-2 border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Sélectionner...</option>
                                {CULTURE_VALUES.typeEspace.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">📏 Dimensions (LxlxH)</label>
                            <input
                                type="text"
                                value={data.dimensions || ''}
                                onChange={(e) => onChange('dimensions', e.target.value)}
                                placeholder="120x120x200 cm"
                                className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">📐 Surface (m²)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.surfaceSol || ''}
                                onChange={(e) => onChange('surfaceSol', e.target.value)}
                                placeholder="1.44"
                                className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">📦 Volume (m³)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.volumeTotal || ''}
                                onChange={(e) => onChange('volumeTotal', e.target.value)}
                                placeholder="2.88"
                                className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Technique propagation - SELECT */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">🌰 Technique de propagation</label>
                        <select
                            value={data.techniquePropagation || ''}
                            onChange={(e) => onChange('techniquePropagation', e.target.value)}
                            className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Sélectionner...</option>
                            {CULTURE_VALUES.techniquePropagation.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Substrat global */}
                    <div className="border-t border-green-200 pt-4 mt-4">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <span>🧪</span> Substrat principal
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
                                <select
                                    value={data.typeSubstratGlobal || ''}
                                    onChange={(e) => onChange('typeSubstratGlobal', e.target.value)}
                                    className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">Sélectionner...</option>
                                    {CULTURE_VALUES.typeSubstrat.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Volume (L)</label>
                                <input
                                    type="number"
                                    value={data.volumeSubstratGlobal || ''}
                                    onChange={(e) => onChange('volumeSubstratGlobal', e.target.value)}
                                    placeholder="20"
                                    className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Composition</label>
                                <textarea
                                    value={data.compositionSubstratGlobal || ''}
                                    onChange={(e) => onChange('compositionSubstratGlobal', e.target.value)}
                                    placeholder="60% terre, 30% coco, 10% perlite..."
                                    rows="2"
                                    className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Marques des ingrédients (nom propre)</label>
                                <input
                                    type="text"
                                    value={data.marquesSubstratGlobal || ''}
                                    onChange={(e) => onChange('marquesSubstratGlobal', e.target.value)}
                                    placeholder="BioBizz All-Mix, Plagron Coco..."
                                    className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Récolte - avec SELECTs */}
                    <div className="border-t border-green-200 pt-4 mt-4">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <span>✂️</span> Informations récolte
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Couleur trichomes</label>
                                <select
                                    value={data.couleurTrichomes || ''}
                                    onChange={(e) => onChange('couleurTrichomes', e.target.value)}
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Sélectionner...</option>
                                    {CULTURE_VALUES.couleurTrichomes.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Date de récolte</label>
                                <input
                                    type="date"
                                    value={data.dateRecolte || ''}
                                    onChange={(e) => onChange('dateRecolte', e.target.value)}
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Poids brut (g)</label>
                                <input
                                    type="number"
                                    value={data.poidsBrut || ''}
                                    onChange={(e) => onChange('poidsBrut', e.target.value)}
                                    placeholder="500"
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Poids net (g)</label>
                                <input
                                    type="number"
                                    value={data.poidsNet || ''}
                                    onChange={(e) => onChange('poidsNet', e.target.value)}
                                    placeholder="450"
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Rendement (g/m² ou g/plante)</label>
                                <input
                                    type="text"
                                    value={data.rendement || ''}
                                    onChange={(e) => onChange('rendement', e.target.value)}
                                    placeholder="450 g/m² ou 150 g/plante"
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== TIMELINE VISUELLE (NOUVEAU SYSTÈME) ===== */}
            <div className="border-t-4 border-green-300 pt-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📊</span> Pipeline de culture - Timeline interactive
                </h3>
                <p className="text-sm text-gray-600 mb-6 italic">
                    📝 Visualisez et modifiez les données à chaque point de la culture.
                    Chaque case représente un moment (jour, semaine ou phase).
                    Cliquez sur une case pour éditer les paramètres à ce moment précis.
                </p>

                <TimelineGrid
                    data={timelineData}
                    onChange={handleTimelineDataChange}
                    config={timelineConfig}
                    editableFields={editableFields}
                />
            </div>
        </div>
    )
}
