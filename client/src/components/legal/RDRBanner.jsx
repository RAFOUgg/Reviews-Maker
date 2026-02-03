/**
 * Bannière RDR (Réduction Des Risques) sticky
 * Affichée en permanence en haut de toutes les pages
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RDRBanner = () => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 backdrop-blur-md border-b border-amber-500/20 text-white shadow-lg sticky top-0 z-[9999]">
            <div className="container mx-auto px-4">
                {/* Version compacte */}
                <div className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-amber-500/20">
                            <Info className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="font-medium text-amber-300">
                            {t('rdr.banner.title', 'Réduction des risques')}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors text-xs font-medium"
                    >
                        {isExpanded
                            ? t('rdr.banner.collapse', 'Masquer')
                            : t('rdr.banner.expand', 'En savoir plus')}
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Version étendue */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pb-4 text-sm border-t border-amber-500/20 pt-3">
                                <h3 className="font-semibold mb-3 text-white">
                                    {t('rdr.banner.expandedTitle', 'Informations importantes sur la consommation de cannabis')}
                                </h3>
                                <ul className="space-y-2 text-xs text-white/80">
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        {t('rdr.banner.point1', 'La consommation de cannabis comporte des risques pour la santé')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        {t('rdr.banner.point2', 'Évitez de conduire ou d\'utiliser des machines après consommation')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        {t('rdr.banner.point3', 'Ne consommez pas si vous êtes enceinte ou allaitante')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        {t('rdr.banner.point4', 'Conservez hors de portée des enfants et des animaux')}
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-400">•</span>
                                        {t('rdr.banner.point5', 'Consultez un professionnel de santé en cas de doute')}
                                    </li>
                                </ul>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <a
                                        href="https://www.canada.ca/fr/sante-canada/services/drogues-medicaments/cannabis.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        {t('rdr.banner.linkCanada', 'Ressources Santé Canada')}
                                    </a>
                                    <a
                                        href="https://solidarites-sante.gouv.fr/prevention-en-sante/addictions/cannabis"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        {t('rdr.banner.linkFrance', 'Ressources Santé France')}
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RDRBanner;
