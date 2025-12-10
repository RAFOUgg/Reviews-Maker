/**
 * Page Profil Utilisateur - Infos personnelles, avatar, paramètres
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

/**
 * Page Profil Utilisateur - Review Maker by Terpologie
 * Gestion des infos personnelles, avatar, paramètres et documents légaux
 */
export default function ProfilePage() {
    const navigate = useNavigate()
    const user = useStore((state) => state.user)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        theme: 'violet-lean'
    })
    const [activeTab, setActiveTab] = useState('info') // info | legal | security

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchProfile()
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
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800 flex items-center justify-center">
                <div className="text-white">Chargement...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-700 to-purple-800">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="glass rounded-3xl p-8 mb-8">
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
                            <button className="absolute -bottom-2 -right-2 bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-full shadow-lg transition-colors">
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
                                <span className="bg-violet-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                    {profile.accountType || 'Consommateur'}
                                </span>
                                <span className="text-gray-600 text-sm">
                                    Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                                {profile.legalAge && (
                                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        ✓ Vérification d'âge
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/20">
                    {[
                        { id: 'info', label: 'Informations' },
                        { id: 'legal', label: 'Légal' },
                        { id: 'security', label: 'Sécurité' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-4 font-semibold transition-colors border-b-2 ${activeTab === tab.id
                                ? 'text-white border-violet-500'
                                : 'text-white/60 hover:text-white border-transparent'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="glass rounded-3xl p-8">
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
                                    <button
                                        type="button"
                                        onClick={() => setEditing(true)}
                                        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                                    >
                                        Modifier
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                                        >
                                            Enregistrer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Legal Tab */}
                    {activeTab === 'legal' && (
                        <div className="space-y-6">
                            <div className="bg-violet-50 rounded-xl p-6 border border-violet-200">
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

                            <div className="bg-rose-50 rounded-xl p-6 border border-rose-200">
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
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <h3 className="font-bold text-gray-900 mb-4">Authentification</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">Authentification multi-facteurs (2FA)</p>
                                            <p className="text-sm text-gray-600">Protégez votre compte avec 2FA</p>
                                        </div>
                                        <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                                            Activer
                                        </button>
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
                </div>
            </div>
        </div>
    )
}
