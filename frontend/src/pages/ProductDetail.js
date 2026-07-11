// ProductDetail.js - Single product detail page

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    if (!isLoggedIn) {
      setMessage('Please login to add to cart!');
      return;
    }
    if (user.role !== 'customer') {
      setMessage('Only customers can add to cart!');
      return;
    }

    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product already in cart
    const existing = cart.find((item) => item.productId === product._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product._id,
        name:      product.name,
        price:     product.price,
        quantity:  quantity,
        seller:    product.seller._id,
        image:     product.images?.[0] || '',
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setMessage('✅ Added to cart successfully!');
  };

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (!product) return <p style={styles.loading}>Product not found.</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Product Image */}
        <div style={styles.imageBox}>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} style={styles.image} />
          ) : (
            <div style={styles.noImage}>🛍️</div>
          )}
        </div>

        {/* Product Info */}
        <div style={styles.info}>
          <h2 style={styles.name}>{product.name}</h2>
          <p style={styles.category}>Category: {product.category}</p>
          <p style={styles.price}>LKR {product.price}</p>
          <p style={styles.stock}>In Stock: {product.stock}</p>
          <p style={styles.description}>{product.description}</p>

          <p style={styles.seller}>
            Sold by: <strong>{product.seller?.shopName || product.seller?.name}</strong>
          </p>

          {/* Quantity */}
          <div style={styles.quantityRow}>
            <label>Quantity: </label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={styles.quantityInput}
            />
          </div>

          {message && <p style={styles.message}>{message}</p>}

          <button onClick={addToCart} style={styles.addBtn}>
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:  { padding: '40px', backgroundColor: '#f9f0ff', minHeight: '80vh' },
  card: {
    display:         'flex',
    gap:             '30px',
    backgroundColor: 'white',
    borderRadius:    '10px',
    padding:         '30px',
    boxShadow:       '0 2px 10px rgba(0,0,0,0.1)',
    flexWrap:        'wrap',
  },
  imageBox: {
    width:           '300px',
    height:          '300px',
    backgroundColor: '#f0e0ff',
    display:         'flex',
    justifyContent:  'center',
    alignItems:      'center',
    borderRadius:    '10px',
  },
  image:       { width: '300px', height: '300px', objectFit: 'cover', borderRadius: '10px' },
  noImage:     { fontSize: '80px' },
  info:        { flex: 1, minWidth: '250px' },
  name:        { fontSize: '26px', color: '#333', marginBottom: '10px' },
  category:    { color: '#8e44ad', marginBottom: '5px' },
  price:       { fontSize: '24px', color: '#27ae60', fontWeight: 'bold', marginBottom: '5px' },
  stock:       { color: '#666', marginBottom: '10px' },
  description: { color: '#444', marginBottom: '15px', lineHeight: '1.6' },
  seller:      { color: '#333', marginBottom: '15px' },
  quantityRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
  quantityInput: {
    width: '60px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px'
  },
  message: { color: 'green', marginBottom: '10px' },
  addBtn: {
    padding:         '12px 25px',
    backgroundColor: '#8e44ad',
    color:           'white',
    border:          'none',
    borderRadius:    '5px',
    fontSize:        '16px',
    cursor:          'pointer',
  },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
};

export default ProductDetail;