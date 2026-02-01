# 🚀 Quick Start Guide - RBSE Digital Library

## ⚡ 3-Step Launch

### 1. Start MongoDB
```powershell
# Windows Service
net start MongoDB
```

### 2. Start Backend (Terminal 1)
```powershell
cd d:\dev\elibrary
npm run dev
```
✅ Backend running on **http://localhost:5001**

### 3. Start Frontend (Terminal 2)
```powershell
cd d:\dev\elibrary\frontend
npm run dev
```
✅ Frontend running on **http://localhost:3000**

---

## 🎯 Quick Test

### Login as Student
1. Open: http://localhost:3000
2. Click **Login**
3. Email: `student@rbse.local`
4. Password: `student123`
5. Click **Login** button

### Browse Books
1. Click **Books** in navigation
2. See 19 RBSE textbooks
3. Try searching for "Mathematics"
4. Filter by Class, Subject, or Language
5. Click any book to see details

### Switch Language
1. Click language dropdown in navbar
2. Select **हिंदी** (Hindi)
3. All UI text changes to Hindi

### Try Dark Mode
1. Click sun/moon icon in navbar
2. Toggle between light/dark themes

---

## 📁 Key Files

| File | Purpose | Location |
|------|---------|----------|
| Backend Server | Express API | `src/server.js` |
| Frontend App | Nuxt 3 UI | `frontend/app.vue` |
| Auth Store | User state | `frontend/stores/auth.ts` |
| API Helper | HTTP calls | `frontend/composables/useApi.ts` |
| Book Model | DB schema | `src/models/Book.js` |
| Seed Script | Sample data | `scripts/seedRBSEBooks.js` |

---

## 🔐 All Test Accounts

| Role | Email | Admission # | Password |
|------|-------|-------------|----------|
| Admin | admin@rbse.local | - | admin123456 |
| Librarian | librarian@rbse.local | - | librarian123 |
| Teacher | teacher@rbse.local | - | teacher123 |
| Student | student@rbse.local | STU001 | student123 |

---

## 🛠️ Useful Commands

### Backend
```powershell
cd d:\dev\elibrary

npm run dev           # Start dev server
npm run seed:rbse     # Seed RBSE books
npm run reset:db      # Reset database
```

### Frontend
```powershell
cd d:\dev\elibrary\frontend

npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

### Database
```powershell
# Connect to MongoDB
mongosh

# Use database
use rbse-elibrary

# View books
db.books.find().pretty()

# View users
db.users.find().pretty()

# Count documents
db.books.countDocuments()
```

---

## 📚 Documentation

- **[INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)** - Complete technical specification
- **[FRONTEND_COMPLETE.md](FRONTEND_COMPLETE.md)** - Frontend features & setup
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current project status
- **[frontend/SETUP.md](frontend/SETUP.md)** - Detailed frontend guide
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Full development setup

---

## 🎨 What's Built

✅ User authentication (register/login)  
✅ Book catalog with search & filters  
✅ Book details page  
✅ Dashboard with stats  
✅ Bilingual support (English + Hindi)  
✅ Dark/Light mode  
✅ Responsive design  
✅ Modern UI with Nuxt UI components  

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5001 (Backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force

# Kill process on port 3000 (Frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### MongoDB Not Running
```powershell
# Start MongoDB service
net start MongoDB

# Or check status
net start | findstr "MongoDB"
```

### Backend Won't Start
```powershell
# Check .env file exists
cat .env

# Reinstall dependencies
npm install

# Check MongoDB connection
mongosh --eval "db.version()"
```

### Frontend Won't Start
```powershell
cd frontend

# Reinstall dependencies
rm -r node_modules
npm install

# Check .env file
cat .env
```

---

## 🎉 Success Indicators

✅ Backend shows: `Server running on port 5001`  
✅ Backend shows: `MongoDB Connected: localhost`  
✅ Frontend shows: `Local: http://localhost:3000/`  
✅ Frontend loads without errors  
✅ Login works  
✅ Books display  

---

## 📞 Need Help?

1. Check [FRONTEND_COMPLETE.md](FRONTEND_COMPLETE.md) for features
2. Check [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) for API docs
3. Check logs in `logs/` directory
4. Check browser console for frontend errors (F12)

---

**Ready to go!** 🚀 Visit http://localhost:3000 and start exploring!
