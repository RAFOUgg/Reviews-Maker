/**
 * Modal de consentement RDR (Réduction Des Risques)
 * Affichée après vérification d'âge réussie
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
            alert(t('consent.errorNetwork', 'Erreur réseau, veuillez réessayer'));
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r text-white p-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {t('consent.title', 'Consentement de Réduction des Risques')}
                    </h2>
                    <p className="text-sm mt-2 opacity-90">
                        {t('consent.subtitle', 'Veuillez lire attentivement avant de continuer')}
                    </p>
                </div>

                {/* Content scrollable */}
                <div
                    className="p-6 overflow-y-auto flex-1 text-gray-700 dark:text-gray-300 space-y-4 text-sm"
                    onScroll={(e) => {
                        const { scrollTop, scrollHeight, clientHeight } = e.target;
                        if (scrollTop + clientHeight >= scrollHeight - 10) {
                            setHasRead(true);
                        }
                    }}
                >
                    <section>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                            {t('consent.section1Title', '1. Nature de la plateforme')}
                        </h3>
                        <p>
                            {t('consent.section1Text', 'Reviews-Maker est une plateforme permettant de créer, partager et consulter des avis sur des produits à base de cannabis. Cette plateforme est destinée exclusivement aux adultes ayant l\'âge légal dans leur juridiction.')}
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
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
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                            {t('consent.section3Title', '3. Recommandations de sécurité')}
                        </h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>{t('consent.reco1', 'Ne conduisez jamais sous l\'influence du cannabis')}</li>
                            <li>{t('consent.reco2', 'Évitez de mélanger avec l\'alcool ou d\'autres substances')}</li>
                            <li>{t('consent.reco3', 'Conservez les produits hors de portée des enfants et des animaux')}</li>
                            <li>{t('consent.reco4', 'Commencez par de faibles doses et attendez les effets avant de consommer davantage')}</li>
                            <li>{t('consent.reco5', 'Ne consommez pas si vous êtes enceinte, allaitante ou avez des antécédents de troubles psychotiques')}</li>
                            <li>{t('consent.reco6', 'Consultez un professionnel de santé en cas de questions ou préoccupations')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                            {t('consent.section4Title', '4. Légalité')}
                        </h3>
                        <p>
                            {t('consent.section4Text', 'Il est de votre responsabilité de vous assurer que vous respectez les lois en vigueur dans votre juridiction concernant la possession, la consommation et le partage d\'informations relatives au cannabis. Certaines régions interdisent strictement toute forme d\'usage.')}
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                            {t('consent.section5Title', '5. Responsabilité')}
                        </h3>
                        <p>
                            {t('consent.section5Text', 'En utilisant Reviews-Maker, vous reconnaissez avoir pris connaissance de ces risques et recommandations. Vous acceptez d\'utiliser la plateforme de manière responsable et de ne pas en faire un usage contraire aux lois applicables. Reviews-Maker ne saurait être tenu responsable de toute conséquence découlant de l\'utilisation de la plateforme ou de la consommation de produits à base de cannabis.')}
                        </p>
                    </section>

                    <section className="dark: p-4 rounded-lg border border-violet-200 dark:border-violet-800">
                        <p className="font-semibold dark:">
                            {t('consent.finalNote', '📌 En acceptant ce consentement, vous confirmez avoir lu et compris l\'ensemble de ces informations et vous engagez à utiliser la plateforme de manière responsable.')}
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="hasRead"
                            checked={hasRead}
                            onChange={(e) => setHasRead(e.target.checked)}
                            className="w-4 h-4 border-gray-300 rounded focus:ring-violet-500"
                        />
                        <label htmlFor="hasRead" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {t('consent.confirmRead', 'J\'ai lu et je comprends l\'intégralité du texte')}
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onDecline}
                            disabled={loading}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {t('consent.decline', 'Refuser')}
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={!hasRead || loading}
                            className="flex-1 hover: text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? t('consent.accepting', 'Enregistrement...')
                                : t('consent.accept', 'J\'accepte et je comprends')}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                        {t('consent.privacy', 'Votre consentement est enregistré avec un horodatage pour des raisons légales')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConsentModal;
