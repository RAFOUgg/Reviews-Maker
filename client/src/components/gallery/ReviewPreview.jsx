import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import MobilePipelineView from '../pipelines/views/MobilePipelineView'

/**
 * ReviewPreview - Affichage simple et complet de TOUS les éléments de la review
 * En read-only avec possibilité de voir les pipelines en détail
 * Affiche chaque champ présent dans les données, aucun n'est oublié
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

    const Section = ({ id, title, icon, children, isEmpty = false }) => (
        <div className="mb-4 border border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => toggleSection(id)}
                className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h3 className="font-semibold text-white">{title}</h3>
                    {isEmpty && <span className="text-xs text-gray-500 ml-2">(vide)</span>}
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

    const InfoRow = ({ label, value, className = '' }) => {
        if (value === undefined || value === null || value === '') return null

        let displayValue = value
        if (typeof value === 'boolean') {
            displayValue = value ? 'Oui' : 'Non'
        } else if (typeof value === 'object') {
            displayValue = Array.isArray(value) ? value.filter(v => v).join(', ') : JSON.stringify(value, null, 2)
        } else if (typeof value === 'number') {
            displayValue = value
        }

        return (
            <div className={`flex gap-3 py-2 border-b border-gray-700/50 ${className}`}>
                <span className="font-medium text-gray-300 min-w-[100px] sm:min-w-[200px] shrink-0">{label}:</span>
                <span className="text-gray-100 flex-1 whitespace-pre-wrap break-words">
                    {displayValue}
                </span>
            </div>
        )
    }

    const RatingDisplay = ({ label, value }) => {
        if (!value) return null
        return (
            <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{value}/10</div>
                <div className="text-xs text-gray-400 capitalize mt-1">{label}</div>
            </div>
        )
    }

    // Helper pour rendre tous les champs d'un objet
    const renderAllFields = (obj, excludeKeys = []) => {
        if (!obj || typeof obj !== 'object') return null

        const entries = Object.entries(obj).filter(([key]) => !excludeKeys.includes(key))

        if (entries.length === 0) return <span className="text-gray-500 italic">Aucune donnée</span>

        return entries.map(([key, value]) => (
            <InfoRow
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toLowerCase()}
                value={value}
            />
        ))
    }

    return (
        <div className="min-h-screen bg-gray-950 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Aperçu Complet de la Review
                    </h1>
                    <p className="text-gray-400">
                        Tous les éléments sauvegardés en lecture seule
                    </p>
                </div>

                {/* Photos */}
                {photos.length > 0 && (
                    <Section id="photos" title="Photos" icon="📸">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {photos.map((photo, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={photo.preview || photo.src || (photo.file ? URL.createObjectURL(photo.file) : '')}
                                        alt={`Photo ${idx + 1}`}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                        <span className="text-white text-sm">Photo {idx + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Infos Générales */}
                {(formData.nomCommercial || formData.type || formData.cultivarsList || formData.farm || formData.hashmaker) && (
                    <Section id="infos" title="Informations Générales" icon="📋">
                        <InfoRow label="Nom commercial" value={formData.nomCommercial} />
                        <InfoRow label="Type" value={formData.type} />
                        <InfoRow label="Cultivar(s)" value={formData.cultivarsList} />
                        <InfoRow label="Farm/Producteur" value={formData.farm || formData.hashmaker} />
                        <InfoRow label="Laboratoire" value={formData.laboratoire} />
                        <InfoRow label="Description" value={formData.description} />
                        {/* Tous les autres champs infos */}
                        {renderAllFields(formData, ['photos', 'nomCommercial', 'type', 'cultivarsList', 'farm', 'hashmaker', 'laboratoire', 'description', 'culturePipeline', 'curingPipeline', 'extractionPipeline', 'separationPipeline', 'visual', 'odeurs', 'texture', 'gouts', 'effets', 'analytics', 'experience', 'genetiques', 'genetics', 'cultivarInfo'])}
                    </Section>
                )}

                {/* Génétiques (Fleurs) */}
                {formData.genetiques && Object.keys(formData.genetiques).length > 0 && (
                    <Section id="genetics" title="Génétiques & Phénotype" icon="🧬">
                        {renderAllFields(formData.genetiques)}
                    </Section>
                )}

                {/* Culture Pipeline */}
                {formData.culturePipeline && Object.keys(formData.culturePipeline).length > 0 && (
                    <Section id="culturePipeline" title="Pipeline Culture" icon="🌱">
                        <InfoRow label="Configuration" value={JSON.stringify(formData.culturePipelineConfig, null, 2)} />
                        <div className="mt-4">
                            <MobilePipelineView
                                cells={formData.culturePipeline}
                                config={formData.culturePipelineConfig}
                                readOnly={true}
                            />
                        </div>
                    </Section>
                )}

                {/* Extraction Pipeline (Hash/Concentré) */}
                {formData.extractionPipeline && Object.keys(formData.extractionPipeline).length > 0 && (
                    <Section id="extractionPipeline" title="Pipeline Extraction" icon="⚗️">
                        <InfoRow label="Configuration" value={JSON.stringify(formData.extractionPipelineConfig, null, 2)} />
                        <div className="mt-4">
                            <MobilePipelineView
                                cells={formData.extractionPipeline}
                                config={formData.extractionPipelineConfig}
                                readOnly={true}
                            />
                        </div>
                    </Section>
                )}

                {/* Separation Pipeline (Hash) */}
                {formData.separationPipeline && Object.keys(formData.separationPipeline).length > 0 && (
                    <Section id="separationPipeline" title="Pipeline Séparation" icon="⚗️">
                        <InfoRow label="Configuration" value={JSON.stringify(formData.separationPipelineConfig, null, 2)} />
                        <div className="mt-4">
                            <MobilePipelineView
                                cells={formData.separationPipeline}
                                config={formData.separationPipelineConfig}
                                readOnly={true}
                            />
                        </div>
                    </Section>
                )}

                {/* Curing Pipeline */}
                {formData.curing && Object.keys(formData.curing).length > 0 && (
                    <Section id="curingPipeline" title="Pipeline Curing & Maturation" icon="🔥">
                        <InfoRow label="Configuration" value={JSON.stringify(formData.curingConfig, null, 2)} />
                        <div className="mt-4">
                            <MobilePipelineView
                                cells={formData.curing}
                                config={formData.curingConfig}
                                readOnly={true}
                            />
                        </div>
                    </Section>
                )}

                {/* Visuel & Technique */}
                {formData.visual && Object.keys(formData.visual).length > 0 && (
                    <Section id="visual" title="Visuel & Technique" icon="👁️">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(formData.visual).map(([key, value]) => (
                                <RatingDisplay key={key} label={key} value={value} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Odeurs */}
                {formData.odeurs && Object.keys(formData.odeurs).length > 0 && (
                    <Section id="odeurs" title="Odeurs" icon="👃">
                        <InfoRow label="Intensité" value={formData.odeurs.intensity} />
                        <InfoRow label="Fidélité cultivars" value={formData.odeurs.fideliteCultivars} />
                        <InfoRow label="Notes dominantes" value={formData.odeurs.dominant} />
                        <InfoRow label="Notes secondaires" value={formData.odeurs.secondary} />
                        <InfoRow label="Arômes inhalation primaires" value={formData.odeurs.inhalationPrimary} />
                        <InfoRow label="Arômes inhalation secondaires" value={formData.odeurs.inhalationSecondary} />
                        <InfoRow label="Description" value={formData.odeurs.description} />
                        {renderAllFields(formData.odeurs, ['intensity', 'dominant', 'secondary', 'description', 'fidelityCultivars', 'inhalationPrimary', 'inhalationSecondary'])}
                    </Section>
                )}

                {/* Texture */}
                {formData.texture && Object.keys(formData.texture).length > 0 && (
                    <Section id="texture" title="Texture" icon="🤚">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(formData.texture).map(([key, value]) => (
                                <RatingDisplay key={key} label={key} value={value} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Goûts */}
                {formData.gouts && Object.keys(formData.gouts).length > 0 && (
                    <Section id="gouts" title="Goûts" icon="😋">
                        <InfoRow label="Intensité" value={formData.gouts.intensity} />
                        <InfoRow label="Agressivité/Piquant" value={formData.gouts.aggressiveness} />
                        <InfoRow label="Dry puff" value={formData.gouts.dryPuff} />
                        <InfoRow label="Inhalation" value={formData.gouts.inhalation} />
                        <InfoRow label="Expiration/Arrière-goût" value={formData.gouts.expiration} />
                        <InfoRow label="Description" value={formData.gouts.description} />
                        {renderAllFields(formData.gouts, ['intensity', 'aggressiveness', 'dryPuff', 'inhalation', 'expiration', 'description'])}
                    </Section>
                )}

                {/* Effets */}
                {formData.effets && Object.keys(formData.effets).length > 0 && (
                    <Section id="effets" title="Effets Ressentis" icon="💥">
                        <InfoRow label="Montée (rapidité)" value={formData.effets.onset} />
                        <InfoRow label="Intensité" value={formData.effets.intensity} />
                        <InfoRow label="Effets" value={formData.effets.effects} />
                        <InfoRow label="Durée des effets" value={formData.effets.duration} />
                        <InfoRow label="Effets secondaires" value={formData.effets.sideEffects} />
                        <InfoRow label="Usage préféré" value={formData.effets.usage} />
                        {renderAllFields(formData.effets, ['onset', 'intensity', 'effects', 'duration', 'sideEffects', 'usage'])}
                    </Section>
                )}

                {/* Expérience d'utilisation */}
                {formData.experience && Object.keys(formData.experience).length > 0 && (
                    <Section id="experience" title="Expérience d'Utilisation" icon="🧪">
                        <InfoRow label="Méthode de consommation" value={formData.experience.consumptionMethod} />
                        <InfoRow label="Dosage utilisé" value={formData.experience.dosage} />
                        <InfoRow label="Heure début des effets" value={formData.experience.timeOfOnset} />
                        <InfoRow label="Durée des effets" value={formData.experience.durationOfEffects} />
                        <InfoRow label="Contexte d'usage" value={formData.experience.usageContext} />
                        <InfoRow label="Notes" value={formData.experience.notes} />
                        {renderAllFields(formData.experience, ['consumptionMethod', 'dosage', 'timeOfOnset', 'durationOfEffects', 'usageContext', 'notes'])}
                    </Section>
                )}

                {/* Analytiques */}
                {formData.analytics && Object.keys(formData.analytics).length > 0 && (
                    <Section id="analytics" title="Données Analytiques" icon="🔬">
                        <InfoRow label="THC %" value={formData.analytics.thc} />
                        <InfoRow label="CBD %" value={formData.analytics.cbd} />
                        <InfoRow label="CBG %" value={formData.analytics.cbg} />
                        <InfoRow label="CBC %" value={formData.analytics.cbc} />
                        <InfoRow label="Profil terpénique" value={formData.analytics.terpenes} />
                        <InfoRow label="Certificat d'analyse" value={formData.analytics.certificate} />
                        {renderAllFields(formData.analytics, ['thc', 'cbd', 'cbg', 'cbc', 'terpenes', 'certificate'])}
                    </Section>
                )}

                {/* Données Brutes (pour debug/données supplémentaires) */}
                {process.env.NODE_ENV === 'development' && (
                    <Section id="rawData" title="Données Complètes (Dev)" icon="⚙️">
                        <pre className="bg-black/50 p-3 rounded text-xs overflow-auto text-gray-300 max-h-96">
                            {JSON.stringify(formData, null, 2)}
                        </pre>
                    </Section>
                )}
            </div>
        </div>
    )
}


