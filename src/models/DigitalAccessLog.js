const mongoose = require('mongoose');

const digitalAccessLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DigitalResource',
      required: [true, 'Resource ID is required'],
    },
    accessDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
digitalAccessLogSchema.index({ userId: 1, accessDate: -1 });
digitalAccessLogSchema.index({ resourceId: 1, accessDate: -1 });
digitalAccessLogSchema.index({ accessDate: -1 });

const DigitalAccessLog = mongoose.model('DigitalAccessLog', digitalAccessLogSchema);

module.exports = DigitalAccessLog;
