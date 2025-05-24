const pool = require('../models/db');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ pendingVerifications }]] = await pool.query("SELECT COUNT(*) as pendingVerifications FROM users WHERE status = 'pending'");
    const [[{ activeUsers }]] = await pool.query("SELECT COUNT(*) as activeUsers FROM users WHERE status = 'active'");
    const [[{ totalGroups }]] = await pool.query('SELECT COUNT(*) as totalGroups FROM groups');
    res.json({ totalUsers, pendingVerifications, activeUsers, totalGroups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get recent admin logs (user verifications/rejections and group creations)
exports.getRecentAdminLogs = async (req, res) => {
  try {
    // User logs
    const [users] = await pool.query(
      `SELECT id, name, email, status, created_at FROM users WHERE status IN ('active','rejected') ORDER BY created_at DESC LIMIT 40`
    );
    const userLogs = users.map(u => ({
      timestamp: u.created_at,
      message: u.status === 'active'
        ? `User ${u.name || ''} (${u.email || ''}) was verified.`
        : `User ${u.name || ''} (${u.email || ''}) was rejected.`,
      level: u.status === 'active' ? 'info' : 'warning',
    }));
    // Group logs
    const [groups] = await pool.query(
      `SELECT id, code, group_number, created_at, owner_id FROM groups ORDER BY created_at DESC LIMIT 10`
    );
    const groupLogs = groups.map(g => ({
      timestamp: g.created_at,
      message: `Group #${g.group_number} (code: ${g.code}) was created.`,
      level: 'info',
    }));
    // Combine and sort
    const logs = [...userLogs, ...groupLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Find users missing next group (eligible for next group but don't have it)
exports.findUsersMissingNextGroup = async (req, res) => {
  try {
    // Get all active users
    const [users] = await pool.query("SELECT id, name, email, status FROM users WHERE status = 'active'");
    const eligibleUsers = [];
    for (const user of users) {
      // Get all groups for user
      const [groups] = await pool.query('SELECT * FROM groups WHERE owner_id = ? ORDER BY group_number ASC', [user.id]);
      if (!groups || groups.length === 0) continue;
      const lastGroup = groups[groups.length - 1];
      const nextGroupNumber = lastGroup.group_number + 1;
      if (groups.length >= 3) continue;
      if (groups.some(g => g.group_number === nextGroupNumber)) continue;
      // Count verified & owner_confirmed members in last group
      const [[verifiedRow]] = await pool.query(`
        SELECT COUNT(*) as count
        FROM invites i
        JOIN users u ON i.referred_user_id = u.id
        WHERE i.group_id = ? AND i.owner_confirmed = 1 AND u.status = 'active'
      `, [lastGroup.id]);
      if ((verifiedRow.count ?? 0) >= 4) {
        eligibleUsers.push({
          userId: user.id,
          name: user.name,
          email: user.email,
          lastGroupNumber: lastGroup.group_number,
          verifiedCount: verifiedRow.count
        });
      }
    }
    res.json(eligibleUsers);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
