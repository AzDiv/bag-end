const pool = require('../models/db');
const { validationResult } = require('express-validator');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    res.json(users); // Return array directly for test compatibility
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, referred_by, invite_code, pack_type, status, current_level, created_at, whatsapp FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { name, email, password, status, current_level, whatsapp } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (name, email, password, status, current_level, whatsapp) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, status || 'pending', current_level || 1, whatsapp || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { id } = req.params;
  const { name, email, password, status, current_level, whatsapp } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name=?, email=?, password=?, status=?, current_level=?, whatsapp=? WHERE id=?',
      [name, email, password, status, current_level, whatsapp, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserByInviteCode = async (req, res) => {
  const { inviteCode } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE invite_code = ? LIMIT 1',
      [inviteCode]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserWithGroups = async (req, res) => {
  const { id } = req.params;
  try {
    // Get user
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    if (userRows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userRows[0];

    // Get groups owned by user
    const [groups] = await pool.query('SELECT * FROM groups WHERE owner_id = ?', [id]);

    // For each group, count members and verified members
    const groupsWithCounts = await Promise.all(groups.map(async (group) => {
      // Count all members in this group (invites)
      const [membersCountRows] = await pool.query('SELECT COUNT(*) as count FROM invites WHERE group_id = ?', [group.id]);
      const members = membersCountRows[0]?.count || 0;
      // Count verified members: owner_confirmed = true AND user.status = "active"
      const [verifiedRows] = await pool.query(`
        SELECT COUNT(*) as count
        FROM invites i
        JOIN users u ON i.referred_user_id = u.id
        WHERE i.group_id = ? AND i.owner_confirmed = 1 AND u.status = 'active'
      `, [group.id]);
      const verified_members = verifiedRows[0]?.count || 0;
      return { ...group, members, verified_members };
    }));

    res.json({ ...user, groups: groupsWithCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, referred_by, invite_code, pack_type, status, current_level, created_at, whatsapp FROM users WHERE status = 'pending' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !['pending', 'active', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status' });
  }
  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    // Optionally: call createGroupIfNeeded if status === 'active'
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update only pack_type (plan selection)
exports.updateUserPlan = async (req, res) => {
  const { id } = req.params;
  // Accept both 'packType' and 'pack_type' from frontend
  const pack_type = req.body.pack_type || req.body.packType;
  if (!['starter', 'gold'].includes(pack_type)) {
    return res.status(400).json({ success: false, error: 'Invalid pack_type' });
  }
  try {
    await pool.query('UPDATE users SET pack_type = ? WHERE id = ?', [pack_type, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Partial user profile update (PATCH)
exports.patchUserProfile = async (req, res) => {
  const { id } = req.params;
  const allowedFields = ['name', 'email', 'whatsapp'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: 'No valid fields to update' });
  }
  try {
    const setClause = Object.keys(updates).map(f => `${f} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get current authenticated user (for /users/me)
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    const [rows] = await pool.query(
      'SELECT id, name, email, role, referred_by, invite_code, pack_type, status, current_level, created_at, whatsapp FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
