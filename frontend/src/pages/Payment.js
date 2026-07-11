// Payment.js - Dedicated Stripe payment page

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle, ShoppingBag } from 'lucide-react';
import { createPaymentIntent, placeOrder } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// ===== PAYMENT FORM =====
const PaymentForm = ({ cart, cartTotal, address, onSuccess, onError }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading,   setLoading]   = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { clientSecret } = await createPaymentIntent(cartTotal);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        onError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #ede8e9',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {/* Card number */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f0f1' }}>
          <div style={{ fontSize:'11px', color:'#9a7080', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px', fontFamily:'Inter,sans-serif', fontWeight:'600' }}>
            Card Number
          </div>
  <CardElement
  onChange={e => setCardReady(e.complete)}
  options={{
    disableLink: true,
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        color: '#1a0f13',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: '400',
        '::placeholder': { color: '#c4909a' },
        iconColor: '#c0566a',
      },
      invalid: { color: '#dc2626', iconColor: '#dc2626' },
    },
  }}
/>
        </div>

        {/* Secure badge */}
        <div style={{ padding:'12px 24px', background:'#faf7f8', display:'flex', alignItems:'center', gap:'8px' }}>
          <Lock size={12} color="#9a7080" />
          <span style={{ fontSize:'11px', color:'#9a7080', fontFamily:'Inter,sans-serif' }}>
            Your card details are encrypted and secure
          </span>
        </div>
      </div>

     

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || loading || !cardReady}
        style={{
          width: '100%',
          padding: '16px',
          background: loading ? '#9a7080' : 'linear-gradient(135deg, #8c3a4e, #c0566a)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          fontFamily: 'Inter,sans-serif',
          cursor: loading || !cardReady ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.2s',
          opacity: !cardReady ? 0.7 : 1,
        }}>
        <Lock size={16} />
        {loading ? 'Processing Payment...' : `Pay Securely • LKR ${cartTotal?.toLocaleString()}`}
      </button>

      {/* Powered by Stripe */}
      <div style={{ textAlign:'center', marginTop:'16px', fontSize:'12px', color:'#9a7080', fontFamily:'Inter,sans-serif' }}>
        🔒 Powered by <strong>Stripe</strong> — 256-bit SSL encryption
      </div>
    </form>
  );
};

