/**
 * ProfileTab - User profile and personal information management
 * Handles: personal info, avatar, banner, social links, bio
 */

import React, { useState, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'

const ProfileTab = ({ user, onStatusChange }) => {
  const fileInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    website: user?.website || '',
    bio: user?.bio || ''
  })

  const [errors, setErrors] = useState({})

  // Mutation: Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/user/profile', data)
      return response.data
    },
    onSuccess: () => {
      onStatusChange({
        type: 'success',
        message: 'Profile updated successfully'
      })
    },
    onError: (error) => {
      onStatusChange({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update profile'
      })
    }
  })

  // Mutation: Upload avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: () => {
      onStatusChange({
        type: 'success',
        message: 'Avatar updated successfully'
      })
    },
    onError: (error) => {
      onStatusChange({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload avatar'
      })
    }
  })

  // Mutation: Upload banner
  const uploadBannerMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('banner', file)
      const response = await api.post('/user/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: () => {
      onStatusChange({
        type: 'success',
        message: 'Banner updated successfully'
      })
    },
    onError: (error) => {
      onStatusChange({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload banner'
      })
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    const newErrors = {}
    if (!formData.firstName) newErrors.firstName = 'First name required'
    if (!formData.lastName) newErrors.lastName = 'Last name required'
    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number'
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Invalid URL (must start with http:// or https://)'
    }
    if (formData.bio && formData.bio.length > 2000) {
      newErrors.bio = 'Bio must be less than 2000 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    updateProfileMutation.mutate(formData)
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        onStatusChange({
          type: 'error',
          message: 'File size must be less than 5MB'
        })
        return
      }
      uploadAvatarMutation.mutate(file)
    }
  }

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        onStatusChange({
          type: 'error',
          message: 'File size must be less than 5MB'
        })
        return
      }
      uploadBannerMutation.mutate(file)
    }
  }

  return (
    <div className="space-y-8">
      {/* Avatar Upload */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {user?.firstName?.[0] || '?'}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Recommended: Square image, at least 400x400px
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max file size: 5MB (JPEG, PNG, WebP)
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </section>

      {/* Divider */}
      <div className="border-t border-border"></div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              error={errors.firstName}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              error={errors.lastName}
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Contact support to change email
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1 (555) 000-0000"
              error={errors.phoneNumber}
            />
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Website</label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              error={errors.website}
            />
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              maxLength="2000"
              rows="4"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.bio.length}/2000 characters
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="w-full"
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}

export default ProfileTab
