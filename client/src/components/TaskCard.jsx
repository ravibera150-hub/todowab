/**
 * =========================================================================
 * Task Card Component (components/TaskCard.jsx)
 * =========================================================================
 * Displays an individual task with live countdown timer, status toggling,
 * Pomodoro focus launcher, and editing/deleting controls.
 */

import React from 'react';
import {
  Check,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Play,
  Flame,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const TaskCard = ({
  task,
  onEdit,
  isReadOnly = false,
}) => {
  const { toggleTaskComplete, deleteTask, getTaskTimerStatus, setActivePomodoroTask } = useTasks();

  const timerStatus = getTaskTimerStatus(task);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task._id);
    }
  };

  const handleStartPomodoro = () => {
    setActivePomodoroTask(task);
  };

  return (
    <article
      className={`task-card priority-${task.priority} ${task.isCompleted ? 'is-completed' : ''}`}
      aria-label={`Task: ${task.title}`}
    >
      {/* Interactive Completion Checkbox */}
      {!isReadOnly && (
        <div className="task-checkbox-wrapper">
          <button
            type="button"
            className={`custom-checkbox ${task.isCompleted ? 'checked' : ''}`}
            onClick={() => toggleTaskComplete(task)}
            title={task.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
            aria-label="Toggle Complete"
          >
            {task.isCompleted && <Check size={16} strokeWidth={3} />}
          </button>
        </div>
      )}

      {/* Task Content Body */}
      <div className="task-content">
        <h3 className={`task-title ${task.isCompleted ? 'completed' : ''}`}>
          {task.title}
        </h3>

        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        {/* Metadata Badges & Timers */}
        <div className="task-meta-bar">
          {/* Priority Badge */}
          <span className={`badge badge-${task.priority.toLowerCase()}`}>
            {task.priority} Priority
          </span>

          {/* Category Tag */}
          <span className="badge badge-category">
            <Tag size={12} />
            {task.category}
          </span>

          {/* Due Date & Time Info */}
          <div className="task-due-info">
            <Calendar size={13} />
            <span>{task.dueDate}</span>
            {task.dueTime && (
              <>
                <Clock size={13} style={{ marginLeft: '4px' }} />
                <span>{task.dueTime}</span>
              </>
            )}
          </div>

          {/* Live Countdown / Overdue Ticker */}
          {!task.isCompleted && task.dueDate && (
            <div
              className={`countdown-ticker ${
                timerStatus.isOverdue
                  ? 'overdue'
                  : timerStatus.isUrgent
                  ? 'urgent'
                  : ''
              }`}
            >
              {timerStatus.isOverdue ? (
                <AlertTriangle size={13} />
              ) : (
                <Clock size={13} />
              )}
              <span>{timerStatus.text}</span>
            </div>
          )}

          {/* Focus Session Time Logged */}
          {task.pomodoroMinutes > 0 && (
            <div
              className="badge"
              style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
              title="Total Pomodoro focus time on this task"
            >
              <Flame size={12} />
              <span>{task.pomodoroMinutes}m focused</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="task-actions">
          {/* Start Focus Timer Button */}
          {!task.isCompleted && (
            <button
              className="action-btn btn-focus"
              onClick={handleStartPomodoro}
              title="Start Pomodoro Focus Timer"
              aria-label="Start Pomodoro Timer"
            >
              <Play size={15} />
            </button>
          )}

          {/* Edit Button */}
          {onEdit && (
            <button
              className="action-btn"
              onClick={() => onEdit(task)}
              title="Edit Task"
              aria-label="Edit Task"
            >
              <Edit2 size={15} />
            </button>
          )}

          {/* Delete Button */}
          <button
            className="action-btn btn-delete"
            onClick={handleDelete}
            title="Delete Task"
            aria-label="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </article>
  );
};

export default TaskCard;
