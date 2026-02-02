import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit2, Save, X, Upload, Mail, User, Globe, FileText, Link as LinkIcon, Building2, MapPin, CreditCard } from 'lucide-react'
import { useProfileData } from '../../../hooks/useProfileData'
import { useStore } from '../../../store/useStore'
import { LiquidCard, LiquidButton, LiquidInput, LiquidTextarea, LiquidSelect, LiquidToggle, LiquidAvatar, LiquidBadge } from '@/components/ui/LiquidUI'

/**
 * ProfileSection - Gestion des informations personnelles
 * Affiche et édite: avatar, nom, email, pays, bio, website, profil public
 */
export default function ProfileSection() {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const { accountType } = useStore()

  // Comptes payants ont accès aux données entreprise
  const isPaidAccount = accountType === 'producteur' || accountType === 'influenceur'

  const {
    profileData,
    updateField,
    saveProfile,
    uploadAvatar,
    cancelEdit,
    isEditing,
    setIsEditing,
    isSaving,
    saveMessage,
    isLoadingProfile
  } = useProfileData()

  const COUNTRIES = [
    { code: 'FR', name: 'France' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'États-Unis' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'ES', name: 'Espagne' },
    { code: 'IT', name: 'Italie' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'AU', name: 'Australie' },
    { code: 'NZ', name: 'Nouvelle-Zélande' }
  ]

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatar(file)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec boutons action */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6" />
          Informations Personnelles
        </h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <LiquidButton
              onClick={() => setIsEditing(true)}
              variant="primary"
              glow="blue"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Modifier
            </LiquidButton>
          ) : (
            <>
              <LiquidButton
                onClick={cancelEdit}
                disabled={isSaving}
                variant="ghost"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </LiquidButton>
              <LiquidButton
                onClick={saveProfile}
                disabled={isSaving}
                variant="primary"
                glow="green"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </LiquidButton>
            </>
          )}
        </div>
      </div>

      {/* Message de statut */}
      {saveMessage && (
        <div className={`p-4 rounded-xl text-sm font-medium ${saveMessage.includes('✅')
          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
          : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
          {saveMessage}
        </div>
      )}

      {/* Card Avatar */}
      <LiquidCard glow="purple" padding="lg">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <LiquidAvatar
              size="xl"
              src={profileData.avatar}
              fallback={profileData.username?.charAt(0)?.toUpperCase() || 'U'}
              glow="purple"
              onClick={handleAvatarClick}
              className={isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
            />
            {isEditing && (
              <div
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer transition-colors shadow-lg"
              >
                <Upload className="w-5 h-5 text-white" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-white/40 text-sm">Avatar</p>
            <p className="text-white font-semibold">{profileData.username}</p>
          </div>
        </div>
      </LiquidCard>

      {/* Card Infos de base */}
      <LiquidCard glow="blue" padding="lg">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5" />
          Infos de Base
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Username (read-only) */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
              Nom d'utilisateur
            </label>
            <LiquidInput
              value={profileData.username}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-white/40">Non modifiable</p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
              Email
            </label>
            <LiquidInput
              type="email"
              value={profileData.email}
              disabled
              className="opacity-60"
            />
            <p className="text-xs text-white/40">Changez-le dans les paramètres de sécurité</p>
          </div>

          {/* Prénom */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
              Prénom
            </label>
            <LiquidInput
              value={profileData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              disabled={!isEditing}
              placeholder="Optionnel"
            />
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
              Nom
            </label>
            <LiquidInput
              value={profileData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              disabled={!isEditing}
              placeholder="Optionnel"
            />
          </div>

          {/* Pays */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
              Pays
            </label>
            <LiquidSelect
              value={profileData.country}
              onChange={(e) => updateField('country', e.target.value)}
              disabled={!isEditing}
              options={[
                { value: '', label: 'Sélectionnez un pays' },
                ...COUNTRIES.map((country) => ({
                  value: country.code,
                  label: country.name
                }))
              ]}
            />
          </div>
        </div>
      </LiquidCard>

      {/* Card Profil public */}
      <LiquidCard glow="cyan" padding="lg">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5" />
          Profil Public
        </h3>

        {/* Bio */}
        <div className="space-y-2 mb-4">
          <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
            Bio (max 500 caractères)
          </label>
          <LiquidTextarea
            value={profileData.bio}
            onChange={(e) => updateField('bio', e.target.value.slice(0, 500))}
            disabled={!isEditing}
            placeholder="Décrivez-vous en quelques mots..."
            rows={4}
          />
          <p className="text-xs text-white/40">{profileData.bio.length}/500</p>
        </div>

        {/* Website */}
        <div className="space-y-2 mb-4">
          <label className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Site Web (optionnel)
          </label>
          <LiquidInput
            type="url"
            value={profileData.website}
            onChange={(e) => updateField('website', e.target.value)}
            disabled={!isEditing}
            placeholder="https://example.com"
          />
        </div>

        {/* Profil public toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="space-y-1">
            <p className="text-white font-medium">Rendre le profil public</p>
            <p className="text-xs text-white/50">Votre profil sera visible dans la galerie publique</p>
          </div>
          <LiquidToggle
            checked={profileData.publicProfile}
            onChange={(e) => updateField('publicProfile', e.target.checked)}
            disabled={!isEditing}
          />
        </div>
      </LiquidCard>

      {/* Card Données Entreprise (Producteurs et Influenceurs uniquement) */}
      {isPaidAccount && (
        <LiquidCard glow="amber" padding="lg">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5" />
            Données Entreprise
            <LiquidBadge variant="premium" size="sm">
              {accountType === 'producteur' ? '🌾 Producteur' : '⭐ Influenceur'}
            </LiquidBadge>
          </h3>
          <p className="text-xs text-white/50 mb-4">
            Ces informations sont utilisées pour la facturation et les documents légaux.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Nom d'entreprise */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                Nom de l'entreprise
              </label>
              <LiquidInput
                value={profileData.companyName || ''}
                onChange={(e) => updateField('companyName', e.target.value)}
                disabled={!isEditing}
                placeholder="Votre entreprise"
              />
            </div>

            {/* SIRET / Registre commerce */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                SIRET / Registre Commerce
              </label>
              <LiquidInput
                value={profileData.siret || ''}
                onChange={(e) => updateField('siret', e.target.value)}
                disabled={!isEditing}
                placeholder="Ex: 123 456 789 00012"
              />
            </div>

            {/* Adresse de facturation */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse de facturation
              </label>
              <LiquidTextarea
                value={profileData.billingAddress || ''}
                onChange={(e) => updateField('billingAddress', e.target.value)}
                disabled={!isEditing}
                placeholder="Adresse complète (rue, code postal, ville, pays)"
                rows={3}
              />
            </div>

            {/* TVA si applicable */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                N° TVA Intracommunautaire (optionnel)
              </label>
              <LiquidInput
                value={profileData.vatNumber || ''}
                onChange={(e) => updateField('vatNumber', e.target.value)}
                disabled={!isEditing}
                placeholder="Ex: FR12345678901"
              />
            </div>
          </div>
        </LiquidCard>
      )}

      {/* Infos supplémentaires */}
      <LiquidCard padding="md" className="text-center">
        <p className="text-xs text-white/40">
          Compte créé le {new Date(new Date().toISOString()).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </LiquidCard>
    </div>
  )
}
