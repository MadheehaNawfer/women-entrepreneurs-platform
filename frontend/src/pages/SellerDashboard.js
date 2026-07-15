// SellerDashboard.js - Professional redesign with Lucide icons

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Plus, Package, Star,
  UserCircle, Search, LogOut, ChevronLeft, ChevronRight,
  Trash2, Pencil, CheckCircle, XCircle, Clock, Store,
  TrendingUp, DollarSign, ShoppingCart, ImagePlus, X,
  AlertCircle, BadgeCheck,
} from 'lucide-react';
import {
  getMyProducts, deleteProduct,
  getSellerOrders, updateOrderStatus, addProduct,
} from '../services/api';
import { updateProfile, changePassword } from '../services/api';

const CATEGORIES = [
  'Jewelry & Accessories','Beauty & Skincare','Food & Beverages',
  'Clothing & Fashion','Home & Decor','Handicrafts',
];

const STATUS_COLORS = {
  Pending:    { bg: '#fffbeb', color: '#92400e' },
  Processing: { bg: '#eff6ff', color: '#1e40af' },
  Shipped:    { bg: '#f0fdf4', color: '#166534' },
  Delivered:  { bg: '#ecfdf5', color: '#065f46' },
  Cancelled:  { bg: '#fef2f2', color: '#991b1b' },
};

const StarRating = ({ rating, size = 14 }) => (
  <span style={{ color: '#f59e0b', fontSize: `${size}px`, letterSpacing: '1px', lineHeight: 1 }}>
    {[1,2,3,4,5].map(i => i <= Math.round(rating) ? '★' : '☆').join('')}
  </span>
);

