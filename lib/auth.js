// Authentication utilities for FlowForge

const TOKEN_KEY = 'flowforge_token';
const USER_KEY = 'flowforge_user';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

/**
 * Token management functions
 */
export const tokenManager = {
  get: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  
  set: (token) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
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

/**
 * Auto-login with demo user for development
 */
export const initDemoUser = async () => {
  // Check if we already have a token
  if (tokenManager.get()) {
    return true;
  }

  try {
    // Try to login with demo credentials
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@flowforge.com',
        password: 'demo123'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token && data.user) {
        tokenManager.set(data.token);
        userManager.set(data.user);
        return true;
      }
    }
    
    // If demo login fails, create a temporary token for development
    console.warn('Demo login failed, using fallback mode');
    return false;
  } catch (error) {
    console.error('Auto-login failed:', error);
    return false;
  }
};

/**
 * User data management
 */
export const userManager = {
  get: () => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  set: (user) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  remove: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * API configuration with authentication
 */
export const apiClient = {
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = tokenManager.get();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      console.log('API Request:', { url, config });
      const response = await fetch(url, config);
      console.log('API Response status:', response.status);
      
      // Handle unauthorized responses
      if (response.status === 401) {
        console.log('Unauthorized - redirecting to login');
        tokenManager.remove();
        userManager.remove();
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'An error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  get: (endpoint) => apiClient.request(endpoint),
  
  post: (endpoint, data) => apiClient.request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => apiClient.request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => apiClient.request(endpoint, {
    method: 'DELETE',
  }),
};

/**
 * Authentication service functions
 */
export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.token) {
      tokenManager.set(response.token);
      userManager.set(response.user);
    }
    
    return response;
  },
  
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  },
  
  logout: () => {
    tokenManager.remove();
    userManager.remove();
    window.location.href = '/login';
  },
  
  getCurrentUser: () => {
    return userManager.get();
  },
  
  isAuthenticated: () => {
    return tokenManager.isValid();
  },
  
  getProfile: async () => {
    return await apiClient.get('/auth/profile');
  },
  
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData);
    
    if (response.user) {
      userManager.set(response.user);
    }
    
    return response;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};

/**
 * Form validation helpers
 */
export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password) => {
    return password && password.length >= 6;
  },
  
  required: (value) => {
    return value && value.trim().length > 0;
  },
  
  passwordMatch: (password, confirmPassword) => {
    return password === confirmPassword;
  },
};

/**
 * Role definitions
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  INVENTORY: 'INVENTORY',
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.OPERATOR]: 'Operator',
  [USER_ROLES.INVENTORY]: 'Inventory Specialist',
};
