/**
 * =========================================================================
 * Notification Banner Component (components/NotificationBanner.jsx)
 * =========================================================================
 * Displays urgent visual alerts when tasks are overdue or pending attention.
 */

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const NotificationBanner = () => {
  const { overdueTasks } = useTasks();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || overdueTasks.length === 0) {
    return null;
  }

  return (
    <aside
      className="alert-banner alert-danger"
      role="alert"
      aria-label="Overdue Task Notification"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertTriangle size={20} />
        <span>
          <strong>Attention Needed:</strong> You have{' '}
          <strong>{overdueTasks.length}</strong> overdue task
          {overdueTasks.length > 1 ? 's' : ''} scheduled for today!
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="btn-icon"
        style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'inherit' }}
        title="Dismiss Alert"
      >
        <X size={16} />
      </button>
    </aside>
  );
};

export default NotificationBanner;
