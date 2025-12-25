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

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // État
      currentTheme: THEMES.VIOLET_LEAN, // Thème par défaut
      autoDetect: false, // Détection automatique du thème système

      // Getters
      themes: THEMES,
      themeLabels: THEME_LABELS,
      availableThemes: Object.values(THEMES),

      // Actions
      setTheme: (theme) => {
        if (!Object.values(THEMES).includes(theme)) {
          console.warn(`Theme "${theme}" not found. Available themes:`, Object.values(THEMES));
          return;
        }

        set({ currentTheme: theme, autoDetect: false });
        document.documentElement.setAttribute('data-theme', theme);
      },

      toggleAutoDetect: () => {
        const newAutoDetect = !get().autoDetect;
        set({ autoDetect: newAutoDetect });

        if (newAutoDetect) {
          const systemTheme = detectSystemTheme();
          get().setTheme(systemTheme);

          // Écouter les changements du système
          if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
              if (get().autoDetect) {
                get().setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
              }
            });
          }
        }
      },

      cycleTheme: () => {
        const themes = Object.values(THEMES);
        const currentIndex = themes.indexOf(get().currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        get().setTheme(themes[nextIndex]);
      },

      getThemeLabel: (theme) => {
        return THEME_LABELS[theme] || theme;
      },

      // Initialisation
      initTheme: () => {
        const { currentTheme, autoDetect } = get();

        if (autoDetect) {
          const systemTheme = detectSystemTheme();
          set({ currentTheme: systemTheme });
          document.documentElement.setAttribute('data-theme', systemTheme);
        } else {
          document.documentElement.setAttribute('data-theme', currentTheme);
        }
      },
    }),
    {
      name: 'reviews-maker-theme',
      version: 2,
    }
  )
);

// Hook d'initialisation à appeler au démarrage de l'app
export const initializeTheme = () => {
  const store = useThemeStore.getState();
  store.initTheme();
};
