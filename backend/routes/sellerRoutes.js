// sellerRoutes.js - Public seller profile routes

const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Product = require('../models/Product');

// =============================================
// @route   GET /api/sellers
// @desc    Get all approved sellers
// @access  Public
// =============================================
router.get('/', async (req, res) => {
  try {
    const sellers = await User.find({
      role:       'seller',
      isApproved: true,
      isActive:   true,
    }).select('name shopName shopDescription profileImage socialLinks createdAt');

    res.json(sellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   GET /api/sellers/:id
// @desc    Get single seller profile + their products
// @access  Public
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const seller = await User.findOne({
      _id:        req.params.id,
      role:       'seller',
      isApproved: true,
      isActive:   true,
    }).select('name shopName shopDescription profileImage socialLinks createdAt');

    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    // Get seller's approved products
    const products = await Product.find({
      seller:     req.params.id,
      isApproved: true,
      isActive:   true,
    }).sort({ createdAt: -1 });

    res.json({ seller, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;