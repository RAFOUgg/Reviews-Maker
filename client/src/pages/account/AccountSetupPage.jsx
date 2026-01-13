import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { CreditCard, FileCheck, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import LiquidCard from '../../components/LiquidCard'
import LiquidButton from '../../components/LiquidButton'

/**
 * AccountSetupPage - Configuration compte payant (Influenceur/Producteur)
 * Gère : 1. Paiement abonnement  2. KYC documents  3. Activation compte
 */
export default function AccountSetupPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useStore()
    const [step, setStep] = useState(1) // 1: payment, 2: kyc, 3: success
    const [kycFiles, setKycFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        // Si compte amateur, rediriger
        if (user?.accountType === 'consumer') {
            navigate('/')
            return
        }

        // Si déjà vérifié, rediriger
        if (user?.subscriptionStatus === 'active' && user?.kycStatus === 'verified') {
            navigate('/')
        }
    }, [isAuthenticated, user, navigate])

    const accountDetails = {
        influencer: {
            name: 'Influenceur',
            price: '15.99€',
            features: [
                'Aperçus détaillés avec drag & drop',
                'Export haute qualité (PNG/JPEG/SVG/PDF 300dpi)',
                'Configuration avancée des rendus',
                'Toutes fonctionnalités Amateur incluses'
            ]
        },
        producer: {
            name: 'Producteur',
            price: '29.99€',
            features: [
                'TOUS les templates (y compris Personnalisé)',
                'Export très haute qualité + CSV/JSON/HTML',
                'PipeLine configurable',
                'Bibliothèque génétique avec arbres',
                'Toutes fonctionnalités Influenceur incluses'
            ]
        }
    }

    const details = accountDetails[user?.accountType] || accountDetails.influencer

    const handlePayment = async () => {
        setError('')
        try {
            // TODO: Intégrer Stripe Checkout
            const response = await fetch('/api/payment/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    accountType: user?.accountType,
                    priceId: user?.accountType === 'producer' ? 'price_producer_monthly' : 'price_influencer_monthly'
                })
            })

            const data = await response.json()

            if (data.url) {
                // Rediriger vers Stripe Checkout
                window.location.href = data.url
            } else {
                setError('Impossible de créer la session de paiement')
            }
        } catch (err) {
            setError(err.message || 'Erreur lors du paiement')
        }
    }

    const handleKycUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setUploading(true)
        setError('')

        try {
            const formData = new FormData()
            files.forEach(file => formData.append('documents', file))

            const response = await fetch('/api/kyc/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Erreur upload')
            }

            setKycFiles([...kycFiles, ...data.files])
            setStep(3)
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'upload')
        } finally {
            setUploading(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-6">
            <LiquidCard className="max-w-2xl w-full">
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent">
                            Configuration compte {details.name}
                        </h1>
                        <p className="text-gray-600">
                            Finalisez votre inscription pour débloquer toutes les fonctionnalités
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="flex items-center justify-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? '' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? ' text-white' : 'bg-gray-300'}`}>
                                {step > 1 ? <CheckCircle2 size={16} /> : '1'}
                            </div>
                            <span className="font-medium">Paiement</span>
                        </div>
                        <div className="w-12 h-1 bg-gray-300"></div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? '' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? ' text-white' : 'bg-gray-300'}`}>
                                {step > 2 ? <CheckCircle2 size={16} /> : '2'}
                            </div>
                            <span className="font-medium">KYC</span>
                        </div>
                        <div className="w-12 h-1 bg-gray-300"></div>
                        <div className={`flex items-center gap-2 ${step >= 3 ? '' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? ' text-white' : 'bg-gray-300'}`}>
                                {step >= 3 ? <CheckCircle2 size={16} /> : '3'}
                            </div>
                            <span className="font-medium">Validation</span>
                        </div>
                    </div>

                    {/* Content */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br rounded-2xl p-6 border-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold">Abonnement {details.name}</h3>
                                    <div className="text-3xl font-black">
                                        {details.price}
                                        <span className="text-sm text-gray-600 font-normal">/mois</span>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {details.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <LiquidButton
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={handlePayment}
                                    icon={CreditCard}
                                >
                                    Procéder au paiement ({details.price}/mois)
                                </LiquidButton>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full text-center text-gray-500 hover:text-gray-700 text-sm transition-colors"
                                >
                                    Annuler et retourner à l'accueil
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="border-2 rounded-xl p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <FileCheck className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold mb-2">Vérification d'identité (KYC)</h3>
                                        <p className="text-sm">
                                            Pour sécuriser la plateforme, nous devons vérifier votre identité.
                                            Veuillez uploader <strong>un document d'identité valide</strong> :
                                        </p>
                                        <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                                            <li>Carte d'identité (recto/verso)</li>
                                            <li>Passeport</li>
                                            <li>Permis de conduire</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="block">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf"
                                        onChange={handleKycUpload}
                                        className="hidden"
                                        id="kyc-upload"
                                    />
                                    <LiquidButton
                                        as="label"
                                        htmlFor="kyc-upload"
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        loading={uploading}
                                        icon={Upload}
                                    >
                                        {uploading ? 'Upload en cours...' : 'Uploader documents'}
                                    </LiquidButton>
                                </label>

                                {kycFiles.length > 0 && (
                                    <div className="text-sm text-green-600 text-center">
                                        ✅ {kycFiles.length} fichier(s) uploadé(s)
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Inscription finalisée !</h3>
                                <p className="text-gray-600">
                                    Vos documents sont en cours de vérification. Vous recevrez un email dès validation.
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Délai habituel : 24-48h ouvrées
                                </p>
                            </div>
                            <LiquidButton
                                variant="primary"
                                size="lg"
                                onClick={() => navigate('/')}
                            >
                                Accéder à la plateforme
                            </LiquidButton>
                        </div>
                    )}
                </div>
            </LiquidCard>
        </div>
    )
}
