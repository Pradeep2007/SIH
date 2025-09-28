# VIPER Backend API

VIPER (Verified IT Proof of Erasure and Recycling) Backend API - A comprehensive Node.js/Express.js backend for secure data wiping management and compliance tracking.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Proof Management**: Upload, verify, and manage cryptographic proofs of data wiping
- **Certificate Generation**: Generate compliance certificates for wiped devices
- **Audit Logging**: Comprehensive audit trail for all system activities
- **Statistics & Analytics**: Detailed analytics and reporting capabilities
- **User Management**: Admin panel for user management and role assignment
- **File Upload**: Secure file upload with validation and storage
- **Data Export**: Export capabilities for reports and audit logs

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Environment**: dotenv

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `PUT /api/auth/settings` - Update user settings

### Proofs Management
- `GET /api/proofs` - Get all proofs (with filtering)
- `GET /api/proofs/:id` - Get specific proof
- `POST /api/proofs` - Upload new proof
- `PUT /api/proofs/:id` - Update proof
- `PUT /api/proofs/:id/status` - Update proof status (Admin/Auditor)
- `DELETE /api/proofs/:id` - Delete proof
- `GET /api/proofs/:id/download` - Download proof file
- `GET /api/proofs/stats/summary` - Get proof statistics

### Certificates
- `GET /api/certificates` - Get all certificates
- `GET /api/certificates/:id` - Get specific certificate
- `POST /api/certificates` - Generate new certificate
- `PUT /api/certificates/:id` - Update certificate
- `PUT /api/certificates/:id/issue` - Issue certificate (Admin/Auditor)
- `PUT /api/certificates/:id/revoke` - Revoke certificate (Admin)
- `GET /api/certificates/:id/download` - Download certificate
- `GET /api/certificates/verify/:code` - Verify certificate (Public)
- `GET /api/certificates/stats/summary` - Get certificate statistics

### Audit Logs
- `GET /api/audit/logs` - Get audit logs (Admin/Auditor)
- `GET /api/audit/logs/:id` - Get specific audit log
- `GET /api/audit/statistics` - Get audit statistics
- `GET /api/audit/export` - Export audit logs
- `POST /api/audit/archive` - Archive old logs (Admin)
- `GET /api/audit/security-alerts` - Get security alerts

### Statistics
- `GET /api/statistics/dashboard` - Get dashboard statistics
- `GET /api/statistics/performance` - Get performance metrics (Admin/Auditor)
- `GET /api/statistics/compliance` - Get compliance statistics (Admin/Auditor)
- `GET /api/statistics/export` - Export statistics (Admin)

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/deactivate` - Deactivate user
- `PUT /api/users/:id/activate` - Activate user
- `PUT /api/users/:id/unlock` - Unlock user account
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats/summary` - Get user statistics

## Installation & Setup

1. **Clone the repository**
   ```bash
   cd viper-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Copy `.env` file and configure:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/viper
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## User Roles

- **Admin**: Full system access, user management, all operations
- **Auditor**: Read access to all data, can verify proofs and issue certificates
- **Operator**: Can manage their own proofs and certificates

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Account lockout after failed attempts
- Comprehensive audit logging

## File Upload

- Supported formats: PDF, TXT, JSON, CSV, XML, LOG
- Maximum file size: 10MB
- Automatic file hash generation
- Secure file storage with unique naming

## Database Models

- **User**: User accounts and authentication
- **Proof**: Cryptographic proofs of data wiping
- **Certificate**: Compliance certificates
- **AuditLog**: System audit trail

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Configure reverse proxy (nginx)
5. Set up SSL/TLS certificates
6. Configure log rotation
7. Set up monitoring and alerting

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional error details"
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
