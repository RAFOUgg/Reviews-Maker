import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { motion } from 'framer-motion'
import {
  LogOut,
  CreditCard,
  Bell,
  Eye,
  Save,
  Share2,
  BarChart3,
  Lock,
  User,
  Calendar,
  Check,
  Settings
} from 'lucide-react'
import ProfileSection from './sections/ProfileSection'
import AccountTypeDisplay from '../../components/account/AccountTypeDisplay'
import UpgradeModal from '../../components/account/UpgradeModal'
import SubscriptionHistory from '../../components/account/SubscriptionHistory'
import { useAccountFeatures } from '../../hooks/useAccountFeatures'

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

// Génère les onglets dynamiquement selon le type de compte
const getTabSections = (accountType) => {
  return [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Lock }
  ]
}

const AccountPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, accountType } = useStore()
  const { isProducteur } = useAccountFeatures()

  const isProfileComplete = user?.birthdate && user?.country
  const [activeTab, setActiveTab] = useState('profile')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [language, setLanguage] = useState(() => i18n.language || 'fr')
  const [isSaved, setIsSaved] = useState(false)

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences')
    return saved ? JSON.parse(saved) : {
      defaultVisibility: 'private',
      showNotifications: true,
      autoSaveDrafts: true,
      allowSocialSharing: false,
      showDetailedStats: true,
      privateProfile: false
    }
  })

  const handleLanguageChange = async (newLang) => {
    try {
      setLanguage(newLang)
      await i18n.changeLanguage(newLang)
      const response = await fetch('/api/account/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang })
      })
      if (response.ok) {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('userPreferences', JSON.stringify(updated))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
      return updated
    })
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      navigate('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const visibilityOptions = [
    { value: 'private', label: 'Privé' },
    { value: 'friends', label: 'Amis uniquement' },
    { value: 'public', label: 'Public' }
  ]

  // ✅ PROFILE INCOMPLETE CHECK
  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-[#07070f] text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-red-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <div className="relative rounded-3xl overflow-hidden p-8">
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
            <div className="absolute inset-[1px] rounded-3xl border border-white/[0.08]" />

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Complétez votre profil</h2>
              <p className="text-white/50 text-sm mb-6">Finalisez votre inscription pour déverrouiller toutes les fonctionnalités.</p>

              <div className="space-y-2 mb-6">
                {!user?.birthdate && (
                  <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <span>📅</span>
                    <span>Date de naissance manquante</span>
                  </div>
                )}
                {!user?.country && (
                  <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <span>🌍</span>
                    <span>Pays manquant</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/choose-account')}
                className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                Compléter mon profil
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full mt-3 px-6 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 font-medium rounded-xl transition-all border border-white/[0.08]"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07070f] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background ambient glow effects - Apple style */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header - Apple style with avatar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-[2px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full rounded-2xl bg-[#1a1a2e] flex items-center justify-center">
              <User size={28} className="text-white/90" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              {t('account.title') || 'Mon Compte'}
            </h1>
            <p className="text-white/40 text-sm mt-1">{t('account.subtitle') || 'Gérez votre profil, vos préférences et vos données'}</p>
          </div>
        </div>

        {/* Main Container - Liquid Glass Card */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Glass background layer */}
          <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
          <div className="absolute inset-[1px] rounded-3xl border border-white/[0.08]" />

          {/* Inner glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            {/* Tab Navigation - Frosted glass pills */}
            <div className="flex gap-1 p-2 m-4 mb-0 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.05]">
              {getTabSections(accountType).map((tab) => {
                const Icon = typeof tab.icon === 'string' ? null : tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isActive
                        ? 'bg-white/[0.1] text-white shadow-lg'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.04]'
                      }`}
                    title={tab.label}
                  >
                    {Icon && <Icon size={18} />}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8"
            >
              {activeTab === 'profile' && (
                <ProfileSection />
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-white">💳 Gérer mon abonnement</h2>
                    <p className="text-white/50">Découvrez nos offres et gérez votre souscription</p>
                  </div>
                  <AccountTypeDisplay onUpgradeClick={() => setShowUpgradeModal(true)} />

                  {(accountType === 'producteur' || accountType === 'influenceur') && (
                    <SubscriptionHistory />
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <PreferencesSection
                  preferences={preferences}
                  handlePreferenceChange={handlePreferenceChange}
                  visibilityOptions={visibilityOptions}
                  t={t}
                />
              )}

              {activeTab === 'security' && (
                <SecuritySection t={t} />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal Upgrade */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}

// ============== Section Components ==============

function PreferencesSection({ preferences, handlePreferenceChange, visibilityOptions, t }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-white">{t('account.preferences') || 'Préférences'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Notifications */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] group-hover:border-blue-500/30 transition-colors" />
          <div className="relative z-10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Bell size={16} className="text-blue-400" />
                </div>
                <span className="font-semibold text-white">{t('account.notifications') || 'Notifications'}</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.showNotifications}
                onChange={(e) => handlePreferenceChange('showNotifications', e.target.checked)}
                className="w-5 h-5 rounded accent-violet-500 cursor-pointer"
              />
            </div>
            <p className="text-sm text-white/40">{t('account.notificationsDesc') || 'Recevoir les notifications d\'activité'}</p>
          </div>
        </div>

        {/* Visibility */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] group-hover:border-green-500/30 transition-colors" />
          <div className="relative z-10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Eye size={16} className="text-green-400" />
              </div>
              <span className="font-semibold text-white">{t('account.defaultVisibility') || 'Visibilité par défaut'}</span>
            </div>
            <select
              value={preferences.defaultVisibility}
              onChange={(e) => handlePreferenceChange('defaultVisibility', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
            >
              {visibilityOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-save */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] group-hover:border-purple-500/30 transition-colors" />
          <div className="relative z-10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Save size={16} className="text-purple-400" />
                </div>
                <span className="font-semibold text-white text-sm">{t('account.autoSave') || 'Sauvegarde auto.'}</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.autoSaveDrafts}
                onChange={(e) => handlePreferenceChange('autoSaveDrafts', e.target.checked)}
                className="w-5 h-5 rounded accent-violet-500 cursor-pointer"
              />
            </div>
            <p className="text-sm text-white/40">{t('account.autoSaveDesc') || 'Sauvegarder automatiquement les brouillons'}</p>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] group-hover:border-pink-500/30 transition-colors" />
          <div className="relative z-10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Share2 size={16} className="text-pink-400" />
                </div>
                <span className="font-semibold text-white">{t('account.socialSharing') || 'Partage social'}</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.allowSocialSharing}
                onChange={(e) => handlePreferenceChange('allowSocialSharing', e.target.checked)}
                className="w-5 h-5 rounded accent-violet-500 cursor-pointer"
              />
            </div>
            <p className="text-sm text-white/40">{t('account.socialSharingDesc') || 'Autoriser le partage sur réseaux sociaux'}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] group-hover:border-orange-500/30 transition-colors" />
          <div className="relative z-10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <BarChart3 size={16} className="text-orange-400" />
                </div>
                <span className="font-semibold text-white text-sm">{t('account.stats') || 'Statistiques'}</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.showDetailedStats}
                onChange={(e) => handlePreferenceChange('showDetailedStats', e.target.checked)}
                className="w-5 h-5 rounded accent-violet-500 cursor-pointer"
              />
            </div>
            <p className="text-sm text-white/40">{t('account.statsDesc') || 'Afficher les statistiques détaillées'}</p>
          </div>
        </div>

        {/* Privacy */}
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08] group-hover:border-red-500/30 transition-colors" />
          <div className="relative z-10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Lock size={16} className="text-red-400" />
                </div>
                <span className="font-semibold text-white">{t('account.privacy') || 'Profil privé'}</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.privateProfile}
                onChange={(e) => handlePreferenceChange('privateProfile', e.target.checked)}
                className="w-5 h-5 rounded accent-violet-500 cursor-pointer"
              />
            </div>
            <p className="text-sm text-white/40">{t('account.privacyDesc') || 'Rendre mon profil privé'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySection({ t }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-white">{t('account.security') || 'Sécurité'}</h3>
      <p className="text-white/50 mb-6">Gérez votre mot de passe et les paramètres de sécurité de votre compte.</p>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08]" />
          <div className="relative z-10 p-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Lock size={18} className="text-violet-400" />
              Changer le mot de passe
            </h4>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Mot de passe actuel"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:border-violet-500/50 outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:border-violet-500/50 outline-none transition-colors"
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:border-violet-500/50 outline-none transition-colors"
              />
              <button className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                Mettre à jour le mot de passe
              </button>
            </div>
          </div>
        </div>

        {/* 2FA */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08]" />
          <div className="relative z-10 p-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={18} className="text-emerald-400" />
              Authentification à deux facteurs (2FA)
            </h4>
            <p className="text-white/40 text-sm mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/35">
              Activer 2FA
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.03]" />
          <div className="absolute inset-[1px] rounded-2xl border border-white/[0.08]" />
          <div className="relative z-10 p-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <User size={18} className="text-cyan-400" />
              Sessions actives
            </h4>
            <p className="text-white/40 text-sm mb-4">Gérez vos sessions de connexion actives</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-sm">Appareil actuel</span>
                </div>
                <span className="text-white/30 text-xs">Maintenant</span>
              </div>
            </div>
            <button className="w-full px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              Déconnecter tous les autres appareils
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
