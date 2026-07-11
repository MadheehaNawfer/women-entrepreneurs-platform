// MyOrders.js - Customer's order history page

import { useState, useEffect } from 'react';
import { getMyOrders } from '../services/api';

const MyOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':    return '#f39c12';
      case 'Processing': return '#3498db';
      case 'Shipped':    return '#8e44ad';
      case 'Delivered':  return '#27ae60';
      case 'Cancelled':  return '#c0392b';
      default:           return '#666';
    }
  };

  if (loading) return <p style={styles.loading}>Loading orders...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 My Orders</h2>

      {orders.length === 0 ? (
        <p style={styles.empty}>You have no orders yet!</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={styles.card}>

            {/* Order Header */}
            <div style={styles.header}>
              <p style={styles.orderId}>Order ID: {order._id}</p>
              <span style={{ ...styles.status, backgroundColor: getStatusColor(order.status) }}>
                {order.status}
              </span>
            </div>

            {/* Order Items */}
            {order.orderItems.map((item, index) => (
              <div key={index} style={styles.item}>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemInfo}>
                  Qty: {item.quantity} × LKR {item.price}
                </p>
              </div>
            ))}

            {/* Order Footer */}
            <div style={styles.footer}>
              <p style={styles.total}>Total: LKR {order.totalPrice}</p>
              <p style={styles.date}>
                Ordered: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { padding: '30px', backgroundColor: '#f9f0ff', minHeight: '80vh' },
  title:     { color: '#8e44ad', marginBottom: '20px' },
  empty:     { textAlign: 'center', fontSize: '18px', color: '#666' },
  loading:   { textAlign: 'center', padding: '40px', fontSize: '18px' },
  card: {
    backgroundColor: 'white',
    borderRadius:    '10px',
    padding:         '20px',
    marginBottom:    '20px',
    boxShadow:       '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   '15px',
    flexWrap:       'wrap',
    gap:            '10px',
  },
  orderId: { fontSize: '12px', color: '#666' },
  status: {
    color:        'white',
    padding:      '4px 12px',
    borderRadius: '20px',
    fontSize:     '13px',
    fontWeight:   'bold',
  },
  item: {
    display:        'flex',
    justifyContent: 'space-between',
    padding:        '8px 0',
    borderBottom:   '1px solid #eee',
  },
  itemName: { fontWeight: 'bold', color: '#333' },
  itemInfo: { color: '#666' },
  footer: {
    display:        'flex',
    justifyContent: 'space-between',
    marginTop:      '15px',
    flexWrap:       'wrap',
  },
  total: { fontWeight: 'bold', color: '#27ae60', fontSize: '16px' },
  date:  { color: '#999', fontSize: '13px' },
};

export default MyOrders;