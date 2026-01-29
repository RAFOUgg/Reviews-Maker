import { useState, useEffect } from 'react'
import { useStore } from '../store'

/**
 * Hook pour gérer les données du profil utilisateur
 * Récupère, edite et sauvegarde les infos personnelles
 */
export const useProfileData = () => {
  const { user, setUser } = useStore()

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    country: '',
    bio: '',
    website: '',
    avatar: null,
    publicProfile: true,
    // Champs entreprise (Producteur/Influenceur)
    companyName: '',
    siret: '',
    billingAddress: '',
    vatNumber: ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Initialiser avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        country: user.country || '',
        bio: user.bio || '',
        website: user.website || '',
        avatar: user.avatar || null,
        publicProfile: user.publicProfile ?? true,
        // Champs entreprise
        companyName: user.companyName || '',
        siret: user.siret || '',
        billingAddress: user.billingAddress || '',
        vatNumber: user.vatNumber || ''
      })
    }
    setIsLoadingProfile(false)
  }, [user])

  /**
   * Met à jour un champ du profil
   */
  const updateField = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  /**
   * Sauvegarde le profil via l'API
   */
  const saveProfile = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/account/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          country: profileData.country,
          bio: profileData.bio,
          website: profileData.website,
          publicProfile: profileData.publicProfile,
          // Champs entreprise
          companyName: profileData.companyName,
          siret: profileData.siret,
          billingAddress: profileData.billingAddress,
          vatNumber: profileData.vatNumber
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la sauvegarde')
      }

      const updatedUser = await response.json()

      // Mettre à jour le store
      setUser(updatedUser)

      setSaveMessage('✅ Profil mis à jour avec succès')
      setIsEditing(false)

      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Profile save error:', error)
      setSaveMessage(`❌ ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Upload d'avatar
   */
  const uploadAvatar = async (file) => {
    if (!file) return

    setIsSaving(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const response = await fetch('/api/account/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur upload avatar')
      }

      const data = await response.json()
      setProfileData(prev => ({
        ...prev,
        avatar: data.avatar
      }))

      setUser({
        ...user,
        avatar: data.avatar
      })

      setSaveMessage('✅ Avatar mis à jour')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (error) {
      console.error('Avatar upload error:', error)
      setSaveMessage(`❌ ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Annule les modifications
   */
  const cancelEdit = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      country: user?.country || '',
      bio: user?.bio || '',
      website: user?.website || '',
      avatar: user?.avatar || null,
      publicProfile: user?.publicProfile ?? true,
      // Champs entreprise
      companyName: user?.companyName || '',
      siret: user?.siret || '',
      billingAddress: user?.billingAddress || '',
      vatNumber: user?.vatNumber || ''
    })
    setIsEditing(false)
    setSaveMessage('')
  }

  return {
    profileData,
    setProfileData,
    updateField,
    saveProfile,
    uploadAvatar,
    cancelEdit,
    isEditing,
    setIsEditing,
    isSaving,
    saveMessage,
    isLoadingProfile
  }
}
