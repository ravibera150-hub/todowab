/**
 * =========================================================================
 * Task Controller (controllers/taskController.js)
 * =========================================================================
 * Handles all CRUD operations, filtering (Today, Pending, History), and
 * statistical calculations for user tasks.
 * 
 * VIVA EXPLANATION:
 * - All queries enforce userId isolation to maintain strict multi-tenant security.
 * - Date comparison uses 'YYYY-MM-DD' formatted strings, eliminating timezone
 *   discrepancies between browser clients and server nodes.
 * - History view aggregates past records with completion statistics.
 */

const db = require('../data/dbAdapter');

/**
 * Helper function to format Date object into YYYY-MM-DD string
 * @param {Date} [dateObj=new Date()]
 * @returns {string} e.g. "2026-08-11"
 */
const getFormattedDate = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * @desc    Get all tasks scheduled for TODAY for the logged-in user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTodayTasks = async (req, res) => {
  try {
    const today = req.query.date || getFormattedDate();

    // Query tasks belonging to this user where targetDate or dueDate matches today
    const tasks = await db.findTasks({
      userId: req.user._id,
      $or: [{ targetDate: today }, { dueDate: today }],
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      date: today,
      data: tasks,
    });
  } catch (error) {
    console.error('Get Today Tasks Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve today tasks',
      error: error.message,
    });
  }
};

/**
 * @desc    Get only INCOMPLETE / PENDING tasks for today
 * @route   GET /api/tasks/pending
 * @access  Private
 */
const getPendingTasks = async (req, res) => {
  try {
    const today = req.query.date || getFormattedDate();

    const pendingTasks = await db.findTasks({
      userId: req.user._id,
      $or: [{ targetDate: today }, { dueDate: today }],
      isCompleted: false,
    });

    return res.status(200).json({
      success: true,
      count: pendingTasks.length,
      date: today,
      data: pendingTasks,
    });
  } catch (error) {
    console.error('Get Pending Tasks Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending tasks',
      error: error.message,
    });
  }
};

/**
 * @desc    Get task history by specific date OR list of available past dates
 * @route   GET /api/tasks/history?date=YYYY-MM-DD
 * @access  Private
 */
const getHistoryTasks = async (req, res) => {
  try {
    const today = req.query.today || req.query.currentDate || getFormattedDate();
    const requestedDate = req.query.date;

    // Case 1: Specific date requested (e.g. /api/tasks/history?date=2026-08-10)
    if (requestedDate) {
      const tasks = await db.findTasks({
        userId: req.user._id,
        $or: [{ targetDate: requestedDate }, { dueDate: requestedDate }],
      });

      const total = tasks.length;
      const completedCount = tasks.filter((t) => t.isCompleted).length;
      const incompleteCount = total - completedCount;
      const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return res.status(200).json({
        success: true,
        date: requestedDate,
        summary: {
          total,
          completed: completedCount,
          incomplete: incompleteCount,
          completionRate,
        },
        data: tasks,
      });
    }

    // Case 2: No specific date — return aggregated list of past dates with metrics
    const allUserTasks = await db.findTasks({
      userId: req.user._id,
      $or: [{ targetDate: { $lt: today } }, { dueDate: { $lt: today } }],
    });

    // Group tasks by targetDate or dueDate
    const dateGroups = {};
    allUserTasks.forEach((task) => {
      const d = task.targetDate || task.dueDate;
      if (!d || d >= today) return;
      if (!dateGroups[d]) {
        dateGroups[d] = {
          date: d,
          total: 0,
          completed: 0,
          incomplete: 0,
          tasks: [],
        };
      }
      dateGroups[d].total += 1;
      if (task.isCompleted) {
        dateGroups[d].completed += 1;
      } else {
        dateGroups[d].incomplete += 1;
      }
      dateGroups[d].tasks.push(task);
    });

    const pastDays = Object.values(dateGroups)
      .map((group) => ({
        date: group.date,
        total: group.total,
        completed: group.completed,
        incomplete: group.incomplete,
        completionRate: Math.round((group.completed / group.total) * 100),
        tasks: group.tasks,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return res.status(200).json({
      success: true,
      count: pastDays.length,
      data: pastDays,
    });
  } catch (error) {
    console.error('Get History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve task history',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, dueTime, targetDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    const today = req.query.date || getFormattedDate();
    const resolvedDueDate = dueDate || today;
    const resolvedTargetDate = targetDate || dueDate || today;

    const newTask = await db.createTask({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      category: category || 'General',
      dueDate: resolvedDueDate,
      dueTime: dueTime || '',
      targetDate: resolvedTargetDate,
      isCompleted: false,
      completedAt: null,
      pomodoroMinutes: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message,
    });
  }
};

/**
 * @desc    Update an existing task (edit fields, mark complete, add pomodoro time)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, category, dueDate, dueTime, isCompleted, pomodoroMinutes } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (dueTime !== undefined) updates.dueTime = dueTime;
    if (pomodoroMinutes !== undefined) updates.pomodoroMinutes = pomodoroMinutes;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;

    const updatedTask = await db.updateTask(id, req.user._id, updates);

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to modify it',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db.deleteTask(id, req.user._id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already deleted',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      id: id,
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};

/**
 * @desc    Get dashboard metrics & summary statistics for the user
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res) => {
  try {
    const today = req.query.date || getFormattedDate();

    // Query today's tasks
    const todayTasks = await db.findTasks({
      userId: req.user._id,
      $or: [{ targetDate: today }, { dueDate: today }],
    });

    const totalToday = todayTasks.length;
    const completedToday = todayTasks.filter((t) => t.isCompleted).length;
    const pendingToday = totalToday - completedToday;
    const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

    // Calculate priority distribution
    const highPriority = todayTasks.filter((t) => t.priority === 'High' && !t.isCompleted).length;
    const mediumPriority = todayTasks.filter((t) => t.priority === 'Medium' && !t.isCompleted).length;
    const lowPriority = todayTasks.filter((t) => t.priority === 'Low' && !t.isCompleted).length;

    // Total focus minutes
    const totalFocusMinutes = todayTasks.reduce((acc, t) => acc + (t.pomodoroMinutes || 0), 0);

    return res.status(200).json({
      success: true,
      date: today,
      stats: {
        total: totalToday,
        completed: completedToday,
        pending: pendingToday,
        percentage: completionPercentage,
        priorityBreakdown: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
        totalFocusMinutes,
      },
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve task statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getTodayTasks,
  getPendingTasks,
  getHistoryTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};