const getInitials = (name) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const SellerDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast]         = useState(null);
  const [modal, setModal]         = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen]   = useState(true);

  useEffect(() => { refreshUser(); fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        getMyProducts(), getSellerOrders(),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      showToast('Product deleted successfully');
      setModal(null); fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast('Order status updated'); fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const approvedProducts = products.filter(p => p.isApproved);
  const pendingProducts  = products.filter(p => !p.isApproved);
  const totalEarnings    = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const newOrders        = orders.filter(o => o.status === 'Pending').length;
  const allReviews       = products.flatMap(p =>
    (p.reviews || []).map(r => ({ ...r, productName: p.name }))
  );
  const avgRating = allReviews.length
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : '—';

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all'      ? true :
      filterStatus === 'approved' ? p.isApproved :
      filterStatus === 'pending'  ? !p.isApproved : true;
    return matchSearch && matchStatus;
  });

  const NAV = [
    { id: 'overview',  label: 'Overview',    Icon: LayoutDashboard },
    { id: 'products',  label: 'My Products', Icon: ShoppingBag },
    { id: 'add',       label: 'Add Product', Icon: Plus },
    { id: 'orders',    label: 'Orders',      Icon: Package,    badge: newOrders },
    { id: 'reviews',   label: 'Reviews',     Icon: Star,       badge: allReviews.length },
    { id: 'profile',   label: 'My Profile',  Icon: UserCircle },
  ];

  const STAT_CARDS = [
    { label: 'Total Products',    value: products.length,                    Icon: ShoppingBag,  },
    { label: 'Approved Products', value: approvedProducts.length,            Icon: CheckCircle,  },
    { label: 'Pending Products',  value: pendingProducts.length,             Icon: Clock,        },
    { label: 'Total Orders',      value: orders.length,                      Icon: Package,      },
    { label: 'Total Earnings',    value: `LKR ${totalEarnings.toLocaleString()}`, Icon: DollarSign, },
    { label: 'Avg Rating',        value: avgRating,                          Icon: Star,         },
  ];

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f8f4f5', fontFamily:'DM Sans, sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'36px', height:'36px', border:'3px solid #f2cdd4', borderTopColor:'#c0566a', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 14px' }} />
        <p style={{ color:'#9a6070', fontSize:'14px' }}>Loading your shop...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sd-wrap { display: flex; min-height: 100vh; background: #f8f4f5; font-family: 'DM Sans', sans-serif; color: #1a0f13; }

        /* SIDEBAR */
        .sd-sidebar {
          width: 248px; background: #1a0f13;
          display: flex; flex-direction: column;
          flex-shrink: 0; position: sticky; top: 0;
          height: 100vh; overflow: hidden; transition: width 0.25s ease;
        }
        .sd-sidebar.collapsed { width: 68px; }

        .sd-sidebar-top {
          height: 64px; padding: 0 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
        }
        .sd-brand { display: flex; align-items: center; gap: 10px; overflow: hidden; }
        .sd-brand-mark {
          width: 32px; height: 32px; flex-shrink: 0;
          background: #c0566a; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; color: white;
        }
        .sd-brand-name {
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
          color: white; white-space: nowrap; letter-spacing: -0.01em;
          transition: opacity 0.2s;
        }
        .sd-sidebar.collapsed .sd-brand-name { opacity: 0; width: 0; overflow: hidden; }

        .sd-collapse-btn {
          width: 24px; height: 24px; border-radius: 6px;
          background: rgba(255,255,255,0.06); border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); transition: background 0.2s; flex-shrink: 0;
        }
        .sd-collapse-btn:hover { background: rgba(255,255,255,0.1); color: white; }

        /* user chip */
        .sd-sidebar-user {
          padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 10px; overflow: hidden; flex-shrink: 0;
        }
        .sd-sidebar-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #c0566a, #e8a0ad);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; color: white;
          font-family: 'Inter', sans-serif;
        }
        .sd-sidebar-user-info { overflow: hidden; transition: opacity 0.2s; }
        .sd-sidebar-user-name { font-size: 13px; font-weight: 500; color: white; white-space: nowrap; }
        .sd-sidebar-user-role {
          font-size: 11px; margin-top: 1px; white-space: nowrap;
          display: flex; align-items: center; gap: 4px;
        }
        .sd-sidebar.collapsed .sd-sidebar-user-info { opacity: 0; width: 0; }

        .sd-nav { flex: 1; padding: 12px; overflow-y: auto; }
        .sd-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px; cursor: pointer;
          transition: background 0.15s; position: relative;
          white-space: nowrap; border: none; background: none;
          width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
          margin-bottom: 2px;
        }
        .sd-nav-item:hover { background: rgba(255,255,255,0.06); }
        .sd-nav-item.active { background: rgba(192,86,106,0.18); }
        .sd-nav-icon-wrap {
          width: 32px; height: 32px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px; color: rgba(255,255,255,0.5);
        }
        .sd-nav-item.active .sd-nav-icon-wrap { color: #e8a0ad; }
        .sd-nav-item:hover .sd-nav-icon-wrap  { color: rgba(255,255,255,0.8); }
        .sd-nav-label {
          font-size: 13px; color: rgba(255,255,255,0.55); flex: 1;
          transition: opacity 0.2s;
        }
        .sd-nav-item.active .sd-nav-label { color: white; font-weight: 500; }
        .sd-sidebar.collapsed .sd-nav-label { opacity: 0; width: 0; overflow: hidden; }
        .sd-nav-badge {
          background: #c0566a; color: white; font-size: 10px;
          font-weight: 600; padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
          font-family: 'Inter', sans-serif;
        }
        .sd-sidebar.collapsed .sd-nav-badge { display: none; }

        .sd-sidebar-footer {
          padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
        }
        .sd-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px; width: 100%;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
          color: rgba(255,255,255,0.4);
        }
        .sd-logout-btn:hover { background: rgba(192,86,106,0.15); color: #e8a0ad; }
        .sd-logout-label { font-size: 13px; white-space: nowrap; transition: opacity 0.2s; }
        .sd-sidebar.collapsed .sd-logout-label { opacity: 0; width: 0; overflow: hidden; }

        /* MAIN */
        .sd-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .sd-topbar {
          height: 64px; background: white;
          border-bottom: 1px solid #ede8e9;
          padding: 0 28px; display: flex;
          align-items: center; justify-content: space-between;
          gap: 16px; flex-shrink: 0;
        }
        .sd-topbar-title {
          font-family: 'Inter', sans-serif;
          font-size: 16px; font-weight: 600; color: #1a0f13;
        }
        .sd-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #f8f4f5; border: 1.5px solid #ede8e9;
          border-radius: 10px; padding: 8px 14px; transition: border-color 0.2s;
        }
        .sd-search-wrap:focus-within { border-color: #c0566a; background: white; }
        .sd-search-wrap input {
          border: none; outline: none; background: transparent;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          color: #1a0f13; width: 180px;
        }
        .sd-search-wrap input::placeholder { color: #b09098; }

        /* CONTENT */
        .sd-content { flex: 1; padding: 24px 28px; overflow-y: auto; }

        /* STATS */
        .sd-stats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 14px; margin-bottom: 28px;
        }
        .sd-stat-card {
          background: white; border-radius: 12px; padding: 20px 22px;
          border: 1px solid #ede8e9; display: flex; align-items: center;
          gap: 14px; transition: box-shadow 0.2s, border-color 0.2s;
        }
        .sd-stat-card:hover { box-shadow: 0 2px 12px rgba(192,86,106,0.08); border-color: #e0d0d4; }
        .sd-stat-icon-wrap {
          width: 44px; height: 44px; border-radius: 10px;
          background: #fdf0f2; display: flex; align-items: center;
          justify-content: center; color: #c0566a; flex-shrink: 0;
        }
        .sd-stat-val {
          font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 600;
          color: #1a0f13; line-height: 1; margin-bottom: 3px;
        }
        .sd-stat-lbl { font-size: 12px; color: #9a7080; }

        /* SECTION */
        .sd-section-hd {
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
          color: #1a0f13; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }

        /* TABLE */
        .sd-table-card {
          background: white; border-radius: 12px;
          border: 1px solid #ede8e9; overflow: hidden; margin-bottom: 24px;
        }
        .sd-table { width: 100%; border-collapse: collapse; }
        .sd-table th {
          padding: 11px 16px; text-align: left; font-size: 11px;
          letter-spacing: 0.08em; text-transform: uppercase; color: #9a7080;
          font-weight: 600; border-bottom: 1px solid #ede8e9;
          background: #faf7f8; font-family: 'Inter', sans-serif;
        }
        .sd-table td {
          padding: 13px 16px; font-size: 13px; color: #1a0f13;
          border-bottom: 1px solid #f5f0f1; vertical-align: middle;
        }
        .sd-table tr:last-child td { border-bottom: none; }
        .sd-table tbody tr:hover td { background: #fdf8f9; }

        /* BADGES */
        .sd-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 500;
          font-family: 'Inter', sans-serif;
        }
        .sd-badge.approved { background: #ecfdf5; color: #065f46; }
        .sd-badge.pending  { background: #fffbeb; color: #92400e; }
        .sd-badge.rejected { background: #fef2f2; color: #991b1b; }

        /* STATUS SELECT */
        .sd-status-select {
          padding: 5px 10px; border-radius: 7px;
          border: 1.5px solid #ede8e9; font-size: 12px;
          font-family: 'DM Sans', sans-serif; color: #1a0f13;
          background: #faf7f8; cursor: pointer; outline: none;
        }
        .sd-status-select:focus { border-color: #c0566a; }

        /* PRODUCTS GRID */
        .sd-filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .sd-filter-btn {
          padding: 6px 14px; border-radius: 7px;
          border: 1px solid #ede8e9; background: white;
          font-size: 12px; color: #6b4050; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.15s; font-weight: 500;
        }
        .sd-filter-btn.active { border-color: #c0566a; background: #fdf0f2; color: #8c3a4e; }
        .sd-filter-btn:hover  { border-color: #e0d0d4; }

        .sd-add-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #c0566a; color: white; padding: 8px 18px;
          border-radius: 8px; font-size: 13px; font-weight: 500;
          font-family: 'Inter', sans-serif; transition: background 0.15s;
          border: none; cursor: pointer;
        }
        .sd-add-btn:hover { background: #8c3a4e; }

        .sd-products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        .sd-product-card {
          background: white; border-radius: 12px;
          border: 1px solid #ede8e9; overflow: hidden;
          transition: box-shadow 0.22s, transform 0.22s;
        }
        .sd-product-card:hover { box-shadow: 0 6px 24px rgba(192,86,106,0.1); transform: translateY(-2px); }

        .sd-product-img-wrap { height: 172px; overflow: hidden; position: relative; background: #faf7f8; }
        .sd-product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
        .sd-product-card:hover .sd-product-img { transform: scale(1.06); }
        .sd-product-img-dots {
          position: absolute; bottom: 8px; left: 0; right: 0;
          display: flex; justify-content: center; gap: 4px;
        }
        .sd-img-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.55); }
        .sd-img-dot.active { background: white; width: 14px; border-radius: 3px; }
        .sd-no-img {
          width: 100%; height: 100%; display: flex; align-items: center;
          justify-content: center; color: #ddd0d4;
        }

        .sd-product-body { padding: 14px 16px; }
        .sd-product-cat   { font-size: 11px; color: #c0566a; margin-bottom: 4px; font-family: 'Inter', sans-serif; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
        .sd-product-name  { font-size: 14px; font-weight: 500; color: #1a0f13; margin-bottom: 4px; font-family: 'Inter', sans-serif; }
        .sd-product-price { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; color: #1a0f13; margin-bottom: 8px; }
        .sd-product-meta  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .sd-stock { font-size: 11px; color: #9a7080; }

        .sd-product-actions { display: flex; gap: 8px; }
        .sd-btn {
          flex: 1; padding: 7px 0; border-radius: 7px; border: none;
          font-size: 12px; font-weight: 500; cursor: pointer;
          font-family: 'Inter', sans-serif; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .sd-btn-edit   { background: #fdf0f2; color: #c0566a; border: 1px solid #f2cdd4; }
        .sd-btn-edit:hover   { background: #c0566a; color: white; border-color: #c0566a; }
        .sd-btn-delete { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .sd-btn-delete:hover { background: #991b1b; color: white; border-color: #991b1b; }

        /* REVIEWS */
        .sd-reviews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .sd-review-card {
          background: white; border-radius: 12px; padding: 18px;
          border: 1px solid #ede8e9; transition: box-shadow 0.2s;
        }
        .sd-review-card:hover { box-shadow: 0 2px 12px rgba(192,86,106,0.08); }
        .sd-review-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .sd-reviewer-name { font-size: 13px; font-weight: 500; color: #1a0f13; font-family: 'Inter', sans-serif; }
        .sd-review-product { font-size: 11px; color: #c0566a; margin-top: 2px; }
        .sd-review-date { font-size: 11px; color: #9a7080; }
        .sd-review-text { font-size: 13px; color: #6b4050; line-height: 1.6; margin-top: 8px; font-style: italic; }

        /* ADD PRODUCT FORM */
        .sd-form-wrap { max-width: 620px; }
        .sd-form-card { background: white; border-radius: 14px; padding: 28px; border: 1px solid #ede8e9; }
        .sd-field { margin-bottom: 16px; }
        .sd-label {
          display: block; font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9a7080; font-weight: 600;
          margin-bottom: 6px; font-family: 'Inter', sans-serif;
        }
        .sd-input {
          width: 100%; padding: 10px 13px; border: 1.5px solid #ede8e9;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1a0f13; background: #faf7f8; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sd-input:focus { border-color: #c0566a; box-shadow: 0 0 0 3px rgba(192,86,106,0.08); background: white; }
        .sd-textarea {
          width: 100%; padding: 10px 13px; border: 1.5px solid #ede8e9;
          border-radius: 9px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1a0f13; background: #faf7f8; outline: none;
          resize: vertical; min-height: 96px; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sd-textarea:focus { border-color: #c0566a; box-shadow: 0 0 0 3px rgba(192,86,106,0.08); background: white; }
        .sd-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .sd-images-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 8px; }
        .sd-img-slot {
          aspect-ratio: 1; border-radius: 10px; border: 1.5px dashed #ede8e9;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative; cursor: pointer;
          transition: border-color 0.2s; background: #faf7f8;
        }
        .sd-img-slot:hover { border-color: #c0566a; }
        .sd-img-slot img { width: 100%; height: 100%; object-fit: cover; }
        .sd-img-slot-empty { color: #c4909a; }
        .sd-img-remove {
          position: absolute; top: 4px; right: 4px; width: 18px; height: 18px;
          border-radius: 50%; background: rgba(26,15,19,0.65); color: white;
          border: none; cursor: pointer; font-size: 9px;
          display: flex; align-items: center; justify-content: center;
        }

        .sd-approval-note {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 9px;
          padding: 11px 14px; font-size: 12px; color: #92400e;
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif;
        }

        .sd-submit-btn {
          width: 100%; padding: 12px; background: #c0566a; color: white;
          border: none; border-radius: 9px; font-size: 14px; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .sd-submit-btn:hover:not(:disabled) { background: #8c3a4e; transform: translateY(-1px); }
        .sd-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* PROFILE */
        .sd-profile-wrap { max-width: 520px; }
        .sd-profile-card { background: white; border-radius: 14px; padding: 28px; border: 1px solid #ede8e9; }
        .sd-profile-top { display: flex; align-items: center; gap: 18px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #ede8e9; }
        .sd-profile-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #c0566a, #e8a0ad);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 600;
          color: white; flex-shrink: 0;
        }
        .sd-profile-name { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 600; color: #1a0f13; margin-bottom: 3px; }
        .sd-profile-email { font-size: 13px; color: #9a7080; }

        /* EMPTY */
        .sd-empty {
          text-align: center; padding: 52px 32px; color: #9a7080; font-size: 14px;
          background: white; border-radius: 12px; border: 1px solid #ede8e9;
        }
        .sd-empty svg { color: #ddd0d4; margin-bottom: 14px; }
        .sd-empty-title { font-size: 15px; font-weight: 500; color: #4a2c35; margin-bottom: 6px; font-family: 'Inter', sans-serif; }

        /* MODAL */
        .sd-modal-overlay {
          position: fixed; inset: 0; background: rgba(26,15,19,0.45);
          backdrop-filter: blur(6px); display: flex; align-items: center;
          justify-content: center; z-index: 1000; padding: 20px;
        }
        .sd-modal {
          background: white; border-radius: 16px; padding: 32px;
          max-width: 380px; width: 100%;
          box-shadow: 0 20px 60px rgba(26,15,19,0.2); text-align: center;
        }
        .sd-modal-icon-wrap {
          width: 52px; height: 52px; border-radius: 50%;
          background: #fef2f2; color: #991b1b;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .sd-modal-title { font-family: 'Inter', sans-serif; font-size: 17px; font-weight: 600; color: #1a0f13; margin-bottom: 8px; }
        .sd-modal-text  { font-size: 13px; color: #9a7080; line-height: 1.6; margin-bottom: 22px; }
        .sd-modal-actions { display: flex; gap: 10px; justify-content: center; }
        .sd-modal-cancel {
          padding: 9px 22px; border: 1.5px solid #ede8e9; border-radius: 8px;
          background: white; color: #6b4050; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .sd-modal-cancel:hover { border-color: #c0566a; color: #c0566a; }
        .sd-modal-confirm {
          padding: 9px 22px; border: none; border-radius: 8px;
          background: #dc2626; color: white; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .sd-modal-confirm:hover { background: #991b1b; }

        /* TOAST */
        .sd-toast {
          position: fixed; bottom: 24px; right: 24px;
          padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; z-index: 2000;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          display: flex; align-items: center; gap: 10px; max-width: 300px;
        }
        .sd-toast.success { background: #1a0f13; color: white; }
        .sd-toast.error   { background: #dc2626; color: white; }

        @media (max-width: 900px) {
          .sd-sidebar { width: 68px; }
          .sd-sidebar .sd-nav-label,
          .sd-sidebar .sd-brand-name,
          .sd-sidebar .sd-sidebar-user-info,
          .sd-sidebar .sd-nav-badge,
          .sd-sidebar .sd-logout-label { opacity: 0; width: 0; overflow: hidden; }
          .sd-stats-grid    { grid-template-columns: repeat(2, 1fr); }
          .sd-products-grid { grid-template-columns: repeat(2, 1fr); }
          .sd-reviews-grid  { grid-template-columns: 1fr; }
          .sd-content { padding: 16px; }
          .sd-topbar  { padding: 0 16px; }
        }
      `}</style>

      <motion.div className="sd-wrap" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>

        {/* SIDEBAR */}
        <div className={`sd-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className="sd-sidebar-top">
            <div className="sd-brand">
              <div className="sd-brand-mark"><Store size={16} /></div>
              <span className="sd-brand-name">My Shop</span>
            </div>
            <button className="sd-collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>

          <div className="sd-sidebar-user">
            <div className="sd-sidebar-avatar">
  {user?.profileImage
    ? <img
        src={user.profileImage}
        alt="profile"
        style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }}
      />
    : getInitials(user?.name)
  }
</div>
            <div className="sd-sidebar-user-info">
              <div className="sd-sidebar-user-name">{user?.name?.split(' ')[0]}</div>
              <div className="sd-sidebar-user-role" style={{ color: user?.isApproved ? '#86efac' : 'rgba(255,255,255,0.4)' }}>
                {user?.isApproved
                  ? <><BadgeCheck size={11} /> Verified Seller</>
                  : <><Clock size={11} /> Pending Approval</>
                }
              </div>
            </div>
          </div>

          <nav className="sd-nav">
            {NAV.map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                className={`sd-nav-item ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <div className="sd-nav-icon-wrap"><Icon size={16} /></div>
                <span className="sd-nav-label">{label}</span>
                {badge > 0 && <span className="sd-nav-badge">{badge}</span>}
              </button>
            ))}
          </nav>

          <div className="sd-sidebar-footer">
            <button className="sd-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span className="sd-logout-label">Sign out</span>
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="sd-main">
          <div className="sd-topbar">
            <div className="sd-topbar-title">{NAV.find(n => n.id === activeTab)?.label}</div>
            <div>
              {activeTab === 'products' && (
                <div className="sd-search-wrap">
                  <Search size={14} color="#b09098" />
                  <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          <div className="sd-content">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <>
                <div className="sd-stats-grid">
                  {STAT_CARDS.map(({ label, value, Icon }, i) => (
                    <div key={i} className="sd-stat-card">
                      <div className="sd-stat-icon-wrap"><Icon size={20} /></div>
                      <div>
                        <div className="sd-stat-val">{value ?? '—'}</div>
                        <div className="sd-stat-lbl">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {orders.length > 0 && (
                  <>
                    <div className="sd-section-hd"><TrendingUp size={15} color="#c0566a" /> Recent Orders</div>
                    <div className="sd-table-card">
                      <table className="sd-table">
                        <thead><tr><th>Customer</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                          {orders.slice(0,5).map(o => (
                            <tr key={o._id}>
                              <td>{o.customer?.name || '—'}</td>
                              <td>LKR {o.totalPrice}</td>
                              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td>
                                <span className="sd-badge" style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}

            {/* PRODUCTS */}
            {activeTab === 'products' && (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
                  <div className="sd-filter-row">
                    {['all','approved','pending'].map(f => (
                      <button key={f} className={`sd-filter-btn ${filterStatus===f?'active':''}`} onClick={() => setFilterStatus(f)}>
                        {f.charAt(0).toUpperCase()+f.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button className="sd-add-btn" onClick={() => setActiveTab('add')}>
                    <Plus size={14} /> Add Product
                  </button>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="sd-empty">
                    <ShoppingBag size={36} />
                    <div className="sd-empty-title">No products found</div>
                    Add your first product to get started.
                  </div>
                ) : (
                  <div className="sd-products-grid">
                    {filteredProducts.map(product => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onDelete={() => setModal({ type:'delete', product })}
                        onEdit={(p) => setEditProduct(p)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ADD PRODUCT */}
            {activeTab === 'add' && (
              <div className="sd-form-wrap">
                <AddProductForm
                  onSuccess={() => { showToast('Product submitted for approval'); setActiveTab('products'); fetchData(); }}
                  onError={(msg) => showToast(msg, 'error')}
                />
              </div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <>
                <div className="sd-section-hd"><Package size={15} color="#c0566a" /> My Orders</div>
                {orders.length === 0 ? (
                  <div className="sd-empty">
                    <Package size={36} />
                    <div className="sd-empty-title">No orders yet</div>
                    Orders will appear here once customers start buying.
                  </div>
                ) : (
                  <div className="sd-table-card">
                    <table className="sd-table">
                      <thead>
                        <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Update</th></tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o._id}>
                            <td style={{ fontSize:'11px', color:'#9a7080', fontFamily:'Inter,sans-serif' }}>#{o._id?.slice(-6)}</td>
                            <td>{o.customer?.name || '—'}</td>
                           <td>LKR {o.totalPrice}</td>
<td>
  <span style={{
    background: o.isPaid ? '#ecfdf5' : '#fef2f2',
    color: o.isPaid ? '#065f46' : '#991b1b',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  }}>
    {o.isPaid ? '✅ Paid' : '⏳ Unpaid'}
  </span>
</td>
<td>{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className="sd-badge" style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}>
                                {o.status}
                              </span>
                            </td>
                            <td>
                              <select className="sd-status-select" value={o.status} onChange={e => handleStatusUpdate(o._id, e.target.value)}>
                                {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* REVIEWS */}
            {activeTab === 'reviews' && (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                  <div className="sd-section-hd" style={{ margin:0 }}><Star size={15} color="#c0566a" /> Customer Reviews</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <StarRating rating={parseFloat(avgRating) || 0} />
                    <span style={{ fontSize:'13px', color:'#9a7080', fontFamily:'Inter,sans-serif' }}>{avgRating} avg · {allReviews.length} reviews</span>
                  </div>
                </div>
                {allReviews.length === 0 ? (
                  <div className="sd-empty">
                    <Star size={36} />
                    <div className="sd-empty-title">No reviews yet</div>
                    Reviews from customers will appear here.
                  </div>
                ) : (
                  <div className="sd-reviews-grid">
                    {allReviews.map((r, i) => (
                      <div key={i} className="sd-review-card">
                        <div className="sd-review-top">
                          <div>
                            <div className="sd-reviewer-name">{r.user?.name || 'Customer'}</div>
                            <div className="sd-review-product">on {r.productName}</div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <StarRating rating={r.rating} />
                            <div className="sd-review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {r.comment && <div className="sd-review-text">"{r.comment}"</div>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
  <ProfileTab
    user={user}
    showToast={showToast}
    refreshUser={refreshUser}
  />
)}

          </div>
        </div>
{/* EDIT PRODUCT MODAL */}
        {editProduct && (
          <div className="sd-modal-overlay" onClick={() => setEditProduct(null)}>
            <div className="sd-modal" onClick={e => e.stopPropagation()}
              style={{ maxWidth:'520px', width:'100%', textAlign:'left', maxHeight:'85vh', overflowY:'auto', padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <div className="sd-modal-title" style={{ margin:0 }}>Edit Product</div>
                <button onClick={() => setEditProduct(null)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#9a7080' }}>
                  <X size={18} />
                </button>
              </div>
              <EditProductForm
                product={editProduct}
                onSuccess={() => {
                  showToast('Product updated successfully!');
                  setEditProduct(null);
                  fetchData();
                }}
                onError={(msg) => showToast(msg, 'error')}
              />
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {modal?.type === 'delete' && (
          <div className="sd-modal-overlay" onClick={() => setModal(null)}>
            <div className="sd-modal" onClick={e => e.stopPropagation()}>
              <div className="sd-modal-icon-wrap"><Trash2 size={22} /></div>
              <div className="sd-modal-title">Delete Product</div>
              <div className="sd-modal-text">Are you sure you want to delete <strong>{modal.product.name}</strong>? This action cannot be undone.</div>
              <div className="sd-modal-actions">
                <button className="sd-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="sd-modal-confirm" onClick={() => handleDelete(modal.product._id)}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div className={`sd-toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toast.msg}
          </div>
        )}

      </motion.div>
    </>
  );
};

const ProductCard = ({ product, onDelete, onEdit }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const images = product.images?.length ? product.images : [];

  return (
    <div className="sd-product-card">
      <div className="sd-product-img-wrap"
        onMouseEnter={() => images.length > 1 && setImgIndex(1)}
        onMouseLeave={() => setImgIndex(0)}
      >
        {images.length > 0
          ? <img src={images[imgIndex]} alt={product.name} className="sd-product-img" />
          : <div className="sd-no-img"><ShoppingBag size={36} /></div>
        }
        {images.length > 1 && (
          <div className="sd-product-img-dots">
            {images.slice(0,5).map((_, i) => (
              <div key={i} className={`sd-img-dot ${i === imgIndex ? 'active' : ''}`} />
            ))}
          </div>
        )}
      </div>
      <div className="sd-product-body">
        <div className="sd-product-cat">{product.category}</div>
        <div className="sd-product-name">{product.name}</div>
        <div className="sd-product-price">LKR {product.price?.toLocaleString()}</div>
        <div className="sd-product-meta">
  <span className="sd-stock" style={{
    color: product.stock === 0 
      ? '#991b1b' 
      : product.stock <= (product.lowStockAlert || 5) 
        ? '#92400e' 
        : '#9a7080',
    fontWeight: product.stock <= (product.lowStockAlert || 5) ? '600' : '400',
    fontSize: '12px',
  }}>
    {product.stock === 0
      ? '⚠️ Out of Stock!'
      : product.stock <= (product.lowStockAlert || 5)
        ? `⚠️ Low Stock: ${product.stock} left`
        : `Stock: ${product.stock}`
    }
  </span>
  <span className={`sd-badge ${product.isApproved ? 'approved' : 'pending'}`}>
    {product.isApproved ? 'Approved' : 'Pending'}
  </span>
</div>
        {product.reviews?.length > 0 && (
          <div style={{ marginBottom:'10px', display:'flex', alignItems:'center', gap:'5px' }}>
            <StarRating rating={product.reviews.reduce((s,r) => s+r.rating,0) / product.reviews.length} size={13} />
            <span style={{ fontSize:'11px', color:'#9a7080' }}>({product.reviews.length})</span>
          </div>
        )}
        <div className="sd-product-actions">
          <button className="sd-btn sd-btn-edit" onClick={() => onEdit(product)}>
            <Pencil size={12} /> Edit
          </button>
          <button className="sd-btn sd-btn-delete" onClick={onDelete}>
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ADD PRODUCT FORM */
const AddProductForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name:'', description:'', price:'', stock:'', category:'Food & Beverages',
  });
  const [images, setImages]   = useState([null,null,null,null,null]);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Now stores both preview URL and actual file object
  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...images];
      updated[index] = { preview: reader.result, file };
      setImages(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated[index] = null;
    setImages(updated);
  };

  // Now sends FormData with actual files instead of base64
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',        formData.name);
      fd.append('description', formData.description);
      fd.append('price',       formData.price);
      fd.append('stock',       formData.stock);
      fd.append('category',    formData.category);

      // Attach actual image files
      images.forEach((img) => {
        if (img?.file) fd.append('images', img.file);
      });

      const token = localStorage.getItem('token');
      const res = await fetch('https://women-entrepreneurs-platform-1zrw.vercel.app/api/products',  {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sd-form-card">
      <div className="sd-approval-note">
        <AlertCircle size={14} /> New products require admin approval before appearing to customers.
      </div>
      <form onSubmit={handleSubmit}>
        <div className="sd-field">
          <label className="sd-label">Product Images (up to 5)</label>
          <div className="sd-images-grid">
            {images.map((img, i) => (
              <label key={i} className="sd-img-slot" htmlFor={`img-${i}`}>
                {img
                  ? <>
                      {/* Use img.preview instead of img directly */}
                      <img src={img.preview} alt="" />
                      <button type="button" className="sd-img-remove"
                        onClick={e => { e.preventDefault(); removeImage(i); }}>
                        <X size={8} />
                      </button>
                    </>
                  : <div className="sd-img-slot-empty"><ImagePlus size={20} /></div>
                }
                <input
                  id={`img-${i}`} type="file" accept="image/*"
                  style={{ display:'none' }}
                  onChange={e => handleImageUpload(i, e)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="sd-field">
          <label className="sd-label">Product Name</label>
          <input name="name" className="sd-input" placeholder="e.g. Handmade Rose Candle"
            value={formData.name} onChange={handleChange} required />
        </div>

        <div className="sd-field">
          <label className="sd-label">Description</label>
          <textarea name="description" className="sd-textarea"
            placeholder="Describe your product..."
            value={formData.description} onChange={handleChange} required />
        </div>

        <div className="sd-row">
          <div className="sd-field">
            <label className="sd-label">Price (LKR)</label>
            <input name="price" type="number" className="sd-input"
              placeholder="0.00" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="sd-field">
            <label className="sd-label">Stock Quantity</label>
            <input name="stock" type="number" className="sd-input"
              placeholder="0" value={formData.stock} onChange={handleChange} required />
          </div>
        </div>

        <div className="sd-field">
          <label className="sd-label">Category</label>
          <select name="category" className="sd-input"
            value={formData.category} onChange={handleChange}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button type="submit" className="sd-submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};

/* PROFILE TAB */
const ProfileTab = ({ user, showToast, refreshUser }) => {
  const [formData, setFormData] = useState({
    name:            user?.name            || '',
    phone:           user?.phone           || '',
    shopName:        user?.shopName        || '',
    shopDescription: user?.shopDescription || '',
    instagram:       user?.socialLinks?.instagram || '',
    facebook:        user?.socialLinks?.facebook  || '',
    tiktok:          user?.socialLinks?.tiktok    || '',
    website:         user?.socialLinks?.website   || '',
  });
  const [preview,  setPreview]  = useState(user?.profileImage || null);
  const [imgFile,  setImgFile]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [pwData,   setPwData]   = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [pwLoading, setPwLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('info');

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePwChange = e =>
    setPwData({ ...pwData, [e.target.name]: e.target.value });

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
      const { user: updatedUser } = await updateProfile(fd);
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
      await changePassword({
        currentPassword: pwData.currentPassword,
        newPassword:     pwData.newPassword,
      });
      showToast('Password changed successfully!');
      setPwData({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const getInitials = (name) =>
    name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={{ maxWidth:'600px' }}>

      {/* Section Tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
        {['info', 'password'].map(s => (
          <button key={s}
            onClick={() => setActiveSection(s)}
            className={`sd-filter-btn ${activeSection === s ? 'active' : ''}`}
          >
            {s === 'info' ? 'Profile Info' : 'Change Password'}
          </button>
        ))}
      </div>

      {/* PROFILE INFO */}
      {activeSection === 'info' && (
        <div className="sd-form-card">
          <form onSubmit={handleSubmit}>

            {/* Profile Picture */}
            <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'24px', paddingBottom:'20px', borderBottom:'1px solid #ede8e9' }}>
              <label htmlFor="profileImg" style={{ cursor:'pointer', position:'relative' }}>
                {preview
                  ? <img src={preview} alt="profile"
                      style={{ width:'72px', height:'72px', borderRadius:'50%', objectFit:'cover', border:'3px solid #f2cdd4' }} />
                  : <div style={{
                      width:'72px', height:'72px', borderRadius:'50%',
                      background:'linear-gradient(135deg,#c0566a,#e8a0ad)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'22px', fontWeight:'600', color:'white',
                      fontFamily:'Inter,sans-serif', border:'3px solid #f2cdd4'
                    }}>
                      {getInitials(formData.name)}
                    </div>
                }
                <div style={{
                  position:'absolute', bottom:'0', right:'0',
                  width:'22px', height:'22px', borderRadius:'50%',
                  background:'#c0566a', display:'flex', alignItems:'center',
                  justifyContent:'center', border:'2px solid white'
                }}>
                  <ImagePlus size={10} color="white" />
                </div>
                <input id="profileImg" type="file" accept="image/*"
                  style={{ display:'none' }} onChange={handleImageChange} />
              </label>
              <div>
                <div style={{ fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'16px', color:'#1a0f13' }}>
                  {formData.name || 'Your Name'}
                </div>
                <div style={{ fontSize:'13px', color:'#9a7080', marginTop:'3px' }}>{user?.email}</div>
                <div style={{ fontSize:'12px', color:'#c0566a', marginTop:'4px' }}>
                  Click avatar to change photo
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="sd-field">
              <label className="sd-label">Full Name</label>
              <input name="name" className="sd-input" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="sd-field">
              <label className="sd-label">Phone Number</label>
              <input name="phone" className="sd-input" placeholder="+94 77 123 4567" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="sd-field">
              <label className="sd-label">Shop Name</label>
              <input name="shopName" className="sd-input" value={formData.shopName} onChange={handleChange} />
            </div>

            <div className="sd-field">
              <label className="sd-label">Shop Description</label>
              <textarea name="shopDescription" className="sd-textarea"
                placeholder="Tell customers about your shop..."
                value={formData.shopDescription} onChange={handleChange} />
            </div>

            {/* Social Links */}
            <div style={{ marginBottom:'16px', paddingTop:'16px', borderTop:'1px solid #ede8e9' }}>
              <div className="sd-label" style={{ marginBottom:'12px' }}>Social Media Links</div>
              <div className="sd-row">
                <div className="sd-field">
                  <label className="sd-label">Instagram</label>
                  <input name="instagram" className="sd-input"
                    placeholder="https://instagram.com/yourshop"
                    value={formData.instagram} onChange={handleChange} />
                </div>
                <div className="sd-field">
                  <label className="sd-label">Facebook</label>
                  <input name="facebook" className="sd-input"
                    placeholder="https://facebook.com/yourshop"
                    value={formData.facebook} onChange={handleChange} />
                </div>
              </div>
              <div className="sd-row">
                <div className="sd-field">
                  <label className="sd-label">TikTok</label>
                  <input name="tiktok" className="sd-input"
                    placeholder="https://tiktok.com/@yourshop"
                    value={formData.tiktok} onChange={handleChange} />
                </div>
                <div className="sd-field">
                  <label className="sd-label">Website</label>
                  <input name="website" className="sd-input"
                    placeholder="https://yourshop.com"
                    value={formData.website} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button type="submit" className="sd-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* CHANGE PASSWORD */}
      {activeSection === 'password' && (
        <div className="sd-form-card">
          <form onSubmit={handlePasswordSubmit}>
            <div className="sd-field">
              <label className="sd-label">Current Password</label>
              <input name="currentPassword" type="password" className="sd-input"
                placeholder="Enter current password"
                value={pwData.currentPassword} onChange={handlePwChange} required />
            </div>

            <div className="sd-field">
              <label className="sd-label">New Password</label>
              <input name="newPassword" type="password" className="sd-input"
                placeholder="Enter new password (min 6 chars)"
                value={pwData.newPassword} onChange={handlePwChange} required />
            </div>

            <div className="sd-field">
              <label className="sd-label">Confirm New Password</label>
              <input name="confirmPassword" type="password" className="sd-input"
                placeholder="Confirm new password"
                value={pwData.confirmPassword} onChange={handlePwChange} required />
            </div>

            <button type="submit" className="sd-submit-btn" disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

/* EDIT PRODUCT FORM */
const EditProductForm = ({ product, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name:        product.name        || '',
    description: product.description || '',
    price:       product.price       || '',
    stock:       product.stock       || '',
    category:    product.category    || 'Food & Beverages',
  });
  const [images,  setImages]  = useState(
    product.images?.map(url => ({ preview: url, file: null })) || []
  );
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',        formData.name);
      fd.append('description', formData.description);
      fd.append('price',       formData.price);
      fd.append('stock',       formData.stock);
      fd.append('category',    formData.category);

      // Only append new image files, skip existing URLs
      images.forEach(img => {
        if (img?.file) fd.append('images', img.file);
      });

      const token = localStorage.getItem('token');
     const res = await fetch('https://women-entrepreneurs-platform-1zrw.vercel.app/api/products',  {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      onSuccess();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Images */}
      <div className="sd-field">
        <label className="sd-label">Product Images</label>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'8px' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position:'relative', width:'70px', height:'70px' }}>
              <img src={img.preview} alt=""
                style={{ width:'70px', height:'70px', objectFit:'cover', borderRadius:'8px', border:'1px solid #ede8e9' }} />
              <button type="button" onClick={() => removeImage(i)}
                style={{
                  position:'absolute', top:'3px', right:'3px',
                  width:'18px', height:'18px', borderRadius:'50%',
                  background:'rgba(26,15,19,0.7)', color:'white',
                  border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                <X size={8} />
              </button>
            </div>
          ))}

          {/* Add more images button */}
          {images.length < 5 && (
            <label style={{
              width:'70px', height:'70px', borderRadius:'8px',
              border:'1.5px dashed #ede8e9', display:'flex',
              alignItems:'center', justifyContent:'center',
              cursor:'pointer', background:'#faf7f8', color:'#c4909a'
            }}>
              <ImagePlus size={20} />
              <input type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImages([...images, { preview: reader.result, file }]);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div className="sd-field">
        <label className="sd-label">Product Name</label>
        <input name="name" className="sd-input"
          value={formData.name} onChange={handleChange} required />
      </div>

      <div className="sd-field">
        <label className="sd-label">Description</label>
        <textarea name="description" className="sd-textarea"
          value={formData.description} onChange={handleChange} required />
      </div>

      <div className="sd-row">
        <div className="sd-field">
          <label className="sd-label">Price (LKR)</label>
          <input name="price" type="number" className="sd-input"
            value={formData.price} onChange={handleChange} required />
        </div>
        <div className="sd-field">
          <label className="sd-label">Stock</label>
          <input name="stock" type="number" className="sd-input"
            value={formData.stock} onChange={handleChange} required />
        </div>
      </div>

      <div className="sd-field">
        <label className="sd-label">Category</label>
        <select name="category" className="sd-input"
          value={formData.category} onChange={handleChange}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <button type="submit" className="sd-submit-btn" disabled={loading}>
        {loading ? 'Updating...' : 'Update Product'}
      </button>
    </form>
  );
};
export default SellerDashboard;