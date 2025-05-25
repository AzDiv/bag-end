// filepath: back-end/index.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const apiRoutes = require('./routes/api');
const morgan = require('morgan');
const winston = require('winston');
const cors = require('cors');

const app = express();
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Setup morgan for HTTP request logging
app.use(morgan('combined'));

// Setup winston for error logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// CORS middleware
app.use(cors({
  origin: 'http://localhost:5173', // Adjust to your frontend URL
  credentials: true
}));

app.get('/', (_req, res) => {
  res.send('API is running');
});

// Example: test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ success: true, rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api', apiRoutes);

// Public auth routes (no authentication middleware)
const authController = require('./controllers/authController');
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);

// Apply authentication middleware for all routes below
const { authenticateToken } = require('./controllers/authController');
app.use(authenticateToken);

// --- Example: Protect a sensitive endpoint ---
app.get('/api/protected', (req, res) => {
  res.json({ success: true, message: 'You are authenticated!', user: req.user });
});

// --- Protect admin endpoints (example) ---
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, error: 'Admin access required' });
}
// Example usage:
// app.get('/api/admin/stats', authenticateToken, requireAdmin, ...handler...);

// Log errors with winston
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user || null
  });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;