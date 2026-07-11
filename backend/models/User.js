const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String, required: true, trim: true
  },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true
  },
  password: {
    type: String, required: true
  },
  role: {
    type: String, enum: ['customer', 'seller', 'admin'], default: 'customer'
  },
  shopName:        { type: String, default: '' },
  shopDescription: { type: String, default: '' },
  profileImage:    { type: String, default: '' },
  phone:           { type: String, default: '' },

  // Social media links
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    tiktok:    { type: String, default: '' },
    website:   { type: String, default: '' },
  },

  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true  },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);