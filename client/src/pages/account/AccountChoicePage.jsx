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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {accountTypes.map((accountType, index) => {
                        const isSelected = selectedType === accountType.type
                        const Icon = accountType.icon

                        return (
                            <button
                                key={accountType.type}
                                type="button"
                                onClick={() => {
}
