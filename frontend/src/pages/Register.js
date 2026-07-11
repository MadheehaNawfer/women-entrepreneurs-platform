// Register.js - Multi-step redesign with Rose Garden palette

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'Jewelry & Accessories',
  'Beauty & Skincare',
  'Food & Beverages',
  'Clothing & Fashion',
  'Home & Decor',
  'Handicrafts',
];

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep]       = useState('role');
  const [role, setRole]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', shopName: '', bio: '', location: '',
    categories: [],
  });

  const handleRoleSelect = (r) => { setRole(r); setStep('form'); };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryToggle = (cat) => {
    const already = formData.categories.includes(cat);
    setFormData({
      ...formData,
      categories: already
        ? formData.categories.filter(c => c !== cat)
        : [...formData.categories, cat],
    });
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (role === 'seller' && formData.categories.length === 0) {
      setError('Please select at least one category.'); return;
    }
    setLoading(true);
    try {
      await registerUser({ ...formData, role });
      setStep('success');
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

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-page {
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          background: #fffaf9;
          font-family: 'DM Sans', sans-serif;
          padding: 60px 20px;
          position: relative;
          overflow: hidden;
        }

        .rg-blob1 {
          position: absolute; top: -100px; left: -80px;
          width: 380px; height: 380px;
          background: radial-gradient(circle, #f2b8c0 0%, transparent 70%);
          opacity: 0.4; border-radius: 50%; pointer-events: none;
        }
        .rg-blob2 {
          position: absolute; bottom: -80px; right: -60px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, #e8a0ad 0%, transparent 70%);
          opacity: 0.35; border-radius: 50%; pointer-events: none;
        }

        /* ROLE SELECTION */
        .rg-role-wrap {
          position: relative; z-index: 2;
          width: 100%; max-width: 640px;
          text-align: center;
          margin-top: 40px;
        }
        .rg-role-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 600;
          color: #c0566a; margin-bottom: 36px;
          display: flex; align-items: center;
          justify-content: center; gap: 6px;
        }
        .rg-role-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 600;
          color: #2e1a20; margin-bottom: 8px;
        }
        .rg-role-sub {
          font-size: 14px; color: #9a6070;
          margin-bottom: 40px; font-weight: 300;
        }
        .rg-role-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .rg-role-card {
          background: white;
          border: 2px solid #f2cdd4;
          border-radius: 24px;
          padding: 40px 28px;
          cursor: pointer;
          transition: all 0.25s;
          display: flex; flex-direction: column;
          align-items: center; gap: 14px;
        }
        .rg-role-card:hover {
          border-color: #c0566a;
          box-shadow: 0 12px 40px rgba(192,86,106,0.14);
          transform: translateY(-4px);
        }
        .rg-role-icon {
          font-size: 44px;
          width: 80px; height: 80px;
          background: #fdf0f2;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .rg-role-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600; color: #2e1a20;
        }
        .rg-role-desc { font-size: 13px; color: #9a6070; line-height: 1.6; text-align: center; }
        .rg-role-arrow { font-size: 13px; color: #c0566a; font-weight: 500; margin-top: 4px; }

        /* FORM CARD */
        .rg-card {
          position: relative; z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%; max-width: 860px;
          min-height: auto;
          margin: 0 auto;
          align-self: flex-start;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(192,86,106,0.16);
        }

        /* LEFT */
        .rg-left {
          background: linear-gradient(160deg, #8c3a4e 0%, #c0566a 60%, #e8a0ad 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 36px; gap: 24px;
          position: sticky; top: 0;
          min-height: 100vh;
          overflow: hidden;
        }
        .rg-left::before {
          content: ''; position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
        }
        .rg-left-img {
          width: 200px; height: 260px;
          object-fit: cover;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          border: 4px solid rgba(255,255,255,0.25);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          position: relative; z-index: 1;
        }
        .rg-left-text { position: relative; z-index: 1; text-align: center; }
        .rg-left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 600;
          color: white; margin-bottom: 8px; line-height: 1.2;
        }
        .rg-left-title em { font-style: italic; font-weight: 400; }
        .rg-left-sub { font-size: 13px; color: rgba(255,255,255,0.72); line-height: 1.6; }

        .rg-progress {
          position: absolute; bottom: 28px; left: 0; right: 0;
          display: flex; justify-content: center; gap: 8px; z-index: 1;
        }
        .rg-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.35);
          transition: background 0.2s, width 0.2s;
        }
        .rg-dot.active { background: white; width: 24px; border-radius: 4px; }

        /* RIGHT */
        .rg-right {
          background: white;
          display: flex; flex-direction: column;
          padding: 48px 40px;
          max-height: none;
          overflow-y: visible;
        }
        .rg-back {
          background: none; border: none;
          font-size: 13px; color: #9a6070;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          padding: 0; margin-bottom: 20px;
          display: flex; align-items: center; gap: 4px;
          transition: color 0.2s; width: fit-content;
        }
        .rg-back:hover { color: #c0566a; }
        .rg-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px; font-weight: 600;
          color: #2e1a20; margin-bottom: 4px;
        }
        .rg-form-sub { font-size: 13px; color: #9a6070; margin-bottom: 24px; font-weight: 300; }
        .rg-role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fdf0f2; border: 1px solid #f2cdd4;
          border-radius: 20px; padding: 4px 12px;
          font-size: 12px; color: #8c3a4e; font-weight: 500;
          margin-bottom: 20px; width: fit-content;
        }
        .rg-error {
          background: #fff0f2; border: 1px solid #f2cdd4;
          color: #8c3a4e; font-size: 13px;
          padding: 10px 14px; border-radius: 10px;
          margin-bottom: 16px;
        }
        .rg-field { margin-bottom: 16px; }
        .rg-label {
          display: block; font-size: 11px;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9a6070; font-weight: 500; margin-bottom: 6px;
        }
        .rg-input {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #f2cdd4; border-radius: 12px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #2e1a20; background: #fffaf9;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rg-input:focus {
          border-color: #c0566a;
          box-shadow: 0 0 0 3px rgba(192,86,106,0.1);
          background: white;
        }
        .rg-textarea {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #f2cdd4; border-radius: 12px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #2e1a20; background: #fffaf9;
          outline: none; resize: vertical; min-height: 80px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rg-textarea:focus {
          border-color: #c0566a;
          box-shadow: 0 0 0 3px rgba(192,86,106,0.1);
          background: white;
        }
        .rg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rg-cats { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .rg-cat {
          padding: 6px 14px;
          border: 1.5px solid #f2cdd4;
          border-radius: 20px; font-size: 12px;
          color: #6b3a46; cursor: pointer;
          transition: all 0.18s; background: white;
          font-family: 'DM Sans', sans-serif;
        }
        .rg-cat:hover { border-color: #e8a0ad; background: #fdf0f2; }
        .rg-cat.selected { border-color: #c0566a; background: #fdf0f2; color: #8c3a4e; font-weight: 500; }

        .rg-avatar-wrap { display: flex; align-items: center; gap: 16px; margin-top: 4px; }
        .rg-avatar-preview {
          width: 60px; height: 60px; border-radius: 50%;
          background: #fdf0f2; border: 2px solid #f2cdd4;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; overflow: hidden; flex-shrink: 0;
        }
        .rg-avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
        .rg-avatar-btn {
          padding: 8px 16px;
          border: 1.5px solid #e8a0ad; border-radius: 20px;
          background: white; color: #c0566a;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.18s;
        }
        .rg-avatar-btn:hover { background: #fdf0f2; }

        .rg-btn {
          width: 100%; padding: 13px;
          background: #c0566a; color: white;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          margin-top: 8px; letter-spacing: 0.02em;
        }
        .rg-btn:hover:not(:disabled) { background: #8c3a4e; transform: translateY(-1px); }
        .rg-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .rg-bottom { text-align: center; margin-top: 16px; font-size: 13px; color: #9a6070; }
        .rg-bottom a { color: #c0566a; font-weight: 500; text-decoration: none; }
        .rg-bottom a:hover { text-decoration: underline; }

        /* SUCCESS */
        .rg-success-wrap {
          position: relative; z-index: 2;
          background: white; border-radius: 28px;
          padding: 60px 48px; text-align: center;
          max-width: 480px; width: 100%;
          box-shadow: 0 24px 80px rgba(192,86,106,0.16);
          margin-top: 40px;
        }
        .rg-success-icon { font-size: 56px; margin-bottom: 20px; }
        .rg-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 600;
          color: #2e1a20; margin-bottom: 12px;
        }
        .rg-success-text { font-size: 14px; color: #9a6070; line-height: 1.7; margin-bottom: 32px; }
        .rg-success-btn {
          display: inline-block; text-decoration: none;
          background: #c0566a; color: white;
          padding: 13px 32px; border-radius: 12px;
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }
        .rg-success-btn:hover { background: #8c3a4e; }

        @media (max-width: 700px) {
          .rg-left       { display: none; }
          .rg-card       { grid-template-columns: 1fr; max-width: 460px; }
          .rg-role-cards { grid-template-columns: 1fr; }
          .rg-right      { padding: 32px 24px; }
          .rg-row        { grid-template-columns: 1fr; }
        }
      `}</style>

      <motion.div
        className="rg-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <div className="rg-blob1" />
        <div className="rg-blob2" />

        {/* STEP: ROLE SELECTION */}
        {step === 'role' && (
          <div className="rg-role-wrap">
            <div className="rg-role-logo">🌸 WomenShop</div>
            <h2 className="rg-role-title">Join WomenShop</h2>
            <p className="rg-role-sub">Tell us who you are to get started</p>
            <div className="rg-role-cards">
              <div className="rg-role-card" onClick={() => handleRoleSelect('customer')}>
                <div className="rg-role-icon">📜</div>
                <div className="rg-role-name">I'm a Customer</div>
                <div className="rg-role-desc">Browse and shop unique handmade products from women entrepreneurs.</div>
                <div className="rg-role-arrow">Get started →</div>
              </div>
              <div className="rg-role-card" onClick={() => handleRoleSelect('seller')}>
                <div className="rg-role-icon">🌸</div>
                <div className="rg-role-name">I'm a Seller</div>
                <div className="rg-role-desc">Showcase and sell your handcrafted products to customers across Sri Lanka.</div>
                <div className="rg-role-arrow">Apply now →</div>
              </div>
            </div>
            <div className="rg-bottom" style={{marginTop: '24px'}}>
              Already have an account? <Link to="/login">Sign in here</Link>
            </div>
          </div>
        )}

        {/* STEP: FORM */}
        {step === 'form' && (
          <div className="rg-card">
            <div className="rg-left">
              <img
                src={role === 'seller' ? '/images/pic2.jpeg' : '/images/pic4.jpeg'}
                alt="Register"
                className="rg-left-img"
              />
              <div className="rg-left-text">
                {role === 'seller' ? (
                  <>
                    <div className="rg-left-title">Start your<br /><em>journey 🌸</em></div>
                    <p className="rg-left-sub">Share your craft with the world.<br />We'll review your profile soon.</p>
                  </>
                ) : (
                  <>
                    <div className="rg-left-title">Welcome to<br /><em>WomenShop 🌿</em></div>
                    <p className="rg-left-sub">Discover heartfelt products made by talented women.</p>
                  </>
                )}
              </div>
              <div className="rg-progress">
                <div className="rg-dot active" />
                <div className="rg-dot" />
              </div>
            </div>

            <div className="rg-right">
              <button className="rg-back" onClick={() => { setStep('role'); setError(''); }}>
                ← Back
              </button>
              <h2 className="rg-form-title">
                {role === 'seller' ? 'Seller Application' : 'Create Account'}
              </h2>
              <p className="rg-form-sub">
                {role === 'seller'
                  ? 'Fill in your details — our team will review and approve your profile.'
                  : "Just a few details and you're good to go!"}
              </p>
              <div className="rg-role-badge">
                {role === 'seller' ? '🌸 Seller' : '🛍️ Customer'}
              </div>

              {error && <div className="rg-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="rg-field">
                  <label className="rg-label">Profile Photo</label>
                  <div className="rg-avatar-wrap">
                    <div className="rg-avatar-preview">
                      {avatarPreview ? <img src={avatarPreview} alt="Preview" /> : '👤'}
                    </div>
                    <label className="rg-avatar-btn" htmlFor="avatar-upload">
                      {avatarPreview ? 'Change photo' : 'Upload photo'}
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
                  </div>
                </div>

                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">Full Name</label>
                    <input name="name" type="text" placeholder="Amara Perera" value={formData.name} onChange={handleChange} className="rg-input" required />
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Phone</label>
                    <input name="phone" type="tel" placeholder="+94 77 000 0000" value={formData.phone} onChange={handleChange} className="rg-input" />
                  </div>
                </div>

                <div className="rg-field">
                  <label className="rg-label">Email</label>
                  <input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="rg-input" required />
                </div>

                <div className="rg-row">
                  <div className="rg-field">
                    <label className="rg-label">Password</label>
                    <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="rg-input" required />
                  </div>
                  <div className="rg-field">
                    <label className="rg-label">Confirm Password</label>
                    <input name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="rg-input" required />
                  </div>
                </div>

                {role === 'seller' && (
                  <>
                    <div className="rg-row">
                      <div className="rg-field">
                        <label className="rg-label">Shop Name</label>
                        <input name="shopName" type="text" placeholder="Amara Creations" value={formData.shopName} onChange={handleChange} className="rg-input" required />
                      </div>
                      <div className="rg-field">
                        <label className="rg-label">Location</label>
                        <input name="location" type="text" placeholder="Colombo" value={formData.location} onChange={handleChange} className="rg-input" />
                      </div>
                    </div>
                    <div className="rg-field">
                      <label className="rg-label">Short Bio</label>
                      <textarea name="bio" placeholder="Tell customers a little about yourself..." value={formData.bio} onChange={handleChange} className="rg-textarea" />
                    </div>
                    <div className="rg-field">
                      <label className="rg-label">Categories you sell in</label>
                      <div className="rg-cats">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat} type="button"
                            className={`rg-cat ${formData.categories.includes(cat) ? 'selected' : ''}`}
                            onClick={() => handleCategoryToggle(cat)}
                          >
                            {formData.categories.includes(cat) ? '✓ ' : ''}{cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="rg-btn" disabled={loading}>
                  {loading ? 'Submitting...' : role === 'seller' ? 'Submit Application →' : 'Create Account →'}
                </button>
              </form>

              <div className="rg-bottom">
                Already have an account? <Link to="/login">Sign in here</Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div className="rg-success-wrap">
            <div className="rg-success-icon">{role === 'seller' ? '🌸' : '🎉'}</div>
            <h2 className="rg-success-title">
              {role === 'seller' ? 'Application Submitted!' : 'Welcome aboard!'}
            </h2>
            <p className="rg-success-text">
              {role === 'seller'
                ? "Thank you for applying to WomenShop! Our team will review your profile and get back to you shortly."
                : "Your account has been created successfully. You can now browse and shop from talented women entrepreneurs!"}
            </p>
            <Link to="/login" className="rg-success-btn">
              {role === 'seller' ? 'Got it, go to Login →' : 'Sign in now →'}
            </Link>
          </div>
        )}

      </motion.div>
    </>
  );
};

export default Register;