/**
 * Composant LoadingSpinner réutilisable
 * Affiche un spinner de chargement avec message optionnel
 * Style Liquid Glass UI
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
                className={`${spinnerSize} border-white/20 border-t-violet-500 rounded-full animate-spin`}
                style={{
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                }}
                role="status"
                aria-label="Chargement"
            />
            {message && (
                <p className="text-sm text-white/60 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    )
}


