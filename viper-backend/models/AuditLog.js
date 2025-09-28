const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [200, 'Action cannot exceed 200 characters']
  },
  actionType: {
    type: String,
    required: [true, 'Action type is required'],
    enum: [
      'auth_login',
      'auth_logout',
      'auth_failed',
      'auth_locked',
      'user_created',
      'user_updated',
      'user_deleted',
      'proof_uploaded',
      'proof_verified',
      'proof_failed',
      'proof_deleted',
      'certificate_generated',
      'certificate_downloaded',
      'settings_changed',
      'report_generated',
      'system_backup',
      'system_restore',
      'data_export',
      'data_import',
      'wipe_started',
      'wipe_completed',
      'wipe_failed',
      'device_registered',
      'device_decommissioned'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.isSystemAction;
    }
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resourceType: {
    type: String,
    enum: ['user', 'proof', 'certificate', 'device', 'system', 'report'],
    lowercase: true
  },
  resourceId: {
    type: String,
    trim: true
  },
  deviceId: {
    type: String,
    trim: true
  },
  details: {
    type: String,
    maxlength: [1000, 'Details cannot exceed 1000 characters']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    validate: {
      validator: function(v) {
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(v) || ipv6Regex.test(v) || v === '::1' || v === 'localhost';
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: {
    type: String,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  sessionId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'warning', 'error', 'info'],
    default: 'info'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  category: {
    type: String,
    enum: ['authentication', 'authorization', 'data_access', 'data_modification', 'system', 'security'],
    default: 'system'
  },
  isSystemAction: {
    type: Boolean,
    default: false
  },
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  duration: {
    type: Number, // Duration in milliseconds
    min: 0
  },
  errorCode: {
    type: String,
    trim: true
  },
  errorMessage: {
    type: String,
    maxlength: [500, 'Error message cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  retentionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ actionType: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ deviceId: 1, createdAt: -1 });
auditLogSchema.index({ ipAddress: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ isArchived: 1, retentionDate: 1 });

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, actionType: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, severity: 1, createdAt: -1 });

// Pre-save middleware to set retention date
auditLogSchema.pre('save', function(next) {
  if (!this.retentionDate) {
    // Default retention period: 7 years
    const retentionPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years in milliseconds
    this.retentionDate = new Date(Date.now() + retentionPeriod);
  }
  next();
});

// Static method to create audit log entry
auditLogSchema.statics.createEntry = async function(data) {
  try {
    const entry = new this({
      action: data.action,
      actionType: data.actionType,
      userId: data.userId,
      targetUserId: data.targetUserId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      deviceId: data.deviceId,
      details: data.details,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      sessionId: data.sessionId,
      status: data.status || 'info',
      severity: data.severity || 'low',
      category: data.category || 'system',
      isSystemAction: data.isSystemAction || false,
      location: data.location,
      duration: data.duration,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      tags: data.tags || []
    });
    
    return await entry.save();
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
    // Don't throw error to prevent disrupting main application flow
    return null;
  }
};

// Static method to get statistics
auditLogSchema.statics.getStatistics = async function(dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  try {
    const stats = await this.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isArchived: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          warnings: {
            $sum: { $cond: [{ $eq: ['$status', 'warning'] }, 1, 0] }
          },
          errors: {
            $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          authEvents: {
            $sum: { $cond: [{ $eq: ['$category', 'authentication'] }, 1, 0] }
          },
          securityEvents: {
            $sum: { $cond: [{ $eq: ['$category', 'security'] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      total: 0,
      success: 0,
      warnings: 0,
      errors: 0,
      critical: 0,
      authEvents: 0,
      securityEvents: 0
    };
  } catch (error) {
    console.error('Failed to get audit statistics:', error);
    return null;
  }
};

// Static method to archive old logs
auditLogSchema.statics.archiveOldLogs = async function(daysOld = 365) {
  const archiveDate = new Date();
  archiveDate.setDate(archiveDate.getDate() - daysOld);
  
  try {
    const result = await this.updateMany(
      {
        createdAt: { $lt: archiveDate },
        isArchived: false
      },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date()
        }
      }
    );
    
    return result;
  } catch (error) {
    console.error('Failed to archive old logs:', error);
    return null;
  }
};

// Method to check if log should be retained
auditLogSchema.methods.shouldRetain = function() {
  return this.retentionDate > new Date();
};

// Method to anonymize sensitive data
auditLogSchema.methods.anonymize = function() {
  this.metadata = {};
  this.details = 'Anonymized due to retention policy';
  this.userAgent = 'Anonymized';
  this.location = {};
  return this.save();
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
