# RBSE K-12 Digital Library Management System

A comprehensive digital library platform specifically designed for K-12 schools affiliated with the **Rajasthan Board of Secondary Education (RBSE)**. Provides instant access to educational digital resources including eBooks, PDFs, videos, and audio content.

## 🌟 Features

- ✅ Complete RBSE & NCERT curriculum digital resources
- ✅ Digital resource management (PDFs, eBooks, Videos, Audio)
- ✅ Role-based access control (Student, Teacher, Librarian, Admin)
- ✅ Resource access tracking and analytics
- ✅ Advanced search and filtering by subject, class, board
- ✅ Bookmarking and favorites system
- ✅ User access history and analytics
- ✅ Resource upload and management (for Librarians/Admins)
- ✅ Multi-language support (Hindi & English)
- ✅ Mobile responsive design

## 🛠️ Technology Stack

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript
- **UI**: Nuxt UI + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Local/Cloud (configurable)
- **Logging**: Winston

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 6.0
- npm >= 8.0.0

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd elibrary
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### 5. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:5001` and frontend at `http://localhost:3001`

## 📁 Project Structure

```
elibrary/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── jobs/            # Scheduled jobs
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── uploads/             # Uploaded files
├── logs/                # Application logs
├── scripts/             # Seed and utility scripts
├── tests/               # Test files
└── package.json
```

## 🔐 Default Users

After seeding, you can use these credentials:

**Admin**
- Email: admin@rbselibrary.edu
- Password: Admin@123

**Librarian**
- Email: librarian@rbselibrary.edu
- Password: Librarian@123

**Student**
- Email: student@rbselibrary.edu
- Password: Student@123

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password
- `PUT /auth/update-password` - Update password

### Digital Resources Endpoints
- `GET /digital-resources` - Get all resources (with filters)
- `GET /digital-resources/:id` - Get single resource details
- `POST /digital-resources` - Upload new resource (Librarian/Admin)
- `PUT /digital-resources/:id` - Update resource (Librarian/Admin)
- `DELETE /digital-resources/:id` - Delete resource (Admin)
- `POST /digital-resources/:id/access` - Log resource access
- `GET /digital-resources/my/history` - Get user's access history

### Bookmarks Endpoints
- `GET /bookmarks` - Get user's bookmarks
- `POST /bookmarks` - Add bookmark
- `PUT /bookmarks/:id` - Update bookmark notes
- `DELETE /bookmarks/:id` - Remove bookmark

### Analytics Endpoints
- `GET /analytics/dashboard` - Dashboard statistics
- `GET /analytics/popular-resources` - Most accessed resources
- `GET /analytics/user-engagement` - User activity metrics

For complete API documentation, see [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📦 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start src/server.js --name rbse-elibrary
pm2 save
pm2 startup
```

### Using Docker
```bash
docker-compose up -d
```

## 🔧 Configuration

All configuration is done through environment variables. See `.env.example` for all available options.

Key configurations:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `FINE_PER_DAY` - Fine amount per day for overdue books
- `MAX_RENEBackend server port (default: 5001)
- `CORS_ORIGIN` - Frontend URL (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- Application logs rotate daily

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and queries:
- Email: support@rbselibrary.edu
- Documentation: See INTEGRATION_PLAN.md
- Issues: GitHub Issues

## 🙏 Acknowledgments

- Rajasthan Board of Secondary Education (RBSE)
- National Council of Educational Research and Training (NCERT)
- All contributors and testers

---

**Version**: 1.0.0  
**Last Updated**: January 28, 2026  
**Status**: In Development
