import React from 'react';
import { Sparkles, TrendingUp, Droplet, Sun, Wind } from 'lucide-react';

/**
 * Composant pour afficher des badges/icônes dans les cellules de pipeline remplies
 * Indique visuellement le type et la quantité de données présentes
 */
const PipelineCellBadge = ({ cellData, sectionId }) => {
    if (!cellData || !cellData.data) return null;

    // Calculer le niveau de remplissage pour déterminer la couleur
    const completionPercentage = cellData.completionPercentage || 0;

    const getBgColor = () => {
        if (completionPercentage === 0) return 'bg-gray-100';
        if (completionPercentage <= 33) return 'bg-yellow-50 border-yellow-300';
        if (completionPercentage <= 66) return 'bg-orange-50 border-orange-300';
        if (completionPercentage < 100) return ' ';
        return 'bg-green-50 border-green-400';
    };

    const getTextColor = () => {
        if (completionPercentage === 0) return 'text-gray-400';
        if (completionPercentage <= 33) return 'text-yellow-600';
        if (completionPercentage <= 66) return 'text-orange-600';
        if (completionPercentage < 100) return '';
        return 'text-green-600';
    };

    // Mapper les sections aux icônes appropriées
    const getSectionIcon = (section) => {
        const iconProps = { className: "w-3 h-3", strokeWidth: 2.5 };

        const iconMap = {
            'general': <Sparkles {...iconProps} />,
            'substrat': <TrendingUp {...iconProps} />,
            'environnement': <Wind {...iconProps} />,
            'lumiere': <Sun {...iconProps} />,
            'irrigation': <Droplet {...iconProps} />,
            'engrais': <Sparkles {...iconProps} />,
            'palissage': <TrendingUp {...iconProps} />,
            'morphologie': <TrendingUp {...iconProps} />,
            'recolte': <Sparkles {...iconProps} />,
        };

        return iconMap[section] || <Sparkles {...iconProps} />;
    };

    // Extraire des infos clés pour affichage
    const getKeyInfo = () => {
        const data = cellData.data;
        const keyData = [];

        // Température
        if (data.temperature) {
            keyData.push({ icon: '🌡️', value: `${data.temperature}°C` });
        }

        // Humidité
        if (data.humidity || data['humidite-relative']) {
            keyData.push({ icon: '💧', value: `${data.humidity || data['humidite-relative']}%` });
        }

        // Lumière
        if (data.puissance) {
            keyData.push({ icon: '💡', value: `${data.puissance}W` });
        }

        // Arrosage
        if (data['volume-eau']) {
            keyData.push({ icon: '💦', value: `${data['volume-eau']}L` });
        }

        return keyData;
    };

    const keyInfo = getKeyInfo();
    const hasData = Object.keys(cellData.data || {}).length > 0;

    if (!hasData) return null;

    return (
        <div className={`absolute inset-0 ${getBgColor()} border transition-all duration-200`}>
            <div className="h-full flex flex-col justify-between p-1.5">
                {/* Header avec icône section */}
                <div className="flex items-center justify-between">
                    <div className={`${getTextColor()} flex items-center gap-1`}>
                        {getSectionIcon(sectionId)}
                        <span className="text-[9px] font-bold">
                            {completionPercentage}%
                        </span>
                    </div>
                    {completionPercentage === 100 && (
                        <span className="text-green-500 text-xs">✓</span>
                    )}
                </div>

                {/* Données clés en mini */}
                {keyInfo.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                        {keyInfo.slice(0, 3).map((info, idx) => (
                            <div
                                key={idx}
                                className="text-[8px] text-gray-600 flex items-center gap-1 truncate"
                            >
                                <span>{info.icon}</span>
                                <span className="font-medium">{info.value}</span>
                            </div>
                        ))}
                        {keyInfo.length > 3 && (
                            <div className="text-[8px] text-gray-400">
                                +{keyInfo.length - 3} autre{keyInfo.length - 3 > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Indicateur de niveau en bas */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
                <div
                    className={`h-full transition-all ${completionPercentage === 100 ? 'bg-green-500' : completionPercentage >= 67 ? '' : completionPercentage >= 34 ? 'bg-orange-500' : 'bg-yellow-500' }`}
                    style={{ width: `${completionPercentage}%` }}
                />
            </div>
        </div>
    );
};

export default PipelineCellBadge;

