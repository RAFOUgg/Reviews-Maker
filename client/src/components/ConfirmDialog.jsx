/**
 * Composant ConfirmDialog réutilisable
 * Affiche une modal de confirmation avec actions personnalisables
 */
import { useEffect } from 'react'
import Button from './Button'

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    variant = 'danger' // danger, warning, info
}) {
    // Fermer avec Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const variantStyles = {
        danger: {
            icon: '🗑️',
            color: 'text-red-400',
            buttonClass: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: '⚠️',
            color: 'text-amber-400',
            buttonClass: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            icon: 'ℹ️',
            color: '',
            buttonClass: ' hover:'
        }
    }

    const style = variantStyles[variant] || variantStyles.info

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-dark-surface rounded-2xl p-6 max-w-md w-full border border-dark-border shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icône et titre */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`text-4xl ${style.color}`}>
                        {style.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-dark-text mb-2">
                            {title}
                        </h3>
                        <p className="text-dark-muted">
                            {message}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`flex-1 ${style.buttonClass}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    )
}

