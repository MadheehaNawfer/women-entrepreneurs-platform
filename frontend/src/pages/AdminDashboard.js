// AdminDashboard.js - Professional redesign with Lucide icons

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Clock, Store, Users, ShoppingBag,
  Package, Search, LogOut, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, UserX, UserCheck, AlertCircle,
  TrendingUp, ShoppingCart, UserCircle, Menu,
} from 'lucide-react';
import {
  getAllUsers, getAdminStats, approveSeller,
  approveProduct, deactivateUser,getAllProductsAdmin, rejectProduct,
} from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]         = useState({});
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch]       = useState('');
  const [toast, setToast]         = useState(null);
  const [modal, setModal]         = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        getAdminStats(), getAllUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
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

  const handleApproveSeller = async (id) => {
    try {
      await approveSeller(id);
      showToast('Seller approved successfully');
      setModal(null); fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateUser(id);
      showToast('User deactivated');
      setModal(null); fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleReactivate = async (id) => {
    try {
      await deactivateUser(id);
      showToast('User reactivated');
      setModal(null); fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const pendingSellers = users.filter(u => u.role === 'seller' && !u.isApproved);
  const allSellers     = users.filter(u => u.role === 'seller');
  const allCustomers   = users.filter(u => u.role === 'customer');

  const filterBySearch = (list) =>
    list.filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.shopName?.toLowerCase().includes(search.toLowerCase())
    );

  const NAV = [
    { id: 'dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
    { id: 'pending',   label: 'Pending',    Icon: Clock,           badge: pendingSellers.length },
    { id: 'sellers',   label: 'Sellers',    Icon: Store },
    { id: 'customers', label: 'Customers',  Icon: Users },
    { id: 'products',  label: 'Products',   Icon: ShoppingBag },
    { id: 'orders',    label: 'Orders',     Icon: Package },
  ];

  const STAT_CARDS = [
    { label: 'Total Customers',  value: stats.totalUsers,      Icon: Users,       warn: false },
    { label: 'Total Sellers',    value: stats.totalSellers,    Icon: Store,       warn: false },
    { label: 'Total Products',   value: stats.totalProducts,   Icon: ShoppingBag, warn: false },
    { label: 'Total Orders',     value: stats.totalOrders,     Icon: ShoppingCart,warn: false },
    { label: 'Pending Sellers',  value: stats.pendingSellers,  Icon: Clock,       warn: true  },
    { label: 'Pending Products', value: stats.pendingProducts, Icon: AlertCircle, warn: true  },
  ];

  const getInitials = (name) =>
    name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#fffaf9', fontFamily:'DM Sans, sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'40px', height:'40px', border:'3px solid #f2cdd4', borderTopColor:'#c0566a', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'#9a6070', fontSize:'14px' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ad-wrap { display: flex; min-height: 100vh; background: #f8f4f5; font-family: 'DM Sans', sans-serif; color: #1a0f13; }

        /* SIDEBAR */
        .ad-sidebar {
          width: 248px; background: #1a0f13;
          display: flex; flex-direction: column;
          flex-shrink: 0; position: sticky; top: 0;
          height: 100vh; overflow: hidden; transition: width 0.25s ease;
        }
        .ad-sidebar.collapsed { width: 68px; }

        .ad-sidebar-top {
          height: 64px; padding: 0 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
        }

        .ad-brand {
          display: flex; align-items: center; gap: 10px; overflow: hidden;
        }

        .ad-brand-mark {
          width: 32px; height: 32px; flex-shrink: 0;
          background: #c0566a; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }

        .ad-brand-mark svg { color: white; }

        .ad-brand-name {
          font-family: 'Inter', sans-serif;
          font-size: 15px; font-weight: 600; color: white;
          white-space: nowrap; letter-spacing: -0.01em;
          transition: opacity 0.2s, width 0.2s;
        }
        .ad-sidebar.collapsed .ad-brand-name { opacity: 0; width: 0; overflow: hidden; }

        .ad-collapse-btn {
          width: 24px; height: 24px; border-radius: 6px;
          background: rgba(255,255,255,0.06); border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.5); transition: background 0.2s; flex-shrink: 0;
        }
        .ad-collapse-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .ad-sidebar.collapsed .ad-collapse-btn { margin: 0 auto; }

        /* user chip in sidebar */
        .ad-sidebar-user {
          padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 10px; overflow: hidden; flex-shrink: 0;
        }
        .ad-sidebar-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #c0566a, #e8a0ad);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; color: white; letter-spacing: 0.02em;
        }
        .ad-sidebar-user-info { overflow: hidden; transition: opacity 0.2s; }
        .ad-sidebar-user-name { font-size: 13px; font-weight: 500; color: white; white-space: nowrap; }
        .ad-sidebar-user-role { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; }
        .ad-sidebar.collapsed .ad-sidebar-user-info { opacity: 0; width: 0; }

        .ad-nav { flex: 1; padding: 12px 12px; overflow-y: auto; }

        .ad-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px; cursor: pointer;
          transition: background 0.15s; position: relative;
          white-space: nowrap; border: none; background: none;
          width: 100%; text-align: left; font-family: 'DM Sans', sans-serif;
          margin-bottom: 2px;
        }
        .ad-nav-item:hover { background: rgba(255,255,255,0.06); }
        .ad-nav-item.active { background: rgba(192,86,106,0.18); }

        .ad-nav-icon-wrap {
          width: 32px; height: 32px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px; transition: background 0.15s;
          color: rgba(255,255,255,0.5);
        }
        .ad-nav-item.active .ad-nav-icon-wrap { color: #e8a0ad; }
        .ad-nav-item:hover .ad-nav-icon-wrap  { color: rgba(255,255,255,0.8); }

        .ad-nav-label {
          font-size: 13px; font-weight: 400;
          color: rgba(255,255,255,0.55); overflow: hidden;
          transition: opacity 0.2s; flex: 1;
        }
        .ad-nav-item.active .ad-nav-label { color: white; font-weight: 500; }
        .ad-sidebar.collapsed .ad-nav-label { opacity: 0; width: 0; }

        .ad-nav-badge {
          background: #c0566a; color: white;
          font-size: 10px; font-weight: 600;
          padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
          font-family: 'Inter', sans-serif;
        }
        .ad-sidebar.collapsed .ad-nav-badge { display: none; }

        .ad-sidebar-footer {
          padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
        }
        .ad-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 8px; width: 100%;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
          color: rgba(255,255,255,0.4);
        }
        .ad-logout-btn:hover { background: rgba(192,86,106,0.15); color: #e8a0ad; }
        .ad-logout-label {
          font-size: 13px; white-space: nowrap;
          transition: opacity 0.2s;
        }
        .ad-sidebar.collapsed .ad-logout-label { opacity: 0; width: 0; overflow: hidden; }

        /* MAIN */
        .ad-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .ad-topbar {
          height: 64px; background: white;
          border-bottom: 1px solid #ede8e9;
          padding: 0 28px; display: flex;
          align-items: center; justify-content: space-between;
          gap: 16px; flex-shrink: 0;
        }

        .ad-topbar-title {
          font-family: 'Inter', sans-serif;
          font-size: 16px; font-weight: 600; color: #1a0f13;
        }

        .ad-topbar-right { display: flex; align-items: center; gap: 12px; }

        .ad-search-wrap {
          display: flex; align-items: center; gap: 8px;
          background: #f8f4f5; border: 1.5px solid #ede8e9;
          border-radius: 10px; padding: 8px 14px;
          transition: border-color 0.2s;
        }
        .ad-search-wrap:focus-within { border-color: #c0566a; background: white; }
        .ad-search-wrap input {
          border: none; outline: none; background: transparent;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          color: #1a0f13; width: 200px;
        }
        .ad-search-wrap input::placeholder { color: #b09098; }

        /* CONTENT */
        .ad-content { flex: 1; padding: 24px 28px; overflow-y: auto; }

        /* STATS */
        .ad-stats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 14px; margin-bottom: 28px;
        }
        .ad-stat-card {
          background: white; border-radius: 12px;
          padding: 20px 22px; border: 1px solid #ede8e9;
          display: flex; align-items: center; gap: 14px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .ad-stat-card:hover { box-shadow: 0 2px 12px rgba(192,86,106,0.08); border-color: #e0d0d4; }
        .ad-stat-card.warn { border-color: #f5d5b8; background: #fffcf8; }
        .ad-stat-card.warn:hover { border-color: #f0b87a; }

        .ad-stat-icon-wrap {
          width: 44px; height: 44px; border-radius: 10px;
          background: #fdf0f2; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; color: #c0566a;
        }
        .ad-stat-card.warn .ad-stat-icon-wrap { background: #fef3e8; color: #d4780a; }

        .ad-stat-val {
          font-family: 'Inter', sans-serif;
          font-size: 24px; font-weight: 600; color: #1a0f13;
          line-height: 1; margin-bottom: 3px;
        }
        .ad-stat-lbl { font-size: 12px; color: #9a7080; }

        /* SECTION */
        .ad-section-hd {
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #1a0f13; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }

        /* TABLE */
        .ad-table-card {
          background: white; border-radius: 12px;
          border: 1px solid #ede8e9; overflow: hidden; margin-bottom: 24px;
        }
        .ad-table { width: 100%; border-collapse: collapse; }
        .ad-table th {
          padding: 11px 16px; text-align: left;
          font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9a7080;
          font-weight: 600; border-bottom: 1px solid #ede8e9;
          background: #faf7f8; font-family: 'Inter', sans-serif;
        }
        .ad-table td {
          padding: 13px 16px; font-size: 13px; color: #1a0f13;
          border-bottom: 1px solid #f5f0f1; vertical-align: middle;
        }
        .ad-table tr:last-child td { border-bottom: none; }
        .ad-table tbody tr:hover td { background: #fdf8f9; }

        /* USER CELL */
        .ad-user-cell { display: flex; align-items: center; gap: 10px; }
        .ad-avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #c0566a, #e8a0ad);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; color: white;
          font-family: 'Inter', sans-serif;
        }
        .ad-user-name  { font-size: 13px; font-weight: 500; color: #1a0f13; }
        .ad-user-email { font-size: 11px; color: #9a7080; margin-top: 1px; }

        /* BADGES */
        .ad-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 6px;
          font-size: 11px; font-weight: 500;
          font-family: 'Inter', sans-serif;
        }
        .ad-badge.approved { background: #ecfdf5; color: #065f46; }
        .ad-badge.pending  { background: #fffbeb; color: #92400e; }
        .ad-badge.rejected { background: #fef2f2; color: #991b1b; }
        .ad-badge.active   { background: #ecfdf5; color: #065f46; }
        .ad-badge.inactive { background: #fef2f2; color: #991b1b; }

        /* ACTION BUTTONS */
        .ad-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .ad-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 7px; border: 1px solid transparent;
          font-size: 12px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
          white-space: nowrap; line-height: 1.4;
        }
        .ad-btn-approve    { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
        .ad-btn-approve:hover { background: #065f46; color: white; border-color: #065f46; }
        .ad-btn-reject     { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
        .ad-btn-reject:hover { background: #991b1b; color: white; border-color: #991b1b; }
        .ad-btn-deactivate { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
        .ad-btn-deactivate:hover { background: #9a3412; color: white; border-color: #9a3412; }
        .ad-btn-activate   { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
        .ad-btn-activate:hover { background: #1e40af; color: white; border-color: #1e40af; }

        /* EMPTY */
        .ad-empty {
          text-align: center; padding: 56px 32px;
          color: #9a7080; font-size: 14px;
          background: white; border-radius: 12px; border: 1px solid #ede8e9;
        }
        .ad-empty svg { color: #ddd0d4; margin-bottom: 14px; }
        .ad-empty-title { font-size: 15px; font-weight: 500; color: #4a2c35; margin-bottom: 6px; }

        /* MODAL */
        .ad-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(26,15,19,0.45);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .ad-modal {
          background: white; border-radius: 16px; padding: 32px;
          max-width: 400px; width: 100%;
          box-shadow: 0 20px 60px rgba(26,15,19,0.2); text-align: center;
        }
        .ad-modal-icon-wrap {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }
        .ad-modal-icon-wrap.approve { background: #ecfdf5; color: #065f46; }
        .ad-modal-icon-wrap.danger  { background: #fef2f2; color: #991b1b; }

        .ad-modal-title {
          font-family: 'Inter', sans-serif;
          font-size: 18px; font-weight: 600;
          color: #1a0f13; margin-bottom: 8px;
        }
        .ad-modal-text { font-size: 13px; color: #9a7080; line-height: 1.6; margin-bottom: 24px; }

        .ad-modal-actions { display: flex; gap: 10px; justify-content: center; }
        .ad-modal-cancel {
          padding: 9px 22px; border: 1.5px solid #ede8e9;
          border-radius: 8px; background: white; color: #6b4050;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .ad-modal-cancel:hover { border-color: #c0566a; color: #c0566a; }

        .ad-modal-confirm {
          padding: 9px 22px; border: none; border-radius: 8px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .ad-modal-confirm.approve { background: #c0566a; color: white; }
        .ad-modal-confirm.approve:hover { background: #8c3a4e; }
        .ad-modal-confirm.danger  { background: #dc2626; color: white; }
        .ad-modal-confirm.danger:hover { background: #991b1b; }

        /* TOAST */
        .ad-toast {
          position: fixed; bottom: 24px; right: 24px;
          padding: 12px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          z-index: 2000; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          display: flex; align-items: center; gap: 10px;
          max-width: 320px;
        }
        .ad-toast.success { background: #1a0f13; color: white; }
        .ad-toast.error   { background: #dc2626; color: white; }
        .ad-toast svg { flex-shrink: 0; }

        @media (max-width: 900px) {
          .ad-sidebar { width: 68px; }
          .ad-sidebar .ad-nav-label,
          .ad-sidebar .ad-brand-name,
          .ad-sidebar .ad-sidebar-user-info,
          .ad-sidebar .ad-nav-badge,
          .ad-sidebar .ad-logout-label { opacity: 0; width: 0; overflow: hidden; }
          .ad-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ad-content { padding: 16px; }
          .ad-topbar  { padding: 0 16px; }
        }
      `}</style>

      <motion.div className="ad-wrap" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>

        {/* SIDEBAR */}
        <div className={`ad-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>

          {/* Brand */}
          <div className="ad-sidebar-top">
            <div className="ad-brand">
              <div className="ad-brand-mark">
                <Store size={16} />
              </div>
              <span className="ad-brand-name">WomenShop</span>
            </div>
            <button className="ad-collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>

          {/* User */}
          <div className="ad-sidebar-user">
            <div className="ad-sidebar-avatar">{getInitials(user?.name)}</div>
            <div className="ad-sidebar-user-info">
              <div className="ad-sidebar-user-name">{user?.name?.split(' ')[0]}</div>
              <div className="ad-sidebar-user-role">Administrator</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="ad-nav">
            {NAV.map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                className={`ad-nav-item ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <div className="ad-nav-icon-wrap"><Icon size={16} /></div>
                <span className="ad-nav-label">{label}</span>
                {badge > 0 && <span className="ad-nav-badge">{badge}</span>}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="ad-sidebar-footer">
            <button className="ad-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span className="ad-logout-label">Sign out</span>
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="ad-main">

          {/* Topbar */}
          <div className="ad-topbar">
            <div className="ad-topbar-title">
              {NAV.find(n => n.id === activeTab)?.label}
            </div>
            <div className="ad-topbar-right">
              <div className="ad-search-wrap">
                <Search size={14} color="#b09098" />
                <input
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="ad-content">

            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <>
                <div className="ad-stats-grid">
                  {STAT_CARDS.map(({ label, value, Icon, warn }, i) => (
                    <div key={i} className={`ad-stat-card ${warn ? 'warn' : ''}`}>
                      <div className="ad-stat-icon-wrap"><Icon size={20} /></div>
                      <div>
                        <div className="ad-stat-val">{value ?? '—'}</div>
                        <div className="ad-stat-lbl">{label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {pendingSellers.length > 0 && (
                  <>
                    <div className="ad-section-hd">
                      <Clock size={15} color="#c0566a" /> Awaiting Approval
                    </div>
                    <div className="ad-table-card">
                      <table className="ad-table">
                        <thead>
                          <tr><th>Seller</th><th>Shop</th><th>Email</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {pendingSellers.slice(0,5).map(s => (
                            <tr key={s._id}>
                              <td>
                                <div className="ad-user-cell">
                                  <div className="ad-avatar">{getInitials(s.name)}</div>
                                  <div className="ad-user-name">{s.name}</div>
                                </div>
                              </td>
                              <td>{s.shopName || '—'}</td>
                              <td>{s.email}</td>
                              <td>
                                <div className="ad-actions">
                                  <button className="ad-btn ad-btn-approve" onClick={() => setModal({ type:'approve', user:s })}>
                                    <CheckCircle size={12} /> Approve
                                  </button>
                                  <button className="ad-btn ad-btn-reject" onClick={() => setModal({ type:'reject', user:s })}>
                                    <XCircle size={12} /> Reject
                                  </button>
                                </div>
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

            {/* PENDING */}
            {activeTab === 'pending' && (
              <>
                <div className="ad-section-hd"><Clock size={15} color="#c0566a" /> Pending Seller Applications</div>
                {filterBySearch(pendingSellers).length === 0 ? (
                  <div className="ad-empty">
                    <CheckCircle size={36} />
                    <div className="ad-empty-title">All caught up!</div>
                    No pending seller applications.
                  </div>
                ) : (
                  <div className="ad-table-card">
                    <table className="ad-table">
                      <thead>
                        <tr><th>Seller</th><th>Shop Name</th><th>Email</th><th>Bio</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {filterBySearch(pendingSellers).map(s => (
                          <tr key={s._id}>
                            <td>
                              <div className="ad-user-cell">
                                <div className="ad-avatar">{getInitials(s.name)}</div>
                                <div>
                                  <div className="ad-user-name">{s.name}</div>
                                  <div className="ad-user-email">{new Date(s.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </td>
                            <td>{s.shopName || '—'}</td>
                            <td>{s.email}</td>
                            <td style={{ maxWidth:'160px', color:'#9a7080', fontSize:'12px', lineHeight:'1.5' }}>{s.shopDescription || s.bio || '—'}</td>
                            <td>
                              <div className="ad-actions">
                                <button className="ad-btn ad-btn-approve" onClick={() => setModal({ type:'approve', user:s })}>
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button className="ad-btn ad-btn-reject" onClick={() => setModal({ type:'reject', user:s })}>
                                  <XCircle size={12} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* SELLERS */}
            {activeTab === 'sellers' && (
              <>
                <div className="ad-section-hd"><Store size={15} color="#c0566a" /> All Sellers</div>
                {filterBySearch(allSellers).length === 0 ? (
                  <div className="ad-empty">
                    <Store size={36} />
                    <div className="ad-empty-title">No sellers yet</div>
                    Sellers will appear here once they register.
                  </div>
                ) : (
                  <div className="ad-table-card">
                    <table className="ad-table">
                      <thead>
                        <tr><th>Seller</th><th>Shop</th><th>Email</th><th>Approval</th><th>Account</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {filterBySearch(allSellers).map(s => (
                          <tr key={s._id}>
                            <td>
                              <div className="ad-user-cell">
                                <div className="ad-avatar">{getInitials(s.name)}</div>
                                <div>
                                  <div className="ad-user-name">{s.name}</div>
                                  <div className="ad-user-email">{new Date(s.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </td>
                            <td>{s.shopName || '—'}</td>
                            <td>{s.email}</td>
                            <td>
                              <span className={`ad-badge ${s.isApproved ? 'approved' : 'pending'}`}>
                                {s.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td>
                              <span className={`ad-badge ${s.isActive !== false ? 'active' : 'inactive'}`}>
                                {s.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="ad-actions">
                                {!s.isApproved && (
                                  <button className="ad-btn ad-btn-approve" onClick={() => setModal({ type:'approve', user:s })}>
                                    <CheckCircle size={12} /> Approve
                                  </button>
                                )}
                                {s.isActive !== false
                                  ? <button className="ad-btn ad-btn-deactivate" onClick={() => setModal({ type:'deactivate', user:s })}>
                                      <UserX size={12} /> Deactivate
                                    </button>
                                  : <button className="ad-btn ad-btn-activate" onClick={() => setModal({ type:'activate', user:s })}>
                                      <UserCheck size={12} /> Activate
                                    </button>
                                }
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* CUSTOMERS */}
            {activeTab === 'customers' && (
              <>
                <div className="ad-section-hd"><Users size={15} color="#c0566a" /> All Customers</div>
                {filterBySearch(allCustomers).length === 0 ? (
                  <div className="ad-empty">
                    <Users size={36} />
                    <div className="ad-empty-title">No customers yet</div>
                    Customers will appear here once they register.
                  </div>
                ) : (
                  <div className="ad-table-card">
                    <table className="ad-table">
                      <thead>
                        <tr><th>Customer</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {filterBySearch(allCustomers).map(c => (
                          <tr key={c._id}>
                            <td>
                              <div className="ad-user-cell">
                                <div className="ad-avatar">{getInitials(c.name)}</div>
                                <div className="ad-user-name">{c.name}</div>
                              </div>
                            </td>
                            <td>{c.email}</td>
                            <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`ad-badge ${c.isActive !== false ? 'active' : 'inactive'}`}>
                                {c.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="ad-actions">
                                {c.isActive !== false
                                  ? <button className="ad-btn ad-btn-deactivate" onClick={() => setModal({ type:'deactivate', user:c })}>
                                      <UserX size={12} /> Deactivate
                                    </button>
                                  : <button className="ad-btn ad-btn-activate" onClick={() => setModal({ type:'activate', user:c })}>
                                      <UserCheck size={12} /> Activate
                                    </button>
                                }
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

           {/* PRODUCTS */}
           
{activeTab === 'products' && (
  <ProductsTab
    showToast={showToast}
    fetchData={fetchData}
  />
)}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <div className="ad-empty">
                <Package size={36} />
                <div className="ad-empty-title">Orders management</div>
                Wire up with backend when ready.
              </div>
            )}

          </div>
        </div>

        {/* MODAL */}
        {modal && (
          <div className="ad-modal-overlay" onClick={() => setModal(null)}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
              <div className={`ad-modal-icon-wrap ${modal.type === 'approve' || modal.type === 'activate' ? 'approve' : 'danger'}`}>
                {(modal.type === 'approve' || modal.type === 'activate') && <CheckCircle size={24} />}
                {modal.type === 'reject'     && <XCircle size={24} />}
                {modal.type === 'deactivate' && <UserX size={24} />}
              </div>
              <div className="ad-modal-title">
                {modal.type === 'approve'    && 'Approve Seller'}
                {modal.type === 'reject'     && 'Reject Application'}
                {modal.type === 'deactivate' && 'Deactivate Account'}
                {modal.type === 'activate'   && 'Activate Account'}
              </div>
              <div className="ad-modal-text">
                {modal.type === 'approve'    && `Approve ${modal.user.name}'s seller application? Their shop will be visible to customers.`}
                {modal.type === 'reject'     && `Reject ${modal.user.name}'s application? They won't be able to sell on the platform.`}
                {modal.type === 'deactivate' && `Deactivate ${modal.user.name}'s account? They won't be able to log in until reactivated.`}
                {modal.type === 'activate'   && `Reactivate ${modal.user.name}'s account? They'll be able to log in again.`}
              </div>
              <div className="ad-modal-actions">
                <button className="ad-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button
                  className={`ad-modal-confirm ${modal.type === 'approve' || modal.type === 'activate' ? 'approve' : 'danger'}`}
                  onClick={() => {
                    if (modal.type === 'approve')    handleApproveSeller(modal.user._id);
                    if (modal.type === 'reject')     { showToast('Application rejected', 'error'); setModal(null); fetchData(); }
                    if (modal.type === 'deactivate') handleDeactivate(modal.user._id);
                    if (modal.type === 'activate')   handleReactivate(modal.user._id);
                  }}
                >
                  {modal.type === 'approve'    && 'Yes, Approve'}
                  {modal.type === 'reject'     && 'Yes, Reject'}
                  {modal.type === 'deactivate' && 'Yes, Deactivate'}
                  {modal.type === 'activate'   && 'Yes, Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div className={`ad-toast ${toast.type}`}>
            {toast.type === 'success'
              ? <CheckCircle size={16} />
              : <XCircle size={16} />
            }
            {toast.msg}
          </div>
        )}

      </motion.div>
    </>
  );
};
const ProductsTab = ({ showToast, fetchData }) => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilter]   = useState('pending');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProductsAdmin();
      setProducts(data);
    } catch (err) {
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveProduct(id);
      showToast('Product approved!');
      loadProducts();
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleReject = async (id) => {
    try {
      await rejectProduct(id);
      showToast('Product rejected', 'error');
      loadProducts();
      fetchData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filtered = products.filter(p =>
    filterStatus === 'all'      ? true :
    filterStatus === 'pending'  ? !p.isApproved && p.isActive !== false :
    filterStatus === 'approved' ? p.isApproved : true
  );

  if (loading) return <div className="ad-empty">Loading products...</div>;

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
        <div className="ad-section-hd" style={{ margin:0 }}>
          <ShoppingBag size={15} color="#c0566a" /> All Products
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          {['pending','approved','all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding:'6px 14px', borderRadius:'7px', border:'1px solid',
                fontSize:'12px', cursor:'pointer', fontFamily:'Inter,sans-serif',
                fontWeight:'500', transition:'all 0.15s',
                borderColor: filterStatus === f ? '#c0566a' : '#ede8e9',
                background:  filterStatus === f ? '#fdf0f2' : 'white',
                color:       filterStatus === f ? '#8c3a4e' : '#6b4050',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ad-empty">
          <ShoppingBag size={36} />
          <div className="ad-empty-title">No products found</div>
        </div>
      ) : (
        <div className="ad-table-card">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name}
                            style={{ width:'40px', height:'40px', borderRadius:'8px', objectFit:'cover' }} />
                        : <div style={{ width:'40px', height:'40px', borderRadius:'8px', background:'#fdf0f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <ShoppingBag size={16} color="#c0566a" />
                          </div>
                      }
                      <div>
                        <div style={{ fontWeight:'500', fontSize:'13px' }}>{p.name}</div>
                        <div style={{ fontSize:'11px', color:'#9a7080' }}>Stock: {p.stock}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize:'13px' }}>{p.seller?.shopName || p.seller?.name || '—'}</div>
                  </td>
                  <td style={{ fontSize:'12px', color:'#9a7080' }}>{p.category}</td>
                  <td style={{ fontWeight:'500' }}>LKR {p.price?.toLocaleString()}</td>
                  <td>
                    <span className={`ad-badge ${p.isApproved ? 'approved' : 'pending'}`}>
                      {p.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="ad-actions">
                      {!p.isApproved && (
                        <button className="ad-btn ad-btn-approve" onClick={() => handleApprove(p._id)}>
                          <CheckCircle size={12} /> Approve
                        </button>
                      )}
                      {!p.isApproved && (
                        <button className="ad-btn ad-btn-reject" onClick={() => handleReject(p._id)}>
                          <XCircle size={12} /> Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
export default AdminDashboard;