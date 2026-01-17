import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
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
  Check
} from 'lucide-react'

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

const AccountPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, accountType } = useStore()
  
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
        <p className="text-gray-400">{t('account.subtitle') || 'Gérez votre profil, vos préférences et votre abonnement'}</p>
      </div>

      {/* Profile Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-gray-700/50">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2">
          <User size={24} className="text-blue-400" />
          {t('account.profile') || 'Mon Profil'}
        </h2>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Avatar & Basic Info */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
              <span className="text-2xl font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{user?.username || 'User'}</h3>
            <p className="text-gray-400 text-sm break-all">{user?.email || 'email@example.com'}</p>
          </div>

          {/* Account Type & Member Date */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('account.accountType') || 'Type de compte'}</p>
              <p className="font-semibold text-lg text-blue-400">{getAccountTypeLabel(accountType)}</p>
            </div>
            <div className="pt-3 border-t border-gray-600/30">
              <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                <Calendar size={16} />
                {t('account.memberSince') || 'Membre depuis'}
              </p>
              <p className="font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
            <p className="text-gray-400 text-sm mb-3">{t('account.language') || 'Langue'}</p>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`py-2 px-1 rounded-lg transition-all text-sm font-medium ${
                    language === lang.code
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-gray-600/40 text-gray-300 hover:bg-gray-600/60'
                  }`}
                  title={lang.name}
                >
                  <div className="text-xl mb-1">{lang.flag}</div>
                  <div className="text-xs">{lang.code.toUpperCase()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 space-y-3 flex flex-col justify-between">
            {accountType === 'Amateur' ? (
              <button
                onClick={() => navigate('/payment')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg"
              >
                <CreditCard size={18} />
                {t('account.upgrade') || 'Passer Premium'}
              </button>
            ) : (
              <button
                onClick={() => navigate('/manage-subscription')}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg"
              >
                <CreditCard size={18} />
                {t('account.manageSubscription') || 'Gérer l\'abonnement'}
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600/40 hover:bg-red-600/60 text-red-300 hover:text-red-200 font-semibold py-2 px-4 rounded-lg transition-all border border-red-600/30"
            >
              <LogOut size={18} />
              {t('account.logout') || 'Déconnexion'}
            </button>
          </div>
        </div>

        {/* Save Confirmation */}
        {isSaved && (
          <div className="mt-4 flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-600/30">
            <Check size={18} />
            <span>{t('account.saved') || 'Changements enregistrés'}</span>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2">
          <Save size={24} className="text-emerald-400" />
          {t('account.preferences') || 'Préférences'}
        </h2>

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
    </div>
  )
}

export default AccountPage
