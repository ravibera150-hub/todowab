/**
 * =========================================================================
 * Mobile Bottom Navigation Bar (components/MobileBottomNav.jsx)
 * =========================================================================
 * Sleek bottom navigation bar rendered exclusively on mobile devices (<768px).
 * Features quick tab switching and a prominent center '+' add task button.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, History, User, Plus } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const MobileBottomNav = ({ onOpenAddTask }) => {
  const { stats } = useTasks();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/pending"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Clock size={20} />
          {stats.pending > 0 && (
            <span className="bottom-nav-badge">{stats.pending}</span>
          )}
        </div>
        <span>Pending</span>
      </NavLink>

      {/* Floating Center Action Button */}
      <button
        type="button"
        className="bottom-nav-add-btn"
        onClick={onOpenAddTask}
        title="Add Task"
        aria-label="Add Task"
      >
        <Plus size={22} color="#ffffff" />
      </button>

      <NavLink
        to="/history"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <History size={20} />
        <span>History</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
