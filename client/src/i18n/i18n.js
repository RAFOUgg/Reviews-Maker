/**
 * Configuration i18next pour l'internationalisation
 * Supporte: Français (FR), English (EN), Deutsch (DE), Español (ES)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from './fr.json';
import translationEN from './en.json';
import translationDE from './de.json';
import translationES from './es.json';

const resources = {
    fr: {
        translation: translationFR,
    },
    en: {
        translation: translationEN,
    },
    de: {
        translation: translationDE,
    },
    es: {
        translation: translationES,
    },
};

// Supported languages with flags and labels
export const SUPPORTED_LANGUAGES = [
    { code: 'en-US', flag: '🇺🇸', label: 'English (US)', i18nCode: 'en' },
    { code: 'en-GB', flag: '🇬🇧', label: 'English (UK)', i18nCode: 'en' },
    { code: 'fr', flag: '🇫🇷', label: 'Français', i18nCode: 'fr' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch', i18nCode: 'de' },
    { code: 'es', flag: '🇪🇸', label: 'Español', i18nCode: 'es' },
];

// Get language from user profile or localStorage
const getUserLanguage = () => {
    // Priority 1: Check localStorage for user preference
    const stored = localStorage.getItem('userLanguage');
    if (stored) return stored;

    // Priority 2: Check browser language and map to supported
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // 'en-US' -> 'en'

    // Map to supported language
    if (['en', 'fr', 'de', 'es'].includes(langCode)) {
        return langCode;
    }

    // Priority 3: Default to French
    return 'fr';
};

i18n
    .use(LanguageDetector) // Détecte automatiquement la langue (navigator, localStorage, etc.)
    .use(initReactI18next) // Passe i18n à react-i18next
    .init({
        resources,
        lng: getUserLanguage(), // Use detected or stored language
        fallbackLng: 'en', // Fallback to English if translation missing
        supportedLngs: ['fr', 'en', 'de', 'es'], // Supported languages
        debug: import.meta.env.DEV, // Logs uniquement en dev

        interpolation: {
            escapeValue: false, // React échappe automatiquement
        },

        detection: {
            // Ordre de détection de la langue
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'], // Sauvegarder dans localStorage
            lookupLocalStorage: 'i18nextLng',
        },

        react: {
            useSuspense: false, // Évite les problèmes de suspense
        },
    });

// Helper to change language and save preference
export const changeLanguage = async (langCode) => {
    await i18n.changeLanguage(langCode);
    localStorage.setItem('userLanguage', langCode);

    // Update HTML lang attribute for accessibility
    document.documentElement.lang = langCode;
};

export default i18n;
