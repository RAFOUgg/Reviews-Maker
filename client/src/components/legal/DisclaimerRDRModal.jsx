import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { LiquidGlass } from '../ui';

/**
 * DisclaimerRDRModal - Modal de rappel RDR (Reduction Des Risques)
 * S'affiche tous les jours (24h localStorage expiration)
 * Rappelle la conformité légale et les conditions d'utilisation
 */
const DisclaimerRDRModal = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Vérifier dernière acceptation dans localStorage
        const lastAccepted = localStorage.getItem('rdr_last_accepted');
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000; // 24 heures

        if (!lastAccepted || (now - parseInt(lastAccepted)) > oneDayMs) {
            // Afficher le modal après 2 secondes
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('rdr_last_accepted', Date.now().toString());
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <LiquidGlass variant="modal" className="max-w-2xl w-full relative">
                <button
                    onClick={handleAccept}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                    aria-label="Fermer"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-8">
                    {/* Icon */}
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-yellow-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Rappel RDR
                        </h2>
                        <p className="text-gray-400">
                            Responsabilité, Divulgation, Réglementation
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 text-gray-300 text-sm mb-8">
                        <p>
                            <strong className="text-white">🔒 Conformité légale :</strong> Terpologie est une plateforme de traçabilité
                            pour produits cannabiniques légaux uniquement. L'accès et l'utilisation sont soumis aux lois locales
                            de votre pays de résidence.
                        </p>

                        <p>
                            <strong className="text-white">🔞 Âge légal :</strong> Vous devez avoir <strong>18 ans minimum</strong>
                            (ou 21 ans selon votre juridiction) pour utiliser cette plateforme. Une vérification d'âge
                            est requise à l'inscription.
                        </p>

                        <p>
                            <strong className="text-white">⚖️ Responsabilité :</strong> Les informations partagées sur
                            Terpologie sont fournies par les utilisateurs à des fins de documentation et traçabilité.
                            Terpologie ne garantit pas l'exactitude des données publiées.
                        </p>

                        <p>
                            <strong className="text-white">⚕️ Usage et santé :</strong> Les produits cannabiniques peuvent
                            avoir des effets sur la santé. Consultez un professionnel de santé avant utilisation, surtout
                            si vous êtes enceinte, allaitez, ou prenez des médicaments.
                        </p>

                        <p>
                            <strong className="text-white">🚫 Interdictions :</strong> Toute promotion, vente, ou incitation
                            à l'achat de produits illégaux est strictement interdite sur la plateforme. Les comptes ne
                            respectant pas ces règles seront supprimés.
                        </p>

                        <p className="pt-4 border-t border-white/10">
                            <strong className="text-white">📜 Conditions d'utilisation :</strong> En continuant, vous
                            confirmez avoir lu et accepté nos{' '}
                            <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                                CGU
                            </a>
                            {' '}et notre{' '}
                            <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                                Politique de Confidentialité
                            </a>.
                        </p>
                    </div>

                    {/* Accept Button */}
                    <button
                        onClick={handleAccept}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-bold hover:brightness-110 transition-all shadow-lg"
                    >
                        J'ai compris et j'accepte
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        Ce message s'affiche quotidiennement pour rappeler les conditions d'utilisation.
                    </p>
                </div>
            </LiquidGlass>
        </div>
    );
};

export default DisclaimerRDRModal;
