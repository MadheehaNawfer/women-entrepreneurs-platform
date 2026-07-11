// authMiddleware.js - The security guard of our backend
// Every protected route passes through here first

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =============================================
// protect - checks if user is logged in
// =============================================
const protect = async (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. No token found.' });
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // Verify the token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and attach to request
    // (so any route can access req.user)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next(); // move on to the actual route

  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// =============================================
// adminOnly - checks if user is an admin
// =============================================
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

// =============================================
// sellerOnly - checks if user is a seller
// =============================================
const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Sellers only.' });
  }
};

// =============================================
// customerOnly - checks if user is a customer
// =============================================
const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Customers only.' });
  }
};

module.exports = { protect, adminOnly, sellerOnly, customerOnly };