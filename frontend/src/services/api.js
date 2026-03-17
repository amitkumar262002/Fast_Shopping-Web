/**
 * Fast Shopping - Complete API Service Layer v4.0
 * Centralized axios client with JWT auth, interceptors, and all API calls
 * Amazon-Grade Platform: Products, Cart, Orders, Search, Reviews, Coupons, Wishlist
 */
import axios from 'axios';
import { toast } from 'react-toastify';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    // Using 127.0.0.1 instead of localhost for better CORS reliability in dev
    const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : (window.location.hostname || '127.0.0.1');
    return `http://${hostname}:8000/api`;
};

const BASE_URL = getBaseURL();
console.log("🚀 Fast Shopping API connected to:", BASE_URL);

// ─── AXIOS INSTANCE ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('fs_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    res => res,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('fs_token');
            localStorage.removeItem('fs_user');
        }
        return Promise.reject(error);
    }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
    socialLogin: (data) => api.post('/auth/social-login', data),
    changePassword: (data) => api.put('/auth/password', data),
    getAddresses: () => api.get('/auth/addresses'),
    addAddress: (data) => api.post('/auth/addresses', data),
    updateAddress: (id, data) => api.put(`/auth/addresses/${id}`, data),
    deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
    setDefaultAddress: (id) => api.put(`/auth/addresses/${id}/default`),
    uploadImage: (formData) => api.post('/auth/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productsAPI = {
    getAll: (params = {}) => api.get('/products/', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    getFeatured: () => api.get('/products/', { params: { limit: 8, sort_by: 'rating' } }),
    getByCategory: (category, params = {}) => api.get('/products/', { params: { category, ...params } }),
    create: (data) => api.post('/products/', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    bulkCreate: (data) => api.post('/products/bulk', data),
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────
export const searchAPI = {
    search: (params = {}) => api.get('/search/', { params }),
    autocomplete: (q) => api.get('/search/autocomplete', { params: { q } }),
    getFilterOptions: (category) => api.get('/search/filters', { params: { category } }),
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
    getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
    addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
    deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// ─── COUPONS ──────────────────────────────────────────────────────────────────
export const couponsAPI = {
    validate: (code, amount) => api.post('/coupons/validate', { code, amount }),
    getAll: () => api.get('/coupons/'),
    create: (data) => api.post('/coupons/', data),
    update: (id, data) => api.put(`/coupons/${id}`, data),
    delete: (id) => api.delete(`/coupons/${id}`),
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
    create: (data) => api.post('/orders/create', data),
    verifyPayment: (data) => api.post('/orders/payment/verify', data),
    getMyOrders: () => api.get('/orders/my'),
    getOrder: (id) => api.get(`/orders/${id}`),
    getAll: () => api.get('/orders/'),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { order_status: status }),
    cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
    deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// ─── USER / WISHLIST ──────────────────────────────────────────────────────────
export const userAPI = {
    getWishlist: () => api.get('/user/wishlist'),
    toggleWishlist: (productId) => api.post(`/user/wishlist/${productId}`),
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
    getRevenue: () => api.get('/admin/revenue'),
    getAllOrders: () => ordersAPI.getAll(),
    updateOrderStatus: (id, status) => ordersAPI.updateStatus(id, status),
};

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
export const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem('fs_user') || 'null'); }
    catch { return null; }
};

export const getStoredToken = () => localStorage.getItem('fs_token');

export const storeAuth = (token, user) => {
    localStorage.setItem('fs_token', token);
    localStorage.setItem('fs_user', JSON.stringify(user));
};

export const clearAuth = () => {
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_user');
};

export const isLoggedIn = () => !!getStoredToken();

export default api;
