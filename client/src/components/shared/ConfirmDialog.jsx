import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { LiquidButton } from '@/components/ui/LiquidUI'

export default function ConfirmDialog({ isOpen, title, description, onConfirm, onCancel, confirmText = 'Confirmer', cancelText = 'Annuler' }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative max-w-lg w-full">
                <div className="bg-gradient-to-br from-[#0a0a1a] to-[#07070f] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                    <div className="p-5 flex items-start justify-between border-b border-white/6">
                        <div>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                            {description && <p className="text-sm text-white/60 mt-1">{description}</p>}
                        </div>
                        <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-md">
                            <X className="text-white/60" />
                        </button>
                    </div>

                    <div className="p-5 flex items-center gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-md bg-white/5 text-white/80 hover:bg-white/10 transition"
                        >
                            {cancelText}
                        </button>
                        <LiquidButton
                            onClick={onConfirm}
                            variant="danger"
                            className="px-6"
                        >
                            {confirmText}
                        </LiquidButton>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
/**
 * Composant ConfirmDialog réutilisable
 * Affiche une modal de confirmation avec actions personnalisables
 */
import { useEffect } from 'react'
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


