/**
 * SecurityTab - Password, 2FA, and session management
 */

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../../services/api'
import { LiquidCard, LiquidButton, LiquidInput, LiquidBadge, LiquidDivider } from '@/components/ui/LiquidUI'
import { Lock, Shield, Monitor, KeyRound } from 'lucide-react'

const SecurityTab = ({ user, onStatusChange }) => {
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [show2FASetup, setShow2FASetup] = useState(false)

    // Mutation: Change password
    const changePasswordMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/user/settings/change-password', data)
            return response.data
        },
        onSuccess: () => {
            onStatusChange({
                type: 'success',
                message: 'Password changed successfully'
            })
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setShowPasswordForm(false)
        },
        onError: (error) => {
            onStatusChange({
                type: 'error',
                message: error.response?.data?.error || 'Failed to change password'
            })
        }
    })

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            onStatusChange({
                type: 'error',
                message: 'Passwords do not match'
            })
            return
        }
        changePasswordMutation.mutate(passwordData)
    }

    return (
        <div className="space-y-6">
            {/* Password Section */}
            <LiquidCard glow="purple" padding="lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Password
                    </h3>
                    <LiquidButton
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        variant="ghost"
                        size="sm"
                    >
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </LiquidButton>
                </div>

                {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <LiquidInput
                            type="password"
                            placeholder="Current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                        />
                        <LiquidInput
                            type="password"
                            placeholder="New password (min 8 characters)"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                        />
                        <LiquidInput
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                        />
                        <LiquidButton
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                            variant="primary"
                            glow="green"
                            className="w-full"
                        >
                            {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                        </LiquidButton>
                    </form>
                )}

                {!showPasswordForm && (
                    <p className="text-sm text-white/50">Last changed: Never</p>
                )}
            </LiquidCard>

            {/* Two-Factor Authentication */}
            <LiquidCard glow="cyan" padding="lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-white/50 mt-1">
                            Add an extra layer of security to your account
                        </p>
                    </div>
                    <div className="text-right">
                        <LiquidBadge variant={user?.twoFactorEnabled ? 'success' : 'default'}>
                            {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </LiquidBadge>
                    </div>
                </div>

                {!user?.twoFactorEnabled && (
                    <LiquidButton
                        onClick={() => setShow2FASetup(!show2FASetup)}
                        variant="secondary"
                        className="w-full"
                    >
                        <KeyRound className="w-4 h-4 mr-2" />
                        {show2FASetup ? 'Cancel' : 'Enable 2FA'}
                    </LiquidButton>
                )}

                {user?.twoFactorEnabled && (
                    <LiquidButton
                        variant="danger"
                        className="w-full"
                    >
                        Disable 2FA
                    </LiquidButton>
                )}
            </LiquidCard>

            {/* Active Sessions */}
            <LiquidCard glow="blue" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Monitor className="w-5 h-5" />
                    Active Sessions
                </h3>
                <p className="text-sm text-white/50 mb-4">
                    Manage devices and sessions where you're logged in
                </p>
                <div className="space-y-2">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-white">Current Device</p>
                                <p className="text-xs text-white/40 mt-1">
                                    {new Date().toLocaleString()}
                                </p>
                            </div>
                            <LiquidBadge variant="success" size="sm">
                                Active
                            </LiquidBadge>
                        </div>
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}

export default SecurityTab
