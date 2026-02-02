/**
 * ProfileTab - User profile and personal information management
 * Handles: personal info, avatar, banner, social links, bio
 */

import React, { useState, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import { LiquidCard, LiquidButton, LiquidInput, LiquidTextarea, LiquidAvatar, LiquidDivider } from '@/components/ui/LiquidUI'
import { Camera, Upload } from 'lucide-react'

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
            <LiquidCard glow="purple" padding="lg">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <LiquidAvatar
                            size="xl"
                            src={user?.avatar}
                            fallback={user?.firstName?.[0] || '?'}
                            glow="purple"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadAvatarMutation.isPending}
                            className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 disabled:opacity-50 transition-colors shadow-lg"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <p className="text-sm text-white/60">
                            Recommended: Square image, at least 400x400px
                        </p>
                        <p className="text-xs text-white/40 mt-1">
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
            </LiquidCard>

            {/* Profile Form */}
            <LiquidCard glow="blue" padding="lg">
                <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">First Name</label>
                            <LiquidInput
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="John"
                            />
                            {errors.firstName && <p className="text-xs text-red-400">{errors.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Last Name</label>
                            <LiquidInput
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Doe"
                            />
                            {errors.lastName && <p className="text-xs text-red-400">{errors.lastName}</p>}
                        </div>

                        {/* Email (Read-only) */}
                        <div className="space-y-2">
                            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Email</label>
                            <LiquidInput
                                type="email"
                                value={formData.email}
                                disabled
                                className="opacity-60"
                            />
                            <p className="text-xs text-white/40">
                                Contact support to change email
                            </p>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Phone Number</label>
                            <LiquidInput
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.phoneNumber && <p className="text-xs text-red-400">{errors.phoneNumber}</p>}
                        </div>

                        {/* Website */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Website</label>
                            <LiquidInput
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                placeholder="https://example.com"
                            />
                            {errors.website && <p className="text-xs text-red-400">{errors.website}</p>}
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Bio</label>
                            <LiquidTextarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about yourself..."
                                maxLength="2000"
                                rows="4"
                            />
                            <p className="text-xs text-white/40">
                                {formData.bio.length}/2000 characters
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <LiquidButton
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        variant="primary"
                        glow="purple"
                        className="w-full"
                    >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </LiquidButton>
                </form>
            </LiquidCard>
        </div>
    )
}

export default ProfileTab
