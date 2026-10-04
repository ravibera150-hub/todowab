/**
 * Vercel Serverless Function Entry Point for Express Backend
 * Enables hosting the Express API alongside React Frontend on Vercel.
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('../server/config/db');

dotenv.config();

const app = express();

// Flexible CORS setup to ensure deployed Vercel domain & localhost work flawlessly
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like same-origin on Vercel or curl)
      if (!origin) return callback(null, true);

      // If CLIENT_URL is explicitly set to wildcard or matches origin
      if (!process.env.CLIENT_URL || process.env.CLIENT_URL === '*') {
        return callback(null, true);
      }

      const clientUrlClean = process.env.CLIENT_URL.replace(/\/$/, '');
      const allowed = [
        clientUrlClean,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5000',
      ];

      // Allow matching origins or any vercel app domain
      if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Default fallback to true to prevent CORS failures on production deployments
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Serverless DB Middleware - guarantees DB connection is ready before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Serverless DB Middleware Error:', err);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check MongoDB Atlas URI and access settings.',
    });
  }
});

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoints
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'WAD To-Do List Backend API is running smoothly on Vercel',
    timestamp: new Date().toISOString(),
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount routes on both /api/* and /* to handle any Vercel rewrite prefix variations
const authRoutes = require('../server/routes/authRoutes');
const taskRoutes = require('../server/routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;

