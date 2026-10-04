/**
 * Vercel Serverless Function Entry Point for Express Backend
 * Enables hosting the Express API alongside React Frontend on Vercel.
 */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('../server/config/db');

dotenv.config();

// Connect DB
connectDB().catch((err) => console.error('MongoDB Serverless Connection Error:', err));

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL.replace(/\/$/, ''), 'http://localhost:5173', 'http://localhost:3000']
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'WAD To-Do List Backend API is running smoothly on Vercel',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/tasks', require('../server/routes/taskRoutes'));

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
