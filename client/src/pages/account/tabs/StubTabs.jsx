/**
 * Stub tabs for Account Page - Phase 1
 * These are placeholders that will be expanded in future phases
 */

import React from 'react'
import Button from '../../../components/shared/Button'

// Preferences Tab
export const PreferencesTab = ({ user, onStatusChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {['Light', 'Dark', 'System'].map(theme => (
            <button
              key={theme}
              className={`p-4 rounded-lg border-2 text-center font-medium ${
                user?.theme === theme.toLowerCase()
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4">Language</h3>
        <select
          defaultValue={user?.language || 'en'}
          className="w-full px-4 py-2 border border-border rounded-lg"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <div className="border-t border-border pt-6">
        <Button className="w-full">Save Preferences</Button>
      </div>
    </div>
  )
}

// Company Tab (Producteur only)
export const CompanyTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <p className="text-muted-foreground mb-4">
          Manage your company details for invoicing and verification
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Company Name"
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
        <input
          type="text"
          placeholder="Registration Number (SIRET)"
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
        <input
          type="text"
          placeholder="Business Type"
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
        <Button className="w-full">Save Company Info</Button>
      </div>
    </div>
  )
}

// KYC Tab (Producteur only)
export const KYCTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">KYC Verification</h3>
        <p className="text-muted-foreground mb-4">
          Complete your KYC verification to unlock Producteur features
        </p>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Status:</strong> {user?.kycStatus === 'verified' ? '✓ Verified' : 'Pending'}
        </p>
      </div>

      <Button className="w-full">Upload Documents</Button>
    </div>
  )
}

// Payment Tab
export const PaymentTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <p className="text-muted-foreground mb-4">
          Add or manage your payment methods
        </p>
      </div>

      <div className="text-center py-8 text-muted-foreground">
        <p>No payment methods yet</p>
      </div>

      <Button className="w-full">Add Payment Method</Button>
    </div>
  )
}

// Invoices Tab
export const InvoicesTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Invoices</h3>
        <p className="text-muted-foreground mb-4">
          View and download your invoices
        </p>
      </div>

      <div className="text-center py-8 text-muted-foreground">
        <p>No invoices yet</p>
      </div>
    </div>
  )
}

// Bank Tab (Producteur only)
export const BankTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Bank Account</h3>
        <p className="text-muted-foreground mb-4">
          Add your bank account for invoice generation and payments
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Account Holder Name"
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
        <input
          type="text"
          placeholder="IBAN"
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
        <input
          type="text"
          placeholder="SWIFT/BIC"
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
        <Button className="w-full">Save Bank Account</Button>
      </div>
    </div>
  )
}

// Support Tab
export const SupportTab = ({ user }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
        <p className="text-muted-foreground">
          Get help with your account and explore resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/docs"
          className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition"
        >
          <h4 className="font-semibold mb-2">Documentation</h4>
          <p className="text-sm text-muted-foreground">
            Learn how to use Reviews-Maker
          </p>
        </a>
        <a
          href="/faq"
          className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition"
        >
          <h4 className="font-semibold mb-2">FAQ</h4>
          <p className="text-sm text-muted-foreground">
            Answers to common questions
          </p>
        </a>
        <a
          href="/contact"
          className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition"
        >
          <h4 className="font-semibold mb-2">Contact Support</h4>
          <p className="text-sm text-muted-foreground">
            Get in touch with our team
          </p>
        </a>
        <div className="p-4 border border-border rounded-lg">
          <h4 className="font-semibold mb-2">Status Page</h4>
          <p className="text-sm text-muted-foreground">
            Check system status
          </p>
        </div>
      </div>
    </div>
  )
}
