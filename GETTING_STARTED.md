# 🚀 Quick Start Guide - RBSE Digital Library

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

## Step 1: Install Dependencies

Open PowerShell or Command Prompt in the project directory and run:

```powershell
npm install
```

This will install all required packages including Express, Mongoose, JWT, etc.

## Step 2: Configure Environment

1. Copy the example environment file:
```powershell
Copy-Item .env.example .env
```

2. Open `.env` file and configure the following important variables:

```env
# MongoDB Connection (change if needed)
MONGODB_URI=mongodb://localhost:27017/rbse_elibrary

# JWT Secret (IMPORTANT: Change this to a random secret)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=5000

# Email Configuration (optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# School Configuration
SCHOOL_NAME=Your School Name
SCHOOL_CODE=RBSE001
```

## Step 3: Start MongoDB

**Option A: Using MongoDB as a Windows Service**
```powershell
net start MongoDB
```

**Option B: Manual Start**
```powershell
mongod --dbpath="C:\data\db"
```

## Step 4: Seed the Database (Optional but Recommended)

Populate the database with default users and RBSE textbooks:

```powershell
npm run seed:rbse
```

This creates:
- **Admin** user (admin@rbselibrary.edu / Admin@123)
- **Librarian** user (librarian@rbselibrary.edu / Librarian@123)
- **Student** user (student@rbselibrary.edu / Student@123)
- **Teacher** user (teacher@rbselibrary.edu / Teacher@123)
- Sample RBSE textbooks for various classes

## Step 5: Start the Development Server

```powershell
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📚 RBSE Digital Library API
🌐 Environment: development
```

## Step 6: Test the API

Open a new PowerShell window and test the API:

```powershell
# Health check
curl http://localhost:5000/health

# Login as admin
curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@rbselibrary.edu\",\"password\":\"Admin@123\"}'
```

## 🎯 Next Steps

### Phase 1: Complete Core Features (Already Done ✅)
- ✅ Authentication system (register, login, JWT)
- ✅ User model with role-based access
- ✅ Book and digital resource models
- ✅ Borrowing system models
- ✅ Middleware (auth, error handling, rate limiting)
- ✅ Email and notification services
- ✅ Logging system

### Phase 2: Remaining Controllers & Routes (To Be Added)
- 📝 User management (CRUD operations)
- 📝 Book management (CRUD, search, filter)
- 📝 Digital resources management
- 📝 Borrowing operations (borrow, return, renew)
- 📝 Bookmarks
- 📝 Analytics dashboard
- 📝 Notifications

### Phase 3: Add Cron Jobs
- ⏰ Overdue book checker (runs daily)
- ⏰ Due date reminders
- ⏰ Analytics updater

### Phase 4: Frontend Development
- 🎨 React.js/Next.js frontend
- 🎨 Admin dashboard
- 🎨 Student/Teacher portal

## 📁 Project Structure

```
elibrary/
├── src/
│   ├── config/          ✅ Database, JWT, Multer config
│   ├── models/          ✅ All Mongoose models
│   ├── controllers/     ⚠️  Auth done, others pending
│   ├── routes/          ⚠️  Auth done, others pending
│   ├── middleware/      ✅ Auth, error handling, rate limiting
│   ├── services/        ✅ Email, notifications
│   ├── utils/           ✅ Helpers, logger, validator
│   ├── jobs/            ❌ To be created
│   ├── app.js           ✅ Express app configuration
│   └── server.js        ✅ Server startup
├── uploads/             ✅ File storage
├── logs/                ✅ Application logs
├── scripts/             ✅ Seed scripts
├── package.json         ✅
├── .env.example         ✅
└── README.md            ✅
```

## 🔧 Available NPM Scripts

```powershell
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start                # Production start

# Database
npm run seed:rbse        # Seed RBSE books and default users
npm run seed:ncert       # Seed NCERT books (to be created)

# Testing
npm test                 # Run tests (to be configured)

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
```

## 🔐 Default Credentials

After seeding, use these credentials to login:

**Administrator:**
- Email: `admin@rbselibrary.edu`
- Password: `Admin@123`

**Librarian:**
- Email: `librarian@rbselibrary.edu`
- Password: `Librarian@123`

**Student:**
- Email: `student@rbselibrary.edu`
- Password: `Student@123`
- Class: 10, Section: A

**Teacher:**
- Email: `teacher@rbselibrary.edu`
- Password: `Teacher@123`

## 📖 API Endpoints (Current)

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password
- `PUT /api/v1/auth/update-password` - Update password
- `POST /api/v1/auth/logout` - Logout

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running. Start it with:
```powershell
net start MongoDB
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the PORT in `.env` file or stop the process using port 5000:
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:** Install dependencies:
```powershell
npm install
```

## 📞 Support

For issues or questions:
- Check the `INTEGRATION_PLAN.md` for detailed documentation
- Review logs in `logs/` directory
- Contact: support@rbselibrary.edu

## 🎉 Success Indicators

✅ Server running without errors  
✅ MongoDB connected successfully  
✅ Health check returns 200 OK  
✅ Login with default credentials works  
✅ Token generation and validation works  

---

**Next Development Session:** Continue building remaining controllers and routes for complete functionality.

**Current Status:** 🟡 Core foundation ready, API partially functional
