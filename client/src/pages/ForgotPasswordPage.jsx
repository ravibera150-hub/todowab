/**
 * =========================================================================
 * Forgot / Reset Password Page Component (pages/ForgotPasswordPage.jsx)
 * =========================================================================
 * Multi-step OTP Authentication flow for resetting user account passwords.
 * Step 1: Send OTP to registered email
 * Step 2: Verify 6-digit OTP code & set new password
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const { sendOtp, verifyOtpReset } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please enter your registered email address');
      return;
    }

    setSubmitting(true);
    const res = await sendOtp(email);
    setSubmitting(false);

    if (res.success) {
      setGeneratedOtp(res.otp || '');
      setStep(2);
      setSuccessMsg(`OTP sent successfully to ${email}`);
    } else {
      setError(res.message);
    }
  };

  // Step 2: Verify OTP & Set New Password
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the valid 6-digit OTP code');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setSubmitting(true);
    const res = await verifyOtpReset(email, otp.trim(), newPassword);
    setSubmitting(false);

    if (res.success) {
      setStep(3);
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
          <h1 className="auth-title">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter OTP Code'}
            {step === 3 && 'Password Updated!'}
          </h1>
          <p className="auth-subtitle">
            {step === 1 && 'Enter your registered email to receive a 6-digit OTP code'}
            {step === 2 && `OTP verification code sent to ${email}`}
            {step === 3 && 'Your account password has been reset successfully'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="auth-error-box" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success message banner when OTP sent */}
        {step === 2 && successMsg && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--success-light)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--success)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Registered Email */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleSendOtp}>
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={submitting}
            >
              {submitting ? 'Sending OTP...' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP & Reset Password */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            {/* 6-Digit OTP */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="otp-input">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Resend OTP</span>
                </button>
              </div>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <KeyRound size={18} />
                </span>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  className="form-input has-left-icon"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  style={{ letterSpacing: '4px', fontWeight: 700, fontSize: '1.1rem' }}
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
              {submitting ? 'Verifying OTP...' : 'Verify OTP & Reset Password'}
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem',
              padding: '1rem 0',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {successMsg}
            </p>

            <button
              onClick={() => navigate('/login')}
              className="btn btn-success"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Proceed to Sign In
            </button>
          </div>
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
