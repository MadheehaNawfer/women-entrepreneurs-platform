// Login.js - Redesigned with Rose Garden palette

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(formData);
      login(data.user, data.token);
      if (data.user.role === 'admin')       navigate('/admin');
      else if (data.user.role === 'seller') navigate('/seller');
      else                                  navigate('/customer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .lg-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fffaf9;
          font-family: 'DM Sans', sans-serif;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .lg-blob1 {
          position: absolute;
          top: -120px; left: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, #f2b8c0 0%, transparent 70%);
          opacity: 0.45;
          border-radius: 50%;
          pointer-events: none;
        }
        .lg-blob2 {
          position: absolute;
          bottom: -100px; right: -60px;
          width: 340px; height: 340px;
          background: radial-gradient(circle, #e8a0ad 0%, transparent 70%);
          opacity: 0.35;
          border-radius: 50%;
          pointer-events: none;
        }
        .lg-blob3 {
          position: absolute;
          top: 50%; right: 20%;
          width: 180px; height: 180px;
          background: radial-gradient(circle, #fce8ec 0%, transparent 70%);
          opacity: 0.5;
          border-radius: 50%;
          pointer-events: none;
        }

        .lg-card {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 880px;
          min-height: 560px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(192,86,106,0.16);
        }

        .lg-left {
          background: linear-gradient(160deg, #8c3a4e 0%, #c0566a 60%, #e8a0ad 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 36px;
          position: relative;
          overflow: hidden;
          gap: 24px;
        }

        .lg-left::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
        }
        .lg-left::after {
          content: '';
          position: absolute;
          bottom: -40px; left: -40px;
          width: 160px; height: 160px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }

        .lg-left-img {
          width: 220px;
          height: 280px;
          object-fit: cover;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          border: 4px solid rgba(255,255,255,0.25);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          position: relative;
          z-index: 1;
        }

        .lg-left-text {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .lg-left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .lg-left-title em { font-style: italic; font-weight: 400; }

        .lg-left-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.72);
          line-height: 1.6;
        }

        .lg-right {
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 44px;
          gap: 0;
        }

        .lg-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: #c0566a;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lg-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 600;
          color: #2e1a20;
          margin-bottom: 6px;
          line-height: 1.1;
        }

        .lg-subtitle {
          font-size: 13px;
          color: #9a6070;
          margin-bottom: 36px;
          font-weight: 300;
        }

        .lg-error {
          background: #fff0f2;
          border: 1px solid #f2cdd4;
          color: #8c3a4e;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .lg-field {
          margin-bottom: 20px;
          position: relative;
        }

        .lg-label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9a6070;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .lg-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #f2cdd4;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #2e1a20;
          background: #fffaf9;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .lg-input:focus {
          border-color: #c0566a;
          box-shadow: 0 0 0 3px rgba(192,86,106,0.1);
          background: white;
        }

        .lg-input-wrap { position: relative; }
        .lg-input-wrap .lg-input { padding-right: 44px; }

        .lg-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #c4909a;
          padding: 0;
          line-height: 1;
        }

        .lg-eye:hover { color: #c0566a; }

        .lg-btn {
          width: 100%;
          padding: 13px;
          background: #c0566a;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 8px;
          letter-spacing: 0.02em;
        }

        .lg-btn:hover:not(:disabled) { background: #8c3a4e; transform: translateY(-1px); }
        .lg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .lg-bottom {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #9a6070;
        }

        .lg-bottom a { color: #c0566a; font-weight: 500; text-decoration: none; }
        .lg-bottom a:hover { text-decoration: underline; }

        @media (max-width: 680px) {
          .lg-left  { display: none; }
          .lg-card  { grid-template-columns: 1fr; max-width: 440px; }
          .lg-right { padding: 40px 28px; }
        }
      `}</style>

      <motion.div
        className="lg-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <div className="lg-blob1" />
        <div className="lg-blob2" />
        <div className="lg-blob3" />

        <div className="lg-card">
          <div className="lg-left">
            <img src="/images/pic4.jpeg" alt="Woman entrepreneur" className="lg-left-img" />
            <div className="lg-left-text">
              <div className="lg-left-title">Welcome back,<br /><em>she-preneur</em> 🌸</div>
              <p className="lg-left-sub">Your shop is waiting for you.<br />Log in and keep inspiring.</p>
            </div>
          </div>

          <div className="lg-right">
            <div className="lg-logo">🌸 WomenShop</div>
            <h2 className="lg-title">Sign in</h2>
            <p className="lg-subtitle">Enter your details to continue</p>

            {error && <div className="lg-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="lg-field">
                <label className="lg-label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="lg-input"
                  required
                />
              </div>

              <div className="lg-field">
                <label className="lg-label">Password</label>
                <div className="lg-input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="lg-input"
                    required
                  />
                  <button type="button" className="lg-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="lg-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            <div className="lg-bottom">
              Don't have an account?{' '}
              <Link to="/register">Create one here</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Login;