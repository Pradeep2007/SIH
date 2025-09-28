const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Certificate = require('../models/Certificate');
const Proof = require('../models/Proof');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler, NotFoundError, ValidationError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @route   GET /api/certificates
// @desc    Get all certificates with filtering and pagination
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'generated', 'issued', 'revoked', 'expired']).withMessage('Invalid status'),
  query('type').optional().isIn(['single_device', 'batch_devices', 'compliance_report', 'audit_report']).withMessage('Invalid type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  // Role-based filtering
  if (req.user.role !== 'admin') {
    filter.generatedBy = req.user._id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.certificateId) filter.certificateId = new RegExp(req.query.certificateId, 'i');
  if (req.query.search) {
    filter.$or = [
      { certificateId: new RegExp(req.query.search, 'i') },
      { title: new RegExp(req.query.search, 'i') },
      { 'issuedTo.organization': new RegExp(req.query.search, 'i') }
    ];
  }

  // Date range filtering
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const certificates = await Certificate.find(filter)
    .populate('generatedBy', 'name email')
    .populate('proofs', 'deviceId deviceType status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Certificate.countDocuments(filter);

  res.json({
    success: true,
    data: {
      certificates,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }
  });
}));

// @route   GET /api/certificates/:id
// @desc    Get certificate by ID
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('generatedBy', 'name email company')
    .populate('proofs', 'deviceId deviceType deviceModel status wipingMethod wipingDate')
    .populate('downloadHistory.downloadedBy', 'name email');

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && certificate.generatedBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own certificates.'
    });
  }

  // Log certificate access
  await AuditLog.createEntry({
    action: 'Certificate Viewed',
    actionType: 'data_access',
    userId: req.user._id,
    resourceType: 'certificate',
    resourceId: certificate._id.toString(),
    details: `Certificate ${certificate.certificateId} viewed`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  res.json({
    success: true,
    data: { certificate }
  });
}));

// @route   POST /api/certificates
// @desc    Generate new certificate
// @access  Private
router.post('/', authenticate, [
  body('title').trim().notEmpty().withMessage('Certificate title is required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').isIn(['single_device', 'batch_devices', 'compliance_report', 'audit_report']).withMessage('Invalid certificate type'),
  body('issuedTo.organization').trim().notEmpty().withMessage('Organization name is required'),
  body('issuedTo.contactPerson').optional().trim(),
  body('issuedTo.email').optional().isEmail().withMessage('Invalid email format'),
  body('proofIds').isArray({ min: 1 }).withMessage('At least one proof ID is required'),
  body('complianceStandards').optional().isArray().withMessage('Compliance standards must be an array')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { title, description, type, issuedTo, proofIds, complianceStandards, validityPeriod } = req.body;

  // Verify all proofs exist and are verified
  const proofs = await Proof.find({
    _id: { $in: proofIds },
    status: 'verified',
    isDeleted: false
  }).populate('uploadedBy', 'name email');

  if (proofs.length !== proofIds.length) {
    return res.status(400).json({
      success: false,
      message: 'One or more proofs not found or not verified'
    });
  }

  // Check authorization for proofs
  if (req.user.role !== 'admin') {
    const unauthorizedProofs = proofs.filter(proof => 
      proof.uploadedBy._id.toString() !== req.user._id.toString()
    );
    
    if (unauthorizedProofs.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create certificates for your own proofs.'
      });
    }
  }

  // Create certificate
  const certificate = new Certificate({
    title,
    description,
    type,
    generatedBy: req.user._id,
    issuedTo,
    proofs: proofIds,
    devices: proofs.map(proof => ({
      deviceId: proof.deviceId,
      deviceType: proof.deviceType,
      deviceModel: proof.deviceModel,
      serialNumber: proof.serialNumber,
      wipingMethod: proof.wipingMethod,
      wipingDate: proof.verificationDate || proof.createdAt,
      status: 'verified'
    })),
    complianceStandards: complianceStandards || [],
    validityPeriod: validityPeriod || {
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000) // 3 years
    }
  });

  // Calculate metadata
  certificate.metadata.totalDevices = proofs.length;
  certificate.metadata.successfulWipes = proofs.length;
  certificate.metadata.failedWipes = 0;
  certificate.metadata.totalCapacity = calculateTotalCapacity(proofs);
  certificate.metadata.wipingDuration = proofs.reduce((sum, proof) => sum + (proof.wipingDuration || 0), 0);

  await certificate.save();

  // Update certificate status to generated
  certificate.status = 'generated';
  await certificate.save();

  // Log certificate generation
  await AuditLog.createEntry({
    action: 'Certificate Generated',
    actionType: 'certificate_generated',
    userId: req.user._id,
    resourceType: 'certificate',
    resourceId: certificate._id.toString(),
    details: `Certificate ${certificate.certificateId} generated for ${proofs.length} devices`,
    metadata: {
      certificateId: certificate.certificateId,
      deviceCount: proofs.length,
      organization: issuedTo.organization
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  const populatedCertificate = await Certificate.findById(certificate._id)
    .populate('generatedBy', 'name email')
    .populate('proofs', 'deviceId deviceType status');

  res.status(201).json({
    success: true,
    message: 'Certificate generated successfully',
    data: { certificate: populatedCertificate }
  });
}));

