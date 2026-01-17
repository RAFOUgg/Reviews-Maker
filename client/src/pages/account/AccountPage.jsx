import React from 'react'
import { useStore } from '../../store/useStore'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Shield, Settings } from 'lucide-react'
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'

/**
 * AccountPage - Central hub for account management
 * Routes to appropriate sub-pages based on user state
 */
export default function AccountPage() {
    const { user, isAuthenticated } = useStore()
    const navigate = useNavigate()

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <LiquidCard className="max-w-md w-full">
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Login Required</h2>
                        <p className="text-gray-300 text-sm">Please log in to access your account.</p>
                        <LiquidButton variant="primary" onClick={() => navigate('/login')} fullWidth>
                            Go to Login
                        </LiquidButton>
                    </div>
                </LiquidCard>
            </div>
        )
    }

    // Consumer: Show Settings Page
    if (user.accountType === 'consumer') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Account Settings</h1>
                        <p className="text-gray-400">Manage your account and preferences</p>
                    </div>

                    {/* Account Info */}
                    <LiquidCard>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-6 h-6 text-purple-400" />
                                Account Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Username</p>
                                    <p className="text-lg font-semibold text-white">{user.username}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-lg font-semibold text-white">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Account Type</p>
                                    <p className="text-lg font-semibold text-green-400">Amateur (Free)</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Joined</p>
                                    <p className="text-lg font-semibold text-white">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Upgrade Options */}
                    <LiquidCard>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-purple-400" />
                                Upgrade Your Account
                            </h2>
                            <p className="text-gray-400">Unlock premium features and advanced export options</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/choose-account')}
                                    className="p-4 rounded-lg border-2 border-purple-500/50 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-left"
                                >
                                    <h3 className="font-bold text-white mb-1">📱 Influencer (15.99€/mo)</h3>
                                    <p className="text-sm text-gray-400">Advanced exports and customization</p>
                                </button>
                                <button
                                    onClick={() => navigate('/choose-account')}
                                    className="p-4 rounded-lg border-2 border-purple-500/50 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition-all text-left"
                                >
                                    <h3 className="font-bold text-white mb-1">🏢 Producer (29.99€/mo)</h3>
                                    <p className="text-sm text-gray-400">Complete pro features</p>
                                </button>
                            </div>
                        </div>
                    </LiquidCard>

                    {/* Settings */}
                    <LiquidCard>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-6 h-6 text-purple-400" />
                                Preferences
                            </h2>
                            <LiquidButton
                                variant="primary"
                                onClick={() => navigate('/settings')}
                                fullWidth
                            >
                                Go to Settings
                            </LiquidButton>
                        </div>
                    </LiquidCard>
                </div>
            </div>
        )
    }

    // Paid Account (Influencer/Producer): Show Setup Page if not fully configured
    if (user.subscriptionStatus !== 'active' || user.kycStatus !== 'verified') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Redirect to AccountSetupPage logic */}
                    <LiquidCard>
                        <div className="p-8 text-center space-y-4">
                            <h2 className="text-2xl font-bold text-white">Complete Your Setup</h2>
                            <p className="text-gray-400">
                                You need to finalize your account setup to access all features.
                            </p>
                            <LiquidButton
                                variant="primary"
                                onClick={() => navigate('/account-setup')}
                                fullWidth
                            >
                                Complete Setup
                            </LiquidButton>
                        </div>
                    </LiquidCard>
                </div>
            </div>
        )
    }

    // Paid Account (fully configured): Show Account Management
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Account Management</h1>
                    <p className="text-gray-400">Manage your subscription and account settings</p>
                </div>

                {/* Account Status */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-6 h-6 text-purple-400" />
                            Account Status
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
                                <p className="text-xl font-bold text-purple-400">
                                    {user.accountType === 'producer' ? '🏢 Producer' : '📱 Influencer'}
                                </p>
                            </div>
                            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Subscription</p>
                                <p className="text-xl font-bold text-green-400">Active</p>
                            </div>
                            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">KYC Status</p>
                                <p className="text-xl font-bold text-blue-400">Verified ✓</p>
                            </div>
                        </div>
                    </div>
                </LiquidCard>

                {/* Subscription Management */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-purple-400" />
                            Subscription Management
                        </h2>
                        <div className="space-y-2 text-gray-400">
                            <p>Your subscription is currently <strong className="text-green-400">active</strong></p>
                            <p>Billing cycle: Monthly</p>
                        </div>
                        <div className="flex gap-3">
                            <LiquidButton variant="secondary" fullWidth>
                                Change Plan
                            </LiquidButton>
                            <LiquidButton variant="secondary" fullWidth>
                                Cancel Subscription
                            </LiquidButton>
                        </div>
                    </div>
                </LiquidCard>

                {/* Settings */}
                <LiquidCard>
                    <div className="p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Settings className="w-6 h-6 text-purple-400" />
                            Preferences
                        </h2>
                        <LiquidButton
                            variant="primary"
                            onClick={() => navigate('/settings')}
                            fullWidth
                        >
                            Go to Settings
                        </LiquidButton>
                    </div>
                </LiquidCard>
            </div>
        </div>
    )
}
