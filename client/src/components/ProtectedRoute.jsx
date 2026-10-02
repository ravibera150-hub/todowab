/**
 * =========================================================================
 * Protected Route Component (components/ProtectedRoute.jsx)
 * =========================================================================
 * Guards private routes so unauthenticated users cannot access them.
 * 
 * VIVA EXPLANATION:
 * - Reads `isAuthenticated` and `loading` from AuthContext.
 * - If still verifying token, renders a minimalist loading spinner.
 * - If not authenticated, redirects user to `/login` using React Router's `<Navigate />`.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading TaskFlow...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
