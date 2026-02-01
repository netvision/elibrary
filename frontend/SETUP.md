# RBSE Digital Library - Frontend Setup Guide

## ✅ Installation Complete!

Your Nuxt 3 frontend has been successfully created with all necessary components.

## 📦 What's Included

### Configuration Files
- ✅ `package.json` - All dependencies configured
- ✅ `nuxt.config.ts` - Nuxt 3 configuration with modules
- ✅ `.env` - Environment variables (API endpoint)
- ✅ `app.vue` - Main app component
- ✅ `assets/css/main.css` - Tailwind CSS styles

### Localization (i18n)
- ✅ `locales/en.json` - Complete English translations
- ✅ `locales/hi.json` - Complete Hindi translations (हिंदी)

### State Management
- ✅ `stores/auth.ts` - Pinia store for authentication

### Composables
- ✅ `composables/useApi.ts` - Authenticated API calls
- ✅ Built-in `useToast()` from @nuxt/ui for notifications

### Middleware
- ✅ `middleware/auth.ts` - Protected route guard
- ✅ `middleware/guest.ts` - Guest-only route guard

### Layouts
- ✅ `layouts/default.vue` - Main layout with navbar, footer
- ✅ `layouts/auth.vue` - Authentication pages layout

### Pages
#### Public Pages
- ✅ `pages/index.vue` - Landing page with hero section
- ✅ `pages/login.vue` - Login form (email or admission number)
- ✅ `pages/register.vue` - Registration form

#### Protected Pages
- ✅ `pages/dashboard.vue` - User dashboard with stats
- ✅ `pages/books/index.vue` - Books catalog with search/filters
- ✅ `pages/books/[id].vue` - Book details and borrow

### Components
- ✅ `components/BookCard.vue` - Book card component

## 🚀 How to Run

### 1. Make sure Backend is Running
First, ensure your backend server is running on port 5001:

```bash
# In the root directory (d:\dev\elibrary)
npm run dev
```

### 2. Start Frontend Development Server

```bash
# Navigate to frontend directory
cd d:\dev\elibrary\frontend

# Start dev server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## 🔑 Test Credentials

Use these default accounts to test:

### Admin Account
- **Email:** `admin@rbse.local`
- **Password:** `admin123456`

### Librarian Account
- **Email:** `librarian@rbse.local`
- **Password:** `librarian123`

### Teacher Account
- **Email:** `teacher@rbse.local`
- **Password:** `teacher123`

### Student Account
- **Email:** `student@rbse.local`
- **Admission Number:** `STU001`
- **Password:** `student123`

## 🎯 Features to Test

### 1. Authentication
- ✅ Login with email or admission number
- ✅ Register new account
- ✅ Role-based access (student, teacher, librarian, admin)
- ✅ Auto-redirect based on authentication status

### 2. Bilingual Support
- ✅ Switch between English and Hindi (हिंदी)
- ✅ Language selector in navigation bar
- ✅ All UI text translated

### 3. Book Catalog
- ✅ Browse all books
- ✅ Search books by title, author, description
- ✅ Filter by class, subject, language
- ✅ View book details
- ✅ Check availability status

### 4. Dashboard
- ✅ View borrowing statistics
- ✅ Recent activity
- ✅ Popular books
- ✅ Quick actions

### 5. Book Borrowing
- ✅ Borrow available books
- ✅ Add bookmarks
- ✅ View digital resources

### 6. UI/UX
- ✅ Dark/Light mode toggle
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth transitions and animations
- ✅ Toast notifications
- ✅ Loading states

## 📱 Responsive Design

The frontend is fully responsive:
- 📱 Mobile (< 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (> 1024px)

## 🎨 UI Framework

Built with:
- **Nuxt UI** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Heroicons** - Beautiful icons
- **Dark Mode** - Built-in support

## 🔧 Configuration

### API Endpoint
Edit `frontend/.env` to change the backend API endpoint:

```env
NUXT_PUBLIC_API_BASE=http://localhost:5001/api/v1
```

### School Name
Customize your school name:

```env
NUXT_PUBLIC_SCHOOL_NAME=Your School Name
```

## 📊 Project Structure

```
frontend/
├── .nuxt/                    # Auto-generated (ignored)
├── assets/
│   └── css/
│       └── main.css          # Global styles
├── components/
│   └── BookCard.vue          # Book card component
├── composables/
│   └── useApi.ts             # API helper
├── layouts/
│   ├── auth.vue              # Auth layout
│   └── default.vue           # Default layout
├── locales/
│   ├── en.json               # English translations
│   └── hi.json               # Hindi translations
├── middleware/
│   ├── auth.ts               # Auth guard
│   └── guest.ts              # Guest guard
├── node_modules/             # Dependencies (ignored)
├── pages/
│   ├── books/
│   │   ├── [id].vue          # Book details
│   │   └── index.vue         # Book catalog
│   ├── dashboard.vue         # Dashboard
│   ├── index.vue             # Landing page
│   ├── login.vue             # Login page
│   └── register.vue          # Register page
├── public/                   # Static files
├── stores/
│   └── auth.ts               # Auth store
├── .env                      # Environment variables
├── .gitignore
├── app.vue                   # Main app
├── nuxt.config.ts            # Nuxt config
├── package.json              # Dependencies
├── README.md                 # Frontend README
└── SETUP.md                  # This file
```

## 🐛 Troubleshooting

### Backend Not Connected
If you see API errors, check:
1. Backend server is running on port 5001
2. MongoDB is running and connected
3. `.env` file has correct API endpoint

### Port Already in Use
If port 3000 is busy:
```bash
npm run dev -- --port 3001
```

### Module Not Found
If you see missing module errors:
```bash
npm install
```

## 📝 Next Steps

### Additional Pages to Build
- `/borrowings` - User's borrowing history
- `/digital-resources` - Digital resource library
- `/profile` - User profile management
- `/bookmarks` - Saved bookmarks
- `/admin/*` - Admin panel pages

### Additional Features
- File upload for book covers
- PDF viewer for digital resources
- Email notifications
- Advanced search with filters
- Analytics charts
- User reviews and ratings

## 🚢 Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## 📚 Resources

- [Nuxt 3 Documentation](https://nuxt.com)
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vue 3 Documentation](https://vuejs.org)
- [Pinia Documentation](https://pinia.vuejs.org)

## 🎉 Success!

Your RBSE Digital Library frontend is ready! Start the dev server and visit http://localhost:3000 to see it in action.

---

**Built with ❤️ using Nuxt 3 + Vue 3 + Tailwind CSS**
