// Footer.js - Redesigned with Rose Garden palette

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <style>{`
        .ws-footer {
          background: #2e1a20;
          padding: 48px 6vw 28px;
          font-family: 'DM Sans', sans-serif;
        }

        .ws-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 36px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .ws-footer-brand-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          color: #e8a0ad;
          margin-bottom: 10px;
        }

        .ws-footer-brand-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          line-height: 1.7;
          max-width: 240px;
        }

        .ws-footer-col-title {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #e8a0ad;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .ws-footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ws-footer-link {
          text-decoration: none;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          transition: color 0.2s;
        }

        .ws-footer-link:hover { color: #e8a0ad; }

        .ws-footer-bottom {
          max-width: 1200px;
          margin: 24px auto 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .ws-footer-copy {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
        }

        .ws-footer-copy span { color: #e8a0ad; }

        @media (max-width: 768px) {
          .ws-footer-inner  { grid-template-columns: 1fr; gap: 32px; }
          .ws-footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>

      <footer className="ws-footer">
        <div className="ws-footer-inner">

          {/* Brand */}
          <div>
            <div className="ws-footer-brand-logo">🌸 WomenShop</div>
            <p className="ws-footer-brand-desc">
              A marketplace built to empower women entrepreneurs across Sri Lanka —
              one handcrafted product at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div className="ws-footer-col-title">Quick Links</div>
            <div className="ws-footer-links">
              <Link to="/"         className="ws-footer-link">Home</Link>
              <Link to="/login"    className="ws-footer-link">Login</Link>
              <Link to="/register" className="ws-footer-link">Register</Link>
            </div>
          </div>

          {/* For Sellers */}
          <div>
            <div className="ws-footer-col-title">For Sellers</div>
            <div className="ws-footer-links">
              <Link to="/register"  className="ws-footer-link">Become a Seller</Link>
              <Link to="/seller"    className="ws-footer-link">Seller Dashboard</Link>
              <Link to="/seller/add" className="ws-footer-link">Add Product</Link>
            </div>
          </div>

        </div>

        <div className="ws-footer-bottom">
          <div className="ws-footer-copy">
            © 2026 <span>WomenShop</span> — Empowering Women Entrepreneurs
          </div>
          <div className="ws-footer-copy">
            Made with <span>🌸</span> in Sri Lanka
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;