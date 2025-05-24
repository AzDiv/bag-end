const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

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
    await pool.query(
      'INSERT INTO users (name, email, password, status, current_level, whatsapp) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, 'pending', 1, whatsapp || null]
    );
    res.json({ success: true });
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

module.exports = router;
