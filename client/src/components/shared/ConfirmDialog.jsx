import React, { useEffect } from 'react'
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI'

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmer la résiliation',
    message = 'Êtes-vous sûr de vouloir résilier votre abonnement ? Cette action peut entraîner une perte d\'accès à certaines fonctionnalités.',
    confirmText = 'Oui, résilier',
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

    const variantStyles = {
        danger: {
            icon: '🗑️',
            glowColor: 'red'
        },
        warning: {
            icon: '⚠️',
            glowColor: 'amber'
        },
        info: {
            icon: 'ℹ️',
            glowColor: 'blue'
        }
    }

    const style = variantStyles[variant] || variantStyles.info

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            closeOnOverlay={false}
            showCloseButton={true}
        >
            <LiquidModal.Header>
                <LiquidModal.Title className="items-start" icon={() => <span className="text-2xl">{style.icon}</span>}>
                    <div>
                        <div className="text-lg font-semibold text-white">{title}</div>
                        <div className="text-sm text-white/60 mt-1">{message}</div>
                    </div>
                </LiquidModal.Title>
            </LiquidModal.Header>

            <LiquidModal.Body className="pt-2">
                {/* Extra explanation area (keeps layout consistent) */}
                <div className="text-sm text-white/70">Si vous confirmez, votre abonnement prendra fin à la prochaine date de facturation. Certaines données resteront disponibles mais l'accès à des fonctionnalités avancées sera restreint.</div>
            </LiquidModal.Body>

            <LiquidModal.Footer>
                <div className="flex w-full gap-3">
                    <LiquidButton onClick={onClose} variant="ghost" className="flex-1">
                        {cancelText}
                    </LiquidButton>

                    <LiquidButton
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        className="flex-1"
                    >
                        {confirmText}
                    </LiquidButton>
                </div>
            </LiquidModal.Footer>
        </LiquidModal>
    )
}


