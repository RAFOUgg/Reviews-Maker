import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Sparkles, TrendingUp, Building2 } from 'lucide-react'

export default function AccountChoicePage() {
    const navigate = useNavigate()
    const initial = useMemo(() => localStorage.getItem('preferredAccountType') || 'consumer', [])
    const [selectedType, setSelectedType] = useState(initial)

    // Définition statique des types de comptes selon le CDC (cahier des charges)
    const accountTypes = [
        {
            type: 'consumer',
            name: 'Amateur',
            subtitle: 'Compte Gratuit',
            description: 'Créez et gérez vos reviews personnelles',
            price: 0,
            icon: Sparkles,
            gradient: 'from-green-500 to-emerald-600',
            features: [
                '⚠️ Filigrane "Terpologie" forcé sur tous les exports et aperçus',
                'Sections : Info générale, Visuel, Curing, Odeurs, Goûts, Effets',
                'Templates prédéfinis imposés (Compact, Détaillé, Complète)',
                'Export PNG/JPEG/PDF qualité standard',
                'Personnalisation de base (thèmes, couleurs, typo)',
                '📚 Bibliothèque privée limitée : 20 reviews max',
                '🌐 Publications publiques limitées : 5 reviews max',
                '📤 Exports quotidiens limités : 3 par jour',
            ],
            limitations: [
                'Formats d\'export imposés par templates',
                'Pas d\'accès aux PipeLines Culture/Extraction/Séparation',
                'Pas de filigrane personnalisé',
                'Pas d\'export GIF',
            ]
        },
        {
            type: 'influencer',
            name: 'Influenceur',
            subtitle: 'Pour Créateurs de Contenu',
            description: 'Exports avancés et partage optimisé',
            price: 15.99,
            icon: TrendingUp,
            gradient: ' ',
            popular: true,
            features: [
                '✨ Sans filigrane Terpologie',
                '🎬 Export GIF animé pour PipeLines',
                '🎨 Système drag & drop pour personnalisation des rendus',
                '📸 Export haute qualité (PNG/JPEG/SVG/PDF 300dpi)',
                '🎭 Templates avancés (20 max)',
                '🏷️ Filigranes personnalisés (10 max)',
                '📊 Statistiques avancées et analytics',
                '📚 Bibliothèque illimitée (reviews publiques et privées)',
                '📤 50 exports par jour',
                'Toutes les sections Amateur incluses',
            ],
            limitations: [
                'PipeLines Culture/Extraction/Séparation non accessibles (réservés Producteurs)',
                'Pas d\'accès au système de génétique',
            ]
        },
        {
            type: 'producer',
            name: 'Producteur',
            subtitle: 'Professionnel',
            description: 'Traçabilité complète et exports professionnels',
            price: 29.99,
            icon: Building2,
            gradient: ' ',
            features: [
                '🌿 Accès complet à TOUTES les fonctionnalités',
                '⚙️ PipeLines configurables (Culture, Extraction, Séparation, Curing)',
                '🧬 Système de génétique avec canvas (arbres généalogiques)',
                '🎨 Templates 100% personnalisables avec drag & drop',
                '📦 Export TOUS formats (PNG/JPEG/PDF/SVG 300dpi + CSV/JSON/HTML)',
                '🔤 Polices personnalisées et filigranes illimités',
                '🏢 Gestion entreprise (SIRET, logo, infos légales)',
                '📊 Statistiques de production avancées',
                '📚 Bibliothèque illimitée avec organisation avancée',
                '♾️ Exports illimités',
                'Toutes les fonctionnalités Influenceur incluses',
            ],
            limitations: []
        },
    ];

    const handleContinue = () => {
        localStorage.setItem('preferredAccountType', selectedType)
        localStorage.setItem('accountTypeSelected', 'true')

        // Si compte payant (influenceur ou producteur) → page de paiement
        // Si compte gratuit (consumer/amateur) → inscription directe
        if (selectedType === 'influencer' || selectedType === 'producer') {
            navigate(`/payment?type=${selectedType}`)
        } else {
            navigate(`/register?type=${selectedType}`)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br text-white flex items-center justify-center px-4 py-8 overflow-y-auto">
            <div className="w-full max-w-7xl my-8">
                {/* En-tête */}
                <div className="text-center mb-12 space-y-4 animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-2xl">
                        Choisissez votre Plan
                    </h1>
                    <p className="text-xl md:text-2xl text-white font-light drop-shadow-lg max-w-3xl mx-auto">
                        Des outils de traçabilité adaptés à vos besoins, du simple amateur au producteur professionnel
                    </p>
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {accountTypes.map((accountType, index) => {
                        const isSelected = selectedType === accountType.type
                        const Icon = accountType.icon

                        return (
                            <button
                                key={accountType.type}
                                type="button"
                                onClick={() => {
                                    console.log('Sélection type compte:', accountType.type)
                                    setSelectedType(accountType.type)
                                }}
                                className={`relative group text-left transition-all duration-500 transform hover:scale-105 ${isSelected ? 'scale-105 z-10' : '' }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Badge "Populaire" */}
                                {accountType.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                            ⭐ POPULAIRE
                                        </span>
                                    </div>
                                )}

                                {/* Carte principale */}
                                <div className={`relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 ${isSelected ? 'ring-4 ring-white ring-offset-4 ring-offset-purple-600' : 'hover:shadow-purple-900/50' }`}>
                                    {/* Background gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${accountType.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

                                    {/* Liquid glass effect */}
                                    <div className="absolute inset-0 backdrop-blur-xl bg-white/10"></div>

                                    {/* Contenu */}
                                    <div className="relative p-8 space-y-6">
                                        {/* Icône et prix */}
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                                <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                                            </div>
                                            <div className="text-right">
                                                {accountType.price > 0 ? (
                                                    <>
                                                        <div className="text-4xl font-black text-white drop-shadow-lg">
                                                            {accountType.price}€
                                                        </div>
                                                        <div className="text-sm text-white font-medium">/mois</div>
                                                    </>
                                                ) : (
                                                    <div className="text-3xl font-black text-white drop-shadow-lg">
                                                        GRATUIT
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Nom et description */}
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-white drop-shadow-lg">
                                                {accountType.name}
                                            </h3>
                                            <p className="text-sm text-white font-medium">
                                                {accountType.subtitle}
                                            </p>
                                            <p className="text-white text-sm leading-relaxed">
                                                {accountType.description}
                                            </p>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-white/30"></div>

                                        {/* Fonctionnalités incluses */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                                                ✨ Fonctionnalités
                                            </h4>
                                            <ul className="space-y-2">
                                                {accountType.features.slice(0, 5).map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-white">
                                                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" strokeWidth={2.5} />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {accountType.features.length > 5 && (
                                                <p className="text-xs text-white italic pl-7 opacity-90">
                                                    + {accountType.features.length - 5} autres fonctionnalités
                                                </p>
                                            )}
                                        </div>

                                        {/* Bouton de sélection */}
                                        <div className="pt-4">
                                            <div className={`w-full py-4 rounded-xl font-bold text-center transition-all ${isSelected ? 'bg-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30' }`}>
                                                {isSelected ? '✓ Sélectionné' : 'Choisir ce plan'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Disclaimers légaux */}
                <div className="glass rounded-2xl p-6 space-y-4 mt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">ℹ️</span>
                        Informations importantes
                    </h3>

                    <div className="space-y-3 text-sm text-white leading-relaxed">
                        <p>
                            <strong className="text-white font-bold">🔞 Âge légal requis :</strong> Vous devez avoir au moins 18 ans (ou 21 ans selon votre pays de résidence) pour créer un compte. Une vérification sera effectuée lors de l'inscription.
                        </p>

                        {selectedType === 'producer' && (
                            <p className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <strong className="text-white">🏢 Compte Producteur :</strong> Vous devrez fournir des justificatifs légaux (SIRET/SIREN ou équivalent, attestation d'activité légale) et une pièce d'identité pour activer votre compte professionnel.
                            </p>
                        )}

                        {selectedType === 'influencer' && (
                            <p className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <strong className="text-white">📱 Compte Influenceur :</strong> Vérification d'âge par pièce d'identité requise.
                            </p>
                        )}

                        <p>
                            <strong className="text-white">📜 Conformité légale :</strong> En continuant, vous acceptez nos{' '}
                            <button className="underline hover:text-white transition-colors">
                                Conditions Générales d'Utilisation
                            </button>
                            {' '}et notre{' '}
                            <button className="underline hover:text-white transition-colors">
                                Politique de Confidentialité
                            </button>
                            . Vous reconnaissez avoir pris connaissance du disclaimer RDR (Réduction Des Risques).
                        </p>

                        {(selectedType === 'influencer' || selectedType === 'producer') && (
                            <p className="bg-yellow-500/30 border-2 border-yellow-300 p-4 rounded-xl backdrop-blur-sm">
                                <strong className="text-yellow-100 font-bold">💳 Abonnement :</strong> <span className="text-white">Le plan {accountTypes.find(t => t.type === selectedType)?.name} coûte {accountTypes.find(t => t.type === selectedType)?.price}€/mois. Vous pourrez activer l'abonnement après avoir complété votre profil et la vérification d'identité.</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Bouton Continuer */}
                <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <button
                        onClick={handleContinue}
                        className="inline-flex items-center gap-3 px-12 py-5 bg-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-purple-900/50 hover:scale-105 transition-all duration-300 group"
                    >
                        <span>Continuer avec {accountTypes.find(t => t.type === selectedType)?.name}</span>
                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>

                    <p className="mt-4 text-white text-sm opacity-90">
                        Vous pourrez changer de plan à tout moment depuis vos paramètres
                    </p>
                </div>
            </div>
        </div>
    )
}
