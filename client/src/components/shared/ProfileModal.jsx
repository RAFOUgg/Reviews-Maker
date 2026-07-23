import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiquidModal } from '@/components/ui/LiquidUI'
import { Calendar, FileText, ChevronRight } from 'lucide-react'
import useProfileModalStore from '../../store/useProfileModalStore'
import { usersService } from '../../services/apiService'
import TrustBadge from './TrustBadge'

// Nombre de reviews récentes affichées dans la carte — pas de pagination ici, juste un aperçu
// (il n'existe pas de route de galerie filtrée par auteur à ce jour, cf. GalleryPage.jsx).
const RECENT_REVIEWS_LIMIT = 5

function formatMemberSince(iso) {
    if (!iso) return null
    try {
        return new Date(iso).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    } catch {
        return null
    }
}

/**
 * Carte de profil ouverte par n'importe quel <UserMention> de l'app — montée UNE SEULE FOIS
 * globalement (cf. App.jsx), pilotée par useProfileModalStore. Les infos affichées dépendent du
 * type de compte du profil consulté (badge producteur/influenceur vérifié, ou rien pour un
 * compte amateur), jamais de celui qui consulte.
 */
export default function ProfileModal() {
    const { open, userId, close } = useProfileModalStore()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [recentReviews, setRecentReviews] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open || !userId) {
            setProfile(null)
            setRecentReviews([])
            return
        }
        setLoading(true)
        Promise.all([
            usersService.getProfile(userId),
            usersService.getUserReviews(userId).catch(() => [])
        ])
            .then(([profileData, reviews]) => {
                setProfile(profileData)
                setRecentReviews(Array.isArray(reviews) ? reviews.slice(0, RECENT_REVIEWS_LIMIT) : [])
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false))
    }, [open, userId])

    const displayName = profile?.influencerProfile?.brandName || profile?.username

    return (
        <LiquidModal isOpen={open} onClose={close} size="sm">
            <LiquidModal.Body>
                {loading ? (
                    <div className="py-8 text-center text-white/50">Chargement du profil…</div>
                ) : !profile ? (
                    <div className="py-8 text-center text-white/50">Profil introuvable.</div>
                ) : (
                    <div className="flex flex-col items-center text-center gap-3">
                        <img
                            src={profile.avatar}
                            alt={displayName}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                        />
                        <div>
                            <h3 className="text-lg font-bold text-white">{displayName}</h3>
                            {profile.influencerProfile?.brandName && (
                                <p className="text-xs text-white/40">@{profile.username}</p>
                            )}
                        </div>

                        <TrustBadge
                            producerProfile={profile.producerProfile}
                            influencerProfile={profile.influencerProfile}
                        />

                        <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                            {formatMemberSince(profile.memberSince) && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Membre depuis {formatMemberSince(profile.memberSince)}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4" />
                                {profile.totalReviews} review{profile.totalReviews > 1 ? 's' : ''}
                            </span>
                        </div>

                        {recentReviews.length > 0 && (
                            <div className="w-full mt-2 text-left">
                                <p className="text-xs text-white/40 mb-1.5 uppercase tracking-wide">Reviews récentes</p>
                                <div className="space-y-1">
                                    {recentReviews.map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => { close(); navigate(`/review/${r.id}`) }}
                                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/80"
                                        >
                                            <span className="truncate">{r.holderName}</span>
                                            <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </LiquidModal.Body>
        </LiquidModal>
    )
}
