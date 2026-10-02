/**
 * =========================================================================
 * Authentication Context (context/AuthContext.jsx)
 * =========================================================================
 * Manages user authentication state, tokens, login, signup, and logout.
 * 
 * VIVA EXPLANATION:
 * - Stores JWT in `localStorage` ('wad_todo_token').
 * - On app initialization, checks for existing token and verifies identity by
 *   calling GET /api/auth/profile.
 * - Provides clean auth state (`user`, `token`, `isAuthenticated`, `login`, `signup`, `logout`)
 *   to protected routes and UI components.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wad_todo_token') || null);
  const [loading, setLoading] = useState(true);

  // Check token and fetch user on initial load
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('wad_todo_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success && res.user) {
            setUser(res.user);
            setToken(savedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.warn('Session verification failed, logging out:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  // Handle user login
  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.success && data.token) {
        localStorage.setItem('wad_todo_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Handle user signup
  const signup = async (name, email, password) => {
    try {
      const data = await api.post('/auth/signup', { name, email, password });
      if (data.success && data.token) {
        localStorage.setItem('wad_todo_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Signup failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Signup failed' };
    }
  };

  // Handle user logout
  const logout = () => {
    localStorage.removeItem('wad_todo_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
