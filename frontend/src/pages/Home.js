// Home.js

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Search, ArrowRight, ShieldCheck, Heart, Users,
  Gem, Sparkles, Coffee, Shirt, Home as HomeIcon,
  Scissors, CheckCircle, HandHeart, Star, ShoppingBag,
} from 'lucide-react';
import { getAllSellers, getAllProducts } from '../services/api';

const CATEGORIES = [
  { name: 'Jewelry & Accessories', Icon: Gem,       desc: 'Handcrafted rings, necklaces & more', value: 'Jewelry & Accessories' },
  { name: 'Beauty & Skincare',     Icon: Sparkles,  desc: 'Natural & organic beauty products',   value: 'Beauty & Skincare'     },
  { name: 'Food & Beverages',      Icon: Coffee,    desc: 'Homemade treats & artisan goods',     value: 'Food & Beverages'      },
  { name: 'Clothing & Fashion',    Icon: Shirt,     desc: 'Unique handmade fashion pieces',      value: 'Clothing & Fashion'    },
  { name: 'Home & Decor',          Icon: HomeIcon,  desc: 'Cozy décor for your living space',    value: 'Home & Decor'          },
  { name: 'Handicrafts',           Icon: Scissors,  desc: 'Traditional crafts with love',        value: 'Handicrafts'           },
];

const WHY_US = [
  { Icon: Users,       title: 'Women-Led',     desc: 'Every product is made or sold by a woman entrepreneur from Sri Lanka.' },
  { Icon: ShieldCheck, title: 'Admin Verified', desc: 'All sellers and products are reviewed and approved before going live.' },
  { Icon: HandHeart,   title: 'Direct Support', desc: 'Your purchase goes directly to the woman behind the product.' },
  { Icon: Heart,       title: 'Made with Love', desc: "Handcrafted, homemade, and heartfelt goods you won't find elsewhere." },
];

const MARQUEE_ITEMS = [
  'Handmade with love', 'Women-led businesses', 'Shop local, shop unique',
  'Support women entrepreneurs', 'Authentic Sri Lankan crafts', 'Admin verified sellers',
];

