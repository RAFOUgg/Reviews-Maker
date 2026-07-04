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
    businessType: 'farm',
    siret: '',
    billingAddress: '',
    vatNumber: '',
    verificationStatus: 'none',
    verificationRejectionReason: '',
    verificationDoc: null
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Initialiser avec les données de l'utilisateur
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        country: user.country || '',
        bio: user.bio || '',
        website: user.website || '',
        avatar: user.avatar || null,
        publicProfile: user.publicProfile ?? true,
        // Champs entreprise (écrasés ensuite par /producer-profile si dispo)
        companyName: user.companyName || prev.companyName,
        siret: user.siret || prev.siret,
        billingAddress: user.billingAddress || prev.billingAddress,
        vatNumber: user.vatNumber || prev.vatNumber
      }))
    }
    setIsLoadingProfile(false)
  }, [user])

  // Charger le profil producteur (nom d'entreprise, SIRET, statut de vérification)
  useEffect(() => {
    const accountType = user?.accountType
    if (accountType !== 'producer' && accountType !== 'producteur' && accountType !== 'influencer' && accountType !== 'influenceur') {
      return
    }

    fetch('/api/account/producer-profile', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        setProfileData(prev => ({
          ...prev,
          companyName: data.companyName || prev.companyName,
          businessType: data.businessType || prev.businessType,
          siret: data.siret || prev.siret,
          verificationStatus: data.verificationStatus || 'none',
          verificationRejectionReason: data.verificationRejectionReason || '',
          verificationDoc: data.verificationDoc || null
        }))
      })
      .catch(() => {})
  }, [user?.accountType])

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
          businessType: profileData.businessType,
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
    setProfileData(prev => ({
      ...prev,
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      country: user?.country || '',
      bio: user?.bio || '',
      website: user?.website || '',
      avatar: user?.avatar || null,
      publicProfile: user?.publicProfile ?? true,
      // Champs entreprise (businessType/verificationStatus restent tels que chargés depuis /producer-profile)
      companyName: user?.companyName || prev.companyName,
      siret: user?.siret || prev.siret,
      billingAddress: user?.billingAddress || prev.billingAddress,
      vatNumber: user?.vatNumber || prev.vatNumber
    }))
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
