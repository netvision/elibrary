const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['overdue', 'due_soon', 'new_book', 'announcement', 'fine', 'return', 'borrow'],
      default: 'announcement',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedType: {
      type: String,
      enum: ['Book', 'DigitalResource', 'Borrowing', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Mark notification as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  await this.save();
};

// Indexes for better query performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
