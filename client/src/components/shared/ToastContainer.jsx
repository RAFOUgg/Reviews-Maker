/**
 * ToastContainer - Système de notifications toast
 * Liquid Glass UI Design System
 */

import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

export const useToastStore = create((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Date.now() + Math.random();
        const newToast = { id, duration: 5000, ...toast };

        set((state) => ({ toasts: [...state.toasts, newToast] }));

        if (newToast.duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id)
                }));
            }, newToast.duration);
        }

        return id;
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }));
    },
    clearAll: () => set({ toasts: [] })
}));

export const useToast = () => {
    const { addToast, removeToast, clearAll } = useToastStore();

    return {
        success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
        error: (message, options = {}) => addToast({ type: 'error', message, duration: 7000, ...options }),
        info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
        warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
        loading: (message, options = {}) => addToast({ type: 'loading', message, duration: 0, ...options }),
        remove: removeToast,
        clear: clearAll
    };
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    const getIcon = (type) => {
        const iconClass = 'w-5 h-5';
        switch (type) {
            case 'success':
                return <CheckCircle className={iconClass} />;
            case 'error':
                return <XCircle className={iconClass} />;
            case 'warning':
                return <AlertTriangle className={iconClass} />;
            case 'info':
                return <Info className={iconClass} />;
            case 'loading':
                return <Loader2 className={`${iconClass} animate-spin`} />;
            default:
                return null;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    icon: 'text-green-400',
                    text: 'text-green-50',
                    glow: '0 0 20px rgba(34, 197, 94, 0.3)'
                };
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    icon: 'text-red-400',
                    text: 'text-red-50',
                    glow: '0 0 20px rgba(239, 68, 68, 0.3)'
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    icon: 'text-amber-400',
                    text: 'text-amber-50',
                    glow: '0 0 20px rgba(245, 158, 11, 0.3)'
                };
            case 'info':
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    icon: 'text-blue-400',
                    text: 'text-blue-50',
                    glow: '0 0 20px rgba(59, 130, 246, 0.3)'
                };
            case 'loading':
                return {
                    bg: 'bg-violet-500/10',
                    border: 'border-violet-500/30',
                    icon: 'text-violet-400',
                    text: 'text-violet-50',
                    glow: '0 0 20px rgba(139, 92, 246, 0.3)'
                };
            default:
                return {
                    bg: 'bg-white/10',
                    border: 'border-white/20',
                    icon: 'text-white',
                    text: 'text-white',
                    glow: 'none'
                };
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const styles = getStyles(toast.type);

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl ${styles.bg} ${styles.border}`}
                            style={{ boxShadow: styles.glow }}
                            onClick={() => removeToast(toast.id)}
                        >
                            <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
                                {getIcon(toast.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold break-words ${styles.text}`}>
                                    {toast.message}
                                </p>
                                {toast.description && (
                                    <p className={`text-xs mt-1 opacity-80 ${styles.text}`}>
                                        {toast.description}
                                    </p>
                                )}
                            </div>
                            {toast.duration > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeToast(toast.id);
                                    }}
                                    className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}


