// adminRoutes.js 

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// =============================================
// @route   GET /api/admin/users
// @desc    Admin gets all users
// @access  Admin only
// =============================================
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   PUT /api/admin/sellers/:id/approve
// @desc    Admin approves a seller
// @access  Admin only
// =============================================
router.put('/sellers/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    res.json({ message: 'Seller approved successfully!', seller });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   PUT /api/admin/products/:id/approve
// @desc    Admin approves a product
// @access  Admin only
// =============================================
router.put('/products/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product approved successfully!', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   DELETE /api/admin/users/:id
// @desc    Admin deactivates a user
// @access  Admin only
// =============================================
router.put('/users/:id/deactivate', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json({ message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   GET /api/admin/stats
// @desc    Admin dashboard statistics
// @access  Admin only
// =============================================
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: 'customer' });
    const totalSellers  = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments({ isApproved: true });
    const totalOrders   = await Order.countDocuments();
    const pendingSellers  = await User.countDocuments({ role: 'seller', isApproved: false });
    const pendingProducts = await Product.countDocuments({ isApproved: false });

    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      pendingSellers,
      pendingProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
// =============================================
// @route   GET /api/admin/products/pending
// @desc    Admin gets all pending products
// @access  Admin only
// =============================================
router.get('/products/pending', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false })
      .populate('seller', 'name shopName email')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   GET /api/admin/products/all
// @desc    Admin gets ALL products
// @access  Admin only
// =============================================
router.get('/products/all', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find()
      .populate('seller', 'name shopName')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   PUT /api/admin/products/:id/reject
// @desc    Admin rejects a product
// @access  Admin only
// =============================================
router.put('/products/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isActive: false },
      { new: true }
    );
    res.json({ message: 'Product rejected', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});