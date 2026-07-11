const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Product  = require('../models/Product');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

// ===== MULTER SETUP =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/products';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// =============================================
// GET /api/products/seller/myproducts
// IMPORTANT: This must be BEFORE /:id route!
// =============================================
router.get('/seller/myproducts', protect, sellerOnly, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// GET /api/products — all approved products
// =============================================
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { isApproved: true, isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('seller', 'name shopName')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// GET /api/products/:id — single product
// =============================================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name shopName shopDescription')
      .populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// POST /api/products — add product with images
// =============================================
router.post('/', protect, sellerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Build image URLs from uploaded files
    const images = req.files?.map(file =>
      `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`
    ) || [];

    const product = new Product({
      name, description,
      price: Number(price),
      stock: Number(stock),
      category, images,
      seller: req.user.id
    });

    await product.save();
    res.status(201).json({ message: 'Product added! Waiting for admin approval.', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// =============================================
// PUT /api/products/:id — update product
// =============================================
router.put('/:id', protect, sellerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const updates = { ...req.body };
    if (req.files?.length > 0) {
      updates.images = req.files.map(file =>
        `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`
      );
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// DELETE /api/products/:id
// =============================================
router.delete('/:id', protect, sellerOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// POST /api/products/:id/reviews — add review
// =============================================
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user.id
    );
    if (alreadyReviewed)
      return res.status(400).json({ message: 'You already reviewed this product' });

    const review = {
      user:    req.user.id,
      name:    req.user.name,
      rating:  Number(rating),
      comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
    await product.save();

    res.status(201).json({ message: 'Review added!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;