import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Sparkles, TrendingUp, Building2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { LiquidCard, LiquidButton, LiquidBadge } from '@/components/ui/LiquidUI';

export default function UpgradeModal({ isOpen, onClose }) {
    const { accountType } = useStore();
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);

    const accountTypes = [
        {
            type: 'amateur',
            name: 'Amateur',
            subtitle: 'Compte Gratuit',
            description: 'Créez et gérez vos reviews personnelles',
            price: 0,
            icon: Sparkles,
            features: [
                'Sections : Info générale, Visuel, Odeurs, Goûts, Effets',
                'Templates prédéfinis (Compact, Détaillé, Complète)',
                'Export PNG/JPEG/PDF qualité standard',
                'Bibliothèque privée limitée : 20 reviews max',
                'Publications publiques limitées : 5 reviews max',
            ],
        },
        {
            type: 'producteur',
            name: 'Producteur',
            subtitle: 'Professionnel',
            description: 'Traçabilité complète et exports professionnels',
            price: 29.99,
            icon: Building2,
            popular: true,
            features: [
                'Accès complet à TOUTES les fonctionnalités',
                'PipeLines configurables (Culture, Extraction, Séparation)',
                'Système de génétique avec canvas',
                'Export TOUS formats (PNG/JPEG/PDF/SVG/CSV/JSON)',
                'Exports et reviews illimités',
            ],
        },
        {
            type: 'influenceur',
            name: 'Influenceur',
            subtitle: 'Pour Créateurs de Contenu',
            description: 'Exports avancés et partage optimisé',
            price: 15.99,
            icon: TrendingUp,
            features: [
                'Export GIF animé pour PipeLines',
                'Système drag & drop pour personnalisation',
                'Export haute qualité (PNG/JPEG/SVG/PDF 300dpi)',
                'Templates avancés + filigranes personnalisés',
                '50 exports par jour',
            ],
        },
    ];

    const handleRedirectToPayment = (type) => {
        if (type === accountType) {
            onClose();
            return;
        }

        navigate(`/account/payment?type=${type}`);
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="bg-gradient-to-br from-[#0a0a1a] to-[#07070f] rounded-2xl shadow-2xl max-w-5xl w-full border border-white/10 relative">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                            Changer de Plan
                        </h2>
                        <p className="text-white/50 mt-1">
                            Plan actuel: <span className="text-purple-400 font-semibold capitalize">{accountType}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X size={24} className="text-white/60" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {accountTypes.map((type) => {
                            const isCurrentPlan = accountType === type.type;
                            const Icon = type.icon;

                            return (
                                <div
                                    key={type.type}
                                    className={`relative transition-all duration-300 ${type.popular ? 'md:scale-105 z-10' : ''}`}
                                >
                                    {type.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                            <LiquidBadge variant="warning" size="md" className="animate-pulse">
                                                ⭐ RECOMMANDÉ
                                            </LiquidBadge>
                                        </div>
                                    )}

                                    <LiquidCard
                                        glow={isCurrentPlan ? 'green' : type.popular ? 'purple' : 'default'}
                                        padding="lg"
                                        className={`h-full ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                                    <Icon className="w-8 h-8 text-white" />
                                                </div>
                                                <div className="text-right">
                                                    {type.price > 0 ? (
                                                        <>
                                                            <div className="text-3xl font-black text-white">
                                                                {type.price}€
                                                            </div>
                                                            <div className="text-sm text-white/50">/mois</div>
                                                        </>
                                                    ) : (
                                                        <div className="text-2xl font-black text-emerald-400">
                                                            GRATUIT
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-white">{type.name}</h3>
                                                <p className="text-sm text-white/50">{type.subtitle}</p>
                                            </div>

                                            <div className="space-y-2 min-h-[140px]">
                                                {type.features.map((feature, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                                                        <span className="text-white/70">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <LiquidButton
                                                onClick={() => handleRedirectToPayment(type.type)}
                                                disabled={isCurrentPlan}
                                                variant={isCurrentPlan ? 'secondary' : 'primary'}
                                                glow={type.popular && !isCurrentPlan ? 'purple' : undefined}
                                                fullWidth
                                                className={isCurrentPlan ? 'cursor-not-allowed opacity-60' : ''}
                                            >
                                                {isCurrentPlan ? '✓ Plan actuel' : `Passer à ${type.name}`}
                                            </LiquidButton>
                                        </div>
                                    </LiquidCard>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <p className="text-sm text-amber-300">
                            <strong>💳 Note :</strong> Le paiement est actuellement simulé. L'intégration PayPal/Stripe sera disponible prochainement.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
