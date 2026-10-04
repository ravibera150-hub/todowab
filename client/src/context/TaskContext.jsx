/**
 * =========================================================================
 * Task Context (context/TaskContext.jsx)
 * =========================================================================
 * State management for tasks, real-time countdown calculation, overdue alerts,
 * and Pomodoro focus integration.
 * 
 * VIVA EXPLANATION:
 * - Uses a recurring `setInterval` ticker (every 30s) to update `currentTime` state,
 *   causing live countdown timers ("2h 15m left" / "Overdue by 5m") to re-render.
 * - Encapsulates all REST API interactions (`/api/tasks/*`) with optimistic or
 *   direct UI state updates.
 * - Plays synthesized audio feedback via `soundEffects` on task completion and alerts.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { soundEffects } from '../utils/audio';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    percentage: 0,
    priorityBreakdown: { high: 0, medium: 0, low: 0 },
    totalFocusMinutes: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active task for the Pomodoro focus timer modal
  const [activePomodoroTask, setActivePomodoroTask] = useState(null);

  // Live timestamp updated every 30 seconds for accurate countdowns
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // 30 seconds ticker
    return () => clearInterval(timer);
  }, []);

  /**
   * Helper: Format Date object to YYYY-MM-DD
   */
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Fetch today's tasks and stats from server
   */
  const fetchTodayTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const todayDate = getTodayDateString();
      const [tasksRes, statsRes] = await Promise.all([
        api.get(`/tasks?date=${todayDate}`),
        api.get(`/tasks/stats?date=${todayDate}`),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load tasks on mount or when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayTasks();
    } else {
      setTasks([]);
    }
  }, [isAuthenticated, fetchTodayTasks]);

  /**
   * Create a new task
   */
  const createTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      if (res.success && res.data) {
        await fetchTodayTasks();
        return { success: true, task: res.data };
      }
      return { success: false, message: 'Failed to create task' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  /**
   * Update task details (title, description, priority, etc.)
   */
  const updateTask = async (id, updateData) => {
    try {
      const res = await api.put(`/tasks/${id}`, updateData);
      if (res.success && res.data) {
        await fetchTodayTasks();
        return { success: true, task: res.data };
      }
      return { success: false, message: 'Failed to update task' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  /**
   * Toggle task completion status
   */
  const toggleTaskComplete = async (task) => {
    const nextState = !task.isCompleted;
    try {
      if (nextState) {
        soundEffects.playTaskComplete();
      }
      const res = await api.put(`/tasks/${task._id}`, { isCompleted: nextState });
      if (res.success) {
        await fetchTodayTasks();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  /**
   * Delete a task
   */
  const deleteTask = async (id) => {
    try {
      const res = await api.delete(`/tasks/${id}`);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
        fetchTodayTasks();
        return { success: true };
      }
      return { success: false, message: 'Failed to delete task' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  /**
   * Add recorded Pomodoro focus minutes to a task
   */
  const recordPomodoroSession = async (taskId, minutesToAdd) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    const currentMins = task.pomodoroMinutes || 0;
    await updateTask(taskId, { pomodoroMinutes: currentMins + minutesToAdd });
  };

  /**
   * Calculate live timer status for a task:
   * Returns { text, isOverdue, isUrgent, diffMinutes }
   */
  const getTaskTimerStatus = (task) => {
    if (task.isCompleted) {
      return { text: 'Completed', isOverdue: false, isUrgent: false, diffMinutes: 0 };
    }

    if (!task.dueDate) {
      return { text: 'No due date', isOverdue: false, isUrgent: false, diffMinutes: 0 };
    }

    // Build target Date object
    let targetDateTimeStr = task.dueDate;
    if (task.dueTime) {
      targetDateTimeStr += `T${task.dueTime}:00`;
    } else {
      targetDateTimeStr += 'T23:59:59';
    }

    const targetDate = new Date(targetDateTimeStr);
    const diffMs = targetDate - currentTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 0) {
      const overdueMins = Math.abs(diffMinutes);
      if (overdueMins < 60) {
        return { text: `Overdue by ${overdueMins}m`, isOverdue: true, isUrgent: true, diffMinutes };
      }
      const overdueHours = Math.floor(overdueMins / 60);
      const remainingMins = overdueMins % 60;
      return {
        text: `Overdue by ${overdueHours}h ${remainingMins}m`,
        isOverdue: true,
        isUrgent: true,
        diffMinutes,
      };
    }

    if (diffMinutes === 0) {
      return { text: 'Due right now!', isOverdue: false, isUrgent: true, diffMinutes };
    }

    if (diffMinutes < 60) {
      return { text: `Due in ${diffMinutes}m`, isOverdue: false, isUrgent: true, diffMinutes };
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (hours < 24) {
      return {
        text: `${hours}h ${mins}m left`,
        isOverdue: false,
        isUrgent: hours < 3,
        diffMinutes,
      };
    }

    const days = Math.floor(hours / 24);
    return { text: `${days}d left`, isOverdue: false, isUrgent: false, diffMinutes };
  };

  // Check for overdue tasks to show banner alerts
  const overdueTasks = tasks.filter((t) => {
    if (t.isCompleted) return false;
    const status = getTaskTimerStatus(t);
    return status.isOverdue;
  });

  const value = {
    tasks,
    stats,
    loading,
    error,
    currentTime,
    overdueTasks,
    activePomodoroTask,
    setActivePomodoroTask,
    fetchTodayTasks,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    recordPomodoroSession,
    getTaskTimerStatus,
    getTodayDateString,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
