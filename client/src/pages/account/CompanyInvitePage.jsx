import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import { Building2, Check } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { companyService } from '../../services/apiService'

/**
 * Page d'acceptation d'une invitation d'entreprise (/company/invite/:token).
 *
 * Le détail de l'invitation est consultable sans être connecté (pour savoir qui invite avant de
 * créer un compte) ; l'acceptation elle-même exige une session.
 */

const ROLE_LABELS = {
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Lecteur',
}

const ROLE_DESCRIPTIONS = {
    admin: 'Vous pourrez gérer les données et les membres de l’entreprise.',
    editor: 'Vous pourrez créer et modifier les données de l’entreprise.',
    viewer: 'Vous pourrez consulter les données de l’entreprise.',
}

export default function CompanyInvitePage() {
    const { token } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated, checkAuth } = useStore()

    const [invite, setInvite] = useState(null)
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        companyService.getInvite(token)
            .then(data => { if (active) setInvite(data) })
            .catch(() => {
                if (active) setError("Cette invitation est introuvable, expirée ou déjà utilisée.")
            })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [token])

    const handleAccept = async () => {
        setAccepting(true)
        setError('')
        try {
            await companyService.acceptInvite(token)
            await checkAuth()
            navigate('/account?tab=company')
        } catch (err) {
            setError(err.message || "L'acceptation a échoué.")
        } finally {
            setAccepting(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <LiquidCard glow="purple" padding="lg" className="max-w-lg w-full">
                {loading ? (
                    <p className="text-white/50 text-center py-8">Chargement de l’invitation…</p>
                ) : error && !invite ? (
                    <>
                        <h1 className="text-xl font-bold text-white mb-2">Invitation invalide</h1>
                        <p className="text-white/60 mb-6">{error}</p>
                        <LiquidButton onClick={() => navigate('/')} fullWidth>Retour à l’accueil</LiquidButton>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <Building2 className="w-8 h-8 text-purple-400" />
                            <div>
                                <h1 className="text-xl font-bold text-white">{invite.companyName}</h1>
                                <p className="text-sm text-white/50">vous invite à rejoindre son espace</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-white/10 bg-white/5 mb-6">
                            <p className="text-white font-medium mb-1">
                                Rôle proposé : {ROLE_LABELS[invite.role] || invite.role}
                            </p>
                            <p className="text-sm text-white/50">{ROLE_DESCRIPTIONS[invite.role]}</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {isAuthenticated ? (
                            <>
                                <LiquidButton onClick={handleAccept} disabled={accepting} glow="green" fullWidth size="lg">
                                    <Check className="w-5 h-5 mr-2" />
                                    {accepting ? 'Acceptation…' : `Rejoindre en tant que ${ROLE_LABELS[invite.role]}`}
                                </LiquidButton>
                                <p className="text-xs text-white/40 text-center mt-3">
                                    Connecté en tant que {user?.username || user?.email}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-white/60 mb-4">
                                    Connectez-vous ou créez un compte avec l’adresse <strong>{invite.email}</strong> pour
                                    accepter cette invitation.
                                </p>
                                <div className="flex gap-3">
                                    <LiquidButton
                                        onClick={() => navigate(`/login?next=/company/invite/${token}`)}
                                        fullWidth
                                    >
                                        Se connecter
                                    </LiquidButton>
                                    <LiquidButton
                                        variant="ghost"
                                        onClick={() => navigate(`/register?next=/company/invite/${token}`)}
                                        fullWidth
                                    >
                                        Créer un compte
                                    </LiquidButton>
                                </div>
                            </>
                        )}
                    </>
                )}
            </LiquidCard>
        </div>
    )
}