// @route   PUT /api/certificates/:id
// @desc    Update certificate
// @access  Private
router.put('/:id', authenticate, [
  body('title').optional().trim().notEmpty().withMessage('Certificate title cannot be empty'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && certificate.generatedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own certificates.'
    });
  }

  // Prevent updates to issued certificates
  if (certificate.status === 'issued') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update issued certificates'
    });
  }

  // Update allowed fields
  const allowedUpdates = ['title', 'description', 'notes'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      certificate[field] = req.body[field];
    }
  });

  // Update issuedTo information if provided
  if (req.body.issuedTo) {
    certificate.issuedTo = { ...certificate.issuedTo, ...req.body.issuedTo };
  }

  // Update compliance standards if provided
  if (req.body.complianceStandards) {
    certificate.complianceStandards = req.body.complianceStandards;
  }

  await certificate.save();

  // Log certificate update
  await AuditLog.createEntry({
    action: 'Certificate Updated',
    actionType: 'certificate_updated',
    userId: req.user._id,
    resourceType: 'certificate',
    resourceId: certificate._id.toString(),
    details: `Certificate ${certificate.certificateId} updated`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_modification'
  });

  const updatedCertificate = await Certificate.findById(certificate._id)
    .populate('generatedBy', 'name email')
    .populate('proofs', 'deviceId deviceType status');

  res.json({
    success: true,
    message: 'Certificate updated successfully',
    data: { certificate: updatedCertificate }
  });
}));

// @route   PUT /api/certificates/:id/issue
// @desc    Issue certificate (change status to issued)
// @access  Private (Admin/Auditor)
router.put('/:id/issue', authenticate, authorize('admin', 'auditor'), asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  if (certificate.status !== 'generated') {
    return res.status(400).json({
      success: false,
      message: 'Only generated certificates can be issued'
    });
  }

  // Update status to issued
  certificate.status = 'issued';
  await certificate.save();

  // Log certificate issuance
  await AuditLog.createEntry({
    action: 'Certificate Issued',
    actionType: 'certificate_issued',
    userId: req.user._id,
    resourceType: 'certificate',
    resourceId: certificate._id.toString(),
    details: `Certificate ${certificate.certificateId} issued`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  const issuedCertificate = await Certificate.findById(certificate._id)
    .populate('generatedBy', 'name email');

  res.json({
    success: true,
    message: 'Certificate issued successfully',
    data: { certificate: issuedCertificate }
  });
}));

