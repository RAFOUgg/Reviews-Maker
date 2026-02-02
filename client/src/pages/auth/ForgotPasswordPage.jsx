import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { LiquidCard, LiquidButton, LiquidInput } from '@/components/ui/LiquidUI';
import { Mail, KeyRound, ArrowLeft, Check, AlertTriangle, Clock } from 'lucide-react';

const emailSchema = z.object({
    email: z.string().email('Email invalide')
});

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation Zod
        const result = emailSchema.safeParse({ email });
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur lors de l\'envoi');
                return;
            }

            setSuccess(true);
        } catch (error) {
            console.error('Forgot password error:', error);
            setError('Erreur de connexion au serveur');
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
                                Email envoyé !
                            </h1>
                            <p className="text-white/60">
                                Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-200">
                                <strong>Note :</strong> Le lien de réinitialisation expire dans 1 heure.
                            </p>
                        </div>

                        {/* Back to Login */}
                        <LiquidButton
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={() => navigate('/login')}
                        >
                            Retour à la connexion
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
                        <KeyRound className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Mot de passe oublié ?
                    </h1>
                    <p className="text-white/50">
                        Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                </div>

                <LiquidCard glow="purple" padding="lg">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <LiquidInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="votre@email.com"
                            icon={Mail}
                            error={error}
                            required
                        />

                        {/* Submit Button */}
                        <LiquidButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Envoi...' : 'Envoyer le lien'}
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
