/**
 * =========================================================================
 * Dashboard Page Component (pages/DashboardPage.jsx)
 * =========================================================================
 * Main home view displaying today's tasks, stats progress, search/filters,
 * task creation modal, and focus timer.
 */

import React, { useState, useMemo } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import Navbar from '../components/Navbar';
import StatsWidget from '../components/StatsWidget';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import PomodoroModal from '../components/PomodoroModal';
import NotificationBanner from '../components/NotificationBanner';

const DashboardPage = () => {
  const { user } = useAuth();
  const { tasks, loading } = useTasks();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Format today's date nicely for header
  const todayFormatted = useMemo(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  }, []);

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search query filter
        const matchSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category filter
        const matchCategory =
          selectedCategory === 'All' || task.category === selectedCategory;

        // Priority filter
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
        // Default: incomplete first, then newer first
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
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
      {/* Top Navbar */}
      <Navbar onOpenAddTask={handleOpenCreate} />

      <main className="main-content">
        {/* Overdue Notification Banner */}
        <NotificationBanner />

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1>Hello, {user?.name || 'Friend'} 👋</h1>
            <div className="dashboard-date-sub">
              <Calendar size={16} />
              <span>{todayFormatted}</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Real-time Stats & Completion Progress */}
        <StatsWidget />

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

        {/* Today's Tasks Section */}
        <section aria-label="Today's Task List">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Today's Tasks ({filteredTasks.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading tasks...
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEditTask={handleOpenEdit}
              onOpenAddTask={handleOpenCreate}
              emptyMessage="You have no tasks scheduled for today. Add one above to get started!"
            />
          )}
        </section>
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseForm}
        initialTask={editingTask}
      />

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroModal />

      {/* Footer */}
      <footer className="app-footer">
        TaskFlow — WAD Academic Full-Stack To-Do List Application
      </footer>
    </div>
  );
};

export default DashboardPage;
