// AddProduct.js - Seller adds a new product

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../services/api';

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name:        '',
    description: '',
    price:       '',
    stock:       '',
    category:    'Food',
    images:      [],
  });
  const [imageUrl, setImageUrl] = useState('');
  const [message,  setMessage]  = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add image URL to list
  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, imageUrl.trim()] });
      setImageUrl('');
    }
  };

  // Remove image from list
  const removeImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await addProduct({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });
      setMessage('✅ Product added! Waiting for admin approval.');
      setTimeout(() => navigate('/seller'), 2000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>➕ Add New Product</h2>

        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...styles.input, height: '100px' }}
            required
          />

          <input
            name="price"
            placeholder="Price (LKR)"
            type="number"
            value={formData.price}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="stock"
            placeholder="Stock Quantity"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="Food">Food</option>
            <option value="Clothing">Clothing</option>
            <option value="Handicrafts">Handicrafts</option>
            <option value="Home Services">Home Services</option>
            <option value="Beauty">Beauty</option>
            <option value="Other">Other</option>
          </select>

          {/* Image URL input */}
          <div style={styles.imageRow}>
            <input
              type="text"
              placeholder="Paste image URL here"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ ...styles.input, marginBottom: 0, flex: 1 }}
            />
            <button type="button" onClick={addImage} style={styles.addImageBtn}>
              Add Image
            </button>
          </div>

          {/* Show added images */}
          {formData.images.map((img, index) => (
            <div key={index} style={styles.imageItem}>
              <img src={img} alt="product" style={styles.imagePreview} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={styles.removeImageBtn}
              >
                ❌
              </button>
            </div>
          ))}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding:         '30px',
    backgroundColor: '#f9f0ff',
    minHeight:       '80vh',
    display:         'flex',
    justifyContent:  'center',
  },
  box: {
    backgroundColor: 'white',
    padding:         '30px',
    borderRadius:    '10px',
    boxShadow:       '0 2px 10px rgba(0,0,0,0.1)',
    width:           '100%',
    maxWidth:        '500px',
    height:          'fit-content',
  },
  title:   { color: '#8e44ad', marginBottom: '20px' },
  message: { color: 'green', marginBottom: '15px' },
  input: {
    width:        '100%',
    padding:      '10px',
    marginBottom: '12px',
    borderRadius: '5px',
    border:       '1px solid #ccc',
    fontSize:     '14px',
    boxSizing:    'border-box',
  },
  imageRow: {
    display:      'flex',
    gap:          '10px',
    marginBottom: '12px',
    alignItems:   'center',
  },
  addImageBtn: {
    padding:         '10px 15px',
    backgroundColor: '#8e44ad',
    color:           'white',
    border:          'none',
    borderRadius:    '5px',
    cursor:          'pointer',
    whiteSpace:      'nowrap',
  },
  imageItem: {
    display:      'flex',
    alignItems:   'center',
    gap:          '10px',
    marginBottom: '8px',
  },
  imagePreview: {
    width:        '60px',
    height:       '60px',
    objectFit:    'cover',
    borderRadius: '5px',
    border:       '1px solid #ccc',
  },
  removeImageBtn: {
    backgroundColor: 'transparent',
    border:          'none',
    cursor:          'pointer',
    fontSize:        '18px',
  },
  submitBtn: {
    width:           '100%',
    padding:         '12px',
    backgroundColor: '#27ae60',
    color:           'white',
    border:          'none',
    borderRadius:    '5px',
    fontSize:        '16px',
    cursor:          'pointer',
    marginTop:       '10px',
  },
};

export default AddProduct;