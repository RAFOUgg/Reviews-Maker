import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { Sun, Moon, Palette } from 'lucide-react';

/**
 * REVIEWS-MAKER V2 - Theme Switcher Component
 * Sélecteur de thème avec UI moderne et Apple-like
 */

const ThemeSwitcher = ({ className = '' }) => {
  const { currentTheme, availableThemes, themeLabels, setTheme, getThemeLabel } = useThemeStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const themeIcons = {
    light: Sun,
    dark: Moon,
    'violet-lean': Palette,
    'vert-emeraude': Palette,
    'bleu-tahiti': Palette,
    sakura: Palette,
  };

  const themeColors = {
    light: '#8B5CF6',
    dark: '#8B5CF6',
    'violet-lean': '#8B5CF6',
    'vert-emeraude': '#10B981',
    'bleu-tahiti': '#3B82F6',
    sakura: '#EC4899',
  };

  const CurrentIcon = themeIcons[currentTheme] || Palette;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="liquid-glass flex items-center gap-2 px-4 py-2 rounded-xl transition-smooth hover:scale-105"
        aria-label="Changer de thème"
      >
        <CurrentIcon
          size={20}
          style={{ color: themeColors[currentTheme] }}
        />
        <span className="hidden sm:inline text-sm font-medium">
          {getThemeLabel(currentTheme)}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 liquid-glass rounded-2xl p-2 z-50 animate-fade-in">
            <div className="space-y-1">
              {availableThemes.map((theme) => {
                const Icon = themeIcons[theme];
                const isActive = currentTheme === theme;

                return (
                  <button
                    key={theme}
                    onClick={() => {
                      setTheme(theme);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-smooth hover:scale-[1.02]
                      ${isActive
                        ? 'bg-white/20 shadow-lg'
                        : 'hover:bg-white/10'
                      }
                    `}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: themeColors[theme] }}
                    >
                      <Icon size={16} className="text-white" />
                    </div>

                    <span className="flex-1 text-left font-medium">
                      {themeLabels[theme]}
                    </span>

                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Auto-detect toggle */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  useThemeStore.getState().toggleAutoDetect();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-smooth text-sm"
              >
                🔄 Détecter automatiquement
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
