# RBSE Digital Library - Frontend

Modern, responsive frontend built with Nuxt 3 for the RBSE Digital Library Management System.

## 🚀 Features

- ✅ Vue 3 with Composition API
- ✅ Server-Side Rendering (SSR)
- ✅ Nuxt UI Components
- ✅ Tailwind CSS
- ✅ Pinia State Management
- ✅ Vue I18n (Hindi + English)
- ✅ Role-based Access Control
- ✅ Responsive Design
- ✅ Dark Mode Support

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Backend API running on port 5001

## 🛠️ Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── assets/           # CSS, images, fonts
├── components/       # Reusable Vue components
├── composables/      # Composition API functions
├── layouts/          # Page layouts
├── locales/          # i18n translation files
├── middleware/       # Route middleware
├── pages/            # Application pages (auto-routed)
├── public/           # Static files
├── stores/           # Pinia stores
├── types/            # TypeScript types
└── nuxt.config.ts    # Nuxt configuration
```

## 🎨 Pages

### Public Pages
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### Authenticated Pages
- `/dashboard` - Role-based dashboard
- `/books` - Book catalog
- `/books/:id` - Book details
- `/digital-resources` - Digital resources
- `/borrowings` - Borrowing history
- `/profile` - User profile
- `/bookmarks` - Saved bookmarks

### Librarian/Admin Pages
- `/admin/books` - Manage books
- `/admin/users` - Manage users
- `/admin/borrowings` - Manage borrowings
- `/admin/analytics` - Analytics dashboard

## 🔐 Authentication

The app uses JWT token-based authentication:
- Token stored in localStorage
- Auto-refresh on page load
- Protected routes with middleware
- Role-based access control

## 🌐 Internationalization

- English (en)
- Hindi (hi)

Switch language using the language selector in the navbar.

## 🎨 Theming

- Light and Dark modes
- RBSE brand colors
- Customizable via Tailwind config

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🚢 Deploy

```bash
npm run generate  # For static hosting
# or
npm run build     # For Node.js hosting
```

## 📞 Support

For issues or questions, refer to the main project documentation.

---

**Version:** 1.0.0  
**Built with:** Nuxt 3, Vue 3, Tailwind CSS  
**License:** MIT
