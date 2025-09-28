const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'CERT-' + new Date().getFullYear() + '-' + 
             String(Date.now()).slice(-6) + '-' + 
             crypto.randomBytes(3).toString('hex').toUpperCase();
    }
  },
  title: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['single_device', 'batch_devices', 'compliance_report', 'audit_report'],
    default: 'single_device'
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'issued', 'revoked', 'expired'],
    default: 'draft'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuedTo: {
    organization: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  proofs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proof'
  }],
  devices: [{
    deviceId: {
      type: String,
      required: true
    },
    deviceType: String,
    deviceModel: String,
    serialNumber: String,
    wipingMethod: String,
    wipingDate: Date,
    status: {
      type: String,
      enum: ['verified', 'failed', 'pending'],
      default: 'verified'
    }
  }],
  complianceStandards: [{
    standard: {
      type: String,
      enum: ['NIST SP 800-88', 'DoD 5220.22-M', 'ISO 27001', 'GDPR', 'HIPAA', 'SOX', 'PCI-DSS'],
      required: true
    },
    version: String,
    compliant: {
      type: Boolean,
      default: true
    },
    notes: String
  }],
  validityPeriod: {
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true,
      default: function() {
        // Default validity: 3 years
        return new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000);
      }
    }
  },
  digitalSignature: {
    algorithm: {
      type: String,
      default: 'SHA256withRSA'
    },
    signature: String,
    publicKey: String,
    certificateChain: [String]
  },
  verification: {
    verificationCode: {
      type: String,
      unique: true,
      default: function() {
        return crypto.randomBytes(16).toString('hex').toUpperCase();
      }
    },
    qrCode: String, // Base64 encoded QR code
    verificationUrl: String
  },
  metadata: {
    totalDevices: {
      type: Number,
      default: 0
    },
    successfulWipes: {
      type: Number,
      default: 0
    },
    failedWipes: {
      type: Number,
      default: 0
    },
    totalCapacity: String, // e.g., "2.5 TB"
    wipingDuration: Number, // Total time in seconds
    energyConsumed: Number, // kWh
    co2Saved: Number, // kg of CO2
    dataDestroyed: String // e.g., "2.5 TB"
  },
  template: {
    templateId: String,
    templateVersion: String,
    customFields: mongoose.Schema.Types.Mixed
  },
  files: {
    pdfPath: String,
    htmlPath: String,
    xmlPath: String,
    jsonPath: String
  },
  downloadHistory: [{
    downloadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    format: {
      type: String,
      enum: ['pdf', 'html', 'xml', 'json']
    }
  }],
  revocationReason: {
    type: String,
    enum: ['superseded', 'compromised', 'cessation_of_operation', 'privilege_withdrawn', 'ca_compromise'],
    required: function() {
      return this.status === 'revoked';
    }
  },
  revocationDate: {
    type: Date,
    required: function() {
      return this.status === 'revoked';
    }
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status === 'revoked';
    }
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'organization', 'restricted', 'confidential'],
    default: 'organization'
  }
}, {
  timestamps: true
});

// Indexes
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ 'verification.verificationCode': 1 });
certificateSchema.index({ generatedBy: 1, createdAt: -1 });
certificateSchema.index({ status: 1, createdAt: -1 });
certificateSchema.index({ 'validityPeriod.endDate': 1 });
certificateSchema.index({ type: 1, status: 1 });

// Virtual for checking if certificate is expired
certificateSchema.virtual('isExpired').get(function() {
  return this.validityPeriod.endDate < new Date();
});

// Virtual for checking if certificate is valid
certificateSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'issued' && 
         this.validityPeriod.startDate <= now && 
         this.validityPeriod.endDate > now;
});

// Virtual for days until expiration
certificateSchema.virtual('daysUntilExpiration').get(function() {
  const now = new Date();
  const diffTime = this.validityPeriod.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
certificateSchema.pre('save', function(next) {
  // Update metadata based on associated proofs/devices
  if (this.devices && this.devices.length > 0) {
    this.metadata.totalDevices = this.devices.length;
    this.metadata.successfulWipes = this.devices.filter(d => d.status === 'verified').length;
    this.metadata.failedWipes = this.devices.filter(d => d.status === 'failed').length;
  }
  
  // Set verification URL
  if (!this.verification.verificationUrl && this.verification.verificationCode) {
    this.verification.verificationUrl = `${process.env.FRONTEND_URL || 'https://viper.example.com'}/verify/${this.verification.verificationCode}`;
  }
  
  next();
});

// Method to generate digital signature
certificateSchema.methods.generateDigitalSignature = function(privateKey) {
  const data = JSON.stringify({
    certificateId: this.certificateId,
    issuedTo: this.issuedTo,
    devices: this.devices,
    validityPeriod: this.validityPeriod,
    timestamp: this.createdAt
  });
  
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  
  this.digitalSignature.signature = sign.sign(privateKey, 'hex');
  return this.digitalSignature.signature;
};

// Method to verify digital signature
certificateSchema.methods.verifyDigitalSignature = function(publicKey) {
  if (!this.digitalSignature.signature) return false;
  
  const data = JSON.stringify({
    certificateId: this.certificateId,
    issuedTo: this.issuedTo,
    devices: this.devices,
    validityPeriod: this.validityPeriod,
    timestamp: this.createdAt
  });
  
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  
  return verify.verify(publicKey, this.digitalSignature.signature, 'hex');
};

// Method to add download record
certificateSchema.methods.addDownloadRecord = function(userId, ipAddress, userAgent, format) {
  this.downloadHistory.push({
    downloadedBy: userId,
    downloadedAt: new Date(),
    ipAddress,
    userAgent,
    format
  });
  return this.save();
};

// Method to revoke certificate
certificateSchema.methods.revoke = function(reason, revokedBy) {
  this.status = 'revoked';
  this.revocationReason = reason;
  this.revocationDate = new Date();
  this.revokedBy = revokedBy;
  return this.save();
};

// Method to check compliance
certificateSchema.methods.checkCompliance = function() {
  const totalStandards = this.complianceStandards.length;
  const compliantStandards = this.complianceStandards.filter(std => std.compliant).length;
  
  return {
    total: totalStandards,
    compliant: compliantStandards,
    percentage: totalStandards > 0 ? Math.round((compliantStandards / totalStandards) * 100) : 0,
    isFullyCompliant: totalStandards > 0 && compliantStandards === totalStandards
  };
};

// Static method to find expiring certificates
certificateSchema.statics.findExpiring = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'issued',
    'validityPeriod.endDate': {
      $gte: new Date(),
      $lte: futureDate
    }
  }).populate('generatedBy', 'name email');
};

// Static method to get certificate statistics
certificateSchema.statics.getStatistics = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          issued: {
            $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] }
          },
          expired: {
            $sum: { 
              $cond: [
                { $lt: ['$validityPeriod.endDate', new Date()] }, 
                1, 
                0
              ] 
            }
          },
          revoked: {
            $sum: { $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0] }
          },
          totalDevices: { $sum: '$metadata.totalDevices' },
          totalDownloads: { $sum: { $size: '$downloadHistory' } }
        }
      }
    ]);
    
    return stats[0] || {
      total: 0,
      issued: 0,
      expired: 0,
      revoked: 0,
      totalDevices: 0,
      totalDownloads: 0
    };
  } catch (error) {
    console.error('Failed to get certificate statistics:', error);
    return null;
  }
};

module.exports = mongoose.model('Certificate', certificateSchema);
