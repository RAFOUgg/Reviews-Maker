/**
 * Composant ErrorMessage réutilisable
 * Affiche un message d'erreur formaté
 */

export default function ErrorMessage({ error, onRetry, className = '' }) {
    if (!error) return null

    const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Une erreur est survenue'

    return (
        <div className={`bg-red-500/10 border border-red-500/30 rounded-xl p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="text-2xl">❌</div>
                <div className="flex-1">
                    <h3 className="text-red-400 font-semibold mb-1">
                        Erreur
                    </h3>
                    <p className="text-red-300/90 text-sm">
                        {errorMessage}
                    </p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                        >
                            Réessayer
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}


