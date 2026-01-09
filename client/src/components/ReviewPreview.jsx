import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import MobilePipelineView from './pipeline/MobilePipelineView'

/**
 * ReviewPreview - Affichage simple et complet de tous les éléments de la review
 * En read-only avec possibilité de voir les pipelines en détail
 */
export default function ReviewPreview({ formData = {}, photos = [] }) {
    const [expandedSections, setExpandedSections] = useState({
        infos: true,
        pipelines: true,
    })

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }))
    }

    const Section = ({ id, title, icon, children }) => (
        <div className="mb-4 border border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => toggleSection(id)}
                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h3 className="font-semibold text-white">{title}</h3>
                </div>
                {expandedSections[id] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>
            {expandedSections[id] && (
                <div className="p-4 bg-gray-900/50 space-y-3">
                    {children}
                </div>
            )}
        </div>
    )

    const InfoRow = ({ label, value }) => {
        if (!value) return null
        
        let displayValue = value
        if (typeof value === 'object') {
            displayValue = Array.isArray(value) ? value.join(', ') : JSON.stringify(value, null, 2)
        }

        return (
            <div className="flex gap-3 py-2 border-b border-gray-700/50">
                <span className="font-medium text-gray-300 min-w-[200px]">{label}:</span>
                <span className="text-gray-100 flex-1 whitespace-pre-wrap break-words">
                    {displayValue}
                </span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Aperçu Review
                    </h1>
                    <p className="text-gray-400">
                        Tous les éléments de votre review en lecture seule
                    </p>
                </div>

                {/* Photos */}
                {photos.length > 0 && (
                    <Section id="photos" title="Photos" icon="📸">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {photos.map((photo, idx) => (
                                <img
                                    key={idx}
                                    src={photo.preview || photo.src || URL.createObjectURL(photo.file)}
                                    alt={`Photo ${idx + 1}`}
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Infos Générales */}
                <Section id="infos" title="Informations Générales" icon="📋">
                    <InfoRow label="Nom commercial" value={formData.nomCommercial} />
                    <InfoRow label="Type" value={formData.type} />
                    <InfoRow label="Cultivar(s)" value={formData.cultivarsList} />
                    <InfoRow label="Farm/Producteur" value={formData.farm} />
                    <InfoRow label="Description" value={formData.description} />
                </Section>

                {/* Culture Pipeline */}
                {formData.culturePipeline && Object.keys(formData.culturePipeline).length > 0 && (
                    <Section id="culturePipeline" title="Pipeline Culture" icon="🌱">
                        <MobilePipelineView
                            cells={formData.culturePipeline}
                            config={formData.culturePipelineConfig}
                            readOnly={true}
                        />
                    </Section>
                )}

                {/* Extraction Pipeline (pour Hash/Concentré) */}
                {formData.extractionPipeline && Object.keys(formData.extractionPipeline).length > 0 && (
                    <Section id="extractionPipeline" title="Pipeline Extraction" icon="⚗️">
                        <MobilePipelineView
                            cells={formData.extractionPipeline}
                            config={formData.extractionPipelineConfig}
                            readOnly={true}
                        />
                    </Section>
                )}

                {/* Separation Pipeline (pour Hash) */}
                {formData.separationPipeline && Object.keys(formData.separationPipeline).length > 0 && (
                    <Section id="separationPipeline" title="Pipeline Séparation" icon="⚗️">
                        <MobilePipelineView
                            cells={formData.separationPipeline}
                            config={formData.separationPipelineConfig}
                            readOnly={true}
                        />
                    </Section>
                )}

                {/* Curing Pipeline */}
                {formData.curingPipeline && Object.keys(formData.curingPipeline).length > 0 && (
                    <Section id="curingPipeline" title="Pipeline Curing & Maturation" icon="🔥">
                        <MobilePipelineView
                            cells={formData.curingPipeline}
                            config={formData.curingPipelineConfig}
                            readOnly={true}
                        />
                    </Section>
                )}

                {/* Visuel & Technique */}
                {formData.visual && Object.keys(formData.visual).length > 0 && (
                    <Section id="visual" title="Visuel & Technique" icon="👁️">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(formData.visual).map(([key, value]) => (
                                <div key={key} className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{value}/10</div>
                                    <div className="text-xs text-gray-400 capitalize mt-1">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Odeurs */}
                {formData.odeurs && (Object.keys(formData.odeurs).length > 0 || formData.odeurs.notes) && (
                    <Section id="odeurs" title="Odeurs" icon="👃">
                        <InfoRow label="Intensité" value={formData.odeurs.intensity} />
                        <InfoRow label="Notes dominantes" value={formData.odeurs.dominant} />
                        <InfoRow label="Notes secondaires" value={formData.odeurs.secondary} />
                        <InfoRow label="Description" value={formData.odeurs.description} />
                    </Section>
                )}

                {/* Texture */}
                {formData.texture && Object.keys(formData.texture).length > 0 && (
                    <Section id="texture" title="Texture" icon="🤚">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(formData.texture).map(([key, value]) => (
                                <div key={key} className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{value}/10</div>
                                    <div className="text-xs text-gray-400 capitalize mt-1">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Goûts */}
                {formData.gouts && (Object.keys(formData.gouts).length > 0 || formData.gouts.notes) && (
                    <Section id="gouts" title="Goûts" icon="😋">
                        <InfoRow label="Intensité" value={formData.gouts.intensity} />
                        <InfoRow label="Saveurs dominantes" value={formData.gouts.dominant} />
                        <InfoRow label="Notes secondaires" value={formData.gouts.secondary} />
                        <InfoRow label="Description" value={formData.gouts.description} />
                    </Section>
                )}

                {/* Effets */}
                {formData.effets && (Object.keys(formData.effets).length > 0 || formData.effets.effects) && (
                    <Section id="effets" title="Effets Ressentis" icon="💥">
                        <InfoRow label="Montée (rapidité)" value={formData.effets.onset} />
                        <InfoRow label="Intensité" value={formData.effets.intensity} />
                        <InfoRow label="Effets" value={formData.effets.effects} />
                        <InfoRow label="Effets secondaires" value={formData.effets.sideEffects} />
                        <InfoRow label="Durée" value={formData.effets.duration} />
                    </Section>
                )}

                {/* Analytiques */}
                {formData.analytics && Object.keys(formData.analytics).length > 0 && (
                    <Section id="analytics" title="Données Analytiques" icon="🔬">
                        <InfoRow label="THC %" value={formData.analytics.thc} />
                        <InfoRow label="CBD %" value={formData.analytics.cbd} />
                        <InfoRow label="CBG %" value={formData.analytics.cbg} />
                        <InfoRow label="Profil terpénique" value={formData.analytics.terpenes} />
                    </Section>
                )}

                {/* Raw Data (pour debug) */}
                {process.env.NODE_ENV === 'development' && (
                    <Section id="rawData" title="Données Brutes (Dev)" icon="⚙️">
                        <pre className="bg-black/50 p-3 rounded text-xs overflow-auto text-gray-300">
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                    </Section>
                )}
            </div>
        </div>
    )
}
