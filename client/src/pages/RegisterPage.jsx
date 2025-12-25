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

const OAuthButton = ({ provider, logo, color, href }) => {
    return (
        <a
            href={href}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg ${color}`}
        >
            {logo}
            <span>Continuer avec {provider}</span>
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
        {
            name: 'Discord',
            logo: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
            ),
            color: 'bg-[#5865F2] hover:bg-[#4752C4] text-white',
            href: `/api/auth/discord?accountType=${accountType}`
        },
        {
            name: 'Google',
            logo: (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
            ),
            color: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300',
            href: `/api/auth/google?accountType=${accountType}`
        }
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
