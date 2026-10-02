/**
 * =========================================================================
 * Task List Component (components/TaskList.jsx)
 * =========================================================================
 * Container rendering a list of TaskCards or a styled empty state.
 */

import React from 'react';
import { CheckCircle2, Plus, Sparkles } from 'lucide-react';
import TaskCard from './TaskCard';

const TaskList = ({
  tasks = [],
  onEditTask,
  onOpenAddTask,
  isReadOnly = false,
  emptyMessage = "No tasks found for today.",
}) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-icon">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="empty-title">All Caught Up!</h3>
        <p className="empty-subtitle">{emptyMessage}</p>
        {!isReadOnly && onOpenAddTask && (
          <button className="btn btn-primary btn-sm" onClick={onOpenAddTask}>
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEditTask}
          isReadOnly={isReadOnly}
        />
      ))}
    </div>
  );
};

export default TaskList;
