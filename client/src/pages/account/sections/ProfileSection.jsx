import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit2, Save, X, Upload, Mail, User, Globe, FileText, Link as LinkIcon, Building2, MapPin, CreditCard, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'
import { useProfileData } from '../../../hooks/useProfileData'
import { useStore } from '../../../store/useStore'
import { isValidSiretFormat } from '../../../utils/siret'
import { LiquidCard, LiquidButton, LiquidInput, LiquidTextarea, LiquidSelect, LiquidToggle, LiquidAvatar, LiquidBadge } from '@/components/ui/LiquidUI'

const BUSINESS_TYPES = [
  { value: 'farm', label: '🌾 Farm / Culture' },
  { value: 'laboratory', label: '🧪 Laboratoire' },
  { value: 'extractor', label: '⚗️ Extraction' },
  { value: 'manufacturer', label: '🏭 Fabricant' },
  { value: 'distributor', label: '🚚 Distributeur' },
  { value: 'other', label: 'Autre' }
]

/**
 * ProfileSection - Gestion des informations personnelles
 * Affiche et édite: avatar, nom, email, pays, bio, website, profil public
 */
export default function ProfileSection() {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const verificationDocInputRef = useRef(null)
  const { accountType } = useStore()

  // Comptes payants ont accès aux données entreprise
  const isPaidAccount = accountType === 'producteur' || accountType === 'influenceur' || accountType === 'producer' || accountType === 'influencer'

  const [siretCheck, setSiretCheck] = useState(null) // { validFormat, found, active, officialName }
  const [checkingSiret, setCheckingSiret] = useState(false)
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)

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

  const handleSiretBlur = async () => {
    const siret = profileData.siret
    if (!siret) {
      setSiretCheck(null)
      return
    }

    if (!isValidSiretFormat(siret)) {
      setSiretCheck({ validFormat: false })
      return
    }

    setCheckingSiret(true)
    try {
      const response = await fetch('/api/account/verify-siret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ siret })
      })
      const data = await response.json()
      setSiretCheck(data)
    } catch (error) {
      setSiretCheck(null)
    } finally {
      setCheckingSiret(false)
    }
  }

  const handleVerificationDocSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingDoc(true)
    const formData = new FormData()
    formData.append('document', file)

    try {
      const response = await fetch('/api/account/verification-document', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur upload document')
      }
      const data = await response.json()
      updateField('verificationDoc', data.documentUrl)
    } catch (error) {
      alert(error.message)
    } finally {
      setIsUploadingDoc(false)
    }
  }

  const handleRequestVerification = async () => {
    setIsSubmittingVerification(true)
    try {
      const response = await fetch('/api/account/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyName: profileData.companyName,
          businessType: profileData.businessType,
          siret: profileData.siret,
          country: profileData.country || 'FR',
          documentUrl: profileData.verificationDoc
        })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la demande de vérification')
      }
      updateField('verificationStatus', data.profile.verificationStatus)
    } catch (error) {
      alert(error.message)
    } finally {
      setIsSubmittingVerification(false)
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
              onChange={(v) => updateField('country', v)}
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
              {accountType === 'producteur' || accountType === 'producer' ? '🌾 Producteur' : '⭐ Influenceur'}
            </LiquidBadge>
            {profileData.verificationStatus === 'verified' && (
              <LiquidBadge variant="success" size="sm">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Vérifié</span>
              </LiquidBadge>
            )}
            {profileData.verificationStatus === 'pending' && (
              <LiquidBadge variant="warning" size="sm">
                <span className="flex items-center gap-1"><ShieldQuestion className="w-3 h-3" /> En attente</span>
              </LiquidBadge>
            )}
            {profileData.verificationStatus === 'rejected' && (
              <LiquidBadge variant="danger" size="sm">
                <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Rejeté</span>
              </LiquidBadge>
            )}
          </h3>
          <p className="text-xs text-white/50 mb-4">
            Ces informations sont utilisées pour la facturation, les documents légaux, et permettent
            de vous identifier comme producteur via le bouton "Ma production" dans vos reviews.
          </p>

          {profileData.verificationStatus === 'rejected' && profileData.verificationRejectionReason && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              Motif du rejet : {profileData.verificationRejectionReason}
            </div>
          )}

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

            {/* Type d'entreprise */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                Type d'entreprise
              </label>
              <LiquidSelect
                value={profileData.businessType || 'farm'}
                onChange={(v) => updateField('businessType', v)}
                disabled={!isEditing}
                options={BUSINESS_TYPES}
              />
            </div>

            {/* SIRET / Registre commerce */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                SIRET / Registre Commerce
              </label>
              <LiquidInput
                value={profileData.siret || ''}
                onChange={(e) => { updateField('siret', e.target.value); setSiretCheck(null) }}
                onBlur={handleSiretBlur}
                disabled={!isEditing}
                placeholder="Ex: 123 456 789 00012"
              />
              {checkingSiret && (
                <p className="text-xs text-white/40">Vérification en cours...</p>
              )}
              {!checkingSiret && siretCheck && (
                <p className={`text-xs flex items-center gap-1 ${
                  siretCheck.validFormat && siretCheck.found ? 'text-green-400'
                    : siretCheck.validFormat && siretCheck.found === null ? 'text-white/40'
                    : 'text-red-400'
                }`}>
                  {!siretCheck.validFormat && '❌ Format de SIRET invalide'}
                  {siretCheck.validFormat && siretCheck.found === true && `✅ ${siretCheck.officialName || 'Entreprise trouvée'}${siretCheck.active === false ? ' (fermée)' : ''}`}
                  {siretCheck.validFormat && siretCheck.found === false && '⚠️ Aucune entreprise trouvée pour ce SIRET'}
                  {siretCheck.validFormat && siretCheck.found === null && 'ℹ️ Format valide (vérification indisponible pour le moment)'}
                </p>
              )}
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

            {/* Document justificatif */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Document justificatif (Kbis, extrait SIRENE...)
              </label>
              <input
                ref={verificationDocInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleVerificationDocSelect}
                disabled={!isEditing || isUploadingDoc}
                className="hidden"
              />
              <LiquidButton
                variant="ghost"
                size="sm"
                disabled={!isEditing || isUploadingDoc}
                onClick={() => verificationDocInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingDoc ? 'Envoi...' : profileData.verificationDoc ? 'Document envoyé ✓' : 'Envoyer un document'}
              </LiquidButton>
            </div>
          </div>

          {profileData.verificationStatus !== 'verified' && (
            <div className="mt-4 flex justify-end">
              <LiquidButton
                variant="primary"
                glow="amber"
                disabled={isSubmittingVerification || !profileData.companyName || profileData.verificationStatus === 'pending'}
                onClick={handleRequestVerification}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {profileData.verificationStatus === 'pending'
                  ? 'Demande en attente de traitement'
                  : isSubmittingVerification ? 'Envoi...' : 'Envoyer ma demande de vérification'}
              </LiquidButton>
            </div>
          )}
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
