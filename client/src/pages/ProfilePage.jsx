/**
 * =========================================================================
 * Profile Page Component (pages/ProfilePage.jsx)
 * =========================================================================
 * Displays user profile info, account details, theme preferences, and logout.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Moon,
  Sun,
  Shield,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { stats } = useTasks();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content" style={{ maxWidth: '720px' }}>
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <User size={28} color="var(--primary)" />
              <span>User Profile</span>
            </h1>
            <p className="dashboard-date-sub">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Card */}
        <div
          className="stat-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            className="user-avatar"
            style={{ width: '80px', height: '80px', fontSize: '2rem' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <Mail size={15} />
              <span>{user?.email}</span>
            </p>
          </div>

          <div
            className="badge badge-category"
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginTop: '0.25rem' }}
          >
            <Calendar size={14} />
            <span>Member since: {formattedDate}</span>
          </div>
        </div>

        {/* Preferences & Actions Section */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>App Preferences</h3>

          {/* Theme Switch Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {isDark ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--warning)" />}
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Appearance Theme</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Currently in {isDark ? 'Dark' : 'Light'} mode
                </p>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
              Switch to {isDark ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          {/* Academic Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Shield size={20} color="var(--success)" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>WAD Academic Project</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                React.js • Node.js • Express • MongoDB • JWT Auth • Custom CSS
              </p>
            </div>
          </div>

          {/* Logout Action */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              className="btn btn-danger"
              style={{ width: '100%', padding: '0.85rem' }}
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Log Out of Account</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        TaskFlow — WAD Academic Full-Stack To-Do List Application
      </footer>
    </div>
  );
};

export default ProfilePage;
