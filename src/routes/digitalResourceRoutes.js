const express = require('express');
const router = express.Router();
const {
  getDigitalResources,
  getDigitalResource,
  accessDigitalResource,
  createDigitalResource,
  updateDigitalResource,
  deleteDigitalResource,
  getMyAccessHistory,
} = require('../controllers/digitalResourceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { uploadDigitalResource } = require('../config/multer');

// Public routes
router.get('/', getDigitalResources);
router.get('/:id', getDigitalResource);

// Protected routes - User
router.post('/:id/access', protect, accessDigitalResource);
router.get('/my/history', protect, getMyAccessHistory);

// Protected routes - Librarian/Admin
router.post('/', protect, authorize('librarian', 'admin'), uploadDigitalResource.single('file'), createDigitalResource);
router.put('/:id', protect, authorize('librarian', 'admin'), uploadDigitalResource.single('file'), updateDigitalResource);

// Protected routes - Admin only
router.delete('/:id', protect, authorize('admin'), deleteDigitalResource);

module.exports = router;