// @route   PUT /api/certificates/:id/revoke
// @desc    Revoke certificate
// @access  Private (Admin)
router.put('/:id/revoke', authenticate, authorize('admin'), [
  body('reason').isIn(['superseded', 'compromised', 'cessation_of_operation', 'privilege_withdrawn', 'ca_compromise']).withMessage('Invalid revocation reason')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  if (certificate.status === 'revoked') {
    return res.status(400).json({
      success: false,
      message: 'Certificate is already revoked'
    });
  }

  // Revoke certificate
  await certificate.revoke(req.body.reason, req.user._id);

  // Log certificate revocation
  await AuditLog.createEntry({
    action: 'Certificate Revoked',
    actionType: 'certificate_revoked',
    userId: req.user._id,
    resourceType: 'certificate',
    resourceId: certificate._id.toString(),
    details: `Certificate ${certificate.certificateId} revoked. Reason: ${req.body.reason}`,
    metadata: {
      reason: req.body.reason
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'high',
    category: 'data_modification'
  });

  const revokedCertificate = await Certificate.findById(certificate._id)
    .populate('generatedBy', 'name email')
    .populate('revokedBy', 'name email');

  res.json({
    success: true,
    message: 'Certificate revoked successfully',
    data: { certificate: revokedCertificate }
  });
}));

// @route   GET /api/certificates/:id/download
// @desc    Download certificate
// @access  Private
router.get('/:id/download', authenticate, [
  query('format').optional().isIn(['pdf', 'html', 'json', 'xml']).withMessage('Invalid format')
], asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('generatedBy', 'name email company')
    .populate('proofs', 'deviceId deviceType deviceModel wipingMethod');

  if (!certificate) {
    throw new NotFoundError('Certificate not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && certificate.generatedBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only download your own certificates.'
    });
  }

  const format = req.query.format || 'pdf';

  // Add download record
  await certificate.addDownloadRecord(
    req.user._id,
    req.ip || req.connection.remoteAddress,
    req.get('User-Agent'),
    format
  );

  // Log certificate download
  await AuditLog.createEntry({
    action: 'Certificate Downloaded',
    actionType: 'certificate_downloaded',
    userId: req.user._id,
    resourceType: 'certificate',
    resourceId: certificate._id.toString(),
    details: `Certificate ${certificate.certificateId} downloaded in ${format} format`,
    metadata: { format },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  // Generate certificate content based on format
  let content, mimeType, filename;

  switch (format) {
    case 'json':
      content = JSON.stringify({
        certificateId: certificate.certificateId,
        title: certificate.title,
        issuedTo: certificate.issuedTo,
        generatedBy: certificate.generatedBy.name,
        devices: certificate.devices,
        complianceStandards: certificate.complianceStandards,
        validityPeriod: certificate.validityPeriod,
        verification: certificate.verification,
        issuedAt: certificate.createdAt
      }, null, 2);
      mimeType = 'application/json';
      filename = `certificate-${certificate.certificateId}.json`;
      break;

    case 'html':
      content = generateHTMLCertificate(certificate);
      mimeType = 'text/html';
      filename = `certificate-${certificate.certificateId}.html`;
      break;

    case 'xml':
      content = generateXMLCertificate(certificate);
      mimeType = 'application/xml';
      filename = `certificate-${certificate.certificateId}.xml`;
      break;

    default: // PDF
      // For PDF generation, you would typically use a library like puppeteer or pdfkit
      // For now, we'll return HTML that can be converted to PDF
      content = generateHTMLCertificate(certificate);
      mimeType = 'text/html';
      filename = `certificate-${certificate.certificateId}.html`;
      break;
  }

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
}));

// @route   GET /api/certificates/verify/:verificationCode
// @desc    Verify certificate by verification code
// @access  Public
router.get('/verify/:verificationCode', asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({
    'verification.verificationCode': req.params.verificationCode
  }).populate('generatedBy', 'name company');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Certificate not found or invalid verification code'
    });
  }

  // Check if certificate is valid
  const isValid = certificate.isValid;
  const isExpired = certificate.isExpired;

  // Log verification attempt
  await AuditLog.createEntry({
    action: 'Certificate Verification',
    actionType: 'certificate_verified',
    resourceType: 'certificate',
    resourceId: certificate._id.toString(),
    details: `Certificate ${certificate.certificateId} verification attempted`,
    metadata: {
      verificationCode: req.params.verificationCode,
      isValid,
      isExpired
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: isValid ? 'success' : 'warning',
    severity: 'low',
    category: 'data_access',
    isSystemAction: true
  });

  res.json({
    success: true,
    data: {
      certificate: {
        certificateId: certificate.certificateId,
        title: certificate.title,
        issuedTo: certificate.issuedTo,
        generatedBy: {
          name: certificate.generatedBy.name,
          company: certificate.generatedBy.company
        },
        status: certificate.status,
        validityPeriod: certificate.validityPeriod,
        isValid,
        isExpired,
        deviceCount: certificate.metadata.totalDevices,
        complianceStandards: certificate.complianceStandards.map(std => ({
          standard: std.standard,
          compliant: std.compliant
        }))
      }
    }
  });
}));

