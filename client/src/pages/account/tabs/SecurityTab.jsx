/**
 * SecurityTab - Password, 2FA, and session management
 */

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../../services/api'
import Button from '../../../components/shared/Button'
import Input from '../../../components/shared/Input'

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
    <div className="space-y-8">
      {/* Password Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Password</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-primary hover:underline"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 p-4 bg-muted rounded-lg">
            <Input
              type="password"
              placeholder="Current password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="New password (min 8 characters)"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full"
            >
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}

        {!showPasswordForm && (
          <p className="text-sm text-muted-foreground">Last changed: Never</p>
        )}
      </section>

      <div className="border-t border-border"></div>

      {/* Two-Factor Authentication */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              user?.twoFactorEnabled
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-50 text-gray-700'
            }`}>
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {!user?.twoFactorEnabled && (
          <Button
            onClick={() => setShow2FASetup(!show2FASetup)}
            variant="outline"
            className="w-full"
          >
            {show2FASetup ? 'Cancel' : 'Enable 2FA'}
          </Button>
        )}

        {user?.twoFactorEnabled && (
          <Button
            variant="destructive"
            className="w-full"
          >
            Disable 2FA
          </Button>
        )}
      </section>

      <div className="border-t border-border"></div>

      {/* Active Sessions */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage devices and sessions where you're logged in
        </p>
        <div className="space-y-2">
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Device</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleString()}
                </p>
              </div>
              <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SecurityTab
