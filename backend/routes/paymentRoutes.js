// paymentRoutes.js 

const express = require('express');
const router  = express.Router();
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect, customerOnly } = require('../middleware/authMiddleware');

// =============================================
// @route   POST /api/payment/create-payment-intent
// @desc    Create a payment intent for Stripe
// @access  Customers only
// =============================================
router.post('/create-payment-intent', protect, customerOnly, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Convert LKR to cents (Stripe uses smallest currency unit)
    // Stripe doesn't support LKR so we use USD for demo
    // 1 USD = ~300 LKR approximately
    const amountInCents = Math.round((amount / 300) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInCents,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount:       amountInCents,
    });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;