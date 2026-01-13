import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';
import TemplateRenderer from './TemplateRenderer';

export default function PreviewPane() {
    const previewRef = useRef(null);
    const config = useOrchardStore((state) => state.config);
    const reviewData = useOrchardStore((state) => state.reviewData);
    const isPreviewFullscreen = useOrchardStore((state) => state.isPreviewFullscreen);

    // Validation des données
    if (!reviewData || !config) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {!reviewData ? 'Aucune review sélectionnée' : 'Configuration invalide'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {!reviewData ? 'Sélectionnez une review pour voir l\'aperçu' : 'La configuration du template est invalide'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-auto">
            <div className={`w-full h-full flex items-center justify-center p-8 ${isPreviewFullscreen ? 'p-12' : 'p-8'}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    ref={previewRef}
                    id="orchard-preview-container"
                    className="relative"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'fit-content',
                        height: 'fit-content'
                    }}
                >
                    {/* Preview Info Badge */}
                    <div className="absolute -top-8 left-0 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            {config.template}
                        </div>
                        <div className="px-2 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            {config.ratio}
                        </div>
                    </div>

                    {/* Template Renderer */}
                    <TemplateRenderer
                        config={config}
                        reviewData={reviewData}
                    />

                    {/* Watermark indicator (if enabled) */}
                    {config.branding.enabled && (
                        <div className="absolute -bottom-8 right-0 text-xs text-gray-400 dark:text-gray-500">
                            Filigrane activé
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}



