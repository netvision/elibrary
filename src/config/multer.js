const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration for book covers
const bookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', 'books');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for digital resources
const digitalResourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', 'digital-resources');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'resource-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', 'profiles');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

// File filter for PDFs and documents
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|epub/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files are allowed (pdf, doc, docx, epub)'));
  }
};

// File filter for media files
const mediaFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|epub|mp3|mp4|avi|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

// Multer upload configurations
const uploadBookCover = multer({
  storage: bookStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter: imageFileFilter,
});

const uploadDigitalResource = multer({
  storage: digitalResourceStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 }, // 50MB default
  fileFilter: mediaFileFilter,
});

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for profile images
  fileFilter: imageFileFilter,
});

module.exports = {
  uploadBookCover,
  uploadDigitalResource,
  uploadProfileImage,
};
