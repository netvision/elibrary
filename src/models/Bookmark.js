const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Resource ID is required'],
      ref: 'DigitalResource',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique bookmark per user per resource
bookmarkSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

// Indexes for better query performance
bookmarkSchema.index({ userId: 1, createdAt: -1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
