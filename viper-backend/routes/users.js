const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler, NotFoundError, ValidationError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'auditor', 'operator']).withMessage('Invalid role'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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
  
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
      { company: new RegExp(req.query.search, 'i') }
    ];
  }

  const users = await User.find(filter)
    .select('-password -twoFactorSecret')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  // Log user list access
  await AuditLog.createEntry({
    action: 'User List Accessed',
    actionType: 'data_access',
    userId: req.user._id,
    details: `User list accessed with filters: ${JSON.stringify(req.query)}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  res.json({
    success: true,
    data: {
      users,
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

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or own profile)
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -twoFactorSecret');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check authorization (admin or own profile)
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own profile.'
    });
  }

  // Log user profile access
  await AuditLog.createEntry({
    action: 'User Profile Accessed',
    actionType: 'data_access',
    userId: req.user._id,
    targetUserId: user._id,
    details: `User profile accessed: ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  res.json({
    success: true,
    data: { user }
  });
}));

// @route   POST /api/users
// @desc    Create new user (Admin only)
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .isIn(['admin', 'auditor', 'operator'])
    .withMessage('Invalid role'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, password, role, company, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    role,
    company,
    phone
  });

  await user.save();

  // Log user creation
  await AuditLog.createEntry({
    action: 'User Created',
    actionType: 'user_created',
    userId: req.user._id,
    targetUserId: user._id,
    details: `New user created: ${email} with role ${role}`,
    metadata: {
      newUserEmail: email,
      newUserRole: role,
      newUserName: name
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user (Admin or own profile)
// @access  Private
router.put('/:id', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'auditor', 'operator'])
    .withMessage('Invalid role')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check authorization
  const isOwnProfile = req.user._id.toString() === req.params.id;
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin && !isOwnProfile) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own profile.'
    });
  }

  // Role changes require admin privileges
  if (req.body.role && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only administrators can change user roles.'
    });
  }

  // Store original values for audit log
  const originalValues = {
    name: user.name,
    company: user.company,
    phone: user.phone,
    role: user.role
  };

  // Update allowed fields
  const allowedUpdates = ['name', 'company', 'phone'];
  if (isAdmin) {
    allowedUpdates.push('role', 'isActive');
  }

  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
      user[field] = req.body[field];
    }
  });

  await user.save();

  // Log user update
  await AuditLog.createEntry({
    action: 'User Updated',
    actionType: 'user_updated',
    userId: req.user._id,
    targetUserId: user._id,
    details: `User updated: ${user.email}`,
    metadata: {
      originalValues,
      updatedValues: updates,
      updatedBy: isOwnProfile ? 'self' : 'admin'
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt
      }
    }
  });
}));

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user (Admin only)
// @access  Private (Admin)
router.put('/:id/deactivate', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isActive) {
    return res.status(400).json({
      success: false,
      message: 'User is already deactivated'
    });
  }

  // Prevent self-deactivation
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot deactivate your own account'
    });
  }

  user.isActive = false;
  await user.save();

  // Log user deactivation
  await AuditLog.createEntry({
    action: 'User Deactivated',
    actionType: 'user_updated',
    userId: req.user._id,
    targetUserId: user._id,
    details: `User deactivated: ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'high',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: { user }
  });
}));

// @route   PUT /api/users/:id/activate
// @desc    Activate user (Admin only)
// @access  Private (Admin)
router.put('/:id/activate', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.isActive) {
    return res.status(400).json({
      success: false,
      message: 'User is already active'
    });
  }

  user.isActive = true;
  // Reset login attempts when reactivating
  await user.resetLoginAttempts();
  await user.save();

  // Log user activation
  await AuditLog.createEntry({
    action: 'User Activated',
    actionType: 'user_updated',
    userId: req.user._id,
    targetUserId: user._id,
    details: `User activated: ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'User activated successfully',
    data: { user }
  });
}));

// @route   PUT /api/users/:id/unlock
// @desc    Unlock user account (Admin only)
// @access  Private (Admin)
router.put('/:id/unlock', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isLocked) {
    return res.status(400).json({
      success: false,
      message: 'User account is not locked'
    });
  }

  // Reset login attempts and unlock
  await user.resetLoginAttempts();

  // Log account unlock
  await AuditLog.createEntry({
    action: 'User Account Unlocked',
    actionType: 'user_updated',
    userId: req.user._id,
    targetUserId: user._id,
    details: `User account unlocked: ${user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'User account unlocked successfully'
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Prevent self-deletion
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  // Check if user has associated data (proofs, certificates)
  const Proof = require('../models/Proof');
  const Certificate = require('../models/Certificate');

  const userProofs = await Proof.countDocuments({ uploadedBy: user._id, isDeleted: false });
  const userCertificates = await Certificate.countDocuments({ generatedBy: user._id });

  if (userProofs > 0 || userCertificates > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete user. User has ${userProofs} proofs and ${userCertificates} certificates. Please transfer or delete associated data first.`
    });
  }

  await User.findByIdAndDelete(req.params.id);

  // Log user deletion
  await AuditLog.createEntry({
    action: 'User Deleted',
    actionType: 'user_deleted',
    userId: req.user._id,
    targetUserId: user._id,
    details: `User deleted: ${user.email}`,
    metadata: {
      deletedUserEmail: user.email,
      deletedUserName: user.name,
      deletedUserRole: user.role
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'high',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// @route   GET /api/users/stats/summary
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/summary', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const lockedUsers = await User.countDocuments({ lockUntil: { $gt: new Date() } });

  // Role distribution
  const roleStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent registrations (last 30 days)
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  // Recent logins (last 7 days)
  const recentLogins = await User.countDocuments({
    lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      lockedUsers,
      roleDistribution: roleStats,
      recentRegistrations,
      recentLogins
    }
  });
}));

module.exports = router;
