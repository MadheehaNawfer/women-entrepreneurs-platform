// Order.js - Defines the structure of an Order in our database

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  // Which customer placed this order
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // List of products in this order
  orderItems: [
    {
      // Which product
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      // Product name (saved separately in case product is deleted later)
      name: { type: String, required: true },
      // How many of this product
      quantity: { type: Number, required: true },
      // Price at the time of order
      price: { type: Number, required: true },
      // Which seller sold this item
      seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }
  ],

  // Delivery address
  shippingAddress: {
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    province: { type: String, required: true },
    zipCode:  { type: String, required: true }
  },

  // Total price of the order
  totalPrice: {
    type: Number,
    required: true
  },

  // Payment status
  isPaid: {
    type: Boolean,
    default: false
  },

  // Order status
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },

  // Payment method chosen by customer
 paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Card', 'COD'],
    default: 'Cash on Delivery'
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);