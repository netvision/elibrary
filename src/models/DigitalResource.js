const mongoose = require('mongoose');

const digitalResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: ['ebook', 'pdf', 'video', 'audio', 'streaming'],
    },
    author: {
      type: String,
      trim: true,
      maxlength: [200, 'Author name cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    class: {
      type: Number,
      min: 1,
      max: 12,
    },
    board: {
      type: String,
      enum: ['RBSE', 'NCERT', 'CBSE', 'Other'],
      default: 'RBSE',
    },
    resourceLanguage: {
      type: String,
      required: [true, 'Language is required'],
      enum: ['Hindi', 'English', 'Sanskrit', 'Other'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    streamingUrl: {
      type: String,
      default: null,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Increment access count method
digitalResourceSchema.methods.incrementAccessCount = async function () {
  this.accessCount += 1;
  await this.save();
};

// Indexes for better query performance
// Text index for search (using 'none' for language since we have multilingual content)
digitalResourceSchema.index(
  { title: 'text', author: 'text', subject: 'text', description: 'text' },
  { default_language: 'none' }
);
digitalResourceSchema.index({ type: 1, board: 1, class: 1 });
digitalResourceSchema.index({ board: 1, class: 1, resourceLanguage: 1 });
digitalResourceSchema.index({ accessCount: -1 });
digitalResourceSchema.index({ tags: 1 });

const DigitalResource = mongoose.model('DigitalResource', digitalResourceSchema);

module.exports = DigitalResource;
