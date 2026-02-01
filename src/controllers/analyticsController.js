const User = require('../models/User');
const DigitalResource = require('../models/DigitalResource');
const DigitalAccessLog = require('../models/DigitalAccessLog');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * @desc    Get analytics dashboard data
 * @route   GET /api/analytics/dashboard
 * @access  Private (Admin/Librarian only)
 */
const getDashboard = asyncHandler(async (req, res) => {
  try {
    // Get total resources
    const totalResources = await DigitalResource.countDocuments();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo },
    });

    // Get total access logs in current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalAccess = await DigitalAccessLog.countDocuments({
      accessDate: { $gte: startOfMonth },
    });

    // Get resource distribution by type
    const byType = {
      pdf: await DigitalResource.countDocuments({ type: 'pdf' }),
      video: await DigitalResource.countDocuments({ type: 'video' }),
      audio: await DigitalResource.countDocuments({ type: 'audio' }),
      ebook: await DigitalResource.countDocuments({ type: 'ebook' }),
    };

    // Get most accessed resource
    const topResources = await DigitalAccessLog.aggregate([
      {
        $match: {
          accessDate: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: '$resourceId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: 'digitalresources',
          localField: '_id',
          foreignField: '_id',
          as: 'resource',
        },
      },
      {
        $unwind: {
          path: '$resource',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const topResource = topResources.length > 0 ? topResources[0] : null;

    // Get recent access logs
    const recentAccess = await DigitalAccessLog.find()
      .populate('userId', 'name email')
      .populate('resourceId', 'title type')
      .sort({ accessDate: -1 })
      .limit(10);

    // Get resources by class
    const byClass = {};
    const classResources = await DigitalResource.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    classResources.forEach((item) => {
      if (item._id) {
        byClass[`Class ${item._id}`] = item.count;
      }
    });

    const dashboardData = {
      totalResources,
      totalUsers,
      activeUsers,
      totalAccess,
      topResource: topResource ? topResource.count : 0,
      byType,
      byClass,
      recentAccess: recentAccess.map((log) => ({
        _id: log._id,
        user: log.userId ? (log.userId.name || 'Unknown') : 'Unknown',
        resource: log.resourceId ? log.resourceId.title : 'Unknown',
        resourceType: log.resourceId ? log.resourceId.type : 'unknown',
        accessDate: log.accessDate,
      })),
    };

    logger.info('Analytics dashboard data retrieved');

    return sendSuccess(res, 200, 'Analytics data retrieved successfully', dashboardData);
  } catch (error) {
    logger.error(`Error fetching analytics data: ${error.message}`);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Failed to fetch analytics data');
  }
});

/**
 * @desc    Get popular resources
 * @route   GET /api/analytics/popular-resources
 * @access  Private (Admin/Librarian only)
 */
const getPopularResources = asyncHandler(async (req, res) => {
  const { limit = 10, days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const popularResources = await DigitalAccessLog.aggregate([
    {
      $match: {
        accessDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$resourceId',
        accessCount: { $sum: 1 },
      },
    },
    {
      $sort: { accessCount: -1 },
    },
    {
      $limit: parseInt(limit),
    },
    {
      $lookup: {
        from: 'digitalresources',
        localField: '_id',
        foreignField: '_id',
        as: 'resource',
      },
    },
    {
      $unwind: {
        path: '$resource',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: '$resource._id',
        title: '$resource.title',
        type: '$resource.type',
        accessCount: 1,
      },
    },
  ]);

  logger.info(`Retrieved ${popularResources.length} popular resources`);

  return sendSuccess(res, 200, 'Popular resources retrieved successfully', {
    resources: popularResources,
    period: `Last ${days} days`,
  });
});

/**
 * @desc    Get user engagement metrics
 * @route   GET /api/analytics/user-engagement
 * @access  Private (Admin/Librarian only)
 */
const getUserEngagement = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  // Get daily access counts
  const dailyEngagement = await DigitalAccessLog.aggregate([
    {
      $match: {
        accessDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$accessDate' },
        },
        accessCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        date: '$_id',
        accessCount: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        _id: 0,
      },
    },
  ]);

  // Get top users by access count
  const topUsers = await DigitalAccessLog.aggregate([
    {
      $match: {
        accessDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$userId',
        accessCount: { $sum: 1 },
      },
    },
    {
      $sort: { accessCount: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: '$user._id',
        name: {
          $concat: ['$user.firstName', ' ', '$user.lastName'],
        },
        email: '$user.email',
        accessCount: 1,
      },
    },
  ]);

  logger.info('Retrieved user engagement metrics');

  return sendSuccess(res, 200, 'User engagement metrics retrieved successfully', {
    dailyEngagement,
    topUsers,
    period: `Last ${days} days`,
  });
});

module.exports = {
  getDashboard,
  getPopularResources,
  getUserEngagement,
};
