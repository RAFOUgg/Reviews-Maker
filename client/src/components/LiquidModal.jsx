import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * REVIEWS-MAKER V2 - Liquid Glass Modal
 * Modal avec effet glassmorphism et animations fluides
 */

const LiquidModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  footer,
  className = '',
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-[95vw]',
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className={`
                liquid-glass w-full ${sizes[size]} max-h-[90vh] overflow-hidden rounded-3xl
                shadow-2xl pointer-events-auto ${className}
              `}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  {title && (
                    <h2 className="text-2xl font-bold text-gradient">
                      {title}
                    </h2>
                  )}

                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-xl hover:bg-white/10 transition-smooth"
                      aria-label="Fermer"
                    >
                      <X size={24} />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LiquidModal;

