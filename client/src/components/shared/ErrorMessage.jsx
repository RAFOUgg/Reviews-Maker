/**
 * Composant ErrorMessage réutilisable
 * Affiche un message d'erreur formaté - Liquid Glass UI style
 */
import { LiquidButton, LiquidCard } from '@/components/ui/LiquidUI'

export default function ErrorMessage({ error, onRetry, className = '' }) {
    if (!error) return null

    const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Une erreur est survenue'

    return (
        <LiquidCard
            className={`border-red-500/30 ${className}`}
            style={{
                background: 'rgba(239, 68, 68, 0.1)',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.15), inset 0 0 20px rgba(239, 68, 68, 0.05)'
            }}
        >
            <div className="flex items-start gap-3 p-4">
                <div className="text-2xl">❌</div>
                <div className="flex-1">
                    <h3 className="text-red-400 font-semibold mb-1">
                        Erreur
                    </h3>
                    <p className="text-red-300/90 text-sm">
                        {errorMessage}
                    </p>
                    {onRetry && (
                        <LiquidButton
                            onClick={onRetry}
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-red-400 hover:text-red-300"
                        >
                            Réessayer
                        </LiquidButton>
                    )}
                </div>
            </div>
        </LiquidCard>
    )
}


