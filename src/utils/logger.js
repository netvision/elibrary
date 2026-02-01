const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Configure transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),

  // Combined log file with rotation
  new DailyRotateFile({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: process.env.LOG_LEVEL || 'info',
  }),

  // Error log file with rotation
  new DailyRotateFile({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
  }),
];

// Create logger instance
const logger = winston.createLogger({
  format: logFormat,
  transports,
  exitOnError: false,
});

// Add stream for Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
