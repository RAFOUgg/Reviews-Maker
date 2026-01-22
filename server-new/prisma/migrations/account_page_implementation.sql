-- Account Page Implementation - Prisma Migration
-- This migration adds all necessary fields and models for the full Account Page system

-- ==================== USER MODEL UPDATES ====================
-- Add missing fields to users table

ALTER TABLE users ADD COLUMN firstName VARCHAR(100);
ALTER TABLE users ADD COLUMN lastName VARCHAR(100);
ALTER TABLE users ADD COLUMN phoneNumber VARCHAR(20);
ALTER TABLE users ADD COLUMN website VARCHAR(255);
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'system'; -- 'light' | 'dark' | 'system'
ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en'; -- 'en' | 'fr' | 'es' | etc.
ALTER TABLE users ADD COLUMN avatar VARCHAR(255); -- URL to avatar image
ALTER TABLE users ADD COLUMN bannerImage VARCHAR(255); -- URL to banner image
ALTER TABLE users ADD COLUMN notificationEmail BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN marketingEmails BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN twoFactorEnabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN twoFactorMethod VARCHAR(20); -- 'authenticator' | 'sms' | null
ALTER TABLE users ADD COLUMN lastLogin DATETIME;
ALTER TABLE users ADD COLUMN lastPasswordChange DATETIME;
ALTER TABLE users ADD COLUMN profileCompleteness INT DEFAULT 0; -- 0-100%
ALTER TABLE users ADD COLUMN deletionRequestedAt DATETIME;
ALTER TABLE users ADD COLUMN deletionScheduledFor DATETIME;

-- ==================== COMPANY MODEL ====================
-- For Producteur accounts (business information)

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  companyName TEXT NOT NULL,
  registrationNumber TEXT UNIQUE, -- SIRET (France), EIN (USA), etc.
  registrationType VARCHAR(20), -- 'SIRET' | 'EIN' | 'ABN' | 'HST' | etc.
  country VARCHAR(2), -- ISO code
  address TEXT,
  city VARCHAR(100),
  postalCode VARCHAR(20),
  taxId TEXT, -- Tax/VAT number
  businessType VARCHAR(50), -- 'producer' | 'distributor' | 'retailer' | 'laboratory'
  website VARCHAR(255),
  phoneNumber VARCHAR(20),
  logoUrl VARCHAR(255),
  verificationStatus VARCHAR(20) DEFAULT 'unverified', -- 'unverified' | 'pending' | 'verified' | 'rejected'
  verificationDocuments TEXT, -- JSON: [{documentType, url, uploadedAt}]
  verificationRejectionReason TEXT,
  verificationReviewedAt DATETIME,
  verificationReviewedBy TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verificationReviewedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_registrationNumber (registrationNumber),
  INDEX idx_verificationStatus (verificationStatus)
);

-- ==================== PAYMENT METHOD MODEL ====================
-- Stripe payment methods for subscriptions

CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  
  -- Stripe card info (hashed)
  stripePaymentMethodId TEXT UNIQUE,
  cardBrand VARCHAR(20), -- 'visa' | 'mastercard' | 'amex' | 'discover'
  cardLast4 VARCHAR(4),
  cardExp DATETIME, -- Card expiration date
  
  -- Billing address
  billingName TEXT,
  billingEmail VARCHAR(255),
  billingAddress TEXT,
  billingCity VARCHAR(100),
  billingPostalCode VARCHAR(20),
  billingCountry VARCHAR(2),
  
  -- Status
  isDefault BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  
  -- Tracking
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_stripePaymentMethodId (stripePaymentMethodId),
  INDEX idx_isDefault (isDefault)
);

-- ==================== KYC DOCUMENT MODEL ====================
-- Know Your Customer documents for verification (Producteur)

CREATE TABLE IF NOT EXISTS kyc_documents (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  
  -- Document metadata
  documentType VARCHAR(50), -- 'id_card' | 'passport' | 'tax_certificate' | 'business_license' | 'proof_of_address' | 'ownership_deed'
  documentNumber TEXT,
  issuedBy VARCHAR(100),
  issuedDate DATETIME,
  expiryDate DATETIME,
  
  -- Document files
  frontImageUrl VARCHAR(255),
  backImageUrl VARCHAR(255),
  additionalFilesUrls TEXT, -- JSON: [url1, url2, ...]
  
  -- Verification
  verificationStatus VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'expired'
  verificationNotes TEXT,
  verificationReviewedAt DATETIME,
  verificationReviewedBy TEXT,
  
  -- Metadata
  country VARCHAR(2),
  extractedData TEXT, -- JSON: {firstName, lastName, dateOfBirth, address, etc.} (from OCR)
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verificationReviewedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_documentType (documentType),
  INDEX idx_verificationStatus (verificationStatus)
);

