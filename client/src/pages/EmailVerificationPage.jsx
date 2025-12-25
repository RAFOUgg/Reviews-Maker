import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
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
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Vérification Email
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Nous avons envoyé un code à <br />
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {email}
                        </span>
                    </p>
                </div>

                {/* Code Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
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
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-all"
                                disabled={isLoading}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Tentatives restantes: {attemptsLeft}/5
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                    </div>
                )}

                {/* Verify Button */}
                <button
                    onClick={() => handleVerify()}
                    disabled={isLoading || code.some(c => !c)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200 mb-4"
                >
                    {isLoading ? 'Vérification...' : 'Vérifier'}
                </button>

                {/* Resend */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Vous n'avez pas reçu le code ?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={!canResend || isLoading}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 disabled:text-gray-400 font-medium text-sm"
                    >
                        {canResend
                            ? 'Renvoyer le code'
                            : `Renvoyer dans ${resendCooldown}s`}
                    </button>
                </div>

                {/* Back to login */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        ← Retour à la connexion
                    </button>
                </div>
            </div>
        </div>
    );
}
