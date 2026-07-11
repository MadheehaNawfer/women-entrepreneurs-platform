// orderRoutes.js - Handles all order operations

const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const User    = require('../models/User');
const { protect, customerOnly } = require('../middleware/authMiddleware');
const { sendOrderConfirmation, sendStatusUpdateEmail } = require('../utils/emailService');

// =============================================
// @route   POST /api/orders
// @desc    Customer places an order
// @access  Customers only
// =============================================
router.post('/', protect, customerOnly, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;
console.log('isPaid received:', req.body.isPaid);
console.log('stripePaymentId:', req.body.stripePaymentId);

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    for (let item of orderItems) {
      if (!item.product) {
        return res.status(400).json({ message: 'Each item must have a product ID' });
      }
      if (!item.seller) {
        return res.status(400).json({ message: 'Each item must have a seller ID' });
      }
    }

    const calculatedTotal = orderItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    
// Check and update stock for each item
for (let item of orderItems) {
  const product = await require('../models/Product').findById(item.product);
  if (!product) {
    return res.status(404).json({ message: `Product not found: ${item.name}` });
  }
  if (product.stock < item.quantity) {
    return res.status(400).json({
      message: `Sorry! Only ${product.stock} item(s) left in stock for "${product.name}"`
    });
  }
  // Decrease stock
  await require('../models/Product').findByIdAndUpdate(
    item.product,
    { $inc: { stock: -item.quantity } },
    { new: true }
  );
}
   const order = new Order({
  customer:        req.user.id,
  orderItems,
  shippingAddress,
  totalPrice:      totalPrice || calculatedTotal,
  paymentMethod:   paymentMethod || 'Cash on Delivery',
  isPaid:          req.body.isPaid || false,
  stripePaymentId: req.body.stripePaymentId || null,
});

    await order.save();

    // Send order confirmation email
    try {
      const customer = await User.findById(req.user.id);
      await sendOrderConfirmation(order, customer);
      console.log('✅ Order confirmation email sent to', customer.email);
    } catch (emailErr) {
      console.error('❌ Email error:', emailErr.message);
    }

    res.status(201).json({ message: 'Order placed successfully!', order });

  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// =============================================
// @route   GET /api/orders/myorders
// @desc    Customer views their own orders
// @access  Customers only
// =============================================
router.get('/myorders', protect, customerOnly, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('orderItems.product', 'name images price')
      .populate('orderItems.seller', 'name shopName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   GET /api/orders/sellerorders
// @desc    Seller views orders containing their products
// @access  Private
// =============================================
router.get('/sellerorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ 'orderItems.seller': req.user.id })
      .populate('customer', 'name email')
      .populate('orderItems.product', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   PUT /api/orders/:id/status
// @desc    Seller updates order status
// @access  Private
// =============================================
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // Send status update email to customer
    try {
      const customer = await User.findById(order.customer);
      await sendStatusUpdateEmail(order, customer);
      console.log('✅ Status update email sent to', customer.email);
    } catch (emailErr) {
      console.error('❌ Email error:', emailErr.message);
    }

    res.json({ message: 'Order status updated', order });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// =============================================
// @route   PUT /api/orders/:id/cancel
// @desc    Customer cancels their order
// @access  Customers only
// =============================================
router.put('/:id/cancel', protect, customerOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = 'Cancelled';
    await order.save();

    // Send cancellation email
    try {
      const customer = await User.findById(req.user.id);
      await sendStatusUpdateEmail(order, customer);
      console.log('✅ Cancellation email sent to', customer.email);
    } catch (emailErr) {
      console.error('❌ Email error:', emailErr.message);
    }

    res.json({ message: 'Order cancelled successfully', order });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;