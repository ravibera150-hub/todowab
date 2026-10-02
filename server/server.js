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

// Enable CORS for all incoming origins (allows React client to communicate with backend)
app.use(
  cors({
    origin: '*', // For development, allow all origins. Can be locked to client URL in prod
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
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'WAD To-Do List Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

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
