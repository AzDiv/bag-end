// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET;

// Login handler
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Missing email or password' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token, user: { ...user, password: undefined } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Registration handler with invite logic
async function register(req, res) {
  const { name, email, password, inviteCode, whatsapp } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    let groupId = null;
    let inviterId = null;
    let groupCodeUsed = null;
    // If inviteCode is provided, validate it and check group size
    if (inviteCode) {
      const [[group]] = await pool.query('SELECT id, owner_id, code, group_number FROM groups WHERE code = ?', [inviteCode]);
      if (!group) {
        return res.status(400).json({ success: false, error: 'Invalid invite code.' });
      }
      if (group.group_number !== 1) {
        return res.status(400).json({ success: false, error: 'You can only join a level 1 group at registration.' });
      }
      groupId = group.id;
      inviterId = group.owner_id;
      groupCodeUsed = group.code;
      // Count non-rejected users in this group
      const [[{ count: groupUserCount }]] = await pool.query(
        "SELECT COUNT(*) as count FROM users WHERE invite_code = ? AND status != 'rejected'",
        [group.code]
      );
      if (groupUserCount >= 4) {
        return res.status(400).json({ success: false, error: 'This group is full. Please use another invite code.' });
      }
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, invite_code, referred_by, whatsapp, status, current_level, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, groupCodeUsed || null, inviterId, whatsapp || null, 'pending', 1, 'user']
    );
    const userId = result.insertId;
    // After user creation
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    // If registration used a valid invite code, insert invite row for this user
    if (groupId && inviterId) {
      await pool.query(
        'INSERT INTO invites (group_id, inviter_id, referred_user_id, owner_confirmed) VALUES (?, ?, ?, ?)',
        [groupId, inviterId, userId, 0]
      );
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ success: true, token, user: { ...user, password: undefined } });
  } catch (err) {
    // Enhanced error logging for debugging
    console.error('Registration error:', {
      code: err.code,
      message: err.message,
      stack: err.stack,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    // Duplicate email error
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('email')) {
      return res.status(400).json({ success: false, error: 'Email already exists.' });
    }
    // Duplicate invite error (for unique constraints on invites table)
    if (err.code === 'ER_DUP_ENTRY' && err.message.includes('invites')) {
      return res.status(400).json({ success: false, error: 'Invite already exists for this user and group.' });
    }
    // Duplicate primary key error (general)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, error: 'Duplicate entry detected.' });
    }
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

module.exports = {
  login,
  register,
  authenticateToken
};