const mongoose = require('mongoose');
const crypto = require('crypto');

const proofSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    trim: true,
    maxlength: [50, 'Device ID cannot exceed 50 characters']
  },
  deviceType: {
    type: String,
    required: [true, 'Device type is required'],
    enum: ['laptop', 'desktop', 'server', 'mobile', 'tablet', 'storage'],
    lowercase: true
  },
  deviceModel: {
    type: String,
    trim: true,
    maxlength: [200, 'Device model cannot exceed 200 characters']
  },
  serialNumber: {
    type: String,
    trim: true,
    maxlength: [100, 'Serial number cannot exceed 100 characters']
  },
  wipingMethod: {
    type: String,
    required: [true, 'Wiping method is required'],
    enum: ['DoD 5220.22-M', 'NIST SP 800-88', 'Secure Erase', 'Gutmann', 'Random', 'Zero Fill'],
    default: 'DoD 5220.22-M'
  },
  wipingPasses: {
    type: Number,
    default: 3,
    min: [1, 'Wiping passes must be at least 1'],
    max: [35, 'Wiping passes cannot exceed 35']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'verified', 'failed', 'expired'],
    default: 'pending'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  fileHash: {
    type: String,
    required: [true, 'File hash is required']
  },
  hashAlgorithm: {
    type: String,
    default: 'sha256'
  },
  wipingStartTime: {
    type: Date
  },
  wipingEndTime: {
    type: Date
  },
  wipingDuration: {
    type: Number // Duration in seconds
  },
  verificationDate: {
    type: Date
  },
  expirationDate: {
    type: Date
  },
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  metadata: {
    storageCapacity: String,
    storageType: String, // HDD, SSD, NVMe, etc.
    manufacturer: String,
    firmwareVersion: String,
    encryptionStatus: String,
    previousOwner: String,
    assetTag: String,
    location: String,
    costCenter: String
  },
  complianceStandards: [{
    standard: {
      type: String,
      enum: ['NIST', 'DoD', 'ISO', 'GDPR', 'HIPAA', 'SOX', 'PCI-DSS']
    },
    compliant: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
proofSchema.index({ deviceId: 1 });
proofSchema.index({ status: 1 });
proofSchema.index({ uploadedBy: 1 });
proofSchema.index({ createdAt: -1 });
proofSchema.index({ deviceType: 1, status: 1 });
proofSchema.index({ wipingMethod: 1 });

// Virtual for wiping duration in human readable format
proofSchema.virtual('wipingDurationFormatted').get(function() {
  if (!this.wipingDuration) return null;
  
  const hours = Math.floor(this.wipingDuration / 3600);
  const minutes = Math.floor((this.wipingDuration % 3600) / 60);
  const seconds = this.wipingDuration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// Virtual for file size in human readable format
proofSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Pre-save middleware to calculate wiping duration
proofSchema.pre('save', function(next) {
  if (this.wipingStartTime && this.wipingEndTime) {
    this.wipingDuration = Math.floor((this.wipingEndTime - this.wipingStartTime) / 1000);
  }
  
  // Set expiration date (default 7 years from creation)
  if (!this.expirationDate) {
    this.expirationDate = new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Static method to generate file hash
proofSchema.statics.generateFileHash = function(buffer, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(buffer).digest('hex');
};

// Method to add audit trail entry
proofSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy: userId,
    details,
    ipAddress,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status with audit trail
proofSchema.methods.updateStatus = function(newStatus, userId, details, ipAddress) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (newStatus === 'verified') {
    this.verificationDate = new Date();
    this.verifiedBy = userId;
  }
  
  return this.addAuditEntry(
    `Status changed from ${oldStatus} to ${newStatus}`,
    userId,
    details,
    ipAddress
  );
};

// Method to check if proof is expired
proofSchema.methods.isExpired = function() {
  return this.expirationDate && this.expirationDate < new Date();
};

// Method to get compliance summary
proofSchema.methods.getComplianceSummary = function() {
  const total = this.complianceStandards.length;
  const compliant = this.complianceStandards.filter(std => std.compliant).length;
  
  return {
    total,
    compliant,
    percentage: total > 0 ? Math.round((compliant / total) * 100) : 0
  };
};

module.exports = mongoose.model('Proof', proofSchema);
