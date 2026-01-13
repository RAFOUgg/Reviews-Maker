import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PipelineWithSidebar from './PipelineWithSidebar';
import { CULTURE_PHASES } from './PipelineWithSidebar';
import MobilePipelineView from './MobilePipelineView';

/**
 * ResponsivePipelineView - Adaptateur responsive
 * 
 * Détecte la taille d'écran et affiche:
 * - Desktop (>= md/768px): PipelineWithSidebar (sidebar + grille + drag drop)
 * - Mobile (< md/768px): MobilePipelineView (timeline fullwidth + click to edit)
 */

const ResponsivePipelineView = (props) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isMobile) {
        // Mode mobile: Timeline optimisée
        return <MobilePipelineView {...props} />;
    }

    // Mode desktop: Interface complète avec sidebar
    return <PipelineWithSidebar {...props} />;
};

export default ResponsivePipelineView;


