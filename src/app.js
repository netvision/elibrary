const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const digitalResourceRoutes = require('./routes/digitalResourceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Trust proxy (nginx/reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'self'", 'http://localhost:3000', 'http://localhost:5001', 'https://rbse-elibrary.netlify.app', 'blob:'],
      frameAncestors: ["'self'", 'https://rbse-elibrary.netlify.app'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'"],
    },
    reportOnly: false,
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://rbse-elibrary.netlify.app'
];

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || allowedOrigins,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware for static files - applies before serving files
const staticCors = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || process.env.CORS_ORIGIN) {
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};

// Apply CORS to static files
app.use('/uploads', staticCors);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '24h',
  etag: false
}));

// Apply rate limiting to all routes
if (process.env.NODE_ENV === 'production') {
  app.use(apiLimiter);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RBSE Digital Library API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/bookmarks`, bookmarkRoutes);
app.use(`/api/${API_VERSION}/digital-resources`, digitalResourceRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to RBSE Digital Library API',
    version: API_VERSION,
    documentation: `/api/${API_VERSION}/docs`,
  });
});

// Handle 404 errors
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
