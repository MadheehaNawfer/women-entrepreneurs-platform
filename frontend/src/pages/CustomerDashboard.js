// CustomerDashboard.js

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

import {
  LayoutDashboard, ShoppingCart, Package, Heart,
  Star, Bell, UserCircle, LogOut, ChevronLeft,
  ChevronRight, Trash2, Plus, Minus, CheckCircle,
  XCircle, Clock, Truck, MapPin, CreditCard,
  Download, ImagePlus, X, AlertCircle, BadgeCheck,
  ShoppingBag, Search,
} from 'lucide-react';
import {
  getMyOrders, placeOrder, getAllProducts,
  getProfile, updateProfile, changePassword,addReview,cancelOrder,
} from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const STATUS_COLORS = {
  Pending:    { bg: '#fffbeb', color: '#92400e' },
  Processing: { bg: '#eff6ff', color: '#1e40af' },
  Shipped:    { bg: '#f0fdf4', color: '#166534' },
  Delivered:  { bg: '#ecfdf5', color: '#065f46' },
  Cancelled:  { bg: '#fef2f2', color: '#991b1b' },
};

const STATUS_ICONS = {
  Pending:    Clock,
  Processing: AlertCircle,
  Shipped:    Truck,
  Delivered:  CheckCircle,
  Cancelled:  XCircle,
};

