# VIPER – Secure Data Wiping

A modern, responsive MERN stack web application for secure data wiping and IT asset recycling.

## Features

### Public Page
- Hero section with compelling tagline and animations
- Interactive infographics about e-waste problem
- Step-by-step solution explanation
- Impact & benefits showcase
- Interactive tutorials section
- Research & references

### Enterprise Dashboard
- Secure JWT-based authentication
- Dashboard with statistics overview
- Upload and manage cryptographic proofs
- Generate and download certificates
- Audit logs with filtering
- Usage statistics with charts
- Role-based access control
- Guided tutorial walkthrough

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Charts**: Recharts
- **Deployment**: Frontend (Vercel/Netlify), Backend (Render/Heroku)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd SIH2
```

2. Install backend dependencies
```bash
cd viper-backend
npm install
```

3. Install frontend dependencies
```bash
cd ../viper-frontend
npm install
```

4. Set up environment variables
The `.env` files are already configured for development:

**Backend (.env)**:
- MongoDB URI: `mongodb://localhost:27017/viper`
- JWT Secret: Configure for production
- Port: 5000

**Frontend (.env)**:
- API URL: `http://localhost:5000/api`

5. Start MongoDB
Make sure MongoDB is running on your system.

6. Start the development servers
```bash
# Backend (from viper-backend directory)
npm run dev

# Frontend (from viper-frontend directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
SIH2/
├── viper-frontend/         # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── main.jsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json
├── viper-backend/          # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── uploads/            # File uploads
│   └── server.js           # Server entry point
└── README.md

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
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

## Features Implemented

### Backend API
✅ Complete authentication system with JWT
✅ User management with role-based access
✅ Proof upload and management
✅ Certificate generation and verification
✅ Comprehensive audit logging
✅ Statistics and analytics
✅ File upload with validation
✅ Data export capabilities

### Frontend
✅ Modern React application with Vite
✅ Responsive design with Tailwind CSS
✅ Authentication context and protected routes
✅ Dashboard with comprehensive components
✅ Proof management interface
✅ Certificate generation
✅ Audit logs viewer
✅ Statistics and charts
✅ Settings management
✅ Theme support (light/dark)

## Default Admin Account

For testing purposes, you can create an admin account via the registration page or use the API directly.

## API Documentation

The backend provides a comprehensive REST API. See `viper-backend/README.md` for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
