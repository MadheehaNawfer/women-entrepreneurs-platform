// Navbar.js - Professional navbar

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="ws-nav">

      {/* LEFT — Logo */}
      <Link to="/" className="ws-logo">
        <div className="ws-logo-icon">🌸</div>
        <span className="ws-logo-text">WomenShop</span>
      </Link>

{/* CENTER — Nav Links */}
<div className="ws-nav-mid">
  <Link to="/" className={`ws-nav-link ${isActive('/') ? 'active' : ''}`}>
    Home
  </Link>

  {!isLoggedIn && (
    <Link to="/register" className={`ws-nav-link ${isActive('/register') ? 'active' : ''}`}>
      Become a Seller
    </Link>
  )}

        {isLoggedIn && user?.role === 'customer' && (
          <Link to="/customer" className={`ws-nav-link ${isActive('/customer') ? 'active' : ''}`}>
            My Dashboard
          </Link>
        )}

        {isLoggedIn && user?.role === 'seller' && (
          <>
            <Link to="/seller" className={`ws-nav-link ${isActive('/seller') ? 'active' : ''}`}>
              My Shop
            </Link>
            <Link to="/seller/add" className={`ws-nav-link ${isActive('/seller/add') ? 'active' : ''}`}>
              Add Product
            </Link>
          </>
        )}

        {isLoggedIn && user?.role === 'admin' && (
          <Link to="/admin" className={`ws-nav-link ${isActive('/admin') ? 'active' : ''}`}>
            Admin Panel
          </Link>
        )}
      </div>

      {/* RIGHT — Auth Buttons or User Chip */}
      <div className="ws-nav-right">
        {!isLoggedIn ? (
          <>
            <Link to="/login"    className="ws-btn-outline">Login</Link>
            <Link to="/register" className="ws-btn-filled">Register</Link>
          </>
        ) : (
          <>
            <div className="ws-user-chip">
              <div className="ws-user-avatar">
                {user?.profileImage
                  ? <img
                      src={user.profileImage}
                      alt="profile"
                      style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }}
                    />
                  : user?.name?.charAt(0)?.toUpperCase()
                }
              </div>
              <span className="ws-user-name">
                {user?.name?.split(' ')[0]}
              </span>
            </div>

            <div className="ws-divider" />

            <button onClick={handleLogout} className="ws-btn-outline">
              Logout
            </button>
          </>
        )}
      </div>

    </nav>
  );
};

export default Navbar;