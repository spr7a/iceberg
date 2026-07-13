const mongoose = require('mongoose');

const mediaLibrarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mediaType: {
      type: String,
      required: true,
      enum: ['movie', 'tv', 'music', 'game', 'book'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    releaseYear: {
      type: String,
      default: '',
    },
    dossierText: {
      type: String,
      default: '',
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
    lastViewed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saves for the same user + title
mediaLibrarySchema.index({ user: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('MediaLibrary', mediaLibrarySchema);