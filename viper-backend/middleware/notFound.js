const AuditLog = require('../models/AuditLog');

const notFound = async (req, res, next) => {
  // Log 404 attempts for security monitoring
  try {
    await AuditLog.createEntry({
      action: '404 Not Found',
      actionType: 'system',
      userId: req.user ? req.user._id : null,
      details: `Attempted to access non-existent endpoint: ${req.method} ${req.originalUrl}`,
      metadata: {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        headers: {
          'user-agent': req.get('User-Agent'),
          'referer': req.get('Referer'),
          'accept': req.get('Accept')
        }
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      status: 'warning',
      severity: 'low',
      category: 'system'
    });
  } catch (error) {
    console.error('Failed to log 404 to audit system:', error);
  }

  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = notFound;
