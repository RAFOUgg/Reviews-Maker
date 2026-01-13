import React, { useState } from 'react'
import { Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'

/**
 * Modal de vérification d'âge conforme au cahier des charges
 * Collecte date de naissance + pays/région
 * Affiche disclaimer RDR adapté
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
            await fetch('/api/legal/consent-rdr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
            <div className="glass rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r p-6 text-white">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                        {step < 4 && <AlertCircle className="w-8 h-8" />}
                        {step === 4 && <CheckCircle2 className="w-8 h-8 text-green-400" />}
                        {step < 4 ? 'Vérification d\'âge requise' : 'Vérification réussie'}
                    </h2>
                    <p className="text-white/90 mt-2">
                        {step === 1 && 'Confirmez votre date de naissance'}
                        {step === 2 && 'Indiquez votre pays de résidence'}
                        {step === 3 && 'Prenez connaissance du disclaimer RDR'}
                        {step === 4 && 'Votre compte est maintenant vérifié'}
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 bg-white">
                    {/* Étape 1 : Date de naissance */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Date de naissance</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Vous devez avoir au moins 18 ans (ou 21 ans selon votre pays) pour accéder à cette plateforme.
                            </p>
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl border-2 focus: focus:ring-2 focus: transition-all"
                            />
                        </div>
                    )}

                    {/* Étape 2 : Pays et région */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Pays de résidence</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Pays *
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => {
                                        setCountry(e.target.value)
                                        setRegion('')
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border-2 focus: focus:ring-2 focus: transition-all"
                                >
                                    <option value="">-- Sélectionnez --</option>
                                    {countries.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.name} (âge minimum : {c.minAge} ans)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCountry?.regions?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        État / Province *
                                    </label>
                                    <select
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 focus: focus:ring-2 focus: transition-all"
                                    >
                                        <option value="">-- Sélectionnez --</option>
                                        {selectedCountry.regions.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Étape 3 : Disclaimer RDR */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Disclaimer RDR (Réduction Des Risques)</h3>
                            </div>

                            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-gray-800 leading-relaxed">
                                <p className="font-semibold text-lg mb-3">⚠️ Avertissement Important</p>
                                <p className="mb-4">
                                    {disclaimers[country] || disclaimers.default}
                                </p>
                                <ul className="space-y-2 text-sm list-disc list-inside">
                                    <li>L'usage de cannabis peut affecter la mémoire, la concentration et les réflexes</li>
                                    <li>Ne consommez pas avant de conduire ou d'utiliser des machines</li>
                                    <li>Consultez un professionnel de santé en cas de questions</li>
                                    <li>Respectez la législation en vigueur dans votre pays</li>
                                </ul>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={consentRDR}
                                    onChange={(e) => setConsentRDR(e.target.checked)}
                                    className="w-6 h-6 rounded border-2 focus:ring-2 focus: transition-all mt-1"
                                />
                                <span className="text-gray-800 text-sm group-hover: transition-colors">
                                    J'ai lu et compris ce disclaimer. Je confirme avoir l'âge légal requis dans mon pays et je m'engage à respecter la législation en vigueur.
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Étape 4 : Succès */}
                    {step === 4 && (
                        <div className="text-center space-y-4 animate-fade-in py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Vérification réussie !</h3>
                            <p className="text-gray-600">
                                Votre âge et votre pays ont été vérifiés. Vous allez être redirigé...
                            </p>
                        </div>
                    )}

                    {/* Erreurs */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-800 text-sm">
                            <p className="font-semibold">❌ {error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {step < 4 && (
                        <div className="flex gap-3 pt-4">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    disabled={loading}
                                    className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                                >
                                    Retour
                                </button>
                            )}
                            <button
                                onClick={handleNextStep}
                                disabled={loading}
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r text-white font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Vérification...' : step === 3 ? 'Vérifier mon âge' : 'Continuer'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


