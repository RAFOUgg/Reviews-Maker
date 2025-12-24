/**
 * Page Profil Utilisateur - Infos personnelles, avatar, paramètres, statistiques
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { LiquidButton, LiquidCard, LiquidInput } from '../components/liquid'
import { Award, FileText, Heart, MessageCircle, Download, TrendingUp, Calendar, Star } from 'lucide-react'

/**
 * Page Profil Utilisateur - Review Maker by Terpologie
 * Gestion des infos personnelles, avatar, paramètres et documents légaux
 */
export default function ProfilePage() {
    const navigate = useNavigate()
    const user = useStore((state) => state.user)
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [recentReviews, setRecentReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        theme: 'violet-lean'
    })
    const [activeTab, setActiveTab] = useState('stats') // stats | info | legal | security

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchProfile()
        fetchStats()
        fetchRecentReviews()
    }, [user, navigate])

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/account/info', {
                credentials: 'include'
            })
            if (!response.ok) throw new Error('Failed to fetch profile')
            const data = await response.json()
            setProfile(data)
            setFormData({
                username: data.username || '',
                email: data.email || '',
                theme: data.theme || 'violet-lean'
            })
        } catch (err) {
            console.error('Erreur chargement profil:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/user/stats', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Erreur chargement stats:', err)
        }
    }

    const fetchRecentReviews = async () => {
        try {
            const response = await fetch('/api/reviews?limit=5', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setRecentReviews(data.reviews || [])
            }
        } catch (err) {
            console.error('Erreur chargement reviews:', err)
        }
    }

    const getBadges = () => {
        if (!profile) return []
        const badges = []

        // Badge selon type de compte
        if (profile.accountType === 'Producteur') {
            badges.push({ icon: '🌱', label: 'Producteur Certifié', color: 'bg-emerald-500' })
        } else if (profile.accountType === 'Influenceur') {
            badges.push({ icon: '⭐', label: 'Influenceur', color: '' })
        }

        // Badge vérification d'âge
        if (profile.legalAge) {
            badges.push({ icon: '✓', label: 'Vérifié', color: '' })
        }

        // Badge selon nombre de reviews (si stats disponibles)
        if (stats) {
            if (stats.totalReviews >= 100) {
                badges.push({ icon: '🏆', label: 'Expert', color: 'bg-amber-500' })
            } else if (stats.totalReviews >= 50) {
                badges.push({ icon: '🥇', label: 'Contributeur', color: 'bg-yellow-500' })
            } else if (stats.totalReviews >= 10) {
                badges.push({ icon: '🥈', label: 'Actif', color: 'bg-gray-400' })
            }
        }

        return badges
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/account/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })
            if (!response.ok) throw new Error('Update failed')
            const updated = await response.json()
            setProfile(updated)
            setEditing(false)
        } catch (err) {
            console.error('Erreur mise à jour:', err)
        }
    }

    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Chargement...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 relative">
            <div className="absolute inset-0 bg-gradient-to-br /20 /20 /20 pointer-events-none" />
            <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 relative z-10">
                {/* Header */}
                <LiquidCard padding="lg" className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour
                    </button>

                    <div className="flex items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=9333EA&color=fff&bold=true&size=150`}
                                alt={profile.username}
                                className="w-32 h-32 rounded-2xl border-4 border-violet-500 shadow-lg"
                            />
                            <button className="absolute -bottom-2 -right-2 hover: text-white p-3 rounded-full shadow-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.username}</h1>
                            <p className="text-gray-700 mb-4">{profile.email}</p>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-white px-4 py-2 rounded-full text-sm font-semibold">
                                    {profile.accountType || 'Consommateur'}
                                </span>
                                <span className="text-gray-600 text-sm flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                                {getBadges().map((badge, idx) => (
                                    <span key={idx} className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                        <span>{badge.icon}</span>
                                        {badge.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </LiquidCard>

                {/* Stats rapides */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <LiquidCard padding="md" className="text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-gray-900">{stats.totalReviews || 0}</div>
                            <div className="text-sm text-gray-600">Reviews</div>
                        </LiquidCard>
                        <LiquidCard padding="md" className="text-center">
                            <Download className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-gray-900">{stats.totalExports || 0}</div>
                            <div className="text-sm text-gray-600">Exports</div>
                        </LiquidCard>
                        <LiquidCard padding="md" className="text-center">
                            <Heart className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-gray-900">{stats.totalLikes || 0}</div>
                            <div className="text-sm text-gray-600">Likes</div>
                        </LiquidCard>
                        <LiquidCard padding="md" className="text-center">
                            <MessageCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <div className="text-3xl font-bold text-gray-900">{stats.totalComments || 0}</div>
                            <div className="text-sm text-gray-600">Commentaires</div>
                        </LiquidCard>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/20">
                    {[
                        { id: 'stats', label: 'Statistiques', icon: TrendingUp },
                        { id: 'info', label: 'Informations', icon: FileText },
                        { id: 'legal', label: 'Légal', icon: Award },
                        { id: 'security', label: 'Sécurité', icon: Star }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-4 font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === tab.id ? 'text-white border-violet-500' : 'text-white/60 hover:text-white border-transparent' }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <LiquidCard padding="lg">
                    {/* Stats Tab */}
                    {activeTab === 'stats' && (
                        <div className="space-y-8">
                            {/* Stats détaillées */}
                            {stats && (
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Vue d'ensemble</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-gradient-to-br rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900">Production</h4>
                                                <Star className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Reviews créées</span>
                                                    <span className="font-bold">{stats.totalReviews || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Exports générés</span>
                                                    <span className="font-bold">{stats.totalExports || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Templates sauvegardés</span>
                                                    <span className="font-bold">{stats.savedTemplates || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gradient-to-br from-rose-50 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900">Engagement</h4>
                                                <Heart className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Likes reçus</span>
                                                    <span className="font-bold">{stats.likesReceived || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Commentaires reçus</span>
                                                    <span className="font-bold">{stats.commentsReceived || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Partages</span>
                                                    <span className="font-bold">{stats.shares || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dernières reviews */}
                            {recentReviews.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Dernières reviews</h3>
                                    <div className="space-y-4">
                                        {recentReviews.map((review) => (
                                            <div
                                                key={review.id}
                                                onClick={() => navigate(`/review/${review.id}`)}
                                                className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{review.productName}</h4>
                                                        <p className="text-sm text-gray-600">{review.productType}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Heart className="w-4 h-4" />
                                                            <span className="text-sm">{review.likes || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Nom d'utilisateur</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-700 text-lg">{profile.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                                    {editing ? (
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-700 text-lg">{profile.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Thème</label>
                                {editing ? (
                                    <select
                                        value={formData.theme}
                                        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                        className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                                    >
                                        <option value="violet-lean">Violet Lean (par défaut)</option>
                                        <option value="dark">Mode Sombre</option>
                                        <option value="emerald">Émeraude</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-700 text-lg capitalize">{profile.theme}</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                {!editing ? (
                                    <LiquidButton
                                        variant="primary"
                                        size="md"
                                        onClick={() => setEditing(true)}
                                    >
                                        Modifier
                                    </LiquidButton>
                                ) : (
                                    <>
                                        <LiquidButton
                                            variant="primary"
                                            size="md"
                                            onClick={handleUpdateProfile}
                                        >
                                            Enregistrer
                                        </LiquidButton>
                                        <LiquidButton
                                            variant="secondary"
                                            size="md"
                                            onClick={() => setEditing(false)}
                                        >
                                            Annuler
                                        </LiquidButton>
                                    </>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Legal Tab */}
                    {activeTab === 'legal' && (
                        <div className="space-y-6">
                            <div className="rounded-xl p-6 border border-violet-200">
                                <h3 className="font-bold text-gray-900 mb-3">Conditions Générales d'Utilisation</h3>
                                <div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto">
                                    <p>
                                        Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et l'utilisation de la plateforme Orchard Studio.
                                    </p>
                                    <p>
                                        En accédant à notre plateforme, vous reconnaissez avoir l'âge légal requis dans votre juridiction pour consommer du cannabis.
                                    </p>
                                    <p>
                                        Vous acceptez de respecter toutes les lois et réglementations applicables dans votre pays.
                                    </p>
                                    <p>
                                        Vous êtes responsable de la confidentialité de votre compte et de l'activité qui y est liée.
                                    </p>
                                </div>
                                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                                    <span className="text-sm text-gray-700">J'accepte les CGU</span>
                                </label>
                            </div>

                            <div className="rounded-xl p-6 border border-rose-200">
                                <h3 className="font-bold text-gray-900 mb-3">Mentions Légales</h3>
                                <div className="text-sm text-gray-700 space-y-3 max-h-64 overflow-y-auto">
                                    <p>
                                        <strong>Responsable du site:</strong> Orchard Studio SARL
                                    </p>
                                    <p>
                                        <strong>Conformité:</strong> Cette plateforme respecte les réglementations sur le cannabis dans les juridictions où elle opère.
                                    </p>
                                    <p>
                                        <strong>Restrictions d'âge:</strong> Accès réservé aux personnes ayant l'âge légal minimum défini par leur pays.
                                    </p>
                                    <p>
                                        <strong>Contenu:</strong> Les reviews et contenus générés par les utilisateurs restent leur propriété intellectuelle.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="rounded-xl p-6 border">
                                <h3 className="font-bold text-gray-900 mb-4">Authentification</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Authentification multi-facteurs (2FA)</p>
                                            <p className="text-sm text-gray-600">Protégez votre compte avec 2FA</p>
                                        </div>
                                        <LiquidButton variant="primary" size="sm">
                                            Activer
                                        </LiquidButton>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4">Sessions</h3>
                                <div className="text-sm text-gray-600">
                                    <p>Actuellement connecté depuis 1 appareil</p>
                                </div>
                            </div>
                        </div>
                    )}
                </LiquidCard>
            </div>
        </div>
    )
}
