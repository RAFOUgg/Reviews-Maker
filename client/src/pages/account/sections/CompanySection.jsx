import { useEffect, useState } from 'react'
import { LiquidCard, LiquidButton, LiquidInput, LiquidSelect, LiquidBadge } from '@/components/ui/LiquidUI'
import { Building2, UserPlus, Trash2, ShieldCheck, ShieldAlert, LogOut } from 'lucide-react'
import { companyService } from '../../../services/apiService'
import { useToast } from '../../../components/shared/ToastContainer'

/**
 * Gestion des sous-comptes employés d'une entreprise.
 *
 * Les droits affichés viennent du serveur (`canManageMembers`, `myRole`) : l'UI ne fait que refléter
 * ce que l'API autorise déjà, elle n'est pas la barrière de sécurité.
 */

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Administrateur — gère les membres et les données' },
    { value: 'editor', label: 'Éditeur — crée et modifie les données' },
    { value: 'viewer', label: 'Lecteur — consultation seule' },
]

const ROLE_LABELS = {
    owner: 'Titulaire',
    admin: 'Administrateur',
    editor: 'Éditeur',
    viewer: 'Lecteur',
}

const STATUS_BADGES = {
    invited: { variant: 'warning', label: 'Invitation envoyée' },
    active: { variant: 'success', label: 'Actif' },
}

export default function CompanySection() {
    const toast = useToast()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('viewer')
    const [inviting, setInviting] = useState(false)

    const load = async () => {
        try {
            setData(await companyService.me())
        } catch (err) {
            toast.error(err.message || "Impossible de charger l'entreprise")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!inviteEmail.trim()) return

        setInviting(true)
        try {
            await companyService.invite(inviteEmail.trim(), inviteRole)
            toast.success(`Invitation envoyée à ${inviteEmail.trim()}`)
            setInviteEmail('')
            await load()
        } catch (err) {
            toast.error(err.message || "L'invitation a échoué")
        } finally {
            setInviting(false)
        }
    }

    const handleRoleChange = async (memberId, role) => {
        try {
            await companyService.updateMember(memberId, role)
            await load()
        } catch (err) {
            toast.error(err.message || 'Modification du rôle impossible')
        }
    }

    const handleRevoke = async (memberId, email) => {
        if (!window.confirm(`Révoquer l'accès de ${email} ?`)) return
        try {
            await companyService.removeMember(memberId)
            toast.success('Accès révoqué')
            await load()
        } catch (err) {
            toast.error(err.message || 'Révocation impossible')
        }
    }

    const handleLeave = async () => {
        if (!window.confirm('Quitter cette entreprise ? Vous perdrez l’accès à ses données.')) return
        try {
            await companyService.leave()
            toast.success('Vous avez quitté l’entreprise')
            await load()
        } catch (err) {
            toast.error(err.message || 'Impossible de quitter l’entreprise')
        }
    }

    if (loading) {
        return <p className="text-white/50 py-8 text-center">Chargement…</p>
    }

    // Pas de ProducerProfile et aucune appartenance : l'utilisateur n'a pas d'espace entreprise.
    if (!data?.company) {
        return (
            <LiquidCard glow="amber" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5" />
                    Entreprise
                </h3>
                <p className="text-white/50 text-sm">
                    Aucune entreprise associée à votre compte. Renseignez votre SIRET depuis l’onglet
                    Profil pour créer votre espace entreprise et inviter des employés.
                </p>
            </LiquidCard>
        )
    }

    const { company, myRole, canManageMembers, members } = data

    return (
        <div className="space-y-6">
            <LiquidCard glow="amber" padding="lg">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            {company.name || 'Entreprise sans nom'}
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                            Votre rôle : <span className="text-white/80">{ROLE_LABELS[myRole] || myRole}</span>
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

                {!company.isVerified && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-sm text-amber-300">
                            La vérification SIRET/KYC de votre entreprise est requise pour publier
                            publiquement vos reviews. Vos outils restent accessibles entre-temps.
                        </p>
                    </div>
                )}
            </LiquidCard>

            {canManageMembers && (
                <LiquidCard glow="purple" padding="lg">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <UserPlus className="w-5 h-5" />
                        Inviter un employé
                    </h3>
                    <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-[1fr_auto]">
                        <div className="space-y-3">
                            <LiquidInput
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="email@entreprise.fr"
                            />
                            <LiquidSelect
                                value={inviteRole}
                                onChange={setInviteRole}
                                options={
                                    // Seul le titulaire peut créer des administrateurs (règle appliquée
                                    // côté serveur, reflétée ici).
                                    myRole === 'owner' ? ROLE_OPTIONS : ROLE_OPTIONS.filter(o => o.value !== 'admin')
                                }
                            />
                        </div>
                        <LiquidButton type="submit" glow="green" disabled={inviting || !inviteEmail.trim()}>
                            {inviting ? 'Envoi…' : 'Inviter'}
                        </LiquidButton>
                    </form>
                </LiquidCard>
            )}

            <LiquidCard glow="cyan" padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Membres ({members.length})
                </h3>

                {members.length === 0 ? (
                    <p className="text-white/50 text-sm">Aucun employé pour l’instant.</p>
                ) : (
                    <div className="space-y-3">
                        {members.map(member => (
                            <div
                                key={member.id}
                                className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5"
                            >
                                <div className="flex-1 min-w-[12rem]">
                                    <p className="text-white font-medium">
                                        {member.user?.username || member.email}
                                    </p>
                                    {member.user?.username && (
                                        <p className="text-xs text-white/40">{member.email}</p>
                                    )}
                                </div>

                                <LiquidBadge
                                    variant={STATUS_BADGES[member.status]?.variant || 'default'}
                                    size="sm"
                                >
                                    {STATUS_BADGES[member.status]?.label || member.status}
                                </LiquidBadge>

                                {canManageMembers ? (
                                    <div className="w-48">
                                        <LiquidSelect
                                            value={member.role}
                                            onChange={(role) => handleRoleChange(member.id, role)}
                                            options={
                                                myRole === 'owner'
                                                    ? ROLE_OPTIONS
                                                    : ROLE_OPTIONS.filter(o => o.value !== 'admin')
                                            }
                                        />
                                    </div>
                                ) : (
                                    <span className="text-sm text-white/60">{ROLE_LABELS[member.role]}</span>
                                )}

                                {canManageMembers && (
                                    <button
                                        onClick={() => handleRevoke(member.id, member.email)}
                                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Révoquer l'accès"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </LiquidCard>

            {myRole !== 'owner' && (
                <LiquidButton variant="ghost" onClick={handleLeave} className="text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Quitter cette entreprise
                </LiquidButton>
            )}
        </div>
    )
}