// ===== MAIN PAYMENT PAGE =====
const Payment = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState(null);
  

  // Get data passed from cart
  const { cart, cartTotal, address, orderItems } = location.state || {};

 useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/customer');
    }
  }, [cart, navigate]);

  const handleSuccess = async (paymentIntentId) => {
    
    try {
      await placeOrder({
        orderItems,
        shippingAddress: address,
        totalPrice:      cartTotal,
        paymentMethod:   'Card',
        stripePaymentId: paymentIntentId,
        isPaid:          true,
      });

      // Clear cart from localStorage
      localStorage.removeItem('cart');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      
    }
  };

  const handleError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  // Success screen
  if (success) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdf0f2; }
      `}</style>
      <motion.div
        initial={{ opacity:0, scale:0.95 }}
        animate={{ opacity:1, scale:1 }}
        style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fdf0f2', fontFamily:'DM Sans,sans-serif' }}>
        <div style={{ background:'white', borderRadius:'20px', padding:'48px 40px', textAlign:'center', maxWidth:'440px', width:'90%', boxShadow:'0 8px 40px rgba(192,86,106,0.15)' }}>
          <div style={{ width:'72px', height:'72px', background:'#ecfdf5', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle size={36} color="#065f46" />
          </div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'28px', color:'#1a0f13', marginBottom:'8px' }}>
            Payment Successful!
          </h2>
          <p style={{ color:'#9a7080', fontSize:'14px', lineHeight:'1.6', marginBottom:'28px' }}>
            Your order has been placed successfully! Check your email for the confirmation and invoice.
          </p>
          <button
            onClick={() => navigate('/customer')}
            style={{ background:'linear-gradient(135deg,#8c3a4e,#c0566a)', color:'white', border:'none', padding:'13px 32px', borderRadius:'10px', fontSize:'14px', fontWeight:'600', fontFamily:'Inter,sans-serif', cursor:'pointer', width:'100%' }}>
            View My Orders
          </button>
        </div>
      </motion.div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdf0f2; }
        .pay-wrap { min-height: 100vh; background: #fdf0f2; font-family: 'DM Sans',sans-serif; padding: 40px 20px; }
        .pay-inner { max-width: 500px; margin: 0 auto; }
        .pay-header { text-align: center; margin-bottom: 32px; }
        .pay-logo { font-family: 'Cormorant Garamond',serif; font-size: 24px; font-weight: 600; color: #1a0f13; margin-bottom: 4px; }
        .pay-subtitle { font-size: 13px; color: #9a7080; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .pay-card { background: white; border-radius: '16px'; border: 1px solid #ede8e9; overflow: hidden; margin-bottom: 16px; }
      `}</style>

      <motion.div
        className="pay-wrap"
        initial={{ opacity:0, y:16 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3 }}>

        <div className="pay-inner">

          {/* Header */}
          <div className="pay-header">
            <div className="pay-logo">🌸 WomenShop</div>
            <div className="pay-subtitle">
              <ShieldCheck size={13} color="#c0566a" />
              Secure Payment
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'#9a7080', fontSize:'13px', cursor:'pointer', marginBottom:'20px', fontFamily:'DM Sans,sans-serif' }}>
            <ArrowLeft size={14} /> Back to Cart
          </button>

          {/* Order Summary */}
          <div style={{ background:'white', borderRadius:'16px', border:'1px solid #ede8e9', padding:'20px 24px', marginBottom:'16px' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', color:'#1a0f13', fontFamily:'Inter,sans-serif', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
              <ShoppingBag size={15} color="#c0566a" /> Order Summary
            </div>
            {cart?.map(item => (
              <div key={item.productId} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <div>
                  <div style={{ fontSize:'13px', color:'#1a0f13', fontWeight:'500', fontFamily:'Inter,sans-serif' }}>{item.name}</div>
                  <div style={{ fontSize:'11px', color:'#9a7080' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#1a0f13', fontFamily:'Inter,sans-serif' }}>
                  LKR {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
            <div style={{ borderTop:'1px solid #ede8e9', paddingTop:'12px', marginTop:'4px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', color:'#9a7080' }}>Subtotal</span>
                <span style={{ fontSize:'13px', color:'#1a0f13' }}>LKR {cartTotal?.toLocaleString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', color:'#9a7080' }}>Delivery</span>
                <span style={{ fontSize:'13px', color:'#1a0f13' }}>LKR 450</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'8px', borderTop:'1px solid #ede8e9', marginTop:'6px' }}>
                <span style={{ fontSize:'15px', fontWeight:'700', color:'#1a0f13', fontFamily:'Inter,sans-serif' }}>Total</span>
                <span style={{ fontSize:'18px', fontWeight:'700', color:'#c0566a', fontFamily:'Cormorant Garamond,serif' }}>
                  LKR {(cartTotal + 450)?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stripe Payment Form */}
          <div style={{ background:'white', borderRadius:'16px', border:'1px solid #ede8e9', padding:'20px 24px', marginBottom:'16px' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', color:'#1a0f13', fontFamily:'Inter,sans-serif', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
              💳 Card Payment
            </div>

            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#dc2626', fontFamily:'Inter,sans-serif' }}>
                ❌ {error}
              </div>
            )}

            <Elements stripe={stripePromise}>
              <PaymentForm
                cart={cart}
                cartTotal={cartTotal + 450}
                address={address}
                orderItems={orderItems}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          </div>

        </div>
      </motion.div>
    </>
  );
};

export default Payment;