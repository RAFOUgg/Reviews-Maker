import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI';
import { Mail, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

export default function EmailVerificationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const type = searchParams.get('type') || 'login'; // login | register

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(5);
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        // Cooldown timer for resend
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCooldown]);

    const handleCodeChange = (index, value) => {
        // Only allow alphanumeric
        const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (sanitized.length > 1) return;

        const newCode = [...code];
        newCode[index] = sanitized;
        setCode(newCode);
        setError('');

        // Auto-focus next input
        if (sanitized && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits filled
        if (index === 5 && sanitized && newCode.every(c => c)) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const newCode = pastedData.slice(0, 6).split('');
        while (newCode.length < 6) newCode.push('');
        setCode(newCode);

        if (newCode.every(c => c)) {
            handleVerify(newCode.join(''));
        }
    };

    const handleVerify = async (codeString = code.join('')) => {
        if (codeString.length !== 6) {
            setError('Veuillez entrer les 6 caractères');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    code: codeString,
                    type
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'code_expired') {
                    setError('Code expiré. Veuillez demander un nouveau code.');
                } else if (data.error === 'too_many_attempts') {
                    setError('Trop de tentatives. Un nouveau code a été envoyé.');
                    setResendCooldown(60);
                    setCanResend(false);
                } else if (data.error === 'invalid_code') {
                    setError(`Code incorrect. ${data.attemptsLeft || 0} tentatives restantes.`);
                    setAttemptsLeft(data.attemptsLeft || 0);
                } else {
                    setError(data.message || 'Erreur lors de la vérification');
                }
                return;
            }

            // Success - redirect based on type
            if (type === 'login') {
                navigate('/'); // Home page après connexion
            } else {
                navigate('/welcome'); // Page de bienvenue après inscription
            }
        } catch (error) {
            console.error('Verify error:', error);
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, type })
            });

            if (!response.ok) {
                setError('Erreur lors de l\'envoi du code');
                return;
            }

            // Reset state
            setCode(['', '', '', '', '', '']);
            setAttemptsLeft(5);
            setResendCooldown(60);
            setCanResend(false);
            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error('Resend error:', error);
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl mb-4">
                        <Mail className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Vérification Email
                    </h1>
                    <p className="text-white/50">
                        Nous avons envoyé un code à
                    </p>
                    <p className="text-purple-400 font-semibold mt-1">
                        {email}
                    </p>
                </div>

                <LiquidCard glow="purple" padding="lg">
                    {/* Code Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white/60 mb-4 text-center">
                            Entrez le code à 6 caractères
                        </label>
                        <div className="flex gap-2 justify-center">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all"
                                    disabled={isLoading}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-white/40 text-center mt-3">
                            Tentatives restantes: <span className="text-purple-400">{attemptsLeft}/5</span>
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <span className="text-red-400 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Verify Button */}
                    <LiquidButton
                        onClick={() => handleVerify()}
                        disabled={isLoading || code.some(c => !c)}
                        variant="primary"
                        size="lg"
                        loading={isLoading}
                        className="w-full mb-6"
                    >
                        {isLoading ? 'Vérification...' : 'Vérifier'}
                    </LiquidButton>

                    {/* Resend */}
                    <div className="text-center border-t border-white/10 pt-6">
                        <p className="text-sm text-white/50 mb-3">
                            Vous n'avez pas reçu le code ?
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={!canResend || isLoading}
                            className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${canResend
                                    ? 'text-purple-400 hover:text-purple-300'
                                    : 'text-white/30 cursor-not-allowed'
                                }`}
                        >
                            <RefreshCw size={16} className={isLoading && canResend ? 'animate-spin' : ''} />
                            {canResend
                                ? 'Renvoyer le code'
                                : `Renvoyer dans ${resendCooldown}s`}
                        </button>
                    </div>

                    {/* Back to login */}
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
