import React from 'react';
import { X } from 'lucide-react';

const ConfirmModal = ({ open, title = 'Confirmer', message = '', confirmLabel = 'OK', cancelLabel = 'Annuler', onCancel = () => { }, onConfirm = () => { } }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onCancel} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <div className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                </div>
                <div className="flex items-center justify-end gap-3 p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200">{cancelLabel}</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white">{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
