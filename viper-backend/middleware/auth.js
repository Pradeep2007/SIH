const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }
    
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.'
      });
    }
    
    // Add user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Log failed authentication attempt
    await AuditLog.createEntry({
      action: 'Authentication Failed',
      actionType: 'auth_failed',
      details: `Invalid token: ${error.message}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'error',
      severity: 'medium',
      category: 'authentication'
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

// Middleware to authorize based on user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      AuditLog.createEntry({
        action: 'Unauthorized Access Attempt',
        actionType: 'auth_failed',
        userId: req.user._id,
        details: `User with role '${req.user.role}' attempted to access resource requiring roles: ${roles.join(', ')}`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'warning',
        severity: 'medium',
        category: 'authorization'
      });
      
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
      });
    }
    
    next();
  };
};

// Middleware to check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      });
    }
    
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserField] || req.params[resourceUserField] || req.query[resourceUserField];
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      // Log unauthorized access attempt
      AuditLog.createEntry({
        action: 'Unauthorized Resource Access Attempt',
        actionType: 'auth_failed',
        userId: req.user._id,
        details: `User attempted to access resource owned by another user`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'warning',
        severity: 'high',
        category: 'authorization'
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

// Middleware to validate API key for external integrations
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required.'
      });
    }
    
    // In a real implementation, you would validate the API key against a database
    // For now, we'll use a simple environment variable check
    if (apiKey !== process.env.API_KEY) {
      // Log invalid API key attempt
      await AuditLog.createEntry({
        action: 'Invalid API Key',
        actionType: 'auth_failed',
        details: 'Invalid API key provided',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status: 'warning',
        severity: 'high',
        category: 'authentication',
        isSystemAction: true
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }
    
    // Set system user for API requests
    req.user = {
      _id: 'system',
      role: 'system',
      name: 'System API',
      email: 'system@viper.com'
    };
    
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during API key validation.'
    });
  }
};

// Middleware to check account lock status
const checkAccountLock = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }
    
    const user = await User.findById(req.user._id);
    
    if (user && user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.',
        lockUntil: user.lockUntil
      });
    }
    
    next();
  } catch (error) {
    console.error('Account lock check error:', error);
    next();
  }
};

// Middleware to log successful authentication
const logSuccessfulAuth = async (req, res, next) => {
  if (req.user && req.user._id !== 'system') {
    await AuditLog.createEntry({
      action: 'Successful Authentication',
      actionType: 'auth_login',
      userId: req.user._id,
      details: 'User successfully authenticated',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'success',
      severity: 'low',
      category: 'authentication'
    });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin,
  validateApiKey,
  checkAccountLock,
  logSuccessfulAuth
};
