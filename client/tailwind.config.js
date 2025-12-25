/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Thème principal (Violet/Vert - par défaut)
                primary: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',  // Purple principal
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                },
                // Accent (Vert par défaut)
                accent: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',  // Green principal
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                // Cyan vibrant pour accents UI
                cyan: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                },
                // Dark mode colors - Design system moderne
                dark: {
                    bg: '#0F172A',        // Slate 900 - Fond principal sombre
                    surface: '#1E293B',   // Slate 800 - Surface élevée
                    card: '#334155',      // Slate 700 - Cards et conteneurs
                    border: '#475569',    // Slate 600 - Bordures subtiles
                    text: '#F8FAFC',      // Slate 50 - Texte principal clair
                    muted: '#CBD5E1',     // Slate 300 - Texte secondaire
                    accent: '#8B5CF6',    // Violet 500 - Accents vibrants
                }
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
                display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(139, 92, 246, 0.15)',
                'glass-lg': '0 20px 60px 0 rgba(139, 92, 246, 0.25)',
                'glass-xl': '0 25px 80px 0 rgba(139, 92, 246, 0.35)',
                'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
                'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.4)',
                'inner-glass': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
                'neumorphic': '12px 12px 24px rgba(0, 0, 0, 0.15), -12px -12px 24px rgba(255, 255, 255, 0.7)',
            },
            backdropBlur: {
                xs: '2px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                'shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'fade-in-down': 'fadeInDown 0.6s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'slide-left': 'slideLeft 0.5s ease-out',
                'slide-right': 'slideRight 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'shimmer': 'shimmer 2s infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideLeft: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
                    '100%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            transitionTimingFunction: {
                'apple': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                'smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            },
            transitionDuration: {
                '400': '400ms',
            },
        },
    },
    plugins: [],
}
