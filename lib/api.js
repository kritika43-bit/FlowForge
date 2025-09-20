/**
 * API Helper with Axios for FlowForge
 * Handles authentication, headers, and error responses
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
export const tokenManager = {
  get: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('flowforge_token');
  },
  
  set: (token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('flowforge_token', token);
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('flowforge_token');
    localStorage.removeItem('flowforge_user');
  },

  isValid: () => {
    const token = tokenManager.get();
    if (!token) return false;
    
    try {
      // Simple JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.get();
    
    console.log(`Frontend calling: ${config.baseURL}${config.url}`);
    
    if (token && tokenManager.isValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('Unauthorized - clearing token and redirecting to login');
      tokenManager.remove();
      
      // Redirect to login if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Auth methods
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => {
    tokenManager.remove();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  
  // Profile methods
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Dashboard methods
  getDashboard: () => api.get('/dashboard'),
  
  // Manufacturing Orders
  getOrders: (params) => api.get('/manufacturing-orders', { params }),
  createOrder: (data) => api.post('/manufacturing-orders', data),
  updateOrder: (id, data) => api.put(`/manufacturing-orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/manufacturing-orders/${id}`),
  
  // Work Orders
  getWorkOrders: (params) => api.get('/work-orders', { params }),
  createWorkOrder: (data) => api.post('/work-orders', data),
  updateWorkOrder: (id, data) => api.put(`/work-orders/${id}`, data),
  
  // Work Centers
  getWorkCenters: (params) => api.get('/work-centers', { params }),
  
  // Stock/Inventory
  getStock: (params) => api.get('/stock', { params }),
  updateStock: (id, data) => api.put(`/stock/${id}`, data),
  
  // BOM
  getBOMs: (params) => api.get('/bom', { params }),
  
  // Reports
  getReports: (params) => api.get('/reports', { params }),
  
  // Health check
  health: () => api.get('/health'),
  
  // Debug echo
  debugEcho: (data) => api.post('/debug/echo', data),
};

// Export the axios instance for direct use if needed
export default api;
