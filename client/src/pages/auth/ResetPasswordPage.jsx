import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { LiquidCard, LiquidButton, LiquidInput } from '@/components/ui/LiquidUI';
import { Lock, ShieldCheck, ArrowLeft, Check, AlertTriangle } from 'lucide-react';

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
        if (password.length === 0) return { strength: 0, label: '', color: 'bg-white/10' };
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
            console.error('Reset password error:', error);
            setApiError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] px-4">
                <div className="max-w-md w-full">
                    <LiquidCard glow="green" padding="lg">
                        {/* Success Icon */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-4">
                                <Check className="w-10 h-10 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Mot de passe réinitialisé !
                            </h1>
                            <p className="text-white/60">
                                Votre mot de passe a été modifié avec succès
                            </p>
                        </div>

                        {/* Login Button */}
                        <LiquidButton
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={() => navigate('/login')}
                        >
                            Se connecter
                        </LiquidButton>
                    </LiquidCard>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl mb-4">
                        <ShieldCheck className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Nouveau mot de passe
                    </h1>
                    <p className="text-white/50">
                        Choisissez un mot de passe sécurisé
                    </p>
                </div>

                <LiquidCard glow="purple" padding="lg">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <LiquidInput
                                label="Nouveau mot de passe"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                icon={Lock}
                                error={errors.password}
                                required
                            />

                            {/* Password Strength */}
                            {formData.password && (
                                <div className="mt-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-white/60">
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40">
                                        Minimum 8 caractères. Utilisez des majuscules, chiffres et symboles.
                                    </p>
                                </div>
                            )}
                        </div>

                        <LiquidInput
                            label="Confirmer le mot de passe"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            icon={Lock}
                            error={errors.confirmPassword}
                            required
                        />

                        {/* API Error */}
                        {apiError && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <span className="text-red-400 text-sm">{apiError}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <LiquidButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </LiquidButton>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Retour à la connexion
                        </button>
                    </div>
                </LiquidCard>
            </div>
        </div>
    );
}
