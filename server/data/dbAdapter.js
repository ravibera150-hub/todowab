/**
 * =========================================================================
 * Database Storage Adapter (data/dbAdapter.js)
 * =========================================================================
 * Provides a unified data access layer that transparently routes queries to
 * MongoDB (via Mongoose) when connected, or to a local JSON file database fallback.
 * 
 * VIVA EXPLANATION:
 * - Implements the Repository Pattern to decouple business logic from the
 *   underlying database engine.
 * - If MongoDB is running -> writes to MongoDB collections with Mongoose.
 * - If MongoDB is offline -> reads & writes to `server/data/store.json` using
 *   the exact same schema fields, IDs, and timestamps.
 */

const fs = require('fs');
const crypto = require('crypto');
const User = require('../models/User');
const Task = require('../models/Task');
const { getDBStatus, storeFilePath } = require('../config/db');

// Helper to read local JSON store
const readStore = () => {
  try {
    const raw = fs.readFileSync(storeFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], tasks: [] };
  }
};

// Helper to write local JSON store
const writeStore = (data) => {
  fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

const dbAdapter = {
  // ==========================================
  // USER METHODS
  // ==========================================

  async findUserByEmail(email) {
    const { isMongoConnected } = getDBStatus();
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      return await User.findOne({ email: cleanEmail });
    }

    const store = readStore();
    return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    const { isMongoConnected } = getDBStatus();
    if (isMongoConnected) {
      return await User.findById(id).select('-password');
    }

    const store = readStore();
    const user = store.users.find((u) => String(u._id) === String(id));
    if (!user) return null;
    const userCopy = { ...user };
    delete userCopy.password;
    return userCopy;
  },

  async createUser({ name, email, password }) {
    const { isMongoConnected } = getDBStatus();
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected) {
      return await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
      });
    }

    const store = readStore();
    const newUser = {
      _id: crypto.randomBytes(12).toString('hex'), // Generates 24-char hex string matching ObjectId format
      name: name.trim(),
      email: cleanEmail,
      password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    writeStore(store);
    return newUser;
  },

  // ==========================================
  // TASK METHODS
  // ==========================================

  async findTasks(query = {}) {
    const { isMongoConnected } = getDBStatus();

    if (isMongoConnected) {
      return await Task.find(query).sort({ isCompleted: 1, createdAt: -1 });
    }

    const store = readStore();
    let result = [...store.tasks];

    // Filter by userId
    if (query.userId) {
      result = result.filter((t) => String(t.userId) === String(query.userId));
    }

    // Filter by targetDate / dueDate
    if (query.$or) {
      result = result.filter((t) =>
        query.$or.some((clause) => {
          if (clause.targetDate && t.targetDate === clause.targetDate) return true;
          if (clause.dueDate && t.dueDate === clause.dueDate) return true;
          return false;
        })
      );
    } else if (query.targetDate) {
      if (typeof query.targetDate === 'object' && query.targetDate.$lt) {
        result = result.filter((t) => t.targetDate < query.targetDate.$lt);
      } else {
        result = result.filter((t) => t.targetDate === query.targetDate);
      }
    }

    // Filter by isCompleted
    if (query.isCompleted !== undefined) {
      result = result.filter((t) => t.isCompleted === query.isCompleted);
    }

    // Sort: incomplete first, then newer
    result.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  },

  async findTaskById(id, userId) {
    const { isMongoConnected } = getDBStatus();
    if (isMongoConnected) {
      return await Task.findOne({ _id: id, userId });
    }

    const store = readStore();
    return (
      store.tasks.find(
        (t) => String(t._id) === String(id) && String(t.userId) === String(userId)
      ) || null
    );
  },

  async createTask(taskData) {
    const { isMongoConnected } = getDBStatus();
    if (isMongoConnected) {
      return await Task.create(taskData);
    }

    const store = readStore();
    const newTask = {
      _id: crypto.randomBytes(12).toString('hex'),
      ...taskData,
      isCompleted: Boolean(taskData.isCompleted) || false,
      completedAt: taskData.completedAt || null,
      pomodoroMinutes: taskData.pomodoroMinutes || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.tasks.push(newTask);
    writeStore(store);
    return newTask;
  },

  async updateTask(id, userId, updates) {
    const { isMongoConnected } = getDBStatus();
    if (isMongoConnected) {
      let task = await Task.findOne({ _id: id, userId });
      if (!task) return null;

      Object.assign(task, updates);
      if (updates.isCompleted !== undefined) {
        task.isCompleted = Boolean(updates.isCompleted);
        task.completedAt = updates.isCompleted ? new Date() : null;
      }
      return await task.save();
    }

    const store = readStore();
    const index = store.tasks.findIndex(
      (t) => String(t._id) === String(id) && String(t.userId) === String(userId)
    );
    if (index === -1) return null;

    const task = store.tasks[index];
    const updated = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.isCompleted !== undefined) {
      updated.isCompleted = Boolean(updates.isCompleted);
      updated.completedAt = updates.isCompleted ? new Date().toISOString() : null;
    }

    store.tasks[index] = updated;
    writeStore(store);
    return updated;
  },

  async deleteTask(id, userId) {
    const { isMongoConnected } = getDBStatus();
    if (isMongoConnected) {
      return await Task.findOneAndDelete({ _id: id, userId });
    }

    const store = readStore();
    const index = store.tasks.findIndex(
      (t) => String(t._id) === String(id) && String(t.userId) === String(userId)
    );
    if (index === -1) return null;

    const [deleted] = store.tasks.splice(index, 1);
    writeStore(store);
    return deleted;
  },
};

module.exports = dbAdapter;
