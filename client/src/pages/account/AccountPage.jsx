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
import { useAccountFeatures } from '../../hooks/useAccountFeatures'

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

// Génère les onglets dynamiquement selon le type de compte
// Gestion du compte UNIQUEMENT (pas de bibliothèque ici)
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

  // Check if profile is complete
  const isProfileComplete = user?.birthdate && user?.country

  // Active tab state
  const [activeTab, setActiveTab] = useState('profile')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Profile/Language state
  const [language, setLanguage] = useState(() => i18n.language || 'fr')
  const [isSaved, setIsSaved] = useState(false)

  // Preferences state (from PreferencesPage)
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

  // Handle language change
  const handleLanguageChange = async (newLang) => {
    try {
      setLanguage(newLang)
      await i18n.changeLanguage(newLang)

      // Save to backend
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

  // Handle preference change
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('userPreferences', JSON.stringify(updated))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
      return updated
    })
  }

  // Handle logout
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

  const getAccountTypeLabel = (type) => {
    const types = {
      'Amateur': 'Amateur',
      'Producteur': 'Producteur',
      'Influenceur': 'Influenceur'
    }
    return types[type] || type
  }

  // ✅ PROFILE INCOMPLETE CHECK
  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0H9m0 0h6m0 0v-2m0 2H9" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Complétez votre profil</h2>
            <p className="text-gray-400 text-sm mb-6">Finalisez votre inscription pour déverrouiller toutes les fonctionnalités.</p>
          </div>

          <div className="space-y-2 mb-6">
            {!user?.birthdate && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <span>📅</span>
                <span>Date de naissance manquante</span>
              </div>
            )}
            {!user?.country && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <span>🌍</span>
                <span>Pays manquant</span>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/choose-account')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            Compléter mon profil
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-3 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-all"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <User size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">⚙️ {t('account.title') || 'Mon Compte'}</h1>
        </div>
        <p className="text-gray-400">{t('account.subtitle') || 'Gérez votre profil, vos préférences et vos données'}</p>
      </div>

      {/* Tabbed Navigation Container */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
        {/* Tab Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-0">
          {getTabSections(accountType).map((tab) => {
            const Icon = typeof tab.icon === 'string' ? null : tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-4 py-4 text-sm md:text-base font-medium transition-all border-b-2 ${activeTab === tab.id
                    ? 'border-blue-500 bg-gray-700/30 text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                title={tab.label}
              >
                <div className="flex items-center gap-1 md:gap-2 justify-center">
                  {Icon ? <Icon size={18} /> : <span>{tab.icon}</span>}
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
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
                <h2 className="text-2xl font-bold mb-2">💳 Gérer mon abonnement</h2>
                <p className="text-gray-400">Découvrez nos offres et gérez votre souscription</p>
              </div>
              <AccountTypeDisplay onUpgradeClick={() => setShowUpgradeModal(true)} />
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
  )
}

// ============== Section Components ==============

function PreferencesSection({ preferences, handlePreferenceChange, visibilityOptions, t }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">{t('account.preferences') || 'Préférences'}</h3>

      {/* Preferences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Notifications */}
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-blue-500/30 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-blue-400" />
              <span className="font-semibold">{t('account.notifications') || 'Notifications'}</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.showNotifications}
              onChange={(e) => handlePreferenceChange('showNotifications', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-400">{t('account.notificationsDesc') || 'Recevoir les notifications d\'activité'}</p>
        </div>

        {/* Visibility */}
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={20} className="text-green-400" />
            <span className="font-semibold">{t('account.defaultVisibility') || 'Visibilité par défaut'}</span>
          </div>
          <select
            value={preferences.defaultVisibility}
            onChange={(e) => handlePreferenceChange('defaultVisibility', e.target.value)}
            className="w-full bg-gray-600/40 border border-gray-600/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50"
          >
            {visibilityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Auto-save */}
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-purple-500/30 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Save size={20} className="text-purple-400" />
              <span className="font-semibold text-sm">{t('account.autoSave') || 'Sauvegarde auto.'}</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.autoSaveDrafts}
              onChange={(e) => handlePreferenceChange('autoSaveDrafts', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-400">{t('account.autoSaveDesc') || 'Sauvegarder automatiquement les brouillons'}</p>
        </div>

        {/* Social Sharing */}
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-pink-500/30 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Share2 size={20} className="text-pink-400" />
              <span className="font-semibold">{t('account.socialSharing') || 'Partage social'}</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.allowSocialSharing}
              onChange={(e) => handlePreferenceChange('allowSocialSharing', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-400">{t('account.socialSharingDesc') || 'Autoriser le partage sur réseaux sociaux'}</p>
        </div>

        {/* Statistics */}
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-orange-500/30 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-orange-400" />
              <span className="font-semibold text-sm">{t('account.stats') || 'Statistiques'}</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.showDetailedStats}
              onChange={(e) => handlePreferenceChange('showDetailedStats', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-400">{t('account.statsDesc') || 'Afficher les statistiques détaillées'}</p>
        </div>

        {/* Privacy */}
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 hover:border-red-500/30 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lock size={20} className="text-red-400" />
              <span className="font-semibold">{t('account.privacy') || 'Profil privé'}</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.privateProfile}
              onChange={(e) => handlePreferenceChange('privateProfile', e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
          </div>
          <p className="text-sm text-gray-400">{t('account.privacyDesc') || 'Rendre mon profil privé'}</p>
        </div>
      </div>
    </div>
  )
}

function SecuritySection({ t }) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">{t('account.security') || 'Sécurité'}</h3>
      <p className="text-gray-400 mb-6">Gérez votre mot de passe et les paramètres de sécurité de votre compte.</p>

      <div className="space-y-6">
        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
          <h4 className="font-semibold text-white mb-4">Changer le mot de passe</h4>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Mot de passe actuel"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 outline-none"
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 outline-none"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600/50 rounded-lg text-white focus:border-blue-500/50 outline-none"
            />
            <button className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
          <h4 className="font-semibold text-white mb-4">Authentification à deux facteurs (2FA)</h4>
          <p className="text-gray-400 text-sm mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
          <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all">
            Activer 2FA
          </button>
        </div>

        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
          <h4 className="font-semibold text-white mb-4">Sessions actives</h4>
          <p className="text-gray-400 text-sm mb-4">Gérez vos sessions de connexion actives</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">Appareil actuel</span>
              </div>
              <span className="text-gray-500 text-xs">Maintenant</span>
            </div>
          </div>
          <button className="w-full px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            Déconnecter tous les autres appareils
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
