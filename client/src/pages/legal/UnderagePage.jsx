import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldOff, Home } from 'lucide-react'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'

/**
 * Page affichée si l'utilisateur ne remplit pas l'âge légal minimum requis.
 * Bloque définitivement l'accès au reste de l'application pour ce compte.
 */
export default function UnderagePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const message = searchParams.get('message')

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10 backdrop-blur-xl mb-4">
                        <ShieldOff className="w-10 h-10 text-red-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Accès non autorisé
                    </h1>
                    <p className="text-white/50">
                        {message || "Vous n'avez pas l'âge légal requis pour accéder à Reviews-Maker"}
                    </p>
                </div>

                <LiquidCard glow="default" padding="lg">
                    <p className="text-sm text-white/70 mb-6 text-center">
                        Cette plateforme est strictement réservée aux personnes majeures selon la législation de leur
                        pays de résidence. L'accès reste bloqué pour ce compte.
                    </p>

                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors w-full"
                    >
                        <Home size={16} />
                        Retour à l'accueil
                    </button>
                </LiquidCard>
            </div>
        </div>
    )
}
