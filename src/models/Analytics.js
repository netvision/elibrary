const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      default: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
    },
    totalBooks: {
      type: Number,
      default: 0,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalTeachers: {
      type: Number,
      default: 0,
    },
    activeBorrowings: {
      type: Number,
      default: 0,
    },
    overdueBooks: {
      type: Number,
      default: 0,
    },
    digitalAccessCount: {
      type: Number,
      default: 0,
    },
    newRegistrations: {
      type: Number,
      default: 0,
    },
    booksAddedToday: {
      type: Number,
      default: 0,
    },
    booksBorrowedToday: {
      type: Number,
      default: 0,
    },
    booksReturnedToday: {
      type: Number,
      default: 0,
    },
    finesCollectedToday: {
      type: Number,
      default: 0,
    },
    popularBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    popularDigitalResources: [
      {
        resourceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'DigitalResource',
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
analyticsSchema.index({ date: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
