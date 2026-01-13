import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { usePermissions, ACCOUNT_FEATURES } from '../services/permissionsService';

export default function UpgradePrompt({ feature, message, inline = false }) {
    const user = useStore(state => state.user);
    const permissions = usePermissions(user);

    if (!message) {
        message = permissions.needsUpgradeFor(feature);
    }

    const suggestedPlans = feature === 'pipelineCulture' || feature === 'geneticsSystem'
        ? ['producer']
        : ['influencer', 'producer'];

    if (inline) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-300 dark:border-yellow-700 rounded-full text-sm">
                <span className="text-yellow-800 dark:text-yellow-200">🔒 {message}</span>
                <Link
                    to="/settings/subscription"
                    className="text-yellow-900 dark:text-yellow-100 font-semibold hover:underline"
                >
                    Upgrade
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br dark:/20 dark:/20 border-2 dark: rounded-2xl p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Fonctionnalité Premium
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {message}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {suggestedPlans.map(planType => {
                            const plan = ACCOUNT_FEATURES[planType];
                            return (
                                <Link
                                    key={planType}
                                    to={`/settings/subscription?upgrade=${planType}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
                                >
                                    <span>Passer à {plan.name}</span>
                                    <span className="text-sm opacity-90">{plan.price}€/mois</span>
                                </Link>
                            );
                        })}

                        <Link
                            to="/choose-account"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        >
                            <span>Comparer les plans</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

