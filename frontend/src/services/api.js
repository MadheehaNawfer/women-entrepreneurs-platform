
const BASE_URL = 'https://women-entrepreneurs-platform-1zrw.vercel.app/api';
const getToken = () => localStorage.getItem('token');

const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (getToken()) headers['Authorization'] = `Bearer ${getToken()}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// ===== AUTH =====
export const registerUser  = (userData) => apiRequest('/auth/register', 'POST', userData);
export const loginUser     = (userData) => apiRequest('/auth/login', 'POST', userData);
export const getProfile    = ()          => apiRequest('/auth/profile');
export const changePassword = (data)    => apiRequest('/auth/profile/password', 'PUT', data);
// ===== PAYMENT =====
export const createPaymentIntent = (amount) => apiRequest('/payment/create-payment-intent', 'POST', { amount });

export const updateProfile = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/auth/profile/update`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  });
};

// ===== PRODUCTS =====
export const getAllProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/products?${query}`);
};
export const getProductById = (id)            => apiRequest(`/products/${id}`);
export const deleteProduct  = (id)            => apiRequest(`/products/${id}`, 'DELETE');
export const getMyProducts  = ()              => apiRequest('/products/seller/myproducts');

export const addProductWithImages = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  });
};

export const updateProductWithImages = (id, formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  });
};

// ===== REVIEWS =====
export const addReview = (productId, data) => apiRequest(`/products/${productId}/reviews`, 'POST', data);

// ===== ORDERS =====
export const placeOrder        = (data)        => apiRequest('/orders', 'POST', data);
export const getMyOrders       = ()            => apiRequest('/orders/myorders');
export const getSellerOrders   = ()            => apiRequest('/orders/sellerorders');
export const updateOrderStatus = (id, status)  => apiRequest(`/orders/${id}/status`, 'PUT', { status });
export const cancelOrder       = (id)          => apiRequest(`/orders/${id}/cancel`, 'PUT');

// ===== ADMIN =====
export const getAllUsers         = ()    => apiRequest('/admin/users');
export const approveSeller      = (id)  => apiRequest(`/admin/sellers/${id}/approve`, 'PUT');
export const approveProduct     = (id)  => apiRequest(`/admin/products/${id}/approve`, 'PUT');
export const deactivateUser     = (id)  => apiRequest(`/admin/users/${id}/deactivate`, 'PUT');
export const getAdminStats      = ()    => apiRequest('/admin/stats');
export const getPendingProducts = ()    => apiRequest('/admin/products/pending');
export const getAllProductsAdmin = ()   => apiRequest('/admin/products/all');
export const rejectProduct      = (id)  => apiRequest(`/admin/products/${id}/reject`, 'PUT');

// ===== SELLERS =====
export const getAllSellers  = ()   => apiRequest('/sellers');
export const getSellerById  = (id) => apiRequest(`/sellers/${id}`);