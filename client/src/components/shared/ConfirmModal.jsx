import React from 'react';
import { X } from 'lucide-react';
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI';

const ConfirmModal = ({ open, title = 'Confirmer', message = '', confirmLabel = 'OK', cancelLabel = 'Annuler', onCancel = () => { }, onConfirm = () => { }, variant = 'danger' }) => {
    const glowColor = variant === 'danger' ? 'red' : variant === 'warning' ? 'amber' : 'violet';

    return (
        <LiquidModal
            isOpen={open}
            onClose={onCancel}
            title={title}
            size="sm"
            glowColor={glowColor}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <LiquidButton variant="ghost" onClick={onCancel}>
                        {cancelLabel}
                    </LiquidButton>
                    <LiquidButton
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </LiquidButton>
                </div>
            }
        >
            <p className="text-white/70">{message}</p>
        </LiquidModal>
    );
};

export default ConfirmModal;