const Home = () => {
  const [sellers,  setSellers]  = useState([]);
  const [products, setProducts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const categoryParam = searchParams.get('category') || '';
  const searchParam   = searchParams.get('search')   || '';

  useEffect(() => {
    fetchSellers();
    fetchProducts();
  }, [categoryParam, searchParam]);

  const fetchSellers = async () => {
    try {
      const data = await getAllSellers();
      setSellers(data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    try {
      let filters = '';
      if (categoryParam) filters += `category=${categoryParam}`;
      if (searchParam)   filters += `${filters ? '&' : ''}search=${searchParam}`;
      const data = await getAllProducts(filters);
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchParams({ search: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryClick = (e, value) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const getInitials = (name) =>
    name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  const isFiltered = categoryParam || searchParam;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ws-home { min-height: 100vh; background: #fffaf9; font-family: 'DM Sans', sans-serif; color: #2e1a20; overflow-x: hidden; }

        /* HERO */
        .ws-hero { position: relative; min-height: 92vh; background: #fdf0f2; display: flex; align-items: center; padding: 80px 6vw 60px; overflow: hidden; }
        .ws-hero::before { content: ''; position: absolute; top: -120px; right: -80px; width: 520px; height: 520px; background: radial-gradient(circle, #f2b8c0 0%, transparent 70%); opacity: 0.5; border-radius: 50%; pointer-events: none; }
        .ws-hero::after { content: ''; position: absolute; bottom: -100px; left: -60px; width: 380px; height: 380px; background: radial-gradient(circle, #e8a0ad 0%, transparent 70%); opacity: 0.35; border-radius: 50%; pointer-events: none; }
        .ws-hero-inner { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; max-width: 1200px; margin: 0 auto; width: 100%; }
        .ws-hero-left { display: flex; flex-direction: column; gap: 24px; }
        .ws-hero-tag { display: inline-flex; align-items: center; gap: 6px; background: white; border: 1px solid #f2cdd4; border-radius: 40px; padding: 6px 14px; font-size: 12px; color: #8c3a4e; font-weight: 500; letter-spacing: 0.04em; width: fit-content; }
        .ws-hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(40px, 5.5vw, 68px); font-weight: 600; color: #2e1a20; line-height: 1.08; }
        .ws-hero-title em { font-style: italic; color: #c0566a; font-weight: 500; }
        .ws-hero-sub { font-size: 15px; color: #7a4a55; line-height: 1.75; max-width: 420px; font-weight: 300; }
        .ws-hero-search { display: flex; background: white; border-radius: 50px; overflow: hidden; border: 1.5px solid #f2cdd4; max-width: 440px; box-shadow: 0 4px 20px rgba(192,86,106,0.1); }
        .ws-hero-search input { flex: 1; border: none; outline: none; padding: 14px 20px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #2e1a20; background: transparent; }
        .ws-hero-search input::placeholder { color: #c4909a; }
        .ws-hero-search button { background: #c0566a; color: white; border: none; padding: 14px 22px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 6px; }
        .ws-hero-search button:hover { background: #8c3a4e; }
        .ws-hero-stats { display: flex; gap: 32px; padding-top: 8px; }
        .ws-stat { display: flex; flex-direction: column; gap: 2px; }
        .ws-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600; color: #c0566a; }
        .ws-stat-label { font-size: 11px; color: #9a6070; letter-spacing: 0.05em; text-transform: uppercase; }
        .ws-hero-right { position: relative; }
        .ws-hero-img-main { width: 100%; max-width: 420px; height: 520px; object-fit: cover; border-radius: 40% 60% 55% 45% / 45% 40% 60% 55%; display: block; margin-left: auto; box-shadow: 0 20px 60px rgba(192,86,106,0.2); }
        .ws-hero-img-float { position: absolute; bottom: -30px; left: -20px; width: 150px; height: 150px; object-fit: cover; border-radius: 50%; border: 4px solid white; box-shadow: 0 8px 28px rgba(192,86,106,0.18); }

        /* MARQUEE */
        .ws-marquee-strip { background: #c0566a; padding: 13px 0; overflow: hidden; white-space: nowrap; }
        .ws-marquee-inner { display: inline-block; animation: marquee 28s linear infinite; }
        .ws-marquee-item { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.9); letter-spacing: 0.06em; text-transform: uppercase; padding: 0 32px; }
        .ws-marquee-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.4); }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* SECTIONS */
        .ws-section { padding: 80px 6vw; max-width: 1300px; margin: 0 auto; }
        .ws-section-head { margin-bottom: 48px; }
        .ws-eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #c0566a; font-weight: 500; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; }
        .ws-eyebrow::after { content: ''; display: inline-block; width: 28px; height: 1px; background: #e8a0ad; }
        .ws-section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 3.5vw, 42px); font-weight: 600; color: #2e1a20; line-height: 1.15; }

        /* CATEGORIES */
        .ws-cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .ws-cat-card { background: white; border-radius: 16px; padding: 28px 24px; text-decoration: none; border: 1px solid #ede8e9; transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s; display: flex; flex-direction: column; gap: 10px; cursor: pointer; }
        .ws-cat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 36px rgba(192,86,106,0.12); border-color: #e8a0ad; }
        .ws-cat-icon-wrap { width: 44px; height: 44px; border-radius: 10px; background: #fdf0f2; display: flex; align-items: center; justify-content: center; color: #c0566a; flex-shrink: 0; transition: background 0.2s; }
        .ws-cat-card:hover .ws-cat-icon-wrap { background: #c0566a; color: white; }
        .ws-cat-name { font-size: 14px; font-weight: 500; color: #2e1a20; font-family: 'Inter', sans-serif; }
        .ws-cat-desc { font-size: 12px; color: #9a6070; line-height: 1.6; flex: 1; }
        .ws-cat-link { font-size: 12px; color: #c0566a; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 4px; font-family: 'Inter', sans-serif; }

        /* PRODUCTS GRID */
        .ws-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .ws-product-card { background: white; border-radius: 12px; border: 1px solid #ede8e9; overflow: hidden; transition: box-shadow 0.22s, transform 0.22s; }
        .ws-product-card:hover { box-shadow: 0 6px 24px rgba(192,86,106,0.1); transform: translateY(-2px); }
        .ws-product-img { height: 180px; overflow: hidden; background: #faf7f8; }
        .ws-product-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .ws-product-card:hover .ws-product-img img { transform: scale(1.06); }
        .ws-product-body { padding: 14px 16px; }
        .ws-product-cat { font-size: 11px; color: #c0566a; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 4px; }
        .ws-product-name { font-size: 14px; font-weight: 500; color: #2e1a20; margin-bottom: 4px; font-family: 'Inter', sans-serif; }
        .ws-product-price { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; color: #2e1a20; margin-bottom: 10px; }
        .ws-product-btn { display: block; text-align: center; background: #c0566a; color: white; padding: 8px; border-radius: 7px; text-decoration: none; font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .ws-product-btn:hover { background: #8c3a4e; }

        /* WHY */
        .ws-why-section { background: #fdf0f2; padding: 80px 6vw; position: relative; overflow: hidden; }
        .ws-why-section::before { content: ''; position: absolute; right: -100px; top: -100px; width: 400px; height: 400px; background: radial-gradient(circle, #f2b8c0 0%, transparent 70%); opacity: 0.4; border-radius: 50%; pointer-events: none; }
        .ws-why-inner { max-width: 1300px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; position: relative; z-index: 1; }
        .ws-why-img-wrap { position: relative; }
        .ws-why-img { width: 100%; max-width: 440px; height: 500px; object-fit: cover; border-radius: 20px; display: block; box-shadow: 0 16px 48px rgba(192,86,106,0.18); }
        .ws-why-img-accent { position: absolute; bottom: -24px; right: -24px; width: 140px; height: 140px; object-fit: cover; border-radius: 50%; border: 5px solid #fffaf9; box-shadow: 0 8px 24px rgba(192,86,106,0.2); }
        .ws-why-right { display: flex; flex-direction: column; gap: 14px; }
        .ws-why-card { display: flex; gap: 14px; align-items: flex-start; background: white; border-radius: 14px; padding: 18px 20px; border: 1px solid #ede8e9; transition: box-shadow 0.2s; }
        .ws-why-card:hover { box-shadow: 0 4px 20px rgba(192,86,106,0.09); }
        .ws-why-icon-wrap { width: 40px; height: 40px; border-radius: 10px; background: #fdf0f2; display: flex; align-items: center; justify-content: center; color: #c0566a; flex-shrink: 0; }
        .ws-why-text h4 { font-size: 13px; font-weight: 600; color: #2e1a20; margin-bottom: 3px; font-family: 'Inter', sans-serif; }
        .ws-why-text p { font-size: 12px; color: #9a6070; line-height: 1.6; }

        /* SELLERS */
        .ws-sellers-bg { background: white; border-top: 1px solid #ede8e9; }
        .ws-sellers-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ws-seller-card { background: #fffaf9; border-radius: 16px; padding: 28px 20px; text-align: center; border: 1px solid #ede8e9; transition: transform 0.22s, box-shadow 0.22s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ws-seller-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(192,86,106,0.1); }
        .ws-seller-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #c0566a 0%, #e8a0ad 100%); display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 600; color: white; margin-bottom: 4px; box-shadow: 0 4px 14px rgba(192,86,106,0.25); }
        .ws-seller-name { font-size: 14px; font-weight: 500; color: #2e1a20; font-family: 'Inter', sans-serif; }
        .ws-seller-shop { font-size: 11px; color: #9a6070; }
        .ws-seller-btn { margin-top: 8px; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-size: 12px; font-weight: 500; color: #c0566a; padding: 7px 16px; border-radius: 8px; border: 1px solid #e8a0ad; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .ws-seller-btn:hover { background: #c0566a; color: white; border-color: #c0566a; }

        /* CTA */
        .ws-cta-wrap { padding: 0 6vw 80px; }
        .ws-cta { background: linear-gradient(135deg, #8c3a4e 0%, #c0566a 100%); border-radius: 20px; padding: 56px 52px; display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; position: relative; overflow: hidden; }
        .ws-cta::before { content: ''; position: absolute; right: -60px; top: -80px; width: 280px; height: 280px; background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%); border-radius: 50%; }
        .ws-cta-text { position: relative; z-index: 1; }
        .ws-cta-eyebrow { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); font-family: 'Inter', sans-serif; font-weight: 500; margin-bottom: 10px; }
        .ws-cta-text h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(22px, 3vw, 34px); font-weight: 600; color: white; margin-bottom: 10px; }
        .ws-cta-text p { font-size: 14px; color: rgba(255,255,255,0.72); line-height: 1.7; max-width: 480px; }
        .ws-cta-btn { position: relative; z-index: 1; text-decoration: none; background: white; color: #8c3a4e; font-size: 13px; font-weight: 600; padding: 13px 28px; border-radius: 10px; white-space: nowrap; transition: opacity 0.2s, transform 0.2s; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
        .ws-cta-btn:hover { opacity: 0.92; transform: translateY(-1px); }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .ws-hero-inner { grid-template-columns: 1fr; text-align: center; }
          .ws-hero-right { display: none; }
          .ws-hero-stats { justify-content: center; }
          .ws-hero-search { max-width: 100%; }
          .ws-hero-sub { max-width: 100%; margin: 0 auto; }
          .ws-cat-grid { grid-template-columns: repeat(2, 1fr); }
          .ws-why-inner { grid-template-columns: 1fr; }
          .ws-why-img-wrap { display: none; }
          .ws-sellers-grid { grid-template-columns: repeat(2, 1fr); }
          .ws-cta { grid-template-columns: 1fr; text-align: center; }
          .ws-cta-text p { max-width: 100%; }
        }
        @media (max-width: 560px) {
          .ws-cat-grid { grid-template-columns: 1fr; }
          .ws-sellers-grid { grid-template-columns: 1fr; }
          .ws-cta { padding: 36px 24px; }
          .ws-hero-stats { gap: 20px; }
          .ws-products-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <motion.div className="ws-home" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>

        {/* HERO */}
        <section className="ws-hero">
          <div className="ws-hero-inner">
            <div className="ws-hero-left">
              <div className="ws-hero-tag">
                <ShieldCheck size={12} color="#c0566a" />
                Sri Lanka's women-led marketplace
              </div>
              <h1 className="ws-hero-title">
                Discover products<br />
                made with <em>love</em><br />
                <em>&amp; purpose</em>
              </h1>
              <p className="ws-hero-sub">
                Shop handcrafted, homemade &amp; heartfelt products from
                talented women entrepreneurs across Sri Lanka.
              </p>
              <form onSubmit={handleSearch} className="ws-hero-search">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit">
                  <Search size={14} /> Search
                </button>
              </form>
              <div className="ws-hero-stats">
                <div className="ws-stat">
                  <span className="ws-stat-num">{sellers.length}+</span>
                  <span className="ws-stat-label">Women Sellers</span>
                </div>
                <div className="ws-stat">
                  <span className="ws-stat-num">{products.length}+</span>
                  <span className="ws-stat-label">Products</span>
                </div>
                <div className="ws-stat">
                  <span className="ws-stat-num">6+</span>
                  <span className="ws-stat-label">Categories</span>
                </div>
              </div>
            </div>
            <div className="ws-hero-right">
              <img src="/images/pic1.jpeg" alt="Woman entrepreneur" className="ws-hero-img-main" />
              <img src="/images/pic2.jpeg" alt="Floral accent"      className="ws-hero-img-float" />
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="ws-marquee-strip">
          <div className="ws-marquee-inner">
            {[...Array(2)].map((_, i) => (
              <span key={i}>
                {MARQUEE_ITEMS.map((item, j) => (
                  <span key={j}>
                    <span className="ws-marquee-item">
                      <CheckCircle size={11} color="rgba(255,255,255,0.7)" />
                      {item}
                    </span>
                    <span className="ws-marquee-dot" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="ws-section">
          <div className="ws-section-head">
            <p className="ws-eyebrow">Browse by category</p>
            <h2 className="ws-section-title">What are you looking for?</h2>
          </div>
          <div className="ws-cat-grid">
            {CATEGORIES.map(({ name, Icon, desc, value }) => (
              <Link
                key={value}
                to={isLoggedIn ? `/customer?category=${value}` : '/login'}
                className="ws-cat-card"
                onClick={e => handleCategoryClick(e, value)}
              >
                <div className="ws-cat-icon-wrap"><Icon size={20} /></div>
                <div className="ws-cat-name">{name}</div>
                <div className="ws-cat-desc">{desc}</div>
                <div className="ws-cat-link">Explore <ArrowRight size={12} /></div>
              </Link>
            ))}
          </div>
        </div>

        {/* FILTERED PRODUCTS — shows when search or category is active */}
        {isFiltered && (
          <div className="ws-section" style={{ paddingTop:0 }}>
            <div className="ws-section-head">
              <p className="ws-eyebrow">Search results</p>
              <h2 className="ws-section-title">
                {categoryParam ? categoryParam : `Results for "${searchParam}"`}
              </h2>
              <button
                onClick={() => setSearchParams({})}
                style={{ marginTop:'12px', background:'none', border:'1px solid #e8a0ad', color:'#c0566a', padding:'6px 14px', borderRadius:'20px', cursor:'pointer', fontSize:'12px', fontFamily:'Inter,sans-serif' }}>
                Clear filter ×
              </button>
            </div>
            {products.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#9a7080' }}>
                <ShoppingBag size={36} color="#ddd0d4" style={{ marginBottom:'12px' }} />
                <p>No products found. Try a different search!</p>
              </div>
            ) : (
              <div className="ws-products-grid">
                {products.map(product => (
                  <Link key={product._id} to={`/product/${product._id}`} style={{ textDecoration:'none' }}>
                    <div className="ws-product-card">
                      <div className="ws-product-img">
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt={product.name} />
                          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ddd0d4' }}><ShoppingBag size={40} /></div>
                        }
                      </div>
                      <div className="ws-product-body">
                        <div className="ws-product-cat">{product.category}</div>
                        <div className="ws-product-name">{product.name}</div>
                        <div className="ws-product-price">LKR {product.price?.toLocaleString()}</div>
                        <div className="ws-product-btn">View Product</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WHY SHOP WITH US */}
        {!isFiltered && (
          <div className="ws-why-section">
            <div className="ws-why-inner">
              <div className="ws-why-img-wrap">
                <img src="/images/pic4.jpeg" alt="Woman with flowers" className="ws-why-img" />
                <img src="/images/pic3.jpeg" alt="Floral accent"      className="ws-why-img-accent" />
              </div>
              <div className="ws-why-right">
                <div>
                  <p className="ws-eyebrow">Why choose us</p>
                  <h2 className="ws-section-title">Shopping that<br />makes a difference</h2>
                </div>
                {WHY_US.map(({ Icon, title, desc }, i) => (
                  <div key={i} className="ws-why-card">
                    <div className="ws-why-icon-wrap"><Icon size={18} /></div>
                    <div className="ws-why-text">
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SELLERS */}
        {!isFiltered && (
          <div className="ws-sellers-bg">
            <div className="ws-section">
              <div className="ws-section-head">
                <p className="ws-eyebrow">Meet our sellers</p>
                <h2 className="ws-section-title">Women behind the craft</h2>
              </div>
              {sellers.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px', color:'#9a7080', fontSize:'14px' }}>
                  No sellers yet. Be the first to join! 🌸
                </div>
              ) : (
                <div className="ws-sellers-grid">
                  {sellers.map(seller => (
                    <div key={seller._id} className="ws-seller-card">
                      {seller.profileImage ? (
                        <img src={seller.profileImage} alt={seller.name}
                          style={{ width:'64px', height:'64px', borderRadius:'50%', objectFit:'cover', marginBottom:'4px', border:'3px solid #f2cdd4' }} />
                      ) : (
                        <div className="ws-seller-avatar">{getInitials(seller.name)}</div>
                      )}
                      <div className="ws-seller-name">{seller.name}</div>
                      <div className="ws-seller-shop">{seller.shopName}</div>
                      {seller.shopDescription && (
                        <div style={{ fontSize:'12px', color:'#9a7080', textAlign:'center', lineHeight:'1.5', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                          {seller.shopDescription}
                        </div>
                      )}
                      <Link to={`/shop/${seller._id}`} className="ws-seller-btn">
                        View Store <ArrowRight size={11} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        {!isFiltered && (
          <div className="ws-cta-wrap">
            <div className="ws-cta">
              <div className="ws-cta-text">
                <p className="ws-cta-eyebrow">For entrepreneurs</p>
                <h2>Are you a woman entrepreneur?</h2>
                <p>Join WomenShop and start showcasing your handmade products to customers across Sri Lanka. Registration is free — apply and our team will review your profile.</p>
              </div>
              <Link to="/register" className="ws-cta-btn">
                Start Selling <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

      </motion.div>
    </>
  );
};

export default Home;