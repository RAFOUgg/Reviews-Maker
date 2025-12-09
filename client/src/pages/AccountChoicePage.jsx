import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const ACCOUNT_CHOICES = [
    { id: 'beta_tester', label: 'Beta testeur', desc: 'Accès complet pendant la bêta', disabled: false },
    { id: 'consumer', label: 'Consommateur', desc: 'Accès complet, création et export', disabled: false },
    { id: 'influencer_basic', label: 'Influenceur Basic', desc: 'Branding personnel Orchard (bientôt)', disabled: false },
    { id: 'influencer_pro', label: 'Influenceur Pro', desc: 'Fonctions pro avancées (bientôt)', disabled: false },
    { id: 'producer', label: 'Producteur', desc: 'Compte pro bientôt disponible (achat désactivé)', disabled: true },
]

export default function AccountChoicePage() {
    const navigate = useNavigate()
    const initial = useMemo(() => localStorage.getItem('preferredAccountType') || 'consumer', [])
    const [selectedType, setSelectedType] = useState(initial)

    const handleContinue = () => {
        localStorage.setItem('preferredAccountType', selectedType)
        if (selectedType === 'consumer' || selectedType === 'beta_tester') {
            localStorage.setItem('accountTypeSelected', 'true')
        } else {
            localStorage.removeItem('accountTypeSelected')
        }
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 text-gray-900 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-4xl glass rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900">Choisissez votre type de compte</h1>
                    <p className="text-gray-700 text-sm">Le plan consommateur offre déjà l'accès complet au site. Les plans pros seront activés plus tard.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ACCOUNT_CHOICES.map((choice) => {
                            const isSelected = selectedType === choice.id
                            return (
                                <button
                                    key={choice.id}
                                    type="button"
                                    onClick={() => !choice.disabled && setSelectedType(choice.id)}
                                    className={`text-left p-4 rounded-xl border transition-all ${choice.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-violet-500 hover:shadow-md'} ${isSelected ? 'border-violet-600 bg-violet-50' : 'border-gray-300 bg-white'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-900">{choice.label}</div>
                                            <div className="text-sm text-gray-600">{choice.desc}</div>
                                        </div>
                                        {isSelected && <span className="text-sm text-violet-600 font-semibold">Sélectionné</span>}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleContinue}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-md"
                        >
                            Continuer vers la connexion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
