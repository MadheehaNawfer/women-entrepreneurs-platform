// server.js - This is the main entry point of our backend

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE =====
// These lines allow our server to understand JSON data and handle requests from the frontend
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ===== DATABASE CONNECTION =====

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// ===== ROUTES =====

// We'll add these one by one as we build each feature
app.use('/api/auth',    require('./routes/authRoutes'));       // Login & Register
app.use('/api/products', require('./routes/productRoutes'));   // Products
app.use('/api/orders',   require('./routes/orderRoutes'));     // Orders
app.use('/api/admin',    require('./routes/adminRoutes'));     // Admin
app.use('/api/sellers',  require('./routes/sellerRoutes'));

// ===== TEST ROUTE =====
// Visit http://localhost:5000 to check if server is running
app.get('/', (req, res) => {
  res.send('🌸 Women Entrepreneurs Platform API is Running!');
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// ... all your existing code above (middleware, routes, etc.)

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = app;   // ← add this new line at the very end