const pool = require('../models/db');
const userController = require('./userController');

exports.getAllInvites = async (req, res) => {
  try {
    const [invites] = await pool.query('SELECT * FROM invites');
    res.json(invites); // Return array directly
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getInviteById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM invites WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Invite not found' });
    res.json({ success: true, invite: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createInvite = async (req, res) => {
  const { group_id, inviter_id, referred_user_id, owner_confirmed } = req.body;
  if (!group_id || !inviter_id || !referred_user_id) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO invites (group_id, inviter_id, referred_user_id, owner_confirmed) VALUES (?, ?, ?, ?)',
      [group_id, inviter_id, referred_user_id, owner_confirmed || false]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateInvite = async (req, res) => {
  const { id } = req.params;
  const { group_id, inviter_id, referred_user_id, owner_confirmed } = req.body;
  try {
    await pool.query(
      'UPDATE invites SET group_id=?, inviter_id=?, referred_user_id=?, owner_confirmed=? WHERE id=?',
      [group_id, inviter_id, referred_user_id, owner_confirmed, id]
    );
    // If owner_confirmed is being set to 1, trigger group creation logic
    if (owner_confirmed === 1 || owner_confirmed === true || owner_confirmed === '1') {
      // If referred_user_id is not provided in body, fetch it from DB
      let referredUserId = referred_user_id;
      if (!referredUserId) {
        const [[invite]] = await pool.query('SELECT referred_user_id FROM invites WHERE id = ?', [id]);
        referredUserId = invite?.referred_user_id;
      }
      if (referredUserId) {
        await userController.createGroupIfNeeded(referredUserId);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteInvite = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM invites WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all groups where user is a member (via invites), but not owner
exports.getMemberGroups = async (req, res) => {
  let userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required' });
  }
  // Ensure userId is an integer for MySQL INT columns
  userId = parseInt(userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, error: 'Invalid userId' });
  }
  try {
    const [rows] = await pool.query(`
      SELECT g.id, g.code, g.group_number, g.owner_id
      FROM invites i
      JOIN groups g ON i.group_id = g.id
      WHERE i.referred_user_id = ? AND g.owner_id != ? AND i.owner_confirmed = 1
      GROUP BY g.id
    `, [userId, userId]);
    res.json({ success: true, groups: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
