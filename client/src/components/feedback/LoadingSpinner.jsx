/**
 * Composant LoadingSpinner réutilisable
 * Affiche un spinner de chargement avec message optionnel
 */

export default function LoadingSpinner({ size = 'md', message, className = '' }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    }

    const spinnerSize = sizes[size] || sizes.md

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`${spinnerSize} border-primary-500/30 border-t-primary-500 rounded-full animate-spin`}
                role="status"
                aria-label="Chargement"
            />
            {message && (
                <p className="text-sm text-dark-muted animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}
