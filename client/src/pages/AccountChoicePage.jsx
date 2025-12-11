import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AccountChoicePage() {
    const navigate = useNavigate()
    const initial = useMemo(() => localStorage.getItem('preferredAccountType') || 'beta_tester', [])
    const [selectedType, setSelectedType] = useState(initial)
    const [accountTypes, setAccountTypes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Charger les types de comptes depuis l'API
        const fetchAccountTypes = async () => {
            try {
                const response = await fetch('/api/account/types', {
                    credentials: 'include',
                });
                const data = await response.json();
                setAccountTypes(data.types || []);
            } catch (err) {
                console.error('Erreur chargement types de comptes:', err);
                // Fallback sur des données statiques
                setAccountTypes([
                    { type: 'beta_tester', name: 'Beta testeur', description: 'Accès complet pendant la bêta', price: 0, features: [] },
                    { type: 'consumer', name: 'Consommateur', description: 'Créez et gérez vos reviews', price: 0, features: [] },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchAccountTypes();
    }, []);

    const handleContinue = () => {
        localStorage.setItem('preferredAccountType', selectedType)
        if (selectedType === 'consumer' || selectedType === 'beta_tester') {
            localStorage.setItem('accountTypeSelected', 'true')
        } else {
            localStorage.removeItem('accountTypeSelected')
        }
        navigate('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 flex items-center justify-center">
                <div className="text-white text-xl">Chargement...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 text-gray-900 flex items-center justify-center px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-7xl glass rounded-2xl shadow-2xl my-6">
                <div className="p-6 space-y-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Choisissez votre type de compte</h1>
                        <p className="text-gray-700 text-sm mt-1">Pendant la bêta, le plan Beta testeur offre un accès complet équivalent au plan Producteur.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {accountTypes.map((type) => {
                            const isSelected = selectedType === type.type
                            // Désactiver tous les types sauf beta_tester
                            const isDisabled = type.type !== 'beta_tester'

                            return (
                                <button
                                    key={type.type}
                                    type="button"
                                    onClick={() => !isDisabled && setSelectedType(type.type)}
                                    disabled={isDisabled}
                                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                        ? 'border-violet-600 bg-violet-50 shadow-lg'
                                        : 'border-gray-300 bg-white hover:border-violet-400 hover:shadow-md'
                                        } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                        }`}
                                >
                                    {/* Badge prix */}
                                    <div className="absolute top-3 right-3">
                                        {type.price > 0 ? (
                                            <span className="text-base font-bold text-violet-600">
                                                €{type.price}/mois
                                            </span>
                                        ) : (
                                            <span className="text-sm font-bold text-green-600">
                                                GRATUIT
                                            </span>
                                        )}
                                    </div>

                                    {/* Nom */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 pr-20">
                                        {type.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-xs text-gray-600 mb-3">
                                        {type.description}
                                    </p>

                                    {/* Fonctionnalités */}
                                    {type.features && type.features.length > 0 && (
                                        <ul className="space-y-1.5 list-none">
                                            {type.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start text-xs text-gray-700">
                                                    <svg className="w-3.5 h-3.5 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="leading-tight">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Badge sélectionné */}
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-violet-600 text-white rounded-full p-1.5">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Badge "Abonnement requis" */}
                                    {type.requiresSubscription && (
                                        <p className="flex items-center text-xs text-amber-600 mt-2 font-medium">
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Nécessite un abonnement
                                        </p>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                        <p className="text-xs text-gray-600">
                            Vous pourrez changer de plan plus tard depuis vos paramètres
                        </p>
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
