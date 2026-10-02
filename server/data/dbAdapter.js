/**
 * =========================================================================
 * Database Storage Adapter (data/dbAdapter.js)
 * =========================================================================
 * Provides a unified data access layer that routes queries to MongoDB
 * via Mongoose models.
 */

const User = require('../models/User');
const Task = require('../models/Task');

const dbAdapter = {
  // ==========================================
  // USER METHODS
  // ==========================================

  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    return await User.findOne({ email: cleanEmail });
  },

  async findUserById(id) {
    return await User.findById(id).select('-password');
  },

  async createUser({ name, email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    return await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
    });
  },

  // ==========================================
  // TASK METHODS
  // ==========================================

  async findTasks(query = {}) {
    return await Task.find(query).sort({ isCompleted: 1, createdAt: -1 });
  },

  async findTaskById(id, userId) {
    return await Task.findOne({ _id: id, userId });
  },

  async createTask(taskData) {
    return await Task.create(taskData);
  },

  async updateTask(id, userId, updates) {
    let task = await Task.findOne({ _id: id, userId });
    if (!task) return null;

    Object.assign(task, updates);
    if (updates.isCompleted !== undefined) {
      task.isCompleted = Boolean(updates.isCompleted);
      task.completedAt = updates.isCompleted ? new Date() : null;
    }
    return await task.save();
  },

  async deleteTask(id, userId) {
    return await Task.findOneAndDelete({ _id: id, userId });
  },
};

module.exports = dbAdapter;

