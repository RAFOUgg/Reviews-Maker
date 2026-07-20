import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LiquidCard, LiquidBadge, LiquidButton } from '@/components/ui/LiquidUI'
import { Building2, Users, ShieldCheck, ShieldAlert, Database, Dna, GitBranch, Settings, Eye, Pencil } from 'lucide-react'
import { companyService } from '../../../services/apiService'
import { useStore } from '../../../store/useStore'

/**
 * Onglet Entreprise de la Bibliothèque.
 *
 * Montre qui compose l'équipe et ce que chacun peut faire des données communes. La gestion des
 * membres (inviter, changer un rôle, révoquer) reste dans la page Compte : ici on informe, on ne
 * duplique pas les commandes.
 */

const ROLE_LABELS = {
    owner: 'Titulaire',
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Lecteur',
}

const ROLE_RIGHTS = {
    owner: 'Accès complet, gère l’équipe et l’abonnement',
    admin: 'Crée et modifie les données, gère les employés',
    editor: 'Crée et modifie les données de l’entreprise',
    viewer: 'Consulte les données sans les modifier',
}

// Ressources devenues des biens de l'entreprise (cf. producerProfileId côté serveur).
const SHARED_RESOURCES = [
    { icon: Database, label: 'Données Récurrentes', tab: 'data', desc: 'Substrats, engrais, matériel, techniques' },
    { icon: Dna, label: 'Arbres Généalogiques', tab: 'cultivars', desc: 'Lignées et génétiques maison' },
    { icon: GitBranch, label: 'Chaîne de production', tab: 'production-chain', desc: 'Traçabilité des transformations' },
]

export default function CompanyTab({ onNavigate }) {
    const { user } = useStore()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        companyService.me()
            .then(d => { if (active) setData(d) })
            .catch(() => { if (active) setData({ company: null }) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    if (loading) {
        return <p className="text-white/40 py-12 text-center">Chargement…</p>
    }

    if (!data?.company) {
        return (
            <LiquidCard glow="amber" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5" />
                    Aucune entreprise
                </h3>
                <p className="text-white/50 text-sm mb-4">
                    Renseignez votre SIRET depuis votre page Compte pour créer votre espace entreprise,
                    puis invitez vos employés. Vos données deviendront alors communes à l’équipe.
                </p>
                <Link to="/account?tab=profile">
                    <LiquidButton variant="secondary" glow="purple">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurer mon entreprise
                    </LiquidButton>
                </Link>
            </LiquidCard>
        )
    }

    const { company, myRole, members } = data
    const activeMembers = members.filter(m => m.status === 'active')
    const pendingMembers = members.filter(m => m.status === 'invited')
    const canWrite = ['owner', 'admin', 'editor'].includes(myRole)

    return (
        <div className="space-y-6">
            <LiquidCard glow="amber" padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            {company.name || 'Entreprise sans nom'}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                            Vous y êtes <span className="text-white/80">{ROLE_LABELS[myRole] || myRole}</span> — {ROLE_RIGHTS[myRole]}
                        </p>
                    </div>
                    {company.isVerified ? (
                        <LiquidBadge variant="success" size="sm">
                            <ShieldCheck className="w-4 h-4 mr-1 inline" />Vérifiée
                        </LiquidBadge>
                    ) : (
                        <LiquidBadge variant="warning" size="sm">
                            <ShieldAlert className="w-4 h-4 mr-1 inline" />Non vérifiée
                        </LiquidBadge>
                    )}
                </div>

                {!canWrite && (
                    <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-sm text-blue-300 flex items-start gap-2">
                            <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            Votre rôle est en lecture seule : vous consultez les données de l’entreprise
                            sans pouvoir les modifier.
                        </p>
                    </div>
                )}
            </LiquidCard>

            {/* Ressources communes */}
            <div>
                <h4 className="text-white font-semibold mb-3">Données partagées avec l’équipe</h4>
                <div className="grid gap-4 md:grid-cols-3">
                    {SHARED_RESOURCES.map(({ icon: Icon, label, tab, desc }) => (
                        <button
                            key={tab}
                            onClick={() => onNavigate?.(tab)}
                            className="text-left p-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="w-4 h-4 text-purple-400" />
                                <span className="text-white font-medium text-sm">{label}</span>
                            </div>
                            <p className="text-white/40 text-xs">{desc}</p>
                        </button>
                    ))}
                </div>
                <p className="text-white/35 text-xs mt-3 flex items-center gap-1.5">
                    {canWrite ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    Tout ce que crée un membre appartient à l’entreprise et reste accessible à l’équipe,
                    même après son départ.
                </p>
            </div>

            {/* Équipe */}
            <LiquidCard glow="cyan" padding="lg">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Équipe ({activeMembers.length + 1})
                </h4>

                <div className="space-y-2">
                    {/* Le titulaire n'a pas de ligne CompanyMember : il est affiché à part. */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.04]">
                        <span className="text-white/80 text-sm">
                            {myRole === 'owner' ? `${user?.username || 'Vous'} (vous)` : 'Titulaire du compte'}
                        </span>
                        <LiquidBadge variant="success" size="sm">{ROLE_LABELS.owner}</LiquidBadge>
                    </div>

                    {activeMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.04]">
                            <div className="min-w-0">
                                <p className="text-white/80 text-sm truncate">
                                    {member.user?.username || member.email}
                                </p>
                                <p className="text-white/35 text-xs">{ROLE_RIGHTS[member.role]}</p>
                            </div>
                            <LiquidBadge variant="default" size="sm">{ROLE_LABELS[member.role]}</LiquidBadge>
                        </div>
                    ))}

                    {pendingMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                            <p className="text-white/50 text-sm truncate">{member.email}</p>
                            <LiquidBadge variant="warning" size="sm">Invitation envoyée</LiquidBadge>
                        </div>
                    ))}
                </div>

                {['owner', 'admin'].includes(myRole) && (
                    <Link to="/account?tab=company">
                        <LiquidButton variant="ghost" className="mt-4">
                            <Settings className="w-4 h-4 mr-2" />
                            Gérer l’équipe
                        </LiquidButton>
                    </Link>
                )}
            </LiquidCard>
        </div>
    )
}
