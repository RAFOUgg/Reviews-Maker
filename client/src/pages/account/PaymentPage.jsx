import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LiquidCard, LiquidButton, LiquidBadge } from '@/components/ui/LiquidUI';
import { ArrowLeft, Check } from 'lucide-react';

const ACCOUNT_TYPES = {
    'influencer': {
        name: 'Influenceur',
        price: 15.99,
        icon: '📱',
        features: [
            'Exports haute qualité (PNG/JPEG/SVG/PDF 300dpi)',
            'Templates prédéfinis (Compact, Détaillé, Complète)',
            'Mode Influenceur (format 9:16)',
            'Personnalisation avancée',
            'Galerie publique',
            'Statistiques détaillées'
        ]
    },
    'producer': {
        name: 'Producteur',
        price: 29.99,
        icon: '👨‍🌾',
        features: [
            'Tous les avantages Influenceur',
            'PipeLine configurable complète',
            'Export personnalisé avec drag & drop',
            'Templates illimités',
            'Bibliothèque de génétiques',
            'Arbre généalogique des cultivars',
            'Exports multiples formats (CSV, JSON, HTML)',
            'Filigrane personnalisé',
            'API access (à venir)'
        ]
    }
};

export default function PaymentPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const accountType = searchParams.get('type');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const paymentMethod = 'paypal'; // Uniquement PayPal disponible

    useEffect(() => {
        if (!accountType || !ACCOUNT_TYPES[accountType]) {
            navigate('/choose-account');
        }
    }, [accountType, navigate]);

    const accountInfo = ACCOUNT_TYPES[accountType];

    const handlePayment = async () => {
        setIsLoading(true);
        setError('');

        try {
            // TODO: Intégrer Stripe/Paypal
            // Pour l'instant, simulation de paiement
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Rediriger vers l'inscription avec le type de compte
            navigate(`/register?type=${accountType}&paid=true`);
        } catch (err) {
            console.error('Payment error:', err);
            setError('Erreur lors du paiement. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!accountInfo) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] px-4 py-12">
            {/* Ambient glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl w-full relative z-10">
                <div className="text-center mb-8">
                    <LiquidButton
                        variant="ghost"
                        onClick={() => navigate('/choose-account')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retour au choix de compte
                    </LiquidButton>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent mb-2">
                        Paiement
                    </h1>
                    <p className="text-lg text-white/50">
                        Finalisez votre abonnement {accountInfo.name}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Résumé de la commande */}
                    <LiquidCard glow="purple" padding="lg">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Résumé
                        </h2>

                        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
                            <div className="text-5xl">{accountInfo.icon}</div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {accountInfo.name}
                                </h3>
                                <p className="text-3xl font-bold text-purple-400">
                                    {accountInfo.price}€<span className="text-sm text-white/50">/mois</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <h4 className="font-semibold text-white">
                                Fonctionnalités incluses :
                            </h4>
                            {accountInfo.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-white/70">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-white/10 pt-4 space-y-2">
                            <div className="flex justify-between text-sm text-white/50">
                                <span>Abonnement mensuel</span>
                                <span>{accountInfo.price}€</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/50">
                                <span>TVA (20%)</span>
                                <span>{(accountInfo.price * 0.2).toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-white mt-4 pt-2 border-t border-white/10">
                                <span>Total</span>
                                <span className="text-purple-400">{(accountInfo.price * 1.2).toFixed(2)}€</span>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Formulaire de paiement */}
                    <LiquidCard glow="default" padding="lg">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Méthode de paiement
                        </h2>

                        {/* Méthode PayPal (uniquement) */}
                        <div className="mb-6">
                            <div className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-[#0070BA]/50 bg-gradient-to-r from-[#0070BA]/10 to-[#003087]/10">
                                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72A.75.75 0 0 1 5.682 3h6.063c2.838 0 4.544 1.447 4.544 3.86 0 2.683-1.875 4.353-5.007 4.353H8.61l-1.116 6.615a.641.641 0 0 1-.633.533l.215-.024z" fill="#003087" />
                                    <path d="M18.868 3.72L15.762 21.097a.641.641 0 0 1-.633.533h-4.606a.641.641 0 0 1-.633-.74L12.997 3.72A.75.75 0 0 1 13.735 3h4.395c.346 0 .638.254.698.59l.04.13z" fill="#0070BA" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">PayPal</h3>
                                    <p className="text-sm text-white/50">Paiement sécurisé avec PayPal</p>
                                </div>
                                <LiquidBadge variant="info" size="sm">Sélectionné</LiquidBadge>
                            </div>
                        </div>

                        {/* Placeholder formulaire */}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                            <p className="text-sm text-amber-300">
                                <strong>Note :</strong> Le système de paiement sera intégré prochainement (Stripe/PayPal).
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Bouton paiement */}
                        <LiquidButton
                            onClick={handlePayment}
                            disabled={isLoading}
                            variant="primary"
                            glow="green"
                            fullWidth
                            size="lg"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Traitement...
                                </span>
                            ) : (
                                `Payer ${(accountInfo.price * 1.2).toFixed(2)}€`
                            )}
                        </LiquidButton>

                        <p className="text-xs text-white/40 text-center mt-4">
                            En continuant, vous acceptez nos{' '}
                            <Link to="/legal/terms" className="text-purple-400 hover:underline">
                                Conditions Générales
                            </Link>
                            {' '}et notre{' '}
                            <Link to="/legal/privacy" className="text-purple-400 hover:underline">
                                Politique de confidentialité
                            </Link>
                        </p>
                    </LiquidCard>
                </div>
            </div>
        </div>
    );
}