-- ==================== INVOICE MODEL ====================
-- Invoices for Producteur/Influenceur subscription payments

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  
  -- Invoice metadata
  invoiceNumber TEXT UNIQUE,
  stripeInvoiceId TEXT UNIQUE,
  
  -- Dates
  issueDate DATETIME NOT NULL,
  dueDate DATETIME,
  paidDate DATETIME,
  
  -- Amounts
  subtotalAmount REAL NOT NULL, -- cents
  taxAmount REAL DEFAULT 0,
  discountAmount REAL DEFAULT 0,
  totalAmount REAL NOT NULL, -- cents
  currency VARCHAR(3) DEFAULT 'EUR', -- 'EUR' | 'USD' | 'CHF'
  
  -- Payment
  paymentMethod VARCHAR(50), -- 'credit_card' | 'bank_transfer' | 'paypal' | null
  paymentStatus VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  
  -- Description
  description TEXT, -- Invoice line items (JSON or plain text)
  lineItems TEXT, -- JSON: [{description, quantity, unitPrice, taxRate, total}]
  
  -- Documents
  pdfUrl VARCHAR(255),
  receiptUrl VARCHAR(255),
  
  -- Company info (for invoice generation)
  companyId TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_invoiceNumber (invoiceNumber),
  INDEX idx_paymentStatus (paymentStatus),
  INDEX idx_issueDate (issueDate)
);

-- ==================== BANK ACCOUNT MODEL ====================
-- Bank account info for Producteur (for invoice/payment receipts)

CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  
  -- Account owner
  accountHolderName TEXT NOT NULL,
  accountHolderAddress TEXT,
  
  -- Bank details
  bankName TEXT,
  bankCountry VARCHAR(2),
  iban VARCHAR(34), -- IBAN format
  swiftCode VARCHAR(11), -- SWIFT/BIC
  accountNumber VARCHAR(20),
  routingNumber VARCHAR(20), -- For USA
  
  -- Status
  isVerified BOOLEAN DEFAULT false,
  verificationDocumentUrl VARCHAR(255),
  isDefault BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isDefault (isDefault),
  INDEX idx_isVerified (isVerified)
);

-- ==================== NOTIFICATION PREFERENCE MODEL ====================
-- Granular notification settings per user

CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  
  -- Email notifications
  emailOnNewComment BOOLEAN DEFAULT true,
  emailOnNewLike BOOLEAN DEFAULT true,
  emailOnMention BOOLEAN DEFAULT true,
  emailOnFollowedUserReview BOOLEAN DEFAULT false,
  emailOnNewsletterWeekly BOOLEAN DEFAULT false,
  emailOnPromoAndUpdates BOOLEAN DEFAULT false,
  
  -- Push notifications (mobile)
  pushOnNewComment BOOLEAN DEFAULT true,
  pushOnNewLike BOOLEAN DEFAULT false,
  pushOnMention BOOLEAN DEFAULT true,
  
  -- Frequency
  notificationFrequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate' | 'daily' | 'weekly' | 'never'
  digestTime TIME DEFAULT '09:00:00', -- When to send digest
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
);

-- ==================== SESSION ACTIVITY LOG ====================
-- Track user login activity for security

CREATE TABLE IF NOT EXISTS session_activity (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  
  -- Session info
  sessionId TEXT,
  ipAddress VARCHAR(45), -- IPv4 or IPv6
  userAgent TEXT,
  deviceType VARCHAR(50), -- 'desktop' | 'mobile' | 'tablet' | 'unknown'
  
  -- Location (if available)
  country VARCHAR(2),
  city VARCHAR(100),
  
  -- Activity
  actionType VARCHAR(50), -- 'login' | 'logout' | 'password_change' | 'email_change' | '2fa_enable'
  actionStatus VARCHAR(20) DEFAULT 'success', -- 'success' | 'failed' | 'suspicious'
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_createdAt (createdAt)
);

-- Add indexes for performance
CREATE INDEX idx_users_accountType ON users(accountType);
CREATE INDEX idx_users_subscriptionType ON users(subscriptionType);
CREATE INDEX idx_users_createdAt ON users(createdAt);
