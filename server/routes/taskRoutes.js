/**
 * =========================================================================
 * Task Routes (routes/taskRoutes.js)
 * =========================================================================
 * REST endpoints for managing tasks.
 * 
 * All routes in this file are protected by the 'protect' middleware,
 * requiring an 'Authorization: Bearer <token>' header.
 * 
 * Endpoints:
 * - GET    /api/tasks          -> Fetch today's tasks
 * - GET    /api/tasks/pending  -> Fetch incomplete tasks for today
 * - GET    /api/tasks/history  -> Fetch past task history (by date or summary)
 * - GET    /api/tasks/stats    -> Fetch stats, counts, and completion percentage
 * - POST   /api/tasks          -> Create a new task
 * - PUT    /api/tasks/:id      -> Update a task (edit or mark complete)
 * - DELETE /api/tasks/:id      -> Delete a task
 */

const express = require('express');
const router = express.Router();
const {
  getTodayTasks,
  getPendingTasks,
  getHistoryTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Apply JWT authentication protection to all routes defined in this router
router.use(protect);

// Specific routes (defined before parameterized routes like /:id to prevent collisions)
router.get('/pending', getPendingTasks);
router.get('/history', getHistoryTasks);
router.get('/stats', getTaskStats);

// Main collection routes
router.route('/')
  .get(getTodayTasks)
  .post(createTask);

// Individual task routes
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
