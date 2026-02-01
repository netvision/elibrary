const DigitalResource = require('../models/DigitalResource');
const DigitalAccessLog = require('../models/DigitalAccessLog');
const logger = require('../utils/logger');

/**
 * @desc    Get all digital resources
 * @route   GET /api/v1/digital-resources
 * @access  Public
 */
exports.getDigitalResources = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      subject,
      class: classNumber,
      board,
      language,
      sort = '-createdAt',
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (subject) {
      filter.subject = { $regex: subject, $options: 'i' };
    }

    if (classNumber) {
      filter.class = parseInt(classNumber);
    }

    if (board) {
      filter.board = board;
    }

    if (language) {
      filter.resourceLanguage = language;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const resources = await DigitalResource.find(filter)
      .populate('uploadedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DigitalResource.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: resources,
    });
  } catch (error) {
    logger.error('Error fetching digital resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching digital resources',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single digital resource
 * @route   GET /api/v1/digital-resources/:id
 * @access  Public
 */
exports.getDigitalResource = async (req, res, next) => {
  try {
    const resource = await DigitalResource.findById(req.params.id).populate(
      'uploadedBy',
      'name email'
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Digital resource not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    logger.error('Error fetching digital resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching digital resource',
      error: error.message,
    });
  }
};

/**
 * @desc    Access a digital resource
 * @route   POST /api/v1/digital-resources/:id/access
 * @access  Private
 */
exports.accessDigitalResource = async (req, res, next) => {
  try {
    const resource = await DigitalResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Digital resource not found',
      });
    }

    if (!resource.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This resource is not currently available',
      });
    }

    // Log the access
    await DigitalAccessLog.create({
      userId: req.user._id,
      resourceId: resource._id,
    });

    // Increment access count
    resource.accessCount += 1;
    await resource.save();

    logger.info(`Digital resource accessed: ${resource._id} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Resource access logged',
      data: {
        resourceId: resource._id,
        fileUrl: resource.fileUrl,
        title: resource.title,
        type: resource.type,
      },
    });
  } catch (error) {
    logger.error('Error accessing digital resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing digital resource',
      error: error.message,
    });
  }
};

/**
 * @desc    Create digital resource
 * @route   POST /api/v1/digital-resources
 * @access  Private (Librarian/Admin)
 */
exports.createDigitalResource = async (req, res, next) => {
  try {
    // Check if file was uploaded or streaming URL provided
    if (!req.file && req.body.type !== 'streaming') {
      return res.status(400).json({
        success: false,
        message: 'File is required for non-streaming resources',
      });
    }

    if (req.body.type === 'streaming' && !req.body.streamingUrl) {
      return res.status(400).json({
        success: false,
        message: 'Streaming URL is required for streaming resources',
      });
    }

    // Build the resource data
    const resourceData = {
      title: req.body.title,
      description: req.body.description || '',
      type: req.body.type,
      author: req.body.author || '',
      subject: req.body.subject,
      class: req.body.class ? parseInt(req.body.class) : null,
      board: req.body.board || 'RBSE',
      resourceLanguage: req.body.language || req.body.resourceLanguage, // Support both field names
      uploadedBy: req.user._id,
      isActive: true,
    };

    // Handle file upload for non-streaming resources
    if (req.body.type !== 'streaming' && req.file) {
      resourceData.fileUrl = `/uploads/digital-resources/${req.file.filename}`;
      resourceData.fileSize = req.file.size;
    }

    // Handle streaming URL
    if (req.body.type === 'streaming' && req.body.streamingUrl) {
      resourceData.fileUrl = req.body.streamingUrl; // Store URL as fileUrl
      resourceData.streamingUrl = req.body.streamingUrl;
      resourceData.fileSize = 0; // No file size for streaming
    }

    const resource = await DigitalResource.create(resourceData);

    logger.info(`Digital resource created: ${resource._id} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Digital resource created successfully',
      data: resource,
    });
  } catch (error) {
    // Delete uploaded file if validation fails
    if (req.file) {
      const fs = require('fs');
      const path = require('path');
      fs.unlink(path.join(req.file.destination, req.file.filename), (err) => {
        if (err) logger.error('Error deleting file:', err);
      });
    }

    logger.error('Error creating digital resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating digital resource',
      error: error.message,
    });
  }
};

/**
 * @desc    Update digital resource
 * @route   PUT /api/v1/digital-resources/:id
 * @access  Private (Librarian/Admin)
 */
exports.updateDigitalResource = async (req, res, next) => {
  try {
    let resource = await DigitalResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Digital resource not found',
      });
    }

    // Don't allow updating uploadedBy or accessCount
    delete req.body.uploadedBy;
    delete req.body.accessCount;

    resource = await DigitalResource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Digital resource updated: ${resource._id} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Digital resource updated successfully',
      data: resource,
    });
  } catch (error) {
    logger.error('Error updating digital resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating digital resource',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete digital resource
 * @route   DELETE /api/v1/digital-resources/:id
 * @access  Private (Admin only)
 */
exports.deleteDigitalResource = async (req, res, next) => {
  try {
    const resource = await DigitalResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Digital resource not found',
      });
    }

    // Soft delete - just mark as inactive
    resource.isActive = false;
    await resource.save();

    logger.info(`Digital resource deleted: ${req.params.id} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Digital resource deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting digital resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting digital resource',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's access history
 * @route   GET /api/v1/digital-resources/my/history
 * @access  Private
 */
exports.getMyAccessHistory = async (req, res, next) => {
  try {
    const history = await DigitalAccessLog.find({ userId: req.user._id })
      .populate('resourceId', 'title type author subject')
      .sort('-accessedAt')
      .limit(50);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    logger.error('Error fetching access history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching access history',
      error: error.message,
    });
  }
};
