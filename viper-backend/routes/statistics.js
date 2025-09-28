const express = require('express');
const { query, validationResult } = require('express-validator');
const Proof = require('../models/Proof');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/statistics/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', authenticate, [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const period = req.query.period || '30d';
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  }[period];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Base filter for user role
  const baseFilter = { isDeleted: false };
  if (req.user.role !== 'admin') {
    baseFilter.uploadedBy = req.user._id;
  }

  // Get proof statistics
  const proofStats = await Proof.aggregate([
    { $match: { ...baseFilter, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalProofs: { $sum: 1 },
        verifiedProofs: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
        pendingProofs: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        failedProofs: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        totalDataWiped: { $sum: '$fileSize' },
        avgWipingTime: { $avg: '$wipingDuration' }
      }
    }
  ]);

  // Get device type distribution
  const deviceTypeStats = await Proof.aggregate([
    { $match: { ...baseFilter, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$deviceType',
        count: { $sum: 1 },
        verified: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get wiping method statistics
  const wipingMethodStats = await Proof.aggregate([
    { $match: { ...baseFilter, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$wipingMethod',
        count: { $sum: 1 },
        avgDuration: { $avg: '$wipingDuration' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get daily trends
  const dailyTrends = await Proof.aggregate([
    { $match: { ...baseFilter, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalProofs: { $sum: 1 },
        verifiedProofs: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
        failedProofs: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Get certificate statistics (admin only)
  let certificateStats = null;
  if (req.user.role === 'admin') {
    certificateStats = await Certificate.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          issuedCertificates: {
            $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] }
          },
          expiredCertificates: {
            $sum: { 
              $cond: [
                { $lt: ['$validityPeriod.endDate', new Date()] }, 
                1, 
                0
              ] 
            }
          }
        }
      }
    ]);
  }

  // Get audit log statistics (admin only)
  let auditStats = null;
  if (req.user.role === 'admin') {
    auditStats = await AuditLog.getStatistics(days);
  }

  // Calculate success rate
  const proofData = proofStats[0] || {
    totalProofs: 0,
    verifiedProofs: 0,
    pendingProofs: 0,
    failedProofs: 0,
    totalDataWiped: 0,
    avgWipingTime: 0
  };

  const successRate = proofData.totalProofs > 0 
    ? Math.round((proofData.verifiedProofs / proofData.totalProofs) * 100) 
    : 0;

  res.json({
    success: true,
    data: {
      period,
      summary: {
        ...proofData,
        successRate,
        totalDataWipedFormatted: formatBytes(proofData.totalDataWiped),
        avgWipingTimeFormatted: formatDuration(proofData.avgWipingTime)
      },
      deviceTypes: deviceTypeStats,
      wipingMethods: wipingMethodStats,
      dailyTrends: dailyTrends.map(trend => ({
        date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
        totalProofs: trend.totalProofs,
        verifiedProofs: trend.verifiedProofs,
        failedProofs: trend.failedProofs
      })),
      certificates: certificateStats?.[0] || null,
      audit: auditStats
    }
  });
}));

// @route   GET /api/statistics/performance
// @desc    Get performance metrics
// @access  Private (Admin/Auditor)
router.get('/performance', authenticate, authorize('admin', 'auditor'), [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], asyncHandler(async (req, res) => {
  const period = req.query.period || '30d';
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  }[period];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get processing time trends
  const processingTrends = await Proof.aggregate([
    { 
      $match: { 
        isDeleted: false,
        createdAt: { $gte: startDate },
        wipingDuration: { $exists: true, $ne: null }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          week: { $week: '$createdAt' }
        },
        avgProcessingTime: { $avg: '$wipingDuration' },
        minProcessingTime: { $min: '$wipingDuration' },
        maxProcessingTime: { $max: '$wipingDuration' },
        totalDevices: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  // Get throughput metrics
  const throughputMetrics = await Proof.aggregate([
    { 
      $match: { 
        isDeleted: false,
        createdAt: { $gte: startDate },
        status: 'verified'
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        devicesProcessed: { $sum: 1 },
        totalDataWiped: { $sum: '$fileSize' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Get error rate trends
  const errorTrends = await Proof.aggregate([
    { 
      $match: { 
        isDeleted: false,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          week: { $week: '$createdAt' }
        },
        totalProofs: { $sum: 1 },
        failedProofs: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        errorRate: {
          $cond: [
            { $eq: ['$totalProofs', 0] },
            0,
            { $multiply: [{ $divide: ['$failedProofs', '$totalProofs'] }, 100] }
          ]
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  // Get user activity metrics
  const userActivity = await Proof.aggregate([
    { 
      $match: { 
        isDeleted: false,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: '$uploadedBy',
        totalUploads: { $sum: 1 },
        verifiedUploads: {
          $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
        },
        avgProcessingTime: { $avg: '$wipingDuration' }
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
        totalUploads: 1,
        verifiedUploads: 1,
        avgProcessingTime: 1,
        successRate: {
          $cond: [
            { $eq: ['$totalUploads', 0] },
            0,
            { $multiply: [{ $divide: ['$verifiedUploads', '$totalUploads'] }, 100] }
          ]
        }
      }
    },
    { $sort: { totalUploads: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      period,
      processingTrends: processingTrends.map(trend => ({
        week: `${trend._id.year}-W${trend._id.week}`,
        avgProcessingTime: Math.round(trend.avgProcessingTime || 0),
        minProcessingTime: trend.minProcessingTime || 0,
        maxProcessingTime: trend.maxProcessingTime || 0,
        totalDevices: trend.totalDevices,
        avgProcessingTimeFormatted: formatDuration(trend.avgProcessingTime)
      })),
      throughputMetrics: throughputMetrics.map(metric => ({
        date: `${metric._id.year}-${String(metric._id.month).padStart(2, '0')}-${String(metric._id.day).padStart(2, '0')}`,
        devicesProcessed: metric.devicesProcessed,
        totalDataWiped: metric.totalDataWiped,
        totalDataWipedFormatted: formatBytes(metric.totalDataWiped)
      })),
      errorTrends: errorTrends.map(trend => ({
        week: `${trend._id.year}-W${trend._id.week}`,
        totalProofs: trend.totalProofs,
        failedProofs: trend.failedProofs,
        errorRate: Math.round(trend.errorRate * 100) / 100
      })),
      userActivity
    }
  });
}));

// @route   GET /api/statistics/compliance
// @desc    Get compliance statistics
// @access  Private (Admin/Auditor)
router.get('/compliance', authenticate, authorize('admin', 'auditor'), [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], asyncHandler(async (req, res) => {
  const period = req.query.period || '30d';
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  }[period];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get compliance standards adherence
  const complianceStats = await Proof.aggregate([
    { 
      $match: { 
        isDeleted: false,
        createdAt: { $gte: startDate },
        complianceStandards: { $exists: true, $ne: [] }
      } 
    },
    { $unwind: '$complianceStandards' },
    {
      $group: {
        _id: '$complianceStandards.standard',
        totalChecks: { $sum: 1 },
        compliantChecks: {
          $sum: { $cond: ['$complianceStandards.compliant', 1, 0] }
        }
      }
    },
    {
      $addFields: {
        complianceRate: {
          $cond: [
            { $eq: ['$totalChecks', 0] },
            0,
            { $multiply: [{ $divide: ['$compliantChecks', '$totalChecks'] }, 100] }
          ]
        }
      }
    },
    { $sort: { complianceRate: -1 } }
  ]);

  // Get wiping method compliance
  const wipingMethodCompliance = await Proof.aggregate([
    { 
      $match: { 
        isDeleted: false,
        createdAt: { $gte: startDate },
        status: 'verified'
      } 
    },
    {
      $group: {
        _id: '$wipingMethod',
        count: { $sum: 1 },
        avgWipingPasses: { $avg: '$wipingPasses' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get certificate compliance
  const certificateCompliance = await Certificate.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$complianceStandards' },
    {
      $group: {
        _id: '$complianceStandards.standard',
        totalCertificates: { $sum: 1 },
        compliantCertificates: {
          $sum: { $cond: ['$complianceStandards.compliant', 1, 0] }
        }
      }
    },
    {
      $addFields: {
        complianceRate: {
          $cond: [
            { $eq: ['$totalCertificates', 0] },
            0,
            { $multiply: [{ $divide: ['$compliantCertificates', '$totalCertificates'] }, 100] }
          ]
        }
      }
    }
  ]);

  // Get audit compliance (security events)
  const auditCompliance = await AuditLog.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        category: 'security'
      } 
    },
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      period,
      complianceStandards: complianceStats,
      wipingMethodCompliance,
      certificateCompliance,
      auditCompliance
    }
  });
}));

// @route   GET /api/statistics/export
// @desc    Export statistics data
// @access  Private (Admin)
router.get('/export', authenticate, authorize('admin'), [
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], asyncHandler(async (req, res) => {
  const format = req.query.format || 'json';
  const period = req.query.period || '30d';
  
  // Get comprehensive statistics
  const dashboardData = await getDashboardStats(period);
  const performanceData = await getPerformanceStats(period);
  const complianceData = await getComplianceStats(period);

  const exportData = {
    generatedAt: new Date().toISOString(),
    period,
    dashboard: dashboardData,
    performance: performanceData,
    compliance: complianceData
  };

  // Log data export
  await AuditLog.createEntry({
    action: 'Statistics Exported',
    actionType: 'data_export',
    userId: req.user._id,
    details: `Statistics data exported in ${format} format for period ${period}`,
    metadata: { format, period },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    status: 'success',
    severity: 'medium',
    category: 'data_access'
  });

  if (format === 'csv') {
    // Convert to CSV format
    const csv = convertToCSV(exportData);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="viper-statistics-${period}-${Date.now()}.csv"`);
    res.send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="viper-statistics-${period}-${Date.now()}.json"`);
    res.json(exportData);
  }
}));

// Helper functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function convertToCSV(data) {
  // Simple CSV conversion for basic statistics
  let csv = 'Metric,Value\n';
  
  if (data.dashboard && data.dashboard.summary) {
    const summary = data.dashboard.summary;
    csv += `Total Proofs,${summary.totalProofs}\n`;
    csv += `Verified Proofs,${summary.verifiedProofs}\n`;
    csv += `Success Rate,${summary.successRate}%\n`;
    csv += `Total Data Wiped,${summary.totalDataWipedFormatted}\n`;
    csv += `Average Wiping Time,${summary.avgWipingTimeFormatted}\n`;
  }
  
  return csv;
}

async function getDashboardStats(period) {
  // Implementation would be similar to the dashboard endpoint
  // This is a placeholder for the helper function
  return {};
}

async function getPerformanceStats(period) {
  // Implementation would be similar to the performance endpoint
  // This is a placeholder for the helper function
  return {};
}

async function getComplianceStats(period) {
  // Implementation would be similar to the compliance endpoint
  // This is a placeholder for the helper function
  return {};
}

module.exports = router;
