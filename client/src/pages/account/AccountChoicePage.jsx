import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Sparkles, TrendingUp, Building2, Rocket, ArrowLeft } from 'lucide-react'
import { useStore } from '../../store'
import { LiquidCard, LiquidButton, LiquidBadge } from '@/components/ui/LiquidUI'

export default function AccountChoicePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { accountType, checkAuth } = useStore()

    // Mode: 'signup' (création) ou 'upgrade' (changement plan)
    const mode = searchParams.get('mode') || 'signup'
    const isUpgrade = mode === 'upgrade'

    const initial = useMemo(() => {
        if (isUpgrade) return accountType || 'amateur'
        return localStorage.getItem('preferredAccountType') || 'amateur'
    }, [isUpgrade, accountType])

    const [selectedType, setSelectedType] = useState(initial)
    const [betaUpgradeLoading, setBetaUpgradeLoading] = useState(false)
    const [betaUpgradeError, setBetaUpgradeError] = useState('')

    // Définition statique des types de comptes selon le CDC (cahier des charges)
    const accountTypes = [
        {
            type: 'beta_tester',
            name: 'Beta Testeur',
            subtitle: 'Rôle Producteur, gratuit pendant la bêta',
            description: 'Testez gratuitement toutes les fonctionnalités Producteur pendant la phase bêta de Terpologie',
            price: 0,
            icon: Rocket,
            gradient: ' ',
            beta: true,
            features: [
                '🌿 Accès complet à TOUTES les fonctionnalités Producteur',
                '⚙️ PipeLines configurables (Culture, Extraction, Séparation, Curing)',
                '🧬 Système de génétique avec canvas (arbres généalogiques, PhénoHunt)',
                '🔗 Chaîne de production (canevas interactif, bilan matière)',
                '📦 Export TOUS formats (PNG/JPEG/PDF/SVG 300dpi + CSV/JSON/HTML)',
                '📚 Bibliothèque illimitée, exports illimités',
                '🚀 Aucun paiement, aucun SIRET requis pendant la bêta',
            ],
            limitations: [
                'Réservé à la phase bêta : le rôle peut évoluer vers une offre payante à la sortie officielle',
            ]
        },
        {
            type: 'amateur',
            name: 'Amateur',
            subtitle: 'Compte Gratuit',
            description: 'Créez et gérez vos reviews personnelles',
            price: 0,
            icon: Sparkles,
            gradient: '',
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
            type: 'influenceur',
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
            type: 'producteur',
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

    const handleContinue = async () => {
        localStorage.setItem('preferredAccountType', selectedType)
        localStorage.setItem('accountTypeSelected', 'true')

        if (isUpgrade) {
            // Mode UPGRADE: Changement de plan
            if (selectedType === accountType) {
                navigate('/account')  // Même plan, retour
            } else if (selectedType === 'beta_tester') {
                // Gratuit : pas de tunnel de paiement, changement immédiat via l'API
                setBetaUpgradeError('')
                setBetaUpgradeLoading(true)
                try {
                    const response = await fetch('/api/account/change-type', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ newType: 'beta_tester' })
                    })
                    const data = await response.json()
                    if (!response.ok) {
                        throw new Error(data.message || 'Impossible de passer en Beta Testeur')
                    }
                    await checkAuth()
                    navigate('/account')
                } catch (err) {
                    setBetaUpgradeError(err.message || 'Une erreur est survenue')
                } finally {
                    setBetaUpgradeLoading(false)
                }
            } else if (selectedType === 'amateur') {
                navigate(`/payment?type=${selectedType}&mode=downgrade`)  // Downgrade
            } else {
                navigate(`/payment?type=${selectedType}&mode=upgrade`)  // Upgrade
            }
        } else {
            // Mode SIGNUP: Flux de création
            if (selectedType === 'influenceur' || selectedType === 'producteur') {
                navigate(`/payment?type=${selectedType}`)  // Paiement → Inscription
            } else {
                navigate(`/register?type=${selectedType}`)  // Inscription directe (amateur ou beta_tester)
            }
        }
    }

    return (
        <div className="min-h-full bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] relative flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
            {/* Ambient glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/8 rounded-full blur-[100px]" />
            </div>

            {/* Bouton retour si en mode upgrade */}
            {isUpgrade && (
                <LiquidButton
                    onClick={() => navigate('/account')}
                    variant="ghost"
                    className="absolute top-6 left-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Retour au compte
                </LiquidButton>
            )}
            <div className="w-full max-w-7xl my-8 relative z-10">
                {/* En-tête */}
                <div className="text-center mb-12 space-y-4 animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent drop-shadow-2xl">
                        {isUpgrade ? 'Changer de Plan' : 'Choisissez votre Plan'}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/70 font-light max-w-3xl mx-auto">
                        {isUpgrade
                            ? `Plan actuel: ${accountTypes.find(t => t.type === accountType)?.name}`
                            : 'Des outils de traçabilité adaptés à vos besoins, du simple amateur au producteur professionnel'
                        }
                    </p>
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                                className={`relative group text-left transition-all duration-500 transform hover:scale-105 ${isSelected ? 'scale-105 z-10' : ''}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Badge "Populaire" */}
                                {accountType.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <LiquidBadge variant="warning" size="lg" className="animate-pulse">
                                            ⭐ POPULAIRE
                                        </LiquidBadge>
                                    </div>
                                )}

                                {/* Badge "Bêta" */}
                                {accountType.beta && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                        <LiquidBadge variant="success" size="lg" className="animate-pulse">
                                            🚀 GRATUIT PENDANT LA BÊTA
                                        </LiquidBadge>
                                    </div>
                                )}

                                {/* Carte principale */}
                                <LiquidCard
                                    glow={isSelected ? 'purple' : 'default'}
                                    padding="lg"
                                    className={`h-full transition-all duration-300 ${isSelected ? 'ring-2 ring-purple-500/50' : ''}`}
                                >
                                    {/* Background gradient overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${accountType.gradient} opacity-20 rounded-3xl group-hover:opacity-30 transition-opacity`}></div>

                                    {/* Contenu */}
                                    <div className="relative space-y-6">
                                        {/* Icône et prix */}
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                                <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                                            </div>
                                            <div className="text-right">
                                                {accountType.price > 0 ? (
                                                    <>
                                                        <div className="text-4xl font-black text-white drop-shadow-lg">
                                                            {accountType.price}€
                                                        </div>
                                                        <div className="text-sm text-white/70 font-medium">/mois</div>
                                                    </>
                                                ) : (
                                                    <div className="text-3xl font-black text-emerald-400 drop-shadow-lg">
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
                                            <p className="text-sm text-white/70 font-medium">
                                                {accountType.subtitle}
                                            </p>
                                            <p className="text-white/50 text-sm leading-relaxed">
                                                {accountType.description}
                                            </p>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-white/10"></div>

                                        {/* Fonctionnalités incluses */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-bold text-white/80 uppercase tracking-wide">
                                                ✨ Fonctionnalités
                                            </h4>
                                            <ul className="space-y-2">
                                                {accountType.features.slice(0, 5).map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                                                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" strokeWidth={2.5} />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {accountType.features.length > 5 && (
                                                <p className="text-xs text-white/50 italic pl-7">
                                                    + {accountType.features.length - 5} autres fonctionnalités
                                                </p>
                                            )}
                                        </div>

                                        {/* Bouton de sélection */}
                                        <div className="pt-4">
                                            <div className={`w-full py-4 rounded-xl font-bold text-center transition-all ${isSelected ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                                {isSelected ? '✓ Sélectionné' : 'Choisir ce plan'}
                                            </div>
                                        </div>
                                    </div>
                                </LiquidCard>
                            </button>
                        )
                    })}
                </div>

                {/* Disclaimers légaux */}
                <LiquidCard glow="default" padding="lg" className="mt-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <span className="text-2xl">ℹ️</span>
                        Informations importantes
                    </h3>

                    <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                        <p>
                            <strong className="text-white font-bold">🔞 Âge légal requis :</strong> Vous devez avoir au moins 18 ans (ou 21 ans selon votre pays de résidence) pour créer un compte. Une vérification sera effectuée lors de l'inscription.
                        </p>

                        {selectedType === 'producteur' && (
                            <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                                <strong className="text-white">🏢 Compte Producteur :</strong> Vous devrez fournir des justificatifs légaux (SIRET/SIREN ou équivalent, attestation d'activité légale) et une pièce d'identité pour activer votre compte professionnel.
                            </div>
                        )}

                        {selectedType === 'influenceur' && (
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <strong className="text-white">📱 Compte Influenceur :</strong> Vérification d'âge par pièce d'identité requise.
                            </div>
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

                        {(selectedType === 'influenceur' || selectedType === 'producteur') && (
                            <div className="bg-amber-500/20 border border-amber-400/30 p-4 rounded-xl">
                                <strong className="text-amber-300 font-bold">💳 Abonnement :</strong> <span className="text-white">Le plan {accountTypes.find(t => t.type === selectedType)?.name} coûte {accountTypes.find(t => t.type === selectedType)?.price}€/mois. Vous pourrez activer l'abonnement après avoir complété votre profil et la vérification d'identité.</span>
                            </div>
                        )}

                        {selectedType === 'beta_tester' && (
                            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                <strong className="text-white">🚀 Compte Beta Testeur :</strong> Gratuit, sans SIRET ni paiement. Ce rôle donne un accès Producteur complet le temps de la bêta ; il pourra évoluer vers une offre payante à la sortie officielle.
                            </div>
                        )}
                    </div>
                </LiquidCard>

                {/* Bouton Continuer */}
                <div className="mt-8 text-center">
                    {betaUpgradeError && (
                        <p className="mb-4 text-red-400 text-sm">{betaUpgradeError}</p>
                    )}
                    <LiquidButton
                        onClick={handleContinue}
                        variant="primary"
                        size="xl"
                        glow="purple"
                        className="px-12"
                        disabled={betaUpgradeLoading}
                    >
                        <span>
                            {betaUpgradeLoading
                                ? 'Activation en cours...'
                                : isUpgrade
                                    ? (selectedType === accountType
                                        ? 'Garder ce plan'
                                        : `Changer pour ${accountTypes.find(t => t.type === selectedType)?.name}`)
                                    : `Continuer avec ${accountTypes.find(t => t.type === selectedType)?.name}`
                            }
                        </span>
                        <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </LiquidButton>

                    <p className="mt-4 text-white/50 text-sm">
                        Vous pourrez changer de plan à tout moment depuis vos paramètres
                    </p>
                </div>
            </div>
        </div>
    )
}
