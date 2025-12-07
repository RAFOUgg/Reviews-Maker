/**
 * Bannière RDR (Réduction Des Risques) sticky
 * Affichée en permanence en haut de toutes les pages
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RDRBanner = () => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                {/* Version compacte */}
                <div className="flex items-center justify-between py-2 text-sm">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">
                            {t('rdr.banner.title', 'Réduction des risques')}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-white hover:text-gray-200 transition-colors underline text-xs"
                    >
                        {isExpanded
                            ? t('rdr.banner.collapse', 'Masquer')
                            : t('rdr.banner.expand', 'En savoir plus')}
                    </button>
                </div>

                {/* Version étendue */}
                {isExpanded && (
                    <div className="pb-4 text-sm border-t border-white/20 pt-3 animate-fadeIn">
                        <h3 className="font-semibold mb-2">
                            {t('rdr.banner.expandedTitle', 'Informations importantes sur la consommation de cannabis')}
                        </h3>
                        <ul className="space-y-1 text-xs opacity-90">
                            <li>• {t('rdr.banner.point1', 'La consommation de cannabis comporte des risques pour la santé')}</li>
                            <li>• {t('rdr.banner.point2', 'Évitez de conduire ou d\'utiliser des machines après consommation')}</li>
                            <li>• {t('rdr.banner.point3', 'Ne consommez pas si vous êtes enceinte ou allaitante')}</li>
                            <li>• {t('rdr.banner.point4', 'Conservez hors de portée des enfants et des animaux')}</li>
                            <li>• {t('rdr.banner.point5', 'Consultez un professionnel de santé en cas de doute')}</li>
                        </ul>
                        <div className="mt-3 flex gap-3">
                            <a
                                href="https://www.canada.ca/fr/sante-canada/services/drogues-medicaments/cannabis.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline hover:text-gray-200"
                            >
                                {t('rdr.banner.linkCanada', 'Ressources Santé Canada')}
                            </a>
                            <a
                                href="https://solidarites-sante.gouv.fr/prevention-en-sante/addictions/cannabis"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline hover:text-gray-200"
                            >
                                {t('rdr.banner.linkFrance', 'Ressources Santé France')}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RDRBanner;
