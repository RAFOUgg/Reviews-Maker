/**
 * Configuration i18next pour l'internationalisation
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from './fr.json';
import translationEN from './en.json';

const resources = {
  fr: {
    translation: translationFR,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue (navigator, localStorage, etc.)
  .use(initReactI18next) // Passe i18n à react-i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut
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

export default i18n;
