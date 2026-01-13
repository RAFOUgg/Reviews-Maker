import { useStore } from '../store/useStore';
import { usePermissions } from '../services/permissionsService';
import { useUsageStats } from '../hooks/useUsageStats';
import { Link } from 'react-router-dom';

export default function UsageQuotas({ compact = false }) {
    const user = useStore(state => state.user);
    const permissions = usePermissions(user);
    const { stats, loading } = useUsageStats();

    if (loading || !stats) {
        return compact ? null : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    const quotas = [
        {
            label: 'Reviews privées',
            current: stats.privateReviews,
            max: permissions.features.maxPrivateReviews,
            icon: '📚',
            color: 'blue'
        },
        {
            label: 'Reviews publiques',
            current: stats.publicReviews,
            max: permissions.features.maxPublicReviews,
            icon: '🌐',
            color: 'green'
        },
        {
            label: 'Exports aujourd\'hui',
            current: stats.todayExports,
            max: permissions.features.exportDailyLimit,
            icon: '📤',
            color: 'purple'
        }
    ];

    // Filtrer les quotas illimités si compact
    const displayedQuotas = compact
        ? quotas.filter(q => q.max !== -1)
        : quotas;

    if (displayedQuotas.length === 0 && compact) return null;

    const getProgressColor = (current, max) => {
        if (max === -1) return 'bg-green-500';
        const percent = (current / max) * 100;
        if (percent >= 90) return 'bg-red-500';
        if (percent >= 70) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getTextColor = (color) => {
        const colors = {
            blue: ' dark:',
            green: 'text-green-600 dark:text-green-400',
            purple: ' dark:',
            red: 'text-red-600 dark:text-red-400',
            orange: 'text-orange-600 dark:text-orange-400'
        };
        return colors[color] || colors.blue;
    };

    if (compact) {
        return (
            <div className="space-y-2">
                {displayedQuotas.map((quota, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span>{quota.icon}</span>
                            <span>{quota.label}</span>
                        </span>
                        <span className={`font-semibold ${getTextColor(quota.color)}`}>
                            {quota.current}/{quota.max === -1 ? '∞' : quota.max}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>📊</span>
                    <span>Utilisation</span>
                </h3>
                <Link
                    to="/choose-account"
                    className="text-sm dark: hover:underline font-medium"
                >
                    Voir les plans
                </Link>
            </div>

            <div className="space-y-4">
                {quotas.map((quota, index) => {
                    const isUnlimited = quota.max === -1;
                    const percent = isUnlimited ? 100 : Math.min(100, (quota.current / quota.max) * 100);
                    const isNearLimit = !isUnlimited && percent >= 70;

                    return (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <span>{quota.icon}</span>
                                    <span>{quota.label}</span>
                                </span>
                                <span className={`text-sm font-bold ${getTextColor(quota.color)}`}>
                                    {quota.current} / {isUnlimited ? '∞' : quota.max}
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${getProgressColor(quota.current, quota.max)}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>

                            {isNearLimit && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                    ⚠️ Vous approchez de la limite
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Upgrade suggestion si limitations */}
            {permissions.accountType === 'consumer' && (
                <div className="mt-6 p-4 bg-gradient-to-r dark:/20 dark:/20 rounded-lg border dark:">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong className="dark:">✨ Passez à un compte premium</strong> pour des quotas illimités et plus de fonctionnalités !
                    </p>
                    <Link
                        to="/choose-account"
                        className="inline-flex items-center gap-2 text-sm dark: font-semibold hover:underline"
                    >
                        <span>Découvrir les plans</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}
