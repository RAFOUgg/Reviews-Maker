/**
 * User KYC Routes - Account Page Backend
 * Handles Know Your Customer document uploads and verification
 * Mainly for Producteur accounts
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { prisma } from '../server.js'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

// Middleware: Authentication check
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Multer config for KYC document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../db/kyc_documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${userId}-${timestamp}-${file.fieldname}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, PDF allowed.'));
    }
  }
});

// ==================== GET KYC DOCUMENTS ====================
// GET /api/user/kyc/documents
router.get('/documents', requireAuth, async (req, res) => {
  try {
    const documents = await prisma.kycDocument.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        documentType: true,
        documentNumber: true,
        issuedBy: true,
        issuedDate: true,
        expiryDate: true,
        verificationStatus: true,
        verificationNotes: true,
        frontImageUrl: true,
        backImageUrl: true,
        additionalFilesUrls: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(documents);
  } catch (error) {
    console.error('GET /documents error:', error);
    res.status(500).json({ error: 'Failed to fetch KYC documents' });
  }
});

// ==================== GET KYC STATUS ====================
// GET /api/user/kyc/status
router.get('/status', requireAuth, async (req, res) => {
  try {
    // Get all documents and their verification statuses
    const documents = await prisma.kycDocument.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        documentType: true,
        verificationStatus: true,
        expiryDate: true
      }
    });

    // Get company verification status
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id },
      select: {
        id: true,
        verificationStatus: true,
        verificationRejectionReason: true
      }
    });

    // Determine overall KYC status
    let overallStatus = 'incomplete';
    if (company?.verificationStatus === 'verified' && documents.some(d => d.verificationStatus === 'approved')) {
      overallStatus = 'verified';
    } else if (documents.some(d => d.verificationStatus === 'pending')) {
      overallStatus = 'pending';
    } else if (documents.some(d => d.verificationStatus === 'rejected') || company?.verificationStatus === 'rejected') {
      overallStatus = 'rejected';
    }

    // Calculate completion percentage
    const requiredDocs = ['id_card', 'tax_certificate', 'proof_of_address'];
    const completedDocs = documents
      .filter(d => requiredDocs.includes(d.documentType))
      .filter(d => d.verificationStatus !== 'pending').length;
    const completionPercent = Math.round((completedDocs / requiredDocs.length) * 100);

    res.json({
      overallStatus,
      completionPercent,
      documents,
      company: company || null,
      nextSteps: getNextSteps(overallStatus)
    });
  } catch (error) {
    console.error('GET /status error:', error);
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

// ==================== UPLOAD KYC DOCUMENT ====================
// POST /api/user/kyc/documents
router.post('/documents', requireAuth, upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'additionalFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    const { documentType, documentNumber, country, issuedBy, issuedDate, expiryDate } = req.body;

    // Validation
    const validDocTypes = ['id_card', 'passport', 'tax_certificate', 'business_license', 'proof_of_address', 'ownership_deed'];
    if (!documentType || !validDocTypes.includes(documentType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    if (!req.files || !req.files.frontImage) {
      return res.status(400).json({ error: 'Front image required' });
    }

    // Build file URLs
    const frontImageUrl = `/db/kyc_documents/${req.files.frontImage[0].filename}`;
    const backImageUrl = req.files.backImage ? `/db/kyc_documents/${req.files.backImage[0].filename}` : null;
    const additionalFilesUrls = req.files.additionalFiles
      ? req.files.additionalFiles.map(f => `/db/kyc_documents/${f.filename}`)
      : [];

    // Create KYC document
    const kycDoc = await prisma.kycDocument.create({
      data: {
        id: randomUUID(),
        userId: req.user.id,
        documentType,
        documentNumber,
        country,
        issuedBy,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        frontImageUrl,
        backImageUrl,
        additionalFilesUrls: JSON.stringify(additionalFilesUrls),
        verificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update user KYC status to pending
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        kycStatus: 'pending',
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Document uploaded successfully',
      document: kycDoc
    });
  } catch (error) {
    console.error('POST /documents error:', error);
    // Clean up uploaded files on error
    if (req.files) {
      const allFiles = [...(req.files.frontImage || []), ...(req.files.backImage || []), ...(req.files.additionalFiles || [])];
      allFiles.forEach(f => {
        const filePath = path.join(__dirname, `../../${f.path}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// ==================== UPDATE KYC DOCUMENT ====================
// PUT /api/user/kyc/documents/:id
router.put('/documents/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { documentNumber, issuedBy, issuedDate, expiryDate } = req.body;

    // Verify document ownership
    const doc = await prisma.kycDocument.findUnique({
      where: { id }
    });

    if (!doc || doc.userId !== req.user.id) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updated = await prisma.kycDocument.update({
      where: { id },
      data: {
        documentNumber,
        issuedBy,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        updatedAt: new Date()
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('PUT /documents/:id error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// ==================== DELETE KYC DOCUMENT ====================
// DELETE /api/user/kyc/documents/:id
router.delete('/documents/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify document ownership
    const doc = await prisma.kycDocument.findUnique({
      where: { id }
    });

    if (!doc || doc.userId !== req.user.id) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete files
    if (doc.frontImageUrl) {
      const filePath = path.join(__dirname, `../../${doc.frontImageUrl}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (doc.backImageUrl) {
      const filePath = path.join(__dirname, `../../${doc.backImageUrl}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (doc.additionalFilesUrls) {
      const urls = JSON.parse(doc.additionalFilesUrls);
      urls.forEach(url => {
        const filePath = path.join(__dirname, `../../${url}`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    // Delete record
    await prisma.kycDocument.delete({
      where: { id }
    });

    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('DELETE /documents/:id error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ==================== REQUEST KYC VERIFICATION ====================
// POST /api/user/kyc/request-verification
router.post('/request-verification', requireAuth, async (req, res) => {
  try {
    // Check if user has submitted all required documents
    const documents = await prisma.kycDocument.findMany({
      where: { userId: req.user.id }
    });

    const requiredTypes = ['id_card', 'tax_certificate', 'proof_of_address'];
    const hasAllRequired = requiredTypes.every(type =>
      documents.some(d => d.documentType === type)
    );

    if (!hasAllRequired) {
      return res.status(400).json({
        error: 'Missing required documents',
        missing: requiredTypes.filter(type =>
          !documents.some(d => d.documentType === type)
        )
      });
    }

    // Check if company is set up
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id }
    });

    if (!company) {
      return res.status(400).json({
        error: 'Company information required for KYC verification'
      });
    }

    // Mark all as ready for verification
    await prisma.kycDocument.updateMany({
      where: { userId: req.user.id },
      data: {
        verificationStatus: 'pending',
        updatedAt: new Date()
      }
    });

    // Update user status
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        kycStatus: 'pending',
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'KYC verification requested',
      status: 'pending'
    });
  } catch (error) {
    console.error('POST /request-verification error:', error);
    res.status(500).json({ error: 'Failed to request verification' });
  }
});

// ==================== RESUBMIT KYC DOCUMENT (After Rejection) ====================
// POST /api/user/kyc/documents/:id/resubmit
router.post('/documents/:id/resubmit', requireAuth, upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify document ownership
    const doc = await prisma.kycDocument.findUnique({
      where: { id }
    });

    if (!doc || doc.userId !== req.user.id) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.verificationStatus !== 'rejected') {
      return res.status(400).json({ error: 'Document cannot be resubmitted' });
    }

    // Delete old files if new ones provided
    if (req.files?.frontImage) {
      const oldPath = path.join(__dirname, `../../${doc.frontImageUrl}`);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Update with new files
    const frontImageUrl = req.files?.frontImage
      ? `/db/kyc_documents/${req.files.frontImage[0].filename}`
      : doc.frontImageUrl;

    const backImageUrl = req.files?.backImage
      ? `/db/kyc_documents/${req.files.backImage[0].filename}`
      : doc.backImageUrl;

    const updated = await prisma.kycDocument.update({
      where: { id },
      data: {
        frontImageUrl,
        backImageUrl,
        verificationStatus: 'pending',
        verificationNotes: null,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Document resubmitted',
      document: updated
    });
  } catch (error) {
    console.error('POST /documents/:id/resubmit error:', error);
    res.status(500).json({ error: 'Failed to resubmit document' });
  }
});

// Helper function to determine next steps based on KYC status
function getNextSteps(status) {
  const steps = {
    incomplete: [
      'Upload ID card (front and back)',
      'Upload tax certificate',
      'Upload proof of address',
      'Complete company information'
    ],
    pending: [
      'Waiting for verification review (typically 2-3 business days)',
      'Keep your documents up to date'
    ],
    verified: [
      '✓ KYC verification complete',
      'You can now access Producteur features'
    ],
    rejected: [
      'Review rejection reason',
      'Resubmit corrected documents',
      'Contact support if you need help'
    ]
  };

  return steps[status] || [];
}

export default router;
