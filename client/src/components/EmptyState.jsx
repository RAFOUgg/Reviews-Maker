/**
 * Composant EmptyState réutilisable
 * Affiche un message quand aucune donnée n'est disponible
 */
import Button from './Button'

export default function EmptyState({
    icon = '📭',
    title,
    message,
    actionLabel,
    onAction,
    className = ''
}) {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-12 ${className}`}>
            <div className="text-6xl mb-4 opacity-50">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-dark-text mb-2">
                {title}
            </h3>
            <p className="text-dark-muted max-w-md mb-6">
                {message}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="primary">
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
