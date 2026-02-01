require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 RBSE Digital Library API`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  logger.error(err.stack);
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
