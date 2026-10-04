/**
 * =========================================================================
 * Main Express Application Server (server.js)
 * =========================================================================
 * The entry point of our Node.js backend.
 * 
 * VIVA EXPLANATION:
 * 1. Express is a minimalist web framework for Node.js.
 * 2. 'cors' enables Cross-Origin Resource Sharing so our React frontend
 *    (running on port 5173 or 3000) can make API requests to this server.
 * 3. 'express.json()' is built-in middleware to parse JSON request bodies.
 * 4. We connect to MongoDB before mounting routes and starting the HTTP listener.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Initialize MongoDB connection
connectDB();

// Create Express application instance
const app = express();

// ==========================================
// Middleware Setup
// ==========================================

// CORS Setup - Allows frontend domain or development localhost
// CORS Setup - Allows frontend domain or development localhost
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*') return callback(null, true);
      const allowed = [
        process.env.CLIENT_URL.replace(/\/$/, ''),
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000',
      ];
      if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Built-in JSON body parser middleware
app.use(express.json());

// Simple logging middleware to print API requests in the terminal
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==========================================
// Route Mounts
// ==========================================

// Health check endpoint
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'WAD To-Do List Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);


// Mount authentication routes
app.use('/api/auth', require('./routes/authRoutes'));

// Mount task management routes
app.use('/api/tasks', require('./routes/taskRoutes'));

// 404 Not Found Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ==========================================
// Start Server
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 REST API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Task endpoints: http://localhost:${PORT}/api/tasks`);
  console.log('====================================================');
});
