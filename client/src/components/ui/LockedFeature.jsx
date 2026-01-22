import React from 'react'
import { Lock } from 'lucide-react'

/**
 * Composant pour afficher un message de feature verrouillée
 * Affiche un cadre avec icône verrou et bouton upgrade
 */
export default function LockedFeature({
    reason = 'Premium Producteur',
    size = 'medium',
    onUpgrade
}) {
    const sizeClasses = {
        small: 'h-20 p-3',
        medium: 'h-32 p-6',
        large: 'h-48 p-8',
    }

    return (
        <div className={`
            w-full ${sizeClasses[size]}
            bg-gradient-to-br from-slate-100 to-slate-200 
            dark:from-slate-800 dark:to-slate-900
            border-2 border-dashed border-slate-300 dark:border-slate-700
            rounded-lg
            flex flex-col items-center justify-center gap-4
            text-center
        `}>
            {/* Icône verrou */}
            <div className="relative">
                <Lock className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                <span className="absolute -top-1 -right-1 text-lg">💎</span>
            </div>

            {/* Texte */}
            <div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fonctionnalité Premium
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {reason}
                </p>
            </div>

            {/* Bouton upgrade */}
            {onUpgrade && (
                <button
                    onClick={onUpgrade}
                    className="
                        mt-2 px-4 py-2 
                        bg-gradient-to-r from-blue-500 to-purple-600 
                        hover:from-blue-600 hover:to-purple-700
                        text-white text-sm font-medium
                        rounded-lg
                        transition-all duration-200
                        hover:shadow-lg
                        transform hover:scale-105
                    "
                >
                    ✨ Upgrade
                </button>
            )}
        </div>
    )
}

/**
 * Composant alternatif: Badge compact pour indiquer une feature verrouillée
 */
export function LockedBadge({ reason = 'Premium' }) {
    return (
        <div className="
            inline-flex items-center gap-1 
            px-3 py-1 
            bg-gradient-to-r from-amber-100 to-orange-100 
            dark:from-amber-900/30 dark:to-orange-900/30
            border border-amber-300 dark:border-amber-700
            rounded-full
            text-sm font-medium
            text-amber-900 dark:text-amber-200
        ">
            <span>🔒</span>
            <span>{reason}</span>
        </div>
    )
}

/**
 * Wrapper pour bloquer une section si utilisateur n'a pas permission
 */
export function FeatureLock({
    isLocked,
    reason = 'Premium Producteur',
    children,
    onUpgrade,
    size = 'medium'
}) {
    if (isLocked) {
        return <LockedFeature reason={reason} onUpgrade={onUpgrade} size={size} />
    }

    return children
}
