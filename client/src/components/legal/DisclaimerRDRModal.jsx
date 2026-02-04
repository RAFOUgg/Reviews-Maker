/**
 * DisclaimerRDRModal - Modal de rappel RDR (Réduction Des Risques)
 * S'affiche à chaque ouverture de l'application (session-based via sessionStorage)
 * Rappelle la conformité légale et les conditions d'utilisation
 * Liquid Glass UI Design System - Responsive Mobile First
 */

import React, { useEffect, useState, useRef } from 'react';
import { LiquidModal, LiquidButton, LiquidCard } from '@/components/ui/LiquidUI';
import { AlertTriangle, X, Lock, ShieldAlert, Scale, Heart, Ban, ScrollText } from 'lucide-react';

const DisclaimerRDRModal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const previousActiveElement = useRef(null);

    useEffect(() => {
        // Utiliser sessionStorage au lieu de localStorage pour afficher à chaque session
        const sessionAccepted = sessionStorage.getItem('rdr_session_accepted');

        // Afficher si pas encore accepté dans cette session
        if (!sessionAccepted) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        previousActiveElement.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            // Toujours restaurer le scroll, même si previousOverflow était déjà 'hidden'
            document.body.style.overflow = '';
            try {
                previousActiveElement.current?.focus?.();
            } catch (err) { }
        };
    }, [isVisible]);

    const handleAccept = () => {
        // Marquer comme accepté pour cette session uniquement
        sessionStorage.setItem('rdr_session_accepted', 'true');
        setIsVisible(false);
    };

    const handleClose = () => {
        try {
            const host = window.location.hostname || 'web';
            const query = encodeURIComponent(host);
            window.location.href = `https://www.google.com/search?q=${query}`;
        } catch (err) {
            window.location.href = 'https://www.google.com';
        }
    };

    if (!isVisible) return null;

    const rdrItems = [
        {
            icon: Lock,
            title: 'Conformité légale',
            text: 'Terpologie est une plateforme de traçabilité pour produits cannabiniques légaux uniquement. L\'accès et l\'utilisation sont soumis aux lois locales de votre pays de résidence.',
            color: 'violet'
        },
        {
            icon: ShieldAlert,
            title: 'Âge légal',
            text: 'Vous devez avoir 18 ans minimum (ou 21 ans selon votre juridiction) pour utiliser cette plateforme. Une vérification d\'âge est requise à l\'inscription.',
            color: 'amber'
        },
        {
            icon: Scale,
            title: 'Responsabilité',
            text: 'Les informations partagées sur Terpologie sont fournies par les utilisateurs à des fins de documentation. Terpologie ne garantit pas l\'exactitude des données publiées.',
            color: 'blue'
        },
        {
            icon: Heart,
            title: 'Usage et santé',
            text: 'Les produits cannabiniques peuvent avoir des effets sur la santé. Consultez un professionnel avant utilisation, surtout si vous êtes enceinte, allaitez, ou prenez des médicaments.',
            color: 'rose'
        },
        {
            icon: Ban,
            title: 'Interdictions',
            text: 'Toute promotion, vente, ou incitation à l\'achat de produits illégaux est strictement interdite. Les comptes ne respectant pas ces règles seront supprimés.',
            color: 'red'
        }
    ];

    const getIconColor = (color) => {
        const colors = {
            violet: 'text-violet-400',
            amber: 'text-amber-400',
            blue: 'text-blue-400',
            rose: 'text-rose-400',
            red: 'text-red-400'
        };
        return colors[color] || 'text-white';
    };

    return (
        <LiquidModal
            isOpen={true}
            onClose={handleClose}
            size="lg"
        >
            {/* Container scrollable principal pour mobile */}
            <div className="flex flex-col max-h-[90vh] sm:max-h-[85vh]">
                {/* Header fixe */}
                <div className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-white truncate">Réduction des risques</h2>
                            <p className="text-xs sm:text-sm text-white/60 hidden sm:block">Responsabilité, Divulgation, Réglementation</p>
                        </div>
                    </div>
                </div>

                {/* Body scrollable */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-3 sm:py-4 min-h-0">
                    <div className="space-y-3 sm:space-y-4">
                        {rdrItems.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <div key={index} className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${getIconColor(item.color)}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">{item.title}</h4>
                                        <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            );
                        })}

                        <LiquidCard className="p-3 sm:p-4 mt-3 sm:mt-4" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                            <div className="flex gap-2.5 sm:gap-3">
                                <ScrollText className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">Conditions d'utilisation</h4>
                                    <p className="text-xs sm:text-sm text-white/60">
                                        En continuant, vous confirmez avoir lu et accepté nos{' '}
                                        <a href="/cgu" className="text-violet-400 hover:text-violet-300 underline">CGU</a>
                                        {' '}et notre{' '}
                                        <a href="/privacy" className="text-violet-400 hover:text-violet-300 underline">Politique de Confidentialité</a>.
                                    </p>
                                </div>
                            </div>
                        </LiquidCard>
                    </div>
                </div>

                {/* Footer fixe */}
                <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
                    <LiquidButton
                        variant="primary"
                        onClick={handleAccept}
                        className="w-full py-2.5 sm:py-3 text-sm sm:text-base"
                        style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(249, 115, 22, 0.3))',
                            borderColor: 'rgba(245, 158, 11, 0.5)'
                        }}
                    >
                        ✓ J'ai compris et j'accepte
                    </LiquidButton>
                    <p className="text-[10px] sm:text-xs text-white/40 text-center mt-2 sm:mt-3">
                        Ce message s'affiche à chaque visite pour rappeler les conditions d'utilisation.
                    </p>
                </div>
            </div>
        </LiquidModal>
    );
};

export default DisclaimerRDRModal;
