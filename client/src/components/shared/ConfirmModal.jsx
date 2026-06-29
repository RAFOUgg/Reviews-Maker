import React from 'react';
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI';

const VARIANT_ICONS = { danger: '🗑️', warning: '⚠️', info: 'ℹ️' };

const ConfirmModal = ({ open, title = 'Confirmer', message = '', confirmLabel = 'OK', cancelLabel = 'Annuler', onCancel = () => { }, onConfirm = () => { }, variant = 'danger' }) => {
    return (
        <LiquidModal isOpen={open} onClose={onCancel} size="sm">
            <LiquidModal.Header>
                <LiquidModal.Title icon={() => <span className="text-2xl">{VARIANT_ICONS[variant] || VARIANT_ICONS.info}</span>}>
                    {title}
                </LiquidModal.Title>
            </LiquidModal.Header>
            <LiquidModal.Body>
                <p className="text-white/70">{message}</p>
            </LiquidModal.Body>
            <LiquidModal.Footer>
                <div className="flex w-full gap-3">
                    <LiquidButton variant="ghost" onClick={onCancel} className="flex-1">
                        {cancelLabel}
                    </LiquidButton>
                    <LiquidButton
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        className="flex-1"
                    >
                        {confirmLabel}
                    </LiquidButton>
                </div>
            </LiquidModal.Footer>
        </LiquidModal>
    );
};

export default ConfirmModal;


