import React, { useEffect } from 'react'
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI'

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
            title={
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{style.icon}</span>
                    <span>{title}</span>
                </div>
            }
            size="sm"
            glowColor={style.glowColor}
            footer={
                <div className="flex gap-3 w-full">
                    <LiquidButton
                        onClick={onClose}
                        variant="ghost"
                        className="flex-1"
                    >
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
            }
        >
            <p className="text-white/70">{message}</p>
        </LiquidModal>
    )
}


