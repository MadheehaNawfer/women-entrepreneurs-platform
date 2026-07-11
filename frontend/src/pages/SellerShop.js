// SellerShop.js - Public seller shop page

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, ShoppingCart, Heart,
  ShoppingBag, CheckCircle, Store, Link2,
} from 'lucide-react';
import { getSellerById } from '../services/api';

const getInitials = (name) =>
  name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const SellerShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [seller,   setSeller]   = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cart,     setCart]     = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast,    setToast]    = useState(null);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchShop();
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
  }, [id]);

  const fetchShop = async () => {
    try {
      const data = await getSellerById(id);
      setSeller(data.seller);
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (user?.role !== 'customer') { showToast('Only customers can add to cart!', 'error'); return; }
    if (product.stock === 0) { showToast('This product is out of stock!', 'error'); return; }

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
        seller:    product.seller,
        image:     product.images?.[0] || '',
      }];
    }
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    showToast(`${product.name} added to cart!`);
  };

  const addToWishlist = (product) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    const exists = wishlist.find(w => w._id === product._id);
    if (exists) { showToast('Already in wishlist!', 'error'); return; }
    const updated = [...wishlist, product];
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    showToast('Added to wishlist!');
  };

  const isInCart     = (id) => cart.find(c => c.productId === id);
  const isInWishlist = (id) => wishlist.find(w => w._id === id);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered   = category === 'all' ? products : products.filter(p => p.category === category);

  const getStockLabel = (stock) => {
    if (stock === 0)  return { label: 'Out of Stock', color: '#991b1b' };
    if (stock <= 5)   return { label: `Only ${stock} left!`, color: '#92400e' };
    return               { label: `In Stock (${stock})`, color: '#065f46' };
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'36px', height:'36px', border:'3px solid #f2cdd4', borderTopColor:'#c0566a', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 14px' }} />
        <p style={{ color:'#9a6070', fontSize:'14px' }}>Loading shop...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!seller) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', fontFamily:'DM Sans,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <Store size={48} color="#ddd0d4" style={{ marginBottom:'16px' }} />
        <h2 style={{ color:'#1a0f13', marginBottom:'8px' }}>Shop not found</h2>
        <p style={{ color:'#9a7080', marginBottom:'20px' }}>This shop doesn't exist or is no longer active.</p>
        <button onClick={() => navigate('/')}
          style={{ background:'#c0566a', color:'white', border:'none', padding:'10px 24px', borderRadius:'8px', cursor:'pointer', fontSize:'14px' }}>
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@300;400;500&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ss-wrap { min-height: 100vh; background: #f8f4f5; font-family: 'DM Sans', sans-serif; }
        .ss-hero { background: linear-gradient(135deg, #1a0f13 0%, #3d1f2a 60%, #6b3045 100%); padding: 48px 40px; }
        .ss-hero-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
        .ss-back-btn { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.6); background: none; border: none; cursor: pointer; font-size: 13px; font-family: 'DM Sans',sans-serif; margin-bottom: 24px; transition: color 0.2s; padding: 0; }
        .ss-back-btn:hover { color: white; }
        .ss-avatar { width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg,#c0566a,#e8a0ad); display: flex; align-items: center; justify-content: center; font-family: 'Inter',sans-serif; font-size: 28px; font-weight: 600; color: white; border: 3px solid rgba(255,255,255,0.2); overflow: hidden; }
        .ss-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ss-shop-name { font-family: 'Cormorant Garamond',serif; font-size: 28px; font-weight: 600; color: white; margin-bottom: 4px; }
        .ss-seller-name { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .ss-shop-desc { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; max-width: 500px; margin-bottom: 12px; }
        .ss-social { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px; }
        .ss-social-link { display: inline-flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.6); font-size: 12px; text-decoration: none; transition: color 0.2s; }
        .ss-social-link:hover { color: #e8a0ad; }
        .ss-stats { display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap; }
        .ss-stat { text-align: center; }
        .ss-stat-val { font-family: 'Inter',sans-serif; font-size: 20px; font-weight: 600; color: white; }
        .ss-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
        .ss-content { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
        .ss-filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
        .ss-filter-btn { padding: 7px 16px; border-radius: 20px; border: 1.5px solid #ede8e9; background: white; font-size: 12px; color: #6b4050; cursor: pointer; font-family: 'Inter',sans-serif; transition: all 0.15s; font-weight: 500; }
        .ss-filter-btn.active { border-color: #c0566a; background: #c0566a; color: white; }
        .ss-filter-btn:hover { border-color: #c0566a; }
        .ss-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .ss-card { background: white; border-radius: 12px; border: 1px solid #ede8e9; overflow: hidden; transition: box-shadow 0.22s, transform 0.22s; }
        .ss-card:hover { box-shadow: 0 6px 24px rgba(192,86,106,0.1); transform: translateY(-2px); }
        .ss-card-img { height: 180px; overflow: hidden; background: #faf7f8; position: relative; }
        .ss-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .ss-card:hover .ss-card-img img { transform: scale(1.06); }
        .ss-card-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #ddd0d4; }
        .ss-wishlist-btn { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.15s; }
        .ss-out-badge { position: absolute; top: 10px; left: 10px; background: #991b1b; color: white; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: 'Inter',sans-serif; }
        .ss-low-badge { position: absolute; top: 10px; left: 10px; background: #92400e; color: white; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: 'Inter',sans-serif; }
        .ss-card-body { padding: 14px 16px; }
        .ss-card-cat { font-size: 11px; color: #c0566a; font-family: 'Inter',sans-serif; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 4px; }
        .ss-card-name { font-size: 14px; font-weight: 500; color: #1a0f13; margin-bottom: 4px; font-family: 'Inter',sans-serif; }
        .ss-card-price { font-family: 'Cormorant Garamond',serif; font-size: 17px; font-weight: 600; color: #1a0f13; margin-bottom: 6px; }
        .ss-stock-label { font-size: 11px; font-weight: 500; margin-bottom: 10px; font-family: 'Inter',sans-serif; }
        .ss-add-btn { width: 100%; padding: 8px; border: none; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter',sans-serif; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .ss-add-btn.in-cart  { background: #ecfdf5; color: #065f46; cursor: default; }
        .ss-add-btn.add      { background: #c0566a; color: white; }
        .ss-add-btn.add:hover { background: #8c3a4e; }
        .ss-add-btn.out      { background: #f5f0f1; color: #9a7080; cursor: not-allowed; }
        .ss-empty { text-align: center; padding: 60px 32px; background: white; border-radius: 12px; border: 1px solid #ede8e9; color: #9a7080; }
        .ss-empty-title { font-size: 16px; font-weight: 500; color: #4a2c35; margin: 14px 0 6px; font-family: 'Inter',sans-serif; }
        .ss-toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 500; font-family: 'DM Sans',sans-serif; z-index: 2000; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; max-width: 300px; }
        .ss-toast.success { background: #1a0f13; color: white; }
        .ss-toast.error   { background: #dc2626; color: white; }
        @media (max-width: 600px) {
          .ss-hero    { padding: 32px 20px; }
          .ss-content { padding: 20px 16px; }
          .ss-grid    { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>

      <motion.div className="ss-wrap" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>

        {/* HERO */}
        <div className="ss-hero">
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <button className="ss-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
            <div className="ss-hero-inner">
              <div className="ss-avatar">
                {seller.profileImage
                  ? <img src={seller.profileImage} alt={seller.name} />
                  : getInitials(seller.name)
                }
              </div>
              <div style={{ flex:1 }}>
                <div className="ss-shop-name">{seller.shopName || seller.name}</div>
                <div className="ss-seller-name">by {seller.name}</div>
                {seller.shopDescription && (
                  <div className="ss-shop-desc">{seller.shopDescription}</div>
                )}

                {/* Social Links */}
                <div className="ss-social">
                  {seller.socialLinks?.instagram && (
                    <a href={seller.socialLinks.instagram} target="_blank" rel="noreferrer" className="ss-social-link">
                      <Link2 size={13} /> Instagram
                    </a>
                  )}
                  {seller.socialLinks?.facebook && (
                    <a href={seller.socialLinks.facebook} target="_blank" rel="noreferrer" className="ss-social-link">
                      <Link2 size={13} /> Facebook
                    </a>
                  )}
                  {seller.socialLinks?.website && (
                    <a href={seller.socialLinks.website} target="_blank" rel="noreferrer" className="ss-social-link">
                      <Link2 size={13} /> Website
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="ss-stats">
                  <div className="ss-stat">
                    <div className="ss-stat-val">{products.length}</div>
                    <div className="ss-stat-lbl">Products</div>
                  </div>
                  <div className="ss-stat">
                    <div className="ss-stat-val">
                      {products.reduce((s, p) => s + (p.numReviews || 0), 0)}
                    </div>
                    <div className="ss-stat-lbl">Reviews</div>
                  </div>
                  <div className="ss-stat">
                    <div className="ss-stat-val">
                      {products.length > 0
                        ? (products.reduce((s, p) => s + (p.rating || 0), 0) / products.length).toFixed(1)
                        : '—'
                      }
                    </div>
                    <div className="ss-stat-lbl">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="ss-content">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
            <h3 style={{ fontFamily:'Inter,sans-serif', fontSize:'16px', fontWeight:'600', color:'#1a0f13' }}>
              All Products ({products.length})
            </h3>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="ss-filter-row">
              {categories.map(cat => (
                <button key={cat}
                  className={`ss-filter-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}>
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="ss-empty">
              <ShoppingBag size={40} color="#ddd0d4" />
              <div className="ss-empty-title">No products yet</div>
              This seller hasn't added any products yet.
            </div>
          ) : (
            <div className="ss-grid">
              {filtered.map(product => {
                const stockInfo  = getStockLabel(product.stock);
                const outOfStock = product.stock === 0;
                return (
                  <div key={product._id} className="ss-card">
                    <div className="ss-card-img">
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt={product.name} />
                        : <div className="ss-card-no-img"><ShoppingBag size={40} /></div>
                      }

                      {/* Stock badge on image */}
                      {product.stock === 0 && (
                        <div className="ss-out-badge">Out of Stock</div>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="ss-low-badge">Only {product.stock} left!</div>
                      )}

                      {/* Wishlist button */}
                      <button
                        className="ss-wishlist-btn"
                        onClick={() => addToWishlist(product)}
                        style={{
                          background: isInWishlist(product._id) ? '#c0566a' : 'rgba(255,255,255,0.9)',
                        }}>
                        <Heart
                          size={14}
                          color={isInWishlist(product._id) ? 'white' : '#c0566a'}
                          fill={isInWishlist(product._id) ? 'white' : 'none'}
                        />
                      </button>
                    </div>

                    <div className="ss-card-body">
                      <div className="ss-card-cat">{product.category}</div>
                      <div className="ss-card-name">{product.name}</div>
                      <div className="ss-card-price">LKR {product.price?.toLocaleString()}</div>

                      {/* Stock label */}
                      <div className="ss-stock-label" style={{ color: stockInfo.color }}>
                        {stockInfo.label}
                      </div>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'10px' }}>
                          <span style={{ color:'#f59e0b', fontSize:'12px' }}>★</span>
                          <span style={{ fontSize:'12px', color:'#9a7080' }}>
                            {product.rating?.toFixed(1)} ({product.numReviews})
                          </span>
                        </div>
                      )}

                      {/* Add to Cart button */}
                      <button
                        className={`ss-add-btn ${outOfStock ? 'out' : isInCart(product._id) ? 'in-cart' : 'add'}`}
                        onClick={() => !outOfStock && addToCart(product)}
                        disabled={outOfStock}>
                        {outOfStock
                          ? 'Out of Stock'
                          : isInCart(product._id)
                            ? <><CheckCircle size={13} /> Added to Cart</>
                            : <><ShoppingCart size={13} /> Add to Cart</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TOAST */}
        {toast && (
          <div className={`ss-toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : '❌'}
            {toast.msg}
          </div>
        )}

      </motion.div>
    </>
  );
};

export default SellerShop;