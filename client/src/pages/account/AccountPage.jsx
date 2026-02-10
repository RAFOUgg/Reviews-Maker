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
import { LiquidCard, LiquidButton, LiquidInput, LiquidSelect, LiquidToggle, LiquidTabs, LiquidAvatar, LiquidBadge } from '@/components/ui/LiquidUI'
import ProfileSection from './sections/ProfileSection'
import AccountTypeDisplay from '../../components/account/AccountTypeDisplay'
import UpgradeModal from '../../components/account/UpgradeModal'
import SubscriptionHistory from '../../components/account/SubscriptionHistory'
import { accountService, paymentService } from '../../services/apiService'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useToast } from '../../components/shared/ToastContainer'
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
  const { user, accountType, checkAuth } = useStore()
  const { isProducteur } = useAccountFeatures()

  const isProfileComplete = user?.birthdate && user?.country
  const [activeTab, setActiveTab] = useState('profile')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [language, setLanguage] = useState(() => i18n.language || 'fr')
  const [isSaved, setIsSaved] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const toast = useToast()

  // Permet d'ouvrir directement un onglet via l'URL (ex: /account?tab=subscription)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab) setActiveTab(tab)
      if (params.get('upgraded')) {
        setTimeout(() => toast?.success?.('Votre abonnement a été mis à jour'), 300)
      }
    } catch (err) {
      // ignore
    }
  }, [])

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
      <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-red-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-md w-full">
          <LiquidCard glow="amber" padding="lg">
            <div className="text-center">
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

              <LiquidButton
                onClick={() => navigate('/choose-account')}
                variant="primary"
                glow="purple"
                fullWidth
              >
                Compléter mon profil
              </LiquidButton>

              <LiquidButton
                onClick={() => navigate('/')}
                variant="ghost"
                fullWidth
                className="mt-3"
              >
                Retour à l'accueil
              </LiquidButton>
            </div>
          </LiquidCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background ambient glow effects - Apple style */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header - Apple style with avatar */}
        <div className="mb-8 flex items-center gap-4">
          <LiquidAvatar
            size="lg"
            src={user?.avatar}
            fallback={user?.username?.charAt(0)?.toUpperCase() || 'U'}
            glow="purple"
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              {t('account.title') || 'Mon Compte'}
            </h1>
            <p className="text-white/40 text-sm mt-1">{t('account.subtitle') || 'Gérez votre profil, vos préférences et vos données'}</p>
          </div>
        </div>

        {/* Main Container - Liquid Glass Card */}
        <LiquidCard glow="purple" padding="none">
          {/* Tab Navigation - Using LiquidTabs */}
          <div className="p-4 pb-0">
            <LiquidTabs
              tabs={getTabSections(accountType).map(tab => ({
                id: tab.id,
                label: tab.label,
                icon: tab.icon
              }))}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
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
                  <p className="text-white/50">Visualisez votre plan actuel et gérez vos options (modifier, moyen de paiement, résilier).</p>
                </div>

                {/* Deux colonnes : résumé du plan + panneau d'actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <AccountTypeDisplay onUpgradeClick={() => setShowUpgradeModal(true)} />
                  </div>

                  <div className="md:col-span-1">
                    <div className="bg-white/3 dark:bg-white/5 rounded-lg p-4 space-y-4 border border-white/6">
                      <h3 className="text-lg font-semibold text-white">Actions</h3>

                      {/* Display human-friendly French label while keeping backend keys English */}
                      {(() => {
                        const map = {
                          consumer: 'Amateur',
                          producer: 'Producteur',
                          influencer: 'Influenceur',
                          admin: 'Administrateur',
                          amateur: 'Amateur',
                          producteur: 'Producteur',
                          influenceur: 'Influenceur'
                        }
                        const label = map[accountType] || 'Amateur'
                        return <p className="text-sm text-white/60">Plan actuel: <span className="font-medium text-white">{label}</span></p>
                      })()}

                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
                      >
                        ✨ Modifier le plan
                      </button>

                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="w-full bg-gray-700 text-white font-medium py-2 px-3 rounded-lg hover:bg-gray-600"
                      >
                        ⚙️ Gérer le moyen de paiement
                      </button>

                      {accountType && accountType !== 'consumer' && (
                        <>
                          <button
                            onClick={() => setShowCancelDialog(true)}
                            className="w-full text-sm font-medium text-red-400 bg-white/5 px-3 py-2 rounded-lg hover:bg-red-900/10"
                          >
                            ❌ Résilier l'abonnement
                          </button>

                          <ConfirmDialog
                            isOpen={showCancelDialog}
                            title="Confirmer la résiliation"
                            description="Voulez-vous vraiment résilier votre abonnement ? Votre contenu restera visible mais vous perdrez l'accès à la création."
                            onCancel={() => setShowCancelDialog(false)}
                            onConfirm={async () => {
                              setShowCancelDialog(false)
                              try {
                                await accountService.changeType('consumer')
                                if (typeof checkAuth === 'function') await checkAuth()
                                toast.success('Abonnement résilié. Votre compte a été rétrogradé.')
                                // small delay so toast is visible before reload
                                setTimeout(() => window.location.reload(), 700)
                              } catch (err) {
                                console.error('Cancel subscription error', err)
                                try {
                                  await paymentService.cancel()
                                  if (typeof checkAuth === 'function') await checkAuth()
                                  toast.success('Abonnement résilié via le service de paiement.')
                                  setTimeout(() => window.location.reload(), 700)
                                } catch (err2) {
                                  console.error('Payment cancel fallback failed', err2)
                                  toast.error(err2?.message || 'Erreur lors de la résiliation')
                                }
                              }
                            }}
                            confirmText="Résilier"
                            cancelText="Annuler"
                          />
                        </>
                      )}

                    </div>
                  </div>
                </div>

                {(accountType === 'producer' || accountType === 'influencer') && (
                  <div>
                    <SubscriptionHistory />
                  </div>
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
        </LiquidCard>
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
        <LiquidCard glow="blue" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell size={16} className="text-blue-400" />
              </div>
              <span className="font-semibold text-white">{t('account.notifications') || 'Notifications'}</span>
            </div>
            <LiquidToggle
              checked={preferences.showNotifications}
              onChange={(checked) => handlePreferenceChange('showNotifications', checked)}
            />
          </div>
          <p className="text-sm text-white/40">{t('account.notificationsDesc') || 'Recevoir les notifications d\'activité'}</p>
        </LiquidCard>

        {/* Visibility */}
        <LiquidCard glow="green" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Eye size={16} className="text-green-400" />
            </div>
            <span className="font-semibold text-white">{t('account.defaultVisibility') || 'Visibilité par défaut'}</span>
          </div>
          <LiquidSelect
            value={preferences.defaultVisibility}
            onChange={(e) => handlePreferenceChange('defaultVisibility', e.target.value)}
            options={visibilityOptions}
          />
        </LiquidCard>

        {/* Auto-save */}
        <LiquidCard glow="purple" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Save size={16} className="text-purple-400" />
              </div>
              <span className="font-semibold text-white text-sm">{t('account.autoSave') || 'Sauvegarde auto.'}</span>
            </div>
            <LiquidToggle
              checked={preferences.autoSaveDrafts}
              onChange={(checked) => handlePreferenceChange('autoSaveDrafts', checked)}
            />
          </div>
          <p className="text-sm text-white/40">{t('account.autoSaveDesc') || 'Sauvegarder automatiquement les brouillons'}</p>
        </LiquidCard>

        {/* Social Sharing */}
        <LiquidCard glow="pink" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Share2 size={16} className="text-pink-400" />
              </div>
              <span className="font-semibold text-white">{t('account.socialSharing') || 'Partage social'}</span>
            </div>
            <LiquidToggle
              checked={preferences.allowSocialSharing}
              onChange={(checked) => handlePreferenceChange('allowSocialSharing', checked)}
            />
          </div>
          <p className="text-sm text-white/40">{t('account.socialSharingDesc') || 'Autoriser le partage sur réseaux sociaux'}</p>
        </LiquidCard>

        {/* Statistics */}
        <LiquidCard glow="orange" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <BarChart3 size={16} className="text-orange-400" />
              </div>
              <span className="font-semibold text-white text-sm">{t('account.stats') || 'Statistiques'}</span>
            </div>
            <LiquidToggle
              checked={preferences.showDetailedStats}
              onChange={(checked) => handlePreferenceChange('showDetailedStats', checked)}
            />
          </div>
          <p className="text-sm text-white/40">{t('account.statsDesc') || 'Afficher les statistiques détaillées'}</p>
        </LiquidCard>

        {/* Privacy */}
        <LiquidCard glow="red" padding="md">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Lock size={16} className="text-red-400" />
              </div>
              <span className="font-semibold text-white">{t('account.privacy') || 'Profil privé'}</span>
            </div>
            <LiquidToggle
              checked={preferences.privateProfile}
              onChange={(checked) => handlePreferenceChange('privateProfile', checked)}
            />
          </div>
          <p className="text-sm text-white/40">{t('account.privacyDesc') || 'Rendre mon profil privé'}</p>
        </LiquidCard>
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
        <LiquidCard glow="purple" padding="lg">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Lock size={18} className="text-violet-400" />
            Changer le mot de passe
          </h4>
          <div className="space-y-4">
            <LiquidInput
              type="password"
              placeholder="Mot de passe actuel"
            />
            <LiquidInput
              type="password"
              placeholder="Nouveau mot de passe"
            />
            <LiquidInput
              type="password"
              placeholder="Confirmer le mot de passe"
            />
            <LiquidButton variant="primary" glow="purple" fullWidth>
              Mettre à jour le mot de passe
            </LiquidButton>
          </div>
        </LiquidCard>

        {/* 2FA */}
        <LiquidCard glow="green" padding="lg">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Settings size={18} className="text-emerald-400" />
            Authentification à deux facteurs (2FA)
          </h4>
          <p className="text-white/40 text-sm mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
          <LiquidButton variant="secondary" glow="green">
            Activer 2FA
          </LiquidButton>
        </LiquidCard>

        {/* Active Sessions */}
        <LiquidCard glow="cyan" padding="lg">
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
              <LiquidBadge variant="success" size="sm">Maintenant</LiquidBadge>
            </div>
          </div>
          <LiquidButton variant="outline" glow="red" fullWidth>
            Déconnecter tous les autres appareils
          </LiquidButton>
        </LiquidCard>
      </div>
    </div>
  )
}

export default AccountPage
