import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit2, Save, X, Upload, Mail, User, Globe, FileText, Link as LinkIcon } from 'lucide-react'
import { useProfileData } from '../../../hooks/useProfileData'

/**
 * ProfileSection - Gestion des informations personnelles
 * Affiche et édite: avatar, nom, email, pays, bio, website, profil public
 */
export default function ProfileSection() {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  
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
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <>
              <button
                onClick={cancelEdit}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                onClick={saveProfile}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message de statut */}
      {saveMessage && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          saveMessage.includes('✅')
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Card Avatar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div
              onClick={handleAvatarClick}
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold text-white ${
                isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
              }`}
            >
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profileData.username?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            {isEditing && (
              <div
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-full cursor-pointer transition-colors"
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
            <p className="text-gray-400 text-sm">Avatar</p>
            <p className="text-white font-semibold">{profileData.username}</p>
          </div>
        </div>
      </div>

      {/* Card Infos de base */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Infos de Base
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Username (read-only) */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={profileData.username}
              disabled
              className="w-full px-4 py-3 bg-gray-700/50 text-gray-400 rounded-lg border border-gray-600/50 disabled:opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Non modifiable</p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-4 py-3 bg-gray-700/50 text-gray-400 rounded-lg border border-gray-600/50 disabled:opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Changez-le dans les paramètres de sécurité</p>
          </div>

          {/* Prénom */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Prénom
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              disabled={!isEditing}
              placeholder="Optionnel"
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isEditing
                  ? 'bg-gray-700 border-purple-500/50 text-white focus:border-purple-500 outline-none'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Nom
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              disabled={!isEditing}
              placeholder="Optionnel"
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isEditing
                  ? 'bg-gray-700 border-purple-500/50 text-white focus:border-purple-500 outline-none'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Pays */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Pays
            </label>
            <select
              value={profileData.country}
              onChange={(e) => updateField('country', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isEditing
                  ? 'bg-gray-700 border-purple-500/50 text-white focus:border-purple-500 outline-none'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 cursor-not-allowed'
              }`}
            >
              <option value="">Sélectionnez un pays</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card Profil public */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Profil Public
        </h3>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Bio (max 500 caractères)
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => updateField('bio', e.target.value.slice(0, 500))}
            disabled={!isEditing}
            placeholder="Décrivez-vous en quelques mots..."
            rows={4}
            className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
              isEditing
                ? 'bg-gray-700 border-purple-500/50 text-white focus:border-purple-500 outline-none'
                : 'bg-gray-700/50 border-gray-600/50 text-gray-300 cursor-not-allowed'
            }`}
          />
          <p className="text-xs text-gray-500">{profileData.bio.length}/500</p>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Site Web (optionnel)
          </label>
          <input
            type="url"
            value={profileData.website}
            onChange={(e) => updateField('website', e.target.value)}
            disabled={!isEditing}
            placeholder="https://example.com"
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              isEditing
                ? 'bg-gray-700 border-purple-500/50 text-white focus:border-purple-500 outline-none'
                : 'bg-gray-700/50 border-gray-600/50 text-gray-300 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Profil public toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <div className="space-y-1">
            <p className="text-white font-medium">Rendre le profil public</p>
            <p className="text-xs text-gray-400">Votre profil sera visible dans la galerie publique</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={profileData.publicProfile}
              onChange={(e) => updateField('publicProfile', e.target.checked)}
              disabled={!isEditing}
              className="sr-only peer"
            />
            <div className={`absolute inset-0 rounded-full transition-colors ${
              profileData.publicProfile
                ? 'bg-purple-600'
                : 'bg-gray-600'
            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            />
            <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full transition-transform ${
              profileData.publicProfile ? 'translate-x-6' : ''
            }`}
            />
          </label>
        </div>
      </div>

      {/* Infos supplémentaires */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50 space-y-3">
        <p className="text-xs text-gray-500 text-center">
          Compte créé le {new Date(new Date().toISOString()).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}
