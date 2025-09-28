const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Proof = require('../models/Proof');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadSingle, validateUploadedFile, deleteFile } = require('../middleware/upload');
const { asyncHandler, NotFoundError, ValidationError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const fs = require('fs');

const router = express.Router();

// @route   GET /api/proofs
// @desc    Get all proofs with filtering and pagination
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'processing', 'verified', 'failed', 'expired']).withMessage('Invalid status'),
  query('deviceType').optional().isIn(['laptop', 'desktop', 'server', 'mobile', 'tablet', 'storage']).withMessage('Invalid device type'),
  query('wipingMethod').optional().isIn(['DoD 5220.22-M', 'NIST SP 800-88', 'Secure Erase', 'Gutmann', 'Random', 'Zero Fill']).withMessage('Invalid wiping method')
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
  const filter = { isDeleted: false };
  
  // Role-based filtering
  if (req.user.role !== 'admin') {
    filter.uploadedBy = req.user._id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.deviceType) filter.deviceType = req.query.deviceType;
  if (req.query.wipingMethod) filter.wipingMethod = req.query.wipingMethod;
  if (req.query.deviceId) filter.deviceId = new RegExp(req.query.deviceId, 'i');
  if (req.query.search) {
    filter.$or = [
      { deviceId: new RegExp(req.query.search, 'i') },
      { deviceModel: new RegExp(req.query.search, 'i') },
      { serialNumber: new RegExp(req.query.search, 'i') }
    ];
  }

  // Date range filtering
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const proofs = await Proof.find(filter)
    .populate('uploadedBy', 'name email')
    .populate('verifiedBy', 'name email')
    .populate('certificateId', 'certificateId title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Proof.countDocuments(filter);

  res.json({
    success: true,
    data: {
      proofs,
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

// @route   GET /api/proofs/:id
// @desc    Get proof by ID
// @access  Private
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const proof = await Proof.findById(req.params.id)
    .populate('uploadedBy', 'name email company')
    .populate('verifiedBy', 'name email')
    .populate('certificateId', 'certificateId title status')
    .populate('auditTrail.performedBy', 'name email');

  if (!proof || proof.isDeleted) {
    throw new NotFoundError('Proof not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && proof.uploadedBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own proofs.'
    });
  }

  // Log proof access
  await AuditLog.createEntry({
    action: 'Proof Viewed',
    actionType: 'data_access',
    userId: req.user._id,
    resourceType: 'proof',
    resourceId: proof._id.toString(),
    deviceId: proof.deviceId,
    details: `Proof ${proof.deviceId} viewed`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  res.json({
    success: true,
    data: { proof }
  });
}));

// @route   POST /api/proofs
// @desc    Upload new proof
// @access  Private
router.post('/', authenticate, uploadSingle('proof'), validateUploadedFile, [
  body('deviceId').trim().notEmpty().withMessage('Device ID is required'),
  body('deviceType').isIn(['laptop', 'desktop', 'server', 'mobile', 'tablet', 'storage']).withMessage('Invalid device type'),
  body('wipingMethod').isIn(['DoD 5220.22-M', 'NIST SP 800-88', 'Secure Erase', 'Gutmann', 'Random', 'Zero Fill']).withMessage('Invalid wiping method'),
  body('deviceModel').optional().trim(),
  body('serialNumber').optional().trim(),
  body('wipingPasses').optional().isInt({ min: 1, max: 35 }).withMessage('Wiping passes must be between 1 and 35'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Delete uploaded file if validation fails
    if (req.file) {
      await deleteFile(req.file.path);
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check if device ID already exists for this user
  const existingProof = await Proof.findOne({
    deviceId: req.body.deviceId,
    uploadedBy: req.user._id,
    isDeleted: false
  });

  if (existingProof) {
    await deleteFile(req.file.path);
    return res.status(400).json({
      success: false,
      message: 'A proof for this device ID already exists'
    });
  }

  // Generate file hash
  const fileBuffer = fs.readFileSync(req.file.path);
  const fileHash = Proof.generateFileHash(fileBuffer);

  // Create proof document
  const proof = new Proof({
    deviceId: req.body.deviceId,
    deviceType: req.body.deviceType,
    deviceModel: req.body.deviceModel,
    serialNumber: req.body.serialNumber,
    wipingMethod: req.body.wipingMethod,
    wipingPasses: req.body.wipingPasses || 3,
    uploadedBy: req.user._id,
    filePath: req.file.path,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    fileHash,
    notes: req.body.notes,
    metadata: {
      storageCapacity: req.body.storageCapacity,
      storageType: req.body.storageType,
      manufacturer: req.body.manufacturer,
      firmwareVersion: req.body.firmwareVersion,
      encryptionStatus: req.body.encryptionStatus,
      previousOwner: req.body.previousOwner,
      assetTag: req.body.assetTag,
      location: req.body.location,
      costCenter: req.body.costCenter
    }
  });

  // Add compliance standards if provided
  if (req.body.complianceStandards) {
    proof.complianceStandards = req.body.complianceStandards;
  }

  await proof.save();

  // Add initial audit entry
  await proof.addAuditEntry(
    'Proof uploaded',
    req.user._id,
    `Proof file uploaded for device ${req.body.deviceId}`,
    req.ip || req.connection.remoteAddress
  );

  // Log proof upload
  await AuditLog.createEntry({
    action: 'Proof Uploaded',
    actionType: 'proof_uploaded',
    userId: req.user._id,
    resourceType: 'proof',
    resourceId: proof._id.toString(),
    deviceId: proof.deviceId,
    details: `Proof uploaded for device ${proof.deviceId}`,
    metadata: {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      wipingMethod: proof.wipingMethod
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_modification'
  });

  const populatedProof = await Proof.findById(proof._id)
    .populate('uploadedBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Proof uploaded successfully',
    data: { proof: populatedProof }
  });
}));

// @route   PUT /api/proofs/:id
// @desc    Update proof
// @access  Private
router.put('/:id', authenticate, [
  body('deviceModel').optional().trim(),
  body('serialNumber').optional().trim(),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const proof = await Proof.findById(req.params.id);

  if (!proof || proof.isDeleted) {
    throw new NotFoundError('Proof not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && proof.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own proofs.'
    });
  }

  // Update allowed fields
  const allowedUpdates = ['deviceModel', 'serialNumber', 'notes'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Update metadata if provided
  if (req.body.metadata) {
    updates['metadata'] = { ...proof.metadata, ...req.body.metadata };
  }

  // Update compliance standards if provided
  if (req.body.complianceStandards) {
    updates['complianceStandards'] = req.body.complianceStandards;
  }

  Object.assign(proof, updates);
  await proof.save();

  // Add audit entry
  await proof.addAuditEntry(
    'Proof updated',
    req.user._id,
    `Proof information updated for device ${proof.deviceId}`,
    req.ip || req.connection.remoteAddress
  );

  // Log proof update
  await AuditLog.createEntry({
    action: 'Proof Updated',
    actionType: 'proof_updated',
    userId: req.user._id,
    resourceType: 'proof',
    resourceId: proof._id.toString(),
    deviceId: proof.deviceId,
    details: `Proof updated for device ${proof.deviceId}`,
    metadata: updates,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_modification'
  });

  const updatedProof = await Proof.findById(proof._id)
    .populate('uploadedBy', 'name email')
    .populate('verifiedBy', 'name email');

  res.json({
    success: true,
    message: 'Proof updated successfully',
    data: { proof: updatedProof }
  });
}));

// @route   PUT /api/proofs/:id/status
// @desc    Update proof status (admin/auditor only)
// @access  Private (Admin/Auditor)
router.put('/:id/status', authenticate, authorize('admin', 'auditor'), [
  body('status').isIn(['pending', 'processing', 'verified', 'failed', 'expired']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const proof = await Proof.findById(req.params.id);

  if (!proof || proof.isDeleted) {
    throw new NotFoundError('Proof not found');
  }

  const oldStatus = proof.status;
  const newStatus = req.body.status;

  // Update status using the model method
  await proof.updateStatus(
    newStatus,
    req.user._id,
    req.body.notes || `Status changed from ${oldStatus} to ${newStatus}`,
    req.ip || req.connection.remoteAddress
  );

  // Log status change
  await AuditLog.createEntry({
    action: 'Proof Status Changed',
    actionType: newStatus === 'verified' ? 'proof_verified' : 'proof_updated',
    userId: req.user._id,
    resourceType: 'proof',
    resourceId: proof._id.toString(),
    deviceId: proof.deviceId,
    details: `Proof status changed from ${oldStatus} to ${newStatus} for device ${proof.deviceId}`,
    metadata: {
      oldStatus,
      newStatus,
      notes: req.body.notes
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  const updatedProof = await Proof.findById(proof._id)
    .populate('uploadedBy', 'name email')
    .populate('verifiedBy', 'name email');

  res.json({
    success: true,
    message: 'Proof status updated successfully',
    data: { proof: updatedProof }
  });
}));

// @route   DELETE /api/proofs/:id
// @desc    Delete proof (soft delete)
// @access  Private
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const proof = await Proof.findById(req.params.id);

  if (!proof || proof.isDeleted) {
    throw new NotFoundError('Proof not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && proof.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only delete your own proofs.'
    });
  }

  // Soft delete
  proof.isDeleted = true;
  await proof.save();

  // Add audit entry
  await proof.addAuditEntry(
    'Proof deleted',
    req.user._id,
    `Proof deleted for device ${proof.deviceId}`,
    req.ip || req.connection.remoteAddress
  );

  // Log proof deletion
  await AuditLog.createEntry({
    action: 'Proof Deleted',
    actionType: 'proof_deleted',
    userId: req.user._id,
    resourceType: 'proof',
    resourceId: proof._id.toString(),
    deviceId: proof.deviceId,
    details: `Proof deleted for device ${proof.deviceId}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'Proof deleted successfully'
  });
}));

// @route   GET /api/proofs/:id/download
// @desc    Download proof file
// @access  Private
router.get('/:id/download', authenticate, asyncHandler(async (req, res) => {
  const proof = await Proof.findById(req.params.id);

  if (!proof || proof.isDeleted) {
    throw new NotFoundError('Proof not found');
  }

  // Check authorization
  if (req.user.role !== 'admin' && proof.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only download your own proofs.'
    });
  }

  // Check if file exists
  if (!fs.existsSync(proof.filePath)) {
    return res.status(404).json({
      success: false,
      message: 'Proof file not found on server'
    });
  }

  // Log file download
  await AuditLog.createEntry({
    action: 'Proof Downloaded',
    actionType: 'data_access',
    userId: req.user._id,
    resourceType: 'proof',
    resourceId: proof._id.toString(),
    deviceId: proof.deviceId,
    details: `Proof file downloaded for device ${proof.deviceId}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  // Set headers for file download
  res.setHeader('Content-Disposition', `attachment; filename="${proof.fileName}"`);
  res.setHeader('Content-Type', proof.mimeType);

  // Stream file to response
  const fileStream = fs.createReadStream(proof.filePath);
  fileStream.pipe(res);
}));

// @route   GET /api/proofs/stats/summary
// @desc    Get proof statistics summary
// @access  Private
router.get('/stats/summary', authenticate, asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  
  // Role-based filtering
  if (req.user.role !== 'admin') {
    filter.uploadedBy = req.user._id;
  }

  const stats = await Proof.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        verified: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        processing: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        totalFileSize: { $sum: '$fileSize' },
        avgWipingDuration: { $avg: '$wipingDuration' }
      }
    }
  ]);

  const deviceTypeStats = await Proof.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$deviceType',
        count: { $sum: 1 }
      }
    }
  ]);

  const wipingMethodStats = await Proof.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$wipingMethod',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = stats[0] || {
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0,
    processing: 0,
    totalFileSize: 0,
    avgWipingDuration: 0
  };

  res.json({
    success: true,
    data: {
      summary: result,
      deviceTypes: deviceTypeStats,
      wipingMethods: wipingMethodStats
    }
  });
}));

module.exports = router;
