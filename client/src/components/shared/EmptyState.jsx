/**
 * Composant EmptyState réutilisable
 * Affiche un message quand aucune donnée n'est disponible
 */
import { LiquidButton, LiquidCard } from '@/components/ui/LiquidUI'

export default function EmptyState({
    icon = '📭',
    title,
    message,
    actionLabel,
    onAction,
    className = ''
}) {
    return (
        <LiquidCard className={`flex flex-col items-center justify-center text-center p-12 ${className}`}>
            <div className="text-6xl mb-4 opacity-50">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
                {title}
            </h3>
            <p className="text-white/60 max-w-md mb-6">
                {message}
            </p>
            {actionLabel && onAction && (
                <LiquidButton onClick={onAction} variant="primary">
                    {actionLabel}
                </LiquidButton>
            )}
        </LiquidCard>
    )
}


