/**
 * Modal de consentement RDR (Réduction Des Risques)
 * Affichée après vérification d'âge réussie
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LiquidModal, LiquidButton, LiquidCard } from '@/components/ui/LiquidUI';

const ConsentModal = ({ isOpen, onAccept, onDecline }) => {
    const { t } = useTranslation();
    const [hasRead, setHasRead] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        if (!hasRead) {
            alert(t('consent.mustRead', 'Veuillez lire l\'intégralité du texte avant d\'accepter'));
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/legal/accept-consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ consent: true }),
            });

            const data = await response.json();

            if (response.ok) {
                onAccept(data);
            } else {
                alert(data.message || t('consent.errorGeneric', 'Erreur lors de l\'enregistrement du consentement'));
                setLoading(false);
            }
        } catch (err) {
            console.error('Erreur consentement:', err);
            alert(t('consent.errorNetwork', 'Erreur réseau, veuillez réessayer'));
            setLoading(false);
        }
    };

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onDecline}
            title={
                <div className="flex items-center gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <span>{t('consent.title', 'Consentement de Réduction des Risques')}</span>
                </div>
            }
            size="lg"
            glowColor="violet"
            footer={
                <div className="space-y-4 w-full">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-violet-500/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={hasRead}
                            onChange={(e) => setHasRead(e.target.checked)}
                            className="w-5 h-5 rounded border-white/30 bg-white/5 accent-violet-500"
                        />
                        <span className="text-sm text-white/80">
                            {t('consent.confirmRead', 'J\'ai lu et je comprends l\'intégralité du texte')}
                        </span>
                    </label>

                    <div className="flex gap-3">
                        <LiquidButton
                            onClick={onDecline}
                            disabled={loading}
                            variant="ghost"
                            className="flex-1"
                        >
                            {t('consent.decline', 'Refuser')}
                        </LiquidButton>
                        <LiquidButton
                            onClick={handleAccept}
                            disabled={!hasRead || loading}
                            variant="primary"
                            className="flex-1"
                            loading={loading}
                        >
                            {loading
                                ? t('consent.accepting', 'Enregistrement...')
                                : t('consent.accept', 'J\'accepte et je comprends')}
                        </LiquidButton>
                    </div>

                    <p className="text-xs text-white/40 text-center">
                        {t('consent.privacy', 'Votre consentement est enregistré avec un horodatage pour des raisons légales')}
                    </p>
                </div>
            }
        >
            <div
                className="max-h-[50vh] overflow-y-auto space-y-4 text-sm text-white/70 pr-2"
                onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    if (scrollTop + clientHeight >= scrollHeight - 10) {
                        setHasRead(true);
                    }
                }}
            >
                <p className="text-white/60">
                    {t('consent.subtitle', 'Veuillez lire attentivement avant de continuer')}
                </p>

                <section>
                    <h3 className="font-semibold text-base mb-2 text-white">
                        {t('consent.section1Title', '1. Nature de la plateforme')}
                    </h3>
                    <p>
                        {t('consent.section1Text', 'Reviews-Maker est une plateforme permettant de créer, partager et consulter des avis sur des produits à base de cannabis. Cette plateforme est destinée exclusivement aux adultes ayant l\'âge légal dans leur juridiction.')}
                    </p>
                </section>

                <section>
                    <h3 className="font-semibold text-base mb-2 text-white">
                        {t('consent.section2Title', '2. Risques pour la santé')}
                    </h3>
                    <p className="mb-2">
                        {t('consent.section2Intro', 'La consommation de cannabis comporte des risques pour la santé :')}
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>{t('consent.risk1', 'Troubles respiratoires en cas d\'inhalation de fumée')}</li>
                        <li>{t('consent.risk2', 'Altération des capacités cognitives et motrices')}</li>
                        <li>{t('consent.risk3', 'Risque de dépendance psychologique')}</li>
                        <li>{t('consent.risk4', 'Interactions possibles avec certains médicaments')}</li>
                        <li>{t('consent.risk5', 'Risques accrus pour les personnes souffrant de troubles psychiatriques')}</li>
                        <li>{t('consent.risk6', 'Dangers pour le fœtus en cas de grossesse')}</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-base mb-2 text-white">
                        {t('consent.section3Title', '3. Recommandations de sécurité')}
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>{t('consent.reco1', 'Ne conduisez jamais sous l\'influence du cannabis')}</li>
                        <li>{t('consent.reco2', 'Évitez de mélanger avec l\'alcool ou d\'autres substances')}</li>
                        <li>{t('consent.reco3', 'Conservez les produits hors de portée des enfants et des animaux')}</li>
                        <li>{t('consent.reco4', 'Commencez par de faibles doses et attendez les effets')}</li>
                        <li>{t('consent.reco5', 'Ne consommez pas si vous êtes enceinte ou allaitante')}</li>
                        <li>{t('consent.reco6', 'Consultez un professionnel de santé en cas de questions')}</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-base mb-2 text-white">
                        {t('consent.section4Title', '4. Légalité')}
                    </h3>
                    <p>
                        {t('consent.section4Text', 'Il est de votre responsabilité de vous assurer que vous respectez les lois en vigueur dans votre juridiction concernant la possession, la consommation et le partage d\'informations relatives au cannabis.')}
                    </p>
                </section>

                <section>
                    <h3 className="font-semibold text-base mb-2 text-white">
                        {t('consent.section5Title', '5. Responsabilité')}
                    </h3>
                    <p>
                        {t('consent.section5Text', 'En utilisant Reviews-Maker, vous reconnaissez avoir pris connaissance de ces risques et recommandations. Vous acceptez d\'utiliser la plateforme de manière responsable.')}
                    </p>
                </section>

                <LiquidCard
                    className="p-4"
                    style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderColor: 'rgba(139, 92, 246, 0.3)'
                    }}
                >
                    <p className="text-violet-300 text-sm">
                        {t('consent.finalNote', '📌 En acceptant ce consentement, vous confirmez avoir lu et compris l\'ensemble de ces informations et vous engagez à utiliser la plateforme de manière responsable.')}
                    </p>
                </LiquidCard>
            </div>
        </LiquidModal>
    );
};

export default ConsentModal;
