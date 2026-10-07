/**
 * =========================================================================
 * Forgot / Reset Password Page Component (pages/ForgotPasswordPage.jsx)
 * =========================================================================
 * Allows users to securely reset their account password with instant validation.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setSubmitting(true);
    const res = await forgotPassword(email, newPassword);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your registered email and choose a new password</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="auth-error-box" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--success-light)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--success)',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-success btn-sm"
              style={{ width: '100%' }}
            >
              Go to Sign In
            </button>
          </div>
        )}

        {/* Form */}
        {!successMsg && (
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Registered Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="forgot-email">
                Registered Email Address
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  id="forgot-email"
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

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="forgot-new-password">
                New Password
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="forgot-new-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-left-icon has-right-icon"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            {/* Confirm New Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="forgot-confirm-password">
                Confirm New Password
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="forgot-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-left-icon"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="auth-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={16} />
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
