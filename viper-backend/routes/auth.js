const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, AuthenticationError, ValidationError } = require('../middleware/errorHandler');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
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
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, password, company, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    await AuditLog.createEntry({
      action: 'Registration Attempt - Email Already Exists',
      actionType: 'user_created',
      details: `Registration attempt with existing email: ${email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'warning',
      severity: 'medium',
      category: 'authentication'
    });

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
    company,
    phone,
    role: role || 'operator' // Default role
  });

  await user.save();

  // Generate JWT token
  const token = user.generateAuthToken();

  // Log successful registration
  await AuditLog.createEntry({
    action: 'User Registration',
    actionType: 'user_created',
    userId: user._id,
    details: `New user registered: ${email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'authentication'
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone
      },
      token
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    await AuditLog.createEntry({
      action: 'Login Attempt - User Not Found',
      actionType: 'auth_failed',
      details: `Login attempt with non-existent email: ${email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'warning',
      severity: 'medium',
      category: 'authentication'
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    await AuditLog.createEntry({
      action: 'Login Attempt - Account Locked',
      actionType: 'auth_locked',
      userId: user._id,
      details: `Login attempt on locked account: ${email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'warning',
      severity: 'high',
      category: 'authentication'
    });

    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to multiple failed login attempts',
      lockUntil: user.lockUntil
    });
  }

  // Check if account is active
  if (!user.isActive) {
    await AuditLog.createEntry({
      action: 'Login Attempt - Account Deactivated',
      actionType: 'auth_failed',
      userId: user._id,
      details: `Login attempt on deactivated account: ${email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'warning',
      severity: 'high',
      category: 'authentication'
    });

    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact administrator.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();

    await AuditLog.createEntry({
      action: 'Login Attempt - Invalid Password',
      actionType: 'auth_failed',
      userId: user._id,
      details: `Failed login attempt for: ${email}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'warning',
      severity: 'medium',
      category: 'authentication'
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  await user.updateLastLogin();

  // Generate JWT token
  const token = user.generateAuthToken();

  // Log successful login
  await AuditLog.createEntry({
    action: 'Successful Login',
    actionType: 'auth_login',
    userId: user._id,
    details: `User logged in: ${email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'authentication'
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        lastLogin: user.lastLogin
      },
      token
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // Log logout
  await AuditLog.createEntry({
    action: 'User Logout',
    actionType: 'auth_logout',
    userId: req.user._id,
    details: `User logged out: ${req.user.email}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'authentication'
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        lastLogin: user.lastLogin,
        settings: user.settings,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
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
    .withMessage('Please provide a valid phone number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, company, phone } = req.body;
  
  const user = await User.findById(req.user._id);
  
  // Update fields if provided
  if (name) user.name = name;
  if (company !== undefined) user.company = company;
  if (phone !== undefined) user.phone = phone;
  
  await user.save();

  // Log profile update
  await AuditLog.createEntry({
    action: 'Profile Updated',
    actionType: 'user_updated',
    userId: req.user._id,
    details: 'User profile information updated',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone
      }
    }
  });
}));

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  
  // Get user with password
  const user = await User.findById(req.user._id).select('+password');
  
  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    await AuditLog.createEntry({
      action: 'Password Change Attempt - Invalid Current Password',
      actionType: 'user_updated',
      userId: req.user._id,
      details: 'Failed password change attempt - invalid current password',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'warning',
      severity: 'medium',
      category: 'security'
    });

    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }
  
  // Update password
  user.password = newPassword;
  await user.save();

  // Log password change
  await AuditLog.createEntry({
    action: 'Password Changed',
    actionType: 'user_updated',
    userId: req.user._id,
    details: 'User password changed successfully',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'security'
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @route   PUT /api/auth/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', authenticate, asyncHandler(async (req, res) => {
  const { notifications, preferences } = req.body;
  
  const user = await User.findById(req.user._id);
  
  // Update settings
  if (notifications) {
    user.settings.notifications = { ...user.settings.notifications, ...notifications };
  }
  
  if (preferences) {
    user.settings.preferences = { ...user.settings.preferences, ...preferences };
  }
  
  await user.save();

  // Log settings update
  await AuditLog.createEntry({
    action: 'Settings Updated',
    actionType: 'settings_changed',
    userId: req.user._id,
    details: 'User settings updated',
    metadata: { notifications, preferences },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_modification'
  });

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      settings: user.settings
    }
  });
}));

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.post('/verify-token', authenticate, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
}));

module.exports = router;
