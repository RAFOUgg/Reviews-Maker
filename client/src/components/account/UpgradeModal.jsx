import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Sparkles, TrendingUp, Building2, ArrowLeft } from 'lucide-react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { LiquidCard, LiquidButton, LiquidBadge } from '@/components/ui/LiquidUI';
import { useToast } from '../shared/ToastContainer';
import { accountService, paymentService } from '../../services/apiService';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function UpgradeModal({ isOpen, onClose }) {
    const { accountType, checkAuth } = useStore();
    const navigate = useNavigate();
    const toast = useToast();
    const [selectedType, setSelectedType] = useState(accountType);

    const accountTypes = [
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
        if (selectedType === accountType) {
            onClose();
            return;
        }

        // If requesting Producteur, start payment/checkout flow instead
        if (selectedType === 'producteur') {
            try {
                const loadingId = toast.loading('Redirection vers le paiement...');
                const res = await paymentService.createCheckout('producteur');
                toast.remove(loadingId);

                // backend may return different keys depending on implementation
                const redirectUrl = res?.url || res?.checkoutUrl || res?.checkout_url || res?.redirectUrl || (res && res.data && (res.data.url || res.data.checkoutUrl || res.data.redirectUrl));

                if (redirectUrl) {
                    toast.info('Ouverture de la page de paiement...');
                    // Navigate in the same tab to keep UX consistent
                    window.location.href = redirectUrl
                    onClose();
                    return;
                }

                console.debug('createCheckout returned', res);
                toast.error(res?.message || 'Impossible de démarrer le paiement');
            } catch (err) {
                toast.error(err?.message || 'Erreur lors du démarrage du paiement');
            }

            return;
        }

        // Otherwise try to change account type immediately (amateur <-> influenceur etc.)
        let loadingId;
        try {
            loadingId = toast.loading('Mise à jour du plan en cours...');
            const res = await accountService.changeType(selectedType);
            toast.remove(loadingId);
            toast.success(res.message || 'Votre compte a été mis à jour avec succès !');

            // Refresh auth/profile in store
            await checkAuth();

            onClose();
        } catch (err) {
            if (loadingId) toast.remove(loadingId);
            const msg = err?.message || (err?.code ? `${err.code}` : 'Erreur lors de la mise à jour');
            toast.error(msg);
        }
    };

    const [showCancelDialog, setShowCancelDialog] = React.useState(false)

    const handleCancelSubscription = async () => {
        setShowCancelDialog(true)
    }

    const doCancelSubscription = async () => {
        setShowCancelDialog(false)
        const loadingId = toast.loading('Résiliation en cours...')
        try {
            // Downgrade to amateur
            const res = await accountService.changeType('amateur')
            toast.remove(loadingId)
            toast.success(res.message || 'Abonnement résilié, compte downgradé.')
            await checkAuth()
            onClose()
        } catch (err) {
            toast.remove(loadingId)
            toast.error(err?.message || 'Erreur lors de la résiliation')
        }
    }

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

            <div className="bg-gradient-to-br from-[#0a0a1a] to-[#07070f] rounded-2xl shadow-2xl max-w-5xl w-full border border-white/10 relative max-h-[90vh] overflow-hidden">
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
                <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(90vh - 96px)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {accountTypes.map((type) => {
                            const isSelected = selectedType === type.type;
                            const Icon = type.icon;

                            return (
                                <button
                                    key={type.type}
                                    type="button"
                                    onClick={() => setSelectedType(type.type)}
                                    className={`relative group text-left transition-all duration-500 transform hover:scale-105 ${isSelected ? 'scale-105 z-10' : ''}`}
                                >
                                    {type.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                            <LiquidBadge variant="warning" size="lg" className="animate-pulse">
                                                ⭐ POPULAIRE
                                            </LiquidBadge>
                                        </div>
                                    )}

                                    <LiquidCard
                                        glow={isSelected ? 'purple' : 'default'}
                                        padding="lg"
                                        className={`h-full transition-all duration-300 ${isSelected ? 'ring-2 ring-purple-500/50' : ''}`}
                                    >
                                        <div className="relative space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                                    <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                                                </div>
                                                <div className="text-right">
                                                    {type.price > 0 ? (
                                                        <>
                                                            <div className="text-4xl font-black text-white drop-shadow-lg">
                                                                {type.price}€
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

                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black text-white drop-shadow-lg">
                                                    {type.name}
                                                </h3>
                                                <p className="text-sm text-white/70 font-medium">
                                                    {type.subtitle}
                                                </p>
                                                <p className="text-white/50 text-sm leading-relaxed">
                                                    {type.description}
                                                </p>
                                            </div>

                                            <div className="h-px bg-white/10"></div>

                                            <div className="space-y-3">
                                                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wide">
                                                    ✨ Fonctionnalités
                                                </h4>
                                                <ul className="space-y-2">
                                                    {type.features.slice(0, 5).map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                                                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" strokeWidth={2.5} />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>

                                                {type.features.length > 5 && (
                                                    <p className="text-xs text-white/50 italic pl-7">
                                                        + {type.features.length - 5} autres fonctionnalités
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </LiquidCard>
                                </button>
                            );
                        })}
                    </div>

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
                                <strong className="text-white">📜 Conformité légale :</strong> En continuant, vous acceptez nos
                                <button className="underline hover:text-white transition-colors">
                                    Conditions Générales d'Utilisation
                                </button>
                                {' '}et notre
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
                        </div>
                    </LiquidCard>

                    <div className="mt-8 text-center">
                        <LiquidButton
                            onClick={handleContinue}
                            variant="primary"
                            size="xl"
                            glow="purple"
                            className="px-12"
                        >
                            <span>
                                {selectedType === accountType
                                    ? 'Garder ce plan'
                                    : `Continuer avec ${accountTypes.find(t => t.type === selectedType)?.name}`}
                            </span>
                            <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </LiquidButton>

                        <p className="mt-4 text-white/50 text-sm">
                            Vous pourrez changer de plan à tout moment depuis vos paramètres
                        </p>
                    </div>

                    {/* Cancel subscription action */}
                    {accountType && accountType !== 'amateur' && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleCancelSubscription}
                                className="py-2 px-4 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                            >
                                Résilier l'abonnement
                            </button>
                        </div>
                    )}
                    <ConfirmDialog
                        isOpen={showCancelDialog}
                        title="Confirmer la résiliation"
                        description="Voulez-vous vraiment résilier votre abonnement ? Votre contenu restera visible mais vous perdrez l'accès à la création."
                        onConfirm={doCancelSubscription}
                        onCancel={() => setShowCancelDialog(false)}
                        confirmText="Résilier"
                        cancelText="Annuler"
                    />
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
