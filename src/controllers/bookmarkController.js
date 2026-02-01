const Bookmark = require('../models/Bookmark');
const DigitalResource = require('../models/DigitalResource');
const logger = require('../utils/logger');

/**
 * @desc    Get user's bookmarks
 * @route   GET /api/v1/bookmarks
 * @access  Private
 */
exports.getBookmarks = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };

    const bookmarks = await Bookmark.find(filter)
      .populate({
        path: 'resourceId',
        select: 'title author coverImage subject class type fileUrl accessCount',
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks,
    });
  } catch (error) {
    logger.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmarks',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a bookmark
 * @route   POST /api/v1/bookmarks
 * @access  Private
 */
exports.createBookmark = async (req, res, next) => {
  try {
    const { resourceId, notes } = req.body;

    // Check if resource exists
    const resource = await DigitalResource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Digital resource not found',
      });
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      userId: req.user._id,
      resourceId,
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'Bookmark already exists',
      });
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      userId: req.user._id,
      resourceId,
      notes,
    });

    await bookmark.populate({
      path: 'resourceId',
      select: 'title author coverImage subject class type fileUrl accessCount',
    });

    logger.info(`Bookmark created: ${bookmark._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Bookmark created successfully',
      data: bookmark,
    });
  } catch (error) {
    logger.error('Error creating bookmark:', error);
    
    // Handle duplicate bookmark error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bookmark already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating bookmark',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a bookmark
 * @route   DELETE /api/v1/bookmarks/:id
 * @access  Private
 */
exports.deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
    }

    // Check permission
    if (bookmark.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this bookmark',
      });
    }

    await bookmark.deleteOne();

    logger.info(`Bookmark deleted: ${req.params.id} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Bookmark deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting bookmark',
      error: error.message,
    });
  }
};

/**
 * @desc    Update bookmark notes
 * @route   PUT /api/v1/bookmarks/:id
 * @access  Private
 */
exports.updateBookmark = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
    }

    // Check permission
    if (bookmark.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bookmark',
      });
    }

    bookmark.notes = notes;
    await bookmark.save();

    await bookmark.populate({
      path: 'resourceId',
      select: 'title author coverImage subject class type fileUrl accessCount',
    });

    logger.info(`Bookmark updated: ${req.params.id} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Bookmark updated successfully',
      data: bookmark,
    });
  } catch (error) {
    logger.error('Error updating bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bookmark',
      error: error.message,
    });
  }
};
