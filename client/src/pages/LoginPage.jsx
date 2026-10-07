/**
 * =========================================================================
 * Login Page Component (pages/LoginPage.jsx)
 * =========================================================================
 * User sign-in page with instant validation, forgot password link,
 * and device-isolated instant demo mode.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  // Device-isolated demo login (No cross-mobile history leakage!)
  const handleInstantDemo = async () => {
    setError('');
    setSubmitting(true);
    const res = await demoLogin();
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  // Autofill static demo user
  const handleDemoFill = () => {
    setEmail('demo@wad.edu');
    setPassword('wad123456');
  };

  return (
    <div className="auth-wrapper">
      {/* Ambiance Blobs */}
      <div className="auth-bg-blob-1" />
      <div className="auth-bg-blob-2" />

      <div className="auth-card animate-scale-in">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <CheckSquare size={26} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to manage and track your daily tasks</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="auth-error-box" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Mail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                className="form-input has-left-icon"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password & Forgot Password Link */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-with-icon">
              <span className="input-icon-left">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input has-left-icon has-right-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Device Isolated Demo Login Button */}
          <button
            type="button"
            className="demo-badge-btn"
            onClick={handleInstantDemo}
            disabled={submitting}
            title="Instant Demo Session isolated specifically for your mobile device"
          >
            <Sparkles size={15} />
            <span>🚀 Instant Isolated Demo Mode</span>
          </button>

          {/* Demo Credentials Autofill Helper */}
          <button
            type="button"
            className="demo-badge-btn"
            onClick={handleDemoFill}
            style={{ borderStyle: 'dotted', opacity: 0.8 }}
            title="Auto-fill sample login credentials"
          >
            <span>Fill Sample Credentials (demo@wad.edu)</span>
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/signup">Create one now</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
