/**
 * LegalWelcomeModal - Modal de bienvenue légale
 * Affiche les conditions d'utilisation et demande confirmation
 * Liquid Glass UI Design System
 */

import React, { useState, useEffect } from 'react';
import { LiquidModal, LiquidButton, LiquidCard, LiquidChip } from '@/components/ui/LiquidUI';
import { Globe, AlertTriangle, Check, Shield, Loader2 } from 'lucide-react';
import legalTranslations from '../i18n/legalWelcome.json';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n/i18n';

const LegalWelcomeModal = ({ onAccept, onDeny }) => {
    const { user, isAuthenticated } = useAuth();
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language || 'fr');
    const [ageConfirmed, setAgeConfirmed] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [userIsLegal, setUserIsLegal] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const checkUserAge = async () => {
            setLoading(true);
            const hasVisited = localStorage.getItem('hasVisitedBefore');
            setIsFirstVisit(!hasVisited);

            if (isAuthenticated && user) {
                try {
                    const response = await fetch('/api/account/info', {
                        credentials: 'include'
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.birthdate) {
                            const birthDate = new Date(data.birthdate);
                            const today = new Date();
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const monthDiff = today.getMonth() - birthDate.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                            if (age >= 18) {
                                setUserIsLegal(true);
                                setAgeConfirmed(true);
                            }
                        }
                        if (data.locale) {
                            setLanguage(data.locale);
                            await changeLanguage(data.locale);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user info:', error);
                }
            }
            setLoading(false);
        };
        checkUserAge();
    }, [isAuthenticated, user]);

    const t = legalTranslations[language] || legalTranslations.fr;

    const handleAccept = async () => {
        if (!ageConfirmed) {
            setError(t.errors?.mustConfirmAge || 'Vous devez confirmer votre âge');
            return;
        }
        if (!consentGiven) {
            setError(t.errors?.mustAcceptConsent || 'Vous devez accepter les conditions');
            return;
        }

        if (isAuthenticated && user) {
            try {
                await fetch('/api/account/language', {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ locale: language }),
                });
            } catch (error) {
                console.error('Error saving language preference:', error);
            }
        }

        localStorage.setItem('hasVisitedBefore', 'true');
        onAccept({ language, timestamp: Date.now() });
    };

    const handleLanguageChange = async (newLang) => {
        setLanguage(newLang);
        await changeLanguage(newLang);
    };

    if (loading) {
        return (
            <LiquidModal isOpen={true} onClose={() => { }} title="" size="sm" glowColor="violet">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                </div>
            </LiquidModal>
        );
    }

    return (
        <LiquidModal
            isOpen={true}
            onClose={onDeny}
            title={
                <div className="flex flex-col items-center text-center gap-3">
                    <img
                        src="/branding_logo.png"
                        alt="Terpologie"
                        className="h-16 w-16 object-contain"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {t.welcome?.title || 'Bienvenue sur Terpologie'}
                        </h2>
                        <p className="text-sm text-white/60 mt-1">
                            {t.welcome?.subtitle || 'Plateforme de reviews cannabis'}
                        </p>
                    </div>
                </div>
            }
            size="md"
            glowColor="violet"
            footer={
                <div className="flex gap-3 w-full">
                    <LiquidButton variant="ghost" onClick={onDeny} className="flex-1">
                        {t.actions?.deny || 'Refuser'}
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleAccept}
                        disabled={!ageConfirmed || !consentGiven}
                        className="flex-1"
                    >
                        {t.actions?.continue || 'Continuer'}
                    </LiquidButton>
                </div>
            }
        >
            <div className="space-y-5">
                {/* Language Selector */}
                <LiquidCard className={`p-4 ${isFirstVisit ? 'border-violet-500/50' : ''}`}>
                    {isFirstVisit && (
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-4 h-4 text-violet-400" />
                            <p className="text-sm text-white font-medium">
                                {t.welcome?.selectLanguage || 'Choisissez votre langue / Choose your language'}
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <LiquidChip
                                key={lang.code}
                                selected={language === lang.i18nCode}
                                onClick={() => handleLanguageChange(lang.i18nCode)}
                            >
                                <span className="mr-2">{lang.flag}</span>
                                {lang.label}
                            </LiquidChip>
                        ))}
                    </div>
                </LiquidCard>

                {/* RDR Warning */}
                <LiquidCard className="p-4" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)'
                }}>
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-red-300 text-sm block mb-1">
                                {t.rdr?.title || 'Avertissement RDR'}
                            </strong>
                            <p className="text-red-200/80 text-sm leading-relaxed">
                                {t.rdr?.warning || 'Ne consommez pas si vous êtes mineur, enceinte, ou si la loi locale l\'interdit. Ne conduisez pas après consommation. En cas de doute médical, consultez un professionnel.'}
                            </p>
                        </div>
                    </div>
                </LiquidCard>

                {/* Age Confirmation */}
                {!userIsLegal ? (
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-violet-500/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={ageConfirmed}
                            onChange={(e) => setAgeConfirmed(e.target.checked)}
                            className="w-5 h-5 rounded border-white/30 bg-white/5 mt-0.5 accent-violet-500"
                        />
                        <span className="text-sm text-white/80">
                            {t.consent?.ageConfirm || 'Je confirme avoir 18 ans ou plus et être majeur dans mon pays de résidence.'}
                        </span>
                    </label>
                ) : (
                    <LiquidCard className="p-3" style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderColor: 'rgba(34, 197, 94, 0.3)'
                    }}>
                        <div className="flex items-center gap-2">
                            <div className="p-1 rounded-full bg-green-500/20">
                                <Check className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-green-300 text-sm">
                                {t.consent?.ageVerified || 'Âge vérifié via votre profil'}
                            </span>
                        </div>
                    </LiquidCard>
                )}

                {/* Consent Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-violet-500/50 transition-colors">
                    <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 mt-0.5 accent-violet-500"
                    />
                    <span className="text-sm text-white/80">
                        {t.consent?.legalConsent || 'J\'ai lu et j\'accepte la charte légale et les règles de ce site.'}
                    </span>
                </label>

                {/* Error Message */}
                {error && (
                    <LiquidCard className="p-3" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                    }}>
                        <p className="text-red-400 text-sm">{error}</p>
                    </LiquidCard>
                )}

                {/* Footer Note */}
                <p className="text-xs text-white/40 text-center">
                    {t.footer?.note || 'Cette confirmation est requise à chaque visite pour des raisons légales.'}
                </p>
            </div>
        </LiquidModal>
    );
};

export default LegalWelcomeModal;
