import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const registerSchema = z.object({
    email: z.string().email('Email invalide'),
    pseudo: z.string().min(3, 'Minimum 3 caractères').max(30, 'Maximum 30 caractères'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
});

const OAuthButton = ({ provider, icon, color, href }) => {
    return (
        <a
            href={href}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${color}`}
        >
            {icon && <span className="text-xl">{icon}</span>}
            <span>{provider}</span>
        </a>
    );
};

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const accountType = searchParams.get('type') || 'consumer'; // consumer, influencer, producer
    const isPaid = searchParams.get('paid') === 'true';

    const [formData, setFormData] = useState({
        email: '',
        pseudo: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // Rediriger vers choix de compte si pas de type sélectionné
    useEffect(() => {
        if (!accountType || !['consumer', 'influencer', 'producer'].includes(accountType)) {
            navigate('/choose-account');
        }
    }, [accountType, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');

        // Validation Zod
        const result = registerSchema.safeParse(formData);
        if (!result.success) {
            const zodErrors = {};
            result.error.errors.forEach((err) => {
                zodErrors[err.path[0]] = err.message;
            });
            setErrors(zodErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/email/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    pseudo: formData.pseudo,
                    password: formData.password,
                    accountType: accountType // Envoyer le type de compte
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'email_taken') {
                    setApiError('Cet email est déjà utilisé');
                } else if (data.error === 'pseudo_taken') {
                    setApiError('Ce pseudo est déjà pris');
                } else {
                    setApiError(data.message || 'Erreur lors de l\'inscription');
                }
                return;
            }

            // Rediriger vers la vérification email
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&type=register`);
        } catch (error) {
            console.error('Register error:', error);
            setApiError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    const oauthProviders = [
        { name: 'Google', icon: '🔍', color: 'bg-white text-gray-700 border border-gray-300', href: `/api/auth/google?accountType=${accountType}` },
        { name: 'Discord', icon: '💬', color: 'bg-indigo-600 text-white', href: `/api/auth/discord?accountType=${accountType}` },
        { name: 'Apple', icon: '🍎', color: 'bg-black text-white', href: `/api/auth/apple?accountType=${accountType}` },
        { name: 'Amazon', icon: '📦', color: 'bg-orange-500 text-white', href: `/api/auth/amazon?accountType=${accountType}` },
        { name: 'Facebook', icon: '👥', color: 'bg-blue-600 text-white', href: `/api/auth/facebook?accountType=${accountType}` }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        to="/choose-account"
                        className="inline-flex items-center text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour au choix de compte
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Créer un compte {accountType === 'influencer' ? 'Influenceur' : accountType === 'producer' ? 'Producteur' : 'Amateur'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isPaid && 'Paiement validé ! '} Rejoignez la communauté Reviews Maker
                    </p>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3 mb-6">
                    {oauthProviders.map((provider) => (
                        <OAuthButton key={provider.name} {...provider} />
                    ))}
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                            Ou avec votre email
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.email
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                                } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                            placeholder="votre@email.com"
                            required
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Pseudo */}
                    <div>
                        <label htmlFor="pseudo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pseudo
                        </label>
                        <input
                            type="text"
                            id="pseudo"
                            name="pseudo"
                            value={formData.pseudo}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.pseudo
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                                } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                            placeholder="MonPseudo"
                            required
                        />
                        {errors.pseudo && (
                            <p className="mt-1 text-sm text-red-500">{errors.pseudo}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.password
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                                } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                                } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                    >
                        {isLoading ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vous avez déjà un compte ?{' '}
                        <Link
                            to="/login"
                            className="text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
                        >
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
