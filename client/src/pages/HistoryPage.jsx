/**
 * =========================================================================
 * History Page Component (pages/HistoryPage.jsx)
 * =========================================================================
 * Historical record browser allowing users to inspect past days' tasks,
 * completion rates, and read-only task cards.
 * 
 * VIVA EXPLANATION:
 * - Queries GET /api/tasks/history?date=YYYY-MM-DD for a targeted day, or
 *   retrieves the aggregate past history summary list.
 * - Displays completed vs. missed tasks with a read-only badge to prevent
 *   accidental mutations of historical data.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  History,
  CheckCircle2,
  XCircle,
  BarChart3,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import TaskList from '../components/TaskList';
import MobileBottomNav from '../components/MobileBottomNav';

const HistoryPage = () => {
  // Helper to calculate today's date in YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to calculate yesterday's date in YYYY-MM-DD
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getYesterdayString());
  const [pastDaysList, setPastDaysList] = useState([]);
  const [dayTasks, setDayTasks] = useState([]);
  const [daySummary, setDaySummary] = useState({
    total: 0,
    completed: 0,
    incomplete: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(false);

  // Fetch summary list of available past dates
  useEffect(() => {
    const fetchPastDays = async () => {
      try {
        const todayStr = getTodayString();
        const res = await api.get(`/tasks/history?today=${todayStr}`);
        if (res.success && res.data) {
          setPastDaysList(res.data);
          // Select the most recent past day if recorded
          if (res.data.length > 0) {
            setSelectedDate(res.data[0].date);
          }
        }
      } catch (err) {
        console.error('Failed to fetch past history summary:', err);
      }
    };

    fetchPastDays();
  }, []);

  // Fetch tasks for the selected date
  const fetchDateHistory = useCallback(async (dateStr) => {
    if (!dateStr) return;
    setLoading(true);
    try {
      const res = await api.get(`/tasks/history?date=${dateStr}`);
      if (res.success) {
        setDayTasks(res.data || []);
        setDaySummary(
          res.summary || {
            total: 0,
            completed: 0,
            incomplete: 0,
            completionRate: 0,
          }
        );
      }
    } catch (err) {
      console.error('Failed to fetch history for date:', err);
      setDayTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDateHistory(selectedDate);
  }, [selectedDate, fetchDateHistory]);

  const completedTasks = dayTasks.filter((t) => t.isCompleted);
  const incompleteTasks = dayTasks.filter((t) => !t.isCompleted);

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {/* Page Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <History size={28} color="var(--primary)" />
              <span>Previous Days History</span>
            </h1>
            <p className="dashboard-date-sub">
              Review past performance, completed goals, and missed items.
            </p>
          </div>
        </div>

        {/* Two-Column History Layout */}
        <div className="history-layout">
          {/* Left Sidebar: Date Picker & Past Dates List */}
          <aside className="history-sidebar">
            <div className="history-picker-card">
              <h2 className="history-picker-title">
                <Calendar size={18} color="var(--primary)" />
                <span>Select Past Date</span>
              </h2>

              {/* Date Input */}
              <div className="date-input-wrapper">
                <input
                  type="date"
                  className="date-picker-input"
                  value={selectedDate}
                  max={getTodayString()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {/* Past Dates Quick Selection List */}
              <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Recorded Days with Tasks:
              </div>

              <div className="past-days-list">
                {pastDaysList.length === 0 ? (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    No prior days recorded yet. Completed tasks from yesterday and earlier will appear here.
                  </p>
                ) : (
                  pastDaysList.map((item) => (
                    <div
                      key={item.date}
                      className={`past-day-item ${item.date === selectedDate ? 'active' : ''}`}
                      onClick={() => setSelectedDate(item.date)}
                    >
                      <div className="past-day-info">
                        <span className="past-day-date">{item.date}</span>
                        <span className="past-day-sub">
                          {item.completed}/{item.total} done ({item.completionRate}%)
                        </span>
                      </div>
                      <span className="badge badge-category" style={{ fontSize: '0.7rem' }}>
                        {item.completionRate}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Right Main Panel: Selected Day's Tasks & Breakdown */}
          <section className="history-main-panel" aria-label="Historical Tasks Details">
            {/* Day Summary Card */}
            <div className="history-summary-header">
              <div className="history-date-heading">
                <h2>{selectedDate}</h2>
                <span className="history-readonly-badge">
                  <ShieldCheck size={14} />
                  <span>Read-Only Historical Record</span>
                </span>
              </div>

              {/* Metrics */}
              <div className="history-metrics-row">
                <div className="history-metric-box">
                  <span className="history-metric-val">{daySummary.total}</span>
                  <span className="history-metric-lbl">Total Tasks</span>
                </div>
                <div className="history-metric-box">
                  <span className="history-metric-val" style={{ color: 'var(--success)' }}>
                    {daySummary.completed}
                  </span>
                  <span className="history-metric-lbl">Completed</span>
                </div>
                <div className="history-metric-box">
                  <span className="history-metric-val" style={{ color: 'var(--danger)' }}>
                    {daySummary.incomplete}
                  </span>
                  <span className="history-metric-lbl">Missed</span>
                </div>
                <div className="history-metric-box">
                  <span className="history-metric-val" style={{ color: 'var(--primary)' }}>
                    {daySummary.completionRate}%
                  </span>
                  <span className="history-metric-lbl">Success Rate</span>
                </div>
              </div>
            </div>

            {/* Task Lists for that Day */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Loading day record...
              </div>
            ) : dayTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Calendar size={32} />
                </div>
                <h3 className="empty-title">No Records Found</h3>
                <p className="empty-subtitle">
                  There were no tasks recorded for <strong>{selectedDate}</strong>.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Completed Tasks on that day */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="history-section-title completed">
                      <CheckCircle2 size={20} />
                      <span>Completed Tasks ({completedTasks.length})</span>
                    </h3>
                    <TaskList tasks={completedTasks} isReadOnly={true} />
                  </div>
                )}

                {/* Incomplete / Missed Tasks on that day */}
                {incompleteTasks.length > 0 && (
                  <div>
                    <h3 className="history-section-title incomplete">
                      <XCircle size={20} />
                      <span>Incomplete / Missed Tasks ({incompleteTasks.length})</span>
                    </h3>
                    <TaskList tasks={incompleteTasks} isReadOnly={true} />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      <footer className="app-footer">
        TaskFlow — WAD Academic Full-Stack To-Do List Application
      </footer>
    </div>
  );
};

export default HistoryPage;
