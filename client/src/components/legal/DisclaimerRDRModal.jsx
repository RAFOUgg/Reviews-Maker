import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-3xl shadow-2xl max-w-2xl w-full relative max-h-[92vh] flex flex-col">
                {/* Header avec dégradé */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 sm:p-6 text-center relative flex-shrink-0">
                    <button
                        onClick={handleAccept}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 bg-white/20 rounded-full p-2"
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg mb-2">
                        Rappel RDR
                    </h2>
                    <p className="text-white/90 font-medium">
                        Responsabilité, Divulgation, Réglementation
                    </p>
                </div>

                {/* Content scrollable */}
                <div className="overflow-y-auto p-0 flex-1">
                    <div className="p-4 sm:p-8 bg-white dark:bg-gray-800">
                        <div className="space-y-5 text-gray-800 dark:text-gray-200 mb-8">
                            <div className="flex gap-3">
                                <span className="text-xl sm:text-2xl flex-shrink-0">🔒</span>
                                <p className="text-sm sm:text-base leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white block mb-1">Conformité légale :</strong>
                                    Terpologie est une plateforme de traçabilité pour produits cannabiniques légaux uniquement.
                                    L'accès et l'utilisation sont soumis aux lois locales de votre pays de résidence.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <span className="text-xl sm:text-2xl flex-shrink-0">🔞</span>
                                <p className="text-sm sm:text-base leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white block mb-1">Âge légal :</strong>
                                    Vous devez avoir <strong className="text-orange-600">18 ans minimum</strong> (ou 21 ans selon votre juridiction)
                                    pour utiliser cette plateforme. Une vérification d'âge est requise à l'inscription.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <span className="text-xl sm:text-2xl flex-shrink-0">⚖️</span>
                                <p className="text-sm sm:text-base leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white block mb-1">Responsabilité :</strong>
                                    Les informations partagées sur Terpologie sont fournies par les utilisateurs à des fins de documentation.
                                    Terpologie ne garantit pas l'exactitude des données publiées.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <span className="text-xl sm:text-2xl flex-shrink-0">⚕️</span>
                                <p className="text-sm sm:text-base leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white block mb-1">Usage et santé :</strong>
                                    Les produits cannabiniques peuvent avoir des effets sur la santé. Consultez un professionnel avant utilisation,
                                    surtout si vous êtes enceinte, allaitez, ou prenez des médicaments.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <span className="text-xl sm:text-2xl flex-shrink-0">🚫</span>
                                <p className="text-sm sm:text-base leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white block mb-1">Interdictions :</strong>
                                    Toute promotion, vente, ou incitation à l'achat de produits illégaux est strictement interdite.
                                    Les comptes ne respectant pas ces règles seront supprimés.
                                </p>
                            </div>

                            <div className="pt-5 border-t-2 border-gray-200 dark:border-gray-700 flex gap-3">
                                <span className="text-2xl flex-shrink-0">📜</span>
                                <p className="text-sm leading-relaxed">
                                    <strong className="text-gray-900 dark:text-white block mb-1">Conditions d'utilisation :</strong>
                                    En continuant, vous confirmez avoir lu et accepté nos{' '}
                                    <a href="/cgu" className="hover: underline font-medium">
                                        CGU
                                    </a>
                                    {' '}et notre{' '}
                                    <a href="/privacy" className="hover: underline font-medium">
                                        Politique de Confidentialité
                                    </a>.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer with sticky action - stays visible on small screens */}
                <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 flex-shrink-0">
                    <button
                        onClick={handleAccept}
                        className="w-full py-3 sm:py-4 bg-gradient-to-r rounded-xl text-white text-base sm:text-lg font-bold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        J'ai compris et j'accepte
                    </button>

                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                        Ce message s'affiche quotidiennement pour rappeler les conditions d'utilisation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerRDRModal;
