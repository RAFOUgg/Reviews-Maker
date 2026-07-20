import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import { Building2, Check, X, Clock, ShieldAlert } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { companyService } from '../../services/apiService'

/**
 * Page de décision sur une invitation d'entreprise (/company/invite/:token).
 *
 * Le rattachement exige une double validation : le titulaire confirme sa demande et la personne
 * invitée l'accepte. Le même écran sert aux deux — le jeton présenté détermine qui se prononce,
 * le serveur renvoie `party`. Le lien e-mail peut porter `?decision=accept|refuse` pour
 * pré-sélectionner le choix ; on demande malgré tout une confirmation explicite à l'écran plutôt
 * que d'agir sur un simple clic dans un e-mail.
 */

const ROLE_LABELS = { admin: 'Administrateur', editor: 'Éditeur', viewer: 'Lecteur' }

const ROLE_DESCRIPTIONS = {
    admin: 'Gérer les données et les membres de l’entreprise.',
    editor: 'Créer et modifier les données de l’entreprise.',
    viewer: 'Consulter les données de l’entreprise, sans les modifier.',
}

export default function CompanyInvitePage() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user, isAuthenticated, checkAuth } = useStore()

    const [invite, setInvite] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const suggested = searchParams.get('decision') // 'accept' | 'refuse' depuis l'e-mail

    useEffect(() => {
        let active = true
        companyService.getInvite(token)
            .then(data => { if (active) setInvite(data) })
            .catch(() => {
                if (active) setError('Cette invitation est introuvable, expirée ou déjà traitée.')
            })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [token])

    const decide = async (decision) => {
        setSubmitting(true)
        setError('')
        try {
            const res = await companyService.decideInvite(token, decision)
            setResult(res)
            // Le tier effectif change dès que le rattachement est effectif.
            if (res.linked) await checkAuth()
        } catch (err) {
            // Les codes du serveur sont techniques et en anglais : on les traduit en explication
            // utilisable, plutôt que d'afficher « You do not have permission to access this resource ».
            const messages = {
                forbidden: `Vous ne pouvez pas accepter cette invitation depuis ce compte. Elle est destinée à ${invite.email}.`,
                not_found: 'Cette invitation n’est plus valide : elle a expiré ou a déjà été traitée.',
                authentication_required: 'Connectez-vous avec le compte invité pour accepter.',
            }
            setError(messages[err.code] || err.message || 'La décision n’a pas pu être enregistrée.')
        } finally {
            setSubmitting(false)
        }
    }

    const card = (children) => (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <LiquidCard glow="purple" padding="lg" className="max-w-lg w-full">{children}</LiquidCard>
        </div>
    )

    if (loading) return card(<p className="text-white/50 text-center py-8">Chargement de l’invitation…</p>)

    if (error && !invite) {
        return card(
            <>
                <h1 className="text-xl font-bold text-white mb-2">Invitation invalide</h1>
                <p className="text-white/60 mb-6">{error}</p>
                <LiquidButton onClick={() => navigate('/')} fullWidth>Retour à l’accueil</LiquidButton>
            </>
        )
    }

    // Écran de confirmation après décision.
    if (result) {
        const refused = result.myDecision === 'refused'
        return card(
            <>
                <div className="flex items-center gap-3 mb-4">
                    {refused
                        ? <X className="w-8 h-8 text-red-400" />
                        : result.linked ? <Check className="w-8 h-8 text-green-400" /> : <Clock className="w-8 h-8 text-amber-400" />}
                    <h1 className="text-xl font-bold text-white">
                        {refused ? 'Demande refusée' : result.linked ? 'Rattachement effectif' : 'Décision enregistrée'}
                    </h1>
                </div>
                <p className="text-white/60 mb-6">
                    {refused
                        ? 'La demande est close. Aucun accès n’a été accordé.'
                        : result.linked
                            ? `Le compte fait désormais partie de ${invite.companyName}, avec le rôle ${ROLE_LABELS[result.role] || result.role}.`
                            : 'Votre accord est enregistré. Le rattachement prendra effet dès que l’autre partie aura accepté à son tour.'}
                </p>
                <LiquidButton
                    onClick={() => navigate(result.linked ? '/library?tab=company' : '/account')}
                    glow={result.linked ? 'green' : undefined}
                    fullWidth
                >
                    {result.linked ? 'Voir l’espace entreprise' : 'Retour à mon compte'}
                </LiquidButton>
            </>
        )
    }

    const isOwner = invite.party === 'owner'
    const alreadyDecided = Boolean(invite.myDecision)

    // Le titulaire a ouvert le lien destiné à son employé : on l'explique au lieu de le laisser
    // buter sur un refus du serveur.
    if (invite.blockedReason === 'owner_cannot_be_employee') {
        return card(
            <>
                <div className="flex items-center gap-3 mb-4">
                    <ShieldAlert className="w-8 h-8 text-amber-400" />
                    <h1 className="text-xl font-bold text-white">Ce lien n’est pas pour vous</h1>
                </div>
                <p className="text-white/60 mb-4">
                    Vous êtes le titulaire de <strong>{invite.companyName}</strong> : vous ne pouvez pas
                    être votre propre employé. Ce lien est destiné à <strong>{invite.email}</strong>,
                    qui doit l’ouvrir depuis son propre compte.
                </p>
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] mb-6">
                    <p className="text-xs text-white/50">
                        Votre part de la validation se fait avec l’autre lien, celui reçu à votre
                        adresse — {invite.otherDecision === 'accepted'
                            ? 'et vous l’avez déjà acceptée.'
                            : 'intitulé « Confirmez l’ajout de… ».'}
                    </p>
                </div>
                <LiquidButton onClick={() => navigate('/account?tab=company')} fullWidth>
                    Retour à la gestion de l’équipe
                </LiquidButton>
            </>
        )
    }

    // L'invité doit être connecté : accepter rattache son compte à l'entreprise.
    if (invite.requiresLogin && !isAuthenticated) {
        return card(
            <>
                <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-xl font-bold text-white">{invite.companyName}</h1>
                        <p className="text-sm text-white/50">vous invite à rejoindre son espace</p>
                    </div>
                </div>
                <p className="text-sm text-white/60 mb-4">
                    Connectez-vous ou créez un compte avec l’adresse <strong>{invite.email}</strong> pour
                    répondre à cette invitation.
                </p>
                <div className="flex gap-3">
                    <LiquidButton onClick={() => navigate(`/login?next=/company/invite/${token}`)} fullWidth>
                        Se connecter
                    </LiquidButton>
                    <LiquidButton variant="ghost" onClick={() => navigate(`/register?next=/company/invite/${token}`)} fullWidth>
                        Créer un compte
                    </LiquidButton>
                </div>
            </>
        )
    }

    return card(
        <>
            <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-purple-400" />
                <div>
                    <h1 className="text-xl font-bold text-white">{invite.companyName}</h1>
                    <p className="text-sm text-white/50">
                        {isOwner ? 'Confirmation d’ajout d’un membre' : 'vous invite à rejoindre son espace'}
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-white/5 mb-4">
                {isOwner && (
                    <p className="text-white/80 text-sm mb-2">
                        Personne invitée : <strong>{invite.email}</strong>
                    </p>
                )}
                <p className="text-white font-medium mb-1">
                    Rôle : {ROLE_LABELS[invite.role] || invite.role}
                </p>
                <p className="text-sm text-white/50">{ROLE_DESCRIPTIONS[invite.role]}</p>
            </div>

            {/* Rappel du principe : sans les deux accords, rien ne se passe. */}
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] mb-4">
                <p className="text-xs text-white/50 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    Le rattachement nécessite l’accord des deux parties.
                    {invite.otherDecision === 'accepted' && ' L’autre partie a déjà accepté.'}
                    {!invite.otherDecision && ' L’autre partie ne s’est pas encore prononcée.'}
                </p>
            </div>

            {isOwner && (
                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 mb-4">
                    <p className="text-xs text-amber-300 flex items-start gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        Vous n’êtes pas à l’origine de cette demande ? Refusez-la et changez votre mot de passe.
                    </p>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {alreadyDecided ? (
                <p className="text-sm text-white/50 text-center py-2">
                    Vous avez déjà répondu à cette demande
                    ({invite.myDecision === 'accepted' ? 'accepté' : 'refusé'}).
                </p>
            ) : (
                <div className="flex gap-3">
                    <LiquidButton
                        variant="ghost"
                        onClick={() => decide('refuse')}
                        disabled={submitting}
                        className={suggested === 'refuse' ? 'ring-1 ring-red-400/40' : ''}
                        fullWidth
                    >
                        <X className="w-4 h-4 mr-2" />
                        Refuser
                    </LiquidButton>
                    <LiquidButton
                        glow="green"
                        onClick={() => decide('accept')}
                        disabled={submitting}
                        className={suggested === 'accept' ? 'ring-1 ring-green-400/40' : ''}
                        fullWidth
                    >
                        <Check className="w-4 h-4 mr-2" />
                        {submitting ? 'Enregistrement…' : 'Accepter'}
                    </LiquidButton>
                </div>
            )}

            {!isOwner && isAuthenticated && (
                <p className="text-xs text-white/40 text-center mt-3">
                    Connecté en tant que {user?.username || user?.email}
                </p>
            )}
        </>
    )
}
