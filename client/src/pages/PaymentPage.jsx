import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <Link
                        to="/choose-account"
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour au choix de compte
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Paiement
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Finalisez votre abonnement {accountInfo.name}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Résumé de la commande */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Résumé
                        </h2>

                        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-green-50 dark:from-gray-700 dark:to-gray-700 rounded-lg">
                            <div className="text-5xl">{accountInfo.icon}</div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {accountInfo.name}
                                </h3>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {accountInfo.price}€<span className="text-sm">/mois</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                Fonctionnalités incluses :
                            </h4>
                            {accountInfo.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <span>Abonnement mensuel</span>
                                <span>{accountInfo.price}€</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <span>TVA (20%)</span>
                                <span>{(accountInfo.price * 0.2).toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mt-4">
                                <span>Total</span>
                                <span>{(accountInfo.price * 1.2).toFixed(2)}€</span>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de paiement */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Méthode de paiement
                        </h2>

                        {/* Méthode PayPal (uniquement) */}
                        <div className="mb-6">
                            <div className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-[#0070BA] bg-gradient-to-r from-[#0070BA]/10 to-[#003087]/10">
                                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72A.75.75 0 0 1 5.682 3h6.063c2.838 0 4.544 1.447 4.544 3.86 0 2.683-1.875 4.353-5.007 4.353H8.61l-1.116 6.615a.641.641 0 0 1-.633.533l.215-.024z" fill="#003087" />
                                    <path d="M18.868 3.72L15.762 21.097a.641.641 0 0 1-.633.533h-4.606a.641.641 0 0 1-.633-.74L12.997 3.72A.75.75 0 0 1 13.735 3h4.395c.346 0 .638.254.698.59l.04.13z" fill="#0070BA" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">PayPal</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Paiement sécurisé avec PayPal</p>
                                </div>
                                <div className="px-4 py-2 bg-[#0070BA] text-white rounded-lg text-sm font-semibold">
                                    Sélectionné
                                </div>
                            </div>
                        </div>

                        {/* Placeholder formulaire */}
                        <div className="dark: border dark: rounded-lg p-4 mb-6">
                            <p className="text-sm dark:">
                                <strong>Note :</strong> Le système de paiement sera intégré prochainement (Stripe/PayPal).
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Bouton paiement */}
                        <button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors duration-200 text-lg"
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
                        </button>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                            En continuant, vous acceptez nos{' '}
                            <Link to="/legal/terms" className="text-green-600 hover:underline">
                                Conditions Générales
                            </Link>
                            {' '}et notre{' '}
                            <Link to="/legal/privacy" className="text-green-600 hover:underline">
                                Politique de confidentialité
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
