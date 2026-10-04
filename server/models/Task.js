/**
 * =========================================================================
 * Task Model (models/Task.js)
 * =========================================================================
 * Defines the MongoDB schema for a To-Do Task.
 * 
 * VIVA EXPLANATION:
 * - userId uses mongoose.Schema.Types.ObjectId to establish a reference (foreign key)
 *   to the 'User' model. This links every task to its creator.
 * - priority and category use 'enum' validation to restrict accepted values.
 * - targetDate stores 'YYYY-MM-DD' representing the day the task is scheduled for.
 *   Storing formatted date strings simplifies date-by-date history grouping and queries.
 * - isCompleted and completedAt track completion status and exact timestamp.
 * - pomodoroMinutes tracks accumulated focus session time for the task.
 */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true, // Speeds up queries searching by user
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be either Low, Medium, or High',
      },
      default: 'Medium',
    },
    category: {
      type: String,
      enum: {
        values: ['Work', 'Study', 'Personal', 'Health', 'Urgent', 'General'],
        message: 'Category must be Work, Study, Personal, Health, Urgent, or General',
      },
      default: 'General',
    },
    dueDate: {
      type: String, // Format: 'YYYY-MM-DD'
      required: [true, 'Please provide a due date (YYYY-MM-DD)'],
    },
    dueTime: {
      type: String, // Format: 'HH:mm' (24-hour) e.g., '14:30'
      default: '',
    },
    targetDate: {
      type: String, // Format: 'YYYY-MM-DD' representing the day this task is for
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    pomodoroMinutes: {
      type: Number,
      default: 0,
      min: [0, 'Pomodoro minutes cannot be negative'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound index for fast queries when filtering user's tasks by targetDate
taskSchema.index({ userId: 1, targetDate: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

module.exports = Task;

