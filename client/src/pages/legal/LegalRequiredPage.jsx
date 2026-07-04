import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Home } from 'lucide-react'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'

/**
 * Page affichée si l'utilisateur refuse le consentement RDR (Réduction Des Risques).
 * L'accès au reste de l'application est bloqué tant que le consentement n'est pas donné.
 */
export default function LegalRequiredPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-white/10 backdrop-blur-xl mb-4">
                        <ShieldAlert className="w-10 h-10 text-amber-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Consentement requis
                    </h1>
                    <p className="text-white/50">
                        L'accès à Reviews-Maker nécessite d'accepter le disclaimer de Réduction Des Risques (RDR)
                    </p>
                </div>

                <LiquidCard glow="amber" padding="lg">
                    <p className="text-sm text-white/70 mb-6 text-center">
                        Vous ne pourrez pas accéder au reste de l'application tant que vous n'aurez pas pris connaissance
                        et accepté nos conditions de réduction des risques.
                    </p>

                    <div className="flex flex-col gap-3">
                        <LiquidButton
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={() => navigate('/disclaimer-rdr')}
                        >
                            Consulter et accepter le disclaimer
                        </LiquidButton>

                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                        >
                            <Home size={16} />
                            Retour à l'accueil
                        </button>
                    </div>
                </LiquidCard>
            </div>
        </div>
    )
}
