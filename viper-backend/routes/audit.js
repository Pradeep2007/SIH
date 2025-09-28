const express = require('express');
const { query, validationResult } = require('express-validator');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/audit/logs
// @desc    Get audit logs with filtering and pagination
// @access  Private (Admin/Auditor)
router.get('/logs', authenticate, authorize('admin', 'auditor'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('actionType').optional().isString().withMessage('Action type must be a string'),
  query('status').optional().isIn(['success', 'warning', 'error', 'info']).withMessage('Invalid status'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  query('category').optional().isIn(['authentication', 'authorization', 'data_access', 'data_modification', 'system', 'security']).withMessage('Invalid category'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
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
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { isArchived: false };

  if (req.query.actionType) {
    filter.actionType = req.query.actionType;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.severity) {
    filter.severity = req.query.severity;
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }
  if (req.query.deviceId) {
    filter.deviceId = new RegExp(req.query.deviceId, 'i');
  }
  if (req.query.ipAddress) {
    filter.ipAddress = req.query.ipAddress;
  }
  if (req.query.search) {
    filter.$or = [
      { action: new RegExp(req.query.search, 'i') },
      { details: new RegExp(req.query.search, 'i') },
      { deviceId: new RegExp(req.query.search, 'i') }
    ];
  }

  // Date range filtering
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const logs = await AuditLog.find(filter)
    .populate('userId', 'name email role')
    .populate('targetUserId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments(filter);

  // Log audit log access
  await AuditLog.createEntry({
    action: 'Audit Logs Accessed',
    actionType: 'data_access',
    userId: req.user._id,
    details: `Audit logs accessed with filters: ${JSON.stringify(req.query)}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  res.json({
    success: true,
    data: {
      logs,
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

// @route   GET /api/audit/logs/:id
// @desc    Get specific audit log by ID
// @access  Private (Admin/Auditor)
router.get('/logs/:id', authenticate, authorize('admin', 'auditor'), asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id)
    .populate('userId', 'name email role company')
    .populate('targetUserId', 'name email role');

  if (!log) {
    return res.status(404).json({
      success: false,
      message: 'Audit log not found'
    });
  }

  // Log audit log detail access
  await AuditLog.createEntry({
    action: 'Audit Log Detail Accessed',
    actionType: 'data_access',
    userId: req.user._id,
    resourceType: 'audit_log',
    resourceId: log._id.toString(),
    details: `Audit log detail accessed: ${log.action}`,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'low',
    category: 'data_access'
  });

  res.json({
    success: true,
    data: { log }
  });
}));

// @route   GET /api/audit/statistics
// @desc    Get audit statistics
// @access  Private (Admin/Auditor)
router.get('/statistics', authenticate, authorize('admin', 'auditor'), [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], asyncHandler(async (req, res) => {
  const period = req.query.period || '30d';
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  }[period];

  const stats = await AuditLog.getStatistics(days);

  // Get action type distribution
  const actionTypeStats = await AuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Get user activity
  const userActivityStats = await AuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        isArchived: false,
        userId: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalActions: { $sum: 1 },
        successfulActions: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        errorActions: {
          $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userName: '$user.name',
        userEmail: '$user.email',
        totalActions: 1,
        successfulActions: 1,
        errorActions: 1,
        successRate: {
          $cond: [
            { $eq: ['$totalActions', 0] },
            0,
            { $multiply: [{ $divide: ['$successfulActions', '$totalActions'] }, 100] }
          ]
        }
      }
    },
    { $sort: { totalActions: -1 } },
    { $limit: 10 }
  ]);

  // Get daily activity trends
  const dailyTrends = await AuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalEvents: { $sum: 1 },
        successEvents: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        errorEvents: {
          $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
        },
        warningEvents: {
          $sum: { $cond: [{ $eq: ['$status', 'warning'] }, 1, 0] }
        },
        criticalEvents: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Get security events
  const securityEvents = await AuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        isArchived: false,
        $or: [
          { category: 'security' },
          { severity: 'critical' },
          { actionType: { $in: ['auth_failed', 'auth_locked'] } }
        ]
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        latestEvent: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      period,
      summary: stats,
      actionTypes: actionTypeStats,
      userActivity: userActivityStats,
      dailyTrends: dailyTrends.map(trend => ({
        date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
        totalEvents: trend.totalEvents,
        successEvents: trend.successEvents,
        errorEvents: trend.errorEvents,
        warningEvents: trend.warningEvents,
        criticalEvents: trend.criticalEvents
      })),
      securityEvents
    }
  });
}));

// @route   GET /api/audit/export
// @desc    Export audit logs
// @access  Private (Admin)
router.get('/export', authenticate, authorize('admin'), [
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const format = req.query.format || 'json';
  
  // Build filter for export
  const filter = { isArchived: false };
  
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  // Apply additional filters
  if (req.query.actionType) filter.actionType = req.query.actionType;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.category) filter.category = req.query.category;

  const logs = await AuditLog.find(filter)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10000); // Limit to prevent memory issues

  // Log audit export
  await AuditLog.createEntry({
    action: 'Audit Logs Exported',
    actionType: 'data_export',
    userId: req.user._id,
    details: `Audit logs exported in ${format} format. Filter: ${JSON.stringify(req.query)}`,
    metadata: {
      format,
      recordCount: logs.length,
      filters: req.query
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_access'
  });

  if (format === 'csv') {
    // Convert to CSV
    const csvHeader = 'Timestamp,Action,Action Type,User,IP Address,Status,Severity,Category,Details\n';
    const csvRows = logs.map(log => {
      const userName = log.userId ? log.userId.name : 'System';
      const details = (log.details || '').replace(/"/g, '""'); // Escape quotes
      return `"${log.createdAt.toISOString()}","${log.action}","${log.actionType}","${userName}","${log.ipAddress}","${log.status}","${log.severity}","${log.category}","${details}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  } else {
    // JSON format
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalRecords: logs.length,
      filters: req.query,
      logs: logs.map(log => ({
        id: log._id,
        timestamp: log.createdAt,
        action: log.action,
        actionType: log.actionType,
        user: log.userId ? {
          id: log.userId._id,
          name: log.userId.name,
          email: log.userId.email
        } : null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        status: log.status,
        severity: log.severity,
        category: log.category,
        details: log.details,
        metadata: log.metadata,
        deviceId: log.deviceId,
        resourceType: log.resourceType,
        resourceId: log.resourceId
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
    res.json(exportData);
  }
}));

// @route   POST /api/audit/archive
// @desc    Archive old audit logs
// @access  Private (Admin)
router.post('/archive', authenticate, authorize('admin'), [
  query('daysOld').optional().isInt({ min: 30 }).withMessage('Days old must be at least 30')
], asyncHandler(async (req, res) => {
  const daysOld = parseInt(req.query.daysOld) || 365; // Default 1 year

  const result = await AuditLog.archiveOldLogs(daysOld);

  // Log archival action
  await AuditLog.createEntry({
    action: 'Audit Logs Archived',
    actionType: 'system',
    userId: req.user._id,
    details: `Archived audit logs older than ${daysOld} days. ${result?.modifiedCount || 0} records archived.`,
    metadata: {
      daysOld,
      archivedCount: result?.modifiedCount || 0
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'system'
  });

  res.json({
    success: true,
    message: `Successfully archived ${result?.modifiedCount || 0} audit log records`,
    data: {
      archivedCount: result?.modifiedCount || 0,
      daysOld
    }
  });
}));

// @route   GET /api/audit/security-alerts
// @desc    Get recent security alerts
// @access  Private (Admin/Auditor)
router.get('/security-alerts', authenticate, authorize('admin', 'auditor'), [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const securityAlerts = await AuditLog.find({
    $or: [
      { severity: 'critical' },
      { severity: 'high' },
      { category: 'security' },
      { actionType: { $in: ['auth_failed', 'auth_locked', 'unauthorized_access'] } }
    ],
    isArchived: false,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  // Group by type for summary
  const alertSummary = await AuditLog.aggregate([
    {
      $match: {
        $or: [
          { severity: 'critical' },
          { severity: 'high' },
          { category: 'security' }
        ],
        isArchived: false,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: '$actionType',
        count: { $sum: 1 },
        latestAlert: { $max: '$createdAt' },
        severity: { $first: '$severity' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      alerts: securityAlerts,
      summary: alertSummary,
      totalAlerts: securityAlerts.length
    }
  });
}));

module.exports = router;
