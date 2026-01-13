import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const passwordSchema = z.object({
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
});

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            navigate('/login');
        }
    }, [token, email, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        setApiError('');
    };

    const getPasswordStrength = (password) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 8) return { strength: 1, label: 'Faible', color: 'bg-red-500' };

        let strength = 1;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength >= 4) return { strength: 3, label: 'Fort', color: 'bg-green-500' };
        if (strength >= 2) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
        return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');

        // Validation Zod
        const result = passwordSchema.safeParse(formData);
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
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    token,
                    email,
                    newPassword: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'invalid_token') {
                    setApiError('Lien invalide ou expiré');
                } else if (data.error === 'token_expired') {
                    setApiError('Le lien a expiré. Demandez un nouveau lien.');
                } else {
                    setApiError(data.message || 'Erreur lors de la réinitialisation');
                }
                return;
            }

            setSuccess(true);
        } catch (error) {
            setApiError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 dark:from-gray-900 dark:to-gray-800 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    {/* Success Icon */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                            <svg
                                className="w-8 h-8 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Mot de passe réinitialisé !
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Votre mot de passe a été modifié avec succès
                        </p>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                        <svg
                            className="w-8 h-8 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Nouveau mot de passe
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Choisissez un mot de passe sécurisé
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500' } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}

                        {/* Password Strength */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                            style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Minimum 8 caractères. Utilisez des majuscules, chiffres et symboles.
                                </p>
                            </div>
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
                            className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500' } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
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
                        {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        ← Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}
