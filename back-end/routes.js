const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken } = require('./middleware/auth');

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const JWT_SECRET = process.env.JWT_SECRET;

// Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password, whatsapp } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }
    // Insert user (password should be hashed in production)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, status, current_level, whatsapp) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, 'pending', 1, whatsapp || null]
    );
    // Fetch the new user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = users[0];
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    // Never return password
    delete user.password;
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Missing email or password' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    // In production, return a JWT token here
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all groups for a user
router.get('/groups/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [groups] = await pool.query('SELECT * FROM groups WHERE owner_id = ?', [userId]);
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a group
router.post('/groups', async (req, res) => {
  const { owner_id, code, group_number } = req.body;
  if (!owner_id || !code || !group_number) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO groups (owner_id, code, group_number) VALUES (?, ?, ?)',
      [owner_id, code, group_number]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Confirm group invite
router.post('/invites/confirm', async (req, res) => {
  const { invite_id } = req.body;
  if (!invite_id) {
    return res.status(400).json({ success: false, error: 'Missing invite_id' });
  }
  try {
    await pool.query('UPDATE invites SET owner_confirmed = 1 WHERE id = ?', [invite_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current user from JWT token
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = users[0];
    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Request password reset (no email, returns token)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email required' });
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(404).json({ success: false, error: 'User not found' });
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour
    await pool.query('UPDATE users SET reset_token=?, reset_token_expires=? WHERE email=?', [token, expires, email]);
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ success: false, error: 'Missing token or password' });
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE reset_token=? AND reset_token_expires > NOW()', [token]);
    if (!users.length) return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password=?, reset_token=NULL, reset_token_expires=NULL WHERE id=?', [hashed, users[0].id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
