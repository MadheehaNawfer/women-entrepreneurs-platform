const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true
  },
  description: {
    type: String, required: true
  },
  price: {
    type: Number, required: true
  },
  stock: {
    type: Number, required: true, default: 0
  },
  lowStockAlert: {
    type:    Number,
    default: 5,
  },
  category: {
    type: String,
    enum: [
      'Jewelry & Accessories', 'Beauty & Skincare',
      'Food & Beverages', 'Clothing & Fashion',
      'Home & Decor', 'Handicrafts', 'Other'
    ],
    required: true
  },
  images: [{ type: String }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  reviews: [reviewSchema],
  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true  },
  rating:     { type: Number,  default: 0     },
  numReviews: { type: Number,  default: 0     },
}, { timestamps: true });


module.exports = mongoose.model('Product', productSchema);