const AuditLog = require('../models/AuditLog');

const errorHandler = async (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Error Details:', err);
  }

  // Log error to audit system
  try {
    await AuditLog.createEntry({
      action: 'System Error',
      actionType: 'system',
      userId: req.user ? req.user._id : null,
      details: `${err.name}: ${err.message}`,
      metadata: {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'error',
      severity: 'high',
      category: 'system',
      errorCode: err.code || err.statusCode,
      errorMessage: err.message
    });
  } catch (auditError) {
    console.error('Failed to log error to audit system:', auditError);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = {
      statusCode: 400,
      message
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value for field '${field}': '${value}'. Please use another value.`;
    error = {
      statusCode: 400,
      message
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please login again.';
    error = {
      statusCode: 401,
      message
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired. Please login again.';
    error = {
      statusCode: 401,
      message
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Maximum allowed size is 10MB.';
    error = {
      statusCode: 400,
      message
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files. Maximum allowed is 5 files.';
    error = {
      statusCode: 400,
      message
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field. Please check the field name.';
    error = {
      statusCode: 400,
      message
    };
  }

  // MongoDB connection errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    const message = 'Database connection error. Please try again later.';
    error = {
      statusCode: 500,
      message
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests. Please try again later.';
    error = {
      statusCode: 429,
      message
    };
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    const message = 'Cross-origin request blocked. Please check CORS configuration.';
    error = {
      statusCode: 403,
      message
    };
  }

  // File system errors
  if (err.code === 'ENOENT') {
    const message = 'Requested file not found.';
    error = {
      statusCode: 404,
      message
    };
  }

  if (err.code === 'EACCES') {
    const message = 'Permission denied. Unable to access the requested resource.';
    error = {
      statusCode: 403,
      message
    };
  }

  // Network errors
  if (err.code === 'ECONNREFUSED') {
    const message = 'Connection refused. External service unavailable.';
    error = {
      statusCode: 503,
      message
    };
  }

  if (err.code === 'ETIMEDOUT') {
    const message = 'Request timeout. Please try again later.';
    error = {
      statusCode: 408,
      message
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  };

  // Add additional context in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.timestamp = new Date().toISOString();
    errorResponse.error.path = req.originalUrl;
    errorResponse.error.method = req.method;
    
    if (req.user) {
      errorResponse.error.userId = req.user._id;
      errorResponse.error.userRole = req.user.role;
    }
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError
};
