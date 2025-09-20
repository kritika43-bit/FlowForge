'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, tokenManager } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a valid token
        const hasValidToken = tokenManager.isValid();
        
        if (hasValidToken) {
          // Get user data from localStorage first
          const userData = localStorage.getItem('flowforge_user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // If no user data, try to fetch from backend
            try {
              const response = await apiClient.getProfile();
              if (response.data?.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem('flowforge_user', JSON.stringify(response.data.user));
              }
            } catch (error) {
              console.error('Failed to fetch user profile:', error);
              tokenManager.remove();
            }
          }
        } else {
          // Clear any stale data
          tokenManager.remove();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenManager.remove();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await apiClient.login(credentials);
      
      if (response.data?.token && response.data?.user) {
        // Store token and user data
        tokenManager.set(response.data.token);
        localStorage.setItem('flowforge_user', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        console.log('Login successful, redirecting to dashboard');
        router.push('/');
        
        return { success: true, user: response.data.user };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      console.log('Attempting signup with:', { email: userData.email, loginId: userData.loginId });
      
      const response = await apiClient.signup(userData);
      
      if (response.data?.success) {
        console.log('Signup successful');
        return { success: true, message: 'Account created successfully! Please login.' };
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    tokenManager.remove();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
