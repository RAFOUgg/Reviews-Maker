/**
 * AccountPage - Main container for all account/profile management
 * Supports three account types: Amateur, Producteur, Influenceur
 * with tier-differentiated tabs and features
 */

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'

// Tab components
import ProfileTab from './account/tabs/ProfileTab'
import SubscriptionTab from './account/tabs/SubscriptionTab'
import SecurityTab from './account/tabs/SecurityTab'
import {
  CompanyTab,
  KYCTab,
  PaymentTab,
  InvoicesTab,
  BankTab,
  PreferencesTab,
  SupportTab
} from './account/tabs/StubTabs'

// Layout
import TabNavigation from './account/components/TabNavigation'

const AccountPage = () => {
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saveStatus, setSaveStatus] = useState(null)

  // Account type defines available tabs
  const accountType = user?.accountType || 'Amateur'

  // Define tabs for each account type
  const getAvailableTabs = (type) => {
    const baseTabs = [
      { id: 'profile', label: 'Profile', icon: 'user' },
      { id: 'subscription', label: 'Subscription', icon: 'credit-card' },
      { id: 'preferences', label: 'Preferences', icon: 'sliders' },
      { id: 'security', label: 'Security', icon: 'lock' },
      { id: 'support', label: 'Support', icon: 'help-circle' }
    ]

    const producteurTabs = [
      { id: 'company', label: 'Company', icon: 'briefcase' },
      { id: 'kyc', label: 'KYC Verification', icon: 'check-circle' },
      { id: 'payment', label: 'Payment Methods', icon: 'credit-card' },
      { id: 'invoices', label: 'Invoices', icon: 'file-text' },
      { id: 'bank', label: 'Bank Account', icon: 'bank' }
    ]

    const influenceurTabs = [
      { id: 'payment', label: 'Payment Methods', icon: 'credit-card' },
      { id: 'invoices', label: 'Invoices', icon: 'file-text' }
    ]

    if (type === 'Producteur' || type === 'producer') {
      return [...baseTabs.slice(0, 1), ...producteurTabs, ...baseTabs.slice(1)]
    }

    if (type === 'Influenceur' || type === 'influencer') {
      return [...baseTabs.slice(0, 1), ...influenceurTabs, ...baseTabs.slice(1)]
    }

    return baseTabs
  }

  const tabs = getAvailableTabs(accountType)

  // Validate active tab is available
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab('profile')
    }
  }, [tabs, activeTab])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading account...</p>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} onStatusChange={setSaveStatus} />
      case 'subscription':
        return <SubscriptionTab user={user} />
      case 'company':
        return <CompanyTab user={user} />
      case 'kyc':
        return <KYCTab user={user} />
      case 'payment':
        return <PaymentTab user={user} />
      case 'invoices':
        return <InvoicesTab user={user} />
      case 'bank':
        return <BankTab user={user} />
      case 'preferences':
        return <PreferencesTab user={user} onStatusChange={setSaveStatus} />
      case 'security':
        return <SecurityTab user={user} onStatusChange={setSaveStatus} />
      case 'support':
        return <SupportTab user={user} />
      default:
        return <ProfileTab user={user} onStatusChange={setSaveStatus} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-primary"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                {user?.firstName?.[0] || user?.email?.[0] || '?'}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
              </h1>
              <p className="text-muted-foreground capitalize">
                {accountType} Account • Joined{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Recently'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Save Status Message */}
        {saveStatus && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              saveStatus.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {saveStatus.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
