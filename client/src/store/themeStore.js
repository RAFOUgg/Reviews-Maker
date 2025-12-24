import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * REVIEWS-MAKER V2 - Theme Store
 * Gestion centralisée des thèmes avec persistance localStorage
 * Thèmes disponibles : light, dark, violet-lean, vert-emeraude, bleu-tahiti, sakura
 */

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  VIOLET_LEAN: 'violet-lean',
  VERT_EMERAUDE: 'vert-emeraude',
  BLEU_TAHITI: 'bleu-tahiti',
  SAKURA: 'sakura',
};

const THEME_LABELS = {
  [THEMES.LIGHT]: 'Mode Clair',
  [THEMES.DARK]: 'Mode Sombre',
  [THEMES.VIOLET_LEAN]: 'Violet Lean',
  [THEMES.VERT_EMERAUDE]: 'Vert Émeraude',
  [THEMES.BLEU_TAHITI]: 'Bleu Tahiti',
  [THEMES.SAKURA]: 'Sakura',
};

const detectSystemTheme = () => {
  if (typeof window === 'undefined') return THEMES.LIGHT;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEMES.DARK
    : THEMES.LIGHT;
};

// Minimalized theme store: force dark mode and neutralize theme switching.
export const useThemeStore = create((set, get) => ({
  // Expose some constants for compatibility but keep dark-only behavior
  themes: THEMES,
  themeLabels: THEME_LABELS,
  availableThemes: [THEMES.DARK],

  // State (fixed)
  currentTheme: THEMES.DARK,
  autoDetect: false,

  // Actions are inert or forced to dark to remove runtime theme switching
  setTheme: (theme) => {
    // Ignore requested theme, always enforce dark
    set({ currentTheme: THEMES.DARK, autoDetect: false });
    try {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } catch (e) { /* ignore in non-browser env */ }
  },

  toggleAutoDetect: () => {
    // No-op: keep autoDetect false
    set({ autoDetect: false });
  },

  cycleTheme: () => {
    // No-op: keep dark
    get().setTheme(THEMES.DARK);
  },

  getThemeLabel: (theme) => THEME_LABELS[THEMES.DARK] || THEMES.DARK,

  // Initialization: enforce dark immediately
  initTheme: () => {
    try {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } catch (e) { /* ignore in non-browser env */ }
    set({ currentTheme: THEMES.DARK, autoDetect: false });
  }
}));

// Hook d'initialisation à appeler au démarrage de l'app
export const initializeTheme = () => {
  const store = useThemeStore.getState();
  store.initTheme();
};
