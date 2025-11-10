import { motion } from 'framer-motion';
import { useOrchardStore, useOrchardActions, DEFAULT_TEMPLATES } from '../../../store/orchardStore';

export default function TemplateSelector() {
    const config = useOrchardStore((state) => state.config);
    const { setTemplate, setRatio } = useOrchardActions();
    const templates = DEFAULT_TEMPLATES;

    const ratios = [
        { id: '1:1', name: 'Carré (1:1)', icon: '⬜' },
        { id: '16:9', name: 'Paysage (16:9)', icon: '▭' },
        { id: '9:16', name: 'Portrait (9:16)', icon: '▯' },
        { id: '4:3', name: 'Standard (4:3)', icon: '▭' },
        { id: 'A4', name: 'A4 (Document)', icon: '📄' }
    ];

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Choix du Template
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sélectionnez un style de présentation pour votre review
                </p>
            </div>

            {/* Galerie de templates */}
            <div className="grid grid-cols-1 gap-3">
                {Object.values(templates).map((template) => (
                    <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTemplate(template.id)}
                        className={`
                            p-4 rounded-xl text-left transition-all border-2
                            ${config.template === template.id
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                            }
                        `}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {template.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {template.description}
                                </p>
                            </div>
                            {config.template === template.id && (
                                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        <div className="flex gap-1 mt-2">
                            {template.supportedRatios.slice(0, 3).map((ratio) => (
                                <span
                                    key={ratio}
                                    className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                    {ratio}
                                </span>
                            ))}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Sélecteur de ratio */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Format d'affichage
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {ratios.map((ratio) => {
                        const currentTemplate = templates[config.template];
                        const isSupported = currentTemplate?.supportedRatios.includes(ratio.id);

                        return (
                            <motion.button
                                key={ratio.id}
                                whileHover={isSupported ? { scale: 1.02 } : {}}
                                whileTap={isSupported ? { scale: 0.98 } : {}}
                                onClick={() => isSupported && setRatio(ratio.id)}
                                disabled={!isSupported}
                                className={`
                                    p-3 rounded-lg text-sm font-medium transition-all
                                    ${config.ratio === ratio.id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                        : isSupported
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-lg">{ratio.icon}</span>
                                    <span>{ratio.name}</span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
