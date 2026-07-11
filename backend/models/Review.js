// Review.js - Defines the structure of a Product Review

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

  // Which product is being reviewed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // Who wrote the review
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Customer's name (for display)
  customerName: {
    type: String,
    required: true
  },

  // Star rating out of 5
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // Written review
  comment: {
    type: String,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);