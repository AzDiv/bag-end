const pool = require('../models/db');

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
