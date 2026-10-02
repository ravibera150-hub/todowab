/**
 * =========================================================================
 * Navigation Bar Component (components/Navbar.jsx)
 * =========================================================================
 * Main header navigation with responsive mobile menu, theme toggle, and auth controls.
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  LayoutDashboard,
  Clock,
  History,
  User,
  LogOut,
  Sun,
  Moon,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';

const Navbar = ({ onOpenAddTask }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { stats } = useTasks();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <NavLink to="/dashboard" className="navbar-brand" onClick={closeMobile}>
          <div className="brand-icon">
            <CheckSquare size={20} />
          </div>
          <span>TaskFlow</span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/pending"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Clock size={18} />
                <span>Pending</span>
                {stats.pending > 0 && (
                  <span className="nav-badge warning">{stats.pending}</span>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/history"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <History size={18} />
                <span>History</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Quick Add Task Button */}
          {onOpenAddTask && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenAddTask}
              title="Add New Task"
            >
              <Plus size={16} />
              <span>Add Task</span>
            </button>
          )}

          {/* Dark/Light Theme Toggle */}
          <button
            className="btn-icon"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Info & Logout Pill */}
          {user && (
            <div className="user-menu-pill" title={`Logged in as ${user.email}`}>
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn-icon"
                style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
                title="Logout"
              >
                <LogOut size={16} color="var(--danger)" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="btn-icon mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/pending"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <Clock size={18} />
            <span>Pending Tasks</span>
            {stats.pending > 0 && <span className="nav-badge warning">{stats.pending}</span>}
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <History size={18} />
            <span>Previous History</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <User size={18} />
            <span>Profile & Account</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
