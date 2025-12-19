/**
 * PreConfigBadge - Badge visuel pour items pré-configurés
 * 
 * Affiche un badge vert avec checkmark sur les items du panneau
 * qui ont une valeur pré-configurée
 */

import { CheckCircle } from 'lucide-react';

const PreConfigBadge = ({ value, unit }) => {
    return (
        <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-green-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-lg flex items-center gap-0.5 animate-pulse z-10">
            <CheckCircle className="w-2.5 h-2.5" />
            <span className="truncate max-w-[60px]">
                {value}{unit && ` ${unit}`}
            </span>
        </div>
    );
};

export default PreConfigBadge;
