/**
 * Composant de sélection du type de compte
 * Affiché après vérification légale pour les nouveaux utilisateurs
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AccountTypeSelector = ({ isOpen, onComplete, currentType = 'consumer' }) => {
    const { t } = useTranslation();
    const [accountTypes, setAccountTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(currentType);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Charger les types de comptes disponibles
        const fetchAccountTypes = async () => {
            try {
                const response = await fetch('/api/account/types', {
                    credentials: 'include',
                });
                const data = await response.json();
                setAccountTypes(data.types);
            } catch (err) {
                console.error('Erreur chargement types de comptes:', err);
                setError('Erreur de chargement des options');
            }
        };

        if (isOpen) {
            fetchAccountTypes();
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (selectedType === currentType) {
            onComplete({ accountType: selectedType });
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/account/change-type', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newType: selectedType }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'upgrade_not_allowed') {
                    setError(data.message);
                } else {
                    setError(data.message || 'Erreur lors du changement de type de compte');
                }
                setLoading(false);
                return;
            }

            onComplete({ accountType: data.accountType });
        } catch (err) {
            console.error('Erreur changement type compte:', err);
            setError('Erreur réseau, veuillez réessayer');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        {t('accountType.title', 'Choisissez votre type de compte')}
                    </h2>
                    <p className="text-sm mt-2 opacity-90">
                        {t('accountType.subtitle', 'Sélectionnez le type de compte qui correspond à vos besoins')}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accountTypes.map((type) => {
                            const isSelected = selectedType === type.type;
                            const isCurrent = currentType === type.type;

                            return (
                                <button
                                    key={type.type}
                                    onClick={() => setSelectedType(type.type)}
                                    disabled={type.requiresSubscription && type.type !== 'consumer'}
                                    className={`
                    relative p-6 rounded-lg border-2 text-left transition-all
                    ${isSelected
                                            ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-violet-400'
                                        }
                    ${type.requiresSubscription && type.type !== 'consumer'
                                            ? 'opacity-60 cursor-not-allowed'
                                            : 'cursor-pointer'
                                        }
                  `}
                                >
                                    {isCurrent && (
                                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                            {t('accountType.current', 'Actuel')}
                                        </span>
                                    )}

                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {type.name}
                                        </h3>
                                        {type.price > 0 ? (
                                            <span className="text-xl font-bold text-violet-600 dark:text-violet-400">
                                                €{type.price}/mois
                                            </span>
                                        ) : (
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                {t('accountType.free', 'Gratuit')}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {type.description}
                                    </p>

                                    <ul className="space-y-2 mb-4">
                                        {type.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {type.requiresSubscription && type.type !== 'consumer' && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            {t('accountType.requiresPayment', 'Nécessite un abonnement Stripe (Phase 2)')}
                                        </p>
                                    )}

                                    {type.requiresVerification && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {t('accountType.requiresVerification', 'Nécessite une vérification')}
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                    <div className="flex gap-3">
                        {currentType !== 'consumer' && (
                            <button
                                onClick={() => onComplete({ accountType: currentType, skipped: true })}
                                disabled={loading}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {t('accountType.skip', 'Passer')}
                            </button>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (selectedType !== 'consumer' && accountTypes.find(t => t.type === selectedType)?.requiresSubscription)}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? t('accountType.confirming', 'Confirmation...')
                                : t('accountType.confirm', 'Confirmer mon choix')}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                        {t('accountType.changeNote', 'Vous pourrez modifier ce choix plus tard dans vos paramètres')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccountTypeSelector;
