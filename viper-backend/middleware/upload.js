const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type
    let subDir = 'general';
    
    if (file.fieldname === 'proof') {
      subDir = 'proofs';
    } else if (file.fieldname === 'certificate') {
      subDir = 'certificates';
    } else if (file.fieldname === 'avatar') {
      subDir = 'avatars';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    
    cb(null, `${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on field name
  const allowedTypes = {
    proof: {
      mimeTypes: [
        'application/pdf',
        'text/plain',
        'application/json',
        'text/csv',
        'application/xml',
        'text/xml'
      ],
      extensions: ['.pdf', '.txt', '.json', '.csv', '.xml', '.log']
    },
    certificate: {
      mimeTypes: [
        'application/pdf',
        'text/html',
        'application/json',
        'application/xml'
      ],
      extensions: ['.pdf', '.html', '.json', '.xml']
    },
    avatar: {
      mimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ],
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    general: {
      mimeTypes: [
        'application/pdf',
        'text/plain',
        'application/json',
        'text/csv',
        'application/xml',
        'text/xml',
        'image/jpeg',
        'image/png'
      ],
      extensions: ['.pdf', '.txt', '.json', '.csv', '.xml', '.log', '.jpg', '.jpeg', '.png']
    }
  };

  const fieldConfig = allowedTypes[file.fieldname] || allowedTypes.general;
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Check MIME type
  if (!fieldConfig.mimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldConfig.mimeTypes.join(', ')}`), false);
  }

  // Check file extension
  if (!fieldConfig.extensions.includes(fileExtension)) {
    return cb(new Error(`Invalid file extension for ${file.fieldname}. Allowed extensions: ${fieldConfig.extensions.join(', ')}`), false);
  }

  // Additional security checks
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid filename. Path traversal detected.'), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5, // Maximum 5 files
    fields: 10, // Maximum 10 non-file fields
    fieldNameSize: 50, // Maximum field name size
    fieldSize: 1024 * 1024 // Maximum field value size (1MB)
  }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size allowed is 10MB.'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 5 files allowed.'
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                success: false,
                message: `Unexpected field name. Expected: ${fieldName}`
              });
            default:
              return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
              });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    
    multipleUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                success: false,
                message: 'One or more files are too large. Maximum size allowed is 10MB per file.'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                success: false,
                message: `Too many files. Maximum ${maxCount} files allowed.`
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                success: false,
                message: `Unexpected field name. Expected: ${fieldName}`
              });
            default:
              return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
              });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Middleware for mixed file upload (multiple fields)
const uploadFields = (fields) => {
  return (req, res, next) => {
    const fieldsUpload = upload.fields(fields);
    
    fieldsUpload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                success: false,
                message: 'One or more files are too large. Maximum size allowed is 10MB per file.'
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                success: false,
                message: 'Too many files uploaded.'
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                success: false,
                message: 'Unexpected field name in upload.'
              });
            default:
              return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
              });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Utility function to delete uploaded file
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Utility function to get file info
const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    destination: file.destination
  };
};

// Middleware to validate file after upload
const validateUploadedFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded.'
    });
  }
  
  // Add file info to request for easy access
  if (req.file) {
    req.fileInfo = getFileInfo(req.file);
  }
  
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.filesInfo = req.files.map(getFileInfo);
    } else {
      req.filesInfo = {};
      Object.keys(req.files).forEach(key => {
        req.filesInfo[key] = req.files[key].map(getFileInfo);
      });
    }
  }
  
  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  validateUploadedFile,
  deleteFile,
  getFileInfo
};
