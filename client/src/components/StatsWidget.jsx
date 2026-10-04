/**
 * =========================================================================
 * Stats Widget Component (components/StatsWidget.jsx)
 * =========================================================================
 * Displays real-time task metrics, completion percentage, and focus time.
 */

import React from 'react';
import { CheckCircle2, ListTodo, AlertCircle, Flame, Clock } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const StatsWidget = () => {
  const { stats, overdueTasks } = useTasks();

  return (
    <section aria-label="Task Statistics">
      {/* 4-Column Metric Cards */}
      <div className="stats-grid">
        {/* Total Tasks */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">
            <ListTodo size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Today</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-warning">
            <Clock size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        {/* Dedicated Focus Time Stat */}
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">
            <Flame size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {stats.totalFocusMinutes || 0} minutes
            </span>
            <span className="stat-label">Focus Time</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Widget */}
      <div className="progress-card">
        <div className="progress-header">
          <div className="progress-title">Daily Completion Rate</div>
          <div className="progress-percentage">{stats.percentage}%</div>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsWidget;
