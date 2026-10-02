/**
 * =========================================================================
 * Task Form Modal Component (components/TaskForm.jsx)
 * =========================================================================
 * Modal dialog form for creating new tasks and editing existing tasks.
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const TaskForm = ({ isOpen, onClose, initialTask = null }) => {
  const { createTask, updateTask, getTodayDateString } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync form state when modal opens or initialTask changes
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority || 'Medium');
      setCategory(initialTask.category || 'General');
      setDueDate(initialTask.dueDate || getTodayDateString());
      setDueTime(initialTask.dueTime || '');
    } else {
      // Reset to fresh form defaults
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('General');
      setDueDate(getTodayDateString());
      setDueTime('');
    }
    setError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      dueTime,
      targetDate: dueDate || getTodayDateString(),
    };

    try {
      let res;
      if (initialTask && initialTask._id) {
        res = await updateTask(initialTask._id, payload);
      } else {
        res = await createTask(payload);
      }

      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Failed to save task');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div className="modal-box">
        {/* Modal Header */}
        <div className="modal-header">
          <h2 id="task-form-title" className="modal-title">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            title="Close Form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-box" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Complete WAD Assignment 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-description">
              Description (Optional)
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Add additional notes, requirements, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority and Category (2 Columns) */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-category">
                Category / Tag
              </label>
              <select
                id="task-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time (2 Columns) */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-duedate">
                Due Date *
              </label>
              <input
                id="task-duedate"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-duetime">
                Due Time (Optional)
              </label>
              <input
                id="task-duetime"
                type="time"
                className="form-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
