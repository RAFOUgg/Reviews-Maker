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
import UsageQuotas from '../../components/account/UsageQuotas'

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

const TAB_SECTIONS = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'preferences', label: 'Préférences', icon: Settings },
  { id: 'saved-data', label: 'Données sauvegardées', icon: Save, locked: false },
  { id: 'templates', label: 'Templates', icon: '⭐', locked: false },
  { id: 'watermarks', label: 'Filigranes', icon: '🏷️', locked: false },
  { id: 'export', label: 'Export', icon: '📤', locked: false },
]

const AccountPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, accountType } = useStore()
  
  // Check if profile is complete
  const isProfileComplete = user?.birthdate && user?.country
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('profile')
  
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-0">
          {TAB_SECTIONS.map((tab) => {
            const Icon = typeof tab.icon === 'string' ? null : tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-4 py-4 text-sm md:text-base font-medium transition-all border-b-2 ${
                  activeTab === tab.id
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
            <ProfileSection 
              user={user}
              accountType={accountType}
              language={language}
              handleLanguageChange={handleLanguageChange}
              handleLogout={handleLogout}
              navigate={navigate}
              t={t}
              isSaved={isSaved}
              getAccountTypeLabel={getAccountTypeLabel}
            />
          )}
          
          {activeTab === 'preferences' && (
            <PreferencesSection
              preferences={preferences}
              handlePreferenceChange={handlePreferenceChange}
              visibilityOptions={visibilityOptions}
              t={t}
            />
          )}
          
          {activeTab === 'saved-data' && (
            <SavedDataSection />
          )}
          
          {activeTab === 'templates' && (
            <TemplatesSection />
          )}
          
          {activeTab === 'watermarks' && (
            <WatermarksSection />
          )}
          
          {activeTab === 'export' && (
            <ExportSection />
          )}
        </motion.div>
      </div>

      {/* Usage Quotas - Always visible below tabs */}
      <div className="mt-8">
        <UsageQuotas compact={false} />
      </div>
    </div>
  )
}

// ============== Section Components ==============

function ProfileSection({ user, accountType, language, handleLanguageChange, handleLogout, navigate, t, isSaved, getAccountTypeLabel }) {
  const SUPPORTED_LANGUAGES = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ]

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">{t('account.profile') || 'Mon Profil'}</h3>

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
              onClick={() => navigate('/choose-account?mode=upgrade')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg"
            >
              <CreditCard size={18} />
              {t('account.upgrade') || 'Changer de Plan'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/choose-account?mode=upgrade')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg"
            >
              <CreditCard size={18} />
              {t('account.changeplan') || 'Changer de Plan'}
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

      {isSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-600/30"
        >
          <Check size={18} />
          <span>{t('account.saved') || 'Changements enregistrés'}</span>
        </motion.div>
      )}
    </div>
  )
}

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

function SavedDataSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Données sauvegardées</h3>
      <p className="text-gray-400 mb-6">Enregistrez vos substrats, engrais et matériel fréquemment utilisés pour un remplissage rapide des reviews.</p>

      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><span>🌱</span><span>Substrats favoris</span></h3>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Terre BioBizz Light Mix</span>
              <button className="text-red-500 hover:text-red-600">🗑️</button>
            </div>
          </div>
          <button className="w-full px-4 py-2 border-2 border-dashed border-gray-600/30 rounded-lg text-gray-400 hover:border-gray-400 hover:text-white transition-all">+ Ajouter un substrat</button>
        </div>

        <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><span>🧪</span><span>Engrais favoris</span></h3>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">BioBizz Grow</span>
              <button className="text-red-500 hover:text-red-600">🗑️</button>
            </div>
          </div>
          <button className="w-full px-4 py-2 border-2 border-dashed border-gray-600/30 rounded-lg text-gray-400 hover:border-gray-400 hover:text-white transition-all">+ Ajouter un engrais</button>
        </div>

        <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><span>🔧</span><span>Matériel favori</span></h3>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">LED Spider Farmer SF2000</span>
              <button className="text-red-500 hover:text-red-600">🗑️</button>
            </div>
          </div>
          <button className="w-full px-4 py-2 border-2 border-dashed border-gray-600/30 rounded-lg text-gray-400 hover:border-gray-400 hover:text-white transition-all">+ Ajouter du matériel</button>
        </div>
      </div>
    </div>
  )
}

function TemplatesSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Templates favoris</h3>
      <p className="text-gray-400 mb-6">Gérez vos templates d'export personnalisés et marquez vos favoris.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 transition-all hover:border-blue-500/50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white">Template Instagram</h3>
              <p className="text-sm text-gray-400">Format 1:1 • Compact</p>
            </div>
            <button className="text-yellow-500 text-xl hover:scale-110 transition-transform">⭐</button>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all">Utiliser</button>
            <button className="px-3 py-2 rounded-lg text-gray-400 bg-gray-600/40 hover:bg-gray-600/60 text-sm font-medium transition-all">Modifier</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WatermarksSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Filigranes personnalisés</h3>
      <p className="text-gray-400 mb-6">Créez et gérez vos filigranes personnalisés pour vos exports.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-6 border-2 border-dashed border-gray-600/30 rounded-xl text-gray-400 hover:text-white hover:border-gray-400 transition-all bg-gray-700/30">
          <div className="text-4xl mb-2">+</div>
          <div className="font-semibold">Créer un filigrane</div>
        </button>
      </div>
    </div>
  )
}

function ExportSection() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Préférences d'export</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Format par défaut</label>
          <select className="w-full px-4 py-2 rounded-lg border border-gray-600/30 bg-gray-700/30 text-white focus:outline-none focus:border-blue-500/50">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="pdf">PDF</option>
            <option value="svg">SVG</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Qualité par défaut</label>
          <select className="w-full px-4 py-2 rounded-lg border border-gray-600/30 bg-gray-700/30 text-white focus:outline-none focus:border-blue-500/50">
            <option value="standard">Standard (72 dpi)</option>
            <option value="high">Haute (300 dpi)</option>
            <option value="ultra">Ultra (600 dpi)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Template par défaut</label>
          <select className="w-full px-4 py-2 rounded-lg border border-gray-600/30 bg-gray-700/30 text-white focus:outline-none focus:border-blue-500/50">
            <option value="compact">Compact</option>
            <option value="detailed">Détaillé</option>
            <option value="complete">Complète</option>
          </select>
        </div>

        <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all">Sauvegarder les modifications</button>
      </div>
    </div>
  )
}

export default AccountPage
