import React, { useState } from 'react'
import { Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'
import { LiquidModal, LiquidButton, LiquidInput, LiquidSelect, LiquidCard } from '@/components/ui/LiquidUI'

/**
 * Modal de vérification d'âge conforme au cahier des charges
 * Collecte date de naissance + pays/région
 * Affiche disclaimer RDR adapté
 * Liquid Glass UI Design System
 */
export default function AgeVerificationModal({ isOpen, onClose, onVerified }) {
    const [step, setStep] = useState(1) // 1: birthdate, 2: country, 3: disclaimer, 4: success
    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('')
    const [region, setRegion] = useState('')
    const [consentRDR, setConsentRDR] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Liste des pays autorisés (selon config backend)
    const countries = [
        { code: 'FR', name: 'France', minAge: 18, regions: [] },
        { code: 'ES', name: 'Espagne', minAge: 18, regions: [] },
        { code: 'IT', name: 'Italie', minAge: 18, regions: [] },
        { code: 'DE', name: 'Allemagne', minAge: 18, regions: [] },
        { code: 'BE', name: 'Belgique', minAge: 18, regions: [] },
        { code: 'NL', name: 'Pays-Bas', minAge: 18, regions: [] },
        { code: 'CH', name: 'Suisse', minAge: 18, regions: [] },
        {
            code: 'US', name: 'États-Unis', minAge: 21, regions: [
                'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
            ]
        },
        {
            code: 'CA', name: 'Canada', minAge: 19, regions: [
                'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
            ]
        },
    ]

    const selectedCountry = countries.find(c => c.code === country)

    const disclaimers = {
        FR: "Le cannabis est une substance pouvant présenter des risques pour la santé. Sa consommation est réglementée en France. Terpologie est un outil de documentation uniquement.",
        US: "Cannabis use may have health risks. Use is regulated by state law. This platform is for documentation purposes only. You must comply with your local laws.",
        CA: "L'usage du cannabis peut comporter des risques pour la santé. Respectez les lois de votre province. Cette plateforme est à usage documentaire uniquement.",
        default: "L'usage de cannabis peut comporter des risques pour la santé. Respectez la législation de votre pays. Cet outil est destiné à la documentation uniquement."
    }

    const handleNextStep = () => {
        setError('')
        if (step === 1) {
            if (!birthdate) {
                setError('Veuillez saisir votre date de naissance')
                return
            }
            // Vérifier format date
            const date = new Date(birthdate)
            if (isNaN(date.getTime())) {
                setError('Date invalide')
                return
            }
            setStep(2)
        } else if (step === 2) {
            if (!country) {
                setError('Veuillez sélectionner votre pays')
                return
            }
            if (selectedCountry?.regions?.length > 0 && !region) {
                setError('Veuillez sélectionner votre région/état')
                return
            }
            setStep(3)
        } else if (step === 3) {
            if (!consentRDR) {
                setError('Vous devez accepter le disclaimer RDR pour continuer')
                return
            }
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/legal/verify-age', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    birthdate,
                    country,
                    region: region || null,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Erreur lors de la vérification')
                setLoading(false)
                return
            }

            // Enregistrer le consentement RDR
            await fetch('/api/legal/accept-consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ consent: true })
            })

            setStep(4)
            setTimeout(() => {
                onVerified?.(data)
                onClose?.()
            }, 2000)
        } catch (err) {
            setError('Erreur de connexion au serveur')
            setLoading(false)
        }
    }

    const getStepTitle = () => {
        if (step === 4) return 'Vérification réussie'
        return 'Vérification d\'âge requise'
    }

    const getStepSubtitle = () => {
        if (step === 1) return 'Confirmez votre date de naissance'
        if (step === 2) return 'Indiquez votre pays de résidence'
        if (step === 3) return 'Prenez connaissance du disclaimer RDR'
        if (step === 4) return 'Votre compte est maintenant vérifié'
    }

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={step < 4 ? undefined : onClose}
            title={
                <div className="flex items-center gap-3">
                    {step < 4 ? (
                        <AlertCircle className="w-6 h-6 text-amber-400" />
                    ) : (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                    )}
                    <span>{getStepTitle()}</span>
                </div>
            }
            size="lg"
            glowColor={step === 4 ? 'green' : 'amber'}
        >
            <div className="space-y-6">
                <p className="text-white/60">{getStepSubtitle()}</p>

                {/* Étape 1 : Date de naissance */}
                {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-3 text-white">
                            <Calendar className="w-5 h-5 text-violet-400" />
                            <h3 className="text-lg font-semibold">Date de naissance</h3>
                        </div>
                        <p className="text-white/60 text-sm">
                            Vous devez avoir au moins 18 ans (ou 21 ans selon votre pays) pour accéder à cette plateforme.
                        </p>
                        
                        {/* Sélection de la date avec 3 selects */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-white/50 mb-1 block">Jour</label>
                                <select
                                    value={birthdate ? new Date(birthdate).getDate() : ''}
                                    onChange={(e) => {
                                        const day = e.target.value
                                        const currentDate = birthdate ? new Date(birthdate) : new Date(2000, 0, 1)
                                        currentDate.setDate(parseInt(day))
                                        setBirthdate(currentDate.toISOString().split('T')[0])
                                    }}
                                    className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500/50 focus:outline-none transition-colors"
                                >
                                    <option value="" className="bg-gray-900">JJ</option>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                        <option key={d} value={d} className="bg-gray-900">{d.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-1 block">Mois</label>
                                <select
                                    value={birthdate ? new Date(birthdate).getMonth() : ''}
                                    onChange={(e) => {
                                        const month = e.target.value
                                        const currentDate = birthdate ? new Date(birthdate) : new Date(2000, 0, 1)
                                        currentDate.setMonth(parseInt(month))
                                        setBirthdate(currentDate.toISOString().split('T')[0])
                                    }}
                                    className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500/50 focus:outline-none transition-colors"
                                >
                                    <option value="" className="bg-gray-900">MM</option>
                                    {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => (
                                        <option key={i} value={i} className="bg-gray-900">{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-white/50 mb-1 block">Année</label>
                                <select
                                    value={birthdate ? new Date(birthdate).getFullYear() : ''}
                                    onChange={(e) => {
                                        const year = e.target.value
                                        const currentDate = birthdate ? new Date(birthdate) : new Date(2000, 0, 1)
                                        currentDate.setFullYear(parseInt(year))
                                        setBirthdate(currentDate.toISOString().split('T')[0])
                                    }}
                                    className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500/50 focus:outline-none transition-colors"
                                >
                                    <option value="" className="bg-gray-900">AAAA</option>
                                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 10 - i).map(y => (
                                        <option key={y} value={y} className="bg-gray-900">{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {birthdate && (
                            <p className="text-sm text-violet-400">
                                Date sélectionnée : {new Date(birthdate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                )}

                {/* Étape 2 : Pays et région */}
                {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center gap-3 text-white">
                            <MapPin className="w-5 h-5 text-violet-400" />
                            <h3 className="text-lg font-semibold">Pays de résidence</h3>
                        </div>

                        <LiquidSelect
                            label="Pays *"
                            value={country}
                            onChange={(value) => {
                                setCountry(value)
                                setRegion('')
                            }}
                            options={[
                                { value: '', label: '-- Sélectionnez votre pays --' },
                                ...countries.map(c => ({
                                    value: c.code,
                                    label: `${c.name} (âge minimum : ${c.minAge} ans)`
                                }))
                            ]}
                        />

                        {selectedCountry?.regions?.length > 0 && (
                            <LiquidSelect
                                label="État / Province *"
                                value={region}
                                onChange={(value) => setRegion(value)}
                                options={[
                                    { value: '', label: '-- Sélectionnez votre état --' },
                                    ...selectedCountry.regions.map(r => ({ value: r, label: r }))
                                ]}
                            />
                        )}
                    </div>
                )}

                {/* Étape 3 : Disclaimer RDR */}
                {step === 3 && (
                    <div className="space-y-4 animate-fade-in flex flex-col max-h-[70vh]">
                        <div className="flex items-center gap-3 text-white flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-semibold">Disclaimer RDR (Réduction Des Risques)</h3>
                        </div>

                        <div className="overflow-y-auto flex-1 min-h-0 pr-2 space-y-4">
                            <LiquidCard
                                className="p-6"
                                style={{
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    borderColor: 'rgba(251, 191, 36, 0.3)',
                                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.15)'
                                }}
                            >
                                <p className="font-semibold text-amber-300 mb-3">⚠️ Avertissement Important</p>
                                <p className="text-white/80 mb-4">
                                    {disclaimers[country] || disclaimers.default}
                                </p>
                                <ul className="space-y-2 text-sm text-white/70 list-disc list-inside">
                                    <li>L'usage de cannabis peut affecter la mémoire, la concentration et les réflexes</li>
                                    <li>Ne consommez pas avant de conduire ou d'utiliser des machines</li>
                                    <li>Consultez un professionnel de santé en cas de questions</li>
                                    <li>Respectez la législation en vigueur dans votre pays</li>
                                </ul>
                            </LiquidCard>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-white/10 hover:border-violet-500/50 transition-colors flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={consentRDR}
                                onChange={(e) => setConsentRDR(e.target.checked)}
                                className="w-5 h-5 rounded border-white/30 bg-white/5 mt-0.5 accent-violet-500 flex-shrink-0"
                            />
                            <span className="text-white/80 text-sm group-hover:text-white transition-colors">
                                J'ai lu et compris ce disclaimer. Je confirme avoir l'âge légal requis dans mon pays et je m'engage à respecter la législation en vigueur.
                            </span>
                        </label>
                    </div>
                )}

                {/* Étape 4 : Succès */}
                {step === 4 && (
                    <div className="text-center space-y-4 animate-fade-in py-8">
                        <div
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full"
                            style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)'
                            }}
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Vérification réussie !</h3>
                        <p className="text-white/60">
                            Votre âge et votre pays ont été vérifiés. Vous allez être redirigé...
                        </p>
                    </div>
                )}

                {/* Erreurs */}
                {error && (
                    <LiquidCard
                        className="p-4"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <p className="text-red-400 text-sm font-semibold">❌ {error}</p>
                    </LiquidCard>
                )}

                {/* Actions */}
                {step < 4 && (
                    <div className="flex gap-3 pt-4">
                        {step > 1 && (
                            <LiquidButton
                                onClick={() => setStep(step - 1)}
                                disabled={loading}
                                variant="ghost"
                            >
                                Retour
                            </LiquidButton>
                        )}
                        <LiquidButton
                            onClick={handleNextStep}
                            disabled={loading}
                            variant="primary"
                            className="flex-1"
                            loading={loading}
                        >
                            {loading ? 'Vérification...' : step === 3 ? 'Vérifier mon âge' : 'Continuer'}
                        </LiquidButton>
                    </div>
                )}
            </div>
        </LiquidModal>
    )
}


