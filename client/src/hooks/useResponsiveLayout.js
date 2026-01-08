/**
 * Hook useResponsiveLayout - Détecte la taille d'écran et expose des infos utiles
 * 
 * Utile pour:
 * - Adapter les grilles (grid-cols-X)
 * - Adapter les espacements
 * - Adapter les tailles de police
 * - Afficher/masquer des éléments selon l'écran
 */

import { useState, useEffect } from 'react';

export const useResponsiveLayout = () => {
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
        isTablet: typeof window !== 'undefined' ? (window.innerWidth >= 640 && window.innerWidth < 1024) : false,
        isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenSize({
                width,
                isMobile: width < 640,
                isTablet: width >= 640 && width < 1024,
                isDesktop: width >= 1024,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return screenSize;
};

/**
 * Classes Tailwind responsive réutilisables
 */
export const RESPONSIVE_CLASSES = {
    // Grilles
    gridCols: {
        auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        auto2: 'grid-cols-1 md:grid-cols-2',
        full: 'grid-cols-1',
        double: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    },

    // Espacements
    padding: {
        mobile: 'p-4',
        tablet: 'md:p-6',
        desktop: 'lg:p-8',
        all: 'p-4 md:p-6 lg:p-8',
    },

    // Écarts
    gap: {
        mobile: 'gap-3',
        tablet: 'md:gap-4',
        desktop: 'lg:gap-6',
        all: 'gap-3 md:gap-4 lg:gap-6',
    },

    // Texte
    text: {
        title: 'text-xl md:text-2xl lg:text-3xl',
        subtitle: 'text-base md:text-lg lg:text-xl',
        body: 'text-sm md:text-base lg:text-lg',
        small: 'text-xs md:text-sm lg:text-base',
    },

    // Input/Form
    input: 'w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg border',

    // Boutons
    button: {
        sm: 'px-3 py-2 text-xs md:text-sm rounded-lg',
        md: 'px-4 py-2 md:py-3 text-sm md:text-base rounded-lg',
        lg: 'px-6 py-3 text-base md:text-lg rounded-lg',
    },
};

export default useResponsiveLayout;
