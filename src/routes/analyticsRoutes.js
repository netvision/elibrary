const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getPopularResources,
  getUserEngagement,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All analytics routes are protected and require admin/librarian role
router.use(protect);
router.use(authorize('admin', 'librarian'));

// Dashboard
router.get('/dashboard', getDashboard);

// Popular resources
router.get('/popular-resources', getPopularResources);

// User engagement
router.get('/user-engagement', getUserEngagement);

module.exports = router;
