/**
 * =========================================================================
 * Pending Tasks Page Component (pages/PendingPage.jsx)
 * =========================================================================
 * Dedicated view displaying strictly unfinished / pending tasks for today.
 */

import React, { useState, useMemo } from 'react';
import { Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import PomodoroModal from '../components/PomodoroModal';
import NotificationBanner from '../components/NotificationBanner';
import MobileBottomNav from '../components/MobileBottomNav';

const PendingPage = () => {
  const { tasks, loading, stats } = useTasks();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Filter only incomplete tasks for today
  const pendingTasks = useMemo(() => {
    return tasks
      .filter((task) => !task.isCompleted)
      .filter((task) => {
        const matchSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchCategory =
          selectedCategory === 'All' || task.category === selectedCategory;
        const matchPriority =
          selectedPriority === 'All' || task.priority === selectedPriority;
        return matchSearch && matchCategory && matchPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'dueTime') {
          return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99');
        }
        if (sortBy === 'priority') {
          const priorityWeights = { High: 3, Medium: 2, Low: 1 };
          return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, sortBy]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="app-container">
      <Navbar onOpenAddTask={handleOpenCreate} />

      <main className="main-content">
        <NotificationBanner />

        {/* Page Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Clock size={28} color="var(--warning)" />
              <span>Pending Tasks ({pendingTasks.length})</span>
            </h1>
            <p className="dashboard-date-sub">
              Focus on what's left to accomplish today.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Quick Summary Pill */}
        {stats.total > 0 && (
          <aside
            className={`alert-banner ${stats.pending > 0 ? 'alert-warning' : 'alert-info'}`}
            role="status"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {stats.pending > 0 ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span>
                {stats.pending > 0
                  ? `You have ${stats.pending} remaining task${stats.pending > 1 ? 's' : ''} to complete today (${stats.completed} already finished).`
                  : 'Awesome job! You have zero pending tasks for today! 🎉'}
              </span>
            </div>
          </aside>
        )}

        {/* Filter and Search Bar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Pending Task List */}
        <section aria-label="Pending Task List">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading pending tasks...
            </div>
          ) : (
            <TaskList
              tasks={pendingTasks}
              onEditTask={handleOpenEdit}
              onOpenAddTask={handleOpenCreate}
              emptyMessage="No pending tasks found! You're completely caught up for today."
            />
          )}
        </section>
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseForm}
        initialTask={editingTask}
      />

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroModal />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenAddTask={handleOpenCreate} />

      <footer className="app-footer">
        TaskFlow — WAD Academic Full-Stack To-Do List Application
      </footer>
    </div>
  );
};

export default PendingPage;