const getInitials = (name) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const CustomerDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [cart, setCart]               = useState([]);
  const [wishlist, setWishlist]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');
  const [toast, setToast]             = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    refreshUser();
    fetchData();
    loadLocalData();
  }, []);

 const fetchData = async () => {
    try {
      const ordersData = await getMyOrders();
      console.log('Orders fetched:', ordersData);
      setOrders(ordersData);
    } catch (err) {
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = () => {
    const savedCart    = JSON.parse(localStorage.getItem('cart')    || '[]');
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setCart(savedCart);
    setWishlist(savedWishlist);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // Cart operations
  const updateCartQty = (productId, delta) => {
    const updated = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeFromCart = (productId) => {
    const updated = cart.filter(item => item.productId !== productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Wishlist operations
  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => item._id !== productId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    showToast('Removed from wishlist');
  };

  const moveToCart = (item) => {
    const existing = cart.find(c => c.productId === item._id);
    let updated;
    if (existing) {
      updated = cart.map(c =>
        c.productId === item._id ? { ...c, quantity: c.quantity + 1 } : c
      );
    } else {
      updated = [...cart, {
        productId: item._id,
        name:      item.name,
        price:     item.price,
        quantity:  1,
        seller:    item.seller?._id || item.seller,
        image:     item.images?.[0] || '',
      }];
    }
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    removeFromWishlist(item._id);
    showToast('Moved to cart!');
  };

  // Stats
  const totalSpent    = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalPrice, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const cartTotal     = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount     = cart.reduce((s, i) => s + i.quantity, 0);

  const NAV = [
    { id: 'overview',  label: 'Overview',   Icon: LayoutDashboard },
    { id: 'shop',      label: 'Shop',       Icon: ShoppingBag },
    { id: 'cart',      label: 'My Cart',    Icon: ShoppingCart,  badge: cartCount },
    { id: 'orders',    label: 'My Orders',  Icon: Package,       badge: pendingOrders },
    { id: 'wishlist',  label: 'Wishlist',   Icon: Heart,         badge: wishlist.length },
    { id: 'reviews',   label: 'My Reviews', Icon: Star },
    { id: 'profile',   label: 'My Profile', Icon: UserCircle },
  ];

  const STAT_CARDS = [
    { label: 'Total Orders',    value: orders.length,                            Icon: Package     },
    { label: 'Pending Orders',  value: pendingOrders,                            Icon: Clock       },
    { label: 'Total Spent',     value: `LKR ${totalSpent.toLocaleString()}`,     Icon: CreditCard  },
    { label: 'Wishlist Items',  value: wishlist.length,                          Icon: Heart       },
    { label: 'Cart Items',      value: cartCount,                                Icon: ShoppingCart},
    { label: 'Delivered',       value: orders.filter(o=>o.status==='Delivered').length, Icon: CheckCircle },
  ];

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f8f4f5', fontFamily:'DM Sans, sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'36px', height:'36px', border:'3px solid #f2cdd4', borderTopColor:'#c0566a', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 14px' }} />
        <p style={{ color:'#9a6070', fontSize:'14px' }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .cd-wrap { display: flex; min-height: 100vh; background: #f8f4f5; font-family: 'DM Sans', sans-serif; color: #1a0f13; }
        .cd-sidebar { width: 248px; background: #1a0f13; display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow: hidden; transition: width 0.25s ease; }
        .cd-sidebar.collapsed { width: 68px; }
        .cd-sidebar-top { height: 64px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .cd-brand { display: flex; align-items: center; gap: 10px; overflow: hidden; }
        .cd-brand-mark { width: 32px; height: 32px; flex-shrink: 0; background: #c0566a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
        .cd-brand-name { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600; color: white; white-space: nowrap; letter-spacing: -0.01em; transition: opacity 0.2s; }
        .cd-sidebar.collapsed .cd-brand-name { opacity: 0; width: 0; overflow: hidden; }
        .cd-collapse-btn { width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,0.06); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); transition: background 0.2s; flex-shrink: 0; }
        .cd-collapse-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .cd-sidebar-user { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 10px; overflow: hidden; flex-shrink: 0; }
        .cd-sidebar-avatar { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #c0566a, #e8a0ad); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white; font-family: 'Inter', sans-serif; overflow: hidden; }
        .cd-sidebar-user-info { overflow: hidden; transition: opacity 0.2s; }
        .cd-sidebar-user-name { font-size: 13px; font-weight: 500; color: white; white-space: nowrap; }
        .cd-sidebar-user-role { font-size: 11px; margin-top: 1px; white-space: nowrap; color: rgba(255,255,255,0.4); }
        .cd-sidebar.collapsed .cd-sidebar-user-info { opacity: 0; width: 0; }
        .cd-nav { flex: 1; padding: 12px; overflow-y: auto; }
        .cd-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; transition: background 0.15s; white-space: nowrap; border: none; background: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; margin-bottom: 2px; }
        .cd-nav-item:hover { background: rgba(255,255,255,0.06); }
        .cd-nav-item.active { background: rgba(192,86,106,0.18); }
        .cd-nav-icon-wrap { width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; color: rgba(255,255,255,0.5); }
        .cd-nav-item.active .cd-nav-icon-wrap { color: #e8a0ad; }
        .cd-nav-item:hover .cd-nav-icon-wrap { color: rgba(255,255,255,0.8); }
        .cd-nav-label { font-size: 13px; color: rgba(255,255,255,0.55); flex: 1; transition: opacity 0.2s; }
        .cd-nav-item.active .cd-nav-label { color: white; font-weight: 500; }
        .cd-sidebar.collapsed .cd-nav-label { opacity: 0; width: 0; overflow: hidden; }
        .cd-nav-badge { background: #c0566a; color: white; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; font-family: 'Inter', sans-serif; }
        .cd-sidebar.collapsed .cd-nav-badge { display: none; }
        .cd-sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .cd-logout-btn { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; width: 100%; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; color: rgba(255,255,255,0.4); }
        .cd-logout-btn:hover { background: rgba(192,86,106,0.15); color: #e8a0ad; }
        .cd-logout-label { font-size: 13px; white-space: nowrap; transition: opacity 0.2s; }
        .cd-sidebar.collapsed .cd-logout-label { opacity: 0; width: 0; overflow: hidden; }
        .cd-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .cd-topbar { height: 64px; background: white; border-bottom: 1px solid #ede8e9; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-shrink: 0; }
        .cd-topbar-title { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #1a0f13; }
        .cd-content { flex: 1; padding: 24px 28px; overflow-y: auto; }
        .cd-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
        .cd-stat-card { background: white; border-radius: 12px; padding: 20px 22px; border: 1px solid #ede8e9; display: flex; align-items: center; gap: 14px; transition: box-shadow 0.2s, border-color 0.2s; }
        .cd-stat-card:hover { box-shadow: 0 2px 12px rgba(192,86,106,0.08); border-color: #e0d0d4; }
        .cd-stat-icon-wrap { width: 44px; height: 44px; border-radius: 10px; background: #fdf0f2; display: flex; align-items: center; justify-content: center; color: #c0566a; flex-shrink: 0; }
        .cd-stat-val { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 600; color: #1a0f13; line-height: 1; margin-bottom: 3px; }
        .cd-stat-lbl { font-size: 12px; color: #9a7080; }
        .cd-section-hd { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #1a0f13; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .cd-table-card { background: white; border-radius: 12px; border: 1px solid #ede8e9; overflow: hidden; margin-bottom: 24px; }
        .cd-table { width: 100%; border-collapse: collapse; }
        .cd-table th { padding: 11px 16px; text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #9a7080; font-weight: 600; border-bottom: 1px solid #ede8e9; background: #faf7f8; font-family: 'Inter', sans-serif; }
        .cd-table td { padding: 13px 16px; font-size: 13px; color: #1a0f13; border-bottom: 1px solid #f5f0f1; vertical-align: middle; }
        .cd-table tr:last-child td { border-bottom: none; }
        .cd-table tbody tr:hover td { background: #fdf8f9; }
        .cd-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; font-family: 'Inter', sans-serif; }
        .cd-empty { text-align: center; padding: 52px 32px; color: #9a7080; font-size: 14px; background: white; border-radius: 12px; border: 1px solid #ede8e9; }
        .cd-empty-title { font-size: 15px; font-weight: 500; color: #4a2c35; margin-bottom: 6px; font-family: 'Inter', sans-serif; margin-top: 14px; }
        .cd-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif; transition: all 0.15s; border: none; cursor: pointer; }
        .cd-btn-primary { background: #c0566a; color: white; }
        .cd-btn-primary:hover { background: #8c3a4e; }
        .cd-btn-outline { background: white; color: #c0566a; border: 1.5px solid #f2cdd4; }
        .cd-btn-outline:hover { background: #fdf0f2; }
        .cd-btn-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .cd-btn-danger:hover { background: #991b1b; color: white; }
        .cd-cart-item { background: white; border-radius: 12px; border: 1px solid #ede8e9; padding: 16px; display: flex; align-items: center; gap: 16px; margin-bottom: 12px; transition: box-shadow 0.2s; }
        .cd-cart-item:hover { box-shadow: 0 2px 12px rgba(192,86,106,0.08); }
        .cd-cart-img { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; background: #faf7f8; flex-shrink: 0; }
        .cd-cart-no-img { width: 72px; height: 72px; border-radius: 10px; background: #fdf0f2; display: flex; align-items: center; justify-content: center; color: #c0566a; flex-shrink: 0; }
        .cd-cart-info { flex: 1; }
        .cd-cart-name { font-size: 14px; font-weight: 500; color: #1a0f13; margin-bottom: 3px; font-family: 'Inter', sans-serif; }
        .cd-cart-price { font-size: 13px; color: #c0566a; font-weight: 600; margin-bottom: 8px; }
        .cd-qty-wrap { display: flex; align-items: center; gap: 10px; }
        .cd-qty-btn { width: 28px; height: 28px; border-radius: 7px; border: 1.5px solid #ede8e9; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #c0566a; transition: all 0.15s; }
        .cd-qty-btn:hover { background: #c0566a; color: white; border-color: #c0566a; }
        .cd-qty-val { font-size: 14px; font-weight: 500; color: #1a0f13; min-width: 24px; text-align: center; font-family: 'Inter', sans-serif; }
        .cd-wishlist-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .cd-wishlist-card { background: white; border-radius: 12px; border: 1px solid #ede8e9; overflow: hidden; transition: box-shadow 0.22s, transform 0.22s; }
        .cd-wishlist-card:hover { box-shadow: 0 6px 24px rgba(192,86,106,0.1); transform: translateY(-2px); }
        .cd-wishlist-img { width: 100%; height: 160px; object-fit: cover; background: #faf7f8; }
        .cd-wishlist-no-img { width: 100%; height: 160px; background: #fdf0f2; display: flex; align-items: center; justify-content: center; color: #c0566a; }
        .cd-wishlist-body { padding: 14px 16px; }
        .cd-wishlist-name { font-size: 14px; font-weight: 500; color: #1a0f13; margin-bottom: 4px; font-family: 'Inter', sans-serif; }
        .cd-wishlist-price { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; color: #1a0f13; margin-bottom: 10px; }
        .cd-wishlist-actions { display: flex; gap: 8px; }
        .cd-form-card { background: white; border-radius: 14px; padding: 28px; border: 1px solid #ede8e9; }
        .cd-field { margin-bottom: 16px; }
        .cd-label { display: block; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #9a7080; font-weight: 600; margin-bottom: 6px; font-family: 'Inter', sans-serif; }
        .cd-input { width: 100%; padding: 10px 13px; border: 1.5px solid #ede8e9; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a0f13; background: #faf7f8; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .cd-input:focus { border-color: #c0566a; box-shadow: 0 0 0 3px rgba(192,86,106,0.08); background: white; }
        .cd-textarea { width: 100%; padding: 10px 13px; border: 1.5px solid #ede8e9; border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a0f13; background: #faf7f8; outline: none; resize: vertical; min-height: 80px; transition: border-color 0.2s; }
        .cd-textarea:focus { border-color: #c0566a; box-shadow: 0 0 0 3px rgba(192,86,106,0.08); background: white; }
        .cd-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cd-submit-btn { width: 100%; padding: 12px; background: #c0566a; color: white; border: none; border-radius: 9px; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; transition: background 0.2s, transform 0.15s; }
        .cd-submit-btn:hover:not(:disabled) { background: #8c3a4e; transform: translateY(-1px); }
        .cd-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .cd-filter-btn { padding: 6px 14px; border-radius: 7px; border: 1px solid #ede8e9; background: white; font-size: 12px; color: #6b4050; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s; font-weight: 500; }
        .cd-filter-btn.active { border-color: #c0566a; background: #fdf0f2; color: #8c3a4e; }
        .cd-toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; z-index: 2000; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; max-width: 300px; }
        .cd-toast.success { background: #1a0f13; color: white; }
        .cd-toast.error { background: #dc2626; color: white; }
        .cd-modal-overlay { position: fixed; inset: 0; background: rgba(26,15,19,0.45); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .cd-modal { background: white; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 20px 60px rgba(26,15,19,0.2); }
        @media (max-width: 900px) {
          .cd-sidebar { width: 68px; }
          .cd-sidebar .cd-nav-label, .cd-sidebar .cd-brand-name, .cd-sidebar .cd-sidebar-user-info, .cd-sidebar .cd-nav-badge, .cd-sidebar .cd-logout-label { opacity: 0; width: 0; overflow: hidden; }
          .cd-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .cd-wishlist-grid { grid-template-columns: repeat(2, 1fr); }
          .cd-content { padding: 16px; }
          .cd-topbar { padding: 0 16px; }
        }
      `}</style>

      <motion.div className="cd-wrap" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>

        {/* SIDEBAR */}
        <div className={`cd-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="cd-sidebar-top">
            <div className="cd-brand">
              <div className="cd-brand-mark"><ShoppingBag size={16} /></div>
              <span className="cd-brand-name">WomenShop</span>
            </div>
            <button className="cd-collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>

          <div className="cd-sidebar-user">
            <div className="cd-sidebar-avatar">
              {user?.profileImage
                ? <img src={user.profileImage} alt="profile" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                : getInitials(user?.name)
              }
            </div>
            <div className="cd-sidebar-user-info">
              <div className="cd-sidebar-user-name">{user?.name?.split(' ')[0]}</div>
              <div className="cd-sidebar-user-role">Customer</div>
            </div>
          </div>

          <nav className="cd-nav">
            {NAV.map(({ id, label, Icon, badge }) => (
              <button key={id} className={`cd-nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
                <div className="cd-nav-icon-wrap"><Icon size={16} /></div>
                <span className="cd-nav-label">{label}</span>
                {badge > 0 && <span className="cd-nav-badge">{badge}</span>}
              </button>
            ))}
          </nav>

          <div className="cd-sidebar-footer">
            <button className="cd-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span className="cd-logout-label">Sign out</span>
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="cd-main">
          <div className="cd-topbar">
            <div className="cd-topbar-title">{NAV.find(n => n.id === activeTab)?.label}</div>
            <button className="cd-btn cd-btn-primary" onClick={() => setActiveTab('shop')}>
  <ShoppingBag size={14} /> Browse Products
</button>
          </div>

          <div className="cd-content">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                <div className="cd-stats-grid">
                  {STAT_CARDS.map(({ label, value, Icon }, i) => (
                    <div key={i} className="cd-stat-card">
                      <div className="cd-stat-icon-wrap"><Icon size={20} /></div>
                      <div>
                        <div className="cd-stat-val">{value ?? '—'}</div>
                        <div className="cd-stat-lbl">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

               {/* Recent Orders */}
            {orders.length > 0 ? (
              <>
                <div className="cd-section-hd"><Package size={15} color="#c0566a" /> Recent Orders</div>
                <div className="cd-table-card">
                  <table className="cd-table">
                    <thead><tr><th>Order ID</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      {orders.slice(0,5).map(o => {
                        const StatusIcon = STATUS_ICONS[o.status] || Clock;
                        return (
                          <tr key={o._id} style={{ cursor:'pointer' }} onClick={() => { setSelectedOrder(o); setActiveTab('orders'); }}>
                            <td style={{ fontSize:'11px', color:'#9a7080', fontFamily:'Inter,sans-serif' }}>#{o._id?.slice(-6)}</td>
                            <td>{o.orderItems?.length} item(s)</td>
                            <td style={{ fontWeight:'500' }}>LKR {o.totalPrice?.toLocaleString()}</td>
                            <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className="cd-badge" style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}>
                                <StatusIcon size={10} /> {o.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="cd-empty">
                <Package size={36} color="#ddd0d4" />
                <div className="cd-empty-title">No orders yet</div>
                Start shopping to see your orders here!
                <br /><br />
                <button className="cd-btn cd-btn-primary" onClick={() => setActiveTab('shop')}>
                  <ShoppingBag size={14} /> Browse Products
                </button>
              </div>
            )}
          </>
        )}

        {/* CART */}
        {activeTab === 'cart' && (
          <CartTab
            cart={cart}
            cartTotal={cartTotal}
            onUpdateQty={updateCartQty}
            onRemove={removeFromCart}
            onClearCart={clearCart}
            showToast={showToast}
            fetchOrders={fetchData}
            user={user}
            setActiveTab={setActiveTab}
          />
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            showToast={showToast}
            fetchOrders={fetchData}
          />
        )}

        {/* WISHLIST */}
        {activeTab === 'wishlist' && (
          <>
            <div className="cd-section-hd"><Heart size={15} color="#c0566a" /> My Wishlist</div>
            {wishlist.length === 0 ? (
              <div className="cd-empty">
                <Heart size={36} color="#ddd0d4" />
                <div className="cd-empty-title">Your wishlist is empty</div>
                Save products you love by clicking the heart icon!
                <br /><br />
                <button className="cd-btn cd-btn-primary" onClick={() => setActiveTab('shop')}>
                  <ShoppingBag size={14} /> Browse Products
                </button>
              </div>
            ) : (
              <div className="cd-wishlist-grid">
                {wishlist.map(item => (
                  <div key={item._id} className="cd-wishlist-card">
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.name} className="cd-wishlist-img" />
                      : <div className="cd-wishlist-no-img"><ShoppingBag size={32} /></div>
                    }
                    <div className="cd-wishlist-body">
                      <div className="cd-wishlist-name">{item.name}</div>
                      <div className="cd-wishlist-price">LKR {item.price?.toLocaleString()}</div>
                      <div className="cd-wishlist-actions">
                        <button className="cd-btn cd-btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={() => moveToCart(item)}>
                          <ShoppingCart size={13} /> Add to Cart
                        </button>
                        <button className="cd-btn cd-btn-danger" onClick={() => removeFromWishlist(item._id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* SHOP */}
        {activeTab === 'shop' && (
          <ShopTab
            setActiveTab={setActiveTab}
            onAddToCart={(product) => {
              const existing = cart.find(c => c.productId === product._id);
              let updated;
              if (existing) {
                updated = cart.map(c =>
                  c.productId === product._id ? { ...c, quantity: c.quantity + 1 } : c
                );
              } else {
                updated = [...cart, {
                  productId: product._id,
                  name:      product.name,
                  price:     product.price,
                  quantity:  1,
                  seller:    product.seller?._id || product.seller,
                  image:     product.images?.[0] || '',
                }];
              }
              setCart(updated);
              localStorage.setItem('cart', JSON.stringify(updated));
              showToast(`${product.name} added to cart! 🛒`);
            }}
            onAddToWishlist={(product) => {
              const exists = wishlist.find(w => w._id === product._id);
              if (exists) { showToast('Already in wishlist!', 'error'); return; }
              const updated = [...wishlist, product];
              setWishlist(updated);
              localStorage.setItem('wishlist', JSON.stringify(updated));
              showToast('Added to wishlist! ❤️');
            }}
            cart={cart}
            wishlist={wishlist}
          />
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <ReviewsTab
            orders={orders}
            showToast={showToast}
          />
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <CustomerProfileTab
            user={user}
            showToast={showToast}
            refreshUser={refreshUser}
          />
        )}

      </div>
    </div>

    {/* TOAST */}
    {toast && (
      <div className={`cd-toast ${toast.type}`}>
        {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
        {toast.msg}
      </div>
    )}

  </motion.div>
</>
  );
};



/* ===== STRIPE PAYMENT FORM ===== */
const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { clientSecret } = await createPaymentIntent(amount);
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
        background:'white', border:'1.5px solid #ede8e9',
        borderRadius:'10px', padding:'16px', marginBottom:'12px',
      }}>
        <div style={{ fontSize:'13px', color:'#9a7080', marginBottom:'10px', fontFamily:'Inter,sans-serif' }}>
          Card Details
        </div>
       <CardElement options={{
  disableLink: true,
  style: {
    base: {
      fontSize: '14px', color: '#1a0f13',
      fontFamily: 'DM Sans, sans-serif',
      '::placeholder': { color: '#c4909a' },
    },
    invalid: { color: '#dc2626' },
  },
}} /> 
      </div>

      {/* Test card hint */}
      <div style={{
        background:'#f0fdf4', border:'1px solid #bbf7d0',
        borderRadius:'8px', padding:'10px 14px', marginBottom:'16px',
        fontSize:'12px', color:'#065f46', fontFamily:'Inter,sans-serif',
      }}>
        🧪 Test card: <strong>4242 4242 4242 4242</strong> | Any future date | Any CVC
      </div>

      <div style={{ display:'flex', gap:'10px' }}>
        <button type="button" className="cd-btn cd-btn-outline"
          style={{ flex:1, justifyContent:'center' }}
          onClick={() => window.history.back()}>
          ← Back
        </button>
        <button type="submit" disabled={!stripe || loading}
          className="cd-btn cd-btn-primary"
          style={{ flex:2, justifyContent:'center', padding:'12px', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Processing...' : `Pay LKR ${amount?.toLocaleString()}`}
        </button>
      </div>
    </form>
  );
};

/* ===== CART TAB ===== */
const CartTab = ({ cart, cartTotal, onUpdateQty, onRemove, onClearCart, showToast, fetchOrders, user, setActiveTab }) => {
  const navigate = useNavigate();
  const [step,          setStep]          = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [address,       setAddress]       = useState({ street:'', city:'', province:'', zipCode:'' });
  const [loading,       setLoading]       = useState(false);

  const handleAddressChange = e => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (stripePaymentId = null) => {
    if (!address.street || !address.city || !address.province || !address.zipCode) {
      showToast('Please fill in all address fields!', 'error'); return;
    }
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        product:  item.productId,
        name:     item.name,
        quantity: item.quantity,
        price:    item.price,
        seller:   item.seller,
      }));

      await placeOrder({
        orderItems,
        shippingAddress: address,
        totalPrice:      cartTotal,
        paymentMethod:   paymentMethod === 'Card' ? 'Card' : 'COD',
        stripePaymentId,
      });
      onClearCart();
      fetchOrders();
      showToast('Order placed successfully! 🎉');
      setStep('success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') return (
    <div className="cd-empty" style={{ padding:'60px 32px' }}>
      <CheckCircle size={52} color="#065f46" />
      <div className="cd-empty-title" style={{ color:'#065f46', fontSize:'20px' }}>Order Placed Successfully!</div>
      <p style={{ color:'#9a7080', marginBottom:'24px' }}>Thank you for your order! You can track it in My Orders.</p>
      <button className="cd-btn cd-btn-primary" onClick={() => setStep('cart')}>
        Continue Shopping
      </button>
    </div>
  );

  if (cart.length === 0) return (
    <div className="cd-empty">
      <ShoppingCart size={36} color="#ddd0d4" />
      <div className="cd-empty-title">Your cart is empty</div>
      Browse products and add them to your cart!
      <br /><br />
      <button className="cd-btn cd-btn-primary" onClick={() => setActiveTab('shop')}>
        <ShoppingBag size={14} /> Browse Products
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth:'700px' }}>

      {/* Steps indicator */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {['cart','checkout'].map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{
              width:'28px', height:'28px', borderRadius:'50%',
              background: step === s ? '#c0566a' : step === 'success' ? '#065f46' : '#ede8e9',
              color: step === s || step === 'success' ? 'white' : '#9a7080',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'12px', fontWeight:'600', fontFamily:'Inter,sans-serif'
            }}>{i + 1}</div>
            <span style={{ fontSize:'13px', color: step === s ? '#c0566a' : '#9a7080', fontWeight: step === s ? '500' : '400' }}>
              {s === 'cart' ? 'Cart' : 'Checkout'}
            </span>
            {i === 0 && <div style={{ width:'32px', height:'1px', background:'#ede8e9' }} />}
          </div>
        ))}
      </div>

      {/* CART STEP */}
      {step === 'cart' && (
        <>
          {cart.map(item => (
            <div key={item.productId} className="cd-cart-item">
              {item.image
                ? <img src={item.image} alt={item.name} className="cd-cart-img" />
                : <div className="cd-cart-no-img"><ShoppingBag size={24} /></div>
              }
              <div className="cd-cart-info">
                <div className="cd-cart-name">{item.name}</div>
                <div className="cd-cart-price">LKR {item.price?.toLocaleString()} each</div>
                <div className="cd-qty-wrap">
                  <button className="cd-qty-btn" onClick={() => onUpdateQty(item.productId, -1)}><Minus size={12} /></button>
                  <span className="cd-qty-val">{item.quantity}</span>
                  <button className="cd-qty-btn" onClick={() => onUpdateQty(item.productId, 1)}><Plus size={12} /></button>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'15px', color:'#1a0f13', marginBottom:'8px' }}>
                  LKR {(item.price * item.quantity).toLocaleString()}
                </div>
                <button className="cd-btn cd-btn-danger" style={{ padding:'6px 10px' }} onClick={() => onRemove(item.productId)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div style={{ background:'white', borderRadius:'12px', border:'1px solid #ede8e9', padding:'20px', marginTop:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'16px', fontWeight:'600', fontFamily:'Inter,sans-serif' }}>Total</span>
              <span style={{ fontSize:'20px', fontWeight:'600', fontFamily:'Cormorant Garamond,serif', color:'#c0566a' }}>
                LKR {cartTotal.toLocaleString()}
              </span>
            </div>
            <button className="cd-btn cd-btn-primary"
              style={{ width:'100%', justifyContent:'center', marginTop:'16px', padding:'12px' }}
              onClick={() => setStep('checkout')}>
              Proceed to Checkout →
            </button>
          </div>
        </>
      )}

      {/* CHECKOUT STEP */}
      {step === 'checkout' && (
        <div className="cd-form-card">
          <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:'16px', fontWeight:'600', marginBottom:'20px', color:'#1a0f13' }}>
            Shipping Address
          </h3>

          <div className="cd-field">
            <label className="cd-label">Street Address</label>
            <input name="street" className="cd-input" placeholder="123 Main Street" value={address.street} onChange={handleAddressChange} />
          </div>
          <div className="cd-row">
            <div className="cd-field">
              <label className="cd-label">City</label>
              <input name="city" className="cd-input" placeholder="Colombo" value={address.city} onChange={handleAddressChange} />
            </div>
            <div className="cd-field">
              <label className="cd-label">Province</label>
              <input name="province" className="cd-input" placeholder="Western" value={address.province} onChange={handleAddressChange} />
            </div>
          </div>
          <div className="cd-field">
            <label className="cd-label">Zip Code</label>
            <input name="zipCode" className="cd-input" placeholder="00100" value={address.zipCode} onChange={handleAddressChange} />
          </div>

          {/* Payment Method */}
          <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:'16px', fontWeight:'600', marginBottom:'16px', marginTop:'24px', color:'#1a0f13' }}>
            Payment Method
          </h3>
          <div style={{ display:'flex', gap:'12px', marginBottom:'24px' }}>
            {['COD', 'Card'].map(method => (
              <div key={method}
                onClick={() => setPaymentMethod(method)}
                style={{
                  flex:1, padding:'14px', borderRadius:'10px', cursor:'pointer',
                  border: paymentMethod === method ? '2px solid #c0566a' : '1.5px solid #ede8e9',
                  background: paymentMethod === method ? '#fdf0f2' : 'white',
                  textAlign:'center', transition:'all 0.15s'
                }}>
                <div style={{ fontSize:'20px', marginBottom:'6px' }}>
                  {method === 'COD' ? '💵' : '💳'}
                </div>
                <div style={{ fontSize:'13px', fontWeight:'500', color: paymentMethod === method ? '#c0566a' : '#1a0f13', fontFamily:'Inter,sans-serif' }}>
                  {method === 'COD' ? 'Cash on Delivery' : 'Card Payment'}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ background:'#faf7f8', borderRadius:'10px', padding:'16px', marginBottom:'20px' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', fontFamily:'Inter,sans-serif', marginBottom:'12px', color:'#1a0f13' }}>
              Order Summary
            </div>
            {cart.map(item => (
              <div key={item.productId} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#6b4050', marginBottom:'6px' }}>
                <span>{item.name} × {item.quantity}</span>
                <span>LKR {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop:'1px solid #ede8e9', marginTop:'10px', paddingTop:'10px', display:'flex', justifyContent:'space-between', fontWeight:'600', fontSize:'15px', fontFamily:'Inter,sans-serif' }}>
              <span>Total</span>
              <span style={{ color:'#c0566a' }}>LKR {cartTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* COD — Place Order Button */}
          {paymentMethod === 'COD' && (
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="cd-btn cd-btn-outline"
                onClick={() => setStep('cart')}
                style={{ flex:1, justifyContent:'center' }}>
                ← Back to Cart
              </button>
              <button className="cd-btn cd-btn-primary"
                onClick={() => handlePlaceOrder()}
                disabled={loading}
                style={{ flex:2, justifyContent:'center', padding:'12px' }}>
                {loading ? 'Placing Order...' : `Place Order • LKR ${cartTotal.toLocaleString()}`}
              </button>
            </div>
          )}

          {/* Card — Redirect to Payment Page */}
{paymentMethod === 'Card' && (
  <div style={{ display:'flex', gap:'10px' }}>
    <button className="cd-btn cd-btn-outline"
      onClick={() => setStep('cart')}
      style={{ flex:1, justifyContent:'center' }}>
      ← Back to Cart
    </button>
    <button
      className="cd-btn cd-btn-primary"
      style={{ flex:2, justifyContent:'center', padding:'12px' }}
      onClick={() => {
        if (!address.street || !address.city || !address.province || !address.zipCode) {
          showToast('Please fill in all address fields!', 'error'); return;
        }
        const orderItems = cart.map(item => ({
          product:  item.productId,
          name:     item.name,
          quantity: item.quantity,
          price:    item.price,
          seller:   item.seller,
        }));
        navigate('/payment', {
          state: { cart, cartTotal, address, orderItems }
        });
      }}>
      💳 Proceed to Payment
    </button>
  </div>
)}

        </div>
      )}
    </div>
  );
};

/* ===== ORDERS TAB ===== */
const OrdersTab = ({ orders, selectedOrder, setSelectedOrder, showToast, fetchOrders }) => {
  const [filterStatus, setFilter] = useState('all');

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      showToast('Order cancelled successfully!');
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = orders.filter(o =>
    filterStatus === 'all' ? true : o.status === filterStatus
  );

const handleDownloadInvoice = (order) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ===== COLORS =====
    const dark    = [26, 15, 19];
    const rose    = [192, 86, 106];
    const muted   = [154, 112, 128];
    const blush   = [253, 240, 242];
    const border  = [237, 232, 233];
    const white   = [255, 255, 255];
    const cream   = [255, 250, 249];

    // ===== BACKGROUND =====
    doc.setFillColor(...cream);
    doc.rect(0, 0, pageW, pageH, 'F');

    // ===== DECORATIVE FLORAL TOP LEFT =====
    // Main stem
    doc.setDrawColor(...muted);
    doc.setLineWidth(0.4);
    doc.line(18, 8, 18, 55);

    // Left branch
    doc.line(18, 20, 10, 14);
    doc.line(18, 30, 8, 22);
    doc.line(18, 40, 11, 32);

    // Right branch
    doc.line(18, 25, 26, 18);
    doc.line(18, 35, 28, 27);
    doc.line(18, 45, 24, 38);

    // Flower tops - small circles
    doc.setFillColor(...muted);
    doc.circle(10, 13, 2, 'F');
    doc.circle(8,  21, 2, 'F');
    doc.circle(11, 31, 2, 'F');
    doc.circle(26, 17, 2, 'F');
    doc.circle(28, 26, 2, 'F');
    doc.circle(24, 37, 2, 'F');
    doc.circle(18, 7,  2, 'F');

    // Petals around flowers
    doc.setDrawColor(...muted);
    doc.setLineWidth(0.3);
    [[10,13],[8,21],[26,17],[18,7]].forEach(([x,y]) => {
      doc.circle(x-2, y,   1.2, 'S');
      doc.circle(x+2, y,   1.2, 'S');
      doc.circle(x,   y-2, 1.2, 'S');
      doc.circle(x,   y+2, 1.2, 'S');
    });

    // ===== DECORATIVE FLORAL BOTTOM RIGHT =====
    doc.setDrawColor(...muted);
    doc.setLineWidth(0.4);
    doc.line(pageW - 18, pageH - 8,  pageW - 18, pageH - 55);
    doc.line(pageW - 18, pageH - 20, pageW - 10, pageH - 14);
    doc.line(pageW - 18, pageH - 30, pageW - 8,  pageH - 22);
    doc.line(pageW - 18, pageH - 40, pageW - 11, pageH - 32);
    doc.line(pageW - 18, pageH - 25, pageW - 26, pageH - 18);
    doc.line(pageW - 18, pageH - 35, pageW - 28, pageH - 27);

    doc.setFillColor(...muted);
    [[pageW-10, pageH-13],[pageW-8, pageH-21],[pageW-11, pageH-31],
     [pageW-26, pageH-17],[pageW-28, pageH-26],[pageW-18, pageH-7]].forEach(([x,y]) => {
      doc.circle(x, y, 2, 'F');
    });

    doc.setDrawColor(...muted);
    doc.setLineWidth(0.3);
    [[pageW-10,pageH-13],[pageW-26,pageH-17],[pageW-18,pageH-7]].forEach(([x,y]) => {
      doc.circle(x-2, y,   1.2, 'S');
      doc.circle(x+2, y,   1.2, 'S');
      doc.circle(x,   y-2, 1.2, 'S');
      doc.circle(x,   y+2, 1.2, 'S');
    });

    // ===== RIGHT ACCENT BARS (like reference 2) =====
    doc.setFillColor(...rose);
    doc.rect(pageW - 12, 8,  10, 6,  'F');
    doc.rect(pageW - 12, 17, 10, 6,  'F');
    doc.rect(pageW - 12, 26, 10, 6,  'F');

    // ===== HEADER =====
    // Brand
    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('WOMENSHOP', 35, 18);

    doc.setTextColor(...muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Empowering Women Entrepreneurs', 35, 25);
    doc.text('womenshop.lk', 35, 32);

    // INVOICE big text - center
    doc.setTextColor(...dark);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice', pageW / 2, 35, { align: 'center' });

    // Date below invoice
    doc.setTextColor(...muted);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      new Date(order.createdAt).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }).toUpperCase(),
      pageW / 2, 44, { align: 'center' }
    );

    // ===== THIN DIVIDER =====
    doc.setDrawColor(...border);
    doc.setLineWidth(0.4);
    doc.line(30, 52, pageW - 30, 52);

    // ===== INVOICE INFO ROW =====
    let y = 62;
    doc.setTextColor(...muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE TO:', 30, y);
    doc.text('INVOICE NUMBER', pageW - 30, y, { align: 'right' });

    doc.setTextColor(...dark);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text((order.customer?.name || 'Customer').toUpperCase(), 30, y + 9);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...muted);
    doc.text(`INV-2026-${order._id?.slice(-6).toUpperCase()}`, pageW - 30, y + 9, { align: 'right' });

    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(order.customer?.email || '', 30, y + 17);
    doc.text(order.shippingAddress?.street || '', 30, y + 24);
    doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''}`, 30, y + 31);
    doc.text(order.shippingAddress?.zipCode || '', 30, y + 38);

    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(`Issued: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, pageW - 30, y + 17, { align: 'right' });
    doc.text(`Payment: ${order.paymentMethod || 'Cash on Delivery'}`,           pageW - 30, y + 24, { align: 'right' });
    doc.text(`Status: ${order.status || 'Pending'}`,                            pageW - 30, y + 31, { align: 'right' });

    // ===== THIN DIVIDER =====
    y = 108;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.4);
    doc.line(30, y, pageW - 30, y);

    // ===== TABLE HEADER =====
    y += 8;
    doc.setTextColor(...muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCT',          30,  y);
    doc.text('PRICE',            115, y, { align: 'center' });
    doc.text('QTY',              145, y, { align: 'center' });
    doc.text('TOTAL',            pageW - 30, y, { align: 'right' });

    // Header underline
    y += 3;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(30, y, pageW - 30, y);

    // ===== TABLE ROWS =====
    y += 8;
    order.orderItems?.forEach((item) => {
      doc.setTextColor(...dark);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text(item.name || '', 30, y);

      doc.setTextColor(...muted);
      doc.text(`LKR ${item.price?.toLocaleString()}`,                  115, y, { align: 'center' });
      doc.text(String(item.quantity),                                   145, y, { align: 'center' });

      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'bold');
      doc.text(`LKR ${(item.price * item.quantity)?.toLocaleString()}`, pageW - 30, y, { align: 'right' });

      y += 3;
      doc.setDrawColor(...border);
      doc.setLineWidth(0.2);
      doc.line(30, y, pageW - 30, y);
      y += 8;
    });

    // ===== TOTALS SECTION =====
    y += 5;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.4);
    doc.line(30, y - 5, pageW - 30, y - 5);

    // Subtotal
    const subtotal = order.orderItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
    const delivery = 450;
    const grandTotal = subtotal + delivery;

    doc.setTextColor(...muted);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('SUBTOTAL',          pageW - 80, y);
    doc.text(`LKR ${subtotal.toLocaleString()}`, pageW - 30, y, { align: 'right' });

    y += 9;
    doc.text('DELIVERY CHARGE',   pageW - 80, y);
    doc.text('LKR 450.00',        pageW - 30, y, { align: 'right' });

    y += 5;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(pageW - 90, y, pageW - 30, y);

    y += 8;
    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL',             pageW - 80, y);
    doc.setTextColor(...rose);
    doc.text(`LKR ${grandTotal.toLocaleString()}`, pageW - 30, y, { align: 'right' });

    // ===== PAYMENT INFO =====
    y += 18;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.4);
    doc.line(30, y - 5, pageW - 30, y - 5);

    doc.setTextColor(...muted);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT METHOD',    30,  y);
    doc.text('ORDER STATUS',      95,  y);
    doc.text('ORDER ID',          155, y);

    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(order.paymentMethod || 'Cash on Delivery', 30,  y + 8);
    doc.text(order.status || 'Pending',                  95,  y + 8);
    doc.text(`INV-2026-${order._id?.slice(-6)}`,         155, y + 8);

    // ===== THANK YOU =====
    y += 22;
    doc.setDrawColor(...border);
    doc.setLineWidth(0.4);
    doc.line(30, y - 5, pageW - 30, y - 5);

    doc.setTextColor(...muted);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping with WomenShop!',                  pageW / 2, y + 5,  { align: 'center' });
    doc.text('We appreciate your support for women entrepreneurs.',  pageW / 2, y + 13, { align: 'center' });

    // ===== FOOTER BAR =====
    doc.setFillColor(...rose);
    doc.rect(0, pageH - 12, pageW, 12, 'F');

    doc.setTextColor(...white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('WomenShop © 2026',                    18,         pageH - 5);
    doc.text('Empowering Women Entrepreneurs',       pageW / 2,  pageH - 5, { align: 'center' });
    doc.text('womenshop.lk',                         pageW - 18, pageH - 5, { align: 'right' });

    // ===== SAVE =====
    doc.save(`WomenShop-Invoice-${order._id?.slice(-6)}.pdf`);
    showToast('Invoice downloaded! 📄');
  };

  if (selectedOrder) return (
    <div style={{ maxWidth:'600px' }}>
      <button className="cd-btn cd-btn-outline" onClick={() => setSelectedOrder(null)} style={{ marginBottom:'20px' }}>
        ← Back to Orders
      </button>

      <div className="cd-form-card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #ede8e9' }}>
          <div>
            <div style={{ fontFamily:'Inter,sans-serif', fontSize:'18px', fontWeight:'600', color:'#1a0f13', marginBottom:'4px' }}>
              Order #{selectedOrder._id?.slice(-6)}
            </div>
            <div style={{ fontSize:'13px', color:'#9a7080' }}>
              Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span className="cd-badge" style={{ background: STATUS_COLORS[selectedOrder.status]?.bg, color: STATUS_COLORS[selectedOrder.status]?.color, fontSize:'13px', padding:'6px 12px' }}>
            {selectedOrder.status}
          </span>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', fontFamily:'Inter,sans-serif', marginBottom:'12px', color:'#1a0f13' }}>Items Ordered</div>
          {selectedOrder.orderItems?.map((item, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f5f0f1', fontSize:'13px' }}>
              <div>
                <div style={{ fontWeight:'500', color:'#1a0f13' }}>{item.name}</div>
                <div style={{ color:'#9a7080', marginTop:'2px' }}>Qty: {item.quantity} × LKR {item.price?.toLocaleString()}</div>
              </div>
              <div style={{ fontWeight:'600', color:'#1a0f13' }}>LKR {(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', fontWeight:'600', fontSize:'15px', fontFamily:'Inter,sans-serif' }}>
            <span>Total</span>
            <span style={{ color:'#c0566a' }}>LKR {selectedOrder.totalPrice?.toLocaleString()}</span>
          </div>
        </div>

        {/* Shipping */}
        <div style={{ background:'#faf7f8', borderRadius:'10px', padding:'16px', marginBottom:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', fontFamily:'Inter,sans-serif', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
            <MapPin size={14} color="#c0566a" /> Shipping Address
          </div>
          <div style={{ fontSize:'13px', color:'#6b4050', lineHeight:'1.6' }}>
            {selectedOrder.shippingAddress?.street}<br />
            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province} {selectedOrder.shippingAddress?.zipCode}
          </div>
        </div>

        {/* Delivery Timeline */}
        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'13px', fontWeight:'600', fontFamily:'Inter,sans-serif', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' }}>
            <Truck size={14} color="#c0566a" /> Delivery Status
          </div>
          {['Pending','Processing','Shipped','Delivered'].map((status, i) => {
            const statuses   = ['Pending','Processing','Shipped','Delivered'];
            const currentIdx = statuses.indexOf(selectedOrder.status);
            const isDone     = i <= currentIdx && selectedOrder.status !== 'Cancelled';
            return (
              <div key={status} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
                <div style={{
                  width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                  background: isDone ? '#c0566a' : '#ede8e9',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                  {isDone
                    ? <CheckCircle size={14} color="white" />
                    : <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#b09098' }} />
                  }
                </div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight: isDone ? '500' : '400', color: isDone ? '#1a0f13' : '#9a7080', fontFamily:'Inter,sans-serif' }}>{status}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="cd-btn cd-btn-outline" style={{ width:'100%', justifyContent:'center' }}
          onClick={() => handleDownloadInvoice(selectedOrder)}>
          <Download size={14} /> Download Invoice
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display:'flex', gap:'6px', marginBottom:'16px', flexWrap:'wrap' }}>
        {['all','Pending','Processing','Shipped','Delivered','Cancelled'].map(f => (
          <button key={f} className={`cd-filter-btn ${filterStatus===f?'active':''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="cd-empty">
          <Package size={36} color="#ddd0d4" />
          <div className="cd-empty-title">No orders found</div>
        </div>
      ) : (
        <div className="cd-table-card">
          <table className="cd-table">
            <thead>
              <tr><th>Order ID</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Invoice</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const StatusIcon = STATUS_ICONS[o.status] || Clock;
                return (
                  <tr key={o._id}>
                    <td style={{ fontSize:'11px', color:'#9a7080', fontFamily:'Inter,sans-serif', cursor:'pointer' }}
                      onClick={() => setSelectedOrder(o)}>
                      #{o._id?.slice(-6)}
                    </td>
                    <td>{o.orderItems?.length} item(s)</td>
                    <td style={{ fontWeight:'500' }}>LKR {o.totalPrice?.toLocaleString()}</td>
                    <td style={{ fontSize:'12px', color:'#9a7080' }}>{o.paymentMethod || 'COD'}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="cd-badge" style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}>
                        <StatusIcon size={10} /> {o.status}
                      </span>
                    </td>
   <td>
  <div style={{ display:'flex', gap:'6px' }}>
    <button className="cd-btn cd-btn-outline" style={{ padding:'5px 10px', fontSize:'11px' }}
      onClick={() => handleDownloadInvoice(o)}>
      <Download size={12} /> Invoice
    </button>
    {o.status === 'Pending' && (
      <button className="cd-btn cd-btn-danger" style={{ padding:'5px 10px', fontSize:'11px' }}
        onClick={() => handleCancelOrder(o._id)}>
        <XCircle size={12} /> Cancel
      </button>
    )}
  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

/* ===== REVIEWS TAB ===== */
const ReviewsTab = ({ orders, showToast }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState([]);

  // Get all order items except cancelled
  const deliveredItems = orders
    .filter(o => o.status !== 'Cancelled')
    .flatMap(o => o.orderItems?.map(item => ({
      ...item,
      orderId: o._id,
    })) || []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setLoading(true);
    try {
      await addReview(selectedProduct.product?._id || selectedProduct.product, {
        rating,
        comment,
      });
      setSubmitted([...submitted, selectedProduct.product?._id || selectedProduct.product]);
      setSelectedProduct(null);
      setRating(5);
      setComment('');
      showToast('Review submitted successfully! ⭐');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const StarPicker = ({ value, onChange }) => (
    <div style={{ display:'flex', gap:'6px', margin:'8px 0' }}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background:'none', border:'none', cursor:'pointer',
            fontSize:'28px', color: star <= value ? '#f59e0b' : '#e5e7eb',
            transition:'color 0.15s', padding:'0'
          }}>
          ★
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="cd-section-hd">
        <Star size={15} color="#c0566a" /> My Reviews
      </div>

      {/* Review Form Modal */}
      {selectedProduct && (
        <div className="cd-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="cd-modal" onClick={e => e.stopPropagation()}
            style={{ maxWidth:'440px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div style={{ fontFamily:'Inter,sans-serif', fontSize:'17px', fontWeight:'600', color:'#1a0f13' }}>
                Leave a Review
              </div>
              <button onClick={() => setSelectedProduct(null)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#9a7080' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background:'#faf7f8', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px' }}>
              <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a0f13', fontFamily:'Inter,sans-serif' }}>
                {selectedProduct.name}
              </div>
            </div>

            <form onSubmit={handleSubmitReview}>
              <div className="cd-field">
                <label className="cd-label">Your Rating</label>
                <StarPicker value={rating} onChange={setRating} />
                <div style={{ fontSize:'12px', color:'#9a7080' }}>
                  {['','Terrible','Bad','Okay','Good','Excellent!'][rating]}
                </div>
              </div>

              <div className="cd-field">
                <label className="cd-label">Your Review</label>
                <textarea
                  className="cd-textarea"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required
                  style={{ minHeight:'100px' }}
                />
              </div>

              <button type="submit" className="cd-submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review ⭐'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Products to review */}
      {deliveredItems.length === 0 ? (
        <div className="cd-empty">
          <Star size={36} color="#ddd0d4" />
          <div className="cd-empty-title">No products to review yet</div>
          Place an order to start reviewing products!
        </div>
      ) : (
        <>
          <p style={{ fontSize:'13px', color:'#9a7080', marginBottom:'16px' }}>
            You can review products from your orders.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'14px' }}>
            {deliveredItems.map((item, i) => {
              const productId = item.product?._id || item.product;
              const isReviewed = submitted.includes(productId);
              return (
                <div key={i} style={{
                  background:'white', borderRadius:'12px',
                  border:'1px solid #ede8e9', padding:'18px',
                  transition:'box-shadow 0.2s'
                }}>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a0f13', fontFamily:'Inter,sans-serif', marginBottom:'6px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize:'12px', color:'#9a7080', marginBottom:'12px' }}>
                    Qty: {item.quantity} · LKR {item.price?.toLocaleString()}
                  </div>
                  {isReviewed ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#065f46', fontSize:'13px', fontWeight:'500' }}>
                      <CheckCircle size={14} /> Review submitted!
                    </div>
                  ) : (
                    <button
                      className="cd-btn cd-btn-primary"
                      style={{ width:'100%', justifyContent:'center' }}
                      onClick={() => setSelectedProduct(item)}>
                      <Star size={13} /> Write a Review
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

/* ===== SHOP TAB ===== */
const ShopTab = ({ onAddToCart, onAddToWishlist, cart, wishlist, setActiveTab }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');

  const CATEGORIES = [
    'All','Jewelry & Accessories','Beauty & Skincare',
    'Food & Beverages','Clothing & Fashion','Home & Decor','Handicrafts',
  ];

  useEffect(() => { fetchProducts(); }, [category]);
const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      const data = await getAllProducts(params);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const isInCart     = (id) => cart.find(c => c.productId === id);
  const isInWishlist = (id) => wishlist.find(w => w._id === id);

  return (
    <>
      {/* Search & Filter */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:'8px', flex:1, minWidth:'200px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'white', border:'1.5px solid #ede8e9', borderRadius:'10px', padding:'8px 14px', flex:1 }}>
            <Search size={14} color="#b09098" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border:'none', outline:'none', background:'transparent', fontSize:'13px', fontFamily:'DM Sans,sans-serif', color:'#1a0f13', width:'100%' }}
            />
          </div>
          <button type="submit" className="cd-btn cd-btn-primary">Search</button>
        </form>

        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat}
              className={`cd-filter-btn ${category === (cat === 'All' ? '' : cat) ? 'active' : ''}`}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#9a7080' }}>Loading products...</div>
      ) : products.length === 0 ? (
        <div className="cd-empty">
          <ShoppingBag size={36} color="#ddd0d4" />
          <div className="cd-empty-title">No products found</div>
          Try a different search or category!
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'16px' }}>
          {products.map(product => (
            <div key={product._id}
              style={{ background:'white', borderRadius:'12px', border:'1px solid #ede8e9', overflow:'hidden', transition:'box-shadow 0.22s, transform 0.22s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 24px rgba(192,86,106,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}>

              {/* Image */}
              <div style={{ height:'180px', overflow:'hidden', background:'#faf7f8', position:'relative' }}>
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ddd0d4' }}>
                      <ShoppingBag size={40} />
                    </div>
                }
                {/* Wishlist button */}
                <button
                  onClick={() => onAddToWishlist(product)}
                  style={{
                    position:'absolute', top:'10px', right:'10px',
                    width:'32px', height:'32px', borderRadius:'50%',
                    background: isInWishlist(product._id) ? '#c0566a' : 'rgba(255,255,255,0.9)',
                    border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.1)', transition:'all 0.15s'
                  }}>
                  <Heart
                    size={14}
                    color={isInWishlist(product._id) ? 'white' : '#c0566a'}
                    fill={isInWishlist(product._id) ? 'white' : 'none'}
                  />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:'11px', color:'#c0566a', fontFamily:'Inter,sans-serif', fontWeight:'500', letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:'4px' }}>
                  {product.category}
                </div>
                <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a0f13', marginBottom:'4px', fontFamily:'Inter,sans-serif' }}>
                  {product.name}
                </div>
                <div style={{ fontSize:'13px', color:'#9a7080', marginBottom:'6px' }}>
                  by {product.seller?.shopName || product.seller?.name}
                </div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'17px', fontWeight:'600', color:'#1a0f13', marginBottom:'12px' }}>
                  LKR {product.price?.toLocaleString()}
                </div>

                {/* Stock info */}
<div style={{
  fontSize:'11px', marginBottom:'8px',
  color: product.stock === 0 ? '#991b1b' :
         product.stock <= 5 ? '#92400e' : '#065f46',
  fontWeight:'500'
}}>
  {product.stock === 0
    ? 'Out of Stock'
    : product.stock <= 5
      ? `Only ${product.stock} left!`
      : `In Stock (${product.stock})`
  }
</div>

                <button
  className="cd-btn cd-btn-primary"
  style={{
    width:'100%', justifyContent:'center', padding:'8px',
    opacity: product.stock === 0 ? 0.5 : 1,
    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
    background: product.stock === 0 ? '#9a7080' : '',
  }}
  onClick={() => product.stock > 0 && onAddToCart(product)}
  disabled={product.stock === 0}>
  {product.stock === 0
    ? 'Out of Stock'
    : isInCart(product._id)
      ? <><CheckCircle size={13} /> Added to Cart</>
      : <><ShoppingCart size={13} /> Add to Cart</>
  }
</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};



/* ===== CUSTOMER PROFILE TAB ===== */
const CustomerProfileTab = ({ user, showToast, refreshUser }) => {
  const [formData, setFormData] = useState({
    name:  user?.name  || '',
    phone: user?.phone || '',
  });
  const [preview,   setPreview]   = useState(user?.profileImage || null);
  const [imgFile,   setImgFile]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [pwData,    setPwData]    = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [pwLoading, setPwLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('info');

  const handleChange   = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePwChange = e => setPwData({ ...pwData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (imgFile) fd.append('profileImage', imgFile);
      await updateProfile(fd);
      refreshUser();
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      showToast('Passwords do not match!', 'error'); return;
    }
    if (pwData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters!', 'error'); return;
    }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      showToast('Password changed successfully!');
      setPwData({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:'520px' }}>
      <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
        {['info','password'].map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`cd-filter-btn ${activeSection===s?'active':''}`}>
            {s === 'info' ? 'Profile Info' : 'Change Password'}
          </button>
        ))}
      </div>

      {activeSection === 'info' && (
        <div className="cd-form-card">
          <form onSubmit={handleSubmit}>
            {/* Avatar */}
            <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'24px', paddingBottom:'20px', borderBottom:'1px solid #ede8e9' }}>
              <label htmlFor="customerProfileImg" style={{ cursor:'pointer', position:'relative' }}>
                {preview
                  ? <img src={preview} alt="profile" style={{ width:'72px', height:'72px', borderRadius:'50%', objectFit:'cover', border:'3px solid #f2cdd4' }} />
                  : <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#c0566a,#e8a0ad)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'600', color:'white', fontFamily:'Inter,sans-serif' }}>
                      {getInitials(formData.name)}
                    </div>
                }
                <div style={{ position:'absolute', bottom:'0', right:'0', width:'22px', height:'22px', borderRadius:'50%', background:'#c0566a', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white' }}>
                  <ImagePlus size={10} color="white" />
                </div>
                <input id="customerProfileImg" type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageChange} />
              </label>
              <div>
                <div style={{ fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'16px', color:'#1a0f13' }}>{formData.name || 'Your Name'}</div>
                <div style={{ fontSize:'13px', color:'#9a7080', marginTop:'3px' }}>{user?.email}</div>
                <div style={{ fontSize:'12px', color:'#c0566a', marginTop:'4px' }}>Click to change photo</div>
              </div>
            </div>

            <div className="cd-field">
              <label className="cd-label">Full Name</label>
              <input name="name" className="cd-input" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="cd-field">
              <label className="cd-label">Phone Number</label>
              <input name="phone" className="cd-input" placeholder="+94 77 123 4567" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="cd-field">
              <label className="cd-label">Email</label>
              <input className="cd-input" value={user?.email} disabled style={{ opacity:0.6 }} />
            </div>

            <button type="submit" className="cd-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeSection === 'password' && (
        <div className="cd-form-card">
          <form onSubmit={handlePasswordSubmit}>
            <div className="cd-field">
              <label className="cd-label">Current Password</label>
              <input name="currentPassword" type="password" className="cd-input" placeholder="Enter current password" value={pwData.currentPassword} onChange={handlePwChange} required />
            </div>
            <div className="cd-field">
              <label className="cd-label">New Password</label>
              <input name="newPassword" type="password" className="cd-input" placeholder="Min 6 characters" value={pwData.newPassword} onChange={handlePwChange} required />
            </div>
            <div className="cd-field">
              <label className="cd-label">Confirm New Password</label>
              <input name="confirmPassword" type="password" className="cd-input" placeholder="Confirm new password" value={pwData.confirmPassword} onChange={handlePwChange} required />
            </div>
            <button type="submit" className="cd-submit-btn" disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;