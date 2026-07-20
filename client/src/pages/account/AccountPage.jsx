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
  Settings,
  Building2
} from 'lucide-react'
import { LiquidCard, LiquidButton, LiquidInput, LiquidSelect, LiquidToggle, LiquidTabs, LiquidAvatar, LiquidBadge } from '@/components/ui/LiquidUI'
import ProfileSection from './sections/ProfileSection'
import CompanySection from './sections/CompanySection'
import AccountTypeDisplay from '../../components/account/AccountTypeDisplay'
import UpgradeModal from '../../components/account/UpgradeModal'
import SubscriptionHistory from '../../components/account/SubscriptionHistory'
import SubscriptionManager from '../../components/account/SubscriptionManager'
import { accountService, paymentService, settingsService } from '../../services/apiService'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useToast } from '../../components/shared/ToastContainer'
import { useAccountFeatures } from '../../hooks/useAccountFeatures'

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
]

// Génère les onglets dynamiquement selon le type de compte
const getTabSections = (accountType, hasCompany) => {
  return [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
    // L'onglet Entreprise n'a de sens que pour qui possède ou rejoint une entreprise : un compte
    // gratuit n'a rien à y gérer.
    ...(hasCompany ? [{ id: 'company', label: 'Entreprise', icon: Building2 }] : []),
    { id: 'preferences', label: 'Préférences', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Lock }
  ]
}

const AccountPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, accountType, checkAuth, logout } = useStore()
  const { isProducteur } = useAccountFeatures()

  const isProfileComplete = user?.birthdate && user?.country
  // `access` est calculé côté serveur (/api/auth/me) : titulaire d'une entreprise ou employé invité.
  const hasCompany = Boolean(user?.access?.company)
  const [activeTab, setActiveTab] = useState('profile')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [language, setLanguage] = useState(() => i18n.language || 'fr')
  const [isSaved, setIsSaved] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const toast = useToast()

  // Préférences chargées depuis le serveur : en cas d'échec on garde les valeurs par défaut
  // plutôt que d'afficher des interrupteurs vides.
  useEffect(() => {
    let active = true
    settingsService.getPreferences()
      .then(prefs => { if (active) setPreferences(prefs) })
      .catch(() => { /* valeurs par défaut conservées */ })
    return () => { active = false }
  }, [])

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

  // Les préférences vivent côté serveur : en localStorage elles étaient perdues au changement
  // d'appareil. `privateProfile` a été retiré — c'était un doublon factice de `publicProfile`,
  // le vrai réglage éditable dans l'onglet Profil.
  const [preferences, setPreferences] = useState({
    defaultVisibility: 'private',
    showNotifications: true,
    autoSaveDrafts: true,
    allowSocialSharing: false,
    showDetailedStats: true
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

  const handlePreferenceChange = async (key, value) => {
    // Optimiste : le toggle réagit immédiatement, on rétablit si le serveur refuse.
    const previous = preferences
    setPreferences(prev => ({ ...prev, [key]: value }))

    try {
      const saved = await settingsService.updatePreferences({ [key]: value })
      setPreferences(saved)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (err) {
      setPreferences(previous)
      toast.error(err.message || 'Préférence non enregistrée')
    }
  }

  const handleLogout = async () => {
    // L'action du store purge `user`/`accountType` en plus d'appeler l'API : un fetch brut
    // laissait l'utilisateur en mémoire, et PrivateRoute redonnait accès à /account.
    await logout()
    navigate('/login')
  }

  const visibilityOptions = [
    { value: 'private', label: 'Privé' },
    { value: 'friends', label: 'Amis uniquement' },
    { value: 'public', label: 'Public' }
  ]

  // ✅ PROFILE INCOMPLETE CHECK
  if (!isProfileComplete) {
    return (
      <div className="min-h-full bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
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
                onClick={() => navigate('/age-verification')}
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
    <div className="bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background ambient glow effects - Apple style */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-violet-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* La page était bornée à max-w-5xl : sur un écran large, les deux tiers restaient vides et
          les formulaires s'étiraient en une seule colonne étroite. On laisse respirer jusqu'en 7xl. */}
      <div className="relative z-10 max-w-7xl mx-auto">
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
              tabs={getTabSections(accountType, hasCompany).map(tab => ({
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

                {/* Layout revisited: place Actions below the 'Fonctionnalités incluses' */}
                <div className="space-y-6">
                  {/* Main summary and features */}
                  <div>
                    <AccountTypeDisplay onUpgradeClick={() => setShowUpgradeModal(true)} />
                  </div>

                  {/* Actions block placed under the features for clearer flow on all breakpoints */}
                  <div className="bg-white/3 dark:bg-white/5 rounded-lg p-4 space-y-4 border border-white/6 md:w-2/3 lg:w-1/2 mx-auto">
                    <h3 className="text-lg font-semibold text-white">Actions</h3>

                    {/* Inline subscription manager (payment & KYC) placed here */}
                    <SubscriptionManager user={user} />

                  </div>
                </div>

                {(accountType === 'producer' || accountType === 'influencer') && (
                  <div>
                    <SubscriptionHistory />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'company' && (
              <CompanySection />
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
              <SecuritySection t={t} user={user} onStatusChange={checkAuth} />
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
            onChange={(v) => handlePreferenceChange('defaultVisibility', v)}
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

        {/* La visibilité du profil n'est volontairement pas ici : elle est éditée dans l'onglet
            Profil (champ `publicProfile`, réellement appliqué). Le doublon qui existait à cet
            endroit n'était relié à rien et laissait croire que le profil devenait privé. */}
      </div>
    </div>
  )
}

function SecuritySection({ t, user, onStatusChange }) {
  const toast = useToast()
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const [totpSetup, setTotpSetup] = useState(null) // { secret, qrCodeDataUrl }
  const [totpCode, setTotpCode] = useState('')
  const [totpLoading, setTotpLoading] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [showDisableForm, setShowDisableForm] = useState(false)

  const handleStartTotpSetup = async () => {
    setTotpLoading(true)
    try {
      const response = await fetch('/api/user/settings/2fa/setup', { method: 'POST', credentials: 'include' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la génération du QR code')
      setTotpSetup(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTotpLoading(false)
    }
  }

  const handleVerifyTotp = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Entrez le code à 6 chiffres de votre application d\'authentification')
      return
    }
    setTotpLoading(true)
    try {
      const response = await fetch('/api/user/settings/2fa/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: totpSetup.secret, token: totpCode })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Code invalide')
      toast.success('2FA activée avec succès')
      setTotpSetup(null)
      setTotpCode('')
      await onStatusChange?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTotpLoading(false)
    }
  }

  const handleDisableTotp = async () => {
    if (!disablePassword) {
      toast.error('Entrez votre mot de passe pour désactiver la 2FA')
      return
    }
    setTotpLoading(true)
    try {
      const response = await fetch('/api/user/settings/2fa/disable', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la désactivation')
      toast.success('2FA désactivée')
      setDisablePassword('')
      setShowDisableForm(false)
      await onStatusChange?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setTotpLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (pwForm.next.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    try {
      setPwLoading(true)
      const response = await fetch('/api/user/settings/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next })
      })
      if (response.ok) {
        toast.success('Mot de passe mis à jour avec succès')
        setPwForm({ current: '', next: '', confirm: '' })
      } else {
        const err = await response.json().catch(() => ({}))
        toast.error(err.error || 'Erreur lors du changement de mot de passe')
      }
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-white">{t('account.security') || 'Sécurité'}</h3>
      <p className="text-white/50 mb-6">Gérez votre mot de passe et les paramètres de sécurité de votre compte.</p>

      {/* Deux colonnes dès xl : les trois cartes tiennent côte à côte au lieu de s'empiler sur
          toute la hauteur. `items-start` évite qu'une carte courte soit étirée à la hauteur de sa
          voisine. */}
      <div className="grid gap-6 xl:grid-cols-2 items-start">
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
              value={pwForm.current}
              onChange={(e) => setPwForm(p => ({ ...p, current: e.target.value }))}
            />
            <LiquidInput
              type="password"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              value={pwForm.next}
              onChange={(e) => setPwForm(p => ({ ...p, next: e.target.value }))}
            />
            <LiquidInput
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              value={pwForm.confirm}
              onChange={(e) => setPwForm(p => ({ ...p, confirm: e.target.value }))}
            />
            <LiquidButton
              variant="primary"
              glow="purple"
              fullWidth
              onClick={handleChangePassword}
              disabled={pwLoading}
            >
              {pwLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
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

          {user?.totpEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Check size={16} /> 2FA activée
              </div>
              {!showDisableForm ? (
                <LiquidButton variant="outline" glow="red" onClick={() => setShowDisableForm(true)}>
                  Désactiver la 2FA
                </LiquidButton>
              ) : (
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <LiquidInput
                    type="password"
                    placeholder="Mot de passe actuel"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <LiquidButton variant="ghost" onClick={() => { setShowDisableForm(false); setDisablePassword('') }}>
                      Annuler
                    </LiquidButton>
                    <LiquidButton variant="primary" glow="red" onClick={handleDisableTotp} disabled={totpLoading}>
                      {totpLoading ? 'Désactivation...' : 'Confirmer la désactivation'}
                    </LiquidButton>
                  </div>
                </div>
              )}
            </div>
          ) : !totpSetup ? (
            <LiquidButton variant="secondary" glow="green" onClick={handleStartTotpSetup} disabled={totpLoading}>
              {totpLoading ? 'Génération...' : 'Activer 2FA'}
            </LiquidButton>
          ) : (
            <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-white/70">Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy...), puis entrez le code généré.</p>
              <img src={totpSetup.qrCodeDataUrl} alt="QR code 2FA" className="mx-auto rounded-lg bg-white p-2 w-48 h-48" />
              <p className="text-xs text-white/40 text-center break-all">Clé manuelle : {totpSetup.secret}</p>
              <LiquidInput
                type="text"
                placeholder="Code à 6 chiffres"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
              <div className="flex gap-2">
                <LiquidButton variant="ghost" onClick={() => { setTotpSetup(null); setTotpCode('') }}>
                  Annuler
                </LiquidButton>
                <LiquidButton variant="primary" glow="green" onClick={handleVerifyTotp} disabled={totpLoading} fullWidth>
                  {totpLoading ? 'Vérification...' : 'Confirmer et activer'}
                </LiquidButton>
              </div>
            </div>
          )}
        </LiquidCard>

        {/* La liste des sessions occupe toute la largeur : en demi-colonne elle laissait un grand
            vide à droite sous la carte 2FA, plus courte. */}
        <div className="xl:col-span-2">
          <ActiveSessionsCard />
        </div>
      </div>
    </div>
  )
}

/**
 * Sessions de connexion réelles.
 *
 * Remplace une liste qui était écrite en dur et un bouton de déconnexion sans effet — un bouton de
 * sécurité qui ne fait rien est pire que pas de bouton, l'utilisateur croit son compte protégé.
 */
function ActiveSessionsCard() {
  const toast = useToast()
  const [sessions, setSessions] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      setSessions(await settingsService.getSessions())
    } catch {
      setSessions([])
      toast.error('Impossible de charger les sessions')
    }
  }

  useEffect(() => { load() }, [])

  const handleRevokeOthers = async () => {
    setBusy(true)
    try {
      const { revoked } = await settingsService.revokeOtherSessions()
      toast.success(
        revoked > 0
          ? `${revoked} session${revoked > 1 ? 's' : ''} déconnectée${revoked > 1 ? 's' : ''}`
          : 'Aucune autre session active'
      )
      await load()
    } catch (err) {
      toast.error(err.message || 'Déconnexion impossible')
    } finally {
      setBusy(false)
    }
  }

  const handleRevokeOne = async (id) => {
    setBusy(true)
    try {
      await settingsService.revokeSession(id)
      toast.success('Session déconnectée')
      await load()
    } catch (err) {
      toast.error(err.message || 'Déconnexion impossible')
    } finally {
      setBusy(false)
    }
  }

  const otherCount = sessions?.filter(s => !s.current).length ?? 0

  return (
    <LiquidCard glow="cyan" padding="lg">
      <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
        <User size={18} className="text-cyan-400" />
        Sessions actives
      </h4>
      <p className="text-white/40 text-sm mb-4">
        Appareils actuellement connectés à votre compte
      </p>

      {sessions === null ? (
        <p className="text-white/40 text-sm py-4">Chargement…</p>
      ) : (
        <div className="space-y-2 mb-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${session.current ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                <div className="min-w-0">
                  <p className="text-white/80 text-sm truncate">{session.device}</p>
                  <p className="text-white/35 text-xs truncate">
                    {session.ipAddress || 'IP inconnue'} · {formatRelativeTime(session.lastSeenAt)}
                  </p>
                </div>
              </div>

              {session.current ? (
                <LiquidBadge variant="success" size="sm">Cet appareil</LiquidBadge>
              ) : (
                <button
                  onClick={() => handleRevokeOne(session.id)}
                  disabled={busy}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline disabled:opacity-40 flex-shrink-0"
                >
                  Déconnecter
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <LiquidButton
        variant="outline"
        glow="red"
        fullWidth
        onClick={handleRevokeOthers}
        disabled={busy || otherCount === 0}
      >
        {otherCount === 0
          ? 'Aucun autre appareil connecté'
          : `Déconnecter les ${otherCount} autres appareils`}
      </LiquidButton>
    </LiquidCard>
  )
}

/** « il y a 5 min » — repère suffisant pour reconnaître une session, sans dépendance de date. */
function formatRelativeTime(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "à l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'hier' : `il y a ${days} jours`
}

export default AccountPage
