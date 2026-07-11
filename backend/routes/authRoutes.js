// authRoutes.js - Handles Register, Login and Profile

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const User    = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// ===== MULTER SETUP FOR PROFILE IMAGES =====
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

// =============================================
// @route   POST /api/auth/register
// @desc    Register a new user (customer or seller)
// @access  Public
// =============================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, shopName, shopDescription, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      shopName:        role === 'seller' ? shopName : '',
      shopDescription: role === 'seller' ? shopDescription : '',
      phone,
      isApproved: role === 'seller' ? false : true
    });

    await user.save();

    res.status(201).json({
      message: role === 'seller'
        ? 'Seller registered! Please wait for admin approval.'
        : 'Customer registered successfully!'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// =============================================
// @route   POST /api/auth/login
// @desc    Login user and return a token
// @access  Public
// =============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }

    if (user.role === 'seller' && !user.isApproved) {
      return res.status(403).json({ message: 'Your seller account is pending admin approval' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        shopName:     user.shopName,
        profileImage: user.profileImage,
        isApproved:   user.isApproved,
        phone:        user.phone,
        socialLinks:  user.socialLinks,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// =============================================
// @route   GET /api/auth/profile
// @desc    Get logged in user's profile
// @access  Private
// =============================================
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   PUT /api/auth/profile/update
// @desc    Update user profile
// @access  Private
// =============================================
router.put('/profile/update', protect, uploadProfile.single('profileImage'), async (req, res) => {
  try {
    const {
      name, phone, shopName, shopDescription,
      instagram, facebook, tiktok, website
    } = req.body;

    const updates = {
      name,
      phone,
      shopName,
      shopDescription,
      socialLinks: { instagram, facebook, tiktok, website }
    };

    if (req.file) {
      updates.profileImage = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, updates, { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully!', user: updatedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   PUT /api/auth/profile/password
// @desc    Change password
// @access  Private
// =============================================
router.put('/profile/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;