// @route   GET /api/certificates/stats/summary
// @desc    Get certificate statistics
// @access  Private (Admin/Auditor)
router.get('/stats/summary', authenticate, authorize('admin', 'auditor'), asyncHandler(async (req, res) => {
  const stats = await Certificate.getStatistics();

  // Get expiring certificates
  const expiringCertificates = await Certificate.findExpiring(30);

  // Get recent activity
  const recentActivity = await Certificate.find({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  })
    .populate('generatedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      summary: stats,
      expiringCertificates: expiringCertificates.length,
      recentActivity: recentActivity.length
    }
  });
}));

// Helper functions
function calculateTotalCapacity(proofs) {
  // This would calculate total storage capacity from proof metadata
  // For now, return a placeholder
  return `${proofs.length * 500} GB`;
}

function generateHTMLCertificate(certificate) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Data Wiping Certificate - ${certificate.certificateId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .certificate-id { font-size: 24px; font-weight: bold; color: #2563eb; }
        .section { margin: 20px 0; }
        .device-list { margin: 10px 0; }
        .device-item { padding: 5px 0; border-bottom: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>VIPER Data Wiping Certificate</h1>
        <div class="certificate-id">${certificate.certificateId}</div>
      </div>
      
      <div class="section">
        <h2>Certificate Information</h2>
        <p><strong>Title:</strong> ${certificate.title}</p>
        <p><strong>Issued To:</strong> ${certificate.issuedTo.organization}</p>
        <p><strong>Generated By:</strong> ${certificate.generatedBy.name}</p>
        <p><strong>Issue Date:</strong> ${certificate.createdAt.toDateString()}</p>
        <p><strong>Valid Until:</strong> ${certificate.validityPeriod.endDate.toDateString()}</p>
      </div>
      
      <div class="section">
        <h2>Wiped Devices (${certificate.devices.length})</h2>
        <div class="device-list">
          ${certificate.devices.map(device => `
            <div class="device-item">
              <strong>${device.deviceId}</strong> - ${device.deviceType} - ${device.wipingMethod}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="section">
        <h2>Verification</h2>
        <p><strong>Verification Code:</strong> ${certificate.verification.verificationCode}</p>
        <p><strong>Verification URL:</strong> ${certificate.verification.verificationUrl}</p>
      </div>
    </body>
    </html>
  `;
}

function generateXMLCertificate(certificate) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<certificate>
  <certificateId>${certificate.certificateId}</certificateId>
  <title>${certificate.title}</title>
  <issuedTo>
    <organization>${certificate.issuedTo.organization}</organization>
  </issuedTo>
  <generatedBy>${certificate.generatedBy.name}</generatedBy>
  <issueDate>${certificate.createdAt.toISOString()}</issueDate>
  <validUntil>${certificate.validityPeriod.endDate.toISOString()}</validUntil>
  <devices>
    ${certificate.devices.map(device => `
    <device>
      <deviceId>${device.deviceId}</deviceId>
      <deviceType>${device.deviceType}</deviceType>
      <wipingMethod>${device.wipingMethod}</wipingMethod>
      <status>${device.status}</status>
    </device>
    `).join('')}
  </devices>
  <verification>
    <verificationCode>${certificate.verification.verificationCode}</verificationCode>
    <verificationUrl>${certificate.verification.verificationUrl}</verificationUrl>
  </verification>
</certificate>`;
}

module.exports = router;
